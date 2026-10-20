import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import process from "node:process";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { setImmediate as yieldToEventLoop } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { CurrentPcbDiagnosticOwner, CurrentPcbStringPrecreateOwner } from "../src/current-pcb-diagnostic-owner.ts";

const LAUNCH = { executable: "C:\\Reviewed\\easyeda-pro.exe", executableSha256: "c".repeat(64), confirmDiagnosticLaunch: true } as const;
const SOURCE = "const syntheticIdentity = true;\n";
const SCRIPT_PROFILE = { family: "pcb", relativePath: "pro-pcb/test-version/js/pcb.js",
  scriptSha256: createHash("sha256").update(SOURCE).digest("hex"), scriptBytes: Buffer.byteLength(SOURCE) } as const;
function fixture(context: TestContext, scenario = "normal", stringPurpose = false): Readonly<{
  owner: CurrentPcbDiagnosticOwner; child: ReturnType<typeof spawn>; source: { valid: boolean }; installation: { valid: boolean };
  actions: string[]; openingPhases: string[]; pcbPhases: string[];
}> {
  const child = spawn(process.execPath, [fileURLToPath(new URL("helpers/current-pcb-diagnostic-helper-fixture.ts", import.meta.url)), scenario], { stdio: ["pipe", "pipe", "pipe"] });
  const actions: string[] = [], installation = { valid: true }, openingPhases: string[] = [], pcbPhases: string[] = [], source = { valid: true };
  const originalWrite = child.stdin.write.bind(child.stdin);
  // Keep actual child pipes and callbacks; observe only the generated wire data.
  context.mock.method(child.stdin, "write", (...args: Parameters<typeof child.stdin.write>) => {
    const first: unknown = args[0];
    if (typeof first === "string") {
      const parsed: unknown = JSON.parse(first); assert.ok(parsed !== null && typeof parsed === "object" && "action" in parsed);
      actions.push(String(parsed["action"]));
      if ("openingPhase" in parsed) { openingPhases.push(String(parsed["openingPhase"])); }
      if ("pcbOpeningPhase" in parsed) { pcbPhases.push(String(parsed["pcbOpeningPhase"])); }
    }
    return originalWrite(...args);
  });
  const Owner = stringPurpose ? CurrentPcbStringPrecreateOwner : CurrentPcbDiagnosticOwner;
  const owner = new Owner(child, () => source.valid ? Promise.resolve() : Promise.reject(new Error("source changed")), null,
    () => installation.valid ? Promise.resolve() : Promise.reject(new Error("installation changed")));
  owner.start();
  context.after(async () => {
    if (!owner.status().helperClosed) {
      const closed = once(child, "close");
      // Synthetic test peer only. No production owner shutdown or process kill.
      child.stdin.end(); await closed;
    }
  });
  return { owner, child, source, installation, actions, openingPhases, pcbPhases };
}
async function close(value: ReturnType<typeof fixture>): Promise<void> {
  assert.equal(await value.owner.observeApplicationWindow(), "456");
  await value.owner.requestNormalClose("456");
  assert.equal(await value.owner.observeTermination(), true);
  await value.owner.releaseClosed();
  assert.equal(value.owner.status().released, true); assert.equal(value.owner.status().helperClosed, true);
  assert.equal(value.child.exitCode, 0); assert.equal(value.child.signalCode, null);
}
void test("diagnostic owner integrates retained helper write, fragmented byte transport and fixed discovery", async context => {
  const value = fixture(context);
  await assert.rejects(value.owner.getVersion(), /NO_LAUNCH/u);
  const binding = await value.owner.launch(LAUNCH);
  assert.equal(binding.rootPid, 123); assert.equal(Object.isFrozen(binding), true);
  assert.deepEqual(await value.owner.getVersion(), { product: "synthetic", protocolVersion: "1.3" });
  assert.deepEqual(await value.owner.getTargets(), { targetInfos: [] });
  assert.equal(value.owner.status().executionAuthorized, false); assert.equal(value.owner.status().frameWorkerVerified, false);
  await assert.rejects(value.owner.launch(LAUNCH), /LAUNCH_CONSUMED/u);
  await close(value);
  assert.equal(value.actions.filter(action => action === "launch").length, 1);
  assert.equal(value.actions.filter(action => action === "normal-close").length, 1);
});
void test("diagnostic owner retains live helper on release refusal and permits release after actual termination", async context => {
  const value = fixture(context); await value.owner.launch(LAUNCH);
  await assert.rejects(value.owner.releaseClosed(), /RETAIN_LIVE_OWNER/u);
  assert.equal(value.child.stdin?.writableEnded, false); assert.equal(value.actions.includes("release"), false);
  await close(value); await assert.rejects(value.owner.releaseClosed(), /RELEASE_CONSUMED/u);
});
void test("original unlaunched helper requires native never-attempted proof before normal EOF release", async context => {
  const value = fixture(context); await value.owner.releaseUnlaunched();
  assert.deepEqual(value.actions, ["release-unlaunched"]); assert.equal(value.owner.status().released, true);
  assert.equal(value.owner.status().helperClosed, true); assert.equal(value.owner.status().launchConsumed, false);
  assert.equal(value.child.exitCode, 0); assert.equal(value.child.signalCode, null);
  await assert.rejects(value.owner.releaseUnlaunched(), /RELEASE_CONSUMED/u);
});
void test("unlaunched release cannot replace a failed or acknowledged creation attempt", async context => {
  for (const scenario of ["normal", "launch-failed", "launch-time-missing"]) {
    const value = fixture(context, scenario);
    await (scenario === "normal" ? value.owner.launch(LAUNCH) : assert.rejects(value.owner.launch(LAUNCH), /NATIVE_REFUSAL/u));
    const before = value.actions.length; await assert.rejects(value.owner.releaseUnlaunched(), /UNLAUNCHED_RELEASE_REFUSED/u);
    assert.equal(value.actions.length, before); assert.equal(value.child.stdin?.writableEnded, false); await close(value);
  }
});
void test("malformed never-launched release acknowledgment consumes attempt and retains stdin", async context => {
  const value = fixture(context, "unlaunched-ambiguous"); await assert.rejects(value.owner.releaseUnlaunched(), /RELEASE_REPLY/u);
  assert.equal(value.child.stdin?.writableEnded, false); assert.equal(value.owner.status().released, false);
  await assert.rejects(value.owner.releaseUnlaunched(), /RELEASE_CONSUMED/u);
  assert.deepEqual(value.actions, ["release-unlaunched"]);
});
void test("completed local launch refusal releases only original helper with native no-process proof", async context => {
  const value = fixture(context); value.installation.valid = false;
  assert.equal(value.owner.status().noProcessCleanupAvailable, false);
  await assert.rejects(value.owner.launch(LAUNCH), /installation changed/u);
  assert.deepEqual(value.actions, []); assert.equal(value.owner.status().noProcessCleanupAvailable, true);
  await assert.rejects(value.owner.releaseUnlaunched(), /UNLAUNCHED_RELEASE_REFUSED/u);
  assert.deepEqual(await value.owner.releaseNoProcess(), { launchRequestOutcome: "not-issued", creationState: "not-entered", processCreated: false, released: true });
  assert.deepEqual(value.actions, ["release-no-process"]); assert.equal(value.owner.status().helperClosed, true);
  assert.equal(value.owner.status().noProcessCleanupAvailable, false); assert.equal(value.child.exitCode, 0);
  await assert.rejects(value.owner.releaseNoProcess(), /RELEASE_CONSUMED/u);
  await assert.rejects(value.owner.launch(LAUNCH), /LAUNCH_CONSUMED/u);
});
void test("completed native refusals require original no-root proof before one helper release", async context => {
  for (const scenario of ["no-process-before-create", "no-process-create-refused"]) {
    const value = fixture(context, scenario); await assert.rejects(value.owner.launch(LAUNCH), /NATIVE_REFUSAL/u);
    assert.deepEqual(value.actions, ["launch", "identity", "no-process-proof"]);
    assert.equal(value.owner.status().binding, null); assert.equal(value.owner.status().noProcessCleanupAvailable, true);
    const result = await value.owner.releaseNoProcess();
    assert.deepEqual(result, { launchRequestOutcome: "native-refused", creationState: scenario === "no-process-create-refused" ? "returned-false" : "not-entered",
      processCreated: false, released: true });
    assert.equal(Object.isFrozen(result), true); assert.equal(value.child.exitCode, 0);
    assert.deepEqual(value.actions, ["launch", "identity", "no-process-proof", "release-no-process"]);
  }
});
void test("native unknown creation or nonzero failure output cannot be inferred from empty identity", async context => {
  for (const scenario of ["no-process-create-unknown", "no-process-nonzero-output", "no-process-proof-malformed"]) {
    const value = fixture(context, scenario); await assert.rejects(value.owner.launch(LAUNCH), /NATIVE_REFUSAL|NO_PROCESS_PROOF/u);
    assert.equal(value.owner.status().noProcessCleanupAvailable, false); assert.equal(value.owner.status().binding, null);
    const before = value.actions.length; await assert.rejects(value.owner.releaseNoProcess(), /NO_PROCESS_CLEANUP_UNAVAILABLE/u);
    assert.equal(value.actions.length, before); assert.equal(value.child.stdin?.writableEnded, false);
  }
});
void test("native failed-creation error survives inspection and exact original cleanup without leaking exception text", async context => {
  const value = fixture(context, "no-process-win32");
  await assert.rejects(value.owner.launch(LAUNCH), /NATIVE_REFUSAL/u);
  assert.equal(value.owner.status().nativeLaunchError, "pcb-diagnostic-post-create-failure");
  assert.equal(value.owner.status().createProcessError, 87);
  assert.deepEqual(await value.owner.releaseNoProcess(), { launchRequestOutcome: "native-refused",
    creationState: "returned-false", createProcessError: 87, processCreated: false, released: true });
});
void test("invalid or changed native creation error cannot be accepted as cleanup proof", async context => {
  const invalid = fixture(context, "no-process-win32-invalid");
  await assert.rejects(invalid.owner.launch(LAUNCH), /NO_PROCESS_PROOF/u);
  assert.equal(invalid.owner.status().noProcessCleanupAvailable, false);
  const changed = fixture(context, "no-process-win32-changed");
  await assert.rejects(changed.owner.launch(LAUNCH), /NATIVE_REFUSAL/u);
  await assert.rejects(changed.owner.releaseNoProcess(), /NO_PROCESS_PROOF_CHANGED/u);
  assert.equal(changed.child.stdin?.writableEnded, false);
});
void test("malformed or changed no-process release proof never ends stdin or permits retry", async context => {
  for (const scenario of ["no-process-release-malformed", "no-process-release-changed"]) {
    const value = fixture(context, scenario); await assert.rejects(value.owner.launch(LAUNCH), /NATIVE_REFUSAL/u);
    await assert.rejects(value.owner.releaseNoProcess(), /NO_PROCESS_PROOF/u);
    assert.equal(value.child.stdin?.writableEnded, false); assert.equal(value.owner.status().released, false);
    assert.equal(value.owner.status().noProcessCleanupAvailable, false);
    await assert.rejects(value.owner.releaseNoProcess(), /RELEASE_CONSUMED/u);
    assert.equal(value.actions.filter(action => action === "release-no-process").length, 1);
  }
});
void test("source drift still blocks no-process cleanup without re-admitting installation", async context => {
  const value = fixture(context); value.installation.valid = false;
  await assert.rejects(value.owner.launch(LAUNCH), /installation changed/u); value.source.valid = false;
  await assert.rejects(value.owner.releaseNoProcess(), /source changed/u);
  assert.deepEqual(value.actions, []); assert.equal(value.child.stdin?.writableEnded, false);
});
void test("native no-process release acknowledgment does not hide late helper failure", async context => {
  const value = fixture(context, "no-process-release-late-stderr"); await assert.rejects(value.owner.launch(LAUNCH), /NATIVE_REFUSAL/u);
  await assert.rejects(value.owner.releaseNoProcess(), /HELPER_STDERR/u);
  assert.equal(value.owner.status().failure, "HELPER_STDERR"); assert.equal(value.owner.status().noProcessCleanupAvailable, false);
});
void test("pending or timed-out native launch cannot qualify for no-process cleanup", async context => {
  const value = fixture(context, "launch-hang"); context.mock.timers.enable({ apis: ["setTimeout"] });
  const pending = value.owner.launch(LAUNCH), rejected = assert.rejects(pending, /HELPER_DEADLINE/u);
  await yieldToEventLoop(); assert.deepEqual(value.actions, ["launch"]);
  assert.equal(value.owner.status().noProcessCleanupAvailable, false);
  await assert.rejects(value.owner.releaseNoProcess(), /NO_PROCESS_CLEANUP_UNAVAILABLE/u);
  context.mock.timers.tick(15_001); await rejected;
  assert.equal(value.owner.status().failure, "HELPER_DEADLINE"); assert.equal(value.owner.status().noProcessCleanupAvailable, false);
  await assert.rejects(value.owner.releaseNoProcess(), /NO_PROCESS_CLEANUP_UNAVAILABLE/u);
  assert.deepEqual(value.actions, ["launch"]); assert.equal(value.child.stdin?.writableEnded, false);
});
void test("malformed launch acknowledgment cannot become a completed native refusal", async context => {
  const value = fixture(context, "launch-malformed"); await assert.rejects(value.owner.launch(LAUNCH), /HELPER_FRAMING/u);
  assert.equal(value.owner.status().noProcessCleanupAvailable, false);
  await assert.rejects(value.owner.releaseNoProcess(), /NO_PROCESS_CLEANUP_UNAVAILABLE/u);
  assert.deepEqual(value.actions, ["launch"]); assert.equal(value.child.stdin?.writableEnded, false);
});
void test("diagnostic protocol failure preserves normal-close access and original helper", async context => {
  const value = fixture(context, "malformed-cdp"); await value.owner.launch(LAUNCH);
  await assert.rejects(value.owner.getVersion(), /PIPE_REPLY/u);
  assert.equal(value.child.stdin?.writableEnded, false); assert.equal(value.child.exitCode, null);
  assert.equal(value.owner.status().failure, null);
  await assert.rejects(value.owner.getTargets(), /PIPE_REPLY/u);
  assert.equal(value.actions.filter(action => action === "send").length, 1);
  await close(value);
});
void test("native write refusal preserves helper and never retries discovery", async context => {
  const value = fixture(context, "native-send-failed"); await value.owner.launch(LAUNCH);
  await assert.rejects(value.owner.getVersion(), { message: "PCB_DIAGNOSTIC_PIPE_OUTPUT:pcb-diagnostic-partial-write" });
  // The retained bounded cause diagnoses the original failure. It grants no
  // Retry and does not claim the native write had no effect.
  await assert.rejects(value.owner.getTargets(), { message: "PCB_DIAGNOSTIC_PIPE_OUTPUT:pcb-diagnostic-partial-write" });
  assert.equal(value.owner.status().nativeSendError, "pcb-diagnostic-partial-write");
  assert.equal(value.child.stdin?.writableEnded, false); await close(value);
  assert.equal(value.actions.filter(action => action === "send").length, 1);
});
void test("native send diagnostics exclude untrusted exception text and preserve the original helper", async context => {
  const value = fixture(context, "native-send-private-error"); await value.owner.launch(LAUNCH);
  await assert.rejects(value.owner.getVersion(), { message: "PCB_DIAGNOSTIC_PIPE_OUTPUT" });
  assert.equal(value.owner.status().failure, "HELPER_REPLY");
  assert.equal(value.owner.status().nativeSendError, null);
  assert.equal(value.child.stdin?.writableEnded, false); assert.equal(value.child.exitCode, null);
  assert.equal(value.actions.filter(action => action === "send").length, 1);
  await assert.rejects(value.owner.getTargets(), { message: "PCB_DIAGNOSTIC_OWNER_HELPER_REPLY" });
  assert.equal(value.actions.filter(action => action === "send").length, 1);
});
void test("malformed helper chunk immediately poisons discovery without another poll or send", async context => {
  const value = fixture(context, "malformed-chunk"); await value.owner.launch(LAUNCH);
  await assert.rejects(value.owner.getVersion(), /PIPE_CHUNK/u);
  const before = value.actions.length;
  await assert.rejects(value.owner.getTargets(), /PIPE_INPUT/u);
  assert.equal(value.actions.length, before); assert.equal(value.child.stdin?.writableEnded, false);
  await close(value);
});
void test("post-create native failure recovers only original retained binding for normal close", async context => {
  const value = fixture(context, "launch-failed");
  await assert.rejects(value.owner.launch(LAUNCH), /NATIVE_REFUSAL/u);
  assert.equal(value.owner.status().binding?.rootPid, 123);
  assert.deepEqual(value.actions, ["launch", "identity"]);
  assert.equal(value.owner.status().cleanupOnly, true);
  assert.equal(value.owner.status().noProcessCleanupAvailable, false);
  await assert.rejects(value.owner.releaseNoProcess(), /NO_PROCESS_CLEANUP_UNAVAILABLE/u);
  await assert.rejects(value.owner.getVersion(), /CLEANUP_ONLY/u);
  await assert.rejects(value.owner.launch(LAUNCH), /LAUNCH_CONSUMED/u); await close(value);
});

