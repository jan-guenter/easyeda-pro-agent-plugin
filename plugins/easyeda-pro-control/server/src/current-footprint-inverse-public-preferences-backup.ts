/** Original two-key backup only. Its historical data recreates no Storage
 * object, running owner, removal completion or restoration permission. */
import type { CurrentFootprintInversePublicDeleteCall } from "./current-footprint-inverse-public-delete-call.ts";

export interface CurrentFootprintInversePublicPreferencesBackup {
  readonly profile: "private.current-footprint-inverse-public-preferences-backup.v1";
}
export interface CurrentFootprintInversePublicPreferencesBackupData {
  readonly call: CurrentFootprintInversePublicDeleteCall;
  readonly origin: string;
  readonly values: readonly [string | null, string | null];
  readonly peerSha256: string;
  readonly backupArtifactSha256: string;
  readonly restorationAuthorized: false;
}
export { requireOriginalCurrentFootprintInversePublicPreferencesBackup } from "./current-pcb-diagnostic-owner.ts";
