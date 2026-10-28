/** Compose retained source, producer and actor owners for the copy lifecycle.
 * Inputs and native arrays remain private; a serialized journal is not a permit. */
import { types } from "node:util";
import { sha256Json } from "./core.ts";
import { currentFootprintCopyBindingsSchema } from "./current-footprint-copy-bindings.ts";
import type { CurrentFootprintCopyBindings } from "./current-footprint-copy-bindings.ts";
import { prepareCurrentFootprintCopyActorOwned, requireCurrentFootprintCopyActorOwned } from "./current-footprint-copy-actor-preparation.ts";
import type { CurrentFootprintCopyActorPreparation } from "./current-footprint-copy-actor-preparation.ts";
import type { CurrentFootprintCopyProducerObservation } from "./current-footprint-copy-producer-runner.ts";
import { currentFootprintCopyPreparationOpeningMethods } from "./current-footprint-copy-preparation-opening.ts";
import type { CurrentFootprintCopyOpeningOwner } from "./current-pcb-209-worker-startup-opening.ts";

type Source = Parameters<typeof prepareCurrentFootprintCopyActorOwned>[0];
interface Retained {
  readonly source: Source;
  readonly actor: CurrentFootprintCopyActorPreparation;
  readonly producers: CurrentFootprintCopyProducerObservation;
  failed: boolean;
}
const originals = new WeakMap<CurrentFootprintCopyBindings, Retained>();
const consumed = new WeakSet<Source["preparation"]>();
function need(condition: boolean, detail: string): asserts condition {
  if (!condition) { throw new Error(`CURRENT_FOOTPRINT_COPY_BINDINGS: ${detail}`); }
}
function original(source: Source): void {
  need(source !== null && typeof source === "object" && !types.isProxy(source) && Object.isFrozen(source) &&
    Object.getPrototypeOf(source) === Object.prototype, "fixed original source required");
  const keys = ["opening", "result", "assignments", "state", "actor", "preparation"];
  need(Reflect.ownKeys(source).length === keys.length && keys.every(key => {
    const field = Object.getOwnPropertyDescriptor(source, key);
    return field !== undefined && Object.hasOwn(field, "value") && field.enumerable === true;
  }), "exact original data references required");
  need(Object.values(source).every(value => value !== null && typeof value === "object" && !types.isProxy(value)), "original objects required");
}
async function reprove(retained: Retained): Promise<Awaited<ReturnType<typeof requireCurrentFootprintCopyActorOwned>>> {
  const source = retained.source;
  const methods = currentFootprintCopyPreparationOpeningMethods(source.opening);
  const actor = await requireCurrentFootprintCopyActorOwned(retained.actor, source.opening);
  currentFootprintCopyPreparationOpeningMethods(source.opening);
  await methods.requireFootprintProducers.call(source.opening, source.result, source.assignments, source.state, retained.producers);
  currentFootprintCopyPreparationOpeningMethods(source.opening);
  return actor;
}
/** This stage needs97 separately reserved requests. It cannot widen a startup
 * owner or allocate a native generation; the lifecycle publishes intent first. */
export async function prepareCurrentFootprintCopyBindingsOwned(source: Source): Promise<CurrentFootprintCopyBindings> {
  original(source); const methods = currentFootprintCopyPreparationOpeningMethods(source.opening);
  need(!consumed.has(source.preparation), "bindings preparation consumed"); consumed.add(source.preparation);
  const producers = await methods.observeFootprintProducers.call(source.opening, source.result, source.assignments, source.state);
  currentFootprintCopyPreparationOpeningMethods(source.opening);
  const actor = await prepareCurrentFootprintCopyActorOwned(source);
  currentFootprintCopyPreparationOpeningMethods(source.opening);
  const retained: Retained = { source, actor, producers, failed: false };
  const current = await reprove(retained);
  const token = Object.freeze(currentFootprintCopyBindingsSchema.parse({ profile: "private.current-footprint-copy-owned-bindings.v1",
    sourcePreparationSha256: sha256Json(source.preparation), actorPacketSha256: sha256Json(source.actor),
    actorPreparationSha256: sha256Json(actor), producerObservationSha256: sha256Json(producers),
    beforeSqlSha256: current.copy.before.logicalSha256, originalOpeningRetained: true, originalProducerObservationRetained: true,
    originalActorPreparationRetained: true, methodCount: producers.methodCount, lexicalFunctionCount: producers.lexicalFunctionCount,
    footprintCapturedUser: actor.footprintCapturedUser, footprintDocheadUserOmitted: actor.footprintDocheadUserOmitted,
    parserAndUploadCallbacksBound: false, transitiveProducerClosuresBound: false, uiSourceRouteBound: false,
    clockProvenanceVerified: false, executionAuthorized: false, persistenceVerified: false }));
  originals.set(token, retained); return token;
}
/** Reuses the original24-request composition without recreating either owner. */
export async function requireCurrentFootprintCopyBindingsOwned(token: CurrentFootprintCopyBindings,
  opening: CurrentFootprintCopyOpeningOwner): Promise<Awaited<ReturnType<typeof requireCurrentFootprintCopyActorOwned>>> {
  const retained = originals.get(token);
  need(retained !== undefined && retained.source.opening === opening && !retained.failed, "original owned bindings required");
  try { return await reprove(retained); }
  catch (error) { retained.failed = true; throw error; }
}

/** Retrieve the original reference for another bounded observation. This proves
 * token ownership only; the receiving opening must reprove current producers. */
export function retainedCurrentFootprintCopyBindingsProducers(token: CurrentFootprintCopyBindings,
  opening: CurrentFootprintCopyOpeningOwner): CurrentFootprintCopyProducerObservation {
  const retained = originals.get(token);
  need(retained !== undefined && retained.source.opening === opening && !retained.failed, "original owned bindings required");
  currentFootprintCopyPreparationOpeningMethods(opening); return retained.producers;
}
