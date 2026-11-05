/** Unmounted mixed-origin registration reader. The enclosing future owner must
 * supply its original route and fresh reproof transport. This runner issues data
 * only, never the v1 RPC lease, a native budget reservation or writer authority. */
import { types } from "node:util";
import { z } from "zod";
import { canonicalJson, sha256Text } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { requireCurrentFootprintCopyUiSource } from "./current-footprint-copy-ui-source.ts";
import type { CurrentFootprintCopyUiSourceQualification } from "./current-footprint-copy-ui-source.ts";
import { decodeCurrentFootprintCopyClockRegistrationNative as decodeNative,
  decodeCurrentFootprintCopyClockRegistrationScope as decodeScope } from "./current-footprint-copy-clock-registration-contract.ts";
import { decodeCurrentFootprintCopyClockRegistrationV2Array as decodeArray,
  decodeCurrentFootprintCopyClockRegistrationV2Function as decodeFunction,
  validateCurrentFootprintCopyClockRegistrationV2Command as validateCommand } from "./current-footprint-copy-clock-registration-v2-contract.ts";
import type { CurrentFootprintCopyClockRegistrationV2Command as Command } from "./current-footprint-copy-clock-registration-v2-contract.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_FLAGS as FLAGS,
  CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_GROUP as GROUP } from "./current-footprint-copy-clock-registration-v2-programs.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_SOURCE as SOURCE, assertCurrentFootprintCopyClockRegistrationV2Function,
  captureCurrentFootprintCopyClockRegistrationV2SourceReply, qualifyCurrentFootprintCopyClockRegistrationV2Source,
  requireCurrentFootprintCopyClockRegistrationV2Source } from "./current-footprint-copy-clock-registration-v2-source.ts";
import type { CurrentFootprintCopyClockRegistrationV2Source, CurrentFootprintCopyClockRegistrationV2Role as Role } from "./current-footprint-copy-clock-registration-v2-source.ts";
import type { CurrentFootprintCopyClockRpcV2RegistrationBinding, CurrentFootprintCopyClockRpcV2RegistrationRetention } from "./current-footprint-copy-clock-rpc-v2-retention.ts";

const rpcRetentions = new WeakMap<CurrentFootprintCopyClockRpcV2RegistrationRetention, Readonly<{
  binding: CurrentFootprintCopyClockRpcV2RegistrationBinding; assertOriginal: () => void;
}>>();
/** Resolve only this runner's opaque retention and recheck its exact references.
 * Normal resolution ends on failure or release. Cleanup retains no sampling
 * eligibility. Equal JSON, copied tokens and proxies retain no handles. */
export function requireCurrentFootprintCopyClockRpcV2RegistrationRetention(token: CurrentFootprintCopyClockRpcV2RegistrationRetention, cleanup = false): CurrentFootprintCopyClockRpcV2RegistrationBinding {
  const retained = rpcRetentions.get(token); need(!types.isProxy(token) && retained !== undefined && typeof cleanup === "boolean");
  if (cleanup) { retained.binding.assertCleanup(); } else { retained.assertOriginal(); } return retained.binding;
}

const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const bindingSchema = z.object({ sessionId: handle.max(128), uiRoute: handle, projectUuid: z.string().regex(/^[a-f\d]{64}$/u),
  branchUuid: z.string().regex(/^[a-f\d]{32}$/u), windowTabId: z.string().regex(/^[A-Za-z\d_-]{1,128}$/u) }).strict();
type Binding = Readonly<z.infer<typeof bindingSchema>>;
export interface CurrentFootprintCopyClockRegistrationV2Transport {
  readonly assertCurrent: () => Promise<void>;
  readonly request: (command: Command) => Promise<unknown>;
}
export const CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_REQUESTS = Object.freeze({ observe: 18, sample: 5, maximumAdditionalSamples: 4, release: 1, total: 39,
  nativeBudgetReserved: false, nativeMounted: false });
const denied = { documentClockInvocationObserved: z.literal(false), responderExclusivityProven: z.literal(false), backendOwnershipProven: z.literal(false),
  nativeBudgetReserved: z.literal(false), nativeMounted: z.literal(false), executionAuthorized: z.literal(false) };
