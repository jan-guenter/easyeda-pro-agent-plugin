param()
$ErrorActionPreference='Stop'
Set-StrictMode -Version Latest
[Console]::OutputEncoding=New-Object Text.UTF8Encoding($false)
if ($args.Count -ne 0 -or [Environment]::OSVersion.Platform -ne [PlatformID]::Win32NT -or [IntPtr]::Size -ne 8 -or $PSVersionTable.PSVersion.Major -ne 5 -or $PSVersionTable.PSVersion.Minor -ne 1) {throw 'forward-writer-smoke-platform'}
$specs=@(
  @{role='driver';path='scripts/footprint-forward-writer-complete/owner.ps1';bytes=105389;maximum=131072;sha256='3c630fd2893112f8e2347f4712e18d3cd7e0a61107c0dc113b41afd75856a6bb'},
  @{role='core';path='scripts/footprint-forward-writer-complete/native-core.cs';bytes=994817;maximum=1048576;sha256='842dd9e77311009f3c0c1fc8f2f0fd3bc97dc7ab982f6ec3017d92ed74f18a44'},
  @{role='phase';path='scripts/footprint-forward-writer-complete/native-phase.cs';bytes=63435;maximum=65536;sha256='14c4474f4ef1cef4ed92b62af14e44a468579098f4ff6879d43cbbfeafd40def'},
  @{role='producer';path='scripts/footprint-forward-writer-complete/native-producer.cs';bytes=60895;maximum=65536;sha256='5372f5585449c42e431724cdafaa2257674209812204c514715e810d4c0bc78b'},
  @{role='startup';path='scripts/footprint-forward-writer-complete/native-startup.cs';bytes=128506;maximum=131072;sha256='250d49cda01de2ed2be5efdfcc86c2d84e1bc7ab187b5bb589cb4e6c0aca737a'},
  @{role='sync';path='scripts/footprint-forward-writer-complete/native-sync.cs';bytes=58622;maximum=65536;sha256='804fd9228923f8c2a3277930a467c8e7b3bb1b4fcd46cfcaaeb0e384d591b71c'},
  @{role='tail';path='scripts/footprint-forward-writer-complete/native-tail.cs';bytes=124331;maximum=131072;sha256='ee754845a39519ee6a05652289fb3f9f404d9ecdad6251e10298cb796d2bc077'}
)
$files=New-Object 'System.Collections.Generic.List[System.IO.FileStream]'
$buffers=New-Object 'System.Collections.Generic.List[byte[]]'
$ascii=[Text.Encoding]::GetEncoding(20127,[Text.EncoderFallback]::ExceptionFallback,[Text.DecoderFallback]::ExceptionFallback)
try {
  $aggregate=0
  foreach ($spec in $specs) {
    $file=[IO.File]::Open((Join-Path (Split-Path -Parent $PSScriptRoot) $spec.path),[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::Read)
    $files.Add($file)
    if ($file.Length -ne $spec.bytes -or $file.Length -gt $spec.maximum -or $file.Length -gt 1048576) {throw 'forward-writer-smoke-size'}
    $bytes=New-Object byte[] ([int]$file.Length);$offset=0
    while ($offset -lt $bytes.Length) {$count=$file.Read($bytes,$offset,$bytes.Length-$offset);if ($count -le 0) {throw 'forward-writer-smoke-eof'};$offset+=$count}
    if ($file.ReadByte() -ne -1) {throw 'forward-writer-smoke-eof'}
    [void]$ascii.GetString($bytes)
    $hasher=[Security.Cryptography.SHA256]::Create()
    try {$digest=([BitConverter]::ToString($hasher.ComputeHash($bytes))).Replace('-','').ToLowerInvariant()} finally {$hasher.Dispose()}
    if ($digest -cne $spec.sha256) {throw 'forward-writer-smoke-hash'}
    $buffers.Add($bytes);$aggregate+=$bytes.Length
  }
  if ($aggregate -ne 1535995 -or $aggregate -gt 1572864) {throw 'forward-writer-smoke-aggregate'}
  $forwardWriterCoreBytes=$buffers[1];$forwardWriterPhaseBytes=$buffers[2]
  $forwardWriterProducerBytes=$buffers[3];$forwardWriterStartupBytes=$buffers[4];$forwardWriterSyncBytes=$buffers[5];$forwardWriterTailBytes=$buffers[6]
  $decoder=New-Object Text.UTF8Encoding($false,$true)
  $output=& ([ScriptBlock]::Create($decoder.GetString($buffers[0]))) -CompileOnly -WorkerStartupFootprintForwardWriterComplete209
  if (@($output).Count -ne 1 -or $output -isnot [string] -or $output.Length -gt 4096) {throw 'forward-writer-smoke-output'}
  $result=$output | ConvertFrom-Json
  if ((@($result.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'compiled,emptyJob,executionAuthorized,pipesChecked,processLaunched,schema' -or $result.schema -cne 'easyeda-pro-control.footprint-forward-writer-complete-compile.v2' -or $result.compiled -cne $true -or $result.emptyJob -cne $true -or $result.pipesChecked -cne $true -or $result.processLaunched -cne $false -or $result.executionAuthorized -cne $false) {throw 'forward-writer-smoke-result'}
  $output
} finally {foreach ($file in $files) {$file.Dispose()}}
