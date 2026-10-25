import assert from "node:assert/strict";
import { test } from "node:test";
import { captureCurrentPcb209RatlineOriginEvidence, currentPcb209RatlineObservedExternalId, inspectCurrentPcb209RatlineOriginEvidence } from "../src/current-pcb-209-ratline-origin-observation.ts";
import type { CurrentPcb209RatlineOriginEvidence } from "../src/current-pcb-209-ratline-origin-observation.ts";

function constructorPause(columnNumber: number): object {
  const functionLocation = { scriptId: "pcb-script", lineNumber: 4401, columnNumber: 167_735 };
  return { reason: "other", hitBreakpoints: ["original-breakpoint"], callFrames: [{ callFrameId: "frame", functionName: "addWorker",
    functionLocation, location: { ...functionLocation, columnNumber }, url: "", this: { type: "object", objectId: "manager" },
    scopeChain: [{ type: "local", object: { type: "object", objectId: "local" }, startLocation: { ...functionLocation },
      endLocation: { ...functionLocation, columnNumber: 167_972 } }, { type: "global", object: { type: "object", objectId: "global" } }] }] };
}
function fixture(): CurrentPcb209RatlineOriginEvidence {
  return captureCurrentPcb209RatlineOriginEvidence({ metadata: { parentDebuggerId: "parent-debugger", childDebuggerId: "child-debugger",
    childUniqueContextId: "child-context", childScriptId: "bootstrap", childUrl: "https://client/editor?entry=pcb-ratline-worker.js",
    parentSessionId: "parent-session", parentScriptId: "pcb-script" },
  firstPause: { reason: "instrumentation", hitBreakpoints: [], asyncStackTraceId: { id: "51", debuggerId: "parent-debugger" },
    callFrames: [{ callFrameId: "child-frame", functionName: "", location: { scriptId: "bootstrap", lineNumber: 0, columnNumber: 0 }, url: "",
      this: { type: "object", objectId: "child-global" }, scopeChain: [{ type: "global", object: { type: "object", objectId: "child-scope" } }] }] },
  constructorBefore: constructorPause(167_801), constructorAfter: constructorPause(167_829),
  stackReply: { stackTrace: { description: "Worker Created", callFrames: [{ functionName: "addWorker", scriptId: "pcb-script",
    url: "https://modules.lceda.cn/pro-pcb/3.2.195.6b67774e/js/pcb.js", lineNumber: 4401, columnNumber: 167_801 }] } } });
}
function changed(input: CurrentPcb209RatlineOriginEvidence, key: "firstPause" | "stackReply" | "constructorBefore", update: (row: Record<string, unknown>) => void): CurrentPcb209RatlineOriginEvidence {
  // This test mutates a fresh JSON copy; native owners never deserialize authority.
  const data: unknown = structuredClone(input[key]); assert.ok(data !== null && typeof data === "object" && !Array.isArray(data));
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The checked JSON object is test data, not an owner or executable command.
  update(data as Record<string, unknown>); return captureCurrentPcb209RatlineOriginEvidence({ ...input, [key]: data });
}
void test("synthetic complete origin comparison matches only its exact constructor and preserves full identity refusals", () => {
  const evidence = fixture(), summary = inspectCurrentPcb209RatlineOriginEvidence(evidence);
  assert.equal(summary.reason, "matched"); assert.equal(summary.constructorLocationMatched, true);
  assert.equal(summary.nativeWorkerTargetIdentityVerified, false); assert.equal(summary.executionAuthorized, false);
  assert.deepEqual(currentPcb209RatlineObservedExternalId(evidence), { id: "51", debuggerId: "parent-debugger" });
  const same = inspectCurrentPcb209RatlineOriginEvidence(captureCurrentPcb209RatlineOriginEvidence(evidence)); assert.deepEqual(same, summary);
  assert.equal(inspectCurrentPcb209RatlineOriginEvidence({ ...evidence, stackReply: null }).reason, "stack-lookup-unavailable");
});
void test("inline origin labels and foreign debugger IDs never authorize parent lookup", () => {
  const evidence = fixture();
  const inline = changed(evidence, "firstPause", value => { delete value["asyncStackTraceId"]; value["asyncStackTrace"] = { description: "Worker Created", callFrames: [] }; });
  assert.equal(currentPcb209RatlineObservedExternalId(inline), null);
  // A reply cannot be retained when no native-parent lookup was admitted.
  assert.throws(() => inspectCurrentPcb209RatlineOriginEvidence(inline));
  assert.equal(inspectCurrentPcb209RatlineOriginEvidence({ ...inline, stackReply: null }).reason, "external-id-missing");
  const foreign = changed(evidence, "firstPause", value => { value["asyncStackTraceId"] = { id: "51", debuggerId: "foreign-debugger" }; });
  assert.equal(currentPcb209RatlineObservedExternalId(foreign), null);
  assert.equal(inspectCurrentPcb209RatlineOriginEvidence({ ...foreign, stackReply: null }).reason, "external-debugger-mismatch");
  const malformed = changed(evidence, "firstPause", value => { value["asyncStackTraceId"] = { id: "not-a-native-number", debuggerId: "parent-debugger" }; });
  assert.equal(currentPcb209RatlineObservedExternalId(malformed), null);
  assert.equal(inspectCurrentPcb209RatlineOriginEvidence({ ...malformed, stackReply: null }).reason, "external-id-unqualified");
});
void test("same URL, later matching frames and unqualified scopes cannot repair an origin mismatch", () => {
  const evidence = fixture(), nativeFrame = { functionName: "addWorker", scriptId: "pcb-script", url: "", lineNumber: 4401, columnNumber: 167_801 };
  for (const difference of [{ scriptId: "other-script" }, { columnNumber: 167_802 }, { lineNumber: 4402 }, { functionName: "unrelated" }]) {
    const altered = changed(evidence, "stackReply", value => { value["stackTrace"] = { description: "Worker Created", callFrames: [{ ...nativeFrame, ...difference }, nativeFrame] }; });
    assert.equal(inspectCurrentPcb209RatlineOriginEvidence(altered).reason, "native-constructor-location-mismatch");
  }
  const missing = changed(evidence, "constructorBefore", value => { value["callFrames"] = [{ location: nativeFrame }]; });
  assert.equal(inspectCurrentPcb209RatlineOriginEvidence(missing).reason, "constructor-frame-unqualified");
  const child = changed(evidence, "firstPause", value => { value["callFrames"] = []; });
  assert.equal(inspectCurrentPcb209RatlineOriginEvidence(child).reason, "first-pause-unqualified");
  const excessive = changed(evidence, "stackReply", value => { value["stackTrace"] = { description: "Worker Created", callFrames: Array.from({ length: 33 }, () => ({ ...nativeFrame })) }; });
  assert.equal(inspectCurrentPcb209RatlineOriginEvidence(excessive).reason, "native-stack-unqualified");
});
void test("complete evidence capture rejects getters, excessive depth and oversized content without truncation", () => {
  const evidence = fixture(); let reads = 0;
  assert.throws(() => captureCurrentPcb209RatlineOriginEvidence({ ...evidence, stackReply: { get stackTrace(): string { reads += 1; return "bad"; } } }));
  assert.equal(reads, 0);
  assert.throws(() => captureCurrentPcb209RatlineOriginEvidence({ ...evidence, firstPause: { text: "x".repeat(16_385) } }));
  const oversized = Object.fromEntries(Array.from({ length: 5 }, (_, index) => [String(index), "x".repeat(16_000)]));
  assert.throws(() => captureCurrentPcb209RatlineOriginEvidence({ ...evidence, firstPause: oversized }));
  let nested: unknown = {}; for (let index = 0; index < 13; index += 1) { nested = { parent: nested }; }
  assert.throws(() => captureCurrentPcb209RatlineOriginEvidence({ ...evidence, stackReply: nested }));
  const altered = { ...evidence, metadata: { ...evidence.metadata, childDebuggerId: "different-child" } };
  assert.notEqual(inspectCurrentPcb209RatlineOriginEvidence(altered).evidenceSha256, inspectCurrentPcb209RatlineOriginEvidence(evidence).evidenceSha256);
});
