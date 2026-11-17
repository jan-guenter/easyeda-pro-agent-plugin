/** Finite forward head-read composition for a future original Main issuer.
 * This controller does not issue that native transport or admit a writer. A
 * supplied host, even one returning valid acknowledgments, supplies no original
 * registration/opening, continuous producer or native clock provenance. */
import { types } from "node:util";
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { requireCurrentFootprintCopyHeadNumber, requireCurrentFootprintCopyHeadReference } from "./current-footprint-copy-head-reference.ts";
import type { CurrentFootprintCopyHeadReference } from "./current-footprint-copy-head-reference.ts";
import type { CurrentFootprintSourcePlan } from "./current-footprint-source-plan.ts";
import type { NativeSqlInventory } from "./sqlite-inventory-core.ts";
import { CURRENT_FOOTPRINT_FORWARD_HEAD_CALLS as CALLS, CURRENT_FOOTPRINT_FORWARD_HEAD_GROUP as GROUP } from "./current-footprint-forward-head-programs.ts";
import { decodeCurrentFootprintForwardHeadRow } from "./current-footprint-forward-head-query.ts";
import type { CurrentFootprintForwardHeadRow } from "./current-footprint-forward-head-query.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$(?![\s\S])/u);
const ref = z.strictObject({ objectId: handle });
const flags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const call = { ...flags, objectId: handle };
const captureParams = z.strictObject({ ...call, functionDeclaration: z.literal(CALLS.capture), arguments: z.tuple([ref, ref]),
  returnByValue: z.literal(false), throwOnSideEffect: z.literal(false) });
const requireParams = z.strictObject({ ...call, functionDeclaration: z.literal(CALLS.require), arguments: z.tuple([]),
  returnByValue: z.literal(true), throwOnSideEffect: z.literal(true) });
const projectArgument = z.strictObject({ value: z.string().regex(/^(?:[a-f\d]{32}|[a-f\d]{64})$(?![\s\S])/u) });
const branchArgument = z.strictObject({ value: z.string().regex(/^[a-f\d]{32}$(?![\s\S])/u) });
const readParams = z.strictObject({ ...call, functionDeclaration: z.literal(CALLS.read), arguments: z.tuple([projectArgument, branchArgument]),
  returnByValue: z.literal(false), throwOnSideEffect: z.literal(false) });
const awaitParams = z.strictObject({ promiseObjectId: handle, returnByValue: z.literal(false), generatePreview: z.literal(false) });
const completedParams = z.strictObject({ ...call, functionDeclaration: z.literal(CALLS.completed), arguments: z.tuple([ref, ref]),
  returnByValue: z.literal(true), throwOnSideEffect: z.literal(false) });
const releaseParams = z.strictObject({ objectGroup: z.literal(GROUP) });
const commands = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("capture"), method: z.literal("Runtime.callFunctionOn"), params: captureParams }),
  z.strictObject({ phase: z.literal("require"), method: z.literal("Runtime.callFunctionOn"), params: requireParams }),
  z.strictObject({ phase: z.literal("read"), method: z.literal("Runtime.callFunctionOn"), params: readParams }),
  z.strictObject({ phase: z.literal("await"), method: z.literal("Runtime.awaitPromise"), params: awaitParams }),
  z.strictObject({ phase: z.literal("completed"), method: z.literal("Runtime.callFunctionOn"), params: completedParams }),
  z.strictObject({ phase: z.literal("release"), method: z.literal("Runtime.releaseObjectGroup"), params: releaseParams }),
]);
export type CurrentFootprintForwardHeadCommand = Readonly<z.infer<typeof commands>>;
/** Fixed call roster only. The receiver and arguments must additionally belong
 * to the original Main cursor before its native issuer may dispatch them. */
