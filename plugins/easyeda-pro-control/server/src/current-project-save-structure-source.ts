/** Complete current209 worker source and actual fixed breakpoint coordinates.
 * These inert checks establish neither native birth nor queue ownership. */
import { createHash } from "node:crypto";
import { CURRENT_PCB_209_WORKER_CONSTRUCTION_SITES as CONSTRUCTORS, CURRENT_PCB_209_WORKER_STARTUP_SOURCE } from "./current-pcb-209-worker-startup-profile.ts";
import { CURRENT_PROJECT_STRUCTURE_WORKER_SITES } from "./current-project-structure-worker-profile.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PROJECT_SAVE_STRUCTURE_SOURCE = CURRENT_PCB_209_WORKER_STARTUP_SOURCE;
export const CURRENT_PROJECT_SAVE_STRUCTURE_CONSTRUCTORS = Object.freeze(["producerUpload", "producerBase", "producerCooperation", "producerSerial", "producerDebounce", "producerProject"] as const);
export const CURRENT_PROJECT_SAVE_STRUCTURE_CONSTRUCTION_SEQUENCE = Object.freeze(["producerUpload", "producerBase", "producerCooperation", "producerSerial", "producerDebounce", "producerSerial", "producerProject"] as const);
export const CURRENT_PROJECT_SAVE_STRUCTURE_SITES = freezeDeep({
  producerUpload: { ...CONSTRUCTORS.upload, expression: "[t,s]", length: 2 },
  producerBase: { ...CONSTRUCTORS.base, expression: "[this]", length: 1 },
  producerCooperation: { ...CONSTRUCTORS.cooperation, expression: "[e,t]", length: 2 },
  producerSerial: { ...CONSTRUCTORS.serial, expression: "[e]", length: 1 },
  producerDebounce: { ...CONSTRUCTORS.debounce, expression: "[e,t]", length: 2 },
  producerProject: { ...CONSTRUCTORS.project, expression: "[this]", length: 1 },
  producerCaller: { lineNumber: 0, columnNumber: 0, offset: 0, expression: "[this]", length: 1 },
  startupEntry: { lineNumber: 110, columnNumber: 89_848, offset: 2_104_058, expression: "[this,s,r,i]", length: 4 },
  startupReturn: { lineNumber: 110, columnNumber: 90_030, offset: 2_104_240, expression: "[this,s,r,i]", length: 4 },
  startupCaller: { lineNumber: 0, columnNumber: 0, offset: 0, expression: "[e,t,s,r]", length: 4 },
  bootstrap: { lineNumber: 110, columnNumber: 162_932, offset: 2_177_142, expression: "[TP,Nb]", length: 2 },
  mode: { lineNumber: 110, columnNumber: 162_932, offset: 2_177_142, expression: "[qh]", length: 1 },
  packet: { ...CURRENT_PROJECT_STRUCTURE_WORKER_SITES.packet, expression: "[this,p,r]", length: 3 },
  response: { ...CURRENT_PROJECT_STRUCTURE_WORKER_SITES.response, expression: "[this,p,r,d]", length: 4 },
  callbackReturn: { ...CURRENT_PROJECT_STRUCTURE_WORKER_SITES.callbackReturn, expression: "[this,p,r,d]", length: 4 },
  initialFinally: { ...CURRENT_PROJECT_STRUCTURE_WORKER_SITES.initialFinally, expression: "[t,s,e]", length: 3 },
  queuedFinally: { ...CURRENT_PROJECT_STRUCTURE_WORKER_SITES.queuedFinally, expression: "[t,s,e]", length: 3 },
  timer: { lineNumber: 109, columnNumber: 164_014, offset: 2_011_327, expression: "[e,a,r]", length: 3 },
});
/** Only startup false/unknown state pauses. Ready callbacks continue in
 * the original application without entering this no-publication collector.
 * Descriptor failures remain held; no application accessor is invoked. */
export const CURRENT_PROJECT_SAVE_STRUCTURE_STARTUP_CONDITION = `(()=>{try{const p=Object.getOwnPropertyDescriptor(globalThis,"PROJECT"),r=Object.getOwnPropertyDescriptor(this,"isReady");return !p||!Object.hasOwn(p,"value")||p.value!==this||!r||!Object.hasOwn(r,"value")||r.value!==true;}catch{return true;}})()`;
export type CurrentProjectSaveStructureSite = keyof typeof CURRENT_PROJECT_SAVE_STRUCTURE_SITES;
export const CURRENT_PROJECT_SAVE_STRUCTURE_METADATA_METHODS = freezeDeep({
  pcb: { start: 1_811_116, end: 1_811_291, bytes: 175, sha256: "b4780bdc55594870e9421dff5901b6aea06f247eef26328d7194d0d6927c1626" },
  schematic: { start: 1_811_291, end: 1_811_416, bytes: 125, sha256: "ad87f6cfa2c54ade38c07ed1669565cd5c1b06eabc923d55a86ce2fda1d312a9" },
  sheet: { start: 1_811_416, end: 1_811_585, bytes: 169, sha256: "6246106c47bf7613dc924a7db24d3bac10afc350e31d9f1ddc4e24e9eb35c1e3" },
  setEditData: { start: 1_857_186, end: 1_857_789, bytes: 603, sha256: "0f0d25706407a59aa9e31b4c21723b7d66ab4e5aa605c6c13ff0c4754dd8f860" },
  onHeadChange: { start: 2_119_189, end: 2_120_251, bytes: 1062, sha256: "898da83f178027276c6ecfcaf80ec0530ff6b72b3002e73ddad731e605a8566b" },
});
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
  for (const method of [...Object.values(CURRENT_PROJECT_SAVE_STRUCTURE_METADATA_METHODS), ...Object.values(CONSTRUCTORS).filter(site => "start" in site)]) {
    const text = input.slice(method.start, method.end); if (Buffer.byteLength(text) !== method.bytes || createHash("sha256").update(text).digest("hex") !== method.sha256) { throw new Error("PROJECT_SAVE_STRUCTURE_METADATA_SOURCE"); }
  }
}
