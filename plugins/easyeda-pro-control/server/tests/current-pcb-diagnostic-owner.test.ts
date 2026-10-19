import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import process from "node:process";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { setImmediate as yieldToEventLoop } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { CurrentPcbDiagnosticOwner } from "../src/current-pcb-diagnostic-owner.ts";

const LAUNCH = { executable: "C:\\Reviewed\\easyeda-pro.exe", executableSha256: "c".repeat(64), confirmDiagnosticLaunch: true } as const;
function fixture(context: TestContext, scenario = "normal"): Readonly<{
  owner: CurrentPcbDiagnosticOwner; child: ReturnType<typeof spawn>; source: { valid: boolean }; actions: string[];
}> {
  const child = spawn(process.execPath, [fileURLToPath(new URL("helpers/current-pcb-diagnostic-helper-fixture.ts", import.meta.url)), scenario], { stdio: ["pipe", "pipe", "pipe"] });
  const actions: string[] = [], source = { valid: true };
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
  const owner = new CurrentPcbDiagnosticOwner(child, () => source.valid ? Promise.resolve() : Promise.reject(new Error("source changed")));
  owner.start();
  context.after(async () => {
    if (!owner.status().helperClosed) {
      const closed = once(child, "close");
      // Synthetic test peer only. No production owner shutdown or process kill.
      child.stdin.end(); await closed;
    }
  });
  return { owner, child, source, actions };
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
  await assert.rejects(value.owner.launch(LAUNCH), /LAUNCH_CONSUMED/u); await close(value);
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
  assert.ok(!source.includes("Process.GetProcessById")); assert.ok(!source.includes("TerminateProcess"));
  assert.ok(!source.includes("--remote-debugging-port")); assert.ok(!source.includes("Runtime.evaluate"));
});
