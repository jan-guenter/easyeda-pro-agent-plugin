/** Exact, inert source sites for the future combined footprint request owner.
 * Qualification grants neither a paused frame nor application execution. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { qualifyCurrentFootprintCopyMainBackendSource, requireCurrentFootprintCopyMainBackendSource } from "./current-footprint-copy-main-backend-source.ts";

export const CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_SOURCE = freezeDeep({
  driverCallback: { start: 1_375_968, end: 1_376_289, bytes: 321,
    sha256: "a3b4db4adc53d6d94632b1148fababfc314eba0095377211a06d79d8c6134974" },
  createProjectHistory: { start: 2_604_075, end: 2_604_380, bytes: 305,
    sha256: "1ea2889c63bbb9a84b6b9eb9845ce977c4e1ecc3e9ef1c50e52f215d1d018ef0" },
  actorClock: { start: 2_602_467, end: 2_602_820, bytes: 353,
    sha256: "4f35768c1e8fd199dcbd67f44b3bb841215080e9f80e384b1712e01995bd7d2d" },
  editHead: { start: 2_602_357, end: 2_602_467, bytes: 110,
    sha256: "f88eeb5a380c3e50c0566db1eeadc4d41b8ccc8e443d9a590284bd77e778f12b" },
  projectSql: { start: 1_318_983, end: 1_319_062, bytes: 79,
    sha256: "26351dd282391b70094abe75b253acf2dd0a37d6b8197fbb027dce1f6d2c0a98" },
  sqlQueryOne: { start: 1_301_585, end: 1_301_710, bytes: 125,
    sha256: "325085748d09c602f92ed54a5cbef9496780bb6a3ce1a0dcf130042841ff95d2" },
} as const);
export type CurrentFootprintCopyMainRequestSourceRole = keyof typeof CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_SOURCE;
export interface CurrentFootprintCopyMainRequestSource {
  readonly profile: "private.current-footprint-copy-main-request-source.v1";
  readonly runtimeBound: false;
  readonly executionAuthorized: false;
}
const originals = new WeakMap<CurrentFootprintCopyMainRequestSource, ReturnType<typeof qualifyCurrentFootprintCopyMainBackendSource>>();
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_MAIN_REQUEST_SOURCE"); } }
export function assertCurrentFootprintCopyMainRequestFunction(role: CurrentFootprintCopyMainRequestSourceRole, text: unknown): void {
  need(Object.hasOwn(CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_SOURCE, role)); const expected = CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_SOURCE[role];
  need(typeof text === "string" && text.isWellFormed() && Buffer.byteLength(text) === expected.bytes &&
    createHash("sha256").update(text).digest("hex") === expected.sha256);
}
export function qualifyCurrentFootprintCopyMainRequestSource(input: unknown): CurrentFootprintCopyMainRequestSource {
  const backend = qualifyCurrentFootprintCopyMainBackendSource(input); need(typeof input === "string");
  for (const role of ["driverCallback", "createProjectHistory", "actorClock", "editHead", "projectSql", "sqlQueryOne"] as const) {
    const site = CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_SOURCE[role]; assertCurrentFootprintCopyMainRequestFunction(role, input.slice(site.start, site.end));
  }
  const token = Object.freeze({ profile: "private.current-footprint-copy-main-request-source.v1" as const, runtimeBound: false as const, executionAuthorized: false as const });
  originals.set(token, backend); return token;
}
export function requireCurrentFootprintCopyMainRequestSource(token: CurrentFootprintCopyMainRequestSource): void {
  const backend = originals.get(token); need(backend !== undefined); requireCurrentFootprintCopyMainBackendSource(backend);
}
