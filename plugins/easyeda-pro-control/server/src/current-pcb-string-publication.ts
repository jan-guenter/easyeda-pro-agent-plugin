/** Exact supplied-data relation for one native compiler String publication.
 * No bus subscription, receiver, observation token, dispatch or Save is added. */
import { types } from "node:util";
import { z } from "zod";
import { sha256Json, sha256Text } from "./core.ts";
import { compareCurrentPcbStringCreateBody } from "./current-pcb-string-create.ts";
import type { CurrentPcbStringCreateCandidate } from "./current-pcb-string-create.ts";
import { requireOriginalCurrentPcbStringCreateObservationPlan } from "./current-pcb-string-create-observation.ts";
import type { CurrentPcbStringCreateObservationPlan } from "./current-pcb-string-create-observation.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const MAX_PAYLOAD_BYTES = 8192;
const identifier = z.string().min(1).max(128).regex(/^[A-Za-z0-9_-]+$/u);
const bindingSchema = z.object({ primitiveId: z.string().regex(/^[a-f0-9]{16}$/u),
  client: z.string().regex(/^[a-f0-9]{16}$/u), uniqueId: identifier,
  maximumTicket: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER - 1).refine(value => !Object.is(value, -0)) }).strict();
const LIMITS = Object.freeze({ livePublicationVerified: false, originalNativeIdVerified: false,
  producerOwnershipVerified: false, workerDeliveryVerified: false, completeIntervalVerified: false,
  completeLiveBaselineVerified: false, completeStoredBaselineVerified: false, queueCompletionVerified: false,
  completeEffectVerified: false, persistenceVerified: false, writerSupported: false, executionAuthorized: false } as const);
type Binding = Readonly<z.infer<typeof bindingSchema>>;
type PendingRecord = readonly [primitiveId: string, ticket: number, type: "STRING", body: string];
type Publication = readonly [Readonly<Record<string, Readonly<{ type: "PCB"; pend: readonly [PendingRecord] }>>>,
  client: string, uniqueId: string, documentUuid: string];

function need(value: boolean, message: string): asserts value {
  if (!value) { throw new Error(`Current PCB String publication: ${message}.`); }
}
function plain(value: unknown): asserts value is object {
  need(value !== null && typeof value === "object" && !types.isProxy(value), "plain own data required");
  const prototype: unknown = Object.getPrototypeOf(value);
  need(prototype === Object.prototype || prototype === null, "plain own data required");
}
function field(value: object, key: string, enumerable = true): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && descriptor.enumerable === enumerable,
    "own data field required");
  return descriptor.value as unknown;
}
function object(value: unknown, keys: readonly string[]): Record<string, unknown> {
  plain(value);
  const actual = Reflect.ownKeys(value);
  need(actual.length === keys.length && actual.every(key => typeof key === "string" && keys.includes(key)), "object fields differ");
  return Object.fromEntries(keys.map(key => [key, field(value, key)]));
}
function array(value: unknown, length: number): readonly unknown[] {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && Array.isArray(value), "plain dense array required");
  need(Object.getPrototypeOf(value) === Array.prototype && field(value, "length", false) === length &&
    Reflect.ownKeys(value).length === length + 1, "array size or fields differ");
  return Array.from({ length }, (_, index) => field(value, String(index)));
}
function originalCandidate(candidate: CurrentPcbStringCreateCandidate): void {
  plain(candidate);
  // The existing comparator checks its private WeakSet before using the body.
  // This descriptor read never invokes a copied candidate's getter or Proxy.
  compareCurrentPcbStringCreateBody(candidate, field(candidate, "expectedBodyText"));
}

export interface CurrentPcbStringPublicationPlan extends Readonly<typeof LIMITS> {
  readonly profile: "private.current-pcb-string-publication-plan.v1";
  readonly createPlanSha256: string;
  readonly planSha256: string;
  readonly binding: Binding;
  readonly documentUuid: string;
  readonly expectedTicket: number;
  readonly expectedPendCacheLength: number;
  readonly expectedPayload: Publication;
  readonly expectedPayloadSha256: string;
}
interface Prepared {
  readonly candidate: CurrentPcbStringCreateCandidate;
  readonly payloadText: string;
}
const plans = new WeakMap<CurrentPcbStringPublicationPlan, Prepared>();

