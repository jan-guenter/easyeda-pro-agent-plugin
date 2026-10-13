// PRIVATE fixed native backend. Separate compile selection; original refusal unchanged.
using System;

namespace Easyeda.PrivatePreparation
{
    internal sealed class AncestryCalls
    {
        private sealed class Root
        {
            internal IntPtr Handle;
            internal string Drive, Target, GuidPath, NtPath;
            internal AncestryNativeFacts Facts;
        }
        private readonly Root[] roots = { new Root(), new Root() };
        private readonly AncestryDirectoryOpenFrame[] frames = new AncestryDirectoryOpenFrame[67];
        private readonly IntPtr[] handles = new IntPtr[70];
        private readonly int[] branches = new int[70];
        private readonly bool[] closeAttempted = new bool[70], handleClosed = new bool[70];
        private readonly byte[] zero = new byte[AncestryNativeData.ArenaBytes];
        private readonly Exception[] cleanupErrors = new Exception[69];
        private IntPtr arena;
        private bool admitted, storageStarted, arenaOwned, unresolved, closed, localRead, programRead, duplicate;
        private bool securityCloseReturned;
        private int usedRoots, usedFrames, usedHandles, cleanupCount;
        private FixedOwnerSecurity security;
        private OwnerSecurityOutcome securityOutcome;
        private byte[] expectedOwner;
        private Exception firstError;
        internal bool StorageReleased { get; private set; }
        internal bool Unresolved { get { return unresolved; } }
        internal Exception OriginalFailure { get { return firstError; } }
        internal int CleanupErrors { get { return cleanupCount; } }
        internal bool Win32ErrorObserved { get; private set; }
        internal int Win32Error { get; private set; }
        internal bool RootRawObserved { get; private set; }
        internal IntPtr RootRaw { get; private set; }
        internal bool DuplicateReturned { get; private set; }
        internal bool DuplicateSucceeded { get; private set; }
        internal bool DuplicateRawObserved { get; private set; }
        internal IntPtr DuplicateRaw { get; private set; }
        internal AncestryCalls()
        { for (int i = 0; i < frames.Length; i++) frames[i] = new AncestryDirectoryOpenFrame();
          StorageReleased = true; }
        private void Remember(Exception error) { if (firstError == null) firstError = error; }
        private void CleanupError(Exception error)
        { if (cleanupCount < cleanupErrors.Length) cleanupErrors[cleanupCount++] = error;
          else unresolved = true; Remember(error); }
        internal Exception RetainedCleanupError(int index)
        { AncestryData.Need(index >= 0 && index < cleanupCount, "ancestry-backend-cleanup-index"); return cleanupErrors[index]; }
        internal void AdmitFixedHost()
        { AncestryData.Need(!admitted, "ancestry-native-admission-consumed");
          AncestryNative.RequireHost(); admitted = true; }
        private void Ready()
        { AncestryData.Need(admitted && arenaOwned && !closed && !unresolved, "ancestry-backend-state"); }
        private IntPtr At(int offset) { return IntPtr.Add(arena, offset); }
        private void Clear() { AncestryNative.Write(arena, zero); }
        private byte[] Read(int offset, int bytes)
        { AncestryData.Need(offset >= 0 && bytes > 0 && offset <= zero.Length - bytes, "ancestry-arena-bound");
          return AncestryNative.Read(At(offset), bytes); }
        private void Failed(string code)
        {
            int error = AncestryNative.LastError();
            Win32Error = error; Win32ErrorObserved = true;
            if (error == 997) unresolved = true;
            throw new AncestryRefusal(code);
        }
        internal void PrepareStorage()
        {
            AncestryData.Need(admitted && !storageStarted && !closed, "ancestry-storage-consumed");
            storageStarted = true; StorageReleased = false;
            try { AncestryNative.Allocate(zero.Length, out arena); }
            catch (Exception error) { unresolved = true; Remember(error); throw; }
            arenaOwned = true;
            if (!AncestryData.Handle(arena) || arena.ToInt64() % 8 != 0)
            { unresolved = true; throw new AncestryRefusal("ancestry-arena-pointer"); }
        }
        private byte[] CurrentOwner()
        {
            Ready();
            AncestryData.Need(security == null || securityCloseReturned && securityOutcome != null &&
                securityOutcome.AllOwnedResourcesReleased, "ancestry-security-retained");
            // The constructor is acquisition-free. Keep its original instance before Prepare.
            security = new FixedOwnerSecurity(); securityOutcome = null; securityCloseReturned = false;
            byte[] descriptor = null; Exception first = null;
            try { security.Prepare(); descriptor = security.TakePreparedDescriptorForFrame(); }
            catch (Exception error) { first = error; Remember(error); }
            finally
            {
                try { securityOutcome = security.CloseOwnedResources(); securityCloseReturned = true; }
                catch (Exception error) { CleanupError(error); if (first == null) first = error; }
                if (!securityCloseReturned || securityOutcome == null || !securityOutcome.AllOwnedResourcesReleased)
                { unresolved = true; if (first == null) first = new AncestryRefusal("ancestry-security-cleanup"); }
            }
            if (first != null) { Remember(first); throw first; }
            byte[] owner = OwnerSecurityData.ReadSid(descriptor, checked((int)AncestryNativeData.U32(descriptor, 4)));
            AncestryData.OwnerSid(owner); return owner;
        }
        internal byte[] BindProcessOwner()
        { AncestryData.Need(expectedOwner == null, "ancestry-owner-consumed");
          byte[] value = CurrentOwner(); expectedOwner = (byte[])value.Clone(); return value; }
        internal void RecheckProcessOwner(byte[] owner)
        {
            AncestryData.Need(expectedOwner != null && AncestryData.Equal(owner, expectedOwner), "ancestry-owner-binding");
            byte[] current = CurrentOwner(); AncestryData.Need(AncestryData.Equal(current, expectedOwner), "ancestry-owner-drift");
        }
        internal string DiscoverLocalApplicationData()
        { Ready(); AncestryData.Need(expectedOwner != null && !localRead, "ancestry-discovery-consumed");
          localRead = true; return AncestryNative.LocalApplicationData(); }
        internal string DiscoverProgramFiles()
        { Ready(); AncestryData.Need(expectedOwner != null && !programRead, "ancestry-discovery-consumed");
          programRead = true; return AncestryNative.ProgramFiles(); }
        private int Index(IntPtr handle)
        {
            for (int i = 0; i < usedHandles; i++) if (handles[i] == handle && !handleClosed[i] && !closeAttempted[i]) return i;
            throw new AncestryRefusal("ancestry-unowned-query");
        }
        private void Register(AncestryAcquisition record, int branch)
        {
            if (!record.Confirmed || !AncestryData.Handle(record.Handle))
            { unresolved = true; throw new AncestryRefusal("ancestry-backend-output"); }
            for (int i = 0; i < usedHandles; i++) if (!handleClosed[i] && handles[i] == record.Handle)
            { unresolved = true; throw new AncestryRefusal("ancestry-backend-alias"); }
            AncestryData.Need(usedHandles < handles.Length, "ancestry-backend-handle-cap");
            handles[usedHandles] = record.Handle; branches[usedHandles] = branch; usedHandles++;
        }
        private IntPtr Input(string value)
        {
            byte[] bytes = AncestryNativeData.Wide(value);
            AncestryData.Need(bytes.Length <= AncestryNativeData.InputChars * 2, "ancestry-query-input-bound");
            AncestryNative.Write(At(AncestryNativeData.InputOffset), bytes);
            return At(AncestryNativeData.InputOffset);
        }
        private uint DriveType(string drive)
        { IntPtr input = Input(drive);
          try { return AncestryNative.DriveType(input); } catch { unresolved = true; throw; } }
        private string DosTarget(string name)
        {
            Clear(); uint count; IntPtr input = Input(name);
            try { count = AncestryNative.DosTarget(input, At(AncestryNativeData.DosOffset)); }
            catch { unresolved = true; throw; }
            if (count == 0) Failed("ancestry-dos-query");
            AncestryData.Need(count <= AncestryNativeData.DosChars, "ancestry-dos-bound");
            return AncestryNativeData.CurrentDosTarget(Read(AncestryNativeData.DosOffset, checked((int)count * 2)), (int)count);
        }
        private string FinalPath(IntPtr handle, uint flags)
        {
            Clear(); uint length;
            try { length = AncestryNative.FinalPath(handle, At(AncestryNativeData.PathOffset), flags); }
            catch { unresolved = true; throw; }
            if (length == 0) Failed("ancestry-final-path-query");
            AncestryData.Need(length < AncestryNativeData.PathChars, "ancestry-final-path-bound");
            return AncestryNativeData.WideResult(Read(AncestryNativeData.PathOffset, checked(((int)length + 1) * 2)), (int)length);
        }
        private byte[] Information(IntPtr handle, int kind, int bytes)
        {
            Clear(); bool ok;
            try { ok = AncestryNative.Information(handle, kind, arena, (uint)bytes); }
            catch { unresolved = true; throw; }
            if (!ok) Failed("ancestry-information-query"); return Read(0, bytes);
        }
        private AncestryNativeFacts Facts(IntPtr handle)
        {
            Clear(); bool ok;
            try { ok = AncestryNative.Basic(handle, arena); } catch { unresolved = true; throw; }
            if (!ok) Failed("ancestry-basic-query");
            byte[] basic = Read(0, 52), tag = Information(handle, 9, 8), standard = Information(handle, 1, 24);
            return AncestryNativeData.Facts(basic, tag, standard);
        }
        private void Ntfs(IntPtr handle, uint serial)
        {
            Clear(); bool ok; int at = AncestryNativeData.CountsOffset;
            try { ok = AncestryNative.Volume(handle, arena, At(at), At(at + 4), At(at + 8)); }
            catch { unresolved = true; throw; }
            if (!ok) Failed("ancestry-volume-query");
            byte[] count = Read(at, 12);
            AncestryData.Need(AncestryNativeData.WideResult(Read(0, 10), 4) == "NTFS" &&
                AncestryNativeData.U32(count, 0) == serial && (AncestryNativeData.U32(count, 8) & 0x88) == 0x88,
                "ancestry-volume-profile");
        }
        private void Mapping(Root root, bool initial)
        {
            AncestryData.Need(DriveType(root.Drive) == 3, "ancestry-drive-type");
            string driveBefore = DosTarget(root.Drive.Substring(0, 2));
            AncestryNativeData.DirectTarget(driveBefore);
            AncestryNativeFacts before = Facts(root.Handle);
            Ntfs(root.Handle, before.Volume);
            string guid = FinalPath(root.Handle, 1), nt = FinalPath(root.Handle, 2);
            string volumeName = AncestryNativeData.VolumeDosName(guid), volumeBefore = DosTarget(volumeName);
            AncestryNativeData.Mapping(driveBefore, volumeBefore, nt);
            AncestryNativeFacts after = Facts(root.Handle); AncestryNativeData.Same(before, after);
            string driveAfter = DosTarget(root.Drive.Substring(0, 2)), volumeAfter = DosTarget(volumeName);
            AncestryData.Need(DriveType(root.Drive) == 3 && driveBefore == driveAfter && volumeBefore == volumeAfter,
                "ancestry-mapping-drift");
            if (initial)
            {
                AncestryData.Need(root.Target == driveBefore, "ancestry-mapping-open-drift");
                root.GuidPath = guid; root.NtPath = nt; root.Facts = before;
            }
            else
            { AncestryData.Need(root.Target == driveBefore && root.GuidPath == guid && root.NtPath == nt,
                "ancestry-root-name-drift"); AncestryNativeData.Same(root.Facts, before); }
        }
        // Called only after the original owner's complete ancestry reproof.
        // This returns the retained drive binding, not a new discovery path.
        internal string CopyScratchDrive(string originalGuidRoot)
        {
            Ready();
            AncestryData.Need(usedRoots == 2 && roots[0].GuidPath == originalGuidRoot,
                "ancestry-launch-drive-binding");
            AncestryNativeData.Drive(roots[0].Drive);
            return roots[0].Drive;
        }
        internal void OpenRoot(AncestryAcquisition record, string drive)
        {
            try
            {
                Ready(); AncestryNativeData.Drive(drive);
                AncestryData.Need(usedRoots < 2, "ancestry-root-cap"); Root root = roots[usedRoots];
                root.Drive = drive; AncestryData.Need(DriveType(drive) == 3, "ancestry-drive-type");
                root.Target = DosTarget(drive.Substring(0, 2)); AncestryNativeData.DirectTarget(root.Target);
                byte[] name = AncestryNativeData.Wide(@"\\?\" + drive);
                AncestryNative.Write(At(AncestryNativeData.PathOffset), name);
                try { record.Handle = AncestryNative.OpenRoot(At(AncestryNativeData.PathOffset)); }
                catch { unresolved = true; throw; }
                // Publish all native return facts before LastError, registration or queries.
                record.Completed = true; RootRaw = record.Handle; RootRawObserved = true;
                if (record.Handle == new IntPtr(-1))
                { record.Handle = IntPtr.Zero; Failed("ancestry-root-open"); }
                record.Confirmed = true;
                Register(record, usedRoots); root.Handle = record.Handle; usedRoots++;
                Mapping(root, true);
            }
            catch (Exception error) { Remember(error); if (!unresolved) record.Completed = true; throw; }
            finally { record.Unresolved |= unresolved; }
        }
        internal void OpenComponent(AncestryAcquisition record, IntPtr parent, string name)
        {
            AncestryDirectoryOpenFrame frame = null; Exception first = null;
            try
            {
                Ready(); int branch = branches[Index(parent)];
                AncestryData.Need(usedFrames < frames.Length, "ancestry-frame-cap");
                frame = frames[usedFrames++]; frame.Attempt(record, parent, name, arena);
                Register(record, branch);
            }
            catch (Exception error) { first = error; Remember(error); }
            finally
            {
                if (frame != null)
                {
                    if (frame.Unresolved) unresolved = true;
                    try { frame.CloseStorage(); }
                        catch (Exception error) { CleanupError(error); unresolved = true; if (first == null) first = error; }
                }
                if (!unresolved && first != null) record.Completed = true;
                record.Unresolved |= unresolved;
            }
            if (first != null) throw first;
        }
        internal void DuplicateScratch(AncestryAcquisition record, IntPtr source)
        {
            try
            {
                Ready(); int branch = branches[Index(source)];
                AncestryData.Need(!duplicate && branch == 0, "ancestry-duplicate-consumed"); duplicate = true;
                // Retain the output address in the original arena across an opaque call.
                Clear(); IntPtr output = At(AncestryNativeData.DuplicateOffset);
                bool ok;
                try { ok = AncestryNative.Duplicate(source, output); }
                catch { unresolved = true; throw; }
                DuplicateReturned = true; DuplicateSucceeded = ok; record.Completed = true;
                try { record.Handle = AncestryNative.Pointer(output); }
                catch { unresolved = true; throw; }
                DuplicateRaw = record.Handle; DuplicateRawObserved = true;
                if (!ok)
                { if (record.Handle != IntPtr.Zero) unresolved = true; Failed("ancestry-duplicate"); }
                record.Confirmed = true;
                Register(record, branch);
            }
            catch (Exception error) { Remember(error); if (!unresolved) record.Completed = true; throw; }
            finally { record.Unresolved |= unresolved; }
        }
        internal AncestryObservation Observe(AncestryQuery record, IntPtr handle)
        {
            try
            {
                Ready(); int branch = branches[Index(handle)];
                AncestryNativeFacts before = Facts(handle); Ntfs(handle, before.Volume);
                string path = FinalPath(handle, 1); Mapping(roots[branch], false);
                AncestryNativeFacts after = Facts(handle); AncestryNativeData.Same(before, after);
                record.Completed = true;
                return new AncestryObservation(before.Volume, before.FileId, before.Directory, before.Deleted,
                    before.Tag != 0 || (before.Attributes & 0x400) != 0, (before.Attributes & 0x1000) != 0, true, true, path);
            }
            catch (Exception error) { Remember(error); if (!unresolved) record.Completed = true; throw; }
            finally { record.Unresolved |= unresolved; }
        }
        internal bool Close(IntPtr handle)
        {
            // The frozen owner may also close a confirmed output from an operation
            // whose later policy check failed before Register. It owns that handle.
            AncestryData.Need(!unresolved && AncestryData.Handle(handle), "ancestry-close-deferred");
            int found = -1;
            for (int i = 0; i < usedHandles; i++) if (handles[i] == handle && !handleClosed[i]) { found = i; break; }
            if (found >= 0)
            { AncestryData.Need(!closeAttempted[found], "ancestry-native-close-consumed"); closeAttempted[found] = true; }
            bool ok = AncestryNative.Close(handle); if (found >= 0) handleClosed[found] = ok; return ok;
        }
        internal void CloseStorage()
        {
            AncestryData.Need(!closed && !unresolved, "ancestry-storage-deferred"); closed = true;
            for (int i = 0; i < usedFrames; i++)
                AncestryData.Need(frames[i].StorageReleased, "ancestry-frame-storage-unreleased");
            AncestryData.Need(security == null || securityCloseReturned && securityOutcome != null &&
                securityOutcome.AllOwnedResourcesReleased, "ancestry-security-storage-unreleased");
            if (arenaOwned) AncestryNative.Free(arena);
            StorageReleased = true;
        }
    }
}