void test("missing original creation time still retains cleanup-only normal closure", async context => {
  const value = fixture(context, "launch-time-missing"); await assert.rejects(value.owner.launch(LAUNCH), /NATIVE_REFUSAL/u);
  assert.equal(value.owner.status().binding?.rootCreated, "0"); assert.equal(value.owner.status().cleanupOnly, true);
  assert.equal(value.owner.status().noProcessCleanupAvailable, false);
  await assert.rejects(value.owner.releaseNoProcess(), /NO_PROCESS_CLEANUP_UNAVAILABLE/u);
  await assert.rejects(value.owner.getTargets(), /CLEANUP_ONLY/u); await close(value);
});
void test("retained owner performs one exact frame context and script-source inspection over real child pipes", async context => {
  const value = fixture(context, "identity"); await value.owner.launch(LAUNCH);
  const source = "const syntheticIdentity = true;\n";
  const expected = { targetId: "target-1", frameId: "frame-1", frameUrl: "file:///synthetic/pcb.html", scriptUrl: "file:///synthetic/pcb.js",
    scriptSha256: createHash("sha256").update(source).digest("hex"), scriptBytes: Buffer.byteLength(source) };
  const observed = await value.owner.inspectFrameIdentity(expected);
  assert.equal(observed["sourceVerified"], true); assert.equal(observed["projectWorkerAssociationVerified"], false);
  assert.equal(observed["executionAuthorized"], false); assert.equal(observed["sourceSha256"], expected.scriptSha256);
  assert.equal(value.actions.filter(action => action === "send").length, 9);
  await assert.rejects(value.owner.inspectFrameIdentity(expected), /INSPECTION_CONSUMED/u);
  await close(value);
});
void test("navigation during source inspection is terminal but leaves original normal close usable", async context => {
  const value = fixture(context, "identity-navigation"); await value.owner.launch(LAUNCH);
  const source = "const syntheticIdentity = true;\n";
  const expected = { targetId: "target-1", frameId: "frame-1", frameUrl: "file:///synthetic/pcb.html", scriptUrl: "file:///synthetic/pcb.js",
    scriptSha256: createHash("sha256").update(source).digest("hex"), scriptBytes: Buffer.byteLength(source) };
  await assert.rejects(value.owner.inspectFrameIdentity(expected), /PIPE_REPLY/u);
  assert.equal(value.child.stdin?.writableEnded, false); assert.equal(value.owner.status().failure, null);
  await assert.rejects(value.owner.inspectFrameIdentity(expected), /INSPECTION_CONSUMED/u); await close(value);
});
void test("native base64 envelopes transport a12 MiB source without using ordinary frame bounds", async context => {
  const value = fixture(context, "identity-large-source"); await value.owner.launch(LAUNCH);
  const source = "x".repeat(12 * 1024 * 1024);
  const expected = { targetId: "target-1", frameId: "frame-1", frameUrl: "file:///synthetic/pcb.html", scriptUrl: "file:///synthetic/pcb.js",
    scriptSha256: createHash("sha256").update(source).digest("hex"), scriptBytes: Buffer.byteLength(source) };
  const observed = await value.owner.inspectFrameIdentity(expected);
  assert.equal(observed["sourceBytes"], 12 * 1024 * 1024); assert.equal(observed["sourceSha256"], expected.scriptSha256);
  assert.equal(observed["executionAuthorized"], false); await close(value);
});
void test("staged browser frame and pinned script observations retain one attachment with actual child frame identity", async context => {
  const value = fixture(context, "staged"); await value.owner.launch(LAUNCH);
  const browser = await value.owner.browserObservation(); assert.equal(browser["projectFreeVerified"], false);
  assert.equal(browser["debuggerSocketAbsenceVerified"], false); assert.equal(browser["bridgeAuthentication"], false);
  assert.deepEqual(browser["targets"], [{ targetId: "target-1", type: "page", url: "file:///synthetic/ui.html", attached: false }]);
  await assert.rejects(value.owner.inspectFrames("frame-1"), /TARGET_UNOBSERVED/u);
  const frames = await value.owner.inspectFrames("target-1"); assert.ok(Array.isArray(frames["frames"]));
  assert.equal(frames["frames"].length, 2);
  const identity = await value.owner.inspectScript("frame-1", SCRIPT_PROFILE);
  assert.equal(identity["sourceVerified"], true); assert.equal(identity["sourceSha256"], SCRIPT_PROFILE.scriptSha256);
  assert.equal(JSON.stringify(identity).includes("private-console-data"), false); assert.equal(Object.hasOwn(identity, "events"), false);
  assert.equal(value.owner.status().browserObservationConsumed, true); assert.equal(value.owner.status().scriptInspectionConsumed, true);
  assert.equal(value.actions.filter(action => action === "send").length, 15);
  await assert.rejects(value.owner.browserObservation(), /CONSUMED/u);
  await assert.rejects(value.owner.inspectFrames("target-1"), /UNAVAILABLE/u);
  await assert.rejects(value.owner.inspectScript("frame-1", SCRIPT_PROFILE), /UNAVAILABLE/u); await close(value);
});
void test("staged observation rejects changed discovery targets before attachment and retains cleanup", async context => {
  const value = fixture(context, "staged-target-changed"); await value.owner.launch(LAUNCH); await value.owner.browserObservation();
  await assert.rejects(value.owner.inspectFrames("target-1"), /TARGET_CHANGED/u);
  assert.equal(value.actions.filter(action => action === "send").length, 3);
  assert.equal(value.child.stdin?.writableEnded, false); await close(value);
});
void test("parent-scoped worker observations finish within32fixed requests and preserve original closure", async context => {
  const value = fixture(context, "staged-worker"); await value.owner.launch(LAUNCH);
  await value.owner.browserObservation(); await value.owner.inspectFrames("target-1");
  await value.owner.inspectScript("frame-1", SCRIPT_PROFILE);
  const profile = { relativePath: "test/js/project-worker.js", scriptSha256: SCRIPT_PROFILE.scriptSha256, scriptBytes: SCRIPT_PROFILE.scriptBytes };
  const workers = await value.owner.inspectWorkers(profile);
  assert.deepEqual(workers["workers"], [{ targetId: "worker-1", sessionId: "worker-session-1", type: "worker" }]);
  const source = await value.owner.inspectWorkerScript("worker-1"); assert.equal(source["sourceVerified"], true);
  const state = await value.owner.observeWorkerState(); assert.equal(state["queueCompletionVerified"], false);
  assert.equal(state["executionAuthorized"], false); assert.equal(state["compilerOwnerVerified"], false);
  assert.equal(JSON.stringify(state).includes("file:///"), false);
  assert.equal(value.actions.filter(action => action === "send").length, 32);
  await assert.rejects(value.owner.inspectWorkers(profile), /UNAVAILABLE/u);
  await assert.rejects(value.owner.inspectWorkerScript("worker-1"), /UNAVAILABLE/u);
  await assert.rejects(value.owner.observeWorkerState(), /UNAVAILABLE/u);
  await close(value);
});
void test("worker source, effect-check and context failures preserve original native cleanup", async context => {
  for (const scenario of ["staged-worker-source-drift", "staged-worker-effect-refused", "staged-worker-context-lost"]) {
    const value = fixture(context, scenario); await value.owner.launch(LAUNCH);
    await value.owner.browserObservation(); await value.owner.inspectFrames("target-1");
    await value.owner.inspectWorkers({ relativePath: "test/js/project-worker.js",
      scriptSha256: SCRIPT_PROFILE.scriptSha256, scriptBytes: SCRIPT_PROFILE.scriptBytes });
    if (scenario === "staged-worker-source-drift") {
      await assert.rejects(value.owner.inspectWorkerScript("worker-1"), /WORKER_IDENTITY/u);
    } else {
      await value.owner.inspectWorkerScript("worker-1");
      await assert.rejects(value.owner.observeWorkerState(), /WORKER_|PIPE_REPLY/u);
    }
    assert.equal(value.child.stdin?.writableEnded, false);
    assert.notEqual(value.owner.status().diagnosticFailure, null);
    await close(value);
  }
});
void test("staged frame drift and navigation invalidate script observation without losing original close", async context => {
  for (const scenario of ["staged-frame-changed", "staged-navigation"]) {
    const value = fixture(context, scenario); await value.owner.launch(LAUNCH); await value.owner.browserObservation();
    await value.owner.inspectFrames("target-1");
    await assert.rejects(value.owner.inspectScript("frame-1", SCRIPT_PROFILE), /IDENTITY|PIPE_REPLY/u);
    assert.equal(value.child.stdin?.writableEnded, false); assert.notEqual(value.owner.status().diagnosticFailure, null);
    if (scenario === "staged-navigation") {
      const failure = value.owner.status().diagnosticFailureObservation;
      assert.equal(failure?.reason, "event-callback"); assert.equal(failure?.eventKind, "Page.frameNavigated");
      assert.equal(failure?.request?.method, "Debugger.getScriptSource");
      assert.equal(failure?.dispatchAbsenceVerified, false);
    }
    await assert.rejects(value.owner.inspectScript("frame-1", SCRIPT_PROFILE), /UNAVAILABLE/u); await close(value);
  }
});
void test("staged native envelopes transport18MiB source within unchanged32MiB frame and64MiB lifetime", async context => {
  const value = fixture(context, "staged-large-source"); await value.owner.launch(LAUNCH); await value.owner.browserObservation();
  await value.owner.inspectFrames("target-1"); const source = "x".repeat(18 * 1024 * 1024);
  const observed = await value.owner.inspectScript("frame-1", { ...SCRIPT_PROFILE, scriptBytes: Buffer.byteLength(source),
    scriptSha256: createHash("sha256").update(source).digest("hex") });
  assert.equal(observed["sourceBytes"], 18 * 1024 * 1024); assert.equal(observed["sourceVerified"], true); await close(value);
});
void test("duplicate helper fields and stderr revoke protocol without disconnecting the original helper", async context => {
  for (const scenario of ["duplicate", "stderr"]) {
    const value = fixture(context, scenario); await value.owner.launch(LAUNCH);
    await assert.rejects(value.owner.getVersion(), /PIPE_OUTPUT/u);
    assert.notEqual(value.owner.status().failure, null);
    assert.equal(value.child.stdin?.writableEnded, false); assert.equal(value.child.exitCode, null);
    await assert.rejects(value.owner.observeTermination(), /HELPER_/u);
    assert.equal(value.actions.includes("release"), false);
  }
});
void test("source drift consumes launch before native dispatch and preserves the helper", async context => {
  const value = fixture(context); value.source.valid = false;
  await assert.rejects(value.owner.launch(LAUNCH), /source changed/u);
  assert.equal(value.actions.length, 0); assert.equal(value.child.stdin?.writableEnded, false);
  await assert.rejects(value.owner.launch(LAUNCH), /LAUNCH_CONSUMED/u);
});
void test("helper failure after release acknowledgment defeats successful cleanup", async context => {
  const value = fixture(context, "late-stderr"); await value.owner.launch(LAUNCH);
  await value.owner.requestNormalClose("456");
  await assert.rejects(value.owner.releaseClosed(), /HELPER_STDERR/u);
  assert.equal(value.owner.status().failure, "HELPER_STDERR");
});
void test("helper deadline retains original child stdin and consumes the failed discovery", async context => {
  const value = fixture(context, "hang"); await value.owner.launch(LAUNCH);
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const pending = value.owner.getVersion();
  const rejected = assert.rejects(pending, /PIPE_DEADLINE/u);
  await yieldToEventLoop();
  assert.equal(value.actions.at(-1), "send");
  context.mock.timers.tick(15_001); await rejected;
  assert.equal(value.owner.status().failure, "HELPER_DEADLINE");
  assert.equal(value.child.stdin?.writableEnded, false); assert.equal(value.child.exitCode, null);
  await assert.rejects(value.owner.getTargets(), /HELPER_DEADLINE/u);
  assert.equal(value.actions.filter(action => action === "send").length, 1);
});
void test("concurrent observation cannot interleave normal close with an owned discovery", async context => {
  const value = fixture(context); await value.owner.launch(LAUNCH);
  const discovery = value.owner.getVersion();
  await assert.rejects(value.owner.requestNormalClose("456"), /BUSY/u);
  assert.equal(value.owner.status().closeConsumed, false); await discovery; await close(value);
});
void test("diagnostic native source preserves original handles, explicit inheritance and EOF retention", async () => {
  const source = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  assert.ok(source.includes("root=info.process; rootThread=info.thread; rootPid=info.processId;"));
  const core = source.slice(source.indexOf("void CreateVerifiedRoot()"), source.indexOf("// Exact worker diagnostic program."));
  let cursor = -1;
  for (const marker of ["CreateProcess(installation.Executable,new StringBuilder(args),IntPtr.Zero,IntPtr.Zero,true,0x00080004",
    "root=info.process; rootThread=info.thread; rootPid=info.processId;",
    "GetProcessTimes(root,out created,out exited,out kernel,out user)", "AssertLive(); installation.AssertCreatedImage(root);",
    'if(ResumeThread(rootThread)!=1) throw Error("primary-thread-resume");', "Close(ref rootThread);"]) {
    const next = core.indexOf(marker); assert.ok(next > cursor, `Original suspended launch order: ${marker}`); cursor = next;
  }
  const release = source.slice(source.indexOf("public void ReleaseClosed()"), source.indexOf("public void RetainUntilClosed()"));
  assert.ok(release.includes('if(!Terminated()) throw Error("retain-live-owner");'));
  assert.ok(release.indexOf("Close(ref rootThread);") > release.indexOf('if(!Terminated()) throw Error("retain-live-owner");'));
  assert.ok(source.includes("new IntPtr(0x0002000D)")); assert.ok(source.includes("new IntPtr(0x00020002)"));
  assert.ok(source.includes("Close(ref browserRead); Close(ref browserWrite); AssertLive();"));
  assert.ok(source.includes("} finally {$owner.RetainUntilClosed()}"));
  assert.ok(source.includes("RootExited() && JobCount()==0 && RootExited() && JobCount()==0"));
  assert.ok(source.includes("creationPhase=CreationPhase.Unknown;"));
  assert.ok(source.includes("info.process==IntPtr.Zero && info.thread==IntPtr.Zero && info.processId==0 && info.threadId==0"));
  assert.ok(source.includes("} finally { launchSettled=true; }"));
  assert.ok(source.includes("if(JobCount()!=0 || JobCount()!=0) throw Error(\"no-process-job-not-empty\");"));
  assert.ok(source.includes("if(creationPhase==CreationPhase.Unknown || (creationPhase==CreationPhase.RootRetained && root==IntPtr.Zero)) return false;"));
  assert.ok(!source.includes("Process.GetProcessById")); assert.ok(!source.includes("TerminateProcess"));
  assert.ok(!source.includes("--remote-debugging-port"));
  assert.ok(source.includes('const string WorkerExpression=@"'));
  assert.ok(!source.includes("$request.expression"));
  assert.ok(!source.includes("$request.params"));
});
const OPEN_PATH = String.raw`C:\Disposable\Selected.eprj2`;
const OPEN_TARGET = { rawWindowsPath: OPEN_PATH, projectUuid: createHash("sha256").update(OPEN_PATH).digest("hex"), branchUuid: "b".repeat(32),
  documentUuid: "d".repeat(16), expectedSourceSha256: "e".repeat(64) };
