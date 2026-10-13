/** Actual managed stages/SQLite with fake child streams only. No Windows launch. */
/* oxlint-disable import/max-dependencies -- Test composes actual original-receipt stages with the fixed program and child-stream seam, not an authority callback. */
import assert from "node:assert/strict";
import childProcess, { ChildProcess } from "node:child_process";
import fsPromises from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename, join } from "node:path";
import { PassThrough } from "node:stream";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { runInNewContext } from "node:vm";
import { operationPath, readExactUtf8Artifact, writePhaseArtifact } from "../../src/artifacts.ts";
import { appendClosedSymbolEvent, loadClosedSymbolJournal } from "../../src/closed-symbol-journal.ts";
import { isRecord, sha256Text } from "../../src/core.ts";
import { MAIN_REFERENCE_HELPER_IDENTITY } from "../../src/main-reference-helper-identity.ts";
import { windowsClockObservationForResult } from "../../src/windows-authority.ts";
import type { validateClockSample } from "../../src/windows-clock-transport.ts";
import { buildMainClockReference } from "../../src/symbol-clock-controls.ts";
import { fixture as clockFixture } from "./symbol-clock-fixture.ts";
import { ClosedSymbolMainReferenceStage, assertOriginalMainReference } from "../../src/closed-symbol-main-reference.ts";
import { mainReferenceFixture } from "./closed-symbol-main-reference-fixture.ts";

