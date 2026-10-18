/** Synthetic complete SQL/crypto only. No native observer, process or writer. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareCurrentSchematicNativeMetadata } from "../src/current-schematic-native-metadata.ts";
import { bindCurrentSchematicRenameSqlTimes, prepareCurrentSchematicRenameSql, verifyCurrentSchematicRenameSql } from "../src/current-schematic-rename-sql.ts";
import type { CurrentSchematicRenameSqlWitness } from "../src/current-schematic-rename-sql.ts";
import { HISTORY_TABLE, IDS, TIMES, applyEffect, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const ACTOR = { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic" }, CLIENT = "a".repeat(16), DOCUMENT_TIME = TIMES.document - 120_000;
const DESIRED = "Renamed SCH", ORIGINAL = "Source SCH", SHEET = "c".repeat(16);
const TARGET = { projectUuid: "1".repeat(64), branchUuid: IDS.branch, ownerUuid: IDS.actor, schematicUuid: IDS.target };
const WITNESS: CurrentSchematicRenameSqlWitness = { projectUuid: TARGET.projectUuid, branchUuid: IDS.branch, backendActorUuid: IDS.actor, client: CLIENT,
  documentClockMinMs: DOCUMENT_TIME - 500, documentClockMaxMs: DOCUMENT_TIME + 500, backendClockMinMs: TIMES.edit - 1100,
  backendClockMaxMs: TIMES.edit + 2900, backendLocalOffsetMinutes: 120 };
function record(identity: unknown, body?: unknown): string { return `${JSON.stringify(identity)}||${body === undefined ? "" : JSON.stringify(body)}`; }
function literal(value: string): string { return `'${value.replaceAll("'", "''")}'`; }
function header(uuid: string, docType = "SCH"): Record<string, unknown> {
  return { docType, client: "b".repeat(16), uuid, updateTime: 1, version: "1", editVersion: "3.0" };
}
function tree(title = ORIGINAL, documentTime = 1): string {
  return JSON.stringify({ boards: {}, schematics: { [IDS.target]: { uuid: IDS.target, name: title, board: "", source: "", version: String(documentTime), updateTime: documentTime } },
    sheets: { [SHEET]: { uuid: SHEET, title: "Unchanged child", schematic_uuid: IDS.target, docType: 1, zIndex: 0, source: "", version: "1", updateTime: 1 } },
    pcbs: {}, panels: {}, blockSymbols: {}, owner: { ...ACTOR, avatar: null } });
}
function appended(actor = ACTOR): string {
  return [record({ type: "EDIT_HEAD" }, { ...actor, updateTime: TIMES.edit }),
    record({ type: "DOCHEAD", ticket: 101 }, { docType: "SCH", client: CLIENT, uuid: IDS.target, updateTime: DOCUMENT_TIME, version: String(DOCUMENT_TIME), editVersion: "3.2.206" }),
    record({ type: "META", ticket: 101, id: "META" }, { title: DESIRED, source: "", board: "", zIndex: null })].join("|\n");
}
async function setup(options: Readonly<{ sql?: string; witness?: CurrentSchematicRenameSqlWitness }> = {}): Promise<{
  path: string; raw: string; input: Parameters<typeof prepareCurrentSchematicRenameSql>[0];
}> {
  const original = await fixture();
  const raw = [record({ type: "EDIT_HEAD" }, { ...ACTOR, updateTime: 1 }),
    record({ type: "DOCHEAD", ticket: 1 }, { ...header(IDS.target), user: { uuid: IDS.peer, nickname: "Old", username: "old-account", avatar: "" } }),
    record({ type: "META", ticket: 1, id: "META" }, { title: ORIGINAL, source: "", board: "", zIndex: null }),
    record({ type: "LINE", ticket: 90, id: "deleted" }, { x: 0 }), record({ type: "LINE", ticket: 100, id: "deleted" }),
    record({ type: "DOCHEAD", ticket: 2 }, header(IDS.peer, "SYMBOL")),
    record({ type: "META", ticket: 2, id: "META" }, { title: "Unchanged symbol", source: "", docType: 2 }),
    record({ type: "DOCHEAD", ticket: 3 }, header(SHEET, "SCH_PAGE")),
    record({ type: "META", ticket: 3, id: "META" }, { title: "Unchanged child", schematic: IDS.target, source: "", zIndex: 0 })].join("|\n");
  mutate(original.path, [`UPDATE projects SET uuid='${TARGET.projectUuid}'`, `UPDATE branches SET project_uuid='${TARGET.projectUuid}'`,
    `UPDATE project_images SET project_uuid='${TARGET.projectUuid}'`, `UPDATE project_structures SET project_uuid='${TARGET.projectUuid}',structure=${literal(tree())}`,
    `INSERT INTO project_structures(id,ticket,project_uuid,branch_uuid,structure) VALUES(2,50,'${TARGET.projectUuid}','${IDS.branch}',${literal(tree())}),
      (5,1000,'${TARGET.projectUuid}','${IDS.peer}','uninterpreted peer tree')`,
    `UPDATE history_data SET dataStr=${literal(encrypted(raw, IDS.oldHead, IDS.oldKey))} WHERE id=7`, ...(options.sql === undefined ? [] : [options.sql])].join(";"));
  const before = await inventory(original.path), metadata = await prepareCurrentSchematicNativeMetadata({ before, target: TARGET, desiredTitle: DESIRED });
  return { path: original.path, raw, input: { before, metadata, witness: options.witness ?? WITNESS } };
}
async function prepared(input: Awaited<ReturnType<typeof setup>>): Promise<{
  preparation: Awaited<ReturnType<typeof prepareCurrentSchematicRenameSql>>;
  plan: Awaited<ReturnType<typeof bindCurrentSchematicRenameSqlTimes>>;
}> {
  const preparation = await prepareCurrentSchematicRenameSql(input.input);
  return { preparation, plan: await bindCurrentSchematicRenameSqlTimes(preparation, { documentTime: DOCUMENT_TIME, backendTime: TIMES.edit }) };
}
function apply(input: Awaited<ReturnType<typeof setup>>, raw = appended()): void {
  applyEffect(input.path, raw);
  mutate(input.path, `UPDATE project_structures SET structure=${literal(tree(DESIRED, DOCUMENT_TIME))} WHERE branch_uuid='${IDS.branch}'`);
}
void test("SCH integrated preparation binds original metadata, reserves capacity and verifies all six SQL relations", async () => {
  const input = await setup(), original = JSON.stringify(input.input.before), { preparation, plan } = await prepared(input);
  assert.equal(preparation.metadataProjectionSha256, input.input.metadata.projectionSha256); assert.equal(preparation.desiredTitle, DESIRED);
  assert.equal(plan.expectedTicket, 101); assert.equal(plan.updatedStructureRows, 2); assert.equal(plan.originalDocumentCount, 3);
  assert.equal(plan.headEligibility, "locked"); assert.ok(preparation.maximumPlaintextBytes >= plan.maximumPlaintextBytes);
  assert.ok(Object.isFrozen(preparation)); assert.ok(Object.isFrozen(preparation.witness));
  apply(input); const after = await inventory(input.path), proof = await verifyCurrentSchematicRenameSql(plan, after);
  assert.equal(proof["exactLogicalSqlEffect"], true); assert.equal(proof["wholeRenameSqlEffectVerified"], true);
  assert.equal(proof["updatedStructureRows"], 2); assert.equal(proof["originalHistoryRowsPreserved"], 1); assert.equal(proof["originalHistoryChunksPreserved"], 1);
  assert.equal(proof["newHistoryId"], "6"); assert.equal(proof["newChunkId"], "12"); assert.equal(proof["afterSqlSha256"], after.logicalSha256);
  assert.equal(JSON.stringify(input.input.before), original);
  for (const key of ["executionAuthorized", "originalOwnerVerified", "nativeNamePolicyVerified", "producerBindingVerified", "actorProvenanceVerified",
    "clockProvenanceVerified", "schematicSubscriberCompletionVerified", "queueCompletionVerified", "generationClosureVerified", "persistentUploadReplayExcluded", "reopened"] as const) {
    assert.equal(preparation[key], false); assert.equal(plan[key], false); assert.equal(proof[key], false);
  }
});
void test("SCH integrated preparation rejects copied inputs and does not evaluate caller accessors", async () => {
  const input = await setup(), { preparation, plan } = await prepared(input); let accessed = false;
  const get = (): never => { accessed = true; throw new Error("unexpected getter"); };
  for (const changed of [{ before: structuredClone(input.input.before) }, { metadata: structuredClone(input.input.metadata) },
    { metadata: Object.defineProperty({ ...input.input.metadata }, "request", { get }) }]) {
    await assert.rejects(prepareCurrentSchematicRenameSql({ ...input.input, ...changed }), /original/u);
  }
  await assert.rejects(prepareCurrentSchematicRenameSql({ ...input.input, witness: Object.defineProperty({ ...WITNESS }, "client", { get }) }), /accessors/u);
  const extra = { ...input.input, extra: true }; await assert.rejects(prepareCurrentSchematicRenameSql(extra), /keys/u);
  await assert.rejects(bindCurrentSchematicRenameSqlTimes(structuredClone(preparation), { documentTime: DOCUMENT_TIME, backendTime: TIMES.edit }), /original/u);
  await assert.rejects(bindCurrentSchematicRenameSqlTimes(preparation, Object.defineProperty({ documentTime: DOCUMENT_TIME, backendTime: TIMES.edit }, "documentTime", { get })), /accessors/u);
  apply(input); const after = await inventory(input.path);
  await assert.rejects(verifyCurrentSchematicRenameSql(structuredClone(plan), after), /original prepared/u);
  await assert.rejects(verifyCurrentSchematicRenameSql(plan, structuredClone(after)), /original/u); assert.equal(accessed, false);
});
void test("SCH supplied witnesses remain bounded and cannot retarget or choose post-write intent", async () => {
  const input = await setup(), { preparation } = await prepared(input);
  for (const witness of [{ ...WITNESS, projectUuid: "f".repeat(64) }, { ...WITNESS, branchUuid: IDS.peer },
    { ...WITNESS, documentClockMinMs: 1 }, { ...WITNESS, backendClockMinMs: -0 },
    { ...WITNESS, backendClockMinMs: 253_402_300_800_000, backendClockMaxMs: 253_402_300_800_001 }]) {
    await assert.rejects(prepareCurrentSchematicRenameSql({ ...input.input, witness }));
  }
  for (const times of [{ documentTime: WITNESS.documentClockMaxMs + 1, backendTime: TIMES.edit },
    { documentTime: DOCUMENT_TIME, backendTime: WITNESS.backendClockMaxMs + 1 },
    { documentTime: DOCUMENT_TIME, backendTime: TIMES.edit, desiredTitle: "Different" }]) {
    await assert.rejects(bindCurrentSchematicRenameSqlTimes(preparation, times));
  }
});
void test("SCH supplied actor/client are comparison values and must match the actual appended bytes", async () => {
  const input = await setup(), plans: Awaited<ReturnType<typeof bindCurrentSchematicRenameSqlTimes>>[] = [];
  for (const witness of [{ ...WITNESS, client: "f".repeat(16) }, { ...WITNESS, backendActorUuid: IDS.peer }]) {
    const preparation = await prepareCurrentSchematicRenameSql({ ...input.input, witness });
    assert.equal(preparation.actorProvenanceVerified, false); assert.equal(preparation.producerBindingVerified, false);
    plans.push(await bindCurrentSchematicRenameSqlTimes(preparation, { documentTime: DOCUMENT_TIME, backendTime: TIMES.edit }));
  }
  apply(input); const after = await inventory(input.path);
  for (const plan of plans) { await assert.rejects(verifyCurrentSchematicRenameSql(plan, after), /chunk|capacity/u); }
});
void test("SCH comparator preserves historical user ciphertext and rejects extra/sheet/PCB fresh effects", async () => {
  const input = await setup(), { plan } = await prepared(input); apply(input);
  for (const raw of [appended().replace('"docType":"SCH"', '"docType":"SCH_PAGE"'), appended().replace('"docType":"SCH"', '"docType":"PCB"'),
    appended().replace('"zIndex":null', '"zIndex":null,"parent":""'), appended().replace(DESIRED, "Wrong title"),
    appended().replace('"editVersion":"3.2.206"', '"editVersion":"3.2.206","user":{}'), `${appended()}|\n${record({ type: "LINE", ticket: 101, id: "extra" }, { x: 1 })}`]) {
    mutate(input.path, `UPDATE history_data SET dataStr=${literal(encrypted(raw, IDS.newHead, IDS.newKey))} WHERE id=12`);
    await assert.rejects(verifyCurrentSchematicRenameSql(plan, await inventory(input.path)), /chunk|capacity/u);
  }
  const changedOldRaw = input.raw.replace("old-account", "changed-account"), freshRaw = appended();
  mutate(input.path, `UPDATE history_data SET dataStr=${literal(encrypted(freshRaw, IDS.newHead, IDS.newKey))} WHERE id=12`);
  mutate(input.path, `UPDATE history_data SET dataStr=${literal(encrypted(changedOldRaw, IDS.oldHead, IDS.oldKey))} WHERE id=7`);
  await assert.rejects(verifyCurrentSchematicRenameSql(plan, await inventory(input.path)), /history_data/u);
});
void test("SCH complete SQL comparison rejects child/peer, unrelated table, storage class and bookkeeping drift", async () => {
  for (const sql of [`UPDATE project_structures SET structure=replace(structure,'Unchanged child','Changed child') WHERE id=1`,
    "UPDATE project_structures SET structure='Changed peer' WHERE id=5", "UPDATE resources SET dataStr=CAST(dataStr AS BLOB)",
    "UPDATE users SET nickname='Changed'", "UPDATE projects SET ticket=101", "UPDATE sqlite_sequence SET seq=13 WHERE name='history_data'",
    `UPDATE branches SET history_uuid='${IDS.oldHead}' WHERE uuid='${IDS.branch}'`,
    `UPDATE "${HISTORY_TABLE}" SET num=1 WHERE id=6`, "PRAGMA user_version=1"]) {
    const input = await setup(), { plan } = await prepared(input); apply(input); mutate(input.path, sql);
    await assert.rejects(verifyCurrentSchematicRenameSql(plan, await inventory(input.path)), /delta|properties/u);
  }
});
void test("SCH SQL reserves lower-ticket structure update and new-head branches before any dispatch", async () => {
  for (const sql of ["UPDATE project_structures SET ticket=101 WHERE id=2", `UPDATE "${HISTORY_TABLE}" SET is_lock=0 WHERE id=5`]) {
    const input = await setup({ sql }); await assert.rejects(prepareCurrentSchematicRenameSql(input.input), /lower ticket|head age/u);
  }
  const agedHead = { createdAtLiteral: "2026-10-12 12:33:55", nativeParsedLocalMs: Date.parse("2026-10-12T10:33:55Z"), nativeTimezoneOffsetMinutes: -120 };
  const input = await setup({ sql: `UPDATE "${HISTORY_TABLE}" SET is_lock=0,created_at='${agedHead.createdAtLiteral}' WHERE id=5`, witness: { ...WITNESS, agedHead } });
  const { plan } = await prepared(input); assert.equal(plan.headEligibility, "aged-unlocked"); apply(input);
  const proof = await verifyCurrentSchematicRenameSql(plan, await inventory(input.path)); assert.equal(proof["exactLogicalSqlEffect"], true);
});
