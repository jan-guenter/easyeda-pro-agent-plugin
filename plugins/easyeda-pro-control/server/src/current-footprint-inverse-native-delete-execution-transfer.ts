/* oxlint-disable import/max-dependencies -- Exact source grammars, original private events and four retained stages remain independent proof inputs. */
/** Own original DEL continuation held before inner RPC and worker bodies. */
import {types} from "node:util";
import type {DiagnosticEvent} from "./current-pcb-diagnostic-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteExecutionCallBindings as Call} from "./current-footprint-inverse-native-delete-execution-call.ts";
import type {CurrentFootprintInverseNativeDeleteExecutionOriginalSenderHold as Held} from "./current-footprint-inverse-native-delete-execution-call-controller.ts";
import type {CurrentFootprintInverseGetIntrinsicGraph as Native} from "./current-footprint-inverse-get-intrinsics-collector.ts";
import type {CurrentFootprintInverseNativeDeleteExecutionTransferRead as Read} from "./current-footprint-inverse-native-delete-execution-transfer-protocol.ts";
import {collectCurrentFootprintInverseNativeDeleteExecutionDependencies as collect} from "./current-footprint-inverse-native-delete-execution-dependencies-collector.ts";
import type {CurrentFootprintInverseNativeDeleteExecutionDependencyGraph as Graph} from "./current-footprint-inverse-native-delete-execution-dependencies-collector.ts";
import {currentFootprintInverseNativeDeleteExecutionDependenciesProgram as program,qualifyCurrentFootprintInverseNativeDeleteExecutionDependenciesHelper as qualify,validateCurrentFootprintInverseNativeDeleteExecutionDependenciesCommand as validate} from "./current-footprint-inverse-native-delete-execution-dependencies-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteExecutionDependenciesCommand as DependencyCommand} from "./current-footprint-inverse-native-delete-execution-dependencies-protocol.ts";
import {CurrentFootprintInverseNativeDeleteExecutionCallbackController as Callback} from "./current-footprint-inverse-native-delete-execution-callback-controller.ts";
import {CurrentFootprintInverseNativeDeleteExecutionManagerController as Manager} from "./current-footprint-inverse-native-delete-execution-manager-controller.ts";
import {CurrentFootprintInverseNativeDeleteExecutionChannelController as Channel} from "./current-footprint-inverse-native-delete-execution-channel-controller.ts";
import type {CurrentFootprintInverseNativeDeleteExecutionChannelHold as ChannelHold,CurrentFootprintInverseNativeDeleteExecutionChannelOriginal as ChannelOriginal} from "./current-footprint-inverse-native-delete-execution-channel-controller.ts";

