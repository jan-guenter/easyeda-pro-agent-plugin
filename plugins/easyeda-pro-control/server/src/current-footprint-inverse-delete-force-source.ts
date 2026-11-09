/** Exact empty original force service. Its fulfilled Promise is not worker
 * drain, persistence, SQL completion or a native delete result. */
import { createHash } from "node:crypto";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_DELETE_SOURCE as LEAVES, qualifyCurrentFootprintInversePublicDeleteSource } from "./current-footprint-inverse-public-delete-source.ts";
import { qualifyCurrentFootprintSourceFunctionMetadata } from "./current-footprint-source-function-metadata.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const body = LEAVES.find(row => row.key === "forceSyncNoop"); if (body === undefined) { throw new Error("INVERSE_DELETE_FORCE_SOURCE_ROSTER"); }
export const CURRENT_FOOTPRINT_INVERSE_DELETE_FORCE_SOURCE = freezeDeep({ body: { ...body, name: "", arity: 1, kind: "arrow", async: true, strict: false, parent: null, lineNumber: 108, columnNumber: 57_540 }, registrar: { start: 2_084_847, end: 2_084_990, bytes: 143, sha256: "740fbfbc9f68a5803f623a2f35cb2af98abd190e4ebdd0b201df1e032aca1cae" }, topic: "/pro-mgr/project/sync/force" } as const);
/** Require the complete fixed source fragment's byte count and digest before composing it. */
function fragment(text: string, expected: Readonly<{ bytes: number; sha256: string }>): void { if (Buffer.byteLength(text) !== expected.bytes || createHash("sha256").update(text).digest("hex") !== expected.sha256) { throw new Error("INVERSE_DELETE_FORCE_SOURCE"); } }
/** Require the pinned manager and original registrar before callable metadata. */
/** Require the complete pinned manager and exact force registrar span. */
export function qualifyCurrentFootprintInverseDeleteForceSource(source: string): void { qualifyCurrentFootprintInversePublicDeleteSource("manager", source); const row = CURRENT_FOOTPRINT_INVERSE_DELETE_FORCE_SOURCE.registrar; fragment(source.slice(row.start, row.end), row); }
/** Match the exact async body without invoking it. */
/** Accept only the original empty async body description. */
export function requireCurrentFootprintInverseDeleteForceDescription(text: string): void { fragment(text, CURRENT_FOOTPRINT_INVERSE_DELETE_FORCE_SOURCE.body); }
/** Match its original function location and return only the scope-list handle. */
/** Bind that original body to its exact function location and real scopes. */
export function qualifyCurrentFootprintInverseDeleteForceFunction(input: unknown, scriptId: string): string { return qualifyCurrentFootprintSourceFunctionMetadata(input, CURRENT_FOOTPRINT_INVERSE_DELETE_FORCE_SOURCE.body, scriptId); }
