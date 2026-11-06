param([string]$Nonce, [string]$ProjectBasename, [string]$LibraryDirectoriesBase64, [switch]$CompileOnly, [switch]$ParseLibraryDirectoriesOnly)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
# The supported host is Windows PowerShell5.1. Its ConvertFrom-Json sends
# a JSON array as ONE pipeline object. Capture it directly, never inside @(...),
# then validate the actual array and every string before native allocation.
function Read-ManagedFixtureLibraryDirectories([string]$Encoded) {
  if ($Encoded.Length -lt 1 -or $Encoded.Length -gt 8192) { throw 'fixture-library-directory-input-bound' }
  $json = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($Encoded))
  $parsed = ConvertFrom-Json -InputObject $json
  if ($parsed -isnot [object[]]) { throw 'fixture-library-directory-array-type' }
  if ($parsed.Count -lt 1 -or $parsed.Count -gt 4) { throw 'fixture-library-directory-count' }
  $seen = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
  foreach ($entry in $parsed) {
    if ($entry -isnot [string]) { throw 'fixture-library-directory-type' }
    if ($entry.Length -lt 4 -or $entry.Length -gt 1024 -or $entry -cnotmatch '^[A-Z]:\\(?:[A-Za-z0-9_ -]+\\)*[A-Za-z0-9_-]+$') { throw 'fixture-library-directory-path' }
    foreach ($part in $entry.Substring(3).Split('\')) {
      if ($part.Trim() -cne $part -or $part -match '^(con|prn|aux|nul|com[0-9]|lpt[0-9])$') { throw 'fixture-library-directory-component' }
    }
    if (-not $seen.Add($entry)) { throw 'fixture-library-directory-duplicate' }
  }
  # Convert only AFTER every input element has passed scalar/path validation.
  # The fresh CLR string[] drops WinPS5.1 ConvertFrom-Json PSObject wrappers.
  return ,([string[]]$parsed)
}
if ($ParseLibraryDirectoriesOnly) {
  $parsedDirectories = Read-ManagedFixtureLibraryDirectories $LibraryDirectoriesBase64
  @{schema='easyeda-pro-control.fixture-library-parser-only.v1'; directories=$parsedDirectories; count=$parsedDirectories.Count; nativeAllocated=$false; csharpCompiled=$false} | ConvertTo-Json -Compress -Depth 3
  return
}
# A fresh private directory only. No existing destination, deletion, SQLite
# write, app launch, PID adoption, or arbitrary command is supported.
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
public sealed class ManagedFixtureClosedFileMetadata {
  public string windowsPath, fileIdentity, sha256, createdFileTime, modifiedFileTime, watchState;
  public long bytes, createdEpochMs, modifiedEpochMs;
  public bool readOnlyFileLease;
}
public sealed class ManagedFixtureDestination : IDisposable {
  [StructLayout(LayoutKind.Sequential)] struct ATTRIBUTES { public int size; public IntPtr descriptor; public int inherit; }
  [StructLayout(LayoutKind.Sequential)] struct INFO {
    public uint attributes; public System.Runtime.InteropServices.ComTypes.FILETIME created, accessed, written;
    public uint volume, sizeHigh, sizeLow, links, indexHigh, indexLow;
  }
  [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)] static extern bool CreateDirectoryW(string name, ref ATTRIBUTES attributes);
  [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)] static extern SafeFileHandle CreateFileW(string name, uint access, uint share, IntPtr security, uint disposition, uint flags, IntPtr template);
  [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)] static extern uint GetFinalPathNameByHandleW(SafeFileHandle file, StringBuilder name, uint maximum, uint flags);
  [DllImport("kernel32.dll", SetLastError=true)] static extern bool GetFileInformationByHandle(SafeFileHandle file, out INFO info);
  SafeFileHandle parent, directory, metadataFile;
  ManagedFixtureLibraryGuard metadataWatch;
  INFO metadataInfo;
  string metadataPath, metadataSha;
  bool metadataAttempted, metadataFinished;
  readonly string original, parentOriginal, sid, securitySddl;
  readonly INFO originalInfo;
  public readonly string Id = Guid.NewGuid().ToString("N");
  public string Path { get { Check(); return original; } }
  public string Identity { get { Check(); return originalInfo.volume.ToString("x8") + ":" + originalInfo.indexHigh.ToString("x8") + originalInfo.indexLow.ToString("x8"); } }
  static SafeFileHandle OpenDirectory(string path) {
    // Read/write sharing permits SQLite to create its own files, while absence
    // of FILE_SHARE_DELETE keeps this original directory from being replaced.
    SafeFileHandle handle = CreateFileW(path, 0x80, 3, IntPtr.Zero, 3, 0x02200000, IntPtr.Zero);
    if (handle.IsInvalid) { handle.Dispose(); throw new Win32Exception(Marshal.GetLastWin32Error()); }
    INFO info;
    if (!GetFileInformationByHandle(handle, out info) || (info.attributes & 0x10) == 0 || (info.attributes & 0x400) != 0) {
      handle.Dispose(); throw new InvalidOperationException("fixture-directory-reparse-or-nondirectory");
    }
    return handle;
  }
  static string Canonical(SafeFileHandle handle) {
    StringBuilder value = new StringBuilder(2048);
    uint length = GetFinalPathNameByHandleW(handle, value, (uint)value.Capacity, 0);
    if (length == 0 || length >= value.Capacity) throw new Win32Exception(Marshal.GetLastWin32Error());
    string path = value.ToString();
    if (!path.StartsWith(@"\\?\") || path.StartsWith(@"\\?\UNC\")) throw new InvalidOperationException("fixture-directory-nondrive");
    path = path.Substring(4).TrimEnd('\\');
    if (!System.Text.RegularExpressions.Regex.IsMatch(path, @"^[A-Z]:\\(?:[A-Za-z0-9_ -]+\\)*[A-Za-z0-9_ -]+$")) throw new InvalidOperationException("fixture-directory-path-grammar");
    return path;
  }
  static string Sddl(string path) { return new DirectoryInfo(path).GetAccessControl(AccessControlSections.Access | AccessControlSections.Owner).GetSecurityDescriptorSddlForm(AccessControlSections.Access | AccessControlSections.Owner); }
  public ManagedFixtureDestination() {
    try {
      parent = OpenDirectory(System.IO.Path.GetTempPath().TrimEnd('\\'));
      parentOriginal = Canonical(parent);
      sid = WindowsIdentity.GetCurrent().User.Value;
      DirectorySecurity security = new DirectorySecurity();
      security.SetSecurityDescriptorSddlForm("O:" + sid + "D:P(A;OICI;FA;;;" + sid + ")(A;OICI;FA;;;SY)");
      byte[] descriptor = security.GetSecurityDescriptorBinaryForm();
      IntPtr data = Marshal.AllocHGlobal(descriptor.Length);
      string child = System.IO.Path.Combine(parentOriginal, "CodexEasyedaFixture_" + Id);
      try {
        Marshal.Copy(descriptor, 0, data, descriptor.Length);
        ATTRIBUTES attributes = new ATTRIBUTES(); attributes.size = Marshal.SizeOf(typeof(ATTRIBUTES)); attributes.descriptor = data;
        // Exactly one atomic create. An existing random child is a hard stop.
        if (!CreateDirectoryW(child, ref attributes)) throw new Win32Exception(Marshal.GetLastWin32Error());
      } finally { Marshal.FreeHGlobal(data); }
      directory = OpenDirectory(child); original = Canonical(directory);
      if (original != child || Canonical(parent) != parentOriginal || !GetFileInformationByHandle(directory, out originalInfo)) throw new InvalidOperationException("fixture-directory-generation-drift");
      securitySddl = Sddl(original);
      DirectorySecurity actual = new DirectoryInfo(original).GetAccessControl();
      if (!actual.AreAccessRulesProtected || actual.GetOwner(typeof(SecurityIdentifier)).Value != sid || securitySddl != security.GetSecurityDescriptorSddlForm(AccessControlSections.Access | AccessControlSections.Owner)) throw new InvalidOperationException("fixture-directory-security-drift");
      if (Entries().Length != 0) throw new InvalidOperationException("fixture-directory-not-empty");
    } catch { Dispose(); throw; }
  }
  public void Check() {
    INFO current;
    if (directory == null || directory.IsClosed || parent == null || parent.IsClosed || Canonical(directory) != original || Canonical(parent) != parentOriginal || !GetFileInformationByHandle(directory, out current) || current.volume != originalInfo.volume || current.indexHigh != originalInfo.indexHigh || current.indexLow != originalInfo.indexLow || (current.attributes & 0x400) != 0 || Sddl(original) != securitySddl) throw new InvalidOperationException("fixture-directory-original-owner-lost");
  }
  public string[] Entries() {
    Check(); string[] paths = Directory.GetFileSystemEntries(original);
    if (paths.Length > 8) throw new InvalidOperationException("fixture-directory-roster-overflow");
    string[] result = new string[paths.Length];
    for (int i=0; i<paths.Length; i++) {
      FileAttributes attributes = File.GetAttributes(paths[i]);
      if ((attributes & (FileAttributes.ReparsePoint | FileAttributes.Directory)) != 0) throw new InvalidOperationException("fixture-directory-unexpected-child");
      result[i] = System.IO.Path.GetFileName(paths[i]);
    }
    Array.Sort(result, StringComparer.Ordinal); Check(); return result;
  }
  static string FileIdentity(INFO info) { return info.volume.ToString("x8") + ":" + info.indexHigh.ToString("x8") + info.indexLow.ToString("x8"); }
  static long Size(INFO info) { return checked(((long)info.sizeHigh << 32) | info.sizeLow); }
  static long FileTime(System.Runtime.InteropServices.ComTypes.FILETIME value) { return ((long)(uint)value.dwHighDateTime << 32) | (uint)value.dwLowDateTime; }
  static long Epoch(System.Runtime.InteropServices.ComTypes.FILETIME value) { return checked((DateTime.FromFileTimeUtc(FileTime(value)).Ticks - 621355968000000000L) / 10000L); }
  static bool SameFile(INFO left, INFO right) {
    return left.attributes == right.attributes && left.volume == right.volume && left.indexHigh == right.indexHigh && left.indexLow == right.indexLow && left.links == right.links &&
      Size(left) == Size(right) && FileTime(left.created) == FileTime(right.created) && FileTime(left.written) == FileTime(right.written);
  }
  string CanonicalFile() {
    StringBuilder value = new StringBuilder(2048); uint count = GetFinalPathNameByHandleW(metadataFile, value, 2048, 0);
    if (count == 0 || count >= 2048 || !value.ToString().StartsWith(@"\\?\") || value.ToString().StartsWith(@"\\?\UNC\")) throw new InvalidOperationException("fixture-closed-file-canonical");
    return value.ToString().Substring(4);
  }
  INFO FileInformation() {
    INFO info; if (metadataFile == null || metadataFile.IsClosed || !GetFileInformationByHandle(metadataFile, out info)) throw new InvalidOperationException("fixture-closed-file-original-handle"); return info;
  }
  string HashFile() {
    bool retained = false; metadataFile.DangerousAddRef(ref retained);
    try { using (SafeFileHandle borrowed = new SafeFileHandle(metadataFile.DangerousGetHandle(), false))
      using (FileStream input = new FileStream(borrowed, FileAccess.Read, 1048576, false)) using (SHA256 hash = SHA256.Create()) {
        input.Position = 0; if (input.Length != Size(metadataInfo)) throw new InvalidOperationException("fixture-closed-file-size");
        return BitConverter.ToString(hash.ComputeHash(input)).Replace("-", "").ToLowerInvariant();
      }
    } finally { if (retained) metadataFile.DangerousRelease(); }
  }
  public ManagedFixtureClosedFileMetadata CaptureClosedFile(string basename) {
    if (metadataAttempted) throw new InvalidOperationException("fixture-closed-file-capture-consumed"); metadataAttempted = true; Check();
    if (basename == null || !System.Text.RegularExpressions.Regex.IsMatch(basename, @"\ACodex_(?:via_only|line_and_via|arc_line_and_via|schematic|schematic_relevance|circular_smt_pad)_[a-f0-9]{16}\.eprj2\z")) throw new InvalidOperationException("fixture-closed-file-basename");
    string[] entries = Entries(); if (entries.Length != 1 || entries[0] != basename) throw new InvalidOperationException("fixture-closed-file-complete-roster");
    metadataWatch = new ManagedFixtureLibraryGuard(original); metadataPath = System.IO.Path.Combine(original, basename);
    // READ sharing only denies existing/future writers and delete/rename. This
    // original handle is acquired once after the app root and Job have exited.
    metadataFile = CreateFileW(metadataPath, 0x80000000, 1, IntPtr.Zero, 3, 0x08200000, IntPtr.Zero);
    if (metadataFile.IsInvalid) throw new Win32Exception(Marshal.GetLastWin32Error()); metadataInfo = FileInformation();
    if ((metadataInfo.attributes & (0x10 | 0x400)) != 0 || metadataInfo.links != 1 || Size(metadataInfo) < 512 || Size(metadataInfo) > 67108864 ||
      Epoch(metadataInfo.created) < 1 || Epoch(metadataInfo.written) < 1 || CanonicalFile() != metadataPath) throw new InvalidOperationException("fixture-closed-file-identity");
    metadataSha = HashFile(); return CheckClosedFile();
  }
  public ManagedFixtureClosedFileMetadata CheckClosedFile() {
    Check(); if (!metadataAttempted || metadataFinished || metadataFile == null || CanonicalFile() != metadataPath || !SameFile(metadataInfo, FileInformation())) throw new InvalidOperationException("fixture-closed-file-owner-drift");
    ManagedFixtureLibraryObservation watched = metadataWatch.Check(); string[] entries = Entries();
    if (entries.Length != 1 || entries[0] != System.IO.Path.GetFileName(metadataPath) || watched.names.Length != 1 || watched.names[0] != entries[0]) throw new InvalidOperationException("fixture-closed-file-roster-drift");
    string hash = HashFile(); if (hash != metadataSha || !SameFile(metadataInfo, FileInformation())) throw new InvalidOperationException("fixture-closed-file-content-drift"); metadataWatch.Check();
    return new ManagedFixtureClosedFileMetadata { windowsPath = metadataPath, fileIdentity = FileIdentity(metadataInfo), bytes = Size(metadataInfo), sha256 = hash,
      createdFileTime = FileTime(metadataInfo.created).ToString(System.Globalization.CultureInfo.InvariantCulture), modifiedFileTime = FileTime(metadataInfo.written).ToString(System.Globalization.CultureInfo.InvariantCulture),
      createdEpochMs = Epoch(metadataInfo.created), modifiedEpochMs = Epoch(metadataInfo.written), watchState = "pending", readOnlyFileLease = true };
  }
  public void FinishClosedFile() {
    if (metadataFile == null) return; CheckClosedFile(); metadataWatch.Finish();
    if (!SameFile(metadataInfo, FileInformation()) || HashFile() != metadataSha || CanonicalFile() != metadataPath) throw new InvalidOperationException("fixture-closed-file-final-drift"); metadataFinished = true;
  }
  public void Dispose() { if (metadataWatch != null) metadataWatch.Dispose(); if (metadataFile != null) metadataFile.Dispose(); if (directory != null) directory.Dispose(); if (parent != null) parent.Dispose(); }
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
if ($Nonce -cnotmatch '^[a-f0-9]{64}$' -or $ProjectBasename -cnotmatch '^Codex_(via_only|line_and_via|arc_line_and_via|schematic|schematic_relevance|circular_smt_pad)_[a-f0-9]{16}\.eprj2$' -or $LibraryDirectoriesBase64.Length -gt 8192) { throw 'fixture-destination-input' }
$owner = $null
$guards = @()
try {
  $directories = Read-ManagedFixtureLibraryDirectories $LibraryDirectoriesBase64
  foreach ($directory in $directories) { $guards += New-Object ManagedFixtureLibraryGuard($directory) }
  $owner = New-Object ManagedFixtureDestination
  @{schema='easyeda-pro-control.fixture-destination-owner.v1'; nonce=$Nonce; ownerId=$owner.Id; windowsDirectory=$owner.Path; directoryIdentity=$owner.Identity; expectedBasename=$ProjectBasename; entries=@($owner.Entries()); libraries=@($guards | ForEach-Object { $_.Check() }); state='held'; deletionAuthorized=$false} | ConvertTo-Json -Compress -Depth 5 | ForEach-Object { [Console]::WriteLine($_) }
  $last = 0
  while ($null -ne ($line = [Console]::ReadLine())) {
    if ($line.Length -gt 256) { throw 'fixture-destination-request-budget' }
    $request = $line | ConvertFrom-Json
    if (@($request.PSObject.Properties.Name).Count -ne 3 -or $request.nonce -cne $Nonce -or $request.id -isnot [int] -or $request.id -ne ($last + 1) -or $request.id -gt 16 -or @('inspect','release','capture-closed-file','inspect-closed-file') -cnotcontains $request.action) { throw 'fixture-destination-request' }
    $last = $request.id
    $path = $owner.Path; $identity = $owner.Identity; $entries = @($owner.Entries())
    $libraries = @($guards | ForEach-Object { $_.Check() })
    $state = 'held'
    if ($request.action -ceq 'capture-closed-file' -or $request.action -ceq 'inspect-closed-file') {
      $file = if ($request.action -ceq 'capture-closed-file') { $owner.CaptureClosedFile($ProjectBasename) } else { $owner.CheckClosedFile() }
      $destination = @{schema='easyeda-pro-control.fixture-destination-owner.v1'; nonce=$Nonce; ownerId=$owner.Id; windowsDirectory=$path; directoryIdentity=$identity; expectedBasename=$ProjectBasename; entries=$entries; libraries=$libraries; state='held'; deletionAuthorized=$false; requestId=$last}
      @{schema='easyeda-pro-control.fixture-closed-file-metadata.v1'; destination=$destination; file=$file} | ConvertTo-Json -Compress -Depth 8 | ForEach-Object { [Console]::WriteLine($_) }
      continue
    }
    if ($request.action -ceq 'release') { $owner.FinishClosedFile(); $libraries = @($guards | ForEach-Object { $_.Finish() }); $owner.Dispose(); $state = 'released' }
    @{schema='easyeda-pro-control.fixture-destination-owner.v1'; nonce=$Nonce; ownerId=$owner.Id; windowsDirectory=$path; directoryIdentity=$identity; expectedBasename=$ProjectBasename; entries=$entries; libraries=$libraries; state=$state; deletionAuthorized=$false; requestId=$last} | ConvertTo-Json -Compress -Depth 5 | ForEach-Object { [Console]::WriteLine($_) }
    if ($state -ceq 'released') { break }
  }
} finally { if ($null -ne $owner) { $owner.Dispose() }; foreach ($guard in $guards) { $guard.Dispose() } }
