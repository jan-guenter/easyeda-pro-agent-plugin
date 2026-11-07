/** Inert custody ledger for one original saved-reader metadata lane. A Core
 * origin must bind this exact instance and every actual correlated reply. */
import { types } from "node:util";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentFootprintCopyClockRpcArrayObject as arrayObject, decodeCurrentFootprintCopyClockRpcArray as decodeArray,
  decodeCurrentFootprintCopyClockRpcArrayCapture as decodeCapture } from "./current-footprint-copy-clock-rpc-protocol.ts";
import { CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_PROFILES as CACHE_PROFILES, decodeCurrentNativeCacheResponseIntrinsic } from "./current-native-cache-response-intrinsics.ts";
import { decodeCurrentNativeRequestMetadataCatalogue, decodeCurrentNativeRequestMetadataIntrinsic } from "./current-native-request-metadata-intrinsics.ts";
import type { CurrentNativeRequestMetadataCatalogue } from "./current-native-request-metadata-intrinsics.ts";
import { CURRENT_PCB_VIA_SAVED_CACHE_METADATA_HELPERS as HELPERS, decodeCurrentPcbViaSavedCacheMetadata, qualifyCurrentPcbViaSavedCacheMetadataHelper } from "./current-pcb-via-saved-cache-metadata-programs.ts";
import type { CurrentPcbViaSavedCacheMetadata, CurrentPcbViaSavedCacheMetadataHelper } from "./current-pcb-via-saved-cache-metadata-programs.ts";
import { CURRENT_PCB_VIA_SAVED_CACHE_METADATA_GROUP as GROUP, currentPcbViaSavedCacheMetadataMethod, validateCurrentPcbViaSavedCacheMetadataCommand } from "./current-pcb-via-saved-cache-metadata-protocol.ts";
import type { CurrentPcbViaSavedCacheMetadataCommand } from "./current-pcb-via-saved-cache-metadata-protocol.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const frameSchema = z.strictObject({ sessionId: handle.max(128), uniqueContextId: handle.max(128), executionContextId: z.number().int().positive(), projectUuid: z.string().regex(/^[a-f\d]{64}$/u) });
export type CurrentPcbViaSavedCacheMetadataFrame = Readonly<z.infer<typeof frameSchema>>;
export interface CurrentPcbViaSavedCacheMetadataPlan {
  readonly command: CurrentPcbViaSavedCacheMetadataCommand;
  readonly method: ReturnType<typeof currentPcbViaSavedCacheMetadataMethod>; readonly params: Readonly<Record<string, unknown>>;
  readonly helper: CurrentPcbViaSavedCacheMetadataHelper | null;
}
export interface CurrentPcbViaSavedCacheMetadataPacket { readonly command: CurrentPcbViaSavedCacheMetadataCommand; readonly request: CurrentPcbViaSavedCacheMetadataPlan; readonly reply: unknown; readonly nativeOwnershipVerified: false }
export interface CurrentPcbViaSavedCacheMetadataSnapshot {
  readonly schema: "private.current-pcb-via-saved-cache-metadata-snapshot.v1";
  readonly catalogue: CurrentNativeRequestMetadataCatalogue;
  readonly rounds: Readonly<Record<"backup" | "verify", readonly [CurrentPcbViaSavedCacheMetadata, CurrentPcbViaSavedCacheMetadata]>>;
  readonly packets: readonly CurrentPcbViaSavedCacheMetadataPacket[]; readonly helperEvents: readonly DiagnosticEvent[]; readonly completeHelperSourcesVerified: true;
  readonly nativeOwnershipVerified: false; readonly durableBackupVerified: false; readonly deletionAuthorized: false;
}
type Kind = "cache-response" | "request";
type Stage = "constructors" | "members";
interface Tuple { readonly id: string; readonly count: number; refs: ReturnType<typeof decodeArray> | null }
interface Helper { readonly role: CurrentPcbViaSavedCacheMetadataHelper; readonly occurrence: number; scriptId: string | null; runtimeSettled: boolean }
const fail = (): never => { throw new Error("SAVED_READBACK_METADATA_LEDGER"); };
function need(value: boolean): asserts value { if (!value) { fail(); } }
function key(command: CurrentPcbViaSavedCacheMetadataCommand): string { return JSON.stringify(command); }
function byValue(input: unknown, type: "object" | "boolean"): unknown {
  return z.strictObject({ result: z.strictObject({ type: z.literal(type), value: z.unknown() }) }).parse(captureCurrentPcbStringClockReply(input).value).result.value;
}

