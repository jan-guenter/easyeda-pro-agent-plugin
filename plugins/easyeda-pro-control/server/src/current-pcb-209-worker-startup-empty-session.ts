/** Private continuation only. Its broader command type cannot enter the existing
 * 256-command native startup channel. A separate native factory must create the
 * same dependency before the original startup/PCB sessions, never upgrade it. */
import { types } from "node:util";
import { canonicalJson, sha256Json } from "./core.ts";
import { CURRENT_PCB_209_EMPTY_BASELINE_REQUEST_COUNT, CurrentPcb209EmptyBaselineSession } from "./current-pcb-209-empty-baseline-session.ts";
import type { CurrentPcb209EmptyBaselineCommand, CurrentPcb209EmptyBaselinePacket } from "./current-pcb-209-empty-baseline-session.ts";
import { CurrentPcb209WorkerStartupPcbSession } from "./current-pcb-209-worker-startup-pcb-session.ts";
import type { CurrentPcb209WorkerStartupPcbPacket } from "./current-pcb-209-worker-startup-pcb-session.ts";
import type { CurrentPcbWorkerStartupCommand, CurrentPcbWorkerStartupDependency } from "./current-pcb-worker-startup-contract.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
type Model = Awaited<ReturnType<CurrentPcb209WorkerStartupPcbSession["requireOriginal"]>>;
export type CurrentPcb209EmptyNativeCommand = CurrentPcbWorkerStartupCommand |
  (CurrentPcb209EmptyBaselineCommand & Readonly<{ sessionId: string }>);
export interface CurrentPcb209EmptyNativeDependency extends CurrentPcbWorkerStartupDependency {
  readonly request: (command: CurrentPcb209EmptyNativeCommand) => Promise<unknown>;
}
/** Initial/final original worker identity reproof each adds one CDP command.
 * Per-request native ownership reproofs use helper exchanges, not CDP IDs. */
export const CURRENT_PCB_209_STARTUP_EMPTY_REQUEST_COUNT = CURRENT_PCB_209_EMPTY_BASELINE_REQUEST_COUNT + 2;
// oxlint-disable typescript/unbound-method -- Retained identities are invoked with their original private-field receivers only.
const assertPcb = CurrentPcb209WorkerStartupPcbSession.prototype.assertOriginalDependencyCurrent;
const requirePcb = CurrentPcb209WorkerStartupPcbSession.prototype.requireOriginalDependency;
const observeBaseline = CurrentPcb209EmptyBaselineSession.prototype.observeAndJoin;
const requireBaseline = CurrentPcb209EmptyBaselineSession.prototype.requireOriginal;
// oxlint-enable typescript/unbound-method
function need(condition: boolean, code: string): asserts condition {
  if (!condition) { throw new Error(`PCB209_STARTUP_EMPTY_${code}`); }
}
function own(input: unknown, names: readonly string[]): void {
  need(input !== null && typeof input === "object" && !types.isProxy(input) &&
    (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null), "PLAIN_INPUT");
  const keys = Reflect.ownKeys(input);
  need(keys.length === names.length && keys.every(key => typeof key === "string" && names.includes(key)), "INPUT_FIELDS");
  for (const name of names) {
    const descriptor = Object.getOwnPropertyDescriptor(input, name);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "INPUT_DATA");
  }
}
async function bounded<T>(promise: Promise<T>): Promise<T> {
  const expired = Promise.withResolvers<never>();
  const timer = setTimeout(() => { expired.reject(new Error("PCB209_STARTUP_EMPTY_DEADLINE")); }, 15_000);
  try { return await Promise.race([promise, expired.promise]); } finally { clearTimeout(timer); }
}
/** The large replies have exactly this fixed text envelope. Capture original
 * text before the next owner await; all other replies keep the small decoder. */
