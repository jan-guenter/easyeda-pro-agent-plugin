/** Synthetic SQLite/crypto comparisons. No EasyEDA or native Save execution. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { planCurrentPcbStringCreate } from "../src/current-pcb-string-create.ts";
import { planCurrentPcbStringCreateObservation } from "../src/current-pcb-string-create-observation.ts";
import { prepareCurrentPcbStringHistory } from "../src/current-pcb-string-history.ts";
import { planCurrentPcbStringPublication } from "../src/current-pcb-string-publication.ts";
import { prepareCurrentPcbStringSql, verifyCurrentPcbStringSql } from "../src/current-pcb-string-sql.ts";
import { decodeNativeHistoryChunk } from "../src/native-history.ts";
import { IDS, TIMES, WITNESS, applyEffect, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const client = WITNESS.client, primitive = "d".repeat(16), uniqueId = "synthetic-compiler-token";
const candidate = planCurrentPcbStringCreate({ x: 100, y: -200, text: "Saved String" });
const create = planCurrentPcbStringCreateObservation(candidate, { projectUuid: IDS.project, branchUuid: IDS.branch,
  documentUuid: IDS.target, tabId: `${IDS.target}@${IDS.project}` });
const publication = planCurrentPcbStringPublication(candidate, create, { primitiveId: primitive, client, uniqueId, maximumTicket: 100 });
const clocks = { minimumMs: WITNESS.serverClockMinMs, maximumMs: WITNESS.serverClockMaxMs };
const history = prepareCurrentPcbStringHistory(candidate, publication, { maximumTargetHeaderTime: 1,
  saveTime: TIMES.document, backendTime: TIMES.edit, saveClock: clocks, backendClock: clocks,
  workerUser: { uuid: IDS.actor, nickname: "UI nickname", username: "UI name", avatar: "" },
  backendActor: { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic" } });
const witness = { projectUuid: IDS.project, branchUuid: IDS.branch, backendClockMinMs: clocks.minimumMs,
  backendClockMaxMs: clocks.maximumMs, backendLocalOffsetMinutes: 120 };
function literal(value: string): string { return `'${value.replaceAll("'", "''")}'`; }
function structure(saved = false): string {
  return JSON.stringify({ boards: {}, schematics: {}, sheets: {}, pcbs: { [IDS.target]: {
    uuid: IDS.target, title: "Empty PCB", board: "", parent_uuid: "", source: "",
    version: saved ? String(TIMES.document) : "1", updateTime: saved ? TIMES.document : 1,
  } }, panels: {}, blockSymbols: {}, owner: { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic", avatar: null } });
}
async function setup(): Promise<{ path: string; before: Awaited<ReturnType<typeof inventory>>; raw: string }> {
  const base = await fixture(), owner = base.before.tables.find(entry => entry.name === "history_data");
  assert.ok(owner); const entry = owner.rows[0]?.cells[owner.columns.findIndex(column => column["name"] === "dataStr")];
  assert.ok(entry?.kind === "text");
  const raw = await decodeNativeHistoryChunk({ historyUuid: IDS.oldHead, keyHex: IDS.oldKey, dataBase64: Buffer.from(entry.hex, "hex").toString() });
  const rows = raw.split("|\n");
  rows[1] = `{"type":"DOCHEAD","ticket":1}||${JSON.stringify({ docType: "PCB", client: "b".repeat(16),
    uuid: IDS.target, updateTime: 1, version: "1", editVersion: "3.0" })}`;
  rows[2] = `{"type":"META","ticket":1,"id":"META"}||{"title":"Empty PCB","parent":"","source":"","board":"","zIndex":null}`;
  const changed = rows.join("|\n");
  mutate(base.path, `UPDATE history_data SET dataStr=${literal(encrypted(changed, IDS.oldHead, IDS.oldKey))} WHERE id=7;
    UPDATE project_structures SET structure=${literal(structure())};
    INSERT INTO project_structures(id,ticket,project_uuid,branch_uuid,structure) VALUES
      (2,50,'${IDS.project}','${IDS.branch}',${literal(structure())}),
      (5,1000,'${IDS.project}','${IDS.peer}','uninterpreted peer tree');`);
  return { path: base.path, before: await inventory(base.path), raw: changed };
}
function apply(path: string, raw = history.chunkText): void {
  applyEffect(path, raw);
  mutate(path, `UPDATE project_structures SET ticket=102,structure=${literal(structure(true))} WHERE branch_uuid='${IDS.branch}'`);
}
void test("String complete SQL models the new history, separate tickets, clock-only structures and all unchanged cells", async () => {
  const input = await setup(), plan = await prepareCurrentPcbStringSql({ before: input.before, history, witness });
  apply(input.path); const after = await inventory(input.path), proof = await verifyCurrentPcbStringSql(plan, after);
  assert.equal(proof["exactLogicalSqlEffect"], true); assert.equal(proof["supportedSingleUploadSqlEffectVerified"], true);
  assert.equal(proof["publicationTicket"], 101); assert.equal(proof["headTicket"], 102);
  assert.equal(proof["updatedStructureRows"], 2); assert.equal(proof["originalHistoryRowsPreserved"], 1);
  assert.equal(proof["originalHistoryChunksPreserved"], 1); assert.equal(proof["originalDocumentCount"], 2);
  for (const name of ["executionAuthorized", "originalSaveVerified", "uploadCountVerified", "producerBindingVerified",
    "generationClosureVerified", "persistentUploadReplayExcluded", "reopened"] as const) {
    assert.equal(plan[name], false); assert.equal(proof[name], false);
  }
  await assert.rejects(verifyCurrentPcbStringSql(structuredClone(plan), after), /original/u);
  await assert.rejects(verifyCurrentPcbStringSql(plan, structuredClone(after)), /original/u);
});
void test("String SQL preserves every original table/cell, including resources, actors, sequence and peer structures", async () => {
  for (const change of ["UPDATE resources SET dataStr=CAST(dataStr AS BLOB)", "UPDATE users SET nickname='Other'",
    "UPDATE project_structures SET structure='Other' WHERE id=5", "UPDATE projects SET ticket=102",
    "UPDATE sqlite_sequence SET seq=13 WHERE name='history_data'", "UPDATE project_structures SET ticket=101 WHERE id=2",
    "PRAGMA user_version=1", "CREATE TABLE extra(value TEXT)", "DELETE FROM history_data WHERE id=7"]) {
    const input = await setup(), plan = await prepareCurrentPcbStringSql({ before: input.before, history, witness });
    apply(input.path); mutate(input.path, change);
    await assert.rejects(verifyCurrentPcbStringSql(plan, await inventory(input.path)), /delta|count|properties|schema/u);
  }
});
void test("String SQL refuses extra upload chunks and append branches rather than treating their repetition as harmless", async () => {
  const input = await setup(), plan = await prepareCurrentPcbStringSql({ before: input.before, history, witness });
  apply(input.path, `${history.chunkText}|\n${history.chunkText}`);
  await assert.rejects(verifyCurrentPcbStringSql(plan, await inventory(input.path)), /transcript/u);
  mutate(input.path, `UPDATE "project_history_${IDS.branch}" SET is_lock=0 WHERE id=5`);
  await assert.rejects(prepareCurrentPcbStringSql({ before: await inventory(input.path), history, witness }), /maximum ticket|age/u);
});
void test("String SQL rejects wrong original projections, current ID reuse, unchanged header times and malformed input without getters", async () => {
  const input = await setup();
  await assert.rejects(prepareCurrentPcbStringSql({ before: structuredClone(input.before), history, witness }), /original/u);
  await assert.rejects(prepareCurrentPcbStringSql({ before: input.before, history: structuredClone(history), witness }), /original/u);
  let reads = 0;
  const bad = Object.defineProperty({ ...witness }, "backendClockMinMs", { get(): number { reads += 1; return 1; } });
  await assert.rejects(prepareCurrentPcbStringSql({ before: input.before, history, witness: bad }), /own data/u); assert.equal(reads, 0);
  const reused = input.raw.replaceAll("deleted-shape", primitive);
  mutate(input.path, `UPDATE history_data SET dataStr=${literal(encrypted(reused, IDS.oldHead, IDS.oldKey))} WHERE id=7`);
  await assert.rejects(prepareCurrentPcbStringSql({ before: await inventory(input.path), history, witness }), /ID|String/u);
});
