/** Private single-consumption composition of original runner issuance and the
 * original completed SQL reader. The native lifecycle must supply its retained
 * transport and pre-open inventory; this class cannot create that authority. */
import { types } from "node:util";
import { z } from "zod";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { CurrentPcbCommonBaselineRunner, requireOriginalCurrentPcbCommonBaselineReplies } from "./current-pcb-common-baseline-runner.ts";
import type { CurrentPcbCommonBaselineObservation, CurrentPcbCommonBaselineTransport } from "./current-pcb-common-baseline-runner.ts";
import { prepareCurrentPcbCommonStoredFromOriginalBaseline, readCurrentPcbCommonHistoricalHeader } from "./current-pcb-common-stored-relation.ts";
import type { CurrentPcbCommonHistoricalHeader, CurrentPcbCommonMetadataStoredRelation, CurrentPcbCommonStoredIdentity } from "./current-pcb-common-stored-relation.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
export const CURRENT_PCB_COMMON_BASELINE_PACKET_MAX_BYTES = 2_121_728;
type Phase = "ready" | "historical-header" | "observation" | "stored-relation" | "owner-final" | "completed" | "failed";
type FailurePhase = Exclude<Phase, "ready" | "completed" | "failed">;
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const identity = z.object({ projectUuid: z.string().regex(/^(?:[a-f\d]{32}|[a-f\d]{64})$/u),
  branchUuid: z.string().regex(/^[a-f\d]{32}$/u), documentUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u) }).strict();
const LIMITS = Object.freeze({ originalOwnerVerified: false, closedFileOwnershipVerified: false,
  atomicSnapshotVerified: false, continuousObservation: false, completeLiveBaselineVerified: false,
  completeStoredAssetsOwnershipVerified: false, queueCompletionVerified: false, completeEffectVerified: false,
  savedVerified: false, reopenedVerified: false, saveAuthorized: false, executionAuthorized: false } as const);

export interface CurrentPcbCommonBaselinePacket extends Readonly<typeof LIMITS> {
  readonly profile: "private.current-pcb-common-baseline-packet.v1";
  readonly identity: CurrentPcbCommonStoredIdentity;
  readonly historicalHeader: CurrentPcbCommonHistoricalHeader;
  readonly relation: CurrentPcbCommonMetadataStoredRelation;
  readonly originalRunnerIssued: true;
  readonly originalCompletedSqlReaderRetained: true;
  readonly historicalHeaderJoined: true;
  readonly completeTargetCommonAndMetaMatched: true;
  readonly observationSha256: string;
  readonly retainedReplySha256: Readonly<Record<string, string>>;
  readonly packetSha256: string;
}
export interface CurrentPcbCommonBaselineSessionInput {
  readonly before: Inventory;
  readonly identity: CurrentPcbCommonStoredIdentity;
  readonly transport: CurrentPcbCommonBaselineTransport;
  readonly scriptId: string;
  readonly uniqueContextId: string;
}
function need(condition: boolean, detail: string): asserts condition {
  if (!condition) { throw new Error(`PCB_COMMON_BASELINE_SESSION: ${detail}`); }
}
function own(input: unknown, names: readonly string[]): Record<string, unknown> {
  need(input !== null && typeof input === "object" && !types.isProxy(input) && !Array.isArray(input), "own plain input required");
  const keys = Reflect.ownKeys(input), prototype: unknown = Object.getPrototypeOf(input);
  need((prototype === Object.prototype || prototype === null) && keys.length === names.length &&
    keys.every(key => typeof key === "string" && names.includes(key)), "input fields differ");
  return Object.fromEntries(names.map(name => {
    const descriptor = Object.getOwnPropertyDescriptor(input, name);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "own data input required");
    return [name, descriptor.value as unknown];
  }));
}

/** There is deliberately no API to adopt an observation, packet or raw reply.
 * A session creates its own sole runner. Repeated calls stay consumed even when
 * historical decoding, observation, cleanup or the later SQL join fails. */
export class CurrentPcbCommonBaselineSession {
  readonly #before: Inventory;
  readonly #completion: ReturnType<typeof readerCompletion>;
  readonly #identity: CurrentPcbCommonStoredIdentity;
  readonly #assertCurrent: () => void;
  readonly #runner: CurrentPcbCommonBaselineRunner;
  #phase: Phase = "ready";
  #failurePhase: FailurePhase | null = null;
  #failure: unknown;
  #header: CurrentPcbCommonHistoricalHeader | null = null;
  #observation: CurrentPcbCommonBaselineObservation | null = null;
  #packet: CurrentPcbCommonBaselinePacket | null = null;
  #comparisonRefused = false;

