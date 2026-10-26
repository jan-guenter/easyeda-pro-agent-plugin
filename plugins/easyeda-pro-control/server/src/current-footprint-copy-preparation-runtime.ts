/** Original-owner preparation from an original209 opening and its retained source.
 * Native leases stay with that opening; this leaf cannot launch, transfer its
 * purpose, publish lifecycle records, write, Save or release its native owner. */
import { types } from "node:util";
import type { CurrentFootprintCopyPreparation } from "./current-footprint-copy-preparation.ts";
import { canonicalJson, sha256Json } from "./core.ts";
import { assertCurrentFootprintCopyV2Inventory, prepareCurrentFootprintCopyV2Plan } from "./current-footprint-copy-v2-plan.ts";
import type { CurrentFootprintCopyV2Plan } from "./current-footprint-copy-v2-plan.ts";
import { currentFootprintCopyV2NativeCreateArguments } from "./current-footprint-copy-v2-native-arguments.ts";
import type { CurrentFootprintCopyV2NativeArguments } from "./current-footprint-copy-v2-native-arguments.ts";
import type { CurrentFootprintCopyStatePacket } from "./current-footprint-copy-state.ts";
import { assertCurrentFootprintSourcePlanInventory } from "./current-footprint-source-plan.ts";
import type { CurrentFootprintSourcePlan } from "./current-footprint-source-plan.ts";
import type { CurrentFootprintSourceReadPacket } from "./current-footprint-source-read-runner.ts";
import { CurrentPcb209WorkerStartupOpening } from "./current-pcb-209-worker-startup-opening.ts";
import type { CurrentPcb209WorkerStartupOpeningResult } from "./current-pcb-209-worker-startup-opening.ts";
import type { CurrentPcbWorkerConstructionAssignments } from "./current-pcb-worker-construction-assignment.ts";
// oxlint-disable-next-line import/max-dependencies -- Preparation joins eleven independently owned inputs; its shared durable schema avoids a duplicated journal contract.
import { readerCompletion } from "./sqlite-inventory.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
interface Source {
  readonly opening: CurrentPcb209WorkerStartupOpening;
  readonly result: CurrentPcb209WorkerStartupOpeningResult;
  readonly assignments: CurrentPcbWorkerConstructionAssignments;
  readonly state: CurrentFootprintCopyStatePacket;
  readonly sourcePlan: CurrentFootprintSourcePlan;
  readonly source: CurrentFootprintSourceReadPacket;
  readonly before: Inventory;
}
export type { CurrentFootprintCopyPreparation } from "./current-footprint-copy-preparation.ts";

interface Retained {
  readonly source: Source;
  readonly sourceText: string;
  readonly completion: ReturnType<typeof readerCompletion>;
  readonly plan: CurrentFootprintCopyV2Plan;
  readonly arguments: CurrentFootprintCopyV2NativeArguments;
  failed: boolean;
}
const preparations = new WeakMap<CurrentFootprintCopyPreparation, Retained>();
const consumed = new WeakSet<CurrentFootprintSourceReadPacket>();
// oxlint-disable-next-line typescript/unbound-method -- The captured private-field method always receives its original instance; no caller callback establishes ownership.
const requireSource = CurrentPcb209WorkerStartupOpening.prototype.requireFootprintSource;
function need(condition: boolean, detail: string): asserts condition {
  if (!condition) { throw new Error(`CURRENT_FOOTPRINT_COPY_PREPARATION: ${detail}`); }
}
function same(source: Source, completion: ReturnType<typeof readerCompletion>, text: string): void {
  assertCurrentFootprintSourcePlanInventory(source.sourcePlan, source.before);
  need(readerCompletion(source.before) === completion && completion.observedChildClose && completion.exitCode === 0 &&
    completion.exitSignal === null, "original completed checkpoint reader required");
  need(canonicalJson(source.source) === text && CurrentPcb209WorkerStartupOpening.prototype.requireFootprintSource === requireSource,
    "original source or opening method changed");
}
async function reprove(source: Source, completion: ReturnType<typeof readerCompletion>, text: string): Promise<void> {
  same(source, completion, text);
  await requireSource.call(source.opening, source.result, source.assignments, source.state, source.sourcePlan, source.source);
  same(source, completion, text);
}

