import assert from "node:assert/strict";
import { test } from "node:test";
import { parseRetainedMainReferenceTransport, retainMainReferenceTransportV2, successfulRetainedMainReferenceText } from "../src/closed-symbol-main-reference-result-envelope.ts";
import type { MainReferenceTransportOutcome } from "../src/closed-symbol-main-reference-transport.ts";

const request = "a".repeat(64);
const intent = "b".repeat(64);
function success(): MainReferenceTransportOutcome {
  return Object.freeze({ stdout: "{}", stderr: "", exitCode: 0, signal: null, timedOut: false, transportFailure: null,
    rawStdoutBase64: Buffer.from("{}").toString("base64"), rawStderrBase64: "", transportState: "closed", spawnReturnObserved: true,
    transportCloseObserved: true, observationGuardsComplete: true, containmentRequest: "not-requested", windowsJobTerminationProved: false, executionAuthorized: false });
}
function envelope(): Record<string, unknown> & { returned: Record<string, unknown> } {
  const value = retainMainReferenceTransportV2(success(), request, intent);
  return { ...value, returned: { ...value.returned } };
}
void test("v2 retains every transport observation and only historical text", () => {
  const value = success();
  const saved = retainMainReferenceTransportV2(value, request, intent);
  const parsed = parseRetainedMainReferenceTransport(saved, request, intent);
  assert.deepEqual(parsed, saved); assert.ok(Object.isFrozen(saved) && Object.isFrozen(saved.returned));
  for (const key of Object.keys(value)) { if (key !== "stdout" && key !== "stderr") { assert.equal(saved.returned[key], Reflect.get(value, key)); } }
  assert.deepEqual(successfulRetainedMainReferenceText(saved, request, intent), { text: "{}", transportObservationRetained: true, windowsJobTerminationProved: false, executionAuthorized: false });
});
void test("v1 stays exact historical evidence without invented closure observations", () => {
  const value = envelope(); value["profile"] = "private.main-reference-retained-result.v1";
  for (const key of ["transportState", "spawnReturnObserved", "transportCloseObserved", "observationGuardsComplete", "containmentRequest", "windowsJobTerminationProved", "executionAuthorized"]) { Reflect.deleteProperty(value.returned, key); }
  const parsed = parseRetainedMainReferenceTransport(value, request, intent);
  assert.deepEqual(parsed, value); assert.equal(Object.hasOwn(parsed.returned, "transportCloseObserved"), false);
  assert.throws(() => successfulRetainedMainReferenceText(value, request, intent));
  value.returned["transportCloseObserved"] = true;
  assert.throws(() => parseRetainedMainReferenceTransport(value, request, intent));
});
for (const [key, replacement] of [
  ["profile", "private.main-reference-retained-result.v3"], ["requestSha256", "c".repeat(64)], ["intentSha256", "c".repeat(64)],
  ["returnedEncoding", "utf8"], ["extra", false], ["returned", null],
] as const) {
  void test(`envelope refuses changed ${key}`, () => {
    const value = envelope(); assert.equal(Reflect.set(value, key, replacement), true);
    assert.throws(() => parseRetainedMainReferenceTransport(value, request, intent));
  });
}
for (const [key, replacement] of [
  ["exitCode", "0"], ["exitCode", Number.NaN], ["exitCode", -0], ["exitCode", 0.5], ["exitCode", Number.MAX_SAFE_INTEGER + 1],
  ["signal", "SIGTERM"], ["signal", "private error detail"], ["timedOut", true], ["timedOut", "false"],
  ["transportFailure", "unknown"], ["rawStdoutBase64", "eA"], ["rawStdoutBase64", " eA=="], ["rawStdoutBase64", "*"],
  ["rawStderrBase64", null], ["transportState", "unresolved"], ["transportState", "not-started"],
  ["spawnReturnObserved", false], ["transportCloseObserved", false], ["observationGuardsComplete", false],
  ["spawnReturnObserved", "true"], ["transportCloseObserved", 1], ["observationGuardsComplete", null],
  ["containmentRequest", "accepted"], ["containmentRequest", "complete"], ["windowsJobTerminationProved", true],
  ["executionAuthorized", true], ["extra", false],
] as const) {
  void test(`stream data refuses ${key}=${String(replacement)}`, () => {
    const value = envelope(); value.returned[key] = replacement;
    assert.throws(() => parseRetainedMainReferenceTransport(value, request, intent));
  });
}
for (const key of ["profile", "requestSha256", "intentSha256", "returnedEncoding", "returned"] as const) {
  void test(`envelope rejects accessor ${key} without executing it`, () => {
    const value = envelope(); let read = false;
    Object.defineProperty(value, key, { enumerable: true, get(): never { read = true; throw new Error("Not allowed"); } });
    assert.throws(() => parseRetainedMainReferenceTransport(value, request, intent)); assert.equal(read, false);
  });
}
for (const kind of ["missing", "symbol", "prototype", "nonenumerable", "accessor"] as const) {
  void test(`stream shape rejects ${kind}`, () => {
    const value = envelope(); let read = false;
    if (kind === "missing") { Reflect.deleteProperty(value.returned, "transportState"); }
    if (kind === "symbol") { Object.defineProperty(value.returned, Symbol("hidden"), { value: true }); }
    if (kind === "prototype") { Object.setPrototypeOf(value.returned, { hidden: true }); }
    if (kind === "nonenumerable") { Object.defineProperty(value.returned, "transportState", { enumerable: false }); }
    if (kind === "accessor") { Object.defineProperty(value.returned, "transportState", { enumerable: true, get(): never { read = true; throw new Error("Not allowed"); } }); }
    assert.throws(() => parseRetainedMainReferenceTransport(value, request, intent)); assert.equal(read, false);
  });
}
for (const failure of ["stdin-failure", "stdout-failure", "stderr-failure", "start-failure", "output-limit", "deadline"] as const) {
  for (const state of ["closed", "unresolved"] as const) {
    void test(`${failure}/${state} remains diagnostic and cannot qualify a stage`, () => {
      const value = { ...success(), stdout: "", exitCode: state === "closed" ? 197 : null, transportFailure: failure,
        timedOut: failure === "deadline", transportState: state, transportCloseObserved: state === "closed", containmentRequest: "accepted" as const };
      const saved = retainMainReferenceTransportV2(value, request, intent);
      assert.equal(saved.returned["transportFailure"], failure); assert.equal(saved.returned["transportState"], state);
      assert.throws(() => successfulRetainedMainReferenceText(saved, request, intent));
    });
  }
}
void test("observed close with incomplete guards remains unresolved", () => {
  const value = { ...success(), stdout: "", transportState: "unresolved" as const, observationGuardsComplete: false, transportFailure: "start-failure" as const };
  const saved = retainMainReferenceTransportV2(value, request, intent);
  assert.equal(saved.returned["transportCloseObserved"], true); assert.equal(saved.returned["transportState"], "unresolved");
  assert.throws(() => successfulRetainedMainReferenceText(saved, request, intent));
});
void test("opaque spawn exception preserves uncertainty without a child handle", () => {
  const value = { ...success(), stdout: "", exitCode: null, transportState: "unresolved" as const, spawnReturnObserved: false,
    transportCloseObserved: false, observationGuardsComplete: false, transportFailure: "start-failure" as const };
  const saved = retainMainReferenceTransportV2(value, request, intent);
  assert.equal(saved.returned["containmentRequest"], "not-requested"); assert.equal(saved.returned["spawnReturnObserved"], false);
  assert.throws(() => successfulRetainedMainReferenceText(saved, request, intent));
});
void test("shared raw cap preserves malformed bytes and bounded control-character encoding", () => {
  const value = { ...success(), stdout: "", rawStdoutBase64: Buffer.alloc(65_536).toString("base64"), rawStderrBase64: Buffer.alloc(65_536, 255).toString("base64"), transportFailure: "malformed-utf8" as const };
  const saved = retainMainReferenceTransportV2(value, request, intent);
  assert.ok(Buffer.byteLength(JSON.stringify(saved)) < 196_608);
  assert.throws(() => successfulRetainedMainReferenceText(saved, request, intent));
  assert.throws(() => retainMainReferenceTransportV2({ ...value, rawStderrBase64: Buffer.alloc(65_537, 255).toString("base64") }, request, intent));
  assert.throws(() => retainMainReferenceTransportV2({ ...value, rawStdoutBase64: Buffer.alloc(131_073).toString("base64") }, request, intent));
});
void test("successful text rejects malformed UTF8 but preserves BOM bytes", () => {
  const value = envelope(); value.returned["rawStdoutBase64"] = Buffer.from([0xF0, 0x9F, 0x92]).toString("base64");
  assert.throws(() => successfulRetainedMainReferenceText(value, request, intent));
  value.returned["rawStdoutBase64"] = Buffer.from("\uFEFF{}").toString("base64");
  assert.equal(successfulRetainedMainReferenceText(value, request, intent).text, "\uFEFF{}");
});
for (const exitCode of [-Number.MAX_SAFE_INTEGER, 3_221_225_786, Number.MAX_SAFE_INTEGER]) {
  void test(`observed safe integer exit ${exitCode} is retained without OS-range assumptions`, () => {
    const saved = retainMainReferenceTransportV2({ ...success(), exitCode }, request, intent);
    assert.equal(saved.returned["exitCode"], exitCode);
    assert.throws(() => successfulRetainedMainReferenceText(saved, request, intent));
  });
}
