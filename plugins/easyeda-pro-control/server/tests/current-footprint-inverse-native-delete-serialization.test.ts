/* oxlint-disable import/max-dependencies -- Actual source sites, byte restoration and mutable descriptor guards are the direct regression subjects. */
/** Inert source/descriptor checks; no native owner or upload is allocated. */
import assert from "node:assert/strict";
import{access}from"node:fs/promises";
import {CURRENT_PROJECT_SAVE_PRODUCER_GUARD_SITES as GUARDS} from "../src/current-project-save-producer-guard-source.ts";
import {currentFootprintInverseNativeDeleteSerializationPause as paused} from "../src/current-footprint-inverse-native-delete-serialization-replies.ts";
import {test} from "node:test";
import {execFile} from "node:child_process";
import {promisify} from "node:util";
import {fileURLToPath} from "node:url";
import {z} from "zod";
import vm from "node:vm";
import {Session} from "node:inspector/promises";
import type {Debugger} from "node:inspector/promises";
import {createHash} from "node:crypto";
import {gunzipSync} from "node:zlib";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_INTRINSICS as INTRINSICS, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_PROGRAMS as PROGRAMS} from "../src/current-footprint-inverse-native-delete-serialization-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_BEGIN as BEGIN,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_SITES as SITES} from "../src/current-footprint-inverse-native-delete-serialization-profile.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_ORDER as ORDER,currentFootprintInverseNativeDeleteSerializationCases as cases,currentFootprintInverseNativeDeleteSerializationNativeFrame as frame,currentFootprintInverseNativeDeleteSerializationTemplate as template,validateCurrentFootprintInverseNativeDeleteSerializationCommand as validate,currentFootprintInverseNativeDeleteSerializationWire as wire} from "../src/current-footprint-inverse-native-delete-serialization-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_DISPATCH as DISPATCH,currentFootprintInverseNativeDeleteSerializationNativeSource as native} from "../src/current-footprint-inverse-native-delete-serialization-native.ts";
import {CURRENT_FOOTPRINT_INVERSE_DELETE_CALLEES as CALLEES,qualifyCurrentFootprintInverseDeleteBindingSource as qualify} from "../src/current-footprint-inverse-delete-binding-source.ts";
import {CURRENT_FOOTPRINT_INVERSE_DELETE_ENCODER_CLASSES as CLASSES} from "../src/current-footprint-inverse-delete-encoder-source.ts";
import {prepareCurrentFootprintDeletePlan as plan} from "../src/current-footprint-delete-plan.ts";
import {INSTALLED_EASYEDA_SOURCE_SKIP_REASON,readConfiguredEasyedaAssets} from "./helpers/installed-easyeda-source.ts";

