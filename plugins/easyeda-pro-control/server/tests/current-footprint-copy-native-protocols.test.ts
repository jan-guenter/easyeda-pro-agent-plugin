/* oxlint-disable import/max-dependencies -- Native parity checks join the two fixed encoders, original TypeScript grammars, distinct source literals and bounded decompression. */
/** Synthetic fixed encoders. Packed data and exact schemas are checked here;
 * platform compilation and connected cache ownership remain separate evidence. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { test } from "node:test";
import { currentFootprintCacheConstructionNativeCases, currentFootprintCacheConstructionNativeSource } from "../src/current-footprint-copy-cache-construction-native.ts";
import { currentFootprintCacheConstructionWire } from "../src/current-footprint-copy-cache-construction-wire.ts";
import { currentFootprintCopySavedNativeSource } from "../src/current-footprint-copy-saved-native.ts";
import { CURRENT_FOOTPRINT_COPY_SAVED_QUEUE_FUNCTION } from "../src/current-footprint-copy-saved-queue.ts";
import { CURRENT_FOOTPRINT_COPY_V2_SAVED_CACHE_READ_FUNCTION } from "../src/current-footprint-copy-v2-saved-cache-read.ts";
import { currentFootprintCopySourceNativeParameters } from "../src/current-footprint-copy-source-native.ts";
import { currentFootprintCopySavedStartupWire } from "../src/current-pcb-worker-startup-wire.ts";

void test("cache construction native table retains every exact case and never carries a caller session", () => {
  const source = currentFootprintCacheConstructionNativeSource();
  const encoded = /FromBase64String\(@"([A-Za-z\d+/=]+)"\)/u.exec(source)?.[1]; assert.ok(encoded !== undefined);
  // oxlint-disable-next-line node/no-sync -- Decode one bounded in-memory constant table for exact encoder parity.
  const bytes = gunzipSync(Buffer.from(encoded, "base64")), rows = bytes.toString("utf8").split("\0");
  assert.equal(rows.length, 14); assert.ok(bytes.length <= 65_536);
  assert.ok(source.includes(createHash("sha256").update(bytes).digest("hex")));
  for (const [index, sample] of currentFootprintCacheConstructionNativeCases().entries()) {
    const row = rows[index]?.split("\t"), wire = currentFootprintCacheConstructionWire(sample, 1); assert.ok(row !== undefined);
    const { id: _id, phase: _phase, ...command } = wire.command;
    const expected = JSON.stringify(command).replaceAll(JSON.stringify("a".repeat(64)), JSON.stringify("__cacheconstruction_projectUuid__"));
    assert.equal(row[0], wire.request["cachePhase"]); assert.equal(row[1], command.method); assert.equal(row[3], expected);
    assert.equal(Object.hasOwn(wire.request, "sessionId"), false);
    assert.throws(() => currentFootprintCopySavedStartupWire(sample, 1));
    assert.throws(() => currentFootprintCacheConstructionWire({ ...sample, extra: true }, 1));
    if (sample.method === "Runtime.callFunctionOn") {
      assert.throws(() => currentFootprintCacheConstructionWire({ ...sample, params: { ...sample.params, functionDeclaration: "function(){return true;}" } }, 1));
      assert.throws(() => currentFootprintCacheConstructionWire({ ...sample, params: { ...sample.params, arguments: [] } }, 1));
    }
  }
  assert.ok(source.includes("stream.ReadByte()==-1")); assert.ok(source.includes('Field("sessionId",originalWorkerSession)'));
  assert.ok(source.includes("public static void VerifySmoke()"));
});
void test("saved native encoder pins distinct V2 source and queue programs with strict original-session and field bounds", () => {
  const source = currentFootprintCopySavedNativeSource();
  const matches = [...source.matchAll(/static readonly string (FootprintSourceFunctionJson|QueueFunctionJson)=Load\(@"([A-Za-z\d+/=]+)",(\d+),@"([a-f\d]{64})"\);/gu)];
  assert.equal(matches.length, 2);
  for (const match of matches) {
    const [, name, encoded, length, hash] = match; assert.ok(encoded !== undefined);
    // oxlint-disable-next-line node/no-sync -- The two strict UTF-8 JSON-string constants are inspected in memory only.
    const bytes = gunzipSync(Buffer.from(encoded, "base64"));
    assert.equal(bytes.length, Number(length)); assert.equal(createHash("sha256").update(bytes).digest("hex"), hash);
    assert.equal(JSON.parse(bytes.toString("utf8")), name === "QueueFunctionJson" ? CURRENT_FOOTPRINT_COPY_SAVED_QUEUE_FUNCTION : CURRENT_FOOTPRINT_COPY_V2_SAVED_CACHE_READ_FUNCTION);
  }
  assert.ok(source.includes(`string parameters=${currentFootprintCopySourceNativeParameters()};`));
  assert.ok(source.includes('Handle(originalWorkerSession,128)')); assert.ok(source.includes('Handle(originalParentSession,128)'));
  assert.ok(source.includes('new string[]{"uniqueContextId","projectUuid","branchUuid"}'));
  assert.ok(source.includes('FootprintAtom(fields,"projectUuid","[a-f0-9]{64}")')); assert.ok(source.includes("id<=353"));
  assert.ok(source.includes("<=32768")); assert.ok(source.includes("<=16384"));
  assert.ok(source.includes("public static void VerifySmoke()"));
});
