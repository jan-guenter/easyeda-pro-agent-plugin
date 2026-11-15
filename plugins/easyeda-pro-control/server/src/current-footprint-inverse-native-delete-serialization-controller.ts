/** Same original native DEL held-frame and request custody. */
import {types} from "node:util";
import {performance} from "node:perf_hooks";
import {z} from "zod";
import type {DiagnosticEvent} from "./current-pcb-diagnostic-protocol.ts";
import {observeCurrentFootprintInverseNativeDeleteSerialization as observe} from "./current-footprint-inverse-native-delete-serialization-observer.ts";
import type {CurrentFootprintInverseNativeDeleteSerializationData as Data,CurrentFootprintInverseNativeDeleteSerializationBindings as Observer} from "./current-footprint-inverse-native-delete-serialization-observer.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_ORDER as ORDER,currentFootprintInverseNativeDeleteSerializationHelperCommand as helperCommand,currentFootprintInverseNativeDeleteSerializationKey as key,currentFootprintInverseNativeDeleteSerializationProgram as program,qualifyCurrentFootprintInverseNativeDeleteSerializationHelper as qualify,validateCurrentFootprintInverseNativeDeleteSerializationCommand as validate} from "./current-footprint-inverse-native-delete-serialization-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteSerializationCommand as Command} from "./current-footprint-inverse-native-delete-serialization-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_ORDER as ROLES,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_SITES as SITES} from "./current-footprint-inverse-native-delete-serialization-profile.ts";
import {currentFootprintInverseNativeDeleteSerializationPause as pause} from "./current-footprint-inverse-native-delete-serialization-replies.ts";