function setup(source:string):vm.Context{
 const context=vm.createContext({});
 const fragment=(key:string):string=>{const r=CALLEES.find(row=>row.key===key);assert.ok(r!==undefined);return source.slice(r.start,r.end);};
 const constructors=CLASSES.toSorted((a,b)=>a.start-b.start).map(r=>`const ${r.name}=${source.slice(r.start,r.end)};`).join("\n");
 const e={projectUuid:"a".repeat(64),branchUuid:"b".repeat(32),targetUuid:"c".repeat(16),client:"d".repeat(16),maximumTicket:7,documentClock:9};
 const body=plan({targetUuid:e.targetUuid,client:e.client,maximumTicketBeforeClock:7,maximumTicketAfterClock:7,documentClock:9,managerUserAbsent:true,editorVersion:"3.2.209"}).workerUpload;
 const texts=body.split("|\n");assert.equal(texts.length,2);
 vm.runInContext(`"use strict";${constructors}
 const xt=${fragment("xt")},$e=${fragment("$e")},Ie="|\\n";globalThis.self=globalThis;globalThis.PRO_EDITOR_VERSION="3.2.209";
 async function qe(){throw Error("inert-clock-must-not-run");}
 class Pi{${fragment("get maxTicket")} ${fragment("get newTicket")}}class ar extends Pi{}class Tg extends ar{${fragment("deleteData")} ${fragment("deleteString")}}
 class zy{}class Vc extends zy{${fragment("getMaxTicket")} ${fragment("setMaxTicket")}}class ja extends Vc{}class Gd{${fragment("uploadLocal")}}class Lg extends Gd{}
 const consistency=Object.assign(Object.create(ja.prototype),{maxTicket:7,client:${JSON.stringify(e.client)}});
 const project=Object.assign(Object.create(Lg.prototype),{uuid:${JSON.stringify(e.projectUuid)},_branchUuid:${JSON.stringify(e.branchUuid)},consistencyManager:consistency});
 const manager=Object.assign(Object.create(Tg.prototype),{projectManager:project,client:${JSON.stringify(e.client)},user:undefined});project.footprint=manager;globalThis.PROJECT=project;
 const functions=Array.from({length:28},()=>function(){});for(const [i,f]of[[0,Tg],[1,ar],[2,Pi],[3,ja],[4,Vc],[5,zy],[6,Lg],[7,Gd],[11,Ke],[12,rl],[13,of],[14,Tg.prototype.deleteData],[15,Tg.prototype.deleteString],[18,Vc.prototype.getMaxTicket],[19,Vc.prototype.setMaxTicket],[20,Gd.prototype.uploadLocal],[21,Object.getOwnPropertyDescriptor(Pi.prototype,"maxTicket").get],[22,Object.getOwnPropertyDescriptor(Pi.prototype,"newTicket").get],[23,qe],[24,xt],[25,$e],[26,of.prototype.head],[27,of.prototype.delete]])functions[i]=f;
 const value=new Ke(),rows=[],expected=${JSON.stringify(e)},texts=${JSON.stringify([...texts,body])};
 const guard=()=>consistency.maxTicket===7&&rows.length===0;
 const ready=[functions,[project,{},manager,consistency,{},expected.client,7,expected.targetUuid,{}],guard,{}],encoder=[${CLASSES.map(r=>r.name).join(",")},()=>true],instance=[ready,encoder,value,rows,guard],accepted=[instance,{},{}];
 const first=[manager,expected.targetUuid,value,rows,9,qe,Ke,xt,$e,Ie,JSON,String];
 const prelude=[Array.prototype.push,Array.prototype.join,JSON.stringify,String,Promise,Promise.prototype.then,function(){return this},()=>true];
 const bundle=(${PROGRAMS.begin}).call(first,accepted,expected,texts,prelude);
 `,context);
 return context;
}
void test("original serialization sites are actual breakable locations in the complete qualified worker",async context=>{
 const sources=await readConfiguredEasyedaAssets(["pro-mgr/3.2.185.bf63a159/js/project-worker.js"]);if(sources===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}const source=sources[0];assert.ok(source!==undefined);qualify(source);
 for(const p of Object.values(PROGRAMS)){assert.doesNotThrow(()=>new vm.Script(`(${p})`));}
 const session=new Session();session.connect();try{await session.post("Runtime.enable");await session.post("Debugger.enable");const compiled=await session.post("Runtime.compileScript",{expression:source,sourceURL:"inert-unexecuted-original-serialization.js",persistScript:true});assert.ok(compiled.scriptId!==undefined);
 for(const site of[BEGIN,...Object.values(SITES)]){const start:Debugger.Location={scriptId:compiled.scriptId,lineNumber:site.lineNumber,columnNumber:site.columnNumber};const points:Debugger.GetPossibleBreakpointsReturnType=await session.post("Debugger.getPossibleBreakpoints",{start,end:{...start,columnNumber:site.columnNumber+1},restrictToFunction:true});assert.equal(points.locations.length,1);assert.equal(points.locations[0]?.columnNumber,start.columnNumber);assert.equal(points.locations[0]?.lineNumber,start.lineNumber);}
 const originalLocation:Debugger.Location={scriptId:compiled.scriptId,lineNumber:GUARDS.localIngress.lineNumber,columnNumber:GUARDS.localIngress.columnNumber};assert.equal(originalLocation.lineNumber,SITES.uploadEntry.lineNumber);assert.equal(originalLocation.columnNumber,SITES.uploadEntry.columnNumber);
 const original=await session.post("Debugger.setBreakpoint",{location:originalLocation,condition:""});await assert.rejects(session.post("Debugger.setBreakpoint",{location:originalLocation,condition:""}),/already exists/u);await session.post("Debugger.removeBreakpoint",{breakpointId:original.breakpointId});}

 finally{session.disconnect();}
});
void test("new transition guard permits only original ticket plus one and exact two-row body",async context=>{
 const sources=await readConfiguredEasyedaAssets(["pro-mgr/3.2.185.bf63a159/js/project-worker.js"]);if(sources===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}const source=sources[0];assert.ok(source!==undefined);qualify(source);const c=setup(source);
 vm.runInContext(`rows.push(value.footprint.head({doc:expected.targetUuid,client:manager.client,updateTime:9,user:manager.user,ticket:8}));
 (${PROGRAMS.headReady}).call(first,bundle);
 const setterFrame=[consistency,8,undefined,xt,$e,Ie,JSON,String],setter=(${PROGRAMS.setterEntry}).call(setterFrame,bundle);
 Vc.prototype.setMaxTicket.call(consistency,8);(${PROGRAMS.setterReturned}).call(setterFrame,bundle,setter);
 if(guard()!==false)throw Error("old mutable guard was accidentally reusable");
 rows.push(value.footprint.delete(8,JSON.stringify({isDelete:true})));
 const actualPromise=Object.create(Promise.prototype),retained=(${PROGRAMS.retainReturn}).call(actualPromise);
 // The transition fixture models only identity; the independent Inspector case proves native Promise internals.
 const returned=(${PROGRAMS.stringReturned}).call([manager,expected.targetUuid,value,rows,9,'{"isDelete":true}',8,qe,Ke,xt,$e,Ie,JSON,String],bundle,retained);
 const caller=(${PROGRAMS.callerReady}).call([manager,expected.targetUuid,rows.join(Ie),xt,$e,Ie,JSON,String],bundle,returned,actualPromise);
 (${PROGRAMS.uploadEntry}).call([project,[rows.join(Ie)],true,undefined,xt,$e,Ie,JSON,String],bundle,caller);
 `,c);
 assert.equal(vm.runInContext("rows.join(Ie)===texts[2]",c),true);
 for(const change of["consistency.maxTicket=9","rows[0]+=' '","Object.defineProperty(manager,'client',{get(){throw Error('must not run')},configurable:true})","Object.setPrototypeOf(value.footprint,{})"]){const altered=setup(source);vm.runInContext(`rows.push(texts[0]);${change}`,altered);assert.throws(()=>vm.runInContext(`(${PROGRAMS.headReady}).call(first,bundle)`,altered));}
});
void test("serialization wire grammar and restored native tables preserve every original program and packet",()=>{
 const commands=cases();assert.equal(commands.length,69);assert.equal(ORDER.length,69);for(const c of commands){const w=wire(c,79,"original_session");const bytes=Buffer.from(`${JSON.stringify(w)}\0`);const encoded=frame(bytes,c,"original_session");assert.equal(encoded["action"],"footprint-inverse-native-delete-serialization");assert.throws(()=>validate({...c,authority:true}));}
 const code=native();const m=/EasyedaDiagnosticFixedTable\.Load\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})",@"([a-f\d]{64})",79,4\)/u.exec(code);assert.ok(m!==null&&m[1]!==undefined&&m[2]!==undefined&&m[3]!==undefined&&m[4]!==undefined);const packed=Buffer.from(m[1],"base64");assert.equal(createHash("sha256").update(packed).digest("hex"),m[4]);
 // oxlint-disable-next-line node/no-sync -- Independent bounded fixed-data restoration, not production I/O.
 const raw=gunzipSync(packed,{maxOutputLength:60_000});assert.equal(raw.length,Number(m[2]));assert.equal(createHash("sha256").update(raw).digest("hex"),m[3]);const rows=raw.toString("utf8").split("\0").map(r=>r.split("\t"));assert.equal(rows.length,79);const helper=rows[0]?.[3];assert.ok(helper!==undefined);
 for(const row of rows.filter(r=>r[0]==="program")){const expected=Object.entries(PROGRAMS).find(([name])=>name===row[1])?.[1];assert.ok(expected!==undefined&&row[3]!==undefined);assert.equal(row[3].replaceAll("__native_serialization_helper_v1__",helper),JSON.stringify(expected));}
 const map=new Map(commands.map(c=>{const r=template(c);return[r.key,r];}));for(const row of rows.slice(10)){const r=map.get(row[0]??"");assert.ok(r!==undefined);assert.deepEqual(row,[r.key,r.method,r.names.join(","),r.template]);}
 assert.match(code,/dsrStep!=69/u);assert.match(code,/dsrRemoved.Count!=5/u);assert.doesNotMatch(code,/PublicCall|ntfPoints|ntcComplete/u);
});

