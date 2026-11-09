/** Exact original factories and GET callback in an inert Inspector. The
 * stand-in constructor tuple below supplies comparison data, not native proof. */
import { CURRENT_FOOTPRINT_INVERSE_INITIALIZED_GET_SOURCE as SOURCE } from "../../src/current-footprint-inverse-initialized-get-source.ts";
import { footprintInverseNativeRegistrationManagerFixture, footprintInverseNativeRegistrationUiFixture } from "./footprint-inverse-native-registration-fixture.ts";

/** Keep original factory coordinates while using an explicit inert timer.
 * This stand-in is comparison data and cannot pass native constructor proof. */
export function footprintInverseNativeGetTaskUiFixture(source: string): string {
  const original = footprintInverseNativeRegistrationUiFixture(source);
  const before = "(()=>{let KU;const xe=cb=>{const m={exports:{}};cb({},m);return()=>m.exports;};";
  const after = before.replace("let KU;const xe", "let KU;const console={debug(){},warn(){},error(){}},setTimeout=()=>0;const xe");
  const padding = original.slice(before.length, after.length);
  if (!original.startsWith(before) || padding.trim() !== "" || padding.includes("\n") || padding.includes("\r")) { throw new Error("INERT_NATIVE_GET_TASK_TIMER_PADDING"); }
  return (after + original.slice(after.length)).replace("globalThis.inertNativeRegCtor=KU().MessageBus;", "globalThis.inertNativeRegCtor=KU().MessageBus;globalThis.inertNativeRegTimer=setTimeout;");
}

/** Add the actual registered GET body at its original UTF16 coordinates. */
export function footprintInverseNativeGetTaskManagerFixture(source: string): string {
  const prepared = footprintInverseNativeRegistrationManagerFixture(source); const entry = SOURCE.managerRegisterGetCallback1; const prefix = ';Ee={messageBus:globalThis._MSG_BUS_};V("/PrjDB/footprint/getData",'; const suffix = ");";
  if (prepared.slice(entry.start - prefix.length, entry.end + suffix.length).trim() !== "") { throw new Error("INERT_NATIVE_GET_TASK_CALLBACK_OVERLAP"); }
  return prepared.slice(0, entry.start - prefix.length) + prefix + source.slice(entry.start, entry.end) + suffix + prepared.slice(entry.end + suffix.length);
}

