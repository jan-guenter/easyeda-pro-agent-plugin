// PRIVATE fixed-role backend. Native declarations exactly match the qualified one-file fixture.
using System;
using System.Runtime.InteropServices;
using System.Security.Cryptography;

namespace Easyeda.PrivatePreparation
{
    internal static class FixedFileNative
    {
        internal static SHA256 CreateSha256() { return SHA256.Create(); }
        internal static IntPtr Allocate(int bytes) { return Marshal.AllocHGlobal(bytes); }
        internal static void Free(IntPtr pointer) { Marshal.FreeHGlobal(pointer); }
        internal static void Put(IntPtr pointer, byte[] bytes, int offset, int count)
        { Marshal.Copy(bytes, offset, pointer, count); }
        internal static void Get(IntPtr pointer, byte[] bytes, int offset, int count)
        { Marshal.Copy(pointer, bytes, offset, count); }
        internal static int I32(IntPtr pointer) { return Marshal.ReadInt32(pointer); }
        internal static long I64(IntPtr pointer) { return Marshal.ReadInt64(pointer); }
        internal static IntPtr Pointer(IntPtr pointer) { return Marshal.ReadIntPtr(pointer); }
        internal static int Error() { return Marshal.GetLastWin32Error(); }

        [DllImport("ntdll.dll", ExactSpelling = true, CallingConvention = CallingConvention.Winapi)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        internal static extern int NtCreateFile(IntPtr output, uint access, IntPtr attributes,
            IntPtr ioStatus, IntPtr allocationSize, uint fileAttributes, uint share, uint disposition,
            uint options, IntPtr ea, uint eaLength);

        [DllImport("kernel32.dll", ExactSpelling = true, CallingConvention = CallingConvention.Winapi, SetLastError = true)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        internal static extern IntPtr ReOpenFile(IntPtr original, uint access, uint share, uint flags);
        [DllImport("kernel32.dll", ExactSpelling = true, CallingConvention = CallingConvention.Winapi, SetLastError = true)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        [return: MarshalAs(UnmanagedType.Bool)]
        internal static extern bool ReadFile(IntPtr handle, IntPtr buffer, uint count, IntPtr transferred, IntPtr overlapped);
        [DllImport("kernel32.dll", ExactSpelling = true, CallingConvention = CallingConvention.Winapi, SetLastError = true)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        [return: MarshalAs(UnmanagedType.Bool)]
        internal static extern bool WriteFile(IntPtr handle, IntPtr buffer, uint count, IntPtr transferred, IntPtr overlapped);
        [DllImport("kernel32.dll", ExactSpelling = true, CallingConvention = CallingConvention.Winapi, SetLastError = true)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        [return: MarshalAs(UnmanagedType.Bool)]
        internal static extern bool FlushFileBuffers(IntPtr handle);
        [DllImport("kernel32.dll", ExactSpelling = true, CallingConvention = CallingConvention.Winapi, SetLastError = true)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        [return: MarshalAs(UnmanagedType.Bool)]
        internal static extern bool SetFilePointerEx(IntPtr handle, long distance, IntPtr position, uint origin);
        [DllImport("kernel32.dll", ExactSpelling = true, CallingConvention = CallingConvention.Winapi, SetLastError = true)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        [return: MarshalAs(UnmanagedType.Bool)]
        internal static extern bool CloseHandle(IntPtr handle);
        [DllImport("kernel32.dll", ExactSpelling = true, CallingConvention = CallingConvention.Winapi, SetLastError = true)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        [return: MarshalAs(UnmanagedType.Bool)]
        internal static extern bool GetFileInformationByHandle(IntPtr handle, IntPtr information);
        [DllImport("kernel32.dll", ExactSpelling = true, CallingConvention = CallingConvention.Winapi, SetLastError = true)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        [return: MarshalAs(UnmanagedType.Bool)]
        internal static extern bool GetFileInformationByHandleEx(IntPtr handle, int kind, IntPtr information, uint bytes);
        [DllImport("kernel32.dll", ExactSpelling = true, CallingConvention = CallingConvention.Winapi, SetLastError = true)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        internal static extern uint GetFinalPathNameByHandleW(IntPtr handle, IntPtr name, uint chars, uint flags);
        [DllImport("advapi32.dll", ExactSpelling = true, CallingConvention = CallingConvention.Winapi, SetLastError = true)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        [return: MarshalAs(UnmanagedType.Bool)]
        internal static extern bool GetKernelObjectSecurity(IntPtr handle, uint information, IntPtr descriptor, uint bytes, IntPtr needed);
    }
}
