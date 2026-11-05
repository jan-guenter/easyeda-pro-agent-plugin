/** Original same-writer main admission. Only the settled managed opening can
 * issue this private reference; source hashes and a native purpose are not a
 * request, completion, paired-clock or whole-writer qualification by themselves. */
import { types } from "node:util";
// oxlint-disable-next-line import/no-cycle -- The genuine factory and capability resolve each other's private registries only after native birth; no authority is issued during initialization.
import { assertOriginalCurrentFootprintForwardExecutionNativeOwner } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentFootprintForwardExecutionNativeOwner } from "./current-pcb-diagnostic-owner.ts";
// oxlint-disable-next-line import/no-cycle -- The original main engine calls this issuer after construction; an injectable callback table would lose original-owner authority.
import { captureOriginalCurrentFootprintForwardMainCursor, requireCurrentFootprintForwardMainCursor, requireOriginalCurrentFootprintForwardMainRunner } from "./current-footprint-copy-main-backend-runner.ts";
import type { CurrentFootprintCopyMainBackendRunner } from "./current-footprint-copy-main-backend-runner.ts";
import type { CurrentFootprintForwardExecutionOpeningProvider } from "./current-footprint-forward-execution-opening.ts";
import type { CurrentFootprintForwardMainCursor } from "./current-footprint-forward-main-cursor.ts";
import type { CurrentFootprintCopyMainRequestCollectCommand } from "./current-footprint-copy-main-request-protocol.ts";
import type { CurrentFootprintCopyMainCompletionCommand } from "./current-footprint-copy-main-completion-protocol.ts";

export interface CurrentFootprintForwardExecutionMainCapability {
  readonly profile: "private.current-footprint-forward-execution-main-capability.v2";
  readonly executionAuthorized: false;
}
export type CurrentFootprintForwardExecutionMainMode = "normal" | "cleanup" | "exited";
type Input = Awaited<ReturnType<CurrentFootprintForwardExecutionOpeningProvider["requireSourceInput"]>>;
interface Retained {
  readonly provider: CurrentFootprintForwardExecutionOpeningProvider;
  readonly input: Input;
  readonly owner: CurrentFootprintForwardExecutionNativeOwner;
  readonly runner: CurrentFootprintCopyMainBackendRunner;
  readonly cursor: CurrentFootprintForwardMainCursor;
}
const capabilities = new WeakMap<object, Retained>();
const attempted = new WeakSet<object>();
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`FORWARD_EXECUTION_MAIN_${code}`); } }
function sameInput(expected: Input, actual: Input): void {
  const left = expected.source, right = actual.source;
  need(actual.result === expected.result && actual.owner === expected.owner && right.source === left.source &&
    right.opening === left.opening && right.result === left.result && right.preparation === left.preparation &&
    right.owned.before === left.owned.before && right.owned.copyPlan === left.owned.copyPlan &&
    right.owned.nativeArguments === left.owned.nativeArguments && right.owned.sourcePlan === left.owned.sourcePlan &&
    right.main === left.main && right.mainRetained === left.mainRetained && right.resources === left.resources && right.binding === left.binding,
  "ORIGINAL_PUBLISHED_INPUT");
}
function original(capability: CurrentFootprintForwardExecutionMainCapability, runner: CurrentFootprintCopyMainBackendRunner,
  mode: CurrentFootprintForwardExecutionMainMode): Retained {
  need(mode === "normal" || mode === "cleanup" || mode === "exited", "MODE");
  need(capability !== null && typeof capability === "object" && !types.isProxy(capability), "CAPABILITY");
  const held = capabilities.get(capability); need(held !== undefined && held.runner === runner, "CAPABILITY");
  assertOriginalCurrentFootprintForwardExecutionNativeOwner(held.owner); requireOriginalCurrentFootprintForwardMainRunner(runner);
  const source = held.owner.originalFootprintForwardExecutionSource();
  sameInput(held.input, { result: held.input.result, owner: held.owner, source });
  held.owner.requireOriginalForwardExecutionMainRunner(runner, mode);
  const cursor = requireCurrentFootprintForwardMainCursor(held.cursor, runner);
  if (mode === "normal") { need(cursor.phase !== "failed" && cursor.phase !== "released", "NORMAL_ENDED"); }
  return held;
}
/** Publish first, then join this exact original native main construction once.
 * A failed unpublished attempt issues nothing; no main request runs here. */
export async function issueCurrentFootprintForwardExecutionMainCapability(provider: CurrentFootprintForwardExecutionOpeningProvider): Promise<CurrentFootprintForwardExecutionMainCapability> {
  need(provider !== null && typeof provider === "object" && !types.isProxy(provider), "ORIGINAL_PROVIDER");
  const { requireCurrentFootprintForwardExecutionOpeningInput } = await import("./current-footprint-forward-execution-opening.ts");
  const input = await requireCurrentFootprintForwardExecutionOpeningInput(provider);
  need(!attempted.has(provider), "CAPABILITY_CONSUMED"); attempted.add(provider);
  const owner = input.owner, runner = input.source.main; need(runner !== null, "ORIGINAL_MAIN");
  assertOriginalCurrentFootprintForwardExecutionNativeOwner(owner); owner.requireOriginalForwardExecutionMainRunner(runner, "normal");
  const cursor = captureOriginalCurrentFootprintForwardMainCursor(runner), state = requireCurrentFootprintForwardMainCursor(cursor, runner);
  need(state.phase === "construction" && !state.busy && !state.incompleteFrame && !state.paused && state.pendingReplies === 0 && state.pendingEvents === 0,
    "ORIGINAL_CONSTRUCTION_CURSOR");
  sameInput(input, await requireCurrentFootprintForwardExecutionOpeningInput(provider));
  owner.requireOriginalForwardExecutionMainRunner(runner, "normal");
  const current = requireCurrentFootprintForwardMainCursor(cursor, runner);
  need(current.phase === "construction" && !current.busy && !current.incompleteFrame && !current.paused && current.pendingReplies === 0 && current.pendingEvents === 0,
    "ORIGINAL_CONSTRUCTION_CURSOR");
  const capability = Object.freeze({ profile: "private.current-footprint-forward-execution-main-capability.v2" as const, executionAuthorized: false as const });
  capabilities.set(capability, Object.freeze({ provider, input, owner, runner, cursor })); original(capability, runner, "normal"); return capability;
}
/** Resolve only this issuer's original native receiver. The owner calls this
 * before every fixed v2 send, never accepting a caller descriptor or callback. */