type Role=typeof ROLES[number];type Resume=Parameters<Observer["resume"]>[0];
interface Helper{readonly command:Command;scriptId:string|null;issued:boolean;attempted:boolean}
export interface CurrentFootprintInverseNativeDeleteSerializationControllerBindings extends Omit<Observer,"request"|"qualifyHelper"|"retainPoint"|"next"|"resume"|"control">{
 readonly contextId:number;readonly bodySha256:string;readonly assertOriginalHeld:()=>void;readonly assertOriginalEvent:(event:DiagnosticEvent)=>void;readonly assertOriginalExit:()=>void;
 readonly poll:()=>Promise<void>;readonly send:(command:Command,beforeTransfer:()=>void)=>Promise<unknown>;
 readonly consumeOriginalHold:()=>void;readonly control:(phase:"bind"|"armed"|"held"|"resumed"|"complete",fields?:Readonly<Record<string,string>>)=>Promise<void>;
}
function need(ok:boolean):asserts ok{if(!ok){throw new Error("INVERSE_NATIVE_DELETE_SERIALIZATION_CUSTODY");}}
const originals=new WeakSet<object>();const empty=z.strictObject({});
export class CurrentFootprintInverseNativeDeleteSerializationController{
 readonly #b:CurrentFootprintInverseNativeDeleteSerializationControllerBindings;readonly #points=new Map<Role,string>();readonly #raw:DiagnosticEvent[]=[];readonly #requests:Promise<unknown>[]=[];readonly #resumed=new Set<Resume>();readonly #removed=new Set<string>();
 #held:DiagnosticEvent|null;#queued:Readonly<{role:Role;event:DiagnosticEvent}>|null=null;#resuming:Resume|null=null;#helper:Helper|null=null;#arming:Role|null=null;#resolved:string|null=null;
 #step=0;#normal=0;#helpers=0;#pauses=0;#reading=false;#armed=false;#failed=false;#data:Readonly<Data>|null=null;#pending:Promise<Readonly<Data>>|null=null;
 public constructor(bindings:CurrentFootprintInverseNativeDeleteSerializationControllerBindings){this.#b=Object.freeze({...bindings});this.#held=bindings.initial;originals.add(this);}
 #current():void{try{this.#b.current();need(!this.#failed);}catch(error){this.#failed=true;throw error;}}
 public observe(event:DiagnosticEvent):boolean{
 if(event.sessionId!==this.#b.sessionId||this.#data!==null||event.method==="Runtime.consoleAPICalled"){return false;}
 try{this.#current();this.#b.assertOriginalEvent(event);need(this.#raw.length<34);this.#raw.push(event);
 if(event.method==="Debugger.scriptParsed"&&event.params["url"]===""){const h=this.#helper;need(h!==null&&h.issued&&!h.attempted&&h.scriptId===null&&event.params["executionContextId"]===this.#b.contextId&&typeof event.params["scriptId"]==="string"&&/^[A-Za-z\d_.:-]{1,256}$/u.test(event.params["scriptId"]));h.scriptId=event.params["scriptId"];return true;}
 if(event.method==="Debugger.breakpointResolved"){const role=this.#arming;const location=event.params["location"];need(role!==null&&this.#resolved===null&&location!==null&&typeof location==="object"&&!types.isProxy(location));z.strictObject({scriptId:z.literal(this.#b.scriptId),lineNumber:z.literal(SITES[role].lineNumber),columnNumber:z.literal(SITES[role].columnNumber)}).parse(location);need(typeof event.params["breakpointId"]==="string");this.#resolved=event.params["breakpointId"];return true;}
 if(event.method==="Debugger.resumed"){const role=this.#resuming;need(role!==null&&!this.#resumed.has(role)&&this.#held!==null);empty.parse(event.params);this.#resumed.add(role);this.#resuming=null;this.#held=null;return true;}
 if(event.method==="Debugger.paused"){const role=ROLES[this.#pauses];need(this.#armed&&role!==undefined&&this.#queued===null&&this.#held===null&&this.#resuming===null);const point=this.#points.get(role);need(point!==undefined);pause(event,role,this.#b.sessionId,this.#b.scriptId,point);this.#pauses += 1;this.#queued=Object.freeze({role,event});return true;}
 return false;
 }catch(error){this.#failed=true;throw error;}
 }
 public start():Promise<Readonly<Data>>{
 if(this.#pending!==null){return this.#pending;}const out=Promise.withResolvers<Readonly<Data>>();this.#pending=out.promise;
 void(async():Promise<void>=>{try{this.#current();this.#b.assertOriginalHeld();await this.#control("bind");
 const data=await observe({...this.#b,request:c=>this.#read(c),qualifyHelper:c=>this.#qualify(c),retainPoint:(role,point):void=>{this.#current();need(this.#arming===role&&!this.#points.has(role)&&![...this.#points.values()].includes(point)&&(this.#resolved===null||this.#resolved===point));this.#points.set(role,point);this.#arming=null;this.#resolved=null;},next:r=>this.#next(r),resume:r=>this.#resume(r),control:p=>this.#control(p)},this.#b.bodySha256);
 this.#current();need(this.#data===null&&this.#held===data.uploadEvent&&this.#queued===null&&this.#helper===null&&this.#step===69&&this.#normal===53&&this.#helpers===16&&this.#requests.length===69&&this.#resumed.size===6&&this.#removed.size===5);this.#data=data;out.resolve(data);
 }catch(error){this.#failed=true;out.reject(error);}})();return out.promise;
 }
 async #send(c:Command):Promise<unknown>{this.#current();need(key(c)===ORDER[this.#step]);this.#step += 1;const pending=this.#b.send(c,():void=>{this.#current();if(program(c)!==null){need(this.#helper!==null&&!this.#helper.issued);this.#helper.issued=true;}});need(types.isPromise(pending)&&this.#requests.length<69);this.#requests.push(pending);const raw=await pending;this.#current();return raw;}
 async #read(input:Command):Promise<unknown>{try{this.#current();need(!this.#reading&&this.#helper===null&&this.#data===null);this.#reading=true;const c=validate(input);need(c.method!=="Debugger.resume"&&(this.#normal += 1)<=53);if(c.method==="Debugger.setBreakpoint"){need(this.#arming===null);this.#arming=c.role;this.#resolved=null;}if(c.method==="Debugger.getPossibleBreakpoints"&&c.role==="before"){need(this.#arming===null);this.#arming="uploadEntry";this.#resolved=null;}if(program(c)!==null){this.#helper={command:input,scriptId:null,issued:false,attempted:false};}const raw=await this.#send(c);if(c.method==="Debugger.removeBreakpoint"){empty.parse(raw);need(!this.#removed.has(c.params.breakpointId));this.#removed.add(c.params.breakpointId);}return raw;}catch(error){this.#failed=true;throw error;}finally{this.#reading=false;}}
 async #qualify(input:Command):Promise<void>{try{this.#current();const h=this.#helper;need(!this.#reading&&h!==null&&!h.attempted&&h.scriptId!==null&&h.command===input);h.attempted=true;this.#reading=true;const p=z.strictObject({scriptSource:z.string().max(24_000)}).parse(await this.#send(helperCommand(input,h.scriptId)));qualify(p.scriptSource,input);need((this.#helpers += 1)<=16);this.#helper=null;}catch(error){this.#failed=true;throw error;}finally{this.#reading=false;}}
 async #wait(predicate:()=>boolean):Promise<void>{const started=performance.now();while(!predicate()){this.#current();need(performance.now()-started<30_000);await this.#b.poll();this.#current();}}
 async #resume(role:Resume):Promise<void>{this.#current();need(this.#armed&&!this.#reading&&this.#helper===null&&this.#held!==null&&this.#resuming===null&&!this.#resumed.has(role));this.#reading=true;
 try{const c=validate({phase:"inverse-native-delete-serialization-resume",role,method:"Debugger.resume",params:{}});need(key(c)===ORDER[this.#step]);const pending=this.#b.send(c,():void=>{this.#current();need(this.#resuming===null&&this.#held!==null);if(role==="begin"){this.#b.consumeOriginalHold();}this.#step += 1;this.#resuming=role;need((this.#normal += 1)<=53);});need(types.isPromise(pending)&&this.#requests.length<69);this.#requests.push(pending);empty.parse(await pending);this.#current();await this.#wait(()=>this.#resumed.has(role));await this.#control("resumed",{role});
 }catch(error){this.#failed=true;throw error;}finally{this.#reading=false;}}
 async #next(role:Role):Promise<DiagnosticEvent>{await this.#wait(()=>this.#queued!==null);this.#current();const q=this.#queued;need(q!==null&&q.role===role&&this.#held===null);this.#queued=null;this.#held=q.event;await this.#control("held",{role});this.#current();return q.event;}
 async #control(phase:"bind"|"armed"|"held"|"resumed"|"complete",fields:Readonly<Record<string,string>>={}):Promise<void>{this.#current();if(phase==="armed"){this.#b.assertOriginalHeld();need(!this.#armed&&this.#points.size===6&&this.#helper===null);this.#armed=true;}if(phase==="complete"){need(this.#normal===53&&this.#helpers===16&&this.#pauses===6&&this.#resumed.size===6&&this.#held!==null&&this.#removed.size===5);}
 await this.#b.control(phase,phase==="armed"?Object.freeze(Object.fromEntries(this.#points)):fields);this.#current();}
 public requireOriginal(data:Readonly<Data>):Readonly<Data>{this.#current();need(this.#data===data&&this.#held===data.uploadEvent&&this.#pending!==null&&!this.#reading);this.#b.assertOriginalEvent(data.uploadEvent);return data;}
 public async settleAfterOriginalExit():Promise<void>{this.#b.assertOriginalExit();this.#failed=true;await Promise.allSettled([this.#pending,...this.#requests]);this.#b.assertOriginalExit();}
}
const methods=Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeDeleteSerializationController.prototype);
export function assertOriginalCurrentFootprintInverseNativeDeleteSerializationController(value:CurrentFootprintInverseNativeDeleteSerializationController):void{
 need(value!==null&&typeof value==="object"&&!types.isProxy(value)&&originals.has(value)&&Object.getPrototypeOf(value)===CurrentFootprintInverseNativeDeleteSerializationController.prototype&&Reflect.ownKeys(value).length===0);
 const actual=Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeDeleteSerializationController.prototype);need(Reflect.ownKeys(actual).length===Reflect.ownKeys(methods).length&&Object.entries(methods).every(([name,d])=>{const n=actual[name];return n!==undefined&&n.value===d.value&&n.get===d.get&&n.set===d.set&&n.writable===d.writable&&n.enumerable===d.enumerable&&n.configurable===d.configurable;}));
}
