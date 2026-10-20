/** Pure first-String effect relation. Supplied raw replies, a dormant create
 * result and one publication are compared together; no live owner is issued. */
import { types } from "node:util";
import { canonicalJson, sha256Text } from "./core.ts";
import { decodeCurrentPcbDiagnosticRawStringsReply } from "./current-pcb-diagnostic-raw-strings.ts";
import type { CurrentPcbDiagnosticRawStrings } from "./current-pcb-diagnostic-raw-strings.ts";
import { compareCurrentPcbStringCreateBody } from "./current-pcb-string-create.ts";
import type { CurrentPcbStringCreateCandidate } from "./current-pcb-string-create.ts";
import { compareCurrentPcbStringCreateObservation } from "./current-pcb-string-create-observation.ts";
import type { CurrentPcbStringCreateObservationPlan } from "./current-pcb-string-create-observation.ts";
import { compareCurrentPcbStringDefaultGeometry } from "./current-pcb-string-default-geometry.ts";
import { compareCurrentPcbStringPublication } from "./current-pcb-string-publication.ts";
import type { CurrentPcbStringPublicationPlan } from "./current-pcb-string-publication.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const LIMITS = Object.freeze({
  liveObservationVerified: false, originalNativeIdVerified: false, originalScopeVerified: false,
  nativeReceiverVerified: false, sourceOwnershipVerified: false, emptyRootPcbVerified: false,
  completeModelMembershipVerified: false, completeGeometryVerified: false,
  completeLiveBaselineVerified: false, completeStoredBaselineVerified: false,
  producerOwnershipVerified: false, workerDeliveryVerified: false, completeIntervalVerified: false,
  queueCompletionVerified: false, completeEffectVerified: false, nativeSaveEffectVerified: false,
  persistenceVerified: false, renderingVerified: false, repeatAcrossInvocationsPrevented: false,
  connectedValidation: false, writerSupported: false, executionAuthorized: false,
} as const);
const REMAINING = Object.freeze([
  "Retain the original renderer and joined project-worker owner, complete source and stored baselines, and the fresh no-interaction history.",
  "Account for every non-String model, secondary index, shared compiler, Save participant and extension subscriber.",
  "Observe the complete publication interval and asynchronous command, teardrop and worker effects; one matching batch proves none of these.",
  "Bind the actual default glyph table and qualify raw data-state flags/outlines; a source-predicted box is not native settling or visual proof.",
  "Consume one durable create intent and one Save intent, preserve ambiguous results without retry, then prove complete closed SQL and fresh reopened content.",
] as const);
const INPUT_FIELDS = ["createResultJson", "beforeFirst", "beforeSecond", "afterFirst", "afterSecond", "publication"] as const;
type InputField = typeof INPUT_FIELDS[number];
type RawModel = CurrentPcbDiagnosticRawStrings["models"][number];

function need(value: boolean, message: string): asserts value {
  if (!value) { throw new Error(`Current PCB String post-create relation: ${message}.`); }
}
function inputFields(input: unknown): Readonly<Record<InputField, unknown>> {
  need(input !== null && typeof input === "object" && !types.isProxy(input), "plain supplied evidence required");
  const prototype: unknown = Object.getPrototypeOf(input);
  need(prototype === Object.prototype || prototype === null, "plain supplied evidence required");
  const keys = Reflect.ownKeys(input);
  need(keys.length === INPUT_FIELDS.length && keys.every(key =>
    typeof key === "string" && INPUT_FIELDS.some(field => field === key)), "exact evidence fields required");
  const result: Record<InputField, unknown> = { createResultJson: undefined, beforeFirst: undefined,
    beforeSecond: undefined, afterFirst: undefined, afterSecond: undefined, publication: undefined };
  for (const key of INPUT_FIELDS) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && descriptor.enumerable === true,
      "own enumerable evidence fields required");
    result[key] = descriptor.value as unknown;
  }
  return result;
}
function equal(value: unknown, expected: unknown, name: string): void {
  need(Object.is(value, expected), `${name} differs`);
}
function rawModelMatches(candidate: CurrentPcbStringCreateCandidate, model: RawModel, primitiveId: string): void {
  const expected = candidate.expectedModelScalars;
  equal(model.globalIndex, primitiveId, "native ID");
  // PCB217199c8 nP@3424326 has no constructor defaults for these own fields.
  // The first ungrouped String leaves them absent. Its native getters project
  // ZIndex=-1, partition="" and an undefined group ID; the STRING body encoder
  // Supplies groupId=0. Do not admit explicit null/undefined/zero as equivalent
  // Raw storage, or accidentally treat _zIndex=0 as -1.
  for (const key of ["zIndex", "partition", "groupId", "parent", "number"] as const) {
    need(model[key].kind === "absent", `fresh ${key} marker differs`);
  }
  equal(model.modelType, expected.modelType, "model type");
  equal(model.key, expected.key, "key"); equal(model.value, expected.value, "text");
  equal(model.position.x, expected.position.x, "position x");
  equal(model.position.y, expected.position.y, "position y");
  equal(model.rotation, expected.rotation, "rotation"); equal(model.matrixChange, false, "matrix-change flag");
  const { base } = model;
  // Native rd@3980353 selects U8 for visible text. F4.get increments its
  // Shared base count once; yr construction installs the reciprocal watcher.
  equal(base.kind, "U8", "visible base kind"); equal(base.num, 1, "base reference count");
  for (const key of ["type", "origin", "strokeWidth", "mirror", "showKey", "showValue", "fontFamily",
    "fontSize", "reverse", "reverseExpansion", "positionIsNull"] as const) {
    equal(base[key], expected[key], `base ${key}`);
  }
  need(base.layerId.kind === "absent" && base.locked.kind === "absent", "visible base carries space-only fields");
  need(base.silkColor.kind === "value", "raw color missing");
  const { r, g, b, alpha } = base.silkColor.value;
  need(Object.is(r, 0) && Object.is(g, 0) && Object.is(b, 0) && Object.is(alpha, 1), "raw color differs");
  need(model.box.kind === "value", "visible String box missing");
  equal(model.box.value.layerId, expected.layerId, "box layer");
  equal(model.box.value.locked, expected.locked, "box lock");
  need(model.stateWatcher.kind === "value" && model.stateWatcher.value === "reciprocal-yr", "reciprocal String view missing");
  // A separate source-derived comparator checks the complete default-font box.
  // DataState and outlines remain unmodeled; equal samples are not settling.
}
function rawPair(first: unknown, second: unknown, documentUuid: string, count: 0 | 1):
  Readonly<{ sample: CurrentPcbDiagnosticRawStrings; sha256: string }> {
  const a = decodeCurrentPcbDiagnosticRawStringsReply(first), b = decodeCurrentPcbDiagnosticRawStringsReply(second);
  need(a.documentUuid === documentUuid && b.documentUuid === documentUuid, "raw sample document differs");
  need(a.managerModelCount === count && b.managerModelCount === count, "raw String manager count differs");
  const text = canonicalJson(a);
  need(text === canonicalJson(b), "supplied raw sample pair differs");
  return { sample: a, sha256: sha256Text(text) };
}

