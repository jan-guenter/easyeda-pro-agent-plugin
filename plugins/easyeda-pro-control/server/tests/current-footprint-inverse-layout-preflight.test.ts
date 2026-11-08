/** A closed inverse build retains only the exact shared Via static codecs;
 * diagnostic builds keep their actual saved-Via late-ID correction. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { generateWorkerStartupProtocol } from "../../scripts/generate-worker-startup-protocol.ts";
import { CURRENT_NATIVE_BASELINE } from "../../scripts/native-baseline-source.ts";
import { currentPcbDiagnosticCSharpReviewSource } from "../src/current-pcb-diagnostic-csharp-review-storage.ts";

void test("inverse-only shared codec projection preserves exact bytes and the diagnostic correction",async()=>{
 assert.equal(process.versions.node,"24.18.0");const seed=await readFile(CURRENT_NATIVE_BASELINE.relativePath,"utf8");const inverse=generateWorkerStartupProtocol(seed,"inverse");assert.equal(generateWorkerStartupProtocol(inverse,"inverse"),inverse);
 const review=currentPcbDiagnosticCSharpReviewSource(inverse);const begin="// BEGIN SAVED VIA READBACK209";const end="// END SAVED VIA READBACK209";const block=review.slice(review.indexOf(begin),review.indexOf(end)+end.length);
 assert.equal(Buffer.byteLength(block),42_056);assert.equal(createHash("sha256").update(block).digest("hex"),"74e4f9e07130f3f96d7575e75199609a2cf721d38df6bff42d3b4e2523576e3c");assert.ok(!review.includes("VerifySavedViaLatePreflightSmoke"));
 const diagnostic=currentPcbDiagnosticCSharpReviewSource(generateWorkerStartupProtocol(seed,"diagnostic"));assert.ok(diagnostic.includes("public static string SavedViaPreflightProtocolMessage("));assert.ok(diagnostic.includes("public static void VerifySavedViaLatePreflightSmoke()"));assert.equal(diagnostic.split("SendMessage(id,SavedViaPreflightProtocolMessage(").length,3);
});
