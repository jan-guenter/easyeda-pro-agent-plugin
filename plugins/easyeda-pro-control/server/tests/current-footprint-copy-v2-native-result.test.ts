/** Synthetic source-method execution and complete checkpoint inputs only. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { isRecord, sha256Text } from "../src/core.ts";
import { CURRENT_FOOTPRINT_COPY_V2_NATIVE_RESULT_MAX_BYTES, assertCurrentFootprintCopyV2NativeResultInputs,
  decodeCurrentFootprintCopyV2NativeResult } from "../src/current-footprint-copy-v2-native-result.ts";
import { prepareCurrentFootprintCopyV2Plan } from "../src/current-footprint-copy-v2-plan.ts";
import type { CurrentFootprintCopyV2Plan } from "../src/current-footprint-copy-v2-plan.ts";
import { prepareCurrentFootprintSourcePlan } from "../src/current-footprint-source-plan.ts";
import { IDS, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const CLIENT = "a".repeat(16), DESTINATION = "e".repeat(16);
// Exact pinned worker0e7a4743 method bodies. Their execution below exercises
// Actual get/setEditData semantics with synthetic state, not the whole parser.
const GET = 'get(s){var i,n;let r=this.data[s];return!r||r!=null&&r.isDelete?null:{uuid:r.uuid,project_uuid:this.projectManager.uuid,title:Ne(r.title),display_title:r.title,docType:Oe.FOOTPRINT,creator:r.creator,createTime:r.createTime||r.updateTime,modifier:r.modifier,description:r.description,updateTime:r.updateTime,custom_tags:JSON.stringify(r.tags),owner:(n=(i=this.projectManager)==null?void 0:i.projectDetails)==null?void 0:n.owner,source:r.source||"",version:r.version||"",path:this.projectManager.uuid,ticket:r.ticket}}';
const SET_EDIT_DATA = 'setEditData(s,r,i,n,a,o){var l,u;let c=o===this.client;if(!this.data[s])this.data[s]={[this.mainKey]:s,creator:r,createTime:i,modifier:r,updateTime:i,version:n,path:this.projectManager.uuid,owner:{uuid:this.projectManager.uuid,nickname:(u=(l=this.projectManager)==null?void 0:l.projectDetails)==null?void 0:u.name}},a&&this.projectManager.notifyWatcher(a,{uuid:s,projectId:this.projectManager.uuid,localChange:c});else{let h=this.data[s];(!h.createTime||i<h.createTime)&&(h.createTime=i,h.creator=r),(!h.updateTime||h.updateTime<i)&&(h.updateTime=i,r&&(h.modifier=r),h.version=n,this.publishUpdate(s))}}';
const FOLD = 'function Ne(e){return typeof e!="string"?(console.warn("Title must be a string!title is "+e),e):Fe?e.toLocaleLowerCase():e.replace(/[A-Z]+/g,t=>t.toLowerCase())}';
const META = { title: "DIP", description: "Preserve Ω", tags: ["tag"], source: "original" };
function row(type: string, ticket: number, id: string, body: unknown): string {
  return `${JSON.stringify({ type, ticket, id })}||${JSON.stringify(body)}`;
}
function head(ticket: number): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "FOOTPRINT", client: CLIENT,
    uuid: IDS.target, updateTime: 300, version: "300", editVersion: "3.2.209", user: { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic" } })}`;
}
async function plan(): Promise<CurrentFootprintCopyV2Plan> {
  const created = await fixture();
  const raw = [head(100), row("META", 3, "META", META), row("PAD", 12, "pad", { number: "1" })].join("|\n");
  mutate(created.path, `UPDATE history_data SET dataStr='${encrypted(raw, IDS.oldHead, IDS.oldKey)}' WHERE uuid='${IDS.oldHead}'`);
  const before = await inventory(created.path), sourcePlan = await prepareCurrentFootprintSourcePlan(before,
    { projectUuid: IDS.project, branchUuid: IDS.branch, footprintUuid: IDS.target });
  return prepareCurrentFootprintCopyV2Plan(before, sourcePlan, { client: CLIENT,
    content: [head(101), row("META", 12, "META", META), head(100), row("PAD", 12, "pad", { number: "1" })].join("|\n") });
}
function nativeReply(copy: CurrentFootprintCopyV2Plan, first = 400, second = 401, deleted = false): string {
  const value: unknown = runInNewContext(`const Fe=false,Oe={FOOTPRINT:4};${FOLD}
const manager={${GET},${SET_EDIT_DATA},data:{},mainKey:'uuid',client:${JSON.stringify(CLIENT)},publishUpdate(){},
 projectManager:{uuid:${JSON.stringify(IDS.project)},projectDetails:{owner:{uuid:${JSON.stringify(copy.ownerUuid)},unknown:{retained:[true,null,'Ω']}}}}};
const user={uuid:undefined,username:undefined,nickname:undefined};
manager.setEditData('${DESTINATION}',user,${String(first)},'${String(first)}');
Object.assign(manager.data['${DESTINATION}'],${JSON.stringify(copy.destinationMetadata)},{ticket:${String(copy.metadataTicket)},isDelete:${String(deleted)}});
manager.setEditData('${DESTINATION}',user,${String(second)},'${String(second)}');
JSON.stringify({success:true,result:manager.get('${DESTINATION}')});`, {}, { timeout: 1000 });
  assert.ok(typeof value === "string"); return value;
}
function changed(raw: string, field: string, value: unknown): string {
  const parsed: unknown = JSON.parse(raw); assert.ok(isRecord(parsed) && isRecord(parsed["result"]));
  parsed["result"][field] = value; return JSON.stringify(parsed);
}

void test("native result uses actual pinned get and edit-clock methods and retains complete supplied metadata", async () => {
  assert.equal(sha256Text(GET), "8d9f306dc82edd247d74300e4f33e6bae6656fa1243f94fb16e889a674898dfe");
  assert.equal(sha256Text(SET_EDIT_DATA), "0f0d25706407a59aa9e31b4c21723b7d66ab4e5aa605c6c13ff0c4754dd8f860");
  assert.equal(sha256Text(FOLD), "20d51aa170a8edbe9fe6c06c0711e91d19fa819f1e87eda0f6480bd172980586");
  const copy = await plan();
  for (const times of [[400, 401], [400, 400], [401, 400]] as const) {
    const raw = nativeReply(copy, ...times), result = decodeCurrentFootprintCopyV2NativeResult(copy, raw);
    assertCurrentFootprintCopyV2NativeResultInputs(result, copy);
    assert.equal(result.serializedEnvelope, raw); assert.equal(result.returnedUuid, DESTINATION);
    assert.equal(result.envelope.result["createTime"], 400); assert.equal(result.envelope.result["updateTime"], Math.max(...times));
    assert.deepEqual(result.envelope.result["creator"], {}); assert.deepEqual(result.envelope.result["modifier"], {});
    assert.deepEqual(result.envelope.result["owner"], { uuid: copy.ownerUuid, unknown: { retained: [true, null, "Ω"] } });
    assert.equal(result.nativeObservationBound, false); assert.equal(result.clockWindowVerified, false);
    assert.equal(result.ownerDetailsVerified, false); assert.equal(result.completionVerified, false);
    assert.equal(result.persistenceVerified, false); assert.equal(result.executionAuthorized, false);
    assert.equal(result.localeObserved, false); assert.deepEqual(result.titleFoldCandidates, ["default"]);
    assert.throws(() => { assertCurrentFootprintCopyV2NativeResultInputs(structuredClone(result), copy); }, /original result/u);
    assert.throws(() => { assertCurrentFootprintCopyV2NativeResultInputs(result, structuredClone(copy)); }, /original plan/u);
  }
  const turkic = decodeCurrentFootprintCopyV2NativeResult(copy, changed(nativeReply(copy), "title", "dıp_1"));
  assert.deepEqual(turkic.titleFoldCandidates, ["turkish-azeri"]); assert.equal(turkic.localeObserved, false);
});

void test("native result refuses incomplete, failed, stale, foreign and unsupported same-generation returns", async () => {
  const copy = await plan(), raw = nativeReply(copy);
  for (const [field, value] of Object.entries({ uuid: IDS.target, project_uuid: IDS.branch, path: IDS.branch,
    docType: 2, title: "DIP_1", display_title: "foreign", description: "changed", custom_tags: "[ ]", source: "old",
    version: "400", createTime: 0, updateTime: 399, ticket: copy.canvasHeaderTicket, owner: { uuid: "0".repeat(32) },
    creator: { uuid: DESTINATION }, modifier: { uuid: IDS.actor }, extra: true })) {
    assert.throws(() => decodeCurrentFootprintCopyV2NativeResult(copy, changed(raw, field, value)), field);
  }
  for (const invalid of [nativeReply(copy, 400, 401, true), JSON.stringify({ success: false, message: "refused" }),
    JSON.stringify({ success: true, result: DESTINATION }), raw.replace('"creator":{},', ""),
    raw.replace('"success":true', '"success":false,"success":true'), ` ${raw}`, `${raw}\n`,
    raw.replace('"ticket":101', '"ticket":1.01e2'), raw.replace('"unknown":{', '"unknown":{"bad":-0,'),
    raw.replace('"unknown":{', String.raw`"unknown":{"bad":"\ud800",`)]) {
    assert.throws(() => decodeCurrentFootprintCopyV2NativeResult(copy, invalid));
  }
});

void test("native result bounds complete serialized data and never reflects on caller objects", async () => {
  const copy = await plan(), raw = nativeReply(copy); let traps = 0;
  const proxy = new Proxy({}, { get(): never { traps += 1; throw new Error("trap"); },
    getPrototypeOf(): never { traps += 1; throw new Error("trap"); }, ownKeys(): never { traps += 1; throw new Error("trap"); } });
  const accessor = Object.defineProperty({}, "result", { get(): never { traps += 1; throw new Error("getter"); } });
  for (const invalid of [proxy, accessor, { result: proxy },
    "x".repeat(CURRENT_FOOTPRINT_COPY_V2_NATIVE_RESULT_MAX_BYTES + 1),
    "Ω".repeat(CURRENT_FOOTPRINT_COPY_V2_NATIVE_RESULT_MAX_BYTES / 2 + 1)]) {
    assert.throws(() => decodeCurrentFootprintCopyV2NativeResult(copy, invalid), /bounded primitive|UTF8 capacity/u);
  }
  assert.equal(traps, 0);
  assert.throws(() => decodeCurrentFootprintCopyV2NativeResult(copy, changed(raw, "owner", { uuid: copy.ownerUuid, retained: "x".repeat(65_536) })), /owner data capacity/u);
  let nested: unknown = null; for (let index = 0; index < 9; index += 1) { nested = { nested }; }
  assert.throws(() => decodeCurrentFootprintCopyV2NativeResult(copy, changed(raw, "owner", { uuid: copy.ownerUuid, nested })), /tree capacity/u);
});
