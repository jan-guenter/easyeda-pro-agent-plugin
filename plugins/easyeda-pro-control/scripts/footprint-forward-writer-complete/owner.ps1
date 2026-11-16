param([switch]$CompileOnly,[switch]$WorkerStartupFootprintForwardWriterComplete209,[string]$CombinedReadyChallenge)
if (-not $WorkerStartupFootprintForwardWriterComplete209) {throw 'forward-graph-purpose-required'}
$StringPrecreate=[System.Management.Automation.SwitchParameter]$false
$WorkerStartup=[System.Management.Automation.SwitchParameter]$false
$Layers209=[System.Management.Automation.SwitchParameter]$false
$Visual209=[System.Management.Automation.SwitchParameter]$false
$WorkerStartup209=[System.Management.Automation.SwitchParameter]$false
$WorkerStartupEmpty209=[System.Management.Automation.SwitchParameter]$false
$WorkerStartupRatline209=[System.Management.Automation.SwitchParameter]$false
$WorkerStartupRatlineContinuation209=[System.Management.Automation.SwitchParameter]$false
$WorkerStartupFootprint209=[System.Management.Automation.SwitchParameter]$false
$WorkerStartupFootprintCopy209=[System.Management.Automation.SwitchParameter]$false
$WorkerStartupFootprintSaved209=[System.Management.Automation.SwitchParameter]$false
$WorkerStartupFootprintHeldSaved209=[System.Management.Automation.SwitchParameter]$false
$FootprintHeldCache209=[System.Management.Automation.SwitchParameter]$false
$FootprintHeadAge209=[System.Management.Automation.SwitchParameter]$false
$WorkerStartupFootprintMain209=[System.Management.Automation.SwitchParameter]$false
$WorkerStartupFootprintCombined209=[System.Management.Automation.SwitchParameter]$false
$WorkerStartupFootprintForward209=[System.Management.Automation.SwitchParameter]$false
$ErrorActionPreference = 'Stop'
if ($WorkerStartupFootprintForwardWriterComplete209 -and @($PSBoundParameters.Keys | Where-Object {$_ -cnotin @('CompileOnly','WorkerStartupFootprintForwardWriterComplete209','CombinedReadyChallenge')}).Count -ne 0) {throw 'pcb-diagnostic-conflicting-forward-execution-purpose'}
$forwardFamily=$WorkerStartupFootprintForward209 -or $WorkerStartupFootprintForwardWriterComplete209
$allocatedPurpose=$WorkerStartupFootprintCombined209 -or $WorkerStartupFootprintForwardWriterComplete209
if ($FootprintHeadAge209 -and ($StringPrecreate -or $WorkerStartup -or $Layers209 -or $Visual209 -or $WorkerStartup209 -or $WorkerStartupEmpty209 -or $WorkerStartupRatline209 -or $WorkerStartupRatlineContinuation209 -or $WorkerStartupFootprint209 -or $WorkerStartupFootprintCopy209 -or $WorkerStartupFootprintSaved209 -or $WorkerStartupFootprintHeldSaved209 -or $FootprintHeldCache209 -or $WorkerStartupFootprintMain209 -or $WorkerStartupFootprintCombined209 -or $WorkerStartupFootprintForward209)) {throw 'pcb-diagnostic-conflicting-head-age-purpose'}
if (((($WorkerStartupFootprintHeldSaved209 -or $FootprintHeldCache209) -and ($StringPrecreate -or $WorkerStartup -or $Layers209 -or $Visual209 -or $WorkerStartup209 -or $WorkerStartupEmpty209 -or $WorkerStartupRatline209 -or $WorkerStartupRatlineContinuation209 -or $WorkerStartupFootprint209 -or $WorkerStartupFootprintCopy209 -or $WorkerStartupFootprintSaved209 -or $WorkerStartupFootprintMain209 -or $WorkerStartupFootprintCombined209 -or $WorkerStartupFootprintForward209)) -or ($WorkerStartupFootprintHeldSaved209 -and $FootprintHeldCache209))) {throw 'pcb-diagnostic-conflicting-purpose'}
$heldNativePurpose=$WorkerStartupFootprintHeldSaved209 -or $FootprintHeldCache209
if ($Visual209 -and ($Layers209 -or $StringPrecreate -or $WorkerStartup -or $WorkerStartup209 -or $WorkerStartupEmpty209 -or $WorkerStartupRatline209 -or $WorkerStartupRatlineContinuation209 -or $WorkerStartupFootprint209 -or $WorkerStartupFootprintCopy209 -or $WorkerStartupFootprintSaved209 -or $WorkerStartupFootprintMain209 -or $WorkerStartupFootprintCombined209 -or $WorkerStartupFootprintForward209)) {throw 'pcb-diagnostic-conflicting-visual-purpose'}
if ($Visual209) {$Layers209=$true}
if ((($WorkerStartupFootprintCombined209 -or $forwardFamily) -and -not $CompileOnly -and $CombinedReadyChallenge -cnotmatch '\A[a-f0-9]{32}\z') -or (-not ($WorkerStartupFootprintCombined209 -or $forwardFamily) -and -not [string]::IsNullOrEmpty($CombinedReadyChallenge))) {throw 'pcb-diagnostic-combined-ready-challenge'}
if (($StringPrecreate -and $WorkerStartup) -or ($Layers209 -and ($StringPrecreate -or $WorkerStartup))) {throw 'pcb-diagnostic-conflicting-purpose'}
if ($WorkerStartup209 -and ($StringPrecreate -or $WorkerStartup -or $Layers209)) {throw 'pcb-diagnostic-conflicting-purpose'}
if ($WorkerStartupEmpty209 -and ($StringPrecreate -or $WorkerStartup -or $Layers209 -or $WorkerStartup209)) {throw 'pcb-diagnostic-conflicting-purpose'}
if ($WorkerStartupRatline209 -and ($StringPrecreate -or $WorkerStartup -or $Layers209 -or $WorkerStartup209 -or $WorkerStartupEmpty209)) {throw 'pcb-diagnostic-conflicting-purpose'}
if ($WorkerStartupRatlineContinuation209 -and ($StringPrecreate -or $WorkerStartup -or $Layers209 -or $WorkerStartup209 -or $WorkerStartupEmpty209 -or $WorkerStartupRatline209)) {throw 'pcb-diagnostic-conflicting-purpose'}
if ($WorkerStartupFootprint209 -and ($StringPrecreate -or $WorkerStartup -or $Layers209 -or $WorkerStartup209 -or $WorkerStartupEmpty209 -or $WorkerStartupRatline209 -or $WorkerStartupRatlineContinuation209)) {throw 'pcb-diagnostic-conflicting-purpose'}
if ($WorkerStartupFootprintCopy209 -and ($StringPrecreate -or $WorkerStartup -or $Layers209 -or $WorkerStartup209 -or $WorkerStartupEmpty209 -or $WorkerStartupRatline209 -or $WorkerStartupRatlineContinuation209 -or $WorkerStartupFootprint209)) {throw 'pcb-diagnostic-conflicting-purpose'}
if ($WorkerStartupFootprintSaved209 -and ($StringPrecreate -or $WorkerStartup -or $Layers209 -or $WorkerStartup209 -or $WorkerStartupEmpty209 -or $WorkerStartupRatline209 -or $WorkerStartupRatlineContinuation209 -or $WorkerStartupFootprint209 -or $WorkerStartupFootprintCopy209)) {throw 'pcb-diagnostic-conflicting-purpose'}
if ($WorkerStartupFootprintMain209 -and ($StringPrecreate -or $WorkerStartup -or $Layers209 -or $WorkerStartup209 -or $WorkerStartupEmpty209 -or $WorkerStartupRatline209 -or $WorkerStartupRatlineContinuation209 -or $WorkerStartupFootprint209 -or $WorkerStartupFootprintCopy209 -or $WorkerStartupFootprintSaved209)) {throw 'pcb-diagnostic-conflicting-purpose'}
if ($WorkerStartupFootprintCombined209 -and ($StringPrecreate -or $WorkerStartup -or $Layers209 -or $WorkerStartup209 -or $WorkerStartupEmpty209 -or $WorkerStartupRatline209 -or $WorkerStartupRatlineContinuation209 -or $WorkerStartupFootprint209 -or $WorkerStartupFootprintCopy209 -or $WorkerStartupFootprintSaved209 -or $WorkerStartupFootprintMain209)) {throw 'pcb-diagnostic-conflicting-purpose'}
if ($WorkerStartupFootprintForward209 -and ($StringPrecreate -or $WorkerStartup -or $Layers209 -or $WorkerStartup209 -or $WorkerStartupEmpty209 -or $WorkerStartupRatline209 -or $WorkerStartupRatlineContinuation209 -or $WorkerStartupFootprint209 -or $WorkerStartupFootprintCopy209 -or $WorkerStartupFootprintSaved209 -or $WorkerStartupFootprintMain209 -or $WorkerStartupFootprintCombined209)) {throw 'pcb-diagnostic-conflicting-purpose'}
$footprintMainPurpose=$FootprintHeadAge209 -or $WorkerStartupFootprintMain209 -or $WorkerStartupFootprintCombined209 -or $forwardFamily
$footprintExecutionPurpose=$WorkerStartupFootprintCopy209 -or $WorkerStartupFootprintCombined209 -or $forwardFamily
$ratlinePurpose=$WorkerStartupRatline209 -or $WorkerStartupRatlineContinuation209
$startupPurpose=$footprintMainPurpose -or $WorkerStartup -or $WorkerStartup209 -or $WorkerStartupEmpty209 -or $WorkerStartupFootprint209 -or $WorkerStartupFootprintCopy209 -or $WorkerStartupFootprintSaved209 -or $WorkerStartupFootprintHeldSaved209 -or $ratlinePurpose
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
# Separate diagnostic owner. The ordinary no-argument launcher is unchanged.
# Electron requests Browser::Quit on pipe disconnect. Never dispose live pipes,
# including after malformed requests, stdin EOF or an abandoned facade.
$footprintCopyWorkerHandleFields=@('scriptId','objectId','arg0ObjectId','arg1ObjectId','arg2ObjectId','arg3ObjectId','arg4ObjectId','arg5ObjectId','arg6ObjectId','arg7ObjectId')
if($forwardWriterCoreBytes -isnot [byte[]] -or $forwardWriterCoreBytes.Length -ne 994817){throw 'forward-complete-role-size'};$h=[Security.Cryptography.SHA256]::Create();try{$d=([BitConverter]::ToString($h.ComputeHash($forwardWriterCoreBytes))).Replace('-','').ToLowerInvariant()}finally{$h.Dispose()};if($d -cne '842dd9e77311009f3c0c1fc8f2f0fd3bc97dc7ab982f6ec3017d92ed74f18a44'){throw 'forward-complete-role-hash'};
if($forwardWriterPhaseBytes -isnot [byte[]] -or $forwardWriterPhaseBytes.Length -ne 63435){throw 'forward-complete-role-size'};$h=[Security.Cryptography.SHA256]::Create();try{$d=([BitConverter]::ToString($h.ComputeHash($forwardWriterPhaseBytes))).Replace('-','').ToLowerInvariant()}finally{$h.Dispose()};if($d -cne '14c4474f4ef1cef4ed92b62af14e44a468579098f4ff6879d43cbbfeafd40def'){throw 'forward-complete-role-hash'};
if($forwardWriterProducerBytes -isnot [byte[]] -or $forwardWriterProducerBytes.Length -ne 60895){throw 'forward-complete-role-size'};$h=[Security.Cryptography.SHA256]::Create();try{$d=([BitConverter]::ToString($h.ComputeHash($forwardWriterProducerBytes))).Replace('-','').ToLowerInvariant()}finally{$h.Dispose()};if($d -cne '5372f5585449c42e431724cdafaa2257674209812204c514715e810d4c0bc78b'){throw 'forward-complete-role-hash'};
if($forwardWriterStartupBytes -isnot [byte[]] -or $forwardWriterStartupBytes.Length -ne 128506){throw 'forward-complete-role-size'};$h=[Security.Cryptography.SHA256]::Create();try{$d=([BitConverter]::ToString($h.ComputeHash($forwardWriterStartupBytes))).Replace('-','').ToLowerInvariant()}finally{$h.Dispose()};if($d -cne '250d49cda01de2ed2be5efdfcc86c2d84e1bc7ab187b5bb589cb4e6c0aca737a'){throw 'forward-complete-role-hash'};
if($forwardWriterSyncBytes -isnot [byte[]] -or $forwardWriterSyncBytes.Length -ne 58622){throw 'forward-complete-role-size'};$h=[Security.Cryptography.SHA256]::Create();try{$d=([BitConverter]::ToString($h.ComputeHash($forwardWriterSyncBytes))).Replace('-','').ToLowerInvariant()}finally{$h.Dispose()};if($d -cne '804fd9228923f8c2a3277930a467c8e7b3bb1b4fcd46cfcaaeb0e384d591b71c'){throw 'forward-complete-role-hash'};
if($forwardWriterTailBytes -isnot [byte[]] -or $forwardWriterTailBytes.Length -ne 124331){throw 'forward-complete-role-size'};$h=[Security.Cryptography.SHA256]::Create();try{$d=([BitConverter]::ToString($h.ComputeHash($forwardWriterTailBytes))).Replace('-','').ToLowerInvariant()}finally{$h.Dispose()};if($d -cne 'ee754845a39519ee6a05652289fb3f9f404d9ecdad6251e10298cb796d2bc077'){throw 'forward-complete-role-hash'};
$graphDecoder=[Text.Encoding]::GetEncoding(20127,[Text.EncoderFallback]::ExceptionFallback,[Text.DecoderFallback]::ExceptionFallback)
$graphNative=$graphDecoder.GetString($forwardWriterCoreBytes)+"`n"+$graphDecoder.GetString($forwardWriterPhaseBytes)+"`n"+$graphDecoder.GetString($forwardWriterProducerBytes)+"`n"+$graphDecoder.GetString($forwardWriterStartupBytes)+"`n"+$graphDecoder.GetString($forwardWriterSyncBytes)+"`n"+$graphDecoder.GetString($forwardWriterTailBytes)
if([Text.Encoding]::UTF8.GetByteCount($graphNative) -ne 1430611 -or [Text.Encoding]::UTF8.GetByteCount($graphNative) -gt 1507328){throw 'forward-complete-compiled-size'}
Add-Type -TypeDefinition $graphNative
$owner=[EasyedaDiagnosticOwner]::CreateFootprintForwardWriterComplete209()
$startupRequestLimit=[EasyedaFootprintForwardExecutionLimits]::Requests
try {
  $owner.RequireForwardExecutionUnallocated()
  $owner.Initialize()
  # BEGIN GENERATED FOOTPRINT COMBINED READY
  if (($WorkerStartupFootprintCombined209 -or $WorkerStartupFootprintForward209 -or $WorkerStartupFootprintForwardWriterComplete209) -and -not $CompileOnly) {
    $readyState=$owner.NoProcessCreationState()
    if ($readyState -cne 'not-entered' -or $owner.RootPid -ne 0 -or $owner.RootCreated -cne '0') {throw 'pcb-diagnostic-combined-ready-state'}
    @{schema='easyeda-pro-control.footprint-combined-ready.v1';challenge=$CombinedReadyChallenge;helperInstance=$owner.HelperInstance;jobId=$owner.JobId;creationState=$readyState;processCreated=$false;emptyJob=$true;pipesChecked=$true} | ConvertTo-Json -Compress
  }
  # END GENERATED FOOTPRINT COMBINED READY
  if ($CompileOnly) {
    [EasyedaDiagnosticOwner]::VerifyFootprintForwardExecutionSmoke()
    [EasyedaDiagnosticOwner]::VerifyForwardWriterProducerSmoke()
    [EasyedaDiagnosticOwner]::VerifyForwardWriterStartupSmoke()
    [EasyedaDiagnosticOwner]::VerifyForwardWriterCacheSmoke()
    [EasyedaDiagnosticOwner]::VerifyForwardWriterHistorySmoke()
    [EasyedaDiagnosticOwner]::VerifyForwardWriterSyncSmoke()
    [EasyedaDiagnosticOwner]::VerifyForwardWriterFrontierSmoke()
    [EasyedaDiagnosticOwner]::VerifyForwardWriterRendererClassSmoke()
    [EasyedaDiagnosticOwner]::VerifyForwardWriterClockSmoke()
    [EasyedaDiagnosticOwner]::VerifyForwardWriterCompleteTailSmoke()
    [EasyedaDiagnosticOwner]::VerifyForwardWriterMainSqlSmoke()
    [EasyedaDiagnosticOwner]::VerifyForwardWriterCompleteTailLedgerSmoke()
    [EasyedaFootprintCopyAllocatedCreateClockLedger]::VerifySmoke()
    if (-not $owner.Terminated()) {throw 'forward-graph-compile-job-not-empty'}
    $owner.ReleaseUnlaunched()
    @{schema='easyeda-pro-control.footprint-forward-writer-complete-compile.v2';compiled=$true;emptyJob=$true;pipesChecked=$true;processLaunched=$false;executionAuthorized=$false} | ConvertTo-Json -Compress
    return
  }
  $launched=$false
  $release=$false
  while (-not $release) {
    # Bound before JSON parsing or unbounded ReadLine allocation.
    $line=New-Object Text.StringBuilder
    while ($true) {
      $character=[Console]::Read()
      if ($character -lt 0) {return}
      if ($character -eq 10) {break}
      if ($line.Length -ge 32768) {throw 'pcb-diagnostic-request-size'}
      [void]$line.Append([char]$character)
    }
    $id=$null
    try {
      $request=$line.ToString() | ConvertFrom-Json
      $largeV2Request=@('footprint-copy-clock-registration-v2','footprint-clock-rpc-v2-send','footprint-forward-cold-send') -ccontains $request.action
      $largeOpening=$request.action -ceq 'worker-startup-parent' -and $request.method -ceq 'Runtime.callFunctionOn' -and @('preflight','open-project','pcb-preflight','pcb-open-document','pcb-observe') -ccontains $request.parentPhase
      $largeMainRequest=$WorkerStartupFootprintForwardWriterComplete209 -and @('main-request-send','main-completion-send') -ccontains $request.action
      $largeClockRpcRequest=$WorkerStartupFootprintCombined209 -and @('footprint-clock-rpc-send','footprint-copy-native-create') -ccontains $request.action
      if ([Text.Encoding]::UTF8.GetByteCount($line.ToString()) -gt 32768 -or
          (-not $largeV2Request -and -not $largeMainRequest -and -not $largeClockRpcRequest -and -not $largeOpening -and ($request.action -cne 'send' -or $request.method -cne 'Runtime.callFunctionOn') -and $line.Length -gt 4096)) {throw 'pcb-diagnostic-request-size'}
      if ($request.id -isnot [string] -or $request.id -cnotmatch '^[a-f0-9]{32}$') {throw 'pcb-diagnostic-request-id'}
      $id=$request.id
      if ($launched -and $request.action -cne 'identity' -and ($request.helperInstance -isnot [string] -or $request.jobId -isnot [string] -or $request.rootCreated -isnot [string] -or ($request.rootPid -isnot [int] -and $request.rootPid -isnot [long]) -or $request.helperInstance -cne $owner.HelperInstance -or $request.jobId -cne $owner.JobId -or $request.rootCreated -cne $owner.RootCreated -or $request.rootPid -ne $owner.RootPid)) {throw 'pcb-diagnostic-owner-binding'}
      if (@('combined-abort','terminate-visual','head-age-abort') -ccontains $request.action -and ($request.helperInstance -isnot [string] -or $request.jobId -isnot [string] -or $request.rootCreated -isnot [string] -or ($request.rootPid -isnot [int] -and $request.rootPid -isnot [long]) -or $request.helperInstance -cne $owner.HelperInstance -or $request.jobId -cne $owner.JobId -or $request.rootCreated -cne $owner.RootCreated -or $request.rootPid -ne $owner.RootPid)) {throw 'pcb-diagnostic-owner-binding'}
      if ($FootprintHeadAge209) {
        $headAgeCleanup=@('identity','window','normal-close','termination','release','release-unlaunched','release-no-process','no-process-proof','head-age-abort','main-close-detach') -ccontains $request.action
        if ($request.action -ceq 'main-poll' -and $request.cleanup -eq $true) {$headAgeCleanup=$true}
        if ($request.action -ceq 'main-send' -and @('release','remove','resume') -ccontains $request.phase) {$headAgeCleanup=$true}
        $owner.AdmitHeadAgeAction($request.action,$headAgeCleanup)
      }
      if ($Visual209) {$owner.AdmitVisualAction($request.action)}
      if ($WorkerStartupFootprintCombined209) {$owner.AdmitCombinedAction($request.action)}
      $owner.AdmitForwardExecutionAction($request.action)
      if ($heldNativePurpose) {
        $heldCleanup=$false
        if ($request.action -ceq 'worker-startup-reprove') {
          if ($request.heldCleanup -isnot [bool]) {throw 'pcb-diagnostic-held-saved-reprove-fields'}
          $heldCleanup=$request.heldCleanup
        }
        $owner.AdmitHeldSavedAction($request.action,$heldCleanup)
      }
      if ($WorkerStartupEmpty209) {
        if ($request.action -isnot [string]) {throw 'pcb-diagnostic-empty-action'}
        $cleanup=(@('identity','window','normal-close','termination','release','release-unlaunched','no-process-proof','release-no-process') -ccontains $request.action) -or
          ($request.action -ceq 'worker-startup-send' -and @('release','remove','resume','start') -ccontains $request.startupPhase) -or
          ($request.action -ceq 'worker-startup-empty-common' -and $request.commonPhase -ceq 'release') -or
          ($request.action -ceq 'worker-startup-empty-root' -and $request.rootPhase -ceq 'release')
        $owner.AdmitEmptyRequest($request.action,$cleanup)
      }
      if ($ratlinePurpose) {
        if ($request.action -isnot [string]) {throw 'pcb-diagnostic-ratline-action'}
        $cleanup=(@('identity','window','normal-close','termination','release','release-unlaunched','no-process-proof','release-no-process','worker-startup-ratline-abort','worker-startup-ratline-continuation-abort') -ccontains $request.action) -or
          ($request.action -ceq 'worker-startup-send' -and @('release','remove','resume') -ccontains $request.startupPhase) -or
          ($request.action -ceq 'worker-startup-ratline' -and ($request.phase -ceq 'remove' -or ($request.role -ceq 'pcb' -and $request.phase -ceq 'resume'))) -or
          ($WorkerStartupRatlineContinuation209 -and $request.action -ceq 'worker-startup-ratline-continuation' -and @('remove','resume') -ccontains $request.phase)
        $owner.AdmitRatlineRequest($request.action,$cleanup)
      }
      switch -CaseSensitive ($request.action) {
        'saved-cache-native' {
          if ((-not $WorkerStartupFootprintCombined209 -and -not $forwardFamily) -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'pcb-diagnostic-saved-cache-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-saved-cache-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {
            if (@('sessionId','uniqueContextId','objectId') -cnotcontains $property.Name -or $property.Value -isnot [string]) {throw 'pcb-diagnostic-saved-cache-field'}
            $fields.Add($property.Name,$property.Value)
          }}
          $owner.SendSavedCacheProbe([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'saved-cache-accessor' {
          if ((-not $WorkerStartupFootprintCombined209 -and -not $forwardFamily) -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'pcb-diagnostic-saved-cache-accessor-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-saved-cache-accessor-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {
            if (@('sessionId','uniqueContextId','objectId') -cnotcontains $property.Name -or $property.Value -isnot [string]) {throw 'pcb-diagnostic-saved-cache-accessor-field'}
            $fields.Add($property.Name,$property.Value)
          }}
          $owner.SendSavedCacheAccessorProbe([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'main-attach' {
          if (-not $footprintMainPurpose -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid') {throw 'pcb-diagnostic-main-attach-fields'}
          $owner.AttachMain();$result=@{attached=$true}
        }
        'main-reprove' {
          if (-not $footprintMainPurpose -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid') {throw 'pcb-diagnostic-main-reprove-fields'}
          $owner.ReproveMain();$result=@{current=$true}
        }
        'main-close-detach' {
          if (-not $footprintMainPurpose -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid') {throw 'pcb-diagnostic-main-close-fields'}
          $owner.DetachMainForNormalClose();$result=@{inspectorDetached=$true}
        }
        'main-poll' {
          if (-not $footprintMainPurpose -or -not $launched -or $request.cleanup -isnot [bool] -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,cleanup,helperInstance,id,jobId,rootCreated,rootPid') {throw 'pcb-diagnostic-main-poll-fields'}
          $result=@{bytes=$owner.PollMain($request.cleanup)}
          if ($forwardFamily) {$result.receivedBytes=$owner.ForwardMainReceivedBytes;$result.frames=$owner.ForwardMainFrames}
        }
        'main-send' {
          if (-not $footprintMainPurpose -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'pcb-diagnostic-main-send-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-main-send-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.SendMain([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'main-request-send' {
          if (-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'pcb-diagnostic-main-request-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-main-request-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.SendMainRequest([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'main-completion-begin' {
          if (-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or ($request.firstRequestId -isnot [int] -and $request.firstRequestId -isnot [long]) -or
              $request.firstRequestId -lt 1 -or $request.firstRequestId -gt [EasyedaFootprintForwardExecutionLimits]::MainRequests -or
              (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,firstRequestId,helperInstance,id,jobId,rootCreated,rootPid') {throw 'pcb-diagnostic-main-completion-begin-fields'}
          $owner.BeginMainCompletion([int]$request.firstRequestId);$result=@{begun=$true}
        }
        'main-completion-send' {
          if (-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or
              ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt [EasyedaFootprintForwardExecutionLimits]::MainRequests) {throw 'pcb-diagnostic-main-completion-send-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-main-completion-send-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {
            if (@('scriptId','callFrameId','objectId','argument0','argument1','breakpointId') -cnotcontains $property.Name -or $property.Value -isnot [string]) {throw 'pcb-diagnostic-main-completion-send-field'}
            $fields.Add($property.Name,$property.Value)
          }}
          $owner.SendMainCompletion([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'main-completion-retire' {
          if (-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or
              (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid') {throw 'pcb-diagnostic-main-completion-retire-fields'}
          $owner.RetireMainCompletion();$result=@{retired=$true}
        }
        'combined-abort' {
          if ((-not $WorkerStartupFootprintCombined209 -and -not $forwardFamily) -or $request.confirmAbortOriginalCombinedJob -isnot [bool] -or -not $request.confirmAbortOriginalCombinedJob -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,confirmAbortOriginalCombinedJob,helperInstance,id,jobId,rootCreated,rootPid') {throw 'pcb-diagnostic-combined-abort-fields'}
          $owner.AbortFootprintCombined();$result=@{terminationDispatched=$true}
        }
        'worker-startup-reprove' {
          if (-not ($startupPurpose -or $FootprintHeldCache209) -or -not $launched -or
              (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne $(if ($heldNativePurpose) {'action,heldCleanup,helperInstance,id,jobId,rootCreated,rootPid'} else {'action,helperInstance,id,jobId,rootCreated,rootPid'})) {throw 'pcb-diagnostic-startup-reprove-fields'}
          $owner.ReproveWorkerStartup()
          $result=@{current=$true}
        }
        'worker-startup-parent' {
          if (-not $startupPurpose -or -not $launched -or $request.method -isnot [string] -or $request.parentPhase -isnot [string] -or
              ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt $startupRequestLimit) {throw 'pcb-diagnostic-startup-parent-fields'}
          $baseFields=@('action','helperInstance','id','jobId','method','requestId','rootCreated','rootPid','parentPhase')
          $parentFields=@{}
          foreach ($property in $request.PSObject.Properties) {
            if ($baseFields -cnotcontains $property.Name) {
              if ($footprintExecutionPurpose -and $request.parentPhase.StartsWith('footprint-copy-clock-registration-',[StringComparison]::Ordinal)) {
                if (@('objectId','scriptId','argument0','argument1','argument2','argument3','projectUuid','branchUuid','windowTabId') -cnotcontains $property.Name -or $property.Value -isnot [string]) {throw 'pcb-diagnostic-footprint-registration-field'}
              } elseif (($WorkerStartupFootprint209 -or $footprintExecutionPurpose) -and $request.parentPhase.StartsWith('footprint-copy-ui-',[StringComparison]::Ordinal)) {
                if (@('objectId','uniqueContextId','scriptId','argument0','argument1','argument2','argument3','argument4','argument5','projectUuid','branchUuid','windowTabId') -cnotcontains $property.Name -or $property.Value -isnot [string]) {throw 'pcb-diagnostic-footprint-ui-field'}
              } elseif (($WorkerStartupFootprint209 -or $footprintExecutionPurpose) -and $request.parentPhase.StartsWith('footprint-copy-manager-route-',[StringComparison]::Ordinal)) {
                if (@('objectId','scriptId','argument0','argument1','argument2','argument3','argument4','argument5','argument6','projectUuid','branchUuid','windowTabId') -cnotcontains $property.Name -or $property.Value -isnot [string]) {throw 'pcb-diagnostic-footprint-manager-field'}
              } elseif (@('sessionId','uniqueContextId','targetRawWindowsPath','targetProjectUuid','targetBranchUuid','targetDocumentUuid','targetExpectedSourceSha256','frameId','backendNodeId','scriptId') -cnotcontains $property.Name) {throw 'pcb-diagnostic-startup-parent-field'}
              $parentFields[$property.Name]=$property.Value
            }
          }
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-startup-parent-field'}}
          $owner.SendWorkerStartupParent([int]$request.requestId,$request.method,$request.parentPhase,$parentFields)
          $result=@{written=$true}
        }
        'footprint-copy-parent' {
          if (-not $footprintExecutionPurpose -or -not $launched -or $request.method -isnot [string] -or $request.parentStage -isnot [string] -or
              $request.realm -isnot [string] -or @('parent','child') -cnotcontains $request.realm -or
              ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or -not [EasyedaFootprintForwardExecutionLimits]::AllowsExecutionRequestId([long]$request.requestId)) {throw 'pcb-diagnostic-footprint-copy-parent-fields'}
          $parentFields=New-Object 'System.Collections.Hashtable' ([StringComparer]::Ordinal)
          foreach ($property in $request.PSObject.Properties) {
            if (@('id','action','helperInstance','jobId','rootPid','rootCreated','requestId','method','parentStage','realm') -cnotcontains $property.Name) {
              if (@('scriptId','objectId','uniqueContextId','breakpointId','callFrameId','arg0ObjectId','arg0Value','arg1Value','arg2Value') -cnotcontains $property.Name -or $property.Value -isnot [string]) {throw 'pcb-diagnostic-footprint-copy-parent-field'}
              $parentFields.Add($property.Name,$property.Value)
            }
          }
          $owner.SendFootprintCopyParent([int]$request.requestId,$request.method,$request.parentStage,$request.realm,$parentFields)
          $result=@{written=$true}
        }
        'footprint-copy-worker' {
          if (-not $footprintExecutionPurpose -or -not $launched -or $request.method -isnot [string] -or $request.executionPhase -isnot [string] -or
              ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or -not [EasyedaFootprintForwardExecutionLimits]::AllowsExecutionRequestId([long]$request.requestId)) {throw 'pcb-diagnostic-footprint-copy-worker-fields'}
          $workerFields=New-Object 'System.Collections.Hashtable' ([StringComparer]::Ordinal)
          foreach ($property in $request.PSObject.Properties) {
            if (@('id','action','helperInstance','jobId','rootPid','rootCreated','requestId','method','executionPhase') -cnotcontains $property.Name) {
              if ($footprintCopyWorkerHandleFields -cnotcontains $property.Name -or $property.Value -isnot [string]) {throw 'pcb-diagnostic-footprint-copy-worker-field'}
              $workerFields.Add($property.Name,$property.Value)
            }
          }
          $owner.SendFootprintCopyWorker([int]$request.requestId,$request.method,$request.executionPhase,$workerFields)
          $result=@{written=$true}
        }
        'footprint-cache-construction' {
          if (-not $footprintExecutionPurpose -or -not $launched -or $request.method -isnot [string] -or $request.cachePhase -isnot [string] -or
              ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or -not [EasyedaFootprintForwardExecutionLimits]::AllowsExecutionRequestId([long]$request.requestId)) {throw 'pcb-diagnostic-footprint-cache-fields'}
          $cacheFields=New-Object 'System.Collections.Hashtable' ([StringComparer]::Ordinal)
          foreach ($property in $request.PSObject.Properties) {
            if (@('id','action','helperInstance','jobId','rootPid','rootCreated','requestId','method','cachePhase') -cnotcontains $property.Name) {
              if (@('scriptId','breakpointId','callFrameId','objectId','arg0ObjectId','arg1ObjectId','arg2ObjectId','projectUuid') -cnotcontains $property.Name -or $property.Value -isnot [string]) {throw 'pcb-diagnostic-footprint-cache-field'}
              $cacheFields.Add($property.Name,$property.Value)
            }
          }
          $owner.SendFootprintCacheConstruction([int]$request.requestId,$request.method,$request.cachePhase,$cacheFields)
          $result=@{written=$true}
        }
        'footprint-copy-allocation-send' {
          if (-not $allocatedPurpose -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or
              ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt $(if ($WorkerStartupFootprintForwardWriterComplete209) {[EasyedaFootprintForwardExecutionLimits]::NormalRequests} else {[EasyedaFootprintExecutionLimits]::NormalRequests})) {throw 'pcb-diagnostic-footprint-allocation-fields'}
          $baseFields=@('id','action','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method')
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-footprint-allocation-fields'}}
          $allocationFields=New-Object 'System.Collections.Hashtable' ([StringComparer]::Ordinal)
          foreach ($property in $request.PSObject.Properties) {
            if ($baseFields -cnotcontains $property.Name) {
              if (@('objectId','scriptId','callFrameId','breakpointId','arg0ObjectId','arg1ObjectId','arg2ObjectId','arg3ObjectId','arg4ObjectId','arg5ObjectId','arg6ObjectId','arg7ObjectId') -cnotcontains $property.Name -or $property.Value -isnot [string]) {throw 'pcb-diagnostic-footprint-allocation-field'}
              $allocationFields.Add($property.Name,$property.Value)
            }
          }
          $owner.SendFootprintCopyAllocation([int]$request.requestId,$request.phase,$request.method,$allocationFields)
          $result=@{written=$true}
        }
        'footprint-copy-create-clock-retire' {
          if (-not $allocatedPurpose -or -not $launched -or
              (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid') {throw 'pcb-diagnostic-footprint-create-clock-retire-fields'}
          $owner.RetireFootprintCopyCreateClock()
          $result=@{retired=$true}
        }
        'footprint-copy-native-create' {
          if (-not $allocatedPurpose -or -not $launched -or
              (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,arg0ObjectId,arg1ObjectId,arg2ObjectId,arg3ObjectId,arg4ObjectId,createArgumentJson,expectedProjectUuid,helperInstance,id,jobId,objectId,prewriteOriginalObjectId,prewriteScopeObjectId,prewriteUploadObjectId,requestId,rootCreated,rootPid' -or
              ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt $(if ($WorkerStartupFootprintForwardWriterComplete209) {[EasyedaFootprintForwardExecutionLimits]::NormalRequests} else {[EasyedaFootprintExecutionLimits]::NormalRequests})) {throw 'pcb-diagnostic-footprint-native-create-fields'}
          $createFields=New-Object 'System.Collections.Hashtable' ([StringComparer]::Ordinal)
          foreach ($name in @('objectId','arg0ObjectId','arg1ObjectId','arg2ObjectId','arg3ObjectId','arg4ObjectId','expectedProjectUuid','createArgumentJson','prewriteScopeObjectId','prewriteOriginalObjectId','prewriteUploadObjectId')) {
            if ($request.$name -isnot [string]) {throw 'pcb-diagnostic-footprint-native-create-field'}
            $createFields.Add($name,$request.$name)
          }
          $owner.SendFootprintCopyNativeCreate([int]$request.requestId,$createFields)
          $result=@{written=$true}
        }
        'footprint-forward-allocated-clock-begin' {
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
        'worker-startup-send' {
          if (-not $startupPurpose -or -not $launched -or $request.method -isnot [string] -or $request.sessionId -isnot [string] -or
              $request.startupPhase -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or
              $request.requestId -lt 1 -or $request.requestId -gt $startupRequestLimit) {throw 'pcb-diagnostic-startup-fields'}
          $baseFields=@('action','helperInstance','id','jobId','method','requestId','rootCreated','rootPid','sessionId','startupPhase')
          $startupFields=@{}
          foreach ($property in $request.PSObject.Properties) {
            if ($baseFields -cnotcontains $property.Name) {
              if (@('scriptId','breakpointId','site','selector','callFrameId','objectId','argument0','argument1','argument2','argument3','argument4','argument5','argument6',
                    'projectUuid','branchUuid','windowTabId','footprintUuid','client','maximumTicket') -cnotcontains $property.Name -or
                  $property.Value -isnot [string]) {throw 'pcb-diagnostic-startup-field'}
              if ($property.Name -ceq 'argument6' -and -not ($WorkerStartupFootprint209 -or $footprintExecutionPurpose)) {throw 'pcb-diagnostic-footprint-dependency-purpose'}
              $startupFields[$property.Name]=$property.Value
            }
          }
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-startup-field'}}
          $owner.SendWorkerStartup([int]$request.requestId,$request.method,$request.sessionId,$request.startupPhase,$startupFields)
          $result=@{written=$true}
        }
        {$_ -ceq 'worker-startup-empty-common' -or $_ -ceq 'worker-startup-empty-root'} {
          if (-not $WorkerStartupEmpty209 -or -not $launched -or $request.method -isnot [string] -or $request.sessionId -isnot [string] -or
              ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt $startupRequestLimit) {throw 'pcb-diagnostic-empty-fields'}
          $family=if ($request.action -ceq 'worker-startup-empty-common') {'common'} else {'root'}
          $phaseKey=if ($family -ceq 'common') {'commonPhase'} else {'rootPhase'}
          if ($request.$phaseKey -isnot [string]) {throw 'pcb-diagnostic-empty-phase'}
          $baseFields=@('action','helperInstance','id','jobId','method','requestId','rootCreated','rootPid','sessionId',$phaseKey)
          $baselineFields=@{}
          foreach ($property in $request.PSObject.Properties) {
            if ($baseFields -cnotcontains $property.Name) {
              if (@('uniqueContextId','objectId','argument0','argument1') -cnotcontains $property.Name -or $property.Value -isnot [string]) {throw 'pcb-diagnostic-empty-field'}
              $baselineFields[$property.Name]=$property.Value
            }
          }
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-empty-field'}}
          $owner.SendWorkerStartupEmptyBaseline([int]$request.requestId,$request.method,$request.sessionId,$family,$request.$phaseKey,$baselineFields)
          $result=@{written=$true}
        }
        'launch' {
          if ($request.confirmDiagnosticLaunch -isnot [bool] -or $request.confirmDiagnosticLaunch -ne $true -or $launched) {throw 'pcb-diagnostic-launch-approval'}
          $plan=$request.installation
          $fileCount=if ($ratlinePurpose) {[EasyedaRatline209Installation]::FileCount} else {5}
          if ($null -eq $plan -or (@($plan.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'files,schema' -or $plan.schema -cne 'easyeda-pro-control.pcb-diagnostic-installation.v1' -or $plan.files -isnot [array] -or $plan.files.Count -ne $fileCount) {throw 'pcb-diagnostic-installation-plan'}
          $paths=New-Object 'string[]' $fileCount
          $sizes=New-Object 'long[]' $fileCount
          $hashes=New-Object 'string[]' $fileCount
          for ($i=0;$i -lt $fileCount;$i++) {
            $pin=$plan.files[$i]
            if ($null -eq $pin -or (@($pin.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'bytes,sha256,windowsPath' -or $pin.windowsPath -isnot [string] -or $pin.sha256 -isnot [string] -or ($pin.bytes -isnot [int] -and $pin.bytes -isnot [long])) {throw 'pcb-diagnostic-installation-file'}
            $paths[$i]=$pin.windowsPath; $sizes[$i]=$pin.bytes; $hashes[$i]=$pin.sha256
          }
          $owner.Launch($request.executable,$request.executableSha256,$paths,$sizes,$hashes)
          $launched=$true
          $result=@{helperInstance=$owner.HelperInstance;jobId=$owner.JobId;rootPid=$owner.RootPid;rootCreated=$owner.RootCreated}
        }
        'send' {
          if ($startupPurpose -and @('Browser.getVersion','Target.getTargets','Target.attachToTarget','Page.enable','Page.getFrameTree','Runtime.enable','Debugger.enable','Debugger.getScriptSource','DOM.getFrameOwner','DOM.describeNode') -cnotcontains $request.method) {throw 'pcb-diagnostic-startup-discovery-method'}
          if ($Layers209 -and ($null -ne $request.modelPhase -or $null -ne $request.stringPhase -or $null -ne $request.commonPhase -or $null -ne $request.workerProducerPhase -or $null -ne $request.movePhase -or $null -ne $request.actorClockPhase -or @('Runtime.evaluate','Runtime.getProperties','Runtime.releaseObjectGroup','Target.setAutoAttach') -ccontains $request.method)) {throw 'pcb-diagnostic-layers209-method'}
          $requestLimit=if ($StringPrecreate) {3309} else {103}
          if (-not $launched -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt $requestLimit -or $request.method -isnot [string]) {throw 'pcb-diagnostic-request-id'}
          $fields=@('action','helperInstance','id','jobId','method','requestId','rootCreated','rootPid')
          if ($null -ne $request.movePhase) {
            if (-not $StringPrecreate -or $request.movePhase -isnot [string]) {throw 'pcb-diagnostic-move-producer-purpose'}
            $fields+=@('sessionId','movePhase')
            $moveCount=[EasyedaDiagnosticOwner]::MoveProducerArgumentCount($request.movePhase)
            if ($moveCount -eq -1) {$fields+=@('uniqueContextId')}
            elseif ($moveCount -eq -2) {$fields+=@('objectId')}
            elseif ($moveCount -ge 0) {
              $fields+=@('objectId')
              for ($moveIndex=0;$moveIndex -lt $moveCount;$moveIndex++) {$fields+=@("moveArgument$moveIndex")}
            }
          } elseif ($null -ne $request.workerProducerPhase) {
            if (-not $StringPrecreate -or $request.workerProducerPhase -isnot [string]) {throw 'pcb-diagnostic-worker-producer-purpose'}
            $fields+=@('sessionId','workerProducerPhase')
            $workerCount=[EasyedaDiagnosticOwner]::WorkerProducerArgumentCount($request.workerProducerPhase)
            if ($workerCount -eq -1) {$fields+=@('uniqueContextId')}
            elseif ($workerCount -eq -2) {$fields+=@('objectId')}
            elseif ($workerCount -ge 0) {
              $fields+=@('objectId')
              for ($workerIndex=0;$workerIndex -lt $workerCount;$workerIndex++) {$fields+=@("workerArgument$workerIndex")}
            }
          } elseif ($null -ne $request.commonPhase) {
            if (-not $StringPrecreate) {throw 'pcb-diagnostic-common-purpose'}
            $fields+=@('sessionId','commonPhase')
            switch -CaseSensitive ($request.commonPhase) {
              'wrapper' {$fields+=@('uniqueContextId')}
              'constructors' {$fields+=@('objectId','callbackObjectId')}
              'presentation-seed' {$fields+=@('objectId','callbackObjectId','constructorObjectId')}
              'rules-seed' {$fields+=@('objectId','callbackObjectId','constructorObjectId')}
              'preference-seed' {$fields+=@('objectId','callbackObjectId','constructorObjectId')}
              'packet-advance' {$fields+=@('objectId')}
              'packet-read' {$fields+=@('objectId')}
              'packet-result' {$fields+=@('objectId')}
              'assets' {$fields+=@('objectId','callbackObjectId','constructorObjectId')}
              'metadata' {$fields+=@('objectId','callbackObjectId')}
              'release' {}
              default {throw 'pcb-diagnostic-common-phase'}
            }
          } elseif ($null -ne $request.actorClockPhase) {
            if (-not $StringPrecreate) {throw 'pcb-diagnostic-actor-clock-purpose'}
            foreach ($actorField in @('actorClockPhase','actorProjectUuid','actorBranchUuid','actorDocumentUuid','actorWindowTabId')) {if ($null -ne $request.$actorField -and $request.$actorField -isnot [string]) {throw 'pcb-diagnostic-actor-clock-field'}}
            $fields+=@('sessionId','actorClockPhase','uniqueContextId')
            switch -CaseSensitive ($request.actorClockPhase) {
              'ui' {$fields+=@('actorProjectUuid','actorBranchUuid','actorDocumentUuid','actorWindowTabId')}
              'worker' {$fields+=@('actorProjectUuid','actorBranchUuid','actorDocumentUuid','actorWindowTabId')}
              'pcb' {}
              default {throw 'pcb-diagnostic-actor-clock-phase'}
            }
          } elseif ($null -ne $request.stringPhase) {
            if (-not $StringPrecreate) {throw 'pcb-diagnostic-string-purpose'}
            $fields+=@('sessionId','stringPhase')
            switch -CaseSensitive ($request.stringPhase) {
              'worker-association' {$fields+=@('uniqueContextId')}
              'renderer-association' {$fields+=@('objectId','callbackObjectId')}
              'empty-producers' {$fields+=@('objectId','callbackObjectId','constructorObjectId')}
              'empty-producers-v2' {$fields+=@('objectId','callbackObjectId','constructorObjectId')}
              'producer-markers-v2' {$fields+=@('objectId','callbackObjectId','constructorObjectId')}
              default {throw 'pcb-diagnostic-string-phase'}
            }
          } elseif ($null -ne $request.modelPhase) {
            $fields+=@('sessionId','modelPhase')
            switch -CaseSensitive ($request.modelPhase) {
              'wrapper' {$fields+=@('uniqueContextId')}
              'properties' {$fields+=@('objectId')}
              'handler' {$fields+=@('objectId')}
              'teardrop-callbacks' {$fields+=@('objectId','callbackObjectId')}
              'teardrop-owner' {$fields+=@('objectId','callbackObjectId','teardropCallbacksObjectId','teardropReceiver0','teardropReceiver1','teardropReceiver2','teardropReceiver3','teardropReceiver4','teardropReceiver5','teardropTarget0','teardropTarget1','teardropTarget2','teardropTarget3','teardropTarget4','teardropTarget5')}
              'constructors-diagnostic' {if ($StringPrecreate) {throw 'pcb-diagnostic-model-constructors'};$fields+=@('objectId','callbackObjectId','teardropObjectId')}
              'constructors-precreate' {if (-not $StringPrecreate) {throw 'pcb-diagnostic-model-constructors'};$fields+=@('objectId','callbackObjectId','teardropObjectId')}
              'snapshot' {$fields+=@('objectId','callbackObjectId')}
              'snapshot-v2' {if (-not $StringPrecreate) {throw 'pcb-diagnostic-model-purpose'};$fields+=@('objectId','callbackObjectId')}
              'pending' {$fields+=@('objectId','callbackObjectId','constructorObjectId','teardropObjectId')}
              'pending-v2' {if (-not $StringPrecreate) {throw 'pcb-diagnostic-model-purpose'};$fields+=@('objectId','callbackObjectId','constructorObjectId','teardropObjectId')}
              'raw-strings' {$fields+=@('objectId','callbackObjectId')}
              'root-inventory' {$fields+=@('objectId','callbackObjectId','constructorObjectId')}
              'release' {}
              default {throw 'pcb-diagnostic-model-phase'}
            }
          } else {switch -CaseSensitive ($request.method) {
            'Browser.getVersion' {}
            'Target.getTargets' {}
            'Target.attachToTarget' {$fields+=@('targetId')}
            'Target.setAutoAttach' {$fields+=@('sessionId')}
            'Page.enable' {$fields+=@('sessionId')}
            'Page.getFrameTree' {$fields+=@('sessionId')}
            'Runtime.enable' {$fields+=@('sessionId')}
            'Runtime.evaluate' {$fields+=@('sessionId','uniqueContextId')}
            'Runtime.callFunctionOn' {
              $fields+=@('sessionId','uniqueContextId','targetRawWindowsPath','targetProjectUuid','targetBranchUuid','targetDocumentUuid','targetExpectedSourceSha256')
              if ($null -ne $request.pcbVisual209Phase) {if (-not $Visual209) {throw 'pcb-diagnostic-visual209-purpose'};$fields+=@('pcbVisual209Phase','visualOperationJson')} elseif ($null -ne $request.pcbPouredShapes209Phase) {if (-not $Layers209) {throw 'pcb-diagnostic-poured-shapes209-purpose'};$fields+=@('pcbPouredShapes209Phase')} elseif ($null -ne $request.pcbArcShapes209Phase) {if (-not $Layers209) {throw 'pcb-diagnostic-arc-shapes209-purpose'};$fields+=@('pcbArcShapes209Phase')} elseif ($null -ne $request.pcbImageShapes209Phase) {if (-not $Layers209) {throw 'pcb-diagnostic-image-shapes209-purpose'};$fields+=@('pcbImageShapes209Phase')} elseif ($null -ne $request.pcbPadShapes209Phase) {if (-not $Layers209) {throw 'pcb-diagnostic-pad-shapes209-purpose'};$fields+=@('pcbPadShapes209Phase')} elseif ($null -ne $request.pcbSelectionRelations209Phase) {if (-not $Layers209) {throw 'pcb-diagnostic-selection-relations209-purpose'};$fields+=@('pcbSelectionRelations209Phase','componentIds')} elseif ($null -ne $request.pcbExtendedPrimitives209Phase) {if (-not $Layers209) {throw 'pcb-diagnostic-extended-primitives209-purpose'};$fields+=@('pcbExtendedPrimitives209Phase')} elseif ($null -ne $request.pcbPrimitives209Phase) {if (-not $Layers209) {throw 'pcb-diagnostic-primitives209-purpose'};$fields+=@('pcbPrimitives209Phase')} elseif ($null -ne $request.pcbLayers209Phase) {if (-not $Layers209) {throw 'pcb-diagnostic-layers209-purpose'};$fields+=@('pcbLayers209Phase')} elseif ($null -ne $request.pcbOpeningPhase) {$fields+=@('pcbOpeningPhase')} else {$fields+=@('openingPhase')}
            }
            'Debugger.enable' {$fields+=@('sessionId')}
            'Debugger.getScriptSource' {$fields+=@('sessionId','scriptId')}
            'DOM.getFrameOwner' {$fields+=@('sessionId','frameId')}
            'DOM.describeNode' {$fields+=@('sessionId','backendNodeId')}
            default {throw 'pcb-diagnostic-session-method'}
          }}
          if ((@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne (@($fields | Sort-Object) -join ',')) {throw 'pcb-diagnostic-request-fields'}
          foreach ($field in @('targetId','sessionId','scriptId','uniqueContextId','openingPhase','pcbOpeningPhase','targetRawWindowsPath','targetProjectUuid','targetBranchUuid','targetDocumentUuid','targetExpectedSourceSha256','modelPhase','stringPhase','commonPhase','objectId','callbackObjectId','constructorObjectId','teardropObjectId','teardropCallbacksObjectId','teardropReceiver0','teardropReceiver1','teardropReceiver2','teardropReceiver3','teardropReceiver4','teardropReceiver5','teardropTarget0','teardropTarget1','teardropTarget2','teardropTarget3','teardropTarget4','teardropTarget5','frameId')) {if ($null -ne $request.$field -and $request.$field -isnot [string]) {throw 'pcb-diagnostic-request-field'}}
          foreach ($field in @('workerProducerPhase','workerArgument0','workerArgument1','workerArgument2','workerArgument3','workerArgument4','workerArgument5')) {if ($null -ne $request.$field -and $request.$field -isnot [string]) {throw 'pcb-diagnostic-worker-producer-field'}}
          if ($null -ne $request.pcbVisual209Phase -and ($request.pcbVisual209Phase -isnot [string] -or $request.visualOperationJson -isnot [string])) {throw 'pcb-diagnostic-visual209-field'}
          if ($null -ne $request.pcbLayers209Phase -and $request.pcbLayers209Phase -isnot [string]) {throw 'pcb-diagnostic-layers209-field'}
          if ($null -ne $request.pcbPrimitives209Phase -and $request.pcbPrimitives209Phase -isnot [string]) {throw 'pcb-diagnostic-primitives209-field'}
          if ($null -ne $request.pcbExtendedPrimitives209Phase -and $request.pcbExtendedPrimitives209Phase -isnot [string]) {throw 'pcb-diagnostic-extended-primitives209-field'}
          if ($null -ne $request.pcbPadShapes209Phase -and $request.pcbPadShapes209Phase -isnot [string]) {throw 'pcb-diagnostic-pad-shapes209-field'}
          if ($null -ne $request.pcbImageShapes209Phase -and $request.pcbImageShapes209Phase -isnot [string]) {throw 'pcb-diagnostic-image-shapes209-field'}
          if ($null -ne $request.pcbArcShapes209Phase -and $request.pcbArcShapes209Phase -isnot [string]) {throw 'pcb-diagnostic-arc-shapes209-field'}
          if ($null -ne $request.pcbPouredShapes209Phase -and $request.pcbPouredShapes209Phase -isnot [string]) {throw 'pcb-diagnostic-poured-shapes209-field'}
          if ($null -ne $request.pcbSelectionRelations209Phase) {
            if ($request.pcbSelectionRelations209Phase -isnot [string] -or $request.componentIds -isnot [array] -or $request.componentIds.Length -gt 16) {throw 'pcb-diagnostic-selection-relations209-field'}
            foreach ($componentId in $request.componentIds) {if ($componentId -isnot [string]) {throw 'pcb-diagnostic-selection-relations209-id'}}
          }
          foreach ($field in @('movePhase','moveArgument0','moveArgument1','moveArgument2')) {if ($null -ne $request.$field -and $request.$field -isnot [string]) {throw 'pcb-diagnostic-move-producer-field'}}
          if ($null -ne $request.movePhase) {
            $moveArguments=$null
            if ($moveCount -ge 0) {
              $moveArguments=[object[]]@()
              for ($moveIndex=0;$moveIndex -lt $moveCount;$moveIndex++) {$moveArguments+=@($request."moveArgument$moveIndex")}
            }
            $owner.SendMoveProducer([int]$request.requestId,$request.method,$request.sessionId,$request.movePhase,$request.uniqueContextId,$request.objectId,$moveArguments)
          } elseif ($null -ne $request.workerProducerPhase) {
            $workerArguments=$null
            if ($workerCount -ge 0) {
              $workerArguments=[object[]]@()
              for ($workerIndex=0;$workerIndex -lt $workerCount;$workerIndex++) {$workerArguments+=@($request."workerArgument$workerIndex")}
            }
            $owner.SendWorkerProducer([int]$request.requestId,$request.method,$request.sessionId,$request.workerProducerPhase,$request.uniqueContextId,$request.objectId,$workerArguments)
          } elseif ($null -ne $request.commonPhase) {
            $owner.SendCommonBaseline([int]$request.requestId,$request.method,$request.sessionId,$request.commonPhase,$request.uniqueContextId,$request.objectId,$request.callbackObjectId,$request.constructorObjectId)
          } elseif ($null -ne $request.actorClockPhase) {
            $owner.SendActorClock([int]$request.requestId,$request.method,$request.sessionId,$request.actorClockPhase,$request.uniqueContextId,$request.actorProjectUuid,$request.actorBranchUuid,$request.actorDocumentUuid,$request.actorWindowTabId)
          } elseif ($null -ne $request.stringPhase) {
            $owner.SendStringPrecreate([int]$request.requestId,$request.method,$request.sessionId,$request.stringPhase,$request.uniqueContextId,$request.objectId,$request.callbackObjectId,$request.constructorObjectId)
          } elseif ($null -ne $request.modelPhase) {
            if ($request.modelPhase -ceq 'teardrop-callbacks') {
              $owner.SendTeardrop([int]$request.requestId,$request.method,$request.sessionId,$request.modelPhase,$request.objectId,$request.callbackObjectId,$null,$null,$null)
            } elseif ($request.modelPhase -ceq 'teardrop-owner') {
              $owner.SendTeardrop([int]$request.requestId,$request.method,$request.sessionId,$request.modelPhase,$request.objectId,$request.callbackObjectId,$request.teardropCallbacksObjectId,
                @($request.teardropReceiver0,$request.teardropReceiver1,$request.teardropReceiver2,$request.teardropReceiver3,$request.teardropReceiver4,$request.teardropReceiver5),
                @($request.teardropTarget0,$request.teardropTarget1,$request.teardropTarget2,$request.teardropTarget3,$request.teardropTarget4,$request.teardropTarget5))
            } else {
              $owner.SendModel([int]$request.requestId,$request.method,$request.sessionId,$request.modelPhase,$request.uniqueContextId,$request.objectId,$request.callbackObjectId,$request.constructorObjectId,$request.teardropObjectId)
            }
          } elseif ($request.method -ceq 'DOM.getFrameOwner' -or $request.method -ceq 'DOM.describeNode') {
            $owner.SendDom([int]$request.requestId,$request.method,$request.sessionId,$request.frameId,$request.backendNodeId)
          } elseif ($request.method -ceq 'Runtime.callFunctionOn') {
            if ($null -ne $request.pcbVisual209Phase) {
              $owner.SendVisual209([int]$request.requestId,$request.sessionId,$request.uniqueContextId,$request.pcbVisual209Phase,$request.targetRawWindowsPath,$request.targetProjectUuid,$request.targetBranchUuid,$request.targetDocumentUuid,$request.targetExpectedSourceSha256,$request.visualOperationJson)
            } elseif ($null -ne $request.pcbPouredShapes209Phase) {
              $owner.SendPouredShapes209([int]$request.requestId,$request.sessionId,$request.uniqueContextId,$request.pcbPouredShapes209Phase,$request.targetRawWindowsPath,$request.targetProjectUuid,$request.targetBranchUuid,$request.targetDocumentUuid,$request.targetExpectedSourceSha256)
            } elseif ($null -ne $request.pcbArcShapes209Phase) {
              $owner.SendArcShapes209([int]$request.requestId,$request.sessionId,$request.uniqueContextId,$request.pcbArcShapes209Phase,$request.targetRawWindowsPath,$request.targetProjectUuid,$request.targetBranchUuid,$request.targetDocumentUuid,$request.targetExpectedSourceSha256)
            } elseif ($null -ne $request.pcbImageShapes209Phase) {
              $owner.SendImageShapes209([int]$request.requestId,$request.sessionId,$request.uniqueContextId,$request.pcbImageShapes209Phase,$request.targetRawWindowsPath,$request.targetProjectUuid,$request.targetBranchUuid,$request.targetDocumentUuid,$request.targetExpectedSourceSha256)
            } elseif ($null -ne $request.pcbPadShapes209Phase) {
              $owner.SendPadShapes209([int]$request.requestId,$request.sessionId,$request.uniqueContextId,$request.pcbPadShapes209Phase,$request.targetRawWindowsPath,$request.targetProjectUuid,$request.targetBranchUuid,$request.targetDocumentUuid,$request.targetExpectedSourceSha256)
            } elseif ($null -ne $request.pcbSelectionRelations209Phase) {
              $owner.SendSelectionRelations209([int]$request.requestId,$request.sessionId,$request.uniqueContextId,$request.pcbSelectionRelations209Phase,$request.targetRawWindowsPath,$request.targetProjectUuid,$request.targetBranchUuid,$request.targetDocumentUuid,$request.targetExpectedSourceSha256,[string[]]$request.componentIds)
            } elseif ($null -ne $request.pcbExtendedPrimitives209Phase) {
              $owner.SendExtendedPrimitives209([int]$request.requestId,$request.sessionId,$request.uniqueContextId,$request.pcbExtendedPrimitives209Phase,$request.targetRawWindowsPath,$request.targetProjectUuid,$request.targetBranchUuid,$request.targetDocumentUuid,$request.targetExpectedSourceSha256)
            } elseif ($null -ne $request.pcbPrimitives209Phase) {
              $owner.SendPrimitives209([int]$request.requestId,$request.sessionId,$request.uniqueContextId,$request.pcbPrimitives209Phase,$request.targetRawWindowsPath,$request.targetProjectUuid,$request.targetBranchUuid,$request.targetDocumentUuid,$request.targetExpectedSourceSha256)
            } elseif ($null -ne $request.pcbLayers209Phase) {
              $owner.SendLayers209([int]$request.requestId,$request.sessionId,$request.uniqueContextId,$request.pcbLayers209Phase,$request.targetRawWindowsPath,$request.targetProjectUuid,$request.targetBranchUuid,$request.targetDocumentUuid,$request.targetExpectedSourceSha256)
            } elseif ($null -ne $request.pcbOpeningPhase) {
              $owner.SendPcbOpening([int]$request.requestId,$request.sessionId,$request.uniqueContextId,$request.pcbOpeningPhase,$request.targetRawWindowsPath,$request.targetProjectUuid,$request.targetBranchUuid,$request.targetDocumentUuid,$request.targetExpectedSourceSha256)
            } else {
              $owner.SendOpening([int]$request.requestId,$request.sessionId,$request.uniqueContextId,$request.openingPhase,$request.targetRawWindowsPath,$request.targetProjectUuid,$request.targetBranchUuid,$request.targetDocumentUuid,$request.targetExpectedSourceSha256)
            }
          } else {
            $owner.Send([int]$request.requestId,$request.method,$request.targetId,$request.sessionId,$request.scriptId,$request.uniqueContextId)
          }
          $result=@{written=$true}
        }
        'poll' {
          if (-not $launched) {throw 'pcb-diagnostic-not-launched'}
          if ($heldNativePurpose) {
            if ($request.heldCleanup -isnot [bool] -or $request.heldWaiting -isnot [bool] -or
                (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,heldCleanup,heldWaiting,helperInstance,id,jobId,rootCreated,rootPid') {throw 'pcb-diagnostic-held-saved-poll-fields'}
            $result=@{bytes=$owner.PollHeldSaved($request.heldCleanup,$request.heldWaiting)}
          } else {$result=@{bytes=$owner.Poll()}}
        }
        'footprint-copy-windows-clock' {
          if (-not $footprintExecutionPurpose -or -not $launched -or $request.phase -isnot [string] -or
              ($request.sequence -isnot [int] -and $request.sequence -isnot [long]) -or $request.sequence -lt 1 -or $request.sequence -gt 4 -or
              (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,phase,rootCreated,rootPid,sequence') {throw 'pcb-diagnostic-footprint-copy-windows-clock-fields'}
          $result=$owner.FootprintWindowsClock($request.phase,[int]$request.sequence)
        }
        'window' {if (-not $launched) {throw 'pcb-diagnostic-not-launched'}; $result=@{hwnd=$owner.Window()}}
        'normal-close' {if (-not $launched -or $request.confirmNormalClose -isnot [bool] -or $request.confirmNormalClose -ne $true) {throw 'pcb-diagnostic-close-approval'}; $owner.NormalClose($request.hwnd); $result=@{closeDispatched=$true;saveOrDiscardSelected=$false}}
        'termination' {$result=$owner.TerminationObservation()}
        'identity' {$result=@{helperInstance=$owner.HelperInstance;jobId=$owner.JobId;rootPid=$owner.RootPid;rootCreated=$owner.RootCreated}}
        'release' {$owner.ReleaseClosed(); $release=$true; $result=@{released=$true}}
        'release-unlaunched' {
          if ((@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,id') {throw 'pcb-diagnostic-unlaunched-fields'}
          $owner.ReleaseUnlaunched(); $release=$true; $result=@{released=$true;launchNeverAttempted=$true}
        }
        'no-process-proof' {
          if ((@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,id') {throw 'pcb-diagnostic-no-process-fields'}
          $result=@{creationState=$owner.NoProcessCreationState();processCreated=$false}
          if ($result.creationState -ceq 'returned-false' -and $null -ne $owner.CreateProcessError) {$result.createProcessError=$owner.CreateProcessError}
        }
        'release-no-process' {
          if ((@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,id') {throw 'pcb-diagnostic-no-process-fields'}
          $state=$owner.ReleaseNoProcess(); $release=$true; $result=@{released=$true;creationState=$state;processCreated=$false}
          if ($state -ceq 'returned-false' -and $null -ne $owner.CreateProcessError) {$result.createProcessError=$owner.CreateProcessError}
        }
        'footprint-forward-head-age-main' {
          if (-not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt [EasyedaFootprintForwardExecutionLimits]::MainRequests) {throw 'forward-head-age-main-fields'}
          $baseFields=@('id','action','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method')
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'forward-head-age-main-fields'}}
          $fields=New-Object 'System.Collections.Hashtable' ([StringComparer]::Ordinal)
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {
            if (@('objectId','scriptId','argument0','argument1','argument2','argument3','nativeRootPid','createdAtLiteral','wallEpochMs') -cnotcontains $property.Name) {throw 'forward-head-age-main-field'}
            if (@('nativeRootPid','wallEpochMs') -ccontains $property.Name) {if ($property.Value -isnot [int] -and $property.Value -isnot [long]) {throw 'forward-head-age-main-number'}} elseif ($property.Value -isnot [string]) {throw 'forward-head-age-main-text'}
            $fields.Add($property.Name,$property.Value)
          }}
          $result=$owner.SendForwardHeadAgeMain([int]$request.requestId,$request.phase,$request.method,$fields)
        }
        'footprint-forward-head-main' {
          if (-not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt [EasyedaFootprintForwardExecutionLimits]::MainRequests) {throw 'forward-head-main-fields'}
          $baseFields=@('id','action','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method')
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'forward-head-main-fields'}}
          $fields=New-Object 'System.Collections.Hashtable' ([StringComparer]::Ordinal)
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {if (@('objectId','promiseObjectId','scriptId','callFrameId','breakpointId','path','argument0','argument1') -cnotcontains $property.Name -or $property.Value -isnot [string]) {throw 'forward-head-main-field'};$fields.Add($property.Name,$property.Value)}}
          $owner.SendForwardHeadMain([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'footprint-forward-writer-clock-retire' {
          if (-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid') {throw 'forward-writer-clock-retire-fields'}
          $disposition=$owner.RetireForwardWriterAllocatedClock();$result=@{retired=$true;disposition=$disposition}
        }
        'footprint-forward-writer-clock-begin' {
          if (-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or ($request.firstRequestId -isnot [int] -and $request.firstRequestId -isnot [long]) -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,firstRequestId,helperInstance,id,jobId,rootCreated,rootPid') {throw 'forward-writer-clock-begin-fields'}
          $owner.BeginForwardWriterAllocatedClock([int]$request.firstRequestId);$result=@{begun=$true}
        }
        'footprint-forward-producer-bind' {
          if (-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.workerContext -isnot [string] -or $request.scriptId -isnot [string] -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid,scriptId,workerContext') {throw 'forward-writer-producer-bind-fields'}
          $owner.BindForwardWriterProducer($request.workerContext,$request.scriptId);$result=@{bound=$true}
        }
        'footprint-forward-producer-enroll' {
          if (-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid') {throw 'forward-writer-producer-enroll-fields'}
          $owner.EnrollForwardWriterProducer();$result=@{enrolled=$true}
        }
        'footprint-forward-producer-guard' {
          if (-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -cne 'Debugger.setBreakpoint' -or $request.scriptId -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,method,phase,requestId,rootCreated,rootPid,scriptId') {throw 'forward-writer-producer-guard-fields'}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);$fields.Add('scriptId',$request.scriptId)
          $owner.SendForwardWriterProducerGuard([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'footprint-forward-producer-observe' {
          if (-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'forward-writer-producer-observe-fields'}
          $baseFields=@('id','action','requestId','phase','method','helperInstance','jobId','rootPid','rootCreated');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'forward-writer-producer-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {if (@('objectId','callFrameId','scriptId','argument0','argument1','argument2','argument3','argument4','argument5','argument6','argument7') -cnotcontains $property.Name -or $property.Value -isnot [string]) {throw 'forward-writer-producer-field'};$fields.Add($property.Name,$property.Value)}}
          $owner.SendForwardWriterProducerObserve([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'footprint-forward-startup-frontier-control' {
          if (-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.operation -isnot [string]) {throw 'forward-writer-frontier-control'}
          $expected='action,helperInstance,id,jobId,operation,rootCreated,rootPid'
          if ($request.operation -ceq 'bind') {
            if (($request.records -isnot [int] -and $request.records -isnot [long]) -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,operation,records,rootCreated,rootPid') {throw 'forward-writer-frontier-bind-fields'}
            $owner.BindForwardWriterFrontier([int]$request.records)
          } else {
            $role=$null
            if (@('callback-held','timer-held') -ccontains $request.operation) {
              if ($request.role -isnot [string] -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,operation,role,rootCreated,rootPid') {throw 'forward-writer-frontier-held-fields'}
              $role=$request.role
            } elseif (@('timer-complete','queue-open','complete') -cnotcontains $request.operation -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne $expected) {throw 'forward-writer-frontier-control-fields'}
            $owner.ControlForwardWriterFrontier($request.operation,$role)
          }
          $result=@{written=$true}
        }
        'footprint-forward-startup-frontier-send' {
          if (-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or @('callback','timer','queue') -cnotcontains $request.lane -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'forward-writer-frontier-fields'}
          $baseFields=@('id','action','requestId','phase','method','lane','helperInstance','jobId','rootPid','rootCreated');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'forward-writer-frontier-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {if (@('objectId','callFrameId','scriptId','breakpointId','argument0','argument1','argument2','argument3') -cnotcontains $property.Name -or $property.Value -isnot [string]) {throw 'forward-writer-frontier-field'};$fields.Add($property.Name,$property.Value)}}
          $owner.SendForwardWriterFrontier([int]$request.requestId,$request.lane,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'footprint-forward-initial-cache-control' {
          if (-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.operation -isnot [string]) {throw 'forward-writer-cache-control'}
          $expected='action,helperInstance,id,jobId,operation,rootCreated,rootPid'
          if ($request.operation -ceq 'bind') {
            if (($request.jobs -isnot [int] -and $request.jobs -isnot [long]) -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,jobs,operation,rootCreated,rootPid') {throw 'forward-writer-cache-bind-fields'}
            $owner.BindForwardWriterInitialCache([int]$request.jobs)
          } elseif ($request.operation -ceq 'hold') {
            if ($request.role -isnot [string] -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,operation,role,rootCreated,rootPid') {throw 'forward-writer-cache-hold-fields'}
            $owner.HoldForwardWriterInitialCache($request.role)
          } elseif ($request.operation -ceq 'complete') {
            if ((@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne $expected) {throw 'forward-writer-cache-complete-fields'}
            $owner.CompleteForwardWriterInitialCache()
          } else {throw 'forward-writer-cache-control-operation'}
          $result=@{written=$true}
        }
        'footprint-forward-initial-cache-send' {
          if (-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'forward-writer-cache-fields'}
          $baseFields=@('id','action','requestId','phase','method','helperInstance','jobId','rootPid','rootCreated');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'forward-writer-cache-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {if (@('objectId','argument0','argument1','key','body','nodes','depth','array','keys','string') -cnotcontains $property.Name) {throw 'forward-writer-cache-field'};$fields.Add($property.Name,$property.Value)}}
          $owner.SendForwardWriterInitialCache([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'footprint-forward-initial-history' {
          if (-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'forward-writer-history-fields'}
          $baseFields=@('id','action','requestId','phase','method','helperInstance','jobId','rootPid','rootCreated');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'forward-writer-history-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $owner.SendForwardWriterMainHistory([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'footprint-forward-initial-sync-control' {
          if (-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.operation -isnot [string]) {throw 'forward-writer-sync-control'}
          if ($request.operation -ceq 'hold') {
            if ($request.role -isnot [string] -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,operation,role,rootCreated,rootPid') {throw 'forward-writer-sync-hold-fields'}
            $owner.HoldForwardWriterInitialSync($request.role)
          } elseif ($request.operation -ceq 'complete') {
            if ((@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,operation,rootCreated,rootPid') {throw 'forward-writer-sync-complete-fields'}
            $owner.CompleteForwardWriterInitialSync()
          } else {throw 'forward-writer-sync-control-operation'}
          $result=@{written=$true}
        }
        'footprint-forward-initial-sync-send' {
          if (-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'forward-writer-sync-fields'}
          $baseFields=@('id','action','requestId','phase','method','helperInstance','jobId','rootPid','rootCreated');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'forward-writer-sync-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {if (@('objectId','callFrameId','argument0','argument1','argument2','argument3','key','body','nodes','depth','array','keys','string','rows') -cnotcontains $property.Name) {throw 'forward-writer-sync-field'};$fields.Add($property.Name,$property.Value)}}
          $owner.SendForwardWriterInitialSync([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'footprint-forward-writer-main-sql' {
          if(-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt 2147483647){throw 'forward-writer-sql-fields'}
          $base=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach($field in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'forward-writer-sql-missing'}}
          foreach($property in $request.PSObject.Properties){if($base -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.SendForwardWriterMainSql([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'footprint-forward-ticket-timer-control' {
          if(-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.operation -isnot [string]){throw 'forward-ticket-control'}
          $base=@('action','helperInstance','id','jobId','rootCreated','rootPid','operation');$role=[System.Management.Automation.Language.NullString]::Value;$ordinal=0
          if($request.operation -ceq 'held'){$base+=@('role','timerOrdinal');if($request.role -isnot [string] -or ($request.timerOrdinal -isnot [int] -and $request.timerOrdinal -isnot [long]) -or $request.timerOrdinal -lt 1 -or $request.timerOrdinal -gt 2){throw 'forward-ticket-held'};$role=$request.role;$ordinal=[int]$request.timerOrdinal}
          elseif(@('bind','ready','complete') -cnotcontains $request.operation){throw 'forward-ticket-operation'}
          if((@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne (@($base | Sort-Object) -join ',')){throw 'forward-ticket-shape'}
          $owner.ControlForwardWriterTicketTimer($request.operation,$role,$ordinal);$result=@{written=$true}
        }
        'footprint-forward-startup-ws' {
          if(-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.callFrameId -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt 2147483647 -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,callFrameId,helperInstance,id,jobId,requestId,rootCreated,rootPid'){throw 'forward-startup-ws-fields'}
          $owner.SendForwardWriterStartupWs([int]$request.requestId,$request.callFrameId);$result=@{written=$true}
        }
        'footprint-forward-own-data' {
          if(-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt 2147483647){throw 'forward-complete-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach($field in $baseFields){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'forward-complete-missing-field'}}
          foreach($property in $request.PSObject.Properties){if($baseFields -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.SendForwardWriterOwnData([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'footprint-forward-ticket-timer' {
          if(-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt 2147483647){throw 'forward-complete-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach($field in $baseFields){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'forward-complete-missing-field'}}
          foreach($property in $request.PSObject.Properties){if($baseFields -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.SendForwardWriterTicketTimer([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'footprint-forward-branch-query' {
          if(-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt 2147483647){throw 'forward-complete-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach($field in $baseFields){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'forward-complete-missing-field'}}
          foreach($property in $request.PSObject.Properties){if($baseFields -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.SendForwardWriterBranchQuery([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'footprint-forward-writer-branch' {
          if(-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt 2147483647){throw 'forward-complete-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach($field in $baseFields){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'forward-complete-missing-field'}}
          foreach($property in $request.PSObject.Properties){if($baseFields -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.SendForwardWriterBranchMain([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'footprint-forward-live-history' {
          if(-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt 2147483647){throw 'forward-complete-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach($field in $baseFields){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'forward-complete-missing-field'}}
          foreach($property in $request.PSObject.Properties){if($baseFields -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.SendForwardWriterLiveHistory([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'footprint-forward-copy-local' {
          if(-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt 2147483647){throw 'forward-complete-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach($field in $baseFields){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'forward-complete-missing-field'}}
          foreach($property in $request.PSObject.Properties){if($baseFields -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.SendForwardWriterCopyLocal([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'footprint-forward-copy-upload' {
          if(-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt 2147483647){throw 'forward-complete-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach($field in $baseFields){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'forward-complete-missing-field'}}
          foreach($property in $request.PSObject.Properties){if($baseFields -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.SendForwardWriterCopyUpload([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'footprint-forward-copy-drain' {
          if(-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt 2147483647){throw 'forward-complete-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach($field in $baseFields){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'forward-complete-missing-field'}}
          foreach($property in $request.PSObject.Properties){if($baseFields -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.SendForwardWriterCopyDrain([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'footprint-forward-copy-post-sync' {
          if(-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt 2147483647){throw 'forward-complete-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach($field in $baseFields){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'forward-complete-missing-field'}}
          foreach($property in $request.PSObject.Properties){if($baseFields -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.SendForwardWriterCopyPost([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'footprint-forward-copy-delete' {
          if(-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt 2147483647){throw 'forward-complete-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach($field in $baseFields){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'forward-complete-missing-field'}}
          foreach($property in $request.PSObject.Properties){if($baseFields -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.SendForwardWriterCopyDelete([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'footprint-forward-copy-tail-observe' {
          if(-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt 2147483647){throw 'forward-complete-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach($field in $baseFields){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'forward-complete-missing-field'}}
          foreach($property in $request.PSObject.Properties){if($baseFields -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.SendForwardWriterCopyTailObservation([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'footprint-forward-copy-publication' {
          if(-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt 2147483647 -or $request.lane -isnot [string]){throw 'forward-complete-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method','lane');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach($field in $baseFields){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'forward-complete-missing-field'}}
          foreach($property in $request.PSObject.Properties){if($baseFields -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.SendForwardWriterPublication([int]$request.requestId,$request.lane,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'footprint-forward-own-data-control' {
          if(-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.operation -isnot [string] -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,operation,rootCreated,rootPid'){throw 'forward-complete-own-data-control'}
          $owner.ControlForwardWriterOwnData($request.operation);$result=@{written=$true}
        }
        'footprint-forward-copy-publication-control' {
          if(-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.operation -isnot [string]){throw 'forward-complete-publication-control'}
          $base=@('action','helperInstance','id','jobId','rootCreated','rootPid','operation');$role=[System.Management.Automation.Language.NullString]::Value;$records=0
          if($request.operation -ceq 'bind'){
            $base+=@('records');if(($request.records -isnot [int] -and $request.records -isnot [long]) -or $request.records -lt 2 -or $request.records -gt 480){throw 'forward-complete-publication-records'};$records=[int]$request.records
          }elseif($request.operation -ceq 'callback-held'){
            $base+=@('role');if($request.role -isnot [string]){throw 'forward-complete-publication-role'};$role=$request.role
          }elseif(@('body-bound','queue-open','complete') -cnotcontains $request.operation){throw 'forward-complete-publication-operation'}
          if((@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne (@($base | Sort-Object) -join ',')){throw 'forward-complete-publication-shape'}
          $owner.ControlForwardWriterPublication($request.operation,$role,$records);$result=@{written=$true}
        }
        'footprint-forward-copy-tail-control' {
          if(-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.operation -isnot [string]){throw 'forward-complete-tail-control'}
          $base=@('action','helperInstance','id','jobId','rootCreated','rootPid','operation');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          if($request.operation -ceq 'precreate-body'){
            $base+=@('body');if($request.body -isnot [string]){throw 'forward-complete-body-capacity'};$fields.Add('body',$request.body)
          }elseif($request.operation -ceq 'replay-bound'){
            $base+=@('originalBody','merged');if($request.originalBody -isnot [string] -or $request.merged -isnot [string]){throw 'forward-complete-replay-handles'}
            $fields.Add('originalBody',$request.originalBody);$fields.Add('merged',$request.merged)
          }elseif(@('post-complete','drain-complete','final-complete') -cnotcontains $request.operation){throw 'forward-complete-tail-operation'}
          if((@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne (@($base | Sort-Object) -join ',')){throw 'forward-complete-tail-shape'}
          $owner.ControlForwardWriterCopyTail($request.operation,$fields);$result=@{completed=$true}
        }
        default {throw 'pcb-diagnostic-action'}
      }
      if ($ratlinePurpose) {$owner.WriteRatlineReply((@{id=$id;ok=$true;result=$result} | ConvertTo-Json -Depth 5 -Compress))}
      elseif ($WorkerStartupEmpty209) {$owner.WriteEmptyReply((@{id=$id;ok=$true;result=$result} | ConvertTo-Json -Depth 5 -Compress))}
      elseif ($heldNativePurpose) {$owner.WriteHeldSavedReply((@{id=$id;ok=$true;result=$result} | ConvertTo-Json -Depth 5 -Compress))}
      else {@{id=$id;ok=$true;result=$result} | ConvertTo-Json -Depth 5 -Compress}
    } catch {
      if ($heldNativePurpose) {$owner.FailHeldSaved()}
      # A post-create exception must not hide the retained process from its
      # original helper. The facade can recover its binding using identity.
      if ($owner.RootPid -gt 0) {$launched=$true}
      $code='pcb-diagnostic-native-call'
      # PowerShell wraps C# method exceptions. Retain only our fixed label,
      # never arbitrary OS text, paths or a stack trace from those wrappers.
      $exception=$_.Exception
      for ($depth=0;$depth -lt 4 -and $null -ne $exception;$depth++) {
        if ($exception.Message -cmatch '^pcb-diagnostic-[a-z-]{1,80}$') {$code=$exception.Message;break}
        $exception=$exception.InnerException
      }
      $windowFailure=$null
      if ($null -ne $windowFailure) {@{id=$id;ok=$false;error=$code;windowFailure=$windowFailure} | ConvertTo-Json -Depth 5 -Compress}
      else {
      if ($ratlinePurpose) {$owner.WriteRatlineReply((@{id=$id;ok=$false;error=$code} | ConvertTo-Json -Compress))}
      elseif ($WorkerStartupEmpty209) {$owner.WriteEmptyReply((@{id=$id;ok=$false;error=$code} | ConvertTo-Json -Compress))}
      elseif ($heldNativePurpose) {$owner.WriteHeldSavedReply((@{id=$id;ok=$false;error=$code} | ConvertTo-Json -Compress))}
      else {@{id=$id;ok=$false;error=$code} | ConvertTo-Json -Compress}
      }
    }
  }
} finally {$owner.RetainUntilClosed()}
