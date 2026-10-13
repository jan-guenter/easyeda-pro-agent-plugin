// PRIVATE fixed child roles and bounded observation facts, never Job authority.
using System;

namespace Easyeda.PrivatePreparation
{
    internal enum ChildReadyState { Missing, Busy, Ready }
    internal enum ChildOpenKind { None, Opened, Missing, Busy }
    internal sealed class ChildAttemptFact
    {
        internal readonly int Number, Status;
        internal readonly ChildReadyState State;
        internal ChildAttemptFact(int number, int status, ChildReadyState state)
        { Number = number; Status = status; State = state; }
    }
    internal sealed class FixedChildPollBudget
    {
        internal const int Maximum = 480, DeadlineMilliseconds = 12000, IntervalMilliseconds = 25;
        private int attempts;
        private long previous = -IntervalMilliseconds, entered = -1;
        private bool active, stopped;
        internal int Attempts { get { return attempts; } }
        internal void Before(long originalLaunchElapsed)
        {
            FixedFileData.Need(!stopped && !active, "child-poll-budget-consumed");
            // Consume a failed bound check too. A caller cannot rewind time.
            stopped = true;
            FixedFileData.Need(originalLaunchElapsed >= 0 && originalLaunchElapsed < DeadlineMilliseconds &&
                attempts < Maximum && originalLaunchElapsed >= previous + IntervalMilliseconds,
                "child-poll-bound");
            entered = originalLaunchElapsed; attempts++; active = true; stopped = false;
        }
        internal void After(long originalLaunchElapsed, bool ready)
        {
            FixedFileData.Need(active && !stopped, "child-poll-budget-order");
            active = false; stopped = true;
            FixedFileData.Need(originalLaunchElapsed >= entered && originalLaunchElapsed < DeadlineMilliseconds,
                "child-poll-deadline");
            previous = originalLaunchElapsed; stopped = ready;
        }
    }
    // The concrete one-shot session alone binds original launch/Job observations.
    // These checks accept no caller boolean, clock, path or provider.
    internal static class FixedChildSessionJoin
    {
        internal static void RequireReader(FixedFileSession files)
        { FixedMainReferenceSession.Current(files).RequireReader(); }
        internal static long OriginalLaunchElapsed(FixedFileSession files)
        { return FixedMainReferenceSession.Current(files).Elapsed(); }
        internal static void RequireOriginalTerminal(FixedFileSession files)
        { FixedMainReferenceSession.Current(files).RequireTerminalReader(); }
    }
    internal sealed class FixedChildOpenRecord
    {
        internal const int MissingStatus = unchecked((int)0xc0000034);
        internal const int BusyStatus = unchecked((int)0xc0000043);
        internal readonly FixedFileCall Call;
        internal readonly FixedLayoutContext Context;
        internal readonly FixedSourceAncestry Ancestry;
        internal readonly NativeFixedReadOpenFrame Frame = new NativeFixedReadOpenFrame();
        internal IntPtr Parent;
        internal ReadOpenReply Reply;
        internal NativeReadFrameOutcome Outcome;
        internal Exception FirstFailure, CleanupFailure;
        internal ChildOpenKind Kind;
        internal bool Reproved;
        internal FixedChildOpenRecord(FixedFileCall call, FixedLayoutContext context, FixedSourceAncestry ancestry)
        { Call = call; Context = context; Ancestry = ancestry; Kind = ChildOpenKind.None; }
        internal void Remember(Exception error) { if (FirstFailure == null) FirstFailure = error; }
        internal static bool Acquisition(FileOperation operation)
        { return operation == FileOperation.ChildRead || operation == FileOperation.ChildPoll ||
            operation == FileOperation.ChildAbsent; }
        internal static bool ExpectedNoFile(FixedFileCall call)
        {
            FixedChildOpenRecord r = call.ChildOpenRecord;
            return r != null && Object.ReferenceEquals(r.Call, call) && r.Reproved &&
                r.Outcome != null && r.Outcome.AllFrameStorageReleased && call.CompletionKnown &&
                !call.Pending && !call.Succeeded && !call.Acquired && call.RawHandle == IntPtr.Zero &&
                call.RetainedNativeStorage == null &&
                (r.Kind == ChildOpenKind.Missing &&
                    (call.Operation == FileOperation.ChildPoll || call.Operation == FileOperation.ChildAbsent) ||
                 r.Kind == ChildOpenKind.Busy && call.Operation == FileOperation.ChildPoll);
        }
    }
}
