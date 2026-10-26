/** Actual pinned method bodies with synthetic dependency responders only.
 * These tests establish ordering/branches, not native ownership or persistence. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { isRecord } from "../src/core.ts";
import { CURRENT_FOOTPRINT_COPY_CREATE_EFFECTS, assertCurrentFootprintCopyCreateSourceSpan,
  qualifyCurrentFootprintCopyCreateSources, requireCurrentFootprintCopyCreateSources } from "../src/current-footprint-copy-create-source.ts";
import { FOOTPRINT_CREATE_SOURCE_FIXTURE as SOURCE } from "./helpers/current-footprint-copy-create-source-fixture.ts";

async function run(source: string): Promise<Record<string, unknown>> {
  const result: unknown = await runInNewContext(`(async()=>{${source}})()`, {}, { timeout: 1000 });
  assert.ok(typeof result === "string"); const parsed: unknown = JSON.parse(result); assert.ok(isRecord(parsed)); return parsed;
}
function producer(mode: "source-refused" | "clock-refused" | "upload-refused" | "null-result"): string {
  return `const steps=[],mode=${JSON.stringify(mode)},Ie='|\\n',Dt=/^[a-f0-9]{32}$/,ve={FOOTPRINT:'FOOTPRINT'};
const Qe=()=>{steps.push('allocate');return 'd'.repeat(16);};
const qe=async()=>{steps.push('clock');if(mode==='clock-refused')throw Error('clock refused');return 123;};
class Ke{constructor(){this.footprint={head:d=>JSON.stringify(d),metaData:d=>d,meta:(t,d)=>d};}}
const ai={getProLibSource:async d=>{steps.push('source');return mode==='source-refused'?{success:false,message:'source refused'}:{success:true,result:'source-body'};}};
class Manager{${SOURCE.worker.create}${SOURCE.worker.buildString}${SOURCE.worker.newTicket}
get maxTicket(){return this.projectManager.consistencyManager.maxTicket;}
async canvasString(){steps.push('canvas');return{success:true,result:'canvas-body'};}
get(){steps.push('get');return mode==='null-result'?null:{uuid:'d'.repeat(16)};}}
const consistency={${SOURCE.worker.setDoctype},docHead:{},maxTicket:100,setMaxTicket(n){steps.push('ticket');this.maxTicket=n;}};
const project={consistencyManager:consistency,async uploadLocal(data){steps.push('upload');return{success:false,message:'upload refused'};}};
const manager=new Manager;manager.projectManager=project;manager.client='a'.repeat(16);manager.user=undefined;
let outcome;try{outcome=await manager.create({uuid:'s'.repeat(16),path:'p',isProject:true,docType:4,title:'copy',display_title:'copy',description:'',custom_tags:'[]',source:'',version:''});}catch(error){outcome={thrown:error.message};}
return JSON.stringify({outcome,steps,maximumTicket:consistency.maxTicket,docHead:consistency.docHead});`;
}

void test("copy creation source checks fixed excerpts and rejects hostile source values without reflection", () => {
  for (const kind of ["worker", "ui"] as const) {
    for (const [name, source] of Object.entries(SOURCE[kind])) {
      assertCurrentFootprintCopyCreateSourceSpan(kind, name, source);
      assert.throws(() => { assertCurrentFootprintCopyCreateSourceSpan(kind, name, `${source} `); });
    }
  }
  let traps = 0; const hostile = new Proxy({}, { get(): never { traps += 1; throw new Error("trap"); },
    getPrototypeOf(): never { traps += 1; throw new Error("trap"); }, ownKeys(): never { traps += 1; throw new Error("trap"); } });
  for (const value of [hostile, { source: hostile }, null, 1, ""]) {
    assert.throws(() => qualifyCurrentFootprintCopyCreateSources(value, value));
    assert.throws(() => { assertCurrentFootprintCopyCreateSourceSpan("worker", "create", value); });
  }
  assert.throws(() => { assertCurrentFootprintCopyCreateSourceSpan("worker", "constructor", SOURCE.worker.create); });
  // A public JSON-shaped report cannot recreate the private source issuer.
  assert.throws(() => { requireCurrentFootprintCopyCreateSources({}); });
  assert.equal(traps, 0); assert.equal(CURRENT_FOOTPRINT_COPY_CREATE_EFFECTS.sourceQualificationEnablesExecution, false);
});

void test("pinned footprint create mutates allocation state before clock/source failure and does not validate upload success", async () => {
  const clock = await run(producer("clock-refused"));
  assert.deepEqual(clock["steps"], ["allocate", "clock"]); assert.equal(clock["maximumTicket"], 100);
  assert.deepEqual(clock["docHead"], { ["d".repeat(16)]: { docType: "FOOTPRINT" } });
  const source = await run(producer("source-refused"));
  assert.deepEqual(source["steps"], ["allocate", "clock", "ticket", "source"]); assert.equal(source["maximumTicket"], 101);
  assert.deepEqual(source["outcome"], { success: false, message: "source refused" });
  for (const mode of ["upload-refused", "null-result"] as const) {
    const result = await run(producer(mode));
    assert.deepEqual(result["steps"], ["allocate", "clock", "ticket", "source", "canvas", "upload", "get"]);
    assert.deepEqual(result["outcome"], { success: true, result: mode === "null-result" ? null : { uuid: "d".repeat(16) } });
  }
});

void test("pinned UI routing prioritizes extension libraries and can report an absent project-source message as success", async () => {
  const result = await run(`const steps=[],window={},h4={getInstance:()=>({hasLib:()=>true})};
class boe{${SOURCE.ui.sourceRouter}${SOURCE.ui.projectSource}
static getExtendLib(e){steps.push('extension');return{success:true,result:'extension-source'};}
static getOtherLibByWorker(){throw Error('unexpected');}}
const Lo={messageBus:{rpcCall:async(method,args)=>{steps.push(method);return{message:method==='/pro-mgr/hasProject'?true:undefined};}}};
const $e={FOOTPRINT:{GET_STR:'/footprint/get-str'}},gT=()=>false;
const routed=await boe.getProLibSource({isProject:true,path:'selected-project',uuid:'selected-footprint',docType:4});
const direct=await boe.getProjectLibByWorker({path:'selected-project',uuid:'selected-footprint',docType:4});
return JSON.stringify({routed,direct,steps});`);
  assert.deepEqual(result["routed"], { success: true, result: "extension-source" });
  assert.deepEqual(result["direct"], { success: true, result: "" });
  assert.deepEqual(result["steps"], ["extension", "/pro-mgr/hasProject", "/footprint/get-str"]);
});

void test("pinned cache loader can replay missing chunks and defers cleanup while a cache promise remains", async () => {
  const result = await run(`const steps=[],Ie='|\\n',Uo=()=> 'chunk';let hit=true;
const yg=()=>steps.push('mark-history'),fc=()=> 'history-url';
const mg=async(p,m,flag,parser)=>{steps.push('replay-history');parser('chunk','replayed-body');};
const project={${SOURCE.worker.cacheData},historyIndex:[{uuid:'history'}],
cache:{flowStrMatch:async(key,callbacks)=>{steps.push('cache-read');if(hit)callbacks.update('cached-body');return hit;}},
getFlowParse(p,n,a,b,c,d,callback){steps.push('parser');return callback;}};
const warm=project.getCacheData();await warm.init('history',0,'doc',0);const first=warm.get(0);
hit=false;const cold=project.getCacheData();await cold.init('history',0,'doc',0);const second=cold.get(0);
let now=0;const timers=[],Date={now:()=>now},setTimeout=fn=>{timers.push(fn);return timers.length;};
const entry={promise:true,cache:{end(){steps.push('cache-end');}}};
const consistency={${SOURCE.worker.delayClear},historyMap:{h:{n:{d:{u:entry}}}}};
consistency.delayClear();now=6000;timers.shift()();const deferred=timers.length;
delete entry.promise;now=12000;timers.shift()();
return JSON.stringify({first,second,steps,deferred,remaining:Object.keys(consistency.historyMap.h.n.d).length});`);
  assert.equal(result["first"], "cached-body"); assert.equal(result["second"], "replayed-body");
  assert.deepEqual(result["steps"], ["cache-read", "cache-read", "mark-history", "parser", "replay-history", "cache-end"]);
  assert.equal(result["deferred"], 1); assert.equal(result["remaining"], 0);
});

void test("pinned upload parses before its asynchronous cache put and has a distinct failure fallback", async () => {
  const result = await run(`const steps=[],Ie='|\\n',cg=x=>x,Qe=()=> 'key',Response=class{constructor(s){this.value=s;}};
const project={${SOURCE.worker.uploadLocal},branchUuid:'branch',bufferUploadData:new Map(),
consistencyManager:{parseFull(){steps.push('parse');}},localCache:{async put(){steps.push('put');throw Error('quota');}},
publishUploadPending(){steps.push('pending');},async uploadCloud(){steps.push('cloud');return{success:false};},
bufferedUploadCloud(){steps.push('buffered');}};
const failed=await project.uploadLocal(['source']);project.localCache.put=async()=>{steps.push('put-ok');};
const successful=await project.uploadLocal(['source']);return JSON.stringify({failed,successful,steps,buffered:project.bufferUploadData.size});`);
  assert.deepEqual(result["failed"], { success: false }); assert.deepEqual(result["successful"], { success: true });
  assert.deepEqual(result["steps"], ["parse", "put", "pending", "cloud", "parse", "put-ok", "buffered", "pending"]);
  assert.equal(result["buffered"], 1);
});
