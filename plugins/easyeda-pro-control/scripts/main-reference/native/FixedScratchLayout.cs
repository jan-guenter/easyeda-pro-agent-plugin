// PRIVATE UNEXECUTED PROPOSAL. This layout core never issues launch authority.
// Compile with exactly one LayoutCalls implementation. Production is refused.
using System;
using System.Collections.ObjectModel;

namespace Easyeda.PrivatePreparation
{
    internal enum LayoutRole
    {
        Root, Runtime, Locales, Resources, App, Evidence, UserData,
        SessionData, Logs, CrashDumps, Temp
    }

    internal enum SecurityRule { OwnerAndSystemProtected }

    // Values describe the candidate relative NtCreateFile request. This is not
    // a Windows ABI binding or proof that the supported build accepts the tuple.
    internal sealed class RelativeCreate
    {
        internal const uint ObjectAttributes = 0x00001040; // DONT_REPARSE | CASE_INSENSITIVE
        internal const uint ShareAccess = 1;             // FILE_SHARE_READ only
        internal const uint Disposition = 2;             // FILE_CREATE, never OPEN_IF
        internal const uint DirectoryAccess = 0x001200A1; // SYNCHRONIZE | READ_CONTROL | READ_ATTRIBUTES | TRAVERSE | LIST_DIRECTORY
        internal const uint GuardAccess = 0x00120081;     // SYNCHRONIZE | READ_CONTROL | READ_ATTRIBUTES | READ_DATA
        internal const uint DirectoryOptions = 0x21;     // DIRECTORY_FILE | SYNCHRONOUS_IO_NONALERT
        internal const uint GuardOptions = 0x60;         // NON_DIRECTORY_FILE | SYNCHRONOUS_IO_NONALERT
        internal readonly LayoutRole Role;
        internal readonly IntPtr Parent;
        internal readonly string Component;
        internal readonly bool Directory;
        internal readonly uint Access;
        internal readonly uint Options;
        internal readonly SecurityRule Security;

        internal RelativeCreate(LayoutRole role, IntPtr parent, string component, bool directory)
        {
            if (!FixedScratchLayout.ValidHandle(parent) || !ValidComponent(component))
                throw new LayoutRefusal("invalid-relative-request");
            Role = role;
            Parent = parent;
            Component = component;
            Directory = directory;
            Access = directory ? DirectoryAccess : GuardAccess;
            Options = directory ? DirectoryOptions : GuardOptions;
            Security = SecurityRule.OwnerAndSystemProtected;
        }

        internal static bool ValidComponent(string value)
        {
            if (value == null || value.Length == 0 || value.Length > FixedScratchLayout.RootPrefix.Length + FixedScratchLayout.NonceLength) return false;
            for (int i = 0; i < value.Length; i++)
            {
                char c = value[i];
                if (!(c >= 'a' && c <= 'z') && !(c >= '0' && c <= '9') && c != '-')
                    return false;
            }
            return value[0] != '-' && value[value.Length - 1] != '-';
        }
    }

    internal struct CreateReply
    {
        internal int Status;
        internal ulong Information;

        internal CreateReply(int status, ulong information)
        {
            Status = status;
            Information = information;
        }
    }

    // Fixed native-adapter observations, never supplied through the public API.
    // Compile-time models fabricate these fields; native selection observes them.
    internal struct HandleObservation
    {
        internal ulong Volume;
        internal ulong IdLow;
        internal ulong IdHigh;
        internal bool Directory;
        internal bool DeletePending;
        internal uint Attributes;
        internal uint ReparseTag;
        internal uint Links;
        internal long Length;
        internal bool ProtectedOwnerSystemAcl;

