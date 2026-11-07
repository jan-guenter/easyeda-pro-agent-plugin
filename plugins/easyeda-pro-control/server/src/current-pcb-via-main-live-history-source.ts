/** Actual selected-history read after the original native transaction. These
 * pins are descriptive; only the original main cursor can issue a row packet. */
import { createHash } from "node:crypto";
import { CURRENT_GENERATED_INITIAL_CACHE_SOURCE as INITIAL } from "./current-generated-initial-cache-source.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE as MAIN, qualifyCurrentFootprintCopyMainBackendSource } from "./current-footprint-copy-main-backend-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_SOURCE = freezeDeep({
  yB: INITIAL.yB, UB: INITIAL.UB, projectSql: MAIN.functions.projectSql,
  requestDatabase: { start: 2_620_196, end: 2_620_331, bytes: 135, sha256: "b28ecda08b239e9381e112842d215e15df921dc086a3d3cdffe54e25a0b5e9c7" },
  table: { start: 2_232_389, end: 2_233_170, bytes: 781, sha256: "67b813d2eae8e8aadb771fcbe936e6b957b480754284e91e3f146a50152442b6" },
});
export const CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_SITE = Object.freeze({ lineNumber: 8572, columnNumber: 24_050,
  functionColumn: 23_273, name: "yB", expression: "[t,e,r,i,s,a,y,Or,UB]", length: 9 });
export const CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_FUNCTIONS = Object.freeze({
  projectSql: { index: 4, name: "y", arity: 2, async: true, regular: false, lineNumber: 1025, columnNumber: 20_177 },
  table: { index: 5, name: "Or", arity: 3, async: true, regular: false, lineNumber: 8549, columnNumber: 6683 },
  branches: { index: 6, name: "UB", arity: 3, async: true, regular: false, lineNumber: 8572, columnNumber: 26_699 },
});
export function qualifyCurrentPcbViaMainLiveHistorySource(source: string): void {
  qualifyCurrentFootprintCopyMainBackendSource(source);
  for (const pin of Object.values(CURRENT_PCB_VIA_MAIN_LIVE_HISTORY_SOURCE)) {
    const value = source.slice(pin.start, pin.end);
    if (Buffer.byteLength(value) !== pin.bytes || createHash("sha256").update(value).digest("hex") !== pin.sha256) { throw new Error("PCB_VIA_LIVE_HISTORY_SOURCE"); }
  }
}
