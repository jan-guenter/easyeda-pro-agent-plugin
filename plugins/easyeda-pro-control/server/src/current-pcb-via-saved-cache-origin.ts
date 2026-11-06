/** Opaque origin for the new native reader. No constructor/data packet issues
 * this reference; only its original factory and retained cache driver do. */
import type { CurrentPcbViaWriteClosedCheckpoint } from "./current-pcb-via-write-closed-checkpoint.ts";
import type { CurrentPcbViaSavedCacheMetadataCommand } from "./current-pcb-via-saved-cache-metadata-protocol.ts";
import type { CurrentPcbViaSavedCacheMetadataPacket, CurrentPcbViaSavedCacheMetadataSnapshot } from "./current-pcb-via-saved-cache-metadata-ledger.ts";
import type { CurrentPcbViaSavedCacheCommand } from "./current-pcb-via-saved-cache-protocol.ts";
import type { CurrentPcbViaSavedCachePacket, CurrentPcbViaSavedCacheSnapshot } from "./current-pcb-via-saved-cache-ledger.ts";

export interface CurrentPcbViaSavedCacheOrigin { readonly profile: "private.current-pcb-via-saved-cache-origin.v1" }
export interface CurrentPcbViaSavedCacheBindings {
  readonly prepared: CurrentPcbViaWriteClosedCheckpoint;
  readonly request: (command: CurrentPcbViaSavedCacheCommand) => Promise<CurrentPcbViaSavedCachePacket>;
  readonly metadataRequest: (command: CurrentPcbViaSavedCacheMetadataCommand) => Promise<CurrentPcbViaSavedCacheMetadataPacket>;
  readonly metadataSnapshot: () => CurrentPcbViaSavedCacheMetadataSnapshot;
  readonly requireMetadataSnapshot: (snapshot: CurrentPcbViaSavedCacheMetadataSnapshot) => void;
  readonly requireMetadataPacket: (packet: CurrentPcbViaSavedCacheMetadataPacket) => void;
  readonly assertCurrent: () => Promise<void>;
  readonly snapshot: () => CurrentPcbViaSavedCacheSnapshot;
  readonly requireSnapshot: (snapshot: CurrentPcbViaSavedCacheSnapshot) => void;
  readonly requirePacket: (packet: CurrentPcbViaSavedCachePacket) => void;
}
