// PRIVATE original-ancestry lease binding. No bootstrap pathname reopen.
// No generic path, mutation control, deletion, runtime copy, Job or launch method.
using System;
using System.Runtime.InteropServices;
using System.Text;

namespace Easyeda.PrivatePreparation
{
    internal sealed class FixedLayoutBackend
    {
        // Facts/SD [0,1024), counts [1536,1548), UTF-16 [2048,10752).
        private const int ArenaBytes = 10752, PathOffset = 2048, CountOffset = 1536;
        private readonly string nonce;
        private readonly byte[] zero = new byte[ArenaBytes];
        private IntPtr arena;
        private bool arenaOwned, allocationAttempted, storageCloseAttempted, unresolved;
        private string bootstrap;
        internal bool Unresolved { get { return unresolved; } }
        internal bool StorageReleased { get; private set; }
        internal bool Win32ErrorObserved { get; private set; }
        internal int Win32Error { get; private set; }
        internal FixedLayoutBackend(string compilerNonce)
        { FullLayoutData.CheckNonce(compilerNonce); nonce = compilerNonce; StorageReleased = true; }
        private IntPtr At(int offset) { return IntPtr.Add(arena, offset); }
        private void ClearQuery() { Marshal.Copy(zero, 0, arena, ArenaBytes); }
        private byte[] Bytes(int offset, int count)
        {
            FullLayoutData.Need(offset >= 0 && count >= 0 && offset <= ArenaBytes - count, "full-layout-arena-bound");
            byte[] result = new byte[count]; Marshal.Copy(At(offset), result, 0, count); return result;
        }
        private void Failed(int error, string code)
        {
            Win32ErrorObserved = true; Win32Error = error;
            if (error == 997) unresolved = true;
            throw new LayoutRefusal(code);
        }
        internal void Prepare()
        {
            FullLayoutData.Need(!allocationAttempted && Environment.OSVersion.Platform == PlatformID.Win32NT &&
                IntPtr.Size == 8 && BitConverter.IsLittleEndian, "full-layout-native-platform");
            allocationAttempted = true; StorageReleased = false;
            try { arena = Marshal.AllocHGlobal(ArenaBytes); }
            catch { unresolved = true; throw; }
            if (!FixedScratchLayout.ValidHandle(arena))
            { unresolved = true; throw new LayoutRefusal("full-layout-arena-acquisition"); }
            arenaOwned = true;
            FullLayoutData.Need(arena.ToInt64() % 8 == 0, "full-layout-arena-alignment");
        }
        internal void BindOriginalAnchor(IntPtr borrowed, AncestryObservation expected)
        {
            FullLayoutData.Need(arenaOwned && !unresolved && bootstrap == null &&
                FixedScratchLayout.ValidHandle(borrowed), "full-layout-bootstrap-state");
            AncestryData.Ordinary(expected);
            HandleObservation before = ReadFacts(borrowed, null, null, false);
            RequireNtfs(borrowed, before.Volume);
            string rawPath = FinalPath(borrowed);
            HandleObservation after = ReadFacts(borrowed, null, null, false);
            bootstrap = FullLayoutData.BindOriginalAnchor(expected, before, after, rawPath, nonce);
        }

