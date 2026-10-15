/* oxlint-disable import/max-dependencies -- Exercise the real filesystem admission with a synthetic child transport, never Windows. */
import assert from "node:assert/strict";
import childProcess, { ChildProcess } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { PassThrough } from "node:stream";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { fileURLToPath } from "node:url";
import { ORDINARY_LAUNCH_RECOVERY_HELPER, observeOrdinaryLaunchRecovery } from "../src/ordinary-launch-recovery.ts";

const NATIVE_RESULT = { schema: "easyeda-pro-control.ordinary-launch-recovery-observation.v1",
  samples: 2, otherPowerShellPresent: false, sameNameProcessPresent: false };

async function fixture(context: TestContext): Promise<{
  readonly helperPath: string;
  readonly options: { readonly pluginRoot: string; readonly assetsRoot: string };
  readonly child: ChildProcess;
  readonly output: PassThrough;
  readonly error: PassThrough;
  readonly input: PassThrough;
  readonly spawned: Promise<null>;
  readonly invocation: { args: string[] };
  readonly counts: { spawn: number; kill: number; unref: number };
}> {
  const pluginRoot = await mkdtemp(join(tmpdir(), "ordinary-launch-recovery-test-"));
  await mkdir(join(pluginRoot, "scripts"));
  const helperPath = join(pluginRoot, ORDINARY_LAUNCH_RECOVERY_HELPER.relativePath);
  await copyFile(fileURLToPath(new URL("../../scripts/ordinary-launch-recovery.ps1", import.meta.url)), helperPath);
  const invocation = { args: [] as string[] }, original = await readFile(helperPath, "utf8");
  const distribution = process.env["WSL_DISTRO_NAME"];
  process.env["WSL_DISTRO_NAME"] = "RecoveryTest";
  const child = new ChildProcess(), counts = { spawn: 0, kill: 0, unref: 0 }, error = new PassThrough(),
    input = new PassThrough(), output = new PassThrough(), spawned = Promise.withResolvers<null>();
  Object.defineProperties(child, { stdin: { value: input }, stdout: { value: output }, stderr: { value: error } });
  context.mock.method(child, "kill", (): boolean => { counts.kill += 1; return true; });
  context.mock.method(child, "unref", (): void => { counts.unref += 1; });
  const intercept = ((executable: string, args: string[], options: unknown): ChildProcess => {
    counts.spawn += 1;
    assert.equal(executable, "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe");
    assert.deepEqual(args, ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-EncodedCommand",
      Buffer.from(original, "utf16le").toString("base64")]);
    invocation.args = args;
    assert.deepEqual(options, { stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
    spawned.resolve(null);
    return child;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Real streams satisfy the one fixed spawn overload; no process is created.
  }) as typeof childProcess.spawn;
  context.mock.method(childProcess, "spawn", intercept); syncBuiltinESMExports();
  context.after(async () => {
    context.mock.restoreAll(); syncBuiltinESMExports();
    if (distribution === undefined) { delete process.env["WSL_DISTRO_NAME"]; } else { process.env["WSL_DISTRO_NAME"] = distribution; }
    input.destroy(); output.destroy(); error.destroy();
    await rm(pluginRoot, { recursive: true, force: true });
  });
  return { helperPath, options: { pluginRoot, assetsRoot: "/mnt/c/Reviewed/resources/app/assets" },
    child, output, error, input, spawned: spawned.promise, invocation, counts };
}

void test("recovery adapter uses only fixed read-only helper and awaits successful close", async (context) => {
  const f = await fixture(context), pending = observeOrdinaryLaunchRecovery(f.options);
  await f.spawned;
  let settled = false;
  async function observeCompletion(): Promise<unknown> { const result = await pending; settled = true; return result; }
  const observed = observeCompletion();
  f.output.end(`${JSON.stringify({ ...NATIVE_RESULT, otherPowerShellPresent: true })}\n`);
  await Promise.resolve();
  assert.equal(settled, false);
  assert.equal(f.input.writableEnded, true);
  assert.equal(f.input.readableLength, 0);
  f.error.end(); f.child.emit("close", 0, null);
  assert.deepEqual(await observed, { ...NATIVE_RESULT, otherPowerShellPresent: true,
    helperSha256: ORDINARY_LAUNCH_RECOVERY_HELPER.sha256 });
  assert.deepEqual(f.counts, { spawn: 1, kill: 0, unref: 0 });
});

void test("recovery executes verified bytes despite parent directory substitution and restoration", async (context) => {
  const f = await fixture(context), original = await readFile(f.helperPath, "utf8"),
    pending = observeOrdinaryLaunchRecovery(f.options), retained = join(f.options.pluginRoot, "retained-scripts"),
    scripts = join(f.options.pluginRoot, "scripts"), substitute = join(f.options.pluginRoot, "substitute-scripts");
  await f.spawned;
  await rename(scripts, retained);
  await mkdir(scripts);
  await writeFile(f.helperPath, "throw 'substituted helper'");
  // The pathname now points to hostile bytes while the child consumes its argv.
  assert.notEqual(await readFile(f.helperPath, "utf8"), original);
  assert.equal(f.invocation.args[5], "-EncodedCommand");
  assert.equal(Buffer.from(f.invocation.args[6] ?? "", "base64").toString("utf16le"), original);
  await rename(scripts, substitute);
  await rename(retained, scripts);
  f.output.end(JSON.stringify(NATIVE_RESULT)); f.error.end(); f.child.emit("close", 0, null);
  assert.deepEqual(await pending, { ...NATIVE_RESULT, helperSha256: ORDINARY_LAUNCH_RECOVERY_HELPER.sha256 });
  assert.deepEqual(f.counts, { spawn: 1, kill: 0, unref: 0 });
});

void test("recovery adapter rejects helper drift before spawn and after native observation", async (context) => {
  const f = await fixture(context), original = await readFile(f.helperPath);
  await writeFile(f.helperPath, "changed helper");
  await assert.rejects(observeOrdinaryLaunchRecovery(f.options), /not proven: pre-helper-source;/u);
  assert.equal(f.counts.spawn, 0);
  await writeFile(f.helperPath, original);
  const pending = observeOrdinaryLaunchRecovery(f.options);
  await f.spawned;
  await writeFile(f.helperPath, "changed after spawn");
  f.output.end(JSON.stringify(NATIVE_RESULT)); f.error.end(); f.child.emit("close", 0, null);
  await assert.rejects(pending, /not proven: post-helper-source;/u);
  assert.equal(f.counts.kill, 0);
});

void test("recovery adapter rejects malformed, excessive, stderr, and unsuccessful child outcomes", async (context) => {
  const categories = { "unknown-field": "output-schema", "wrong-samples": "output-schema", "invalid-utf8": "output-schema",
    oversized: "output-bound", stderr: "stderr", spawn: "spawn", exit: "nonzero-exit", signal: "nonzero-exit" };
  for (const mode of ["unknown-field", "wrong-samples", "invalid-utf8", "oversized", "stderr", "spawn", "exit", "signal"] as const) {
    await context.test(mode, async (subcontext) => {
      const f = await fixture(subcontext), pending = observeOrdinaryLaunchRecovery(f.options);
      await f.spawned;
      if (mode === "unknown-field") { f.output.write(JSON.stringify({ ...NATIVE_RESULT, terminationProved: true })); }
      else if (mode === "wrong-samples") { f.output.write(JSON.stringify({ ...NATIVE_RESULT, samples: 1 })); }
      else if (mode === "invalid-utf8") { f.output.write(Buffer.from([255])); }
      else if (mode === "oversized") { f.output.write(Buffer.alloc(4097)); }
      else { f.output.write(JSON.stringify(NATIVE_RESULT)); }
      if (mode === "stderr") { f.error.write("private Windows exception"); }
      if (mode === "spawn") { f.child.emit("error", new Error("private Windows spawn failure")); }
      f.output.end(); f.error.end(); f.child.emit("close", mode === "exit" ? 1 : 0, mode === "signal" ? "SIGTERM" : null);
      await assert.rejects(pending, { name: "OrdinaryLaunchRecoveryError", category: categories[mode],
        message: `Ordinary launch recovery observation was not proven: ${categories[mode]}; no recovery is authorized.` });
      assert.equal(f.counts.kill, 0);
      assert.equal(f.counts.unref, 1);
    });
  }
});

void test("recovery adapter timeout detaches read-only child without accepting output or killing", async (context) => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const f = await fixture(context), pending = observeOrdinaryLaunchRecovery(f.options);
  await f.spawned;
  f.output.write(JSON.stringify(NATIVE_RESULT));
  const rejected = assert.rejects(pending, /not proven: timeout;/u);
  context.mock.timers.tick(10_000);
  await rejected;
  f.child.emit("close", 0, null);
  assert.deepEqual(f.counts, { spawn: 1, kill: 0, unref: 1 });
  assert.equal(f.input.destroyed && f.output.destroyed && f.error.destroyed, true);
});
