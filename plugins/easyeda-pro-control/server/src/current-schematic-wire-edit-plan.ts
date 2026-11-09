/** Original generated fixture preparation only. A serialized plan cannot
 * select an owner, issue an action or authorize a native Save or reopen. */
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { buildGeneratedSchematicWireEditNativeArguments, generatedSchematicWireEditRequestSchema, requireOriginalGeneratedSchematicWireEditNativeArguments } from "./generated-schematic-wire-edit.ts";
import type { GeneratedSchematicWireEditNativeArguments, GeneratedSchematicWireEditRequest } from "./generated-schematic-wire-edit.ts";
import { assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint, verifyGeneratedSchematicRelevanceFixtureOpenCheckpoint } from "./managed-schematic-relevance-fixture-open-checkpoint.ts";
import type { GeneratedSchematicRelevanceFixtureOpenCheckpoint } from "./managed-schematic-relevance-fixture-open-checkpoint.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface CurrentSchematicWireEditPlan {
  readonly profile: "private.current-schematic-wire-edit-plan.v1"; readonly operationId: string;
  readonly executionAuthorized: false; readonly saveAuthorized: false;
}
interface Original {
  readonly prepared: GeneratedSchematicRelevanceFixtureOpenCheckpoint; readonly argumentsValue: GeneratedSchematicWireEditNativeArguments;
  readonly request: GeneratedSchematicWireEditRequest;
}
interface Attempt { readonly text: string; readonly promise: Promise<CurrentSchematicWireEditPlan> }
const attempts = new WeakMap<GeneratedSchematicRelevanceFixtureOpenCheckpoint, Map<string, Attempt>>();
const issued = new WeakMap<CurrentSchematicWireEditPlan, Original>();
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_WIRE_EDIT_ORIGINAL_PLAN"); } }
/** The original preparation and failure Promise stay bound to this exact
 * request. A changed request cannot replace a consumed operation ID. */
export function prepareCurrentSchematicWireEditPlan(prepared: GeneratedSchematicRelevanceFixtureOpenCheckpoint, input: unknown): Promise<CurrentSchematicWireEditPlan> {
  assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint(prepared);
  const request = freezeDeep(generatedSchematicWireEditRequestSchema.parse(captureCurrentPcbStringClockReply(input).value)), text = canonicalJson(request);
  let roster = attempts.get(prepared); if (roster === undefined) { roster = new Map(); attempts.set(prepared, roster); }
  const prior = roster.get(request.operationId); if (prior !== undefined) { need(prior.text === text); return prior.promise; }
  const promise = (async (): Promise<CurrentSchematicWireEditPlan> => {
    const argumentsValue = buildGeneratedSchematicWireEditNativeArguments(prepared, request);
    requireOriginalGeneratedSchematicWireEditNativeArguments(argumentsValue, prepared);
    await verifyGeneratedSchematicRelevanceFixtureOpenCheckpoint(prepared);
    assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint(prepared); requireOriginalGeneratedSchematicWireEditNativeArguments(argumentsValue, prepared);
    const plan: CurrentSchematicWireEditPlan = Object.freeze({ profile: "private.current-schematic-wire-edit-plan.v1", operationId: request.operationId, executionAuthorized: false, saveAuthorized: false });
    issued.set(plan, Object.freeze({ prepared, argumentsValue, request })); return plan;
  })(); roster.set(request.operationId, Object.freeze({ text, promise })); return promise;
}
export function requireOriginalCurrentSchematicWireEditPlan(plan: CurrentSchematicWireEditPlan): Original {
  const original = issued.get(plan); need(original !== undefined);
  assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint(original.prepared);
  requireOriginalGeneratedSchematicWireEditNativeArguments(original.argumentsValue, original.prepared);
  need(plan.operationId === original.request.operationId && plan.operationId === original.argumentsValue.operation.operationId); return original;
}
