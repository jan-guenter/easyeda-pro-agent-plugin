/** Original full-writer Main admission. Only the settled managed opening can
 * issue this private reference; source hashes and a native purpose are not a
 * request, completion, paired-clock or whole-writer qualification by themselves. */
import { types } from "node:util";
// oxlint-disable-next-line import/no-cycle -- The genuine factory and capability resolve each other's private registries only after native birth; no authority is issued during initialization.
import { assertOriginalCurrentFootprintForwardWriterNativeOwner, requireOriginalCurrentFootprintForwardWriterPairedClock } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentFootprintForwardWriterNativeOwner } from "./current-pcb-diagnostic-owner.ts";
// oxlint-disable-next-line import/no-cycle -- The original main engine calls this issuer after construction; an injectable callback table would lose original-owner authority.
import { captureOriginalCurrentFootprintForwardMainCursor, requireCurrentFootprintForwardMainCursor, requireOriginalCurrentFootprintForwardMainRunner } from "./current-footprint-copy-main-backend-runner.ts";
import type { CurrentFootprintCopyMainBackendRunner } from "./current-footprint-copy-main-backend-runner.ts";
import type { CurrentFootprintForwardWriterOpeningProvider } from "./current-footprint-forward-writer-opening.ts";
import type { CurrentFootprintForwardMainCursor } from "./current-footprint-forward-main-cursor.ts";
import type { CurrentFootprintCopyMainRequestCollectCommand } from "./current-footprint-copy-main-request-protocol.ts";
import type { CurrentFootprintCopyMainCompletionCommand } from "./current-footprint-copy-main-completion-protocol.ts";
import type { CurrentFootprintForwardWriterClockRpcOrigin } from "./current-footprint-forward-writer-clock-origin.ts";
import type { CurrentFootprintCopyV2Plan } from "./current-footprint-copy-v2-plan.ts";

export interface CurrentFootprintForwardWriterMainCapability {
  readonly profile: "private.current-footprint-forward-writer-main-capability.v1";
  readonly executionAuthorized: false;
}
export type CurrentFootprintForwardWriterMainMode = "normal" | "cleanup" | "exited";
type Input = Awaited<ReturnType<CurrentFootprintForwardWriterOpeningProvider["requireSourceInput"]>>;
interface Retained {
  readonly provider: CurrentFootprintForwardWriterOpeningProvider;
  readonly input: Input;
  readonly owner: CurrentFootprintForwardWriterNativeOwner;
  readonly runner: CurrentFootprintCopyMainBackendRunner;
  readonly cursor: CurrentFootprintForwardMainCursor;
}
const capabilities = new WeakMap<object, Retained>();
const attempted = new WeakSet<object>();
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`FORWARD_WRITER_MAIN_${code}`); } }
function sameInput(expected: Input, actual: Input): void {
  const left = expected.source, right = actual.source;
  need(actual.headReference === expected.headReference && actual.result === expected.result && actual.owner === expected.owner && right.source === left.source &&
    right.opening === left.opening && right.result === left.result && right.preparation === left.preparation &&
    right.owned.before === left.owned.before && right.owned.copyPlan === left.owned.copyPlan &&
    right.owned.nativeArguments === left.owned.nativeArguments && right.owned.sourcePlan === left.owned.sourcePlan &&
    right.main === left.main && right.mainRetained === left.mainRetained && right.resources === left.resources && right.binding === left.binding,
  "ORIGINAL_PUBLISHED_INPUT");
}
function original(capability: CurrentFootprintForwardWriterMainCapability, runner: CurrentFootprintCopyMainBackendRunner,
  mode: CurrentFootprintForwardWriterMainMode): Retained {
  need(mode === "normal" || mode === "cleanup" || mode === "exited", "MODE");
  need(capability !== null && typeof capability === "object" && !types.isProxy(capability), "CAPABILITY");
  const held = capabilities.get(capability); need(held !== undefined && held.runner === runner, "CAPABILITY");
  assertOriginalCurrentFootprintForwardWriterNativeOwner(held.owner); requireOriginalCurrentFootprintForwardMainRunner(runner);
  const source = held.owner.originalFootprintForwardWriterSource();
  sameInput(held.input, { result: held.input.result, owner: held.owner, headReference: held.input.headReference, source });
  held.owner.requireOriginalForwardWriterMainRunner(runner, mode);
  const cursor = requireCurrentFootprintForwardMainCursor(held.cursor, runner);
  if (mode === "normal") { need(cursor.phase !== "failed" && cursor.phase !== "released", "NORMAL_ENDED"); }
  return held;
}
/** Publish first, then join this exact original native main construction once.
 * A failed unpublished attempt issues nothing; no main request runs here. */