function makeSample(sample: ReturnType<typeof validateClockSample>, offset: number, qpcOffset = offset): ReturnType<typeof validateClockSample> {
  return { ...sample, utcBeforeTicks: String(BigInt(sample.utcAfterTicks) + BigInt(offset) * 10_000n),
    utcAfterTicks: String(BigInt(sample.utcAfterTicks) + BigInt(offset + 1) * 10_000n),
    qpcBefore: String(BigInt(sample.qpcAfter) + BigInt(qpcOffset) * BigInt(sample.qpcFrequency) / 1000n),
    qpcAfter: String(BigInt(sample.qpcAfter) + BigInt(qpcOffset + 1) * BigInt(sample.qpcFrequency) / 1000n) };
}
async function transportFixture(context: TestContext, fixture: Awaited<ReturnType<typeof mainReferenceFixture>>, alter?: "clock" | "exit" | "result" | "stderr" | "frequency" | "utc-prior" | "output-limit" | "malformed-utf8" | "controls"): Promise<{ calls: number }> {
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

export function registerMainReferenceBoundaryCases(boundary: "predispatch" | "issuance"): void {
  for (const change of ["supervisor-release", "capture", "release-capture", "runtime-release", "relaunch"] as const) {
    void test(`late ${boundary} journal load rejects original owner ${change}`, async (context) => {
      const f = await mainReferenceFixture(context), transport = await transportFixture(context, f);
      const link = fsPromises.link, open = fsPromises.open; let armed = false, changed = false;
      context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => {
        await link(...args);
        if (basename(String(args[1])) === `10-baseline-main-reference-${boundary === "predispatch" ? "intent" : "result"}.json`) { armed = true; }
      });
      context.mock.method(fsPromises, "open", async (...args: Parameters<typeof open>): ReturnType<typeof open> => {
        const file = await open(...args);
        if (armed && !changed && basename(String(args[0])) === `${f.journal.operationId}.json`) {
          changed = true;
          if (change === "supervisor-release") { await f.owner.supervisor.release(); }
          if (change === "runtime-release") { await f.runtime.release(); }
          if (change === "relaunch") { await f.runtime.launch(); }
          if (change === "release-capture") { await f.owner.supervisor.releaseCapture(f.baselineCapture.executionAuthority); }
          if (change === "capture") { await f.owner.supervisor.capture({ bindingSha256: "7".repeat(64), operationId: f.journal.operationId,
            orphanPhase: "synthetic-intervening-capture", challengeAttempt: 2, bridgeSession: f.baselineCapture.bridgeSession, runtimeIdentity: f.baselineCapture.runtimeIdentity }); }
        }
        return file;
      }); syncBuiltinESMExports();
      await assert.rejects(f.stage.runOnce(f.input)); assert.equal(changed, true);
      assert.equal(transport.calls, boundary === "predispatch" ? 0 : 1);
      assert.equal(f.stage.originalReturn(f.journal.operationId) !== undefined, boundary === "issuance");
      await assert.rejects(f.stage.runOnce(f.input), /already consumed/u);
    });
  }

}
export function registerMainReferenceCoreCases(): void {
void test("actual baseline-owned reference retains one intent/result with no journal phase advance", async (context) => {
  const f = await mainReferenceFixture(context), transport = await transportFixture(context, f);
  const result = await f.stage.runOnce(f.input); assert.equal(transport.calls, 1);
  assert.strictEqual(assertOriginalMainReference(result, f.engine, f.journal.operationId), result);
  assert.equal(result.request.createdAtLiteral, "2026-01-15 12:34:56"); assert.equal(result.appClockDirectlyObserved, false);
  const loaded = await loadClosedSymbolJournal(f.journal.operationId); assert.equal(loaded.journal.sequence, 10); assert.equal(loaded.journal.artifacts.length, 10);
  const saved = await readExactUtf8Artifact(result.resultArtifact); assert.match(saved.text, /main-reference-retained-result/u);
  assert.throws(() => assertOriginalMainReference(structuredClone(result), f.engine, f.journal.operationId), /not issued/u);
  await assert.rejects(f.stage.runOnce(f.input), /already consumed/u); assert.equal(transport.calls, 1);
});
for (const field of ["baselineCopy", "baselineInventory", "baselineProof"] as const) {
  void test(`main reference refuses reconstructed ${field} before transport`, async (context) => {
    const f = await mainReferenceFixture(context), transport = await transportFixture(context, f);
    await assert.rejects(f.stage.runOnce({ ...f.input, [field]: structuredClone(f.input[field]) })); assert.equal(transport.calls, 0);
  });
}
void test("pre-existing auxiliary intent refuses dispatch instead of retrying a previous process", async (context) => {
  const f = await mainReferenceFixture(context), transport = await transportFixture(context, f);
  await writePhaseArtifact(f.journal.operationId, 10, "baseline-main-reference-intent", { previousProcessOutcomeUnknown: true });
  await assert.rejects(f.stage.runOnce(f.input)); assert.equal(transport.calls, 0);
  await assert.rejects(new ClosedSymbolMainReferenceStage(f.engine).runOnce(f.input), /already consumed/u); assert.equal(transport.calls, 0);
});

}
export function registerMainReferenceSettledCases(part: "first" | "second"): void {
for (const change of part === "first" ? (["clock", "exit", "result", "stderr"] as const) : (["frequency", "utc-prior", "output-limit", "malformed-utf8", "controls"] as const)) {
  void test(`settled main reference ${change} refuses issuance and replay`, async (context) => {
    const f = await mainReferenceFixture(context), transport = await transportFixture(context, f, change);
    const refused = f.stage.runOnce(f.input);
    await (change === "frequency" || change === "utc-prior" ? assert.rejects(refused, /construction differs from baseline/u) : assert.rejects(refused));
    assert.equal(transport.calls, 1); assert.ok(f.stage.originalReturn(f.journal.operationId) !== undefined);
    const resultPath = join(operationPath(f.journal.operationId).slice(0, -5), "10-baseline-main-reference-result.json");
    const bytes = await fsPromises.readFile(resultPath); assert.ok(bytes.length <= 196_608);
    const evidence: unknown = JSON.parse(bytes.toString("utf8")); assert.ok(isRecord(evidence) && isRecord(evidence["returned"]));
    assert.equal(evidence["returnedEncoding"], "base64-streams-v1");
    assert.equal(evidence["returned"]["rawStdoutBase64"], f.stage.originalReturn(f.journal.operationId)?.rawStdoutBase64);
    assert.throws(() => assertOriginalMainReference(f.stage.originalReturn(f.journal.operationId), f.engine, f.journal.operationId), /not issued/u);
    await assert.rejects(f.stage.runOnce(f.input), /already consumed/u); assert.equal(transport.calls, 1);
  });
}

}
export function registerMainReferencePublicationCases(): void {
for (const phase of ["intent", "result"] as const) {
  void test(`main reference ${phase} publication failure leaves no issued reference`, async (context) => {
    const f = await mainReferenceFixture(context), transport = await transportFixture(context, f); let reached = false;
    const link = fsPromises.link;
    context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => {
      if (String(args[1]).endsWith(`-baseline-main-reference-${phase}.json`)) { reached = true; throw new Error("synthetic publication refusal"); }
      await link(...args);
    }); syncBuiltinESMExports();
    await assert.rejects(f.stage.runOnce(f.input), /synthetic publication refusal/u); assert.equal(reached, true); assert.equal(transport.calls, phase === "intent" ? 0 : 1);
    assert.equal(f.stage.originalReturn(f.journal.operationId) !== undefined, phase === "result");
    assert.throws(() => assertOriginalMainReference(f.stage.originalReturn(f.journal.operationId), f.engine, f.journal.operationId), /not issued/u);
  });
}
for (const change of ["caller", "durable-next-phase"] as const) {
  void test(`main reference retains result then refuses ${change} drift without overwrite`, async (context) => {
    const f = await mainReferenceFixture(context), transport = await transportFixture(context, f); let reached = false;
    const link = fsPromises.link;
    context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => {
      await link(...args);
      if (String(args[1]).endsWith("-baseline-main-reference-result.json")) {
        reached = true;
        if (change === "caller") { f.journal.hardStop = true; }
        else { const loaded = await loadClosedSymbolJournal(f.journal.operationId);
          await appendClosedSymbolEvent(loaded.journal, { step: "edit-launch", kind: "intent", generation: null, requestSha256: "a".repeat(64), data: { syntheticConcurrentStage: true } }); }
      }
    }); syncBuiltinESMExports();
    await assert.rejects(f.stage.runOnce(f.input), /changed/u); assert.equal(reached, true); assert.equal(transport.calls, 1);
    assert.ok(f.stage.originalReturn(f.journal.operationId)); const loaded = await loadClosedSymbolJournal(f.journal.operationId);
    assert.equal(loaded.journal.sequence, change === "caller" ? 10 : 11); assert.equal(f.journal.sequence, 10);
    assert.equal(f.journal.hardStop, change === "caller");
  });
}

}
