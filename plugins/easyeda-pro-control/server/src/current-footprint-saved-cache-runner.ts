/** Original-transport metadata observation. No native roster or replay
 * exclusion is inferred from the returned descriptors. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { z } from "zod";
import { CURRENT_FOOTPRINT_SAVED_CACHE_PROBE_CALLS as CALLS, CURRENT_FOOTPRINT_SAVED_CACHE_PROBE_GROUP as GROUP,
  CURRENT_FOOTPRINT_SAVED_CACHE_PROBE_LIMITS as LIMITS, currentFootprintSavedCacheDescriptorSchema,
  decodeCurrentFootprintSavedCacheProbeArray } from "./current-footprint-saved-cache-probe.ts";
import { validateCurrentFootprintSavedCacheCommand } from "./current-footprint-saved-cache-protocol.ts";
import type { CurrentFootprintSavedCacheCommand as Command } from "./current-footprint-saved-cache-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}(?![\s\S])/u), session = handle.max(128);
const engineSchema = z.object({ protocolVersion: z.string().max(8192), product: z.string().max(8192), revision: z.string().max(8192),
  userAgent: z.string().max(8192), jsVersion: z.string().max(8192) }).strict();
export const currentFootprintSavedCacheObservationSchema = z.object({ profile: z.literal("easyeda-pro-control.saved-cache-native-observation.v1"),
  engine: engineSchema, descriptors: currentFootprintSavedCacheDescriptorSchema,
  arrayMetadata: z.unknown(), constructorMetadata: z.unknown(), matchMetadata: z.unknown(),
  originalHandlesRechecked: z.literal(true), cacheStorageGetterInvoked: z.literal(false), matchInvoked: z.literal(false),
  nativeMatchQualified: z.literal(false), replayTokenIssued: z.literal(false), executionAuthorized: z.literal(false),
}).strict();
export type CurrentFootprintSavedCacheObservation = Readonly<z.infer<typeof currentFootprintSavedCacheObservationSchema>>;
export interface CurrentFootprintSavedCacheTransport { readonly assertCurrent: () => Promise<void>; readonly request: (command: Command) => Promise<unknown> }
function need(value: boolean): asserts value { if (!value) { throw new Error("SAVED_CACHE_NATIVE_PROBE_OWNER"); } }
function methods(value: CurrentFootprintSavedCacheTransport): readonly unknown[] {
  need(!types.isProxy(value) && Object.getPrototypeOf(value) === Object.prototype && Reflect.ownKeys(value).length === 2);
  return ["assertCurrent", "request"].map(key => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key); need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === "function");
    return descriptor.value as unknown;
  });
}
const remoteArray = z.object({ result: z.object({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"),
  description: z.literal("Array(4)"), objectId: handle.max(256) }).strict() }).strict();
const sideEffectRemote = z.object({ type: z.literal("object"), subtype: z.literal("error"), className: z.literal("EvalError"),
  description: z.literal("EvalError: Possible side-effect in debug-evaluate"), objectId: handle }).strict();
const sideEffectReply = z.object({ result: sideEffectRemote, exceptionDetails: z.object({ exceptionId: z.number().int().positive(),
  text: z.literal("Uncaught"), lineNumber: z.literal(-1), columnNumber: z.literal(-1), scriptId: handle, exception: sideEffectRemote }).strict() }).strict();
type NativeExceptionCode = "debug-evaluate-side-effect-refused" | "unclassified-native-exception";
/** The input is already an inert complete retained reply. Exact known native
 * fields yield a fixed label; unknown exception descriptions remain raw evidence.
 * This classification is neither engine qualification nor permission to retry. */
