// PRIVATE existing-only frame. No descriptor application or creation fallback.
using System;

namespace Easyeda.PrivatePreparation
{
    internal sealed class AncestryDirectoryOpenFrame
    {
        private const int Count = 5, Name = 0, Unicode = 1, Attributes = 2, IoStatus = 3, Output = 4;
        private readonly IntPtr[] pointers = new IntPtr[Count];
        private readonly bool[] owned = new bool[Count], uncertainSlot = new bool[Count],
            aliasedSlot = new bool[Count], attemptedFree = new bool[Count];
        private readonly Exception[] cleanupErrors = new Exception[Count];
        private bool consumed, closed, unresolved, nativeUnresolved, released;
        private int cleanupCount;
        private Exception firstError;
        internal bool Unresolved { get { return unresolved; } }
        internal bool NativeUnresolved { get { return nativeUnresolved; } }
        internal bool StorageReleased { get { return released; } }
        internal Exception OriginalFailure { get { return firstError; } }
        internal int CleanupErrors { get { return cleanupCount; } }
        internal bool StatusObserved { get; private set; }
        internal int Status { get; private set; }
        internal bool RawOutputObserved { get; private set; }
        internal IntPtr RawOutput { get; private set; }
        internal AncestryDirectoryOpenFrame() { }
        private void Remember(Exception error) { if (firstError == null) firstError = error; }
        private void Allocate(int slot, int bytes, IntPtr arena)
        {
            // An opaque allocator throw retains its slot, not unrelated pre-call buffers.
            try { AncestryNative.Allocate(bytes, out pointers[slot]); }
            catch
            {
                uncertainSlot[slot] = true; unresolved = true;
                if (pointers[slot] != IntPtr.Zero)
                    for (int i = 0; i < slot; i++) if (owned[i] && pointers[i] == pointers[slot])
                    { aliasedSlot[i] = true; aliasedSlot[slot] = true; }
                throw;
            }
            owned[slot] = true;
            if (!AncestryData.Handle(pointers[slot]) || pointers[slot].ToInt64() % 8 != 0 || pointers[slot] == arena)
            { uncertainSlot[slot] = true; unresolved = true; throw new AncestryRefusal("ancestry-frame-pointer"); }
            for (int i = 0; i < slot; i++) if (owned[i] && pointers[i] == pointers[slot])
            { aliasedSlot[i] = true; aliasedSlot[slot] = true;
              unresolved = true; throw new AncestryRefusal("ancestry-frame-memory-alias"); }
        }
        internal void Attempt(AncestryAcquisition record, IntPtr parent, string name, IntPtr arena)
        {
            AncestryData.Need(record != null && !consumed && !closed, "ancestry-frame-consumed"); consumed = true;
            try
            {
                AncestryData.Need(record != null && record.Entered && !record.Completed && !record.Confirmed &&
                    record.Handle == IntPtr.Zero && !record.Unresolved && AncestryData.Handle(parent), "ancestry-frame-input");
                AncestryData.Component(name);
                byte[] encoded = AncestryNativeData.Wide(name);
                byte[] unicode = new byte[16], attributes = new byte[48], status = new byte[16], output = new byte[8];
                Allocate(Name, encoded.Length, arena); Allocate(Unicode, 16, arena);
                Allocate(Attributes, 48, arena); Allocate(IoStatus, 16, arena); Allocate(Output, 8, arena);
                AncestryNativeData.Put16(unicode, 0, encoded.Length - 2);
                AncestryNativeData.Put16(unicode, 2, encoded.Length);
                AncestryNativeData.Put64(unicode, 8, unchecked((ulong)pointers[Name].ToInt64()));
                AncestryNativeData.Put32(attributes, 0, 48);
                AncestryNativeData.Put64(attributes, 8, unchecked((ulong)parent.ToInt64()));
                AncestryNativeData.Put64(attributes, 16, unchecked((ulong)pointers[Unicode].ToInt64()));
                AncestryNativeData.Put32(attributes, 24, AncestryData.ObjectFlags);
                AncestryNative.Write(pointers[Name], encoded); AncestryNative.Write(pointers[Unicode], unicode);
                AncestryNative.Write(pointers[Attributes], attributes); AncestryNative.Write(pointers[IoStatus], status);
                AncestryNative.Write(pointers[Output], output);
                int returned;
                try { returned = AncestryNative.OpenDirectory(pointers[Output], AncestryData.ReadAccess,
                    pointers[Attributes], pointers[IoStatus], AncestryData.Share,
                    AncestryData.OpenDisposition, AncestryData.DirectoryOptions); }
                catch { unresolved = true; nativeUnresolved = true; throw; }
                // Scalar publication precedes pointer/IOSB decoding or diagnostics.
                Status = returned; StatusObserved = true;
                if (returned == 0x103)
                { unresolved = true; nativeUnresolved = true; throw new AncestryRefusal("ancestry-open-pending"); }
                record.Completed = true;
                try { record.Handle = AncestryNative.Pointer(pointers[Output]); }
                catch { unresolved = true; nativeUnresolved = true; throw; }
                RawOutput = record.Handle; RawOutputObserved = true;
                if (returned < 0)
                {
                    if (record.Handle != IntPtr.Zero) { unresolved = true; nativeUnresolved = true; }
                    throw new AncestryRefusal("ancestry-open-status");
                }
                // NT_SUCCESS is acquisition evidence; later contradictions do not erase it.
                record.Confirmed = true;
                if (!AncestryData.Handle(record.Handle))
                { unresolved = true; nativeUnresolved = true; throw new AncestryRefusal("ancestry-open-invalid-output"); }
                byte[] observed;
                try { observed = AncestryNative.Read(pointers[IoStatus], 16); }
                catch { unresolved = true; nativeUnresolved = true; throw; }
                AncestryData.Need(returned == 0 && unchecked((int)AncestryNativeData.U32(observed, 0)) == 0 &&
                    AncestryNativeData.U64(observed, 8) == 1, "ancestry-open-information");
            }
            catch (Exception error)
            {
                Remember(error);
                // No native call occurred if status is absent and no opaque call/allocation latched.
                if (!unresolved && !StatusObserved) record.Completed = true;
                throw;
            }
            finally { if (unresolved) record.Unresolved = true; }
        }
        internal void CloseStorage()
        {
            AncestryData.Need(!closed, "ancestry-frame-close-consumed"); closed = true;
            if (nativeUnresolved) return;
            // No cleanup bookkeeping allocation precedes any free. Independent frees all run.
            for (int i = Count - 1; i >= 0; i--)
            {
                if (!owned[i] || uncertainSlot[i] || aliasedSlot[i]) continue;
                attemptedFree[i] = true;
                try { AncestryNative.Free(pointers[i]); }
                catch (Exception error) { cleanupErrors[cleanupCount++] = error; Remember(error); }
            }
            if (cleanupCount != 0)
            { unresolved = true; throw cleanupErrors[0]; }
            if (unresolved) return;
            released = true;
        }
        internal Exception CleanupError(int index)
        { AncestryData.Need(index >= 0 && index < cleanupCount, "ancestry-frame-cleanup-index"); return cleanupErrors[index]; }
        internal int FreeAttempts
        { get { int n = 0; for (int i = 0; i < Count; i++) if (attemptedFree[i]) n++; return n; } }
    }
}
