/** Fixed original readonly branch API return, separately admitted from history reads. */
import { createHash } from "node:crypto";
import { CURRENT_GENERATED_INITIAL_BRANCH_SOURCE as SOURCE } from "./current-generated-initial-branch-source.ts";
import { qualifyCurrentFootprintCopyMainBackendSource } from "./current-footprint-copy-main-backend-source.ts";

export const CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_SITE = Object.freeze({ name: "show", lineNumber: 8573, columnNumber: 4442, functionColumn: 4329, expression: "[this,e,r,i]", length: 4 });
export function qualifyCurrentFootprintForwardWriterBranchMainSource(source: string): void {
  qualifyCurrentFootprintCopyMainBackendSource(source);
  for (const pin of Object.values(SOURCE).filter(value => value.realm === "main")) {
    const text = source.slice(pin.start, pin.end);
    if (text !== pin.source || Buffer.byteLength(text) !== pin.bytes || createHash("sha256").update(text).digest("hex") !== pin.sha256) { throw new Error("FORWARD_WRITER_BRANCH_SOURCE"); }
  }
}
