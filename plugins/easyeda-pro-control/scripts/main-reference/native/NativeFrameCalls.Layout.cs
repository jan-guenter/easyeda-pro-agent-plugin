// PRIVATE FULL-LAYOUT PREPARATION ONLY. Original refused adapter stays unchanged.
// Compile-time replacement; never link into the plugin or a production owner.
using System;
using System.Runtime.InteropServices;

namespace Easyeda.PrivatePreparation
{
    [StructLayout(LayoutKind.Sequential)]
    internal struct NativeUnicodeString
    {
        internal ushort Length, MaximumLength;
        internal IntPtr Buffer;
        internal NativeUnicodeString(ushort length, ushort maximum, IntPtr buffer)
        { Length = length; MaximumLength = maximum; Buffer = buffer; }
    }
    [StructLayout(LayoutKind.Sequential)]
    internal struct NativeObjectAttributes
    {
        internal uint Length;
        internal IntPtr RootDirectory, ObjectName;
        internal uint Attributes;
        internal IntPtr SecurityDescriptor, SecurityQualityOfService;
        internal NativeObjectAttributes(uint length, IntPtr root, IntPtr name,
            uint attributes, IntPtr security, IntPtr quality)
        { Length = length; RootDirectory = root; ObjectName = name; Attributes = attributes;
          SecurityDescriptor = security; SecurityQualityOfService = quality; }
    }
    // The NTSTATUS/PVOID union occupies one pointer-sized slot. Its low32 bits
    // encode status; Information is a separate ULONG_PTR. No Pack=1 shortcut.
    [StructLayout(LayoutKind.Sequential)]
    internal struct NativeIoStatusBlock
    {
        internal IntPtr StatusOrPointer;
        internal UIntPtr Information;
        internal NativeIoStatusBlock(IntPtr statusOrPointer, UIntPtr information)
        { StatusOrPointer = statusOrPointer; Information = information; }
    }

    internal static class NativeFrameCalls
    {
        [DllImport("ntdll.dll", EntryPoint = "NtCreateFile", ExactSpelling = true,
            CallingConvention = CallingConvention.Winapi)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        private static extern int NtCreateFile(IntPtr fileHandle, uint desiredAccess,
            IntPtr objectAttributes, IntPtr ioStatus, IntPtr allocationSize,
            uint fileAttributes, uint shareAccess, uint disposition, uint options,
            IntPtr eaBuffer, uint eaLength);

        [DllImport("kernel32.dll", EntryPoint = "CloseHandle", ExactSpelling = true,
            CallingConvention = CallingConvention.Winapi, SetLastError = true)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool CloseHandle(IntPtr handle);

        internal static void Allocate(int bytes, out IntPtr owned)
        {
            owned = IntPtr.Zero;
            if (bytes <= 0 || bytes > NativeRelativeCreateFrame.SecurityMaximumBytes)
                throw new LayoutRefusal("native-frame-buffer-cap");
            owned = Marshal.AllocHGlobal(bytes);
        }
        internal static void RequireCreateQualification()
        {
            FixedLayoutContext.RequireFrame();
        }
        internal static byte[] ReadBytes(IntPtr pointer, int count)
        {
            if (count < 20 || count > NativeRelativeCreateFrame.SecurityMaximumBytes)
                throw new LayoutRefusal("native-frame-security-copy-bound");
            byte[] result = new byte[count];
            Marshal.Copy(pointer, result, 0, count); return result;
        }
        internal static void Write(IntPtr pointer, byte[] bytes)
        { Marshal.Copy(bytes, 0, pointer, bytes.Length); }
        internal static IntPtr ReadPointer(IntPtr pointer, int offset)
        { return Marshal.ReadIntPtr(pointer, offset); }
        internal static ulong ReadUnsigned(IntPtr pointer, int offset)
        { return unchecked((ulong)Marshal.ReadInt64(pointer, offset)); }
        internal static int Create(IntPtr output, uint access, IntPtr attributes,
            IntPtr ioStatus, uint options)
        {
            int status = NtCreateFile(output, access, attributes, ioStatus, IntPtr.Zero,
                0x80, RelativeCreate.ShareAccess, RelativeCreate.Disposition,
                options, IntPtr.Zero, 0);
            FixedLayoutContext.RecordNativeStatus(status);
            return status;
        }
        internal static void Free(IntPtr pointer) { Marshal.FreeHGlobal(pointer); }
        // Only the existing fixed owner may call this after definite acquisition.
        // It must mark the attempt before calling and never retry a false/throw.
        internal static bool CloseTransferredHandle(IntPtr handle)
        {
            if (!FixedScratchLayout.ValidHandle(handle))
                throw new LayoutRefusal("native-close-invalid-handle");
            return CloseHandle(handle);
        }
    }
}
