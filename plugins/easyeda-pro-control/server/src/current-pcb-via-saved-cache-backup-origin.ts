/** An original reader issues this reference only after its complete correlated
 * CDP/Fetch observations and durable backup settle. Serialized data cannot
 * authorize deletion, opening or a replacement owner. */
import type { CurrentPcbViaSavedCacheBackupData, CurrentPcbViaSavedCachePublishedData } from "./current-pcb-via-saved-cache-backup.ts";
import type { CurrentPcbViaSavedCacheOrigin } from "./current-pcb-via-saved-cache-origin.ts";

export interface CurrentPcbViaSavedCacheBackupGrant { readonly profile: "private.current-pcb-via-saved-cache-backup-grant.v1" }
export interface CurrentPcbViaSavedCacheBackupBindings {
  readonly origin: CurrentPcbViaSavedCacheOrigin;
  readonly data: CurrentPcbViaSavedCacheBackupData;
  readonly published: CurrentPcbViaSavedCachePublishedData;
  /** Rechecks the same original native context, every retained packet and the
   * complete closed backup file; each delete still needs its own current guard. */
  readonly assertCurrent: () => Promise<void>;
  readonly cacheDeletionAuthorized: false;
  readonly freshLoadingVerified: false;
}
