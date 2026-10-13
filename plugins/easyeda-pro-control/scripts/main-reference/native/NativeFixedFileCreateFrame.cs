// PRIVATE ONE-FILE FIXTURE. Uncompiled and native-unqualified.
// Fixed29 destination roles only; original directory/guard frame is unchanged.
using System;
using System.Collections.ObjectModel;
using System.Text;

namespace Easyeda.PrivatePreparation
{
    internal sealed class NativeFileFrameOutcome
    {
        internal readonly string Failure;
        internal readonly bool NativeCallEntered;
        internal readonly bool NativeReturnObserved;
        internal readonly bool NativeCompletionObserved;
        internal readonly bool Unresolved;
        internal readonly bool OutputTransferred;
        internal readonly bool RawOutputObserved;
        internal readonly long RawOutputDiagnostic;
        internal readonly int AllocatedSlots;
        internal readonly int UniqueAllocations;
        internal readonly int FreeAttempts;
        internal readonly bool AllFrameStorageReleased;
        internal readonly ReadOnlyCollection<int> FailedFreeSlots;
        internal readonly ReadOnlyCollection<int> AliasedSlots;
        internal readonly ReadOnlyCollection<int> UncertainAllocationSlots;
        internal readonly bool SecurityCleanupReturned, FixedSecurityCopyVerified;
        internal readonly OwnerSecurityOutcome SecurityResources;
        internal readonly bool AllPreparationResourcesReleased;
        internal readonly bool NativeFilesystemQualified = false;
        internal readonly bool PathnameHandoffAuthorized = false;
        internal readonly bool ExecutionAuthorized = false;

        internal NativeFileFrameOutcome(string failure, bool entered, bool returned,
            bool completed, bool unresolved, bool transferred, bool rawObserved,
            long rawOutput, int allocated, int unique, int attempts, int[] failures,
            int[] aliases, int[] uncertain, bool securityCleanupReturned,
            OwnerSecurityOutcome securityResources, bool securityCopyVerified)
        {
            Failure = failure; NativeCallEntered = entered; NativeReturnObserved = returned;
            NativeCompletionObserved = completed;
            Unresolved = unresolved || uncertain.Length != 0 || !securityCleanupReturned ||
                securityResources == null || !securityResources.AllOwnedResourcesReleased;
            OutputTransferred = transferred; RawOutputObserved = rawObserved;
            RawOutputDiagnostic = rawOutput; AllocatedSlots = allocated;
            UniqueAllocations = unique; FreeAttempts = attempts;
            FailedFreeSlots = Array.AsReadOnly((int[])failures.Clone());
            AliasedSlots = Array.AsReadOnly((int[])aliases.Clone());
            UncertainAllocationSlots = Array.AsReadOnly((int[])uncertain.Clone());
            SecurityCleanupReturned = securityCleanupReturned;
            SecurityResources = securityResources; FixedSecurityCopyVerified = securityCopyVerified;
            AllFrameStorageReleased = !unresolved && uncertain.Length == 0 && attempts == unique &&
                failures.Length == 0 && aliases.Length == 0;
            AllPreparationResourcesReleased = AllFrameStorageReleased && securityCleanupReturned &&
                securityResources != null && securityResources.AllOwnedResourcesReleased;
        }
    }

    // The caller retains this owner BEFORE Attempt. It has no finalizer and
    // cannot release uncertain in-flight storage merely because the GC runs.
    internal sealed class NativeFixedFileCreateFrame
    {
        internal const int Name = 0, Unicode = 1, Attributes = 2;
        internal const int IoStatus = 3, Output = 4, Security = 5;
        internal const int SlotCount = 6;
        internal const int UnicodeBytes = 16, AttributesBytes = 48;
        internal const int IoStatusBytes = 16, OutputBytes = 8;
        // Fixed copied-storage cap; memory readback is not applied file security.
        internal const int SecurityMaximumBytes = 1024;
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
        private readonly FixedOwnerSecurity securityOwner;
        private OwnerSecurityOutcome securityResources;
        private bool securityCleanupAttempted, securityCleanupReturned, securityCopyVerified;
        private int allocationInFlight = -1;
        private bool attempted, active, closed, entered, returned, completed;
        private bool unresolved, transferred, rawObserved;
        private int returnedStatus;
        private long rawDiagnostic;
        private Exception originalFailure;
        private string failureCode;
        private NativeFileFrameOutcome outcome;
        internal Exception OriginalFailure { get { return originalFailure; } }

