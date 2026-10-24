param([switch]$CompileOnly,[switch]$StringPrecreate,[switch]$WorkerStartup,[switch]$Layers209,[switch]$WorkerStartup209)
$ErrorActionPreference = 'Stop'
if (($StringPrecreate -and $WorkerStartup) -or ($Layers209 -and ($StringPrecreate -or $WorkerStartup))) {throw 'pcb-diagnostic-conflicting-purpose'}
if ($WorkerStartup209 -and ($StringPrecreate -or $WorkerStartup -or $Layers209)) {throw 'pcb-diagnostic-conflicting-purpose'}
$startupPurpose=$WorkerStartup -or $WorkerStartup209
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
// BEGIN STRING NATIVE CLOCK COLLECTOR
public sealed class EasyedaStringClockSample {
  public string schema = "easyeda-pro-control.windows-clock-sample.v1";
  public string utcBeforeTicks, utcAfterTicks, qpcBefore, qpcAfter, qpcFrequency;
  public bool highResolution = true;
  public int localOffsetMinutes;
  public string zoneRulesSha256;
}
public sealed class EasyedaStringClockObservation {
  public bool tzAbsent;
  public string reason;
  public EasyedaStringClockSample sample;
  [System.Runtime.InteropServices.DllImport("kernel32.dll", EntryPoint="GetEnvironmentVariableW", CharSet=System.Runtime.InteropServices.CharSet.Unicode, ExactSpelling=true, SetLastError=true)]
  static extern uint GetEnvironmentVariable(string name, System.IntPtr buffer, uint size);
  [System.Runtime.InteropServices.DllImport("kernel32.dll", EntryPoint="SetLastError", ExactSpelling=true)]
  static extern void ResetLastError(uint code);
  public static EasyedaStringClockObservation Read() {
    EasyedaStringClockObservation result = new EasyedaStringClockObservation();
    try {
      ResetLastError(0);
      uint length = GetEnvironmentVariable("TZ", System.IntPtr.Zero, 0);
      int error = System.Runtime.InteropServices.Marshal.GetLastWin32Error();
      if (length != 0 || error != 203) {
        result.reason = length != 0 || error == 0 ? "tz-present" : "tz-query";
        return result;
      }
      result.tzAbsent = true;
      if (!System.Diagnostics.Stopwatch.IsHighResolution || System.Diagnostics.Stopwatch.Frequency <= 0) {
        result.reason = "clock-sample"; return result;
      }
      long qpcBefore = System.Diagnostics.Stopwatch.GetTimestamp();
      System.DateTime utcBefore = System.DateTime.UtcNow;
      System.TimeZoneInfo.ClearCachedData();
      System.TimeZoneInfo zone = System.TimeZoneInfo.Local;
      System.TimeSpan offset = zone.GetUtcOffset(utcBefore);
      string rules = zone.ToSerializedString();
      if (rules.Length > 65536 || offset.Ticks % System.TimeSpan.TicksPerMinute != 0 ||
          offset.TotalMinutes < -840 || offset.TotalMinutes > 840) {
        result.reason = "timezone"; return result;
      }
      string rulesHash;
      using (System.Security.Cryptography.SHA256 hash = System.Security.Cryptography.SHA256.Create()) {
        rulesHash = System.BitConverter.ToString(hash.ComputeHash(System.Text.Encoding.UTF8.GetBytes(rules))).Replace("-", "").ToLowerInvariant();
      }
      System.DateTime utcAfter = System.DateTime.UtcNow;
      long qpcAfter = System.Diagnostics.Stopwatch.GetTimestamp();
      if (qpcBefore < 0 || qpcAfter < qpcBefore || utcAfter < utcBefore ||
          qpcAfter - qpcBefore > System.Diagnostics.Stopwatch.Frequency ||
          utcAfter.Ticks - utcBefore.Ticks > System.TimeSpan.TicksPerSecond) {
        result.reason = "clock-sample"; return result;
      }
      EasyedaStringClockSample value = new EasyedaStringClockSample();
      value.utcBeforeTicks = utcBefore.Ticks.ToString(System.Globalization.CultureInfo.InvariantCulture);
      value.utcAfterTicks = utcAfter.Ticks.ToString(System.Globalization.CultureInfo.InvariantCulture);
      value.qpcBefore = qpcBefore.ToString(System.Globalization.CultureInfo.InvariantCulture);
      value.qpcAfter = qpcAfter.ToString(System.Globalization.CultureInfo.InvariantCulture);
      value.qpcFrequency = System.Diagnostics.Stopwatch.Frequency.ToString(System.Globalization.CultureInfo.InvariantCulture);
      value.localOffsetMinutes = checked((int)offset.TotalMinutes);
      value.zoneRulesSha256 = rulesHash;
      result.sample = value;
      return result;
    } catch {
      result.reason = "clock-sample"; return result;
    }
  }
}
// END STRING NATIVE CLOCK COLLECTOR
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
// BEGIN GENERATED WORKER STARTUP PROTOCOL
// Generated from current-pcb-worker-startup-native.ts. Do not edit this block.
public static class EasyedaWorkerStartupProtocol {
  public const string UiActorClockFunction=@"function(){

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

const root=globalThis,apply=Reflect.apply;
const exactId=(v,re)=>{const m=typeof v===""string""?re.exec(v):null;if(m===null||m[0]!==v)bad();return v;};
const text=(v,max)=>{if(typeof v!==""string""||v.length>max||!v.isWellFormed())bad();return v;};
const actor=o=>({uuid:exactId(own(o,""uuid""),/^[a-f0-9]{32}$/),username:text(own(o,""username""),1024),nickname:text(own(o,""nickname""),1024)});
const nativeDate=own(root,""Date""),now=own(nativeDate,""now""),datePrototype=own(nativeDate,""prototype""),iso=own(datePrototype,""toISOString""),zone=own(datePrototype,""getTimezoneOffset"");
if([nativeDate,now,iso,zone].some(v=>typeof v!==""function""))bad();
const stamp=()=>{verify();const milliseconds=apply(now,nativeDate,[]);if(!Number.isSafeInteger(milliseconds)||milliseconds<0||milliseconds>8640000000000000||Object.is(milliseconds,-0))bad();const date=new nativeDate(milliseconds),timezoneOffsetMinutes=apply(zone,date,[]);if(!Number.isSafeInteger(timezoneOffsetMinutes)||Math.abs(timezoneOffsetMinutes)>840||Object.is(timezoneOffsetMinutes,-0))bad();return{milliseconds,iso:apply(iso,date,[]),timezoneOffsetMinutes};};
const before=stamp();
const finish=()=>{const after=stamp();verify();if(after.milliseconds<before.milliseconds||after.milliseconds-before.milliseconds>1000||after.timezoneOffsetMinutes!==before.timezoneOffsetMinutes)bad();return{before,after};};

const host=object(own(root,""gVars"")),ui=object(own(root,""UI"")),project=object(own(host,""currentProject""));
if(own(ui,""gVars"")!==host||own(project,""isV2Format"")!==false||own(host,""isHistoryMode"")!==false)bad();
const identity={projectUuid:exactId(own(project,""projectId""),/^[a-f0-9]{64}$/),branchUuid:exactId(own(project,""branchUuid""),/^[a-f0-9]{32}$/),windowTabId:exactId(own(root,""_TAB_ID_""),/^[A-Za-z0-9_-]{1,128}$/)};
const cached=object(own(object(own(host,""globalVariableCookieData"")),""userInfo"")),startup=object(own(host,""loginedUserInfo""));
const cachedActor=actor(cached),startupActor=actor(startup);
if(JSON.stringify(cachedActor)!==JSON.stringify(startupActor))bad();
const workerUser={uuid:startupActor.uuid,nickname:startupActor.nickname,username:startupActor.username,avatar:text(own(startup,""avatar""),4096)};
return JSON.stringify({schema:""easyeda-pro-control.pcb-worker-startup-actor.v1"",phase:""ui"",identity,cachedActor,startupActor,workerUser,workerUserText:JSON.stringify(workerUser),clock:finish()});
}";
  public const string PcbOpeningFunction=@"async function(target,phase){
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
  static void Need(bool condition,string code) { if(!condition)throw new System.InvalidOperationException("pcb-diagnostic-startup-"+code); }
  static string Field(System.Collections.IDictionary fields,string key) {
    Need(fields!=null && fields.Contains(key),"field");
    string result=fields[key] as string;Need(result!=null,"field-type");return result;
  }
  static void Keys(System.Collections.IDictionary fields,string[] expected) {
    Need(fields!=null && fields.Count==expected.Length,"fields");
    foreach(string key in expected)Need(fields.Contains(key),"fields");
  }
  static string Handle(string value,int limit) {
    Need(value!=null && value.Length<=limit && System.Text.RegularExpressions.Regex.IsMatch(value,@"\A[A-Za-z0-9_.:-]+\z"),"handle");return value;
  }
  public static string Encode(int id,string method,string sessionId,string phase,System.Collections.IDictionary fields) {
    return EncodeCore(id,method,sessionId,phase,fields,false);
  }
  public static string Encode209(int id,string method,string sessionId,string phase,System.Collections.IDictionary fields) {
    return EncodeCore(id,method,sessionId,phase,fields,true);
  }
  static string EncodeCore(int id,string method,string sessionId,string phase,System.Collections.IDictionary fields,bool workerStartup209) {
    Need(id>=1 && id<=256,"id");Handle(sessionId,128);
    string parameters=null;
    if(phase==@"attach") {
      Need(method==@"Target.setAutoAttach","method");
      Keys(fields,new string[]{});
      parameters=@"{""autoAttach"":true,""waitForDebuggerOnStart"":true,""flatten"":true,""filter"":[{""type"":""worker"",""exclude"":false},{""exclude"":true}]}";
    } else
    if(phase==@"runtime") {
      Need(method==@"Runtime.enable","method");
      Keys(fields,new string[]{});
      parameters=@"{}";
    } else
    if(phase==@"debugger") {
      Need(method==@"Debugger.enable","method");
      Keys(fields,new string[]{});
      parameters=@"{""maxScriptsCacheSize"":33554432}";
    } else
    if(phase==@"instrument") {
      Need(method==@"Debugger.setInstrumentationBreakpoint","method");
      Keys(fields,new string[]{});
      parameters=@"{""instrumentation"":""beforeScriptExecution""}";
    } else
    if(phase==@"start") {
      Need(method==@"Runtime.runIfWaitingForDebugger","method");
      Keys(fields,new string[]{});
      parameters=@"{}";
    } else
    if(phase==@"source") {
      Need(method==@"Debugger.getScriptSource","method");
      Keys(fields,new string[]{@"scriptId"});
      parameters=@"{""scriptId"":"+@""""+Handle(Field(fields,@"scriptId"),256)+@""""+@"}";
    } else
    if(phase==@"remove") {
      Need(method==@"Debugger.removeBreakpoint","method");
      Keys(fields,new string[]{@"breakpointId"});
      parameters=@"{""breakpointId"":"+@""""+Handle(Field(fields,@"breakpointId"),256)+@""""+@"}";
    } else
    if(phase==@"resume") {
      Need(method==@"Debugger.resume","method");
      Keys(fields,new string[]{});
      parameters=@"{}";
    } else
    if(phase==@"properties") {
      Need(method==@"Runtime.getProperties","method");
      Keys(fields,new string[]{@"objectId"});
      parameters=@"{""objectId"":"+@""""+Handle(Field(fields,@"objectId"),256)+@""""+@",""ownProperties"":true,""generatePreview"":false}";
    } else
    if(phase==@"release") {
      Need(method==@"Runtime.releaseObjectGroup","method");
      Keys(fields,new string[]{});
      parameters=@"{""objectGroup"":""easyeda-pro-control-worker-construction-v1""}";
    } else
    if(phase==@"breakpoint" && Field(fields,@"site")==@"channel") {
      Need(method==@"Debugger.setBreakpoint","method");
      Keys(fields,new string[]{@"site",@"scriptId"});
      parameters=@"{""location"":{""scriptId"":"+@""""+Handle(Field(fields,@"scriptId"),256)+@""""+@",""lineNumber"":0,""columnNumber"":11812}}";
    } else
    if(phase==@"breakpoint" && Field(fields,@"site")==@"base") {
      Need(method==@"Debugger.setBreakpoint","method");
      Keys(fields,new string[]{@"site",@"scriptId"});
      parameters=@"{""location"":{""scriptId"":"+@""""+Handle(Field(fields,@"scriptId"),256)+@""""+@",""lineNumber"":109,""columnNumber"":165345}}";
    } else
    if(phase==@"breakpoint" && Field(fields,@"site")==@"project") {
      Need(method==@"Debugger.setBreakpoint","method");
      Keys(fields,new string[]{@"site",@"scriptId"});
      parameters=@"{""location"":{""scriptId"":"+@""""+Handle(Field(fields,@"scriptId"),256)+@""""+@",""lineNumber"":110,""columnNumber"":93449}}";
    } else
    if(phase==@"breakpoint" && Field(fields,@"site")==@"serial") {
      Need(method==@"Debugger.setBreakpoint","method");
      Keys(fields,new string[]{@"site",@"scriptId"});
      parameters=workerStartup209?@"{""location"":{""scriptId"":"+@""""+Handle(Field(fields,@"scriptId"),256)+@""""+@",""lineNumber"":108,""columnNumber"":145582}}":@"{""location"":{""scriptId"":"+@""""+Handle(Field(fields,@"scriptId"),256)+@""""+@",""lineNumber"":108,""columnNumber"":145558}}";
    } else
    if(phase==@"breakpoint" && Field(fields,@"site")==@"cooperation") {
      Need(method==@"Debugger.setBreakpoint","method");
      Keys(fields,new string[]{@"site",@"scriptId"});
      parameters=@"{""location"":{""scriptId"":"+@""""+Handle(Field(fields,@"scriptId"),256)+@""""+@",""lineNumber"":109,""columnNumber"":8762}}";
    } else
    if(phase==@"breakpoint" && Field(fields,@"site")==@"debounce") {
      Need(method==@"Debugger.setBreakpoint","method");
      Keys(fields,new string[]{@"site",@"scriptId"});
      parameters=@"{""location"":{""scriptId"":"+@""""+Handle(Field(fields,@"scriptId"),256)+@""""+@",""lineNumber"":109,""columnNumber"":163871}}";
    } else
    if(phase==@"breakpoint" && Field(fields,@"site")==@"upload") {
      Need(method==@"Debugger.setBreakpoint","method");
      Keys(fields,new string[]{@"site",@"scriptId"});
      parameters=@"{""location"":{""scriptId"":"+@""""+Handle(Field(fields,@"scriptId"),256)+@""""+@",""lineNumber"":110,""columnNumber"":15488}}";
    } else
    if(phase==@"breakpoint" && Field(fields,@"site")==@"bootstrap") {
      Need(method==@"Debugger.setBreakpoint","method");
      Keys(fields,new string[]{@"site",@"scriptId"});
      parameters=@"{""location"":{""scriptId"":"+@""""+Handle(Field(fields,@"scriptId"),256)+@""""+@",""lineNumber"":110,""columnNumber"":162932}}";
    } else
    if(phase==@"select" && Field(fields,@"selector")==@"receiver") {
      Need(method==@"Debugger.evaluateOnCallFrame","method");
      Keys(fields,new string[]{@"selector",@"callFrameId"});
      parameters=@"{""callFrameId"":"+@""""+Handle(Field(fields,@"callFrameId"),256)+@""""+@",""expression"":""this"",""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""returnByValue"":false,""generatePreview"":false,""throwOnSideEffect"":true,""includeCommandLineAPI"":false}";
    } else
    if(phase==@"select" && Field(fields,@"selector")==@"argument-e") {
      Need(method==@"Debugger.evaluateOnCallFrame","method");
      Keys(fields,new string[]{@"selector",@"callFrameId"});
      parameters=@"{""callFrameId"":"+@""""+Handle(Field(fields,@"callFrameId"),256)+@""""+@",""expression"":""e"",""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""returnByValue"":false,""generatePreview"":false,""throwOnSideEffect"":true,""includeCommandLineAPI"":false}";
    } else
    if(phase==@"select" && Field(fields,@"selector")==@"argument-t") {
      Need(method==@"Debugger.evaluateOnCallFrame","method");
      Keys(fields,new string[]{@"selector",@"callFrameId"});
      parameters=@"{""callFrameId"":"+@""""+Handle(Field(fields,@"callFrameId"),256)+@""""+@",""expression"":""t"",""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""returnByValue"":false,""generatePreview"":false,""throwOnSideEffect"":true,""includeCommandLineAPI"":false}";
    } else
    if(phase==@"select" && Field(fields,@"selector")==@"channel") {
      Need(method==@"Debugger.evaluateOnCallFrame","method");
      Keys(fields,new string[]{@"selector",@"callFrameId"});
      parameters=@"{""callFrameId"":"+@""""+Handle(Field(fields,@"callFrameId"),256)+@""""+@",""expression"":""this.bc"",""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""returnByValue"":false,""generatePreview"":false,""throwOnSideEffect"":true,""includeCommandLineAPI"":false}";
    } else
    if(phase==@"select" && Field(fields,@"selector")==@"onmessage") {
      Need(method==@"Debugger.evaluateOnCallFrame","method");
      Keys(fields,new string[]{@"selector",@"callFrameId"});
      parameters=@"{""callFrameId"":"+@""""+Handle(Field(fields,@"callFrameId"),256)+@""""+@",""expression"":""this.bc.onmessage"",""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""returnByValue"":false,""generatePreview"":false,""throwOnSideEffect"":true,""includeCommandLineAPI"":false}";
    } else
    if(phase==@"same") {
      Need(method==@"Runtime.callFunctionOn","method");
      Keys(fields,new string[]{@"objectId",@"argument0"});
      parameters=@"{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":"+@""""+Handle(Field(fields,@"objectId"),256)+@""""+@",""functionDeclaration"":""function(other){\""use strict\"";return this===other;}"",""returnByValue"":true,""arguments"":[{""objectId"":"+@""""+Handle(Field(fields,@"argument0"),256)+@""""+@"}]}";
    } else
    if(phase==@"project") {
      Need(method==@"Runtime.callFunctionOn","method");
      Keys(fields,new string[]{@"objectId",@"argument0"});
      parameters=@"{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":"+@""""+Handle(Field(fields,@"objectId"),256)+@""""+@",""functionDeclaration"":""function(bus){\""use strict\"";const own=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))throw new Error(\""WORKER_CONSTRUCTION_MEMBER\"");return d.value;};return own(globalThis,\""PROJECT\"")===this&&own(this,\""workerBus\"")===bus;}"",""returnByValue"":true,""arguments"":[{""objectId"":"+@""""+Handle(Field(fields,@"argument0"),256)+@""""+@"}]}";
    } else
    if(phase==@"identity") {
      Need(method==@"Runtime.callFunctionOn","method");
      Keys(fields,new string[]{@"objectId",@"argument0"});
      parameters=@"{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":"+@""""+Handle(Field(fields,@"objectId"),256)+@""""+@",""functionDeclaration"":""function(bus){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""WORKER_CONSTRUCTION_IDENTITY\"");};\nconst retained=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();retained.push([o,k,d.value]);return d.value;};\nconst id=(v,re)=>{const m=typeof v===\""string\""?re.exec(v):null;if(m===null||m[0]!==v)bad();return v;};\nif(own(globalThis,\""PROJECT\"")!==this||own(this,\""workerBus\"")!==bus)bad();\nconst identity={projectUuid:id(own(this,\""uuid\""),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),branchUuid:id(own(this,\""_branchUuid\""),/^[a-f0-9]{32}$/),windowTabId:id(own(globalThis,\""_TAB_ID_\""),/^[A-Za-z0-9_-]{1,128}$/)};\nfor(const [o,k,v]of retained){const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\"")||d.value!==v)bad();}\nreturn identity;}"",""returnByValue"":true,""arguments"":[{""objectId"":"+@""""+Handle(Field(fields,@"argument0"),256)+@""""+@"}]}";
    } else
    if(phase==@"actor-clock") {
      Need(method==@"Runtime.callFunctionOn","method");
      Keys(fields,new string[]{@"objectId",@"argument0"});
      parameters=@"{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":"+@""""+Handle(Field(fields,@"objectId"),256)+@""""+@",""functionDeclaration"":""function(bus){\n\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nconst root=globalThis,apply=Reflect.apply;\nconst exactId=(v,re)=>{const m=typeof v===\""string\""?re.exec(v):null;if(m===null||m[0]!==v)bad();return v;};\nconst text=(v,max)=>{if(typeof v!==\""string\""||v.length>max||!v.isWellFormed())bad();return v;};\nconst actor=o=>({uuid:exactId(own(o,\""uuid\""),/^[a-f0-9]{32}$/),username:text(own(o,\""username\""),1024),nickname:text(own(o,\""nickname\""),1024)});\nconst nativeDate=own(root,\""Date\""),now=own(nativeDate,\""now\""),datePrototype=own(nativeDate,\""prototype\""),iso=own(datePrototype,\""toISOString\""),zone=own(datePrototype,\""getTimezoneOffset\"");\nif([nativeDate,now,iso,zone].some(v=>typeof v!==\""function\""))bad();\nconst stamp=()=>{verify();const milliseconds=apply(now,nativeDate,[]);if(!Number.isSafeInteger(milliseconds)||milliseconds<0||milliseconds>8640000000000000||Object.is(milliseconds,-0))bad();const date=new nativeDate(milliseconds),timezoneOffsetMinutes=apply(zone,date,[]);if(!Number.isSafeInteger(timezoneOffsetMinutes)||Math.abs(timezoneOffsetMinutes)>840||Object.is(timezoneOffsetMinutes,-0))bad();return{milliseconds,iso:apply(iso,date,[]),timezoneOffsetMinutes};};\nconst before=stamp();\nconst finish=()=>{const after=stamp();verify();if(after.milliseconds<before.milliseconds||after.milliseconds-before.milliseconds>1000||after.timezoneOffsetMinutes!==before.timezoneOffsetMinutes)bad();return{before,after};};\n\nconst project=named(this,\""Lg\""),pp=Object.getPrototypeOf(project),gp=Object.getPrototypeOf(pp);\nif(own(root,\""PROJECT\"")!==project||own(project,\""workerBus\"")!==bus||own(own(gp,\""constructor\""),\""name\"")!==\""Gd\""||Object.getPrototypeOf(gp)!==Object.prototype||own(project,\""_isV2Format\"")!==false)bad();\nconst identity={projectUuid:exactId(own(project,\""uuid\""),/^[a-f0-9]{64}$/),branchUuid:exactId(own(project,\""_branchUuid\""),/^[a-f0-9]{32}$/),windowTabId:exactId(own(root,\""_TAB_ID_\""),/^[A-Za-z0-9_-]{1,128}$/)};\nconst source=plain(own(project,\""user\"")),order=Reflect.ownKeys(source);\nif(order.length!==4||order.some(k=>typeof k!==\""string\""||![\""uuid\"",\""nickname\"",\""username\"",\""avatar\""].includes(k)))bad();\nconst projected=actor(source),avatar=text(own(source,\""avatar\""),4096),workerUser={};\nfor(const key of order){const d=Object.getOwnPropertyDescriptor(source,key);if(!d||d.enumerable!==true)bad();workerUser[key]=key===\""avatar\""?avatar:projected[key];}\nconst clock=finish();\nif(Object.getPrototypeOf(project)!==pp||Object.getPrototypeOf(pp)!==gp||Object.getPrototypeOf(gp)!==Object.prototype||Reflect.ownKeys(source).join(\"",\"")!==order.join(\"",\""))bad();\nfor(const key of order){const d=Object.getOwnPropertyDescriptor(source,key);if(!d||!Object.hasOwn(d,\""value\"")||d.enumerable!==true)bad();}\nverify();\nreturn JSON.stringify({schema:\""easyeda-pro-control.pcb-worker-startup-actor.v1\"",phase:\""worker\"",identity,originalProjectReceiverMatched:true,originalWorkerBusMatched:true,workerUser,workerUserText:JSON.stringify(workerUser),clock});\n}"",""returnByValue"":true,""arguments"":[{""objectId"":"+@""""+Handle(Field(fields,@"argument0"),256)+@""""+@"}]}";
    } else
    if(phase==@"assignment-upload-structure-select") {
      Need(method==@"Runtime.callFunctionOn","method");
      Keys(fields,new string[]{@"objectId"});
      parameters=@"{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":"+@""""+Handle(Field(fields,@"objectId"),256)+@""""+@",""functionDeclaration"":""function(){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nconst fn=v=>{if(typeof v!==\""function\"")bad();return v;};\nconst scope=o=>object(own(o,\""object\""));\nconst current=p=>{object(p);if(own(globalThis,\""PROJECT\"")!==p)bad();};\n\ncurrent(this);const selected=fn(own(this,\""uploadStructure\""));verify();return selected;}"",""returnByValue"":false,""arguments"":[]}";
    } else
    if(phase==@"assignment-structure-select") {
      Need(method==@"Runtime.callFunctionOn","method");
      Keys(fields,new string[]{@"objectId"});
      parameters=@"{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":"+@""""+Handle(Field(fields,@"objectId"),256)+@""""+@",""functionDeclaration"":""function(){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nconst fn=v=>{if(typeof v!==\""function\"")bad();return v;};\nconst scope=o=>object(own(o,\""object\""));\nconst current=p=>{object(p);if(own(globalThis,\""PROJECT\"")!==p)bad();};\n\ncurrent(this);const selected=fn(own(this,\""structure\""));verify();return selected;}"",""returnByValue"":false,""arguments"":[]}";
    } else
    if(phase==@"assignment-cooperation-select") {
      Need(method==@"Runtime.callFunctionOn","method");
      Keys(fields,new string[]{@"objectId"});
      parameters=@"{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":"+@""""+Handle(Field(fields,@"objectId"),256)+@""""+@",""functionDeclaration"":""function(){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nconst fn=v=>{if(typeof v!==\""function\"")bad();return v;};\nconst scope=o=>object(own(o,\""object\""));\nconst current=p=>{object(p);if(own(globalThis,\""PROJECT\"")!==p)bad();};\n\ncurrent(this);const selected=fn(own(this,\""bufferedPendDataStream\""));verify();return selected;}"",""returnByValue"":false,""arguments"":[]}";
    } else
    if(phase==@"assignment-upload-select") {
      Need(method==@"Runtime.callFunctionOn","method");
      Keys(fields,new string[]{@"objectId"});
      parameters=@"{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":"+@""""+Handle(Field(fields,@"objectId"),256)+@""""+@",""functionDeclaration"":""function(){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nconst fn=v=>{if(typeof v!==\""function\"")bad();return v;};\nconst scope=o=>object(own(o,\""object\""));\nconst current=p=>{object(p);if(own(globalThis,\""PROJECT\"")!==p)bad();};\n\ncurrent(this);const selected=fn(own(this,\""bufferedUploadCloud\""));verify();return selected;}"",""returnByValue"":false,""arguments"":[]}";
    } else
    if(phase==@"assignment-upload-structure-relation") {
      Need(method==@"Runtime.callFunctionOn","method");
      Keys(fields,new string[]{@"objectId",@"argument0",@"argument1",@"argument2"});
      parameters=@"{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":"+@""""+Handle(Field(fields,@"objectId"),256)+@""""+@",""functionDeclaration"":""function(project,wrapper,callback){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nconst fn=v=>{if(typeof v!==\""function\"")bad();return v;};\nconst scope=o=>object(own(o,\""object\""));\nconst current=p=>{object(p);if(own(globalThis,\""PROJECT\"")!==p)bad();};\n\ncurrent(project);if(own(project,\""uploadStructure\"")!==fn(wrapper))bad();\nconst s=scope(this);if(own(s,\""e\"")!==fn(callback))bad();\nverify();return true;}"",""returnByValue"":true,""arguments"":[{""objectId"":"+@""""+Handle(Field(fields,@"argument0"),256)+@""""+@"},{""objectId"":"+@""""+Handle(Field(fields,@"argument1"),256)+@""""+@"},{""objectId"":"+@""""+Handle(Field(fields,@"argument2"),256)+@""""+@"}]}";
    } else
    if(phase==@"assignment-structure-relation") {
      Need(method==@"Runtime.callFunctionOn","method");
      Keys(fields,new string[]{@"objectId",@"argument0",@"argument1",@"argument2"});
      parameters=@"{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":"+@""""+Handle(Field(fields,@"objectId"),256)+@""""+@",""functionDeclaration"":""function(project,wrapper,callback){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nconst fn=v=>{if(typeof v!==\""function\"")bad();return v;};\nconst scope=o=>object(own(o,\""object\""));\nconst current=p=>{object(p);if(own(globalThis,\""PROJECT\"")!==p)bad();};\n\ncurrent(project);if(own(project,\""structure\"")!==fn(wrapper))bad();\nconst s=scope(this);if(own(s,\""e\"")!==fn(callback))bad();\nverify();return true;}"",""returnByValue"":true,""arguments"":[{""objectId"":"+@""""+Handle(Field(fields,@"argument0"),256)+@""""+@"},{""objectId"":"+@""""+Handle(Field(fields,@"argument1"),256)+@""""+@"},{""objectId"":"+@""""+Handle(Field(fields,@"argument2"),256)+@""""+@"}]}";
    } else
    if(phase==@"assignment-cooperation-relation") {
      Need(method==@"Runtime.callFunctionOn","method");
      Keys(fields,new string[]{@"objectId",@"argument0",@"argument1",@"argument2"});
      parameters=@"{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":"+@""""+Handle(Field(fields,@"objectId"),256)+@""""+@",""functionDeclaration"":""function(project,wrapper,callback){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nconst fn=v=>{if(typeof v!==\""function\"")bad();return v;};\nconst scope=o=>object(own(o,\""object\""));\nconst current=p=>{object(p);if(own(globalThis,\""PROJECT\"")!==p)bad();};\n\ncurrent(project);if(own(project,\""bufferedPendDataStream\"")!==fn(wrapper))bad();\nconst s=scope(this);if(own(s,\""e\"")!==fn(callback))bad();if(own(s,\""t\"")!==10)bad();\nverify();return true;}"",""returnByValue"":true,""arguments"":[{""objectId"":"+@""""+Handle(Field(fields,@"argument0"),256)+@""""+@"},{""objectId"":"+@""""+Handle(Field(fields,@"argument1"),256)+@""""+@"},{""objectId"":"+@""""+Handle(Field(fields,@"argument2"),256)+@""""+@"}]}";
    } else
    if(phase==@"assignment-upload-relation") {
      Need(method==@"Runtime.callFunctionOn","method");
      Keys(fields,new string[]{@"objectId",@"argument0",@"argument1",@"argument2"});
      parameters=@"{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":"+@""""+Handle(Field(fields,@"objectId"),256)+@""""+@",""functionDeclaration"":""function(project,wrapper,callback){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nconst fn=v=>{if(typeof v!==\""function\"")bad();return v;};\nconst scope=o=>object(own(o,\""object\""));\nconst current=p=>{object(p);if(own(globalThis,\""PROJECT\"")!==p)bad();};\n\ncurrent(project);if(own(project,\""bufferedUploadCloud\"")!==fn(wrapper))bad();\nconst s=scope(this);if(own(s,\""t\"")!==fn(callback))bad();if(own(s,\""a\"")!==project||own(s,\""s\"")!==500)bad();\nverify();return true;}"",""returnByValue"":true,""arguments"":[{""objectId"":"+@""""+Handle(Field(fields,@"argument0"),256)+@""""+@"},{""objectId"":"+@""""+Handle(Field(fields,@"argument1"),256)+@""""+@"},{""objectId"":"+@""""+Handle(Field(fields,@"argument2"),256)+@""""+@"}]}";
    } else
    if(phase==@"assignment-debounce-relation") {
      Need(method==@"Runtime.callFunctionOn","method");
      Keys(fields,new string[]{@"objectId",@"argument0",@"argument1",@"argument2",@"argument3",@"argument4"});
      parameters=@"{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":"+@""""+Handle(Field(fields,@"objectId"),256)+@""""+@",""functionDeclaration"":""function(project,wrapper,serialScope,debounce,callback){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nconst fn=v=>{if(typeof v!==\""function\"")bad();return v;};\nconst scope=o=>object(own(o,\""object\""));\nconst current=p=>{object(p);if(own(globalThis,\""PROJECT\"")!==p)bad();};\n\ncurrent(project);if(own(project,\""structure\"")!==fn(wrapper)||own(scope(serialScope),\""e\"")!==fn(debounce))bad();\nconst s=scope(this);if(own(s,\""e\"")!==fn(callback)||own(s,\""t\"")!==300)bad();verify();return true;}"",""returnByValue"":true,""arguments"":[{""objectId"":"+@""""+Handle(Field(fields,@"argument0"),256)+@""""+@"},{""objectId"":"+@""""+Handle(Field(fields,@"argument1"),256)+@""""+@"},{""objectId"":"+@""""+Handle(Field(fields,@"argument2"),256)+@""""+@"},{""objectId"":"+@""""+Handle(Field(fields,@"argument3"),256)+@""""+@"},{""objectId"":"+@""""+Handle(Field(fields,@"argument4"),256)+@""""+@"}]}";
    } else
    if(phase==@"assignment-assignments-recheck") {
      Need(method==@"Runtime.callFunctionOn","method");
      Keys(fields,new string[]{@"objectId",@"argument0",@"argument1",@"argument2",@"argument3",@"argument4"});
      parameters=@"{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":"+@""""+Handle(Field(fields,@"objectId"),256)+@""""+@",""functionDeclaration"":""function(bus,uploadStructure,structure,cooperation,upload){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nconst fn=v=>{if(typeof v!==\""function\"")bad();return v;};\nconst scope=o=>object(own(o,\""object\""));\nconst current=p=>{object(p);if(own(globalThis,\""PROJECT\"")!==p)bad();};\n\ncurrent(this);if(own(this,\""workerBus\"")!==bus||own(this,\""uploadStructure\"")!==fn(uploadStructure)||\nown(this,\""structure\"")!==fn(structure)||own(this,\""bufferedPendDataStream\"")!==fn(cooperation)||\nown(this,\""bufferedUploadCloud\"")!==fn(upload))bad();verify();return true;}"",""returnByValue"":true,""arguments"":[{""objectId"":"+@""""+Handle(Field(fields,@"argument0"),256)+@""""+@"},{""objectId"":"+@""""+Handle(Field(fields,@"argument1"),256)+@""""+@"},{""objectId"":"+@""""+Handle(Field(fields,@"argument2"),256)+@""""+@"},{""objectId"":"+@""""+Handle(Field(fields,@"argument3"),256)+@""""+@"},{""objectId"":"+@""""+Handle(Field(fields,@"argument4"),256)+@""""+@"}]}";
    } else
    if(phase==@"channel-channel-relation") {
      Need(method==@"Runtime.callFunctionOn","method");
      Keys(fields,new string[]{@"objectId",@"argument0",@"argument1",@"argument2"});
      parameters=@"{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":"+@""""+Handle(Field(fields,@"objectId"),256)+@""""+@",""functionDeclaration"":""function(bus,channel,onmessage){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nif(own(globalThis,\""PROJECT\"")!==this||own(this,\""workerBus\"")!==object(bus)||own(bus,\""bc\"")!==object(channel)||typeof onmessage!==\""function\"")bad();\nif(channel.onmessage!==onmessage)bad();verify();if(channel.onmessage!==onmessage)bad();return true;}"",""returnByValue"":true,""arguments"":[{""objectId"":"+@""""+Handle(Field(fields,@"argument0"),256)+@""""+@"},{""objectId"":"+@""""+Handle(Field(fields,@"argument1"),256)+@""""+@"},{""objectId"":"+@""""+Handle(Field(fields,@"argument2"),256)+@""""+@"}]}";
    } else
    if(phase==@"channel-gate-select") {
      Need(method==@"Runtime.callFunctionOn","method");
      Keys(fields,new string[]{@"objectId"});
      parameters=@"{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":"+@""""+Handle(Field(fields,@"objectId"),256)+@""""+@",""functionDeclaration"":""function(){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nconst descriptors=[],prototypes=[];\nconst proto=o=>{const p=Object.getPrototypeOf(o);prototypes.push([o,p]);return p;};\nconst desc=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);descriptors.push([o,k,d]);return d;};\nconst absent=(o,k)=>{if(desc(o,k)!==undefined)bad();};\nconst nativeMethod=(o,k)=>{const d=desc(o,k);if(!d||!Object.hasOwn(d,\""value\"")||typeof d.value!==\""function\""||!d.writable||!d.configurable||d.enumerable)bad();return d.value;};\nconst project=object(own(globalThis,\""PROJECT\""));if(this!==project)bad();\nnamed(project,\""Lg\"");const lp=proto(project);named(lp,\""Gd\"");const gp=proto(lp);if(proto(gp)!==Object.prototype)bad();\nfor(const key of [\""isReadOnly\"",\""isV2Format\"",\""canWsPublish\""])absent(project,key);\nabsent(lp,\""isReadOnly\"");absent(lp,\""isV2Format\"");\nconst format=desc(gp,\""isV2Format\"");if(!format||Object.hasOwn(format,\""value\"")||typeof format.get!==\""function\""||typeof format.set!==\""function\""||!format.configurable||format.enumerable)bad();\nconst bus=object(own(project,\""workerBus\""));named(bus,\""JP\"");const jp=proto(bus);named(jp,\""KP\"");const kp=proto(jp);named(kp,\""Mb\"");const mp=proto(kp);if(proto(mp)!==Object.prototype)bad();\nfor(const key of [\""publish\"",\""broadcastPublish\"",\""post\"",\""onMessage\"",\""onReceivedPublish\""])absent(bus,key);\nabsent(jp,\""publish\"");absent(jp,\""onReceivedPublish\"");\nconst methods=[nativeMethod(gp,\""isReadOnly\""),format.get,nativeMethod(lp,\""canWsPublish\""),nativeMethod(kp,\""publish\""),nativeMethod(jp,\""broadcastPublish\""),nativeMethod(jp,\""post\""),nativeMethod(jp,\""onMessage\""),nativeMethod(kp,\""onReceivedPublish\"")];\nconst recheck=()=>{verify();for(const [o,p]of prototypes)if(Object.getPrototypeOf(o)!==p)bad();for(const [o,k,d]of descriptors){const n=Object.getOwnPropertyDescriptor(o,k);if(!d){if(n!==undefined)bad();continue;}if(!n||n.enumerable!==d.enumerable||n.configurable!==d.configurable||Object.hasOwn(n,\""value\"")!==Object.hasOwn(d,\""value\"")||n.value!==d.value||n.writable!==d.writable||n.get!==d.get||n.set!==d.set)bad();}};\n\nrecheck();return methods;}"",""returnByValue"":false,""arguments"":[]}";
    } else
    if(phase==@"channel-gates") {
      Need(method==@"Runtime.callFunctionOn","method");
      Keys(fields,new string[]{@"objectId",@"argument0",@"argument1"});
      parameters=@"{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":"+@""""+Handle(Field(fields,@"objectId"),256)+@""""+@",""functionDeclaration"":""function(originalMethods,gateScope){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nconst descriptors=[],prototypes=[];\nconst proto=o=>{const p=Object.getPrototypeOf(o);prototypes.push([o,p]);return p;};\nconst desc=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);descriptors.push([o,k,d]);return d;};\nconst absent=(o,k)=>{if(desc(o,k)!==undefined)bad();};\nconst nativeMethod=(o,k)=>{const d=desc(o,k);if(!d||!Object.hasOwn(d,\""value\"")||typeof d.value!==\""function\""||!d.writable||!d.configurable||d.enumerable)bad();return d.value;};\nconst project=object(own(globalThis,\""PROJECT\""));if(this!==project)bad();\nnamed(project,\""Lg\"");const lp=proto(project);named(lp,\""Gd\"");const gp=proto(lp);if(proto(gp)!==Object.prototype)bad();\nfor(const key of [\""isReadOnly\"",\""isV2Format\"",\""canWsPublish\""])absent(project,key);\nabsent(lp,\""isReadOnly\"");absent(lp,\""isV2Format\"");\nconst format=desc(gp,\""isV2Format\"");if(!format||Object.hasOwn(format,\""value\"")||typeof format.get!==\""function\""||typeof format.set!==\""function\""||!format.configurable||format.enumerable)bad();\nconst bus=object(own(project,\""workerBus\""));named(bus,\""JP\"");const jp=proto(bus);named(jp,\""KP\"");const kp=proto(jp);named(kp,\""Mb\"");const mp=proto(kp);if(proto(mp)!==Object.prototype)bad();\nfor(const key of [\""publish\"",\""broadcastPublish\"",\""post\"",\""onMessage\"",\""onReceivedPublish\""])absent(bus,key);\nabsent(jp,\""publish\"");absent(jp,\""onReceivedPublish\"");\nconst methods=[nativeMethod(gp,\""isReadOnly\""),format.get,nativeMethod(lp,\""canWsPublish\""),nativeMethod(kp,\""publish\""),nativeMethod(jp,\""broadcastPublish\""),nativeMethod(jp,\""post\""),nativeMethod(jp,\""onMessage\""),nativeMethod(kp,\""onReceivedPublish\"")];\nconst recheck=()=>{verify();for(const [o,p]of prototypes)if(Object.getPrototypeOf(o)!==p)bad();for(const [o,k,d]of descriptors){const n=Object.getOwnPropertyDescriptor(o,k);if(!d){if(n!==undefined)bad();continue;}if(!n||n.enumerable!==d.enumerable||n.configurable!==d.configurable||Object.hasOwn(n,\""value\"")!==Object.hasOwn(d,\""value\"")||n.value!==d.value||n.writable!==d.writable||n.get!==d.get||n.set!==d.set)bad();}};\n\nif(arraySize(originalMethods)!==8)bad();for(let i=0;i<8;i++)if(own(originalMethods,String(i))!==methods[i])bad();\nconst captured=object(own(gateScope,\""object\"")),privateMode=flag(own(captured,\""jr\""));\nconst syncDescriptor=desc(project,\""isSyncing\"");let syncing;\nif(syncDescriptor===undefined){for(let p=proto(project),n=0;p!==null;p=proto(p)){if(++n>8)bad();absent(p,\""isSyncing\"");}syncing={state:\""absent\"",value:null};}\nelse{const value=own(project,\""isSyncing\"");syncing=value===undefined?{state:\""undefined\"",value:null}:{state:\""boolean\"",value:flag(value)};}\nconst isTemporary=flag(own(project,\""isTemporary\"")),isHistoryBack=flag(own(project,\""isHistoryBack\"")),isV2Format=flag(own(project,\""_isV2Format\"")),isReady=flag(own(project,\""isReady\""));\nconst isReadOnly=isTemporary||isHistoryBack||isV2Format,syncingTrue=syncing.value===true;\nconst state={schema:\""easyeda-pro-control.pcb-string-worker-gates.v1\"",\nidentity:{projectUuid:id(own(project,\""uuid\""),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),branchUuid:id(own(project,\""_branchUuid\""),/^[a-f0-9]{32}$/),windowTabId:id(own(globalThis,\""_TAB_ID_\""),/^[A-Za-z0-9_-]{1,128}$/)},\nraw:{isTemporary,isHistoryBack,isV2Format,isReady,isSyncing:syncing,privateMode},\npredicates:{isReadOnly,canWsPublish:privateMode&&isReady&&!isReadOnly&&!syncingTrue,cooperationCallbackGateOpen:!isReadOnly,structureCallbackStateGateOpen:isReady&&!isReadOnly&&!syncingTrue},\nprivateModeSource:\""jr=L1.IS_PRIVATE\"",gateMethodReferencesMatched:true,\npublisher:{senderUuid:id(own(bus,\""uuid\""),/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/),methodChainReferencesMatched:true,nativeChannelVerified:false,nativeOnMessageReceiverVerified:false,completePublishersVerified:false},\nhiddenCallbackReceiversVerified:false,writeDestinationsContained:false,atomicSample:false};recheck();return JSON.stringify(state);}"",""returnByValue"":true,""arguments"":[{""objectId"":"+@""""+Handle(Field(fields,@"argument0"),256)+@""""+@"},{""objectId"":"+@""""+Handle(Field(fields,@"argument1"),256)+@""""+@"}]}";
    }
    Need(parameters!=null,"phase");
    string result="{\"id\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+",\"method\":\""+method+"\",\"params\":"+parameters+",\"sessionId\":\""+sessionId+"\"}\0";
    Need(System.Text.Encoding.UTF8.GetByteCount(result)<=65536,"size");return result;
  }
  public static void VerifySmoke() { VerifySmokeCore(false); }
  public static void Verify209Smoke() { VerifySmokeCore(true); }
  static void VerifySmokeCore(bool workerStartup209) {
    System.Collections.Hashtable fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);
    fields.Clear();

    Need(EncodeCore(1,@"Target.setAutoAttach",@"original-session",@"attach",fields,workerStartup209)==@"{""id"":1,""method"":""Target.setAutoAttach"",""params"":{""autoAttach"":true,""waitForDebuggerOnStart"":true,""flatten"":true,""filter"":[{""type"":""worker"",""exclude"":false},{""exclude"":true}]},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();

    Need(EncodeCore(1,@"Runtime.enable",@"original-session",@"runtime",fields,workerStartup209)==@"{""id"":1,""method"":""Runtime.enable"",""params"":{},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();

    Need(EncodeCore(1,@"Debugger.enable",@"original-session",@"debugger",fields,workerStartup209)==@"{""id"":1,""method"":""Debugger.enable"",""params"":{""maxScriptsCacheSize"":33554432},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();

    Need(EncodeCore(1,@"Debugger.setInstrumentationBreakpoint",@"original-session",@"instrument",fields,workerStartup209)==@"{""id"":1,""method"":""Debugger.setInstrumentationBreakpoint"",""params"":{""instrumentation"":""beforeScriptExecution""},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();

    Need(EncodeCore(1,@"Runtime.runIfWaitingForDebugger",@"original-session",@"start",fields,workerStartup209)==@"{""id"":1,""method"":""Runtime.runIfWaitingForDebugger"",""params"":{},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"scriptId",@"__startup_scriptId__");
    Need(EncodeCore(1,@"Debugger.getScriptSource",@"original-session",@"source",fields,workerStartup209)==@"{""id"":1,""method"":""Debugger.getScriptSource"",""params"":{""scriptId"":""__startup_scriptId__""},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"breakpointId",@"__startup_breakpointId__");
    Need(EncodeCore(1,@"Debugger.removeBreakpoint",@"original-session",@"remove",fields,workerStartup209)==@"{""id"":1,""method"":""Debugger.removeBreakpoint"",""params"":{""breakpointId"":""__startup_breakpointId__""},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();

    Need(EncodeCore(1,@"Debugger.resume",@"original-session",@"resume",fields,workerStartup209)==@"{""id"":1,""method"":""Debugger.resume"",""params"":{},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"objectId",@"__startup_objectId__");
    Need(EncodeCore(1,@"Runtime.getProperties",@"original-session",@"properties",fields,workerStartup209)==@"{""id"":1,""method"":""Runtime.getProperties"",""params"":{""objectId"":""__startup_objectId__"",""ownProperties"":true,""generatePreview"":false},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();

    Need(EncodeCore(1,@"Runtime.releaseObjectGroup",@"original-session",@"release",fields,workerStartup209)==@"{""id"":1,""method"":""Runtime.releaseObjectGroup"",""params"":{""objectGroup"":""easyeda-pro-control-worker-construction-v1""},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"site",@"channel");
    fields.Add(@"scriptId",@"__startup_scriptId__");
    Need(EncodeCore(1,@"Debugger.setBreakpoint",@"original-session",@"breakpoint",fields,workerStartup209)==@"{""id"":1,""method"":""Debugger.setBreakpoint"",""params"":{""location"":{""scriptId"":""__startup_scriptId__"",""lineNumber"":0,""columnNumber"":11812}},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"site",@"base");
    fields.Add(@"scriptId",@"__startup_scriptId__");
    Need(EncodeCore(1,@"Debugger.setBreakpoint",@"original-session",@"breakpoint",fields,workerStartup209)==@"{""id"":1,""method"":""Debugger.setBreakpoint"",""params"":{""location"":{""scriptId"":""__startup_scriptId__"",""lineNumber"":109,""columnNumber"":165345}},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"site",@"project");
    fields.Add(@"scriptId",@"__startup_scriptId__");
    Need(EncodeCore(1,@"Debugger.setBreakpoint",@"original-session",@"breakpoint",fields,workerStartup209)==@"{""id"":1,""method"":""Debugger.setBreakpoint"",""params"":{""location"":{""scriptId"":""__startup_scriptId__"",""lineNumber"":110,""columnNumber"":93449}},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"site",@"serial");
    fields.Add(@"scriptId",@"__startup_scriptId__");
    Need(EncodeCore(1,@"Debugger.setBreakpoint",@"original-session",@"breakpoint",fields,workerStartup209)==(workerStartup209?@"{""id"":1,""method"":""Debugger.setBreakpoint"",""params"":{""location"":{""scriptId"":""__startup_scriptId__"",""lineNumber"":108,""columnNumber"":145582}},""sessionId"":""original-session""}":@"{""id"":1,""method"":""Debugger.setBreakpoint"",""params"":{""location"":{""scriptId"":""__startup_scriptId__"",""lineNumber"":108,""columnNumber"":145558}},""sessionId"":""original-session""}")+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"site",@"cooperation");
    fields.Add(@"scriptId",@"__startup_scriptId__");
    Need(EncodeCore(1,@"Debugger.setBreakpoint",@"original-session",@"breakpoint",fields,workerStartup209)==@"{""id"":1,""method"":""Debugger.setBreakpoint"",""params"":{""location"":{""scriptId"":""__startup_scriptId__"",""lineNumber"":109,""columnNumber"":8762}},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"site",@"debounce");
    fields.Add(@"scriptId",@"__startup_scriptId__");
    Need(EncodeCore(1,@"Debugger.setBreakpoint",@"original-session",@"breakpoint",fields,workerStartup209)==@"{""id"":1,""method"":""Debugger.setBreakpoint"",""params"":{""location"":{""scriptId"":""__startup_scriptId__"",""lineNumber"":109,""columnNumber"":163871}},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"site",@"upload");
    fields.Add(@"scriptId",@"__startup_scriptId__");
    Need(EncodeCore(1,@"Debugger.setBreakpoint",@"original-session",@"breakpoint",fields,workerStartup209)==@"{""id"":1,""method"":""Debugger.setBreakpoint"",""params"":{""location"":{""scriptId"":""__startup_scriptId__"",""lineNumber"":110,""columnNumber"":15488}},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"site",@"bootstrap");
    fields.Add(@"scriptId",@"__startup_scriptId__");
    Need(EncodeCore(1,@"Debugger.setBreakpoint",@"original-session",@"breakpoint",fields,workerStartup209)==@"{""id"":1,""method"":""Debugger.setBreakpoint"",""params"":{""location"":{""scriptId"":""__startup_scriptId__"",""lineNumber"":110,""columnNumber"":162932}},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"selector",@"receiver");
    fields.Add(@"callFrameId",@"__startup_callFrameId__");
    Need(EncodeCore(1,@"Debugger.evaluateOnCallFrame",@"original-session",@"select",fields,workerStartup209)==@"{""id"":1,""method"":""Debugger.evaluateOnCallFrame"",""params"":{""callFrameId"":""__startup_callFrameId__"",""expression"":""this"",""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""returnByValue"":false,""generatePreview"":false,""throwOnSideEffect"":true,""includeCommandLineAPI"":false},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"selector",@"argument-e");
    fields.Add(@"callFrameId",@"__startup_callFrameId__");
    Need(EncodeCore(1,@"Debugger.evaluateOnCallFrame",@"original-session",@"select",fields,workerStartup209)==@"{""id"":1,""method"":""Debugger.evaluateOnCallFrame"",""params"":{""callFrameId"":""__startup_callFrameId__"",""expression"":""e"",""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""returnByValue"":false,""generatePreview"":false,""throwOnSideEffect"":true,""includeCommandLineAPI"":false},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"selector",@"argument-t");
    fields.Add(@"callFrameId",@"__startup_callFrameId__");
    Need(EncodeCore(1,@"Debugger.evaluateOnCallFrame",@"original-session",@"select",fields,workerStartup209)==@"{""id"":1,""method"":""Debugger.evaluateOnCallFrame"",""params"":{""callFrameId"":""__startup_callFrameId__"",""expression"":""t"",""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""returnByValue"":false,""generatePreview"":false,""throwOnSideEffect"":true,""includeCommandLineAPI"":false},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"selector",@"channel");
    fields.Add(@"callFrameId",@"__startup_callFrameId__");
    Need(EncodeCore(1,@"Debugger.evaluateOnCallFrame",@"original-session",@"select",fields,workerStartup209)==@"{""id"":1,""method"":""Debugger.evaluateOnCallFrame"",""params"":{""callFrameId"":""__startup_callFrameId__"",""expression"":""this.bc"",""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""returnByValue"":false,""generatePreview"":false,""throwOnSideEffect"":true,""includeCommandLineAPI"":false},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"selector",@"onmessage");
    fields.Add(@"callFrameId",@"__startup_callFrameId__");
    Need(EncodeCore(1,@"Debugger.evaluateOnCallFrame",@"original-session",@"select",fields,workerStartup209)==@"{""id"":1,""method"":""Debugger.evaluateOnCallFrame"",""params"":{""callFrameId"":""__startup_callFrameId__"",""expression"":""this.bc.onmessage"",""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""returnByValue"":false,""generatePreview"":false,""throwOnSideEffect"":true,""includeCommandLineAPI"":false},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"objectId",@"__startup_objectId__");
    fields.Add(@"argument0",@"__startup_argument0__");
    Need(EncodeCore(1,@"Runtime.callFunctionOn",@"original-session",@"same",fields,workerStartup209)==@"{""id"":1,""method"":""Runtime.callFunctionOn"",""params"":{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":""__startup_objectId__"",""functionDeclaration"":""function(other){\""use strict\"";return this===other;}"",""returnByValue"":true,""arguments"":[{""objectId"":""__startup_argument0__""}]},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"objectId",@"__startup_objectId__");
    fields.Add(@"argument0",@"__startup_argument0__");
    Need(EncodeCore(1,@"Runtime.callFunctionOn",@"original-session",@"project",fields,workerStartup209)==@"{""id"":1,""method"":""Runtime.callFunctionOn"",""params"":{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":""__startup_objectId__"",""functionDeclaration"":""function(bus){\""use strict\"";const own=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))throw new Error(\""WORKER_CONSTRUCTION_MEMBER\"");return d.value;};return own(globalThis,\""PROJECT\"")===this&&own(this,\""workerBus\"")===bus;}"",""returnByValue"":true,""arguments"":[{""objectId"":""__startup_argument0__""}]},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"objectId",@"__startup_objectId__");
    fields.Add(@"argument0",@"__startup_argument0__");
    Need(EncodeCore(1,@"Runtime.callFunctionOn",@"original-session",@"identity",fields,workerStartup209)==@"{""id"":1,""method"":""Runtime.callFunctionOn"",""params"":{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":""__startup_objectId__"",""functionDeclaration"":""function(bus){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""WORKER_CONSTRUCTION_IDENTITY\"");};\nconst retained=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();retained.push([o,k,d.value]);return d.value;};\nconst id=(v,re)=>{const m=typeof v===\""string\""?re.exec(v):null;if(m===null||m[0]!==v)bad();return v;};\nif(own(globalThis,\""PROJECT\"")!==this||own(this,\""workerBus\"")!==bus)bad();\nconst identity={projectUuid:id(own(this,\""uuid\""),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),branchUuid:id(own(this,\""_branchUuid\""),/^[a-f0-9]{32}$/),windowTabId:id(own(globalThis,\""_TAB_ID_\""),/^[A-Za-z0-9_-]{1,128}$/)};\nfor(const [o,k,v]of retained){const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\"")||d.value!==v)bad();}\nreturn identity;}"",""returnByValue"":true,""arguments"":[{""objectId"":""__startup_argument0__""}]},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"objectId",@"__startup_objectId__");
    fields.Add(@"argument0",@"__startup_argument0__");
    Need(EncodeCore(1,@"Runtime.callFunctionOn",@"original-session",@"actor-clock",fields,workerStartup209)==@"{""id"":1,""method"":""Runtime.callFunctionOn"",""params"":{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":""__startup_objectId__"",""functionDeclaration"":""function(bus){\n\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nconst root=globalThis,apply=Reflect.apply;\nconst exactId=(v,re)=>{const m=typeof v===\""string\""?re.exec(v):null;if(m===null||m[0]!==v)bad();return v;};\nconst text=(v,max)=>{if(typeof v!==\""string\""||v.length>max||!v.isWellFormed())bad();return v;};\nconst actor=o=>({uuid:exactId(own(o,\""uuid\""),/^[a-f0-9]{32}$/),username:text(own(o,\""username\""),1024),nickname:text(own(o,\""nickname\""),1024)});\nconst nativeDate=own(root,\""Date\""),now=own(nativeDate,\""now\""),datePrototype=own(nativeDate,\""prototype\""),iso=own(datePrototype,\""toISOString\""),zone=own(datePrototype,\""getTimezoneOffset\"");\nif([nativeDate,now,iso,zone].some(v=>typeof v!==\""function\""))bad();\nconst stamp=()=>{verify();const milliseconds=apply(now,nativeDate,[]);if(!Number.isSafeInteger(milliseconds)||milliseconds<0||milliseconds>8640000000000000||Object.is(milliseconds,-0))bad();const date=new nativeDate(milliseconds),timezoneOffsetMinutes=apply(zone,date,[]);if(!Number.isSafeInteger(timezoneOffsetMinutes)||Math.abs(timezoneOffsetMinutes)>840||Object.is(timezoneOffsetMinutes,-0))bad();return{milliseconds,iso:apply(iso,date,[]),timezoneOffsetMinutes};};\nconst before=stamp();\nconst finish=()=>{const after=stamp();verify();if(after.milliseconds<before.milliseconds||after.milliseconds-before.milliseconds>1000||after.timezoneOffsetMinutes!==before.timezoneOffsetMinutes)bad();return{before,after};};\n\nconst project=named(this,\""Lg\""),pp=Object.getPrototypeOf(project),gp=Object.getPrototypeOf(pp);\nif(own(root,\""PROJECT\"")!==project||own(project,\""workerBus\"")!==bus||own(own(gp,\""constructor\""),\""name\"")!==\""Gd\""||Object.getPrototypeOf(gp)!==Object.prototype||own(project,\""_isV2Format\"")!==false)bad();\nconst identity={projectUuid:exactId(own(project,\""uuid\""),/^[a-f0-9]{64}$/),branchUuid:exactId(own(project,\""_branchUuid\""),/^[a-f0-9]{32}$/),windowTabId:exactId(own(root,\""_TAB_ID_\""),/^[A-Za-z0-9_-]{1,128}$/)};\nconst source=plain(own(project,\""user\"")),order=Reflect.ownKeys(source);\nif(order.length!==4||order.some(k=>typeof k!==\""string\""||![\""uuid\"",\""nickname\"",\""username\"",\""avatar\""].includes(k)))bad();\nconst projected=actor(source),avatar=text(own(source,\""avatar\""),4096),workerUser={};\nfor(const key of order){const d=Object.getOwnPropertyDescriptor(source,key);if(!d||d.enumerable!==true)bad();workerUser[key]=key===\""avatar\""?avatar:projected[key];}\nconst clock=finish();\nif(Object.getPrototypeOf(project)!==pp||Object.getPrototypeOf(pp)!==gp||Object.getPrototypeOf(gp)!==Object.prototype||Reflect.ownKeys(source).join(\"",\"")!==order.join(\"",\""))bad();\nfor(const key of order){const d=Object.getOwnPropertyDescriptor(source,key);if(!d||!Object.hasOwn(d,\""value\"")||d.enumerable!==true)bad();}\nverify();\nreturn JSON.stringify({schema:\""easyeda-pro-control.pcb-worker-startup-actor.v1\"",phase:\""worker\"",identity,originalProjectReceiverMatched:true,originalWorkerBusMatched:true,workerUser,workerUserText:JSON.stringify(workerUser),clock});\n}"",""returnByValue"":true,""arguments"":[{""objectId"":""__startup_argument0__""}]},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"objectId",@"__startup_objectId__");
    Need(EncodeCore(1,@"Runtime.callFunctionOn",@"original-session",@"assignment-upload-structure-select",fields,workerStartup209)==@"{""id"":1,""method"":""Runtime.callFunctionOn"",""params"":{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":""__startup_objectId__"",""functionDeclaration"":""function(){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nconst fn=v=>{if(typeof v!==\""function\"")bad();return v;};\nconst scope=o=>object(own(o,\""object\""));\nconst current=p=>{object(p);if(own(globalThis,\""PROJECT\"")!==p)bad();};\n\ncurrent(this);const selected=fn(own(this,\""uploadStructure\""));verify();return selected;}"",""returnByValue"":false,""arguments"":[]},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"objectId",@"__startup_objectId__");
    Need(EncodeCore(1,@"Runtime.callFunctionOn",@"original-session",@"assignment-structure-select",fields,workerStartup209)==@"{""id"":1,""method"":""Runtime.callFunctionOn"",""params"":{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":""__startup_objectId__"",""functionDeclaration"":""function(){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nconst fn=v=>{if(typeof v!==\""function\"")bad();return v;};\nconst scope=o=>object(own(o,\""object\""));\nconst current=p=>{object(p);if(own(globalThis,\""PROJECT\"")!==p)bad();};\n\ncurrent(this);const selected=fn(own(this,\""structure\""));verify();return selected;}"",""returnByValue"":false,""arguments"":[]},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"objectId",@"__startup_objectId__");
    Need(EncodeCore(1,@"Runtime.callFunctionOn",@"original-session",@"assignment-cooperation-select",fields,workerStartup209)==@"{""id"":1,""method"":""Runtime.callFunctionOn"",""params"":{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":""__startup_objectId__"",""functionDeclaration"":""function(){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nconst fn=v=>{if(typeof v!==\""function\"")bad();return v;};\nconst scope=o=>object(own(o,\""object\""));\nconst current=p=>{object(p);if(own(globalThis,\""PROJECT\"")!==p)bad();};\n\ncurrent(this);const selected=fn(own(this,\""bufferedPendDataStream\""));verify();return selected;}"",""returnByValue"":false,""arguments"":[]},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"objectId",@"__startup_objectId__");
    Need(EncodeCore(1,@"Runtime.callFunctionOn",@"original-session",@"assignment-upload-select",fields,workerStartup209)==@"{""id"":1,""method"":""Runtime.callFunctionOn"",""params"":{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":""__startup_objectId__"",""functionDeclaration"":""function(){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nconst fn=v=>{if(typeof v!==\""function\"")bad();return v;};\nconst scope=o=>object(own(o,\""object\""));\nconst current=p=>{object(p);if(own(globalThis,\""PROJECT\"")!==p)bad();};\n\ncurrent(this);const selected=fn(own(this,\""bufferedUploadCloud\""));verify();return selected;}"",""returnByValue"":false,""arguments"":[]},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"objectId",@"__startup_objectId__");
    fields.Add(@"argument0",@"__startup_argument0__");
    fields.Add(@"argument1",@"__startup_argument1__");
    fields.Add(@"argument2",@"__startup_argument2__");
    Need(EncodeCore(1,@"Runtime.callFunctionOn",@"original-session",@"assignment-upload-structure-relation",fields,workerStartup209)==@"{""id"":1,""method"":""Runtime.callFunctionOn"",""params"":{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":""__startup_objectId__"",""functionDeclaration"":""function(project,wrapper,callback){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nconst fn=v=>{if(typeof v!==\""function\"")bad();return v;};\nconst scope=o=>object(own(o,\""object\""));\nconst current=p=>{object(p);if(own(globalThis,\""PROJECT\"")!==p)bad();};\n\ncurrent(project);if(own(project,\""uploadStructure\"")!==fn(wrapper))bad();\nconst s=scope(this);if(own(s,\""e\"")!==fn(callback))bad();\nverify();return true;}"",""returnByValue"":true,""arguments"":[{""objectId"":""__startup_argument0__""},{""objectId"":""__startup_argument1__""},{""objectId"":""__startup_argument2__""}]},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"objectId",@"__startup_objectId__");
    fields.Add(@"argument0",@"__startup_argument0__");
    fields.Add(@"argument1",@"__startup_argument1__");
    fields.Add(@"argument2",@"__startup_argument2__");
    Need(EncodeCore(1,@"Runtime.callFunctionOn",@"original-session",@"assignment-structure-relation",fields,workerStartup209)==@"{""id"":1,""method"":""Runtime.callFunctionOn"",""params"":{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":""__startup_objectId__"",""functionDeclaration"":""function(project,wrapper,callback){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nconst fn=v=>{if(typeof v!==\""function\"")bad();return v;};\nconst scope=o=>object(own(o,\""object\""));\nconst current=p=>{object(p);if(own(globalThis,\""PROJECT\"")!==p)bad();};\n\ncurrent(project);if(own(project,\""structure\"")!==fn(wrapper))bad();\nconst s=scope(this);if(own(s,\""e\"")!==fn(callback))bad();\nverify();return true;}"",""returnByValue"":true,""arguments"":[{""objectId"":""__startup_argument0__""},{""objectId"":""__startup_argument1__""},{""objectId"":""__startup_argument2__""}]},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"objectId",@"__startup_objectId__");
    fields.Add(@"argument0",@"__startup_argument0__");
    fields.Add(@"argument1",@"__startup_argument1__");
    fields.Add(@"argument2",@"__startup_argument2__");
    Need(EncodeCore(1,@"Runtime.callFunctionOn",@"original-session",@"assignment-cooperation-relation",fields,workerStartup209)==@"{""id"":1,""method"":""Runtime.callFunctionOn"",""params"":{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":""__startup_objectId__"",""functionDeclaration"":""function(project,wrapper,callback){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nconst fn=v=>{if(typeof v!==\""function\"")bad();return v;};\nconst scope=o=>object(own(o,\""object\""));\nconst current=p=>{object(p);if(own(globalThis,\""PROJECT\"")!==p)bad();};\n\ncurrent(project);if(own(project,\""bufferedPendDataStream\"")!==fn(wrapper))bad();\nconst s=scope(this);if(own(s,\""e\"")!==fn(callback))bad();if(own(s,\""t\"")!==10)bad();\nverify();return true;}"",""returnByValue"":true,""arguments"":[{""objectId"":""__startup_argument0__""},{""objectId"":""__startup_argument1__""},{""objectId"":""__startup_argument2__""}]},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"objectId",@"__startup_objectId__");
    fields.Add(@"argument0",@"__startup_argument0__");
    fields.Add(@"argument1",@"__startup_argument1__");
    fields.Add(@"argument2",@"__startup_argument2__");
    Need(EncodeCore(1,@"Runtime.callFunctionOn",@"original-session",@"assignment-upload-relation",fields,workerStartup209)==@"{""id"":1,""method"":""Runtime.callFunctionOn"",""params"":{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":""__startup_objectId__"",""functionDeclaration"":""function(project,wrapper,callback){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nconst fn=v=>{if(typeof v!==\""function\"")bad();return v;};\nconst scope=o=>object(own(o,\""object\""));\nconst current=p=>{object(p);if(own(globalThis,\""PROJECT\"")!==p)bad();};\n\ncurrent(project);if(own(project,\""bufferedUploadCloud\"")!==fn(wrapper))bad();\nconst s=scope(this);if(own(s,\""t\"")!==fn(callback))bad();if(own(s,\""a\"")!==project||own(s,\""s\"")!==500)bad();\nverify();return true;}"",""returnByValue"":true,""arguments"":[{""objectId"":""__startup_argument0__""},{""objectId"":""__startup_argument1__""},{""objectId"":""__startup_argument2__""}]},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"objectId",@"__startup_objectId__");
    fields.Add(@"argument0",@"__startup_argument0__");
    fields.Add(@"argument1",@"__startup_argument1__");
    fields.Add(@"argument2",@"__startup_argument2__");
    fields.Add(@"argument3",@"__startup_argument3__");
    fields.Add(@"argument4",@"__startup_argument4__");
    Need(EncodeCore(1,@"Runtime.callFunctionOn",@"original-session",@"assignment-debounce-relation",fields,workerStartup209)==@"{""id"":1,""method"":""Runtime.callFunctionOn"",""params"":{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":""__startup_objectId__"",""functionDeclaration"":""function(project,wrapper,serialScope,debounce,callback){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nconst fn=v=>{if(typeof v!==\""function\"")bad();return v;};\nconst scope=o=>object(own(o,\""object\""));\nconst current=p=>{object(p);if(own(globalThis,\""PROJECT\"")!==p)bad();};\n\ncurrent(project);if(own(project,\""structure\"")!==fn(wrapper)||own(scope(serialScope),\""e\"")!==fn(debounce))bad();\nconst s=scope(this);if(own(s,\""e\"")!==fn(callback)||own(s,\""t\"")!==300)bad();verify();return true;}"",""returnByValue"":true,""arguments"":[{""objectId"":""__startup_argument0__""},{""objectId"":""__startup_argument1__""},{""objectId"":""__startup_argument2__""},{""objectId"":""__startup_argument3__""},{""objectId"":""__startup_argument4__""}]},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"objectId",@"__startup_objectId__");
    fields.Add(@"argument0",@"__startup_argument0__");
    fields.Add(@"argument1",@"__startup_argument1__");
    fields.Add(@"argument2",@"__startup_argument2__");
    fields.Add(@"argument3",@"__startup_argument3__");
    fields.Add(@"argument4",@"__startup_argument4__");
    Need(EncodeCore(1,@"Runtime.callFunctionOn",@"original-session",@"assignment-assignments-recheck",fields,workerStartup209)==@"{""id"":1,""method"":""Runtime.callFunctionOn"",""params"":{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":""__startup_objectId__"",""functionDeclaration"":""function(bus,uploadStructure,structure,cooperation,upload){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nconst fn=v=>{if(typeof v!==\""function\"")bad();return v;};\nconst scope=o=>object(own(o,\""object\""));\nconst current=p=>{object(p);if(own(globalThis,\""PROJECT\"")!==p)bad();};\n\ncurrent(this);if(own(this,\""workerBus\"")!==bus||own(this,\""uploadStructure\"")!==fn(uploadStructure)||\nown(this,\""structure\"")!==fn(structure)||own(this,\""bufferedPendDataStream\"")!==fn(cooperation)||\nown(this,\""bufferedUploadCloud\"")!==fn(upload))bad();verify();return true;}"",""returnByValue"":true,""arguments"":[{""objectId"":""__startup_argument0__""},{""objectId"":""__startup_argument1__""},{""objectId"":""__startup_argument2__""},{""objectId"":""__startup_argument3__""},{""objectId"":""__startup_argument4__""}]},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"objectId",@"__startup_objectId__");
    fields.Add(@"argument0",@"__startup_argument0__");
    fields.Add(@"argument1",@"__startup_argument1__");
    fields.Add(@"argument2",@"__startup_argument2__");
    Need(EncodeCore(1,@"Runtime.callFunctionOn",@"original-session",@"channel-channel-relation",fields,workerStartup209)==@"{""id"":1,""method"":""Runtime.callFunctionOn"",""params"":{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":""__startup_objectId__"",""functionDeclaration"":""function(bus,channel,onmessage){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nif(own(globalThis,\""PROJECT\"")!==this||own(this,\""workerBus\"")!==object(bus)||own(bus,\""bc\"")!==object(channel)||typeof onmessage!==\""function\"")bad();\nif(channel.onmessage!==onmessage)bad();verify();if(channel.onmessage!==onmessage)bad();return true;}"",""returnByValue"":true,""arguments"":[{""objectId"":""__startup_argument0__""},{""objectId"":""__startup_argument1__""},{""objectId"":""__startup_argument2__""}]},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"objectId",@"__startup_objectId__");
    Need(EncodeCore(1,@"Runtime.callFunctionOn",@"original-session",@"channel-gate-select",fields,workerStartup209)==@"{""id"":1,""method"":""Runtime.callFunctionOn"",""params"":{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":""__startup_objectId__"",""functionDeclaration"":""function(){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nconst descriptors=[],prototypes=[];\nconst proto=o=>{const p=Object.getPrototypeOf(o);prototypes.push([o,p]);return p;};\nconst desc=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);descriptors.push([o,k,d]);return d;};\nconst absent=(o,k)=>{if(desc(o,k)!==undefined)bad();};\nconst nativeMethod=(o,k)=>{const d=desc(o,k);if(!d||!Object.hasOwn(d,\""value\"")||typeof d.value!==\""function\""||!d.writable||!d.configurable||d.enumerable)bad();return d.value;};\nconst project=object(own(globalThis,\""PROJECT\""));if(this!==project)bad();\nnamed(project,\""Lg\"");const lp=proto(project);named(lp,\""Gd\"");const gp=proto(lp);if(proto(gp)!==Object.prototype)bad();\nfor(const key of [\""isReadOnly\"",\""isV2Format\"",\""canWsPublish\""])absent(project,key);\nabsent(lp,\""isReadOnly\"");absent(lp,\""isV2Format\"");\nconst format=desc(gp,\""isV2Format\"");if(!format||Object.hasOwn(format,\""value\"")||typeof format.get!==\""function\""||typeof format.set!==\""function\""||!format.configurable||format.enumerable)bad();\nconst bus=object(own(project,\""workerBus\""));named(bus,\""JP\"");const jp=proto(bus);named(jp,\""KP\"");const kp=proto(jp);named(kp,\""Mb\"");const mp=proto(kp);if(proto(mp)!==Object.prototype)bad();\nfor(const key of [\""publish\"",\""broadcastPublish\"",\""post\"",\""onMessage\"",\""onReceivedPublish\""])absent(bus,key);\nabsent(jp,\""publish\"");absent(jp,\""onReceivedPublish\"");\nconst methods=[nativeMethod(gp,\""isReadOnly\""),format.get,nativeMethod(lp,\""canWsPublish\""),nativeMethod(kp,\""publish\""),nativeMethod(jp,\""broadcastPublish\""),nativeMethod(jp,\""post\""),nativeMethod(jp,\""onMessage\""),nativeMethod(kp,\""onReceivedPublish\"")];\nconst recheck=()=>{verify();for(const [o,p]of prototypes)if(Object.getPrototypeOf(o)!==p)bad();for(const [o,k,d]of descriptors){const n=Object.getOwnPropertyDescriptor(o,k);if(!d){if(n!==undefined)bad();continue;}if(!n||n.enumerable!==d.enumerable||n.configurable!==d.configurable||Object.hasOwn(n,\""value\"")!==Object.hasOwn(d,\""value\"")||n.value!==d.value||n.writable!==d.writable||n.get!==d.get||n.set!==d.set)bad();}};\n\nrecheck();return methods;}"",""returnByValue"":false,""arguments"":[]},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();
    fields.Add(@"objectId",@"__startup_objectId__");
    fields.Add(@"argument0",@"__startup_argument0__");
    fields.Add(@"argument1",@"__startup_argument1__");
    Need(EncodeCore(1,@"Runtime.callFunctionOn",@"original-session",@"channel-gates",fields,workerStartup209)==@"{""id"":1,""method"":""Runtime.callFunctionOn"",""params"":{""objectGroup"":""easyeda-pro-control-worker-construction-v1"",""silent"":true,""generatePreview"":false,""throwOnSideEffect"":true,""awaitPromise"":false,""userGesture"":false,""objectId"":""__startup_objectId__"",""functionDeclaration"":""function(originalMethods,gateScope){\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nconst descriptors=[],prototypes=[];\nconst proto=o=>{const p=Object.getPrototypeOf(o);prototypes.push([o,p]);return p;};\nconst desc=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);descriptors.push([o,k,d]);return d;};\nconst absent=(o,k)=>{if(desc(o,k)!==undefined)bad();};\nconst nativeMethod=(o,k)=>{const d=desc(o,k);if(!d||!Object.hasOwn(d,\""value\"")||typeof d.value!==\""function\""||!d.writable||!d.configurable||d.enumerable)bad();return d.value;};\nconst project=object(own(globalThis,\""PROJECT\""));if(this!==project)bad();\nnamed(project,\""Lg\"");const lp=proto(project);named(lp,\""Gd\"");const gp=proto(lp);if(proto(gp)!==Object.prototype)bad();\nfor(const key of [\""isReadOnly\"",\""isV2Format\"",\""canWsPublish\""])absent(project,key);\nabsent(lp,\""isReadOnly\"");absent(lp,\""isV2Format\"");\nconst format=desc(gp,\""isV2Format\"");if(!format||Object.hasOwn(format,\""value\"")||typeof format.get!==\""function\""||typeof format.set!==\""function\""||!format.configurable||format.enumerable)bad();\nconst bus=object(own(project,\""workerBus\""));named(bus,\""JP\"");const jp=proto(bus);named(jp,\""KP\"");const kp=proto(jp);named(kp,\""Mb\"");const mp=proto(kp);if(proto(mp)!==Object.prototype)bad();\nfor(const key of [\""publish\"",\""broadcastPublish\"",\""post\"",\""onMessage\"",\""onReceivedPublish\""])absent(bus,key);\nabsent(jp,\""publish\"");absent(jp,\""onReceivedPublish\"");\nconst methods=[nativeMethod(gp,\""isReadOnly\""),format.get,nativeMethod(lp,\""canWsPublish\""),nativeMethod(kp,\""publish\""),nativeMethod(jp,\""broadcastPublish\""),nativeMethod(jp,\""post\""),nativeMethod(jp,\""onMessage\""),nativeMethod(kp,\""onReceivedPublish\"")];\nconst recheck=()=>{verify();for(const [o,p]of prototypes)if(Object.getPrototypeOf(o)!==p)bad();for(const [o,k,d]of descriptors){const n=Object.getOwnPropertyDescriptor(o,k);if(!d){if(n!==undefined)bad();continue;}if(!n||n.enumerable!==d.enumerable||n.configurable!==d.configurable||Object.hasOwn(n,\""value\"")!==Object.hasOwn(d,\""value\"")||n.value!==d.value||n.writable!==d.writable||n.get!==d.get||n.set!==d.set)bad();}};\n\nif(arraySize(originalMethods)!==8)bad();for(let i=0;i<8;i++)if(own(originalMethods,String(i))!==methods[i])bad();\nconst captured=object(own(gateScope,\""object\"")),privateMode=flag(own(captured,\""jr\""));\nconst syncDescriptor=desc(project,\""isSyncing\"");let syncing;\nif(syncDescriptor===undefined){for(let p=proto(project),n=0;p!==null;p=proto(p)){if(++n>8)bad();absent(p,\""isSyncing\"");}syncing={state:\""absent\"",value:null};}\nelse{const value=own(project,\""isSyncing\"");syncing=value===undefined?{state:\""undefined\"",value:null}:{state:\""boolean\"",value:flag(value)};}\nconst isTemporary=flag(own(project,\""isTemporary\"")),isHistoryBack=flag(own(project,\""isHistoryBack\"")),isV2Format=flag(own(project,\""_isV2Format\"")),isReady=flag(own(project,\""isReady\""));\nconst isReadOnly=isTemporary||isHistoryBack||isV2Format,syncingTrue=syncing.value===true;\nconst state={schema:\""easyeda-pro-control.pcb-string-worker-gates.v1\"",\nidentity:{projectUuid:id(own(project,\""uuid\""),/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/),branchUuid:id(own(project,\""_branchUuid\""),/^[a-f0-9]{32}$/),windowTabId:id(own(globalThis,\""_TAB_ID_\""),/^[A-Za-z0-9_-]{1,128}$/)},\nraw:{isTemporary,isHistoryBack,isV2Format,isReady,isSyncing:syncing,privateMode},\npredicates:{isReadOnly,canWsPublish:privateMode&&isReady&&!isReadOnly&&!syncingTrue,cooperationCallbackGateOpen:!isReadOnly,structureCallbackStateGateOpen:isReady&&!isReadOnly&&!syncingTrue},\nprivateModeSource:\""jr=L1.IS_PRIVATE\"",gateMethodReferencesMatched:true,\npublisher:{senderUuid:id(own(bus,\""uuid\""),/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/),methodChainReferencesMatched:true,nativeChannelVerified:false,nativeOnMessageReceiverVerified:false,completePublishersVerified:false},\nhiddenCallbackReceiversVerified:false,writeDestinationsContained:false,atomicSample:false};recheck();return JSON.stringify(state);}"",""returnByValue"":true,""arguments"":[{""objectId"":""__startup_argument0__""},{""objectId"":""__startup_argument1__""}]},""sessionId"":""original-session""}"+"\0","smoke-parity");
    fields.Clear();

    Need(EasyedaDiagnosticOwner.WorkerStartupParentProtocolMessage(256,@"Target.getTargets",@"targets",fields)==@"{""id"":256,""method"":""Target.getTargets"",""params"":{}}"+"\0","smoke-parent-parity");
    fields.Clear();
    fields.Add(@"sessionId",@"original-session");
    Need(EasyedaDiagnosticOwner.WorkerStartupParentProtocolMessage(256,@"Page.getFrameTree",@"frames",fields)==@"{""id"":256,""method"":""Page.getFrameTree"",""params"":{},""sessionId"":""original-session""}"+"\0","smoke-parent-parity");
    fields.Clear();
    fields.Add(@"sessionId",@"original-session");
    fields.Add(@"frameId",@"original-frame");
    Need(EasyedaDiagnosticOwner.WorkerStartupParentProtocolMessage(256,@"DOM.getFrameOwner",@"frame-owner",fields)==@"{""id"":256,""method"":""DOM.getFrameOwner"",""params"":{""frameId"":""original-frame""},""sessionId"":""original-session""}"+"\0","smoke-parent-parity");
    fields.Clear();
    fields.Add(@"sessionId",@"original-session");
    fields.Add(@"backendNodeId",42);
    Need(EasyedaDiagnosticOwner.WorkerStartupParentProtocolMessage(256,@"DOM.describeNode",@"describe-owner",fields)==@"{""id"":256,""method"":""DOM.describeNode"",""params"":{""backendNodeId"":42,""depth"":0,""pierce"":false},""sessionId"":""original-session""}"+"\0","smoke-parent-parity");
    fields.Clear();
    fields.Add(@"sessionId",@"original-session");
    fields.Add(@"scriptId",@"original-pcb-script");
    Need(EasyedaDiagnosticOwner.WorkerStartupParentProtocolMessage(256,@"Debugger.getScriptSource",@"pcb-source",fields)==@"{""id"":256,""method"":""Debugger.getScriptSource"",""params"":{""scriptId"":""original-pcb-script""},""sessionId"":""original-session""}"+"\0","smoke-parent-parity");
    fields.Clear();
    fields.Add(@"sessionId",@"original-session");
    fields.Add(@"uniqueContextId",@"original-context");
    Need(EasyedaDiagnosticOwner.WorkerStartupParentProtocolMessage(256,@"Runtime.callFunctionOn",@"actor-clock",fields)==@"{""id"":256,""method"":""Runtime.callFunctionOn"",""params"":{""functionDeclaration"":""function(){\n\n\""use strict\"";\nconst bad=()=>{throw new Error(\""PCB_STRING_OBSERVATION_STATE\"");};\nconst retained=[],collections=[];\nconst own=(o,k)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\""value\""))bad();if(retained.length>=2048)bad();retained.push([o,k,d.value]);return d.value;};\nconst object=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o))bad();return o;};\nconst plain=o=>{object(o);const p=Object.getPrototypeOf(o);if(p!==Object.prototype&&p!==null)bad();return o;};\nconst marker=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}retained.push([o,k]);return \""absent\"";}const v=own(o,k);return v===undefined?\""undefined\"":v===null?\""null\"":\""present\"";};\nconst count=n=>{if(!Number.isSafeInteger(n)||Object.is(n,-0)||n<0||n>65536)bad();return n;};\nconst flag=v=>{if(typeof v!==\""boolean\"")bad();return v;};\nconst id=(v,re)=>{if(typeof v!==\""string\""||v.length>128||!re.test(v))bad();return v;};\nconst keys=o=>{plain(o);const k=Reflect.ownKeys(o);if(k.length>65536||k.some(v=>typeof v!==\""string\""))bad();return k;};\nconst emptyObject=o=>{if(keys(o).length!==0)bad();return [];};\nconst size=(o,p)=>{object(o);if(Object.getPrototypeOf(o)!==p||Reflect.ownKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,\""size\"");if(!d||typeof d.get!==\""function\""||d.set!==undefined)bad();const n=count(Reflect.apply(d.get,o,[]));collections.push([o,p,d.get,n]);return n;};\nconst emptyMap=o=>{if(size(o,Map.prototype)!==0)bad();return [];};\nconst emptySet=o=>{if(size(o,Set.prototype)!==0)bad();return [];};\nconst arraySize=o=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype)bad();const n=count(own(o,\""length\"")),k=Reflect.ownKeys(o);if(k.length!==n+1||k[n]!==\""length\"")bad();for(let i=0;i<n;i++)own(o,String(i));return n;};\nconst named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,\""constructor\"");if(typeof c!==\""function\""||own(c,\""name\"")!==name||own(c,\""prototype\"")!==p)bad();return o;};\nconst verify=()=>{for(const item of retained){const d=Object.getOwnPropertyDescriptor(item[0],item[1]);if(item.length===2?d!==undefined:!d||!Object.hasOwn(d,\""value\"")||d.value!==item[2])bad();}for(const item of collections){if(Object.getPrototypeOf(item[0])!==item[1]||Reflect.ownKeys(item[0]).length!==0||Reflect.apply(item[2],item[0],[])!==item[3])bad();}};\n\nconst root=globalThis,apply=Reflect.apply;\nconst exactId=(v,re)=>{const m=typeof v===\""string\""?re.exec(v):null;if(m===null||m[0]!==v)bad();return v;};\nconst text=(v,max)=>{if(typeof v!==\""string\""||v.length>max||!v.isWellFormed())bad();return v;};\nconst actor=o=>({uuid:exactId(own(o,\""uuid\""),/^[a-f0-9]{32}$/),username:text(own(o,\""username\""),1024),nickname:text(own(o,\""nickname\""),1024)});\nconst nativeDate=own(root,\""Date\""),now=own(nativeDate,\""now\""),datePrototype=own(nativeDate,\""prototype\""),iso=own(datePrototype,\""toISOString\""),zone=own(datePrototype,\""getTimezoneOffset\"");\nif([nativeDate,now,iso,zone].some(v=>typeof v!==\""function\""))bad();\nconst stamp=()=>{verify();const milliseconds=apply(now,nativeDate,[]);if(!Number.isSafeInteger(milliseconds)||milliseconds<0||milliseconds>8640000000000000||Object.is(milliseconds,-0))bad();const date=new nativeDate(milliseconds),timezoneOffsetMinutes=apply(zone,date,[]);if(!Number.isSafeInteger(timezoneOffsetMinutes)||Math.abs(timezoneOffsetMinutes)>840||Object.is(timezoneOffsetMinutes,-0))bad();return{milliseconds,iso:apply(iso,date,[]),timezoneOffsetMinutes};};\nconst before=stamp();\nconst finish=()=>{const after=stamp();verify();if(after.milliseconds<before.milliseconds||after.milliseconds-before.milliseconds>1000||after.timezoneOffsetMinutes!==before.timezoneOffsetMinutes)bad();return{before,after};};\n\nconst host=object(own(root,\""gVars\"")),ui=object(own(root,\""UI\"")),project=object(own(host,\""currentProject\""));\nif(own(ui,\""gVars\"")!==host||own(project,\""isV2Format\"")!==false||own(host,\""isHistoryMode\"")!==false)bad();\nconst identity={projectUuid:exactId(own(project,\""projectId\""),/^[a-f0-9]{64}$/),branchUuid:exactId(own(project,\""branchUuid\""),/^[a-f0-9]{32}$/),windowTabId:exactId(own(root,\""_TAB_ID_\""),/^[A-Za-z0-9_-]{1,128}$/)};\nconst cached=object(own(object(own(host,\""globalVariableCookieData\"")),\""userInfo\"")),startup=object(own(host,\""loginedUserInfo\""));\nconst cachedActor=actor(cached),startupActor=actor(startup);\nif(JSON.stringify(cachedActor)!==JSON.stringify(startupActor))bad();\nconst workerUser={uuid:startupActor.uuid,nickname:startupActor.nickname,username:startupActor.username,avatar:text(own(startup,\""avatar\""),4096)};\nreturn JSON.stringify({schema:\""easyeda-pro-control.pcb-worker-startup-actor.v1\"",phase:\""ui\"",identity,cachedActor,startupActor,workerUser,workerUserText:JSON.stringify(workerUser),clock:finish()});\n}"",""uniqueContextId"":""original-context"",""arguments"":[],""returnByValue"":true,""throwOnSideEffect"":true,""silent"":true,""awaitPromise"":false,""generatePreview"":false,""userGesture"":false},""sessionId"":""original-session""}"+"\0","smoke-parent-parity");
    fields.Clear();
    fields.Add(@"sessionId",@"original-session");
    fields.Add(@"uniqueContextId",@"original-context");
    fields.Add(@"targetRawWindowsPath",@"C:\Synthetic\worker-startup.eprj2");
    fields.Add(@"targetProjectUuid",@"4bf2a6592ee5b3be42e82ea5960359983f837bb7bc2336249d61f5278ca43bfb");
    fields.Add(@"targetBranchUuid",@"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
    fields.Add(@"targetDocumentUuid",@"dddddddddddddddd");
    fields.Add(@"targetExpectedSourceSha256",@"eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
    Need(EasyedaDiagnosticOwner.WorkerStartupParentProtocolMessage(256,@"Runtime.callFunctionOn",@"preflight",fields)==@"{""id"":256,""method"":""Runtime.callFunctionOn"",""params"":{""functionDeclaration"":""async function(target,phase){\n\""use strict\"";\nlet stage=\""setup\"",substage=\""setup\"",code=\""EXCEPTION\"",firstFailure=null,cleanupFailure=null,dispatchAttempted=false,publicResult=null,prefixObserved=false,expired=false,timer,clear,cleanup,observation=null,outcome;\nconst retainFailure=(value=code)=>{if(firstFailure===null)firstFailure={stage,code:value,substage};return firstFailure;};\nconst bad=(value=\""GUARD\"")=>{code=value;retainFailure(value);throw new Error(\""PCB_DIAGNOSTIC_OPENING\"");};\ntry{\nconst root=globalThis,apply=Reflect.apply;\nconst own=(owner,key,optional=false)=>{if(owner===null||(typeof owner!==\""object\""&&typeof owner!==\""function\""))bad(\""FIELD\"");const d=Object.getOwnPropertyDescriptor(owner,key);if(!d){if(optional&&!(key in owner))return undefined;bad(\""FIELD\"");}if(!Object.hasOwn(d,\""value\""))bad(\""FIELD\"");return d.value;};\nconst plain=value=>{if(value===null||typeof value!==\""object\""||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)bad(\""OBJECT\"");return value;};\nconst text=(value,max,empty=false)=>{if(typeof value!==\""string\""||value.length>max||(!empty&&value.length===0)||/[\\u0000-\\u001F\\u007F]/.test(value))bad(\""TEXT\"");return value;};\nconst matches=(value,re)=>{const m=typeof value===\""string\""?re.exec(value):null;return m!==null&&m[0]===value;};\nplain(target);const targetKeys=[\""rawWindowsPath\"",\""projectUuid\"",\""branchUuid\"",\""documentUuid\"",\""expectedSourceSha256\""];\nif(Reflect.ownKeys(target).length!==targetKeys.length||targetKeys.some(key=>!Object.hasOwn(target,key)))bad();\nfor(const key of targetKeys)text(own(target,key),4096);\nif(!matches(target.projectUuid,/^[a-f0-9]{64}$/)||!matches(target.branchUuid,/^[a-f0-9]{32}$/)||!matches(target.documentUuid,/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/)||!matches(target.expectedSourceSha256,/^[a-f0-9]{64}$/)||!matches(target.rawWindowsPath,/^[A-Za-z]:\\\\[^\\u0000-\\u001F\\u007F<>:\""|?*/]+\\.eprj2$/)||(phase!==\""preflight\""&&phase!==\""open-project\""))bad();\nconst dense=(value,max)=>{if(!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype)bad(\""ARRAY\"");const n=own(value,\""length\"");if(!Number.isInteger(n)||n<0||n>max||Reflect.ownKeys(value).length!==n+1)bad(\""ARRAY\"");for(let i=0;i<n;i++)own(value,String(i));return n;};\nconst method=(owner,key)=>{const chain=[];let node=owner;for(let i=0;i<4;i++){if(node===null||(typeof node!==\""object\""&&typeof node!==\""function\""))bad(\""METHOD\"");chain.push(node);const d=Object.getOwnPropertyDescriptor(node,key);if(d){if(!Object.hasOwn(d,\""value\"")||typeof d.value!==\""function\"")bad(\""METHOD\"");return{owner,key,chain,fn:d.value};}node=Object.getPrototypeOf(node);}bad(\""METHOD\"");};\nconst methodCheck=binding=>{for(let i=0;i<binding.chain.length;i++){const node=binding.chain[i];if(i>0&&Object.getPrototypeOf(binding.chain[i-1])!==node)bad(\""BINDING\"");if(i===binding.chain.length-1){if(own(node,binding.key)!==binding.fn)bad(\""BINDING\"");}else if(Object.hasOwn(node,binding.key))bad(\""BINDING\"");}};\nconst parseProjectUrl=(value,projectUuid,activeTabId)=>{\n if(typeof value!=='string'||value.length>32768||typeof projectUuid!=='string')bad();\n const projectMatch=/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/.exec(projectUuid);if(!projectMatch||projectMatch[0]!==projectUuid)bad();\n const pieces=value.split('#');if(pieces.length>2)bad();const base=pieces[0];\n const baseMatch=/^https:\\/\\/client\\/editor\\?cll=(?:trace|debug|info|warn|error)$/.exec(base);if(!baseMatch||baseMatch[0]!==base)bad();\n const fragment=pieces.length===1?'':pieces[1];\n if(fragment==='')return{base,empty:true,tabIds:[],activeTabId:null};\n const prefix='id='+projectUuid;if(fragment===prefix)return{base,empty:false,tabIds:[],activeTabId:null};\n if(!fragment.startsWith(prefix+',tab='))bad();const entries=fragment.slice(prefix.length+5).split('|');\n if(entries.length<1||entries.length>256)bad();const tabIds=[],seen=new Set();let markedTabId=null;\n for(const entry of entries){\n  const match=/^(\\*?)([a-f0-9]{16}|[a-f0-9]{32})@([a-f0-9]{32}|[a-f0-9]{64})$/.exec(entry);\n  if(!match||match[0]!==entry||match[3]!==projectUuid)bad();const tabId=match[2]+'@'+match[3];if(seen.has(tabId))bad();seen.add(tabId);tabIds.push(tabId);\n  if(match[1]==='*'){if(markedTabId!==null||(activeTabId!==undefined&&activeTabId!==null&&activeTabId!==tabId))bad();markedTabId=tabId;}\n }\n return{base,empty:false,tabIds,activeTabId:markedTabId};\n};\nconst location=root.location,document=root.document,initialHref=location?.href,initialUrl=parseProjectUrl(initialHref,target.projectUuid);\nif(!initialUrl.empty)bad(\""URL\"");\nlet retainedHref=initialHref,prefixCheck;\nconst ui=own(root,\""UI\""),host=own(root,\""gVars\""),tabs=own(ui,\""tabBar\""),mode=own(root,\""PRO_EDITOR_MODE\""),windowTabId=own(root,\""_TAB_ID_\"");\nif(typeof tabs!==\""function\""||Object.getPrototypeOf(tabs)!==Function.prototype||!matches(windowTabId,/^[A-Za-z0-9_-]{1,128}$/))bad();\nconst client=plain(own(host,\""client\"")),initialTitle=text(document?.title,512),query=method(document,\""querySelector\""),meta=apply(query.fn,document,['meta[name=\""editorMainVersion\""]']);\nif(meta?.ownerDocument!==document||meta?.nodeType!==1||meta?.localName!==\""meta\"")bad(\""TITLE\"");\nconst attribute=method(meta,\""getAttribute\""),version=text(apply(attribute.fn,meta,[\""content\""]),64),versionSuffix=\"" - V\""+version;\nif(!matches(version,/^\\d+(?:\\.\\d+){1,7}$/)||initialTitle.includes(\"" | \"")||!initialTitle.endsWith(versionSuffix)||initialTitle.length<=versionSuffix.length)bad(\""TITLE\"");\ntext(target.rawWindowsPath.slice(target.rawWindowsPath.lastIndexOf(\""\\\\\"")+1,target.rawWindowsPath.indexOf(\"".eprj2\"")),256);\n// The SDK calls Fs({uuid}), not Fs({cPath}). ZDe keeps cPath undefined;\n// U9o therefore leaves the empty client name unchanged and LJ keeps the base\n// Title. A filename-prefixed title would belong to a different opening route.\nconst expectedOpenedTitle=initialTitle,initialClientName=own(client,\""currentProjectName\"",true);\nif(initialClientName!==undefined&&initialClientName!==\""\"")bad(\""TITLE\"");\nconst active=method(tabs,\""getActiveTab\""),container=method(tabs,\""getContainerInfo\""),getTab=method(tabs,\""getTabById\"");\nconst bus=own(host,\""messageBus\""),registryCall=method(bus,\""rpcCall\""),subscribe=method(bus,\""subscribe\"");\nconst apiBus=own(host,\""extensionApiMessageBus2\""),openCall=method(apiBus,\""rpcCall\"");\nconst set=own(root,\""setTimeout\"");clear=own(root,\""clearTimeout\"");if(typeof set!==\""function\""||typeof clear!==\""function\"")bad();\nconst check=()=>{\n substage=\""root-binding\"";\n if(expired)bad(\""TIMEOUT\"");\n if(root.window!==root||root.top!==root||root.location!==location||root.document!==document||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==retainedHref||location?.href!==retainedHref||location?.origin!==\""https://client\"")bad(\""URL\"");\n if(parseProjectUrl(retainedHref,target.projectUuid).base!==initialUrl.base)bad(\""URL\"");\n if(own(root,\""PRO_EDITOR_MODE\"")!==mode||(mode!==\""CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM\""&&mode!==\""CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM\""))bad();\n if(own(root,\""UI\"")!==ui||own(root,\""gVars\"")!==host||own(ui,\""gVars\"")!==host||own(ui,\""tabBar\"")!==tabs||own(host,\""client\"")!==client||own(host,\""messageBus\"")!==bus||own(host,\""extensionApiMessageBus2\"")!==apiBus||own(root,\""_MSG_BUS2_EXTAPI_\"")!==apiBus||own(root,\""_TAB_ID_\"")!==windowTabId||own(root,\""setTimeout\"")!==set||own(root,\""clearTimeout\"")!==clear)bad(\""BINDING\"");\n for(const binding of [active,container,getTab,registryCall,subscribe,openCall,query,attribute])methodCheck(binding);\n if(apply(query.fn,document,['meta[name=\""editorMainVersion\""]'])!==meta||meta.ownerDocument!==document||apply(attribute.fn,meta,[\""content\""])!==version)bad(\""TITLE\"");\n if(prefixCheck!==undefined)prefixCheck();\n};\nconst projectIdentity=()=>{\n check();substage=\""project-identity\"";const project=plain(own(host,\""currentProject\"")),pid=own(project,\""projectId\"",true),branch=own(project,\""branchUuid\"",true),projectPresent=pid===target.projectUuid;\n if(pid!==undefined&&!projectPresent)bad(\""PROJECT\"");\n if(projectPresent){if(branch!==target.branchUuid)bad(\""BRANCH\"");if(own(project,\""isV2Format\"")!==false)bad(\""FORMAT\"");}else if(branch!==undefined&&branch!==\""\"")bad(\""BRANCH\"");\n if(own(host,\""isHistoryMode\"")!==false)bad(\""HISTORY\"");return{project,pid,branch,projectPresent};\n};\nconst sample=()=>{\n const {project,pid,branch,projectPresent}=projectIdentity(),owners=[project];substage=\""title\"";\n const documentTitle=text(document.title,512),clientName=own(client,\""currentProjectName\"",true);\n if(documentTitle!==expectedOpenedTitle||clientName!==initialClientName)bad(\""TITLE\"");\n substage=\""container-roster\"";\n const ids=own(tabs,\""containerIds\""),n=dense(ids,128);if(n===0)bad(\""TAB\"");owners.push(ids);const names=[],registry=new Set();\n for(let i=0;i<n;i++){const id=text(own(ids,String(i)),256);if(registry.has(id))bad(\""TAB\"");registry.add(id);names.push(id);}\n substage=\""container-tree\"";const tree=own(tabs,\""containerTree\""),pending=[{node:tree,depth:0}],seen=new Set(),treeIds=new Set(),leaves=new Set(),treeProjection=[];\n if(own(tabs,\""belongContainer\"")!==\""editor-window-main\""||own(tree,\""id\"")!==\""editor-window-main\"")bad(\""TAB\"");\n while(pending.length){const item=pending.pop(),node=plain(item.node);if(item.depth>16||seen.has(node)||seen.size>=255)bad(\""TAB\"");seen.add(node);owners.push(node);const id=text(own(node,\""id\""),256),children=own(node,\""children\"",true);if(treeIds.has(id))bad(\""TAB\"");treeIds.add(id);treeProjection.push([id,item.depth]);\n  if(children===undefined){if(!registry.has(id)||leaves.has(id))bad(\""TAB\"");leaves.add(id);}else{const count=dense(children,128);if(count===0||pending.length+seen.size+count>255)bad(\""TAB\"");owners.push(children);for(let i=count-1;i>=0;i--)pending.push({node:own(children,String(i)),depth:item.depth+1});}}\n if(leaves.size!==registry.size)bad(\""TAB\"");const current=text(own(tabs,\""currentTabId\""),512,true);if(apply(active.fn,tabs,[])!==current)bad(\""TAB\"");\n substage=\""tab-roster\"";const allIds=new Set(),projection=[],ordinaryIds=[];let count=0,start=0,placeholder=0,currentCount=0;\n for(const id of names){const info=plain(apply(container.fn,tabs,[id]));check();substage=\""tab-roster\"";owners.push(info);if(own(info,\""id\"")!==id||own(info,\""belong\"")!==\""editor-window-main\"")bad(\""TAB\"");const list=own(info,\""tabs\""),length=dense(list,256);if(count+length>256)bad(\""TAB\"");count+=length;owners.push(list);const localActive=text(own(info,\""activeTabId\""),512,true),localIds=new Set(),rows=[];\n  for(let i=0;i<length;i++){const tab=plain(own(list,String(i))),id2=text(own(tab,\""tabId\""),512),data=plain(own(tab,\""data\""));owners.push(tab,data);if(allIds.has(id2))bad(\""TAB\"");allIds.add(id2);localIds.add(id2);const type=own(data,\""doctype\"");\n   if(id2===\""tab_page1\""||id2===\""0\""){const isStart=id2===\""tab_page1\"";if(type!==(isStart?-1:0)||own(tab,\""isAbleDelete\"")!==false||own(tab,\""group\"")!==\""start_blank\""||own(tab,\""draggable\"")!==isStart)bad(\""TAB\"");const hidden=own(tab,\""isDisplayNone\"");if(typeof hidden!==\""boolean\""||(!isStart&&hidden!==true))bad(\""TAB\"");const declared=own(tab,\""documentType\"",true);if(declared!==undefined&&declared!==type)bad(\""TAB\"");for(const key of [\""pid\"",\""owner\""])if(own(data,key,true)!==undefined)bad(\""TAB\"");for(const key of [\""parentProjectUuid\"",\""parentLibraryUuid\""])if(own(tab,key,true)!==undefined)bad(\""TAB\"");if(isStart)start++;else placeholder++;\n   }else{if(!projectPresent||own(data,\""pid\"")!==target.projectUuid||own(tab,\""parentLibraryUuid\"",true)!==undefined||![1,3,26].includes(type))bad(\""TAB\"");const parts=/^([a-f0-9]{16}|[a-f0-9]{32})@([a-f0-9]{64})$/.exec(id2);if(!parts||parts[0]!==id2||parts[2]!==target.projectUuid)bad(\""TAB\"");const parentProject=own(tab,\""parentProjectUuid\"",true);if(parentProject!==undefined&&parentProject!==target.projectUuid)bad(\""TAB\"");ordinaryIds.push(id2);}\n   if(apply(getTab.fn,tabs,[id2])!==tab)bad(\""TAB\"");\n   if(id2===current){currentCount++;if(localActive!==current)bad(\""TAB\"");}rows.push([id2,type]);}\n  if(localActive!==\""\""&&!localIds.has(localActive))bad(\""TAB\"");projection.push([id,localActive,rows]);}\n if(start>1||placeholder>1||(current===\""\""?currentCount!==0:currentCount!==1))bad(\""TAB\"");\n if(!projectPresent&&(start!==1||current!==\""tab_page1\""||count!==start+placeholder))bad(\""TAB\"");\n substage=\""url\"";const url=parseProjectUrl(retainedHref,target.projectUuid,current);\n if(!url.empty&&!projectPresent||url.tabIds.some(id=>!allIds.has(id)))bad(\""URL\"");check();\n return{owners,identity:JSON.stringify([names,treeProjection,projection,current,pid??null,branch??null,documentTitle,clientName??null]),public:{projectPresent,branchUuid:projectPresent?branch:null,windowTabId,containerCount:n,tabIds:ordinaryIds,activeTabId:current,initialTitle,expectedOpenedTitle,documentTitle}};\n};\nconst same=(a,b)=>{if(a.identity!==b.identity||a.owners.length!==b.owners.length||a.owners.some((owner,i)=>owner!==b.owners[i]))bad(\""OWNERS\"");};\nconst registration=async()=>{const before=sample();substage=\""registration\"";const reply=await apply(registryCall.fn,bus,[\""/pro-mgr/api/client/getProjectPaths\"",{},0]);check();same(before,sample());substage=\""registration\"";plain(reply);const message=plain(own(reply,\""message\""));if(own(message,\""success\"")!==true)bad(\""REGISTRY\"");const result=plain(own(message,\""result\"")),keys=Reflect.ownKeys(result);if(keys.length>4096||keys.some(key=>!matches(key,/^[a-f0-9]{64}$/)))bad(\""REGISTRY\"");const selected=plain(own(result,target.projectUuid));if(text(own(selected,\""path\""),4096)!==target.rawWindowsPath||own(selected,\""isCbb\"")!==false)bad(\""REGISTRY\"");return before;};\nconst run=async()=>{\n stage=\""registration-before\"";const initial=await registration();check();if(initial.public.projectPresent)bad(\""PROJECT\"");\n if(phase===\""open-project\""){\n  stage=\""subscribe\"";let delivered=0,eventFailed=false,eventProject,settle;const event=new Promise(resolve=>{settle=resolve;});\n  const advanceUrl=()=>{if(!dispatchAttempted)bad(\""PREFIX\"");retainedHref=location?.href;check();};\n  // UI3823ed6e createBlankTab16424906 publishes a simulated click, not an\n  // Awaited tab-render completion. ON_OPENED16669194 emits this prefix before\n  // Restoration. Capture project identity here; complete title/tab/owner\n  // Checks remain mandatory after acknowledgment and around registry/final reads.\n  const receive=(...args)=>{delivered++;const priorStage=stage,priorSubstage=substage;stage=\""prefix\"";substage=\""event-shape\"";try{if(!dispatchAttempted||delivered!==1||args.length!==3||args[0]!==null||args[1]!==undefined||args[2]!==undefined)bad(\""PREFIX\"");advanceUrl();const observed=projectIdentity();if(!observed.projectPresent)bad(\""PROJECT\"");eventProject=observed.project;prefixObserved=true;}catch{retainFailure();eventFailed=true;}finally{stage=priorStage;substage=priorSubstage;}settle();};\n  const task=apply(subscribe.fn,bus,[\""loadProjectCompleted\"",receive]),cancel=method(task,\""cancel\"");\n  const listener=()=>{const prior=substage;substage=\""listener\"";methodCheck(cancel);if(own(task,\""callback\"")!==receive||own(task,\""isRunning\"")!==true)bad(\""PREFIX\"");substage=prior;};\n  cleanup=()=>{listener();apply(cancel.fn,task,[]);if(own(task,\""callback\"")!==null||own(task,\""isRunning\"")!==false)bad(\""CLEANUP\"");};\n  prefixCheck=()=>{listener();if(eventFailed||delivered>1)bad(\""PREFIX\"");};\n  listener();same(initial,sample());check();if(delivered!==0||eventFailed)bad(\""PREFIX\"");\n  stage=\""dispatch\"";dispatchAttempted=true;const result=await apply(openCall.fn,apiBus,[\""extensionApi.DMT_Project.openProject\"",target.projectUuid]);\n  stage=\""acknowledgement\"";advanceUrl();listener();substage=\""acknowledgement\"";if(typeof result!==\""boolean\"")bad(\""ACK\"");publicResult=result;if(!result)bad(\""ACK\"");\n  stage=\""prefix\"";await event;check();listener();if(delivered!==1||eventFailed||!prefixObserved)bad(\""PREFIX\"");if(own(host,\""currentProject\"")!==eventProject)bad(\""OWNERS\"");\n }\n stage=\""registration-after\"";const after=await registration();check();stage=\""observe\"";const final=sample();same(after,final);await Promise.resolve();check();same(final,sample());\n if(final.public.projectPresent!==(phase===\""open-project\""))bad(\""PROJECT\"");\n observation=final.public;stage=\""output\"";substage=\""output\"";return{ok:true,status:phase===\""preflight\""?\""ready\"":\""opened-prefix-observed\"",failure:null};\n};\ncheck();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;code=\""TIMEOUT\"";retainFailure(\""TIMEOUT\"");reject(new Error(\""PCB_DIAGNOSTIC_OPENING\""));},phase===\""preflight\""?10000:45000]);});\noutcome=await Promise.race([run(),timeout]);\n}catch{outcome={ok:false,status:\""refused\"",failure:retainFailure()};}\nfinally{\n stage=\""cleanup\"";substage=\""cleanup\"";\n try{if(cleanup!==undefined)cleanup();}catch{cleanupFailure={stage:\""cleanup\"",code:\""CLEANUP\""};outcome={ok:false,status:\""refused\"",failure:retainFailure(\""CLEANUP\"")};}\n if(timer!==undefined&&typeof clear===\""function\""){try{Reflect.apply(clear,globalThis,[timer]);}catch{cleanupFailure={stage:\""cleanup\"",code:\""CLEANUP\""};outcome={ok:false,status:\""refused\"",failure:retainFailure(\""CLEANUP\"")};}}\n}\nreturn JSON.stringify({schema:\""easyeda-pro-control.pcb-diagnostic-opening.v1\"",phase,projectUuid:target.projectUuid,branchUuid:target.branchUuid,documentUuid:target.documentUuid,...outcome,cleanupFailure,dispatchAttempted,publicResult,prefixObserved,nativeWorkMayRemain:dispatchAttempted,observation});\n}"",""uniqueContextId"":""original-context"",""arguments"":[{""value"":{""rawWindowsPath"":""C:\\Synthetic\\worker-startup.eprj2"",""projectUuid"":""4bf2a6592ee5b3be42e82ea5960359983f837bb7bc2336249d61f5278ca43bfb"",""documentUuid"":""dddddddddddddddd"",""expectedSourceSha256"":""eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"",""branchUuid"":""bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb""}},{""value"":""preflight""}],""returnByValue"":true,""awaitPromise"":true,""silent"":true,""generatePreview"":false,""userGesture"":false,""throwOnSideEffect"":false},""sessionId"":""original-session""}"+"\0","smoke-parent-parity");
    fields.Clear();
    fields.Add(@"sessionId",@"original-session");
    fields.Add(@"uniqueContextId",@"original-context");
    fields.Add(@"targetRawWindowsPath",@"C:\Synthetic\worker-startup.eprj2");
    fields.Add(@"targetProjectUuid",@"4bf2a6592ee5b3be42e82ea5960359983f837bb7bc2336249d61f5278ca43bfb");
    fields.Add(@"targetBranchUuid",@"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
    fields.Add(@"targetDocumentUuid",@"dddddddddddddddd");
    fields.Add(@"targetExpectedSourceSha256",@"eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
    Need(EasyedaDiagnosticOwner.WorkerStartupParentProtocolMessage(256,@"Runtime.callFunctionOn",@"open-project",fields)==@"{""id"":256,""method"":""Runtime.callFunctionOn"",""params"":{""functionDeclaration"":""async function(target,phase){\n\""use strict\"";\nlet stage=\""setup\"",substage=\""setup\"",code=\""EXCEPTION\"",firstFailure=null,cleanupFailure=null,dispatchAttempted=false,publicResult=null,prefixObserved=false,expired=false,timer,clear,cleanup,observation=null,outcome;\nconst retainFailure=(value=code)=>{if(firstFailure===null)firstFailure={stage,code:value,substage};return firstFailure;};\nconst bad=(value=\""GUARD\"")=>{code=value;retainFailure(value);throw new Error(\""PCB_DIAGNOSTIC_OPENING\"");};\ntry{\nconst root=globalThis,apply=Reflect.apply;\nconst own=(owner,key,optional=false)=>{if(owner===null||(typeof owner!==\""object\""&&typeof owner!==\""function\""))bad(\""FIELD\"");const d=Object.getOwnPropertyDescriptor(owner,key);if(!d){if(optional&&!(key in owner))return undefined;bad(\""FIELD\"");}if(!Object.hasOwn(d,\""value\""))bad(\""FIELD\"");return d.value;};\nconst plain=value=>{if(value===null||typeof value!==\""object\""||Array.isArray(value)||Object.getPrototypeOf(value)!==Object.prototype)bad(\""OBJECT\"");return value;};\nconst text=(value,max,empty=false)=>{if(typeof value!==\""string\""||value.length>max||(!empty&&value.length===0)||/[\\u0000-\\u001F\\u007F]/.test(value))bad(\""TEXT\"");return value;};\nconst matches=(value,re)=>{const m=typeof value===\""string\""?re.exec(value):null;return m!==null&&m[0]===value;};\nplain(target);const targetKeys=[\""rawWindowsPath\"",\""projectUuid\"",\""branchUuid\"",\""documentUuid\"",\""expectedSourceSha256\""];\nif(Reflect.ownKeys(target).length!==targetKeys.length||targetKeys.some(key=>!Object.hasOwn(target,key)))bad();\nfor(const key of targetKeys)text(own(target,key),4096);\nif(!matches(target.projectUuid,/^[a-f0-9]{64}$/)||!matches(target.branchUuid,/^[a-f0-9]{32}$/)||!matches(target.documentUuid,/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/)||!matches(target.expectedSourceSha256,/^[a-f0-9]{64}$/)||!matches(target.rawWindowsPath,/^[A-Za-z]:\\\\[^\\u0000-\\u001F\\u007F<>:\""|?*/]+\\.eprj2$/)||(phase!==\""preflight\""&&phase!==\""open-project\""))bad();\nconst dense=(value,max)=>{if(!Array.isArray(value)||Object.getPrototypeOf(value)!==Array.prototype)bad(\""ARRAY\"");const n=own(value,\""length\"");if(!Number.isInteger(n)||n<0||n>max||Reflect.ownKeys(value).length!==n+1)bad(\""ARRAY\"");for(let i=0;i<n;i++)own(value,String(i));return n;};\nconst method=(owner,key)=>{const chain=[];let node=owner;for(let i=0;i<4;i++){if(node===null||(typeof node!==\""object\""&&typeof node!==\""function\""))bad(\""METHOD\"");chain.push(node);const d=Object.getOwnPropertyDescriptor(node,key);if(d){if(!Object.hasOwn(d,\""value\"")||typeof d.value!==\""function\"")bad(\""METHOD\"");return{owner,key,chain,fn:d.value};}node=Object.getPrototypeOf(node);}bad(\""METHOD\"");};\nconst methodCheck=binding=>{for(let i=0;i<binding.chain.length;i++){const node=binding.chain[i];if(i>0&&Object.getPrototypeOf(binding.chain[i-1])!==node)bad(\""BINDING\"");if(i===binding.chain.length-1){if(own(node,binding.key)!==binding.fn)bad(\""BINDING\"");}else if(Object.hasOwn(node,binding.key))bad(\""BINDING\"");}};\nconst parseProjectUrl=(value,projectUuid,activeTabId)=>{\n if(typeof value!=='string'||value.length>32768||typeof projectUuid!=='string')bad();\n const projectMatch=/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/.exec(projectUuid);if(!projectMatch||projectMatch[0]!==projectUuid)bad();\n const pieces=value.split('#');if(pieces.length>2)bad();const base=pieces[0];\n const baseMatch=/^https:\\/\\/client\\/editor\\?cll=(?:trace|debug|info|warn|error)$/.exec(base);if(!baseMatch||baseMatch[0]!==base)bad();\n const fragment=pieces.length===1?'':pieces[1];\n if(fragment==='')return{base,empty:true,tabIds:[],activeTabId:null};\n const prefix='id='+projectUuid;if(fragment===prefix)return{base,empty:false,tabIds:[],activeTabId:null};\n if(!fragment.startsWith(prefix+',tab='))bad();const entries=fragment.slice(prefix.length+5).split('|');\n if(entries.length<1||entries.length>256)bad();const tabIds=[],seen=new Set();let markedTabId=null;\n for(const entry of entries){\n  const match=/^(\\*?)([a-f0-9]{16}|[a-f0-9]{32})@([a-f0-9]{32}|[a-f0-9]{64})$/.exec(entry);\n  if(!match||match[0]!==entry||match[3]!==projectUuid)bad();const tabId=match[2]+'@'+match[3];if(seen.has(tabId))bad();seen.add(tabId);tabIds.push(tabId);\n  if(match[1]==='*'){if(markedTabId!==null||(activeTabId!==undefined&&activeTabId!==null&&activeTabId!==tabId))bad();markedTabId=tabId;}\n }\n return{base,empty:false,tabIds,activeTabId:markedTabId};\n};\nconst location=root.location,document=root.document,initialHref=location?.href,initialUrl=parseProjectUrl(initialHref,target.projectUuid);\nif(!initialUrl.empty)bad(\""URL\"");\nlet retainedHref=initialHref,prefixCheck;\nconst ui=own(root,\""UI\""),host=own(root,\""gVars\""),tabs=own(ui,\""tabBar\""),mode=own(root,\""PRO_EDITOR_MODE\""),windowTabId=own(root,\""_TAB_ID_\"");\nif(typeof tabs!==\""function\""||Object.getPrototypeOf(tabs)!==Function.prototype||!matches(windowTabId,/^[A-Za-z0-9_-]{1,128}$/))bad();\nconst client=plain(own(host,\""client\"")),initialTitle=text(document?.title,512),query=method(document,\""querySelector\""),meta=apply(query.fn,document,['meta[name=\""editorMainVersion\""]']);\nif(meta?.ownerDocument!==document||meta?.nodeType!==1||meta?.localName!==\""meta\"")bad(\""TITLE\"");\nconst attribute=method(meta,\""getAttribute\""),version=text(apply(attribute.fn,meta,[\""content\""]),64),versionSuffix=\"" - V\""+version;\nif(!matches(version,/^\\d+(?:\\.\\d+){1,7}$/)||initialTitle.includes(\"" | \"")||!initialTitle.endsWith(versionSuffix)||initialTitle.length<=versionSuffix.length)bad(\""TITLE\"");\ntext(target.rawWindowsPath.slice(target.rawWindowsPath.lastIndexOf(\""\\\\\"")+1,target.rawWindowsPath.indexOf(\"".eprj2\"")),256);\n// The SDK calls Fs({uuid}), not Fs({cPath}). ZDe keeps cPath undefined;\n// U9o therefore leaves the empty client name unchanged and LJ keeps the base\n// Title. A filename-prefixed title would belong to a different opening route.\nconst expectedOpenedTitle=initialTitle,initialClientName=own(client,\""currentProjectName\"",true);\nif(initialClientName!==undefined&&initialClientName!==\""\"")bad(\""TITLE\"");\nconst active=method(tabs,\""getActiveTab\""),container=method(tabs,\""getContainerInfo\""),getTab=method(tabs,\""getTabById\"");\nconst bus=own(host,\""messageBus\""),registryCall=method(bus,\""rpcCall\""),subscribe=method(bus,\""subscribe\"");\nconst apiBus=own(host,\""extensionApiMessageBus2\""),openCall=method(apiBus,\""rpcCall\"");\nconst set=own(root,\""setTimeout\"");clear=own(root,\""clearTimeout\"");if(typeof set!==\""function\""||typeof clear!==\""function\"")bad();\nconst check=()=>{\n substage=\""root-binding\"";\n if(expired)bad(\""TIMEOUT\"");\n if(root.window!==root||root.top!==root||root.location!==location||root.document!==document||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==retainedHref||location?.href!==retainedHref||location?.origin!==\""https://client\"")bad(\""URL\"");\n if(parseProjectUrl(retainedHref,target.projectUuid).base!==initialUrl.base)bad(\""URL\"");\n if(own(root,\""PRO_EDITOR_MODE\"")!==mode||(mode!==\""CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM\""&&mode!==\""CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM\""))bad();\n if(own(root,\""UI\"")!==ui||own(root,\""gVars\"")!==host||own(ui,\""gVars\"")!==host||own(ui,\""tabBar\"")!==tabs||own(host,\""client\"")!==client||own(host,\""messageBus\"")!==bus||own(host,\""extensionApiMessageBus2\"")!==apiBus||own(root,\""_MSG_BUS2_EXTAPI_\"")!==apiBus||own(root,\""_TAB_ID_\"")!==windowTabId||own(root,\""setTimeout\"")!==set||own(root,\""clearTimeout\"")!==clear)bad(\""BINDING\"");\n for(const binding of [active,container,getTab,registryCall,subscribe,openCall,query,attribute])methodCheck(binding);\n if(apply(query.fn,document,['meta[name=\""editorMainVersion\""]'])!==meta||meta.ownerDocument!==document||apply(attribute.fn,meta,[\""content\""])!==version)bad(\""TITLE\"");\n if(prefixCheck!==undefined)prefixCheck();\n};\nconst projectIdentity=()=>{\n check();substage=\""project-identity\"";const project=plain(own(host,\""currentProject\"")),pid=own(project,\""projectId\"",true),branch=own(project,\""branchUuid\"",true),projectPresent=pid===target.projectUuid;\n if(pid!==undefined&&!projectPresent)bad(\""PROJECT\"");\n if(projectPresent){if(branch!==target.branchUuid)bad(\""BRANCH\"");if(own(project,\""isV2Format\"")!==false)bad(\""FORMAT\"");}else if(branch!==undefined&&branch!==\""\"")bad(\""BRANCH\"");\n if(own(host,\""isHistoryMode\"")!==false)bad(\""HISTORY\"");return{project,pid,branch,projectPresent};\n};\nconst sample=()=>{\n const {project,pid,branch,projectPresent}=projectIdentity(),owners=[project];substage=\""title\"";\n const documentTitle=text(document.title,512),clientName=own(client,\""currentProjectName\"",true);\n if(documentTitle!==expectedOpenedTitle||clientName!==initialClientName)bad(\""TITLE\"");\n substage=\""container-roster\"";\n const ids=own(tabs,\""containerIds\""),n=dense(ids,128);if(n===0)bad(\""TAB\"");owners.push(ids);const names=[],registry=new Set();\n for(let i=0;i<n;i++){const id=text(own(ids,String(i)),256);if(registry.has(id))bad(\""TAB\"");registry.add(id);names.push(id);}\n substage=\""container-tree\"";const tree=own(tabs,\""containerTree\""),pending=[{node:tree,depth:0}],seen=new Set(),treeIds=new Set(),leaves=new Set(),treeProjection=[];\n if(own(tabs,\""belongContainer\"")!==\""editor-window-main\""||own(tree,\""id\"")!==\""editor-window-main\"")bad(\""TAB\"");\n while(pending.length){const item=pending.pop(),node=plain(item.node);if(item.depth>16||seen.has(node)||seen.size>=255)bad(\""TAB\"");seen.add(node);owners.push(node);const id=text(own(node,\""id\""),256),children=own(node,\""children\"",true);if(treeIds.has(id))bad(\""TAB\"");treeIds.add(id);treeProjection.push([id,item.depth]);\n  if(children===undefined){if(!registry.has(id)||leaves.has(id))bad(\""TAB\"");leaves.add(id);}else{const count=dense(children,128);if(count===0||pending.length+seen.size+count>255)bad(\""TAB\"");owners.push(children);for(let i=count-1;i>=0;i--)pending.push({node:own(children,String(i)),depth:item.depth+1});}}\n if(leaves.size!==registry.size)bad(\""TAB\"");const current=text(own(tabs,\""currentTabId\""),512,true);if(apply(active.fn,tabs,[])!==current)bad(\""TAB\"");\n substage=\""tab-roster\"";const allIds=new Set(),projection=[],ordinaryIds=[];let count=0,start=0,placeholder=0,currentCount=0;\n for(const id of names){const info=plain(apply(container.fn,tabs,[id]));check();substage=\""tab-roster\"";owners.push(info);if(own(info,\""id\"")!==id||own(info,\""belong\"")!==\""editor-window-main\"")bad(\""TAB\"");const list=own(info,\""tabs\""),length=dense(list,256);if(count+length>256)bad(\""TAB\"");count+=length;owners.push(list);const localActive=text(own(info,\""activeTabId\""),512,true),localIds=new Set(),rows=[];\n  for(let i=0;i<length;i++){const tab=plain(own(list,String(i))),id2=text(own(tab,\""tabId\""),512),data=plain(own(tab,\""data\""));owners.push(tab,data);if(allIds.has(id2))bad(\""TAB\"");allIds.add(id2);localIds.add(id2);const type=own(data,\""doctype\"");\n   if(id2===\""tab_page1\""||id2===\""0\""){const isStart=id2===\""tab_page1\"";if(type!==(isStart?-1:0)||own(tab,\""isAbleDelete\"")!==false||own(tab,\""group\"")!==\""start_blank\""||own(tab,\""draggable\"")!==isStart)bad(\""TAB\"");const hidden=own(tab,\""isDisplayNone\"");if(typeof hidden!==\""boolean\""||(!isStart&&hidden!==true))bad(\""TAB\"");const declared=own(tab,\""documentType\"",true);if(declared!==undefined&&declared!==type)bad(\""TAB\"");for(const key of [\""pid\"",\""owner\""])if(own(data,key,true)!==undefined)bad(\""TAB\"");for(const key of [\""parentProjectUuid\"",\""parentLibraryUuid\""])if(own(tab,key,true)!==undefined)bad(\""TAB\"");if(isStart)start++;else placeholder++;\n   }else{if(!projectPresent||own(data,\""pid\"")!==target.projectUuid||own(tab,\""parentLibraryUuid\"",true)!==undefined||![1,3,26].includes(type))bad(\""TAB\"");const parts=/^([a-f0-9]{16}|[a-f0-9]{32})@([a-f0-9]{64})$/.exec(id2);if(!parts||parts[0]!==id2||parts[2]!==target.projectUuid)bad(\""TAB\"");const parentProject=own(tab,\""parentProjectUuid\"",true);if(parentProject!==undefined&&parentProject!==target.projectUuid)bad(\""TAB\"");ordinaryIds.push(id2);}\n   if(apply(getTab.fn,tabs,[id2])!==tab)bad(\""TAB\"");\n   if(id2===current){currentCount++;if(localActive!==current)bad(\""TAB\"");}rows.push([id2,type]);}\n  if(localActive!==\""\""&&!localIds.has(localActive))bad(\""TAB\"");projection.push([id,localActive,rows]);}\n if(start>1||placeholder>1||(current===\""\""?currentCount!==0:currentCount!==1))bad(\""TAB\"");\n if(!projectPresent&&(start!==1||current!==\""tab_page1\""||count!==start+placeholder))bad(\""TAB\"");\n substage=\""url\"";const url=parseProjectUrl(retainedHref,target.projectUuid,current);\n if(!url.empty&&!projectPresent||url.tabIds.some(id=>!allIds.has(id)))bad(\""URL\"");check();\n return{owners,identity:JSON.stringify([names,treeProjection,projection,current,pid??null,branch??null,documentTitle,clientName??null]),public:{projectPresent,branchUuid:projectPresent?branch:null,windowTabId,containerCount:n,tabIds:ordinaryIds,activeTabId:current,initialTitle,expectedOpenedTitle,documentTitle}};\n};\nconst same=(a,b)=>{if(a.identity!==b.identity||a.owners.length!==b.owners.length||a.owners.some((owner,i)=>owner!==b.owners[i]))bad(\""OWNERS\"");};\nconst registration=async()=>{const before=sample();substage=\""registration\"";const reply=await apply(registryCall.fn,bus,[\""/pro-mgr/api/client/getProjectPaths\"",{},0]);check();same(before,sample());substage=\""registration\"";plain(reply);const message=plain(own(reply,\""message\""));if(own(message,\""success\"")!==true)bad(\""REGISTRY\"");const result=plain(own(message,\""result\"")),keys=Reflect.ownKeys(result);if(keys.length>4096||keys.some(key=>!matches(key,/^[a-f0-9]{64}$/)))bad(\""REGISTRY\"");const selected=plain(own(result,target.projectUuid));if(text(own(selected,\""path\""),4096)!==target.rawWindowsPath||own(selected,\""isCbb\"")!==false)bad(\""REGISTRY\"");return before;};\nconst run=async()=>{\n stage=\""registration-before\"";const initial=await registration();check();if(initial.public.projectPresent)bad(\""PROJECT\"");\n if(phase===\""open-project\""){\n  stage=\""subscribe\"";let delivered=0,eventFailed=false,eventProject,settle;const event=new Promise(resolve=>{settle=resolve;});\n  const advanceUrl=()=>{if(!dispatchAttempted)bad(\""PREFIX\"");retainedHref=location?.href;check();};\n  // UI3823ed6e createBlankTab16424906 publishes a simulated click, not an\n  // Awaited tab-render completion. ON_OPENED16669194 emits this prefix before\n  // Restoration. Capture project identity here; complete title/tab/owner\n  // Checks remain mandatory after acknowledgment and around registry/final reads.\n  const receive=(...args)=>{delivered++;const priorStage=stage,priorSubstage=substage;stage=\""prefix\"";substage=\""event-shape\"";try{if(!dispatchAttempted||delivered!==1||args.length!==3||args[0]!==null||args[1]!==undefined||args[2]!==undefined)bad(\""PREFIX\"");advanceUrl();const observed=projectIdentity();if(!observed.projectPresent)bad(\""PROJECT\"");eventProject=observed.project;prefixObserved=true;}catch{retainFailure();eventFailed=true;}finally{stage=priorStage;substage=priorSubstage;}settle();};\n  const task=apply(subscribe.fn,bus,[\""loadProjectCompleted\"",receive]),cancel=method(task,\""cancel\"");\n  const listener=()=>{const prior=substage;substage=\""listener\"";methodCheck(cancel);if(own(task,\""callback\"")!==receive||own(task,\""isRunning\"")!==true)bad(\""PREFIX\"");substage=prior;};\n  cleanup=()=>{listener();apply(cancel.fn,task,[]);if(own(task,\""callback\"")!==null||own(task,\""isRunning\"")!==false)bad(\""CLEANUP\"");};\n  prefixCheck=()=>{listener();if(eventFailed||delivered>1)bad(\""PREFIX\"");};\n  listener();same(initial,sample());check();if(delivered!==0||eventFailed)bad(\""PREFIX\"");\n  stage=\""dispatch\"";dispatchAttempted=true;const result=await apply(openCall.fn,apiBus,[\""extensionApi.DMT_Project.openProject\"",target.projectUuid]);\n  stage=\""acknowledgement\"";advanceUrl();listener();substage=\""acknowledgement\"";if(typeof result!==\""boolean\"")bad(\""ACK\"");publicResult=result;if(!result)bad(\""ACK\"");\n  stage=\""prefix\"";await event;check();listener();if(delivered!==1||eventFailed||!prefixObserved)bad(\""PREFIX\"");if(own(host,\""currentProject\"")!==eventProject)bad(\""OWNERS\"");\n }\n stage=\""registration-after\"";const after=await registration();check();stage=\""observe\"";const final=sample();same(after,final);await Promise.resolve();check();same(final,sample());\n if(final.public.projectPresent!==(phase===\""open-project\""))bad(\""PROJECT\"");\n observation=final.public;stage=\""output\"";substage=\""output\"";return{ok:true,status:phase===\""preflight\""?\""ready\"":\""opened-prefix-observed\"",failure:null};\n};\ncheck();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;code=\""TIMEOUT\"";retainFailure(\""TIMEOUT\"");reject(new Error(\""PCB_DIAGNOSTIC_OPENING\""));},phase===\""preflight\""?10000:45000]);});\noutcome=await Promise.race([run(),timeout]);\n}catch{outcome={ok:false,status:\""refused\"",failure:retainFailure()};}\nfinally{\n stage=\""cleanup\"";substage=\""cleanup\"";\n try{if(cleanup!==undefined)cleanup();}catch{cleanupFailure={stage:\""cleanup\"",code:\""CLEANUP\""};outcome={ok:false,status:\""refused\"",failure:retainFailure(\""CLEANUP\"")};}\n if(timer!==undefined&&typeof clear===\""function\""){try{Reflect.apply(clear,globalThis,[timer]);}catch{cleanupFailure={stage:\""cleanup\"",code:\""CLEANUP\""};outcome={ok:false,status:\""refused\"",failure:retainFailure(\""CLEANUP\"")};}}\n}\nreturn JSON.stringify({schema:\""easyeda-pro-control.pcb-diagnostic-opening.v1\"",phase,projectUuid:target.projectUuid,branchUuid:target.branchUuid,documentUuid:target.documentUuid,...outcome,cleanupFailure,dispatchAttempted,publicResult,prefixObserved,nativeWorkMayRemain:dispatchAttempted,observation});\n}"",""uniqueContextId"":""original-context"",""arguments"":[{""value"":{""rawWindowsPath"":""C:\\Synthetic\\worker-startup.eprj2"",""projectUuid"":""4bf2a6592ee5b3be42e82ea5960359983f837bb7bc2336249d61f5278ca43bfb"",""documentUuid"":""dddddddddddddddd"",""expectedSourceSha256"":""eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"",""branchUuid"":""bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb""}},{""value"":""open-project""}],""returnByValue"":true,""awaitPromise"":true,""silent"":true,""generatePreview"":false,""userGesture"":false,""throwOnSideEffect"":false},""sessionId"":""original-session""}"+"\0","smoke-parent-parity");
    fields.Clear();
    fields.Add(@"sessionId",@"original-session");
    fields.Add(@"uniqueContextId",@"original-context");
    fields.Add(@"targetRawWindowsPath",@"C:\Synthetic\worker-startup.eprj2");
    fields.Add(@"targetProjectUuid",@"4bf2a6592ee5b3be42e82ea5960359983f837bb7bc2336249d61f5278ca43bfb");
    fields.Add(@"targetBranchUuid",@"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
    fields.Add(@"targetDocumentUuid",@"dddddddddddddddd");
    fields.Add(@"targetExpectedSourceSha256",@"eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
    Need(EasyedaDiagnosticOwner.WorkerStartupParentProtocolMessage(256,@"Runtime.callFunctionOn",@"pcb-preflight",fields)==@"{""id"":256,""method"":""Runtime.callFunctionOn"",""params"":{""functionDeclaration"":""async function(target,phase){\n\""use strict\"";\nlet stage=\""setup\"",code=\""EXCEPTION\"",dispatchAttempted=false,publicResult=null,frameObserved=false,windowTabId=null,timer,clear,expired=false,outcome;\nconst bad=(value=\""GUARD\"")=>{code=value;throw new Error(\""PCB_DIAGNOSTIC_PCB_OPENING\"");};\ntry{\nconst root=globalThis,apply=Reflect.apply;\nconst own=(o,k,optional=false)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad(\""FIELD\"");const d=Object.getOwnPropertyDescriptor(o,k);if(!d){if(optional&&!(k in o))return undefined;bad(\""FIELD\"");}if(!Object.hasOwn(d,\""value\""))bad(\""FIELD\"");return d.value;};\nconst plain=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o)||Object.getPrototypeOf(o)!==Object.prototype)bad();return o;};\nconst text=(v,n)=>{if(typeof v!==\""string\""||v.length>n||!v.isWellFormed()||/[\\u0000-\\u001F\\u007F]/.test(v))bad();return v;};\nconst matches=(v,re)=>{const m=typeof v===\""string\""?re.exec(v):null;return m!==null&&m[0]===v;};\nplain(target);const targetKeys=[\""rawWindowsPath\"",\""projectUuid\"",\""branchUuid\"",\""documentUuid\"",\""expectedSourceSha256\""];\nif(Reflect.ownKeys(target).length!==5||targetKeys.some(k=>!Object.hasOwn(target,k)))bad();\nfor(const k of targetKeys)text(own(target,k),4096);\nif(!matches(target.projectUuid,/^[a-f0-9]{64}$/)||!matches(target.branchUuid,/^[a-f0-9]{32}$/)||!matches(target.documentUuid,/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/)||!matches(target.expectedSourceSha256,/^[a-f0-9]{64}$/)||!matches(target.rawWindowsPath,/^[A-Za-z]:\\\\[^\\u0000-\\u001F\\u007F<>:\""|?*/]+\\.eprj2$/)||![\""preflight\"",\""open-document\"",\""observe\""].includes(phase))bad();\nconst tabId=target.documentUuid+\""@\""+target.projectUuid;\nconst dense=(a,max)=>{if(!Array.isArray(a)||Object.getPrototypeOf(a)!==Array.prototype)bad();const n=own(a,\""length\"");if(!Number.isSafeInteger(n)||n<0||n>max||Reflect.ownKeys(a).length!==n+1)bad();for(let i=0;i<n;i++)own(a,String(i));return n;};\nconst method=(o,k)=>{const chain=[];let p=o;for(let i=0;i<4;i++){if(p===null||(typeof p!==\""object\""&&typeof p!==\""function\""))bad(\""METHOD\"");chain.push(p);const d=Object.getOwnPropertyDescriptor(p,k);if(d){if(!Object.hasOwn(d,\""value\"")||typeof d.value!==\""function\"")bad(\""METHOD\"");return {owner:o,key:k,chain,fn:d.value};}p=Object.getPrototypeOf(p);}bad(\""METHOD\"");};\nconst methodCheck=b=>{for(let i=0;i<b.chain.length;i++){const p=b.chain[i];if(i>0&&Object.getPrototypeOf(b.chain[i-1])!==p)bad(\""BINDING\"");if(i===b.chain.length-1){if(own(p,b.key)!==b.fn)bad(\""BINDING\"");}else if(Object.hasOwn(p,b.key))bad(\""BINDING\"");}};\nconst parseProjectUrl=(value,projectUuid,activeTabId)=>{\n if(typeof value!=='string'||value.length>32768||typeof projectUuid!=='string')bad();\n const projectMatch=/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/.exec(projectUuid);if(!projectMatch||projectMatch[0]!==projectUuid)bad();\n const pieces=value.split('#');if(pieces.length>2)bad();const base=pieces[0];\n const baseMatch=/^https:\\/\\/client\\/editor\\?cll=(?:trace|debug|info|warn|error)$/.exec(base);if(!baseMatch||baseMatch[0]!==base)bad();\n const fragment=pieces.length===1?'':pieces[1];\n if(fragment==='')return{base,empty:true,tabIds:[],activeTabId:null};\n const prefix='id='+projectUuid;if(fragment===prefix)return{base,empty:false,tabIds:[],activeTabId:null};\n if(!fragment.startsWith(prefix+',tab='))bad();const entries=fragment.slice(prefix.length+5).split('|');\n if(entries.length<1||entries.length>256)bad();const tabIds=[],seen=new Set();let markedTabId=null;\n for(const entry of entries){\n  const match=/^(\\*?)([a-f0-9]{16}|[a-f0-9]{32})@([a-f0-9]{32}|[a-f0-9]{64})$/.exec(entry);\n  if(!match||match[0]!==entry||match[3]!==projectUuid)bad();const tabId=match[2]+'@'+match[3];if(seen.has(tabId))bad();seen.add(tabId);tabIds.push(tabId);\n  if(match[1]==='*'){if(markedTabId!==null||(activeTabId!==undefined&&activeTabId!==null&&activeTabId!==tabId))bad();markedTabId=tabId;}\n }\n return{base,empty:false,tabIds,activeTabId:markedTabId};\n};\nconst location=root.location,document=root.document,initialHref=location?.href,initialUrl=parseProjectUrl(initialHref,target.projectUuid);\nif(initialUrl.empty)bad(\""URL\"");let retainedHref=initialHref;\nconst ui=own(root,\""UI\""),host=own(root,\""gVars\""),tabs=own(ui,\""tabBar\""),project=plain(own(host,\""currentProject\"")),mode=own(root,\""PRO_EDITOR_MODE\"");\nwindowTabId=own(root,\""_TAB_ID_\"");if(!matches(windowTabId,/^[A-Za-z0-9_-]{1,128}$/)||typeof tabs!==\""function\"")bad();\nconst active=method(tabs,\""getActiveTab\""),container=method(tabs,\""getContainerInfo\""),getTab=method(tabs,\""getTabById\"");\nconst bus=own(host,\""messageBus\""),registry=method(bus,\""rpcCall\""),apiBus=own(host,\""extensionApiMessageBus2\""),open=method(apiBus,\""rpcCall\"");\nconst select=document?.querySelectorAll,set=own(root,\""setTimeout\"");clear=own(root,\""clearTimeout\"");\nif(typeof select!==\""function\""||typeof set!==\""function\""||typeof clear!==\""function\"")bad();\nconst check=()=>{\nif(expired)bad(\""TIMEOUT\"");\nif(root.window!==root||root.top!==root||root.document!==document||root.location!==location||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==retainedHref||location?.href!==retainedHref||location?.origin!==\""https://client\""||document.querySelectorAll!==select)bad(\""URL\"");\nconst url=parseProjectUrl(retainedHref,target.projectUuid);if(url.empty||url.base!==initialUrl.base||url.tabIds.some(id=>id!==tabId)||url.activeTabId!==null&&url.activeTabId!==tabId)bad(\""URL\"");\nif(own(root,\""PRO_EDITOR_MODE\"")!==mode||![\""CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM\"",\""CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM\""].includes(mode))bad();\nif(own(root,\""gVars\"")!==host||own(root,\""UI\"")!==ui||own(ui,\""gVars\"")!==host||own(ui,\""tabBar\"")!==tabs||own(host,\""currentProject\"")!==project||own(host,\""messageBus\"")!==bus||own(host,\""extensionApiMessageBus2\"")!==apiBus||own(root,\""_MSG_BUS2_EXTAPI_\"")!==apiBus||own(root,\""_TAB_ID_\"")!==windowTabId||own(root,\""setTimeout\"")!==set||own(root,\""clearTimeout\"")!==clear)bad(\""BINDING\"");\nif(own(project,\""projectId\"")!==target.projectUuid||own(project,\""branchUuid\"")!==target.branchUuid||own(project,\""isV2Format\"")!==false||own(host,\""isHistoryMode\"")!==false)bad(\""PROJECT\"");\nfor(const b of [active,container,getTab,registry,open])methodCheck(b);\n};\nconst sample=required=>{\ncheck();const ids=own(tabs,\""containerIds\""),tree=plain(own(tabs,\""containerTree\""));\nif(dense(ids,1)!==1||own(ids,\""0\"")!==\""editor-window-main\""||own(tree,\""id\"")!==\""editor-window-main\""||own(tree,\""children\"",true)!==undefined||own(tabs,\""belongContainer\"")!==\""editor-window-main\"")bad(\""TAB\"");\nconst info=plain(apply(container.fn,tabs,[\""editor-window-main\""])),list=own(info,\""tabs\""),n=dense(list,3),current=own(tabs,\""currentTabId\"");\nif(n<1||own(info,\""id\"")!==\""editor-window-main\""||own(info,\""belong\"")!==\""editor-window-main\""||own(info,\""activeTabId\"")!==current||apply(active.fn,tabs,[])!==current)bad(\""TAB\"");\nconst owners=[ids,tree,info,list],rows=[],seen=new Set();let found=false;\nfor(let i=0;i<n;i++){const tab=plain(own(list,String(i))),id=text(own(tab,\""tabId\""),128),data=plain(own(tab,\""data\""));if(seen.has(id)||apply(getTab.fn,tabs,[id])!==tab)bad(\""TAB\"");seen.add(id);owners.push(tab,data);\nconst type=own(data,\""doctype\"");if(id===\""tab_page1\""||id===\""0\""){const start=id===\""tab_page1\"";if(type!==(start?-1:0)||own(tab,\""isAbleDelete\"")!==false||own(tab,\""group\"")!==\""start_blank\""||own(tab,\""draggable\"")!==start||typeof own(tab,\""isDisplayNone\"")!==\""boolean\""||!start&&own(tab,\""isDisplayNone\"")!==true)bad(\""TAB\"");\nconst declared=own(tab,\""documentType\"",true);if(declared!==undefined&&declared!==type)bad(\""TAB\"");for(const k of [\""pid\"",\""owner\""])if(own(data,k,true)!==undefined)bad(\""TAB\"");for(const k of [\""parentProjectUuid\"",\""parentLibraryUuid\""])if(own(tab,k,true)!==undefined)bad(\""TAB\"");\n}else{if(id!==tabId||type!==3||own(data,\""pid\"")!==target.projectUuid||own(tab,\""parentLibraryUuid\"",true)!==undefined)bad(\""TAB\"");const parent=own(tab,\""parentProjectUuid\"",true);if(parent!==undefined&&parent!==target.projectUuid)bad(\""TAB\"");found=true;}rows.push([id,type]);}\nif(!seen.has(current)||found!==required||required&&current!==tabId)bad(\""TAB\"");\nconst url=parseProjectUrl(retainedHref,target.projectUuid,current);if(url.tabIds.some(id=>!seen.has(id)))bad(\""URL\"");\nconst allFrames=apply(select,document,[\""iframe\""]);if(allFrames.length!==(required?1:0))bad(\""FRAME\"");\nreturn {owners,identity:JSON.stringify([rows,current]),frame:required?allFrames[0]:null};\n};\nconst same=(a,b)=>{if(a.identity!==b.identity||a.frame!==b.frame||a.owners.length!==b.owners.length||a.owners.some((o,i)=>o!==b.owners[i]))bad(\""BINDING\"");};\nconst registration=async required=>{const before=sample(required),reply=await apply(registry.fn,bus,[\""/pro-mgr/api/client/getProjectPaths\"",{},0]);check();same(before,sample(required));plain(reply);const message=plain(own(reply,\""message\""));if(own(message,\""success\"")!==true)bad(\""REGISTRY\"");const entries=plain(own(message,\""result\"")),keys=Reflect.ownKeys(entries);if(keys.length>4096||keys.some(k=>!matches(k,/^[a-f0-9]{64}$/)))bad(\""REGISTRY\"");const entry=plain(own(entries,target.projectUuid));if(own(entry,\""path\"")!==target.rawWindowsPath||own(entry,\""isCbb\"")!==false)bad(\""REGISTRY\"");return before;};\nconst observe=async()=>{\nconst before=sample(true),frame=before.frame,child=frame?.contentWindow,childDocument=child?.document,parent=frame?.parentElement,classes=frame?.classList;\nconst attribute=frame?.getAttribute,has=frame?.hasAttribute,contains=classes?.contains,parentAttribute=parent?.getAttribute;\nif(typeof attribute!==\""function\""||typeof has!==\""function\""||typeof contains!==\""function\""||typeof parentAttribute!==\""function\"")bad(\""FRAME\"");\nconst native=own(child,\""MSG_BUS_PCB\""),channel=own(native,\""messageBus\""),identity=method(channel,\""rpcCall\""),childObject=own(child,\""Object\""),childPrototype=own(childObject,\""prototype\"");\nconst frameCheck=()=>{check();same(before,sample(true));methodCheck(identity);\nif(frame.tagName!==\""IFRAME\""||frame.id!==\""frame_\""+tabId||frame.ownerDocument!==document||frame.isConnected!==true||frame.parentElement!==parent||frame.classList!==classes||classes.contains!==contains||frame.getAttribute!==attribute||frame.hasAttribute!==has||parent.getAttribute!==parentAttribute||!apply(contains,classes,[\""editframe\""])||apply(parentAttribute,parent,[\""uuid\""])!==tabId)bad(\""FRAME\"");\nfor(const [k,v] of [[\""c_dbid\"",tabId],[\""c_doctype\"",\""3\""],[\""src\"",\""editor?entry=pcb\""],[\""pcb-canvas\"",\""true\""]])if(apply(attribute,frame,[k])!==v)bad(\""FRAME\"");for(const k of [\""blankIframe\"",\""fromFile\"",\""jsonCacheReady\""])if(apply(has,frame,[k]))bad(\""FRAME\"");\nif(frame.contentWindow!==child||child.document!==childDocument||childDocument?.defaultView!==child||childDocument?.nodeType!==9||child.frameElement!==frame||child.parent!==root||child.top!==root||child.location?.href!==\""https://client/editor?entry=pcb\""||own(child,\""MSG_BUS_PCB\"")!==native||own(native,\""messageBus\"")!==channel||own(child,\""Object\"")!==childObject||own(childObject,\""prototype\"")!==childPrototype)bad(\""FRAME\"");\n};\nconst childPlain=v=>{if(v===null||typeof v!==\""object\""||Array.isArray(v))bad(\""FRAME\"");const p=Object.getPrototypeOf(v);if(p!==Object.prototype&&p!==childPrototype)bad(\""FRAME\"");return v;};\nfor(let i=0;i<2;i++){frameCheck();const reply=childPlain(await apply(identity.fn,channel,[\""getTabIdAndDocType\"",undefined,0]));frameCheck();const value=childPlain(own(reply,\""message\""));if(Reflect.ownKeys(value).length!==2||own(value,\""tabId\"")!==tabId||own(value,\""docType\"")!==3)bad(\""FRAME\"");}\nframeObserved=true;\n};\nconst run=async()=>{\nstage=\""registration-before\"";const initial=await registration(phase===\""observe\"");check();\nif(phase===\""open-document\""){same(initial,sample(false));stage=\""dispatch\"";dispatchAttempted=true;publicResult=await apply(open.fn,apiBus,[\""extensionApi.DMT_EditorControl.openDocument\"",{documentUuid:target.documentUuid,splitScreenId:undefined}]);stage=\""acknowledgement\"";retainedHref=location?.href;check();if(publicResult===undefined)publicResult=null;if(publicResult!==tabId)bad(\""ACK\"");}\nstage=\""registration-after\"";await registration(phase!==\""preflight\"");\nif(phase===\""observe\""){stage=\""frame\"";await observe();check();}\nstage=\""output\"";return {ok:true,status:phase===\""preflight\""?\""ready\"":phase===\""open-document\""?\""opened\"":\""frame-observed\"",failure:null};\n};\ncheck();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;code=\""TIMEOUT\"";reject(new Error(\""PCB_DIAGNOSTIC_PCB_OPENING\""));},phase===\""open-document\""?45000:10000]);});\noutcome=await Promise.race([run(),timeout]);\n}catch{outcome={ok:false,status:\""refused\"",failure:{stage,code}};}\nfinally{if(timer!==undefined&&typeof clear===\""function\""){try{Reflect.apply(clear,globalThis,[timer]);}catch{outcome={ok:false,status:\""refused\"",failure:{stage:\""cleanup\"",code:\""CLEANUP\""}};}}}\nif(publicResult!==target.documentUuid+\""@\""+target.projectUuid)publicResult=null;\nif(typeof windowTabId!==\""string\""||!/^[A-Za-z0-9_-]{1,128}$/.test(windowTabId))windowTabId=null;\nreturn JSON.stringify({schema:\""easyeda-pro-control.pcb-diagnostic-pcb-opening.v1\"",phase,projectUuid:target.projectUuid,branchUuid:target.branchUuid,documentUuid:target.documentUuid,tabId:target.documentUuid+\""@\""+target.projectUuid,...outcome,dispatchAttempted,publicResult,nativeWorkMayRemain:dispatchAttempted,frameObserved,windowTabId});\n}"",""uniqueContextId"":""original-context"",""arguments"":[{""value"":{""rawWindowsPath"":""C:\\Synthetic\\worker-startup.eprj2"",""projectUuid"":""4bf2a6592ee5b3be42e82ea5960359983f837bb7bc2336249d61f5278ca43bfb"",""documentUuid"":""dddddddddddddddd"",""expectedSourceSha256"":""eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"",""branchUuid"":""bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb""}},{""value"":""preflight""}],""returnByValue"":true,""awaitPromise"":true,""silent"":true,""generatePreview"":false,""userGesture"":false,""throwOnSideEffect"":false},""sessionId"":""original-session""}"+"\0","smoke-parent-parity");
    fields.Clear();
    fields.Add(@"sessionId",@"original-session");
    fields.Add(@"uniqueContextId",@"original-context");
    fields.Add(@"targetRawWindowsPath",@"C:\Synthetic\worker-startup.eprj2");
    fields.Add(@"targetProjectUuid",@"4bf2a6592ee5b3be42e82ea5960359983f837bb7bc2336249d61f5278ca43bfb");
    fields.Add(@"targetBranchUuid",@"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
    fields.Add(@"targetDocumentUuid",@"dddddddddddddddd");
    fields.Add(@"targetExpectedSourceSha256",@"eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
    Need(EasyedaDiagnosticOwner.WorkerStartupParentProtocolMessage(256,@"Runtime.callFunctionOn",@"pcb-open-document",fields)==@"{""id"":256,""method"":""Runtime.callFunctionOn"",""params"":{""functionDeclaration"":""async function(target,phase){\n\""use strict\"";\nlet stage=\""setup\"",code=\""EXCEPTION\"",dispatchAttempted=false,publicResult=null,frameObserved=false,windowTabId=null,timer,clear,expired=false,outcome;\nconst bad=(value=\""GUARD\"")=>{code=value;throw new Error(\""PCB_DIAGNOSTIC_PCB_OPENING\"");};\ntry{\nconst root=globalThis,apply=Reflect.apply;\nconst own=(o,k,optional=false)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad(\""FIELD\"");const d=Object.getOwnPropertyDescriptor(o,k);if(!d){if(optional&&!(k in o))return undefined;bad(\""FIELD\"");}if(!Object.hasOwn(d,\""value\""))bad(\""FIELD\"");return d.value;};\nconst plain=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o)||Object.getPrototypeOf(o)!==Object.prototype)bad();return o;};\nconst text=(v,n)=>{if(typeof v!==\""string\""||v.length>n||!v.isWellFormed()||/[\\u0000-\\u001F\\u007F]/.test(v))bad();return v;};\nconst matches=(v,re)=>{const m=typeof v===\""string\""?re.exec(v):null;return m!==null&&m[0]===v;};\nplain(target);const targetKeys=[\""rawWindowsPath\"",\""projectUuid\"",\""branchUuid\"",\""documentUuid\"",\""expectedSourceSha256\""];\nif(Reflect.ownKeys(target).length!==5||targetKeys.some(k=>!Object.hasOwn(target,k)))bad();\nfor(const k of targetKeys)text(own(target,k),4096);\nif(!matches(target.projectUuid,/^[a-f0-9]{64}$/)||!matches(target.branchUuid,/^[a-f0-9]{32}$/)||!matches(target.documentUuid,/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/)||!matches(target.expectedSourceSha256,/^[a-f0-9]{64}$/)||!matches(target.rawWindowsPath,/^[A-Za-z]:\\\\[^\\u0000-\\u001F\\u007F<>:\""|?*/]+\\.eprj2$/)||![\""preflight\"",\""open-document\"",\""observe\""].includes(phase))bad();\nconst tabId=target.documentUuid+\""@\""+target.projectUuid;\nconst dense=(a,max)=>{if(!Array.isArray(a)||Object.getPrototypeOf(a)!==Array.prototype)bad();const n=own(a,\""length\"");if(!Number.isSafeInteger(n)||n<0||n>max||Reflect.ownKeys(a).length!==n+1)bad();for(let i=0;i<n;i++)own(a,String(i));return n;};\nconst method=(o,k)=>{const chain=[];let p=o;for(let i=0;i<4;i++){if(p===null||(typeof p!==\""object\""&&typeof p!==\""function\""))bad(\""METHOD\"");chain.push(p);const d=Object.getOwnPropertyDescriptor(p,k);if(d){if(!Object.hasOwn(d,\""value\"")||typeof d.value!==\""function\"")bad(\""METHOD\"");return {owner:o,key:k,chain,fn:d.value};}p=Object.getPrototypeOf(p);}bad(\""METHOD\"");};\nconst methodCheck=b=>{for(let i=0;i<b.chain.length;i++){const p=b.chain[i];if(i>0&&Object.getPrototypeOf(b.chain[i-1])!==p)bad(\""BINDING\"");if(i===b.chain.length-1){if(own(p,b.key)!==b.fn)bad(\""BINDING\"");}else if(Object.hasOwn(p,b.key))bad(\""BINDING\"");}};\nconst parseProjectUrl=(value,projectUuid,activeTabId)=>{\n if(typeof value!=='string'||value.length>32768||typeof projectUuid!=='string')bad();\n const projectMatch=/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/.exec(projectUuid);if(!projectMatch||projectMatch[0]!==projectUuid)bad();\n const pieces=value.split('#');if(pieces.length>2)bad();const base=pieces[0];\n const baseMatch=/^https:\\/\\/client\\/editor\\?cll=(?:trace|debug|info|warn|error)$/.exec(base);if(!baseMatch||baseMatch[0]!==base)bad();\n const fragment=pieces.length===1?'':pieces[1];\n if(fragment==='')return{base,empty:true,tabIds:[],activeTabId:null};\n const prefix='id='+projectUuid;if(fragment===prefix)return{base,empty:false,tabIds:[],activeTabId:null};\n if(!fragment.startsWith(prefix+',tab='))bad();const entries=fragment.slice(prefix.length+5).split('|');\n if(entries.length<1||entries.length>256)bad();const tabIds=[],seen=new Set();let markedTabId=null;\n for(const entry of entries){\n  const match=/^(\\*?)([a-f0-9]{16}|[a-f0-9]{32})@([a-f0-9]{32}|[a-f0-9]{64})$/.exec(entry);\n  if(!match||match[0]!==entry||match[3]!==projectUuid)bad();const tabId=match[2]+'@'+match[3];if(seen.has(tabId))bad();seen.add(tabId);tabIds.push(tabId);\n  if(match[1]==='*'){if(markedTabId!==null||(activeTabId!==undefined&&activeTabId!==null&&activeTabId!==tabId))bad();markedTabId=tabId;}\n }\n return{base,empty:false,tabIds,activeTabId:markedTabId};\n};\nconst location=root.location,document=root.document,initialHref=location?.href,initialUrl=parseProjectUrl(initialHref,target.projectUuid);\nif(initialUrl.empty)bad(\""URL\"");let retainedHref=initialHref;\nconst ui=own(root,\""UI\""),host=own(root,\""gVars\""),tabs=own(ui,\""tabBar\""),project=plain(own(host,\""currentProject\"")),mode=own(root,\""PRO_EDITOR_MODE\"");\nwindowTabId=own(root,\""_TAB_ID_\"");if(!matches(windowTabId,/^[A-Za-z0-9_-]{1,128}$/)||typeof tabs!==\""function\"")bad();\nconst active=method(tabs,\""getActiveTab\""),container=method(tabs,\""getContainerInfo\""),getTab=method(tabs,\""getTabById\"");\nconst bus=own(host,\""messageBus\""),registry=method(bus,\""rpcCall\""),apiBus=own(host,\""extensionApiMessageBus2\""),open=method(apiBus,\""rpcCall\"");\nconst select=document?.querySelectorAll,set=own(root,\""setTimeout\"");clear=own(root,\""clearTimeout\"");\nif(typeof select!==\""function\""||typeof set!==\""function\""||typeof clear!==\""function\"")bad();\nconst check=()=>{\nif(expired)bad(\""TIMEOUT\"");\nif(root.window!==root||root.top!==root||root.document!==document||root.location!==location||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==retainedHref||location?.href!==retainedHref||location?.origin!==\""https://client\""||document.querySelectorAll!==select)bad(\""URL\"");\nconst url=parseProjectUrl(retainedHref,target.projectUuid);if(url.empty||url.base!==initialUrl.base||url.tabIds.some(id=>id!==tabId)||url.activeTabId!==null&&url.activeTabId!==tabId)bad(\""URL\"");\nif(own(root,\""PRO_EDITOR_MODE\"")!==mode||![\""CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM\"",\""CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM\""].includes(mode))bad();\nif(own(root,\""gVars\"")!==host||own(root,\""UI\"")!==ui||own(ui,\""gVars\"")!==host||own(ui,\""tabBar\"")!==tabs||own(host,\""currentProject\"")!==project||own(host,\""messageBus\"")!==bus||own(host,\""extensionApiMessageBus2\"")!==apiBus||own(root,\""_MSG_BUS2_EXTAPI_\"")!==apiBus||own(root,\""_TAB_ID_\"")!==windowTabId||own(root,\""setTimeout\"")!==set||own(root,\""clearTimeout\"")!==clear)bad(\""BINDING\"");\nif(own(project,\""projectId\"")!==target.projectUuid||own(project,\""branchUuid\"")!==target.branchUuid||own(project,\""isV2Format\"")!==false||own(host,\""isHistoryMode\"")!==false)bad(\""PROJECT\"");\nfor(const b of [active,container,getTab,registry,open])methodCheck(b);\n};\nconst sample=required=>{\ncheck();const ids=own(tabs,\""containerIds\""),tree=plain(own(tabs,\""containerTree\""));\nif(dense(ids,1)!==1||own(ids,\""0\"")!==\""editor-window-main\""||own(tree,\""id\"")!==\""editor-window-main\""||own(tree,\""children\"",true)!==undefined||own(tabs,\""belongContainer\"")!==\""editor-window-main\"")bad(\""TAB\"");\nconst info=plain(apply(container.fn,tabs,[\""editor-window-main\""])),list=own(info,\""tabs\""),n=dense(list,3),current=own(tabs,\""currentTabId\"");\nif(n<1||own(info,\""id\"")!==\""editor-window-main\""||own(info,\""belong\"")!==\""editor-window-main\""||own(info,\""activeTabId\"")!==current||apply(active.fn,tabs,[])!==current)bad(\""TAB\"");\nconst owners=[ids,tree,info,list],rows=[],seen=new Set();let found=false;\nfor(let i=0;i<n;i++){const tab=plain(own(list,String(i))),id=text(own(tab,\""tabId\""),128),data=plain(own(tab,\""data\""));if(seen.has(id)||apply(getTab.fn,tabs,[id])!==tab)bad(\""TAB\"");seen.add(id);owners.push(tab,data);\nconst type=own(data,\""doctype\"");if(id===\""tab_page1\""||id===\""0\""){const start=id===\""tab_page1\"";if(type!==(start?-1:0)||own(tab,\""isAbleDelete\"")!==false||own(tab,\""group\"")!==\""start_blank\""||own(tab,\""draggable\"")!==start||typeof own(tab,\""isDisplayNone\"")!==\""boolean\""||!start&&own(tab,\""isDisplayNone\"")!==true)bad(\""TAB\"");\nconst declared=own(tab,\""documentType\"",true);if(declared!==undefined&&declared!==type)bad(\""TAB\"");for(const k of [\""pid\"",\""owner\""])if(own(data,k,true)!==undefined)bad(\""TAB\"");for(const k of [\""parentProjectUuid\"",\""parentLibraryUuid\""])if(own(tab,k,true)!==undefined)bad(\""TAB\"");\n}else{if(id!==tabId||type!==3||own(data,\""pid\"")!==target.projectUuid||own(tab,\""parentLibraryUuid\"",true)!==undefined)bad(\""TAB\"");const parent=own(tab,\""parentProjectUuid\"",true);if(parent!==undefined&&parent!==target.projectUuid)bad(\""TAB\"");found=true;}rows.push([id,type]);}\nif(!seen.has(current)||found!==required||required&&current!==tabId)bad(\""TAB\"");\nconst url=parseProjectUrl(retainedHref,target.projectUuid,current);if(url.tabIds.some(id=>!seen.has(id)))bad(\""URL\"");\nconst allFrames=apply(select,document,[\""iframe\""]);if(allFrames.length!==(required?1:0))bad(\""FRAME\"");\nreturn {owners,identity:JSON.stringify([rows,current]),frame:required?allFrames[0]:null};\n};\nconst same=(a,b)=>{if(a.identity!==b.identity||a.frame!==b.frame||a.owners.length!==b.owners.length||a.owners.some((o,i)=>o!==b.owners[i]))bad(\""BINDING\"");};\nconst registration=async required=>{const before=sample(required),reply=await apply(registry.fn,bus,[\""/pro-mgr/api/client/getProjectPaths\"",{},0]);check();same(before,sample(required));plain(reply);const message=plain(own(reply,\""message\""));if(own(message,\""success\"")!==true)bad(\""REGISTRY\"");const entries=plain(own(message,\""result\"")),keys=Reflect.ownKeys(entries);if(keys.length>4096||keys.some(k=>!matches(k,/^[a-f0-9]{64}$/)))bad(\""REGISTRY\"");const entry=plain(own(entries,target.projectUuid));if(own(entry,\""path\"")!==target.rawWindowsPath||own(entry,\""isCbb\"")!==false)bad(\""REGISTRY\"");return before;};\nconst observe=async()=>{\nconst before=sample(true),frame=before.frame,child=frame?.contentWindow,childDocument=child?.document,parent=frame?.parentElement,classes=frame?.classList;\nconst attribute=frame?.getAttribute,has=frame?.hasAttribute,contains=classes?.contains,parentAttribute=parent?.getAttribute;\nif(typeof attribute!==\""function\""||typeof has!==\""function\""||typeof contains!==\""function\""||typeof parentAttribute!==\""function\"")bad(\""FRAME\"");\nconst native=own(child,\""MSG_BUS_PCB\""),channel=own(native,\""messageBus\""),identity=method(channel,\""rpcCall\""),childObject=own(child,\""Object\""),childPrototype=own(childObject,\""prototype\"");\nconst frameCheck=()=>{check();same(before,sample(true));methodCheck(identity);\nif(frame.tagName!==\""IFRAME\""||frame.id!==\""frame_\""+tabId||frame.ownerDocument!==document||frame.isConnected!==true||frame.parentElement!==parent||frame.classList!==classes||classes.contains!==contains||frame.getAttribute!==attribute||frame.hasAttribute!==has||parent.getAttribute!==parentAttribute||!apply(contains,classes,[\""editframe\""])||apply(parentAttribute,parent,[\""uuid\""])!==tabId)bad(\""FRAME\"");\nfor(const [k,v] of [[\""c_dbid\"",tabId],[\""c_doctype\"",\""3\""],[\""src\"",\""editor?entry=pcb\""],[\""pcb-canvas\"",\""true\""]])if(apply(attribute,frame,[k])!==v)bad(\""FRAME\"");for(const k of [\""blankIframe\"",\""fromFile\"",\""jsonCacheReady\""])if(apply(has,frame,[k]))bad(\""FRAME\"");\nif(frame.contentWindow!==child||child.document!==childDocument||childDocument?.defaultView!==child||childDocument?.nodeType!==9||child.frameElement!==frame||child.parent!==root||child.top!==root||child.location?.href!==\""https://client/editor?entry=pcb\""||own(child,\""MSG_BUS_PCB\"")!==native||own(native,\""messageBus\"")!==channel||own(child,\""Object\"")!==childObject||own(childObject,\""prototype\"")!==childPrototype)bad(\""FRAME\"");\n};\nconst childPlain=v=>{if(v===null||typeof v!==\""object\""||Array.isArray(v))bad(\""FRAME\"");const p=Object.getPrototypeOf(v);if(p!==Object.prototype&&p!==childPrototype)bad(\""FRAME\"");return v;};\nfor(let i=0;i<2;i++){frameCheck();const reply=childPlain(await apply(identity.fn,channel,[\""getTabIdAndDocType\"",undefined,0]));frameCheck();const value=childPlain(own(reply,\""message\""));if(Reflect.ownKeys(value).length!==2||own(value,\""tabId\"")!==tabId||own(value,\""docType\"")!==3)bad(\""FRAME\"");}\nframeObserved=true;\n};\nconst run=async()=>{\nstage=\""registration-before\"";const initial=await registration(phase===\""observe\"");check();\nif(phase===\""open-document\""){same(initial,sample(false));stage=\""dispatch\"";dispatchAttempted=true;publicResult=await apply(open.fn,apiBus,[\""extensionApi.DMT_EditorControl.openDocument\"",{documentUuid:target.documentUuid,splitScreenId:undefined}]);stage=\""acknowledgement\"";retainedHref=location?.href;check();if(publicResult===undefined)publicResult=null;if(publicResult!==tabId)bad(\""ACK\"");}\nstage=\""registration-after\"";await registration(phase!==\""preflight\"");\nif(phase===\""observe\""){stage=\""frame\"";await observe();check();}\nstage=\""output\"";return {ok:true,status:phase===\""preflight\""?\""ready\"":phase===\""open-document\""?\""opened\"":\""frame-observed\"",failure:null};\n};\ncheck();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;code=\""TIMEOUT\"";reject(new Error(\""PCB_DIAGNOSTIC_PCB_OPENING\""));},phase===\""open-document\""?45000:10000]);});\noutcome=await Promise.race([run(),timeout]);\n}catch{outcome={ok:false,status:\""refused\"",failure:{stage,code}};}\nfinally{if(timer!==undefined&&typeof clear===\""function\""){try{Reflect.apply(clear,globalThis,[timer]);}catch{outcome={ok:false,status:\""refused\"",failure:{stage:\""cleanup\"",code:\""CLEANUP\""}};}}}\nif(publicResult!==target.documentUuid+\""@\""+target.projectUuid)publicResult=null;\nif(typeof windowTabId!==\""string\""||!/^[A-Za-z0-9_-]{1,128}$/.test(windowTabId))windowTabId=null;\nreturn JSON.stringify({schema:\""easyeda-pro-control.pcb-diagnostic-pcb-opening.v1\"",phase,projectUuid:target.projectUuid,branchUuid:target.branchUuid,documentUuid:target.documentUuid,tabId:target.documentUuid+\""@\""+target.projectUuid,...outcome,dispatchAttempted,publicResult,nativeWorkMayRemain:dispatchAttempted,frameObserved,windowTabId});\n}"",""uniqueContextId"":""original-context"",""arguments"":[{""value"":{""rawWindowsPath"":""C:\\Synthetic\\worker-startup.eprj2"",""projectUuid"":""4bf2a6592ee5b3be42e82ea5960359983f837bb7bc2336249d61f5278ca43bfb"",""documentUuid"":""dddddddddddddddd"",""expectedSourceSha256"":""eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"",""branchUuid"":""bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb""}},{""value"":""open-document""}],""returnByValue"":true,""awaitPromise"":true,""silent"":true,""generatePreview"":false,""userGesture"":false,""throwOnSideEffect"":false},""sessionId"":""original-session""}"+"\0","smoke-parent-parity");
    fields.Clear();
    fields.Add(@"sessionId",@"original-session");
    fields.Add(@"uniqueContextId",@"original-context");
    fields.Add(@"targetRawWindowsPath",@"C:\Synthetic\worker-startup.eprj2");
    fields.Add(@"targetProjectUuid",@"4bf2a6592ee5b3be42e82ea5960359983f837bb7bc2336249d61f5278ca43bfb");
    fields.Add(@"targetBranchUuid",@"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
    fields.Add(@"targetDocumentUuid",@"dddddddddddddddd");
    fields.Add(@"targetExpectedSourceSha256",@"eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
    Need(EasyedaDiagnosticOwner.WorkerStartupParentProtocolMessage(256,@"Runtime.callFunctionOn",@"pcb-observe",fields)==@"{""id"":256,""method"":""Runtime.callFunctionOn"",""params"":{""functionDeclaration"":""async function(target,phase){\n\""use strict\"";\nlet stage=\""setup\"",code=\""EXCEPTION\"",dispatchAttempted=false,publicResult=null,frameObserved=false,windowTabId=null,timer,clear,expired=false,outcome;\nconst bad=(value=\""GUARD\"")=>{code=value;throw new Error(\""PCB_DIAGNOSTIC_PCB_OPENING\"");};\ntry{\nconst root=globalThis,apply=Reflect.apply;\nconst own=(o,k,optional=false)=>{if(o===null||(typeof o!==\""object\""&&typeof o!==\""function\""))bad(\""FIELD\"");const d=Object.getOwnPropertyDescriptor(o,k);if(!d){if(optional&&!(k in o))return undefined;bad(\""FIELD\"");}if(!Object.hasOwn(d,\""value\""))bad(\""FIELD\"");return d.value;};\nconst plain=o=>{if(o===null||typeof o!==\""object\""||Array.isArray(o)||Object.getPrototypeOf(o)!==Object.prototype)bad();return o;};\nconst text=(v,n)=>{if(typeof v!==\""string\""||v.length>n||!v.isWellFormed()||/[\\u0000-\\u001F\\u007F]/.test(v))bad();return v;};\nconst matches=(v,re)=>{const m=typeof v===\""string\""?re.exec(v):null;return m!==null&&m[0]===v;};\nplain(target);const targetKeys=[\""rawWindowsPath\"",\""projectUuid\"",\""branchUuid\"",\""documentUuid\"",\""expectedSourceSha256\""];\nif(Reflect.ownKeys(target).length!==5||targetKeys.some(k=>!Object.hasOwn(target,k)))bad();\nfor(const k of targetKeys)text(own(target,k),4096);\nif(!matches(target.projectUuid,/^[a-f0-9]{64}$/)||!matches(target.branchUuid,/^[a-f0-9]{32}$/)||!matches(target.documentUuid,/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/)||!matches(target.expectedSourceSha256,/^[a-f0-9]{64}$/)||!matches(target.rawWindowsPath,/^[A-Za-z]:\\\\[^\\u0000-\\u001F\\u007F<>:\""|?*/]+\\.eprj2$/)||![\""preflight\"",\""open-document\"",\""observe\""].includes(phase))bad();\nconst tabId=target.documentUuid+\""@\""+target.projectUuid;\nconst dense=(a,max)=>{if(!Array.isArray(a)||Object.getPrototypeOf(a)!==Array.prototype)bad();const n=own(a,\""length\"");if(!Number.isSafeInteger(n)||n<0||n>max||Reflect.ownKeys(a).length!==n+1)bad();for(let i=0;i<n;i++)own(a,String(i));return n;};\nconst method=(o,k)=>{const chain=[];let p=o;for(let i=0;i<4;i++){if(p===null||(typeof p!==\""object\""&&typeof p!==\""function\""))bad(\""METHOD\"");chain.push(p);const d=Object.getOwnPropertyDescriptor(p,k);if(d){if(!Object.hasOwn(d,\""value\"")||typeof d.value!==\""function\"")bad(\""METHOD\"");return {owner:o,key:k,chain,fn:d.value};}p=Object.getPrototypeOf(p);}bad(\""METHOD\"");};\nconst methodCheck=b=>{for(let i=0;i<b.chain.length;i++){const p=b.chain[i];if(i>0&&Object.getPrototypeOf(b.chain[i-1])!==p)bad(\""BINDING\"");if(i===b.chain.length-1){if(own(p,b.key)!==b.fn)bad(\""BINDING\"");}else if(Object.hasOwn(p,b.key))bad(\""BINDING\"");}};\nconst parseProjectUrl=(value,projectUuid,activeTabId)=>{\n if(typeof value!=='string'||value.length>32768||typeof projectUuid!=='string')bad();\n const projectMatch=/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/.exec(projectUuid);if(!projectMatch||projectMatch[0]!==projectUuid)bad();\n const pieces=value.split('#');if(pieces.length>2)bad();const base=pieces[0];\n const baseMatch=/^https:\\/\\/client\\/editor\\?cll=(?:trace|debug|info|warn|error)$/.exec(base);if(!baseMatch||baseMatch[0]!==base)bad();\n const fragment=pieces.length===1?'':pieces[1];\n if(fragment==='')return{base,empty:true,tabIds:[],activeTabId:null};\n const prefix='id='+projectUuid;if(fragment===prefix)return{base,empty:false,tabIds:[],activeTabId:null};\n if(!fragment.startsWith(prefix+',tab='))bad();const entries=fragment.slice(prefix.length+5).split('|');\n if(entries.length<1||entries.length>256)bad();const tabIds=[],seen=new Set();let markedTabId=null;\n for(const entry of entries){\n  const match=/^(\\*?)([a-f0-9]{16}|[a-f0-9]{32})@([a-f0-9]{32}|[a-f0-9]{64})$/.exec(entry);\n  if(!match||match[0]!==entry||match[3]!==projectUuid)bad();const tabId=match[2]+'@'+match[3];if(seen.has(tabId))bad();seen.add(tabId);tabIds.push(tabId);\n  if(match[1]==='*'){if(markedTabId!==null||(activeTabId!==undefined&&activeTabId!==null&&activeTabId!==tabId))bad();markedTabId=tabId;}\n }\n return{base,empty:false,tabIds,activeTabId:markedTabId};\n};\nconst location=root.location,document=root.document,initialHref=location?.href,initialUrl=parseProjectUrl(initialHref,target.projectUuid);\nif(initialUrl.empty)bad(\""URL\"");let retainedHref=initialHref;\nconst ui=own(root,\""UI\""),host=own(root,\""gVars\""),tabs=own(ui,\""tabBar\""),project=plain(own(host,\""currentProject\"")),mode=own(root,\""PRO_EDITOR_MODE\"");\nwindowTabId=own(root,\""_TAB_ID_\"");if(!matches(windowTabId,/^[A-Za-z0-9_-]{1,128}$/)||typeof tabs!==\""function\"")bad();\nconst active=method(tabs,\""getActiveTab\""),container=method(tabs,\""getContainerInfo\""),getTab=method(tabs,\""getTabById\"");\nconst bus=own(host,\""messageBus\""),registry=method(bus,\""rpcCall\""),apiBus=own(host,\""extensionApiMessageBus2\""),open=method(apiBus,\""rpcCall\"");\nconst select=document?.querySelectorAll,set=own(root,\""setTimeout\"");clear=own(root,\""clearTimeout\"");\nif(typeof select!==\""function\""||typeof set!==\""function\""||typeof clear!==\""function\"")bad();\nconst check=()=>{\nif(expired)bad(\""TIMEOUT\"");\nif(root.window!==root||root.top!==root||root.document!==document||root.location!==location||document?.defaultView!==root||document?.nodeType!==9||document?.URL!==retainedHref||location?.href!==retainedHref||location?.origin!==\""https://client\""||document.querySelectorAll!==select)bad(\""URL\"");\nconst url=parseProjectUrl(retainedHref,target.projectUuid);if(url.empty||url.base!==initialUrl.base||url.tabIds.some(id=>id!==tabId)||url.activeTabId!==null&&url.activeTabId!==tabId)bad(\""URL\"");\nif(own(root,\""PRO_EDITOR_MODE\"")!==mode||![\""CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM\"",\""CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM\""].includes(mode))bad();\nif(own(root,\""gVars\"")!==host||own(root,\""UI\"")!==ui||own(ui,\""gVars\"")!==host||own(ui,\""tabBar\"")!==tabs||own(host,\""currentProject\"")!==project||own(host,\""messageBus\"")!==bus||own(host,\""extensionApiMessageBus2\"")!==apiBus||own(root,\""_MSG_BUS2_EXTAPI_\"")!==apiBus||own(root,\""_TAB_ID_\"")!==windowTabId||own(root,\""setTimeout\"")!==set||own(root,\""clearTimeout\"")!==clear)bad(\""BINDING\"");\nif(own(project,\""projectId\"")!==target.projectUuid||own(project,\""branchUuid\"")!==target.branchUuid||own(project,\""isV2Format\"")!==false||own(host,\""isHistoryMode\"")!==false)bad(\""PROJECT\"");\nfor(const b of [active,container,getTab,registry,open])methodCheck(b);\n};\nconst sample=required=>{\ncheck();const ids=own(tabs,\""containerIds\""),tree=plain(own(tabs,\""containerTree\""));\nif(dense(ids,1)!==1||own(ids,\""0\"")!==\""editor-window-main\""||own(tree,\""id\"")!==\""editor-window-main\""||own(tree,\""children\"",true)!==undefined||own(tabs,\""belongContainer\"")!==\""editor-window-main\"")bad(\""TAB\"");\nconst info=plain(apply(container.fn,tabs,[\""editor-window-main\""])),list=own(info,\""tabs\""),n=dense(list,3),current=own(tabs,\""currentTabId\"");\nif(n<1||own(info,\""id\"")!==\""editor-window-main\""||own(info,\""belong\"")!==\""editor-window-main\""||own(info,\""activeTabId\"")!==current||apply(active.fn,tabs,[])!==current)bad(\""TAB\"");\nconst owners=[ids,tree,info,list],rows=[],seen=new Set();let found=false;\nfor(let i=0;i<n;i++){const tab=plain(own(list,String(i))),id=text(own(tab,\""tabId\""),128),data=plain(own(tab,\""data\""));if(seen.has(id)||apply(getTab.fn,tabs,[id])!==tab)bad(\""TAB\"");seen.add(id);owners.push(tab,data);\nconst type=own(data,\""doctype\"");if(id===\""tab_page1\""||id===\""0\""){const start=id===\""tab_page1\"";if(type!==(start?-1:0)||own(tab,\""isAbleDelete\"")!==false||own(tab,\""group\"")!==\""start_blank\""||own(tab,\""draggable\"")!==start||typeof own(tab,\""isDisplayNone\"")!==\""boolean\""||!start&&own(tab,\""isDisplayNone\"")!==true)bad(\""TAB\"");\nconst declared=own(tab,\""documentType\"",true);if(declared!==undefined&&declared!==type)bad(\""TAB\"");for(const k of [\""pid\"",\""owner\""])if(own(data,k,true)!==undefined)bad(\""TAB\"");for(const k of [\""parentProjectUuid\"",\""parentLibraryUuid\""])if(own(tab,k,true)!==undefined)bad(\""TAB\"");\n}else{if(id!==tabId||type!==3||own(data,\""pid\"")!==target.projectUuid||own(tab,\""parentLibraryUuid\"",true)!==undefined)bad(\""TAB\"");const parent=own(tab,\""parentProjectUuid\"",true);if(parent!==undefined&&parent!==target.projectUuid)bad(\""TAB\"");found=true;}rows.push([id,type]);}\nif(!seen.has(current)||found!==required||required&&current!==tabId)bad(\""TAB\"");\nconst url=parseProjectUrl(retainedHref,target.projectUuid,current);if(url.tabIds.some(id=>!seen.has(id)))bad(\""URL\"");\nconst allFrames=apply(select,document,[\""iframe\""]);if(allFrames.length!==(required?1:0))bad(\""FRAME\"");\nreturn {owners,identity:JSON.stringify([rows,current]),frame:required?allFrames[0]:null};\n};\nconst same=(a,b)=>{if(a.identity!==b.identity||a.frame!==b.frame||a.owners.length!==b.owners.length||a.owners.some((o,i)=>o!==b.owners[i]))bad(\""BINDING\"");};\nconst registration=async required=>{const before=sample(required),reply=await apply(registry.fn,bus,[\""/pro-mgr/api/client/getProjectPaths\"",{},0]);check();same(before,sample(required));plain(reply);const message=plain(own(reply,\""message\""));if(own(message,\""success\"")!==true)bad(\""REGISTRY\"");const entries=plain(own(message,\""result\"")),keys=Reflect.ownKeys(entries);if(keys.length>4096||keys.some(k=>!matches(k,/^[a-f0-9]{64}$/)))bad(\""REGISTRY\"");const entry=plain(own(entries,target.projectUuid));if(own(entry,\""path\"")!==target.rawWindowsPath||own(entry,\""isCbb\"")!==false)bad(\""REGISTRY\"");return before;};\nconst observe=async()=>{\nconst before=sample(true),frame=before.frame,child=frame?.contentWindow,childDocument=child?.document,parent=frame?.parentElement,classes=frame?.classList;\nconst attribute=frame?.getAttribute,has=frame?.hasAttribute,contains=classes?.contains,parentAttribute=parent?.getAttribute;\nif(typeof attribute!==\""function\""||typeof has!==\""function\""||typeof contains!==\""function\""||typeof parentAttribute!==\""function\"")bad(\""FRAME\"");\nconst native=own(child,\""MSG_BUS_PCB\""),channel=own(native,\""messageBus\""),identity=method(channel,\""rpcCall\""),childObject=own(child,\""Object\""),childPrototype=own(childObject,\""prototype\"");\nconst frameCheck=()=>{check();same(before,sample(true));methodCheck(identity);\nif(frame.tagName!==\""IFRAME\""||frame.id!==\""frame_\""+tabId||frame.ownerDocument!==document||frame.isConnected!==true||frame.parentElement!==parent||frame.classList!==classes||classes.contains!==contains||frame.getAttribute!==attribute||frame.hasAttribute!==has||parent.getAttribute!==parentAttribute||!apply(contains,classes,[\""editframe\""])||apply(parentAttribute,parent,[\""uuid\""])!==tabId)bad(\""FRAME\"");\nfor(const [k,v] of [[\""c_dbid\"",tabId],[\""c_doctype\"",\""3\""],[\""src\"",\""editor?entry=pcb\""],[\""pcb-canvas\"",\""true\""]])if(apply(attribute,frame,[k])!==v)bad(\""FRAME\"");for(const k of [\""blankIframe\"",\""fromFile\"",\""jsonCacheReady\""])if(apply(has,frame,[k]))bad(\""FRAME\"");\nif(frame.contentWindow!==child||child.document!==childDocument||childDocument?.defaultView!==child||childDocument?.nodeType!==9||child.frameElement!==frame||child.parent!==root||child.top!==root||child.location?.href!==\""https://client/editor?entry=pcb\""||own(child,\""MSG_BUS_PCB\"")!==native||own(native,\""messageBus\"")!==channel||own(child,\""Object\"")!==childObject||own(childObject,\""prototype\"")!==childPrototype)bad(\""FRAME\"");\n};\nconst childPlain=v=>{if(v===null||typeof v!==\""object\""||Array.isArray(v))bad(\""FRAME\"");const p=Object.getPrototypeOf(v);if(p!==Object.prototype&&p!==childPrototype)bad(\""FRAME\"");return v;};\nfor(let i=0;i<2;i++){frameCheck();const reply=childPlain(await apply(identity.fn,channel,[\""getTabIdAndDocType\"",undefined,0]));frameCheck();const value=childPlain(own(reply,\""message\""));if(Reflect.ownKeys(value).length!==2||own(value,\""tabId\"")!==tabId||own(value,\""docType\"")!==3)bad(\""FRAME\"");}\nframeObserved=true;\n};\nconst run=async()=>{\nstage=\""registration-before\"";const initial=await registration(phase===\""observe\"");check();\nif(phase===\""open-document\""){same(initial,sample(false));stage=\""dispatch\"";dispatchAttempted=true;publicResult=await apply(open.fn,apiBus,[\""extensionApi.DMT_EditorControl.openDocument\"",{documentUuid:target.documentUuid,splitScreenId:undefined}]);stage=\""acknowledgement\"";retainedHref=location?.href;check();if(publicResult===undefined)publicResult=null;if(publicResult!==tabId)bad(\""ACK\"");}\nstage=\""registration-after\"";await registration(phase!==\""preflight\"");\nif(phase===\""observe\""){stage=\""frame\"";await observe();check();}\nstage=\""output\"";return {ok:true,status:phase===\""preflight\""?\""ready\"":phase===\""open-document\""?\""opened\"":\""frame-observed\"",failure:null};\n};\ncheck();const timeout=new Promise((resolve,reject)=>{timer=apply(set,root,[()=>{expired=true;code=\""TIMEOUT\"";reject(new Error(\""PCB_DIAGNOSTIC_PCB_OPENING\""));},phase===\""open-document\""?45000:10000]);});\noutcome=await Promise.race([run(),timeout]);\n}catch{outcome={ok:false,status:\""refused\"",failure:{stage,code}};}\nfinally{if(timer!==undefined&&typeof clear===\""function\""){try{Reflect.apply(clear,globalThis,[timer]);}catch{outcome={ok:false,status:\""refused\"",failure:{stage:\""cleanup\"",code:\""CLEANUP\""}};}}}\nif(publicResult!==target.documentUuid+\""@\""+target.projectUuid)publicResult=null;\nif(typeof windowTabId!==\""string\""||!/^[A-Za-z0-9_-]{1,128}$/.test(windowTabId))windowTabId=null;\nreturn JSON.stringify({schema:\""easyeda-pro-control.pcb-diagnostic-pcb-opening.v1\"",phase,projectUuid:target.projectUuid,branchUuid:target.branchUuid,documentUuid:target.documentUuid,tabId:target.documentUuid+\""@\""+target.projectUuid,...outcome,dispatchAttempted,publicResult,nativeWorkMayRemain:dispatchAttempted,frameObserved,windowTabId});\n}"",""uniqueContextId"":""original-context"",""arguments"":[{""value"":{""rawWindowsPath"":""C:\\Synthetic\\worker-startup.eprj2"",""projectUuid"":""4bf2a6592ee5b3be42e82ea5960359983f837bb7bc2336249d61f5278ca43bfb"",""documentUuid"":""dddddddddddddddd"",""expectedSourceSha256"":""eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"",""branchUuid"":""bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb""}},{""value"":""observe""}],""returnByValue"":true,""awaitPromise"":true,""silent"":true,""generatePreview"":false,""userGesture"":false,""throwOnSideEffect"":false},""sessionId"":""original-session""}"+"\0","smoke-parent-parity");
    fields.Clear();fields.Add("objectId","__startup_argument0__");fields.Add("argument0","other");
    string collision=EncodeCore(256,"Runtime.callFunctionOn","s","same",fields,workerStartup209);
    Need(collision.Contains(@"""objectId"":""__startup_argument0__""") && collision.Contains(@"""objectId"":""other"""),"smoke-placeholder");
    foreach(int id in new int[]{0,257}) {bool refused=false;try{EncodeCore(id,"Runtime.callFunctionOn","s","same",fields,workerStartup209);}catch(System.InvalidOperationException){refused=true;}Need(refused,"smoke-budget");}
    foreach(object bad in new object[]{null,"",7,"bad\nhandle"}) {fields["argument0"]=bad;bool refused=false;try{EncodeCore(1,"Runtime.callFunctionOn","s","same",fields,workerStartup209);}catch(System.InvalidOperationException){refused=true;}Need(refused,"smoke-handle");}
    fields["argument0"]="other";fields.Add("expression","arbitrary");
    bool extra=false;try{EncodeCore(1,"Runtime.callFunctionOn","s","same",fields,workerStartup209);}catch(System.InvalidOperationException){extra=true;}Need(extra,"smoke-extra");
  }
}
// END GENERATED WORKER STARTUP PROTOCOL
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
  readonly bool layers209;
  readonly bool workerStartup;
  readonly bool workerStartup209;
  int RequestLimit { get { return workerStartup?256:stringPrecreate?3309:103; } }
  public readonly string JobId=Guid.NewGuid().ToString("N");
  public readonly string HelperInstance=Guid.NewGuid().ToString("N");
  public uint RootPid { get { return rootPid; } }
  public string RootCreated { get { return rootCreated.ToString(CultureInfo.InvariantCulture); } }
  public uint? CreateProcessError { get { return createProcessError; } }
  static Exception Error(string reason) { return new InvalidOperationException("pcb-diagnostic-"+reason); }
  // Only generated, digest-bound constants reach this decoder. It has no
  // request, file or network input and never changes the executed UTF-8 bytes.
  static string UnpackFixedProgram(string encoded,int length,string expectedSha256,string compressedSha256) {
    if(encoded==null || encoded.Length==0 || encoded.Length>87384 || length<1 || length>65536 ||
       expectedSha256==null || compressedSha256==null ||
       !System.Text.RegularExpressions.Regex.IsMatch(expectedSha256,@"\A[a-f0-9]{64}\z") ||
       !System.Text.RegularExpressions.Regex.IsMatch(compressedSha256,@"\A[a-f0-9]{64}\z")) throw Error("packed-program-contract");
    byte[] compressed=Convert.FromBase64String(encoded);
    if(compressed.Length<18 || compressed.Length>65536 || Convert.ToBase64String(compressed)!=encoded) throw Error("packed-program-base64");
    using(SHA256 hash=SHA256.Create()) {
      if(BitConverter.ToString(hash.ComputeHash(compressed)).Replace("-","").ToLowerInvariant()!=compressedSha256) throw Error("packed-program-compressed-hash");
    }
    byte[] bytes=new byte[length];int offset=0;
    using(MemoryStream input=new MemoryStream(compressed,false)) {
      using(System.IO.Compression.GZipStream stream=new System.IO.Compression.GZipStream(input,System.IO.Compression.CompressionMode.Decompress,true)) {
        while(offset<bytes.Length) {
          int count=stream.Read(bytes,offset,bytes.Length-offset);
          if(count<=0) throw Error("packed-program-truncated");
          offset+=count;
        }
        if(stream.ReadByte()!=-1 || input.Position!=input.Length) throw Error("packed-program-overflow");
      }
    }
    using(SHA256 hash=SHA256.Create()) {
      if(BitConverter.ToString(hash.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()!=expectedSha256) throw Error("packed-program-hash");
    }
    return new UTF8Encoding(false,true).GetString(bytes);
  }
  static void ExpectPackedProgramRefusal(string encoded,int length,string expectedSha256,string compressedSha256) {
    bool refused=false;try {UnpackFixedProgram(encoded,length,expectedSha256,compressedSha256);} catch {refused=true;}
    if(!refused) throw Error("packed-program-refusal-smoke");
  }
  public static void VerifyPackedProgramSmoke() {
    const string encoded="H4sIAAAAAAACA0vLrEhNUchLLMksS1UoKMpPL0rM5QIA5H4XCRUAAAA=";
    const string decodedSha="7aa7553bdb7131a24de959b219ad724a96eb27acb98f963bae73842f702b3a99";
    const string compressedSha="c69c9d800d7616444935d3ac1cfdb6f290f41e91519c57353babe3eb82622a77";
    if(UnpackFixedProgram(encoded,21,decodedSha,compressedSha)!="fixed native program\n") throw Error("packed-program-parity-smoke");
    foreach(int length in new int[]{0,20,22,65537}) ExpectPackedProgramRefusal(encoded,length,decodedSha,compressedSha);
    ExpectPackedProgramRefusal(encoded,21,new string('0',64),compressedSha);
    ExpectPackedProgramRefusal(encoded,21,decodedSha,new string('0',64));
    ExpectPackedProgramRefusal(encoded+" ",21,decodedSha,compressedSha);
    ExpectPackedProgramRefusal("!"+encoded.Substring(1),21,decodedSha,compressedSha);
    ExpectPackedProgramRefusal("H4sIAAAAAAACA/sPAAAAAP8BAAAA",1,"a8100ae6aa1940d0b663bb31cd466142ebbdbd5187131b92d93818987832eb89","e34a8da08a5b8db95457a0590eaef0922f506d44be9792f6b30612ee6da302f4");
  }
  static void Native(bool value) { if(!value) throw Error("native-call"); }
  public EasyedaDiagnosticOwner() { }
  EasyedaDiagnosticOwner(bool stringPrecreatePurpose) { stringPrecreate=stringPrecreatePurpose; }
  public static EasyedaDiagnosticOwner CreateStringPrecreate() { return new EasyedaDiagnosticOwner(true); }
  EasyedaDiagnosticOwner(bool stringPrecreatePurpose,bool workerStartupPurpose) { stringPrecreate=stringPrecreatePurpose;workerStartup=workerStartupPurpose; }
  public static EasyedaDiagnosticOwner CreateWorkerStartup() { return new EasyedaDiagnosticOwner(false,true); }
  EasyedaDiagnosticOwner(bool stringPrecreatePurpose,bool workerStartupPurpose,bool layers209Purpose,bool workerStartup209Purpose) {
    if(!workerStartupPurpose || !workerStartup209Purpose || stringPrecreatePurpose || layers209Purpose) throw Error("startup209-purpose");
    workerStartup=true;workerStartup209=true;
  }
  public static EasyedaDiagnosticOwner CreateWorkerStartup209() { return new EasyedaDiagnosticOwner(false,true,false,true); }
  EasyedaDiagnosticOwner(bool stringPrecreatePurpose,bool workerStartupPurpose,bool layers209Purpose) { stringPrecreate=stringPrecreatePurpose;workerStartup=workerStartupPurpose;layers209=layers209Purpose; }
  public static EasyedaDiagnosticOwner CreateLayers209() { return new EasyedaDiagnosticOwner(false,false,true); }
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
  // BEGIN GENERATED PCB209 LAYERS PROGRAM
  const string Layers209FunctionGzip="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";
  const string Layers209FunctionSha256="65e4089208affb3e8d3d1fd9a050439b13c5b400ff411f76d7311ff5a3add980";
  static readonly string Layers209Function=UnpackFixedProgram(Layers209FunctionGzip,10210,Layers209FunctionSha256,"09a5c0fd7cbe1f9435d8d9630a44eb8aaad4ed92cec5801aef4eae33858c8f26");
  // END GENERATED PCB209 LAYERS PROGRAM
  // BEGIN GENERATED PCB209 PRIMITIVES PROGRAM
  const string Primitives209FunctionGzip="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";
  const string Primitives209FunctionSha256="e8f6ab0a2b2548d55230ef623e622b02033dfb805d5a3627b81a203e14c5d219";
  static readonly string Primitives209Function=UnpackFixedProgram(Primitives209FunctionGzip,12558,Primitives209FunctionSha256,"bb3da96e5ab1d4a2ab675eee8623f0c60f994e76006936c2bf39228becef4207");
  // END GENERATED PCB209 PRIMITIVES PROGRAM
  // BEGIN GENERATED PCB209 IMAGE SHAPES PROGRAM
  const string ImageShapes209FunctionGzip="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";
  const string ImageShapes209FunctionSha256="d025d88a6265cf439f4f88e0b64df796aa099e9152c1de489dfd4a114e1362c4";
  static readonly string ImageShapes209Function=UnpackFixedProgram(ImageShapes209FunctionGzip,12152,ImageShapes209FunctionSha256,"b5eebbe87218a07fe4cdce2e978984eb536aba6e4e9557a2f2987897f762049f");
  // END GENERATED PCB209 IMAGE SHAPES PROGRAM
  // BEGIN GENERATED PCB209 ARC SHAPES PROGRAM
  const string ArcShapes209FunctionGzip="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";
  const string ArcShapes209FunctionSha256="9b41e237b02864dbf9d4074d3f7e8181b90220024da879d2ee3a71126970b8fa";
  static readonly string ArcShapes209Function=UnpackFixedProgram(ArcShapes209FunctionGzip,11786,ArcShapes209FunctionSha256,"56eef98049b57d9b043789df8db637b49d0582d683f85421eb76c5fedc9055ab");
  // END GENERATED PCB209 ARC SHAPES PROGRAM
  // BEGIN GENERATED PCB209 POURED SHAPES PROGRAM
  const string PouredShapes209FunctionGzip="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";
  const string PouredShapes209FunctionSha256="b4301c03885b175c7afee5f147642b8f46582e467f1121332b3fe6c50d0c270f";
  static readonly string PouredShapes209Function=UnpackFixedProgram(PouredShapes209FunctionGzip,12512,PouredShapes209FunctionSha256,"aaca2a9dfe1a0aa28123e8b9467e994fd26923868043c8f088538e70796817e1");
  // END GENERATED PCB209 POURED SHAPES PROGRAM
  // BEGIN GENERATED PCB209 PAD SHAPES PROGRAM
  const string PadShapes209FunctionGzip="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";
  const string PadShapes209FunctionSha256="82cc18f4569a60d05183677463fb8b96ecd3781bba8c2a3d29bed1c9f4cdc9f0";
  static readonly string PadShapes209Function=UnpackFixedProgram(PadShapes209FunctionGzip,14829,PadShapes209FunctionSha256,"ff84375b6a526b41315f7ba74416c9b2a4e34b446b50fecec9613836bf98a27e");
  // END GENERATED PCB209 PAD SHAPES PROGRAM
  // BEGIN GENERATED PCB209 EXTENDED PRIMITIVES PROGRAM
  const string ExtendedPrimitives209FunctionGzip="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";
  const string ExtendedPrimitives209FunctionSha256="5ae0fa27a7475f96aaad549a7c029ea165fe78788cb8ab0187dcaae86c2e7a63";
  static readonly string ExtendedPrimitives209Function=UnpackFixedProgram(ExtendedPrimitives209FunctionGzip,18284,ExtendedPrimitives209FunctionSha256,"17f2f8d6bf8fa86300803b3caffddd208b03b8a276805d83368460d00fbcae54");
  // END GENERATED PCB209 EXTENDED PRIMITIVES PROGRAM
  // BEGIN GENERATED PCB209 SELECTION RELATIONS PROGRAM
  const string SelectionRelations209FunctionGzip="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";
  const string SelectionRelations209FunctionSha256="6a0ab1809fb746a478be73cad8d5e1cd75f23e343ad760963ba609dcd50f6aa1";
  static readonly string SelectionRelations209Function=UnpackFixedProgram(SelectionRelations209FunctionGzip,23381,SelectionRelations209FunctionSha256,"93e9ebad8909eff9c2a986ed3617a2b0b33efd688a3e78e00f974fc9a10528d8");
  // END GENERATED PCB209 SELECTION RELATIONS PROGRAM
  public static string SelectionRelations209ProtocolMessage(int id,string sessionId,string uniqueContextId,string phase,
    string path,string project,string branch,string document,string source,string[] componentIds) {
    return OpeningProtocolMessageCore(true,id,sessionId,uniqueContextId,phase,path,project,branch,document,source,false,false,false,false,false,true,componentIds);
  }
  static string SelectionRelations209Ids(string[] values) {
    if(values==null || values.Length>16) throw Error("selection-relations209-ids");
    HashSet<string> seen=new HashSet<string>(StringComparer.Ordinal);List<string> json=new List<string>();
    foreach(string value in values) {
      if(value==null || value.Length<1 || value.Length>256 || !seen.Add(value)) throw Error("selection-relations209-ids");
      new UTF8Encoding(false,true).GetBytes(value);json.Add(JsonString(value));
    }
    return "["+String.Join(",",json.ToArray())+"]";
  }
  public static void VerifySelectionRelations209Smoke() {
    string path=@"C:\Reviewed\SelectionRelationsFixture.eprj2",project;
    using(SHA256 hash=SHA256.Create()) {
      string program=BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(SelectionRelations209Function))).Replace("-","").ToLowerInvariant();
      if(program!=SelectionRelations209FunctionSha256) throw Error("selection-relations209-program");
      project=BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(path))).Replace("-","").ToLowerInvariant();
    }
    string[] ids=new string[]{"component-2","component-1"};
    string message=SelectionRelations209ProtocolMessage(103,"original-session","original-context","observe",path,project,new string('a',32),new string('b',16),new string('c',64),ids);
    if(message.IndexOf("\"method\":\"Runtime.callFunctionOn\"",StringComparison.Ordinal)<0 || message.IndexOf("\"uniqueContextId\":\"original-context\"",StringComparison.Ordinal)<0 ||
      message.IndexOf("{\"value\":[\"component-2\",\"component-1\"]}",StringComparison.Ordinal)<0 ||
      message.IndexOf("\"awaitPromise\":true",StringComparison.Ordinal)<0 || message.IndexOf("\"userGesture\":false",StringComparison.Ordinal)<0) throw Error("selection-relations209-command");
    if(SelectionRelations209Ids(new string[0])!="[]") throw Error("selection-relations209-empty");
    foreach(string[] invalid in new string[][]{null,new string[]{"x","x"},new string[]{""},new string[]{null},new string[]{new string('x',257)},new string[]{"\ud800"},new string[17]}) {
      bool rejected=false;try {SelectionRelations209Ids(invalid);} catch {rejected=true;}
      if(!rejected) throw Error("selection-relations209-invalid-ids");
    }
    bool refused=false;
    try {SelectionRelations209ProtocolMessage(104,"s","c","observe",path,project,new string('a',32),new string('b',16),new string('c',64),ids);} catch {refused=true;}
    if(!refused) throw Error("selection-relations209-budget");
    refused=false;try {SelectionRelations209ProtocolMessage(1,"s","c","open-document",path,project,new string('a',32),new string('b',16),new string('c',64),ids);} catch {refused=true;}
    if(!refused) throw Error("selection-relations209-phase");
    foreach(EasyedaDiagnosticOwner legacy in new EasyedaDiagnosticOwner[]{new EasyedaDiagnosticOwner(),CreateStringPrecreate(),CreateWorkerStartup(),CreateWorkerStartup209()}) {
      refused=false;try {legacy.SendSelectionRelations209(1,"s","c","observe",path,project,new string('a',32),new string('b',16),new string('c',64),ids);} catch(Exception failure) {refused=failure.Message=="pcb-diagnostic-selection-relations209-purpose";}
      if(!refused) throw Error("selection-relations209-legacy-purpose");
    }
    for(int purpose=0;purpose<3;purpose++) {
      refused=false;try {OpeningProtocolMessageCore(true,1,"s","c","observe",path,project,new string('a',32),new string('b',16),new string('c',64),false,false,purpose==0,purpose==1,purpose==2,true,ids);} catch {refused=true;}
      if(!refused) throw Error("selection-relations209-exclusive-purpose");
    }
  }
  public static string ArcShapes209ProtocolMessage(int id,string sessionId,string uniqueContextId,string phase,
    string path,string project,string branch,string document,string source) {
    return OpeningProtocolMessageCore(true,id,sessionId,uniqueContextId,phase,path,project,branch,document,source,false,false,false,false,false,false,null,false,false,true);
  }
  public static void VerifyArcShapes209Smoke() {
    string path=@"C:\Reviewed\ArcShapesFixture.eprj2",project;
    using(SHA256 hash=SHA256.Create()) {
      string program=BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(ArcShapes209Function))).Replace("-","").ToLowerInvariant();
      if(program!=ArcShapes209FunctionSha256) throw Error("arc-shapes209-program");
      project=BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(path))).Replace("-","").ToLowerInvariant();
    }
    string message=ArcShapes209ProtocolMessage(103,"original-session","original-context","observe",path,project,new string('a',32),new string('b',16),new string('c',64));
    if(message.IndexOf("\"method\":\"Runtime.callFunctionOn\"",StringComparison.Ordinal)<0 || message.IndexOf("\"uniqueContextId\":\"original-context\"",StringComparison.Ordinal)<0 ||
      message.IndexOf("\"awaitPromise\":true",StringComparison.Ordinal)<0 || message.IndexOf("\"userGesture\":false",StringComparison.Ordinal)<0) throw Error("arc-shapes209-command");
    bool refused=false;
    try {ArcShapes209ProtocolMessage(104,"s","c","observe",path,project,new string('a',32),new string('b',16),new string('c',64));} catch {refused=true;}
    if(!refused) throw Error("arc-shapes209-budget");
    refused=false;try {ArcShapes209ProtocolMessage(1,"s","c","open-document",path,project,new string('a',32),new string('b',16),new string('c',64));} catch {refused=true;}
    if(!refused) throw Error("arc-shapes209-phase");
    foreach(EasyedaDiagnosticOwner legacy in new EasyedaDiagnosticOwner[]{new EasyedaDiagnosticOwner(),CreateStringPrecreate(),CreateWorkerStartup(),CreateWorkerStartup209()}) {
      refused=false;try {legacy.SendArcShapes209(1,"s","c","observe",path,project,new string('a',32),new string('b',16),new string('c',64));} catch(Exception failure) {refused=failure.Message=="pcb-diagnostic-arc-shapes209-purpose";}
      if(!refused) throw Error("arc-shapes209-legacy-purpose");
    }
    for(int purpose=0;purpose<6;purpose++) {
      refused=false;
      try {OpeningProtocolMessageCore(true,1,"s","c","observe",path,project,new string('a',32),new string('b',16),new string('c',64),false,false,purpose==0,purpose==1,purpose==2,purpose==3,purpose==3?new string[0]:null,purpose==4,purpose==5,true);} catch {refused=true;}
      if(!refused) throw Error("arc-shapes209-exclusive-purpose");
    }
  }
  public static string PouredShapes209ProtocolMessage(int id,string sessionId,string uniqueContextId,string phase,
    string path,string project,string branch,string document,string source) {
    return OpeningProtocolMessageCore(true,id,sessionId,uniqueContextId,phase,path,project,branch,document,source,false,false,false,false,false,false,null,false,false,false,true);
  }
  public static void VerifyPouredShapes209Smoke() {
    string path=@"C:\Reviewed\PouredShapesFixture.eprj2",project;
    using(SHA256 hash=SHA256.Create()) {
      string program=BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(PouredShapes209Function))).Replace("-","").ToLowerInvariant();
      if(program!=PouredShapes209FunctionSha256) throw Error("poured-shapes209-program");
      project=BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(path))).Replace("-","").ToLowerInvariant();
    }
    string message=PouredShapes209ProtocolMessage(103,"original-session","original-context","observe",path,project,new string('a',32),new string('b',16),new string('c',64));
    if(message.IndexOf("\"method\":\"Runtime.callFunctionOn\"",StringComparison.Ordinal)<0 || message.IndexOf("\"uniqueContextId\":\"original-context\"",StringComparison.Ordinal)<0 ||
      message.IndexOf("\"awaitPromise\":true",StringComparison.Ordinal)<0 || message.IndexOf("\"userGesture\":false",StringComparison.Ordinal)<0) throw Error("poured-shapes209-command");
    bool refused=false;
    try {PouredShapes209ProtocolMessage(104,"s","c","observe",path,project,new string('a',32),new string('b',16),new string('c',64));} catch {refused=true;}
    if(!refused) throw Error("poured-shapes209-budget");
    refused=false;try {PouredShapes209ProtocolMessage(1,"s","c","open-document",path,project,new string('a',32),new string('b',16),new string('c',64));} catch {refused=true;}
    if(!refused) throw Error("poured-shapes209-phase");
    foreach(EasyedaDiagnosticOwner legacy in new EasyedaDiagnosticOwner[]{new EasyedaDiagnosticOwner(),CreateStringPrecreate(),CreateWorkerStartup(),CreateWorkerStartup209()}) {
      refused=false;try {legacy.SendPouredShapes209(1,"s","c","observe",path,project,new string('a',32),new string('b',16),new string('c',64));} catch(Exception failure) {refused=failure.Message=="pcb-diagnostic-poured-shapes209-purpose";}
      if(!refused) throw Error("poured-shapes209-legacy-purpose");
    }
    for(int purpose=0;purpose<7;purpose++) {
      refused=false;
      try {OpeningProtocolMessageCore(true,1,"s","c","observe",path,project,new string('a',32),new string('b',16),new string('c',64),false,false,purpose==0,purpose==1,purpose==2,purpose==3,purpose==3?new string[0]:null,purpose==4,purpose==5,purpose==6,true);} catch {refused=true;}
      if(!refused) throw Error("poured-shapes209-exclusive-purpose");
    }
  }
  public static string PadShapes209ProtocolMessage(int id,string sessionId,string uniqueContextId,string phase,
    string path,string project,string branch,string document,string source) {
    return OpeningProtocolMessageCore(true,id,sessionId,uniqueContextId,phase,path,project,branch,document,source,false,false,false,false,false,false,null,true);
  }
  public static void VerifyPadShapes209Smoke() {
    string path=@"C:\Reviewed\PadShapesFixture.eprj2",project;
    using(SHA256 hash=SHA256.Create()) {
      string program=BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(PadShapes209Function))).Replace("-","").ToLowerInvariant();
      if(program!=PadShapes209FunctionSha256) throw Error("pad-shapes209-program");
      project=BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(path))).Replace("-","").ToLowerInvariant();
    }
    string message=PadShapes209ProtocolMessage(103,"original-session","original-context","observe",path,project,new string('a',32),new string('b',16),new string('c',64));
    if(message.IndexOf("\"method\":\"Runtime.callFunctionOn\"",StringComparison.Ordinal)<0 || message.IndexOf("\"uniqueContextId\":\"original-context\"",StringComparison.Ordinal)<0 ||
      message.IndexOf("\"awaitPromise\":true",StringComparison.Ordinal)<0 || message.IndexOf("\"userGesture\":false",StringComparison.Ordinal)<0) throw Error("pad-shapes209-command");
    bool refused=false;
    try {PadShapes209ProtocolMessage(104,"s","c","observe",path,project,new string('a',32),new string('b',16),new string('c',64));} catch {refused=true;}
    if(!refused) throw Error("pad-shapes209-budget");
    refused=false;try {PadShapes209ProtocolMessage(1,"s","c","open-document",path,project,new string('a',32),new string('b',16),new string('c',64));} catch {refused=true;}
    if(!refused) throw Error("pad-shapes209-phase");
    foreach(EasyedaDiagnosticOwner legacy in new EasyedaDiagnosticOwner[]{new EasyedaDiagnosticOwner(),CreateStringPrecreate(),CreateWorkerStartup(),CreateWorkerStartup209()}) {
      refused=false;try {legacy.SendPadShapes209(1,"s","c","observe",path,project,new string('a',32),new string('b',16),new string('c',64));} catch(Exception failure) {refused=failure.Message=="pcb-diagnostic-pad-shapes209-purpose";}
      if(!refused) throw Error("pad-shapes209-legacy-purpose");
    }
    for(int purpose=0;purpose<4;purpose++) {
      refused=false;
      try {OpeningProtocolMessageCore(true,1,"s","c","observe",path,project,new string('a',32),new string('b',16),new string('c',64),false,false,purpose==0,purpose==1,purpose==2,purpose==3,purpose==3?new string[0]:null,true);} catch {refused=true;}
      if(!refused) throw Error("pad-shapes209-exclusive-purpose");
    }
  }
  public static string ImageShapes209ProtocolMessage(int id,string sessionId,string uniqueContextId,string phase,
    string path,string project,string branch,string document,string source) {
    return OpeningProtocolMessageCore(true,id,sessionId,uniqueContextId,phase,path,project,branch,document,source,false,false,false,false,false,false,null,false,true);
  }
  public static void VerifyImageShapes209Smoke() {
    string path=@"C:\Reviewed\ImageShapesFixture.eprj2",project;
    using(SHA256 hash=SHA256.Create()) {
      string program=BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(ImageShapes209Function))).Replace("-","").ToLowerInvariant();
      if(program!=ImageShapes209FunctionSha256) throw Error("image-shapes209-program");
      project=BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(path))).Replace("-","").ToLowerInvariant();
    }
    string message=ImageShapes209ProtocolMessage(103,"original-session","original-context","observe",path,project,new string('a',32),new string('b',16),new string('c',64));
    if(message.IndexOf("\"method\":\"Runtime.callFunctionOn\"",StringComparison.Ordinal)<0 || message.IndexOf("\"uniqueContextId\":\"original-context\"",StringComparison.Ordinal)<0 ||
      message.IndexOf("\"awaitPromise\":true",StringComparison.Ordinal)<0 || message.IndexOf("\"userGesture\":false",StringComparison.Ordinal)<0) throw Error("image-shapes209-command");
    bool refused=false;
    try {ImageShapes209ProtocolMessage(104,"s","c","observe",path,project,new string('a',32),new string('b',16),new string('c',64));} catch {refused=true;}
    if(!refused) throw Error("image-shapes209-budget");
    refused=false;try {ImageShapes209ProtocolMessage(1,"s","c","open-document",path,project,new string('a',32),new string('b',16),new string('c',64));} catch {refused=true;}
    if(!refused) throw Error("image-shapes209-phase");
    foreach(EasyedaDiagnosticOwner legacy in new EasyedaDiagnosticOwner[]{new EasyedaDiagnosticOwner(),CreateStringPrecreate(),CreateWorkerStartup(),CreateWorkerStartup209()}) {
      refused=false;try {legacy.SendImageShapes209(1,"s","c","observe",path,project,new string('a',32),new string('b',16),new string('c',64));} catch(Exception failure) {refused=failure.Message=="pcb-diagnostic-image-shapes209-purpose";}
      if(!refused) throw Error("image-shapes209-legacy-purpose");
    }
    for(int purpose=0;purpose<5;purpose++) {
      refused=false;
      try {OpeningProtocolMessageCore(true,1,"s","c","observe",path,project,new string('a',32),new string('b',16),new string('c',64),false,false,purpose==0,purpose==1,purpose==2,purpose==3,purpose==3?new string[0]:null,purpose==4,true);} catch {refused=true;}
      if(!refused) throw Error("image-shapes209-exclusive-purpose");
    }
  }
  public static string ExtendedPrimitives209ProtocolMessage(int id,string sessionId,string uniqueContextId,string phase,
    string path,string project,string branch,string document,string source) {
    return OpeningProtocolMessageCore(true,id,sessionId,uniqueContextId,phase,path,project,branch,document,source,false,false,false,false,true);
  }
  public static void VerifyExtendedPrimitives209Smoke() {
    string path=@"C:\Reviewed\ExtendedPrimitiveFixture.eprj2",project;
    using(SHA256 hash=SHA256.Create()) {
      string program=BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(ExtendedPrimitives209Function))).Replace("-","").ToLowerInvariant();
      if(program!=ExtendedPrimitives209FunctionSha256) throw Error("extended-primitives209-program");
      project=BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(path))).Replace("-","").ToLowerInvariant();
    }
    string message=ExtendedPrimitives209ProtocolMessage(103,"original-session","original-context","observe",path,project,new string('a',32),new string('b',16),new string('c',64));
    if(message.IndexOf("\"method\":\"Runtime.callFunctionOn\"",StringComparison.Ordinal)<0 || message.IndexOf("\"uniqueContextId\":\"original-context\"",StringComparison.Ordinal)<0 ||
      message.IndexOf("\"awaitPromise\":true",StringComparison.Ordinal)<0 || message.IndexOf("\"userGesture\":false",StringComparison.Ordinal)<0) throw Error("extended-primitives209-command");
    bool refused=false;
    try {ExtendedPrimitives209ProtocolMessage(104,"s","c","observe",path,project,new string('a',32),new string('b',16),new string('c',64));} catch {refused=true;}
    if(!refused) throw Error("extended-primitives209-budget");
    refused=false;try {ExtendedPrimitives209ProtocolMessage(1,"s","c","open-document",path,project,new string('a',32),new string('b',16),new string('c',64));} catch {refused=true;}
    if(!refused) throw Error("extended-primitives209-phase");
    foreach(EasyedaDiagnosticOwner legacy in new EasyedaDiagnosticOwner[]{new EasyedaDiagnosticOwner(),CreateStringPrecreate(),CreateWorkerStartup(),CreateWorkerStartup209()}) {
      refused=false;try {legacy.SendExtendedPrimitives209(1,"s","c","observe",path,project,new string('a',32),new string('b',16),new string('c',64));} catch(Exception failure) {refused=failure.Message=="pcb-diagnostic-extended-primitives209-purpose";}
      if(!refused) throw Error("extended-primitives209-legacy-purpose");
    }
    foreach(bool layersPurpose in new bool[]{false,true}) {
      refused=false;
      try {OpeningProtocolMessageCore(true,1,"s","c","observe",path,project,new string('a',32),new string('b',16),new string('c',64),false,false,layersPurpose,!layersPurpose,true);} catch {refused=true;}
      if(!refused) throw Error("extended-primitives209-exclusive-purpose");
    }
  }
  public static string Primitives209ProtocolMessage(int id,string sessionId,string uniqueContextId,string phase,
    string path,string project,string branch,string document,string source) {
    return OpeningProtocolMessageCore(true,id,sessionId,uniqueContextId,phase,path,project,branch,document,source,false,false,false,true);
  }
  public static void VerifyPrimitives209Smoke() {
    string path=@"C:\Reviewed\PrimitiveFixture.eprj2",project;
    using(SHA256 hash=SHA256.Create()) {
      string program=BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(Primitives209Function))).Replace("-","").ToLowerInvariant();
      if(program!=Primitives209FunctionSha256) throw Error("primitives209-program");
      project=BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(path))).Replace("-","").ToLowerInvariant();
    }
    string message=Primitives209ProtocolMessage(103,"original-session","original-context","observe",path,project,new string('a',32),new string('b',16),new string('c',64));
    if(message.IndexOf("\"method\":\"Runtime.callFunctionOn\"",StringComparison.Ordinal)<0 || message.IndexOf("\"uniqueContextId\":\"original-context\"",StringComparison.Ordinal)<0 ||
      message.IndexOf("\"awaitPromise\":true",StringComparison.Ordinal)<0 || message.IndexOf("\"userGesture\":false",StringComparison.Ordinal)<0) throw Error("primitives209-command");
    bool refused=false;
    try {Primitives209ProtocolMessage(104,"s","c","observe",path,project,new string('a',32),new string('b',16),new string('c',64));} catch {refused=true;}
    if(!refused) throw Error("primitives209-budget");
    refused=false;try {Primitives209ProtocolMessage(1,"s","c","open-document",path,project,new string('a',32),new string('b',16),new string('c',64));} catch {refused=true;}
    if(!refused) throw Error("primitives209-phase");
    foreach(EasyedaDiagnosticOwner legacy in new EasyedaDiagnosticOwner[]{new EasyedaDiagnosticOwner(),CreateStringPrecreate(),CreateWorkerStartup(),CreateWorkerStartup209()}) {
      refused=false;try {legacy.SendPrimitives209(1,"s","c","observe",path,project,new string('a',32),new string('b',16),new string('c',64));} catch(Exception failure) {refused=failure.Message=="pcb-diagnostic-primitives209-purpose";}
      if(!refused) throw Error("primitives209-legacy-purpose");
    }
    refused=false;
    try {OpeningProtocolMessageCore(true,1,"s","c","observe",path,project,new string('a',32),new string('b',16),new string('c',64),false,false,true,true);} catch {refused=true;}
    if(!refused) throw Error("primitives209-exclusive-purpose");
  }
  public static string Layers209ProtocolMessage(int id,string sessionId,string uniqueContextId,string phase,
    string path,string project,string branch,string document,string source) {
    return OpeningProtocolMessageCore(true,id,sessionId,uniqueContextId,phase,path,project,branch,document,source,false,false,true);
  }
  public static void VerifyLayers209Smoke() {
    string path=@"C:\Reviewed\LayerFixture.eprj2",project;
    using(SHA256 hash=SHA256.Create()) {
      string program=BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(Layers209Function))).Replace("-","").ToLowerInvariant();
      if(program!=Layers209FunctionSha256) throw Error("layers209-program");
      project=BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(path))).Replace("-","").ToLowerInvariant();
    }
    string message=Layers209ProtocolMessage(103,"original-session","original-context","observe",path,project,new string('a',32),new string('b',16),new string('c',64));
    if(message.IndexOf("\"method\":\"Runtime.callFunctionOn\"",StringComparison.Ordinal)<0 || message.IndexOf("\"uniqueContextId\":\"original-context\"",StringComparison.Ordinal)<0 ||
      message.IndexOf("\"awaitPromise\":true",StringComparison.Ordinal)<0 || message.IndexOf("\"userGesture\":false",StringComparison.Ordinal)<0) throw Error("layers209-command");
    bool refused=false;
    try {Layers209ProtocolMessage(104,"s","c","observe",path,project,new string('a',32),new string('b',16),new string('c',64));} catch {refused=true;}
    if(!refused) throw Error("layers209-budget");
    refused=false;try {Layers209ProtocolMessage(1,"s","c","open-document",path,project,new string('a',32),new string('b',16),new string('c',64));} catch {refused=true;}
    if(!refused) throw Error("layers209-phase");
    foreach(EasyedaDiagnosticOwner legacy in new EasyedaDiagnosticOwner[]{new EasyedaDiagnosticOwner(),CreateStringPrecreate(),CreateWorkerStartup(),CreateWorkerStartup209()}) {
      refused=false;try {legacy.SendLayers209(1,"s","c","observe",path,project,new string('a',32),new string('b',16),new string('c',64));} catch(Exception failure) {refused=failure.Message=="pcb-diagnostic-layers209-purpose";}
      if(!refused) throw Error("layers209-legacy-purpose");
    }
    EasyedaDiagnosticOwner current=CreateLayers209();if(!current.layers209 || current.stringPrecreate || current.workerStartup) throw Error("layers209-owner-purpose");
  }
  public static string OpeningProtocolMessage(int id,string sessionId,string uniqueContextId,string phase,
    string path,string project,string branch,string document,string source) {
    return OpeningProtocolMessageCore(false,id,sessionId,uniqueContextId,phase,path,project,branch,document,source,false);
  }
  public static string PcbOpeningProtocolMessage(int id,string sessionId,string uniqueContextId,string phase,
    string path,string project,string branch,string document,string source) {
    return OpeningProtocolMessageCore(true,id,sessionId,uniqueContextId,phase,path,project,branch,document,source,false);
  }
  static string OpeningProtocolMessageCore(bool pcb,int id,string sessionId,string uniqueContextId,string phase,
    string path,string project,string branch,string document,string source,bool stringPurpose,bool startupPurpose=false,bool layers209Purpose=false,bool primitives209Purpose=false,bool extendedPrimitives209Purpose=false,bool selectionRelations209Purpose=false,string[] componentIds=null,bool padShapes209Purpose=false,bool imageShapes209Purpose=false,bool arcShapes209Purpose=false,bool pouredShapes209Purpose=false) {
    Func<string,string,bool> matches=(value,pattern)=>value!=null && System.Text.RegularExpressions.Regex.IsMatch(value,pattern);
    if(startupPurpose && stringPurpose || layers209Purpose && primitives209Purpose ||
      extendedPrimitives209Purpose && (layers209Purpose || primitives209Purpose) ||
      selectionRelations209Purpose && (layers209Purpose || primitives209Purpose || extendedPrimitives209Purpose) ||
      padShapes209Purpose && (layers209Purpose || primitives209Purpose || extendedPrimitives209Purpose || selectionRelations209Purpose) ||
      imageShapes209Purpose && (layers209Purpose || primitives209Purpose || extendedPrimitives209Purpose || selectionRelations209Purpose || padShapes209Purpose) ||
      arcShapes209Purpose && (layers209Purpose || primitives209Purpose || extendedPrimitives209Purpose || selectionRelations209Purpose || padShapes209Purpose || imageShapes209Purpose) ||
      pouredShapes209Purpose && (layers209Purpose || primitives209Purpose || extendedPrimitives209Purpose || selectionRelations209Purpose || padShapes209Purpose || imageShapes209Purpose || arcShapes209Purpose) ||
      !selectionRelations209Purpose && componentIds!=null ||
      (layers209Purpose || primitives209Purpose || extendedPrimitives209Purpose || selectionRelations209Purpose || padShapes209Purpose || imageShapes209Purpose || arcShapes209Purpose || pouredShapes209Purpose) && (startupPurpose || stringPurpose || !pcb || phase!="observe")) throw Error("opening-purpose");
    if(id<1 || id>(startupPurpose?256:stringPurpose?3309:103) || !matches(sessionId,@"\A[A-Za-z0-9_.:-]{1,128}\z") || !matches(uniqueContextId,@"\A[A-Za-z0-9_.:-]{1,128}\z") ||
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
    string relationArgument=selectionRelations209Purpose?",{\"value\":"+SelectionRelations209Ids(componentIds)+"}":"";
    string message="{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+",\"method\":\"Runtime.callFunctionOn\",\"params\":{\"functionDeclaration\":"+
      JsonString(pouredShapes209Purpose?PouredShapes209Function:arcShapes209Purpose?ArcShapes209Function:imageShapes209Purpose?ImageShapes209Function:padShapes209Purpose?PadShapes209Function:selectionRelations209Purpose?SelectionRelations209Function:extendedPrimitives209Purpose?ExtendedPrimitives209Function:primitives209Purpose?Primitives209Function:layers209Purpose?Layers209Function:pcb?(startupPurpose?EasyedaWorkerStartupProtocol.PcbOpeningFunction:PcbOpeningFunction):OpeningFunction)+",\"uniqueContextId\":"+JsonString(uniqueContextId)+",\"arguments\":[{\"value\":"+target+"},{\"value\":"+JsonString(phase)+
      "}"+relationArgument+"],\"returnByValue\":true,\"awaitPromise\":true,\"silent\":true,\"generatePreview\":false,\"userGesture\":false,\"throwOnSideEffect\":false},\"sessionId\":"+JsonString(sessionId)+"}\0";
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
let stage=""callback"",reason=""unexpected"";
const bad=(r=""guard"")=>{reason=r;throw new Error(""PCB_DIAGNOSTIC_RAW_STRINGS_STATE"");};
const own=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))bad(""object"");const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad(""own"");return d.value;};
const object=o=>{if(o===null||typeof o!==""object""||Array.isArray(o))bad();return o;};
const number=v=>{if(typeof v!==""number""||!Number.isFinite(v)||Object.is(v,-0)||Math.abs(v)>1e11)bad();return v;};
const integer=v=>{number(v);if(!Number.isSafeInteger(v))bad();return v;};
const flag=v=>{if(typeof v!==""boolean"")bad();return v;};
const text=(v,n)=>{if(typeof v!==""string""||v.length>n||!v.isWellFormed())bad();return v;};
const id=v=>{text(v,32);if(!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(v))bad();return v;};
const marker=(o,k,copy)=>{let d=Object.getOwnPropertyDescriptor(o,k);if(!d){let p=Object.getPrototypeOf(o),n=0;while(p!==null){if(++n>8||Object.getOwnPropertyDescriptor(p,k))bad();p=Object.getPrototypeOf(p);}return {kind:""absent""};}if(!Object.hasOwn(d,""value""))bad();const v=d.value;if(v===undefined)return {kind:""undefined""};if(v===null)return {kind:""null""};return {kind:""value"",value:copy(v)};};
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
const scope=object(own(this,""object""));
const klass=n=>{const c=own(scope,n);if(typeof c!==""function"")bad();return c;};
const instance=(o,c)=>{object(o);if(Object.getPrototypeOf(o)!==own(c,""prototype""))bad(""instance"");return o;};
stage=""environment"";const envClass=klass(""x""),env=instance(own(envClass,""env""),envClass);
stage=""manager"";const managerClass=klass(""bo""),manager=instance(own(managerClass,""manager""),managerClass);
stage=""view-manager"";
const viewManager=instance(own(scope,""Jr""),klass(""t7""));
if(own(env,""_doctype"")!==3||own(viewManager,""mgr"")!==manager)bad();
stage=""environment"";const documentUuid=id(own(env,""_id""));
stage=""map"";const map=object(own(manager,""map""));
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
stage=""models"";for(let index=0;index<count;index++){
const entry=Reflect.apply(next,iterator,[]);if(own(entry,""done"")!==false)bad();
const pair=own(entry,""value"");if(!Array.isArray(pair)||Object.getPrototypeOf(pair)!==Array.prototype||own(pair,""length"")!==2||Reflect.ownKeys(pair).length!==3)bad();
const model=instance(own(pair,""1""),klass(""rd"")),globalIndex=id(own(model,""_globalIndex""));
if(own(pair,""0"")!==globalIndex||seen.has(globalIndex)||own(model,""modelType"")!==""Text"")bad();seen.add(globalIndex);
const nativeBase=own(model,""base""),position=own(model,""_position""),stateWatcher=marker(model,""_stateWatcher"",v=>watcher(v,model));
const snapshot={globalIndex,modelType:""Text"",zIndex:marker(model,""_zIndex"",integer),partition:marker(model,""_partition"",v=>text(v,128)),groupId:marker(model,""_groupID"",scalar),parent:marker(model,""_parent"",noParent),number:marker(model,""_number"",integer),dataState:integer(own(model,""_dataState"")),matrixChange:flag(own(model,""_matrixChange"")),key:text(own(model,""_key""),256),value:text(own(model,""_value""),1024),position:point(position),rotation:number(own(model,""_rotation"")),base:base(nativeBase),box:marker(model,""_box"",box),stateWatcher};
if(snapshot.key!==""""||snapshot.base.kind===""U8""&&(snapshot.base.layerId.kind!==""absent""||snapshot.base.locked.kind!==""absent"")||snapshot.base.kind===""ib""&&(snapshot.base.layerId.kind!==""value""||snapshot.base.locked.kind!==""value""))bad();
models.push(snapshot);originals.push([globalIndex,model,nativeBase,position]);
}
stage=""reproof"";if(own(Reflect.apply(next,iterator,[]),""done"")!==true||size()!==count)bad();
for(const item of originals){if(Reflect.apply(own(Map.prototype,""get""),map,[item[0]])!==item[1]||own(item[1],""base"")!==item[2]||own(item[1],""_position"")!==item[3])bad();}
if(own(envClass,""env"")!==env||own(managerClass,""manager"")!==manager||own(manager,""map"")!==map||own(scope,""Jr"")!==viewManager||own(viewManager,""mgr"")!==manager||own(env,""_id"")!==documentUuid||own(env,""_doctype"")!==3)bad();
stage=""serialize"";const output=JSON.stringify({schema:""easyeda-pro-control.pcb-diagnostic-raw-strings.v1"",documentUuid,managerModelCount:count,models});
let bytes=0;for(let index=0;index<output.length;index++){const c=output.charCodeAt(index);if(c<128)bytes++;else if(c<2048)bytes+=2;else if(c>=55296&&c<=56319){bytes+=4;index++;}else bytes+=3;if(bytes>65536)bad();}
return output;
}catch{return JSON.stringify({schema:""easyeda-pro-control.pcb-raw-string-failure.v1"",stage,reason});}
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

const graphNow=Date.now;
if(typeof graphNow!==""function"")bad();
const graphStarted=Reflect.apply(graphNow,Date,[]);
if(!Number.isSafeInteger(graphStarted)||graphStarted<0)bad();
const graphBudget=()=>{if(Date.now!==graphNow)bad();const now=Reflect.apply(graphNow,Date,[]);if(!Number.isSafeInteger(now)||now<graphStarted||now-graphStarted>1000)bad();};

const graphNodes=[],graphSeen=new Map(),graphHeld=[],graphCollections=[],graphJsonChecks=[];let graphFields=0,graphStringUnits=0;
const graphClassNames=[""S"",""ee"",""Ke"",""WA"",""Ff"",""HA"",""te"",""Wre"",""xI"",""fj"",""Ky"",""nC"",""cR"",""E8"",""i2"",""tR"",""rR"",""Jx"",""Yre"",""zre"",""aR"",""eR"",""O8"",""Qx"",""KCe"",""lR"",""sR"",""hR"",""zi"",""Ll""];
const graphClasses=graphClassNames.map(n=>[n,own(klass(n),""prototype"")]);
const graphString=v=>{graphBudget();if(typeof v!==""string""||v.length>4096||!v.isWellFormed()||(graphStringUnits+=v.length)>131072)bad();return v;};
const graphKeys=o=>{graphBudget();const k=Reflect.ownKeys(o);if(k.length>4096||k.some(v=>typeof v!==""string""))bad();return k;};
const graphDescriptor=(o,k,enumerableKeys)=>{graphBudget();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(++graphFields>32768)bad();graphHeld.push([o,k,d]);if(enumerableKeys&&d.enumerable)enumerableKeys.push(k);return d.value;};
const graphJsonToJSONAbsent=o=>{let depth=0;while(o!==null){graphBudget();if(++depth>16||graphJsonChecks.length>=32768)bad();const descriptor=Object.getOwnPropertyDescriptor(o,""toJSON"");if(descriptor!==undefined){graphJsonChecks.push([o,true]);return false;}const prototype=Object.getPrototypeOf(o);graphJsonChecks.push([o,false,prototype]);o=prototype;}return true;};
if(!graphJsonToJSONAbsent(Object.prototype)||!graphJsonToJSONAbsent(Array.prototype))bad();
const graphCollection=(o,p,recheck=false)=>{if(Object.getPrototypeOf(o)!==p||graphKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=Reflect.apply(d.get,o,[]);if(!Number.isSafeInteger(n)||n<0||n>4096)bad();if(!recheck&&(graphFields+=n*2)>32768)bad();const iterator=Reflect.apply(own(p,""entries""),o,[]),next=own(Object.getPrototypeOf(iterator),""next""),items=[];if(typeof next!==""function"")bad();for(let i=0;i<n;i++){const e=Reflect.apply(next,iterator,[]);graphBudget();if(own(e,""done"")!==false)bad();const pair=own(e,""value"");if(!Array.isArray(pair)||pair.length!==2)bad();items.push([own(pair,""0""),own(pair,""1"")]);}if(own(Reflect.apply(next,iterator,[]),""done"")!==true)bad();if(!recheck)graphCollections.push([o,p,items]);return items;};
const graphValue=(v,depth=0)=>{
graphBudget();if(depth>32)bad();if(v===null)return[""null""];if(v===undefined)return[""undefined""];
if(typeof v===""boolean"")return[""boolean"",v];if(typeof v===""string"")return[""string"",graphString(v)];
if(typeof v===""number""){if(!Number.isFinite(v))bad();return[""number"",Object.is(v,-0)?""-0"":String(v)];}
if(typeof v!==""object"")bad();if(graphSeen.has(v))return[""ref"",graphSeen.get(v)];
if(graphNodes.length>=4096)bad();const index=graphNodes.length;graphSeen.set(v,index);graphNodes.push(null);
const p=Object.getPrototypeOf(v);let node;
if(p===Map.prototype||p===Set.prototype){const entries=graphCollection(v,p);node=p===Map.prototype?{kind:""map"",entries:entries.map(e=>[graphValue(e[0],depth+1),graphValue(e[1],depth+1)])}:{kind:""set"",values:entries.map(e=>graphValue(e[0],depth+1))};}
else if(Array.isArray(v)){if(p!==Array.prototype)bad();const k=graphKeys(v),n=graphDescriptor(v,""length"");if(!Number.isSafeInteger(n)||n<0||n>4096||k.length!==n+1||k[n]!==""length"")bad();const values=[];for(let i=0;i<n;i++){if(k[i]!==String(i))bad();values.push(graphValue(graphDescriptor(v,String(i)),depth+1));}graphHeld.push([v,null,k,p]);node={kind:""array"",values,jsonToJSONAbsent:graphJsonToJSONAbsent(v)};}
else{let className=p===null?""null"":p===Object.prototype?""plain"":null;if(className===null){const matches=graphClasses.filter(e=>e[1]===p);if(matches.length!==1)bad();className=matches[0][0];}const k=graphKeys(v),fields=[],enumerableKeys=[];graphHeld.push([v,null,k,p]);for(const key of k)fields.push([graphString(key),graphValue(graphDescriptor(v,key,enumerableKeys),depth+1)]);node={kind:""object"",className,fields,enumerableKeys,jsonToJSONAbsent:graphJsonToJSONAbsent(v)};}
graphNodes[index]=node;return[""ref"",index];};
const graphVerify=()=>{graphBudget();for(const h of graphHeld){graphBudget();if(h[1]===null){const k=Reflect.ownKeys(h[0]);if(Object.getPrototypeOf(h[0])!==h[3]||k.length!==h[2].length||k.some((v,i)=>v!==h[2][i]))bad();}else{const d=Object.getOwnPropertyDescriptor(h[0],h[1]),p=h[2];if(!d||!Object.hasOwn(d,""value"")||!Object.is(d.value,p.value)||d.enumerable!==p.enumerable||d.configurable!==p.configurable||d.writable!==p.writable)bad();}}for(const h of graphCollections){graphBudget();const now=graphCollection(h[0],h[1],true);if(now.length!==h[2].length||now.some((e,i)=>!Object.is(e[0],h[2][i][0])||!Object.is(e[1],h[2][i][1])))bad();}for(const h of graphJsonChecks){graphBudget();const present=Object.getOwnPropertyDescriptor(h[0],""toJSON"")!==undefined;if(present!==h[1]||!present&&Object.getPrototypeOf(h[0])!==h[2])bad();}};

const emptyMap=o=>{if(graphCollection(o,Map.prototype).length!==0)bad();};
const finish=(schema,roots)=>{verifyConstructorAssociations();graphVerify();for(const r of retained){graphBudget();const d=Object.getOwnPropertyDescriptor(r[0],r[1]);if(!d||!Object.hasOwn(d,""value"")||!Object.is(d.value,r[2]))bad();}for(const r of absent){graphBudget();if(Object.getOwnPropertyDescriptor(r[0],r[1]))bad();}if(((()=>{
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
})())!==originalCallback)bad();graphBudget();const text=JSON.stringify({schema,documentUuid,pickedOwnerPublicShadowsAbsent:true,graph:{roots,nodes:graphNodes}});if(text.length>524288)bad();let bytes=0;for(let i=0;i<text.length;i++){if(i%1024===0)graphBudget();const c=text.charCodeAt(i);bytes+=c<128?1:c<2048?2:c>=55296&&c<=56319?(i++,4):3;if(bytes>524288)bad();}graphBudget();return text;};

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

const graphNow=Date.now;
if(typeof graphNow!==""function"")bad();
const graphStarted=Reflect.apply(graphNow,Date,[]);
if(!Number.isSafeInteger(graphStarted)||graphStarted<0)bad();
const graphBudget=()=>{if(Date.now!==graphNow)bad();const now=Reflect.apply(graphNow,Date,[]);if(!Number.isSafeInteger(now)||now<graphStarted||now-graphStarted>1000)bad();};

const graphNodes=[],graphSeen=new Map(),graphHeld=[],graphCollections=[],graphJsonChecks=[];let graphFields=0,graphStringUnits=0;
const graphClassNames=[""S"",""ee"",""Ke"",""WA"",""Ff"",""HA"",""te"",""Wre"",""xI"",""fj"",""Ky"",""nC"",""cR"",""E8"",""i2"",""tR"",""rR"",""Jx"",""Yre"",""zre"",""aR"",""eR"",""O8"",""Qx"",""KCe"",""lR"",""sR"",""hR"",""zi"",""Ll""];
const graphClasses=graphClassNames.map(n=>[n,own(klass(n),""prototype"")]);
const graphString=v=>{graphBudget();if(typeof v!==""string""||v.length>4096||!v.isWellFormed()||(graphStringUnits+=v.length)>131072)bad();return v;};
const graphKeys=o=>{graphBudget();const k=Reflect.ownKeys(o);if(k.length>4096||k.some(v=>typeof v!==""string""))bad();return k;};
const graphDescriptor=(o,k,enumerableKeys)=>{graphBudget();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(++graphFields>32768)bad();graphHeld.push([o,k,d]);if(enumerableKeys&&d.enumerable)enumerableKeys.push(k);return d.value;};
const graphJsonToJSONAbsent=o=>{let depth=0;while(o!==null){graphBudget();if(++depth>16||graphJsonChecks.length>=32768)bad();const descriptor=Object.getOwnPropertyDescriptor(o,""toJSON"");if(descriptor!==undefined){graphJsonChecks.push([o,true]);return false;}const prototype=Object.getPrototypeOf(o);graphJsonChecks.push([o,false,prototype]);o=prototype;}return true;};
if(!graphJsonToJSONAbsent(Object.prototype)||!graphJsonToJSONAbsent(Array.prototype))bad();
const graphCollection=(o,p,recheck=false)=>{if(Object.getPrototypeOf(o)!==p||graphKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=Reflect.apply(d.get,o,[]);if(!Number.isSafeInteger(n)||n<0||n>4096)bad();if(!recheck&&(graphFields+=n*2)>32768)bad();const iterator=Reflect.apply(own(p,""entries""),o,[]),next=own(Object.getPrototypeOf(iterator),""next""),items=[];if(typeof next!==""function"")bad();for(let i=0;i<n;i++){const e=Reflect.apply(next,iterator,[]);graphBudget();if(own(e,""done"")!==false)bad();const pair=own(e,""value"");if(!Array.isArray(pair)||pair.length!==2)bad();items.push([own(pair,""0""),own(pair,""1"")]);}if(own(Reflect.apply(next,iterator,[]),""done"")!==true)bad();if(!recheck)graphCollections.push([o,p,items]);return items;};
const graphValue=(v,depth=0)=>{
graphBudget();if(depth>32)bad();if(v===null)return[""null""];if(v===undefined)return[""undefined""];
if(typeof v===""boolean"")return[""boolean"",v];if(typeof v===""string"")return[""string"",graphString(v)];
if(typeof v===""number""){if(!Number.isFinite(v))bad();return[""number"",Object.is(v,-0)?""-0"":String(v)];}
if(typeof v!==""object"")bad();if(graphSeen.has(v))return[""ref"",graphSeen.get(v)];
if(graphNodes.length>=4096)bad();const index=graphNodes.length;graphSeen.set(v,index);graphNodes.push(null);
const p=Object.getPrototypeOf(v);let node;
if(p===Map.prototype||p===Set.prototype){const entries=graphCollection(v,p);node=p===Map.prototype?{kind:""map"",entries:entries.map(e=>[graphValue(e[0],depth+1),graphValue(e[1],depth+1)])}:{kind:""set"",values:entries.map(e=>graphValue(e[0],depth+1))};}
else if(Array.isArray(v)){if(p!==Array.prototype)bad();const k=graphKeys(v),n=graphDescriptor(v,""length"");if(!Number.isSafeInteger(n)||n<0||n>4096||k.length!==n+1||k[n]!==""length"")bad();const values=[];for(let i=0;i<n;i++){if(k[i]!==String(i))bad();values.push(graphValue(graphDescriptor(v,String(i)),depth+1));}graphHeld.push([v,null,k,p]);node={kind:""array"",values,jsonToJSONAbsent:graphJsonToJSONAbsent(v)};}
else{let className=p===null?""null"":p===Object.prototype?""plain"":null;if(className===null){const matches=graphClasses.filter(e=>e[1]===p);if(matches.length!==1)bad();className=matches[0][0];}const k=graphKeys(v),fields=[],enumerableKeys=[];graphHeld.push([v,null,k,p]);for(const key of k)fields.push([graphString(key),graphValue(graphDescriptor(v,key,enumerableKeys),depth+1)]);node={kind:""object"",className,fields,enumerableKeys,jsonToJSONAbsent:graphJsonToJSONAbsent(v)};}
graphNodes[index]=node;return[""ref"",index];};
const graphVerify=()=>{graphBudget();for(const h of graphHeld){graphBudget();if(h[1]===null){const k=Reflect.ownKeys(h[0]);if(Object.getPrototypeOf(h[0])!==h[3]||k.length!==h[2].length||k.some((v,i)=>v!==h[2][i]))bad();}else{const d=Object.getOwnPropertyDescriptor(h[0],h[1]),p=h[2];if(!d||!Object.hasOwn(d,""value"")||!Object.is(d.value,p.value)||d.enumerable!==p.enumerable||d.configurable!==p.configurable||d.writable!==p.writable)bad();}}for(const h of graphCollections){graphBudget();const now=graphCollection(h[0],h[1],true);if(now.length!==h[2].length||now.some((e,i)=>!Object.is(e[0],h[2][i][0])||!Object.is(e[1],h[2][i][1])))bad();}for(const h of graphJsonChecks){graphBudget();const present=Object.getOwnPropertyDescriptor(h[0],""toJSON"")!==undefined;if(present!==h[1]||!present&&Object.getPrototypeOf(h[0])!==h[2])bad();}};

const emptyMap=o=>{if(graphCollection(o,Map.prototype).length!==0)bad();};
const finish=(schema,roots)=>{verifyConstructorAssociations();graphVerify();for(const r of retained){graphBudget();const d=Object.getOwnPropertyDescriptor(r[0],r[1]);if(!d||!Object.hasOwn(d,""value"")||!Object.is(d.value,r[2]))bad();}for(const r of absent){graphBudget();if(Object.getOwnPropertyDescriptor(r[0],r[1]))bad();}if(((()=>{
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
})())!==originalCallback)bad();graphBudget();const text=JSON.stringify({schema,documentUuid,pickedOwnerPublicShadowsAbsent:true,graph:{roots,nodes:graphNodes}});if(text.length>524288)bad();let bytes=0;for(let i=0;i<text.length;i++){if(i%1024===0)graphBudget();const c=text.charCodeAt(i);bytes+=c<128?1:c<2048?2:c>=55296&&c<=56319?(i++,4):3;if(bytes>524288)bad();}graphBudget();return text;};

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

const graphNow=Date.now;
if(typeof graphNow!==""function"")bad();
const graphStarted=Reflect.apply(graphNow,Date,[]);
if(!Number.isSafeInteger(graphStarted)||graphStarted<0)bad();
const graphBudget=()=>{if(Date.now!==graphNow)bad();const now=Reflect.apply(graphNow,Date,[]);if(!Number.isSafeInteger(now)||now<graphStarted||now-graphStarted>1000)bad();};

const graphNodes=[],graphSeen=new Map(),graphHeld=[],graphCollections=[],graphJsonChecks=[];let graphFields=0,graphStringUnits=0;
const graphClassNames=[""S"",""ee"",""Ke"",""WA"",""Ff"",""HA"",""te"",""Wre"",""xI"",""fj"",""Ky"",""nC"",""cR"",""E8"",""i2"",""tR"",""rR"",""Jx"",""Yre"",""zre"",""aR"",""eR"",""O8"",""Qx"",""KCe"",""lR"",""sR"",""hR"",""zi"",""Ll""];
const graphClasses=graphClassNames.map(n=>[n,own(klass(n),""prototype"")]);
const graphString=v=>{graphBudget();if(typeof v!==""string""||v.length>4096||!v.isWellFormed()||(graphStringUnits+=v.length)>131072)bad();return v;};
const graphKeys=o=>{graphBudget();const k=Reflect.ownKeys(o);if(k.length>4096||k.some(v=>typeof v!==""string""))bad();return k;};
const graphDescriptor=(o,k,enumerableKeys)=>{graphBudget();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))bad();if(++graphFields>32768)bad();graphHeld.push([o,k,d]);if(enumerableKeys&&d.enumerable)enumerableKeys.push(k);return d.value;};
const graphJsonToJSONAbsent=o=>{let depth=0;while(o!==null){graphBudget();if(++depth>16||graphJsonChecks.length>=32768)bad();const descriptor=Object.getOwnPropertyDescriptor(o,""toJSON"");if(descriptor!==undefined){graphJsonChecks.push([o,true]);return false;}const prototype=Object.getPrototypeOf(o);graphJsonChecks.push([o,false,prototype]);o=prototype;}return true;};
if(!graphJsonToJSONAbsent(Object.prototype)||!graphJsonToJSONAbsent(Array.prototype))bad();
const graphCollection=(o,p,recheck=false)=>{if(Object.getPrototypeOf(o)!==p||graphKeys(o).length!==0)bad();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)bad();const n=Reflect.apply(d.get,o,[]);if(!Number.isSafeInteger(n)||n<0||n>4096)bad();if(!recheck&&(graphFields+=n*2)>32768)bad();const iterator=Reflect.apply(own(p,""entries""),o,[]),next=own(Object.getPrototypeOf(iterator),""next""),items=[];if(typeof next!==""function"")bad();for(let i=0;i<n;i++){const e=Reflect.apply(next,iterator,[]);graphBudget();if(own(e,""done"")!==false)bad();const pair=own(e,""value"");if(!Array.isArray(pair)||pair.length!==2)bad();items.push([own(pair,""0""),own(pair,""1"")]);}if(own(Reflect.apply(next,iterator,[]),""done"")!==true)bad();if(!recheck)graphCollections.push([o,p,items]);return items;};
const graphValue=(v,depth=0)=>{
graphBudget();if(depth>32)bad();if(v===null)return[""null""];if(v===undefined)return[""undefined""];
if(typeof v===""boolean"")return[""boolean"",v];if(typeof v===""string"")return[""string"",graphString(v)];
if(typeof v===""number""){if(!Number.isFinite(v))bad();return[""number"",Object.is(v,-0)?""-0"":String(v)];}
if(typeof v!==""object"")bad();if(graphSeen.has(v))return[""ref"",graphSeen.get(v)];
if(graphNodes.length>=4096)bad();const index=graphNodes.length;graphSeen.set(v,index);graphNodes.push(null);
const p=Object.getPrototypeOf(v);let node;
if(p===Map.prototype||p===Set.prototype){const entries=graphCollection(v,p);node=p===Map.prototype?{kind:""map"",entries:entries.map(e=>[graphValue(e[0],depth+1),graphValue(e[1],depth+1)])}:{kind:""set"",values:entries.map(e=>graphValue(e[0],depth+1))};}
else if(Array.isArray(v)){if(p!==Array.prototype)bad();const k=graphKeys(v),n=graphDescriptor(v,""length"");if(!Number.isSafeInteger(n)||n<0||n>4096||k.length!==n+1||k[n]!==""length"")bad();const values=[];for(let i=0;i<n;i++){if(k[i]!==String(i))bad();values.push(graphValue(graphDescriptor(v,String(i)),depth+1));}graphHeld.push([v,null,k,p]);node={kind:""array"",values,jsonToJSONAbsent:graphJsonToJSONAbsent(v)};}
else{let className=p===null?""null"":p===Object.prototype?""plain"":null;if(className===null){const matches=graphClasses.filter(e=>e[1]===p);if(matches.length!==1)bad();className=matches[0][0];}const k=graphKeys(v),fields=[],enumerableKeys=[];graphHeld.push([v,null,k,p]);for(const key of k)fields.push([graphString(key),graphValue(graphDescriptor(v,key,enumerableKeys),depth+1)]);node={kind:""object"",className,fields,enumerableKeys,jsonToJSONAbsent:graphJsonToJSONAbsent(v)};}
graphNodes[index]=node;return[""ref"",index];};
const graphVerify=()=>{graphBudget();for(const h of graphHeld){graphBudget();if(h[1]===null){const k=Reflect.ownKeys(h[0]);if(Object.getPrototypeOf(h[0])!==h[3]||k.length!==h[2].length||k.some((v,i)=>v!==h[2][i]))bad();}else{const d=Object.getOwnPropertyDescriptor(h[0],h[1]),p=h[2];if(!d||!Object.hasOwn(d,""value"")||!Object.is(d.value,p.value)||d.enumerable!==p.enumerable||d.configurable!==p.configurable||d.writable!==p.writable)bad();}}for(const h of graphCollections){graphBudget();const now=graphCollection(h[0],h[1],true);if(now.length!==h[2].length||now.some((e,i)=>!Object.is(e[0],h[2][i][0])||!Object.is(e[1],h[2][i][1])))bad();}for(const h of graphJsonChecks){graphBudget();const present=Object.getOwnPropertyDescriptor(h[0],""toJSON"")!==undefined;if(present!==h[1]||!present&&Object.getPrototypeOf(h[0])!==h[2])bad();}};

const emptyMap=o=>{if(graphCollection(o,Map.prototype).length!==0)bad();};
const finish=(schema,roots)=>{verifyConstructorAssociations();graphVerify();for(const r of retained){graphBudget();const d=Object.getOwnPropertyDescriptor(r[0],r[1]);if(!d||!Object.hasOwn(d,""value"")||!Object.is(d.value,r[2]))bad();}for(const r of absent){graphBudget();if(Object.getOwnPropertyDescriptor(r[0],r[1]))bad();}if(((()=>{
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
})())!==originalCallback)bad();graphBudget();const text=JSON.stringify({schema,documentUuid,pickedOwnerPublicShadowsAbsent:true,graph:{roots,nodes:graphNodes}});if(text.length>524288)bad();let bytes=0;for(let i=0;i<text.length;i++){if(i%1024===0)graphBudget();const c=text.charCodeAt(i);bytes+=c<128?1:c<2048?2:c>=55296&&c<=56319?(i++,4):3;if(bytes>524288)bad();}graphBudget();return text;};

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
    if(id<1 || id>(stringPurpose?3309:103) || !handle(sessionId) || sessionId.Length>128) throw Error("model-fields");
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
    if(id<1 || id>(stringPurpose?3309:103) || (method!="Runtime.evaluate" && uniqueContextId!=null)) throw Error("discovery-fields");
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
      ModelProtocolMessageCore(3309,"Runtime.callFunctionOn","s",phase,null,"scope","callback",pendingV2?"constructors":null,true,pendingV2?"teardrop":null);
      bool refused=false;try{ModelProtocolMessageCore(1,"Runtime.callFunctionOn","s",phase,null,"scope","callback",pendingV2?"constructors":null,false,pendingV2?"teardrop":null);}catch(InvalidOperationException){refused=true;}
      if(!refused)throw Error("lazy-purpose-smoke");
    }
    foreach(string phase in new string[]{"empty-producers-v2","producer-markers-v2"}) {
      StringPrecreateProtocolMessage(3309,"Runtime.callFunctionOn","s",phase,null,"scope","callback","constructors");
      bool refused=false;try{StringPrecreateProtocolMessage(1,"Runtime.callFunctionOn","s",phase,null,"scope","callback",null);}catch(InvalidOperationException){refused=true;}
      if(!refused)throw Error("lazy-constructors-smoke");
    }
    VerifyWorkerProducerProtocolSmoke();
    VerifyMoveProducerProtocolSmoke();
    VerifyActorClockProtocolSmoke();
    VerifyCommonPacketPrograms();
    using(SHA256 hash=SHA256.Create()) {
      byte[] source=Encoding.UTF8.GetBytes(WorkerExpression);
      if(source.Length!=3841 || BitConverter.ToString(hash.ComputeHash(source)).Replace("-","").ToLowerInvariant()!="dba64a7237d99363d35b134a7c4c6bfa312259f125fe2f7fb813db47b1ae4e52") throw Error("worker-program");
    }
    string[] programs={OpeningFunction,ModelCallbackExpression,ModelHandlerFunction,ModelStateFunction,ModelPendingFunction,ModelRawStringsFunction,ModelRootInventoryFunction,PcbOpeningFunction};
    int[] lengths={17003,2204,1730,7741,16466,8671,22587,13044};
    string[] digests={"186b6756f5a8b261ef225ac54202c4b9a9a8ccf65e9f30da537886779111d044","f1b6e32a10f64af767d6a29a679e0e906625585bc1d5514fef6dce3c2605776e","548c8af51fad2c6c11b47623dc845ed1e8031563756912bc6e16d004a2314591","67d4081399cdc22be17e2e1ddd0be234290092a2c5287f629fc2de9be16b85a5","69d21ad259b5d994e8c2f4ff4a5ede2cd1edca55516623d54fbd650969c9e812","fc3b2fea78fac63542dec20dbb3955741d6fe933691a4085acafdccae51c9b0e","75d3c48a376b86cca64f39fca738c6c8947869b2e560b20fefea3c637ab5a46e","62d282abfdea1db218ba057d5af99ca7b7198390454efdded7a72ab57d5568bf"};
    for(int i=0;i<programs.Length;i++) using(SHA256 hash=SHA256.Create()) {
      byte[] bytes=new UTF8Encoding(false,true).GetBytes(programs[i]);
      if(bytes.Length!=lengths[i] || BitConverter.ToString(hash.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()!=digests[i]) throw Error("fixed-program");
    }
    string[] commonPrograms={CommonConstructorsFunction,CommonPresentationFunction,CommonRulesFunction,CommonPreferenceFunction,CommonAssetsFunction,CommonMetadataFunction,TeardropCallbacksFunction,TeardropOwnerFunction};
    int[] commonLengths={6114,15161,14619,15217,10159,12134,7342,7986};
    string[] commonDigests={"7b18b78d9ba7dc29f00a86fbab59a06dfd15de615984d099ba6807485c3d8374","10ec3a9288a5b424b61c68adcc2253292251e880f4b7bce8514c1d737819069c","6107c74fc09378557d300fcf4972136521de2cfe1f9ace044c3dbac8295db7a9","9d60d49e00b1ced4913f6a9a265a57a87508bb3725bd19aebee6c80469d319e5","6d808cc30a9d8b056a7a243b7cff3bf300b080bd13779a409bb6bea6f1512671","381ba0b93a04dd4ab8e5460aeb4fbb4e89c483c5c4ce556df56c201e0e45d826","b087a93ce8a5e87515958a80b63bc7071688af9b5593cd2c64005b2a1fdb4f10","214d3a006b81be6be1add9a4086ad546bd8a8473a20fee17afa23d43e7f713fc"};
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
    StringPrecreateProtocolMessage(3309,"Runtime.evaluate","worker","worker-association","context",null,null,null);
    ProtocolMessage(103,"Browser.getVersion",null,null,null,null);
    bool diagnostic104Refused=false,string238Refused=false;
    try { ProtocolMessage(104,"Browser.getVersion",null,null,null,null); } catch(InvalidOperationException) { diagnostic104Refused=true; }
    try { StringPrecreateProtocolMessage(3310,"Runtime.evaluate","worker","worker-association","context",null,null,null); } catch(InvalidOperationException) { string238Refused=true; }
    if(!diagnostic104Refused || !string238Refused) throw Error("string-budget-smoke");
    CommonBaselineProtocolMessage(1,"Runtime.evaluate","page","wrapper","context",null,null,null);
    CommonBaselineProtocolMessage(3309,"Runtime.releaseObjectGroup","page","release",null,null,null,null);
    foreach(string phase in new string[] {"constructors","presentation-seed","rules-seed","preference-seed","assets","metadata"}) {
      bool pair=phase!="constructors" && phase!="metadata";
      string common=CommonBaselineProtocolMessage(100,"Runtime.callFunctionOn","page",phase,null,"scope","callback",pair?"constructors":null);
      string arguments="\"arguments\":[{\"objectId\":\"callback\"}"+(pair?",{\"objectId\":\"constructors\"}":"")+"]";
      if(common.IndexOf(arguments,StringComparison.Ordinal)<0 || common.IndexOf("\"throwOnSideEffect\":true",StringComparison.Ordinal)<0 ||
        common.IndexOf("\"returnByValue\":"+(phase=="constructors" || phase.EndsWith("-seed",StringComparison.Ordinal)?"false":"true"),StringComparison.Ordinal)<0) throw Error("common-scope-smoke");
      foreach(string invalid in new string[] {null,"","foreign/handle",new string('a',257)}) {
        bool refused=false; try { CommonBaselineProtocolMessage(100,"Runtime.callFunctionOn","page",phase,null,"scope",invalid,pair?"constructors":null); } catch(InvalidOperationException) { refused=true; }
        if(!refused) throw Error("common-callback-smoke");
        refused=false; try { CommonBaselineProtocolMessage(100,"Runtime.callFunctionOn","page",phase,null,"scope","callback",pair?invalid:"extra"); } catch(InvalidOperationException) { refused=true; }
        if(!refused) throw Error("common-constructor-smoke");
      }
    }
    foreach(string phase in new string[] {"packet-advance","packet-read","packet-result"}) {
      string message=CommonBaselineProtocolMessage(100,"Runtime.callFunctionOn","page",phase,null,"packet",null,null);
      if(message.IndexOf("\"objectGroup\":\"easyeda-pro-control-pcb-common-baseline-v3\"",StringComparison.Ordinal)<0 ||
        message.IndexOf("\"returnByValue\":"+(phase=="packet-advance"?"false":"true"),StringComparison.Ordinal)<0 ||
        message.IndexOf("\"arguments\"",StringComparison.Ordinal)>=0) throw Error("common-packet-smoke");
      foreach(string extra in new string[] {"callback","constructors"}) {
        bool refused=false;try { CommonBaselineProtocolMessage(100,"Runtime.callFunctionOn","page",phase,null,"packet",extra=="callback"?"extra":null,extra=="constructors"?"extra":null); }
        catch(InvalidOperationException) { refused=true; }if(!refused) throw Error("common-packet-extra-smoke");
      }
    }
    foreach(string phase in new string[] {"wrapper","constructors","presentation-seed","rules-seed","preference-seed","packet-advance","packet-read","packet-result","assets","metadata","release","properties","handler","unknown"}) {
      bool refused=false; try { CommonBaselineProtocolMessage(1,"Runtime.getProperties","page",phase,null,"scope","callback",null); } catch(InvalidOperationException) { refused=true; }
      if(!refused) throw Error("common-method-smoke");
    }
    bool commonBudgetRefused=false; try { CommonBaselineProtocolMessage(3310,"Runtime.releaseObjectGroup","page","release",null,null,null,null); } catch(InvalidOperationException) { commonBudgetRefused=true; }
    if(!commonBudgetRefused) throw Error("common-budget-smoke");
    foreach(bool stringPurpose in new bool[]{false,true}) {
      int limit=stringPurpose?3309:103;
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
    if(id<1 || id>(stringPurpose?3309:103) || !token(sessionId)) throw Error("dom-fields");
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
  public void SendLayers209(int id,string sessionId,string uniqueContextId,string phase,string path,string project,string branch,string document,string source) {
    if(!layers209 || stringPrecreate || workerStartup) throw Error("layers209-purpose");
    SendMessage(id,Layers209ProtocolMessage(id,sessionId,uniqueContextId,phase,path,project,branch,document,source));
  }
  public void SendPrimitives209(int id,string sessionId,string uniqueContextId,string phase,string path,string project,string branch,string document,string source) {
    if(!layers209 || stringPrecreate || workerStartup) throw Error("primitives209-purpose");
    SendMessage(id,Primitives209ProtocolMessage(id,sessionId,uniqueContextId,phase,path,project,branch,document,source));
  }
  public void SendExtendedPrimitives209(int id,string sessionId,string uniqueContextId,string phase,string path,string project,string branch,string document,string source) {
    if(!layers209 || stringPrecreate || workerStartup) throw Error("extended-primitives209-purpose");
    SendMessage(id,ExtendedPrimitives209ProtocolMessage(id,sessionId,uniqueContextId,phase,path,project,branch,document,source));
  }
  public void SendArcShapes209(int id,string sessionId,string uniqueContextId,string phase,string path,string project,string branch,string document,string source) {
    if(!layers209 || stringPrecreate || workerStartup) throw Error("arc-shapes209-purpose");
    SendMessage(id,ArcShapes209ProtocolMessage(id,sessionId,uniqueContextId,phase,path,project,branch,document,source));
  }
  public void SendPouredShapes209(int id,string sessionId,string uniqueContextId,string phase,string path,string project,string branch,string document,string source) {
    if(!layers209 || stringPrecreate || workerStartup) throw Error("poured-shapes209-purpose");
    SendMessage(id,PouredShapes209ProtocolMessage(id,sessionId,uniqueContextId,phase,path,project,branch,document,source));
  }
  public void SendPadShapes209(int id,string sessionId,string uniqueContextId,string phase,string path,string project,string branch,string document,string source) {
    if(!layers209 || stringPrecreate || workerStartup) throw Error("pad-shapes209-purpose");
    SendMessage(id,PadShapes209ProtocolMessage(id,sessionId,uniqueContextId,phase,path,project,branch,document,source));
  }
  public void SendImageShapes209(int id,string sessionId,string uniqueContextId,string phase,string path,string project,string branch,string document,string source) {
    if(!layers209 || stringPrecreate || workerStartup) throw Error("image-shapes209-purpose");
    SendMessage(id,ImageShapes209ProtocolMessage(id,sessionId,uniqueContextId,phase,path,project,branch,document,source));
  }
  public void SendSelectionRelations209(int id,string sessionId,string uniqueContextId,string phase,string path,string project,string branch,string document,string source,string[] componentIds) {
    if(!layers209 || stringPrecreate || workerStartup) throw Error("selection-relations209-purpose");
    SendMessage(id,SelectionRelations209ProtocolMessage(id,sessionId,uniqueContextId,phase,path,project,branch,document,source,componentIds));
  }
  public void SendModel(int id,string method,string sessionId,string phase,object uniqueContextId,object objectId,object callbackObjectId,object constructorObjectId,object teardropObjectId) {
    SendMessage(id,ModelProtocolMessageCore(id,method,sessionId,phase,OptionalText(uniqueContextId),OptionalText(objectId),OptionalText(callbackObjectId),OptionalText(constructorObjectId),stringPrecreate,OptionalText(teardropObjectId)));
  }
  public static string TeardropProtocolMessage(int id,string method,string sessionId,string phase,object suppliedScope,object suppliedCallback,
    object suppliedCallbacks,object[] suppliedReceivers,object[] suppliedTargets,bool stringPurpose) {
    string scope=OptionalText(suppliedScope),callback=OptionalText(suppliedCallback),callbacks=OptionalText(suppliedCallbacks);
    Func<string,bool> handle=value=>value!=null && System.Text.RegularExpressions.Regex.IsMatch(value,@"\A[A-Za-z0-9_.:-]{1,256}\z");
    if(id<1 || id>(stringPurpose?3309:103) || method!="Runtime.callFunctionOn" || !handle(sessionId) || sessionId.Length>128 || !handle(scope) || !handle(callback)) throw Error("teardrop-fields");
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
    if(id<1 || id>3309 || !handle(sessionId) || sessionId.Length>128) throw Error("string-fields");
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
    if(id<1 || id>3309 || method!="Runtime.callFunctionOn" || !match(sessionId,@"\A[A-Za-z0-9_.:-]{1,128}\z") ||
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
  const string CommonPresentationSeedFunction=@"function(originalCallback,constructors){
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

const seedPrototypes=[];const instance=(o,n)=>{object(o);const p=own(klass(n),""prototype"");if(Object.getPrototypeOf(o)!==p)bad();seedPrototypes.push([o,p]);return o;};
const env=instance(own(klass(""x""),""env""),""x""),documentUuid=own(env,""_id"");
if(own(env,""_doctype"")!==3||typeof documentUuid!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(documentUuid))bad();
const pick=(o,names)=>{const r=Object.create(null);for(const n of names)r[n]=own(o,n);return r;};
const noOwnPublic=(o,names)=>{for(const n of names){if(Object.getOwnPropertyDescriptor(o,n))bad();absent.push([o,n]);}};
const optional=(o,k)=>{if(Object.getOwnPropertyDescriptor(o,k))return{present:true,value:own(o,k)};let p=Object.getPrototypeOf(o),depth=0;while(p!==null){if(++depth>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}absent.push([o,k]);return{present:false};};


const fail=()=>{throw new Error(""PCB_COMMON_PACKET"");};
const data=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))fail();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))fail();return d.value;};
const tick=Date.now,start=Reflect.apply(tick,Date,[]);
if(typeof tick!==""function""||!Number.isSafeInteger(start)||start<0)fail();
const budget=()=>{if(Date.now!==tick)fail();const n=Reflect.apply(tick,Date,[]);if(!Number.isSafeInteger(n)||n<start||n-start>1000)fail();};
for(const base of [Object.prototype,Array.prototype]){let p=base,depth=0;while(p!==null){if(++depth>16||Object.getOwnPropertyDescriptor(p,""toJSON"")!==undefined)fail();p=Object.getPrototypeOf(p);}}
const keys=o=>{const k=Reflect.ownKeys(o);if(k.length>4096||k.some(x=>typeof x!==""string""))fail();return k;};
const collection=(o,p)=>{budget();if(Object.getPrototypeOf(o)!==p||keys(o).length!==0)fail();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)fail();const n=Reflect.apply(d.get,o,[]);if(!Number.isSafeInteger(n)||n<0||n>4096)fail();const entries=[];Reflect.apply(data(p,""forEach""),o,[(value,key)=>{entries.push([key,value]);}]);if(entries.length!==n)fail();return entries;};
const sameCollection=(o,p,expected)=>{const now=collection(o,p);if(now.length!==expected.length)fail();for(let i=0;i<now.length;i++){if(!Object.is(now[i][0],expected[i][0])||!Object.is(now[i][1],expected[i][1]))fail();}budget();};
const sameDescriptor=(o,k,d)=>{const n=Object.getOwnPropertyDescriptor(o,k);if(!n||!Object.hasOwn(n,""value"")||!Object.is(n.value,d.value)||n.enumerable!==d.enumerable||n.configurable!==d.configurable||n.writable!==d.writable)fail();};
const sameKeys=(o,p,k)=>{if(Object.getPrototypeOf(o)!==p)fail();const n=Reflect.ownKeys(o);if(n.length!==k.length)fail();for(let i=0;i<n.length;i++)if(n[i]!==k[i])fail();};
const utf8=s=>{budget();const nonAscii=s.match(/[^\x00-\x7f]/gu);if(nonAscii===null)return s.length;let n=s.length;for(let i=0;i<nonAscii.length;i++){if(i%256===0)budget();const c=nonAscii[i];n+=c.length===2||c.charCodeAt(0)>=2048?2:1;}budget();return n;};
const makePacket=(state,events,roots)=>{budget();state.eventText=JSON.stringify(events);const value={schema:""easyeda-pro-control.pcb-common-chunk.v1"",sequence:state.sequence,phase:state.phase,sourceSchema:state.sourceSchema,documentUuid:state.documentUuid,nodes:state.objects.length,fields:state.fields,stringUnits:state.stringUnits,records:state.recordCount,events,roots};const json=JSON.stringify(value);if(json.length>262144||utf8(json)>262144)fail();budget();return{json,state};};
const rootCheck=s=>{budget();if(((()=>{
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
})())!==s.callback)fail();for(const r of s.held)sameDescriptor(r[0],r[1],r[2]);sameKeys(s.constructorTuple,Array.prototype,s.constructorKeys);for(const r of s.absent)if(Object.getOwnPropertyDescriptor(r[0],r[1]))fail();for(const r of s.prototypes)if(Object.getPrototypeOf(r[0])!==r[1])fail();for(const r of s.collections)sameCollection(r[0],r[1],r[2]);budget();};

const seedCollections=[];let seedFields=0,seedStringUnits=0;
const graphString=v=>{if(typeof v!==""string""||v.length>4096||!v.isWellFormed()||(seedStringUnits+=v.length)>131072)bad();return v;};
const graphCollection=(o,p)=>{const entries=collection(o,p);if((seedFields+=entries.length*2)>32768)bad();seedCollections.push([o,p,entries]);return entries;};
const emptyMap=o=>{if(graphCollection(o,Map.prototype).length!==0)bad();};
const graphValue=v=>v;
const finish=(sourceSchema,roots)=>{
verifyConstructorAssociations();const classes=[""S"",""ee"",""Ke"",""WA"",""Ff"",""HA"",""te"",""Wre"",""xI"",""fj"",""Ky"",""nC"",""cR"",""E8"",""i2"",""tR"",""rR"",""Jx"",""Yre"",""zre"",""aR"",""eR"",""O8"",""Qx"",""KCe"",""lR"",""sR"",""hR"",""zi"",""Ll""].map(n=>[n,own(klass(n),""prototype"")]);
const objects=[],tokens=[];for(const r of roots){const v=r[1];let value;if(v===null)value=[""null""];else if(v===undefined)value=[""undefined""];else if(typeof v===""string"")value=[""string"",graphString(v)];else if(typeof v===""boolean"")value=[""boolean"",v];else if(typeof v===""number""){if(!Number.isFinite(v))bad();value=[""number"",Object.is(v,-0)?""-0"":String(v)];}else{if(typeof v!==""object"")bad();let i=objects.indexOf(v);if(i<0){i=objects.length;objects.push(v);}value=[""ref"",i];}tokens.push([r[0],value]);}
const held=retained.map(r=>{const d=Object.getOwnPropertyDescriptor(r[0],r[1]);if(!d||!Object.hasOwn(d,""value"")||!Object.is(d.value,r[2]))bad();return[r[0],r[1],d];});
const state={sourceSchema,documentUuid,callback:originalCallback,held,constructorTuple:constructors,constructorKeys,absent,prototypes:seedPrototypes.concat(constructorHeld.map(r=>[r[0],r[1]])),collections:seedCollections,classes,objects,roots:tokens,
sequence:0,phase:""capture"",next:0,pending:null,fields:seedFields,stringUnits:seedStringUnits,jsonChecks:0,recordCount:0,records:[],history:null,verifyPacket:null,verifyIndex:0};
rootCheck(state);return makePacket(state,[],tokens);};

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
  const string CommonRulesSeedFunction=@"function(originalCallback,constructors){
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

const seedPrototypes=[];const instance=(o,n)=>{object(o);const p=own(klass(n),""prototype"");if(Object.getPrototypeOf(o)!==p)bad();seedPrototypes.push([o,p]);return o;};
const env=instance(own(klass(""x""),""env""),""x""),documentUuid=own(env,""_id"");
if(own(env,""_doctype"")!==3||typeof documentUuid!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(documentUuid))bad();
const pick=(o,names)=>{const r=Object.create(null);for(const n of names)r[n]=own(o,n);return r;};
const noOwnPublic=(o,names)=>{for(const n of names){if(Object.getOwnPropertyDescriptor(o,n))bad();absent.push([o,n]);}};
const optional=(o,k)=>{if(Object.getOwnPropertyDescriptor(o,k))return{present:true,value:own(o,k)};let p=Object.getPrototypeOf(o),depth=0;while(p!==null){if(++depth>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}absent.push([o,k]);return{present:false};};


const fail=()=>{throw new Error(""PCB_COMMON_PACKET"");};
const data=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))fail();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))fail();return d.value;};
const tick=Date.now,start=Reflect.apply(tick,Date,[]);
if(typeof tick!==""function""||!Number.isSafeInteger(start)||start<0)fail();
const budget=()=>{if(Date.now!==tick)fail();const n=Reflect.apply(tick,Date,[]);if(!Number.isSafeInteger(n)||n<start||n-start>1000)fail();};
for(const base of [Object.prototype,Array.prototype]){let p=base,depth=0;while(p!==null){if(++depth>16||Object.getOwnPropertyDescriptor(p,""toJSON"")!==undefined)fail();p=Object.getPrototypeOf(p);}}
const keys=o=>{const k=Reflect.ownKeys(o);if(k.length>4096||k.some(x=>typeof x!==""string""))fail();return k;};
const collection=(o,p)=>{budget();if(Object.getPrototypeOf(o)!==p||keys(o).length!==0)fail();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)fail();const n=Reflect.apply(d.get,o,[]);if(!Number.isSafeInteger(n)||n<0||n>4096)fail();const entries=[];Reflect.apply(data(p,""forEach""),o,[(value,key)=>{entries.push([key,value]);}]);if(entries.length!==n)fail();return entries;};
const sameCollection=(o,p,expected)=>{const now=collection(o,p);if(now.length!==expected.length)fail();for(let i=0;i<now.length;i++){if(!Object.is(now[i][0],expected[i][0])||!Object.is(now[i][1],expected[i][1]))fail();}budget();};
const sameDescriptor=(o,k,d)=>{const n=Object.getOwnPropertyDescriptor(o,k);if(!n||!Object.hasOwn(n,""value"")||!Object.is(n.value,d.value)||n.enumerable!==d.enumerable||n.configurable!==d.configurable||n.writable!==d.writable)fail();};
const sameKeys=(o,p,k)=>{if(Object.getPrototypeOf(o)!==p)fail();const n=Reflect.ownKeys(o);if(n.length!==k.length)fail();for(let i=0;i<n.length;i++)if(n[i]!==k[i])fail();};
const utf8=s=>{budget();const nonAscii=s.match(/[^\x00-\x7f]/gu);if(nonAscii===null)return s.length;let n=s.length;for(let i=0;i<nonAscii.length;i++){if(i%256===0)budget();const c=nonAscii[i];n+=c.length===2||c.charCodeAt(0)>=2048?2:1;}budget();return n;};
const makePacket=(state,events,roots)=>{budget();state.eventText=JSON.stringify(events);const value={schema:""easyeda-pro-control.pcb-common-chunk.v1"",sequence:state.sequence,phase:state.phase,sourceSchema:state.sourceSchema,documentUuid:state.documentUuid,nodes:state.objects.length,fields:state.fields,stringUnits:state.stringUnits,records:state.recordCount,events,roots};const json=JSON.stringify(value);if(json.length>262144||utf8(json)>262144)fail();budget();return{json,state};};
const rootCheck=s=>{budget();if(((()=>{
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
})())!==s.callback)fail();for(const r of s.held)sameDescriptor(r[0],r[1],r[2]);sameKeys(s.constructorTuple,Array.prototype,s.constructorKeys);for(const r of s.absent)if(Object.getOwnPropertyDescriptor(r[0],r[1]))fail();for(const r of s.prototypes)if(Object.getPrototypeOf(r[0])!==r[1])fail();for(const r of s.collections)sameCollection(r[0],r[1],r[2]);budget();};

const seedCollections=[];let seedFields=0,seedStringUnits=0;
const graphString=v=>{if(typeof v!==""string""||v.length>4096||!v.isWellFormed()||(seedStringUnits+=v.length)>131072)bad();return v;};
const graphCollection=(o,p)=>{const entries=collection(o,p);if((seedFields+=entries.length*2)>32768)bad();seedCollections.push([o,p,entries]);return entries;};
const emptyMap=o=>{if(graphCollection(o,Map.prototype).length!==0)bad();};
const graphValue=v=>v;
const finish=(sourceSchema,roots)=>{
verifyConstructorAssociations();const classes=[""S"",""ee"",""Ke"",""WA"",""Ff"",""HA"",""te"",""Wre"",""xI"",""fj"",""Ky"",""nC"",""cR"",""E8"",""i2"",""tR"",""rR"",""Jx"",""Yre"",""zre"",""aR"",""eR"",""O8"",""Qx"",""KCe"",""lR"",""sR"",""hR"",""zi"",""Ll""].map(n=>[n,own(klass(n),""prototype"")]);
const objects=[],tokens=[];for(const r of roots){const v=r[1];let value;if(v===null)value=[""null""];else if(v===undefined)value=[""undefined""];else if(typeof v===""string"")value=[""string"",graphString(v)];else if(typeof v===""boolean"")value=[""boolean"",v];else if(typeof v===""number""){if(!Number.isFinite(v))bad();value=[""number"",Object.is(v,-0)?""-0"":String(v)];}else{if(typeof v!==""object"")bad();let i=objects.indexOf(v);if(i<0){i=objects.length;objects.push(v);}value=[""ref"",i];}tokens.push([r[0],value]);}
const held=retained.map(r=>{const d=Object.getOwnPropertyDescriptor(r[0],r[1]);if(!d||!Object.hasOwn(d,""value"")||!Object.is(d.value,r[2]))bad();return[r[0],r[1],d];});
const state={sourceSchema,documentUuid,callback:originalCallback,held,constructorTuple:constructors,constructorKeys,absent,prototypes:seedPrototypes.concat(constructorHeld.map(r=>[r[0],r[1]])),collections:seedCollections,classes,objects,roots:tokens,
sequence:0,phase:""capture"",next:0,pending:null,fields:seedFields,stringUnits:seedStringUnits,jsonChecks:0,recordCount:0,records:[],history:null,verifyPacket:null,verifyIndex:0};
rootCheck(state);return makePacket(state,[],tokens);};

const rules=instance(own(klass(""te""),""manager""),""te"");
for(const name of [""safeSpacings"",""otherSpacings"",""creepageSpacings"",""trackPhysics"",""netLengthPhysics"",""netLengthTolerancePhysics"",""differentialPhysics"",""blindViaPhysics"",""radiusPhysics"",""innerPlanes"",""copperPlanes"",""solderExpansions"",""pasteExpansions"",""autoRouters""])graphCollection(own(rules,name),Map.prototype);
graphCollection(own(rules,""defaultRuleMap""),Map.prototype);graphCollection(own(rules,""map""),Map.prototype);graphString(own(rules,""ruleTemplateName""));
for(const name of [""nets"",""netClass"",""netDifferentials"",""regionSelectors"",""equalLengthGroups"",""padsPairGroups"",""cacheNetModel""])emptyMap(own(rules,name));
const between=instance(own(rules,""betweenNetRule""),""Wre"");
for(const name of [""rule"",""cacheRuleMap""]){const a=own(between,name);if(!Array.isArray(a)||Object.getPrototypeOf(a)!==Array.prototype||own(a,""length"")!==0||Reflect.ownKeys(a).length!==1)bad();}
const ruleUnit=own(object(own(scope,""_Fe"")),""UNIT_NAME"");graphString(ruleUnit);
return finish(""easyeda-pro-control.pcb-common-rules.v2"",[[""rules"",graphValue(rules)],[""ruleUnit"",graphValue(ruleUnit)]]);
}";
  const string CommonPreferenceSeedFunction=@"function(originalCallback,constructors){
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

const seedPrototypes=[];const instance=(o,n)=>{object(o);const p=own(klass(n),""prototype"");if(Object.getPrototypeOf(o)!==p)bad();seedPrototypes.push([o,p]);return o;};
const env=instance(own(klass(""x""),""env""),""x""),documentUuid=own(env,""_id"");
if(own(env,""_doctype"")!==3||typeof documentUuid!==""string""||!/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/.test(documentUuid))bad();
const pick=(o,names)=>{const r=Object.create(null);for(const n of names)r[n]=own(o,n);return r;};
const noOwnPublic=(o,names)=>{for(const n of names){if(Object.getOwnPropertyDescriptor(o,n))bad();absent.push([o,n]);}};
const optional=(o,k)=>{if(Object.getOwnPropertyDescriptor(o,k))return{present:true,value:own(o,k)};let p=Object.getPrototypeOf(o),depth=0;while(p!==null){if(++depth>8||Object.hasOwn(p,k))bad();p=Object.getPrototypeOf(p);}absent.push([o,k]);return{present:false};};


const fail=()=>{throw new Error(""PCB_COMMON_PACKET"");};
const data=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))fail();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))fail();return d.value;};
const tick=Date.now,start=Reflect.apply(tick,Date,[]);
if(typeof tick!==""function""||!Number.isSafeInteger(start)||start<0)fail();
const budget=()=>{if(Date.now!==tick)fail();const n=Reflect.apply(tick,Date,[]);if(!Number.isSafeInteger(n)||n<start||n-start>1000)fail();};
for(const base of [Object.prototype,Array.prototype]){let p=base,depth=0;while(p!==null){if(++depth>16||Object.getOwnPropertyDescriptor(p,""toJSON"")!==undefined)fail();p=Object.getPrototypeOf(p);}}
const keys=o=>{const k=Reflect.ownKeys(o);if(k.length>4096||k.some(x=>typeof x!==""string""))fail();return k;};
const collection=(o,p)=>{budget();if(Object.getPrototypeOf(o)!==p||keys(o).length!==0)fail();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)fail();const n=Reflect.apply(d.get,o,[]);if(!Number.isSafeInteger(n)||n<0||n>4096)fail();const entries=[];Reflect.apply(data(p,""forEach""),o,[(value,key)=>{entries.push([key,value]);}]);if(entries.length!==n)fail();return entries;};
const sameCollection=(o,p,expected)=>{const now=collection(o,p);if(now.length!==expected.length)fail();for(let i=0;i<now.length;i++){if(!Object.is(now[i][0],expected[i][0])||!Object.is(now[i][1],expected[i][1]))fail();}budget();};
const sameDescriptor=(o,k,d)=>{const n=Object.getOwnPropertyDescriptor(o,k);if(!n||!Object.hasOwn(n,""value"")||!Object.is(n.value,d.value)||n.enumerable!==d.enumerable||n.configurable!==d.configurable||n.writable!==d.writable)fail();};
const sameKeys=(o,p,k)=>{if(Object.getPrototypeOf(o)!==p)fail();const n=Reflect.ownKeys(o);if(n.length!==k.length)fail();for(let i=0;i<n.length;i++)if(n[i]!==k[i])fail();};
const utf8=s=>{budget();const nonAscii=s.match(/[^\x00-\x7f]/gu);if(nonAscii===null)return s.length;let n=s.length;for(let i=0;i<nonAscii.length;i++){if(i%256===0)budget();const c=nonAscii[i];n+=c.length===2||c.charCodeAt(0)>=2048?2:1;}budget();return n;};
const makePacket=(state,events,roots)=>{budget();state.eventText=JSON.stringify(events);const value={schema:""easyeda-pro-control.pcb-common-chunk.v1"",sequence:state.sequence,phase:state.phase,sourceSchema:state.sourceSchema,documentUuid:state.documentUuid,nodes:state.objects.length,fields:state.fields,stringUnits:state.stringUnits,records:state.recordCount,events,roots};const json=JSON.stringify(value);if(json.length>262144||utf8(json)>262144)fail();budget();return{json,state};};
const rootCheck=s=>{budget();if(((()=>{
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
})())!==s.callback)fail();for(const r of s.held)sameDescriptor(r[0],r[1],r[2]);sameKeys(s.constructorTuple,Array.prototype,s.constructorKeys);for(const r of s.absent)if(Object.getOwnPropertyDescriptor(r[0],r[1]))fail();for(const r of s.prototypes)if(Object.getPrototypeOf(r[0])!==r[1])fail();for(const r of s.collections)sameCollection(r[0],r[1],r[2]);budget();};

const seedCollections=[];let seedFields=0,seedStringUnits=0;
const graphString=v=>{if(typeof v!==""string""||v.length>4096||!v.isWellFormed()||(seedStringUnits+=v.length)>131072)bad();return v;};
const graphCollection=(o,p)=>{const entries=collection(o,p);if((seedFields+=entries.length*2)>32768)bad();seedCollections.push([o,p,entries]);return entries;};
const emptyMap=o=>{if(graphCollection(o,Map.prototype).length!==0)bad();};
const graphValue=v=>v;
const finish=(sourceSchema,roots)=>{
verifyConstructorAssociations();const classes=[""S"",""ee"",""Ke"",""WA"",""Ff"",""HA"",""te"",""Wre"",""xI"",""fj"",""Ky"",""nC"",""cR"",""E8"",""i2"",""tR"",""rR"",""Jx"",""Yre"",""zre"",""aR"",""eR"",""O8"",""Qx"",""KCe"",""lR"",""sR"",""hR"",""zi"",""Ll""].map(n=>[n,own(klass(n),""prototype"")]);
const objects=[],tokens=[];for(const r of roots){const v=r[1];let value;if(v===null)value=[""null""];else if(v===undefined)value=[""undefined""];else if(typeof v===""string"")value=[""string"",graphString(v)];else if(typeof v===""boolean"")value=[""boolean"",v];else if(typeof v===""number""){if(!Number.isFinite(v))bad();value=[""number"",Object.is(v,-0)?""-0"":String(v)];}else{if(typeof v!==""object"")bad();let i=objects.indexOf(v);if(i<0){i=objects.length;objects.push(v);}value=[""ref"",i];}tokens.push([r[0],value]);}
const held=retained.map(r=>{const d=Object.getOwnPropertyDescriptor(r[0],r[1]);if(!d||!Object.hasOwn(d,""value"")||!Object.is(d.value,r[2]))bad();return[r[0],r[1],d];});
const state={sourceSchema,documentUuid,callback:originalCallback,held,constructorTuple:constructors,constructorKeys,absent,prototypes:seedPrototypes.concat(constructorHeld.map(r=>[r[0],r[1]])),collections:seedCollections,classes,objects,roots:tokens,
sequence:0,phase:""capture"",next:0,pending:null,fields:seedFields,stringUnits:seedStringUnits,jsonChecks:0,recordCount:0,records:[],history:null,verifyPacket:null,verifyIndex:0};
rootCheck(state);return makePacket(state,[],tokens);};

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
  const string CommonPacketAdvanceFunction=@"function(){""use strict"";
const fail=()=>{throw new Error(""PCB_COMMON_PACKET"");};
const data=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))fail();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))fail();return d.value;};
const tick=Date.now,start=Reflect.apply(tick,Date,[]);
if(typeof tick!==""function""||!Number.isSafeInteger(start)||start<0)fail();
const budget=()=>{if(Date.now!==tick)fail();const n=Reflect.apply(tick,Date,[]);if(!Number.isSafeInteger(n)||n<start||n-start>1000)fail();};
for(const base of [Object.prototype,Array.prototype]){let p=base,depth=0;while(p!==null){if(++depth>16||Object.getOwnPropertyDescriptor(p,""toJSON"")!==undefined)fail();p=Object.getPrototypeOf(p);}}
const keys=o=>{const k=Reflect.ownKeys(o);if(k.length>4096||k.some(x=>typeof x!==""string""))fail();return k;};
const collection=(o,p)=>{budget();if(Object.getPrototypeOf(o)!==p||keys(o).length!==0)fail();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)fail();const n=Reflect.apply(d.get,o,[]);if(!Number.isSafeInteger(n)||n<0||n>4096)fail();const entries=[];Reflect.apply(data(p,""forEach""),o,[(value,key)=>{entries.push([key,value]);}]);if(entries.length!==n)fail();return entries;};
const sameCollection=(o,p,expected)=>{const now=collection(o,p);if(now.length!==expected.length)fail();for(let i=0;i<now.length;i++){if(!Object.is(now[i][0],expected[i][0])||!Object.is(now[i][1],expected[i][1]))fail();}budget();};
const sameDescriptor=(o,k,d)=>{const n=Object.getOwnPropertyDescriptor(o,k);if(!n||!Object.hasOwn(n,""value"")||!Object.is(n.value,d.value)||n.enumerable!==d.enumerable||n.configurable!==d.configurable||n.writable!==d.writable)fail();};
const sameKeys=(o,p,k)=>{if(Object.getPrototypeOf(o)!==p)fail();const n=Reflect.ownKeys(o);if(n.length!==k.length)fail();for(let i=0;i<n.length;i++)if(n[i]!==k[i])fail();};
const utf8=s=>{budget();const nonAscii=s.match(/[^\x00-\x7f]/gu);if(nonAscii===null)return s.length;let n=s.length;for(let i=0;i<nonAscii.length;i++){if(i%256===0)budget();const c=nonAscii[i];n+=c.length===2||c.charCodeAt(0)>=2048?2:1;}budget();return n;};
const makePacket=(state,events,roots)=>{budget();state.eventText=JSON.stringify(events);const value={schema:""easyeda-pro-control.pcb-common-chunk.v1"",sequence:state.sequence,phase:state.phase,sourceSchema:state.sourceSchema,documentUuid:state.documentUuid,nodes:state.objects.length,fields:state.fields,stringUnits:state.stringUnits,records:state.recordCount,events,roots};const json=JSON.stringify(value);if(json.length>262144||utf8(json)>262144)fail();budget();return{json,state};};
const rootCheck=s=>{budget();if(((()=>{
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
})())!==s.callback)fail();for(const r of s.held)sameDescriptor(r[0],r[1],r[2]);sameKeys(s.constructorTuple,Array.prototype,s.constructorKeys);for(const r of s.absent)if(Object.getOwnPropertyDescriptor(r[0],r[1]))fail();for(const r of s.prototypes)if(Object.getPrototypeOf(r[0])!==r[1])fail();for(const r of s.collections)sameCollection(r[0],r[1],r[2]);budget();};

const previous=data(this,""state"");if(!previous||previous.phase===""complete""||previous.sequence>=511)fail();rootCheck(previous);
const records=[],events=[],objects=previous.objects.concat([]);
const s={sourceSchema:previous.sourceSchema,documentUuid:previous.documentUuid,callback:previous.callback,held:previous.held,constructorTuple:previous.constructorTuple,constructorKeys:previous.constructorKeys,absent:previous.absent,prototypes:previous.prototypes,collections:previous.collections,classes:previous.classes,objects,roots:previous.roots,
sequence:previous.sequence+1,phase:previous.phase,next:previous.next,pending:previous.pending,fields:previous.fields,stringUnits:previous.stringUnits,jsonChecks:previous.jsonChecks,recordCount:previous.recordCount,records,history:previous,verifyPacket:previous.verifyPacket,verifyIndex:previous.verifyIndex};
let work=0,nodes=0;const stringStart=s.stringUnits;
const hold=r=>{if(++s.recordCount>73728)fail();records.push(r);};
const string=v=>{if(typeof v!==""string""||v.length>4096||!v.isWellFormed()||(s.stringUnits+=v.length)>131072)fail();return v;};
const scalar=v=>{if(v===null)return[""null""];if(v===undefined)return[""undefined""];if(typeof v===""boolean"")return[""boolean"",v];if(typeof v===""string"")return[""string"",string(v)];if(typeof v===""number""){if(!Number.isFinite(v))fail();return[""number"",Object.is(v,-0)?""-0"":String(v)];}if(typeof v!==""object"")fail();let i=objects.indexOf(v);if(i<0){if(objects.length>=4096)fail();i=objects.length;objects.push(v);}return[""ref"",i];};
const ownField=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value"")||++s.fields>32768)fail();hold([""field"",o,k,d]);return d;};
const jsonAbsent=o=>{let depth=0;while(o!==null){budget();if(++depth>16||++s.jsonChecks>32768)fail();const d=Object.getOwnPropertyDescriptor(o,""toJSON"");if(d!==undefined){hold([""json"",o,true]);return false;}const p=Object.getPrototypeOf(o);hold([""json"",o,false,p]);o=p;}return true;};
if(s.phase===""capture""){
if(s.next===0&&s.pending===null){if(!jsonAbsent(Object.prototype)||!jsonAbsent(Array.prototype))fail();}
while(work<256&&nodes<64&&s.stringUnits-stringStart<8192){budget();
let n=s.pending;
if(n===null){if(s.next===objects.length)break;const o=objects[s.next],p=Object.getPrototypeOf(o);let kind,className=null,roster=null,entries=null,length,absence=null;
if(p===Map.prototype||p===Set.prototype){kind=p===Map.prototype?""map"":""set"";entries=collection(o,p);length=entries.length;if((s.fields+=length*2)>32768)fail();hold([""collection"",o,p,entries]);}
else if(Array.isArray(o)){kind=""array"";if(p!==Array.prototype)fail();roster=keys(o);length=ownField(o,""length"").value;if(!Number.isSafeInteger(length)||length<0||length>4096||roster.length!==length+1||roster[length]!==""length"")fail();for(let i=0;i<length;i++)if(roster[i]!==String(i))fail();hold([""roster"",o,p,roster]);absence=jsonAbsent(o);}
else{kind=""object"";className=p===null?""null"":p===Object.prototype?""plain"":null;if(className===null){const matches=s.classes.filter(r=>r[1]===p);if(matches.length!==1)fail();className=matches[0][0];}roster=keys(o);length=roster.length;hold([""roster"",o,p,roster]);absence=jsonAbsent(o);}
n={o,index:s.next,kind,className,roster,entries,length,cursor:0};events.push([""node"",n.index,kind,className,length,absence]);nodes++;work++;
}
let cursor=n.cursor;
while(cursor<n.length&&work<256&&s.stringUnits-stringStart<8192){budget();
if(n.kind===""object""){const k=n.roster[cursor],d=ownField(n.o,k);events.push([""field"",n.index,string(k),scalar(d.value),d.enumerable]);work++;}
else if(n.kind===""array""){const d=ownField(n.o,String(cursor));events.push([""item"",n.index,scalar(d.value)]);work++;}
else if(n.kind===""map""){const pair=n.entries[cursor];events.push([""entry"",n.index,scalar(pair[0]),scalar(pair[1])]);work+=2;}
else{events.push([""member"",n.index,scalar(n.entries[cursor][0])]);work+=2;}cursor++;
}
if(cursor===n.length){events.push([""end"",n.index]);s.next++;s.pending=null;}else{s.pending={o:n.o,index:n.index,kind:n.kind,className:n.className,roster:n.roster,entries:n.entries,length:n.length,cursor};break;}
}
if(s.pending===null&&s.next===objects.length){s.phase=""verify"";s.verifyPacket=s;s.verifyIndex=0;}
}else{
let packet=s.verifyPacket,index=s.verifyIndex;
while(work<256&&packet!==null){budget();if(index===packet.records.length){packet=packet.history;index=0;continue;}
const r=packet.records[index++];if(r[0]===""field"")sameDescriptor(r[1],r[2],r[3]);else if(r[0]===""roster"")sameKeys(r[1],r[2],r[3]);else if(r[0]===""collection"")sameCollection(r[1],r[2],r[3]);else if(r[0]===""json""){const present=Object.getOwnPropertyDescriptor(r[1],""toJSON"")!==undefined;if(present!==r[2]||!present&&Object.getPrototypeOf(r[1])!==r[3])fail();}else fail();work++;
}
s.verifyPacket=packet;s.verifyIndex=index;if(packet===null)s.phase=""complete"";
}
rootCheck(s);budget();return makePacket(s,events,null);}";
  const string CommonPacketReadFunction=@"function(){""use strict"";const d=Object.getOwnPropertyDescriptor(this,""json"");if(!d||!Object.hasOwn(d,""value"")||typeof d.value!==""string""||d.value.length>262144)throw new Error(""PCB_COMMON_PACKET"");return d.value;}";
  const string CommonPacketResultFunction=@"function(){""use strict"";
const fail=()=>{throw new Error(""PCB_COMMON_PACKET"");};
const data=(o,k)=>{if(o===null||(typeof o!==""object""&&typeof o!==""function""))fail();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,""value""))fail();return d.value;};
const tick=Date.now,start=Reflect.apply(tick,Date,[]);
if(typeof tick!==""function""||!Number.isSafeInteger(start)||start<0)fail();
const budget=()=>{if(Date.now!==tick)fail();const n=Reflect.apply(tick,Date,[]);if(!Number.isSafeInteger(n)||n<start||n-start>1000)fail();};
for(const base of [Object.prototype,Array.prototype]){let p=base,depth=0;while(p!==null){if(++depth>16||Object.getOwnPropertyDescriptor(p,""toJSON"")!==undefined)fail();p=Object.getPrototypeOf(p);}}
const keys=o=>{const k=Reflect.ownKeys(o);if(k.length>4096||k.some(x=>typeof x!==""string""))fail();return k;};
const collection=(o,p)=>{budget();if(Object.getPrototypeOf(o)!==p||keys(o).length!==0)fail();const d=Object.getOwnPropertyDescriptor(p,""size"");if(!d||typeof d.get!==""function""||d.set!==undefined)fail();const n=Reflect.apply(d.get,o,[]);if(!Number.isSafeInteger(n)||n<0||n>4096)fail();const entries=[];Reflect.apply(data(p,""forEach""),o,[(value,key)=>{entries.push([key,value]);}]);if(entries.length!==n)fail();return entries;};
const sameCollection=(o,p,expected)=>{const now=collection(o,p);if(now.length!==expected.length)fail();for(let i=0;i<now.length;i++){if(!Object.is(now[i][0],expected[i][0])||!Object.is(now[i][1],expected[i][1]))fail();}budget();};
const sameDescriptor=(o,k,d)=>{const n=Object.getOwnPropertyDescriptor(o,k);if(!n||!Object.hasOwn(n,""value"")||!Object.is(n.value,d.value)||n.enumerable!==d.enumerable||n.configurable!==d.configurable||n.writable!==d.writable)fail();};
const sameKeys=(o,p,k)=>{if(Object.getPrototypeOf(o)!==p)fail();const n=Reflect.ownKeys(o);if(n.length!==k.length)fail();for(let i=0;i<n.length;i++)if(n[i]!==k[i])fail();};
const utf8=s=>{budget();const nonAscii=s.match(/[^\x00-\x7f]/gu);if(nonAscii===null)return s.length;let n=s.length;for(let i=0;i<nonAscii.length;i++){if(i%256===0)budget();const c=nonAscii[i];n+=c.length===2||c.charCodeAt(0)>=2048?2:1;}budget();return n;};
const makePacket=(state,events,roots)=>{budget();state.eventText=JSON.stringify(events);const value={schema:""easyeda-pro-control.pcb-common-chunk.v1"",sequence:state.sequence,phase:state.phase,sourceSchema:state.sourceSchema,documentUuid:state.documentUuid,nodes:state.objects.length,fields:state.fields,stringUnits:state.stringUnits,records:state.recordCount,events,roots};const json=JSON.stringify(value);if(json.length>262144||utf8(json)>262144)fail();budget();return{json,state};};
const rootCheck=s=>{budget();if(((()=>{
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
})())!==s.callback)fail();for(const r of s.held)sameDescriptor(r[0],r[1],r[2]);sameKeys(s.constructorTuple,Array.prototype,s.constructorKeys);for(const r of s.absent)if(Object.getOwnPropertyDescriptor(r[0],r[1]))fail();for(const r of s.prototypes)if(Object.getPrototypeOf(r[0])!==r[1])fail();for(const r of s.collections)sameCollection(r[0],r[1],r[2]);budget();};

const s=data(this,""state"");if(!s||s.phase!==""complete"")fail();rootCheck(s);
const history=[];let p=s;while(p!==null){budget();if(history.length>=512)fail();history.push(p);p=p.history;}
const nodes=[],lengths=[];let active=-1,work=0;
for(let i=history.length-1;i>=0;i--){budget();const events=JSON.parse(history[i].eventText);for(const e of events){if(++work%256===0)budget();
if(e[0]===""node""){if(active!==-1||e[1]!==nodes.length)fail();active=e[1];lengths.push(e[4]);if(e[2]===""object"")nodes.push({kind:""object"",className:e[3],fields:[],enumerableKeys:[],jsonToJSONAbsent:e[5]});else if(e[2]===""array"")nodes.push({kind:""array"",values:[],jsonToJSONAbsent:e[5]});else if(e[2]===""map"")nodes.push({kind:""map"",entries:[]});else if(e[2]===""set"")nodes.push({kind:""set"",values:[]});else fail();}
else{if(active!==e[1]||active<0)fail();const n=nodes[active];if(e[0]===""field""&&n.kind===""object""){n.fields.push([e[2],e[3]]);if(e[4])n.enumerableKeys.push(e[2]);}
else if(e[0]===""item""&&n.kind===""array""||e[0]===""member""&&n.kind===""set"")n.values.push(e[2]);
else if(e[0]===""entry""&&n.kind===""map"")n.entries.push([e[2],e[3]]);
else if(e[0]===""end""){const length=n.kind===""object""?n.fields.length:n.kind===""map""?n.entries.length:n.values.length;if(length!==lengths[active])fail();active=-1;}else fail();}
}}
if(active!==-1||nodes.length!==s.objects.length)fail();const output=[],seen=new Map();
const value=(v,depth=0)=>{budget();if(depth>32)fail();if(v[0]!==""ref"")return v;const source=v[1];if(seen.has(source))return[""ref"",seen.get(source)];const n=nodes[source];if(!n)fail();const index=output.length;seen.set(source,index);output.push(null);let copy;
if(n.kind===""object"")copy={kind:""object"",className:n.className,fields:n.fields.map(e=>[e[0],value(e[1],depth+1)]),enumerableKeys:n.enumerableKeys,jsonToJSONAbsent:n.jsonToJSONAbsent};
else if(n.kind===""map"")copy={kind:""map"",entries:n.entries.map(e=>[value(e[0],depth+1),value(e[1],depth+1)])};
else if(n.kind===""set"")copy={kind:""set"",values:n.values.map(v=>value(v,depth+1))};
else copy={kind:""array"",values:n.values.map(v=>value(v,depth+1)),jsonToJSONAbsent:n.jsonToJSONAbsent};output[index]=copy;return[""ref"",index];};
const roots=s.roots.map(r=>[r[0],value(r[1])]);if(output.length!==nodes.length)fail();rootCheck(s);
const text=JSON.stringify({schema:s.sourceSchema,documentUuid:s.documentUuid,pickedOwnerPublicShadowsAbsent:true,graph:{roots,nodes:output}});if(text.length>524288||utf8(text)>524288)fail();budget();return text;}";
  static void VerifyCommonPacketPrograms() {
    string[] programs={CommonPresentationSeedFunction,CommonRulesSeedFunction,CommonPreferenceSeedFunction,CommonPacketAdvanceFunction,CommonPacketReadFunction,CommonPacketResultFunction};
    int[] lengths={14190,13648,14246,10135,213,7728};
    string[] digests={"8581262355c08b04542b41dd3bb1dc98bc58fc7937527ad03735884f397226c9","9572111945920e26b18d8dee6fd0e1b3839121682bee1af0f0ceb855e6b50a8e","9d1ff54eb25d8871b2f9957e5453a02cd7b9184625dae1439417189df8491dc2","d405217e4c500a5db533583d12088075eeb39e310e816df245143c42bd2313a4","0f5a1be3556d1ca0f0905143c97b8be4b8e81d18b4fc7379c0f139af64a61d4f","475af0126bc4cdc448419d95807dadc73833009be8f6b2763ed7abe89df2d1eb"};
    for(int i=0;i<programs.Length;i++) using(SHA256 hash=SHA256.Create()) {
      byte[] bytes=new UTF8Encoding(false,true).GetBytes(programs[i]);
      if(bytes.Length!=lengths[i] || BitConverter.ToString(hash.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()!=digests[i]) throw Error("common-packet-program");
    }
  }
  // Fixed common baseline reads share the original String owner and page.
  // No caller source, object group, options or request budget is accepted.
  public static string CommonBaselineProtocolMessage(int id,string method,string sessionId,string phase,
    object suppliedContext,object suppliedObject,object suppliedCallback,object suppliedConstructors) {
    string context=OptionalText(suppliedContext),scope=OptionalText(suppliedObject),callback=OptionalText(suppliedCallback),constructors=OptionalText(suppliedConstructors);
    Func<string,bool> handle=value=>value!=null && System.Text.RegularExpressions.Regex.IsMatch(value,@"\A[A-Za-z0-9_.:-]{1,256}\z");
    if(id<1 || id>3309 || !handle(sessionId) || sessionId.Length>128) throw Error("common-fields");
    bool seed=phase=="presentation-seed" || phase=="rules-seed" || phase=="preference-seed";
    bool packet=phase=="packet-advance" || phase=="packet-read" || phase=="packet-result";
    bool withConstructors=seed || phase=="assets";
    if(!withConstructors && constructors!=null) throw Error("common-constructors");
    const string effects="\"throwOnSideEffect\":true,\"silent\":true,\"awaitPromise\":false,\"generatePreview\":false,\"userGesture\":false";
    const string group="easyeda-pro-control-pcb-common-baseline-v3";
    string parameters;
    if(phase=="wrapper" && method=="Runtime.evaluate") {
      if(!handle(context) || scope!=null || callback!=null) throw Error("common-context");
      parameters=effects+",\"expression\":"+JsonString(ModelCallbackExpression)+",\"uniqueContextId\":"+JsonString(context)+
        ",\"objectGroup\":"+JsonString(group)+",\"returnByValue\":false,\"timeout\":1000,\"includeCommandLineAPI\":false,\"allowUnsafeEvalBlockedByCSP\":false";
    } else if(phase=="release" && method=="Runtime.releaseObjectGroup") {
      if(context!=null || scope!=null || callback!=null) throw Error("common-release");
      parameters="\"objectGroup\":"+JsonString(group);
    } else if(packet && method=="Runtime.callFunctionOn") {
      if(context!=null || !handle(scope) || callback!=null) throw Error("common-packet");
      string program=phase=="packet-advance"?CommonPacketAdvanceFunction:phase=="packet-read"?CommonPacketReadFunction:CommonPacketResultFunction;
      parameters=effects+",\"objectId\":"+JsonString(scope)+",\"functionDeclaration\":"+JsonString(program)+
        ",\"objectGroup\":"+JsonString(group)+",\"returnByValue\":"+(phase=="packet-advance"?"false":"true");
    } else if((withConstructors || phase=="constructors" || phase=="metadata") && method=="Runtime.callFunctionOn") {
      if(context!=null || !handle(scope) || !handle(callback) || (withConstructors && !handle(constructors))) throw Error("common-scope");
      string program=phase=="constructors"?CommonConstructorsFunction:phase=="presentation-seed"?CommonPresentationSeedFunction:
        phase=="rules-seed"?CommonRulesSeedFunction:phase=="preference-seed"?CommonPreferenceSeedFunction:phase=="assets"?CommonAssetsFunction:CommonMetadataFunction;
      parameters=effects+",\"objectId\":"+JsonString(scope)+",\"functionDeclaration\":"+JsonString(program)+
        (seed?",\"objectGroup\":"+JsonString(group):"")+
        ",\"returnByValue\":"+(phase=="constructors" || seed?"false":"true")+",\"arguments\":[{\"objectId\":"+JsonString(callback)+"}"+
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
    if(!stringPurpose || id<1 || id>3309 || !handle(sessionId) || sessionId.Length>128) throw Error("worker-producer-fields");
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
  const string MoveProducerProgram0=@"(()=>{
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
  const string MoveProducerProgram1=@"function(){
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
  const string MoveProducerProgram2=@"function(originalCallback){
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
const original=fn(own(scope(this),""eL""));verify();return original;}";
  const string MoveProducerProgram3=@"function(originalMove,handlerScope,originalCallback){
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
})())!==originalCallback||own(scope(handlerScope),""eL"")!==originalMove)bad();
const ec=fn(own(scope(handlerScope),""x"")),env=object(own(ec,""env""));
if(Object.getPrototypeOf(env)!==own(ec,""prototype"")||own(env,""_doctype"")!==3)bad();
const s=scope(this),state={schema:""easyeda-pro-control.pcb-string-move-closure.v1"",
documentUuid:id(own(env,""_id""),/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/),
timer:timer(own(s,""o"")),selectionCount:arraySize(own(s,""t"")),builder:nullable(own(s,""e"")),command:nullable(own(s,""r""))};
verify();return JSON.stringify(state);}";
  const string MoveProducerProgram4=@"function(originalCallback){

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
const scope=object(own(this,""object"")),ec=own(scope,""x"");if(typeof ec!==""function"")bad();
const env=object(own(ec,""env""));if(Object.getPrototypeOf(env)!==own(ec,""prototype"")||own(env,""_doctype"")!==3)bad();
const documentUuid=id(own(env,""_id""),/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/),startup=plain(own(scope,""tl""));
const expected=[""useWebgl"",""multiThreadingOnOpen"",""rebuildingRatlineInWorker"",""needFlushService"",""modelIsBuilt"",""controllerIsBuilt"",""engineHighlightReady""];
const actual=keys(startup);if(actual.length!==expected.length||expected.some(k=>!actual.includes(k)))bad();
const state={schema:""easyeda-pro-control.pcb-string-startup-state.v1"",documentUuid,
useWebgl:flag(own(startup,""useWebgl"")),multiThreadingOnOpen:flag(own(startup,""multiThreadingOnOpen"")),
rebuildingRatlineInWorker:flag(own(startup,""rebuildingRatlineInWorker"")),needFlushService:flag(own(startup,""needFlushService"")),
modelIsBuilt:flag(own(startup,""modelIsBuilt"")),controllerIsBuilt:flag(own(startup,""controllerIsBuilt"")),engineHighlightReady:flag(own(startup,""engineHighlightReady""))};
verify();const after=keys(startup);if(after.length!==actual.length||after.some((k,i)=>k!==actual[i]))bad();
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
})())!==originalCallback)bad();return JSON.stringify(state);
}";
  static readonly string[] MoveProducerSequence={"wrapper","properties","properties","handler","properties","properties","select","properties","properties","sample","startup","release"};
  static string MoveProducerProgram(string phase) { switch(phase) {
    case "wrapper": return MoveProducerProgram0;
    case "handler": return MoveProducerProgram1;
    case "select": return MoveProducerProgram2;
    case "sample": return MoveProducerProgram3;
    case "startup": return MoveProducerProgram4;
    default: throw Error("move-producer-program");
  }}
  public static int MoveProducerArgumentCount(string phase) { switch(phase) {
    case "wrapper": return -1;
    case "properties": return -2;
    case "release": return -3;
    case "handler": return 0;
    case "select": return 1;
    case "sample": return 3;
    case "startup": return 1;
    default: throw Error("move-producer-phase");
  }}
  static bool MoveProducerReturnValue(string phase) { return phase=="sample" || phase=="startup"; }
  static void VerifyMoveProducerProtocolSmoke() {
    string[] programs={MoveProducerProgram0,MoveProducerProgram1,MoveProducerProgram2,MoveProducerProgram3,MoveProducerProgram4};
    int[] lengths={2204,1730,5314,5783,8172};
    string[] digests={"f1b6e32a10f64af767d6a29a679e0e906625585bc1d5514fef6dce3c2605776e","548c8af51fad2c6c11b47623dc845ed1e8031563756912bc6e16d004a2314591","a74ed72699f1e6bf67ebf41da90113d9979b67dcdff6362e67e9afda7de6f9e2","d48ce7ea07030d9a3e5c0de51ca0b265e3408388c399e91b0eec16168b75a557","de247a4466d3f601e748a5105e4255aaf9b152f0c258b5142c49a1e88c3fe709"};
    for(int index=0;index<programs.Length;index++) using(SHA256 hash=SHA256.Create()) {
      byte[] bytes=new UTF8Encoding(false,true).GetBytes(programs[index]);
      if(bytes.Length!=lengths[index] || BitConverter.ToString(hash.ComputeHash(bytes)).Replace("-","").ToLowerInvariant()!=digests[index]) throw Error("move-producer-program-smoke");
    }
    if(MoveProducerSequence.Length!=12) throw Error("move-producer-sequence-smoke");
    foreach(string phase in MoveProducerSequence) {
      int count=MoveProducerArgumentCount(phase);
      object[] args=count>=0?new object[count]:null; if(args!=null) for(int index=0;index<count;index++) args[index]="argument"+index;
      string method=count==-1?"Runtime.evaluate":count==-2?"Runtime.getProperties":count==-3?"Runtime.releaseObjectGroup":"Runtime.callFunctionOn";
      object context=count==-1?"original-context":null,scope=count>=0 || count==-2?"original-object":null;
      MoveProducerProtocolMessage(1,method,"original-page",phase,context,scope,args,true);
      bool refused=false;try{MoveProducerProtocolMessage(1,method,"original-page",phase,context,scope,args,false);}catch(InvalidOperationException){refused=true;}
      if(!refused)throw Error("move-producer-purpose-smoke");
    }
  }
  // Original move-producer stage: fixed programs and one retained session.
  // Source/target admission remains in the original owner, not caller fields.
  int moveProducerStep;
  string moveProducerSession,moveProducerContext;
  bool moveProducerReleased;
  public static string MoveProducerProtocolMessage(int id,string method,string sessionId,string phase,
    object suppliedContext,object suppliedObject,object[] suppliedArguments,bool stringPurpose) {
    string context=OptionalText(suppliedContext),scope=OptionalText(suppliedObject);
    Func<string,bool> handle=value=>value!=null && System.Text.RegularExpressions.Regex.IsMatch(value,@"\A[A-Za-z0-9_.:-]{1,256}\z");
    if(!stringPurpose || id<1 || id>3309 || !handle(sessionId) || sessionId.Length>128) throw Error("move-producer-fields");
    int count=MoveProducerArgumentCount(phase);
    const string effects="\"throwOnSideEffect\":true,\"silent\":true,\"awaitPromise\":false,\"generatePreview\":false,\"userGesture\":false";
    const string group="easyeda-pro-control-string-move-v1";
    string parameters;
    if(count==-1) {
      if(method!="Runtime.evaluate" || !handle(context) || scope!=null || suppliedArguments!=null) throw Error("move-producer-context");
      parameters=effects+",\"expression\":"+JsonString(MoveProducerProgram(phase))+",\"uniqueContextId\":"+JsonString(context)+
        ",\"objectGroup\":"+JsonString(group)+",\"returnByValue\":false,\"timeout\":1000,\"includeCommandLineAPI\":false,\"allowUnsafeEvalBlockedByCSP\":false";
    } else if(count==-2) {
      if(method!="Runtime.getProperties" || context!=null || !handle(scope) || suppliedArguments!=null) throw Error("move-producer-properties");
      parameters="\"objectId\":"+JsonString(scope)+",\"ownProperties\":true,\"accessorPropertiesOnly\":false,\"generatePreview\":false";
    } else if(count==-3) {
      if(method!="Runtime.releaseObjectGroup" || context!=null || scope!=null || suppliedArguments!=null) throw Error("move-producer-release");
      parameters="\"objectGroup\":"+JsonString(group);
    } else {
      if(method!="Runtime.callFunctionOn" || context!=null || !handle(scope) || suppliedArguments==null || suppliedArguments.Length!=count) throw Error("move-producer-arguments");
      string arguments="[";
      for(int index=0;index<count;index++) {
        string selected=OptionalText(suppliedArguments[index]);if(!handle(selected))throw Error("move-producer-handle");
        if(index>0)arguments+=",";arguments+="{\"objectId\":"+JsonString(selected)+"}";
      }
      arguments+="]";
      parameters=effects+",\"objectId\":"+JsonString(scope)+",\"functionDeclaration\":"+JsonString(MoveProducerProgram(phase))+
        ",\"objectGroup\":"+JsonString(group)+",\"returnByValue\":"+(MoveProducerReturnValue(phase)?"true":"false")+",\"arguments\":"+arguments;
    }
    string message="{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+",\"method\":"+JsonString(method)+",\"params\":{"+
      parameters+"},\"sessionId\":"+JsonString(sessionId)+"}\0";
    if(Encoding.UTF8.GetByteCount(message)>(method=="Runtime.callFunctionOn"?65536:method=="Runtime.evaluate"?8192:1024)) throw Error("move-producer-size");
    return message;
  }
  public void SendMoveProducer(int id,string method,string sessionId,string phase,object context,object scope,object[] arguments) {
    string message=MoveProducerProtocolMessage(id,method,sessionId,phase,context,scope,arguments,stringPrecreate);
    if(moveProducerReleased || moveProducerStep>=12) throw Error("move-producer-consumed");
    if(moveProducerStep==0) {
      if(phase!="wrapper") throw Error("move-producer-first");
      moveProducerSession=sessionId;moveProducerContext=OptionalText(context);
    } else if(sessionId!=moveProducerSession) throw Error("move-producer-session");
    if(phase=="release") {
      if(moveProducerStep==0) throw Error("move-producer-unstarted");
      moveProducerReleased=true;moveProducerStep=12;
    } else {
      if(phase!=MoveProducerSequence[moveProducerStep] ||
        (MoveProducerArgumentCount(phase)==-1 && OptionalText(context)!=moveProducerContext)) throw Error("move-producer-sequence");
      moveProducerStep++;
    }
    // Consumed before write: a partial write never permits replay or reattach.
    SendMessage(id,message);
  }
  string WorkerStartupProtocolMessage(int id,string method,string sessionId,string phase,System.Collections.IDictionary fields) {
    if(!workerStartup || stringPrecreate)throw Error("startup-purpose");
    return workerStartup209?EasyedaWorkerStartupProtocol.Encode209(id,method,sessionId,phase,fields):EasyedaWorkerStartupProtocol.Encode(id,method,sessionId,phase,fields);
  }
  public void SendWorkerStartup(int id,string method,string sessionId,string phase,System.Collections.IDictionary fields) {
    // The original startup transport retains attachment, pause and cleanup
    // ownership. This native boundary reconstructs only fixed reviewed commands.
    SendMessage(id,WorkerStartupProtocolMessage(id,method,sessionId,phase,fields));
  }
  // Reprove the original live process, Job, pipes and continuously held
  // installation leases. Pin acquired these deny-write/delete handles before
  // hashing and retained them; this is not a timestamp-only or cached admission.
  public void ReproveWorkerStartup() {
    if(!workerStartup || stringPrecreate || !launchCompleted || protocolFailed)throw Error("startup-purpose");
    AssertLive();
  }
  string startupOpeningIdentity;
  string startupActorContext;
  bool startupOpeningConsumed;
  int startupActorReads;
  int startupPcbPhase;
  public static string WorkerStartupParentProtocolMessage(int id,string method,string phase,System.Collections.IDictionary fields) {
    if(id<1 || id>256 || fields==null)throw Error("startup-parent-fields");
    Func<string,string> text=key=>{if(!fields.Contains(key) || !(fields[key] is string))throw Error("startup-parent-text");return (string)fields[key];};
    Action<string[]> keys=expected=>{if(fields.Count!=expected.Length)throw Error("startup-parent-keys");foreach(string key in expected)if(!fields.Contains(key))throw Error("startup-parent-keys");};
    if(phase=="preflight" || phase=="open-project") {
      keys(new string[]{"sessionId","uniqueContextId","targetRawWindowsPath","targetProjectUuid","targetBranchUuid","targetDocumentUuid","targetExpectedSourceSha256"});
      if(method!="Runtime.callFunctionOn")throw Error("startup-parent-method");
      return OpeningProtocolMessageCore(false,id,text("sessionId"),text("uniqueContextId"),phase,text("targetRawWindowsPath"),text("targetProjectUuid"),text("targetBranchUuid"),text("targetDocumentUuid"),text("targetExpectedSourceSha256"),false,true);
    }
    if(phase=="pcb-preflight" || phase=="pcb-open-document" || phase=="pcb-observe") {
      keys(new string[]{"sessionId","uniqueContextId","targetRawWindowsPath","targetProjectUuid","targetBranchUuid","targetDocumentUuid","targetExpectedSourceSha256"});
      if(method!="Runtime.callFunctionOn")throw Error("startup-parent-method");
      return OpeningProtocolMessageCore(true,id,text("sessionId"),text("uniqueContextId"),phase.Substring(4),text("targetRawWindowsPath"),text("targetProjectUuid"),text("targetBranchUuid"),text("targetDocumentUuid"),text("targetExpectedSourceSha256"),false,true);
    }
    string session=null,parameters;
    if(phase=="targets") {
      keys(new string[]{});if(method!="Target.getTargets")throw Error("startup-parent-method");parameters="{}";
    } else {
      session=text("sessionId");
      if(!System.Text.RegularExpressions.Regex.IsMatch(session,@"\A[A-Za-z0-9_.:-]{1,128}\z"))throw Error("startup-parent-session");
      if(phase=="frames") {
        keys(new string[]{"sessionId"});if(method!="Page.getFrameTree")throw Error("startup-parent-method");parameters="{}";
      } else if(phase=="pcb-source") {
        keys(new string[]{"sessionId","scriptId"});if(method!="Debugger.getScriptSource")throw Error("startup-parent-method");
        string script=text("scriptId");if(!System.Text.RegularExpressions.Regex.IsMatch(script,@"\A[A-Za-z0-9_.:-]{1,128}\z"))throw Error("startup-parent-script");
        parameters="{\"scriptId\":"+JsonString(script)+"}";
      } else if(phase=="frame-owner") {
        keys(new string[]{"sessionId","frameId"});if(method!="DOM.getFrameOwner")throw Error("startup-parent-method");
        string frame=text("frameId");if(!System.Text.RegularExpressions.Regex.IsMatch(frame,@"\A[A-Za-z0-9_.:-]{1,128}\z"))throw Error("startup-parent-frame");
        parameters="{\"frameId\":"+JsonString(frame)+"}";
      } else if(phase=="describe-owner") {
        keys(new string[]{"sessionId","backendNodeId"});if(method!="DOM.describeNode" || (!(fields["backendNodeId"] is int) && !(fields["backendNodeId"] is long)))throw Error("startup-parent-node");
        long node=Convert.ToInt64(fields["backendNodeId"],CultureInfo.InvariantCulture);if(node<1 || node>int.MaxValue)throw Error("startup-parent-node");
        parameters="{\"backendNodeId\":"+node.ToString(CultureInfo.InvariantCulture)+",\"depth\":0,\"pierce\":false}";
      } else if(phase=="actor-clock") {
        keys(new string[]{"sessionId","uniqueContextId"});if(method!="Runtime.callFunctionOn")throw Error("startup-parent-method");
        string context=text("uniqueContextId");if(!System.Text.RegularExpressions.Regex.IsMatch(context,@"\A[A-Za-z0-9_.:-]{1,128}\z"))throw Error("startup-parent-context");
        parameters="{\"functionDeclaration\":"+JsonString(EasyedaWorkerStartupProtocol.UiActorClockFunction)+",\"uniqueContextId\":"+JsonString(context)+",\"arguments\":[],\"returnByValue\":true,\"throwOnSideEffect\":true,\"silent\":true,\"awaitPromise\":false,\"generatePreview\":false,\"userGesture\":false}";
      } else throw Error("startup-parent-phase");
    }
    return "{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+",\"method\":"+JsonString(method)+",\"params\":"+parameters+(session==null?"":",\"sessionId\":"+JsonString(session))+"}\0";
  }
  public void SendWorkerStartupParent(int id,string method,string phase,System.Collections.IDictionary fields) {
    if(!workerStartup || stringPrecreate)throw Error("startup-purpose");
    string message=WorkerStartupParentProtocolMessage(id,method,phase,fields);
    if(phase=="preflight" || phase=="open-project") {
      // The same complete target/context tuple must survive the once-only
      // preflight and opening. Reservation precedes any potentially partial write.
      string identity=String.Join("\n",new string[]{(string)fields["sessionId"],(string)fields["uniqueContextId"],(string)fields["targetRawWindowsPath"],(string)fields["targetProjectUuid"],(string)fields["targetBranchUuid"],(string)fields["targetDocumentUuid"],(string)fields["targetExpectedSourceSha256"]});
      if(phase=="preflight") {if(startupOpeningIdentity!=null)throw Error("startup-opening-consumed");startupOpeningIdentity=identity;startupActorContext=(string)fields["sessionId"]+"\n"+(string)fields["uniqueContextId"];}
      else {if(startupOpeningIdentity!=identity || startupOpeningConsumed)throw Error("startup-opening-consumed");startupOpeningConsumed=true;}
    }
    if(phase=="actor-clock") {
      if(!startupOpeningConsumed || startupActorReads>=2 || startupActorContext!=(string)fields["sessionId"]+"\n"+(string)fields["uniqueContextId"])throw Error("startup-actor-sequence");
      startupActorReads++;
    }
    if(phase=="pcb-preflight" || phase=="pcb-open-document" || phase=="pcb-observe") {
      string identity=String.Join("\n",new string[]{(string)fields["sessionId"],(string)fields["uniqueContextId"],(string)fields["targetRawWindowsPath"],(string)fields["targetProjectUuid"],(string)fields["targetBranchUuid"],(string)fields["targetDocumentUuid"],(string)fields["targetExpectedSourceSha256"]});
      int expected=phase=="pcb-preflight"?0:phase=="pcb-open-document"?1:3;
      if(!startupOpeningConsumed || startupOpeningIdentity!=identity || startupPcbPhase!=expected)throw Error("startup-pcb-sequence");
      startupPcbPhase=expected+1;
    }
    if(phase=="pcb-source") {
      if(startupPcbPhase!=2 || startupActorContext==null || (string)fields["sessionId"]!=startupActorContext.Split('\n')[0])throw Error("startup-pcb-source-sequence");
      startupPcbPhase=3;
    }
    SendMessage(id,message);
  }
  public static void VerifyWorkerStartupPurposeSmoke() {
    foreach(EasyedaDiagnosticOwner owner in new EasyedaDiagnosticOwner[]{new EasyedaDiagnosticOwner(),CreateStringPrecreate(),CreateLayers209()}) {
      bool refused=false;
      try {owner.SendWorkerStartup(1,"Runtime.enable","s","runtime",new System.Collections.Hashtable());}
      catch(InvalidOperationException error) {if(error.Message!="pcb-diagnostic-startup-purpose")throw;refused=true;}
      if(!refused)throw Error("startup-purpose-smoke");
      refused=false;
      try {owner.ReproveWorkerStartup();}
      catch(InvalidOperationException error) {if(error.Message!="pcb-diagnostic-startup-purpose")throw;refused=true;}
      if(!refused)throw Error("startup-reprove-purpose-smoke");
    }
    foreach(EasyedaDiagnosticOwner owner in new EasyedaDiagnosticOwner[]{CreateWorkerStartup(),CreateWorkerStartup209()}) {
      bool unlaunched=false;
      try {owner.ReproveWorkerStartup();}
      catch(InvalidOperationException error) {if(error.Message!="pcb-diagnostic-startup-purpose")throw;unlaunched=true;}
      if(!unlaunched || owner.RequestLimit!=256 || owner.nextRequest!=1 || !owner.workerStartup || owner.stringPrecreate || owner.layers209)throw Error("startup-reprove-unlaunched-smoke");
      System.Collections.Hashtable fields=new System.Collections.Hashtable(StringComparer.Ordinal);fields.Add("scriptId","s");fields.Add("site","serial");
      string message=owner.WorkerStartupProtocolMessage(1,"Debugger.setBreakpoint","worker","breakpoint",fields);
      int column=owner.workerStartup209?145582:145558;
      if(message.IndexOf("\"lineNumber\":108,\"columnNumber\":"+column.ToString(CultureInfo.InvariantCulture),StringComparison.Ordinal)<0)throw Error("startup-generation-smoke");
      fields.Add("generation","209");bool extra=false;
      try {owner.WorkerStartupProtocolMessage(1,"Debugger.setBreakpoint","worker","breakpoint",fields);}
      catch(InvalidOperationException error) {if(error.Message!="pcb-diagnostic-startup-fields")throw;extra=true;}
      if(!extra)throw Error("startup-generation-field-smoke");
    }
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
  public Dictionary<string,object> TerminationObservation() {
    // Observe only the retained original handles. Partial/unknown creation
    // cannot become closure proof. Two samples preserve the combined gate;
    // separate fields explain a false result without authorizing cleanup.
    object exited=null,empty=null;
    if(creationPhase!=CreationPhase.Unknown && root!=IntPtr.Zero && job!=IntPtr.Zero) {
      bool rootFirst=RootExited(),jobFirst=JobCount()==0;
      bool rootSecond=RootExited(),jobSecond=JobCount()==0;
      exited=rootFirst && rootSecond; empty=jobFirst && jobSecond;
    }
    bool complete=exited is bool && (bool)exited && empty is bool && (bool)empty;
    return new Dictionary<string,object>{{"originalRootExited",exited},{"originalJobEmpty",empty},{"terminated",complete}};
  }
  // String clocks bind only this original Job/root. They are not ordinary
  // authority tokens, Save permission, or proof of a clocked launch.
  int stringClockSequence,stringClockLiveStage;
  bool stringClockTerminated,stringClockFailed;
  readonly HashSet<string> stringClockAttempts=new HashSet<string>(StringComparer.Ordinal);
  static int StringClockPhase(string phase) {
    switch(phase) { case "before": return 0; case "armed": return 1; case "post": return 2; case "termination": return 3; }
    throw Error("string-clock-phase");
  }
  void AssertStringClockOwner(bool terminated) {
    if(!launchCompleted || root==IntPtr.Zero || rootCreated<=0 || rootPid==0 || released) throw Error("string-clock-owner");
    if(terminated) {
      AssertLimits(); AssertPipes(); installation.AssertCurrent();
      if(!Terminated()) throw Error("string-clock-not-terminated");
    } else AssertLive();
  }
  public object StringClock(string phase,int sequence) {
    if(!stringPrecreate) throw Error("string-clock-purpose");
    int stage=StringClockPhase(phase);
    // The TS owner consumes before its own pre-dispatch checks. Only terminal
    // cleanup may bridge such an unreceived sequence; live samples stay exact.
    if(sequence<1 || sequence>4 || sequence<=stringClockSequence || (stage!=3 && sequence!=stringClockSequence+1) ||
       stringClockTerminated || stringClockAttempts.Contains(phase)) throw Error("string-clock-consumed");
    if(stage!=3 && (stringClockFailed || stage!=stringClockLiveStage)) throw Error("string-clock-order");
    // Reserve before any owner read, sample or publication. Even unavailable
    // observations and lost replies never permit resampling the same phase.
    stringClockSequence=sequence; stringClockAttempts.Add(phase);
    if(stage==3) stringClockTerminated=true; else stringClockLiveStage++;
    try {
      AssertStringClockOwner(stage==3);
      EasyedaStringClockObservation before=EasyedaStringClockObservation.Read();
      AssertStringClockOwner(stage==3);
      EasyedaStringClockObservation after=EasyedaStringClockObservation.Read();
      AssertStringClockOwner(stage==3);
      if(!before.tzAbsent || !after.tzAbsent || before.sample==null || after.sample==null || before.reason!=null || after.reason!=null) stringClockFailed=true;
      return new Dictionary<string,object> {
        {"schema","easyeda-pro-control.pcb-string-native-clock.v1"},{"phase",phase},{"sequence",sequence},
        {"binding",new Dictionary<string,object>{{"helperInstance",HelperInstance},{"jobId",JobId},{"rootPid",rootPid},{"rootCreated",RootCreated}}},
        {"clock",new Dictionary<string,object>{{"before",before},{"after",after}}}
      };
    } catch { stringClockFailed=true; throw; }
  }
  public static void VerifyStringClockSmoke() {
    EasyedaDiagnosticOwner diagnostic=new EasyedaDiagnosticOwner();
    bool refused=false;
    try { diagnostic.StringClock("before",1); } catch(InvalidOperationException e) { if(e.Message!="pcb-diagnostic-string-clock-purpose") throw; refused=true; }
    if(!refused) throw Error("string-clock-purpose-smoke");
    foreach(string phase in new string[]{null,"","BEFORE","save"}) {
      EasyedaDiagnosticOwner unused=CreateStringPrecreate();refused=false;
      try { unused.StringClock(phase,1); } catch(InvalidOperationException e) { if(e.Message!="pcb-diagnostic-string-clock-phase") throw; refused=true; }
      if(!refused || unused.launchAttempted || unused.root!=IntPtr.Zero) throw Error("string-clock-phase-smoke");
    }
    foreach(int sequence in new int[]{0,2,5}) {
      EasyedaDiagnosticOwner unused=CreateStringPrecreate();refused=false;
      try { unused.StringClock("before",sequence); } catch(InvalidOperationException e) { if(e.Message!="pcb-diagnostic-string-clock-consumed") throw; refused=true; }
      if(!refused || unused.launchAttempted || unused.root!=IntPtr.Zero) throw Error("string-clock-sequence-smoke");
    }
    EasyedaDiagnosticOwner fresh=CreateStringPrecreate();refused=false;
    try { fresh.StringClock("before",1); } catch(InvalidOperationException e) { if(e.Message!="pcb-diagnostic-string-clock-owner") throw; refused=true; }
    if(!refused || fresh.stringClockSequence!=1 || !fresh.stringClockFailed || fresh.launchAttempted || fresh.root!=IntPtr.Zero) throw Error("string-clock-owner-smoke");
    refused=false;
    try { fresh.StringClock("before",1); } catch(InvalidOperationException e) { if(e.Message!="pcb-diagnostic-string-clock-consumed") throw; refused=true; }
    if(!refused) throw Error("string-clock-replay-smoke");
    refused=false;
    try { fresh.StringClock("armed",2); } catch(InvalidOperationException e) { if(e.Message!="pcb-diagnostic-string-clock-order") throw; refused=true; }
    if(!refused) throw Error("string-clock-failed-order-smoke");
    refused=false;
    try { fresh.StringClock("termination",2); } catch(InvalidOperationException e) { if(e.Message!="pcb-diagnostic-string-clock-owner") throw; refused=true; }
    if(!refused || !fresh.stringClockTerminated || fresh.launchAttempted || fresh.root!=IntPtr.Zero) throw Error("string-clock-termination-smoke");
    foreach(int sequence in new int[]{2,4}) {
      EasyedaDiagnosticOwner skipped=CreateStringPrecreate();refused=false;
      try { skipped.StringClock("termination",sequence); } catch(InvalidOperationException e) { if(e.Message!="pcb-diagnostic-string-clock-owner") throw; refused=true; }
      if(!refused || skipped.stringClockSequence!=sequence || !skipped.stringClockTerminated || skipped.launchAttempted || skipped.root!=IntPtr.Zero)
        throw Error("string-clock-terminal-gap-smoke");
      refused=false;
      try { skipped.StringClock("termination",sequence); } catch(InvalidOperationException e) { if(e.Message!="pcb-diagnostic-string-clock-consumed") throw; refused=true; }
      if(!refused) throw Error("string-clock-terminal-gap-replay-smoke");
    }
    EasyedaDiagnosticOwner stale=CreateStringPrecreate();stale.stringClockSequence=2;
    foreach(int sequence in new int[]{0,1,2,5}) {
      refused=false;
      try { stale.StringClock("termination",sequence); } catch(InvalidOperationException e) { if(e.Message!="pcb-diagnostic-string-clock-consumed") throw; refused=true; }
      if(!refused || stale.stringClockSequence!=2 || stale.stringClockTerminated || stale.launchAttempted || stale.root!=IntPtr.Zero)
        throw Error("string-clock-terminal-stale-smoke");
    }
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
$owner=if ($WorkerStartup209) {[EasyedaDiagnosticOwner]::CreateWorkerStartup209()} elseif ($WorkerStartup) {[EasyedaDiagnosticOwner]::CreateWorkerStartup()} elseif ($StringPrecreate) {[EasyedaDiagnosticOwner]::CreateStringPrecreate()} elseif ($Layers209) {[EasyedaDiagnosticOwner]::CreateLayers209()} else {New-Object EasyedaDiagnosticOwner}
try {
  $owner.Initialize()
  if ($CompileOnly) {
    [EasyedaWorkerStartupProtocol]::VerifySmoke()
    [EasyedaWorkerStartupProtocol]::Verify209Smoke()
    [EasyedaDiagnosticOwner]::VerifyWorkerStartupPurposeSmoke()
    [EasyedaDiagnosticInstallation]::VerifyLeaseSmoke()
    [EasyedaDiagnosticOwner]::VerifyProtocolSmoke()
    [EasyedaDiagnosticOwner]::VerifyPackedProgramSmoke()
    [EasyedaDiagnosticOwner]::VerifyLayers209Smoke()
    [EasyedaDiagnosticOwner]::VerifyPrimitives209Smoke()
    [EasyedaDiagnosticOwner]::VerifyExtendedPrimitives209Smoke()
    [EasyedaDiagnosticOwner]::VerifyArcShapes209Smoke()
    [EasyedaDiagnosticOwner]::VerifyPouredShapes209Smoke()
    [EasyedaDiagnosticOwner]::VerifyPadShapes209Smoke()
    [EasyedaDiagnosticOwner]::VerifyImageShapes209Smoke()
    [EasyedaDiagnosticOwner]::VerifySelectionRelations209Smoke()
    [EasyedaDiagnosticOwner]::VerifyStringClockSmoke()
    $selectionSmokePath='C:\Reviewed\SelectionRelationsFixture.eprj2'
    $selectionSmokeHasher=[Security.Cryptography.SHA256]::Create()
    try {$selectionSmokeProject=([BitConverter]::ToString($selectionSmokeHasher.ComputeHash([Text.Encoding]::UTF8.GetBytes($selectionSmokePath)))).Replace('-','').ToLowerInvariant()}
    finally {$selectionSmokeHasher.Dispose()}
    foreach ($selectionSmokeJson in @('{"componentIds":[]}','{"componentIds":["component-2","component-1"]}')) {
      $selectionSmokeRequest=ConvertFrom-Json -InputObject $selectionSmokeJson
      if ($selectionSmokeRequest.componentIds -isnot [array]) {throw 'pcb-diagnostic-selection-relations209-bound-array'}
      $selectionSmokeMessage=[EasyedaDiagnosticOwner]::SelectionRelations209ProtocolMessage(103,'s','c','observe',$selectionSmokePath,$selectionSmokeProject,('a'*32),('b'*16),('c'*64),[string[]]$selectionSmokeRequest.componentIds)
      $selectionSmokeExpected=if ($selectionSmokeRequest.componentIds.Length -eq 0) {'{"value":[]}'} else {'{"value":["component-2","component-1"]}'}
      if ($selectionSmokeMessage.IndexOf($selectionSmokeExpected,[StringComparison]::Ordinal) -lt 0) {throw 'pcb-diagnostic-selection-relations209-bound-ids'}
    }
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
    if ($common -cne ('{"id":7,"method":"Runtime.releaseObjectGroup","params":{"objectGroup":"easyeda-pro-control-pcb-common-baseline-v3"},"sessionId":"s"}'+[char]0)) {throw 'pcb-diagnostic-bound-common-release'}
    foreach ($phase in @('constructors','presentation-seed','rules-seed','preference-seed','assets','metadata')) {
      $constructors=if ($phase -ceq 'constructors' -or $phase -ceq 'metadata') {$null} else {'constructors'}
      $arguments='"arguments":[{"objectId":"callback"}'+$(if ($null -ne $constructors) {',{"objectId":"constructors"}'} else {''})+']'
      $common=[EasyedaDiagnosticOwner]::CommonBaselineProtocolMessage(8,'Runtime.callFunctionOn','s',$phase,$null,'scope','callback',$constructors)
      if ($common.IndexOf($arguments,[StringComparison]::Ordinal) -lt 0) {throw 'pcb-diagnostic-bound-common-arguments'}
    }
    foreach ($phase in @('packet-advance','packet-read','packet-result')) {
      $common=[EasyedaDiagnosticOwner]::CommonBaselineProtocolMessage(8,'Runtime.callFunctionOn','s',$phase,$null,'packet',$null,$null)
      if ($common.IndexOf('"objectId":"packet"',[StringComparison]::Ordinal) -lt 0 -or
          $common.IndexOf('"arguments"',[StringComparison]::Ordinal) -ge 0) {throw 'pcb-diagnostic-bound-common-packet'}
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
      $largeOpening=$request.action -ceq 'worker-startup-parent' -and $request.method -ceq 'Runtime.callFunctionOn' -and @('preflight','open-project','pcb-preflight','pcb-open-document','pcb-observe') -ccontains $request.parentPhase
      if ([Text.Encoding]::UTF8.GetByteCount($line.ToString()) -gt 32768 -or
          (-not $largeOpening -and ($request.action -cne 'send' -or $request.method -cne 'Runtime.callFunctionOn') -and $line.Length -gt 4096)) {throw 'pcb-diagnostic-request-size'}
      if ($request.id -isnot [string] -or $request.id -cnotmatch '^[a-f0-9]{32}$') {throw 'pcb-diagnostic-request-id'}
      $id=$request.id
      if ($launched -and $request.action -cne 'identity' -and ($request.helperInstance -isnot [string] -or $request.jobId -isnot [string] -or $request.rootCreated -isnot [string] -or ($request.rootPid -isnot [int] -and $request.rootPid -isnot [long]) -or $request.helperInstance -cne $owner.HelperInstance -or $request.jobId -cne $owner.JobId -or $request.rootCreated -cne $owner.RootCreated -or $request.rootPid -ne $owner.RootPid)) {throw 'pcb-diagnostic-owner-binding'}
      switch -CaseSensitive ($request.action) {
        'worker-startup-reprove' {
          if (-not $startupPurpose -or -not $launched -or
              (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid') {throw 'pcb-diagnostic-startup-reprove-fields'}
          $owner.ReproveWorkerStartup()
          $result=@{current=$true}
        }
        'worker-startup-parent' {
          if (-not $startupPurpose -or -not $launched -or $request.method -isnot [string] -or $request.parentPhase -isnot [string] -or
              ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or $request.requestId -lt 1 -or $request.requestId -gt 256) {throw 'pcb-diagnostic-startup-parent-fields'}
          $baseFields=@('action','helperInstance','id','jobId','method','requestId','rootCreated','rootPid','parentPhase')
          $parentFields=@{}
          foreach ($property in $request.PSObject.Properties) {
            if ($baseFields -cnotcontains $property.Name) {
              if (@('sessionId','uniqueContextId','targetRawWindowsPath','targetProjectUuid','targetBranchUuid','targetDocumentUuid','targetExpectedSourceSha256','frameId','backendNodeId','scriptId') -cnotcontains $property.Name) {throw 'pcb-diagnostic-startup-parent-field'}
              $parentFields[$property.Name]=$property.Value
            }
          }
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-startup-parent-field'}}
          $owner.SendWorkerStartupParent([int]$request.requestId,$request.method,$request.parentPhase,$parentFields)
          $result=@{written=$true}
        }
        'worker-startup-send' {
          if (-not $startupPurpose -or -not $launched -or $request.method -isnot [string] -or $request.sessionId -isnot [string] -or
              $request.startupPhase -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or
              $request.requestId -lt 1 -or $request.requestId -gt 256) {throw 'pcb-diagnostic-startup-fields'}
          $baseFields=@('action','helperInstance','id','jobId','method','requestId','rootCreated','rootPid','sessionId','startupPhase')
          $startupFields=@{}
          foreach ($property in $request.PSObject.Properties) {
            if ($baseFields -cnotcontains $property.Name) {
              if (@('scriptId','breakpointId','site','selector','callFrameId','objectId','argument0','argument1','argument2','argument3','argument4') -cnotcontains $property.Name -or
                  $property.Value -isnot [string]) {throw 'pcb-diagnostic-startup-field'}
              $startupFields[$property.Name]=$property.Value
            }
          }
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'pcb-diagnostic-startup-field'}}
          $owner.SendWorkerStartup([int]$request.requestId,$request.method,$request.sessionId,$request.startupPhase,$startupFields)
          $result=@{written=$true}
        }
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
              if ($null -ne $request.pcbPouredShapes209Phase) {if (-not $Layers209) {throw 'pcb-diagnostic-poured-shapes209-purpose'};$fields+=@('pcbPouredShapes209Phase')} elseif ($null -ne $request.pcbArcShapes209Phase) {if (-not $Layers209) {throw 'pcb-diagnostic-arc-shapes209-purpose'};$fields+=@('pcbArcShapes209Phase')} elseif ($null -ne $request.pcbImageShapes209Phase) {if (-not $Layers209) {throw 'pcb-diagnostic-image-shapes209-purpose'};$fields+=@('pcbImageShapes209Phase')} elseif ($null -ne $request.pcbPadShapes209Phase) {if (-not $Layers209) {throw 'pcb-diagnostic-pad-shapes209-purpose'};$fields+=@('pcbPadShapes209Phase')} elseif ($null -ne $request.pcbSelectionRelations209Phase) {if (-not $Layers209) {throw 'pcb-diagnostic-selection-relations209-purpose'};$fields+=@('pcbSelectionRelations209Phase','componentIds')} elseif ($null -ne $request.pcbExtendedPrimitives209Phase) {if (-not $Layers209) {throw 'pcb-diagnostic-extended-primitives209-purpose'};$fields+=@('pcbExtendedPrimitives209Phase')} elseif ($null -ne $request.pcbPrimitives209Phase) {if (-not $Layers209) {throw 'pcb-diagnostic-primitives209-purpose'};$fields+=@('pcbPrimitives209Phase')} elseif ($null -ne $request.pcbLayers209Phase) {if (-not $Layers209) {throw 'pcb-diagnostic-layers209-purpose'};$fields+=@('pcbLayers209Phase')} elseif ($null -ne $request.pcbOpeningPhase) {$fields+=@('pcbOpeningPhase')} else {$fields+=@('openingPhase')}
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
            if ($null -ne $request.pcbPouredShapes209Phase) {
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
        'poll' {if (-not $launched) {throw 'pcb-diagnostic-not-launched'}; $result=@{bytes=$owner.Poll()}}
        'string-clock' {
          if (-not $StringPrecreate -or -not $launched -or $request.phase -isnot [string] -or
              ($request.sequence -isnot [int] -and $request.sequence -isnot [long]) -or $request.sequence -lt 1 -or $request.sequence -gt 4 -or
              (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,phase,rootCreated,rootPid,sequence') {throw 'pcb-diagnostic-string-clock-fields'}
          $result=$owner.StringClock($request.phase,[int]$request.sequence)
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
