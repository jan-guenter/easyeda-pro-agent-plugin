/** Full two-string copy local continuation. The original Core captures the
 * exact body tuple before this fixed20-command continuation. Completion means only the accepted local
 * put and buffered callback scheduling, never upload/history/drain or Save. */
import { CURRENT_PCB_VIA_LOCAL_KEY_CALLEES as KEY_CALLEES } from "./current-pcb-via-local-key-source.ts";
import { decodeCurrentGeneratedSyncCallee } from "./current-generated-initial-sync-replies.ts";
import { currentFootprintCopyClockRpcV2ArrayObject,decodeCurrentFootprintCopyClockRpcV2Array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_FRAME_FLAGS } from "./current-project-save-producer-protocol.ts";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentProjectSaveProducerCachePromise } from "./current-project-save-producer-cache-replies.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_COPY_LOCAL_FLAGS as FLAGS, CURRENT_FOOTPRINT_FORWARD_WRITER_COPY_LOCAL_REQUESTS as REQUESTS, CURRENT_FOOTPRINT_FORWARD_WRITER_COPY_LOCAL_ROLES as ROLES, validateCurrentFootprintForwardWriterCopyLocalCommand } from "./current-footprint-forward-writer-copy-local-protocol.ts";
import type { CurrentFootprintForwardWriterCopyLocalCommand, CurrentFootprintForwardWriterCopyLocalRole } from "./current-footprint-forward-writer-copy-local-protocol.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_COPY_LOCAL_PROGRAMS as PROGRAMS } from "./current-footprint-forward-writer-copy-local-programs.ts";

