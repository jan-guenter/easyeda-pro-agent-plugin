/** Original-reply data ledger only. The native owner supplies its own frame and
 * owns the correlated dispatch. This class grants no owner, delete or opening. */
import { types } from "node:util";
import { canonicalJson, sha256Text } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_VIA_SAVED_CACHE_LIMITS as LIMITS, CURRENT_PCB_VIA_SAVED_CACHE_METHODS as METHODS,
  validateCurrentPcbViaSavedCacheCommand } from "./current-pcb-via-saved-cache-protocol.ts";
import type { CurrentPcbViaSavedCacheCommand } from "./current-pcb-via-saved-cache-protocol.ts";
import { decodeCurrentPcbViaSavedCacheEntries, decodeCurrentPcbViaSavedCacheNames, decodeCurrentPcbViaSavedCachedBody,
  requireCurrentPcbViaSavedCacheBodyBudget, requireCurrentPcbViaSavedCacheCombinedEntries, requireCurrentPcbViaSavedCacheRepeat,
  selectCurrentPcbViaSavedCacheNamespaces } from "./current-pcb-via-saved-cache-data.ts";
import type { CurrentPcbViaSavedCacheDescription, CurrentPcbViaSavedCacheEntries, CurrentPcbViaSavedCacheNames, CurrentPcbViaSavedCachedBody } from "./current-pcb-via-saved-cache-data.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface CurrentPcbViaSavedCacheFrame {
  readonly frameId: string; readonly sessionId: string; readonly securityOrigin: string; readonly projectUuid: string;
}
export interface CurrentPcbViaSavedCachePlan {
  readonly command: CurrentPcbViaSavedCacheCommand; readonly method: (typeof METHODS)[keyof typeof METHODS]; readonly params: Readonly<Record<string, unknown>>;
}
export interface CurrentPcbViaSavedCachePacket { readonly command: CurrentPcbViaSavedCacheCommand; readonly reply: unknown; readonly nativeOwnershipVerified: false }
export interface CurrentPcbViaSavedCacheSnapshot {
  readonly frame: CurrentPcbViaSavedCacheFrame; readonly storageKey: string; readonly roster: CurrentPcbViaSavedCacheNames;
  readonly selected: readonly [CurrentPcbViaSavedCacheDescription | null, CurrentPcbViaSavedCacheDescription | null];
  readonly rounds: Readonly<Record<"backup" | "verify", readonly Readonly<{ entries: CurrentPcbViaSavedCacheEntries | null; bodies: readonly CurrentPcbViaSavedCachedBody[] }>[]>>;
  readonly packets: readonly CurrentPcbViaSavedCachePacket[]; readonly peerRosterSha256: string;
  readonly completeRepeatedCdpData: true; readonly nativeOwnershipVerified: false; readonly completeNativeMetadataVerified: false;
  readonly durableBackupVerified: false; readonly deletionAuthorized: false;
}
type Round = "backup" | "verify";
const fail = (): never => { throw new Error("SAVED_READBACK_CACHE_ORIGINAL_LEDGER"); };
function need(value: boolean): asserts value { if (!value) { fail(); } }
function key(command: CurrentPcbViaSavedCacheCommand): string { return canonicalJson(command); }
function ownFrame(input: CurrentPcbViaSavedCacheFrame): CurrentPcbViaSavedCacheFrame {
  need(input !== null && typeof input === "object" && !types.isProxy(input) && Object.getPrototypeOf(input) === Object.prototype && Object.isFrozen(input));
  const fields = ["frameId", "sessionId", "securityOrigin", "projectUuid"];
  need(Reflect.ownKeys(input).length === fields.length);
  for (const name of fields) { const d = Object.getOwnPropertyDescriptor(input, name); need(d !== undefined && Object.hasOwn(d, "value") && typeof d.value === "string"); }
  need(/^[A-Za-z\d_.:-]{1,128}$/u.test(input.frameId) && /^[A-Za-z\d_.:-]{1,128}$/u.test(input.sessionId) && /^[a-f\d]{64}$/u.test(input.projectUuid) &&
    input.securityOrigin.length > 0 && input.securityOrigin.length <= 8192 && input.securityOrigin.isWellFormed() && !input.securityOrigin.includes("\0"));
  return input;
}

