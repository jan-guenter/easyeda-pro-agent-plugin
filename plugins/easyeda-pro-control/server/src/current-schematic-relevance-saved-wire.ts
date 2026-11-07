/** Fixed early actor exclusion for the new schematic reader. No cache/opening
 * or original writer vocabulary is accepted here. */
import { CURRENT_PCB_VIA_SAVED_READBACK_ACTOR_PARAMS as PARAMS } from "./current-pcb-via-saved-cache-wire.ts";

export type CurrentSchematicRelevanceSavedEarlyStage = "before" | "arm" | "after";
export function currentSchematicRelevanceSavedEarlyWire(id: number, stage: CurrentSchematicRelevanceSavedEarlyStage): Readonly<{
  id: number; method: "Target.getTargets" | "Target.setAutoAttach"; params?: typeof PARAMS; schematicSavedEarlyActors: CurrentSchematicRelevanceSavedEarlyStage;
}> {
  if (id !== ["before", "arm", "after"].indexOf(stage) + 1) { throw new Error("SCHEMATIC_SAVED_EARLY_WIRE"); }
  return Object.freeze(stage === "arm" ? { id, method: "Target.setAutoAttach", params: PARAMS, schematicSavedEarlyActors: stage } :
    { id, method: "Target.getTargets", schematicSavedEarlyActors: stage });
}
export function currentSchematicRelevanceSavedEarlyFrame(chunk: Buffer, stage: CurrentSchematicRelevanceSavedEarlyStage): Readonly<Record<string, string | number>> {
  const id = ["before", "arm", "after"].indexOf(stage) + 1;
  if (chunk.length > 1024 || chunk.toString("utf8") !== `${JSON.stringify(currentSchematicRelevanceSavedEarlyWire(id, stage))}\0`) { throw new Error("SCHEMATIC_SAVED_EARLY_FRAME"); }
  return Object.freeze({ action: "schematic-saved-early-actors", requestId: id, earlyStage: stage });
}
