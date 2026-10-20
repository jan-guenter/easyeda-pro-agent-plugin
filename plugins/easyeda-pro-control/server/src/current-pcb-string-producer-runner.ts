/** Dormant fixed 34-command producer observation. No public route, native
 * dispatch registration, writer authority or new process/target attachment.
 * PCB and worker handles belong to separate original sessions. One private
 * group name is released separately in both sessions, including partial failure.
 */
import { types } from "node:util";
import { canonicalJson } from "./core.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION, CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION } from "./current-pcb-diagnostic-model-program.ts";
import { decodeCurrentPcbDiagnosticModelFunction, decodeCurrentPcbDiagnosticModelScope,
  decodeCurrentPcbDiagnosticModelScopeList } from "./current-pcb-diagnostic-model-scope.ts";
import { observeCurrentPcbStringProducerClosures } from "./current-pcb-string-producer-observation.ts";
import { CURRENT_PCB_STRING_COOPERATION_SELECTOR, CURRENT_PCB_STRING_COOPERATION_STATE,
  CURRENT_PCB_STRING_DEBOUNCE_SELECTOR, CURRENT_PCB_STRING_DEBOUNCE_STATE, CURRENT_PCB_STRING_MOVE_SELECTOR,
  CURRENT_PCB_STRING_MOVE_STATE, CURRENT_PCB_STRING_STRUCTURE_SELECTOR, CURRENT_PCB_STRING_STRUCTURE_STATE,
  CURRENT_PCB_STRING_UPLOAD_SELECTOR, CURRENT_PCB_STRING_UPLOAD_STATE, CURRENT_PCB_STRING_UPLOAD_STRUCTURE_SELECTOR,
  CURRENT_PCB_STRING_UPLOAD_STRUCTURE_STATE, decodeCurrentPcbStringCooperationClosure, decodeCurrentPcbStringDebounceClosure,
  decodeCurrentPcbStringMoveClosure, decodeCurrentPcbStringSerialClosure, decodeCurrentPcbStringUploadClosure } from "./current-pcb-string-producer-program.ts";
import { decodeCurrentPcbStringProducerFunction, decodeCurrentPcbStringProducerScopeList,
  decodeCurrentPcbStringProducerScopes } from "./current-pcb-string-producer-scope.ts";
import type { CurrentPcbStringProducerKind } from "./current-pcb-string-producer-scope.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_STRING_PRODUCER_OBJECT_GROUP = "easyeda-pro-control-string-producers-v1";
export const CURRENT_PCB_STRING_PRODUCER_COMMANDS = 34;
type Side = "pcb" | "worker";
const EVALUATIONS = Object.freeze({ wrapper: CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION,
  "upload-structure-select": CURRENT_PCB_STRING_UPLOAD_STRUCTURE_SELECTOR, "structure-select": CURRENT_PCB_STRING_STRUCTURE_SELECTOR,
  "cooperation-select": CURRENT_PCB_STRING_COOPERATION_SELECTOR, "upload-select": CURRENT_PCB_STRING_UPLOAD_SELECTOR });
const CALLS = Object.freeze({ handler: CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION,
  "move-select": CURRENT_PCB_STRING_MOVE_SELECTOR, move: CURRENT_PCB_STRING_MOVE_STATE,
  "upload-structure": CURRENT_PCB_STRING_UPLOAD_STRUCTURE_STATE, structure: CURRENT_PCB_STRING_STRUCTURE_STATE,
  "debounce-select": CURRENT_PCB_STRING_DEBOUNCE_SELECTOR, debounce: CURRENT_PCB_STRING_DEBOUNCE_STATE,
  cooperation: CURRENT_PCB_STRING_COOPERATION_STATE, upload: CURRENT_PCB_STRING_UPLOAD_STATE });
const EFFECTS = Object.freeze({ throwOnSideEffect: true, silent: true, awaitPromise: false,
  generatePreview: false, userGesture: false } as const);
