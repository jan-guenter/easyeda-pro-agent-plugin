/** Public status reports the complete implementation inventory once. The
 * unchanged stable fingerprint remains the input for exact runtime admission. */
import type { ControlImplementationFingerprint } from "./core.ts";

interface StatusWithImplementation {
  readonly facadeImplementation: ControlImplementationFingerprint;
  readonly stableFingerprint: Readonly<{ facadeImplementation: ControlImplementationFingerprint }>;
}
export interface PublicImplementationSummary {
  readonly schema: "easyeda-pro-control.implementation-summary.v1";
  readonly version: string;
  readonly operationSchema: string;
  readonly mode: ControlImplementationFingerprint["mode"];
  readonly sha256: string;
  readonly fileCount: number;
  readonly totalBytes: number;
  readonly filesPointer: "/upstream/stableFingerprint/facadeImplementation/files";
}
export function projectPublicEngineStatus<T extends StatusWithImplementation>(status: T):
  Omit<T, "facadeImplementation"> & Readonly<{ facadeImplementation: PublicImplementationSummary }> {
  const fingerprint = status.facadeImplementation;
  // Only the duplicate original inventory may be replaced. A different
  // Observation, even with a matching aggregate hash, must remain a refusal.
  if (fingerprint !== status.stableFingerprint.facadeImplementation) {
    throw new Error("Public status implementation inventories do not share the original fingerprint.");
  }
  const totalBytes = fingerprint.files.reduce((sum, file) => sum + file.bytes, 0);
  if (!Number.isSafeInteger(totalBytes) || totalBytes < 0) { throw new Error("Public status implementation byte count is invalid."); }
  return { ...status, facadeImplementation: Object.freeze({
    schema: "easyeda-pro-control.implementation-summary.v1", version: fingerprint.version,
    operationSchema: fingerprint.operationSchema, mode: fingerprint.mode, sha256: fingerprint.sha256,
    fileCount: fingerprint.files.length, totalBytes,
    filesPointer: "/upstream/stableFingerprint/facadeImplementation/files",
  }) };
}
