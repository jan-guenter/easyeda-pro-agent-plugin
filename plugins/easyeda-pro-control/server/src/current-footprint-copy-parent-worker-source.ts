/** Fixed ordinary-project parent boundaries. These sites retain the Worker object;
 * only the separate native message challenge can associate it with a CDP target. */
import { createHash } from "node:crypto";
import { qualifyCurrentFootprintCopyManagerRouteSource } from "./current-footprint-copy-manager-route-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_PARENT_WORKER_SITES = freezeDeep({
  receiverClass: "tl",
  open: { start: 1_782_503, end: 1_783_700, bytes: 1197,
    sha256: "81932eb6e7ccf48f642f4222a6b20c8fb68e4bab5a84954ff62542b3568100e9" },
  dispatch: { start: 1_788_077, end: 1_788_212, bytes: 135,
    sha256: "460b2190c59442f69ec8a225d7a5f8abd955f899e21d2dd2b93cb15091ca9005" },
  registration: { start: 2_084_261, end: 2_084_292, bytes: 31,
    sha256: "bb3a0245c7ab232c4cd5fe9821f06d0e630c833cb004fa7c89b7a3802da093e0" },
  before: { offset: 1_782_753, lineNumber: 104, columnNumber: 123_154,
    contextSha256: "d6078b8b4597c86d3b19397aea1c3c332c8d4b28c5c0534e5c6ae72ee378c3d2" },
  after: { offset: 1_782_909, lineNumber: 104, columnNumber: 123_310,
    contextSha256: "7df60465fb1e16db9f0163eb427a3f369e25076696179b3f7737bf6c929a0be4" },
} as const);

const hash = (value: string): string => createHash("sha256").update(value).digest("hex");
export function qualifyCurrentFootprintCopyParentWorkerSource(source: string): void {
  qualifyCurrentFootprintCopyManagerRouteSource(source);
  // The ordinary ls.OPEN route dispatches through cO/new tl. The adjacent sl
  // Override serves ls.TEMP_OPEN and has identical text at both Worker boundaries.
  for (const span of [CURRENT_FOOTPRINT_COPY_PARENT_WORKER_SITES.open, CURRENT_FOOTPRINT_COPY_PARENT_WORKER_SITES.dispatch,
    CURRENT_FOOTPRINT_COPY_PARENT_WORKER_SITES.registration]) {
    if (Buffer.byteLength(source.slice(span.start, span.end)) !== span.bytes || hash(source.slice(span.start, span.end)) !== span.sha256) {
      throw new Error("FOOTPRINT_COPY_PARENT_WORKER_SOURCE");
    }
  }
  for (const point of [CURRENT_FOOTPRINT_COPY_PARENT_WORKER_SITES.before, CURRENT_FOOTPRINT_COPY_PARENT_WORKER_SITES.after]) {
    const prefix = source.slice(0, point.offset);
    if (prefix.split("\n").length - 1 !== point.lineNumber || point.offset - prefix.lastIndexOf("\n") - 1 !== point.columnNumber ||
      hash(source.slice(point.offset - 24, point.offset + 48)) !== point.contextSha256) { throw new Error("FOOTPRINT_COPY_PARENT_WORKER_SOURCE"); }
  }
}
