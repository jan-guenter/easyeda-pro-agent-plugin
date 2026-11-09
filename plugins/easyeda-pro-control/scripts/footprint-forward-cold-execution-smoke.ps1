param()
$ErrorActionPreference='Stop'
Set-StrictMode -Version Latest
[Console]::OutputEncoding=New-Object Text.UTF8Encoding($false)
if ($args.Count -ne 0 -or [Environment]::OSVersion.Platform -ne [PlatformID]::Win32NT -or [IntPtr]::Size -ne 8 -or $PSVersionTable.PSVersion.Major -ne 5 -or $PSVersionTable.PSVersion.Minor -ne 1) {throw 'forward-graph-smoke-platform'}
$specs=@(
  @{role='driver';path='scripts/footprint-forward-cold-execution/owner.ps1';bytes=95539;maximum=131072;sha256='ccde3fdb3bbd02ec1b2b42e605c1f3e14928be06b2d73d7bd55fe58c02c5c220'},
  @{role='core';path='scripts/footprint-forward-cold-execution/native-core.cs';bytes=945442;maximum=1048576;sha256='23073a94f6bcdf5c6ef8853736fb90e411e7f393e48c65e7f2d0e6bad8b04251'},
  @{role='phase';path='scripts/footprint-forward-cold-execution/native-phase.cs';bytes=44348;maximum=65536;sha256='04610bbaea510a1c2a40efd266efa3e8ef03ed8206d23e7cb772bd636b45784b'}
)
$files=New-Object 'System.Collections.Generic.List[System.IO.FileStream]'
$buffers=New-Object 'System.Collections.Generic.List[byte[]]'
$ascii=[Text.Encoding]::GetEncoding(20127,[Text.EncoderFallback]::ExceptionFallback,[Text.DecoderFallback]::ExceptionFallback)
try {
  $aggregate=0
  foreach ($spec in $specs) {
    $file=[IO.File]::Open((Join-Path (Split-Path -Parent $PSScriptRoot) $spec.path),[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::Read)
    $files.Add($file)
    if ($file.Length -ne $spec.bytes -or $file.Length -gt $spec.maximum -or $file.Length -gt 1048576) {throw 'forward-graph-smoke-size'}
    $bytes=New-Object byte[] ([int]$file.Length);$offset=0
    while ($offset -lt $bytes.Length) {$count=$file.Read($bytes,$offset,$bytes.Length-$offset);if ($count -le 0) {throw 'forward-graph-smoke-eof'};$offset+=$count}
    if ($file.ReadByte() -ne -1) {throw 'forward-graph-smoke-eof'}
    [void]$ascii.GetString($bytes)
    $hasher=[Security.Cryptography.SHA256]::Create()
    try {$digest=([BitConverter]::ToString($hasher.ComputeHash($bytes))).Replace('-','').ToLowerInvariant()} finally {$hasher.Dispose()}
    if ($digest -cne $spec.sha256) {throw 'forward-graph-smoke-hash'}
    $buffers.Add($bytes);$aggregate+=$bytes.Length
  }
  if ($aggregate -ne 1085329 -or $aggregate -gt 1114112) {throw 'forward-graph-smoke-aggregate'}
  $forwardExecutionCoreBytes=$buffers[1];$forwardExecutionPhaseBytes=$buffers[2]
  $decoder=New-Object Text.UTF8Encoding($false,$true)
  $output=& ([ScriptBlock]::Create($decoder.GetString($buffers[0]))) -CompileOnly -WorkerStartupFootprintForwardExecution209
  if (@($output).Count -ne 1 -or $output -isnot [string] -or $output.Length -gt 4096) {throw 'forward-graph-smoke-output'}
  $result=$output | ConvertFrom-Json
  if ((@($result.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'compiled,emptyJob,executionAuthorized,pipesChecked,processLaunched,schema' -or $result.schema -cne 'easyeda-pro-control.footprint-forward-cold-execution-compile.v1' -or $result.compiled -cne $true -or $result.emptyJob -cne $true -or $result.pipesChecked -cne $true -or $result.processLaunched -cne $false -or $result.executionAuthorized -cne $false) {throw 'forward-graph-smoke-result'}
  $output
} finally {foreach ($file in $files) {$file.Dispose()}}
