// PRIVATE fixed existing-open frame. Source roles0..17 or child roles29..33 only.
// Derived from the reviewed file frame; no security allocation or file-create disposition.
using System;
using System.Collections.ObjectModel;
using System.Text;

namespace Easyeda.PrivatePreparation
{
    internal sealed class ReadOpenReply
    {
        internal readonly int Status;
        internal readonly ulong Information;
        internal ReadOpenReply(int status, ulong information) { Status = status; Information = information; }
    }
    internal sealed class NativeReadFrameOutcome
    {
        internal readonly string Failure;
        internal readonly bool NativeCallEntered, NativeReturnObserved, NativeCompletionObserved,
            NativeCallUnresolved, Unresolved, OutputTransferred, RawOutputObserved, AllFrameStorageReleased;
        internal readonly long RawOutputDiagnostic;
        internal readonly int NativeStatus, AllocatedSlots, UniqueAllocations, FreeAttempts;
        internal readonly ReadOnlyCollection<int> FailedFreeSlots, AliasedSlots, UncertainAllocationSlots;
        internal readonly bool NativeFilesystemQualified = false, PathnameHandoffAuthorized = false,
            ExecutionAuthorized = false;
        internal NativeReadFrameOutcome(string failure, bool entered, bool returned, bool completed,
            bool unresolved, bool transferred, bool rawObserved, long raw, int allocated, int unique,
            int attempts, int[] failures, int[] aliases, int[] uncertain, int status)
        {
            Failure = failure; NativeCallEntered = entered; NativeReturnObserved = returned;
            NativeCompletionObserved = completed; NativeCallUnresolved = unresolved;
            Unresolved = unresolved || uncertain.Length != 0; OutputTransferred = transferred;
            RawOutputObserved = rawObserved; RawOutputDiagnostic = raw; NativeStatus = status;
            AllocatedSlots = allocated; UniqueAllocations = unique; FreeAttempts = attempts;
            FailedFreeSlots = Array.AsReadOnly((int[])failures.Clone());
            AliasedSlots = Array.AsReadOnly((int[])aliases.Clone());
            UncertainAllocationSlots = Array.AsReadOnly((int[])uncertain.Clone());
            AllFrameStorageReleased = !unresolved && uncertain.Length == 0 && attempts == unique &&
                failures.Length == 0 && aliases.Length == 0;
        }
    }

    // The caller retains this owner BEFORE Attempt. It has no finalizer and
    // cannot release uncertain in-flight storage merely because the GC runs.
    internal sealed class NativeFixedReadOpenFrame
    {
        internal const int Name = 0, Unicode = 1, Attributes = 2;
        internal const int IoStatus = 3, Output = 4;
        internal const int SlotCount = 5;
        internal const int UnicodeBytes = 16, AttributesBytes = 48;
        internal const int IoStatusBytes = 16, OutputBytes = 8;
        internal const int StatusPending = 0x103;

        private sealed class MemorySlot
        {
            internal IntPtr Pointer;
            internal bool Reserved;
            internal bool Owned, Uncertain;
            internal bool FreeAttempted;
        }

        private readonly MemorySlot[] slots = new MemorySlot[SlotCount];
        private readonly object stateLock = new object();
        private readonly int[] cleanupFailures;
        private readonly int[] cleanupAliases;
        private readonly bool[] cleanupDuplicates;
        private readonly int[] cleanupUncertain;
        private int allocationInFlight = -1;
        private bool attempted, active, closed, entered, returned, completed;
        private bool unresolved, transferred, rawObserved;
        private int returnedStatus;
        private long rawDiagnostic;
        private Exception originalFailure;
        private string failureCode;
        private NativeReadFrameOutcome outcome;
        internal Exception OriginalFailure { get { return originalFailure; } }
        internal bool NativeCallEntered { get { return entered; } }
        internal bool NativeReturnObserved { get { return returned; } }
        internal bool NativeCompletionObserved { get { return completed; } }
        internal bool NativeCallUnresolved { get { return unresolved; } }
        internal bool RawOutputObserved { get { return rawObserved; } }
        internal long RawOutputDiagnostic { get { return rawDiagnostic; } }
        internal int NativeStatus { get { return returnedStatus; } }

        // Managed allocation only; no native import, buffer or parent acquisition.
        internal NativeFixedReadOpenFrame()
        {
            // Cleanup bookkeeping is acquired before any owned native storage.
            // Cleanup cannot strand buffers because a scratch allocation failed.
            cleanupFailures = new int[SlotCount];
            cleanupAliases = new int[SlotCount];
            cleanupDuplicates = new bool[SlotCount];
            cleanupUncertain = new int[SlotCount];
            for (int i = 0; i < SlotCount; i++) slots[i] = new MemorySlot();
        }

