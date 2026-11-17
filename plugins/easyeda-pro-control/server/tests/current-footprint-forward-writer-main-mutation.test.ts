/* oxlint-disable import/max-dependencies -- One inert fixture compares the actual fixed SQL selectors, native ledger, independent decryptor and Inspector event shape. */
/** Inert fixed-program/ledger checks. No app, SQLite or native owner exists. */
import assert from "node:assert/strict";
import { createCipheriv } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { transform } from "esbuild";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { types } from "node:util";
import { createContext, runInContext, runInThisContext } from "node:vm";
import { gzipSync } from "node:zlib";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_ORDER as ORDER, CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_PROGRAM as PROGRAM } from "../src/current-footprint-forward-writer-main-mutation-programs.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_REQUESTS as REQUESTS, currentFootprintForwardWriterMainMutationTemplates, validateCurrentFootprintForwardWriterMainMutationCommand } from "../src/current-footprint-forward-writer-main-mutation-protocol.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_SEQUENCE as SEQUENCE, currentFootprintForwardWriterMainMutationNativeSource, installCurrentFootprintForwardWriterMainMutationNativeSource } from "../src/current-footprint-forward-writer-main-mutation-native.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CAPTURE_PROGRAM as CAPTURE } from "../src/current-selected-file-main-sql-fence-programs.ts";
import { CURRENT_PROJECT_HISTORY_SQL as SQL, currentProjectSelectedHistorySql } from "../src/current-project-history-sql-data.ts";
import { decodeNativeHistoryChunk } from "../src/native-history.ts";

