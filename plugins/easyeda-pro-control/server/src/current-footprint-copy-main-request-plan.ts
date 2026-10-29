/** Private late request-body preparation. Native destination allocation still
 * needs a separate original invocation/argument capture before its first await.
 * Observed known-UUID clocks cannot supply that missing relation. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { assertCurrentFootprintCopyV2FreshUuid, currentFootprintCopyV2Rows } from "./current-footprint-copy-v2-plan.ts";
import type { CurrentFootprintCopyV2Plan } from "./current-footprint-copy-v2-plan.ts";
// oxlint-disable-next-line import/no-cycle -- The actual clock issuer validates the original packet only during late binding after both runners exist; no issuer is called at module initialization.
import { requireCurrentFootprintCopyClockRpcObservation } from "./current-footprint-copy-clock-rpc-runner.ts";
import type { CurrentFootprintCopyClockRpcObservation } from "./current-footprint-copy-clock-rpc-runner.ts";
import type { CurrentFootprintCopyClockRpcOrigin } from "./current-footprint-copy-clock-rpc-origin.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_FLAGS as FLAGS, currentFootprintCopyMainRequestPlanSchema } from "./current-footprint-copy-main-request-contract.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_CALLS as CALLS } from "./current-footprint-copy-main-request-programs.ts";
import { currentFootprintCopyMainRequestWire } from "./current-footprint-copy-main-request-wire.ts";

type Plan = Readonly<z.infer<typeof currentFootprintCopyMainRequestPlanSchema>>;
const contextSchema = currentFootprintCopyMainRequestPlanSchema.omit({ dataStr: true });
const windowSchema = z.object({ minimum: z.number().int().positive().max(8_640_000_000_000_000),
  maximum: z.number().int().positive().max(8_640_000_000_000_000) }).strict().refine(value => value.maximum >= value.minimum && value.maximum - value.minimum <= 60_000);
type Context = Readonly<z.infer<typeof contextSchema>>;
export interface CurrentFootprintCopyMainRequestReservation {
  readonly profile: "private.current-footprint-copy-main-request-reservation.v1";
  readonly maximumDataStrBytes: number;
  readonly originalCopyPlanRetained: true;
  readonly exactMaximumEscapedEnvelopeReserved: true;
  readonly nativeAllocationQualified: false;
  readonly executionAuthorized: false;
}
interface Retained { readonly copy: CurrentFootprintCopyV2Plan; readonly context: Context;
  readonly window: Readonly<z.infer<typeof windowSchema>>; readonly maximum: Plan; consumed: boolean }
const originals = new WeakMap<object, Retained>();
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`FOOTPRINT_MAIN_REQUEST_PLAN_${code}`); } }
function body(copy: CurrentFootprintCopyV2Plan, uuid: string, first: number, second: number): string {
  const head = (ticket: number, time: number): string => `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({
    docType: "FOOTPRINT", client: copy.client, uuid, updateTime: time, version: String(time), editVersion: "3.2.209" })}`;
  return [head(copy.metadataTicket, first),
    `${JSON.stringify({ type: "META", ticket: copy.metadataTicket, id: "META" })}||${JSON.stringify(copy.destinationMetadata)}`,
    head(copy.canvasHeaderTicket, second), ...currentFootprintCopyV2Rows(copy)].join("|\n");
}
export function assertCurrentFootprintCopyMainRequestPlanWire(plan: Plan): void {
  currentFootprintCopyMainRequestWire({ phase: "request-controller", method: "Runtime.callFunctionOn", params: { ...FLAGS,
    objectId: "x".repeat(256), functionDeclaration: CALLS.controller.program,
    arguments: [{ objectId: "x".repeat(256) }, { value: plan }], returnByValue: false } }, 2_147_483_647);
}
/** Fixed-width hex UUIDs and positive integer clocks have their largest JSON
 * encodings at this upper clock bound. Reserve the complete escaped envelope,
 * not only the unescaped dataStr, before any main breakpoint can be allocated. */