void test("actual deleteString return retains its fulfilled outer Promise before its original resume",async context=>{
 const sources=await readConfiguredEasyedaAssets(["pro-mgr/3.2.185.bf63a159/js/project-worker.js"]);if(sources===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}
 // oxlint-disable-next-line typescript/strict-void-return -- Node returns the original ChildProcess; promisify joins its completion callback.
 const execute=promisify(execFile);const result=await execute(process.execPath,["--import",fileURLToPath(new URL("../../scripts/test-isolation.ts",import.meta.url)),fileURLToPath(new URL("helpers/native-delete-string-return-main.ts",import.meta.url))],{maxBuffer:4096,timeout:10_000});
 const parsed:unknown=JSON.parse(result.stdout);z.strictObject({originalReturnCapturedBeforeResume:z.literal(true),capturedReturnIsOuterPromise:z.literal(true),capturedReturnIsInnerPromise:z.literal(false),sameRetainedPromiseFulfilled:z.literal(true),requests:z.number().int().positive().max(18),nativeOwnerIssued:z.literal(false)}).parse(parsed);
});

void test("retained original intrinsic tuple stays valid across ticket change and rejects apply substitution",()=>{
 const c=vm.createContext({});vm.runInContext('const tuple=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis];const bad=()=>{throw Error("intrinsic drift")};',c);
 const code=`(function(){${INTRINSICS}return originalCheck()}).call(tuple)`;
 assert.equal(vm.runInContext(code,c),true);vm.runInContext('globalThis.ticket=8',c);assert.equal(vm.runInContext(code,c),true);
 vm.runInContext('Function.prototype.apply=function(){return true}',c);assert.throws(()=>vm.runInContext(code,c));
});


