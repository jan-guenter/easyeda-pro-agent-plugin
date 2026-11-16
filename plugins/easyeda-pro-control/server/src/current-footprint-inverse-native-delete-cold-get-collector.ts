/** Two actual qualified native-manager GETs of the retained deleted record.
 * Core must supply the fresh cold construction/realm custody independently;
 * this data collector cannot issue an owner, cold result or SDK parity. */
import { types } from "node:util";
import { z } from "zod";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_GET_PROGRAMS as PROGRAMS, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_GET_SIGNATURES as SIGNATURES } from "./current-footprint-inverse-native-delete-cold-get-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_GET_FLAGS as FLAGS, CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_GET_REQUESTS as LIMIT, currentFootprintInverseNativeDeleteColdGetTargetSchema, validateCurrentFootprintInverseNativeDeleteColdGetCommand as validate } from "./current-footprint-inverse-native-delete-cold-get-protocol.ts";
import type { CurrentFootprintInverseNativeDeleteColdGetCommand as Command, CurrentFootprintInverseNativeDeleteColdGetPropertyRole as PropertyRole, CurrentFootprintInverseNativeDeleteColdGetRole as Role, CurrentFootprintInverseNativeDeleteColdGetTarget as Target } from "./current-footprint-inverse-native-delete-cold-get-protocol.ts";
import { decodeCurrentFootprintCopyClockRpcV2Array as array, currentFootprintCopyClockRpcV2ArrayObject as object, decodeCurrentFootprintCopyClockRpcV2ArrayCapture as result } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { currentFootprintInverseGetCallable as callable, qualifyCurrentFootprintInverseGetFunction as metadata } from "./current-footprint-inverse-get-source.ts";
import { captureCurrentFootprintInversePreferenceReply } from "./current-footprint-inverse-public-preferences-replies.ts";
import { currentFootprintInverseDeleteRpcTrue as truth } from "./current-footprint-inverse-delete-rpc-protocol.ts";

