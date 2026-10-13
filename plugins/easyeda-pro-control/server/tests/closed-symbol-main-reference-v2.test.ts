/** Pure compiler/native-result joins. No native process or generated-source evaluator. */
import assert from "node:assert/strict";
import childProcess from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { before, test } from "node:test";
import { canonicalJson } from "../src/core.ts";
import { retainMainReferenceTransportV2, successfulRetainedMainReferenceText } from "../src/closed-symbol-main-reference-result-envelope.ts";
import { compileMainReferenceTransport, invokeMainReferenceTransport, validateMainReferenceTransportResult } from "../src/closed-symbol-main-reference-transport.ts";
import type { CompiledMainReferenceTransport } from "../src/closed-symbol-main-reference-transport.ts";
import { compileRecordedMainReferenceMetadata, validateRecordedMainReferenceTransportResult } from "../src/closed-symbol-recorded-main-reference-metadata.ts";
// oxlint-disable-next-line import/max-dependencies -- Compare live and historical boundaries with the fixed no-spawn observer in one test.
import { request, response } from "./helpers/main-reference-v2-result-fixture.ts";
import type { Bag } from "./helpers/main-reference-v2-result-fixture.ts";

let compiled: CompiledMainReferenceTransport | undefined;
before(async () => { compiled = await compileMainReferenceTransport(request); });
function invocation(): CompiledMainReferenceTransport { assert.ok(compiled !== undefined); return compiled; }
function digest(value: string | Buffer): string { return createHash("sha256").update(value).digest("hex"); }
function base64Length(bytes: number): number { return 4 * Math.ceil(bytes / 3); }
function compareText(left: string, right: string): number {
  if (left < right) { return -1; }
  if (left > right) { return 1; }
  return 0;
}
function accepted(value: Bag): void {
  const live = validateMainReferenceTransportResult(value, invocation());
  const historical = validateRecordedMainReferenceTransportResult(value, invocation());
  assert.deepEqual(historical, live);
  assert.equal(live["executionAuthorized"], false);
  assert.equal(live["appClockDirectlyObserved"], false);
}
function refused(value: Bag): void {
  assert.throws(() => validateMainReferenceTransportResult(value, invocation()));
  assert.throws(() => validateRecordedMainReferenceTransportResult(value, invocation()));
}
function fresh(): ReturnType<typeof response> { const value = response(invocation()); accepted(value.native); return value; }
function section(source: string, start: string, end?: string): string {
  const first = source.indexOf(start); assert.ok(first !== -1); assert.equal(source.indexOf(start, first + start.length), -1);
  if (end === undefined) { return source.slice(first); }
  const last = source.indexOf(end, first + start.length); assert.ok(last > first); return source.slice(first, last);
}