export async function issueCurrentFootprintForwardWriterMainCapability(provider: CurrentFootprintForwardWriterOpeningProvider): Promise<CurrentFootprintForwardWriterMainCapability> {
  need(provider !== null && typeof provider === "object" && !types.isProxy(provider), "ORIGINAL_PROVIDER");
  const { requireCurrentFootprintForwardWriterOpeningInput } = await import("./current-footprint-forward-writer-opening.ts");
  const input = await requireCurrentFootprintForwardWriterOpeningInput(provider);
  need(!attempted.has(provider), "CAPABILITY_CONSUMED"); attempted.add(provider);
  const owner = input.owner, runner = input.source.main; need(runner !== null, "ORIGINAL_MAIN");
  assertOriginalCurrentFootprintForwardWriterNativeOwner(owner); owner.requireOriginalForwardWriterMainRunner(runner, "normal");
  const cursor = captureOriginalCurrentFootprintForwardMainCursor(runner), state = requireCurrentFootprintForwardMainCursor(cursor, runner);
  need(state.phase === "construction" && !state.busy && !state.incompleteFrame && !state.paused && state.pendingReplies === 0 && state.pendingEvents === 0,
    "ORIGINAL_CONSTRUCTION_CURSOR");
  sameInput(input, await requireCurrentFootprintForwardWriterOpeningInput(provider));
  owner.requireOriginalForwardWriterMainRunner(runner, "normal");
  const current = requireCurrentFootprintForwardMainCursor(cursor, runner);
  need(current.phase === "construction" && !current.busy && !current.incompleteFrame && !current.paused && current.pendingReplies === 0 && current.pendingEvents === 0,
    "ORIGINAL_CONSTRUCTION_CURSOR");
  const capability = Object.freeze({ profile: "private.current-footprint-forward-writer-main-capability.v1" as const, executionAuthorized: false as const });
  capabilities.set(capability, Object.freeze({ provider, input, owner, runner, cursor })); original(capability, runner, "normal"); return capability;
}
/** Resolve only this issuer's original native receiver. The owner calls this
 * before every fixed full-writer send, never accepting a caller descriptor or callback. */
export function requireCurrentFootprintForwardWriterMainNativeOwner(capability: CurrentFootprintForwardWriterMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner, mode: CurrentFootprintForwardWriterMainMode): CurrentFootprintForwardWriterNativeOwner {
  return original(capability, runner, mode).owner;
}
export function isCurrentFootprintForwardWriterMainCapability(value: unknown): value is CurrentFootprintForwardWriterMainCapability {
  return value !== null && typeof value === "object" && !types.isProxy(value) && capabilities.has(value);
}
export function requireCurrentFootprintForwardWriterMainCapability(capability: CurrentFootprintForwardWriterMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner): void { original(capability, runner, "normal"); }
/** Cross-process original identity only; this issues no clock origin, create
 * admission, current-head/frontier proof or whole-lifecycle reservation. */
export function requireCurrentFootprintForwardWriterPairedSchedule(capability: CurrentFootprintForwardWriterMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner, clock: CurrentFootprintForwardWriterClockRpcOrigin): void {
  const held = original(capability, runner, "normal"); requireOriginalCurrentFootprintForwardWriterPairedClock(held.owner, runner, clock);
}
/** After the original main release, only retained identity is admissible.
 * This never restores a normal cursor or qualifies another native request. */
export function requireRetainedCurrentFootprintForwardPairedSchedule(capability: CurrentFootprintForwardWriterMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner, clock: CurrentFootprintForwardWriterClockRpcOrigin): void {
  const held = original(capability, runner, "cleanup");
  need(requireCurrentFootprintForwardMainCursor(held.cursor, runner).phase === "released", "ORIGINAL_MAIN_NOT_RELEASED");
  requireOriginalCurrentFootprintForwardWriterPairedClock(held.owner, runner, clock, "cleanup");
}
/** A genuine reservation still belongs to exactly one original sealed copy.
 * This is no current-head/queue/clock or dispatch-eligibility assertion. */
