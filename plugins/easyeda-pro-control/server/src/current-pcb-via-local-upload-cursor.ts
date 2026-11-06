/** Fixed local Save continuation. Completion means only the accepted local
 * put and buffered callback scheduling, never upload/history/drain or Save. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentProjectSaveProducerCachePromise } from "./current-project-save-producer-cache-replies.ts";
import { CURRENT_PCB_VIA_LOCAL_UPLOAD_FLAGS as FLAGS, CURRENT_PCB_VIA_LOCAL_UPLOAD_REQUESTS as REQUESTS, CURRENT_PCB_VIA_LOCAL_UPLOAD_ROLES as ROLES, validateCurrentPcbViaLocalUploadCommand } from "./current-pcb-via-local-upload-protocol.ts";
import type { CurrentPcbViaLocalUploadCommand, CurrentPcbViaLocalUploadRole } from "./current-pcb-via-local-upload-protocol.ts";
import { CURRENT_PCB_VIA_LOCAL_UPLOAD_PROGRAMS as PROGRAMS } from "./current-pcb-via-local-upload-programs.ts";

export interface CurrentPcbViaLocalUploadHeld { readonly packet: object; readonly role: CurrentPcbViaLocalUploadRole; readonly joinedId: string; readonly key: string | null; readonly cache: Readonly<{ role: string; joinedId: string }> | null; readonly promise: Readonly<{ objectId: string }> | null; readonly bufferPromise: string | null }
export interface CurrentPcbViaLocalUploadBindings { readonly body: string; readonly bodyObject: string; readonly branchUuid: string; readonly assertCurrent: () => Promise<void>; readonly requireHeld: (packet: object) => CurrentPcbViaLocalUploadHeld; readonly request: (command: CurrentPcbViaLocalUploadCommand) => Promise<unknown>; readonly resume: (held: CurrentPcbViaLocalUploadHeld, command: CurrentPcbViaLocalUploadCommand) => Promise<void>; readonly fail: () => void }
const yes = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
function need(value: boolean): asserts value { if (!value) { throw new Error("PCB_VIA_LOCAL_ORIGINAL"); } }
export class CurrentPcbViaLocalUploadCursor {
  readonly #binding: CurrentPcbViaLocalUploadBindings; readonly #attempts = new WeakSet<object>(); readonly #frames = new Map<CurrentPcbViaLocalUploadRole,string>();
  #step = 0; #requests = 0; #busy = false; #failed = false; #completed = false; #cache: string | null = null; #putPromise: string | null = null; #bufferPromise: string | null = null;
  public constructor(bindings: CurrentPcbViaLocalUploadBindings) { this.#binding = bindings; Object.freeze(this); }
  async #current(): Promise<void> { need(!this.#failed); await this.#binding.assertCurrent(); need(!this.#failed); }
  async #send(command: CurrentPcbViaLocalUploadCommand): Promise<unknown> { const fixed = validateCurrentPcbViaLocalUploadCommand(command); await this.#current(); this.#requests += 1; need(this.#requests <= REQUESTS.cdpRequests); const value = captureCurrentPcbStringClockReply(await this.#binding.request(fixed)).value; await this.#current(); return value; }
  #frame(role: CurrentPcbViaLocalUploadRole): string { const value = this.#frames.get(role); need(value !== undefined); return value; }
  public async continue(packet: object): Promise<void> {
    need(!this.#busy && !this.#failed && !this.#completed && !this.#attempts.has(packet)); this.#attempts.add(packet); this.#busy = true;
    try { await this.#current(); const held = this.#binding.requireHeld(packet), role = ROLES[this.#step]; need(role !== undefined && held.packet === packet && held.role === role); this.#frames.set(role,held.joinedId);
      let objectId = held.joinedId; let args: ({ objectId: string } | { value: string })[];
      if (role === "localIngress") { args = [{ objectId: this.#binding.bodyObject }]; }
      else if (role === "headEntry") { need(held.cache?.role === "localUpload" && held.key !== null && new RegExp(`^https://client/upload/${this.#binding.branchUuid}\\?key=[a-f0-9]{32}$`,"u").test(held.key)); this.#cache = held.cache.joinedId; objectId = this.#cache; args = [{ value: held.key },{ value: this.#binding.body }]; }
      else if (role === "headPromise") { need(this.#cache !== null && held.promise !== null); this.#putPromise = held.promise.objectId; args = [{ objectId: this.#cache }]; }
      else if (role === "headSuccess") { need(this.#cache !== null); args = [{ objectId: this.#cache },{ objectId: this.#frame("headPromise") }]; }
      else if (role === "bufferIngress") { need(this.#cache !== null); args = [{ objectId: this.#frame("localIngress") },{ objectId: this.#binding.bodyObject },{ objectId: this.#cache }]; }
      else if (role === "bufferScheduled") { need(this.#cache !== null && held.bufferPromise !== null); this.#bufferPromise = held.bufferPromise; args = [{ objectId: this.#frame("bufferIngress") },{ objectId: this.#binding.bodyObject },{ objectId: this.#cache }]; }
      else { args = [{ objectId: this.#frame("localIngress") },{ objectId: this.#binding.bodyObject },{ objectId: this.#frame("bufferScheduled") }]; }
      yes.parse(await this.#send(validateCurrentPcbViaLocalUploadCommand({ phase: "via-local-proof", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: PROGRAMS[role], arguments: args } })));
      await this.#current(); need(this.#binding.requireHeld(packet) === held); this.#requests += 1; need(this.#requests <= REQUESTS.cdpRequests);
      await this.#binding.resume(held,validateCurrentPcbViaLocalUploadCommand({ phase:"via-local-resume",role,method:"Debugger.resume",params:{} })); await this.#current(); this.#step += 1;
      if (this.#step === ROLES.length) { need(this.#putPromise !== null && this.#bufferPromise !== null);
        for (const [kind,promise,state] of [["cache",this.#putPromise,"fulfilled"],["buffer",this.#bufferPromise,"pending"]] as const) { need(decodeCurrentProjectSaveProducerCachePromise(await this.#send({ phase:"via-local-properties",role:kind,method:"Runtime.getProperties",params:{objectId:promise,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false} })) === state); } this.#completed = true; }
    } catch (error) { if (!this.#failed) { this.#failed = true; this.#binding.fail(); } throw error; } finally { this.#busy = false; }
  }
  public requireCompleted(): void { need(!this.#busy && !this.#failed && this.#completed); }
}
