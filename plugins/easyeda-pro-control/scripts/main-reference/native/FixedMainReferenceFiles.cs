// PRIVATE SOURCE-ONLY. Fixed backend may select native calls; complete-session child admission refuses.
using System;
using System.Globalization;
using System.Text;

namespace Easyeda.PrivatePreparation
{
    internal sealed class FixedMainReferenceFiles
    {
        private sealed class Slot
        {
            internal IntPtr Handle = IntPtr.Zero;
            internal bool Owned = false, Attempted = false, Closed = false, Retained = false, HasFacts = false;
            internal FileFacts Facts = new FileFacts();
            internal int Role = -1;
        }
        private readonly object sync = new object();
        private readonly FixedLayoutContext context;
        private readonly FixedSourceAncestry ancestry;
        private readonly FixedMainReferenceInput input;
        private readonly Slot[] slots = new Slot[FixedFileData.SlotCount];
        private readonly FixedFileCall[] uncertain = new FixedFileCall[FixedFileData.SlotCount + 1];
        private readonly FixedFileDigestFailure[] digestFailures = new FixedFileDigestFailure[2];
        private readonly bool[] used = new bool[FixedFileData.RoleCount];
        private readonly bool[] failedClose = new bool[FixedFileData.SlotCount];
        private readonly long[] lengths = new long[FixedFileData.RoleCount];
        private readonly string[] hashes = new string[FixedFileData.RoleCount];
        private readonly byte[] scratch = new byte[FixedFileData.ChunkBytes];
        private byte[] expectedOwner;
        private bool active, initialized, prepareConsumed, prepared, closing, unresolved, parentRetained, ancestryRetained, settlementAttempted;
        private int acquired, attempts, uncertainCount, digestFailureCount;
        private long runtimeBytes;
        private int childPollCount;
        private bool childAbsenceAttempted;
        private readonly ChildAttemptFact[] childAttempts = new ChildAttemptFact[FixedChildPollBudget.Maximum];
        internal int ChildPollCount { get { return childPollCount; } }
        internal ChildAttemptFact ChildAttempt(int index)
        { FixedFileData.Need(index >= 0 && index < childPollCount, "child-attempt-index"); return childAttempts[index]; }
        private Exception originalFailure;
        private FixedFileCall currentCall, firstFailedCall;
        private Exception firstFailedCallFailure;
        private FixedFileOutcome outcome;

