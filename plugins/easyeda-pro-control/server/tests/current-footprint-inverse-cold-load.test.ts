/** Actual inert SQLite/cipher and mixed-source parser checks. Supplied packets
 * remain data; they create no native birth, worker, resume or writer authority. */
/* oxlint-disable import/max-dependencies -- The finite cold boundary is checked against independent SQL/cipher and pinned parser/encoder leaves. */
import assert from "node:assert/strict";
import {createHash}from"node:crypto";
import{mkdtemp,readFile}from"node:fs/promises";
import{join}from"node:path";
import{tmpdir}from"node:os";
import{DatabaseSync}from"node:sqlite";
import{test}from"node:test";
import{z}from"zod";
import{sha256Text}from"../src/core.ts";
import{captureCurrentFootprintSavedFlowCacheInput,deriveCurrentFootprintSavedFlowCacheData}from"../src/current-footprint-saved-flow-cache-data.ts";
import{deriveCurrentFootprintInverseColdLoadData}from"../src/current-footprint-inverse-cold-load-data.ts";
import{CurrentFootprintInverseColdLoadProgress}from"../src/current-footprint-inverse-cold-load-progress.ts";
import{CURRENT_FOOTPRINT_INVERSE_COLD_LOAD_SITES as SITES,classifyCurrentFootprintInverseColdPause,currentFootprintInverseColdLoadArmOrder,currentFootprintInverseColdLoadBudget,currentFootprintInverseColdLoadCases,currentFootprintInverseColdLoadNativeFrame,currentFootprintInverseColdLoadWire,validateCurrentFootprintInverseColdLoadCommand}from"../src/current-footprint-inverse-cold-load-protocol.ts";
import{readExactSqlInventory}from"../src/sqlite-inventory.ts";
import{syntheticSqlRuntime}from"./helpers/sqlite-inventory-fixture.ts";
import{encrypted}from"./helpers/symbol-sql-fixture.ts";

