/** Exact first-party published shared source, retained as an immutable cold
 * build input. It is never a caller path, runtime script or design snapshot. */
import { createHash } from "node:crypto";

export const CURRENT_NATIVE_BASELINE = Object.freeze({
  commit: "b16fb1e64c0d4cb0b2f57d2c4f07a894bb80940d", relativePath: "scripts/native-baseline/shared-owner.ps1.txt",
  bytes: 1_099_796, sha256: "e809283e6ec24998ddc67de6180b58edb784371cbfc0be88377633dbb0181c95",
});
export function assertCurrentNativeBaseline(source: string): void {
  if (Buffer.byteLength(source) !== CURRENT_NATIVE_BASELINE.bytes || createHash("sha256").update(source).digest("hex") !== CURRENT_NATIVE_BASELINE.sha256) { throw new Error("NATIVE_BUILD_BASELINE_IDENTITY"); }
}
