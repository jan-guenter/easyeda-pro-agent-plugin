/** Synthetic complete SQL only. Supplied source and writer-return data are not
 * a live footprint create, producer/clock provenance or saved-reopen proof. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareCurrentFootprintSourcePlan } from "../src/current-footprint-source-plan.ts";
import { prepareCurrentFootprintCopyV2Plan } from "../src/current-footprint-copy-v2-plan.ts";
import { completedCurrentFootprintCopyV2SqlSource, prepareCurrentFootprintCopyV2SqlPlan,
  verifyCurrentFootprintCopyV2SqlEffect } from "../src/current-footprint-copy-v2-sql.ts";
import type { CurrentFootprintCopyV2SqlWitness } from "../src/current-footprint-copy-v2-sql.ts";
import { HISTORY_TABLE, IDS, TIMES, WITNESS, applyEffect, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const SOURCE = { projectUuid: IDS.project, branchUuid: IDS.branch, footprintUuid: IDS.target };
const CLIENT = "a".repeat(16), DESTINATION = "e".repeat(16);
const ACTOR = { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic" };
const SOURCE_ACTOR = { ...ACTOR, avatar: "local:avatar" };
const META = { title: "Source", description: "Preserve Ω", tags: ["tag"], source: "source-reference" };
const CURRENT: CurrentFootprintCopyV2SqlWitness = { projectUuid: IDS.project, branchUuid: IDS.branch, backendActorUuid: IDS.actor,
  client: CLIENT, preDispatchMaxTicket: 100, documentClockMinMs: WITNESS.serverClockMinMs, documentClockMaxMs: WITNESS.serverClockMaxMs,
  backendClockMinMs: WITNESS.serverClockMinMs, backendClockMaxMs: WITNESS.serverClockMaxMs, backendLocalOffsetMinutes: WITNESS.serverLocalOffsetMinutes };
function row(type: string, ticket: number, id: string, body?: unknown, extras: object = {}): string {
  return `${JSON.stringify({ type, ticket, id, ...extras })}||${body === undefined ? "" : JSON.stringify(body)}`;
}
function header(ticket: number, time: number, uuid: string, editVersion = "3.2.209", actor = false): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "FOOTPRINT", client: CLIENT, uuid,
    updateTime: time, version: String(time), editVersion, ...(actor ? { user: SOURCE_ACTOR } : {}) })}`;
}
function edit(time: number): string { return `{"type":"EDIT_HEAD"}||${JSON.stringify({ ...ACTOR, updateTime: time })}`; }
const CANVAS = row("CANVAS", 3, "canvas", { originX: 0 });
const LAYER = row("LAYER", 4, '["LAYER",1]', { name: "top", future: { preserve: true } });
const PAD_BODY = '{"number":"1", "x":0, "unknown":[1,"Ω"]}';
const PAD = `${JSON.stringify({ type: "PAD", ticket: 90, id: "pad" })}||${PAD_BODY}`;
const TOMBSTONE = row("LINE", 92, "line");
const FILL = row("FILL", 91, "fill", { points: [0, 0, 10, 0, 10, 10] });
const ROWS = [row("META", 92, "META", META), CANVAS, LAYER, PAD, TOMBSTONE, FILL];
const RAW = [edit(1), header(20, 100, IDS.target, "3.2.198", true), row("META", 5, "META", META), CANVAS, LAYER,
  row("PAD", 10, "pad", { number: "old" }, { firstTicket: 7 }), row("LINE", 8, "line", { x: 0 }),
  header(100, 300, IDS.target, "3.2.198", true), PAD, TOMBSTONE, FILL,
  header(2, 2, IDS.peer), row("META", 2, "META", { title: "Peer", description: "Keep", tags: [], source: "" })].join("|\n");
const OBSERVED = [header(101, 300, IDS.target, "3.2.209", true), row("META", 92, "META", META),
  header(100, 300, IDS.target, "3.2.198", true), CANVAS, LAYER,
  `${JSON.stringify({ type: "PAD", ticket: 90, id: "pad", firstTicket: 7 })}||${PAD_BODY}`,
  row("LINE", 92, "line", undefined, { firstTicket: 8 }), FILL].join("|\n");
function append(): string {
  return [edit(TIMES.edit), header(101, TIMES.document, DESTINATION), row("META", 101, "META", { ...META, title: "Source_1", source: "" }),
    header(102, TIMES.document + 1, DESTINATION), ...ROWS].join("|\n");
}
async function baseline(extraSql = "", sourceRaw = RAW): Promise<Awaited<ReturnType<typeof fixture>>> {
  const original = await fixture();
  mutate(original.path, `UPDATE history_data SET dataStr='${encrypted(sourceRaw, IDS.oldHead, IDS.oldKey)}' WHERE uuid='${IDS.oldHead}';${extraSql}`);
  return { path: original.path, before: await inventory(original.path) };
}
async function prepare(input: Awaited<ReturnType<typeof fixture>>, witness = CURRENT, content = OBSERVED): Promise<Readonly<{
  copyPlan: Awaited<ReturnType<typeof prepareCurrentFootprintCopyV2Plan>>; sqlPlan: Awaited<ReturnType<typeof prepareCurrentFootprintCopyV2SqlPlan>>;
}>> {
  const sourcePlan = await prepareCurrentFootprintSourcePlan(input.before, SOURCE);
  const copyPlan = await prepareCurrentFootprintCopyV2Plan(input.before, sourcePlan, { client: CLIENT, content });
  return { copyPlan, sqlPlan: await prepareCurrentFootprintCopyV2SqlPlan({ before: input.before, copyPlan, witness }) };
}
function complete(path: string, raw = append()): void {
  applyEffect(path, raw);
  // The generic helper models a symbol structure update. Native FOOTPRINT
  // Upload excludes it, so this independent expected effect preserves it.
  mutate(path, `UPDATE project_structures SET ticket=100 WHERE branch_uuid='${IDS.branch}'`);
}

void test("footprint copy-v2 full SQL composes ordinary multi-fragment records and tombstones without writer authority", async () => {
  const input = await baseline(`INSERT INTO project_structures(ticket,project_uuid,branch_uuid,structure) SELECT 100,project_uuid,branch_uuid,'{"stale":true}' FROM project_structures;
    UPDATE sqlite_sequence SET seq=9007199254740991 WHERE name='project_structures'`);
  const { copyPlan, sqlPlan } = await prepare(input);
  assert.equal(copyPlan.canvasRecords, 5); assert.equal(sqlPlan.expectedStructureRequests, 0);
  assert.equal(sqlPlan.expectedTicket, 102); assert.equal(sqlPlan.metadataTicket, 101);
  assert.ok(sqlPlan.maximumPlaintextBytes >= Buffer.byteLength(append()));
  complete(input.path); const after = await inventory(input.path);
  const effect = await verifyCurrentFootprintCopyV2SqlEffect(sqlPlan, after, { returnedUuid: DESTINATION });
  assert.equal(effect["exactLogicalSqlEffect"], true); assert.equal(effect["structureRowsUnchanged"], true);
  assert.equal(effect["newHistoryId"], "6"); assert.equal(effect["newChunkId"], "12");
  for (const key of ["executionAuthorized", "producerBindingVerified", "completionProved", "generationClosureVerified", "persistentUploadReplayExcluded", "reopened"]) {
    assert.equal(effect[key], false);
  }
  assert.equal(completedCurrentFootprintCopyV2SqlSource(sqlPlan, effect, after).copyPlan, copyPlan);
  assert.throws(() => completedCurrentFootprintCopyV2SqlSource(sqlPlan, structuredClone(effect), after), /original/u);
  assert.throws(() => completedCurrentFootprintCopyV2SqlSource(sqlPlan, effect, structuredClone(after)), /original/u);
  assert.throws(() => completedCurrentFootprintCopyV2SqlSource(structuredClone(sqlPlan), effect, after), /original/u);
  await assert.rejects(verifyCurrentFootprintCopyV2SqlEffect(sqlPlan, structuredClone(after), { returnedUuid: DESTINATION }), /original/u);
});

void test("footprint copy-v2 full SQL rejects collateral structures, resources, schema and history changes", async () => {
  for (const sql of ["UPDATE project_structures SET ticket=102", "UPDATE project_structures SET structure='{}'",
    "INSERT INTO project_structures(ticket,project_uuid,branch_uuid,structure) SELECT ticket,project_uuid,branch_uuid,structure FROM project_structures",
    "UPDATE sqlite_sequence SET seq=2 WHERE name='project_structures'", "UPDATE resources SET dataStr='changed'",
    "UPDATE history_data SET updated_at='changed' WHERE id=7", `UPDATE "${HISTORY_TABLE}" SET parent=NULL WHERE id=6`,
    "UPDATE projects SET name='changed'", "CREATE INDEX extra_index ON projects(name)"]) {
    const input = await baseline(), { sqlPlan } = await prepare(input); complete(input.path); mutate(input.path, sql);
    await assert.rejects(verifyCurrentFootprintCopyV2SqlEffect(sqlPlan, await inventory(input.path), { returnedUuid: DESTINATION }));
  }
});

void test("footprint copy-v2 full SQL rejects altered body bytes, dropped tombstones, first tickets and mismatched headers", async () => {
  for (const raw of [append().replaceAll('"editVersion":"3.2.209"', '"editVersion":"3.2.206"'),
    append().replace('"nickname":"Synthetic"', '"nickname":"Other"'), append().replace(CLIENT, "b".repeat(16)),
    append().replace('"preserve":true', '"preserve":false'), append().replace(PAD_BODY, JSON.stringify(JSON.parse(PAD_BODY))),
    append().replace(`${TOMBSTONE}|\n`, ""),
    append().replace(PAD, row("PAD", 90, "pad", { number: "1", x: 0, unknown: [1, "Ω"] }, { firstTicket: 7 })),
    append().replace('"type":"DOCHEAD","ticket":101', '"ticket":101,"type":"DOCHEAD"'),
    append().replace(ROWS.join("|\n"), ROWS.toReversed().join("|\n"))]) {
    const input = await baseline(), { sqlPlan } = await prepare(input); complete(input.path, raw);
    await assert.rejects(verifyCurrentFootprintCopyV2SqlEffect(sqlPlan, await inventory(input.path), { returnedUuid: DESTINATION }));
  }
});

void test("footprint copy-v2 SQL binds the source client, original inventory and bounded data-only clock witness", async () => {
  const input = await baseline(), { copyPlan, sqlPlan } = await prepare(input);
  await assert.rejects(prepareCurrentFootprintCopyV2SqlPlan({ before: structuredClone(input.before), copyPlan, witness: CURRENT }), /original/u);
  await assert.rejects(prepareCurrentFootprintCopyV2SqlPlan({ before: input.before, copyPlan: structuredClone(copyPlan), witness: CURRENT }), /original/u);
  for (const witness of [{ ...CURRENT, preDispatchMaxTicket: 99 }, { ...CURRENT, client: "b".repeat(16) },
    { ...CURRENT, extra: true }, { ...CURRENT, backendActorUuid: `${IDS.actor}\n` },
    { ...CURRENT, documentClockMaxMs: CURRENT.documentClockMinMs + 60_001 }]) {
    await assert.rejects(prepareCurrentFootprintCopyV2SqlPlan({ before: input.before, copyPlan, witness }));
  }
  let invoked = false;
  const accessor = Object.defineProperty({ ...CURRENT }, "client", { get(): string { invoked = true; return CLIENT; } });
  await assert.rejects(prepareCurrentFootprintCopyV2SqlPlan({ before: input.before, copyPlan, witness: accessor }), /accessors/u);
  assert.equal(invoked, false);
  let calls = 0;
  const traps = {
    getPrototypeOf(): object { calls += 1; return Object.prototype; },
    ownKeys(): string[] { calls += 1; return []; },
    getOwnPropertyDescriptor(): PropertyDescriptor { calls += 1; return { value: "forged", configurable: true }; },
    get(): unknown { calls += 1; return undefined; },
  };
  const wrapper = { before: input.before, copyPlan, witness: CURRENT };
  await assert.rejects(prepareCurrentFootprintCopyV2SqlPlan(new Proxy(wrapper, traps)), /plain input/u);
  await assert.rejects(prepareCurrentFootprintCopyV2SqlPlan({ ...wrapper, witness: new Proxy(CURRENT, traps) }), /plain input/u);
  const scalarProxy = new Proxy({}, traps);
  for (const name of ["client", "documentClockMinMs"]) {
    const witness = Object.defineProperty({ ...CURRENT }, name, { value: scalarProxy });
    await assert.rejects(prepareCurrentFootprintCopyV2SqlPlan({ ...wrapper, witness }), /primitive witness fields/u);
  }
  const age = Object.defineProperty({ createdAtLiteral: "2026-10-12 12:33:55", nativeParsedLocalMs: 1, nativeTimezoneOffsetMinutes: -120 },
    "nativeParsedLocalMs", { value: scalarProxy });
  await assert.rejects(prepareCurrentFootprintCopyV2SqlPlan({ ...wrapper, witness: { ...CURRENT, agedHead: age } }), /primitive aged-head fields/u);
  const returned = Object.defineProperty({ returnedUuid: DESTINATION }, "returnedUuid", { value: scalarProxy });
  await assert.rejects(verifyCurrentFootprintCopyV2SqlEffect(sqlPlan, input.before, returned), /primitive returned UUID/u);
  assert.equal(calls, 0);
});

void test("footprint copy-v2 SQL reserves both exact saved-source maxima and refuses zero clock windows before copy", async () => {
  const input = await baseline(), { copyPlan, sqlPlan } = await prepare(input);
  assert.equal(sqlPlan.positiveDocumentClockWindow, true);
  const time = CURRENT.documentClockMaxMs;
  for (const [actor, limit] of [[ACTOR, sqlPlan.maximumSavedRawSourceBytes],
    [{ uuid: DESTINATION }, sqlPlan.maximumSavedCacheSourceBytes]] as const) {
    const head = (ticket: number): string => `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({
      docType: "FOOTPRINT", client: CLIENT, uuid: DESTINATION, updateTime: time, version: String(time), editVersion: "3.2.209", user: actor })}`;
    const source = [head(103), row("META", 101, "META", { ...META, title: "Source_1", source: "" }),
      head(102), CANVAS, LAYER, PAD, TOMBSTONE, FILL].join("|\n");
    assert.equal(limit, Buffer.byteLength(source)); assert.ok(limit <= 2_097_152);
  }
  await assert.rejects(prepareCurrentFootprintCopyV2SqlPlan({ before: input.before, copyPlan,
    witness: { ...CURRENT, documentClockMinMs: 0, documentClockMaxMs: 10 } }), /positive document clock window required before copy/u);
});

void test("footprint copy-v2 SQL rejects saved-getter growth beyond two MiB before any effect", async () => {
  const empty = JSON.stringify({ number: "1", payload: "" });
  const units = 2_097_152 - 1024 - Buffer.byteLength(OBSERVED.replace(PAD_BODY, empty));
  const padded = JSON.stringify({ number: "1", payload: "x".repeat(units) });
  const content = OBSERVED.replace(PAD_BODY, padded);
  assert.equal(Buffer.byteLength(content), 2_097_152 - 1024);
  // The source's recorded actor is short. The backend's independently captured
  // Actor names would add more than the remaining capacity in two fresh headers.
  const input = await baseline(`UPDATE users SET username='${"u".repeat(1024)}',nickname='${"n".repeat(1024)}'`, RAW.replace(PAD_BODY, padded));
  await assert.rejects(prepare(input, CURRENT, content), /saved getter byte capacity exceeded before copy/u);
});

void test("footprint copy-v2 SQL rejects escaped document and backend clock windows", async () => {
  for (const raw of [append().replace(String(TIMES.edit), String(CURRENT.backendClockMaxMs + 1)),
    append().replaceAll(String(TIMES.document), String(CURRENT.documentClockMinMs - 1))]) {
    const input = await baseline(), { sqlPlan } = await prepare(input); complete(input.path, raw);
    await assert.rejects(verifyCurrentFootprintCopyV2SqlEffect(sqlPlan, await inventory(input.path), { returnedUuid: DESTINATION }), /timestamp/u);
  }
});

void test("footprint copy-v2 SQL admits a supplied aged head and refuses exhausted history allocations", async () => {
  const input = await baseline(`UPDATE "${HISTORY_TABLE}" SET is_lock=0,created_at='2026-10-12 12:33:55' WHERE id=5`);
  await assert.rejects(prepare(input), /age/u);
  const agedHead = { createdAtLiteral: "2026-10-12 12:33:55", nativeParsedLocalMs: Date.parse("2026-10-12T10:33:55Z"), nativeTimezoneOffsetMinutes: -120 };
  const { sqlPlan } = await prepare(input, { ...CURRENT, agedHead }); complete(input.path);
  const effect = await verifyCurrentFootprintCopyV2SqlEffect(sqlPlan, await inventory(input.path), { returnedUuid: DESTINATION });
  assert.equal(effect["exactLogicalSqlEffect"], true);
  for (const sql of ["UPDATE sqlite_sequence SET seq=9007199254740991 WHERE name='history_data'", `UPDATE "${HISTORY_TABLE}" SET id=9007199254740991`]) {
    await assert.rejects(prepare(await baseline(sql)), /capacity/u);
  }
});
