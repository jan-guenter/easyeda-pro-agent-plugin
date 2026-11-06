/** Deterministic build-time source assembly. Runtime selection accepts only
 * the generated fixed graph; no source text, path or transform is a tool input. */
import { createHash } from "node:crypto";
import { FORWARD_NATIVE_LEGACY, migrateForwardNativePredecessor } from "./current-footprint-forward-native-migration.ts";
import { CURRENT_FOOTPRINT_FORWARD_NATIVE_GRAPH_LIMITS as LIMITS } from "./current-footprint-forward-native-limits.ts";
import { currentFootprintForwardNativePhaseSource } from "./current-footprint-forward-native-phase.ts";

const hash = (value: string): string => createHash("sha256").update(value).digest("hex");
function replace(source: string, before: string, after: string): string {
  if (source.split(before).length !== 2) { throw new Error("FORWARD_NATIVE_CORE_TRANSFORM"); } return source.replace(before, after);
}
/** First prove the exact released legacy bytes from either reviewed shared
 * helper input. Its separate spatial birth stays outside this forward-only
 * graph. Then retain the released migration and private V2 phase joins. */
export function currentFootprintForwardNativeCore(sharedHelper: string): Readonly<{ core: string; predecessor: string }> {
  const predecessor = migrateForwardNativePredecessor(sharedHelper);
  const begin = "Add-Type @'\n", end = "\n'@\n";
  if (predecessor.split(begin).length !== 2 || predecessor.split(end).length !== 2) { throw new Error("FORWARD_NATIVE_CORE_SECTION"); }
  let core = predecessor.slice(predecessor.indexOf(begin) + begin.length, predecessor.indexOf(end));
  core = replace(core, "public sealed class EasyedaDiagnosticOwner {", "public sealed partial class EasyedaDiagnosticOwner {");
  core = replace(core,
    '  EasyedaDiagnosticOwner(int mainPurpose,bool combined,bool forward,bool execution):this(mainPurpose,combined,forward){if(!execution)throw Error("forward-execution-purpose");forwardExecution=true;workerStartupFootprintCombined209=true;footprintCreateClockPurpose=true;}\n  public static EasyedaDiagnosticOwner CreateFootprintForwardExecution209(){return new EasyedaDiagnosticOwner(209,true,true,true);}',
    "  // The phase partial defines the direct private typed V2 birth constructor.");
  core = replace(core, '    if(job!=IntPtr.Zero || released) throw Error("initialize-consumed");', '    if(forwardExecution)RequireForwardExecutionUnallocated();\n    if(job!=IntPtr.Zero || released) throw Error("initialize-consumed");');
  core = replace(core,
    '    if(forwardExecution){if(action=="footprint-copy-create-clock-begin"||action=="footprint-copy-clock"||action=="footprint-clock-rpc-begin"||action=="footprint-clock-rpc-retire"||action=="main-request-send"||action=="main-completion-begin"||action=="main-completion-send"||action=="main-completion-retire")throw Error("forward-execution-provider-unmounted");AdmitCombinedAction(action);return;}',
    '    if(forwardExecution){AdmitForwardExecutionAction(action);return;}');
  core = replace(core, '"footprint-copy-native-create","footprint-clock-rpc-send","footprint-copy-create-clock-retire"})value.AdmitForwardAction(action);', '"footprint-copy-native-create","footprint-clock-rpc-v2-send","footprint-copy-create-clock-retire"})value.AdmitForwardAction(action);');
  core = replace(core, 'new string[]{"footprint-copy-allocated-create-clock-begin","footprint-copy-allocation-send","footprint-copy-native-create","footprint-clock-rpc-v2-send"',
    'new string[]{"footprint-forward-allocated-clock-begin","footprint-copy-allocation-send","footprint-copy-native-create","footprint-clock-rpc-v2-send"');
  core = replace(core, 'value.FootprintRequestLimit!=EasyedaFootprintForwardLimits.Requests', 'value.FootprintRequestLimit!=EasyedaFootprintForwardExecutionLimits.Requests');
  core = replace(core,
    'public static EasyedaFootprintCopyAllocatedCreateClockLedger ForwardBirth(int first){return new EasyedaFootprintCopyAllocatedCreateClockLedger(first,1002);}',
    'public static EasyedaFootprintCopyAllocatedCreateClockLedger ForwardBirth(int first){return new EasyedaFootprintCopyAllocatedCreateClockLedger(first,1002);}\npublic static EasyedaFootprintCopyAllocatedCreateClockLedger ForwardExecutionBirth(int first){return new EasyedaFootprintCopyAllocatedCreateClockLedger(first,EasyedaFootprintForwardExecutionLimits.Requests);}');
  core = replace(core, 'forwardExecution?EasyedaFootprintCopyAllocatedCreateClockLedger.ForwardBirth(first)', 'forwardExecution?EasyedaFootprintCopyAllocatedCreateClockLedger.ForwardExecutionBirth(first)');
  for (const name of ["RequestLimit", "NormalRequestLimit", "NormalMilliseconds", "TotalMilliseconds"] as const) {
    const field = { RequestLimit: "Requests", NormalRequestLimit: "NormalRequests", NormalMilliseconds: "NormalMilliseconds", TotalMilliseconds: "TotalMilliseconds" }[name];
    const start = `  long Footprint${name} { get { return `;
    core = replace(core, start, `${start}forwardExecution?EasyedaFootprintForwardExecutionLimits.${field}:`);
  }
  core = replace(core,
    '    if(cleanup?forwardCleanupRequests>=EasyedaFootprintForwardLimits.CleanupClass:forwardNormalRequests>=EasyedaFootprintForwardLimits.NormalClass)throw Error("forward-renderer-class");',
    '    if(cleanup?forwardCleanupRequests>=(forwardExecution?EasyedaFootprintForwardExecutionLimits.CleanupClass:EasyedaFootprintForwardLimits.CleanupClass):forwardNormalRequests>=(forwardExecution?EasyedaFootprintForwardExecutionLimits.NormalClass:EasyedaFootprintForwardLimits.NormalClass))throw Error("forward-renderer-class");');
  for (const signature of [
    '  public void SendFootprintClockRegistration(int id,string method,string phase,System.Collections.IDictionary fields) {',
    '  public void SendFootprintClockRpc(int id,string phase,string method,string realm,System.Collections.IDictionary fields) {',
  ]) { core = replace(core, signature, `${signature}\n    if(forwardExecution)throw Error("forward-execution-v1-clock-refused");`); }
  core = replace(core, 'new string[]{"footprint-copy-create-clock-begin","footprint-clock-rpc-begin","main-request-send","main-completion-begin"})', 'new string[]{"footprint-copy-create-clock-begin","footprint-clock-rpc-begin"})');
  core = replace(core, "internal sealed class EasyedaOriginalMainTransport {", "internal sealed partial class EasyedaOriginalMainTransport {");
  core = replace(core, "enum RendererWriteRole { Existing, ClockRpc, NativeCreate }", "enum RendererWriteRole { Existing, ClockRpc, NativeCreate, ForwardCold }");
  core = replace(core, '    if(mainCompletionActive)throw Error("main-completion-exclusive");', '    if(mainCompletionActive&&role!=RendererWriteRole.ForwardCold)throw Error("main-completion-exclusive");');
  core = replace(core, "    bool scoped=role!=RendererWriteRole.Existing;", "    bool coldTail=role==RendererWriteRole.ForwardCold;if(coldTail)RequireForwardColdTail();\n    bool scoped=!coldTail&&role!=RendererWriteRole.Existing;");
  core = replace(core, "readonly int normalLimit,cleanupLimit;", "readonly int normalLimit,cleanupLimit;readonly bool forwardExecutionMain;");
  core = replace(core, "footprintHeadAge209?EasyedaFootprintHeadAgeProtocol.MainRequests:workerStartupFootprintForward209?", "footprintHeadAge209?EasyedaFootprintHeadAgeProtocol.MainRequests:forwardExecution?EasyedaFootprintForwardExecutionLimits.MainRequests:workerStartupFootprintForward209?");
  // Each owner request/completion guard selects the new limit only on its direct typed birth.
  for (const [before, after] of [
    ["id>EasyedaFootprintCombinedLimits.MainRequests", "id>(forwardExecution?EasyedaFootprintForwardExecutionLimits.MainRequests:EasyedaFootprintCombinedLimits.MainRequests)"],
    ["EasyedaFootprintCopyMainCompletionProtocol.Requests>EasyedaFootprintCombinedLimits.MainRequests", "EasyedaFootprintCopyMainCompletionProtocol.Requests>(forwardExecution?EasyedaFootprintForwardExecutionLimits.MainRequests:EasyedaFootprintCombinedLimits.MainRequests)"],
  ] as const) {
    const expected = before.startsWith("id>") ? 2 : 1;
    if (core.split(before).length !== expected + 1) { throw new Error("FORWARD_NATIVE_MAIN_LIMIT_TRANSFORM"); }
    core = core.replaceAll(before, after);
  }
  return Object.freeze({ core, predecessor });
}