export const currentFootprintCopyClockRegistrationV2ObservationSchema = z.object({ profile: z.literal("private.current-footprint-copy-clock-registration.v2"),
  wrapperCopy: z.literal("preload-La"), wrapperSourceSha256: z.literal(SOURCE.wrapper.sha256), callbackSourceSha256: z.literal(SOURCE.callback.sha256),
  completeWrapperSourceQualified: z.literal(true), completeCallbackSourceQualified: z.literal(true), distinctScriptIdentitiesRetained: z.literal(true),
  originalNotificationBusRetained: z.literal(true), originalRpcWrapperAndCallbackRetained: z.literal(true), originalNativeDateNowRetained: z.literal(true),
  initialLexicalOffset: z.number().int().refine(value => !Object.is(value, -0)), ...denied }).strict();
export type CurrentFootprintCopyClockRegistrationV2Observation = Readonly<z.infer<typeof currentFootprintCopyClockRegistrationV2ObservationSchema>>;
export const currentFootprintCopyClockRegistrationV2SampleSchema = z.object({ profile: z.literal("private.current-footprint-copy-clock-registration-sample.v2"),
  sampleIndex: z.number().int().min(1).max(4), lexicalOffset: z.number().int().refine(value => !Object.is(value, -0)), ...denied }).strict();
export type CurrentFootprintCopyClockRegistrationV2Sample = Readonly<z.infer<typeof currentFootprintCopyClockRegistrationV2SampleSchema>>;
type Stage = "initial" | "wrapper-metadata" | "wrapper-source" | "wrapper-scope" | "callback" | "callback-metadata" | "callback-source" | "callback-scope" |
  "bindings" | "native-now" | "native-name" | "sample" | "release";
interface ReplyDigest { readonly sha256: string; readonly jsonBytes: number }
interface Failure { readonly stage: Stage; readonly requestIndex: number | null; readonly reply: ReplyDigest | null;
  readonly digestEncoding: "canonical-json-utf8"; readonly executionAuthorized: false }
interface Retained { readonly first: string; readonly wrapper: string; readonly callback: string; readonly bindings: string }
const yesNumber = z.object({ result: z.object({ type: z.literal("number"), value: z.number().int() }).strict() }).strict();
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_CLOCK_REGISTRATION_V2_OWNER"); } }
function methods(transport: CurrentFootprintCopyClockRegistrationV2Transport): readonly unknown[] {
  need(transport !== null && typeof transport === "object" && !types.isProxy(transport) &&
    (Object.getPrototypeOf(transport) === Object.prototype || Object.getPrototypeOf(transport) === null) && Reflect.ownKeys(transport).length === 2);
  return ["assertCurrent", "request"].map(name => { const entry = Object.getOwnPropertyDescriptor(transport, name);
    need(entry !== undefined && Object.hasOwn(entry, "value") && entry.enumerable === true && typeof entry.value === "function"); return entry.value as unknown; });
}

export class CurrentFootprintCopyClockRegistrationV2Runner {
  readonly #source: CurrentFootprintCopyUiSourceQualification;
  readonly #transport: CurrentFootprintCopyClockRegistrationV2Transport;
  readonly #methods: readonly unknown[];
  readonly #binding: Binding;
  readonly #raw: unknown[] = [];
  readonly #samples: CurrentFootprintCopyClockRegistrationV2Sample[] = [];
  readonly #sources: Partial<Record<Role, Readonly<{ scriptId: string; qualified: CurrentFootprintCopyClockRegistrationV2Source }>>> = {};
  #retained: Retained | null = null;
  #packet: CurrentFootprintCopyClockRegistrationV2Observation | null = null;
  #attempted = false;
  #failed = false;
  #busy = false;
  #releaseAttempted = false;
  #released = false;
  #requests = 0;
  #operationRequests = 0;
  #maximum = 0;
  #sampleAttempts = 0;
  #stage: Stage = "initial";
  #requestDispatched = false;
  #lastReply: ReplyDigest | null = null;
  #failure: Failure | null = null;
  #rpcRetention: CurrentFootprintCopyClockRpcV2RegistrationRetention | null = null;

