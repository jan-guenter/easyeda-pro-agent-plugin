/** Actual first buffered request generation only. SDK ACK and this dispatch do not prove upload/drain completion. */
import { z } from "zod";
import { CURRENT_PCB_VIA_LOCAL_UPLOAD_FLAGS as FLAGS } from "./current-pcb-via-local-upload-protocol.ts";
import type { CurrentPcbViaLocalUploadCompleted } from "./current-pcb-via-local-upload-cursor.ts";
import { CURRENT_PCB_VIA_UPLOAD_REQUEST_PROGRAMS as PROGRAMS } from "./current-pcb-via-upload-request-programs.ts";
import { CURRENT_PCB_VIA_UPLOAD_REQUEST_REQUESTS as REQUESTS,CURRENT_PCB_VIA_UPLOAD_REQUEST_ROLES as ROLES,validateCurrentPcbViaUploadRequestCommand } from "./current-pcb-via-upload-request-protocol.ts";
import type { CurrentPcbViaUploadRequestCommand,CurrentPcbViaUploadRequestRole } from "./current-pcb-via-upload-request-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentFootprintCopyClockRpcV2ArrayObject,decodeCurrentFootprintCopyClockRpcV2Array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { decodeCurrentGeneratedSyncCallee } from "./current-generated-initial-sync-replies.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_METHODS as METHODS } from "./current-project-save-producer-source.ts";

export interface CurrentPcbViaUploadRequestDispatched {readonly capture:string;readonly historyFrame:string}
export interface CurrentPcbViaUploadRequestHeld {readonly packet:object;readonly role:CurrentPcbViaUploadRequestRole;readonly joinedId:string}
export interface CurrentPcbViaUploadRequestBindings {readonly scriptId:string;readonly local:CurrentPcbViaLocalUploadCompleted;readonly assertCurrent:()=>Promise<void>;readonly requireHeld:(packet:object)=>CurrentPcbViaUploadRequestHeld;readonly request:(command:CurrentPcbViaUploadRequestCommand)=>Promise<unknown>;readonly resume:(held:CurrentPcbViaUploadRequestHeld,command:CurrentPcbViaUploadRequestCommand)=>Promise<void>;readonly fail:()=>void}
const yes=z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})});
function need(value:boolean):asserts value{if(!value){throw new Error("VIA_UPLOAD_ORIGINAL_REQUEST");}}
export class CurrentPcbViaUploadRequestCursor {
  readonly #binding:CurrentPcbViaUploadRequestBindings;readonly #attempts=new WeakSet<object>();#capture:string|null=null;#historyFrame:string|null=null;#original:CurrentPcbViaUploadRequestDispatched|null=null;#step=0;#requests=0;#busy=false;#failed=false;
  public constructor(binding:CurrentPcbViaUploadRequestBindings){this.#binding=binding;Object.freeze(this);}
  async #current():Promise<void>{need(!this.#failed);await this.#binding.assertCurrent();need(!this.#failed);}
  async #send(command:CurrentPcbViaUploadRequestCommand):Promise<unknown>{const fixed=validateCurrentPcbViaUploadRequestCommand(command);await this.#current();this.#requests+=1;need(this.#requests<=REQUESTS.cdpRequests);const result=captureCurrentPcbStringClockReply(await this.#binding.request(fixed)).value;await this.#current();return result;}
  public async continue(packet:object):Promise<void>{need(!this.#failed&&!this.#busy&&this.#step<ROLES.length&&!this.#attempts.has(packet));this.#attempts.add(packet);this.#busy=true;
    try{await this.#current();const held=this.#binding.requireHeld(packet);need(held.packet===packet&&held.role===ROLES[this.#step]);if(held.role==="bufferDrain"){
      this.#capture=decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send(validateCurrentPcbViaUploadRequestCommand({phase:"via-upload-capture",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:held.joinedId,functionDeclaration:PROGRAMS.capture,arguments:[{objectId:this.#binding.local.scheduledFrame},{objectId:this.#binding.local.bodyFrame},{objectId:this.#binding.local.cacheFrame}],returnByValue:false}})),7);
      const fields=decodeCurrentFootprintCopyClockRpcV2Array(await this.#send({phase:"via-upload-properties",method:"Runtime.getProperties",params:{objectId:this.#capture,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}),7);
      for(const[index,name,slot]of [["batch","batchUploadCloud",5],["cloud","uploadCloud",6]] as const){const p=METHODS[name];decodeCurrentGeneratedSyncCallee(await this.#send({phase:"via-upload-callee",index,method:"Runtime.getProperties",params:{objectId:currentFootprintCopyClockRpcV2ArrayObject(fields,slot),ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}),{name,arity:0,async:true,regular:false,lineNumber:p.functionLineNumber,columnNumber:p.functionColumnNumber},this.#binding.scriptId);}
    }else{need(this.#capture!==null);yes.parse(await this.#send(validateCurrentPcbViaUploadRequestCommand({phase:"via-upload-proof",role:held.role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:held.joinedId,functionDeclaration:PROGRAMS[held.role],arguments:[{objectId:this.#capture}],returnByValue:true}})));}
      await this.#current();need(this.#binding.requireHeld(packet)===held);if(held.role==="historyCloud"){this.#historyFrame=held.joinedId;}this.#requests+=1;need(this.#requests<=REQUESTS.cdpRequests);await this.#binding.resume(held,{phase:"via-upload-resume",role:held.role,method:"Debugger.resume",params:{}});await this.#current();this.#step+=1;
    }catch(error){if(!this.#failed){this.#failed=true;this.#binding.fail();}throw error;}finally{this.#busy=false;}}
  public originalDispatched():CurrentPcbViaUploadRequestDispatched{this.requireDispatched();need(this.#capture!==null&&this.#historyFrame!==null);this.#original??=Object.freeze({capture:this.#capture,historyFrame:this.#historyFrame});return this.#original;}
  public requireDispatched():void{need(!this.#busy&&!this.#failed&&this.#step===ROLES.length&&this.#requests===REQUESTS.cdpRequests);}
}