const UI_PROFILE = { ...SCRIPT_PROFILE, family: "ui", relativePath: "pro-ui/test-version/js/ui.js" } as const;
async function openingFixture(context: TestContext, scenario = "opening"): Promise<ReturnType<typeof fixture>> {
  const value = fixture(context, scenario);
  await value.owner.launch(LAUNCH); await value.owner.browserObservation(); await value.owner.inspectFrames("target-1");
  await value.owner.inspectScript("frame-1", UI_PROFILE); return value;
}
void test("diagnostic project opening retains exact source and one-shot transition before worker discovery", async context => {
  const value = await openingFixture(context);
  let reproofs = 0;
  const result = await value.owner.openProject(OPEN_TARGET, async () => {
    reproofs += 1; assert.deepEqual(value.openingPhases, ["preflight"]); await Promise.resolve();
  });
  assert.equal(result.ok, true); assert.equal(result.status, "opened-prefix-observed"); assert.equal(reproofs, 1);
  assert.equal(result.nativeWorkMayRemain, true); assert.equal(result.compilerOwnerVerified, false);
  assert.equal(value.owner.status().projectOpeningConsumed, true);
  assert.equal(value.owner.status().projectOpeningResult, result);
  assert.deepEqual(value.openingPhases, ["preflight", "open-project"]);
  assert.equal(value.actions.filter(action => action === "send").length, 23);
  await assert.rejects(value.owner.openProject(OPEN_TARGET, () => Promise.resolve()), /OPENING_UNAVAILABLE/u);
  const workers = await value.owner.inspectWorkers(); assert.deepEqual(workers["workers"], []);
  assert.equal(value.actions.filter(action => action === "send").length, 28);
  await close(value);
});
void test("fixed diagnostic opening may carry a validated long path without widening unrelated requests", async context => {
  const value = await openingFixture(context);
  const rawWindowsPath = `C:\\${"界".repeat(2000)}\\Selected.eprj2`;
  const result = await value.owner.openProject({ ...OPEN_TARGET, rawWindowsPath,
    projectUuid: createHash("sha256").update(rawWindowsPath).digest("hex") }, () => Promise.resolve());
  assert.equal(result.ok, true); assert.deepEqual(value.openingPhases, ["preflight", "open-project"]); await close(value);
});
void test("refused fixed preflight and open replies consume navigation stage and keep original close usable", async context => {
  for (const scenario of ["opening-preflight-refused", "opening-open-refused"]) {
    const value = await openingFixture(context, scenario);
    let reproofs = 0;
    const result = await value.owner.openProject(OPEN_TARGET, () => { reproofs += 1; return Promise.resolve(); });
    assert.equal(result.ok, false); assert.equal(value.owner.status().projectOpeningResult, result);
    assert.equal(reproofs, scenario === "opening-preflight-refused" ? 0 : 1);
    assert.deepEqual(value.openingPhases, scenario === "opening-preflight-refused" ? ["preflight"] : ["preflight", "open-project"]);
    assert.equal(value.child.stdin?.writableEnded, false); assert.notEqual(value.owner.status().diagnosticFailure, null);
    await assert.rejects(value.owner.openProject(OPEN_TARGET, () => Promise.resolve()), /OPENING_UNAVAILABLE/u);
    await assert.rejects(value.owner.inspectWorkers(), /PIPE_INPUT/u); await close(value);
  }
});
void test("checkpoint or installation drift after preflight never dispatches opening or clears consumption", async context => {
  for (const scenario of ["checkpoint", "installation", "source"]) {
    const value = await openingFixture(context);
    await assert.rejects(value.owner.openProject(OPEN_TARGET, () => {
      if (scenario === "checkpoint") { return Promise.reject(new Error("checkpoint changed")); }
      if (scenario === "installation") { value.installation.valid = false; } else { value.source.valid = false; }
      return Promise.resolve();
    }), /changed/u);
    assert.deepEqual(value.openingPhases, ["preflight"]);
    assert.equal(value.owner.status().projectOpeningResult?.phase, "preflight");
    assert.equal(value.owner.status().projectOpeningConsumed, true);
    assert.notEqual(value.owner.status().diagnosticFailure, null);
    value.installation.valid = true; value.source.valid = true;
    await assert.rejects(value.owner.openProject(OPEN_TARGET, () => Promise.resolve()), /OPENING_UNAVAILABLE/u); await close(value);
  }
});
void test("uncertain opening reply, context loss and forbidden restored frames are terminal without replay", async context => {
  for (const scenario of ["opening-malformed-reply", "opening-context-lost", "opening-no-event", "opening-title-changed", "opening-child-frame"]) {
    const value = await openingFixture(context, scenario);
    await assert.rejects(value.owner.openProject(OPEN_TARGET, () => Promise.resolve()), /OPENING_REPLY|PIPE_REPLY|CONTEXT_IDENTITY/u);
    assert.deepEqual(value.openingPhases, ["preflight", "open-project"]);
    assert.equal(value.owner.status().projectOpeningConsumed, true);
    assert.equal(value.owner.status().projectOpeningResult?.phase,
      scenario === "opening-malformed-reply" || scenario === "opening-context-lost" ? "preflight" : "open-project");
    assert.equal(value.child.stdin?.writableEnded, false); assert.notEqual(value.owner.status().diagnosticFailure, null);
    await assert.rejects(value.owner.openProject(OPEN_TARGET, () => Promise.resolve()), /OPENING_UNAVAILABLE/u); await close(value);
  }
});
void test("already sampled workers cannot be followed by a diagnostic project open", async context => {
  const value = await openingFixture(context); await value.owner.inspectWorkers();
  await assert.rejects(value.owner.openProject(OPEN_TARGET, () => Promise.resolve()), /OPENING_UNAVAILABLE/u);
  assert.equal(value.owner.status().projectOpeningConsumed, false); assert.deepEqual(value.openingPhases, []); await close(value);
});
void test("fixed model observation stays in the source-admitted PCB session and releases its private group", async context => {
  const value = fixture(context, "staged-model"); await value.owner.launch(LAUNCH);
  await value.owner.browserObservation(); await value.owner.inspectFrames("target-1");
  await value.owner.inspectScript("frame-1", SCRIPT_PROFILE);
  const result = await value.owner.observeModelState();
  assert.equal(result.compilerState.main.headType, "PCB"); assert.equal(result.queueCompletionVerified, false);
  assert.equal(result.pendingProducers.documentUuid, result.documentUuid); assert.equal(result.rawStrings.documentUuid, result.documentUuid);
  assert.equal(result.rootInventory.documentUuid, result.documentUuid); assert.equal(result.rootInventory.emptyRootPcbVerified, false);
  assert.equal(result.atomicSnapshotVerified, false);
  assert.equal(result.saveAuthorized, false); assert.equal(value.owner.status().modelObservationConsumed, true);
  assert.equal(value.actions.filter(action => action === "send").length, 48);
  assert.ok(!JSON.stringify(result).includes("synthetic private"));
  await assert.rejects(value.owner.observeModelState(), /MODEL_OBSERVATION_UNAVAILABLE/u);
  await assert.rejects(value.owner.inspectWorkers(), /WORKER_INSPECTION_UNAVAILABLE/u);
  await assert.rejects(value.owner.openProject(OPEN_TARGET, () => Promise.resolve()), /PROJECT_OPENING_UNAVAILABLE/u);
  await close(value);
});
void test("model source, scope cleanup and context failures retain the original process cleanup", async context => {
  for (const scenario of ["staged-model-source-refused", "staged-model-release-refused", "staged-model-context-lost", "staged-model-document-drift"]) {
    const value = fixture(context, scenario); await value.owner.launch(LAUNCH);
    await value.owner.browserObservation(); await value.owner.inspectFrames("target-1"); await value.owner.inspectScript("frame-1", SCRIPT_PROFILE);
    await assert.rejects(value.owner.observeModelState(), /MODEL_SCOPE|MODEL_OBSERVATION|PIPE_REPLY/u);
    assert.equal(value.owner.status().modelObservationConsumed, true); assert.notEqual(value.owner.status().diagnosticFailure, null);
    assert.equal(value.owner.status().observationFailure?.family, "MODEL");
    assert.equal(value.child.stdin?.writableEnded, false);
    await assert.rejects(value.owner.observeModelState(), /MODEL_OBSERVATION_UNAVAILABLE/u); await close(value);
  }
  const opened = await openingFixture(context);
  await opened.owner.openProject(OPEN_TARGET, () => Promise.resolve());
  await assert.rejects(opened.owner.observeModelState(), /MODEL_OBSERVATION_UNAVAILABLE/u); await close(opened);
});

