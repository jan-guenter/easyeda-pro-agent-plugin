import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { closedSymbolDisposableIndexRefusal, closedSymbolDisposableInputSchema, closedSymbolDisposableOutputSchema,
  formatClosedSymbolDisposableResult, parseClosedSymbolDisposableInput } from "../src/closed-symbol-disposable-tool.ts";
import { sha256Text } from "../src/core.ts";
import { closedSymbolEntryFailureDiagnostic, closedSymbolFailureDiagnostic, closedSymbolFailureDiagnosticText } from "../src/closed-symbol-failure-diagnostic.ts";
import { artifactData, completedData, requestData, stoppedData } from "./helpers/disposable-tool-data.ts";

function check(input: unknown, ok: boolean): z.infer<typeof closedSymbolDisposableOutputSchema>["result"] {
  const result = formatClosedSymbolDisposableResult(input);
  assert.equal(result.isError, !ok);
  const parsed = closedSymbolDisposableOutputSchema.parse(result.structuredContent);
  const text = result.content[0]; assert.ok(text !== undefined && text.type === "text");
  assert.deepEqual(JSON.parse(text.text), { ok, structuredContent: true,
    jsonBytes: Buffer.byteLength(JSON.stringify(parsed)), sha256: sha256Text(JSON.stringify(parsed)) });
  assert.ok(Buffer.byteLength(JSON.stringify(parsed)) <= 16_384);
  return parsed.result;
}

void test("failure diagnostic keeps the result and digest exact and exposes only fixed fingerprint paths", () => {
  let reads = 0;
  const message = "Closed navigation runtime does not match the expected subset.";
  const error = Object.assign(new Error(message), { mismatches: [
    { pointer: "/health/payload/node_version", get actual(): never { reads += 1; throw new Error("private actual"); } },
    { pointer: "/private-secret-sentinel", expected: "private-value" },
  ] });
  const diagnostic = closedSymbolFailureDiagnostic(error, "coordinator", "edit-marker-read");
  assert.ok(diagnostic !== undefined);
  assert.equal(diagnostic.errorCode, "RUNTIME_FINGERPRINT_MISMATCH");
  assert.equal(diagnostic.messageSha256, sha256Text(message));
  assert.deepEqual(diagnostic.mismatchPaths, ["/health/payload/node_version"]);
  const original = formatClosedSymbolDisposableResult(stoppedData()), withDiagnostic = formatClosedSymbolDisposableResult(stoppedData(), diagnostic);
  assert.deepEqual(withDiagnostic.structuredContent, original.structuredContent);
  assert.deepEqual(withDiagnostic.content[0], original.content[0]);
  const text = withDiagnostic.content[1]; assert.ok(text?.type === "text");
  assert.deepEqual(JSON.parse(text.text), diagnostic); assert.ok(Buffer.byteLength(text.text) <= 2048);
  assert.doesNotMatch(JSON.stringify(withDiagnostic), /private|expected subset/u); assert.equal(reads, 0);
  assert.equal(formatClosedSymbolDisposableResult(completedData(), diagnostic).content.length, 1);
  const refusal = closedSymbolDisposableIndexRefusal({ phase: "projection", reason: "result-refused", attemptReserved: true,
    entryInvocationAttempted: true, entryReturnObserved: true, originalEntryResult: stoppedData() }, diagnostic);
  assert.deepEqual(refusal.content[1], text); assert.equal(refusal.isError, true);
});

void test("failure diagnostics never read accessors, proxies, stack or cause and bound unknown messages", () => {
  let reads = 0;
  const unknown = new Error("private-message-sentinel");
  Object.defineProperty(unknown, "stack", { get: (): never => { reads += 1; throw new Error("never read stack"); } });
  Object.defineProperty(unknown, "cause", { get: (): never => { reads += 1; throw new Error("never read cause"); } });
  const diagnostic = closedSymbolFailureDiagnostic(unknown, "coordinator", "private-stage");
  assert.equal(diagnostic?.errorCode, "UNCLASSIFIED_FAILURE"); assert.equal(diagnostic.lastSuccessfulStage, null);
  assert.equal(diagnostic.messageSha256, sha256Text("private-message-sentinel"));
  assert.doesNotMatch(JSON.stringify(diagnostic), /private/u);
  const accessor = new Error("replaced by accessor");
  Object.defineProperty(accessor, "message", { get: (): never => { reads += 1; throw new Error("never read message"); } });
  assert.equal(closedSymbolFailureDiagnostic(accessor, "request")?.messageSha256, null);
  const oversized = new Error("x".repeat(8193));
  assert.equal(closedSymbolFailureDiagnostic(oversized, "request")?.messageSha256, null);
  assert.equal(closedSymbolFailureDiagnostic(new Error("\uD800"), "request")?.messageSha256, null);
  const revoked = Proxy.revocable({}, {}); revoked.revoke();
  assert.equal(closedSymbolFailureDiagnostic(revoked.proxy, "request")?.errorCode, "ERROR_MESSAGE_UNAVAILABLE");
  assert.equal(closedSymbolEntryFailureDiagnostic(revoked.proxy), undefined);
  assert.deepEqual(closedSymbolFailureDiagnosticText({ ...diagnostic, mismatchPaths: revoked.proxy }), []);
  const error = Object.assign(new Error("Closed navigation runtime does not match the expected subset."), { mismatches: revoked.proxy });
  assert.deepEqual(closedSymbolFailureDiagnostic(error, "coordinator")?.mismatchPaths, []);
  const entry = { failure: unknown, phase: "coordinator", coordinator: { lastSuccessfulStage: "edit-marker-read" },
    get retained(): never { reads += 1; throw new Error("never read retained"); } };
  assert.equal(closedSymbolEntryFailureDiagnostic(entry)?.lastSuccessfulStage, "edit-marker-read");
  assert.equal(entry.failure, unknown); assert.equal(reads, 0);
});

