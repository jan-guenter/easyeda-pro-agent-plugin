/** Original-opening composition of footprint source, own-undefined manager
 * user and startup/SQL actor attribution. No native clock or writer is issued. */
import { types } from "node:util";
import { sha256Json } from "./core.ts";
import { CURRENT_FOOTPRINT_COPY_ACTOR_LIMITS, prepareCurrentFootprintCopyActorProjection,
  requireCurrentFootprintCopyActorProjection } from "./current-footprint-copy-actor-projection.ts";
import type { CurrentFootprintCopyActorProjection } from "./current-footprint-copy-actor-projection.ts";
import { requireCurrentFootprintCopyOwned } from "./current-footprint-copy-preparation-runtime.ts";
import type { CurrentFootprintCopyPreparation } from "./current-footprint-copy-preparation.ts";
import type { CurrentFootprintCopyStatePacket } from "./current-footprint-copy-state.ts";
import type { CurrentPcb209OriginalStartupActorObservation, CurrentPcb209WorkerStartupActorPacket } from "./current-pcb-209-worker-startup-actor.ts";
import { currentFootprintCopyPreparationOpeningMethods } from "./current-footprint-copy-preparation-opening.ts";
import type { CurrentFootprintCopyOpeningOwner, CurrentFootprintCopyOpeningResult } from "./current-pcb-209-worker-startup-opening.ts";
import type { CurrentPcbWorkerConstructionAssignments } from "./current-pcb-worker-construction-assignment.ts";