function fixture(patch=""):ReturnType<typeof createContext>{
 const actor={uuid:"c".repeat(32),username:"actor",nickname:"nickname",updateTime:1_700_000_000_123},dataStr="native-source",history="e".repeat(32),key="1".repeat(32);
 const plaintext=`${JSON.stringify({type:"EDIT_HEAD"})}||${JSON.stringify(actor)}|\n${dataStr}`;
 const encrypt=createCipheriv("aes-128-gcm",Buffer.from(key,"hex"),Buffer.from(history,"hex"));
 // oxlint-disable-next-line node/no-sync -- Inert bounded fixture compression, matching the independent native-history reader.
 const cipher=Buffer.concat([encrypt.update(gzipSync(plaintext)),encrypt.final(),encrypt.getAuthTag()]);
 const context=createContext({originalProxy:types.isProxy});
 const appendSql=currentProjectSelectedHistorySql("b".repeat(32),"append");
 runInContext(`
 const actorValue=${JSON.stringify(actor)},SQL=${JSON.stringify(SQL)},history=${JSON.stringify(history)},keyHex=${JSON.stringify(key)},cipherHex=${JSON.stringify(cipher.toString("hex"))},dataBase64=${JSON.stringify(cipher.toString("base64"))};
 let effects=0,getters=0;const forbidden=()=>{effects++;throw Error("app method invoked")};
 class Wrap{};class Sql{queryOne(){forbidden()}}
 const sqlite={Database:Map,Statement:Set},util={types:{isProxy:originalProxy}},path="C:\\\\Synthetic\\\\fixture.eprj2";
 const capture=(${CAPTURE}).call([Wrap,Sql,sqlite,util],path);
 const db=new Map;Object.defineProperty(db,"filename",{value:path});const wrap=Object.assign(new Wrap,{db});
 const sql=Object.assign(new Sql,{db,dbWrap:wrap,path,transactionDepth:1}),plan={projectUuid:"a".repeat(64),branchUuid:"b".repeat(32),path,dataStr:${JSON.stringify(dataStr)}};
 const ctx={db:{}},service={},owner={ctx,service,path},promise=Promise.resolve(sql);ctx.db[path]=promise;
 const controller=[null,[null,null,null,null,null,ctx],plan,owner,service,path,null,null,null,Date,Date.now,null];
 const modify={...actorValue},actor=[null,controller,null,{dataStr:plan.dataStr,modify},modify,null,promise,null,null,actorValue];
 const sqlPacket=[actor,sql,Sql.prototype,db,wrap,Wrap.prototype,Sql.prototype.queryOne],body=${JSON.stringify(plaintext)},input={projectUuid:plan.projectUuid,branchUuid:plan.branchUuid,dataStr:body};
 const key=Uint8Array.from(keyHex.match(/../g).map(value=>parseInt(value,16))),bytes=Uint8Array.from(cipherHex.match(/../g).map(value=>parseInt(value,16)));
 const branch={node:"retained-node",uuid:plan.branchUuid,delete_status:0,history_uuid:"d".repeat(32)};
 const statements={begin:"begin immediate transaction",data:SQL.historyData,head:${JSON.stringify(appendSql)},branch:SQL.branch,commit:SQL.commit,project:SQL.project};
 const argumentsList={begin:[],data:[history,history,dataBase64,dataBase64],head:[history,branch.history_uuid,null,keyHex],branch:[history,plan.branchUuid],commit:[],project:["2026-11-15 03:00:00",actorValue.uuid]};
 const callers={begin:[sql,1],data:[ctx,path,bytes,history,history,"",{},sql,history,dataBase64],head:[ctx,path,input,branch,history,keyHex,{}],branch:[ctx,path,"project",plan.branchUuid,history,plan.projectUuid,sql,{}],commit:[sql,0],project:[ctx,path,plan.projectUuid,{},Date,Date.now]};
 const cipherFrame=[ctx,path,{dataStr:body,uuid:history},true,key,bytes],result={};
 ${patch}
 globalThis.run=(kind)=>{sql.transactionDepth=kind==="commit"||kind==="project"?0:1;const expected={kind,projectUuid:plan.projectUuid,branchUuid:plan.branchUuid,path,priorHistoryUuid:branch.history_uuid,historyUuid:kind==="begin"||kind==="data"?null:history,keyHex:kind==="begin"||kind==="data"?null:keyHex};
  const value=(${PROGRAM}).call([wrap,statements[kind],argumentsList[kind],()=>{},()=>{},sqlite],capture,actor,sqlPacket,callers[kind],kind==="data"?cipherFrame:null,expected);return value;};
 `,context);
 return context;
}
void test("all six exact passive write joins preserve the actual original actor/body/SQL/cipher without invoking methods",async()=>{
 const context=fixture();
 for(const role of ORDER){const value:unknown=runInContext(`run(${JSON.stringify(role)})`,context);assert.ok(value!==null&&typeof value==="object");assert.equal(Reflect.get(value,"kind"),role);
  if(role==="data"){
   const historyUuid:unknown=Reflect.get(value,"historyUuid");const keyHex:unknown=Reflect.get(value,"keyHex");const dataBase64:unknown=Reflect.get(value,"dataBase64");
   assert.equal(typeof historyUuid,"string");assert.equal(typeof keyHex,"string");assert.equal(typeof dataBase64,"string");
   assert.equal(await decodeNativeHistoryChunk({historyUuid:String(historyUuid),keyHex:String(keyHex),dataBase64:String(dataBase64)}),runInContext("body",context));
  }
 }
 assert.equal(runInContext("effects",context),0);assert.equal(runInContext("getters",context),0);
});
void test("wrong selected DB, actor accessor, body, SQL and parameter refuse before any continuation",()=>{
 for(const patch of [
  'wrap.db=new Map;', 'Object.defineProperty(actorValue,"username",{get(){getters++;return "actor"}});',
  'cipherFrame[2].dataStr="foreign";','statements.head+=";delete from projects";','argumentsList.branch[0]="f".repeat(32);',
 ]){
  const context=fixture(patch);assert.throws(()=>{for(const role of ORDER){runInContext(`run(${JSON.stringify(role)})`,context);}});
  assert.equal(runInContext("effects",context),0);assert.equal(runInContext("getters",context),0);
 }
});
void test("closed forty-command ledger and exact eighteen templates do not alter old completion counts",()=>{
 assert.equal(SEQUENCE.length,40);assert.equal(SEQUENCE.filter(phase=>phase==="forward-writer-sql-step").length,9);assert.equal(REQUESTS.normal,40);assert.equal(REQUESTS.events,49);
 const templates=currentFootprintForwardWriterMainMutationTemplates();assert.equal(templates.length,18);assert.equal(new Set(templates.map(row=>row.phase)).size,18);
 assert.ok(Buffer.byteLength(PROGRAM)<16_384);assert.ok(Buffer.byteLength(currentFootprintForwardWriterMainMutationNativeSource())<32_768);
 assert.throws(()=>validateCurrentFootprintForwardWriterMainMutationCommand({phase:"forward-writer-sql-step",method:"Runtime.evaluate",params:{}}));
 const old="internal void SendFixed(string fixedMessage,bool cleanup){\\noriginalMain.RequireCompletionCapacity(mainRequest-(forwardWriterBirth?stockMainRequests:0));\\nif((long)first+EasyedaFootprintCopyMainCompletionProtocol.Requests>\\nid!=mainCompletionFirst+mainCompletionNormal+mainCompletionCleanup||\nmainRequest+1==mainCompletionFirst+EasyedaFootprintCopyMainCompletionProtocol.Requests;";
 const installed=installCurrentFootprintForwardWriterMainMutationNativeSource(old);assert.ok(installed.includes("forwardWriterSqlStep==40&&forwardWriterSqlCompletionOffset==37"));assert.ok(installed.includes("mainCompletionCleanup+forwardWriterSqlCompletionOffset||"));
 assert.throws(()=>installCurrentFootprintForwardWriterMainMutationNativeSource(installed));
});
void test("actual Node Inspector reports both original line and function-call points in the same held driver event",async()=>{
 const session=new Session();session.connect();

 // oxlint-disable-next-line typescript/unbound-method -- Reflect.apply supplies this exact original Session as receiver; the Promise API lacks the function-call-breakpoint overload.
 const post=async(method:string,params:object={}):Promise<unknown>=>{const pending:unknown=Reflect.apply(session.post,session,[method,params]);assert.ok(pending instanceof Promise);const value:unknown=await pending;return value;};
 const events:unknown[]=[];const resumes:Promise<void>[]=[];
 session.on("Debugger.paused",event=>{events.push(event.params);resumes.push(session.post("Debugger.resume"));});
 try{
  await post("Runtime.enable");await post("Debugger.enable");
  const compiled=await post("Runtime.compileScript",{expression:"globalThis.inertSqlDual=function inertSqlDual(x){return x+1};",sourceURL:"inert-dual.js",persistScript:true});
  assert.ok(compiled!==null&&typeof compiled==="object");const scriptId:unknown=Reflect.get(compiled,"scriptId");assert.ok(typeof scriptId==="string");
  await post("Runtime.runScript",{scriptId});const functionReply=await post("Runtime.evaluate",{expression:"inertSqlDual"});
  assert.ok(functionReply!==null&&typeof functionReply==="object");const remote:unknown=Reflect.get(functionReply,"result");assert.ok(remote!==null&&typeof remote==="object");
  const line=await post("Debugger.setBreakpoint",{location:{scriptId,lineNumber:0,columnNumber:47}});
  const objectId:unknown=Reflect.get(remote,"objectId");assert.ok(typeof objectId==="string");const call=await post("Debugger.setBreakpointOnFunctionCall",{objectId});
  await post("Runtime.evaluate",{expression:"inertSqlDual(1)"});
  await Promise.all(resumes);assert.equal(events.length,1);const event=events[0];assert.ok(event!==null&&typeof event==="object");assert.ok(line!==null&&typeof line==="object"&&call!==null&&typeof call==="object");
  assert.deepEqual(Reflect.get(event,"hitBreakpoints"),[Reflect.get(line,"breakpointId"),Reflect.get(call,"breakpointId")]);
 }finally{session.disconnect();Reflect.deleteProperty(globalThis,"inertSqlDual");}
});

