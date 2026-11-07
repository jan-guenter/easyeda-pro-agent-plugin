/** Only this fresh schematic reader's private Core registry can issue an
 * original cache origin. Shared packet/ledger types are inert data only. */
import type { GeneratedSchematicRelevanceSavedReadbackPlan } from "./generated-schematic-relevance-saved-readback-plan.ts";
import type { CurrentPcbViaSavedCacheMetadataCommand } from "./current-pcb-via-saved-cache-metadata-protocol.ts";
import type { CurrentPcbViaSavedCacheMetadataPacket, CurrentPcbViaSavedCacheMetadataSnapshot } from "./current-pcb-via-saved-cache-metadata-ledger.ts";
import type { CurrentPcbViaSavedCacheCommand } from "./current-pcb-via-saved-cache-protocol.ts";
import type { CurrentPcbViaSavedCachePacket, CurrentPcbViaSavedCacheSnapshot } from "./current-pcb-via-saved-cache-ledger.ts";

export interface CurrentSchematicRelevanceSavedCacheOrigin { readonly profile: "private.current-schematic-relevance-saved-cache-origin.v1" }
export interface CurrentSchematicRelevanceSavedCacheBindings {
  readonly prepared: GeneratedSchematicRelevanceSavedReadbackPlan; readonly projectUuid: string;
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