function metadataCall(helper: CurrentPcbViaSavedCacheMetadataHelper, receiver: Readonly<Record<string, string>>, args: readonly unknown[] = []): Readonly<Record<string, unknown>> {
  const call = HELPERS[helper]; return freezeDeep({ ...receiver, objectGroup: GROUP, silent: true, generatePreview: false,
    throwOnSideEffect: call.throwOnSideEffect, awaitPromise: call.awaitPromise, userGesture: false, returnByValue: call.returnByValue, functionDeclaration: call.program, arguments: args });
}
function arrayCount(raw: unknown): number {
  const parsed = z.strictObject({ result: z.strictObject({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"), description: z.string(), objectId: handle }) }).parse(raw);
  const count = [27, 28, 29, 30, 31, 32].find(value => parsed.result.description === `Array(${String(value)})`); need(count !== undefined); return count;
}

export class CurrentPcbViaSavedCacheMetadataLedger {
  readonly #frame: CurrentPcbViaSavedCacheMetadataFrame;
  readonly #tuples: Record<Kind, Partial<Record<Stage, Tuple>>> = { "cache-response": {}, request: {} };
  readonly #qualified: Record<Kind, Set<number>> = { "cache-response": new Set(), request: new Set() };
  readonly #reproved = new Set<Kind>(); readonly #attempted = new Set<string>(); readonly #helperCounts = new Map<CurrentPcbViaSavedCacheMetadataHelper, number>();
  readonly #helperEvents: DiagnosticEvent[] = [];
  readonly #packets = new Set<CurrentPcbViaSavedCacheMetadataPacket>(); readonly #snapshots = new WeakSet<CurrentPcbViaSavedCacheMetadataSnapshot>();
  readonly #observations: Record<"backup" | "verify", Map<number, CurrentPcbViaSavedCacheMetadata>> = { backup: new Map(), verify: new Map() };
  #catalogue: CurrentNativeRequestMetadataCatalogue | null = null; #pending: CurrentPcbViaSavedCacheMetadataPlan | null = null;
  #helper: Helper | null = null; #state: string | null = null; #failed = false; #released = false; #sourceReceipts = 0;
  public constructor(frame: CurrentPcbViaSavedCacheMetadataFrame) { this.#frame = Object.freeze(frameSchema.parse(captureCurrentPcbStringClockReply(frame).value)); Object.freeze(this); }
  #tuple(kind: Kind, stage: Stage): Tuple { const value = this.#tuples[kind][stage]; need(value !== undefined); return value; }
  #array(kind: Kind, stage: Stage): ReturnType<typeof decodeArray> { const refs = this.#tuple(kind, stage).refs; need(refs !== null); return refs; }
  #allFunctions(kind: Kind): void {
    const profiles = kind === "cache-response" ? CACHE_PROFILES : this.#catalogue; need(profiles !== null);
    need(profiles.every(profile => this.#qualified[kind].has(profile.index)));
  }
  #intrinsic(command: Extract<CurrentPcbViaSavedCacheMetadataCommand, { kind: Kind }>): Readonly<{ helper: CurrentPcbViaSavedCacheMetadataHelper | null; params: Readonly<Record<string, unknown>> }> {
    const { kind } = command; const prefix = kind === "cache-response" ? "cache" : "request";
    if (command.phase === "saved-cache-native-constructors") { need(this.#tuples[kind].constructors === undefined); const helper = `${prefix}-constructors` as const; return { helper, params: metadataCall(helper, { uniqueContextId: this.#frame.uniqueContextId }) }; }
    if (command.phase === "saved-cache-native-members") {
      need(this.#tuples[kind].members === undefined && [1, 2, 3].every(index => this.#qualified[kind].has(index)));
      const helper = `${prefix}-members` as const; return { helper, params: metadataCall(helper, { objectId: this.#tuple(kind, "constructors").id }) };
    }
    if (command.phase === "saved-cache-native-references") {
      const tuple = this.#tuple(kind, command.stage); need(tuple.refs === null);
      return { helper: null, params: { objectId: tuple.id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } };
    }
    if (command.phase === "saved-cache-native-function") {
      const index = command.slot; need(!this.#qualified[kind].has(index));
      const refs = this.#array(kind, index < 4 ? "constructors" : "members");
      if (index >= 8) { need((kind === "cache-response" ? CACHE_PROFILES : this.#catalogue)?.some(profile => profile.index === index) === true); }
      return { helper: null, params: { objectId: arrayObject(refs, index), ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } };
    }
    need(command.phase === "saved-cache-native-reprove" && !this.#reproved.has(kind)); this.#allFunctions(kind);
    const helper = `${prefix}-reprove` as const; return { helper, params: metadataCall(helper, { objectId: this.#tuple(kind, "members").id }) };
  }
  #other(command: Exclude<CurrentPcbViaSavedCacheMetadataCommand, { kind: Kind }>): Readonly<{ helper: CurrentPcbViaSavedCacheMetadataHelper | null; params: Readonly<Record<string, unknown>> }> {
    if (command.phase === "saved-cache-native-helper-source") {
      const helper = this.#helper; need(helper !== null && helper.runtimeSettled && helper.role === command.helper && helper.occurrence === command.occurrence && helper.scriptId !== null);
      return { helper: null, params: { scriptId: helper.scriptId } };
    }
    if (command.phase === "saved-cache-native-release") { need(this.#helper === null); return { helper: null, params: { objectGroup: GROUP } }; }
    if (command.phase === "saved-cache-native-catalogue") {
      need(this.#catalogue === null); this.#array("request", "members");
      return { helper: "request-catalogue", params: metadataCall("request-catalogue", { objectId: this.#tuple("request", "members").id }) };
    }
    if (command.phase === "saved-cache-native-bind") {
      need(this.#state === null && this.#reproved.has("cache-response") && this.#reproved.has("request"));
      return { helper: "bind", params: metadataCall("bind", { objectId: this.#tuple("cache-response", "members").id }, [{ objectId: this.#tuple("request", "members").id }, { value: this.#frame.projectUuid }]) };
    }
    need(command.phase === "saved-cache-native-observe" && this.#state !== null && this.#catalogue !== null && !this.#observations[command.round].has(command.ordinal));
    if (command.round === "verify") { need(this.#observations.backup.size === 2); }
    return { helper: "observe", params: metadataCall("observe", { objectId: this.#state }, [{ value: command.ordinal }]) };
  }
  public prepare(input: CurrentPcbViaSavedCacheMetadataCommand): CurrentPcbViaSavedCacheMetadataPlan {
    need(!this.#failed && !this.#released && this.#pending === null); const command = validateCurrentPcbViaSavedCacheMetadataCommand(input);
    need(!this.#attempted.has(key(command)) && (command.phase === "saved-cache-native-helper-source" || this.#helper === null));
    const selected = "kind" in command ? this.#intrinsic(command) : this.#other(command);
    const plan = freezeDeep({ command, method: currentPcbViaSavedCacheMetadataMethod(command), params: selected.params, helper: selected.helper });
    this.#attempted.add(key(command)); this.#pending = plan;
    if (selected.helper !== null) {
      const occurrence = this.#helperCounts.get(selected.helper) ?? 0; need(occurrence < HELPERS[selected.helper].emissions);
      this.#helper = { role: selected.helper, occurrence, scriptId: null, runtimeSettled: false }; this.#helperCounts.set(selected.helper, occurrence + 1);
    }
    return plan;
  }
  /** Only an empty-url script emitted by the actual in-flight fixed helper is
   * claimed. The owner still checks its full source before another phase. */
  public observeOriginalEvent(event: DiagnosticEvent): boolean {
    need(event !== null && typeof event === "object" && !types.isProxy(event));
    const method = Object.getOwnPropertyDescriptor(event, "method"); need(method !== undefined && Object.hasOwn(method, "value"));
    if (method.value !== "Debugger.scriptParsed") { return false; }
    const value = captureCurrentPcbStringClockReply(event).value;
    const parsed = z.strictObject({ method: z.literal("Debugger.scriptParsed"), sessionId: handle, params: z.record(z.string(), z.unknown()) }).parse(value);
    if (parsed.params["url"] !== "") { return false; }
    try {
      const helper = this.#helper; need(!this.#failed && helper !== null && helper.scriptId === null && parsed.sessionId === this.#frame.sessionId && parsed.params["executionContextId"] === this.#frame.executionContextId);
      helper.scriptId = handle.parse(parsed.params["scriptId"]); this.#helperEvents.push(freezeDeep(parsed)); return true;
    } catch (caughtError) { this.#failed = true; throw caughtError; }
  }
  #acceptIntrinsic(command: Extract<CurrentPcbViaSavedCacheMetadataCommand, { kind: Kind }>, raw: unknown): void {
    const { kind } = command;
    if (command.phase === "saved-cache-native-constructors" || command.phase === "saved-cache-native-members") {
      let count = 4;
      if (command.phase === "saved-cache-native-members") { count = kind === "cache-response" ? 28 : arrayCount(raw); }
      this.#tuples[kind][command.phase === "saved-cache-native-constructors" ? "constructors" : "members"] = { id: decodeCapture(raw, count), count, refs: null }; return;
    }
    if (command.phase === "saved-cache-native-references") {
      const tuple = this.#tuple(kind, command.stage);
      const refs = decodeArray(raw, tuple.count);
      if (command.stage === "members") { const prior = this.#array(kind, "constructors"); for (let index = 0; index < 4; index += 1) { need(arrayObject(prior, index) === arrayObject(refs, index)); } }
      tuple.refs = refs; return;
    }
    if (command.phase === "saved-cache-native-function") {
      if (kind === "cache-response") { decodeCurrentNativeCacheResponseIntrinsic(raw, command.slot); }
      else { const catalogue = command.slot < 4 ? [{ index: 1, name: "Request", arity: 1, constructor: true }, { index: 2, name: "Headers", arity: 0, constructor: true }, { index: 3, name: "AbortSignal", arity: 0, constructor: true }] : this.#catalogue; need(catalogue !== null); decodeCurrentNativeRequestMetadataIntrinsic(raw, catalogue, command.slot); }
      this.#qualified[kind].add(command.slot); return;
    }
    need(command.phase === "saved-cache-native-reprove" && byValue(raw, "boolean") === true); this.#reproved.add(kind);
  }
  public accept(plan: CurrentPcbViaSavedCacheMetadataPlan, input: unknown): CurrentPcbViaSavedCacheMetadataPacket {
    need(!this.#failed && this.#pending === plan);
    try {
      const command = plan.command; let reply: unknown;
      if (command.phase === "saved-cache-native-helper-source") {
        qualifyCurrentPcbViaSavedCacheMetadataHelper(input, command.helper); reply = Object.freeze({ scriptSource: `(${HELPERS[command.helper].program})` }); this.#helper = null; this.#sourceReceipts += 1;
      } else {
        reply = captureCurrentPcbStringClockReply(input).value;
        if ("kind" in command) { this.#acceptIntrinsic(command, reply); }
        else if (command.phase === "saved-cache-native-catalogue") { this.#catalogue = decodeCurrentNativeRequestMetadataCatalogue(byValue(reply, "object")); need(this.#tuple("request", "members").count === this.#catalogue.length + 5); }
        else if (command.phase === "saved-cache-native-bind") { this.#state = decodeCapture(reply, 4); }
        else if (command.phase === "saved-cache-native-observe") { need(this.#catalogue !== null); const value = decodeCurrentPcbViaSavedCacheMetadata(byValue(reply, "object"), this.#catalogue); need(value.ordinal === command.ordinal); this.#observations[command.round].set(command.ordinal, value); }
        else { need(command.phase === "saved-cache-native-release"); z.strictObject({}).parse(reply); this.#released = true; }
        if (plan.helper !== null) { need(this.#helper !== null && this.#helper.role === plan.helper); this.#helper.runtimeSettled = true; }
      }
      const packet = freezeDeep({ command, request: plan, reply, nativeOwnershipVerified: false as const }); this.#packets.add(packet); this.#pending = null; return packet;
    } catch (caughtError) { this.#failed = true; throw caughtError; }
  }
  public failOriginalDispatch(plan: CurrentPcbViaSavedCacheMetadataPlan): void { need(this.#pending === plan); this.#failed = true; }
  public snapshot(): CurrentPcbViaSavedCacheMetadataSnapshot {
    need(!this.#failed && !this.#released && this.#pending === null && this.#helper === null && this.#sourceReceipts === 12 && this.#catalogue !== null);
    const round = (name: "backup" | "verify"): readonly [CurrentPcbViaSavedCacheMetadata, CurrentPcbViaSavedCacheMetadata] => { const first = this.#observations[name].get(0), second = this.#observations[name].get(1); need(first !== undefined && second !== undefined); return Object.freeze([first, second]); };
    const snapshot = freezeDeep({ schema: "private.current-pcb-via-saved-cache-metadata-snapshot.v1" as const, catalogue: this.#catalogue, rounds: { backup: round("backup"), verify: round("verify") }, packets: [...this.#packets], helperEvents: [...this.#helperEvents], completeHelperSourcesVerified: true as const, nativeOwnershipVerified: false as const, durableBackupVerified: false as const, deletionAuthorized: false as const });
    this.#snapshots.add(snapshot); return snapshot;
  }
  public requireOriginalSnapshot(snapshot: CurrentPcbViaSavedCacheMetadataSnapshot): void { need(this.#snapshots.has(snapshot)); }
  public requireOriginalPacket(packet: CurrentPcbViaSavedCacheMetadataPacket): void { need(this.#packets.has(packet)); }
  public status(): Readonly<{ failed: boolean; pending: boolean; helperPending: boolean; released: boolean; sourceReceipts: number }> { return Object.freeze({ failed: this.#failed, pending: this.#pending !== null, helperPending: this.#helper !== null, released: this.#released, sourceReceipts: this.#sourceReceipts }); }
}
