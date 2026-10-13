// PRIVATE existing-source operation only. Session serialization is external.
using System;
namespace Easyeda.PrivatePreparation
{
    internal sealed class FixedSourceOpenRecord
    {
        internal readonly FixedLayoutContext Context;
        internal readonly FixedSourceAncestry Ancestry;
        internal readonly NativeFixedReadOpenFrame Frame;
        internal IntPtr BorrowedParent;
        internal ReadOpenReply Reply;
        internal NativeReadFrameOutcome Outcome;
        internal Exception FirstFailure, CleanupFailure;
        internal FixedSourceOpenRecord(FixedLayoutContext context, FixedSourceAncestry ancestry)
        {
            Context = context; Ancestry = ancestry;
            Frame = new NativeFixedReadOpenFrame();
        }
        private void Remember(Exception error) { if (FirstFailure == null) FirstFailure = error; }
        internal static void Invoke(FixedFileCall call, FixedLayoutContext context, FixedSourceAncestry ancestry)
        {
            FixedFileData.Need(call != null && context != null && ancestry != null, "source-open-owners");
            // A definite refusal before the fixed entry is not an uncertain acquisition.
            call.CompletionKnown = true;
            FixedFileData.Need(call.Operation == FileOperation.Source &&
                call.Role >= 0 && call.Role < FixedFileData.RuntimeCount &&
                call.Slot == 87 + call.Role && call.OtherSlot == -1 &&
                call.Handle == IntPtr.Zero && call.OtherHandle == IntPtr.Zero &&
                call.Parent == IntPtr.Zero && call.Buffer == null && call.Offset == 0 &&
                call.Requested == 0 && call.ExpectedLength == 0 &&
                call.SourceOpenRecord == null, "source-open-call-shape");
            FixedSourceOpenRecord record = new FixedSourceOpenRecord(context, ancestry);
            call.SourceOpenRecord = record;
            call.RetainedNativeStorage = record;
            IntPtr transferred = IntPtr.Zero;
            try
            {
                ancestry.RecheckRetainedAncestry();
                context.RecheckPreparedLayout();
                record.BorrowedParent = ancestry.BorrowRuntimeSourceParent(call.Role);
                try
                {
                    record.Reply = record.Frame.Attempt(
                        new FixedReadOpenRequest(call.Role, record.BorrowedParent), out transferred);
                }
                catch (Exception error) { record.Remember(record.Frame.OriginalFailure ?? error); }
                // Publish acquired output before any fallible status/alias validation.
                call.RawHandle = transferred != IntPtr.Zero ? transferred :
                    record.Frame.RawOutputObserved ? new IntPtr(record.Frame.RawOutputDiagnostic) : IntPtr.Zero;
                call.Succeeded = call.Acquired = FixedFileData.Valid(transferred);
                call.Pending = record.Frame.NativeReturnObserved &&
                    record.Frame.NativeStatus == NativeFixedReadOpenFrame.StatusPending;
                call.CompletionKnown = !record.Frame.NativeCallEntered ||
                    record.Frame.NativeCompletionObserved && record.Frame.RawOutputObserved &&
                    !record.Frame.NativeCallUnresolved;
                if (call.Acquired)
                {
                    // Never query/read/close a raw handle belonging to either parent owner.
                    ancestry.RequireNotAncestorHandle(transferred);
                    context.RequireNotLayoutHandle(transferred);
                }
                if (record.FirstFailure != null) throw record.FirstFailure;
                FixedFileData.Need(call.Acquired && record.Reply != null &&
                    record.Reply.Status == 0 && record.Reply.Information == 1, "source-open-status");
            }
            catch (Exception error) { record.Remember(error); }
            finally
            {
                try { record.Outcome = record.Frame.CloseFrameStorage(); }
                catch (Exception error) { record.CleanupFailure = error; record.Remember(error); }
                if (record.Frame.OriginalFailure != null) record.Remember(record.Frame.OriginalFailure);
                if (record.Outcome != null && record.Outcome.AllFrameStorageReleased)
                    call.RetainedNativeStorage = null;
            }
            if (record.FirstFailure != null) throw record.FirstFailure;
            FixedFileData.Need(call.RetainedNativeStorage == null, "source-open-storage");
        }
    }
}
