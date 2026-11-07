/** Actual byte transport with an inert peer; it issues no native owner. */
import assert from "node:assert/strict";
import { once } from "node:events";
import { PassThrough,Writable } from "node:stream";
import { test } from "node:test";
import { CurrentFootprintInversePipe } from "../src/current-pcb-diagnostic-pipe.ts";
import { currentFootprintInverseDeleteRpcCases } from "../src/current-footprint-inverse-delete-rpc-protocol.ts";
import { currentFootprintInverseClockWorkerCases } from "../src/current-footprint-inverse-clock-worker-protocol.ts";
import { currentFootprintInverseDeleteEntryCases } from "../src/current-footprint-inverse-delete-entry-protocol.ts";
import { currentFootprintInverseDeleteWorkerPeerCases } from "../src/current-footprint-inverse-delete-worker-peer-protocol.ts";
import { currentFootprintInverseDeleteJobCases } from "../src/current-footprint-inverse-delete-job-protocol.ts";

function ignoreEvent():void{
 // The inert peer emits no application event.
}
void test("actual inverse byte pipe admits only its retained worker for bus, RPC, entry and forwarded-job observations",async context=>{
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
 for(const command of currentFootprintInverseDeleteWorkerPeerCases()){const pending=pipe.observeInverseDeleteWorkerPeer(command);assert.equal(last().sessionId,pair.pageSessionId);reply({});await pending;}
 for(const command of currentFootprintInverseDeleteEntryCases()){const pending=pipe.observeInverseDeleteEntry(command);assert.equal(last().sessionId,pair.pageSessionId);reply({});await pending;}
 for(const command of currentFootprintInverseDeleteJobCases()){const pending=pipe.observeInverseDeleteJob(command);assert.equal(last().sessionId,pair.pageSessionId);reply({});await pending;}assert.equal(pipe.status().failureObservation,null);
});
