// PRIVATE SOURCE-ONLY RETAINED SUCCESSOR. No launch capability or production anchor admission.
using System;

namespace Easyeda.PrivatePreparation
{
    internal sealed class FullLayoutOutcome
    {
        internal readonly string Profile = "private.retained-fixed-layout.v1";
        internal readonly bool Prepared, CleanupDeferred, AllResourcesReleased;
        internal readonly int UsedFrames, CleanupErrors;
        internal readonly string Failure;
        internal readonly bool NativeStatusObserved, Win32ErrorObserved;
        internal readonly int NativeStatus, Win32Error;
        internal readonly LayoutOutcome Layout;
        internal readonly bool NativeFilesystemQualified = false, PathnameHandoffAuthorized = false,
            ExecutionAuthorized = false;
        internal FullLayoutOutcome(bool prepared, bool deferred, bool released, int frames, int errors, LayoutOutcome layout,
            string failure, bool statusObserved, int status, bool errorObserved, int error)
        { Prepared = prepared; CleanupDeferred = deferred; AllResourcesReleased = released;
          UsedFrames = frames; CleanupErrors = errors; Layout = layout; Failure = failure;
          NativeStatusObserved = statusObserved; NativeStatus = status;
          Win32ErrorObserved = errorObserved; Win32Error = error; }
    }

    internal sealed class FixedLayoutContext
    {
        private readonly object sync = new object();
        private readonly FixedScratchLayout layout = new FixedScratchLayout();
        private readonly FixedLayoutBackend backend;
        private readonly FixedSourceAncestry ancestry;
        private LayoutAnchorLease anchorLease;
        private bool anchorTransferred, anchorCloseAttempted, anchorClosed, securityStarted;
        private readonly bool[] closeSucceeded = new bool[23];
        private readonly FixedOwnerSecurity security = new FixedOwnerSecurity();
        private readonly NativeRelativeCreateFrame[] frames = new NativeRelativeCreateFrame[22];
        private readonly NativeFrameOutcome[] outcomes = new NativeFrameOutcome[22];
        private readonly IntPtr[] handles = new IntPtr[23];
        private readonly Exception[] cleanupErrors = new Exception[50];
        private readonly bool[] closeAttempted = new bool[23];
        private byte[] expectedOwner;
        private OwnerSecurityOutcome securityOutcome;
        private readonly string nonce;
        private bool consumed, preparing, closing, inspecting, settlementStarted, frameActive, unresolved, prepared, errorOverflow;
        private int usedFrames, cleanupErrorCount;
        private bool nativeStatusObserved;
        private int nativeStatus;
        private Exception originalFailure;
        private LayoutOutcome layoutOutcome;
        private FullLayoutOutcome outcome;
        [ThreadStatic] private static FixedLayoutContext current;

