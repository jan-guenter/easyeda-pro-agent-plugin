/** Third-generation cache custody is issued only by its fresh inverse factory.
 * The shared ledgers describe data; no Via origin or checkpoint is admitted. */
import type { CurrentFootprintForwardSavedCheckpoint } from "./current-footprint-copy-held-saved-generation.ts";
import type { CurrentPcbViaSavedCacheCommand } from "./current-pcb-via-saved-cache-protocol.ts";
import type { CurrentPcbViaSavedCachePacket, CurrentPcbViaSavedCacheSnapshot } from "./current-pcb-via-saved-cache-ledger.ts";
import type { CurrentPcbViaSavedCacheMetadataCommand } from "./current-pcb-via-saved-cache-metadata-protocol.ts";
import type { CurrentPcbViaSavedCacheMetadataPacket, CurrentPcbViaSavedCacheMetadataSnapshot } from "./current-pcb-via-saved-cache-metadata-ledger.ts";

export interface CurrentFootprintInverseCacheOrigin { readonly profile: "private.current-footprint-inverse-cache-origin.v1" }
export interface CurrentFootprintInverseCacheBindings {
  readonly prepared: CurrentFootprintForwardSavedCheckpoint; readonly projectUuid: string;
  readonly request: (command: CurrentPcbViaSavedCacheCommand) => Promise<CurrentPcbViaSavedCachePacket>;
  readonly metadataRequest: (command: CurrentPcbViaSavedCacheMetadataCommand) => Promise<CurrentPcbViaSavedCacheMetadataPacket>;
  readonly assertCurrent: () => Promise<void>;
  readonly snapshot: () => CurrentPcbViaSavedCacheSnapshot;
  readonly requireSnapshot: (snapshot: CurrentPcbViaSavedCacheSnapshot) => void;
  readonly requirePacket: (packet: CurrentPcbViaSavedCachePacket) => void;
  readonly metadataSnapshot: () => CurrentPcbViaSavedCacheMetadataSnapshot;
  readonly requireMetadataSnapshot: (snapshot: CurrentPcbViaSavedCacheMetadataSnapshot) => void;
  readonly requireMetadataPacket: (packet: CurrentPcbViaSavedCacheMetadataPacket) => void;
}

export interface CurrentFootprintInverseCacheBackupGrant { readonly profile: "private.current-footprint-inverse-cache-backup.v1" }
export interface CurrentFootprintInverseCacheAbsence { readonly profile: "private.current-footprint-inverse-cache-absence.v1" }