export function validateCurrentFootprintForwardHeadCommand(input: unknown): CurrentFootprintForwardHeadCommand {
  return commands.parse(captureCurrentPcbStringClockReply(input).value);
}
export const CURRENT_FOOTPRINT_FORWARD_HEAD_REQUESTS = Object.freeze({ normal: 5, cleanup: 1, total: 6, wholeWriterReserved: false });
export interface CurrentFootprintForwardHeadHost {
  readonly assertCurrent: () => void;
  /** The actual Main engine invokes consume immediately before the fixed
   * original pending request is written. This supplied table is not an issuer. */
  readonly send: (command: CurrentFootprintForwardHeadCommand, cleanup: boolean) => Promise<unknown>;
  readonly pendingRequestId: () => number | null;
  /** The original opening owner may acknowledge its once-only continuation
   * after the read Promise is retained. Async native callbacks cannot complete
   * while that application's JavaScript frame remains paused. */
  readonly afterReadQueued?: () => Promise<void>;
}
export interface CurrentFootprintForwardHeadInputs {
  readonly before: NativeSqlInventory;
  readonly sourcePlan: CurrentFootprintSourcePlan;
  readonly reference: CurrentFootprintCopyHeadReference;
  readonly frameObjectId: string;
  readonly sqlScopeObjectId: string;
  readonly constructionObjectId: string;
}
export interface CurrentFootprintForwardHeadRead {
  readonly profile: "private.current-footprint-forward-head-read.v1";
  readonly row: CurrentFootprintForwardHeadRow;
  readonly originalCompletedReaderRetained: true;
  readonly fixedPromiseAndRowJoinCompleted: true;
  readonly nativeIssuerVerified: false;
  readonly currentHeadExclusionVerified: false;
  readonly nativeAgeVerified: false;
  readonly executionAuthorized: false;
  readonly saveAuthorized: false;
}
const names = ["assertCurrent", "send", "pendingRequestId"] as const;
const inputNames = ["before", "sourcePlan", "reference", "frameObjectId", "sqlScopeObjectId", "constructionObjectId"] as const;
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`FORWARD_HEAD_CONTROLLER_${code}`); } }
function hostMethods(host: CurrentFootprintForwardHeadHost): readonly unknown[] {
  need(host !== null && typeof host === "object" && !types.isProxy(host), "HOST");
  const prototype: unknown = Object.getPrototypeOf(host); need(prototype === null || prototype === Object.prototype, "HOST");
  const optional = Object.getOwnPropertyDescriptor(host, "afterReadQueued");
  need(Reflect.ownKeys(host).length === names.length + (optional === undefined ? 0 : 1), "HOST");
  if (optional !== undefined) { need(Object.hasOwn(optional, "value") && typeof optional.value === "function", "HOST_METHOD"); }
  const methods = names.map(name => {
    const descriptor = Object.getOwnPropertyDescriptor(host, name);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === "function", "HOST_METHOD");
    return descriptor.value as unknown;
  });
  return Object.freeze([...methods, optional?.value as unknown]);
}
const remote = z.strictObject({ result: z.strictObject({ type: z.literal("object"), subtype: z.string().optional(), className: z.string().optional(),
  description: z.string().max(256).optional(), objectId: handle }) });
const yes = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
const copiedRow = z.strictObject({ result: z.strictObject({ type: z.literal("object"), value: z.unknown() }) });
/** Capture/read/await/copy/release consumes one schedule. A reply, timeout,
 * malformed callback or post-await owner drift cannot reopen any phase. Raw
 * replies are retained before post-delivery checks, including failed cleanup. */
