using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;

// Private fixed owner. Constructor acquires nothing. No attach, provider or retry.
// OWNED_SYNTHETIC_JOB_TEST substitutes only the internal native implementation.
public sealed class OwnedSyntheticJob : IDisposable {
  internal const int Job=0, Limits=1, Query=2, Attributes=3, Jobs=4, EnvironmentBlock=5, Root=6, Thread=7, SlotCount=8;
  const int MaxProcesses=128, MaxErrors=64;
  const int Guard=1, Allocation=2, CreateJob=3, SetLimits=4, QueryLimits=5, QueryShape=6,
    AttributeSize=7, AttributeInit=8, AttributeUpdate=9, CreateRoot=10, ProcessShape=11,
    Membership=12, Identity=13, Wait=14, Exit=15, QueryPids=16, Terminate=17,
    Close=18, DeleteAttributes=19, External=20, Settlement=21;
  const byte NotEntered=0, Entered=1, ReturnedZero=2, Confirmed=3, Uncertain=4, Aliased=5;
  IntPtr[] handles;
  byte[] acquisition;
  bool[] attempted,closed;
  bool processOutputConflict;
  int[] errorCodes,errorSlots,errorNative;
  int errorCount,primaryCode,primaryNative,step=Guard;
  bool prepareAttempted,prepared,launchAttempted,launchCallEntered,launchAcknowledged,identityRetained;
  bool attributeInitialized,attributeDeleteAttempted,attributeDeleted;
  bool stopAttempted,stopAccepted,settlementStarted,settlementFinished,cleanupStarted,cleanupFinished,errorOverflow;
  bool rootSignaled,jobEmpty,terminalObserved,exitObserved,killOnCloseAttempted;
  uint exitCode;
  public uint Pid { get; private set; }
  public long StartFileTime { get; private set; }
  public OwnedSyntheticJob() { }
  public bool LaunchAttempted { get { return launchAttempted; } }
  public bool LaunchCallEntered { get { return launchCallEntered; } }
  public bool LaunchAcknowledged { get { return launchAcknowledged; } }
  public bool Forced { get { return stopAttempted; } }
  public bool StopAccepted { get { return stopAccepted; } }
  public bool TerminalObserved { get { return terminalObserved; } }
  public bool RootSignaledObserved { get { return rootSignaled; } }
  public bool EmptyJobObserved { get { return jobEmpty; } }
  public bool ExitCodeObserved { get { return exitObserved; } }
  public uint ObservedExitCode { get { return exitCode; } }
  public bool KillOnCloseAttempted { get { return killOnCloseAttempted; } }
  public int PrimaryCode { get { return primaryCode; } }
  public int PrimaryNativeError { get { return primaryNative; } }
  public bool CleanupFinished { get { return cleanupFinished; } }
  public bool SettlementFinished { get { return settlementFinished; } }
  public bool ErrorOverflow { get { return errorOverflow; } }
  public bool AcquisitionUncertain {
    get { if(acquisition!=null)for(int i=0;i<SlotCount;i++)if(acquisition[i]==Entered||acquisition[i]==Uncertain)return true;return false; }
  }
  public bool ResourceAliasDetected {
    get { if(acquisition!=null)for(int i=0;i<SlotCount;i++)if(acquisition[i]==Aliased)return true;return false; }
  }
  public int[] ErrorCodes { get { return Copy(errorCodes); } }
  public int[] ErrorSlots { get { return Copy(errorSlots); } }
  public int[] NativeErrors { get { return Copy(errorNative); } }
  public bool CleanupSucceeded {
    get {
      if(!cleanupFinished||errorCount!=0||errorOverflow||AcquisitionUncertain||ResourceAliasDetected)return false;
      if(attributeInitialized&&!attributeDeleted)return false;
      if(handles!=null)for(int i=0;i<SlotCount;i++)if(handles[i]!=IntPtr.Zero&&!closed[i])return false;
      return true;
    }
  }
  public bool NativeSuccess {
    get { return cleanupFinished&&CleanupSucceeded&&primaryCode==0&&launchAcknowledged&&identityRetained&&terminalObserved&&exitObserved&&exitCode==0&&!stopAttempted; }
  }
  int[] Copy(int[] values) {
    int[] result=new int[errorCount];
    if(values!=null)Array.Copy(values,result,errorCount);
    return result;
  }
  void Primary(int code,int native) { if(!cleanupFinished&&primaryCode==0){primaryCode=code;primaryNative=native;} }
  void Error(int code,int slot,int native) {
    if(cleanupFinished)return;
    if(errorCodes==null||errorCount>=MaxErrors){errorOverflow=true;return;}
    errorCodes[errorCount]=code;errorSlots[errorCount]=slot;errorNative[errorCount]=native;errorCount++;
  }
  void Refuse(int code,int native) { Primary(code,native);throw new InvalidOperationException("OWNED_SYNTHETIC_JOB_REFUSED"); }
  void Require(bool value,int code) { if(!value)Refuse(code,0); }
  void NativeOk(bool value,int code) { if(!value)Refuse(code,OwnedSyntheticNative.LastError()); }
  bool Available(int slot) {
    return handles!=null&&handles[slot]!=IntPtr.Zero&&acquisition[slot]==Confirmed&&!attempted[slot]&&
      !(processOutputConflict&&(slot==Root||slot==Thread));
  }
  static bool HandleSlot(int slot) { return slot==Job||slot==Root||slot==Thread; }
  void EnterAcquisition(int slot) {
    Require(acquisition[slot]==NotEntered,Guard);acquisition[slot]=Entered;
  }
  void RetainReturned(int slot,IntPtr value) {
    handles[slot]=value;acquisition[slot]=value==IntPtr.Zero?ReturnedZero:Confirmed;
  }
  bool AccountAlias(int slot) {
    if(handles[slot]==IntPtr.Zero)return true;
    // Fixed slot order is acquisition order within each namespace. Keep the
    // earliest original owner for cleanup; a later alias grants no second close.
    for(int earlier=0;earlier<slot;earlier++){
      if(HandleSlot(earlier)==HandleSlot(slot)&&handles[earlier]!=IntPtr.Zero&&handles[earlier]==handles[slot]){
        acquisition[slot]=Aliased;attempted[slot]=true;
        if(HandleSlot(slot))processOutputConflict=true;
        Error(HandleSlot(slot)?ProcessShape:Allocation,slot,0);return false;
      }
    }
    return true;
  }
  void Active() { Require(prepared&&!settlementStarted&&!cleanupStarted,Guard); }
  void Allocate(int slot,int bytes) {
    step=Allocation;EnterAcquisition(slot);
    IntPtr value;
    try{value=OwnedSyntheticNative.Allocate(bytes);}catch{acquisition[slot]=Uncertain;throw;}
    RetainReturned(slot,value);
    Require(AccountAlias(slot)&&handles[slot]!=IntPtr.Zero,Allocation);
  }
  public void Prepare() {
    Require(!prepareAttempted&&!cleanupStarted,Guard);prepareAttempted=true;
    try {
      // All bookkeeping exists before the first unmanaged acquisition.
      handles=new IntPtr[SlotCount];acquisition=new byte[SlotCount];attempted=new bool[SlotCount];closed=new bool[SlotCount];
      errorCodes=new int[MaxErrors];errorSlots=new int[MaxErrors];errorNative=new int[MaxErrors];
      Require(IntPtr.Size==8,Guard);
      step=CreateJob;EnterAcquisition(Job);
      IntPtr job;
      try{job=OwnedSyntheticNative.CreateJob();}catch{acquisition[Job]=Uncertain;throw;}
      RetainReturned(Job,job);
      NativeOk(handles[Job]!=IntPtr.Zero,CreateJob);
      Allocate(Limits,Marshal.SizeOf(typeof(ExtendedLimits)));
      Allocate(Query,8+MaxProcesses*IntPtr.Size);
      ExtendedLimits limits=new ExtendedLimits();limits.basic.flags=0x2000;
      Marshal.StructureToPtr(limits,handles[Limits],false);
      step=SetLimits;NativeOk(OwnedSyntheticNative.SetLimits(handles[Job],handles[Limits],(uint)Marshal.SizeOf(typeof(ExtendedLimits))),SetLimits);
      AssertLimits();prepared=true;
    } catch { Primary(step,0);throw; }
  }
  void AssertLimits() {
    Require(Available(Job)&&Available(Limits),Guard);
    int size=Marshal.SizeOf(typeof(ExtendedLimits));uint returned;
    step=QueryLimits;NativeOk(OwnedSyntheticNative.Query(handles[Job],9,handles[Limits],(uint)size,out returned),QueryLimits);
    Require(returned==(uint)size,QueryShape);
    ExtendedLimits limits=(ExtendedLimits)Marshal.PtrToStructure(handles[Limits],typeof(ExtendedLimits));
    Require(limits.basic.flags==0x2000,QueryShape);
  }
  public void Launch(string executable,string command,string environment,string directory) {
    // Consume before argument qualification or any native call.
    Require(!launchAttempted&&!settlementStarted&&!cleanupStarted,Guard);launchAttempted=true;
    try {
      Active();
      Require(!String.IsNullOrEmpty(executable)&&!String.IsNullOrEmpty(directory)&&
        !String.IsNullOrEmpty(command)&&command.Length<=30000&&command.IndexOf('\0')<0&&
        environment!=null&&environment.Length>1&&environment.Length<=32768&&
        environment.EndsWith("\0\0",StringComparison.Ordinal),Guard);
      AssertLimits();
      IntPtr size=IntPtr.Zero;step=AttributeSize;
      bool sized=OwnedSyntheticNative.Initialize(IntPtr.Zero,ref size);
      int sizingError=OwnedSyntheticNative.LastError();
      Require(!sized&&sizingError==122&&size.ToInt64()>0&&size.ToInt64()<=65536,AttributeSize);
      Allocate(Attributes,checked((int)size.ToInt64()));Allocate(Jobs,IntPtr.Size);
      step=Allocation;EnterAcquisition(EnvironmentBlock);
      IntPtr environmentPointer;
      try{environmentPointer=OwnedSyntheticNative.Environment(environment);}catch{acquisition[EnvironmentBlock]=Uncertain;throw;}
      RetainReturned(EnvironmentBlock,environmentPointer);
      Require(AccountAlias(EnvironmentBlock)&&handles[EnvironmentBlock]!=IntPtr.Zero,Allocation);
      step=AttributeInit;NativeOk(OwnedSyntheticNative.Initialize(handles[Attributes],ref size),AttributeInit);attributeInitialized=true;
      Marshal.WriteIntPtr(handles[Jobs],handles[Job]);
      step=AttributeUpdate;NativeOk(OwnedSyntheticNative.Update(handles[Attributes],handles[Jobs]),AttributeUpdate);
      StartupEx startup=new StartupEx();startup.startup.cb=Marshal.SizeOf(typeof(StartupEx));startup.attributes=handles[Attributes];
      ProcessInfo info;step=CreateRoot;launchCallEntered=true;
      bool created=OwnedSyntheticNative.CreateProcess(executable,new StringBuilder(command),handles[EnvironmentBlock],directory,ref startup,out info);
      int createError=created?0:OwnedSyntheticNative.LastError();
      // False return does not grant ownership of unspecified output values.
      if(!created)Refuse(CreateRoot,createError);
      // No fallible query/allocation between success and retaining BOTH outputs.
      RetainReturned(Root,info.process);RetainReturned(Thread,info.thread);Pid=info.processId;launchAcknowledged=true;
      // Account BOTH retained outputs before refusing either. A root conflicting
      // with Job or Thread cannot reach Wait/Exit, including during settlement.
      bool rootUnique=AccountAlias(Root),threadUnique=AccountAlias(Thread);
      Require(rootUnique&&threadUnique&&Available(Root)&&Available(Thread)&&handles[Root]!=new IntPtr(-1)&&handles[Thread]!=new IntPtr(-1)&&Pid>0,ProcessShape);
      if(!CloseSlot(Thread))Refuse(Close,0);
      bool contained;step=Membership;
      NativeOk(OwnedSyntheticNative.IsInJob(handles[Root],handles[Job],out contained),Membership);Require(contained,Membership);
      long createdAt;step=Identity;NativeOk(OwnedSyntheticNative.CreationTime(handles[Root],out createdAt),Identity);
      Require(createdAt>0,Identity);StartFileTime=createdAt;identityRetained=true;
    } catch { Primary(step,0);throw; }
  }
  uint[] ReadPids() {
    AssertLimits();Require(Available(Query),Guard);
    int size=8+MaxProcesses*IntPtr.Size;uint returned;
    step=QueryPids;NativeOk(OwnedSyntheticNative.Query(handles[Job],3,handles[Query],(uint)size,out returned),QueryPids);
    Require(returned>=8&&returned<=(uint)size&&(returned-8)%IntPtr.Size==0,QueryShape);
    int assigned=Marshal.ReadInt32(handles[Query],0),count=Marshal.ReadInt32(handles[Query],4);
    Require(count>=0&&count<=MaxProcesses&&assigned==count&&returned>=8+(uint)count*IntPtr.Size,QueryShape);
    uint[] values=new uint[count];
    for(int i=0;i<count;i++){long pid=Marshal.ReadIntPtr(handles[Query],8+i*IntPtr.Size).ToInt64();Require(pid>0&&pid<=UInt32.MaxValue,QueryShape);values[i]=(uint)pid;}
    Array.Sort(values);for(int i=1;i<values.Length;i++)Require(values[i]!=values[i-1],QueryShape);
    return values;
  }
  public uint[] Pids() { try{Active();return ReadPids();}catch{Primary(step,0);throw;} }
  bool ReadRootExited() {
    Require(Available(Root),Guard);step=Wait;uint result=OwnedSyntheticNative.Wait(handles[Root]);
    if(result==0)return true;if(result==258)return false;Refuse(Wait,OwnedSyntheticNative.LastError());return false;
  }
  public bool RootExited() { try{Active();return ReadRootExited();}catch{Primary(step,0);throw;} }
  public uint ExitCode() {
    try{Active();Require(ReadRootExited(),Exit);uint code;step=Exit;NativeOk(OwnedSyntheticNative.ExitCode(handles[Root],out code),Exit);return code;}
    catch{Primary(step,0);throw;}
  }
  bool Observe() {
    // Both observations are attempted while their original handles remain valid.
    bool signaled=false,empty=false,rootRead=false,jobRead=false;
    try{signaled=ReadRootExited();rootRead=true;}catch{Primary(step,0);}
    try{empty=ReadPids().Length==0;jobRead=true;}catch{Primary(step,0);}
    rootSignaled=rootRead&&signaled;jobEmpty=jobRead&&empty;terminalObserved=false;
    if(rootSignaled&&jobEmpty){
      try{uint code;step=Exit;NativeOk(OwnedSyntheticNative.ExitCode(handles[Root],out code),Exit);exitCode=code;exitObserved=true;terminalObserved=true;}
      catch{Primary(step,0);}
    }
    return terminalObserved;
  }
  public bool ObserveTerminal() { Active();return Observe(); }
  void StopOnce() {
    if(stopAttempted||!Available(Job))return;
    stopAttempted=true;
    try{step=Terminate;stopAccepted=OwnedSyntheticNative.Terminate(handles[Job]);if(!stopAccepted){int error=OwnedSyntheticNative.LastError();Primary(Terminate,error);Error(Terminate,Job,error);}}
    catch{Primary(Terminate,0);Error(Terminate,Job,0);}
  }
  public void StopOwned() { Active();StopOnce(); }
  public void RecordExternalFailure(int category) {
    // Closed vocabulary: preparation/validation, receipt, file-close, output.
    if(category<1||category>4)category=1;
    Primary(External,category);
  }
  public void PrepareSettlement(bool candidate) {
    if(settlementStarted)return;settlementStarted=true;
    try {
      if(launchAcknowledged){
        if(!candidate||primaryCode!=0)StopOnce();
        Stopwatch watch=Stopwatch.StartNew();
        for(int i=0;i<=200;i++){
          if(Observe())break;
          if(primaryCode!=0)StopOnce();
          if(i==200||watch.ElapsedMilliseconds>=5000)break;
          OwnedSyntheticNative.Delay();
        }
        if(!terminalObserved){Primary(Settlement,0);StopOnce();}
      } else if(launchCallEntered){Primary(Settlement,0);StopOnce();}
    } catch{Primary(Settlement,0);StopOnce();}
    finally {
      // On unresolved ownership, consume kill-on-close BEFORE file/path locks go.
      if(launchCallEntered&&!terminalObserved&&Available(Job)){killOnCloseAttempted=true;CloseSlot(Job);}
      settlementFinished=true;
    }
  }
  bool CloseSlot(int slot) {
    if(handles==null||handles[slot]==IntPtr.Zero)return true;
    if(attempted[slot])return closed[slot];
    attempted[slot]=true;
    try{
      if(slot==Job||slot==Root||slot==Thread){
        if(handles[slot]==new IntPtr(-1)){Error(ProcessShape,slot,0);return false;}
        if(!OwnedSyntheticNative.Close(handles[slot])){Error(Close,slot,OwnedSyntheticNative.LastError());return false;}
      }else{OwnedSyntheticNative.Free(handles[slot]);}
      closed[slot]=true;return true;
    }catch{Error(Close,slot,0);return false;}
    // Retain pointer plus attempted/closed state; never retry or silently zero.
  }
  public void CloseOwnedResources() {
    if(cleanupStarted)return;cleanupStarted=true;
    try {
      if(!settlementStarted)PrepareSettlement(false);
      if(attributeInitialized&&!attributeDeleteAttempted){
        attributeDeleteAttempted=true;
        try{OwnedSyntheticNative.Delete(handles[Attributes]);attributeDeleted=true;}
        catch{Error(DeleteAttributes,Attributes,0);}
      }
      CloseSlot(Attributes);CloseSlot(Jobs);CloseSlot(EnvironmentBlock);
      CloseSlot(Thread);CloseSlot(Job);CloseSlot(Root);CloseSlot(Query);CloseSlot(Limits);
    } finally { cleanupFinished=true; }
  }
  public void Dispose() { PrepareSettlement(false);CloseOwnedResources(); }
  // Fixed test introspection exists only in the private managed-core test build.
#if OWNED_SYNTHETIC_JOB_TEST
  internal bool WasAttempted(int slot){return attempted!=null&&attempted[slot];}
  internal bool WasClosed(int slot){return closed!=null&&closed[slot];}
  internal IntPtr RetainedHandle(int slot){return handles==null?IntPtr.Zero:handles[slot];}
  internal bool AcquisitionWasUncertain(int slot){return acquisition!=null&&(acquisition[slot]==Entered||acquisition[slot]==Uncertain);}
  internal bool WasAliased(int slot){return acquisition!=null&&acquisition[slot]==Aliased;}
#endif
  [StructLayout(LayoutKind.Sequential)] internal struct Startup {
    public int cb;public IntPtr reserved,desktop,title;public int x,y,xSize,ySize,xCountChars,yCountChars,fillAttribute,flags;
    public short showWindow,reservedSize;public IntPtr reserved2,stdin,stdout,stderr;
  }
  [StructLayout(LayoutKind.Sequential)] internal struct StartupEx { public Startup startup;public IntPtr attributes; }
  [StructLayout(LayoutKind.Sequential)] internal struct ProcessInfo { public IntPtr process,thread;public uint processId,threadId; }
  [StructLayout(LayoutKind.Sequential)] internal struct BasicLimits {
    public long processTime,jobTime;public uint flags;public UIntPtr minWorkingSet,maxWorkingSet;public uint activeProcessLimit;
    public UIntPtr affinity;public uint priority,scheduling;
  }
  [StructLayout(LayoutKind.Sequential)] internal struct IoCounters { public ulong a,b,c,d,e,f; }
  [StructLayout(LayoutKind.Sequential)] internal struct ExtendedLimits {
    public BasicLimits basic;public IoCounters io;public UIntPtr processMemory,jobMemory,peakProcessMemory,peakJobMemory;
  }
}
#if !OWNED_SYNTHETIC_JOB_TEST
internal static class OwnedSyntheticNative {
  internal static int LastError(){return Marshal.GetLastWin32Error();}
  internal static IntPtr Allocate(int size){return Marshal.AllocHGlobal(size);}
  internal static IntPtr Environment(string value){return Marshal.StringToHGlobalUni(value);}
  internal static void Free(IntPtr value){Marshal.FreeHGlobal(value);}
  internal static void Delay(){System.Threading.Thread.Sleep(25);}
  internal static IntPtr CreateJob(){return CreateJobObject(IntPtr.Zero,null);}
  internal static bool SetLimits(IntPtr job,IntPtr data,uint size){return SetInformationJobObject(job,9,data,size);}
  internal static bool Query(IntPtr job,int kind,IntPtr data,uint size,out uint returned){return QueryInformationJobObject(job,kind,data,size,out returned);}
  internal static bool Initialize(IntPtr list,ref IntPtr size){return InitializeProcThreadAttributeList(list,1,0,ref size);}
  internal static bool Update(IntPtr list,IntPtr jobs){return UpdateProcThreadAttribute(list,0,new IntPtr(0x0002000D),jobs,new IntPtr(IntPtr.Size),IntPtr.Zero,IntPtr.Zero);}
  internal static void Delete(IntPtr list){DeleteProcThreadAttributeList(list);}
  internal static bool CreateProcess(string exe,StringBuilder command,IntPtr environment,string directory,ref OwnedSyntheticJob.StartupEx startup,out OwnedSyntheticJob.ProcessInfo info){
    return CreateProcessW(exe,command,IntPtr.Zero,IntPtr.Zero,false,0x00080400,environment,directory,ref startup,out info);
  }
  internal static bool IsInJob(IntPtr root,IntPtr job,out bool contained){return IsProcessInJob(root,job,out contained);}
  internal static bool CreationTime(IntPtr root,out long created){long exit,kernel,user;return GetProcessTimes(root,out created,out exit,out kernel,out user);}
  internal static bool ExitCode(IntPtr root,out uint code){return GetExitCodeProcess(root,out code);}
  internal static uint Wait(IntPtr root){return WaitForSingleObject(root,0);}
  internal static bool Terminate(IntPtr job){return TerminateJobObject(job,197);}
  internal static bool Close(IntPtr handle){return CloseHandle(handle);}
  [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern IntPtr CreateJobObject(IntPtr security,string name);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool SetInformationJobObject(IntPtr job,int kind,IntPtr data,uint size);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool QueryInformationJobObject(IntPtr job,int kind,IntPtr data,uint size,out uint returned);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool InitializeProcThreadAttributeList(IntPtr list,int count,uint flags,ref IntPtr size);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool UpdateProcThreadAttribute(IntPtr list,uint flags,IntPtr attribute,IntPtr value,IntPtr size,IntPtr previous,IntPtr returned);
  [DllImport("kernel32.dll")] static extern void DeleteProcThreadAttributeList(IntPtr list);
  [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern bool CreateProcessW(string application,StringBuilder command,IntPtr processSecurity,IntPtr threadSecurity,bool inherit,uint flags,IntPtr environment,string directory,ref OwnedSyntheticJob.StartupEx startup,out OwnedSyntheticJob.ProcessInfo info);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool IsProcessInJob(IntPtr process,IntPtr job,out bool contained);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool GetProcessTimes(IntPtr process,out long created,out long exited,out long kernel,out long user);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool GetExitCodeProcess(IntPtr process,out uint code);
  [DllImport("kernel32.dll",SetLastError=true)] static extern uint WaitForSingleObject(IntPtr handle,uint milliseconds);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool TerminateJobObject(IntPtr job,uint code);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool CloseHandle(IntPtr handle);
}
#endif