        // All owners and cleanup bookkeeping exist before native dispatch.
        internal FixedLayoutContext(string compilerNonce, FixedSourceAncestry originalAncestry)
        {
            FullLayoutData.CheckNonce(compilerNonce); nonce = compilerNonce;
            FullLayoutData.Need(originalAncestry != null, "retained-layout-original-ancestry");
            ancestry = originalAncestry; backend = new FixedLayoutBackend(compilerNonce);
            for (int i = 0; i < frames.Length; i++) frames[i] = new NativeRelativeCreateFrame();
        }
        internal string Nonce { get { return nonce; } }
        // Pure construction-time binding, not a borrow or lifetime reservation.
        internal void RequireOriginalAncestry(FixedSourceAncestry original)
        { FullLayoutData.Need(Object.ReferenceEquals(original, ancestry), "retained-layout-ancestry-binding"); }
        internal Exception OriginalFailure { get { return originalFailure; } }
        internal Exception CleanupError(int index)
        { FullLayoutData.Need(index >= 0 && index < cleanupErrorCount, "full-layout-error-index"); return cleanupErrors[index]; }
        internal static FixedLayoutContext Current()
        {
            FullLayoutData.Need(current != null && (current.preparing || current.closing || current.inspecting), "full-layout-outside-owner");
            return current;
        }
        internal static void RequireFrame()
        {
            FixedLayoutContext owner = Current();
            FullLayoutData.Need(owner.preparing && owner.frameActive && !owner.unresolved && !owner.backend.Unresolved,
                "full-layout-outside-frame");
        }
        internal static void RecordNativeStatus(int status)
        { RequireFrame(); current.nativeStatus = status; current.nativeStatusObserved = true; }
        private void Remember(Exception error) { if (originalFailure == null) originalFailure = error; }
        private void CleanupFailure(Exception error)
        {
            if (cleanupErrorCount < cleanupErrors.Length) cleanupErrors[cleanupErrorCount++] = error;
            else errorOverflow = true;
            Remember(error);
        }
        private void BindSecurity()
        {
            byte[] descriptor = null;
            try { security.Prepare(); descriptor = security.TakePreparedDescriptorForFrame(); }
            catch (Exception error) { Remember(security.OriginalFailure ?? error); }
            finally
            {
                try { securityOutcome = security.CloseOwnedResources(); }
                catch (Exception error) { unresolved = true; CleanupFailure(error); }
            }
            if (securityOutcome == null || !securityOutcome.AllOwnedResourcesReleased) unresolved = true;
            if (originalFailure != null) throw originalFailure;
            FullLayoutData.Need(securityOutcome != null && securityOutcome.Failure == null &&
                securityOutcome.ConstructedDescriptorReadBack && securityOutcome.AllOwnedResourcesReleased,
                "full-layout-security-binding");
            expectedOwner = OwnerSecurityData.ReadSid(descriptor, checked((int)FullLayoutData.U32(descriptor, 4)));
            ancestry.RequireSameProcessOwner(expectedOwner);
        }
        // Preparation no longer closes the layout. The fixed session retains
        // this owner until its file owner and original process/Job have settled.
        internal void PrepareRetained()
        {
            lock (sync)
            {
                FullLayoutData.Need(!consumed && !settlementStarted && current == null,
                    "retained-layout-consumed-or-nested");
                consumed = true; current = this; preparing = true;
                try
                {
                    // Retain before later fallible work. If acquisition itself
                    // throws, its unreturned duplicate remains ancestry-owned.
                    anchorLease = ancestry.AcquireLayoutAnchorLease();
                    securityStarted = true; BindSecurity(); backend.Prepare();
                    layout.Prepare(nonce); prepared = true;
                }
                catch (Exception error) { Remember(error); }
                finally { preparing = false; ObserveUnresolved(); current = null; }
                if (originalFailure != null) throw originalFailure;
                FullLayoutData.Need(prepared && !unresolved, "retained-layout-preparation-incomplete");
            }
        }
        private void ObserveUnresolved()
        {
            unresolved |= backend.Unresolved;
            for (int i = 0; i < usedFrames; i++)
                if (outcomes[i] == null || outcomes[i].Unresolved || !outcomes[i].AllPreparationResourcesReleased)
                    unresolved = true;
        }
        private void RequireRetained()
        {
            FullLayoutData.Need(prepared && !settlementStarted && !preparing && !closing && !inspecting &&
                !unresolved && !backend.Unresolved && originalFailure == null && outcome == null,
                "retained-layout-not-ready");
        }
        internal IntPtr BorrowPreparedDirectory(LayoutRole role)
        {
            lock (sync)
            {
                RequireRetained(); int index = (int)role;
                FullLayoutData.Need(index >= 0 && index < 11, "retained-layout-role");
                int slot = 1 + index * 2;
                FullLayoutData.Need(!closeAttempted[slot] && FixedScratchLayout.ValidHandle(handles[slot]),
                    "retained-layout-parent-closed");
                return handles[slot];
            }
        }
        // A file owner must reject aliases with every retained directory and
        // guard, not just the parent handles it borrowed. This does not reserve
        // a call lifetime; the fixed session serializes this check through I/O.
        internal void RequireNotLayoutHandle(IntPtr candidate)
        {
            lock (sync)
            {
                RequireRetained();
                FullLayoutData.Need(FixedScratchLayout.ValidHandle(candidate), "retained-layout-invalid-file-handle");
                for (int i = 0; i < handles.Length; i++)
                    FullLayoutData.Need(candidate != handles[i], "retained-layout-cross-owner-handle-alias");
            }
        }
        internal byte[] CopyExpectedOwner()
        {
            lock (sync) { RequireRetained(); return (byte[])expectedOwner.Clone(); }
        }
        internal void RecheckPreparedLayout()
        {
            lock (sync)
            {
                RequireRetained(); FullLayoutData.Need(current == null, "retained-layout-nested");
                current = this; inspecting = true;
                try { ancestry.RecheckRetainedAncestry(); layout.RecheckRetained(); }
                catch (Exception error) { Remember(error); throw; }
                finally { inspecting = false; ObserveUnresolved(); current = null; }
            }
        }