export interface CurrentFootprintForwardWriterCopyLocalCompleted {readonly scheduledFrame:string;readonly bodyFrame:string;readonly cacheFrame:string;readonly putPromise:string;readonly bufferPromise:string}
export interface CurrentFootprintForwardWriterCopyLocalHeld { readonly packet: object; readonly role: CurrentFootprintForwardWriterCopyLocalRole; readonly joinedId: string; readonly callFrameId:string; readonly key: string | null; readonly cache: Readonly<{ role: string; joinedId: string }> | null; readonly promise: Readonly<{ objectId: string }> | null; readonly bufferPromise: string | null }
export interface CurrentFootprintForwardWriterCopyLocalBindings { readonly scriptId:string; readonly body: string; readonly bodyObject: string; readonly branchUuid: string; readonly assertCurrent: () => Promise<void>; readonly requireHeld: (packet: object) => CurrentFootprintForwardWriterCopyLocalHeld; readonly request: (command: CurrentFootprintForwardWriterCopyLocalCommand) => Promise<unknown>; readonly resume: (held: CurrentFootprintForwardWriterCopyLocalHeld, command: CurrentFootprintForwardWriterCopyLocalCommand) => Promise<void>; readonly fail: () => void }
const yes = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
function need(value: boolean): asserts value { if (!value) { throw new Error("FORWARD_COPY_LOCAL_ORIGINAL"); } }
export class CurrentFootprintForwardWriterCopyLocalCursor {
  readonly #binding: CurrentFootprintForwardWriterCopyLocalBindings; readonly #attempts = new WeakSet<object>(); readonly #frames = new Map<CurrentFootprintForwardWriterCopyLocalRole,string>();
  #step = 0; #requests = 0; #busy = false; #failed = false; #completed = false; #cache: string | null = null; #putPromise: string | null = null; #bufferPromise: string | null = null; #completedReference: CurrentFootprintForwardWriterCopyLocalCompleted | null = null;
  public constructor(bindings: CurrentFootprintForwardWriterCopyLocalBindings) { this.#binding = bindings; Object.freeze(this); }
  async #current(): Promise<void> { need(!this.#failed); await this.#binding.assertCurrent(); need(!this.#failed); }
  async #send(command: CurrentFootprintForwardWriterCopyLocalCommand): Promise<unknown> { const fixed = validateCurrentFootprintForwardWriterCopyLocalCommand(command); await this.#current(); this.#requests += 1; need(this.#requests <= REQUESTS.cdpRequests - REQUESTS.capture); const value = captureCurrentPcbStringClockReply(await this.#binding.request(fixed)).value; await this.#current(); return value; }
  #frame(role: CurrentFootprintForwardWriterCopyLocalRole): string { const value = this.#frames.get(role); need(value !== undefined); return value; }
  public async continue(packet: object): Promise<void> {
    need(!this.#busy && !this.#failed && !this.#completed && !this.#attempts.has(packet)); this.#attempts.add(packet); this.#busy = true;
    try { await this.#current(); const held = this.#binding.requireHeld(packet), role = ROLES[this.#step]; need(role !== undefined && held.packet === packet && held.role === role); this.#frames.set(role,held.joinedId);
      let objectId = held.joinedId; let args: ({ objectId: string } | { value: string })[];
      if (role === "localIngress") { const tuple=decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send({phase:"forward-copy-local-key-frame",role:"source",method:"Debugger.evaluateOnCallFrame",params:{...CURRENT_PROJECT_SAVE_PRODUCER_FRAME_FLAGS,callFrameId:held.callFrameId,expression:"[Qe,cg]"}}),2);const fields=decodeCurrentFootprintCopyClockRpcV2Array(await this.#send({phase:"forward-copy-local-key-properties",role:"tuple",method:"Runtime.getProperties",params:{objectId:tuple,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}),2);for(const[index,profile]of KEY_CALLEES.entries()){const name=profile.name;if(name!=="Qe"&&name!=="cg"){throw new Error("VIA_LOCAL_KEY_PROFILE");}decodeCurrentGeneratedSyncCallee(await this.#send({phase:"forward-copy-local-key-properties",role:name,method:"Runtime.getProperties",params:{objectId:currentFootprintCopyClockRpcV2ArrayObject(fields,index),ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}),profile,this.#binding.scriptId);}args = [{ objectId: this.#binding.bodyObject }]; }
      else if (role === "headEntry") { need(held.cache?.role === "localUpload" && held.key !== null && new RegExp(`^https://client/upload/${this.#binding.branchUuid}\\?key=[a-f0-9]{16}$`,"u").test(held.key)); this.#cache = held.cache.joinedId; objectId = this.#cache; args = [{ value: held.key },{ value: this.#binding.body }]; }
      else if (role === "headPromise") { need(this.#cache !== null && held.promise !== null); this.#putPromise = held.promise.objectId; args = [{ objectId: this.#cache }]; }
      else if (role === "headSuccess") { need(this.#cache !== null); args = [{ objectId: this.#cache },{ objectId: this.#frame("headPromise") }]; }
      else if (role === "bufferIngress") { need(this.#cache !== null); args = [{ objectId: this.#frame("localIngress") },{ objectId: this.#binding.bodyObject },{ objectId: this.#cache }]; }
      else if (role === "bufferScheduled") { need(this.#cache !== null && held.bufferPromise !== null); this.#bufferPromise = held.bufferPromise; args = [{ objectId: this.#frame("bufferIngress") },{ objectId: this.#binding.bodyObject },{ objectId: this.#cache }]; }
      else { args = [{ objectId: this.#frame("localIngress") },{ objectId: this.#binding.bodyObject },{ objectId: this.#frame("bufferScheduled") }]; }
      yes.parse(await this.#send(validateCurrentFootprintForwardWriterCopyLocalCommand({ phase: "forward-copy-local-proof", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: PROGRAMS[role], arguments: args } })));
      await this.#current(); need(this.#binding.requireHeld(packet) === held); this.#requests += 1; need(this.#requests <= REQUESTS.cdpRequests - REQUESTS.capture);
      await this.#binding.resume(held,validateCurrentFootprintForwardWriterCopyLocalCommand({ phase:"forward-copy-local-resume",role,method:"Debugger.resume",params:{} })); await this.#current(); this.#step += 1;
      if (this.#step === ROLES.length) { need(this.#putPromise !== null && this.#bufferPromise !== null);
        for (const [kind,promise,state] of [["cache",this.#putPromise,"fulfilled"],["buffer",this.#bufferPromise,"pending"]] as const) { need(decodeCurrentProjectSaveProducerCachePromise(await this.#send({ phase:"forward-copy-local-properties",role:kind,method:"Runtime.getProperties",params:{objectId:promise,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false} })) === state); } this.#completed = true; }
    } catch (error) { if (!this.#failed) { this.#failed = true; this.#binding.fail(); } throw error; } finally { this.#busy = false; }
  }
  public originalCompleted(): CurrentFootprintForwardWriterCopyLocalCompleted { this.requireCompleted();need(this.#cache!==null&&this.#putPromise!==null&&this.#bufferPromise!==null);this.#completedReference??=Object.freeze({scheduledFrame:this.#frame("bufferScheduled"),bodyFrame:this.#binding.bodyObject,cacheFrame:this.#cache,putPromise:this.#putPromise,bufferPromise:this.#bufferPromise});return this.#completedReference; }
  public requireCompleted(): void { need(!this.#busy && !this.#failed && this.#completed); }
  public progress(): Readonly<{ acknowledgedResumes: number; requests: number; busy: boolean; completed: boolean; failed: boolean }> {
    return Object.freeze({ acknowledgedResumes: this.#step, requests: this.#requests, busy: this.#busy, completed: this.#completed, failed: this.#failed });
  }
}

Object.freeze(CurrentFootprintForwardWriterCopyLocalCursor.prototype);
Object.freeze(CurrentFootprintForwardWriterCopyLocalCursor);
