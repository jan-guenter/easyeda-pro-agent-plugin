/** Same original held upload, completed startup capture and helper scripts.
 * This passive receipt can reserve a source path; it does not join its effects. */
import{types}from"node:util";
import{z}from"zod";
import type{DiagnosticEvent}from"./current-pcb-diagnostic-protocol.ts";
import{captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";
import{decodeCurrentFootprintCopyClockRpcV2Array as array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture as arrayCapture,currentFootprintCopyClockRpcV2ArrayObject as objectAt}from"./current-footprint-copy-clock-rpc-v2-protocol.ts";
import{decodeCurrentGeneratedSyncCallee}from"./current-generated-initial-sync-replies.ts";
import{currentFootprintInverseLookupNativeCallable,qualifyCurrentFootprintInverseLookupNativeConstructor}from"./current-footprint-inverse-lookup-native-metadata.ts";
import{decodeCurrentNativeFunctionMetadata}from"./current-native-function-metadata.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SEGMENTS_FRAME as FRAME,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SEGMENTS_PROGRAMS as PROGRAMS,currentFootprintInverseNativeDeleteSegmentsMetadata as metadata}from"./current-footprint-inverse-native-delete-segments-programs.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SEGMENTS_FLAGS as FLAGS,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SEGMENTS_ORDER as ORDER,currentFootprintInverseNativeDeleteSegmentsKey as key,currentFootprintInverseNativeDeleteSegmentsProgram as program,validateCurrentFootprintInverseNativeDeleteSegmentsCommand as validate}from"./current-footprint-inverse-native-delete-segments-protocol.ts";
import type{CurrentFootprintInverseNativeDeleteSegmentsCommand as Command}from"./current-footprint-inverse-native-delete-segments-protocol.ts";