function pinCheck(variable: string, text: string, label: string): string {
  return `if ($${variable} -isnot [byte[]] -or $${variable}.Length -ne ${String(Buffer.byteLength(text))}) {throw 'forward-graph-${label}-size'}\n` +
    `$graphHasher=[Security.Cryptography.SHA256]::Create()\ntry {$graphDigest=([BitConverter]::ToString($graphHasher.ComputeHash($${variable}))).Replace('-','').ToLowerInvariant()} finally {$graphHasher.Dispose()}\n` +
    `if ($graphDigest -cne '${hash(text)}') {throw 'forward-graph-${label}-source'}\n`;
}
/** Driver source is derived from the complete preserved predecessor, but its
 * entrypoint and dispatcher have one fixed purpose and captured native inputs. */
function driverSource(predecessor: string, core: string, phase: string): string {
  const begin = "Add-Type @'\n", end = "\n'@\n", firstLine = predecessor.slice(0, predecessor.indexOf("\n"));
  const switches = [...firstLine.matchAll(/\[switch\]\$(\w+)/gu)].map(match => match[1]).filter(name => name !== undefined && name !== "CompileOnly" && name !== "WorkerStartupFootprintForwardExecution209");
  const header = `param([switch]$CompileOnly,[switch]$WorkerStartupFootprintForwardExecution209,[string]$CombinedReadyChallenge)\nif (-not $WorkerStartupFootprintForwardExecution209) {throw 'forward-graph-purpose-required'}\n${switches.map(name => `$${name}=[System.Management.Automation.SwitchParameter]$false`).join("\n")}`;
  let driver = predecessor.slice(0, predecessor.indexOf(begin)) + predecessor.slice(predecessor.indexOf(end) + end.length);
  driver = replace(driver, firstLine, header);
  const compile = `${pinCheck("forwardExecutionCoreBytes", core, "core")}${pinCheck("forwardExecutionPhaseBytes", phase, "phase")}$graphDecoder=[Text.Encoding]::GetEncoding(20127,[Text.EncoderFallback]::ExceptionFallback,[Text.DecoderFallback]::ExceptionFallback)\n$graphNative=$graphDecoder.GetString($forwardExecutionCoreBytes)+"\`n"+$graphDecoder.GetString($forwardExecutionPhaseBytes)\nif ([Text.Encoding]::UTF8.GetByteCount($graphNative) -ne ${String(Buffer.byteLength(core) + 1 + Buffer.byteLength(phase))} -or [Text.Encoding]::UTF8.GetByteCount($graphNative) -gt ${String(LIMITS.compiled)}) {throw 'forward-graph-compiled-size'}\nAdd-Type -TypeDefinition $graphNative\n`;
  const ownerLine = driver.split("\n").find(line => line.startsWith("$owner=if "));
  const limitLine = driver.split("\n").find(line => line.startsWith("$startupRequestLimit=if "));
  if (ownerLine === undefined || limitLine === undefined) { throw new Error("FORWARD_NATIVE_DRIVER_ENTRY"); }
  driver = replace(driver, ownerLine, `${compile}$owner=[EasyedaDiagnosticOwner]::CreateFootprintForwardExecution209()`);
  driver = replace(driver, limitLine, "$startupRequestLimit=[EasyedaFootprintForwardExecutionLimits]::Requests");
  driver = replace(driver, "  $owner.Initialize()", "  $owner.RequireForwardExecutionUnallocated()\n  $owner.Initialize()");
  const compileStart = driver.indexOf("  if ($CompileOnly) {");
  const compileEnd = driver.indexOf("  $launched=$false", compileStart);
  if (compileStart === -1 || compileEnd <= compileStart) { throw new Error("FORWARD_NATIVE_DRIVER_SMOKE"); }
  driver = `${driver.slice(0, compileStart)}  if ($CompileOnly) {
    [EasyedaDiagnosticOwner]::VerifyFootprintForwardExecutionSmoke()
    [EasyedaDiagnosticOwner]::VerifyFootprintForwardExecutionGraphSmoke()
    [EasyedaFootprintCopyAllocatedCreateClockLedger]::VerifySmoke()
    if (-not $owner.Terminated()) {throw 'forward-graph-compile-job-not-empty'}
    $owner.ReleaseUnlaunched()
    @{schema='easyeda-pro-control.footprint-forward-execution-compile.v2';compiled=$true;emptyJob=$true;pipesChecked=$true;processLaunched=$false;executionAuthorized=$false} | ConvertTo-Json -Compress
    return
  }
${driver.slice(compileEnd)}`;
  driver = replace(driver, '      if ($forwardFamily) {$owner.AdmitForwardAction($request.action)}', '      $owner.AdmitForwardExecutionAction($request.action)');
  driver = replace(driver, "      $largeOpening=", "      $largeV2Request=@('footprint-copy-clock-registration-v2','footprint-clock-rpc-v2-send','footprint-forward-cold-send') -ccontains $request.action\n      $largeOpening=");
  driver = replace(driver, "(-not $largeMainRequest -and -not $largeClockRpcRequest -and -not $largeOpening", "(-not $largeV2Request -and -not $largeMainRequest -and -not $largeClockRpcRequest -and -not $largeOpening");
  for (const worker of ["$false", "$true"]) {
    const before = `[EasyedaFootprintForwardLimits]::AllowsExecutionRequestId([long]$request.requestId,([bool]$forwardFamily),${worker})`;
    if (driver.split(before).length !== (worker === "$false" ? 3 : 2)) { throw new Error("FORWARD_NATIVE_DRIVER_REQUEST_IDS"); }
    driver = driver.replaceAll(before, '[EasyedaFootprintForwardExecutionLimits]::AllowsExecutionRequestId([long]$request.requestId)');
  }
  // Two parent/cache occurrences share the same reviewed old limit expression.
  driver = driver.replaceAll('[EasyedaFootprintForwardLimits]::NormalRequests', '[EasyedaFootprintForwardExecutionLimits]::NormalRequests');
  driver = replace(driver, "        'footprint-copy-clock' {", `${v2Dispatch()}        'footprint-copy-clock' {`);
  driver = replace(driver, "$largeMainRequest=$WorkerStartupFootprintCombined209 -and", "$largeMainRequest=$WorkerStartupFootprintForwardExecution209 -and");
  for (const action of ["main-request-send", "main-completion-begin", "main-completion-send", "main-completion-retire"] as const) {
    const start = driver.indexOf(`        '${action}' {`);
    const stop = driver.indexOf("\n        '", start + 1);
    if (start === -1 || stop <= start) { throw new Error("FORWARD_NATIVE_MAIN_DRIVER_SECTION"); }
    let section = driver.slice(start, stop);
    section = replace(section, "-not $WorkerStartupFootprintCombined209", "-not $WorkerStartupFootprintForwardExecution209");
    section = section.replaceAll("[EasyedaFootprintCombinedLimits]::MainRequests", "[EasyedaFootprintForwardExecutionLimits]::MainRequests");
    driver = driver.slice(0, start) + section + driver.slice(stop);
  }
  return driver;
}

