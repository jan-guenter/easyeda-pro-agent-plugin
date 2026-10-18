/** Synthetic SQLite/crypto only. Never an editor or native mutation fixture. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareCurrentPcbRenameHistory } from "../src/current-pcb-rename-history.ts";
import { prepareCurrentPcbRenameSql, verifyCurrentPcbRenameSql } from "../src/current-pcb-rename-sql.ts";
import type { CurrentPcbRenameSqlWitness } from "../src/current-pcb-rename-sql.ts";
import { prepareCurrentPcbRenameStructure } from "../src/current-pcb-rename-structure.ts";
import { decodeNativeHistoryChunk } from "../src/native-history.ts";
import { HISTORY_TABLE, IDS, TIMES, WITNESS, applyEffect, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const DOCUMENT_TIME = TIMES.document - 120_000, TITLE = "Original PCB Ω";
const BEFORE_META = JSON.stringify({ title: TITLE, parent: "", source: "", board: "", zIndex: null });
const DESIRED = "Renamed PCB Ω";
const CURRENT_WITNESS: CurrentPcbRenameSqlWitness = Object.freeze({ projectUuid: IDS.project, branchUuid: IDS.branch, backendActorUuid: IDS.actor,
  client: WITNESS.client, documentClockMinMs: DOCUMENT_TIME - 500, documentClockMaxMs: DOCUMENT_TIME + 500,
  backendClockMinMs: WITNESS.serverClockMinMs, backendClockMaxMs: WITNESS.serverClockMaxMs, backendLocalOffsetMinutes: 120 });
function structure(): string {
  return JSON.stringify({ boards: {}, schematics: {}, sheets: {}, pcbs: {
    [IDS.target]: { uuid: IDS.target, title: TITLE, board: "", parent_uuid: "", source: "", version: "1", updateTime: 1 },
  }, panels: {}, blockSymbols: {}, owner: { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic", avatar: null } });
}
function historyProjection(overrides: Readonly<Record<string, unknown>> = {}): ReturnType<typeof prepareCurrentPcbRenameHistory> {
  return prepareCurrentPcbRenameHistory({ targetUuid: IDS.target, beforeMetaText: BEFORE_META, desiredTitle: DESIRED, maximumTargetHeaderTime: 1,
    client: WITNESS.client, maximumTicket: 100, documentTime: DOCUMENT_TIME, backendTime: TIMES.edit,
    documentClock: { minimumMs: CURRENT_WITNESS.documentClockMinMs, maximumMs: CURRENT_WITNESS.documentClockMaxMs },
    backendClock: { minimumMs: CURRENT_WITNESS.backendClockMinMs, maximumMs: CURRENT_WITNESS.backendClockMaxMs },
    backendActor: { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic" }, ...overrides });
}
function structureProjection(overrides: Readonly<Record<string, unknown>> = {}): ReturnType<typeof prepareCurrentPcbRenameStructure> {
  return prepareCurrentPcbRenameStructure({ structureText: structure(), targetUuid: IDS.target, expectedOwnerUuid: IDS.actor,
    expectedBefore: { title: TITLE, version: "1", updateTime: 1 }, desiredTitle: DESIRED, documentTime: DOCUMENT_TIME, ...overrides });
}
function literal(value: string): string { return `'${value.replaceAll("'", "''")}'`; }
function oldRaw(before: Awaited<ReturnType<typeof inventory>>): Promise<string> {
  const owner = before.tables.find((entry) => entry.name === "history_data"); assert.ok(owner);
  const value = owner.rows[0]?.cells[owner.columns.findIndex((column) => column["name"] === "dataStr")]; assert.equal(value?.kind, "text"); assert.ok(value?.kind === "text");
  return decodeNativeHistoryChunk({ historyUuid: IDS.oldHead, keyHex: IDS.oldKey, dataBase64: Buffer.from(value.hex, "hex").toString("utf8") });
}
function setRaw(path: string, raw: string): void { mutate(path, `UPDATE history_data SET dataStr=${literal(encrypted(raw, IDS.oldHead, IDS.oldKey))} WHERE id=7`); }
async function setup(): Promise<{ path: string; raw: string; request: Parameters<typeof prepareCurrentPcbRenameSql>[0] }> {
  const created = await fixture(), originalRaw = await oldRaw(created.before), records = originalRaw.split("|\n");
  records[1] = `{"type":"DOCHEAD","ticket":1}||${JSON.stringify({ docType: "PCB", client: "b".repeat(16), uuid: IDS.target, updateTime: 1, version: "1", editVersion: "3.0" })}`;
  records[2] = `{"type":"META","ticket":1,"id":"META"}||${BEFORE_META}`;
  const raw = records.join("|\n"); setRaw(created.path, raw);
  mutate(created.path, `UPDATE project_structures SET structure=${literal(structure())};
    INSERT INTO project_structures(id,ticket,project_uuid,branch_uuid,structure) VALUES
      (2,50,'${IDS.project}','${IDS.branch}',${literal(structure())}),
      (5,1000,'${IDS.project}','${IDS.peer}','uninterpreted peer tree');`);
  return { path: created.path, raw, request: { before: await inventory(created.path), historyProjection: historyProjection(),
    structureProjection: structureProjection(), witness: CURRENT_WITNESS } };
}
function apply(input: Awaited<ReturnType<typeof setup>>, raw = input.request.historyProjection.chunkText): void {
  applyEffect(input.path, raw);
  mutate(input.path, `UPDATE project_structures SET structure=${literal(input.request.structureProjection.afterStructureText)} WHERE branch_uuid='${IDS.branch}'`);
}
function replaceNewChunk(path: string, raw: string): void {
  mutate(path, `UPDATE history_data SET dataStr=${literal(encrypted(raw, IDS.newHead, IDS.newKey))} WHERE id=12`);
}

void test("combined PCB rename proves all six SQL relations and preserves duplicate structures and full history", async () => {
  const input = await setup(), original = JSON.stringify(input.request.before), plan = await prepareCurrentPcbRenameSql(input.request);
  assert.equal(plan.expectedTicket, 101); assert.equal(plan.updatedStructureRows, 2); assert.equal(plan.originalDocumentCount, 2);
  assert.equal(plan.originalHistoryRows, 1); assert.equal(plan.originalHistoryChunks, 1); assert.equal(plan.headEligibility, "locked");
  assert.equal(plan.maximumPlaintextBytes, Buffer.byteLength(input.request.historyProjection.chunkText));
  assert.ok(plan.maximumCiphertextBase64Bytes > plan.maximumPlaintextBytes); assert.ok(Object.isFrozen(plan));
  apply(input); const after = await inventory(input.path), proof = await verifyCurrentPcbRenameSql(plan, after);
  assert.equal(proof["exactLogicalSqlEffect"], true); assert.equal(proof["wholeRenameSqlEffectVerified"], true);
  assert.equal(proof["updatedStructureRows"], 2); assert.equal(proof["originalHistoryRowsPreserved"], 1); assert.equal(proof["originalHistoryChunksPreserved"], 1);
  assert.equal(proof["newHistoryId"], "6"); assert.equal(proof["newChunkId"], "12"); assert.equal(proof["afterSqlSha256"], after.logicalSha256);
  assert.equal(JSON.stringify(input.request.before), original); assert.ok(Object.isFrozen(proof));
  for (const key of ["executionAuthorized", "producerBindingVerified", "actorProvenanceVerified", "clockProvenanceVerified", "queueCompletionVerified",
    "generationClosureVerified", "persistentUploadReplayExcluded", "reopened"] as const) {
    assert.equal(plan[key], false); assert.equal(proof[key], false);
  }
});

void test("combined PCB rename binds original inventories and projections without consuming caller accessors", async () => {
  const input = await setup(), plan = await prepareCurrentPcbRenameSql(input.request);
  for (const changed of [{ before: structuredClone(input.request.before) }, { historyProjection: structuredClone(input.request.historyProjection) },
    { structureProjection: structuredClone(input.request.structureProjection) }]) {
    await assert.rejects(prepareCurrentPcbRenameSql({ ...input.request, ...changed }), /original/u);
  }
  let accessed = false;
  const fake = Object.defineProperty({ ...input.request.historyProjection }, "expectedTicket", { get(): number { accessed = true; return 101; } });
  await assert.rejects(prepareCurrentPcbRenameSql({ ...input.request, historyProjection: fake }), /original/u); assert.equal(accessed, false);
  const witness = Object.defineProperty({ ...CURRENT_WITNESS }, "backendClockMinMs", { get(): number { accessed = true; return 0; } });
  await assert.rejects(prepareCurrentPcbRenameSql({ ...input.request, witness }), /accessors/u); assert.equal(accessed, false);
  const unknown = { ...input.request, extra: true }; await assert.rejects(prepareCurrentPcbRenameSql(unknown), /keys/u);
  apply(input); const after = await inventory(input.path);
  await assert.rejects(verifyCurrentPcbRenameSql(structuredClone(plan), after), /original prepared/u);
  await assert.rejects(verifyCurrentPcbRenameSql(plan, structuredClone(after)), /original/u);
});

void test("combined PCB rename binds complete tickets, target META and tree/header/title clocks", async () => {
  const input = await setup();
  for (const changed of [
    { historyProjection: historyProjection({ maximumTicket: 101 }) },
    { historyProjection: historyProjection({ beforeMetaText: BEFORE_META.replace(TITLE, "Different") }) },
    { structureProjection: structureProjection({ desiredTitle: "Different" }) },
    { structureProjection: structureProjection({ documentTime: DOCUMENT_TIME + 1 }) },
    { historyProjection: historyProjection({ backendActor: { uuid: IDS.actor, username: "Wrong", nickname: "Synthetic" } }) },
    { witness: { ...CURRENT_WITNESS, client: "f".repeat(16) } },
  ]) { await assert.rejects(prepareCurrentPcbRenameSql({ ...input.request, ...changed }), /ticket|metadata|projection|clock|framing/u); }
  setRaw(input.path, input.raw.replace('"editVersion":"3.0"', '"editVersion":"3.0","unknown":true'));
  await assert.rejects(prepareCurrentPcbRenameSql({ ...input.request, before: await inventory(input.path) }), /unknown|Unrecognized/u);
});

void test("combined PCB rename inspects every raw target header, not only final materialized metadata", async () => {
  const input = await setup(), records = input.raw.split("|\n");
  records[1] = records[1]?.replace('"updateTime":1,"version":"1"', `"updateTime":${DOCUMENT_TIME + 1},"version":"${DOCUMENT_TIME + 1}"`) ?? "";
  records.splice(5, 0, `{"type":"DOCHEAD","ticket":90}||${JSON.stringify({ docType: "PCB", client: "b".repeat(16), uuid: IDS.target,
    updateTime: 1, version: "1", editVersion: "3.0" })}`);
  setRaw(input.path, records.join("|\n"));
  await assert.rejects(prepareCurrentPcbRenameSql({ ...input.request, before: await inventory(input.path) }), /every prior target header/u);
});

void test("combined PCB rename requires exact authenticated appended plaintext and intact old ciphertext", async () => {
  const input = await setup(), plan = await prepareCurrentPcbRenameSql(input.request); apply(input);
  const raw = input.request.historyProjection.chunkText;
  for (const altered of [raw.replace('"docType":"PCB"', '"docType":"SYMBOL"'), raw.replace(DESIRED, "Other title"),
    raw.replace('"ticket":101', '"ticket":102'), raw.replace('"zIndex":null', '"zIndex":0'), raw.replace('"editVersion":"3.2.206"', '"editVersion":"3.0"'),
    raw.replace(String(TIMES.edit), String(TIMES.edit + 1)), `${raw}|\n`, `${raw}|\n{"type":"LINE","ticket":101,"id":"bad"}||{}`,
  ]) {
    replaceNewChunk(input.path, altered);
    await assert.rejects(verifyCurrentPcbRenameSql(plan, await inventory(input.path)), /chunk|capacity/u);
  }
  replaceNewChunk(input.path, raw); setRaw(input.path, input.raw.replace("Keep peer", "Changed peer"));
  await assert.rejects(verifyCurrentPcbRenameSql(plan, await inventory(input.path)), /history_data/u);
});

void test("combined PCB rename preserves every other row, sequence, property and scalar storage class", async () => {
  for (const change of ["UPDATE resources SET dataStr=CAST(dataStr AS BLOB)", "UPDATE project_structures SET ticket=50 WHERE id=2",
    "UPDATE project_structures SET structure='changed peer' WHERE id=5", "DELETE FROM project_structures WHERE id=2",
    "UPDATE sqlite_sequence SET seq=99 WHERE name='project_structures'", "UPDATE sqlite_sequence SET seq=13 WHERE name='history_data'",
    `UPDATE branches SET name='other' WHERE uuid='${IDS.start}'`, "UPDATE projects SET ticket=101", "UPDATE users SET nickname='Other'",
    "PRAGMA user_version=1", "CREATE TABLE unknown(value TEXT)",
  ]) {
    const input = await setup(), plan = await prepareCurrentPcbRenameSql(input.request); apply(input); mutate(input.path, change);
    await assert.rejects(verifyCurrentPcbRenameSql(plan, await inventory(input.path)), /delta|row|properties|schema/u);
  }
});

void test("combined PCB rename rejects wrong new-row allocation, defaults and actor/bookkeeping relationships", async () => {
  for (const change of [`UPDATE "${HISTORY_TABLE}" SET id=7 WHERE id=6`, "UPDATE history_data SET id=13 WHERE id=12",
    `UPDATE "${HISTORY_TABLE}" SET parent=NULL WHERE id=6`, `UPDATE "${HISTORY_TABLE}" SET num=1 WHERE id=6`,
    `UPDATE "${HISTORY_TABLE}" SET updated_at='2026-10-12 12:34:59' WHERE id=6`, "UPDATE history_data SET updated_at='2026-10-12 12:34:58' WHERE id=12",
    `UPDATE projects SET modifier_uuid='${IDS.peer}'`, `UPDATE branches SET history_uuid='${IDS.oldHead}' WHERE uuid='${IDS.branch}'`,
    `UPDATE "${HISTORY_TABLE}" SET uuid='${"a".repeat(32)}' WHERE id=6`,
  ]) {
    const input = await setup(), plan = await prepareCurrentPcbRenameSql(input.request); apply(input); mutate(input.path, change);
    await assert.rejects(verifyCurrentPcbRenameSql(plan, await inventory(input.path)), /allocated|delta|identity|UUID/u);
  }
});

void test("combined PCB rename keeps SQL/backend clocks separate and rejects unrepresentable calendar windows", async () => {
  const input = await setup();
  await assert.rejects(prepareCurrentPcbRenameSql({ ...input.request, witness: { ...CURRENT_WITNESS,
    backendClockMinMs: CURRENT_WITNESS.documentClockMinMs, backendClockMaxMs: CURRENT_WITNESS.documentClockMaxMs } }), /clock/u);
  for (const witness of [
    { ...CURRENT_WITNESS, backendClockMinMs: 253_402_300_800_000, backendClockMaxMs: 253_402_300_800_001 },
    { ...CURRENT_WITNESS, backendClockMinMs: 253_402_300_799_000, backendClockMaxMs: 253_402_300_799_999 },
    { ...CURRENT_WITNESS, backendClockMinMs: -0 }, { ...CURRENT_WITNESS, backendLocalOffsetMinutes: 841 },
  ]) { await assert.rejects(prepareCurrentPcbRenameSql({ ...input.request, witness })); }
  const plan = await prepareCurrentPcbRenameSql(input.request); apply(input);
  mutate(input.path, "UPDATE history_data SET created_at='2026-10-12 12:32:56',updated_at='2026-10-12 12:32:56' WHERE id=12");
  await assert.rejects(verifyCurrentPcbRenameSql(plan, await inventory(input.path)), /independent backend clock/u);
});

void test("combined PCB rename admits an independently bounded aged head and rejects insufficient age", async () => {
  const input = await setup();
  mutate(input.path, `UPDATE "${HISTORY_TABLE}" SET is_lock=0,created_at='2026-10-12 12:33:55' WHERE id=5`);
  const before = await inventory(input.path);
  const agedHead = { createdAtLiteral: "2026-10-12 12:33:55", nativeParsedLocalMs: Date.parse("2026-10-12T10:33:55Z"), nativeTimezoneOffsetMinutes: -120 };
  const witness = { ...CURRENT_WITNESS, agedHead };
  const plan = await prepareCurrentPcbRenameSql({ ...input.request, before, witness }); assert.equal(plan.headEligibility, "aged-unlocked");
  await assert.rejects(prepareCurrentPcbRenameSql({ ...input.request, before }), /head age/u);
  await assert.rejects(prepareCurrentPcbRenameSql({ ...input.request, before, witness: { ...witness, backendClockMinMs: witness.backendClockMinMs - 1 } }), /aged/u);
  apply(input); const proof = await verifyCurrentPcbRenameSql(plan, await inventory(input.path)); assert.equal(proof["exactLogicalSqlEffect"], true);
});

void test("combined PCB rename reserves one extra history row before the supported complete-chain limit", async () => {
  const input = await setup(); let previous = IDS.oldHead;
  const statements: string[] = [];
  for (let index = 1; index <= 63; index += 1) {
    const raw = `{"type":"EDIT_HEAD"}||{"uuid":"${IDS.actor}","username":"synthetic-user","nickname":"Synthetic","updateTime":1}`, uuid = index.toString(16).padStart(32, "0");
    statements.push(`INSERT INTO "${HISTORY_TABLE}"(id,uuid,parent,key,is_lock,num,snapshot_num) VALUES(${index + 5},'${uuid}','${previous}','${IDS.oldKey}',1,0,0)`,
      `INSERT INTO history_data(uuid,history_uuid,dataStr) VALUES('${uuid}','${uuid}',${literal(encrypted(raw, uuid, IDS.oldKey))})`); previous = uuid;
  }
  statements.push(`UPDATE branches SET history_uuid='${previous}' WHERE uuid='${IDS.branch}'`);
  mutate(input.path, statements.join(";"));
  await assert.rejects(prepareCurrentPcbRenameSql({ ...input.request, before: await inventory(input.path) }), /post-append complete-history capacity/u);
});