function sqlEventPause(ids:readonly string[],read=false):unknown{return ({reason:"other",hitBreakpoints:ids,callFrames:[{callFrameId:"frame123",functionName:"",location:{scriptId:"app",lineNumber:read?1025:1164,columnNumber:read?700:2453},functionLocation:{scriptId:"app",lineNumber:read?1025:1164,columnNumber:read?692:2434}}]});}
async function sqlBackendProbeFixture():Promise<()=>Readonly<{call:(method:string,input?:unknown)=>unknown}>>{
 const path=new URL("../src/current-footprint-copy-main-backend-runner.ts",import.meta.url);const originalRequire=createRequire(path);const capability=Object.freeze({});
 const injected=`#sqlEventTestMode=false;#sqlEventTestNext:unknown=null;#sqlEventTestResumes=0;
 public sqlEventProbeForTest(capability:CurrentFootprintForwardWriterMainCapability,method:string,input:unknown):unknown{
  if(method==="setup"){this.#originActive=true;this.#originCapability=capability;this.#appScriptId="app";this.#scripts.set("app",1);this.#sqlBreakpoints.set("sql-driver","driver");this.#sqlBreakpoints.set("sql-read","queryOne");this.#originBreakpoints.add("original-driver");}
  else if(method==="enable-resume"){this.#sqlEventTestMode=true;this.#sqlCapture="capture123";this.#originToken=capability as unknown as MainRequestOrigin;}
  else if(method==="resume-batch"){this.#sqlEventTestNext=input;return this.#forwardWriterSqlHost().resume();}
  else if(method==="inspect"){}
  else if(method==="intent"){if(this.#forwardWriterSqlPause===null)throw Error("missing original pause");this.#forwardWriterSqlPause.identity.resumeAttempted=true;}
  else this.#event(method,input);
  return{events:this.#originEvents,rawDriver:this.#forwardWriterSqlDriverEvent,sqlPause:this.#forwardWriterSqlPause?.identity,sqlHeld:this.#sqlHeld,resumes:this.#sqlEventTestResumes};
 }
 public retained():`;
 const originalText=await readFile(path,"utf8");let source=originalText.replace("public retained():",injected);
 // Only qualification/native-request collaborators are inert in this isolated
 // Transformed class. The actual SQL host resume and #event bodies stay intact.
 const current="  #forwardWriterSqlCurrent(): void {",origin="  async #originCurrent(token: MainRequestOrigin): Promise<void> {",request="    cleanup = false, retainAllocationReply?: (reply: unknown) => void): Promise<unknown> {";
 for(const anchor of [current,origin,request]){assert.equal(source.split(anchor).length,2);}
 source=source.replace(current,`${current}if(this.#sqlEventTestMode){return;}`).replace(origin,`${origin}if(this.#sqlEventTestMode){await this.#transport.assertCurrent();return;}`).replace(request,`${request}
  if(this.#sqlEventTestMode){if(input.phase!=="forward-writer-sql-step"||input.method!=="Debugger.resume"||this.#sqlEventTestNext===null)throw Error("unexpected inert SQL request");this.#sqlEventTestResumes+=1;this.#event("Debugger.resumed",{});this.#event("Debugger.paused",this.#sqlEventTestNext);this.#sqlEventTestNext=null;return{};}`);
 const output=await transform(source,{loader:"ts",format:"cjs",target:"node24"});
 const loaded={exports:{}};const evaluate:unknown=runInThisContext(`(function(require,module,exports){${output.code}\n})`);assert.ok(typeof evaluate==="function");
 Reflect.apply(evaluate,undefined,[(specifier:string):unknown=>{
  if(specifier==="./current-footprint-forward-writer-main-capability.ts"){const original:unknown=originalRequire(specifier);assert.ok(original!==null&&typeof original==="object");return{...original,isCurrentFootprintForwardWriterMainCapability:(value:unknown):boolean=>value===capability};}
  return originalRequire(specifier) as unknown;
 },loaded,loaded.exports]);
 const Constructor:unknown=Reflect.get(loaded.exports,"CurrentFootprintCopyMainBackendRunner");assert.ok(typeof Constructor==="function");
 const make=():Readonly<{call:(method:string,input?:unknown)=>unknown}>=>{
  const transport=Object.freeze({assertCurrent:():Promise<void>=>Promise.resolve(),send:():never=>{throw new Error("no native send");},poll:():never=>{throw new Error("no native poll");}});
  const runner:unknown=Reflect.construct(Constructor,[transport]);assert.ok(runner!==null&&typeof runner==="object");const probe:unknown=Reflect.get(runner,"sqlEventProbeForTest");assert.ok(typeof probe==="function");
  const call=(method:string,input:unknown={}):unknown=>Reflect.apply(probe,runner,[capability,method,input]);call("setup");return{call};
 };

 return make;
}
void test("actual Backend hides only its own selected read pause and retains both original driver point IDs",async()=>{
 const make=await sqlBackendProbeFixture();
 const driver=make(),raw=driver.call("Debugger.paused",sqlEventPause(["sql-driver","original-driver"]));assert.ok(raw!==null&&typeof raw==="object");
 assert.deepEqual(Reflect.get(raw,"rawDriver"),sqlEventPause(["sql-driver","original-driver"]));
 const events:unknown=Reflect.get(raw,"events");assert.ok(Array.isArray(events));assert.equal(events.length,1);assert.deepEqual(Reflect.get(events[0],"params"),sqlEventPause(["original-driver"]));
 assert.throws(()=>make().call("Debugger.paused",sqlEventPause(["sql-driver","original-driver","foreign"])));
 assert.throws(()=>make().call("Debugger.paused",sqlEventPause(["sql-read","original-driver"],true)));
 const read=make();const held=read.call("Debugger.paused",sqlEventPause(["sql-read"],true));assert.ok(held!==null&&typeof held==="object");assert.deepEqual(Reflect.get(held,"events"),[]);
 assert.throws(()=>read.call("Debugger.resumed"));
 const valid=make();valid.call("Debugger.paused",sqlEventPause(["sql-read"],true));valid.call("intent");const resumed=valid.call("Debugger.resumed");assert.ok(resumed!==null&&typeof resumed==="object");
 const sqlPause:unknown=Reflect.get(resumed,"sqlPause");assert.ok(sqlPause!==null&&typeof sqlPause==="object");assert.equal(Reflect.get(sqlPause,"resumed"),true);assert.deepEqual(Reflect.get(resumed,"events"),[]);
});

void test("actual Backend retains the next SQL pause when resumed and paused arrive in one batch",async()=>{
 const make=await sqlBackendProbeFixture(),runner=make();runner.call("Debugger.paused",sqlEventPause(["sql-read"],true));
 const before=runner.call("inspect");assert.ok(before!==null&&typeof before==="object");const original:unknown=Reflect.get(before,"sqlPause");assert.ok(original!==null&&typeof original==="object");
 runner.call("enable-resume");const pending=runner.call("resume-batch",sqlEventPause(["sql-read"],true));assert.ok(pending instanceof Promise);await pending;
 const after=runner.call("inspect");assert.ok(after!==null&&typeof after==="object");const next:unknown=Reflect.get(after,"sqlPause");assert.ok(next!==null&&typeof next==="object");assert.notEqual(next,original);
 assert.equal(Reflect.get(original,"resumed"),true);assert.equal(Reflect.get(next,"resumed"),false);assert.equal(Reflect.get(next,"resumeAttempted"),false);assert.equal(Reflect.get(after,"sqlHeld"),next);assert.equal(Reflect.get(after,"resumes"),1);assert.deepEqual(Reflect.get(after,"events"),[]);
});
