param([string]$Nonce, [string]$SourceWindowsPath, [string]$ExpectedSha256, [long]$ExpectedBytes, [switch]$CompileOnly)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
# Fresh read-only handles for one earlier generated private TEMP file. No
# application launch, process adoption/termination, SQLite attach/write or delete.
Add-Type @'
using System;
using System.ComponentModel;
using System.IO;
using System.Runtime.InteropServices;
using System.Security.AccessControl;
using System.Security.Cryptography;
using System.Security.Principal;
using System.Text;
using Microsoft.Win32.SafeHandles;
public sealed class ClosedGeneratedFixtureObservation {
  public string leaseId, windowsPath, parentDirectory, directoryIdentity, fileIdentity, sha256, watchState;
  public long bytes, createdEpochMs, modifiedEpochMs;
  public bool privateDirectoryOwnerVerified, readOnlyFileLease, oldRuntimeAdopted;
}
public sealed class ClosedGeneratedFixtureReadLease : IDisposable {
  [StructLayout(LayoutKind.Sequential)] struct INFO {
    public uint attributes; public System.Runtime.InteropServices.ComTypes.FILETIME created, accessed, written;
    public uint volume, sizeHigh, sizeLow, links, indexHigh, indexLow;
  }
  [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)] static extern SafeFileHandle CreateFileW(string path,uint access,uint share,IntPtr security,uint disposition,uint flags,IntPtr template);
  [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)] static extern uint GetFinalPathNameByHandleW(SafeFileHandle file,StringBuilder path,uint maximum,uint flags);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool GetFileInformationByHandle(SafeFileHandle file,out INFO info);
  SafeFileHandle temp,directory,file; ManagedFixtureLibraryGuard watch;
  readonly string original,tempPath,directoryPath,sddl,expectedSha;
  readonly INFO directoryInfo,fileInfo;
  readonly long expectedBytes;
  public readonly string Id=Guid.NewGuid().ToString("N");
  bool finished;
  static SafeFileHandle Open(string path,bool isDirectory) {
    // Source file shares READ only: no writer or delete/rename sharing. The
    // Original TEMP/private directory handles deny replacement by deletion.
    SafeFileHandle handle=CreateFileW(path,isDirectory?0x80u:0x80000000u,isDirectory?3u:1u,IntPtr.Zero,3,isDirectory?0x02200000u:0x08200000u,IntPtr.Zero);
    int error=Marshal.GetLastWin32Error();
    if(handle.IsInvalid){handle.Dispose();throw new Win32Exception(error);}
    INFO info;
    if(!GetFileInformationByHandle(handle,out info)||(info.attributes&0x400)!=0||((info.attributes&0x10)!=0)!=isDirectory){handle.Dispose();throw new InvalidOperationException("closed-data-reparse-or-kind");}
    return handle;
  }
  static INFO Information(SafeFileHandle handle) { INFO info;if(handle==null||handle.IsClosed||!GetFileInformationByHandle(handle,out info))throw new InvalidOperationException("closed-data-original-handle");return info; }
  static string Canonical(SafeFileHandle handle) {
    StringBuilder value=new StringBuilder(2048);uint count=GetFinalPathNameByHandleW(handle,value,2048,0);
    if(count==0||count>=2048)throw new Win32Exception(Marshal.GetLastWin32Error());string path=value.ToString();
    if(!path.StartsWith(@"\\?\")||path.StartsWith(@"\\?\UNC\"))throw new InvalidOperationException("closed-data-nondrive");
    return path.Substring(4).TrimEnd('\\');
  }
  static string Identity(INFO info){return info.volume.ToString("x8")+":"+info.indexHigh.ToString("x8")+info.indexLow.ToString("x8");}
  static long Size(INFO info){return checked(((long)info.sizeHigh<<32)|info.sizeLow);}
  static long Epoch(System.Runtime.InteropServices.ComTypes.FILETIME value){long raw=((long)(uint)value.dwHighDateTime<<32)|(uint)value.dwLowDateTime;return checked((DateTime.FromFileTimeUtc(raw).Ticks-621355968000000000L)/10000L);}
  static bool Same(INFO before,INFO after){return before.volume==after.volume&&before.indexHigh==after.indexHigh&&before.indexLow==after.indexLow&&before.attributes==after.attributes&&before.links==after.links&&Size(before)==Size(after)&&before.created.dwHighDateTime==after.created.dwHighDateTime&&before.created.dwLowDateTime==after.created.dwLowDateTime&&before.written.dwHighDateTime==after.written.dwHighDateTime&&before.written.dwLowDateTime==after.written.dwLowDateTime;}
  string Security(){return new DirectoryInfo(directoryPath).GetAccessControl(AccessControlSections.Access|AccessControlSections.Owner).GetSecurityDescriptorSddlForm(AccessControlSections.Access|AccessControlSections.Owner);}
  string Hash(){
    bool retained=false;file.DangerousAddRef(ref retained);
    try{using(SafeFileHandle borrowed=new SafeFileHandle(file.DangerousGetHandle(),false))using(FileStream input=new FileStream(borrowed,FileAccess.Read,1048576,false))using(SHA256 hash=SHA256.Create()){
      input.Position=0;if(input.Length!=expectedBytes)throw new InvalidOperationException("closed-data-file-size");return BitConverter.ToString(hash.ComputeHash(input)).Replace("-","").ToLowerInvariant();}}
    finally{if(retained)file.DangerousRelease();}
  }
  public ClosedGeneratedFixtureReadLease(string path,string sha,long bytes){
    try{
      if(path==null||path.Length>1024||sha==null||!System.Text.RegularExpressions.Regex.IsMatch(sha,@"\A[a-f0-9]{64}\z")||bytes<512||bytes>67108864)throw new InvalidOperationException("closed-data-input");
      if(!System.Text.RegularExpressions.Regex.IsMatch(path,@"\A[A-Z]:\\(?:[A-Za-z0-9_ -]+\\)*CodexEasyedaFixture_[a-f0-9]{32}\\Codex_(?:via_only|line_and_via|arc_line_and_via|schematic|circular_smt_pad|schematic_relevance)_[a-f0-9]{16}\.eprj2\z"))throw new InvalidOperationException("closed-data-fixed-generated-path");
      temp=Open(System.IO.Path.GetTempPath().TrimEnd('\\'),true);tempPath=Canonical(temp);
      directoryPath=System.IO.Path.GetDirectoryName(path);
      if(System.IO.Path.GetDirectoryName(directoryPath)!=tempPath)throw new InvalidOperationException("closed-data-current-temp-parent");
      directory=Open(directoryPath,true);directoryInfo=Information(directory);
      if(Canonical(directory)!=directoryPath)throw new InvalidOperationException("closed-data-directory-alias");
      string sid=WindowsIdentity.GetCurrent().User.Value;DirectorySecurity expected=new DirectorySecurity();expected.SetSecurityDescriptorSddlForm("O:"+sid+"D:P(A;OICI;FA;;;"+sid+")(A;OICI;FA;;;SY)");
      DirectorySecurity actual=new DirectoryInfo(directoryPath).GetAccessControl();sddl=Security();
      if(!actual.AreAccessRulesProtected||actual.GetOwner(typeof(SecurityIdentifier)).Value!=sid||sddl!=expected.GetSecurityDescriptorSddlForm(AccessControlSections.Access|AccessControlSections.Owner))throw new InvalidOperationException("closed-data-private-directory-security");
      watch=new ManagedFixtureLibraryGuard(directoryPath);file=Open(path,false);fileInfo=Information(file);original=Canonical(file);expectedSha=sha;expectedBytes=bytes;
      if(original!=path||fileInfo.links!=1||Size(fileInfo)!=bytes||Epoch(fileInfo.created)<1||Epoch(fileInfo.written)<1)throw new InvalidOperationException("closed-data-file-identity");
      Check();
    }catch{Dispose();throw;}
  }
  public ClosedGeneratedFixtureObservation Check(){
    if(finished||temp==null||directory==null||file==null||Canonical(temp)!=tempPath||Canonical(directory)!=directoryPath||Canonical(file)!=original||!Same(directoryInfo,Information(directory))||!Same(fileInfo,Information(file))||Security()!=sddl)throw new InvalidOperationException("closed-data-owner-drift");
    ManagedFixtureLibraryObservation names=watch.Check();
    if(names.names.Length!=1||names.names[0]!=System.IO.Path.GetFileName(original))throw new InvalidOperationException("closed-data-complete-roster");
    string hash=Hash();if(hash!=expectedSha||!Same(fileInfo,Information(file)))throw new InvalidOperationException("closed-data-original-content-drift");watch.Check();
    return new ClosedGeneratedFixtureObservation{leaseId=Id,windowsPath=original,parentDirectory=directoryPath,directoryIdentity=Identity(directoryInfo),fileIdentity=Identity(fileInfo),sha256=hash,bytes=expectedBytes,
      createdEpochMs=Epoch(fileInfo.created),modifiedEpochMs=Epoch(fileInfo.written),watchState="pending",privateDirectoryOwnerVerified=true,readOnlyFileLease=true,oldRuntimeAdopted=false};
  }
  public ClosedGeneratedFixtureObservation Finish(){ClosedGeneratedFixtureObservation result=Check();watch.Finish();if(!Same(fileInfo,Information(file))||Hash()!=expectedSha||Canonical(file)!=original)throw new InvalidOperationException("closed-data-final-file-drift");finished=true;result.watchState="cancelled-no-changes";return result;}
  public bool HandlesClosed{get{return (file==null||file.IsClosed)&&(directory==null||directory.IsClosed)&&(temp==null||temp.IsClosed);}}
  public void Dispose(){if(watch!=null)watch.Dispose();if(file!=null)file.Dispose();if(directory!=null)directory.Dispose();if(temp!=null)temp.Dispose();}
}
public sealed class ManagedFixtureLibraryObservation {
  public string windowsDirectory, directoryIdentity, watchState;
  public string[] names;
}
public sealed class ManagedFixtureLibraryGuard : IDisposable {
  [StructLayout(LayoutKind.Sequential)] struct INFO {
    public uint attributes; public System.Runtime.InteropServices.ComTypes.FILETIME created, accessed, written;
    public uint volume, sizeHigh, sizeLow, links, indexHigh, indexLow;
  }
  [StructLayout(LayoutKind.Sequential)] struct OVERLAPPED {
    public UIntPtr internalValue, internalHigh; public uint offset, offsetHigh; public IntPtr eventHandle;
  }
  [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)] static extern SafeFileHandle CreateFileW(string name, uint access, uint share, IntPtr security, uint disposition, uint flags, IntPtr template);
  [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)] static extern uint GetFinalPathNameByHandleW(SafeFileHandle file, StringBuilder name, uint maximum, uint flags);
  [DllImport("kernel32.dll", SetLastError=true)] static extern bool GetFileInformationByHandle(SafeFileHandle file, out INFO info);
  [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)] static extern IntPtr CreateEventW(IntPtr attributes, bool manualReset, bool initialState, string name);
  [DllImport("kernel32.dll", SetLastError=true)] static extern bool ReadDirectoryChangesW(SafeFileHandle directory, IntPtr buffer, uint size, bool subtree, uint filter, IntPtr returned, IntPtr overlapped, IntPtr completion);
  [DllImport("kernel32.dll", SetLastError=true)] static extern bool GetOverlappedResult(SafeFileHandle file, IntPtr overlapped, out uint returned, bool wait);
  [DllImport("kernel32.dll", SetLastError=true)] static extern bool CancelIoEx(SafeFileHandle file, IntPtr overlapped);
  [DllImport("kernel32.dll", SetLastError=true)] static extern uint WaitForSingleObject(IntPtr handle, uint milliseconds);
  [DllImport("kernel32.dll", SetLastError=true)] static extern bool CloseHandle(IntPtr handle);
  SafeFileHandle directory;
  IntPtr buffer, overlapped, eventHandle;
  readonly string original, identity;
  readonly string[] names;
  bool started, settled;
  string Canonical() {
    StringBuilder result = new StringBuilder(2048); uint count = GetFinalPathNameByHandleW(directory, result, 2048, 0);
    if (count == 0 || count >= 2048 || !result.ToString().StartsWith(@"\\?\")) throw new InvalidOperationException("fixture-library-canonical-path");
    return result.ToString().Substring(4);
  }
  string Identity() {
    INFO info;
    if (!GetFileInformationByHandle(directory, out info) || (info.attributes & 0x10) == 0 || (info.attributes & 0x400) != 0) throw new InvalidOperationException("fixture-library-reparse-or-nondirectory");
    return info.volume.ToString("x8") + ":" + info.indexHigh.ToString("x8") + info.indexLow.ToString("x8");
  }
  string[] Names() {
    string[] paths = Directory.GetFileSystemEntries(original);
    if (paths.Length > 64) throw new InvalidOperationException("fixture-library-roster-budget");
    string[] result = new string[paths.Length];
    for (int i=0; i<paths.Length; i++) {
      result[i] = System.IO.Path.GetFileName(paths[i]);
      if (result[i].Length < 1 || result[i].Length > 128 || result[i].EndsWith(".elib", StringComparison.OrdinalIgnoreCase)) throw new InvalidOperationException("fixture-library-system-candidate-not-excluded");
    }
    Array.Sort(result, StringComparer.Ordinal); return result;
  }
  void Pending() {
    uint returned;
    if (!started || settled || GetOverlappedResult(directory, overlapped, out returned, false) || Marshal.GetLastWin32Error() != 996) throw new InvalidOperationException("fixture-library-name-change-or-watch-failure");
  }
  public ManagedFixtureLibraryGuard(string path) {
    try {
      if (!System.Text.RegularExpressions.Regex.IsMatch(path, @"^[A-Z]:\\(?:[A-Za-z0-9_ -]+\\)*[A-Za-z0-9_ -]+$") || path.EndsWith(" ")) throw new InvalidOperationException("fixture-library-path-grammar");
      // FILE_LIST_DIRECTORY, read/write sharing without delete sharing, and an
      // original overlapped read. No notification buffer is ever rearmed/reset.
      directory = CreateFileW(path, 1, 3, IntPtr.Zero, 3, 0x42200000, IntPtr.Zero);
      if (directory.IsInvalid) throw new Win32Exception(Marshal.GetLastWin32Error());
      original = Canonical(); identity = Identity();
      if (original != path) throw new InvalidOperationException("fixture-library-path-alias");
      eventHandle = CreateEventW(IntPtr.Zero, true, false, null);
      if (eventHandle == IntPtr.Zero) throw new Win32Exception(Marshal.GetLastWin32Error());
      buffer = Marshal.AllocHGlobal(65536); overlapped = Marshal.AllocHGlobal(Marshal.SizeOf(typeof(OVERLAPPED)));
      OVERLAPPED data = new OVERLAPPED(); data.eventHandle = eventHandle; Marshal.StructureToPtr(data, overlapped, false);
      bool queued = ReadDirectoryChangesW(directory, buffer, 65536, false, 3, IntPtr.Zero, overlapped, IntPtr.Zero);
      if (!queued && Marshal.GetLastWin32Error() != 997) throw new Win32Exception(Marshal.GetLastWin32Error());
      started = true; Pending(); names = Names(); Check();
    } catch { Dispose(); throw; }
  }
  public ManagedFixtureLibraryObservation Check() {
    if (directory == null || directory.IsClosed || Canonical() != original || Identity() != identity) throw new InvalidOperationException("fixture-library-original-owner-lost");
    Pending(); string[] current = Names(); Pending();
    if (current.Length != names.Length) throw new InvalidOperationException("fixture-library-roster-drift");
    for (int i=0; i<current.Length; i++) if (current[i] != names[i]) throw new InvalidOperationException("fixture-library-roster-drift");
    return new ManagedFixtureLibraryObservation { windowsDirectory=original, directoryIdentity=identity, names=current, watchState="pending" };
  }
  public ManagedFixtureLibraryObservation Finish() {
    ManagedFixtureLibraryObservation result = Check();
    bool requested = CancelIoEx(directory, overlapped); int cancelError = Marshal.GetLastWin32Error();
    if (!requested && cancelError != 1168) throw new Win32Exception(cancelError);
    if (WaitForSingleObject(eventHandle, 5000) != 0) throw new InvalidOperationException("fixture-library-original-watch-not-settled");
    uint returned; bool completed = GetOverlappedResult(directory, overlapped, out returned, false); int error = Marshal.GetLastWin32Error(); settled = true;
    // Cancel acknowledgement alone is insufficient: successful notification,
    // zero-byte overflow, or any other status refuses the exclusion proof.
    if (completed || error != 995) throw new InvalidOperationException("fixture-library-name-change-before-original-watch-cancellation");
    result.watchState = "cancelled-no-changes"; return result;
  }
  public void Dispose() {
    if (directory != null && !directory.IsClosed && started && !settled) {
      CancelIoEx(directory, overlapped);
      if (WaitForSingleObject(eventHandle, 5000) == 0) { uint returned; GetOverlappedResult(directory, overlapped, out returned, false); settled = true; }
    }
    if (directory != null) directory.Dispose();
    // Do not free a buffer with an unobserved outstanding original operation.
    // Process exit owns the exceptional allocation; no exclusion is issued.
    if (!started || settled) {
      if (buffer != IntPtr.Zero) Marshal.FreeHGlobal(buffer);
      if (overlapped != IntPtr.Zero) Marshal.FreeHGlobal(overlapped);
      if (eventHandle != IntPtr.Zero) CloseHandle(eventHandle);
      buffer = overlapped = eventHandle = IntPtr.Zero;
    }
  }
}
'@
if ($CompileOnly) { exit 0 }
if ($Nonce -cnotmatch '^[a-f0-9]{64}$') { throw 'closed-data-nonce' }
$owner=$null
try {
  $schema='easyeda-pro-control.closed-generated-file-lease.v1'
  if ($SourceWindowsPath -cmatch '\\Codex_(?:circular_smt_pad|schematic_relevance)_[a-f0-9]{16}\.eprj2$') { $schema='easyeda-pro-control.closed-generated-alternative-file-lease.v1' }
  $owner=New-Object ClosedGeneratedFixtureReadLease($SourceWindowsPath,$ExpectedSha256,$ExpectedBytes)
  $data=$owner.Check()
  @{schema=$schema;nonce=$Nonce;state='held';observation=$data;originalHandlesClosed=$false;filesDeleted=$false} | ConvertTo-Json -Compress -Depth 5 | ForEach-Object {[Console]::WriteLine($_)}
  $previous=0
  while ($null -ne ($line=[Console]::ReadLine())) {
    if ($line.Length -gt 4096) { throw 'closed-data-request-bound' }
    $request=$line | ConvertFrom-Json
    if (@($request.PSObject.Properties.Name).Count -ne 3 -or $request.nonce -cne $Nonce -or $request.id -isnot [int] -or $request.id -ne $previous+1 -or $request.id -gt 16 -or $request.action -isnot [string]) { throw 'closed-data-request' }
    $previous=$request.id
    if ($request.action -ceq 'inspect') { $data=$owner.Check(); $state='held';$closed=$false }
    elseif ($request.action -ceq 'release') { $data=$owner.Finish();$owner.Dispose();$state='released';$closed=$owner.HandlesClosed;if(-not $closed){throw 'closed-data-handles-still-open'} }
    else { throw 'closed-data-action' }
    @{schema=$schema;nonce=$Nonce;requestId=$previous;state=$state;observation=$data;originalHandlesClosed=$closed;filesDeleted=$false} | ConvertTo-Json -Compress -Depth 5 | ForEach-Object {[Console]::WriteLine($_)}
    if ($state -ceq 'released') { break }
  }
} finally { if ($null -ne $owner) { $owner.Dispose() } }