function nativeExceptionCode(reply: unknown): NativeExceptionCode | null {
  if (reply === null || typeof reply !== "object" || !Object.hasOwn(reply, "exceptionDetails")) { return null; }
  return sideEffectReply.safeParse(reply).success ? "debug-evaluate-side-effect-refused" : "unclassified-native-exception";
}
export class CurrentFootprintSavedCacheRunner {
  readonly #transport: CurrentFootprintSavedCacheTransport;
  readonly #methods: readonly unknown[];
  readonly #binding: Readonly<{ sessionId: string; uniqueContextId: string }>;
  readonly #engine: z.infer<typeof engineSchema>;
  readonly #raw: unknown[] = [];
  readonly #phases: Readonly<{ phase: Command["cacheNativePhase"]; method: Command["method"] }>[] = [];
  #attempted = false;
  #releaseAttempted = false;
  #released = false;
  #position: string | null = null;
  #failure: Readonly<{ phase: string | null; replyIndex: number | null }> | null = null;
  #nativeException: Readonly<{ phase: Command["cacheNativePhase"]; replyIndex: number; code: NativeExceptionCode }> | null = null;
  public constructor(transport: CurrentFootprintSavedCacheTransport, binding: Readonly<{ sessionId: string; uniqueContextId: string }>, engine: unknown) {
    this.#methods = methods(transport); this.#transport = transport;
    this.#binding = Object.freeze(z.object({ sessionId: session, uniqueContextId: session }).strict().parse(captureCurrentPcbStringClockReply(binding).value));
    this.#engine = Object.freeze(engineSchema.parse(captureCurrentPcbStringClockReply(engine).value));
  }
  #same(): void { need(methods(this.#transport).every((value, index) => value === this.#methods[index])); }
  async #request(input: Command): Promise<unknown> {
    this.#same(); await this.#transport.assertCurrent(); this.#same();
    const command = validateCurrentFootprintSavedCacheCommand(input); this.#position = command.cacheNativePhase;
    const reply = captureCurrentPcbStringClockReply(await this.#transport.request(command));
    need(Buffer.byteLength(reply.text) <= LIMITS.replyBytes); this.#raw.push(reply.value);
    this.#phases.push(Object.freeze({ phase: command.cacheNativePhase, method: command.method }));
    await this.#transport.assertCurrent(); this.#same();
    const code = nativeExceptionCode(reply.value);
    if (code !== null) {
      this.#nativeException ??= Object.freeze({ phase: command.cacheNativePhase, replyIndex: this.#raw.length - 1, code });
      throw new Error(code === "debug-evaluate-side-effect-refused" ? "SAVED_CACHE_NATIVE_PROBE_SIDE_EFFECT_REFUSED" : "SAVED_CACHE_NATIVE_PROBE_NATIVE_EXCEPTION");
    }
    return reply.value;
  }
  #properties(phase: "array-properties" | "constructor-properties" | "match-properties", objectId: string): Promise<unknown> {
    return this.#request({ cacheNativePhase: phase, method: "Runtime.getProperties", sessionId: this.#binding.sessionId,
      params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  }
  public retained(): Readonly<Record<string, unknown>> {
    const base = { attempted: this.#attempted, releaseAttempted: this.#releaseAttempted, released: this.#released, phase: this.#position,
      failure: this.#failure, nativeException: this.#nativeException, engine: this.#engine, originalRepliesRetainedPrivately: true,
      nativeMatchQualified: false, replayTokenIssued: false, executionAuthorized: false };
    let remaining = LIMITS.resultBytes - Buffer.byteLength(JSON.stringify(base)) - 4096;
    const replies: unknown[] = Array.from({ length: this.#raw.length });
    for (let index = this.#raw.length - 1; index >= 0; index -= 1) {
      const reply = this.#raw[index], text = JSON.stringify(reply); need(typeof text === "string");
      const bytes = Buffer.byteLength(text), summary = { index, ...this.#phases[index], utf8Bytes: bytes, sha256: createHash("sha256").update(text).digest("hex") };
      const source = reply !== null && typeof reply === "object" && Object.hasOwn(reply, "scriptSource");
      if (!source && bytes <= LIMITS.replyBytes && bytes <= remaining) { replies[index] = { ...summary, reply }; remaining -= bytes; }
      else { replies[index] = { ...summary, originalRetainedPrivately: true }; }
    }
    return freezeDeep({ ...base, replies });
  }
  public async observe(): Promise<CurrentFootprintSavedCacheObservation> {
    need(!this.#attempted); this.#attempted = true;
    const flags = { objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false, arguments: [] as [] } as const;
    let failed = false, failure: unknown, result: CurrentFootprintSavedCacheObservation | null = null;
    try {
      const array = remoteArray.parse(await this.#request({ cacheNativePhase: "capture", method: "Runtime.callFunctionOn", sessionId: this.#binding.sessionId,
        params: { ...flags, uniqueContextId: this.#binding.uniqueContextId, functionDeclaration: CALLS.capture, returnByValue: false } }));
      const arrayMetadata = await this.#properties("array-properties", array.result.objectId), selected = decodeCurrentFootprintSavedCacheProbeArray(arrayMetadata);
      const constructorMetadata = await this.#properties("constructor-properties", selected.constructor);
      const matchMetadata = await this.#properties("match-properties", selected.match);
      const metadataShape = z.object({ result: z.array(z.unknown()).max(256), internalProperties: z.array(z.unknown()).max(32).optional(),
        privateProperties: z.array(z.unknown()).max(32).optional() }).strict();
      metadataShape.parse(constructorMetadata); metadataShape.parse(matchMetadata);
      const recheck = z.object({ result: z.object({ type: z.literal("string"), value: z.string().max(4096) }).strict() }).strict().parse(
        await this.#request({ cacheNativePhase: "recheck", method: "Runtime.callFunctionOn", sessionId: this.#binding.sessionId,
          params: { ...flags, objectId: array.result.objectId, functionDeclaration: CALLS.recheck, returnByValue: true } }));
      need(recheck.result.value === selected.baseline);
      // Capture complete bounded replies, including unknown native rosters.
      // This stage deliberately performs no native-function qualification.
      result = freezeDeep(currentFootprintSavedCacheObservationSchema.parse({ profile: "easyeda-pro-control.saved-cache-native-observation.v1", engine: this.#engine,
        descriptors: JSON.parse(selected.baseline) as unknown, arrayMetadata, constructorMetadata, matchMetadata,
        originalHandlesRechecked: true, cacheStorageGetterInvoked: false, matchInvoked: false, nativeMatchQualified: false, replayTokenIssued: false, executionAuthorized: false }));
      need(Buffer.byteLength(JSON.stringify(result)) <= LIMITS.resultBytes && this.#raw.length === LIMITS.normal);
    } catch (error) { failed = true; failure = error; this.#failure = Object.freeze({ phase: this.#position, replyIndex: this.#raw.length === 0 ? null : this.#raw.length - 1 }); }
    try {
      need(!this.#releaseAttempted); this.#releaseAttempted = true;
      z.object({}).strict().parse(await this.#request({ cacheNativePhase: "release", method: "Runtime.releaseObjectGroup", sessionId: this.#binding.sessionId, params: { objectGroup: GROUP } }));
      this.#released = true;
    } catch (error) { if (failed) { throw new AggregateError([failure, error], "SAVED_CACHE_NATIVE_PROBE_CLEANUP", { cause: error }); } throw error; }
    if (failed) { throw failure; } need(result !== null); return result;
  }
}
