/** Retains the actual original renderer registration and fresh lexical Jd
 * samples. These samples are not native document-clock results or backend proof. */
import { types } from "node:util";
import { z } from "zod";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_FLAGS as FLAGS,
  CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_GROUP as GROUP, decodeCurrentFootprintCopyClockRegistrationArray as decodeArray,
  decodeCurrentFootprintCopyClockRegistrationFunction as decodeFunction, decodeCurrentFootprintCopyClockRegistrationNative as decodeNative,
  decodeCurrentFootprintCopyClockRegistrationScope as decodeScope, validateCurrentFootprintCopyClockRegistrationCommand } from "./current-footprint-copy-clock-registration-contract.ts";
import type { CurrentFootprintCopyClockRegistrationCommand as Command } from "./current-footprint-copy-clock-registration-contract.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_SOURCE as SOURCE, assertCurrentFootprintCopyClockRegistrationFunction,
  captureCurrentFootprintCopyClockRegistrationSourceReply, qualifyCurrentFootprintCopyClockRegistrationSource,
  requireCurrentFootprintCopyClockRegistrationSource } from "./current-footprint-copy-clock-registration-source.ts";
import type { CurrentFootprintCopyClockRegistrationSource, CurrentFootprintCopyClockRegistrationFunction as Role } from "./current-footprint-copy-clock-registration-source.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { requireCurrentFootprintCopyUiSource } from "./current-footprint-copy-ui-source.ts";
import type { CurrentFootprintCopyUiSourceQualification } from "./current-footprint-copy-ui-source.ts";
import { qualifyCurrentFootprintCopyClockRpcSource, requireCurrentFootprintCopyClockRpcSource } from "./current-footprint-copy-clock-rpc-source.ts";
import type { CurrentFootprintCopyClockRpcSource } from "./current-footprint-copy-clock-rpc-source.ts";
import type { CurrentFootprintCopyClockRpcRegistrationBinding, CurrentFootprintCopyClockRpcRegistrationLease } from "./current-footprint-copy-clock-rpc-leases.ts";

const invocationLeases = new WeakMap<CurrentFootprintCopyClockRpcRegistrationLease, CurrentFootprintCopyClockRpcRegistrationBinding>();
/** No binding factory is exported. Only the original completed runner issues a
 * token; serialized observations and equal handle strings cannot recreate it. */
export function requireCurrentFootprintCopyClockRpcRegistrationLease(lease: CurrentFootprintCopyClockRpcRegistrationLease): CurrentFootprintCopyClockRpcRegistrationBinding {
  const binding = invocationLeases.get(lease); if (binding === undefined) { throw new Error("FOOTPRINT_CLOCK_RPC_REGISTRATION_LEASE"); }
  binding.assertCleanup(); return binding;
}

const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const bindingSchema = z.object({ sessionId: handle.max(128), uiRoute: handle, projectUuid: z.string().regex(/^[a-f\d]{64}$/u),
  branchUuid: z.string().regex(/^[a-f\d]{32}$/u), windowTabId: z.string().regex(/^[A-Za-z\d_-]{1,128}$/u) }).strict();
export type CurrentFootprintCopyClockRegistrationBinding = Readonly<z.infer<typeof bindingSchema>>;
export interface CurrentFootprintCopyClockRegistrationTransport { readonly assertCurrent: () => Promise<void>; readonly request: (command: Command) => Promise<unknown> }
export const CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_REQUESTS = Object.freeze({ observe: 17, sample: 5, maximumAdditionalSamples: 4, release: 1, total: 38 });
export const currentFootprintCopyClockRegistrationObservationSchema = z.object({ profile: z.literal("private.current-footprint-copy-clock-registration.v1"),
  runtimeWsSourceQualified: z.literal(true), originalNotificationBusRetained: z.literal(true), originalRpcWrapperAndCallbackRetained: z.literal(true),
  originalNativeDateNowRetained: z.literal(true), initialLexicalOffset: z.number().int(),
  documentClockInvocationObserved: z.literal(false), responderExclusivityProven: z.literal(false), backendOwnershipProven: z.literal(false), executionAuthorized: z.literal(false) }).strict();
