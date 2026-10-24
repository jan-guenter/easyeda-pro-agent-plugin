/** One private original-scope lifetime brackets the exact common/SQL join with
 * empty raw roots. It closes the watcherless-manager gap for an empty target;
 * it does not admit populated geometry, pending effects or a public writer. */
import { types } from "node:util";
import { canonicalJson, sha256Json } from "./core.ts";
import { CURRENT_PCB_209_COMMON_BASELINE_PACKET_MAX_BYTES, CurrentPcb209CommonBaselineSession } from "./current-pcb-209-common-baseline-session.ts";
import type { CurrentPcb209CommonBaselinePacket, CurrentPcb209CommonBaselineSessionInput } from "./current-pcb-209-common-baseline-session.ts";
import { CURRENT_PCB_209_COMMON_BASELINE_REQUEST_COUNT } from "./current-pcb-209-common-baseline-runner.ts";
import type { CurrentPcb209CommonBaselineCommand } from "./current-pcb-209-common-baseline-runner.ts";
import { CURRENT_PCB_209_EMPTY_ROOT_REQUEST_COUNT, CurrentPcb209EmptyRootRunner } from "./current-pcb-209-empty-root-runner.ts";
import type { CurrentPcb209EmptyRootCommand, CurrentPcb209EmptyRootPair } from "./current-pcb-209-empty-root-runner.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

/** Six root scope requests, before/after samples and group release supplement
 * the complete common maximum. Enclosing startup/PCB/clock work is additional. */
