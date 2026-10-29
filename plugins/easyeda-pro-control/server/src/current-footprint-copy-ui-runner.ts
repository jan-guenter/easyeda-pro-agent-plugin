/* oxlint-disable import/max-dependencies -- This retained owner joins the separate UI/preload source contracts, strict metadata, fixed transport and its two source-bound child owners. */
/** Retained copy-source UI route observation. No responder, getter, lazy
 * initializer, RPC, create or Save is called. A mounted copy-purpose channel
 * must own this runner's original parent and reserve its requests separately. */
import { types } from "node:util";
import { z } from "zod";
import { CURRENT_FOOTPRINT_COPY_UI_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_UI_FUNCTION_ORDER as ORDER,
  decodeCurrentFootprintCopyUiArray, decodeCurrentFootprintCopyUiFunction, decodeCurrentFootprintCopyUiNativeHas,
  decodeCurrentFootprintCopyUiResponder, decodeCurrentFootprintCopyUiScope, rejectCurrentFootprintCopyUiException } from "./current-footprint-copy-ui-bindings.ts";
import { CURRENT_FOOTPRINT_COPY_UI_GROUP, CURRENT_FOOTPRINT_COPY_UI_FLAGS as FLAGS, validateCurrentFootprintCopyUiCommand } from "./current-footprint-copy-ui-command.ts";
import type { CurrentFootprintCopyUiCommand } from "./current-footprint-copy-ui-command.ts";
import { CURRENT_FOOTPRINT_COPY_UI_REGISTRY_SOURCE as REGISTRY_SOURCE, assertCurrentFootprintCopyUiRegistryFunction,
  captureCurrentFootprintCopyUiRegistrySourceReply, qualifyCurrentFootprintCopyUiRegistrySource,
  requireCurrentFootprintCopyUiRegistrySource } from "./current-footprint-copy-ui-registry-source.ts";
import type { CurrentFootprintCopyUiRegistrySourceQualification } from "./current-footprint-copy-ui-registry-source.ts";
import { decodeCurrentFootprintCopyUiRegistryArray, decodeCurrentFootprintCopyUiRegistryClassScope, decodeCurrentFootprintCopyUiRegistryFunction } from "./current-footprint-copy-ui-registry-metadata.ts";
import { requireCurrentFootprintCopyUiSource } from "./current-footprint-copy-ui-source.ts";
import type { CurrentFootprintCopyUiSourceQualification } from "./current-footprint-copy-ui-source.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CurrentFootprintCopyManagerRouteRunner } from "./current-footprint-copy-manager-route-runner.ts";
import type { CurrentFootprintCopyManagerRouteTransport } from "./current-footprint-copy-manager-route-runner.ts";
import { CurrentFootprintCopyClockRegistrationRunner } from "./current-footprint-copy-clock-registration-runner.ts";
import type { CurrentFootprintCopyClockRegistrationTransport } from "./current-footprint-copy-clock-registration-runner.ts";
import type { CurrentFootprintCopyClockRegistrationCommand } from "./current-footprint-copy-clock-registration-contract.ts";

const handle = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const bindingSchema = z.object({ sessionId: handle.max(128), uniqueContextId: handle.max(128), scriptId: handle,
  projectUuid: z.string().regex(/^[a-f\d]{64}$/u), branchUuid: z.string().regex(/^[a-f\d]{32}$/u),
  windowTabId: z.string().regex(/^[A-Za-z\d_-]{1,128}$/u) }).strict();
export type CurrentFootprintCopyUiBinding = Readonly<z.infer<typeof bindingSchema>>;
const array = z.object({ result: z.object({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"),
  description: z.string(), objectId: handle }).strict() }).strict();
const yes = z.object({ result: z.object({ type: z.literal("boolean"), value: z.literal(true) }).strict() }).strict();
const empty = z.object({}).strict();
/** Four fresh metadata/scope requests precede the final three native rechecks.
 * Parent/frame/source reproof costs are additional, not hidden in this count. */
