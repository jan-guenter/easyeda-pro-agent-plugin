/** Original UI and manager fragments in independent inert Inspector scripts. */
import { CURRENT_FOOTPRINT_INVERSE_INITIALIZED_GET_SOURCE as SOURCE } from "../../src/current-footprint-inverse-initialized-get-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_FORCE_SOURCE as FORCE } from "../../src/current-footprint-inverse-delete-force-source.ts";

export function footprintInverseForceFixture(full: string): string {
  const intro = '(()=>{const Ee={messageBus:globalThis.gVars.messageBus},fi=()=>{};'; let text = intro + full.replaceAll(/[^\r\n]/gu, " ").slice(intro.length);
  for (const row of [SOURCE.managerApplyArguments, SOURCE.managerRegisterService, FORCE.registrar]) { text = text.slice(0, row.start) + full.slice(row.start, row.end) + text.slice(row.end); }
  return `${text};const state=inertUiRunState,I=state[0],old=state[1],row=old[1],spent=old[3],host=gVars,bus=host.messageBus,p=Object.getPrototypeOf(bus);bus.subscribed["/pro-mgr/project/sync/force"]=[];CG({});const task=bus.subscribed["/pro-mgr/project/sync/force"][0],tp=Object.getPrototypeOf(task),outer=[bus,p,bus.subscribed,bus.pulled,bus.pushed,spent],methods=[p.uniqueRpcTopic,p.publish,p.subscribe,p.push,p.pull,p.pullA,p.rpcService,p.rpcCall,p.rpcReply,tp.cancel,tp.running,tp.execute,spent],initial=[null,null,null,host,host.currentProject,null,null,spent],original=[null,null,null,null,null,null,row.uuid,row.path,spent],module=[pw,null,null,spent];globalThis.inertForceInputs=[I,outer,methods,initial,original,module];})();`;
}
export const FOOTPRINT_INVERSE_FORCE_INSPECTOR = String.raw`
const {workerData,parentPort}=require('node:worker_threads'),{Session}=require('node:inspector/promises');
parentPort.on('message',()=>{});
(async()=>{
 const {CurrentFootprintInverseDeleteForwardIo:Io}=await import(workerData.io),{collectCurrentFootprintInverseDeleteForce:prepare}=await import(workerData.collector),{CURRENT_FOOTPRINT_INVERSE_DELETE_FORCE_EXPRESSIONS:E}=await import(workerData.programs),{resumeInspectorBeforeReject}=await import(workerData.failureHelper),{currentFootprintInverseDeleteForcePause:pause}=await import(workerData.replies);
 const s=new Session;
 try{
  s.connectToMainThread();await s.post('Runtime.enable');await s.post('Debugger.enable');
  const compile=async(source,url)=>{const c=await s.post('Runtime.compileScript',{expression:source,sourceURL:url,persistScript:true});if(!c.scriptId)throw Error(JSON.stringify(c));const r=await s.post('Runtime.runScript',{scriptId:c.scriptId});if(r.exceptionDetails)throw Error(JSON.stringify(r));return c.scriptId;};
  const ui=await compile(workerData.ui,'inert-original-force-ui.js'),manager=await compile(workerData.manager,'inert-original-force-manager.js');
  if(workerData.proxyService){const changed=await s.post('Runtime.evaluate',{expression:'globalThis.inertForceProxyCalls=0;(()=>{const sub=gVars.messageBus.subscribed,key="/pro-mgr/project/sync/force",original=sub[key];sub[key]=new Proxy(original,{getPrototypeOf(t){inertForceProxyCalls++;return Reflect.getPrototypeOf(t)},ownKeys(t){inertForceProxyCalls++;return Reflect.ownKeys(t)},get(t,k,r){inertForceProxyCalls++;return Reflect.get(t,k,r)}})})()',returnByValue:true});if(changed.exceptionDetails)throw Error(JSON.stringify(changed));}let taskRequests=0;
  const begin=await s.post('Debugger.setBreakpoint',{location:{scriptId:ui,lineNumber:1935,columnNumber:1547},condition:''}),points=new Map([[begin.breakpointId,'prepare']]),done=Promise.withResolvers(),observed=[];let io,prepared,ids;
  const props=id=>s.post('Runtime.getProperties',{objectId:id,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false});
  const request=async c=>{if(c.role==='force-task')taskRequests++;const r=await s.post(c.method,c.params);if(r.exceptionDetails)throw Error(c.phase+'/'+c.role+' '+JSON.stringify(r));return r;};
  s.on('Debugger.paused',event=>{void(async()=>{
   const point=event.params.hitBreakpoints[0],role=points.get(point),top=event.params.callFrames[0];
   if(role==='prepare'){
    const state=await s.post('Debugger.evaluateOnCallFrame',{callFrameId:top.callFrameId,expression:'inertForceInputs',returnByValue:false,throwOnSideEffect:true});if(state.exceptionDetails)throw Error(JSON.stringify(state));ids=(await props(state.result.objectId)).result.filter(r=>r.name!=='length').map(r=>r.value.objectId);
    io=new Io({receipt:ids[0],current:()=>{},request,target:{projectUuid:'a'.repeat(64),branchUuid:'b'.repeat(32),documentUuid:'c'.repeat(16)},maximum:256});
    try{prepared=await prepare({io,outer:ids[1],methods:ids[2],initial:ids[3],original:ids[4],uiScriptId:ui,managerScriptId:manager});}catch(error){if(!workerData.proxyService)throw error;const counts=await s.post('Runtime.evaluate',{expression:'inertForceProxyCalls',returnByValue:true});await s.post('Debugger.disable');await s.post('Debugger.resume').catch(()=>{});done.resolve({proxyRefused:true,proxyCallsBeforeResume:counts.result.value,taskRequests});return;}if(workerData.proxyService)throw Error('proxy admitted');
    const read=(await props(ids[2])).result,functions=[['rpc',read.find(r=>r.name==='7').value.objectId],['publish',read.find(r=>r.name==='1').value.objectId],['callback',prepared.callback],['wrapper',prepared.wrapper],['body',prepared.emptyBody]];
    for(const [name,id]of functions){const b=await s.post('Debugger.setBreakpointOnFunctionCall',{objectId:id,condition:''});points.set(b.breakpointId,name);}await s.post('Debugger.removeBreakpoint',{breakpointId:begin.breakpointId});
   }else if(role==='rpc'){pause({method:'Debugger.paused',sessionId:'inert-force-ui',params:event.params},'rpc','inert-force-ui',{ui,manager},point);
    const f=await io.frame('force-rpc',top.callFrameId,E.rpc,5),caller=await io.frame('force-caller',event.params.callFrames[1].callFrameId,E.caller,1);
    await io.call('force-rpc',[f.id,prepared.roots,caller.id]);observed.push('rpc');
   }else if(role==='callback'){pause({method:'Debugger.paused',sessionId:'inert-force-ui',params:event.params},'callback','inert-force-ui',{ui,manager},point);
    const f=await io.frame('force-callback',top.callFrameId,E.callback,5);await io.call('force-callback',[f.id,prepared.roots,prepared.handler]);observed.push('callback');
   }else if(role==='wrapper'){pause({method:'Debugger.paused',sessionId:'inert-force-ui',params:event.params},'wrapper','inert-force-ui',{ui,manager},point);
    const f=await io.frame('force-wrapper',top.callFrameId,E.wrapper,3);await io.call('force-wrapper',[f.id,prepared.body,ids[5]]);observed.push('wrapper');
   }else if(role==='body'){pause({method:'Debugger.paused',sessionId:'inert-force-ui',params:event.params},'body','inert-force-ui',{ui,manager},point);
    const f=await io.frame('force-body',top.callFrameId,E.body,1);await io.call('force-bodyEntry',[f.id,prepared.body]);observed.push('body');
   }else if(role==='publish'){
    const topic=await s.post('Debugger.evaluateOnCallFrame',{callFrameId:top.callFrameId,expression:'t',returnByValue:true,throwOnSideEffect:true});
    const names={'clearAllPcbHistory':'history-pcb','clearAllSchHistory':'history-sch','deleteDataBottomCb':'history-bottom'},name=names[topic.result.value];
    if(topic.result.value==='/pro-mgr/project/sync/force'){pause({method:'Debugger.paused',sessionId:'inert-force-ui',params:event.params},'publish','inert-force-ui',{ui,manager},point);const f=await io.frame('force-history',top.callFrameId,E.history,6);await io.call('force-publish',[f.id,prepared.roots]);}if(name){pause({method:'Debugger.paused',sessionId:'inert-force-ui',params:event.params},name,'inert-force-ui',{ui,manager},point);const f=await io.frame('force-history',top.callFrameId,E.history,6),caller=await io.frame('force-caller',event.params.callFrames[1].callFrameId,E.caller,1);await io.call(name,[f.id,prepared.roots,caller.id]);observed.push(name);if(name==='history-bottom'){await s.post('Debugger.disable');await s.post('Debugger.resume').catch(()=>{});done.resolve({observed,claims:{forceCompleted:prepared.forceCompleted,historyCompleted:prepared.historyCompleted,workerDrainProved:prepared.workerDrainProved}});return;}}
   }else throw Error('unexpected pause '+role);
   await s.post('Debugger.resume');
  })().catch(error=>resumeInspectorBeforeReject(s,done.reject,error));});
  const launch=s.post('Runtime.evaluate',{expression:'inertUiRunApi.delete({footprintUuid:"c".repeat(16),libraryUuid:"Project"})',awaitPromise:false}),result=await done.promise;await launch;parentPort.postMessage(result);parentPort.close();
 }finally{try{await s.post('Debugger.disable')}catch{}s.disconnect();}
})().catch(error=>{parentPort.postMessage({error:error.stack||String(error)});parentPort.close();});
`;