const yes=z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})});
function need(value:boolean):asserts value{if(!value){throw new Error("INVERSE_NATIVE_DELETE_SEGMENTS_ORIGINAL");}}
export interface CurrentFootprintInverseNativeDeleteSegmentsBindings{
 readonly source:string;readonly scriptId:string;readonly sessionId:string;readonly contextId:number;readonly frame:string;
 readonly intrinsics:string;readonly initialCapture:string;readonly publicationCapture:string;readonly headCount:number;
 readonly current:()=>void;readonly assertOriginalHeld:()=>void;readonly assertOriginalExit:()=>void;
 readonly assertOriginalEvent:(event:DiagnosticEvent)=>void;readonly send:(command:Command,beforeTransfer:()=>void)=>Promise<unknown>;
 readonly control:(phase:"bind"|"complete")=>Promise<void>;
}
export interface CurrentFootprintInverseNativeDeleteSegmentsData{
 readonly capture:string;readonly initialCapture:string;readonly headCount:number;readonly cdpRequests:26;
 readonly originalOldSegmentsComplete:true;readonly originalPendingWorkEmpty:true;readonly originalPostSyncCalleesVerified:true;
 readonly workerNewSegmentsVerified:false;readonly originalDeletePromiseJoined:false;readonly completeInverseVerified:false;
}
interface Helper{readonly command:Command;issued:boolean;scriptId:string|null;attempted:boolean}
const originals=new WeakSet<object>();
export class CurrentFootprintInverseNativeDeleteSegmentsController{
 readonly #b:CurrentFootprintInverseNativeDeleteSegmentsBindings;readonly #requests:Promise<unknown>[]=[];
 #pending:Promise<Readonly<CurrentFootprintInverseNativeDeleteSegmentsData>>|null=null;#data:Readonly<CurrentFootprintInverseNativeDeleteSegmentsData>|null=null;
 #helper:Helper|null=null;#reading=false;#failed=false;#transferred=false;#step=0;#events=0;#normal=0;#helpers=0;
 public constructor(bindings:CurrentFootprintInverseNativeDeleteSegmentsBindings){this.#b=Object.freeze({...bindings});originals.add(this);Object.freeze(this);}
 #current():void{this.#b.current();need(!this.#failed);if(!this.#transferred){this.#b.assertOriginalHeld();}}
 public observe(event:DiagnosticEvent):boolean{
  if(event.sessionId!==this.#b.sessionId||this.#data!==null||event.method!=="Debugger.scriptParsed"){return false;}
  try{this.#current();this.#b.assertOriginalEvent(event);const h=this.#helper;need(h!==null&&h.issued&&!h.attempted&&h.scriptId===null&&event.params["url"]===""&&event.params["executionContextId"]===this.#b.contextId&&typeof event.params["scriptId"]==="string"&&/^[A-Za-z\d_.:-]{1,256}$/u.test(event.params["scriptId"])&&(this.#events+=1)<=4);h.scriptId=event.params["scriptId"];return true;}catch(error){this.#failed=true;throw error;}
 }
 async #send(input:Command):Promise<unknown>{
  this.#current();const c=validate(input);need(key(c)===ORDER[this.#step]);this.#step+=1;
  const pending=this.#b.send(c,():void=>{this.#current();if(program(c)!==null){const h=this.#helper;need(h!==null&&!h.issued&&h.command===input);h.issued=true;}});
  need(types.isPromise(pending)&&this.#requests.length<26);this.#requests.push(pending);const value=capture(await pending).value;this.#current();return value;
 }
 async #read(input:unknown):Promise<unknown>{
  this.#current();need(!this.#reading&&this.#helper===null&&this.#data===null);this.#reading=true;
  try{const c=validate(input);need((this.#normal+=1)<=22);if(program(c)!==null){this.#helper={command:c,issued:false,scriptId:null,attempted:false};}
   const raw=await this.#send(c);if(program(c)!==null){await this.#qualify(c);}this.#current();return raw;
  }catch(error){this.#failed=true;throw error;}finally{this.#reading=false;}
 }
 async #qualify(command:Command):Promise<void>{
  const h=this.#helper;need(h!==null&&h.command===command&&h.issued&&!h.attempted&&h.scriptId!==null);h.attempted=true;
  const raw=await this.#send(validate({phase:"inverse-native-delete-segments-helper",role:command.phase.replace("inverse-native-delete-segments-",""),method:"Debugger.getScriptSource",params:{scriptId:h.scriptId}}));
  z.strictObject({scriptSource:z.literal(program(command))}).parse(raw);need((this.#helpers+=1)<=4);this.#helper=null;
 }
 public start():Promise<Readonly<CurrentFootprintInverseNativeDeleteSegmentsData>>{
  if(this.#pending!==null){return this.#pending;}const out=Promise.withResolvers<Readonly<CurrentFootprintInverseNativeDeleteSegmentsData>>();this.#pending=out.promise;
  void(async():Promise<void>=>{try{this.#current();const profiles=metadata(this.#b.source);need(profiles.length===13);await this.#b.control("bind");this.#current();
   const props=(role:string,objectId:string):Promise<unknown>=>this.#read({phase:"inverse-native-delete-segments-properties",role,method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});
   const module=arrayCapture(await this.#read({phase:"inverse-native-delete-segments-module",method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId:this.#b.frame,expression:FRAME,returnByValue:false,includeCommandLineAPI:false}}),10);
   const nativeReply=z.strictObject({result:z.unknown()}).parse(await this.#read({phase:"inverse-native-delete-segments-native",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:this.#b.intrinsics,functionDeclaration:PROGRAMS.native,arguments:[],returnByValue:false,awaitPromise:false,userGesture:false}}));
   const nativeMap=currentFootprintInverseLookupNativeCallable(nativeReply.result,"Map");qualifyCurrentFootprintInverseLookupNativeConstructor(await props("native-Map",nativeMap),nativeReply.result,"Map");
   const retained=arrayCapture(await this.#read({phase:"inverse-native-delete-segments-capture",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:this.#b.intrinsics,functionDeclaration:PROGRAMS.capture,arguments:[{objectId:this.#b.initialCapture},{objectId:module},{objectId:this.#b.publicationCapture},{objectId:nativeMap},{value:this.#b.headCount}],returnByValue:false,awaitPromise:false,userGesture:false}}),6);
   const packet=array(await props("capture",retained),6);const functions=objectAt(packet,4),members=array(await props("functions",functions),13);
   for(const[index,row]of profiles.entries()){const actual=members.get(String(index));need(actual?.type==="function"&&actual.className==="Function"&&actual.subtype===undefined&&actual.description===row.source);decodeCurrentGeneratedSyncCallee(await props(`method-${String(index)}`,objectAt(members,index)),row,this.#b.scriptId);}
   const natives=array(await props("natives",objectAt(packet,5)),2);const map=natives.get("0"),size=natives.get("1");need(map!==undefined&&size!==undefined);
   currentFootprintInverseLookupNativeCallable(map,"Map");
   currentFootprintInverseLookupNativeCallable(size,"get size");decodeCurrentNativeFunctionMetadata(await props("native-size",objectAt(natives,1)),{name:"get size",arity:0,constructor:false});
   yes.parse(await this.#read({phase:"inverse-native-delete-segments-reprove",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:this.#b.intrinsics,functionDeclaration:PROGRAMS.reprove,arguments:[{objectId:retained},{value:this.#b.headCount}],returnByValue:true,awaitPromise:false,userGesture:false}}));
   this.#current();need(this.#step===26&&this.#normal===22&&this.#helpers===4&&this.#events===4&&this.#requests.length===26&&this.#helper===null);await this.#b.control("complete");this.#current();
   const data=Object.freeze({capture:retained,initialCapture:this.#b.initialCapture,headCount:this.#b.headCount,cdpRequests:26 as const,originalOldSegmentsComplete:true as const,originalPendingWorkEmpty:true as const,originalPostSyncCalleesVerified:true as const,workerNewSegmentsVerified:false as const,originalDeletePromiseJoined:false as const,completeInverseVerified:false as const});this.#data=data;out.resolve(data);
  }catch(error){this.#failed=true;out.reject(error);}})();return out.promise;
 }
 public requireOriginal(data:Readonly<CurrentFootprintInverseNativeDeleteSegmentsData>):void{this.#current();need(this.#data===data&&this.#pending!==null&&!this.#reading&&!this.#transferred);}
 public consumeOriginalUpload(data:Readonly<CurrentFootprintInverseNativeDeleteSegmentsData>):void{this.requireOriginal(data);this.#transferred=true;}
 public requireTransferred(data:Readonly<CurrentFootprintInverseNativeDeleteSegmentsData>):void{this.#current();need(this.#data===data&&this.#pending!==null&&!this.#reading&&this.#transferred);}
 public async settleAfterOriginalExit():Promise<void>{this.#b.assertOriginalExit();this.#failed=true;await Promise.allSettled([this.#pending,...this.#requests]);this.#b.assertOriginalExit();}
}
Object.freeze(CurrentFootprintInverseNativeDeleteSegmentsController.prototype);
Object.freeze(CurrentFootprintInverseNativeDeleteSegmentsController);
export function assertOriginalCurrentFootprintInverseNativeDeleteSegmentsController(value:CurrentFootprintInverseNativeDeleteSegmentsController):void{need(value!==null&&typeof value==="object"&&!types.isProxy(value)&&originals.has(value)&&Object.getPrototypeOf(value)===CurrentFootprintInverseNativeDeleteSegmentsController.prototype&&Reflect.ownKeys(value).length===0);}
