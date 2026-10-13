// PRIVATE fixed-role writer/source/child backend. Complete-session child admission stays refused.
using System;
using System.Text;

namespace Easyeda.PrivatePreparation
{
    internal sealed class FixedFileBackend
    {
        private sealed class Endpoint
        {
            internal IntPtr Handle;
            internal bool Consumed, Acquired, CloseAttempted, Closed;
        }
        private sealed class SourceState
        {
            internal FixedSourceOpenRecord Record;
            internal IntPtr Parent;
            internal FileFacts Facts;
            internal string Path;
            internal bool Observed;
        }
        private sealed class ChildState
        {
            internal FixedChildOpenRecord Record;
            internal IntPtr Parent;
            internal FileFacts Facts;
            internal string Path;
            internal byte[] Descriptor;
            internal bool Observed;
        }
        private readonly ChildState[] children = new ChildState[5];
        private readonly FixedChildOpenRecord[] childRecords = new FixedChildOpenRecord[FixedChildPollBudget.Maximum + 5];
        private FixedChildOpenRecord activeChild;
        private int childRecordCount;
        internal int ChildRecordCount { get { return childRecordCount; } }
        internal FixedChildOpenRecord ChildRecord(int index)
        { FixedFileData.Need(index >= 0 && index < childRecordCount, "child-record-index"); return childRecords[index]; }
        internal FixedFileCall ActiveCall { get { return activeChild == null ? active == null ? null : active.Call : activeChild.Call; } }
        private readonly FixedFileSession session;
        private readonly FixedLayoutContext context;
        private readonly FixedSourceAncestry ancestry;
        private readonly Endpoint[] endpoints = new Endpoint[FixedFileData.SlotCount];
        private readonly SourceState[] sources = new SourceState[FixedFileData.RuntimeCount];
        private readonly NativeFixedFileCreateFrame[] frames = new NativeFixedFileCreateFrame[FixedFileData.CreatedCount];
        private readonly IntPtr[] parents = new IntPtr[FixedFileData.CreatedCount];
        private readonly string[] paths = new string[FixedFileData.CreatedCount];
        private readonly long[] written = new long[FixedFileData.CreatedCount];
        private readonly bool[] flushed = new bool[FixedFileData.CreatedCount], verified = new bool[FixedFileData.CreatedCount];
        private readonly FixedFileIoRecord[] records = new FixedFileIoRecord[FixedFileBackendPolicy.FailedMaximum];
        private byte[] expectedOwner;
        private FixedFileIoRecord active;
        private int retained, acquisitions;
        private long calls;
        private bool profileBound, frameActive, sourceFrameActive, acquisitionUncertain;
        internal long CallCount { get { return calls; } }
        internal int RetainedRecordCount { get { return retained; } }
        internal FixedFileIoRecord ActiveRecord { get { return active; } }
        internal FixedFileIoRecord RetainedRecord(int index)
        { FixedFileData.Need(index >= 0 && index < retained, "file-backend-record-index"); return records[index]; }
        internal bool AllStorageReleased
        {
            get
            {
                if (active != null || activeChild != null) return false;
                for (int i = 0; i < childRecordCount; i++)
                    if (childRecords[i].Outcome == null || !childRecords[i].Outcome.AllFrameStorageReleased) return false;
                for (int i = 0; i < retained; i++) if (!records[i].StorageReleased) return false;
                return true;
            }
        }
        internal FixedFileBackend(FixedFileSession binding, FixedLayoutContext layout, FixedSourceAncestry source)
        {
            session = binding; context = layout; ancestry = source;
            for (int i = 0; i < endpoints.Length; i++) endpoints[i] = new Endpoint();
            for (int i = 0; i < sources.Length; i++) sources[i] = new SourceState();
            for (int i = 0; i < children.Length; i++) children[i] = new ChildState();
            for (int i = 0; i < frames.Length; i++) frames[i] = new NativeFixedFileCreateFrame();
            for (int i = 0; i < records.Length; i++) records[i] = new FixedFileIoRecord();
        }
        private void Binding(FixedLayoutContext layout, FixedSourceAncestry source)
        {
            FixedFileData.Need(Object.ReferenceEquals(FixedFileSession.Current(), session) &&
                Object.ReferenceEquals(layout, context) && Object.ReferenceEquals(source, ancestry),
                "file-backend-owner-binding");
        }
        internal void RequireProfile()
        {
            Binding(context, ancestry);
            FixedFileData.Need(!profileBound && active == null, "file-backend-profile-consumed");
            context.RecheckPreparedLayout(); ancestry.RecheckRetainedAncestry();
            expectedOwner = context.CopyExpectedOwner();
            FixedFileData.Need(expectedOwner != null && expectedOwner.Length > 0 && expectedOwner.Length <= 68,
                "file-backend-owner-sid"); profileBound = true;
        }