export type CurrentFootprintCopyClockRegistrationObservation = Readonly<z.infer<typeof currentFootprintCopyClockRegistrationObservationSchema>>;
export const currentFootprintCopyClockRegistrationSampleSchema = z.object({ profile: z.literal("private.current-footprint-copy-clock-registration-sample.v1"),
  sampleIndex: z.number().int().min(1).max(4), lexicalOffset: z.number().int(), documentClockInvocationObserved: z.literal(false), executionAuthorized: z.literal(false) }).strict();
export type CurrentFootprintCopyClockRegistrationSample = Readonly<z.infer<typeof currentFootprintCopyClockRegistrationSampleSchema>>;
interface Retained { readonly first: string; readonly wrapper: string; readonly callback: string; readonly bindings: string }
const yesNumber = z.object({ result: z.object({ type: z.literal("number"), value: z.number().int() }).strict() }).strict();
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_COPY_CLOCK_REGISTRATION_OWNER"); } }
function methods(transport: CurrentFootprintCopyClockRegistrationTransport): readonly unknown[] {
  need(!types.isProxy(transport) && (Object.getPrototypeOf(transport) === Object.prototype || Object.getPrototypeOf(transport) === null) && Reflect.ownKeys(transport).length === 2);
  return ["assertCurrent", "request"].map(name => { const descriptor = Object.getOwnPropertyDescriptor(transport, name); need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === "function"); return descriptor.value as unknown; });
}
export class CurrentFootprintCopyClockRegistrationRunner {
  readonly #source: CurrentFootprintCopyUiSourceQualification;
  readonly #transport: CurrentFootprintCopyClockRegistrationTransport;
  readonly #methods: readonly unknown[];
  readonly #binding: CurrentFootprintCopyClockRegistrationBinding;
  readonly #raw: unknown[] = [];
  readonly #samples: CurrentFootprintCopyClockRegistrationSample[] = [];
  #wsSource: CurrentFootprintCopyClockRegistrationSource | null = null;
  #scriptId: string | null = null;
  #retained: Retained | null = null;
  #packet: CurrentFootprintCopyClockRegistrationObservation | null = null;
  #attempted = false;
  #failed = false;
  #busy = false;
  #releaseAttempted = false;
  #released = false;
  #requests = 0;
  #operationRequests = 0;
  #maximum = 0;
  #sampleAttempts = 0;
  #rpcSource: CurrentFootprintCopyClockRpcSource | null = null;
  #rpcSourceText: string | null = null;
  #rpcLease: CurrentFootprintCopyClockRpcRegistrationLease | null = null;
  public constructor(source: CurrentFootprintCopyUiSourceQualification, transport: CurrentFootprintCopyClockRegistrationTransport, binding: CurrentFootprintCopyClockRegistrationBinding) {
    requireCurrentFootprintCopyUiSource(source); this.#source = source; this.#methods = methods(transport); this.#transport = transport;
    this.#binding = Object.freeze(bindingSchema.parse(captureCurrentPcbStringClockReply(binding).value));
  }
  #same(): void { need(!this.#failed && !this.#releaseAttempted && methods(this.#transport).every((item, index) => item === this.#methods[index])); requireCurrentFootprintCopyUiSource(this.#source); if (this.#wsSource !== null) { requireCurrentFootprintCopyClockRegistrationSource(this.#wsSource); } }
  async #current(): Promise<void> { this.#same(); await this.#transport.assertCurrent(); this.#same(); }
  async #request(command: Command): Promise<unknown> {
    await this.#current(); need(this.#operationRequests < this.#maximum && this.#requests < CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_REQUESTS.total - 1);
    const fixed = validateCurrentFootprintCopyClockRegistrationCommand(command); this.#operationRequests += 1; this.#requests += 1;
    const raw = await this.#transport.request(fixed), result = fixed.phase === "source" ? captureCurrentFootprintCopyClockRegistrationSourceReply(raw) : captureCurrentPcbStringClockReply(raw).value;
    this.#raw.push(result); await this.#current(); return result;
  }
  #values(): readonly Readonly<{ value: string }>[] { return [{ value: this.#binding.projectUuid }, { value: this.#binding.branchUuid }, { value: this.#binding.windowTabId }]; }
  #properties(objectId: string): Promise<unknown> { return this.#request({ phase: "properties", method: "Runtime.getProperties", sessionId: this.#binding.sessionId, params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  #call(phase: keyof typeof CALLS, objectId: string, args: readonly Readonly<{ objectId: string } | { value: string }>[]): Promise<unknown> {
    return this.#request({ phase, method: "Runtime.callFunctionOn", sessionId: this.#binding.sessionId, params: { ...FLAGS, objectId,
      functionDeclaration: CALLS[phase].program, arguments: args, returnByValue: CALLS[phase].returnByValue } });
  }
  async #array(phase: "initial" | "bindings", objectId: string, args: readonly Readonly<{ objectId: string } | { value: string }>[]): Promise<Readonly<{ id: string; ids: readonly string[] }>> {
    const reply = z.object({ result: z.object({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"), description: z.literal(phase === "initial" ? "Array(10)" : "Array(4)"), objectId: handle }).strict() }).strict().parse(await this.#call(phase, objectId, args));
    return Object.freeze({ id: reply.result.objectId, ids: decodeArray(await this.#properties(reply.result.objectId), phase) });
  }
  async #scope(id: string, role: Role): Promise<string> {
    const metadata = decodeFunction(await this.#properties(id), role, this.#scriptId ?? undefined);
    if (this.#wsSource === null) {
      need(this.#scriptId === null); this.#scriptId = metadata.scriptId;
      const reply = z.object({ scriptSource: z.string().max(SOURCE.bytes) }).strict().parse(await this.#request({ phase: "source", method: "Debugger.getScriptSource", sessionId: this.#binding.sessionId, params: { scriptId: metadata.scriptId } }));
      this.#wsSource = qualifyCurrentFootprintCopyClockRegistrationSource(reply.scriptSource);
      this.#rpcSourceText = reply.scriptSource;
    }
    return decodeScope(await this.#properties(metadata.scopesId), role);
  }
  async #sample(retained: Retained): Promise<number> {
    // Obtain fresh scope wrappers. Reusing V8's old scope object could retain an
    // Earlier offset when the websocket pong callback changes lexical Jd.
    const wrapperScope = await this.#scope(retained.wrapper, "wrapper"); const callbackScope = await this.#scope(retained.callback, "callback");
    const objects = [wrapperScope, retained.first, retained.callback, retained.bindings].map(objectId => ({ objectId }));
    const reply = yesNumber.parse(await this.#call("sample", callbackScope, [...objects, ...this.#values()])); need(!Object.is(reply.result.value, -0)); return reply.result.value;
  }
  public async observe(): Promise<CurrentFootprintCopyClockRegistrationObservation> {
    need(!this.#attempted && !this.#busy); this.#attempted = true; this.#busy = true; this.#operationRequests = 0; this.#maximum = CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_REQUESTS.observe;
    try {
      const first = await this.#array("initial", this.#binding.uiRoute, this.#values()), getter = first.ids[8], wrapper = first.ids[4]; need(wrapper !== undefined && getter !== undefined);
      const wrapperScope = await this.#scope(wrapper, "wrapper");
      const reply = z.object({ result: z.object({ type: z.literal("function"), className: z.literal("Function"), description: z.string().max(8192), objectId: handle }).strict() }).strict().parse(await this.#call("callback", wrapperScope, []));
      assertCurrentFootprintCopyClockRegistrationFunction("callback", reply.result.description); const callback = reply.result.objectId, callbackScope = await this.#scope(callback, "callback");
      const bindings = await this.#array("bindings", callbackScope, [{ objectId: wrapperScope }, { objectId: first.id }, { objectId: callback }, ...this.#values()]);
      const now = bindings.ids[3]; need(now !== undefined); decodeNative(await this.#properties(now), "now"); decodeNative(await this.#properties(getter), "name");
      const retained = Object.freeze({ first: first.id, wrapper, callback, bindings: bindings.id }); this.#retained = retained;
      const offset = await this.#sample(retained); need(this.#operationRequests === CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_REQUESTS.observe && this.#wsSource !== null);
      this.#packet = Object.freeze(currentFootprintCopyClockRegistrationObservationSchema.parse({ profile: "private.current-footprint-copy-clock-registration.v1", runtimeWsSourceQualified: true,
        originalNotificationBusRetained: true, originalRpcWrapperAndCallbackRetained: true, originalNativeDateNowRetained: true, initialLexicalOffset: offset,
        documentClockInvocationObserved: false, responderExclusivityProven: false, backendOwnershipProven: false, executionAuthorized: false })); return this.#packet;
    } catch (error) { this.#failed = true; throw error; } finally { this.#busy = false; }
  }
  /** A bounded registration sample only. The future document-clock event
   * collector must independently join the actual original callback invocation. */
  public async sampleOriginal(packet: CurrentFootprintCopyClockRegistrationObservation): Promise<CurrentFootprintCopyClockRegistrationSample> {
    need(!this.#busy && this.#sampleAttempts < CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_REQUESTS.maximumAdditionalSamples); this.#busy = true; this.#sampleAttempts += 1;
    this.#operationRequests = 0; this.#maximum = CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_REQUESTS.sample;
    try {
      await this.#current(); need(packet === this.#packet && this.#packet !== null && this.#retained !== null);
      const offset = await this.#sample(this.#retained); need(this.#operationRequests === CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_REQUESTS.sample);
      const sample = Object.freeze(currentFootprintCopyClockRegistrationSampleSchema.parse({ profile: "private.current-footprint-copy-clock-registration-sample.v1",
        sampleIndex: this.#sampleAttempts, lexicalOffset: offset, documentClockInvocationObserved: false, executionAuthorized: false })); this.#samples.push(sample); return sample;
    } catch (error) { this.#failed = true; throw error; } finally { this.#busy = false; }
  }
  /** Source/registration retention only. A combined native owner must still
   * join this exact issuer to its own worker, event router and kernel handles. */
  public issueInvocationLease(packet: CurrentFootprintCopyClockRegistrationObservation): CurrentFootprintCopyClockRpcRegistrationLease {
    this.#same();
    if (this.#rpcSource === null && this.#rpcSourceText !== null) { this.#rpcSource = qualifyCurrentFootprintCopyClockRpcSource("ui", this.#rpcSourceText); }
    const retained = this.#retained; const source = this.#rpcSource; const scriptId = this.#scriptId;
    need(!this.#busy && packet === this.#packet && packet !== null && retained !== null && source !== null && scriptId !== null);
    requireCurrentFootprintCopyClockRpcSource(source, "ui");
    if (this.#rpcLease !== null) { return this.#rpcLease; }
    const same = (): void => {
      need(this.#retained === retained && this.#rpcSource === source && this.#scriptId === scriptId && this.#packet === packet &&
        !this.#released && !this.#releaseAttempted && methods(this.#transport).every((value, index) => value === this.#methods[index]));
      requireCurrentFootprintCopyClockRpcSource(source, "ui");
    };
    const lease = Object.freeze({ profile: "private.current-footprint-clock-rpc-registration-lease.v1" as const });
    invocationLeases.set(lease, Object.freeze({ issuer: this, sessionId: this.#binding.sessionId, scriptId,
      registrationArrayObjectId: retained.first, callbackObjectId: retained.callback, bindingsArrayObjectId: retained.bindings,
      qualifiedSource: source, assertCleanup: same,
      assertOriginal: async (): Promise<void> => { same(); await this.#current(); same(); },
    }));
    this.#rpcLease = lease; return lease;
  }
  public async release(): Promise<void> {
    need(!this.#busy && this.#attempted && !this.#releaseAttempted); this.#releaseAttempted = true; this.#busy = true;
    try {
      need(methods(this.#transport).every((item, index) => item === this.#methods[index])); await this.#transport.assertCurrent();
      need(methods(this.#transport).every((item, index) => item === this.#methods[index])); this.#requests += 1;
      const reply = captureCurrentPcbStringClockReply(await this.#transport.request(validateCurrentFootprintCopyClockRegistrationCommand({ phase: "release", method: "Runtime.releaseObjectGroup", sessionId: this.#binding.sessionId, params: { objectGroup: GROUP } }))).value;
      this.#raw.push(reply); z.object({}).strict().parse(reply); await this.#transport.assertCurrent(); need(methods(this.#transport).every((item, index) => item === this.#methods[index])); this.#released = true;
    } catch (error) { this.#failed = true; throw error; } finally { this.#busy = false; }
  }
  public retained(): Readonly<{ attempted: boolean; completed: boolean; failed: boolean; requests: number; releaseAttempted: boolean; released: boolean; replies: readonly unknown[]; samples: readonly CurrentFootprintCopyClockRegistrationSample[] }> {
    return Object.freeze({ attempted: this.#attempted, completed: this.#packet !== null, failed: this.#failed, requests: this.#requests, releaseAttempted: this.#releaseAttempted,
      released: this.#released, replies: Object.freeze([...this.#raw]), samples: Object.freeze([...this.#samples]) });
  }
}