export const CURRENT_FOOTPRINT_COPY_UI_REQUESTS = Object.freeze({ observe: 39, reprove: 11, release: 1 });
export interface CurrentFootprintCopyUiTransport {
  /** Reprove the same original parent frame/context/source/process/pipe. This
   * callback may not attach, select another target or recreate a prior owner. */
  readonly assertCurrent: () => Promise<void>;
  readonly request: (command: CurrentFootprintCopyUiCommand) => Promise<unknown>;
}
export interface CurrentFootprintCopyUiObservation {
  readonly profile: "private.current-footprint-copy-ui.v1";
  readonly functionCount: 9;
  readonly originalNotificationRetained: true;
  readonly initializedRegistryAndBusRetained: true;
  readonly extensionEntryAbsentAtObservation: true;
  readonly freshClosureRelationsRechecked: true;
  readonly projectWorkerTargetBound: false;
  readonly transitiveClosuresBound: false;
  readonly executionAuthorized: false;
}
export const currentFootprintCopyUiObservationSchema = z.object({
  profile: z.literal("private.current-footprint-copy-ui.v1"), functionCount: z.literal(9),
  originalNotificationRetained: z.literal(true), initializedRegistryAndBusRetained: z.literal(true),
  extensionEntryAbsentAtObservation: z.literal(true), freshClosureRelationsRechecked: z.literal(true),
  projectWorkerTargetBound: z.literal(false), transitiveClosuresBound: z.literal(false), executionAuthorized: z.literal(false),
}).strict();
interface RegistryRetained { readonly array: string; readonly getter: string; readonly contextProducer: string; readonly scriptId: string;
  readonly source: CurrentFootprintCopyUiRegistrySourceQualification }
interface Retained { readonly notification: string; readonly wrapper: string; readonly responder: string; readonly route: string; readonly registry: RegistryRetained }
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_COPY_UI_OWNER"); } }
function methods(value: object): readonly unknown[] {
  need(!types.isProxy(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null));
  need(Reflect.ownKeys(value).length === 2);
  return Object.freeze(["assertCurrent", "request"].map(key => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === "function");
    return descriptor.value as unknown;
  }));
}

