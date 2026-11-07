/** Exact source-derived RPC prefix budget/encoding; no native owner runs. */
import assert from "node:assert/strict";
import { once } from "node:events";
import { PassThrough,Writable } from "node:stream";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_RPC_REQUESTS as BUDGET,currentFootprintInverseDeleteRpcCases,currentFootprintInverseDeleteRpcKey,currentFootprintInverseDeleteRpcNativeFrame,currentFootprintInverseDeleteRpcOrder,currentFootprintInverseDeleteRpcTemplate,currentFootprintInverseDeleteRpcWire,validateCurrentFootprintInverseDeleteRpcCommand } from "../src/current-footprint-inverse-delete-rpc-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_RPC_PROGRAMS as PROGRAMS } from "../src/current-footprint-inverse-delete-rpc-programs.ts";
import { CurrentFootprintInversePipe } from "../src/current-pcb-diagnostic-pipe.ts";
import { currentFootprintInverseClockWorkerCases } from "../src/current-footprint-inverse-clock-worker-protocol.ts";
import { currentFootprintInverseDeleteEntryCases } from "../src/current-footprint-inverse-delete-entry-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_PROFILE as PROFILE } from "../src/current-footprint-inverse-native-profile.ts";

function ignoreEvent():void{
 // The inert peer emits no application event.
}
void test("worker RPC prefix has exact one-pass order, independent budget and fixed message bytes",()=>{
 const cases=currentFootprintInverseDeleteRpcCases();assert.equal(cases.length,20);assert.equal(BUDGET.normal,BUDGET.setup+BUDGET.dispatch);assert.equal(BUDGET.helpers,BUDGET.setupHelpers+BUDGET.dispatchHelpers);assert.equal(BUDGET.cdpRequests,24);assert.equal(BUDGET.controls,BUDGET.cdpRequests+2);assert.equal(PROFILE.renderer.deleteRpc,BUDGET);
 const keys=new Set(cases.map(command=>currentFootprintInverseDeleteRpcKey(command)));assert.equal(keys.size,20);for(let index=0;index<BUDGET.normal;index+=1){assert.ok(keys.has(currentFootprintInverseDeleteRpcOrder(index)));}assert.throws(()=>currentFootprintInverseDeleteRpcOrder(BUDGET.normal));
 for(const command of cases){const row=currentFootprintInverseDeleteRpcTemplate(command);let rendered=row.template;if(command.method==="Runtime.callFunctionOn"){const role=command.phase.slice("inverse-delete-rpc-".length);rendered=rendered.replace(JSON.stringify(`__inverse_delete_rpc_program${role}__`),JSON.stringify(command.params.functionDeclaration));}for(const name of row.names){rendered=rendered.replace(JSON.stringify(`__inverse_delete_rpc_${name}__`),JSON.stringify("original_ref"));}assert.deepEqual(JSON.parse(rendered),{method:command.method,params:command.params});const wire=currentFootprintInverseDeleteRpcWire(command,79,"original-worker");const bytes=Buffer.from(`${JSON.stringify(wire)}\0`);const native=currentFootprintInverseDeleteRpcNativeFrame(bytes,command,"original-worker");assert.equal(native["action"],"footprint-inverse-delete-rpc");assert.equal(Object.hasOwn(native,"sessionId"),false);assert.throws(()=>currentFootprintInverseDeleteRpcNativeFrame(bytes,command,"foreign-worker"));}
});
void test("RPC prefix refuses packet, invocation, continuation, foreign source and accessors",()=>{
 for(const method of["Debugger.resume","Debugger.setBreakpoint","Runtime.evaluate"]){assert.throws(()=>validateCurrentFootprintInverseDeleteRpcCommand({phase:"inverse-delete-rpc-ready",method,params:{}}));}
 const first=currentFootprintInverseDeleteRpcCases()[0];assert.ok(first!==undefined&&first.method==="Runtime.callFunctionOn");assert.throws(()=>validateCurrentFootprintInverseDeleteRpcCommand({...first,params:{...first.params,functionDeclaration:PROGRAMS.packet}}));let reads=0;assert.throws(()=>validateCurrentFootprintInverseDeleteRpcCommand(Object.defineProperty({},"phase",{enumerable:true,get(){reads+=1;return"inverse-delete-rpc-prelude";}})));assert.equal(reads,0);
});

void test("actual inverse byte pipe admits only its retained worker for bus, RPC and entry observations",async context=>{
 const input=new PassThrough(),sent:Buffer[]=[];
 // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Exercise actual Writable completion with an inert peer.
 const output=new Writable({write(chunk:unknown,_encoding,callback):void{assert.ok(Buffer.isBuffer(chunk));sent.push(Buffer.from(chunk));callback();}});
 const pipe=new CurrentFootprintInversePipe(input,output);pipe.start();context.after(async()=>{const closed=[input,output].filter(stream=>!stream.closed).map(stream=>once(stream,"close"));input.destroy();output.destroy();await Promise.all(closed);pipe.releaseClosedListeners();});
 const last=():Readonly<{id:number;sessionId?:string}>=>{const raw=sent.at(-1);assert.ok(raw!==undefined);const packet:unknown=JSON.parse(raw.subarray(0,-1).toString("utf8"));assert.ok(packet!==null&&typeof packet==="object"&&"id"in packet&&typeof packet.id==="number");if("sessionId"in packet){assert.ok(typeof packet.sessionId==="string");return{id:packet.id,sessionId:packet.sessionId};}return{id:packet.id};};
 const reply=(result:object):void=>{const envelope={...last(),result};const bytes=Buffer.from(`${JSON.stringify(envelope)}\0`);input.write(bytes);};
 pipe.retainInverseActorEvents(()=>"project");for(const stage of["before","arm","after"]as const){const pending=pipe.observeInverseActors(stage);reply({});await pending;}
 const attached=pipe.attachTarget("original-ui",ignoreEvent);reply({sessionId:"original-ui-session"});await attached;const parent=pipe.armInverseParent(ignoreEvent);reply({});await parent;
 const pair=Object.freeze({targetId:"original-worker",browserSessionId:"original-browser-worker",pageSessionId:"original-page-worker",url:"https://client/editor?entry=mgr-project-worker.js&cll=&debugOpen=0",title:"original-project-worker"});
 for(const sessionId of[pair.browserSessionId,pair.pageSessionId]){input.write(Buffer.from(`${JSON.stringify({method:"Target.attachedToTarget",...(sessionId===pair.pageSessionId?{sessionId:"original-ui-session"}:{}),params:{sessionId,targetInfo:{targetId:pair.targetId},waitingForDebugger:true}})}\0`));}pipe.bindInverseWorker(pair);
 const source=pipe.observeInverseWorker({phase:"saved-load-source",role:"project",method:"Debugger.getScriptSource",params:{scriptId:"original-source"}});reply({});await source;
 for(const command of currentFootprintInverseClockWorkerCases()){const pending=pipe.observeInverseClockWorker(command);assert.equal(last().sessionId,pair.pageSessionId);reply({});await pending;}
 for(const command of currentFootprintInverseDeleteRpcCases()){const pending=pipe.observeInverseDeleteRpc(command);assert.equal(last().sessionId,pair.pageSessionId);reply({});await pending;}
 for(const command of currentFootprintInverseDeleteEntryCases()){const pending=pipe.observeInverseDeleteEntry(command);assert.equal(last().sessionId,pair.pageSessionId);reply({});await pending;}assert.equal(pipe.status().failureObservation,null);
});
