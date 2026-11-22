/** Original pre-mutation watch registration. No application callback is reinvoked.
  * The enclosing factory owns the canonical reflection tuple and birth anchors. */
 import {types} from "node:util";
 import {z} from "zod";
 import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
 import {CurrentSchematicWireEventObserver} from "./current-schematic-wire-event-observer.ts";
 import type {CurrentSchematicWireEventRecord} from "./current-schematic-wire-event-observer.ts";
 import {CURRENT_SCHEMATIC_WIRE_NET_WATCH_SOURCE as SOURCE,qualifyCurrentSchematicWireNetWatchFunction,qualifyCurrentSchematicWireNetWatchSource} from "./current-schematic-wire-net-watch-source.ts";
 import type {CurrentSchematicWireNetWatchRole} from "./current-schematic-wire-net-watch-source.ts";
 import {CURRENT_SCHEMATIC_WIRE_NET_WATCH_LIMIT as LIMIT,currentSchematicWireNetWatchCall as call,currentSchematicWireNetWatchFrame as frame,validateCurrentSchematicWireNetWatchCommand as validate} from "./current-schematic-wire-net-watch-protocol.ts";
 import type {CurrentSchematicWireNetWatchCommand as Command,CurrentSchematicWireNetWatchPreflight,CurrentSchematicWireNetWatchRegistration} from "./current-schematic-wire-net-watch-protocol.ts";
 import {netWatchArray as array,netWatchArrayCapture as arrayCapture,netWatchNative as nativeFunction,netWatchNeed as need,netWatchObject as object,netWatchProperties as properties,netWatchRemote as remote,netWatchResult as remoteResult,netWatchTrue as truth} from "./current-schematic-wire-net-watch-replies.ts";
 import type {NetWatchRemote as Remote} from "./current-schematic-wire-net-watch-replies.ts";

 const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);const site=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
 const pauseFrame=z.strictObject({callFrameId:handle,location:site,functionLocation:site,returnValue:remote.optional()});
 const pauseParams=z.strictObject({reason:z.literal("other"),hitBreakpoints:z.array(handle).length(1),callFrames:z.array(pauseFrame).min(1).max(2)});
 const paused=z.strictObject({sessionId:handle,method:z.literal("Debugger.paused"),params:pauseParams});
 const empty=z.strictObject({});
 type PointRole="watch"|"event"|"register"|"returned"|"parentRegister"|"parentReturned";
 type ArmRole=Exclude<PointRole,"parentRegister">;
 interface Arm{readonly role:ArmRole;readonly id:string;qualified:boolean;attempted:boolean;removed:boolean}
 interface Held{readonly original:CurrentSchematicWireEventRecord;readonly role:PointRole;readonly frame:string;readonly caller:string|null;readonly returned:Remote|undefined}
 interface Attempt{readonly command:Command;readonly cleanup:boolean;pending:Promise<unknown>|null;raw?:unknown;cause?:unknown}
 export interface CurrentSchematicWireNetWatchTransport{
  readonly request:(command:Command)=>Promise<unknown>;
  /** Reprove this same factory, birth/page/realm and canonical native tuple. */
  readonly assertCurrent:()=>void;
 /** The factory must retain the exact original whole-source receipt, matched to this session/script/variant. */
 readonly assertOriginalSourceReceipt:(source:unknown,binding:Readonly<{sessionId:string;scriptId:string;variant:0|1}>)=>void;readonly assertOriginalWriterHolder:(holder:string)=>void;readonly assertOriginalExit:()=>void;readonly fail:(cause:unknown)=>void;
 }
 interface Input{readonly sessionId:string;readonly scriptId:string;readonly variant:0|1;readonly native:string;readonly net:string;readonly shapes:string;readonly page:string;readonly source:unknown}
 function at(a:z.infer<typeof site>,b:z.infer<typeof site>):boolean{return a.scriptId===b.scriptId&&a.lineNumber===b.lineNumber&&a.columnNumber===b.columnNumber;}
 async function settled(task:Promise<unknown>|null):Promise<void>{if(task!==null){try{await task;}catch{
 // Original failure stays in its request and owner.
 }}}
 export class CurrentSchematicWireNetWatchDriver{
  readonly #input:Readonly<Omit<Input,"source">>;readonly #sourceReceipt:unknown;readonly #sourceBinding:Readonly<{sessionId:string;scriptId:string;variant:0|1}>;readonly #transport:CurrentSchematicWireNetWatchTransport;readonly #observer:CurrentSchematicWireEventObserver;
  readonly #arms:Arm[]=[];readonly #attempts:Attempt[]=[];readonly #events:CurrentSchematicWireEventRecord[]=[];
  readonly #ready=Promise.withResolvers<CurrentSchematicWireNetWatchRegistration>();
  #prepare:Promise<null>|null=null;#tail:Promise<void>=Promise.resolve();#retire:Promise<void>|null=null;
  #failure:Readonly<{cause:unknown}>|null=null;#notification:Readonly<{cause:unknown}>|null=null;#closing=false;
  #source:Readonly<{program:string;scripts:string[]}>|null=null;#normal=0;#cleanup=0;#sources=0;#pauses=0;#resumes=0;
  #prepared=false;#step=0;#completed=0;#resume:Readonly<{signal:PromiseWithResolvers<null>;event:{seen:boolean}}>|null=null;
  #seal:string|null=null;#eventFrame:string|null=null;#registerFrame:string|null=null;#parentFrame:string|null=null;
  #registration:CurrentSchematicWireNetWatchRegistration|null=null;#preflight:CurrentSchematicWireNetWatchPreflight|null=null;
  #bindTask:Promise<CurrentSchematicWireNetWatchPreflight>|null=null;#bindReady:PromiseWithResolvers<CurrentSchematicWireNetWatchPreflight>|null=null;#holder:string|null=null;
  public constructor(input:Input,transport:CurrentSchematicWireNetWatchTransport){
   need(input.source!==null&&typeof input.source==="object"&&!types.isProxy(input.source)&&Object.isFrozen(input.source)&&!Object.is(input.variant,-0)&&qualifyCurrentSchematicWireNetWatchSource(input.source)===input.variant);
   this.#input=Object.freeze({sessionId:handle.parse(input.sessionId),scriptId:handle.parse(input.scriptId),variant:input.variant,native:handle.parse(input.native),net:handle.parse(input.net),shapes:handle.parse(input.shapes),page:handle.parse(input.page)});
   this.#sourceReceipt=input.source;this.#sourceBinding=Object.freeze({sessionId:this.#input.sessionId,scriptId:this.#input.scriptId,variant:this.#input.variant});transport.assertOriginalSourceReceipt(this.#sourceReceipt,this.#sourceBinding);this.#transport=transport;this.#observer=new CurrentSchematicWireEventObserver(this);void settled(this.#ready.promise);Object.freeze(this);
  }
  #current(cleanup=false):void{if(!cleanup&&this.#failure!==null){throw this.#failure.cause;}this.#transport.assertCurrent();if(!cleanup){need(!this.#closing);this.#transport.assertOriginalSourceReceipt(this.#sourceReceipt,this.#sourceBinding);if(this.#holder!==null){this.#transport.assertOriginalWriterHolder(this.#holder);}if(this.#notification!==null){throw this.#notification.cause;}}}
  #fail(cause:unknown):void{this.#failure??=Object.freeze({cause});this.#ready.reject(this.#failure.cause);this.#bindReady?.reject(this.#failure.cause);this.#resume?.signal.reject(this.#failure.cause);try{this.#transport.fail(this.#failure.cause);}catch(error){this.#notification??=Object.freeze({cause:error});}}
  async #send(input:Command,cleanup=false):Promise<unknown>{
   this.#current(cleanup);const command=validate(input);if(cleanup){need(this.#cleanup<LIMIT.cleanup);this.#cleanup+=1;}else{need(this.#normal<LIMIT.normal);this.#normal+=1;}
   const attempt:Attempt={command,cleanup,pending:null};this.#attempts.push(attempt);let generated:Readonly<{program:string;scripts:string[]}>|null=null;
   if(command.method==="Runtime.callFunctionOn"){need(this.#source===null);generated={program:command.params.functionDeclaration,scripts:[]};this.#source=generated;}
   try{const pending=this.#transport.request(command);need(types.isPromise(pending));attempt.pending=pending;const raw=await pending;attempt.raw=raw;if(command.phase==="net-watch-arm"){const ack=z.object({breakpointId:handle}).parse(capture(raw).value);const role=z.enum(["watch","event","register","returned","parentReturned"]).parse(command.role);need(!this.#arms.some(x=>x.id===ack.breakpointId)&&!this.#arms.some(x=>x.role===role));this.#arms.push({role,id:ack.breakpointId,qualified:false,attempted:false,removed:false});}this.#current(cleanup);
    if(generated!==null){need(this.#source===generated&&generated.scripts.length===1&&this.#sources<LIMIT.helperSources);const scriptId=generated.scripts[0];need(scriptId!==undefined);this.#source=null;
     const actual=z.strictObject({scriptSource:z.string().max(16_384)}).parse(capture(await this.#send({phase:"net-watch-source",method:"Debugger.getScriptSource",params:{scriptId}},cleanup)).value);
     need(actual.scriptSource===`(${generated.program})`);this.#sources+=1;
    }return raw;
   }catch(error){attempt.cause=error;this.#fail(error);throw error;}finally{if(this.#source===generated){this.#source=null;}}
  }
  #properties(objectId:string):Promise<unknown>{return this.#send({phase:"net-watch-properties",method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}
  async #tuple(raw:unknown,n:number):Promise<Readonly<{id:string;values:ReadonlyMap<string,Remote>}>>{const id=arrayCapture(raw,n);return Object.freeze({id,values:array(await this.#properties(id),n)});}
  async #frame(role:Parameters<typeof frame>[0],id:string,n:number):Promise<Readonly<{id:string;values:ReadonlyMap<string,Remote>}>>{const raw=await this.#send(frame(role,id));return this.#tuple(raw,n);}
  async #function(value:Remote|undefined,role:CurrentSchematicWireNetWatchRole):Promise<string>{const id=object(value,"function");return qualifyCurrentSchematicWireNetWatchFunction(await this.#properties(id),value,this.#input.variant,role,this.#input.scriptId);}
  async #arm(role:ArmRole):Promise<void>{const profile=SOURCE[this.#input.variant].points[role];const location={scriptId:this.#input.scriptId,...profile};const ack=z.strictObject({breakpointId:handle,actualLocation:site}).parse(capture(await this.#send({phase:"net-watch-arm",role,method:"Debugger.setBreakpoint",params:{location,condition:""}})).value);const arm=this.#arms.find(x=>x.role===role&&x.id===ack.breakpointId);need(arm!==undefined&&!arm.qualified&&at(ack.actualLocation,location));arm.qualified=true;}
  public prepare():Promise<null>{
   if(this.#prepare!==null){return this.#prepare;}this.#current();const ready=Promise.withResolvers<null>();this.#prepare=ready.promise;void settled(ready.promise);
   void(async():Promise<void>=>{try{await this.#arm("watch");this.#prepared=true;ready.resolve(null);}catch(error){this.#fail(error);ready.reject(error);}})();return ready.promise;
  }
  public observeObject(input:unknown):boolean{try{return this.#observe(this.#observer.captureObject(input,this));}catch(error){this.#fail(error);return true;}}
  public observeRaw(input:string):boolean{try{return this.#observe(this.#observer.captureRaw(input,this));}catch(error){this.#fail(error);return true;}}
  #retain(original:CurrentSchematicWireEventRecord):void{need(this.#events.length<LIMIT.events);this.#observer.requireOriginal(original,this);this.#events.push(original);}
  #observe(original:CurrentSchematicWireEventRecord):boolean{
   if(this.#closing){return false;}this.#current();const envelope=z.strictObject({sessionId:handle,method:z.string(),params:z.unknown()}).parse(capture(original.event).value);if(envelope.sessionId!==this.#input.sessionId){return false;}
   if(envelope.method==="Debugger.scriptParsed"){const script=z.strictObject({scriptId:handle,url:z.string(),length:z.number().int().nonnegative()}).parse(envelope.params);const active=this.#source;if(active===null||script.url!==""||script.length!==active.program.length+2){return false;}need(active.scripts.length===0);active.scripts.push(script.scriptId);this.#retain(original);return true;}
   if(envelope.method==="Debugger.resumed"){empty.parse(envelope.params);const active=this.#resume;need(active!==null&&!active.event.seen&&this.#resumes<LIMIT.resumes);this.#retain(original);active.event.seen=true;active.signal.resolve(null);return true;}
   need(envelope.method==="Debugger.paused"&&this.#prepared&&this.#pauses<LIMIT.pauses);const data=paused.parse(capture(original.event).value).params;const top=data.callFrames[0];need(top!==undefined);const role=(["watch","event","register","returned","parentRegister","parentReturned"]as const)[this.#pauses];need(role!==undefined);const arm=this.#arms.find(x=>x.role===(role==="parentRegister"?"register":role));const profile=SOURCE[this.#input.variant];const pin=profile.points[role];need(arm!==undefined&&arm.qualified&&!arm.attempted&&!arm.removed&&data.hitBreakpoints[0]===arm.id&&at(top.location,{scriptId:this.#input.scriptId,...pin}));
   let metadataRole:CurrentSchematicWireNetWatchRole="watch";if(role==="event"){metadataRole="dispatcherEvent";}else if(role==="register"||role==="parentRegister"||role==="parentReturned"){metadataRole="register";}const row=profile.rows[metadataRole];need(at(top.functionLocation,{scriptId:this.#input.scriptId,lineNumber:row.lineNumber,columnNumber:row.columnNumber}));const caller=data.callFrames[1];
   if(role==="event"||role==="register"){const expected=profile.points[role==="event"?"eventCaller":"registerCaller"];const watch=profile.rows.watch;need(caller!==undefined&&at(caller.location,{scriptId:this.#input.scriptId,...expected})&&at(caller.functionLocation,{scriptId:this.#input.scriptId,lineNumber:watch.lineNumber,columnNumber:watch.columnNumber}));}
   if(role==="parentRegister"||role==="parentReturned"){const expected=profile.points.parentCaller;const outer=profile.rows.baseWatch;need(caller!==undefined&&at(caller.location,{scriptId:this.#input.scriptId,...expected})&&at(caller.functionLocation,{scriptId:this.#input.scriptId,lineNumber:outer.lineNumber,columnNumber:outer.columnNumber}));}
    this.#retain(original);this.#pauses+=1;const held:Held=Object.freeze({original,role,frame:top.callFrameId,caller:caller?.callFrameId??null,returned:top.returnValue});
   const prior=this.#tail;this.#tail=(async():Promise<void>=>{await prior;try{await this.#process(held);}catch(error){this.#fail(error);}})();return true;
  }
  async #resumeOnce():Promise<void>{need(this.#resume===null&&this.#resumes<LIMIT.resumes);const active={signal:Promise.withResolvers<null>(),event:{seen:false}};void settled(active.signal.promise);this.#resume=active;empty.parse(capture(await this.#send({phase:"net-watch-resume",method:"Debugger.resume",params:{}})).value);await active.signal.promise;this.#current();need(this.#resume===active&&active.event.seen);this.#resume=null;this.#resumes+=1;}
  async #remove():Promise<void>{let failure:Readonly<{cause:unknown}>|null=null;for(const arm of this.#arms){if(!arm.attempted){arm.attempted=true;try{empty.parse(capture(await this.#send({phase:"net-watch-remove",method:"Debugger.removeBreakpoint",params:{breakpointId:arm.id}},true)).value);arm.removed=true;}catch(error){failure??=Object.freeze({cause:error});}}}if(failure!==null){throw failure.cause;}}
  async #watch(held:Held):Promise<void>{
   const n=this.#input.native;const first=await this.#frame("watch",held.frame,1);const net=object(first.values.get("0"));
   const selected=await this.#send(call("selectNet",net,[n,this.#input.net]));const roots=await this.#tuple(selected,3);const shapes=object(roots.values.get("0"));const subs=object(roots.values.get("1"));const netProto=object(roots.values.get("2"));
   const netFields=properties(await this.#properties(netProto));const watch=await this.#function(netFields.fields.get("watch")?.value,"watch");
   const shapeRaw=await this.#send(call("selectShape",shapes,[n]));const shape=await this.#tuple(shapeRaw,3);const bbox=object(shape.values.get("0"));const page=object(shape.values.get("1"));const shapeProto=object(shape.values.get("2"));const shapeFields=properties(await this.#properties(shapeProto));const baseWatch=await this.#function(shapeFields.fields.get("baseWatch")?.value,"baseWatch");
   const bboxRaw=await this.#send(call("selectBbox",bbox,[n]));const box=await this.#tuple(bboxRaw,2);const dispatcher=object(box.values.get("0"));const bboxProto=object(box.values.get("1"));
   const bboxFields=properties(await this.#properties(bboxProto));const onUpdate=await this.#function(bboxFields.fields.get("onUpdate")?.get,"bboxOnUpdate");
   const dispatcherFields=properties(await this.#properties(dispatcher));const dispatcherProto=object(dispatcherFields.parent);const dispatchFields=properties(await this.#properties(dispatcherProto));const baseProto=object(dispatchFields.parent);const baseFields=properties(await this.#properties(baseProto));const eventGet=await this.#function(baseFields.fields.get("event")?.get,"dispatcherEventGet");
   const subsRaw=await this.#send(call("selectProto",subs,[n]));const sub=await this.#tuple(subsRaw,1);const subsProto=object(sub.values.get("0"));const subFields=properties(await this.#properties(subsProto));const register=await this.#function(subFields.fields.get("register")?.value,"register");
   const ownSubs=properties(await this.#properties(subs));need(ownSubs.fields.size===2);for(const row of ownSubs.fields.values()){need(row.symbol?.type==="symbol"&&row.value?.type==="object"&&row.value.subtype==="set"&&row.value.className==="Set");}
   const options=object(dispatcherFields.fields.get("_options")?.value);const callbacks=object(dispatcherFields.fields.get("_listenerSubscriptions")?.value);need(properties(await this.#properties(options)).fields.size===0);array(await this.#properties(callbacks),0);
   const primitiveRaw=await this.#send(call("primitiveRoots",n,[n]));const global=await this.#tuple(primitiveRaw,6);object(global.values.get("0"));object(global.values.get("1"),"function");for(let i=2;i<6;i+=1){object(global.values.get(String(i)),"function");}
   const methodRaw=await this.#send(call("primitives",n,[n,global.id]));const methods=await this.#tuple(methodRaw,7);for(let i=0;i<7;i+=1){const actual=methods.values.get(String(i));need(actual!==undefined);nativeFunction(await this.#properties(object(actual,"function")),actual,i);}
   const sealed=await this.#send(call("snapshot",first.id,[n,this.#input.net,this.#input.shapes,this.#input.page,net,shapes,page,subs,bbox,dispatcher,netProto,bboxProto,dispatcherProto,baseProto,subsProto,watch,onUpdate,eventGet,register,global.id,methods.id,shapeProto,baseWatch]));this.#seal=object(remoteResult(sealed));
   for(const role of["event","register","returned"]as const){await this.#arm(role);}
  }
  async #process(held:Held):Promise<void>{
   this.#current();this.#observer.requireOriginal(held.original,this);const index=(["watch","event","register","returned","parentRegister","parentReturned"]as const).indexOf(held.role);need(index===this.#step);const n=this.#input.native;
   if(held.role==="watch"){await this.#watch(held);}
   else{need(this.#seal!==null);
    if(held.role==="event"){need(held.caller!==null);const top=await this.#frame("event",held.frame,2);const caller=await this.#frame("caller",held.caller,2);const observed=await this.#send(call("event",top.id,[n,this.#seal,caller.id]));const proof=await this.#tuple(observed,5);await this.#function(proof.values.get("2"),"dispatcherEvent");await this.#function(proof.values.get("1"),"listener");this.#eventFrame=proof.id;}
    else if(held.role==="register"){need(held.caller!==null&&this.#eventFrame!==null);const top=await this.#frame(this.#input.variant===0?"register0":"register1",held.frame,4);const caller=await this.#frame("caller",held.caller,2);const observed=await this.#send(call("register",top.id,[n,this.#seal,this.#eventFrame,caller.id]));const proof=await this.#tuple(observed,3);await this.#function(proof.values.get("1"),"dispose");this.#registerFrame=proof.id;}
    else if(held.role==="returned"){need(this.#eventFrame!==null&&this.#registerFrame!==null);const top=await this.#frame("returned",held.frame,2);const actualReturn=object(held.returned);truth(await this.#send(call("returned",top.id,[n,this.#seal,this.#eventFrame,this.#registerFrame,actualReturn])));}
     else if(held.role==="parentRegister"){need(held.caller!==null&&this.#eventFrame!==null&&this.#registerFrame!==null);const top=await this.#frame(this.#input.variant===0?"register0":"register1",held.frame,4);const caller=await this.#frame("caller",held.caller,2);const observed=await this.#send(call("parent",top.id,[n,this.#seal,this.#eventFrame,this.#registerFrame,caller.id]));this.#parentFrame=arrayCapture(observed,4);await this.#arm("parentReturned");}
     else{need(this.#eventFrame!==null&&this.#registerFrame!==null&&this.#parentFrame!==null);const top=await this.#frame(this.#input.variant===0?"register0":"register1",held.frame,4);const actualReturn=object(held.returned);truth(await this.#send(call("parentReturned",top.id,[n,this.#seal,this.#eventFrame,this.#registerFrame,this.#parentFrame,actualReturn])));await this.#remove();}
   }
   this.#completed+=1;this.#step+=1;this.#observer.requireOriginal(held.original,this);await this.#resumeOnce();
   if(held.role==="parentReturned"){need(this.#completed===6&&this.#pauses===6&&this.#resumes===6&&this.#cleanup===5&&this.#arms.every(x=>x.removed));const packet:CurrentSchematicWireNetWatchRegistration=Object.freeze({schema:"private.schematic-wire-original-net-watch-registration.v1",originalWatchNormalReturn:true,originalEventArgumentAndReceiverCompared:true,originalRegisterArgumentAndReceiverCompared:true,originalListenerSourceQualified:true,originalWatchClosureReceiverJoined:true,originalBboxUpdateRosterOne:true,originalParentSubscriptionMembershipCompared:true,originalBaseWatchParentRegistrationCompared:true,originalWholeScriptSourceJoined:false,originalNativeOwnerJoined:false,writerPreMutationBound:false,markerRefreshObserved:false,sourceSerializationObserved:false,modifyAuthorized:false,saveAuthorized:false,suppliedTransportOnly:true,normalRequests:this.#normal,helperSources:this.#sources,cleanupRequests:this.#cleanup});this.#registration=packet;this.#ready.resolve(packet);}
  }
  public waitForOriginalRegistration():Promise<CurrentSchematicWireNetWatchRegistration>{this.#current();need(this.#prepared);return this.#ready.promise;}
  public requireOriginalRegistration(packet:CurrentSchematicWireNetWatchRegistration):Readonly<{seal:string;event:string;register:string;parent:string}>{this.#current();need(this.#registration===packet&&this.#seal!==null&&this.#eventFrame!==null&&this.#registerFrame!==null&&this.#parentFrame!==null);return Object.freeze({seal:this.#seal,event:this.#eventFrame,register:this.#registerFrame,parent:this.#parentFrame});}
  public bindOriginalWriterPreMutation(packet:CurrentSchematicWireNetWatchRegistration,holder:string):Promise<CurrentSchematicWireNetWatchPreflight>{
   this.#current();if(this.#bindTask!==null){need(this.#registration===packet&&this.#holder===holder);return this.#bindTask;}const retained=this.requireOriginalRegistration(packet);handle.parse(holder);this.#transport.assertOriginalWriterHolder(holder);const ready=Promise.withResolvers<CurrentSchematicWireNetWatchPreflight>();this.#bindReady=ready;this.#bindTask=ready.promise;this.#holder=holder;void settled(ready.promise);const prior=this.#tail;
   this.#tail=(async():Promise<void>=>{try{await prior;this.#current();const slots=array(await this.#properties(holder),2);const b=object(slots.get("0"));const state=object(slots.get("1"));const bFields=properties(await this.#properties(b));for(const name of["shapes","page","runner","line","group","metadata","host"]){object(bFields.fields.get(name)?.value);}const stateFields=properties(await this.#properties(state));object(stateFields.fields.get("before")?.value);
    truth(await this.#send(call("bind",holder,[this.#input.native,retained.seal,retained.event,retained.register,retained.parent])));
    need(this.#sources===LIMIT.helperSources&&this.#normal===LIMIT.normal&&this.#cleanup===LIMIT.cleanup&&this.#events.length===LIMIT.events);
    const result:CurrentSchematicWireNetWatchPreflight=Object.freeze({schema:"private.schematic-wire-original-net-watch-preflight.v1",originalRegistrationConsumed:true,originalBaseWatchParentRegistrationCompared:true,originalWriterPreMutationStateCompared:true,originalBboxUpdateRosterOne:true,originalListenerAndSubscriptionRecompared:true,originalSourcePrimitivesQualified:true,originalWholeScriptSourceJoined:false,originalNativeOwnerJoined:false,continuousGlobalsVerified:false,markerRefreshObserved:false,sourceSerializationObserved:false,modifyAuthorized:false,saveAuthorized:false,suppliedTransportOnly:true,normalRequests:this.#normal,helperSources:this.#sources,cleanupRequests:this.#cleanup});this.#preflight=result;ready.resolve(result);
   }catch(error){this.#fail(error);}})();return ready.promise;
  }
  public requireOriginalPreflight(packet:CurrentSchematicWireNetWatchPreflight):Readonly<{registration:CurrentSchematicWireNetWatchRegistration;holder:string}>{this.#current();need(this.#preflight===packet&&this.#registration!==null&&this.#holder!==null);return Object.freeze({registration:this.#registration,holder:this.#holder});}
  /** Internal source continuation reads the original preflight binding on every hold. */
  public requireOriginalGeometryBinding(packet: CurrentSchematicWireNetWatchPreflight): Readonly<{
   sessionId: string; scriptId: string; variant: 0 | 1; native: string; holder: string;
   source: unknown; seal: string; event: string; register: string; parent: string;
  }> {
   const bound = this.requireOriginalPreflight(packet);
   const original = this.requireOriginalRegistration(bound.registration);
   const {sessionId, scriptId, variant, native} = this.#input;
   return Object.freeze({sessionId, scriptId, variant, native, holder: bound.holder, source: this.#sourceReceipt, ...original});
  }
  public inspect():Readonly<{ownedArms:number;qualifiedArms:number;pendingArmCleanup:number;normalRequests:number;failed:boolean;originalNativeOwnerJoined:false}>{return Object.freeze({ownedArms:this.#arms.length,qualifiedArms:this.#arms.filter(x=>x.qualified).length,pendingArmCleanup:this.#arms.filter(x=>!x.removed).length,normalRequests:this.#normal,failed:this.#failure!==null,originalNativeOwnerJoined:false});}
  public retireAfterOriginalExit():Promise<void>{if(this.#retire!==null){return this.#retire;}this.#current(true);this.#transport.assertOriginalExit();this.#closing=true;this.#ready.reject(this.#failure?.cause??new Error("WIRE_NET_WATCH_ORIGINAL_EXIT"));this.#bindReady?.reject(this.#failure?.cause??new Error("WIRE_NET_WATCH_ORIGINAL_EXIT"));this.#resume?.signal.reject(this.#failure?.cause??new Error("WIRE_NET_WATCH_ORIGINAL_EXIT"));const task=(async():Promise<void>=>{await settled(this.#prepare);await this.#tail;await this.#remove();for(const attempt of this.#attempts){await settled(attempt.pending);}this.#transport.assertOriginalExit();})();this.#retire=task;return task;}
 }
 Object.freeze(CurrentSchematicWireNetWatchDriver.prototype);Object.freeze(CurrentSchematicWireNetWatchDriver);