/** Scalar-only new phase cases. The original driver still checks its retained
 * helper/Job/root tuple before any action reaches the original owner instance. */
function v2Dispatch(): string {
  return `        'footprint-forward-allocated-clock-begin' {
          if (-not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,coldCleanup,coldNormal,firstRequestId,helperInstance,id,jobId,rootCreated,rootPid') {throw 'forward-cold-clock-fields'}
          foreach ($field in @('coldCleanup','coldNormal','firstRequestId')) {if (($request.$field -isnot [int] -and $request.$field -isnot [long]) -or $request.$field -lt 0 -or $request.$field -gt $startupRequestLimit) {throw 'forward-cold-clock-fields'}}
          $owner.BeginForwardAllocatedClock([int]$request.firstRequestId,[int]$request.coldNormal,[int]$request.coldCleanup)
          $result=@{begun=$true}
        }
        'footprint-forward-cold-begin' {
          if (-not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid') {throw 'forward-cold-begin-fields'}
          $owner.BeginForwardColdTail()
          $result=@{begun=$true}
        }
        'footprint-forward-cold-send' {
          if (-not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt $startupRequestLimit) {throw 'forward-cold-fields'}
          $baseFields=@('id','action','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method')
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'forward-cold-fields'}}
          $fields=New-Object 'System.Collections.Hashtable' ([StringComparer]::Ordinal)
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {if (@('sessionId','scriptId','callFrameId','objectId','breakpointId','argument0','argument1','argument2','argument3','argument4','argument5','argument6') -cnotcontains $property.Name -or $property.Value -isnot [string]) {throw 'forward-cold-field'};$fields.Add($property.Name,$property.Value)}}
          $owner.SendFootprintForwardCold([int]$request.requestId,$request.phase,$request.method,$fields)
          $result=@{written=$true}
        }
        'footprint-copy-clock-registration-v2' {
          if (-not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt $startupRequestLimit) {throw 'forward-registration-v2-fields'}
          $baseFields=@('id','action','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method')
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'forward-registration-v2-fields'}}
          $fields=New-Object 'System.Collections.Hashtable' ([StringComparer]::Ordinal)
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {if (@('objectId','scriptId','argument0','argument1','argument2','argument3','projectUuid','branchUuid','windowTabId') -cnotcontains $property.Name -or $property.Value -isnot [string]) {throw 'forward-registration-v2-field'};$fields.Add($property.Name,$property.Value)}}
          $owner.SendFootprintClockRegistrationV2([int]$request.requestId,$request.phase,$request.method,$fields)
          $result=@{written=$true}
        }
        'footprint-clock-rpc-v2-send' {
          if (-not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or $request.realm -isnot [string] -or @('ui','worker') -cnotcontains $request.realm -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt $startupRequestLimit) {throw 'forward-rpc-v2-fields'}
          $baseFields=@('id','action','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method','realm')
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'forward-rpc-v2-fields'}}
          $fields=New-Object 'System.Collections.Hashtable' ([StringComparer]::Ordinal)
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {if (@('ordinal','clockRequestId','observedValue') -ccontains $property.Name) {if ($property.Value -isnot [int] -and $property.Value -isnot [long]) {throw 'forward-rpc-v2-field'}} elseif (@('objectId','argument0','argument1','argument2','argument3','breakpointId','busUuid','callFrameId','documentUuid','replyTopic','scriptId','uiUuid','workerUuid') -cnotcontains $property.Name -or $property.Value -isnot [string]) {throw 'forward-rpc-v2-field'};$fields.Add($property.Name,$property.Value)}}
          $owner.SendFootprintClockRpcV2([int]$request.requestId,$request.phase,$request.method,$request.realm,$fields)
          $result=@{written=$true}
        }
`;
}

