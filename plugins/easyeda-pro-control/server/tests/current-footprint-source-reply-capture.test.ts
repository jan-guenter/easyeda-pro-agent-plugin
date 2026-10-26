import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { CurrentFootprintSourceReplyCapture } from "../src/current-footprint-source-reply-capture.ts";

void test("first rejected source reply survives strict capture failure without becoming source evidence", () => {
  const capture = new CurrentFootprintSourceReplyCapture(), original = { result: { type: "undefined" }, exceptionDetails: { text: "Synthetic native refusal", lineNumber: 7 } };
  const encoded = JSON.stringify(original);
  assert.throws(() => capture.capture(original), /CURRENT_FOOTPRINT_COPY_SOURCE_READ_CAPTURE/u);
  const retained = capture.firstRejected(); assert.ok(retained?.status === "captured");
  assert.deepEqual(retained.value, original); assert.equal(retained.bytes, Buffer.byteLength(encoded));
  assert.equal(retained.sha256, createHash("sha256").update(encoded).digest("hex"));
  original.exceptionDetails.text = "Changed after capture";
  assert.equal(JSON.stringify(retained.value), encoded); assert.ok(Object.isFrozen(retained.value));
  assert.throws(() => capture.capture({ different: "Second refusal" }), /CURRENT_FOOTPRINT_COPY_SOURCE_READ_CAPTURE/u);
  assert.equal(capture.firstRejected(), retained);
  assert.deepEqual(capture.capture({ result: { type: "string", value: "Not parsed or admitted by capture" } }),
    { result: { type: "string", value: "Not parsed or admitted by capture" } });
  assert.equal(capture.firstRejected(), retained);
});

void test("raw rejected source diagnostics never invoke proxy traps or accessors and do not retain truncated values", () => {
  let invoked = 0;
  const accessor = Object.defineProperty({}, "result", { enumerable: true, get: () => { invoked += 1; return {}; } });
  const proxy = new Proxy({}, { ownKeys: (): string[] => { invoked += 1; return []; }, getPrototypeOf: (): null => { invoked += 1; return null; } });
  for (const input of [accessor, proxy]) {
    const capture = new CurrentFootprintSourceReplyCapture(); assert.throws(() => capture.capture(input), /CAPTURE/u);
    assert.deepEqual(capture.firstRejected(), { status: "malformed", value: null, sha256: null, bytes: null });
  }
  assert.equal(invoked, 0);
  const oversized = new CurrentFootprintSourceReplyCapture();
  assert.throws(() => oversized.capture({ exceptionDetails: { text: "x".repeat(32_769) } }), /CAPTURE/u);
  assert.deepEqual(oversized.firstRejected(), { status: "oversized", value: null, sha256: null, bytes: null });
  const valid = new CurrentFootprintSourceReplyCapture(), value = "x".repeat(2_097_152);
  assert.equal(valid.capture({ result: { type: "string", value } }).result.value, value); assert.equal(valid.firstRejected(), null);
});
