/** Concurrent source observations under separate original UI/worker lanes.
 * They do not resume a body or issue the owner's private forwarded Job. */
import { CURRENT_FOOTPRINT_INVERSE_DELETE_UI_RUN_EXPRESSIONS as UI } from "./current-footprint-inverse-delete-ui-run-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_COLLATERAL_RUN_EXPRESSIONS as RETURNS } from "./current-footprint-inverse-delete-collateral-run-programs.ts";
import { currentFootprintInverseDeleteCollateralRunPause as uiPause } from "./current-footprint-inverse-delete-collateral-run-replies.ts";
import type { CurrentFootprintInverseDeleteCollateralRunRole as UiRole } from "./current-footprint-inverse-delete-collateral-run-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_FORCE_EXPRESSIONS as FORCE } from "./current-footprint-inverse-delete-force-programs.ts";
import { currentFootprintInverseDeleteForcePause as forcePause } from "./current-footprint-inverse-delete-force-replies.ts";
import type { CurrentFootprintInverseDeleteForceRole as ForceRole } from "./current-footprint-inverse-delete-force-replies.ts";
import type { CurrentFootprintInverseDeleteForwardIo as Io } from "./current-footprint-inverse-delete-forward-io.ts";
import type { CurrentFootprintInverseDeleteForwardPrepared as Prepared } from "./current-footprint-inverse-delete-forward-collector.ts";
import { requireCurrentFootprintInversePublicServiceTrue as truth } from "./current-footprint-inverse-public-service-replies.ts";

interface Bindings { readonly io: Io; readonly prepared: Prepared; readonly sessionId: string; readonly scripts: Readonly<{ ui: string; manager: string }>; readonly nativeMembers: string; readonly managerModule: string }
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_DELETE_CONCURRENT_SOURCE"); } }
/** A single attempt retains every consumed event object and original Promise.
 * Source order is partial: the force body can run before dropped Ja returns. */
