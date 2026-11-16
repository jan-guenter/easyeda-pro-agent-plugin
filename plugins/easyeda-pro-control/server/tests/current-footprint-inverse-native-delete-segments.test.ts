/* oxlint-disable import/max-dependencies -- Direct fixed-program, wire, source, native and original-controller boundary regressions. */
/** Inert descriptor/source fixtures; these do not issue an original Core
 * receipt or authorize an application upload. */
import assert from"node:assert/strict";
import{test}from"node:test";
import{z}from"zod";
import{Session}from"node:inspector/promises";
import{currentFootprintInverseLookupNativeCallable as nativeCallable,qualifyCurrentFootprintInverseLookupNativeConstructor as nativeConstructor}from"../src/current-footprint-inverse-lookup-native-metadata.ts";
import type{Runtime}from"node:inspector";
import{Script,createContext,runInContext}from"node:vm";
import{createHash}from"node:crypto";
import{gunzipSync}from"node:zlib";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SEGMENTS_PROGRAMS as PROGRAMS,currentFootprintInverseNativeDeleteSegmentsMetadata as metadata}from"../src/current-footprint-inverse-native-delete-segments-programs.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SEGMENTS_REQUESTS as BUDGET,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SEGMENTS_FLAGS as FLAGS,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SEGMENTS_ORDER as ORDER,currentFootprintInverseNativeDeleteSegmentsKey as caseKey,currentFootprintInverseNativeDeleteSegmentsCases as cases,currentFootprintInverseNativeDeleteSegmentsNativeFrame as frame,currentFootprintInverseNativeDeleteSegmentsTemplate as template,validateCurrentFootprintInverseNativeDeleteSegmentsCommand as validate,currentFootprintInverseNativeDeleteSegmentsWire as wire}from"../src/current-footprint-inverse-native-delete-segments-protocol.ts";
import{CurrentFootprintInverseNativeDeleteSegmentsController as Controller,assertOriginalCurrentFootprintInverseNativeDeleteSegmentsController as originalController}from"../src/current-footprint-inverse-native-delete-segments-controller.ts";
import{currentFootprintInverseNativeDeleteSegmentsNativeSource as native}from"../src/current-footprint-inverse-native-delete-segments-native.ts";
import{currentFootprintInverseNativeDeleteMainReadLedger as ledger}from"../src/current-footprint-inverse-native-delete-main-read-ledger.ts";
import{currentFootprintInverseNativeDeleteFlowCases as flowCases,currentFootprintInverseNativeDeleteFlowTemplate as flowTemplate}from"../src/current-footprint-inverse-native-delete-flow-protocol.ts";
import{INSTALLED_EASYEDA_SOURCE_SKIP_REASON,readConfiguredEasyedaAssets}from"./helpers/installed-easyeda-source.ts";

