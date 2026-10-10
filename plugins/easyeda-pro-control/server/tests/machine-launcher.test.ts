import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFile, lstat, mkdir, mkdtemp, readFile, readdir, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import type { TestContext } from "node:test";
import { pathToFileURL } from "node:url";

import { createMachineProfile, writeMachineProfile } from "../src/machine-profile.ts";

interface LauncherFixture {
  readonly pluginRoot: string;
  readonly profilePath: string;
  readonly nodeExecutable: string;
  readonly entrypoint: string;
  readonly launcher: string;
  readonly main: string;
  readonly indexMarker: string;
  readonly controlDirectory: string;
  readonly marker: string;
  readonly replacement: string;
  readonly originalDevice: number;
  readonly originalInode: number;
}

async function fixture(context: TestContext): Promise<LauncherFixture> {
  const root = await mkdtemp(join(tmpdir(), "easyeda-machine-launcher-"));
  context.after(async () => { await rm(root, { recursive: true, force: true }); });
  const pluginRoot = join(root, "plugin");
  const upstreamRoot = join(root, "upstream");
  const assetsRoot = join(root, "assets");
  const controlDirectory = join(root, "control");
  for (const path of [join(pluginRoot, "scripts"), join(pluginRoot, "server", "src"), join(pluginRoot, "server", "dist"),
    join(upstreamRoot, "dist"), join(assetsRoot, "pro-pcb", "3.2.fixture", "js"),
    join(assetsRoot, "pro-api", "0.2.fixture"),
  ]) { await mkdir(path, { recursive: true, mode: 0o700 }); }
  await writeFile(join(upstreamRoot, "package.json"), JSON.stringify({ name: "easyeda-mcp-pro", version: "1.0.0-rc.1" }));
  for (const path of [join(upstreamRoot, "dist", "index.js"),
    join(assetsRoot, "pro-pcb", "3.2.fixture", "js", "pcb.js"),
    ...["api.js", "api-types.js", "api-types.d.ts"].map((name) => join(assetsRoot, "pro-api", "0.2.fixture", name)),
  ]) { await writeFile(path, "fixture metadata only; never executed\n"); }
  const nodeExecutable = join(root, "node");
  await copyFile(await realpath(process.execPath), nodeExecutable);
  const profile = await createMachineProfile({ pluginRoot, nodeExecutable, upstreamRoot, assetsRoot, controlDirectory });
  const profilePath = join(controlDirectory, "machine-profile.json");
  await writeMachineProfile(profile, profilePath);
  const launcher = join(pluginRoot, "scripts", "launch-machine.ts");
  const launcherSource = await readFile(new URL("../../scripts/launch-machine.ts", import.meta.url), "utf8");
  const profileModuleUrl = new URL("../src/machine-profile.ts", import.meta.url).href;
  const launchModuleUrl = new URL("../src/machine-launch.ts", import.meta.url).href;
  // Only relocate internal imports; the wrapper and helper retain their exact current logic.
  await writeFile(launcher, launcherSource.replace(
    '"../server/src/machine-profile.ts"',
    JSON.stringify(profileModuleUrl),
  ).replaceAll('"../server/src/machine-launch.ts"', JSON.stringify(launchModuleUrl)));
  const main = join(pluginRoot, "server", "src", "main.ts");
  const mainSource = await readFile(new URL("../src/main.ts", import.meta.url), "utf8");
  await writeFile(main, mainSource.replace('"./machine-profile.ts"', JSON.stringify(profileModuleUrl))
    .replace('"./machine-launch.ts"', JSON.stringify(launchModuleUrl)));
  const indexMarker = join(root, "index-initialized");
  await writeFile(join(pluginRoot, "server", "src", "index.ts"), `
    import { writeFileSync } from "node:fs";
    writeFileSync(${JSON.stringify(indexMarker)}, "fixture-index-initialized");
    process.stdout.write("fixture-index");
  `);
  const entrypoint = join(pluginRoot, "server", "dist", "server.mjs");
  await writeFile(entrypoint, `
    import { readFileSync, statSync } from "node:fs";
    const information = statSync("/proc/self/exe");
    process.stdout.write(JSON.stringify({
      pid: process.pid, beforePid: process.env.MACHINE_LAUNCHER_TEST_PID,
      cwd: process.cwd(), args: process.argv.slice(1),
      profile: process.env.EASYEDA_MACHINE_PROFILE,
      upstreamCommand: process.env.EASYEDA_UPSTREAM_COMMAND,
      preserved: process.env.MACHINE_LAUNCHER_TEST_ENV,
      stdin: readFileSync(0, "utf8"), dev: information.dev, ino: information.ino,
    }));
    process.stderr.write("fixture-stderr");
    process.exitCode = 17;
  `);
  const marker = join(root, "replacement-executed");
  const replacement = join(root, "replacement-node");
  await writeFile(replacement, `#!/bin/sh\nprintf executed > '${marker}'\nprintf 'v24.18.0\\n'\n`, { mode: 0o755 });
  const original = await lstat(nodeExecutable);
  return { pluginRoot, profilePath, nodeExecutable, entrypoint, launcher, main, indexMarker, controlDirectory, marker, replacement,
    originalDevice: original.dev, originalInode: original.ino };
}

