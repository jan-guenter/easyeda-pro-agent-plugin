/** Fixed source-only command selection; no native app or process is used. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_CACHE_SOURCE_READ_FUNCTION } from "../src/current-footprint-cache-source-read.ts";
import { CURRENT_FOOTPRINT_COPY_CACHE_SOURCE_READ_FUNCTION } from "../src/current-footprint-copy-cache-source-read.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_READ_FUNCTION } from "../src/current-footprint-copy-source-read.ts";
import { currentFootprintCopySourceCommandParamsSchema } from "../src/current-footprint-copy-source-command.ts";
import { currentFootprintCopySourceNativeSample } from "../src/current-footprint-copy-source-native.ts";
import { currentPcb209WorkerStartupWire } from "../src/current-pcb-worker-startup-wire.ts";

void test("source command admits only the fixed source-only cache reader with unchanged data arguments", () => {
  const sample = currentFootprintCopySourceNativeSample();
  assert.equal(sample.params.functionDeclaration, CURRENT_FOOTPRINT_CACHE_SOURCE_READ_FUNCTION);
  assert.equal(sample.params.arguments.length, 6);
  assert.equal(sample.params.awaitPromise, true); assert.equal(sample.params.throwOnSideEffect, false);
  const wire = currentPcb209WorkerStartupWire({ ...sample, sessionId: "original-session" }, 100);
  assert.equal(wire.request["startupPhase"], "footprint-source-read");
  assert.equal(Object.hasOwn(wire.request, "functionDeclaration"), false);
  for (const functionDeclaration of [CURRENT_FOOTPRINT_COPY_CACHE_SOURCE_READ_FUNCTION, CURRENT_FOOTPRINT_COPY_SOURCE_READ_FUNCTION,
    `${CURRENT_FOOTPRINT_CACHE_SOURCE_READ_FUNCTION} `, "async function(){return 'caller-code';}"]) {
    assert.equal(currentFootprintCopySourceCommandParamsSchema.safeParse({ ...sample.params, functionDeclaration }).success, false);
  }
});
