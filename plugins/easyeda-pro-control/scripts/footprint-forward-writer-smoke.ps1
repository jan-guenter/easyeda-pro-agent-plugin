param()
$ErrorActionPreference='Stop'
Set-StrictMode -Version Latest
[Console]::OutputEncoding=New-Object Text.UTF8Encoding($false)
if ($args.Count -ne 0 -or [Environment]::OSVersion.Platform -ne [PlatformID]::Win32NT -or [IntPtr]::Size -ne 8 -or $PSVersionTable.PSVersion.Major -ne 5 -or $PSVersionTable.PSVersion.Minor -ne 1) {throw 'forward-writer-smoke-platform'}
$specs=@(
  @{role='driver';path='scripts/footprint-forward-writer/owner.ps1';bytes=86928;maximum=131072;sha256='bf399a19d10337e7158881b80c2e5af4d5f8468da5b3328f9d623ba0e4b002c8'},
  @{role='core';path='scripts/footprint-forward-writer/native-core.cs';bytes=947288;maximum=1048576;sha256='f5d25877ae9b7c5200f39318abe6d418ef3134328f9e5b8c646ba0704f8d4e3d'},
  @{role='phase';path='scripts/footprint-forward-writer/native-phase.cs';bytes=62615;maximum=65536;sha256='1a3bf624f2182ef57f8e94ce586a048c5653ab3f6f7c8287a451a92f63af3a8b'},
  @{role='producer';path='scripts/footprint-forward-writer/native-producer.cs';bytes=60879;maximum=65536;sha256='9a9131bccc9f0cec5aa489cc76c0e2e30a4580da1e29f1a6a59626792f25e81b'},
  @{role='startup';path='scripts/footprint-forward-writer/native-startup.cs';bytes=128498;maximum=131072;sha256='3f1f7acdbd548e32b9f4a969c7cef477fdff36079f69308fd3405cf0149a1087'},
  @{role='sync';path='scripts/footprint-forward-writer/native-sync.cs';bytes=58533;maximum=65536;sha256='258c7ffffe3478e8bf42c43b8108f00ba9a66107b48e68d2c5118750d505bc12'}
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
  if ($aggregate -ne 1344741 -or $aggregate -gt 1376256) {throw 'forward-writer-smoke-aggregate'}
  $forwardWriterCoreBytes=$buffers[1];$forwardWriterPhaseBytes=$buffers[2]
  $forwardWriterProducerBytes=$buffers[3];$forwardWriterStartupBytes=$buffers[4];$forwardWriterSyncBytes=$buffers[5]
  $decoder=New-Object Text.UTF8Encoding($false,$true)
  $output=& ([ScriptBlock]::Create($decoder.GetString($buffers[0]))) -CompileOnly -WorkerStartupFootprintForwardWriter209
  if (@($output).Count -ne 1 -or $output -isnot [string] -or $output.Length -gt 4096) {throw 'forward-writer-smoke-output'}
  $result=$output | ConvertFrom-Json
  if ((@($result.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'compiled,emptyJob,executionAuthorized,pipesChecked,processLaunched,schema' -or $result.schema -cne 'easyeda-pro-control.footprint-forward-writer-compile.v1' -or $result.compiled -cne $true -or $result.emptyJob -cne $true -or $result.pipesChecked -cne $true -or $result.processLaunched -cne $false -or $result.executionAuthorized -cne $false) {throw 'forward-writer-smoke-result'}
  $output
} finally {foreach ($file in $files) {$file.Dispose()}}