function runMain(options: LauncherFixture, args: readonly string[]): ReturnType<typeof spawnSync> {
  // oxlint-disable-next-line node/no-sync -- Observe selector initialization and the complete same-PID execve in an isolated process.
  return spawnSync(process.execPath, [options.main, ...args], {
    cwd: "/", env: { ...process.env, EASYEDA_MACHINE_PROFILE: options.profilePath },
    input: "fixture-stdin", encoding: "utf8", timeout: 15_000, maxBuffer: 64 * 1024,
  });
}

function runLauncher(options: LauncherFixture, intercept: string): ReturnType<typeof spawnSync> {
  const source = `
    import { lstatSync, renameSync } from "node:fs";
    const originalExecve = process.execve;
    process.env.MACHINE_LAUNCHER_TEST_PID = String(process.pid);
    ${intercept}
    const { launchMachine } = await import(${JSON.stringify(pathToFileURL(options.launcher).href)});
    await launchMachine(["--profile", ${JSON.stringify(options.profilePath)}]);
  `;
  // oxlint-disable-next-line node/no-sync -- The test must observe a complete same-PID execve transaction, not mutate its own process.
  return spawnSync(process.execPath, ["--input-type=module", "--eval", source], {
    cwd: "/", env: { ...process.env, MACHINE_LAUNCHER_TEST_ENV: "preserved-value" },
    input: "fixture-stdin", encoding: "utf8", timeout: 15_000, maxBuffer: 64 * 1024,
  });
}