function fixture(name="inert-delete-segments"):ReturnType<typeof createContext>{
 const c=createContext({},{name});
 runInContext(`
 let called=0;const invokeApp=()=>{called++;throw Error("must not invoke app")};
 class Gd{getFlowParse(){return invokeApp()}applySnap(){return invokeApp()}getLastHistoryUuid(){return invokeApp()}}
 class Lg extends Gd{};class Manager{flowParseFull(){return invokeApp()}}
 const project=new Lg,index=[{num:1,docIds:[["a".repeat(16)],["b".repeat(32)]]},{num:0,docIds:[["c".repeat(16)]]}];
 project.historyIndex=index;project.consistencyManager=new Manager;
 for(const key of["notSyncCloud","pendingSyncCloud","isSyncing","isUploadingCloud","isTemporary","isHistoryBack","_isV2Format"])project[key]=false;
 for(const key of["task1","publishTask","task3","cachePromise","syncPendingNodeUuids","confirmedEmptyNodeUuids","warnedEmptyNodeUuids"])project[key]=new Set;
 project.bufferUploadData=new Map;project.bufferUploadCache=new Map;globalThis.PROJECT=project;
 const initial=[project,null,null,null,index,()=>true,null,null,null,null,null,null,null,null,null,null];
 const module=[project,invokeApp,invokeApp,invokeApp,invokeApp,invokeApp,invokeApp,invokeApp,invokeApp,invokeApp];
 const publication=Array.from({length:49},()=>null);publication[0]=project;publication[15]=Lg.prototype;publication[48]=()=>true;
 const reflection=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis];
 const nativeMap=Map;const captured=(${PROGRAMS.capture}).call(reflection,initial,module,publication,nativeMap,2);
 `,c);return c;
}
void test("old-segment receipt inspects complete dense IDs and empty pending queues without app calls",()=>{
 const good=fixture();assert.equal(runInContext(`(${PROGRAMS.reprove}).call(reflection,captured,2)`,good),true);assert.equal(runInContext("called",good),0);
 for(const change of[
 'index[0].docIds[0]=[]','index[0].docIds[1][0]="foreign"','delete index[0].docIds[1]','index[1].snapshot={}','index[0].docIds.push(["a".repeat(16)])',
 'project.pendingSyncCloud=true','project.isUploadingCloud=true','project.cachePromise.add(Promise.resolve())','project.bufferUploadData.set("a","pending")',
 'initial[4]=[]','publication[15]={}','module[1]=()=>{}','Gd.prototype.getFlowParse=()=>{}','project.getFlowParse=()=>{}',
 'globalThis.Map=new Proxy(Map,{getOwnPropertyDescriptor(){called++;throw Error("proxy constructor")}})',
 'Object.defineProperty(Map.prototype,"size",{get(){called++;return 0}})',
 'project.bufferUploadCache=new Proxy(new Map,{getPrototypeOf(){called++;throw Error("proxy")},ownKeys(){called++;throw Error("proxy")}})',
 'project.publishTask=new Proxy(new Set,{getPrototypeOf(){called++;throw Error("proxy")},ownKeys(){called++;throw Error("proxy")}})'
 ]){
  const c=fixture();runInContext(change,c);assert.throws(()=>runInContext(`(${PROGRAMS.reprove}).call(reflection,captured,2)`,c),change);assert.equal(runInContext("called",c),0);
 }
 const getter=fixture();runInContext('Object.defineProperty(project,"pendingSyncCloud",{get(){called++;return false}})',getter);
 assert.throws(()=>runInContext(`(${PROGRAMS.capture}).call(reflection,initial,module,publication,nativeMap,2)`,getter));assert.equal(runInContext("called",getter),0);
 const oversized=fixture();runInContext('index[0].docIds[0]=Array.from({length:257},()=>"a".repeat(16))',oversized);
 assert.throws(()=>runInContext(`(${PROGRAMS.capture}).call(reflection,initial,module,publication,nativeMap,2)`,oversized));
});
void test("actual Inspector accepts both passive segment programs with throwOnSideEffect",async()=>{
 const session=new Session();session.connect();let contextId:number|null=null;
 session.on("Runtime.executionContextCreated",e=>{if(e.params.context.name==="inert-delete-segments-inspector"){contextId=e.params.context.id;}});
 try{
  await session.post("Runtime.enable");await session.post("Debugger.enable");const c=fixture("inert-delete-segments-inspector");assert.ok(contextId!==null);
  const handles=new Map<string,string>();for(const expression of["reflection","initial","module","publication","nativeMap","captured"]){const r=await session.post("Runtime.evaluate",{expression,contextId,objectGroup:"inert-segments-test",silent:true});assert.ok(r.result.objectId!==undefined);handles.set(expression,r.result.objectId);}
  const required=(key:string):string=>{const id=handles.get(key);assert.ok(id!==undefined);return id;};
  const selected=await session.post("Runtime.callFunctionOn",{...FLAGS,objectId:required("reflection"),functionDeclaration:PROGRAMS.native,arguments:[],returnByValue:false});const map=nativeCallable(selected.result,"Map");nativeConstructor(await session.post("Runtime.getProperties",{objectId:map,ownProperties:true}),selected.result,"Map");
  const capture:Runtime.CallFunctionOnParameterType&Readonly<{throwOnSideEffect:true}>={...FLAGS,objectId:required("reflection"),functionDeclaration:PROGRAMS.capture,arguments:[...["initial","module","publication"].map(k=>({objectId:required(k)})),{objectId:map},{value:2}],returnByValue:false};
  const first=await session.post("Runtime.callFunctionOn",capture);assert.equal(first.exceptionDetails,undefined);assert.equal(first.result.description,"Array(6)");
  const reprove:Runtime.CallFunctionOnParameterType&Readonly<{throwOnSideEffect:true}>={...FLAGS,objectId:required("reflection"),functionDeclaration:PROGRAMS.reprove,arguments:[{objectId:required("captured")},{value:2}],returnByValue:true};
  const final=await session.post("Runtime.callFunctionOn",reprove);assert.equal(final.exceptionDetails,undefined);assert.equal(final.result.value,true);assert.equal(runInContext("called",c),0);
  runInContext('globalThis.Map=new Proxy(Map,{getOwnPropertyDescriptor(){called++;throw Error("must not inspect proxy")}})',c);
  const proxy=await session.post("Runtime.callFunctionOn",{...FLAGS,objectId:required("reflection"),functionDeclaration:PROGRAMS.native,arguments:[],returnByValue:false});assert.equal(proxy.exceptionDetails,undefined);assert.throws(()=>nativeCallable(proxy.result,"Map"));assert.equal(runInContext("called",c),0);
 }finally{session.disconnect();}
});
void test("segment codebook restores26 exact commands under unchanged table bounds and never resumes",()=>{
 const all=cases(),byKey=new Map(all.map(c=>[caseKey(c),c]));assert.equal(byKey.size,26);assert.equal(ORDER.length,26);
 const source=native();const m=/EasyedaDiagnosticFixedTable\.Load\(@"([A-Za-z0-9+/=]+)",(\d+),@"([a-f0-9]{64})",@"([a-f0-9]{64})",26,4\)/u.exec(source);assert.ok(m!==null);
 const packed=Buffer.from(m[1]??"","base64");assert.equal(createHash("sha256").update(packed).digest("hex"),m[4]);
 // oxlint-disable-next-line node/no-sync -- Independently restore the fixed immutable native codebook.
 const raw=gunzipSync(packed,{maxOutputLength:60_000});assert.equal(raw.length,Number(m[2]));assert.equal(createHash("sha256").update(raw).digest("hex"),m[3]);
 const rows=raw.toString("utf8").split("\0");assert.equal(rows.length,26);
 for(const[index,c]of all.entries()){
  const t=template(c);assert.equal(rows[index],[t.key,t.method,t.names.join(","),t.template].join("\t"));assert.notEqual(c.method,"Debugger.resume");
  const bytes=Buffer.from(`${JSON.stringify(wire(c,79,"original_session"))}\0`);assert.equal(frame(bytes,c,"original_session")["action"],"footprint-inverse-native-delete-segments");assert.throws(()=>frame(bytes,c,"other_session"));
 }
 assert.ok(ORDER.every(k=>byKey.has(k)));assert.deepEqual(BUDGET,{normal:22,helpers:4,cdpRequests:26,events:4,controls:28,resumes:0});
 for(const p of Object.values(PROGRAMS)){assert.ok(new Script(`(${p})`) instanceof Script);}
 const capture=all.find(c=>c.phase==="inverse-native-delete-segments-capture");assert.ok(capture!==undefined&&capture.phase==="inverse-native-delete-segments-capture");
 assert.throws(()=>validate({...capture,params:{...capture.params,functionDeclaration:"function(){return true}"}}));assert.throws(()=>validate({...capture,params:{...capture.params,throwOnSideEffect:false}}));
 assert.throws(()=>validate({...capture,params:{...capture.params,arguments:[{objectId:"initial"},{objectId:"module"},{objectId:"publication"},{objectId:"nativeMap"},{value:8}]}}));
 assert.throws(()=>wire(capture,2_147_483_648,"original_session"));assert.throws(()=>validate({...capture,extra:true}));
});
void test("V3 upload guard derives the one original ingress key and leaves worker readiness without any setter",()=>{
 const c=flowCases().filter(row=>row.phase==="inverse-native-delete-flow"&&row.kind==="local"&&row.command.method==="Debugger.resume"&&row.command.role==="localIngress");assert.equal(c.length,1);const first=c[0];assert.ok(first!==undefined);
 const source=ledger(1024);assert.ok(source.includes(`phase==@"${flowTemplate(first).key}"`));assert.match(source,/bool dnwtReady=false;/u);assert.doesNotMatch(source,/dnwtReady\s*=\s*true/u);assert.match(source,/!dnmrPrearmed\|\|!dsgReady\|\|!dnwtReady/u);
 assert.throws(()=>ledger(77));assert.throws(()=>ledger(4097));
});
void test("segment callee metadata qualifies the complete installed source and the actual standalone parser location",async t=>{
 const sources=await readConfiguredEasyedaAssets(["pro-mgr/3.2.185.bf63a159/js/project-worker.js"]);if(sources===null){t.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}const source=sources[0];assert.ok(source!==undefined);const rows=metadata(source);assert.equal(rows.length,13);assert.throws(()=>metadata(`${source} `));
 const parser=rows[12];assert.ok(parser!==undefined);assert.equal(parser.name,"flowParseFull");assert.equal(parser.arity,0);
 const offset=source.split("\n").slice(0,parser.lineNumber).reduce((n,line)=>n+line.length+1,0)+parser.columnNumber-parser.source.indexOf("(");
 const prefix=source.slice(0,offset-2).replaceAll(/[^\n]/gu," ");const body=`${prefix}({${parser.source}})`;
 const session=new Session();session.connect();
 try{await session.post("Runtime.enable");await session.post("Debugger.enable");const r=await session.post("Runtime.evaluate",{expression:body,objectGroup:"inert-source-parser",silent:true});assert.equal(r.exceptionDetails,undefined);assert.ok(r.result.objectId!==undefined);
  const properties=await session.post("Runtime.getProperties",{objectId:r.result.objectId,ownProperties:true});const method=properties.result.find(p=>p.name==="flowParseFull");assert.ok(method?.value?.objectId!==undefined);
  const details=await session.post("Runtime.getProperties",{objectId:method.value.objectId,ownProperties:true});const location:unknown=details.internalProperties?.find(p=>p.name==="[[FunctionLocation]]")?.value?.value;assert.ok(location!==null&&typeof location==="object");
  assert.deepEqual(z.object({lineNumber:z.number().int(),columnNumber:z.number().int()}).parse(location),{lineNumber:parser.lineNumber,columnNumber:parser.columnNumber});
 }finally{session.disconnect();}
});

