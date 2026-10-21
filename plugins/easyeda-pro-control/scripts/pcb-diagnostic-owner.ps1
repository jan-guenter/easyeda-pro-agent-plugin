param([switch]$CompileOnly,[switch]$StringPrecreate)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
# Separate diagnostic owner. The ordinary no-argument launcher is unchanged.
# Electron requests Browser::Quit on pipe disconnect. Never dispose live pipes,
# including after malformed requests, stdin EOF or an abandoned facade.
Add-Type @'
using System;
using System.ComponentModel;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using Microsoft.Win32.SafeHandles;
// Independent native ancestry/file proof. Every component is retained without
// write/delete sharing until the original Job exits. Ordinary child-file writes
// remain possible; replacement or reparse changes of the leased objects do not.
public sealed class EasyedaDiagnosticInstallation {
  [StructLayout(LayoutKind.Sequential)] struct INFO { public uint attributes,createdLow,createdHigh,accessLow,accessHigh,writeLow,writeHigh,volume,sizeHigh,sizeLow,links,idHigh,idLow; }
  [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern IntPtr CreateFile(string path,uint access,uint share,IntPtr security,uint disposition,uint flags,IntPtr template);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool GetFileInformationByHandle(IntPtr handle,out INFO info);
  [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern uint GetFinalPathNameByHandle(IntPtr handle,StringBuilder output,uint size,uint flags);
  [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern uint GetDriveType(string path);
  [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern uint QueryDosDevice(string name,char[] output,int size);
  [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern bool QueryFullProcessImageName(IntPtr process,uint flags,StringBuilder output,ref uint size);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool CloseHandle(IntPtr handle);
  sealed class Lease { internal IntPtr Handle; internal string Path,Mapping,GuidPath; internal bool Directory; internal INFO Before; }
  readonly List<Lease> leases=new List<Lease>();
  bool consumed,admitted,released;
  public string Executable { get; private set; }
  public string ExecutableNativePath { get; private set; }
  public string ExecutableNativeDirectory { get; private set; }
  public string ExecutableHash { get; private set; }
  static Exception Error(string reason) { return new InvalidOperationException("pcb-diagnostic-installation-"+reason); }
  static void Need(bool value,string reason) { if(!value) throw Error(reason); }
  public static void ValidatePath(string path) {
    Need(path!=null && path.Length>=4 && path.Length<=240 && System.Text.RegularExpressions.Regex.IsMatch(path,@"\A[A-Z]:\\"),"path");
    Need(Path.GetFullPath(path)==path && path.IndexOf('/')<0,"canonical-path");
    string[] parts=path.Substring(3).Split('\\');
    foreach(string part in parts) Need(part.Length>0 && part.Length<=120 && part.Trim()==part && !part.EndsWith(".",StringComparison.Ordinal) &&
      part.IndexOfAny(Path.GetInvalidFileNameChars())<0 && part.IndexOf((char)127)<0 && !System.Text.RegularExpressions.Regex.IsMatch(part,@"\A(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|\z)",System.Text.RegularExpressions.RegexOptions.IgnoreCase),"component");
  }
  static string Mapping(string path) {
    Need(GetDriveType(path.Substring(0,3))==3,"drive");
    char[] output=new char[512]; uint count=QueryDosDevice(path.Substring(0,2),output,output.Length);
    Need(count>2 && count<=output.Length,"mapping");
    string value=new string(output,0,(int)count).TrimEnd('\0');
    Need(System.Text.RegularExpressions.Regex.IsMatch(value,@"\A\\Device\\HarddiskVolume[0-9]{1,10}\z"),"direct-drive");
    return value;
  }
  static string FinalPath(IntPtr handle,uint flags) {
    StringBuilder value=new StringBuilder(512); uint count=GetFinalPathNameByHandle(handle,value,512,flags);
    Need(count>0 && count<512 && count==value.Length,"final-path"); return value.ToString();
  }
  static INFO Facts(Lease lease) {
    INFO info; Need(GetFileInformationByHandle(lease.Handle,out info),"facts");
    Need((info.attributes&0x400)==0 && (info.attributes&0x1000)==0 && ((info.attributes&0x10)!=0)==lease.Directory,"kind");
    Need(info.links>0 && (info.idHigh!=0 || info.idLow!=0),"file-id");
    Need(String.Equals(FinalPath(lease.Handle,0),@"\\?\"+lease.Path,StringComparison.OrdinalIgnoreCase),"retained-name");
    string guidPath=FinalPath(lease.Handle,1);
    Need(System.Text.RegularExpressions.Regex.IsMatch(guidPath,@"\A\\\\\?\\Volume\{[a-fA-F0-9-]{36}\}\\"),"volume-guid");
    if(lease.GuidPath==null) lease.GuidPath=guidPath; else Need(lease.GuidPath==guidPath,"volume-guid-drift");
    return info;
  }
  static void Same(INFO before,INFO after,bool directory) {
    Need(before.volume==after.volume && before.idHigh==after.idHigh && before.idLow==after.idLow && before.attributes==after.attributes,"identity");
    // Directory membership and timestamps can change during ordinary startup.
    if(!directory) Need(before.sizeHigh==after.sizeHigh && before.sizeLow==after.sizeLow && before.writeHigh==after.writeHigh && before.writeLow==after.writeLow && before.links==after.links,"file-changed");
  }
  Lease Open(string path,bool directory) {
    foreach(Lease existing in leases) if(String.Equals(existing.Path,path,StringComparison.OrdinalIgnoreCase)) { Need(existing.Directory==directory,"alias"); return existing; }
    Need(leases.Count<80,"lease-bound");
    string mapping=Mapping(path);
    // OPEN_REPARSE_POINT prevents following the leaf; earlier ancestors are
    // already retained with delete sharing denied before this component opens.
    Lease lease=new Lease(); lease.Path=path; lease.Directory=directory; lease.Mapping=mapping;
    leases.Add(lease); // Allocate retention before the native acquisition.
    lease.Handle=CreateFile(path,directory?0x80u:0x80000000u,1u,IntPtr.Zero,3,0x02200000,IntPtr.Zero);
    if(lease.Handle==new IntPtr(-1)) { lease.Handle=IntPtr.Zero; throw Error("open"); }
    Need(lease.Handle!=IntPtr.Zero,"open");
    lease.Before=Facts(lease); Need(Mapping(path)==mapping,"mapping-drift");
    foreach(Lease ancestor in leases) if(ancestor!=lease && String.Equals(ancestor.Path,path.Substring(0,3),StringComparison.OrdinalIgnoreCase)) Need(ancestor.Before.volume==lease.Before.volume,"ancestor-volume");
    return lease;
  }
  void Ancestors(string path) {
    Open(path.Substring(0,3),true);
    int index=path.IndexOf('\\',3);
    while(index>=0) { Open(path.Substring(0,index),true); index=path.IndexOf('\\',index+1); }
  }
  void Pin(string path,long bytes,string expectedHash) {
    ValidatePath(path); Need(bytes>0 && bytes<=1073741824L && System.Text.RegularExpressions.Regex.IsMatch(expectedHash??"",@"\A[a-f0-9]{64}\z"),"pin");
    Ancestors(path); Lease lease=Open(path,false);
    Need(((long)lease.Before.sizeHigh<<32)+lease.Before.sizeLow==bytes,"size");
    // SafeFileHandle does not own this retained handle. FileStream disposal must
    // never release the lease that guards the future native CreateProcess call.
    using(SafeFileHandle borrowed=new SafeFileHandle(lease.Handle,false))
    using(FileStream stream=new FileStream(borrowed,FileAccess.Read,65536,false))
    using(SHA256 hash=SHA256.Create()) {
      string actual=BitConverter.ToString(hash.ComputeHash(stream)).Replace("-","").ToLowerInvariant();
      Need(stream.Position==bytes && actual==expectedHash,"hash");
    }
    Same(lease.Before,Facts(lease),false);
  }
  void BindNativePaths(string executable,string directory) {
    Need(ExecutableNativePath==null && ExecutableNativeDirectory==null,"native-paths-bound");
    foreach(Lease lease in leases) {
      if(!lease.Directory && String.Equals(lease.Path,executable,StringComparison.OrdinalIgnoreCase)) ExecutableNativePath=lease.GuidPath;
      if(lease.Directory && String.Equals(lease.Path,directory,StringComparison.OrdinalIgnoreCase)) ExecutableNativeDirectory=lease.GuidPath;
    }
    // Both values come from retained kernel handles. Do not feed a volume-GUID
    // path through .NET Framework's target-dependent legacy Path normalizer.
    Need(ExecutableNativePath!=null && ExecutableNativeDirectory!=null,"executable-lease");
  }
  public void Admit(string[] paths,long[] sizes,string[] hashes) {
    Need(!consumed,"consumed"); consumed=true;
    Need(Environment.OSVersion.Platform==PlatformID.Win32NT && IntPtr.Size==8 && BitConverter.IsLittleEndian,"host");
    Need(paths!=null && sizes!=null && hashes!=null && paths.Length==5 && sizes.Length==5 && hashes.Length==5,"plan");
    foreach(string path in paths) ValidatePath(path);
    Need(Path.GetFileName(paths[0])=="easyeda-pro.exe","executable");
    string root=Path.GetDirectoryName(paths[0]);
    Need(paths[1]==Path.Combine(root,@"resources\app\app.js") && paths[2]==Path.Combine(root,@"resources\app\package.json") && paths[3]==Path.Combine(root,@"resources\app\editor.ini") &&
      paths[4]==@"C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe","layout");
    Need(sizes[4]<=16777216,"powershell-bound");
    for(int i=0;i<paths.Length;i++) Pin(paths[i],sizes[i],hashes[i]);
    using(Process self=Process.GetCurrentProcess()) {
      StringBuilder image=new StringBuilder(512); uint count=512;
      Need(QueryFullProcessImageName(self.Handle,0,image,ref count) && count==image.Length && String.Equals(image.ToString(),paths[4],StringComparison.OrdinalIgnoreCase),"powershell-image");
    }
    Executable=paths[0]; ExecutableHash=hashes[0];
    BindNativePaths(Executable,root); admitted=true; AssertCurrent();
  }
  public void AssertCurrent() {
    Need(admitted && !released,"not-admitted");
    foreach(Lease lease in leases) { Same(lease.Before,Facts(lease),lease.Directory); Need(Mapping(lease.Path)==lease.Mapping,"mapping-drift"); }
  }
  // Check the created image while its original primary thread is suspended.
  // This compares native device paths, not a newly resolved drive-letter alias.
  // Retained file/ancestor leases prevent replacement of the expected image.
  public void AssertCreatedImage(IntPtr process) {
    AssertCurrent(); Need(process!=IntPtr.Zero,"created-image-handle");
    Lease selected=null;
    foreach(Lease lease in leases) if(!lease.Directory && lease.Path==Executable) {
      Need(selected==null,"created-image-ambiguous"); selected=lease;
    }
    Need(selected!=null,"created-image-lease");
    string expected=FinalPath(selected.Handle,2);
    Need(String.Equals(expected,selected.Mapping+selected.Path.Substring(2),StringComparison.OrdinalIgnoreCase),"created-image-namespace");
    StringBuilder actual=new StringBuilder(512); uint count=512;
    Need(QueryFullProcessImageName(process,1,actual,ref count) && count>0 && count==actual.Length &&
      String.Equals(actual.ToString(),expected,StringComparison.OrdinalIgnoreCase),"created-image");
    Same(selected.Before,Facts(selected),false); AssertCurrent();
  }
  public void Release() {
    Need(!released,"release-consumed");
    for(int i=leases.Count-1;i>=0;i--) if(leases[i].Handle!=IntPtr.Zero) { Need(CloseHandle(leases[i].Handle),"close"); leases[i].Handle=IntPtr.Zero; }
    released=true;
  }
  // Windows CI only. It creates one synthetic file, never an executable child,
  // and exercises the same native lease acquisition, reproof and release paths.
  public static void VerifyLeaseSmoke() {
    foreach(string invalid in new string[] { @"C:\CON\a", @"C:\bad.\a", @"C:\bad \a", @"C:\bad:stream\a", @"C:\a\..\b", @"\\server\share\a" }) {
      bool refused=false; try { ValidatePath(invalid); } catch(InvalidOperationException) { refused=true; }
      // .NET Framework rejects this colon during GetFullPath, before our
      // component check. This is an expected refusal of this synthetic path.
      catch(NotSupportedException) { refused=invalid==@"C:\bad:stream\a"; }
      Need(refused,"smoke-invalid-path");
    }
    string directory=Path.Combine(Path.GetTempPath(),"easyeda-native-lease-"+Guid.NewGuid().ToString("N"));
    Need(!Directory.Exists(directory),"smoke-directory"); Directory.CreateDirectory(directory);
    string file=null;
    EasyedaDiagnosticInstallation owner=new EasyedaDiagnosticInstallation();
    try {
      // Hosted TEMP can use an 8.3 alias. Resolve only this freshly created
      // fixture to its normalized DOS name; production admission stays strict.
      IntPtr fixture=CreateFile(directory,0x80u,7u,IntPtr.Zero,3,0x02200000,IntPtr.Zero);
      Need(fixture!=IntPtr.Zero && fixture!=new IntPtr(-1),"smoke-directory-open");
      try {
        string normalized=FinalPath(fixture,0);
        Need(normalized.StartsWith(@"\\?\",StringComparison.Ordinal),"smoke-directory-prefix");
        string canonical=normalized.Substring(4); ValidatePath(canonical); directory=canonical;
      } finally { Need(CloseHandle(fixture),"smoke-directory-close"); }
      file=Path.Combine(directory,"synthetic.bin");
      byte[] bytes=Encoding.UTF8.GetBytes("Synthetic native lease test. No application launch.");
      using(FileStream output=new FileStream(file,FileMode.CreateNew,FileAccess.Write,FileShare.None)) output.Write(bytes,0,bytes.Length);
      string hash; using(SHA256 digest=SHA256.Create()) hash=BitConverter.ToString(digest.ComputeHash(bytes)).Replace("-","").ToLowerInvariant();
      owner.Pin(file,bytes.Length,hash); owner.BindNativePaths(file,directory); owner.admitted=true; owner.AssertCurrent();
      Need(owner.ExecutableNativePath==owner.ExecutableNativeDirectory+"\\synthetic.bin","smoke-native-directory");
      string peer=Path.Combine(directory,"peer.bin");
      using(FileStream output=new FileStream(peer,FileMode.CreateNew,FileAccess.Write,FileShare.None)) output.WriteByte(1);
      File.Delete(peer); // Holding the parent must not forbid ordinary children.
      bool writeRefused=false,renameRefused=false;
      try { using(FileStream writer=new FileStream(file,FileMode.Open,FileAccess.Write,FileShare.ReadWrite)) { } } catch(IOException) { writeRefused=true; }
      try { Directory.Move(directory,directory+"-moved"); } catch(IOException) { renameRefused=true; }
      Need(writeRefused && renameRefused,"smoke-sharing"); owner.AssertCurrent();
    } finally {
      owner.Release();
      if(file!=null && File.Exists(file)) File.Delete(file);
      if(Directory.Exists(directory)) Directory.Delete(directory);
    }
  }
}
public sealed class EasyedaDiagnosticOwner {
  [StructLayout(LayoutKind.Sequential)] struct SECURITY_ATTRIBUTES { public int length; public IntPtr descriptor; [MarshalAs(UnmanagedType.Bool)] public bool inherit; }
  [StructLayout(LayoutKind.Sequential)] struct STARTUPINFO { public int cb; public IntPtr reserved, desktop, title; public int x,y,xSize,ySize,xChars,yChars,fill,flags; public short show,reservedSize; public IntPtr reserved2,stdin,stdout,stderr; }
  [StructLayout(LayoutKind.Sequential)] struct STARTUPINFOEX { public STARTUPINFO startup; public IntPtr attributes; }
  [StructLayout(LayoutKind.Sequential)] struct PROCESS_INFORMATION { public IntPtr process,thread; public uint processId,threadId; }
  [StructLayout(LayoutKind.Sequential)] struct BASIC_LIMIT_INFORMATION { public long processTime,jobTime; public uint flags; public UIntPtr minWorking,maxWorking; public uint activeLimit; public UIntPtr affinity; public uint priority,scheduling; }
  [StructLayout(LayoutKind.Sequential)] struct RECT { public int left,top,right,bottom; }
  delegate bool WindowCallback(IntPtr hwnd, IntPtr value);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool CreatePipe(out IntPtr read,out IntPtr write,ref SECURITY_ATTRIBUTES attributes,uint size);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool SetHandleInformation(IntPtr handle,uint mask,uint flags);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool GetHandleInformation(IntPtr handle,out uint flags);
  [DllImport("kernel32.dll",SetLastError=true)] static extern uint GetFileType(IntPtr handle);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool PeekNamedPipe(IntPtr pipe,IntPtr buffer,uint size,IntPtr read,out uint available,IntPtr remaining);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool ReadFile(IntPtr handle,byte[] data,uint count,out uint read,IntPtr overlapped);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool WriteFile(IntPtr handle,byte[] data,uint count,out uint written,IntPtr overlapped);
  [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern IntPtr CreateJobObject(IntPtr attributes,string name);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool QueryInformationJobObject(IntPtr job,int kind,IntPtr data,uint size,out uint returned);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool IsProcessInJob(IntPtr process,IntPtr job,out bool contains);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool InitializeProcThreadAttributeList(IntPtr list,int count,uint flags,ref IntPtr size);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool UpdateProcThreadAttribute(IntPtr list,uint flags,IntPtr key,IntPtr value,IntPtr size,IntPtr previous,IntPtr returned);
  [DllImport("kernel32.dll")] static extern void DeleteProcThreadAttributeList(IntPtr list);
  [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern bool CreateProcess(string executable,StringBuilder command,IntPtr processAttributes,IntPtr threadAttributes,bool inheritHandles,uint flags,IntPtr environment,string directory,ref STARTUPINFOEX startup,out PROCESS_INFORMATION info);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool GetProcessTimes(IntPtr process,out long created,out long exited,out long kernel,out long user);
  [DllImport("kernel32.dll",SetLastError=true)] static extern uint GetProcessId(IntPtr process);
  [DllImport("kernel32.dll",SetLastError=true)] static extern uint ResumeThread(IntPtr thread);
  [DllImport("kernel32.dll",SetLastError=true)] static extern uint WaitForSingleObject(IntPtr handle,uint timeout);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool CloseHandle(IntPtr handle);
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr hwnd,out uint pid);
  [DllImport("user32.dll",SetLastError=true)] static extern bool EnumWindows(WindowCallback callback,IntPtr value);
  [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr hwnd);
  [DllImport("user32.dll")] static extern bool IsWindowEnabled(IntPtr hwnd);
  [DllImport("user32.dll")] static extern bool IsIconic(IntPtr hwnd);
  [DllImport("user32.dll")] static extern IntPtr GetAncestor(IntPtr hwnd,uint flags);
  [DllImport("user32.dll")] static extern IntPtr GetWindow(IntPtr hwnd,uint command);
  [DllImport("user32.dll",EntryPoint="GetWindowLongW")] static extern int GetWindowLong(IntPtr hwnd,int index);
  [DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr hwnd,out RECT rect);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern int GetClassName(IntPtr hwnd,StringBuilder value,int size);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern int GetWindowTextLength(IntPtr hwnd);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern int GetWindowText(IntPtr hwnd,StringBuilder value,int size);
  [DllImport("user32.dll",SetLastError=true)] static extern bool PostMessage(IntPtr hwnd,uint message,IntPtr wparam,IntPtr lparam);
  IntPtr job,root,rootThread,browserRead,browserWrite,parentRead,parentWrite;
  uint rootPid; long rootCreated; int nextRequest=1,received; bool launchAttempted,launchCompleted,closeAttempted,released,protocolFailed;
  enum CreationPhase { NotEntered, Unknown, ReturnedFalse, RootRetained }
  CreationPhase creationPhase; bool launchSettled; uint? createProcessError;
  readonly EasyedaDiagnosticInstallation installation=new EasyedaDiagnosticInstallation();
  readonly bool stringPrecreate;
  int RequestLimit { get { return stringPrecreate?225:103; } }
  public readonly string JobId=Guid.NewGuid().ToString("N");
  public readonly string HelperInstance=Guid.NewGuid().ToString("N");
  public uint RootPid { get { return rootPid; } }
  public string RootCreated { get { return rootCreated.ToString(CultureInfo.InvariantCulture); } }
  public uint? CreateProcessError { get { return createProcessError; } }
  static Exception Error(string reason) { return new InvalidOperationException("pcb-diagnostic-"+reason); }
  static void Native(bool value) { if(!value) throw Error("native-call"); }
  public EasyedaDiagnosticOwner() { }
  EasyedaDiagnosticOwner(bool stringPrecreatePurpose) { stringPrecreate=stringPrecreatePurpose; }
  public static EasyedaDiagnosticOwner CreateStringPrecreate() { return new EasyedaDiagnosticOwner(true); }
  public void Initialize() {
    if(job!=IntPtr.Zero || released) throw Error("initialize-consumed");
    job=CreateJobObject(IntPtr.Zero,null); if(job==IntPtr.Zero) throw Error("job-create");
    AssertLimits();
    SECURITY_ATTRIBUTES attributes=new SECURITY_ATTRIBUTES(); attributes.length=Marshal.SizeOf(typeof(SECURITY_ATTRIBUTES)); attributes.inherit=true;
    Native(CreatePipe(out browserRead,out parentWrite,ref attributes,65536));
    Native(CreatePipe(out parentRead,out browserWrite,ref attributes,65536));
    Native(SetHandleInformation(parentRead,1,0)); Native(SetHandleInformation(parentWrite,1,0));
    AssertPipes();
  }
  void AssertLimits() {
    if(job==IntPtr.Zero || released) throw Error("owner-unavailable");
    int size=Marshal.SizeOf(typeof(BASIC_LIMIT_INFORMATION)); IntPtr data=Marshal.AllocHGlobal(size);
    try { uint returned; Native(QueryInformationJobObject(job,2,data,(uint)size,out returned)); if(returned!=size || Marshal.ReadInt32(data,16)!=0) throw Error("job-limits"); }
    finally { Marshal.FreeHGlobal(data); }
  }
  void AssertPipe(IntPtr handle,bool inherited) {
    uint flags; if(handle==IntPtr.Zero || GetFileType(handle)!=3) throw Error("pipe-type");
    Native(GetHandleInformation(handle,out flags)); if((flags&1)!=(inherited?1u:0u)) throw Error("pipe-inheritance");
  }
  void AssertPipes() { AssertPipe(parentRead,false); AssertPipe(parentWrite,false); if(root==IntPtr.Zero) { AssertPipe(browserRead,true); AssertPipe(browserWrite,true); } }
  int JobCount() {
    AssertLimits(); const int maximum=512; int size=8+maximum*IntPtr.Size; IntPtr data=Marshal.AllocHGlobal(size);
    try { uint returned; Native(QueryInformationJobObject(job,3,data,(uint)size,out returned)); int assigned=Marshal.ReadInt32(data,0),count=Marshal.ReadInt32(data,4); if(assigned!=count || count<0 || count>maximum) throw Error("job-incomplete"); return count; }
    finally { Marshal.FreeHGlobal(data); }
  }
  bool RootExited() { uint state=WaitForSingleObject(root,0); if(state!=0 && state!=258) throw Error("root-wait"); return state==0; }
  void AssertCleanupLive() {
    AssertLimits(); AssertPipes(); bool contained;
    if(root==IntPtr.Zero || RootExited() || GetProcessId(root)!=rootPid) throw Error("root-not-live");
    Native(IsProcessInJob(root,job,out contained)); if(!contained) throw Error("root-identity");
    // The original kernel process handle remains sufficient for one normal
    // close after GetProcessTimes failed, but never for diagnostic execution.
    if(rootCreated!=0) { long created,exited,kernel,user; Native(GetProcessTimes(root,out created,out exited,out kernel,out user)); if(created!=rootCreated) throw Error("root-identity"); }
  }
  void AssertLive() {
    AssertCleanupLive(); if(rootCreated==0) throw Error("cleanup-only"); installation.AssertCurrent();
  }
  static void ExistingApplicationAbsent() {
    Process[] existing=Process.GetProcessesByName("easyeda-pro");
    try { foreach(Process item in existing) if(!item.HasExited) throw Error("existing-application"); }
    finally { foreach(Process item in existing) item.Dispose(); }
  }
  static string HandleArgument(IntPtr handle) { long value=handle.ToInt64(); if(value<=0 || value>uint.MaxValue) throw Error("handle-encoding"); return value.ToString(CultureInfo.InvariantCulture); }
  public void Launch(string executable,string expectedHash,string[] paths,long[] sizes,string[] hashes) {
    if(launchAttempted) throw Error("launch-consumed"); launchAttempted=true;
    try {
      AssertLimits(); AssertPipes(); if(JobCount()!=0) throw Error("job-not-empty");
      if(executable==null || !System.Text.RegularExpressions.Regex.IsMatch(executable,@"\A[A-Za-z]:\\[^\x00-\x1f\""\r\n]+\.exe\z") || Path.GetFileName(executable)!="easyeda-pro.exe" ||
         !System.Text.RegularExpressions.Regex.IsMatch(expectedHash??"",@"\A[a-f0-9]{64}\z")) throw Error("executable-input");
      installation.Admit(paths,sizes,hashes);
      if(installation.Executable!=executable || installation.ExecutableHash!=expectedHash) throw Error("installation-binding");
      installation.AssertCurrent(); ExistingApplicationAbsent();
      CreateVerifiedRoot();
    } finally { launchSettled=true; }
  }
  // Shared fixed launch core; the synthetic fixture supplies only its own
  // pinned no-op installation. Production admission remains in Launch above.
  void CreateVerifiedRoot() {
      IntPtr size=IntPtr.Zero; InitializeProcThreadAttributeList(IntPtr.Zero,2,0,ref size); if(size==IntPtr.Zero || size.ToInt64()>65536) throw Error("attribute-size");
      IntPtr list=Marshal.AllocHGlobal(size),jobs=IntPtr.Zero,handles=IntPtr.Zero; bool initialized=false;
      try {
        jobs=Marshal.AllocHGlobal(IntPtr.Size); handles=Marshal.AllocHGlobal(2*IntPtr.Size);
        Native(InitializeProcThreadAttributeList(list,2,0,ref size)); initialized=true;
        Marshal.WriteIntPtr(jobs,job); Marshal.WriteIntPtr(handles,0,browserRead); Marshal.WriteIntPtr(handles,IntPtr.Size,browserWrite);
        Native(UpdateProcThreadAttribute(list,0,new IntPtr(0x0002000D),jobs,new IntPtr(IntPtr.Size),IntPtr.Zero,IntPtr.Zero));
        Native(UpdateProcThreadAttribute(list,0,new IntPtr(0x00020002),handles,new IntPtr(2*IntPtr.Size),IntPtr.Zero,IntPtr.Zero));
        STARTUPINFOEX startup=new STARTUPINFOEX(); startup.startup.cb=Marshal.SizeOf(typeof(STARTUPINFOEX)); startup.attributes=list;
        string args="\""+installation.Executable+"\" --remote-debugging-pipe --remote-debugging-io-pipes="+HandleArgument(browserRead)+","+HandleArgument(browserWrite);
        PROCESS_INFORMATION info;
        installation.AssertCurrent();
        // This Windows tuple rejects GUID/NT image paths with error87. Use the
        // exact DOS image spelling, but CREATE_SUSPENDED prevents application
        // code from running before the ORIGINAL created image is verified
        // against the retained kernel file. Keep the GUID working directory.
        if(installation.ExecutableNativeDirectory.Length>=260) throw Error("working-directory-bound");
        // Any P/Invoke exception leaves Unknown. Only a normal false return
        // with entirely empty outputs proves the narrow failed-creation case.
        creationPhase=CreationPhase.Unknown;
        bool createdProcess=CreateProcess(installation.Executable,new StringBuilder(args),IntPtr.Zero,IntPtr.Zero,true,0x00080004,IntPtr.Zero,installation.ExecutableNativeDirectory,ref startup,out info);
        if(!createdProcess) {
          // Capture immediately, before any other P/Invoke or cleanup can
          // replace the thread's error. A code is diagnostic, never ownership.
          createProcessError=unchecked((uint)Marshal.GetLastWin32Error());
          if(info.process==IntPtr.Zero && info.thread==IntPtr.Zero && info.processId==0 && info.threadId==0) creationPhase=CreationPhase.ReturnedFalse;
          throw Error("create-process-refused");
        }
        // Keep the ORIGINAL CreateProcess process handle before any fallible work.
        root=info.process; rootThread=info.thread; rootPid=info.processId;
        creationPhase=CreationPhase.RootRetained;
        if(root==IntPtr.Zero || rootThread==IntPtr.Zero || rootPid==0) throw Error("root-output");
        long created,exited,kernel,user; Native(GetProcessTimes(root,out created,out exited,out kernel,out user)); if(created<=0) throw Error("root-created"); rootCreated=created;
        AssertLive(); installation.AssertCreatedImage(root);
        // No retry/resume endpoint exists. Failure leaves this original process
        // and thread retained, potentially suspended; no forced cleanup.
        if(ResumeThread(rootThread)!=1) throw Error("primary-thread-resume");
        Close(ref rootThread);
        // Only browser-end duplicates are closed. Parent endpoints stay owned.
        Close(ref browserRead); Close(ref browserWrite); AssertLive(); launchCompleted=true;
      } finally { if(initialized) DeleteProcThreadAttributeList(list); if(handles!=IntPtr.Zero) Marshal.FreeHGlobal(handles); if(jobs!=IntPtr.Zero) Marshal.FreeHGlobal(jobs); Marshal.FreeHGlobal(list); }
  }
  // Exact worker diagnostic program. Its complete UTF-8 bytes must match the
  // separately reviewed TypeScript leaf. No protocol request supplies code.
  const string WorkerExpression=@"(()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_WORKER_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const count=n=>{if(!Number.isSafeInteger(n)||n<0||n>65536)bad();return n;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const prototype=(o,name)=>{const p=Object.getPrototypeOf(object(o));if(p===null)bad();const c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return p;};
const project=object(own(globalThis,""PROJECT"")),lp=prototype(project,""Lg""),gp=prototype(lp,""Gd"");
if(Object.getPrototypeOf(gp)!==Object.prototype)bad();
const consistency=object(own(project,""consistencyManager""));prototype(consistency,""ja"");
const size=(value,kind)=>{object(value);const p=kind===""set""?Set.prototype:Map.prototype;if(Object.getPrototypeOf(value)!==p||Reflect.ownKeys(value).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,value,[]));};
const keys=value=>{plain(value);const names=Reflect.ownKeys(value);if(names.some(k=>typeof k!==""string""))bad();return count(names.length);};
const identity={projectUuid:id(own(project,""uuid""),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),branchUuid:id(own(project,""_branchUuid""),/^[a-f0-9]{32}$/),windowTabId:id(own(globalThis,""_TAB_ID_""),/^[A-Za-z0-9_-]{1,128}$/)};
const flags={},optionalFlags={},setSizes={},mapSizes={},watcherMapSizes={},timers={};
for(const key of [""isReady"",""isTemporary"",""isHistoryBack"",""_isV2Format"",""isOpening"",""isEstablished"",""isApplyShot"",""isUploadingCloud"",""pendingSyncCloud"",""isBatchUpload"",""debugOpen""]){const value=own(project,key);if(typeof value!==""boolean"")bad();flags[key]=value;}
for(const key of [""isSyncing"",""notSyncCloud""]){const d=Object.getOwnPropertyDescriptor(project,key);if(!d){optionalFlags[key]=""absent"";continue;}const value=own(project,key);if(value!==undefined&&typeof value!==""boolean"")bad();optionalFlags[key]=value===undefined?""undefined"":value?""true"":""false"";}
for(const key of [""task1"",""task2"",""task3"",""cachePromise"",""publishTask"",""rollbackPromise"",""syncPendingNodeUuids"",""confirmedEmptyNodeUuids"",""warnedEmptyNodeUuids""])setSizes[key]=size(own(project,key),""set"");
for(const key of [""bufferUploadData"",""bufferUploadCache"",""selectWatch"",""historyErrorNodes""])mapSizes[key]=size(own(project,key),""map"");
for(const group of [""watcherAddSet"",""watcherDeleteSet"",""watcherUpdateSet""]){const holder=plain(own(project,group)),names=Reflect.ownKeys(holder),expected=[""footprint"",""symbol"",""device"",""board"",""sch"",""sheet"",""pcb"",""panel"",""simulation""];if(names.length!==expected.length||names.some(k=>!expected.includes(k)))bad();const result={};for(const key of expected)result[key]=size(own(holder,key),""map"");watcherMapSizes[group]=result;}
for(const key of [""projectTimer"",""publishTimer"",""orderTimer""]){const value=own(project,key);if(value!==null&&value!==undefined&&(typeof value!==""number""||!Number.isSafeInteger(value)||value<0))bad();timers[key]=value===null?""null"":value===undefined?""undefined"":""present"";}
const dictionaryOwnKeyCounts={uniqueIds:keys(own(consistency,""uniqueIds"")),orderCache:keys(own(project,""orderCache""))};
if(own(globalThis,""PROJECT"")!==project||own(project,""consistencyManager"")!==consistency)bad();
return JSON.stringify({schema:""easyeda-pro-control.pcb-diagnostic-worker-state.v1"",identity,flags,optionalFlags,setSizes,mapSizes,watcherMapSizes,timers,dictionaryOwnKeyCounts});
})()";
  // Exact compiled opening function; no input provides code or method names.
  const string OpeningFunction=@"async function(target,phase){
""use strict"";
let stage=""setup"",substage=""setup"",code=""EXCEPTION"",firstFailure=null,cleanupFailure=null,dispatchAttempted=false,publicResult=null,prefixObserved=false,expired=false,timer,clear,cleanup,observation=null,outcome;
const retainFailure=(value=code)=>{if(firstFailure===null)firstFailure={stage,code:value,substage};return firstFailure;};
const bad=(value=""GUARD"")=>{code=value;retainFailure(value);throw new Error(""PCB_DIAGNOSTIC_OPENING"");};
try{
const root=globalThis,apply=Reflect.apply;
const own=(owner,key,optional=false)=>{if(owner===null||(typeof owner!==""object""&&typeof owner!==""function""))bad(""FIELD"");const d=Object.getOwnPropertyDescriptor(owner,key);if(!d){if(optional&&!(key in owner))return undefined;bad(""FIELD"");}if(!Object.hasOwn(d,""value""))bad(""FIELD"");return d.value;};
const plain=value=>{if(value===null||typeof value!==""object""||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)bad(""OBJECT"");return value;};
const text=(value,max,empty=false)=>{if(typeof value!==""string""||value.length>max||(!empty&&value.length===0)||/[\u0000-\u001F\u007F]/.test(value))bad(""TEXT"");return value;};
const matches=(value,re)=>{const m=typeof value===""string""?re.exec(value):null;return m!==null&&m[0]===value;};
plain(target);const targetKeys=[""rawWindowsPath"",""projectUuid"",""branchUuid"",""documentUuid"",""expectedSourceSha256""];
if(Reflect.ownKeys(target).length!==targetKeys.length||targetKeys.some(key=>!Object.hasOwn(target,key)))bad();
for(const key of targetKeys)text(own(target,key),4096);
if(!matches(target.projectUuid,/^[a-f0-9]{64}$/)||!matches(target.branchUuid,/^[a-f0-9]{32}$/)||!matches(target.documentUuid,/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/)||!matches(target.expectedSourceSha256,/^[a-f0-9]{64}$/)||!matches(target.rawWindowsPath,/^[A-Za-z]:\\[^\u0000-\u001F\u007F<>:""|?*/]+\.eprj2$/)||(phase!==""preflight""&&phase!==""open-project""))bad();
const dense=(value,max)=>{if(!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype)bad(""ARRAY"");const n=own(value,""length"");if(!Number.isInteger(n)||n<0||n>max||Reflect.ownKeys(value).length!==n+1)bad(""ARRAY"");for(let i=0;i<n;i++)own(value,String(i));return n;};
const method=(owner,key)=>{const chain=[];let node=owner;for(let i=0;i<4;i++){if(node===null||(typeof node!==""object""&&typeof node!==""function""))bad(""METHOD"");chain.push(node);const d=Object.getOwnPropertyDescriptor(node,key);if(d){if(!Object.hasOwn(d,""value"")||typeof d.value!==""function"")bad(""METHOD"");return{owner,key,chain,fn:d.value};}node=Object.getPrototypeOf(node);}bad(""METHOD"");};
const methodCheck=binding=>{for(let i=0;i<binding.chain.length;i++){const node=binding.chain[i];if(i>0&&Object.getPrototypeOf(binding.chain[i-1])!==node)bad(""BINDING"");if(i===binding.chain.length-1){if(own(node,binding.key)!==binding.fn)bad(""BINDING"");}else if(Object.hasOwn(node,binding.key))bad(""BINDING"");}};
const parseProjectUrl=(value,projectUuid,activeTabId)=>{
 if(typeof value!=='string'||value.length>32768||typeof projectUuid!=='string')bad();
 const projectMatch=/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/.exec(projectUuid);if(!projectMatch||projectMatch[0]!==projectUuid)bad();
 const pieces=value.split('#');if(pieces.length>2)bad();const base=pieces[0];
 const baseMatch=/^https:\/\/client\/editor\?cll=(?:trace|debug|info|warn|error)$/.exec(base);if(!baseMatch||baseMatch[0]!==base)bad();
 const fragment=pieces.length===1?'':pieces[1];
 if(fragment==='')return{base,empty:true,tabIds:[],activeTabId:null};
 const prefix='id='+projectUuid;if(fragment===prefix)return{base,empty:false,tabIds:[],activeTabId:null};
 if(!fragment.startsWith(prefix+',tab='))bad();const entries=fragment.slice(prefix.length+5).split('|');
 if(entries.length<1||entries.length>256)bad();const tabIds=[],seen=new Set();let markedTabId=null;
 for(const entry of entries){
  const match=/^(\*?)([a-f0-9]{16}|[a-f0-9]{32})@([a-f0-9]{32}|[a-f0-9]{64})$/.exec(entry);
  if(!match||match[0]!==entry||match[3]!==projectUuid)bad();const tabId=match[2]+'@'+match[3];if(seen.has(tabId))bad();seen.add(tabId);tabIds.push(tabId);
  if(match[1]==='*'){if(markedTabId!==null||(activeTabId!==undefined&&activeTabId!==null&&activeTabId!==tabId))bad();markedTabId=tabId;}
 }
 return{base,empty:false,tabIds,activeTabId:markedTabId};
};
const location=root.location,document=root.document,initialHref=location?.href,initialUrl=parseProjectUrl(initialHref,target.projectUuid);
if(!initialUrl.empty)bad(""URL"");
let retainedHref=initialHref,prefixCheck;
const ui=own(root,""UI""),host=own(root,""gVars""),tabs=own(ui,""tabBar""),mode=own(root,""PRO_EDITOR_MODE""),windowTabId=own(root,""_TAB_ID_"");
if(typeof tabs!==""function""||Object.getPrototypeOf(tabs)!==Function.prototype||!matches(windowTabId,/^[A-Za-z0-9_-]{1,128}$/))bad();
const client=plain(own(host,""client"")),initialTitle=text(document?.title,512),query=method(document,""querySelector""),meta=apply(query.fn,document,['meta[name=""editorMainVersion""]']);
if(meta?.ownerDocument!==document||meta?.nodeType!==1||meta?.localName!==""meta"")bad(""TITLE"");
const attribute=method(meta,""getAttribute""),version=text(apply(attribute.fn,meta,[""content""]),64),versionSuffix="" - V""+version;
if(!matches(version,/^\d+(?:\.\d+){1,7}$/)||initialTitle.includes("" | "")||!initialTitle.endsWith(versionSuffix)||initialTitle.length<=versionSuffix.length)bad(""TITLE"");
text(target.rawWindowsPath.slice(target.rawWindowsPath.lastIndexOf(""\\"")+1,target.rawWindowsPath.indexOf("".eprj2"")),256);
// The SDK calls Fs({uuid}), not Fs({cPath}). ZDe keeps cPath undefined;
// U9o therefore leaves the empty client name unchanged and LJ keeps the base
// Title. A filename-prefixed title would belong to a different opening route.
const expectedOpenedTitle=initialTitle,initialClientName=own(client,""currentProjectName"",true);
if(initialClientName!==undefined&&initialClientName!=="""")bad(""TITLE"");
const active=method(tabs,""getActiveTab""),container=method(tabs,""getContainerInfo""),getTab=method(tabs,""getTabById"");
const bus=own(host,""messageBus""),registryCall=method(bus,""rpcCall""),subscribe=method(bus,""subscribe"");
const apiBus=own(host,""extensionApiMessageBus2""),openCall=method(apiBus,""rpcCall"");
const set=own(root,""setTimeout"");clear=own(root,""clearTimeout"");if(typeof set!==""function""||typeof clear!==""function"")bad();
const check=()=>{
 substage=""root-binding"";
 if(expired)bad(""TIMEOUT"");
 if(root.window!==root||root.top!==root||root.location!==location||root.document!==document||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==retainedHref||location?.href!==retainedHref||location?.origin!==""https://client"")bad(""URL"");
 if(parseProjectUrl(retainedHref,target.projectUuid).base!==initialUrl.base)bad(""URL"");
 if(own(root,""PRO_EDITOR_MODE"")!==mode||(mode!==""CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM""&&mode!==""CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM""))bad();
 if(own(root,""UI"")!==ui||own(root,""gVars"")!==host||own(ui,""gVars"")!==host||own(ui,""tabBar"")!==tabs||own(host,""client"")!==client||own(host,""messageBus"")!==bus||own(host,""extensionApiMessageBus2"")!==apiBus||own(root,""_MSG_BUS2_EXTAPI_"")!==apiBus||own(root,""_TAB_ID_"")!==windowTabId||own(root,""setTimeout"")!==set||own(root,""clearTimeout"")!==clear)bad(""BINDING"");
 for(const binding of [active,container,getTab,registryCall,subscribe,openCall,query,attribute])methodCheck(binding);
 if(apply(query.fn,document,['meta[name=""editorMainVersion""]'])!==meta||meta.ownerDocument!==document||apply(attribute.fn,meta,[""content""])!==version)bad(""TITLE"");
 if(prefixCheck!==undefined)prefixCheck();
};
const projectIdentity=()=>{
 check();substage=""project-identity"";const project=plain(own(host,""currentProject"")),pid=own(project,""projectId"",true),branch=own(project,""branchUuid"",true),projectPresent=pid===target.projectUuid;
 if(pid!==undefined&&!projectPresent)bad(""PROJECT"");
 if(projectPresent){if(branch!==target.branchUuid)bad(""BRANCH"");if(own(project,""isV2Format"")!==false)bad(""FORMAT"");}else if(branch!==undefined&&branch!=="""")bad(""BRANCH"");
 if(own(host,""isHistoryMode"")!==false)bad(""HISTORY"");return{project,pid,branch,projectPresent};
};
const sample=()=>{
 const {project,pid,branch,projectPresent}=projectIdentity(),owners=[project];substage=""title"";
 const documentTitle=text(document.title,512),clientName=own(client,""currentProjectName"",true);
 if(documentTitle!==expectedOpenedTitle||clientName!==initialClientName)bad(""TITLE"");
 substage=""container-roster"";
 const ids=own(tabs,""containerIds""),n=dense(ids,128);if(n===0)bad(""TAB"");owners.push(ids);const names=[],registry=new Set();
 for(let i=0;i<n;i++){const id=text(own(ids,String(i)),256);if(registry.has(id))bad(""TAB"");registry.add(id);names.push(id);}
 substage=""container-tree"";const tree=own(tabs,""containerTree""),pending=[{node:tree,depth:0}],seen=new Set(),treeIds=new Set(),leaves=new Set(),treeProjection=[];
 if(own(tabs,""belongContainer"")!==""editor-window-main""||own(tree,""id"")!==""editor-window-main"")bad(""TAB"");
 while(pending.length){const item=pending.pop(),node=plain(item.node);if(item.depth>16||seen.has(node)||seen.size>=255)bad(""TAB"");seen.add(node);owners.push(node);const id=text(own(node,""id""),256),children=own(node,""children"",true);if(treeIds.has(id))bad(""TAB"");treeIds.add(id);treeProjection.push([id,item.depth]);
  if(children===undefined){if(!registry.has(id)||leaves.has(id))bad(""TAB"");leaves.add(id);}else{const count=dense(children,128);if(count===0||pending.length+seen.size+count>255)bad(""TAB"");owners.push(children);for(let i=count-1;i>=0;i--)pending.push({node:own(children,String(i)),depth:item.depth+1});}}
 if(leaves.size!==registry.size)bad(""TAB"");const current=text(own(tabs,""currentTabId""),512,true);if(apply(active.fn,tabs,[])!==current)bad(""TAB"");
 substage=""tab-roster"";const allIds=new Set(),projection=[],ordinaryIds=[];let count=0,start=0,placeholder=0,currentCount=0;
 for(const id of names){const info=plain(apply(container.fn,tabs,[id]));check();substage=""tab-roster"";owners.push(info);if(own(info,""id"")!==id||own(info,""belong"")!==""editor-window-main"")bad(""TAB"");const list=own(info,""tabs""),length=dense(list,256);if(count+length>256)bad(""TAB"");count+=length;owners.push(list);const localActive=text(own(info,""activeTabId""),512,true),localIds=new Set(),rows=[];
  for(let i=0;i<length;i++){const tab=plain(own(list,String(i))),id2=text(own(tab,""tabId""),512),data=plain(own(tab,""data""));owners.push(tab,data);if(allIds.has(id2))bad(""TAB"");allIds.add(id2);localIds.add(id2);const type=own(data,""doctype"");
   if(id2===""tab_page1""||id2===""0""){const isStart=id2===""tab_page1"";if(type!==(isStart?-1:0)||own(tab,""isAbleDelete"")!==false||own(tab,""group"")!==""start_blank""||own(tab,""draggable"")!==isStart)bad(""TAB"");const hidden=own(tab,""isDisplayNone"");if(typeof hidden!==""boolean""||(!isStart&&hidden!==true))bad(""TAB"");const declared=own(tab,""documentType"",true);if(declared!==undefined&&declared!==type)bad(""TAB"");for(const key of [""pid"",""owner""])if(own(data,key,true)!==undefined)bad(""TAB"");for(const key of [""parentProjectUuid"",""parentLibraryUuid""])if(own(tab,key,true)!==undefined)bad(""TAB"");if(isStart)start++;else placeholder++;
   }else{if(!projectPresent||own(data,""pid"")!==target.projectUuid||own(tab,""parentLibraryUuid"",true)!==undefined||![1,3,26].includes(type))bad(""TAB"");const parts=/^([a-f0-9]{16}|[a-f0-9]{32})@([a-f0-9]{64})$/.exec(id2);if(!parts||parts[0]!==id2||parts[2]!==target.projectUuid)bad(""TAB"");const parentProject=own(tab,""parentProjectUuid"",true);if(parentProject!==undefined&&parentProject!==target.projectUuid)bad(""TAB"");ordinaryIds.push(id2);}
   if(apply(getTab.fn,tabs,[id2])!==tab)bad(""TAB"");
   if(id2===current){currentCount++;if(localActive!==current)bad(""TAB"");}rows.push([id2,type]);}
  if(localActive!==""""&&!localIds.has(localActive))bad(""TAB"");projection.push([id,localActive,rows]);}
 if(start>1||placeholder>1||(current===""""?currentCount!==0:currentCount!==1))bad(""TAB"");
 if(!projectPresent&&(start!==1||current!==""tab_page1""||count!==start+placeholder))bad(""TAB"");
 substage=""url"";const url=parseProjectUrl(retainedHref,target.projectUuid,current);
 if(!url.empty&&!projectPresent||url.tabIds.some(id=>!allIds.has(id)))bad(""URL"");check();
 return{owners,identity:JSON.stringify([names,treeProjection,projection,current,pid??null,branch??null,documentTitle,clientName??null]),public:{projectPresent,branchUuid:projectPresent?branch:null,windowTabId,containerCount:n,tabIds:ordinaryIds,activeTabId:current,initialTitle,expectedOpenedTitle,documentTitle}};
};
const same=(a,b)=>{if(a.identity!==b.identity||a.owners.length!==b.owners.length||a.owners.some((owner,i)=>owner!==b.owners[i]))bad(""OWNERS"");};
const registration=async()=>{const before=sample();substage=""registration"";const reply=await apply(registryCall.fn,bus,[""/pro-mgr/api/client/getProjectPaths"",{},0]);check();same(before,sample());substage=""registration"";plain(reply);const message=plain(own(reply,""message""));if(own(message,""success"")!==true)bad(""REGISTRY"");const result=plain(own(message,""result"")),keys=Reflect.ownKeys(result);if(keys.length>4096||keys.some(key=>!matches(key,/^[a-f0-9]{64}$/)))bad(""REGISTRY"");const selected=plain(own(result,target.projectUuid));if(text(own(selected,""path""),4096)!==target.rawWindowsPath||own(selected,""isCbb"")!==false)bad(""REGISTRY"");return before;};
const run=async()=>{
 stage=""registration-before"";const initial=await registration();check();if(initial.public.projectPresent)bad(""PROJECT"");
 if(phase===""open-project""){
  stage=""subscribe"";let delivered=0,eventFailed=false,eventProject,settle;const event=new Promise(resolve=>{settle=resolve;});
  const advanceUrl=()=>{if(!dispatchAttempted)bad(""PREFIX"");retainedHref=location?.href;check();};
  // UI3823ed6e createBlankTab16424906 publishes a simulated click, not an
  // Awaited tab-render completion. ON_OPENED16669194 emits this prefix before
  // Restoration. Capture project identity here; complete title/tab/owner
  // Checks remain mandatory after acknowledgment and around registry/final reads.
  const receive=(...args)=>{delivered++;const priorStage=stage,priorSubstage=substage;stage=""prefix"";substage=""event-shape"";try{if(!dispatchAttempted||delivered!==1||args.length!==3||args[0]!==null||args[1]!==undefined||args[2]!==undefined)bad(""PREFIX"");advanceUrl();const observed=projectIdentity();if(!observed.projectPresent)bad(""PROJECT"");eventProject=observed.project;prefixObserved=true;}catch{retainFailure();eventFailed=true;}finally{stage=priorStage;substage=priorSubstage;}settle();};
  const task=apply(subscribe.fn,bus,[""loadProjectCompleted"",receive]),cancel=method(task,""cancel"");
  const listener=()=>{const prior=substage;substage=""listener"";methodCheck(cancel);if(own(task,""callback"")!==receive||own(task,""isRunning"")!==true)bad(""PREFIX"");substage=prior;};
  cleanup=()=>{listener();apply(cancel.fn,task,[]);if(own(task,""callback"")!==null||own(task,""isRunning"")!==false)bad(""CLEANUP"");};
  prefixCheck=()=>{listener();if(eventFailed||delivered>1)bad(""PREFIX"");};
  listener();same(initial,sample());check();if(delivered!==0||eventFailed)bad(""PREFIX"");
  stage=""dispatch"";dispatchAttempted=true;const result=await apply(openCall.fn,apiBus,[""extensionApi.DMT_Project.openProject"",target.projectUuid]);
  stage=""acknowledgement"";advanceUrl();listener();substage=""acknowledgement"";if(typeof result!==""boolean"")bad(""ACK"");publicResult=result;if(!result)bad(""ACK"");
  stage=""prefix"";await event;check();listener();if(delivered!==1||eventFailed||!prefixObserved)bad(""PREFIX"");if(own(host,""currentProject"")!==eventProject)bad(""OWNERS"");
 }
 stage=""registration-after"";const after=await registration();check();stage=""observe"";const final=sample();same(after,final);await Promise.resolve();check();same(final,sample());
 if(final.public.projectPresent!==(phase===""open-project""))bad(""PROJECT"");
 observation=final.public;stage=""output"";substage=""output"";return{ok:true,status:phase===""preflight""?""ready"":""opened-prefix-observed"",failure:null};
};
check();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;code=""TIMEOUT"";retainFailure(""TIMEOUT"");reject(new Error(""PCB_DIAGNOSTIC_OPENING""));},phase===""preflight""?10000:45000]);});
outcome=await Promise.race([run(),timeout]);
}catch{outcome={ok:false,status:""refused"",failure:retainFailure()};}
finally{
 stage=""cleanup"";substage=""cleanup"";
 try{if(cleanup!==undefined)cleanup();}catch{cleanupFailure={stage:""cleanup"",code:""CLEANUP""};outcome={ok:false,status:""refused"",failure:retainFailure(""CLEANUP"")};}
 if(timer!==undefined&&typeof clear===""function""){try{Reflect.apply(clear,globalThis,[timer]);}catch{cleanupFailure={stage:""cleanup"",code:""CLEANUP""};outcome={ok:false,status:""refused"",failure:retainFailure(""CLEANUP"")};}}
}
return JSON.stringify({schema:""easyeda-pro-control.pcb-diagnostic-opening.v1"",phase,projectUuid:target.projectUuid,branchUuid:target.branchUuid,documentUuid:target.documentUuid,...outcome,cleanupFailure,dispatchAttempted,publicResult,prefixObserved,nativeWorkMayRemain:dispatchAttempted,observation});
}";
  static string WorkerExpressionJson() {
    return "\""+WorkerExpression.Replace("\\","\\\\").Replace("\"","\\\"").Replace("\r","\\r").Replace("\n","\\n")+"\"";
  }
  const string ModelCallbackExpression=@"(()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})()";
  const string ModelHandlerFunction=@"function(){
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const handler=own(object(own(this,""object"")),""t"");
if(typeof handler!==""function"")bad();
return handler;
}";
  const string ModelStateFunction=@"function(originalCallback){
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad();
const scope=object(own(this,""object""));
const klass=n=>{const c=own(scope,n);if(typeof c!==""function"")bad();return c;};
const instance=(o,c)=>{object(o);if(Object.getPrototypeOf(o)!==own(c,""prototype""))bad();return o;};
const envClass=klass(""x""),managerClass=klass(""wi""),copperClass=klass(""FP"");
const env=instance(own(envClass,""env""),envClass),manager=instance(own(managerClass,""manager""),managerClass);
if(own(env,""_doctype"")!==3||own(env,""_compiler"")===null)bad();
const alternate=marker(managerClass,""otherDecodingProjectId"");if(alternate===""present"")bad();
const channel=instance(own(env,""compilerChannel""),klass(""mCe""));
const compiler=(value,kind)=>{
instance(value,klass(kind===""main""?""Zu"":""XS""));
const base=instance(own(value,""base""),klass(""A8e"")),consistency=instance(own(base,""consistencyManager""),klass(""sCe""));
if(own(value,""uuid"")!==own(base,""uuid"")||own(value,""consistencyManager"")!==consistency||own(base,""channel"")!==channel||own(base,""_headType"")!==(kind===""main""?""PCB"":""FOOTPRINT""))bad();
const uniqueId=id(own(consistency,""unique"")),registry=plain(own(channel,""compiler"")),registryMap=nativeMap(own(registry,kind===""main""?""PCB"":""FOOTPRINT""));
mapSize(registryMap);
if(Reflect.apply(own(Map.prototype,""get""),registryMap,[uniqueId])!==base)bad();
const result={uuid:kind===""main""?id(own(base,""uuid"")):customId(own(base,""uuid"")),uniqueId,headType:kind===""main""?""PCB"":""FOOTPRINT"",isProject:flag(own(base,""isProject"")),isInit:flag(own(base,""isInit"")),canSave:flag(own(base,""canSave"")),isInitIng:flag(own(base,""isInitIng"")),pendCacheLength:extent(own(base,""pendCacheLength"")),pendingDocumentKeyCount:keys(own(base,""pendCache"")),cacheKeyCount:keys(own(base,""cache"")),deleteCacheCount:mapSize(own(base,""deleteCache"")),subscriptionCount:arrayLength(own(base,""sub"")),pendTimer:marker(base,""pendTimer""),pendPromise:marker(base,""pendPromise""),maxTicket:extent(own(consistency,""maxTicket"")),pendingChange:flag(own(consistency,""isPendChange"")),localChange:flag(own(consistency,""isLocalChange""))};
return result;
};
const mainOwner=own(env,""_compiler""),main=compiler(mainOwner,""main"");if(main.uuid!==id(own(env,""_id"")))bad();
const map=nativeMap(own(manager,""map"")),loadedFootprintCount=mapSize(map);if(loadedFootprintCount>128)bad();
const custom=[],seen=new Set(),iterator=Reflect.apply(own(Map.prototype,""entries""),map,[]),iteratorPrototype=Object.getPrototypeOf(iterator),next=own(iteratorPrototype,""next"");
if(typeof next!==""function"")bad();
for(let index=0;index<loadedFootprintCount;index++){
const entry=Reflect.apply(next,iterator,[]);if(own(entry,""done"")!==false)bad();
const pair=own(entry,""value"");if(arrayLength(pair)!==2)bad();
const footprint=object(own(pair,""1"")),prototype=Object.getPrototypeOf(footprint);
if(prototype!==own(klass(""Al""),""prototype"")&&prototype!==own(klass(""aC""),""prototype""))bad();
if(prototype===own(klass(""Al""),""prototype"")){
const uuid=customId(own(footprint,""_uuid""));if(own(pair,""0"")!==uuid||seen.has(uuid))bad();seen.add(uuid);
const state=compiler(own(footprint,""instance""),""custom-footprint"");if(state.uuid!==uuid)bad();custom.push(state);
}
}
if(own(Reflect.apply(next,iterator,[]),""done"")!==true)bad();
const copper=instance(own(copperClass,""manager""),copperClass),workerMarker=marker(copper,""workerName"");
let workerName=null;if(workerMarker===""present"")workerName=extent(own(copper,""workerName""));
const dynamicCopper={openPcb:flag(own(copper,""openPcb"")),workerNameMarker:workerMarker,workerName,timer:marker(copper,""time""),bus:marker(copper,""_bus"")};
if(own(envClass,""env"")!==env||own(managerClass,""manager"")!==manager||own(copperClass,""manager"")!==copper||own(env,""_compiler"")!==mainOwner||own(manager,""map"")!==map||own(env,""compilerChannel"")!==channel)bad();
return JSON.stringify({schema:""easyeda-pro-control.pcb-diagnostic-model-state.v1"",main,loadedFootprintCount,customFootprints:custom,dynamicCopper});
}";
  static string JsonString(string value) {
    if(value==null) throw Error("json-string");
    StringBuilder output=new StringBuilder("\"");
    foreach(char character in value) {
      if(character=='"') output.Append("\\\"");
      else if(character=='\\') output.Append("\\\\");
      else if(character=='\b') output.Append("\\b");
      else if(character=='\f') output.Append("\\f");
      else if(character=='\n') output.Append("\\n");
      else if(character=='\r') output.Append("\\r");
      else if(character=='\t') output.Append("\\t");
      else if(character<32) output.Append("\\u"+((int)character).ToString("x4",CultureInfo.InvariantCulture));
      else output.Append(character);
    }
    return output.Append('"').ToString();
  }
  const string PcbOpeningFunction=@"async function(target,phase){
""use strict"";
let stage=""setup"",code=""EXCEPTION"",dispatchAttempted=false,publicResult=null,frameObserved=false,windowTabId=null,timer,clear,expired=false,outcome;
const bad=(value=""GUARD"")=>{code=value;throw new Error(""PCB_DIAGNOSTIC_PCB_OPENING"");};
try{
const root=globalThis,apply=Reflect.apply;
const own=(o,k,optional=false)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad(""FIELD"");const d=Object.getOwnPropertyDescriptor(o,k);if(!d){if(optional&&!(k in o))return undefined;bad(""FIELD"");}if(!Object.hasOwn(d,""value""))bad(""FIELD"");return d.value;};
const plain=o=>{if(o===null||typeof o!==""object""||Array.isArray(o)||Object.getPrototypeOf(o)!==Object.prototype)bad();return o;};
const text=(v,n)=>{if(typeof v!==""string""||v.length>n||!v.isWellFormed()||/[\u0000-\u001F\u007F]/.test(v))bad();return v;};
const matches=(v,re)=>{const m=typeof v===""string""?re.exec(v):null;return m!==null&&m[0]===v;};
plain(target);const targetKeys=[""rawWindowsPath"",""projectUuid"",""branchUuid"",""documentUuid"",""expectedSourceSha256""];
if(Reflect.ownKeys(target).length!==5||targetKeys.some(k=>!Object.hasOwn(target,k)))bad();
for(const k of targetKeys)text(own(target,k),4096);
if(!matches(target.projectUuid,/^[a-f0-9]{64}$/)||!matches(target.branchUuid,/^[a-f0-9]{32}$/)||!matches(target.documentUuid,/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/)||!matches(target.expectedSourceSha256,/^[a-f0-9]{64}$/)||!matches(target.rawWindowsPath,/^[A-Za-z]:\\[^\u0000-\u001F\u007F<>:""|?*/]+\.eprj2$/)||![""preflight"",""open-document"",""observe""].includes(phase))bad();
const tabId=target.documentUuid+""@""+target.projectUuid;
const dense=(a,max)=>{if(!Array.isArray(a)||Object.getPrototypeOf(a)!==Array.prototype)bad();const n=own(a,""length"");if(!Number.isSafeInteger(n)||n<0||n>max||Reflect.ownKeys(a).length!==n+1)bad();for(let i=0;i<n;i++)own(a,String(i));return n;};
const method=(o,k)=>{const chain=[];let p=o;for(let i=0;i<4;i++){if(p===null||(typeof p!==""object""&&typeof p!==""function""))bad(""METHOD"");chain.push(p);const d=Object.getOwnPropertyDescriptor(p,k);if(d){if(!Object.hasOwn(d,""value"")||typeof d.value!==""function"")bad(""METHOD"");return {owner:o,key:k,chain,fn:d.value};}p=Object.getPrototypeOf(p);}bad(""METHOD"");};
const methodCheck=b=>{for(let i=0;i<b.chain.length;i++){const p=b.chain[i];if(i>0&&Object.getPrototypeOf(b.chain[i-1])!==p)bad(""BINDING"");if(i===b.chain.length-1){if(own(p,b.key)!==b.fn)bad(""BINDING"");}else if(Object.hasOwn(p,b.key))bad(""BINDING"");}};
const parseProjectUrl=(value,projectUuid,activeTabId)=>{
 if(typeof value!=='string'||value.length>32768||typeof projectUuid!=='string')bad();
 const projectMatch=/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/.exec(projectUuid);if(!projectMatch||projectMatch[0]!==projectUuid)bad();
 const pieces=value.split('#');if(pieces.length>2)bad();const base=pieces[0];
 const baseMatch=/^https:\/\/client\/editor\?cll=(?:trace|debug|info|warn|error)$/.exec(base);if(!baseMatch||baseMatch[0]!==base)bad();
 const fragment=pieces.length===1?'':pieces[1];
 if(fragment==='')return{base,empty:true,tabIds:[],activeTabId:null};
 const prefix='id='+projectUuid;if(fragment===prefix)return{base,empty:false,tabIds:[],activeTabId:null};
 if(!fragment.startsWith(prefix+',tab='))bad();const entries=fragment.slice(prefix.length+5).split('|');
 if(entries.length<1||entries.length>256)bad();const tabIds=[],seen=new Set();let markedTabId=null;
 for(const entry of entries){
  const match=/^(\*?)([a-f0-9]{16}|[a-f0-9]{32})@([a-f0-9]{32}|[a-f0-9]{64})$/.exec(entry);
  if(!match||match[0]!==entry||match[3]!==projectUuid)bad();const tabId=match[2]+'@'+match[3];if(seen.has(tabId))bad();seen.add(tabId);tabIds.push(tabId);
  if(match[1]==='*'){if(markedTabId!==null||(activeTabId!==undefined&&activeTabId!==null&&activeTabId!==tabId))bad();markedTabId=tabId;}
 }
 return{base,empty:false,tabIds,activeTabId:markedTabId};
};
const location=root.location,document=root.document,initialHref=location?.href,initialUrl=parseProjectUrl(initialHref,target.projectUuid);
if(initialUrl.empty)bad(""URL"");let retainedHref=initialHref;
const ui=own(root,""UI""),host=own(root,""gVars""),tabs=own(ui,""tabBar""),project=plain(own(host,""currentProject"")),mode=own(root,""PRO_EDITOR_MODE"");
windowTabId=own(root,""_TAB_ID_"");if(!matches(windowTabId,/^[A-Za-z0-9_-]{1,128}$/)||typeof tabs!==""function"")bad();
const active=method(tabs,""getActiveTab""),container=method(tabs,""getContainerInfo""),getTab=method(tabs,""getTabById"");
const bus=own(host,""messageBus""),registry=method(bus,""rpcCall""),apiBus=own(host,""extensionApiMessageBus2""),open=method(apiBus,""rpcCall"");
const select=document?.querySelectorAll,set=own(root,""setTimeout"");clear=own(root,""clearTimeout"");
if(typeof select!==""function""||typeof set!==""function""||typeof clear!==""function"")bad();
const check=()=>{
if(expired)bad(""TIMEOUT"");
if(root.window!==root||root.top!==root||root.document!==document||root.location!==location||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==retainedHref||location?.href!==retainedHref||location?.origin!==""https://client""||document.querySelectorAll!==select)bad(""URL"");
const url=parseProjectUrl(retainedHref,target.projectUuid);if(url.empty||url.base!==initialUrl.base||url.tabIds.some(id=>id!==tabId)||url.activeTabId!==null&&url.activeTabId!==tabId)bad(""URL"");
if(own(root,""PRO_EDITOR_MODE"")!==mode||![""CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM"",""CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM""].includes(mode))bad();
if(own(root,""gVars"")!==host||own(root,""UI"")!==ui||own(ui,""gVars"")!==host||own(ui,""tabBar"")!==tabs||own(host,""currentProject"")!==project||own(host,""messageBus"")!==bus||own(host,""extensionApiMessageBus2"")!==apiBus||own(root,""_MSG_BUS2_EXTAPI_"")!==apiBus||own(root,""_TAB_ID_"")!==windowTabId||own(root,""setTimeout"")!==set||own(root,""clearTimeout"")!==clear)bad(""BINDING"");
if(own(project,""projectId"")!==target.projectUuid||own(project,""branchUuid"")!==target.branchUuid||own(project,""isV2Format"")!==false||own(host,""isHistoryMode"")!==false)bad(""PROJECT"");
for(const b of [active,container,getTab,registry,open])methodCheck(b);
};
const sample=required=>{
check();const ids=own(tabs,""containerIds""),tree=plain(own(tabs,""containerTree""));
if(dense(ids,1)!==1||own(ids,""0"")!==""editor-window-main""||own(tree,""id"")!==""editor-window-main""||own(tree,""children"",true)!==undefined||own(tabs,""belongContainer"")!==""editor-window-main"")bad(""TAB"");
const info=plain(apply(container.fn,tabs,[""editor-window-main""])),list=own(info,""tabs""),n=dense(list,3),current=own(tabs,""currentTabId"");
if(n<1||own(info,""id"")!==""editor-window-main""||own(info,""belong"")!==""editor-window-main""||own(info,""activeTabId"")!==current||apply(active.fn,tabs,[])!==current)bad(""TAB"");
const owners=[ids,tree,info,list],rows=[],seen=new Set();let found=false;
for(let i=0;i<n;i++){const tab=plain(own(list,String(i))),id=text(own(tab,""tabId""),128),data=plain(own(tab,""data""));if(seen.has(id)||apply(getTab.fn,tabs,[id])!==tab)bad(""TAB"");seen.add(id);owners.push(tab,data);
const type=own(data,""doctype"");if(id===""tab_page1""||id===""0""){const start=id===""tab_page1"";if(type!==(start?-1:0)||own(tab,""isAbleDelete"")!==false||own(tab,""group"")!==""start_blank""||own(tab,""draggable"")!==start||typeof own(tab,""isDisplayNone"")!==""boolean""||!start&&own(tab,""isDisplayNone"")!==true)bad(""TAB"");
const declared=own(tab,""documentType"",true);if(declared!==undefined&&declared!==type)bad(""TAB"");for(const k of [""pid"",""owner""])if(own(data,k,true)!==undefined)bad(""TAB"");for(const k of [""parentProjectUuid"",""parentLibraryUuid""])if(own(tab,k,true)!==undefined)bad(""TAB"");
}else{if(id!==tabId||type!==3||own(data,""pid"")!==target.projectUuid||own(tab,""parentLibraryUuid"",true)!==undefined)bad(""TAB"");const parent=own(tab,""parentProjectUuid"",true);if(parent!==undefined&&parent!==target.projectUuid)bad(""TAB"");found=true;}rows.push([id,type]);}
if(!seen.has(current)||found!==required||required&&current!==tabId)bad(""TAB"");
const url=parseProjectUrl(retainedHref,target.projectUuid,current);if(url.tabIds.some(id=>!seen.has(id)))bad(""URL"");
const allFrames=apply(select,document,[""iframe""]);if(allFrames.length!==(required?1:0))bad(""FRAME"");
return {owners,identity:JSON.stringify([rows,current]),frame:required?allFrames[0]:null};
};
const same=(a,b)=>{if(a.identity!==b.identity||a.frame!==b.frame||a.owners.length!==b.owners.length||a.owners.some((o,i)=>o!==b.owners[i]))bad(""BINDING"");};
const registration=async required=>{const before=sample(required),reply=await apply(registry.fn,bus,[""/pro-mgr/api/client/getProjectPaths"",{},0]);check();same(before,sample(required));plain(reply);const message=plain(own(reply,""message""));if(own(message,""success"")!==true)bad(""REGISTRY"");const entries=plain(own(message,""result"")),keys=Reflect.ownKeys(entries);if(keys.length>4096||keys.some(k=>!matches(k,/^[a-f0-9]{64}$/)))bad(""REGISTRY"");const entry=plain(own(entries,target.projectUuid));if(own(entry,""path"")!==target.rawWindowsPath||own(entry,""isCbb"")!==false)bad(""REGISTRY"");return before;};
const observe=async()=>{
const before=sample(true),frame=before.frame,child=frame?.contentWindow,childDocument=child?.document,parent=frame?.parentElement,classes=frame?.classList;
const attribute=frame?.getAttribute,has=frame?.hasAttribute,contains=classes?.contains,parentAttribute=parent?.getAttribute;
if(typeof attribute!==""function""||typeof has!==""function""||typeof contains!==""function""||typeof parentAttribute!==""function"")bad(""FRAME"");
const native=own(child,""MSG_BUS_PCB""),channel=own(native,""messageBus""),identity=method(channel,""rpcCall""),childObject=own(child,""Object""),childPrototype=own(childObject,""prototype"");
const frameCheck=()=>{check();same(before,sample(true));methodCheck(identity);
if(frame.tagName!==""IFRAME""||frame.id!==""frame_""+tabId||frame.ownerDocument!==document||frame.isConnected!==true||frame.parentElement!==parent||frame.classList!==classes||classes.contains!==contains||frame.getAttribute!==attribute||frame.hasAttribute!==has||parent.getAttribute!==parentAttribute||!apply(contains,classes,[""editframe""])||apply(parentAttribute,parent,[""uuid""])!==tabId)bad(""FRAME"");
for(const [k,v] of [[""c_dbid"",tabId],[""c_doctype"",""3""],[""src"",""editor?entry=pcb""],[""pcb-canvas"",""true""]])if(apply(attribute,frame,[k])!==v)bad(""FRAME"");for(const k of [""blankIframe"",""fromFile"",""jsonCacheReady""])if(apply(has,frame,[k]))bad(""FRAME"");
if(frame.contentWindow!==child||child.document!==childDocument||childDocument?.defaultView!==child||childDocument?.nodeType!==9||child.frameElement!==frame||child.parent!==root||child.top!==root||child.location?.href!==""https://client/editor?entry=pcb""||own(child,""MSG_BUS_PCB"")!==native||own(native,""messageBus"")!==channel||own(child,""Object"")!==childObject||own(childObject,""prototype"")!==childPrototype)bad(""FRAME"");
};
const childPlain=v=>{if(v===null||typeof v!==""object""||Array.isArray(v))bad(""FRAME"");const p=Object.getPrototypeOf(v);if(p!==Object.prototype&&p!==childPrototype)bad(""FRAME"");return v;};
for(let i=0;i<2;i++){frameCheck();const reply=childPlain(await apply(identity.fn,channel,[""getTabIdAndDocType"",undefined,0]));frameCheck();const value=childPlain(own(reply,""message""));if(Reflect.ownKeys(value).length!==2||own(value,""tabId"")!==tabId||own(value,""docType"")!==3)bad(""FRAME"");}
frameObserved=true;
};
const run=async()=>{
stage=""registration-before"";const initial=await registration(phase===""observe"");check();
if(phase===""open-document""){same(initial,sample(false));stage=""dispatch"";dispatchAttempted=true;publicResult=await apply(open.fn,apiBus,[""extensionApi.DMT_EditorControl.openDocument"",{documentUuid:target.documentUuid,splitScreenId:undefined}]);stage=""acknowledgement"";retainedHref=location?.href;check();if(publicResult===undefined)publicResult=null;if(publicResult!==tabId)bad(""ACK"");}
stage=""registration-after"";await registration(phase!==""preflight"");
if(phase===""observe""){stage=""frame"";await observe();check();}
stage=""output"";return {ok:true,status:phase===""preflight""?""ready"":phase===""open-document""?""opened"":""frame-observed"",failure:null};
};
check();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;code=""TIMEOUT"";reject(new Error(""PCB_DIAGNOSTIC_PCB_OPENING""));},phase===""open-document""?45000:10000]);});
outcome=await Promise.race([run(),timeout]);
}catch{outcome={ok:false,status:""refused"",failure:{stage,code}};}
finally{if(timer!==undefined&&typeof clear===""function""){try{Reflect.apply(clear,globalThis,[timer]);}catch{outcome={ok:false,status:""refused"",failure:{stage:""cleanup"",code:""CLEANUP""}};}}}
if(publicResult!==target.documentUuid+""@""+target.projectUuid)publicResult=null;
if(typeof windowTabId!==""string""||!/^[A-Za-z0-9_-]{1,128}$/.test(windowTabId))windowTabId=null;
return JSON.stringify({schema:""easyeda-pro-control.pcb-diagnostic-pcb-opening.v1"",phase,projectUuid:target.projectUuid,branchUuid:target.branchUuid,documentUuid:target.documentUuid,tabId:target.documentUuid+""@""+target.projectUuid,...outcome,dispatchAttempted,publicResult,nativeWorkMayRemain:dispatchAttempted,frameObserved,windowTabId});
}";
  public static string OpeningProtocolMessage(int id,string sessionId,string uniqueContextId,string phase,
    string path,string project,string branch,string document,string source) {
    return OpeningProtocolMessageCore(false,id,sessionId,uniqueContextId,phase,path,project,branch,document,source,false);
  }
  public static string PcbOpeningProtocolMessage(int id,string sessionId,string uniqueContextId,string phase,
    string path,string project,string branch,string document,string source) {
    return OpeningProtocolMessageCore(true,id,sessionId,uniqueContextId,phase,path,project,branch,document,source,false);
  }
  static string OpeningProtocolMessageCore(bool pcb,int id,string sessionId,string uniqueContextId,string phase,
    string path,string project,string branch,string document,string source,bool stringPurpose) {
    Func<string,string,bool> matches=(value,pattern)=>value!=null && System.Text.RegularExpressions.Regex.IsMatch(value,pattern);
    if(id<1 || id>(stringPurpose?225:103) || !matches(sessionId,@"\A[A-Za-z0-9_.:-]{1,128}\z") || !matches(uniqueContextId,@"\A[A-Za-z0-9_.:-]{1,128}\z") ||
      (pcb?(phase!="preflight" && phase!="open-document" && phase!="observe"):(phase!="preflight" && phase!="open-project")) ||
      path==null || path.Length<12 || path.Length>4096 ||
      !matches(path,@"\A[A-Za-z]:\\[^\x00-\x1F\x7F<>:""|?*/]+\.eprj2\z") ||
      !matches(project,@"\A[a-f0-9]{64}\z") || !matches(branch,@"\A[a-f0-9]{32}\z") ||
      !matches(document,@"\A(?:[a-f0-9]{16}|[a-f0-9]{32})\z") || !matches(source,@"\A[a-f0-9]{64}\z")) throw Error("opening-fields");
    foreach(string part in path.Substring(3).Split('\\')) {
      if(part.Length==0 || part.Trim()!=part || part=="." || part==".." || part.EndsWith(".") || part.EndsWith(" ") ||
        matches(part,@"~[0-9]") || matches(part,@"(?i)\A(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|\z)")) throw Error("opening-path");
    }
    using(SHA256 hash=SHA256.Create()) {
      string observed=BitConverter.ToString(hash.ComputeHash(new UTF8Encoding(false,true).GetBytes(path))).Replace("-","").ToLowerInvariant();
      if(observed!=project) throw Error("opening-project");
    }
    string target="{\"rawWindowsPath\":"+JsonString(path)+",\"projectUuid\":"+JsonString(project)+
      ",\"documentUuid\":"+JsonString(document)+",\"expectedSourceSha256\":"+JsonString(source)+",\"branchUuid\":"+JsonString(branch)+"}";
    string message="{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+",\"method\":\"Runtime.callFunctionOn\",\"params\":{\"functionDeclaration\":"+
      JsonString(pcb?PcbOpeningFunction:OpeningFunction)+",\"uniqueContextId\":"+JsonString(uniqueContextId)+",\"arguments\":[{\"value\":"+target+"},{\"value\":"+JsonString(phase)+
      "}],\"returnByValue\":true,\"awaitPromise\":true,\"silent\":true,\"generatePreview\":false,\"userGesture\":false,\"throwOnSideEffect\":false},\"sessionId\":"+JsonString(sessionId)+"}\0";
    if(Encoding.UTF8.GetByteCount(message)>65536) throw Error("opening-send-size");
    return message;
  }
  const string ModelPendingFunction=@"function(originalCallback,constructors,teardropProof){
""use strict"";
let stage=""callback"",reason=""unexpected"";
const bad=(r=""guard"")=>{reason=r;throw new Error(""PCB_DIAGNOSTIC_PENDING_STATE"");};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad(""object"");return o;};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad(""own"");const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad(""own"");return d.value;};
const optional=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return {marker:""absent"",value:undefined};const v=own(o,k);if(v===undefined)return {marker:""undefined"",value:v};if(v===null)return {marker:""null"",value:v};return {marker:""present"",value:v};};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad(""count"");return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad(""flag"");return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(v))bad(""id"");return v;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const keyCount=o=>{plain(o);const keys=Reflect.ownKeys(o);if(keys.some(k=>typeof k!==""string""))bad();return count(keys.length);};
const arrayCount=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const collection=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad(""collection"");const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad(""collection"");return count(Reflect.apply(d.get,o,[]));};

try{
if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad();
stage=""scope"";
const scope=object(own(this,""object"")),retained=[];

const constructorHeld=[],constructorProfiles={""kde"":[""kde"",0,{}],""Sfe"":[""Sfe"",0,{}],""mpe"":[""mpe"",0,{}],""Yde"":[""Yde"",0,{}],""HSe"":[""HSe"",0,{}],""USe"":[""USe"",0,{}],""Jse"":[""Jse"",0,{}],""Lpe"":[""Lpe"",1,{}],""Kme"":[""Kme"",0,{}],""fpe"":[""fpe"",0,{}],""P1e"":[""P1e"",0,{}],""mge"":[""mge"",0,{}],""tge"":[""tge"",0,{}],""$me"":[""Sy"",0,{""FLIP_PROGRESS_RANGE"":0.8,""FLIP_PROGRESS_START"":0.1,""MAX_QUEUE_SIZE"":20,""PROGRESS_UPDATE_INTERVAL"":10}],""Spe"":[""Spe"",0,{}],""Ume"":[""Ume"",0,{}],""cge"":[""cge"",0,{}],""Tfe"":[""Tfe"",0,{}],""Qme"":[""Qme"",0,{}],""jde"":[""jde"",0,{}]};
if(!Array.isArray(constructors)||Object.getPrototypeOf(constructors)!==Array.prototype)bad();
const constructorLength=own(constructors,""length""),constructorKeys=Reflect.ownKeys(constructors);
if(![16,20].includes(constructorLength)||constructorKeys.length!==constructorLength+1||constructorKeys[constructorLength]!==""length"")bad();
for(let i=0;i<constructorLength;i++)if(constructorKeys[i]!==String(i)||typeof own(constructors,String(i))!==""function"")bad();
const constructorNames=constructorLength===20?[""kde"",""Sfe"",""mpe"",""Yde"",""HSe"",""USe"",""Jse"",""Lpe"",""Kme"",""fpe"",""P1e"",""mge"",""tge"",""$me"",""Spe"",""Ume"",""cge"",""Tfe"",""Qme"",""jde""]:[""kde"",""Sfe"",""Jse"",""Lpe"",""Kme"",""fpe"",""P1e"",""mge"",""tge"",""$me"",""Spe"",""Ume"",""cge"",""Tfe"",""Qme"",""jde""];
const constructorMetadata=(c,name)=>{const [label,arity,statics]=constructorProfiles[name];if(own(c,""name"")!==label||own(c,""length"")!==arity)bad();for(const key of Object.keys(statics)){const d=Object.getOwnPropertyDescriptor(c,key);if(!d||!Object.hasOwn(d,""value"")||!d.writable||!d.configurable||!d.enumerable||own(c,key)!==statics[key])bad();}};
const constructorInstance=(o,name)=>{object(o);const i=constructorNames.indexOf(name);if(i<0)bad();const c=own(constructors,String(i)),p=own(c,""prototype"");if(Object.getPrototypeOf(o)!==p||own(p,""constructor"")!==c)bad();constructorMetadata(c,name);constructorHeld.push([o,p,c,name,i]);return o;};
const verifyConstructorAssociations=()=>{if(Object.getPrototypeOf(constructors)!==Array.prototype||own(constructors,""length"")!==constructorLength)bad();const k=Reflect.ownKeys(constructors);if(k.length!==constructorKeys.length||k.some((v,i)=>v!==constructorKeys[i]))bad();for(const [o,p,c,name,i] of constructorHeld){if(own(constructors,String(i))!==c||Object.getPrototypeOf(o)!==p||own(c,""prototype"")!==p||own(p,""constructor"")!==c)bad();constructorMetadata(c,name);}};

const klass=n=>{const c=own(scope,n);if(typeof c!==""function"")bad();return c;};
const instance=(o,c)=>{object(o);if(Object.getPrototypeOf(o)!==own(c,""prototype""))bad(""instance"");return o;};
const keep=(o,k)=>{const v=optional(o,k);retained.push([o,k,v.marker,v.value]);return v;};
stage=""environment"";const envClass=klass(""x""),env=instance(keep(envClass,""env"").value,envClass),compiler=own(env,""_compiler"");
if(own(env,""_doctype"")!==3||compiler===null||typeof compiler!==""object"")bad();
const documentUuid=id(own(env,""_id""));
const upload=n=>{const c=klass(n),v=keep(c,""proxy"");if(v.marker!==""present"")return {marker:v.marker,count:null};
const owner=instance(v.value,c),data=keep(owner,""data"").value;return {marker:""present"",count:collection(data,Set.prototype)};};
stage=""copper-uploads"";const copperUploads=upload(""qI"");stage=""plane-uploads"";const planeUploads=upload(""e5"");
stage=""board-upload"";const boardClass=klass(""pE""),boardOwner=keep(boardClass,""proxy"");
const boardUpload={marker:boardOwner.marker,flag:boardOwner.marker===""present""?flag(own(instance(boardOwner.value,boardClass),""flag"")):null};
stage=""commands"";const commands=constructorInstance(keep(scope,""Xe"").value,""kde""),undo=keep(commands,""undoCommand"").value,redo=keep(commands,""redoCommand"").value;
const undoCount=arrayCount(undo),redoCount=arrayCount(redo);if(undoCount>50||redoCount>50)bad();
const active=keep(commands,""stack"");if(active.marker!==""null""&&active.marker!==""present"")bad();
let activeStack=null;
if(active.marker===""present""){
stage=""active-stack"";
const stack=instance(active.value,klass(""De""));
activeStack={commandCount:arrayCount(keep(stack,""_commands"").value),waitingUploadCount:arrayCount(keep(stack,""waitingUploadStack"").value),
idMapCount:collection(keep(stack,""idMap"").value,Map.prototype),refreshService:flag(own(stack,""refreshService"")),
needCheckFilterCommand:flag(own(stack,""needCheckFilterCommand"")),partitionNeedAskBeforeDelete:flag(own(stack,""_partitionNeedAskBeforeDelete"")),
createPartitionFile:flag(own(stack,""createPartitionFile"")),sendCopperOrderChange:flag(own(stack,""sendCopperOrderChange""))};
}
stage=""teardrops"";

const tearsHeld=[],tearsPrototypes=[],tearsDescriptors=[],tearsTopics=[""isMoveSwitch"",""SetSuspend"",""cheakTearDrop"",""addModifyTeardrop"",""flushTearDrop"",""refreshTearDrop""],tearsMethods=[""isMoveSwitch"",""setSuspend"",""addModify"",""addMaodifyTeardrop"",""flushService"",""refreshService""];
const tearsOwn=(o,k)=>{const v=own(o,k);tearsHeld.push([o,k,v]);return v;};
const tearsProto=o=>{const p=Object.getPrototypeOf(o);tearsPrototypes.push([o,p]);return p;};
const tearsArray=(v,n)=>{if(!Array.isArray(v)||tearsProto(v)!==Array.prototype||tearsOwn(v,""length"")!==n)bad(""count"");const k=Reflect.ownKeys(v);if(k.length!==n+1||k[n]!==""length"")bad(""count"");for(let i=0;i<n;i++)if(k[i]!==String(i))bad(""count"");return v;};
const tearsNamed=(o,n)=>{object(o);const p=tearsProto(o),c=tearsOwn(p,""constructor"");if(typeof c!==""function""||tearsOwn(c,""name"")!==n||tearsOwn(c,""prototype"")!==p)bad(""instance"");return o;};
tearsArray(teardropProof,3);const teardropOwner=tearsNamed(tearsOwn(teardropProof,""0""),""Sfe""),tearsCallbacks=tearsArray(tearsOwn(teardropProof,""1""),6),tearsTargets=tearsArray(tearsOwn(teardropProof,""2""),6);
const tearsPrototype=tearsProto(teardropOwner);if(tearsProto(tearsPrototype)!==Object.prototype)bad(""prototype"");
const tearsBridge=tearsNamed(tearsOwn(globalThis,""MSG_BUS_PCB""),""HJ""),tearsBus=tearsNamed(tearsOwn(tearsBridge,""messageBus""),""Oet""),tearsRegistry=object(tearsOwn(tearsBus,""subscribed""));
const tearsRegistryPrototype=tearsProto(tearsRegistry);if(tearsRegistryPrototype!==Object.prototype&&tearsRegistryPrototype!==null)bad(""prototype"");
for(let i=0;i<6;i++){const tasks=tearsArray(tearsOwn(tearsRegistry,tearsTopics[i]),1),task=tearsNamed(tearsOwn(tasks,""0""),""Z1e""),callback=tearsOwn(task,""callback""),method=tearsMethods[i];if(tearsOwn(task,""isRunning"")!==true||typeof callback!==""function""||tearsOwn(tearsCallbacks,String(i))!==callback)bad(""callback"");if(Object.getOwnPropertyDescriptor(teardropOwner,method)!==undefined)bad(""shadow"");const d=Object.getOwnPropertyDescriptor(tearsPrototype,method);if(!d||!Object.hasOwn(d,""value"")||!d.writable||!d.configurable||d.enumerable||typeof d.value!==""function""||tearsOwn(tearsTargets,String(i))!==d.value)bad(""target"");tearsDescriptors.push([method,d]);}
const verifyTeardropOwner=()=>{for(const [o,k,v]of tearsHeld){const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value"")||!Object.is(d.value,v))bad(""own"");}for(const [o,p]of tearsPrototypes)if(Object.getPrototypeOf(o)!==p)bad(""prototype"");for(const [k,d]of tearsDescriptors){if(Object.getOwnPropertyDescriptor(teardropOwner,k)!==undefined)bad(""shadow"");const n=Object.getOwnPropertyDescriptor(tearsPrototype,k);if(!n||!Object.hasOwn(n,""value"")||n.value!==d.value||n.writable!==d.writable||n.configurable!==d.configurable||n.enumerable!==d.enumerable)bad(""target"");}};

const tears=constructorInstance(teardropOwner,""Sfe"");
const teardrops={isMove:flag(own(tears,""isMove"")),suspend:flag(own(tears,""suspend"")),
modifyCount:collection(keep(tears,""modify"").value,Set.prototype),taskCount:collection(keep(tears,""task"").value,Set.prototype),
modifyTearsCount:collection(keep(tears,""modifyTears"").value,Set.prototype),timer:keep(tears,""timeoutId"").marker};
stage=""dynamic-copper"";const copperClass=klass(""FP""),copper=instance(keep(copperClass,""manager"").value,copperClass),worker=keep(copper,""workerName""),copperBus=keep(copper,""_bus"");
const workerId=worker.marker===""present""?extent(worker.value):null;
stage=""worker-registry"";const workerClass=klass(""Of""),registry=keep(workerClass,""manager"");
let workers=null,association=workerId===null?""no-worker-id"":""registry-unavailable"";
if(registry.marker===""present""){
const manager=instance(registry.value,workerClass),map=keep(manager,""map"").value,bridges=keep(manager,""busMap"").value;
workers={workerCount:collection(map,Map.prototype),bridgeCount:keyCount(bridges),
ratlineWorkerCount:collection(keep(manager,""ratlineWorker"").value,Map.prototype),
threadBusCount:collection(keep(manager,""workerBus"").value,Map.prototype),
stateCount:keyCount(keep(manager,""_workerStateMap"").value),nextWorkerId:extent(own(manager,""id"")),nextThreadId:extent(own(manager,""i""))};
if(workerId!==null){
stage=""worker-association"";
const registered=Reflect.apply(own(Map.prototype,""get""),map,[workerId]),bridge=optional(bridges,String(workerId));
if(registered===undefined)association=""missing-worker"";
else if(bridge.marker!==""present"")association=""missing-bridge"";
else if(bridge.value!==copperBus.value)association=""bridge-mismatch"";
else{
object(registered);const selected=object(bridge.value),prototype=Object.getPrototypeOf(selected),constructor=own(prototype,""constructor"");
if(typeof constructor!==""function""||own(constructor,""name"")!==""Cet""||own(constructor,""prototype"")!==prototype)bad();
const sourceBus=own(own(globalThis,""MSG_BUS_PCB""),""messageBus"");
if(own(selected,""worker"")!==registered)association=""worker-mismatch"";
else if(own(selected,""bus"")!==sourceBus)association=""bus-mismatch"";
else association=""matched"";
}
}
}
stage=""reproof"";verifyConstructorAssociations();verifyTeardropOwner();if(own(env,""_compiler"")!==compiler||own(env,""_id"")!==documentUuid||own(env,""_doctype"")!==3)bad();
for(const r of retained){const v=optional(r[0],r[1]);if(v.marker!==r[2]||v.value!==r[3])bad();}
if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad();
stage=""serialize"";return JSON.stringify({schema:""easyeda-pro-control.pcb-diagnostic-pending-state.v1"",documentUuid,copperUploads,planeUploads,boardUpload,
commands:{undoCount,redoCount,activeStack},teardrops,workerRegistry:{marker:registry.marker,workers},
dynamicCopper:{workerMarker:worker.marker,workerId,busMarker:copperBus.marker,association}});
}catch{return JSON.stringify({schema:""easyeda-pro-control.pcb-diagnostic-pending-failure.v1"",stage,reason});}
}";
  const string ModelRawStringsFunction=@"function(originalCallback){
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_RAW_STRINGS_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const number=v=>{if(typeof v!==""number""||!Number.isFinite(v)||Object.is(v,-0)||Math.abs(v)>1e11)bad();return v;};
const integer=v=>{number(v);if(!Number.isSafeInteger(v))bad();return v;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const text=(v,n)=>{if(typeof v!==""string""||v.length>n||!v.isWellFormed())bad();return v;};
const id=v=>{text(v,32);if(!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(v))bad();return v;};
const marker=(o,k,copy)=>{let d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.getOwnPropertyDescriptor(p,k))bad();p=Object.getPrototypeOf(p);}return {kind:""absent""};}if(!Object.hasOwn(d,""value""))bad();const v=d.value;if(v===undefined)return {kind:""undefined""};if(v===null)return {kind:""null""};return {kind:""value"",value:copy(v)};};
if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad();
const scope=object(own(this,""object""));
const klass=n=>{const c=own(scope,n);if(typeof c!==""function"")bad();return c;};
const instance=(o,c)=>{object(o);if(Object.getPrototypeOf(o)!==own(c,""prototype""))bad();return o;};
const envClass=klass(""x""),managerClass=klass(""bo""),env=instance(own(envClass,""env""),envClass),manager=instance(own(managerClass,""manager""),managerClass);
const viewManager=instance(own(scope,""Jr""),klass(""t7""));
if(own(env,""_doctype"")!==3||own(viewManager,""mgr"")!==manager)bad();
const documentUuid=id(own(env,""_id"")),map=object(own(manager,""map""));
if(Object.getPrototypeOf(map)!==Map.prototype||Reflect.ownKeys(map).length!==0)bad();
const sizeDescriptor=Object.getOwnPropertyDescriptor(Map.prototype,""size"");
if(!sizeDescriptor||typeof sizeDescriptor.get!==""function""||sizeDescriptor.set!==undefined)bad();
const size=()=>Reflect.apply(sizeDescriptor.get,map,[]);
const count=integer(size());if(count<0||count>16)bad();
const point=v=>{instance(v,klass(""S""));return {x:number(own(v,""x"")),y:number(own(v,""y""))};};
const color=v=>{instance(v,klass(""ee""));return {r:number(own(v,""r"")),g:number(own(v,""g"")),b:number(own(v,""b"")),alpha:number(own(v,""alpha""))};};
const noParent=()=>{bad();};
const box=v=>{instance(v,klass(""Ls""));return {layerId:integer(own(v,""_layerId"")),locked:flag(own(v,""_locked"")),leftLow:point(own(v,""_leftLow"")),leftUp:point(own(v,""_leftUp"")),rightLow:point(own(v,""_rightLow"")),rightUp:point(own(v,""_rightUp""))};};
const watcher=(v,model)=>{instance(v,klass(""yr""));if(own(v,""model"")!==model)bad();return ""reciprocal-yr"";};
const scalar=v=>typeof v===""string""?text(v,128):integer(v);
const base=v=>{
object(v);const prototype=Object.getPrototypeOf(v),kind=prototype===own(klass(""U8""),""prototype"")?""U8"":prototype===own(klass(""ib""),""prototype"")?""ib"":null;if(kind===null)bad();
return {kind,num:integer(own(v,""num"")),type:integer(own(v,""type"")),origin:integer(own(v,""origin"")),strokeWidth:number(own(v,""strokeWidth"")),mirror:flag(own(v,""mirror"")),showKey:flag(own(v,""showKey"")),showValue:flag(own(v,""showValue"")),fontFamily:text(own(v,""fontFamily""),256),fontSize:number(own(v,""fontSize"")),reverse:flag(own(v,""reverse"")),reverseExpansion:number(own(v,""reverseExpansion"")),positionIsNull:flag(own(v,""positionIsNull"")),silkColor:marker(v,""silkColor"",color),layerId:marker(v,""_layerId"",integer),locked:marker(v,""_locked"",flag)};
};
const models=[],originals=[],seen=new Set(),iterator=Reflect.apply(own(Map.prototype,""entries""),map,[]),next=own(Object.getPrototypeOf(iterator),""next"");
if(typeof next!==""function"")bad();
for(let index=0;index<count;index++){
const entry=Reflect.apply(next,iterator,[]);if(own(entry,""done"")!==false)bad();
const pair=own(entry,""value"");if(!Array.isArray(pair)||Object.getPrototypeOf(pair)!==Array.prototype||own(pair,""length"")!==2||Reflect.ownKeys(pair).length!==3)bad();
const model=instance(own(pair,""1""),klass(""rd"")),globalIndex=id(own(model,""_globalIndex""));
if(own(pair,""0"")!==globalIndex||seen.has(globalIndex)||own(model,""modelType"")!==""Text"")bad();seen.add(globalIndex);
const nativeBase=own(model,""base""),position=own(model,""_position""),stateWatcher=marker(model,""_stateWatcher"",v=>watcher(v,model));
const snapshot={globalIndex,modelType:""Text"",zIndex:marker(model,""_zIndex"",integer),partition:marker(model,""_partition"",v=>text(v,128)),groupId:marker(model,""_groupID"",scalar),parent:marker(model,""_parent"",noParent),number:marker(model,""_number"",integer),dataState:integer(own(model,""_dataState"")),matrixChange:flag(own(model,""_matrixChange"")),key:text(own(model,""_key""),256),value:text(own(model,""_value""),1024),position:point(position),rotation:number(own(model,""_rotation"")),base:base(nativeBase),box:marker(model,""_box"",box),stateWatcher};
if(snapshot.key!==""""||snapshot.base.kind===""U8""&&(snapshot.base.layerId.kind!==""absent""||snapshot.base.locked.kind!==""absent"")||snapshot.base.kind===""ib""&&(snapshot.base.layerId.kind!==""value""||snapshot.base.locked.kind!==""value""))bad();
models.push(snapshot);originals.push([globalIndex,model,nativeBase,position]);
}
if(own(Reflect.apply(next,iterator,[]),""done"")!==true||size()!==count)bad();
for(const item of originals){if(Reflect.apply(own(Map.prototype,""get""),map,[item[0]])!==item[1]||own(item[1],""base"")!==item[2]||own(item[1],""_position"")!==item[3])bad();}
if(own(envClass,""env"")!==env||own(managerClass,""manager"")!==manager||own(manager,""map"")!==map||own(scope,""Jr"")!==viewManager||own(viewManager,""mgr"")!==manager||own(env,""_id"")!==documentUuid||own(env,""_doctype"")!==3)bad();
const output=JSON.stringify({schema:""easyeda-pro-control.pcb-diagnostic-raw-strings.v1"",documentUuid,managerModelCount:count,models});
let bytes=0;for(let index=0;index<output.length;index++){const c=output.charCodeAt(index);if(c<128)bytes++;else if(c<2048)bytes+=2;else if(c>=55296&&c<=56319){bytes+=4;index++;}else bytes+=3;if(bytes>65536)bad();}
return output;
}";
  const string ModelRootInventoryFunction=@"function(originalCallback,constructors){
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_ROOT_INVENTORY_STATE"");};
const retained=[],collections=[];
const budget={entries:0,trees:0};
const remember=(o,k,m,v)=>{if(retained.length>=528384)bad();retained.push([o,k,m,v]);};
const count=v=>{if(!Number.isSafeInteger(v)||Object.is(v,-0)||v<0||v>65536)bad();return v;};
const spend=n=>{budget.entries+=count(n);if(budget.entries>65536)bad();};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const descriptor=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();return Object.getOwnPropertyDescriptor(o,k);};
const own=(o,k)=>{const d=descriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();remember(o,k,""present"",d.value);return d.value;};
const optional=(o,k)=>{const d=descriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||descriptor(p,k))bad();p=Object.getPrototypeOf(p);}remember(o,k,""absent"",undefined);return {marker:""absent"",value:undefined};}if(!Object.hasOwn(d,""value""))bad();const v=d.value;remember(o,k,""present"",v);return {marker:v===undefined?""undefined"":v===null?""null"":""present"",value:v};};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(v))bad();return v;};
const collection=(o,p)=>{
object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();
const d=descriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();
const n=count(Reflect.apply(d.get,o,[]));spend(n);collections.push([o,p,d.get,n]);return n;
};
const map=o=>collection(o,Map.prototype),set=o=>collection(o,Set.prototype);
const array=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length""));spend(n);const keys=Reflect.ownKeys(o);if(keys.length!==n+1||keys[n]!==""length"")bad();for(let i=0;i<n;i++){if(keys[i]!==String(i))bad();const d=descriptor(o,String(i));if(!d||!Object.hasOwn(d,""value""))bad();}return n;};
const iterate=(o,p,n,visit)=>{
const iterator=Reflect.apply(own(p,p===Map.prototype?""entries"":""values""),o,[]),next=own(Object.getPrototypeOf(iterator),""next"");
if(typeof next!==""function"")bad();
for(let i=0;i<n;i++){const result=Reflect.apply(next,iterator,[]);if(own(result,""done"")!==false)bad();const v=own(result,""value"");if(p===Map.prototype){if(!Array.isArray(v)||v.length!==2)bad();visit(v[0],v[1]);}else visit(v);}
if(own(Reflect.apply(next,iterator,[]),""done"")!==true)bad();
};
const has=(o,v)=>Reflect.apply(own(Set.prototype,""has""),o,[v]);
if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad();
const scope=object(own(this,""object""));

const constructorHeld=[],constructorProfiles={""kde"":[""kde"",0,{}],""Sfe"":[""Sfe"",0,{}],""mpe"":[""mpe"",0,{}],""Yde"":[""Yde"",0,{}],""HSe"":[""HSe"",0,{}],""USe"":[""USe"",0,{}],""Jse"":[""Jse"",0,{}],""Lpe"":[""Lpe"",1,{}],""Kme"":[""Kme"",0,{}],""fpe"":[""fpe"",0,{}],""P1e"":[""P1e"",0,{}],""mge"":[""mge"",0,{}],""tge"":[""tge"",0,{}],""$me"":[""Sy"",0,{""FLIP_PROGRESS_RANGE"":0.8,""FLIP_PROGRESS_START"":0.1,""MAX_QUEUE_SIZE"":20,""PROGRESS_UPDATE_INTERVAL"":10}],""Spe"":[""Spe"",0,{}],""Ume"":[""Ume"",0,{}],""cge"":[""cge"",0,{}],""Tfe"":[""Tfe"",0,{}],""Qme"":[""Qme"",0,{}],""jde"":[""jde"",0,{}]};
if(!Array.isArray(constructors)||Object.getPrototypeOf(constructors)!==Array.prototype)bad();
const constructorLength=own(constructors,""length""),constructorKeys=Reflect.ownKeys(constructors);
if(![16,20].includes(constructorLength)||constructorKeys.length!==constructorLength+1||constructorKeys[constructorLength]!==""length"")bad();
for(let i=0;i<constructorLength;i++)if(constructorKeys[i]!==String(i)||typeof own(constructors,String(i))!==""function"")bad();
const constructorNames=constructorLength===20?[""kde"",""Sfe"",""mpe"",""Yde"",""HSe"",""USe"",""Jse"",""Lpe"",""Kme"",""fpe"",""P1e"",""mge"",""tge"",""$me"",""Spe"",""Ume"",""cge"",""Tfe"",""Qme"",""jde""]:[""kde"",""Sfe"",""Jse"",""Lpe"",""Kme"",""fpe"",""P1e"",""mge"",""tge"",""$me"",""Spe"",""Ume"",""cge"",""Tfe"",""Qme"",""jde""];
const constructorMetadata=(c,name)=>{const [label,arity,statics]=constructorProfiles[name];if(own(c,""name"")!==label||own(c,""length"")!==arity)bad();for(const key of Object.keys(statics)){const d=Object.getOwnPropertyDescriptor(c,key);if(!d||!Object.hasOwn(d,""value"")||!d.writable||!d.configurable||!d.enumerable||own(c,key)!==statics[key])bad();}};
const constructorInstance=(o,name)=>{object(o);const i=constructorNames.indexOf(name);if(i<0)bad();const c=own(constructors,String(i)),p=own(c,""prototype"");if(Object.getPrototypeOf(o)!==p||own(p,""constructor"")!==c)bad();constructorMetadata(c,name);constructorHeld.push([o,p,c,name,i]);return o;};
const verifyConstructorAssociations=()=>{if(Object.getPrototypeOf(constructors)!==Array.prototype||own(constructors,""length"")!==constructorLength)bad();const k=Reflect.ownKeys(constructors);if(k.length!==constructorKeys.length||k.some((v,i)=>v!==constructorKeys[i]))bad();for(const [o,p,c,name,i] of constructorHeld){if(own(constructors,String(i))!==c||Object.getPrototypeOf(o)!==p||own(c,""prototype"")!==p||own(p,""constructor"")!==c)bad();constructorMetadata(c,name);}};

const klass=n=>{const c=own(scope,n);if(typeof c!==""function"")bad();return c;};
const instance=(o,c)=>{object(o);if(Object.getPrototypeOf(o)!==own(c,""prototype""))bad();return o;};
const envClass=klass(""x""),env=instance(own(envClass,""env""),envClass);
const documentUuid=id(own(env,""_id""));if(own(env,""_doctype"")!==3)bad();
const family=n=>{const c=klass(n),v=optional(c,""manager"");return {marker:v.marker,count:v.marker===""present""?map(own(instance(v.value,c),""map"")):null};};
const families={tracks:family(""vn""),pads:family(""Jn""),vias:family(""Dn""),circles:family(""Xi""),
radiusDimensions:family(""ol""),rectangles:family(""nn""),strings:family(""bo""),protractorDimensions:family(""_a""),
lengthDimensions:family(""Aa""),smartDimensions:family(""GR""),components:family(""Ms""),polygons:family(""Fi""),
images:family(""oa""),pictures:family(""c0""),copper:family(""Yo""),inner:family(""zo""),groups:family(""Mp"")};
const boardClass=klass(""_s""),boardOwner=optional(boardClass,""instance"");
let board={ownerMarker:boardOwner.marker,boardMarker:null,outlineCount:null,autoGenerate:null};
if(boardOwner.marker===""present""){
const owner=instance(boardOwner.value,boardClass),value=optional(owner,""_board"");if(value.marker===""present"")object(value.value);
board={ownerMarker:""present"",boardMarker:value.marker,outlineCount:map(own(owner,""_outlineCollect"")),autoGenerate:flag(own(owner,""_autoGenerate""))};
}
const panelClass=klass(""ai""),panelOwner=optional(panelClass,""model"");
let panelization={ownerMarker:panelOwner.marker,viewModelMatchesOwner:null,activation:null,counts:null};
if(panelOwner.marker===""present""){
const owner=instance(panelOwner.value,panelClass),view=constructorInstance(own(scope,""Si""),""Jse""),param=object(own(owner,""_param""));
const borders=own(owner,""borderClosures"");if(array(borders)!==2)bad();
const counts={items:array(own(owner,""items"")),outlines:array(own(owner,""outlines"")),slots:array(own(owner,""slots"")),
originOutline:array(own(owner,""originOutline"")),holes:array(own(owner,""holes"")),positionHoles:array(own(owner,""positionHoles"")),
stampGroups:array(own(owner,""stampGroups"")),marks:array(own(owner,""marks"")),vCutShapes:array(own(owner,""vCutShapes"")),
closures:array(own(owner,""closures"")),borderClosuresFirst:array(own(borders,""0"")),borderClosuresSecond:array(own(borders,""1"")),
borderClosuresOuterMost:array(own(owner,""borderClosures_outerMost""))};
panelization={ownerMarker:""present"",viewModelMatchesOwner:own(view,""model"")===owner,
activation:{on:flag(own(param,""on"")),success:flag(own(param,""success""))},counts};
}
const spatial=instance(own(scope,""Ht""),klass(""tV"")),treeSeen=new Set();
const mdPrototype=own(klass(""Md""),""prototype""),f0Prototype=own(klass(""F0""),""prototype""),
niPrototype=own(klass(""NI""),""prototype""),iyPrototype=own(klass(""iy""),""prototype"");
const empty=()=>({outerKeyCount:0,nestedKeyCount:0,treeCount:0,itemCount:0,changeCount:0,deadCount:0,
rootNodeCount:0,rootLeafCount:0,rootLeafWithoutItemCount:0,rootLeafWithoutItemOrDeadCount:0,
itemWithoutRootLeafCount:0,itemWithoutRootLeafOrChangeCount:0,repeatedRootLeafCount:0});
const inspectTree=(value,result)=>{
object(value);const prototype=Object.getPrototypeOf(value),nodePrototype=prototype===mdPrototype?niPrototype:prototype===f0Prototype?iyPrototype:null;
if(nodePrototype===null||treeSeen.has(value)||++budget.trees>128)bad();treeSeen.add(value);result.treeCount++;
const items=own(value,""items""),changes=own(value,""changeList""),dead=own(value,""deadList"");
const itemCount=set(items),changeCount=set(changes),deadCount=set(dead);
result.itemCount+=itemCount;result.changeCount+=changeCount;result.deadCount+=deadCount;
const root=object(own(value,""root"")),nodes=new Set(),leaves=new Set(),stack=[[root,null,0]];
while(stack.length){
const current=stack.pop(),node=current[0],parent=current[1],depth=current[2];
if(depth>64||nodes.has(node)||Object.getPrototypeOf(node)!==nodePrototype||own(node,""parent"")!==parent)bad();
nodes.add(node);spend(1);result.rootNodeCount++;
const children=own(node,""childs""),n=array(children);
for(let i=0;i<n;i++){
const child=object(own(children,String(i))),childPrototype=Object.getPrototypeOf(child);
if(childPrototype===niPrototype||childPrototype===iyPrototype){
if(childPrototype!==nodePrototype)bad();stack.push([child,node,depth+1]);
}else{
result.rootLeafCount++;
if(leaves.has(child)){result.repeatedRootLeafCount++;continue;}leaves.add(child);
if(!has(items,child)){result.rootLeafWithoutItemCount++;if(!has(dead,child))result.rootLeafWithoutItemOrDeadCount++;}
}
}
}
iterate(items,Set.prototype,itemCount,item=>{object(item);if(!leaves.has(item)){result.itemWithoutRootLeafCount++;if(!has(changes,item))result.itemWithoutRootLeafOrChangeCount++;}});
};
const branch=(value,nested)=>{
const result=empty(),n=map(value);result.outerKeyCount=n;
iterate(value,Map.prototype,n,(_key,entry)=>{
if(nested){const length=map(entry);result.nestedKeyCount+=length;iterate(entry,Map.prototype,length,(_layer,tree)=>inspectTree(tree,result));}
else inspectTree(entry,result);
});return result;
};
const spatialIndexes={typed:branch(own(spatial,""map""),true),other:branch(own(spatial,""otherMap""),false),ratline:branch(own(spatial,""ratlineMap""),false)};

const interaction=(()=>{
const startEntries=budget.entries;
const reference=(o,k)=>{const v=optional(o,k);if(v.marker===""present"")object(v.value);return v.marker;};
const timer=(o,k)=>{const v=optional(o,k);if(v.marker===""present""&&(typeof v.value!==""number""||!Number.isSafeInteger(v.value)||Object.is(v.value,-0)||v.value<0))bad();return v.marker;};
const matching=(o,k,target)=>{const v=optional(o,k);if(v.marker!==""present"")return v.marker;object(v.value);return v.value===target?""matching"":""other"";};
const named=(name,type)=>instance(own(scope,name),klass(type));
const selection=named(""Fe"",""XU""),root=constructorInstance(own(scope,""$0""),""Lpe""),rootNext=optional(root,""nextTool"");
let navigation=null;
if(rootNext.marker===""present""){
object(rootNext.value);
if(Object.getPrototypeOf(rootNext.value)===own(klass(""m0e""),""prototype"")){
const nav=rootNext.value,next=optional(nav,""nextTool"");let idle=null,nextKind=null;
if(next.marker===""present""){
object(next.value);nextKind=""other"";
if(Object.getPrototypeOf(next.value)===own(klass(""Eh""),""prototype"")){
nextKind=""Eh"";idle={drawing:flag(own(next.value,""drawing"")),filterCount:set(own(next.value,""filterItems"")),next:reference(next.value,""nextTool"")};
}
}
navigation={drawing:flag(own(nav,""drawing"")),filterCount:set(own(nav,""filterItems"")),mouseRightDown:flag(own(nav,""isMouseRightDown"")),
mouseMidDown:flag(own(nav,""isMouseMidDown"")),markCount:array(own(nav,""mark"")),shiftHelp:reference(nav,""shiftMoveHelpLine""),
wheelTimer:timer(object(own(nav,""wheelData"")),""clearTime""),nextMarker:next.marker,nextKind,idle};
}
}
const button=optional(root,""mouseDownStatus"");let mouseDownButton=null;
if(button.marker===""present""){if(!Number.isSafeInteger(button.value)||Object.is(button.value,-0)||button.value<0||button.value>4)bad();mouseDownButton=button.value;}
const sceneOwner=constructorInstance(own(scope,""Pi""),""Kme""),scene=own(sceneOwner,""scene""),sceneCount=array(scene);if(sceneCount>8)bad();
const modes=[];for(let i=0;i<sceneCount;i++){const v=own(scene,String(i));if(!Number.isSafeInteger(v)||Object.is(v,-0)||v<1||v>6)bad();modes.push(v);}
const sceneState={modes,dropDrag:flag(own(sceneOwner,""_dropDrag"")),historyToolCount:set(own(sceneOwner,""needHistoryTool""))};
const selected={items:array(own(selection,""items"")),selections:array(own(selection,""selections"")),
components:array(own(selection,""components"")),tracks:array(own(selection,""tracks"")),lines:set(own(selection,""lines"")),
points:array(own(selection,""currentPointSelectedItems"")),annotations:array(own(selection,""selectAnnotations"")),
drcItems:set(own(selection,""drcItems"")),selectionOrder:map(own(selection,""selectionOrder""))};
const selectionState={counts:selected,mouseLeftDown:flag(own(selection,""mouseLeftDown"")),mouseLeftUp:flag(own(selection,""mouseLeftUp"")),
dragging:flag(own(selection,""dragging"")),readyToCopyDragging:flag(own(selection,""readyToCopyDragging"")),
keepSelection:flag(own(selection,""keepSelection"")),specialPaste:flag(own(selection,""isSpecialPaste"")),dialog:reference(selection,""_dialog"")};
const control=constructorInstance(own(scope,""Sr""),""fpe""),flipping=constructorInstance(own(scope,""cm""),""P1e""),attributes=constructorInstance(own(scope,""nu""),""mge""),type=optional(attributes,""_type"");
if(type.marker===""present""&&typeof type.value!==""string"")bad();
const toolHistoryClass=klass(""Cy""),toolHistory=optional(toolHistoryClass,""instance"");let history=null;
if(toolHistory.marker===""present""){
const owner=instance(toolHistory.value,toolHistoryClass),activeId=optional(owner,""activeToolId"");
if(activeId.marker===""present""&&typeof activeId.value!==""string"")bad();
history={activeTool:reference(owner,""activeToolHistory""),activeId:activeId.marker};
}
const smart=constructorInstance(own(scope,""Us""),""tge""),command=instance(own(smart,""command""),klass(""De""));
const smartState={control:reference(smart,""_control""),dimension:reference(smart,""dimension""),
start:reference(smart,""start""),end:reference(smart,""end""),startSpotCount:array(own(smart,""startSpots"")),
highlightSpotCount:array(own(smart,""highlightedSpots"")),historyItemCount:set(own(smart,""_historyItems"")),
commandCount:array(own(command,""_commands"")),waitingUploadCount:array(own(command,""waitingUploadStack"")),
commandIndexCount:map(own(command,""idMap"")),commandFromOutside:flag(own(smart,""initCommandFromOutside""))};
const turn=constructorInstance(own(scope,""Xo""),""$me"");
const controllers={pointControl:reference(control,""control""),lockedLayerCount:set(own(control,""lockedLayers"")),
mouseMoveCheck:flag(own(control,""mouseMoveCheck"")),mouseAltDown:flag(own(control,""mouseAltDown"")),hasAlt:flag(own(control,""hasAlt"")),
layerTool:reference(constructorInstance(own(scope,""dl""),""Spe""),""tool""),routeTool:reference(constructorInstance(own(scope,""Yr""),""Ume""),""tool""),
attributeTool:reference(constructorInstance(own(scope,""ru""),""cge""),""tool""),flipMoveTool:reference(flipping,""moveTool""),flipping:flag(own(flipping,""_flipping"")),
toolHistoryMarker:toolHistory.marker,toolHistory:history,attributeType:type.marker,attributesUnmounted:flag(own(attributes,""isUnmounted"")),
attributeTimer:timer(attributes,""_ui2PCBAboutAttrDataUpdateTimer""),smart:smartState,
turn:{selectionRelation:matching(turn,""currTool"",selection),itemCount:array(own(turn,""items"")),queueCount:array(own(turn,""_flipQueue"")),
settleCallbackCount:array(own(turn,""_onSettleCallbacks"")),processing:flag(own(turn,""_isProcessingFlip""))}};
const optionalMap=(name,field)=>{
const c=klass(name),v=optional(c,""manager"");return {marker:v.marker,count:v.marker===""present""?map(own(instance(v.value,c),field)):null};
};
const dictionarySets=value=>{
object(value);const p=Object.getPrototypeOf(value);if(p!==Object.prototype&&p!==null)bad();
const keys=Reflect.ownKeys(value);spend(keys.length);let members=0;
for(const key of keys){if(typeof key!==""string"")bad();members+=set(own(value,key));}
return {keys:keys.length,members};
};
const innerClass=klass(""zo""),innerOwner=optional(innerClass,""manager"");let innerModels=null;
if(innerOwner.marker===""present"")innerModels=dictionarySets(own(instance(innerOwner.value,innerClass),""layerMapSet""));
const innerView=constructorInstance(own(scope,""Wn""),""Tfe""),innerViews=dictionarySets(own(innerView,""layerMapSet""));
const retainedClass=klass(""Hb""),retainedOwner=optional(retainedClass,""manager"");let retainedLines=null;
if(retainedOwner.marker===""present""){
const owner=instance(retainedOwner.value,retainedClass);retainedLines={mapCount:map(own(owner,""map"")),updateCount:set(own(owner,""updateIds""))};
}
const secondary={partitions:optionalMap(""Nn"",""items""),innerModelMarker:innerOwner.marker,innerModels,innerViews,
innerViewManagerMatches:innerOwner.marker===""present""&&own(innerView,""mgr"")===innerOwner.value,
smartDimensionViews:map(own(constructorInstance(own(scope,""Yh""),""Qme""),""map"")),groupViews:map(own(constructorInstance(own(scope,""Ft""),""jde""),""map"")),
retainedLineMarker:retainedOwner.marker,retainedLines};
return {schema:""easyeda-pro-control.pcb-diagnostic-interaction.v1"",
toolChain:{nextMarker:rootNext.marker,nextKind:rootNext.marker===""present""?(navigation===null?""other"":""m0e""):null,
rightDownTimer:timer(root,""mouseRightDownTimer""),mouseDownMarker:button.marker,mouseDownButton,navigation},
scene:sceneState,selection:selectionState,controllers,secondary,collectionEntries:budget.entries-startEntries};
})();

verifyConstructorAssociations();
for(const item of retained){const d=descriptor(item[0],item[1]);if(item[2]===""absent""?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[3])bad();}
for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}
if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad();
const output=JSON.stringify({schema:""easyeda-pro-control.pcb-diagnostic-root-inventory.v1"",documentUuid,families,board,panelization,spatialIndexes,interaction,collectionEntries:budget.entries,treeCount:budget.trees});
if(output.length>8192)bad();
return output;
}";
  const string StringRendererAssociationFunction=@"function(originalCallback){

""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};


const channel=(bus,name,klassName)=>{
named(bus,klassName);if(own(globalThis,name)!==bus)bad();
const bc=object(own(bus,""bc"")),constructor=own(globalThis,""BroadcastChannel""),prototype=own(constructor,""prototype"");
if(Object.getPrototypeOf(bc)!==prototype||Object.hasOwn(bc,""name""))bad();
const d=Object.getOwnPropertyDescriptor(prototype,""name"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();
if(Reflect.apply(d.get,bc,[])!==name)bad();
const uuid=id(own(bus,""uuid""),/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/);
return {name,uuid};
};

if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad();
const scope=object(own(this,""object"")),klass=n=>{const c=own(scope,n);if(typeof c!==""function"")bad();return c;};
const instance=(o,c)=>{object(o);if(Object.getPrototypeOf(o)!==own(c,""prototype""))bad();return o;};
const ec=klass(""x""),env=instance(own(ec,""env""),ec),compiler=instance(own(env,""_compiler""),klass(""Zu""));
const base=instance(own(compiler,""base""),klass(""A8e"")),consistency=instance(own(base,""consistencyManager""),klass(""sCe""));
const documentUuid=id(own(env,""_id""),/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/),projectUuid=id(own(base,""path""),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/);
const windowTabId=id(own(base,""windowId""),/^[A-Za-z0-9_-]{1,128}$/),tabId=documentUuid+""@""+projectUuid;
const uniqueId=id(own(consistency,""unique""),/^[a-f0-9]{16}$/),client=id(own(consistency,""client""),/^[A-Za-z0-9_-]{1,128}$/);
if(own(env,""_doctype"")!==3||own(env,""_tabId"")!==tabId||own(compiler,""uuid"")!==documentUuid||own(base,""uuid"")!==documentUuid||
own(compiler,""consistencyManager"")!==consistency||own(base,""_headType"")!==""PCB""||client!==windowTabId)bad();
const compilerChannel=instance(own(env,""compilerChannel""),klass(""mCe""));
if(own(base,""channel"")!==compilerChannel)bad();
const registry=plain(own(compilerChannel,""compiler"")),registryNames=keys(registry);
if(registryNames.length>6||!registryNames.includes(""PCB"")||registryNames.some(n=>![""SYMBOL"",""FOOTPRINT"",""DEVICE"",""SCH_PAGE"",""PCB"",""PANEL""].includes(n)))bad();
const compilerRegistry={};for(const kind of registryNames){const map=own(registry,kind),n=size(map,Map.prototype);
if(kind===""PCB""){if(n!==1||Reflect.apply(own(Map.prototype,""get""),map,[uniqueId])!==base)bad();compilerRegistry[kind]=[uniqueId];}
else{if(n!==0)bad();compilerRegistry[kind]=[];}}
const mc=klass(""wi""),manager=instance(own(mc,""manager""),mc),alternate=marker(mc,""otherDecodingProjectId"");
if(alternate===""present"")bad();
const footprints={holderKeys:emptyMap(own(manager,""map"")),otherProjectManagerKeys:emptyObject(own(mc,""otherProjectManagerMap"")),otherDecodingProjectId:alternate};
const bus=channel(own(base,""dataBus""),""/""+windowTabId+""/project/""+projectUuid,""J"");
const compilerState={isProject:flag(own(base,""isProject"")),isInit:flag(own(base,""isInit"")),canSave:flag(own(base,""canSave"")),
isInitIng:flag(own(base,""isInitIng"")),isDestroy:flag(own(base,""isDestroy""))};
const channelState={locker:count(own(compilerChannel,""_locker"")),lockerTicket:count(own(compilerChannel,""_lockerTicket"")),
temporaryUnlock:marker(compilerChannel,""_temporaryUnlock""),temporaryUnlockValue:null,isPull:flag(own(compilerChannel,""isPull""))};
if(channelState.temporaryUnlock===""present"")channelState.temporaryUnlockValue=count(own(compilerChannel,""_temporaryUnlock""));
verify();if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad();
return JSON.stringify({schema:""easyeda-pro-control.pcb-string-renderer-association.v1"",
identity:{projectUuid,documentUuid,windowTabId,tabId,uniqueId,client},bus,compilerState,compilerRegistry,channelState,footprints});
}";
  const string StringWorkerAssociationExpression=@"(()=>{

""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};


const channel=(bus,name,klassName)=>{
named(bus,klassName);if(own(globalThis,name)!==bus)bad();
const bc=object(own(bus,""bc"")),constructor=own(globalThis,""BroadcastChannel""),prototype=own(constructor,""prototype"");
if(Object.getPrototypeOf(bc)!==prototype||Object.hasOwn(bc,""name""))bad();
const d=Object.getOwnPropertyDescriptor(prototype,""name"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();
if(Reflect.apply(d.get,bc,[])!==name)bad();
const uuid=id(own(bus,""uuid""),/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/);
return {name,uuid};
};

const project=named(own(globalThis,""PROJECT""),""Lg""),gp=Object.getPrototypeOf(Object.getPrototypeOf(project));
if(own(own(gp,""constructor""),""name"")!==""Gd""||Object.getPrototypeOf(gp)!==Object.prototype)bad();
const consistency=named(own(project,""consistencyManager""),""ja"");
const projectUuid=id(own(project,""uuid""),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),
branchUuid=id(own(project,""_branchUuid""),/^[a-f0-9]{32}$/),windowTabId=id(own(globalThis,""_TAB_ID_""),/^[A-Za-z0-9_-]{1,128}$/);
const bus=channel(own(project,""workerBus""),""/""+windowTabId+""/project/""+projectUuid,""JP"");
const uploadMaps={},taskSets={};
for(const key of [""bufferUploadData"",""bufferUploadCache""])uploadMaps[key]=emptyMap(own(project,key));
for(const key of [""task1"",""task2"",""task3"",""cachePromise"",""publishTask"",""rollbackPromise"",""syncPendingNodeUuids"",""confirmedEmptyNodeUuids"",""warnedEmptyNodeUuids""])taskSets[key]=emptySet(own(project,key));
const membership={uniqueIdsKeys:emptyObject(own(consistency,""uniqueIds""))};
verify();
return JSON.stringify({schema:""easyeda-pro-control.pcb-string-worker-association.v1"",identity:{projectUuid,branchUuid,windowTabId},
bus,uploadMaps,taskSets,uniqueIdsKeys:membership.uniqueIdsKeys});
})()";
  const string StringEmptyProducersFunction=@"function(originalCallback,constructors){

""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};

if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad();
const scope=object(own(this,""object"")),klass=n=>{const c=own(scope,n);if(typeof c!==""function"")bad();return c;};

const constructorHeld=[],constructorProfiles={""kde"":[""kde"",0,{}],""Sfe"":[""Sfe"",0,{}],""mpe"":[""mpe"",0,{}],""Yde"":[""Yde"",0,{}],""HSe"":[""HSe"",0,{}],""USe"":[""USe"",0,{}],""Jse"":[""Jse"",0,{}],""Lpe"":[""Lpe"",1,{}],""Kme"":[""Kme"",0,{}],""fpe"":[""fpe"",0,{}],""P1e"":[""P1e"",0,{}],""mge"":[""mge"",0,{}],""tge"":[""tge"",0,{}],""$me"":[""Sy"",0,{""FLIP_PROGRESS_RANGE"":0.8,""FLIP_PROGRESS_START"":0.1,""MAX_QUEUE_SIZE"":20,""PROGRESS_UPDATE_INTERVAL"":10}],""Spe"":[""Spe"",0,{}],""Ume"":[""Ume"",0,{}],""cge"":[""cge"",0,{}],""Tfe"":[""Tfe"",0,{}],""Qme"":[""Qme"",0,{}],""jde"":[""jde"",0,{}]};
if(!Array.isArray(constructors)||Object.getPrototypeOf(constructors)!==Array.prototype)bad();
const constructorLength=own(constructors,""length""),constructorKeys=Reflect.ownKeys(constructors);
if(![20].includes(constructorLength)||constructorKeys.length!==constructorLength+1||constructorKeys[constructorLength]!==""length"")bad();
for(let i=0;i<constructorLength;i++)if(constructorKeys[i]!==String(i)||typeof own(constructors,String(i))!==""function"")bad();
const constructorNames=[""kde"",""Sfe"",""mpe"",""Yde"",""HSe"",""USe"",""Jse"",""Lpe"",""Kme"",""fpe"",""P1e"",""mge"",""tge"",""$me"",""Spe"",""Ume"",""cge"",""Tfe"",""Qme"",""jde""];
const constructorMetadata=(c,name)=>{const [label,arity,statics]=constructorProfiles[name];if(own(c,""name"")!==label||own(c,""length"")!==arity)bad();for(const key of Object.keys(statics)){const d=Object.getOwnPropertyDescriptor(c,key);if(!d||!Object.hasOwn(d,""value"")||!d.writable||!d.configurable||!d.enumerable||own(c,key)!==statics[key])bad();}};
const constructorInstance=(o,name)=>{object(o);const i=constructorNames.indexOf(name);if(i<0)bad();const c=own(constructors,String(i)),p=own(c,""prototype"");if(Object.getPrototypeOf(o)!==p||own(p,""constructor"")!==c)bad();constructorMetadata(c,name);constructorHeld.push([o,p,c,name,i]);return o;};
const verifyConstructorAssociations=()=>{if(Object.getPrototypeOf(constructors)!==Array.prototype||own(constructors,""length"")!==constructorLength)bad();const k=Reflect.ownKeys(constructors);if(k.length!==constructorKeys.length||k.some((v,i)=>v!==constructorKeys[i]))bad();for(const [o,p,c,name,i] of constructorHeld){if(own(constructors,String(i))!==c||Object.getPrototypeOf(o)!==p||own(c,""prototype"")!==p||own(p,""constructor"")!==c)bad();constructorMetadata(c,name);}};

const instance=(o,c)=>{object(o);if(Object.getPrototypeOf(o)!==own(c,""prototype""))bad();return o;};
const ec=klass(""x""),env=instance(own(ec,""env""),ec),documentUuid=id(own(env,""_id""),/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/);
if(own(env,""_doctype"")!==3)bad();
const emptyArray=o=>{if(arraySize(o)!==0)bad();return [];};
const nullish=(o,k)=>{const m=marker(o,k);if(m===""present"")bad();return m;};
const modelClass=klass(""MI""),models=instance(own(modelClass,""manager""),modelClass);
const views=constructorInstance(own(scope,""jo""),""mpe"");
const model={netKeys:emptyMap(own(models,""map"")),idKeys:emptyMap(own(models,""idMap"")),
lastRatline:nullish(models,""_lastRatline""),last:nullish(models,""_last"")};
const view={netKeys:emptyMap(own(views,""map"")),idKeys:emptyMap(own(views,""idMap"")),
highlightNets:emptySet(own(views,""highLightNets"")),clickHighlight:emptySet(own(views,""clickHighlightRatlines"")),
hoverHighlight:emptySet(own(views,""hoverHighlightRatlines""))};
const network=constructorInstance(own(scope,""ze""),""Yde""),updates=plain(own(network,""updateNets""));
if(keys(updates).length!==3)bad();
const notification=instance(own(network,""debounce""),klass(""U5""));
const net={keys:emptyMap(own(network,""map"")),noneKeys:emptyMap(own(network,""noneNetMap"")),
lengthKeys:emptyMap(own(network,""netLength"")),modifyKeys:emptyMap(own(network,""netModify"")),
rubbish:emptySet(own(network,""rubbish"")),options:emptyArray(own(network,""netOptions"")),
add:emptyArray(own(updates,""addNet"")),delete:emptyArray(own(updates,""deleteNet"")),
updateLengthKeys:emptyObject(own(updates,""updateNetLength"")),grayKeys:emptyObject(own(network,""ratlineVisibleBeforeGray"")),
viewGroups:null,viewGroupsMarker:marker(network,""_viewGroupIds""),updateLeftTree:nullish(network,""updateLeftTree""),
notification:{func:nullish(notification,""func""),animationFrame:nullish(notification,""animationFrameId""),
lastTime:own(notification,""lastTime""),delay:own(notification,""delay"")}};
if(net.viewGroupsMarker===""present"")net.viewGroups=emptyArray(own(network,""_viewGroupIds""));
if(net.notification.lastTime!==-1||net.notification.delay!==0)bad();
const clusters={networkKeys:emptyMap(own(klass(""Xh""),""map"")),
wireClusterKeys:emptyMap(own(constructorInstance(own(scope,""h_""),""HSe""),""map"")),
jumpWireKeys:emptyMap(own(constructorInstance(own(scope,""aE""),""USe""),""map"")),
useWireClusterCache:flag(own(klass(""h0""),""useWireClusterCache"")),emptyNetChange:flag(own(klass(""h0""),""emptyNetChange""))};
verifyConstructorAssociations();verify();if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad();
return JSON.stringify({schema:""easyeda-pro-control.pcb-string-empty-producers.v1"",documentUuid,model,view,net,clusters});
}";
  const string ModelDiagnosticConstructorsFunction=@"function(originalCallback,teardropProof){""use strict"";
let profile=null,stage=""callback"",reason=""unexpected"";
const bad=r=>{reason=r;throw new Error(""PCB_CONSTRUCTOR_SCOPE"");};
const held=[],own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad(""object"");const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad(""own"");held.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad(""object"");return o;};
try{
if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad(""callback"");
stage=""scope"";const scope=own(this,""object""),owners=[[""kde"",""kde"",""Xe"",0,{}],[""Sfe"",""Sfe"",""Zec"",0,{}],[""Jse"",""Jse"",""Si"",0,{}],[""Lpe"",""Lpe"",""$0"",1,{}],[""Kme"",""Kme"",""Pi"",0,{}],[""fpe"",""fpe"",""Sr"",0,{}],[""P1e"",""P1e"",""cm"",0,{}],[""mge"",""mge"",""nu"",0,{}],[""tge"",""tge"",""Us"",0,{}],[""$me"",""Sy"",""Xo"",0,{""FLIP_PROGRESS_RANGE"":0.8,""FLIP_PROGRESS_START"":0.1,""MAX_QUEUE_SIZE"":20,""PROGRESS_UPDATE_INTERVAL"":10}],[""Spe"",""Spe"",""dl"",0,{}],[""Ume"",""Ume"",""Yr"",0,{}],[""cge"",""cge"",""ru"",0,{}],[""Tfe"",""Tfe"",""Wn"",0,{}],[""Qme"",""Qme"",""Yh"",0,{}],[""jde"",""jde"",""Ft"",0,{}]],selected=[],instances=[];
profile=""Sfe"";stage=""owner"";
const tearsHeld=[],tearsPrototypes=[],tearsDescriptors=[],tearsTopics=[""isMoveSwitch"",""SetSuspend"",""cheakTearDrop"",""addModifyTeardrop"",""flushTearDrop"",""refreshTearDrop""],tearsMethods=[""isMoveSwitch"",""setSuspend"",""addModify"",""addMaodifyTeardrop"",""flushService"",""refreshService""];
const tearsOwn=(o,k)=>{const v=own(o,k);tearsHeld.push([o,k,v]);return v;};
const tearsProto=o=>{const p=Object.getPrototypeOf(o);tearsPrototypes.push([o,p]);return p;};
const tearsArray=(v,n)=>{if(!Array.isArray(v)||tearsProto(v)!==Array.prototype||tearsOwn(v,""length"")!==n)bad(""count"");const k=Reflect.ownKeys(v);if(k.length!==n+1||k[n]!==""length"")bad(""count"");for(let i=0;i<n;i++)if(k[i]!==String(i))bad(""count"");return v;};
const tearsNamed=(o,n)=>{object(o);const p=tearsProto(o),c=tearsOwn(p,""constructor"");if(typeof c!==""function""||tearsOwn(c,""name"")!==n||tearsOwn(c,""prototype"")!==p)bad(""instance"");return o;};
tearsArray(teardropProof,3);const teardropOwner=tearsNamed(tearsOwn(teardropProof,""0""),""Sfe""),tearsCallbacks=tearsArray(tearsOwn(teardropProof,""1""),6),tearsTargets=tearsArray(tearsOwn(teardropProof,""2""),6);
const tearsPrototype=tearsProto(teardropOwner);if(tearsProto(tearsPrototype)!==Object.prototype)bad(""prototype"");
const tearsBridge=tearsNamed(tearsOwn(globalThis,""MSG_BUS_PCB""),""HJ""),tearsBus=tearsNamed(tearsOwn(tearsBridge,""messageBus""),""Oet""),tearsRegistry=object(tearsOwn(tearsBus,""subscribed""));
const tearsRegistryPrototype=tearsProto(tearsRegistry);if(tearsRegistryPrototype!==Object.prototype&&tearsRegistryPrototype!==null)bad(""prototype"");
for(let i=0;i<6;i++){const tasks=tearsArray(tearsOwn(tearsRegistry,tearsTopics[i]),1),task=tearsNamed(tearsOwn(tasks,""0""),""Z1e""),callback=tearsOwn(task,""callback""),method=tearsMethods[i];if(tearsOwn(task,""isRunning"")!==true||typeof callback!==""function""||tearsOwn(tearsCallbacks,String(i))!==callback)bad(""callback"");if(Object.getOwnPropertyDescriptor(teardropOwner,method)!==undefined)bad(""shadow"");const d=Object.getOwnPropertyDescriptor(tearsPrototype,method);if(!d||!Object.hasOwn(d,""value"")||!d.writable||!d.configurable||d.enumerable||typeof d.value!==""function""||tearsOwn(tearsTargets,String(i))!==d.value)bad(""target"");tearsDescriptors.push([method,d]);}
const verifyTeardropOwner=()=>{for(const [o,k,v]of tearsHeld){const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value"")||!Object.is(d.value,v))bad(""own"");}for(const [o,p]of tearsPrototypes)if(Object.getPrototypeOf(o)!==p)bad(""prototype"");for(const [k,d]of tearsDescriptors){if(Object.getOwnPropertyDescriptor(teardropOwner,k)!==undefined)bad(""shadow"");const n=Object.getOwnPropertyDescriptor(tearsPrototype,k);if(!n||!Object.hasOwn(n,""value"")||n.value!==d.value||n.writable!==d.writable||n.configurable!==d.configurable||n.enumerable!==d.enumerable)bad(""target"");}};

for(const [label,name,key,arity,statics] of owners){profile=label;stage=""owner"";const o=label===""Sfe""?teardropOwner:own(scope,key);if(o===null||typeof o!==""object""||Array.isArray(o))bad(""object"");stage=""constructor"";const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function"")bad(""function"");stage=""metadata"";if(own(c,""name"")!==name)bad(""name"");if(own(c,""length"")!==arity)bad(""arity"");if(own(c,""prototype"")!==p)bad(""prototype"");stage=""statics"";for(const key of Object.keys(statics))if(own(c,key)!==statics[key])bad(""static"");selected.push(c);instances.push([o,p]);}
profile=null;stage=""reproof"";for(const [o,p] of instances)if(Object.getPrototypeOf(o)!==p)bad(""prototype"");
for(const [o,k,v] of held){const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value"")||!Object.is(d.value,v))bad(""own"");}
verifyTeardropOwner();
if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad(""callback"");
return selected;
}catch{return JSON.stringify({schema:""easyeda-pro-control.pcb-constructor-failure.v1"",bundle:""diagnostic"",profile,stage,reason});}}";
  const string ModelPrecreateConstructorsFunction=@"function(originalCallback,teardropProof){""use strict"";
let profile=null,stage=""callback"",reason=""unexpected"";
const bad=r=>{reason=r;throw new Error(""PCB_CONSTRUCTOR_SCOPE"");};
const held=[],own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad(""object"");const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad(""own"");held.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad(""object"");return o;};
try{
if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad(""callback"");
stage=""scope"";const scope=own(this,""object""),owners=[[""kde"",""kde"",""Xe"",0,{}],[""Sfe"",""Sfe"",""Zec"",0,{}],[""mpe"",""mpe"",""jo"",0,{}],[""Yde"",""Yde"",""ze"",0,{}],[""HSe"",""HSe"",""h_"",0,{}],[""USe"",""USe"",""aE"",0,{}],[""Jse"",""Jse"",""Si"",0,{}],[""Lpe"",""Lpe"",""$0"",1,{}],[""Kme"",""Kme"",""Pi"",0,{}],[""fpe"",""fpe"",""Sr"",0,{}],[""P1e"",""P1e"",""cm"",0,{}],[""mge"",""mge"",""nu"",0,{}],[""tge"",""tge"",""Us"",0,{}],[""$me"",""Sy"",""Xo"",0,{""FLIP_PROGRESS_RANGE"":0.8,""FLIP_PROGRESS_START"":0.1,""MAX_QUEUE_SIZE"":20,""PROGRESS_UPDATE_INTERVAL"":10}],[""Spe"",""Spe"",""dl"",0,{}],[""Ume"",""Ume"",""Yr"",0,{}],[""cge"",""cge"",""ru"",0,{}],[""Tfe"",""Tfe"",""Wn"",0,{}],[""Qme"",""Qme"",""Yh"",0,{}],[""jde"",""jde"",""Ft"",0,{}]],selected=[],instances=[];
profile=""Sfe"";stage=""owner"";
const tearsHeld=[],tearsPrototypes=[],tearsDescriptors=[],tearsTopics=[""isMoveSwitch"",""SetSuspend"",""cheakTearDrop"",""addModifyTeardrop"",""flushTearDrop"",""refreshTearDrop""],tearsMethods=[""isMoveSwitch"",""setSuspend"",""addModify"",""addMaodifyTeardrop"",""flushService"",""refreshService""];
const tearsOwn=(o,k)=>{const v=own(o,k);tearsHeld.push([o,k,v]);return v;};
const tearsProto=o=>{const p=Object.getPrototypeOf(o);tearsPrototypes.push([o,p]);return p;};
const tearsArray=(v,n)=>{if(!Array.isArray(v)||tearsProto(v)!==Array.prototype||tearsOwn(v,""length"")!==n)bad(""count"");const k=Reflect.ownKeys(v);if(k.length!==n+1||k[n]!==""length"")bad(""count"");for(let i=0;i<n;i++)if(k[i]!==String(i))bad(""count"");return v;};
const tearsNamed=(o,n)=>{object(o);const p=tearsProto(o),c=tearsOwn(p,""constructor"");if(typeof c!==""function""||tearsOwn(c,""name"")!==n||tearsOwn(c,""prototype"")!==p)bad(""instance"");return o;};
tearsArray(teardropProof,3);const teardropOwner=tearsNamed(tearsOwn(teardropProof,""0""),""Sfe""),tearsCallbacks=tearsArray(tearsOwn(teardropProof,""1""),6),tearsTargets=tearsArray(tearsOwn(teardropProof,""2""),6);
const tearsPrototype=tearsProto(teardropOwner);if(tearsProto(tearsPrototype)!==Object.prototype)bad(""prototype"");
const tearsBridge=tearsNamed(tearsOwn(globalThis,""MSG_BUS_PCB""),""HJ""),tearsBus=tearsNamed(tearsOwn(tearsBridge,""messageBus""),""Oet""),tearsRegistry=object(tearsOwn(tearsBus,""subscribed""));
const tearsRegistryPrototype=tearsProto(tearsRegistry);if(tearsRegistryPrototype!==Object.prototype&&tearsRegistryPrototype!==null)bad(""prototype"");
for(let i=0;i<6;i++){const tasks=tearsArray(tearsOwn(tearsRegistry,tearsTopics[i]),1),task=tearsNamed(tearsOwn(tasks,""0""),""Z1e""),callback=tearsOwn(task,""callback""),method=tearsMethods[i];if(tearsOwn(task,""isRunning"")!==true||typeof callback!==""function""||tearsOwn(tearsCallbacks,String(i))!==callback)bad(""callback"");if(Object.getOwnPropertyDescriptor(teardropOwner,method)!==undefined)bad(""shadow"");const d=Object.getOwnPropertyDescriptor(tearsPrototype,method);if(!d||!Object.hasOwn(d,""value"")||!d.writable||!d.configurable||d.enumerable||typeof d.value!==""function""||tearsOwn(tearsTargets,String(i))!==d.value)bad(""target"");tearsDescriptors.push([method,d]);}
const verifyTeardropOwner=()=>{for(const [o,k,v]of tearsHeld){const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value"")||!Object.is(d.value,v))bad(""own"");}for(const [o,p]of tearsPrototypes)if(Object.getPrototypeOf(o)!==p)bad(""prototype"");for(const [k,d]of tearsDescriptors){if(Object.getOwnPropertyDescriptor(teardropOwner,k)!==undefined)bad(""shadow"");const n=Object.getOwnPropertyDescriptor(tearsPrototype,k);if(!n||!Object.hasOwn(n,""value"")||n.value!==d.value||n.writable!==d.writable||n.configurable!==d.configurable||n.enumerable!==d.enumerable)bad(""target"");}};

for(const [label,name,key,arity,statics] of owners){profile=label;stage=""owner"";const o=label===""Sfe""?teardropOwner:own(scope,key);if(o===null||typeof o!==""object""||Array.isArray(o))bad(""object"");stage=""constructor"";const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function"")bad(""function"");stage=""metadata"";if(own(c,""name"")!==name)bad(""name"");if(own(c,""length"")!==arity)bad(""arity"");if(own(c,""prototype"")!==p)bad(""prototype"");stage=""statics"";for(const key of Object.keys(statics))if(own(c,key)!==statics[key])bad(""static"");selected.push(c);instances.push([o,p]);}
profile=null;stage=""reproof"";for(const [o,p] of instances)if(Object.getPrototypeOf(o)!==p)bad(""prototype"");
for(const [o,k,v] of held){const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value"")||!Object.is(d.value,v))bad(""own"");}
verifyTeardropOwner();
if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad(""callback"");
return selected;
}catch{return JSON.stringify({schema:""easyeda-pro-control.pcb-constructor-failure.v1"",bundle:""precreate"",profile,stage,reason});}}";
  const string CommonConstructorsFunction=@"function(originalCallback){""use strict"";
let profile=null,stage=""callback"",reason=""unexpected"";
const bad=r=>{reason=r;throw new Error(""PCB_CONSTRUCTOR_SCOPE"");};
const held=[],own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad(""object"");const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad(""own"");held.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad(""object"");return o;};
try{
if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad(""callback"");
stage=""scope"";const scope=own(this,""object""),owners=[[""Yme"",""Yme"",""Me"",0,{}],[""Nfe"",""Nfe"",""ce"",0,{}],[""Epe"",""Epe"",""rt"",0,{}],[""GSe"",""GSe"",""id"",0,{}]],selected=[],instances=[];

for(const [label,name,key,arity,statics] of owners){profile=label;stage=""owner"";const o=own(scope,key);if(o===null||typeof o!==""object""||Array.isArray(o))bad(""object"");stage=""constructor"";const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function"")bad(""function"");stage=""metadata"";if(own(c,""name"")!==name)bad(""name"");if(own(c,""length"")!==arity)bad(""arity"");if(own(c,""prototype"")!==p)bad(""prototype"");stage=""statics"";for(const key of Object.keys(statics))if(own(c,key)!==statics[key])bad(""static"");selected.push(c);instances.push([o,p]);}
profile=null;stage=""reproof"";for(const [o,p] of instances)if(Object.getPrototypeOf(o)!==p)bad(""prototype"");
for(const [o,k,v] of held){const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value"")||!Object.is(d.value,v))bad(""own"");}

if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad(""callback"");
return selected;
}catch{return JSON.stringify({schema:""easyeda-pro-control.pcb-constructor-failure.v1"",bundle:""common"",profile,stage,reason});}}";
  const string CommonPresentationFunction=@"function(originalCallback,constructors){
""use strict"";const bad=()=>{throw new Error(""PCB_COMMON_STATE"");};
const retained=[],absent=[];const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value"")||retained.length>=32768)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad();
const scope=object(own(this,""object"")),klass=n=>{const c=own(scope,n);if(typeof c!==""function"")bad();return c;};

const constructorHeld=[],constructorProfiles={""Yme"":[""Yme"",0,{}],""Nfe"":[""Nfe"",0,{}],""Epe"":[""Epe"",0,{}],""GSe"":[""GSe"",0,{}]};
if(!Array.isArray(constructors)||Object.getPrototypeOf(constructors)!==Array.prototype)bad();
const constructorLength=own(constructors,""length""),constructorKeys=Reflect.ownKeys(constructors);
if(![4].includes(constructorLength)||constructorKeys.length!==constructorLength+1||constructorKeys[constructorLength]!==""length"")bad();
for(let i=0;i<constructorLength;i++)if(constructorKeys[i]!==String(i)||typeof own(constructors,String(i))!==""function"")bad();
const constructorNames=[""Yme"",""Nfe"",""Epe"",""GSe""];
const constructorMetadata=(c,name)=>{const [label,arity,statics]=constructorProfiles[name];if(own(c,""name"")!==label||own(c,""length"")!==arity)bad();for(const key of Object.keys(statics)){const d=Object.getOwnPropertyDescriptor(c,key);if(!d||!Object.hasOwn(d,""value"")||!d.writable||!d.configurable||!d.enumerable||own(c,key)!==statics[key])bad();}};
const constructorInstance=(o,name)=>{object(o);const i=constructorNames.indexOf(name);if(i<0)bad();const c=own(constructors,String(i)),p=own(c,""prototype"");if(Object.getPrototypeOf(o)!==p||own(p,""constructor"")!==c)bad();constructorMetadata(c,name);constructorHeld.push([o,p,c,name,i]);return o;};
const verifyConstructorAssociations=()=>{if(Object.getPrototypeOf(constructors)!==Array.prototype||own(constructors,""length"")!==constructorLength)bad();const k=Reflect.ownKeys(constructors);if(k.length!==constructorKeys.length||k.some((v,i)=>v!==constructorKeys[i]))bad();for(const [o,p,c,name,i] of constructorHeld){if(own(constructors,String(i))!==c||Object.getPrototypeOf(o)!==p||own(c,""prototype"")!==p||own(p,""constructor"")!==c)bad();constructorMetadata(c,name);}};

const instance=(o,n)=>{object(o);if(Object.getPrototypeOf(o)!==own(klass(n),""prototype""))bad();return o;};
const env=instance(own(klass(""x""),""env""),""x""),documentUuid=own(env,""_id"");
if(own(env,""_doctype"")!==3||typeof documentUuid!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(documentUuid))bad();
const pick=(o,names)=>{const r=Object.create(null);for(const n of names)r[n]=own(o,n);return r;};
const noOwnPublic=(o,names)=>{for(const n of names){if(Object.getOwnPropertyDescriptor(o,n))bad();absent.push([o,n]);}};
const optional=(o,k)=>{if(Object.getOwnPropertyDescriptor(o,k))return{present:true,value:own(o,k)};let p=Object.getPrototypeOf(o),depth=0;while(p!==null){if(++depth>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}absent.push([o,k]);return{present:false};};

const graphNodes=[],graphSeen=new Map(),graphHeld=[],graphCollections=[],graphJsonChecks=[];let graphFields=0,graphStringUnits=0;
const graphClassNames=[""S"",""ee"",""Ke"",""WA"",""Ff"",""HA"",""te"",""Wre"",""xI"",""fj"",""Ky"",""nC"",""cR"",""E8"",""i2"",""tR"",""rR"",""Jx"",""Yre"",""zre"",""aR"",""eR"",""O8"",""Qx"",""KCe"",""lR"",""sR"",""hR"",""zi"",""Ll""];
const graphClasses=graphClassNames.map(n=>[n,own(klass(n),""prototype"")]);
const graphString=v=>{if(typeof v!==""string""||v.length>4096||!v.isWellFormed()||(graphStringUnits+=v.length)>131072)bad();return v;};
const graphKeys=o=>{const k=Reflect.ownKeys(o);if(k.length>4096||k.some(v=>typeof v!==""string""))bad();return k;};
const graphDescriptor=(o,k,enumerableKeys)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(++graphFields>32768)bad();graphHeld.push([o,k,d]);if(enumerableKeys&&d.enumerable)enumerableKeys.push(k);return d.value;};
const graphJsonToJSONAbsent=o=>{let depth=0;while(o!==null){if(++depth>16||graphJsonChecks.length>=32768)bad();const descriptor=Object.getOwnPropertyDescriptor(o,""toJSON"");if(descriptor!==undefined){graphJsonChecks.push([o,true]);return false;}const prototype=Object.getPrototypeOf(o);graphJsonChecks.push([o,false,prototype]);o=prototype;}return true;};
if(!graphJsonToJSONAbsent(Object.prototype)||!graphJsonToJSONAbsent(Array.prototype))bad();
const graphCollection=(o,p,recheck=false)=>{if(Object.getPrototypeOf(o)!==p||graphKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=Reflect.apply(d.get,o,[]);if(!Number.isSafeInteger(n)||n<0||n>4096)bad();if(!recheck&&(graphFields+=n*2)>32768)bad();const iterator=Reflect.apply(own(p,""entries""),o,[]),next=own(Object.getPrototypeOf(iterator),""next""),items=[];if(typeof next!==""function"")bad();for(let i=0;i<n;i++){const e=Reflect.apply(next,iterator,[]);if(own(e,""done"")!==false)bad();const pair=own(e,""value"");if(!Array.isArray(pair)||pair.length!==2)bad();items.push([own(pair,""0""),own(pair,""1"")]);}if(own(Reflect.apply(next,iterator,[]),""done"")!==true)bad();if(!recheck)graphCollections.push([o,p,items]);return items;};
const graphValue=(v,depth=0)=>{
if(depth>32)bad();if(v===null)return[""null""];if(v===undefined)return[""undefined""];
if(typeof v===""boolean"")return[""boolean"",v];if(typeof v===""string"")return[""string"",graphString(v)];
if(typeof v===""number""){if(!Number.isFinite(v))bad();return[""number"",Object.is(v,-0)?""-0"":String(v)];}
if(typeof v!==""object"")bad();if(graphSeen.has(v))return[""ref"",graphSeen.get(v)];
if(graphNodes.length>=4096)bad();const index=graphNodes.length;graphSeen.set(v,index);graphNodes.push(null);
const p=Object.getPrototypeOf(v);let node;
if(p===Map.prototype||p===Set.prototype){const entries=graphCollection(v,p);node=p===Map.prototype?{kind:""map"",entries:entries.map(e=>[graphValue(e[0],depth+1),graphValue(e[1],depth+1)])}:{kind:""set"",values:entries.map(e=>graphValue(e[0],depth+1))};}
else if(Array.isArray(v)){if(p!==Array.prototype)bad();const k=graphKeys(v),n=graphDescriptor(v,""length"");if(!Number.isSafeInteger(n)||n<0||n>4096||k.length!==n+1||k[n]!==""length"")bad();const values=[];for(let i=0;i<n;i++){if(k[i]!==String(i))bad();values.push(graphValue(graphDescriptor(v,String(i)),depth+1));}graphHeld.push([v,null,k,p]);node={kind:""array"",values,jsonToJSONAbsent:graphJsonToJSONAbsent(v)};}
else{let className=p===null?""null"":p===Object.prototype?""plain"":null;if(className===null){const matches=graphClasses.filter(e=>e[1]===p);if(matches.length!==1)bad();className=matches[0][0];}const k=graphKeys(v),fields=[],enumerableKeys=[];graphHeld.push([v,null,k,p]);for(const key of k)fields.push([graphString(key),graphValue(graphDescriptor(v,key,enumerableKeys),depth+1)]);node={kind:""object"",className,fields,enumerableKeys,jsonToJSONAbsent:graphJsonToJSONAbsent(v)};}
graphNodes[index]=node;return[""ref"",index];};
const graphVerify=()=>{for(const h of graphHeld){if(h[1]===null){const k=Reflect.ownKeys(h[0]);if(Object.getPrototypeOf(h[0])!==h[3]||k.length!==h[2].length||k.some((v,i)=>v!==h[2][i]))bad();}else{const d=Object.getOwnPropertyDescriptor(h[0],h[1]),p=h[2];if(!d||!Object.hasOwn(d,""value"")||!Object.is(d.value,p.value)||d.enumerable!==p.enumerable||d.configurable!==p.configurable||d.writable!==p.writable)bad();}}for(const h of graphCollections){const now=graphCollection(h[0],h[1],true);if(now.length!==h[2].length||now.some((e,i)=>!Object.is(e[0],h[2][i][0])||!Object.is(e[1],h[2][i][1])))bad();}for(const h of graphJsonChecks){const present=Object.getOwnPropertyDescriptor(h[0],""toJSON"")!==undefined;if(present!==h[1]||!present&&Object.getPrototypeOf(h[0])!==h[2])bad();}};

const emptyMap=o=>{if(graphCollection(o,Map.prototype).length!==0)bad();};
const finish=(schema,roots)=>{verifyConstructorAssociations();graphVerify();for(const r of retained){const d=Object.getOwnPropertyDescriptor(r[0],r[1]);if(!d||!Object.hasOwn(d,""value"")||!Object.is(d.value,r[2]))bad();}for(const r of absent){if(Object.getOwnPropertyDescriptor(r[0],r[1]))bad();}if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad();const text=JSON.stringify({schema,documentUuid,pickedOwnerPublicShadowsAbsent:true,graph:{roots,nodes:graphNodes}});if(text.length>524288)bad();let bytes=0;for(let i=0;i<text.length;i++){const c=text.charCodeAt(i);bytes+=c<128?1:c<2048?2:c>=55296&&c<=56319?(i++,4):3;if(bytes>524288)bad();}return text;};

noOwnPublic(env,[""origin"",""unit"",""altGridSize"",""gridType"",""multiType"",""multiRatio"",""forceValue""]);
const canvas=pick(env,[""_origin"",""_unit"",""_altGridSize"",""_gridType"",""_multiType"",""_multiRatio"",""_forceValue""]);
const grid=instance(own(klass(""At""),""ins""),""At""),gridFields=[""_stepX"",""_stepY"",""_snapX"",""_snapY""];
noOwnPublic(grid,[""getGridX"",""getGridY"",""getSnapX"",""getSnapY""]);
const gridParam=own(grid,""param""),gridState={owner:pick(grid,gridFields),parameter:gridParam===null?null:pick(instance(gridParam,""ogt""),gridFields)};
if(gridParam!==null)noOwnPublic(gridParam,[""getGridX"",""getGridY"",""getSnapX"",""getSnapY""]);
const layers=instance(own(klass(""Ke""),""manager""),""Ke""),filters=instance(own(klass(""zi""),""manager""),""zi"");
graphCollection(own(layers,""map""),Map.prototype);graphCollection(own(layers,""_layerPhys""),Map.prototype);graphCollection(own(filters,""map""),Map.prototype);
own(layers,""activeLayer"");own(layers,""_deactiveAlpha"");
const panel=instance(own(klass(""ai""),""model""),""ai""),panelParam=object(own(panel,""_param""));
noOwnPublic(panel,[""getDefaultPanelize""]);
if(own(panelParam,""on"")!==false||own(panelParam,""success"")!==false)bad();
const model=constructorInstance(own(scope,""Me""),""Yme""),silk=pick(model,[""_topBoardColor"",""_topSilkscreenColor"",""_bottomBoardColor"",""_bottomSilkscreenColor""]);
noOwnPublic(model,[""topBoardColor"",""topSilkscreenColor"",""bottomBoardColor"",""bottomSilkscreenColor""]);
const roots=[[""canvas"",graphValue(canvas)],[""grid"",graphValue(gridState)],[""layers"",graphValue(layers)],[""filters"",graphValue(filters)],[""silk"",graphValue(silk)],[""panelize"",graphValue(panelParam)]];
return finish(""easyeda-pro-control.pcb-common-presentation.v2"",roots);
}";
  const string CommonRulesFunction=@"function(originalCallback,constructors){
""use strict"";const bad=()=>{throw new Error(""PCB_COMMON_STATE"");};
const retained=[],absent=[];const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value"")||retained.length>=32768)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad();
const scope=object(own(this,""object"")),klass=n=>{const c=own(scope,n);if(typeof c!==""function"")bad();return c;};

const constructorHeld=[],constructorProfiles={""Yme"":[""Yme"",0,{}],""Nfe"":[""Nfe"",0,{}],""Epe"":[""Epe"",0,{}],""GSe"":[""GSe"",0,{}]};
if(!Array.isArray(constructors)||Object.getPrototypeOf(constructors)!==Array.prototype)bad();
const constructorLength=own(constructors,""length""),constructorKeys=Reflect.ownKeys(constructors);
if(![4].includes(constructorLength)||constructorKeys.length!==constructorLength+1||constructorKeys[constructorLength]!==""length"")bad();
for(let i=0;i<constructorLength;i++)if(constructorKeys[i]!==String(i)||typeof own(constructors,String(i))!==""function"")bad();
const constructorNames=[""Yme"",""Nfe"",""Epe"",""GSe""];
const constructorMetadata=(c,name)=>{const [label,arity,statics]=constructorProfiles[name];if(own(c,""name"")!==label||own(c,""length"")!==arity)bad();for(const key of Object.keys(statics)){const d=Object.getOwnPropertyDescriptor(c,key);if(!d||!Object.hasOwn(d,""value"")||!d.writable||!d.configurable||!d.enumerable||own(c,key)!==statics[key])bad();}};
const constructorInstance=(o,name)=>{object(o);const i=constructorNames.indexOf(name);if(i<0)bad();const c=own(constructors,String(i)),p=own(c,""prototype"");if(Object.getPrototypeOf(o)!==p||own(p,""constructor"")!==c)bad();constructorMetadata(c,name);constructorHeld.push([o,p,c,name,i]);return o;};
const verifyConstructorAssociations=()=>{if(Object.getPrototypeOf(constructors)!==Array.prototype||own(constructors,""length"")!==constructorLength)bad();const k=Reflect.ownKeys(constructors);if(k.length!==constructorKeys.length||k.some((v,i)=>v!==constructorKeys[i]))bad();for(const [o,p,c,name,i] of constructorHeld){if(own(constructors,String(i))!==c||Object.getPrototypeOf(o)!==p||own(c,""prototype"")!==p||own(p,""constructor"")!==c)bad();constructorMetadata(c,name);}};

const instance=(o,n)=>{object(o);if(Object.getPrototypeOf(o)!==own(klass(n),""prototype""))bad();return o;};
const env=instance(own(klass(""x""),""env""),""x""),documentUuid=own(env,""_id"");
if(own(env,""_doctype"")!==3||typeof documentUuid!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(documentUuid))bad();
const pick=(o,names)=>{const r=Object.create(null);for(const n of names)r[n]=own(o,n);return r;};
const noOwnPublic=(o,names)=>{for(const n of names){if(Object.getOwnPropertyDescriptor(o,n))bad();absent.push([o,n]);}};
const optional=(o,k)=>{if(Object.getOwnPropertyDescriptor(o,k))return{present:true,value:own(o,k)};let p=Object.getPrototypeOf(o),depth=0;while(p!==null){if(++depth>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}absent.push([o,k]);return{present:false};};

const graphNodes=[],graphSeen=new Map(),graphHeld=[],graphCollections=[],graphJsonChecks=[];let graphFields=0,graphStringUnits=0;
const graphClassNames=[""S"",""ee"",""Ke"",""WA"",""Ff"",""HA"",""te"",""Wre"",""xI"",""fj"",""Ky"",""nC"",""cR"",""E8"",""i2"",""tR"",""rR"",""Jx"",""Yre"",""zre"",""aR"",""eR"",""O8"",""Qx"",""KCe"",""lR"",""sR"",""hR"",""zi"",""Ll""];
const graphClasses=graphClassNames.map(n=>[n,own(klass(n),""prototype"")]);
const graphString=v=>{if(typeof v!==""string""||v.length>4096||!v.isWellFormed()||(graphStringUnits+=v.length)>131072)bad();return v;};
const graphKeys=o=>{const k=Reflect.ownKeys(o);if(k.length>4096||k.some(v=>typeof v!==""string""))bad();return k;};
const graphDescriptor=(o,k,enumerableKeys)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(++graphFields>32768)bad();graphHeld.push([o,k,d]);if(enumerableKeys&&d.enumerable)enumerableKeys.push(k);return d.value;};
const graphJsonToJSONAbsent=o=>{let depth=0;while(o!==null){if(++depth>16||graphJsonChecks.length>=32768)bad();const descriptor=Object.getOwnPropertyDescriptor(o,""toJSON"");if(descriptor!==undefined){graphJsonChecks.push([o,true]);return false;}const prototype=Object.getPrototypeOf(o);graphJsonChecks.push([o,false,prototype]);o=prototype;}return true;};
if(!graphJsonToJSONAbsent(Object.prototype)||!graphJsonToJSONAbsent(Array.prototype))bad();
const graphCollection=(o,p,recheck=false)=>{if(Object.getPrototypeOf(o)!==p||graphKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=Reflect.apply(d.get,o,[]);if(!Number.isSafeInteger(n)||n<0||n>4096)bad();if(!recheck&&(graphFields+=n*2)>32768)bad();const iterator=Reflect.apply(own(p,""entries""),o,[]),next=own(Object.getPrototypeOf(iterator),""next""),items=[];if(typeof next!==""function"")bad();for(let i=0;i<n;i++){const e=Reflect.apply(next,iterator,[]);if(own(e,""done"")!==false)bad();const pair=own(e,""value"");if(!Array.isArray(pair)||pair.length!==2)bad();items.push([own(pair,""0""),own(pair,""1"")]);}if(own(Reflect.apply(next,iterator,[]),""done"")!==true)bad();if(!recheck)graphCollections.push([o,p,items]);return items;};
const graphValue=(v,depth=0)=>{
if(depth>32)bad();if(v===null)return[""null""];if(v===undefined)return[""undefined""];
if(typeof v===""boolean"")return[""boolean"",v];if(typeof v===""string"")return[""string"",graphString(v)];
if(typeof v===""number""){if(!Number.isFinite(v))bad();return[""number"",Object.is(v,-0)?""-0"":String(v)];}
if(typeof v!==""object"")bad();if(graphSeen.has(v))return[""ref"",graphSeen.get(v)];
if(graphNodes.length>=4096)bad();const index=graphNodes.length;graphSeen.set(v,index);graphNodes.push(null);
const p=Object.getPrototypeOf(v);let node;
if(p===Map.prototype||p===Set.prototype){const entries=graphCollection(v,p);node=p===Map.prototype?{kind:""map"",entries:entries.map(e=>[graphValue(e[0],depth+1),graphValue(e[1],depth+1)])}:{kind:""set"",values:entries.map(e=>graphValue(e[0],depth+1))};}
else if(Array.isArray(v)){if(p!==Array.prototype)bad();const k=graphKeys(v),n=graphDescriptor(v,""length"");if(!Number.isSafeInteger(n)||n<0||n>4096||k.length!==n+1||k[n]!==""length"")bad();const values=[];for(let i=0;i<n;i++){if(k[i]!==String(i))bad();values.push(graphValue(graphDescriptor(v,String(i)),depth+1));}graphHeld.push([v,null,k,p]);node={kind:""array"",values,jsonToJSONAbsent:graphJsonToJSONAbsent(v)};}
else{let className=p===null?""null"":p===Object.prototype?""plain"":null;if(className===null){const matches=graphClasses.filter(e=>e[1]===p);if(matches.length!==1)bad();className=matches[0][0];}const k=graphKeys(v),fields=[],enumerableKeys=[];graphHeld.push([v,null,k,p]);for(const key of k)fields.push([graphString(key),graphValue(graphDescriptor(v,key,enumerableKeys),depth+1)]);node={kind:""object"",className,fields,enumerableKeys,jsonToJSONAbsent:graphJsonToJSONAbsent(v)};}
graphNodes[index]=node;return[""ref"",index];};
const graphVerify=()=>{for(const h of graphHeld){if(h[1]===null){const k=Reflect.ownKeys(h[0]);if(Object.getPrototypeOf(h[0])!==h[3]||k.length!==h[2].length||k.some((v,i)=>v!==h[2][i]))bad();}else{const d=Object.getOwnPropertyDescriptor(h[0],h[1]),p=h[2];if(!d||!Object.hasOwn(d,""value"")||!Object.is(d.value,p.value)||d.enumerable!==p.enumerable||d.configurable!==p.configurable||d.writable!==p.writable)bad();}}for(const h of graphCollections){const now=graphCollection(h[0],h[1],true);if(now.length!==h[2].length||now.some((e,i)=>!Object.is(e[0],h[2][i][0])||!Object.is(e[1],h[2][i][1])))bad();}for(const h of graphJsonChecks){const present=Object.getOwnPropertyDescriptor(h[0],""toJSON"")!==undefined;if(present!==h[1]||!present&&Object.getPrototypeOf(h[0])!==h[2])bad();}};

const emptyMap=o=>{if(graphCollection(o,Map.prototype).length!==0)bad();};
const finish=(schema,roots)=>{verifyConstructorAssociations();graphVerify();for(const r of retained){const d=Object.getOwnPropertyDescriptor(r[0],r[1]);if(!d||!Object.hasOwn(d,""value"")||!Object.is(d.value,r[2]))bad();}for(const r of absent){if(Object.getOwnPropertyDescriptor(r[0],r[1]))bad();}if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad();const text=JSON.stringify({schema,documentUuid,pickedOwnerPublicShadowsAbsent:true,graph:{roots,nodes:graphNodes}});if(text.length>524288)bad();let bytes=0;for(let i=0;i<text.length;i++){const c=text.charCodeAt(i);bytes+=c<128?1:c<2048?2:c>=55296&&c<=56319?(i++,4):3;if(bytes>524288)bad();}return text;};

const rules=instance(own(klass(""te""),""manager""),""te"");
for(const name of [""safeSpacings"",""otherSpacings"",""creepageSpacings"",""trackPhysics"",""netLengthPhysics"",""netLengthTolerancePhysics"",""differentialPhysics"",""blindViaPhysics"",""radiusPhysics"",""innerPlanes"",""copperPlanes"",""solderExpansions"",""pasteExpansions"",""autoRouters""])graphCollection(own(rules,name),Map.prototype);
graphCollection(own(rules,""defaultRuleMap""),Map.prototype);graphCollection(own(rules,""map""),Map.prototype);graphString(own(rules,""ruleTemplateName""));
for(const name of [""nets"",""netClass"",""netDifferentials"",""regionSelectors"",""equalLengthGroups"",""padsPairGroups"",""cacheNetModel""])emptyMap(own(rules,name));
const between=instance(own(rules,""betweenNetRule""),""Wre"");
for(const name of [""rule"",""cacheRuleMap""]){const a=own(between,name);if(!Array.isArray(a)||Object.getPrototypeOf(a)!==Array.prototype||own(a,""length"")!==0||Reflect.ownKeys(a).length!==1)bad();}
const ruleUnit=own(object(own(scope,""_Fe"")),""UNIT_NAME"");graphString(ruleUnit);
return finish(""easyeda-pro-control.pcb-common-rules.v2"",[[""rules"",graphValue(rules)],[""ruleUnit"",graphValue(ruleUnit)]]);
}";
  const string CommonPreferenceFunction=@"function(originalCallback,constructors){
""use strict"";const bad=()=>{throw new Error(""PCB_COMMON_STATE"");};
const retained=[],absent=[];const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value"")||retained.length>=32768)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad();
const scope=object(own(this,""object"")),klass=n=>{const c=own(scope,n);if(typeof c!==""function"")bad();return c;};

const constructorHeld=[],constructorProfiles={""Yme"":[""Yme"",0,{}],""Nfe"":[""Nfe"",0,{}],""Epe"":[""Epe"",0,{}],""GSe"":[""GSe"",0,{}]};
if(!Array.isArray(constructors)||Object.getPrototypeOf(constructors)!==Array.prototype)bad();
const constructorLength=own(constructors,""length""),constructorKeys=Reflect.ownKeys(constructors);
if(![4].includes(constructorLength)||constructorKeys.length!==constructorLength+1||constructorKeys[constructorLength]!==""length"")bad();
for(let i=0;i<constructorLength;i++)if(constructorKeys[i]!==String(i)||typeof own(constructors,String(i))!==""function"")bad();
const constructorNames=[""Yme"",""Nfe"",""Epe"",""GSe""];
const constructorMetadata=(c,name)=>{const [label,arity,statics]=constructorProfiles[name];if(own(c,""name"")!==label||own(c,""length"")!==arity)bad();for(const key of Object.keys(statics)){const d=Object.getOwnPropertyDescriptor(c,key);if(!d||!Object.hasOwn(d,""value"")||!d.writable||!d.configurable||!d.enumerable||own(c,key)!==statics[key])bad();}};
const constructorInstance=(o,name)=>{object(o);const i=constructorNames.indexOf(name);if(i<0)bad();const c=own(constructors,String(i)),p=own(c,""prototype"");if(Object.getPrototypeOf(o)!==p||own(p,""constructor"")!==c)bad();constructorMetadata(c,name);constructorHeld.push([o,p,c,name,i]);return o;};
const verifyConstructorAssociations=()=>{if(Object.getPrototypeOf(constructors)!==Array.prototype||own(constructors,""length"")!==constructorLength)bad();const k=Reflect.ownKeys(constructors);if(k.length!==constructorKeys.length||k.some((v,i)=>v!==constructorKeys[i]))bad();for(const [o,p,c,name,i] of constructorHeld){if(own(constructors,String(i))!==c||Object.getPrototypeOf(o)!==p||own(c,""prototype"")!==p||own(p,""constructor"")!==c)bad();constructorMetadata(c,name);}};

const instance=(o,n)=>{object(o);if(Object.getPrototypeOf(o)!==own(klass(n),""prototype""))bad();return o;};
const env=instance(own(klass(""x""),""env""),""x""),documentUuid=own(env,""_id"");
if(own(env,""_doctype"")!==3||typeof documentUuid!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(documentUuid))bad();
const pick=(o,names)=>{const r=Object.create(null);for(const n of names)r[n]=own(o,n);return r;};
const noOwnPublic=(o,names)=>{for(const n of names){if(Object.getOwnPropertyDescriptor(o,n))bad();absent.push([o,n]);}};
const optional=(o,k)=>{if(Object.getOwnPropertyDescriptor(o,k))return{present:true,value:own(o,k)};let p=Object.getPrototypeOf(o),depth=0;while(p!==null){if(++depth>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}absent.push([o,k]);return{present:false};};

const graphNodes=[],graphSeen=new Map(),graphHeld=[],graphCollections=[],graphJsonChecks=[];let graphFields=0,graphStringUnits=0;
const graphClassNames=[""S"",""ee"",""Ke"",""WA"",""Ff"",""HA"",""te"",""Wre"",""xI"",""fj"",""Ky"",""nC"",""cR"",""E8"",""i2"",""tR"",""rR"",""Jx"",""Yre"",""zre"",""aR"",""eR"",""O8"",""Qx"",""KCe"",""lR"",""sR"",""hR"",""zi"",""Ll""];
const graphClasses=graphClassNames.map(n=>[n,own(klass(n),""prototype"")]);
const graphString=v=>{if(typeof v!==""string""||v.length>4096||!v.isWellFormed()||(graphStringUnits+=v.length)>131072)bad();return v;};
const graphKeys=o=>{const k=Reflect.ownKeys(o);if(k.length>4096||k.some(v=>typeof v!==""string""))bad();return k;};
const graphDescriptor=(o,k,enumerableKeys)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(++graphFields>32768)bad();graphHeld.push([o,k,d]);if(enumerableKeys&&d.enumerable)enumerableKeys.push(k);return d.value;};
const graphJsonToJSONAbsent=o=>{let depth=0;while(o!==null){if(++depth>16||graphJsonChecks.length>=32768)bad();const descriptor=Object.getOwnPropertyDescriptor(o,""toJSON"");if(descriptor!==undefined){graphJsonChecks.push([o,true]);return false;}const prototype=Object.getPrototypeOf(o);graphJsonChecks.push([o,false,prototype]);o=prototype;}return true;};
if(!graphJsonToJSONAbsent(Object.prototype)||!graphJsonToJSONAbsent(Array.prototype))bad();
const graphCollection=(o,p,recheck=false)=>{if(Object.getPrototypeOf(o)!==p||graphKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=Reflect.apply(d.get,o,[]);if(!Number.isSafeInteger(n)||n<0||n>4096)bad();if(!recheck&&(graphFields+=n*2)>32768)bad();const iterator=Reflect.apply(own(p,""entries""),o,[]),next=own(Object.getPrototypeOf(iterator),""next""),items=[];if(typeof next!==""function"")bad();for(let i=0;i<n;i++){const e=Reflect.apply(next,iterator,[]);if(own(e,""done"")!==false)bad();const pair=own(e,""value"");if(!Array.isArray(pair)||pair.length!==2)bad();items.push([own(pair,""0""),own(pair,""1"")]);}if(own(Reflect.apply(next,iterator,[]),""done"")!==true)bad();if(!recheck)graphCollections.push([o,p,items]);return items;};
const graphValue=(v,depth=0)=>{
if(depth>32)bad();if(v===null)return[""null""];if(v===undefined)return[""undefined""];
if(typeof v===""boolean"")return[""boolean"",v];if(typeof v===""string"")return[""string"",graphString(v)];
if(typeof v===""number""){if(!Number.isFinite(v))bad();return[""number"",Object.is(v,-0)?""-0"":String(v)];}
if(typeof v!==""object"")bad();if(graphSeen.has(v))return[""ref"",graphSeen.get(v)];
if(graphNodes.length>=4096)bad();const index=graphNodes.length;graphSeen.set(v,index);graphNodes.push(null);
const p=Object.getPrototypeOf(v);let node;
if(p===Map.prototype||p===Set.prototype){const entries=graphCollection(v,p);node=p===Map.prototype?{kind:""map"",entries:entries.map(e=>[graphValue(e[0],depth+1),graphValue(e[1],depth+1)])}:{kind:""set"",values:entries.map(e=>graphValue(e[0],depth+1))};}
else if(Array.isArray(v)){if(p!==Array.prototype)bad();const k=graphKeys(v),n=graphDescriptor(v,""length"");if(!Number.isSafeInteger(n)||n<0||n>4096||k.length!==n+1||k[n]!==""length"")bad();const values=[];for(let i=0;i<n;i++){if(k[i]!==String(i))bad();values.push(graphValue(graphDescriptor(v,String(i)),depth+1));}graphHeld.push([v,null,k,p]);node={kind:""array"",values,jsonToJSONAbsent:graphJsonToJSONAbsent(v)};}
else{let className=p===null?""null"":p===Object.prototype?""plain"":null;if(className===null){const matches=graphClasses.filter(e=>e[1]===p);if(matches.length!==1)bad();className=matches[0][0];}const k=graphKeys(v),fields=[],enumerableKeys=[];graphHeld.push([v,null,k,p]);for(const key of k)fields.push([graphString(key),graphValue(graphDescriptor(v,key,enumerableKeys),depth+1)]);node={kind:""object"",className,fields,enumerableKeys,jsonToJSONAbsent:graphJsonToJSONAbsent(v)};}
graphNodes[index]=node;return[""ref"",index];};
const graphVerify=()=>{for(const h of graphHeld){if(h[1]===null){const k=Reflect.ownKeys(h[0]);if(Object.getPrototypeOf(h[0])!==h[3]||k.length!==h[2].length||k.some((v,i)=>v!==h[2][i]))bad();}else{const d=Object.getOwnPropertyDescriptor(h[0],h[1]),p=h[2];if(!d||!Object.hasOwn(d,""value"")||!Object.is(d.value,p.value)||d.enumerable!==p.enumerable||d.configurable!==p.configurable||d.writable!==p.writable)bad();}}for(const h of graphCollections){const now=graphCollection(h[0],h[1],true);if(now.length!==h[2].length||now.some((e,i)=>!Object.is(e[0],h[2][i][0])||!Object.is(e[1],h[2][i][1])))bad();}for(const h of graphJsonChecks){const present=Object.getOwnPropertyDescriptor(h[0],""toJSON"")!==undefined;if(present!==h[1]||!present&&Object.getPrototypeOf(h[0])!==h[2])bad();}};

const emptyMap=o=>{if(graphCollection(o,Map.prototype).length!==0)bad();};
const finish=(schema,roots)=>{verifyConstructorAssociations();graphVerify();for(const r of retained){const d=Object.getOwnPropertyDescriptor(r[0],r[1]);if(!d||!Object.hasOwn(d,""value"")||!Object.is(d.value,r[2]))bad();}for(const r of absent){if(Object.getOwnPropertyDescriptor(r[0],r[1]))bad();}if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad();const text=JSON.stringify({schema,documentUuid,pickedOwnerPublicShadowsAbsent:true,graph:{roots,nodes:graphNodes}});if(text.length>524288)bad();let bytes=0;for(let i=0;i<text.length;i++){const c=text.charCodeAt(i);bytes+=c<128?1:c<2048?2:c>=55296&&c<=56319?(i++,4):3;if(bytes>524288)bad();}return text;};

const config=instance(own(constructorInstance(own(scope,""ce""),""Nfe""),""pcbConfig""),""vfe""),model=constructorInstance(own(scope,""Me""),""Yme"");
const route=instance(own(klass(""nr""),""instance""),""nr""),params=instance(own(klass(""pl""),""instance""),""pl"");
const panel=instance(own(klass(""ha""),""instance""),""ha"");if(own(panel,""wiringRouterParams"")!==params)bad();
noOwnPublic(config,[""startTrackWidth"",""startViaSize"",""rotateWhole"",""trackFollow"",""layerPhyPerferenceConfig""]);noOwnPublic(model,[""prevTrackWidth"",""adsorb"",""removeLoop""]);
noOwnPublic(route,[""mode"",""type""]);noOwnPublic(panel,[""trackMinCorner"",""pushVia"",""pathOptimization4BePushed"",""currentPathOptimization4BePushed"",""removeCircuitsContainingVias"",""removeAntenna""]);noOwnPublic(params,[""getTrackMinCorner"",""getPushVia"",""getPathOptimization4BePushed"",""getCurrentPathOptimization"",""getRemoveCircuitsContainingVias"",""getRemoveAntenna""]);
const via=own(constructorInstance(own(scope,""rt""),""Epe""),""defaultVia"");
const configValues=pick(config,[""_startTrackWidth"",""_startViaSize"",""_rotateWhole"",""_trackFollow"",""realTimeUpdateUnusedLayers"",""unusedPadRange""]);
configValues.layerPreference=optional(config,""_layerPhyPerferenceConfig"");
const modelValues=pick(model,[""_prevTrackWidth"",""_adsorb"",""_removeLoop""]),viaValues=pick(via,[""innerRadius"",""radius""]);
const routing=pick(route,[""_mode"",""_type""]),options=pick(params,[""minimumTrackCorners"",""pushViaOptimization"",""pathOptimization"",""currentPathOptimization"",""removeCircuitsContainingVias"",""removeAntenna""]);
return finish(""easyeda-pro-control.pcb-common-preference.v2"",[[""config"",graphValue(configValues)],[""model"",graphValue(modelValues)],[""via"",graphValue(viaValues)],[""routing"",graphValue(routing)],[""options"",graphValue(options)]]);
}";
  const string CommonAssetsFunction=@"function(originalCallback,constructors){

""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};

if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad();
const scope=object(own(this,""object"")),klass=n=>{const c=own(scope,n);if(typeof c!==""function"")bad();return c;};

const constructorHeld=[],constructorProfiles={""Yme"":[""Yme"",0,{}],""Nfe"":[""Nfe"",0,{}],""Epe"":[""Epe"",0,{}],""GSe"":[""GSe"",0,{}]};
if(!Array.isArray(constructors)||Object.getPrototypeOf(constructors)!==Array.prototype)bad();
const constructorLength=own(constructors,""length""),constructorKeys=Reflect.ownKeys(constructors);
if(![4].includes(constructorLength)||constructorKeys.length!==constructorLength+1||constructorKeys[constructorLength]!==""length"")bad();
for(let i=0;i<constructorLength;i++)if(constructorKeys[i]!==String(i)||typeof own(constructors,String(i))!==""function"")bad();
const constructorNames=[""Yme"",""Nfe"",""Epe"",""GSe""];
const constructorMetadata=(c,name)=>{const [label,arity,statics]=constructorProfiles[name];if(own(c,""name"")!==label||own(c,""length"")!==arity)bad();for(const key of Object.keys(statics)){const d=Object.getOwnPropertyDescriptor(c,key);if(!d||!Object.hasOwn(d,""value"")||!d.writable||!d.configurable||!d.enumerable||own(c,key)!==statics[key])bad();}};
const constructorInstance=(o,name)=>{object(o);const i=constructorNames.indexOf(name);if(i<0)bad();const c=own(constructors,String(i)),p=own(c,""prototype"");if(Object.getPrototypeOf(o)!==p||own(p,""constructor"")!==c)bad();constructorMetadata(c,name);constructorHeld.push([o,p,c,name,i]);return o;};
const verifyConstructorAssociations=()=>{if(Object.getPrototypeOf(constructors)!==Array.prototype||own(constructors,""length"")!==constructorLength)bad();const k=Reflect.ownKeys(constructors);if(k.length!==constructorKeys.length||k.some((v,i)=>v!==constructorKeys[i]))bad();for(const [o,p,c,name,i] of constructorHeld){if(own(constructors,String(i))!==c||Object.getPrototypeOf(o)!==p||own(c,""prototype"")!==p||own(p,""constructor"")!==c)bad();constructorMetadata(c,name);}};

const instance=(o,n)=>{object(o);if(Object.getPrototypeOf(o)!==own(klass(n),""prototype""))bad();return o;};
const env=instance(own(klass(""x""),""env""),""x""),documentUuid=id(own(env,""_id""),/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/);
if(own(env,""_doctype"")!==3)bad();
const nullableManager=(name,field)=>{const value=own(klass(name),field);return value===null?null:instance(value,name);};
const last=o=>{const result=marker(o,""_last"");if(result===""present"")bad();return result;};
const templateManager=nullableManager(""nb"",""manager""),template=templateManager===null?null:{keys:emptyMap(own(templateManager,""map"")),last:last(templateManager)};
const baseManager=nullableManager(""H8"",""mgr""),base=baseManager===null?null:{keys:emptyMap(own(baseManager,""map"")),uuidKeys:emptyObject(own(baseManager,""uuidMap"")),last:last(baseManager)};
const unresolved=instance(own(klass(""Am""),""ins""),""Am""),footprints=instance(own(klass(""z8""),""ins""),""z8""),blobs=constructorInstance(own(scope,""id""),""GSe"");
const result={schema:""easyeda-pro-control.pcb-string-empty-assets.v1"",documentUuid,template,base,
unresolvedTexts:emptySet(own(unresolved,""texts"")),fontFootprints:emptyMap(own(footprints,""footprints"")),
blobTemplates:{keys:emptyMap(own(blobs,""map"")),last:last(blobs)}};
verifyConstructorAssociations();verify();if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad();
return JSON.stringify(result);
}";
  const string CommonMetadataFunction=@"function(originalCallback){
""use strict"";const bad=()=>{throw new Error(""PCB_COMMON_METADATA"");};
const retained=[],prototypes=[],absent=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value"")||retained.length>=32768)bad();retained.push([o,k,d]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad();
const scope=object(own(this,""object"")),klass=n=>{const c=own(scope,n);if(typeof c!==""function"")bad();return c;};
const instance=(o,n)=>{object(o);const p=own(klass(n),""prototype"");if(Object.getPrototypeOf(o)!==p)bad();prototypes.push([o,p]);return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();prototypes.push([o,p]);return o;};
const noOwn=(o,names)=>{for(const n of names){if(Object.getOwnPropertyDescriptor(o,n))bad();absent.push([o,n]);}};
const id=(v,p)=>{if(typeof v!==""string""||!p.test(v))bad();return v;};
const env=instance(own(klass(""x""),""env""),""x""),compiler=instance(own(env,""_compiler""),""Zu"");
const base=instance(own(compiler,""base""),""A8e""),consistency=instance(own(base,""consistencyManager""),""sCe"");
const documentUuid=id(own(env,""_id""),/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/),projectUuid=id(own(base,""path""),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/);
const compilerUniqueId=id(own(consistency,""unique""),/^[a-f0-9]{16}$/);
if(own(env,""_doctype"")!==3||own(env,""_tabId"")!==documentUuid+""@""+projectUuid||own(compiler,""uuid"")!==documentUuid||
own(base,""uuid"")!==documentUuid||own(compiler,""project"")!==projectUuid||own(compiler,""isProject"")!==true||
own(base,""isProject"")!==true||own(base,""_headType"")!==""PCB""||own(compiler,""consistencyManager"")!==consistency)bad();
noOwn(env,[""compiler"",""projectId""]);noOwn(compiler,[""getDocDetail""]);
const channel=instance(own(env,""compilerChannel""),""mCe"");if(own(base,""channel"")!==channel)bad();
const registry=plain(own(channel,""compiler"")),map=own(registry,""PCB"");

const graphNodes=[],graphSeen=new Map(),graphHeld=[],graphCollections=[],graphJsonChecks=[];let graphFields=0,graphStringUnits=0;
const graphClassNames=[];
const graphClasses=graphClassNames.map(n=>[n,own(klass(n),""prototype"")]);
const graphString=v=>{if(typeof v!==""string""||v.length>4096||!v.isWellFormed()||(graphStringUnits+=v.length)>131072)bad();return v;};
const graphKeys=o=>{const k=Reflect.ownKeys(o);if(k.length>4096||k.some(v=>typeof v!==""string""))bad();return k;};
const graphDescriptor=(o,k,enumerableKeys)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(++graphFields>32768)bad();graphHeld.push([o,k,d]);if(enumerableKeys&&d.enumerable)enumerableKeys.push(k);return d.value;};
const graphJsonToJSONAbsent=o=>{let depth=0;while(o!==null){if(++depth>16||graphJsonChecks.length>=32768)bad();const descriptor=Object.getOwnPropertyDescriptor(o,""toJSON"");if(descriptor!==undefined){graphJsonChecks.push([o,true]);return false;}const prototype=Object.getPrototypeOf(o);graphJsonChecks.push([o,false,prototype]);o=prototype;}return true;};
if(!graphJsonToJSONAbsent(Object.prototype)||!graphJsonToJSONAbsent(Array.prototype))bad();
const graphCollection=(o,p,recheck=false)=>{if(Object.getPrototypeOf(o)!==p||graphKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=Reflect.apply(d.get,o,[]);if(!Number.isSafeInteger(n)||n<0||n>4096)bad();if(!recheck&&(graphFields+=n*2)>32768)bad();const iterator=Reflect.apply(own(p,""entries""),o,[]),next=own(Object.getPrototypeOf(iterator),""next""),items=[];if(typeof next!==""function"")bad();for(let i=0;i<n;i++){const e=Reflect.apply(next,iterator,[]);if(own(e,""done"")!==false)bad();const pair=own(e,""value"");if(!Array.isArray(pair)||pair.length!==2)bad();items.push([own(pair,""0""),own(pair,""1"")]);}if(own(Reflect.apply(next,iterator,[]),""done"")!==true)bad();if(!recheck)graphCollections.push([o,p,items]);return items;};
const graphValue=(v,depth=0)=>{
if(depth>32)bad();if(v===null)return[""null""];if(v===undefined)return[""undefined""];
if(typeof v===""boolean"")return[""boolean"",v];if(typeof v===""string"")return[""string"",graphString(v)];
if(typeof v===""number""){if(!Number.isFinite(v))bad();return[""number"",Object.is(v,-0)?""-0"":String(v)];}
if(typeof v!==""object"")bad();if(graphSeen.has(v))return[""ref"",graphSeen.get(v)];
if(graphNodes.length>=4096)bad();const index=graphNodes.length;graphSeen.set(v,index);graphNodes.push(null);
const p=Object.getPrototypeOf(v);let node;
if(p===Map.prototype||p===Set.prototype){const entries=graphCollection(v,p);node=p===Map.prototype?{kind:""map"",entries:entries.map(e=>[graphValue(e[0],depth+1),graphValue(e[1],depth+1)])}:{kind:""set"",values:entries.map(e=>graphValue(e[0],depth+1))};}
else if(Array.isArray(v)){if(p!==Array.prototype)bad();const k=graphKeys(v),n=graphDescriptor(v,""length"");if(!Number.isSafeInteger(n)||n<0||n>4096||k.length!==n+1||k[n]!==""length"")bad();const values=[];for(let i=0;i<n;i++){if(k[i]!==String(i))bad();values.push(graphValue(graphDescriptor(v,String(i)),depth+1));}graphHeld.push([v,null,k,p]);node={kind:""array"",values,jsonToJSONAbsent:graphJsonToJSONAbsent(v)};}
else{let className=p===null?""null"":p===Object.prototype?""plain"":null;if(className===null){const matches=graphClasses.filter(e=>e[1]===p);if(matches.length!==1)bad();className=matches[0][0];}const k=graphKeys(v),fields=[],enumerableKeys=[];graphHeld.push([v,null,k,p]);for(const key of k)fields.push([graphString(key),graphValue(graphDescriptor(v,key,enumerableKeys),depth+1)]);node={kind:""object"",className,fields,enumerableKeys,jsonToJSONAbsent:graphJsonToJSONAbsent(v)};}
graphNodes[index]=node;return[""ref"",index];};
const graphVerify=()=>{for(const h of graphHeld){if(h[1]===null){const k=Reflect.ownKeys(h[0]);if(Object.getPrototypeOf(h[0])!==h[3]||k.length!==h[2].length||k.some((v,i)=>v!==h[2][i]))bad();}else{const d=Object.getOwnPropertyDescriptor(h[0],h[1]),p=h[2];if(!d||!Object.hasOwn(d,""value"")||!Object.is(d.value,p.value)||d.enumerable!==p.enumerable||d.configurable!==p.configurable||d.writable!==p.writable)bad();}}for(const h of graphCollections){const now=graphCollection(h[0],h[1],true);if(now.length!==h[2].length||now.some((e,i)=>!Object.is(e[0],h[2][i][0])||!Object.is(e[1],h[2][i][1])))bad();}for(const h of graphJsonChecks){const present=Object.getOwnPropertyDescriptor(h[0],""toJSON"")!==undefined;if(present!==h[1]||!present&&Object.getPrototypeOf(h[0])!==h[2])bad();}};

const entries=graphCollection(map,Map.prototype),matches=entries.filter(e=>e[0]===compilerUniqueId||e[1]===base);
if(matches.length!==1||matches[0][0]!==compilerUniqueId||matches[0][1]!==base)bad();
const detail=plain(own(compiler,""docDetail""));for(const name of [""title"",""parent"",""source"",""board"",""zIndex""])own(detail,name);
const graph={roots:[[""docDetail"",graphValue(detail)]],nodes:graphNodes};
graphVerify();
for(const [o,k,p] of retained){const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value"")||!Object.is(d.value,p.value)||d.enumerable!==p.enumerable||d.configurable!==p.configurable||d.writable!==p.writable)bad();}
for(const [o,p] of prototypes)if(Object.getPrototypeOf(o)!==p)bad();for(const [o,k] of absent)if(Object.getOwnPropertyDescriptor(o,k))bad();
if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad();
const text=JSON.stringify({schema:""easyeda-pro-control.pcb-common-metadata.v1"",documentUuid,projectUuid,compilerUniqueId,ownerPublicShadowsAbsent:true,graph});
if(text.length>524288)bad();let bytes=0;for(let i=0;i<text.length;i++){const c=text.charCodeAt(i);bytes+=c<128?1:c<2048?2:c>=55296&&c<=56319?(i++,4):3;if(bytes>524288)bad();}return text;
}";
  const string TeardropCallbacksFunction=@"function(originalCallback){""use strict"";
let stage=""callback"",topic=null,reason=""unexpected"";
const bad=r=>{reason=r;throw new Error(""PCB_TEARDROP_OWNER"");};
const held=[],descriptors=[],prototypes=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad(""object"");const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad(""own"");held.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad(""object"");return o;};
const proto=o=>{const p=Object.getPrototypeOf(o);prototypes.push([o,p]);return p;};
const named=(o,n)=>{object(o);const p=proto(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==n||own(c,""prototype"")!==p)bad(""instance"");return o;};
const tuple=(v,n)=>{if(!Array.isArray(v)||proto(v)!==Array.prototype||own(v,""length"")!==n)bad(""count"");const keys=Reflect.ownKeys(v);if(keys.length!==n+1||keys[n]!==""length"")bad(""count"");for(let i=0;i<n;i++)if(keys[i]!==String(i))bad(""count"");return v;};
const topics=[""isMoveSwitch"",""SetSuspend"",""cheakTearDrop"",""addModifyTeardrop"",""flushTearDrop"",""refreshTearDrop""],names=[""isMoveSwitch"",""setSuspend"",""addModify"",""addMaodifyTeardrop"",""flushService"",""refreshService""];
const select=()=>{stage=""registry"";const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),registry=object(own(bus,""subscribed""));const p=proto(registry);if(p!==Object.prototype&&p!==null)bad(""prototype"");const selected=[];for(let i=0;i<6;i++){topic=topics[i];const tasks=tuple(own(registry,topic),1),task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad(""callback"");selected.push(callback);}topic=null;return selected;};
const target=(owner,name)=>{if(Object.getOwnPropertyDescriptor(owner,name)!==undefined)bad(""shadow"");descriptors.push([owner,name]);const p=proto(owner),d=Object.getOwnPropertyDescriptor(p,name);if(!d||!Object.hasOwn(d,""value"")||typeof d.value!==""function""||!d.writable||!d.configurable||d.enumerable)bad(""target"");descriptors.push([p,name,d]);return d.value;};
const verify=()=>{for(const [o,k,v]of held){const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value"")||!Object.is(d.value,v))bad(""own"");}for(const [o,p]of prototypes)if(Object.getPrototypeOf(o)!==p)bad(""prototype"");for(const [o,k,d]of descriptors){const now=Object.getOwnPropertyDescriptor(o,k);if(!d){if(now!==undefined)bad(""shadow"");}else if(!now||!Object.hasOwn(now,""value"")||now.value!==d.value||now.writable!==d.writable||now.configurable!==d.configurable||now.enumerable!==d.enumerable)bad(""target"");}};
try{
if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad(""callback"");
const selected=select();stage=""reproof"";verify();if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad(""callback"");return selected;
}catch{return JSON.stringify({schema:""easyeda-pro-control.pcb-teardrop-owner-failure.v1"",stage,topic,reason});}}";
  const string TeardropOwnerFunction=@"function(originalCallback,callbacks,receiver0,receiver1,receiver2,receiver3,receiver4,receiver5,target0,target1,target2,target3,target4,target5){""use strict"";
let stage=""callback"",topic=null,reason=""unexpected"";
const bad=r=>{reason=r;throw new Error(""PCB_TEARDROP_OWNER"");};
const held=[],descriptors=[],prototypes=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad(""object"");const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad(""own"");held.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad(""object"");return o;};
const proto=o=>{const p=Object.getPrototypeOf(o);prototypes.push([o,p]);return p;};
const named=(o,n)=>{object(o);const p=proto(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==n||own(c,""prototype"")!==p)bad(""instance"");return o;};
const tuple=(v,n)=>{if(!Array.isArray(v)||proto(v)!==Array.prototype||own(v,""length"")!==n)bad(""count"");const keys=Reflect.ownKeys(v);if(keys.length!==n+1||keys[n]!==""length"")bad(""count"");for(let i=0;i<n;i++)if(keys[i]!==String(i))bad(""count"");return v;};
const topics=[""isMoveSwitch"",""SetSuspend"",""cheakTearDrop"",""addModifyTeardrop"",""flushTearDrop"",""refreshTearDrop""],names=[""isMoveSwitch"",""setSuspend"",""addModify"",""addMaodifyTeardrop"",""flushService"",""refreshService""];
const select=()=>{stage=""registry"";const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),registry=object(own(bus,""subscribed""));const p=proto(registry);if(p!==Object.prototype&&p!==null)bad(""prototype"");const selected=[];for(let i=0;i<6;i++){topic=topics[i];const tasks=tuple(own(registry,topic),1),task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad(""callback"");selected.push(callback);}topic=null;return selected;};
const target=(owner,name)=>{if(Object.getOwnPropertyDescriptor(owner,name)!==undefined)bad(""shadow"");descriptors.push([owner,name]);const p=proto(owner),d=Object.getOwnPropertyDescriptor(p,name);if(!d||!Object.hasOwn(d,""value"")||typeof d.value!==""function""||!d.writable||!d.configurable||d.enumerable)bad(""target"");descriptors.push([p,name,d]);return d.value;};
const verify=()=>{for(const [o,k,v]of held){const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value"")||!Object.is(d.value,v))bad(""own"");}for(const [o,p]of prototypes)if(Object.getPrototypeOf(o)!==p)bad(""prototype"");for(const [o,k,d]of descriptors){const now=Object.getOwnPropertyDescriptor(o,k);if(!d){if(now!==undefined)bad(""shadow"");}else if(!now||!Object.hasOwn(now,""value"")||now.value!==d.value||now.writable!==d.writable||now.configurable!==d.configurable||now.enumerable!==d.enumerable)bad(""target"");}};
try{
if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad(""callback"");
stage=""tuple"";tuple(callbacks,6);const selected=select(),receivers=[receiver0,receiver1,receiver2,receiver3,receiver4,receiver5],targets=[target0,target1,target2,target3,target4,target5];
stage=""receiver"";const owner=named(receiver0,""Sfe"");if(proto(proto(owner))!==Object.prototype)bad(""prototype"");
for(let i=0;i<6;i++){topic=topics[i];stage=""receiver"";if(receivers[i]!==owner)bad(""receiver"");stage=""target"";if(own(callbacks,String(i))!==selected[i])bad(""callback"");if(target(owner,names[i])!==targets[i])bad(""target"");}
topic=null;stage=""reproof"";verify();if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad(""callback"");return [owner,callbacks,targets];
}catch{return JSON.stringify({schema:""easyeda-pro-control.pcb-teardrop-owner-failure.v1"",stage,topic,reason});}}";
  public static string ModelProtocolMessage(int id,string method,string sessionId,string phase,
    string uniqueContextId,string objectId,string callbackObjectId,string constructorObjectId) {
    return ModelProtocolMessageCore(id,method,sessionId,phase,uniqueContextId,objectId,callbackObjectId,constructorObjectId,false);
  }
  public static string ModelProtocolMessage(int id,string method,string sessionId,string phase,
    string uniqueContextId,string objectId,string callbackObjectId,string constructorObjectId,string teardropObjectId) {
    return ModelProtocolMessageCore(id,method,sessionId,phase,uniqueContextId,objectId,callbackObjectId,constructorObjectId,false,teardropObjectId);
  }
  const string ModelStateV2Function=@"function(originalCallback){
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad();
const scope=object(own(this,""object""));
const klass=n=>{const c=own(scope,n);if(typeof c!==""function"")bad();return c;};
const instance=(o,c)=>{object(o);if(Object.getPrototypeOf(o)!==own(c,""prototype""))bad();return o;};
const envClass=klass(""x""),managerClass=klass(""wi""),copperClass=klass(""FP"");
const env=instance(own(envClass,""env""),envClass),manager=instance(own(managerClass,""manager""),managerClass);
if(own(env,""_doctype"")!==3||own(env,""_compiler"")===null)bad();
const alternate=marker(managerClass,""otherDecodingProjectId"");if(alternate===""present"")bad();
const channel=instance(own(env,""compilerChannel""),klass(""mCe""));
const compiler=(value,kind)=>{
instance(value,klass(kind===""main""?""Zu"":""XS""));
const base=instance(own(value,""base""),klass(""A8e"")),consistency=instance(own(base,""consistencyManager""),klass(""sCe""));
if(own(value,""uuid"")!==own(base,""uuid"")||own(value,""consistencyManager"")!==consistency||own(base,""channel"")!==channel||own(base,""_headType"")!==(kind===""main""?""PCB"":""FOOTPRINT""))bad();
const uniqueId=id(own(consistency,""unique"")),registry=plain(own(channel,""compiler"")),registryMap=nativeMap(own(registry,kind===""main""?""PCB"":""FOOTPRINT""));
mapSize(registryMap);
if(Reflect.apply(own(Map.prototype,""get""),registryMap,[uniqueId])!==base)bad();
const result={uuid:kind===""main""?id(own(base,""uuid"")):customId(own(base,""uuid"")),uniqueId,headType:kind===""main""?""PCB"":""FOOTPRINT"",isProject:flag(own(base,""isProject"")),isInit:flag(own(base,""isInit"")),canSave:flag(own(base,""canSave"")),isInitIng:flag(own(base,""isInitIng"")),pendCacheLength:extent(own(base,""pendCacheLength"")),pendingDocumentKeyCount:keys(own(base,""pendCache"")),cacheKeyCount:keys(own(base,""cache"")),deleteCacheCount:mapSize(own(base,""deleteCache"")),subscriptionCount:arrayLength(own(base,""sub"")),pendTimer:marker(base,""pendTimer""),pendPromise:marker(base,""pendPromise""),maxTicket:extent(own(consistency,""maxTicket"")),pendingChange:flag(own(consistency,""isPendChange"")),localChange:flag(own(consistency,""isLocalChange""))};
return result;
};
const mainOwner=own(env,""_compiler""),main=compiler(mainOwner,""main"");if(main.uuid!==id(own(env,""_id"")))bad();
const map=nativeMap(own(manager,""map"")),loadedFootprintCount=mapSize(map);if(loadedFootprintCount>128)bad();
const custom=[],seen=new Set(),iterator=Reflect.apply(own(Map.prototype,""entries""),map,[]),iteratorPrototype=Object.getPrototypeOf(iterator),next=own(iteratorPrototype,""next"");
if(typeof next!==""function"")bad();
for(let index=0;index<loadedFootprintCount;index++){
const entry=Reflect.apply(next,iterator,[]);if(own(entry,""done"")!==false)bad();
const pair=own(entry,""value"");if(arrayLength(pair)!==2)bad();
const footprint=object(own(pair,""1"")),prototype=Object.getPrototypeOf(footprint);
if(prototype!==own(klass(""Al""),""prototype"")&&prototype!==own(klass(""aC""),""prototype""))bad();
if(prototype===own(klass(""Al""),""prototype"")){
const uuid=customId(own(footprint,""_uuid""));if(own(pair,""0"")!==uuid||seen.has(uuid))bad();seen.add(uuid);
const state=compiler(own(footprint,""instance""),""custom-footprint"");if(state.uuid!==uuid)bad();custom.push(state);
}
}
if(own(Reflect.apply(next,iterator,[]),""done"")!==true)bad();

const lazyOwners=[],lazyOwnerPrototypes=[];
const lazyOwner=c=>{if(typeof c!==""function"")bad();const d=Object.getOwnPropertyDescriptor(c,""manager"");
if(d&&!Object.hasOwn(d,""value""))bad();
if(!d){let p=c,n=0;while(p!==null){if(++n>8||Object.hasOwn(p,""manager""))bad();const next=Object.getPrototypeOf(p);lazyOwnerPrototypes.push([p,next]);p=next;}}
lazyOwners.push([c,d]);const v=d?d.value:undefined;
return {marker:!d?""absent"":v===undefined?""undefined"":v===null?""null"":""present"",value:v};};
const verifyLazyOwners=()=>{for(const [c,d]of lazyOwners){const n=Object.getOwnPropertyDescriptor(c,""manager"");
if(!d){if(n!==undefined)bad();let p=Object.getPrototypeOf(c),i=0;while(p!==null){if(++i>8||Object.hasOwn(p,""manager""))bad();p=Object.getPrototypeOf(p);}}
else if(!n||!Object.hasOwn(n,""value"")||!Object.is(n.value,d.value)||n.writable!==d.writable||n.configurable!==d.configurable||n.enumerable!==d.enumerable)bad();}
for(const [o,p]of lazyOwnerPrototypes)if(Object.getPrototypeOf(o)!==p)bad();};

const copperOwner=lazyOwner(copperClass);let dynamicCopper={manager:copperOwner.marker,state:null};
if(copperOwner.marker===""present""){
const copper=instance(copperOwner.value,copperClass),workerMarker=marker(copper,""workerName"");
let workerName=null;if(workerMarker===""present"")workerName=extent(own(copper,""workerName""));
dynamicCopper={manager:""present"",state:{openPcb:flag(own(copper,""openPcb"")),workerNameMarker:workerMarker,workerName,timer:marker(copper,""time""),bus:marker(copper,""_bus"")}};
}
verifyLazyOwners();
if(own(envClass,""env"")!==env||own(managerClass,""manager"")!==manager||own(env,""_compiler"")!==mainOwner||own(manager,""map"")!==map||own(env,""compilerChannel"")!==channel)bad();
return JSON.stringify({schema:""easyeda-pro-control.pcb-diagnostic-model-state.v2"",main,loadedFootprintCount,customFootprints:custom,dynamicCopper});
}";
  const string ModelPendingV2Function=@"function(originalCallback,constructors,teardropProof){
""use strict"";
let stage=""callback"",reason=""unexpected"";
const bad=(r=""guard"")=>{reason=r;throw new Error(""PCB_DIAGNOSTIC_PENDING_STATE"");};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad(""object"");return o;};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad(""own"");const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad(""own"");return d.value;};
const optional=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return {marker:""absent"",value:undefined};const v=own(o,k);if(v===undefined)return {marker:""undefined"",value:v};if(v===null)return {marker:""null"",value:v};return {marker:""present"",value:v};};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad(""count"");return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad(""flag"");return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(v))bad(""id"");return v;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const keyCount=o=>{plain(o);const keys=Reflect.ownKeys(o);if(keys.some(k=>typeof k!==""string""))bad();return count(keys.length);};
const arrayCount=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const collection=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad(""collection"");const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad(""collection"");return count(Reflect.apply(d.get,o,[]));};

try{
if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad();
stage=""scope"";
const scope=object(own(this,""object"")),retained=[];

const constructorHeld=[],constructorProfiles={""kde"":[""kde"",0,{}],""Sfe"":[""Sfe"",0,{}],""mpe"":[""mpe"",0,{}],""Yde"":[""Yde"",0,{}],""HSe"":[""HSe"",0,{}],""USe"":[""USe"",0,{}],""Jse"":[""Jse"",0,{}],""Lpe"":[""Lpe"",1,{}],""Kme"":[""Kme"",0,{}],""fpe"":[""fpe"",0,{}],""P1e"":[""P1e"",0,{}],""mge"":[""mge"",0,{}],""tge"":[""tge"",0,{}],""$me"":[""Sy"",0,{""FLIP_PROGRESS_RANGE"":0.8,""FLIP_PROGRESS_START"":0.1,""MAX_QUEUE_SIZE"":20,""PROGRESS_UPDATE_INTERVAL"":10}],""Spe"":[""Spe"",0,{}],""Ume"":[""Ume"",0,{}],""cge"":[""cge"",0,{}],""Tfe"":[""Tfe"",0,{}],""Qme"":[""Qme"",0,{}],""jde"":[""jde"",0,{}]};
if(!Array.isArray(constructors)||Object.getPrototypeOf(constructors)!==Array.prototype)bad();
const constructorLength=own(constructors,""length""),constructorKeys=Reflect.ownKeys(constructors);
if(![16,20].includes(constructorLength)||constructorKeys.length!==constructorLength+1||constructorKeys[constructorLength]!==""length"")bad();
for(let i=0;i<constructorLength;i++)if(constructorKeys[i]!==String(i)||typeof own(constructors,String(i))!==""function"")bad();
const constructorNames=constructorLength===20?[""kde"",""Sfe"",""mpe"",""Yde"",""HSe"",""USe"",""Jse"",""Lpe"",""Kme"",""fpe"",""P1e"",""mge"",""tge"",""$me"",""Spe"",""Ume"",""cge"",""Tfe"",""Qme"",""jde""]:[""kde"",""Sfe"",""Jse"",""Lpe"",""Kme"",""fpe"",""P1e"",""mge"",""tge"",""$me"",""Spe"",""Ume"",""cge"",""Tfe"",""Qme"",""jde""];
const constructorMetadata=(c,name)=>{const [label,arity,statics]=constructorProfiles[name];if(own(c,""name"")!==label||own(c,""length"")!==arity)bad();for(const key of Object.keys(statics)){const d=Object.getOwnPropertyDescriptor(c,key);if(!d||!Object.hasOwn(d,""value"")||!d.writable||!d.configurable||!d.enumerable||own(c,key)!==statics[key])bad();}};
const constructorInstance=(o,name)=>{object(o);const i=constructorNames.indexOf(name);if(i<0)bad();const c=own(constructors,String(i)),p=own(c,""prototype"");if(Object.getPrototypeOf(o)!==p||own(p,""constructor"")!==c)bad();constructorMetadata(c,name);constructorHeld.push([o,p,c,name,i]);return o;};
const verifyConstructorAssociations=()=>{if(Object.getPrototypeOf(constructors)!==Array.prototype||own(constructors,""length"")!==constructorLength)bad();const k=Reflect.ownKeys(constructors);if(k.length!==constructorKeys.length||k.some((v,i)=>v!==constructorKeys[i]))bad();for(const [o,p,c,name,i] of constructorHeld){if(own(constructors,String(i))!==c||Object.getPrototypeOf(o)!==p||own(c,""prototype"")!==p||own(p,""constructor"")!==c)bad();constructorMetadata(c,name);}};

const klass=n=>{const c=own(scope,n);if(typeof c!==""function"")bad();return c;};
const instance=(o,c)=>{object(o);if(Object.getPrototypeOf(o)!==own(c,""prototype""))bad(""instance"");return o;};
const keep=(o,k)=>{const v=optional(o,k);retained.push([o,k,v.marker,v.value]);return v;};
stage=""environment"";const envClass=klass(""x""),env=instance(keep(envClass,""env"").value,envClass),compiler=own(env,""_compiler"");
if(own(env,""_doctype"")!==3||compiler===null||typeof compiler!==""object"")bad();
const documentUuid=id(own(env,""_id""));
const upload=n=>{const c=klass(n),v=keep(c,""proxy"");if(v.marker!==""present"")return {marker:v.marker,count:null};
const owner=instance(v.value,c),data=keep(owner,""data"").value;return {marker:""present"",count:collection(data,Set.prototype)};};
stage=""copper-uploads"";const copperUploads=upload(""qI"");stage=""plane-uploads"";const planeUploads=upload(""e5"");
stage=""board-upload"";const boardClass=klass(""pE""),boardOwner=keep(boardClass,""proxy"");
const boardUpload={marker:boardOwner.marker,flag:boardOwner.marker===""present""?flag(own(instance(boardOwner.value,boardClass),""flag"")):null};
stage=""commands"";const commands=constructorInstance(keep(scope,""Xe"").value,""kde""),undo=keep(commands,""undoCommand"").value,redo=keep(commands,""redoCommand"").value;
const undoCount=arrayCount(undo),redoCount=arrayCount(redo);if(undoCount>50||redoCount>50)bad();
const active=keep(commands,""stack"");if(active.marker!==""null""&&active.marker!==""present"")bad();
let activeStack=null;
if(active.marker===""present""){
stage=""active-stack"";
const stack=instance(active.value,klass(""De""));
activeStack={commandCount:arrayCount(keep(stack,""_commands"").value),waitingUploadCount:arrayCount(keep(stack,""waitingUploadStack"").value),
idMapCount:collection(keep(stack,""idMap"").value,Map.prototype),refreshService:flag(own(stack,""refreshService"")),
needCheckFilterCommand:flag(own(stack,""needCheckFilterCommand"")),partitionNeedAskBeforeDelete:flag(own(stack,""_partitionNeedAskBeforeDelete"")),
createPartitionFile:flag(own(stack,""createPartitionFile"")),sendCopperOrderChange:flag(own(stack,""sendCopperOrderChange""))};
}
stage=""teardrops"";

const tearsHeld=[],tearsPrototypes=[],tearsDescriptors=[],tearsTopics=[""isMoveSwitch"",""SetSuspend"",""cheakTearDrop"",""addModifyTeardrop"",""flushTearDrop"",""refreshTearDrop""],tearsMethods=[""isMoveSwitch"",""setSuspend"",""addModify"",""addMaodifyTeardrop"",""flushService"",""refreshService""];
const tearsOwn=(o,k)=>{const v=own(o,k);tearsHeld.push([o,k,v]);return v;};
const tearsProto=o=>{const p=Object.getPrototypeOf(o);tearsPrototypes.push([o,p]);return p;};
const tearsArray=(v,n)=>{if(!Array.isArray(v)||tearsProto(v)!==Array.prototype||tearsOwn(v,""length"")!==n)bad(""count"");const k=Reflect.ownKeys(v);if(k.length!==n+1||k[n]!==""length"")bad(""count"");for(let i=0;i<n;i++)if(k[i]!==String(i))bad(""count"");return v;};
const tearsNamed=(o,n)=>{object(o);const p=tearsProto(o),c=tearsOwn(p,""constructor"");if(typeof c!==""function""||tearsOwn(c,""name"")!==n||tearsOwn(c,""prototype"")!==p)bad(""instance"");return o;};
tearsArray(teardropProof,3);const teardropOwner=tearsNamed(tearsOwn(teardropProof,""0""),""Sfe""),tearsCallbacks=tearsArray(tearsOwn(teardropProof,""1""),6),tearsTargets=tearsArray(tearsOwn(teardropProof,""2""),6);
const tearsPrototype=tearsProto(teardropOwner);if(tearsProto(tearsPrototype)!==Object.prototype)bad(""prototype"");
const tearsBridge=tearsNamed(tearsOwn(globalThis,""MSG_BUS_PCB""),""HJ""),tearsBus=tearsNamed(tearsOwn(tearsBridge,""messageBus""),""Oet""),tearsRegistry=object(tearsOwn(tearsBus,""subscribed""));
const tearsRegistryPrototype=tearsProto(tearsRegistry);if(tearsRegistryPrototype!==Object.prototype&&tearsRegistryPrototype!==null)bad(""prototype"");
for(let i=0;i<6;i++){const tasks=tearsArray(tearsOwn(tearsRegistry,tearsTopics[i]),1),task=tearsNamed(tearsOwn(tasks,""0""),""Z1e""),callback=tearsOwn(task,""callback""),method=tearsMethods[i];if(tearsOwn(task,""isRunning"")!==true||typeof callback!==""function""||tearsOwn(tearsCallbacks,String(i))!==callback)bad(""callback"");if(Object.getOwnPropertyDescriptor(teardropOwner,method)!==undefined)bad(""shadow"");const d=Object.getOwnPropertyDescriptor(tearsPrototype,method);if(!d||!Object.hasOwn(d,""value"")||!d.writable||!d.configurable||d.enumerable||typeof d.value!==""function""||tearsOwn(tearsTargets,String(i))!==d.value)bad(""target"");tearsDescriptors.push([method,d]);}
const verifyTeardropOwner=()=>{for(const [o,k,v]of tearsHeld){const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value"")||!Object.is(d.value,v))bad(""own"");}for(const [o,p]of tearsPrototypes)if(Object.getPrototypeOf(o)!==p)bad(""prototype"");for(const [k,d]of tearsDescriptors){if(Object.getOwnPropertyDescriptor(teardropOwner,k)!==undefined)bad(""shadow"");const n=Object.getOwnPropertyDescriptor(tearsPrototype,k);if(!n||!Object.hasOwn(n,""value"")||n.value!==d.value||n.writable!==d.writable||n.configurable!==d.configurable||n.enumerable!==d.enumerable)bad(""target"");}};

const tears=constructorInstance(teardropOwner,""Sfe"");
const teardrops={isMove:flag(own(tears,""isMove"")),suspend:flag(own(tears,""suspend"")),
modifyCount:collection(keep(tears,""modify"").value,Set.prototype),taskCount:collection(keep(tears,""task"").value,Set.prototype),
modifyTearsCount:collection(keep(tears,""modifyTears"").value,Set.prototype),timer:keep(tears,""timeoutId"").marker};

const lazyOwners=[],lazyOwnerPrototypes=[];
const lazyOwner=c=>{if(typeof c!==""function"")bad();const d=Object.getOwnPropertyDescriptor(c,""manager"");
if(d&&!Object.hasOwn(d,""value""))bad();
if(!d){let p=c,n=0;while(p!==null){if(++n>8||Object.hasOwn(p,""manager""))bad();const next=Object.getPrototypeOf(p);lazyOwnerPrototypes.push([p,next]);p=next;}}
lazyOwners.push([c,d]);const v=d?d.value:undefined;
return {marker:!d?""absent"":v===undefined?""undefined"":v===null?""null"":""present"",value:v};};
const verifyLazyOwners=()=>{for(const [c,d]of lazyOwners){const n=Object.getOwnPropertyDescriptor(c,""manager"");
if(!d){if(n!==undefined)bad();let p=Object.getPrototypeOf(c),i=0;while(p!==null){if(++i>8||Object.hasOwn(p,""manager""))bad();p=Object.getPrototypeOf(p);}}
else if(!n||!Object.hasOwn(n,""value"")||!Object.is(n.value,d.value)||n.writable!==d.writable||n.configurable!==d.configurable||n.enumerable!==d.enumerable)bad();}
for(const [o,p]of lazyOwnerPrototypes)if(Object.getPrototypeOf(o)!==p)bad();};

stage=""dynamic-copper"";const copperClass=klass(""FP""),copperOwner=lazyOwner(copperClass);
let worker=null,copperBus=null;
if(copperOwner.marker===""present""){const copper=instance(copperOwner.value,copperClass);worker=keep(copper,""workerName"");copperBus=keep(copper,""_bus"");}
const workerId=worker!==null&&worker.marker===""present""?extent(worker.value):null;
stage=""worker-registry"";const workerClass=klass(""Of""),registry=keep(workerClass,""manager"");
let workers=null,association=copperOwner.marker!==""present""?""owner-unavailable"":workerId===null?""no-worker-id"":""registry-unavailable"";
if(registry.marker===""present""){
const manager=instance(registry.value,workerClass),map=keep(manager,""map"").value,bridges=keep(manager,""busMap"").value;
workers={workerCount:collection(map,Map.prototype),bridgeCount:keyCount(bridges),
ratlineWorkerCount:collection(keep(manager,""ratlineWorker"").value,Map.prototype),
threadBusCount:collection(keep(manager,""workerBus"").value,Map.prototype),
stateCount:keyCount(keep(manager,""_workerStateMap"").value),nextWorkerId:extent(own(manager,""id"")),nextThreadId:extent(own(manager,""i""))};
if(workerId!==null){
stage=""worker-association"";
const registered=Reflect.apply(own(Map.prototype,""get""),map,[workerId]),bridge=optional(bridges,String(workerId));
if(registered===undefined)association=""missing-worker"";
else if(bridge.marker!==""present"")association=""missing-bridge"";
else if(bridge.value!==copperBus.value)association=""bridge-mismatch"";
else{
object(registered);const selected=object(bridge.value),prototype=Object.getPrototypeOf(selected),constructor=own(prototype,""constructor"");
if(typeof constructor!==""function""||own(constructor,""name"")!==""Cet""||own(constructor,""prototype"")!==prototype)bad();
const sourceBus=own(own(globalThis,""MSG_BUS_PCB""),""messageBus"");
if(own(selected,""worker"")!==registered)association=""worker-mismatch"";
else if(own(selected,""bus"")!==sourceBus)association=""bus-mismatch"";
else association=""matched"";
}
}
}
stage=""reproof"";verifyConstructorAssociations();verifyTeardropOwner();verifyLazyOwners();if(own(env,""_compiler"")!==compiler||own(env,""_id"")!==documentUuid||own(env,""_doctype"")!==3)bad();
for(const r of retained){const v=optional(r[0],r[1]);if(v.marker!==r[2]||v.value!==r[3])bad();}
if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad();
stage=""serialize"";return JSON.stringify({schema:""easyeda-pro-control.pcb-diagnostic-pending-state.v2"",documentUuid,copperUploads,planeUploads,boardUpload,
commands:{undoCount,redoCount,activeStack},teardrops,workerRegistry:{marker:registry.marker,workers},
dynamicCopper:{manager:copperOwner.marker,state:copperOwner.marker===""present""?{workerMarker:worker.marker,workerId,busMarker:copperBus.marker,association}:null}});
}catch{return JSON.stringify({schema:""easyeda-pro-control.pcb-diagnostic-pending-failure.v1"",stage,reason});}
}";
  const string StringEmptyProducersV2Function=@"function(originalCallback,constructors){

""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};

if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad();
const scope=object(own(this,""object"")),klass=n=>{const c=own(scope,n);if(typeof c!==""function"")bad();return c;};

const constructorHeld=[],constructorProfiles={""kde"":[""kde"",0,{}],""Sfe"":[""Sfe"",0,{}],""mpe"":[""mpe"",0,{}],""Yde"":[""Yde"",0,{}],""HSe"":[""HSe"",0,{}],""USe"":[""USe"",0,{}],""Jse"":[""Jse"",0,{}],""Lpe"":[""Lpe"",1,{}],""Kme"":[""Kme"",0,{}],""fpe"":[""fpe"",0,{}],""P1e"":[""P1e"",0,{}],""mge"":[""mge"",0,{}],""tge"":[""tge"",0,{}],""$me"":[""Sy"",0,{""FLIP_PROGRESS_RANGE"":0.8,""FLIP_PROGRESS_START"":0.1,""MAX_QUEUE_SIZE"":20,""PROGRESS_UPDATE_INTERVAL"":10}],""Spe"":[""Spe"",0,{}],""Ume"":[""Ume"",0,{}],""cge"":[""cge"",0,{}],""Tfe"":[""Tfe"",0,{}],""Qme"":[""Qme"",0,{}],""jde"":[""jde"",0,{}]};
if(!Array.isArray(constructors)||Object.getPrototypeOf(constructors)!==Array.prototype)bad();
const constructorLength=own(constructors,""length""),constructorKeys=Reflect.ownKeys(constructors);
if(![20].includes(constructorLength)||constructorKeys.length!==constructorLength+1||constructorKeys[constructorLength]!==""length"")bad();
for(let i=0;i<constructorLength;i++)if(constructorKeys[i]!==String(i)||typeof own(constructors,String(i))!==""function"")bad();
const constructorNames=[""kde"",""Sfe"",""mpe"",""Yde"",""HSe"",""USe"",""Jse"",""Lpe"",""Kme"",""fpe"",""P1e"",""mge"",""tge"",""$me"",""Spe"",""Ume"",""cge"",""Tfe"",""Qme"",""jde""];
const constructorMetadata=(c,name)=>{const [label,arity,statics]=constructorProfiles[name];if(own(c,""name"")!==label||own(c,""length"")!==arity)bad();for(const key of Object.keys(statics)){const d=Object.getOwnPropertyDescriptor(c,key);if(!d||!Object.hasOwn(d,""value"")||!d.writable||!d.configurable||!d.enumerable||own(c,key)!==statics[key])bad();}};
const constructorInstance=(o,name)=>{object(o);const i=constructorNames.indexOf(name);if(i<0)bad();const c=own(constructors,String(i)),p=own(c,""prototype"");if(Object.getPrototypeOf(o)!==p||own(p,""constructor"")!==c)bad();constructorMetadata(c,name);constructorHeld.push([o,p,c,name,i]);return o;};
const verifyConstructorAssociations=()=>{if(Object.getPrototypeOf(constructors)!==Array.prototype||own(constructors,""length"")!==constructorLength)bad();const k=Reflect.ownKeys(constructors);if(k.length!==constructorKeys.length||k.some((v,i)=>v!==constructorKeys[i]))bad();for(const [o,p,c,name,i] of constructorHeld){if(own(constructors,String(i))!==c||Object.getPrototypeOf(o)!==p||own(c,""prototype"")!==p||own(p,""constructor"")!==c)bad();constructorMetadata(c,name);}};

const instance=(o,c)=>{object(o);if(Object.getPrototypeOf(o)!==own(c,""prototype""))bad();return o;};
const ec=klass(""x""),env=instance(own(ec,""env""),ec),documentUuid=id(own(env,""_id""),/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/);
if(own(env,""_doctype"")!==3)bad();
const emptyArray=o=>{if(arraySize(o)!==0)bad();return [];};
const nullish=(o,k)=>{const m=marker(o,k);if(m===""present"")bad();return m;};

const lazyOwners=[],lazyOwnerPrototypes=[];
const lazyOwner=c=>{if(typeof c!==""function"")bad();const d=Object.getOwnPropertyDescriptor(c,""manager"");
if(d&&!Object.hasOwn(d,""value""))bad();
if(!d){let p=c,n=0;while(p!==null){if(++n>8||Object.hasOwn(p,""manager""))bad();const next=Object.getPrototypeOf(p);lazyOwnerPrototypes.push([p,next]);p=next;}}
lazyOwners.push([c,d]);const v=d?d.value:undefined;
return {marker:!d?""absent"":v===undefined?""undefined"":v===null?""null"":""present"",value:v};};
const verifyLazyOwners=()=>{for(const [c,d]of lazyOwners){const n=Object.getOwnPropertyDescriptor(c,""manager"");
if(!d){if(n!==undefined)bad();let p=Object.getPrototypeOf(c),i=0;while(p!==null){if(++i>8||Object.hasOwn(p,""manager""))bad();p=Object.getPrototypeOf(p);}}
else if(!n||!Object.hasOwn(n,""value"")||!Object.is(n.value,d.value)||n.writable!==d.writable||n.configurable!==d.configurable||n.enumerable!==d.enumerable)bad();}
for(const [o,p]of lazyOwnerPrototypes)if(Object.getPrototypeOf(o)!==p)bad();};

const modelClass=klass(""MI""),modelOwner=lazyOwner(modelClass);
const views=constructorInstance(own(scope,""jo""),""mpe"");
let model={manager:modelOwner.marker,state:null};if(modelOwner.marker===""present""){const models=instance(modelOwner.value,modelClass);model={manager:""present"",state:{netKeys:emptyMap(own(models,""map"")),idKeys:emptyMap(own(models,""idMap"")),
lastRatline:nullish(models,""_lastRatline""),last:nullish(models,""_last"")}};}
const view={netKeys:emptyMap(own(views,""map"")),idKeys:emptyMap(own(views,""idMap"")),
highlightNets:emptySet(own(views,""highLightNets"")),clickHighlight:emptySet(own(views,""clickHighlightRatlines"")),
hoverHighlight:emptySet(own(views,""hoverHighlightRatlines""))};
const network=constructorInstance(own(scope,""ze""),""Yde""),updates=plain(own(network,""updateNets""));
if(keys(updates).length!==3)bad();
const notification=instance(own(network,""debounce""),klass(""U5""));
const net={keys:emptyMap(own(network,""map"")),noneKeys:emptyMap(own(network,""noneNetMap"")),
lengthKeys:emptyMap(own(network,""netLength"")),modifyKeys:emptyMap(own(network,""netModify"")),
rubbish:emptySet(own(network,""rubbish"")),options:emptyArray(own(network,""netOptions"")),
add:emptyArray(own(updates,""addNet"")),delete:emptyArray(own(updates,""deleteNet"")),
updateLengthKeys:emptyObject(own(updates,""updateNetLength"")),grayKeys:emptyObject(own(network,""ratlineVisibleBeforeGray"")),
viewGroups:null,viewGroupsMarker:marker(network,""_viewGroupIds""),updateLeftTree:nullish(network,""updateLeftTree""),
notification:{func:nullish(notification,""func""),animationFrame:nullish(notification,""animationFrameId""),
lastTime:own(notification,""lastTime""),delay:own(notification,""delay"")}};
if(net.viewGroupsMarker===""present"")net.viewGroups=emptyArray(own(network,""_viewGroupIds""));
if(net.notification.lastTime!==-1||net.notification.delay!==0)bad();
const clusters={networkKeys:emptyMap(own(klass(""Xh""),""map"")),
wireClusterKeys:emptyMap(own(constructorInstance(own(scope,""h_""),""HSe""),""map"")),
jumpWireKeys:emptyMap(own(constructorInstance(own(scope,""aE""),""USe""),""map"")),
useWireClusterCache:flag(own(klass(""h0""),""useWireClusterCache"")),emptyNetChange:flag(own(klass(""h0""),""emptyNetChange""))};
verifyConstructorAssociations();verifyLazyOwners();verify();if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad();
return JSON.stringify({schema:""easyeda-pro-control.pcb-string-empty-producers.v2"",documentUuid,model,view,net,clusters});
}";
  const string StringProducerMarkersV2Function=@"function(originalCallback,constructors){

""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};

if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad();
const prototypes=[],keySamples=[],absentFields=[];
const prototype=o=>{const p=Object.getPrototypeOf(o);prototypes.push([o,p]);return p;};
const scope=object(own(this,""object"")),klass=n=>{const c=own(scope,n);if(typeof c!==""function"")bad();return c;};

const constructorHeld=[],constructorProfiles={""kde"":[""kde"",0,{}],""Sfe"":[""Sfe"",0,{}],""mpe"":[""mpe"",0,{}],""Yde"":[""Yde"",0,{}],""HSe"":[""HSe"",0,{}],""USe"":[""USe"",0,{}],""Jse"":[""Jse"",0,{}],""Lpe"":[""Lpe"",1,{}],""Kme"":[""Kme"",0,{}],""fpe"":[""fpe"",0,{}],""P1e"":[""P1e"",0,{}],""mge"":[""mge"",0,{}],""tge"":[""tge"",0,{}],""$me"":[""Sy"",0,{""FLIP_PROGRESS_RANGE"":0.8,""FLIP_PROGRESS_START"":0.1,""MAX_QUEUE_SIZE"":20,""PROGRESS_UPDATE_INTERVAL"":10}],""Spe"":[""Spe"",0,{}],""Ume"":[""Ume"",0,{}],""cge"":[""cge"",0,{}],""Tfe"":[""Tfe"",0,{}],""Qme"":[""Qme"",0,{}],""jde"":[""jde"",0,{}]};
if(!Array.isArray(constructors)||Object.getPrototypeOf(constructors)!==Array.prototype)bad();
const constructorLength=own(constructors,""length""),constructorKeys=Reflect.ownKeys(constructors);
if(![20].includes(constructorLength)||constructorKeys.length!==constructorLength+1||constructorKeys[constructorLength]!==""length"")bad();
for(let i=0;i<constructorLength;i++)if(constructorKeys[i]!==String(i)||typeof own(constructors,String(i))!==""function"")bad();
const constructorNames=[""kde"",""Sfe"",""mpe"",""Yde"",""HSe"",""USe"",""Jse"",""Lpe"",""Kme"",""fpe"",""P1e"",""mge"",""tge"",""$me"",""Spe"",""Ume"",""cge"",""Tfe"",""Qme"",""jde""];
const constructorMetadata=(c,name)=>{const [label,arity,statics]=constructorProfiles[name];if(own(c,""name"")!==label||own(c,""length"")!==arity)bad();for(const key of Object.keys(statics)){const d=Object.getOwnPropertyDescriptor(c,key);if(!d||!Object.hasOwn(d,""value"")||!d.writable||!d.configurable||!d.enumerable||own(c,key)!==statics[key])bad();}};
const constructorInstance=(o,name)=>{object(o);const i=constructorNames.indexOf(name);if(i<0)bad();const c=own(constructors,String(i)),p=own(c,""prototype"");if(Object.getPrototypeOf(o)!==p||own(p,""constructor"")!==c)bad();constructorMetadata(c,name);constructorHeld.push([o,p,c,name,i]);return o;};
const verifyConstructorAssociations=()=>{if(Object.getPrototypeOf(constructors)!==Array.prototype||own(constructors,""length"")!==constructorLength)bad();const k=Reflect.ownKeys(constructors);if(k.length!==constructorKeys.length||k.some((v,i)=>v!==constructorKeys[i]))bad();for(const [o,p,c,name,i] of constructorHeld){if(own(constructors,String(i))!==c||Object.getPrototypeOf(o)!==p||own(c,""prototype"")!==p||own(p,""constructor"")!==c)bad();constructorMetadata(c,name);}};

const instance=(o,c)=>{object(o);if(prototype(o)!==own(c,""prototype""))bad();return o;};
const rawMarker=(o,k)=>{const m=marker(o,k);if(m===""absent""){absentFields.push([o,k]);let p=o,n=0;while(p!==null){if(++n>10)bad();p=prototype(p);}}return m;};
const finite=v=>{if(typeof v!==""number""||!Number.isFinite(v)||Object.is(v,-0))bad();return v;};
const token=v=>{finite(v);if(!Number.isSafeInteger(v)||v<0)bad();return v;};
const dataKeys=o=>{const k=Reflect.ownKeys(o);if(k.length>65537)bad();for(const key of k){if(typeof key!==""string"")bad();const d=Object.getOwnPropertyDescriptor(o,key);if(!d||!Object.hasOwn(d,""value""))bad();}keySamples.push([o,k]);return k;};
const objectCount=o=>{plain(o);prototype(o);return count(dataKeys(o).length);};
const arrayCount=o=>{if(!Array.isArray(o)||prototype(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=dataKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)if(k[i]!==String(i))bad();return n;};
const mapCount=o=>size(o,Map.prototype),setCount=o=>size(o,Set.prototype);
const ec=klass(""x""),env=instance(own(ec,""env""),ec),documentUuid=id(own(env,""_id""),/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/);
if(own(env,""_doctype"")!==3)bad();

const lazyOwners=[],lazyOwnerPrototypes=[];
const lazyOwner=c=>{if(typeof c!==""function"")bad();const d=Object.getOwnPropertyDescriptor(c,""manager"");
if(d&&!Object.hasOwn(d,""value""))bad();
if(!d){let p=c,n=0;while(p!==null){if(++n>8||Object.hasOwn(p,""manager""))bad();const next=Object.getPrototypeOf(p);lazyOwnerPrototypes.push([p,next]);p=next;}}
lazyOwners.push([c,d]);const v=d?d.value:undefined;
return {marker:!d?""absent"":v===undefined?""undefined"":v===null?""null"":""present"",value:v};};
const verifyLazyOwners=()=>{for(const [c,d]of lazyOwners){const n=Object.getOwnPropertyDescriptor(c,""manager"");
if(!d){if(n!==undefined)bad();let p=Object.getPrototypeOf(c),i=0;while(p!==null){if(++i>8||Object.hasOwn(p,""manager""))bad();p=Object.getPrototypeOf(p);}}
else if(!n||!Object.hasOwn(n,""value"")||!Object.is(n.value,d.value)||n.writable!==d.writable||n.configurable!==d.configurable||n.enumerable!==d.enumerable)bad();}
for(const [o,p]of lazyOwnerPrototypes)if(Object.getPrototypeOf(o)!==p)bad();};

const copperClass=klass(""FP""),copperSlot=lazyOwner(copperClass),copperOwner=copperSlot.value;
let dynamicCopper={manager:copperSlot.marker,state:null};
if(copperSlot.marker===""present""){
 const copper=instance(copperOwner,copperClass),workerNameMarker=rawMarker(copper,""workerName"");
 const state={openPcb:flag(own(copper,""openPcb"")),workerNameMarker,
 workerId:workerNameMarker===""present""?token(own(copper,""workerName"")):null,
 timerMarker:rawMarker(copper,""time""),busMarker:rawMarker(copper,""_bus"")};
 dynamicCopper={manager:""present"",state};
}
const modelClass=klass(""MI""),modelSlot=lazyOwner(modelClass),modelOwner=modelSlot.value;
let ratlineModel={manager:modelSlot.marker,state:null};
if(modelSlot.marker===""present""){
 const models=instance(modelOwner,modelClass);
 ratlineModel={manager:""present"",state:{netCount:mapCount(own(models,""map"")),idCount:mapCount(own(models,""idMap"")),
 lastRatlineMarker:rawMarker(models,""_lastRatline""),lastMarker:rawMarker(models,""_last"")}};
}
const views=constructorInstance(own(scope,""jo""),""mpe"");
const ratlineView={netCount:mapCount(own(views,""map"")),idCount:mapCount(own(views,""idMap"")),
 highlightNetCount:setCount(own(views,""highLightNets"")),clickHighlightCount:setCount(own(views,""clickHighlightRatlines"")),
 hoverHighlightCount:setCount(own(views,""hoverHighlightRatlines""))};
const network=constructorInstance(own(scope,""ze""),""Yde""),updates=plain(own(network,""updateNets""));
if(objectCount(updates)!==3)bad();
const viewGroupsMarker=rawMarker(network,""_viewGroupIds"");
const net={netCount:mapCount(own(network,""map"")),noneNetCount:mapCount(own(network,""noneNetMap"")),
 lengthCount:mapCount(own(network,""netLength"")),modifyCount:mapCount(own(network,""netModify"")),
 rubbishCount:setCount(own(network,""rubbish"")),optionCount:arrayCount(own(network,""netOptions"")),
 addCount:arrayCount(own(updates,""addNet"")),deleteCount:arrayCount(own(updates,""deleteNet"")),
 updateLengthCount:objectCount(own(updates,""updateNetLength"")),grayCount:objectCount(own(network,""ratlineVisibleBeforeGray"")),
 viewGroupsMarker,viewGroupCount:viewGroupsMarker===""present""?arrayCount(own(network,""_viewGroupIds"")):null};
const debounce=instance(own(network,""debounce""),klass(""U5"")),func=own(debounce,""func""),frame=own(debounce,""animationFrameId"");
if(func!==null&&typeof func!==""function"")bad();
const leftMarker=rawMarker(network,""updateLeftTree""),left=leftMarker===""present""?own(network,""updateLeftTree""):null;
if(leftMarker===""present""&&typeof left!==""function"")bad();
const notification={funcMarker:func===null?""null"":""function"",frameMarker:frame===null?""null"":""token"",
 frameId:frame===null?null:token(frame),lastTime:finite(own(debounce,""lastTime"")),delay:finite(own(debounce,""delay"")),
 updateLeftTreeMarker:leftMarker===""present""?""function"":leftMarker,
 sameCallbackReference:typeof func===""function""&&typeof left===""function""?func===left:null};
const clusters={networkCount:mapCount(own(klass(""Xh""),""map"")),
wireClusterCount:mapCount(own(constructorInstance(own(scope,""h_""),""HSe""),""map"")),
jumpWireCount:mapCount(own(constructorInstance(own(scope,""aE""),""USe""),""map"")),
 useWireClusterCache:flag(own(klass(""h0""),""useWireClusterCache"")),emptyNetChange:flag(own(klass(""h0""),""emptyNetChange""))};
verifyConstructorAssociations();verifyLazyOwners();verify();
for(const item of retained)if(item.length===3&&!Object.is(Object.getOwnPropertyDescriptor(item[0],item[1]).value,item[2]))bad();
for(const item of prototypes)if(Object.getPrototypeOf(item[0])!==item[1])bad();
for(const item of absentFields){let p=item[0],n=0;while(p!==null){if(++n>10||Object.hasOwn(p,item[1]))bad();p=Object.getPrototypeOf(p);}}
for(const item of keySamples){const k=Reflect.ownKeys(item[0]);if(k.length!==item[1].length)bad();for(let i=0;i<k.length;i++){if(k[i]!==item[1][i])bad();const d=Object.getOwnPropertyDescriptor(item[0],k[i]);if(!d||!Object.hasOwn(d,""value""))bad();}}
if(((()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_DIAGNOSTIC_MODEL_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const extent=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0)bad();return n;};
const count=n=>{extent(n);if(n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/.test(v))bad();return v;};
const customId=v=>{if(typeof v!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})_[a-f0-9]{16}$/.test(v))bad();return v;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return ""absent"";const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.some(v=>typeof v!==""string""))bad();return count(k.length);};
const arrayLength=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();return count(own(o,""length""));};
const nativeMap=o=>{object(o);if(Object.getPrototypeOf(o)!==Map.prototype||Reflect.ownKeys(o).length!==0)bad();return o;};
const mapSize=o=>{nativeMap(o);const d=Object.getOwnPropertyDescriptor(Map.prototype,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();return count(Reflect.apply(d.get,o,[]));};

const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const bridge=named(own(globalThis,""MSG_BUS_PCB""),""HJ""),bus=named(own(bridge,""messageBus""),""Oet""),subscribed=plain(own(bus,""subscribed"")),tasks=own(subscribed,""pcb/saveCompiler"");
if(arrayLength(tasks)!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,""0""),""Z1e""),callback=own(task,""callback"");
if(own(task,""isRunning"")!==true||typeof callback!==""function"")bad();
return callback;
})())!==originalCallback)bad();
return JSON.stringify({schema:""easyeda-pro-control.pcb-string-producer-markers.v2"",documentUuid,dynamicCopper,ratlineModel,ratlineView,net,notification,clusters});
}";
  static string ModelProtocolMessageCore(int id,string method,string sessionId,string phase,
    string uniqueContextId,string objectId,string callbackObjectId,string constructorObjectId,bool stringPurpose,string teardropObjectId=null) {
    Func<string,bool> handle=value=>value!=null && System.Text.RegularExpressions.Regex.IsMatch(value,@"\A[A-Za-z0-9_.:-]{1,256}\z");
    if(id<1 || id>(stringPurpose?225:103) || !handle(sessionId) || sessionId.Length>128) throw Error("model-fields");
    bool pending=phase=="pending" || phase=="pending-v2",snapshot=phase=="snapshot" || phase=="snapshot-v2";
    if((phase=="pending-v2" || phase=="snapshot-v2") && !stringPurpose) throw Error("model-purpose");
    if(!pending && phase!="root-inventory" && constructorObjectId!=null) throw Error("model-object");
    bool teardrop=pending || phase=="constructors-diagnostic" || phase=="constructors-precreate";
    if(teardrop?!handle(teardropObjectId):teardropObjectId!=null) throw Error("model-teardrop");
    const string effects="\"throwOnSideEffect\":true,\"silent\":true,\"awaitPromise\":false,\"generatePreview\":false,\"userGesture\":false";
    const string group="easyeda-pro-control-pcb-model-v1";
    string parameters;
    if(phase=="wrapper" && method=="Runtime.evaluate") {
      if(!handle(uniqueContextId) || objectId!=null || callbackObjectId!=null) throw Error("model-context");
      parameters=effects+",\"expression\":"+JsonString(ModelCallbackExpression)+",\"uniqueContextId\":"+JsonString(uniqueContextId)+
        ",\"objectGroup\":"+JsonString(group)+",\"returnByValue\":false,\"timeout\":1000,\"includeCommandLineAPI\":false,\"allowUnsafeEvalBlockedByCSP\":false";
    } else {
      if(uniqueContextId!=null) throw Error("model-context");
      if(phase=="properties" && method=="Runtime.getProperties") {
        if(!handle(objectId) || callbackObjectId!=null) throw Error("model-object");
        parameters="\"objectId\":"+JsonString(objectId)+",\"ownProperties\":true,\"accessorPropertiesOnly\":false,\"generatePreview\":false";
      } else if(phase=="handler" && method=="Runtime.callFunctionOn") {
        if(!handle(objectId) || callbackObjectId!=null) throw Error("model-object");
        parameters=effects+",\"objectId\":"+JsonString(objectId)+",\"functionDeclaration\":"+JsonString(ModelHandlerFunction)+",\"returnByValue\":false";
      } else if((phase=="constructors-diagnostic" || phase=="constructors-precreate") && method=="Runtime.callFunctionOn") {
        if(!handle(objectId) || !handle(callbackObjectId) || (phase=="constructors-precreate")!=stringPurpose) throw Error("model-constructors");
        string program=stringPurpose?ModelPrecreateConstructorsFunction:ModelDiagnosticConstructorsFunction;
        parameters=effects+",\"objectId\":"+JsonString(objectId)+",\"functionDeclaration\":"+JsonString(program)+
          ",\"returnByValue\":false,\"arguments\":[{\"objectId\":"+JsonString(callbackObjectId)+"},{\"objectId\":"+JsonString(teardropObjectId)+"}]";
      } else if((snapshot || pending || phase=="raw-strings" || phase=="root-inventory") && method=="Runtime.callFunctionOn") {
        if(!handle(objectId) || !handle(callbackObjectId) || ((pending || phase=="root-inventory") && !handle(constructorObjectId))) throw Error("model-object");
        string program=phase=="snapshot-v2"?ModelStateV2Function:phase=="pending-v2"?ModelPendingV2Function:phase=="snapshot"?ModelStateFunction:phase=="pending"?ModelPendingFunction:phase=="raw-strings"?ModelRawStringsFunction:ModelRootInventoryFunction;
        parameters=effects+",\"objectId\":"+JsonString(objectId)+",\"functionDeclaration\":"+JsonString(program)+
          ",\"returnByValue\":true,\"arguments\":[{\"objectId\":"+JsonString(callbackObjectId)+"}"+
          (pending || phase=="root-inventory"?",{\"objectId\":"+JsonString(constructorObjectId)+"}":"")+
          (pending?",{\"objectId\":"+JsonString(teardropObjectId)+"}":"")+"]";
      } else if(phase=="release" && method=="Runtime.releaseObjectGroup") {
        if(objectId!=null || callbackObjectId!=null) throw Error("model-object");
        parameters="\"objectGroup\":"+JsonString(group);
      } else throw Error("model-phase");
    }
    string message="{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+",\"method\":"+JsonString(method)+",\"params\":{"+
      parameters+"},\"sessionId\":"+JsonString(sessionId)+"}\0";
    if(Encoding.UTF8.GetByteCount(message)>(method=="Runtime.callFunctionOn"?65536:8192)) throw Error("model-send-size");
    return message;
  }
  // Pure fixed-command encoder, also used by no-process Windows CI. Native
  // ownership, monotonic request IDs and pipe writes remain in Send.
  public static string ProtocolMessage(int id,string method,string targetId,string sessionId,string scriptId,string uniqueContextId) {
    return ProtocolMessageCore(id,method,targetId,sessionId,scriptId,uniqueContextId,false);
  }
  static string ProtocolMessageCore(int id,string method,string targetId,string sessionId,string scriptId,string uniqueContextId,bool stringPurpose) {
    if(id<1 || id>(stringPurpose?225:103) || (method!="Runtime.evaluate" && uniqueContextId!=null)) throw Error("discovery-fields");
    Func<string,bool> token=value=>value!=null && System.Text.RegularExpressions.Regex.IsMatch(value,@"\A[A-Za-z0-9_.:-]{1,128}\z");
    string fields="";
    if(method=="Browser.getVersion" || method=="Target.getTargets") { if(targetId!=null || sessionId!=null || scriptId!=null) throw Error("discovery-fields"); }
    else if(method=="Target.attachToTarget") { if(!token(targetId) || sessionId!=null || scriptId!=null) throw Error("attach-fields"); fields=",\"params\":{\"targetId\":\""+targetId+"\",\"flatten\":true}"; }
    else {
      if(targetId!=null || !token(sessionId)) throw Error("session-fields");
      if(method=="Debugger.getScriptSource") { if(!token(scriptId)) throw Error("script-fields"); fields=",\"params\":{\"scriptId\":\""+scriptId+"\"}"; }
      else if(method=="Runtime.evaluate") {
        if(scriptId!=null || !token(uniqueContextId)) throw Error("worker-fields");
        fields=",\"params\":{\"expression\":"+WorkerExpressionJson()+",\"uniqueContextId\":\""+uniqueContextId+"\",\"returnByValue\":true,\"throwOnSideEffect\":true,\"silent\":true,\"awaitPromise\":false,\"includeCommandLineAPI\":false,\"allowUnsafeEvalBlockedByCSP\":false,\"timeout\":1000,\"userGesture\":false,\"generatePreview\":false}";
      }
      else if(method=="Target.setAutoAttach") {
        if(scriptId!=null) throw Error("worker-fields");
        fields=",\"params\":{\"autoAttach\":true,\"waitForDebuggerOnStart\":false,\"flatten\":true,\"filter\":[{\"type\":\"worker\",\"exclude\":false},{\"exclude\":true}]}";
      }
      else {
        if(scriptId!=null || (method!="Page.enable" && method!="Page.getFrameTree" && method!="Runtime.enable" && method!="Debugger.enable")) throw Error("session-method");
        fields=method=="Debugger.enable"?",\"params\":{\"maxScriptsCacheSize\":33554432}":",\"params\":{}";
      }
      fields+=",\"sessionId\":\""+sessionId+"\"";
    }
    string message="{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+",\"method\":\""+method+"\""+fields+"}\0";
    if(Encoding.UTF8.GetByteCount(message)>(method=="Runtime.evaluate"?8192:4096)) throw Error("send-size");
    return message;
  }
  public static void VerifyProtocolSmoke() {
    string[] lazyPrograms={ModelStateV2Function,ModelPendingV2Function,StringEmptyProducersV2Function,StringProducerMarkersV2Function};
    int[] lazyLengths={8872,17715,13089,15722};
    string[] lazyDigests={"e3b412ab98389e3071b78fea7391046d49d96ce2e71b631f863a94b2c689eeef","689a601acf4a73afd3386eca7a958dbad87e5ff6ffd6df74f282120b94782731","911d984112dc5c358f77ed1d0ef2a757921a9668b451a5638a0d943ef69733e5","a8e74ec6f2c508145b731ef03e15e967d2d18aaedf1b60a8bba26d20e2d50d9f"};
    for(int i=0;i<lazyPrograms.Length;i++) using(SHA256 hash=SHA256.Create()) {
      byte[] bytes=new UTF8Encoding(false,true).GetBytes(lazyPrograms[i]);
      if(bytes.Length!=lazyLengths[i] || BitConverter.ToString(hash.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()!=lazyDigests[i]) throw Error("lazy-program");
    }
    foreach(string phase in new string[]{"snapshot-v2","pending-v2"}) {
      bool pendingV2=phase=="pending-v2";
      ModelProtocolMessageCore(225,"Runtime.callFunctionOn","s",phase,null,"scope","callback",pendingV2?"constructors":null,true,pendingV2?"teardrop":null);
      bool refused=false;try{ModelProtocolMessageCore(1,"Runtime.callFunctionOn","s",phase,null,"scope","callback",pendingV2?"constructors":null,false,pendingV2?"teardrop":null);}catch(InvalidOperationException){refused=true;}
      if(!refused)throw Error("lazy-purpose-smoke");
    }
    foreach(string phase in new string[]{"empty-producers-v2","producer-markers-v2"}) {
      StringPrecreateProtocolMessage(225,"Runtime.callFunctionOn","s",phase,null,"scope","callback","constructors");
      bool refused=false;try{StringPrecreateProtocolMessage(1,"Runtime.callFunctionOn","s",phase,null,"scope","callback",null);}catch(InvalidOperationException){refused=true;}
      if(!refused)throw Error("lazy-constructors-smoke");
    }
    VerifyWorkerProducerProtocolSmoke();
    VerifyActorClockProtocolSmoke();
    using(SHA256 hash=SHA256.Create()) {
      byte[] source=Encoding.UTF8.GetBytes(WorkerExpression);
      if(source.Length!=3841 || BitConverter.ToString(hash.ComputeHash(source)).Replace("-","").ToLowerInvariant()!="dba64a7237d99363d35b134a7c4c6bfa312259f125fe2f7fb813db47b1ae4e52") throw Error("worker-program");
    }
    string[] programs={OpeningFunction,ModelCallbackExpression,ModelHandlerFunction,ModelStateFunction,ModelPendingFunction,ModelRawStringsFunction,ModelRootInventoryFunction,PcbOpeningFunction};
    int[] lengths={17003,2204,1730,7741,16466,8313,22587,13044};
    string[] digests={"186b6756f5a8b261ef225ac54202c4b9a9a8ccf65e9f30da537886779111d044","f1b6e32a10f64af767d6a29a679e0e906625585bc1d5514fef6dce3c2605776e","548c8af51fad2c6c11b47623dc845ed1e8031563756912bc6e16d004a2314591","67d4081399cdc22be17e2e1ddd0be234290092a2c5287f629fc2de9be16b85a5","69d21ad259b5d994e8c2f4ff4a5ede2cd1edca55516623d54fbd650969c9e812","bd31d235e95935bebeff4400cb08219cc2419b7bd25cead9ead2aa459299a8f4","75d3c48a376b86cca64f39fca738c6c8947869b2e560b20fefea3c637ab5a46e","62d282abfdea1db218ba057d5af99ca7b7198390454efdded7a72ab57d5568bf"};
    for(int i=0;i<programs.Length;i++) using(SHA256 hash=SHA256.Create()) {
      byte[] bytes=new UTF8Encoding(false,true).GetBytes(programs[i]);
      if(bytes.Length!=lengths[i] || BitConverter.ToString(hash.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()!=digests[i]) throw Error("fixed-program");
    }
    string[] commonPrograms={CommonConstructorsFunction,CommonPresentationFunction,CommonRulesFunction,CommonPreferenceFunction,CommonAssetsFunction,CommonMetadataFunction,TeardropCallbacksFunction,TeardropOwnerFunction};
    int[] commonLengths={6114,14584,14042,14640,10159,12134,7342,7986};
    string[] commonDigests={"7b18b78d9ba7dc29f00a86fbab59a06dfd15de615984d099ba6807485c3d8374","120e1bad0bf6c74d3d38fef610aa2a6e3daa9b7f77c9f8205195b42f94da1fb2","cfe762452a45dd80b2f0d35dd098ae2b13de106db9b863ec05852b1d24907754","bad2b7b90f85839104097550747167453edcfc37709ff606081a85177d5b1734","6d808cc30a9d8b056a7a243b7cff3bf300b080bd13779a409bb6bea6f1512671","381ba0b93a04dd4ab8e5460aeb4fbb4e89c483c5c4ce556df56c201e0e45d826","b087a93ce8a5e87515958a80b63bc7071688af9b5593cd2c64005b2a1fdb4f10","214d3a006b81be6be1add9a4086ad546bd8a8473a20fee17afa23d43e7f713fc"};
    for(int i=0;i<commonPrograms.Length;i++) using(SHA256 hash=SHA256.Create()) {
      byte[] bytes=new UTF8Encoding(false,true).GetBytes(commonPrograms[i]);
      if(bytes.Length!=commonLengths[i] || BitConverter.ToString(hash.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()!=commonDigests[i]) throw Error("common-program");
    }
    string[] constructorPrograms={ModelDiagnosticConstructorsFunction,ModelPrecreateConstructorsFunction};
    int[] constructorLengths={9405,9500};
    string[] constructorDigests={"39e262caf194637568945635f31e6ed347f70952373e972b2dac44e5ed41a7eb","4585fa94501dfc73175d96cc5cb8b3494384c1c33e1e9941509c3106081517fe"};
    for(int i=0;i<constructorPrograms.Length;i++) using(SHA256 hash=SHA256.Create()) {
      byte[] bytes=new UTF8Encoding(false,true).GetBytes(constructorPrograms[i]);
      if(bytes.Length!=constructorLengths[i] || BitConverter.ToString(hash.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()!=constructorDigests[i]) throw Error("constructor-program");
    }
    string[] stringPrograms={StringRendererAssociationFunction,StringWorkerAssociationExpression,StringEmptyProducersFunction};
    int[] stringLengths={10446,4246,11937};
    string[] stringDigests={"c18652b92e5cf0cfc512ec6c9eff73fd15fd7343cf22a52b18102f3c28861a0d","b10ad5e9cd78f3bf0755af6a5c9cba6348d7642f275909933ffafc97da39f3b7","98bc6cb2a30b50361e0911ec2dc6c4d2326f7e292768c34a9e3bd83452fbbad4"};
    for(int i=0;i<stringPrograms.Length;i++) using(SHA256 hash=SHA256.Create()) {
      byte[] bytes=new UTF8Encoding(false,true).GetBytes(stringPrograms[i]);
      if(bytes.Length!=stringLengths[i] || BitConverter.ToString(hash.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()!=stringDigests[i]) throw Error("string-program");
    }
    foreach(string phase in new string[] {"renderer-association","empty-producers"}) {
      string message=StringPrecreateProtocolMessage(111,"Runtime.callFunctionOn","page",phase,null,"scope","callback",phase=="empty-producers"?"constructors":null);
      string arguments="\"arguments\":[{\"objectId\":\"callback\"}"+(phase=="empty-producers"?",{\"objectId\":\"constructors\"}":"")+"]";
      if(message.IndexOf("\"throwOnSideEffect\":true",StringComparison.Ordinal)<0 ||
        message.IndexOf(arguments,StringComparison.Ordinal)<0) throw Error("string-scope-smoke");
    }
    StringPrecreateProtocolMessage(225,"Runtime.evaluate","worker","worker-association","context",null,null,null);
    ProtocolMessage(103,"Browser.getVersion",null,null,null,null);
    bool diagnostic104Refused=false,string226Refused=false;
    try { ProtocolMessage(104,"Browser.getVersion",null,null,null,null); } catch(InvalidOperationException) { diagnostic104Refused=true; }
    try { StringPrecreateProtocolMessage(226,"Runtime.evaluate","worker","worker-association","context",null,null,null); } catch(InvalidOperationException) { string226Refused=true; }
    if(!diagnostic104Refused || !string226Refused) throw Error("string-budget-smoke");
    CommonBaselineProtocolMessage(1,"Runtime.evaluate","page","wrapper","context",null,null,null);
    CommonBaselineProtocolMessage(225,"Runtime.releaseObjectGroup","page","release",null,null,null,null);
    foreach(string phase in new string[] {"constructors","presentation","rules","preference","assets","metadata"}) {
      bool pair=phase!="constructors" && phase!="metadata";
      string common=CommonBaselineProtocolMessage(100,"Runtime.callFunctionOn","page",phase,null,"scope","callback",pair?"constructors":null);
      string arguments="\"arguments\":[{\"objectId\":\"callback\"}"+(pair?",{\"objectId\":\"constructors\"}":"")+"]";
      if(common.IndexOf(arguments,StringComparison.Ordinal)<0 || common.IndexOf("\"throwOnSideEffect\":true",StringComparison.Ordinal)<0 ||
        common.IndexOf("\"returnByValue\":"+(phase=="constructors"?"false":"true"),StringComparison.Ordinal)<0) throw Error("common-scope-smoke");
      foreach(string invalid in new string[] {null,"","foreign/handle",new string('a',257)}) {
        bool refused=false; try { CommonBaselineProtocolMessage(100,"Runtime.callFunctionOn","page",phase,null,"scope",invalid,pair?"constructors":null); } catch(InvalidOperationException) { refused=true; }
        if(!refused) throw Error("common-callback-smoke");
        refused=false; try { CommonBaselineProtocolMessage(100,"Runtime.callFunctionOn","page",phase,null,"scope","callback",pair?invalid:"extra"); } catch(InvalidOperationException) { refused=true; }
        if(!refused) throw Error("common-constructor-smoke");
      }
    }
    foreach(string phase in new string[] {"wrapper","constructors","presentation","rules","preference","assets","metadata","release","properties","handler","unknown"}) {
      bool refused=false; try { CommonBaselineProtocolMessage(1,"Runtime.getProperties","page",phase,null,"scope","callback",null); } catch(InvalidOperationException) { refused=true; }
      if(!refused) throw Error("common-method-smoke");
    }
    bool commonBudgetRefused=false; try { CommonBaselineProtocolMessage(226,"Runtime.releaseObjectGroup","page","release",null,null,null,null); } catch(InvalidOperationException) { commonBudgetRefused=true; }
    if(!commonBudgetRefused) throw Error("common-budget-smoke");
    foreach(bool stringPurpose in new bool[]{false,true}) {
      int limit=stringPurpose?225:103;
      TeardropProtocolMessage(limit,"Runtime.callFunctionOn","page","teardrop-callbacks","scope","callback",null,null,null,stringPurpose);
      object[] receivers={"r0","r1","r2","r3","r4","r5"},targets={"t0","t1","t2","t3","t4","t5"};
      string message=TeardropProtocolMessage(limit,"Runtime.callFunctionOn","page","teardrop-owner","scope","callback","callbacks",receivers,targets,stringPurpose);
      string arguments="\"arguments\":[{\"objectId\":\"callback\"},{\"objectId\":\"callbacks\"}";
      foreach(object[] roster in new object[][]{receivers,targets}) foreach(object value in roster) arguments+=",{\"objectId\":"+JsonString((string)value)+"}";
      arguments+="]";
      if(message.IndexOf(arguments,StringComparison.Ordinal)<0 || message.IndexOf("\"returnByValue\":false",StringComparison.Ordinal)<0 ||
        message.IndexOf("\"throwOnSideEffect\":true",StringComparison.Ordinal)<0) throw Error("teardrop-arguments-smoke");
      bool refused=false;try{TeardropProtocolMessage(limit+1,"Runtime.callFunctionOn","page","teardrop-owner","scope","callback","callbacks",receivers,targets,stringPurpose);}catch(InvalidOperationException){refused=true;}
      if(!refused)throw Error("teardrop-budget-smoke");
      foreach(object[] invalid in new object[][]{null,new object[0],new object[5],new object[7],new object[]{"r0","r1","r2","r3","r4","foreign/handle"}}) {
        refused=false;try{TeardropProtocolMessage(1,"Runtime.callFunctionOn","page","teardrop-owner","scope","callback","callbacks",invalid,targets,stringPurpose);}catch(InvalidOperationException){refused=true;}
        if(!refused)throw Error("teardrop-receiver-smoke");
        refused=false;try{TeardropProtocolMessage(1,"Runtime.callFunctionOn","page","teardrop-owner","scope","callback","callbacks",receivers,invalid,stringPurpose);}catch(InvalidOperationException){refused=true;}
        if(!refused)throw Error("teardrop-target-smoke");
      }
      refused=false;try{TeardropProtocolMessage(1,"Runtime.callFunctionOn","page","teardrop-callbacks","scope","callback","callbacks",receivers,targets,stringPurpose);}catch(InvalidOperationException){refused=true;}
      if(!refused)throw Error("teardrop-selector-extra-smoke");
    }
    string syntheticPath=@"C:\synthetic\fixture.eprj2",project;
    using(SHA256 hash=SHA256.Create()) project=BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(syntheticPath))).Replace("-","").ToLowerInvariant();
    foreach(string phase in new string[]{"preflight","open-project"}) {
      string opening=OpeningProtocolMessage(64,"parent","unique",phase,syntheticPath,project,new string('a',32),new string('b',16),new string('c',64));
      if(opening.IndexOf("\"awaitPromise\":true",StringComparison.Ordinal)<0 ||
        opening.IndexOf("\"throwOnSideEffect\":false",StringComparison.Ordinal)<0 ||
        opening.IndexOf("\"functionDeclaration\":",StringComparison.Ordinal)<0) throw Error("opening-flags");
    }
    foreach(string phase in new string[]{"preflight","open-document","observe"}) {
      string opening=PcbOpeningProtocolMessage(64,"parent","unique",phase,syntheticPath,project,new string('a',32),new string('b',16),new string('c',64));
      if(opening.IndexOf("\"awaitPromise\":true",StringComparison.Ordinal)<0 ||
        opening.IndexOf("\"throwOnSideEffect\":false",StringComparison.Ordinal)<0) throw Error("pcb-opening-flags");
    }
    ModelProtocolMessage(1,"Runtime.evaluate","s","wrapper","c",null,null,null);
    ModelProtocolMessage(2,"Runtime.getProperties","s","properties",null,"object",null,null);
    ModelProtocolMessage(3,"Runtime.callFunctionOn","s","handler",null,"object",null,null);
    ModelProtocolMessage(4,"Runtime.callFunctionOn","s","snapshot",null,"object","callback",null);
    string pending=ModelProtocolMessage(5,"Runtime.callFunctionOn","s","pending",null,"object","callback","constructors","teardrop");
    if(pending.IndexOf("\"arguments\":[{\"objectId\":\"callback\"},{\"objectId\":\"constructors\"},{\"objectId\":\"teardrop\"}]",StringComparison.Ordinal)<0) throw Error("pending-constructors-smoke");
    ModelProtocolMessage(6,"Runtime.callFunctionOn","s","raw-strings",null,"object","callback",null);
    string rootInventory=ModelProtocolMessage(7,"Runtime.callFunctionOn","s","root-inventory",null,"object","callback","constructors");
    if(rootInventory.IndexOf("\"arguments\":[{\"objectId\":\"callback\"},{\"objectId\":\"constructors\"}]",StringComparison.Ordinal)<0) throw Error("root-constructors-smoke");
    ModelProtocolMessage(8,"Runtime.releaseObjectGroup","s","release",null,null,null,null);
    ModelProtocolMessage(82,"Runtime.callFunctionOn",new string('s',128),"root-inventory",null,new string('o',256),new string('c',256),new string('b',256));
    foreach(bool stringPurpose in new bool[] {false,true}) {
      string phase=stringPurpose?"constructors-precreate":"constructors-diagnostic";
      string message=ModelProtocolMessageCore(9,"Runtime.callFunctionOn","s",phase,null,"scope","callback",null,stringPurpose,"teardrop");
      if(message.IndexOf("\"returnByValue\":false",StringComparison.Ordinal)<0 ||
        message.IndexOf("\"arguments\":[{\"objectId\":\"callback\"},{\"objectId\":\"teardrop\"}]",StringComparison.Ordinal)<0 ||
        message.IndexOf("\"throwOnSideEffect\":true",StringComparison.Ordinal)<0) throw Error("constructors-selector-smoke");
      bool refused=false;
      try { ModelProtocolMessageCore(9,"Runtime.callFunctionOn","s",phase,null,"scope","callback",null,!stringPurpose,"teardrop"); } catch(InvalidOperationException) { refused=true; }
      if(!refused) throw Error("constructors-purpose-smoke");
    }
    foreach(string invalid in new string[] { null,"","foreign/handle",new string('a',257) }) {
      bool pendingRefused=false,emptyRefused=false,rootRefused=false;
      try { ModelProtocolMessage(10,"Runtime.callFunctionOn","s","pending",null,"scope","callback",invalid,"teardrop"); } catch(InvalidOperationException) { pendingRefused=true; }
      try { ModelProtocolMessage(10,"Runtime.callFunctionOn","s","root-inventory",null,"scope","callback",invalid); } catch(InvalidOperationException) { rootRefused=true; }
      try { StringPrecreateProtocolMessage(10,"Runtime.callFunctionOn","s","empty-producers",null,"scope","callback",invalid); } catch(InvalidOperationException) { emptyRefused=true; }
      if(!pendingRefused || !emptyRefused || !rootRefused) throw Error("constructors-required-smoke");
    }
    foreach(string phase in new string[] {"wrapper","properties","handler","constructors-diagnostic","snapshot","raw-strings","release"}) {
      bool refused=false;
      try { ModelProtocolMessage(10,"Runtime.callFunctionOn","s",phase,null,"scope","callback","extra"); } catch(InvalidOperationException) { refused=true; }
      if(!refused) throw Error("constructors-extra-smoke");
    }
    foreach(string phase in new string[] {"renderer-association","worker-association"}) {
      bool refused=false;
      try { StringPrecreateProtocolMessage(10,phase=="worker-association"?"Runtime.evaluate":"Runtime.callFunctionOn","s",phase,null,"scope","callback","extra"); } catch(InvalidOperationException) { refused=true; }
      if(!refused) throw Error("string-constructors-extra-smoke");
    }
    foreach(string invalid in new string[] { null,"","foreign/handle",new string('a',257) }) {
      bool refused=false; try { ModelProtocolMessage(82,"Runtime.callFunctionOn","s","root-inventory",null,"object",invalid,"constructors"); } catch(InvalidOperationException) { refused=true; }
      if(!refused) throw Error("root-inventory-callback-smoke");
    }
    string worker=ProtocolMessage(32,"Runtime.evaluate",null,"worker-session",null,"unique-context");
    if(worker.IndexOf("\"throwOnSideEffect\":true",StringComparison.Ordinal)<0 || worker.IndexOf("\"awaitPromise\":false",StringComparison.Ordinal)<0) throw Error("worker-flags");
    string attach=ProtocolMessage(1,"Target.setAutoAttach",null,"parent-session",null,null);
    if(attach.IndexOf("\"waitForDebuggerOnStart\":false",StringComparison.Ordinal)<0 || attach.IndexOf("\"filter\":[{\"type\":\"worker\",\"exclude\":false},{\"exclude\":true}]",StringComparison.Ordinal)<0) throw Error("worker-filter");
    foreach(string invalid in new string[] { null,"","quoted\"context","line\ncontext",new string('a',129) }) {
      bool refused=false; try { ProtocolMessage(1,"Runtime.evaluate",null,"worker-session",null,invalid); } catch(InvalidOperationException) { refused=true; }
      if(!refused) throw Error("worker-context-smoke");
    }
    foreach(string method in new string[] { "Browser.getVersion","Target.setAutoAttach","Runtime.enable","Runtime.callFunctionOn" }) {
      bool refused=false; try { ProtocolMessage(1,method,null,"parent-session",null,"context"); } catch(InvalidOperationException) { refused=true; }
      if(!refused) throw Error("worker-request-smoke");
    }
  }
  // PowerShell converts $null to "" when binding a System.String parameter.
  // Preserve absence at this boundary; an explicitly supplied empty string
  // remains a string and must still fail the original strict encoder.
  static string OptionalText(object value) {
    if(value==null) return null;
    string text=value as string; if(text==null) throw Error("optional-text-type");
    return text;
  }
  public static string BoundProtocolMessage(int id,string method,object targetId,object sessionId,object scriptId,object uniqueContextId) {
    return ProtocolMessage(id,method,OptionalText(targetId),OptionalText(sessionId),OptionalText(scriptId),OptionalText(uniqueContextId));
  }
  public static string BoundModelProtocolMessage(int id,string method,string sessionId,string phase,object uniqueContextId,object objectId,object callbackObjectId,object constructorObjectId) {
    return ModelProtocolMessage(id,method,sessionId,phase,OptionalText(uniqueContextId),OptionalText(objectId),OptionalText(callbackObjectId),OptionalText(constructorObjectId));
  }
  public static string BoundModelProtocolMessage(int id,string method,string sessionId,string phase,object uniqueContextId,object objectId,object callbackObjectId,object constructorObjectId,object teardropObjectId) {
    return ModelProtocolMessage(id,method,sessionId,phase,OptionalText(uniqueContextId),OptionalText(objectId),OptionalText(callbackObjectId),OptionalText(constructorObjectId),OptionalText(teardropObjectId));
  }
  public static string DomProtocolMessage(int id,string method,string sessionId,object frameId,object backendNodeId) {
    return DomProtocolMessageCore(id,method,sessionId,frameId,backendNodeId,false);
  }
  static string DomProtocolMessageCore(int id,string method,string sessionId,object frameId,object backendNodeId,bool stringPurpose) {
    Func<string,bool> token=value=>value!=null && System.Text.RegularExpressions.Regex.IsMatch(value,@"\A[A-Za-z0-9_.:-]{1,128}\z");
    if(id<1 || id>(stringPurpose?225:103) || !token(sessionId)) throw Error("dom-fields");
    string parameters;
    if(method=="DOM.getFrameOwner") {
      string frame=OptionalText(frameId);
      if(!token(frame) || backendNodeId!=null) throw Error("dom-frame");
      parameters="\"frameId\":"+JsonString(frame);
    } else if(method=="DOM.describeNode") {
      if(frameId!=null || (!(backendNodeId is int) && !(backendNodeId is long))) throw Error("dom-node");
      long node=Convert.ToInt64(backendNodeId,CultureInfo.InvariantCulture);
      if(node<1 || node>int.MaxValue) throw Error("dom-node");
      parameters="\"backendNodeId\":"+node.ToString(CultureInfo.InvariantCulture)+",\"depth\":0,\"pierce\":false";
    } else throw Error("dom-method");
    string message="{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+",\"method\":"+JsonString(method)+",\"params\":{"+
      parameters+"},\"sessionId\":"+JsonString(sessionId)+"}\0";
    if(Encoding.UTF8.GetByteCount(message)>1024) throw Error("dom-size");
    return message;
  }
  public void SendDom(int id,string method,string sessionId,object frameId,object backendNodeId) {
    SendMessage(id,DomProtocolMessageCore(id,method,sessionId,frameId,backendNodeId,stringPrecreate));
  }
  public void Send(int id,string method,object targetId,object sessionId,object scriptId,object uniqueContextId) {
    SendMessage(id,ProtocolMessageCore(id,method,OptionalText(targetId),OptionalText(sessionId),OptionalText(scriptId),OptionalText(uniqueContextId),stringPrecreate));
  }
  public void SendOpening(int id,string sessionId,string uniqueContextId,string phase,string path,string project,string branch,string document,string source) {
    SendMessage(id,OpeningProtocolMessageCore(false,id,sessionId,uniqueContextId,phase,path,project,branch,document,source,stringPrecreate));
  }
  public void SendPcbOpening(int id,string sessionId,string uniqueContextId,string phase,string path,string project,string branch,string document,string source) {
    SendMessage(id,OpeningProtocolMessageCore(true,id,sessionId,uniqueContextId,phase,path,project,branch,document,source,stringPrecreate));
  }
  public void SendModel(int id,string method,string sessionId,string phase,object uniqueContextId,object objectId,object callbackObjectId,object constructorObjectId,object teardropObjectId) {
    SendMessage(id,ModelProtocolMessageCore(id,method,sessionId,phase,OptionalText(uniqueContextId),OptionalText(objectId),OptionalText(callbackObjectId),OptionalText(constructorObjectId),stringPrecreate,OptionalText(teardropObjectId)));
  }
  public static string TeardropProtocolMessage(int id,string method,string sessionId,string phase,object suppliedScope,object suppliedCallback,
    object suppliedCallbacks,object[] suppliedReceivers,object[] suppliedTargets,bool stringPurpose) {
    string scope=OptionalText(suppliedScope),callback=OptionalText(suppliedCallback),callbacks=OptionalText(suppliedCallbacks);
    Func<string,bool> handle=value=>value!=null && System.Text.RegularExpressions.Regex.IsMatch(value,@"\A[A-Za-z0-9_.:-]{1,256}\z");
    if(id<1 || id>(stringPurpose?225:103) || method!="Runtime.callFunctionOn" || !handle(sessionId) || sessionId.Length>128 || !handle(scope) || !handle(callback)) throw Error("teardrop-fields");
    string arguments="[{\"objectId\":"+JsonString(callback)+"}",program;
    if(phase=="teardrop-callbacks") {
      if(callbacks!=null || suppliedReceivers!=null || suppliedTargets!=null) throw Error("teardrop-extra");
      program=TeardropCallbacksFunction;
    } else if(phase=="teardrop-owner") {
      if(!handle(callbacks) || suppliedReceivers==null || suppliedTargets==null || suppliedReceivers.Length!=6 || suppliedTargets.Length!=6) throw Error("teardrop-roster");
      arguments+=",{\"objectId\":"+JsonString(callbacks)+"}";
      foreach(object[] roster in new object[][] {suppliedReceivers,suppliedTargets}) foreach(object value in roster) {
        string selected=OptionalText(value);if(!handle(selected))throw Error("teardrop-handle");arguments+=",{\"objectId\":"+JsonString(selected)+"}";
      }
      program=TeardropOwnerFunction;
    } else throw Error("teardrop-phase");
    arguments+="]";
    string parameters="\"throwOnSideEffect\":true,\"silent\":true,\"awaitPromise\":false,\"generatePreview\":false,\"userGesture\":false,\"objectId\":"+JsonString(scope)+
      ",\"functionDeclaration\":"+JsonString(program)+",\"returnByValue\":false,\"arguments\":"+arguments;
    string message="{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+",\"method\":"+JsonString(method)+",\"params\":{"+parameters+"},\"sessionId\":"+JsonString(sessionId)+"}\0";
    if(Encoding.UTF8.GetByteCount(message)>65536) throw Error("teardrop-size");return message;
  }
  public void SendTeardrop(int id,string method,string sessionId,string phase,object scope,object callback,object callbacks,object[] receivers,object[] targets) {
    SendMessage(id,TeardropProtocolMessage(id,method,sessionId,phase,scope,callback,callbacks,receivers,targets,stringPrecreate));
  }
  public static string StringPrecreateProtocolMessage(int id,string method,string sessionId,string phase,
    object suppliedContext,object suppliedObject,object suppliedCallback,object suppliedConstructors) {
    string context=OptionalText(suppliedContext),scope=OptionalText(suppliedObject),callback=OptionalText(suppliedCallback),constructors=OptionalText(suppliedConstructors);
    Func<string,bool> handle=value=>value!=null && System.Text.RegularExpressions.Regex.IsMatch(value,@"\A[A-Za-z0-9_.:-]{1,256}\z");
    if(id<1 || id>225 || !handle(sessionId) || sessionId.Length>128) throw Error("string-fields");
    bool producers=phase=="empty-producers" || phase=="empty-producers-v2" || phase=="producer-markers-v2";
    if(!producers && constructors!=null) throw Error("string-scope");
    const string effects="\"throwOnSideEffect\":true,\"silent\":true,\"awaitPromise\":false,\"generatePreview\":false,\"userGesture\":false";
    string parameters;
    if(phase=="worker-association" && method=="Runtime.evaluate") {
      if(!handle(context) || scope!=null || callback!=null) throw Error("string-context");
      parameters=effects+",\"expression\":"+JsonString(StringWorkerAssociationExpression)+",\"uniqueContextId\":"+JsonString(context)+
        ",\"returnByValue\":true,\"includeCommandLineAPI\":false,\"allowUnsafeEvalBlockedByCSP\":false,\"timeout\":1000";
    } else if((phase=="renderer-association" || producers) && method=="Runtime.callFunctionOn") {
      if(context!=null || !handle(scope) || !handle(callback) || (producers && !handle(constructors))) throw Error("string-scope");
      parameters=effects+",\"objectId\":"+JsonString(scope)+",\"functionDeclaration\":"+
        JsonString(phase=="renderer-association"?StringRendererAssociationFunction:phase=="empty-producers-v2"?StringEmptyProducersV2Function:phase=="producer-markers-v2"?StringProducerMarkersV2Function:StringEmptyProducersFunction)+
        ",\"returnByValue\":true,\"arguments\":[{\"objectId\":"+JsonString(callback)+"}"+
        (producers?",{\"objectId\":"+JsonString(constructors)+"}":"")+"]";
    } else throw Error("string-phase");
    string message="{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+",\"method\":"+JsonString(method)+",\"params\":{"+
      parameters+"},\"sessionId\":"+JsonString(sessionId)+"}\0";
    if(Encoding.UTF8.GetByteCount(message)>(method=="Runtime.callFunctionOn"?65536:8192)) throw Error("string-send-size");
    return message;
  }
  public void SendStringPrecreate(int id,string method,string sessionId,string phase,object context,object scope,object callback,object constructors) {
    if(!stringPrecreate) throw Error("string-purpose");
    SendMessage(id,StringPrecreateProtocolMessage(id,method,sessionId,phase,context,scope,callback,constructors));
  }
  const string ActorClockUiFunction=@"function(target){

""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};

const root=globalThis,apply=Reflect.apply,nativeDate=own(root,""Date""),now=own(nativeDate,""now""),datePrototype=own(nativeDate,""prototype""),iso=own(datePrototype,""toISOString""),zone=own(datePrototype,""getTimezoneOffset"");
if([nativeDate,now,iso,zone].some(v=>typeof v!==""function""))bad();
const stamp=()=>{verify();const milliseconds=apply(now,nativeDate,[]);if(!Number.isSafeInteger(milliseconds)||milliseconds<0||milliseconds>8640000000000000||Object.is(milliseconds,-0))bad();const date=new nativeDate(milliseconds),timezoneOffsetMinutes=apply(zone,date,[]);if(!Number.isSafeInteger(timezoneOffsetMinutes)||Math.abs(timezoneOffsetMinutes)>840||Object.is(timezoneOffsetMinutes,-0))bad();return{milliseconds,iso:apply(iso,date,[]),timezoneOffsetMinutes};};
const before=stamp();
const text=(v,max)=>{if(typeof v!==""string""||v.length>max||!v.isWellFormed())bad();return v;};
const actor=o=>({uuid:id(own(o,""uuid""),/^[a-f0-9]{32}$/),username:text(own(o,""username""),1024),nickname:text(own(o,""nickname""),1024)});
const finish=()=>{const after=stamp();verify();if(after.milliseconds<before.milliseconds||after.milliseconds-before.milliseconds>1000||after.timezoneOffsetMinutes!==before.timezoneOffsetMinutes)bad();return{before,after};};

plain(target);if(Reflect.ownKeys(target).join("","")!==""projectUuid,branchUuid,documentUuid,windowTabId"")bad();
id(own(target,""projectUuid""),/^[a-f0-9]{64}$/);id(own(target,""branchUuid""),/^[a-f0-9]{32}$/);id(own(target,""documentUuid""),/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/);id(own(target,""windowTabId""),/^[A-Za-z0-9_-]{1,128}$/);
if(own(root,""_TAB_ID_"")!==target.windowTabId)bad();

const host=object(own(root,""gVars"")),ui=object(own(root,""UI"")),project=object(own(host,""currentProject""));
if(own(ui,""gVars"")!==host||own(project,""projectId"")!==target.projectUuid||own(project,""branchUuid"")!==target.branchUuid||own(project,""isV2Format"")!==false||own(host,""isHistoryMode"")!==false)bad();
const cached=object(own(object(own(host,""globalVariableCookieData"")),""userInfo"")),startup=object(own(host,""loginedUserInfo""));
const cachedActor=actor(cached),startupActor=actor(startup);
if(JSON.stringify(cachedActor)!==JSON.stringify(startupActor))bad();
const workerUser={uuid:startupActor.uuid,nickname:startupActor.nickname,username:startupActor.username,avatar:text(own(startup,""avatar""),4096)};
return JSON.stringify({schema:""easyeda-pro-control.pcb-string-actor-clock.v1"",phase:""ui"",identity:target,cachedActor,startupActor,workerUser,workerUserText:JSON.stringify(workerUser),clock:finish()});
}";
  const string ActorClockWorkerFunction=@"function(target){

""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};

const root=globalThis,apply=Reflect.apply,nativeDate=own(root,""Date""),now=own(nativeDate,""now""),datePrototype=own(nativeDate,""prototype""),iso=own(datePrototype,""toISOString""),zone=own(datePrototype,""getTimezoneOffset"");
if([nativeDate,now,iso,zone].some(v=>typeof v!==""function""))bad();
const stamp=()=>{verify();const milliseconds=apply(now,nativeDate,[]);if(!Number.isSafeInteger(milliseconds)||milliseconds<0||milliseconds>8640000000000000||Object.is(milliseconds,-0))bad();const date=new nativeDate(milliseconds),timezoneOffsetMinutes=apply(zone,date,[]);if(!Number.isSafeInteger(timezoneOffsetMinutes)||Math.abs(timezoneOffsetMinutes)>840||Object.is(timezoneOffsetMinutes,-0))bad();return{milliseconds,iso:apply(iso,date,[]),timezoneOffsetMinutes};};
const before=stamp();
const text=(v,max)=>{if(typeof v!==""string""||v.length>max||!v.isWellFormed())bad();return v;};
const actor=o=>({uuid:id(own(o,""uuid""),/^[a-f0-9]{32}$/),username:text(own(o,""username""),1024),nickname:text(own(o,""nickname""),1024)});
const finish=()=>{const after=stamp();verify();if(after.milliseconds<before.milliseconds||after.milliseconds-before.milliseconds>1000||after.timezoneOffsetMinutes!==before.timezoneOffsetMinutes)bad();return{before,after};};

plain(target);if(Reflect.ownKeys(target).join("","")!==""projectUuid,branchUuid,documentUuid,windowTabId"")bad();
id(own(target,""projectUuid""),/^[a-f0-9]{64}$/);id(own(target,""branchUuid""),/^[a-f0-9]{32}$/);id(own(target,""documentUuid""),/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/);id(own(target,""windowTabId""),/^[A-Za-z0-9_-]{1,128}$/);
if(own(root,""_TAB_ID_"")!==target.windowTabId)bad();

const project=named(own(root,""PROJECT""),""Lg""),gp=Object.getPrototypeOf(Object.getPrototypeOf(project));
if(own(own(gp,""constructor""),""name"")!==""Gd""||Object.getPrototypeOf(gp)!==Object.prototype||own(project,""uuid"")!==target.projectUuid||own(project,""_branchUuid"")!==target.branchUuid)bad();
const source=plain(own(project,""user"")),order=Reflect.ownKeys(source);
if(order.length!==4||order.some(k=>typeof k!==""string""||![""uuid"",""nickname"",""username"",""avatar""].includes(k)))bad();
const projected=actor(source),avatar=text(own(source,""avatar""),4096),workerUser={};
for(const key of order){const d=Object.getOwnPropertyDescriptor(source,key);if(!d||d.enumerable!==true)bad();workerUser[key]=key===""avatar""?avatar:projected[key];}
if(Reflect.ownKeys(source).join("","")!==order.join("",""))bad();
return JSON.stringify({schema:""easyeda-pro-control.pcb-string-actor-clock.v1"",phase:""worker"",identity:target,workerUser,workerUserText:JSON.stringify(workerUser),clock:finish()});
}";
  const string ActorClockPcbFunction=@"function(){
""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};

const root=globalThis,apply=Reflect.apply,nativeDate=own(root,""Date""),now=own(nativeDate,""now""),datePrototype=own(nativeDate,""prototype""),iso=own(datePrototype,""toISOString""),zone=own(datePrototype,""getTimezoneOffset"");
if([nativeDate,now,iso,zone].some(v=>typeof v!==""function""))bad();
const stamp=()=>{verify();const milliseconds=apply(now,nativeDate,[]);if(!Number.isSafeInteger(milliseconds)||milliseconds<0||milliseconds>8640000000000000||Object.is(milliseconds,-0))bad();const date=new nativeDate(milliseconds),timezoneOffsetMinutes=apply(zone,date,[]);if(!Number.isSafeInteger(timezoneOffsetMinutes)||Math.abs(timezoneOffsetMinutes)>840||Object.is(timezoneOffsetMinutes,-0))bad();return{milliseconds,iso:apply(iso,date,[]),timezoneOffsetMinutes};};
const before=stamp();
const text=(v,max)=>{if(typeof v!==""string""||v.length>max||!v.isWellFormed())bad();return v;};
const actor=o=>({uuid:id(own(o,""uuid""),/^[a-f0-9]{32}$/),username:text(own(o,""username""),1024),nickname:text(own(o,""nickname""),1024)});
const finish=()=>{const after=stamp();verify();if(after.milliseconds<before.milliseconds||after.milliseconds-before.milliseconds>1000||after.timezoneOffsetMinutes!==before.timezoneOffsetMinutes)bad();return{before,after};};

return JSON.stringify({schema:""easyeda-pro-control.pcb-string-actor-clock.v1"",phase:""pcb"",clock:finish()});
}";
  // Local Date and DOCHEAD actor snapshots only. No Windows clock/APP authority.
  public static string ActorClockProtocolMessage(int id,string method,string sessionId,string phase,object suppliedContext,
    object suppliedProject,object suppliedBranch,object suppliedDocument,object suppliedWindow) {
    string context=OptionalText(suppliedContext),project=OptionalText(suppliedProject),branch=OptionalText(suppliedBranch),
      document=OptionalText(suppliedDocument),window=OptionalText(suppliedWindow);
    Func<string,string,bool> match=(value,pattern)=>value!=null && System.Text.RegularExpressions.Regex.IsMatch(value,pattern);
    if(id<1 || id>225 || method!="Runtime.callFunctionOn" || !match(sessionId,@"\A[A-Za-z0-9_.:-]{1,128}\z") ||
      !match(context,@"\A[A-Za-z0-9_.:-]{1,256}\z")) throw Error("actor-clock-fields");
    string program,arguments;
    if(phase=="pcb") {
      if(project!=null || branch!=null || document!=null || window!=null) throw Error("actor-clock-pcb-target");
      program=ActorClockPcbFunction;arguments="[]";
    } else if(phase=="ui" || phase=="worker") {
      if(!match(project,@"\A[a-f0-9]{64}\z") || !match(branch,@"\A[a-f0-9]{32}\z") ||
        !match(document,@"\A(?:[a-f0-9]{16}|[a-f0-9]{32})\z") || !match(window,@"\A[A-Za-z0-9_-]{1,128}\z")) throw Error("actor-clock-target");
      program=phase=="ui"?ActorClockUiFunction:ActorClockWorkerFunction;
      arguments="[{\"value\":{\"projectUuid\":"+JsonString(project)+",\"branchUuid\":"+JsonString(branch)+
        ",\"documentUuid\":"+JsonString(document)+",\"windowTabId\":"+JsonString(window)+"}}]";
    } else throw Error("actor-clock-phase");
    string parameters="\"functionDeclaration\":"+JsonString(program)+",\"uniqueContextId\":"+JsonString(context)+",\"arguments\":"+arguments+
      ",\"returnByValue\":true,\"throwOnSideEffect\":true,\"silent\":true,\"awaitPromise\":false,\"generatePreview\":false,\"userGesture\":false";
    string message="{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+",\"method\":"+JsonString(method)+",\"params\":{"+parameters+
      "},\"sessionId\":"+JsonString(sessionId)+"}\0";
    if(Encoding.UTF8.GetByteCount(message)>65536) throw Error("actor-clock-send-size");return message;
  }
  public void SendActorClock(int id,string method,string sessionId,string phase,object context,object project,object branch,object document,object window) {
    if(!stringPrecreate) throw Error("actor-clock-purpose");
    SendMessage(id,ActorClockProtocolMessage(id,method,sessionId,phase,context,project,branch,document,window));
  }
  public static void VerifyActorClockProtocolSmoke() {
    string[] programs={ActorClockUiFunction,ActorClockWorkerFunction,ActorClockPcbFunction};
    int[] lengths={5011,5073,3828};
    string[] digests={"38a7cdc7eabee6083322da3e67a22e4f95711824ac363e2b314ccff0f2fa14b8","405b6e62234ff0d185d07ed753d678bfe2a37d4a0e5676d3a692230d4acda6e4","fd305129368c88eac97b9d316dde7ff333cf4e440d11aac7ab7d54254e19a3ea"};
    for(int i=0;i<programs.Length;i++) using(SHA256 hash=SHA256.Create()) {
      byte[] bytes=new UTF8Encoding(false,true).GetBytes(programs[i]);
      if(bytes.Length!=lengths[i] || BitConverter.ToString(hash.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()!=digests[i]) throw Error("actor-clock-program-smoke");
    }
    string project=new string('a',64),branch=new string('b',32),document=new string('d',16);
    foreach(string phase in new string[]{"ui","worker","pcb"}) {
      bool pcb=phase=="pcb";
      string message=ActorClockProtocolMessage(1,"Runtime.callFunctionOn","session",phase,"context",pcb?null:project,pcb?null:branch,pcb?null:document,pcb?null:"window");
      if(!message.EndsWith("\0",StringComparison.Ordinal) || !message.Contains("\"throwOnSideEffect\":true") ||
        !message.Contains("\"awaitPromise\":false")) throw Error("actor-clock-smoke");
      foreach(object invalid in new object[]{null,"","bad\ncontext",1}) {
        bool refused=false;try { ActorClockProtocolMessage(1,"Runtime.callFunctionOn","session",phase,invalid,pcb?null:project,pcb?null:branch,pcb?null:document,pcb?null:"window"); }
        catch(InvalidOperationException) { refused=true; }if(!refused) throw Error("actor-clock-context-smoke");
      }
    }
    foreach(string phase in new string[]{"other","UI",""}) {
      bool refused=false;try { ActorClockProtocolMessage(1,"Runtime.callFunctionOn","session",phase,"context",project,branch,document,"window"); }
      catch(InvalidOperationException) { refused=true; }if(!refused) throw Error("actor-clock-phase-smoke");
    }
    bool extra=false;try { ActorClockProtocolMessage(1,"Runtime.callFunctionOn","session","pcb","context",project,branch,document,"window"); }
    catch(InvalidOperationException) { extra=true; }if(!extra) throw Error("actor-clock-extra-smoke");
  }
  // Fixed common baseline reads share the original String owner and page.
  // No caller source, object group, options or request budget is accepted.
  public static string CommonBaselineProtocolMessage(int id,string method,string sessionId,string phase,
    object suppliedContext,object suppliedObject,object suppliedCallback,object suppliedConstructors) {
    string context=OptionalText(suppliedContext),scope=OptionalText(suppliedObject),callback=OptionalText(suppliedCallback),constructors=OptionalText(suppliedConstructors);
    Func<string,bool> handle=value=>value!=null && System.Text.RegularExpressions.Regex.IsMatch(value,@"\A[A-Za-z0-9_.:-]{1,256}\z");
    if(id<1 || id>225 || !handle(sessionId) || sessionId.Length>128) throw Error("common-fields");
    bool withConstructors=phase=="presentation" || phase=="rules" || phase=="preference" || phase=="assets";
    if(!withConstructors && constructors!=null) throw Error("common-constructors");
    const string effects="\"throwOnSideEffect\":true,\"silent\":true,\"awaitPromise\":false,\"generatePreview\":false,\"userGesture\":false";
    const string group="easyeda-pro-control-pcb-common-baseline-v2";
    string parameters;
    if(phase=="wrapper" && method=="Runtime.evaluate") {
      if(!handle(context) || scope!=null || callback!=null) throw Error("common-context");
      parameters=effects+",\"expression\":"+JsonString(ModelCallbackExpression)+",\"uniqueContextId\":"+JsonString(context)+
        ",\"objectGroup\":"+JsonString(group)+",\"returnByValue\":false,\"timeout\":1000,\"includeCommandLineAPI\":false,\"allowUnsafeEvalBlockedByCSP\":false";
    } else if(phase=="release" && method=="Runtime.releaseObjectGroup") {
      if(context!=null || scope!=null || callback!=null) throw Error("common-release");
      parameters="\"objectGroup\":"+JsonString(group);
    } else if((withConstructors || phase=="constructors" || phase=="metadata") && method=="Runtime.callFunctionOn") {
      if(context!=null || !handle(scope) || !handle(callback) || (withConstructors && !handle(constructors))) throw Error("common-scope");
      string program=phase=="constructors"?CommonConstructorsFunction:phase=="presentation"?CommonPresentationFunction:
        phase=="rules"?CommonRulesFunction:phase=="preference"?CommonPreferenceFunction:phase=="assets"?CommonAssetsFunction:CommonMetadataFunction;
      parameters=effects+",\"objectId\":"+JsonString(scope)+",\"functionDeclaration\":"+JsonString(program)+
        ",\"returnByValue\":"+(phase=="constructors"?"false":"true")+",\"arguments\":[{\"objectId\":"+JsonString(callback)+"}"+
        (withConstructors?",{\"objectId\":"+JsonString(constructors)+"}":"")+"]";
    } else throw Error("common-phase");
    string message="{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+",\"method\":"+JsonString(method)+",\"params\":{"+
      parameters+"},\"sessionId\":"+JsonString(sessionId)+"}\0";
    if(Encoding.UTF8.GetByteCount(message)>(method=="Runtime.callFunctionOn"?65536:8192)) throw Error("common-send-size");
    return message;
  }
  public void SendCommonBaseline(int id,string method,string sessionId,string phase,object context,object scope,object callback,object constructors) {
    if(!stringPrecreate) throw Error("common-purpose");
    SendMessage(id,CommonBaselineProtocolMessage(id,method,sessionId,phase,context,scope,callback,constructors));
  }
  const string WorkerProducerProgram0=@"(()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};

const project=object(own(globalThis,""PROJECT""));named(project,""Lg"");
const lp=Object.getPrototypeOf(project);named(lp,""Gd"");
if(Object.getPrototypeOf(Object.getPrototypeOf(lp))!==Object.prototype)bad();
verify();return project;})()";
  const string WorkerProducerProgram1=@"(()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};

const fn=v=>{if(typeof v!==""function"")bad();return v;};
const scope=o=>object(own(o,""object""));
const nullable=v=>v===null?""null"":(object(v),""present"");
const timer=v=>{if(v===null)return ""null"";if(v===undefined)return ""undefined"";if(typeof v!==""number""||!Number.isSafeInteger(v)||Object.is(v,-0)||v<1)bad();return ""present"";};
const promise=v=>{if(v===null)return ""null"";object(v);if(Object.getPrototypeOf(v)!==Promise.prototype)bad();return ""present"";};
const resolver=v=>v===null?""null"":(fn(v),""present"");
const project=object(own(globalThis,""PROJECT""));named(project,""Lg"");
const lp=Object.getPrototypeOf(project);named(lp,""Gd"");
if(Object.getPrototypeOf(Object.getPrototypeOf(lp))!==Object.prototype)bad();
const identity={projectUuid:id(own(project,""uuid""),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),
branchUuid:id(own(project,""_branchUuid""),/^[a-f0-9]{32}$/),windowTabId:id(own(globalThis,""_TAB_ID_""),/^[A-Za-z0-9_-]{1,128}$/)};
const original=fn(own(project,""uploadStructure""));verify();return original;})()";
  const string WorkerProducerProgram2=@"(()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};

const fn=v=>{if(typeof v!==""function"")bad();return v;};
const scope=o=>object(own(o,""object""));
const nullable=v=>v===null?""null"":(object(v),""present"");
const timer=v=>{if(v===null)return ""null"";if(v===undefined)return ""undefined"";if(typeof v!==""number""||!Number.isSafeInteger(v)||Object.is(v,-0)||v<1)bad();return ""present"";};
const promise=v=>{if(v===null)return ""null"";object(v);if(Object.getPrototypeOf(v)!==Promise.prototype)bad();return ""present"";};
const resolver=v=>v===null?""null"":(fn(v),""present"");
const project=object(own(globalThis,""PROJECT""));named(project,""Lg"");
const lp=Object.getPrototypeOf(project);named(lp,""Gd"");
if(Object.getPrototypeOf(Object.getPrototypeOf(lp))!==Object.prototype)bad();
const identity={projectUuid:id(own(project,""uuid""),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),
branchUuid:id(own(project,""_branchUuid""),/^[a-f0-9]{32}$/),windowTabId:id(own(globalThis,""_TAB_ID_""),/^[A-Za-z0-9_-]{1,128}$/)};
const original=fn(own(project,""structure""));verify();return original;})()";
  const string WorkerProducerProgram3=@"(()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};

const fn=v=>{if(typeof v!==""function"")bad();return v;};
const scope=o=>object(own(o,""object""));
const nullable=v=>v===null?""null"":(object(v),""present"");
const timer=v=>{if(v===null)return ""null"";if(v===undefined)return ""undefined"";if(typeof v!==""number""||!Number.isSafeInteger(v)||Object.is(v,-0)||v<1)bad();return ""present"";};
const promise=v=>{if(v===null)return ""null"";object(v);if(Object.getPrototypeOf(v)!==Promise.prototype)bad();return ""present"";};
const resolver=v=>v===null?""null"":(fn(v),""present"");
const project=object(own(globalThis,""PROJECT""));named(project,""Lg"");
const lp=Object.getPrototypeOf(project);named(lp,""Gd"");
if(Object.getPrototypeOf(Object.getPrototypeOf(lp))!==Object.prototype)bad();
const identity={projectUuid:id(own(project,""uuid""),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),
branchUuid:id(own(project,""_branchUuid""),/^[a-f0-9]{32}$/),windowTabId:id(own(globalThis,""_TAB_ID_""),/^[A-Za-z0-9_-]{1,128}$/)};
const original=fn(own(project,""bufferedPendDataStream""));verify();return original;})()";
  const string WorkerProducerProgram4=@"(()=>{
""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};

const fn=v=>{if(typeof v!==""function"")bad();return v;};
const scope=o=>object(own(o,""object""));
const nullable=v=>v===null?""null"":(object(v),""present"");
const timer=v=>{if(v===null)return ""null"";if(v===undefined)return ""undefined"";if(typeof v!==""number""||!Number.isSafeInteger(v)||Object.is(v,-0)||v<1)bad();return ""present"";};
const promise=v=>{if(v===null)return ""null"";object(v);if(Object.getPrototypeOf(v)!==Promise.prototype)bad();return ""present"";};
const resolver=v=>v===null?""null"":(fn(v),""present"");
const project=object(own(globalThis,""PROJECT""));named(project,""Lg"");
const lp=Object.getPrototypeOf(project);named(lp,""Gd"");
if(Object.getPrototypeOf(Object.getPrototypeOf(lp))!==Object.prototype)bad();
const identity={projectUuid:id(own(project,""uuid""),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),
branchUuid:id(own(project,""_branchUuid""),/^[a-f0-9]{32}$/),windowTabId:id(own(globalThis,""_TAB_ID_""),/^[A-Za-z0-9_-]{1,128}$/)};
const original=fn(own(project,""bufferedUploadCloud""));verify();return original;})()";
  const string WorkerProducerProgram5=@"function(){
""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};

const descriptors=[],prototypes=[];
const proto=o=>{const p=Object.getPrototypeOf(o);prototypes.push([o,p]);return p;};
const desc=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);descriptors.push([o,k,d]);return d;};
const absent=(o,k)=>{if(desc(o,k)!==undefined)bad();};
const nativeMethod=(o,k)=>{const d=desc(o,k);if(!d||!Object.hasOwn(d,""value"")||typeof d.value!==""function""||!d.writable||!d.configurable||d.enumerable)bad();return d.value;};
const project=object(own(globalThis,""PROJECT""));if(this!==project)bad();
named(project,""Lg"");const lp=proto(project);named(lp,""Gd"");const gp=proto(lp);if(proto(gp)!==Object.prototype)bad();
for(const key of [""isReadOnly"",""isV2Format"",""canWsPublish""])absent(project,key);
absent(lp,""isReadOnly"");absent(lp,""isV2Format"");
const format=desc(gp,""isV2Format"");if(!format||Object.hasOwn(format,""value"")||typeof format.get!==""function""||typeof format.set!==""function""||!format.configurable||format.enumerable)bad();
const bus=object(own(project,""workerBus""));named(bus,""JP"");const jp=proto(bus);named(jp,""KP"");const kp=proto(jp);named(kp,""Mb"");const mp=proto(kp);if(proto(mp)!==Object.prototype)bad();
for(const key of [""publish"",""broadcastPublish"",""post"",""onMessage"",""onReceivedPublish""])absent(bus,key);
absent(jp,""publish"");absent(jp,""onReceivedPublish"");
const methods=[nativeMethod(gp,""isReadOnly""),format.get,nativeMethod(lp,""canWsPublish""),nativeMethod(kp,""publish""),nativeMethod(jp,""broadcastPublish""),nativeMethod(jp,""post""),nativeMethod(jp,""onMessage""),nativeMethod(kp,""onReceivedPublish"")];
const recheck=()=>{verify();for(const [o,p]of prototypes)if(Object.getPrototypeOf(o)!==p)bad();for(const [o,k,d]of descriptors){const n=Object.getOwnPropertyDescriptor(o,k);if(!d){if(n!==undefined)bad();continue;}if(!n||n.enumerable!==d.enumerable||n.configurable!==d.configurable||Object.hasOwn(n,""value"")!==Object.hasOwn(d,""value"")||n.value!==d.value||n.writable!==d.writable||n.get!==d.get||n.set!==d.set)bad();}};

recheck();return methods;}";
  const string WorkerProducerProgram6=@"function(originalMethods,gateScope){
""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};

const descriptors=[],prototypes=[];
const proto=o=>{const p=Object.getPrototypeOf(o);prototypes.push([o,p]);return p;};
const desc=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);descriptors.push([o,k,d]);return d;};
const absent=(o,k)=>{if(desc(o,k)!==undefined)bad();};
const nativeMethod=(o,k)=>{const d=desc(o,k);if(!d||!Object.hasOwn(d,""value"")||typeof d.value!==""function""||!d.writable||!d.configurable||d.enumerable)bad();return d.value;};
const project=object(own(globalThis,""PROJECT""));if(this!==project)bad();
named(project,""Lg"");const lp=proto(project);named(lp,""Gd"");const gp=proto(lp);if(proto(gp)!==Object.prototype)bad();
for(const key of [""isReadOnly"",""isV2Format"",""canWsPublish""])absent(project,key);
absent(lp,""isReadOnly"");absent(lp,""isV2Format"");
const format=desc(gp,""isV2Format"");if(!format||Object.hasOwn(format,""value"")||typeof format.get!==""function""||typeof format.set!==""function""||!format.configurable||format.enumerable)bad();
const bus=object(own(project,""workerBus""));named(bus,""JP"");const jp=proto(bus);named(jp,""KP"");const kp=proto(jp);named(kp,""Mb"");const mp=proto(kp);if(proto(mp)!==Object.prototype)bad();
for(const key of [""publish"",""broadcastPublish"",""post"",""onMessage"",""onReceivedPublish""])absent(bus,key);
absent(jp,""publish"");absent(jp,""onReceivedPublish"");
const methods=[nativeMethod(gp,""isReadOnly""),format.get,nativeMethod(lp,""canWsPublish""),nativeMethod(kp,""publish""),nativeMethod(jp,""broadcastPublish""),nativeMethod(jp,""post""),nativeMethod(jp,""onMessage""),nativeMethod(kp,""onReceivedPublish"")];
const recheck=()=>{verify();for(const [o,p]of prototypes)if(Object.getPrototypeOf(o)!==p)bad();for(const [o,k,d]of descriptors){const n=Object.getOwnPropertyDescriptor(o,k);if(!d){if(n!==undefined)bad();continue;}if(!n||n.enumerable!==d.enumerable||n.configurable!==d.configurable||Object.hasOwn(n,""value"")!==Object.hasOwn(d,""value"")||n.value!==d.value||n.writable!==d.writable||n.get!==d.get||n.set!==d.set)bad();}};

if(arraySize(originalMethods)!==8)bad();for(let i=0;i<8;i++)if(own(originalMethods,String(i))!==methods[i])bad();
const captured=object(own(gateScope,""object"")),privateMode=flag(own(captured,""jr""));
const syncDescriptor=desc(project,""isSyncing"");let syncing;
if(syncDescriptor===undefined){for(let p=proto(project),n=0;p!==null;p=proto(p)){if(++n>8)bad();absent(p,""isSyncing"");}syncing={state:""absent"",value:null};}
else{const value=own(project,""isSyncing"");syncing=value===undefined?{state:""undefined"",value:null}:{state:""boolean"",value:flag(value)};}
const isTemporary=flag(own(project,""isTemporary"")),isHistoryBack=flag(own(project,""isHistoryBack"")),isV2Format=flag(own(project,""_isV2Format"")),isReady=flag(own(project,""isReady""));
const isReadOnly=isTemporary||isHistoryBack||isV2Format,syncingTrue=syncing.value===true;
const state={schema:""easyeda-pro-control.pcb-string-worker-gates.v1"",
identity:{projectUuid:id(own(project,""uuid""),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),branchUuid:id(own(project,""_branchUuid""),/^[a-f0-9]{32}$/),windowTabId:id(own(globalThis,""_TAB_ID_""),/^[A-Za-z0-9_-]{1,128}$/)},
raw:{isTemporary,isHistoryBack,isV2Format,isReady,isSyncing:syncing,privateMode},
predicates:{isReadOnly,canWsPublish:privateMode&&isReady&&!isReadOnly&&!syncingTrue,cooperationCallbackGateOpen:!isReadOnly,structureCallbackStateGateOpen:isReady&&!isReadOnly&&!syncingTrue},
privateModeSource:""jr=L1.IS_PRIVATE"",gateMethodReferencesMatched:true,
publisher:{senderUuid:id(own(bus,""uuid""),/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/),methodChainReferencesMatched:true,nativeChannelVerified:false,nativeOnMessageReceiverVerified:false,completePublishersVerified:false},
hiddenCallbackReceiversVerified:false,writeDestinationsContained:false,atomicSample:false};recheck();return JSON.stringify(state);}";
  const string WorkerProducerProgram7=@"function(originalFunction){
""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};

const fn=v=>{if(typeof v!==""function"")bad();return v;};
const scope=o=>object(own(o,""object""));
const nullable=v=>v===null?""null"":(object(v),""present"");
const timer=v=>{if(v===null)return ""null"";if(v===undefined)return ""undefined"";if(typeof v!==""number""||!Number.isSafeInteger(v)||Object.is(v,-0)||v<1)bad();return ""present"";};
const promise=v=>{if(v===null)return ""null"";object(v);if(Object.getPrototypeOf(v)!==Promise.prototype)bad();return ""present"";};
const resolver=v=>v===null?""null"":(fn(v),""present"");
const project=object(own(globalThis,""PROJECT""));named(project,""Lg"");
const lp=Object.getPrototypeOf(project);named(lp,""Gd"");
if(Object.getPrototypeOf(Object.getPrototypeOf(lp))!==Object.prototype)bad();
const identity={projectUuid:id(own(project,""uuid""),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),
branchUuid:id(own(project,""_branchUuid""),/^[a-f0-9]{32}$/),windowTabId:id(own(globalThis,""_TAB_ID_""),/^[A-Za-z0-9_-]{1,128}$/)};

if(own(project,""uploadStructure"")!==originalFunction)bad();const s=scope(this),last=own(s,""r"");fn(own(s,""e""));
const state={schema:""easyeda-pro-control.pcb-string-serial-closure.v1"",identity,kind:""uploadStructure"",
inFlight:promise(own(s,""t"")),queued:promise(own(s,""s"")),lastArguments:last===undefined?null:arraySize(last)};
verify();return JSON.stringify(state);}";
  const string WorkerProducerProgram8=@"function(originalFunction){
""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};

const fn=v=>{if(typeof v!==""function"")bad();return v;};
const scope=o=>object(own(o,""object""));
const nullable=v=>v===null?""null"":(object(v),""present"");
const timer=v=>{if(v===null)return ""null"";if(v===undefined)return ""undefined"";if(typeof v!==""number""||!Number.isSafeInteger(v)||Object.is(v,-0)||v<1)bad();return ""present"";};
const promise=v=>{if(v===null)return ""null"";object(v);if(Object.getPrototypeOf(v)!==Promise.prototype)bad();return ""present"";};
const resolver=v=>v===null?""null"":(fn(v),""present"");
const project=object(own(globalThis,""PROJECT""));named(project,""Lg"");
const lp=Object.getPrototypeOf(project);named(lp,""Gd"");
if(Object.getPrototypeOf(Object.getPrototypeOf(lp))!==Object.prototype)bad();
const identity={projectUuid:id(own(project,""uuid""),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),
branchUuid:id(own(project,""_branchUuid""),/^[a-f0-9]{32}$/),windowTabId:id(own(globalThis,""_TAB_ID_""),/^[A-Za-z0-9_-]{1,128}$/)};

if(own(project,""structure"")!==originalFunction)bad();const s=scope(this),last=own(s,""r"");fn(own(s,""e""));
const state={schema:""easyeda-pro-control.pcb-string-serial-closure.v1"",identity,kind:""structure"",
inFlight:promise(own(s,""t"")),queued:promise(own(s,""s"")),lastArguments:last===undefined?null:arraySize(last)};
verify();return JSON.stringify(state);}";
  const string WorkerProducerProgram9=@"function(originalStructure){
""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};

const fn=v=>{if(typeof v!==""function"")bad();return v;};
const scope=o=>object(own(o,""object""));
const nullable=v=>v===null?""null"":(object(v),""present"");
const timer=v=>{if(v===null)return ""null"";if(v===undefined)return ""undefined"";if(typeof v!==""number""||!Number.isSafeInteger(v)||Object.is(v,-0)||v<1)bad();return ""present"";};
const promise=v=>{if(v===null)return ""null"";object(v);if(Object.getPrototypeOf(v)!==Promise.prototype)bad();return ""present"";};
const resolver=v=>v===null?""null"":(fn(v),""present"");
const project=object(own(globalThis,""PROJECT""));named(project,""Lg"");
const lp=Object.getPrototypeOf(project);named(lp,""Gd"");
if(Object.getPrototypeOf(Object.getPrototypeOf(lp))!==Object.prototype)bad();
const identity={projectUuid:id(own(project,""uuid""),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),
branchUuid:id(own(project,""_branchUuid""),/^[a-f0-9]{32}$/),windowTabId:id(own(globalThis,""_TAB_ID_""),/^[A-Za-z0-9_-]{1,128}$/)};

if(own(project,""structure"")!==originalStructure)bad();const original=fn(own(scope(this),""e""));verify();return original;}";
  const string WorkerProducerProgram10=@"function(parameters,serialScope,originalStructure,originalDebounce){
""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};

const fn=v=>{if(typeof v!==""function"")bad();return v;};
const scope=o=>object(own(o,""object""));
const nullable=v=>v===null?""null"":(object(v),""present"");
const timer=v=>{if(v===null)return ""null"";if(v===undefined)return ""undefined"";if(typeof v!==""number""||!Number.isSafeInteger(v)||Object.is(v,-0)||v<1)bad();return ""present"";};
const promise=v=>{if(v===null)return ""null"";object(v);if(Object.getPrototypeOf(v)!==Promise.prototype)bad();return ""present"";};
const resolver=v=>v===null?""null"":(fn(v),""present"");
const project=object(own(globalThis,""PROJECT""));named(project,""Lg"");
const lp=Object.getPrototypeOf(project);named(lp,""Gd"");
if(Object.getPrototypeOf(Object.getPrototypeOf(lp))!==Object.prototype)bad();
const identity={projectUuid:id(own(project,""uuid""),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),
branchUuid:id(own(project,""_branchUuid""),/^[a-f0-9]{32}$/),windowTabId:id(own(globalThis,""_TAB_ID_""),/^[A-Za-z0-9_-]{1,128}$/)};

if(own(project,""structure"")!==originalStructure||own(scope(serialScope),""e"")!==originalDebounce)bad();
const s=scope(this),p=scope(parameters);fn(own(p,""e""));
if(own(p,""t"")!==300||own(p,""s"")!==false)bad();
const state={schema:""easyeda-pro-control.pcb-string-debounce-closure.v1"",identity,
timer:timer(own(s,""r"")),resolver:resolver(own(s,""i"")),delay:300,leading:false};
verify();return JSON.stringify(state);}";
  const string WorkerProducerProgram11=@"function(originalFunction){
""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};

const fn=v=>{if(typeof v!==""function"")bad();return v;};
const scope=o=>object(own(o,""object""));
const nullable=v=>v===null?""null"":(object(v),""present"");
const timer=v=>{if(v===null)return ""null"";if(v===undefined)return ""undefined"";if(typeof v!==""number""||!Number.isSafeInteger(v)||Object.is(v,-0)||v<1)bad();return ""present"";};
const promise=v=>{if(v===null)return ""null"";object(v);if(Object.getPrototypeOf(v)!==Promise.prototype)bad();return ""present"";};
const resolver=v=>v===null?""null"":(fn(v),""present"");
const project=object(own(globalThis,""PROJECT""));named(project,""Lg"");
const lp=Object.getPrototypeOf(project);named(lp,""Gd"");
if(Object.getPrototypeOf(Object.getPrototypeOf(lp))!==Object.prototype)bad();
const identity={projectUuid:id(own(project,""uuid""),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),
branchUuid:id(own(project,""_branchUuid""),/^[a-f0-9]{32}$/),windowTabId:id(own(globalThis,""_TAB_ID_""),/^[A-Za-z0-9_-]{1,128}$/)};

if(own(project,""bufferedPendDataStream"")!==originalFunction)bad();const s=scope(this);fn(own(s,""e""));
if(own(s,""t"")!==10)bad();const state={schema:""easyeda-pro-control.pcb-string-cooperation-closure.v1"",identity,
batchCount:arraySize(own(s,""s"")),outerTimer:timer(own(s,""r"")),innerTimer:timer(own(s,""i"")),delay:10};
verify();return JSON.stringify(state);}";
  const string WorkerProducerProgram12=@"function(originalFunction){
""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};

const fn=v=>{if(typeof v!==""function"")bad();return v;};
const scope=o=>object(own(o,""object""));
const nullable=v=>v===null?""null"":(object(v),""present"");
const timer=v=>{if(v===null)return ""null"";if(v===undefined)return ""undefined"";if(typeof v!==""number""||!Number.isSafeInteger(v)||Object.is(v,-0)||v<1)bad();return ""present"";};
const promise=v=>{if(v===null)return ""null"";object(v);if(Object.getPrototypeOf(v)!==Promise.prototype)bad();return ""present"";};
const resolver=v=>v===null?""null"":(fn(v),""present"");
const project=object(own(globalThis,""PROJECT""));named(project,""Lg"");
const lp=Object.getPrototypeOf(project);named(lp,""Gd"");
if(Object.getPrototypeOf(Object.getPrototypeOf(lp))!==Object.prototype)bad();
const identity={projectUuid:id(own(project,""uuid""),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),
branchUuid:id(own(project,""_branchUuid""),/^[a-f0-9]{32}$/),windowTabId:id(own(globalThis,""_TAB_ID_""),/^[A-Za-z0-9_-]{1,128}$/)};

if(own(project,""bufferedUploadCloud"")!==originalFunction)bad();const s=scope(this);
if(own(s,""a"")!==project||own(s,""s"")!==500)bad();fn(own(s,""t""));fn(own(s,""o""));fn(own(s,""c""));
const state={schema:""easyeda-pro-control.pcb-string-upload-closure.v1"",identity,
timer:timer(own(s,""r"")),promise:promise(own(s,""i"")),resolver:resolver(own(s,""n"")),delay:500};
verify();return JSON.stringify(state);}";
  const string WorkerProducerProgram13=@"function(originalWrapper){
""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};

const fn=v=>{if(typeof v!==""function"")bad();return v;};
const scope=o=>object(own(o,""object""));
const project=object(own(globalThis,""PROJECT""));named(project,""Lg"");
const lp=Object.getPrototypeOf(project);named(lp,""Gd"");
if(Object.getPrototypeOf(Object.getPrototypeOf(lp))!==Object.prototype)bad();

if(own(project,""uploadStructure"")!==originalWrapper)bad();
const selected=fn(own(scope(this),""e""));verify();return selected;}";
  const string WorkerProducerProgram14=@"function(originalWrapper,serialScope,originalDebounce){
""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};

const fn=v=>{if(typeof v!==""function"")bad();return v;};
const scope=o=>object(own(o,""object""));
const project=object(own(globalThis,""PROJECT""));named(project,""Lg"");
const lp=Object.getPrototypeOf(project);named(lp,""Gd"");
if(Object.getPrototypeOf(Object.getPrototypeOf(lp))!==Object.prototype)bad();

if(own(project,""structure"")!==originalWrapper||own(scope(serialScope),""e"")!==originalDebounce)bad();
const s=scope(this);if(own(s,""t"")!==300||own(s,""s"")!==false)bad();
const selected=fn(own(s,""e""));verify();return selected;}";
  const string WorkerProducerProgram15=@"function(originalWrapper){
""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};

const fn=v=>{if(typeof v!==""function"")bad();return v;};
const scope=o=>object(own(o,""object""));
const project=object(own(globalThis,""PROJECT""));named(project,""Lg"");
const lp=Object.getPrototypeOf(project);named(lp,""Gd"");
if(Object.getPrototypeOf(Object.getPrototypeOf(lp))!==Object.prototype)bad();

if(own(project,""bufferedPendDataStream"")!==originalWrapper)bad();
const selected=fn(own(scope(this),""e""));verify();return selected;}";
  const string WorkerProducerProgram16=@"function(originalWrapper){
""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};

const fn=v=>{if(typeof v!==""function"")bad();return v;};
const scope=o=>object(own(o,""object""));
const project=object(own(globalThis,""PROJECT""));named(project,""Lg"");
const lp=Object.getPrototypeOf(project);named(lp,""Gd"");
if(Object.getPrototypeOf(Object.getPrototypeOf(lp))!==Object.prototype)bad();

if(own(project,""bufferedUploadCloud"")!==originalWrapper)bad();
const s=scope(this);if(own(s,""a"")!==project||own(s,""s"")!==500)bad();
const selected=fn(own(s,""t""));verify();return selected;}";
  const string WorkerProducerProgram17=@"function(originalWrapper){
""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};

const fn=v=>{if(typeof v!==""function"")bad();return v;};
const scope=o=>object(own(o,""object""));
const project=object(own(globalThis,""PROJECT""));named(project,""Lg"");
const lp=Object.getPrototypeOf(project);named(lp,""Gd"");
if(Object.getPrototypeOf(Object.getPrototypeOf(lp))!==Object.prototype)bad();

if(own(project,""bufferedUploadCloud"")!==originalWrapper)bad();
const s=scope(this);if(own(s,""a"")!==project||own(s,""s"")!==500)bad();
const selected=fn(own(s,""o""));verify();return selected;}";
  const string WorkerProducerProgram18=@"function(originalWrapper){
""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};

const fn=v=>{if(typeof v!==""function"")bad();return v;};
const scope=o=>object(own(o,""object""));
const project=object(own(globalThis,""PROJECT""));named(project,""Lg"");
const lp=Object.getPrototypeOf(project);named(lp,""Gd"");
if(Object.getPrototypeOf(Object.getPrototypeOf(lp))!==Object.prototype)bad();

if(own(project,""bufferedUploadCloud"")!==originalWrapper)bad();
const s=scope(this);if(own(s,""a"")!==project||own(s,""s"")!==500)bad();
const selected=fn(own(s,""c""));verify();return selected;}";
  const string WorkerProducerProgram19=@"function(originalWrapper,bufferScope,drainScope,originalUpload,originalBuffer,originalDrain){
""use strict"";
const bad=()=>{throw new Error(""PCB_STRING_OBSERVATION_STATE"");};
const retained=[],collections=[];
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};
const marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return ""absent"";}const v=own(o,k);return v===undefined?""undefined"":v===null?""null"":""present"";};
const count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const id=(v,re)=>{if(typeof v!==""string""||v.length>128||!re.test(v))bad();return v;};
const keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==""string""))bad();return k;};
const emptyObject=o=>{if(keys(o).length!==0)bad();return [];};
const size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};
const emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};
const emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};
const arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,""length"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==""length"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,""constructor"");if(typeof c!==""function""||own(c,""name"")!==name||own(c,""prototype"")!==p)bad();return o;};
const verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,""value"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};

const fn=v=>{if(typeof v!==""function"")bad();return v;};
const scope=o=>object(own(o,""object""));
const project=object(own(globalThis,""PROJECT""));named(project,""Lg"");
const lp=Object.getPrototypeOf(project);named(lp,""Gd"");
if(Object.getPrototypeOf(Object.getPrototypeOf(lp))!==Object.prototype)bad();

if(own(project,""bufferedUploadCloud"")!==originalWrapper)bad();
fn(originalUpload);fn(originalBuffer);fn(originalDrain);
const environments=[scope(this),scope(bufferScope),scope(drainScope)];
const first=environments[0];
for(const s of environments){
if(own(s,""a"")!==project||own(s,""t"")!==originalUpload||own(s,""o"")!==originalBuffer||own(s,""c"")!==originalDrain||own(s,""s"")!==500)bad();
for(const key of [""r"",""i"",""n""]){if(!Object.is(own(s,key),own(first,key)))bad();}}
const timer=own(first,""r""),promise=own(first,""i""),resolver=own(first,""n"");
if(timer!==null&&(typeof timer!==""number""||!Number.isSafeInteger(timer)||Object.is(timer,-0)||timer<1))bad();
if(promise!==null&&(object(promise),Object.getPrototypeOf(promise)!==Promise.prototype))bad();
if(resolver!==null)fn(resolver);
const state={schema:""easyeda-pro-control.pcb-string-buffered-callback-environment.v1"",
identity:{projectUuid:id(own(project,""uuid""),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),
branchUuid:id(own(project,""_branchUuid""),/^[a-f0-9]{32}$/),windowTabId:id(own(globalThis,""_TAB_ID_""),/^[A-Za-z0-9_-]{1,128}$/)},
retainedProjectReferenceMatched:true,callbackReferencesMatched:true,scalarSnapshotsMatched:true,
timer:timer===null?""null"":""present"",promise:promise===null?""null"":""present"",resolver:resolver===null?""null"":""present"",
uploadLexicalReceiverVerified:false,atomicSample:false};verify();return JSON.stringify(state);}";
  static readonly string[] WorkerProducerSequence={"project","gate-select","properties","properties","properties","properties","properties","properties","properties","properties","properties","properties","properties","gates","upload-structure-select","properties","properties","upload-structure","upload-structure-callback","properties","structure-select","properties","properties","structure","properties","properties","debounce-select","properties","properties","debounce","structure-callback","properties","cooperation-select","properties","properties","cooperation","cooperation-callback","properties","upload-select","properties","properties","upload","properties","properties","upload-callback","properties","buffer-callback","properties","drain-callback","properties","properties","properties","properties","properties","properties","properties","buffered-environment","release"};
  static string WorkerProducerProgram(string phase) { switch(phase) {
    case "project": return WorkerProducerProgram0;
    case "upload-structure-select": return WorkerProducerProgram1;
    case "structure-select": return WorkerProducerProgram2;
    case "cooperation-select": return WorkerProducerProgram3;
    case "upload-select": return WorkerProducerProgram4;
    case "gate-select": return WorkerProducerProgram5;
    case "gates": return WorkerProducerProgram6;
    case "upload-structure": return WorkerProducerProgram7;
    case "structure": return WorkerProducerProgram8;
    case "debounce-select": return WorkerProducerProgram9;
    case "debounce": return WorkerProducerProgram10;
    case "cooperation": return WorkerProducerProgram11;
    case "upload": return WorkerProducerProgram12;
    case "upload-structure-callback": return WorkerProducerProgram13;
    case "structure-callback": return WorkerProducerProgram14;
    case "cooperation-callback": return WorkerProducerProgram15;
    case "upload-callback": return WorkerProducerProgram16;
    case "buffer-callback": return WorkerProducerProgram17;
    case "drain-callback": return WorkerProducerProgram18;
    case "buffered-environment": return WorkerProducerProgram19;
    default: throw Error("worker-producer-program");
  }}
  public static int WorkerProducerArgumentCount(string phase) { switch(phase) {
    case "project": return -1;
    case "upload-structure-select": return -1;
    case "structure-select": return -1;
    case "cooperation-select": return -1;
    case "upload-select": return -1;
    case "gate-select": return 0;
    case "gates": return 2;
    case "upload-structure": return 1;
    case "structure": return 1;
    case "debounce-select": return 1;
    case "debounce": return 4;
    case "cooperation": return 1;
    case "upload": return 1;
    case "upload-structure-callback": return 1;
    case "structure-callback": return 3;
    case "cooperation-callback": return 1;
    case "upload-callback": return 1;
    case "buffer-callback": return 1;
    case "drain-callback": return 1;
    case "buffered-environment": return 6;
    case "properties": return -2;
    case "release": return -3;
    default: throw Error("worker-producer-phase");
  }}
  static bool WorkerProducerReturnValue(string phase) { switch(phase) {
    case "gates": return true;
    case "upload-structure": return true;
    case "structure": return true;
    case "debounce": return true;
    case "cooperation": return true;
    case "upload": return true;
    case "buffered-environment": return true;
    default: return false;
  }}
  static void VerifyWorkerProducerProtocolSmoke() {
    string[] programs={WorkerProducerProgram0,WorkerProducerProgram1,WorkerProducerProgram2,WorkerProducerProgram3,WorkerProducerProgram4,WorkerProducerProgram5,WorkerProducerProgram6,WorkerProducerProgram7,WorkerProducerProgram8,WorkerProducerProgram9,WorkerProducerProgram10,WorkerProducerProgram11,WorkerProducerProgram12,WorkerProducerProgram13,WorkerProducerProgram14,WorkerProducerProgram15,WorkerProducerProgram16,WorkerProducerProgram17,WorkerProducerProgram18,WorkerProducerProgram19};
    int[] lengths={2711,3487,3481,3494,3491,4477,6305,3794,3782,3551,3879,3784,3822,2925,3053,2932,2988,2988,2988,4255};
    string[] digests={"45728f3c4f2330179b6f5f1e0cf3dd1192f4a539bd4c417a0bd206c056e1ab76","76d8ce1375d17e1ea6c18a41e034ee6be643fc04ff7880d46eb6f514785da311","97b75664f5cdb9152f1bbaf9789cd728f54a95f2069dc288871878e9956102e6","d4727170db18143108ea70a1df7460f7b8b548d6a2c4c49b501370ea0a61d1c9","d8cb4e2f1e58b4394c87d00534376c9783bf0393dc17cca547e4d2565e12338a","5f2956d03f69cb4e1fb8c6077464e55c3939ab9b74e54af6e4bdf9adf1448424","d5ad3ae0eb7d9d34abc93a616bbd02c569550c6d7317b61bebfe7fe3dddc6b4e","01b51a3da3d2c0ad96071d0ec12dbfb458c282edcf919e79adfeeb4af4c75b15","3024897195a1123120888215abc8ef45eaf942a3795857ff8b7e89f53e26e8f9","bff9c640db4291b0c2890c7dfa485a2d082a30784d2bb6cb6d7574017a673d72","603600050abc6457cde49dda730844fc303536589b8ddc008cccf3aa3547afc3","6c166c6d39ac6c66b35dc273b3cddc886f67e0177d75875526704b51dae3df02","fcc7eb8a838071622e4175cd7c4762b22a3dcb9a2f96a284375cce67bb07e3bb","5891d1916296026e862ec92b4dcc7c9492025001ff690f78fe9d0002f926660a","2c38231557d4cb10a0064a2c9c6650a7b04b7e8aff9aa0077990bd7351ecb51d","4461a2c194421a6f7adfc6e035cc94617281ea88bb316515303dce83e0660dd0","2e56a96103b58e6d1136b6a873fca4ee89a471234220acf83b41f51de081a23a","46a3ea5ed12a5c9784e65e05a11bb55940b7e38abeef1d55f9295f6403515ef2","ec794eb2f340d327ca30c8a9db0ebf6dc2982460799e1e2a333fbca7f7c31a44","b6a43372fedb546c753ca4cc25e053600ce8dd7359fc8b33dcd41494a0c3b8a9"};
    for(int index=0;index<programs.Length;index++) using(SHA256 hash=SHA256.Create()) {
      byte[] bytes=new UTF8Encoding(false,true).GetBytes(programs[index]);
      if(bytes.Length!=lengths[index] || BitConverter.ToString(hash.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()!=digests[index]) throw Error("worker-producer-program-smoke");
    }
    if(WorkerProducerSequence.Length!=58) throw Error("worker-producer-sequence-smoke");
    foreach(string phase in WorkerProducerSequence) {
      int count=WorkerProducerArgumentCount(phase);
      object[] args=count>=0?new object[count]:null; if(args!=null) for(int index=0;index<count;index++) args[index]="argument"+index;
      string method=count==-1?"Runtime.evaluate":count==-2?"Runtime.getProperties":count==-3?"Runtime.releaseObjectGroup":"Runtime.callFunctionOn";
      object context=count==-1?"original-context":null,scope=count>=0 || count==-2?"original-object":null;
      WorkerProducerProtocolMessage(1,method,"original-worker",phase,context,scope,args,true);
      bool refused=false;try{WorkerProducerProtocolMessage(1,method,"original-worker",phase,context,scope,args,false);}catch(InvalidOperationException){refused=true;}
      if(!refused)throw Error("worker-producer-purpose-smoke");
    }
  }
  // Original worker-producer stage: fixed programs and one retained session.
  // Source/target admission remains in the original owner, not caller fields.
  int workerProducerStep;
  string workerProducerSession,workerProducerContext;
  bool workerProducerReleased;
  public static string WorkerProducerProtocolMessage(int id,string method,string sessionId,string phase,
    object suppliedContext,object suppliedObject,object[] suppliedArguments,bool stringPurpose) {
    string context=OptionalText(suppliedContext),scope=OptionalText(suppliedObject);
    Func<string,bool> handle=value=>value!=null && System.Text.RegularExpressions.Regex.IsMatch(value,@"\A[A-Za-z0-9_.:-]{1,256}\z");
    if(!stringPurpose || id<1 || id>225 || !handle(sessionId) || sessionId.Length>128) throw Error("worker-producer-fields");
    int count=WorkerProducerArgumentCount(phase);
    const string effects="\"throwOnSideEffect\":true,\"silent\":true,\"awaitPromise\":false,\"generatePreview\":false,\"userGesture\":false";
    const string group="easyeda-pro-control-string-worker-producers-v1";
    string parameters;
    if(count==-1) {
      if(method!="Runtime.evaluate" || !handle(context) || scope!=null || suppliedArguments!=null) throw Error("worker-producer-context");
      parameters=effects+",\"expression\":"+JsonString(WorkerProducerProgram(phase))+",\"uniqueContextId\":"+JsonString(context)+
        ",\"objectGroup\":"+JsonString(group)+",\"returnByValue\":false,\"timeout\":1000,\"includeCommandLineAPI\":false,\"allowUnsafeEvalBlockedByCSP\":false";
    } else if(count==-2) {
      if(method!="Runtime.getProperties" || context!=null || !handle(scope) || suppliedArguments!=null) throw Error("worker-producer-properties");
      parameters="\"objectId\":"+JsonString(scope)+",\"ownProperties\":true,\"accessorPropertiesOnly\":false,\"generatePreview\":false";
    } else if(count==-3) {
      if(method!="Runtime.releaseObjectGroup" || context!=null || scope!=null || suppliedArguments!=null) throw Error("worker-producer-release");
      parameters="\"objectGroup\":"+JsonString(group);
    } else {
      if(method!="Runtime.callFunctionOn" || context!=null || !handle(scope) || suppliedArguments==null || suppliedArguments.Length!=count) throw Error("worker-producer-arguments");
      string arguments="[";
      for(int index=0;index<count;index++) {
        string selected=OptionalText(suppliedArguments[index]);if(!handle(selected))throw Error("worker-producer-handle");
        if(index>0)arguments+=",";arguments+="{\"objectId\":"+JsonString(selected)+"}";
      }
      arguments+="]";
      parameters=effects+",\"objectId\":"+JsonString(scope)+",\"functionDeclaration\":"+JsonString(WorkerProducerProgram(phase))+
        ",\"objectGroup\":"+JsonString(group)+",\"returnByValue\":"+(WorkerProducerReturnValue(phase)?"true":"false")+",\"arguments\":"+arguments;
    }
    string message="{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+",\"method\":"+JsonString(method)+",\"params\":{"+
      parameters+"},\"sessionId\":"+JsonString(sessionId)+"}\0";
    if(Encoding.UTF8.GetByteCount(message)>(method=="Runtime.callFunctionOn"?65536:method=="Runtime.evaluate"?8192:1024)) throw Error("worker-producer-size");
    return message;
  }
  public void SendWorkerProducer(int id,string method,string sessionId,string phase,object context,object scope,object[] arguments) {
    string message=WorkerProducerProtocolMessage(id,method,sessionId,phase,context,scope,arguments,stringPrecreate);
    if(workerProducerReleased || workerProducerStep>=58) throw Error("worker-producer-consumed");
    if(workerProducerStep==0) {
      if(phase!="project") throw Error("worker-producer-first");
      workerProducerSession=sessionId;workerProducerContext=OptionalText(context);
    } else if(sessionId!=workerProducerSession) throw Error("worker-producer-session");
    if(phase=="release") {
      if(workerProducerStep==0) throw Error("worker-producer-unstarted");
      workerProducerReleased=true;workerProducerStep=58;
    } else {
      if(phase!=WorkerProducerSequence[workerProducerStep] ||
        (WorkerProducerArgumentCount(phase)==-1 && OptionalText(context)!=workerProducerContext)) throw Error("worker-producer-sequence");
      workerProducerStep++;
    }
    // Consumed before write: a partial write never permits replay or reattach.
    SendMessage(id,message);
  }
  void SendMessage(int id,string message) {
    AssertLive(); if(!launchCompleted || protocolFailed || id!=nextRequest || id>RequestLimit) throw Error("discovery-request");
    byte[] bytes=Encoding.UTF8.GetBytes(message);
    nextRequest++; // A failed write consumes its ID and the entire diagnostic channel.
    try { uint written; Native(WriteFile(parentWrite,bytes,(uint)bytes.Length,out written,IntPtr.Zero)); if(written!=bytes.Length) throw Error("partial-write"); AssertLive(); }
    catch { protocolFailed=true; throw; }
  }
  public string Poll() {
    AssertLive(); if(!launchCompleted || protocolFailed) throw Error("channel-failed");
    try {
      uint available; Native(PeekNamedPipe(parentRead,IntPtr.Zero,0,IntPtr.Zero,out available,IntPtr.Zero));
      if(available==0) return "";
      int count=(int)Math.Min(65536u,available); if(received+count>64*1024*1024) throw Error("receive-budget");
      byte[] bytes=new byte[count]; uint read; Native(ReadFile(parentRead,bytes,(uint)count,out read,IntPtr.Zero));
      if(read==0 || read>count) throw Error("read-size"); received+=checked((int)read); AssertLive(); return Convert.ToBase64String(bytes,0,(int)read);
    } catch { protocolFailed=true; throw; }
  }
  string WindowTitle(IntPtr hwnd) {
    uint pid; GetWindowThreadProcessId(hwnd,out pid);
    if(pid!=rootPid || !IsWindowVisible(hwnd) || !IsWindowEnabled(hwnd) || IsIconic(hwnd) || GetAncestor(hwnd,2)!=hwnd || GetAncestor(hwnd,3)!=hwnd || GetWindow(hwnd,4)!=IntPtr.Zero || (GetWindowLong(hwnd,-20)&0x80)!=0) return null;
    StringBuilder cls=new StringBuilder(256); if(GetClassName(hwnd,cls,256)!=18 || cls.ToString()!="Chrome_WidgetWin_1") return null;
    RECT rect; if(!GetWindowRect(hwnd,out rect) || (long)rect.right-rect.left<320 || (long)rect.bottom-rect.top<200 || (long)rect.right-rect.left>16384 || (long)rect.bottom-rect.top>16384) return null;
    int length=GetWindowTextLength(hwnd); if(length<1 || length>1024) return null;
    StringBuilder title=new StringBuilder(1025); if(GetWindowText(hwnd,title,1025)!=length || title.Length!=length || title.ToString().Trim().Length==0) return null;
    GetWindowThreadProcessId(hwnd,out pid); return pid==rootPid?title.ToString():null;
  }
  public string Window() {
    AssertCleanupLive(); int count=0,owned=0; bool overflow=false; IntPtr selected=IntPtr.Zero; string title=null;
    bool complete=EnumWindows((hwnd,value)=> { uint pid; GetWindowThreadProcessId(hwnd,out pid); if(pid!=rootPid) return true; if(++owned>64) { overflow=true; return false; } string candidate=WindowTitle(hwnd); if(candidate!=null && WindowTitle(hwnd)==candidate) { count++; selected=hwnd; title=candidate; } return true; },IntPtr.Zero);
    AssertCleanupLive(); if(!complete && !overflow) throw Error("window-enumeration");
    if(overflow || count!=1 || WindowTitle(selected)!=title) return null;
    return selected.ToInt64().ToString(CultureInfo.InvariantCulture);
  }
  public void NormalClose(string hwnd) {
    if(closeAttempted) throw Error("close-consumed"); closeAttempted=true;
    long number; if(!long.TryParse(hwnd,NumberStyles.None,CultureInfo.InvariantCulture,out number) || number<=0 || Window()!=hwnd) throw Error("window-mismatch");
    AssertCleanupLive(); Native(PostMessage(new IntPtr(number),16,IntPtr.Zero,IntPtr.Zero));
  }
  public bool Terminated() {
    // An uncertain native call is not absence proof, including on helper EOF.
    if(creationPhase==CreationPhase.Unknown || (creationPhase==CreationPhase.RootRetained && root==IntPtr.Zero)) return false;
    if(root==IntPtr.Zero) return job==IntPtr.Zero || JobCount()==0;
    return RootExited() && JobCount()==0 && RootExited() && JobCount()==0;
  }
  static void Close(ref IntPtr handle) { if(handle!=IntPtr.Zero) { Native(CloseHandle(handle)); handle=IntPtr.Zero; } }
  public void ReleaseUnlaunched() {
    // Only the original helper can prove that its launch entrypoint was never
    // invoked. An empty Job or absent binding alone cannot settle an attempt.
    if(launchAttempted || root!=IntPtr.Zero || rootThread!=IntPtr.Zero || rootPid!=0 || rootCreated!=0 || JobCount()!=0) throw Error("unlaunched-release-refused");
    ReleaseClosed();
  }
  public string NoProcessCreationState() {
    if(released || launchCompleted || (launchAttempted && !launchSettled) ||
       (creationPhase!=CreationPhase.NotEntered && creationPhase!=CreationPhase.ReturnedFalse) ||
       root!=IntPtr.Zero || rootThread!=IntPtr.Zero || rootPid!=0 || rootCreated!=0) throw Error("no-process-proof-refused");
    AssertLimits(); AssertPipes();
    if(JobCount()!=0 || JobCount()!=0) throw Error("no-process-job-not-empty");
    return creationPhase==CreationPhase.NotEntered ? "not-entered" : "returned-false";
  }
  public string ReleaseNoProcess() {
    string state=NoProcessCreationState(); ReleaseClosed(); return state;
  }
  public void ReleaseClosed() {
    if(released) throw Error("release-consumed");
    if(!Terminated()) throw Error("retain-live-owner");
    Close(ref browserRead); Close(ref browserWrite); Close(ref parentRead); Close(ref parentWrite); Close(ref rootThread); Close(ref root); Close(ref job); installation.Release(); released=true;
  }
  public void RetainUntilClosed() {
    if(released) return;
    // EOF/protocol failure is not a request to disconnect or close EasyEDA.
    // Keep native handles until the original process AND complete Job exit.
    for(;;) { try { if(Terminated()) { ReleaseClosed(); return; } } catch { } Thread.Sleep(1000); }
  }
}
'@
$owner=if ($StringPrecreate) {[EasyedaDiagnosticOwner]::CreateStringPrecreate()} else {New-Object EasyedaDiagnosticOwner}
try {
  $owner.Initialize()
  if ($CompileOnly) {
    [EasyedaDiagnosticInstallation]::VerifyLeaseSmoke()
    [EasyedaDiagnosticOwner]::VerifyProtocolSmoke()
    # Exercise the actual PowerShell-to-.NET binder used by Send/SendModel.
    # Direct C# null literals cannot detect PowerShell's string coercion.
    $browser=[EasyedaDiagnosticOwner]::BoundProtocolMessage(1,'Browser.getVersion',$null,$null,$null,$null)
    if ($browser -cne ('{"id":1,"method":"Browser.getVersion"}'+[char]0)) {throw 'pcb-diagnostic-bound-browser'}
    $release=[EasyedaDiagnosticOwner]::BoundModelProtocolMessage(2,'Runtime.releaseObjectGroup','s','release',$null,$null,$null,$null)
    if ($release -cne ('{"id":2,"method":"Runtime.releaseObjectGroup","params":{"objectGroup":"easyeda-pro-control-pcb-model-v1"},"sessionId":"s"}'+[char]0)) {throw 'pcb-diagnostic-bound-release'}
    $wrapper=[EasyedaDiagnosticOwner]::BoundModelProtocolMessage(3,'Runtime.evaluate','s','wrapper','c',$null,$null,$null)
    if ($wrapper.IndexOf('"uniqueContextId":"c"',[StringComparison]::Ordinal) -lt 0) {throw 'pcb-diagnostic-bound-wrapper'}
    foreach ($phase in @('snapshot','pending','raw-strings','root-inventory')) {
      $constructors=if ($phase -ceq 'pending' -or $phase -ceq 'root-inventory') {'constructors'} else {$null}
      $teardrop=if ($phase -ceq 'pending') {'teardrop'} else {$null}
      $arguments='"arguments":[{"objectId":"callback"}'+$(if ($null -ne $constructors) {',{"objectId":"constructors"}'} else {''})+$(if ($null -ne $teardrop) {',{"objectId":"teardrop"}'} else {''})+']'
      $sample=[EasyedaDiagnosticOwner]::BoundModelProtocolMessage(4,'Runtime.callFunctionOn','s',$phase,$null,'scope','callback',$constructors,$teardrop)
      if ($sample.IndexOf('"objectId":"scope"',[StringComparison]::Ordinal) -lt 0 -or
          $sample.IndexOf($arguments,[StringComparison]::Ordinal) -lt 0) {throw 'pcb-diagnostic-bound-snapshot'}
    }
    foreach ($value in @('',7)) {
      $refused=$false
      try {[void][EasyedaDiagnosticOwner]::BoundProtocolMessage(1,'Browser.getVersion',$value,$null,$null,$null)}
      catch {
        $expected=if ($value -is [string]) {'pcb-diagnostic-discovery-fields'} else {'pcb-diagnostic-optional-text-type'}
        if ($_.Exception.InnerException.Message -cne $expected) {throw}
        $refused=$true
      }
      if (-not $refused) {throw 'pcb-diagnostic-bound-extra-field'}
    }
    $refused=$false
    try {[void][EasyedaDiagnosticOwner]::BoundModelProtocolMessage(2,'Runtime.releaseObjectGroup','s','release',$null,'',$null,$null)}
    catch {if ($_.Exception.InnerException.Message -cne 'pcb-diagnostic-model-object') {throw};$refused=$true}
    if (-not $refused) {throw 'pcb-diagnostic-bound-model-extra-field'}
    foreach ($value in @($null,'',7)) {
      $refused=$false
      try {[void][EasyedaDiagnosticOwner]::BoundModelProtocolMessage(4,'Runtime.callFunctionOn','s','pending',$null,'scope','callback',$value,'teardrop')}
      catch {
        $expected=if ($value -is [int]) {'pcb-diagnostic-optional-text-type'} else {'pcb-diagnostic-model-object'}
        if ($_.Exception.InnerException.Message -cne $expected) {throw};$refused=$true
      }
      if (-not $refused) {throw 'pcb-diagnostic-bound-constructor-field'}
    }
    $common=[EasyedaDiagnosticOwner]::CommonBaselineProtocolMessage(7,'Runtime.releaseObjectGroup','s','release',$null,$null,$null,$null)
    if ($common -cne ('{"id":7,"method":"Runtime.releaseObjectGroup","params":{"objectGroup":"easyeda-pro-control-pcb-common-baseline-v2"},"sessionId":"s"}'+[char]0)) {throw 'pcb-diagnostic-bound-common-release'}
    foreach ($phase in @('constructors','presentation','rules','preference','assets','metadata')) {
      $constructors=if ($phase -ceq 'constructors' -or $phase -ceq 'metadata') {$null} else {'constructors'}
      $arguments='"arguments":[{"objectId":"callback"}'+$(if ($null -ne $constructors) {',{"objectId":"constructors"}'} else {''})+']'
      $common=[EasyedaDiagnosticOwner]::CommonBaselineProtocolMessage(8,'Runtime.callFunctionOn','s',$phase,$null,'scope','callback',$constructors)
      if ($common.IndexOf($arguments,[StringComparison]::Ordinal) -lt 0) {throw 'pcb-diagnostic-bound-common-arguments'}
    }
    $teardrop=[EasyedaDiagnosticOwner]::TeardropProtocolMessage(9,'Runtime.callFunctionOn','s','teardrop-callbacks','scope','callback',$null,$null,$null,[bool]$StringPrecreate)
    if ($teardrop.IndexOf('"arguments":[{"objectId":"callback"}]',[StringComparison]::Ordinal) -lt 0) {throw 'pcb-diagnostic-bound-teardrop-selector'}
    $receivers=@('r0','r1','r2','r3','r4','r5');$targets=@('t0','t1','t2','t3','t4','t5')
    $teardrop=[EasyedaDiagnosticOwner]::TeardropProtocolMessage(10,'Runtime.callFunctionOn','s','teardrop-owner','scope','callback','callbacks',$receivers,$targets,[bool]$StringPrecreate)
    $arguments='"arguments":[{"objectId":"callback"},{"objectId":"callbacks"}'
    foreach ($value in @($receivers+$targets)) {$arguments+=',{"objectId":"'+$value+'"}'}
    if ($teardrop.IndexOf($arguments+']',[StringComparison]::Ordinal) -lt 0) {throw 'pcb-diagnostic-bound-teardrop-owner'}
    foreach ($value in @($null,'',7)) {
      $refused=$false
      try {[void][EasyedaDiagnosticOwner]::BoundModelProtocolMessage(11,'Runtime.callFunctionOn','s','pending',$null,'scope','callback','constructors',$value)}
      catch {
        $expected=if ($value -is [int]) {'pcb-diagnostic-optional-text-type'} else {'pcb-diagnostic-model-teardrop'}
        if ($_.Exception.InnerException.Message -cne $expected) {throw};$refused=$true
      }
      if (-not $refused) {throw 'pcb-diagnostic-bound-teardrop-field'}
      $refused=$false
      try {[void][EasyedaDiagnosticOwner]::CommonBaselineProtocolMessage(12,'Runtime.callFunctionOn','s','metadata',$value,'scope','callback',$null)}
      catch {
        $expected=if ($value -is [int]) {'pcb-diagnostic-optional-text-type'} else {'pcb-diagnostic-common-scope'}
        if ($null -eq $value -or $_.Exception.InnerException.Message -cne $expected) {throw};$refused=$true
      }
      if ($refused -eq ($null -eq $value)) {throw 'pcb-diagnostic-bound-common-context'}
    }
    $dom=[EasyedaDiagnosticOwner]::DomProtocolMessage(5,'DOM.getFrameOwner','s','original-frame',$null)
    if ($dom -cne ('{"id":5,"method":"DOM.getFrameOwner","params":{"frameId":"original-frame"},"sessionId":"s"}'+[char]0)) {throw 'pcb-diagnostic-bound-dom-frame'}
    $dom=[EasyedaDiagnosticOwner]::DomProtocolMessage(6,'DOM.describeNode','s',$null,1234)
    if ($dom -cne ('{"id":6,"method":"DOM.describeNode","params":{"backendNodeId":1234,"depth":0,"pierce":false},"sessionId":"s"}'+[char]0)) {throw 'pcb-diagnostic-bound-dom-node'}
    foreach ($value in @(0,'1234')) {
      $refused=$false
      try {[void][EasyedaDiagnosticOwner]::DomProtocolMessage(6,'DOM.describeNode','s',$null,$value)}
      catch {if ($_.Exception.InnerException.Message -cne 'pcb-diagnostic-dom-node') {throw};$refused=$true}
      if (-not $refused) {throw 'pcb-diagnostic-bound-dom-extra-field'}
    }
    if (-not $owner.Terminated()) {throw 'pcb-diagnostic-compile-job-not-empty'}
    $owner.ReleaseUnlaunched()
    @{schema='easyeda-pro-control.pcb-diagnostic-compile.v1';compiled=$true;emptyJob=$true;pipesChecked=$true;processLaunched=$false} | ConvertTo-Json -Compress
    exit
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
      if ([Text.Encoding]::UTF8.GetByteCount($line.ToString()) -gt 32768 -or
          (($request.action -cne 'send' -or $request.method -cne 'Runtime.callFunctionOn') -and $line.Length -gt 4096)) {throw 'pcb-diagnostic-request-size'}
      if ($request.id -isnot [string] -or $request.id -cnotmatch '^[a-f0-9]{32}$') {throw 'pcb-diagnostic-request-id'}
      $id=$request.id
      if ($launched -and $request.action -cne 'identity' -and ($request.helperInstance -isnot [string] -or $request.jobId -isnot [string] -or $request.rootCreated -isnot [string] -or ($request.rootPid -isnot [int] -and $request.rootPid -isnot [long]) -or $request.helperInstance -cne $owner.HelperInstance -or $request.jobId -cne $owner.JobId -or $request.rootCreated -cne $owner.RootCreated -or $request.rootPid -ne $owner.RootPid)) {throw 'pcb-diagnostic-owner-binding'}
      switch -CaseSensitive ($request.action) {
        'launch' {
          if ($request.confirmDiagnosticLaunch -isnot [bool] -or $request.confirmDiagnosticLaunch -ne $true -or $launched) {throw 'pcb-diagnostic-launch-approval'}
          $plan=$request.installation
          if ($null -eq $plan -or (@($plan.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'files,schema' -or $plan.schema -cne 'easyeda-pro-control.pcb-diagnostic-installation.v1' -or $plan.files -isnot [array] -or $plan.files.Count -ne 5) {throw 'pcb-diagnostic-installation-plan'}
          $paths=New-Object 'string[]' 5
          $sizes=New-Object 'long[]' 5
          $hashes=New-Object 'string[]' 5
          for ($i=0;$i -lt 5;$i++) {
            $pin=$plan.files[$i]
            if ($null -eq $pin -or (@($pin.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'bytes,sha256,windowsPath' -or $pin.windowsPath -isnot [string] -or $pin.sha256 -isnot [string] -or ($pin.bytes -isnot [int] -and $pin.bytes -isnot [long])) {throw 'pcb-diagnostic-installation-file'}
            $paths[$i]=$pin.windowsPath; $sizes[$i]=$pin.bytes; $hashes[$i]=$pin.sha256
          }
          $owner.Launch($request.executable,$request.executableSha256,$paths,$sizes,$hashes)
          $launched=$true
          $result=@{helperInstance=$owner.HelperInstance;jobId=$owner.JobId;rootPid=$owner.RootPid;rootCreated=$owner.RootCreated}
        }
        'send' {
          $requestLimit=if ($StringPrecreate) {225} else {103}
          if (-not $launched -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt $requestLimit -or $request.method -isnot [string]) {throw 'pcb-diagnostic-request-id'}
          $fields=@('action','helperInstance','id','jobId','method','requestId','rootCreated','rootPid')
          if ($null -ne $request.workerProducerPhase) {
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
              'presentation' {$fields+=@('objectId','callbackObjectId','constructorObjectId')}
              'rules' {$fields+=@('objectId','callbackObjectId','constructorObjectId')}
              'preference' {$fields+=@('objectId','callbackObjectId','constructorObjectId')}
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
              if ($null -ne $request.pcbOpeningPhase) {$fields+=@('pcbOpeningPhase')} else {$fields+=@('openingPhase')}
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
          if ($null -ne $request.workerProducerPhase) {
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
            if ($null -ne $request.pcbOpeningPhase) {
              $owner.SendPcbOpening([int]$request.requestId,$request.sessionId,$request.uniqueContextId,$request.pcbOpeningPhase,$request.targetRawWindowsPath,$request.targetProjectUuid,$request.targetBranchUuid,$request.targetDocumentUuid,$request.targetExpectedSourceSha256)
            } else {
              $owner.SendOpening([int]$request.requestId,$request.sessionId,$request.uniqueContextId,$request.openingPhase,$request.targetRawWindowsPath,$request.targetProjectUuid,$request.targetBranchUuid,$request.targetDocumentUuid,$request.targetExpectedSourceSha256)
            }
          } else {
            $owner.Send([int]$request.requestId,$request.method,$request.targetId,$request.sessionId,$request.scriptId,$request.uniqueContextId)
          }
          $result=@{written=$true}
        }
        'poll' {if (-not $launched) {throw 'pcb-diagnostic-not-launched'}; $result=@{bytes=$owner.Poll()}}
        'window' {if (-not $launched) {throw 'pcb-diagnostic-not-launched'}; $result=@{hwnd=$owner.Window()}}
        'normal-close' {if (-not $launched -or $request.confirmNormalClose -isnot [bool] -or $request.confirmNormalClose -ne $true) {throw 'pcb-diagnostic-close-approval'}; $owner.NormalClose($request.hwnd); $result=@{closeDispatched=$true;saveOrDiscardSelected=$false}}
        'termination' {$result=@{terminated=$owner.Terminated()}}
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
        default {throw 'pcb-diagnostic-action'}
      }
      @{id=$id;ok=$true;result=$result} | ConvertTo-Json -Depth 5 -Compress
    } catch {
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
      @{id=$id;ok=$false;error=$code} | ConvertTo-Json -Compress
    }
  }
} finally {$owner.RetainUntilClosed()}