for (const projectLength of [32, 64]) {
  void test(`strict parser keeps the original request and freezes its separate ${String(projectLength)}-hex projection`, () => {
    const raw = requestData(); raw.request.target.projectUuid = "a".repeat(projectLength);
    if (projectLength === 64) {
      raw.request.target.symbolUuid = "b".repeat(16); raw.request.target.companionPcbUuid = "c".repeat(16);
    }
    const before = JSON.stringify(raw), parsed = parseClosedSymbolDisposableInput(raw);
    assert.equal(parsed.originalRequest, raw.request); assert.notEqual(parsed.request, raw.request);
    assert.ok(Object.isFrozen(parsed.request) && Object.isFrozen(parsed.request.target) && Object.isFrozen(parsed.request.metadata));
    assert.equal(JSON.stringify(raw), before); assert.ok(closedSymbolDisposableInputSchema.safeParse(raw).success);
  });
}
function requestObject(raw: ReturnType<typeof requestData>, level: "outer" | "request" | "target" | "metadata"): object {
  if (level === "outer") { return raw; }
  if (level === "request") { return raw.request; }
  return raw.request[level];
}
for (const level of ["outer", "request", "target", "metadata"] as const) {
  void test(`whole strict SDK schema and parser reject an unknown ${level} field`, () => {
    const raw = requestData();
    const object = requestObject(raw, level);
    Object.assign(object, { unexpected: true });
    assert.equal(closedSymbolDisposableInputSchema.safeParse(raw).success, false);
    assert.throws(() => parseClosedSymbolDisposableInput(raw));
  });
  void test(`own-data parser refuses ${level} accessors without invoking them`, () => {
    const raw = requestData(); let reads = 0;
    const object = requestObject(raw, level);
    const key = Object.keys(object)[0]; assert.ok(key !== undefined);
    Object.defineProperty(object, key, { enumerable: true, get: (): never => { reads += 1; throw new Error("never invoke"); } });
    assert.throws(() => parseClosedSymbolDisposableInput(raw)); assert.equal(reads, 0);
  });
}
const invalidRequests: readonly [string, (value: ReturnType<typeof requestData>) => void][] = [
  ["blank title", value => { value.request.metadata.name = " \t\n "; }],
  ["empty title", value => { value.request.metadata.name = ""; }],
  ["title overflow", value => { value.request.metadata.name = "a".repeat(513); }],
  ["Unicode surrogate", value => { value.request.metadata.description = "\uD800"; }],
  ["whole UTF8 bound", value => { value.request.metadata.description = "é".repeat(20_000); }],
  ["same target and peer", value => { value.request.target.companionPcbUuid = value.request.target.symbolUuid; }],
  ["wide branch UUID", value => { value.request.target.branchUuid = "b".repeat(64); }],
  ["uppercase project UUID", value => { value.request.target.projectUuid = "A".repeat(64); }],
  ["relative project path", value => { value.request.target.projectPath = "never-opened.eprj2"; }],
  ["hidden outer field", value => { Object.defineProperty(value, "hidden", { value: true }); }],
  ["symbol outer field", value => { Reflect.set(value, Symbol("extra"), true); }],
  ["missing confirmation", value => { Reflect.deleteProperty(value.request, "confirmDisposableMetadataEdit"); }],
  ["false confirmation", value => { Reflect.set(value.request, "confirmDisposableMetadataEdit", false); }],
  ["foreign prototype", value => { Object.setPrototypeOf(value.request.target, { inherited: true }); }],
];
for (const [name, mutate] of invalidRequests) {
  void test(`parser refuses ${name} before any owner exists`, () => {
    const raw = requestData(); mutate(raw); assert.throws(() => parseClosedSymbolDisposableInput(raw));
  });
}
void test("fixed parser accepts the exact JSON byte bound and refuses the next byte", () => {
  const raw = requestData(); raw.request.metadata.description = "";
  const remaining = 32_768 - Buffer.byteLength(JSON.stringify(raw.request));
  raw.request.metadata.description = "x".repeat(remaining);
  assert.equal(Buffer.byteLength(JSON.stringify(raw.request)), 32_768);
  parseClosedSymbolDisposableInput(raw);
  raw.request.metadata.description += "x"; assert.throws(() => parseClosedSymbolDisposableInput(raw));
});
for (const phase of ["request", "queue", "admission", "sql-runtime", "expectation", "construction", "claim", "coordinator", "terminal", "projection"]) {
  void test(`stopped ${phase} is locally validated with matching error metadata`, () => {
    const input = { ...stoppedData(), phase }; assert.deepEqual(check(input, false), input);
  });
}
for (const headEligibility of ["locked", "aged-unlocked"]) {
  void test(`completed ${headEligibility} preserves the exact public result beneath result`, () => {
    const input = { ...completedData(), headEligibility }; assert.deepEqual(check(input, true), input);
  });
}
for (const claimState of ["not-attempted", "publication-unknown", "acknowledged"]) {
  void test(`stopped projection preserves ${claimState} without inferring completion`, () => {
    const input = { ...stoppedData(), claimState, claimArtifact: artifactData(), terminalArtifact: artifactData() };
    assert.deepEqual(check(input, false), input);
  });
}
for (const field of ["replayAllowed", "executionAuthorized", "saved", "reopened", "explicitSavePerformed", "targetEditorOpened"]) {
  void test(`completed projection refuses contradictory ${field}`, () => {
    assert.throws(() => formatClosedSymbolDisposableResult({ ...completedData(), [field]: true }));
  });
}
for (const [name, input] of [
  ["extra output field", { ...completedData(), privateError: "secret-sentinel" }],
  ["extra descriptor field", { ...completedData(), claimArtifact: { ...artifactData(), secret: "sentinel" } }],
  ["oversize descriptor", { ...completedData(), claimArtifact: { ...artifactData(), bytes: 131_073 } }],
  ["relative descriptor", { ...completedData(), claimArtifact: { ...artifactData(), path: "relative.json" } }],
  ["NaN descriptor", { ...completedData(), claimArtifact: { ...artifactData(), bytes: Number.NaN } }],
  ["negative zero descriptor", { ...completedData(), claimArtifact: { ...artifactData(), bytes: -0 } }],
  ["Unicode descriptor", { ...completedData(), claimArtifact: { ...artifactData(), path: "/\uD800" } }],
  ["array", [completedData()]], ["null", null], ["undefined", undefined],
] as const) {
  void test(`formatter refuses ${name}`, () => { assert.throws(() => formatClosedSymbolDisposableResult(input)); });
}
void test("formatter rejects accessors, aliases and cycles without invoking property getters", () => {
  const value = completedData(); let reads = 0;
  Object.defineProperty(value, "claimArtifact", { enumerable: true, get: (): never => { reads += 1; throw new Error("never invoke"); } });
  assert.throws(() => formatClosedSymbolDisposableResult(value)); assert.equal(reads, 0);
  const descriptor = artifactData();
  assert.throws(() => formatClosedSymbolDisposableResult({ ...completedData(), claimArtifact: descriptor, terminalArtifact: descriptor }));
  const cycle: Record<string, unknown> = {}; cycle["next"] = cycle;
  assert.throws(() => formatClosedSymbolDisposableResult(cycle));
});
void test("wrapped schema itself is strict and exposes only result", () => {
  assert.deepEqual(Object.keys(closedSymbolDisposableOutputSchema.shape), ["result"]);
  assert.equal(closedSymbolDisposableOutputSchema.safeParse({ result: stoppedData(), extra: true }).success, false);
  assert.equal(closedSymbolDisposableOutputSchema.safeParse(completedData()).success, false);
  const json = z.toJSONSchema(closedSymbolDisposableOutputSchema);
  assert.equal(json.type, "object"); assert.equal(json.additionalProperties, false);
});
void test("a completed original followed by index refusal retains observation but not final completion", () => {
  const original = completedData();
  const raw = closedSymbolDisposableIndexRefusal({ phase: "entry", reason: "entry-boundary-refused",
    attemptReserved: true, entryInvocationAttempted: true, entryReturnObserved: true, originalEntryResult: original });
  assert.equal(raw.isError, true);
  const result = closedSymbolDisposableOutputSchema.parse(raw.structuredContent).result;
  assert.equal(result.profile, "easyeda-pro-control.closed-symbol-disposable-index-refusal.v1");
  assert.ok("entryObservation" in result && result.entryObservation !== null);
  assert.equal(result.entryObservation.originalOutcome, "completed");
  assert.deepEqual(result.entryObservation.claimArtifact, original.claimArtifact);
  assert.deepEqual(result.entryObservation.terminalArtifact, original.terminalArtifact);
  assert.equal(result.completionProved, false); assert.equal(result.executionAuthorized, false);
});
void test("index refusal preserves stopped facts and bounds invalid original returns", () => {
  for (const original of [stoppedData(), { ...stoppedData(), error: "secret-sentinel" }, undefined]) {
    const raw = closedSymbolDisposableIndexRefusal({ phase: "projection", reason: "result-refused",
      attemptReserved: true, entryInvocationAttempted: true, entryReturnObserved: true, originalEntryResult: original });
    const result = closedSymbolDisposableOutputSchema.parse(raw.structuredContent).result;
    assert.ok("entryObservation" in result); assert.equal(result.entryReturnObserved, true);
    assert.equal(result.entryObservation?.originalOutcome ?? null, original === undefined || Object.hasOwn(original, "error") ? null : "stopped");
    assert.doesNotMatch(JSON.stringify(raw), /secret-sentinel/u); assert.equal(raw.isError, true);
  }
});
void test("index refusal rejects inconsistent observation facts", () => {
  assert.throws(() => closedSymbolDisposableIndexRefusal({ phase: "entry", reason: "entry-boundary-refused",
    attemptReserved: false, entryInvocationAttempted: true, entryReturnObserved: false }));
  assert.throws(() => closedSymbolDisposableIndexRefusal({ phase: "entry", reason: "entry-boundary-refused",
    attemptReserved: true, entryInvocationAttempted: false, entryReturnObserved: true }));
});
void test("escaped descriptor bytes cannot bypass the final response size cap", () => {
  const value = completedData();
  value.claimArtifact.path = `/${"\t".repeat(4095)}`; value.terminalArtifact.path = `/${"\t".repeat(4095)}`;
  assert.throws(() => formatClosedSymbolDisposableResult(value), /16 KiB/u);
  const response = closedSymbolDisposableIndexRefusal({ phase: "projection", reason: "result-refused",
    attemptReserved: true, entryInvocationAttempted: true, entryReturnObserved: true, originalEntryResult: value });
  const result = closedSymbolDisposableOutputSchema.parse(response.structuredContent).result;
  assert.ok("entryObservation" in result); assert.equal(result.entryObservation, null);
  assert.equal(result.entryReturnObserved, true); assert.ok(Buffer.byteLength(JSON.stringify(response.structuredContent)) <= 16_384);
});

