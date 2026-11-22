/* oxlint-disable import/max-dependencies -- The actual event, source, primitive, sender and return packet boundaries remain separate. */
/** One original negative task, from prearm through actual outer return. This
 * controller owns no birth and cannot manufacture its original receiver
 * bindings, native transport or exit proof from a data packet. */
import {types} from "node:util";
import {z} from "zod";
import type {DiagnosticEvent} from "./current-pcb-diagnostic-protocol.ts";
import {captureCurrentFootprintInversePreferenceReply as capture} from "./current-footprint-inverse-public-preferences-replies.ts";
import {currentFootprintInverseLookupArray as array,currentFootprintInverseLookupObject as object,currentFootprintInverseLookupPoint as point,currentFootprintInverseLookupProperties as properties,currentFootprintInverseLookupResult as result} from "./current-footprint-inverse-lookup-preentry-replies.ts";
import {decodeCurrentFootprintInverseInitializedGetFunction as metadata} from "./current-footprint-inverse-initialized-get-replies.ts";
import {requireCurrentFootprintInverseInitializedGetDescription as description} from "./current-footprint-inverse-initialized-get-source.ts";
import {requireCurrentFootprintInversePublicServiceTrue as truth} from "./current-footprint-inverse-public-service-replies.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_FLAGS as FLAGS,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_POINTS as POINTS,currentFootprintInverseNativeDeleteColdUiProgram as program,qualifyCurrentFootprintInverseNativeDeleteColdUiHelper as qualify,currentFootprintInverseNativeDeleteColdUiCallSpec as spec,validateCurrentFootprintInverseNativeDeleteColdUiCommand as validate} from "./current-footprint-inverse-native-delete-cold-ui-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteColdUiCallRole as CallRole,CurrentFootprintInverseNativeDeleteColdUiCommand as Command} from "./current-footprint-inverse-native-delete-cold-ui-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_FRAMES as FRAMES} from "./current-footprint-inverse-native-delete-cold-ui-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_SOURCE as SOURCE,qualifyCurrentFootprintInverseNativeDeleteColdUiSource as source} from "./current-footprint-inverse-native-delete-cold-ui-source.ts";
import {CurrentFootprintInverseNativeDeleteColdUiReturnCollector as Returns} from "./current-footprint-inverse-native-delete-cold-ui-return-collector.ts";
import type {CurrentFootprintInverseNativeDeleteColdUiReturnData as Data} from "./current-footprint-inverse-native-delete-cold-ui-return-collector.ts";
import {requireOriginalCurrentFootprintInverseNativeDeleteColdUiSender as senderOriginal} from "./current-footprint-inverse-native-delete-cold-ui-sender-collector.ts";
import type {CurrentFootprintInverseNativeDeleteColdUiSender as Sender} from "./current-footprint-inverse-native-delete-cold-ui-sender-collector.ts";
import {requireOriginalCurrentFootprintInverseNativeDeleteColdUiReceiver as requireReceiver} from "./current-footprint-inverse-native-delete-cold-ui-receiver-collector.ts";
import type {CurrentFootprintInverseNativeDeleteColdUiReceiver as Receiver} from "./current-footprint-inverse-native-delete-cold-ui-receiver-collector.ts";
import type {CurrentFootprintInverseNativeDeleteColdUiPrimitives as Primitives} from "./current-footprint-inverse-native-delete-cold-ui-primitive-collector.ts";