        // Pure copy after the owning session's same-handle reproof. Endpoint
        // identity is bound to the file owner's facts; no second facts cache.
        internal string[] CopyPreparedFileNames(PreparedSealSnapshot seals)
        {
            Binding(context, ancestry);
            FixedFileData.Need(profileBound && active == null && !acquisitionUncertain && seals != null &&
                Object.ReferenceEquals(seals.Owner, session.Files) &&
                Object.ReferenceEquals(seals.Context, context) && Object.ReferenceEquals(seals.Ancestry, ancestry) &&
                seals.Count == FixedFileData.PreparedCount, "file-backend-launch-binding");
            string[] result = new string[FixedFileData.PreparedCount];
            for (int role = 0; role < result.Length; role++)
            {
                PreparedSealBinding seal = seals.At(role); Endpoint endpoint = endpoints[role * 3 + 2];
                FixedFileData.Need(seal.Role == role && endpoint.Consumed && endpoint.Acquired &&
                    !endpoint.CloseAttempted && !endpoint.Closed && endpoint.Handle == seal.Handle &&
                    !String.IsNullOrEmpty(paths[role]), "file-backend-launch-endpoint");
                result[role] = paths[role];
            }
            return result;
        }
        internal bool RequiresParentRetention(FixedFileOutcome result)
        {
            return result == null || result.RetainedSlots.Count != 0 || acquisitionUncertain ||
                acquisitions != result.AcquiredHandles;
        }
        internal void RequireFrame()
        {
            Binding(context, ancestry);
            FixedFileData.Need(frameActive && active != null && active.Call.Operation == FileOperation.Create &&
                Object.ReferenceEquals(active.Frame, frames[active.Call.Role]), "file-backend-outside-frame");
        }
        internal void BeginCreate() { RequireFrame(); active.CreateEntered = true; }
        internal void RequireSourceFrame()
        {
            Binding(context, ancestry);
            FixedFileData.Need(sourceFrameActive && active != null && active.Call.Operation == FileOperation.Source &&
                active.Call.Role >= 0 && active.Call.Role < FixedFileData.RuntimeCount &&
                active.Call.Slot == 87 + active.Call.Role, "file-backend-outside-source-frame");
            FixedSourceOpenRecord source = active.Call.SourceOpenRecord;
            FixedFileData.Need(source != null && Object.ReferenceEquals(source.Context, context) &&
                Object.ReferenceEquals(source.Ancestry, ancestry) &&
                (active.SourceRecord == null || Object.ReferenceEquals(active.SourceRecord, source)),
                "file-backend-source-record-binding");
            // The actual record is published by FixedSourceOpenRecord before
            // this guard is reached at the first allocation or native entry.
            active.SourceRecord = source;
        }
        internal void RequireReadFrame()
        {
            if (activeChild == null) { RequireSourceFrame(); return; }
            Binding(context, ancestry);
            FixedFileCall call = activeChild.Call;
            FixedFileData.Need(active == null && FixedChildOpenRecord.Acquisition(call.Operation) &&
                call.Role >= 29 && call.Role <= 33 && call.Slot == 105 + call.Role - 29 &&
                Object.ReferenceEquals(call.ChildOpenRecord, activeChild) &&
                Object.ReferenceEquals(activeChild.Context, context) &&
                Object.ReferenceEquals(activeChild.Ancestry, ancestry), "child-frame-binding");
        }
        internal void RecordCreateStatus(int status)
        { RequireFrame(); active.CreateReturned = true; active.NativeStatus = status; active.NativeStatusObserved = true; }
        internal void RecordCreateOutput(IntPtr value)
        { RequireFrame(); active.NativeHandleReturned = true; active.NativeHandleValue = value.ToInt64(); }
        private void ExcludeAliases(IntPtr raw, int ownSlot)
        {
            // Both original concrete owners are checked before any query, I/O,
            // close or adoption. Numeric reuse of acknowledged closed slots is allowed.
            ancestry.RequireNotAncestorHandle(raw); context.RequireNotLayoutHandle(raw);
            for (int i = 0; i < endpoints.Length; i++)
                FixedFileData.Need(i == ownSlot || !endpoints[i].Acquired || endpoints[i].Closed ||
                    endpoints[i].Handle != raw, "file-backend-live-file-alias");
        }
        private void Validate(FixedFileCall call)
        {
            FixedFileData.Need(profileBound && call != null &&
                FixedFileBackendPolicy.Same(call.ExpectedOwner, expectedOwner), "file-backend-call-binding");
            int part = FixedFileBackendPolicy.Part(call); Endpoint target = endpoints[call.Slot];
            bool sourceSlot = part == 3, childSlot = part == 4;
            bool acquisition = call.Operation == FileOperation.Source || call.Operation == FileOperation.Create || call.Operation == FileOperation.Transition ||
                call.Operation == FileOperation.Seal;
            if (call.Operation == FileOperation.Source)
            {
                FixedFileData.Need(sourceSlot && !target.Consumed && call.Parent == IntPtr.Zero &&
                    call.Handle == IntPtr.Zero && call.OtherSlot == -1 && call.OtherHandle == IntPtr.Zero &&
                    call.SourceOpenRecord == null, "file-backend-source-acquisition-shape");
            }
            else if (acquisition)
            {
                FixedFileData.Need(!sourceSlot && !childSlot, "file-backend-writer-acquisition-slot");
                IntPtr parent = context.BorrowPreparedDirectory(FixedFileData.Parent(call.Role));
                FixedFileData.Need(call.Parent == parent && FixedFileData.Valid(parent) && !target.Consumed &&
                    call.Handle == IntPtr.Zero, "file-backend-acquisition-binding");
                if (call.Operation == FileOperation.Create) parents[call.Role] = parent;
                else FixedFileData.Need(parent == parents[call.Role], "file-backend-parent-drift");
            }
            else
            {
                FixedFileData.Need(call.Parent == IntPtr.Zero && target.Acquired && !target.Closed &&
                    target.Handle == call.Handle && !target.CloseAttempted, "file-backend-owned-handle");
                // Cleanup uses retained known endpoints, without re-borrowing a
                // latched owner. Alias exclusion happened before slot adoption.
                if (call.Operation != FileOperation.Close) ExcludeAliases(call.Handle, call.Slot);
            }
            if (call.Operation == FileOperation.Source) { }
            else if (call.Operation == FileOperation.Create)
                FixedFileData.Need(part == 0 && call.OtherSlot == -1 && call.OtherHandle == IntPtr.Zero,
                    "file-backend-create-order");
            else if (call.Operation == FileOperation.Transition || call.Operation == FileOperation.Seal)
            {
                int other = call.Role * 3 + (call.Operation == FileOperation.Seal ? 1 : 0);
                Endpoint previous = endpoints[other];
                FixedFileData.Need(part == (call.Operation == FileOperation.Seal ? 2 : 1) &&
                    call.OtherSlot == other && call.OtherHandle == previous.Handle && previous.Acquired &&
                    !previous.CloseAttempted && !previous.Closed, "file-backend-reopen-endpoint");
                if (call.Operation == FileOperation.Transition)
                    FixedFileData.Need(flushed[call.Role] && verified[call.Role], "file-backend-transition-order");
                else FixedFileData.Need(endpoints[call.Role * 3].Closed, "file-backend-seal-writer-live");
                ExcludeAliases(call.OtherHandle, other);
            }
            else
            {
                FixedFileData.Need(call.OtherSlot == -1 && call.OtherHandle == IntPtr.Zero,
                    "file-backend-extra-endpoint");
                FixedFileData.Need(call.Operation == FileOperation.Observe || call.Operation == FileOperation.Write ||
                    call.Operation == FileOperation.Flush || call.Operation == FileOperation.Digest ||
                    call.Operation == FileOperation.Close || call.Operation == FileOperation.Read ||
                    call.Operation == FileOperation.SeekStart, "file-backend-operation");
            }
            if (call.Operation == FileOperation.Write)
                FixedFileData.Need(part == 0 && call.Buffer != null && call.Offset >= 0 && call.Requested > 0 &&
                    call.Requested <= FixedFileData.ChunkBytes && call.Offset <= call.Buffer.Length - call.Requested &&
                    written[call.Role] <= FixedFileData.Maximum(call.Role) - call.Requested,
                    "file-backend-write-bound");
            else if (call.Operation == FileOperation.Read)
                FixedFileData.Need((sourceSlot && sources[call.Role].Observed || childSlot && children[call.Role - 29].Observed) && call.Buffer != null &&
                    call.Offset >= 0 && call.Requested > 0 && call.Requested <= FixedFileData.ChunkBytes &&
                    call.Offset <= call.Buffer.Length - call.Requested, "file-backend-read-bound");
            else FixedFileData.Need(call.Buffer == null && call.Offset == 0 && call.Requested == 0,
                "file-backend-unexpected-buffer");
            if (call.Operation == FileOperation.Digest)
            {
                FixedFileData.Length(call.Role, call.ExpectedLength);
                FixedFileData.Need(sourceSlot ? sources[call.Role].Observed &&
                    call.ExpectedLength == sources[call.Role].Facts.Length : childSlot ?
                    children[call.Role - 29].Observed && call.ExpectedLength == children[call.Role - 29].Facts.Length :
                    (part == 0 || part == 2) && call.ExpectedLength == written[call.Role],
                    "file-backend-digest-bound");
            }
            else FixedFileData.Need(call.ExpectedLength == 0, "file-backend-unexpected-length");
            if (call.Operation == FileOperation.Flush)
            { FixedFileData.Length(call.Role, written[call.Role]); FixedFileData.Need(part == 0, "file-backend-flush-slot"); }
            if (call.Operation == FileOperation.SeekStart)
                FixedFileData.Need(sourceSlot && sources[call.Role].Observed || childSlot && children[call.Role - 29].Observed, "file-backend-seek-slot");
        }
        private void Acquisition(FixedFileIoRecord record, IntPtr raw)
        { Acquisition(record.Call, raw); }
        private void Acquisition(FixedFileCall call, IntPtr raw)
        {
            // Acquisition is published before fallible alias or metadata checks.
            call.RawHandle = raw; call.Acquired = true; call.Succeeded = true; call.CompletionKnown = true;
            acquisitions++;
            try { ExcludeAliases(raw, call.Slot); }
            catch { acquisitionUncertain = true; throw; }
            Endpoint target = endpoints[call.Slot]; target.Handle = raw; target.Acquired = true;
        }
        internal void Invoke(FixedFileCall call, FixedLayoutContext layout, FixedSourceAncestry source)
        {
            Binding(layout, source);
            FixedFileData.Need(active == null && activeChild == null && call != null, "file-backend-active");
            if (FixedChildOpenRecord.Acquisition(call.Operation)) { InvokeChild(call); return; }
            FixedFileData.Need(active == null && retained < FixedFileBackendPolicy.FailedMaximum && call != null,
                "file-backend-active-or-cap");
            // Before native entry, a validation refusal is a definite non-acquisition.
            call.CompletionKnown = true; Validate(call);
            long nextCall = checked(calls + 1);
            FixedFileIoRecord record = records[retained]; record.Reset(call); active = record;
            calls = nextCall; call.RetainedNativeStorage = record;
            call.CompletionKnown = false;
            if (call.Operation == FileOperation.Source || call.Operation == FileOperation.Create || call.Operation == FileOperation.Transition ||
                call.Operation == FileOperation.Seal) endpoints[call.Slot].Consumed = true;
            if (call.Operation == FileOperation.Close) endpoints[call.Slot].CloseAttempted = true;
            try
            {
                if (call.Operation == FileOperation.Create) Create(record);
                else if (call.Operation == FileOperation.Source) OpenSource(record);
                else
                {
                    record.Storage.Allocate();
                    switch (call.Operation)
                    {
                        case FileOperation.Transition: Reopen(record, false); break;
                        case FileOperation.Seal: Reopen(record, true); break;
                        case FileOperation.Observe: call.Facts = Observe(record); call.Succeeded = true; break;
                        case FileOperation.Write: Write(record); break;
                        case FileOperation.Read: Read(record); break;
                        case FileOperation.SeekStart: Seek(record); record.Call.Succeeded = true; break;
                        case FileOperation.Flush: Flush(record); break;
                        case FileOperation.Digest: Digest(record); break;
                        case FileOperation.Close: CloseHandle(record); break;
                        default: throw new LayoutRefusal("file-backend-operation");
                    }
                }
            }
            catch (Exception error) { record.Remember(error); }
            finally
            {
                // Attempt-all hash and unmanaged storage settlement, once each.
                try { record.CloseHash(); } catch (Exception error) { record.Remember(error); }
                try { record.Storage.Close(); }
                catch (Exception error) { record.CleanupFailure = error; record.Remember(error); }
                if (record.Storage.CleanupFailure != null)
                { record.CleanupFailure = record.Storage.CleanupFailure; record.Remember(record.CleanupFailure); }
                bool frameComplete = record.Frame == null || !record.CreateEntered ||
                    record.CreateReturned && record.NativeStatus != NativeFixedFileCreateFrame.StatusPending &&
                    (record.NativeStatus < 0 && record.NativeHandleReturned || call.Acquired && FixedFileData.Valid(call.RawHandle));
                if (call.Operation == FileOperation.Source) frameComplete = call.CompletionKnown;
                record.Pending |= record.Storage.InFlight;
                call.Pending = record.Pending;
                call.CompletionKnown = !record.Storage.InFlight && !record.AcquisitionUncertain && frameComplete;
                call.RetainedNativeStorage = record.StorageReleased ? null : (object)record;
                record.Complete = true; active = null;
                bool acquiring = call.Operation == FileOperation.Source || call.Operation == FileOperation.Create || call.Operation == FileOperation.Transition ||
                    call.Operation == FileOperation.Seal;
                if (acquiring && (!call.CompletionKnown || call.Pending ||
                    call.Succeeded && (!call.Acquired || !FixedFileData.Valid(call.RawHandle)) ||
                    !call.Succeeded && (call.Acquired || call.RawHandle != IntPtr.Zero))) acquisitionUncertain = true;
                if (record.FirstFailure != null || !call.CompletionKnown || call.Pending || !call.Succeeded ||
                    call.RetainedNativeStorage != null)
                {
                    if (record.FirstFailure == null) record.Remember(new LayoutRefusal("file-backend-incomplete"));
                    retained++; // Never reset a record reachable through failed diagnostics.
                }
            }
            if (record.FirstFailure != null) throw record.FirstFailure;
        }
        private void InvokeChild(FixedFileCall call)
        {
            // Clean Missing/Busy observations never occupy or reset the fatal
            // generic-record ledger. Each bounded child record keeps its frame.
            call.CompletionKnown = true;
            FixedFileData.Need(profileBound && FixedFileBackendPolicy.Same(call.ExpectedOwner, expectedOwner) &&
                call.Role >= 29 && call.Role <= 33 && call.Slot == 105 + call.Role - 29 &&
                call.OtherSlot == -1 && call.OtherHandle == IntPtr.Zero && call.Handle == IntPtr.Zero &&
                call.Buffer == null && call.Offset == 0 && call.Requested == 0 && call.ExpectedLength == 0 &&
                call.ChildOpenRecord == null && call.SourceOpenRecord == null &&
                !endpoints[call.Slot].Consumed && childRecordCount < childRecords.Length,
                "child-open-shape");
            FixedFileData.Need(call.Operation == FileOperation.ChildRead ||
                call.Operation == FileOperation.ChildPoll && call.Role == 31 ||
                call.Operation == FileOperation.ChildAbsent && call.Role == 33, "child-open-operation");
            FixedChildOpenRecord record = new FixedChildOpenRecord(call, context, ancestry);
            childRecords[childRecordCount++] = record; call.ChildOpenRecord = record;
            call.RetainedNativeStorage = record; activeChild = record;
            endpoints[call.Slot].Consumed = true; calls = checked(calls + 1);
            IntPtr transferred = IntPtr.Zero;
            Exception frameFailure = null;
            try
            {
                ancestry.RecheckRetainedAncestry(); context.RecheckPreparedLayout();
                record.Parent = context.BorrowPreparedDirectory(LayoutRole.Evidence);
                FixedFileData.Need(call.Parent == record.Parent, "child-open-parent");
                try { record.Reply = record.Frame.Attempt(new FixedReadOpenRequest(call.Role, record.Parent), out transferred); }
                catch (Exception error) { frameFailure = record.Frame.OriginalFailure ?? error; }
                // Publish output before status/information and parent reproof.
                call.RawHandle = transferred != IntPtr.Zero ? transferred : record.Frame.RawOutputObserved ?
                    new IntPtr(record.Frame.RawOutputDiagnostic) : IntPtr.Zero;
                call.Succeeded = call.Acquired = FixedFileData.Valid(transferred);
                if (call.Acquired) Acquisition(call, transferred);
            }
            catch (Exception error) { record.Remember(frameFailure ?? error); }
            finally
            {
                try { record.Outcome = record.Frame.CloseFrameStorage(); }
                catch (Exception error) { record.CleanupFailure = error; record.Remember(frameFailure ?? error); }
                call.Pending = record.Frame.NativeReturnObserved &&
                    record.Frame.NativeStatus == NativeFixedReadOpenFrame.StatusPending;
                call.CompletionKnown = !record.Frame.NativeCallEntered ||
                    record.Frame.NativeCompletionObserved && record.Frame.RawOutputObserved && !record.Frame.NativeCallUnresolved;
                if (record.Outcome != null && record.Outcome.AllFrameStorageReleased) call.RetainedNativeStorage = null;
                if (!call.CompletionKnown || call.Pending || record.Frame.NativeCallUnresolved ||
                    !call.Succeeded && (call.Acquired || call.RawHandle != IntPtr.Zero)) acquisitionUncertain = true;
            }
            try
            {
                LayoutRefusal negative = frameFailure as LayoutRefusal;
                bool cleanNegative = record.FirstFailure == null && negative != null &&
                    negative.Code == "native-read-open-failed" && record.Outcome != null &&
                    record.Outcome.AllFrameStorageReleased && call.CompletionKnown && !call.Pending &&
                    record.Frame.RawOutputObserved && call.RawHandle == IntPtr.Zero && !call.Acquired;
                bool missing = cleanNegative && record.Frame.NativeStatus == FixedChildOpenRecord.MissingStatus &&
                    (call.Operation == FileOperation.ChildPoll || call.Operation == FileOperation.ChildAbsent);
                bool busy = cleanNegative && record.Frame.NativeStatus == FixedChildOpenRecord.BusyStatus &&
                    call.Operation == FileOperation.ChildPoll;
                if (frameFailure != null && !missing && !busy) record.Remember(frameFailure);
                if (record.FirstFailure != null) throw record.FirstFailure;
                FixedFileData.Need(call.RetainedNativeStorage == null, "child-open-storage");
                if (!missing && !busy)
                    FixedFileData.Need(call.Acquired && record.Reply != null &&
                        record.Reply.Status == 0 && record.Reply.Information == 1, "child-open-status");
                ancestry.RecheckRetainedAncestry(); context.RecheckPreparedLayout();
                FixedFileData.Need(context.BorrowPreparedDirectory(LayoutRole.Evidence) == record.Parent,
                    "child-open-parent-drift");
                record.Reproved = true;
                record.Kind = missing ? ChildOpenKind.Missing : busy ? ChildOpenKind.Busy : ChildOpenKind.Opened;
                if (call.Acquired)
                {
                    ChildState state = children[call.Role - 29]; state.Record = record; state.Parent = record.Parent;
                }
                else if (call.Operation == FileOperation.ChildPoll) endpoints[call.Slot].Consumed = false;
            }
            catch (Exception error) { record.Remember(error); }
            finally { activeChild = null; }
            if (record.FirstFailure != null) throw record.FirstFailure;
        }
        private void OpenSource(FixedFileIoRecord record)
        {
            FixedFileCall call = record.Call; sourceFrameActive = true;
            try { FixedSourceOpenRecord.Invoke(call, context, ancestry); }
            catch (Exception error) { record.Remember(error); }
            finally
            {
                // Keep the original diagnostic object independently of arena
                // accounting, including when its storage was completely freed.
                record.SourceRecord = call.SourceOpenRecord;
                record.Pending |= call.Pending;
                if (record.SourceRecord != null)
                {
                    SourceState state = sources[call.Role]; state.Record = record.SourceRecord;
                    state.Parent = record.SourceRecord.BorrowedParent;
                    NativeFixedReadOpenFrame frame = record.SourceRecord.Frame;
                    record.NativeStatusObserved = frame.NativeReturnObserved; record.NativeStatus = frame.NativeStatus;
                    record.NativeHandleReturned = frame.RawOutputObserved; record.NativeHandleValue = frame.RawOutputDiagnostic;
                }
                try { if (call.Acquired && call.Succeeded && FixedFileData.Valid(call.RawHandle)) Acquisition(record, call.RawHandle); }
                catch (Exception error) { record.Remember(error); }
                sourceFrameActive = false;
            }
            if (record.FirstFailure != null) throw record.FirstFailure;
        }
        private void Create(FixedFileIoRecord record)
        {
            record.Frame = frames[record.Call.Role]; frameActive = true;
            IntPtr raw = IntPtr.Zero; CreateReply reply = new CreateReply(0, 0);
            try { reply = record.Frame.Attempt(new FixedFileCreateRequest(record.Call.Role, record.Call.Parent), out raw); }
            catch (Exception error) { record.Remember(record.Frame.OriginalFailure ?? error); }
            finally
            {
                // Publish known ownership even if later status/info validation failed.
                try { if (FixedFileData.Valid(raw)) Acquisition(record, raw); }
                catch (Exception error) { record.Remember(error); }
                frameActive = false;
                try { record.FrameOutcome = record.Frame.CloseFrameStorage(); }
                catch (Exception error) { record.CleanupFailure = error; record.Remember(error); }
                if (record.FrameOutcome != null && record.FrameOutcome.RawOutputObserved)
                { record.NativeHandleReturned = true; record.NativeHandleValue = record.FrameOutcome.RawOutputDiagnostic; }
                if (!record.Call.Acquired && record.NativeHandleReturned && record.NativeHandleValue != 0)
                    record.Call.RawHandle = new IntPtr(record.NativeHandleValue);
                record.Pending = record.CreateEntered && (!record.CreateReturned ||
                    record.NativeStatus == NativeFixedFileCreateFrame.StatusPending);
            }
            if (record.FirstFailure != null) throw record.FirstFailure;
            FixedFileData.Need(reply.Status == 0 && reply.Information == 2, "file-backend-create-result");
        }
        private void Reopen(FixedFileIoRecord record, bool seal)
        {
            record.Storage.Begin();
            IntPtr raw = FixedFileNative.ReOpenFile(record.Call.OtherHandle, 0x00120089, seal ? 1U : 3U, 0);
            record.NativeHandleReturned = true; record.NativeHandleValue = raw.ToInt64(); record.Storage.Returned();
            if (raw == new IntPtr(-1))
            {
                record.Error(FixedFileNative.Error());
                // Definite documented non-acquisition; keep raw -1/error in this
                // record, canonical potential-owned handle zero. Error 997 is not
                // a documented pending-handle result for this synchronous API.
                record.Call.RawHandle = IntPtr.Zero; record.Call.Acquired = record.Call.Succeeded = false;
                throw new LayoutRefusal("file-backend-reopen-failed");
            }
            if (!FixedFileData.Valid(raw))
            { record.AcquisitionUncertain = true; throw new LayoutRefusal("file-backend-reopen-invalid-output"); }
            Acquisition(record, raw);
        }
        private static void RequireBool(FixedFileIoRecord record, bool value, string code)
        {
            if (value) return;
            int error;
            try { error = FixedFileNative.Error(); record.Error(error); }
            catch { record.Storage.InFlight = true; throw; }
            if (error == 997) record.Storage.InFlight = true;
            throw new LayoutRefusal(code);
        }
        private static void Seek(FixedFileIoRecord record)
        {
            FixedFileIoStorage storage = record.Storage; storage.Clear(); storage.Begin();
            bool ok = FixedFileNative.SetFilePointerEx(record.Call.Handle, 0, storage.At(FixedFileBackendPolicy.CountOffset), 0);
            storage.Returned(); RequireBool(record, ok, "file-backend-seek-failed");
            FixedFileData.Need(FixedFileNative.I64(storage.At(FixedFileBackendPolicy.CountOffset)) == 0,
                "file-backend-seek-position");
        }
        private static void Read(FixedFileIoRecord record)
        {
            FixedFileCall call = record.Call; FixedFileIoStorage storage = record.Storage;
            storage.Clear(); storage.Begin();
            bool ok = FixedFileNative.ReadFile(call.Handle, storage.At(0), (uint)call.Requested,
                storage.At(FixedFileBackendPolicy.CountOffset), IntPtr.Zero);
            storage.Returned(); RequireBool(record, ok, "file-backend-read-failed");
            int count = FixedFileNative.I32(storage.At(FixedFileBackendPolicy.CountOffset));
            FixedFileData.Need(count >= 0 && count <= call.Requested, "file-backend-read-progress");
            FixedFileNative.Get(storage.At(0), call.Buffer, call.Offset, count);
            call.Transferred = count; call.Succeeded = true;
        }
        private void Write(FixedFileIoRecord record)
        {
            FixedFileCall call = record.Call; FixedFileIoStorage storage = record.Storage;
            FixedFileNative.Put(storage.At(0), call.Buffer, call.Offset, call.Requested); storage.Begin();
            bool ok = FixedFileNative.WriteFile(call.Handle, storage.At(0), (uint)call.Requested,
                storage.At(FixedFileBackendPolicy.CountOffset), IntPtr.Zero);
            storage.Returned(); RequireBool(record, ok, "file-backend-write-failed");
            int count = FixedFileNative.I32(storage.At(FixedFileBackendPolicy.CountOffset));
            FixedFileData.Need(count > 0 && count <= call.Requested, "file-backend-write-progress");
            written[call.Role] = checked(written[call.Role] + count); flushed[call.Role] = verified[call.Role] = false;
            call.Transferred = count; call.Succeeded = true;
        }
        private void Flush(FixedFileIoRecord record)
        {
            record.Storage.Begin(); bool ok = FixedFileNative.FlushFileBuffers(record.Call.Handle);
            record.Storage.Returned(); RequireBool(record, ok, "file-backend-flush-failed");
            flushed[record.Call.Role] = true; record.Call.Succeeded = true;
        }
        private void CloseHandle(FixedFileIoRecord record)
        {
            record.Storage.Begin(); bool ok = FixedFileNative.CloseHandle(record.Call.Handle);
            record.Storage.Returned(); record.Call.Succeeded = ok;
            if (ok) endpoints[record.Call.Slot].Closed = true;
            RequireBool(record, ok, "file-backend-close-failed");
        }
        private static byte[] Query(FixedFileIoRecord record, IntPtr handle, int kind, int bytes)
        {
            FixedFileIoStorage storage = record.Storage; storage.Clear(); storage.Begin();
            bool ok = kind == -1 ? FixedFileNative.GetFileInformationByHandle(handle, storage.At(0)) :
                FixedFileNative.GetFileInformationByHandleEx(handle, kind, storage.At(0), (uint)bytes);
            storage.Returned(); RequireBool(record, ok, "file-backend-facts-query"); return storage.Bytes(0, bytes);
        }
        private static HandleObservation Facts(FixedFileIoRecord record, IntPtr handle, byte[] descriptor, byte[] owner)
        {
            return FullLayoutData.Decode(Query(record, handle, -1, 52), Query(record, handle, 9, 8),
                Query(record, handle, 1, 24), descriptor, owner, descriptor != null);
        }
        private static string Path(FixedFileIoRecord record, IntPtr handle)
        {
            FixedFileIoStorage storage = record.Storage; storage.Clear(); storage.Begin();
            uint count = FixedFileNative.GetFinalPathNameByHandleW(handle, storage.At(FixedFileBackendPolicy.PathOffset),
                FixedFileBackendPolicy.PathCharacters, 1);
            storage.Returned(); if (count == 0) RequireBool(record, false, "file-backend-path-query");
            FixedFileData.Need(count > 0 && count < FixedFileBackendPolicy.PathCharacters, "file-backend-path-bound");
            return new UnicodeEncoding(false, false, true).GetString(storage.Bytes(FixedFileBackendPolicy.PathOffset,
                checked((int)count * 2)));
        }
        private FileFacts Observe(FixedFileIoRecord record)
        {
            if (record.Call.Role >= 29 && record.Call.Slot == 105 + record.Call.Role - 29) return ObserveChild(record);
            if (record.Call.Slot == 87 + record.Call.Role) return ObserveSource(record);
            FixedFileCall call = record.Call; FixedFileIoStorage storage = record.Storage;
            HandleObservation before = Facts(record, call.Handle, null, null);
            storage.Clear(); storage.Begin();
            bool ok = FixedFileNative.GetKernelObjectSecurity(call.Handle, 5, storage.At(0),
                FixedFileBackendPolicy.DescriptorMaximum, storage.At(FixedFileBackendPolicy.CountOffset));
            storage.Returned(); RequireBool(record, ok, "file-backend-security-query");
            int length = FixedFileNative.I32(storage.At(FixedFileBackendPolicy.CountOffset));
            FixedFileData.Need(length >= 20 && length <= FixedFileBackendPolicy.DescriptorMaximum, "file-backend-security-bound");
            byte[] descriptor = storage.Bytes(0, length);
            string wanted = Path(record, parents[call.Role]) + "\\" + FixedFileData.Name(call.Role);
            string actual = Path(record, call.Handle);
            if (paths[call.Role] == null) paths[call.Role] = wanted;
            FixedFileData.Need(wanted == paths[call.Role] && actual == paths[call.Role], "file-backend-returned-name");
            HandleObservation after = Facts(record, call.Handle, descriptor, expectedOwner);
            FixedFileData.Need(FullLayoutData.SameIdentity(before, after) && before.Directory == after.Directory &&
                before.DeletePending == after.DeletePending && before.Attributes == after.Attributes &&
                before.ReparseTag == after.ReparseTag && before.Links == after.Links && before.Length == after.Length,
                "file-backend-observation-drift");
            return new FileFacts(after.Volume, after.IdLow, after.IdHigh, after.Length, after.Links,
                after.Attributes, after.ReparseTag, after.Directory, after.DeletePending, after.ProtectedOwnerSystemAcl);
        }
        private static void SameFacts(HandleObservation before, HandleObservation after)
        {
            FixedFileData.Need(FullLayoutData.SameIdentity(before, after) && before.Directory == after.Directory &&
                before.DeletePending == after.DeletePending && before.Attributes == after.Attributes &&
                before.ReparseTag == after.ReparseTag && before.Links == after.Links && before.Length == after.Length,
                "file-backend-source-observation-drift");
        }
        private FileFacts ObserveSource(FixedFileIoRecord record)
        {
            FixedFileCall call = record.Call; SourceState state = sources[call.Role];
            FixedFileData.Need(state.Record != null && state.Record.Frame != null &&
                FixedFileData.Valid(state.Parent), "file-backend-source-state");
            ancestry.RecheckRetainedAncestry(); context.RecheckPreparedLayout();
            FixedFileData.Need(ancestry.BorrowRuntimeSourceParent(call.Role) == state.Parent,
                "file-backend-source-parent-drift");
            HandleObservation before = Facts(record, call.Handle, null, null);
            string wanted = Path(record, state.Parent) + "\\" + FixedFileData.Name(call.Role);
            FixedFileData.Need(Path(record, call.Handle) == wanted, "file-backend-source-name");
            HandleObservation after = Facts(record, call.Handle, null, null); SameFacts(before, after);
            FixedFileData.Need(Path(record, state.Parent) + "\\" + FixedFileData.Name(call.Role) == wanted &&
                Path(record, call.Handle) == wanted, "file-backend-source-name-drift");
            ancestry.RecheckRetainedAncestry(); context.RecheckPreparedLayout();
            FixedFileData.Need(ancestry.BorrowRuntimeSourceParent(call.Role) == state.Parent,
                "file-backend-source-parent-drift");
            FixedFileData.Length(call.Role, after.Length);
            FileFacts facts = new FileFacts(after.Volume, after.IdLow, after.IdHigh, after.Length, after.Links,
                after.Attributes, after.ReparseTag, after.Directory, after.DeletePending, false);
            if (state.Observed)
                FixedFileData.Need(FileFacts.Same(state.Facts, facts) && state.Facts.Length == facts.Length &&
                    state.Facts.Directory == facts.Directory && state.Facts.DeletePending == facts.DeletePending &&
                    state.Facts.Attributes == facts.Attributes && state.Facts.ReparseTag == facts.ReparseTag &&
                    state.Facts.Links == facts.Links && state.Path == wanted, "file-backend-source-retained-drift");
            else { state.Facts = facts; state.Path = wanted; state.Observed = true; }
            return facts;
        }
        private static byte[] ChildSecurity(FixedFileIoRecord record, byte[] expected)
        {
            FixedFileIoStorage storage = record.Storage; storage.Clear(); storage.Begin();
            bool ok = FixedFileNative.GetKernelObjectSecurity(record.Call.Handle, 7, storage.At(0),
                FixedFileBackendPolicy.DescriptorMaximum, storage.At(FixedFileBackendPolicy.CountOffset));
            storage.Returned(); RequireBool(record, ok, "child-security-query");
            int length = FixedFileNative.I32(storage.At(FixedFileBackendPolicy.CountOffset));
            FixedFileData.Need(length >= 20 && length <= FixedFileBackendPolicy.DescriptorMaximum, "child-security-bound");
            byte[] bytes = storage.Bytes(0, length);
            FixedChildEvidencePolicy.Require(bytes, expected); return bytes;
        }
        private FileFacts ObserveChild(FixedFileIoRecord record)
        {
            FixedFileCall call = record.Call; ChildState state = children[call.Role - 29];
            FixedFileData.Need(state.Record != null && state.Record.Kind == ChildOpenKind.Opened &&
                FixedFileData.Valid(state.Parent), "child-observation-state");
            ancestry.RecheckRetainedAncestry(); context.RecheckPreparedLayout();
            FixedFileData.Need(context.BorrowPreparedDirectory(LayoutRole.Evidence) == state.Parent, "child-parent-drift");
            HandleObservation before = Facts(record, call.Handle, null, null);
            byte[] descriptor = ChildSecurity(record, expectedOwner);
            string wanted = Path(record, state.Parent) + "\\" + FixedFileData.Name(call.Role);
            FixedFileData.Need(Path(record, call.Handle) == wanted, "child-returned-name");
            HandleObservation after = Facts(record, call.Handle, null, null); SameFacts(before, after);
            FixedFileData.Need(Path(record, state.Parent) + "\\" + FixedFileData.Name(call.Role) == wanted &&
                Path(record, call.Handle) == wanted, "child-name-drift");
            byte[] lastDescriptor = ChildSecurity(record, expectedOwner);
            FixedFileData.Need(FixedFileBackendPolicy.Same(descriptor, lastDescriptor), "child-security-drift");
            ancestry.RecheckRetainedAncestry(); context.RecheckPreparedLayout();
            FixedFileData.Need(context.BorrowPreparedDirectory(LayoutRole.Evidence) == state.Parent, "child-parent-drift");
            FixedFileData.Length(call.Role, after.Length);
            FileFacts facts = new FileFacts(after.Volume, after.IdLow, after.IdHigh, after.Length, after.Links,
                after.Attributes, after.ReparseTag, after.Directory, after.DeletePending, true);
            if (state.Observed)
                FixedFileData.Need(FileFacts.Same(state.Facts, facts) && state.Facts.Length == facts.Length &&
                    state.Facts.Directory == facts.Directory && state.Facts.DeletePending == facts.DeletePending &&
                    state.Facts.Attributes == facts.Attributes && state.Facts.ReparseTag == facts.ReparseTag &&
                    state.Facts.Links == facts.Links && state.Path == wanted &&
                    FixedFileBackendPolicy.Same(state.Descriptor, descriptor), "child-retained-drift");
            else { state.Facts = facts; state.Path = wanted; state.Descriptor = descriptor; state.Observed = true; }
            return facts;
        }
        private void Digest(FixedFileIoRecord record)
        {
            FixedFileIoStorage storage = record.Storage; Seek(record); bool ok;
            try { record.HashOwner = FixedFileNative.CreateSha256(); }
            catch { record.HashAcquisitionUncertain = true; throw; }
            FixedFileData.Need(record.HashOwner != null, "file-backend-hash-owner");
            byte[] chunk = new byte[FixedFileData.ChunkBytes]; long remaining = record.Call.ExpectedLength;
            while (remaining > 0)
            {
                int requested = (int)Math.Min(remaining, chunk.Length); storage.Clear(); storage.Begin();
                ok = FixedFileNative.ReadFile(record.Call.Handle, storage.At(0), (uint)requested,
                    storage.At(FixedFileBackendPolicy.CountOffset), IntPtr.Zero);
                storage.Returned(); RequireBool(record, ok, "file-backend-read-failed");
                int count = FixedFileNative.I32(storage.At(FixedFileBackendPolicy.CountOffset));
                FixedFileData.Need(count > 0 && count <= requested, "file-backend-read-progress");
                FixedFileNative.Get(storage.At(0), chunk, 0, count);
                record.HashOwner.TransformBlock(chunk, 0, count, chunk, 0); remaining -= count;
            }
            storage.Clear(); storage.Begin();
            ok = FixedFileNative.ReadFile(record.Call.Handle, storage.At(0), 1,
                storage.At(FixedFileBackendPolicy.CountOffset), IntPtr.Zero);
            storage.Returned(); RequireBool(record, ok, "file-backend-eof-failed");
            FixedFileData.Need(FixedFileNative.I32(storage.At(FixedFileBackendPolicy.CountOffset)) == 0, "file-backend-extra-byte");
            record.HashOwner.TransformFinalBlock(new byte[0], 0, 0); byte[] digest = record.HashOwner.Hash;
            FixedFileData.Need(digest != null && digest.Length == 32, "file-backend-hash-length");
            record.Call.Digest = BitConverter.ToString(digest).Replace("-", "").ToLowerInvariant();
            if (record.Call.Slot == record.Call.Role * 3) verified[record.Call.Role] = true;
            record.Call.Succeeded = true;
        }
    }
}
