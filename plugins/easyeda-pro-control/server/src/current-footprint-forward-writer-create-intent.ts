/** Durable intent joins original source, pre-action head/guards, Main and
 * actual clock owners. It reserves dispatch once; it performs no Create, Save,
 * producer continuation or saved-result verification. */
/* oxlint-disable import/max-dependencies -- This one private authority boundary joins each separate original issuer, the exact reservation and the managed intent publisher. */
import { types } from "node:util";
import { z } from "zod";
import { sha256Json } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CurrentFootprintForwardWriterCreateIntentJournal, currentFootprintForwardWriterCreateIntentIdSchema } from "./current-footprint-forward-writer-create-intent-journal.ts";
import type { IntentPlan } from "./current-footprint-forward-writer-create-intent-journal.ts";
import { requireOriginalCurrentFootprintForwardWriterPrecreateHead } from "./current-footprint-forward-writer-precreate-head.ts";
import type { CurrentFootprintForwardWriterPrecreateHead } from "./current-footprint-forward-writer-precreate-head.ts";
import { requireOriginalCurrentFootprintForwardWriterClockPreparation } from "./current-footprint-forward-writer-clock-preparation.ts";
import type { CurrentFootprintForwardWriterClockPreparation } from "./current-footprint-forward-writer-clock-preparation.ts";
import { requireCurrentFootprintForwardWriterOpeningInput } from "./current-footprint-forward-writer-opening.ts";
import type { CurrentFootprintForwardWriterOpeningProvider } from "./current-footprint-forward-writer-opening.ts";
import { currentFootprintForwardWriterMainGenerationExited, requireCurrentFootprintForwardWriterPairedSchedule } from "./current-footprint-forward-writer-main-capability.ts";
import type { CurrentFootprintForwardWriterMainCapability } from "./current-footprint-forward-writer-main-capability.ts";
import { requireCurrentFootprintForwardWriterMainRequestOrigin } from "./current-footprint-forward-writer-main-origin.ts";
import type { CurrentFootprintForwardWriterMainRequestOrigin } from "./current-footprint-forward-writer-main-origin.ts";
import { requireCurrentFootprintForwardWriterClockRpcOrigin } from "./current-footprint-forward-writer-clock-origin.ts";
import type { CurrentFootprintForwardWriterClockRpcOrigin } from "./current-footprint-forward-writer-clock-origin.ts";
import { requireCurrentFootprintForwardWriterMainRequestReservation, requireCurrentFootprintForwardWriterMainRequestReservationCopy, requireOriginalCurrentFootprintForwardWriterMainRequestReservationCopy } from "./current-footprint-forward-writer-main-request-plan.ts";
import type { CurrentFootprintForwardWriterMainRequestReservation } from "./current-footprint-forward-writer-main-request-plan.ts";
import type { CurrentFootprintForwardWriterProducerInterval } from "./current-footprint-forward-writer-producer-interval.ts";
import type { CurrentFootprintForwardWriterNativeOwner } from "./current-pcb-diagnostic-owner.ts";

export const currentFootprintForwardWriterCreateIntentRequestSchema = z.strictObject({ operationId: currentFootprintForwardWriterCreateIntentIdSchema,
 clockWindow: z.strictObject({ minimum: z.number().int().positive().max(8_640_000_000_000_000), maximum: z.number().int().positive().max(8_640_000_000_000_000) }).refine(value => value.maximum >= value.minimum && value.maximum - value.minimum <= 60_000),
 confirmDisposableCopy: z.literal(true), acceptUnsupportedInverse: z.literal(true) });
