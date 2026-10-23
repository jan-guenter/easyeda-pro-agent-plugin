import assert from "node:assert/strict";
import { chmod, copyFile, link, lstat, mkdir, mkdtemp, open, readFile, readdir, realpath, rename, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import type { TestContext } from "node:test";

import { configureMachine, parseMachineArguments } from "../../scripts/configure-machine.ts";
import { parseMachineLauncherArguments } from "../../scripts/launch-machine.ts";
import { parseCalculationUpgradeArguments, parseCalculationUpgradeOptions } from "../../scripts/upgrade-calculation-profile.ts";
import { calculationProfileUpgradeTarget, upgradeCalculationProfile } from "../src/calculation-profile-upgrade.ts";
import {
  createMachineProfile,
  loadMachineLaunchProfile,
  loadRuntimeMachineProfile,
  machineProfileEnvironment,
  machineProfileLaunchConfiguration,
  machineProfileSchema,
  openVerifiedMachineNode,
  readMachineProfile,
  writeMachineProfile,
} from "../src/machine-profile.ts";
import type { MachineProfileOptions } from "../src/machine-profile.ts";

async function fixture(context: TestContext): Promise<MachineProfileOptions & {
  controlDirectory: string; assetsRoot: string; nodeExecutable: string;
}> {
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
  void test("calculation upgrade accepts only its explicit profile selector", () => {
    assert.equal(parseCalculationUpgradeArguments(["--profile", "/tmp/fixture-profile.json"]), "/tmp/fixture-profile.json");
    for (const args of [["--profile"], ["--profile", "--node"], ["--api-version", "0.3.50.ab46409c"], ["--profile", "/tmp/example.json", "--force"]]) {
      assert.throws(() => parseCalculationUpgradeArguments(args), /machine-upgrade-arguments-invalid/u);
    }
  });

  void test("209 migration requires an explicit closed target and preserves the historical default", () => {
    const path = "/tmp/fixture-profile.json";
    assert.deepEqual(parseCalculationUpgradeOptions(["--profile", path]), { profilePath: path, target: "sdk-math-206" });
    for (const args of [["--target", "public-utilities-209", "--profile", path], ["--profile", path, "--target", "public-utilities-209"]]) {
      assert.deepEqual(parseCalculationUpgradeOptions(args), { profilePath: path, target: "public-utilities-209" });
    }
    for (const args of [["--target"], ["--target", "latest"], ["--target", "public-utilities-209", "--target", "sdk-math-206"],
      ["--target", "public-utilities-209", "--force"], ["--target", "sdk-math-206", "--profile", "--target"]]) {
      assert.throws(() => parseCalculationUpgradeOptions(args), /machine-upgrade-arguments-invalid/u);
    }
    assert.equal(calculationProfileUpgradeTarget().mode, "calculation-only");
    assert.equal(calculationProfileUpgradeTarget("public-utilities-209").mode, "public-utilities-only");
    assert.equal(calculationProfileUpgradeTarget("public-utilities-209").installedBundles.publicApi.version, "0.3.59.1ca9efb5");
  });

  void test("209 migration refuses unknown or legacy sources before inspecting installation", async (context) => {
    const options = await fixture(context), profilePath = join(options.controlDirectory, "machine-profile.json");
    const original = await createMachineProfile(options);
    await writeMachineProfile(original, profilePath);
    for (const easyeda of [original.easyeda, { ...original.easyeda, pcbBundleVersion: "3.2.149.5378b690", publicApiBundleVersion: "0.2.53.aee2f57a" }]) {
      await writeFile(profilePath, `${JSON.stringify({ ...original, easyeda })}\n`, { mode: 0o600 });
      const before = await readFile(profilePath), information = await lstat(profilePath);
      await assert.rejects(upgradeCalculationProfile(profilePath, "public-utilities-209"), /machine-upgrade-source-generation-unsupported/u);
      assert.deepEqual(await readFile(profilePath), before);
      const after = await lstat(profilePath);
      assert.equal(after.ino, information.ino);
      assert.deepEqual(await readdir(options.controlDirectory), ["machine-profile.json"]);
    }
  });

  void test("209 migration refuses unreviewed app bytes for migration and already-selected no-op", async (context) => {
    const options = await fixture(context), profilePath = join(options.controlDirectory, "machine-profile.json");
    const original = await createMachineProfile(options);
    await writeMachineProfile(original, profilePath);
    await writeFile(join(options.assetsRoot, "..", "package.json"), '{"version":"3.2.209.8a704eab","unreviewed":true}\n');
    for (const versions of [["3.2.193.682ed44e", "0.3.50.ab46409c"], ["3.2.195.6b67774e", "0.3.59.1ca9efb5"]] as const) {
      await writeFile(profilePath, `${JSON.stringify({ ...original, easyeda: { ...original.easyeda,
        pcbBundleVersion: versions[0], publicApiBundleVersion: versions[1] } })}\n`, { mode: 0o600 });
      const before = await readFile(profilePath), information = await lstat(profilePath);
      await assert.rejects(upgradeCalculationProfile(profilePath, "public-utilities-209"), /machine-upgrade-installation-hash-mismatch/u);
      assert.deepEqual(await readFile(profilePath), before);
      const after = await lstat(profilePath);
      assert.equal(after.ino, information.ino);
      assert.deepEqual(await readdir(options.controlDirectory), ["machine-profile.json"]);
    }
  });

  void test("calculation upgrade rejects unknown source generations without changing the profile", async (context) => {
    const options = await fixture(context), profilePath = join(options.controlDirectory, "machine-profile.json");
    await writeMachineProfile(await createMachineProfile(options), profilePath);
    const before = await readFile(profilePath);
    await assert.rejects(upgradeCalculationProfile(profilePath), /machine-upgrade-source-generation-unsupported/u);
    assert.deepEqual(await readFile(profilePath), before);
    assert.deepEqual(await readdir(options.controlDirectory), ["machine-profile.json"]);
  });

  void test("calculation upgrade refuses unreviewed installed bytes and preserves exact profile bytes, mode and other files", async (context) => {
    const options = await fixture(context), profilePath = join(options.controlDirectory, "machine-profile.json");
    const profile = await createMachineProfile(options);
    await writeMachineProfile({ ...profile, easyeda: { ...profile.easyeda,
      pcbBundleVersion: "3.2.149.5378b690", publicApiBundleVersion: "0.2.53.aee2f57a" } }, profilePath);
    await writeFile(join(options.assetsRoot, "..", "package.json"), '{"version":"3.2.206.715d940d","unreviewed":true}\n');
    const otherPath = join(options.controlDirectory, "retained-fixture-token");
    await writeFile(otherPath, "synthetic-preserved-data", { mode: 0o600 });
    const before = await readFile(profilePath), information = await lstat(profilePath);
    await assert.rejects(upgradeCalculationProfile(profilePath), /machine-upgrade-installation-hash-mismatch/u);
    assert.deepEqual(await readFile(profilePath), before);
    const after = await lstat(profilePath);
    assert.equal(after.ino, information.ino); assert.equal(after.mode, information.mode);
    assert.equal(await readFile(otherPath, "utf8"), "synthetic-preserved-data");
    const entries = await readdir(options.controlDirectory);
    assert.deepEqual(entries.toSorted(), ["machine-profile.json", "retained-fixture-token"]);
  });

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
    assert.deepEqual(await loadMachineLaunchProfile({ profilePath }), { ...loaded, installation: { ready: true } });
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

  void test("missing pinned bundles permit only offline launch while strict reuse still refuses", async (context) => {
    const options = await fixture(context);
    const profile = await createMachineProfile(options);
    const profilePath = join(options.controlDirectory, "machine-profile.json");
    await writeMachineProfile(profile, profilePath);
    const pcbPath = join(options.assetsRoot, "pro-pcb", profile.easyeda.pcbBundleVersion, "js", "pcb.js");
    await rename(pcbPath, `${pcbPath}.retained`);
    const loaded = await loadMachineLaunchProfile({ profilePath });
    assert.deepEqual(loaded.profile, profile);
    assert.deepEqual(loaded.installation, { ready: false, code: "machine-installation-pcb-bundle-unavailable" });
    await assert.rejects(readMachineProfile(profilePath), /machine-installation-pcb-bundle-unavailable/u);
    await assert.rejects(loadRuntimeMachineProfile({ profilePath }), /machine-installation-pcb-bundle-unavailable/u);
    await assert.rejects(configureMachine(["--profile", profilePath]), /machine-installation-pcb-bundle-unavailable/u);
    // Invalid trust inputs are fatal even when external installation files are missing.
    await chmod(profilePath, 0o644);
    await assert.rejects(loadMachineLaunchProfile({ profilePath }), /machine-profile-file-not-private/u);
    await chmod(profilePath, 0o600);
    const mismatchPath = join(options.controlDirectory, "wrong-node.json");
    await writeMachineProfile({ ...profile, runtime: { ...profile.runtime, nodeSha256: "0".repeat(64) } }, mismatchPath);
    await assert.rejects(loadMachineLaunchProfile({ profilePath: mismatchPath }), /machine-node-hash-mismatch/u);
    assert.deepEqual(JSON.parse(await readFile(profilePath, "utf8")), profile);
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

  void test("retains the exact admitted Node descriptor for repeated proof and closes it on refusal", async (context) => {
    const options = await fixture(context);
    const profile = await createMachineProfile(options);
    const node = await openVerifiedMachineNode(profile.runtime);
    const expected = await lstat(profile.runtime.nodeExecutable);
    const retained = await lstat(node.descriptorPath);
    assert.equal(retained.isSymbolicLink(), true);
    assert.equal(node.runtime.nodeSha256, profile.runtime.nodeSha256);
    await node.assertCurrent();
    const descriptor = await open(node.descriptorPath, "r");
    try {
      const information = await descriptor.stat();
      assert.equal(information.dev, expected.dev);
      assert.equal(information.ino, expected.ino);
    } finally {
      await descriptor.close();
      await node.close();
    }
    await assert.rejects(lstat(node.descriptorPath), { code: "ENOENT" });
    await assert.rejects(node.assertCurrent(), { code: "EBADF" });
  });

  void test("rejects a replacement digest before executing even its --version probe", async (context) => {
    const options = await fixture(context);
    const nodeExecutable = join(options.pluginRoot, "node");
    await copyFile(options.nodeExecutable, nodeExecutable);
    const profile = await createMachineProfile({ ...options, nodeExecutable });
    const profilePath = join(options.controlDirectory, "machine-profile.json");
    await writeMachineProfile(profile, profilePath);
    const marker = join(options.pluginRoot, "replacement-executed");
    await rename(nodeExecutable, `${nodeExecutable}.retained`);
    await writeFile(nodeExecutable, `#!/bin/sh\nprintf executed > '${marker}'\nprintf 'v24.18.0\\n'\n`, { mode: 0o755 });
    // Reach the digest check under restrictive caller umasks as well.
    await chmod(nodeExecutable, 0o755);
    await assert.rejects(readMachineProfile(profilePath), /machine-node-hash-mismatch/u);
    await assert.rejects(openVerifiedMachineNode(profile.runtime), /machine-node-hash-mismatch/u);
    await assert.rejects(lstat(marker), { code: "ENOENT" });
  });

  void test("refuses pathname and symlink replacement while retaining the original executable", async (context) => {
    const options = await fixture(context);
    const nodeExecutable = join(options.pluginRoot, "node");
    await copyFile(options.nodeExecutable, nodeExecutable);
    const profile = await createMachineProfile({ ...options, nodeExecutable });
    const node = await openVerifiedMachineNode(profile.runtime);
    try {
      await rename(nodeExecutable, `${nodeExecutable}.retained`);
      await symlink(`${nodeExecutable}.retained`, nodeExecutable);
      await assert.rejects(node.assertCurrent(), /machine-node-changed/u);
      await assert.rejects(openVerifiedMachineNode(profile.runtime), /bounded-canonical-regular/u);
    } finally {
      await node.close();
    }
    await assert.rejects(lstat(node.descriptorPath), { code: "ENOENT" });
  });

  void test("rejects in-place bytes, permissions and link-count changes before another version probe", async (context) => {
    const options = await fixture(context);
    const nodeExecutable = join(options.pluginRoot, "node");
    for (const change of ["bytes", "permissions", "links"] as const) {
      await copyFile(options.nodeExecutable, nodeExecutable);
      await chmod(nodeExecutable, 0o755);
      const profile = await createMachineProfile({ ...options, nodeExecutable });
      const node = await openVerifiedMachineNode(profile.runtime);
      try {
        if (change === "bytes") {
          const writable = await open(nodeExecutable, "r+");
          try {
            await writable.write(Buffer.from([0]), 0, 1, 0);
          } finally {
            await writable.close();
          }
        } else if (change === "permissions") {
          await chmod(nodeExecutable, 0o644);
        } else {
          await link(nodeExecutable, `${nodeExecutable}.link`);
        }
        await assert.rejects(node.assertCurrent(), /machine-node-changed/u);
      } finally {
        await node.close();
      }
    }
  });
});
