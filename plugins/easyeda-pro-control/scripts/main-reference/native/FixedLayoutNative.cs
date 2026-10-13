// Private fixed-layout declarations. System32 imports; no path-selected DLLs.
using System;
using System.Runtime.InteropServices;

namespace Easyeda.PrivatePreparation
{
    internal static class FixedLayoutNative
    {
        [DllImport("kernel32.dll", ExactSpelling = true, CallingConvention = CallingConvention.Winapi, SetLastError = true)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        internal static extern IntPtr CreateFileW(IntPtr path, uint access, uint share,
            IntPtr security, uint disposition, uint flags, IntPtr template);
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
        internal static extern bool GetFileInformationByHandleEx(IntPtr handle, int informationClass,
            IntPtr information, uint bytes);
        [DllImport("kernel32.dll", ExactSpelling = true, CallingConvention = CallingConvention.Winapi, SetLastError = true)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        internal static extern uint GetFinalPathNameByHandleW(IntPtr handle, IntPtr path, uint chars, uint flags);
        [DllImport("kernel32.dll", ExactSpelling = true, CallingConvention = CallingConvention.Winapi, SetLastError = true)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        [return: MarshalAs(UnmanagedType.Bool)]
        internal static extern bool GetVolumeInformationByHandleW(IntPtr handle, IntPtr volumeName, uint volumeChars,
            IntPtr serial, IntPtr componentLimit, IntPtr flags, IntPtr fileSystemName, uint fileSystemChars);
        [DllImport("advapi32.dll", ExactSpelling = true, CallingConvention = CallingConvention.Winapi, SetLastError = true)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        [return: MarshalAs(UnmanagedType.Bool)]
        internal static extern bool GetKernelObjectSecurity(IntPtr handle, uint information,
            IntPtr descriptor, uint bytes, IntPtr neededBytes);
    }
}