type Effects = typeof EFFECTS;
export type CurrentPcbStringProducerCommand = Readonly<{ side: Side; sessionId: string }> & (
  | Readonly<{ phase: keyof typeof EVALUATIONS; method: "Runtime.evaluate"; params: Effects & Readonly<{
    expression: string; uniqueContextId: string; returnByValue: false; timeout: 1000;
    objectGroup: typeof CURRENT_PCB_STRING_PRODUCER_OBJECT_GROUP; includeCommandLineAPI: false; allowUnsafeEvalBlockedByCSP: false;
  }> }>
  | Readonly<{ phase: keyof typeof CALLS; method: "Runtime.callFunctionOn"; params: Effects & Readonly<{
    objectId: string; functionDeclaration: string; returnByValue: boolean; arguments: readonly Readonly<{ objectId: string }>[];
  }> }>
  | Readonly<{ phase: "properties"; method: "Runtime.getProperties"; params: Readonly<{
    objectId: string; ownProperties: true; accessorPropertiesOnly: false; generatePreview: false;
  }> }>
  | Readonly<{ phase: "release"; method: "Runtime.releaseObjectGroup"; params: Readonly<{
    objectGroup: typeof CURRENT_PCB_STRING_PRODUCER_OBJECT_GROUP;
  }> }>
);
export interface CurrentPcbStringProducerTransport {
  /** Private owner adapter only. A future native implementation must reconstruct
   * each fixed program from phase, not accept its string as caller code. */
  readonly request: (command: CurrentPcbStringProducerCommand) => Promise<unknown>;
  /** Rechecks both original source/frame/worker/pipe/context owners every time.
   * No target discovery, navigation or reattachment may be hidden here. */
  readonly assertCurrent: () => void;
}
interface SourceOwner { readonly sessionId: string; readonly scriptId: string; readonly uniqueContextId: string }
interface Target { readonly projectUuid: string; readonly branchUuid: string; readonly documentUuid: string; readonly windowTabId: string }
function refuse(): never { throw new Error("PCB_STRING_PRODUCER_OBSERVATION"); }
function handle(value: string): string { if (!/^[A-Za-z\d_.:-]{1,256}$/u.test(value)) { return refuse(); } return value; }
function owner(value: SourceOwner): SourceOwner {
  return Object.freeze({ sessionId: handle(value.sessionId), scriptId: handle(value.scriptId), uniqueContextId: handle(value.uniqueContextId) });
}
function empty(value: unknown): void {
  if (value === null || typeof value !== "object" || types.isProxy(value) || Array.isArray(value) ||
      Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null || Reflect.ownKeys(value).length > 0) { refuse(); }
}

