// PRIVATE file-only composition, owned later by the complete main-reference session.
// This class does not prepare, settle or claim ownership of a Job or either parent.
using System;

namespace Easyeda.PrivatePreparation
{
    internal static class MainReferenceFileCalls
    {
        internal static void RequireFixedProfile() { FixedFileSession.Current().Adapter.RequireProfile(); }
        internal static void Invoke(FixedFileCall call, FixedLayoutContext context, FixedSourceAncestry ancestry)
        { FixedFileSession.Current().Adapter.Invoke(call, context, ancestry); }
    }

    internal sealed class FixedFileSession
    {
        private readonly object sync = new object();
        private readonly FixedLayoutContext context;
        private readonly FixedSourceAncestry ancestry;
        internal readonly FixedMainReferenceFiles Files;
        internal readonly FixedFileBackend Adapter;
        private bool active, closing, closed;
        private bool captureAttempted, prelaunchAttempted, jobRetentionAttempted, jobFilesLatched;
        private FixedLaunchRecord launchRecord;
        private Exception launchFailure, jobRetentionFailure;
        private readonly Exception[] jobRetentionErrors = new Exception[3];
        private int jobRetentionErrorCount;
        private FixedFileOutcome outcome;
        private readonly FixedChildPollBudget childPollBudget = new FixedChildPollBudget();
        private Exception cleanupFailure;
        private readonly Exception[] cleanupErrors = new Exception[3];
        private int cleanupErrorCount;
        [ThreadStatic] private static FixedFileSession current;

        internal FixedFileSession(FixedLayoutContext layout, FixedSourceAncestry source,
            FixedMainReferenceInput input)
        {
            FixedFileData.Need(layout != null && source != null && input != null,
                "file-session-original-owners");
            layout.RequireOriginalAncestry(source);
            context = layout; ancestry = source;
            Adapter = new FixedFileBackend(this, context, ancestry);
            Files = new FixedMainReferenceFiles(context, ancestry, input);
        }
        internal static FixedFileSession Current()
        { FixedFileData.Need(current != null && current.active, "file-session-not-active"); return current; }
        private void Enter(bool cleanup)
        {
            FixedFileData.Need(!active && !closing && !closed && current == null,
                "file-session-active-or-closed");
            active = true; closing = cleanup; current = this;
        }
        private void Exit() { current = null; active = false; closing = false; }
        private void RememberCleanup(Exception error)
        {
            cleanupErrors[cleanupErrorCount++] = error;
            if (cleanupFailure == null) cleanupFailure = error;
        }
        internal void PrepareOnce()
        {
            lock (sync) { Enter(false); try { Files.PrepareOnce(); } finally { Exit(); } }
        }
        internal void WriteEvidence(OwnerEvidenceRole role, byte[] bytes)
        {
            lock (sync) { Enter(false); try { Files.WriteEvidence(role, bytes); } finally { Exit(); } }
        }
        internal byte[] ReadEvidence(ChildEvidenceRole role)
        {
            lock (sync)
            {
                FixedChildSessionJoin.RequireReader(this); Enter(false);
                try { return Files.ReadEvidence(role); } finally { Exit(); }
            }
        }
        internal ChildReadyState PollHandshakeReady()
        {
            lock (sync)
            {
                FixedChildSessionJoin.RequireReader(this); Enter(false);
                try
                {
                    childPollBudget.Before(FixedChildSessionJoin.OriginalLaunchElapsed(this));
                    ChildReadyState result = Files.PollHandshakeReady();
                    childPollBudget.After(FixedChildSessionJoin.OriginalLaunchElapsed(this), result == ChildReadyState.Ready);
                    return result;
                }
                finally { Exit(); }
            }
        }
        internal void RequireFailureAbsentAfterTerminal()
        {
            lock (sync)
            {
                FixedChildSessionJoin.RequireOriginalTerminal(this); Enter(false);
                try { Files.RequireFailureAbsent(); } finally { Exit(); }
            }
        }
        internal void RecheckSealedFiles()
        {
            lock (sync) { Enter(false); try { Files.RecheckSealedFiles(); } finally { Exit(); } }
        }