export interface CurrentPcbStringPostCreateRelation extends Readonly<typeof LIMITS> {
  readonly profile: "private.current-pcb-string-postcreate-relation.v1";
  readonly stage: "supplied-first-string-effect-only";
  readonly suppliedCreateRawPublicationRelationMatches: true;
  readonly requestSha256: string;
  readonly createPlanSha256: string;
  readonly publicationPlanSha256: string;
  readonly primitiveId: string;
  readonly documentUuid: string;
  readonly expectedTicket: number;
  readonly beforeStringCount: 0;
  readonly afterStringCount: 1;
  readonly createResultProjectionSha256: string;
  readonly beforeRawModelProjectionSha256: string;
  readonly afterRawModelProjectionSha256: string;
  readonly publicationProjectionSha256: string;
  readonly boxPredictionSha256: string;
  readonly relationSha256: string;
  readonly remaining: typeof REMAINING;
}

/** Compose existing parsers rather than trusting summary booleans or an expected
 * body alone. All inputs are supplied data, even if their values are mutually
 * consistent. The absence of other String entries says nothing about other
 * manager families, publication intervals, storage or Save eligibility. */
export function compareCurrentPcbStringPostCreate(candidate: CurrentPcbStringCreateCandidate,
  createPlan: CurrentPcbStringCreateObservationPlan, publicationPlan: CurrentPcbStringPublicationPlan,
  supplied: unknown): CurrentPcbStringPostCreateRelation {
  const input = inputFields(supplied);
  // These comparators check private original-plan identity before reading plan
  // Fields. No copied plan, accessor or proxy is admitted as an original intent.
  const publication = compareCurrentPcbStringPublication(publicationPlan, input.publication);
  const create = compareCurrentPcbStringCreateObservation(createPlan, input.createResultJson);
  const body = publicationPlan.expectedPayload[0][publicationPlan.documentUuid]?.pend[0][3];
  compareCurrentPcbStringCreateBody(candidate, body);
  need(candidate.requestSha256 === createPlan.requestSha256 && candidate.expectedBodySha256 === createPlan.expectedBodySha256 &&
    publicationPlan.createPlanSha256 === createPlan.planSha256, "original plans differ");
  need(create.completed && create.acknowledgedPrimitiveId === publicationPlan.binding.primitiveId, "completed create ID differs");
  const { documentUuid } = createPlan.target;
  need(publicationPlan.documentUuid === documentUuid, "publication document differs");
  const before = rawPair(input.beforeFirst, input.beforeSecond, documentUuid, 0);
  const after = rawPair(input.afterFirst, input.afterSecond, documentUuid, 1);
  const model = after.sample.models[0];
  need(model !== undefined, "created String model missing");
  rawModelMatches(candidate, model, publicationPlan.binding.primitiveId);
  const geometry = compareCurrentPcbStringDefaultGeometry(candidate, input.afterFirst, model.globalIndex);
  const relation = {
    requestSha256: candidate.requestSha256, createPlanSha256: createPlan.planSha256,
    publicationPlanSha256: publicationPlan.planSha256, primitiveId: model.globalIndex, documentUuid,
    expectedTicket: publicationPlan.expectedTicket, beforeStringCount: 0, afterStringCount: 1,
    createResultProjectionSha256: sha256Text(canonicalJson(create)),
    beforeRawModelProjectionSha256: before.sha256, afterRawModelProjectionSha256: after.sha256,
    publicationProjectionSha256: publication.payloadProjectionSha256,
    boxPredictionSha256: geometry.expectedBoxProjectionSha256,
  } as const;
  return freezeDeep({ profile: "private.current-pcb-string-postcreate-relation.v1",
    stage: "supplied-first-string-effect-only", suppliedCreateRawPublicationRelationMatches: true,
    ...relation, relationSha256: sha256Text(canonicalJson(relation)), remaining: REMAINING, ...LIMITS });
}