void test("original segment cleanup joins an in-flight bind before returning and issues no further CDP",async t=>{
 const sources=await readConfiguredEasyedaAssets(["pro-mgr/3.2.185.bf63a159/js/project-worker.js"]);if(sources===null){t.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}const source=sources[0];assert.ok(source!==undefined);
 const bind=Promise.withResolvers<null>();let controls=0,exited=false,exits=0,sends=0,settled=false;const cutoff=new Error("original exited");
 const controller=new Controller({source,scriptId:"script1",sessionId:"worker1",contextId:1,frame:"frame1",intrinsics:"intrinsics1",initialCapture:"initial1",publicationCapture:"publication1",headCount:2,
  current:():void=>{if(exited){throw cutoff;}},assertOriginalHeld:():void=>{assert.equal(exited,false);},assertOriginalExit:():void=>{assert.equal(exited,true);exits+=1;},
  assertOriginalEvent:():void=>{throw new Error("no event");},send:():Promise<unknown>=>{sends+=1;throw new Error("no send");},control:async(phase):Promise<void>=>{assert.equal(phase,"bind");controls+=1;await bind.promise;}
 });
 originalController(controller);assert.throws(()=>Reflect.apply(originalController,undefined,[Object.freeze(Object.create(Controller.prototype))]));
 const pending=controller.start();const expected=(async():Promise<void>=>{try{await pending;assert.fail("pending bind must refuse after exit");}catch(error){assert.equal(error,cutoff);}})();assert.equal(controls,1);exited=true;
 const cleanup=(async():Promise<void>=>{await controller.settleAfterOriginalExit();settled=true;})();await Promise.resolve();assert.equal(settled,false);assert.equal(sends,0);
 bind.resolve(null);await expected;await cleanup;assert.equal(settled,true);assert.equal(exits,2);assert.equal(sends,0);assert.equal(controls,1);
});