        internal FixedMainReferenceFiles(FixedLayoutContext layout, FixedSourceAncestry sourceAncestry,
            FixedMainReferenceInput acceptedInput)
        {
            FixedFileData.Need(layout != null && sourceAncestry != null && acceptedInput != null &&
                layout.Nonce == acceptedInput.Nonce, "file-context-input");
            context = layout; ancestry = sourceAncestry; input = acceptedInput;
            for (int i = 0; i < slots.Length; i++) slots[i] = new Slot();
        }
        internal Exception OriginalFailure { get { return originalFailure; } }
        internal FixedFileCall FirstFailedCall { get { return firstFailedCall; } }
        internal Exception FirstFailedCallFailure { get { return firstFailedCallFailure; } }
        private void RememberCallFailure(FixedFileCall call, Exception error)
        {
            // Diagnostic retention is separate from unacknowledged native storage.
            // Keep the exact first call/error before Remember can itself refuse.
            if (firstFailedCall == null) { firstFailedCall = call; firstFailedCallFailure = error; }
            Remember(error);
        }
        private void Remember(Exception error)
        {
            FixedFileDigestFailure digest = error as FixedFileDigestFailure;
            if (digest != null)
            {
                // One failed normal operation and one optional diagnostic only.
                bool present = false;
                for (int i = 0; i < digestFailureCount; i++) present |= Object.ReferenceEquals(digestFailures[i], digest);
                if (!present)
                { FixedFileData.Need(digestFailureCount < digestFailures.Length, "file-digest-fault-cap");
                  digestFailures[digestFailureCount++] = digest; }
                error = digest.FirstFailure;
            }
            if (originalFailure == null) originalFailure = error;
        }
        private static Exception Primary(Exception error)
        { FixedFileDigestFailure digest = error as FixedFileDigestFailure; return digest == null ? error : digest.FirstFailure; }
        private void Enter(bool diagnostic)
        {
            FixedFileData.Need(!active && !closing && outcome == null && !unresolved &&
                (originalFailure == null || diagnostic && initialized), "file-owner-unavailable");
            active = true;
        }
        private void Initialize()
        {
            if (initialized) return;
            MainReferenceFileCalls.RequireFixedProfile();
            ancestry.RecheckRetainedAncestry();
            context.RecheckPreparedLayout(); expectedOwner = context.CopyExpectedOwner();
            FixedFileData.Need(expectedOwner != null && expectedOwner.Length > 0 &&
                expectedOwner.Length <= 68, "file-owner-sid");
            initialized = true;
        }
        private static bool Acquisition(FileOperation operation)
        { return operation == FileOperation.Source || operation == FileOperation.Create ||
            operation == FileOperation.Transition || operation == FileOperation.Seal || FixedChildOpenRecord.Acquisition(operation); }
        private void Keep(FixedFileCall call, bool pending)
        {
            unresolved = true;
            // At most one failed normal call followed by one close per slot.
            bool present = false;
            for (int i = 0; i < uncertainCount; i++) present |= Object.ReferenceEquals(uncertain[i], call);
            if (!present)
            { FixedFileData.Need(uncertainCount < uncertain.Length, "file-uncertainty-cap"); uncertain[uncertainCount++] = call; }
            if (!pending) return;
            if (call.Slot >= 0 && slots[call.Slot].Owned) slots[call.Slot].Retained = true;
            if (call.OtherSlot >= 0 && slots[call.OtherSlot].Owned) slots[call.OtherSlot].Retained = true;
            if (!parentRetained)
            {
                // Latch before the next session operation; session serialization
                // against context.CloseOwnedResources is a separate requirement.
                parentRetained = true;
                try { context.RetainForUnresolvedFileCall(); }
                catch (Exception error) { Remember(error); }
            }
            if (!ancestryRetained)
            {
                ancestryRetained = true;
                try { ancestry.RetainForUnresolvedDependentCall(); }
                catch (Exception error) { Remember(error); }
            }
        }
        private void Adopt(FixedFileCall call)
        {
            Slot slot = slots[call.Slot];
            try
            {
                FixedFileData.Need(!slot.Owned && FixedFileData.Valid(call.RawHandle), "file-acquisition-output");
                ancestry.RequireNotAncestorHandle(call.RawHandle);
                context.RequireNotLayoutHandle(call.RawHandle);
                for (int i = 0; i < slots.Length; i++)
                    FixedFileData.Need(!slots[i].Owned || slots[i].Closed || slots[i].Handle != call.RawHandle,
                        "file-handle-alias");
            }
            catch { Keep(call, true); throw; }
            slot.Handle = call.RawHandle; slot.Owned = true; slot.Role = call.Role; acquired++;
        }
        private FixedFileCall Call(FileOperation operation, int role, int slot, int other,
            byte[] buffer, int offset, int requested, long length)
        {
            FixedFileData.Need(currentCall == null, "file-nested-call");
            bool acquisition = Acquisition(operation);
            if (!acquisition) FixedFileData.Need(slots[slot].Owned && !slots[slot].Closed,
                "file-call-unowned");
            IntPtr parent = acquisition && operation != FileOperation.Source ?
                context.BorrowPreparedDirectory(FixedFileData.Parent(role)) : IntPtr.Zero;
            FixedFileCall call = new FixedFileCall(operation, role, slot, other,
                slots[slot].Handle, other < 0 ? IntPtr.Zero : slots[other].Handle,
                parent, buffer, offset, requested, expectedOwner, length);
            currentCall = call; Exception failure = null;
            try { MainReferenceFileCalls.Invoke(call, context, ancestry); }
            catch (Exception error) { failure = error; RememberCallFailure(call, error); }
            try
            {
                if (!call.CompletionKnown || call.Pending) Keep(call, true);
                else if (acquisition)
                {
                    if (call.Succeeded)
                    {
                        if (call.Acquired && FixedFileData.Valid(call.RawHandle)) Adopt(call);
                        else Keep(call, true);
                    }
                    else if (call.Acquired || call.RawHandle != IntPtr.Zero) Keep(call, true);
                }
                else if (operation == FileOperation.Close && call.Succeeded) slots[slot].Closed = true;
                if (call.CompletionKnown && !call.Pending && call.RetainedNativeStorage != null) Keep(call, false);
                if (failure != null) throw failure;
                if (FixedChildOpenRecord.ExpectedNoFile(call)) return call;
                FixedFileData.Need(call.CompletionKnown && !call.Pending && call.RetainedNativeStorage == null && call.Succeeded &&
                    (!acquisition || slots[slot].Owned), "file-call-refused");
                return call;
            }
            catch (Exception error) { RememberCallFailure(call, error); if (failure != null) throw failure; throw; }
            finally { currentCall = null; }
        }
        private FixedFileCall Simple(FileOperation operation, int role, int slot)
        { return Call(operation, role, slot, -1, null, 0, 0, 0); }
        private void Acquire(FileOperation operation, int role, int slot, int other)
        { Call(operation, role, slot, other, null, 0, 0, 0); }
        private FileFacts Observe(int role, int slot, bool policy)
        {
            FileFacts facts = Simple(FileOperation.Observe, role, slot).Facts;
            FixedFileData.Need(!facts.Directory && !facts.DeletePending && facts.Links == 1 &&
                facts.ReparseTag == 0 && (facts.Attributes & 0x00001410U) == 0 &&
                (facts.IdLow != 0 || facts.IdHigh != 0) && (!policy || facts.AppliedPolicy), "file-metadata");
            Slot target = slots[slot];
            if (target.HasFacts) FixedFileData.Need(FileFacts.Same(target.Facts, facts), "file-identity-drift");
            for (int i = 0; i < slots.Length; i++)
            {
                Slot peer = slots[i];
                if (peer.HasFacts && peer.Owned && !peer.Closed && FileFacts.Same(peer.Facts, facts))
                    FixedFileData.Need(i == slot || i < 87 && slot < 87 && peer.Role == role,
                        "file-cross-role-identity");
            }
            target.Facts = facts; target.HasFacts = true; return facts;
        }
        private void Verify(int role, int slot, long length, string hash, bool policy)
        {
            FileFacts facts = Observe(role, slot, policy);
            FixedFileData.Need(facts.Length == length, "file-length-drift");
            FixedFileCall digest = Call(FileOperation.Digest, role, slot, -1, null, 0, 0, length);
            FixedFileData.Need(FixedFileData.IsHash(digest.Digest) && digest.Digest == hash, "file-digest-drift");
            FixedFileData.Need(Observe(role, slot, policy).Length == length, "file-length-drift");
        }
        private void Close(int slot)
        {
            Slot value = slots[slot];
            FixedFileData.Need(value.Owned && !value.Attempted && !value.Closed && !value.Retained,
                "file-close-unavailable");
            value.Attempted = true; attempts++;
            try { Simple(FileOperation.Close, value.Role, slot); }
            finally { if (!value.Closed) failedClose[slot] = true; }
        }
        private int Read(int role, int slot, byte[] buffer, int offset, int count)
        {
            FixedFileData.Need(count > 0 && count <= FixedFileData.ChunkBytes && offset >= 0 &&
                offset <= buffer.Length - count, "file-read-bound");
            int read = Call(FileOperation.Read, role, slot, -1, buffer, offset, count, 0).Transferred;
            FixedFileData.Need(read >= 0 && read <= count, "file-read-count"); return read;
        }
        private void Write(int role, int slot, byte[] buffer, int offset, int count)
        {
            while (count > 0)
            {
                int chunk = Math.Min(count, FixedFileData.ChunkBytes);
                int wrote = Call(FileOperation.Write, role, slot, -1, buffer, offset, chunk, 0).Transferred;
                FixedFileData.Need(wrote > 0 && wrote <= chunk, "file-write-count");
                offset += wrote; count -= wrote;
            }
        }
        private void Seal(int role, long length, string hash)
        {
            int writer = role * 3, transition = writer + 1, seal = writer + 2;
            Simple(FileOperation.Flush, role, writer); Verify(role, writer, length, hash, true);
            Acquire(FileOperation.Transition, role, transition, writer);
            FixedFileData.Need(FileFacts.Same(Observe(role, transition, true), slots[writer].Facts), "file-transition-identity");
            Close(writer);
            Acquire(FileOperation.Seal, role, seal, transition);
            FixedFileData.Need(FileFacts.Same(Observe(role, seal, true), slots[transition].Facts), "file-seal-identity");
            Verify(role, seal, length, hash, true); Close(transition);
            lengths[role] = length; hashes[role] = hash; context.RecheckPreparedLayout();
        }
        private void NewWriter(int role)
        {
            FixedFileData.Need(!used[role], "file-role-consumed"); used[role] = true;
            context.RecheckPreparedLayout(); Acquire(FileOperation.Create, role, role * 3, -1);
            FixedFileData.Need(Observe(role, role * 3, true).Length == 0, "file-created-not-empty");
        }
        private void CopyRuntime(int role)
        {
            int source = 87 + role; context.RecheckPreparedLayout();
            Acquire(FileOperation.Source, role, source, -1);
            long length = Observe(role, source, false).Length; FixedFileData.Length(role, length);
            runtimeBytes = FixedFileData.ChargeRuntime(runtimeBytes, length);
            string hash = FixedFileData.RuntimeHash(role); Verify(role, source, length, hash, false);
            Simple(FileOperation.SeekStart, role, source); NewWriter(role);
            long remaining = length;
            while (remaining > 0)
            {
                int requested = (int)Math.Min(remaining, scratch.Length);
                int read = Read(role, source, scratch, 0, requested);
                FixedFileData.Need(read > 0, "file-copy-short");
                Write(role, role * 3, scratch, 0, read); remaining -= read;
            }
            FixedFileData.Need(Read(role, source, scratch, 0, 1) == 0, "file-source-extra");
            Verify(role, source, length, hash, false); Seal(role, length, hash); Close(source);
        }
        private void Put(int role, byte[] bytes)
        {
            FixedFileData.Length(role, bytes.Length); string hash = FixedFileData.Hash(bytes);
            NewWriter(role); Write(role, role * 3, bytes, 0, bytes.Length); Seal(role, bytes.Length, hash);
        }
        private byte[] PreparedManifest()
        {
            StringBuilder result = new StringBuilder("{\"profile\":\"private.main-reference-prepared.v1\",\"nonce\":\"");
            result.Append(input.Nonce).Append("\",\"requestSha256\":\"").Append(input.RequestHash)
                .Append("\",\"mainSha256\":\"").Append(input.MainHash).Append("\",\"files\":[");
            for (int role = 0; role < 21; role++)
            {
                FixedFileData.Need(hashes[role] != null, "file-manifest-incomplete");
                if (role != 0) result.Append(',');
                result.Append("{\"path\":\"").Append(FixedFileData.Relative(role).Replace("\\", "\\\\"))
                    .Append("\",\"bytes\":").Append(lengths[role].ToString(CultureInfo.InvariantCulture))
                    .Append(",\"sha256\":\"").Append(hashes[role]).Append("\"}");
            }
            return Encoding.UTF8.GetBytes(result.Append("]}\n").ToString());
        }
        internal void PrepareOnce()
        {
            lock (sync)
            {
                Enter(false);
                try
                {
                    FixedFileData.Need(!prepareConsumed, "file-prepare-consumed"); prepareConsumed = true; Initialize();
                    for (int role = 0; role < FixedFileData.RuntimeCount; role++) CopyRuntime(role);
                    for (int role = 18; role < 21; role++) Put(role, input.Copy(role));
                    Put(21, PreparedManifest()); context.RecheckPreparedLayout(); prepared = true;
                }
                catch (Exception error) { Remember(error); throw Primary(error); }
                finally { active = false; }
            }
        }
        internal void WriteEvidence(OwnerEvidenceRole evidence, byte[] sessionGeneratedBytes)
        {
            lock (sync)
            {
                int role = (int)evidence + 22; bool diagnostic = evidence == OwnerEvidenceRole.OwnerSettlement;
                if (diagnostic)
                {
                    FixedFileData.Need(!settlementAttempted, "file-settlement-attempt-consumed");
                    settlementAttempted = true;
                }
                Enter(diagnostic);
                try
                {
                    FixedFileData.Need(role >= 22 && role <= 28 && sessionGeneratedBytes != null,
                        "file-owner-evidence-role");
                    FixedFileData.Need(prepared || role == 22 && !prepareConsumed || diagnostic,
                        "file-evidence-before-prepared");
                    FixedFileData.Length(role, sessionGeneratedBytes.Length);
                    Initialize(); byte[] bytes = (byte[])sessionGeneratedBytes.Clone();
                    new UTF8Encoding(false, true).GetString(bytes); Put(role, bytes);
                }
                catch (Exception error) { Remember(error); throw Primary(error); }
                finally { active = false; }
            }
        }
        internal byte[] ReadEvidence(ChildEvidenceRole evidence)
        {
            lock (sync)
            {
                Enter(false);
                try
                {
                    int role = (int)evidence + 29; FixedFileData.Need(prepared && role >= 29 && role <= 33,
                        "file-child-evidence-role");
                    FixedFileData.Need(!used[role], "file-role-consumed"); used[role] = true;
                    int slot = 105 + role - 29; context.RecheckPreparedLayout();
                    Acquire(FileOperation.ChildRead, role, slot, -1);
                    long length = Observe(role, slot, true).Length; FixedFileData.Length(role, length);
                    byte[] result = new byte[(int)length]; int offset = 0;
                    while (offset < result.Length)
                    {
                        int read = Read(role, slot, result, offset, Math.Min(result.Length - offset, scratch.Length));
                        FixedFileData.Need(read > 0, "file-evidence-short"); offset += read;
                    }
                    FixedFileData.Need(Read(role, slot, scratch, 0, 1) == 0, "file-evidence-extra");
                    Verify(role, slot, length, FixedFileData.Hash(result), true);
                    new UTF8Encoding(false, true).GetString(result); context.RecheckPreparedLayout();
                    return result;
                }
                catch (Exception error) { Remember(error); throw Primary(error); }
                finally { active = false; }
            }
        }
        internal ChildReadyState PollHandshakeReady()
        {
            lock (sync)
            {
                Enter(false);
                try
                {
                    FixedFileData.Need(prepared && !used[31] && childPollCount < FixedChildPollBudget.Maximum,
                        "child-poll-consumed");
                    int index = childPollCount++;
                    context.RecheckPreparedLayout();
                    FixedFileCall call = Simple(FileOperation.ChildPoll, 31, 107);
                    ChildReadyState state;
                    if (FixedChildOpenRecord.ExpectedNoFile(call))
                        state = call.ChildOpenRecord.Kind == ChildOpenKind.Missing ? ChildReadyState.Missing : ChildReadyState.Busy;
                    else
                    {
                        used[31] = true;
                        FixedFileData.Need(Observe(31, 107, true).Length == 0, "child-marker-size");
                        Verify(31, 107, 0, FixedFileData.Hash(new byte[0]), true);
                        context.RecheckPreparedLayout(); state = ChildReadyState.Ready;
                    }
                    childAttempts[index] = new ChildAttemptFact(index + 1, call.ChildOpenRecord.Frame.NativeStatus, state);
                    return state;
                }
                catch (Exception error) { Remember(error); throw Primary(error); }
                finally { active = false; }
            }
        }
        internal void RequireFailureAbsent()
        {
            lock (sync)
            {
                Enter(false);
                try
                {
                    FixedFileData.Need(prepared && !childAbsenceAttempted && !used[33], "child-absence-consumed");
                    childAbsenceAttempted = true; used[33] = true;
                    context.RecheckPreparedLayout();
                    FixedFileCall call = Simple(FileOperation.ChildAbsent, 33, 109);
                    FixedFileData.Need(FixedChildOpenRecord.ExpectedNoFile(call) &&
                        call.ChildOpenRecord.Kind == ChildOpenKind.Missing, "child-failure-present");
                    context.RecheckPreparedLayout();
                }
                catch (Exception error) { Remember(error); throw Primary(error); }
                finally { active = false; }
            }
        }
        internal void RecheckSealedFiles()
        {
            lock (sync)
            {
                Enter(false);
                try
                {
                    FixedFileData.Need(prepared, "file-not-prepared"); context.RecheckPreparedLayout();
                    for (int role = 0; role < FixedFileData.CreatedCount; role++)
                        if (hashes[role] != null) Verify(role, role * 3 + 2, lengths[role], hashes[role], true);
                    context.RecheckPreparedLayout();
                }
                catch (Exception error) { Remember(error); throw Primary(error); }
                finally { active = false; }
            }
        }

