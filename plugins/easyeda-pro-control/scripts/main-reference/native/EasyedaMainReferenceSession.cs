using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.Threading;
using Easyeda.PrivatePreparation;

// The fixed loader supplies compiler-owned bytes and hashes. There is no path,
// provider, stage or admission switch. The outer maintained refusal is separate.
public static class EasyedaMainReferenceSession
{
    private static readonly object Sync = new object();
    private static bool consumed;
    private static FixedMainReferenceSession retained;
    private static Exception retainedEntryFailure;
    public static string Run(byte[] main, byte[] request, string nonce, string mainSha256, string requestSha256)
    {
        lock (Sync)
        {
            if (consumed) throw new InvalidOperationException("MAIN_REFERENCE_SESSION_CONSUMED");
            consumed = true;
            try
            {
                // Construction acquires no native or cryptographic resources.
                // Store the owner before validation, hashing or preparation.
                retained = new FixedMainReferenceSession(main, request, nonce, mainSha256, requestSha256);
                return retained.Run();
            }
            catch (Exception error) { retainedEntryFailure = error; throw; }
            finally { GC.KeepAlive(retainedEntryFailure); }
        }
    }
}

namespace Easyeda.PrivatePreparation
{
    internal sealed class FixedMainReferenceSession
    {
        private readonly object sync = new object();
        private readonly byte[] mainBytes, requestBytes;
        private readonly string nonce, mainHash, requestHash;
        private readonly OwnedSyntheticJob job = new OwnedSyntheticJob();
        private readonly FixedSourceAncestry ancestry = new FixedSourceAncestry();
        private readonly Stopwatch launchWatch = new Stopwatch();
        private FixedMainReferenceInput input;
        private FixedLayoutContext layout;
        private FixedFileSession files;
        private FixedLaunchRecord launch;
        private FixedFileOutcome fileOutcome;
        private FullLayoutOutcome layoutOutcome;
        private AncestryOutcome ancestryOutcome;
        private EasyedaClockSample nativeBefore, nativeAfter;
        private Dictionary<string, object> result;
        private Exception firstFailure;
        private FixedFileDigestFailure inputDigestFailure;
        private readonly Exception[] cleanupFailures = new Exception[16];
        private int cleanupCount;
        private bool cleanupOverflow, consumed, active, candidate, settlementStarted, receiptWritten;
        private bool evidenceAvailable, clockCleanupKnown = true, terminalEvidence;
        private uint originalPid;
        private long originalStart, previousElapsed = -1;
        private string stage = "input", failure = "none";
        [ThreadStatic] private static FixedMainReferenceSession current;

