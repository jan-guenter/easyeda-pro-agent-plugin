import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const fixturePath = new URL("../../scripts/pcb-diagnostic-launch-smoke.ps1", import.meta.url);
const helperPath = new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url);

void test("synthetic launch fixture binds exact helper bytes without executing its PowerShell dispatcher", async () => {
  const [fixture, helper] = await Promise.all([readFile(fixturePath, "utf8"), readFile(helperPath)]);
  const hash = createHash("sha256").update(helper).digest("hex");
  assert.ok(fixture.includes(`if ($helperHash -cne '${hash}')`));
  assert.ok(fixture.includes(`if ($bytes.Length -ne ${String(helper.length)})`));
  assert.ok(fixture.includes("if (-not $ConfirmSyntheticChildLaunch)"));
  assert.ok(fixture.includes('$native = $source.Substring($start+$begin.Length,$stop-$start-$begin.Length)'));
  assert.ok(!fixture.includes("Invoke-Expression"));
  assert.ok(!fixture.includes("& $helper"));
  assert.ok(!fixture.includes(". $helper"));
  assert.ok(!fixture.includes("Start-Process"));
  assert.ok(fixture.includes("Read-BoundedFile $helper 524288"));
  assert.ok(helper.length <= 524_288);
  assert.ok(fixture.includes("Read-BoundedFile $executable 1048576"));
});

void test("synthetic launch comparisons change one baseline variable and stop after creation or uncertain outcome", async () => {
  const fixture = await readFile(fixturePath, "utf8");
  assert.ok(fixture.includes("for(int variant=stableImageOnly?4:0;variant<(stableImageOnly?5:4);variant++)"));
  assert.ok(fixture.includes("bool includeJob=variant!=2;"));
  assert.ok(fixture.includes("variant==3?installation.Executable:installation.ExecutableNativePath;"));
  assert.ok(fixture.includes("string directory=variant==1?Path.GetDirectoryName(installation.Executable):installation.ExecutableNativeDirectory;"));
  assert.ok(fixture.includes("if(result.Created || result.Error!=87) break;"));
  assert.ok(fixture.includes('throw Error("synthetic-unknown-output")'));
  assert.ok(fixture.includes("owner.RetainUntilClosed();"));
  assert.ok(fixture.includes("WaitForSingleObject(root,10000)"));
  assert.ok(fixture.includes("Native(GetExitCodeProcess(root,out exitCode))"));
  assert.ok(!fixture.includes("TerminateProcess"));
  assert.ok(!fixture.includes("TerminateJobObject"));
  assert.ok(!fixture.includes("Kill("));
  assert.ok(!fixture.includes("OpenProcess("));
});

void test("synthetic launch child is freshly authored and absent creation is not reported as root exit", async () => {
  const fixture = await readFile(fixturePath, "utf8");
  assert.ok(fixture.includes('"easyeda-native-launch-"+Guid.NewGuid().ToString("N")'));
  assert.ok(fixture.includes("public static class SyntheticNoop"));
  assert.ok(fixture.includes("'synthetic-noop.exe'"));
  assert.ok(fixture.includes("-OutputType ConsoleApplication"));
  assert.ok(fixture.includes("result.NoProcessCreated=true;"));
  assert.ok(!fixture.includes("result.OriginalRootExited=true;"));
  assert.ok(!fixture.includes("Remove-Item"));
  assert.ok(!fixture.includes("Directory.Delete"));
  assert.ok(!fixture.includes("File.Delete"));
  assert.ok(!fixture.includes(".easyeda-pro-control"));
  assert.ok(!fixture.includes("easyeda-pro.exe"));
});

void test("verified-image synthetic mode uses the real shared core and no alternate resume or process adoption", async () => {
  const fixture = await readFile(fixturePath, "utf8");
  assert.ok(fixture.includes("if ($StableImagePathProbe -and $VerifiedImageProbe)"));
  assert.ok(fixture.includes("if(verifiedImageOnly) return VerifySyntheticCreatedImage(executable,bytes,hash);"));
  // oxlint-disable-next-line unicorn/prefer-set-has -- This slice is a string of C# source; includes checks source substrings, not array membership.
  const method = fixture.slice(fixture.indexOf("static SyntheticResult[] VerifySyntheticCreatedImage("), fixture.indexOf("SyntheticResult SyntheticAttempt("));
  assert.ok(method.includes("owner.CreateVerifiedRoot();"));
  assert.ok(method.includes("if(!owner.launchCompleted)"));
  assert.ok(method.includes("owner.creationPhase!=CreationPhase.ReturnedFalse"));
  assert.ok(method.includes("WaitForSingleObject(owner.root,10000)"));
  assert.ok(method.includes("owner.ReleaseClosed(); result.Released=true;"));
  assert.ok(method.includes("finally { owner.RetainUntilClosed(); }"));
  assert.ok(!method.includes("CreateProcess("));
  assert.ok(!method.includes("ResumeThread("));
  assert.ok(fixture.includes("System.Threading.Thread.Sleep(1000);"));
});