/** Only the lifecycle's retained objects may reach this internal issuer. Its
 * captured opening method rejects cloned packets and forged receivers before
 * pure preparation. Publication, copy-specific launch and complete capacity
 * remain separate prerequisites; none can be asserted through this token. */
export async function prepareCurrentFootprintCopyOwned(source: Source): Promise<CurrentFootprintCopyPreparation> {
  need(!types.isProxy(source) && Object.getPrototypeOf(source) === Object.prototype && Object.isFrozen(source), "fixed original input required");
  const keys = ["opening", "result", "assignments", "state", "sourcePlan", "source", "before"];
  need(Reflect.ownKeys(source).length === keys.length && keys.every(key => {
    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    return descriptor !== undefined && Object.hasOwn(descriptor, "value") && descriptor.enumerable === true;
  }), "exact original data references required");
  for (const value of Object.values(source)) {
    need(value !== null && typeof value === "object" && !types.isProxy(value), "original object required");
  }
  need(!consumed.has(source.source), "source preparation consumed");
  // Consume before awaited owner reproof, so a lost original owner cannot be
  // Recovered by retrying this preparation with the same source packet.
  consumed.add(source.source);
  const completion = readerCompletion(source.before);
  assertCurrentFootprintSourcePlanInventory(source.sourcePlan, source.before);
  // Check packet identity before serializing it. A forged packet may contain
  // Accessors, and no formatting or hashing path may execute those accessors.
  await requireSource.call(source.opening, source.result, source.assignments, source.state, source.sourcePlan, source.source);
  const text = canonicalJson(source.source);
  await reprove(source, completion, text);
  const plan = await prepareCurrentFootprintCopyV2Plan(source.before, source.sourcePlan,
    { client: source.source.request.client, content: source.source.content });
  await reprove(source, completion, text);
  const args = currentFootprintCopyV2NativeCreateArguments(plan);
  const preparation: CurrentFootprintCopyPreparation = Object.freeze({ profile: "private.current-footprint-copy-owned-preparation.v1",
    beforeCheckpointSha256: source.before.checkpointSha256, beforeSqlSha256: source.before.logicalSha256,
    sourcePlanSha256: sha256Json(source.sourcePlan), sourcePacketSha256: sha256Json(source.source),
    copyPlanSha256: sha256Json(plan), nativeArgumentsSha256: sha256Json(args), originalOpeningRetained: true,
    originalSourceObservationRetained: true, lifecyclePublicationVerified: false, copyLaunchPurposeQualified: false,
    completeCapacityReserved: false, producerBindingVerified: false, actorAndClocksVerified: false,
    executionAuthorized: false, persistenceVerified: false });
  preparations.set(preparation, { source, sourceText: text, completion, plan, arguments: args, failed: false });
  return preparation;
}

/** A descriptor clone cannot retrieve private inputs. The original opening
 * again checks its source/assignment/native owner before any future use. */
export async function requireCurrentFootprintCopyOwned(preparation: CurrentFootprintCopyPreparation,
  opening: CurrentPcb209WorkerStartupOpening): Promise<Readonly<{
    before: Inventory; sourcePlan: CurrentFootprintSourcePlan; copyPlan: CurrentFootprintCopyV2Plan;
    nativeArguments: CurrentFootprintCopyV2NativeArguments;
  }>> {
  const retained = preparations.get(preparation);
  need(retained !== undefined && retained.source.opening === opening && !retained.failed, "original preparation and opening required");
  try {
    await reprove(retained.source, retained.completion, retained.sourceText);
    assertCurrentFootprintCopyV2Inventory(retained.plan, retained.source.before);
    return Object.freeze({ before: retained.source.before, sourcePlan: retained.source.sourcePlan,
      copyPlan: retained.plan, nativeArguments: retained.arguments });
  } catch (error) { retained.failed = true; throw error; }
}
