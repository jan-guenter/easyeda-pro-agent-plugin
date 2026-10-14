import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { sha256Json } from "../src/core.ts";
import type { AuthenticatedBridgeSessionIdentity, ExecutionAuthorityCaptureInput } from "../src/engine.ts";
import { assertClosedSessionCopyAuthority, assertClosedSessionTerminationProof } from "../src/windows-authority.ts";
import type { ClosedSessionBinding, WindowsAuthorityLaunch, WindowsAuthorityStartOptions, WindowsAuthoritySupervisor } from "../src/windows-authority.ts";
import {
  WindowsControlRuntime,
  buildWindowsProcessProbeCode,
  deriveWindowsRuntimePaths,
  performWindowsAuthenticatedProcessProbe,
} from "../src/windows-runtime.ts";
import type { WindowsControlRuntimeOptions } from "../src/windows-runtime.ts";
import { INPUT, closedSessionFixture } from "./helpers/windows-closed-session-fixture.ts";

const SESSION: AuthenticatedBridgeSessionIdentity = { authenticatedAtEpochMs: 1000, authenticationReceiptSha256: "a".repeat(64), gatewayInstanceId: "gateway", sequence: 1, sessionId: "session" };
const PROBE = { schema: "easyeda-pro-control.windows-process-probe.v1" as const, bindingSha256: "b".repeat(64), nonce: "c".repeat(64), port: 49_199 };
const LEASE = { schema: "easyeda-pro-control.bridge-dispatch-lease.v1" as const, begunAtEpochMs: 1001, bindingReceipt: "receipt", gatewayInstanceId: "gateway", leaseId: "lease", sessionId: "session", sessionSequence: 1 };
const PROOF = { schema: "easyeda-pro-control.windows-process-probe-result.v1", bindingSha256: PROBE.bindingSha256, sessionSha256: sha256Json(SESSION), ok: true, socketClosed: true, timerCleared: true };

function upstreamFixture(): { upstream: WindowsControlRuntimeOptions["upstream"]; calls: unknown[][]; behavior: { active: boolean; changed: boolean; lease: boolean; payload: unknown } } {
  const calls: unknown[][] = [];
  const behavior = { active: true, changed: false, lease: true, payload: PROOF as unknown };
  return {
    calls, behavior,
    upstream: {
      bridgeSessionLifecycle() {
        return {
          schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1", gatewayInstanceId: "gateway",
          activeSession: behavior.active ? { authenticatedAtEpochMs: SESSION.authenticatedAtEpochMs, authenticationReceiptSha256: SESSION.authenticationReceiptSha256, sequence: SESSION.sequence, sessionId: behavior.changed ? "replacement" : SESSION.sessionId } : null,
          publicEndpoint: { host: "127.0.0.1", port: 49_621 }, recentClosedSessions: [],
        };
      },
      currentAuthenticatedBridgeDispatchBinding() { return behavior.lease ? LEASE : undefined; },
      callTool(name, args, timeoutMs, binding) {
        calls.push([name, args, timeoutMs, binding]);
        return Promise.resolve({ content: [], structuredContent: { ok: true, result: behavior.payload } });
      },
    },
  };
}

void test("Windows runtime derives installation and helper paths without workstation user names", () => {
  const paths = deriveWindowsRuntimePaths({ pluginRoot: "/opt/easyeda-control", assetsRoot: "/mnt/d/Apps/EasyEDA/resources/app/assets", wslDistribution: "ReviewDistro" });
  assert.equal(paths.executablePath, "/mnt/d/Apps/EasyEDA/easyeda-pro.exe");
  assert.equal(paths.executableWindowsPath, String.raw`D:\Apps\EasyEDA\easyeda-pro.exe`);
  assert.equal(paths.helperWindowsPath, String.raw`\\wsl.localhost\ReviewDistro\opt\easyeda-control\scripts\windows-authority.ps1`);
  const mounted = deriveWindowsRuntimePaths({ pluginRoot: "/mnt/d/Plugins/Control", assetsRoot: paths.assetsRoot });
  assert.equal(mounted.helperWindowsPath, String.raw`D:\Plugins\Control\scripts\windows-authority.ps1`);
  for (const assetsRoot of ["/tmp/assets", "/mnt/d/Apps/../EasyEDA/resources/app/assets", "/mnt/d/Apps/EasyEDA/assets", "/mnt/d/Apps/EasyEDA/resources/app/assets/", "/mnt/d/Apps/bad\n/resources/app/assets"]) {
    assert.throws(() => deriveWindowsRuntimePaths({ pluginRoot: "/opt/control", assetsRoot, wslDistribution: "ReviewDistro" }));
  }
  assert.throws(() => deriveWindowsRuntimePaths({ pluginRoot: "/opt/control", assetsRoot: paths.assetsRoot, wslDistribution: "bad\\share" }));
});

