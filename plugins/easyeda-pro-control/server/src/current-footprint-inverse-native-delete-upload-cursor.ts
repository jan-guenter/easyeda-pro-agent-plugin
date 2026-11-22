/** The same native DEL local cache frames admit its original buffered request.
 * Dispatch alone proves no upload/drain completion; this cursor issues no owner. */
import { z } from "zod";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_FLAGS as FLAGS,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_REQUESTS as REQUESTS,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_ROLES as ROLES,validateCurrentFootprintInverseNativeDeleteUploadCommand}from "./current-footprint-inverse-native-delete-upload-protocol.ts";
import type { CurrentFootprintInverseNativeDeleteLocalCompleted } from "./current-footprint-inverse-native-delete-local-cursor.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_PROGRAMS as PROGRAMS } from "./current-footprint-inverse-native-delete-upload-programs.ts";
import type { CurrentFootprintInverseNativeDeleteUploadCommand,CurrentFootprintInverseNativeDeleteUploadRole } from "./current-footprint-inverse-native-delete-upload-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentFootprintCopyClockRpcV2ArrayObject,decodeCurrentFootprintCopyClockRpcV2Array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { decodeCurrentGeneratedSyncCallee } from "./current-generated-initial-sync-replies.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_METHODS as METHODS } from "./current-project-save-producer-source.ts";

export interface CurrentFootprintInverseNativeDeleteUploadDispatched {readonly capture:string;readonly historyFrame:string}
export interface CurrentFootprintInverseNativeDeleteUploadHeld {readonly packet:object;readonly role:CurrentFootprintInverseNativeDeleteUploadRole;readonly joinedId:string}
export interface CurrentFootprintInverseNativeDeleteUploadBindings {readonly scriptId:string;readonly reflection:string;readonly recipe:string;readonly local:CurrentFootprintInverseNativeDeleteLocalCompleted;readonly assertCurrent:()=>Promise<void>;readonly requireHeld:(packet:object)=>CurrentFootprintInverseNativeDeleteUploadHeld;readonly request:(command:CurrentFootprintInverseNativeDeleteUploadCommand)=>Promise<unknown>;readonly qualifyHelper:(command:CurrentFootprintInverseNativeDeleteUploadCommand)=>Promise<void>;readonly resume:(held:CurrentFootprintInverseNativeDeleteUploadHeld,command:CurrentFootprintInverseNativeDeleteUploadCommand)=>Promise<void>;readonly fail:(cause:unknown)=>void}
const yes=z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})});
function need(value:boolean):asserts value{if(!value){throw new Error("INVERSE_NATIVE_DELETE_UPLOAD_ORIGINAL_REQUEST");}}
export class CurrentFootprintInverseNativeDeleteUploadCursor {
  readonly #binding:CurrentFootprintInverseNativeDeleteUploadBindings;readonly #attempts=new WeakSet<object>();#capture:string|null=null;#historyFrame:string|null=null;#original:CurrentFootprintInverseNativeDeleteUploadDispatched|null=null;#step=0;#requests=0;#busy=false;#failed=false;
  public constructor(binding:CurrentFootprintInverseNativeDeleteUploadBindings){this.#binding=Object.freeze({...binding});Object.freeze(this);}
  async #current():Promise<void>{need(!this.#failed);await this.#binding.assertCurrent();need(!this.#failed);}
  async #send(command:CurrentFootprintInverseNativeDeleteUploadCommand):Promise<unknown>{const fixed=validateCurrentFootprintInverseNativeDeleteUploadCommand(command);await this.#current();this.#requests+=1;need(this.#requests<=REQUESTS.cursor);need(!this.#failed);const result=captureCurrentPcbStringClockReply(await this.#binding.request(fixed)).value;await this.#current();if(fixed.method==="Runtime.callFunctionOn"){await this.#binding.qualifyHelper(fixed);await this.#current();}return result;}
  public async continue(packet:object):Promise<void>{need(!this.#failed&&!this.#busy&&this.#step<ROLES.length&&!this.#attempts.has(packet));this.#attempts.add(packet);this.#busy=true;
    try{await this.#current();const held=this.#binding.requireHeld(packet);need(held.packet===packet&&held.role===ROLES[this.#step]);if(held.role==="bufferDrain"){
      this.#capture=decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send(validateCurrentFootprintInverseNativeDeleteUploadCommand({phase:"inverse-native-delete-upload-capture",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:held.joinedId,functionDeclaration:PROGRAMS.capture,arguments:[{objectId:held.joinedId},{objectId:this.#binding.local.scheduledFrame},{objectId:this.#binding.local.bodyFrame},{objectId:this.#binding.local.cacheFrame},{objectId:this.#binding.reflection},{objectId:this.#binding.recipe}],returnByValue:false}})),7);
      const fields=decodeCurrentFootprintCopyClockRpcV2Array(await this.#send({phase:"inverse-native-delete-upload-properties",method:"Runtime.getProperties",params:{objectId:this.#capture,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}),7);
      for(const[index,name,slot]of [["batch","batchUploadCloud",5],["cloud","uploadCloud",6]] as const){const p=METHODS[name];decodeCurrentGeneratedSyncCallee(await this.#send({phase:"inverse-native-delete-upload-callee",index,method:"Runtime.getProperties",params:{objectId:currentFootprintCopyClockRpcV2ArrayObject(fields,slot),ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}),{name,arity:0,async:true,regular:false,lineNumber:p.functionLineNumber,columnNumber:p.functionColumnNumber},this.#binding.scriptId);}
    }else{need(this.#capture!==null);yes.parse(await this.#send(validateCurrentFootprintInverseNativeDeleteUploadCommand({phase:"inverse-native-delete-upload-proof",role:held.role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:held.joinedId,functionDeclaration:PROGRAMS[held.role],arguments:[{objectId:held.joinedId},{objectId:this.#capture},{objectId:this.#binding.reflection},{objectId:this.#binding.recipe}],returnByValue:true}})));}
      await this.#current();need(this.#binding.requireHeld(packet)===held);if(held.role==="historyCloud"){this.#historyFrame=held.joinedId;}this.#requests+=1;need(this.#requests<=REQUESTS.cursor);await this.#binding.resume(held,{phase:"inverse-native-delete-upload-resume",role:held.role,method:"Debugger.resume",params:{}});await this.#current();this.#step+=1;
    }catch(error){if(!this.#failed){this.#failed=true;this.#binding.fail(error);}throw error;}finally{this.#busy=false;}}
  public progress():Readonly<{acknowledgedResumes:number;dispatched:boolean;failed:boolean}>{return Object.freeze({acknowledgedResumes:this.#step,dispatched:!this.#failed&&!this.#busy&&this.#step===ROLES.length,failed:this.#failed});}
  public originalDispatched():CurrentFootprintInverseNativeDeleteUploadDispatched{this.requireDispatched();need(this.#capture!==null&&this.#historyFrame!==null);this.#original??=Object.freeze({capture:this.#capture,historyFrame:this.#historyFrame});return this.#original;}
  public requireDispatched():void{need(!this.#busy&&!this.#failed&&this.#step===ROLES.length&&this.#requests===REQUESTS.cursor);}
}

Object.freeze(CurrentFootprintInverseNativeDeleteUploadCursor.prototype);
Object.freeze(CurrentFootprintInverseNativeDeleteUploadCursor);
