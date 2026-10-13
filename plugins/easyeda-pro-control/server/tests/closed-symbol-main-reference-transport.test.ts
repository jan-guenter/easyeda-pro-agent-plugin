/** Fixed transport invocation with synthetic Node streams only; no OS child. */
import assert from "node:assert/strict";
import childProcess, { ChildProcess } from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import { PassThrough } from "node:stream";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { compileMainReferenceTransport, invokeMainReferenceTransport } from "../src/closed-symbol-main-reference-transport.ts";

const hash = "a".repeat(64), request = { profile: "private.exact-literal-main-reference.v1", nonce: hash, operationId: "easyeda-20261012t000000z-12345678",
  closedPlanSha256: hash, baselineCopyReceiptSha256: hash, baselineLogicalSha256: hash, baselineClosureClockSha256: hash,
  nativePinsSha256: hash, historyUuid: "b".repeat(32), createdAtLiteral: "2026-01-15 12:34:56", referenceUtcMs: 1_791_806_400_000 };
type Behavior = "success" | "split-unicode" | "bom" | "controls" | "output-limit" | "stderr-limit" | "stdin-failure" | "start-failure" | "start-throw" | "malformed-utf8" | "deadline";
function childFixture(context: TestContext, behavior: Behavior): { calls: number; kills: number } {
  const state = { calls: 0, kills: 0 };
  const intercept = ((executable: string, args: string[], options: unknown): ChildProcess => {
    state.calls += 1;
    assert.equal(executable, "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe");
    assert.deepEqual(args.slice(0, 4), ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command"]); assert.equal(args.length, 5);
    assert.match(String(args[4]), /throw 'UNREVIEWED MAIN REFERENCE TRANSPORT - DO NOT EXECUTE'/u);
    assert.deepEqual(options, { shell: false, windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
    if (behavior === "start-throw") { throw new Error("Synthetic private details must not escape"); }
    const child = new ChildProcess(), error = new PassThrough(), input = new PassThrough(), output = new PassThrough();
    Object.defineProperties(child, { stdin: { value: input }, stdout: { value: output }, stderr: { value: error } });
    context.mock.method(child, "kill", (): boolean => { state.kills += 1; return true; });
    input.resume(); input.on("finish", () => { queueMicrotask(() => {
      if (behavior === "start-failure") { child.emit("error", new Error("Synthetic private startup details")); queueMicrotask(() => { child.emit("close", 197, null); }); return; }
      if (behavior === "stdin-failure") { output.write("prefix"); input.emit("error", new Error("Synthetic private stdin details")); queueMicrotask(() => { child.emit("close", 197, null); }); return; }
      if (behavior === "deadline") { return; }
      if (behavior === "output-limit") { output.write(Buffer.alloc(131_071, 97)); output.write(Buffer.from([98, 99])); }
      else if (behavior === "stderr-limit") { output.write(Buffer.alloc(65_536, 97)); error.write(Buffer.alloc(65_537, 98)); }
      else if (behavior === "malformed-utf8") { output.write(Buffer.from([0xF0, 0x9F, 0x92])); }
      else if (behavior === "split-unicode") { const bytes = Buffer.from("A😀Z"); for (const byte of bytes) { output.write(Buffer.from([byte])); } }
      else if (behavior === "bom") { output.write(Buffer.from("\uFEFF{}")); }
      else if (behavior === "controls") { output.write(Buffer.alloc(131_072)); }
      else { output.write("complete"); }
      child.emit("close", 0, null);
      // After any terminal outcome, data and duplicate completion must not
      // Grow diagnostics, change the outcome or request a second termination.
      output.write("late"); child.emit("close", 1, "SIGTERM");
    }); });
    context.after(() => { child.emit("close", 197, null); input.destroy(); output.destroy(); error.destroy(); });
    return child;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Synthetic ChildProcess carries the real streams expected by this exact overload; no OS spawn occurs.
  }) as typeof childProcess.spawn;
  context.mock.method(childProcess, "spawn", intercept); syncBuiltinESMExports();
  context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
  if (behavior === "deadline") { context.mock.timers.enable({ apis: ["setTimeout"] }); context.after(() => { context.mock.timers.reset(); }); }
  return state;
}
for (const behavior of ["success", "split-unicode", "bom", "controls", "output-limit", "stderr-limit", "stdin-failure", "start-failure", "start-throw", "malformed-utf8", "deadline"] as const) {
  void test(`transport ${behavior} is bounded, retained and consumed once`, async (context) => {
    const prepared = await compileMainReferenceTransport(request), state = childFixture(context, behavior);
    let settled = false;
    // oxlint-disable-next-line promise/prefer-await-to-then -- Observe pending settlement at both deadline and close-drain boundaries.
    const pending = invokeMainReferenceTransport(prepared).then((result) => { settled = true; return result; });
    if (behavior === "deadline") {
      await Promise.resolve(); await Promise.resolve(); assert.equal(settled, false); assert.equal(state.kills, 0);
      context.mock.timers.tick(179_999); await Promise.resolve(); assert.equal(settled, false); assert.equal(state.kills, 0);
      context.mock.timers.tick(1); await Promise.resolve(); assert.equal(settled, false); assert.equal(state.kills, 1);
      context.mock.timers.tick(4999); await Promise.resolve(); assert.equal(settled, false); assert.equal(state.kills, 1);
      context.mock.timers.tick(1);
    }
    const outcome = await pending;
    assert.equal(state.calls, 1); assert.ok(Object.isFrozen(outcome));
    let expected: string | null = behavior;
    if (["success", "split-unicode", "bom", "controls"].includes(behavior)) { expected = null; }
    else if (behavior === "stderr-limit") { expected = "output-limit"; } else if (behavior === "start-throw") { expected = "start-failure"; }
    assert.equal(outcome.transportFailure, expected); assert.equal(outcome.timedOut, behavior === "deadline");
    const unresolved = behavior === "start-throw" || behavior === "deadline";
    assert.equal(state.kills, expected === null || behavior === "start-throw" || behavior === "malformed-utf8" ? 0 : 1);
    assert.equal(outcome.transportState, unresolved ? "unresolved" : "closed");
    assert.equal(outcome.spawnReturnObserved, behavior !== "start-throw");
    assert.equal(outcome.transportCloseObserved, !unresolved);
    assert.equal(outcome.observationGuardsComplete, behavior !== "start-throw");
    assert.equal(outcome.containmentRequest, state.kills === 0 ? "not-requested" : "accepted");
    assert.equal(outcome.windowsJobTerminationProved, false); assert.equal(outcome.executionAuthorized, false);
    if (behavior === "stdin-failure" || behavior === "start-failure") { assert.equal(outcome.exitCode, 197); assert.equal(outcome.signal, null); }
    if (expected === null) {
      let text = "complete";
      if (behavior === "split-unicode") { text = "A😀Z"; } else if (behavior === "bom") { text = "\uFEFF{}"; } else if (behavior === "controls") { text = "\0".repeat(131_072); }
      assert.equal(outcome.stdout, text); assert.equal(outcome.stderr, "");
      assert.equal(outcome.rawStdoutBase64, Buffer.from(text).toString("base64")); assert.equal(outcome.rawStderrBase64, "");
    } else {
      assert.equal(outcome.stdout, ""); assert.equal(outcome.stderr, "");
      const error = Buffer.from(outcome.rawStderrBase64, "base64"), output = Buffer.from(outcome.rawStdoutBase64, "base64");
      assert.ok(output.length + error.length <= 131_072);
      if (behavior === "output-limit") { assert.equal(output.length, 131_072); assert.equal(output.at(-1), 98); }
      if (behavior === "stderr-limit") { assert.equal(output.length, 65_536); assert.equal(error.length, 65_536); }
      if (behavior === "malformed-utf8") { assert.deepEqual(output, Buffer.from([0xF0, 0x9F, 0x92])); }
      if (behavior === "stdin-failure") { assert.equal(output.toString(), "prefix"); }
      assert.doesNotMatch(JSON.stringify(outcome), /Synthetic private/u);
    }
    assert.throws(() => invokeMainReferenceTransport(prepared), /already consumed/u); assert.equal(state.calls, 1);
  });
}
void test("transport refuses a JSON or structural compiled invocation", async () => {
  const prepared = await compileMainReferenceTransport(request);
  assert.throws(() => invokeMainReferenceTransport(structuredClone(prepared)), /unissued/u);
});