  public constructor(input: CurrentPcbCommonBaselineSessionInput) {
    const fields = own(input, ["before", "identity", "transport", "scriptId", "uniqueContextId"]);
    const transport = own(fields["transport"], ["request", "assertCurrent"]);
    need(typeof transport["request"] === "function" && typeof transport["assertCurrent"] === "function", "original transport methods required");
    // Descriptor admission above precedes every typed access; retain the actual
    // Reader and method identities rather than serializing or adopting copies.
    this.#before = input.before; this.#completion = readerCompletion(this.#before);
    need(this.#completion.observedChildClose && this.#completion.exitCode === 0 && this.#completion.exitSignal === null,
      "original completed SQL reader required");
    this.#identity = freezeDeep(identity.parse(own(fields["identity"], ["projectUuid", "branchUuid", "documentUuid"])));
    this.#assertCurrent = input.transport.assertCurrent;
    this.#runner = new CurrentPcbCommonBaselineRunner({ request: input.transport.request, assertCurrent: (): void => { this.#current(); } },
      handle.parse(fields["scriptId"]), handle.parse(fields["uniqueContextId"]), this.#identity.documentUuid);
  }
  #current(): void {
    this.#assertCurrent();
    need(readerCompletion(this.#before) === this.#completion, "original SQL reader changed");
  }
  public status(): Readonly<{ phase: Phase; consumed: boolean; failurePhase: FailurePhase | null;
    headerRetained: boolean; observationRetained: boolean; packetRetained: boolean; executionAuthorized: false }> {
    return Object.freeze({ phase: this.#phase, consumed: this.#phase !== "ready", failurePhase: this.#failurePhase,
      headerRetained: this.#header !== null, observationRetained: this.#observation !== null,
      packetRetained: this.#packet !== null, executionAuthorized: false });
  }
  /** Evidence retention only, including after a later stored-history refusal.
   * Returning original issuance never restores expired native ownership. */
  public retainedObservation(): CurrentPcbCommonBaselineObservation | null { return this.#observation; }
  public retainedHistoricalHeader(): CurrentPcbCommonHistoricalHeader | null { return this.#header; }
  public retainedFailure(): unknown { return this.#failure; }
  public comparisonRefused(): boolean { return this.#comparisonRefused; }
  /** Only a pure stored-relation exception after successful original observation
   * and cleanup can reach this branch. It grants no packet or second attempt. */
  public requireOriginalComparisonRefusal(): CurrentPcbCommonBaselineObservation {
    need(this.#phase === "failed" && this.#comparisonRefused && this.#observation !== null && this.#packet === null,
      "original comparison refusal required");
    try { this.#current(); }
    catch (caughtError) { this.#comparisonRefused = false; throw caughtError; }
    return this.#observation;
  }

  public async observeAndJoin(): Promise<CurrentPcbCommonBaselinePacket> {
    need(this.#phase === "ready", "attempt consumed");
    this.#phase = "historical-header";
    try {
      this.#current();
      this.#header = await readCurrentPcbCommonHistoricalHeader(this.#before, this.#identity);
      this.#current();
      this.#phase = "observation";
      this.#observation = await this.#runner.observe();
      this.#current();
      this.#phase = "stored-relation";
      let relation: CurrentPcbCommonMetadataStoredRelation;
      try {
        relation = await prepareCurrentPcbCommonStoredFromOriginalBaseline({ before: this.#before, identity: this.#identity,
          observation: this.#observation, headerText: this.#header.headerText });
      } catch (caughtError) {
        // The source of the exception, not its message or eventual phase label,
        // Distinguishes a pure comparison refusal from a native/owner failure.
        this.#current(); this.#comparisonRefused = true; throw caughtError;
      }
      this.#current();
      need(relation.common.beforeSqlSha256 === this.#header.beforeSqlSha256 && relation.common.checkpointSha256 === this.#header.checkpointSha256 &&
        relation.common.historySha256 === this.#header.historySha256 && relation.common.targetSemanticSha256 === this.#header.targetSemanticSha256 &&
        relation.common.selectedHeader.recordSha256 === this.#header.selected.recordSha256, "historical header relation differs");
      const replies = requireOriginalCurrentPcbCommonBaselineReplies(this.#observation);
      const body = freezeDeep({ profile: "private.current-pcb-common-baseline-packet.v1" as const, identity: this.#identity,
        historicalHeader: this.#header, relation, originalRunnerIssued: true as const, originalCompletedSqlReaderRetained: true as const,
        historicalHeaderJoined: true as const, completeTargetCommonAndMetaMatched: true as const,
        observationSha256: sha256Json(this.#observation), retainedReplySha256: Object.fromEntries(
          Object.entries(replies).map(([name, reply]) => [name, sha256Text(reply.result.value)])), ...LIMITS });
      const packet = freezeDeep({ ...body, packetSha256: sha256Json(body) });
      need(Buffer.byteLength(canonicalJson(packet)) <= CURRENT_PCB_COMMON_BASELINE_PACKET_MAX_BYTES, "packet byte bound");
      this.#phase = "owner-final"; this.#current(); this.#packet = packet;
      this.#phase = "completed"; return this.#packet;
    } catch (caughtError) {
      this.#failurePhase = this.#phase === "completed" ? "owner-final" : this.#phase;
      this.#failure = caughtError; this.#phase = "failed";
      throw new Error(`PCB_COMMON_BASELINE_SESSION_FAILED_${this.#failurePhase.toUpperCase()}`, { cause: caughtError });
    }
  }

  /** For the original enclosing native owner only. A copied packet, a completed
   * historical session with changed ownership or a failed attempt cannot pass. */
  public requireOriginalPacket(packet: CurrentPcbCommonBaselinePacket): CurrentPcbCommonBaselineObservation {
    need(this.#phase === "completed" && packet === this.#packet && this.#observation !== null, "original completed packet required");
    try { this.#current(); }
    catch (caughtError) {
      // Preserve historical evidence, but never revive this lifetime after an
      // Observed owner failure merely because a later callback says current.
      this.#failurePhase = "owner-final"; this.#failure = caughtError; this.#phase = "failed"; throw caughtError;
    }
    return this.#observation;
  }
}
