import assert from "node:assert/strict";
import { readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { isRecord, sha256Json } from "../src/core.ts";
import { ORDINARY_LAUNCH_PROFILE, OrdinaryLaunchCoordinator, parseOrdinaryLaunchRequest, queryOrdinaryLaunch,
  validateOrdinaryLaunchArguments, verifyOrdinaryLaunchInstallation } from "../src/ordinary-launch.ts";
import type { OrdinaryLaunchOptions, OrdinaryLaunchRuntime } from "../src/ordinary-launch.ts";
import { ORDINARY_LAUNCH_RECOVERY_HELPER } from "../src/ordinary-launch-recovery.ts";
import type { observeOrdinaryLaunchRecovery } from "../src/ordinary-launch-recovery.ts";
import type { WindowsAuthorityLaunch } from "../src/windows-authority.ts";

const facadeSha256 = "a".repeat(64);
function request(operationId: string): Record<string, unknown> {
  return { action: "launch", operationId, confirmLaunch: true, acceptExistingProfileEffects: true };
}
function abandonRequest(operationId: string, expectedLaunchedSha256: string): Record<string, unknown> {
  return { action: "abandon-supervision", operationId, expectedLaunchedSha256,
    confirmAbandonSupervision: true, acceptUnobservedDescendants: true };
}
function closeRequest(operationId: string, expectedLaunchedSha256: string): Record<string, unknown> {
  return { action: "normal-close", operationId, expectedLaunchedSha256, hwnd: "12345", confirmNormalClose: true };
}
function unknownRequest(operationId: string, expectedIntentSha256: string): Record<string, unknown> {
  return { action: "abandon-unknown-launch", operationId, expectedIntentSha256,
    confirmAbandonUnknownLaunch: true, acceptUnobservedDescendants: true };
}
async function state(coordinator: OrdinaryLaunchCoordinator, operationId: string): Promise<unknown> {
  const response = await coordinator.run({ action: "inspect", operationId });
  return response["state"];
}
function journal(operationId: string): string {
  const root = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.ok(root !== undefined && root.includes("easyeda-test-control-"));
  assert.match(operationId, /^ordinary-test-[a-z0-9-]+$/u);
  return join(root, "ordinary-launch-v1", operationId);
}
function cleanup(context: TestContext, ...ids: string[]): void {
  context.after(async () => { for (const id of ids) { await rm(journal(id), { recursive: true, force: true }); } });
}
function fixture(operationId: string, behavior: { failure?: boolean; wrongTermination?: boolean; existing?: boolean;
  presenceChanged?: boolean; onAllowed?: (presenceSamples: number) => Promise<void>;
  otherPowerShell?: boolean; recoveryApplication?: boolean; onRecovery?: () => Promise<void>;
  windowOutcome?: "available" | "unavailable" | "ambiguous"; wrongWindowOwner?: boolean; closeFailure?: boolean } = {}): {
  readonly options: OrdinaryLaunchOptions;
  readonly calls: string[];
  readonly coordinator: OrdinaryLaunchCoordinator;
  readonly markTerminated: () => void;
  readonly markExistingClosed: () => void;
} {
  const calls: string[] = [];
  let generation = 0, terminated = false;
  let existing = behavior.existing === true;
  let presenceSamples = 0;
  let launch: WindowsAuthorityLaunch;
  const runtime: OrdinaryLaunchRuntime = {
    observeExistingApplication: () => {
      calls.push("existing"); presenceSamples += 1;
      return Promise.resolve({ running: behavior.presenceChanged === true && presenceSamples === 2 ? !existing : existing });
    },
    launch: async () => {
      calls.push("launch");
      if (generation === 0) {
        const intentPath = join(journal(operationId), "intent.json");
        const intentText = await readFile(intentPath, "utf8");
        const stored: unknown = JSON.parse(intentText);
        assert.ok(stored !== null && typeof stored === "object" && "operationId" in stored && "facadeSha256" in stored);
        assert.equal(stored["operationId"], operationId);
        assert.equal(stored["facadeSha256"], facadeSha256);
      }
      if (behavior.failure === true) { throw new Error("synthetic lost native result"); }
      generation += 1; terminated = false;
      const jobId = generation.toString().padStart(32, "0");
      launch = { jobId, helperInstance: "b".repeat(32), root: { pid: 456, role: "easyeda-main", startIdentity: `win32:123456789012345:job:${jobId}` } };
      return launch;
    },
    observeLaunchTermination: () => {
      calls.push("observe");
      return Promise.resolve({ jobId: behavior.wrongTermination === true ? "f".repeat(32) : launch.jobId,
        helperInstance: launch.helperInstance, terminated });
    },
    observeApplicationWindow: () => {
      calls.push("window");
      const outcome = behavior.windowOutcome ?? "available";
      return Promise.resolve({ jobId: behavior.wrongWindowOwner === true ? "f".repeat(32) : launch.jobId,
        helperInstance: launch.helperInstance, outcome, hwnd: outcome === "available" ? "12345" : null });
    },
    normalClose: async (hwnd) => {
      calls.push("close");
      assert.equal(hwnd, "12345");
      const intentText = await readFile(join(journal(operationId), "close-intent.json"), "utf8");
      const intent: unknown = JSON.parse(intentText);
      assert.ok(isRecord(intent));
      assert.equal(intent["hwnd"], hwnd);
      assert.equal(intent["jobId"], launch.jobId);
      assert.equal(intent["helperInstance"], launch.helperInstance);
      assert.equal(intent["confirmNormalClose"], true);
      if (behavior.closeFailure === true) { throw new Error("synthetic missing close acknowledgment"); }
    },
  };
  const options: OrdinaryLaunchOptions = {
    assetsRoot: "/opt/synthetic/assets", pluginRoot: "/opt/synthetic/plugin",
    assertAllowed: async () => { calls.push("guard"); await behavior.onAllowed?.(presenceSamples); },
    allocateRuntime: (input) => {
      calls.push("allocate");
      assert.equal(input.expectedExecutableSha256, ORDINARY_LAUNCH_PROFILE.installedFiles[0].sha256);
      assert.equal(input.expectedHelperSha256, ORDINARY_LAUNCH_PROFILE.helper.sha256);
      assert.equal(input.reviewedExecutionScopeSha256, facadeSha256);
      return runtime;
    },
  };
  // Only this offline coordinator fixture substitutes admission. Production has
  // No tool argument selecting dependencies, paths, hashes or another profile.
  const coordinator = new OrdinaryLaunchCoordinator(options, {
    verifyInstallation: (): Promise<string> => { calls.push("verify"); return Promise.resolve(facadeSha256); },
    observeRecovery: async (): ReturnType<typeof observeOrdinaryLaunchRecovery> => {
      calls.push("recovery");
      await behavior.onRecovery?.();
      return { schema: "easyeda-pro-control.ordinary-launch-recovery-observation.v1", helperSha256: ORDINARY_LAUNCH_RECOVERY_HELPER.sha256,
        samples: 2, otherPowerShellPresent: behavior.otherPowerShell === true, sameNameProcessPresent: behavior.recoveryApplication === true };
    },
  });
  return { options, calls, coordinator, markTerminated: () => { terminated = true; }, markExistingClosed: () => { existing = false; } };
}

void test("ordinary launch discovery and validation disclose effects and reject arbitrary options without intent", async (context) => {
  const id = "ordinary-test-schema";
  cleanup(context, id);
  const current = fixture(id);
  assert.equal(validateOrdinaryLaunchArguments(request(id))["valid"], true);
  assert.equal(validateOrdinaryLaunchArguments({ action: "observe-application", operationId: id })["valid"], true);
  assert.equal(validateOrdinaryLaunchArguments({ action: "observe-application", operationId: id, pid: 456 })["valid"], false);
  const close = closeRequest(id, facadeSha256);
  assert.equal(validateOrdinaryLaunchArguments(close)["valid"], true);
  assert.equal(validateOrdinaryLaunchArguments({ ...close, confirmNormalClose: false })["valid"], false);
  assert.equal(validateOrdinaryLaunchArguments({ ...close, hwnd: "0" })["valid"], false);
  assert.equal(validateOrdinaryLaunchArguments({ ...close, hwnd: "01" })["valid"], false);
  assert.equal(validateOrdinaryLaunchArguments({ ...close, pid: 456 })["valid"], false);
  assert.equal(validateOrdinaryLaunchArguments({ action: "observe-window", operationId: id, expectedLaunchedSha256: facadeSha256 })["valid"], true);
  assert.equal(validateOrdinaryLaunchArguments({ action: "observe-window", operationId: id })["valid"], false);
  const abandonment = abandonRequest(id, facadeSha256);
  assert.equal(validateOrdinaryLaunchArguments(abandonment)["valid"], true);
  assert.equal(validateOrdinaryLaunchArguments({ ...abandonment, confirmAbandonSupervision: false })["valid"], false);
  assert.equal(validateOrdinaryLaunchArguments({ ...abandonment, acceptUnobservedDescendants: false })["valid"], false);
  assert.equal(validateOrdinaryLaunchArguments({ ...abandonment, pid: 456 })["valid"], false);
  assert.equal(validateOrdinaryLaunchArguments({ ...request(id), args: ["project.eprj2"] })["valid"], false);
  assert.throws(() => parseOrdinaryLaunchRequest({ ...request(id), operationId: "../escape" }));
  await assert.rejects(current.coordinator.run({ ...request(id), acceptExistingProfileEffects: false }));
  assert.deepEqual(current.calls, []);
  assert.equal(await state(current.coordinator, id), "not-found");
  const discovery = queryOrdinaryLaunch({ includeSchemas: true });
  assert.notEqual(discovery["requestSchema"], undefined);
  assert.match(JSON.stringify(discovery["limitations"]), /not an isolated/u);
  assert.deepEqual(discovery["actions"], ["launch", "inspect", "observe-application", "observe-termination", "observe-window", "normal-close", "abandon-supervision", "abandon-unknown-launch"]);
  const unknown = unknownRequest(id, facadeSha256);
  assert.equal(validateOrdinaryLaunchArguments(unknown)["valid"], true);
  assert.equal(validateOrdinaryLaunchArguments({ ...unknown, confirmAbandonUnknownLaunch: false })["valid"], false);
  assert.equal(validateOrdinaryLaunchArguments({ ...unknown, acceptUnobservedDescendants: false })["valid"], false);
  assert.equal(validateOrdinaryLaunchArguments({ ...unknown, ignoredPid: 456 })["valid"], false);
});

void test("ordinary launch persists before dispatch, refuses restart replay, and permits a new operation after retained termination", async (context) => {
  const first = "ordinary-test-first", second = "ordinary-test-second";
  cleanup(context, first, second);
  const current = fixture(first);
  const launched = await current.coordinator.run(request(first));
  assert.equal(launched["state"], "launched");
  assert.equal(launched["bridgeAuthentication"], "not-observed");
  assert.equal(launched["startPage"], "not-observed");
  assert.equal(launched["startupQualified"], false);
  assert.equal(launched["projectArgumentsSupplied"], false);
  await assert.rejects(current.coordinator.run(request(first)), /consumed/u);
  await assert.rejects(current.coordinator.run(request(second)), /unresolved/u);
  const restarted = fixture(second);
  assert.equal(await state(restarted.coordinator, first), "launched");
  await assert.rejects(restarted.coordinator.run(request(second)), /unresolved/u);
  await assert.rejects(restarted.coordinator.run({ action: "observe-termination", operationId: first }), /retained owner/u);
  assert.equal(restarted.calls.includes("allocate"), false);
  const pending = await current.coordinator.run({ action: "observe-termination", operationId: first });
  assert.equal(pending["terminationObserved"], false);
  current.markTerminated();
  const terminated = await current.coordinator.run({ action: "observe-termination", operationId: first });
  assert.equal(terminated["state"], "terminated");
  const relaunched = await current.coordinator.run(request(second));
  assert.equal(relaunched["state"], "launched");
  assert.equal(current.calls.filter((call) => call === "allocate").length, 1);
  assert.equal(current.calls.filter((call) => call === "launch").length, 2);
  current.markTerminated();
  await current.coordinator.run({ action: "observe-termination", operationId: second });
  // Inspection of an unrelated ID cannot return the currently retained launch.
  assert.equal(await state(current.coordinator, "ordinary-test-never-launched"), "not-found");
});

void test("ordinary launch ambiguous dispatch remains consumed across hosts and cannot mint termination", async (context) => {
  const first = "ordinary-test-unknown", second = "ordinary-test-unknown-retry";
  cleanup(context, first, second);
  const current = fixture(first, { failure: true });
  await assert.rejects(current.coordinator.run(request(first)), /synthetic lost/u);
  assert.equal(await state(current.coordinator, first), "launch-unknown");
  await assert.rejects(current.coordinator.run(request(first)), /uncertain/u);
  await assert.rejects(current.coordinator.run(abandonRequest(first, facadeSha256)), /uncertain/u);
  const restarted = fixture(second);
  await assert.rejects(restarted.coordinator.run(request(second)), /unresolved/u);
  await assert.rejects(restarted.coordinator.run({ action: "observe-termination", operationId: first }), /retained owner/u);
  await assert.rejects(restarted.coordinator.run(abandonRequest(first, facadeSha256)), /successful historical launch/u);
  assert.equal(current.calls.filter((call) => call === "launch").length, 1);
  assert.equal(restarted.calls.includes("allocate"), false);
});

void test("ordinary launch rejects a different Job termination without releasing the operation", async (context) => {
  const id = "ordinary-test-wrong-job";
  cleanup(context, id);
  const current = fixture(id, { wrongTermination: true });
  await current.coordinator.run(request(id));
  current.markTerminated();
  await assert.rejects(current.coordinator.run({ action: "observe-termination", operationId: id }), /another launch/u);
  assert.equal(await state(current.coordinator, id), "launched");
});

void test("unknown launch recovery excludes a delayed helper without rewriting intent or claiming termination", async (context) => {
  const id = "ordinary-test-unknown-abandon", next = "ordinary-test-after-unknown";
  cleanup(context, id, next);
  const original = fixture(id, { failure: true });
  await assert.rejects(original.coordinator.run(request(id)), /synthetic lost/u);
  const before = await readFile(join(journal(id), "intent.json"));
  const inspection = await original.coordinator.run({ action: "inspect", operationId: id });
  const digest = inspection["intentSha256"];
  assert.ok(typeof digest === "string");
  assert.equal(inspection["helperBeforeIntentProtocol"], "recorded-v2");
  const input = unknownRequest(id, digest);
  await assert.rejects(original.coordinator.run(input), /uncertain/u);
  const restarted = fixture(next);
  const result = await restarted.coordinator.run(input);
  assert.equal(result["state"], "unknown-launch-abandoned");
  assert.equal(result["attemptConsumed"], true);
  assert.equal(result["launchOutcome"], "unknown");
  assert.equal(result["terminationProved"], false);
  assert.equal(result["designExecutionAuthorized"], false);
  assert.equal(result["launch"], undefined);
  assert.equal(result["termination"], undefined);
  const after = await readFile(join(journal(id), "intent.json")), names = await readdir(journal(id));
  assert.deepEqual(after, before);
  assert.deepEqual(names.toSorted(), ["intent.json", "unknown-abandonment.json"]);
  assert.equal(restarted.calls.includes("allocate"), false);
  assert.equal(restarted.calls.includes("launch"), false);
  assert.equal(restarted.calls.filter((call) => call === "recovery").length, 1);
  await assert.rejects(restarted.coordinator.run(input), /unresolved intent-only/u);
  const later = fixture(next);
  assert.equal(await state(later.coordinator, id), "unknown-launch-abandoned");
  await assert.rejects(later.coordinator.run(request(id)), /consumed/u);
  const nextLaunch = await later.coordinator.run(request(next));
  assert.equal(nextLaunch["state"], "launched");
});

void test("unknown recovery blocks delayed helpers, live applications, digest drift and allocated runtimes", async (context) => {
  const id = "ordinary-test-unknown-refusals";
  cleanup(context, id);
  await assert.rejects(fixture(id, { failure: true }).coordinator.run(request(id)), /synthetic lost/u);
  const inspection = await fixture(id).coordinator.run({ action: "inspect", operationId: id });
  const digest = inspection["intentSha256"];
  assert.ok(typeof digest === "string");
  const input = unknownRequest(id, digest);
  for (const behavior of [{ otherPowerShell: true }, { recoveryApplication: true }]) {
    const current = fixture(id, behavior);
    await assert.rejects(current.coordinator.run(input), /absent other PowerShell/u);
    assert.equal(current.calls.includes("launch"), false);
  }
  const stale = fixture(id);
  const wrongDigest = "f".repeat(64);
  await assert.rejects(stale.coordinator.run(unknownRequest(id, wrongDigest)), /intent digest differs/u);
  assert.equal(stale.calls.includes("recovery"), false);
  const allocated = fixture(id);
  await allocated.coordinator.run({ action: "observe-application", operationId: id });
  await assert.rejects(allocated.coordinator.run(input), /fresh coordinator/u);
  assert.equal(allocated.calls.includes("recovery"), false);
  assert.deepEqual(await readdir(journal(id)), ["intent.json"]);
});

void test("unknown recovery rejects quarantine and concurrent journal changes without downstream launch", async (context) => {
  const id = "ordinary-test-unknown-change";
  cleanup(context, id);
  await assert.rejects(fixture(id, { failure: true }).coordinator.run(request(id)), /synthetic lost/u);
  const path = join(journal(id), "intent.json");
  const before = await readFile(path, "utf8");
  const intent: unknown = JSON.parse(before);
  assert.ok(isRecord(intent));
  const input = unknownRequest(id, sha256Json(intent));
  const guarded = fixture(id, { onAllowed: () => Promise.reject(new Error("synthetic quarantine")) });
  await assert.rejects(guarded.coordinator.run(input), /synthetic quarantine/u);
  assert.equal(guarded.calls.includes("recovery"), false);
  const changed = fixture(id, { onRecovery: async () => {
    await writeFile(path, JSON.stringify({ ...intent, facadeSha256: "b".repeat(64) }));
  } });
  await assert.rejects(changed.coordinator.run(input), /journal changed/u);
  assert.equal(changed.calls.includes("launch"), false);
  assert.deepEqual(await readdir(journal(id)), ["intent.json"]);
});

void test("legacy intent-only recovery admits the reviewed runtime hash, not a matching profile alone", async (context) => {
  const id = "ordinary-test-unknown-legacy";
  cleanup(context, id);
  await assert.rejects(fixture(id, { failure: true }).coordinator.run(request(id)), /synthetic lost/u);
  const path = join(journal(id), "intent.json");
  const intent: unknown = JSON.parse(await readFile(path, "utf8"));
  assert.ok(isRecord(intent));
  const legacy = { schema: "easyeda-pro-control.ordinary-launch-intent.v1", operationId: id, profileSha256: intent["profileSha256"],
    facadeSha256, createdAt: intent["createdAt"] };
  await writeFile(path, JSON.stringify(legacy));
  const refused = fixture(id);
  const legacyDigest = sha256Json(legacy);
  await assert.rejects(refused.coordinator.run(unknownRequest(id, legacyDigest)), /dispatch protocol is not reviewed/u);
  assert.equal(refused.calls.includes("recovery"), false);
  const foreignV2 = { ...legacy, schema: "easyeda-pro-control.ordinary-launch-intent.v2",
    dispatchProtocol: "retained-helper-before-intent.v1", facadeSha256: "b".repeat(64) };
  await writeFile(path, JSON.stringify(foreignV2));
  const foreignDigest = sha256Json(foreignV2);
  await assert.rejects(refused.coordinator.run(unknownRequest(id, foreignDigest)), /v2 producer differs/u);
  assert.equal(refused.calls.includes("recovery"), false);
  const reviewed = { ...legacy, facadeSha256: "d7f99363d58ee66181f74c7841edcfd6b00d6e7da02a7dc1b5b686b77cf828a7" };
  await writeFile(path, JSON.stringify(reviewed));
  const accepted = await fixture(id).coordinator.run(unknownRequest(id, sha256Json(reviewed)));
  assert.equal(accepted["state"], "unknown-launch-abandoned");
  assert.deepEqual(await readFile(path, "utf8"), JSON.stringify(reviewed));
});

void test("ordinary launch real installation admission refuses an unreviewed root before allocation", async () => {
  const current = fixture("ordinary-test-unreviewed");
  await assert.rejects(verifyOrdinaryLaunchInstallation(current.options), /installed Windows assets root/u);
  assert.deepEqual(current.calls, []);
});

void test("ordinary launch observes an existing app without consuming the operation and later launches once", async (context) => {
  const id = "ordinary-test-existing";
  cleanup(context, id);
  const current = fixture(id, { existing: true });
  const existing = await current.coordinator.run(request(id));
  assert.equal(existing["state"], "already-running");
  assert.equal(existing["attemptConsumed"], false);
  assert.equal(await state(current.coordinator, id), "not-found");
  assert.equal(current.calls.includes("launch"), false);
  current.markExistingClosed();
  const launched = await current.coordinator.run(request(id));
  assert.equal(launched["state"], "launched");
  assert.equal(current.calls.filter((call) => call === "allocate").length, 1);
  assert.equal(current.calls.filter((call) => call === "launch").length, 1);
});

void test("ordinary application observation after restart preserves history and grants no termination or relaunch authority", async (context) => {
  const first = "ordinary-test-presence", second = "ordinary-test-presence-retry";
  cleanup(context, first, second);
  const original = fixture(first);
  const historical = await original.coordinator.run(request(first));
  const names = await readdir(journal(first));
  const before = await Promise.all(names.map((name) => readFile(join(journal(first), name))));
  const restarted = fixture(second, { existing: true });
  const observed = await restarted.coordinator.run({ action: "observe-application", operationId: first });
  assert.equal(observed["action"], "observe-application");
  assert.deepEqual(observed["historical"], historical);
  assert.deepEqual(observed["application"], { sameNameProcessPresent: true, samples: 2, originalLaunchIdentityVerified: false,
    retainedLaunchAuthority: false, terminationProved: false, relaunchAuthorized: false });
  assert.equal(observed["bridgeAuthentication"], "not-observed");
  assert.equal(observed["designExecutionAuthorized"], false);
  assert.equal(restarted.calls.filter((call) => call === "existing").length, 2);
  restarted.markExistingClosed();
  const absent = await restarted.coordinator.run({ action: "observe-application", operationId: first });
  assert.deepEqual(absent["historical"], historical);
  assert.deepEqual(absent["application"], { sameNameProcessPresent: false, samples: 2, originalLaunchIdentityVerified: false,
    retainedLaunchAuthority: false, terminationProved: false, relaunchAuthorized: false });
  await assert.rejects(restarted.coordinator.run(request(second)), /unresolved/u);
  await assert.rejects(restarted.coordinator.run({ action: "observe-termination", operationId: first }), /retained owner/u);
  await assert.rejects(restarted.coordinator.run({ action: "observe-application", operationId: second }), /not found/u);
  assert.equal(restarted.calls.filter((call) => call === "existing").length, 4);
  assert.equal(restarted.calls.filter((call) => call === "allocate").length, 1);
  assert.equal(restarted.calls.includes("launch"), false);
  assert.equal(restarted.calls.includes("observe"), false);
  assert.deepEqual(await readdir(journal(first)), names);
  const after = await Promise.all(names.map((name) => readFile(join(journal(first), name))));
  assert.deepEqual(after, before);
  assert.equal(await state(restarted.coordinator, second), "not-found");
});

void test("ordinary application observation refuses changed presence, installation or dispatch admission", async (context) => {
  const id = "ordinary-test-presence-drift";
  cleanup(context, id);
  await fixture(id).coordinator.run(request(id));
  const unstable = fixture(id, { presenceChanged: true });
  await assert.rejects(unstable.coordinator.run({ action: "observe-application", operationId: id }), /presence changed/u);
  assert.equal(unstable.calls.includes("launch"), false);
  const installed = fixture(id);
  let verifications = 0;
  const changedInstallation = new OrdinaryLaunchCoordinator(installed.options, { verifyInstallation: (): Promise<string> => {
    verifications += 1; return Promise.resolve(verifications === 1 ? facadeSha256 : "b".repeat(64));
  } });
  await assert.rejects(changedInstallation.run({ action: "observe-application", operationId: id }), /installation changed/u);
  assert.equal(installed.calls.includes("launch"), false);
  const guarded = fixture(id);
  const denied = new OrdinaryLaunchCoordinator({ ...guarded.options, assertAllowed: (): Promise<void> => Promise.reject(new Error("synthetic quarantine")) });
  await assert.rejects(denied.run({ action: "observe-application", operationId: id }), /synthetic quarantine/u);
  assert.deepEqual(guarded.calls, []);
  assert.equal(await state(guarded.coordinator, id), "launched");
});

void test("ordinary application observation refuses journal changes in the final admission gate without creating receipts", async (context) => {
  const id = "ordinary-test-presence-journal";
  cleanup(context, id);
  await fixture(id).coordinator.run(request(id));
  const names = await readdir(journal(id));
  const launchedPath = join(journal(id), "launched.json");
  const launched = await readFile(launchedPath, "utf8");
  let gatesAfterBothSamples = 0;
  const restarted = fixture(id, { onAllowed: async (presenceSamples) => {
    if (presenceSamples === 2) { gatesAfterBothSamples += 1; }
    if (gatesAfterBothSamples === 2) {
      const changed = launched.replace('"pid":456', '"pid":457');
      assert.notEqual(changed, launched);
      await writeFile(launchedPath, changed);
    }
  } });
  await assert.rejects(restarted.coordinator.run({ action: "observe-application", operationId: id }), /journal changed/u);
  assert.equal(gatesAfterBothSamples, 2);
  assert.equal(restarted.calls.filter((call) => call === "existing").length, 2);
  assert.equal(restarted.calls.includes("launch"), false);
  assert.equal(restarted.calls.includes("observe"), false);
  assert.deepEqual(await readdir(journal(id)), names);
});

void test("historical supervision abandonment preserves originals and never becomes termination or reuses its operation", async (context) => {
  const first = "ordinary-test-abandon", second = "ordinary-test-after-abandon";
  cleanup(context, first, second);
  const original = fixture(first);
  const launched = await original.coordinator.run(request(first));
  const inspection = await original.coordinator.run({ action: "inspect", operationId: first });
  const digest = inspection["launchedSha256"];
  assert.ok(typeof digest === "string");
  const abandonment = abandonRequest(first, digest);
  await assert.rejects(original.coordinator.run(abandonment), /current retained owner/u);
  const names = await readdir(journal(first));
  const before = await Promise.all(names.map((name) => readFile(join(journal(first), name))));
  const restarted = fixture(second);
  const result = await restarted.coordinator.run(abandonment);
  assert.equal(result["state"], "supervision-abandoned");
  assert.equal(result["attemptConsumed"], true);
  assert.equal(result["terminationProved"], false);
  assert.equal(result["termination"], undefined);
  assert.equal(result["designExecutionAuthorized"], false);
  assert.deepEqual(result["launch"], launched["launch"]);
  const receiptText = await readFile(join(journal(first), "abandonment.json"), "utf8");
  const receipt: unknown = JSON.parse(receiptText);
  assert.ok(isRecord(receipt));
  assert.deepEqual(result["abandonment"], receipt);
  assert.equal(receipt["launchedSha256"], digest);
  const intentText = await readFile(join(journal(first), "intent.json"), "utf8");
  const intent: unknown = JSON.parse(intentText);
  assert.equal(receipt["intentSha256"], sha256Json(intent));
  assert.equal(receipt["terminationProved"], false);
  assert.equal(receipt["originalLaunchIdentityVerified"], false);
  assert.equal(receipt["designExecutionAuthorized"], false);
  assert.equal(receipt["sameNameProcessPresent"], false);
  assert.equal(receipt["samples"], 2);
  assert.equal(receipt["confirmAbandonSupervision"], true);
  assert.equal(receipt["acceptUnobservedDescendants"], true);
  assert.equal(receipt["profileSha256"], sha256Json(ORDINARY_LAUNCH_PROFILE));
  assert.equal(receipt["facadeSha256"], facadeSha256);
  assert.equal(restarted.calls.filter((call) => call === "existing").length, 2);
  assert.equal(restarted.calls.includes("launch"), false);
  assert.equal(restarted.calls.includes("observe"), false);
  const afterNames = await readdir(journal(first));
  assert.deepEqual(afterNames.toSorted(), [...names, "abandonment.json"].toSorted());
  assert.deepEqual(await Promise.all(names.map((name) => readFile(join(journal(first), name)))), before);
  await assert.rejects(restarted.coordinator.run(abandonment), /already resolved or abandoned/u);
  await assert.rejects(restarted.coordinator.run(request(first)), /consumed/u);
  const afterRestart = fixture(second);
  assert.equal(await state(afterRestart.coordinator, first), "supervision-abandoned");
  const noTermination = await afterRestart.coordinator.run({ action: "observe-termination", operationId: first });
  assert.equal(noTermination["state"], "supervision-abandoned");
  assert.equal(noTermination["terminationProved"], false);
  assert.equal(noTermination["termination"], undefined);
  assert.equal(afterRestart.calls.includes("observe"), false);
  const next = await afterRestart.coordinator.run(request(second));
  assert.equal(next["state"], "launched");
  assert.equal(afterRestart.calls.filter((call) => call === "existing").length, 1);
  assert.equal(afterRestart.calls.filter((call) => call === "launch").length, 1);
});

void test("supervision abandonment rejects stale binding, live or changing presence, and quarantine without receipts", async (context) => {
  const id = "ordinary-test-abandon-refusal";
  cleanup(context, id);
  const launched = await fixture(id).coordinator.run(request(id));
  const digest = launched["launchedSha256"];
  assert.ok(typeof digest === "string");
  const input = abandonRequest(id, digest), names = await readdir(journal(id));
  const mismatch = fixture(id);
  const wrongDigest = digest === facadeSha256 ? "b".repeat(64) : facadeSha256;
  await assert.rejects(mismatch.coordinator.run(abandonRequest(id, wrongDigest)), /digest differs/u);
  assert.equal(mismatch.calls.includes("allocate"), false);
  const running = fixture(id, { existing: true });
  await assert.rejects(running.coordinator.run(input), /present|running|absen/u);
  const unstable = fixture(id, { presenceChanged: true });
  await assert.rejects(unstable.coordinator.run(input), /presence changed/u);
  const guarded = fixture(id);
  const denied = new OrdinaryLaunchCoordinator({ ...guarded.options,
    assertAllowed: (): Promise<void> => Promise.reject(new Error("synthetic quarantine")) });
  await assert.rejects(denied.run(input), /synthetic quarantine/u);
  assert.deepEqual(guarded.calls, []);
  assert.equal(running.calls.includes("launch"), false);
  assert.equal(unstable.calls.includes("launch"), false);
  assert.deepEqual(await readdir(journal(id)), names);
  assert.equal(await state(guarded.coordinator, id), "launched");
});

void test("supervision abandonment refuses a journal changed by the final admission gate without publishing", async (context) => {
  const id = "ordinary-test-abandon-journal";
  cleanup(context, id);
  const launched = await fixture(id).coordinator.run(request(id));
  const digest = launched["launchedSha256"];
  assert.ok(typeof digest === "string");
  const names = await readdir(journal(id)), path = join(journal(id), "launched.json");
  const before = await readFile(path, "utf8");
  let gatesAfterBothSamples = 0;
  const restarted = fixture(id, { onAllowed: async (presenceSamples) => {
    if (presenceSamples === 2) { gatesAfterBothSamples += 1; }
    if (gatesAfterBothSamples === 2) {
      const changed = before.replace('"pid":456', '"pid":457');
      assert.notEqual(changed, before);
      await writeFile(path, changed);
    }
  } });
  await assert.rejects(restarted.coordinator.run(abandonRequest(id, digest)), /journal changed/u);
  assert.equal(gatesAfterBothSamples, 2);
  assert.equal(restarted.calls.filter((call) => call === "existing").length, 2);
  assert.equal(restarted.calls.includes("launch"), false);
  assert.equal(restarted.calls.includes("observe"), false);
  assert.deepEqual(await readdir(journal(id)), names);
});

void test("ordinary normal close reobserves the retained window, persists once and separates acknowledgment from termination", async (context) => {
  const id = "ordinary-test-normal-close";
  cleanup(context, id);
  const current = fixture(id);
  const launched = await current.coordinator.run(request(id));
  const digest = launched["launchedSha256"];
  assert.ok(typeof digest === "string");
  const observed = await current.coordinator.run({ action: "observe-window", operationId: id, expectedLaunchedSha256: digest });
  assert.deepEqual(observed["window"], { jobId: "1".padStart(32, "0"), helperInstance: "b".repeat(32), outcome: "available", hwnd: "12345" });
  assert.equal(observed["closeAuthorized"], false);
  const names = await readdir(journal(id));
  assert.deepEqual(names.toSorted(), ["intent.json", "launched.json"]);
  const result = await current.coordinator.run(closeRequest(id, digest));
  assert.equal(result["state"], "launched");
  assert.equal(result["terminationObserved"], false);
  const close = result["normalClose"];
  assert.ok(isRecord(close));
  assert.equal(close["attemptConsumed"], true);
  assert.equal(close["requestAcknowledged"], true);
  assert.equal(close["terminationProved"], false);
  assert.equal(current.calls.filter((call) => call === "window").length, 2);
  assert.equal(current.calls.filter((call) => call === "close").length, 1);
  await assert.rejects(current.coordinator.run(closeRequest(id, digest)), /consumed/u);
  const pending = await current.coordinator.run({ action: "observe-termination", operationId: id });
  assert.equal(pending["terminationObserved"], false);
  current.markTerminated();
  const terminated = await current.coordinator.run({ action: "observe-termination", operationId: id });
  assert.equal(terminated["state"], "terminated");
  assert.equal(current.calls.filter((call) => call === "close").length, 1);
});

void test("ordinary missing close acknowledgment consumes the attempt but preserves inspection and original exit observation", async (context) => {
  const id = "ordinary-test-close-unknown";
  cleanup(context, id);
  const current = fixture(id, { closeFailure: true });
  const launched = await current.coordinator.run(request(id));
  const digest = launched["launchedSha256"];
  assert.ok(typeof digest === "string");
  await assert.rejects(current.coordinator.run(closeRequest(id, digest)), /missing close acknowledgment/u);
  const inspected = await current.coordinator.run({ action: "inspect", operationId: id });
  const close = inspected["normalClose"];
  assert.ok(isRecord(close));
  assert.equal(close["attemptConsumed"], true);
  assert.equal(close["requestAcknowledged"], false);
  const names = await readdir(journal(id));
  assert.deepEqual(names.toSorted(), ["close-intent.json", "intent.json", "launched.json"]);
  await assert.rejects(current.coordinator.run(closeRequest(id, digest)), /consumed/u);
  const restarted = fixture(id);
  await assert.rejects(restarted.coordinator.run(closeRequest(id, digest)), /consumed/u);
  await assert.rejects(restarted.coordinator.run({ action: "observe-window", operationId: id, expectedLaunchedSha256: digest }), /retained owner/u);
  assert.equal(restarted.calls.includes("allocate"), false);
  assert.equal(restarted.calls.includes("close"), false);
  const pending = await current.coordinator.run({ action: "observe-termination", operationId: id });
  assert.equal(pending["terminationObserved"], false);
  current.markTerminated();
  assert.equal(await state(current.coordinator, id), "launched");
  const terminated = await current.coordinator.run({ action: "observe-termination", operationId: id });
  assert.equal(terminated["state"], "terminated");
  assert.equal(current.calls.filter((call) => call === "close").length, 1);
});

void test("ordinary close refuses stale launch, nonunique windows and wrong retained owners without consuming an intent", async (context) => {
  const id = "ordinary-test-close-window";
  cleanup(context, id);
  const behavior: { windowOutcome: "available" | "unavailable" | "ambiguous"; wrongWindowOwner: boolean } = {
    windowOutcome: "unavailable", wrongWindowOwner: false,
  };
  const current = fixture(id, behavior);
  const launched = await current.coordinator.run(request(id));
  const digest = launched["launchedSha256"];
  assert.ok(typeof digest === "string");
  const wrongDigest = "f".repeat(64);
  await assert.rejects(current.coordinator.run(closeRequest(id, wrongDigest)), /digest differs/u);
  assert.equal(current.calls.includes("window"), false);
  await assert.rejects(current.coordinator.run(closeRequest(id, digest)), /unique application window/u);
  behavior.windowOutcome = "ambiguous";
  await assert.rejects(current.coordinator.run(closeRequest(id, digest)), /unique application window/u);
  behavior.windowOutcome = "available";
  await assert.rejects(current.coordinator.run({ ...closeRequest(id, digest), hwnd: "12346" }), /unique application window/u);
  behavior.wrongWindowOwner = true;
  await assert.rejects(current.coordinator.run(closeRequest(id, digest)), /another launch/u);
  assert.equal(current.calls.includes("close"), false);
  const names = await readdir(journal(id));
  assert.deepEqual(names.toSorted(), ["intent.json", "launched.json"]);
  behavior.wrongWindowOwner = false;
  await current.coordinator.run(closeRequest(id, digest));
  assert.equal(current.calls.filter((call) => call === "close").length, 1);
});

void test("ordinary close retains quarantine and journal rechecks after durable intent without retry or read-only lockout", async (context) => {
  const id = "ordinary-test-close-final-gate";
  cleanup(context, id);
  let armed = false, gatesAfterWindow = 0;
  const current = fixture(id, { onAllowed: (): Promise<void> => {
    if (armed && current.calls.includes("window")) { gatesAfterWindow += 1; }
    return gatesAfterWindow === 2 ? Promise.reject(new Error("synthetic quarantine after close intent")) : Promise.resolve();
  } });
  const launched = await current.coordinator.run(request(id));
  const digest = launched["launchedSha256"];
  assert.ok(typeof digest === "string");
  armed = true;
  await assert.rejects(current.coordinator.run(closeRequest(id, digest)), /quarantine after close intent/u);
  armed = false;
  gatesAfterWindow = 0;
  const inspected = await current.coordinator.run({ action: "inspect", operationId: id });
  assert.ok(isRecord(inspected["normalClose"]));
  assert.equal(inspected["normalClose"]["attemptConsumed"], true);
  assert.equal(current.calls.includes("close"), false);
  await assert.rejects(current.coordinator.run(closeRequest(id, digest)), /consumed/u);
  const closeIntentPath = join(journal(id), "close-intent.json"), original = await readFile(closeIntentPath, "utf8");
  const changed = original.replace('"hwnd":"12345"', '"hwnd":"12346"');
  assert.notEqual(changed, original);
  await writeFile(closeIntentPath, changed);
  // Acknowledgments bind the complete intent, including its HWND, not just the Job.
  const closeIntentSha256 = sha256Json(JSON.parse(original) as unknown);
  await writeFile(join(journal(id), "close-acknowledged.json"), JSON.stringify({
    schema: "easyeda-pro-control.ordinary-normal-close-acknowledged.v1", operationId: id,
    closeIntentSha256, requestAcknowledged: true, terminationProved: false,
  }), { mode: 0o600 });
  await assert.rejects(current.coordinator.run({ action: "inspect", operationId: id }), /acknowledgment is unbound/u);
  await writeFile(closeIntentPath, original);
  current.markTerminated();
  const terminated = await current.coordinator.run({ action: "observe-termination", operationId: id });
  assert.equal(terminated["state"], "terminated");
});

void test("ordinary abandonment admits only the exact historical profile without granting retained close authority", async (context) => {
  const id = "ordinary-test-abandon-old-profile";
  cleanup(context, id);
  await fixture(id).coordinator.run(request(id));
  const intentPath = join(journal(id), "intent.json"), launchedPath = join(journal(id), "launched.json");
  const originalIntent: unknown = JSON.parse(await readFile(intentPath, "utf8"));
  const originalLaunched: unknown = JSON.parse(await readFile(launchedPath, "utf8"));
  assert.ok(isRecord(originalIntent) && isRecord(originalLaunched));
  const unknownIntent = { ...originalIntent, profileSha256: "f".repeat(64) };
  const unknownLaunched = { ...originalLaunched, intentSha256: sha256Json(unknownIntent) };
  await writeFile(intentPath, JSON.stringify(unknownIntent));
  await writeFile(launchedPath, JSON.stringify(unknownLaunched));
  const restarted = fixture(id);
  const unknownDigest = sha256Json(unknownLaunched);
  await assert.rejects(restarted.coordinator.run(abandonRequest(id, unknownDigest)), /historical profile is not reviewed/u);
  const oldIntent = { ...originalIntent, profileSha256: "8c1552bec21a71fb3791e2e8422d2cef80394c3487f8ab1c75e7fc7eb20a9314" };
  const oldLaunched = { ...originalLaunched, intentSha256: sha256Json(oldIntent) };
  await writeFile(intentPath, JSON.stringify(oldIntent));
  await writeFile(launchedPath, JSON.stringify(oldLaunched));
  const oldDigest = sha256Json(oldLaunched);
  await assert.rejects(restarted.coordinator.run(closeRequest(id, oldDigest)), /retained owner/u);
  const abandoned = await restarted.coordinator.run(abandonRequest(id, oldDigest));
  assert.equal(abandoned["state"], "supervision-abandoned");
  assert.equal(abandoned["terminationProved"], false);
  assert.equal(restarted.calls.includes("close"), false);
});
