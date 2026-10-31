/** Complete current209 source qualification for the distinct structure route.
 * Offsets are zero-based UTF-16. No vendor source is distributed here. Static
 * source identity never issues a process owner or completion permission. */
import { createHash } from "node:crypto";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_PCB_209_WORKER_STARTUP_SOURCE } from "./current-pcb-209-worker-startup-profile.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE } from "./current-footprint-copy-main-backend-source.ts";

export const CURRENT_PROJECT_STRUCTURE_COMPLETION_SOURCES = freezeDeep({
  worker: CURRENT_PCB_209_WORKER_STARTUP_SOURCE,
  main: { relativePath: "app.js", bytes: CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE.bytes, sha256: CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE.sha256 },
});
export const CURRENT_PROJECT_STRUCTURE_COMPLETION_SPANS = freezeDeep({
  worker: {
    route: { start: 1_442_705, end: 1_442_784, bytes: 79, sha256: "106f36e1bb8398685546a5be360745c822e350801a1a9ab3e0bca72513005cee" },
    serial: { start: 1_847_057, end: 1_847_248, bytes: 191, sha256: "99fca9f1568807ff06f32f3fba55b490def72b5b07d9325974dc153db217909e" },
    debounce: { start: 2_011_158, end: 2_011_378, bytes: 220, sha256: "e44cd89d5dd9cc4c851c01a55247782eacd16b97d057add3b1cd472ad31a97db" },
    uploadStructure: { start: 2_104_048, end: 2_104_241, bytes: 193, sha256: "f78a4c3123cfbf7d2be2c7404abcb1519fecbea1fd9f6fed49107cbac4f77f70" },
    structure: { start: 2_104_264, end: 2_105_081, bytes: 817, sha256: "4e8dbb31948cc256f30a05c8f23764299c451f63981f176475d722442705f9c7" },
    setProfile: { start: 1_770_359, end: 1_770_613, bytes: 254, sha256: "71eaf868fe2d7b3293417e313b03362c083e7969e1be576aae278232d9511c44" },
  },
  main: {
    branchRoute: { start: 2_617_258, end: 2_617_563, bytes: 305, sha256: "8f22b80e7004d6ddc906638fae9da5586e791c6a05f4ef3f5eeb5cbfd3878e03" },
    postRoute: { start: 2_617_707, end: 2_617_771, bytes: 64, sha256: "cb76dc4e9784d631fac9c6f691423d5ecce60ed6070b5721332cdeab06fd4927" },
    service: { start: 2_607_932, end: 2_608_036, bytes: 104, sha256: "7677a32225131bd4dd55cd763ca3234254a2477e44581dbb5ab53273be2b0a90" },
    select: { start: 2_608_087, end: 2_608_255, bytes: 168, sha256: "1520a9efcdce160353a8dd816a4ed66dfb80aabe6a0178d5d1ddcb7385ec9fa8" },
    insert: { start: 2_608_255, end: 2_608_471, bytes: 216, sha256: "72e0331f3b476d558dc7a33b272918a90b9bb8627b2447f510528fafb840c52c" },
    update: { start: 2_608_471, end: 2_608_772, bytes: 301, sha256: "b6f2dcfe9f862d209ad560731d212e8a9c1d17cb4491ec00f9f2bae14c7496f0" },
    controller: { start: 2_609_218, end: 2_609_617, bytes: 399, sha256: "3f8d621cfe5b696f0c5d46e54172e33c9d507f2955255f9d00892155d1ad2843" },
  },
});
export interface CurrentProjectStructureCompletionSource {
  readonly profile: "private.current-project-structure-completion-source.v1";
  readonly originalRuntimeVerified: false;
  readonly executionAuthorized: false;
}
const issued = new WeakSet<CurrentProjectStructureCompletionSource>();
function hash(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function qualify(input: unknown, realm: keyof typeof CURRENT_PROJECT_STRUCTURE_COMPLETION_SOURCES): void {
  const source = CURRENT_PROJECT_STRUCTURE_COMPLETION_SOURCES[realm];
  if (typeof input !== "string" || !input.isWellFormed() || input.length > source.bytes || Buffer.byteLength(input) !== source.bytes || hash(input) !== source.sha256) {
    throw new Error("PROJECT_STRUCTURE_COMPLETION_SOURCE");
  }
  for (const span of Object.values(CURRENT_PROJECT_STRUCTURE_COMPLETION_SPANS[realm])) {
    const text = input.slice(span.start, span.end);
    if (Buffer.byteLength(text) !== span.bytes || hash(text) !== span.sha256) { throw new Error("PROJECT_STRUCTURE_COMPLETION_SPAN"); }
  }
}
export function qualifyCurrentProjectStructureCompletionSource(worker: unknown, main: unknown): CurrentProjectStructureCompletionSource {
  qualify(worker, "worker"); qualify(main, "main");
  const token = Object.freeze({ profile: "private.current-project-structure-completion-source.v1" as const,
    originalRuntimeVerified: false as const, executionAuthorized: false as const });
  issued.add(token); return token;
}
export function requireCurrentProjectStructureCompletionSource(input: CurrentProjectStructureCompletionSource): void {
  if (!issued.has(input)) { throw new Error("PROJECT_STRUCTURE_COMPLETION_ORIGINAL_SOURCE"); }
}