        // Pure snapshots do not acquire handles or grant an independent lifetime.
        // The enclosing fixed session performs reproof before and after capture.
        internal PreparedSealSnapshot CopyPreparedSealBindings()
        {
            lock (sync)
            {
                Enter(false);
                try
                {
                    FixedFileData.Need(prepared && initialized && prepareConsumed &&
                        currentCall == null, "file-launch-not-prepared");
                    PreparedSealBinding[] result = new PreparedSealBinding[FixedFileData.PreparedCount];
                    for (int role = 0; role < result.Length; role++)
                    {
                        int index = role * 3 + 2; Slot seal = slots[index];
                        FixedFileData.Need(used[role] && seal.Owned && !seal.Attempted && !seal.Closed &&
                            !seal.Retained && seal.HasFacts && seal.Role == role &&
                            FixedFileData.Valid(seal.Handle) && seal.Facts.Length == lengths[role] &&
                            FixedFileData.IsHash(hashes[role]), "file-launch-seal-state");
                        FixedFileData.Length(role, lengths[role]);
                        for (int part = 0; part < 2; part++)
                        {
                            Slot prior = slots[role * 3 + part];
                            FixedFileData.Need(prior.Owned && prior.Attempted && prior.Closed &&
                                !prior.Retained && prior.Role == role, "file-launch-prior-live");
                        }
                        if (role < FixedFileData.RuntimeCount)
                        {
                            Slot source = slots[87 + role];
                            FixedFileData.Need(source.Owned && source.Attempted && source.Closed &&
                                !source.Retained && source.Role == role &&
                                hashes[role] == FixedFileData.RuntimeHash(role), "file-launch-source-live");
                        }
                        FixedFileData.Need(!seal.Facts.Directory && !seal.Facts.DeletePending &&
                            seal.Facts.Links == 1 && seal.Facts.ReparseTag == 0 &&
                            (seal.Facts.Attributes & 0x1410U) == 0 && seal.Facts.AppliedPolicy &&
                            (seal.Facts.IdLow != 0 || seal.Facts.IdHigh != 0), "file-launch-seal-facts");
                        for (int peer = 0; peer < role; peer++)
                            FixedFileData.Need(result[peer].Handle != seal.Handle &&
                                !FileFacts.Same(result[peer].Facts, seal.Facts), "file-launch-seal-alias");
                        result[role] = new PreparedSealBinding(role, seal.Handle, seal.Facts, hashes[role]);
                    }
                    FixedFileData.Need(hashes[19] == input.RequestHash && hashes[20] == input.MainHash,
                        "file-launch-input-binding");
                    return new PreparedSealSnapshot(this, context, ancestry, input.Nonce,
                        input.MainHash, input.RequestHash, hashes[21], result);
                }
                catch (Exception error) { Remember(error); throw Primary(error); }
                finally { active = false; }
            }
        }
        // Separate from file-call uncertainty: an entered, nonterminal Job may
        // still use every live file. This latch performs no parent borrow or I/O.
        internal void RetainForUnresolvedJob()
        {
            lock (sync)
            {
                FixedFileData.Need(!active && !closing && outcome == null, "file-job-retention-after-settlement");
                unresolved = true;
                for (int i = 0; i < slots.Length; i++)
                    if (slots[i].Owned && !slots[i].Closed) slots[i].Retained = true;
            }
        }
        internal FixedFileOutcome CloseOwnedResources()
        {
            lock (sync)
            {
                if (outcome != null) return outcome;
                FixedFileData.Need(!active && !closing, "file-close-active"); closing = true;
                for (int slot = slots.Length - 1; slot >= 0; slot--)
                    if (slots[slot].Owned && !slots[slot].Attempted && !slots[slot].Retained)
                        try { Close(slot); } catch (Exception error) { Remember(error); }
                int failures = 0, retained = 0;
                for (int i = 0; i < slots.Length; i++)
                { if (failedClose[i]) failures++; if (slots[i].Owned && !slots[i].Closed) retained++; }
                int[] failed = new int[failures], held = new int[retained]; failures = 0; retained = 0;
                for (int i = 0; i < slots.Length; i++)
                { if (failedClose[i]) failed[failures++] = i; if (slots[i].Owned && !slots[i].Closed) held[retained++] = i; }
                FixedFileCall[] calls = new FixedFileCall[uncertainCount];
                FixedFileDigestFailure[] digests = new FixedFileDigestFailure[digestFailureCount];
                Array.Copy(uncertain, calls, calls.Length); Array.Copy(digestFailures, digests, digests.Length);
                outcome = new FixedFileOutcome(prepared, unresolved, acquired, attempts, failed, held,
                    originalFailure == null ? "none" : "file-owner-refused", calls, digests);
                closing = false; return outcome;
            }
        }
    }
}
