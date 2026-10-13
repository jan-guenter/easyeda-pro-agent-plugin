/** Synthetic child/browser responses only. Actual coordinator, stages, registries and SQL remain unchanged. */
/* oxlint-disable import/max-dependencies -- Compose concrete production owners; only fixed child streams and browser replies are synthetic. */
import assert from "node:assert/strict";
import childProcess, { ChildProcess } from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import { PassThrough } from "node:stream";
import type { TestContext } from "node:test";
import { runInNewContext } from "node:vm";
import { ClosedSymbolCoordinator } from "../../src/closed-symbol-coordinator.ts";
import { fixture } from "./closed-symbol-coordinator-fixture.ts";
import { retireSyntheticJournal } from "./synthetic-journal-retirement.ts";
import { HISTORY_TABLE, IDS, mutate } from "./symbol-sql-fixture.ts";
import { fixture as clockFixture } from "./symbol-clock-fixture.ts";
import { syntheticClockSample } from "./windows-clock-spawn-fixture.ts";
import { isRecord, sha256Text } from "../../src/core.ts";
import { MAIN_REFERENCE_HELPER_IDENTITY } from "../../src/main-reference-helper-identity.ts";
import { windowsClockObservationForResult } from "../../src/windows-authority.ts";
import type { validateClockSample } from "../../src/windows-clock-transport.ts";
import { assertOriginalMainReference } from "../../src/closed-symbol-main-reference.ts";
import { AGED_WITNESS_PROFILE } from "../../src/aged-symbol-witness.ts";
import { buildMainClockReference, buildRendererClockControls, validateClockControls } from "../../src/symbol-clock-controls.ts";
import type { ClockControls } from "../../src/symbol-clock-controls.ts";

