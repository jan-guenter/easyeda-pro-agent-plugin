/** Same original worker, held upload and helper-script custody. */
import {types} from "node:util";
import type {DiagnosticEvent} from "./current-pcb-diagnostic-protocol.ts";
import {observeCurrentFootprintInverseNativeDeletePublication as observe} from "./current-footprint-inverse-native-delete-publication-observer.ts";
import type {CurrentFootprintInverseNativeDeletePublicationData as Data,CurrentFootprintInverseNativeDeletePublicationBindings as Observer} from "./current-footprint-inverse-native-delete-publication-observer.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_PUBLICATION_ORDER as ORDER,currentFootprintInverseNativeDeletePublicationHelperCommand as helperCommand,currentFootprintInverseNativeDeletePublicationKey as key,currentFootprintInverseNativeDeletePublicationProgram as program,qualifyCurrentFootprintInverseNativeDeletePublicationHelper as qualify,validateCurrentFootprintInverseNativeDeletePublicationCommand as validate} from "./current-footprint-inverse-native-delete-publication-protocol.ts";
import type {CurrentFootprintInverseNativeDeletePublicationCommand as Command} from "./current-footprint-inverse-native-delete-publication-protocol.ts";

export interface CurrentFootprintInverseNativeDeletePublicationControllerBindings extends Omit<Observer,"request"|"qualifyHelper">{
 readonly contextId:number;readonly sessionId:string;readonly assertOriginalHeld:()=>void;readonly assertOriginalEvent:(event:DiagnosticEvent)=>void;readonly assertOriginalExit:()=>void;
 readonly send:(command:Command,beforeTransfer:()=>void)=>Promise<unknown>;readonly control:(phase:"bind"|"complete")=>Promise<void>;
}
interface Helper{readonly command:Command;scriptId:string|null;issued:boolean;attempted:boolean}
function need(ok:boolean):asserts ok{if(!ok){throw new Error("INVERSE_NATIVE_DELETE_PUBLICATION_CUSTODY");}}
const originals=new WeakSet<object>();
export class CurrentFootprintInverseNativeDeletePublicationController{
 readonly #b:CurrentFootprintInverseNativeDeletePublicationControllerBindings;readonly #requests:Promise<unknown>[]=[];
 #consumed=false;#helper:Helper|null=null;#step=0;#normal=0;#helpers=0;#events=0;#reading=false;#failed=false;#data:Readonly<Data>|null=null;#pending:Promise<Readonly<Data>>|null=null;
 public constructor(bindings:CurrentFootprintInverseNativeDeletePublicationControllerBindings){this.#b=Object.freeze({...bindings});originals.add(this);}
 #current():void{try{this.#b.current();if(!this.#consumed){this.#b.assertOriginalHeld();}need(!this.#failed);}catch(error){this.#failed=true;throw error;}}
 public observe(event:DiagnosticEvent):boolean{
 if(event.sessionId!==this.#b.sessionId||this.#data!==null||event.method!=="Debugger.scriptParsed"){return false;}
 try{this.#current();this.#b.assertOriginalEvent(event);const h=this.#helper;need(event.params["url"]===""&&h!==null&&h.issued&&!h.attempted&&h.scriptId===null&&(this.#events+=1)<=4&&event.params["executionContextId"]===this.#b.contextId&&typeof event.params["scriptId"]==="string"&&/^[A-Za-z0-9_.:-]{1,256}$/u.test(event.params["scriptId"]));h.scriptId=event.params["scriptId"];return true;
 }catch(error){this.#failed=true;throw error;}
 }
 public start():Promise<Readonly<Data>>{
 if(this.#pending!==null){return this.#pending;}const out=Promise.withResolvers<Readonly<Data>>();this.#pending=out.promise;
 void(async():Promise<void>=>{try{this.#current();await this.#b.control("bind");this.#current();const data=await observe({...this.#b,request:c=>this.#read(c),qualifyHelper:c=>this.#qualify(c)});this.#current();
 need(this.#data===null&&this.#helper===null&&this.#step===46&&this.#normal===42&&this.#helpers===4&&this.#events===4&&this.#requests.length===46);await this.#b.control("complete");this.#current();this.#data=data;out.resolve(data);
 }catch(error){this.#failed=true;out.reject(error);}})();return out.promise;
 }
 async #send(c:Command):Promise<unknown>{this.#current();need(key(c)===ORDER[this.#step]);this.#step+=1;const pending=this.#b.send(c,():void=>{this.#current();if(program(c)!==null){need(this.#helper!==null&&!this.#helper.issued);this.#helper.issued=true;}});need(types.isPromise(pending)&&this.#requests.length<46);this.#requests.push(pending);const raw=await pending;this.#current();return raw;}
 async #read(input:Command):Promise<unknown>{try{this.#current();need(!this.#reading&&this.#helper===null&&this.#data===null);this.#reading=true;const c=validate(input);need((this.#normal+=1)<=42);if(program(c)!==null){this.#helper={command:input,scriptId:null,issued:false,attempted:false};}return await this.#send(c);}catch(error){this.#failed=true;throw error;}finally{this.#reading=false;}}
 async #qualify(input:Command):Promise<void>{try{this.#current();const h=this.#helper;need(!this.#reading&&h!==null&&!h.attempted&&h.scriptId!==null&&h.command===input);h.attempted=true;this.#reading=true;const raw=await this.#send(helperCommand(input,h.scriptId));qualify(raw,input);need((this.#helpers+=1)<=4);this.#helper=null;}catch(error){this.#failed=true;throw error;}finally{this.#reading=false;}}
 public requireOriginal(data:Readonly<Data>):Readonly<Data>{this.#current();need(!this.#consumed&&this.#data===data&&this.#pending!==null&&!this.#reading);return data;}
 public consumeOriginalUpload(data:Readonly<Data>):void{this.requireOriginal(data);need(!this.#consumed);this.#consumed=true;}
 public requireTransferredUpload(data:Readonly<Data>):void{this.#current();need(this.#consumed&&this.#data===data&&this.#pending!==null&&!this.#reading);}
 public async settleAfterOriginalExit():Promise<void>{this.#b.assertOriginalExit();this.#failed=true;await Promise.allSettled([this.#pending,...this.#requests]);this.#b.assertOriginalExit();}
}
const methods=Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeDeletePublicationController.prototype);
export function assertOriginalCurrentFootprintInverseNativeDeletePublicationController(value:CurrentFootprintInverseNativeDeletePublicationController):void{need(value!==null&&typeof value==="object"&&!types.isProxy(value)&&originals.has(value)&&Object.getPrototypeOf(value)===CurrentFootprintInverseNativeDeletePublicationController.prototype&&Reflect.ownKeys(value).length===0);const actual=Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeDeletePublicationController.prototype);need(Reflect.ownKeys(actual).length===Reflect.ownKeys(methods).length&&Object.entries(methods).every(([name,d])=>{const n=actual[name];return n!==undefined&&n.value===d.value&&n.get===d.get&&n.set===d.set&&n.writable===d.writable&&n.enumerable===d.enumerable&&n.configurable===d.configurable;}));}