  /** This private composition input authenticates no native owner by itself.
   * A later genuine UI issuer must bind this exact route and original transport. */
  public constructor(source: CurrentFootprintCopyUiSourceQualification, transport: CurrentFootprintCopyClockRegistrationV2Transport, binding: Binding) {
    requireCurrentFootprintCopyUiSource(source); this.#source = source; this.#transport = transport; this.#methods = methods(transport);
    this.#binding = Object.freeze(bindingSchema.parse(captureCurrentPcbStringClockReply(binding).value));
  }
  #same(): void {
    need(!this.#failed && !this.#releaseAttempted); this.#sameReferences();
  }
  #sameReferences(): void {
    need(methods(this.#transport).every((item, index) => item === this.#methods[index]));
    requireCurrentFootprintCopyUiSource(this.#source);
    for (const role of ["wrapper", "callback"] as const) { const source = this.#sources[role]; if (source !== undefined) { requireCurrentFootprintCopyClockRegistrationV2Source(source.qualified, role); } }
  }
  async #current(): Promise<void> { this.#same(); await this.#transport.assertCurrent(); this.#same(); }
  #retainFailure(): void {
    this.#failed = true;
    this.#failure ??= Object.freeze({ stage: this.#stage, requestIndex: this.#requestDispatched ? this.#requests : null, reply: this.#lastReply, digestEncoding: "canonical-json-utf8", executionAuthorized: false });
  }
  async #request(command: Command): Promise<unknown> {
    this.#lastReply = null; this.#requestDispatched = false;
    await this.#current(); need(this.#operationRequests < this.#maximum && this.#requests < CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_REQUESTS.total - 1);
    const fixed = validateCommand(command); this.#operationRequests += 1; this.#requests += 1; this.#requestDispatched = true;
    const raw = await this.#transport.request(fixed);
    const sourceRole = fixed.phase === "wrapper-source" ? "wrapper" : "callback";
    const captured = fixed.method === "Debugger.getScriptSource" ? captureCurrentFootprintCopyClockRegistrationV2SourceReply(sourceRole, raw) : captureCurrentPcbStringClockReply(raw).value;
    this.#raw.push(captured);
    const text = canonicalJson(captured); this.#lastReply = Object.freeze({ sha256: sha256Text(text), jsonBytes: Buffer.byteLength(text) });
    await this.#current(); return captured;
  }
  #values(): readonly Readonly<{ value: string }>[] { return [{ value: this.#binding.projectUuid }, { value: this.#binding.branchUuid }, { value: this.#binding.windowTabId }]; }
  #properties(objectId: string): Promise<unknown> { return this.#request({ phase: "properties", method: "Runtime.getProperties", sessionId: this.#binding.sessionId, params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  #call(phase: keyof typeof CALLS, objectId: string, args: readonly Readonly<{ objectId: string } | { value: string }>[]): Promise<unknown> {
    return this.#request({ phase, method: "Runtime.callFunctionOn", sessionId: this.#binding.sessionId, params: { ...FLAGS, objectId,
      functionDeclaration: CALLS[phase].program, arguments: args, returnByValue: CALLS[phase].returnByValue } });
  }
  async #array(phase: "initial" | "bindings", objectId: string, args: readonly Readonly<{ objectId: string } | { value: string }>[]): Promise<Readonly<{ id: string; ids: readonly string[] }>> {
    this.#stage = phase;
    const reply = z.object({ result: z.object({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"), description: z.literal(phase === "initial" ? "Array(10)" : "Array(4)"), objectId: handle }).strict() }).strict().parse(await this.#call(phase, objectId, args));
    return Object.freeze({ id: reply.result.objectId, ids: decodeArray(await this.#properties(reply.result.objectId), phase) });
  }
  async #scope(id: string, role: Role): Promise<string> {
    this.#stage = `${role}-metadata`;
    const existing = this.#sources[role], metadata = decodeFunction(await this.#properties(id), role, existing?.scriptId);
    if (existing === undefined) {
      need(this.#sources[role === "wrapper" ? "callback" : "wrapper"]?.scriptId !== metadata.scriptId);
      this.#stage = `${role}-source`;
      const raw = await this.#request({ phase: `${role}-source`, method: "Debugger.getScriptSource", sessionId: this.#binding.sessionId, params: { scriptId: metadata.scriptId } });
      const reply = captureCurrentFootprintCopyClockRegistrationV2SourceReply(role, raw);
      this.#sources[role] = Object.freeze({ scriptId: metadata.scriptId, qualified: qualifyCurrentFootprintCopyClockRegistrationV2Source(role, reply.scriptSource) });
    }
    this.#stage = `${role}-scope`; return decodeScope(await this.#properties(metadata.scopesId), role);
  }
  async #sample(retained: Retained): Promise<number> {
    const wrapperScope = await this.#scope(retained.wrapper, "wrapper");
    const callbackScope = await this.#scope(retained.callback, "callback");
    this.#stage = "sample";
    const objects = [wrapperScope, retained.first, retained.callback, retained.bindings].map(objectId => ({ objectId }));
    const reply = yesNumber.parse(await this.#call("sample", callbackScope, [...objects, ...this.#values()])); need(!Object.is(reply.result.value, -0)); return reply.result.value;
  }
  public async observe(): Promise<CurrentFootprintCopyClockRegistrationV2Observation> {
    need(!this.#attempted && !this.#busy); this.#attempted = true; this.#busy = true; this.#operationRequests = 0; this.#maximum = CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_REQUESTS.observe;
    try {
      const first = await this.#array("initial", this.#binding.uiRoute, this.#values()), getter = first.ids[8], wrapper = first.ids[4]; need(wrapper !== undefined && getter !== undefined);
      const wrapperScope = await this.#scope(wrapper, "wrapper"); this.#stage = "callback";
      const reply = z.object({ result: z.object({ type: z.literal("function"), className: z.literal("Function"), description: z.string().max(8192), objectId: handle }).strict() }).strict().parse(await this.#call("callback", wrapperScope, []));
      assertCurrentFootprintCopyClockRegistrationV2Function("callback", reply.result.description);
      const callback = reply.result.objectId; need(callback !== wrapper); const callbackScope = await this.#scope(callback, "callback");
      const bindings = await this.#array("bindings", callbackScope, [{ objectId: wrapperScope }, { objectId: first.id }, { objectId: callback }, ...this.#values()]);
      const now = bindings.ids[3]; need(now !== undefined);
      this.#stage = "native-now"; decodeNative(await this.#properties(now), "now");
      this.#stage = "native-name"; decodeNative(await this.#properties(getter), "name");
      const retained = Object.freeze({ first: first.id, wrapper, callback, bindings: bindings.id }); this.#retained = retained;
      const offset = await this.#sample(retained);
      need(this.#operationRequests === CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_REQUESTS.observe && this.#sources.wrapper !== undefined && this.#sources.callback !== undefined);
      this.#packet = Object.freeze(currentFootprintCopyClockRegistrationV2ObservationSchema.parse({ profile: "private.current-footprint-copy-clock-registration.v2",
        wrapperCopy: "preload-La", wrapperSourceSha256: SOURCE.wrapper.sha256, callbackSourceSha256: SOURCE.callback.sha256,
        completeWrapperSourceQualified: true, completeCallbackSourceQualified: true, distinctScriptIdentitiesRetained: true,
        originalNotificationBusRetained: true, originalRpcWrapperAndCallbackRetained: true, originalNativeDateNowRetained: true, initialLexicalOffset: offset,
        documentClockInvocationObserved: false, responderExclusivityProven: false, backendOwnershipProven: false, nativeBudgetReserved: false, nativeMounted: false, executionAuthorized: false }));
      return this.#packet;
    } catch (error) { this.#retainFailure(); throw error; } finally { this.#busy = false; }
  }
  public async sampleOriginal(packet: CurrentFootprintCopyClockRegistrationV2Observation): Promise<CurrentFootprintCopyClockRegistrationV2Sample> {
    need(!this.#busy && this.#sampleAttempts < CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_REQUESTS.maximumAdditionalSamples);
    this.#busy = true; this.#sampleAttempts += 1; this.#operationRequests = 0; this.#maximum = CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_REQUESTS.sample;
    this.#stage = "sample"; this.#lastReply = null; this.#requestDispatched = false;
    try {
      await this.#current(); need(packet === this.#packet && this.#packet !== null && this.#retained !== null);
      const offset = await this.#sample(this.#retained); need(this.#operationRequests === CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_REQUESTS.sample);
      const sample = Object.freeze(currentFootprintCopyClockRegistrationV2SampleSchema.parse({ profile: "private.current-footprint-copy-clock-registration-sample.v2",
        sampleIndex: this.#sampleAttempts, lexicalOffset: offset, documentClockInvocationObserved: false, responderExclusivityProven: false,
        backendOwnershipProven: false, nativeBudgetReserved: false, nativeMounted: false, executionAuthorized: false })); this.#samples.push(sample); return sample;
    } catch (error) { this.#retainFailure(); throw error; } finally { this.#busy = false; }
  }
  /** Retains these exact private references only. This token grants no native
   * owner, budget or invocation lease and cannot be recreated from packet JSON.
   * Existing RPC cleanup keeps these references after sampling fails or this
   * registration begins release; every normal guard remains consumed. */
  public retainForRpc(packet: CurrentFootprintCopyClockRegistrationV2Observation): CurrentFootprintCopyClockRpcV2RegistrationRetention {
    this.#same(); const retained = this.#retained; const wrapper = this.#sources.wrapper; const callback = this.#sources.callback;
    need(!this.#busy && packet === this.#packet && packet !== null && retained !== null && wrapper !== undefined && callback !== undefined && wrapper.scriptId !== callback.scriptId);
    if (this.#rpcRetention !== null) { return this.#rpcRetention; }
    const references = (): void => { need(this.#retained === retained && this.#packet === packet && this.#sources.wrapper === wrapper && this.#sources.callback === callback); };
    const same = (): void => { this.#same(); references(); };
    const cleanup = (): void => { this.#sameReferences(); references(); };
    const token = Object.freeze({ profile: "private.current-footprint-clock-rpc-registration-retention.v2" as const });
    const binding = Object.freeze({ issuer: this, ...this.#binding, wrapperScriptId: wrapper.scriptId, callbackScriptId: callback.scriptId,
      registrationArrayObjectId: retained.first, wrapperObjectId: retained.wrapper, callbackObjectId: retained.callback, bindingsArrayObjectId: retained.bindings,
      wrapperSource: wrapper.qualified, callbackSource: callback.qualified, assertCleanup: cleanup,
      assertOriginal: async (): Promise<void> => { same(); await this.#current(); same(); },
    });
    rpcRetentions.set(token, Object.freeze({ binding, assertOriginal: same }));
    this.#rpcRetention = token; return token;
  }
  public async release(): Promise<void> {
    need(!this.#busy && this.#attempted && !this.#releaseAttempted); this.#releaseAttempted = true; this.#busy = true; this.#stage = "release"; this.#lastReply = null; this.#requestDispatched = false;
    try {
      need(methods(this.#transport).every((item, index) => item === this.#methods[index])); await this.#transport.assertCurrent();
      need(methods(this.#transport).every((item, index) => item === this.#methods[index]) && this.#requests < CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_REQUESTS.total); this.#requests += 1; this.#requestDispatched = true;
      const reply = captureCurrentPcbStringClockReply(await this.#transport.request(validateCommand({ phase: "release", method: "Runtime.releaseObjectGroup", sessionId: this.#binding.sessionId, params: { objectGroup: GROUP } }))).value;
      this.#raw.push(reply); const text = canonicalJson(reply); this.#lastReply = Object.freeze({ sha256: sha256Text(text), jsonBytes: Buffer.byteLength(text) });
      z.object({}).strict().parse(reply); await this.#transport.assertCurrent(); need(methods(this.#transport).every((item, index) => item === this.#methods[index])); this.#released = true;
    } catch (error) { this.#retainFailure(); throw error; } finally { this.#busy = false; }
  }
  /** Complete replies remain private evidence. This is not a tool response or
   * source/handle input API; the future owner must project bounded diagnostics. */
  public retained(): Readonly<{ attempted: boolean; completed: boolean; failed: boolean; requests: number; releaseAttempted: boolean; released: boolean;
    replies: readonly unknown[]; samples: readonly CurrentFootprintCopyClockRegistrationV2Sample[]; failure: Failure | null }> {
    return Object.freeze({ attempted: this.#attempted, completed: this.#packet !== null, failed: this.#failed, requests: this.#requests,
      releaseAttempted: this.#releaseAttempted, released: this.#released, replies: Object.freeze([...this.#raw]), samples: Object.freeze([...this.#samples]), failure: this.#failure });
  }
}