        internal FixedMainReferenceSession(byte[] main, byte[] request, string valueNonce, string mainSha, string requestSha)
        { mainBytes = main; requestBytes = request; nonce = valueNonce; mainHash = mainSha; requestHash = requestSha; }
        internal static FixedMainReferenceSession Current(FixedFileSession original)
        {
            FixedFileData.Need(current != null && current.active && original != null &&
                Object.ReferenceEquals(current.files, original), "session-child-original-owner");
            return current;
        }
        private void Remember(Exception error)
        {
            FixedFileDigestFailure digest = error as FixedFileDigestFailure;
            if (digest != null) { inputDigestFailure = digest; error = digest.FirstFailure; }
            if (firstFailure == null) { firstFailure = error; failure = stage; }
            job.RecordExternalFailure(1);
        }
        private void Cleanup(Exception error)
        {
            if (cleanupCount < cleanupFailures.Length) cleanupFailures[cleanupCount++] = error;
            else cleanupOverflow = true;
            Remember(error);
        }
        internal long Elapsed()
        {
            FixedFileData.Need(active && !settlementStarted && launchWatch.IsRunning, "session-launch-clock-state");
            long value = launchWatch.ElapsedMilliseconds;
            FixedFileData.Need(value >= previousElapsed && value >= 0 && value < 30000, "session-launch-deadline");
            previousElapsed = value; return value;
        }
        private void OriginalJob()
        {
            FixedFileData.Need(job.LaunchAcknowledged && job.Pid != 0 && job.Pid == originalPid &&
                job.StartFileTime > 0 && job.StartFileTime == originalStart && job.PrimaryCode == 0 &&
                !job.AcquisitionUncertain && !job.ResourceAliasDetected, "session-original-job");
        }
        private void Live()
        {
            Elapsed(); OriginalJob();
            FixedFileData.Need(!job.RootExited(), "session-root-ended-before-admission");
            uint[] members = job.Pids(); bool present = false;
            foreach (uint member in members) present |= member == originalPid;
            FixedFileData.Need(present && job.PrimaryCode == 0, "session-original-root-membership");
            Elapsed();
        }
        private void Terminal()
        {
            Elapsed(); OriginalJob();
            FixedFileData.Need(terminalEvidence && job.TerminalObserved && job.RootSignaledObserved &&
                job.EmptyJobObserved && job.ExitCodeObserved && job.ObservedExitCode == 0,
                "session-original-terminal");
        }
        private void ReproveParents()
        {
            FixedFileData.Need(launch != null && input != null && launch.Nonce == input.Nonce &&
                launch.MainHash == input.MainHash && launch.RequestHash == input.RequestHash,
                "session-input-binding");
            files.RequireLaunchOwners(layout, ancestry, files.Files);
            ancestry.RecheckRetainedAncestry(); layout.RecheckPreparedLayout();
        }
        private void Boundary(bool terminal)
        {
            if (terminal) Terminal(); else Live();
            ReproveParents(); Elapsed();
        }
        internal void RequireReader()
        {
            FixedFileData.Need(!settlementStarted && (stage == "readiness" || stage == "handshake" ||
                stage == "result"), "session-child-reader-stage");
            Boundary(stage == "result");
        }
        internal void RequireTerminalReader()
        { FixedFileData.Need(stage == "absence" && !settlementStarted, "session-child-absence-stage"); Boundary(true); }
        private void Write(OwnerEvidenceRole role, object value, bool terminal)
        {
            Boundary(terminal); files.WriteEvidence(role, MainReferenceEvidence.Bytes(value)); Boundary(terminal);
        }
        private EasyedaClockSample Clock(bool terminal)
        {
            Boundary(terminal);
            // Keep the qualified observation unchanged. Success returns only
            // after its using(SHA256) disposal completed. Failure cannot prove it.
            EasyedaClockObservation observation;
            try { observation = EasyedaClockObservation.Read(); }
            catch { clockCleanupKnown = false; throw; }
            if (observation == null || !observation.tzAbsent || observation.reason != null || observation.sample == null)
            { clockCleanupKnown = false; throw new LayoutRefusal("session-clock-unavailable"); }
            Boundary(terminal); return observation.sample;
        }
        private void Collect()
        {
            input = new FixedMainReferenceInput(nonce, mainBytes, mainHash, requestBytes, requestHash);
            MainReferenceEvidence.Request(input);
            layout = new FixedLayoutContext(input.Nonce, ancestry);
            files = new FixedFileSession(layout, ancestry, input);
            stage = "prepare";
            ancestry.PrepareOnce(); layout.PrepareRetained();
            files.WriteEvidence(OwnerEvidenceRole.PreparationIntent, MainReferenceEvidence.Bytes(MainReferenceEvidence.Bag(
                "profile", "private.main-reference-preparation-intent.v3", "nonce", nonce,
                "mainSha256", mainHash, "requestSha256", requestHash, "executionAuthorized", false)));
            evidenceAvailable = true;
            files.PrepareOnce(); launch = files.CaptureLaunchBindingOnce();
            files.WriteEvidence(OwnerEvidenceRole.LaunchIntent, MainReferenceEvidence.Bytes(MainReferenceEvidence.Bag(
                "profile", "private.main-reference-launch-intent.v3", "nonce", nonce, "requestSha256", requestHash,
                "preparedSha256", launch.PreparedHash, "generations", 1, "executionAuthorized", false)));
            job.Prepare();
            stage = "launch";
            files.ReproveLaunchBindingOnce(launch);
            launchWatch.Start();
            job.Launch(launch.Application, launch.Command, launch.EnvironmentBlock, launch.WorkingDirectory);
            originalPid = job.Pid; originalStart = job.StartFileTime; Live();
            stage = "readiness";
            while (true)
            {
                Boundary(false); ChildReadyState ready = files.PollHandshakeReady(); Boundary(false);
                if (ready == ChildReadyState.Ready) break;
                // The fixed file layer alone distinguishes definite Missing/Busy.
                FixedFileData.Need(ready == ChildReadyState.Missing || ready == ChildReadyState.Busy,
                    "session-readiness-state");
                Thread.Sleep(FixedChildPollBudget.IntervalMilliseconds);
            }
            stage = "handshake";
            byte[] handshake = files.ReadEvidence(ChildEvidenceRole.Handshake); Boundary(false);
            byte[] identity = files.ReadEvidence(ChildEvidenceRole.Identity); Boundary(false);
            MainReferenceEvidence.Handshake(identity, handshake, launch, originalPid); Boundary(false);
            // The marker was already consumed by PollHandshakeReady. Never read it twice.
            stage = "clock-before"; nativeBefore = Clock(false);
            Write(OwnerEvidenceRole.ClockBefore, nativeBefore, false);
            stage = "admission";
            Write(OwnerEvidenceRole.ReferenceAdmission, MainReferenceEvidence.Bag(
                "profile", "private.main-reference-admission.v1", "nonce", nonce, "pid", originalPid,
                "requestSha256", requestHash), false);
            Boundary(false); files.WriteEvidence(OwnerEvidenceRole.ReferenceReady, new byte[0]);
            // Child may finish immediately after this marker. Only deadline and
            // retained parent reproof apply here, not a second liveness demand.
            Elapsed(); ReproveParents(); Elapsed();
            stage = "terminal";
            while (true)
            {
                Elapsed(); OriginalJob(); bool observed = job.ObserveTerminal();
                FixedFileData.Need(job.PrimaryCode == 0, "session-terminal-observation-failed"); Elapsed();
                if (observed) { terminalEvidence = true; Terminal(); break; }
                Thread.Sleep(25);
            }
            stage = "absence"; Boundary(true); files.RequireFailureAbsentAfterTerminal(); Boundary(true);
            stage = "clock-after"; nativeAfter = Clock(true); Write(OwnerEvidenceRole.ClockAfter, nativeAfter, true);
            stage = "result";
            byte[] resultBytes = files.ReadEvidence(ChildEvidenceRole.Result); Boundary(true);
            result = MainReferenceEvidence.Result(resultBytes, input);
            // This is a final bounded reproof, never part of the readiness loop.
            files.RecheckSealedFiles(); Boundary(true); candidate = true;
        }
        private void Settle()
        {
            stage = "settlement"; settlementStarted = true;
            try { job.PrepareSettlement(candidate && firstFailure == null); }
            catch (Exception error) { Cleanup(error); }
            bool outstanding = job.LaunchCallEntered && !job.TerminalObserved;
            if (outstanding && files != null)
            {
                try { files.RetainForUnresolvedJob(); } catch (Exception error) { Cleanup(error); }
            }
            // This diagnostic is optional on refused/unavailable evidence, and
            // mandatory for success. Never reopen files after closing them.
            if (evidenceAvailable && files != null && !outstanding && !files.JobDependencyRetained)
            {
                try
                {
                    files.WriteEvidence(OwnerEvidenceRole.OwnerSettlement, MainReferenceEvidence.Bytes(MainReferenceEvidence.Bag(
                        "profile", "private.main-reference-owner-settlement.v3", "nonce", nonce,
                        "requestSha256", requestHash, "accepted", false, "cleanupComplete", false,
                        "rootSignaled", job.RootSignaledObserved, "emptyRetainedJob", job.EmptyJobObserved,
                        "terminationObserved", job.TerminalObserved, "executionAuthorized", false)));
                    receiptWritten = true;
                }
                catch (Exception error) { Cleanup(error); }
            }
            stage = "cleanup";
            try { if (files != null) fileOutcome = files.CloseOwnedResources(); }
            catch (Exception error) { Cleanup(error); }
            // File session performs concrete dependency latches before returning.
            // An unexpected failed/missing outcome still cannot authorize closing
            // the parent chain. Storage-only retained errors are distinguished by
            // the backend's existing RequiresParentRetention decision.
            if (files != null && fileOutcome == null)
            {
                try { layout.RetainForUnresolvedFileCall(); } catch (Exception error) { Cleanup(error); }
                try { ancestry.RetainForUnresolvedDependentCall(); } catch (Exception error) { Cleanup(error); }
            }
            try { if (layout != null) layoutOutcome = layout.CloseOwnedResources(); }
            catch (Exception error) { Cleanup(error); }
            if (layout != null && (layoutOutcome == null || !layoutOutcome.AllResourcesReleased))
                try { ancestry.RetainForUnresolvedDependentCall(); } catch (Exception error) { Cleanup(error); }
            try { ancestryOutcome = ancestry.CloseOwnedResources(); } catch (Exception error) { Cleanup(error); }
            // Job cleanup remains independent of all filesystem cleanup failures.
            try { job.CloseOwnedResources(); } catch (Exception error) { Cleanup(error); }
        }
        private bool Complete()
        {
            LayoutOutcome core = layoutOutcome == null ? null : layoutOutcome.Layout;
            return candidate && firstFailure == null && cleanupCount == 0 && !cleanupOverflow &&
                inputDigestFailure == null && clockCleanupKnown && nativeBefore != null && nativeAfter != null &&
                result != null && receiptWritten && files != null && !files.JobDependencyRetained && job.NativeSuccess &&
                job.TerminalObserved && job.RootSignaledObserved && job.EmptyJobObserved && job.ExitCodeObserved &&
                job.ObservedExitCode == 0 && !job.Forced && !job.KillOnCloseAttempted &&
                fileOutcome != null && fileOutcome.Prepared && !fileOutcome.Unresolved && fileOutcome.AllKnownHandlesClosed &&
                fileOutcome.AcquiredHandles == 109 && fileOutcome.CloseAttempts == 109 &&
                fileOutcome.RetainedCalls.Count == 0 && !fileOutcome.ManagedDigestCleanupUnresolved &&
                fileOutcome.Failure == "none" && files.Adapter.AllStorageReleased &&
                layoutOutcome != null && layoutOutcome.Prepared && !layoutOutcome.CleanupDeferred &&
                layoutOutcome.AllResourcesReleased && layoutOutcome.CleanupErrors == 0 && layoutOutcome.UsedFrames == 22 &&
                layoutOutcome.Failure == "none" && core != null && core.Failure == null && core.LayoutObserved &&
                core.ReturnedHandles == 23 && core.UniqueReturnedHandles == 23 && core.CloseAttempts == 23 &&
                core.AllReturnedHandlesClosed && core.FailedCloseSlots.Count == 0 && core.RawHandleAliasSlots.Count == 0 &&
                ancestryOutcome != null && ancestryOutcome.Prepared && ancestryOutcome.AllResourcesReleased &&
                !ancestryOutcome.CleanupDeferred && !ancestryOutcome.Unresolved && !ancestryOutcome.LeaseOutstanding &&
                ancestryOutcome.StorageReleased && ancestryOutcome.OwnedHandles >= 1 && ancestryOutcome.OwnedHandles <= 70 &&
                ancestryOutcome.OwnedHandles == ancestryOutcome.CloseAttempts && ancestryOutcome.CloseFailures == 0 &&
                ancestryOutcome.CleanupErrors == 0 && ancestryOutcome.Failure == null;
        }
        private object Owner()
        {
            LayoutOutcome core = layoutOutcome == null ? null : layoutOutcome.Layout;
            object jobData = MainReferenceEvidence.Bag(
                "launchAttempted", job.LaunchAttempted, "launchCallEntered", job.LaunchCallEntered,
                "launchAcknowledged", job.LaunchAcknowledged, "pid", job.Pid,
                "startFileTime", job.StartFileTime > 0 ? job.StartFileTime.ToString(CultureInfo.InvariantCulture) : null,
                "rootSignaled", job.RootSignaledObserved, "emptyJob", job.EmptyJobObserved,
                "terminalObserved", job.TerminalObserved, "exitCodeObserved", job.ExitCodeObserved,
                "exitCode", job.ObservedExitCode, "forced", job.Forced, "stopAccepted", job.StopAccepted,
                "killOnCloseAttempted", job.KillOnCloseAttempted, "settlementFinished", job.SettlementFinished,
                "cleanupFinished", job.CleanupFinished, "cleanupSucceeded", job.CleanupSucceeded,
                "nativeSuccess", job.NativeSuccess, "primaryCode", job.PrimaryCode,
                "primaryNativeError", job.PrimaryNativeError, "errorCodes", job.ErrorCodes,
                "errorSlots", job.ErrorSlots, "nativeErrors", job.NativeErrors, "errorOverflow", job.ErrorOverflow,
                "acquisitionUncertain", job.AcquisitionUncertain, "resourceAliasDetected", job.ResourceAliasDetected);
            object fileData = MainReferenceEvidence.Bag("prepared", fileOutcome != null && fileOutcome.Prepared,
                "unresolved", fileOutcome == null || fileOutcome.Unresolved,
                "allHandlesClosed", fileOutcome != null && fileOutcome.AllKnownHandlesClosed,
                "acquiredHandles", fileOutcome == null ? 0 : fileOutcome.AcquiredHandles,
                "closeAttempts", fileOutcome == null ? 0 : fileOutcome.CloseAttempts,
                "failedCloseSlots", fileOutcome == null ? (object)new int[0] : fileOutcome.FailedCloseSlots,
                "retainedSlots", fileOutcome == null ? (object)new int[0] : fileOutcome.RetainedSlots,
                "retainedCalls", fileOutcome == null ? 0 : fileOutcome.RetainedCalls.Count,
                "managedDigestCleanupUnresolved", inputDigestFailure != null && inputDigestFailure.RetainedAlgorithm != null ||
                    fileOutcome != null && fileOutcome.ManagedDigestCleanupUnresolved,
                "storageReleased", files != null && files.Adapter.AllStorageReleased,
                "failureNone", fileOutcome != null && fileOutcome.Failure == "none");
            object layoutData = MainReferenceEvidence.Bag("prepared", layoutOutcome != null && layoutOutcome.Prepared,
                "cleanupDeferred", layoutOutcome == null || layoutOutcome.CleanupDeferred,
                "allResourcesReleased", layoutOutcome != null && layoutOutcome.AllResourcesReleased,
                "usedFrames", layoutOutcome == null ? 0 : layoutOutcome.UsedFrames,
                "cleanupErrors", layoutOutcome == null ? 0 : layoutOutcome.CleanupErrors,
                "failureNone", layoutOutcome != null && layoutOutcome.Failure == "none",
                "coreFailureNone", core != null && core.Failure == null,
                "layoutObserved", core != null && core.LayoutObserved,
                "returnedHandles", core == null ? 0 : core.ReturnedHandles,
                "uniqueHandles", core == null ? 0 : core.UniqueReturnedHandles,
                "closeAttempts", core == null ? 0 : core.CloseAttempts,
                "allHandlesClosed", core != null && core.AllReturnedHandlesClosed,
                "failedCloseSlots", core == null ? (object)new int[0] : core.FailedCloseSlots,
                "aliasSlots", core == null ? (object)new int[0] : core.RawHandleAliasSlots);
            object ancestryData = MainReferenceEvidence.Bag("prepared", ancestryOutcome != null && ancestryOutcome.Prepared,
                "cleanupDeferred", ancestryOutcome == null || ancestryOutcome.CleanupDeferred,
                "allResourcesReleased", ancestryOutcome != null && ancestryOutcome.AllResourcesReleased,
                "unresolved", ancestryOutcome == null || ancestryOutcome.Unresolved,
                "leaseOutstanding", ancestryOutcome == null || ancestryOutcome.LeaseOutstanding,
                "storageReleased", ancestryOutcome != null && ancestryOutcome.StorageReleased,
                "ownedHandles", ancestryOutcome == null ? 0 : ancestryOutcome.OwnedHandles,
                "closeAttempts", ancestryOutcome == null ? 0 : ancestryOutcome.CloseAttempts,
                "closeFailures", ancestryOutcome == null ? 0 : ancestryOutcome.CloseFailures,
                "cleanupErrors", ancestryOutcome == null ? 0 : ancestryOutcome.CleanupErrors,
                "failureNone", ancestryOutcome != null && ancestryOutcome.Failure == null);
            return MainReferenceEvidence.Bag("preparedSha256", launch == null ? null : launch.PreparedHash,
                "settlementReceiptWritten", receiptWritten, "jobDependencyRetained", files != null && files.JobDependencyRetained,
                "job", jobData, "files", fileData, "layout", layoutData, "ancestry", ancestryData);
        }
        internal string Run()
        {
            lock (sync)
            {
                FixedFileData.Need(!consumed && current == null, "session-consumed-or-active");
                consumed = true; active = true; current = this;
                try
                {
                    try { Collect(); } catch (Exception error) { Remember(error); }
                    finally { Settle(); }
                    if (!Complete() && firstFailure == null)
                    { stage = "cleanup"; Remember(new LayoutRefusal("session-cleanup-incomplete")); }
                    stage = "output";
                    try
                    {
                        return MainReferenceEvidence.Json(MainReferenceEvidence.Bag(
                            "profile", "private.main-reference-native-session.v1", "nonce", nonce,
                            "mainSha256", mainHash, "requestSha256", requestHash,
                            "root", launch == null ? null : launch.Directory(LayoutRole.Root).Name,
                            "nativeCollectionComplete", Complete(), "referenceValidated", false, "executionAuthorized", false,
                            "clockCleanupKnown", clockCleanupKnown, "failure", failure, "cleanupErrors", cleanupCount,
                            "owner", Owner(), "nativeBefore", nativeBefore, "nativeAfter", nativeAfter, "result", result));
                    }
                    catch (Exception error) { Remember(error); throw; }
                }
                finally { active = false; current = null; }
            }
        }
    }
}