void test("disposable PCB opening admits original child DOM and source before its identity RPC and model samples", async context => {
  const value = await openingFixture(context, "opening-pcb");
  await value.owner.openProject(OPEN_TARGET, () => Promise.resolve());
  let reproofs = 0;
  const opened = await value.owner.openPcb(OPEN_TARGET, () => { reproofs += 1; return Promise.resolve(); });
  assert.equal(opened.ok, true); assert.equal(opened.status, "opened"); assert.equal(reproofs, 1);
  assert.equal(value.owner.status().pcbSourceQualified, false);
  await assert.rejects(value.owner.observeModelState(), /MODEL_OBSERVATION_UNAVAILABLE/u);
  const observed = await value.owner.observePcbOpening(OPEN_TARGET, SCRIPT_PROFILE);
  assert.equal(observed["sourceVerified"], true); assert.equal(observed["domOwnerVerified"], true);
  assert.equal(value.owner.status().pcbSourceQualified, true);
  const model = await value.owner.observeModelState();
  assert.equal(model.documentUuid, OPEN_TARGET.documentUuid); assert.equal(model.executionAuthorized, false);
  assert.deepEqual(value.pcbPhases, ["preflight", "open-document", "observe"]);
  assert.equal(value.actions.filter(action => action === "send").length, 72);
  await assert.rejects(value.owner.openPcb(OPEN_TARGET, () => Promise.resolve()), /PCB_OPENING_UNAVAILABLE/u);
  await assert.rejects(value.owner.observePcbOpening(OPEN_TARGET, SCRIPT_PROFILE), /PCB_OBSERVATION_UNAVAILABLE/u);
  await assert.rejects(value.owner.inspectWorkers(), /WORKER_INSPECTION_UNAVAILABLE/u);
  await close(value);
});
void test("all fixed PCB phases carry the original maximum-width Unicode path within the bounded native request", async context => {
  const value = await openingFixture(context, "opening-pcb");
  const rawWindowsPath = `C:\\${"界".repeat(4096 - String.raw`C:\\Selected.eprj2`.length)}\\Selected.eprj2`;
  assert.equal(rawWindowsPath.length, 4096); assert.ok(Buffer.byteLength(rawWindowsPath) > 4096);
  const target = { ...OPEN_TARGET, rawWindowsPath, projectUuid: createHash("sha256").update(rawWindowsPath).digest("hex") };
  await value.owner.openProject(target, () => Promise.resolve());
  const opened = await value.owner.openPcb(target, () => Promise.resolve());
  assert.equal(opened.ok, true);
  const observed = await value.owner.observePcbOpening(target, SCRIPT_PROFILE);
  assert.equal(observed["sourceVerified"], true);
  assert.deepEqual(value.pcbPhases, ["preflight", "open-document", "observe"]);
  assert.equal(value.owner.status().failure, null); await close(value);
});

