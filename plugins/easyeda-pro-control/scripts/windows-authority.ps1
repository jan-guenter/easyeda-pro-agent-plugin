param([switch]$CompileOnly)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
# This helper deliberately has no TerminateProcess, TerminateJobObject, taskkill,
# kill-on-close flag, attach-to-existing-process, or arbitrary command action.
# The retained Job covers descendants launched normally by EasyEDA. APIs that
# delegate execution to an outside broker/service are outside this policy.
Add-Type @'
using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;
public sealed class EasyedaAuthorityJob : IDisposable {
  [StructLayout(LayoutKind.Sequential)] struct STARTUPINFO {
    public int cb; public IntPtr reserved, desktop, title;
    public int x, y, xSize, ySize, xCountChars, yCountChars, fillAttribute, flags;
    public short showWindow, reservedSize; public IntPtr reserved2, stdin, stdout, stderr;
  }
  [StructLayout(LayoutKind.Sequential)] struct STARTUPINFOEX {
    public STARTUPINFO startup; public IntPtr attributes;
  }
  [StructLayout(LayoutKind.Sequential)] struct PROCESS_INFORMATION {
    public IntPtr process, thread; public uint processId, threadId;
  }
  [StructLayout(LayoutKind.Sequential)] struct BASIC_LIMIT_INFORMATION {
    public long perProcessTime, perJobTime; public uint flags;
    public UIntPtr minimumWorkingSet, maximumWorkingSet; public uint activeProcessLimit;
    public UIntPtr affinity; public uint priorityClass, schedulingClass;
  }
  [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)] static extern IntPtr CreateJobObject(IntPtr attributes, string name);
  [DllImport("kernel32.dll", SetLastError=true)] static extern bool QueryInformationJobObject(IntPtr job, int kind, IntPtr data, uint size, out uint returned);
  [DllImport("kernel32.dll", SetLastError=true)] static extern bool IsProcessInJob(IntPtr process, IntPtr job, out bool result);
  [DllImport("kernel32.dll", SetLastError=true)] static extern bool InitializeProcThreadAttributeList(IntPtr list, int count, uint flags, ref IntPtr size);
  [DllImport("kernel32.dll", SetLastError=true)] static extern bool UpdateProcThreadAttribute(IntPtr list, uint flags, IntPtr attribute, IntPtr value, IntPtr size, IntPtr previous, IntPtr returned);
  [DllImport("kernel32.dll")] static extern void DeleteProcThreadAttributeList(IntPtr list);
  [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)] static extern bool CreateProcess(string application, StringBuilder command, IntPtr processAttributes, IntPtr threadAttributes, bool inheritHandles, uint flags, IntPtr environment, string directory, ref STARTUPINFOEX startup, out PROCESS_INFORMATION info);
  [DllImport("kernel32.dll", SetLastError=true)] static extern bool CloseHandle(IntPtr handle);
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr window, out uint processId);
  [DllImport("user32.dll", SetLastError=true)] static extern bool PostMessage(IntPtr window, uint message, IntPtr wparam, IntPtr lparam);
  IntPtr job;
  public readonly string Id = Guid.NewGuid().ToString("N");
  public Process Root { get; private set; }
  public EasyedaAuthorityJob() {
    job = CreateJobObject(IntPtr.Zero, null);
    if (job == IntPtr.Zero) throw new Win32Exception(Marshal.GetLastWin32Error());
    try { AssertLimits(); } catch { CloseHandle(job); job = IntPtr.Zero; throw; }
  }
  public void AssertLimits() {
    // JOBOBJECT_BASIC_LIMIT_INFORMATION has LimitFlags at byte 16.
    int size = Marshal.SizeOf(typeof(BASIC_LIMIT_INFORMATION));
    IntPtr data = Marshal.AllocHGlobal(size);
    try {
      uint returned;
      if (!QueryInformationJobObject(job, 2, data, (uint)size, out returned)) throw new Win32Exception(Marshal.GetLastWin32Error());
      if (Marshal.ReadInt32(data, 16) != 0) throw new InvalidOperationException("authority-job-limits-changed");
    } finally { Marshal.FreeHGlobal(data); }
  }
  public void Launch(string executable) {
    if (Root != null) throw new InvalidOperationException("authority-job-already-launched");
    // JOB_LIST assigns the new process atomically at creation. No suspended
    // uncontained process is left behind if Job assignment is unsupported.
    IntPtr size = IntPtr.Zero;
    InitializeProcThreadAttributeList(IntPtr.Zero, 1, 0, ref size);
    if (size == IntPtr.Zero) throw new Win32Exception(Marshal.GetLastWin32Error());
    IntPtr list = Marshal.AllocHGlobal(size), jobs = Marshal.AllocHGlobal(IntPtr.Size);
    bool initialized = false;
    try {
      if (!InitializeProcThreadAttributeList(list, 1, 0, ref size)) throw new Win32Exception(Marshal.GetLastWin32Error());
      initialized = true;
      Marshal.WriteIntPtr(jobs, job);
      if (!UpdateProcThreadAttribute(list, 0, new IntPtr(0x0002000D), jobs, new IntPtr(IntPtr.Size), IntPtr.Zero, IntPtr.Zero)) throw new Win32Exception(Marshal.GetLastWin32Error());
      STARTUPINFOEX startup = new STARTUPINFOEX();
      startup.startup.cb = Marshal.SizeOf(typeof(STARTUPINFOEX)); startup.attributes = list;
      PROCESS_INFORMATION info;
      if (!CreateProcess(executable, new StringBuilder("\"" + executable + "\""), IntPtr.Zero, IntPtr.Zero, false, 0x00080000, IntPtr.Zero, System.IO.Path.GetDirectoryName(executable), ref startup, out info)) throw new Win32Exception(Marshal.GetLastWin32Error());
      try {
        Root = Process.GetProcessById(checked((int)info.processId));
        // Force acquisition of a retained process handle before returning.
        IntPtr retained = Root.Handle;
        if (!Contains(Root)) throw new InvalidOperationException("authority-launch-not-contained");
      } finally { CloseHandle(info.thread); CloseHandle(info.process); }
    } finally {
      if (initialized) DeleteProcThreadAttributeList(list);
      Marshal.FreeHGlobal(jobs); Marshal.FreeHGlobal(list);
    }
  }
  public bool Contains(Process process) {
    bool contains;
    if (!IsProcessInJob(process.Handle, job, out contains)) throw new Win32Exception(Marshal.GetLastWin32Error());
    return contains;
  }
  public int[] Pids() {
    AssertLimits();
    const int maximum = 512;
    int size = 8 + maximum * IntPtr.Size;
    IntPtr data = Marshal.AllocHGlobal(size);
    try {
      uint returned;
      if (!QueryInformationJobObject(job, 3, data, (uint)size, out returned)) throw new Win32Exception(Marshal.GetLastWin32Error());
      int assigned = Marshal.ReadInt32(data, 0), count = Marshal.ReadInt32(data, 4);
      if (assigned != count || count < 0 || count > maximum) throw new InvalidOperationException("authority-process-list-incomplete");
      int[] result = new int[count];
      for (int i = 0; i < count; i++) result[i] = checked((int)Marshal.ReadIntPtr(data, 8 + i * IntPtr.Size).ToInt64());
      Array.Sort(result); return result;
    } finally { Marshal.FreeHGlobal(data); }
  }
  public void NormalClose(long hwnd, string expectedStartTicks) {
    if (Root == null || Root.HasExited || Root.StartTime.ToUniversalTime().Ticks.ToString(System.Globalization.CultureInfo.InvariantCulture) != expectedStartTicks || !Contains(Root)) throw new InvalidOperationException("authority-root-generation-changed");
    uint pid;
    GetWindowThreadProcessId(new IntPtr(hwnd), out pid);
    if (pid != Root.Id) throw new InvalidOperationException("authority-window-owner-mismatch");
    if (!PostMessage(new IntPtr(hwnd), 16, IntPtr.Zero, IntPtr.Zero)) throw new Win32Exception(Marshal.GetLastWin32Error());
  }
  public void Dispose() {
    // Closing our handle does NOT terminate or save the user's application.
    if (job != IntPtr.Zero) { CloseHandle(job); job = IntPtr.Zero; }
    if (Root != null) Root.Dispose();
  }
}
'@
# BEGIN PRIVATE CLOCK COLLECTOR
Add-Type @'
// Private proposal. No managed or native process-launch API is called here.
using System;
using System.Diagnostics;
using System.Globalization;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;

