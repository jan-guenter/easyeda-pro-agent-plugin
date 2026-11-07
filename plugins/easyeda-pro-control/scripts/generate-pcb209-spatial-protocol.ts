import { applyPcb209SpatialNativeSource } from "./pcb209-spatial-native-source.ts";
import { readFile, writeFile } from "node:fs/promises";
import { expandCurrentPcbDiagnosticCSharpReviewSource, retainCurrentPcbDiagnosticCSharpReviewStorage } from "../server/src/current-pcb-diagnostic-csharp-review-storage.ts";
import { CURRENT_PCB_DIAGNOSTIC_HELPER_SOURCE_MAX_BYTES as MAXIMUM } from "../server/src/current-pcb-diagnostic-helper-source-profile.ts";

const action = process.argv[2];
if (process.argv.length !== 3 || action !== "--write" && action !== "--check") { throw new Error("Expected --write or --check"); }
const path = new URL("pcb-diagnostic-owner.ps1", import.meta.url);
// oxlint-disable-next-line node/no-top-level-await -- This bounded generator is an explicit ESM command, never a runtime import.
const stored = await readFile(path, "utf8");
const source = expandCurrentPcbDiagnosticCSharpReviewSource(stored);
const next = retainCurrentPcbDiagnosticCSharpReviewStorage(applyPcb209SpatialNativeSource(source), stored);
if (Buffer.byteLength(next) > MAXIMUM) { throw new Error("Spatial fixed helper source exceeds its fixed ceiling"); }
// oxlint-disable-next-line node/no-top-level-await -- Explicit generation writes only the reviewed bounded marker region.
if (action === "--write") { await writeFile(path, next); }
else if (next !== stored) { throw new Error("Generated spatial native protocol differs"); }