interface Source {
  readonly opening: CurrentFootprintCopyOpeningOwner;
  readonly result: CurrentFootprintCopyOpeningResult;
  readonly assignments: CurrentPcbWorkerConstructionAssignments;
  readonly state: CurrentFootprintCopyStatePacket;
  readonly actor: CurrentPcb209WorkerStartupActorPacket;
  readonly preparation: CurrentFootprintCopyPreparation;
}
type Copy = Awaited<ReturnType<typeof requireCurrentFootprintCopyOwned>>;
// Each reprove costs2 source +8 state +4 actor requests. Projection brackets
// Add two original actor checks of2 requests each. Requiring the completed
// Composition uses one reprove and one projection check. These counts apply
// Only after the existing source stage has qualified both footprint methods.
export const CURRENT_FOOTPRINT_COPY_ACTOR_PREPARATION_REQUESTS = 2 * (2 + 8 + 4) + 2 * 2;
export const CURRENT_FOOTPRINT_COPY_ACTOR_REPROOF_REQUESTS = 2 + 8 + 4 + 2;
export interface CurrentFootprintCopyActorPreparation extends Readonly<typeof CURRENT_FOOTPRINT_COPY_ACTOR_LIMITS> {
  readonly profile: "private.current-footprint-copy-owned-actor.v1";
  readonly ownedPreparationSha256: string;
  readonly actorProjectionSha256: string;
  readonly beforeSqlSha256: string;
  readonly originalOpeningRetained: true;
  readonly originalFootprintStateRetained: true;
  readonly originalActorCollectionRetained: true;
  readonly originalCompletedSqlRetained: true;
  readonly footprintCapturedUser: "own-undefined";
  readonly footprintDocheadUserOmitted: true;
  readonly completeCapacityReserved: false;
  readonly lifecyclePublicationVerified: false;
  readonly copyLaunchPurposeQualified: false;
}
interface Retained {
  readonly source: Source;
  readonly copy: Copy;
  readonly observation: CurrentPcb209OriginalStartupActorObservation;
  readonly projection: CurrentFootprintCopyActorProjection;
  failed: boolean;
}
const originals = new WeakMap<CurrentFootprintCopyActorPreparation, Retained>();
const consumed = new WeakSet<CurrentFootprintCopyPreparation>();
function need(condition: boolean, detail: string): asserts condition {
  if (!condition) { throw new Error(`CURRENT_FOOTPRINT_COPY_OWNED_ACTOR: ${detail}`); }
}
async function reprove(source: Source): Promise<Readonly<{ copy: Copy; observation: CurrentPcb209OriginalStartupActorObservation }>> {
  const methods = currentFootprintCopyPreparationOpeningMethods(source.opening);
  const copy = await requireCurrentFootprintCopyOwned(source.preparation, source.opening);
  currentFootprintCopyPreparationOpeningMethods(source.opening);
  await methods.requireFootprintState.call(source.opening, source.result, source.assignments, source.state);
  currentFootprintCopyPreparationOpeningMethods(source.opening);
  const observation = await methods.originalActorObservation.call(source.opening, source.result, source.assignments, source.actor);
  currentFootprintCopyPreparationOpeningMethods(source.opening);
  need(copy.copyPlan.source.projectUuid === source.state.identity.projectUuid &&
    copy.copyPlan.source.branchUuid === source.state.identity.branchUuid && copy.copyPlan.client === source.state.client &&
    copy.copyPlan.maximumTicket === source.state.maximumTicket && source.state.capturedUser === "own-undefined",
  "original copy and footprint state differ");
  return Object.freeze({ copy, observation });
}
function same(before: Copy, after: Copy): void {
  need(before.before === after.before && before.copyPlan === after.copyPlan && before.sourcePlan === after.sourcePlan &&
    before.nativeArguments === after.nativeArguments, "original preparation inputs changed");
}
export async function prepareCurrentFootprintCopyActorOwned(source: Source): Promise<CurrentFootprintCopyActorPreparation> {
  need(source !== null && typeof source === "object" && !types.isProxy(source) && Object.isFrozen(source) &&
    Object.getPrototypeOf(source) === Object.prototype, "fixed original source required");
  const keys = ["opening", "result", "assignments", "state", "actor", "preparation"];
  need(Reflect.ownKeys(source).length === keys.length && keys.every(key => {
    const field = Object.getOwnPropertyDescriptor(source, key);
    return field !== undefined && Object.hasOwn(field, "value");
  }), "exact original data references required");
  need(Object.values(source).every(value => value !== null && typeof value === "object" && !types.isProxy(value)), "original objects required");
  need(!consumed.has(source.preparation), "actor preparation consumed"); consumed.add(source.preparation);
  const first = await reprove(source);
  const projection = await prepareCurrentFootprintCopyActorProjection(first.observation, first.copy.before, source.state);
  const after = await reprove(source); same(first.copy, after.copy);
  need(after.observation.runner === first.observation.runner && after.observation.packet === first.observation.packet,
    "original actor observation changed");
  const token: CurrentFootprintCopyActorPreparation = Object.freeze({ profile: "private.current-footprint-copy-owned-actor.v1",
    ownedPreparationSha256: sha256Json(source.preparation), actorProjectionSha256: sha256Json(projection),
    beforeSqlSha256: first.copy.before.logicalSha256, originalOpeningRetained: true, originalFootprintStateRetained: true,
    originalActorCollectionRetained: true, originalCompletedSqlRetained: true,
    footprintCapturedUser: "own-undefined", footprintDocheadUserOmitted: true,
    completeCapacityReserved: false, lifecyclePublicationVerified: false, copyLaunchPurposeQualified: false,
    ...CURRENT_FOOTPRINT_COPY_ACTOR_LIMITS });
  originals.set(token, { source, copy: first.copy, observation: first.observation, projection, failed: false }); return token;
}
export async function requireCurrentFootprintCopyActorOwned(token: CurrentFootprintCopyActorPreparation,
  opening: CurrentFootprintCopyOpeningOwner): Promise<Readonly<{ copy: Copy; actor: CurrentFootprintCopyActorProjection }>> {
  const retained = originals.get(token);
  need(retained !== undefined && retained.source.opening === opening && !retained.failed, "original owned actor preparation required");
  try {
    const current = await reprove(retained.source); same(retained.copy, current.copy);
    need(current.observation.runner === retained.observation.runner && current.observation.packet === retained.observation.packet,
      "original actor observation changed");
    await requireCurrentFootprintCopyActorProjection(retained.projection, retained.observation, retained.copy.before);
    return Object.freeze({ copy: retained.copy, actor: retained.projection });
  } catch (error) { retained.failed = true; throw error; }
}
