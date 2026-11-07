/** Same original worker/event lane only. Two waves allow the opening's ready
 * continuation to run before the dropped mount Promise's final continuation. */
import { types } from "node:util";
import { z } from "zod";
import { requireOriginalCurrentProjectLibraryRefreshOrigin } from "./current-pcb-diagnostic-owner.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintCopyClockRpcV2ArrayCapture as arrayId,currentFootprintCopyClockRpcV2ArrayObject as objectAt } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import type { CurrentProjectLibraryRefreshBindings,CurrentProjectLibraryRefreshOrigin } from "./current-project-library-refresh-origin.ts";
import { CURRENT_PROJECT_LIBRARY_REFRESH_PROGRAMS as PROGRAMS } from "./current-project-library-refresh-programs.ts";
import { CURRENT_PROJECT_LIBRARY_REFRESH_FLAGS as FLAGS,CURRENT_PROJECT_LIBRARY_REFRESH_REQUESTS as REQUESTS,validateCurrentProjectLibraryRefreshCommand } from "./current-project-library-refresh-protocol.ts";
import type { CurrentProjectLibraryRefreshCommand } from "./current-project-library-refresh-protocol.ts";
import { currentProjectLibraryRefreshPause,decodeCurrentProjectLibraryRefreshFrame,decodeCurrentProjectLibraryRefreshFunction,decodeCurrentProjectLibraryRefreshTuple } from "./current-project-library-refresh-replies.ts";
import { CURRENT_PROJECT_LIBRARY_REFRESH_MODULE_EXPRESSION as MODULES,CURRENT_PROJECT_LIBRARY_REFRESH_FUNCTION_PROFILES as PROFILES,CURRENT_PROJECT_LIBRARY_REFRESH_SITES as SITES,qualifyCurrentProjectLibraryRefreshSource } from "./current-project-library-refresh-source.ts";

