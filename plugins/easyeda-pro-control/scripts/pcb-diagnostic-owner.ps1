param([switch]$CompileOnly)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
# Separate diagnostic owner. The ordinary no-argument launcher is unchanged.
# Electron requests Browser::Quit on pipe disconnect. Never dispose live pipes,
# including after malformed requests, stdin EOF or an abandoned facade.
Add-Type @'
using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
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
  uint rootPid; long rootCreated; int nextRequest=1,received; bool launchAttempted,closeAttempted,released,protocolFailed;
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
  void AssertLive() {
    AssertLimits(); AssertPipes(); bool contained; long created,exited,kernel,user;
    if(root==IntPtr.Zero || RootExited() || GetProcessId(root)!=rootPid) throw Error("root-not-live");
    Native(GetProcessTimes(root,out created,out exited,out kernel,out user)); Native(IsProcessInJob(root,job,out contained));
    if(created!=rootCreated || !contained) throw Error("root-identity");
  }
  static void ExistingApplicationAbsent() {
    Process[] existing=Process.GetProcessesByName("easyeda-pro");
    try { foreach(Process item in existing) if(!item.HasExited) throw Error("existing-application"); }
    finally { foreach(Process item in existing) item.Dispose(); }
  }
  static string HandleArgument(IntPtr handle) { long value=handle.ToInt64(); if(value<=0 || value>uint.MaxValue) throw Error("handle-encoding"); return value.ToString(CultureInfo.InvariantCulture); }
  public void Launch(string executable,string expectedHash) {
    if(launchAttempted) throw Error("launch-consumed"); launchAttempted=true;
    AssertLimits(); AssertPipes(); if(JobCount()!=0) throw Error("job-not-empty");
    if(executable==null || !System.Text.RegularExpressions.Regex.IsMatch(executable,@"\A[A-Za-z]:\\[^\x00-\x1f\""\r\n]+\.exe\z") || Path.GetFileName(executable)!="easyeda-pro.exe" ||
       !System.Text.RegularExpressions.Regex.IsMatch(expectedHash??"",@"\A[a-f0-9]{64}\z")) throw Error("executable-input");
    FileInfo item=new FileInfo(executable); if(!item.Exists || item.FullName!=executable || (item.Attributes&FileAttributes.ReparsePoint)!=0) throw Error("executable-path");
    using(FileStream file=new FileStream(executable,FileMode.Open,FileAccess.Read,FileShare.Read)) {
      string digest; using(SHA256 hash=SHA256.Create()) digest=BitConverter.ToString(hash.ComputeHash(file)).Replace("-","").ToLowerInvariant();
      if(digest!=expectedHash) throw Error("executable-hash"); ExistingApplicationAbsent();
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
        Native(CreateProcess(executable,new StringBuilder(args),IntPtr.Zero,IntPtr.Zero,true,0x00080000,IntPtr.Zero,Path.GetDirectoryName(executable),ref startup,out info));
        // Keep the ORIGINAL CreateProcess process handle before any fallible work.
        root=info.process; rootThread=info.thread; rootPid=info.processId;
        try { long exited,kernel,user; Native(GetProcessTimes(root,out rootCreated,out exited,out kernel,out user)); }
        finally { Close(ref rootThread); }
        // Only browser-end duplicates are closed. Parent endpoints stay owned.
        Close(ref browserRead); Close(ref browserWrite); AssertLive();
      } finally { if(initialized) DeleteProcThreadAttributeList(list); if(handles!=IntPtr.Zero) Marshal.FreeHGlobal(handles); if(jobs!=IntPtr.Zero) Marshal.FreeHGlobal(jobs); Marshal.FreeHGlobal(list); }
    }
  }
  public void Send(int id,string method) {
    AssertLive(); if(protocolFailed || id!=nextRequest || id>32 || (method!="Browser.getVersion" && method!="Target.getTargets")) throw Error("discovery-request");
    nextRequest++; // A failed write consumes its ID and the entire diagnostic channel.
    byte[] bytes=Encoding.UTF8.GetBytes("{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+",\"method\":\""+method+"\"}\0");
    try { uint written; Native(WriteFile(parentWrite,bytes,(uint)bytes.Length,out written,IntPtr.Zero)); if(written!=bytes.Length) throw Error("partial-write"); AssertLive(); }
    catch { protocolFailed=true; throw; }
  }
  public string Poll() {
    AssertLive(); if(protocolFailed) throw Error("channel-failed");
    try {
      uint available; Native(PeekNamedPipe(parentRead,IntPtr.Zero,0,IntPtr.Zero,out available,IntPtr.Zero));
      if(available==0) return "";
      int count=(int)Math.Min(65536u,available); if(received+count>8*1024*1024) throw Error("receive-budget");
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
    AssertLive(); int count=0,owned=0; bool overflow=false; IntPtr selected=IntPtr.Zero; string title=null;
    bool complete=EnumWindows((hwnd,value)=> { uint pid; GetWindowThreadProcessId(hwnd,out pid); if(pid!=rootPid) return true; if(++owned>64) { overflow=true; return false; } string candidate=WindowTitle(hwnd); if(candidate!=null && WindowTitle(hwnd)==candidate) { count++; selected=hwnd; title=candidate; } return true; },IntPtr.Zero);
    AssertLive(); if(!complete && !overflow) throw Error("window-enumeration");
    if(overflow || count!=1 || WindowTitle(selected)!=title) return null;
    return selected.ToInt64().ToString(CultureInfo.InvariantCulture);
  }
  public void NormalClose(string hwnd) {
    if(closeAttempted) throw Error("close-consumed"); closeAttempted=true;
    long number; if(!long.TryParse(hwnd,NumberStyles.None,CultureInfo.InvariantCulture,out number) || number<=0 || Window()!=hwnd) throw Error("window-mismatch");
    AssertLive(); Native(PostMessage(new IntPtr(number),16,IntPtr.Zero,IntPtr.Zero));
  }
  public bool Terminated() {
    if(root==IntPtr.Zero) return job==IntPtr.Zero || JobCount()==0;
    return RootExited() && JobCount()==0 && RootExited() && JobCount()==0;
  }
  static void Close(ref IntPtr handle) { if(handle!=IntPtr.Zero) { Native(CloseHandle(handle)); handle=IntPtr.Zero; } }
  public void ReleaseClosed() {
    if(released) throw Error("release-consumed");
    if(!Terminated()) throw Error("retain-live-owner");
    Close(ref browserRead); Close(ref browserWrite); Close(ref parentRead); Close(ref parentWrite); Close(ref rootThread); Close(ref root); Close(ref job); released=true;
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
    if (-not $owner.Terminated()) {throw 'pcb-diagnostic-compile-job-not-empty'}
    $owner.ReleaseClosed()
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
      if ($launched -and $request.action -cne 'identity' -and ($request.helperInstance -cne $owner.HelperInstance -or $request.jobId -cne $owner.JobId -or $request.rootCreated -cne $owner.RootCreated)) {throw 'pcb-diagnostic-owner-binding'}
      switch -CaseSensitive ($request.action) {
        'launch' {
          if ($request.confirmDiagnosticLaunch -isnot [bool] -or $request.confirmDiagnosticLaunch -ne $true -or $launched) {throw 'pcb-diagnostic-launch-approval'}
          $owner.Launch($request.executable,$request.executableSha256)
          $launched=$true
          $result=@{helperInstance=$owner.HelperInstance;jobId=$owner.JobId;rootPid=$owner.RootPid;rootCreated=$owner.RootCreated}
        }
        'send' {if (-not $launched -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt 32) {throw 'pcb-diagnostic-request-id'}; $owner.Send([int]$request.requestId,$request.method); $result=@{written=$true}}
        'poll' {if (-not $launched) {throw 'pcb-diagnostic-not-launched'}; $result=@{bytes=$owner.Poll()}}
        'window' {if (-not $launched) {throw 'pcb-diagnostic-not-launched'}; $result=@{hwnd=$owner.Window()}}
        'normal-close' {if (-not $launched -or $request.confirmNormalClose -isnot [bool] -or $request.confirmNormalClose -ne $true) {throw 'pcb-diagnostic-close-approval'}; $owner.NormalClose($request.hwnd); $result=@{closeDispatched=$true;saveOrDiscardSelected=$false}}
        'termination' {$result=@{terminated=$owner.Terminated()}}
        'identity' {$result=@{helperInstance=$owner.HelperInstance;jobId=$owner.JobId;rootPid=$owner.RootPid;rootCreated=$owner.RootCreated}}
        'release' {$owner.ReleaseClosed(); $release=$true; $result=@{released=$true}}
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
