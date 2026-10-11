import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { test } from "node:test";
import { promisify } from "node:util";
import { z } from "zod";

// oxlint-disable-next-line typescript/strict-void-return -- Node execFile returns a ChildProcess; promisify consumes its callback.
const execute = promisify(execFile);
const WINDOWS_POWERSHELL = "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe";

async function powershellPath(): Promise<string | undefined> {
  for (const candidate of [WINDOWS_POWERSHELL, "/usr/bin/pwsh"]) {
    try { await access(candidate); return candidate; } catch {
      // Tests can run their managed doubles on either PowerShell platform.
    }
  }
  return undefined;
}

async function run(powershell: string, program: string): Promise<unknown> {
  const pending = execute(powershell, ["-NoLogo", "-NoProfile", "-NonInteractive", "-EncodedCommand",
    Buffer.from(`$ErrorActionPreference='Stop';$ProgressPreference='SilentlyContinue';\n${program}\nexit 0;`, "utf16le").toString("base64")],
  { timeout: 15_000, maxBuffer: 32_768 });
  pending.child.stdin?.end();
  const { stdout, stderr } = await pending;
  assert.equal(stderr, "");
  const actual: unknown = JSON.parse(stdout.trim());
  return actual;
}

async function diagnosticSource(): Promise<{ helper: string; csharp: string; projection: string }> {
  const helper = await readFile(new URL("../../scripts/native-ui-controller.ps1", import.meta.url), "utf8");
  const csharp = /^public static class EasyedaDesktopDiagnostic \{[\s\S]*?^\}/mu.exec(helper)?.[0];
  const projection = /^function Get-DesktopStatus\([^\n]+\) \{[\s\S]*?^\}/mu.exec(helper)?.[0];
  assert.ok(csharp !== undefined && projection !== undefined);
  return { helper, csharp, projection };
}

function compile(csharp: string): string {
  return `Add-Type @'\nusing System;using System.Collections.Generic;using System.Runtime.InteropServices;\n${csharp}\n'@;`;
}

