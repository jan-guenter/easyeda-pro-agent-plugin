/* oxlint-disable import/max-dependencies -- One original timer observer joins independently qualified source, native intrinsics and actual owner/event boundaries. */
/** Deliberate session mutation under an original pre-navigation intent. No
 * effect is inferred from a timeout and no failed cancellation is retried. */
import { decodeCurrentProjectSyncQuiesceArray } from "./current-project-sync-quiesce-replies.ts";
import { types } from "node:util";
import { z } from "zod";
import { requireOriginalCurrentProjectSyncQuiesceOrigin } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentProjectSyncQuiesceBindings,CurrentProjectSyncQuiesceOrigin } from "./current-project-sync-quiesce-origin.ts";
import { CURRENT_PROJECT_SYNC_QUIESCE_PROGRAMS as PROGRAMS } from "./current-project-sync-quiesce-programs.ts";
import { CURRENT_PROJECT_SYNC_QUIESCE_ENTRY_CONDITION as CONDITION,CURRENT_PROJECT_SYNC_QUIESCE_FLAGS as FLAGS,CURRENT_PROJECT_SYNC_QUIESCE_FRAME_FLAGS as FRAME_FLAGS,CURRENT_PROJECT_SYNC_QUIESCE_CAPTURE_LENGTH as LENGTH,CURRENT_PROJECT_SYNC_QUIESCE_NATIVE_PROFILES as PROFILES,CURRENT_PROJECT_SYNC_QUIESCE_REQUESTS as REQUESTS,validateCurrentProjectSyncQuiesceCommand } from "./current-project-sync-quiesce-protocol.ts";
import { CURRENT_PROJECT_SYNC_QUIESCE_CALLER as CALLER,CURRENT_PROJECT_SYNC_QUIESCE_METHOD as METHOD,CURRENT_PROJECT_SYNC_QUIESCE_SITES as SITES,qualifyCurrentProjectSyncQuiesceSource } from "./current-project-sync-quiesce-source.ts";
import { decodeCurrentNativeFunctionMetadata } from "./current-native-function-metadata.ts";
import { decodeCurrentGeneratedSyncCallee } from "./current-generated-initial-sync-replies.ts";
import { currentFootprintCopyClockRpcV2ArrayObject,decodeCurrentFootprintCopyClockRpcV2ArrayCapture } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const frame=z.looseObject({callFrameId:handle,location,functionLocation:location});
const event=z.strictObject({method:z.enum(["Debugger.paused","Debugger.resumed"]),sessionId:handle,params:z.unknown()});
const paused=z.looseObject({reason:z.literal("other"),hitBreakpoints:z.tuple([handle]),callFrames:z.array(frame).min(2).max(64)});
const empty=z.strictObject({});
const cancelValue=z.strictObject({schema:z.literal("private.project-sync-quiesce-cancel.v1"),cancelled:z.literal(true),timerSlotRetained:z.literal(true)});
const cancelResult=z.strictObject({type:z.literal("object"),value:cancelValue});
const cancelReply=z.strictObject({result:cancelResult});
export interface CurrentProjectSyncQuiesceCompletion { readonly profile:"private.current-project-sync-quiesce-completion.v1" }
const completions=new WeakMap<CurrentProjectSyncQuiesceCompletion,Readonly<{observer:CurrentProjectSyncQuiesceObserver;owner:object;operation:object}>>();
function need(value:boolean,code:string):asserts value { if(!value) { throw new Error(`PROJECT_SYNC_QUIESCE_${code}`); } }
export class CurrentProjectSyncQuiesceObserver {
  readonly #origin:CurrentProjectSyncQuiesceOrigin;readonly #owner:object;readonly #operation:object;readonly #bindings:CurrentProjectSyncQuiesceBindings;
  readonly #points=new Map<"entry"|"returned",string>();#capture:string|null=null;#entry:string|null=null;#returned:string|null=null;
  #requests=0;#events=0;#busy=false;#armed=false;#observed=false;#failed=false;#closed=false;#completion:CurrentProjectSyncQuiesceCompletion|null=null;
  public constructor(origin:CurrentProjectSyncQuiesceOrigin,owner:object,operation:object) {
    this.#origin=origin;this.#owner=owner;this.#operation=operation;const bindings=requireOriginalCurrentProjectSyncQuiesceOrigin(origin,owner,operation);
    need(bindings!==null&&typeof bindings==="object"&&!types.isProxy(bindings)&&Object.getPrototypeOf(bindings)===Object.prototype&&Object.isFrozen(bindings),"BINDINGS");
    const fields=["sessionId","scriptId","uniqueContextId","source","originalProject","request","nextEvent","assertCurrent","complete","assertOriginalGenerationExited","fail"];need(Reflect.ownKeys(bindings).length===fields.length,"BINDING_FIELDS");for(const[index,key]of fields.entries()){const d=Object.getOwnPropertyDescriptor(bindings,key);need(d!==undefined&&Object.hasOwn(d,"value")&&typeof d.value===(index<4?"string":"function")&&!types.isProxy(d.value),"BINDING_DATA");}
    handle.parse(bindings.sessionId);handle.parse(bindings.scriptId);handle.parse(bindings.uniqueContextId);qualifyCurrentProjectSyncQuiesceSource(bindings.source);this.#bindings=bindings;Object.freeze(this);
  }
  async #current():Promise<void>{need(!this.#failed&&!this.#closed&&requireOriginalCurrentProjectSyncQuiesceOrigin(this.#origin,this.#owner,this.#operation)===this.#bindings,"ORIGINAL");await this.#bindings.assertCurrent();need(!this.#failed&&!this.#closed&&requireOriginalCurrentProjectSyncQuiesceOrigin(this.#origin,this.#owner,this.#operation)===this.#bindings,"CHANGED");}
  #refuse():void{if(!this.#failed){this.#failed=true;this.#bindings.fail();}}
  async #send(input:unknown):Promise<unknown>{const command=validateCurrentProjectSyncQuiesceCommand(input);await this.#current();this.#requests+=1;need(this.#requests<=REQUESTS.cdpRequests,"REQUEST_CAPACITY");const value=captureCurrentPcbStringClockReply(await this.#bindings.request(command)).value;await this.#current();return value;}
  #properties(objectId:string,role:"capture"|"entry"|"returned"):Promise<unknown>{return this.#send({phase:"sync-quiesce-properties",role,method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}
  public async arm():Promise<void>{need(!this.#armed&&!this.#busy&&!this.#failed,"ARM_ONCE");this.#armed=true;this.#busy=true;
    try{this.#capture=decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send({phase:"sync-quiesce-capture",method:"Runtime.callFunctionOn",params:{...FLAGS,uniqueContextId:this.#bindings.uniqueContextId,functionDeclaration:PROGRAMS.capture,arguments:[],returnByValue:false}}),LENGTH);
      const fields=decodeCurrentProjectSyncQuiesceArray(await this.#properties(this.#capture,"capture"),LENGTH);
      for(let i=0;i<LENGTH;i+=1){const value=fields.get(String(i));need(value!==undefined&&value.subtype!=="proxy","CAPTURE_PROXY");}
      for(const profile of PROFILES){const objectId=currentFootprintCopyClockRpcV2ArrayObject(fields,profile.index);decodeCurrentNativeFunctionMetadata(await this.#send({phase:"sync-quiesce-native",index:profile.index,method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}),profile);}
      for(const role of ["entry","returned"] as const){const site=SITES[role];const result=z.strictObject({breakpointId:handle,actualLocation:location}).parse(await this.#send({phase:"sync-quiesce-arm",role,method:"Debugger.setBreakpoint",params:{location:{scriptId:this.#bindings.scriptId,lineNumber:site.lineNumber,columnNumber:site.columnNumber},condition:role==="entry"?CONDITION:""}}));need(result.actualLocation.scriptId===this.#bindings.scriptId&&result.actualLocation.lineNumber===site.lineNumber&&result.actualLocation.columnNumber===site.columnNumber&&![...this.#points.values()].includes(result.breakpointId),"ARM_REPLY");this.#points.set(role,result.breakpointId);}
    }catch(error){this.#refuse();throw error;}finally{this.#busy=false;}}
  async #event():Promise<z.infer<typeof event>>{await this.#current();this.#events+=1;need(this.#events<=REQUESTS.events,"EVENT_CAPACITY");const received=event.parse(captureCurrentPcbStringClockReply(await this.#bindings.nextEvent()).value);need(received.sessionId===this.#bindings.sessionId,"EVENT_SESSION");await this.#current();return received;}
  async #pause(role:"entry"|"returned"):Promise<string>{const actual=await this.#event();need(actual.method==="Debugger.paused","PAUSE");const value=paused.parse(actual.params);const top=value.callFrames[0];const caller=value.callFrames[1];const site=SITES[role];need(top!==undefined&&caller!==undefined&&value.hitBreakpoints[0]===this.#points.get(role),"ORIGINAL_POINT");for(const[point,expected]of [[top.location,site],[top.functionLocation,{lineNumber:site.functionLineNumber,columnNumber:site.functionColumnNumber}],[caller.location,CALLER],[caller.functionLocation,{lineNumber:CALLER.functionLineNumber,columnNumber:CALLER.functionColumnNumber}]] as const){need(point.scriptId===this.#bindings.scriptId&&point.lineNumber===expected.lineNumber&&point.columnNumber===expected.columnNumber,"SOURCE_FRAME");}return top.callFrameId;}
  async #resume(role:"entry"|"returned"):Promise<void>{empty.parse(await this.#send({phase:"sync-quiesce-resume",role,method:"Debugger.resume",params:{}}));const actual=await this.#event();need(actual.method==="Debugger.resumed","RESUMED_EVENT");empty.parse(actual.params);}
  public async observeFirstTimer():Promise<CurrentProjectSyncQuiesceCompletion>{need(this.#armed&&!this.#busy&&!this.#observed&&!this.#failed&&this.#capture!==null,"OBSERVE_ONCE");this.#observed=true;this.#busy=true;
    try{const entryFrame=decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send({phase:"sync-quiesce-frame",role:"entry",method:"Debugger.evaluateOnCallFrame",params:{...FRAME_FLAGS,callFrameId:await this.#pause("entry"),expression:"[this]"}}),1);
      this.#entry=decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send({phase:"sync-quiesce-entry",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:entryFrame,functionDeclaration:PROGRAMS.entry,arguments:[{objectId:this.#bindings.originalProject()},{objectId:this.#capture}],returnByValue:false}}),5);
      const entryFields=decodeCurrentProjectSyncQuiesceArray(await this.#properties(this.#entry,"entry"),5),method=currentFootprintCopyClockRpcV2ArrayObject(entryFields,1);
      decodeCurrentGeneratedSyncCallee(await this.#send({phase:"sync-quiesce-callee",method:"Runtime.getProperties",params:{objectId:method,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}),METHOD,this.#bindings.scriptId);await this.#resume("entry");
      const returnedFrame=decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send({phase:"sync-quiesce-frame",role:"returned",method:"Debugger.evaluateOnCallFrame",params:{...FRAME_FLAGS,callFrameId:await this.#pause("returned"),expression:"[this]"}}),1);
      this.#returned=decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send({phase:"sync-quiesce-returned",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:returnedFrame,functionDeclaration:PROGRAMS.returned,arguments:[{objectId:this.#entry}],returnByValue:false}}),3);
      const returned=decodeCurrentProjectSyncQuiesceArray(await this.#properties(this.#returned,"returned"),3);need(returned.get("0")?.objectId===this.#entry&&returned.get("1")?.type==="number","RETURNED_JOIN");
      cancelReply.parse(await this.#send({phase:"sync-quiesce-cancel",method:"Runtime.callFunctionOn",params:{...FLAGS,throwOnSideEffect:false,objectId:this.#returned,functionDeclaration:PROGRAMS.cancel,arguments:[],returnByValue:true}}));
      const breakpointId=this.#points.get("returned");need(breakpointId!==undefined,"RETURNED_POINT");empty.parse(await this.#send({phase:"sync-quiesce-remove-returned",method:"Debugger.removeBreakpoint",params:{breakpointId}}));await this.#resume("returned");await this.#bindings.complete();await this.#current();
      const completion:CurrentProjectSyncQuiesceCompletion=Object.freeze({profile:"private.current-project-sync-quiesce-completion.v1"});this.#completion=completion;completions.set(completion,Object.freeze({observer:this,owner:this.#owner,operation:this.#operation}));return completion;
    }catch(error){this.#refuse();throw error;}finally{this.#busy=false;}}
  public async requireOriginal(completion:CurrentProjectSyncQuiesceCompletion):Promise<void>{const original=completions.get(completion);need(original?.observer===this&&original.owner===this.#owner&&original.operation===this.#operation&&this.#completion===completion,"COMPLETION_ORIGINAL");await this.#current();}
  public async retireAfterOriginalExit():Promise<void>{need(!this.#busy&&!this.#closed,"RETIRE_STATE");await this.#bindings.assertOriginalGenerationExited();this.#closed=true;}
}
