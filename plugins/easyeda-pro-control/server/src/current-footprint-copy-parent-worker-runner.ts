/** Actual native Worker message receipt associates the retained parent object
 * with one original child context. Timing, URL, channel name and constructor
 * locations alone never issue this proof. Failure leaves the parent held and
 * requires instrumentation removal or observed original-generation termination. */
import { randomBytes } from "node:crypto";
import { types } from "node:util";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_PARENT_WORKER_LIMITS as LIMITS, CURRENT_FOOTPRINT_PARENT_WORKER_REQUESTS as REQUESTS } from "./current-footprint-copy-parent-worker-contract.ts";
import type { CurrentFootprintParentWorkerBinding as Binding, CurrentFootprintParentWorkerCommand as Command,
  CurrentFootprintParentWorkerPhase as Phase, CurrentFootprintParentWorkerTransport as Transport } from "./current-footprint-copy-parent-worker-contract.ts";
import { CURRENT_FOOTPRINT_COPY_PARENT_WORKER_GROUP as GROUP, CURRENT_FOOTPRINT_COPY_PARENT_WORKER_PROGRAMS as PROGRAMS } from "./current-footprint-copy-parent-worker-programs.ts";
import { validateCurrentFootprintParentWorkerCommand } from "./current-footprint-copy-parent-worker-wire.ts";

const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const bindingSchema = z.object({ parentSessionId: token, parentUniqueContextId: token, projectObjectId: token,
  childSessionId: token, childUniqueContextId: token, childTargetId: token }).strict().refine(value =>
  value.parentSessionId !== value.childSessionId && value.parentUniqueContextId !== value.childUniqueContextId, "Peer realms must differ.");
const heldParentSchema = z.object({ parentSessionId: token, parentUniqueContextId: token, projectObjectId: token }).strict();
const objectReply = z.object({ result: z.object({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"),
  description: z.string().max(32), objectId: token }).strict() }).strict();
const yes = z.object({ result: z.object({ type: z.literal("boolean"), value: z.literal(true) }).strict() }).strict();
const empty = z.object({}).strict();
const disposedValue = z.object({ received: z.boolean(), removed: z.literal(true), installed: z.literal(false) }).strict();
const disposedResult = z.object({ type: z.literal("object"), value: disposedValue }).strict();
const disposedReply = z.object({ result: disposedResult }).strict();
const remote = z.object({ type: z.enum(["object", "function", "number", "string"]), subtype: z.string().max(128).optional(),
  className: z.string().max(128).optional(), description: z.string().max(512).optional(), objectId: token.optional(),
  value: z.union([z.string().max(128), z.number()]).optional() }).strict();
const property = z.object({ name: z.string().max(128), value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) }).strict();
const internal = z.object({ name: z.string().max(128), value: remote }).strict();
const childNames = ["addEventListener", "removeEventListener", "stopImmediatePropagation", "get data", "get type", "get currentTarget"] as const;
const childArities = [2, 2, 0, 0, 0, 0] as const;
function need(value: boolean, reason: string): asserts value { if (!value) { throw new Error(`FOOTPRINT_PARENT_WORKER_${reason}`); } }
async function bounded<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = Promise.withResolvers<never>();
  try {
    timer = setTimeout(() => { deadline.reject(new Error("FOOTPRINT_PARENT_WORKER_DEADLINE")); }, milliseconds);
    return await Promise.race([promise, deadline.promise]);
  } finally { clearTimeout(timer); }
}
function members(transport: Transport): readonly unknown[] {
  need(!types.isProxy(transport) && (Object.getPrototypeOf(transport) === Object.prototype || Object.getPrototypeOf(transport) === null), "TRANSPORT");
  const names = ["assertOriginalState", "request", "advanceOriginalChildBootstrap", "assertOriginalGenerationExited"] as const;
  need(Reflect.ownKeys(transport).length === names.length, "TRANSPORT");
  return names.map(name => { const item = Object.getOwnPropertyDescriptor(transport, name);
    need(item !== undefined && Object.hasOwn(item, "value") && typeof item.value === "function", "TRANSPORT"); return item.value as unknown; });
}
/** Native metadata excludes script functions, bound functions and proxies even
 * when a replacement toString returns a native-looking string. */
