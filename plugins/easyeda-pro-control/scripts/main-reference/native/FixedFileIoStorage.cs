// PRIVATE retained storage. No disposal/finalizer retry or inferred native completion.
using System;
using System.Security.Cryptography;

namespace Easyeda.PrivatePreparation
{
    internal sealed class FixedFileIoStorage
    {
        private static readonly byte[] zero = new byte[FixedFileBackendPolicy.ArenaBytes];
        private IntPtr arena;
        private bool reserved, owned, attempted, released;
        private long budget, calls;
        internal bool Uncertain, InFlight;
        internal Exception CleanupFailure;
        internal bool Released { get { return !Uncertain && !InFlight && (!reserved || released); } }
        internal long NativeCalls { get { return calls; } }
        internal void Reset(long maximum)
        {
            FixedFileBackendPolicy.Need(Released && !InFlight && !Uncertain && CleanupFailure == null && maximum > 0,
                "file-backend-storage-reuse");
            arena = IntPtr.Zero; reserved = owned = attempted = released = false;
            budget = maximum; calls = 0;
        }
        internal void Allocate()
        {
            FixedFileBackendPolicy.Need(!reserved, "file-backend-allocation-consumed"); reserved = true;
            IntPtr value;
            try { value = FixedFileNative.Allocate(FixedFileBackendPolicy.ArenaBytes); }
            catch { Uncertain = true; throw; }
            if (!FixedFileData.Valid(value))
            { Uncertain = true; throw new LayoutRefusal("file-backend-allocation-output"); }
            arena = value; owned = true;
            FixedFileBackendPolicy.Need((arena.ToInt64() & 7) == 0, "file-backend-allocation-alignment");
            Clear();
        }
        internal IntPtr At(int offset)
        {
            FixedFileBackendPolicy.Need(owned && !attempted && offset >= 0 &&
                offset < FixedFileBackendPolicy.ArenaBytes, "file-backend-arena-offset");
            return IntPtr.Add(arena, offset);
        }
        internal void Clear() { FixedFileNative.Put(At(0), zero, 0, zero.Length); }
        internal byte[] Bytes(int offset, int count)
        {
            FixedFileBackendPolicy.Need(offset >= 0 && count >= 0 &&
                offset <= FixedFileBackendPolicy.ArenaBytes - count, "file-backend-arena-copy");
            byte[] result = new byte[count]; FixedFileNative.Get(At(offset), result, 0, count); return result;
        }
        internal void Begin()
        {
            FixedFileBackendPolicy.Need(!InFlight && !Uncertain && !attempted && calls < budget,
                "file-backend-native-budget");
            calls = checked(calls + 1); InFlight = true;
        }
        internal void Returned() { InFlight = false; }
        internal void Close()
        {
            if (!owned || attempted || InFlight || Uncertain) return;
            attempted = true;
            try { FixedFileNative.Free(arena); released = true; }
            catch (Exception error) { CleanupFailure = error; }
        }
    }

    internal sealed class FixedFileIoRecord
    {
        internal FixedFileCall Call;
        internal readonly FixedFileIoStorage Storage = new FixedFileIoStorage();
        internal NativeFixedFileCreateFrame Frame;
        internal NativeFileFrameOutcome FrameOutcome;
        internal FixedSourceOpenRecord SourceRecord;
        internal Exception FirstFailure, CleanupFailure, HashCleanupFailure;
        internal SHA256 HashOwner;
        internal bool HashAttempted, HashDisposed, HashAcquisitionUncertain;
        internal bool NativeHandleReturned, NativeErrorObserved, NativeStatusObserved;
        internal bool CreateEntered, CreateReturned, AcquisitionUncertain, Complete, Pending;
        internal long NativeHandleValue;
        internal int NativeError, NativeStatus;
        internal bool StorageReleased
        {
            get { return Storage.Released && (Frame == null || FrameOutcome != null &&
                FrameOutcome.AllPreparationResourcesReleased) &&
                (SourceRecord == null || SourceRecord.Outcome != null && SourceRecord.Outcome.AllFrameStorageReleased) &&
                !HashAcquisitionUncertain &&
                (HashOwner == null || HashDisposed); }
        }
        internal void Reset(FixedFileCall call)
        {
            FixedFileBackendPolicy.Need(Call == null || Complete && FirstFailure == null && StorageReleased,
                "file-backend-record-reuse");
            Storage.Reset(FixedFileBackendPolicy.NativeBudget(call));
            Call = call; Frame = null; FrameOutcome = null; SourceRecord = null;
            FirstFailure = CleanupFailure = HashCleanupFailure = null; HashOwner = null;
            HashAttempted = HashDisposed = HashAcquisitionUncertain = false;
            NativeHandleReturned = NativeErrorObserved = NativeStatusObserved = false;
            CreateEntered = CreateReturned = AcquisitionUncertain = Complete = Pending = false;
            NativeHandleValue = 0; NativeError = NativeStatus = 0;
        }
        internal void Remember(Exception error) { if (FirstFailure == null) FirstFailure = error; }
        internal void Error(int error)
        { if (!NativeErrorObserved) { NativeErrorObserved = true; NativeError = error; } }
        internal void CloseHash()
        {
            if (HashOwner == null || HashAttempted) return;
            HashAttempted = true;
            try { HashOwner.Dispose(); HashDisposed = true; }
            catch (Exception error) { HashCleanupFailure = error; Remember(error); }
        }
    }
}