        internal HandleObservation(ulong volume, ulong idLow, ulong idHigh,
            bool directory, bool deletePending, uint attributes, uint reparseTag,
            uint links, long length, bool protectedOwnerSystemAcl)
        {
            Volume = volume;
            IdLow = idLow;
            IdHigh = idHigh;
            Directory = directory;
            DeletePending = deletePending;
            Attributes = attributes;
            ReparseTag = reparseTag;
            Links = links;
            Length = length;
            ProtectedOwnerSystemAcl = protectedOwnerSystemAcl;
        }
    }

    internal sealed class LayoutRefusal : Exception
    {
        internal readonly string Code;
        internal LayoutRefusal(string code) : base("Fixed scratch layout refused: " + code)
        { Code = code; }
    }

    public sealed class LayoutOutcome
    {
        public readonly string Profile = "private.fixed-scratch-layout-model.v1";
        public readonly string Failure;
        public readonly bool LayoutObserved;
        public readonly int ReturnedHandles;
        public readonly int UniqueReturnedHandles;
        public readonly int CloseAttempts;
        public readonly bool AllReturnedHandlesClosed;
        public readonly ReadOnlyCollection<int> FailedCloseSlots;
        public readonly ReadOnlyCollection<int> RawHandleAliasSlots;
        public readonly bool NativeFilesystemQualified = false;
        public readonly bool PathnameBindingQualified = false;
        public readonly bool ExecutionAuthorized = false;

        internal LayoutOutcome(string failure, bool observed, int returned, int unique, int attempts, int[] failures, int[] aliases)
        {
            Failure = failure;
            LayoutObserved = observed;
            ReturnedHandles = returned;
            UniqueReturnedHandles = unique;
            CloseAttempts = attempts;
            AllReturnedHandlesClosed = attempts == unique && failures.Length == 0 && aliases.Length == 0;
            FailedCloseSlots = Array.AsReadOnly((int[])failures.Clone());
            RawHandleAliasSlots = Array.AsReadOnly((int[])aliases.Clone());
        }
    }

    public sealed class FixedScratchLayout
    {
        internal const string RootPrefix = "easyeda-main-reference-";
        internal const int NonceLength = 64;
        private const int DirectoryCount = 11;
        private const int SlotCount = 23; // original ancestry lease + eleven directory/guard pairs
        private const string GuardName = "easyeda-preparation-guard";
        private static readonly string[] Names = {
            "", "runtime", "locales", "resources", "app", "evidence",
            "user-data", "session-data", "logs", "crash-dumps", "temp"
        };
        private static readonly int[] Parents = { -1, 0, 1, 1, 3, 0, 0, 0, 0, 0, 0 };

        private sealed class Slot
        {
            internal IntPtr Handle;
            internal bool Reserved;
            internal bool Observed;
            internal bool CloseAttempted;
            internal bool RawAlias;
            internal HandleObservation Identity;
        }

        private readonly Slot[] slots = new Slot[SlotCount];
        private readonly int[] failedCloses = new int[SlotCount];
        private readonly int[] rawAliases = new int[SlotCount];
        private readonly object stateLock = new object();
        private bool attempted;
        private bool active;
        private bool closed;
        private bool layoutObserved;
        private string firstFailure;
        private Exception originalPreparationException;
        private LayoutOutcome outcome;

        // Managed allocation only. No OS query, filesystem or native acquisition.
        public FixedScratchLayout()
        {
            for (int i = 0; i < slots.Length; i++) slots[i] = new Slot();
        }

        public void Prepare(string nonce)
        {
            lock (stateLock) { PrepareOnce(nonce); }
        }

        private void PrepareOnce(string nonce)
        {
            if (attempted || closed) throw new LayoutRefusal("attempt-consumed");
            attempted = true;
            active = true;
            try
            {
                CheckNonce(nonce);
                // The selected adapter checks its fixed preparation profile.
                // Original ancestry supplies the lease; no caller supplies a path.
                LayoutCalls.RequirePreparationProfile();
                PrepareCore(nonce);
            }
            catch (Exception error)
            {
                Remember(error);
                throw new LayoutRefusal(firstFailure);
            }
            finally { active = false; }
        }

