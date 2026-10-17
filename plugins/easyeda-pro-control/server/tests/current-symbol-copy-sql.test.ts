/** Original completed readers over synthetic files only. No application state. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareCurrentSymbolCopyPlan } from "../src/current-symbol-copy-plan.ts";
import { completedCurrentSymbolCopySqlSource, prepareCurrentSymbolCopySqlPlan, verifyCurrentSymbolCopySqlEffect } from "../src/current-symbol-copy-sql.ts";
import type { CurrentSymbolSqlWitness } from "../src/symbol-sql-comparator.ts";
import { HISTORY_TABLE, IDS, TIMES, WITNESS, applyEffect, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const SOURCE = { projectUuid: IDS.project, branchUuid: IDS.branch, symbolUuid: IDS.target };
const CLIENT = "a".repeat(16), DESTINATION = "e".repeat(16);
const META = { title: "Source", description: "Preserve Ω", tags: ["tag"], docType: 2, source: "source-reference" };
const CURRENT: CurrentSymbolSqlWitness = { projectUuid: IDS.project, branchUuid: IDS.branch, backendActorUuid: IDS.actor,
  client: CLIENT, preDispatchMaxTicket: 100, documentClockMinMs: WITNESS.serverClockMinMs, documentClockMaxMs: WITNESS.serverClockMaxMs,
  backendClockMinMs: WITNESS.serverClockMinMs, backendClockMaxMs: WITNESS.serverClockMaxMs, backendLocalOffsetMinutes: WITNESS.serverLocalOffsetMinutes };
function row(type: string, ticket: number, id: string, body?: unknown): string {
  return `${JSON.stringify({ type, ticket, id })}||${body === undefined ? "" : JSON.stringify(body)}`;
}
function header(ticket: number, time: number, uuid: string): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "SYMBOL", client: CLIENT, uuid,
    updateTime: time, version: String(time), editVersion: "3.2.206" })}`;
}
function edit(time: number): string {
  return `{"type":"EDIT_HEAD"}||${JSON.stringify({ uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic", updateTime: time })}`;
}
const CANVAS = [row("PART", 3, "part", { title: "A" }), row("RECT", 4, "rect", { partId: "part", x: 0, y: 0 })];
const RAW = [edit(1), header(100, 100, IDS.target), row("META", 100, "META", META), ...CANVAS,
  header(2, 2, IDS.peer), row("META", 2, "META", { title: "Peer", description: "Keep", tags: [], docType: 2, source: "" })].join("|\n");
function append(second = TIMES.document + 1): string {
  return [edit(TIMES.edit), header(101, TIMES.document, DESTINATION), row("META", 101, "META", { ...META, title: "Source_1", source: "" }),
    header(102, second, DESTINATION), ...CANVAS].join("|\n");
}
async function baseline(extraSql = ""): Promise<Awaited<ReturnType<typeof fixture>>> {
  const original = await fixture();
  mutate(original.path, `UPDATE history_data SET dataStr='${encrypted(RAW, IDS.oldHead, IDS.oldKey)}' WHERE uuid='${IDS.oldHead}';${extraSql}`);
  return { path: original.path, before: await inventory(original.path) };
}
async function prepare(input: Awaited<ReturnType<typeof fixture>>, witness = CURRENT): Promise<Awaited<ReturnType<typeof prepareCurrentSymbolCopySqlPlan>>> {
  const copyPlan = await prepareCurrentSymbolCopyPlan(input.before, SOURCE);
  return prepareCurrentSymbolCopySqlPlan({ before: input.before, copyPlan, witness });
}
function complete(path: string, raw = append()): void {
  applyEffect(path, raw);
  mutate(path, `UPDATE project_structures SET ticket=102 WHERE branch_uuid='${IDS.branch}';
    INSERT INTO project_structures(ticket,project_uuid,branch_uuid,structure) SELECT ticket,project_uuid,branch_uuid,structure FROM project_structures WHERE branch_uuid='${IDS.branch}' LIMIT 1`);
}

void test("copy SQL freezes three allocations and verifies two structure posts with exact duplicate preservation", async () => {
  const input = await baseline(`INSERT INTO project_structures(ticket,project_uuid,branch_uuid,structure) SELECT ticket,project_uuid,branch_uuid,structure FROM project_structures;
    INSERT INTO project_structures(ticket,project_uuid,branch_uuid,structure) VALUES(99,'${IDS.project}','${IDS.start}','{"untouched":true}');
    UPDATE sqlite_sequence SET seq=9 WHERE name='project_structures'`);
  const plan = await prepare(input);
  assert.equal(plan.expectedTicket, 102); assert.equal(plan.metadataTicket, 101); assert.equal(plan.expectedStructureRequests, 2);
  assert.ok(plan.maximumPlaintextBytes >= Buffer.byteLength(append())); assert.ok(plan.maximumEncodedSqlBytes > 0); assert.ok(Object.isFrozen(plan));
  complete(input.path); const after = await inventory(input.path); const proof = await verifyCurrentSymbolCopySqlEffect(plan, after, { returnedUuid: DESTINATION });
  assert.equal(proof["exactLogicalSqlEffect"], true); assert.equal(proof["newHistoryId"], "6"); assert.equal(proof["newChunkId"], "12"); assert.equal(proof["newStructureId"], "10");
  for (const name of ["executionAuthorized", "producerBindingVerified", "nativeStructureProjectionVerified", "generationClosureVerified", "persistentUploadReplayExcluded", "reopened"]) { assert.equal(proof[name], false); }
  const source = completedCurrentSymbolCopySqlSource(plan, proof, after);
  assert.equal(source.copyPlan.source.symbolUuid, IDS.target); assert.equal(source.append.targetUuid, DESTINATION);
  assert.ok(Object.isFrozen(source)); assert.equal(completedCurrentSymbolCopySqlSource(plan, proof, after), source);
  assert.throws(() => completedCurrentSymbolCopySqlSource(plan, structuredClone(proof), after), /original/u);
  assert.throws(() => completedCurrentSymbolCopySqlSource(structuredClone(plan), proof, after), /original/u);
  assert.throws(() => completedCurrentSymbolCopySqlSource(plan, proof, structuredClone(after)), /original/u);
  const equivalentAfter = await inventory(input.path);
  assert.equal(equivalentAfter.logicalSha256, after.logicalSha256);
  assert.throws(() => completedCurrentSymbolCopySqlSource(plan, proof, equivalentAfter), /original/u);
  await assert.rejects(verifyCurrentSymbolCopySqlEffect(structuredClone(plan), after, { returnedUuid: DESTINATION }), /original/u);
  await assert.rejects(verifyCurrentSymbolCopySqlEffect(plan, structuredClone(after), { returnedUuid: DESTINATION }), /original/u);
});

void test("copy SQL accepts same-stream equal clocks without inventing an extra ticket", async () => {
  const input = await baseline(), plan = await prepare(input);
  complete(input.path, append(TIMES.document));
  const proof = await verifyCurrentSymbolCopySqlEffect(plan, await inventory(input.path), { returnedUuid: DESTINATION });
  assert.equal(proof["exactLogicalSqlEffect"], true);
});

void test("copy SQL must bind the original plan and completed baseline reader, not matching JSON", async () => {
  const input = await baseline(); const copyPlan = await prepareCurrentSymbolCopyPlan(input.before, SOURCE);
  await assert.rejects(prepareCurrentSymbolCopySqlPlan({ before: structuredClone(input.before), copyPlan, witness: CURRENT }), /original/u);
  await assert.rejects(prepareCurrentSymbolCopySqlPlan({ before: input.before, copyPlan: structuredClone(copyPlan), witness: CURRENT }), /original/u);
  for (const witness of [{ ...CURRENT, preDispatchMaxTicket: 99 }, { ...CURRENT, branchUuid: IDS.peer }, { ...CURRENT, extra: true },
    { ...CURRENT, backendClockMaxMs: CURRENT.backendClockMinMs - 1 }, { ...CURRENT, documentClockMaxMs: CURRENT.documentClockMinMs + 60_001 }]) {
    await assert.rejects(prepareCurrentSymbolCopySqlPlan({ before: input.before, copyPlan, witness }));
  }
  let invoked = false;
  const accessor = Object.defineProperty({ ...CURRENT }, "client", { get(): string { invoked = true; return CLIENT; } });
  await assert.rejects(prepareCurrentSymbolCopySqlPlan({ before: input.before, copyPlan, witness: accessor }), /accessors/u);
  assert.equal(invoked, false);
});

void test("copy SQL refuses exhausted history/data/structure allocations before any effect", async () => {
  for (const sql of ["UPDATE sqlite_sequence SET seq=9007199254740991 WHERE name='history_data'",
    "UPDATE sqlite_sequence SET seq=9007199254740991 WHERE name='project_structures'",
    `UPDATE "${HISTORY_TABLE}" SET id=9007199254740991 WHERE id=5`]) {
    const input = await baseline(sql); await assert.rejects(prepare(input), /capacity/u);
  }
});

void test("copy SQL refuses ambiguous baseline structure tickets, invalid trees and duplicate JSON keys", async () => {
  for (const sql of [`INSERT INTO project_structures(ticket,project_uuid,branch_uuid,structure) SELECT 99,project_uuid,branch_uuid,structure FROM project_structures`,
    "UPDATE project_structures SET structure='{}'", "UPDATE project_structures SET structure='invalid'",
    `UPDATE project_structures SET structure='{"boards":{},"boards":{},"schematics":{},"sheets":{},"pcbs":{},"panels":{},"blockSymbols":{},"owner":{}}'`]) {
    const input = await baseline(sql); await assert.rejects(prepare(input));
  }
});

void test("copy SQL requires the exact second structure insert and rejects extra posts or changed collateral rows", async () => {
  for (const sql of ["DELETE FROM project_structures WHERE id=2", "UPDATE project_structures SET ticket=101 WHERE id=1",
    "INSERT INTO project_structures(ticket,project_uuid,branch_uuid,structure) SELECT ticket,project_uuid,branch_uuid,structure FROM project_structures WHERE id=2",
    "UPDATE project_structures SET structure='{}' WHERE id=2", "UPDATE sqlite_sequence SET seq=3 WHERE name='project_structures'",
    "UPDATE resources SET dataStr='changed'", "UPDATE history_data SET updated_at='changed' WHERE id=7",
    `UPDATE "${HISTORY_TABLE}" SET parent=NULL WHERE id=6`, "UPDATE projects SET name='changed'", "CREATE INDEX extra_index ON projects(name)"]) {
    const input = await baseline(), plan = await prepare(input); complete(input.path); mutate(input.path, sql);
    await assert.rejects(verifyCurrentSymbolCopySqlEffect(plan, await inventory(input.path), { returnedUuid: DESTINATION }));
  }
});

void test("copy SQL binds returned UUID, exact raw actor/client/times and unchanged copied bodies", async () => {
  for (const transform of [(raw: string): string => raw.replace('"nickname":"Synthetic"', '"nickname":"Other"'),
    (raw: string): string => raw.replace(CLIENT, "b".repeat(16)), (raw: string): string => raw.replace('"x":0', '"x":1'),
    (raw: string): string => raw.replace(String(TIMES.edit), String(CURRENT.backendClockMaxMs + 1)),
    (raw: string): string => raw.replaceAll(String(TIMES.document), String(CURRENT.documentClockMinMs - 1)),
    (raw: string): string => raw.replace('"type":"DOCHEAD","ticket":101', '"ticket":101,"type":"DOCHEAD"'),
    (raw: string): string => `${raw}|\n${raw}`]) {
    const input = await baseline(), plan = await prepare(input); complete(input.path, transform(append()));
    await assert.rejects(verifyCurrentSymbolCopySqlEffect(plan, await inventory(input.path), { returnedUuid: DESTINATION }));
  }
  const input = await baseline(), plan = await prepare(input); complete(input.path);
  await assert.rejects(verifyCurrentSymbolCopySqlEffect(plan, await inventory(input.path), { returnedUuid: "f".repeat(16) }));
});

void test("copy SQL aged unlocked head captures independent backend age without widening document time", async () => {
  const input = await baseline(`UPDATE "${HISTORY_TABLE}" SET is_lock=0,created_at='2026-10-12 12:33:55' WHERE id=5`);
  const agedHead = { createdAtLiteral: "2026-10-12 12:33:55", nativeParsedLocalMs: Date.parse("2026-10-12T10:33:55Z"), nativeTimezoneOffsetMinutes: -120 };
  await assert.rejects(prepare(input), /age/u);
  const plan = await prepare(input, { ...CURRENT, agedHead }); assert.equal(plan.headEligibility, "aged-unlocked"); complete(input.path);
  const proof = await verifyCurrentSymbolCopySqlEffect(plan, await inventory(input.path), { returnedUuid: DESTINATION });
  assert.equal(proof["exactLogicalSqlEffect"], true);
});