export interface ForwardNativeOutput { readonly role: "driver" | "core" | "phase"; readonly relativePath: string; readonly source: string; readonly bytes: number; readonly sha256: string; readonly maximumBytes: number }
/** Assemble the only three roles, check tighter role and aggregate ceilings,
 * and return exact immutable generation data without touching output files. */
export function currentFootprintForwardNativeOutputs(sharedHelper: string): readonly ForwardNativeOutput[] {
  const { core, predecessor } = currentFootprintForwardNativeCore(sharedHelper), phase = currentFootprintForwardNativePhaseSource();
  const driver = driverSource(predecessor, core, phase);
  const rows = [["driver", "owner.ps1", driver, LIMITS.driver], ["core", "native-core.cs", core, LIMITS.core], ["phase", "native-phase.cs", phase, LIMITS.phase]] as const;
  const result = rows.map(([role, name, source, maximumBytes]) => {
    const bytes = Buffer.byteLength(source);
    if (bytes < 1 || bytes > maximumBytes || bytes > LIMITS.file || Buffer.from(source).some(byte => byte > 127)) { throw new Error(`FORWARD_NATIVE_GRAPH_${role}`); }
    return Object.freeze({ role, relativePath: `scripts/footprint-forward-execution/${name}`, source, bytes, sha256: hash(source), maximumBytes });
  });
  if (result.reduce((total, row) => total + row.bytes, 0) > LIMITS.aggregate || Buffer.byteLength(core) + 1 + Buffer.byteLength(phase) > LIMITS.compiled) { throw new Error("FORWARD_NATIVE_GRAPH_AGGREGATE"); }
  return Object.freeze(result);
}
/** Emit fixed runtime pins separately from the captured driver/native source.
 * Their role order and paths are not selectable by an external caller. The v2
 * legacySha256 continues to name the normalized released source, never a later
 * shared-helper input; that input has its own exact migration pin. */