export const CURRENT_PCB_209_EMPTY_BASELINE_REQUEST_COUNT = CURRENT_PCB_209_COMMON_BASELINE_REQUEST_COUNT + CURRENT_PCB_209_EMPTY_ROOT_REQUEST_COUNT;
export const CURRENT_PCB_209_EMPTY_BASELINE_PACKET_MAX_BYTES = CURRENT_PCB_209_COMMON_BASELINE_PACKET_MAX_BYTES + 2 * 16_384 + 4096;
export type CurrentPcb209EmptyBaselineCommand = CurrentPcb209CommonBaselineCommand | CurrentPcb209EmptyRootCommand;
export interface CurrentPcb209EmptyBaselineTransport {
  readonly request: (command: CurrentPcb209EmptyBaselineCommand) => Promise<unknown>;
  readonly assertCurrent: () => void;
}
export interface CurrentPcb209EmptyBaselineSessionInput extends Omit<CurrentPcb209CommonBaselineSessionInput, "transport"> {
  readonly transport: CurrentPcb209EmptyBaselineTransport;
}
export interface CurrentPcb209EmptyBaselinePacket {
  readonly profile: "private.current-pcb209-empty-baseline.v1";
  readonly common: CurrentPcb209CommonBaselinePacket;
  readonly roots: CurrentPcb209EmptyRootPair;
  readonly commonSqlJoinBracketedByEmptyRoots: true;
  readonly storedTargetContainsOnlyMatchedCommonAndMeta: true;
  readonly rawManagersIncludeWatcherlessModels: true;
  readonly originalCompletedSqlReaderRetained: true;
  readonly originalRunnersRetained: true;
  readonly matchingSamples: true;
  readonly completeLiveBaselineVerified: false;
  readonly sourceMembershipVerified: false;
  readonly sourceSerializationObserved: false;
  readonly atomicSnapshotVerified: false;
  readonly continuousObservation: false;
  readonly startupCompletionVerified: false;
  readonly queueCompletionVerified: false;
  readonly pendingProducerInventoryVerified: false;
  readonly activeToolsCovered: false;
  readonly closedFileOwnershipVerified: false;
  readonly savedVerified: false;
  readonly reopenedVerified: false;
  readonly executionAuthorized: false;
  readonly saveAuthorized: false;
  readonly packetSha256: string;
}
function need(condition: boolean, code: string): asserts condition {
  if (!condition) { throw new Error(`PCB209_EMPTY_BASELINE_${code}`); }
}
function methods(transport: CurrentPcb209EmptyBaselineTransport): readonly unknown[] {
  need(transport !== null && typeof transport === "object" && !types.isProxy(transport) &&
    (Object.getPrototypeOf(transport) === Object.prototype || Object.getPrototypeOf(transport) === null), "TRANSPORT");
  const keys = Reflect.ownKeys(transport), names = ["request", "assertCurrent"] as const;
  need(keys.length === names.length && keys.every(key => names.some(name => name === key)), "TRANSPORT_FIELDS");
  return names.map(name => {
    const descriptor = Object.getOwnPropertyDescriptor(transport, name);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === "function", "TRANSPORT_METHODS");
    return descriptor.value as unknown;
  });
}
export class CurrentPcb209EmptyBaselineSession {
  readonly #common: CurrentPcb209CommonBaselineSession;
  readonly #roots: CurrentPcb209EmptyRootRunner;
  readonly #transport: CurrentPcb209EmptyBaselineTransport;
  readonly #methods: readonly unknown[];
  readonly #request: CurrentPcb209EmptyBaselineTransport["request"];
  readonly #commonMethods: readonly unknown[];
  readonly #rootMethods: readonly unknown[];
  #phase: "ready" | "observing" | "completed" | "failed" = "ready";
  #packet: CurrentPcb209EmptyBaselinePacket | null = null;
  #failure: unknown;
  public constructor(input: CurrentPcb209EmptyBaselineSessionInput) {
    need(input !== null && typeof input === "object" && !types.isProxy(input) &&
      (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null), "INPUT");
    const names = ["before", "identity", "transport", "scriptId", "uniqueContextId"];
    const keys = Reflect.ownKeys(input);
    need(keys.length === names.length && keys.every(key => typeof key === "string" && names.includes(key)), "INPUT_FIELDS");
    for (const name of names) {
      const descriptor = Object.getOwnPropertyDescriptor(input, name);
      need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "INPUT_DATA");
    }
    this.#transport = input.transport; this.#methods = methods(input.transport);
    this.#request = input.transport.request;
    const transport = Object.freeze({ request: (command: CurrentPcb209EmptyBaselineCommand): Promise<unknown> => {
      // Release uses the retained method even after a semantic reproof fails.
      // The original native transport still owns its own cleanup admission.
      if (command.method !== "Runtime.releaseObjectGroup") { this.#current(); }
      return this.#request.call(this.#transport, command);
    }, assertCurrent: (): void => { this.#current(); } });
    this.#common = new CurrentPcb209CommonBaselineSession({ ...input, transport });
    this.#roots = new CurrentPcb209EmptyRootRunner(transport, input.scriptId, input.uniqueContextId, input.identity.documentUuid);
    // oxlint-disable-next-line typescript/unbound-method -- Retain identities only; all calls keep each original receiver.
    this.#commonMethods = Object.freeze([this.#common.observeAndJoin, this.#common.requireOriginalPacket]);
    // oxlint-disable-next-line typescript/unbound-method -- Retain identities only; all calls keep each original receiver.
    this.#rootMethods = Object.freeze([this.#roots.observeAround, this.#roots.requireOriginal]);
  }
  #current(): void {
    need(this.#phase !== "failed" && methods(this.#transport).every((method, index) => method === this.#methods[index]), "ORIGINAL_OWNER");
    this.#issuersCurrent();
    this.#transport.assertCurrent();
    need(methods(this.#transport).every((method, index) => method === this.#methods[index]), "ORIGINAL_OWNER");
    this.#issuersCurrent();
  }
  #issuersCurrent(): void {
    need(this.#common.observeAndJoin === this.#commonMethods[0] && this.#common.requireOriginalPacket === this.#commonMethods[1] &&
      this.#roots.observeAround === this.#rootMethods[0] && this.#roots.requireOriginal === this.#rootMethods[1], "ORIGINAL_ISSUERS");
  }
  public status(): Readonly<Record<string, unknown>> {
    return Object.freeze({ phase: this.#phase, packetRetained: this.#packet !== null, common: this.#common.status(),
      roots: this.#roots.status(), executionAuthorized: false });
  }
  public retainedFailure(): unknown { return this.#failure; }
  public async observeAndJoin(): Promise<CurrentPcb209EmptyBaselinePacket> {
    need(this.#phase === "ready", "CONSUMED"); this.#phase = "observing";
    try {
      this.#current();
      const { pair: roots, value: common } = await this.#roots.observeAround(() => this.#common.observeAndJoin());
      this.#common.requireOriginalPacket(common); this.#roots.requireOriginal(roots); this.#current();
      need(common.identity.documentUuid === roots.documentUuid, "DOCUMENT_CHANGED");
      const body = freezeDeep({ profile: "private.current-pcb209-empty-baseline.v1" as const, common, roots,
        commonSqlJoinBracketedByEmptyRoots: true as const, storedTargetContainsOnlyMatchedCommonAndMeta: true as const,
        rawManagersIncludeWatcherlessModels: true as const, originalCompletedSqlReaderRetained: true as const,
        originalRunnersRetained: true as const, matchingSamples: true as const, completeLiveBaselineVerified: false as const,
        sourceMembershipVerified: false as const, sourceSerializationObserved: false as const, atomicSnapshotVerified: false as const,
        continuousObservation: false as const, startupCompletionVerified: false as const, queueCompletionVerified: false as const,
        pendingProducerInventoryVerified: false as const, activeToolsCovered: false as const, closedFileOwnershipVerified: false as const,
        savedVerified: false as const, reopenedVerified: false as const, executionAuthorized: false as const, saveAuthorized: false as const });
      const packet = freezeDeep({ ...body, packetSha256: sha256Json(body) });
      need(Buffer.byteLength(canonicalJson(packet)) <= CURRENT_PCB_209_EMPTY_BASELINE_PACKET_MAX_BYTES, "PACKET_BOUND");
      this.#packet = packet; this.#phase = "completed"; return packet;
    } catch (error) { this.#phase = "failed"; this.#failure = error; throw error; }
  }
  public requireOriginal(packet: CurrentPcb209EmptyBaselinePacket): void {
    need(this.#phase === "completed" && packet === this.#packet, "ORIGINAL_PACKET");
    try { this.#current(); this.#common.requireOriginalPacket(packet.common); this.#roots.requireOriginal(packet.roots); this.#current(); }
    catch (error) { this.#phase = "failed"; this.#failure = error; throw error; }
  }
}