for (const createdAtLiteral of ["2026-01-15 12:34:56", "2026-07-15 12:34:56", "2020-01-01 00:00:00"]) {
  void test(`current live/historical compiler parity and fixed bounded stdin for ${createdAtLiteral}`, async () => {
    const input = { ...request, createdAtLiteral };
    const live = await compileMainReferenceTransport(input);
    const historical = await compileRecordedMainReferenceMetadata(input);
    assert.deepEqual(historical, live); assert.equal(live.command.length, 21_383);
    assert.ok(live.command.length <= 30_000 && live.stdin.length <= 180_000);
    assert.equal(Buffer.byteLength(live.stdin), live.stdin.length);
    assert.equal(live.stdinProfile, "private.main-reference-stdin.v2"); assert.equal(live.stdinSha256, digest(live.stdin));
    assert.equal(live.commandSha256, digest(live.command)); assert.equal(live.requestSha256, digest(canonicalJson(live.request)));
    assert.match(live.command, /^#.*\nthrow 'UNREVIEWED MAIN REFERENCE TRANSPORT - DO NOT EXECUTE'\n/u);
    assert.doesNotMatch(live.command, /ExecutionPolicy|EncodedCommand|Invoke-Expression|ScriptBlock|__[A-Z_]+__/u);
    const payload: unknown = JSON.parse(live.stdin);
    assert.ok(payload !== null && typeof payload === "object");
    assert.deepEqual(Object.keys(payload), ["profile", "ownerBase64", "clockBase64", "mainBase64", "requestBase64"]);
    const fields = Object.getOwnPropertyDescriptors(payload);
    for (const [field, file] of [["ownerBase64", "OwnedSyntheticJob.cs"], ["clockBase64", "EasyedaClockObservation.cs"]] as const) {
      const item = fields[field]; assert.ok(item !== undefined && typeof item.value === "string");
      const bytes = await readFile(new URL(`../../scripts/main-reference/${file}`, import.meta.url));
      assert.equal(item.value, bytes.toString("base64")); assert.equal(digest(bytes), live.sourcePins[file]);
      assert.equal(live.command.includes(item.value), false);
    }
    assert.ok(Object.isFrozen(live)); assert.equal(Object.keys(live.sourcePins).length, 4);
  });
}
void test("all fixed sources and the refusal match the reviewed source-owned inputs", async () => {
  const expected = { "owner-command.ps1": "f417642a0dffa2f80df33b6aafd5865aa944acb635b3a4b4814814dcdcfabbd5",
    "OwnedSyntheticJob.cs": "e426dbcb9dd1ad646d63ad88b665381c08ee940c7c3159df19d71a2e24eaa727",
    "stdin-decoder.ps1": "c16caba4dc933f299f25b3bc9acede20e590f8bad3cfdb66799aefb978631e90",
    "EasyedaClockObservation.cs": "97449e83f75b1c724717708c5a630669577f60cf7af142db66022cc73b4e656c" };
  for (const [name, hash] of Object.entries(expected)) {
    const bytes = await readFile(new URL(`../../scripts/main-reference/${name}`, import.meta.url)); assert.equal(digest(bytes), hash);
  }
  const owner = await readFile(new URL("../../scripts/main-reference/owner-command.ps1", import.meta.url), "utf8");
  assert.equal(owner.split("\n")[1], "throw 'UNREVIEWED MAIN REFERENCE TRANSPORT - DO NOT EXECUTE'");
});
void test("native fixture keys match the exact PowerShell v2 producer fields", async () => {
  const ownerSource = await readFile(new URL("../../scripts/main-reference/owner-command.ps1", import.meta.url), "utf8");
  const line = ownerSource.split("\n").find(value => value.startsWith("$owner=@{"));
  assert.ok(line !== undefined);
  const literal = [...line.matchAll(/(?:\{|;)([A-Za-z][A-Za-z0-9]*)=/gu)].map(match => { const key = match[1]; assert.ok(key !== undefined); return key; });
  const added = [...ownerSource.matchAll(/\$owner\.([A-Za-z][A-Za-z0-9]*)=/gu)].map(match => { const key = match[1]; assert.ok(key !== undefined); return key; });
  const keys = [...literal, ...added];
  assert.equal(keys.length, 36); assert.equal(new Set(keys).size, keys.length);
  assert.deepEqual(Object.keys(fresh().owner).toSorted(compareText), keys.toSorted(compareText));
});
void test("fixed source sizes preserve the whole-stdin worst-case bound without raising caps", async () => {
  const owner = await readFile(new URL("../../scripts/main-reference/OwnedSyntheticJob.cs", import.meta.url));
  const clock = await readFile(new URL("../../scripts/main-reference/EasyedaClockObservation.cs", import.meta.url));
  const envelope = JSON.stringify({ profile: "private.main-reference-stdin.v2", ownerBase64: "", clockBase64: "", mainBase64: "", requestBase64: "" }).length;
  const maximum = envelope + base64Length(owner.length) + base64Length(clock.length) + base64Length(100_000) + base64Length(8192);
  assert.equal(maximum, 178_310); assert.ok(maximum <= 180_000);
});
void test("entire current invoked transport body and packaged reader remain byte-exact", async () => {
  const proposal = await readFile(new URL("../src/closed-symbol-main-reference-transport.ts", import.meta.url), "utf8");
  // Only the v3 input type and explanatory comment differ. The complete
  // Observer implementation and retained-child set still match the old bytes.
  const observer = section(proposal, "// Retain unresolved original children", "export function validateMainReferenceTransportResult")
    .replace("input: CompiledMainReferenceTransport | MainReferenceV3Metadata", "input: CompiledMainReferenceTransport")
    .replace("/** Transport evidence only. Native qualification is a separate result check;\n * child closure never establishes Windows Job termination.",
      "/** Transport evidence only. The native owner and v2 result qualification remain\n * unimplemented; child closure never establishes Windows Job termination.");
  assert.equal(digest(observer),
    "5da73da4080f0a67b0b35d83c842ef550dcf6f10f5695277396d22e6c1b2ccc3");
  assert.equal(digest(section(proposal, "async function source(", "export interface CompiledMainReferenceTransport")),
    "eb17f62e0e3ca2774f6dbf80aa2b7acecffe98bbf4cc86b2590addca9920f781");
});
void test("metadata compiler and validator have exact current bodies without invocation registry", async () => {
  const live = await readFile(new URL("../src/closed-symbol-main-reference-transport.ts", import.meta.url), "utf8");
  const historical = await readFile(new URL("../src/closed-symbol-recorded-main-reference-metadata.ts", import.meta.url), "utf8");
  assert.equal(section(historical, "export async function compileRecordedMainReferenceMetadata", "export function validateRecordedMainReferenceTransportResult"),
    section(live, "export async function compileMainReferenceTransport(", "/** Current binary-helper compiler.")
      .replaceAll("compileMainReferenceTransport", "compileRecordedMainReferenceMetadata")
      .replaceAll("CompiledMainReferenceTransport", "RecordedMainReferenceMetadata").replace("compiled.add(result); return result;", "return result;"));
  assert.equal(section(historical, "export function validateRecordedMainReferenceTransportResult"),
    section(live, "export function validateMainReferenceTransportResult").replaceAll("validateMainReferenceTransportResult", "validateRecordedMainReferenceTransportResult")
      .replaceAll("CompiledMainReferenceTransport", "RecordedMainReferenceMetadata"));
  assert.doesNotMatch(historical, /node:child_process|new WeakSet|compiled\.add|function invoke/u);
});
void test("metadata and cloned compiler data cannot invoke or acquire authority", async context => {
  let calls = 0;
  context.mock.method(childProcess, "spawn", (): never => { calls += 1; throw new Error("No native spawn is permitted in this test"); });
  syncBuiltinESMExports();
  context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
  const historical = await compileRecordedMainReferenceMetadata(request);
  assert.throws(() => invokeMainReferenceTransport(historical), /unissued or already consumed/u);
  assert.throws(() => invokeMainReferenceTransport({ ...invocation() }), /unissued or already consumed/u);
  assert.equal(calls, 0);
});
void test("new exact v2 success is the same data-only result in both validators", () => { fresh(); });

for (const key of ["launchAttempted", "launchCallEntered", "launchAcknowledged", "rootSignaled", "emptyRetainedJob", "terminationObserved",
  "nativeCleanupComplete", "nativeCleanupSucceeded", "managedCleanupSucceeded", "settlementReceiptPublished"]) {
  void test(`v2 success requires true ${key}, without coercion or omission`, () => {
    for (const changed of [false, 1, null, undefined]) { const value = fresh(); if (changed === undefined) { assert.equal(Reflect.deleteProperty(value.owner, key), true); } else { value.owner[key] = changed; } refused(value.native); }
  });
}
for (const key of ["forced", "killOnCloseAttempted", "nativeAcquisitionUncertain", "nativeResourceAliasDetected", "ownershipUnresolved",
  "ownerRecordingFailed", "nativeCleanupOverflow", "managedCleanupOverflow", "executionAuthorized"]) {
  void test(`v2 success requires false ${key}, without coercion or omission`, () => {
    for (const changed of [true, 0, null, undefined]) { const value = fresh(); if (changed === undefined) { assert.equal(Reflect.deleteProperty(value.owner, key), true); } else { value.owner[key] = changed; } refused(value.native); }
  });
}
for (const key of ["rootExitCode", "primaryCategory", "nativePrimaryCode", "nativePrimaryError", "managedCleanupFailureCount"]) {
  void test(`v2 success requires exact zero ${key}`, () => {
    for (const changed of [1, -0, "0", null, undefined]) { const value = fresh(); if (changed === undefined) { assert.equal(Reflect.deleteProperty(value.owner, key), true); } else { value.owner[key] = changed; } refused(value.native); }
  });
}
for (const key of ["cleanupCodes", "cleanupSlots", "cleanupNativeErrors", "managedCleanupSlots"]) {
  void test(`v2 success requires an exact empty ${key} array`, () => {
    for (const changed of [[0], {}, null, Object.assign([], { extra: false }), Object.assign([], { [Symbol("extra")]: 0 })]) {
      const value = fresh(); value.owner[key] = changed; refused(value.native);
    }
  });
}
for (const [key, changed] of [["profile", "private.main-reference-owner-final.v1"], ["nonce", "b".repeat(64)],
  ["requestSha256", "0".repeat(64)], ["preparedSha256", "bad"], ["accepted", false], ["stage", "OBSERVATION_COMPLETE"],
  ["rootPid", 0], ["rootStartFileTime", "0"], ["extra", true], ["killOnCloseForUnprovedRemainder", false]] as const) {
  void test(`native owner identity/shape refusal: ${key}`, () => { const value = fresh(); value.owner[key] = changed; refused(value.native); });
}
void test("owner accessors are refused without evaluation", () => {
  const value = fresh(); let reads = 0;
  Object.defineProperty(value.owner, "ownershipUnresolved", { enumerable: true, get(): never { reads += 1; throw new Error("opaque"); } });
  refused(value.native); assert.equal(reads, 0);
});
void test("v1 native evidence stays v1 and cannot be relabeled into current cleanup proof", () => {
  const value = fresh();
  value.native["ownerSourceSha256"] = "e7ad9692ac3960ac590c3784ef6687d9fe21a0dd0917a92b12f7399ddb90a598";
  value.native["profile"] = "private.main-reference-transport-result.v1";
  value.native["owner"] = { profile: "private.main-reference-owner-final.v1", nonce: request.nonce, requestSha256: invocation().requestSha256,
    preparedSha256: "b".repeat(64), accepted: true, stage: "COMPLETE", rootPid: 123, rootStartFileTime: "134363233783886047",
    forced: false, emptyRetainedJob: true, killOnCloseForUnprovedRemainder: false, rootExitCode: 0, executionAuthorized: false };
  const original = JSON.stringify(value.native); refused(value.native); assert.equal(JSON.stringify(value.native), original);
  const relabeled = structuredClone(value.native); relabeled["profile"] = "private.main-reference-transport-result.v2";
  relabeled["ownerSourceSha256"] = invocation().sourcePins["OwnedSyntheticJob.cs"];
  assert.ok(relabeled["owner"] !== null && typeof relabeled["owner"] === "object");
  Reflect.set(relabeled["owner"], "profile", "private.main-reference-owner-final.v2");
  refused(relabeled); assert.equal(JSON.stringify(value.native), original);
});
void test("failed native diagnostics remain raw while current semantic qualification refuses", () => {
  const value = fresh(); value.owner["accepted"] = false; value.owner["ownershipUnresolved"] = true;
  const stdout = JSON.stringify(value.native);
  const envelope = retainMainReferenceTransportV2({ stdout, stderr: "", exitCode: 1, signal: null, timedOut: false, transportFailure: null,
    rawStdoutBase64: Buffer.from(stdout).toString("base64"), rawStderrBase64: "", transportState: "closed", spawnReturnObserved: true,
    transportCloseObserved: true, observationGuardsComplete: true, containmentRequest: "not-requested",
    windowsJobTerminationProved: false, executionAuthorized: false }, invocation().requestSha256, "d".repeat(64));
  assert.equal(Buffer.from(String(envelope.returned["rawStdoutBase64"]), "base64").toString("utf8"), stdout);
  assert.throws(() => successfulRetainedMainReferenceText(envelope, invocation().requestSha256, "d".repeat(64))); refused(value.native);
});
void test("closed zero-exit transport cannot mask a negative native v2 result", () => {
  const value = fresh(); value.owner["nativeCleanupSucceeded"] = false;
  const stdout = JSON.stringify(value.native);
  const envelope = retainMainReferenceTransportV2({ stdout, stderr: "", exitCode: 0, signal: null, timedOut: false, transportFailure: null,
    rawStdoutBase64: Buffer.from(stdout).toString("base64"), rawStderrBase64: "", transportState: "closed", spawnReturnObserved: true,
    transportCloseObserved: true, observationGuardsComplete: true, containmentRequest: "not-requested",
    windowsJobTerminationProved: false, executionAuthorized: false }, invocation().requestSha256, "d".repeat(64));
  assert.equal(successfulRetainedMainReferenceText(envelope, invocation().requestSha256, "d".repeat(64)).text, stdout);
  refused(value.native);
});