export function captureCurrentPcb209EmptyNativeReply(command: CurrentPcb209EmptyBaselineCommand, raw: unknown): unknown {
  if (!("commonPhase" in command) || !["packet-read", "packet-result", "assets", "metadata"].includes(command.commonPhase)) {
    return captureCurrentPcbStringClockReply(raw).value;
  }
  own(raw, ["result"]);
  const result: unknown = Object.getOwnPropertyDescriptor(raw, "result")?.value;
  own(result, ["type", "value"]);
  const type: unknown = Object.getOwnPropertyDescriptor(result, "type")?.value;
  const value: unknown = Object.getOwnPropertyDescriptor(result, "value")?.value;
  need(type === "string" && typeof value === "string" && value.isWellFormed() && Buffer.byteLength(value) <= 524_288, "TEXT_REPLY");
  return Object.freeze({ result: Object.freeze({ type, value }) });
}
export interface CurrentPcb209WorkerStartupEmptyPacket {
  readonly profile: "private.current-pcb209-worker-startup-empty-session.v1";
  readonly pcbPacketSha256: string;
  readonly baseline: CurrentPcb209EmptyBaselinePacket;
  readonly originalPcbSessionRetained: true;
  readonly originalNativeDependencyRetained: true;
  readonly nativeCommands: number;
  readonly completeLiveBaselineVerified: false;
  readonly startupCompletionVerified: false;
  readonly executionAuthorized: false;
  readonly saveAuthorized: false;
}
export interface CurrentPcb209WorkerStartupEmptyInput {
  readonly pcb: CurrentPcb209WorkerStartupPcbSession;
  readonly packet: CurrentPcb209WorkerStartupPcbPacket;
  readonly dependency: CurrentPcb209EmptyNativeDependency;
}
export class CurrentPcb209WorkerStartupEmptySession {
  readonly #pcb: CurrentPcb209WorkerStartupPcbSession;
  readonly #pcbPacket: CurrentPcb209WorkerStartupPcbPacket;
  readonly #dependency: CurrentPcb209EmptyNativeDependency;
  readonly #request: CurrentPcb209EmptyNativeDependency["request"];
  readonly #owner: CurrentPcb209EmptyNativeDependency["assertOriginalOwner"];
  readonly #before: Inventory;
  readonly #completion: ReturnType<typeof readerCompletion>;
  #model: Model | null = null;
  #baseline: CurrentPcb209EmptyBaselineSession | null = null;
  #packet: CurrentPcb209WorkerStartupEmptyPacket | null = null;
  #phase: "ready" | "preflight" | "observing" | "final" | "completed" | "failed" = "ready";
  #commands = 0;
  #failure: unknown;
  public constructor(input: CurrentPcb209WorkerStartupEmptyInput) {
    own(input, ["pcb", "packet", "dependency"]);
    need(input.pcb !== null && typeof input.pcb === "object" && !types.isProxy(input.pcb) &&
      Object.getPrototypeOf(input.pcb) === CurrentPcb209WorkerStartupPcbSession.prototype, "ORIGINAL_PCB");
    own(input.dependency, ["parentTargetId", "parentSessionId", "assertOriginalOwner", "assertOriginalTermination", "request", "subscribe"]);
    need(Object.isFrozen(input.dependency) && typeof input.dependency.request === "function" &&
      typeof input.dependency.assertOriginalOwner === "function", "ORIGINAL_DEPENDENCY");
    this.#pcb = input.pcb; this.#pcbPacket = input.packet; this.#dependency = input.dependency;
    this.#request = input.dependency.request; this.#owner = input.dependency.assertOriginalOwner;
    const proof = assertPcb.call(this.#pcb, this.#pcbPacket, this.#dependency);
    this.#before = proof.before; this.#completion = readerCompletion(proof.before);
    need(this.#completion.observedChildClose && this.#completion.exitCode === 0 && this.#completion.exitSignal === null, "COMPLETED_SQL");
    this.#stable();
  }
  #stable(): void {
    need(Object.getPrototypeOf(this.#pcb) === CurrentPcb209WorkerStartupPcbSession.prototype &&
      CurrentPcb209WorkerStartupPcbSession.prototype.assertOriginalDependencyCurrent === assertPcb &&
      CurrentPcb209WorkerStartupPcbSession.prototype.requireOriginalDependency === requirePcb &&
      !Object.hasOwn(this.#pcb, "assertOriginalDependencyCurrent") && !Object.hasOwn(this.#pcb, "requireOriginalDependency") &&
      this.#dependency.request === this.#request && this.#dependency.assertOriginalOwner === this.#owner &&
      readerCompletion(this.#before) === this.#completion &&
      CurrentPcb209EmptyBaselineSession.prototype.observeAndJoin === observeBaseline &&
      CurrentPcb209EmptyBaselineSession.prototype.requireOriginal === requireBaseline, "ORIGINAL_METHODS");
  }
  #current(): void {
    this.#stable(); need(this.#phase !== "failed", "FAILED");
    const proof = assertPcb.call(this.#pcb, this.#pcbPacket, this.#dependency);
    need(proof.before === this.#before, "ORIGINAL_CHECKPOINT");
    need(this.#model === null || canonicalJson(proof.model) === canonicalJson(this.#model), "MODEL_CHANGED");
  }
  async #ownerCurrent(): Promise<void> {
    this.#current(); await bounded(this.#owner.call(this.#dependency)); this.#current();
  }
  async #send(command: CurrentPcb209EmptyBaselineCommand): Promise<unknown> {
    const cleanup = command.method === "Runtime.releaseObjectGroup";
    // Preserve the original two object-group releases after a semantic failure.
    // The original native dependency independently controls cleanup admission.
    if (cleanup) { this.#stable(); } else { await this.#ownerCurrent(); }
    need(this.#model !== null && this.#commands < CURRENT_PCB_209_EMPTY_BASELINE_REQUEST_COUNT, "COMMAND_BOUND");
    this.#commands += 1;
    const nativeCommand = freezeDeep({ ...command, sessionId: this.#model.sessionId });
    const raw = await bounded(this.#request.call(this.#dependency, nativeCommand));
    const reply = captureCurrentPcb209EmptyNativeReply(command, raw);
    if (cleanup) { this.#stable(); } else { await this.#ownerCurrent(); }
    return reply;
  }
  public status(): Readonly<Record<string, unknown>> {
    return Object.freeze({ phase: this.#phase, nativeCommands: this.#commands, packetRetained: this.#packet !== null,
      baseline: this.#baseline?.status() ?? null, executionAuthorized: false });
  }
  public retainedFailure(): unknown { return this.#failure; }
  public async observeAndJoin(): Promise<CurrentPcb209WorkerStartupEmptyPacket> {
    need(this.#phase === "ready", "CONSUMED"); this.#phase = "preflight";
    try {
      this.#current(); const proof = await bounded(requirePcb.call(this.#pcb, this.#pcbPacket, this.#dependency));
      this.#model = proof.model; this.#current();
      const observed = this.#pcbPacket.openingObservation;
      this.#baseline = new CurrentPcb209EmptyBaselineSession({ before: this.#before,
        identity: { projectUuid: observed.projectUuid, branchUuid: observed.branchUuid, documentUuid: observed.documentUuid },
        scriptId: this.#model.scriptId, uniqueContextId: this.#model.uniqueContextId,
        transport: Object.freeze({ request: (command: CurrentPcb209EmptyBaselineCommand): Promise<unknown> => this.#send(command),
          assertCurrent: (): void => { this.#current(); } }) });
      this.#phase = "observing"; const baseline = await observeBaseline.call(this.#baseline);
      this.#current(); this.#phase = "final"; await bounded(requirePcb.call(this.#pcb, this.#pcbPacket, this.#dependency)); this.#current();
      requireBaseline.call(this.#baseline, baseline);
      this.#packet = freezeDeep({ profile: "private.current-pcb209-worker-startup-empty-session.v1",
        pcbPacketSha256: sha256Json(this.#pcbPacket), baseline, originalPcbSessionRetained: true,
        originalNativeDependencyRetained: true, nativeCommands: this.#commands,
        completeLiveBaselineVerified: false, startupCompletionVerified: false, executionAuthorized: false, saveAuthorized: false });
      this.#phase = "completed"; return this.#packet;
    } catch (error) { this.#phase = "failed"; this.#failure = error; throw error; }
  }
  public requireOriginal(packet: CurrentPcb209WorkerStartupEmptyPacket): void {
    need(this.#phase === "completed" && packet === this.#packet && this.#baseline !== null, "ORIGINAL_PACKET");
    try { this.#current(); requireBaseline.call(this.#baseline, packet.baseline); this.#current(); }
    catch (error) { this.#phase = "failed"; this.#failure = error; throw error; }
  }
}
