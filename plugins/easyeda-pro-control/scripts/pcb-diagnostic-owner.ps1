param([switch]$CompileOnly)
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
  public readonly string JobId=Guid.NewGuid().ToString("N");
  public readonly string HelperInstance=Guid.NewGuid().ToString("N");
  public uint RootPid { get { return rootPid; } }
  public string RootCreated { get { return rootCreated.ToString(CultureInfo.InvariantCulture); } }
  public uint? CreateProcessError { get { return createProcessError; } }
  static Exception Error(string reason) { return new InvalidOperationException("pcb-diagnostic-"+reason); }
  static void Native(bool value) { if(!value) throw Error("native-call"); }
  public EasyedaDiagnosticOwner() { }
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
let stage=""setup"",code=""EXCEPTION"",dispatchAttempted=false,publicResult=null,prefixObserved=false,expired=false,timer,clear,cleanup,observation=null,outcome;
const bad=(value=""GUARD"")=>{code=value;throw new Error(""PCB_DIAGNOSTIC_OPENING"");};
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
const active=method(tabs,""getActiveTab""),container=method(tabs,""getContainerInfo""),getTab=method(tabs,""getTabById"");
const bus=own(host,""messageBus""),registryCall=method(bus,""rpcCall""),subscribe=method(bus,""subscribe"");
const apiBus=own(host,""extensionApiMessageBus2""),openCall=method(apiBus,""rpcCall"");
const set=own(root,""setTimeout"");clear=own(root,""clearTimeout"");if(typeof set!==""function""||typeof clear!==""function"")bad();
const check=()=>{
 if(expired)bad(""TIMEOUT"");
 if(root.window!==root||root.top!==root||root.location!==location||root.document!==document||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==retainedHref||location?.href!==retainedHref||location?.origin!==""https://client"")bad(""URL"");
 if(parseProjectUrl(retainedHref,target.projectUuid).base!==initialUrl.base)bad(""URL"");
 if(own(root,""PRO_EDITOR_MODE"")!==mode||(mode!==""CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM""&&mode!==""CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM""))bad();
 if(own(root,""UI"")!==ui||own(root,""gVars"")!==host||own(ui,""gVars"")!==host||own(ui,""tabBar"")!==tabs||own(host,""messageBus"")!==bus||own(host,""extensionApiMessageBus2"")!==apiBus||own(root,""_MSG_BUS2_EXTAPI_"")!==apiBus||own(root,""_TAB_ID_"")!==windowTabId||own(root,""setTimeout"")!==set||own(root,""clearTimeout"")!==clear)bad(""BINDING"");
 for(const binding of [active,container,getTab,registryCall,subscribe,openCall])methodCheck(binding);
 if(prefixCheck!==undefined)prefixCheck();
};
const sample=()=>{
 check();const owners=[],project=plain(own(host,""currentProject""));owners.push(project);const pid=own(project,""projectId"",true),branch=own(project,""branchUuid"",true),projectPresent=pid===target.projectUuid;
 if(pid!==undefined&&!projectPresent)bad(""PROJECT"");
 if(projectPresent){if(branch!==target.branchUuid)bad(""BRANCH"");if(own(project,""isV2Format"")!==false)bad(""FORMAT"");}else if(branch!==undefined&&branch!=="""")bad(""BRANCH"");
 if(own(host,""isHistoryMode"")!==false)bad(""HISTORY"");
 const ids=own(tabs,""containerIds""),n=dense(ids,128);if(n===0)bad(""TAB"");owners.push(ids);const names=[],registry=new Set();
 for(let i=0;i<n;i++){const id=text(own(ids,String(i)),256);if(registry.has(id))bad(""TAB"");registry.add(id);names.push(id);}
 const tree=own(tabs,""containerTree""),pending=[{node:tree,depth:0}],seen=new Set(),treeIds=new Set(),leaves=new Set(),treeProjection=[];
 if(own(tabs,""belongContainer"")!==""editor-window-main""||own(tree,""id"")!==""editor-window-main"")bad(""TAB"");
 while(pending.length){const item=pending.pop(),node=plain(item.node);if(item.depth>16||seen.has(node)||seen.size>=255)bad(""TAB"");seen.add(node);owners.push(node);const id=text(own(node,""id""),256),children=own(node,""children"",true);if(treeIds.has(id))bad(""TAB"");treeIds.add(id);treeProjection.push([id,item.depth]);
  if(children===undefined){if(!registry.has(id)||leaves.has(id))bad(""TAB"");leaves.add(id);}else{const count=dense(children,128);if(count===0||pending.length+seen.size+count>255)bad(""TAB"");owners.push(children);for(let i=count-1;i>=0;i--)pending.push({node:own(children,String(i)),depth:item.depth+1});}}
 if(leaves.size!==registry.size)bad(""TAB"");const current=text(own(tabs,""currentTabId""),512,true);if(apply(active.fn,tabs,[])!==current)bad(""TAB"");
 const allIds=new Set(),projection=[],ordinaryIds=[];let count=0,start=0,placeholder=0,currentCount=0;
 for(const id of names){const info=plain(apply(container.fn,tabs,[id]));check();owners.push(info);if(own(info,""id"")!==id||own(info,""belong"")!==""editor-window-main"")bad(""TAB"");const list=own(info,""tabs""),length=dense(list,256);if(count+length>256)bad(""TAB"");count+=length;owners.push(list);const localActive=text(own(info,""activeTabId""),512,true),localIds=new Set(),rows=[];
  for(let i=0;i<length;i++){const tab=plain(own(list,String(i))),id2=text(own(tab,""tabId""),512),data=plain(own(tab,""data""));owners.push(tab,data);if(allIds.has(id2))bad(""TAB"");allIds.add(id2);localIds.add(id2);const type=own(data,""doctype"");
   if(id2===""tab_page1""||id2===""0""){const isStart=id2===""tab_page1"";if(type!==(isStart?-1:0)||own(tab,""isAbleDelete"")!==false||own(tab,""group"")!==""start_blank""||own(tab,""draggable"")!==isStart)bad(""TAB"");const hidden=own(tab,""isDisplayNone"");if(typeof hidden!==""boolean""||(!isStart&&hidden!==true))bad(""TAB"");const declared=own(tab,""documentType"",true);if(declared!==undefined&&declared!==type)bad(""TAB"");for(const key of [""pid"",""owner""])if(own(data,key,true)!==undefined)bad(""TAB"");for(const key of [""parentProjectUuid"",""parentLibraryUuid""])if(own(tab,key,true)!==undefined)bad(""TAB"");if(isStart)start++;else placeholder++;
   }else{if(!projectPresent||own(data,""pid"")!==target.projectUuid||own(tab,""parentLibraryUuid"",true)!==undefined||![1,3,26].includes(type))bad(""TAB"");const parts=/^([a-f0-9]{16}|[a-f0-9]{32})@([a-f0-9]{64})$/.exec(id2);if(!parts||parts[0]!==id2||parts[2]!==target.projectUuid)bad(""TAB"");const parentProject=own(tab,""parentProjectUuid"",true);if(parentProject!==undefined&&parentProject!==target.projectUuid)bad(""TAB"");ordinaryIds.push(id2);}
   if(apply(getTab.fn,tabs,[id2])!==tab)bad(""TAB"");
   if(id2===current){currentCount++;if(localActive!==current)bad(""TAB"");}rows.push([id2,type]);}
  if(localActive!==""""&&!localIds.has(localActive))bad(""TAB"");projection.push([id,localActive,rows]);}
 if(start>1||placeholder>1||(current===""""?currentCount!==0:currentCount!==1))bad(""TAB"");
 if(!projectPresent&&(start!==1||current!==""tab_page1""||count!==start+placeholder))bad(""TAB"");
 const url=parseProjectUrl(retainedHref,target.projectUuid,current);
 if(!url.empty&&!projectPresent||url.tabIds.some(id=>!allIds.has(id)))bad(""URL"");check();
 return{owners,identity:JSON.stringify([names,treeProjection,projection,current,pid??null,branch??null]),public:{projectPresent,branchUuid:projectPresent?branch:null,windowTabId,containerCount:n,tabIds:ordinaryIds,activeTabId:current}};
};
const same=(a,b)=>{if(a.identity!==b.identity||a.owners.length!==b.owners.length||a.owners.some((owner,i)=>owner!==b.owners[i]))bad(""OWNERS"");};
const registration=async()=>{const before=sample();const reply=await apply(registryCall.fn,bus,[""/pro-mgr/api/client/getProjectPaths"",{},0]);check();same(before,sample());plain(reply);const message=plain(own(reply,""message""));if(own(message,""success"")!==true)bad(""REGISTRY"");const result=plain(own(message,""result"")),keys=Reflect.ownKeys(result);if(keys.length>4096||keys.some(key=>!matches(key,/^[a-f0-9]{64}$/)))bad(""REGISTRY"");const selected=plain(own(result,target.projectUuid));if(text(own(selected,""path""),4096)!==target.rawWindowsPath||own(selected,""isCbb"")!==false)bad(""REGISTRY"");return before;};
const run=async()=>{
 stage=""registration-before"";const initial=await registration();check();if(initial.public.projectPresent)bad(""PROJECT"");
 if(phase===""open-project""){
  stage=""subscribe"";let delivered=0,eventFailed=false,eventProject,settle;const event=new Promise(resolve=>{settle=resolve;});
  const advanceUrl=()=>{if(!dispatchAttempted)bad(""PREFIX"");retainedHref=location?.href;check();};
  const receive=(...args)=>{delivered++;try{if(!dispatchAttempted||delivered!==1||args.length!==3||args[0]!==null||args[1]!==undefined||args[2]!==undefined)bad(""PREFIX"");advanceUrl();const observed=sample();if(!observed.public.projectPresent)bad(""PROJECT"");eventProject=own(host,""currentProject"");prefixObserved=true;}catch{eventFailed=true;}settle();};
  const task=apply(subscribe.fn,bus,[""loadProjectCompleted"",receive]),cancel=method(task,""cancel"");
  const listener=()=>{methodCheck(cancel);if(own(task,""callback"")!==receive||own(task,""isRunning"")!==true)bad(""PREFIX"");};
  cleanup=()=>{listener();apply(cancel.fn,task,[]);if(own(task,""callback"")!==null||own(task,""isRunning"")!==false)bad(""CLEANUP"");};
  prefixCheck=()=>{listener();if(eventFailed||delivered>1)bad(""PREFIX"");};
  listener();same(initial,sample());check();if(delivered!==0||eventFailed)bad(""PREFIX"");
  stage=""dispatch"";dispatchAttempted=true;const result=await apply(openCall.fn,apiBus,[""extensionApi.DMT_Project.openProject"",target.projectUuid]);
  stage=""acknowledgement"";advanceUrl();listener();if(typeof result!==""boolean"")bad(""ACK"");publicResult=result;if(!result)bad(""ACK"");
  stage=""prefix"";await event;check();listener();if(delivered!==1||eventFailed||!prefixObserved)bad(""PREFIX"");if(own(host,""currentProject"")!==eventProject)bad(""OWNERS"");
 }
 stage=""registration-after"";const after=await registration();check();stage=""observe"";const final=sample();same(after,final);await Promise.resolve();check();same(final,sample());
 if(final.public.projectPresent!==(phase===""open-project""))bad(""PROJECT"");
 observation=final.public;stage=""output"";return{ok:true,status:phase===""preflight""?""ready"":""opened-prefix-observed"",failure:null};
};
check();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;code=""TIMEOUT"";reject(new Error(""PCB_DIAGNOSTIC_OPENING""));},phase===""preflight""?10000:45000]);});
outcome=await Promise.race([run(),timeout]);
}catch{outcome={ok:false,status:""refused"",failure:{stage,code}};}
finally{
 try{if(cleanup!==undefined)cleanup();}catch{outcome={ok:false,status:""refused"",failure:{stage:""cleanup"",code:""CLEANUP""}};}
 if(timer!==undefined&&typeof clear===""function""){try{Reflect.apply(clear,globalThis,[timer]);}catch{outcome={ok:false,status:""refused"",failure:{stage:""cleanup"",code:""CLEANUP""}};}}
}
return JSON.stringify({schema:""easyeda-pro-control.pcb-diagnostic-opening.v1"",phase,projectUuid:target.projectUuid,branchUuid:target.branchUuid,documentUuid:target.documentUuid,...outcome,dispatchAttempted,publicResult,prefixObserved,nativeWorkMayRemain:dispatchAttempted,observation});
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
  public static string OpeningProtocolMessage(int id,string sessionId,string uniqueContextId,string phase,
    string path,string project,string branch,string document,string source) {
    Func<string,string,bool> matches=(value,pattern)=>value!=null && System.Text.RegularExpressions.Regex.IsMatch(value,pattern);
    if(id<1 || id>64 || !matches(sessionId,@"\A[A-Za-z0-9_.:-]{1,128}\z") || !matches(uniqueContextId,@"\A[A-Za-z0-9_.:-]{1,128}\z") ||
      (phase!="preflight" && phase!="open-project") || path==null || path.Length<12 || path.Length>4096 ||
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
      JsonString(OpeningFunction)+",\"uniqueContextId\":"+JsonString(uniqueContextId)+",\"arguments\":[{\"value\":"+target+"},{\"value\":"+JsonString(phase)+
      "}],\"returnByValue\":true,\"awaitPromise\":true,\"silent\":true,\"generatePreview\":false,\"userGesture\":false,\"throwOnSideEffect\":false},\"sessionId\":"+JsonString(sessionId)+"}\0";
    if(Encoding.UTF8.GetByteCount(message)>65536) throw Error("opening-send-size");
    return message;
  }
  public static string ModelProtocolMessage(int id,string method,string sessionId,string phase,
    string uniqueContextId,string objectId,string callbackObjectId) {
    Func<string,bool> handle=value=>value!=null && System.Text.RegularExpressions.Regex.IsMatch(value,@"\A[A-Za-z0-9_.:-]{1,256}\z");
    if(id<1 || id>64 || !handle(sessionId) || sessionId.Length>128) throw Error("model-fields");
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
      } else if(phase=="snapshot" && method=="Runtime.callFunctionOn") {
        if(!handle(objectId) || !handle(callbackObjectId)) throw Error("model-object");
        parameters=effects+",\"objectId\":"+JsonString(objectId)+",\"functionDeclaration\":"+JsonString(ModelStateFunction)+
          ",\"returnByValue\":true,\"arguments\":[{\"objectId\":"+JsonString(callbackObjectId)+"}]";
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
    if(id<1 || id>64 || (method!="Runtime.evaluate" && uniqueContextId!=null)) throw Error("discovery-fields");
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
    using(SHA256 hash=SHA256.Create()) {
      byte[] source=Encoding.UTF8.GetBytes(WorkerExpression);
      if(source.Length!=3841 || BitConverter.ToString(hash.ComputeHash(source)).Replace("-","").ToLowerInvariant()!="dba64a7237d99363d35b134a7c4c6bfa312259f125fe2f7fb813db47b1ae4e52") throw Error("worker-program");
    }
    string[] programs={OpeningFunction,ModelCallbackExpression,ModelHandlerFunction,ModelStateFunction};
    int[] lengths={14181,2204,1730,7741};
    string[] digests={"3126e3b0b3d19c34c00ce57a261087b0b773c52ed908f5efb9f157c8fc3dbfe4",
      "f1b6e32a10f64af767d6a29a679e0e906625585bc1d5514fef6dce3c2605776e",
      "548c8af51fad2c6c11b47623dc845ed1e8031563756912bc6e16d004a2314591",
      "67d4081399cdc22be17e2e1ddd0be234290092a2c5287f629fc2de9be16b85a5"};
    for(int i=0;i<programs.Length;i++) using(SHA256 hash=SHA256.Create()) {
      byte[] bytes=new UTF8Encoding(false,true).GetBytes(programs[i]);
      if(bytes.Length!=lengths[i] || BitConverter.ToString(hash.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()!=digests[i]) throw Error("fixed-program");
    }
    string syntheticPath=@"C:\synthetic\fixture.eprj2",project;
    using(SHA256 hash=SHA256.Create()) project=BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(syntheticPath))).Replace("-","").ToLowerInvariant();
    foreach(string phase in new string[]{"preflight","open-project"}) {
      string opening=OpeningProtocolMessage(64,"parent","unique",phase,syntheticPath,project,new string('a',32),new string('b',16),new string('c',64));
      if(opening.IndexOf("\"awaitPromise\":true",StringComparison.Ordinal)<0 ||
        opening.IndexOf("\"throwOnSideEffect\":false",StringComparison.Ordinal)<0 ||
        opening.IndexOf("\"functionDeclaration\":",StringComparison.Ordinal)<0) throw Error("opening-flags");
    }
    ModelProtocolMessage(1,"Runtime.evaluate","s","wrapper","c",null,null);
    ModelProtocolMessage(2,"Runtime.getProperties","s","properties",null,"object",null);
    ModelProtocolMessage(3,"Runtime.callFunctionOn","s","handler",null,"object",null);
    ModelProtocolMessage(4,"Runtime.callFunctionOn","s","snapshot",null,"object","callback");
    ModelProtocolMessage(5,"Runtime.releaseObjectGroup","s","release",null,null,null);
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
  public void Send(int id,string method,string targetId,string sessionId,string scriptId,string uniqueContextId) {
    SendMessage(id,ProtocolMessage(id,method,targetId,sessionId,scriptId,uniqueContextId));
  }
  public void SendOpening(int id,string sessionId,string uniqueContextId,string phase,string path,string project,string branch,string document,string source) {
    SendMessage(id,OpeningProtocolMessage(id,sessionId,uniqueContextId,phase,path,project,branch,document,source));
  }
  public void SendModel(int id,string method,string sessionId,string phase,string uniqueContextId,string objectId,string callbackObjectId) {
    SendMessage(id,ModelProtocolMessage(id,method,sessionId,phase,uniqueContextId,objectId,callbackObjectId));
  }
  void SendMessage(int id,string message) {
    AssertLive(); if(!launchCompleted || protocolFailed || id!=nextRequest || id>64) throw Error("discovery-request");
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
$owner=New-Object EasyedaDiagnosticOwner
try {
  $owner.Initialize()
  if ($CompileOnly) {
    [EasyedaDiagnosticInstallation]::VerifyLeaseSmoke()
    [EasyedaDiagnosticOwner]::VerifyProtocolSmoke()
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
          if (-not $launched -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt 64 -or $request.method -isnot [string]) {throw 'pcb-diagnostic-request-id'}
          $fields=@('action','helperInstance','id','jobId','method','requestId','rootCreated','rootPid')
          if ($null -ne $request.modelPhase) {
            $fields+=@('sessionId','modelPhase')
            switch -CaseSensitive ($request.modelPhase) {
              'wrapper' {$fields+=@('uniqueContextId')}
              'properties' {$fields+=@('objectId')}
              'handler' {$fields+=@('objectId')}
              'snapshot' {$fields+=@('objectId','callbackObjectId')}
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
            'Runtime.callFunctionOn' {$fields+=@('sessionId','uniqueContextId','openingPhase','targetRawWindowsPath','targetProjectUuid','targetBranchUuid','targetDocumentUuid','targetExpectedSourceSha256')}
            'Debugger.enable' {$fields+=@('sessionId')}
            'Debugger.getScriptSource' {$fields+=@('sessionId','scriptId')}
            default {throw 'pcb-diagnostic-session-method'}
          }}
          if ((@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne (@($fields | Sort-Object) -join ',')) {throw 'pcb-diagnostic-request-fields'}
          foreach ($field in @('targetId','sessionId','scriptId','uniqueContextId','openingPhase','targetRawWindowsPath','targetProjectUuid','targetBranchUuid','targetDocumentUuid','targetExpectedSourceSha256','modelPhase','objectId','callbackObjectId')) {if ($null -ne $request.$field -and $request.$field -isnot [string]) {throw 'pcb-diagnostic-request-field'}}
          if ($null -ne $request.modelPhase) {
            $owner.SendModel([int]$request.requestId,$request.method,$request.sessionId,$request.modelPhase,$request.uniqueContextId,$request.objectId,$request.callbackObjectId)
          } elseif ($request.method -ceq 'Runtime.callFunctionOn') {
            $owner.SendOpening([int]$request.requestId,$request.sessionId,$request.uniqueContextId,$request.openingPhase,$request.targetRawWindowsPath,$request.targetProjectUuid,$request.targetBranchUuid,$request.targetDocumentUuid,$request.targetExpectedSourceSha256)
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
