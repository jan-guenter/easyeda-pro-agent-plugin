/** Descriptor-only manager route, issued by the retained original UI runner.
 * Named channel and retained Worker objects never imply a reciprocal CDP peer. */
import { types } from "node:util";
import { z } from "zod";
import { CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_CALLS as CALLS, decodeCurrentFootprintCopyManagerRouteArray as decodeArray,
  decodeCurrentFootprintCopyManagerRouteCallable as decodeCallable, decodeCurrentFootprintCopyManagerRouteFunction as decodeFunction,
  decodeCurrentFootprintCopyManagerRouteNativeGet as decodeNativeGet, decodeCurrentFootprintCopyManagerRouteNativeName as decodeNativeName, decodeCurrentFootprintCopyManagerRouteScope as decodeScope } from "./current-footprint-copy-manager-route-bindings.ts";
import { CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_FLAGS as FLAGS, CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_GROUP as GROUP, validateCurrentFootprintCopyManagerRouteCommand } from "./current-footprint-copy-manager-route-command.ts";
import type { CurrentFootprintCopyManagerRouteCommand as Command } from "./current-footprint-copy-manager-route-command.ts";
import { CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_SOURCE as SOURCE, captureCurrentFootprintCopyManagerRouteSourceReply, qualifyCurrentFootprintCopyManagerRouteSource, requireCurrentFootprintCopyManagerRouteSource } from "./current-footprint-copy-manager-route-source.ts";
import type { CurrentFootprintCopyManagerRouteSource, CurrentFootprintCopyManagerRouteFunction as Role } from "./current-footprint-copy-manager-route-source.ts";
import { requireCurrentFootprintCopyUiSource } from "./current-footprint-copy-ui-source.ts";
import type { CurrentFootprintCopyUiSourceQualification } from "./current-footprint-copy-ui-source.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const bindingSchema = z.object({ sessionId: handle.max(128), uiScriptId: handle, uiRoute: handle,
  projectUuid: z.string().regex(/^[a-f\d]{64}$/u), branchUuid: z.string().regex(/^[a-f\d]{32}$/u), windowTabId: z.string().regex(/^[A-Za-z\d_-]{1,128}$/u) }).strict();
export type CurrentFootprintCopyManagerRouteBinding = Readonly<z.infer<typeof bindingSchema>>;
export interface CurrentFootprintCopyManagerRouteTransport { readonly assertCurrent: () => Promise<void>; readonly request: (command: Command) => Promise<unknown> }
export const CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_REQUESTS = Object.freeze({ observe: 30, reprove: 7, release: 1 });
const legacyObservationSchema = z.object({ profile: z.literal("private.current-footprint-copy-manager-route.v1"),
  runtimeManagerSourceQualified: z.literal(true), originalUiBusSubscriptionRetained: z.literal(true), initializedProjectRegistryBound: z.literal(true),
  footprintReceiverAndWorkerBusBound: z.literal(true), managerWorkerObjectRetained: z.literal(true), initializedProjectChannelEntryMatched: z.literal(true), projectChannelNameMatched: z.literal(false),
  reciprocalWorkerPeerBound: z.literal(false), backendDynamicDispatchQualified: z.literal(false), executionAuthorized: z.literal(false) }).strict();
export const currentFootprintCopyManagerRouteObservationSchema = legacyObservationSchema.extend({
  profile: z.literal("private.current-footprint-copy-manager-route.v2"), projectChannelNameMatched: z.literal(true),
});
/** Historical records retain their original meaning. This union is for journal
 * decoding only; the live runner issues the strict v2 packet above. */