        internal PreparedDirectorySnapshot CapturePreparedDirectoryNames()
        {
            lock (sync)
            {
                RequireRetained(); FullLayoutData.Need(current == null, "retained-layout-nested");
                current = this; inspecting = true;
                try
                {
                    ancestry.RecheckRetainedAncestry(); layout.RecheckRetained();
                    PreparedDirectoryBinding[] result = new PreparedDirectoryBinding[11];
                    for (int role = 0; role < result.Length; role++)
                    {
                        int slot = 1 + role * 2;
                        FullLayoutData.Need(!closeAttempted[slot] && FixedScratchLayout.ValidHandle(handles[slot]),
                            "retained-layout-snapshot-closed");
                        result[role] = new PreparedDirectoryBinding((LayoutRole)role, handles[slot],
                            backend.CopyPreparedDirectoryName((LayoutRole)role));
                    }
                    return new PreparedDirectorySnapshot(this, ancestry, nonce, result);
                }
                catch (Exception error) { Remember(error); throw; }
                finally { inspecting = false; ObserveUnresolved(); current = null; }
            }
        }
        // A possibly outstanding file call owns its parents. This one-way latch
        // cannot be cleared by a later successful observation or a new caller.
        internal void RetainForUnresolvedFileCall()
        {
            lock (sync)
            {
                FullLayoutData.Need(!settlementStarted && !preparing && !closing && !inspecting,
                    "retained-layout-retention-after-settlement");
                unresolved = true;
            }
        }
        internal FullLayoutOutcome CloseOwnedResources()
        {
            lock (sync)
            {
                if (outcome != null) return outcome;
                FullLayoutData.Need(!settlementStarted && !preparing && !inspecting && current == null,
                    "retained-layout-settlement-consumed-or-active");
                settlementStarted = true; current = this; closing = true;
                try
                {
                    ObserveUnresolved();
                    if (!unresolved)
                    {
                        try { layoutOutcome = layout.CloseOwnedResources(); }
                        catch (Exception error) { CleanupFailure(error); }
                        // An early refusal can precede slot-zero transfer.
                        if (anchorLease != null && !anchorTransferred)
                            CloseOriginalLease();
                        try { backend.CloseStorage(); }
                        catch (Exception error) { CleanupFailure(error); }
                    }
                }
                finally { closing = false; current = null; }
                bool leaseOutstanding = anchorLease != null && !anchorClosed;
                bool released = !unresolved && !leaseOutstanding && !errorOverflow && cleanupErrorCount == 0 &&
                    (!securityStarted || securityOutcome != null && securityOutcome.AllOwnedResourcesReleased) && backend.StorageReleased &&
                    layoutOutcome != null && layoutOutcome.AllReturnedHandlesClosed;
                outcome = new FullLayoutOutcome(prepared, unresolved || leaseOutstanding, released, usedFrames,
                    cleanupErrorCount + (errorOverflow ? 1 : 0), layoutOutcome, FailureCode(),
                    nativeStatusObserved, nativeStatus, backend.Win32ErrorObserved, backend.Win32Error);
                return outcome;
            }
        }
        private string FailureCode()
        {
            if (originalFailure == null) return "none";
            LayoutRefusal refusal = originalFailure as LayoutRefusal;
            string code = refusal == null ? "full-layout-observation-failed" : refusal.Code;
            if (code == null || code.Length == 0 || code.Length > 96) return "full-layout-observation-failed";
            for (int i = 0; i < code.Length; i++)
                if (!(code[i] >= 'a' && code[i] <= 'z') && code[i] != '-') return "full-layout-observation-failed";
            return code;
        }
        internal void RequirePreparation()
        { FullLayoutData.Need((preparing || inspecting && prepared) && expectedOwner != null && !unresolved && !backend.Unresolved,
            "full-layout-preparation-profile"); }
        internal void AcquireOriginalAnchor(out IntPtr owned)
        {
            owned = IntPtr.Zero; RequirePreparation();
            FullLayoutData.Need(anchorLease != null && !anchorTransferred && handles[0] == IntPtr.Zero &&
                usedFrames == 0, "full-layout-anchor-slot");
            try
            {
                owned = anchorLease.BorrowAnchor(); handles[0] = owned; anchorTransferred = true;
                AncestryObservation expected = anchorLease.ObserveAnchor();
                backend.BindOriginalAnchor(owned, expected);
            }
            catch (Exception error) { Remember(error); throw; }
        }
        internal CreateReply Create(RelativeCreate request, out IntPtr owned)
        {
            owned = IntPtr.Zero; RequirePreparation();
            FullLayoutData.Need(preparing && !inspecting, "retained-layout-create-after-preparation"); int index = usedFrames;
            FullLayoutData.Need(index < 22 && request != null && (int)request.Role == index / 2 &&
                request.Directory == ((index & 1) == 0) && request.Component == FullLayoutData.Component(index, nonce) &&
                request.Parent == handles[FullLayoutData.ParentSlot(index)], "full-layout-fixed-create-order");
            usedFrames++; frameActive = true; nativeStatusObserved = false; nativeStatus = 0;
            CreateReply reply = new CreateReply(0, 0); Exception failure = null;
            try { reply = frames[index].Attempt(request, out owned); }
            catch (Exception error) { failure = error; Remember(error); }
            finally
            {
                frameActive = false; handles[index + 1] = owned;
                // A successful raw output may still be a foreign ancestor.
                // Refuse before a same-handle query or any cleanup dispatch.
                if (FixedScratchLayout.ValidHandle(owned))
                    try { ancestry.RequireNotAncestorHandle(owned); }
                    catch (Exception error)
                    {
                        unresolved = true; Remember(error);
                        if (failure == null) failure = error;
                    }
                try { outcomes[index] = frames[index].CloseFrameStorage(); }
                catch (Exception error) { unresolved = true; CleanupFailure(error); if (failure == null) failure = error; }
            }
            if (outcomes[index] == null || outcomes[index].Unresolved || !outcomes[index].AllPreparationResourcesReleased)
                unresolved = true;
            if (failure != null) throw failure;
            FullLayoutData.Need(!unresolved, "full-layout-frame-uncertain");
            return reply;
        }
        private int Slot(IntPtr handle)
        {
            FullLayoutData.Need(FixedScratchLayout.ValidHandle(handle), "full-layout-handle");
            for (int i = 0; i < handles.Length; i++) if (handles[i] == handle) return i;
            throw new LayoutRefusal("full-layout-unowned-handle");
        }
        internal HandleObservation Observe(IntPtr handle)
        {
            RequirePreparation(); int slot = Slot(handle);
            FullLayoutData.Need(!closeAttempted[slot], "full-layout-observe-after-close");
            try { return backend.Observe(handle, slot, expectedOwner); }
            catch (Exception error) { Remember(error); throw; }
        }
        private bool CloseOriginalLease()
        {
            FullLayoutData.Need(anchorLease != null && !anchorCloseAttempted, "full-layout-lease-close-twice");
            for (int i = 1; i < handles.Length; i++)
                if (FixedScratchLayout.ValidHandle(handles[i]) && !closeSucceeded[i])
                {
                    CleanupFailure(new LayoutRefusal("full-layout-lease-child-close-deferred"));
                    return false;
                }
            anchorCloseAttempted = true;
            // Cleanup must not borrow/recheck through the readiness gate: a
            // completed preparation error may already be retained by ancestry.
            try
            {
                anchorClosed = anchorLease.CloseFromLayout();
                if (!anchorClosed) CleanupFailure(new LayoutRefusal("full-layout-lease-close-failed"));
            }
            catch (Exception error) { CleanupFailure(error); }
            return anchorClosed;
        }
        internal bool Close(IntPtr handle)
        {
            FullLayoutData.Need(closing && !unresolved, "full-layout-close-deferred");
            int slot = Slot(handle); FullLayoutData.Need(!closeAttempted[slot], "full-layout-close-twice");
            closeAttempted[slot] = true;
            if (slot == 0) { closeSucceeded[0] = CloseOriginalLease(); return closeSucceeded[0]; }
            try
            {
                closeSucceeded[slot] = backend.CloseHandle(handle);
                if (!closeSucceeded[slot]) CleanupFailure(new LayoutRefusal("full-layout-handle-close-failed"));
                return closeSucceeded[slot];
            }
            catch (Exception error) { CleanupFailure(error); throw; }
        }
    }

    // Compile-time bridge only. The original LayoutCalls.Refused.cs is untouched.
    internal static class LayoutCalls
    {
        internal static void RequirePreparationProfile() { FixedLayoutContext.Current().RequirePreparation(); }
        internal static void AcquireOriginalAnchor(out IntPtr handle) { FixedLayoutContext.Current().AcquireOriginalAnchor(out handle); }
        internal static CreateReply CreateRelative(RelativeCreate request, out IntPtr handle)
        { return FixedLayoutContext.Current().Create(request, out handle); }
        internal static HandleObservation Observe(IntPtr handle) { return FixedLayoutContext.Current().Observe(handle); }
        internal static bool Close(IntPtr handle) { return FixedLayoutContext.Current().Close(handle); }
    }
}
