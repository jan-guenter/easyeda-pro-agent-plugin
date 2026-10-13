// PRIVATE fixed existing-source adapter. No supplied path, flags or provider.
using System;

namespace Easyeda.PrivatePreparation
{
    internal static class NativeReadFrameCalls
    {
        private static void Guard() { FixedFileSession.Current().Adapter.RequireReadFrame(); }
        internal static void Allocate(int bytes, out IntPtr owned)
        {
            owned = IntPtr.Zero; Guard();
            FixedFileData.Need(bytes > 0 && bytes <= (FixedReadOpenRequest.NameMaximum + 1) * 2,
                "file-backend-source-frame-bound");
            owned = FixedFileNative.Allocate(bytes);
        }
        internal static void RequireOpenQualification() { Guard(); }
        internal static void Write(IntPtr pointer, byte[] bytes)
        { Guard(); FixedFileNative.Put(pointer, bytes, 0, bytes.Length); }
        internal static IntPtr ReadPointer(IntPtr pointer, int offset)
        { Guard(); FixedFileData.Need(offset == 0, "file-backend-source-pointer-offset"); return FixedFileNative.Pointer(pointer); }
        internal static ulong ReadUnsigned(IntPtr pointer, int offset)
        { Guard(); FixedFileData.Need(offset == 8, "file-backend-source-information-offset"); return unchecked((ulong)FixedFileNative.I64(IntPtr.Add(pointer, offset))); }
        internal static int Open(IntPtr output, uint access, IntPtr attributes, IntPtr ioStatus, uint options)
        {
            Guard();
            FixedFileData.Need(access == FixedReadOpenRequest.ReadAccess && options == FixedReadOpenRequest.Options,
                "file-backend-source-frame-flags");
            return FixedFileNative.NtCreateFile(output, access, attributes, ioStatus, IntPtr.Zero,
                FixedReadOpenRequest.FileAttributes, FixedReadOpenRequest.ShareAccess,
                FixedReadOpenRequest.Disposition, options, IntPtr.Zero, 0);
        }
        internal static void Free(IntPtr pointer) { Guard(); FixedFileNative.Free(pointer); }
    }
}
