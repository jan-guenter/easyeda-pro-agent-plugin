/** Selector-free finite CacheStorage vocabulary for the separate saved opener.
 * The actual native owner must substitute its own original UI frame, storage
 * key, enumerated cache IDs and original entry URL/header tuples. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_VIA_SAVED_CACHE_LIMITS = Object.freeze({ namespaceRoster: 128, selectedNamespaces: 2, entries: 8,
  pageSize: 9, bodyBytesPerEntry: 8192, bodyBytesTotal: 32_768, headersPerEntry: 16, headerCharactersPerEntry: 8192 });
export const CURRENT_PCB_VIA_SAVED_CACHE_KEY_STEPS = ["initial", "before-delete-0", "before-delete-1", "loading"] as const;
export const CURRENT_PCB_VIA_SAVED_CACHE_NAME_STEPS = ["before", "after-backup", "before-delete-0", "after-delete-0", "before-delete-1", "after-delete-1", "absence", "loading"] as const;
export const CURRENT_PCB_VIA_SAVED_CACHE_ROUNDS = ["backup", "verify"] as const;
const ordinal = z.union([z.literal(0), z.literal(1)]);
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("saved-cache-key"), step: z.enum(CURRENT_PCB_VIA_SAVED_CACHE_KEY_STEPS) }),
  z.strictObject({ phase: z.literal("saved-cache-names"), step: z.enum(CURRENT_PCB_VIA_SAVED_CACHE_NAME_STEPS) }),
  z.strictObject({ phase: z.literal("saved-cache-entries"), round: z.enum(CURRENT_PCB_VIA_SAVED_CACHE_ROUNDS), ordinal }),
  z.strictObject({ phase: z.literal("saved-cache-body"), round: z.enum(CURRENT_PCB_VIA_SAVED_CACHE_ROUNDS), ordinal,
    entryIndex: z.number().int().min(0).max(CURRENT_PCB_VIA_SAVED_CACHE_LIMITS.entries - 1).refine(value => !Object.is(value, -0)) }),
  z.strictObject({ phase: z.literal("saved-cache-delete"), ordinal }),
  z.strictObject({ phase: z.literal("saved-cache-track") }),
  z.strictObject({ phase: z.literal("saved-cache-untrack") }),
]);
export type CurrentPcbViaSavedCacheCommand = z.infer<typeof schema>;
export const CURRENT_PCB_VIA_SAVED_CACHE_METHODS = freezeDeep({
  "saved-cache-key": "Storage.getStorageKeyForFrame",
  "saved-cache-names": "CacheStorage.requestCacheNames",
  "saved-cache-entries": "CacheStorage.requestEntries",
  "saved-cache-body": "CacheStorage.requestCachedResponse",
  "saved-cache-delete": "CacheStorage.deleteCache",
  "saved-cache-track": "Storage.trackCacheStorageForStorageKey",
  "saved-cache-untrack": "Storage.untrackCacheStorageForStorageKey",
} as const);
const rosters = CURRENT_PCB_VIA_SAVED_CACHE_NAME_STEPS.length, storageKeys = CURRENT_PCB_VIA_SAVED_CACHE_KEY_STEPS.length;
const entryLists = CURRENT_PCB_VIA_SAVED_CACHE_ROUNDS.length * CURRENT_PCB_VIA_SAVED_CACHE_LIMITS.selectedNamespaces;
const bodies = CURRENT_PCB_VIA_SAVED_CACHE_ROUNDS.length * CURRENT_PCB_VIA_SAVED_CACHE_LIMITS.entries;
export const CURRENT_PCB_VIA_SAVED_CACHE_REQUESTS = Object.freeze({ storageKeys, rosters, entryLists, bodies, deletes: 2, track: 1,
  normal: storageKeys + rosters + entryLists + bodies + 2 + 1, cleanup: 1, total: storageKeys + rosters + entryLists + bodies + 2 + 2 });
export function validateCurrentPcbViaSavedCacheCommand(input: unknown): CurrentPcbViaSavedCacheCommand {
  return Object.freeze(schema.parse(captureCurrentPcbStringClockReply(input).value));
}
/** No caller storage selector, cache ID, URL, headers or method crosses this
 * encoder. Native body requests select only an already captured bounded slot. */
export function currentPcbViaSavedCacheNativeRequest(input: CurrentPcbViaSavedCacheCommand): Readonly<Record<string, string | number>> {
  const command = validateCurrentPcbViaSavedCacheCommand(input);
  return Object.freeze({ savedCachePhase: command.phase, ...("step" in command ? { savedCacheStep: command.step } : {}),
    ...("round" in command ? { savedCacheRound: command.round } : {}), ...("ordinal" in command ? { namespaceOrdinal: command.ordinal } : {}),
    ...("entryIndex" in command ? { entryIndex: command.entryIndex } : {}) });
}
