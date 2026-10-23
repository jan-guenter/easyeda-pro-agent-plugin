import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { diagnoseConfiguredInstallation, inspectMachineInstallation } from "../src/machine-installation-diagnostics.ts";
import type { MachineProfile } from "../src/machine-profile.ts";

async function fixture(context: TestContext): Promise<MachineProfile> {
  const root = await mkdtemp(join(tmpdir(), "easyeda-installation-diagnostic-"));
  context.after(async () => { await rm(root, { recursive: true, force: true }); });
  const assetsRoot = join(root, "assets");
  await mkdir(join(assetsRoot, "pro-pcb", "3.2.new", "js"), { recursive: true });
  await mkdir(join(assetsRoot, "pro-api", "0.3.new"), { recursive: true });
  await writeFile(join(root, "package.json"), JSON.stringify({ version: "3.2.new", ignored: "private metadata" }));
  return { schema: "easyeda-pro-control.machine-profile.v1", platform: "linux-x64",
    runtime: { nodeExecutable: join(root, "node"), nodeVersion: "24.18.0", nodeSha256: "a".repeat(64) },
    upstream: { root: join(root, "upstream"), entrypoint: join(root, "upstream", "dist", "index.js"), serverVersion: "1.0.0" },
    easyeda: { assetsRoot, pcbBundleVersion: "3.2.old", publicApiBundleVersion: "0.3.old" }, controlDirectory: join(root, "control") };
}

void test("reports all missing configured bundles and inert candidates without paths or execution admission", async (context) => {
  const profile = await fixture(context);
  const result = await inspectMachineInstallation(profile);
  assert.deepEqual(result["application"], { state: "present", version: "3.2.new" });
  assert.deepEqual(result["pcb"], { state: "present", configuredVersion: "3.2.old",
    configuredFiles: { implementation: "missing" }, candidateVersions: ["3.2.new"], candidatesAdmitted: false });
  assert.deepEqual(result["publicApi"], { state: "present", configuredVersion: "0.3.old",
    configuredFiles: { implementation: "missing", adapter: "missing", declarations: "missing" },
    candidateVersions: ["0.3.new"], candidatesAdmitted: false });
  assert.equal(result["liveExecutionAvailable"], false);
  const encoded = JSON.stringify(result);
  assert.equal(encoded.includes(profile.easyeda.assetsRoot), false);
  assert.equal(encoded.includes("private metadata"), false);
});

void test("existing configured files are metadata observations, not compatibility approval", async (context) => {
  const profile = await fixture(context);
  const selected = { ...profile, easyeda: { ...profile.easyeda, pcbBundleVersion: "3.2.new", publicApiBundleVersion: "0.3.new" } };
  await writeFile(join(profile.easyeda.assetsRoot, "pro-pcb", "3.2.new", "js", "pcb.js"), "inert-not-reviewed");
  for (const name of ["api.js", "api-types.js", "api-types.d.ts"]) {
    await writeFile(join(profile.easyeda.assetsRoot, "pro-api", "0.3.new", name), "inert-not-reviewed");
  }
  const result = await inspectMachineInstallation(selected);
  assert.deepEqual(result["pcb"], { state: "present", configuredVersion: "3.2.new",
    configuredFiles: { implementation: "present" }, candidateVersions: ["3.2.new"], candidatesAdmitted: false });
  assert.equal(result["candidatesAdmitted"], false);
  assert.equal(result["liveExecutionAvailable"], false);
});

void test("does not follow configured or candidate symlinks", async (context) => {
  const profile = await fixture(context);
  const pcb = join(profile.easyeda.assetsRoot, "pro-pcb");
  await symlink(join(pcb, "3.2.new"), join(pcb, "3.2.old"));
  await writeFile(join(pcb, "3.2.new", "js", "pcb.js"), "inert");
  const result = await inspectMachineInstallation(profile);
  assert.deepEqual(result["pcb"], { state: "present", configuredVersion: "3.2.old",
    configuredFiles: { implementation: "unsafe" }, candidateVersions: ["3.2.new"], candidatesAdmitted: false });
});

void test("oversized listings never return a misleading partial inventory", async (context) => {
  const profile = await fixture(context);
  for (let index = 0; index < 128; index += 1) { await mkdir(join(profile.easyeda.assetsRoot, "pro-api", `1.${index}`)); }
  const result = await inspectMachineInstallation(profile);
  assert.deepEqual(result["publicApi"], { state: "too-many-entries", configuredVersion: "0.3.old",
    configuredFiles: { implementation: "missing", adapter: "missing", declarations: "missing" },
    candidateVersions: [], candidatesAdmitted: false });
});

void test("rejects invalid package version and missing or symlinked assets with bounded diagnostics", async (context) => {
  const profile = await fixture(context);
  await writeFile(join(profile.easyeda.assetsRoot, "..", "package.json"), JSON.stringify({ version: "/private/path" }));
  const malformed = await inspectMachineInstallation(profile);
  assert.deepEqual(malformed["application"], { state: "unsafe" });
  const missingProfile = { ...profile, easyeda: { ...profile.easyeda, assetsRoot: join(profile.controlDirectory, "absent") } };
  assert.deepEqual(await inspectMachineInstallation(missingProfile), { state: "missing", configuredBundleFilesPresent: false, candidatesAdmitted: false, liveExecutionAvailable: false });
  const link = join(profile.easyeda.assetsRoot, "..", "linked-assets");
  await symlink(profile.easyeda.assetsRoot, link);
  assert.deepEqual(await inspectMachineInstallation({ ...profile, easyeda: { ...profile.easyeda, assetsRoot: link } }),
    { state: "unsafe", configuredBundleFilesPresent: false, candidatesAdmitted: false, liveExecutionAvailable: false });
});

void test("wired diagnostic reads private configuration without probing or executing its Node path", async (context) => {
  const profile = await fixture(context);
  await mkdir(profile.controlDirectory, { mode: 0o700 });
  const path = join(profile.controlDirectory, "machine-profile.json");
  await writeFile(path, JSON.stringify(profile), { mode: 0o600 });
  // The configured Node does not exist. Metadata inspection must not attempt
  // Executable admission, which would fail before reporting these observations.
  const previous = process.env["EASYEDA_MACHINE_PROFILE"];
  process.env["EASYEDA_MACHINE_PROFILE"] = path;
  try {
    const result = await diagnoseConfiguredInstallation();
    assert.equal(result["state"], "observed");
    assert.equal(result["configuredBundleFilesPresent"], false);
    assert.equal(result["liveExecutionAvailable"], false);
    assert.equal(result["restartRequired"], true);
    await writeFile(path, "invalid private profile");
    const invalid = await diagnoseConfiguredInstallation();
    assert.equal(invalid["state"], "configuration-unavailable");
    assert.equal(JSON.stringify(invalid).includes(profile.controlDirectory), false);
  } finally {
    if (previous === undefined) { delete process.env["EASYEDA_MACHINE_PROFILE"]; }
    else { process.env["EASYEDA_MACHINE_PROFILE"] = previous; }
  }
});
