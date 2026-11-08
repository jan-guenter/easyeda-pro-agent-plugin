/** Original closed seven-record preparation only. No native allocation,
 * mutation, Save or completion authority is issued by this data plan. */
import { currentSchematicRelevanceDisplayWriteRequestSchema } from "./current-schematic-relevance-display-write-contract.ts";
import { buildGeneratedSchematicRelevanceDisplayNativeArguments, requireOriginalGeneratedSchematicRelevanceDisplayNativeArguments } from "./generated-schematic-relevance-display-source.ts";
import type { GeneratedSchematicRelevanceDisplayNativeArguments } from "./generated-schematic-relevance-display-source.ts";
import { assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint, verifyGeneratedSchematicRelevanceFixtureOpenCheckpoint } from "./managed-schematic-relevance-fixture-open-checkpoint.ts";
import type { GeneratedSchematicRelevanceFixtureOpenCheckpoint } from "./managed-schematic-relevance-fixture-open-checkpoint.ts";

export interface CurrentSchematicRelevanceDisplayWritePlan {
  readonly profile: "private.current-schematic-relevance-display-write-plan.v1";
  readonly operationId: string; readonly executionAuthorized: false;
}
interface Original {
  readonly prepared: GeneratedSchematicRelevanceFixtureOpenCheckpoint;
  readonly argumentsValue: GeneratedSchematicRelevanceDisplayNativeArguments;
  readonly request: Readonly<ReturnType<typeof currentSchematicRelevanceDisplayWriteRequestSchema.parse>>;
}
const issued = new WeakMap<CurrentSchematicRelevanceDisplayWritePlan, Original>();
export async function prepareCurrentSchematicRelevanceDisplayWritePlan(prepared: GeneratedSchematicRelevanceFixtureOpenCheckpoint, input: unknown): Promise<CurrentSchematicRelevanceDisplayWritePlan> {
  assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint(prepared);
  const request = currentSchematicRelevanceDisplayWriteRequestSchema.parse(input);
  const argumentsValue = buildGeneratedSchematicRelevanceDisplayNativeArguments(prepared, request.operationId, request.patch);
  requireOriginalGeneratedSchematicRelevanceDisplayNativeArguments(argumentsValue, prepared);
  await verifyGeneratedSchematicRelevanceFixtureOpenCheckpoint(prepared);
  assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint(prepared); requireOriginalGeneratedSchematicRelevanceDisplayNativeArguments(argumentsValue, prepared);
  Object.freeze(request.patch); Object.freeze(request);
  const plan: CurrentSchematicRelevanceDisplayWritePlan = Object.freeze({ profile: "private.current-schematic-relevance-display-write-plan.v1", operationId: request.operationId, executionAuthorized: false });
  issued.set(plan, Object.freeze({ prepared, argumentsValue, request })); return plan;
}
export function requireOriginalCurrentSchematicRelevanceDisplayWritePlan(plan: CurrentSchematicRelevanceDisplayWritePlan): Original {
  const original = issued.get(plan);
  if (original === undefined) { throw new Error("SCHEMATIC_RELEVANCE_WRITE_ORIGINAL_PLAN"); }
  assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint(original.prepared);
  requireOriginalGeneratedSchematicRelevanceDisplayNativeArguments(original.argumentsValue, original.prepared);
  if (plan.operationId !== original.request.operationId || original.argumentsValue.operation.operationId !== plan.operationId) { throw new Error("SCHEMATIC_RELEVANCE_WRITE_PLAN_CHANGED"); }
  return original;
}