void test("original source-shaped ancillary OBJECT and constructors fit the82-command budget", async context => {
  const value = await openingFixture(context, "opening-pcb-ancillary");
  await value.owner.openProject(OPEN_TARGET, () => Promise.resolve());
  await value.owner.openPcb(OPEN_TARGET, () => Promise.resolve());
  await value.owner.observePcbOpening(OPEN_TARGET, SCRIPT_PROFILE);
  const result = await value.owner.observeModelState();
  assert.equal(result.executionAuthorized, false);
  assert.equal(value.actions.filter(action => action === "send").length, 82);
  assert.deepEqual(value.openingPhases, ["preflight", "open-project"]);
  assert.deepEqual(value.pcbPhases, ["preflight", "open-document", "observe"]);
  await close(value);
});

void test("ancillary DOM refusal consumes the original opening without preflight or navigation", async context => {
  const value = await openingFixture(context, "opening-ancillary-refused");
  await assert.rejects(value.owner.openProject(OPEN_TARGET, () => Promise.resolve()), /CONTEXT_IDENTITY/u);
  assert.equal(value.owner.status().projectOpeningConsumed, true);
  assert.deepEqual(value.openingPhases, []);
  await assert.rejects(value.owner.openProject(OPEN_TARGET, () => Promise.resolve()), /OPENING_UNAVAILABLE/u);
  await close(value);
});