void test("authenticated process probe requires the existing exact session and lease, and withholds nonce", async () => {
  const { upstream, calls, behavior } = upstreamFixture();
  behavior.lease = false;
  await assert.rejects(performWindowsAuthenticatedProcessProbe(upstream, SESSION, PROBE), /exact current authenticated/u);
  assert.equal(calls.length, 0);
  behavior.lease = true;
  behavior.changed = true;
  await assert.rejects(performWindowsAuthenticatedProcessProbe(upstream, SESSION, PROBE), /exact current authenticated/u);
  assert.equal(calls.length, 0);
  behavior.changed = false;
  await performWindowsAuthenticatedProcessProbe(upstream, SESSION, PROBE);
  assert.equal(calls.length, 1);
  assert.equal(calls[0]?.[0], "easyeda_execute");
  assert.deepEqual(calls[0]?.[3], LEASE);
  behavior.payload = { ...PROOF, nonce: PROBE.nonce };
  await assert.rejects(performWindowsAuthenticatedProcessProbe(upstream, SESSION, PROBE), /nonce-free cleanup proof/u);
});

void test("native ownership program uses four register arguments, exact message and receiver-bound cleanup", async () => {
  const observed: unknown[][] = [];
  const socket = {
    register(...args: [string, string, (event: unknown) => void, () => void]): void {
      assert.equal(this, socket);
      observed.push(args);
      const onMessage = args[2];
      const onOpen = args[3];
      assert.equal(args.length, 4);
      assert.equal(args[1], `ws://127.0.0.1:${PROBE.port}/${PROBE.nonce}`);
      onOpen();
      onMessage({ data: JSON.stringify({ kind: "easyeda-authority-probe", nonce: PROBE.nonce }) });
    },
    close(...args: unknown[]): void { assert.equal(this, socket); observed.push(["close", ...args]); },
  };
  const timers = {
    setTimeoutTimer(timerId: string, delay: number): boolean { assert.equal(this, timers); observed.push(["timer", timerId, delay]); return true; },
    clearTimeoutTimer(timerId: string): boolean { assert.equal(this, timers); observed.push(["clear", timerId]); return true; },
  };
  const code = buildWindowsProcessProbeCode(SESSION, PROBE);
  const result: unknown = runInNewContext(`(async () => { ${code} })()`, { eda: { sys_WebSocket: socket, sys_Timer: timers } });
  const payload: unknown = await Promise.resolve(result);
  assert.equal(JSON.stringify(payload), JSON.stringify(PROOF));
  assert.ok(observed.some((entry) => entry[0] === "close"));
  assert.ok(observed.some((entry) => entry[0] === "clear"));
  assert.equal(JSON.stringify(payload).includes(PROBE.nonce), false);
  assert.equal(code.includes("new WebSocket"), false);
  assert.equal(code.includes("socket.send"), false);
});

void test("native ownership program rejects wrong messages and cleanup failures without touching the bridge socket", async () => {
  for (const behavior of ["nonce", "extra-field", "timer-failure", "close-failure"]) {
    const closed: string[] = [];
    const socket = {
      register(socketId: string, _url: string, onMessage: (event: unknown) => void, onOpen: () => void): void {
        assert.equal(socketId, `easyeda-control-authority-probe-${PROBE.nonce}`);
        onOpen();
        const message: Record<string, unknown> = { kind: "easyeda-authority-probe", nonce: behavior === "nonce" ? "wrong" : PROBE.nonce };
        if (behavior === "extra-field") { message["extra"] = true; }
        onMessage({ data: JSON.stringify(message) });
      },
      close(socketId: string): void { closed.push(socketId); if (behavior === "close-failure") { throw new Error("synthetic failure"); } },
    };
    const timers = { setTimeoutTimer(): boolean { return true; }, clearTimeoutTimer(): boolean { return behavior !== "timer-failure"; } };
    const result: unknown = runInNewContext(`(async () => { ${buildWindowsProcessProbeCode(SESSION, PROBE)} })()`, { eda: { sys_WebSocket: socket, sys_Timer: timers } });
    await assert.rejects(Promise.resolve(result), /WINDOWS_PROBE_NOT_PROVEN/u);
    assert.deepEqual(closed, [`easyeda-control-authority-probe-${PROBE.nonce}`]);
  }
});

