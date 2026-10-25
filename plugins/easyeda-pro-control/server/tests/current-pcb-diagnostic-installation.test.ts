import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmod, link, mkdir, mkdtemp, readFile, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { createCurrentPcb209DiagnosticInstallationPlan, createCurrentPcb209RatlineInstallationPlan,
  createCurrentPcbDiagnosticInstallationPlan, verifyCurrentPcbDiagnosticPowerShell } from "../src/current-pcb-diagnostic-installation.ts";
import { CURRENT_PCB_209_RATLINE_INSTALLATION_PROFILE } from "../src/current-pcb-209-ratline-installation-profile.ts";

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
void test("ratline installation extends only its fixed launch plan with every qualified creator and imported source", () => {
  const ordinary = createCurrentPcb209DiagnosticInstallationPlan(OPTIONS), ratline = createCurrentPcb209RatlineInstallationPlan(OPTIONS);
  assert.equal(ordinary.plan.files.length, 5); assert.equal(ratline.plan.files.length, 17);
  assert.deepEqual(ratline.plan.files.slice(0, 5), ordinary.plan.files);
  assert.equal(new Set(ratline.plan.files.map(pin => pin.windowsPath)).size, 17);
  assert.ok(Object.isFrozen(ratline.plan.files) && ratline.plan.files.every(Object.isFrozen));
  assert.deepEqual(CURRENT_PCB_209_RATLINE_INSTALLATION_PROFILE.installedFiles.slice(4).map(pin => pin.relativePath), [
    "pro-versions/3.2.209.8a704eab/editor.ini", "pro-ui/3.2.198.2800f583/js/ui.js", "pro-pcb/3.2.195.6b67774e/js/pcb.js",
    "pro-mgr/3.2.185.bf63a159/js/pro-mgr.js", "pro-mgr/3.2.185.bf63a159/js/project-worker.js", "../version.txt",
    "pro-mgr/3.2.185.bf63a159/js/preload.js", "pro-mgr/3.2.185.bf63a159/js/define-top.js", "pro-api/0.3.59.1ca9efb5/api.js",
    "smt-gl-engine/3.2.56.b216263a/smt-gl-engine.js", "pro-pcb/3.2.195.6b67774e/js/ratlineworker.js", "pro-mgr/3.2.185.bf63a159/js/ws-service.js",
  ]);
});
void test("native ratline acquisition checks the exact extended table before retaining all source leases or creating a process", async () => {
  const source = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  const admission = source.slice(source.indexOf("public void AdmitRatline("), source.indexOf("public void AssertCurrent()"));
  assert.ok(admission.startsWith("public void AdmitRatline("));
  assert.ok(admission.indexOf("EasyedaRatline209Installation.Validate(paths,sizes,hashes)") < admission.indexOf("Admit(corePaths,coreSizes,coreHashes)"));
  assert.ok(admission.includes("for(int index=5;index<paths.Length;index++)Pin(paths[index],sizes[index],hashes[index]);"));
  assert.ok(source.includes("if(workerStartupRatline209)installation.AdmitRatline(paths,sizes,hashes);else installation.Admit(paths,sizes,hashes);"));
  for (const pin of CURRENT_PCB_209_RATLINE_INSTALLATION_PROFILE.installedFiles) { assert.ok(source.includes(pin.sha256)); }
  assert.ok(source.includes("[EasyedaRatline209Installation]::VerifySmoke()"));
  assert.ok(source.includes("$ratlinePurpose=$WorkerStartupRatline209 -or $WorkerStartupRatlineContinuation209"));
  assert.ok(source.includes("$fileCount=if ($ratlinePurpose) {[EasyedaRatline209Installation]::FileCount} else {5}"));
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
  // Debugger.resume is a fixed startup cleanup phase. It must not expose a
  // Separate native-thread command or add another call to the Win32 API.
  const actionSwitch = "switch -CaseSensitive ($request.action) {";
  const dispatcher = source.slice(source.indexOf(actionSwitch));
  assert.ok(dispatcher.startsWith(actionSwitch));
  assert.doesNotMatch(dispatcher, /^\s*(?:['"]resume['"]|resume)\s*\{/mu);
  assert.doesNotMatch(dispatcher, /\$_\s+-c?eq\s+['"]resume['"]/u);
  // One P/Invoke declaration plus the image-verified call checked above.
  assert.equal(source.match(/\bResumeThread\s*\(/gu)?.length, 2);
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