type ReturnRole=Parameters<Returns["captureOriginalHeld"]>[0];
type Role="uiEntry"|"workerEntry"|"workerHandler"|ReturnRole;
interface Realm{readonly sessionId:string;readonly contextId:number;readonly scriptId:string;readonly source:string}
interface Invocation{readonly request:Promise<unknown>;readonly written:Promise<void>;readonly assertOriginalWritten:()=>void}
interface Bindings{
 readonly ui:Realm;readonly manager:Realm;readonly worker:Realm;readonly sender:Sender;readonly primitives:Primitives;readonly receiver:Receiver;
 readonly target:Readonly<{projectUuid:string;branchUuid:string;documentUuid:string}>;
 readonly originalWorkerHandler:string;readonly originalWorkerProject:string;readonly originalWorkerNeedData:string;
 readonly originalWorkerGetData:string;readonly originalWorkerProof:string;readonly originalWorkerReflection:string;
 readonly originalManagerPush:string;readonly originalUiReply:string;
 readonly originalWorkerFootprint:string;readonly originalManagerFootprint:string;readonly originalManagerWorkerBus:string;
 readonly current:()=>void;readonly assertOriginalEvent:(event:DiagnosticEvent)=>void;readonly assertOriginalExit:()=>void;
 /** Original receiver/source/primitive gate. Core repeats it at actual stdin
  * submission; the private closure is never accepted through JSON. */
 readonly beforeOriginalInvoke:()=>void;
 readonly request:(command:Command,sessionId:string)=>Promise<unknown>;
 readonly submit:(command:Command,sessionId:string)=>Invocation;
 readonly poll:()=>Promise<void>;
}
interface Hold{readonly role:Role;readonly event:DiagnosticEvent;readonly point:string}
interface Helper{readonly command:Command;readonly contextId:number;scriptId:string|null}
interface Resume{readonly hold:Hold;readonly acknowledged:PromiseWithResolvers<null>;observed:boolean}
interface Final{readonly data:Data;readonly returns:Returns}
const empty=z.strictObject({});
const frameLocation=z.strictObject({scriptId:z.string(),lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const possibleLocation=z.strictObject({...frameLocation.shape,type:z.enum(["debuggerStatement","call","return"]).optional()});
const pointResult=z.strictObject({locations:z.array(possibleLocation).max(256)});
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$(?![\s\S])/u);
const originalControllers=new WeakSet<object>();
function need(ok:boolean):asserts ok{if(!ok){throw new Error("INVERSE_NATIVE_DELETE_COLD_UI_CUSTODY");}}
/** One invocation; ten original holds, ten removals and ten resumes.
 * Entry11reads/2sources +resolver12reads/3sources +worker entry3reads/2sources,
 * seven initial arms, four possible-site reads, the late resolver arm,
 * invoke+its source and after+its source. The return reader has its own82. */
export {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_CONTROLLER_REQUESTS} from "./current-footprint-inverse-native-delete-cold-ui-request-budgets.ts";
export class CurrentFootprintInverseNativeDeleteColdUiController{
 readonly #b:Bindings;readonly #queue:Hold[]=[];readonly #observedRoles=new Set<Role>();readonly #holds=new Map<string,Hold>();readonly #points=new Map<Role,string>();readonly #helpers=new Map<string,Helper>();readonly #resumes=new Map<string,Resume>();
 readonly #requests:Promise<unknown>[]=[];readonly #joins:Promise<unknown>[]=[];
 #started:Promise<Data>|null=null;#end:Promise<void>|null=null;#invocation:Invocation|null=null;#returns:Returns|null=null;#resolverTask:string|null=null;#result:Final|null=null;
 readonly #resolved=new Map<Role,Readonly<{id:string;session:string}>>();readonly #arming=new Map<string,Role>();
 #endCompleted=false;#failed=false;#cause:unknown;#ended=false;#invoked=false;#normal=0;#helperCount=0;#cleanup=0;#captures=0;#complete=false;#invokeScript:string|null=null;
 public constructor(bindings:Bindings){
  for(const[file,realm]of [["ui",bindings.ui],["manager",bindings.manager],["worker",bindings.worker]]as const){source(realm.source,file);handle.parse(realm.sessionId);handle.parse(realm.scriptId);need(Number.isSafeInteger(realm.contextId)&&realm.contextId>0);}
  senderOriginal(bindings.sender);requireReceiver(bindings.receiver,bindings.sender);need(bindings.originalManagerFootprint===bindings.receiver.footprint&&bindings.originalManagerWorkerBus===bindings.receiver.bus&&bindings.originalManagerPush===bindings.receiver.push&&bindings.originalUiReply===bindings.sender.reply);this.#b=Object.freeze({...bindings,ui:Object.freeze({...bindings.ui}),manager:Object.freeze({...bindings.manager}),worker:Object.freeze({...bindings.worker}),target:Object.freeze({...bindings.target})});originalControllers.add(this);Object.freeze(this);
 }
 #fail(cause:unknown):void{if(!this.#failed){this.#failed=true;this.#cause=cause;}}
 #current():void{if(this.#failed){throw this.#cause;}try{need(!this.#ended);this.#b.current();senderOriginal(this.#b.sender);requireReceiver(this.#b.receiver,this.#b.sender);for(const hold of this.#holds.values()){this.#b.assertOriginalEvent(hold.event);}}catch(error){this.#fail(error);throw error;}}
 #keep<T>(pending:Promise<T>):Promise<T>{need(types.isPromise(pending));const settled=(async():Promise<void>=>{try{await pending;}catch(error){this.#fail(error);}})();this.#joins.push(settled);return pending;}
 #realm(role:Role):Realm{if(role==="workerReturned"||role==="workerEntry"||role==="workerHandler"){return this.#b.worker;}if(role==="innerPush"||role==="managerReturned"){return this.#b.manager;}return this.#b.ui;}
 #bySession(id:string):Realm{const found=[this.#b.ui,this.#b.manager,this.#b.worker].find(realm=>realm.sessionId===id);need(found!==undefined);return found;}
 #held(role:ReturnRole,event:DiagnosticEvent):void{const realm=this.#realm(role);const hold=this.#holds.get(realm.sessionId);need(hold?.event===event&&hold.role===role);this.#b.assertOriginalEvent(event);}
 /** Original source/helper events are matched by complete fixed text later.
  * Empty breakpoint predicates introduce no condition-script ambiguity. */
 public observe(event:DiagnosticEvent):boolean{
  if(![this.#b.ui.sessionId,this.#b.manager.sessionId,this.#b.worker.sessionId].includes(event.sessionId??"")){return false;}
  if(event.method!=="Debugger.scriptParsed"&&event.method!=="Debugger.paused"&&event.method!=="Debugger.resumed"&&event.method!=="Debugger.breakpointResolved"){return false;}
  try{this.#current();this.#b.assertOriginalEvent(event);const session=event.sessionId;need(session!==undefined);
   if(event.method==="Debugger.scriptParsed"){if(event.params["url"]!==""){return false;}const helper=this.#helpers.get(session);need(helper!==undefined&&helper.scriptId===null&&event.params["executionContextId"]===helper.contextId);helper.scriptId=handle.parse(event.params["scriptId"]);return true;}
   if(event.method==="Debugger.breakpointResolved"){
    const raw=z.strictObject({breakpointId:handle,location:frameLocation}).parse(capture(event.params));
    const role=[...this.#points].find(([,id])=>id===raw.breakpointId)?.[0]??this.#arming.get(session);need(role!==undefined&&this.#realm(role).sessionId===session&&!this.#resolved.has(role)&&this.#resolved.size<10);
    const sourceRoles={uiEntry:"uiRpc",workerHandler:"workerHandler",workerEntry:"workerGetData",innerPush:"innerPush",fulfilledReply:"uiReply",resolver:"uiResolver",managerReturned:"managerGetData",workerReturned:"workerGetData",uiReturned:"uiRpc",uiTimer:"uiTimer"}as const;const row=SOURCE[sourceRoles[role]];
    need(raw.location.scriptId===this.#realm(role).scriptId&&raw.location.lineNumber===row.lineNumber&&raw.location.columnNumber>=row.columnNumber&&raw.location.columnNumber<row.columnNumber+row.end-row.start+1);
    this.#resolved.set(role,Object.freeze({id:raw.breakpointId,session}));return true;
   }
   if(event.method==="Debugger.resumed"){const resume=this.#resumes.get(session);need(resume!==undefined&&!resume.observed&&this.#holds.get(session)===resume.hold);resume.observed=true;this.#holds.delete(session);resume.acknowledged.resolve(null);return true;}
   need(this.#invoked&&!this.#complete&&this.#holds.get(session)===undefined&&this.#queue.length<10);
   const hits=z.tuple([handle]).parse(event.params["hitBreakpoints"]),selected=[...this.#points].find(([,id])=>id===hits[0]);need(selected!==undefined);const[role,id]=selected;
   need(this.#realm(role).sessionId===session&&!this.#observedRoles.has(role));this.#observedRoles.add(role);const hold=Object.freeze({role,event,point:id});this.#holds.set(session,hold);this.#queue.push(hold);return true;
  }catch(error){this.#fail(error);throw error;}
 }
 async #read(input:Command,realm:Realm):Promise<unknown>{
  this.#current();const command=validate(input);need(command.role!=="invoke"&&command.method!=="Debugger.resume");
  const cleanup=command.method==="Debugger.removeBreakpoint";if(cleanup){need(this.#cleanup<10);this.#cleanup+=1;}else{need(this.#normal<55);this.#normal+=1;}
  const text=program(command);let helper:Helper|null=null;if(text!==null){need(!this.#helpers.has(realm.sessionId));helper={command,contextId:realm.contextId,scriptId:null};this.#helpers.set(realm.sessionId,helper);}
  const arm=command.method==="Debugger.setBreakpoint"||command.method==="Debugger.setBreakpointOnFunctionCall"?command.role:null;
  if(arm!==null){need(!this.#arming.has(realm.sessionId));this.#arming.set(realm.sessionId,arm);}
  this.#current();const pending=this.#keep(this.#b.request(command,realm.sessionId));this.#requests.push(pending);let raw:unknown;
  try{raw=await pending;this.#current();if(arm!==null){const id=command.method==="Debugger.setBreakpointOnFunctionCall"?point(raw):z.strictObject({breakpointId:handle,actualLocation:frameLocation}).parse(capture(raw)).breakpointId;const resolved=this.#resolved.get(arm);need(resolved===undefined||resolved.id===id&&resolved.session===realm.sessionId);this.#points.set(arm,id);}}finally{if(arm!==null){need(this.#arming.get(realm.sessionId)===arm);this.#arming.delete(realm.sessionId);}}
  if(helper!==null){await this.#qualify(command,realm,helper);}return raw;
 }
 async #qualify(command:Command,realm:Realm,helper:Helper):Promise<void>{
  this.#current();need(this.#helpers.get(realm.sessionId)===helper&&helper.command===command&&helper.scriptId!==null&&this.#helperCount<11);this.#helperCount+=1;
  const fixed=validate({phase:"inverse-native-delete-cold-ui",role:"source",method:"Debugger.getScriptSource",params:{scriptId:helper.scriptId}});this.#current();const pending=this.#keep(this.#b.request(fixed,realm.sessionId));this.#requests.push(pending);qualify(await pending,command);this.#current();need(this.#helpers.get(realm.sessionId)===helper);this.#helpers.delete(realm.sessionId);
 }
 #call(role:CallRole,id:string,refs:readonly string[],realm=this.#b.ui):Promise<unknown>{
  const fixed=spec(role);const args:unknown[]=fixed.stage===null?[]:[{value:fixed.stage}];args.push(...refs.map(objectId=>({objectId})));need(!fixed.target);
  return this.#read(validate({phase:"inverse-native-delete-cold-ui",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:id,functionDeclaration:fixed.program,arguments:args,returnByValue:fixed.byValue}}),realm);
 }
 #props(id:string,realm=this.#b.ui):Promise<unknown>{return this.#read({phase:"inverse-native-delete-cold-ui",role:"properties",method:"Runtime.getProperties",params:{objectId:id,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}},realm);}
 async #tuple(role:"resolverQueue"|"resolverTask"|"resolverMembers",refs:readonly string[],size:number):Promise<Readonly<{id:string;values:ReturnType<typeof array>}>>{
  const id=result(await this.#call(role,this.#b.primitives.reflection,refs),size),values=array(await this.#props(id),size);for(const value of values){properties(await this.#props(object(value)));}return{id,values};
 }
 async #resolver():Promise<void>{
  need(this.#resolverTask===null&&!this.#points.has("resolver"));const sender=this.#b.sender;const queue=await this.#tuple("resolverQueue",[sender.prepared],1);const task=await this.#tuple("resolverTask",[queue.id],1);const members=await this.#tuple("resolverMembers",[task.id,sender.prepared],2);
  const callback=members.values[1];const actualTask=task.values[0];need(callback?.type==="function"&&callback.description!==undefined&&actualTask!==undefined);description(callback.description,"uiBusRpcCallCallback2");
  // This callback's own metadata was inspected above; re-read the exact packet
  // Is unnecessary: tuple metadata is retained independently in #requests.
  const id=object(callback);const raw=await this.#props(id);metadata(raw,"uiBusRpcCallCallback2",this.#b.ui.scriptId);
  this.#resolverTask=object(actualTask);this.#points.set("resolver",point(await this.#read({phase:"inverse-native-delete-cold-ui",role:"resolver",method:"Debugger.setBreakpointOnFunctionCall",params:{objectId:id,condition:""}},this.#b.ui)));
 }
 async #entry(hold:Hold):Promise<void>{
  const frames=z.array(z.looseObject({callFrameId:handle,functionLocation:frameLocation,location:frameLocation})).min(2).max(64).parse(hold.event.params["callFrames"]),top=frames[0];need(top!==undefined);
  const loc=top.functionLocation;const row=SOURCE.uiRpc;need(loc.scriptId===this.#b.ui.scriptId&&loc.lineNumber===row.lineNumber&&loc.columnNumber===row.columnNumber);
  const originalCaller=frames[1];const receiverCaller=frames[2];const invokeCaller=frames[3];const invokeHelper=this.#invokeScript;
  need(originalCaller!==undefined&&receiverCaller!==undefined&&invokeCaller!==undefined&&invokeHelper!==null&&receiverCaller.functionLocation.scriptId===this.#b.receiver.originalInvokeLocation.scriptId&&receiverCaller.functionLocation.lineNumber===this.#b.receiver.originalInvokeLocation.lineNumber&&receiverCaller.functionLocation.columnNumber===this.#b.receiver.originalInvokeLocation.columnNumber&&originalCaller.functionLocation.scriptId===this.#b.sender.originalOnceLocation.scriptId&&originalCaller.functionLocation.lineNumber===this.#b.sender.originalOnceLocation.lineNumber&&originalCaller.functionLocation.columnNumber===this.#b.sender.originalOnceLocation.columnNumber&&invokeCaller.functionLocation.scriptId===invokeHelper);
  const command=validate({phase:"inverse-native-delete-cold-ui",role:"uiEntry",method:"Debugger.evaluateOnCallFrame",params:{callFrameId:top.callFrameId,expression:FRAMES.uiEntry,objectGroup:FLAGS.objectGroup,silent:true,generatePreview:false,throwOnSideEffect:true,returnByValue:false,includeCommandLineAPI:false}});
  const tuple=result(await this.#read(command,this.#b.ui),20),values=array(await this.#props(tuple),20);
  const methods=[[7,"uiBusClass"],[8,"uiTaskClass"],[9,"uiClone"],[10,"uiEnsureArray"],[11,"uiEnsure"],[12,"uiRemove"],[13,"uiWeakRef"],[14,"uiDeref"]]as const;
  for(const[index,role]of methods){const fn=values[index];need(fn?.type==="function"&&fn.description!==undefined);description(fn.description,role);metadata(await this.#props(object(fn)),role,this.#b.ui.scriptId);}
  truth(await this.#call("entry",this.#b.primitives.reflection,[tuple,this.#b.primitives.roots,this.#b.primitives.members,this.#b.sender.prepared]));
 }
 async #workerHandler(hold:Hold):Promise<void>{
  const frames=z.array(z.looseObject({callFrameId:handle,functionLocation:frameLocation,location:frameLocation})).min(2).max(64).parse(hold.event.params["callFrames"]);const top=frames[0];need(top!==undefined);
  for(const[index,key]of [[0,"workerHandler"],[1,"workerDispatch"]]as const){const frame=frames[index];const row=SOURCE[key];need(frame!==undefined&&frame.functionLocation.scriptId===this.#b.worker.scriptId&&frame.functionLocation.lineNumber===row.lineNumber&&frame.functionLocation.columnNumber===row.columnNumber);}
  const command=validate({phase:"inverse-native-delete-cold-ui",role:"workerHandler",method:"Debugger.evaluateOnCallFrame",params:{callFrameId:top.callFrameId,expression:FRAMES.workerHandler,objectGroup:FLAGS.objectGroup,silent:true,generatePreview:false,throwOnSideEffect:true,returnByValue:false,includeCommandLineAPI:false}});
  const tuple=result(await this.#read(command,this.#b.worker),2);const values=array(await this.#props(tuple,this.#b.worker),2);const argument=values[1];need(argument!==undefined);properties(await this.#props(object(argument),this.#b.worker));
  truth(await this.#call("workerHandler",this.#b.originalWorkerReflection,[tuple,this.#b.originalWorkerProof,this.#b.originalWorkerProject,this.#b.originalWorkerNeedData],this.#b.worker));
 }
 async #workerEntry(hold:Hold):Promise<void>{
  const frames=z.array(z.looseObject({callFrameId:handle,functionLocation:frameLocation,location:frameLocation})).min(4).max(64).parse(hold.event.params["callFrames"]);const top=frames[0];need(top!==undefined);
  for(const[index,key]of [[0,"workerGetData"],[1,"workerNeedData"],[2,"workerHandler"],[3,"workerDispatch"]]as const){const current=frames[index];const row=SOURCE[key];need(current!==undefined&&current.functionLocation.scriptId===this.#b.worker.scriptId&&current.functionLocation.lineNumber===row.lineNumber&&current.functionLocation.columnNumber===row.columnNumber);}
  const command=validate({phase:"inverse-native-delete-cold-ui",role:"workerEntry",method:"Debugger.evaluateOnCallFrame",params:{callFrameId:top.callFrameId,expression:FRAMES.workerEntry,objectGroup:FLAGS.objectGroup,silent:true,generatePreview:false,throwOnSideEffect:true,returnByValue:false,includeCommandLineAPI:false}});
  const tuple=result(await this.#read(command,this.#b.worker),3);array(await this.#props(tuple,this.#b.worker),3);
  truth(await this.#call("workerEntry",this.#b.originalWorkerReflection,[tuple,this.#b.originalWorkerProof],this.#b.worker));
 }
 async #resume(hold:Hold):Promise<void>{
  this.#current();const realm=this.#realm(hold.role);need(this.#holds.get(realm.sessionId)===hold&&!this.#resumes.has(realm.sessionId));
  empty.parse(capture(await this.#read({phase:"inverse-native-delete-cold-ui",role:"remove",method:"Debugger.removeBreakpoint",params:{breakpointId:hold.point}},realm)));this.#current();
  const resume:Resume={hold,acknowledged:Promise.withResolvers<null>(),observed:false};this.#resumes.set(realm.sessionId,resume);need(this.#normal<55);this.#normal+=1;this.#current();
  const pending=this.#keep(this.#b.request({phase:"inverse-native-delete-cold-ui",role:"resume",method:"Debugger.resume",params:{}},realm.sessionId));this.#requests.push(pending);empty.parse(capture(await pending));
  const started=performance.now();while(!resume.observed){this.#current();need(performance.now()-started<20_000);await this.#b.poll();}await resume.acknowledged.promise;this.#current();
  // A coalesced next pause can already occupy the session; only this exact
  // Resumed acknowledgment is required here, never a globally empty hold.
  need(this.#resumes.get(realm.sessionId)===resume);this.#resumes.delete(realm.sessionId);
 }
 async #prearm():Promise<void>{
  for(const[role,id]of [["workerHandler",this.#b.originalWorkerHandler],["workerEntry",this.#b.originalWorkerGetData],["uiEntry",this.#b.sender.rpc],["innerPush",this.#b.originalManagerPush],["fulfilledReply",this.#b.originalUiReply]]as const){const realm=this.#realm(role);const raw=await this.#read({phase:"inverse-native-delete-cold-ui",role,method:"Debugger.setBreakpointOnFunctionCall",params:{objectId:id,condition:""}},realm);this.#points.set(role,point(raw));}
  for(const role of ["workerReturned","managerReturned","uiReturned","uiTimer"]as const){
   const realm=this.#realm(role);const fixed=POINTS[role];const raw=pointResult.parse(capture(await this.#read({phase:"inverse-native-delete-cold-ui",role,method:"Debugger.getPossibleBreakpoints",params:{start:{scriptId:realm.scriptId,...fixed.start},end:{scriptId:realm.scriptId,...fixed.end},restrictToFunction:true}},realm)));
   need(raw.locations.some(location=>location.scriptId===realm.scriptId&&location.lineNumber===fixed.stop.lineNumber&&location.columnNumber===fixed.stop.columnNumber&&location.type===(role==="uiTimer"?"call":"return")));
   const set=z.strictObject({breakpointId:handle,actualLocation:frameLocation}).parse(capture(await this.#read({phase:"inverse-native-delete-cold-ui",role,method:"Debugger.setBreakpoint",params:{location:{scriptId:realm.scriptId,...fixed.stop},condition:""}},realm)));
   need(set.actualLocation.scriptId===realm.scriptId&&set.actualLocation.lineNumber===fixed.stop.lineNumber&&set.actualLocation.columnNumber===fixed.stop.columnNumber);this.#points.set(role,set.breakpointId);
  }
 }
 public start():Promise<Data>{
  if(this.#started!==null){return this.#started;}const gate=Promise.withResolvers<null>();const pending=(async():Promise<Data>=>{await gate.promise;try{
   this.#current();await this.#prearm();this.#b.beforeOriginalInvoke();const role="invoke";const fixed=spec(role);const command=validate({phase:"inverse-native-delete-cold-ui",role,method:"Runtime.callFunctionOn",params:{...FLAGS,throwOnSideEffect:false,objectId:this.#b.receiver.invoke,functionDeclaration:fixed.program,arguments:[],returnByValue:false}});
   need(!this.#invoked&&!this.#helpers.has(this.#b.ui.sessionId)&&this.#normal<55);this.#normal+=1;this.#invoked=true;const helper:Helper={command,contextId:this.#b.ui.contextId,scriptId:null};this.#helpers.set(this.#b.ui.sessionId,helper);
   this.#current();this.#b.beforeOriginalInvoke();const invocation=this.#b.submit(command,this.#b.ui.sessionId);need(types.isPromise(invocation.request)&&types.isPromise(invocation.written));this.#invocation=Object.freeze({...invocation});void this.#keep(invocation.request);void this.#keep(invocation.written);
   await invocation.written;this.#current();invocation.assertOriginalWritten();
   const returns=new Returns({...this.#b,originalUiBus:this.#b.sender.bus,originalUiSetTimeout:this.#b.primitives.originalSetTimeout,originalResolverTask:():string=>{need(this.#resolverTask!==null);return this.#resolverTask;},originalReplyTopic:this.#b.sender.replyTopic,originalInvocation:invocation,
    current:():void=>{ this.#current(); },assertOriginalHeld:(heldRole,event):void=>{ this.#held(heldRole,event); },assertOriginalContinuationsSettled:():void=>{this.#current();need(this.#complete&&this.#captures===10&&this.#queue.length===0&&this.#holds.size===0&&this.#resumes.size===0);},
    request:(value,sessionId):Promise<unknown>=>this.#returnRequest(value,sessionId),qualifyHelper:(value,sessionId):Promise<void>=>this.#returnHelper(value,sessionId)});this.#returns=returns;
   while(this.#captures<10){const started=performance.now();while(this.#queue.length===0){this.#current();need(performance.now()-started<20_000);await this.#b.poll();}
    const hold=this.#queue.shift();need(hold!==undefined);this.#current();invocation.assertOriginalWritten();
    if(hold.role==="uiEntry"){need(this.#captures===0&&helper.scriptId!==null);this.#invokeScript=helper.scriptId;await this.#qualify(command,this.#b.ui,helper);await this.#entry(hold);}else if(hold.role==="workerHandler"){await this.#workerHandler(hold);}else if(hold.role==="workerEntry"){await this.#workerEntry(hold);}else{await returns.captureOriginalHeld(hold.role,hold.event);if(hold.role==="uiTimer"){await this.#resolver();}}
    await this.#resume(hold);this.#captures+=1;
   }
   this.#complete=true;this.#current();await invocation.request;this.#current();const data=await returns.completeOriginal();this.#current();truth(await this.#call("after",this.#b.sender.after,[]));
   need(this.#cleanup===10&&this.#helperCount===11&&this.#normal===55);this.#result=Object.freeze({data,returns});return data;
  }catch(error){this.#fail(error);throw error;}})();this.#started=pending;void this.#keep(pending);gate.resolve(null);return pending;
 }
 #returnRequest(command:Command,sessionId:string):Promise<unknown>{
  this.#current();const realm=this.#bySession(sessionId);const fixed=validate(command);need(fixed.method==="Runtime.callFunctionOn"&&["retain","same"].includes(fixed.role)||fixed.method==="Runtime.awaitPromise"||fixed.method==="Runtime.getProperties"||fixed.method==="Debugger.evaluateOnCallFrame");
  if(program(fixed)!==null){need(!this.#helpers.has(sessionId));this.#helpers.set(sessionId,{command,contextId:realm.contextId,scriptId:null});}
  this.#current();const pending=this.#keep(this.#b.request(command,sessionId));this.#requests.push(pending);return pending;
 }
 async #returnHelper(command:Command,sessionId:string):Promise<void>{
  this.#current();const helper=this.#helpers.get(sessionId);need(helper!==undefined&&helper.command===command&&helper.scriptId!==null);const fixed=validate({phase:"inverse-native-delete-cold-ui",role:"source",method:"Debugger.getScriptSource",params:{scriptId:helper.scriptId}});
  this.#current();const pending=this.#keep(this.#b.request(fixed,sessionId));this.#requests.push(pending);qualify(await pending,command);this.#current();need(this.#helpers.get(sessionId)===helper);this.#helpers.delete(sessionId);
 }
 public requireOriginal(data:Data):void{this.#current();need(this.#result?.data===data);this.#result.returns.requireOriginal(data);}
 public requireOriginalAfterOriginalExit(data:Data):void{this.#b.assertOriginalExit();need(this.#endCompleted&&!this.#failed&&this.#result?.data===data);this.#result.returns.requireOriginalAfterOriginalExit(data);}
 public settleAfterOriginalExit():Promise<void>{
  this.#b.assertOriginalExit();if(this.#end!==null){return this.#end;}this.#ended=true;const gate=Promise.withResolvers<null>();const pending=(async():Promise<void>=>{await gate.promise;const returns=this.#returns;const end=returns===null?null:(async():Promise<void>=>{await returns.settleAfterOriginalExit();})();const settled=await Promise.allSettled([end,this.#started,this.#invocation?.request,this.#invocation?.written,...this.#requests,...this.#joins]);this.#b.assertOriginalExit();const cleanup=settled[0];if(cleanup?.status==="rejected"){throw cleanup.reason;}this.#endCompleted=true;})();this.#end=pending;gate.resolve(null);return pending;
 }
}
Object.freeze(CurrentFootprintInverseNativeDeleteColdUiController.prototype);Object.freeze(CurrentFootprintInverseNativeDeleteColdUiController);
export function assertOriginalCurrentFootprintInverseNativeDeleteColdUiController(value:CurrentFootprintInverseNativeDeleteColdUiController):void{need(value!==null&&typeof value==="object"&&!types.isProxy(value)&&originalControllers.has(value)&&Object.getPrototypeOf(value)===CurrentFootprintInverseNativeDeleteColdUiController.prototype&&Reflect.ownKeys(value).length===0);}
