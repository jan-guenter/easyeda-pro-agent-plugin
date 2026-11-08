/** Fixed executable dependencies retained before a selected-file SQL birth. */
import { ORDINARY_LAUNCH_209_PROFILE } from "./ordinary-launch-209-profile.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_INSTALLATION_FILES } from "./current-selected-file-main-sql-fence-source.ts";
import { CURRENT_PCB_VIA_WRITE_SDK_SOURCE } from "./current-pcb-via-write-program.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

interface Pin { readonly relativePath: string; readonly bytes: number; readonly sha256: string }
const pins = new Map<string, Pin>();
for (const pin of [...ORDINARY_LAUNCH_209_PROFILE.installedFiles, ...CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_INSTALLATION_FILES, CURRENT_PCB_VIA_WRITE_SDK_SOURCE]) {
  const prior = pins.get(pin.relativePath);
  if (prior !== undefined && (prior.bytes !== pin.bytes || prior.sha256 !== pin.sha256)) { throw new Error("SELECTED_SQL_INSTALLATION_PIN_CONFLICT"); }
  pins.set(pin.relativePath, { relativePath: pin.relativePath, bytes: pin.bytes, sha256: pin.sha256 });
}
export const CURRENT_SELECTED_FILE_MAIN_INSTALLATION_FILES = freezeDeep([...pins.values()]);
