import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { CurrentFootprintSourceReplyCapture } from "../src/current-footprint-source-reply-capture.ts";
import { bootstrapLifecycleFixture } from "./helpers/current-pcb-209-bootstrap-lifecycle-fixture.ts";

void test("composed startup transport retains rejected async footprint reply at its earliest strict envelope boundary", async () => {
  const raw = { result: { type: "undefined" }, exceptionDetails: { text: "Synthetic native source refusal", lineNumber: 9 } };
  const expected = JSON.stringify(raw);
  let reply: unknown = raw;
  const fixture = await bootstrapLifecycleFixture({ footprintSourceReply: (): Promise<unknown> => Promise.resolve(reply) });
  await fixture.owner.capture(); assert.equal(fixture.owner.status().firstRejectedFootprintSourceReply, null);
  await assert.rejects(fixture.readFootprintSource(), /CURRENT_FOOTPRINT_COPY_SOURCE_READ_CAPTURE/u);
  const retained = fixture.owner.status().firstRejectedFootprintSourceReply;
  assert.ok(retained?.status === "captured"); assert.equal(JSON.stringify(retained.value), expected);
  assert.equal(retained.sha256, createHash("sha256").update(expected).digest("hex"));
  raw.exceptionDetails.text = "Mutated after original rejection";
  assert.equal(JSON.stringify(fixture.owner.status().firstRejectedFootprintSourceReply?.value), expected);
  const sent = fixture.commands.filter(command => command.method === "Runtime.callFunctionOn");
  assert.equal(sent.length, 1); assert.equal(sent[0]?.params.awaitPromise, true);
  // The retained construction callback traverses the real startup transport.
  // A later valid envelope still follows the unchanged source-size allowance.
  reply = { result: { type: "string", value: "x".repeat(2_097_152) } };
  assert.deepEqual(await fixture.readFootprintSource(), reply);
  assert.equal(fixture.owner.status().firstRejectedFootprintSourceReply, retained);
  fixture.terminate(); await fixture.owner.releaseAfterTermination();
  assert.equal(fixture.owner.status().firstRejectedFootprintSourceReply, retained);
});

void test("a rejected underlying source request creates no invented raw reply diagnostic", async () => {
  const fixture = await bootstrapLifecycleFixture({ footprintSourceReply: (): Promise<unknown> => Promise.reject(new Error("Synthetic channel rejection")) });
  await fixture.owner.capture(); await assert.rejects(fixture.readFootprintSource(), /Synthetic channel rejection/u);
  assert.equal(fixture.owner.status().firstRejectedFootprintSourceReply, null);
  assert.equal(fixture.commands.filter(command => command.method === "Runtime.callFunctionOn").length, 1);
  fixture.terminate(); await fixture.owner.releaseAfterTermination();
});

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
