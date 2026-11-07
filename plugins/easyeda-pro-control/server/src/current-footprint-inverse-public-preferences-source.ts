/** Exact original two-key removal. Qualification grants no execution,
 * backup/restore token, original Storage object or handler continuation. */
import { createHash } from "node:crypto";
import { qualifyCurrentFootprintInversePublicServiceSource } from "./current-footprint-inverse-public-service-source.ts";

export const CURRENT_FOOTPRINT_INVERSE_PUBLIC_PREFERENCES_SOURCE = Object.freeze({
  start: 15_963_979, end: 15_964_094, bytes: 115,
  sha256: "c274a544d216636906176a6f1f0ff30e72ca33c7a3a494e5b3228f6c99bdd871",
  name: "G9o", arity: 0, lineNumber: 1954, functionColumn: 70_393,
  entryColumn: 70_396, returnedColumn: 70_495,
  source: 'function G9o(){localStorage.removeItem("checkRatlineNotShowAgain"),localStorage.removeItem("checkDrcNotShowAgain")}',
} as const);
export function qualifyCurrentFootprintInversePublicPreferencesSource(source: string): void {
  qualifyCurrentFootprintInversePublicServiceSource("ui", source); const row = CURRENT_FOOTPRINT_INVERSE_PUBLIC_PREFERENCES_SOURCE; const selected = source.slice(row.start, row.end);
  if (selected !== row.source || Buffer.byteLength(selected) !== row.bytes || createHash("sha256").update(selected).digest("hex") !== row.sha256) { throw new Error("FOOTPRINT_INVERSE_PREFERENCES_SOURCE"); }
}
