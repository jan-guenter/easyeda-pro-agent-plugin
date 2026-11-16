param()
$ErrorActionPreference='Stop'
Set-StrictMode -Version Latest
[Console]::OutputEncoding=New-Object Text.UTF8Encoding($false)
if ($args.Count -ne 0 -or [Environment]::OSVersion.Platform -ne [PlatformID]::Win32NT -or [IntPtr]::Size -ne 8 -or $PSVersionTable.PSVersion.Major -ne 5 -or $PSVersionTable.PSVersion.Minor -ne 1) {throw 'forward-writer-smoke-platform'}
$specs=@(
  @{role='driver';path='scripts/footprint-forward-writer-complete/owner.ps1';bytes=106065;maximum=131072;sha256='596802cc8e31f7ceec29791094928f0bf300dcf7702dedbb6aaf917bf1126f6f'},
  @{role='core';path='scripts/footprint-forward-writer-complete/native-core.cs';bytes=1008236;maximum=1048576;sha256='b66c3859e5ae77fd2093d32021efb5a9083da23d60e3b4a34eb8dc919d5a95b5'},
  @{role='phase';path='scripts/footprint-forward-writer-complete/native-phase.cs';bytes=63435;maximum=65536;sha256='14c4474f4ef1cef4ed92b62af14e44a468579098f4ff6879d43cbbfeafd40def'},
  @{role='producer';path='scripts/footprint-forward-writer-complete/native-producer.cs';bytes=61898;maximum=65536;sha256='ddacf516e2faa1eea21ce7492998ad3516a418279ef3b016a0a93a4fb9a6657e'},
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
  if ($aggregate -ne 1551093 -or $aggregate -gt 1572864) {throw 'forward-writer-smoke-aggregate'}
  $forwardWriterCoreBytes=$buffers[1];$forwardWriterPhaseBytes=$buffers[2]
  $forwardWriterProducerBytes=$buffers[3];$forwardWriterStartupBytes=$buffers[4];$forwardWriterSyncBytes=$buffers[5];$forwardWriterTailBytes=$buffers[6]
  $decoder=New-Object Text.UTF8Encoding($false,$true)
  $output=& ([ScriptBlock]::Create($decoder.GetString($buffers[0]))) -CompileOnly -WorkerStartupFootprintForwardWriterComplete209
  if (@($output).Count -ne 1 -or $output -isnot [string] -or $output.Length -gt 4096) {throw 'forward-writer-smoke-output'}
  $result=$output | ConvertFrom-Json
  if ((@($result.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'compiled,emptyJob,executionAuthorized,pipesChecked,processLaunched,schema' -or $result.schema -cne 'easyeda-pro-control.footprint-forward-writer-complete-compile.v2' -or $result.compiled -cne $true -or $result.emptyJob -cne $true -or $result.pipesChecked -cne $true -or $result.processLaunched -cne $false -or $result.executionAuthorized -cne $false) {throw 'forward-writer-smoke-result'}
  foreach($operation in @('timer-complete','queue-open','complete')){
            $role=[System.Management.Automation.Language.NullString]::Value
  $strings=New-Object 'System.Collections.Generic.List[string]'
  $strings.Add($role)
  if($null -cne $strings[0]){throw 'forward-frontier-null-string-binding'}
}
$requestGuard=[ScriptBlock]::Create(@'
param($line)
$WorkerStartupFootprintForwardWriter209=$true
$WorkerStartupFootprintForwardWriterComplete209=$true
$WorkerStartupFootprintCombined209=$false
      $request=$line.ToString() | ConvertFrom-Json
      $largeV2Request=@('footprint-copy-clock-registration-v2','footprint-clock-rpc-v2-send','footprint-forward-cold-send') -ccontains $request.action
      $largeForwardBody=(@('footprint-forward-initial-cache-send','footprint-forward-initial-sync-send') -ccontains $request.action) -and (@($request.PSObject.Properties.Name) -ccontains 'body') -and $request.body -is [string]
      $largeForwardBody=$largeForwardBody -or ((@($request.PSObject.Properties.Name) -ccontains 'body') -and $request.body -is [string] -and ($request.action -ceq 'footprint-forward-copy-local' -or ($request.action -ceq 'footprint-forward-copy-tail-control' -and $request.operation -ceq 'precreate-body')))
      $largeOpening=$request.action -ceq 'worker-startup-parent' -and $request.method -ceq 'Runtime.callFunctionOn' -and @('preflight','open-project','pcb-preflight','pcb-open-document','pcb-observe') -ccontains $request.parentPhase
      $largeMainRequest=$WorkerStartupFootprintForwardWriterComplete209 -and @('main-request-send','main-completion-send') -ccontains $request.action
      $largeClockRpcRequest=$WorkerStartupFootprintCombined209 -and @('footprint-clock-rpc-send','footprint-copy-native-create') -ccontains $request.action
      if ([Text.Encoding]::UTF8.GetByteCount($line.ToString()) -gt 32768 -or
          (-not $largeForwardBody -and -not $largeV2Request -and -not $largeMainRequest -and -not $largeClockRpcRequest -and -not $largeOpening -and ($request.action -cne 'send' -or $request.method -cne 'Runtime.callFunctionOn') -and $line.Length -gt 4096)) {throw 'pcb-diagnostic-request-size'}

'@)
$actions=@('footprint-forward-initial-cache-send','footprint-forward-initial-sync-send','footprint-forward-copy-local','footprint-forward-copy-tail-control')
foreach($action in $actions){
  foreach($body in @(('a'*5000),(('"'+'\')*2500))){
    $line=@{action=$action;operation='precreate-body';body=$body;method='Runtime.callFunctionOn';id=('a'*32)} | ConvertTo-Json -Compress
    if($line.Length -le 4096 -or [Text.Encoding]::UTF8.GetByteCount($line) -gt 32768){throw 'forward-envelope-smoke-fixture'}
    & $requestGuard $line
  }
}
$refused=$false
try {& $requestGuard (@{action='identity';body=('a'*5000);method='Runtime.callFunctionOn'} | ConvertTo-Json -Compress)} catch {$refused=$true}
if(-not $refused){throw 'forward-envelope-smoke-unrelated-limit'}
$refused=$false
try {& $requestGuard (@{action='footprint-forward-initial-cache-send';body=('a'*32768);method='Runtime.callFunctionOn'} | ConvertTo-Json -Compress)} catch {$refused=$true}
if(-not $refused){throw 'forward-envelope-smoke-total-limit'}

  $output
} finally {foreach ($file in $files) {$file.Dispose()}}
