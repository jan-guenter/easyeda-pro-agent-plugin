// PRIVATE native selection only. No public entrypoint or runtime provider.
using System;
using System.Runtime.InteropServices;

namespace Easyeda.PrivatePreparation
{
    internal static class AncestryNative
    {
        [DllImport("kernel32.dll", ExactSpelling = true, CallingConvention = CallingConvention.Winapi)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        private static extern IntPtr GetCurrentProcess();
        [DllImport("kernel32.dll", ExactSpelling = true,
            CallingConvention = CallingConvention.Winapi)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        private static extern uint GetDriveTypeW(IntPtr root);
        [DllImport("kernel32.dll", ExactSpelling = true,
            CallingConvention = CallingConvention.Winapi, SetLastError = true)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        private static extern uint QueryDosDeviceW(IntPtr name, IntPtr output, uint chars);
        [DllImport("kernel32.dll", ExactSpelling = true, CallingConvention = CallingConvention.Winapi, SetLastError = true)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool DuplicateHandle(IntPtr sourceProcess, IntPtr source,
            IntPtr targetProcess, IntPtr output, uint access,
            [MarshalAs(UnmanagedType.Bool)] bool inherit, uint options);
        [DllImport("ntdll.dll", ExactSpelling = true, CallingConvention = CallingConvention.Winapi)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        private static extern int NtCreateFile(IntPtr output, uint access, IntPtr attributes,
            IntPtr ioStatus, IntPtr allocation, uint fileAttributes, uint share,
            uint disposition, uint options, IntPtr ea, uint eaBytes);

        internal static void RequireHost()
        { AncestryData.Need(Environment.OSVersion.Platform == PlatformID.Win32NT && IntPtr.Size == 8 &&
            BitConverter.IsLittleEndian, "ancestry-native-host"); }
        internal static string LocalApplicationData()
        { return Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData, Environment.SpecialFolderOption.None); }
        internal static string ProgramFiles()
        { return Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles, Environment.SpecialFolderOption.None); }
        internal static void Allocate(int bytes, out IntPtr output)
        { output = IntPtr.Zero; AncestryData.Need(bytes > 0 && bytes <= AncestryNativeData.ArenaBytes,
            "ancestry-allocation-bound"); output = Marshal.AllocHGlobal(bytes); }
        internal static void Free(IntPtr pointer) { Marshal.FreeHGlobal(pointer); }
        internal static void Write(IntPtr pointer, byte[] bytes) { Marshal.Copy(bytes, 0, pointer, bytes.Length); }
        internal static byte[] Read(IntPtr pointer, int bytes)
        { AncestryData.Need(bytes > 0 && bytes <= AncestryNativeData.ArenaBytes, "ancestry-read-bound");
          byte[] result = new byte[bytes]; Marshal.Copy(pointer, result, 0, bytes); return result; }
        internal static IntPtr Pointer(IntPtr pointer) { return Marshal.ReadIntPtr(pointer); }
        internal static int LastError() { return Marshal.GetLastWin32Error(); }
        internal static uint DriveType(IntPtr root) { return GetDriveTypeW(root); }
        internal static uint DosTarget(IntPtr name, IntPtr output)
        { return QueryDosDeviceW(name, output, AncestryNativeData.DosChars); }
        internal static IntPtr OpenRoot(IntPtr path)
        { return FixedLayoutNative.CreateFileW(path, AncestryData.ReadAccess, 1, IntPtr.Zero, 3,
            0x02200000, IntPtr.Zero); }
        internal static int OpenDirectory(IntPtr output, uint access, IntPtr attributes, IntPtr ioStatus,
            uint share, uint disposition, uint options)
        { return NtCreateFile(output, access, attributes, ioStatus, IntPtr.Zero,
            0, share, disposition, options, IntPtr.Zero, 0); }
        internal static bool Duplicate(IntPtr source, IntPtr output)
        { IntPtr process = GetCurrentProcess();
          return DuplicateHandle(process, source, process, output, 0, false, AncestryData.DuplicateOptions); }
        internal static bool Basic(IntPtr handle, IntPtr output)
        { return FixedLayoutNative.GetFileInformationByHandle(handle, output); }
        internal static bool Information(IntPtr handle, int kind, IntPtr output, uint bytes)
        { return FixedLayoutNative.GetFileInformationByHandleEx(handle, kind, output, bytes); }
        internal static uint FinalPath(IntPtr handle, IntPtr output, uint flags)
        { return FixedLayoutNative.GetFinalPathNameByHandleW(handle, output, AncestryNativeData.PathChars, flags); }
        internal static bool Volume(IntPtr handle, IntPtr name, IntPtr serial, IntPtr component, IntPtr flags)
        { return FixedLayoutNative.GetVolumeInformationByHandleW(handle, IntPtr.Zero, 0,
            serial, component, flags, name, 16); }
        internal static bool Close(IntPtr handle) { return FixedLayoutNative.CloseHandle(handle); }
    }
}
