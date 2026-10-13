// PRIVATE fixed-role policy; no pathname, native-operation or provider input.
using System;

namespace Easyeda.PrivatePreparation
{
    internal static class FixedFileBackendPolicy
    {
        internal const int FailedMaximum = FixedFileData.SlotCount + 2;
        internal const int ArenaBytes = 81920, CountOffset = 65536, PathOffset = 65552;
        internal const int PathCharacters = 4352, DescriptorMaximum = 1024;
        internal static void Need(bool value, string code) { FixedFileData.Need(value, code); }
        internal static bool Same(byte[] a, byte[] b)
        {
            if (a == null || b == null || a.Length != b.Length) return false;
            for (int i = 0; i < a.Length; i++) if (a[i] != b[i]) return false;
            return true;
        }
        internal static int Part(FixedFileCall call)
        {
            if (call.Role >= 0 && call.Role < FixedFileData.RuntimeCount && call.Slot == 87 + call.Role)
                return 3;
            if (call.Role >= 29 && call.Role <= 33 && call.Slot == 105 + call.Role - 29)
                return 4;
            Need(call.Role >= 0 && call.Role < FixedFileData.CreatedCount &&
                call.Slot >= call.Role * 3 && call.Slot <= call.Role * 3 + 2,
                "file-backend-role-slot");
            return call.Slot - call.Role * 3;
        }
        internal static long NativeBudget(FixedFileCall call)
        {
            if (call.Operation != FileOperation.Digest) return 16;
            FixedFileData.Length(call.Role, call.ExpectedLength);
            // Seek, at most one Read per byte of positive progress, then EOF.
            return checked(call.ExpectedLength + 2);
        }
    }
}