interface Bindings{
 readonly call:Call;readonly held:Held;readonly originalPoint:string;readonly scripts:Readonly<{ui:string;manager:string;prepared:string;invoke:string}>;
 readonly native:Omit<Native,"reprove">;readonly target:Readonly<{projectUuid:string;branchUuid:string;documentUuid:string}>;readonly sessionId:string;readonly contextId:number;
 readonly current:()=>void;readonly assertOriginalEvent:(event:DiagnosticEvent)=>void;readonly assertOriginalExit:()=>void;readonly consumeOriginalCall:()=>void;
 readonly send:(read:Read,beforeTransfer?:()=>void)=>Promise<unknown>;readonly poll:()=>Promise<void>;readonly control:(action:string,phase:string,fields?:Readonly<Record<string,string>>)=>Promise<void>;
}
export interface CurrentFootprintInverseNativeDeleteExecutionInnerRpc{readonly original:ChannelOriginal;readonly graph:Graph;readonly workerPostAuthorized:false;readonly workerDeleteBodyAuthorized:false}
type Phase="dependencies"|"callback"|"manager"|"channel";
const originals=new WeakSet<object>();
function need(v:boolean):asserts v{if(!v){throw new Error("INVERSE_NATIVE_DELETE_TRANSFER_CUSTODY");}}
export class CurrentFootprintInverseNativeDeleteExecutionTransfer{
 readonly #b:Bindings;#phase:Phase="dependencies";#failed=false;#started=false;#originalCallConsumed=false;#innerConsumed=false;
 #pending:Promise<CurrentFootprintInverseNativeDeleteExecutionInnerRpc>|null=null;
 #callback:Callback|null=null;#manager:Manager|null=null;#channel:Channel|null=null;#channelToken:ChannelHold|null=null;#value:CurrentFootprintInverseNativeDeleteExecutionInnerRpc|null=null;
 #helper:{readonly command:DependencyCommand;scriptId:string|null}|null=null;
 /** Capture this original owner's same source and custody closures. */
 public constructor(bindings:Bindings){this.#b=Object.freeze({...bindings});originals.add(this);}
 /** Preserve any original owner, event or protocol failure permanently. */
 #current():void{try{this.#b.current();need(!this.#failed);}catch(error){this.#failed=true;throw error;}}
 /** Route only the original UI stream into its active stage/helper. */
 public observe(event:DiagnosticEvent):boolean{if(event.sessionId!==this.#b.sessionId||this.#innerConsumed){return false;}try{this.#current();this.#b.assertOriginalEvent(event);if(this.#phase==="dependencies"){if(event.method==="Debugger.scriptParsed"&&event.params["url"]===""){const helper=this.#helper;need(helper!==null&&helper.scriptId===null&&event.params["executionContextId"]===this.#b.contextId&&typeof event.params["scriptId"]==="string");helper.scriptId=event.params["scriptId"];return true;}return false;}const c={callback:this.#callback,manager:this.#manager,channel:this.#channel}[this.#phase];need(c!==null);return c.observe(event);}catch(error){this.#failed=true;throw error;}}
 /** Retain the same original event-pump wait. */
 async #poll():Promise<void>{this.#current();await this.#b.poll();this.#current();}
 /** Only fixed own stages reach the retained pending invocation pipe. */
 async #send(read:Read,before?:()=>void):Promise<unknown>{this.#current();const raw=await this.#b.send(read,before);this.#current();return raw;}
 /** Controls name one fixed own stage. */
 async #control(stage:Phase,phase:string,fields:Readonly<Record<string,string>>={}):Promise<void>{this.#current();await this.#b.control(`footprint-inverse-native-delete-execution-${stage}`,phase,fields);this.#current();}
 /** Burn start synchronously and retain its same original Promise. */
 public start():Promise<CurrentFootprintInverseNativeDeleteExecutionInnerRpc>{if(this.#pending!==null){return this.#pending;}need(!this.#started);this.#started=true;const pending=Promise.withResolvers<CurrentFootprintInverseNativeDeleteExecutionInnerRpc>();this.#pending=pending.promise;void(async():Promise<void>=>{try{pending.resolve(await this.#run());}catch(error){this.#failed=true;pending.reject(error);}})();return pending.promise;}
 /** Join original live operands before every actual prefix resume. */
 async #run():Promise<CurrentFootprintInverseNativeDeleteExecutionInnerRpc>{
  const b=this.#b;this.#current();let reads=0;let helpers=0;await this.#control("dependencies","bind");
  const graph=await collect({receipt:b.call.receipt,frame:b.held.frame,originalFrame:b.held.tuple,sender:b.call.sender,nativeRoots:b.native.roots,originalManagerModule:b.call.registration.module,uiScriptId:b.scripts.ui,managerScriptId:b.scripts.manager,current:():void=>{this.#current();},request:async(input):Promise<unknown>=>{this.#current();const command=validate(input);need(!command.phase.endsWith("-helper")&&this.#helper===null&&(reads+=1)<=35);const source=program(command);const helper=source===null?null:{command,scriptId:null as string|null};this.#helper=helper;const raw=await this.#send({stage:"dependencies",command});if(helper!==null){need(this.#helper===helper&&helper.scriptId!==null&&(helpers+=1)<=7);const actual=await this.#send({stage:"dependencies",command:validate({phase:"inverse-native-delete-execution-dependencies-helper",method:"Debugger.getScriptSource",params:{scriptId:helper.scriptId}})});this.#current();qualify(actual,command);this.#helper=null;}return raw;}});
  this.#current();need(reads===35&&helpers===7);await this.#control("dependencies","complete");
  const common={receipt:b.call.receipt,sender:b.call.sender,native:b.native,scripts:b.scripts,sessionId:b.sessionId,contextId:b.contextId,assertOriginalEvent:b.assertOriginalEvent,assertOriginalExit:b.assertOriginalExit,poll:():Promise<void>=>this.#poll()};
  const callback=new Callback({...common,scripts:Object.freeze({ui:b.scripts.ui,prepared:b.scripts.prepared,invoke:b.scripts.invoke}),originalRpcFrame:b.held.frame,originalFrame:b.held.tuple,originalPoint:b.originalPoint,dependencies:graph,current:():void=>{this.#current();},send:(command):Promise<unknown>=>this.#send({stage:"callback",command}),control:(phase,point):Promise<void>=>this.#control("callback",phase,point===undefined?{}:{breakpointId:point}),resume:(command,before):Promise<unknown>=>this.#send({stage:"callback",command},():void=>{this.#current();need(!this.#originalCallConsumed);b.consumeOriginalCall();this.#originalCallConsumed=true;before();})});
  this.#callback=callback;this.#phase="callback";await this.#control("callback","bind",{callback:graph.callbackId,originalPoint:b.originalPoint});const callbackToken=await callback.start();this.#current();const callbackOriginal=callback.requireOriginalHold(callbackToken);let callbackConsumed=false;let managerConsumed=false;
  const manager=new Manager({...common,callback:callbackOriginal,dependencies:graph,registration:b.call.registration,current:():void=>{this.#current();if(!callbackConsumed){callback.requireOriginalHold(callbackToken);}},send:(command):Promise<unknown>=>this.#send({stage:"manager",command}),control:(phase,role,point):Promise<void>=>{const fields:Record<string,string>={};if(role!==undefined){fields["pointRole"]=role;}if(point!==undefined){fields["breakpointId"]=point;}return this.#control("manager",phase,fields);},resume:(command,first,before):Promise<unknown>=>this.#send({stage:"manager",command},():void=>{this.#current();if(first){need(!callbackConsumed);callback.consumeOriginalHold(callbackOriginal);callbackConsumed=true;}before();})});
  this.#manager=manager;this.#phase="manager";await this.#control("manager","bind",{originalPoint:callbackOriginal.point,wrapper:graph.handlerId,body:graph.bodyId,deleteData:b.call.registration.methodId});const managerToken=await manager.start();this.#current();const managerOriginal=manager.requireOriginalHold(managerToken);
  const channel=new Channel({...common,kind:"delete",manager:managerOriginal,dependencies:graph,registration:b.call.registration,target:b.target,current:():void=>{this.#current();if(!managerConsumed){manager.requireOriginalHold(managerToken);}},send:(command):Promise<unknown>=>this.#send({stage:"channel",command}),control:(phase,fields):Promise<void>=>this.#control("channel",phase,fields),resume:(command,before):Promise<unknown>=>this.#send({stage:"channel",command},():void=>{this.#current();need(!managerConsumed);manager.consumeOriginalHold(managerOriginal);managerConsumed=true;before();})});
  this.#channel=channel;this.#phase="channel";await this.#control("channel","bind",{originalPoint:managerOriginal.point});this.#channelToken=await channel.start();this.#current();const original=channel.requireOriginalHold(this.#channelToken);need(this.#originalCallConsumed&&callbackConsumed&&managerConsumed);
  const value=Object.freeze({original,graph,workerPostAuthorized:false,workerDeleteBodyAuthorized:false} as const);this.#value=value;return value;
 }
 /** Matching JSON cannot recreate this original held inner RPC entry. */
 public requireOriginalInnerRpc(value:CurrentFootprintInverseNativeDeleteExecutionInnerRpc):void{this.#current();need(!this.#innerConsumed&&value===this.#value&&this.#channel!==null&&this.#channelToken!==null&&this.#channel.requireOriginalHold(this.#channelToken)===value.original);}
 /** Spend the exact original inner-RPC hold only inside the later actual
  * transport callback. Its historical receipt does not grant another resume. */
 public consumeOriginalInnerRpc(value:CurrentFootprintInverseNativeDeleteExecutionInnerRpc):void{this.requireOriginalInnerRpc(value);need(this.#channel!==null&&this.#channelToken!==null);this.#channel.consumeOriginalHold(value.original);this.#innerConsumed=true;}
 /** Reprove historical own receipt after its original hold was spent. */
 public requireCurrentInnerRpc(value:CurrentFootprintInverseNativeDeleteExecutionInnerRpc):void{this.#current();need(value===this.#value&&this.#innerConsumed);}
 /** Join all original pending stages after original root/Job exit. */
 public async settleAfterOriginalExit():Promise<void>{this.#b.assertOriginalExit();this.#failed=true;await Promise.allSettled([this.#pending,this.#callback?.settleAfterOriginalExit(),this.#manager?.settleAfterOriginalExit(),this.#channel?.settleAfterOriginalExit()]);this.#b.assertOriginalExit();}
}
const descriptors=Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeDeleteExecutionTransfer.prototype);
/** Reject copies/Proxies and substituted original continuation methods. */
export function assertOriginalCurrentFootprintInverseNativeDeleteExecutionTransfer(value:CurrentFootprintInverseNativeDeleteExecutionTransfer):void{need(value!==null&&typeof value==="object"&&!types.isProxy(value)&&originals.has(value)&&Object.getPrototypeOf(value)===CurrentFootprintInverseNativeDeleteExecutionTransfer.prototype&&Reflect.ownKeys(value).length===0);const now=Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeDeleteExecutionTransfer.prototype);need(Reflect.ownKeys(now).length===Reflect.ownKeys(descriptors).length&&Object.entries(descriptors).every(([name,d])=>{const n=now[name];return n!==undefined&&n.value===d.value&&n.get===d.get&&n.set===d.set&&n.writable===d.writable&&n.enumerable===d.enumerable&&n.configurable===d.configurable;}));}
