/** Dormant, supplied-data String-create plan/result relations. This is not an
 * owner, dispatch ticket, live observer or evidence issuer. No runtime imports it. */
import { types } from "node:util";
import { z } from "zod";
import { sha256Json } from "./core.ts";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { currentPcbLayersRequestSchema } from "./current-pcb-layers.ts";
import { compareCurrentPcbStringCreateBody } from "./current-pcb-string-create.ts";
import type { CurrentPcbStringCreateCandidate } from "./current-pcb-string-create.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_STRING_CREATE_RESULT_MAX_BYTES = 8192;
const LIMITS = Object.freeze({ liveExecutionVerified: false, originalNativeIdVerified: false,
  liveReceiverVerified: false, emptyRootPcbVerified: false, sourceOwnershipVerified: false,
  nativeModelVerified: false, completeLiveBaselineVerified: false, completeStoredBaselineVerified: false,
  queueCompletionVerified: false, completeEffectVerified: false, renderingVerified: false,
  persistenceVerified: false, repeatAcrossInvocationsPrevented: false,
  writerSupported: false, executionAuthorized: false } as const);
const targetSchema = currentPcbLayersRequestSchema.shape.target.refine(value =>
  [32, 64].includes(value.projectUuid.length) && value.branchUuid.length === 32 && [16, 32].includes(value.documentUuid.length),
"Exact hexadecimal identity lengths are required.");
type Target = Readonly<z.infer<typeof targetSchema>>;
type ExposedScalars = Omit<CurrentPcbStringCreateCandidate["expectedModelScalars"], "type" | "modelType" | "zIndex">;

function need(value: boolean, detail: string): asserts value {
  if (!value) { throw new Error(`Dormant PCB String create observation: ${detail}.`); }
}
function ownRecord(input: unknown, keys: readonly string[]): Record<string, unknown> {
  need(input !== null && typeof input === "object" && !types.isProxy(input), "own-data object required");
  const prototype: unknown = Object.getPrototypeOf(input);
  need(prototype === Object.prototype || prototype === null, "plain object required");
  const actual = Reflect.ownKeys(input);
  need(actual.length === keys.length && actual.every(key => typeof key === "string" && keys.includes(key)), "exact fields required");
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && descriptor.enumerable === true, "own enumerable data required");
    result[key] = descriptor.value as unknown;
  }
  return result;
}
function originalCandidate(candidate: CurrentPcbStringCreateCandidate): void {
  need(candidate !== null && typeof candidate === "object" && !types.isProxy(candidate), "original candidate required");
  const descriptor = Object.getOwnPropertyDescriptor(candidate, "expectedBodyText");
  need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "original candidate required");
  // The existing comparator checks its private WeakSet before consuming bytes.
  // A copied candidate, accessor or proxy never becomes an accepted intent.
  compareCurrentPcbStringCreateBody(candidate, descriptor.value as unknown);
}

export interface CurrentPcbStringCreateObservationPlan extends Readonly<typeof LIMITS> {
  readonly profile: "private.current-pcb-string-create-observation-plan.v1";
  readonly dormant: true;
  readonly planSha256: string;
  readonly requestSha256: string;
  readonly expectedBodySha256: string;
  readonly target: Target;
  readonly candidateArguments: CurrentPcbStringCreateCandidate["candidateArguments"];
  readonly expectedExposedScalars: ExposedScalars;
}
const plans = new WeakSet<CurrentPcbStringCreateObservationPlan>();

/** Bind an original pure candidate to a caller-supplied target only. The target
 * has not been observed or authorized. An empty String list is not an empty PCB. */
export function planCurrentPcbStringCreateObservation(candidate: CurrentPcbStringCreateCandidate, target: unknown): CurrentPcbStringCreateObservationPlan {
  originalCandidate(candidate);
  const parsedTarget = targetSchema.parse(ownRecord(target, ["projectUuid", "branchUuid", "documentUuid", "tabId"]));
  const model = candidate.expectedModelScalars;
  // Native yr.toJSON@7384285 omits partition/group/zIndex/type and model ownership.
  // Compare raw exposed scalars; no SDK rounding, null/color equivalence or
  // Reconstruction of those hidden fields is admitted by this projection.
  const expectedExposedScalars: ExposedScalars = { layerId: model.layerId, key: model.key, showKey: model.showKey,
    value: model.value, showValue: model.showValue, fontFamily: model.fontFamily, fontSize: model.fontSize,
    strokeWidth: model.strokeWidth, position: model.position, origin: model.origin, rotation: model.rotation,
    reverse: model.reverse, reverseExpansion: model.reverseExpansion, mirror: model.mirror, locked: model.locked,
    positionIsNull: model.positionIsNull, silkColor: model.silkColor };
  const data = { requestSha256: candidate.requestSha256, expectedBodySha256: candidate.expectedBodySha256,
    target: parsedTarget, candidateArguments: candidate.candidateArguments, expectedExposedScalars };
  const plan: CurrentPcbStringCreateObservationPlan = freezeDeep({ profile: "private.current-pcb-string-create-observation-plan.v1",
    dormant: true, planSha256: sha256Json(data), ...data, ...LIMITS });
  plans.add(plan); return plan;
}

