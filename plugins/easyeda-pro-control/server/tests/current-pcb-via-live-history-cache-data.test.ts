/** Compare the data projection with actual pinned vendor parser/merge methods
 * on inert values. No application, original owner or cache method runs. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { CURRENT_GENERATED_INITIAL_CACHE_SOURCE as SOURCE } from "../src/current-generated-initial-cache-source.ts";
import { CURRENT_GENERATED_INITIAL_SYNC_CALLEES as CALLEES } from "../src/current-generated-initial-sync-source.ts";
import { compareCurrentPcbViaLiveHistoryCacheData } from "../src/current-pcb-via-live-history-cache-data.ts";
import { viaLiveHistoryCacheInput } from "./helpers/via-live-history-cache-data.ts";

function actualProjection(input: ReturnType<typeof viaLiveHistoryCacheInput>): unknown {
  const hd=CALLEES.find(value=>value.name==="hd");const ag=CALLEES.find(value=>value.name==="ag");assert.ok(hd!==undefined&&ag!==undefined);
  return runInNewContext(`(()=>{const input=${JSON.stringify(input)},location={origin:"https://client"};class Request{}class Response{constructor(body){this.body=body;}}const puts=[],pending=[];
${SOURCE.Gu.source};${SOURCE.Ro.source};let ${SOURCE.groupTypes.source};${SOURCE.Na.source};${SOURCE.$y.source};${SOURCE.Uo.source};${SOURCE.mB.source};${ag.source};${hd.source};
class Parser{${SOURCE.flowParseFull.source};onDocHead(){}onLine(){}onEnd(){}}
const initial=JSON.parse(input.initial.headIndex.body),api=mB({projectUuid:input.projectUuid},input.native.rows),index=hd(api,initial),head=index[0];
const worker={consistencyManager:new Parser,cachePromise:new Set,cache:{put(url,response){puts.push({url,body:response.body});const promise=new Promise(()=>{});pending.push(promise);return promise;}},${SOURCE.getFlowParse.source}};
const flow=worker.getFlowParse(head,input.effects.historyNum,true,true);flow.start();flow.update(input.plaintext);flow.end();return{api,indexBody:JSON.stringify(index),puts,pending:pending.length};})()`);
}
void test("mutable and appended heads preserve actual raw flow bodies and vendor metadata property order",()=>{
  for(const mode of ["mutable","append"]as const){const input=viaLiveHistoryCacheInput(mode);const data=compareCurrentPcbViaLiveHistoryCacheData(input);const actual:unknown=structuredClone(actualProjection(input));assert.ok(actual!==null&&typeof actual==="object");
    assert.equal(data.headIndex.body,Reflect.get(actual,"indexBody"));const puts:unknown=Reflect.get(actual,"puts");assert.ok(Array.isArray(puts));assert.deepEqual(puts,data.documents.map(({url,body})=>({url,body})));assert.equal(Reflect.get(actual,"pending"),1);
    assert.equal(data.documents[0]?.body,input.body);assert.equal(data.documents[0]?.url,`https://client/dataStr/${input.effects.chunkUuid}-${input.documentUuid}`);
    const head:unknown=JSON.parse(data.headIndex.body);assert.ok(Array.isArray(head));const first:unknown=head[0];assert.ok(first!==null&&typeof first==="object");
    const metadata=Object.keys(first).filter(key=>["editHead","docs","docIds"].includes(key));assert.deepEqual(metadata,mode==="mutable"?["docs","editHead","docIds"]:["editHead","docs","docIds"]);
    assert.equal(data.cacheContinuationAuthorized,false);assert.equal(data.completeUploadFrontierVerified,false);
  }
});
void test("every known initial row field remains exact and native append timestamps are not guessed from callback clocks",()=>{
  for(const mode of ["mutable","append"]as const){const input=viaLiveHistoryCacheInput(mode);const data=compareCurrentPcbViaLiveHistoryCacheData(input);assert.equal(data.historyApiRows[0]?.["created_at"],input.native.rows[0]?.created_at);
    const oldIndex=mode==="append"?1:0;const rows=input.native.rows.map((row,index)=>index===oldIndex?{...row,updated_at:"2026-11-02 00:00:00"}:row);
    assert.throws(()=>compareCurrentPcbViaLiveHistoryCacheData({...input,native:{...input.native,rows}}),/LIVE_HISTORY_CACHE_DATA/u);
    assert.throws(()=>compareCurrentPcbViaLiveHistoryCacheData({...input,plaintext:`${input.plaintext}|\n`}),/LIVE_HISTORY_CACHE_DATA/u);
    const branch:unknown=JSON.parse(data.branch.body);assert.ok(branch!==null&&typeof branch==="object");assert.equal(Reflect.get(branch,"history_uuid"),input.effects.historyUuid);assert.equal(Reflect.get(branch,"project_histories_id"),mode==="append"?2:1);assert.equal(Object.keys(branch).length,17);
  }
});
