// PRIVATE SOURCE-ONLY. Fixed data policy, not filesystem or launch authority.
using System;
using System.Collections.ObjectModel;
using System.Security.Cryptography;
using System.Text;

namespace Easyeda.PrivatePreparation
{
    internal enum OwnerEvidenceRole { PreparationIntent, LaunchIntent, ClockBefore,
        ReferenceAdmission, ReferenceReady, ClockAfter, OwnerSettlement }
    internal enum ChildEvidenceRole { Identity, Handshake, HandshakeReady, Result, Failure }
    internal enum FileOperation { Source, Create, Transition, Seal, ChildRead, Observe,
        Read, Write, SeekStart, Flush, Digest, Close, ChildPoll, ChildAbsent }

    internal static class FixedFileData
    {
        internal const int RuntimeCount = 18, PreparedCount = 22, CreatedCount = 29,
            RoleCount = 34, SlotCount = 110, ChunkBytes = 65536;
        internal const long RuntimeMaximum = 536870912, RuntimeAggregateMaximum = 9663676416;
        internal const string Package = "{\"name\":\"easyeda-main-clock-reference\",\"productName\":\"EasyEDA Main Clock Reference\",\"version\":\"0.0.0\",\"main\":\"main.cjs\",\"private\":true}\n";
        private static readonly string[] names = {
            "easyeda-pro.exe", "libGLESv2.dll", "libEGL.dll", "icudtl.dat", "ffmpeg.dll",
            "dxil.dll", "dxcompiler.dll", "d3dcompiler_47.dll", "chrome_200_percent.pak",
            "chrome_100_percent.pak", "snapshot_blob.bin", "resources.pak", "vulkan-1.dll",
            "vk_swiftshader_icd.json", "vk_swiftshader.dll", "v8_context_snapshot.bin",
            "en-US.pak", "version", "package.json", "request.json", "main.cjs", "prepared.json",
            "preparation-intent.json", "launch-intent.json", "clock-before.json",
            "reference-admission.json", "reference-admission.ready", "clock-after.json",
            "owner-settlement.json", "identity.json", "handshake.json", "handshake.ready",
            "result.json", "failure.json" };
        private static readonly string[] runtimeHashes = {
            "bafa5089adbbdd2bf288f7222e8ef5ea274026fe5ee8bbfac9e3578b6a6624f9",
            "38d0de1d23decdbe3b02be31a8e94df4415faf78f90752741f8b827ce61e29f0",
            "c9a389263c033fe0dd34ebb2030c0c86105bcf2fb662ce679b5fe432690045d9",
            "1cf67874b5a87a8363a86fb3f81e3cbbed54d389062dab8fb52308d5cf8c8612",
            "c16dda346b6dcd7fe9a030d5965b79a4c877c48e64c2989842fa23e63e60ee6d",
            "77e039c905030a641e53658a008b74e90635a5ea9b6b79eabd0f2003bdfca59a",
            "49277084ee0208832794d9d0f495f631a7aa0dd62af55e1e67fd88ea829da916",
            "a05f99734f7c4822fefc12b367af21fd0976ed6608752fb1e1e80b6ece7ecbbb",
            "581c8d53199c10512d31a340699f9ad269f8eea5fe6bc49e05c1bde98ee612aa",
            "34433fa04ddf5eb78b3b4e9c64a3af626e28641907ad7a6086614eb6a8f00a07",
            "ed719d078977be84118c45420df70a0cc46dd32ae326559c9e6d9a909aeda099",
            "b05c3c66b777f107cf31a9bdbad28690bd9734e6ee876b9b986e7039d98a1ad7",
            "4c14f5c2dc7426cdbc29e370899fbdef9dc2404e7b23746dc4242c6ee3da66a4",
            "32d83ff113fef532a9f97e0d2831f8656628ab1c99e9060f0332b1532839afd9",
            "51fe7952263a2fe2f71595ccc44b131aec0d331e3aa52905e3f128dff6c14d07",
            "c321440b5b893fabf4cb983c46c325e6b1959536b7c98a3f1f0200df8ad61a33",
            "a02518efe75c630a1b5419af5ffdb1b16636b939139bccd7710e37f36ad9d55c",
            "c84a015b53d2d5ef33502ef0a9ca1528c24b19e6ea06c3023596209fe7894e7c" };
        internal static void Need(bool value, string code)
        { if (!value) throw new LayoutRefusal(code); }
        internal static bool Valid(IntPtr value)
        { return value != IntPtr.Zero && value != new IntPtr(-1); }
        internal static string Name(int role)
        { Need(role >= 0 && role < RoleCount, "file-role"); return names[role]; }
        internal static LayoutRole Parent(int role)
        {
            Name(role);
            if (role == 16) return LayoutRole.Locales;
            if (role < RuntimeCount) return LayoutRole.Runtime;
            if (role < 21) return LayoutRole.App;
            return role == 21 ? LayoutRole.Root : LayoutRole.Evidence;
        }
        internal static string Relative(int role)
        {
            string name = Name(role);
            if (role == 16) return "runtime\\locales\\" + name;
            if (role < RuntimeCount) return "runtime\\" + name;
            if (role < 21) return "runtime\\resources\\app\\" + name;
            return role == 21 ? name : "evidence\\" + name;
        }
        internal static string RuntimeHash(int role)
        { Need(role >= 0 && role < RuntimeCount, "file-runtime-role"); return runtimeHashes[role]; }
        internal static long Maximum(int role)
        {
            Name(role);
            if (role < RuntimeCount) return RuntimeMaximum;
            if (role == 18) return Encoding.UTF8.GetByteCount(Package);
            if (role == 19) return 8192;
            if (role == 20) return 100000;
            return Marker(role) ? 0 : 65536;
        }
        internal static bool Marker(int role) { return role == 26 || role == 31; }
        internal static void Length(int role, long length)
        { Need(length >= (Marker(role) ? 0 : 1) && length <= Maximum(role), "file-size"); }
        internal static long ChargeRuntime(long before, long length)
        {
            Need(before >= 0 && before <= RuntimeAggregateMaximum && length > 0 &&
                length <= RuntimeMaximum && length <= RuntimeAggregateMaximum - before, "file-total-budget");
            return before + length;
        }
        internal static bool IsHash(string value)
        {
            if (value == null || value.Length != 64) return false;
            foreach (char c in value) if (!(c >= '0' && c <= '9') && !(c >= 'a' && c <= 'f')) return false;
            return true;
        }
        internal static string Hash(byte[] bytes)
        {
            return HashOwned(SHA256.Create(), bytes);
        }
        // Only Hash supplies the fixed algorithm in production. Models exercise
        // this exact private settlement body with an inert SHA subclass.
        private static string HashOwned(SHA256 owner, byte[] bytes)
        {
            Need(owner != null, "file-hash-owner");
            Exception first = null, cleanup = null; byte[] digest = null;
            try { digest = owner.ComputeHash(bytes); Need(digest != null && digest.Length == 32, "file-hash-length"); }
            catch (Exception error) { first = error; }
            try { owner.Dispose(); }
            catch (Exception error) { cleanup = error; if (first == null) first = error; }
            if (first != null) throw new FixedFileDigestFailure(first, cleanup, cleanup == null ? null : owner);
            return BitConverter.ToString(digest).Replace("-", "").ToLowerInvariant();
        }
    }