void test("serialization reuses the original producer upload point and keeps strict single-hit events",()=>{
 const all=cases();assert.equal(all.length,69);assert.equal(ORDER.length,69);assert.equal(ORDER.includes("original-point/before"),true);assert.equal(ORDER.includes("original-point/held"),true);assert.equal(ORDER.includes("arm/uploadEntry"),false);assert.equal(ORDER.includes("remove/uploadEntry"),false);
 for(const method of["Debugger.setBreakpoint","Debugger.removeBreakpoint"]){const owned=all.find(c=>c.method===method);assert.ok(owned!==undefined);assert.throws(()=>validate({...owned,role:"uploadEntry"}));}
 const query=all.find(c=>c.method==="Debugger.getPossibleBreakpoints");assert.ok(query!==undefined&&query.method==="Debugger.getPossibleBreakpoints");assert.throws(()=>validate({...query,params:{...query.params,end:{...query.params.end,scriptId:"foreign_script"}}}));
 const site=SITES.uploadEntry;const point="original_upload";const scriptId="original_script";const top={callFrameId:"original_frame",functionName:site.functionName,location:{scriptId,lineNumber:site.lineNumber,columnNumber:site.columnNumber},functionLocation:{scriptId,lineNumber:site.functionLine,columnNumber:site.functionColumn}};
 assert.equal(paused({method:"Debugger.paused",sessionId:"original_session",params:{reason:"other",hitBreakpoints:[point],callFrames:[top]}},"uploadEntry","original_session",scriptId,point).frame,"original_frame");
 assert.throws(()=>paused({method:"Debugger.paused",sessionId:"original_session",params:{reason:"other",hitBreakpoints:[point,"duplicate_upload"],callFrames:[top]}},"uploadEntry","original_session",scriptId,point));
});