export class CurrentPcbStringProducerRunner {
  readonly #transport: CurrentPcbStringProducerTransport;
  readonly #owners: Readonly<Record<Side, SourceOwner>>;
  readonly #target: Target;
  readonly #started = new Set<Side>();
  #consumed = false;
  #requests = 0;
  #phase = "owner";
  public constructor(transport: CurrentPcbStringProducerTransport, pcb: SourceOwner, worker: SourceOwner, target: Target) {
    this.#transport = Object.freeze({ request: transport.request, assertCurrent: transport.assertCurrent });
    this.#owners = Object.freeze({ pcb: owner(pcb), worker: owner(worker) });
    if (pcb.sessionId === worker.sessionId || pcb.uniqueContextId === worker.uniqueContextId ||
        !/^(?:[a-f\d]{32}|[a-f\d]{64})$/u.test(target.projectUuid) || !/^[a-f\d]{32}$/u.test(target.branchUuid) ||
        !/^(?:[a-f\d]{16}|[a-f\d]{32})$/u.test(target.documentUuid) || !/^[A-Za-z\d_-]{1,128}$/u.test(target.windowTabId)) { refuse(); }
    this.#target = Object.freeze({ projectUuid: target.projectUuid, branchUuid: target.branchUuid,
      documentUuid: target.documentUuid, windowTabId: target.windowTabId });
  }
  async #request(command: CurrentPcbStringProducerCommand): Promise<unknown> {
    this.#phase = `${command.side}:${command.phase}`;
    this.#transport.assertCurrent();
    this.#requests += 1;
    if (this.#requests > CURRENT_PCB_STRING_PRODUCER_COMMANDS - 2) { return refuse(); }
    this.#started.add(command.side);
    const reply = await this.#transport.request(freezeDeep(command));
    this.#transport.assertCurrent(); return reply;
  }
  #evaluate(side: Side, phase: keyof typeof EVALUATIONS): Promise<unknown> {
    const selected = this.#owners[side];
    return this.#request({ side, sessionId: selected.sessionId, phase, method: "Runtime.evaluate", params: {
      ...EFFECTS, expression: EVALUATIONS[phase], uniqueContextId: selected.uniqueContextId, returnByValue: false, timeout: 1000,
      objectGroup: CURRENT_PCB_STRING_PRODUCER_OBJECT_GROUP, includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false } });
  }
  #call(side: Side, phase: keyof typeof CALLS, objectId: string, args: readonly string[] = []): Promise<unknown> {
    return this.#request({ side, sessionId: this.#owners[side].sessionId, phase, method: "Runtime.callFunctionOn", params: {
      ...EFFECTS, objectId: handle(objectId), functionDeclaration: CALLS[phase],
      returnByValue: phase !== "handler" && phase !== "move-select" && phase !== "debounce-select",
      arguments: args.map(value => ({ objectId: handle(value) })) } });
  }
  #properties(side: Side, objectId: string): Promise<unknown> {
    return this.#request({ side, sessionId: this.#owners[side].sessionId, phase: "properties", method: "Runtime.getProperties",
      params: { objectId: handle(objectId), ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  }
  async #scopes(side: Side, original: string, kind: CurrentPcbStringProducerKind): Promise<readonly string[]> {
    const list = decodeCurrentPcbStringProducerScopeList(await this.#properties(side, original), this.#owners[side].scriptId, kind);
    return decodeCurrentPcbStringProducerScopes(await this.#properties(side, list), kind);
  }
  #identity(value: Readonly<{ projectUuid: string; branchUuid: string; windowTabId: string }>): void {
    if (value.projectUuid !== this.#target.projectUuid || value.branchUuid !== this.#target.branchUuid ||
        value.windowTabId !== this.#target.windowTabId) { refuse(); }
  }
  async #worker(select: "upload-structure-select" | "structure-select" | "cooperation-select" | "upload-select",
    read: "upload-structure" | "structure" | "cooperation" | "upload", kind: CurrentPcbStringProducerKind):
  Promise<Readonly<{ original: string; reply: unknown }>> {
    const original = decodeCurrentPcbStringProducerFunction(await this.#evaluate("worker", select), kind);
    const scopes = await this.#scopes("worker", original, kind);
    const scope = scopes[0] ?? refuse();
    const reply = await this.#call("worker", read, scope, [original]);
    if (read === "structure" || read === "upload-structure") {
      const state = decodeCurrentPcbStringSerialClosure(reply);
      if (state.kind !== (read === "structure" ? "structure" : "uploadStructure")) { return refuse(); }
      this.#identity(state.identity);
    } else if (read === "cooperation") { this.#identity(decodeCurrentPcbStringCooperationClosure(reply).identity); }
    else { this.#identity(decodeCurrentPcbStringUploadClosure(reply).identity); }
    return { original, reply };
  }
  public async observe(): Promise<ReturnType<typeof observeCurrentPcbStringProducerClosures>> {
    if (this.#consumed) { return refuse(); } this.#consumed = true;
    const failures: unknown[] = [];
    let result: ReturnType<typeof observeCurrentPcbStringProducerClosures> | undefined;
    try {
      const wrapper = decodeCurrentPcbDiagnosticModelFunction(await this.#evaluate("pcb", "wrapper"), "rpc-wrapper");
      const wrapperList = decodeCurrentPcbDiagnosticModelScopeList(await this.#properties("pcb", wrapper), this.#owners.pcb.scriptId, "rpc-wrapper");
      const wrapperScope = decodeCurrentPcbDiagnosticModelScope(await this.#properties("pcb", wrapperList), "rpc-wrapper");
      const handler = decodeCurrentPcbDiagnosticModelFunction(await this.#call("pcb", "handler", wrapperScope), "save-handler");
      const handlerList = decodeCurrentPcbDiagnosticModelScopeList(await this.#properties("pcb", handler), this.#owners.pcb.scriptId, "save-handler");
      const handlerScope = decodeCurrentPcbDiagnosticModelScope(await this.#properties("pcb", handlerList), "save-handler");
      const move = decodeCurrentPcbStringProducerFunction(await this.#call("pcb", "move-select", handlerScope, [wrapper]), "move");
      const moveScopes = await this.#scopes("pcb", move, "move");
      const moveReply = await this.#call("pcb", "move", moveScopes[0] ?? refuse(), [move, handlerScope, wrapper]);
      if (decodeCurrentPcbStringMoveClosure(moveReply).documentUuid !== this.#target.documentUuid) { return refuse(); }
      const uploadStructure = await this.#worker("upload-structure-select", "upload-structure", "serial");
      const structure = await this.#worker("structure-select", "structure", "serial");
      // Reacquire mutable serial bindings instead of reusing the preceding
      // Sample's V8 wrapper. QA's two selected scopes are freshly obtained too.
      const serialScopes = await this.#scopes("worker", structure.original, "serial");
      const serialScope = serialScopes[0] ?? refuse();
      const debounce = decodeCurrentPcbStringProducerFunction(await this.#call("worker", "debounce-select", serialScope, [structure.original]), "debounce");
      const debounceScopes = await this.#scopes("worker", debounce, "debounce");
      const debounceReply = await this.#call("worker", "debounce", debounceScopes[0] ?? refuse(),
        [debounceScopes[1] ?? refuse(), serialScope, structure.original, debounce]);
      this.#identity(decodeCurrentPcbStringDebounceClosure(debounceReply).identity);
      const cooperation = await this.#worker("cooperation-select", "cooperation", "cooperation");
      const upload = await this.#worker("upload-select", "upload", "upload");
      this.#phase = "identity";
      const observed = observeCurrentPcbStringProducerClosures(moveReply, uploadStructure.reply, structure.reply,
        debounceReply, cooperation.reply, upload.reply);
      const identity = observed.uploadStructure.identity;
      if (observed.move.documentUuid !== this.#target.documentUuid || identity.projectUuid !== this.#target.projectUuid ||
          identity.branchUuid !== this.#target.branchUuid || identity.windowTabId !== this.#target.windowTabId) { return refuse(); }
      this.#phase = "bounds";
      if (this.#requests !== CURRENT_PCB_STRING_PRODUCER_COMMANDS - 2 || Buffer.byteLength(canonicalJson(observed)) > 131_072) { return refuse(); }
      result = observed;
    } catch (caughtError) { failures.push(caughtError); }
    let phase = this.#phase;
    // Same group name does not cross session boundaries. Always attempt both
    // Owned releases after partial failure, without navigation or a new pipe.
    for (const side of ["pcb", "worker"] as const) {
      if (this.#started.has(side)) {
        try { empty(await this.#transport.request(freezeDeep({ side, sessionId: this.#owners[side].sessionId,
          phase: "release", method: "Runtime.releaseObjectGroup", params: { objectGroup: CURRENT_PCB_STRING_PRODUCER_OBJECT_GROUP } }))); }
        catch (caughtError) { if (failures.length === 0) { phase = `${side}:release`; } failures.push(caughtError); }
      }
    }
    if (this.#started.size > 0) {
      try { this.#transport.assertCurrent(); }
      catch (caughtError) { if (failures.length === 0) { phase = "owner-final"; } failures.push(caughtError); }
    }
    if (failures.length > 0) { throw new AggregateError(failures, `PCB_STRING_PRODUCER_OBSERVATION:${phase}`); }
    if (result === undefined) { return refuse(); } return result;
  }
}
