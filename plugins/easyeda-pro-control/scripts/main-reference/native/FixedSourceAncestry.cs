// PRIVATE state/ownership draft. A separate compile list selects the fixed fake.
using System;

namespace Easyeda.PrivatePreparation
{
    internal sealed class AncestryOutcome
    {
        internal readonly bool Prepared, CleanupDeferred, AllResourcesReleased, Unresolved, LeaseOutstanding, StorageReleased;
        internal readonly int OwnedHandles, CloseAttempts, CloseFailures, CleanupErrors;
        internal readonly Exception Failure;
        internal readonly bool NativeFilesystemQualified = false, PathnameHandoffAuthorized = false,
            ExecutionAuthorized = false;
        internal AncestryOutcome(bool prepared, bool deferred, bool released, bool unresolved, bool leased, bool storage,
            int owned, int attempts, int failures, int errors, Exception failure)
        { Prepared = prepared; CleanupDeferred = deferred; AllResourcesReleased = released;
          Unresolved = unresolved; LeaseOutstanding = leased; StorageReleased = storage;
          OwnedHandles = owned; CloseAttempts = attempts; CloseFailures = failures;
          CleanupErrors = errors; Failure = failure; }
    }
    internal sealed class LayoutAnchorLease
    {
        private readonly FixedSourceAncestry owner;
        internal LayoutAnchorLease(FixedSourceAncestry value) { owner = value; }
        internal IntPtr BorrowAnchor() { return owner.BorrowLease(this); }
        internal AncestryObservation ObserveAnchor() { return owner.ObserveLease(this); }
        internal bool CloseFromLayout() { return owner.CloseLease(this); }
    }
    internal sealed class FixedSourceAncestry
    {
        private readonly object sync = new object();
        private readonly AncestryCalls backend = new AncestryCalls();
        private readonly AncestryAcquisition[] acquisitions = new AncestryAcquisition[AncestryData.Slots];
        private readonly AncestryObservation[] facts = new AncestryObservation[AncestryData.Slots];
        private readonly IntPtr[] handles = new IntPtr[AncestryData.Slots];
        private readonly bool[] closeAttempted = new bool[AncestryData.Slots], closed = new bool[AncestryData.Slots];
        private readonly Exception[] cleanupErrors = new Exception[AncestryData.Slots + 2];
        private readonly AncestryQuery query = new AncestryQuery();
        private readonly LayoutAnchorLease lease;
        private byte[] expectedOwner;
        private bool consumed, active, prepared, settlement, unresolved, storageStarted, leaseRequested, leaseIssued;
        private int scratchSlot = -1, runtimeSlot = -1, localesSlot = -1;
        private int ownedCount, attempts, failedCloses, cleanupCount;
        private Exception originalFailure;
        private AncestryOutcome outcome;