        internal ReadOpenReply Attempt(FixedReadOpenRequest request, out IntPtr ownedOutput)
        {
            lock (stateLock)
            {
                if (attempted || closed) throw new LayoutRefusal("native-frame-consumed");
                ownedOutput = IntPtr.Zero;
                attempted = true; active = true;
                try
                {
                    Validate(request);
                    Prepare(request);
                    // The selected backend checks the original active record;
                    // this is not the separate refused complete-session child gate.
                    NativeReadFrameCalls.RequireOpenQualification();
                    // All argument storage is owner-retained before the native
                    // boundary. An opaque throw cannot establish not-started.
                    entered = true;
                    returnedStatus = NativeReadFrameCalls.Open(slots[Output].Pointer, FixedReadOpenRequest.ReadAccess,
                        slots[Attributes].Pointer, slots[IoStatus].Pointer, FixedReadOpenRequest.Options);
                    returned = true;
                    if (returnedStatus == StatusPending)
                    {
                        unresolved = true;
                        throw new LayoutRefusal("native-frame-pending");
                    }
                    completed = true;
                    IntPtr raw = NativeReadFrameCalls.ReadPointer(slots[Output].Pointer, 0);
                    rawObserved = true; rawDiagnostic = raw.ToInt64();
                    if (returnedStatus < 0) throw new LayoutRefusal("native-read-open-failed");
                    if (!FixedFileData.Valid(raw))
                        throw new LayoutRefusal("native-success-invalid-handle");
                    // Non-pending final NT_SUCCESS establishes acquisition.
                    // Publish before information decoding or other fallibles.
                    ownedOutput = raw;
                    transferred = true;
                    ulong information = NativeReadFrameCalls.ReadUnsigned(slots[IoStatus].Pointer, 8);
                    // The source adapter rejects nonzero status or info !=1.
                    // It already owns the returned handle for that refusal.
                    return new ReadOpenReply(returnedStatus, information);
                }
                catch (Exception error)
                {
                    if (allocationInFlight >= 0) slots[allocationInFlight].Uncertain = true;
                    if (entered && !returned) unresolved = true;
                    // Even a negative returned status does not supply readable
                    // output evidence when decoding that output itself failed.
                    if (returned && !rawObserved) unresolved = true;
                    // A reported success whose output could not be decoded or
                    // adopted must retain that output storage too. Completion
                    // of the syscall is not proof of complete handle accounting.
                    if (returned && returnedStatus >= 0 && !transferred) unresolved = true;
                    if (returned && rawObserved && returnedStatus < 0 && rawDiagnostic != 0) unresolved = true;
                    Remember(error);
                    throw new LayoutRefusal(failureCode);
                }
                finally { active = false; }
            }
        }

        private static void Validate(FixedReadOpenRequest request)
        {
            if (IntPtr.Size != 8 || !BitConverter.IsLittleEndian)
                throw new LayoutRefusal("file-frame-x64-only");
            if (request == null || !FixedFileData.Valid(request.Parent) ||
                !(request.Role >= 0 && request.Role < FixedFileData.RuntimeCount || request.Role >= 29 && request.Role <= 33))
                throw new LayoutRefusal("file-frame-request");
            // Name is derived from the fixed role; never caller-supplied.
            string name = request.Component;
            if (name != FixedFileData.Name(request.Role) || name.Length == 0 ||
                name.Length > FixedReadOpenRequest.NameMaximum)
                throw new LayoutRefusal("file-frame-name");
            for (int i = 0; i < name.Length; i++)
            {
                char c = name[i];
                if (!(c >= 'a' && c <= 'z') && !(c >= 'A' && c <= 'Z') &&
                    !(c >= '0' && c <= '9') && c != '.' && c != '-' && c != '_')
                    throw new LayoutRefusal("file-frame-name");
            }
            if (name == "." || name == "..")
                throw new LayoutRefusal("file-frame-name");
        }

        private void Prepare(FixedReadOpenRequest request)
        {
            byte[] name = Encoding.Unicode.GetBytes(request.Component + "\0");
            if (name.Length > (FixedReadOpenRequest.NameMaximum + 1) * 2)
                throw new LayoutRefusal("native-frame-name-budget");
            Allocate(Name, name.Length); Allocate(Unicode, UnicodeBytes);
            Allocate(Attributes, AttributesBytes); Allocate(IoStatus, IoStatusBytes);
            Allocate(Output, OutputBytes);
            byte[] unicode = new byte[UnicodeBytes];
            Put16(unicode, 0, checked((ushort)(name.Length - 2)));
            Put16(unicode, 2, checked((ushort)name.Length));
            Put64(unicode, 8, unchecked((ulong)slots[Name].Pointer.ToInt64()));
            byte[] attributes = new byte[AttributesBytes];
            Put32(attributes, 0, AttributesBytes);
            Put64(attributes, 8, unchecked((ulong)request.Parent.ToInt64()));
            Put64(attributes, 16, unchecked((ulong)slots[Unicode].Pointer.ToInt64()));
            Put32(attributes, 24, FixedReadOpenRequest.ObjectAttributes);
            // SecurityDescriptor and SecurityQualityOfService stay null.
            // Both native output blocks also remain zero.
            NativeReadFrameCalls.Write(slots[Name].Pointer, name);
            NativeReadFrameCalls.Write(slots[Unicode].Pointer, unicode);
            NativeReadFrameCalls.Write(slots[Attributes].Pointer, attributes);
            NativeReadFrameCalls.Write(slots[IoStatus].Pointer, new byte[IoStatusBytes]);
            NativeReadFrameCalls.Write(slots[Output].Pointer, new byte[OutputBytes]);
        }

