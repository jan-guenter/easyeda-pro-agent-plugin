/** Synthetic completed SQLite readers only. No live CAD or native ownership. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { bindCurrentPcbRenameTimes, prepareCurrentPcbRename } from "../src/current-pcb-rename-preparation.ts";
import { decodeNativeHistoryChunk } from "../src/native-history.ts";
import { HISTORY_TABLE, IDS, TIMES, WITNESS, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const DESIRED = "Renamed PCB", TITLE = "Original PCB";
const META = { title: TITLE, parent: "", source: "", board: "", zIndex: null };
const TARGET = Object.freeze({ projectUuid: IDS.project, branchUuid: IDS.branch, ownerUuid: IDS.actor, pcbUuid: IDS.target });
const CLOCK = Object.freeze({ projectUuid: IDS.project, branchUuid: IDS.branch, backendActorUuid: IDS.actor, client: WITNESS.client,
  documentClockMinMs: TIMES.document - 500, documentClockMaxMs: TIMES.document + 500,
  backendClockMinMs: WITNESS.serverClockMinMs, backendClockMaxMs: WITNESS.serverClockMaxMs, backendLocalOffsetMinutes: 120 });
function literal(value: string): string { return `'${value.replaceAll("'", "''")}'`; }
function treeEntry(uuid: string, title: string): Record<string, unknown> {
  return { uuid, title, board: "", parent_uuid: "", source: "", version: "1", updateTime: 1 };
}
function tree(peerTitle?: string): string {
  return JSON.stringify({ boards: {}, schematics: {}, sheets: {}, pcbs: { [IDS.target]: treeEntry(IDS.target, TITLE),
    ...(peerTitle === undefined ? {} : { [IDS.peer]: treeEntry(IDS.peer, peerTitle) }) },
  panels: {}, blockSymbols: {}, owner: { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic", avatar: null } });
}
function replaceRaw(path: string, raw: string): void {
  mutate(path, `UPDATE history_data SET dataStr=${literal(encrypted(raw, IDS.oldHead, IDS.oldKey))} WHERE id=7`);
}
async function setup(peerTitle?: string, storedUser?: unknown): Promise<{ path: string; raw: string; request: Parameters<typeof prepareCurrentPcbRename>[0] }> {
  const original = await fixture(), table = original.before.tables.find(entry => entry.name === "history_data"); assert.ok(table);
  const value = table.rows[0]?.cells[table.columns.findIndex(column => column["name"] === "dataStr")]; assert.ok(value?.kind === "text");
  const text = await decodeNativeHistoryChunk({ historyUuid: IDS.oldHead, keyHex: IDS.oldKey, dataBase64: Buffer.from(value.hex, "hex").toString("utf8") });
  const rows = text.split("|\n");
  rows[1] = `{"type":"DOCHEAD","ticket":1}||${JSON.stringify({ docType: "PCB", client: "b".repeat(16), uuid: IDS.target, updateTime: 1, version: "1", editVersion: "3.0",
    ...(storedUser === undefined ? {} : { user: storedUser }) })}`;
  rows[2] = `{"type":"META","ticket":1,"id":"META"}||${JSON.stringify(META)}`;
  if (peerTitle !== undefined) {
    rows[5] = `{"type":"DOCHEAD","ticket":2}||${JSON.stringify({ docType: "PCB", client: "b".repeat(16), uuid: IDS.peer, updateTime: 1, version: "1", editVersion: "3.0" })}`;
    rows[6] = `{"type":"META","ticket":2,"id":"META"}||${JSON.stringify({ ...META, title: peerTitle })}`;
  }
  const raw = rows.join("|\n"); replaceRaw(original.path, raw);
  mutate(original.path, `UPDATE project_structures SET structure=${literal(tree(peerTitle))}`);
  return { path: original.path, raw, request: { before: await inventory(original.path), target: TARGET, desiredTitle: DESIRED, witness: CLOCK } };
}

void test("PCB intent freezes original complete SQL, target, peers and reserved capacity before exact times exist", async () => {
  const input = await setup("Peer PCB"), plan = await prepareCurrentPcbRename(input.request);
  assert.equal(plan.desiredTitle, DESIRED); assert.equal(plan.baseline.maximumTicket, 100); assert.equal(plan.baseline.maximumTargetHeaderTime, 1);
  assert.equal(plan.baseline.documentCount, 2); assert.equal(plan.peers.length, 2); assert.equal(plan.baseline.sqlSha256, input.request.before.logicalSha256);
  assert.equal(plan.beforeMetaText, JSON.stringify(META)); assert.ok(Object.isFrozen(plan)); assert.ok(Object.isFrozen(plan.peers[0]));
  assert.ok(Object.isFrozen(plan.witness)); assert.ok(Object.isFrozen(plan.target));
  const bound = await bindCurrentPcbRenameTimes(plan, { documentTime: TIMES.document, backendTime: TIMES.edit });
  assert.equal(bound.history.expectedTicket, 101); assert.equal(bound.history.afterMetaText, JSON.stringify({ ...META, title: DESIRED }));
  assert.ok(bound.sql.maximumPlaintextBytes <= plan.capacity.maximumPlaintextBytes);
  for (const key of ["executionAuthorized", "originalOwnerVerified", "producerBindingVerified", "actorProvenanceVerified", "clockProvenanceVerified",
    "nativeNamePolicyVerified", "queueCompletionVerified", "generationClosureVerified", "persistentUploadReplayExcluded", "reopened"] as const) {
    assert.equal(plan[key], false);
  }
});

void test("PCB intent refuses cloned reader/plan identities and input accessors without invoking them", async () => {
  const input = await setup(), plan = await prepareCurrentPcbRename(input.request);
  await assert.rejects(prepareCurrentPcbRename({ ...input.request, before: structuredClone(input.request.before) }), /original inventory/u);
  await assert.rejects(bindCurrentPcbRenameTimes(structuredClone(plan), { documentTime: TIMES.document, backendTime: TIMES.edit }), /original PCB/u);
  let accessed = false;
  const getter = (): string => { accessed = true; return DESIRED; };
  const altered = Object.defineProperty({ ...input.request }, "desiredTitle", { get: getter });
  await assert.rejects(prepareCurrentPcbRename(altered), /accessors/u);
  const witness = Object.defineProperty({ ...CLOCK }, "client", { get: getter });
  await assert.rejects(prepareCurrentPcbRename({ ...input.request, witness }), /accessors/u); assert.equal(accessed, false);
  await assert.rejects(bindCurrentPcbRenameTimes(plan, { documentTime: TIMES.document, backendTime: TIMES.edit, desiredTitle: "Other" }), /fields/u);
});

void test("PCB intent binds the historical account without making it the fresh producer or backend actor", async () => {
  const user = { uuid: IDS.peer, nickname: "Old nickname Ω", username: "old-account", avatar: "" };
  const input = await setup(undefined, user), plan = await prepareCurrentPcbRename(input.request);
  const bound = await bindCurrentPcbRenameTimes(plan, { documentTime: TIMES.document, backendTime: TIMES.edit });
  assert.equal(bound.history.chunkText.includes('"user":'), false);
  assert.ok(bound.history.chunkText.includes(`"uuid":"${IDS.actor}","username":"synthetic-user"`));
  assert.equal(plan.witness.backendActorUuid, IDS.actor);
  replaceRaw(input.path, input.raw.replace("old-account", "different-account"));
  const changed = await prepareCurrentPcbRename({ ...input.request, before: await inventory(input.path) });
  assert.notEqual(changed.baseline.targetHeaderSha256, plan.baseline.targetHeaderSha256);
  assert.notEqual(changed.baseline.rawHistorySha256, plan.baseline.rawHistorySha256);
  assert.notEqual(changed.baseline.sqlSha256, plan.baseline.sqlSha256);
});

void test("PCB historical user admission rejects unknown, missing, null and mistyped account fields", async () => {
  const user = { uuid: IDS.peer, nickname: "Old", username: "old-account", avatar: "" };
  const input = await setup(undefined, user), original = JSON.stringify(user);
  for (const value of [null, [], { ...user, extra: true }, { ...user, uuid: "invalid" }, { ...user, nickname: null },
    { ...user, username: 42 }, { uuid: IDS.peer, username: "old-account", nickname: "Old" }, { ...user, avatar: "x".repeat(4097) }]) {
    replaceRaw(input.path, input.raw.replace(original, JSON.stringify(value)));
    await assert.rejects(prepareCurrentPcbRename({ ...input.request, before: await inventory(input.path) }));
  }
});

void test("PCB intent requires complete peer history/tree and refuses baseline/name/title drift", async () => {
  const input = await setup("Peer PCB");
  for (const patch of [{ desiredTitle: "peer pcb" }, { desiredTitle: TITLE }, { desiredTitle: " trailing " },
    { target: { ...TARGET, ownerUuid: IDS.peer } }, { witness: { ...CLOCK, branchUuid: IDS.peer } }]) {
    await assert.rejects(prepareCurrentPcbRename({ ...input.request, ...patch }));
  }
  mutate(input.path, `UPDATE project_structures SET structure=${literal(tree())}`);
  await assert.rejects(prepareCurrentPcbRename({ ...input.request, before: await inventory(input.path) }), /peer history\/tree/u);
  mutate(input.path, `UPDATE project_structures SET structure=${literal(tree("Changed peer"))}`);
  await assert.rejects(prepareCurrentPcbRename({ ...input.request, before: await inventory(input.path) }), /peer history\/tree/u);
});

void test("PCB intent keeps all raw target headers and reserves the entire document window", async () => {
  const input = await setup(), rows = input.raw.split("|\n");
  rows[1] = rows[1]?.replace('"updateTime":1', `"updateTime":${CLOCK.documentClockMinMs}`) ?? "";
  rows.splice(5, 0, `{"type":"DOCHEAD","ticket":91}||${JSON.stringify({ docType: "PCB", client: "b".repeat(16), uuid: IDS.target, updateTime: 1, version: "1", editVersion: "3.0" })}`);
  replaceRaw(input.path, rows.join("|\n"));
  await assert.rejects(prepareCurrentPcbRename({ ...input.request, before: await inventory(input.path) }), /window overlaps prior headers/u);
});

void test("PCB intent rejects unsupported target encoding and structure rows before timestamp binding", async () => {
  const input = await setup();
  replaceRaw(input.path, input.raw.replace('"zIndex":null', '"zIndex":4'));
  await assert.rejects(prepareCurrentPcbRename({ ...input.request, before: await inventory(input.path) }));
  replaceRaw(input.path, input.raw);
  mutate(input.path, "UPDATE project_structures SET ticket=101");
  await assert.rejects(prepareCurrentPcbRename({ ...input.request, before: await inventory(input.path) }), /lower ticket/u);
});

void test("PCB exact times cannot escape frozen separate windows or choose another actor/title", async () => {
  const input = await setup(), request = { ...input.request, witness: { ...CLOCK } }; const plan = await prepareCurrentPcbRename(request);
  request.desiredTitle = "Changed after preparation"; request.witness.backendActorUuid = IDS.peer;
  for (const changed of [{ documentTime: CLOCK.documentClockMinMs - 1, backendTime: TIMES.edit },
    { documentTime: TIMES.document, backendTime: CLOCK.backendClockMaxMs + 1 }, { documentTime: -0, backendTime: TIMES.edit }]) {
    await assert.rejects(bindCurrentPcbRenameTimes(plan, changed));
  }
  const bound = await bindCurrentPcbRenameTimes(plan, { documentTime: TIMES.document, backendTime: TIMES.edit });
  assert.ok(bound.history.chunkText.includes(`"uuid":"${IDS.actor}","username":"synthetic-user"`));
  assert.equal(bound.history.afterMetaText, JSON.stringify({ ...META, title: DESIRED }));
});

void test("PCB intent reserves decimal-width growth at the maximum clock endpoint", async () => {
  const input = await setup(), witness = { ...CLOCK, documentClockMinMs: 9999, documentClockMaxMs: 10_000 };
  const plan = await prepareCurrentPcbRename({ ...input.request, witness });
  const first = await bindCurrentPcbRenameTimes(plan, { documentTime: 9999, backendTime: TIMES.edit });
  const last = await bindCurrentPcbRenameTimes(plan, { documentTime: 10_000, backendTime: TIMES.edit });
  assert.ok(first.sql.maximumPlaintextBytes < last.sql.maximumPlaintextBytes);
  assert.ok(last.sql.maximumPlaintextBytes <= plan.capacity.maximumPlaintextBytes);
});

void test("PCB intent reserves a complete additional raw history row before dispatch", async () => {
  const input = await setup(); let previous = IDS.oldHead; const statements: string[] = [];
  for (let index = 1; index <= 63; index += 1) {
    const uuid = index.toString(16).padStart(32, "0"); const raw = `{"type":"EDIT_HEAD"}||{"uuid":"${IDS.actor}","username":"synthetic-user","nickname":"Synthetic","updateTime":1}`;
    statements.push(`INSERT INTO "${HISTORY_TABLE}"(id,uuid,parent,key,is_lock,num,snapshot_num) VALUES(${index + 5},'${uuid}','${previous}','${IDS.oldKey}',1,0,0)`,
      `INSERT INTO history_data(uuid,history_uuid,dataStr) VALUES('${uuid}','${uuid}',${literal(encrypted(raw, uuid, IDS.oldKey))})`); previous = uuid;
  }
  statements.push(`UPDATE branches SET history_uuid='${previous}' WHERE uuid='${IDS.branch}'`); mutate(input.path, statements.join(";"));
  await assert.rejects(prepareCurrentPcbRename({ ...input.request, before: await inventory(input.path) }), /post-append complete-history capacity/u);
});