export function requireCurrentFootprintForwardWriterPairedCopy(capability: CurrentFootprintForwardWriterMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner): CurrentFootprintCopyV2Plan {
  return original(capability, runner, "normal").input.source.owned.copyPlan;
}
export function requireCurrentFootprintForwardWriterMainCleanup(capability: CurrentFootprintForwardWriterMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner): void { original(capability, runner, "cleanup"); }
export function currentFootprintForwardWriterMainGenerationExited(capability: CurrentFootprintForwardWriterMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner): boolean {
  const held = original(capability, runner, "exited"); return held.owner.requireOriginalForwardWriterMainRunner(runner, "exited");
}
/** Fresh managed publication is rechecked across normal admission awaits.
 * Cleanup relies on retained original references and never revives this lane. */
export async function reproveCurrentFootprintForwardWriterMainPublication(capability: CurrentFootprintForwardWriterMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner): Promise<void> {
  const held = original(capability, runner, "normal");
  const { requireCurrentFootprintForwardWriterOpeningInput } = await import("./current-footprint-forward-writer-opening.ts");
  original(capability, runner, "normal"); sameInput(held.input, await requireCurrentFootprintForwardWriterOpeningInput(held.provider)); original(capability, runner, "normal");
}
export async function sendCurrentFootprintForwardWriterMainCommand(capability: CurrentFootprintForwardWriterMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner, command: CurrentFootprintCopyMainRequestCollectCommand, id: number): Promise<void> {
  const cleanup = command.phase === "request-remove" || command.phase === "request-resume" || command.phase === "request-release";
  const mode = cleanup ? "cleanup" : "normal";
  const held = original(capability, runner, mode); await held.owner.sendForwardWriterMainCommand(capability, runner, command, id); original(capability, runner, mode);
}
/** Poll the same native main owner with its exact pending allocation receiver.
 * The owner retains raw bytes before accounting and post-reply guards; this
 * wrapper never decodes, substitutes or replays an inspector chunk. */
export async function pollCurrentFootprintForwardWriterMain(capability: CurrentFootprintForwardWriterMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner, cleanup: boolean, retainChunk?: (chunk: string) => void): Promise<string> {
  const mode = cleanup ? "cleanup" : "normal";
  const held = original(capability, runner, mode);
  const chunk = await held.owner.pollForwardWriterMain(capability, runner, cleanup, retainChunk);
  original(capability, runner, mode); return chunk;
}
export function assertCurrentFootprintForwardWriterMainCompletionCapacity(capability: CurrentFootprintForwardWriterMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner, firstRequestId: number): void {
  original(capability, runner, "normal").owner.assertForwardWriterMainCompletionCapacity(capability, runner, firstRequestId);
}
export async function beginCurrentFootprintForwardWriterMainCompletion(capability: CurrentFootprintForwardWriterMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner, firstRequestId: number): Promise<void> {
  const held = original(capability, runner, "normal"); await held.owner.beginForwardWriterMainCompletion(capability, runner, firstRequestId); original(capability, runner, "normal");
}
export async function sendCurrentFootprintForwardWriterMainCompletion(capability: CurrentFootprintForwardWriterMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner, command: CurrentFootprintCopyMainCompletionCommand, id: number): Promise<void> {
  const cleanup = command.method === "Debugger.removeBreakpoint" || command.method === "Debugger.resume" || command.method === "Runtime.releaseObjectGroup";
  const mode = cleanup ? "cleanup" : "normal";
  const held = original(capability, runner, mode); await held.owner.sendForwardWriterMainCompletion(capability, runner, command, id); original(capability, runner, mode);
}
export async function retireCurrentFootprintForwardWriterMainCompletion(capability: CurrentFootprintForwardWriterMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner): Promise<void> {
  const held = original(capability, runner, "cleanup"); await held.owner.retireForwardWriterMainCompletion(capability, runner); original(capability, runner, "cleanup");
}
export function failCurrentFootprintForwardWriterMainCompletion(capability: CurrentFootprintForwardWriterMainCapability,
  runner: CurrentFootprintCopyMainBackendRunner): void {
  try { original(capability, runner, "cleanup").owner.failForwardWriterMainCompletion(capability, runner); }
  catch {
    // Revocation cannot replace the original failure or issue another role.
  }
}