        // Only the context calls this immediately after its full retained recheck.
        internal string CopyPreparedDirectoryName(LayoutRole role)
        {
            int index = (int)role;
            FullLayoutData.Need(index >= 0 && index < 11 && bootstrap != null && arenaOwned &&
                !unresolved && !storageCloseAttempted, "full-layout-name-copy-state");
            return FullLayoutData.PathForSlot(bootstrap, 1 + index * 2, nonce);
        }
        private HandleObservation ReadFacts(IntPtr handle, byte[] descriptor, byte[] expectedOwner, bool created)
        {
            ClearQuery(); bool ok;
            try { ok = FixedLayoutNative.GetFileInformationByHandle(handle, arena); }
            catch { unresolved = true; throw; }
            if (!ok) Failed(Marshal.GetLastWin32Error(), "full-layout-identity-query");
            byte[] basic = Bytes(0, 52);
            Query(handle, 9, 8); byte[] tag = Bytes(0, 8);
            Query(handle, 1, 24); byte[] standard = Bytes(0, 24);
            return FullLayoutData.Decode(basic, tag, standard, descriptor, expectedOwner, created);
        }
        private void Query(IntPtr handle, int kind, uint count)
        {
            ClearQuery(); bool ok;
            try { ok = FixedLayoutNative.GetFileInformationByHandleEx(handle, kind, arena, count); }
            catch { unresolved = true; throw; }
            if (!ok) Failed(Marshal.GetLastWin32Error(), "full-layout-information-query");
        }
        private byte[] ReadAppliedSecurity(IntPtr handle)
        {
            ClearQuery(); bool ok;
            try { ok = FixedLayoutNative.GetKernelObjectSecurity(handle, 5, arena, 1024, At(CountOffset)); }
            catch { unresolved = true; throw; }
            if (!ok) Failed(Marshal.GetLastWin32Error(), "full-layout-security-query");
            int count = Marshal.ReadInt32(At(CountOffset));
            FullLayoutData.Need(count >= 20 && count <= 1024, "full-layout-applied-security-bound");
            return Bytes(0, count);
        }
        internal HandleObservation Observe(IntPtr handle, int slot, byte[] expectedOwner)
        {
            FullLayoutData.Need(bootstrap != null && !unresolved && !storageCloseAttempted,
                "full-layout-observation-state");
            bool created = slot != 0;
            HandleObservation before = ReadFacts(handle, null, null, false);
            byte[] descriptor = created ? ReadAppliedSecurity(handle) : null;
            string rawPath = FinalPath(handle);
            FullLayoutData.Need(rawPath == FullLayoutData.PathForSlot(bootstrap, slot, nonce), "full-layout-returned-name");
            HandleObservation after = ReadFacts(handle, descriptor, expectedOwner, created);
            FullLayoutData.Need(FullLayoutData.SameIdentity(before, after) && before.Directory == after.Directory &&
                before.DeletePending == after.DeletePending && before.Attributes == after.Attributes &&
                before.ReparseTag == after.ReparseTag && before.Links == after.Links && before.Length == after.Length,
                "full-layout-observation-drift");
            // Point-in-time checks only. No claim that paths cannot change after
            // this observation, or that this proves the later Electron handoff.
            return after;
        }
        private string FinalPath(IntPtr handle)
        {
            ClearQuery(); uint length;
            try { length = FixedLayoutNative.GetFinalPathNameByHandleW(handle, At(PathOffset), FullLayoutData.PathCapacity, 1); }
            catch { unresolved = true; throw; }
            if (length == 0) Failed(Marshal.GetLastWin32Error(), "full-layout-final-path-query");
            FullLayoutData.Need(length < FullLayoutData.PathCapacity, "full-layout-final-path-bound");
            return new UnicodeEncoding(false, false, true).GetString(Bytes(PathOffset, checked((int)length * 2)));
        }
        private void RequireNtfs(IntPtr handle, ulong volume)
        {
            ClearQuery(); bool ok;
            try { ok = FixedLayoutNative.GetVolumeInformationByHandleW(handle, IntPtr.Zero, 0,
                At(CountOffset), At(CountOffset + 4), At(CountOffset + 8), arena, 16); }
            catch { unresolved = true; throw; }
            if (!ok) Failed(Marshal.GetLastWin32Error(), "full-layout-volume-query");
            FullLayoutData.Need(Marshal.PtrToStringUni(arena, 5) == "NTFS\0" &&
                unchecked((uint)Marshal.ReadInt32(At(CountOffset))) == volume &&
                (Marshal.ReadInt32(At(CountOffset + 8)) & 0x88) == 0x88, "full-layout-volume-profile");
        }
        internal bool CloseHandle(IntPtr handle)
        { return FixedLayoutNative.CloseHandle(handle); }
        internal void CloseStorage()
        {
            FullLayoutData.Need(!storageCloseAttempted && !unresolved, "full-layout-storage-deferred-or-consumed");
            storageCloseAttempted = true;
            if (arenaOwned) Marshal.FreeHGlobal(arena);
            StorageReleased = true;
        }
    }
}
