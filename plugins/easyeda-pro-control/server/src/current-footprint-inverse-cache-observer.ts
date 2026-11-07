/* oxlint-disable import/max-dependencies -- The fixed original cache driver joins correlated CDP/native packets, metadata catalogue and finite complete-entry/body limits. */
/** Automatic original cache observations only. Genuine Core bindings own all
 * selectors; no caller callback table, native handle or program is accepted. */
import { z } from "zod";
import { CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_PROFILES as CACHE } from "./current-native-cache-response-intrinsics.ts";
import { decodeCurrentNativeRequestMetadataCatalogue } from "./current-native-request-metadata-intrinsics.ts";
import { requireOriginalCurrentFootprintInverseCacheOrigin } from "./current-footprint-inverse-native-owner.ts";
import type { CurrentFootprintInverseNativeOwner } from "./current-footprint-inverse-native-owner.ts";
import type { CurrentFootprintForwardSavedCheckpoint } from "./current-footprint-copy-held-saved-generation.ts";
import type { CurrentFootprintInverseCacheOrigin } from "./current-footprint-inverse-cache-origin.ts";
import type { CurrentPcbViaSavedCacheMetadataCommand } from "./current-pcb-via-saved-cache-metadata-protocol.ts";
import type { CurrentPcbViaSavedCacheMetadataHelper } from "./current-pcb-via-saved-cache-metadata-programs.ts";
import { CURRENT_PCB_VIA_SAVED_CACHE_METADATA_REQUESTS } from "./current-pcb-via-saved-cache-metadata-programs.ts";
import type { CurrentPcbViaSavedCacheMetadataPacket } from "./current-pcb-via-saved-cache-metadata-ledger.ts";
import { decodeCurrentPcbViaSavedCacheEntries, decodeCurrentPcbViaSavedCacheNames,
  requireCurrentPcbViaSavedCacheCombinedEntries, selectCurrentPcbViaSavedCacheNamespaces } from "./current-pcb-via-saved-cache-data.ts";
import type { CurrentPcbViaSavedCacheEntries } from "./current-pcb-via-saved-cache-data.ts";
import { CURRENT_FOOTPRINT_INVERSE_CACHE_REQUESTS as INVERSE } from "./current-footprint-inverse-cache-wire.ts";
import type { CurrentPcbViaSavedCacheCommand } from "./current-pcb-via-saved-cache-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

