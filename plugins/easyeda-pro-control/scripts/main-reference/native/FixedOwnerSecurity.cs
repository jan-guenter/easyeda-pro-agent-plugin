// PRIVATE SOURCE PROPOSAL. No caller SID, security bytes, path, or provider.
// Private successor: one internal managed-copy transfer to the refused frame.
using System;
using System.Collections.ObjectModel;

namespace Easyeda.PrivatePreparation
{
    internal sealed class OwnerSecurityOutcome
    {
        internal readonly string Failure;
        internal readonly bool ConstructedDescriptorReadBack;
        internal readonly int AcquiredSlots, UniqueResources, ReleaseAttempts;
        internal readonly ReadOnlyCollection<int> FailedReleaseSlots, AliasedSlots, UncertainSlots;
        internal readonly bool AllOwnedResourcesReleased;
        internal readonly bool AppliedFileSecurityObserved = false;
        internal readonly bool NativeFilesystemQualified = false;
        internal readonly bool PathnameHandoffAuthorized = false;
        internal readonly bool ExecutionAuthorized = false;

        internal OwnerSecurityOutcome(string failure, bool readBack, int acquired,
            int unique, int attempts, int[] failed, int[] aliases, int[] uncertain)
        {
            Failure = failure; ConstructedDescriptorReadBack = readBack;
            AcquiredSlots = acquired; UniqueResources = unique; ReleaseAttempts = attempts;
            FailedReleaseSlots = Array.AsReadOnly((int[])failed.Clone());
            AliasedSlots = Array.AsReadOnly((int[])aliases.Clone());
            UncertainSlots = Array.AsReadOnly((int[])uncertain.Clone());
            AllOwnedResourcesReleased = attempts == unique && failed.Length == 0 &&
                aliases.Length == 0 && uncertain.Length == 0;
        }
    }

    // Retain the owner before Prepare; call CloseOwnedResources even on refusal.
    // No finalizer, public entrypoint, descriptor pointer getter or authority token.
    internal sealed class FixedOwnerSecurity
    {
        internal const int ThreadToken = 0, ProcessToken = 1, TokenBuffer = 2, Descriptor = 3;
        internal const int SlotCount = 4, TokenMaximumBytes = 1024, DescriptorMaximumBytes = 1024;
        private sealed class Slot
        {
            internal IntPtr Pointer;
            internal bool Owned, Uncertain, ReleaseAttempted;
        }
        private readonly Slot[] slots = new Slot[SlotCount];
        private readonly int[] failures = new int[SlotCount];
        private readonly int[] aliases = new int[SlotCount];
        private readonly int[] uncertainSlots = new int[SlotCount];
        private readonly bool[] duplicates = new bool[SlotCount];
        private readonly object stateLock = new object();
        private bool attempted, active, closed, readBack;
        private int acquisitionInFlight = -1;
        private string failureCode;
        private Exception originalFailure;
        private OwnerSecurityOutcome outcome;
        private byte[] preparedDescriptor;
        private bool descriptorTaken;

        // Every cleanup scratch allocation precedes any native acquisition.
        internal FixedOwnerSecurity()
        { for (int i = 0; i < SlotCount; i++) slots[i] = new Slot(); }

