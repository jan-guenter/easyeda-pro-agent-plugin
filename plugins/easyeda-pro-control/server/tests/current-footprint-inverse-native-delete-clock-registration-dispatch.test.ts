/** Actual PowerShell 5/C#5 string marshalling, with an inert receiver only. */
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access } from "node:fs/promises";
import { test } from "node:test";
import { promisify } from "node:util";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_REGISTRATION_DISPATCH as DISPATCH } from "../src/current-footprint-inverse-native-delete-clock-registration-native.ts";
import { currentFootprintInverseNativeDeleteClockRegistrationCases as cases,
  currentFootprintInverseNativeDeleteClockRegistrationNativeFrame as frame,
  currentFootprintInverseNativeDeleteClockRegistrationWire as wire } from "../src/current-footprint-inverse-native-delete-clock-registration-protocol.ts";

const encoded = (value: string): string => Buffer.from(value).toString("base64");

void test("actual registration dispatch preserves null initial role and named property role across PS5/C#5", async context => {
  let powershell: string | undefined;
  for (const candidate of ["/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe", String.raw`C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe`]) {
    try { await access(candidate); powershell = candidate; break; } catch {
      // PowerShell 5 is platform-specific.
    }
  }
  if (powershell === undefined) { context.skip("Windows PowerShell 5 is unavailable."); return; }
  const all = cases(), initial = all.find(command => command.phase === "inverse-native-delete-clock-registration-initial");
  const property = all.find(command => command.method === "Runtime.getProperties" && command.role === "initial");
  assert.ok(initial !== undefined && property !== undefined); const commands = [initial, property];
  const requests: Record<string, string | number>[] = [];
  for (const command of commands) {
    const payload = JSON.stringify(wire(command, 79, "original_ui"));
    const raw = frame(Buffer.from(`${payload}\0`), command, "original_ui");
    requests.push({ ...raw, id: 1, helperInstance: "inert_helper", jobId: "inert_job", rootPid: 1, rootCreated: "inert" });
  }
  const receiver = String.raw`public sealed class RegistrationDispatchProbe {
public int Calls; public bool InitialWasNull; public bool NamedRolePreserved;
public void ControlNativeDeleteClockRegistration(string phase,System.Collections.IDictionary fields){throw new System.Exception("unexpected control");}
public void SendNativeDeleteClockRegistration(int id,string phase,string role,string method,System.Collections.IDictionary fields){
if(id!=79)throw new System.Exception("wrong id");
if(Calls==0){if(phase!="inverse-native-delete-clock-registration-initial"||role!=null||method!="Runtime.callFunctionOn"||fields["projectUuid"] as string!=new string('a',64))throw new System.Exception("initial role was coerced");InitialWasNull=true;}
else if(Calls==1){if(phase!="inverse-native-delete-clock-registration-properties"||role!="initial"||method!="Runtime.getProperties")throw new System.Exception("named role changed");NamedRolePreserved=true;}
else throw new System.Exception("extra call");Calls++;}}
`;
  const program = String.raw`$ErrorActionPreference='Stop';$ProgressPreference='SilentlyContinue';
if($PSVersionTable.PSVersion.Major -ne 5){throw 'requires-actual-windows-powershell5'}
$provider=New-Object Microsoft.CSharp.CSharpCodeProvider;
try{$parameters=New-Object System.CodeDom.Compiler.CompilerParameters;$parameters.GenerateInMemory=$true;$parameters.WarningLevel=4;$parameters.TreatWarningsAsErrors=$true;$parameters.CompilerOptions='/langversion:5';$null=$parameters.ReferencedAssemblies.Add('System.dll');$null=$parameters.ReferencedAssemblies.Add('System.Core.dll');
$compiled=$provider.CompileAssemblyFromSource($parameters,[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${encoded(receiver)}')));
if($compiled.Errors.Count -ne 0 -or $compiled.NativeCompilerReturnValue -ne 0){throw 'probe-compile-failed'}
$owner=$compiled.CompiledAssembly.CreateInstance('RegistrationDispatchProbe');
$FootprintInverseNativeLifecycle209=$true;$FootprintInverse209=$true;$launched=$true;
$requests=ConvertFrom-Json ([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${encoded(JSON.stringify(requests))}')));
foreach($request in $requests){switch($request.action){${DISPATCH}};if($result.written -ne $true){throw 'dispatch-not-written'}}
if($owner.Calls -ne 2 -or -not $owner.InitialWasNull -or -not $owner.NamedRolePreserved){throw 'dispatch-proof'}
'{"initialNull":true,"namedRolePreserved":true,"calls":2,"nativeOwnerIssued":false}'
}finally{$provider.Dispose()}
`;
  // oxlint-disable-next-line typescript/strict-void-return -- promisify joins the original ChildProcess completion callback.
  const execute = promisify(execFile);
  const result = await execute(powershell, ["-NoLogo", "-NoProfile", "-NonInteractive", "-EncodedCommand", Buffer.from(program, "utf16le").toString("base64")],
    { timeout: 45_000, maxBuffer: 16_384 });
  assert.equal(result.stderr, "");
  const actual: unknown = JSON.parse(result.stdout.trim());
  assert.deepEqual(actual, { initialNull: true, namedRolePreserved: true, calls: 2, nativeOwnerIssued: false });
});
