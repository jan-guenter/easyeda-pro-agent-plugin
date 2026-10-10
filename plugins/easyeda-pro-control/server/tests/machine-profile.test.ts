import assert from "node:assert/strict";
import { chmod, lstat, mkdir, mkdtemp, readFile, realpath, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import type { TestContext } from "node:test";

import { configureMachine, parseMachineArguments } from "../../scripts/configure-machine.ts";
import { parseMachineLauncherArguments } from "../../scripts/launch-machine.ts";
import {
  createMachineProfile,
  loadRuntimeMachineProfile,
  machineProfileEnvironment,
  machineProfileLaunchConfiguration,
  machineProfileSchema,
  readMachineProfile,
  writeMachineProfile,
} from "../src/machine-profile.ts";
import type { MachineProfileOptions } from "../src/machine-profile.ts";

async function fixture(context: TestContext): Promise<MachineProfileOptions & { controlDirectory: string; assetsRoot: string }> {
  const root = await mkdtemp(join(tmpdir(), "easyeda-machine-profile-"));
  context.after(async () => { await rm(root, { recursive: true, force: true }); });
  const options = {
    pluginRoot: join(root, "plugin"), upstreamRoot: join(root, "upstream"),
    assetsRoot: join(root, "assets"), controlDirectory: join(root, "control"),
    nodeExecutable: await realpath(process.execPath),
  };
  for (const path of [options.pluginRoot, join(options.upstreamRoot, "dist"),
    join(options.assetsRoot, "pro-pcb", "3.2.fixture", "js"),
    join(options.assetsRoot, "pro-api", "0.2.fixture"),
  ]) { await mkdir(path, { recursive: true, mode: 0o700 }); }
  await writeFile(join(options.upstreamRoot, "package.json"), JSON.stringify({ name: "easyeda-mcp-pro", version: "1.0.0-rc.1" }));
  for (const path of [join(options.upstreamRoot, "dist", "index.js"),
    join(options.assetsRoot, "pro-pcb", "3.2.fixture", "js", "pcb.js"),
    ...["api.js", "api-types.js", "api-types.d.ts"].map((name) => join(options.assetsRoot, "pro-api", "0.2.fixture", name)),
  ]) { await writeFile(path, "fixture metadata only; never executed\n"); }
  return options;
}

void describe("installation-generated machine profiles", () => {
  void test("creates a private canonical profile, reuses it and preserves credentials", async (context) => {
    const options = await fixture(context);
    const profile = await createMachineProfile(options);
    const profilePath = join(options.controlDirectory, "machine-profile.json");
    await writeMachineProfile(profile, profilePath);
    const profileInfo = await lstat(profilePath);
    const controlInfo = await lstat(options.controlDirectory);
    assert.equal(profileInfo.mode % 512, 0o600);
    assert.equal(controlInfo.mode % 512, 0o700);
    const tokenPath = join(options.controlDirectory, "bridge-token");
    await writeFile(tokenPath, "fixture-key-not-a-real-credential", { mode: 0o600 });
    const loaded = await loadRuntimeMachineProfile({ profilePath });
    assert.deepEqual(loaded.profile, profile);
    assert.equal(loaded.environment["EASYEDA_BRIDGE_TOKEN_FILE"], tokenPath);
    assert.equal(Object.values(loaded.environment).includes("fixture-key-not-a-real-credential"), false);
    const reused = await configureMachine(["--profile", profilePath]);
    assert.equal(reused.reused, true);
    assert.equal(await readFile(tokenPath, "utf8"), "fixture-key-not-a-real-credential");
    await assert.rejects(writeMachineProfile(profile, profilePath), { code: "EEXIST" });
    await assert.rejects(configureMachine(["--profile", profilePath, "--node", process.execPath]), /exists-use-fresh/u);
    assert.deepEqual(machineProfileLaunchConfiguration(profile, options.pluginRoot), {
      command: profile.runtime.nodeExecutable,
      args: [join(options.pluginRoot, "server", "dist", "server.mjs")],
      cwd: options.pluginRoot, env: machineProfileEnvironment(profile),
    });
  });

  void test("rejects ambiguous bundles, escaped paths, changed Node identity and unsafe profile files", async (context) => {
    const options = await fixture(context);
    await mkdir(join(options.assetsRoot, "pro-api", "0.3.other"));
    await assert.rejects(createMachineProfile(options), /needs-explicit-selection/u);
    const profile = await createMachineProfile({ ...options, publicApiBundleVersion: "0.2.fixture" });
    assert.equal(machineProfileSchema.safeParse({ ...profile, token: "unaccepted" }).success, false);
    assert.equal(machineProfileSchema.safeParse({ ...profile, platform: "win32" }).success, false);
    assert.equal(machineProfileSchema.safeParse({ ...profile, upstream: { ...profile.upstream, entrypoint: "/tmp/elsewhere.js" } }).success, false);
    const path = join(options.controlDirectory, "machine-profile.json");
    await writeMachineProfile(profile, path);
    await chmod(path, 0o644);
    await assert.rejects(readMachineProfile(path), /not-private/u);
    await chmod(path, 0o600);
    const alias = join(options.controlDirectory, "alias.json");
    await symlink(path, alias);
    await assert.rejects(readMachineProfile(alias), /canonical-regular/u);
    const mismatchPath = join(options.controlDirectory, "wrong-node.json");
    await writeMachineProfile({ ...profile, runtime: { ...profile.runtime, nodeSha256: "0".repeat(64) } }, mismatchPath);
    await assert.rejects(readMachineProfile(mismatchPath), /node-hash-mismatch/u);
    const oversizedPath = join(options.controlDirectory, "oversized.json");
    await writeFile(oversizedPath, "x".repeat(16 * 1024 + 1), { mode: 0o600 });
    await assert.rejects(readMachineProfile(oversizedPath), /bounded-canonical-regular/u);
  });

  void test("requires explicit unambiguous CLI options and never accepts credential input", () => {
    for (const args of [["--node"], ["--token", "secret"], ["--profile", "/tmp/a", "--profile", "/tmp/b"], ["--node", "--profile"]]) {
      assert.throws(() => parseMachineArguments(args), /arguments-invalid/u);
    }
    assert.deepEqual(parseMachineLauncherArguments([]), {});
    assert.deepEqual(parseMachineLauncherArguments(["--profile", "/tmp/profile.json"]), { profilePath: "/tmp/profile.json" });
    assert.throws(() => parseMachineLauncherArguments(["--node", "/tmp/node"]), /arguments-invalid/u);
  });
});