void test("runtime does not start helpers implicitly and binds normal close/release to its generation", async () => {
  const { upstream } = upstreamFixture();
  const calls: string[] = [];
  const launch: WindowsAuthorityLaunch = { jobId: "d".repeat(32), helperInstance: "e".repeat(32), root: { pid: 100, role: "easyeda-main", startIdentity: `win32:13333333333333333:job:${"d".repeat(32)}` } };
  const windowObservation = { jobId: launch.jobId, helperInstance: launch.helperInstance, outcome: "available" as const, hwnd: "123" };
  let startOptions: WindowsAuthorityStartOptions | undefined;
  const supervisor: WindowsAuthoritySupervisor = {
    prepareClosedSessionClose(): never { throw new Error("synthetic-close-preparation"); },
    requestClosedSessionNormalClose(): never { throw new Error("synthetic-owned-close"); },
    proveClosedSession(): never { throw new Error("synthetic-closed-proof"); },
    probeClosedSessionTermination(): never { throw new Error("synthetic-closed-probe"); },
    launch(confirmation) { assert.equal(confirmation.confirmLaunch, true); calls.push("launch"); return Promise.resolve(launch); },
    requestNormalClose(input) { assert.deepEqual(input.launch, launch); assert.equal(input.windowHandle, "123"); calls.push("normal-close"); return Promise.resolve(); },
    observeApplicationWindow(input) { assert.deepEqual(input, launch); calls.push("observe-window"); return Promise.resolve(windowObservation); },
    release() { calls.push("release"); return Promise.resolve(); },
    capture(): never { throw new Error("synthetic-capture"); },
    proveTerminated(): never { throw new Error("synthetic-termination"); },
    releaseCapture(): never { throw new Error("synthetic-capture-release"); },
  };
  const runtime = new WindowsControlRuntime({ upstream, pluginRoot: "/opt/control", assetsRoot: "/mnt/d/Apps/EasyEDA/resources/app/assets", wslDistribution: "ReviewDistro", reviewedExecutionScopeSha256: "f".repeat(64) }, {
    hashExecutable(executablePath): Promise<string> { assert.equal(executablePath, "/mnt/d/Apps/EasyEDA/easyeda-pro.exe"); calls.push("hash"); return Promise.resolve("1".repeat(64)); },
    startSupervisor(options): Promise<WindowsAuthoritySupervisor> { startOptions = options; calls.push("helper"); return Promise.resolve(supervisor); },
  });
  assert.equal(runtime.status().state, "not-launched");
  assert.deepEqual(calls, []);
  await assert.rejects(runtime.normalClose("123"), /explicitly launched/u);
  await assert.rejects(runtime.observeApplicationWindow(), /explicitly launched/u);
  await runtime.launch();
  assert.deepEqual(calls, ["hash", "helper", "launch"]);
  assert.equal(runtime.status().state, "owned");
  assert.throws(() => runtime.releaseCapture({ schema: "easyeda-pro-control.execution-authority.v1", bindingSha256: "a".repeat(64),
    authoritySha256: "b".repeat(64), capturedAt: new Date(100).toISOString(), policyId: "synthetic", policySha256: "c".repeat(64),
    processes: [], processTreeSha256: sha256Json([]) }), /synthetic-capture-release/u);
  assert.equal(startOptions?.expectedExecutable, String.raw`D:\Apps\EasyEDA\easyeda-pro.exe`);
  assert.equal(startOptions?.expectedExecutableSha256, "1".repeat(64));
  assert.deepEqual(await runtime.observeApplicationWindow(), windowObservation);
  windowObservation.helperInstance = "9".repeat(32);
  await assert.rejects(runtime.observeApplicationWindow(), /identity or window changed/u);
  windowObservation.helperInstance = launch.helperInstance;
  await runtime.normalClose("123");
  assert.equal(runtime.status().state, "owned");
  await runtime.release();
  assert.equal(runtime.status().state, "released");
  await assert.rejects(runtime.launch(), /current state/u);
  await assert.rejects(runtime.observeApplicationWindow(), /explicitly launched/u);
  assert.deepEqual(calls, ["hash", "helper", "launch", "observe-window", "observe-window", "normal-close", "release"]);
});