export function currentFootprintForwardNativePins(outputs: readonly ForwardNativeOutput[]): string {
  const rows = outputs.map(({ source: _source, ...pin }) => pin);
  return `/** Generated by generate-footprint-forward-native-graph.ts. */\n/* oxlint-disable unicorn/numeric-separators-style -- Generated numeric pins use canonical JSON serialization for reproducible output. */\nexport const CURRENT_FOOTPRINT_FORWARD_NATIVE_GRAPH = Object.freeze({\n  schema: "private.footprint-forward-native-graph.v2", legacySha256: "${FORWARD_NATIVE_LEGACY.sha256}",\n  aggregateBytes: ${String(outputs.reduce((total, row) => total + row.bytes, 0))},\n  files: Object.freeze(${JSON.stringify(rows, null, 2)}.map(value => Object.freeze(value))),\n});\n`;
}

/** Independent fixed Windows entrypoint pins every source role before compiling
 * captured bytes. It launches no application and accepts no payload arguments. */
export function currentFootprintForwardNativeSmoke(outputs: readonly ForwardNativeOutput[]): string {
  const specs = outputs.map(output => `  @{role='${output.role}';path='${output.relativePath}';bytes=${String(output.bytes)};maximum=${String(output.maximumBytes)};sha256='${output.sha256}'}`).join(",\n");
  return `param()
$ErrorActionPreference='Stop'
Set-StrictMode -Version Latest
[Console]::OutputEncoding=New-Object Text.UTF8Encoding($false)
if ($args.Count -ne 0 -or [Environment]::OSVersion.Platform -ne [PlatformID]::Win32NT -or [IntPtr]::Size -ne 8 -or $PSVersionTable.PSVersion.Major -ne 5 -or $PSVersionTable.PSVersion.Minor -ne 1) {throw 'forward-graph-smoke-platform'}
$specs=@(
${specs}
)
$files=New-Object 'System.Collections.Generic.List[System.IO.FileStream]'
$buffers=New-Object 'System.Collections.Generic.List[byte[]]'
$ascii=[Text.Encoding]::GetEncoding(20127,[Text.EncoderFallback]::ExceptionFallback,[Text.DecoderFallback]::ExceptionFallback)
try {
  $aggregate=0
  foreach ($spec in $specs) {
    $file=[IO.File]::Open((Join-Path (Split-Path -Parent $PSScriptRoot) $spec.path),[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::Read)
    $files.Add($file)
    if ($file.Length -ne $spec.bytes -or $file.Length -gt $spec.maximum -or $file.Length -gt ${String(LIMITS.file)}) {throw 'forward-graph-smoke-size'}
    $bytes=New-Object byte[] ([int]$file.Length);$offset=0
    while ($offset -lt $bytes.Length) {$count=$file.Read($bytes,$offset,$bytes.Length-$offset);if ($count -le 0) {throw 'forward-graph-smoke-eof'};$offset+=$count}
    if ($file.ReadByte() -ne -1) {throw 'forward-graph-smoke-eof'}
    [void]$ascii.GetString($bytes)
    $hasher=[Security.Cryptography.SHA256]::Create()
    try {$digest=([BitConverter]::ToString($hasher.ComputeHash($bytes))).Replace('-','').ToLowerInvariant()} finally {$hasher.Dispose()}
    if ($digest -cne $spec.sha256) {throw 'forward-graph-smoke-hash'}
    $buffers.Add($bytes);$aggregate+=$bytes.Length
  }
  if ($aggregate -ne ${String(outputs.reduce((sum, output) => sum + output.bytes, 0))} -or $aggregate -gt ${String(LIMITS.aggregate)}) {throw 'forward-graph-smoke-aggregate'}
  $forwardExecutionCoreBytes=$buffers[1];$forwardExecutionPhaseBytes=$buffers[2]
  $decoder=New-Object Text.UTF8Encoding($false,$true)
  $output=& ([ScriptBlock]::Create($decoder.GetString($buffers[0]))) -CompileOnly -WorkerStartupFootprintForwardExecution209
  if (@($output).Count -ne 1 -or $output -isnot [string] -or $output.Length -gt 4096) {throw 'forward-graph-smoke-output'}
  $result=$output | ConvertFrom-Json
  if ((@($result.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'compiled,emptyJob,executionAuthorized,pipesChecked,processLaunched,schema' -or $result.schema -cne 'easyeda-pro-control.footprint-forward-execution-compile.v2' -or $result.compiled -cne $true -or $result.emptyJob -cne $true -or $result.pipesChecked -cne $true -or $result.processLaunched -cne $false -or $result.executionAuthorized -cne $false) {throw 'forward-graph-smoke-result'}
  $output
} finally {foreach ($file in $files) {$file.Dispose()}}
`;
}
