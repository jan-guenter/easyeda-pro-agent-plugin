/** One original fresh-reader sequence. No caller code, target, handle, sender
 * table or historical writer can select this controller's native requests. */
import { compareGeneratedSchematicRelevanceSavedSourceData } from "./generated-schematic-relevance-display-effect-data.ts";
import { types } from "node:util";
import { requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan } from "./generated-schematic-relevance-saved-readback-plan.ts";
import { decodeCurrentSchematicRelevanceSavedSceneCapture, decodeCurrentSchematicRelevanceSavedSceneReply, requireCurrentSchematicRelevanceSavedSceneRelease } from "./current-schematic-relevance-saved-scene-replies.ts";
import type { CurrentSchematicRelevanceSavedSceneReply } from "./current-schematic-relevance-saved-scene-replies.ts";
import type { CurrentSchematicRelevanceSavedSceneOrigin } from "./current-schematic-relevance-saved-scene-origin.ts";
import type { CurrentSchematicRelevanceSavedReadbackOwner } from "./current-schematic-relevance-saved-readback-owner.ts";

export interface CurrentSchematicRelevanceSavedSceneObservation { readonly profile: "private.current-schematic-relevance-saved-scene-observation.v1" }
interface Original {
  readonly owner: CurrentSchematicRelevanceSavedReadbackOwner;
  readonly origin: CurrentSchematicRelevanceSavedSceneOrigin;
  readonly reply: Readonly<CurrentSchematicRelevanceSavedSceneReply>;
  readonly projection: ReturnType<typeof compareGeneratedSchematicRelevanceSavedSourceData>;
}
const attempts = new WeakMap<CurrentSchematicRelevanceSavedSceneOrigin, Readonly<{ owner: CurrentSchematicRelevanceSavedReadbackOwner; promise: Promise<CurrentSchematicRelevanceSavedSceneObservation> }>>();
const observations = new WeakMap<CurrentSchematicRelevanceSavedSceneObservation, Readonly<Original>>();
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_SAVED_SCENE_ORIGINAL"); } }
function reference(input: unknown): boolean { return input !== null && typeof input === "object" && !types.isProxy(input); }

export function observeOriginalCurrentSchematicRelevanceSavedScene(owner: CurrentSchematicRelevanceSavedReadbackOwner, origin: CurrentSchematicRelevanceSavedSceneOrigin): Promise<CurrentSchematicRelevanceSavedSceneObservation> {
  if (!reference(owner) || !reference(origin)) { return Promise.reject(new Error("SCHEMATIC_SAVED_SCENE_ORIGINAL_REFERENCE")); }
  const prior = attempts.get(origin); if (prior !== undefined) { need(prior.owner === owner); return prior.promise; }
  const promise = (async (): Promise<CurrentSchematicRelevanceSavedSceneObservation> => {
    // Literal lazy import avoids an eager native-Core/readonly-controller cycle.
    const namespace = await import("./current-pcb-diagnostic-owner.ts");
    const lookup = namespace.requireOriginalCurrentSchematicRelevanceSavedSceneOrigin, send = namespace.sendOriginalCurrentSchematicRelevanceSavedScene;
    const binding = lookup(origin, owner), plan = requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan(binding.prepared);
    const current = (): void => { need(namespace.requireOriginalCurrentSchematicRelevanceSavedSceneOrigin === lookup && namespace.sendOriginalCurrentSchematicRelevanceSavedScene === send &&
      lookup(origin, owner) === binding && requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan(binding.prepared).closed === plan.closed); };
    const reprove = async (): Promise<void> => { current(); await binding.assertCurrent(); current(); };
    await reprove(); let captured = false; let failed = false; let failure: unknown; let reply: Readonly<CurrentSchematicRelevanceSavedSceneReply> | null = null;
    try {
      captured = true; decodeCurrentSchematicRelevanceSavedSceneCapture(await send(owner, origin, 0, "capture")); await reprove();
      reply = decodeCurrentSchematicRelevanceSavedSceneReply(await send(owner, origin, 1, "observe"), binding.windowTabId); await reprove();
    } catch (caughtError) { failed = true; failure = caughtError; }
    if (captured) {
      // One cleanup attempt, even when a capture/read acknowledgment was lost.
      // Core retains its original session and group; no lost context is adopted.
      try { requireCurrentSchematicRelevanceSavedSceneRelease(await send(owner, origin, 2, "release")); }
      catch (releaseError) { throw new AggregateError(failed ? [failure, releaseError] : [releaseError], failed ? "SCHEMATIC_SAVED_SCENE_READ_AND_RELEASE" : "SCHEMATIC_SAVED_SCENE_RELEASE", { cause: releaseError }); }
    }
    if (failed) { throw new AggregateError([failure], "SCHEMATIC_SAVED_SCENE_READ"); } need(reply !== null); await reprove();
    const projection = compareGeneratedSchematicRelevanceSavedSourceData(plan.closed.args, reply.source); current();
    const observed: CurrentSchematicRelevanceSavedSceneObservation = Object.freeze({ profile: "private.current-schematic-relevance-saved-scene-observation.v1" });
    observations.set(observed, Object.freeze({ owner, origin, reply, projection })); return observed;
  })(); attempts.set(origin, Object.freeze({ owner, promise })); return promise;
}
/** Original observation custody only. Projection fields retain their separate
 * false cold-load/persistence/reopened flags; no flag promotes those facts. */
export function requireOriginalCurrentSchematicRelevanceSavedSceneObservation(observation: CurrentSchematicRelevanceSavedSceneObservation,
  owner: CurrentSchematicRelevanceSavedReadbackOwner, origin: CurrentSchematicRelevanceSavedSceneOrigin): Readonly<Original> {
  const original = observations.get(observation); need(original !== undefined && original.owner === owner && original.origin === origin); return original;
}
