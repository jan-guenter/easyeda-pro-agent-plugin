/** Actual managed stages/SQLite with fake child streams only. No Windows launch. */
/* oxlint-disable import/max-dependencies -- Test composes actual original-receipt stages with the fixed program and child-stream seam, not an authority callback. */
import assert from "node:assert/strict";
import childProcess, { ChildProcess } from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import { PassThrough } from "node:stream";
import type { TestContext } from "node:test";
import { runInNewContext } from "node:vm";
import { isRecord, sha256Text } from "../../src/core.ts";
import { MAIN_REFERENCE_HELPER_IDENTITY } from "../../src/main-reference-helper-identity.ts";
import { windowsClockObservationForResult } from "../../src/windows-authority.ts";
import type { validateClockSample } from "../../src/windows-clock-transport.ts";
import { buildMainClockReference } from "../../src/symbol-clock-controls.ts";
import { fixture as clockFixture } from "./symbol-clock-fixture.ts";
import type { mainReferenceFixture } from "./closed-symbol-recorded-reference-fixture.ts";

function makeSample(sample: ReturnType<typeof validateClockSample>, offset: number, qpcOffset = offset): ReturnType<typeof validateClockSample> {
  return { ...sample, utcBeforeTicks: String(BigInt(sample.utcAfterTicks) + BigInt(offset) * 10_000n),
    utcAfterTicks: String(BigInt(sample.utcAfterTicks) + BigInt(offset + 1) * 10_000n),
    qpcBefore: String(BigInt(sample.qpcAfter) + BigInt(qpcOffset) * BigInt(sample.qpcFrequency) / 1000n),
    qpcAfter: String(BigInt(sample.qpcAfter) + BigInt(qpcOffset + 1) * BigInt(sample.qpcFrequency) / 1000n) };
}
export async function transportFixture(context: TestContext, fixture: Awaited<ReturnType<typeof mainReferenceFixture>>, alter?: "clock" | "exit" | "result" | "stderr" | "frequency" | "utc-prior" | "output-limit" | "malformed-utf8" | "controls"): Promise<{ calls: number }> {
  const original = childProcess.spawn, state = { calls: 0 };
  const clock = await windowsClockObservationForResult(fixture.input.baselineProof, "termination"); assert.equal(clock.clock.status, "observed");
  assert.ok(clock.clock.status === "observed"); const sample = alter === "frequency" ? { ...clock.clock.after, qpcFrequency: "5000000" } : clock.clock.after;
  const oldTz = process.env["TZ"]; process.env["TZ"] = "Europe/Berlin";
  context.after(() => { if (oldTz === undefined) { delete process.env["TZ"]; } else { process.env["TZ"] = oldTz; } });
  const intercepted = ((executable: string, args: string[], options: unknown): ChildProcess => {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Forward untouched non-command calls to the preceding exact synthetic child fixture, never a real Windows process.
    if (!args.includes("-Command")) { return Reflect.apply(original, childProcess, [executable, args, options]) as ChildProcess; }
    assert.equal(executable, "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe");
    assert.deepEqual(args.slice(0, 4), ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command"]); assert.equal(args.length, 5);
    const command = args[4]; assert.ok(command !== undefined); assert.match(command, /private\.main-reference-stdin\.v3/u); assert.ok(command.length <= 30_000);
    state.calls += 1;
    const child = new ChildProcess(), error = new PassThrough(), input = new PassThrough(), output = new PassThrough();
    Object.defineProperties(child, { stdin: { value: input }, stdout: { value: output }, stderr: { value: error } });
    context.mock.method(child, "kill", (): boolean => true);
    let text = "";
    input.setEncoding("utf8"); input.on("data", (chunk: string) => { text += chunk; assert.ok(text.length <= 524_288); });
    input.on("finish", () => {
      const data: unknown = JSON.parse(text); assert.ok(isRecord(data) && typeof data["requestBase64"] === "string" && typeof data["mainBase64"] === "string");
      assert.ok(MAIN_REFERENCE_HELPER_IDENTITY !== null && typeof data["helperBase64"] === "string");
      assert.deepEqual(Object.keys(data), ["profile", "helperBase64", "mainBase64", "requestBase64"]); assert.equal(data["profile"], "private.main-reference-stdin.v3");
      assert.equal(Buffer.from(data["helperBase64"], "base64").length, MAIN_REFERENCE_HELPER_IDENTITY.bytes);
      const main = Buffer.from(data["mainBase64"], "base64").toString("utf8"), requestText = Buffer.from(data["requestBase64"], "base64").toString("utf8");
      const request: unknown = JSON.parse(requestText); assert.ok(isRecord(request)); assert.equal(request["createdAtLiteral"], "2026-01-15 12:34:56");
      assert.equal(typeof request["referenceUtcMs"], "number"); const referenceUtcMs = Number(request["referenceUtcMs"]);
      const f = clockFixture("main-reference"); Object.defineProperty(f.date, "now", { value: (): number => referenceUtcMs + (alter === "utc-prior" ? -200 : 200) });
      const mainReference: unknown = runInNewContext(buildMainClockReference({ createdAtLiteral: request["createdAtLiteral"], referenceUtcMs }), f.sandbox, { timeout: 1000 });
      const nonce = String(request["nonce"]), requestSha256 = sha256Text(requestText);
      let afterOffset = 300; if (alter === "clock") { afterOffset = 90_000; } else if (alter === "utc-prior") { afterOffset = -100; }
      const result = { profile: "private.main-reference-result.v1", nonce, requestSha256, mainReference, mainDateIdentityRetained: true,
        rendererCreated: false, appClockDirectlyObserved: false, executionAuthorized: false };
      const response = { profile: "private.main-reference-transport-result.v3", helperSha256: MAIN_REFERENCE_HELPER_IDENTITY.sha256,
        session: { profile: "private.main-reference-native-session.v1", nonce, requestSha256, mainSha256: sha256Text(main),
          root: String.raw`\\?\Volume{12345678-1234-1234-1234-123456789abc}\Synthetic\Temp\easyeda-main-reference-${nonce}`,
          nativeCollectionComplete: true, referenceValidated: false, executionAuthorized: false, clockCleanupKnown: true, failure: "none", cleanupErrors: 0,
          owner: { preparedSha256: "b".repeat(64), settlementReceiptWritten: true, jobDependencyRetained: false,
            job: { launchAttempted: true, launchCallEntered: true, launchAcknowledged: true, pid: 123, startFileTime: "134362596002239703",
              rootSignaled: true, emptyJob: true, terminalObserved: true, exitCodeObserved: true, exitCode: 0,
              forced: false, stopAccepted: false, killOnCloseAttempted: false, settlementFinished: true, cleanupFinished: true,
              cleanupSucceeded: true, nativeSuccess: true, primaryCode: 0, primaryNativeError: 0,
              errorCodes: [], errorSlots: [], nativeErrors: [], errorOverflow: false, acquisitionUncertain: false, resourceAliasDetected: false },
            files: { prepared: true, unresolved: false, allHandlesClosed: true, acquiredHandles: 109, closeAttempts: 109,
              failedCloseSlots: [], retainedSlots: [], retainedCalls: 0, managedDigestCleanupUnresolved: false, storageReleased: true, failureNone: true },
            layout: { prepared: true, cleanupDeferred: false, allResourcesReleased: true, usedFrames: 22, cleanupErrors: 0,
              failureNone: true, coreFailureNone: true, layoutObserved: true, returnedHandles: 23, uniqueHandles: 23, closeAttempts: 23,
              allHandlesClosed: true, failedCloseSlots: [], aliasSlots: [] },
            ancestry: { prepared: true, cleanupDeferred: false, allResourcesReleased: true, unresolved: false, leaseOutstanding: false,
              storageReleased: true, ownedHandles: 12, closeAttempts: 12, closeFailures: 0, cleanupErrors: 0, failureNone: true } },
          nativeBefore: makeSample(sample, alter === "utc-prior" ? -300 : 100, 100),
          nativeAfter: makeSample(sample, afterOffset, alter === "clock" ? 90_000 : 300), result: alter === "result" ? {} : result } };
      queueMicrotask(() => {
        if (alter === "output-limit") { output.end(Buffer.alloc(131_073, 97)); }
        else if (alter === "malformed-utf8") { output.end(Buffer.from([0xF0, 0x9F, 0x92])); }
        else if (alter === "controls") { output.end(Buffer.alloc(131_072)); } else { output.end(JSON.stringify(response)); }
        error.end(alter === "stderr" ? "Synthetic refused" : ""); child.emit("close", alter === "exit" ? 1 : 0, null);
      });
    });
    return child;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The fixed fake ChildProcess owns real streams; no OS process is created for this command.
  }) as typeof childProcess.spawn;
  context.mock.method(childProcess, "spawn", intercepted); syncBuiltinESMExports();
  context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
  return state;
}