void test("actual PowerShell serialization dispatch preserves held/resumed roles and refuses misplaced roles",async context=>{
 const executable=process.platform==="win32"?"C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe":"/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe";
 try{await access(executable);}catch{context.skip("Windows PowerShell 5 is unavailable for this inert dispatch fixture");return;}
 const script=String.raw`$ErrorActionPreference='Stop'
$FootprintInverseNativeLifecycle209=$true;$FootprintInverse209=$true;$launched=$true
$script:seen=New-Object Collections.Generic.List[object]
$owner=New-Object PSObject
$owner|Add-Member ScriptMethod ControlNativeDeleteTombstone {param($phase,$fields)
 $copy=[ordered]@{};foreach($key in $fields.Keys){$copy[$key]=$fields[$key]}
 $script:seen.Add([ordered]@{phase=$phase;fields=$copy})
}
$dispatch=[ScriptBlock]::Create([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('__DISPATCH__')))
function Invoke-Dispatch($phase,$role,$includeRole){
 $request=[pscustomobject][ordered]@{action='footprint-inverse-native-delete-serialization';id=1;helperInstance='inert';jobId='inert';rootPid=1;rootCreated='inert';requestId=0;phase=$phase;method='control'}
 if($includeRole){$request|Add-Member NoteProperty role $role}
 . $dispatch
 if($result.written -ne $true){throw 'missing-write-receipt'}
}
Invoke-Dispatch 'resumed' 'begin' $true
Invoke-Dispatch 'held' 'headReady' $true
Invoke-Dispatch 'complete' $null $false
$refused=0
foreach($case in @(@('held',$null,$false),@('resumed',$null,$false),@('armed','begin',$true),@('complete','begin',$true),@('held',[NullString]::Value,$true),@('resumed',1,$true))){
 $before=$seen.Count;$failed=$false
 try{Invoke-Dispatch $case[0] $case[1] $case[2]}catch{$failed=$true}
 if(-not $failed -or $seen.Count -ne $before){throw 'malformed-control-reached-owner'};$refused++
}
[ordered]@{seen=$seen.ToArray();refused=$refused;nativeOwnerIssued=$false;appLaunched=$false}|ConvertTo-Json -Depth 6 -Compress
`.replace("__DISPATCH__",Buffer.from(`switch($request.action){\n${DISPATCH}\n}`).toString("base64"));
 // oxlint-disable-next-line typescript/strict-void-return -- Promisify joins the original finite inert PowerShell process.
 const execute=promisify(execFile);const result=await execute(executable,["-NoLogo","-NoProfile","-NonInteractive","-EncodedCommand",Buffer.from(script,"utf16le").toString("base64")],{windowsHide:true,maxBuffer:4096,timeout:20_000});
 const value:unknown=JSON.parse(result.stdout.trim());assert.deepEqual(value,{seen:[{phase:"resumed",fields:{role:"begin"}},{phase:"held",fields:{role:"headReady"}},{phase:"complete",fields:{}}],refused:6,nativeOwnerIssued:false,appLaunched:false});
});
