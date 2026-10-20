import assert from "node:assert/strict";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { createCurrentPcbDiagnosticInstallationPlan } from "../src/current-pcb-diagnostic-installation.ts";
import type { CurrentPcbDiagnosticInstallation } from "../src/current-pcb-diagnostic-installation.ts";
import { CurrentPcbDiagnosticLifecycle } from "../src/current-pcb-diagnostic-lifecycle.ts";
import type { CurrentPcbDiagnosticLifecycleDependencies, CurrentPcbDiagnosticLifecycleOptions, CurrentPcbDiagnosticLifecycleOwner } from "../src/current-pcb-diagnostic-lifecycle.ts";
import { acquireCurrentPcbDiagnosticLaunchExclusion, assertCurrentPcbDiagnosticLaunchExclusion, assertNoUnresolvedCurrentPcbDiagnosticLaunches,
  diagnosticLifecycleNoProcessReleaseProofSchema,
  publishCurrentPcbDiagnosticLifecycleRecord, readCurrentPcbDiagnosticLifecycles, releaseCurrentPcbDiagnosticLaunchExclusion,
  reserveCurrentPcbDiagnosticLifecycle, withCurrentPcbDiagnosticLaunchExclusion } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";

function directory(id: string): string {
  const root = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.ok(root !== undefined && root.includes("easyeda-test-control-")); assert.match(id, /^diagnostic-test-[a-z0-9-]+$/u);
  return join(root, "pcb-diagnostic-lifecycle-v1", id);
}
function launch(id: string): Record<string, unknown> {
  return { action: "launch", operationId: id, confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true };
}
function fixture(context: TestContext, id: string, dependencies: CurrentPcbDiagnosticLifecycleDependencies = {}): {
  coordinator: CurrentPcbDiagnosticLifecycle; owner: CurrentPcbDiagnosticLifecycleOwner;
  options: CurrentPcbDiagnosticLifecycleOptions; calls: string[];
  state: { bound: boolean; closed: boolean; terminated: boolean; released: boolean; failLaunch: boolean;
    failClose: boolean; cleanupOnly: boolean; failOther: boolean; failAllowed: boolean; installationDrift: boolean;
    rootless: "not-issued" | "native-refused" | null; creationState: "not-entered" | "returned-false"; noProcessHealthy: boolean };
  request: (action: string, extra?: Record<string, unknown>) => Promise<Record<string, unknown>>;
} {
  const calls: string[] = [];
  const state: { bound: boolean; closed: boolean; terminated: boolean; released: boolean; failLaunch: boolean;
    failClose: boolean; cleanupOnly: boolean; failOther: boolean; failAllowed: boolean; installationDrift: boolean;
    rootless: "not-issued" | "native-refused" | null; creationState: "not-entered" | "returned-false"; noProcessHealthy: boolean } = {
    bound: false, closed: false, terminated: false, released: false, failLaunch: false,
    failClose: false, cleanupOnly: false, failOther: false, failAllowed: false, installationDrift: false,
    rootless: null, creationState: "not-entered", noProcessHealthy: true };
  const binding = (): { helperInstance: string; jobId: string; rootPid: number; rootCreated: string } => ({
    helperInstance: "b".repeat(32), jobId: "c".repeat(32), rootPid: 123,
    rootCreated: state.cleanupOnly ? "0" : "123456789012345",
  });
  const owner: CurrentPcbDiagnosticLifecycleOwner = {
    status: () => ({ helperPid: 456, binding: state.bound ? binding() : null, failure: null, busy: false,
      launchConsumed: state.bound, closeConsumed: state.closed, released: state.released, helperClosed: state.released,
      browserObservationConsumed: calls.includes("browser"), frameInspectionConsumed: calls.includes("frames"),
      scriptInspectionConsumed: calls.includes("script"), diagnosticFailure: null,
      noProcessCleanupAvailable: state.rootless !== null && calls.includes("launch") && state.noProcessHealthy && !state.released,
      cleanupOnly: state.cleanupOnly, frameWorkerVerified: false, executionAuthorized: false }),
    launch: async () => {
      calls.push("launch");
      const intent = await readFile(join(directory(id), "intent.json"), "utf8"); assert.match(intent, /diagnostic-launch-intent/u);
      if (state.rootless !== null) { throw new Error("synthetic settled rootless refusal"); }
      state.bound = true;
      if (state.failLaunch || state.cleanupOnly) { throw new Error("synthetic lost launch acknowledgment"); }
      return binding();
    },
    observeApplicationWindow: () => { calls.push("window"); return Promise.resolve("12345"); },
    requestNormalClose: async hwnd => {
      calls.push("close"); assert.equal(hwnd, "12345");
      const intent = await readFile(join(directory(id), "close-intent.json"), "utf8"); assert.match(intent, /12345/u);
      state.closed = true;
      if (state.failClose) { throw new Error("synthetic lost close acknowledgment"); }
    },
    observeTermination: () => { calls.push("termination"); return Promise.resolve(state.terminated); },
    releaseClosed: async () => {
      calls.push("release"); assert.equal(state.terminated, true);
      const intent = await readFile(join(directory(id), "release-intent.json"), "utf8"); assert.match(intent, /diagnostic-release-intent/u);
      state.released = true;
    },
    releaseUnlaunched: async () => {
      calls.push("release-unlaunched"); assert.equal(state.bound, false);
      const intent = await readFile(join(directory(id), "unlaunched-release-intent.json"), "utf8");
      assert.match(intent, /nativeLaunchInvoked/u); state.released = true;
    },
    releaseNoProcess: async () => {
      calls.push("release-no-process"); assert.equal(state.bound, false); assert.ok(state.rootless !== null && state.noProcessHealthy);
      const intent = await readFile(join(directory(id), "no-process-release-intent.json"), "utf8");
      assert.match(intent, /originalLaunchMethodInvoked/u); state.released = true;
      return { launchRequestOutcome: state.rootless, creationState: state.creationState, processCreated: false, released: true };
    },
    browserObservation: () => { calls.push("browser"); return Promise.resolve({ targets: [{ targetId: "target-1" }], executionAuthorized: false }); },
    inspectFrames: targetId => { calls.push("frames"); assert.equal(targetId, "target-1"); return Promise.resolve({ frames: [{ id: "frame-1" }], executionAuthorized: false }); },
    inspectScript: (frameId, profile) => {
      calls.push("script"); assert.equal(frameId, "frame-1"); assert.equal(profile.family, "pcb");
      return Promise.resolve({ sourceVerified: true, family: profile.family, executionAuthorized: false });
    },
  };
  const options: CurrentPcbDiagnosticLifecycleOptions = {
    pluginRoot: "/mnt/c/Reviewed/Plugin", assetsRoot: "/mnt/c/Reviewed/EasyEDA/resources/app/assets",
    powershellSha256: "d".repeat(64), powershellBytes: 123,
    assertLocalAllowed: (): void => {
      // The fixture has no mutable facade collaborators.
    },
    assertAllowed: (): Promise<void> => state.failAllowed ? Promise.reject(new Error("synthetic admission refused")) : Promise.resolve(),
    assertOtherLaunchesSettled: (): Promise<void> => state.failOther ? Promise.reject(new Error("synthetic unresolved project")) : Promise.resolve(),
  };
  const coordinator = new CurrentPcbDiagnosticLifecycle(options, {
    verifyInstallation: (): Promise<CurrentPcbDiagnosticInstallation> => Promise.resolve({ ...createCurrentPcbDiagnosticInstallationPlan(options), facadeSha256: (state.installationDrift ? "e" : "a").repeat(64) }),
    allocateOwner: (): Promise<CurrentPcbDiagnosticLifecycleOwner> => { calls.push("allocate"); return Promise.resolve(owner); }, ...dependencies,
  });
  async function request(action: string, extra: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const inspected = await coordinator.run({ action: "inspect", operationId: id });
    assert.equal(typeof inspected["bindingSha256"], "string");
    return coordinator.run({ action, operationId: id, expectedBindingSha256: inspected["bindingSha256"], ...extra });
  }
  context.after(async () => {
    state.failAllowed = false; state.failOther = false; state.installationDrift = false; state.noProcessHealthy = true;
    const inspected = await coordinator.run({ action: "inspect", operationId: id });
    if (state.released && !["released", "not-dispatched", "no-process-released"].includes(String(inspected["state"]))) {
      await coordinator.run({ action: "settle-records", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
    }
    if (typeof inspected["bindingSha256" ] === "string" && !state.released) {
      state.terminated = true;
      await request("observe-termination"); await request("release-closed");
    }
    if (!state.bound && !state.released && typeof inspected["intentSha256"] === "string" && inspected["state"] !== "not-dispatched") {
      await coordinator.run({ action: state.rootless === null ? "cleanup-unlaunched" : "cleanup-no-process", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
    }
    await rm(directory(id), { recursive: true, force: true });
  });
  return { coordinator, owner, options, calls, state, request };
}

void test("private launch gate retains an original lexical lease and rejects JSON copies and competing callers", async () => {
  const original = acquireCurrentPcbDiagnosticLaunchExclusion();
  try {
    assertCurrentPcbDiagnosticLaunchExclusion(original);
    assert.throws(() => { releaseCurrentPcbDiagnosticLaunchExclusion({ ...original }); }, /LEASE_CHANGED/u);
    await assert.rejects(withCurrentPcbDiagnosticLaunchExclusion(() => Promise.resolve()), /LAUNCH_BUSY/u);
    assertCurrentPcbDiagnosticLaunchExclusion(original);
  } finally { releaseCurrentPcbDiagnosticLaunchExclusion(original); }
  assert.throws(() => { releaseCurrentPcbDiagnosticLaunchExclusion(original); }, /LEASE_CHANGED/u);
  await withCurrentPcbDiagnosticLaunchExclusion(() => Promise.resolve());
});

void test("staged diagnostics retain bounded original observations, fixed profiles and one-shot intents", async context => {
  const id = "diagnostic-test-observations", value = fixture(context, id);
  await value.coordinator.run(launch(id));
  await assert.rejects(value.request("inspect-frames", { targetId: "target-1" }), /BROWSER_OBSERVATION_REQUIRED/u);
  await value.request("browser-observation");
  await assert.rejects(value.request("browser-observation"), /OBSERVATION_CONSUMED/u);
  await value.request("inspect-frames", { targetId: "target-1" });
  const result = await value.request("inspect-script", { frameId: "frame-1", family: "pcb" });
  assert.deepEqual(result["result"], { sourceVerified: true, family: "pcb", executionAuthorized: false });
  assert.deepEqual(value.calls.filter(call => ["browser", "frames", "script"].includes(call)), ["browser", "frames", "script"]);
  await assert.rejects(value.request("inspect-script", { frameId: "frame-1", family: "ui" }), /OBSERVATION_CONSUMED/u);
  const historical = await new CurrentPcbDiagnosticLifecycle(value.options).run({ action: "inspect", operationId: id, observation: "browser" });
  const observations = historical["observations"];
  assert.ok(Array.isArray(observations));
  assert.equal(observations.filter((item: unknown) => typeof item === "object" && item !== null && "result" in item && item.result !== undefined).length, 1);
  const operations = await readCurrentPcbDiagnosticLifecycles();
  assert.ok(operations.find(operation => operation.operationId === id)?.records["script-result.json"]);
});

void test("observation publication failure retains its exact successful return without repeating the native stage", async context => {
  const id = "diagnostic-test-observation-publication";
  let fail = true;
  const value = fixture(context, id, { publishRecord: async (operationId, name, record) => {
    if (name === "browser-result.json" && fail) { fail = false; throw new Error("synthetic result publication failure"); }
    await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, record);
  } });
  await value.coordinator.run(launch(id));
  await assert.rejects(value.request("browser-observation"), /result publication failure/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id, observation: "browser" });
  assert.match(JSON.stringify(inspected["observations"]), /target-1/u);
  await assert.rejects(value.request("browser-observation"), /OBSERVATION_CONSUMED/u);
  await value.coordinator.run({ action: "settle-records", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
  assert.equal(value.calls.filter(call => call === "browser").length, 1);
  await value.request("inspect-frames", { targetId: "target-1" });
});

void test("original cleanup does not require startup admission after diagnostic launch", async context => {
  const id = "diagnostic-test-local-cleanup", value = fixture(context, id);
  await value.coordinator.run(launch(id)); value.state.failAllowed = true; value.state.failOther = true;
  await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
  value.state.terminated = true; await value.request("observe-termination"); await value.request("release-closed");
  assert.equal(value.coordinator.hasActiveReservation(), false);
});

void test("settled rootless refusal releases only the original owner with a distinct durable no-process proof", async context => {
  const combinations = [["not-issued", "not-entered"], ["native-refused", "not-entered"], ["native-refused", "returned-false"]] as const;
  for (const [index, [outcome, creationState]] of combinations.entries()) {
    const id = `diagnostic-test-no-process-${String(index)}`, value = fixture(context, id);
    value.state.rootless = outcome; value.state.creationState = creationState;
    await assert.rejects(value.coordinator.run(launch(id)), /settled rootless refusal/u);
    const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
    assert.equal(inspected["noProcessCleanupAvailable"], true); assert.equal(inspected["bindingSha256"], undefined);
    await assert.rejects(value.coordinator.run({ action: "cleanup-unlaunched", operationId: id, expectedIntentSha256: inspected["intentSha256"] }), /NONDISPATCH_NOT_PROVED/u);
    value.state.failAllowed = true; value.state.failOther = true; value.state.installationDrift = true;
    const result = await value.coordinator.run({ action: "cleanup-no-process", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
    assert.equal(result["state"], "no-process-released");
    assert.deepEqual(result["noProcessReleaseProof"], { launchRequestOutcome: outcome, creationState, processCreated: false, released: true });
    assert.equal(value.coordinator.hasActiveReservation(), false); await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
    const operations = await readCurrentPcbDiagnosticLifecycles();
    const records = operations.find(operation => operation.operationId === id)?.records;
    assert.ok(records?.["no-process-released.json"]); assert.equal(records["not-dispatched.json"], undefined);
    assert.equal(value.calls.filter(call => call === "release-no-process").length, 1);
    await assert.rejects(value.coordinator.run({ action: "cleanup-no-process", operationId: id, expectedIntentSha256: inspected["intentSha256"] }), /ORIGINAL_ATTEMPT_REQUIRED/u);
  }
  assert.equal(diagnosticLifecycleNoProcessReleaseProofSchema.safeParse({ launchRequestOutcome: "not-issued", creationState: "returned-false", processCreated: false, released: true }).success, false);
});

void test("rootless release publication settles exact terminal bytes without replaying native release", async context => {
  const id = "diagnostic-test-no-process-publication";
  let fail = true;
  const value = fixture(context, id, { publishRecord: async (operationId, name, record) => {
    if (name === "no-process-released.json" && fail) { fail = false; throw new Error("synthetic no-process publication failure"); }
    await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, record);
  } });
  value.state.rootless = "native-refused";
  await assert.rejects(value.coordinator.run(launch(id)), /settled rootless refusal/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  await assert.rejects(value.coordinator.run({ action: "cleanup-no-process", operationId: id, expectedIntentSha256: inspected["intentSha256"] }), /publication failure/u);
  assert.equal(value.coordinator.hasActiveReservation(), true); await assert.rejects(assertNoUnresolvedCurrentPcbDiagnosticLaunches(), /UNRESOLVED_LAUNCH/u);
  const settled = await value.coordinator.run({ action: "settle-records", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
  assert.equal(settled["state"], "no-process-released"); assert.equal(value.coordinator.hasActiveReservation(), false);
  assert.equal(value.calls.filter(call => call === "release-no-process").length, 1); await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
});

void test("rootless cleanup refuses unhealthy transport, lost original owner, wrong intent and corrupt journals", async context => {
  const id = "diagnostic-test-no-process-refusals", value = fixture(context, id);
  value.state.rootless = "native-refused";
  await assert.rejects(value.coordinator.run(launch(id)), /settled rootless refusal/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  const request = { action: "cleanup-no-process", operationId: id, expectedIntentSha256: inspected["intentSha256"] };
  await assert.rejects(new CurrentPcbDiagnosticLifecycle(value.options).run(request), /ORIGINAL_ATTEMPT_REQUIRED/u);
  await assert.rejects(value.coordinator.run({ ...request, expectedIntentSha256: "f".repeat(64) }), /ORIGINAL_ATTEMPT_REQUIRED/u);
  value.state.noProcessHealthy = false;
  await assert.rejects(value.coordinator.run(request), /NO_PROCESS_RELEASE_UNAVAILABLE/u); value.state.noProcessHealthy = true;
  const path = join(directory(id), "intent.json");
  const bytes = await readFile(path);
  try {
    await writeFile(path, "{"); await assert.rejects(value.coordinator.run(request));
    assert.equal(value.calls.includes("release-no-process"), false);
  } finally { await writeFile(path, bytes); }
  await value.coordinator.run(request);
});

void test("post-create bindings cannot enter rootless release", async context => {
  const id = "diagnostic-test-no-process-bound", value = fixture(context, id);
  await value.coordinator.run(launch(id));
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  await assert.rejects(value.coordinator.run({ action: "cleanup-no-process", operationId: id, expectedIntentSha256: inspected["intentSha256"] }), /ORIGINAL_ROOTLESS_OWNER_REQUIRED/u);
  assert.equal(value.calls.includes("release-no-process"), false);
});

void test("private diagnostic inventory preserves partial reservations and refuses unknown or malformed files", async context => {
  const id = "diagnostic-test-inventory";
  context.after(async () => { await rm(directory(id), { recursive: true, force: true }); });
  await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
  await reserveCurrentPcbDiagnosticLifecycle(id);
  await assert.rejects(assertNoUnresolvedCurrentPcbDiagnosticLaunches(), /UNRESOLVED_LAUNCH/u);
  const operations = await readCurrentPcbDiagnosticLifecycles(); assert.deepEqual(operations, [{ operationId: id, records: {} }]);
  await writeFile(join(directory(id), "unknown.json"), "{}", { mode: 0o600, flag: "wx" });
  await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /UNKNOWN_RECORD/u);
  await rm(join(directory(id), "unknown.json"));
  await writeFile(join(directory(id), "intent.json"), "{", { mode: 0o600, flag: "wx" });
  await assert.rejects(readCurrentPcbDiagnosticLifecycles());
  await assert.rejects(reserveCurrentPcbDiagnosticLifecycle(id), /EEXIST/u);
});

void test("synthetic original-owner lifecycle journals every dispatch and denies broader authority", async context => {
  const id = "diagnostic-test-complete", value = fixture(context, id);
  const result = await value.coordinator.run(launch(id));
  assert.equal(result["state"], "launched"); assert.equal(result["designExecutionAuthorized"], false);
  assert.equal(result["frameWorkerVerified"], false); assert.deepEqual(value.calls, ["allocate", "launch"]);
  await assert.rejects(value.coordinator.run(launch(id)), /LAUNCH_CONSUMED/u);
  await assert.rejects(withCurrentPcbDiagnosticLaunchExclusion(() => Promise.resolve()), /LAUNCH_BUSY/u);
  await assert.rejects(assertNoUnresolvedCurrentPcbDiagnosticLaunches(), /UNRESOLVED_LAUNCH/u);
  const window = await value.request("observe-window"); assert.equal(window["hwnd"], "12345");
  const closed = await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
  assert.equal(closed["closeAcknowledged"], true); assert.equal(closed["state"], "launched");
  await assert.rejects(value.request("normal-close", { hwnd: "12345", confirmNormalClose: true }), /CLOSE_CONSUMED/u);
  const ongoing = await value.request("observe-termination"); assert.equal(ongoing["terminationObserved"], false);
  await assert.rejects(value.request("release-closed"), /RELEASE_UNAVAILABLE/u);
  value.state.terminated = true;
  const terminated = await value.request("observe-termination"); assert.equal(terminated["state"], "terminated");
  await assert.rejects(withCurrentPcbDiagnosticLaunchExclusion(() => Promise.resolve()), /LAUNCH_BUSY/u);
  const released = await value.request("release-closed"); assert.equal(released["state"], "released");
  await assertNoUnresolvedCurrentPcbDiagnosticLaunches(); await withCurrentPcbDiagnosticLaunchExclusion(() => Promise.resolve());
  assert.equal(value.calls.filter(action => action === "launch").length, 1);
  assert.equal(value.calls.filter(action => action === "close").length, 1);
  assert.equal(value.calls.filter(action => action === "release").length, 1);
});

void test("request schemas and prelaunch guards reject caller executable paths and unresolved project owners without reservation", async context => {
  const id = "diagnostic-test-preflight", value = fixture(context, id);
  await assert.rejects(value.coordinator.run({ ...launch(id), executable: "C:\\Other\\easyeda-pro.exe" }));
  await assert.rejects(value.coordinator.run({ ...launch(id), acceptExistingProfileEffects: false }));
  value.state.failOther = true;
  await assert.rejects(value.coordinator.run(launch(id)), /unresolved project/u); value.state.failOther = false;
  value.state.failAllowed = true;
  await assert.rejects(value.coordinator.run(launch(id)), /admission refused/u); value.state.failAllowed = false;
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id }); assert.equal(inspected["state"], "not-found");
  assert.deepEqual(value.calls, []);
  await value.coordinator.run(launch(id));
});

void test("mandatory ordinary-launch inventory blocks diagnostic allocation even when supplied project guard passes", async context => {
  const id = "diagnostic-test-ordinary", value = fixture(context, id);
  const root = process.env["EASYEDA_CONTROL_DATA_DIR"]; assert.ok(root !== undefined && root.includes("easyeda-test-control-"));
  const ordinary = join(root, "ordinary-launch-v1", "diagnostic-test-partial-ordinary");
  await mkdir(ordinary, { recursive: true, mode: 0o700 });
  try { await assert.rejects(value.coordinator.run(launch(id)), /unresolved ordinary/u); assert.deepEqual(value.calls, []); }
  finally { await rm(ordinary, { recursive: true }); }
  await value.coordinator.run(launch(id));
});

void test("missing launch acknowledgment retains original binding for cleanup and cannot replay", async context => {
  const id = "diagnostic-test-lost-launch", value = fixture(context, id);
  value.state.failLaunch = true;
  await assert.rejects(value.coordinator.run(launch(id)), /lost launch acknowledgment/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  assert.equal(inspected["state"], "launch-unknown"); assert.equal(inspected["launchAcknowledged"], false);
  await assert.rejects(value.coordinator.run(launch(id)), /LAUNCH_CONSUMED/u);
  await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
});

void test("cleanup-only native creation identity never becomes an acknowledged diagnostic launch", async context => {
  const id = "diagnostic-test-cleanup-only", value = fixture(context, id); value.state.cleanupOnly = true;
  await assert.rejects(value.coordinator.run(launch(id)), /lost launch acknowledgment/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  assert.equal(inspected["state"], "cleanup-only"); assert.equal(inspected["launchAcknowledged"], false);
  await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
});

void test("missing normal-close acknowledgment consumes close but preserves original termination and release", async context => {
  const id = "diagnostic-test-lost-close", value = fixture(context, id); await value.coordinator.run(launch(id));
  value.state.failClose = true;
  await assert.rejects(value.request("normal-close", { hwnd: "12345", confirmNormalClose: true }), /lost close acknowledgment/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  assert.equal(inspected["closeAttemptConsumed"], true); assert.equal(inspected["closeAcknowledged"], false);
  await assert.rejects(value.request("normal-close", { hwnd: "12345", confirmNormalClose: true }), /CLOSE_CONSUMED/u);
  assert.equal(value.calls.filter(action => action === "close").length, 1);
});

void test("uncertain close-intent publication consumes attempt before any native close", async context => {
  const id = "diagnostic-test-close-publication";
  const value = fixture(context, id, {
    publishRecord: async (operationId, name, record) => {
      await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, record);
      if (name === "close-intent.json") { throw new Error("synthetic lost publication acknowledgment"); }
    },
  });
  await value.coordinator.run(launch(id));
  await assert.rejects(value.request("normal-close", { hwnd: "12345", confirmNormalClose: true }), /lost publication/u);
  await assert.rejects(value.request("normal-close", { hwnd: "12345", confirmNormalClose: true }), /CLOSE_CONSUMED/u);
  assert.equal(value.calls.includes("close"), false);
});

void test("restart inspection cannot reconstruct an original owner or bypass method identity", async context => {
  const id = "diagnostic-test-owner", value = fixture(context, id); await value.coordinator.run(launch(id));
  const restarted = new CurrentPcbDiagnosticLifecycle(value.options, {
    allocateOwner: (): never => { throw new Error("must not allocate"); },
    verifyInstallation: (): never => { throw new Error("must not verify before original owner"); },
  });
  const inspected = await restarted.run({ action: "inspect", operationId: id });
  await assert.rejects(restarted.run({ action: "observe-termination", operationId: id, expectedBindingSha256: inspected["bindingSha256"] }), /ORIGINAL_OWNER/u);
  const replacement = context.mock.method(value.owner, "observeTermination", () => Promise.resolve(true));
  try { await assert.rejects(value.request("observe-termination"), /OWNER_CHANGED/u); }
  finally { replacement.mock.restore(); }
  assert.equal(value.calls.includes("close"), false);
});

void test("startup installation drift does not strand original native cleanup handles", async context => {
  const id = "diagnostic-test-cleanup-drift", value = fixture(context, id); await value.coordinator.run(launch(id));
  value.state.installationDrift = true;
  const closed = await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
  assert.equal(closed["closeAcknowledged"], true);
  value.state.terminated = true; await value.request("observe-termination"); await value.request("release-closed");
});

void test("failed binding publication settles original bytes without native launch replay", async context => {
  const id = "diagnostic-test-binding-settlement"; let fail = true;
  const value = fixture(context, id, { publishRecord: async (operationId, name, record) => {
    if (name === "binding.json" && fail) { fail = false; throw new Error("synthetic binding publication failure"); }
    await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, record);
  } });
  await assert.rejects(value.coordinator.run(launch(id)), /binding publication failure/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  assert.equal(inspected["publicationSettlementAvailable"], true);
  const settled = await value.coordinator.run({ action: "settle-records", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
  assert.equal(settled["state"], "launched");
  await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
  assert.equal(value.calls.filter(action => action === "launch").length, 1);
});

void test("failed release publication settles exact terminal evidence without repeating native release", async context => {
  const id = "diagnostic-test-release-settlement"; let fail = true;
  const value = fixture(context, id, { publishRecord: async (operationId, name, record) => {
    if (name === "released.json" && fail) { fail = false; throw new Error("synthetic release publication failure"); }
    await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, record);
  } });
  await value.coordinator.run(launch(id)); value.state.terminated = true; await value.request("observe-termination");
  await assert.rejects(value.request("release-closed"), /release publication failure/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  const settled = await value.coordinator.run({ action: "settle-records", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
  assert.equal(settled["state"], "released"); assert.equal(value.calls.filter(action => action === "release").length, 1);
  await assertNoUnresolvedCurrentPcbDiagnosticLaunches(); await withCurrentPcbDiagnosticLaunchExclusion(() => Promise.resolve());
});

void test("failure after helper allocation permits only original proved-unlaunched cleanup", async context => {
  const id = "diagnostic-test-unlaunched"; let calls = 0;
  const value = fixture(context, id, { verifyInstallation: options => {
    calls += 1;
    if (calls === 2) { return Promise.reject(new Error("synthetic pre-dispatch installation failure")); }
    return Promise.resolve({ ...createCurrentPcbDiagnosticInstallationPlan(options), facadeSha256: "a".repeat(64) });
  } });
  await assert.rejects(value.coordinator.run(launch(id)), /pre-dispatch installation failure/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  const cleaned = await value.coordinator.run({ action: "cleanup-unlaunched", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
  assert.equal(cleaned["state"], "not-dispatched"); assert.deepEqual(value.calls, ["allocate", "release-unlaunched"]);
  await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
});

void test("wrong HWND and altered receipt chains cannot issue normal close", async context => {
  const id = "diagnostic-test-chain", value = fixture(context, id); await value.coordinator.run(launch(id));
  await assert.rejects(value.request("normal-close", { hwnd: "54321", confirmNormalClose: true }), /WINDOW_CHANGED/u);
  const path = join(directory(id), "binding.json");
  const bytes = await readFile(path);
  const altered: unknown = JSON.parse(bytes.toString("utf8")); assert.ok(altered !== null && typeof altered === "object" && "intentSha256" in altered);
  altered.intentSha256 = "f".repeat(64);
  await writeFile(path, `${JSON.stringify(altered)}\n`);
  try { await assert.rejects(value.coordinator.run({ action: "inspect", operationId: id }), /BINDING_CHAIN/u); }
  finally { await writeFile(path, bytes); }
  assert.equal(value.calls.includes("close"), false);
});

void test("uncertain launch intent blocks repetition and can settle original known nondispatch", async context => {
  const id = "diagnostic-test-last-intent";
  const value = fixture(context, id, {
    publishRecord: async (operationId, name, record) => {
      await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, record);
      if (name === "intent.json") { throw new Error("synthetic uncertain intent"); }
    },
  });
  await assert.rejects(value.coordinator.run(launch(id)), /uncertain intent/u);
  await assert.rejects(value.coordinator.run(launch(id)), /LAUNCH_CONSUMED/u);
  await assert.rejects(assertNoUnresolvedCurrentPcbDiagnosticLaunches(), /UNRESOLVED_LAUNCH/u);
  await assert.rejects(withCurrentPcbDiagnosticLaunchExclusion(() => Promise.resolve()), /LAUNCH_BUSY/u);
  assert.deepEqual(value.calls, []);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  const cleaned = await value.coordinator.run({ action: "cleanup-unlaunched", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
  assert.equal(cleaned["state"], "not-dispatched"); await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
});