    // The owning exception retains a failed-disposal algorithm and both exact
    // exceptions. No retry or all-managed-resources-released claim follows.
    internal sealed class FixedFileDigestFailure : Exception
    {
        internal readonly Exception FirstFailure, CleanupFailure;
        internal readonly SHA256 RetainedAlgorithm;
        internal FixedFileDigestFailure(Exception first, Exception cleanup, SHA256 retained)
            : base("Fixed file digest refused", first)
        { FirstFailure = first; CleanupFailure = cleanup; RetainedAlgorithm = retained; }
    }

    internal sealed class FixedMainReferenceInput
    {
        internal readonly string Nonce, MainHash, RequestHash;
        private readonly byte[] main, request;
        // Only the future fixed session calls this with its checked compiler frame.
        // This internal data object alone is not invocation authority.
        internal FixedMainReferenceInput(string nonce, byte[] mainBytes, string mainHash,
            byte[] requestBytes, string requestHash)
        {
            FixedFileData.Need(FixedFileData.IsHash(nonce) && FixedFileData.IsHash(mainHash) &&
                FixedFileData.IsHash(requestHash), "file-input-hash");
            FixedFileData.Need(mainBytes != null && requestBytes != null, "file-input-null");
            FixedFileData.Length(20, mainBytes.Length); FixedFileData.Length(19, requestBytes.Length);
            main = (byte[])mainBytes.Clone(); request = (byte[])requestBytes.Clone();
            new UTF8Encoding(false, true).GetString(main); new UTF8Encoding(false, true).GetString(request);
            FixedFileData.Need(FixedFileData.Hash(main) == mainHash &&
                FixedFileData.Hash(request) == requestHash, "file-input-digest");
            Nonce = nonce; MainHash = mainHash; RequestHash = requestHash;
        }
        internal byte[] Copy(int role)
        {
            if (role == 18) return Encoding.UTF8.GetBytes(FixedFileData.Package);
            FixedFileData.Need(role == 19 || role == 20, "file-input-role");
            return (byte[])(role == 19 ? request : main).Clone();
        }
    }

