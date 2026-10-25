param([switch]$ConfirmSyntheticChildLaunch,[switch]$StableImagePathProbe,[switch]$VerifiedImageProbe)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
# Separate opt-in diagnostic fixture. Never dot-source or execute the production
# helper's PowerShell dispatcher. CompileOnly remains a no-child check.
if (-not $ConfirmSyntheticChildLaunch) {throw 'synthetic-launch-confirmation-required'}
if ($StableImagePathProbe -and $VerifiedImageProbe) {throw 'synthetic-launch-mode-conflict'}
if ([Environment]::OSVersion.Platform -ne [PlatformID]::Win32NT -or [IntPtr]::Size -ne 8) {
  throw 'synthetic-launch-windows-x64-required'
}
if ($PSVersionTable.PSVersion.Major -ne 5 -or $PSVersionTable.PSVersion.Minor -ne 1) {
  throw 'synthetic-launch-powershell-51-required'
}
function Read-BoundedFile([string]$Path,[int]$MaximumBytes) {
  $stream = [IO.File]::Open($Path,[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::Read)
  try {
    if ($stream.Length -le 0 -or $stream.Length -gt $MaximumBytes) {throw 'synthetic-launch-file-size'}
    $buffer = New-Object byte[] ([int]$stream.Length)
    $offset = 0
    while ($offset -lt $buffer.Length) {
      $count = $stream.Read($buffer,$offset,$buffer.Length-$offset)
      if ($count -le 0) {throw 'synthetic-launch-short-read'}
      $offset += $count
    }
    if ($stream.ReadByte() -ne -1) {throw 'synthetic-launch-file-grew'}
    return ,$buffer
  } finally {$stream.Dispose()}
}
$helper = Join-Path $PSScriptRoot 'pcb-diagnostic-owner.ps1'
# This 1MiB source-artifact ceiling covers the fixed diagnostic, String and
# worker-startup profiles. Exact length/hash below still admit only one helper;
# this allocation bound changes no request or transport limits.
$bytes = Read-BoundedFile $helper 1048576
if ($bytes.Length -ne 930350) {throw 'synthetic-launch-helper-size'}
$hash = [Security.Cryptography.SHA256]::Create()
try {$helperHash = [BitConverter]::ToString($hash.ComputeHash($bytes)).Replace('-','').ToLowerInvariant()}
finally {$hash.Dispose()}
if ($helperHash -cne '6ce75be69d47437d6bdb1dc2a91572c64c18392ada94630e72b961722f4e803a') {
  throw 'synthetic-launch-helper-hash'
}
$source = [Text.UTF8Encoding]::new($false,$true).GetString($bytes)
$begin = "Add-Type @'`n"
$end = "`n'@`n"
$start = $source.IndexOf($begin,[StringComparison]::Ordinal)
$stop = $source.IndexOf($end,[StringComparison]::Ordinal)
if ($start -lt 0 -or $stop -le $start -or
    $source.IndexOf($begin,$start+1,[StringComparison]::Ordinal) -ge 0 -or
    $source.IndexOf($end,$stop+1,[StringComparison]::Ordinal) -ge 0) {
  throw 'synthetic-launch-helper-boundaries'
}
$native = $source.Substring($start+$begin.Length,$stop-$start-$begin.Length)
# These test-only methods are inserted in memory into the hash-pinned C# source.
# Its actual structures, P/Invoke declarations, leases, Job and pipe methods are
# unchanged. Neither addition exists in the production helper or its protocol.
$installationMarker = '  public void Admit(string[] paths,long[] sizes,string[] hashes) {'
$installationTest = @'
  public static string SyntheticDirectory() {
    string directory=Path.Combine(Path.GetTempPath(),"easyeda-native-launch-"+Guid.NewGuid().ToString("N"));
    Need(!Directory.Exists(directory),"synthetic-directory-exists");
    Directory.CreateDirectory(directory);
    IntPtr handle=CreateFile(directory,0x80u,7u,IntPtr.Zero,3,0x02200000,IntPtr.Zero);
    Need(handle!=IntPtr.Zero && handle!=new IntPtr(-1),"synthetic-directory-open");
    try {
      string normalized=FinalPath(handle,0);
      Need(normalized.StartsWith(@"\\?\",StringComparison.Ordinal),"synthetic-directory-prefix");
      string canonical=normalized.Substring(4); ValidatePath(canonical); return canonical;
    } finally { Need(CloseHandle(handle),"synthetic-directory-close"); }
  }
  public void AdmitSynthetic(string executable,long bytes,string hash) {
    Need(!consumed,"synthetic-consumed"); consumed=true;
    ValidatePath(executable);
    string directory=Path.GetDirectoryName(executable);
    Need(Path.GetFileName(executable)=="synthetic-noop.exe" &&
      System.Text.RegularExpressions.Regex.IsMatch(Path.GetFileName(directory),@"\Aeasyeda-native-launch-[a-f0-9]{32}\z"),
      "synthetic-name");
    Pin(executable,bytes,hash);
    Executable=executable; ExecutableHash=hash;
    BindNativePaths(executable,directory); admitted=true; AssertCurrent();
  }
  public string SyntheticStableImagePath() {
    AssertCurrent();
    foreach(Lease lease in leases) if(!lease.Directory && lease.Path==Executable) {
      string path=FinalPath(lease.Handle,2);
      Need(String.Equals(path,lease.Mapping+lease.Path.Substring(2),StringComparison.OrdinalIgnoreCase),"synthetic-native-image");
      return @"\\?\GLOBALROOT"+path;
    }
    throw Error("synthetic-image-lease");
  }
'@
$ownerMarker = '  // Exact worker diagnostic program. Its complete UTF-8 bytes must match the'
$ownerTest = @'
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool GetExitCodeProcess(IntPtr process,out uint code);
  public sealed class SyntheticResult {
    public string Variant;
    public bool Created,NoProcessCreated,OriginalRootExited,JobEmpty,Released,CreatedImageVerified,PrimaryThreadResumed;
    public uint Error,ExitCode;
    public int StartupInfoBytes,StartupInfoExBytes,SecurityAttributesBytes;
  }
  // Fixed baseline plus three single-variable comparisons, each with a new
  // owner. Stop at the first creation, first non-87 error or indeterminate state.
  // No fallback exists in Launch. This cannot authorize a production change.
  public static SyntheticResult[] VerifySyntheticLaunch(string executable,long bytes,string hash,bool stableImageOnly,bool verifiedImageOnly) {
    if(stableImageOnly && verifiedImageOnly) throw Error("synthetic-mode-conflict");
    if(verifiedImageOnly) return VerifySyntheticCreatedImage(executable,bytes,hash);
    List<SyntheticResult> results=new List<SyntheticResult>();
    for(int variant=stableImageOnly?4:0;variant<(stableImageOnly?5:4);variant++) {
      EasyedaDiagnosticOwner owner=new EasyedaDiagnosticOwner();
      try {
        owner.Initialize(); owner.installation.AdmitSynthetic(executable,bytes,hash);
        SyntheticResult result=owner.SyntheticAttempt(variant);
        results.Add(result);
        owner.ReleaseClosed(); result.Released=true;
        if(result.Created || result.Error!=87) break;
      } finally {
        // Never force a child or release its leases while it is alive. The fixed
        // child only waits one second; it has no I/O, network or helper launch.
        owner.RetainUntilClosed();
      }
    }
    return results.ToArray();
  }
  static SyntheticResult[] VerifySyntheticCreatedImage(string executable,long bytes,string hash) {
    EasyedaDiagnosticOwner owner=new EasyedaDiagnosticOwner();
    SyntheticResult result=new SyntheticResult();
    result.Variant="shared-dos-suspended-native-image-verified";
    result.StartupInfoBytes=Marshal.SizeOf(typeof(STARTUPINFO));
    result.StartupInfoExBytes=Marshal.SizeOf(typeof(STARTUPINFOEX));
    result.SecurityAttributesBytes=Marshal.SizeOf(typeof(SECURITY_ATTRIBUTES));
    if(result.StartupInfoBytes!=104 || result.StartupInfoExBytes!=112 ||
      result.SecurityAttributesBytes!=24) throw Error("synthetic-abi");
    try {
      owner.Initialize(); owner.installation.AdmitSynthetic(executable,bytes,hash);
      owner.AssertLimits(); owner.AssertPipes();
      if(owner.JobCount()!=0 || owner.launchAttempted) throw Error("synthetic-initial-state");
      owner.launchAttempted=true;
      try {
        // The same private core used by production Launch, without a rewritten
        // CreateProcess call, image check, ResumeThread or ownership predicate.
        owner.CreateVerifiedRoot();
        if(!owner.launchCompleted) throw Error("synthetic-core-incomplete");
        result.Created=true; result.CreatedImageVerified=true; result.PrimaryThreadResumed=true;
      } catch {
        // Only an exact original normal false/empty-output outcome can become
        // a clean no-process report. Post-create/unknown states are never retried.
        if(owner.creationPhase!=CreationPhase.ReturnedFalse || owner.root!=IntPtr.Zero ||
          owner.rootThread!=IntPtr.Zero || owner.rootPid!=0 || owner.rootCreated!=0 ||
          !owner.createProcessError.HasValue) throw;
        result.NoProcessCreated=true; result.Error=owner.createProcessError.Value;
      } finally { owner.launchSettled=true; }
      if(result.Created) {
        if(WaitForSingleObject(owner.root,10000)!=0) throw Error("synthetic-child-not-exited");
        uint exitCode; Native(GetExitCodeProcess(owner.root,out exitCode)); result.ExitCode=exitCode;
        result.OriginalRootExited=owner.RootExited();
        if(exitCode!=0 || !result.OriginalRootExited) throw Error("synthetic-child-result");
      }
      result.JobEmpty=owner.JobCount()==0;
      if(!result.JobEmpty || !owner.Terminated()) throw Error("synthetic-final-state");
      owner.installation.AssertCurrent();
      owner.ReleaseClosed(); result.Released=true;
      return new SyntheticResult[] { result };
    } finally { owner.RetainUntilClosed(); }
  }
  SyntheticResult SyntheticAttempt(int variant) {
    if(launchAttempted || variant<0 || variant>4) throw Error("synthetic-consumed");
    launchAttempted=true;
    SyntheticResult result=new SyntheticResult();
    result.Variant=new string[] {"guid-exe-guid-cwd-job-handles","guid-exe-dos-cwd-job-handles",
      "guid-exe-guid-cwd-handles","dos-exe-guid-cwd-job-handles","globalroot-exe-guid-cwd-job-handles"}[variant];
    result.StartupInfoBytes=Marshal.SizeOf(typeof(STARTUPINFO));
    result.StartupInfoExBytes=Marshal.SizeOf(typeof(STARTUPINFOEX));
    result.SecurityAttributesBytes=Marshal.SizeOf(typeof(SECURITY_ATTRIBUTES));
    if(result.StartupInfoBytes!=104 || result.StartupInfoExBytes!=112 ||
      result.SecurityAttributesBytes!=24) throw Error("synthetic-abi");
    AssertLimits(); AssertPipes(); if(JobCount()!=0) throw Error("synthetic-nonempty");
    bool includeJob=variant!=2;
    IntPtr size=IntPtr.Zero;
    InitializeProcThreadAttributeList(IntPtr.Zero,includeJob?2:1,0,ref size);
    if(size.ToInt64()<=0 || size.ToInt64()>65536) throw Error("synthetic-attribute-size");
    IntPtr list=Marshal.AllocHGlobal(size),jobs=IntPtr.Zero,handles=IntPtr.Zero;
    bool initialized=false;
    try {
      jobs=Marshal.AllocHGlobal(IntPtr.Size); handles=Marshal.AllocHGlobal(2*IntPtr.Size);
      Native(InitializeProcThreadAttributeList(list,includeJob?2:1,0,ref size)); initialized=true;
      Marshal.WriteIntPtr(jobs,job);
      Marshal.WriteIntPtr(handles,0,browserRead); Marshal.WriteIntPtr(handles,IntPtr.Size,browserWrite);
      if(includeJob) Native(UpdateProcThreadAttribute(list,0,new IntPtr(0x0002000D),jobs,new IntPtr(IntPtr.Size),IntPtr.Zero,IntPtr.Zero));
      Native(UpdateProcThreadAttribute(list,0,new IntPtr(0x00020002),handles,new IntPtr(2*IntPtr.Size),IntPtr.Zero,IntPtr.Zero));
      STARTUPINFOEX startup=new STARTUPINFOEX();
      startup.startup.cb=Marshal.SizeOf(typeof(STARTUPINFOEX)); startup.attributes=list;
      string args="\""+installation.Executable+"\" --remote-debugging-pipe --remote-debugging-io-pipes="+
        HandleArgument(browserRead)+","+HandleArgument(browserWrite);
      string application=variant==4?installation.SyntheticStableImagePath():
        variant==3?installation.Executable:installation.ExecutableNativePath;
      string directory=variant==1?Path.GetDirectoryName(installation.Executable):installation.ExecutableNativeDirectory;
      if(directory.Length>=260) throw Error("synthetic-directory-bound");
      installation.AssertCurrent();
      PROCESS_INFORMATION info; creationPhase=CreationPhase.Unknown;
      bool created=CreateProcess(application,new StringBuilder(args),IntPtr.Zero,IntPtr.Zero,true,
        0x00080000,IntPtr.Zero,directory,ref startup,out info);
      uint error=created?0:unchecked((uint)Marshal.GetLastWin32Error());
      result.Created=created; result.Error=error;
      if(!created) {
        if(info.process!=IntPtr.Zero || info.thread!=IntPtr.Zero || info.processId!=0 || info.threadId!=0)
          throw Error("synthetic-unknown-output");
        creationPhase=CreationPhase.ReturnedFalse;
        result.JobEmpty=JobCount()==0; result.NoProcessCreated=true;
        return result;
      }
      root=info.process; rootThread=info.thread; rootPid=info.processId;
      creationPhase=CreationPhase.RootRetained;
      if(root==IntPtr.Zero || rootThread==IntPtr.Zero || rootPid==0) throw Error("synthetic-process-output");
      bool contained; Native(IsProcessInJob(root,job,out contained));
      if(contained!=includeJob) throw Error("synthetic-membership");
      Close(ref rootThread);
      if(WaitForSingleObject(root,10000)!=0) throw Error("synthetic-child-not-exited");
      uint exitCode; Native(GetExitCodeProcess(root,out exitCode)); result.ExitCode=exitCode;
      result.OriginalRootExited=RootExited(); result.JobEmpty=JobCount()==0;
      if(exitCode!=0 || !result.OriginalRootExited || !result.JobEmpty) throw Error("synthetic-child-result");
      installation.AssertCurrent();
      return result;
    } finally {
      launchSettled=true;
      if(initialized) DeleteProcThreadAttributeList(list);
      if(handles!=IntPtr.Zero) Marshal.FreeHGlobal(handles);
      if(jobs!=IntPtr.Zero) Marshal.FreeHGlobal(jobs);
      Marshal.FreeHGlobal(list);
    }
  }
'@
foreach ($marker in @($installationMarker,$ownerMarker)) {
  if ($native.IndexOf($marker,[StringComparison]::Ordinal) -lt 0 -or
      $native.IndexOf($marker,[StringComparison]::Ordinal) -ne $native.LastIndexOf($marker,[StringComparison]::Ordinal)) {
    throw 'synthetic-launch-insertion-marker'
  }
}
$native = $native.Replace($installationMarker,$installationTest+"`n"+$installationMarker)
$native = $native.Replace($ownerMarker,$ownerTest+"`n"+$ownerMarker)
Add-Type -TypeDefinition $native
$directory = [EasyedaDiagnosticInstallation]::SyntheticDirectory()
$executable = Join-Path $directory 'synthetic-noop.exe'
if ([IO.File]::Exists($executable)) {throw 'synthetic-launch-child-exists'}
# The child validates its two arguments, waits a fixed second so the shared
# creator can finish live identity checks, then exits. No pipe, design or child I/O.
$childSource = @'
public static class SyntheticNoop {
  public static int Main(string[] args) {
    if(args.Length!=2 || args[0]!="--remote-debugging-pipe" ||
      !System.Text.RegularExpressions.Regex.IsMatch(args[1],
        @"\A--remote-debugging-io-pipes=[0-9]{1,10},[0-9]{1,10}\z")) return 23;
    System.Threading.Thread.Sleep(1000);
    return 0;
  }
}
'@
Add-Type -TypeDefinition $childSource -OutputAssembly $executable -OutputType ConsoleApplication
$childBytes = Read-BoundedFile $executable 1048576
$hash = [Security.Cryptography.SHA256]::Create()
try {$childHash = [BitConverter]::ToString($hash.ComputeHash($childBytes)).Replace('-','').ToLowerInvariant()}
finally {$hash.Dispose()}
$results = [EasyedaDiagnosticOwner]::VerifySyntheticLaunch($executable,$childBytes.Length,$childHash,[bool]$StableImagePathProbe,[bool]$VerifiedImageProbe)
@{schema='easyeda-pro-control.pcb-diagnostic-synthetic-launch.v1';helperSha256=$helperHash;
  childSha256=$childHash;fixtureDirectory=$directory;results=@($results);
  easyedaLaunched=$false;productionFilesAccessed=$false;forcedTermination=$false} |
  ConvertTo-Json -Depth 5 -Compress
# Retain the exact generated child for review; no recursive or automatic deletion.