void describe("descriptor-bound machine launcher", () => {
  void test("preserves one PID, stdio, exit status, argv and profile environment through descriptor execve", async (context) => {
    const options = await fixture(context);
    const result = runLauncher(options, "");
    assert.equal(result.error, undefined);
    assert.equal(result.signal, null);
    assert.equal(result.status, 17, String(result.stderr));
    assert.equal(result.stderr, "fixture-stderr");
    const output: unknown = JSON.parse(String(result.stdout));
    assert.ok(output !== null && typeof output === "object");
    assert.deepEqual(output, {
      pid: result.pid, beforePid: String(result.pid), cwd: options.pluginRoot,
      args: [options.entrypoint], profile: options.profilePath,
      upstreamCommand: options.nodeExecutable, preserved: "preserved-value",
      stdin: "fixture-stdin", dev: options.originalDevice, ino: options.originalInode,
    });
    await assert.rejects(lstat(options.marker), { code: "ENOENT" });
  });

  void test("never executes a pathname replacement made at the final execve boundary", async (context) => {
    const options = await fixture(context);
    const result = runLauncher(options, `
      process.execve = (file, args, environment) => {
        if (!/^\\/proc\\/\\d+\\/fd\\/\\d+$/.test(file)) throw new Error("Executable is not descriptor-bound");
        renameSync(${JSON.stringify(options.nodeExecutable)}, ${JSON.stringify(`${options.nodeExecutable}.retained`)});
        renameSync(${JSON.stringify(options.replacement)}, ${JSON.stringify(options.nodeExecutable)});
        originalExecve(file, args, environment);
      };
    `);
    assert.equal(result.error, undefined);
    assert.equal(result.signal, null);
    assert.equal(result.status, 17, String(result.stderr));
    const output: unknown = JSON.parse(String(result.stdout));
    assert.ok(output !== null && typeof output === "object" && "dev" in output && "ino" in output && "pid" in output);
    assert.equal(output.dev, options.originalDevice);
    assert.equal(output.ino, options.originalInode);
    assert.equal(output.pid, result.pid);
    const replacement = await lstat(options.nodeExecutable);
    assert.notEqual(replacement.ino, options.originalInode);
    await assert.rejects(lstat(options.marker), { code: "ENOENT" });
  });

  void test("closes the retained executable descriptor when kernel handoff is refused", async (context) => {
    const options = await fixture(context);
    const result = runLauncher(options, `
      let retainedPath;
      process.execve = (file) => { retainedPath = file; throw new Error("fixture-execve-refused"); };
      process.on("uncaughtException", (error) => {
        let closed = false;
        try { lstatSync(retainedPath); } catch (failure) { closed = failure.code === "ENOENT"; }
        process.stdout.write(JSON.stringify({ message: error.message, closed }));
        process.exitCode = 19;
      });
    `);
    assert.equal(result.error, undefined);
    assert.equal(result.signal, null);
    assert.equal(result.status, 19, String(result.stderr));
    assert.deepEqual(JSON.parse(String(result.stdout)), { message: "fixture-execve-refused", closed: true });
    await assert.rejects(lstat(options.marker), { code: "ENOENT" });
  });

  void test("selects machine launch before index initialization and removes the mode flag from final argv", async (context) => {
    const options = await fixture(context);
    const initialFiles = await readdir(options.controlDirectory);
    for (const args of [["--machine-launch"], ["--machine-launch", "--profile", options.profilePath]]) {
      const result = runMain(options, args);
      assert.equal(result.error, undefined);
      assert.equal(result.signal, null);
      assert.equal(result.status, 17, String(result.stderr));
      assert.equal(result.stderr, "fixture-stderr");
      const output: unknown = JSON.parse(String(result.stdout));
      assert.ok(output !== null && typeof output === "object" && "pid" in output && "args" in output && "cwd" in output);
      assert.equal(output.pid, result.pid);
      assert.deepEqual(output.args, [options.entrypoint]);
      assert.equal(output.cwd, options.pluginRoot);
      await assert.rejects(lstat(options.indexMarker), { code: "ENOENT" });
      assert.deepEqual(await readdir(options.controlDirectory), initialFiles);
    }
    const failedProfile = runMain(options, ["--machine-launch", "--profile", join(options.controlDirectory, "not-installed.json")]);
    assert.equal(failedProfile.error, undefined);
    assert.equal(failedProfile.status, 1, String(failedProfile.stderr));
    assert.equal(failedProfile.stdout, "");
    assert.equal(failedProfile.stderr, `${JSON.stringify({ ok: false, error: "machine-launch-failed" })}\n`);
    await assert.rejects(lstat(options.indexMarker), { code: "ENOENT" });
    assert.deepEqual(await readdir(options.controlDirectory), initialFiles);
  });

  void test("rejects malformed mode arguments with fixed diagnostics before index or facade files exist", async (context) => {
    const options = await fixture(context);
    const initialFiles = await readdir(options.controlDirectory);
    for (const args of [["--machine-launch", "--profile"], ["--machine-launch", "--unknown", "private-text"],
      ["--machine-launch", "--plugin-root", "/tmp/caller-selected-root"],
      ["--machine-launch", "--profile", options.profilePath, "--profile", options.profilePath],
    ]) {
      const result = runMain(options, args);
      assert.equal(result.error, undefined);
      assert.equal(result.signal, null);
      assert.equal(result.status, 1, String(result.stderr));
      assert.equal(result.stdout, "");
      assert.equal(result.stderr, `${JSON.stringify({ ok: false, error: "machine-launcher-arguments-invalid" })}\n`);
      await assert.rejects(lstat(options.indexMarker), { code: "ENOENT" });
      assert.deepEqual(await readdir(options.controlDirectory), initialFiles);
    }
  });

  void test("refuses nonexact or unknown selector arguments before normal facade initialization", async (context) => {
    const options = await fixture(context);
    const initialFiles = await readdir(options.controlDirectory);
    for (const args of [["--machine-launch=unused"], ["--machine-launch-extra"], ["--machne-launch"], ["--unknown"]]) {
      const result = runMain(options, args);
      assert.equal(result.error, undefined);
      assert.equal(result.signal, null);
      assert.equal(result.status, 1, String(result.stderr));
      assert.equal(result.stdout, "");
      assert.equal(result.stderr, `${JSON.stringify({ ok: false, error: "machine-launcher-arguments-invalid" })}\n`);
      await assert.rejects(lstat(options.indexMarker), { code: "ENOENT" });
      assert.deepEqual(await readdir(options.controlDirectory), initialFiles);
    }
    const direct = runMain(options, []);
    assert.equal(direct.error, undefined);
    assert.equal(direct.status, 0, String(direct.stderr));
    assert.equal(direct.stdout, "fixture-index");
    assert.equal(direct.stderr, "");
    assert.equal(await readFile(options.indexMarker, "utf8"), "fixture-index-initialized");
    await assert.rejects(lstat(options.marker), { code: "ENOENT" });
  });
});