export function decodeCurrentFootprintParentWorkerNative(input: unknown, name: string, arity: number): void {
  const reply = z.object({ result: z.array(property).length(2), internalProperties: z.array(internal).length(2) }).strict().parse(input);
  const entries = new Map(reply.result.map(item => [item.name, item])); need(entries.size === 2, "NATIVE");
  for (const key of ["name", "length"] as const) {
    const item = entries.get(key); need(item !== undefined && !item.writable && item.configurable && !item.enumerable &&
      item.value.type === (key === "name" ? "string" : "number") && item.value.value === (key === "name" ? name : arity) &&
      !Object.is(item.value.value, -0) && item.value.objectId === undefined && item.value.subtype === undefined && item.value.className === undefined, "NATIVE");
  }
  const internals = new Map(reply.internalProperties.map(item => [item.name, item.value]));
  const prototype = internals.get("[[Prototype]]"), scopes = internals.get("[[Scopes]]");
  need(internals.size === 2 && prototype?.type === "function" && prototype.className === "Function" && prototype.objectId !== undefined &&
    scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.description === "Scopes[0]" &&
    scopes.objectId !== undefined && scopes.value === undefined && prototype.value === undefined, "NATIVE");
}
function decodeArray(input: unknown, kind: "parent" | "child"): readonly string[] {
  const count = kind === "parent" ? 4 : 8;
  const reply = z.object({ result: z.array(property).length(count + 1), internalProperties: z.array(internal).length(1) }).strict().parse(input);
  const entries = new Map(reply.result.map(item => [item.name, item])); need(entries.size === count + 1, "ARRAY");
  const length = entries.get("length"), prototype = reply.internalProperties[0];
  need(length?.value.value === count && length.value.type === "number" && length.writable && !length.configurable && !length.enumerable &&
    prototype?.name === "[[Prototype]]" && prototype.value.type === "object" && prototype.value.subtype === "array" && prototype.value.objectId !== undefined, "ARRAY");
  return Object.freeze(Array.from({ length: count }, (_, index) => {
    const item = entries.get(String(index)); need(item !== undefined && item.writable && item.configurable && item.enumerable && item.value.objectId !== undefined &&
      item.value.value === undefined && item.value.subtype !== "proxy", "ARRAY");
    const isFunction = kind === "parent" ? index === 2 : index >= 1 && index <= 6;
    need(item.value.type === (isFunction ? "function" : "object"), "ARRAY");
    if (isFunction) {
      const name = kind === "parent" ? "postMessage" : childNames[index - 1];
      need(item.value.className === "Function" && item.value.subtype === undefined && item.value.description === `function ${String(name)}() { [native code] }`, "ARRAY");
    } else if (kind === "parent" && index === 1) { need(item.value.className === "Worker" && item.value.subtype === undefined, "ARRAY"); }
    return item.value.objectId;
  }));
}
export interface CurrentFootprintParentWorkerObservation {
  readonly profile: "private.current-footprint-parent-worker-peer.v1";
  readonly parentWorkerNativeMessageReceivedByOriginalChild: true;
  readonly diagnosticListenerRemoved: true;
  readonly reciprocalProjectChannelQualified: false;
  readonly backendDynamicDispatchQualified: false;
  readonly executionAuthorized: false;
}
const issued = new WeakMap<CurrentFootprintParentWorkerObservation, CurrentFootprintParentWorkerRunner>();