public sealed class EasyedaClockSample {
  public string schema = "easyeda-pro-control.windows-clock-sample.v1";
  public string utcBeforeTicks, utcAfterTicks, qpcBefore, qpcAfter, qpcFrequency;
  public bool highResolution = true;
  public int localOffsetMinutes;
  public string zoneRulesSha256;
}
public sealed class EasyedaClockObservation {
  public bool tzAbsent;
  public string reason;
  public EasyedaClockSample sample;
  [DllImport("kernel32.dll", EntryPoint="GetEnvironmentVariableW", CharSet=CharSet.Unicode, ExactSpelling=true, SetLastError=true)]
  static extern uint GetEnvironmentVariable(string name, IntPtr buffer, uint size);
  [DllImport("kernel32.dll", EntryPoint="SetLastError", ExactSpelling=true)]
  static extern void ResetLastError(uint code);

  public static EasyedaClockObservation Read() {
    EasyedaClockObservation result = new EasyedaClockObservation();
    try {
      // Query presence only. Empty, present and ambiguous/error cases do not
      // prove absence. Never retrieve a value or mutate the process environment.
      ResetLastError(0);
      uint length = GetEnvironmentVariable("TZ", IntPtr.Zero, 0);
      int error = Marshal.GetLastWin32Error();
      if (length != 0 || error != 203) {
        result.reason = length != 0 || error == 0 ? "tz-present" : "tz-query";
        return result;
      }
      result.tzAbsent = true;
      if (!Stopwatch.IsHighResolution || Stopwatch.Frequency <= 0) {
        result.reason = "clock-sample"; return result;
      }
      long qpcBefore = Stopwatch.GetTimestamp();
      DateTime utcBefore = DateTime.UtcNow;
      TimeZoneInfo.ClearCachedData();
      TimeZoneInfo zone = TimeZoneInfo.Local;
      TimeSpan offset = zone.GetUtcOffset(utcBefore);
      string rules = zone.ToSerializedString();
      if (rules.Length > 65536 || offset.Ticks % TimeSpan.TicksPerMinute != 0 ||
          offset.TotalMinutes < -840 || offset.TotalMinutes > 840) {
        result.reason = "timezone"; return result;
      }
      string rulesHash;
      using (SHA256 hash = SHA256.Create()) {
        rulesHash = BitConverter.ToString(hash.ComputeHash(Encoding.UTF8.GetBytes(rules))).Replace("-", "").ToLowerInvariant();
      }
      DateTime utcAfter = DateTime.UtcNow;
      long qpcAfter = Stopwatch.GetTimestamp();
      if (qpcBefore < 0 || qpcAfter < qpcBefore || utcAfter < utcBefore ||
          qpcAfter - qpcBefore > Stopwatch.Frequency ||
          utcAfter.Ticks - utcBefore.Ticks > TimeSpan.TicksPerSecond) {
        result.reason = "clock-sample"; return result;
      }
      EasyedaClockSample value = new EasyedaClockSample();
      value.utcBeforeTicks = utcBefore.Ticks.ToString(CultureInfo.InvariantCulture);
      value.utcAfterTicks = utcAfter.Ticks.ToString(CultureInfo.InvariantCulture);
      value.qpcBefore = qpcBefore.ToString(CultureInfo.InvariantCulture);
      value.qpcAfter = qpcAfter.ToString(CultureInfo.InvariantCulture);
      value.qpcFrequency = Stopwatch.Frequency.ToString(CultureInfo.InvariantCulture);
      value.localOffsetMinutes = checked((int)offset.TotalMinutes);
      value.zoneRulesSha256 = rulesHash;
      result.sample = value;
      return result;
    } catch {
      // Exception strings can reveal system details. Preserve only a fixed
      // unavailable category; a clock failure must not mask a legacy result.
      result.reason = "clock-sample";
      return result;
    }
  }
}
'@
# END PRIVATE CLOCK COLLECTOR
if ($CompileOnly) {
  $probe=New-Object EasyedaAuthorityJob
  try {
    $empty=@($probe.Pids()).Count -eq 0
    @{schema='easyeda-pro-control.windows-authority-helper.v1';compiled=$true;emptyJobProbe=$empty} | ConvertTo-Json -Compress
  } finally {$probe.Dispose()}
  exit
}
$jobs = @{}
$captures = @{}
$usedCaptureBindings = @{}
$probes = @{}
$currentJob = $null
$helperInstance = [Guid]::NewGuid().ToString('N')
# BEGIN PRIVATE CLOCK ACTIONS
# Private fixed wrappers. Legacy Handle-Request and Finish-Probe stay unchanged.
$clockedJobs = @{}
function Read-ClockObservation {
  try {return [EasyedaClockObservation]::Read()}
  catch {return @{tzAbsent=$false;reason='clock-sample';sample=$null}}
}
function Make-ClockAttachment($before, $after, [bool]$clockedLaunch) {
  try {
    if (-not $clockedLaunch) {return @{status='unavailable';reason='not-clocked-launch'}}
    foreach ($value in @($before,$after)) {
      if (-not $value.tzAbsent -or $null -eq $value.sample) {
        $reason=$value.reason
        if ($reason -cnotin @('tz-present','tz-query','clock-sample','timezone')) {$reason='clock-sample'}
        return @{status='unavailable';reason=$reason}
      }
    }
    return @{status='observed';tzAbsentBefore=$true;tzAbsentAfter=$true;before=$before.sample;after=$after.sample}
  } catch {return @{status='unavailable';reason='clock-sample'}}
}
function Handle-ClockedRequest($request) {
  $phase=$null
  $legacyAction=$null
  switch -CaseSensitive ($request.action) {
    'clocked-launch' {$phase='launch';$legacyAction='launch'}
    'clocked-capture' {$phase='capture';$legacyAction='capture'}
    'clocked-finish-probe' {$phase='capture';$legacyAction='finish-probe'}
    'clocked-prove-terminated' {$phase='termination';$legacyAction='prove-terminated'}
    default {return Handle-Request $request}
  }
  # Input is the fixed JSON request parsed by the existing outer loop.
  $legacy=@{}
  foreach ($property in $request.PSObject.Properties) {$legacy[$property.Name]=$property.Value}
  $legacy.action=$legacyAction
  $before=Read-ClockObservation
  # Do not catch the legacy producer. Native failure retains its old error.
  # Never retry, synthesize a base, Save, terminate or choose a prompt.
  $base=Handle-Request $legacy
  $after=Read-ClockObservation
  $wasClocked=$false
  try {
    if ($phase -ceq 'launch') {$script:clockedJobs[$base.jobId]=$true}
    $wasClocked=$script:clockedJobs.ContainsKey($base.jobId)
  } catch {}
  $clock=Make-ClockAttachment $before $after $wasClocked
  return @{schema="easyeda-pro-control.windows-clocked-$phase.v1";base=$base;clock=$clock}
}
# END PRIVATE CLOCK ACTIONS
function Require-Text($value, [string]$pattern) {
  if ($value -isnot [string] -or $value -cnotmatch $pattern) { throw 'authority-invalid-text' }
  return $value
}
function Require-Pid($value) {
  if ($null -eq $value -or $value -is [string] -or [double]$value -ne [int]$value -or [int]$value -le 0) { throw 'authority-invalid-pid' }
  return [int]$value
}
function Process-Record($process, [string]$role, $job) {
  if ($process.HasExited -or -not $job.Contains($process)) {throw 'authority-process-not-live-in-job'}
  $ticks=$process.StartTime.ToUniversalTime().Ticks.ToString([Globalization.CultureInfo]::InvariantCulture)
  return @{pid=$process.Id;role=$role;startIdentity="win32:$ticks`:job:$($job.Id)"}
}
function Socket-Owner($socket) {
  if ($null -eq $socket) {return $null}
  $local=Require-Text $socket.localAddress '^[0-9a-fA-F:.]{2,64}$'
  $remote=Require-Text $socket.remoteAddress '^[0-9a-fA-F:.]{2,64}$'
  $localPort=Require-Pid $socket.localPort
  $remotePort=Require-Pid $socket.remotePort
  if ($localPort -gt 65535 -or $remotePort -gt 65535) {throw 'authority-invalid-port'}
  $connections=@(Get-NetTCPConnection -State Established -LocalAddress $local -LocalPort $localPort -RemoteAddress $remote -RemotePort $remotePort -ErrorAction Stop)
  if ($connections.Count -ne 1) {throw 'authority-socket-owner-not-unique'}
  return [int]$connections[0].OwningProcess
}
function Dispose-Probe([string]$binding) {
  $probe=$script:probes[$binding]
  if ($null -ne $probe) {
    if ($null -ne $probe.client) {$probe.client.Dispose()}
    $probe.listener.Stop()
    $script:probes.Remove($binding)
  }
}
function Finish-Probe($request) {
  $binding=Require-Text $request.bindingSha256 '^[a-f0-9]{64}$'
  $probe=$script:probes[$binding]
  if ($null -eq $probe -or $probe.finished -or $probe.nonce -cne $request.nonce -or $null -eq $script:currentJob -or $probe.jobId -cne $script:currentJob.Id) {throw 'authority-probe-not-owned'}
  try {
    while (-not $probe.listener.Pending()) {
      if ([DateTime]::UtcNow -gt $probe.deadline) {throw 'authority-probe-timeout'}
      Start-Sleep -Milliseconds 20
    }
    $probe.client=$probe.listener.AcceptTcpClient()
    $probe.listener.Stop()
    $stream=$probe.client.GetStream()
    $header=New-Object Text.StringBuilder
    while (-not $header.ToString().EndsWith("`r`n`r`n")) {
      $remaining=[int]($probe.deadline-[DateTime]::UtcNow).TotalMilliseconds
      if ($remaining -le 0 -or $header.Length -ge 8192) {throw 'authority-probe-header-bound'}
      $stream.ReadTimeout=$remaining
      $byte=$stream.ReadByte()
      if ($byte -lt 0 -or $byte -gt 127) {throw 'authority-probe-header-invalid'}
      [void]$header.Append([char]$byte)
    }
    $lines=$header.ToString().Split(@("`r`n"),[StringSplitOptions]::None)
    if ($lines[0] -cne "GET /$($probe.nonce) HTTP/1.1") {throw 'authority-probe-nonce-mismatch'}
    $headers=@{}
    foreach ($lineValue in $lines[1..($lines.Length-1)]) {
      if ($lineValue -eq '') {continue}
      $colon=$lineValue.IndexOf(':')
      if ($colon -le 0) {throw 'authority-probe-header-invalid'}
      $name=$lineValue.Substring(0,$colon).ToLowerInvariant()
      if ($headers.ContainsKey($name)) {throw 'authority-probe-header-duplicate'}
      $headers[$name]=$lineValue.Substring($colon+1).Trim()
    }
    if ($headers['host'] -cne "127.0.0.1:$($probe.port)" -or $headers['upgrade'] -ine 'websocket' -or $headers['connection'] -ine 'Upgrade' -or $headers['sec-websocket-version'] -cne '13' -or ($headers.ContainsKey('origin') -and $headers['origin'] -cne 'https://client')) {throw 'authority-probe-handshake-invalid'}
    $key=Require-Text $headers['sec-websocket-key'] '^[A-Za-z0-9+/]{22}==$'
    if ([Convert]::FromBase64String($key).Length -ne 16) {throw 'authority-probe-key-invalid'}
    $remote=$probe.client.Client.RemoteEndPoint
    $local=$probe.client.Client.LocalEndPoint
    if ($remote.Address.ToString() -cne '127.0.0.1' -or $local.Address.ToString() -cne '127.0.0.1' -or $local.Port -ne $probe.port) {throw 'authority-probe-not-loopback'}
    # Hold the accepted connection open while the regular capture proves its
    # Windows client owner and the complete retained Job. No NAT inference.
    $receipt=Handle-Request @{action='capture';bindingSha256=$binding;runtimePid=$null;socket=@{localAddress='127.0.0.1';localPort=$remote.Port;remoteAddress='127.0.0.1';remotePort=$local.Port}}
    $sha=[Security.Cryptography.SHA1]::Create()
    try {$accept=[Convert]::ToBase64String($sha.ComputeHash([Text.Encoding]::ASCII.GetBytes($key+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11')))} finally {$sha.Dispose()}
    $reply=[Text.Encoding]::ASCII.GetBytes("HTTP/1.1 101 Switching Protocols`r`nUpgrade: websocket`r`nConnection: Upgrade`r`nSec-WebSocket-Accept: $accept`r`n`r`n")
    $stream.WriteTimeout=2000
    $stream.Write($reply,0,$reply.Length)
    $message=[Text.Encoding]::UTF8.GetBytes((@{kind='easyeda-authority-probe';nonce=$probe.nonce} | ConvertTo-Json -Compress))
    if ($message.Length -ge 126) {throw 'authority-probe-frame-too-large'}
    $frame=New-Object byte[] (2+$message.Length)
    $frame[0]=129;$frame[1]=[byte]$message.Length
    [Array]::Copy($message,0,$frame,2,$message.Length)
    $stream.Write($frame,0,$frame.Length)
    $stream.Flush()
    $probe.finished=$true
    return $receipt
  } catch {
    Dispose-Probe $binding
    throw
  }
}
function Handle-Request($request) {
  if ($request.action -eq 'begin-probe') {
    $binding=Require-Text $request.bindingSha256 '^[a-f0-9]{64}$'
    if ($script:probes.Count -ne 0 -or $script:usedCaptureBindings.ContainsKey($binding) -or $null -eq $script:currentJob -or $script:currentJob.Root.HasExited) {throw 'authority-probe-not-available'}
    $bytes=New-Object byte[] 32
    $random=[Security.Cryptography.RandomNumberGenerator]::Create()
    try {$random.GetBytes($bytes)} finally {$random.Dispose()}
    $nonce=([BitConverter]::ToString($bytes)).Replace('-','').ToLowerInvariant()
    $listener=New-Object Net.Sockets.TcpListener([Net.IPAddress]::Loopback,0)
    $listener.ExclusiveAddressUse=$true
    $listener.Start(1)
    $port=$listener.LocalEndpoint.Port
    $script:probes[$binding]=@{listener=$listener;client=$null;port=$port;nonce=$nonce;finished=$false;deadline=[DateTime]::UtcNow.AddSeconds(10);jobId=$script:currentJob.Id}
    return @{schema='easyeda-pro-control.windows-process-probe.v1';bindingSha256=$binding;port=$port;nonce=$nonce}
  }
  if ($request.action -eq 'finish-probe') {return Finish-Probe $request}
  if ($request.action -eq 'end-probe') {
    $binding=Require-Text $request.bindingSha256 '^[a-f0-9]{64}$'
    Dispose-Probe $binding
    return @{closed=$true;bindingSha256=$binding}
  }
  if ($request.action -eq 'launch') {
    if ($request.confirmLaunch -ne $true) {throw 'authority-launch-not-authorized'}
    if ($null -ne $script:currentJob -and @($script:currentJob.Pids()).Count -ne 0) {throw 'authority-prior-job-not-empty'}
    $executable=Require-Text $request.executable '^[A-Za-z]:\\[^\x00-\x1f"\r\n]+\.exe$'
    $expectedHash=Require-Text $request.executableSha256 '^[a-f0-9]{64}$'
    $item=Get-Item -LiteralPath $executable -Force
    if ($item.PSIsContainer -or ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0 -or $item.FullName -cne $executable -or $item.Name -ine 'easyeda-pro.exe') {throw 'authority-invalid-executable'}
    foreach ($existing in [Diagnostics.Process]::GetProcessesByName('easyeda-pro')) {
      try { if ($existing.MainModule.FileName -ieq $executable) {throw 'authority-unsupervised-instance-present'} } finally {$existing.Dispose()}
    }
    # Deny replacement during creation. The executable remains pinned by the
    # reviewed runtime fingerprint after launch as well.
    $file=[IO.File]::Open($executable,[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::Read)
    try {
      $sha=[Security.Cryptography.SHA256]::Create()
      try {$actual=([BitConverter]::ToString($sha.ComputeHash($file))).Replace('-','').ToLowerInvariant()} finally {$sha.Dispose()}
      if ($actual -cne $expectedHash) {throw 'authority-executable-hash-mismatch'}
      $job=New-Object EasyedaAuthorityJob
      $script:jobs[$job.Id]=$job
      $script:currentJob=$job
      $job.Launch($executable)
      $record=Process-Record $job.Root 'easyeda-main' $job
      return @{jobId=$job.Id;root=$record;helperInstance=$script:helperInstance}
    } finally {$file.Dispose()}
  }
  if ($request.action -eq 'capture') {
    $binding=Require-Text $request.bindingSha256 '^[a-f0-9]{64}$'
    if ($script:usedCaptureBindings.ContainsKey($binding)) {throw 'authority-capture-binding-replayed'}
    $script:usedCaptureBindings[$binding]=$true
    $job=$script:currentJob
    if ($null -eq $job) {throw 'authority-no-supervised-launch'}
    $runtimePid=$null
    if ($null -ne $request.runtimePid) {$runtimePid=Require-Pid $request.runtimePid}
    $socketOwner=Socket-Owner $request.socket
    if ($null -eq $runtimePid -and $null -eq $socketOwner) {throw 'authority-no-authenticated-process-binding'}
    $before=@($job.Pids())
    if ($before.Count -eq 0 -or ($null -ne $runtimePid -and $runtimePid -notin $before) -or ($null -ne $socketOwner -and $socketOwner -notin $before)) {throw 'authority-authenticated-process-outside-job'}
    $handles=@()
    try {
      $records=@(foreach ($pidValue in $before) {
        $process=[Diagnostics.Process]::GetProcessById($pidValue)
        $handles+=,$process
        $role='easyeda-descendant'
        if ($pidValue -eq $job.Root.Id) {$role='easyeda-main'}
        if ($pidValue -eq $runtimePid) {$role='renderer'}
        elseif ($pidValue -eq $socketOwner) {$role='native-socket-owner'}
        Process-Record $process $role $job
      })
      if (($before -join ',') -cne (@($job.Pids()) -join ',') -or $job.Root.HasExited) {throw 'authority-tree-changed-during-capture'}
      if ($null -ne $request.socket -and (Socket-Owner $request.socket) -ne $socketOwner) {throw 'authority-socket-changed-during-capture'}
      foreach ($process in $handles) {if ($process.HasExited -or -not $job.Contains($process)) {throw 'authority-process-exited-during-capture'}}
      $receipt=@{jobId=$job.Id;helperInstance=$script:helperInstance;bindingSha256=$binding;capturedAt=[DateTime]::UtcNow.ToString('o');processes=$records;runtimePid=$runtimePid;socketOwnerPid=$socketOwner}
      $script:captures[$binding]=@{receipt=$receipt;handles=$handles;job=$job}
      $handles=@()
      return $receipt
    } finally {foreach ($handle in $handles) {$handle.Dispose()}}
  }
  if ($request.action -eq 'prove-terminated') {
    $binding=Require-Text $request.captureBindingSha256 '^[a-f0-9]{64}$'
    $capture=$script:captures[$binding]
    if ($null -eq $capture -or $capture.receipt.helperInstance -cne $request.helperInstance -or $capture.receipt.jobId -cne $request.jobId) {throw 'authority-capture-not-owned'}
    # An empty non-breakaway Job covers descendants born after capture too.
    # Checking only the recorded PID list would miss those descendants.
    if (@($capture.job.Pids()).Count -ne 0) {throw 'authority-prior-job-not-empty'}
    foreach ($process in $capture.handles) {if (-not $process.HasExited) {throw 'authority-retained-process-still-live'}}
    if (@($capture.job.Pids()).Count -ne 0) {throw 'authority-prior-job-not-empty'}
    return @{jobId=$capture.receipt.jobId;helperInstance=$script:helperInstance;captureBindingSha256=$binding;jobEmpty=$true;retainedProcessesExited=$true;checkedAt=[DateTime]::UtcNow.ToString('o')}
  }
  if ($request.action -eq 'release-capture') {
    $binding=Require-Text $request.captureBindingSha256 '^[a-f0-9]{64}$'
    $capture=$script:captures[$binding]
    if ($null -eq $capture -or $capture.receipt.helperInstance -cne $request.helperInstance -or $capture.receipt.jobId -cne $request.jobId) {throw 'authority-capture-not-owned'}
    # Only process-proof handles are released. The Job, root handle and live
    # Application remain intact; a used binding is never admitted again.
    $script:captures.Remove($binding)
    foreach ($handle in $capture.handles) {$handle.Dispose()}
    return @{released=$true;jobId=$capture.receipt.jobId;helperInstance=$script:helperInstance;captureBindingSha256=$binding}
  }
  if ($request.action -eq 'normal-close') {
    if ($request.confirmNormalClose -ne $true -or $null -eq $script:currentJob -or $script:currentJob.Id -cne $request.jobId) {throw 'authority-close-not-authorized'}
    $ticks=Require-Text $request.rootStartTicks '^[0-9]{15,20}$'
    if ($null -eq $request.windowHandle -or $request.windowHandle -isnot [string] -or $request.windowHandle -cnotmatch '^[1-9][0-9]{0,18}$') {throw 'authority-invalid-window'}
    $script:currentJob.NormalClose([long]$request.windowHandle,$ticks)
    return @{closeDispatched=$true;jobId=$script:currentJob.Id;saveOrDiscardSelected=$false}
  }
  throw 'authority-unknown-action'
}
try {
  while ($null -ne ($line=[Console]::ReadLine())) {
    $id=$null
    try {
      if ($line.Length -gt 16384) {throw 'authority-request-too-large'}
      $request=$line | ConvertFrom-Json
      $id=Require-Text $request.id '^[a-f0-9]{32}$'
      $result=Handle-ClockedRequest $request
      @{id=$id;ok=$true;result=$result} | ConvertTo-Json -Depth 10 -Compress
    } catch {
      # Raw Windows exceptions can contain local/private data. Keep categorical
      # diagnostics and never print command lines, credentials or project paths.
      $code='authority-native-call-failed'
      if ($_.Exception.Message -cmatch '^authority-[a-z-]{1,80}$') {$code=$_.Exception.Message}
      @{id=$id;ok=$false;error=$code} | ConvertTo-Json -Compress
    }
  }
} finally {
  foreach ($binding in @($probes.Keys)) {Dispose-Probe $binding}
  foreach ($capture in $captures.Values) {foreach ($handle in $capture.handles) {$handle.Dispose()}}
  foreach ($job in $jobs.Values) {$job.Dispose()}
}