export class CurrentPcbViaSavedCacheLedger {
  readonly #frame: CurrentPcbViaSavedCacheFrame;
  readonly #attempted = new Set<string>();
  readonly #packets = new Set<CurrentPcbViaSavedCachePacket>();
  readonly #snapshots = new WeakSet<CurrentPcbViaSavedCacheSnapshot>();
  readonly #entries: Record<Round, Map<number, CurrentPcbViaSavedCacheEntries>> = { backup: new Map(), verify: new Map() };
  readonly #bodies: Record<Round, Map<number, Map<number, CurrentPcbViaSavedCachedBody>>> = { backup: new Map(), verify: new Map() };
  #storageKey: string | null = null; #roster: CurrentPcbViaSavedCacheNames | null = null;
  #selected: readonly [CurrentPcbViaSavedCacheDescription | null, CurrentPcbViaSavedCacheDescription | null] | null = null;
  #pending: CurrentPcbViaSavedCachePlan | null = null; #failed = false; #tracked = false; #complete = false; #untracked = false;
  public constructor(frame: CurrentPcbViaSavedCacheFrame) { this.#frame = ownFrame(frame); Object.freeze(this); }
  #current(): void { need(!this.#failed && this.#pending === null && !this.#untracked); }
  #namespace(ordinal: 0 | 1): CurrentPcbViaSavedCacheDescription { const value = this.#selected?.[ordinal]; need(value !== null && value !== undefined); return value; }
  #entryCount(round: Round): number {
    need(this.#selected !== null);
    const values: (CurrentPcbViaSavedCacheEntries | null)[] = [];
    for (const [ordinal, namespace] of this.#selected.entries()) {
      const value = this.#entries[round].get(ordinal); need(namespace === null || value !== undefined); values.push(value ?? null);
    }
    return requireCurrentPcbViaSavedCacheCombinedEntries(values[0] ?? null, values[1] ?? null);
  }
  #roundBodies(round: Round): readonly CurrentPcbViaSavedCachedBody[] {
    const count = this.#entryCount(round), output: CurrentPcbViaSavedCachedBody[] = [];
    for (const [ordinal, entries] of this.#entries[round]) {
      const bodies = this.#bodies[round].get(ordinal);
      for (let index = 0; index < entries.returnCount; index += 1) { const body = bodies?.get(index); need(body !== undefined); output.push(body); }
    }
    requireCurrentPcbViaSavedCacheBodyBudget(output, count); return Object.freeze(output);
  }
  #repeat(): void {
    this.#roundBodies("backup"); this.#roundBodies("verify");
    for (const [ordinal, before] of this.#entries.backup) {
      const after = this.#entries.verify.get(ordinal); need(after !== undefined);
      const bodies = (round: Round): CurrentPcbViaSavedCachedBody[] => Array.from({ length: before.returnCount }, (_, index) => {
        const value = this.#bodies[round].get(ordinal)?.get(index); need(value !== undefined); return value;
      });
      requireCurrentPcbViaSavedCacheRepeat(before, after, bodies("backup"), bodies("verify"));
    }
  }
  #entryPlan(command: Extract<CurrentPcbViaSavedCacheCommand, { phase: "saved-cache-entries" | "saved-cache-body" }>): Readonly<Record<string, unknown>> {
    need(this.#tracked && !this.#complete); const namespace = this.#namespace(command.ordinal);
    if (command.phase === "saved-cache-entries") {
      if (command.round === "verify") { this.#roundBodies("backup"); }
      need(!this.#entries[command.round].has(command.ordinal)); return { cacheId: namespace.cacheId, skipCount: 0, pageSize: LIMITS.pageSize };
    }
    this.#entryCount(command.round); const entry = this.#entries[command.round].get(command.ordinal)?.cacheDataEntries[command.entryIndex]; need(entry !== undefined);
    need(this.#bodies[command.round].get(command.ordinal)?.has(command.entryIndex) !== true);
    return { cacheId: namespace.cacheId, requestURL: entry.requestURL, requestHeaders: entry.requestHeaders };
  }
  /** Consume one exact selector before dispatch. Every ID, key, URL and header
   * below came from this ledger's actual prior accepted replies, never selector data. */
  public prepare(input: CurrentPcbViaSavedCacheCommand): CurrentPcbViaSavedCachePlan {
    this.#current(); const command = validateCurrentPcbViaSavedCacheCommand(input); need(!this.#attempted.has(key(command)));
    let params: Readonly<Record<string, unknown>>;
    if (command.phase === "saved-cache-delete" || "step" in command && !["initial", "before", "after-backup"].includes(command.step)) { throw new Error("SAVED_READBACK_CACHE_COMPLETE_NATIVE_METADATA_REQUIRED"); }
    if (command.phase === "saved-cache-key") { need(command.step === "initial" && this.#storageKey === null && this.#roster === null); params = { frameId: this.#frame.frameId }; }
    else {
      const storageKey = this.#storageKey; need(storageKey !== null);
      if (command.phase === "saved-cache-names") {
        if (command.step === "before") { need(this.#roster === null && this.#tracked); } else { need(command.step === "after-backup" && this.#tracked && !this.#complete); this.#repeat(); }
        params = { storageKey };
      } else if (command.phase === "saved-cache-track") { need(!this.#tracked && this.#roster === null); params = { storageKey }; }
      else {
        need(this.#roster !== null && this.#selected !== null);
        if (command.phase === "saved-cache-untrack") { need(this.#tracked); params = { storageKey }; }
        else { params = this.#entryPlan(command); }
      }
    }
    const plan = freezeDeep({ command, method: METHODS[command.phase], params }); this.#attempted.add(key(command)); this.#pending = plan; return plan;
  }
  /** Called only after the original correlated request settles. A copied plan
   * cannot adopt its pending slot; malformed replies permanently refuse normal work. */
  public accept(plan: CurrentPcbViaSavedCachePlan, input: unknown): CurrentPcbViaSavedCachePacket {
    need(!this.#failed && this.#pending === plan);
    try {
      const captured = captureCurrentPcbStringClockReply(input); const command = plan.command;
      const packet = freezeDeep({ command, reply: captured.value, nativeOwnershipVerified: false as const }); this.#packets.add(packet);
      if (command.phase === "saved-cache-key") {
        const value = captured.value; need(value !== null && typeof value === "object" && !Array.isArray(value) && Reflect.ownKeys(value).length === 1 && "storageKey" in value && typeof value.storageKey === "string" && value.storageKey.length > 0 && value.storageKey.length <= 8192 && value.storageKey.isWellFormed() && !value.storageKey.includes("\0"));
        this.#storageKey = value.storageKey;
      } else if (command.phase === "saved-cache-names") {
        need(this.#storageKey !== null); const roster = decodeCurrentPcbViaSavedCacheNames(captured.value, this.#storageKey, this.#frame.securityOrigin);
        if (command.step === "before") { need(this.#roster === null); this.#roster = roster; this.#selected = selectCurrentPcbViaSavedCacheNamespaces(roster, this.#frame.projectUuid); }
        else { need(command.step === "after-backup" && this.#roster !== null && canonicalJson(roster) === canonicalJson(this.#roster)); this.#complete = true; }
      } else if (command.phase === "saved-cache-entries") {
        const entries = decodeCurrentPcbViaSavedCacheEntries(captured.value, this.#frame.securityOrigin); this.#entries[command.round].set(command.ordinal, entries);
        if (this.#selected?.every((value, ordinal) => value === null || this.#entries[command.round].has(ordinal)) === true) { this.#entryCount(command.round); }
      } else if (command.phase === "saved-cache-body") {
        const body = decodeCurrentPcbViaSavedCachedBody(captured.value); let bodies = this.#bodies[command.round].get(command.ordinal);
        if (bodies === undefined) { bodies = new Map(); this.#bodies[command.round].set(command.ordinal, bodies); } bodies.set(command.entryIndex, body);
        let bytes = 0; for (const collection of this.#bodies[command.round].values()) { for (const value of collection.values()) { bytes += value.bytes; } } need(bytes <= LIMITS.bodyBytesTotal);
      } else {
        need(captured.value !== null && typeof captured.value === "object" && Reflect.ownKeys(captured.value).length === 0);
        if (command.phase === "saved-cache-track") { this.#tracked = true; } else { need(command.phase === "saved-cache-untrack"); this.#untracked = true; }
      }
      this.#pending = null; return packet;
    } catch (error) { this.#failed = true; throw error; }
  }
  public snapshot(): CurrentPcbViaSavedCacheSnapshot {
    need(this.#complete && !this.#failed && !this.#untracked && this.#pending === null && this.#roster !== null && this.#selected !== null && this.#storageKey !== null); this.#repeat();
    const round = (name: Round): readonly Readonly<{ entries: CurrentPcbViaSavedCacheEntries | null; bodies: readonly CurrentPcbViaSavedCachedBody[] }>[] => [0, 1].map(ordinal => {
      const entries = this.#entries[name].get(ordinal) ?? null;
      const bodies = Array.from({ length: entries?.returnCount ?? 0 }, (_, index) => { const body = this.#bodies[name].get(ordinal)?.get(index); need(body !== undefined); return body; });
      return Object.freeze({ entries, bodies: Object.freeze(bodies) });
    });
    const selectedNames = new Set(this.#selected.filter(value => value !== null).map(value => value.cacheName));
    const peers = this.#roster.caches.filter(value => !selectedNames.has(value.cacheName));
    const snapshot = freezeDeep({ frame: this.#frame, storageKey: this.#storageKey, roster: this.#roster, selected: this.#selected,
      rounds: { backup: round("backup"), verify: round("verify") }, packets: [...this.#packets],
      peerRosterSha256: sha256Text(canonicalJson(peers)),
      completeRepeatedCdpData: true as const, nativeOwnershipVerified: false as const, completeNativeMetadataVerified: false as const, durableBackupVerified: false as const, deletionAuthorized: false as const });
    this.#snapshots.add(snapshot); return snapshot;
  }
  /** A rejected original request consumes the exact pending reservation. No
   * later selector can replay a lost result or borrow its response slot. */
  public failOriginalDispatch(plan: CurrentPcbViaSavedCachePlan): void { need(this.#pending === plan); this.#failed = true; }
  public observeOriginalEvent(method: string): boolean {
    if (method !== "Storage.cacheStorageListUpdated" && method !== "Storage.cacheStorageContentUpdated") { return false; }
    this.#failed = true; throw new Error("SAVED_READBACK_CACHE_CHANGED");
  }
  /** The native sampler must follow this exact original CDP round, including
   * both selected namespaces and the combined complete body budget. */
  public requireMetadataRound(round: "backup" | "verify"): void { need(!this.#failed && !this.#untracked && this.#tracked && this.#pending === null); this.#roundBodies(round); }
  public requireOriginalSnapshot(snapshot: CurrentPcbViaSavedCacheSnapshot): void { need(this.#snapshots.has(snapshot)); }
  public requireOriginalPacket(packet: CurrentPcbViaSavedCachePacket): void { need(this.#packets.has(packet)); }
  public status(): Readonly<{ failed: boolean; pending: boolean; tracked: boolean; completeRepeatedCdpData: boolean; packets: number;
    nativeOwnershipVerified: false; completeNativeMetadataVerified: false; durableBackupVerified: false; deletionAuthorized: false }> {
    return Object.freeze({ failed: this.#failed, pending: this.#pending !== null, tracked: this.#tracked && !this.#untracked, completeRepeatedCdpData: this.#complete, packets: this.#packets.size,
      nativeOwnershipVerified: false, completeNativeMetadataVerified: false, durableBackupVerified: false, deletionAuthorized: false });
  }
}