const projectUuid="a".repeat(64);const branchUuid="b".repeat(32);const historyUuid="c".repeat(32);const key="d".repeat(32);const footprint="e".repeat(16);const pcb="f".repeat(32);
const line=(type:string,body:unknown,extra:object={}):string=>`${JSON.stringify({type,...extra})}||${JSON.stringify(body)}|\n`;
async function fixture(count:number):Promise<Readonly<{source:ReturnType<typeof captureCurrentFootprintSavedFlowCacheInput>;cache:ReturnType<typeof deriveCurrentFootprintSavedFlowCacheData>;inventory:Awaited<ReturnType<typeof readExactSqlInventory>>;data:ReturnType<typeof deriveCurrentFootprintInverseColdLoadData>}>>{
 const chunks=Array.from({length:count},(_,ordinal)=>{const plaintext=line("EDIT_HEAD",{uuid:"1".repeat(32),updateTime:1000+ordinal})+line("DOCHEAD",{uuid:footprint,docType:"FOOTPRINT",client:"native"},{ticket:1})+line("META",{title:"Footprint"},{id:"META",ticket:ordinal+2})+line("DOCHEAD",{uuid:pcb,docType:"PCB",client:"native"},{ticket:10})+line("META",{title:"Peer"},{id:"META",ticket:ordinal+11});return{historyUuid,ordinal,plaintext,plaintextSha256:sha256Text(plaintext)};});
 const source=captureCurrentFootprintSavedFlowCacheInput({projectUuid,branchUuid,headHistoryUuid:historyUuid,heads:[{id:1,uuid:historyUuid,parent:null,key,is_lock:1,num:count-1,snapshot_num:0,created_at:null,updated_at:null,lock_time:null}],chunks});
 const directory=await mkdtemp(join(tmpdir(),"inverse-cold-inert-"));const path=join(directory,"source.eprj2");const db=new DatabaseSync(path);
 try{db.exec("CREATE TABLE history_data(uuid TEXT,history_uuid TEXT,dataStr TEXT)");const insert=db.prepare("INSERT INTO history_data VALUES(?,?,?)");for(const chunk of chunks){insert.run(`${historyUuid}${chunk.ordinal===0?"":`-${String(chunk.ordinal)}`}`,historyUuid,encrypted(chunk.plaintext,historyUuid,key));}}finally{db.close();}
 const inventory=await readExactSqlInventory({checkpointPath:path,expectedSha256:createHash("sha256").update(await readFile(path)).digest("hex"),runtime:await syntheticSqlRuntime()});
 const cache=deriveCurrentFootprintSavedFlowCacheData(source),data=deriveCurrentFootprintInverseColdLoadData(source,cache,inventory);return{source,cache,inventory,data};
}
const reply=(value:unknown):unknown=>({result:{type:"object",value}});
function begin(progress:CurrentFootprintInverseColdLoadProgress,data:Awaited<ReturnType<typeof fixture>>["data"]):void{
 const initial={uuid:projectUuid,branchUuid:null,isOpening:true,isReady:false};progress.accept("branch",reply({project:initial,branchUuid,historyUuid}));progress.accept("cold",reply({project:{...initial,branchUuid,cacheName:`project_${projectUuid}_v6`,localCacheName:`localProject_${projectUuid}_v1`},emptyLocalIndex:true}));progress.accept("histories",reply({project:{...initial,branchUuid,cacheName:`project_${projectUuid}_v6`,localCacheName:`localProject_${projectUuid}_v1`},historyUuid,histories:data.histories}));
}
void test("mixed branch cold ingress compares all actual cipher/plain chunks and final peer metadata",async()=>{
 const{data,inventory,source,cache}=await fixture(3);assert.equal(data.chunks.length,3);assert.equal(data.parsedHistories[0]?.["uuid"],historyUuid);assert.ok(JSON.stringify(data.parsedHistories).includes(pcb));assert.ok(JSON.stringify(data.parsedHistories).includes("FOOTPRINT"));assert.equal(data.bootstrapResumeAuthorized,false);
 assert.throws(()=>deriveCurrentFootprintInverseColdLoadData(source,cache,structuredClone(inventory)),/original inventory/u);
 const progress=new CurrentFootprintInverseColdLoadProgress(data);begin(progress,data);
 for(const role of["fetchEntry","response","bytes","plaintext"]as const){for(const chunk of data.chunks){const value={history:data.histories[0],url:chunk.fetchUrl,snapshot:true,debugUndefined:false,...(role==="bytes"||role==="plaintext"?{bytes:[...Buffer.from(chunk.dataBase64,"base64")]}:{}),...(role==="plaintext"?{plaintext:chunk.plaintext}:{})};progress.accept(role,reply(value));}}
 const project={uuid:projectUuid,branchUuid,isOpening:true,isReady:false,cacheName:`project_${projectUuid}_v6`,localCacheName:`localProject_${projectUuid}_v1`};progress.accept("parsed",reply({project,historyUuid,histories:data.parsedHistories}));progress.accept("ready",reply({project:{...project,isOpening:false,isReady:true},histories:data.parsedHistories}));assert.equal(progress.status().complete,true);assert.equal(progress.status().comparedNativeBodies,3);assert.equal(progress.status().completeProducerFrontierVerified,false);
});
void test("a foreign plaintext or unexpected parser/fallback stage is consumed as refusal",async()=>{
 const{data}=await fixture(1);const chunk=data.chunks[0];assert.ok(chunk!==undefined);
 for(const fault of["plaintext","cipher","fallback"]as const){const p=new CurrentFootprintInverseColdLoadProgress(data);begin(p,data);for(const role of["fetchEntry","response"]as const){p.accept(role,reply({history:data.histories[0],url:chunk.fetchUrl,snapshot:true,debugUndefined:false}));}const bytes=[...Buffer.from(chunk.dataBase64,"base64")];
 if(fault==="cipher"){assert.throws(()=>{p.accept("bytes",reply({history:data.histories[0],url:chunk.fetchUrl,snapshot:true,debugUndefined:false,bytes:[((bytes[0]??0)+1)%256,...bytes.slice(1)]}));});}else{p.accept("bytes",reply({history:data.histories[0],url:chunk.fetchUrl,snapshot:true,debugUndefined:false,bytes}));assert.throws(()=>{p.accept(fault==="fallback"?"fallback":"plaintext",reply({history:data.histories[0],url:chunk.fetchUrl,snapshot:true,debugUndefined:false,bytes,plaintext:"foreign"}));});}assert.equal(p.status().failed,true);assert.throws(()=>{p.accept("plaintext",reply({}));});}
});
void test("own inverse cold codebook has no resume or cache-constructor transfer and derives the eight-chunk ceiling",()=>{
 const cases=currentFootprintInverseColdLoadCases();assert.ok(cases.length>30);const order=currentFootprintInverseColdLoadArmOrder();assert.equal(order.length,22);assert.equal(order[0],"inverse-cold-intrinsic-bytesConstructors");assert.equal(currentFootprintInverseColdLoadBudget(1).arm,25);assert.equal(currentFootprintInverseColdLoadBudget(8).normal,222);assert.equal(currentFootprintInverseColdLoadBudget(8).continuation,0);assert.throws(()=>currentFootprintInverseColdLoadBudget(9));
 for(const command of cases){const wire=currentFootprintInverseColdLoadWire(command,73,"original_worker");const native=currentFootprintInverseColdLoadNativeFrame(Buffer.from(`${JSON.stringify(wire)}\0`),command,"original_worker");assert.equal(native["action"],"footprint-inverse-cold");assert.throws(()=>validateCurrentFootprintInverseColdLoadCommand({...command,method:"Debugger.resume",params:{}}));assert.throws(()=>currentFootprintInverseColdLoadNativeFrame(Buffer.from(`${JSON.stringify({...wire,sessionId:"copied"})}\0`),command,"original_worker"));}
});

void test("single inverse event classification binds exact armed ID, session and function/source locations",()=>{
 const points=Object.freeze(Object.keys(SITES).map((role,index)=>{const parsed=z.enum(["branch","cold","histories","fetchEntry","response","bytes","plaintext","parsed","ready","warm","pending","fallback","failed"]).parse(role);return Object.freeze({role:parsed,id:`original-${String(index)}`});}));
 const site=SITES.branch;const location={scriptId:"original-script",lineNumber:site.lineNumber,columnNumber:site.columnNumber};const fn={scriptId:"original-script",lineNumber:site.functionLine,columnNumber:site.functionColumn};
 const event={method:"Debugger.paused",sessionId:"original-session",params:{reason:"other",hitBreakpoints:[points[0]?.id],callFrames:[{callFrameId:"original-frame",functionName:site.functionName,location,functionLocation:fn}]}};
 assert.equal(classifyCurrentFootprintInverseColdPause(event,"original-session","original-script",points),"branch");
 for(const changed of[{...event,sessionId:"copied"},{...event,params:{...event.params,hitBreakpoints:["copied"]}},{...event,params:{...event.params,hitBreakpoints:[points[0]?.id,points[1]?.id]}},{...event,params:{...event.params,callFrames:[{...event.params.callFrames[0],functionLocation:{...fn,columnNumber:fn.columnNumber+1}}]}}]){assert.throws(()=>classifyCurrentFootprintInverseColdPause(changed,"original-session","original-script",points));}
 assert.throws(()=>classifyCurrentFootprintInverseColdPause(event,"original-session","original-script",points.map(point=>({role:point.role,id:"alias"}))));
});
