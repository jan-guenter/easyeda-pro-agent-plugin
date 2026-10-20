import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmod, link, mkdir, mkdtemp, readFile, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { createCurrentPcbDiagnosticInstallationPlan, verifyCurrentPcbDiagnosticPowerShell } from "../src/current-pcb-diagnostic-installation.ts";

const OPTIONS = Object.freeze({ pluginRoot: "/mnt/c/Plugins/control", assetsRoot: "/mnt/c/Reviewed/EasyEDA/resources/app/assets",
  powershellSha256: "a".repeat(64), powershellBytes: 1234 });
void test("diagnostic installation plan derives five fixed pins and cannot select another PowerShell", () => {
  const value = createCurrentPcbDiagnosticInstallationPlan(OPTIONS);
  assert.equal(value.plan.schema, "easyeda-pro-control.pcb-diagnostic-installation.v1");
  assert.equal(value.plan.files.length, 5);
  assert.deepEqual(value.plan.files.map(pin => pin.windowsPath), [String.raw`C:\Reviewed\EasyEDA\easyeda-pro.exe`,
    String.raw`C:\Reviewed\EasyEDA\resources\app\app.js`, String.raw`C:\Reviewed\EasyEDA\resources\app\package.json`,
    String.raw`C:\Reviewed\EasyEDA\resources\app\editor.ini`, String.raw`C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe`]);
  assert.equal(value.plan.files[0]?.sha256, "e59d159f0f7bb5ac4832ce6583622251750ede7b839050f3aabe774cadfd1f55");
  assert.equal(value.plan.files[4]?.sha256, OPTIONS.powershellSha256);
  assert.equal(value.paths.powershellExecutable, "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe");
  assert.ok(Object.isFrozen(value) && Object.isFrozen(value.paths) && Object.isFrozen(value.plan) && Object.isFrozen(value.plan.files));
  assert.ok(value.plan.files.every(Object.isFrozen));
});
for (const assetsRoot of ["/mnt/c/CON/resources/app/assets", "/mnt/c/Valid./resources/app/assets", "/mnt/c/Valid /resources/app/assets",
  "/mnt/c/Bad:stream/resources/app/assets", "/mnt/c/Bad\u007F/resources/app/assets", "/mnt/c/A?B/resources/app/assets",
  "/mnt/c/A/../B/resources/app/assets", `/mnt/c/${"x".repeat(121)}/resources/app/assets`, `/mnt/c/${"x/".repeat(121)}resources/app/assets`]) {
  void test(`diagnostic installation rejects unsupported path ${JSON.stringify(assetsRoot)}`, () => {
    assert.throws(() => createCurrentPcbDiagnosticInstallationPlan({ ...OPTIONS, assetsRoot }));
  });
}
void test("diagnostic installation rejects missing, malformed and oversized PowerShell pins", () => {
  for (const powershellBytes of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 16_777_217]) {
    assert.throws(() => createCurrentPcbDiagnosticInstallationPlan({ ...OPTIONS, powershellBytes }), /REFUSED/u);
  }
  for (const powershellSha256 of ["", "a".repeat(63), "A".repeat(64), "g".repeat(64)]) {
    assert.throws(() => createCurrentPcbDiagnosticInstallationPlan({ ...OPTIONS, powershellSha256 }), /REFUSED/u);
  }
});
void test("PowerShell descriptor proof rejects different bytes, links to paths, directories and extra data", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "pcb-native-installation-"));
  const bytes = Buffer.from("Synthetic native image. No program is executed.");
  const file = path.join(directory, "powershell.exe"); await writeFile(file, bytes, { mode: 0o600, flag: "wx" });
  const expected = { bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") };
  await verifyCurrentPcbDiagnosticPowerShell(file, expected);
  await assert.rejects(verifyCurrentPcbDiagnosticPowerShell(file, { ...expected, sha256: "0".repeat(64) }), /REFUSED/u);
  await assert.rejects(verifyCurrentPcbDiagnosticPowerShell(file, { ...expected, bytes: expected.bytes - 1 }), /REFUSED/u);
  const linked = path.join(directory, "link.exe"); await symlink(file, linked);
  await assert.rejects(verifyCurrentPcbDiagnosticPowerShell(linked, expected), /REFUSED/u);
  await mkdir(path.join(directory, "directory.exe"));
  await assert.rejects(verifyCurrentPcbDiagnosticPowerShell(path.join(directory, "directory.exe"), expected), /REFUSED/u);
  // Windows servicing can retain hardlinks. A byte-identical hardlink is not a
  // Named-file substitution; the native lock subsequently guards its file ID.
  const hardlink = path.join(directory, "hardlink.exe"); await link(file, hardlink);
  await verifyCurrentPcbDiagnosticPowerShell(hardlink, expected);
  await chmod(file, 0o400); await verifyCurrentPcbDiagnosticPowerShell(file, expected);
});
void test("native installation source retains read leases, ancestry and volume paths through Job closure", async () => {
  const source = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  assert.ok(source.includes("directory?0x80u:0x80000000u,1u"));
  assert.ok(source.includes("leases.Add(lease); // Allocate retention before the native acquisition."));
  assert.ok(source.includes("new SafeFileHandle(lease.Handle,false)"));
  assert.ok(source.includes("installation.AssertCurrent();\n        // This Windows tuple rejects GUID/NT image paths"));
  assert.ok(source.includes("CreateProcess(installation.Executable,new StringBuilder(args),IntPtr.Zero,IntPtr.Zero,true,0x00080004"));
  assert.ok(source.includes("installation.ExecutableNativeDirectory.Length>=260"));
  assert.ok(source.includes("installation.Release(); released=true"));
  assert.ok(source.indexOf('if(!Terminated()) throw Error("retain-live-owner")') < source.indexOf("installation.Release(); released=true"));
  assert.ok(source.includes('if(rootCreated==0) throw Error("cleanup-only")'));
  assert.ok(source.includes("rootCreated=created;"));
  assert.ok(!source.includes("GetProcessTimes(root,out rootCreated"));
  assert.ok(source.includes("AssertCleanupLive(); Native(PostMessage"));
  assert.ok(!source.includes("Process.GetProcessById"));
  assert.ok(!source.includes("TerminateProcess"));
});
void test("native DOS creation verifies the retained original image before one primary-thread resume", async () => {
  const source = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  const core = source.slice(source.indexOf("void CreateVerifiedRoot()"), source.indexOf("// Exact worker diagnostic program."));
  assert.ok(core.includes("root=info.process; rootThread=info.thread; rootPid=info.processId;"));
  const retained = core.indexOf("creationPhase=CreationPhase.RootRetained");
  const image = core.indexOf("installation.AssertCreatedImage(root)");
  const resume = core.indexOf("if(ResumeThread(rootThread)!=1)");
  assert.ok(retained !== -1 && retained < image && image < resume && resume < core.indexOf("Close(ref rootThread)"));
  assert.equal(core.match(/ResumeThread\(rootThread\)/gu)?.length, 1);
  assert.ok(core.includes('throw Error("primary-thread-resume")'));
  assert.ok(source.includes("string expected=FinalPath(selected.Handle,2);"));
  assert.ok(source.includes("QueryFullProcessImageName(process,1,actual,ref count)"));
  assert.ok(source.includes("selected.Mapping+selected.Path.Substring(2)"));
  assert.ok(source.includes("Same(selected.Before,Facts(selected),false); AssertCurrent();"));
  assert.ok(!source.includes("'resume'"));
  assert.ok(!source.includes("OpenProcess("));
  assert.ok(!source.includes("TerminateJobObject"));
});
void test("native unlaunched release refuses any consumed launch or retained native root", async () => {
  const source = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  const method = source.slice(source.indexOf("public void ReleaseUnlaunched()"), source.indexOf("public void ReleaseClosed()"));
  assert.ok(method.includes('if(launchAttempted || root!=IntPtr.Zero || rootThread!=IntPtr.Zero || rootPid!=0 || rootCreated!=0 || JobCount()!=0) throw Error("unlaunched-release-refused");'));
  assert.ok(method.indexOf('throw Error("unlaunched-release-refused")') < method.indexOf("ReleaseClosed();"));
  assert.ok(source.includes("$owner.ReleaseUnlaunched(); $release=$true; $result=@{released=$true;launchNeverAttempted=$true}"));
  assert.ok(source.includes("if ((@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,id') {throw 'pcb-diagnostic-unlaunched-fields'}"));
});
