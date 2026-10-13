/** Fixed mocked child streams and fake timers; never launches an OS process. */
import assert from "node:assert/strict";
import childProcess, { ChildProcess } from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import { PassThrough } from "node:stream";
import type { TestContext } from "node:test";

const hash = "a".repeat(64);
export const request = Object.freeze({ profile: "private.exact-literal-main-reference.v1", nonce: hash, operationId: "easyeda-20261012t000000z-12345678",
  closedPlanSha256: hash, baselineCopyReceiptSha256: hash, baselineLogicalSha256: hash, baselineClosureClockSha256: hash,
  nativePinsSha256: hash, historyUuid: "b".repeat(32), createdAtLiteral: "2026-01-15 12:34:56", referenceUtcMs: 1_791_806_400_000 });

export interface Options {
  readonly spawnThrows?: boolean;
  readonly spawnThenThrows?: boolean;
  readonly stdinThrows?: boolean;
  readonly missingStdio?: boolean;
  readonly kill?: "accepted" | "refused" | "threw" | "synchronous-close";
  readonly setup?: "close-in-close-listener" | "error-in-error-listener" | "throw-in-output-listener" | "close-and-throw-in-output-listener";
  readonly guardFailures?: readonly ("child-error" | "child-close" | "stdin-error" | "stdout-error" | "stderr-error")[];
}
export function transportFixture(context: TestContext, options: Options = {}): {
  readonly child: ChildProcess; readonly input: PassThrough; readonly output: PassThrough; readonly error: PassThrough;
  readonly state: { calls: number; kills: number; stdinBytes: number; unreturnedChildStarted: boolean; guardAttempts: string[] };
  close: (code?: number | null, signal?: string | null) => void;
} {
  const child = new ChildProcess(), error = new PassThrough(), input = new PassThrough(), output = new PassThrough();
  const state = { calls: 0, kills: 0, stdinBytes: 0, unreturnedChildStarted: false, guardAttempts: [] as string[] };
  Object.defineProperties(child, { stdin: { value: options.missingStdio === true ? null : input }, stdout: { value: output }, stderr: { value: error } });
  input.on("data", (chunk: Buffer) => { state.stdinBytes += chunk.length; assert.ok(state.stdinBytes <= 180_000); });
  if (options.stdinThrows === true) { context.mock.method(input, "end", (): never => { throw new Error("Synthetic private stdin payload"); }); }
  context.mock.method(child, "kill", (): boolean => {
    state.kills += 1;
    if (options.kill === "threw") { throw new Error("Synthetic private kill payload"); }
    if (options.kill === "synchronous-close") { child.emit("close", 197, null); }
    return options.kill !== "refused";
  });
  const on = child.on.bind(child), once = child.once.bind(child);
  context.mock.method(child, "once", (event: string, listener: (...args: unknown[]) => void): ChildProcess => {
    if (event === "close") {
      state.guardAttempts.push("child-close");
      if (options.guardFailures?.includes("child-close") === true) { throw new Error("Synthetic private guard failure"); }
    }
    once(event, listener);
    if (event === "close" && options.setup === "close-in-close-listener") { child.emit("close", 0, null); } return child;
  });
  context.mock.method(child, "on", (event: string, listener: (...args: unknown[]) => void): ChildProcess => {
    if (event === "error") {
      state.guardAttempts.push("child-error");
      if (options.guardFailures?.includes("child-error") === true) { throw new Error("Synthetic private guard failure"); }
    }
    on(event, listener);
    if (event === "error" && options.setup === "error-in-error-listener") { child.emit("error", new Error("Synthetic private synchronous setup error")); } return child;
  });
  for (const [name, stream] of [["stdin-error", input], ["stdout-error", output], ["stderr-error", error]] as const) {
    const streamOn = stream.on.bind(stream);
    context.mock.method(stream, "on", (event: string | symbol, listener: (...args: unknown[]) => void): PassThrough => {
      if (event === "error") {
        state.guardAttempts.push(name);
        if (options.guardFailures?.includes(name) === true) { throw new Error("Synthetic private guard failure"); }
      }
      streamOn(event, listener);
      if (name === "stdout-error" && event === "data" && (options.setup === "throw-in-output-listener" || options.setup === "close-and-throw-in-output-listener")) {
        if (options.setup === "close-and-throw-in-output-listener") { child.emit("close", 0, null); }
        throw new Error("Synthetic private listener setup error");
      }
      return stream;
    });
  }
  const intercept = ((executable: string, args: string[], spawnOptions: unknown): ChildProcess => {
    state.calls += 1;
    assert.equal(executable, "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe");
    assert.deepEqual(args.slice(0, 4), ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command"]); assert.equal(args.length, 5);
    assert.match(String(args[4]), /throw 'UNREVIEWED MAIN REFERENCE TRANSPORT - DO NOT EXECUTE'/u);
    assert.ok(String(args[4]).length <= 30_000);
    assert.deepEqual(spawnOptions, { shell: false, windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
    if (options.spawnThrows === true) { throw new Error("Synthetic private spawn payload"); }
    if (options.spawnThenThrows === true) { state.unreturnedChildStarted = true; throw new Error("Synthetic private after-native-spawn payload"); }
    return child;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Exact mocked spawn overload returns genuine Node streams; no OS process is created.
  }) as typeof childProcess.spawn;
  context.mock.method(childProcess, "spawn", intercept); syncBuiltinESMExports();
  context.mock.timers.enable({ apis: ["setTimeout"] });
  context.after(() => {
    child.emit("close", 197, null);
    input.destroy(); output.destroy(); error.destroy();
    context.mock.restoreAll(); context.mock.timers.reset(); syncBuiltinESMExports();
  });
  return { child, input, output, error, state, close: (code = 0, signal = null): void => { child.emit("close", code, signal); } };
}
export async function flushMicrotasks(): Promise<void> { await Promise.resolve(); await Promise.resolve(); }
