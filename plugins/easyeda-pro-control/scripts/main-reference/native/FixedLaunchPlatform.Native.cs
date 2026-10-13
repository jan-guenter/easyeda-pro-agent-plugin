// PRIVATE fixed observation. No environment-variable read or caller path.
using System;

namespace Easyeda.PrivatePreparation
{
    internal static class FixedLaunchPlatform
    {
        internal static string ObserveWindowsDirectory()
        {
            FixedFileData.Need(Environment.OSVersion.Platform == PlatformID.Win32NT && IntPtr.Size == 8 &&
                BitConverter.IsLittleEndian, "launch-native-platform");
            return Environment.GetFolderPath(Environment.SpecialFolder.Windows, Environment.SpecialFolderOption.None);
        }
    }
}
