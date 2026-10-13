import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

export const MAIN_REFERENCE_PLUGIN_URL = new URL("../../../", import.meta.url);
const ASSET_PINS = Object.freeze({
  "owner-command.ps1": "f417642a0dffa2f80df33b6aafd5865aa944acb635b3a4b4814814dcdcfabbd5",
  "stdin-decoder.ps1": "c16caba4dc933f299f25b3bc9acede20e590f8bad3cfdb66799aefb978631e90",
  "OwnedSyntheticJob.cs": "e426dbcb9dd1ad646d63ad88b665381c08ee940c7c3159df19d71a2e24eaa727",
  "EasyedaClockObservation.cs": "97449e83f75b1c724717708c5a630669577f60cf7af142db66022cc73b4e656c",
});
const MODULE_NAMES = ["closed-symbol-main-reference-transport", "closed-symbol-recorded-main-reference-metadata",
  "closed-symbol-main-reference-program", "closed-symbol-main-reference-runtime"] as const;
export async function snapshotMainReferenceSources(): Promise<Readonly<Record<string, string>>> {
  const snapshot: Record<string, string> = {};
  for (const [name, digest] of Object.entries(ASSET_PINS)) {
    const path = `scripts/main-reference/${name}`;
    snapshot[path] = createHash("sha256").update(await readFile(new URL(path, MAIN_REFERENCE_PLUGIN_URL))).digest("hex");
    assert.equal(snapshot[path], digest);
  }
  for (const name of MODULE_NAMES) {
    const path = `server/src/${name}.ts`;
    snapshot[path] = createHash("sha256").update(await readFile(new URL(path, MAIN_REFERENCE_PLUGIN_URL))).digest("hex");
  }
  return Object.freeze(snapshot);
}
export const MAIN_REFERENCE_FIFO_REQUEST = Object.freeze({ profile: "private.exact-literal-main-reference.v1", nonce: "a".repeat(64),
  operationId: "easyeda-20261012t000000z-12345678", closedPlanSha256: "b".repeat(64), baselineCopyReceiptSha256: "c".repeat(64),
  baselineLogicalSha256: "d".repeat(64), baselineClosureClockSha256: "e".repeat(64), nativePinsSha256: "f".repeat(64),
  historyUuid: "1".repeat(32), createdAtLiteral: "2026-01-15 12:34:56", referenceUtcMs: Date.parse("2026-10-13T12:00:00Z") });
// Opaque fixture fields are compiler input only. No witness or native-profile
// Qualification is requested or claimed by these compilation tests.
export async function selectMainReferenceFifoCompiler(kind: "live" | "recorded"): Promise<(input: unknown) => Promise<unknown>> {
  if (kind === "live") { const module = await import("../../src/closed-symbol-main-reference-transport.ts"); return module.compileMainReferenceTransport; }
  const module = await import("../../src/closed-symbol-recorded-main-reference-metadata.ts"); return module.compileRecordedMainReferenceMetadata;
}
