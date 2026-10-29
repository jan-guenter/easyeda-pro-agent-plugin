import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { z } from "zod";
import { canonicalJson, sha256Text } from "../src/core.ts";
import { publicCurrentFootprintRouteSummary } from "../src/current-footprint-route-summary.ts";
import { assertCurrentFootprintCopyExecutionWorkerNativeFields, currentFootprintCopyExecutionWorkerNativeCases } from "../src/current-footprint-copy-execution-worker-native.ts";
import { currentFootprintCopyExecutionWorkerWire } from "../src/current-footprint-copy-execution-worker-wire.ts";
import { currentPcbDiagnosticNativeRefusal, issueCurrentPcbDiagnosticNativeRefusal } from "../src/current-pcb-diagnostic-native-refusal.ts";

void test("route inspect hashes complete large originals and every raw reply without expanding public envelopes", () => {
  const replies = Array.from({ length: 500 }, (_, index) => ({ result: { result: [{ name: `method${index}`, value: { type: "string", description: "private vendor method ".repeat(80) } }] } }));
  const original = Object.freeze({ destinations: { attempted: true, completed: false, requests: 40, replies },
    dependencies: { attempted: true, completed: true, observation: { failed: false, replies: replies.slice(0, 80) } }, executionAuthorized: false });
  const before = canonicalJson(original); assert.ok(Buffer.byteLength(before) > 512 * 1024);
  const summary = publicCurrentFootprintRouteSummary(original); assert.ok(summary !== null);
  assert.equal(summary["sha256"], sha256Text(before)); assert.equal(summary["jsonBytes"], Buffer.byteLength(before));
  assert.equal(summary["fullObservationRetainedInOriginalOwner"], true); assert.equal(summary["fullObservationPersisted"], false);
  assert.equal(summary["originalOwnerAuthority"], false); assert.equal(summary["rawRepliesInline"], false);
  const otherInspectionFields = "x".repeat(300_000);
  const inspection = canonicalJson({ retainedEvidence: summary, otherInspectionFields });
  assert.ok(Buffer.byteLength(inspection) < 512 * 1024);
  const digests = z.array(z.object({ sha256: z.string(), jsonBytes: z.number() })).parse(summary["replyDigests"]);
  const groupSchema = z.object({ path: z.string(), indexes: z.array(z.number()) });
  const groups = z.array(groupSchema).parse(summary["replyGroups"]);
  assert.equal(digests.length, 500); assert.equal(groups[0]?.indexes.length, 500); assert.equal(groups[1]?.indexes.length, 80);
  for (const [index, reply] of replies.entries()) { const encoded = canonicalJson(reply); assert.deepEqual(digests[index], { sha256: sha256Text(encoded), jsonBytes: Buffer.byteLength(encoded) }); }
  assert.equal(canonicalJson(original), before); assert.equal(Object.isFrozen(summary), true);
  assert.equal(canonicalJson(summary).includes("private vendor method"), false);
});

void test("route summary rejects getters proxies unsupported shapes and oversized input without executing hooks", () => {
  let invoked = false;
  const getter = Object.defineProperty({}, "replies", { get(): unknown[] { invoked = true; return []; }, enumerable: true });
  const proxy = new Proxy({}, { ownKeys(): (string | symbol)[] { invoked = true; return []; } });
  const cycle: Record<string, unknown> = {}; cycle["self"] = cycle;
  for (const invalid of [getter, proxy, cycle, { value: Number.NaN }, { toJSON(): object { invoked = true; return {}; } }]) { assert.throws(() => publicCurrentFootprintRouteSummary(invalid)); }
  assert.equal(invoked, false); assert.equal(publicCurrentFootprintRouteSummary(null), null);
});

void test("native worker envelope derives all seven capture and eight recheck argument fields", async () => {
  const helper = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  assert.doesNotThrow(() => { assertCurrentFootprintCopyExecutionWorkerNativeFields(helper); });
  for (const mutation of [helper.replaceAll("'arg7ObjectId'", "'arg8ObjectId'"), helper.replaceAll("'arg7ObjectId'", "'arg6ObjectId'")]) {
    assert.throws(() => { assertCurrentFootprintCopyExecutionWorkerNativeFields(mutation); }, /FIELD_BOUNDARY/u);
  }
  const cases = currentFootprintCopyExecutionWorkerNativeCases().map(sample => currentFootprintCopyExecutionWorkerWire(sample, 1));
  const capture = cases.find(value => value?.request["executionPhase"] === "destination-capture");
  const recheck = cases.find(value => value?.request["executionPhase"] === "destination-recheck");
  assert.equal(capture?.command.method, "Runtime.callFunctionOn"); assert.equal(recheck?.command.method, "Runtime.callFunctionOn");
  assert.equal(capture?.request["arg6ObjectId"], "__copyworker_arg6ObjectId__");
  assert.equal(recheck?.request["arg7ObjectId"], "__copyworker_arg7ObjectId__");
});

void test("native refusal provenance preserves only original bounded helper labels", () => {
  const error = issueCurrentPcbDiagnosticNativeRefusal("pcb-diagnostic-footprint-copy-worker-field");
  assert.deepEqual(currentPcbDiagnosticNativeRefusal(error), { nativeCode: "pcb-diagnostic-footprint-copy-worker-field" });
  for (const forged of [new Error(error.message), { nativeCode: "pcb-diagnostic-footprint-copy-worker-field" }, new Proxy({}, { get(): never { assert.fail("Do not inspect thrown values"); } }), "private error text"]) {
    assert.equal(currentPcbDiagnosticNativeRefusal(forged), null);
  }
  assert.throws(() => issueCurrentPcbDiagnosticNativeRefusal("private/path or data"));
});