export class CurrentFootprintParentWorkerRunner {
  readonly #transport: Transport;
  readonly #members: readonly unknown[];
  readonly #binding: Binding;
  readonly #send: Transport["request"];
  readonly #assertState: Transport["assertOriginalState"];
  readonly #advance: Transport["advanceOriginalChildBootstrap"];
  readonly #exited: Transport["assertOriginalGenerationExited"];
  readonly #nonce = randomBytes(32).toString("hex");
  readonly #raw: unknown[] = [];
  #stage: Parameters<Transport["assertOriginalState"]>[0] = "before-imports";
  #parent: string | null = null;
  #child: string | null = null;
  #packet: CurrentFootprintParentWorkerObservation | null = null;
  #attempted = false;
  #failed = false;
  #busy = false;
  #installAttempted = false;
  #disposeAttempted = false;
  #disposed = false;
  #cleanupAttempted = false;
  #released = false;
  #generationEnded = false;
  #requests = 0;
  #operationRequests = 0;
  #operationLimit = 0;
  public constructor(transport: Transport, binding: Binding) {
    this.#transport = transport; this.#members = members(transport);
    this.#binding = Object.freeze(bindingSchema.parse(captureCurrentPcbStringClockReply(binding).value));
    this.#send = transport.request; this.#assertState = transport.assertOriginalState;
    this.#advance = transport.advanceOriginalChildBootstrap; this.#exited = transport.assertOriginalGenerationExited;
  }
  #same(): void { need(members(this.#transport).every((item, index) => item === this.#members[index]), "OWNER_CHANGED"); }
  async #current(): Promise<void> { this.#same(); await bounded(this.#assertState(this.#stage), LIMITS.ownerCheckMs); this.#same(); }
  async #request(command: Command): Promise<unknown> {
    await this.#current(); need(this.#operationRequests < this.#operationLimit, "BUDGET"); this.#operationRequests += 1; this.#requests += 1;
    const fixed = validateCurrentFootprintParentWorkerCommand(command);
    const reply = await bounded(this.#send(fixed), LIMITS.requestMs);
    const raw = captureCurrentPcbStringClockReply(reply).value;
    this.#raw.push(raw); await this.#current(); return raw;
  }
  #call(phase: Phase, realm: "parent" | "child", objectId: string | null, args: readonly Readonly<{ value: string } | { objectId: string }>[] = []): Promise<unknown> {
    const select = phase === "parentSelect" || phase === "childSelect";
    const read = select || phase === "parentRecheck" || phase === "childRecheck" || phase === "managerJoin";
    return this.#request({ phase, method: "Runtime.callFunctionOn", sessionId: realm === "parent" ? this.#binding.parentSessionId : this.#binding.childSessionId,
      params: { ...(objectId === null ? { uniqueContextId: this.#binding.childUniqueContextId } : { objectId }), functionDeclaration: PROGRAMS[phase],
        arguments: args, objectGroup: GROUP, returnByValue: !select, awaitPromise: phase === "childReceipt", silent: true,
        generatePreview: false, userGesture: false, throwOnSideEffect: read } });
  }
  #properties(realm: "parent" | "child", objectId: string): Promise<unknown> {
    return this.#request({ phase: "properties", method: "Runtime.getProperties", sessionId: realm === "parent" ? this.#binding.parentSessionId : this.#binding.childSessionId,
      params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  }
  #value(): readonly Readonly<{ value: string }>[] { return [{ value: this.#nonce }]; }
  async #dispose(requireReceipt = false): Promise<void> {
    need(this.#child !== null && this.#installAttempted && !this.#disposeAttempted, "DISPOSE"); this.#disposeAttempted = true;
    const reply = disposedReply.parse(await this.#call("childDispose", "child", this.#child, this.#value()));
    if (requireReceipt || this.#packet !== null) { need(reply.result.value.received, "DISPOSE_RECEIPT"); } this.#disposed = true;
  }
  public retained(): Readonly<{ attempted: boolean; failed: boolean; completed: boolean; requests: number; listenerRemoved: boolean;
    cleanupAttempted: boolean; released: boolean; originalGenerationEnded: boolean; replies: readonly unknown[] }> {
    return Object.freeze({ attempted: this.#attempted, failed: this.#failed, completed: this.#packet !== null, requests: this.#requests,
      listenerRemoved: this.#disposed, cleanupAttempted: this.#cleanupAttempted, released: this.#released,
      originalGenerationEnded: this.#generationEnded, replies: Object.freeze([...this.#raw]) });
  }
  public async observe(): Promise<CurrentFootprintParentWorkerObservation> {
    need(!this.#attempted && !this.#busy, "CONSUMED"); this.#attempted = true; this.#busy = true;
    this.#operationRequests = 0; this.#operationLimit = REQUESTS.observe;
    try {
      const parentReply = objectReply.parse(await this.#call("parentSelect", "parent", this.#binding.projectObjectId));
      need(parentReply.result.description === "Array(4)", "PARENT_ARRAY"); this.#parent = parentReply.result.objectId;
      const parentIds = decodeArray(await this.#properties("parent", this.#parent), "parent"); const nativePost = parentIds[2]; need(nativePost !== undefined, "NATIVE_POST");
      decodeCurrentFootprintParentWorkerNative(await this.#properties("parent", nativePost), "postMessage", 1);
      const childReply = objectReply.parse(await this.#call("childSelect", "child", null));
      need(childReply.result.description === "Array(8)", "CHILD_ARRAY"); this.#child = childReply.result.objectId;
      const childIds = decodeArray(await this.#properties("child", this.#child), "child");
      for (const [index, name] of childNames.entries()) {
        const arity = childArities[index], id = childIds[index + 1]; need(id !== undefined && arity !== undefined, "CHILD_NATIVE");
        decodeCurrentFootprintParentWorkerNative(await this.#properties("child", id), name, arity);
      }
      this.#installAttempted = true; yes.parse(await this.#call("childInstall", "child", this.#child, this.#value()));
      await this.#current(); await bounded(this.#advance(), LIMITS.bootstrapMs); this.#same(); this.#stage = "bootstrap-idle"; await this.#current();
      yes.parse(await this.#call("parentSend", "parent", this.#parent, this.#value()));
      const receiptValue = z.object({ profile: z.literal("private.current-footprint-worker-peer-receipt.v1"), nonce: z.literal(this.#nonce), trusted: z.literal(true), removed: z.literal(true) }).strict();
      const receiptResult = z.object({ type: z.literal("object"), value: receiptValue }).strict();
      const receipt = z.object({ result: receiptResult }).strict();
      receipt.parse(await this.#call("childReceipt", "child", this.#child, this.#value()));
      yes.parse(await this.#call("parentRecheck", "parent", this.#parent, this.#value())); await this.#dispose(true);
      need(this.#operationRequests === REQUESTS.observe, "BUDGET_COUNT");
      this.#packet = Object.freeze({ profile: "private.current-footprint-parent-worker-peer.v1", parentWorkerNativeMessageReceivedByOriginalChild: true,
        diagnosticListenerRemoved: true, reciprocalProjectChannelQualified: false, backendDynamicDispatchQualified: false, executionAuthorized: false });
      issued.set(this.#packet, this); this.#stage = "peer-proved"; return this.#packet;
    } catch (error) { this.#failed = true; throw error; } finally { this.#busy = false; }
  }
  public async requireOriginal(packet: CurrentFootprintParentWorkerObservation): Promise<void> {
    need(!this.#busy && !this.#failed && !this.#cleanupAttempted && !this.#released && !this.#generationEnded && packet === this.#packet && issued.get(packet) === this && this.#parent !== null && this.#child !== null && this.#disposed, "ORIGINAL");
    this.#busy = true; this.#operationRequests = 0; this.#operationLimit = REQUESTS.reprove;
    try {
      yes.parse(await this.#call("parentRecheck", "parent", this.#parent, this.#value()));
      yes.parse(await this.#call("childRecheck", "child", this.#child, this.#value()));
      need(this.#operationRequests === REQUESTS.reprove, "BUDGET_COUNT");
    }
    catch (error) { this.#failed = true; throw error; } finally { this.#busy = false; }
  }
  public async requireOriginalHeldParent(packet: CurrentFootprintParentWorkerObservation,
    expected: Readonly<{ parentSessionId: string; parentUniqueContextId: string; projectObjectId: string }>): Promise<void> {
    const captured = captureCurrentPcbStringClockReply(expected).value;
    const selected = heldParentSchema.parse(captured);
    need(selected.parentSessionId === this.#binding.parentSessionId && selected.parentUniqueContextId === this.#binding.parentUniqueContextId &&
      selected.projectObjectId === this.#binding.projectObjectId, "PARENT_BINDING"); await this.requireOriginal(packet);
  }
  /** The manager owner must supply its retained original route array after its
   * own reproof. This compares object identity, never serialized IDs or names. */
  public async joinOriginalManagerRoute(packet: CurrentFootprintParentWorkerObservation, routeObjectId: string): Promise<void> {
    await this.requireOriginal(packet); need(this.#parent !== null && !this.#busy, "JOIN"); this.#busy = true;
    this.#operationRequests = 0; this.#operationLimit = REQUESTS.managerJoin;
    try { yes.parse(await this.#call("managerJoin", "parent", this.#parent, [{ objectId: token.parse(routeObjectId) }, ...this.#value()])); }
    catch (error) { this.#failed = true; throw error; } finally { this.#busy = false; }
  }
  public async release(): Promise<void> {
    need(!this.#busy && this.#attempted && !this.#cleanupAttempted, "CLEANUP"); this.#cleanupAttempted = true; this.#busy = true;
    this.#operationRequests = 0; this.#operationLimit = REQUESTS.cleanup;
    const failures: unknown[] = [];
    try {
      if (this.#installAttempted && !this.#disposeAttempted) { try { await this.#dispose(); } catch (error) { failures.push(error); } }
      for (const sessionId of [this.#binding.parentSessionId, this.#binding.childSessionId]) {
        try { empty.parse(await this.#request({ phase: "release", method: "Runtime.releaseObjectGroup", sessionId, params: { objectGroup: GROUP } })); }
        catch (error) { failures.push(error); }
      }
      need(failures.length === 0 && (!this.#installAttempted || this.#disposed), "CLEANUP_UNRESOLVED"); this.#released = true;
    } catch (error) { this.#failed = true; throw error; } finally { this.#busy = false; }
  }
  /** A lost install/remove acknowledgment is never retried. The original native
   * process and non-breakaway Job must actually exit to end that instrumentation. */
  public async observeOriginalGenerationEnded(): Promise<void> {
    need(!this.#busy && this.#attempted && !this.#generationEnded, "GENERATION"); this.#busy = true;
    try { this.#same(); await bounded(this.#exited(), LIMITS.ownerCheckMs); this.#same(); this.#generationEnded = true; this.#released = true; }
    finally { this.#busy = false; }
  }
}
