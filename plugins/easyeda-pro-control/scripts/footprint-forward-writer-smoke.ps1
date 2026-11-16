param()
$ErrorActionPreference='Stop'
Set-StrictMode -Version Latest
[Console]::OutputEncoding=New-Object Text.UTF8Encoding($false)
if ($args.Count -ne 0 -or [Environment]::OSVersion.Platform -ne [PlatformID]::Win32NT -or [IntPtr]::Size -ne 8 -or $PSVersionTable.PSVersion.Major -ne 5 -or $PSVersionTable.PSVersion.Minor -ne 1) {throw 'forward-writer-smoke-platform'}
$specs=@(
  @{role='driver';path='scripts/footprint-forward-writer/owner.ps1';bytes=87296;maximum=131072;sha256='3bdfb495c259aecf1e4d219c895a7a46742e6ff0f55fcdc89d4a08c4387069f7'},
  @{role='core';path='scripts/footprint-forward-writer/native-core.cs';bytes=960342;maximum=1048576;sha256='189e22cb389af886536afd9bc38c6f29fd7b33097aed64e16afd2f76784db345'},
  @{role='phase';path='scripts/footprint-forward-writer/native-phase.cs';bytes=62615;maximum=65536;sha256='1a3bf624f2182ef57f8e94ce586a048c5653ab3f6f7c8287a451a92f63af3a8b'},
  @{role='producer';path='scripts/footprint-forward-writer/native-producer.cs';bytes=61882;maximum=65536;sha256='981f08eb263acf0f6e97b24b90db5fd456a1815eef43b6e4ed8c0a9893e9ba0c'},
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
  if ($aggregate -ne 1359166 -or $aggregate -gt 1376256) {throw 'forward-writer-smoke-aggregate'}
  $forwardWriterCoreBytes=$buffers[1];$forwardWriterPhaseBytes=$buffers[2]
  $forwardWriterProducerBytes=$buffers[3];$forwardWriterStartupBytes=$buffers[4];$forwardWriterSyncBytes=$buffers[5]
  $decoder=New-Object Text.UTF8Encoding($false,$true)
  $output=& ([ScriptBlock]::Create($decoder.GetString($buffers[0]))) -CompileOnly -WorkerStartupFootprintForwardWriter209
  if (@($output).Count -ne 1 -or $output -isnot [string] -or $output.Length -gt 4096) {throw 'forward-writer-smoke-output'}
  $result=$output | ConvertFrom-Json
  if ((@($result.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'compiled,emptyJob,executionAuthorized,pipesChecked,processLaunched,schema' -or $result.schema -cne 'easyeda-pro-control.footprint-forward-writer-compile.v1' -or $result.compiled -cne $true -or $result.emptyJob -cne $true -or $result.pipesChecked -cne $true -or $result.processLaunched -cne $false -or $result.executionAuthorized -cne $false) {throw 'forward-writer-smoke-result'}
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
      $largeOpening=$request.action -ceq 'worker-startup-parent' -and $request.method -ceq 'Runtime.callFunctionOn' -and @('preflight','open-project','pcb-preflight','pcb-open-document','pcb-observe') -ccontains $request.parentPhase
      $largeMainRequest=$WorkerStartupFootprintForwardWriter209 -and @('main-request-send','main-completion-send') -ccontains $request.action
      $largeClockRpcRequest=$WorkerStartupFootprintCombined209 -and @('footprint-clock-rpc-send','footprint-copy-native-create') -ccontains $request.action
      if ([Text.Encoding]::UTF8.GetByteCount($line.ToString()) -gt 32768 -or
          (-not $largeForwardBody -and -not $largeV2Request -and -not $largeMainRequest -and -not $largeClockRpcRequest -and -not $largeOpening -and ($request.action -cne 'send' -or $request.method -cne 'Runtime.callFunctionOn') -and $line.Length -gt 4096)) {throw 'pcb-diagnostic-request-size'}

'@)
$actions=@('footprint-forward-initial-cache-send','footprint-forward-initial-sync-send')
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