export class CurrentFootprintInverseDeleteConcurrentCollector {
  readonly #b: Bindings; readonly #io: Io; readonly #events = new WeakSet<object>(); readonly #ui = new Set<UiRole>(); readonly #force = new Set<ForceRole>(); readonly #uiAttempted = new Set<UiRole>(); readonly #forceAttempted = new Set<ForceRole>(); readonly #promises = new Map<string, string>(); #ja: string | null = null; #forceBodyPromise: string | null = null; #forcePromise: string | null = null; #forceResult: string | null = null; #failed = false; #pending = false;
  public constructor(b: Bindings) { this.#b = b; this.#io = b.io.withCurrent((): void => { need(!this.#failed); }); }
  #current(): void { this.#b.io.current(); need(!this.#failed); }
  #event(event: unknown): void { this.#current(); need(event !== null && typeof event === "object" && !this.#events.has(event)); this.#events.add(event); }
  #begin(): void { this.#current(); if (this.#pending) { this.#failed = true; throw new Error("INVERSE_DELETE_CONCURRENT_PENDING"); } this.#pending = true; }
  /** Consume one actual Ja/P4/yy entry or return under the source partial
   * order, retaining its original Promise. Attempts burn before any await. */
  public async ui(role: UiRole, event: unknown, breakpointId: string): Promise<void> {
    this.#begin(); try { need(!this.#uiAttempted.has(role)); this.#uiAttempted.add(role); this.#event(event); const b = this.#b, held = uiPause(event, role, b.sessionId, b.scripts.ui, breakpointId), io = this.#io, state = b.prepared.ui;
      if (role === "ja") { need(this.#ui.size === 0); const f = await io.frame("tail-ja", held.frame, UI.ja, 7); const tuple = await io.tuple("tail-ja", [f.id, state.module, state.proof], 3); this.#ja = tuple.id; }
      else if (role === "p4") { need(this.#ui.has("ja") && this.#ja !== null); const f = await io.frame("tail-p4", held.frame, UI.p4, 7); truth(await io.call("tail-p4", [f.id, state.module, this.#ja])); }
      else if (role === "yy") { need(this.#ui.has("p4Returned")); const f = await io.frame("tail-yy", held.frame, UI.yy, 5); truth(await io.call("tail-yy", [f.id, state.module, state.proof])); }
      else { need(held.returnPromise !== null); if (role === "p4Returned") { need(this.#ui.has("p4") && this.#ja !== null); const f = await io.frame("tail-p4Returned", held.frame, RETURNS.p4, 6); truth(await io.call("tail-p4Returned", [f.id, state.module, this.#ja])); }
        else if (role === "yyReturned") { need(this.#ui.has("yy")); const f = await io.frame("tail-yyReturned", held.frame, RETURNS.yyReturned, 3); truth(await io.call("tail-yyReturned", [f.id, state.module, state.proof])); }
        else { need(this.#ui.has("p4Returned") && this.#ui.has("yyReturned") && this.#ja !== null); const f = await io.frame("tail-jaReturned", held.frame, RETURNS.jaReturned, 3); truth(await io.call("tail-jaReturned", [f.id, this.#ja])); }
        const promise = await io.retainPromise(held.returnPromise, b.nativeMembers, "fulfilled"); this.#promises.set(role, promise);
      } this.#current(); this.#ui.add(role);
    } catch (error) { this.#failed = true; throw error; } finally { this.#pending = false; }
  }
  /** Observe one original force/history boundary after its causal inputs.
   * Duplicate or concurrent attempts fail permanently before another read. */
  public async force(role: ForceRole, event: unknown, breakpointId: string): Promise<void> {
    this.#begin(); try { need(!this.#forceAttempted.has(role)); this.#forceAttempted.add(role); this.#event(event); const b = this.#b, held = forcePause(event, role, b.sessionId, b.scripts, breakpointId), io = this.#io, state = b.prepared.force;
      if (role === "rpc") { need(this.#ui.has("yyReturned") && held.caller !== null); const f = await io.frame("force-rpc", held.frame, FORCE.rpc, 5); const c = await io.frame("force-caller", held.caller, FORCE.caller, 1); truth(await io.call("force-rpc", [f.id, state.roots, c.id])); }
      else if (role === "publish") { need(this.#force.has("rpc")); const f = await io.frame("force-history", held.frame, FORCE.history, 6); truth(await io.call("force-publish", [f.id, state.roots])); }
      else if (role === "callback") { need(this.#force.has("publish")); const f = await io.frame("force-callback", held.frame, FORCE.callback, 5); truth(await io.call("force-callback", [f.id, state.roots, state.handler])); }
      else if (role === "wrapper") { need(this.#force.has("callback")); const f = await io.frame("force-wrapper", held.frame, FORCE.wrapper, 3); truth(await io.call("force-wrapper", [f.id, state.body, b.managerModule])); }
      else if (role === "body") { need(this.#force.has("wrapper")); const f = await io.frame("force-body", held.frame, FORCE.body, 1); truth(await io.call("force-bodyEntry", [f.id, state.body])); need(held.promise !== null); this.#forceBodyPromise = await io.retainPromise(held.promise, b.nativeMembers, "fulfilled"); }
      else if (role === "returned") { need(this.#force.has("body") && held.promise !== null); this.#forcePromise = await io.retainPromise(held.promise, b.nativeMembers, "pending"); }
      else { need(this.#force.has("returned") && this.#ui.has("jaReturned") && this.#forcePromise !== null && held.caller !== null); if (role === "history-pcb") { need(this.#forceResult === null); const result = await io.forceResult(this.#forcePromise, b.nativeMembers); truth(await io.call("force-result", [result, state.roots])); this.#forceResult = result; } else { need(this.#forceResult !== null && this.#force.has(role === "history-sch" ? "history-pcb" : "history-sch")); }
        const f = await io.frame("force-history", held.frame, FORCE.history, 6); const c = await io.frame("force-caller", held.caller, FORCE.caller, 1); truth(await io.call(role, [f.id, state.roots, c.id]));
      } this.#current(); this.#force.add(role);
    } catch (error) { this.#failed = true; throw error; } finally { this.#pending = false; }
  }
  /** Report observed facts separately from a worker result, runtime Job, toast,
   * Save, Main/producer completion and SQL. This does not authorize a resume. */
  public observations(): Readonly<{ droppedPromisesRetained: number; originalForceBodyPromiseRetained: boolean; originalForcePromiseRetained: boolean; originalForceResultObserved: boolean; historyCallsObserved: number; runtimeJobIssued: false; workerDeleteCompleted: false; uiNotificationCompleted: false; dispatchAuthorized: false }> { this.#current(); return Object.freeze({ droppedPromisesRetained: this.#promises.size, originalForceBodyPromiseRetained: this.#forceBodyPromise !== null, originalForcePromiseRetained: this.#forcePromise !== null, originalForceResultObserved: this.#forceResult !== null, historyCallsObserved: Number(this.#force.has("history-pcb")) + Number(this.#force.has("history-sch")) + Number(this.#force.has("history-bottom")), runtimeJobIssued: false, workerDeleteCompleted: false, uiNotificationCompleted: false, dispatchAuthorized: false }); }
}
