/** Native single-string/default-parse local continuation. The original Core
 * captures its exact body tuple before this fixed20-command continuation. Completion means only the accepted local
 * put and buffered callback scheduling, never upload/history/drain or Save. */
import { CURRENT_PCB_VIA_LOCAL_KEY_CALLEES as KEY_CALLEES } from "./current-pcb-via-local-key-source.ts";
import { decodeCurrentGeneratedSyncCallee } from "./current-generated-initial-sync-replies.ts";
import { currentFootprintCopyClockRpcV2ArrayObject,decodeCurrentFootprintCopyClockRpcV2Array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_FRAME_FLAGS } from "./current-project-save-producer-protocol.ts";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentProjectSaveProducerCachePromise } from "./current-project-save-producer-cache-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_LOCAL_FLAGS as FLAGS, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_LOCAL_REQUESTS as REQUESTS, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_LOCAL_ROLES as ROLES, validateCurrentFootprintInverseNativeDeleteLocalCommand } from "./current-footprint-inverse-native-delete-local-protocol.ts";
import type { CurrentFootprintInverseNativeDeleteLocalCommand, CurrentFootprintInverseNativeDeleteLocalRole } from "./current-footprint-inverse-native-delete-local-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_LOCAL_PROGRAMS as PROGRAMS } from "./current-footprint-inverse-native-delete-local-programs.ts";

