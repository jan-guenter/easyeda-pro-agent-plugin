/** Pinned original API/parser methods execute only on inert rows/callbacks.
 * No database, network, native Cache or original application owner exists. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { types } from "node:util";
import { runInNewContext } from "node:vm";
import { CURRENT_GENERATED_INITIAL_CACHE_SOURCE as SOURCE } from "../src/current-generated-initial-cache-source.ts";

const branchUuid = "b".repeat(32), headUuid = "c".repeat(32), projectUuid = "a".repeat(64), startUuid = "d".repeat(32);
const actor = Object.freeze({ uuid: "e".repeat(32), username: "", nickname: "", updateTime: 1_794_000_000_000 });
const sqlRow = Object.freeze({ id: 1, uuid: headUuid, parent: null, snapshot: null, key: "f".repeat(32), is_lock: 0, num: 0,
  snapshot_num: 0, created_at: "2026-11-06 12:00:00", updated_at: "2026-11-06 12:00:00", lock_time: "1970-01-01 08:00:00" });
function promised(value: unknown): Promise<unknown> { assert.ok(types.isPromise(value)); return Promise.resolve(value); }
async function apiRow(): Promise<Record<string, unknown>> {
  const input = { projectUuid, branchUuid, headUuid, startUuid, sqlRow };
  const value = await promised(runInNewContext(`(async()=>{const input=${JSON.stringify(input)},row=input.sqlRow,branchFields={id:"id",uuid:"uuid",node:"node",parent_uuid:"parent_uuid",name:"name"},historyFields=Object.fromEntries(Object.keys(row).map(k=>[k,k]));
const branches=[{id:2,uuid:input.branchUuid,node:0,parent_uuid:input.startUuid,name:"main"},{id:1,uuid:input.startUuid,node:1,parent_uuid:null,name:"start"}],queries=[];
const project=(value,keys)=>Object.fromEntries(keys.map(key=>[key,value[key]]));
const db={queryOne:async(join,condition,projection)=>{queries.push({kind:"one",columns:projection.PROJECTION});const target=join.JOIN===branchFields?branches.find(b=>b.uuid===condition.EQ[1]):row;return target?project(target,projection.PROJECTION):null;},queryAll:async(join,condition,projection)=>{if(join.JOIN!==historyFields)throw Error("foreign query");queries.push({kind:"all",columns:projection.PROJECTION});return[project(row,projection.PROJECTION)];}};
const y=async()=>db,gt={instance:()=>branchFields},Or=async()=>({instance:()=>historyFields});
${SOURCE.UB.source};${SOURCE.yB.source};${SOURCE.mB.source};${SOURCE.wB.source};
const service={${SOURCE.searchHistory.source}},context={projectUuid:input.projectUuid,logger:{debug(){},warn(){},error(){throw Error("unexpected source failure")}}};
const result=await service.searchHistory(context,"original-selected-path",{type:"project",projectUuid:input.projectUuid,branchUuid:input.branchUuid,historyUuid:input.headUuid});return{result,queries};})()`, {}));
  assert.ok(value !== null && typeof value === "object"); const result: unknown = Reflect.get(value, "result"); assert.ok(Array.isArray(result) && result.length === 1);
  const row: unknown = result[0]; assert.ok(row !== null && typeof row === "object");
  assert.equal(JSON.stringify(Reflect.get(value, "queries")), JSON.stringify([
    { kind: "one", columns: ["id", "uuid", "node", "parent_uuid", "name"] }, { kind: "one", columns: ["id", "uuid", "node", "parent_uuid", "name"] },
    { kind: "one", columns: ["id"] }, { kind: "all", columns: ["id", "uuid", "parent", "key", "is_lock", "num", "snapshot_num", "created_at", "updated_at", "lock_time"] },
  ]));
  const plain = Object.fromEntries(Object.entries(row));
  assert.equal(Object.hasOwn(plain, "snapshot"), false); assert.equal(Object.hasOwn(plain, "snapshotUrl"), false);
  // The actual native SQL/API values have already been qualified by the
  // Future original data-plan issuer. This helper exercises source shape only.
  assert.equal(Object.getPrototypeOf(plain), Object.prototype);
  return Object.fromEntries(Object.entries(plain));
}
void test("all fixed histories/parser source spans have exact bytes and independent SHA commitments", () => {
  assert.equal(Object.keys(SOURCE).length, 22);
  for (const pin of Object.values(SOURCE)) { assert.equal(Buffer.byteLength(pin.source), pin.bytes); assert.equal(createHash("sha256").update(pin.source).digest("hex"), pin.sha256); }
});
void test("actual project histories API omits snapshot and preserves its exact ordered projection", async () => {
  const row = await apiRow();
  assert.deepEqual(Object.keys(row), ["id", "uuid", "parent", "key", "is_lock", "num", "snapshot_num", "created_at", "updated_at", "lock_time", "iv", "dataStrUrl"]);
  assert.equal(row["iv"], headUuid); assert.equal(row["dataStrUrl"], `/api/v4/histories/dataStr?path=${projectUuid}&uuid=${headUuid}`);
});
function document(uuid: string, docType: "PCB" | "SCH" | "SCH_PAGE"): string {
  return `${JSON.stringify({ type: "DOCHEAD" })}||${JSON.stringify({ uuid, docType, client: "1".repeat(16), editVersion: "3.2.209", updateTime: actor.updateTime, version: String(actor.updateTime) })}|\n${JSON.stringify({ type: "META", id: "META", ticket: 1 })}||${JSON.stringify({ title: docType, parent: "", source: "", zIndex: null })}`;
}
void test("actual initial open emits raw per-document bodies and ordered head index before native put Promises settle", async () => {
  for (const documents of [[{ uuid: "2".repeat(32), type: "PCB" as const }], [{ uuid: "3".repeat(32), type: "SCH" as const }, { uuid: "4".repeat(32), type: "SCH_PAGE" as const }]]) {
    const row = await apiRow(), sources = documents.map(value => document(value.uuid, value.type));
    const plaintext = `${JSON.stringify({ type: "EDIT_HEAD" })}||${JSON.stringify(actor)}|\n${sources.join("|\n")}|\n`;
    const input = { projectUuid, branchUuid, headUuid, row, plaintext };
    const result = await promised(runInNewContext(`(async()=>{const input=${JSON.stringify(input)},puts=[],completions=[],location={origin:"https://client"},console={error(){throw Error("parser error")}},Request=class{};
${SOURCE.Gu.source};${SOURCE.Ro.source};var ${SOURCE.groupTypes.source};${SOURCE.Na.source};${SOURCE.$y.source};${SOURCE.Uo.source};${SOURCE.ou.source};
const parser={${SOURCE.flowParseFull.source},${SOURCE.onEditHead.source},onDocHead(){},onLine(){},onEnd(){}};
class Response{constructor(body,init){this.body=body;this.init=init}}
let pendingAtIndex=-1;const target={${SOURCE.getFlowParse.source},${SOURCE.openInCloud.source},uuid:input.projectUuid,branchUuid:input.branchUuid,historyIndex:[],cachePromise:new Set(),consistencyManager:parser,progress:{update(){}},scaleProgress(){},getHistories:async()=>({success:true,result:[input.row]}),cache:{put(key,response){if(key.includes("/index/v1/"))pendingAtIndex=target.cachePromise.size;puts.push({key,body:response.body});return new Promise(resolve=>completions.push(resolve));}}};
const yt={ContentType:"Content-Type"},gt={Json:"application/json"};const du=async(row,factory)=>{if(row.num!==0||row.snapshot!==undefined)throw Error("not initial");const flow=factory(0);flow.start();flow.update(input.plaintext);flow.end();};
const outcome=await target.openInCloud(input.headUuid);const result={outcome,puts,pendingAtIndex,index:target.historyIndex,taskCount:target.cachePromise.size};for(const resolve of completions)resolve(undefined);return result;})()`, {}));
    assert.ok(result !== null && typeof result === "object"); const actual = result;
    const expectedIndex = [{ ...row, editHead: [actor], docs: [Object.fromEntries(documents.map(value => [value.uuid, 0]))], docIds: [documents.map(value => value.uuid)] }];
    assert.equal(JSON.stringify(Reflect.get(actual, "index")), JSON.stringify(expectedIndex));
    assert.equal(JSON.stringify(Reflect.get(actual, "puts")), JSON.stringify([...documents.map((value, index) => ({ key: `https://client/dataStr/${headUuid}-${value.uuid}`, body: sources[index] })),
      { key: `https://client/index/v1/${branchUuid}`, body: JSON.stringify(expectedIndex) }]));
    assert.equal(Reflect.get(actual, "pendingAtIndex"), documents.length); assert.equal(Reflect.get(actual, "taskCount"), documents.length);
    assert.equal(JSON.stringify(Reflect.get(actual, "outcome")), JSON.stringify({ success: true }));
  }
});
void test("actual SDK GET and IA wrappers retain the same result envelope and selected request fields", async () => {
  const row = await apiRow();
  const result = await promised(runInNewContext(`(async()=>{const project=${JSON.stringify(projectUuid)},branch=${JSON.stringify(branchUuid)},head=${JSON.stringify(headUuid)},envelope={success:true,result:[${JSON.stringify(row)}]},requests=[];const ae={PROJECT_HISTORY:{GET:"original-route"}},yt={ContentType:"Content-Type"},gt={Json:"application/json"},He={currentProject:{projectId:"foreign-fallback"}};
const Se={notNull(){throw Error("unexpected argument")}},Rt=(route,args)=>{requests.push({route,args});return route;},Ve=async(...args)=>{requests.push({method:args[0],route:args[1],headers:args[3].headers});return envelope;};
const api={${SOURCE.sdkVerify.source},${SOURCE.sdkExec.source},${SOURCE.sdkExec1.source},${SOURCE.sdkGET.source},${SOURCE.historySdkGet.source}},Re={getInstance:()=>({projectHistory:api})};${SOURCE.IA.source};
const actual=await IA(head,project,branch);return{same:actual===envelope,requests};})()`, {}));
    assert.equal(JSON.stringify(result), JSON.stringify({ same: true, requests: [{ route: "original-route", args: { project_uuid: projectUuid, branch_uuid: branchUuid, history_uuid: headUuid } },
      { method: "GET", route: "original-route", headers: { "Content-Type": "application/json", path: projectUuid } }] }));
});
