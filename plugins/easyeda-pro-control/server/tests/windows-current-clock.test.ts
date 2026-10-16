import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { test } from "node:test";
import { INPUT, closedSessionFixture } from "./helpers/windows-closed-session-fixture.ts";
import { qualifiedClockFixture } from "./helpers/windows-clock-fixture.ts";
import { assertIssuedWindowsClockObservation, windowsClockObservationForResult } from "../src/windows-authority.ts";

void test("fresh clock uses the original retained capture after source checks, without recapture or a new child", async (context) => {
  const f = await qualifiedClockFixture(context);
  await f.supervisor.launch({ confirmLaunch: true });
  const evidence = await f.supervisor.capture(INPUT), observe = f.supervisor.observeCurrentClock;
  assert.ok(observe);
  let helperReads = 0, sampled = false;
  const originalRead = fs.readFile;
  context.mock.method(fs, "readFile", (...args: Parameters<typeof fs.readFile>): ReturnType<typeof fs.readFile> => {
    assert.equal(sampled, false, "helper revalidation must finish before the fresh sample");
    helperReads += 1; return originalRead(...args);
  }); syncBuiltinESMExports();
  f.behavior.mutateResponse = (request): void => {
    if (request["action"] === "clocked-observe-owned-clock") { sampled = true; assert.ok(helperReads > 0); }
  };
  const clock = await observe(evidence);
  assert.equal(clock.phase, "owned-observation"); assert.equal(clock.clock.status, "observed");
  assert.equal(clock.ownerBinding["authoritySha256"], evidence.authoritySha256);
  assert.equal(clock.ownerBinding["operationId"], INPUT.operationId);
  assert.equal(clock.base["captureBindingSha256"], INPUT.bindingSha256);
  assert.equal(clock.executionAuthorized, false); assert.equal(clock.producerBindingVerified, false);
  assert.equal(Object.isFrozen(clock), true); assert.equal(Object.isFrozen(clock.base), true);
  assert.equal(Object.isFrozen(clock.ownerBinding), true); assert.equal(Object.isFrozen(clock.clock), true);
  assert.deepEqual(f.requests.map((r) => r["action"]), ["clocked-launch", "clocked-capture", "clocked-observe-owned-clock"]);
  assert.equal(f.spawnCalls(), 1);
  sampled = false;
  assert.strictEqual(await assertIssuedWindowsClockObservation(clock), clock);
  await assert.rejects(assertIssuedWindowsClockObservation(structuredClone(clock)), /not issued/u);
  await assert.rejects(windowsClockObservationForResult(evidence, "owned-observation"), /Original Windows result/u);
});

void test("a copied capture cannot request a fresh clock and does not consume the original", async (context) => {
  const f = await qualifiedClockFixture(context); await f.supervisor.launch({ confirmLaunch: true });
  const evidence = await f.supervisor.capture(INPUT), observe = f.supervisor.observeCurrentClock;
  assert.ok(observe);
  await assert.rejects(observe(structuredClone(evidence)), /original source-qualified retained capture/u);
  assert.equal(f.requests.length, 2);
  const first = await observe(evidence), second = await observe(evidence);
  assert.notStrictEqual(first, second); assert.notEqual(first.baseSha256, "");
  assert.strictEqual(await assertIssuedWindowsClockObservation(first), first);
  assert.strictEqual(await assertIssuedWindowsClockObservation(second), second);
});

void test("injected transport cannot issue a fresh clock even with its original capture", async () => {
  const f = closedSessionFixture();
  const binding = await f.capture(), observe = f.supervisor.observeCurrentClock;
  assert.ok(observe);
  await assert.rejects(observe(binding.executionAuthority), /source-qualified/u);
  assert.equal(f.requests.length, 2); await f.supervisor.release();
});

for (const mode of ["unavailable", "missing", "malformed"] as const) {
  void test(`fresh ${mode} native clock remains unavailable, never a fabricated time`, async (context) => {
    const f = await qualifiedClockFixture(context); await f.supervisor.launch({ confirmLaunch: true });
    const evidence = await f.supervisor.capture(INPUT), observe = f.supervisor.observeCurrentClock;
    assert.ok(observe); f.behavior.clockMode = mode;
    const clock = await observe(evidence);
    assert.equal(clock.clock.status, "unavailable"); assert.equal(clock.executionAuthorized, false);
  });
}

for (const drift of ["binding", "job", "helper", "phase", "dead-root", "dead-process", "old-time", "extra-field"] as const) {
  void test(`fresh clock refuses native ${drift} and never retries`, async (context) => {
    const f = await qualifiedClockFixture(context); await f.supervisor.launch({ confirmLaunch: true });
    const evidence = await f.supervisor.capture(INPUT), observe = f.supervisor.observeCurrentClock;
    assert.ok(observe);
    f.behavior.mutateResponse = (request, response): void => {
      if (request["action"] !== "clocked-observe-owned-clock") { return; }
      const base = response["base"]; assert.ok(base !== null && typeof base === "object");
      if (drift === "binding") { Object.assign(base, { captureBindingSha256: "0".repeat(64) }); }
      else if (drift === "job") { Object.assign(base, { jobId: "0".repeat(32) }); }
      else if (drift === "helper") { Object.assign(base, { helperInstance: "0".repeat(32) }); }
      else if (drift === "phase") { response["schema"] = "easyeda-pro-control.windows-clocked-capture.v1"; }
      else if (drift === "dead-root") { Object.assign(base, { rootStillLive: false }); }
      else if (drift === "dead-process") { Object.assign(base, { retainedProcessesLive: false }); }
      else if (drift === "old-time") { Object.assign(base, { observedAt: "2026-10-11T00:00:00.000Z" }); }
      else { Object.assign(base, { capturedAt: "2026-10-12T12:00:05.000Z" }); }
    };
    await assert.rejects(observe(evidence));
    assert.equal(f.requests.filter((r) => r["action"] === "clocked-observe-owned-clock").length, 1);
  });
}

