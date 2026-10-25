/** Fixed source files backing the project prelude, PCB29 phases and first
 * child's seven phases. Generated copies are covered by their complete creator
 * assets. This table supplies expected bytes; only native retained leases prove
 * the interval from the original launch through termination. */
import { CURRENT_PCB_209_OPENING_PROFILE } from "./current-pcb-209-opening-profile.ts";
import { CURRENT_PCB_209_ACTOR_CLOCK_SOURCE_PROFILE } from "./current-pcb-209-actor-clock-source.ts";
import { CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCE_PROFILE } from "./current-pcb-209-worker-bootstrap-source.ts";
import { CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_SOURCE_PROFILE } from "./current-pcb-209-ratline-pcb-bootstrap-profile.ts";
import { CURRENT_PCB_209_RATLINE_SOURCE_PROFILE } from "./current-pcb-209-ratline-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

interface Pin { readonly relativePath: string; readonly bytes: number; readonly sha256: string }
const pins = new Map<string, Pin>();
for (const pin of [...CURRENT_PCB_209_OPENING_PROFILE.installedFiles, ...Object.values(CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCE_PROFILE),
  ...Object.values(CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_SOURCE_PROFILE), CURRENT_PCB_209_RATLINE_SOURCE_PROFILE.worker,
  ...Object.values(CURRENT_PCB_209_ACTOR_CLOCK_SOURCE_PROFILE)]) {
  const previous = pins.get(pin.relativePath);
  if (previous !== undefined && (previous.bytes !== pin.bytes || previous.sha256 !== pin.sha256)) { throw new Error("PCB209_RATLINE_INSTALLATION_PIN_CONFLICT"); }
  pins.set(pin.relativePath, { relativePath: pin.relativePath, bytes: pin.bytes, sha256: pin.sha256 });
}
export const CURRENT_PCB_209_RATLINE_INSTALLATION_PROFILE = freezeDeep({
  purpose: "worker-startup-ratline209", installedFiles: [...pins.values()],
} as const);
