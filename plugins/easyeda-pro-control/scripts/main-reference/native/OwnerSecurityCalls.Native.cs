// PRIVATE UNEXECUTED native fragment. Compile separately from the fake backend.
// No file/process launch APIs, caller provider, path, SID input or activation.
using System;
using System.Runtime.InteropServices;

namespace Easyeda.PrivatePreparation
{
    internal static class OwnerSecurityCalls
    {
        [DllImport("kernel32.dll", ExactSpelling = true, CallingConvention = CallingConvention.Winapi)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        private static extern IntPtr GetCurrentProcess();
        [DllImport("kernel32.dll", ExactSpelling = true, CallingConvention = CallingConvention.Winapi)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        private static extern IntPtr GetCurrentThread();
        [DllImport("advapi32.dll", ExactSpelling = true, CallingConvention = CallingConvention.Winapi,
            SetLastError = true)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool OpenProcessToken(IntPtr process, uint access, out IntPtr token);
        [DllImport("advapi32.dll", ExactSpelling = true, CallingConvention = CallingConvention.Winapi,
            SetLastError = true)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool OpenThreadToken(IntPtr thread, uint access,
            [MarshalAs(UnmanagedType.Bool)] bool asSelf, out IntPtr token);
        [DllImport("advapi32.dll", ExactSpelling = true, CallingConvention = CallingConvention.Winapi,
            SetLastError = true)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool GetTokenInformation(IntPtr token, int information,
            IntPtr buffer, uint bytes, out uint returned);
        [DllImport("advapi32.dll", ExactSpelling = true, CallingConvention = CallingConvention.Winapi)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool IsValidSid(IntPtr sid);
        [DllImport("advapi32.dll", EntryPoint = "ConvertStringSecurityDescriptorToSecurityDescriptorW",
            ExactSpelling = true, CharSet = CharSet.Unicode,
            CallingConvention = CallingConvention.Winapi, SetLastError = true)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool ConvertStringSecurityDescriptorToSecurityDescriptorW(
            string sddl, uint revision, out IntPtr descriptor, out uint bytes);
        [DllImport("advapi32.dll", ExactSpelling = true, CallingConvention = CallingConvention.Winapi)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool IsValidSecurityDescriptor(IntPtr descriptor);
        [DllImport("kernel32.dll", ExactSpelling = true, CallingConvention = CallingConvention.Winapi,
            SetLastError = true)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool CloseHandle(IntPtr handle);
        [DllImport("kernel32.dll", ExactSpelling = true, CallingConvention = CallingConvention.Winapi,
            SetLastError = true)]
        [DefaultDllImportSearchPaths(DllImportSearchPath.System32)]
        private static extern IntPtr LocalFree(IntPtr memory);

        internal static void RequirePlatform()
        {
            if (Environment.OSVersion.Platform != PlatformID.Win32NT || IntPtr.Size != 8 ||
                !BitConverter.IsLittleEndian)
                throw new LayoutRefusal("owner-security-platform");
        }
        internal static bool OpenCurrentThreadToken(out IntPtr token, out int error)
        {
            token = IntPtr.Zero; error = 0;
            bool success = OpenThreadToken(GetCurrentThread(), 0x0008, true, out token);
            if (!success) error = Marshal.GetLastWin32Error();
            return success;
        }
        internal static bool OpenCurrentProcessToken(out IntPtr token)
        { token = IntPtr.Zero; return OpenProcessToken(GetCurrentProcess(), 0x0008, out token); }
        internal static void AllocateTokenBuffer(out IntPtr buffer)
        { buffer = IntPtr.Zero; buffer = Marshal.AllocHGlobal(FixedOwnerSecurity.TokenMaximumBytes); }
        internal static bool QueryTokenUser(IntPtr token, IntPtr buffer, out uint returned)
        { return GetTokenInformation(token, 1, buffer, FixedOwnerSecurity.TokenMaximumBytes, out returned); }
        internal static IntPtr ReadPointer(IntPtr buffer) { return Marshal.ReadIntPtr(buffer); }
        internal static byte[] CopyBytes(IntPtr source, int count)
        {
            if (count <= 0 || count > FixedOwnerSecurity.TokenMaximumBytes)
                throw new LayoutRefusal("owner-security-copy-bound");
            byte[] bytes = new byte[count]; Marshal.Copy(source, bytes, 0, count); return bytes;
        }
        internal static bool ValidSid(IntPtr sid) { return IsValidSid(sid); }
        internal static bool ConvertFixedSddl(string sddl, out IntPtr descriptor, out uint bytes)
        {
            descriptor = IntPtr.Zero; bytes = 0;
            // This internal method is called only with FixedSddl's private result.
            // The core exports neither this native adapter nor a runtime callback.
            return ConvertStringSecurityDescriptorToSecurityDescriptorW(sddl, 1, out descriptor, out bytes);
        }
        internal static bool ValidDescriptor(IntPtr descriptor) { return IsValidSecurityDescriptor(descriptor); }
        internal static bool CloseToken(IntPtr token) { return CloseHandle(token); }
        internal static void FreeTokenBuffer(IntPtr buffer) { Marshal.FreeHGlobal(buffer); }
        internal static bool FreeDescriptor(IntPtr descriptor) { return LocalFree(descriptor) == IntPtr.Zero; }
    }
}