void test("ancillary DOM drift at each later boundary prevents downstream opening or model admission", async context => {
  for (const index of [2, 3, 4, 5]) {
    const value = await openingFixture(context, `opening-pcb-ancillary-drift-${index}`);
    if (index <= 3) {
      await assert.rejects(value.owner.openProject(OPEN_TARGET, () => Promise.resolve()), /CONTEXT_IDENTITY/u);
      assert.deepEqual(value.openingPhases, index === 2 ? ["preflight"] : ["preflight", "open-project"]);
      assert.deepEqual(value.pcbPhases, []);
    } else {
      await value.owner.openProject(OPEN_TARGET, () => Promise.resolve());
      if (index === 4) {
        await assert.rejects(value.owner.openPcb(OPEN_TARGET, () => Promise.resolve()), /CONTEXT_IDENTITY/u);
        assert.deepEqual(value.pcbPhases, ["preflight"]);
      } else {
        await value.owner.openPcb(OPEN_TARGET, () => Promise.resolve());
        await assert.rejects(value.owner.observePcbOpening(OPEN_TARGET, SCRIPT_PROFILE), /CONTEXT_IDENTITY/u);
        assert.deepEqual(value.pcbPhases, ["preflight", "open-document"]);
      }
    }
    assert.equal(value.owner.status().pcbSourceQualified, false);
    await assert.rejects(value.owner.observeModelState(), /MODEL_OBSERVATION_UNAVAILABLE/u);
    await close(value);
  }
});

