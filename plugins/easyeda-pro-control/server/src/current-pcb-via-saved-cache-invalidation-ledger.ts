/** Data-only ordered delete/absence ledger. Its enclosing original reader must
 * separately own a complete durable backup and both current empty-UI guards. */
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentPcbViaSavedCacheNames } from "./current-pcb-via-saved-cache-data.ts";
import type { CurrentPcbViaSavedCacheNames } from "./current-pcb-via-saved-cache-data.ts";
import type { CurrentPcbViaSavedCachePacket, CurrentPcbViaSavedCachePlan, CurrentPcbViaSavedCacheSnapshot } from "./current-pcb-via-saved-cache-ledger.ts";
import { CURRENT_PCB_VIA_SAVED_CACHE_METHODS as METHODS, validateCurrentPcbViaSavedCacheCommand } from "./current-pcb-via-saved-cache-protocol.ts";
import type { CurrentPcbViaSavedCacheCommand } from "./current-pcb-via-saved-cache-protocol.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

function need(value: boolean): asserts value { if (!value) { throw new Error("SAVED_READBACK_INVALIDATION_LEDGER"); } }
export interface CurrentPcbViaSavedCacheAbsenceData {
  readonly schema: "private.current-pcb-via-saved-cache-absence-data.v1";
  readonly originalSnapshot: CurrentPcbViaSavedCacheSnapshot; readonly packets: readonly CurrentPcbViaSavedCachePacket[];
  readonly deleteOrdinals: readonly (0 | 1)[]; readonly roster: CurrentPcbViaSavedCacheNames;
  readonly bothExactNamespacesAbsent: true; readonly nativeOwnershipVerified: false; readonly freshLoadingVerified: false;
}
export interface CurrentPcbViaSavedCacheLoadingData {
  readonly schema: "private.current-pcb-via-saved-cache-loading-data.v1";
  readonly originalAbsence: CurrentPcbViaSavedCacheAbsenceData; readonly packets: readonly CurrentPcbViaSavedCachePacket[];
  readonly storageKey: string; readonly bothExactNamespacesAbsent: true; readonly peerRosterUnchanged: true;
  readonly nativeOwnershipVerified: false; readonly freshLoadingVerified: false;
}
export class CurrentPcbViaSavedCacheInvalidationLedger {
  readonly #before: CurrentPcbViaSavedCacheSnapshot;
  readonly #attempted = new Set<string>(); readonly #packets = new Set<CurrentPcbViaSavedCachePacket>();
  readonly #deleted = new Set<0 | 1>(); readonly #snapshots = new WeakSet<CurrentPcbViaSavedCacheAbsenceData>();
  #ordinal: 0 | 1 = 0; #stage: "key" | "before" | "delete" | "after" | "absence" | "complete" = "key";
  #pending: CurrentPcbViaSavedCachePlan | null = null; #failed = false; #deleteEvents = 0; #deleteAttempts = 0;
  #roster: CurrentPcbViaSavedCacheNames | null = null;
  #loading: 0 | 1 | 2 = 0; readonly #loadingPackets: CurrentPcbViaSavedCachePacket[] = []; readonly #loadingSnapshots = new WeakSet<CurrentPcbViaSavedCacheLoadingData>();
  public constructor(before: CurrentPcbViaSavedCacheSnapshot) { this.#before = before; Object.freeze(this); }
  #current(): void { need(!this.#failed && this.#pending === null); }
  #expected(): CurrentPcbViaSavedCacheNames {
    const ids = new Set([...this.#deleted].map(ordinal => this.#before.selected[ordinal]?.cacheId));
    return freezeDeep({ caches: this.#before.roster.caches.filter(cache => !ids.has(cache.cacheId)) });
  }
  public prepare(input: CurrentPcbViaSavedCacheCommand): CurrentPcbViaSavedCachePlan {
    this.#current(); const command = validateCurrentPcbViaSavedCacheCommand(input), slot = canonicalJson(command);
    need(!this.#attempted.has(slot)); let params: Readonly<Record<string, unknown>>;
    const ordinal = this.#ordinal, selected = this.#before.selected[ordinal];
    if (command.phase === "saved-cache-key") {
      need(this.#stage === "key" && command.step === `before-delete-${String(ordinal)}` || this.#stage === "complete" && this.#loading === 0 && command.step === "loading"); params = { frameId: this.#before.frame.frameId };
    } else if (command.phase === "saved-cache-names") {
      need(this.#stage === "before" && command.step === `before-delete-${String(ordinal)}` ||
        (this.#stage === "after" || this.#stage === "delete" && selected === null) && command.step === `after-delete-${String(ordinal)}` ||
        this.#stage === "absence" && command.step === "absence" || this.#stage === "complete" && this.#loading === 1 && command.step === "loading"); params = { storageKey: this.#before.storageKey };
    } else {
      need(command.phase === "saved-cache-delete" && command.ordinal === ordinal && this.#stage === "delete" && selected !== null && !this.#deleted.has(ordinal));
      params = { cacheId: selected.cacheId }; this.#deleteAttempts += 1;
    }
    const plan = freezeDeep({ command, method: METHODS[command.phase], params }); this.#attempted.add(slot); this.#pending = plan; return plan;
  }
  public accept(plan: CurrentPcbViaSavedCachePlan, input: unknown): CurrentPcbViaSavedCachePacket {
    need(!this.#failed && this.#pending === plan);
    try {
      const command = plan.command, reply = captureCurrentPcbStringClockReply(input).value;
      if (command.phase === "saved-cache-key") { need(reply !== null && typeof reply === "object" && Reflect.ownKeys(reply).length === 1 && "storageKey" in reply && reply.storageKey === this.#before.storageKey); if (command.step === "loading") { this.#loading = 1; } else { this.#stage = "before"; } }
      else if (command.phase === "saved-cache-delete") {
        need(reply !== null && typeof reply === "object" && Reflect.ownKeys(reply).length === 0); this.#deleted.add(command.ordinal); this.#stage = "after";
      } else {
        need(command.phase === "saved-cache-names"); const roster = decodeCurrentPcbViaSavedCacheNames(reply, this.#before.storageKey, this.#before.frame.securityOrigin);
        need(canonicalJson(roster) === canonicalJson(this.#expected())); this.#roster = roster;
        if (command.step === "loading") { need(this.#stage === "complete" && this.#loading === 1); this.#loading = 2; }
        else if (this.#stage === "before") { this.#stage = "delete"; }
        else if (this.#stage === "absence") { this.#stage = "complete"; }
        else { need(this.#stage === "after" || this.#stage === "delete" && this.#before.selected[this.#ordinal] === null);
          if (this.#ordinal === 0) { this.#ordinal = 1; this.#stage = "key"; } else { this.#stage = "absence"; } }
      }
      const packet: CurrentPcbViaSavedCachePacket = freezeDeep({ command, reply, nativeOwnershipVerified: false }); if ((command.phase === "saved-cache-key" || command.phase === "saved-cache-names") && command.step === "loading") { this.#loadingPackets.push(packet); }
      this.#packets.add(packet); this.#pending = null; return packet;
    } catch (caughtError) { this.#failed = true; throw caughtError; }
  }
  /** Only a bounded same-storage list notification after an actual planned
   * delete can be ours. Content notifications always refuse. Complete peer
   * rosters are independently compared after each original deletion reply. */
  public observeOriginalEvent(event: DiagnosticEvent): boolean {
    if (event.method !== "Storage.cacheStorageListUpdated" && event.method !== "Storage.cacheStorageContentUpdated") { return false; }
    try {
      const captured = captureCurrentPcbStringClockReply(event).value;
      need(!this.#failed && event.method === "Storage.cacheStorageListUpdated" && captured !== null && typeof captured === "object" && "params" in captured &&
        captured.params !== null && typeof captured.params === "object" && "storageKey" in captured.params && captured.params.storageKey === this.#before.storageKey &&
        "origin" in captured.params && captured.params.origin === this.#before.frame.securityOrigin && this.#deleteEvents < this.#deleteAttempts);
      this.#deleteEvents += 1; return true;
    } catch (caughtError) { this.#failed = true; throw caughtError; }
  }
  public snapshot(): CurrentPcbViaSavedCacheAbsenceData {
    this.#current(); need(this.#stage === "complete" && this.#roster !== null);
    const output: CurrentPcbViaSavedCacheAbsenceData = freezeDeep({ schema: "private.current-pcb-via-saved-cache-absence-data.v1", originalSnapshot: this.#before,
      packets: [...this.#packets], deleteOrdinals: [...this.#deleted], roster: this.#roster, bothExactNamespacesAbsent: true, nativeOwnershipVerified: false, freshLoadingVerified: false });
    this.#snapshots.add(output); return output;
  }
  public loadingSnapshot(absence: CurrentPcbViaSavedCacheAbsenceData): CurrentPcbViaSavedCacheLoadingData {
    this.#current(); this.requireOriginalSnapshot(absence); need(this.#stage === "complete" && this.#loading === 2 && this.#loadingPackets.length === 2);
    const output: CurrentPcbViaSavedCacheLoadingData = freezeDeep({ schema: "private.current-pcb-via-saved-cache-loading-data.v1", originalAbsence: absence,
      packets: [...this.#loadingPackets], storageKey: this.#before.storageKey, bothExactNamespacesAbsent: true, peerRosterUnchanged: true, nativeOwnershipVerified: false, freshLoadingVerified: false });
    this.#loadingSnapshots.add(output); return output;
  }
  public requireOriginalLoadingSnapshot(snapshot: CurrentPcbViaSavedCacheLoadingData): void { need(this.#loadingSnapshots.has(snapshot)); }
  public failOriginalDispatch(plan: CurrentPcbViaSavedCachePlan): void { need(this.#pending === plan); this.#failed = true; }
  public requireOriginalSnapshot(snapshot: CurrentPcbViaSavedCacheAbsenceData): void { need(this.#snapshots.has(snapshot)); }
  public requireOriginalPacket(packet: CurrentPcbViaSavedCachePacket): void { need(this.#packets.has(packet)); }
  public status(): Readonly<{ failed: boolean; pending: boolean; complete: boolean; attemptedDeletes: number }> {
    return Object.freeze({ failed: this.#failed, pending: this.#pending !== null, complete: this.#stage === "complete", attemptedDeletes: this.#deleteAttempts });
  }
}