export function requireCurrentFootprintForwardExecutionMainNativeOwner(capability: CurrentFootprintForwardExecutionMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner, mode: CurrentFootprintForwardExecutionMainMode): CurrentFootprintForwardExecutionNativeOwner {
  return original(capability, runner, mode).owner;
}
export function isCurrentFootprintForwardExecutionMainCapability(value: unknown): value is CurrentFootprintForwardExecutionMainCapability {
  return value !== null && typeof value === "object" && !types.isProxy(value) && capabilities.has(value);
}
export function requireCurrentFootprintForwardExecutionMainCapability(capability: CurrentFootprintForwardExecutionMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner): void { original(capability, runner, "normal"); }
export function requireCurrentFootprintForwardExecutionMainCleanup(capability: CurrentFootprintForwardExecutionMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner): void { original(capability, runner, "cleanup"); }
export function currentFootprintForwardExecutionMainGenerationExited(capability: CurrentFootprintForwardExecutionMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner): boolean {
  const held = original(capability, runner, "exited"); return held.owner.requireOriginalForwardExecutionMainRunner(runner, "exited");
}
/** Fresh managed publication is rechecked across normal admission awaits.
 * Cleanup relies on retained original references and never revives this lane. */
export async function reproveCurrentFootprintForwardExecutionMainPublication(capability: CurrentFootprintForwardExecutionMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner): Promise<void> {
  const held = original(capability, runner, "normal");
  const { requireCurrentFootprintForwardExecutionOpeningInput } = await import("./current-footprint-forward-execution-opening.ts");
  original(capability, runner, "normal"); sameInput(held.input, await requireCurrentFootprintForwardExecutionOpeningInput(held.provider)); original(capability, runner, "normal");
}
export async function sendCurrentFootprintForwardExecutionMainCommand(capability: CurrentFootprintForwardExecutionMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner, command: CurrentFootprintCopyMainRequestCollectCommand, id: number): Promise<void> {
  const cleanup = command.phase === "request-remove" || command.phase === "request-resume" || command.phase === "request-release";
  const mode = cleanup ? "cleanup" : "normal";
  const held = original(capability, runner, mode); await held.owner.sendForwardExecutionMainCommand(capability, runner, command, id); original(capability, runner, mode);
}
/** Poll the same native main owner with its exact pending allocation receiver.
 * The owner retains raw bytes before accounting and post-reply guards; this
 * wrapper never decodes, substitutes or replays an inspector chunk. */
export async function pollCurrentFootprintForwardExecutionMain(capability: CurrentFootprintForwardExecutionMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner, cleanup: boolean, retainChunk?: (chunk: string) => void): Promise<string> {
  const mode = cleanup ? "cleanup" : "normal";
  const held = original(capability, runner, mode);
  const chunk = await held.owner.pollForwardExecutionMain(capability, runner, cleanup, retainChunk);
  original(capability, runner, mode); return chunk;
}
export function assertCurrentFootprintForwardExecutionMainCompletionCapacity(capability: CurrentFootprintForwardExecutionMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner, firstRequestId: number): void {
  original(capability, runner, "normal").owner.assertForwardExecutionMainCompletionCapacity(capability, runner, firstRequestId);
}
export async function beginCurrentFootprintForwardExecutionMainCompletion(capability: CurrentFootprintForwardExecutionMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner, firstRequestId: number): Promise<void> {
  const held = original(capability, runner, "normal"); await held.owner.beginForwardExecutionMainCompletion(capability, runner, firstRequestId); original(capability, runner, "normal");
}
export async function sendCurrentFootprintForwardExecutionMainCompletion(capability: CurrentFootprintForwardExecutionMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner, command: CurrentFootprintCopyMainCompletionCommand, id: number): Promise<void> {
  const cleanup = command.method === "Debugger.removeBreakpoint" || command.method === "Debugger.resume" || command.method === "Runtime.releaseObjectGroup";
  const mode = cleanup ? "cleanup" : "normal";
  const held = original(capability, runner, mode); await held.owner.sendForwardExecutionMainCompletion(capability, runner, command, id); original(capability, runner, mode);
}
export async function retireCurrentFootprintForwardExecutionMainCompletion(capability: CurrentFootprintForwardExecutionMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner): Promise<void> {
  const held = original(capability, runner, "cleanup"); await held.owner.retireForwardExecutionMainCompletion(capability, runner); original(capability, runner, "cleanup");
}
export function failCurrentFootprintForwardExecutionMainCompletion(capability: CurrentFootprintForwardExecutionMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner): void {
  try { original(capability, runner, "cleanup").owner.failForwardExecutionMainCompletion(capability, runner); }
  catch {
    // Revocation cannot replace the original failure or issue another role.
  }
}