export const FOOTPRINT_INVERSE_NATIVE_GET_TASK_DEPENDENCIES_INSPECTOR = String.raw`
const {Session}=require('node:inspector/promises'),{parentPort,workerData}=require('node:worker_threads');parentPort.on('message',()=>{});
(async()=>{
 const {collectCurrentFootprintInverseNativeDeleteSender:prepareDelete}=await import(workerData.deleteSender),{collectCurrentFootprintInverseNativeDeleteRegistration:register}=await import(workerData.registration),{collectCurrentFootprintInverseNativeGetTaskSender:prepare}=await import(workerData.sender),{CurrentFootprintInverseNativeGetTaskCallController:Controller}=await import(workerData.controller),{collectCurrentFootprintInverseNativeGetTaskDependencies:collect}=await import(workerData.collector),{qualifyCurrentFootprintInverseNativeGetTaskDependenciesHelper:qualify}=await import(workerData.protocol);
 process.on('unhandledRejection',()=>{});const s=new Session,originals=new WeakSet;let controller=null,helper=null,preparing=null,preparedScriptId=null,submitted=null,exited=false;const deadline=setTimeout(()=>{s.disconnect();parentPort.postMessage({error:'native task dependency fixture deadline'});parentPort.close()},25000);
 try{
  s.connectToMainThread();await s.post('Runtime.enable');await s.post('Debugger.enable');
  s.on('Debugger.scriptParsed',e=>{if(e.params.url!=='')return;if(helper){if(helper.scriptId!==null)throw Error('duplicate dependency helper');helper.scriptId=e.params.scriptId}else if(controller){const event={...e,sessionId:'native-dependencies-ui'};originals.add(event);try{controller.observe(event)}catch{}}else if(preparing==='prepare'){if(preparedScriptId!==null)throw Error('duplicate prepare helper');preparedScriptId=e.params.scriptId}});
  s.on('Debugger.paused',e=>{const event={...e,sessionId:'native-dependencies-ui'};originals.add(event);try{controller.observe(event)}catch{}});
  const compile=async(expression,sourceURL)=>{const c=await s.post('Runtime.compileScript',{expression,sourceURL,persistScript:true});if(!c.scriptId)throw Error(JSON.stringify(c));const raw=await s.post('Runtime.runScript',{scriptId:c.scriptId});if(raw.exceptionDetails)throw Error(JSON.stringify(raw));return c.scriptId};
  const uiScriptId=await compile(workerData.ui,'inert-task-dependency-ui.js'),managerScriptId=await compile(workerData.manager,'inert-task-dependency-manager.js'),root=await s.post('Runtime.evaluate',{expression:'inertNativeReg.receipt'}),receipt=root.result.objectId;
  const ordinary=async c=>{const raw=await s.post(c.method,c.params);if(raw.exceptionDetails)throw Error(c.phase+'/'+c.role+' '+JSON.stringify(raw));return raw},target={projectUuid:'a'.repeat(64),branchUuid:'b'.repeat(32),documentUuid:'c'.repeat(16)};
  const deletion=await prepareDelete({receipt,uiScriptId,target,current:()=>{},request:ordinary}),registration=await register({receipt,sender:deletion,uiScriptId,managerScriptId,target,current:()=>{},request:ordinary});
  const prepared=await prepare({receipt,uiScriptId,target,current:()=>{},request:async c=>{preparing=c.role;try{return await ordinary(c)}finally{preparing=null}}});if(!preparedScriptId)throw Error('prepare source missing');
  // This original Inspector-only setup is deliberately not a qualified native
  // constructor receipt; the production Core must run its separate collector.
  const native=await s.post('Runtime.callFunctionOn',{objectId:receipt,functionDeclaration:'function(){return[null,null,null,null,Promise,null,ArrayBuffer,typeof SharedArrayBuffer==="undefined"?null:SharedArrayBuffer,null,null,null,null,null,null,WeakRef,null,globalThis.inertNativeRegTimer,null,null,()=>true]}',returnByValue:false});if(native.exceptionDetails)throw Error(JSON.stringify(native));const nativeRoots=native.result.objectId;
  controller=new Controller({receipt,prepared,sessionId:'native-dependencies-ui',contextId:1,uiScriptId,preparedScriptId,current:()=>{},beforeInvoke:()=>{},assertOriginalEvent:event=>{if(!originals.has(event))throw Error('foreign event')},assertOriginalExit:()=>{if(!exited)throw Error('original exit missing')},poll:()=>new Promise(resolve=>setImmediate(resolve)),send:ordinary,submit:c=>{submitted=s.post(c.method,c.params);return{request:submitted,written:Promise.resolve(),assertOriginalWritten:()=>{if(!submitted)throw Error('original write missing')}}}});
  const token=await controller.start(),held=controller.requireOriginalHold(token),order=[];let traps=0;
  const request=async c=>{controller.requireOriginalHold(token);order.push(c.phase.slice('inverse-native-get-task-dependencies-'.length)+(c.role?':'+c.role:''));const next=c.method==='Runtime.callFunctionOn'||c.method==='Debugger.evaluateOnCallFrame'?{command:c,scriptId:null}:null;helper=next;try{const raw=await ordinary(c);if(next){if(next.scriptId===null)throw Error('missing dependency helper');qualify(await s.post('Debugger.getScriptSource',{scriptId:next.scriptId}),c);order.push('helper')}return raw}finally{helper=null}};
  if(workerData.mode!=='ready'){helper={scriptId:null};try{const mutated=await s.post('Runtime.callFunctionOn',{objectId:workerData.mode==='nativePromiseDrift'?nativeRoots:prepared.members,functionDeclaration:workerData.mode==='nativePromiseDrift'?'function(){this[4]=function foreignPromise(){}}':'function(){globalThis.inertNativeReg.traps=0;this[1]=new Proxy(this[1],{getOwnPropertyDescriptor(){globalThis.inertNativeReg.traps++;throw Error("trap")},getPrototypeOf(){globalThis.inertNativeReg.traps++;throw Error("trap")}})}',returnByValue:true});if(mutated.exceptionDetails)throw Error(JSON.stringify(mutated))}finally{helper=null}}
  let graph=null,refused=false;try{graph=await collect({receipt,frame:held.frame,originalFrame:held.tuple,sender:prepared,nativeRoots,originalManagerModule:registration.module,uiScriptId,managerScriptId,current:()=>{controller.requireOriginalHold(token)},request})}catch(error){if(workerData.mode==='ready')throw error;refused=true}
  const counts=graph?{calls:graph.calls,properties:graph.properties,frames:graph.frames}:null;
  if(workerData.mode!=='ready'&&!refused)throw Error('changed dependency admitted');if(graph&&(graph.bodyAuthorized||graph.runtimeJobIssued||graph.callbackLiveEntryProved))throw Error('data granted execution');
  helper={scriptId:null};let effectsWhileHeld;try{const state=await s.post('Runtime.evaluate',{expression:'[inertNativeReg.transports(),inertNativeReg.traps||0,_MSG_BUS_.rpcTicket]',returnByValue:true,throwOnSideEffect:true});if(state.exceptionDetails)throw Error(JSON.stringify(state));effectsWhileHeld=state.result.value}finally{helper=null}
  await s.post('Debugger.disable');await submitted;exited=true;await controller.settleAfterOriginalExit();const state=await s.post('Runtime.evaluate',{expression:'[inertNativeReg.transports(),inertNativeReg.traps||0,_MSG_BUS_.rpcTicket] ',returnByValue:true});
  parentPort.postMessage({ready:graph!==null,refused,counts,order,effectsWhileHeld,effectsAfterFixtureRelease:state.result.value});parentPort.close();
 }finally{clearTimeout(deadline);try{await s.post('Debugger.disable')}catch{}s.disconnect()}
})().catch(error=>{parentPort.postMessage({error:error.stack||String(error)});parentPort.close()});
`;