        internal FixedSourceAncestry()
        {
            for (int i = 0; i < acquisitions.Length; i++) acquisitions[i] = new AncestryAcquisition();
            lease = new LayoutAnchorLease(this);
        }
        internal Exception OriginalFailure { get { return originalFailure; } }
        internal Exception CleanupError(int index)
        { lock (sync) { AncestryData.Need(index >= 0 && index < cleanupCount, "ancestry-cleanup-index"); return cleanupErrors[index]; } }
        private void Remember(Exception error) { if (originalFailure == null) originalFailure = error; }
        private void CleanupFailure(Exception error)
        {
            // At most seventy handles and one storage attempt, all once-only.
            if (cleanupCount < cleanupErrors.Length) cleanupErrors[cleanupCount++] = error;
            else unresolved = true;
            Remember(error);
        }
        private void Ready()
        { AncestryData.Need(prepared && !settlement && !active && !unresolved && originalFailure == null,
            "ancestry-not-ready"); }
        internal void PrepareOnce()
        {
            lock (sync)
            {
                AncestryData.Need(!consumed && !settlement && !active, "ancestry-consumed");
                consumed = true; active = true;
                try
                {
                    // The selected fixed backend admits the host before acquisition.
                    backend.AdmitFixedHost();
                    storageStarted = true;
                    try { backend.PrepareStorage(); }
                    catch { unresolved = true; throw; }
                    try { expectedOwner = backend.BindProcessOwner(); }
                    catch { unresolved = true; throw; }
                    AncestryData.OwnerSid(expectedOwner); expectedOwner = (byte[])expectedOwner.Clone();
                    AncestryPath local = AncestryData.Discovery(backend.DiscoverLocalApplicationData());
                    AncestryPath program = AncestryData.Discovery(backend.DiscoverProgramFiles());
                    RecheckIdentity();
                    scratchSlot = Walk(local, 0, "Temp", null);
                    localesSlot = Walk(program, AncestryData.ScratchSlots, "easyeda-pro", "locales");
                    runtimeSlot = localesSlot - 1;
                    RecheckCore(); prepared = true;
                }
                catch (Exception error) { Remember(error); }
                finally { active = false; }
                if (originalFailure != null) throw originalFailure;
            }
        }
        private int Walk(AncestryPath path, int first, string tail, string second)
        {
            Acquire(first, -1, path.Drive, false); int slot = first;
            AncestryData.Need(facts[slot].FinalPath.Length == 49, "ancestry-root-namespace");
            for (int i = 0; i < path.Components.Length; i++)
            { Acquire(slot + 1, slot, path.Components[i], false); slot++; }
            Acquire(slot + 1, slot, tail, false); slot++;
            if (second != null) { Acquire(slot + 1, slot, second, false); slot++; }
            AncestryData.Need(slot < (first == 0 ? AncestryData.ScratchSlots : AncestryData.ChainSlots),
                "ancestry-role-cap");
            return slot;
        }
        private void Acquire(int slot, int parent, string component, bool duplicate)
        {
            AncestryData.Need(!unresolved && slot >= 0 && slot < handles.Length &&
                !acquisitions[slot].Entered, "ancestry-acquisition-state");
            if (parent >= 0) AncestryData.Same(facts[parent], Observe(parent));
            AncestryAcquisition record = acquisitions[slot]; record.Entered = true;
            Exception callFailure = null;
            try
            {
                if (duplicate) backend.DuplicateScratch(record, handles[parent]);
                else if (parent < 0) backend.OpenRoot(record, component);
                else backend.OpenComponent(record, handles[parent], component);
            }
            catch (Exception error) { callFailure = error; Remember(error); }
            finally
            {
                unresolved |= record.Unresolved || !record.Completed;
                // A complete failure with zero output can be definite. Any
                // unacknowledged nonzero output remains retained uncertainty,
                // including -1 and a raw alias. It is never adopted or closed.
                if (!record.Confirmed && record.Handle != IntPtr.Zero) unresolved = true;
                if (record.Confirmed)
                {
                    if (!AncestryData.Handle(record.Handle)) unresolved = true;
                    else
                    {
                        bool alias = false;
                        for (int i = 0; i < handles.Length; i++)
                            if (!closed[i] && handles[i] == record.Handle) alias = true;
                        if (alias) { unresolved = true; Remember(new AncestryRefusal("ancestry-raw-alias")); }
                        else { handles[slot] = record.Handle; ownedCount++; }
                    }
                }
            }
            if (callFailure != null) throw callFailure;
            AncestryData.Need(record.Completed && record.Confirmed && !unresolved &&
                AncestryData.Handle(handles[slot]), "ancestry-acquisition-incomplete");
            AncestryObservation before = Observe(slot), after = Observe(slot);
            AncestryData.Same(before, after); facts[slot] = before;
            if (parent >= 0)
            {
                AncestryData.Same(facts[parent], Observe(parent));
                if (duplicate) AncestryData.Same(facts[parent], before);
                else AncestryData.Child(facts[parent], component, before);
            }
        }
        private AncestryObservation Observe(int slot)
        {
            AncestryData.Need(!unresolved && AncestryData.Handle(handles[slot]) && !closeAttempted[slot],
                "ancestry-query-state");
            query.Begin(); AncestryObservation value = null;
            try { value = backend.Observe(query, handles[slot]); }
            catch { if (!query.Completed) unresolved = true; throw; }
            finally { unresolved |= query.Unresolved || !query.Completed; }
            AncestryData.Need(!unresolved, "ancestry-query-unresolved");
            AncestryData.Ordinary(value); return value;
        }
        private void RecheckIdentity()
        {
            try { backend.RecheckProcessOwner(expectedOwner); }
            catch { unresolved = true; throw; }
        }
        private void RecheckCore()
        {
            RecheckIdentity();
            for (int i = 0; i < handles.Length; i++)
                if (AncestryData.Handle(handles[i]) && !closed[i]) AncestryData.Same(facts[i], Observe(i));
        }
        internal void RecheckRetainedAncestry()
        {
            lock (sync)
            {
                Ready(); active = true;
                try { RecheckCore(); }
                catch (Exception error) { Remember(error); throw; }
                finally { active = false; }
            }
        }
        // The sole prepared root is already bound to the original scratch
        // handle. Preserve its exact suffix under the rechecked drive/GUID join.
        internal string CopyScratchLaunchRoot(string preparedRoot, string nonce)
        {
            lock (sync)
            {
                Ready(); active = true;
                try
                {
                    FullLayoutData.CheckNonce(nonce);
                    RecheckCore();
                    AncestryData.Need(preparedRoot == facts[scratchSlot].FinalPath + "\\" +
                        FixedScratchLayout.RootPrefix + nonce && facts[0].FinalPath.Length == 49 &&
                        preparedRoot.StartsWith(facts[0].FinalPath, StringComparison.Ordinal),
                        "ancestry-launch-root-binding");
                    return backend.CopyScratchDrive(facts[0].FinalPath) + preparedRoot.Substring(49);
                }
                catch (Exception error) { Remember(error); throw; }
                finally { active = false; }
            }
        }
        // Compare independently obtained layout-security identity against this
        // owner's original token identity; never replace it with supplied bytes.
        internal void RequireSameProcessOwner(byte[] observedOwner)
        {
            lock (sync)
            {
                Ready(); active = true;
                try
                {
                    AncestryData.OwnerSid(observedOwner);
                    AncestryData.Need(AncestryData.Equal(expectedOwner, observedOwner), "ancestry-layout-owner-drift");
                    RecheckIdentity();
                }
                catch (Exception error) { Remember(error); throw; }
                finally { active = false; }
            }
        }
        internal LayoutAnchorLease AcquireLayoutAnchorLease()
        {
            lock (sync)
            {
                Ready(); AncestryData.Need(!leaseRequested, "ancestry-lease-consumed");
                leaseRequested = true; active = true;
                try { RecheckCore(); Acquire(AncestryData.LeaseSlot, scratchSlot, null, true); leaseIssued = true; return lease; }
                catch (Exception error) { Remember(error); throw; }
                finally { active = false; }
            }
        }
        internal IntPtr BorrowLease(LayoutAnchorLease value)
        {
            lock (sync)
            {
                Ready(); AncestryData.Need(Object.ReferenceEquals(value, lease) && leaseIssued &&
                    !closeAttempted[AncestryData.LeaseSlot], "ancestry-lease-state");
                return handles[AncestryData.LeaseSlot];
            }
        }
        // Immutable facts of this original lease, not a second pathname lookup.
        internal AncestryObservation ObserveLease(LayoutAnchorLease value)
        {
            lock (sync)
            {
                Ready(); AncestryData.Need(Object.ReferenceEquals(value, lease) && leaseIssued &&
                    !closeAttempted[AncestryData.LeaseSlot], "ancestry-lease-state");
                active = true;
                try { RecheckCore(); return facts[AncestryData.LeaseSlot]; }
                catch (Exception error) { Remember(error); throw; }
                finally { active = false; }
            }
        }
        internal bool CloseLease(LayoutAnchorLease value)
        {
            lock (sync)
            {
                AncestryData.Need(Object.ReferenceEquals(value, lease) && leaseIssued && !active && !settlement &&
                    !unresolved && !closeAttempted[AncestryData.LeaseSlot], "ancestry-lease-close-state");
                active = true;
                try { CloseSlot(AncestryData.LeaseSlot); return closed[AncestryData.LeaseSlot]; }
                finally { active = false; }
            }
        }
        internal IntPtr BorrowRuntimeSourceParent(int role)
        {
            lock (sync)
            {
                Ready(); AncestryData.Need(role >= 0 && role < 18, "ancestry-source-role");
                return handles[role == 16 ? localesSlot : runtimeSlot];
            }
        }
        internal void RequireNotAncestorHandle(IntPtr candidate)
        {
            lock (sync)
            {
                Ready(); AncestryData.Need(AncestryData.Handle(candidate), "ancestry-file-handle");
                for (int i = 0; i < handles.Length; i++)
                    AncestryData.Need(closed[i] || candidate != handles[i], "ancestry-file-raw-alias");
            }
        }
        internal void RetainForUnresolvedDependentCall()
        {
            lock (sync)
            { AncestryData.Need(!settlement && !active, "ancestry-retention-after-close"); unresolved = true; }
        }
        private void CloseSlot(int slot)
        {
            if (!AncestryData.Handle(handles[slot]) || closeAttempted[slot]) return;
            closeAttempted[slot] = true; attempts++;
            try
            {
                if (backend.Close(handles[slot])) closed[slot] = true;
                else { failedCloses++; CleanupFailure(new AncestryRefusal("ancestry-close-failed")); }
            }
            catch (Exception error) { failedCloses++; CleanupFailure(error); }
        }
        internal AncestryOutcome CloseOwnedResources()
        {
            lock (sync)
            {
                if (outcome != null) return outcome;
                AncestryData.Need(!active && !settlement, "ancestry-close-active-or-consumed");
                settlement = true;
                bool deferred = unresolved || leaseIssued && !closed[AncestryData.LeaseSlot];
                if (!deferred)
                {
                    for (int i = handles.Length - 1; i >= 0; i--) CloseSlot(i);
                    if (storageStarted)
                        try { backend.CloseStorage(); } catch (Exception error) { CleanupFailure(error); }
                }
                bool released = !deferred && cleanupCount == 0 && (!storageStarted || backend.StorageReleased);
                for (int i = 0; i < handles.Length; i++)
                    if (AncestryData.Handle(handles[i]) && !closed[i]) released = false;
                outcome = new AncestryOutcome(prepared, deferred, released, unresolved,
                    leaseIssued && !closed[AncestryData.LeaseSlot], !storageStarted || backend.StorageReleased,
                    ownedCount, attempts, failedCloses, cleanupCount, originalFailure);
                return outcome;
            }
        }
    }
}