        internal void Prepare()
        {
            lock (stateLock)
            {
                if (attempted || closed) throw new LayoutRefusal("owner-security-consumed");
                attempted = true; active = true;
                try
                {
                    failureCode = "owner-security-platform";
                    OwnerSecurityCalls.RequirePlatform();
                    failureCode = "owner-security-thread-token";
                    int error;
                    acquisitionInFlight = ThreadToken;
                    bool opened = OwnerSecurityCalls.OpenCurrentThreadToken(
                        out slots[ThreadToken].Pointer, out error);
                    CompleteAcquisition(ThreadToken, opened);
                    // Only exact ERROR_NO_TOKEN with no raw output is absence.
                    // Anonymous/access-denied/other errors are not absence.
                    if (opened || error != 1008)
                        throw new LayoutRefusal("owner-security-impersonation-unqualified");

                    failureCode = "owner-security-process-token";
                    acquisitionInFlight = ProcessToken;
                    opened = OwnerSecurityCalls.OpenCurrentProcessToken(out slots[ProcessToken].Pointer);
                    CompleteAcquisition(ProcessToken, opened);
                    if (!opened) throw new LayoutRefusal("owner-security-process-token");

                    failureCode = "owner-security-token-buffer";
                    acquisitionInFlight = TokenBuffer;
                    OwnerSecurityCalls.AllocateTokenBuffer(out slots[TokenBuffer].Pointer);
                    CompleteAcquisition(TokenBuffer, true);
                    failureCode = "owner-security-token-query";
                    uint returned;
                    if (!OwnerSecurityCalls.QueryTokenUser(slots[ProcessToken].Pointer,
                        slots[TokenBuffer].Pointer, out returned) || returned < 16 ||
                        returned > TokenMaximumBytes)
                        throw new LayoutRefusal("owner-security-token-query");

                    // Bounds precede SID dereference and native validation.
                    IntPtr sidPointer = OwnerSecurityCalls.ReadPointer(slots[TokenBuffer].Pointer);
                    int offset = BoundedOffset(slots[TokenBuffer].Pointer, sidPointer,
                        checked((int)returned), 16, 8);
                    byte[] tokenBytes = OwnerSecurityCalls.CopyBytes(slots[TokenBuffer].Pointer,
                        checked((int)returned));
                    byte[] sid = OwnerSecurityData.ReadSid(tokenBytes, offset);
                    if (!OwnerSecurityCalls.ValidSid(sidPointer))
                        throw new LayoutRefusal("owner-security-token-sid");
                    // Pure formatting of internally obtained bytes only. Neither
                    // this string nor SID bytes are exposed in generic outcomes.
                    string sddl = OwnerSecurityData.FixedSddl(sid);
                    failureCode = "owner-security-conversion";
                    acquisitionInFlight = Descriptor;
                    uint descriptorBytes;
                    bool converted = OwnerSecurityCalls.ConvertFixedSddl(sddl,
                        out slots[Descriptor].Pointer, out descriptorBytes);
                    CompleteAcquisition(Descriptor, converted);
                    if (!converted || descriptorBytes < 20 ||
                        descriptorBytes > DescriptorMaximumBytes)
                        throw new LayoutRefusal("owner-security-conversion");

                    failureCode = "owner-security-readback";
                    byte[] descriptor = OwnerSecurityCalls.CopyBytes(slots[Descriptor].Pointer,
                        checked((int)descriptorBytes));
                    // Strict bounded component parsing comes first: native
                    // IsValidSecurityDescriptor alone does not inspect ACE policy.
                    OwnerSecurityData.RequireFixedDescriptor(descriptor, sid);
                    if (!OwnerSecurityCalls.ValidDescriptor(slots[Descriptor].Pointer))
                        throw new LayoutRefusal("owner-security-readback");
                    preparedDescriptor = descriptor;
                    readBack = true; failureCode = null;
                }
                catch (Exception error)
                {
                    if (acquisitionInFlight >= 0) slots[acquisitionInFlight].Uncertain = true;
                    if (originalFailure == null) originalFailure = error;
                    throw;
                }
                finally { active = false; }
            }
        }

        // Transfer only the privately produced, completely validated managed copy.
        // No native pointer or caller-selected bytes enter this internal boundary.
        internal byte[] TakePreparedDescriptorForFrame()
        {
            lock (stateLock)
            {
                if (!attempted || active || closed || !readBack || descriptorTaken ||
                    preparedDescriptor == null)
                    throw new LayoutRefusal("owner-security-copy-unavailable");
                descriptorTaken = true;
                byte[] result = preparedDescriptor;
                preparedDescriptor = null;
                return result;
            }
        }

