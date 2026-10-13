// Test-only interception of one immutable repository metadata read. All other fs methods are original.
import fs from "node:fs";
import { fileURLToPath } from "node:url";

export * from "node:fs";
export const manifestPath = fileURLToPath(new URL("../../../reviewed-compatibility.json", import.meta.url));
export const manifestState: { bytes: Buffer | null; reads: number; beforeRead: (() => void) | undefined } = { bytes: null, reads: 0, beforeRead: undefined };
export function readFileSync(path: unknown, options?: unknown): string | Buffer {
  if (path === manifestPath) {
    manifestState.reads += 1; manifestState.beforeRead?.();
    if (manifestState.bytes === null || options !== undefined) { throw new Error("Synthetic manifest not installed or unexpected read mode."); }
    return Buffer.from(manifestState.bytes);
  }
  // Delegate the actual builtin's overload at the test boundary, without altering production source.
  const result: unknown = Reflect.apply(fs.readFileSync, fs, options === undefined ? [path] : [path, options]);
  if (typeof result !== "string" && !Buffer.isBuffer(result)) { throw new TypeError("Unexpected builtin fs result."); }
  return result;
}