void test("actual desktop diagnostic handles unavailable APIs, privacy, WTS bounds and owned handle cleanup", async (context) => {
  const powershell = await powershellPath();
  if (powershell === undefined) { context.skip("PowerShell is unavailable on this platform."); return; }
  const { csharp, projection, helper } = await diagnosticSource();
  // Substitute only OS calls. Run the packaged projections, bound checks and
  // Resource cleanup is unchanged; no windows are enumerated or interacted with.
  const replacements = [
    ["GetCurrentThreadId", "static uint GetCurrentThreadId(){return 11;}"],
    ["GetThreadDesktop", "static IntPtr GetThreadDesktop(uint thread){return new IntPtr(12);}"],
    ["OpenInputDesktop", "static IntPtr OpenInputDesktop(uint flags,bool inherit,uint access){if(flags!=0||inherit||access!=1)throw new Exception();return Mode==10?IntPtr.Zero:new IntPtr(13);}"],
    ["CloseDesktop", "static bool CloseDesktop(IntPtr handle){if(handle.ToInt64()!=13)throw new Exception();Closed++;return true;}"],
    ["GetUserObjectInformation", "static bool GetUserObjectInformation(IntPtr handle,int index,out int value,uint length,out uint needed){if(index!=6||length!=4)throw new Exception();value=Mode==1?0:1;needed=Mode==2?8u:4u;return Mode!=3;}"],
    ["WTSQuerySessionInformation", "static bool WTSQuerySessionInformation(IntPtr server,int session,int info,out IntPtr data,out int bytes){if(server!=IntPtr.Zero||session!=7||info!=25)throw new Exception();data=Marshal.AllocHGlobal(232);bytes=Mode==4?19:Mode==5?4097:232;Marshal.WriteInt32(data,0,Mode==6?2:1);Marshal.WriteInt32(data,8,Mode==7?8:7);Marshal.WriteInt32(data,12,Mode==8?99:0);Marshal.WriteInt32(data,16,Mode==8?-1:1);return Mode!=9;}"],
    ["WTSFreeMemory", "static void WTSFreeMemory(IntPtr data){Freed++;Marshal.FreeHGlobal(data);}"],
  ] as const;
  let doubled = csharp.replace("public static class EasyedaDesktopDiagnostic {", "public static class EasyedaDesktopDiagnostic { public static int Mode,Closed,Freed;");
  for (const [name, replacement] of replacements) {
    const declaration = new RegExp(`^  \\[DllImport\\([^\\n]+\\)\\] static extern [^\\n]+ ${name}\\([^\\n]+;`, "mu");
    assert.equal(declaration.test(doubled), true, name);
    doubled = doubled.replace(declaration, `  ${replacement}`);
  }
  assert.ok(doubled.includes("var version = Environment.OSVersion.Version;"));
  doubled = doubled.replace("var version = Environment.OSVersion.Version;", "var version = Mode == 11 ? new Version(6,1) : new Version(10,0);");
  assert.equal(doubled.includes("DllImport"), false);
  const controller = `public static class EasyedaUiController {
public static long Foreground;public static bool FailForeground;public static uint Owner=17;
public static IntPtr GetForegroundWindow(){if(FailForeground)throw new Exception("private detail");return new IntPtr(Foreground);}
public static uint GetWindowThreadProcessId(IntPtr handle,out uint owner){owner=Owner;return 11;}}
`;
  const actual = await run(powershell, `${compile(controller + doubled)}
${projection}
$request=@{rootPid=17};function Owned-Window([IntPtr]$handle){return $handle.ToInt64() -eq 18};
$cases=@();foreach($mode in 0..11){[EasyedaDesktopDiagnostic]::Mode=$mode;$before=[EasyedaDesktopDiagnostic]::Closed;
$probe=[EasyedaDesktopDiagnostic]::ProbeDesktopInput();$target=[EasyedaDesktopDiagnostic]::TargetDesktopInput([IntPtr]18,17);
if([EasyedaDesktopDiagnostic]::Closed -ne $before){throw 'borrowed-desktop-closed'};
$input=[EasyedaDesktopDiagnostic]::InputDesktopInput();$session=[EasyedaDesktopDiagnostic]::Session(7);
$cases+=@{mode=$mode;probe=$probe;target=$target;input=$input;session=$session;closed=([EasyedaDesktopDiagnostic]::Closed-$before)}};
[EasyedaDesktopDiagnostic]::Mode=0;$states=@();foreach($fg in 0,18,19){[EasyedaUiController]::Foreground=$fg;$states+=Get-DesktopStatus 7 ([IntPtr]18)};
[EasyedaUiController]::FailForeground=$true;$failed=Get-DesktopStatus -1 ([IntPtr]::Zero);
[EasyedaUiController]::Owner=99;$foreign=[EasyedaDesktopDiagnostic]::TargetDesktopInput([IntPtr]18,17);
@{cases=$cases;states=$states;failed=$failed;foreignTarget=$foreign;freed=[EasyedaDesktopDiagnostic]::Freed}|ConvertTo-Json -Depth 8 -Compress;`);
  assert.ok(actual !== null && typeof actual === "object");
  const expectedCases = Array.from({ length: 12 }, (_, mode) => {
    let input = mode === 1 ? "no" : "yes";
    if (mode === 2 || mode === 3) { input = "unavailable"; }
    let session = { connectState: "active", lockState: "unlocked" };
    if (mode >= 4 && mode <= 7 || mode === 9) { session = { connectState: "unavailable", lockState: "unavailable" }; }
    if (mode === 8) { session = { connectState: "unknown", lockState: "unknown" }; }
    if (mode === 11) { session = { connectState: "active", lockState: "unknown" }; }
    return { mode, probe: input, target: input, input: mode === 10 ? "unavailable" : input, session, closed: mode === 10 ? 0 : 1 };
  });
  const recordSchema = z.record(z.string(), z.unknown());
  const parsed = z.object({ cases: z.unknown(), states: z.array(recordSchema),
    failed: recordSchema, foreignTarget: z.unknown(), freed: z.unknown() }).parse(actual);
  assert.deepEqual(parsed.cases, expectedCases);
  assert.deepEqual(parsed.states.map((state) => state["foreground"]), ["none", "owned", "foreign"]);
  for (const state of parsed.states) {
    assert.deepEqual(Object.keys(state).toSorted(), ["foreground", "inputDesktopInput", "probeDesktopInput", "probeSessionId", "targetDesktopInput", "targetSession", "targetSessionId"]);
    assert.equal(state["targetSessionId"], 7);
    assert.equal(typeof state["probeSessionId"], "number");
  }
  assert.equal(parsed.failed["foreground"], "unavailable");
  assert.equal(parsed.failed["targetSessionId"], null);
  assert.equal(parsed.failed["targetDesktopInput"], "unavailable");
  assert.deepEqual(parsed.failed["targetSession"], { connectState: "unavailable", lockState: "unavailable" });
  assert.equal(parsed.foreignTarget, "unavailable");
  assert.equal(parsed.freed, 15);
  assert.equal(JSON.stringify(actual).includes("private detail"), false);
  assert.ok(helper.includes("desktopStatus=(Get-DesktopStatus $targetSessionId $diagnosticHandle)"));
  for (const unchangedGuard of [
    "if ($action -in @('focused','capture','click','doubleclick','rightclick','hover','keys') -and -not (Owned-Window ([EasyedaUiController]::GetForegroundWindow()))) { throw 'foreign-foreground' }",
    "if ($action -in @('click','doubleclick','rightclick','hover','keys') -and [EasyedaUiController]::GetForegroundWindow() -ne $windowHandle) { throw 'input-target-is-not-foreground' }",
    "if ($writes -and $request.confirmUIWrite -ne $true) { throw 'confirmation-false' }",
  ]) { assert.ok(helper.includes(unchangedGuard)); }
});