        private void PrepareCore(string nonce)
        {
            Slot anchor = Reserve(0);
            // Transfer the original ancestry lease into this slot before later
            // binding checks. Cleanup routes to its sole owner, never a new open.
            LayoutCalls.AcquireOriginalAnchor(out anchor.Handle);
            ObserveInitial(0, true, false);
            for (int role = 0; role < DirectoryCount; role++)
            {
                int parent = Parents[role] < 0 ? 0 : DirectorySlot(Parents[role]);
                int directory = DirectorySlot(role);
                int guard = directory + 1;
                RecheckAllObserved();
                string component = role == 0 ? RootPrefix + nonce : Names[role];
                Create(parent, directory, (LayoutRole)role, component, true);
                // The directory is already acquired. Guard failure is partial
                // preparation; neither root nor directory is deleted or reused.
                Create(directory, guard, (LayoutRole)role, GuardName, false);
                RecheckAllObserved();
            }
            RecheckAllObserved();
            layoutObserved = true;
        }

        private void Create(int parent, int destination, LayoutRole role, string component, bool directory)
        {
            Recheck(parent);
            Slot target = Reserve(destination);
            RelativeCreate request = new RelativeCreate(role, slots[parent].Handle, component, directory);
            CreateReply reply = LayoutCalls.CreateRelative(request, out target.Handle);
            RefuseRawAlias(destination);
            if (reply.Status != 0 || reply.Information != 2 || !ValidHandle(target.Handle))
                throw new LayoutRefusal("exclusive-create-refused");
            ObserveInitial(destination, directory, true);
            if (target.Identity.Volume != slots[parent].Identity.Volume)
                throw new LayoutRefusal("volume-drift");
            Recheck(parent);
        }

        private Slot Reserve(int index)
        {
            if (index < 0 || index >= SlotCount || slots[index].Reserved)
                throw new LayoutRefusal("slot-refused");
            slots[index].Reserved = true;
            return slots[index];
        }

        private static int DirectorySlot(int role) { return 1 + role * 2; }

        private void RefuseRawAlias(int index)
        {
            if (!ValidHandle(slots[index].Handle)) return;
            for (int i = 0; i < index; i++)
                if (slots[i].Handle == slots[index].Handle)
                    throw new LayoutRefusal("raw-handle-alias");
        }

        internal static bool ValidHandle(IntPtr value)
        { return value != IntPtr.Zero && value != new IntPtr(-1); }

        private static void CheckNonce(string nonce)
        {
            if (nonce == null || nonce.Length != NonceLength) throw new LayoutRefusal("nonce-refused");
            for (int i = 0; i < nonce.Length; i++)
            {
                char c = nonce[i];
                if (!(c >= 'a' && c <= 'f') && !(c >= '0' && c <= '9'))
                    throw new LayoutRefusal("nonce-refused");
            }
        }

        private static void Validate(HandleObservation value, bool directory, bool created)
        {
            // No reparse/offline objects; file-only size and link constraints.
            if (value.Directory != directory || value.DeletePending ||
                (value.Attributes & 0x1400) != 0 || value.ReparseTag != 0 ||
                (value.Attributes & 0x10) != (directory ? 0x10u : 0u) ||
                (!directory && (value.Length != 0 || value.Links != 1)) ||
                (created && !value.ProtectedOwnerSystemAcl))
                throw new LayoutRefusal("handle-observation-refused");
        }

        private void ObserveInitial(int index, bool directory, bool created)
        {
            Slot slot = slots[index];
            if (!ValidHandle(slot.Handle)) throw new LayoutRefusal("missing-returned-handle");
            HandleObservation observation = LayoutCalls.Observe(slot.Handle);
            Validate(observation, directory, created);
            for (int i = 0; i < slots.Length; i++)
                if (slots[i].Observed && SameIdentity(slots[i].Identity, observation))
                    throw new LayoutRefusal("role-alias-refused");
            slot.Identity = observation;
            slot.Observed = true;
        }