/** Original inert plan identity only, deliberately not a lifecycle capability. */
export function requireOriginalCurrentPcbStringCreateObservationPlan(plan: CurrentPcbStringCreateObservationPlan): CurrentPcbStringCreateObservationPlan {
  need(plans.has(plan), "original dormant plan required"); return plan;
}

const sampleCount = z.number().int().min(0).max(2).refine(value => !Object.is(value, -0));
const primitiveId = z.string().length(16).regex(/^[a-f0-9]{16}$/u);
const resultSchema = z.object({ profile: z.literal("private.current-pcb-string-create-dormant-result.v1"),
  planSha256: z.string().length(64).regex(/^[a-f0-9]{64}$/u), completed: z.boolean(),
  stage: z.enum(["setup", "before-first", "before-second", "create", "after-first", "after-second", "final-check", "cleanup", "complete"]),
  dispatchAttempts: z.union([z.literal(0), z.literal(1)]), acknowledgedPrimitiveId: primitiveId.nullable(),
  matchingBeforeSamples: sampleCount, matchingAfterSamples: sampleCount,
  readback: z.record(z.string(), z.unknown()).nullable(), deadlineExpired: z.boolean() }).strict();

/** Decode only bounded JSON supplied by the caller. Even a complete matching
 * synthetic result is not evidence of live execution, ownership or persistence. */
export function compareCurrentPcbStringCreateObservation(plan: CurrentPcbStringCreateObservationPlan, suppliedJson: unknown):
  Readonly<z.infer<typeof resultSchema> & typeof LIMITS & { suppliedResultMatchesContract: true }> {
  requireOriginalCurrentPcbStringCreateObservationPlan(plan);
  need(typeof suppliedJson === "string" && suppliedJson.isWellFormed() && suppliedJson.length <= CURRENT_PCB_STRING_CREATE_RESULT_MAX_BYTES &&
    Buffer.byteLength(suppliedJson) <= CURRENT_PCB_STRING_CREATE_RESULT_MAX_BYTES, "bounded JSON result required");
  const parsed = decodeCurrentPcbDiagnosticJson(Buffer.from(suppliedJson));
  const result = resultSchema.parse(parsed);
  need(result.planSha256 === plan.planSha256 && !Object.is(result.dispatchAttempts, -0), "plan binding differs");
  const acknowledged = result.acknowledgedPrimitiveId !== null, dispatched = result.dispatchAttempts === 1;
  need(!dispatched || result.matchingBeforeSamples === 2, "dispatch before two empty samples");
  need(!acknowledged || dispatched, "acknowledgment without dispatch");
  need(result.matchingAfterSamples === 0 || acknowledged, "readback without acknowledgment");
  need((result.readback !== null) === (result.matchingAfterSamples > 0), "readback sample relation differs");
  if (result.readback !== null) {
    const expected = { globalIndex: result.acknowledgedPrimitiveId, ...plan.expectedExposedScalars };
    // Preserve key order and scalar identity, including signed zero. This is a
    // Projection format, not native source order or the exact body comparator.
    need(JSON.stringify(Object.keys(result.readback)) === JSON.stringify(Object.keys(expected)), "readback projection keys differ");
    for (const [key, value] of Object.entries(expected)) {
      const actual = result.readback[key];
      if (key === "position") {
        const point = ownRecord(actual, ["x", "y"]);
        need(actual !== null && typeof actual === "object", "readback position required");
        need(JSON.stringify(Object.keys(actual)) === '["x","y"]' && Object.is(point["x"], plan.expectedExposedScalars.position.x) &&
          Object.is(point["y"], plan.expectedExposedScalars.position.y), "exact readback position differs");
      } else { need(Object.is(actual, value), "exact readback scalar differs"); }
    }
  }
  need(!result.completed || (result.stage === "complete" && !result.deadlineExpired && dispatched && acknowledged &&
    result.matchingBeforeSamples === 2 && result.matchingAfterSamples === 2), "completion relation differs");
  need(result.completed || result.stage !== "complete", "incomplete result marked complete");
  const counts = { setup: [0, 0], "before-first": [0, 0], "before-second": [1, 0], create: [2, 0],
    "after-first": [2, 0], "after-second": [2, 1], "final-check": [2, 2], complete: [2, 2] } as const;
  if (result.stage !== "cleanup") {
    const [before, after] = counts[result.stage];
    need(result.matchingBeforeSamples === before && result.matchingAfterSamples === after, "stage sample counts differ");
    need(!["setup", "before-first", "before-second"].includes(result.stage) || !dispatched, "early stage dispatched");
    need(!["after-first", "after-second", "final-check", "complete"].includes(result.stage) || acknowledged, "post-create stage lacks acknowledgment");
  }
  return freezeDeep({ ...result, suppliedResultMatchesContract: true, ...LIMITS } as const);
}