        // Managed allocation only; no native import, buffer or parent acquisition.
        internal NativeFixedFileCreateFrame()
        {
            // Cleanup bookkeeping is acquired before any owned native storage.
            // Cleanup cannot strand buffers because a scratch allocation failed.
            cleanupFailures = new int[SlotCount];
            cleanupAliases = new int[SlotCount];
            cleanupDuplicates = new bool[SlotCount];
            cleanupUncertain = new int[SlotCount];
            for (int i = 0; i < SlotCount; i++) slots[i] = new MemorySlot();
            securityOwner = new FixedOwnerSecurity();
        }

        internal CreateReply Attempt(FixedFileCreateRequest request, out IntPtr ownedOutput)
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
                    // The fixed fixture backend checks the original session here.
                    NativeFileFrameCalls.RequireCreateQualification();
                    // All argument storage is owner-retained before the native
                    // boundary. An opaque throw cannot establish not-started.
                    entered = true;
                    returnedStatus = NativeFileFrameCalls.Create(slots[Output].Pointer, FixedFileCreateRequest.WriterAccess,
                        slots[Attributes].Pointer, slots[IoStatus].Pointer, FixedFileCreateRequest.Options);
                    returned = true;
                    if (returnedStatus == StatusPending)
                    {
                        unresolved = true;
                        throw new LayoutRefusal("native-frame-pending");
                    }
                    completed = true;
                    IntPtr raw = NativeFileFrameCalls.ReadPointer(slots[Output].Pointer, 0);
                    rawObserved = true; rawDiagnostic = raw.ToInt64();
                    if (returnedStatus < 0) throw new LayoutRefusal("native-create-failed");
                    if (!FixedScratchLayout.ValidHandle(raw))
                        throw new LayoutRefusal("native-success-invalid-handle");
                    // Non-pending final NT_SUCCESS establishes acquisition.
                    // Publish before information decoding or other fallibles.
                    ownedOutput = raw;
                    transferred = true;
                    ulong information = NativeFileFrameCalls.ReadUnsigned(slots[IoStatus].Pointer, 8);
                    // The existing owner rejects any nonzero status or info !=2.
                    // It already owns the returned handle for that refusal.
                    return new CreateReply(returnedStatus, information);
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
                    Remember(error);
                    throw new LayoutRefusal(failureCode);
                }
                finally { active = false; }
            }
        }

        private static void Validate(FixedFileCreateRequest request)
        {
            if (IntPtr.Size != 8 || !BitConverter.IsLittleEndian)
                throw new LayoutRefusal("file-frame-x64-only");
            if (request == null || !FixedScratchLayout.ValidHandle(request.Parent) ||
                request.Role < 0 || request.Role >= FixedFileData.CreatedCount)
                throw new LayoutRefusal("file-frame-request");
            // Name is derived from the fixed role; never caller-supplied.
            string name = request.Component;
            if (name != FixedFileData.Name(request.Role) || name.Length == 0 ||
                name.Length > FixedFileCreateRequest.NameMaximum)
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

        private void Prepare(FixedFileCreateRequest request)
        {
            byte[] name = Encoding.Unicode.GetBytes(request.Component + "\0");
            if (name.Length > (FixedFileCreateRequest.NameMaximum + 1) * 2)
                throw new LayoutRefusal("native-frame-name-budget");
            byte[] descriptor = PrepareSecurityCopy();
            Allocate(Name, name.Length); Allocate(Unicode, UnicodeBytes);
            Allocate(Attributes, AttributesBytes); Allocate(IoStatus, IoStatusBytes);
            Allocate(Output, OutputBytes);
            Allocate(Security, descriptor.Length);
            NativeFileFrameCalls.Write(slots[Security].Pointer, descriptor);
            byte[] copied = NativeFileFrameCalls.ReadBytes(slots[Security].Pointer, descriptor.Length);
            if (copied == null || copied.Length != descriptor.Length)
                throw new LayoutRefusal("native-frame-security-copy");
            for (int i = 0; i < descriptor.Length; i++)
                if (copied[i] != descriptor[i]) throw new LayoutRefusal("native-frame-security-copy");
            securityCopyVerified = true;
            byte[] unicode = new byte[UnicodeBytes];
            Put16(unicode, 0, checked((ushort)(name.Length - 2)));
            Put16(unicode, 2, checked((ushort)name.Length));
            Put64(unicode, 8, unchecked((ulong)slots[Name].Pointer.ToInt64()));
            byte[] attributes = new byte[AttributesBytes];
            Put32(attributes, 0, AttributesBytes);
            Put64(attributes, 8, unchecked((ulong)request.Parent.ToInt64()));
            Put64(attributes, 16, unchecked((ulong)slots[Unicode].Pointer.ToInt64()));
            Put32(attributes, 24, FixedFileCreateRequest.ObjectAttributes);
            Put64(attributes, 32, unchecked((ulong)slots[Security].Pointer.ToInt64()));
            // SecurityQualityOfService and both native output blocks remain zero.
            NativeFileFrameCalls.Write(slots[Name].Pointer, name);
            NativeFileFrameCalls.Write(slots[Unicode].Pointer, unicode);
            NativeFileFrameCalls.Write(slots[Attributes].Pointer, attributes);
            NativeFileFrameCalls.Write(slots[IoStatus].Pointer, new byte[IoStatusBytes]);
            NativeFileFrameCalls.Write(slots[Output].Pointer, new byte[OutputBytes]);
        }

        private byte[] PrepareSecurityCopy()
        {
            byte[] descriptor = null;
            try
            {
                securityOwner.Prepare();
                descriptor = securityOwner.TakePreparedDescriptorForFrame();
            }
            catch (Exception error) { Remember(error); }
            finally { CleanupSecurityOnce(); }
            if (originalFailure != null) throw new LayoutRefusal(failureCode);
            if (descriptor == null || descriptor.Length < 20 || descriptor.Length > SecurityMaximumBytes ||
                !securityCleanupReturned || securityResources == null ||
                !securityResources.ConstructedDescriptorReadBack || securityResources.Failure != null ||
                securityResources.AcquiredSlots != 3 || securityResources.UniqueResources != 3 ||
                securityResources.ReleaseAttempts != 3 || !securityResources.AllOwnedResourcesReleased)
                throw new LayoutRefusal("native-frame-security-cleanup");
            return descriptor;
        }

        private void CleanupSecurityOnce()
        {
            if (securityCleanupAttempted) return;
            securityCleanupAttempted = true;
            try
            {
                securityResources = securityOwner.CloseOwnedResources();
                securityCleanupReturned = true;
                if (securityOwner.OriginalFailure != null) Remember(securityOwner.OriginalFailure);
            }
            catch (Exception error)
            {
                if (securityOwner.OriginalFailure != null) Remember(securityOwner.OriginalFailure);
                Remember(error);
            }
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
            NativeFileFrameCalls.Allocate(bytes, out slots[index].Pointer);
            allocationInFlight = -1;
            if (!FixedScratchLayout.ValidHandle(slots[index].Pointer))
            {
                slots[index].Uncertain = true;
                throw new LayoutRefusal("native-frame-allocation");
            }
            slots[index].Owned = true;
            CheckReturnedPointer(index);
        }
        private void CheckReturnedPointer(int index)
        {
            if (!FixedScratchLayout.ValidHandle(slots[index].Pointer))
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

        internal NativeFileFrameOutcome CloseFrameStorage()
        {
            lock (stateLock)
            {
                if (active) throw new LayoutRefusal("native-frame-active");
                if (outcome != null) return outcome;
                if (closed) throw new LayoutRefusal("native-frame-cleanup-consumed");
                closed = true;
                CleanupSecurityOnce();
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
                // Allocation/security uncertainty must not strand other owned slots.
                // No finally-free on unknown completion. These bounded buffers
                // must outlive any possible pending native reference.
                if (!unresolved)
                {
                    for (int i = SlotCount - 1; i >= 0; i--)
                    {
                        if (!slots[i].Owned || slots[i].Uncertain || cleanupDuplicates[i]) continue;
                        if (slots[i].FreeAttempted) throw new LayoutRefusal("native-frame-repeat-free");
                        slots[i].FreeAttempted = true; attempts++;
                        try { NativeFileFrameCalls.Free(slots[i].Pointer); }
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
                outcome = new NativeFileFrameOutcome(failureCode, entered, returned, completed,
                    unresolved, transferred, rawObserved, rawDiagnostic, allocated, unique,
                    attempts, failedResult, aliasResult, uncertainResult, securityCleanupReturned,
                    securityResources, securityCopyVerified);
                return outcome;
            }
        }
    }
}