export class CurrentFootprintForwardHeadController {
  readonly #host: CurrentFootprintForwardHeadHost;
  readonly #methods: readonly unknown[];
  readonly #input: CurrentFootprintForwardHeadInputs;
  readonly #replies: unknown[] = [];
  #attempted = false;
  #busy = false;
  #failed = false;
  #capture: string | null = null;
  #promise: string | null = null;
  #row: string | null = null;
  #packet: CurrentFootprintForwardHeadRead | null = null;
  #active: Readonly<{ command: CurrentFootprintForwardHeadCommand; consumed: boolean }> | null = null;
  #releaseAttempted = false;
  #released = false;
  public constructor(host: CurrentFootprintForwardHeadHost, input: CurrentFootprintForwardHeadInputs) {
    this.#methods = hostMethods(host); this.#host = host;
    need(input !== null && typeof input === "object" && !types.isProxy(input), "INPUT");
    const prototype: unknown = Object.getPrototypeOf(input);
    need((prototype === null || prototype === Object.prototype) && Reflect.ownKeys(input).length === inputNames.length, "INPUT");
    // Require own data before any property access, preserving opaque originals
    // Instead of copying their complete source/checkpoint objects into JSON.
    for (const key of inputNames) { const descriptor = Object.getOwnPropertyDescriptor(input, key); need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "INPUT_DATA"); }
    const ids = z.strictObject({ frameObjectId: handle, sqlScopeObjectId: handle, constructionObjectId: handle }).parse(captureCurrentPcbStringClockReply({
      frameObjectId: input.frameObjectId, sqlScopeObjectId: input.sqlScopeObjectId, constructionObjectId: input.constructionObjectId }).value);
    this.#input = Object.freeze({ before: input.before, sourcePlan: input.sourcePlan, reference: input.reference, ...ids }); this.#same(); Object.freeze(this);
  }
  #same(cleanup = false): void {
    need(cleanup || !this.#failed, "FAILED");
    need(hostMethods(this.#host).every((method, index) => method === this.#methods[index]), "HOST_METHOD_CHANGED"); this.#host.assertCurrent();
    requireCurrentFootprintCopyHeadReference(this.#input.reference, this.#input.before, this.#input.sourcePlan);
  }
  /** Match the exact original pending command before native dispatch. Calling
   * this hook with a supplied host cannot authenticate a native Main owner. */
  public consume(command: CurrentFootprintForwardHeadCommand, requestId: number): void {
    try {
      const fixed = validateCurrentFootprintForwardHeadCommand(command);
      const active = this.#active; this.#same(fixed.phase === "release");
      need(this.#busy && active !== null && !active.consumed && Number.isSafeInteger(requestId) && requestId > 0 &&
        !Object.is(requestId, -0) && this.#host.pendingRequestId() === requestId &&
        canonicalJson(fixed) === canonicalJson(active.command), "ORIGINAL_PENDING_REQUEST");
      this.#active = { command: active.command, consumed: true };
    } catch (error) { this.#failed = true; throw error; }
  }
  async #request(input: CurrentFootprintForwardHeadCommand): Promise<unknown> {
    const command = validateCurrentFootprintForwardHeadCommand(input);
    const cleanup = command.phase === "release";
    this.#same(cleanup); need(this.#busy && this.#active === null, "BUSY"); this.#active = { command, consumed: false };
    try {
      const reply = captureCurrentPcbStringClockReply(await this.#host.send(command, cleanup)).value; this.#replies.push(reply);
      need(this.#active.consumed, "NATIVE_WRITE_ACK"); this.#same(cleanup); return reply;
    } finally { this.#active = null; }
  }
  /** Await the original returned Promise directly. Polling, equal JSON rows
   * and substitute promises cannot stand in for its actual resolved row. */
  public async observe(): Promise<CurrentFootprintForwardHeadRead> {
    need(!this.#attempted && !this.#busy && !this.#releaseAttempted, "CONSUMED"); this.#attempted = true; this.#busy = true;
    const callFlags = { objectGroup: GROUP, silent: true, generatePreview: false, awaitPromise: false, userGesture: false } as const;
    try {
      const capture = remote.parse(await this.#request({ phase: "capture", method: "Runtime.callFunctionOn", params: { ...callFlags,
        objectId: this.#input.frameObjectId, functionDeclaration: CALLS.capture, arguments: [{ objectId: this.#input.sqlScopeObjectId }, { objectId: this.#input.constructionObjectId }],
        returnByValue: false, throwOnSideEffect: false } })).result;
      need(capture.subtype === "array" && capture.className === "Array" && capture.description === "Array(18)", "CAPTURE_ARRAY"); this.#capture = capture.objectId;
      yes.parse(await this.#request({ phase: "require", method: "Runtime.callFunctionOn", params: { ...callFlags, objectId: this.#capture,
        functionDeclaration: CALLS.require, arguments: [], returnByValue: true, throwOnSideEffect: true } }));
      const pending = remote.parse(await this.#request({ phase: "read", method: "Runtime.callFunctionOn", params: { ...callFlags, objectId: this.#capture,
        functionDeclaration: CALLS.read, arguments: [{ value: this.#input.reference.projectUuid }, { value: this.#input.reference.branchUuid }],
        returnByValue: false, throwOnSideEffect: false } })).result;
      need(pending.subtype === "promise" && pending.className === "Promise", "ORIGINAL_QUERY_PROMISE"); this.#promise = pending.objectId;
      if (this.#host.afterReadQueued !== undefined) { await this.#host.afterReadQueued(); this.#same(); }
      const row = remote.parse(await this.#request({ phase: "await", method: "Runtime.awaitPromise", params: { promiseObjectId: this.#promise,
        returnByValue: false, generatePreview: false } })).result;
      need(row.subtype === undefined && row.className === "Object", "ORIGINAL_QUERY_ROW"); this.#row = row.objectId;
      const value = copiedRow.parse(await this.#request({ phase: "completed", method: "Runtime.callFunctionOn", params: { ...callFlags,
        objectId: this.#capture, functionDeclaration: CALLS.completed, arguments: [{ objectId: this.#promise }, { objectId: this.#row }],
        returnByValue: true, throwOnSideEffect: false } })).result.value;
      const decoded = decodeCurrentFootprintForwardHeadRow(value, this.#input.reference);
      need(decoded.headNum === requireCurrentFootprintCopyHeadNumber(this.#input.reference, this.#input.before, this.#input.sourcePlan), "ORIGINAL_HEAD_NUMBER");
      this.#packet = Object.freeze({ profile: "private.current-footprint-forward-head-read.v1", row: decoded,
        originalCompletedReaderRetained: true, fixedPromiseAndRowJoinCompleted: true, nativeIssuerVerified: false,
        currentHeadExclusionVerified: false, nativeAgeVerified: false, executionAuthorized: false, saveAuthorized: false });
      return this.#packet;
    } catch (error) { this.#failed = true; throw error; } finally { this.#busy = false; }
  }
  /** Release only this fixed object group through its original transport.
   * A missing acknowledgment consumes release; it grants no resume or retry. */
  public async release(): Promise<void> {
    need(this.#attempted && !this.#busy && !this.#releaseAttempted, "RELEASE_CONSUMED"); this.#releaseAttempted = true; this.#busy = true;
    try { z.strictObject({}).parse(await this.#request({ phase: "release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } })); this.#released = true; }
    catch (error) { this.#failed = true; throw error; } finally { this.#busy = false; }
  }
  public requireOriginal(packet: CurrentFootprintForwardHeadRead): void {
    this.#same(); need(!this.#busy && packet === this.#packet && this.#packet !== null, "ORIGINAL_RESULT");
  }
  public retained(): Readonly<{ attempted: boolean; busy: boolean; failed: boolean; releaseAttempted: boolean; released: boolean;
    captureRetained: boolean; promiseRetained: boolean; rowRetained: boolean; replies: readonly unknown[]; result: CurrentFootprintForwardHeadRead | null }> {
    return Object.freeze({ attempted: this.#attempted, busy: this.#busy, failed: this.#failed, releaseAttempted: this.#releaseAttempted, released: this.#released,
      captureRetained: this.#capture !== null, promiseRetained: this.#promise !== null, rowRetained: this.#row !== null, replies: Object.freeze([...this.#replies]), result: this.#packet });
  }
}
