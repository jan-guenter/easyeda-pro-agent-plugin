/** Complete current209 worker source and actual fixed breakpoint coordinates.
 * These inert checks establish neither native birth nor queue ownership. */
import { createHash } from "node:crypto";
import { CURRENT_PCB_209_WORKER_STARTUP_SOURCE } from "./current-pcb-209-worker-startup-profile.ts";
import { CURRENT_PROJECT_STRUCTURE_WORKER_SITES } from "./current-project-structure-worker-profile.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PROJECT_SAVE_STRUCTURE_SOURCE = CURRENT_PCB_209_WORKER_STARTUP_SOURCE;
export const CURRENT_PROJECT_SAVE_STRUCTURE_SITES = freezeDeep({
  bootstrap: { lineNumber: 110, columnNumber: 162_932, offset: 2_177_142, expression: "[TP,Nb]", length: 2 },
  packet: { ...CURRENT_PROJECT_STRUCTURE_WORKER_SITES.packet, expression: "[this,p,r]", length: 3 },
  response: { ...CURRENT_PROJECT_STRUCTURE_WORKER_SITES.response, expression: "[this,p,r,d]", length: 4 },
  callbackReturn: { ...CURRENT_PROJECT_STRUCTURE_WORKER_SITES.callbackReturn, expression: "[this,p,r,d]", length: 4 },
  initialFinally: { ...CURRENT_PROJECT_STRUCTURE_WORKER_SITES.initialFinally, expression: "[t,s,e]", length: 3 },
  queuedFinally: { ...CURRENT_PROJECT_STRUCTURE_WORKER_SITES.queuedFinally, expression: "[t,s,e]", length: 3 },
});
export type CurrentProjectSaveStructureSite = keyof typeof CURRENT_PROJECT_SAVE_STRUCTURE_SITES;
export function qualifyCurrentProjectSaveStructureSource(input: unknown): void {
  const expected = CURRENT_PROJECT_SAVE_STRUCTURE_SOURCE;
  if (typeof input !== "string" || !input.isWellFormed() || Buffer.byteLength(input) !== expected.bytes || createHash("sha256").update(input).digest("hex") !== expected.sha256) {
    throw new Error("PROJECT_SAVE_STRUCTURE_SOURCE");
  }
  const lines = input.split("\n");
  for (const site of Object.values(CURRENT_PROJECT_SAVE_STRUCTURE_SITES)) {
    const offset = lines.slice(0, site.lineNumber).reduce((sum, line) => sum + line.length + 1, 0) + site.columnNumber;
    if (offset !== site.offset) { throw new Error("PROJECT_SAVE_STRUCTURE_SOURCE_LOCATION"); }
  }
}