void test("PCB-opening refuses a foreign sealed target and failed reproof before navigation", async context => {
  const value = await openingFixture(context, "opening-pcb");
  await value.owner.openProject(OPEN_TARGET, () => Promise.resolve());
  await assert.rejects(value.owner.openPcb({ ...OPEN_TARGET, documentUuid: "f".repeat(16) }, () => Promise.resolve()), /PCB_OPENING_UNAVAILABLE/u);
  assert.equal(value.owner.status().pcbOpeningConsumed, false);
  await assert.rejects(value.owner.openPcb(OPEN_TARGET, () => Promise.reject(new Error("synthetic reproof drift"))), /reproof drift/u);
  assert.deepEqual(value.pcbPhases, ["preflight"]); assert.equal(value.owner.status().pcbOpeningConsumed, true);
  await close(value);
});

void test("PCB DOM/source/identity failures retain cleanup and never turn acknowledgment into model authority", async context => {
  for (const scenario of ["opening-pcb-dom-drift", "opening-pcb-source-drift", "opening-pcb-observe-refused"]) {
    const value = await openingFixture(context, scenario);
    await value.owner.openProject(OPEN_TARGET, () => Promise.resolve());
    await value.owner.openPcb(OPEN_TARGET, () => Promise.resolve());
    await assert.rejects(value.owner.observePcbOpening(OPEN_TARGET, SCRIPT_PROFILE), /CONTEXT_IDENTITY|PCB_FRAME_REFUSED/u);
    assert.equal(value.owner.status().pcbSourceQualified, false);
    assert.deepEqual(value.pcbPhases, scenario === "opening-pcb-observe-refused" ?
      ["preflight", "open-document", "observe"] : ["preflight", "open-document"]);
    await assert.rejects(value.owner.observeModelState(), /MODEL_OBSERVATION_UNAVAILABLE/u);
    await close(value);
  }
});