void test("a valid exact-limit entry becomes observation-null only because its index wrapper exceeds the limit", () => {
  const original = completedData();
  original.claimArtifact.path = `/${"\t".repeat(4095)}`;
  original.terminalArtifact.path = "/";
  const remaining = 16_384 - Buffer.byteLength(JSON.stringify({ result: original }));
  assert.ok(remaining > 0);
  original.terminalArtifact.path += "\t".repeat(Math.floor(remaining / 2)) + (remaining % 2 === 1 ? "x" : "");
  assert.ok(original.terminalArtifact.path.length <= 4096);
  assert.equal(Buffer.byteLength(JSON.stringify({ result: original })), 16_384);
  assert.ok(Buffer.byteLength(JSON.stringify(original)) <= 16_384);
  assert.deepEqual(check(original, true), original);
  const observation = { originalOutcome: "completed", operationId: original.operationId, claimState: original.claimState,
    claimArtifact: original.claimArtifact, terminalArtifact: original.terminalArtifact,
    headEligibility: original.headEligibility, bodySha256: original.bodySha256 };
  const fixed = { profile: "easyeda-pro-control.closed-symbol-disposable-index-refusal.v1", action: "run-disposable-once",
    outcome: "stopped", phase: "entry", reason: "entry-boundary-refused", attemptReserved: true,
    entryInvocationAttempted: true, entryReturnObserved: true, entryObservation: observation,
    replayAllowed: false, executionAuthorized: false, completionProved: false, historicalCompletionRecorded: "not-checked",
    nextSafeAction: "Inspect retained evidence. Do not repeat this request or any native phase." };
  assert.ok(Buffer.byteLength(JSON.stringify({ result: fixed })) > 16_384);
  const raw = closedSymbolDisposableIndexRefusal({ phase: "entry", reason: "entry-boundary-refused",
    attemptReserved: true, entryInvocationAttempted: true, entryReturnObserved: true, originalEntryResult: original });
  const result = closedSymbolDisposableOutputSchema.parse(raw.structuredContent).result;
  assert.ok("entryObservation" in result); assert.equal(result.entryObservation, null);
  assert.equal(result.entryReturnObserved, true); assert.equal(result.completionProved, false); assert.equal(raw.isError, true);
});
