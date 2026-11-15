/** Actual isolated Node/descriptor/byte handoff, never an EasyEDA owner. */
import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { chmod, mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { captureWindowsWslRuntime, parseWindowsWslConfigurationArguments, parseWindowsWslLaunchProfile, windowsWslLaunchArguments } from "../src/windows-wsl-launch.ts";
import { serializeWindowsWslRuntimePacket, windowsWslRuntimeFiles, windowsWslRuntimeProgram } from "../src/windows-wsl-runtime.ts";
import type { WindowsWslRuntimePacket } from "../src/windows-wsl-runtime.ts";
import { createTestTemporaryDirectory } from "./helpers/temporary-directory.ts";

function runNode(args: readonly string[]): Promise<string> {
  const outcome = Promise.withResolvers<string>();
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Node execFile reports original process closure through this completion callback before the harness resolves.
  execFile(process.execPath, args, { encoding: "utf8", maxBuffer: 65_536 }, (error, stdout) => {
    if (error === null) { outcome.resolve(stdout); } else { outcome.reject(error); }
  });
  return outcome.promise;
}
async function packetFixture(): Promise<Readonly<{ root: string; packet: WindowsWslRuntimePacket }>> {
  const root = await createTestTemporaryDirectory("windows-wsl-byte-fixture-");
  for (const spec of windowsWslRuntimeFiles()) {
    const filename = join(root, spec.relativePath);
    await mkdir(dirname(filename), { recursive: true });
    await writeFile(filename, spec.relativePath === "server/dist/server.mjs" ? "process.stdout.write('fixed-fixture');\n" : "fixed fixture\n");
    await chmod(filename, spec.mode);
  }
  const profile = parseWindowsWslLaunchProfile({ schema: "easyeda-pro-control.windows-wsl-launch.v1", distribution: "synthetic",
    nodeExecutable: process.execPath, pluginRoot: root, machineProfilePath: join(root, "machine-profile.json") });
  return { root, packet: await captureWindowsWslRuntime(root, profile) };
}
void test("WSL profile and packet selectors reject accessors, noncanonical paths and injected flags", () => {
  const profile = { schema: "easyeda-pro-control.windows-wsl-launch.v1", distribution: "synthetic",
    nodeExecutable: "/canonical/node", pluginRoot: "/canonical/plugin", machineProfilePath: "/canonical/profile.json" };
  assert.equal(parseWindowsWslLaunchProfile(profile).distribution, "synthetic");
  for (const value of [{ ...profile, distribution: "--exec" }, { ...profile, pluginRoot: "/a/../other" },
    { ...profile, pluginRoot: "/a//other" }, { ...profile, pluginRoot: "/a\nother" }, { ...profile, command: "arbitrary" }]) {
    assert.throws(() => parseWindowsWslLaunchProfile(value));
  }
  let calls = 0; const getter = { ...profile };
  Object.defineProperty(getter, "pluginRoot", { get(): string { calls += 1; return profile.pluginRoot; } });
  assert.throws(() => parseWindowsWslLaunchProfile(getter));
  assert.throws(() => serializeWindowsWslRuntimePacket(getter)); assert.equal(calls, 0);
  const args = ["--distribution", "synthetic", "--node", profile.nodeExecutable, "--plugin-root", profile.pluginRoot, "--machine-profile", profile.machineProfilePath];
  assert.equal(parseWindowsWslConfigurationArguments(args).replace, false);
  assert.equal(parseWindowsWslConfigurationArguments([...args, "--replace"]).replace, true);
  assert.throws(() => parseWindowsWslConfigurationArguments([...args, "--replace", "--replace"]));
});
void test("actual readonly WSL program verifies fixed bytes and refuses a changed package", async () => {
  const fixture = await packetFixture(), program = windowsWslRuntimeProgram();
  const argv = ["--input-type=module", "--eval", program, "--", "verify", serializeWindowsWslRuntimePacket(fixture.packet)];
  const stdout = await runNode(argv);
  assert.deepEqual(JSON.parse(stdout), { schema: "easyeda-pro-control.windows-wsl-verification.v1", runtimeBytesMatched: true,
    platform: "linux-x64", nodeVersion: "v24.18.0", fileCount: 6, nativeOwnerAllocated: false });
  const profile = parseWindowsWslLaunchProfile({ schema: "easyeda-pro-control.windows-wsl-launch.v1", distribution: "synthetic",
    nodeExecutable: process.execPath, pluginRoot: fixture.root, machineProfilePath: fixture.packet.machineProfilePath });
  const args = windowsWslLaunchArguments(profile, fixture.packet, "verify");
  assert.equal(args[0], "--distribution"); assert.equal(args[3], "/"); assert.equal(args.at(-2), "verify");
  await writeFile(join(fixture.root, "server/dist/server.mjs"), "changed fixture\n");
  await assert.rejects(runNode(argv));
});
void test("the minified packaged bootstrap retains every lexical helper and validates before execution", async () => {
  const fixture = await packetFixture();
  const filename = join(fixture.root, "serialized-program.mjs");
  const sourcePath = fileURLToPath(new URL("../src/windows-wsl-runtime.ts", import.meta.url));
  const result = await build({ stdin: { contents: `import {windowsWslRuntimeProgram} from ${  JSON.stringify(sourcePath)
    };process.stdout.write(windowsWslRuntimeProgram());`, resolveDir: import.meta.dirname, loader: "ts" },
    bundle: true, platform: "node", format: "esm", target: "node24", keepNames: true,
    minifyIdentifiers: true, minifySyntax: false, minifyWhitespace: true, write: false, logLevel: "silent" });
  assert.ok(result.outputFiles[0]); await writeFile(filename, result.outputFiles[0].contents);
  const program = await runNode([filename]);
  const stdout = await runNode(["--input-type=module", "--eval", program, "--", "verify", serializeWindowsWslRuntimePacket(fixture.packet)]);
  const observed: unknown = JSON.parse(stdout);
  assert.deepEqual(observed, { schema: "easyeda-pro-control.windows-wsl-verification.v1", runtimeBytesMatched: true,
    platform: "linux-x64", nodeVersion: "v24.18.0", fileCount: 6, nativeOwnerAllocated: false });
  await chmod(join(fixture.root, "server/bin/easyeda-fd-sanitizer"), 0o644);
  await assert.rejects(runNode(["--input-type=module", "--eval", program, "--", "verify", serializeWindowsWslRuntimePacket(fixture.packet)]));
});

void test("the original Linux handoff receives fixed argv and binary stdin and closes on EOF", async () => {
  const fixture = await packetFixture();
  const server = `import assert from "node:assert/strict";
assert.deepEqual(process.argv.slice(2), ["--machine-launch", "--profile", ${JSON.stringify(fixture.packet.machineProfilePath)}]);
process.stdin.pipe(process.stdout); process.stdin.once("end", () => { process.exitCode = 23; });\n`;
  await writeFile(join(fixture.root, "server/dist/server.mjs"), server);
  const profile = parseWindowsWslLaunchProfile({ schema: "easyeda-pro-control.windows-wsl-launch.v1", distribution: "synthetic",
    nodeExecutable: process.execPath, pluginRoot: fixture.root, machineProfilePath: fixture.packet.machineProfilePath });
  const packet = await captureWindowsWslRuntime(fixture.root, profile);
  const child = spawn(process.execPath, ["--input-type=module", "--eval", windowsWslRuntimeProgram(), "--", "launch", serializeWindowsWslRuntimePacket(packet)],
    { stdio: ["pipe", "pipe", "pipe"] });
  const completion = Promise.withResolvers<Readonly<{ code: number | null; signal: NodeJS.Signals | null }>>();
  const stderr: Buffer[] = [], stdout: Buffer[] = [];
  child.once("error", (error: Error) => { completion.reject(error); });
  child.stdin.once("error", (error: Error) => { completion.reject(error); });
  child.stdout.on("data", (chunk: Buffer) => { stdout.push(chunk); });
  child.stderr.on("data", (chunk: Buffer) => { stderr.push(chunk); });
  child.once("close", (code, signal) => { completion.resolve({ code, signal }); });
  const bytes = Buffer.concat([Buffer.from(Array.from({ length: 256 }, (_, index) => index)), Buffer.from("piano 🎹\r\n\0")]);
  child.stdin.end(bytes);
  assert.deepEqual(await completion.promise, { code: 23, signal: null });
  assert.deepEqual(Buffer.concat(stdout), bytes); assert.equal(Buffer.concat(stderr).length, 0);
});