export function reserveCurrentFootprintCopyMainRequestPlan(copy: CurrentFootprintCopyV2Plan, suppliedContext: unknown,
  suppliedWindow: unknown): CurrentFootprintCopyMainRequestReservation {
  currentFootprintCopyV2Rows(copy);
  const context = freezeDeep(contextSchema.parse(captureCurrentPcbStringClockReply(suppliedContext).value));
  const window = freezeDeep(windowSchema.parse(captureCurrentPcbStringClockReply(suppliedWindow).value));
  need(context.projectUuid === copy.source.projectUuid && context.branchUuid === copy.source.branchUuid, "COPY_IDENTITY");
  const maximumBody = body(copy, "f".repeat(16), window.maximum, window.maximum);
  const maximum = freezeDeep(currentFootprintCopyMainRequestPlanSchema.parse({ ...context, dataStr: maximumBody }));
  assertCurrentFootprintCopyMainRequestPlanWire(maximum);
  const token = Object.freeze({ profile: "private.current-footprint-copy-main-request-reservation.v1" as const,
    maximumDataStrBytes: Buffer.byteLength(maximum.dataStr), originalCopyPlanRetained: true as const,
    exactMaximumEscapedEnvelopeReserved: true as const, nativeAllocationQualified: false as const, executionAuthorized: false as const });
  originals.set(token, { copy, context, window, maximum, consumed: false }); return token;
}
export function isCurrentFootprintCopyMainRequestReservation(value: unknown): value is CurrentFootprintCopyMainRequestReservation {
  return value !== null && typeof value === "object" && originals.has(value);
}
export function requireCurrentFootprintCopyMainRequestReservation(token: CurrentFootprintCopyMainRequestReservation): Plan {
  const original = originals.get(token); need(original !== undefined && !original.consumed, "ORIGINAL_RESERVATION");
  currentFootprintCopyV2Rows(original.copy); return original.maximum;
}
/** Consumed before the first owner await. Only the actual paired runner's
 * original packet and origin can bind clocks. This derives request bytes; it
 * does not qualify the UUID allocator, source queues or any writer purpose. */
export async function bindCurrentFootprintCopyMainRequestPlan(token: CurrentFootprintCopyMainRequestReservation,
  origin: CurrentFootprintCopyClockRpcOrigin, packet: CurrentFootprintCopyClockRpcObservation): Promise<Plan> {
  const original = originals.get(token); need(original !== undefined && !original.consumed, "ORIGINAL_RESERVATION");
  original.consumed = true;
  await requireCurrentFootprintCopyClockRpcObservation(packet, origin);
  const first = packet.samples[0], second = packet.samples[1];
  need(packet.samples.length === 2 && first?.ordinal === 1 && first.producer === "buildString" && second?.ordinal === 2 &&
    second.producer === "canvasString" && first.documentUuid === second.documentUuid && first.updateTime <= second.updateTime &&
    first.updateTime >= original.window.minimum && second.updateTime <= original.window.maximum, "PAIRED_CLOCKS");
  assertCurrentFootprintCopyV2FreshUuid(original.copy, first.documentUuid);
  const plan = freezeDeep(currentFootprintCopyMainRequestPlanSchema.parse({ ...original.context,
    dataStr: body(original.copy, first.documentUuid, first.updateTime, second.updateTime) }));
  need(Buffer.byteLength(plan.dataStr) <= token.maximumDataStrBytes && plan.dataStr.length <= original.maximum.dataStr.length, "RESERVED_BYTES");
  assertCurrentFootprintCopyMainRequestPlanWire(plan);
  await requireCurrentFootprintCopyClockRpcObservation(packet, origin);
  need(originals.get(token) === original, "ORIGINAL_COPY"); currentFootprintCopyV2Rows(original.copy);
  return plan;
}
