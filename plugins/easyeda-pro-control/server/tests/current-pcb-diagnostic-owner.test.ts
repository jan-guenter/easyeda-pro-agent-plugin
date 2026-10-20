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
import { CurrentPcbDiagnosticOwner } from "../src/current-pcb-diagnostic-owner.ts";

const LAUNCH = { executable: "C:\\Reviewed\\easyeda-pro.exe", executableSha256: "c".repeat(64), confirmDiagnosticLaunch: true } as const;
const SOURCE = "const syntheticIdentity = true;\n";
const SCRIPT_PROFILE = { family: "pcb", relativePath: "pro-pcb/test-version/js/pcb.js",
  scriptSha256: createHash("sha256").update(SOURCE).digest("hex"), scriptBytes: Buffer.byteLength(SOURCE) } as const;
function fixture(context: TestContext, scenario = "normal"): Readonly<{
  owner: CurrentPcbDiagnosticOwner; child: ReturnType<typeof spawn>; source: { valid: boolean }; installation: { valid: boolean }; actions: string[];
}> {
  const child = spawn(process.execPath, [fileURLToPath(new URL("helpers/current-pcb-diagnostic-helper-fixture.ts", import.meta.url)), scenario], { stdio: ["pipe", "pipe", "pipe"] });
  const actions: string[] = [], installation = { valid: true }, source = { valid: true };
  const originalWrite = child.stdin.write.bind(child.stdin);
  // Keep actual child pipes and callbacks; observe only the generated wire data.
  context.mock.method(child.stdin, "write", (...args: Parameters<typeof child.stdin.write>) => {
    const first: unknown = args[0];
    if (typeof first === "string") {
      const parsed: unknown = JSON.parse(first); assert.ok(parsed !== null && typeof parsed === "object" && "action" in parsed);
      actions.push(String(parsed["action"]));
    }
    return originalWrite(...args);
  });
  const owner = new CurrentPcbDiagnosticOwner(child, () => source.valid ? Promise.resolve() : Promise.reject(new Error("source changed")), null,
    () => installation.valid ? Promise.resolve() : Promise.reject(new Error("installation changed")));
  owner.start();
  context.after(async () => {
    if (!owner.status().helperClosed) {
      const closed = once(child, "close");
      // Synthetic test peer only. No production owner shutdown or process kill.
      child.stdin.end(); await closed;
    }
  });
  return { owner, child, source, installation, actions };
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
  await assert.rejects(value.owner.getVersion(), /PIPE_OUTPUT/u);
  assert.equal(value.child.stdin?.writableEnded, false); await close(value);
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
void test("staged frame drift and navigation invalidate script observation without losing original close", async context => {
  for (const scenario of ["staged-frame-changed", "staged-navigation"]) {
    const value = fixture(context, scenario); await value.owner.launch(LAUNCH); await value.owner.browserObservation();
    await value.owner.inspectFrames("target-1");
    await assert.rejects(value.owner.inspectScript("frame-1", SCRIPT_PROFILE), /IDENTITY|PIPE_REPLY/u);
    assert.equal(value.child.stdin?.writableEnded, false); assert.notEqual(value.owner.status().diagnosticFailure, null);
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
  assert.ok(source.includes("finally { Close(ref rootThread); }"));
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
  assert.ok(!source.includes("--remote-debugging-port")); assert.ok(!source.includes("Runtime.evaluate"));
});