for (const drift of ["capture-release", "helper-release", "replacement-launch", "new-capture", "capture-mutation", "normal-close"] as const) {
  void test(`issued fresh clock rejects later ${drift}`, async (context) => {
    const f = await qualifiedClockFixture(context), launch = await f.supervisor.launch({ confirmLaunch: true });
    const evidence = await f.supervisor.capture(INPUT), observe = f.supervisor.observeCurrentClock;
    assert.ok(observe); const clock = await observe(evidence);
    if (drift === "capture-release") { await f.supervisor.releaseCapture(evidence); }
    else if (drift === "helper-release") { await f.supervisor.release(); }
    else if (drift === "replacement-launch") { await f.supervisor.launch({ confirmLaunch: true }); }
    else if (drift === "new-capture") { await f.supervisor.capture({ ...INPUT, bindingSha256: "9".repeat(64) }); }
    else if (drift === "capture-mutation") { Object.assign(evidence, { capturedAt: "2026-10-11T00:00:00.000Z" }); }
    else { await f.supervisor.requestNormalClose({ confirmNormalClose: true, launch, windowHandle: "12345" }); }
    await assert.rejects(assertIssuedWindowsClockObservation(clock));
  });
}

void test("fresh clock refuses drift across source-revalidation await before native sampling", async (context) => {
  const f = await qualifiedClockFixture(context); await f.supervisor.launch({ confirmLaunch: true });
  const evidence = await f.supervisor.capture(INPUT), observe = f.supervisor.observeCurrentClock;
  assert.ok(observe); const originalRead = fs.readFile;
  context.mock.method(fs, "readFile", async (...args: Parameters<typeof fs.readFile>): ReturnType<typeof fs.readFile> => {
    const result = await originalRead(...args); Object.assign(evidence, { authoritySha256: "0".repeat(64) }); return result;
  }); syncBuiltinESMExports();
  await assert.rejects(observe(evidence), /capture, owner or original generation changed/u);
  assert.equal(f.requests.length, 2);
});

void test("fresh clock refuses original capture mutation while native sampling is outstanding", async (context) => {
  const f = await qualifiedClockFixture(context); await f.supervisor.launch({ confirmLaunch: true });
  const evidence = await f.supervisor.capture(INPUT), observe = f.supervisor.observeCurrentClock;
  assert.ok(observe);
  f.behavior.mutateResponse = (request): void => {
    if (request["action"] === "clocked-observe-owned-clock") { Object.assign(evidence, { authoritySha256: "0".repeat(64) }); }
  };
  await assert.rejects(observe(evidence), /capture, owner or original generation changed/u);
  assert.equal(f.requests.length, 3);
});

void test("capture input drift cannot be laundered into an original current-clock owner", async (context) => {
  const f = await qualifiedClockFixture(context); await f.supervisor.launch({ confirmLaunch: true });
  const input = structuredClone(INPUT), observe = f.supervisor.observeCurrentClock;
  assert.ok(observe);
  f.behavior.mutateResponse = (request): void => {
    if (request["action"] === "clocked-capture") { Object.assign(input, { operationId: "changed-after-dispatch" }); }
  };
  const evidence = await f.supervisor.capture(input);
  await assert.rejects(observe(evidence), /original source-qualified retained capture/u);
  assert.equal(f.requests.length, 2);
});

void test("native fresh clock only reads original retained handles and cannot mint a capture or launch", async () => {
  const source = await fs.readFile(new URL("../../scripts/windows-authority.ps1", import.meta.url), "utf8");
  const start = source.indexOf("function Observe-OwnedClock($request) {");
  const end = source.indexOf("function Handle-ClockedRequest($request) {", start);
  assert.ok(start > 0 && end > start); const body = source.slice(start, end);
  for (const guard of ["[Object]::ReferenceEquals($capture.job,$job)", "$capture.receipt.helperInstance -cne $request.helperInstance",
    "$capture.receipt.jobId -cne $request.jobId", "$script:clockedJobs.ContainsKey($job.Id)", "$job.Root.HasExited",
    "$job.Contains($job.Root)", "$capture.handles.Count -eq 0", "$process.HasExited", "$job.Contains($process)"]) {
    assert.ok(body.includes(guard), guard);
  }
  assert.doesNotMatch(body, /GetProcessById|GetProcesses|New-Object|\.Launch\(|\.Dispose\(|\.Kill\(|Stop-Process|Handle-Request/u);
  assert.match(body, /foreach \(\$observation in 1\.\.2\)/u);
});
