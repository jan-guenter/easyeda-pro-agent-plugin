/** Original manager DEL registration and forwarding method only. These inert
 * source and callable metadata checks issue no Job or deletion capability. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { qualifyCurrentFootprintInversePublicDeleteSource } from "./current-footprint-inverse-public-delete-source.ts";
import { qualifyCurrentFootprintSourceFunctionMetadata } from "./current-footprint-source-function-metadata.ts";

export const CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_SOURCE = freezeDeep({
  handler: { start: 2_069_740, end: 2_069_827, descriptionStart: 2_069_740,
    name: "", arity: 2, kind: "arrow", async: true, strict: false, parent: null,
    lineNumber: 108, columnNumber: 42_386, bytes: 87,
    sha256: "0e627cb810fa19cc121f27820b3401dea511df795bc90f9971085de54bae2f00" },
  method: { start: 1_735_000, end: 1_735_173, descriptionStart: 1_735_000,
    name: "deleteData", arity: 1, kind: "method", async: true, strict: true, parent: null,
    lineNumber: 104, columnNumber: 75_417, bytes: 173,
    sha256: "8540cb59de63caa01b31678ed1296b866ff8d2b5ff911d7b0fdf2b4cf0cdb2dc" },
} as const);
export const CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_LINKS = freezeDeep({
  registration: { start: 2_069_721, end: 2_069_828, bytes: 107,
    sha256: "641e7cb0799af8c404d70761914529124fb4522cf1da78d5f19e62f96ba1341c" },
  outerTopic: { start: 689_786, end: 689_818, bytes: 32,
    sha256: "4389f5026d761247b72c34ab31a8fa1f3d4fcd6c239f46411c740db3aa941ad0" },
  innerTopic: { start: 1_709_898, end: 1_709_942, bytes: 44,
    sha256: "a894ed8006dc8a3ee14b60431ba854e9fca63c110371f90b0dd9dc16d019290f" },
} as const);
export type CurrentFootprintInverseDeleteManagerRole = keyof typeof CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_SOURCE;
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_INVERSE_DELETE_MANAGER_SOURCE"); } }
function fragment(text: string, row: Readonly<{ bytes: number; sha256: string }>): void {
  need(Buffer.byteLength(text) === row.bytes && createHash("sha256").update(text).digest("hex") === row.sha256);
}
export function qualifyCurrentFootprintInverseDeleteManagerSource(source: string): void {
  qualifyCurrentFootprintInversePublicDeleteSource("manager", source);
  for (const row of Object.values(CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_SOURCE)) { fragment(source.slice(row.descriptionStart, row.end), row); }
  for (const row of Object.values(CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_LINKS)) { fragment(source.slice(row.start, row.end), row); }
}
export function requireCurrentFootprintInverseDeleteManagerDescription(text: string, role: CurrentFootprintInverseDeleteManagerRole): void {
  fragment(text, CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_SOURCE[role]);
}
export function qualifyCurrentFootprintInverseDeleteManagerFunction(input: unknown, role: CurrentFootprintInverseDeleteManagerRole, scriptId: string): string {
  return qualifyCurrentFootprintSourceFunctionMetadata(input, CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_SOURCE[role], scriptId);
}