void test("capability-pinned launch refuses executable substitution before starting its helper", async () => {
  const { upstream } = upstreamFixture();
  const options = { upstream, pluginRoot: "/opt/control", assetsRoot: "/mnt/d/Apps/EasyEDA/resources/app/assets",
    wslDistribution: "ReviewDistro", reviewedExecutionScopeSha256: "f".repeat(64), expectedExecutableSha256: "1".repeat(64) };
  let helperStarted = false;
  const runtime = new WindowsControlRuntime(options, {
    hashExecutable: (): Promise<string> => Promise.resolve("2".repeat(64)),
    startSupervisor(): never { helperStarted = true; throw new Error("Helper must not start."); },
  });
  await assert.rejects(runtime.launch(), /differs from the reviewed launch profile/u);
  assert.equal(helperStarted, false);
  assert.equal(runtime.status().state, "launch-unknown");
  await assert.rejects(runtime.launch(), /current state/u);
  assert.throws(() => new WindowsControlRuntime({ ...options, expectedExecutableSha256: "invalid" }), /executable identity/u);
});

void test("native probe timeout is bounded and closes only its unique probe socket", async () => {
  let deadline: (() => void) | undefined;
  const closed: string[] = [];
  const socket = {
    register(): void {
      // Deliberately never opens: exercise the native deadline.
    },
    close(socketId: string): void { closed.push(socketId); },
  };
  const timers = {
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- This fixture captures the native timer callback to exercise its timeout without waiting.
    setTimeoutTimer(_id: string, delay: number, callback: () => void): boolean { assert.equal(delay, 9000); deadline = callback; return true; },
    clearTimeoutTimer(): boolean { return true; },
  };
  const result: unknown = runInNewContext(`(async () => { ${buildWindowsProcessProbeCode(SESSION, PROBE)} })()`, { eda: { sys_WebSocket: socket, sys_Timer: timers } });
  assert.ok(deadline);
  deadline();
  await assert.rejects(Promise.resolve(result), /WINDOWS_PROBE_NOT_PROVEN/u);
  assert.deepEqual(closed, [`easyeda-control-authority-probe-${PROBE.nonce}`]);
});

void test("a session switch during the authenticated probe invalidates the result", async () => {
  const fixture = upstreamFixture();
  const upstream: WindowsControlRuntimeOptions["upstream"] = {
    ...fixture.upstream,
    async callTool(name, args, timeoutMs, binding) {
      const result = await fixture.upstream.callTool(name, args, timeoutMs, binding);
      fixture.behavior.changed = true;
      return result;
    },
  };
  await assert.rejects(performWindowsAuthenticatedProcessProbe(upstream, SESSION, PROBE), /exact current authenticated/u);
  assert.equal(fixture.calls.length, 1);
});

function closureRuntimeFixture(): {
  runtime: WindowsControlRuntime;
  authority: ReturnType<typeof closedSessionFixture>;
  bridge: ReturnType<typeof upstreamFixture>;
} {
  const authority = closedSessionFixture(), bridge = upstreamFixture();
  const runtime = new WindowsControlRuntime({ upstream: bridge.upstream, pluginRoot: "/opt/control",
    assetsRoot: "/mnt/d/Apps/EasyEDA/resources/app/assets", wslDistribution: "ReviewDistro",
    reviewedExecutionScopeSha256: "e".repeat(64) }, {
    hashExecutable: (): Promise<string> => Promise.resolve("d".repeat(64)),
    startSupervisor: (): Promise<WindowsAuthoritySupervisor> => Promise.resolve(authority.supervisor),
  });
  return { runtime, authority, bridge };
}

async function runtimeClosedBinding(runtime: WindowsControlRuntime,
  input: ExecutionAuthorityCaptureInput = INPUT): Promise<Omit<ClosedSessionBinding, "launch">> {
  const executionAuthority = await runtime.capture(input);
  return { operationId: input.operationId, phase: input.orphanPhase, challengeAttempt: input.challengeAttempt,
    bridgeSession: input.bridgeSession, runtimeIdentity: input.runtimeIdentity, executionAuthority };
}

