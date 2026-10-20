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
    foreach(Lease lease in leases) if(lease.Path==Executable) ExecutableNativePath=lease.GuidPath;
    Need(ExecutableNativePath!=null,"executable-lease"); admitted=true; AssertCurrent();
  }
  public void AssertCurrent() {
    Need(admitted && !released,"not-admitted");
    foreach(Lease lease in leases) { Same(lease.Before,Facts(lease),lease.Directory); Need(Mapping(lease.Path)==lease.Mapping,"mapping-drift"); }
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
      Need(refused,"smoke-invalid-path");
    }
    string directory=Path.Combine(Path.GetTempPath(),"easyeda-native-lease-"+Guid.NewGuid().ToString("N"));
    Need(!Directory.Exists(directory),"smoke-directory"); Directory.CreateDirectory(directory);
    string file=Path.Combine(directory,"synthetic.bin");
    EasyedaDiagnosticInstallation owner=new EasyedaDiagnosticInstallation();
    try {
      byte[] bytes=Encoding.UTF8.GetBytes("Synthetic native lease test. No application launch.");
      using(FileStream output=new FileStream(file,FileMode.CreateNew,FileAccess.Write,FileShare.None)) output.Write(bytes,0,bytes.Length);
      string hash; using(SHA256 digest=SHA256.Create()) hash=BitConverter.ToString(digest.ComputeHash(bytes)).Replace("-","").ToLowerInvariant();
      owner.Pin(file,bytes.Length,hash); owner.admitted=true; owner.AssertCurrent();
      string peer=Path.Combine(directory,"peer.bin");
      using(FileStream output=new FileStream(peer,FileMode.CreateNew,FileAccess.Write,FileShare.None)) output.WriteByte(1);
      File.Delete(peer); // Holding the parent must not forbid ordinary children.
      bool writeRefused=false,renameRefused=false;
      try { using(FileStream writer=new FileStream(file,FileMode.Open,FileAccess.Write,FileShare.ReadWrite)) { } } catch(IOException) { writeRefused=true; }
      try { Directory.Move(directory,directory+"-moved"); } catch(IOException) { renameRefused=true; }
      Need(writeRefused && renameRefused,"smoke-sharing"); owner.AssertCurrent();
    } finally {
      owner.Release();
      if(File.Exists(file)) File.Delete(file);
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
  CreationPhase creationPhase; bool launchSettled;
  readonly EasyedaDiagnosticInstallation installation=new EasyedaDiagnosticInstallation();
  public readonly string JobId=Guid.NewGuid().ToString("N");
  public readonly string HelperInstance=Guid.NewGuid().ToString("N");
  public uint RootPid { get { return rootPid; } }
  public string RootCreated { get { return rootCreated.ToString(CultureInfo.InvariantCulture); } }
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
      IntPtr size=IntPtr.Zero; InitializeProcThreadAttributeList(IntPtr.Zero,2,0,ref size); if(size==IntPtr.Zero) throw Error("attribute-size");
      IntPtr list=Marshal.AllocHGlobal(size),jobs=IntPtr.Zero,handles=IntPtr.Zero; bool initialized=false;
      try {
        jobs=Marshal.AllocHGlobal(IntPtr.Size); handles=Marshal.AllocHGlobal(2*IntPtr.Size);
        Native(InitializeProcThreadAttributeList(list,2,0,ref size)); initialized=true;
        Marshal.WriteIntPtr(jobs,job); Marshal.WriteIntPtr(handles,0,browserRead); Marshal.WriteIntPtr(handles,IntPtr.Size,browserWrite);
        Native(UpdateProcThreadAttribute(list,0,new IntPtr(0x0002000D),jobs,new IntPtr(IntPtr.Size),IntPtr.Zero,IntPtr.Zero));
        Native(UpdateProcThreadAttribute(list,0,new IntPtr(0x00020002),handles,new IntPtr(2*IntPtr.Size),IntPtr.Zero,IntPtr.Zero));
        STARTUPINFOEX startup=new STARTUPINFOEX(); startup.startup.cb=Marshal.SizeOf(typeof(STARTUPINFOEX)); startup.attributes=list;
        string args="\""+executable+"\" --remote-debugging-pipe --remote-debugging-io-pipes="+HandleArgument(browserRead)+","+HandleArgument(browserWrite);
        PROCESS_INFORMATION info;
        installation.AssertCurrent();
        // The retained volume-GUID path does not re-resolve a drive-letter map
        // between final admission and CreateProcess. argv[0] remains the normal
        // installed spelling, and the working directory uses the same volume.
        // Any P/Invoke exception leaves Unknown. Only a normal false return
        // with entirely empty outputs proves the narrow failed-creation case.
        creationPhase=CreationPhase.Unknown;
        bool createdProcess=CreateProcess(installation.ExecutableNativePath,new StringBuilder(args),IntPtr.Zero,IntPtr.Zero,true,0x00080000,IntPtr.Zero,Path.GetDirectoryName(installation.ExecutableNativePath),ref startup,out info);
        if(!createdProcess) {
          if(info.process==IntPtr.Zero && info.thread==IntPtr.Zero && info.processId==0 && info.threadId==0) creationPhase=CreationPhase.ReturnedFalse;
          throw Error("create-process-refused");
        }
        // Keep the ORIGINAL CreateProcess process handle before any fallible work.
        root=info.process; rootThread=info.thread; rootPid=info.processId;
        creationPhase=CreationPhase.RootRetained;
        try { long created,exited,kernel,user; Native(GetProcessTimes(root,out created,out exited,out kernel,out user)); if(created<=0) throw Error("root-created"); rootCreated=created; }
        finally { Close(ref rootThread); }
        // Only browser-end duplicates are closed. Parent endpoints stay owned.
        Close(ref browserRead); Close(ref browserWrite); AssertLive(); launchCompleted=true;
      } finally { if(initialized) DeleteProcThreadAttributeList(list); if(handles!=IntPtr.Zero) Marshal.FreeHGlobal(handles); if(jobs!=IntPtr.Zero) Marshal.FreeHGlobal(jobs); Marshal.FreeHGlobal(list); }
    } finally { launchSettled=true; }
  }
  public void Send(int id,string method,string targetId,string sessionId,string scriptId) {
    AssertLive(); if(!launchCompleted || protocolFailed || id!=nextRequest || id>32) throw Error("discovery-request");
    Func<string,bool> token=value=>value!=null && System.Text.RegularExpressions.Regex.IsMatch(value,@"\A[A-Za-z0-9_.:-]{1,128}\z");
    string fields="";
    if(method=="Browser.getVersion" || method=="Target.getTargets") { if(targetId!=null || sessionId!=null || scriptId!=null) throw Error("discovery-fields"); }
    else if(method=="Target.attachToTarget") { if(!token(targetId) || sessionId!=null || scriptId!=null) throw Error("attach-fields"); fields=",\"params\":{\"targetId\":\""+targetId+"\",\"flatten\":true}"; }
    else {
      if(targetId!=null || !token(sessionId)) throw Error("session-fields");
      if(method=="Debugger.getScriptSource") { if(!token(scriptId)) throw Error("script-fields"); fields=",\"params\":{\"scriptId\":\""+scriptId+"\"}"; }
      else {
        if(scriptId!=null || (method!="Page.enable" && method!="Page.getFrameTree" && method!="Runtime.enable" && method!="Debugger.enable")) throw Error("session-method");
        fields=method=="Debugger.enable"?",\"params\":{\"maxScriptsCacheSize\":33554432}":",\"params\":{}";
      }
      fields+=",\"sessionId\":\""+sessionId+"\"";
    }
    nextRequest++; // A failed write consumes its ID and the entire diagnostic channel.
    byte[] bytes=Encoding.UTF8.GetBytes("{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+",\"method\":\""+method+"\""+fields+"}\0");
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
      if ($line.Length -ge 4096) {throw 'pcb-diagnostic-request-size'}
      [void]$line.Append([char]$character)
    }
    $id=$null
    try {
      $request=$line.ToString() | ConvertFrom-Json
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
          if (-not $launched -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt 32 -or $request.method -isnot [string]) {throw 'pcb-diagnostic-request-id'}
          $fields=@('action','helperInstance','id','jobId','method','requestId','rootCreated','rootPid')
          switch -CaseSensitive ($request.method) {
            'Browser.getVersion' {}
            'Target.getTargets' {}
            'Target.attachToTarget' {$fields+=@('targetId')}
            'Page.enable' {$fields+=@('sessionId')}
            'Page.getFrameTree' {$fields+=@('sessionId')}
            'Runtime.enable' {$fields+=@('sessionId')}
            'Debugger.enable' {$fields+=@('sessionId')}
            'Debugger.getScriptSource' {$fields+=@('sessionId','scriptId')}
            default {throw 'pcb-diagnostic-session-method'}
          }
          if ((@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne (@($fields | Sort-Object) -join ',')) {throw 'pcb-diagnostic-request-fields'}
          foreach ($field in @('targetId','sessionId','scriptId')) {if ($null -ne $request.$field -and $request.$field -isnot [string]) {throw 'pcb-diagnostic-request-field'}}
          $owner.Send([int]$request.requestId,$request.method,$request.targetId,$request.sessionId,$request.scriptId); $result=@{written=$true}
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
        }
        'release-no-process' {
          if ((@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,id') {throw 'pcb-diagnostic-no-process-fields'}
          $state=$owner.ReleaseNoProcess(); $release=$true; $result=@{released=$true;creationState=$state;processCreated=$false}
        }
        default {throw 'pcb-diagnostic-action'}
      }
      @{id=$id;ok=$true;result=$result} | ConvertTo-Json -Depth 5 -Compress
    } catch {
      # A post-create exception must not hide the retained process from its
      # original helper. The facade can recover its binding using identity.
      if ($owner.RootPid -gt 0) {$launched=$true}
      $code='pcb-diagnostic-native-call'
      if ($_.Exception.Message -cmatch '^pcb-diagnostic-[a-z-]{1,80}$') {$code=$_.Exception.Message}
      @{id=$id;ok=$false;error=$code} | ConvertTo-Json -Compress
    }
  }
} finally {$owner.RetainUntilClosed()}