        internal Exception LaunchFailure { get { return launchFailure; } }
        internal bool JobDependencyRetained { get { return jobRetentionAttempted; } }
        internal int JobRetentionErrorCount { get { return jobRetentionErrorCount; } }
        internal Exception JobRetentionError(int index)
        {
            FixedFileData.Need(index >= 0 && index < jobRetentionErrorCount, "file-job-retention-error-index");
            return jobRetentionErrors[index];
        }
        internal void RequireLaunchOwners(FixedLayoutContext layout, FixedSourceAncestry source,
            FixedMainReferenceFiles files)
        {
            FixedFileData.Need(Object.ReferenceEquals(context, layout) &&
                Object.ReferenceEquals(ancestry, source) && Object.ReferenceEquals(Files, files),
                "launch-original-owners");
        }
        private FixedLaunchRecord CaptureCurrentBinding()
        {
            // One bounded same-handle hash reproof per capture/prelaunch phase.
            // No readiness loop calls this method.
            Files.RecheckSealedFiles();
            PreparedDirectorySnapshot names = context.CapturePreparedDirectoryNames();
            PreparedSealSnapshot seals = Files.CopyPreparedSealBindings();
            string[] paths = Adapter.CopyPreparedFileNames(seals);
            FixedLaunchRecord result = FixedLaunchRecord.Create(this, names, seals, paths);
            ancestry.RecheckRetainedAncestry(); context.RecheckPreparedLayout();
            return result;
        }
        internal FixedLaunchRecord CaptureLaunchBindingOnce()
        {
            lock (sync)
            {
                FixedFileData.Need(!captureAttempted, "launch-capture-consumed");
                captureAttempted = true;
                bool entered = false;
                try
                {
                    Enter(false); entered = true;
                    FixedFileData.Need(!jobRetentionAttempted, "launch-job-retained");
                    FixedLaunchRecord candidate = CaptureCurrentBinding();
                    launchRecord = candidate; return candidate;
                }
                catch (Exception error) { if (launchFailure == null) launchFailure = error; throw; }
                finally { if (entered) Exit(); }
            }
        }
        // Data consumption only: this slice cannot call OwnedSyntheticJob.Launch.
        // The future complete session must serialize this boundary through native
        // entry and all later terminality/cleanup joins using the original Job.
        internal FixedLaunchRecord ReproveLaunchBindingOnce(FixedLaunchRecord original)
        {
            lock (sync)
            {
                FixedFileData.Need(!prelaunchAttempted, "launch-prelaunch-consumed");
                prelaunchAttempted = true;
                bool entered = false;
                try
                {
                    Enter(false); entered = true;
                    FixedFileData.Need(!jobRetentionAttempted && launchFailure == null &&
                        captureAttempted && launchRecord != null && Object.ReferenceEquals(original, launchRecord),
                        "launch-original-record");
                    original.RequireSame(CaptureCurrentBinding()); return original;
                }
                catch (Exception error) { if (launchFailure == null) launchFailure = error; throw; }
                finally { if (entered) Exit(); }
            }
        }
        private void RememberJobRetention(Exception error)
        {
            jobRetentionErrors[jobRetentionErrorCount++] = error;
            if (jobRetentionFailure == null) jobRetentionFailure = error;
        }
        internal void RetainForUnresolvedJob()
        {
            lock (sync)
            {
                if (jobRetentionAttempted)
                { if (jobRetentionFailure != null) throw jobRetentionFailure; return; }
                Enter(false);
                try
                {
                    // Latch before fallible work. Attempt both original parents
                    // even if the file latch or the first parent refuses.
                    jobRetentionAttempted = true;
                    try { Files.RetainForUnresolvedJob(); jobFilesLatched = true; }
                    catch (Exception error) { RememberJobRetention(error); }
                    try { context.RetainForUnresolvedFileCall(); }
                    catch (Exception error) { RememberJobRetention(error); }
                    try { ancestry.RetainForUnresolvedDependentCall(); }
                    catch (Exception error) { RememberJobRetention(error); }
                    if (jobRetentionFailure != null) throw jobRetentionFailure;
                }
                finally { Exit(); }
            }
        }
        internal FixedFileOutcome CloseOwnedResources()
        {
            lock (sync)
            {
                if (closed) { if (cleanupFailure != null) throw cleanupFailure; return outcome; }
                Enter(true);
                try
                {
                    // No parent borrow/readiness check during cleanup. The
                    // actual file owner closes its confirmed independent slots.
                    if (jobRetentionAttempted && !jobFilesLatched)
                    {
                        // If the file latch itself refused, do not risk closing
                        // those files. The original parent latches were attempted.
                        RememberCleanup(jobRetentionFailure ??
                            new LayoutRefusal("file-job-latch-unacknowledged"));
                    }
                    else
                    {
                        try { outcome = Files.CloseOwnedResources(); }
                        catch (Exception error) { RememberCleanup(error); }
                    }
                    if (!jobRetentionAttempted && Adapter.RequiresParentRetention(outcome))
                    {
                        // Both original owners are latched independently. These
                        // methods perform no acquisition or native close.
                        try { context.RetainForUnresolvedFileCall(); }
                        catch (Exception error) { RememberCleanup(error); }
                        try { ancestry.RetainForUnresolvedDependentCall(); }
                        catch (Exception error) { RememberCleanup(error); }
                    }
                    if (cleanupFailure != null) throw cleanupFailure;
                    return outcome;
                }
                finally { closed = true; Exit(); }
            }
        }
    }
}