void test("closed-session runtime wrappers bind owned launch and never reconnect a terminated session", async () => {
  const { runtime, authority, bridge } = closureRuntimeFixture();
  await runtime.launch();
  const binding = await runtimeClosedBinding(runtime);
  const intent = await runtime.prepareClosedSessionClose({ ...binding, windowHandle: "12345" });
  assert.throws(() => runtime.requestClosedSessionNormalClose({ ...binding,
    intent: { ...intent, windowHandle: "54321" }, confirmNormalClose: true }), /not prepared/u);
  const closeReceipt = await runtime.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true });
  bridge.behavior.active = false;
  bridge.behavior.lease = false;
  const proof = await runtime.proveClosedSession({ ...binding, intent, closeReceipt });
  assert.equal(await assertClosedSessionCopyAuthority(proof), proof);
  await runtime.launch();
  const cached = await runtime.proveClosedSession({ ...binding, intent, closeReceipt });
  assert.equal(cached.proofSha256, proof.proofSha256);
  assert.equal(await assertClosedSessionTerminationProof(proof), proof);
  await assert.rejects(assertClosedSessionCopyAuthority(proof), /retained|intervening/u);
  assert.equal(authority.requests.filter((entry) => entry["action"] === "normal-close").length, 1);
  assert.equal(authority.requests.filter((entry) => entry["action"] === "prove-terminated").length, 1);
  assert.deepEqual(bridge.calls, []);
});

void test("runtime refuses an intent from another runtime and refuses all closure methods after release", async () => {
  const first = closureRuntimeFixture(), second = closureRuntimeFixture();
  await first.runtime.launch();
  const binding = await runtimeClosedBinding(first.runtime);
  const intent = await first.runtime.prepareClosedSessionClose({ ...binding, windowHandle: "12345" });
  await assert.rejects(second.runtime.prepareClosedSessionClose({ ...binding, windowHandle: "12345" }), /explicitly launched/u);
  assert.deepEqual(second.authority.requests, []);
  await second.runtime.launch();
  assert.throws(() => second.runtime.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true }), /not prepared/u);
  const closeReceipt = await first.runtime.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true });
  await first.runtime.release();
  await assert.rejects(first.runtime.prepareClosedSessionClose({ ...binding, windowHandle: "12345" }), /explicitly launched/u);
  assert.throws(() => first.runtime.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true }), /explicitly launched/u);
  assert.throws(() => first.runtime.proveClosedSession({ ...binding, intent, closeReceipt }), /explicitly launched/u);
  assert.equal(second.authority.requests.length, 1);
  assert.deepEqual(first.bridge.calls, []);
  assert.deepEqual(second.bridge.calls, []);
});

void test("runtime refuses ownership drift after awaited intent preparation", async () => {
  const authority = closedSessionFixture(), bridge = upstreamFixture();
  let preparedIntent: Awaited<ReturnType<WindowsAuthoritySupervisor["prepareClosedSessionClose"]>> | undefined;
  const runtimeOwner: { value: WindowsControlRuntime | undefined } = { value: undefined };
  const supervisor: WindowsAuthoritySupervisor = { ...authority.supervisor,
    async prepareClosedSessionClose(input) {
      preparedIntent = await authority.supervisor.prepareClosedSessionClose(input);
      const owner = runtimeOwner.value;
      assert.ok(owner);
      await owner.launch();
      return preparedIntent;
    },
  };
  const runtime = new WindowsControlRuntime({ upstream: bridge.upstream, pluginRoot: "/opt/control",
    assetsRoot: "/mnt/d/Apps/EasyEDA/resources/app/assets", wslDistribution: "ReviewDistro",
    reviewedExecutionScopeSha256: "e".repeat(64) }, {
    hashExecutable: (): Promise<string> => Promise.resolve("d".repeat(64)),
    startSupervisor: (): Promise<WindowsAuthoritySupervisor> => Promise.resolve(supervisor),
  });
  runtimeOwner.value = runtime;
  await runtime.launch();
  const binding = await runtimeClosedBinding(runtime);
  await assert.rejects(runtime.prepareClosedSessionClose({ ...binding, windowHandle: "12345" }), /ownership changed/u);
  assert.ok(preparedIntent);
  const intent = preparedIntent;
  assert.throws(() => runtime.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true }), /not prepared/u);
  assert.equal(authority.requests.filter((entry) => entry["action"] === "normal-close").length, 0);
  assert.deepEqual(bridge.calls, []);
});