        private static bool SameIdentity(HandleObservation a, HandleObservation b)
        { return a.Volume == b.Volume && a.IdLow == b.IdLow && a.IdHigh == b.IdHigh; }

        private void Recheck(int index)
        {
            Slot slot = slots[index];
            if (!slot.Observed || slot.CloseAttempted || !ValidHandle(slot.Handle))
                throw new LayoutRefusal("parent-not-retained");
            HandleObservation observation = LayoutCalls.Observe(slot.Handle);
            Validate(observation, slot.Identity.Directory, index != 0);
            if (!SameIdentity(slot.Identity, observation)) throw new LayoutRefusal("identity-drift");
        }

        private void RecheckAllObserved()
        {
            for (int i = 0; i < slots.Length; i++) if (slots[i].Observed) Recheck(i);
        }

        // Internal retained-session check. It acquires no handles and cannot
        // repeat preparation or reopen a closed layout.
        internal void RecheckRetained()
        {
            lock (stateLock)
            {
                if (!attempted || !layoutObserved || active || closed)
                    throw new LayoutRefusal("retained-layout-not-ready");
                active = true;
                try { LayoutCalls.RequirePreparationProfile(); RecheckAllObserved(); }
                catch (Exception error) { Remember(error); throw; }
                finally { active = false; }
            }
        }

        private void Remember(Exception error)
        {
            if (firstFailure != null || originalPreparationException != null) return;
            originalPreparationException = error;
            LayoutRefusal refusal = error as LayoutRefusal;
            firstFailure = refusal == null ? "preparation-observation-failed" : refusal.Code;
        }

        // Call after Job settlement in any later integration. No Job exists in
        // this slice. No path deletion, raw-handle retry or finalizer is present.
        public LayoutOutcome CloseOwnedResources()
        {
            lock (stateLock) { return CloseCore(); }
        }

        private LayoutOutcome CloseCore()
        {
            if (active) throw new LayoutRefusal("preparation-active");
            if (outcome != null) return outcome;
            if (closed) throw new LayoutRefusal("cleanup-result-unavailable");
            closed = true;
            int returned = 0;
            int unique = 0;
            int attemptedCloses = 0;
            int failures = 0;
            int aliases = 0;
            // Detect aliases again because an adapter can write its owned field
            // and then throw before the ordinary post-return check is reached.
            for (int i = 0; i < slots.Length; i++)
            {
                Slot slot = slots[i];
                if (!ValidHandle(slot.Handle)) continue;
                returned++;
                for (int j = 0; j < i; j++)
                    if (slots[j].Handle == slot.Handle) { slot.RawAlias = true; break; }
                if (slot.RawAlias) rawAliases[aliases++] = i;
                else unique++;
            }
            for (int i = slots.Length - 1; i >= 0; i--)
            {
                Slot slot = slots[i];
                if (!ValidHandle(slot.Handle) || slot.RawAlias) continue;
                if (slot.CloseAttempted) throw new LayoutRefusal("duplicate-close-attempt");
                slot.CloseAttempted = true;
                attemptedCloses++;
                bool success = false;
                try { success = LayoutCalls.Close(slot.Handle); }
                catch (Exception) { /* Record uncertainty, then attempt all siblings. */ }
                if (!success) failedCloses[failures++] = i;
            }
            int[] boundedFailures = new int[failures];
            int[] boundedAliases = new int[aliases];
            Array.Copy(failedCloses, boundedFailures, failures);
            Array.Copy(rawAliases, boundedAliases, aliases);
            outcome = new LayoutOutcome(firstFailure, layoutObserved, returned, unique, attemptedCloses, boundedFailures, boundedAliases);
            return outcome;
        }
    }
}