export class CurrentFootprintCopyUiRunner {
  readonly #source: CurrentFootprintCopyUiSourceQualification;
  readonly #transport: CurrentFootprintCopyUiTransport;
  readonly #methods: readonly unknown[];
  readonly #binding: CurrentFootprintCopyUiBinding;
  readonly #replies: unknown[] = [];
  #attempted = false;
  #failed = false;
  #busy = false;
  #requests = 0;
  #operationRequests = 0;
  #maximum = 0;
  #retained: Retained | null = null;
  #packet: CurrentFootprintCopyUiObservation | null = null;
  #releaseAttempted = false;
  #released = false;
  #managerRouteIssued = false;
  #clockRegistrationIssued = false;
  public constructor(source: CurrentFootprintCopyUiSourceQualification, transport: CurrentFootprintCopyUiTransport,
    binding: CurrentFootprintCopyUiBinding) {
    requireCurrentFootprintCopyUiSource(source); this.#source = source;
    this.#methods = methods(transport); this.#transport = transport;
    this.#binding = Object.freeze(bindingSchema.parse(captureCurrentPcbStringClockReply(binding).value));
  }
  #same(): void {
    need(!this.#releaseAttempted && !this.#failed && methods(this.#transport).every((value, index) => value === this.#methods[index]));
    requireCurrentFootprintCopyUiSource(this.#source);
  }
  async #current(): Promise<void> {
    this.#same(); await this.#transport.assertCurrent(); this.#same();
  }
  async #request(command: CurrentFootprintCopyUiCommand): Promise<unknown> {
    await this.#current(); need(this.#operationRequests < this.#maximum);
    const fixed = validateCurrentFootprintCopyUiCommand(command);
    this.#operationRequests += 1; this.#requests += 1;
    const raw = await this.#transport.request(fixed);
    const result = fixed.phase === "registrySource" ? captureCurrentFootprintCopyUiRegistrySourceReply(raw) : captureCurrentPcbStringClockReply(raw).value;
    // Receipt retention precedes asynchronous parent/lease reproof.
    this.#replies.push(result); await this.#current();
    // The fixed source envelope already excludes exception/metadata fields.
    // Its full preload text must not pass through the small clock capture again.
    if (fixed.phase !== "registrySource") { rejectCurrentFootprintCopyUiException(result, fixed.phase); } return result;
  }
  #values(): readonly Readonly<{ value: string }>[] {
    return [{ value: this.#binding.projectUuid }, { value: this.#binding.branchUuid }, { value: this.#binding.windowTabId }];
  }
  #properties(objectId: string): Promise<unknown> {
    return this.#request({ phase: "properties", method: "Runtime.getProperties", sessionId: this.#binding.sessionId,
      params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  }
  #call(phase: "notificationRecheck" | "responder" | "responderRecheck" | "route" | "membership" | "routeRecheck" | "registry" | "registryContextProducer" | "registryRecheck",
    objectId: string, args: readonly Readonly<{ objectId: string } | { value: string }>[]): Promise<unknown> {
    return this.#request({ phase, method: "Runtime.callFunctionOn", sessionId: this.#binding.sessionId,
      params: { ...FLAGS, objectId, functionDeclaration: CALLS[phase].program, arguments: args, returnByValue: CALLS[phase].returnByValue } });
  }
  async #scope(objectId: string, kind: "wrapper" | "responder"): Promise<string> {
    const list = decodeCurrentFootprintCopyUiFunction(await this.#properties(objectId), kind, this.#binding.scriptId);
    return decodeCurrentFootprintCopyUiScope(await this.#properties(list), kind);
  }
  async #registrySource(scriptId: string): Promise<CurrentFootprintCopyUiRegistrySourceQualification> {
    const raw = await this.#request({ phase: "registrySource", method: "Debugger.getScriptSource", sessionId: this.#binding.sessionId, params: { scriptId } });
    const reply = z.object({ scriptSource: z.string().max(REGISTRY_SOURCE.bytes) }).strict().parse(raw);
    return qualifyCurrentFootprintCopyUiRegistrySource(reply.scriptSource);
  }
  async #registryObserve(notification: string): Promise<RegistryRetained> {
    const captured = array.parse(await this.#call("registry", notification, [{ objectId: notification }, ...this.#values()]));
    need(captured.result.description === "Array(8)");
    const ids = decodeCurrentFootprintCopyUiRegistryArray(await this.#properties(captured.result.objectId));
    let getterScope: string | undefined, scriptId: string | undefined;
    for (const [index, role] of (["registryConstructor", "registryHas", "registryInstance", "registryContext"] as const).entries()) {
      const id = ids[index]; need(id !== undefined);
      const metadata = decodeCurrentFootprintCopyUiRegistryFunction(await this.#properties(id), role, scriptId);
      scriptId ??= metadata.scriptId;
      if (role === "registryContext") { getterScope = metadata.scopesId; }
    }
    need(scriptId !== undefined && getterScope !== undefined);
    const source = await this.#registrySource(scriptId);
    const scopes = decodeCurrentFootprintCopyUiRegistryClassScope(await this.#properties(getterScope));
    const selected = z.object({ result: z.object({ type: z.literal("function"), className: z.literal("Function"), description: z.string().max(4096), objectId: handle }).strict() }).strict()
      .parse(await this.#call("registryContextProducer", scopes.closureScopeId, [{ objectId: notification }, { objectId: captured.result.objectId }, { objectId: scopes.blockScopeId }, ...this.#values()]));
    assertCurrentFootprintCopyUiRegistryFunction("contextProducer", selected.result.description);
    decodeCurrentFootprintCopyUiRegistryFunction(await this.#properties(selected.result.objectId), "contextProducer", scriptId);
    const getter = ids[3]; need(getter !== undefined);
    return Object.freeze({ array: captured.result.objectId, getter, contextProducer: selected.result.objectId, scriptId, source });
  }
  async #registryRecheck(notification: string, registry: RegistryRetained): Promise<void> {
    requireCurrentFootprintCopyUiRegistrySource(registry.source);
    await this.#registrySource(registry.scriptId);
    const metadata = decodeCurrentFootprintCopyUiRegistryFunction(await this.#properties(registry.getter), "registryContext", registry.scriptId);
    const scopes = decodeCurrentFootprintCopyUiRegistryClassScope(await this.#properties(metadata.scopesId));
    yes.parse(await this.#call("registryRecheck", scopes.closureScopeId, [{ objectId: notification }, { objectId: registry.array }, { objectId: registry.contextProducer }, { objectId: scopes.blockScopeId }, ...this.#values()]));
  }
  async #recheck(retained: Retained): Promise<void> {
    // V8 scope wrappers can retain snapshots. Obtain new wrappers from the
    // Original functions before checking current lexical bindings.
    const wrapperScope = await this.#scope(retained.wrapper, "wrapper");
    const responderScope = await this.#scope(retained.responder, "responder");
    await this.#registryRecheck(retained.notification, retained.registry);
    yes.parse(await this.#call("notificationRecheck", retained.notification, [{ objectId: retained.notification }, ...this.#values()]));
    yes.parse(await this.#call("responderRecheck", wrapperScope, [{ objectId: retained.wrapper }, { objectId: retained.responder }]));
    yes.parse(await this.#call("routeRecheck", responderScope, [{ objectId: retained.notification }, ...this.#values(), { objectId: retained.route }, { objectId: retained.registry.array }]));
  }
  public retained(): Readonly<{ attempted: boolean; failed: boolean; requests: number; completed: boolean;
    releaseAttempted: boolean; released: boolean; replies: readonly unknown[] }> {
    return Object.freeze({ attempted: this.#attempted, failed: this.#failed, requests: this.#requests, completed: this.#packet !== null,
      releaseAttempted: this.#releaseAttempted, released: this.#released, replies: Object.freeze([...this.#replies]) });
  }
  /** The child receives this runner's retained native UI route directly. No
   * caller-supplied JSON observation can substitute another bus or project. */
  public createManagerRoute(packet: CurrentFootprintCopyUiObservation, transport: CurrentFootprintCopyManagerRouteTransport): CurrentFootprintCopyManagerRouteRunner {
    this.#same(); need(!this.#busy && !this.#managerRouteIssued && this.#packet !== null && packet === this.#packet && this.#retained !== null);
    this.#managerRouteIssued = true;
    return new CurrentFootprintCopyManagerRouteRunner(this.#source, transport, { sessionId: this.#binding.sessionId,
      uiScriptId: this.#binding.scriptId, uiRoute: this.#retained.route, projectUuid: this.#binding.projectUuid,
      branchUuid: this.#binding.branchUuid, windowTabId: this.#binding.windowTabId });
  }
  /** The child retains this owner's original UI route. Its separately reserved
   * requests observe registration and offset only, never a document clock. */
  public createClockRegistration(packet: CurrentFootprintCopyUiObservation, transport: CurrentFootprintCopyClockRegistrationTransport): CurrentFootprintCopyClockRegistrationRunner {
    this.#same(); need(!this.#busy && !this.#clockRegistrationIssued && this.#packet !== null && packet === this.#packet && this.#retained !== null);
    this.#clockRegistrationIssued = true;
    const originalMethods = methods(transport);
    const same = (): void => { this.#same(); need(!this.#busy && packet === this.#packet && methods(transport).every((item, index) => item === originalMethods[index])); };
    const original: CurrentFootprintCopyClockRegistrationTransport = Object.freeze({
      assertCurrent: async (): Promise<void> => { same(); await this.#current(); same(); await transport.assertCurrent(); same(); },
      request: (command: CurrentFootprintCopyClockRegistrationCommand): Promise<unknown> => { same(); need(command.sessionId === this.#binding.sessionId); return transport.request(command); },
    });
    return new CurrentFootprintCopyClockRegistrationRunner(this.#source, original, { sessionId: this.#binding.sessionId,
      uiRoute: this.#retained.route, projectUuid: this.#binding.projectUuid, branchUuid: this.#binding.branchUuid, windowTabId: this.#binding.windowTabId });
  }
  public async observe(): Promise<CurrentFootprintCopyUiObservation> {
    need(!this.#attempted && !this.#busy); this.#attempted = true; this.#busy = true;
    this.#operationRequests = 0; this.#maximum = CURRENT_FOOTPRINT_COPY_UI_REQUESTS.observe;
    try {
      const notification = array.parse(await this.#request({ phase: "initial", method: "Runtime.callFunctionOn", sessionId: this.#binding.sessionId,
        params: { ...FLAGS, uniqueContextId: this.#binding.uniqueContextId, functionDeclaration: CALLS.initial.program,
          arguments: this.#values(), returnByValue: false } }));
      need(notification.result.description === "Array(7)");
      const wrapper = decodeCurrentFootprintCopyUiArray(await this.#properties(notification.result.objectId), "notification")[0];
      need(wrapper !== undefined);
      const wrapperScope = await this.#scope(wrapper, "wrapper");
      const responder = decodeCurrentFootprintCopyUiResponder(await this.#call("responder", wrapperScope, [{ objectId: wrapper }]));
      const responderScope = await this.#scope(responder, "responder");
      const route = array.parse(await this.#call("route", responderScope, [{ objectId: notification.result.objectId }, ...this.#values()]));
      need(route.result.description === "Array(17)");
      const functions = decodeCurrentFootprintCopyUiArray(await this.#properties(route.result.objectId), "route");
      for (const [index, role] of ORDER.entries()) {
        const selected = functions[index]; need(selected !== undefined);
        decodeCurrentFootprintCopyUiFunction(await this.#properties(selected), role, this.#binding.scriptId);
      }
      const mapHas = functions[7]; need(mapHas !== undefined);
      decodeCurrentFootprintCopyUiNativeHas(await this.#properties(mapHas));
      const registry = await this.#registryObserve(notification.result.objectId);
      yes.parse(await this.#call("membership", responderScope, [{ objectId: notification.result.objectId }, ...this.#values(), { objectId: route.result.objectId }, { objectId: registry.array }]));
      const retained = Object.freeze({ notification: notification.result.objectId, wrapper, responder, route: route.result.objectId, registry });
      this.#retained = retained; await this.#recheck(retained);
      need(this.#operationRequests === CURRENT_FOOTPRINT_COPY_UI_REQUESTS.observe);
      this.#packet = Object.freeze(currentFootprintCopyUiObservationSchema.parse({ profile: "private.current-footprint-copy-ui.v1", functionCount: 9,
        originalNotificationRetained: true, initializedRegistryAndBusRetained: true, extensionEntryAbsentAtObservation: true,
        freshClosureRelationsRechecked: true, projectWorkerTargetBound: false, transitiveClosuresBound: false, executionAuthorized: false }));
      return this.#packet;
    } catch (error) { this.#failed = true; throw error; } finally { this.#busy = false; }
  }
  /** Required immediately before any future copy dispatch. It rechecks current
   * registry absence; the observation itself never grants dispatch authority. */
  public async requireOriginal(packet: CurrentFootprintCopyUiObservation): Promise<void> {
    need(!this.#busy); this.#busy = true; this.#operationRequests = 0; this.#maximum = CURRENT_FOOTPRINT_COPY_UI_REQUESTS.reprove;
    try {
      await this.#current(); need(this.#packet !== null && packet === this.#packet && this.#retained !== null);
      await this.#recheck(this.#retained); need(this.#operationRequests === CURRENT_FOOTPRINT_COPY_UI_REQUESTS.reprove);
    } catch (error) { this.#failed = true; throw error; } finally { this.#busy = false; }
  }
  /** A failed observation still owns its group. Release uses the original
   * transport once; no failure permits reattachment or another release attempt. */
  public async release(): Promise<void> {
    need(!this.#busy && !this.#releaseAttempted && this.#attempted);
    this.#releaseAttempted = true; this.#busy = true;
    try {
      need(methods(this.#transport).every((value, index) => value === this.#methods[index]));
      await this.#transport.assertCurrent();
      need(methods(this.#transport).every((value, index) => value === this.#methods[index]));
      const command = validateCurrentFootprintCopyUiCommand({ phase: "release", method: "Runtime.releaseObjectGroup",
        sessionId: this.#binding.sessionId, params: { objectGroup: CURRENT_FOOTPRINT_COPY_UI_GROUP } });
      this.#requests += 1;
      const reply = captureCurrentPcbStringClockReply(await this.#transport.request(command)).value;
      this.#replies.push(reply); empty.parse(reply);
      await this.#transport.assertCurrent();
      need(methods(this.#transport).every((value, index) => value === this.#methods[index])); this.#released = true;
    } catch (error) { this.#failed = true; throw error; } finally { this.#busy = false; }
  }
}
