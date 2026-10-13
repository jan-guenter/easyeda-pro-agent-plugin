# Private source-only transport. Root review must precede removing this refusal.
throw 'UNREVIEWED MAIN REFERENCE TRANSPORT - DO NOT EXECUTE'
$ErrorActionPreference='Stop'
$nonce='__NONCE__';$requestHash='__REQUEST_HASH__';$mainHash='__MAIN_HASH__'
$ownerHash='e426dbcb9dd1ad646d63ad88b665381c08ee940c7c3159df19d71a2e24eaa727'
$clockHash='97449e83f75b1c724717708c5a630669577f60cf7af142db66022cc73b4e656c'
$package=[Convert]::FromBase64String('__PACKAGE_BASE64__')
$runtime=__RUNTIME_PINS__
function Need([bool]$ok){if(-not $ok){throw 'MAIN_REFERENCE_REFUSED'}}
# The fixed ledger is initialized before any acquisition below. Original objects
# remain in their slots after disposal, including failed disposal; no retry.
function Failure([int]$category,$original){
 if($null-eq$state.primary){$state.primary=$original;$state.primaryCategory=$category}
 if($null-ne$state.job){try{$state.job.RecordExternalFailure($category)}catch{$state.ownerRecordingFailed=$true}}
}
function Reserve([int]$kind){Need ($ledger.count-lt256);$slot=$ledger.count;$ledger.count++;$ledger.kinds[$slot]=$kind;return $slot}
function Close-Tracked([int]$slot){
 if($null-eq$ledger.items[$slot]-or$ledger.attempted[$slot]){return}
 $ledger.attempted[$slot]=$true
 try{$ledger.items[$slot].Dispose();$ledger.closed[$slot]=$true}catch{
  Failure 3 $_
  if($ledger.errorCount-lt128){$ledger.errors[$ledger.errorCount]=$slot;$ledger.errorCount++}else{$ledger.overflow=$true}
 }
}
function No-Cleanup-Failure{Need ($ledger.errorCount-eq0-and-not$ledger.overflow)}
function Open-Tracked([string]$path,[IO.FileMode]$mode,[IO.FileAccess]$access,[IO.FileShare]$share){
 $slot=Reserve 1;$ledger.items[$slot]=[IO.File]::Open($path,$mode,$access,$share);return $slot
}
function Hash([byte[]]$bytes){
 $slot=Reserve 2;$ledger.items[$slot]=[Security.Cryptography.SHA256]::Create()
 try{$digest=([BitConverter]::ToString($ledger.items[$slot].ComputeHash($bytes))).Replace('-','').ToLowerInvariant()}catch{Failure 1 $_;throw}finally{Close-Tracked $slot}
 No-Cleanup-Failure;return $digest
}
function Digest($stream){
 $slot=Reserve 2;$ledger.items[$slot]=[Security.Cryptography.SHA256]::Create()
 try{$digest=([BitConverter]::ToString($ledger.items[$slot].ComputeHash($stream))).Replace('-','').ToLowerInvariant()}catch{Failure 1 $_;throw}finally{Close-Tracked $slot}
 No-Cleanup-Failure;return $digest
}
function No-Reparse([string]$path){$item=Get-Item -LiteralPath $path -Force;while($null -ne $item){Need (($item.Attributes-band[IO.FileAttributes]::ReparsePoint)-eq0);if($item.PSIsContainer){$item=$item.Parent}else{$item=$item.Directory}}}
function Exact($value,[string[]]$keys){Need ((($value.PSObject.Properties.Name|Sort-Object)-join ',')-ceq (($keys|Sort-Object)-join ','))}
function Put([string]$path,[byte[]]$bytes){
 No-Reparse ([IO.Path]::GetDirectoryName($path));$slot=Open-Tracked $path CreateNew Write None;$f=$ledger.items[$slot]
 try{$f.Write($bytes,0,$bytes.Length);$f.Flush($true)}catch{Failure 1 $_;throw}finally{Close-Tracked $slot}
 No-Cleanup-Failure
}
function Json-Bytes($value){return ,[Text.Encoding]::UTF8.GetBytes(($value|ConvertTo-Json -Depth 24 -Compress)+[char]10)}
function Receipt([string]$name,$value){$bytes=Json-Bytes $value;Need ($bytes.Length-gt0-and$bytes.Length-le65536);Put (Join-Path $evidence $name) $bytes}
function Read-Bytes([string]$path,[int]$maximum){
 No-Reparse $path;$slot=Open-Tracked $path Open Read Read;$f=$ledger.items[$slot]
 try{Need ($f.Length-gt0-and$f.Length-le$maximum);$bytes=New-Object byte[] ([int]$f.Length);$offset=0;while($offset-lt$bytes.Length){$n=$f.Read($bytes,$offset,$bytes.Length-$offset);Need ($n-gt0);$offset+=$n};Need ($f.ReadByte()-eq-1-and$f.Length-eq$bytes.Length)}catch{Failure 1 $_;throw}finally{Close-Tracked $slot}
 No-Cleanup-Failure;return ,$bytes
}
function Read-Receipt([string]$name){return [Text.Encoding]::UTF8.GetString((Read-Bytes (Join-Path $evidence $name) 65536))|ConvertFrom-Json}
function Same-Path([string]$a,[string]$b){return [IO.Path]::GetFullPath($a).ToLowerInvariant()-ceq[IO.Path]::GetFullPath($b).ToLowerInvariant()}
function Native-Clock{$value=[EasyedaClockObservation]::Read();Need ($value.tzAbsent-and$null-eq$value.reason-and$null-ne$value.sample);return $value.sample}
# Decoder bytes are compiler-owned and hash-checked before this fixed insertion.
__STDIN_DECODER__
# Raw ASCII framing; consume at most cap+1 bytes, reject overflow and non-ASCII.
# EOF is required: a zero Read ends the loop; a full cap+1 buffer always refuses.
$stdinBuffer=New-Object byte[] 180001;$stdinCount=0;$stdinStream=[Console]::OpenStandardInput()
try{while($stdinCount-lt$stdinBuffer.Length){$n=$stdinStream.Read($stdinBuffer,$stdinCount,$stdinBuffer.Length-$stdinCount);Need ($n-ge0-and$n-le($stdinBuffer.Length-$stdinCount));if($n-eq0){break};$stdinCount+=$n}}finally{$stdinStream.Dispose()}
Need ($stdinCount-gt0-and$stdinCount-le180000)
for($i=0;$i-lt$stdinCount;$i++){Need ($stdinBuffer[$i]-le127)}
$stdinText=[Text.Encoding]::ASCII.GetString($stdinBuffer,0,$stdinCount)
$decoded=Convert-MainReferenceStdinV2 $stdinText $mainHash $requestHash $ownerHash $clockHash
$main=$decoded.main.bytes;$request=$decoded.request.bytes
$ownerSource=$decoded.owner.bytes;$clockSource=$decoded.clock.bytes
$ownerText=$decoded.owner.text;$clockText=$decoded.clock.text;$requestText=$decoded.request.text
Need ($nonce-cmatch'^[a-f0-9]{64}$'-and$runtime.Count-eq18)
$requestData=$requestText|ConvertFrom-Json;Need ($requestData.nonce-ceq$nonce)
# Bookkeeping allocation precedes native/managed resource acquisition. This slice
# does not fix path-based directory creation; the leading refusal stays intact.
$ledger=@{items=(New-Object object[] 256);kinds=(New-Object int[] 256);attempted=(New-Object bool[] 256);closed=(New-Object bool[] 256);errors=(New-Object int[] 128);count=0;errorCount=0;overflow=$false}
$state=@{job=$null;primary=$null;primaryCategory=0;ownerRecordingFailed=$false}
$root=$null;$evidence=$null;$candidate=$false;$accepted=$false;$stage='PREPARATION';$nativeBefore=$null;$nativeAfter=$null;$result=$null;$manifestHash=$null;$receiptPublished=$false;$allClosed=$false
try{
 Add-Type -TypeDefinition $ownerText;Add-Type -TypeDefinition $clockText
 # Empty constructor: retain the exact owner BEFORE Prepare can acquire a Job.
 $state.job=New-Object OwnedSyntheticJob;$job=$state.job;$job.Prepare()
 $local=[Environment]::GetFolderPath([Environment+SpecialFolder]::LocalApplicationData)
 Need ($local.Length-gt3-and$local.Length-le220-and[IO.Path]::IsPathRooted($local))
 $parent=Join-Path $local 'Temp';No-Reparse $parent
 $root=Join-Path $parent ('easyeda-main-reference-'+$nonce);Need (-not(Test-Path -LiteralPath $root))
 $program=Join-Path ([Environment]::GetFolderPath([Environment+SpecialFolder]::ProgramFiles)) 'easyeda-pro';No-Reparse $program
 $identitySlot=Reserve 3;$ledger.items[$identitySlot]=[Security.Principal.WindowsIdentity]::GetCurrent()
 try{$sid=$ledger.items[$identitySlot].User;$acl=New-Object Security.AccessControl.DirectorySecurity
  $acl.SetAccessRuleProtection($true,$false);$acl.SetOwner($sid)
  foreach($identity in @($sid,(New-Object Security.Principal.SecurityIdentifier('S-1-5-18')))){$acl.AddAccessRule((New-Object Security.AccessControl.FileSystemAccessRule($identity,'FullControl','ContainerInherit,ObjectInherit','None','Allow')))}
 }catch{Failure 1 $_;throw}finally{Close-Tracked $identitySlot}
 No-Cleanup-Failure
 $directory=New-Object IO.DirectoryInfo($root);$directory.Create($acl);$evidence=Join-Path $root 'evidence'
 foreach($relative in @('runtime','runtime\locales','runtime\resources','runtime\resources\app','evidence','user-data','session-data','logs','crash-dumps','temp')){[void][IO.Directory]::CreateDirectory((Join-Path $root $relative))}
 Receipt 'preparation-intent.json' @{profile='private.main-reference-preparation-intent.v1';nonce=$nonce;requestSha256=$requestHash;mainSha256=$mainHash;ownerSourceSha256=$ownerHash;clockSourceSha256=$clockHash;runtime=$runtime}
 $files=@()
 foreach($name in ($runtime.Keys|Sort-Object)){
  Need ($name-cmatch'^(?:[A-Za-z0-9_.-]+|locales\\en-US\.pak)$');$from=Join-Path $program $name;No-Reparse $from
  $sourceSlot=Open-Tracked $from Open Read Read;$source=$ledger.items[$sourceSlot]
  try{Need ($source.Length-gt0-and$source.Length-le536870912-and(Digest $source)-ceq$runtime[$name]);$source.Position=0;$relative='runtime\'+$name;$to=Join-Path $root $relative
   $destinationSlot=Open-Tracked $to CreateNew Write None;$destination=$ledger.items[$destinationSlot];try{$source.CopyTo($destination);$destination.Flush($true)}catch{Failure 1 $_;throw}finally{Close-Tracked $destinationSlot}
  }catch{Failure 1 $_;throw}finally{Close-Tracked $sourceSlot}
  No-Cleanup-Failure
  $lockSlot=Open-Tracked $to Open Read Read;$f=$ledger.items[$lockSlot];Need ((Digest $f)-ceq$runtime[$name]);$files+=@{path=$relative;bytes=$f.Length;sha256=$runtime[$name]}
 }
 foreach($item in @(@('package.json',$package),@('request.json',$request),@('main.cjs',$main))){$relative='runtime\resources\app\'+$item[0];$to=Join-Path $root $relative;Put $to $item[1];$lockSlot=Open-Tracked $to Open Read Read;$f=$ledger.items[$lockSlot];$digest=Digest $f;Need ($digest-ceq(Hash $item[1]));$files+=@{path=$relative;bytes=$f.Length;sha256=$digest}}
 $manifest=@{profile='private.main-reference-prepared.v1';nonce=$nonce;requestSha256=$requestHash;mainSha256=$mainHash;files=$files};$manifestBytes=Json-Bytes $manifest
 Put (Join-Path $root 'prepared.json') $manifestBytes;$manifestSlot=Open-Tracked (Join-Path $root 'prepared.json') Open Read Read;$manifestLock=$ledger.items[$manifestSlot]
 $manifestHash=Digest $manifestLock;Need ($manifestHash-ceq(Hash $manifestBytes))
 No-Cleanup-Failure
 Receipt 'launch-intent.json' @{profile='private.main-reference-launch-intent.v1';nonce=$nonce;requestSha256=$requestHash;preparedSha256=$manifestHash;ownerSourceSha256=$ownerHash;clockSourceSha256=$clockHash;generations=1}
 $exe=Join-Path $root 'runtime\easyeda-pro.exe';$system=[Environment]::GetFolderPath([Environment+SpecialFolder]::Windows)
 $environment=@{'SystemRoot'=$system;'WINDIR'=$system;'SystemDrive'=[IO.Path]::GetPathRoot($system).TrimEnd('\');'ComSpec'=(Join-Path $system 'System32\cmd.exe');'PATH'=(Join-Path $system 'System32');'APPDATA'=(Join-Path $root 'user-data');'LOCALAPPDATA'=$root;'USERPROFILE'=$root;'TEMP'=(Join-Path $root 'temp');'TMP'=(Join-Path $root 'temp')}
 $block=(($environment.Keys|Sort-Object|ForEach-Object{"$_=$($environment[$_])"})-join[char]0)+[char]0+[char]0
 $command='"'+$exe+'" "--user-data-dir='+(Join-Path $root 'user-data')+'" --disable-background-networking --no-proxy-server --lang=en-US --easyeda-clock-reference=once'
 $stage='LAUNCH';$job.Launch($exe,$command,$block,(Join-Path $root 'runtime'));$watch=[Diagnostics.Stopwatch]::StartNew()
 while(-not(Test-Path -LiteralPath (Join-Path $evidence 'handshake.ready'))){Need ($watch.ElapsedMilliseconds-lt12000-and-not$job.RootExited());[void]$job.Pids();Start-Sleep -Milliseconds 25}
 $stage='HANDSHAKE';$handshake=Read-Receipt 'handshake.json'
 Exact $handshake @('profile','nonce','pid','electron','chrome','node','appName','appPath','resourcesPath','executable','rendererCreated','requestSha256','userData','sessionData','logs','crashDumps','tzEnvironmentAbsent')
 Need ($handshake.profile-ceq'private.main-reference-handshake.v1'-and$handshake.nonce-ceq$nonce-and$handshake.pid-eq$job.Pid-and$handshake.requestSha256-ceq$requestHash-and$handshake.electron-ceq'41.2.1-jlc-sa-win-x64.2'-and$handshake.chrome-ceq'146.0.7680.188'-and$handshake.node-ceq'24.14.1'-and$handshake.appName-ceq'EasyEDA Main Clock Reference'-and$handshake.rendererCreated-eq$false-and$handshake.tzEnvironmentAbsent-eq$true)
 foreach($pair in @(@('appPath','runtime\resources\app'),@('resourcesPath','runtime\resources'),@('executable','runtime\easyeda-pro.exe'),@('userData','user-data'),@('sessionData','session-data'),@('logs','logs'),@('crashDumps','crash-dumps'))){Need (Same-Path $handshake.($pair[0]) (Join-Path $root $pair[1]))}
 Need (-not$job.RootExited()-and$job.Pid-in@($job.Pids()))
 $stage='CLOCK_BEFORE';$nativeBefore=Native-Clock;Receipt 'clock-before.json' $nativeBefore
 Receipt 'reference-admission.json' @{profile='private.main-reference-admission.v1';nonce=$nonce;pid=$job.Pid;requestSha256=$requestHash};Put (Join-Path $evidence 'reference-admission.ready') ([byte[]]@())
 $stage='REFERENCE';while(-not$job.RootExited()-or@($job.Pids()).Count-ne0){Need ($watch.ElapsedMilliseconds-lt30000);Start-Sleep -Milliseconds 25}
 Need ($job.ObserveTerminal()-and$job.ExitCodeObserved-and$job.ObservedExitCode-eq0-and-not(Test-Path -LiteralPath (Join-Path $evidence 'failure.json')))
 $stage='CLOCK_AFTER';$nativeAfter=Native-Clock;Receipt 'clock-after.json' $nativeAfter
 $stage='RESULT';$result=Read-Receipt 'result.json';Need ($result.profile-ceq'private.main-reference-result.v1'-and$result.nonce-ceq$nonce-and$result.requestSha256-ceq$requestHash)
 No-Cleanup-Failure;$candidate=$true;$stage='OBSERVATION_COMPLETE'
}catch{Failure 1 $_}finally{
 # Settlement attempts root-signaled AND complete empty Job using retained
 # handles. An unresolved case consumes kill-on-close before path locks release.
 try{if($null-ne$state.job){$state.job.PrepareSettlement($candidate)}}catch{Failure 1 $_}
 # This receipt is intentionally PRE-cleanup and can never claim final success.
 # Receipt failure is retained, then every later cleanup action still runs.
 try{
  if($null-ne$evidence){
   Receipt 'owner-settlement.json' @{profile='private.main-reference-owner-settlement.v2';nonce=$nonce;requestSha256=$requestHash;accepted=$false;cleanupComplete=$false;rootSignaled=($null-ne$state.job-and$state.job.RootSignaledObserved);emptyRetainedJob=($null-ne$state.job-and$state.job.EmptyJobObserved);terminationObserved=($null-ne$state.job-and$state.job.TerminalObserved);executionAuthorized=$false}
   $receiptPublished=$true
  }
 }catch{Failure 2 $_}
 try{
  for($slot=0;$slot-lt$ledger.count;$slot++){Close-Tracked $slot}
 }finally{
  try{if($null-ne$state.job){$state.job.CloseOwnedResources()}}catch{Failure 3 $_}
 }
 $allClosed=$ledger.errorCount-eq0-and-not$ledger.overflow
 for($slot=0;$slot-lt$ledger.count;$slot++){if($null-ne$ledger.items[$slot]-and-not$ledger.closed[$slot]){$allClosed=$false}}
 $accepted=$candidate-and$receiptPublished-and$allClosed-and$null-eq$state.primary-and-not$state.ownerRecordingFailed-and$null-ne$state.job-and$state.job.NativeSuccess
 if($accepted){$stage='COMPLETE'}
}
# Final data is formed only after all required cleanup attempts. No final disk
# write reacquires a file after the cleanup claim; stdout delivery may still fail.
$job=$state.job
$owner=@{profile='private.main-reference-owner-final.v2';nonce=$nonce;requestSha256=$requestHash;preparedSha256=$manifestHash;accepted=$accepted;stage=$stage;rootPid=if($null-eq$job){$null}else{$job.Pid};rootStartFileTime=if($null-eq$job){$null}else{$job.StartFileTime.ToString()};forced=($null-ne$job-and$job.Forced);emptyRetainedJob=($null-ne$job-and$job.EmptyJobObserved);rootSignaled=($null-ne$job-and$job.RootSignaledObserved);terminationObserved=($null-ne$job-and$job.TerminalObserved);rootExitCode=if($null-eq$job-or-not$job.ExitCodeObserved){$null}else{$job.ObservedExitCode};killOnCloseAttempted=($null-ne$job-and$job.KillOnCloseAttempted);nativeCleanupComplete=($null-ne$job-and$job.CleanupFinished);nativeCleanupSucceeded=($null-ne$job-and$job.CleanupSucceeded);managedCleanupSucceeded=$allClosed;settlementReceiptPublished=$receiptPublished;primaryCategory=$state.primaryCategory;nativePrimaryCode=if($null-eq$job){0}else{$job.PrimaryCode};nativePrimaryError=if($null-eq$job){0}else{$job.PrimaryNativeError};cleanupCodes=if($null-eq$job){,@()}else{,($job.ErrorCodes)};cleanupSlots=if($null-eq$job){,@()}else{,($job.ErrorSlots)};cleanupNativeErrors=if($null-eq$job){,@()}else{,($job.NativeErrors)};managedCleanupFailureCount=$ledger.errorCount;managedCleanupOverflow=$ledger.overflow;executionAuthorized=$false}
$owner.launchAttempted=$null-ne$job-and$job.LaunchAttempted;$owner.launchCallEntered=$null-ne$job-and$job.LaunchCallEntered;$owner.launchAcknowledged=$null-ne$job-and$job.LaunchAcknowledged
$owner.nativeCleanupOverflow=$null-ne$job-and$job.ErrorOverflow;$owner.ownerRecordingFailed=$state.ownerRecordingFailed
$owner.nativeAcquisitionUncertain=$null-ne$job-and$job.AcquisitionUncertain
$owner.nativeResourceAliasDetected=$null-ne$job-and$job.ResourceAliasDetected
$owner.ownershipUnresolved=$owner.nativeAcquisitionUncertain-or$owner.nativeResourceAliasDetected-or($null-ne$job-and$job.LaunchCallEntered-and-not$job.TerminalObserved)
$owner.managedCleanupSlots=if($ledger.errorCount-eq0){,@()}else{,([int[]]($ledger.errors[0..($ledger.errorCount-1)]))}
$output=@{profile='private.main-reference-transport-result.v2';requestSha256=$requestHash;root=$root;owner=$owner;nativeBefore=$nativeBefore;nativeAfter=$nativeAfter;result=$result;ownerSourceSha256=$ownerHash;clockSourceSha256=$clockHash;mainSha256=$mainHash;executionAuthorized=$false}
try{$outText=$output|ConvertTo-Json -Depth 24 -Compress;Need ($outText.Length-le65536);[Console]::Out.WriteLine($outText)}catch{Failure 4 $_;exit 1}
if(-not$accepted){exit 1}