/** Predict the one-record batch from original inert create plans and supplied
 * ID/client/token/ticket values. Those values have not been observed. A future
 * owner must collect the actual complete publication interval, not submit this
 * prediction as if it were evidence. The pending batch has no project identity. */
export function planCurrentPcbStringPublication(candidate: CurrentPcbStringCreateCandidate,
  observationPlan: CurrentPcbStringCreateObservationPlan, input: unknown): CurrentPcbStringPublicationPlan {
  originalCandidate(candidate); const create = requireOriginalCurrentPcbStringCreateObservationPlan(observationPlan);
  need(candidate.requestSha256 === create.requestSha256 && candidate.expectedBodySha256 === create.expectedBodySha256,
    "original create plans differ");
  const binding = bindingSchema.parse(object(input, ["primitiveId", "client", "uniqueId", "maximumTicket"]));
  const documentUuid = create.target.documentUuid, expectedTicket = binding.maximumTicket + 1;
  // PCB217199c8 uploadString@3149779 -> localChange@3146068 ->
  // CachePendData@3145459 -> publishPendData@3145812. Tuple order is ID,
  // Ticket, record type, body. Cache length uses JS string length, not UTF8 bytes.
  // Workerb849bd12 batchPendData subscriber@2112925 consumes the first three
  // Outer entries only; retain and independently compare the fourth origin too.
  const expectedPayload: Publication = [{ [documentUuid]: { type: "PCB",
    pend: [[binding.primitiveId, expectedTicket, "STRING", candidate.expectedBodyText]] } }, binding.client, binding.uniqueId, documentUuid];
  const payloadText = JSON.stringify(expectedPayload);
  need(Buffer.byteLength(payloadText) <= MAX_PAYLOAD_BYTES, "payload exceeds byte bound");
  const expectedPayloadSha256 = sha256Text(payloadText);
  const plan: CurrentPcbStringPublicationPlan = freezeDeep({ profile: "private.current-pcb-string-publication-plan.v1",
    createPlanSha256: create.planSha256, planSha256: sha256Json({ createPlanSha256: create.planSha256, binding, expectedPayloadSha256 }),
    binding, documentUuid, expectedTicket, expectedPendCacheLength: candidate.expectedBodyText.length + 1,
    expectedPayload, expectedPayloadSha256, ...LIMITS });
  plans.set(plan, { candidate, payloadText }); return plan;
}

/** Compare a complete supplied batch without invoking accessors/coercion or
 * dropping extra documents, pending records or fields. It checks one batch, not
 * whether another publication happened before/after it or the worker handled it. */
export function compareCurrentPcbStringPublication(plan: CurrentPcbStringPublicationPlan, supplied: unknown):
  Readonly<typeof LIMITS & { profile: "private.current-pcb-string-publication-comparison.v1";
    suppliedPayloadMatchesPrediction: true; planSha256: string; payloadProjectionSha256: string; pendingRecordCount: 1 }> {
  const prepared = plans.get(plan); need(prepared !== undefined, "original publication plan required");
  const outer = array(supplied, 4);
  const documents = object(outer[0], [plan.documentUuid]);
  const document = object(documents[plan.documentUuid], ["type", "pend"]);
  const pending = array(document["pend"], 1), record = array(pending[0], 4);
  need(document["type"] === "PCB" && outer[1] === plan.binding.client && outer[2] === plan.binding.uniqueId &&
    outer[3] === plan.documentUuid, "compiler envelope differs");
  need(record[0] === plan.binding.primitiveId && Object.is(record[1], plan.expectedTicket) && record[2] === "STRING",
    "pending record identity, ticket or type differs");
  compareCurrentPcbStringCreateBody(prepared.candidate, record[3]);
  // Object property order is not a bus-protocol field. This is the fixed-order
  // Comparison projection hash, never the raw transport/artifact hash. Nested
  // Encoded body bytes and all array positions remain exact.
  const copied = [{ [plan.documentUuid]: { type: document["type"], pend: [record] } }, outer[1], outer[2], outer[3]];
  need(JSON.stringify(copied) === prepared.payloadText, "complete supplied payload differs");
  return Object.freeze({ profile: "private.current-pcb-string-publication-comparison.v1", suppliedPayloadMatchesPrediction: true,
    planSha256: plan.planSha256, payloadProjectionSha256: plan.expectedPayloadSha256, pendingRecordCount: 1, ...LIMITS } as const);
}