export interface CurrentProjectLibraryRefreshPristine {readonly profile:"private.current-project-library-refresh-pristine.v1"}
export interface CurrentProjectLibraryRefreshSuspension {readonly profile:"private.current-project-library-refresh-suspension.v1"}
export interface CurrentProjectLibraryRefreshCompletion {readonly profile:"private.current-project-library-refresh-completion.v1"}
type Receipt=CurrentProjectLibraryRefreshPristine|CurrentProjectLibraryRefreshSuspension|CurrentProjectLibraryRefreshCompletion;
interface OriginalReceipt {readonly observer:CurrentProjectLibraryRefreshObserver;readonly origin:CurrentProjectLibraryRefreshOrigin;readonly owner:object;readonly operation:object}
const receipts=new WeakMap<Receipt,OriginalReceipt>();
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`PROJECT_LIBRARY_REFRESH_${code}`);}}
function requireOriginalCurrentProjectLibraryRefreshReceipt(packet:Receipt,observer:CurrentProjectLibraryRefreshObserver,origin:CurrentProjectLibraryRefreshOrigin,owner:object,operation:object):void {
 const row=receipts.get(packet);need(row!==undefined&&row.observer===observer&&row.origin===origin&&row.owner===owner&&row.operation===operation,"ORIGINAL_RECEIPT");
}
export function requireOriginalCurrentProjectLibraryRefreshPristine(packet:CurrentProjectLibraryRefreshPristine,observer:CurrentProjectLibraryRefreshObserver,origin:CurrentProjectLibraryRefreshOrigin,owner:object,operation:object):void{requireOriginalCurrentProjectLibraryRefreshReceipt(packet,observer,origin,owner,operation);need(packet.profile==="private.current-project-library-refresh-pristine.v1","PRISTINE_RECEIPT_KIND");}
export function requireOriginalCurrentProjectLibraryRefreshSuspension(packet:CurrentProjectLibraryRefreshSuspension,observer:CurrentProjectLibraryRefreshObserver,origin:CurrentProjectLibraryRefreshOrigin,owner:object,operation:object):void{requireOriginalCurrentProjectLibraryRefreshReceipt(packet,observer,origin,owner,operation);need(packet.profile==="private.current-project-library-refresh-suspension.v1","SUSPENSION_RECEIPT_KIND");}
export function requireOriginalCurrentProjectLibraryRefreshCompletion(packet:CurrentProjectLibraryRefreshCompletion,observer:CurrentProjectLibraryRefreshObserver,origin:CurrentProjectLibraryRefreshOrigin,owner:object,operation:object):void{requireOriginalCurrentProjectLibraryRefreshReceipt(packet,observer,origin,owner,operation);need(packet.profile==="private.current-project-library-refresh-completion.v1","COMPLETION_RECEIPT_KIND");}
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const event=z.strictObject({method:z.enum(["Debugger.paused","Debugger.resumed"]),sessionId:handle,params:z.unknown()});
const empty=z.strictObject({});
const suspendValue=z.strictObject({schema:z.literal("private.project-library-refresh-suspend.v1"),firstTodoExcluded:z.literal(true),timerMinusOne:z.literal(true)});
const cancelValue=z.strictObject({schema:z.literal("private.project-library-refresh-cancel.v1"),originalAnimationCancelled:z.literal(true),animationSlotRetained:z.literal(true)});
const mountValue=z.strictObject({schema:z.literal("private.project-library-refresh-mount-return.v1"),originalMountBodyNormalReturnObserved:z.literal(true),originalLoopAwaitCompleted:z.literal(true),originalMountPromiseObjectRetained:z.literal(false)});
const completedValue=z.strictObject({schema:z.literal("private.project-library-refresh-quiesced.v1"),firstTodoExcluded:z.literal(true),originalAnimationCancelled:z.literal(true),originalMountBodyNormalReturnObserved:z.literal(true),originalMountPromiseObjectRetained:z.literal(false),fullProducerFrontierVerified:z.literal(false)});
function valueReply(schema:z.ZodType,input:unknown):void{z.strictObject({result:z.strictObject({type:z.literal("object"),value:schema})}).parse(input);}
type NormalRole="firstLoop"|"loopReturned"|"mountReturned";
type Tuple=Extract<CurrentProjectLibraryRefreshCommand,{phase:"library-refresh-properties"}>["tuple"];
export class CurrentProjectLibraryRefreshObserver {
 readonly #origin:CurrentProjectLibraryRefreshOrigin;readonly #owner:object;readonly #operation:object;readonly #bindings:CurrentProjectLibraryRefreshBindings;
 readonly #points=new Map<keyof typeof SITES,string>();#pristine:string|null=null;#captured:string|null=null;#firstLoop:string|null=null;#loopReturned:string|null=null;
 #requests=0;#helpers=0;#events=0;#busy=false;#failed=false;#closed=false;#pristineAttempted=false;#armAttempted=false;#firstAttempted=false;#mountAttempted=false;
 #pristineReceipt:CurrentProjectLibraryRefreshPristine|null=null;#suspension:CurrentProjectLibraryRefreshSuspension|null=null;#completion:CurrentProjectLibraryRefreshCompletion|null=null;
 public constructor(origin:CurrentProjectLibraryRefreshOrigin,owner:object,operation:object){
  this.#origin=origin;this.#owner=owner;this.#operation=operation;const bindings=requireOriginalCurrentProjectLibraryRefreshOrigin(origin,owner,operation);
  need(bindings!==null&&typeof bindings==="object"&&!types.isProxy(bindings)&&Object.getPrototypeOf(bindings)===Object.prototype&&Object.isFrozen(bindings),"BINDINGS");
  const fields=["sessionId","scriptId","uniqueContextId","source","originalProject","request","nextEvent","assertCurrent","assertOriginalSourceHeld","assertOriginalHelperReceipt","complete","assertOriginalGenerationExited","fail"];
  need(Reflect.ownKeys(bindings).length===fields.length,"BINDING_FIELDS");for(const[index,name]of fields.entries()){const descriptor=Object.getOwnPropertyDescriptor(bindings,name);need(descriptor!==undefined&&Object.hasOwn(descriptor,"value")&&typeof descriptor.value===(index<4?"string":"function")&&!types.isProxy(descriptor.value),"BINDING_DATA");}
  handle.parse(bindings.sessionId);handle.parse(bindings.scriptId);handle.parse(bindings.uniqueContextId);qualifyCurrentProjectLibraryRefreshSource(bindings.source);this.#bindings=bindings;Object.freeze(this);
 }
 async #current():Promise<void>{need(!this.#closed&&!this.#failed&&requireOriginalCurrentProjectLibraryRefreshOrigin(this.#origin,this.#owner,this.#operation)===this.#bindings,"ORIGINAL");await this.#bindings.assertCurrent();need(!this.#closed&&!this.#failed&&requireOriginalCurrentProjectLibraryRefreshOrigin(this.#origin,this.#owner,this.#operation)===this.#bindings,"CHANGED");}
 #refuse():void{if(!this.#failed){this.#failed=true;this.#bindings.fail();}}
 #issue<T extends Receipt>(packet:T):T{receipts.set(packet,Object.freeze({observer:this,origin:this.#origin,owner:this.#owner,operation:this.#operation}));return packet;}
 async #send(input:CurrentProjectLibraryRefreshCommand):Promise<unknown>{
  const command=validateCurrentProjectLibraryRefreshCommand(input);await this.#current();this.#requests+=1;need(this.#requests<=REQUESTS.normal,"REQUEST_CAPACITY");
  const raw=await this.#bindings.request(command);await this.#current();if(command.method==="Runtime.callFunctionOn"||command.method==="Debugger.evaluateOnCallFrame"){
   this.#helpers+=1;need(this.#helpers<=REQUESTS.helperSources,"HELPER_CAPACITY");await this.#bindings.assertOriginalHelperReceipt(command,raw);await this.#current();
  }return captureCurrentPcbStringClockReply(raw).value;
 }
 #properties(objectId:string,tuple:Tuple):Promise<unknown>{return this.#send({phase:"library-refresh-properties",tuple,method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}
 async #next():Promise<z.infer<typeof event>>{await this.#current();this.#events+=1;need(this.#events<=REQUESTS.normalEvents,"EVENT_CAPACITY");const raw=event.parse(captureCurrentPcbStringClockReply(await this.#bindings.nextEvent()).value);await this.#current();need(raw.sessionId===this.#bindings.sessionId,"EVENT_SESSION");return raw;}
 async #pause(role:NormalRole):Promise<string>{const raw=await this.#next();need(raw.method==="Debugger.paused","PAUSED_EVENT");const actual=currentProjectLibraryRefreshPause(raw,this.#bindings.sessionId,this.#bindings.scriptId,this.#points);need(actual.role===role,"UNEXPECTED_SOURCE_PATH");return actual.callFrameId;}
 async #resume(role:NormalRole):Promise<void>{empty.parse(await this.#send({phase:"library-refresh-resume",role,method:"Debugger.resume",params:{}}));const raw=await this.#next();need(raw.method==="Debugger.resumed","RESUMED_EVENT");empty.parse(raw.params);}
 /** Native-global-only: legal while the original module's fu/Hm are still TDZ. */
 public async preparePristine():Promise<CurrentProjectLibraryRefreshPristine>{need(!this.#busy&&!this.#pristineAttempted&&!this.#failed,"PRISTINE_ONCE");this.#pristineAttempted=true;this.#busy=true;
  try{await this.#current();this.#bindings.assertOriginalSourceHeld();this.#pristine=arrayId(await this.#send({phase:"library-refresh-pristine",method:"Runtime.callFunctionOn",params:{...FLAGS,uniqueContextId:this.#bindings.uniqueContextId,functionDeclaration:PROGRAMS.pristine,arguments:[]}}),2);
   this.#bindings.assertOriginalSourceHeld();const fields=decodeCurrentProjectLibraryRefreshTuple(await this.#properties(this.#pristine,"pristine"),2);need(fields.get("0")?.type==="object"&&fields.get("1")?.type==="function","PRISTINE_TUPLE");this.#bindings.assertOriginalSourceHeld();
   const packet:CurrentProjectLibraryRefreshPristine=Object.freeze({profile:"private.current-project-library-refresh-pristine.v1"});this.#pristineReceipt=this.#issue(packet);return packet;
  }catch(error){this.#refuse();throw error;}finally{this.#busy=false;}
 }
 /** Only fixed breakpoints are armed; lexical modules are captured at firstLoop. */
 public async arm(pristine:CurrentProjectLibraryRefreshPristine):Promise<void>{need(!this.#busy&&!this.#armAttempted&&!this.#failed&&this.#pristineReceipt===pristine,"ARM_ONCE");requireOriginalCurrentProjectLibraryRefreshPristine(pristine,this,this.#origin,this.#owner,this.#operation);this.#armAttempted=true;this.#busy=true;
  try{await this.#current();this.#bindings.assertOriginalSourceHeld();for(const role of ["firstLoop","loopReturned","mountReturned","unexpectedAnimation","refreshTodo","refreshResume","refreshForce"]as const){
    const site=SITES[role];const raw=z.strictObject({breakpointId:handle,actualLocation:location}).parse(await this.#send({phase:"library-refresh-arm",role,method:"Debugger.setBreakpoint",params:{location:{scriptId:this.#bindings.scriptId,lineNumber:site.lineNumber,columnNumber:site.columnNumber}}}));
    this.#bindings.assertOriginalSourceHeld();need(raw.actualLocation.scriptId===this.#bindings.scriptId&&raw.actualLocation.lineNumber===site.lineNumber&&raw.actualLocation.columnNumber===site.columnNumber&&![...this.#points.values()].includes(raw.breakpointId),"ARM_REPLY");this.#points.set(role,raw.breakpointId);
   }
  }catch(error){this.#refuse();throw error;}finally{this.#busy=false;}
 }
 async #capture(callFrameId:string):Promise<void>{need(this.#pristine!==null,"PRISTINE_REQUIRED");
  const modules=arrayId(await this.#send({phase:"library-refresh-modules",method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId,expression:MODULES}}),14);decodeCurrentProjectLibraryRefreshFrame(await this.#properties(modules,"modules"),14);
  this.#captured=arrayId(await this.#send({phase:"library-refresh-capture",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:modules,functionDeclaration:PROGRAMS.capture,arguments:[{objectId:this.#pristine}]}}),15);
  const fields=decodeCurrentProjectLibraryRefreshTuple(await this.#properties(this.#captured,"captured"),15);need(fields.get("14")?.type==="function","CAPTURE_GUARD");for(const profile of PROFILES){need(fields.get(String(profile.slot))?.type==="function","CAPTURE_FUNCTION");const objectId=objectAt(fields,profile.slot);decodeCurrentProjectLibraryRefreshFunction(await this.#send({phase:"library-refresh-function",slot:profile.slot,method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}),profile.slot,this.#bindings.scriptId,this.#bindings.source);}
 }
 async #frame(role:NormalRole,callFrameId:string):Promise<string>{const site=SITES[role];const id=arrayId(await this.#send({phase:"library-refresh-frame",role,method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId,expression:site.expression}}),site.length);decodeCurrentProjectLibraryRefreshFrame(await this.#properties(id,`${role}Frame`),site.length);return id;}
 public async observeFirstLoop():Promise<CurrentProjectLibraryRefreshSuspension>{need(!this.#busy&&!this.#firstAttempted&&!this.#failed&&this.#points.size===7&&this.#pristine!==null,"FIRST_ONCE");this.#firstAttempted=true;this.#busy=true;
  try{const callFrame=await this.#pause("firstLoop");await this.#capture(callFrame);need(this.#captured!==null,"CAPTURE_REQUIRED");const firstFrame=await this.#frame("firstLoop",callFrame);
   this.#firstLoop=arrayId(await this.#send({phase:"library-refresh-first-loop",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:firstFrame,functionDeclaration:PROGRAMS.firstLoop,arguments:[{objectId:this.#bindings.originalProject()},{objectId:this.#captured}]}}),7);decodeCurrentProjectLibraryRefreshTuple(await this.#properties(this.#firstLoop,"firstLoop"),7);
   valueReply(suspendValue,await this.#send({phase:"library-refresh-suspend",method:"Runtime.callFunctionOn",params:{...FLAGS,returnByValue:true,objectId:this.#firstLoop,functionDeclaration:PROGRAMS.suspend,arguments:[]}}));await this.#resume("firstLoop");
   const returned=await this.#frame("loopReturned",await this.#pause("loopReturned"));this.#loopReturned=arrayId(await this.#send({phase:"library-refresh-loop-returned",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:returned,functionDeclaration:PROGRAMS.loopReturned,arguments:[{objectId:this.#firstLoop}]}}),3);decodeCurrentProjectLibraryRefreshTuple(await this.#properties(this.#loopReturned,"loopReturned"),3);
   valueReply(cancelValue,await this.#send({phase:"library-refresh-cancel",method:"Runtime.callFunctionOn",params:{...FLAGS,returnByValue:true,objectId:this.#loopReturned,functionDeclaration:PROGRAMS.cancel,arguments:[]}}));await this.#resume("loopReturned");
   const packet:CurrentProjectLibraryRefreshSuspension=Object.freeze({profile:"private.current-project-library-refresh-suspension.v1"});this.#suspension=this.#issue(packet);return packet;
  }catch(error){this.#refuse();throw error;}finally{this.#busy=false;}
 }
 public async observeMountReturn(suspension:CurrentProjectLibraryRefreshSuspension):Promise<CurrentProjectLibraryRefreshCompletion>{need(!this.#busy&&!this.#mountAttempted&&!this.#failed&&this.#suspension===suspension&&this.#firstLoop!==null,"MOUNT_ONCE");requireOriginalCurrentProjectLibraryRefreshSuspension(suspension,this,this.#origin,this.#owner,this.#operation);this.#mountAttempted=true;this.#busy=true;
  try{const id=await this.#frame("mountReturned",await this.#pause("mountReturned"));valueReply(mountValue,await this.#send({phase:"library-refresh-mount-returned",method:"Runtime.callFunctionOn",params:{...FLAGS,returnByValue:true,objectId:id,functionDeclaration:PROGRAMS.mountReturned,arguments:[{objectId:this.#firstLoop}]}}));await this.#resume("mountReturned");
   valueReply(completedValue,await this.#send({phase:"library-refresh-reprove",method:"Runtime.callFunctionOn",params:{...FLAGS,returnByValue:true,objectId:this.#firstLoop,functionDeclaration:PROGRAMS.reprove,arguments:[]}}));need(this.#requests===REQUESTS.normal&&this.#helpers===REQUESTS.helperSources&&this.#events===REQUESTS.normalEvents,"COMPLETE_COUNTS");await this.#bindings.complete();await this.#current();
   const packet:CurrentProjectLibraryRefreshCompletion=Object.freeze({profile:"private.current-project-library-refresh-completion.v1"});this.#completion=this.#issue(packet);return packet;
  }catch(error){this.#refuse();throw error;}finally{this.#busy=false;}
 }
 public async requireQuiesced(suspension:CurrentProjectLibraryRefreshSuspension):Promise<void>{need(this.#suspension===suspension,"SUSPENSION_CURRENT");requireOriginalCurrentProjectLibraryRefreshSuspension(suspension,this,this.#origin,this.#owner,this.#operation);await this.#current();}
 public async requireOriginal(completion:CurrentProjectLibraryRefreshCompletion):Promise<void>{need(this.#completion===completion,"COMPLETION_CURRENT");requireOriginalCurrentProjectLibraryRefreshCompletion(completion,this,this.#origin,this.#owner,this.#operation);await this.#current();}
 public status():Readonly<{pristinePrepared:boolean;armed:boolean;firstLoopQuiesced:boolean;mountCompleted:boolean;failed:boolean;normalRequests:number;helperReceipts:number;events:number}>{return Object.freeze({pristinePrepared:this.#pristineReceipt!==null,armed:this.#points.size===7,firstLoopQuiesced:this.#suspension!==null,mountCompleted:this.#completion!==null,failed:this.#failed,normalRequests:this.#requests,helperReceipts:this.#helpers,events:this.#events});}
 public async retireAfterOriginalExit():Promise<void>{need(!this.#busy&&!this.#closed,"RETIRE_STATE");await this.#bindings.assertOriginalGenerationExited();this.#closed=true;}
}
