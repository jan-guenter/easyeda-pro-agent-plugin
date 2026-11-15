/** Fixed metadata-proof observers. JSON can select neither code nor a process
 * beyond the original connection returned to this retained coordinator. */
export function linuxMetadataWatcherProgram(): string {
  return String.raw`import os,sys,json,hashlib,select,stat
p=json.loads(sys.stdin.readline());pid=p['pid'];nonce=p['nonce'];held=[];links=[];pf=None

def emit(v):
 try:print(json.dumps(v),flush=True)
 except BrokenPipeError:pass

def start():
 with open('/proc/'+str(pid)+'/stat') as stream:text=stream.read()
 return text[text.rfind(')')+2:].split()[19]
def alive():
 assert not select.select([pf],[],[],0)[0];assert start()==birth

def dir_identity(s):return (s.st_dev,s.st_ino,stat.S_IFMT(s.st_mode))
def check_links():
 for parent,name,fd,original in links:
  assert dir_identity(os.fstat(fd))==original
  assert dir_identity(os.stat(name,dir_fd=parent,follow_symlinks=False))==original

def directory(path):
 at=root
 for component in path.strip('/').split('/'):
  if not component:continue
  assert component not in ['.','..'];child=os.open(component,os.O_PATH|os.O_DIRECTORY|os.O_NOFOLLOW,dir_fd=at);held.append(child);identity=dir_identity(os.fstat(child));assert identity==dir_identity(os.stat(component,dir_fd=at,follow_symlinks=False));links.append((at,component,child,identity));at=child
 return at

def same(a,b):return (a.st_dev,a.st_ino,a.st_mode,a.st_nlink,a.st_size,a.st_mtime_ns,a.st_ctime_ns)==(b.st_dev,b.st_ino,b.st_mode,b.st_nlink,b.st_size,b.st_mtime_ns,b.st_ctime_ns)
def hash_fd(fd,limit):
 h=hashlib.sha256();count=0
 while True:
  b=os.read(fd,1024*1024)
  if not b:break
  count+=len(b);assert count<=limit;h.update(b)
 return h.hexdigest(),count
try:
 birth=start();pf=os.pidfd_open(pid);alive();root=os.open('/proc/'+str(pid)+'/root',os.O_PATH|os.O_DIRECTORY);held.append(root)
 exe=os.open('/proc/'+str(pid)+'/exe',os.O_RDONLY|os.O_CLOEXEC);held.append(exe);exe_before=os.fstat(exe);assert stat.S_ISREG(exe_before.st_mode);exe_hash,exe_count=hash_fd(exe,256*1024*1024);assert same(exe_before,os.fstat(exe)) and exe_count==exe_before.st_size
 assert exe_hash==p['nodeSha256'];assert os.readlink('/proc/'+str(pid)+'/exe')==p['nodeExecutable'];observed=[];files=[]
 for expected in p['files']:
  alive();parent=directory(p['pluginRoot']+'/'+expected['relativePath'].rsplit('/',1)[0]) if '/' in expected['relativePath'] else directory(p['pluginRoot']);name=expected['relativePath'].rsplit('/',1)[-1]
  fd=os.open(name,os.O_RDONLY|os.O_NOFOLLOW|os.O_CLOEXEC,dir_fd=parent);held.append(fd);before=os.fstat(fd);assert stat.S_ISREG(before.st_mode) and before.st_nlink==1 and stat.S_IMODE(before.st_mode)==expected['mode'] and before.st_size==expected['bytes'];sha,count=hash_fd(fd,expected['bytes'])
  assert count==expected['bytes'] and sha==expected['sha256'];assert same(before,os.fstat(fd));assert same(before,os.stat(name,dir_fd=parent,follow_symlinks=False));files.append((fd,parent,name,before));observed.append({**expected,'device':str(before.st_dev),'inode':str(before.st_ino),'nlink':before.st_nlink})
 alive();check_links();emit({'kind':'linux-ready','nonce':nonce,'pid':pid,'startTicks':birth,'sixNamespaceFiles':observed,'nodeSha256':exe_hash,'pidfdHeld':True,'fileDescriptorsHeld':len(files),'ancestorDescriptorsHeld':len(links),'scope':'descriptor-bound namespace file-view observations, not loaded JavaScript memory or runtime/native admission'})
 ack=json.loads(sys.stdin.readline())
 if ack=={'kind':'ack','nonce':nonce,'pid':pid,'startTicks':birth}:
  alive();check_links();assert same(exe_before,os.stat('/proc/'+str(pid)+'/exe'))
  for fd,parent,name,before in files:assert same(before,os.fstat(fd)) and same(before,os.stat(name,dir_fd=parent,follow_symlinks=False))
  emit({'kind':'linux-acked','nonce':nonce,'pid':pid,'startTicks':birth,'pidfdHeld':True})
 else:
  assert ack=={'kind':'await-original-exit','nonce':nonce};emit({'kind':'linux-awaiting-original-exit','nonce':nonce,'proofComplete':False})
 while not select.select([pf],[],[],1)[0]:pass
 emit({'kind':'linux-exited','nonce':nonce,'pid':pid,'startTicks':birth,'originalExitObserved':True,'exitCodeKnown':False})
 release=json.loads(sys.stdin.readline());assert release=={'kind':'release','nonce':nonce}
except BaseException as error:
 emit({'kind':'linux-error','nonce':nonce,'code':type(error).__name__,'originalPidfdHeld':pf is not None})
 if pf is not None:
  while not select.select([pf],[],[],1)[0]:pass
 sys.exit(1)
finally:
 for fd in reversed(held):
  try:os.close(fd)
  except OSError:pass
 if pf is not None:os.close(pf)
`;
}