        private void CompleteAcquisition(int index, bool success)
        {
            // A failed native BOOL with nonzero output is NOT ownership.
            // An opaque throw keeps this operation uncertain, even with zero out.
            if (success) slots[index].Owned = true;
            acquisitionInFlight = -1;
            if (!success)
            {
                if (slots[index].Pointer != IntPtr.Zero)
                {
                    slots[index].Uncertain = true;
                    throw new LayoutRefusal("owner-security-failed-raw-output");
                }
                return;
            }
            if (!FixedScratchLayout.ValidHandle(slots[index].Pointer))
            {
                slots[index].Uncertain = true;
                throw new LayoutRefusal("owner-security-invalid-success-output");
            }
            for (int i = 0; i < index; i++)
                if (slots[i].Owned && SameNamespace(i, index) &&
                    slots[i].Pointer == slots[index].Pointer)
                    throw new LayoutRefusal("owner-security-raw-alias");
        }

        // HANDLE values and allocation addresses occupy separate namespaces.
        // Memory aliases across HGlobal/Local allocation kinds are contradictions:
        // cleanup uses the first acquired allocation's matching deallocator once.
        private static bool SameNamespace(int left, int right)
        { return (left <= ProcessToken) == (right <= ProcessToken); }

        private static int BoundedOffset(IntPtr start, IntPtr part, int bytes, int minimum, int need)
        {
            ulong first = unchecked((ulong)start.ToInt64());
            ulong next = unchecked((ulong)part.ToInt64());
            if (next < first || next - first > (ulong)(bytes - need) ||
                next - first < (ulong)minimum || (next - first) % 4 != 0)
                throw new LayoutRefusal("owner-security-token-pointer");
            return checked((int)(next - first));
        }

        internal OwnerSecurityOutcome CloseOwnedResources()
        {
            lock (stateLock)
            {
                if (active) throw new LayoutRefusal("owner-security-active");
                if (closed)
                {
                    if (outcome == null) throw new LayoutRefusal("owner-security-cleanup-consumed");
                    return outcome;
                }
                closed = true;
                preparedDescriptor = null;
                int acquired = 0, unique = 0, attempts = 0, failed = 0, alias = 0, uncertain = 0;
                // No collection/outcome allocation before all release attempts.
                for (int i = 0; i < SlotCount; i++)
                {
                    if (slots[i].Uncertain) uncertainSlots[uncertain++] = i;
                    if (!slots[i].Owned) continue;
                    acquired++;
                    for (int j = 0; j < i; j++)
                        if (slots[j].Owned && SameNamespace(i, j) &&
                            slots[i].Pointer == slots[j].Pointer) { duplicates[i] = true; break; }
                    if (duplicates[i]) aliases[alias++] = i;
                    else unique++;
                }
                for (int i = SlotCount - 1; i >= 0; i--)
                {
                    if (!slots[i].Owned || duplicates[i]) continue;
                    if (slots[i].Uncertain || !FixedScratchLayout.ValidHandle(slots[i].Pointer))
                    { failures[failed++] = i; continue; }
                    slots[i].ReleaseAttempted = true; attempts++;
                    try
                    {
                        bool released;
                        if (i == Descriptor) released = OwnerSecurityCalls.FreeDescriptor(slots[i].Pointer);
                        else if (i == TokenBuffer)
                        { OwnerSecurityCalls.FreeTokenBuffer(slots[i].Pointer); released = true; }
                        else released = OwnerSecurityCalls.CloseToken(slots[i].Pointer);
                        if (!released) failures[failed++] = i;
                    }
                    catch (Exception error)
                    { failures[failed++] = i; if (originalFailure == null) originalFailure = error; }
                }
                // Failure to allocate these diagnostic copies cannot enable retry.
                outcome = new OwnerSecurityOutcome(failureCode, readBack, acquired, unique,
                    attempts, Prefix(failures, failed), Prefix(aliases, alias),
                    Prefix(uncertainSlots, uncertain));
                return outcome;
            }
        }

        internal Exception OriginalFailure { get { return originalFailure; } }
        private static int[] Prefix(int[] values, int count)
        { int[] result = new int[count]; Array.Copy(values, result, count); return result; }
    }
}