    internal struct FileFacts
    {
        internal ulong Volume, IdLow, IdHigh;
        internal long Length;
        internal uint Links, Attributes, ReparseTag;
        internal bool Directory, DeletePending, AppliedPolicy;
        internal FileFacts(ulong volume, ulong low, ulong high, long length, uint links,
            uint attributes, uint reparse, bool directory, bool deleted, bool policy)
        { Volume = volume; IdLow = low; IdHigh = high; Length = length; Links = links;
          Attributes = attributes; ReparseTag = reparse; Directory = directory;
          DeletePending = deleted; AppliedPolicy = policy; }
        internal static bool Same(FileFacts a, FileFacts b)
        { return a.Volume == b.Volume && a.IdLow == b.IdLow && a.IdHigh == b.IdHigh; }
    }

    // Exact fixed operation record retained BEFORE the backend may enter native
    // code. Future native adapters must retain their argument/storage owners here.
    // CompletionKnown is not storage cleanup. RetainedNativeStorage becomes null
    // only after all native storage cleanup is acknowledged; residuals refuse.
    // No arbitrary path, callback, function name or externally supplied backend.
    internal sealed class FixedFileCall
    {
        internal readonly FileOperation Operation;
        internal readonly int Role, Slot, OtherSlot, Offset, Requested;
        internal readonly IntPtr Handle, OtherHandle, Parent;
        internal readonly byte[] Buffer, ExpectedOwner;
        internal readonly long ExpectedLength;
        internal bool CompletionKnown, Succeeded, Pending, Acquired;
        internal IntPtr RawHandle;
        internal int Transferred;
        internal FileFacts Facts;
        internal string Digest;
        internal object RetainedNativeStorage;
        // Native facts survive acknowledged storage release; this is not authority.
        internal FixedSourceOpenRecord SourceOpenRecord;
        internal FixedChildOpenRecord ChildOpenRecord;
        internal FixedFileCall(FileOperation operation, int role, int slot, int otherSlot,
            IntPtr handle, IntPtr otherHandle, IntPtr parent, byte[] buffer, int offset,
            int requested, byte[] expectedOwner, long length)
        {
            Operation = operation; Role = role; Slot = slot; OtherSlot = otherSlot;
            Handle = handle; OtherHandle = otherHandle; Parent = parent; Buffer = buffer;
            Offset = offset; Requested = requested; ExpectedOwner = expectedOwner; ExpectedLength = length;
            CompletionKnown = false; Succeeded = false; Pending = false; Acquired = false;
            RawHandle = IntPtr.Zero; Transferred = 0; Facts = new FileFacts();
            Digest = null; RetainedNativeStorage = null; SourceOpenRecord = null; ChildOpenRecord = null;
        }
    }

    internal sealed class FixedFileOutcome
    {
        internal readonly bool Prepared, Unresolved, AllKnownHandlesClosed;
        internal readonly int AcquiredHandles, CloseAttempts;
        internal readonly ReadOnlyCollection<int> FailedCloseSlots, RetainedSlots;
        internal readonly ReadOnlyCollection<FixedFileCall> RetainedCalls;
        internal readonly ReadOnlyCollection<FixedFileDigestFailure> DigestFailures;
        internal readonly bool ManagedDigestCleanupUnresolved;
        internal readonly string Failure;
        internal readonly bool NativeFilesystemQualified = false, PathnameHandoffAuthorized = false,
            ExecutionAuthorized = false;
        internal FixedFileOutcome(bool prepared, bool unresolved, int acquired, int attempts,
            int[] failed, int[] retained, string failure, FixedFileCall[] calls, FixedFileDigestFailure[] digests)
        {
            Prepared = prepared; Unresolved = unresolved; AcquiredHandles = acquired;
            CloseAttempts = attempts; FailedCloseSlots = Array.AsReadOnly(failed);
            RetainedSlots = Array.AsReadOnly(retained); Failure = failure;
            RetainedCalls = Array.AsReadOnly(calls); DigestFailures = Array.AsReadOnly(digests);
            foreach (FixedFileDigestFailure digest in digests)
                ManagedDigestCleanupUnresolved |= digest.RetainedAlgorithm != null;
            AllKnownHandlesClosed = !unresolved && acquired == attempts && failed.Length == 0 && retained.Length == 0;
        }
    }
}