type Fixture = Omit<Awaited<ReturnType<typeof fixture>>, "stage"> & {
  stage: ClosedSymbolCoordinator; transport: { calls: number; rendererCalls: number; request: Record<string, unknown> | undefined };
};
function makeSample(sample: ReturnType<typeof validateClockSample>, offset: number): ReturnType<typeof validateClockSample> {
  return { ...sample, utcBeforeTicks: String(BigInt(sample.utcAfterTicks) + BigInt(offset) * 10_000n),
    utcAfterTicks: String(BigInt(sample.utcAfterTicks) + BigInt(offset + 1) * 10_000n),
    qpcBefore: String(BigInt(sample.qpcAfter) + BigInt(offset) * BigInt(sample.qpcFrequency) / 1000n),
    qpcAfter: String(BigInt(sample.qpcAfter) + BigInt(offset + 1) * BigInt(sample.qpcFrequency) / 1000n) };
}
function rendererReply(f: Fixture): unknown {
  const retained = f.stage.retained();
  const operationId = retained["operationId"]; assert.equal(typeof operationId, "string");
  const reference = assertOriginalMainReference(retained["mainReference"], f.engine, String(operationId));
  const actor = f.browser.actor, time = f.state.clockMs + 100;
  const controlScope = { createdAtLiteral: reference.request.createdAtLiteral, referenceUtcMs: reference.request.referenceUtcMs };
  function controls(offset: number): ClockControls {
    const clock = clockFixture("renderer"); Object.assign(clock.startup, actor); Object.assign(clock.cached, actor);
    Object.defineProperty(clock.date, "now", { value: (): number => time + offset });
    const raw: unknown = runInNewContext(`globalThis.top=globalThis;globalThis.window=globalThis;globalThis.document.defaultView=globalThis;${buildRendererClockControls(controlScope, actor)}`, clock.sandbox, { timeout: 1000 });
    return validateClockControls(structuredClone(raw), controlScope, "renderer");
  }
  const controlsAfter = controls(20), controlsBefore = controls(0), parsed = controlsBefore.sql[0]; assert.ok(parsed !== undefined);
  const witness = { profile: "easyeda-pro-control.symbol-predispatch-observation.v2", projectUuid: IDS.project, branchUuid: IDS.branch,
    ownerUuid: IDS.actor, targetUuid: IDS.target, activeUuid: IDS.peer, createdAtLiteral: reference.request.createdAtLiteral,
    workerClient: "a".repeat(16), workerMaxTicket: 100, workerTimeBeforeMs: time + 10, workerTimeAfterMs: time + 11,
    cachedActorUuid: IDS.actor, startupActor: { ...actor }, cachedActor: { ...actor }, rendererParsedCreatedAtMs: parsed.epochMs,
    rendererTimezoneOffsetMinutes: controlsBefore.clockBefore.offsetMinutes, rendererClockBeforeMs: time + 10, rendererClockAfterMs: time + 11,
    scope: "point-in-time-read-only-observation", appActorVerified: false, appClockVerified: false, workerFreshOfflineClockVerified: false,
    producerBindingVerified: false, executionAuthorized: false };
  return { profile: AGED_WITNESS_PROFILE, witness, controlsBefore: structuredClone(controlsBefore), controlsAfter: structuredClone(controlsAfter), executionAuthorized: false, producerBindingVerified: false };
}
function childTransport(context: TestContext, f: Fixture): void {
  const original = childProcess.spawn;
  const intercepted = ((executable: string, args: string[], options: unknown): ChildProcess => {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Delegate only to the already fixed synthetic child fixture, which rejects unrecognized executables.
    if (!args.includes("-Command")) { return Reflect.apply(original, childProcess, [executable, args, options]) as ChildProcess; }
    assert.equal(executable, "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe");
    assert.deepEqual(args.slice(0, 4), ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command"]); assert.equal(args.length, 5);
    const command = args[4]; assert.ok(command !== undefined); assert.match(command, /private\.main-reference-stdin\.v3/u); assert.ok(command.length <= 30_000);
    f.transport.calls += 1; f.events.push("main-reference"); assert.equal(f.state.scope, false);
    assert.equal(f.events.filter((event) => event === "launch").length, 1);
    const child = new ChildProcess(), input = new PassThrough(), output = new PassThrough(), stderr = new PassThrough();
    Object.defineProperties(child, { stdin: { value: input }, stdout: { value: output }, stderr: { value: stderr } });
    context.mock.method(child, "kill", (): boolean => true);
    let text = "";
    input.setEncoding("utf8"); input.on("data", (chunk: string) => { text += chunk; assert.ok(text.length <= 524_288); });
    async function respond(): Promise<void> {
      const originals = f.stage.retained()["originals"]; assert.ok(isRecord(originals));
      const clock = await windowsClockObservationForResult(originals["proof"], "termination"); assert.equal(clock.clock.status, "observed");
      assert.ok(clock.clock.status === "observed"); const sample = clock.clock.after;
      const data: unknown = JSON.parse(text); assert.ok(isRecord(data) && typeof data["requestBase64"] === "string" && typeof data["mainBase64"] === "string");
      assert.ok(MAIN_REFERENCE_HELPER_IDENTITY !== null && typeof data["helperBase64"] === "string");
      assert.deepEqual(Object.keys(data), ["profile", "helperBase64", "mainBase64", "requestBase64"]); assert.equal(data["profile"], "private.main-reference-stdin.v3");
      assert.equal(Buffer.from(data["helperBase64"], "base64").length, MAIN_REFERENCE_HELPER_IDENTITY.bytes);
      const main = Buffer.from(data["mainBase64"], "base64").toString("utf8"), requestText = Buffer.from(data["requestBase64"], "base64").toString("utf8");
      const request: unknown = JSON.parse(requestText); assert.ok(isRecord(request)); f.transport.request = request;
      assert.equal(typeof request["createdAtLiteral"], "string"); assert.equal(typeof request["referenceUtcMs"], "number");
      const controls = clockFixture("main-reference"), referenceUtcMs = Number(request["referenceUtcMs"]);
      Object.defineProperty(controls.date, "now", { value: (): number => referenceUtcMs + 200 });
      const mainReference: unknown = runInNewContext(buildMainClockReference({ createdAtLiteral: request["createdAtLiteral"], referenceUtcMs }), controls.sandbox, { timeout: 1000 });
      const nonce = String(request["nonce"]), requestSha256 = sha256Text(requestText);
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
          nativeBefore: makeSample(sample, 100), nativeAfter: makeSample(sample, 300), result } };
      output.end(JSON.stringify(response)); stderr.end(); child.emit("close", 0, null);
    }
    async function settle(): Promise<void> {
      try { await respond(); }
      catch (error) { output.end(); stderr.end(String(error)); child.emit("close", 1, null); }
    }
    input.on("finish", () => { void settle(); });
    return child;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Fake child owns real streams only; this fixed command never starts an OS process.
  }) as typeof childProcess.spawn;
  context.mock.method(childProcess, "spawn", intercepted); syncBuiltinESMExports();
  context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
}
export async function agedCoordinatorFixture(context: TestContext, recent = false, reviewedExecutionScopeSha256?: string): Promise<Fixture> {
  const base = await fixture(context, reviewedExecutionScopeSha256);
  const stage = new ClosedSymbolCoordinator(base.engine, base.upstream, base.runtime, base.ui, base.machine, base.identity);
  const f: Fixture = { ...base, stage, transport: { calls: 0, rendererCalls: 0, request: undefined } };
  const sample = syntheticClockSample(); assert.equal(typeof sample["utcBeforeTicks"], "string");
  const nativeTime = Number((BigInt(String(sample["utcBeforeTicks"])) - 621_355_968_000_000_000n) / 10_000n);
  const literal = recent ? new Date(nativeTime).toISOString().slice(0, 19).replace("T", " ") : "2026-01-15 12:34:56";
  mutate(f.source, `UPDATE "${HISTORY_TABLE}" SET is_lock=0,created_at='${literal}' WHERE uuid='${IDS.oldHead}'`);
  context.after(async (): Promise<void> => { const operationId = stage.retained()["operationId"]; if (typeof operationId === "string") { await retireSyntheticJournal(operationId); } });
  const previousTz = process.env["TZ"]; process.env["TZ"] = "Europe/Berlin";
  context.after(() => { if (previousTz === undefined) { delete process.env["TZ"]; } else { process.env["TZ"] = previousTz; } });
  childTransport(context, f);
  const original = f.upstream.callTool.bind(f.upstream);
  context.mock.method(f.upstream, "callTool", (...args: Parameters<typeof original>): ReturnType<typeof original> => {
    if (!String(args[1]?.["code"]).includes(AGED_WITNESS_PROFILE)) { return original(...args); }
    assert.equal(args[0], "easyeda_execute"); assert.equal(args[1]?.["confirmWrite"], false); assert.ok(args[3] !== undefined);
    assert.equal(f.state.scope, true); f.transport.rendererCalls += 1; f.events.push("aged-witness");
    const raw = rendererReply(f); return Promise.resolve({ content: [{ type: "text", text: JSON.stringify(raw) }] });
  });
  return f;
}
