/** Fixed fake command child, layered after the actual managed baseline fixture. */
import assert from "node:assert/strict";
import childProcess, { ChildProcess } from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import { PassThrough } from "node:stream";
import type { TestContext } from "node:test";

export type FailureMode = "drained-unclosed" | "guard-incomplete";
export function stageSettlementFixture(context: TestContext, mode: FailureMode): {
  readonly ready: Promise<void>;
  readonly state: { calls: number; kills: number; guardAttempts: string[]; stdinBytes: number };
  resetFakeTime: () => void;
  lateEvents: () => void;
} {
  const preceding = childProcess.spawn;
  // oxlint-disable-next-line typescript/no-invalid-void-type -- This built-in promise resolver signals a fixture event without a payload.
  const ready = Promise.withResolvers<void>();
  const state = { calls: 0, kills: 0, guardAttempts: [] as string[], stdinBytes: 0 };
  let timersActive = false;
  let owned: { child: ChildProcess; input: PassThrough; output: PassThrough; error: PassThrough } | undefined;
  const resetFakeTime = (): void => { if (timersActive) { context.mock.timers.reset(); timersActive = false; } };
  const intercepted = ((executable: string, args: string[], options: unknown): ChildProcess => {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Delegate only to the preceding maintained synthetic supervisor/SQL seam, never directly to native Windows.
    if (!args.includes("-Command")) { return Reflect.apply(preceding, childProcess, [executable, args, options]) as ChildProcess; }
    assert.equal(executable, "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe");
    assert.deepEqual(args.slice(0, 4), ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command"]); assert.equal(args.length, 5);
    const command = args[4]; assert.ok(command !== undefined);
    assert.match(command, /private\.main-reference-stdin\.v3/u); assert.ok(command.length <= 30_000);
    assert.deepEqual(options, { shell: false, windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
    state.calls += 1; assert.equal(state.calls, 1);
    if (mode === "drained-unclosed") { context.mock.timers.enable({ apis: ["setTimeout"] }); timersActive = true; }
    const child = new ChildProcess(), error = new PassThrough(), input = new PassThrough(), output = new PassThrough();
    owned = { child, input, output, error };
    Object.defineProperties(child, { stdin: { value: input }, stdout: { value: output }, stderr: { value: error } });
    const on = child.on.bind(child), once = child.once.bind(child);
    context.mock.method(child, "on", (event: string, listener: (...args: unknown[]) => void): ChildProcess => {
      if (event === "error") { state.guardAttempts.push("child-error"); }
      return on(event, listener);
    });
    context.mock.method(child, "once", (event: string, listener: (...args: unknown[]) => void): ChildProcess => {
      if (event === "close") { state.guardAttempts.push("child-close"); }
      return once(event, listener);
    });
    for (const [name, stream] of [["stdin-error", input], ["stdout-error", output], ["stderr-error", error]] as const) {
      const streamOn = stream.on.bind(stream);
      context.mock.method(stream, "on", (event: string | symbol, listener: (...args: unknown[]) => void): PassThrough => {
        if (event === "error") {
          state.guardAttempts.push(name);
          if (mode === "guard-incomplete" && name === "stdout-error") { throw new Error("Synthetic refused stdout error-guard registration"); }
        }
        return streamOn(event, listener);
      });
    }
    context.mock.method(child, "kill", (): boolean => {
      state.kills += 1;
      if (mode === "guard-incomplete") {
        queueMicrotask(() => { child.emit("close", 197, null); ready.resolve(); });
      }
      return true;
    });
    input.on("data", (chunk: Buffer) => { state.stdinBytes += chunk.length; assert.ok(state.stdinBytes <= 524_288); });
    input.on("finish", () => {
      assert.equal(mode, "drained-unclosed");
      queueMicrotask(() => {
        output.write("prefix"); input.emit("error", new Error("Synthetic first stdin failure without close")); ready.resolve();
      });
    });
    return child;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Exact fixed-command mock returns genuine Node streams and never starts an OS process.
  }) as typeof childProcess.spawn;
  const mock = context.mock.method(childProcess, "spawn", intercepted); syncBuiltinESMExports();
  const lateEvents = (): void => {
    assert.ok(owned !== undefined);
    owned.input.emit("error", new Error("Synthetic late input error"));
    owned.error.emit("error", new Error("Synthetic late stderr error"));
    owned.child.emit("error", new Error("Synthetic late child error"));
    if (mode === "drained-unclosed") { owned.output.emit("error", new Error("Synthetic late stdout error")); }
    owned.child.emit("close", 0, null);
    owned.output.write("late"); owned.error.write("late");
  };
  context.after(() => {
    resetFakeTime();
    if (owned !== undefined) { owned.child.emit("close", 197, null); owned.input.destroy(); owned.output.destroy(); owned.error.destroy(); }
    mock.mock.restore(); syncBuiltinESMExports();
  });
  return { ready: ready.promise, state, resetFakeTime, lateEvents };
}