void test("actual desktop diagnostic compiles and performs bounded Windows read-only observations", async (context) => {
  try { await access(WINDOWS_POWERSHELL); } catch { context.skip("Windows PowerShell is unavailable on this platform."); return; }
  const { csharp } = await diagnosticSource();
  const controller = `public static class EasyedaUiController {
[DllImport("user32.dll")]public static extern uint GetWindowThreadProcessId(IntPtr handle,out uint owner);}`;
  // Use only this short-lived probe's session. No EasyEDA process, live helper
  // Dispatch, window enumeration, capture, focus and input are not involved.
  const actual = await run(WINDOWS_POWERSHELL, `${compile(controller + csharp)}
@{probe=[EasyedaDesktopDiagnostic]::ProbeDesktopInput();input=[EasyedaDesktopDiagnostic]::InputDesktopInput();
target=[EasyedaDesktopDiagnostic]::TargetDesktopInput([IntPtr]::Zero,0);
session=[EasyedaDesktopDiagnostic]::Session([Diagnostics.Process]::GetCurrentProcess().SessionId)}|ConvertTo-Json -Depth 4 -Compress;`);
  assert.ok(actual !== null && typeof actual === "object");
  const parsed = z.object({ probe: z.unknown(), input: z.unknown(), target: z.unknown(), session: z.record(z.string(), z.unknown()) }).parse(actual);
  assert.ok(["yes", "no", "unavailable"].includes(String(parsed.probe)));
  assert.ok(["yes", "no", "unavailable"].includes(String(parsed.input)));
  assert.equal(parsed.target, "unavailable");
  assert.ok(["active", "connected", "connect-query", "shadow", "disconnected", "idle", "listen", "reset", "down", "initializing", "unknown", "unavailable"].includes(String(parsed.session["connectState"])));
  assert.ok(["locked", "unlocked", "unknown", "unavailable"].includes(String(parsed.session["lockState"])));
});
