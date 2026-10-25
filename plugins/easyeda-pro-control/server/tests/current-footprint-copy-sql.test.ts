/** Synthetic complete SQLite files only; no EasyEDA, profile or project access. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentFootprintCopySourceRows, expectedCurrentFootprintCopySource, prepareCurrentFootprintCopyAppendPlan,
  verifyCurrentFootprintCopyAppend, verifyCurrentFootprintCopySource } from "../src/current-footprint-copy-append.ts";
import { prepareCurrentFootprintCopyPlan } from "../src/current-footprint-copy-plan.ts";
import { completedCurrentFootprintCopySqlSource, prepareCurrentFootprintCopySqlPlan, verifyCurrentFootprintCopySqlEffect } from "../src/current-footprint-copy-sql.ts";
import type { CurrentFootprintCopySqlWitness } from "../src/current-footprint-copy-sql.ts";
import { HISTORY_TABLE, IDS, TIMES, WITNESS, applyEffect, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const SOURCE = { projectUuid: IDS.project, branchUuid: IDS.branch, footprintUuid: IDS.target };
const CLIENT = "a".repeat(16), DESTINATION = "e".repeat(16);
const ACTOR = { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic" };
const META = { title: "Source", description: "Preserve Ω", tags: ["tag"], source: "source-reference" };
const CURRENT: CurrentFootprintCopySqlWitness = { projectUuid: IDS.project, branchUuid: IDS.branch, backendActorUuid: IDS.actor,
  client: CLIENT, preDispatchMaxTicket: 100, documentClockMinMs: WITNESS.serverClockMinMs, documentClockMaxMs: WITNESS.serverClockMaxMs,
  backendClockMinMs: WITNESS.serverClockMinMs, backendClockMaxMs: WITNESS.serverClockMaxMs, backendLocalOffsetMinutes: WITNESS.serverLocalOffsetMinutes };
function row(type: string, ticket: number, id: string, body?: unknown): string {
  return `${JSON.stringify({ type, ticket, id })}||${body === undefined ? "" : JSON.stringify(body)}`;
}
function header(ticket: number, time: number, uuid: string, editVersion = "3.2.209", actor = false): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "FOOTPRINT", client: CLIENT, uuid,
    updateTime: time, version: String(time), editVersion, ...(actor ? { user: ACTOR } : {}) })}`;
}
function edit(time: number): string { return `{"type":"EDIT_HEAD"}||${JSON.stringify({ ...ACTOR, updateTime: time })}`; }
const CANVAS = [row("CANVAS", 3, "canvas", { originX: 0 }), row("PAD", 4, "pad", { number: "1", x: 0 }),
  row("LINE", 90, "line", { startX: 0, endX: 10 })];
const RAW = [edit(1), header(100, 100, IDS.target, "3.2.198", true), row("META", 40, "META", META), ...CANVAS,
  header(2, 2, IDS.peer), row("META", 2, "META", { title: "Peer", description: "Keep", tags: [], source: "" })].join("|\n");
function append(): string {
  return [edit(TIMES.edit), header(101, TIMES.document, DESTINATION), row("META", 101, "META", { ...META, title: "Source_1", source: "" }),
    header(102, TIMES.document + 1, DESTINATION), row("META", 90, "META", META), ...CANVAS].join("|\n");
}
async function baseline(raw = RAW, extraSql = ""): Promise<Awaited<ReturnType<typeof fixture>>> {
  const original = await fixture();
  mutate(original.path, `UPDATE history_data SET dataStr='${encrypted(raw, IDS.oldHead, IDS.oldKey)}' WHERE uuid='${IDS.oldHead}';${extraSql}`);
  return { path: original.path, before: await inventory(original.path) };
}
async function prepare(input: Awaited<ReturnType<typeof fixture>>, witness = CURRENT): Promise<Readonly<{
  appendPlan: Awaited<ReturnType<typeof prepareCurrentFootprintCopyAppendPlan>>; sqlPlan: Awaited<ReturnType<typeof prepareCurrentFootprintCopySqlPlan>>;
}>> {
  const copy = await prepareCurrentFootprintCopyPlan(input.before, SOURCE);
  const appendPlan = await prepareCurrentFootprintCopyAppendPlan(input.before, copy);
  return { appendPlan, sqlPlan: await prepareCurrentFootprintCopySqlPlan({ before: input.before, appendPlan, witness }) };
}
function complete(path: string, raw = append()): void {
  applyEffect(path, raw);
  // Generic synthetic history helper also models a metadata structure job.
  // FOOTPRINT has no such job in current WORKER; restore the original ticket.
  mutate(path, `UPDATE project_structures SET ticket=100 WHERE branch_uuid='${IDS.branch}'`);
}

void test("footprint GET_STR preserves both headers and actor, uses maximum atom ticket, and copies losing source META", async () => {
  const input = await baseline(), { appendPlan } = await prepare(input);
  const expected = [header(101, 100, IDS.target, "3.2.209", true), row("META", 90, "META", META),
    header(100, 100, IDS.target, "3.2.198", true), ...CANVAS].join("|\n");
  assert.equal(expectedCurrentFootprintCopySource(appendPlan, CLIENT, "before-create"), expected);
  const during = expected.replace('"ticket":101', '"ticket":102');
  assert.equal(expectedCurrentFootprintCopySource(appendPlan, CLIENT, "create-source"), during);
  assert.deepEqual(currentFootprintCopySourceRows(appendPlan), [row("META", 90, "META", META), ...CANVAS]);
  assert.equal(verifyCurrentFootprintCopySource(appendPlan, CLIENT, "create-source", during)["sourceGetterEquivalent"], true);
  assert.throws(() => verifyCurrentFootprintCopySource(appendPlan, CLIENT, "create-source", expected), /differs/u);
  assert.throws(() => expectedCurrentFootprintCopySource(structuredClone(appendPlan), CLIENT, "before-create"), /original/u);
  assert.equal(verifyCurrentFootprintCopyAppend(appendPlan, DESTINATION, append()).rawAppendRecordsVerified, true);
  for (const raw of [append().replace(row("META", 90, "META", META), row("META", 40, "META", META)),
    append().replace(row("META", 90, "META", META), ""), append().replace(CANVAS.join("|\n"), CANVAS.toReversed().join("|\n"))]) {
    assert.throws(() => verifyCurrentFootprintCopyAppend(appendPlan, DESTINATION, raw), /differs|count/u);
  }
});

void test("footprint full SQL preserves all structure rows, sequence state and collateral cells", async () => {
  const input = await baseline(RAW, `INSERT INTO project_structures(ticket,project_uuid,branch_uuid,structure) SELECT 100,project_uuid,branch_uuid,'{"stale":true}' FROM project_structures;
    UPDATE sqlite_sequence SET seq=9007199254740991 WHERE name='project_structures'`);
  const { appendPlan, sqlPlan } = await prepare(input);
  assert.equal(sqlPlan.expectedStructureRequests, 0); assert.equal(sqlPlan.expectedTicket, 102); assert.equal(sqlPlan.metadataTicket, 101);
  assert.ok(sqlPlan.maximumPlaintextBytes >= Buffer.byteLength(append()));
  complete(input.path); const after = await inventory(input.path), effect = await verifyCurrentFootprintCopySqlEffect(sqlPlan, after, { returnedUuid: DESTINATION });
  assert.equal(effect["exactLogicalSqlEffect"], true); assert.equal(effect["structureRowsUnchanged"], true);
  assert.equal(effect["newHistoryId"], "6"); assert.equal(effect["newChunkId"], "12");
  for (const key of ["executionAuthorized", "producerBindingVerified", "generationClosureVerified", "persistentUploadReplayExcluded", "reopened"]) {
    assert.equal(effect[key], false);
  }
  assert.equal(completedCurrentFootprintCopySqlSource(sqlPlan, effect, after).appendPlan, appendPlan);
  assert.throws(() => completedCurrentFootprintCopySqlSource(sqlPlan, structuredClone(effect), after), /original/u);
  assert.throws(() => completedCurrentFootprintCopySqlSource(sqlPlan, effect, structuredClone(after)), /original/u);
  assert.throws(() => completedCurrentFootprintCopySqlSource(structuredClone(sqlPlan), effect, after), /original/u);
  await assert.rejects(verifyCurrentFootprintCopySqlEffect(sqlPlan, structuredClone(after), { returnedUuid: DESTINATION }), /original/u);
});

void test("footprint native hex and non-index numeric-looking IDs preserve exact getter, append and SQL order", async () => {
  for (const [pad, line] of [["0a123456789bcdef", "9b123456789abcde"], ["4294967295", "4294967296"],
    ["01", "00"], ["1234567890123456", "0000000000000000"]] as const) {
    const renamed = (value: string): string => value.replaceAll('"id":"pad"', `"id":"${pad}"`).replaceAll('"id":"line"', `"id":"${line}"`);
    const input = await baseline(renamed(RAW)), { appendPlan, sqlPlan } = await prepare(input);
    const canvas = CANVAS.map(value => renamed(value));
    const ordered = Object.fromEntries(["META", "canvas", pad, line].map(id => [id, true]));
    assert.deepEqual(Object.keys(ordered), ["META", "canvas", pad, line]);
    assert.deepEqual(currentFootprintCopySourceRows(appendPlan), [row("META", 90, "META", META), ...canvas]);
    assert.equal(expectedCurrentFootprintCopySource(appendPlan, CLIENT, "create-source"),
      [header(102, 100, IDS.target, "3.2.209", true), row("META", 90, "META", META),
        header(100, 100, IDS.target, "3.2.198", true), ...canvas].join("|\n"));
    const appended = renamed(append()); assert.equal(verifyCurrentFootprintCopyAppend(appendPlan, DESTINATION, appended).rawAppendRecordsVerified, true);
    assert.throws(() => verifyCurrentFootprintCopyAppend(appendPlan, DESTINATION,
      appended.replace(canvas.join("|\n"), canvas.toReversed().join("|\n"))), /differs/u);
    complete(input.path, appended);
    const effect = await verifyCurrentFootprintCopySqlEffect(sqlPlan, await inventory(input.path), { returnedUuid: DESTINATION });
    assert.equal(effect["exactLogicalSqlEffect"], true); assert.equal(effect["executionAuthorized"], false);
  }
});

void test("footprint atom IDs still refuse array-index boundaries, prototype keys and unsupported spellings", async () => {
  for (const id of ["0", "1", "4294967294", "prototype", "constructor", "__proto__", "-1", "1.5", `1${"a".repeat(256)}`]) {
    const input = await baseline(RAW.replace('"id":"pad"', `"id":"${id}"`));
    const copy = await prepareCurrentFootprintCopyPlan(input.before, SOURCE);
    await assert.rejects(prepareCurrentFootprintCopyAppendPlan(input.before, copy), /ordinary non-array-index/u);
  }
});

void test("footprint source refuses uncertain cache ordering, duplicate IDs, NET normalization and implicit actors", async () => {
  for (const raw of [RAW.replace(`,"user":${JSON.stringify(ACTOR)}`, ""),
    RAW.replace(CANVAS[0] ?? "", `${header(100, 100, IDS.target, "3.2.198", true)}|\n${CANVAS[0]}`),
    RAW.replace(CANVAS[1] ?? "", `${CANVAS[1]}|\n${CANVAS[1]}`), RAW.replace('"id":"pad"', '"id":"2"'),
    RAW.replace('"id":"pad"', '"id":"__proto__"'), RAW.replace('"type":"PAD"', '"type":"NET"')]) {
    const input = await baseline(raw); const copy = await prepareCurrentFootprintCopyPlan(input.before, SOURCE);
    await assert.rejects(prepareCurrentFootprintCopyAppendPlan(input.before, copy), /field set|fragment|unique|projection/u);
  }
});

void test("footprint full SQL rejects symbol-style structure effects and unrelated changes", async () => {
  for (const sql of ["UPDATE project_structures SET ticket=102", "UPDATE project_structures SET structure='{}'",
    "INSERT INTO project_structures(ticket,project_uuid,branch_uuid,structure) SELECT ticket,project_uuid,branch_uuid,structure FROM project_structures",
    "UPDATE sqlite_sequence SET seq=2 WHERE name='project_structures'", "UPDATE resources SET dataStr='changed'",
    "UPDATE history_data SET updated_at='changed' WHERE id=7", `UPDATE "${HISTORY_TABLE}" SET parent=NULL WHERE id=6`,
    "UPDATE projects SET name='changed'", "CREATE INDEX extra_index ON projects(name)"]) {
    const input = await baseline(), { sqlPlan } = await prepare(input); complete(input.path); mutate(input.path, sql);
    await assert.rejects(verifyCurrentFootprintCopySqlEffect(sqlPlan, await inventory(input.path), { returnedUuid: DESTINATION }));
  }
});

void test("footprint full SQL requires current editor version, exact clocks, actors and canvas", async () => {
  for (const raw of [append().replaceAll('"editVersion":"3.2.209"', '"editVersion":"3.2.206"'),
    append().replace('"nickname":"Synthetic"', '"nickname":"Other"'), append().replace(CLIENT, "b".repeat(16)),
    append().replace('"endX":10', '"endX":11'), append().replace(String(TIMES.edit), String(CURRENT.backendClockMaxMs + 1)),
    append().replaceAll(String(TIMES.document), String(CURRENT.documentClockMinMs - 1)),
    append().replace('"type":"DOCHEAD","ticket":101', '"ticket":101,"type":"DOCHEAD"')]) {
    const input = await baseline(), { sqlPlan } = await prepare(input); complete(input.path, raw);
    await assert.rejects(verifyCurrentFootprintCopySqlEffect(sqlPlan, await inventory(input.path), { returnedUuid: DESTINATION }));
  }
});

void test("footprint SQL retains original readers and bounded supplied clocks without invoking accessors", async () => {
  const input = await baseline(), { appendPlan } = await prepare(input);
  await assert.rejects(prepareCurrentFootprintCopySqlPlan({ before: structuredClone(input.before), appendPlan, witness: CURRENT }), /original/u);
  await assert.rejects(prepareCurrentFootprintCopySqlPlan({ before: input.before, appendPlan: structuredClone(appendPlan), witness: CURRENT }), /original/u);
  for (const witness of [{ ...CURRENT, preDispatchMaxTicket: 99 }, { ...CURRENT, extra: true },
    { ...CURRENT, documentClockMaxMs: CURRENT.documentClockMinMs + 60_001 }]) {
    await assert.rejects(prepareCurrentFootprintCopySqlPlan({ before: input.before, appendPlan, witness }));
  }
  let invoked = false;
  const accessor = Object.defineProperty({ ...CURRENT }, "client", { get(): string { invoked = true; return CLIENT; } });
  await assert.rejects(prepareCurrentFootprintCopySqlPlan({ before: input.before, appendPlan, witness: accessor }), /accessors/u);
  assert.equal(invoked, false);
});

void test("footprint SQL admits a separately aged head, and refuses exhausted history allocations", async () => {
  const input = await baseline(RAW, `UPDATE "${HISTORY_TABLE}" SET is_lock=0,created_at='2026-10-12 12:33:55' WHERE id=5`);
  await assert.rejects(prepare(input), /age/u);
  const agedHead = { createdAtLiteral: "2026-10-12 12:33:55", nativeParsedLocalMs: Date.parse("2026-10-12T10:33:55Z"), nativeTimezoneOffsetMinutes: -120 };
  const { sqlPlan } = await prepare(input, { ...CURRENT, agedHead }); complete(input.path);
  const effect = await verifyCurrentFootprintCopySqlEffect(sqlPlan, await inventory(input.path), { returnedUuid: DESTINATION });
  assert.equal(effect["exactLogicalSqlEffect"], true);
  for (const sql of ["UPDATE sqlite_sequence SET seq=9007199254740991 WHERE name='history_data'", `UPDATE "${HISTORY_TABLE}" SET id=9007199254740991`]) {
    await assert.rejects(prepare(await baseline(RAW, sql)), /capacity/u);
  }
});