void test("all model leaves agreeing on a foreign document still fail original sealed PCB identity", async context => {
  const value = await openingFixture(context, "opening-pcb-model-document-drift");
  await value.owner.openProject(OPEN_TARGET, () => Promise.resolve());
  await value.owner.openPcb(OPEN_TARGET, () => Promise.resolve());
  await value.owner.observePcbOpening(OPEN_TARGET, SCRIPT_PROFILE);
  await assert.rejects(value.owner.observeModelState(), /MODEL_DOCUMENT_CHANGED/u);
  assert.equal(value.owner.status().modelObservationConsumed, true); await close(value);
});

async function stringFixture(context: TestContext, scenario = "opening-pcb-string-ancillary"): Promise<ReturnType<typeof fixture>> {
  const value = fixture(context, scenario, true);
  await value.owner.launch(LAUNCH); await value.owner.browserObservation(); await value.owner.inspectFrames("target-1");
  await value.owner.inspectScript("frame-1", UI_PROFILE);
  await value.owner.openProject(OPEN_TARGET, () => Promise.resolve());
  await value.owner.openPcb(OPEN_TARGET, () => Promise.resolve());
  await value.owner.observePcbOpening(OPEN_TARGET, SCRIPT_PROFILE);
  await value.owner.inspectWorkers({ relativePath: "test/js/project-worker.js",
    scriptSha256: SCRIPT_PROFILE.scriptSha256, scriptBytes: SCRIPT_PROFILE.scriptBytes });
  await value.owner.inspectWorkerScript("worker-1");
  return value;
}

void test("separate String purpose joins both original contexts, constructors and two sweeps within exactly112requests", async context => {
  const value = await stringFixture(context);
  assert.equal(value.actions.filter(action => action === "send").length, 61);
  const result = await value.owner.observeStringPrecreate();
  assert.equal(result["schema"], "easyeda-pro-control.pcb-string-precreate-observation.v1");
  assert.equal(result["matchingSamples"], true); assert.equal(result["originalContextsRechecked"], true);
  assert.equal(result["saveAuthorized"], false); assert.equal(result["executionAuthorized"], false);
  assert.equal(result["projectWorkerAssociationVerified"], false); assert.equal(result["queueCompletionVerified"], false);
  assert.deepEqual(result["first"], result["second"]);
  assert.equal(value.owner.status().stringPrecreateConsumed, true);
  assert.equal(value.actions.filter(action => action === "send").length, 112);
  await assert.rejects(value.owner.observeStringPrecreate(), /STRING_PRECREATE_UNAVAILABLE/u);
  await assert.rejects(value.owner.observeModelState(), /MODEL_OBSERVATION_UNAVAILABLE/u);
  await assert.rejects(value.owner.observeWorkerState(), /WORKER_STATE_UNAVAILABLE/u);
  assert.equal(value.actions.filter(action => action === "send").length, 112);
  await close(value);
});

void test("String purpose refuses wrong window, compiler token and changed second sample while retaining normal closure", async context => {
  for (const scenario of ["opening-pcb-string-window-drift", "opening-pcb-string-token-drift", "opening-pcb-string-sample-drift"]) {
    const value = await stringFixture(context, scenario);
    await assert.rejects(value.owner.observeStringPrecreate(), /PCB_STRING_PRECREATE_OBSERVATION/u, scenario);
    assert.equal(value.owner.status().stringPrecreateConsumed, true);
    assert.notEqual(value.owner.status().diagnosticFailure, null);
    if (scenario !== "opening-pcb-string-window-drift") {
      assert.equal(value.owner.status().observationFailure?.family, "STRING_PRECREATE");
    }
    assert.equal(value.child.stdin?.writableEnded, false);
    await assert.rejects(value.owner.observeStringPrecreate(), /STRING_PRECREATE_UNAVAILABLE/u);
    await close(value);
  }
});

void test("pending leaf survives successful cleanup and later synthetic pipe invalidation", async context => {
  const value = await stringFixture(context, "opening-pcb-string-pending-refused");
  await assert.rejects(value.owner.observeStringPrecreate(), /FAILED_PENDING_LEAF_TEARDROPS_OWN$/u);
  const status = value.owner.status();
  assert.equal(status.observationFailure?.phase, "pending");
  assert.deepEqual(status.observationFailure?.leaf, {
    schema: "easyeda-pro-control.pcb-diagnostic-pending-failure.v1", stage: "teardrops", reason: "own",
  });
  assert.equal(status.observationFailure?.cleanupFailed, false);
  assert.equal(status.diagnosticFailureObservation?.reason, "input");
  assert.equal(status.diagnosticFailureObservation?.request?.method, "Runtime.releaseObjectGroup");
  assert.equal(status.diagnosticFailureObservation?.requestPending, false);
  assert.equal(status.stringPrecreateConsumed, true);
  await assert.rejects(value.owner.observeStringPrecreate(), /STRING_PRECREATE_UNAVAILABLE/u);
  await close(value);
});

void test("diagnostic purpose never adopts joined String observations or worker-plus-PCB admission", async context => {
  const value = await openingFixture(context, "opening-pcb");
  await value.owner.openProject(OPEN_TARGET, () => Promise.resolve());
  await value.owner.openPcb(OPEN_TARGET, () => Promise.resolve());
  await value.owner.observePcbOpening(OPEN_TARGET, SCRIPT_PROFILE);
  const count = value.actions.filter(action => action === "send").length;
  await assert.rejects(value.owner.inspectWorkers(), /WORKER_INSPECTION_UNAVAILABLE/u);
  await assert.rejects(value.owner.observeStringPrecreate(), /STRING_PRECREATE_UNAVAILABLE/u);
  assert.equal(value.actions.filter(action => action === "send").length, count);
  assert.equal(value.owner.status().stringPrecreateConsumed, false); await close(value);
});