export const recordedCurrentFootprintCopyManagerRouteObservationSchema = z.discriminatedUnion("profile", [legacyObservationSchema, currentFootprintCopyManagerRouteObservationSchema]);
export type CurrentFootprintCopyManagerRouteObservation = Readonly<z.infer<typeof currentFootprintCopyManagerRouteObservationSchema>>;
interface Retained { readonly first: string; readonly wrapper: string; readonly role: "rpcUi" | "rpcManager"; readonly service: string; readonly handler: string; readonly registry: string; readonly project: string }
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_COPY_MANAGER_ROUTE_OWNER"); } }
function methods(transport: CurrentFootprintCopyManagerRouteTransport): readonly unknown[] {
  need(!types.isProxy(transport) && (Object.getPrototypeOf(transport) === Object.prototype || Object.getPrototypeOf(transport) === null) && Reflect.ownKeys(transport).length === 2);
  return ["assertCurrent", "request"].map(name => { const descriptor = Object.getOwnPropertyDescriptor(transport, name); need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === "function"); return descriptor.value as unknown; });
}
export class CurrentFootprintCopyManagerRouteRunner {
  readonly #uiSource: CurrentFootprintCopyUiSourceQualification;
  readonly #transport: CurrentFootprintCopyManagerRouteTransport;
  readonly #methods: readonly unknown[];
  readonly #binding: CurrentFootprintCopyManagerRouteBinding;
  readonly #raw: unknown[] = [];
  #managerSource: CurrentFootprintCopyManagerRouteSource | null = null;
  #managerScriptId: string | null = null;
  #retained: Retained | null = null;
  #packet: CurrentFootprintCopyManagerRouteObservation | null = null;
  #attempted = false;
  #failed = false;
  #busy = false;
  #released = false;
  #releaseAttempted = false;
  #requests = 0;
  #operationRequests = 0;
  #maximum = 0;
  public constructor(uiSource: CurrentFootprintCopyUiSourceQualification, transport: CurrentFootprintCopyManagerRouteTransport, binding: CurrentFootprintCopyManagerRouteBinding) {
    requireCurrentFootprintCopyUiSource(uiSource); this.#uiSource = uiSource; this.#methods = methods(transport); this.#transport = transport;
    this.#binding = Object.freeze(bindingSchema.parse(captureCurrentPcbStringClockReply(binding).value));
  }
  #same(): void {
    need(!this.#failed && !this.#releaseAttempted && methods(this.#transport).every((item, index) => item === this.#methods[index])); requireCurrentFootprintCopyUiSource(this.#uiSource);
    if (this.#managerSource !== null) { requireCurrentFootprintCopyManagerRouteSource(this.#managerSource); }
  }
  async #current(): Promise<void> { this.#same(); await this.#transport.assertCurrent(); this.#same(); }
  async #request(command: Command): Promise<unknown> {
    await this.#current(); need(this.#operationRequests < this.#maximum); const fixed = validateCurrentFootprintCopyManagerRouteCommand(command);
    this.#operationRequests += 1; this.#requests += 1;
    const raw = await this.#transport.request(fixed);
    const result = fixed.phase === "source" ? captureCurrentFootprintCopyManagerRouteSourceReply(raw) : captureCurrentPcbStringClockReply(raw).value;
    this.#raw.push(result); await this.#current(); return result;
  }
  #values(): readonly Readonly<{ value: string }>[] { return [{ value: this.#binding.projectUuid }, { value: this.#binding.branchUuid }, { value: this.#binding.windowTabId }]; }
  #properties(objectId: string): Promise<unknown> { return this.#request({ phase: "properties", method: "Runtime.getProperties", sessionId: this.#binding.sessionId, params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  #call(phase: keyof typeof CALLS, objectId: string, args: readonly Readonly<{ objectId: string } | { value: string }>[]): Promise<unknown> {
    return this.#request({ phase, method: "Runtime.callFunctionOn", sessionId: this.#binding.sessionId,
      params: { ...FLAGS, objectId, functionDeclaration: CALLS[phase].program, arguments: args, returnByValue: CALLS[phase].returnByValue } });
  }
  async #array(phase: "initial" | "registry" | "project", objectId: string, args: readonly Readonly<{ objectId: string } | { value: string }>[]): Promise<Readonly<{ id: string; values: ReturnType<typeof decodeArray> }>> {
    const count = { initial: 5, registry: 12, project: 11 }[phase];
    const description = `Array(${String(count)})`;
    const reply = z.object({ result: z.object({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"), description: z.literal(description), objectId: handle }).strict() }).strict().parse(await this.#call(phase, objectId, args));
    return Object.freeze({ id: reply.result.objectId, values: decodeArray(await this.#properties(reply.result.objectId), phase) });
  }
  async #metadata(id: string, role: Role): Promise<ReturnType<typeof decodeFunction>> {
    const manager = SOURCE.functions[role].bundle === "manager";
    const value = decodeFunction(await this.#properties(id), role, manager ? this.#managerScriptId ?? undefined : this.#binding.uiScriptId);
    if (manager && this.#managerSource === null) {
      // Read the same runtime script before following its lexical scope. Disk
      // Installation hashes alone cannot qualify a running callback.
      need(this.#managerScriptId === null); this.#managerScriptId = value.scriptId;
      const reply = z.object({ scriptSource: z.string().max(SOURCE.bytes) }).strict().parse(await this.#request({ phase: "source", method: "Debugger.getScriptSource", sessionId: this.#binding.sessionId, params: { scriptId: value.scriptId } }));
      this.#managerSource = qualifyCurrentFootprintCopyManagerRouteSource(reply.scriptSource);
    }
    return value;
  }
  async #scope(id: string, role: "rpcUi" | "rpcManager" | "service" | "handler"): Promise<string> {
    const value = await this.#metadata(id, role); const kind = role === "rpcUi" || role === "rpcManager" ? "rpc" : role;
    return decodeScope(await this.#properties(value.scopesId), kind);
  }
  async #recheck(retained: Retained): Promise<void> {
    const wrapperScope = await this.#scope(retained.wrapper, retained.role);
    const serviceScope = await this.#scope(retained.service, "service");
    const handlerScope = await this.#scope(retained.handler, "handler");
    const args = [wrapperScope, serviceScope, retained.first, retained.service, retained.handler, retained.registry, retained.project].map(objectId => ({ objectId }));
    const reply = await this.#call(retained.role === "rpcUi" ? "recheckUi" : "recheckManager", handlerScope, [...args, ...this.#values()]);
    z.object({ result: z.object({ type: z.literal("boolean"), value: z.literal(true) }).strict() }).strict().parse(reply);
  }
  public retained(): Readonly<{ attempted: boolean; completed: boolean; failed: boolean; requests: number; releaseAttempted: boolean; released: boolean; replies: readonly unknown[] }> {
    return Object.freeze({ attempted: this.#attempted, completed: this.#packet !== null, failed: this.#failed, requests: this.#requests, releaseAttempted: this.#releaseAttempted, released: this.#released, replies: Object.freeze([...this.#raw]) });
  }
  public async observe(): Promise<CurrentFootprintCopyManagerRouteObservation> {
    need(!this.#busy && !this.#attempted); this.#busy = true; this.#attempted = true; this.#operationRequests = 0; this.#maximum = CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_REQUESTS.observe;
    try {
      const first = await this.#array("initial", this.#binding.uiRoute, this.#values());
      const role = first.values.wrapperRole, wrapper = first.values.ids[0]; need(wrapper !== undefined && role !== null);
      const wrapperScope = await this.#scope(wrapper, role);
      const service = decodeCallable(await this.#call(role === "rpcUi" ? "serviceUi" : "serviceManager", wrapperScope, []), "service"), serviceScope = await this.#scope(service, "service");
      const handler = decodeCallable(await this.#call("handler", serviceScope, []), "handler"), handlerScope = await this.#scope(handler, "handler");
      const registry = await this.#array("registry", handlerScope, [{ objectId: first.id }, ...this.#values()]);
      for (const [index, selectedRole] of (["registryLookup", "registryInstance", "registryGet", "channelProducer"] as const).entries()) {
        const id = registry.values.ids[index]; need(id !== undefined);
        await this.#metadata(id, selectedRole);
      }
      const nativeGet = registry.values.ids[4]; need(nativeGet !== undefined); decodeNativeGet(await this.#properties(nativeGet));
      const project = await this.#array("project", handlerScope, [{ objectId: registry.id }, { objectId: first.id }, ...this.#values()]);
      const channelName = project.values.ids[10], getStr = project.values.ids[0], rpcCall = project.values.ids[1]; need(getStr !== undefined && rpcCall !== undefined && channelName !== undefined);
      await this.#metadata(getStr, "footprintGetStr"); await this.#metadata(rpcCall, "workerRpcCall");
      decodeNativeName(await this.#properties(channelName));
      this.#retained = Object.freeze({ first: first.id, wrapper, role, service, handler, registry: registry.id, project: project.id }); await this.#recheck(this.#retained);
      need(this.#operationRequests === CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_REQUESTS.observe && this.#managerSource !== null);
      this.#packet = Object.freeze(currentFootprintCopyManagerRouteObservationSchema.parse({ profile: "private.current-footprint-copy-manager-route.v2", runtimeManagerSourceQualified: true,
        originalUiBusSubscriptionRetained: true, initializedProjectRegistryBound: true, footprintReceiverAndWorkerBusBound: true, managerWorkerObjectRetained: true,
        initializedProjectChannelEntryMatched: true, projectChannelNameMatched: true, reciprocalWorkerPeerBound: false, backendDynamicDispatchQualified: false, executionAuthorized: false })); return this.#packet;
    } catch (error) { this.#failed = true; throw error; } finally { this.#busy = false; }
  }
  public async requireOriginal(packet: CurrentFootprintCopyManagerRouteObservation): Promise<void> {
    need(!this.#busy); this.#busy = true; this.#operationRequests = 0; this.#maximum = CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_REQUESTS.reprove;
    try { await this.#current(); need(packet === this.#packet && this.#packet !== null && this.#retained !== null); await this.#recheck(this.#retained); need(this.#operationRequests === CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_REQUESTS.reprove); }
    catch (error) { this.#failed = true; throw error; } finally { this.#busy = false; }
  }
  public async release(): Promise<void> {
    need(!this.#busy && this.#attempted && !this.#releaseAttempted); this.#releaseAttempted = true; this.#busy = true;
    try {
      need(methods(this.#transport).every((item, index) => item === this.#methods[index])); await this.#transport.assertCurrent();
      need(methods(this.#transport).every((item, index) => item === this.#methods[index])); this.#requests += 1;
      const reply = captureCurrentPcbStringClockReply(await this.#transport.request({ phase: "release", method: "Runtime.releaseObjectGroup", sessionId: this.#binding.sessionId, params: { objectGroup: GROUP } })).value;
      this.#raw.push(reply); z.object({}).strict().parse(reply); await this.#transport.assertCurrent();
      need(methods(this.#transport).every((item, index) => item === this.#methods[index])); this.#released = true;
    } catch (error) { this.#failed = true; throw error; } finally { this.#busy = false; }
  }
}
