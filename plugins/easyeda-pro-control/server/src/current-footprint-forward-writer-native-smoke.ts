/** Build-only companion for the six-role graph. This is not a runtime role
 * and cannot add a native action or admit an application generation. */
import { CURRENT_FOOTPRINT_FORWARD_WRITER_NATIVE_GRAPH_LIMITS as LIMITS } from "./current-footprint-forward-writer-native-limits.ts";
import type { CurrentFootprintForwardWriterNativeOutput } from "./current-footprint-forward-writer-native-source.ts";

/** Hold and check all six exact source files before compiling captured bytes. */
export function currentFootprintForwardWriterNativeSmoke(outputs: readonly CurrentFootprintForwardWriterNativeOutput[]): string {
  if (outputs.map(output => output.role).join(",") !== "driver,core,phase,producer,startup,sync") { throw new Error("FORWARD_WRITER_SMOKE_ROLE_ORDER"); }
  const specs = outputs.map(output => `  @{role='${output.role}';path='${output.relativePath}';bytes=${String(output.bytes)};maximum=${String(output.maximumBytes)};sha256='${output.sha256}'}`).join(",\n");
  return `param()
$ErrorActionPreference='Stop'
Set-StrictMode -Version Latest
[Console]::OutputEncoding=New-Object Text.UTF8Encoding($false)
if ($args.Count -ne 0 -or [Environment]::OSVersion.Platform -ne [PlatformID]::Win32NT -or [IntPtr]::Size -ne 8 -or $PSVersionTable.PSVersion.Major -ne 5 -or $PSVersionTable.PSVersion.Minor -ne 1) {throw 'forward-writer-smoke-platform'}
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
    if ($file.Length -ne $spec.bytes -or $file.Length -gt $spec.maximum -or $file.Length -gt ${String(LIMITS.file)}) {throw 'forward-writer-smoke-size'}
    $bytes=New-Object byte[] ([int]$file.Length);$offset=0
    while ($offset -lt $bytes.Length) {$count=$file.Read($bytes,$offset,$bytes.Length-$offset);if ($count -le 0) {throw 'forward-writer-smoke-eof'};$offset+=$count}
    if ($file.ReadByte() -ne -1) {throw 'forward-writer-smoke-eof'}
    [void]$ascii.GetString($bytes)
    $hasher=[Security.Cryptography.SHA256]::Create()
    try {$digest=([BitConverter]::ToString($hasher.ComputeHash($bytes))).Replace('-','').ToLowerInvariant()} finally {$hasher.Dispose()}
    if ($digest -cne $spec.sha256) {throw 'forward-writer-smoke-hash'}
    $buffers.Add($bytes);$aggregate+=$bytes.Length
  }
  if ($aggregate -ne ${String(outputs.reduce((sum, output) => sum + output.bytes, 0))} -or $aggregate -gt ${String(LIMITS.aggregate)}) {throw 'forward-writer-smoke-aggregate'}
  $forwardWriterCoreBytes=$buffers[1];$forwardWriterPhaseBytes=$buffers[2]
  $forwardWriterProducerBytes=$buffers[3];$forwardWriterStartupBytes=$buffers[4];$forwardWriterSyncBytes=$buffers[5]
  $decoder=New-Object Text.UTF8Encoding($false,$true)
  $output=& ([ScriptBlock]::Create($decoder.GetString($buffers[0]))) -CompileOnly -WorkerStartupFootprintForwardWriter209
  if (@($output).Count -ne 1 -or $output -isnot [string] -or $output.Length -gt 4096) {throw 'forward-writer-smoke-output'}
  $result=$output | ConvertFrom-Json
  if ((@($result.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'compiled,emptyJob,executionAuthorized,pipesChecked,processLaunched,schema' -or $result.schema -cne 'easyeda-pro-control.footprint-forward-writer-compile.v1' -or $result.compiled -cne $true -or $result.emptyJob -cne $true -or $result.pipesChecked -cne $true -or $result.processLaunched -cne $false -or $result.executionAuthorized -cne $false) {throw 'forward-writer-smoke-result'}
  $output
} finally {foreach ($file in $files) {$file.Dispose()}}
`;
}
