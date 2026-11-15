/* oxlint-disable import/max-dependencies -- Keep original registration/provider roots, child event owners and request/cleanup routing together. */
/** One original event/request router composes parser, services and three RPC
 * lifecycles. Native/runtime admission and ignored tree children stay separate. */
import { types } from "node:util";
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { CurrentSchematicWireParserDriver } from "./current-schematic-wire-parser-driver.ts";
import type { CurrentSchematicWireParserDriverCommand, CurrentSchematicWireParserDriverData } from "./current-schematic-wire-parser-driver.ts";
import { CurrentSchematicWireClassicRpcDriver } from "./current-schematic-wire-classic-rpc-driver.ts";
import type { CurrentSchematicWireClassicRpcDriverCommand, CurrentSchematicWireClassicRpcDriverData, CurrentSchematicWireParserRpcJoinData } from "./current-schematic-wire-classic-rpc-driver.ts";

import { CurrentSchematicWireServiceRegistrationCursor } from "./current-schematic-wire-service-registration-cursor.ts";
import type { CurrentSchematicWireServiceRegistrationData,CurrentSchematicWireServiceRegistrationRead } from "./current-schematic-wire-service-registration-cursor.ts";
import { CURRENT_SCHEMATIC_WIRE_SERVICE_REGISTRATION_REQUESTS as REGISTRATION_LIMIT } from "./current-schematic-wire-service-registration-protocol.ts";

import {CurrentSchematicWireServiceDriver,consumeCurrentSchematicWireServiceDriverBindings as consumeServiceBindings}from"./current-schematic-wire-service-driver.ts";
import type {CurrentSchematicWireServiceDriverCommand,CurrentSchematicWireServiceDriverData}from"./current-schematic-wire-service-driver.ts";
import {createCurrentSchematicWireServiceInvocationRoot as createServiceRoot}from"./current-schematic-wire-service-invocation-root.ts";

import {CurrentSchematicWireUiProviderCursor}from"./current-schematic-wire-ui-provider-cursor.ts";
import type {CurrentSchematicWireUiProviderData}from"./current-schematic-wire-ui-provider-cursor.ts";
import {CURRENT_SCHEMATIC_WIRE_UI_PROVIDER_REQUESTS as PROVIDER_LIMIT}from"./current-schematic-wire-ui-provider-protocol.ts";
import type {CurrentSchematicWireUiProviderCommand}from"./current-schematic-wire-ui-provider-protocol.ts";
import type {CurrentSchematicWireServiceInvocationRoot}from"./current-schematic-wire-service-invocation-root.ts";

import {CurrentSchematicWireUiRuntimeDriver}from"./current-schematic-wire-ui-runtime-driver.ts";
import type {CurrentSchematicWireUiRuntimeDriverCommand,CurrentSchematicWireUiRuntimeDriverData}from"./current-schematic-wire-ui-runtime-driver.ts";
import {createCurrentSchematicWireUiRuntimeRoot as createUiRuntimeRoot}from"./current-schematic-wire-ui-runtime-root.ts";

import {CurrentSchematicWireTreePreflightCursor}from"./current-schematic-wire-tree-preflight-cursor.ts";
import type {CurrentSchematicWireTreePreflightData}from"./current-schematic-wire-tree-preflight-cursor.ts";
import {CURRENT_SCHEMATIC_WIRE_TREE_PREFLIGHT_REQUESTS as TREE_BEFORE_LIMIT}from"./current-schematic-wire-tree-preflight-protocol.ts";
import type {CurrentSchematicWireTreePreflightCommand}from"./current-schematic-wire-tree-preflight-protocol.ts";
import {CurrentSchematicWireEventObserver}from"./current-schematic-wire-event-observer.ts";
import type {CurrentSchematicWireEventRecord}from"./current-schematic-wire-event-observer.ts";
import{CurrentSchematicWireTreeRuntimeDriver}from"./current-schematic-wire-tree-runtime-driver.ts";
import type{CurrentSchematicWireTreeRuntimeDriverCommand,CurrentSchematicWireTreeRuntimeDriverData}from"./current-schematic-wire-tree-runtime-driver.ts";