export interface CurrentFootprintForwardWriterCreateIntentInputs {
 readonly provider: CurrentFootprintForwardWriterOpeningProvider; readonly preparation: CurrentFootprintForwardWriterClockPreparation;
 readonly head: CurrentFootprintForwardWriterPrecreateHead; readonly interval: CurrentFootprintForwardWriterProducerInterval;
 readonly capability: CurrentFootprintForwardWriterMainCapability; readonly mainOrigin: CurrentFootprintForwardWriterMainRequestOrigin;
 readonly clockOrigin: CurrentFootprintForwardWriterClockRpcOrigin; readonly reservation: CurrentFootprintForwardWriterMainRequestReservation;
}
export interface CurrentFootprintForwardWriterCreateIntent { readonly profile: "private.current-footprint-forward-writer-create-intent.v1"; readonly operationId: string; readonly executionAuthorized: false; readonly saveAuthorized: false }
type Context = ReturnType<typeof requireOriginalCurrentFootprintForwardWriterPrecreateHead>;
const originals = new WeakMap<CurrentFootprintForwardWriterCreateIntent, Readonly<{ owner: CurrentFootprintForwardWriterCreateIntentOwner; require: (owner: CurrentFootprintForwardWriterNativeOwner, capability: CurrentFootprintForwardWriterMainCapability, origin: CurrentFootprintForwardWriterMainRequestOrigin, clock: CurrentFootprintForwardWriterClockRpcOrigin) => void; reprove: (owner: CurrentFootprintForwardWriterNativeOwner, capability: CurrentFootprintForwardWriterMainCapability, origin: CurrentFootprintForwardWriterMainRequestOrigin, clock: CurrentFootprintForwardWriterClockRpcOrigin) => Promise<void> }>>();
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`FORWARD_WRITER_CREATE_INTENT_${code}`); } }
async function voidCompletion(pending: Promise<null>): Promise<void> {
 await pending;
}
export class CurrentFootprintForwardWriterCreateIntentOwner {
 readonly #inputs: Readonly<CurrentFootprintForwardWriterCreateIntentInputs>; readonly #request: Readonly<z.infer<typeof currentFootprintForwardWriterCreateIntentRequestSchema>>;
 #context: Context | null = null; #journal: CurrentFootprintForwardWriterCreateIntentJournal | null = null; #packet: CurrentFootprintForwardWriterCreateIntent | null = null;
 #pending: Promise<unknown> | null = null; #prepareAttempted = false; #consumeAttempted = false; #dispatchPrepared = false; #failed = false; #finished = false;
 #finishPending: Promise<void> | null = null;
 public constructor(inputs: CurrentFootprintForwardWriterCreateIntentInputs, request: unknown) {
  need(inputs !== null && typeof inputs === "object" && !types.isProxy(inputs), "ORIGINAL_INPUTS");
  const keys = ["provider", "preparation", "head", "interval", "capability", "mainOrigin", "clockOrigin", "reservation"];
  const actual = Reflect.ownKeys(inputs); need(actual.length === keys.length && actual.every(key => typeof key === "string" && keys.includes(key) && Object.hasOwn(Object.getOwnPropertyDescriptor(inputs, key) ?? {}, "value")), "INPUT_DATA_FIELDS");
  this.#inputs = Object.freeze({ ...inputs }); this.#request = freezeDeep(currentFootprintForwardWriterCreateIntentRequestSchema.parse(captureCurrentPcbStringClockReply(request).value)); Object.freeze(this);
 }
 #current(): Context {
  need(!this.#failed && !this.#finished, "ENDED"); const i = this.#inputs;
  const current = requireOriginalCurrentFootprintForwardWriterPrecreateHead(i.head, i.provider, i.capability, i.interval, i.mainOrigin);
  const main = current.input.source.main, prepared = requireOriginalCurrentFootprintForwardWriterClockPreparation(i.preparation, i.provider);
  need(main !== null && prepared.input.owner === current.input.owner && prepared.input.source.source === current.input.source.source && prepared.source.before === current.input.source.owned.before &&
   prepared.leases.workerLease === requireCurrentFootprintForwardWriterClockRpcOrigin(i.clockOrigin).workerLease, "ORIGINAL_PREPARATION");
  requireCurrentFootprintForwardWriterMainRequestOrigin(i.mainOrigin); requireCurrentFootprintForwardWriterPairedSchedule(i.capability, main, i.clockOrigin);
  if (!this.#dispatchPrepared) { need(requireOriginalCurrentFootprintForwardWriterMainRequestReservationCopy(i.reservation) === current.input.source.owned.copyPlan, "ORIGINAL_COPY"); }
  requireCurrentFootprintForwardWriterMainRequestReservationCopy(i.reservation, current.input.source.owned.copyPlan, this.#request.clockWindow.minimum, this.#request.clockWindow.maximum);
  if (current.age !== null) { const end = current.age.observation.observedWindow.notAfterMs; need(this.#request.clockWindow.minimum >= end && this.#request.clockWindow.maximum <= end + 60_000, "ORIGINAL_AGE_WINDOW"); }
  if (this.#context !== null) { need(current.input.owner === this.#context.input.owner && current.input.result === this.#context.input.result && current.age === this.#context.age, "ORIGINAL_CONTEXT"); }
  return current;
 }
 /** Safe inside the original native queue: Linux publication reads only.
  * Original synchronous refs are checked around every filesystem await. */
 async #filesystemPublished(): Promise<void> {
  const current = this.#current(), i = this.#inputs; const input = await requireCurrentFootprintForwardWriterOpeningInput(i.provider); this.#current();
  need(input.owner === current.input.owner && input.result === current.input.result && input.source.source === current.input.source.source, "ORIGINAL_PUBLICATION");
  const journal = this.#journal; need(journal !== null, "ORIGINAL_JOURNAL"); await journal.assertCurrent(); this.#current();
 }
 async #published(): Promise<void> {
  const current = this.#current(), i = this.#inputs; const input = await requireCurrentFootprintForwardWriterOpeningInput(i.provider); this.#current();
  need(input.owner === current.input.owner && input.result === current.input.result && input.source.source === current.input.source.source, "ORIGINAL_PUBLICATION");
  const clock = requireCurrentFootprintForwardWriterClockRpcOrigin(i.clockOrigin); await clock.assertOriginal(); this.#current(); need(requireCurrentFootprintForwardWriterClockRpcOrigin(i.clockOrigin) === clock, "ORIGINAL_CLOCK");
  if (this.#journal !== null) { await this.#journal.assertCurrent(); this.#current(); }
 }
 /** Retain before the first publication await; no caller Promise is accepted. */
 public prepare(): Promise<CurrentFootprintForwardWriterCreateIntent> {
  need(!this.#prepareAttempted && !this.#finished, "PREPARATION_CONSUMED"); this.#prepareAttempted = true;
  const completion = Promise.withResolvers<CurrentFootprintForwardWriterCreateIntent>(); this.#pending = completion.promise;
  void (async (): Promise<void> => { try { completion.resolve(await this.#prepare()); } catch (error) { this.#failed = true; completion.reject(error); } })(); return completion.promise;
 }
 async #prepare(): Promise<CurrentFootprintForwardWriterCreateIntent> {
  this.#context = this.#current(); await this.#published(); const context = this.#current(), i = this.#inputs;
  const plan: IntentPlan = Object.freeze({ operationId: this.#request.operationId, sourceOperationId: context.input.result.operationId, sourceInputSha256: sha256Json(context.input.result),
   nativeBindingSha256: sha256Json(context.input.source.binding), beforeSqlSha256: context.input.result.beforeSqlSha256, copyPlanSha256: sha256Json(context.input.source.owned.copyPlan),
   mainReservationSha256: sha256Json(requireCurrentFootprintForwardWriterMainRequestReservation(i.reservation)), nativeAgeRequired: i.head.nativeAgeRequired,
   headObservationSha256: context.age === null ? null : sha256Json(context.age), clockWindow: this.#request.clockWindow, confirmDisposableCopy: true, acceptUnsupportedInverse: true, destinationAllocated: false });
  this.#journal = new CurrentFootprintForwardWriterCreateIntentJournal(plan); await this.#journal.reserve(); this.#current(); await this.#published();
  const packet = Object.freeze({ profile: "private.current-footprint-forward-writer-create-intent.v1" as const, operationId: plan.operationId, executionAuthorized: false as const, saveAuthorized: false as const }); this.#packet = packet;
  const assertConsumed = (owner: CurrentFootprintForwardWriterNativeOwner, capability: CurrentFootprintForwardWriterMainCapability, origin: CurrentFootprintForwardWriterMainRequestOrigin, clock: CurrentFootprintForwardWriterClockRpcOrigin): void => {
   need(packet === this.#packet && this.#dispatchPrepared && owner === context.input.owner && capability === i.capability && origin === i.mainOrigin && clock === i.clockOrigin && this.#journal?.retained().publicationPending === false, "ORIGINAL_CONSUMED_INTENT"); this.#current();
  };
  originals.set(packet, Object.freeze({ owner: this, require: assertConsumed,
   reprove: async (owner: CurrentFootprintForwardWriterNativeOwner, capability: CurrentFootprintForwardWriterMainCapability, origin: CurrentFootprintForwardWriterMainRequestOrigin, clock: CurrentFootprintForwardWriterClockRpcOrigin): Promise<void> => {
    assertConsumed(owner, capability, origin, clock); await this.#filesystemPublished(); assertConsumed(owner, capability, origin, clock);
   }
  })); return packet;
 }
 /** Reserve dispatch once and publish before the caller's immediate original
  * interval consume/native dispatch. Failure never grants a retry. */
 public consume(packet: CurrentFootprintForwardWriterCreateIntent): Promise<void> {
  need(packet === this.#packet && !this.#consumeAttempted && !this.#failed && !this.#finished, "CONSUME_ONCE"); this.#consumeAttempted = true;
  const completion = Promise.withResolvers<null>(); this.#pending = completion.promise;
  void (async (): Promise<void> => { try {
   await this.#published(); const journal = this.#journal; need(journal !== null, "ORIGINAL_JOURNAL");
   await journal.append("dispatch-intent", { dispatchReservedOnce: true, destinationAllocated: false }); this.#current(); await this.#published(); this.#dispatchPrepared = true; completion.resolve(null);
  } catch (error) { this.#failed = true; completion.reject(error); } })(); return voidCompletion(completion.promise);
 }
 /** Settle the original bytes after actual generation exit. This terminal
  * component result claims no edit acknowledgement or saved design result. */
 public finishAfterOriginalExit(): Promise<void> {
  if (this.#finishPending !== null) { return this.#finishPending; }
  if (this.#finished) { return Promise.resolve(); }
  if (this.#context !== null && this.#journal !== null) {
   const main = this.#context.input.source.main; need(main !== null && currentFootprintForwardWriterMainGenerationExited(this.#inputs.capability, main), "ORIGINAL_GENERATION_LIVE");
  }
  const completion = Promise.withResolvers<null>(), pending = voidCompletion(completion.promise); this.#finishPending = pending;
  void (async (): Promise<void> => { try {
   if (this.#pending !== null) { await Promise.allSettled([this.#pending]); }
   const context = this.#context, journal = this.#journal;
   if (context === null || journal === null) { this.#finished = true; completion.resolve(null); return; }
   const main = context.input.source.main; need(main !== null && currentFootprintForwardWriterMainGenerationExited(this.#inputs.capability, main), "ORIGINAL_GENERATION_LIVE");
   const outcome = journal.reservationOutcome(); if (outcome === "not-entered" || outcome === "conflict") { this.#finished = true; completion.resolve(null); return; }
   await journal.settle(); if (journal.retained().records.at(-1)?.kind !== "original-exit") { await journal.append("original-exit", { originalGenerationExited: true, executionResultClaimed: false, persistenceVerified: false }); }
   await journal.assertCurrent(); this.#finished = true; completion.resolve(null);
  } catch (error) {
    // Only original local publication may be settled again; dispatch is spent.
    if (this.#finishPending === pending) { this.#finishPending = null; } completion.reject(error);
   } })(); return pending;
 }
}
export function requireOriginalCurrentFootprintForwardWriterConsumedCreateIntent(packet: CurrentFootprintForwardWriterCreateIntent, owner: CurrentFootprintForwardWriterNativeOwner,
 capability: CurrentFootprintForwardWriterMainCapability, origin: CurrentFootprintForwardWriterMainRequestOrigin, clock: CurrentFootprintForwardWriterClockRpcOrigin): void {
 const original = originals.get(packet); need(original !== undefined, "ORIGINAL_PACKET"); original.require(owner, capability, origin, clock);
}

/** Re-read original durable files after later parent/native awaits, immediately
 * before dispatch. This enters no native queue; the original queued caller owns
 * its native-parent/clock reproof. No caller callback or token copy enters. */
export async function reproveOriginalCurrentFootprintForwardWriterConsumedCreateIntent(packet: CurrentFootprintForwardWriterCreateIntent, owner: CurrentFootprintForwardWriterNativeOwner,
 capability: CurrentFootprintForwardWriterMainCapability, origin: CurrentFootprintForwardWriterMainRequestOrigin, clock: CurrentFootprintForwardWriterClockRpcOrigin): Promise<void> {
 const original = originals.get(packet); need(original !== undefined, "ORIGINAL_PACKET"); await original.reprove(owner, capability, origin, clock);
}
