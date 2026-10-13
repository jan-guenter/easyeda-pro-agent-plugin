import assert from "node:assert/strict";
import { readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { isRecord, sha256Json } from "../src/core.ts";
import { ORDINARY_LAUNCH_PROFILE, OrdinaryLaunchCoordinator, parseOrdinaryLaunchRequest, queryOrdinaryLaunch,
  validateOrdinaryLaunchArguments, verifyOrdinaryLaunchInstallation } from "../src/ordinary-launch.ts";
import type { OrdinaryLaunchOptions, OrdinaryLaunchRuntime } from "../src/ordinary-launch.ts";
import type { WindowsAuthorityLaunch } from "../src/windows-authority.ts";

const facadeSha256 = "a".repeat(64);
function request(operationId: string): Record<string, unknown> {
  return { action: "launch", operationId, confirmLaunch: true, acceptExistingProfileEffects: true };
}
function abandonRequest(operationId: string, expectedLaunchedSha256: string): Record<string, unknown> {
  return { action: "abandon-supervision", operationId, expectedLaunchedSha256,
    confirmAbandonSupervision: true, acceptUnobservedDescendants: true };
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
  presenceChanged?: boolean; onAllowed?: (presenceSamples: number) => Promise<void> } = {}): {
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
  const coordinator = new OrdinaryLaunchCoordinator(options, { verifyInstallation: (): Promise<string> => { calls.push("verify"); return Promise.resolve(facadeSha256); } });
  return { options, calls, coordinator, markTerminated: () => { terminated = true; }, markExistingClosed: () => { existing = false; } };
}

void test("ordinary launch discovery and validation disclose effects and reject arbitrary options without intent", async (context) => {
  const id = "ordinary-test-schema";
  cleanup(context, id);
  const current = fixture(id);
  assert.equal(validateOrdinaryLaunchArguments(request(id))["valid"], true);
  assert.equal(validateOrdinaryLaunchArguments({ action: "observe-application", operationId: id })["valid"], true);
  assert.equal(validateOrdinaryLaunchArguments({ action: "observe-application", operationId: id, pid: 456 })["valid"], false);
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
  assert.deepEqual(discovery["actions"], ["launch", "inspect", "observe-application", "observe-termination", "abandon-supervision"]);
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