/** Retain original descendant handles before ACK and await their actual exits. */
export function windowsMetadataWatcherProgram(): string {
  return String.raw`$ErrorActionPreference='Stop'
$packet=[Console]::ReadLine()|ConvertFrom-Json
$kept=@();$targets=@();$stage='read-packet';$ProgressPreference='SilentlyContinue'
function Emit($value){[Console]::WriteLine(($value|ConvertTo-Json -Compress -Depth 5));[Console]::Out.Flush()}
function Retain($entry,$parent){
 $script:stage='lineage-open';$process=[System.Diagnostics.Process]::GetProcessById([int]$entry.ProcessId);$null=$process.Handle;$script:kept+=,$process
 $script:stage='lineage-birth';if($process.HasExited -or $process.StartTime.ToUniversalTime() -lt $parent.StartTime.ToUniversalTime()){throw 'LINEAGE_BIRTH'}
 $script:stage='lineage-identity';if([Math]::Abs(($process.StartTime.ToUniversalTime()-$entry.CreationDate.ToUniversalTime()).TotalMilliseconds) -gt 10){throw 'LINEAGE_IDENTITY'}
 return $process
}
try{
 $stage='retain-cli';$cli=[System.Diagnostics.Process]::GetProcessById([int]$packet.cliPid);$null=$cli.Handle;$kept+=,$cli
 $rows=@();$front=@($cli)
 for($depth=0;$depth -lt 6 -and $front.Count -gt 0;$depth++){$next=@();foreach($ancestor in $front){$stage='lineage-cim';foreach($entry in @(Get-CimInstance Win32_Process -Filter ('ParentProcessId='+$ancestor.Id))){$child=Retain $entry $ancestor;$rows+=,@{entry=$entry;process=$child};$next+=,$child;if($rows.Count -gt 64){throw 'LINEAGE_BOUND'}}};$front=$next}
 $stage='wrapper-roster';$wrappers=@($rows|Where-Object{$_.entry.Name -eq 'node.exe' -and $_.entry.CommandLine -match 'server[\\/]dist[\\/]server\.mjs' -and $_.entry.CommandLine -match '--machine-launch'})
 if($wrappers.Count -ne 1){throw 'WRAPPER_ROSTER'};$wrapper=$wrappers[0];$node=$wrapper.process;$targets+=,$node
 $stage='wrapper-path';if(-not [String]::Equals($wrapper.entry.ExecutablePath,$packet.nodeExecutable,[StringComparison]::OrdinalIgnoreCase)){throw 'NODE_PATH'}
 $stage='wrapper-bytes';$binary=$null;$hasher=$null
 try{
  $binary=[IO.File]::Open($wrapper.entry.ExecutablePath,[IO.FileMode]::Open,[IO.FileAccess]::Read,([IO.FileShare]::ReadWrite -bor [IO.FileShare]::Delete));$binaryLength=$binary.Length
  if($binaryLength -le 0 -or $binaryLength -gt 268435456){throw 'NODE_BYTES'};$hasher=[Security.Cryptography.SHA256]::Create();$chunk=[byte[]]::new(1048576);$total=0
  while(($count=$binary.Read($chunk,0,$chunk.Length)) -gt 0){$total+=$count;if($total -gt $binaryLength){throw 'NODE_BYTES'};$null=$hasher.TransformBlock($chunk,0,$count,$chunk,0)}
  $null=$hasher.TransformFinalBlock([byte[]]@(),0,0);$binarySha=[BitConverter]::ToString($hasher.Hash).Replace('-','').ToLowerInvariant()
  if($total -ne $binaryLength -or $binary.Length -ne $binaryLength -or $binarySha -ne $packet.nodeSha256){throw 'NODE_BYTES'}
 }finally{if($hasher){$hasher.Dispose()};if($binary){$binary.Dispose()}}
 $stage='wsl-roster';$wslRows=@($rows|Where-Object{$_.entry.ParentProcessId -eq $node.Id -and $_.entry.Name -eq 'wsl.exe'})
 if($wslRows.Count -ne 1){throw 'WSL_ROSTER'};$wsl=$wslRows[0].process;$targets+=,$wsl
 $stage='original-live';if($cli.HasExited -or $node.HasExited -or $wsl.HasExited){throw 'EARLY_EXIT'}
 Emit @{kind='windows-ready';nonce=$packet.nonce;cliPid=$cli.Id;nodePid=$node.Id;wslPid=$wsl.Id;nodeStart=$node.StartTime.ToUniversalTime().ToString('o');wslStart=$wsl.StartTime.ToUniversalTime().ToString('o');nodeExecutable=$wrapper.entry.ExecutablePath;nodeSha256=$packet.nodeSha256;relativeEntryObserved=$true;fullWindowsCwdProved=$false;originalHandlesHeld=$true;lineageHandlesHeld=$kept.Count}
 $stage='parent-ack';$ack=[Console]::ReadLine()|ConvertFrom-Json;if($ack.nonce -ne $packet.nonce){throw 'ACK'}
 if($ack.kind -eq 'ack'){if($node.HasExited -or $wsl.HasExited){throw 'EARLY_EXIT'};Emit @{kind='windows-acked';nonce=$packet.nonce;originalHandlesHeld=$true}}elseif($ack.kind -eq 'await-original-exit'){Emit @{kind='windows-awaiting-original-exit';nonce=$packet.nonce;proofComplete=$false}}else{throw 'ACK_KIND'}
 $stage='original-exit';while(-not $node.WaitForExit(200)){};while(-not $wsl.WaitForExit(200)){}
 Emit @{kind='windows-exited';nonce=$packet.nonce;nodePid=$node.Id;wslPid=$wsl.Id;nodeExitCode=$node.ExitCode;wslExitCode=$wsl.ExitCode;originalExitObserved=$true}
 $stage='release';$release=[Console]::ReadLine()|ConvertFrom-Json;if($release.kind -ne 'release' -or $release.nonce -ne $packet.nonce){throw 'RELEASE'}
}catch{$known=@('LINEAGE_BIRTH','LINEAGE_IDENTITY','LINEAGE_BOUND','WRAPPER_ROSTER','NODE_PATH','NODE_BYTES','WSL_ROSTER','EARLY_EXIT','ACK','ACK_KIND','RELEASE');$reason=if($known -contains $_.Exception.Message){$_.Exception.Message}else{'HOST_EXCEPTION'};Emit @{kind='windows-error';nonce=$packet.nonce;code='LINEAGE_OR_HANDLE_REFUSED';stage=$stage;reason=$reason;errorType=$_.Exception.GetType().FullName;originalHandlesHeld=($kept.Count -gt 0);heldOriginalPids=@($kept|ForEach-Object{$_.Id})};foreach($process in $kept){if($process.Id -ne $packet.cliPid){while(-not $process.WaitForExit(200)){}}};exit 1}finally{foreach($process in $kept){$process.Dispose()}}
`;
}