export interface CurrentFootprintInverseNativeDeleteLocalCompleted {readonly scheduledFrame:string;readonly bodyFrame:string;readonly cacheFrame:string;readonly putPromise:string;readonly bufferPromise:string}
export interface CurrentFootprintInverseNativeDeleteLocalHeld { readonly packet: object; readonly role: CurrentFootprintInverseNativeDeleteLocalRole; readonly joinedId: string; readonly callFrameId:string; readonly key: string | null; readonly cache: Readonly<{ role: string; joinedId: string }> | null; readonly promise: Readonly<{ objectId: string }> | null; readonly bufferPromise: string | null }
export interface CurrentFootprintInverseNativeDeleteLocalBindings { readonly scriptId:string; readonly body: string; readonly bodyObject: string; readonly branchUuid: string; readonly assertCurrent: () => Promise<void>; readonly requireHeld: (packet: object) => CurrentFootprintInverseNativeDeleteLocalHeld; readonly request: (command: CurrentFootprintInverseNativeDeleteLocalCommand) => Promise<unknown>; readonly qualifyHelper:(command:CurrentFootprintInverseNativeDeleteLocalCommand)=>Promise<void>; readonly resume: (held: CurrentFootprintInverseNativeDeleteLocalHeld, command: CurrentFootprintInverseNativeDeleteLocalCommand) => Promise<void>; readonly fail: () => void }
const yes = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_DELETE_LOCAL_ORIGINAL"); } }
export class CurrentFootprintInverseNativeDeleteLocalCursor {
  readonly #binding: CurrentFootprintInverseNativeDeleteLocalBindings; readonly #attempts = new WeakSet<object>(); readonly #frames = new Map<CurrentFootprintInverseNativeDeleteLocalRole,string>();
  #step = 0; #requests = 0; #busy = false; #failed = false; #completed = false; #cache: string | null = null; #putPromise: string | null = null; #bufferPromise: string | null = null; #completedReference: CurrentFootprintInverseNativeDeleteLocalCompleted | null = null;
  public constructor(bindings: CurrentFootprintInverseNativeDeleteLocalBindings) { this.#binding = Object.freeze({ ...bindings }); Object.freeze(this); }
  async #current(): Promise<void> { need(!this.#failed); await this.#binding.assertCurrent(); need(!this.#failed); }
  async #send(command: CurrentFootprintInverseNativeDeleteLocalCommand): Promise<unknown> { const fixed = validateCurrentFootprintInverseNativeDeleteLocalCommand(command); await this.#current(); this.#requests += 1; need(this.#requests <= REQUESTS.cdpRequests - REQUESTS.capture); const value = captureCurrentPcbStringClockReply(await this.#binding.request(fixed)).value; await this.#current(); if(fixed.method==="Runtime.callFunctionOn"||fixed.method==="Debugger.evaluateOnCallFrame"){await this.#binding.qualifyHelper(fixed);await this.#current();} return value; }
  #frame(role: CurrentFootprintInverseNativeDeleteLocalRole): string { const value = this.#frames.get(role); need(value !== undefined); return value; }
  public async continue(packet: object): Promise<void> {
    need(!this.#busy && !this.#failed && !this.#completed && !this.#attempts.has(packet)); this.#attempts.add(packet); this.#busy = true;
    try { await this.#current(); const held = this.#binding.requireHeld(packet), role = ROLES[this.#step]; need(role !== undefined && held.packet === packet && held.role === role); this.#frames.set(role,held.joinedId);
      let objectId = held.joinedId; let args: ({ objectId: string } | { value: string })[];
      if (role === "localIngress") { const tuple=decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send({phase:"inverse-native-delete-local-key-frame",role:"source",method:"Debugger.evaluateOnCallFrame",params:{...CURRENT_PROJECT_SAVE_PRODUCER_FRAME_FLAGS,objectGroup:FLAGS.objectGroup,callFrameId:held.callFrameId,expression:"[Qe,cg]"}}),2);const fields=decodeCurrentFootprintCopyClockRpcV2Array(await this.#send({phase:"inverse-native-delete-local-key-properties",role:"tuple",method:"Runtime.getProperties",params:{objectId:tuple,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}),2);for(const[index,profile]of KEY_CALLEES.entries()){const name=profile.name;if(name!=="Qe"&&name!=="cg"){throw new Error("VIA_LOCAL_KEY_PROFILE");}decodeCurrentGeneratedSyncCallee(await this.#send({phase:"inverse-native-delete-local-key-properties",role:name,method:"Runtime.getProperties",params:{objectId:currentFootprintCopyClockRpcV2ArrayObject(fields,index),ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}),profile,this.#binding.scriptId);}args = [{ objectId: this.#binding.bodyObject }]; }
      else if (role === "headEntry") { need(held.cache?.role === "localUpload" && held.key !== null && new RegExp(`^https://client/upload/${this.#binding.branchUuid}\\?key=[a-f0-9]{16}$`,"u").test(held.key)); this.#cache = held.cache.joinedId; objectId = this.#cache; args = [{ value: held.key },{ value: this.#binding.body }]; }
      else if (role === "headPromise") { need(this.#cache !== null && held.promise !== null); this.#putPromise = held.promise.objectId; args = [{ objectId: this.#cache }]; }
      else if (role === "headSuccess") { need(this.#cache !== null); args = [{ objectId: this.#cache },{ objectId: this.#frame("headPromise") }]; }
      else if (role === "bufferIngress") { need(this.#cache !== null); args = [{ objectId: this.#frame("localIngress") },{ objectId: this.#binding.bodyObject },{ objectId: this.#cache }]; }
      else if (role === "bufferScheduled") { need(this.#cache !== null && held.bufferPromise !== null); this.#bufferPromise = held.bufferPromise; args = [{ objectId: this.#frame("bufferIngress") },{ objectId: this.#binding.bodyObject },{ objectId: this.#cache }]; }
      else { args = [{ objectId: this.#frame("localIngress") },{ objectId: this.#binding.bodyObject },{ objectId: this.#frame("bufferScheduled") }]; }
      yes.parse(await this.#send(validateCurrentFootprintInverseNativeDeleteLocalCommand({ phase: "inverse-native-delete-local-proof", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: PROGRAMS[role], arguments: args } })));
      await this.#current(); need(this.#binding.requireHeld(packet) === held); this.#requests += 1; need(this.#requests <= REQUESTS.cdpRequests - REQUESTS.capture);
      await this.#binding.resume(held,validateCurrentFootprintInverseNativeDeleteLocalCommand({ phase:"inverse-native-delete-local-resume",role,method:"Debugger.resume",params:{} })); await this.#current(); this.#step += 1;
      if (this.#step === ROLES.length) { need(this.#putPromise !== null && this.#bufferPromise !== null);
        for (const [kind,promise,state] of [["cache",this.#putPromise,"fulfilled"],["buffer",this.#bufferPromise,"pending"]] as const) { need(decodeCurrentProjectSaveProducerCachePromise(await this.#send({ phase:"inverse-native-delete-local-properties",role:kind,method:"Runtime.getProperties",params:{objectId:promise,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false} })) === state); } this.#completed = true; }
    } catch (error) {
      if (!this.#failed) {
        this.#failed = true;
        try { this.#binding.fail(); } catch {
          // Preserve the original continuation failure even if notification fails.
        }
      }
      throw error;
    } finally { this.#busy = false; }
  }
  public originalCompleted(): CurrentFootprintInverseNativeDeleteLocalCompleted { this.requireCompleted();need(this.#cache!==null&&this.#putPromise!==null&&this.#bufferPromise!==null);this.#completedReference??=Object.freeze({scheduledFrame:this.#frame("bufferScheduled"),bodyFrame:this.#binding.bodyObject,cacheFrame:this.#cache,putPromise:this.#putPromise,bufferPromise:this.#bufferPromise});return this.#completedReference; }
  public requireCompleted(): void { need(!this.#busy && !this.#failed && this.#completed); }
  public progress(): Readonly<{ acknowledgedResumes: number; requests: number; busy: boolean; completed: boolean; failed: boolean }> {
    return Object.freeze({ acknowledgedResumes: this.#step, requests: this.#requests, busy: this.#busy, completed: this.#completed, failed: this.#failed });
  }
}

Object.freeze(CurrentFootprintInverseNativeDeleteLocalCursor.prototype);
Object.freeze(CurrentFootprintInverseNativeDeleteLocalCursor);