import{CurrentSchematicWireTitleDriver}from"./current-schematic-wire-title-driver.ts";
import type{CurrentSchematicWireTitleData}from"./current-schematic-wire-title-driver.ts";
import type{CurrentSchematicWireTitlePreflightData}from"./current-schematic-wire-title-preflight.ts";
import type{CurrentSchematicWireTitleCommand}from"./current-schematic-wire-title-protocol.ts";
import type{CurrentSchematicWireTitleFtCommand,CurrentSchematicWireTitleFtReturnData}from"./current-schematic-wire-title-ft-protocol.ts";

type Owner="title"|"parser"|"rpc"|"registration"|"service"|"provider"|"uiRuntime"|"treeBefore"|"treeRuntime";
export type CurrentSchematicWireParserServiceCommand=CurrentSchematicWireTitleFtCommand|CurrentSchematicWireTitleCommand|CurrentSchematicWireParserDriverCommand|CurrentSchematicWireClassicRpcDriverCommand|CurrentSchematicWireServiceRegistrationRead|CurrentSchematicWireServiceDriverCommand|CurrentSchematicWireUiProviderCommand|CurrentSchematicWireUiRuntimeDriverCommand|CurrentSchematicWireTreePreflightCommand|CurrentSchematicWireTreeRuntimeDriverCommand;
export interface CurrentSchematicWireParserServiceTransport {
 readonly request:(command:CurrentSchematicWireParserServiceCommand)=>Promise<unknown>;
 readonly assertCurrent:()=>void;readonly assertOriginalExit:()=>void;readonly fail:(cause:unknown)=>void;
}
interface Input {readonly sessionId:string;readonly scriptId:string;readonly holder:string;readonly native:string;readonly variant:0|1;readonly source:unknown;readonly busScriptId:string;readonly busSource:unknown}
interface Attempt {readonly owner:Owner;readonly command:CurrentSchematicWireParserServiceCommand;pending?:Promise<unknown>;raw?:unknown;cause?:unknown}
interface Resume {readonly owner:Owner;ackObserved:boolean;eventObserved:boolean}
export interface CurrentSchematicWireParserServiceData {
 readonly schema:"private.schematic-wire-parser-service-coordinator.v1";readonly registrations:CurrentSchematicWireServiceRegistrationData;
 readonly service:CurrentSchematicWireServiceDriverData;readonly parser:CurrentSchematicWireParserDriverData;readonly rpc:CurrentSchematicWireClassicRpcDriverData;readonly joined:CurrentSchematicWireParserRpcJoinData;
 readonly originalAllocationRoutingCompared:true;readonly sameWrittenSourceOwnerCompared:true;readonly sameWrittenResumeOwnerCompared:true;
 readonly suppliedTransportOnly:true;readonly originalNativeOwnerJoined:false;readonly serviceDeliveryJoined:false;
 readonly selectedTreeChildJoined:false;readonly annotationReturnJoined:false;readonly parserCompleted:false;readonly saveAuthorized:false;
}
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const eventSchema=z.strictObject({sessionId:handle,method:z.enum(["Debugger.paused","Debugger.resumed","Debugger.scriptParsed"]),params:z.unknown()});
const generatedScript=z.object({scriptId:handle,url:z.string(),length:z.number().int().nonnegative()});
const generatedSource=z.strictObject({scriptSource:z.string().max(32_768)});
const paused=z.object({hitBreakpoints:z.array(handle).length(1)});
const allocation=z.object({breakpointId:handle});
const issued=new WeakMap<CurrentSchematicWireParserServiceData,CurrentSchematicWireParserServiceCoordinator>();
const spent=new WeakSet<CurrentSchematicWireParserServiceData>();
/** One original live result can be joined by a future complete owner. */
export function consumeCurrentSchematicWireParserServiceData(data:CurrentSchematicWireParserServiceData,owner:CurrentSchematicWireParserServiceCoordinator):CurrentSchematicWireParserServiceData{
 need(issued.get(data)===owner&&!spent.has(data));spent.add(data);owner.requireLiveComparison(data);return data;
}
function need(value:boolean):asserts value{if(!value){throw new Error("WIRE_PARSER_SERVICE_COORDINATOR");}}
async function settled(task:Promise<unknown>|null):Promise<void>{try{await task;}catch{
 // Preserve each original rejection.
}}
function methods(transport:CurrentSchematicWireParserServiceTransport):readonly unknown[]{
 need(transport!==null&&typeof transport==="object"&&!types.isProxy(transport)&&(Object.getPrototypeOf(transport)===Object.prototype||Object.getPrototypeOf(transport)===null)&&Reflect.ownKeys(transport).length===4);
 return Object.freeze((["request","assertCurrent","assertOriginalExit","fail"]as const).map(name=>{const d=Object.getOwnPropertyDescriptor(transport,name);need(d!==undefined&&Object.hasOwn(d,"value")&&typeof d.value==="function");return d.value as unknown;}));
}
export class CurrentSchematicWireParserServiceCoordinator {
 readonly #eventObserver=new CurrentSchematicWireEventObserver(this);readonly #eventRecords:CurrentSchematicWireEventRecord[]=[];
 readonly #input:Input;readonly #transport:CurrentSchematicWireParserServiceTransport;readonly #methods:readonly unknown[];
 readonly #parser:CurrentSchematicWireParserDriver;readonly #rpc:CurrentSchematicWireClassicRpcDriver;readonly #service:CurrentSchematicWireServiceDriver;readonly #uiRuntime:CurrentSchematicWireUiRuntimeDriver;readonly #treeRuntime:CurrentSchematicWireTreeRuntimeDriver;
 readonly #title:CurrentSchematicWireTitleDriver;
 #titleFtBefore:Promise<CurrentSchematicWireTitlePreflightData>|null=null;
 #titleBefore:Promise<CurrentSchematicWireTitlePreflightData>|null=null;#titleTask:Promise<CurrentSchematicWireTitleData>|null=null;#titlePacket:CurrentSchematicWireTitleData|null=null;
 readonly #fault=Promise.withResolvers<never>();readonly #attempts:Attempt[]=[];readonly #events:unknown[]=[];readonly #points=new Map<string,Owner>();
 #treeTask:Promise<CurrentSchematicWireTreeRuntimeDriverData>|null=null;#treePacket:CurrentSchematicWireTreeRuntimeDriverData|null=null;
 #treeBeforeTask:Promise<CurrentSchematicWireTreePreflightData>|null=null;#treeBeforeCursor:CurrentSchematicWireTreePreflightCursor|null=null;
 #treeBeforeProgram:Readonly<{program:string;scripts:string[]}>|null=null;#treeBeforeReads=0;#treeBeforeSources=0;
 #root:CurrentSchematicWireServiceInvocationRoot|null=null;
 #uiTask:Promise<CurrentSchematicWireUiRuntimeDriverData>|null=null;#uiPacket:CurrentSchematicWireUiRuntimeDriverData|null=null;
 #providerTask:Promise<CurrentSchematicWireUiProviderData>|null=null;#providerCursor:CurrentSchematicWireUiProviderCursor|null=null;
 #providerProgram:Readonly<{program:string;scripts:string[]}>|null=null;#providerReads=0;#providerSources=0;
 #registrationTask:Promise<CurrentSchematicWireServiceRegistrationData>|null=null;#registrationCursor:CurrentSchematicWireServiceRegistrationCursor|null=null;
 #registrationProgram:Readonly<{program:string;scripts:string[]}>|null=null;
 #registrationReads=0;#registrationSources=0;
 #sourceOwner:Owner|null=null;#resume:Resume|null=null;#functions:Promise<void>=Promise.resolve();
 #childrenTask:Promise<readonly [CurrentSchematicWireParserDriverData,CurrentSchematicWireClassicRpcDriverData,CurrentSchematicWireServiceDriverData,CurrentSchematicWireUiRuntimeDriverData]>|null=null;#armTask:Promise<void>|null=null;#runTask:Promise<CurrentSchematicWireParserServiceData>|null=null;#finishTask:Promise<void>|null=null;#retireTask:Promise<void>|null=null;
 #failure:Readonly<{cause:unknown}>|null=null;#notificationFailure:Readonly<{cause:unknown}>|null=null;#closing=false;#completed=false;#packet:CurrentSchematicWireParserServiceData|null=null;
 public constructor(input:Input,transport:CurrentSchematicWireParserServiceTransport){
  this.#input=Object.freeze({...input});this.#transport=transport;this.#methods=methods(transport);void settled(this.#fault.promise);handle.parse(input.sessionId);
  const current=():void=>{this.#current();};const originalExit=():void=>{this.#current(true);this.#transport.assertOriginalExit();};const fail=(cause:unknown):void=>{this.#fail(cause);};
  this.#parser=new CurrentSchematicWireParserDriver(input,Object.freeze({request:(command:CurrentSchematicWireParserDriverCommand)=>this.#send("parser",command),assertCurrent:current,assertOriginalExit:originalExit,fail}));
  this.#rpc=new CurrentSchematicWireClassicRpcDriver(input,Object.freeze({request:(command:CurrentSchematicWireClassicRpcDriverCommand)=>this.#send("rpc",command),assertCurrent:current,assertOriginalExit:originalExit,fail}));
  this.#service=new CurrentSchematicWireServiceDriver(input,Object.freeze({request:(command:CurrentSchematicWireServiceDriverCommand)=>this.#send("service",command),assertCurrent:current,assertOriginalExit:originalExit,fail}));
  this.#uiRuntime=new CurrentSchematicWireUiRuntimeDriver(input,Object.freeze({request:(command:CurrentSchematicWireUiRuntimeDriverCommand)=>this.#send("uiRuntime",command),assertCurrent:current,assertOriginalExit:originalExit,fail}));
  this.#treeRuntime=new CurrentSchematicWireTreeRuntimeDriver(input,Object.freeze({request:(command:CurrentSchematicWireTreeRuntimeDriverCommand)=>this.#send("treeRuntime",command),assertCurrent:current,assertOriginalExit:originalExit,fail}),this.#parser);
  this.#title=new CurrentSchematicWireTitleDriver(input,Object.freeze({request:(command:CurrentSchematicWireTitleCommand|CurrentSchematicWireTitleFtCommand)=>this.#send("title",command),assertCurrent:current,assertOriginalExit:originalExit,fail}));
  Object.freeze(this);
 }
 #current(cleanup=false):void{need(methods(this.#transport).every((value,index)=>value===this.#methods[index]));if(!cleanup){need(!this.#closing&&this.#failure===null);this.#transport.assertCurrent();}}
 #fail(cause:unknown):void{if(this.#failure!==null){return;}this.#failure=Object.freeze({cause});this.#registrationCursor?.fail();this.#providerCursor?.fail();this.#treeBeforeCursor?.fail();this.#fault.reject(cause);try{this.#transport.fail(cause);}catch(error){this.#notificationFailure=Object.freeze({cause:error});}}
 #send(owner:Owner,command:CurrentSchematicWireParserServiceCommand):Promise<unknown>{
  // Drivers validate their exact reserved vocabulary before entering here.
  const attempt:Attempt={owner,command};this.#attempts.push(attempt);
  if(command.method!=="Runtime.callFunctionOn"){return this.#write(attempt);}
  const prior=this.#functions;const task=(async():Promise<unknown>=>{await prior;return this.#write(attempt);})();this.#functions=settled(task);return task;
 }
 async #write(attempt:Attempt):Promise<unknown>{
  const {owner,command}=attempt;const cleanup=command.method==="Debugger.removeBreakpoint"||command.method==="Runtime.releaseObjectGroup";
  this.#current(cleanup);
  let generated=false;let resume:Resume|null=null;
  try{
   if(command.method==="Runtime.callFunctionOn"){need(this.#sourceOwner===null);this.#sourceOwner=owner;generated=true;}
   if(command.method==="Debugger.resume"){need(this.#resume===null);resume={owner,ackObserved:false,eventObserved:false};this.#resume=resume;}
   const pending=this.#transport.request(command);need(types.isPromise(pending));attempt.pending=pending;
   const raw=await pending;attempt.raw=raw;this.#current(cleanup);
   if(command.method==="Debugger.setBreakpoint"){const id=allocation.parse(capture(raw).value).breakpointId;need(!this.#points.has(id));this.#points.set(id,owner);}
   else if(command.method==="Debugger.removeBreakpoint"){need(this.#points.get(command.params.breakpointId)===owner);this.#points.delete(command.params.breakpointId);}
   if(resume!==null){resume.ackObserved=true;if(resume.eventObserved){need(this.#resume===resume);this.#resume=null;}}
   return raw;
  }catch(error){attempt.cause=error;this.#fail(error);throw error;}finally{if(generated){need(this.#sourceOwner===owner);this.#sourceOwner=null;}}
 }
 public observe(input:unknown):boolean{return this.#observe(input,false);}
 public observeRaw(text:string):boolean{return this.#observe(text,true);}
 #observe(input:unknown,raw:boolean):boolean{
  if(this.#closing){return false;}let retained=false;
  try{
   this.#current();const paired=raw?this.#eventObserver.captureRaw(typeof input==="string"?input:(():never=>{throw new Error("WIRE_ORIGINAL_EVENT_TEXT");})(),this):this.#eventObserver.captureObject(input,this);this.#eventObserver.requireOriginal(paired,this);const observed=paired.event;const event=eventSchema.parse(capture(observed).value);if(event.sessionId!==this.#input.sessionId){return false;}
   let owner:Owner|null=null;let titleCondition=false;
   if(event.method==="Debugger.scriptParsed"){if(this.#title.observeFtCondition(paired.original)){owner="title";titleCondition=true;}else{owner=this.#sourceOwner;if(owner===null){return false;}}}
   else if(event.method==="Debugger.resumed"){const original=this.#resume;need(original!==null&&!original.eventObserved);owner=original.owner;original.eventObserved=true;if(original.ackObserved){this.#resume=null;}}
   else{const id=paused.parse(event.params).hitBreakpoints[0];need(id!==undefined);owner=this.#points.get(id)??null;if(owner===null){return false;}}
   this.#eventRecords.push(paired);this.#events.push(input);retained=true;let accepted:boolean;
   if(titleCondition){accepted=true;}else if(owner==="registration"||owner==="provider"||owner==="treeBefore"){let active=this.#treeBeforeProgram;if(owner==="registration"){active=this.#registrationProgram;}else if(owner==="provider"){active=this.#providerProgram;}const actual=generatedScript.parse(event.params);if(active===null||actual.url!==""||actual.length!==active.program.length+2){return false;}need(!active.scripts.includes(actual.scriptId));active.scripts.push(actual.scriptId);need(active.scripts.length===1);accepted=true;}
   else if(owner==="parser"){accepted=this.#parser.observe(observed);}else if(owner==="rpc"){accepted=this.#rpc.observe(observed);}else if(owner==="title"){accepted=this.#title.observe(observed);}else if(owner==="service"){accepted=this.#service.observe(observed);}else if(owner==="uiRuntime"){accepted=this.#uiRuntime.observe(observed);}else{accepted=this.#treeRuntime.observe(observed);}
   if(event.method!=="Debugger.scriptParsed"){need(accepted);}return accepted;
  }catch(error){if(!retained){this.#events.push(input);}this.#fail(error);return true;}
 }
 /** Qualify the current three original registrations while mutation remains
  * unattempted. All original generated-script reads share this router. */
 public prepareServices():Promise<CurrentSchematicWireServiceRegistrationData>{
  if(this.#registrationTask!==null){return this.#registrationTask;}this.#current();
  const task=(async():Promise<CurrentSchematicWireServiceRegistrationData>=>{try{
   const cursor=new CurrentSchematicWireServiceRegistrationCursor({holder:this.#input.holder,native:this.#input.native,scriptId:this.#input.scriptId,uiScriptId:this.#input.busScriptId,variant:this.#input.variant,source:this.#input.source,uiSource:this.#input.busSource});this.#registrationCursor=cursor;
   for(let command=cursor.next();command!==null;command=cursor.next()){
    need(this.#registrationReads<REGISTRATION_LIMIT.ordinary);cursor.reserve(command);this.#registrationReads+=1;
    let active:Readonly<{program:string;scripts:string[]}>|null=null;
    if(command.method==="Runtime.callFunctionOn"){need(this.#registrationProgram===null);active={program:command.params.functionDeclaration,scripts:[]};this.#registrationProgram=active;}
    const raw=await this.#send("registration",command);this.#current();
    if(active!==null){
     need(this.#registrationProgram===active&&active.scripts.length===1&&this.#registrationSources<REGISTRATION_LIMIT.sources);this.#registrationProgram=null;
     const scriptId=active.scripts[0];need(scriptId!==undefined);this.#registrationSources+=1;
     const source=generatedSource.parse(capture(await this.#send("registration",{phase:"wire-rpc-driver-source",method:"Debugger.getScriptSource",params:{scriptId}})).value);
     need(source.scriptSource===`(${active.program})`);
    }
    cursor.accept(command,raw);
   }
   const data=cursor.requireCompleted();const root=createServiceRoot(data,{holder:this.#input.holder,native:this.#input.native,scriptId:this.#input.scriptId,uiScriptId:this.#input.busScriptId,variant:this.#input.variant},this.#rpc);this.#service.bindRegistrations(root);this.#root=root;this.#registrationCursor=null;return data;
  }catch(error){this.#fail(error);throw error;}})();this.#registrationTask=task;return task;
 }
 /** Qualify the source-proven existing UI tool and first locale dictionary
  * branch before any observation allocation or Modify dispatch. */
 public prepareProviders():Promise<CurrentSchematicWireUiProviderData>{
  if(this.#providerTask!==null){return this.#providerTask;}this.#current();
  const task=(async():Promise<CurrentSchematicWireUiProviderData>=>{try{
   await this.prepareServices();need(this.#root!==null);const cursor=new CurrentSchematicWireUiProviderCursor(this.#root);this.#providerCursor=cursor;
   for(let command=cursor.next();command!==null;command=cursor.next()){
    need(this.#providerReads<PROVIDER_LIMIT.ordinary);cursor.reserve(command);this.#providerReads+=1;
    let active:Readonly<{program:string;scripts:string[]}>|null=null;
    if(command.method==="Runtime.callFunctionOn"){need(this.#providerProgram===null);active={program:command.params.functionDeclaration,scripts:[]};this.#providerProgram=active;}
    const raw=await this.#send("provider",command);this.#current();
    if(active!==null){
     need(this.#providerProgram===active&&active.scripts.length===1&&this.#providerSources<PROVIDER_LIMIT.sources);this.#providerProgram=null;
     const scriptId=active.scripts[0];need(scriptId!==undefined);this.#providerSources+=1;
     const source=generatedSource.parse(capture(await this.#send("provider",{phase:"wire-rpc-driver-source",method:"Debugger.getScriptSource",params:{scriptId}})).value);
     need(source.scriptSource===`(${active.program})`);
    }
    cursor.accept(command,raw);
   }
   const data=cursor.requireCompleted();this.#uiRuntime.bindPreflight(createUiRuntimeRoot(data,this.#root));this.#providerCursor=null;return data;
  }catch(error){this.#fail(error);throw error;}})();this.#providerTask=task;return task;
 }
 /** Retain the same selected AST/tree prefix for the complete child owner. */
 public prepareTree():Promise<CurrentSchematicWireTreePreflightData>{
  if(this.#treeBeforeTask!==null){return this.#treeBeforeTask;}this.#current();need(this.#armTask===null&&this.#runTask===null);
  const task=(async():Promise<CurrentSchematicWireTreePreflightData>=>{try{
   await this.prepareProviders();need(this.#root!==null);const cursor=new CurrentSchematicWireTreePreflightCursor(this.#root);this.#treeBeforeCursor=cursor;
   for(let command=cursor.next();command!==null;command=cursor.next()){
    need(this.#treeBeforeReads<TREE_BEFORE_LIMIT.ordinary);cursor.reserve(command);this.#treeBeforeReads+=1;let active:Readonly<{program:string;scripts:string[]}>|null=null;
    if(command.method==="Runtime.callFunctionOn"){need(this.#treeBeforeProgram===null);active={program:command.params.functionDeclaration,scripts:[]};this.#treeBeforeProgram=active;}
    const raw=await this.#send("treeBefore",command);this.#current();
    if(active!==null){need(this.#treeBeforeProgram===active&&active.scripts.length===1&&this.#treeBeforeSources<TREE_BEFORE_LIMIT.sources);this.#treeBeforeProgram=null;const scriptId=active.scripts[0];need(scriptId!==undefined);this.#treeBeforeSources+=1;
     const source=generatedSource.parse(capture(await this.#send("treeBefore",{phase:"wire-rpc-driver-source",method:"Debugger.getScriptSource",params:{scriptId}})).value);need(source.scriptSource===`(${active.program})`);
    }cursor.accept(command,raw);
   }const data=cursor.requireCompleted();this.#treeRuntime.bindPreflight(data,this.#root);this.#treeBeforeCursor=null;return data;
  }catch(error){this.#fail(error);throw error;}})();this.#treeBeforeTask=task;return task;
 }
 public prepareTitles():Promise<CurrentSchematicWireTitlePreflightData>{if(this.#titleBefore!==null){return this.#titleBefore;}this.#current();need(this.#armTask===null&&this.#runTask===null);const task=(async():Promise<CurrentSchematicWireTitlePreflightData>=>{try{const tree=await this.prepareTree();need(this.#root!==null);const data=await this.#title.prepare(this.#root,tree);this.#service.bindTitleDriver(this.#title);return data;}catch(error){this.#fail(error);throw error;}})();this.#titleBefore=task;return task;}
 /** Opt into the separately bounded shared-helper return while all original
  * title/tree/service preflight remains before any observation or Modify. */
 public prepareTitleFtReturn():Promise<CurrentSchematicWireTitlePreflightData>{
  if(this.#titleFtBefore!==null){return this.#titleFtBefore;}this.#current();need(this.#armTask===null&&this.#runTask===null);
  const task=(async():Promise<CurrentSchematicWireTitlePreflightData>=>{try{const before=await this.prepareTitles();this.#current();await this.#title.prepareFtReturn();this.#current();return before;}catch(error){this.#fail(error);throw error;}})();this.#titleFtBefore=task;return task;
 }
 public requireTitleFtReturn(data:CurrentSchematicWireParserServiceData):CurrentSchematicWireTitleFtReturnData{
  this.requireLiveComparison(data);need(this.#titleFtBefore!==null&&this.#titlePacket!==null);return this.#title.originalFtReturn(this.#titlePacket);
 }
 public runTitles():Promise<CurrentSchematicWireTitleData>{if(this.#titleTask!==null){return this.#titleTask;}this.#current();need(this.#titleBefore!==null);const task=(async():Promise<CurrentSchematicWireTitleData>=>{await this.#titleBefore;await this.arm();const data=await this.#title.run();this.#titlePacket=data;return data;})();this.#titleTask=task;return task;}
 /** Arm every observation before the original owner dispatches Modify. */
 public arm():Promise<void>{
  if(this.#armTask!==null){return this.#armTask;}this.#current();const task=(async():Promise<void>=>{try{await this.prepareServices();await this.prepareProviders();await this.#parser.arm();await this.#rpc.arm();await this.#service.arm();await this.#uiRuntime.arm();if(this.#treeBeforeTask!==null){await this.#treeBeforeTask;await this.#treeRuntime.arm();}if(this.#titleBefore!==null){await this.#titleBefore;await this.#titleFtBefore;await this.#title.arm();}this.#current();}catch(error){this.#fail(error);throw error;}})();this.#armTask=task;return task;
 }
 public runUiProviders():Promise<CurrentSchematicWireUiRuntimeDriverData>{
  if(this.#uiTask!==null){return this.#uiTask;}this.#current();const task=(async():Promise<CurrentSchematicWireUiRuntimeDriverData>=>{await this.arm();return this.#uiRuntime.run();})();this.#uiTask=task;return task;
 }
 public runSelectedTree():Promise<CurrentSchematicWireTreeRuntimeDriverData>{
  if(this.#treeTask!==null){return this.#treeTask;}this.#current();need(this.#treeBeforeTask!==null);
  const task=(async():Promise<CurrentSchematicWireTreeRuntimeDriverData>=>{await this.#treeBeforeTask;await this.arm();const data=await this.#treeRuntime.run();this.#treePacket=data;return data;})();this.#treeTask=task;return task;
 }
 public run():Promise<CurrentSchematicWireParserServiceData>{
  if(this.#runTask!==null){return this.#runTask;}this.#current();
  const task=(async():Promise<CurrentSchematicWireParserServiceData>=>{try{
   const registrations=await this.prepareServices();await this.arm();const parserTask=this.#parser.run(),rpcTask=this.#rpc.run(),serviceTask=this.#service.run(),uiTask=this.runUiProviders();void settled(parserTask);void settled(rpcTask);void settled(serviceTask);void settled(uiTask);
   if(this.#titleBefore!==null){void settled(this.runTitles());}if(this.#treeBeforeTask!==null){void settled(this.runSelectedTree());}this.#childrenTask=Promise.all([parserTask,rpcTask,serviceTask,uiTask]);void settled(this.#childrenTask);const [parser,rpc,service,ui]=await Promise.race([this.#childrenTask,this.#fault.promise]);this.#current();this.#uiPacket=ui;if(this.#treeBeforeTask!==null){await Promise.race([this.runSelectedTree(),this.#fault.promise]);}const joined=await this.#rpc.joinParser(this.#parser,parser);this.#current();
   if(this.#titleBefore!==null){await Promise.race([this.runTitles(),this.#fault.promise]);}need(this.#points.size===0&&this.#resume===null&&this.#sourceOwner===null);this.#completed=true;
   const result:CurrentSchematicWireParserServiceData=Object.freeze({schema:"private.schematic-wire-parser-service-coordinator.v1",registrations,parser,rpc,service,joined,originalAllocationRoutingCompared:true,sameWrittenSourceOwnerCompared:true,sameWrittenResumeOwnerCompared:true,suppliedTransportOnly:true,originalNativeOwnerJoined:false,serviceDeliveryJoined:false,selectedTreeChildJoined:false,annotationReturnJoined:false,parserCompleted:false,saveAuthorized:false});issued.set(result,this);this.#packet=result;return result;
  }catch(error){this.#fail(error);throw error;}})();this.#runTask=task;return task;
 }
 /** The complete owner delays finish until service/tree/annotation peers no
  * longer need these original groups. This method never starts or saves work. */
 public finish():Promise<void>{
  if(this.#finishTask!==null){return this.#finishTask;}this.#current();const task=(async():Promise<void>=>{try{await this.run();if(this.#titleBefore!==null){await this.#title.finish();}if(this.#treeBeforeTask!==null){await this.#treeRuntime.finish();}await this.#uiRuntime.finish();const service=this.#service.finish();await service;const parser=this.#parser.finish(),rpc=this.#rpc.finish();await Promise.all([parser,rpc]);this.#current();}catch(error){this.#fail(error);throw error;}})();this.#finishTask=task;return task;
 }
 public retireAfterOriginalExit():Promise<void>{
  if(this.#retireTask!==null){return this.#retireTask;}this.#current(true);this.#transport.assertOriginalExit();this.#closing=true;
  const title=this.#titleBefore===null?null:this.#title.retireAfterOriginalExit();
  const parser=this.#parser.retireAfterOriginalExit(),rpc=this.#rpc.retireAfterOriginalExit(),service=this.#service.retireAfterOriginalExit(),tree=this.#treeBeforeTask===null?null:this.#treeRuntime.retireAfterOriginalExit(),ui=this.#uiRuntime.retireAfterOriginalExit();
  const task=(async():Promise<void>=>{await settled(this.#registrationTask);await settled(this.#providerTask);await settled(this.#treeBeforeTask);await settled(this.#titleBefore);await settled(this.#titleFtBefore);await settled(this.#titleTask);await settled(this.#armTask);await Promise.all([settled(parser),settled(rpc),settled(service),settled(ui),settled(tree),settled(title)]);await settled(this.#runTask);await settled(this.#childrenTask);await settled(this.#uiTask);await settled(this.#treeTask);await settled(this.#finishTask);await this.#functions;for(const attempt of this.#attempts){await settled(attempt.pending??null);}this.#current(true);this.#transport.assertOriginalExit();})();this.#retireTask=task;return task;
 }
 public requireLiveComparison(data:CurrentSchematicWireParserServiceData):void{
  this.#current();need(this.#packet===data&&this.#completed);this.#parser.requireLiveComparison(data.parser);this.#rpc.requireLiveComparison(data.rpc);this.#service.requireLiveComparison(data.service);need(this.#uiPacket!==null);this.#uiRuntime.requireLiveComparison(this.#uiPacket);if(this.#treeBeforeTask!==null){need(this.#treePacket!==null);this.#treeRuntime.requireLiveComparison(this.#treePacket);}if(this.#titleBefore!==null){need(this.#titlePacket!==null);this.#title.requireLiveComparison(this.#titlePacket);}
 }
 public consumeServiceComparison(data:CurrentSchematicWireParserServiceData):ReturnType<typeof consumeServiceBindings>{
  this.requireLiveComparison(data);return consumeServiceBindings(data.service,this.#service);
 }
 public inspect():Readonly<{completed:boolean;failed:boolean;allocatedBreakpoints:number;originalNativeOwnerJoined:false;parserCompleted:false;saveAuthorized:false}>{
  this.#current(true);return Object.freeze({completed:this.#completed,failed:this.#failure!==null,allocatedBreakpoints:this.#points.size,originalNativeOwnerJoined:false,parserCompleted:false,saveAuthorized:false});
 }
 public retained():Readonly<{attempts:readonly Readonly<Attempt>[];events:readonly unknown[];eventRecords:readonly CurrentSchematicWireEventRecord[];firstFailure:Readonly<{cause:unknown}>|null;notificationFailure:Readonly<{cause:unknown}>|null}>{
  this.#current(true);return Object.freeze({attempts:Object.freeze(this.#attempts.map(row=>Object.freeze({...row}))),events:Object.freeze([...this.#events]),eventRecords:Object.freeze([...this.#eventRecords]),firstFailure:this.#failure,notificationFailure:this.#notificationFailure});
 }
}
Object.freeze(CurrentSchematicWireParserServiceCoordinator.prototype);Object.freeze(CurrentSchematicWireParserServiceCoordinator);