        private void Reserve(int index)
        {
            if (index < 0 || index >= SlotCount || slots[index].Reserved)
                throw new LayoutRefusal("native-frame-slot");
            slots[index].Reserved = true;
        }
        private void Allocate(int index, int bytes)
        {
            Reserve(index);
            allocationInFlight = index;
            NativeReadFrameCalls.Allocate(bytes, out slots[index].Pointer);
            allocationInFlight = -1;
            if (!FixedFileData.Valid(slots[index].Pointer))
            {
                slots[index].Uncertain = true;
                throw new LayoutRefusal("native-frame-allocation");
            }
            slots[index].Owned = true;
            CheckReturnedPointer(index);
        }
        private void CheckReturnedPointer(int index)
        {
            if (!FixedFileData.Valid(slots[index].Pointer))
                throw new LayoutRefusal("native-frame-allocation");
            for (int i = 0; i < index; i++)
                if (slots[i].Owned && slots[i].Pointer == slots[index].Pointer)
                    throw new LayoutRefusal("native-frame-allocation-alias");
        }
        private void Remember(Exception error)
        {
            if (originalFailure != null) return;
            originalFailure = error;
            LayoutRefusal refusal = error as LayoutRefusal;
            failureCode = refusal == null ? "native-frame-exception" : refusal.Code;
        }
        private static void Put16(byte[] bytes, int offset, ushort value)
        { bytes[offset] = (byte)value; bytes[offset + 1] = (byte)(value >> 8); }
        private static void Put32(byte[] bytes, int offset, uint value)
        { for (int i = 0; i < 4; i++) bytes[offset + i] = (byte)(value >> (8 * i)); }
        private static void Put64(byte[] bytes, int offset, ulong value)
        { for (int i = 0; i < 8; i++) bytes[offset + i] = (byte)(value >> (8 * i)); }

        internal NativeReadFrameOutcome CloseFrameStorage()
        {
            lock (stateLock)
            {
                if (active) throw new LayoutRefusal("native-frame-active");
                if (outcome != null) return outcome;
                if (closed) throw new LayoutRefusal("native-frame-cleanup-consumed");
                closed = true;
                int allocated = 0, unique = 0, attempts = 0, failedCount = 0, aliasCount = 0, uncertainCount = 0;
                for (int i = 0; i < SlotCount; i++)
                {
                    if (slots[i].Uncertain) cleanupUncertain[uncertainCount++] = i;
                    if (!slots[i].Owned) continue;
                    allocated++;
                    for (int j = 0; j < i; j++)
                        if (slots[j].Owned && slots[i].Pointer == slots[j].Pointer)
                        { cleanupDuplicates[i] = true; break; }
                    if (cleanupDuplicates[i]) cleanupAliases[aliasCount++] = i; else unique++;
                }
                // Only native-call/output uncertainty suppresses all safe frees.
                // Allocation uncertainty must not strand other owned slots.
                // No finally-free on unknown completion. These bounded buffers
                // must outlive any possible pending native reference.
                if (!unresolved)
                {
                    for (int i = SlotCount - 1; i >= 0; i--)
                    {
                        if (!slots[i].Owned || slots[i].Uncertain || cleanupDuplicates[i]) continue;
                        if (slots[i].FreeAttempted) throw new LayoutRefusal("native-frame-repeat-free");
                        slots[i].FreeAttempted = true; attempts++;
                        try { NativeReadFrameCalls.Free(slots[i].Pointer); }
                        catch (Exception error) { cleanupFailures[failedCount++] = i; Remember(error); }
                    }
                }
                // Outcome allocation is after every safe cleanup attempt. If it
                // fails, closed remains consumed; no free may be retried.
                int[] failedResult = new int[failedCount], aliasResult = new int[aliasCount],
                    uncertainResult = new int[uncertainCount];
                Array.Copy(cleanupFailures, failedResult, failedCount);
                Array.Copy(cleanupAliases, aliasResult, aliasCount);
                Array.Copy(cleanupUncertain, uncertainResult, uncertainCount);
                outcome = new NativeReadFrameOutcome(failureCode, entered, returned, completed,
                    unresolved, transferred, rawObserved, rawDiagnostic, allocated, unique,
                    attempts, failedResult, aliasResult, uncertainResult, returnedStatus);
                return outcome;
            }
        }
    }
}
