// PRIVATE compile-time adapter for the active fixed-role Create call.
using System;

namespace Easyeda.PrivatePreparation
{
    internal static class NativeFileFrameCalls
    {
        internal static void Allocate(int bytes, out IntPtr owned)
        {
            owned = IntPtr.Zero; FixedFileSession.Current().Adapter.RequireFrame();
            FixedFileBackendPolicy.Need(bytes > 0 && bytes <= NativeFixedFileCreateFrame.SecurityMaximumBytes,
                "file-backend-frame-buffer-bound");
            owned = FixedFileNative.Allocate(bytes);
        }
        internal static void RequireCreateQualification() { FixedFileSession.Current().Adapter.RequireFrame(); }
        internal static byte[] ReadBytes(IntPtr pointer, int count)
        {
            FixedFileBackendPolicy.Need(count >= 20 && count <= NativeFixedFileCreateFrame.SecurityMaximumBytes,
                "file-backend-frame-copy-bound");
            byte[] result = new byte[count]; FixedFileNative.Get(pointer, result, 0, count); return result;
        }
        internal static void Write(IntPtr pointer, byte[] bytes)
        { FixedFileNative.Put(pointer, bytes, 0, bytes.Length); }
        internal static IntPtr ReadPointer(IntPtr pointer, int offset)
        {
            IntPtr value = FixedFileNative.Pointer(IntPtr.Add(pointer, offset));
            FixedFileSession.Current().Adapter.RecordCreateOutput(value); return value;
        }
        internal static ulong ReadUnsigned(IntPtr pointer, int offset)
        { return unchecked((ulong)FixedFileNative.I64(IntPtr.Add(pointer, offset))); }
        internal static int Create(IntPtr output, uint access, IntPtr attributes, IntPtr ioStatus, uint options)
        {
            FixedFileBackend owner = FixedFileSession.Current().Adapter; owner.RequireFrame();
            FixedFileBackendPolicy.Need(access == FixedFileCreateRequest.WriterAccess && options == FixedFileCreateRequest.Options,
                "file-backend-create-flags");
            owner.BeginCreate();
            int status = FixedFileNative.NtCreateFile(output, access, attributes, ioStatus, IntPtr.Zero,
                FixedFileCreateRequest.FileAttributes, FixedFileCreateRequest.ShareAccess,
                FixedFileCreateRequest.Disposition, options, IntPtr.Zero, 0);
            owner.RecordCreateStatus(status); return status;
        }
        internal static void Free(IntPtr pointer) { FixedFileNative.Free(pointer); }
    }
}
