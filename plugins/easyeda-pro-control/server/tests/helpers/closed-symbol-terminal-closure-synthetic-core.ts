/** Test-only fixed-path substitution. No production issuer or runtime verifier replaced. */
// Only the closure plan's unchanged core dependencies belong in this fixed shim.
export { canonicalJson, isRecord, sha256Json, sha256Text } from "../../src/core.ts";
let manifestPath: string | undefined;
export function setSyntheticManifestPath(value: string): void { manifestPath = value; }
export function reviewedCompatibilityManifestPath(): string {
  if (manifestPath === undefined) { throw new Error("Synthetic manifest not prepared."); }
  return manifestPath;
}
