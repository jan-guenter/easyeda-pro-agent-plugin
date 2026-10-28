/** Fixed local-project parent boundaries. These sites retain the Worker object;
 * only the separate native message challenge can associate it with a CDP target. */
import { createHash } from "node:crypto";
import { qualifyCurrentFootprintCopyManagerRouteSource } from "./current-footprint-copy-manager-route-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_COPY_PARENT_WORKER_SITES = freezeDeep({
  open: { start: 1_785_299, end: 1_786_132, bytes: 833,
    sha256: "fa5b1f865b7f2369505dd39a0799ae7ec1d82c9d854b9a2713117e2c9638bcbd" },
  before: { offset: 1_785_519, lineNumber: 104, columnNumber: 125_920,
    contextSha256: "d6078b8b4597c86d3b19397aea1c3c332c8d4b28c5c0534e5c6ae72ee378c3d2" },
  after: { offset: 1_785_675, lineNumber: 104, columnNumber: 126_076,
    contextSha256: "7df60465fb1e16db9f0163eb427a3f369e25076696179b3f7737bf6c929a0be4" },
} as const);

const hash = (value: string): string => createHash("sha256").update(value).digest("hex");
export function qualifyCurrentFootprintCopyParentWorkerSource(source: string): void {
  qualifyCurrentFootprintCopyManagerRouteSource(source);
  const span = CURRENT_FOOTPRINT_COPY_PARENT_WORKER_SITES.open;
  if (Buffer.byteLength(source.slice(span.start, span.end)) !== span.bytes || hash(source.slice(span.start, span.end)) !== span.sha256) {
    throw new Error("FOOTPRINT_COPY_PARENT_WORKER_SOURCE");
  }
  for (const point of [CURRENT_FOOTPRINT_COPY_PARENT_WORKER_SITES.before, CURRENT_FOOTPRINT_COPY_PARENT_WORKER_SITES.after]) {
    const prefix = source.slice(0, point.offset);
    if (prefix.split("\n").length - 1 !== point.lineNumber || point.offset - prefix.lastIndexOf("\n") - 1 !== point.columnNumber ||
      hash(source.slice(point.offset - 24, point.offset + 48)) !== point.contextSha256) { throw new Error("FOOTPRINT_COPY_PARENT_WORKER_SOURCE"); }
  }
}