export async function observeOriginalCurrentFootprintInverseCaches(owner: CurrentFootprintInverseNativeOwner,
  prepared: CurrentFootprintForwardSavedCheckpoint, origin: CurrentFootprintInverseCacheOrigin): Promise<void> {
  const bindings = requireOriginalCurrentFootprintInverseCacheOrigin(origin, owner, prepared);
  const current = async (): Promise<void> => {
    if (requireOriginalCurrentFootprintInverseCacheOrigin(origin, owner, prepared) !== bindings) { throw new Error("SAVED_CACHE_DRIVER_ORIGINAL_BINDINGS"); }
    await bindings.assertCurrent();
    if (requireOriginalCurrentFootprintInverseCacheOrigin(origin, owner, prepared) !== bindings) { throw new Error("SAVED_CACHE_DRIVER_ORIGINAL_BINDINGS"); }
  };
  const helpers = new Map<CurrentPcbViaSavedCacheMetadataHelper, number>(); let cacheCalls = 0, metadataCalls = 0;
  const metadata = async (command: CurrentPcbViaSavedCacheMetadataCommand): Promise<CurrentPcbViaSavedCacheMetadataPacket> => {
    await current(); metadataCalls += 1;
    if (metadataCalls > CURRENT_PCB_VIA_SAVED_CACHE_METADATA_REQUESTS.total) { throw new Error("SAVED_CACHE_DRIVER_METADATA_BOUND"); }
    const packet = await bindings.metadataRequest(command); bindings.requireMetadataPacket(packet); await current();
    const helper = packet.request.helper;
    if (helper !== null) {
      const occurrence = helpers.get(helper) ?? 0; helpers.set(helper, occurrence + 1); metadataCalls += 1;
      if (metadataCalls > CURRENT_PCB_VIA_SAVED_CACHE_METADATA_REQUESTS.total) { throw new Error("SAVED_CACHE_DRIVER_METADATA_BOUND"); }
      const receipt = await bindings.metadataRequest({ phase: "saved-cache-native-helper-source", helper, occurrence });
      bindings.requireMetadataPacket(receipt); await current();
    }
    return packet;
  };
  const cache = async (command: CurrentPcbViaSavedCacheCommand): Promise<unknown> => {
    await current(); cacheCalls += 1;
    if (cacheCalls > INVERSE.cacheNormal + INVERSE.cacheCleanup) { throw new Error("SAVED_CACHE_DRIVER_CDP_BOUND"); }
    const packet = await bindings.request(command); bindings.requirePacket(packet); await current(); return packet.reply;
  };
  const key = z.strictObject({ storageKey: z.string().min(1).max(8192) }).parse(await cache({ phase: "saved-cache-key", step: "initial" })).storageKey;
  await cache({ phase: "saved-cache-track" });
  const roster = decodeCurrentPcbViaSavedCacheNames(await cache({ phase: "saved-cache-names", step: "before" }), key, "https://client");
  const selected = selectCurrentPcbViaSavedCacheNamespaces(roster, bindings.projectUuid);
  for (const kind of ["cache-response", "request"] as const) {
    await metadata({ phase: "saved-cache-native-constructors", kind });
    await metadata({ phase: "saved-cache-native-references", kind, stage: "constructors" });
    for (const slot of [1, 2, 3]) { await metadata({ phase: "saved-cache-native-function", kind, slot }); }
    await metadata({ phase: "saved-cache-native-members", kind });
    await metadata({ phase: "saved-cache-native-references", kind, stage: "members" });
    let slots: readonly number[] = CACHE.slice(3).map(profile => profile.index);
    if (kind === "request") {
      const packet = await metadata({ phase: "saved-cache-native-catalogue" });
      const envelope = z.strictObject({ result: z.strictObject({ type: z.literal("object"), value: z.unknown() }) }).parse(captureCurrentPcbStringClockReply(packet.reply).value);
      slots = decodeCurrentNativeRequestMetadataCatalogue(envelope.result.value).slice(3).map(profile => profile.index);
    }
    for (const slot of slots) { await metadata({ phase: "saved-cache-native-function", kind, slot }); }
    await metadata({ phase: "saved-cache-native-reprove", kind });
  }
  await metadata({ phase: "saved-cache-native-bind" });
  for (const round of ["backup", "verify"] as const) {
    const entries: [CurrentPcbViaSavedCacheEntries | null, CurrentPcbViaSavedCacheEntries | null] = [null, null];
    for (const ordinal of [0, 1] as const) {
      if (selected[ordinal] !== null) { entries[ordinal] = decodeCurrentPcbViaSavedCacheEntries(await cache({ phase: "saved-cache-entries", round, ordinal }), "https://client"); }
    }
    // Both complete entry rosters are checked before the first body request.
    requireCurrentPcbViaSavedCacheCombinedEntries(entries[0], entries[1]);
    for (const ordinal of [0, 1] as const) {
      for (let entryIndex = 0; entryIndex < (entries[ordinal]?.returnCount ?? 0); entryIndex += 1) { await cache({ phase: "saved-cache-body", round, ordinal, entryIndex }); }
    }
    for (const ordinal of [0, 1] as const) { await metadata({ phase: "saved-cache-native-observe", round, ordinal }); }
  }
  await cache({ phase: "saved-cache-names", step: "after-backup" }); await current();
  bindings.requireSnapshot(bindings.snapshot()); bindings.requireMetadataSnapshot(bindings.metadataSnapshot());
}