interface Bindings {
  readonly reflection: string; readonly originalProject: string;
  readonly scriptId: string; readonly source: string; readonly target: Target;
  readonly current: () => void; readonly assertOriginalExit: () => void;
  readonly beforeOriginalRead: () => Promise<void>; readonly afterOriginalRead: () => Promise<void>;
  readonly request: (command: Command) => Promise<unknown>;
  readonly qualifyHelper: (command: Command) => Promise<void>;
  readonly requireOriginalPhysicalComplete: () => void;
}
export interface CurrentFootprintInverseNativeDeleteColdGetData {
  readonly profile: "private.current-footprint-inverse-native-delete-cold-get-data.v1";
  readonly targetUuid: string; readonly maximumTicket: number;
  readonly originalRetainedTombstoneMatched: true;
  readonly originalNativeManagerGetCompleted: true;
  readonly originalNativeManagerGetInvocations: 2;
  readonly normalRequests: 19; readonly helperRequests: 9; readonly cdpRequests: 28;
  readonly nativeManagerReturnedMissing: true;
  readonly sourceGetterDispatched: true;
  readonly publicSdkParity: false; readonly nativeUiTaskAbsenceVerified: false;
  readonly persistentUploadReplayExcluded: false;
  readonly coldGenerationClosureVerified: false; readonly coldAbsenceVerified: false;
  readonly wholeInverseVerified: false; readonly executionAuthorized: false;
}
function need(ok: boolean): asserts ok { if (!ok) { throw new Error("INVERSE_NATIVE_DELETE_COLD_GET_CUSTODY"); } }
const remote = z.strictObject({ type: z.enum(["object", "boolean", "string"]), subtype: z.string().optional(), className: z.string().optional(), description: z.string().optional(), objectId: z.string().optional(), value: z.unknown().optional() });
const property = z.strictObject({ name: z.string(), value: remote, writable: z.literal(true), enumerable: z.literal(true), configurable: z.literal(true), isOwn: z.literal(true) });
const internal = z.strictObject({ name: z.literal("[[Prototype]]"), value: remote });
const properties = z.strictObject({ result: z.array(property).length(2), internalProperties: z.tuple([internal]) });
function missing(input: unknown): void {
  const raw = properties.parse(captureCurrentFootprintInversePreferenceReply(input));
  const fields = new Map(raw.result.map(row => [row.name, row.value])); need(fields.size === 2);
  const success = fields.get("success"); const message = fields.get("message"); const parent = raw.internalProperties[0].value;
  need(success?.type === "boolean" && success.value === false && success.objectId === undefined && success.subtype === undefined &&
    message?.type === "string" && message.value === "数据不存在" && message.objectId === undefined && message.subtype === undefined &&
    parent.type === "object" && parent.subtype === undefined && parent.className === "Object" && parent.objectId !== undefined);
}
const originals = new WeakSet<object>();
export class CurrentFootprintInverseNativeDeleteColdGetCollector {
  readonly #b: Bindings;
  readonly #requests: Promise<unknown>[] = [];
  readonly #helpers: Promise<unknown>[] = [];
  readonly #guards: Promise<unknown>[] = [];
  #normal = 0; #pending: Promise<Readonly<CurrentFootprintInverseNativeDeleteColdGetData>> | null = null;
  #data: Readonly<CurrentFootprintInverseNativeDeleteColdGetData> | null = null;
  #failed = false; #cause: unknown; #ended = false;
  public constructor(bindings: Bindings) {
    const target = Object.freeze(currentFootprintInverseNativeDeleteColdGetTargetSchema.parse(bindings.target));
    this.#b = Object.freeze({ ...bindings, target }); originals.add(this); Object.freeze(this);
  }
  #current(): void { if (this.#failed) { throw this.#cause; } need(!this.#ended); this.#b.current(); }
  async #send(command: Command): Promise<unknown> {
    this.#current(); need(this.#normal < LIMIT.normal); this.#normal += 1;
    const fixed = validate(command); const pending = this.#b.request(fixed); need(types.isPromise(pending)); this.#requests.push(pending);
    const raw = await pending; this.#current();
    if (fixed.method === "Runtime.callFunctionOn") {
      need(this.#helpers.length < LIMIT.helpers);
      const qualified = this.#b.qualifyHelper(fixed); need(types.isPromise(qualified)); this.#helpers.push(qualified); await qualified; this.#current();
    }
    return raw;
  }
  #properties(role: PropertyRole, objectId: string): Promise<unknown> {
    return this.#send(validate({ phase: "inverse-native-delete-cold-get-properties", role, method: "Runtime.getProperties",
      params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
  }
  #call(role: Role, references: readonly string[]): Promise<unknown> {
    const spec = SIGNATURES[role];
    const args: ({ objectId: string } | { value: Target })[] = references.map(objectId => ({ objectId }));
    if (spec.target) { args.push({ value: this.#b.target }); }
    return this.#send(validate({ phase: "inverse-native-delete-cold-get-call", role, method: "Runtime.callFunctionOn",
      params: { ...FLAGS, objectId: this.#b.reflection, functionDeclaration: PROGRAMS[role], arguments: args, returnByValue: spec.byValue } }));
  }
  async #tuple(role: Role, references: readonly string[], size: 1 | 2 | 3 | 5, propertyRole: PropertyRole): Promise<Readonly<{ id: string; values: ReturnType<typeof array> }>> {
    const id = result(await this.#call(role, references), size);
    const values = array(await this.#properties(propertyRole, id), size); this.#current(); return { id, values };
  }
  #opaque(values: ReturnType<typeof array>, index: number): string {
    this.#current(); const selected = values.get(String(index));
    need(selected?.type === "object" && selected.subtype === undefined && selected.objectId !== undefined);
    return object(values, index);
  }
  public start(): Promise<Readonly<CurrentFootprintInverseNativeDeleteColdGetData>> {
    this.#current(); if (this.#pending !== null) { return this.#pending; }
    const gate = Promise.withResolvers<null>();
    const pending = (async (): Promise<Readonly<CurrentFootprintInverseNativeDeleteColdGetData>> => {
      await gate.promise;
      try {
        this.#current();
        const footprint = await this.#tuple("project", [this.#b.originalProject], 1, "projectFootprint");
        const manager = this.#opaque(footprint.values, 0);
        const view = await this.#tuple("footprint", [manager], 2, "footprintView");
        const parent = this.#opaque(view.values, 0); const rows = this.#opaque(view.values, 1);
        const methods = await this.#tuple("methods", [this.#b.originalProject, manager, parent, rows], 3, "methods");
        // Classify the original entry before snapshot traverses it.
        this.#opaque(methods.values, 2);
        for (const [index, role] of [[0, "get"], [1, "getData"]] as const) {
          const reference = callable({ result: methods.values.get(String(index)) }, role);
          metadata(await this.#properties(role, reference), role, this.#b.scriptId, this.#b.source); this.#current();
        }
        const proof = await this.#tuple("snapshot", [this.#b.originalProject, manager, parent, rows, methods.id], 5, "proof");
        const before = this.#b.beforeOriginalRead(); need(types.isPromise(before)); this.#guards.push(before); await before; this.#current();
        for (let sample = 0; sample < LIMIT.samples; sample += 1) {
          const read = await this.#tuple("read", [proof.id], 2, "read");
          const originalResult = this.#opaque(read.values, 0);
          missing(await this.#properties("result", originalResult)); this.#current();
          truth(await this.#call("result", [proof.id, read.id])); this.#current();
        }
        const after = this.#b.afterOriginalRead(); need(types.isPromise(after)); this.#guards.push(after); await after; this.#current();
        truth(await this.#call("reprove", [proof.id])); this.#current();
        need(this.#normal === LIMIT.normal && this.#requests.length === LIMIT.normal && this.#helpers.length === LIMIT.helpers && this.#guards.length === 2);
        this.#b.requireOriginalPhysicalComplete();
        this.#data = Object.freeze({
          profile: "private.current-footprint-inverse-native-delete-cold-get-data.v1",
          targetUuid: this.#b.target.targetUuid, maximumTicket: this.#b.target.maximumTicket,
          originalRetainedTombstoneMatched: true, originalNativeManagerGetCompleted: true,
          originalNativeManagerGetInvocations: 2, normalRequests: 19, helperRequests: 9, cdpRequests: 28,
          nativeManagerReturnedMissing: true, sourceGetterDispatched: true,
          publicSdkParity: false, nativeUiTaskAbsenceVerified: false, persistentUploadReplayExcluded: false,
          coldGenerationClosureVerified: false, coldAbsenceVerified: false, wholeInverseVerified: false, executionAuthorized: false,
        });
        return this.#data;
      } catch (error) { this.#failed = true; this.#cause = error; throw error; }
    })();
    this.#pending = pending; gate.resolve(null); return pending;
  }
  public requireOriginal(data: Readonly<CurrentFootprintInverseNativeDeleteColdGetData>): void {
    this.#current(); need(this.#data === data && this.#pending !== null);
  }
  public requireOriginalAfterOriginalExit(data: Readonly<CurrentFootprintInverseNativeDeleteColdGetData>): void {
    this.#b.assertOriginalExit(); need(!this.#failed && this.#data === data && this.#pending !== null);
  }
  public async settleAfterOriginalExit(): Promise<void> {
    this.#b.assertOriginalExit(); this.#ended = true;
    await Promise.allSettled([this.#pending, ...this.#requests, ...this.#helpers, ...this.#guards]); this.#b.assertOriginalExit();
  }
}
Object.freeze(CurrentFootprintInverseNativeDeleteColdGetCollector.prototype);
Object.freeze(CurrentFootprintInverseNativeDeleteColdGetCollector);
export function assertOriginalCurrentFootprintInverseNativeDeleteColdGetCollector(value: CurrentFootprintInverseNativeDeleteColdGetCollector): void {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && originals.has(value) &&
    Object.getPrototypeOf(value) === CurrentFootprintInverseNativeDeleteColdGetCollector.prototype && Reflect.ownKeys(value).length === 0);
}
