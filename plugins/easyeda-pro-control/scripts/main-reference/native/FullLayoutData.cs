// PRIVATE SOURCE-ONLY. Exact data decoding, not pathname or launch authority.
using System;

namespace Easyeda.PrivatePreparation
{
    internal static class FullLayoutData
    {
        internal static void CheckNonce(string nonce)
        {
            Need(nonce != null && nonce.Length == 64, "retained-layout-nonce");
            for (int i = 0; i < nonce.Length; i++)
                Need(nonce[i] >= '0' && nonce[i] <= '9' || nonce[i] >= 'a' && nonce[i] <= 'f',
                    "retained-layout-nonce");
        }
        internal const string Guard = "easyeda-preparation-guard";
        internal static readonly string[] Names = { "", "runtime", "locales", "resources",
            "app", "evidence", "user-data", "session-data", "logs", "crash-dumps", "temp" };
        internal static readonly int[] Parents = { -1, 0, 1, 1, 3, 0, 0, 0, 0, 0, 0 };
        internal static void Need(bool value, string code)
        { if (!value) throw new LayoutRefusal(code); }
        internal static uint U32(byte[] bytes, int offset)
        {
            Need(bytes != null && offset >= 0 && offset <= bytes.Length - 4, "full-layout-data-bound");
            return (uint)bytes[offset] | (uint)bytes[offset + 1] << 8 |
                (uint)bytes[offset + 2] << 16 | (uint)bytes[offset + 3] << 24;
        }
        internal static ulong U64(byte[] bytes, int offset)
        { return U32(bytes, offset) | (ulong)U32(bytes, offset + 4) << 32; }
        internal static string Component(int frame, string nonce)
        {
            Need(frame >= 0 && frame < 22, "full-layout-frame-index");
            if ((frame & 1) != 0) return Guard;
            return frame == 0 ? FixedScratchLayout.RootPrefix + nonce : Names[frame / 2];
        }
        internal static int ParentSlot(int frame)
        {
            Need(frame >= 0 && frame < 22, "full-layout-frame-index");
            if ((frame & 1) != 0) return frame;
            int parent = Parents[frame / 2];
            return parent < 0 ? 0 : 1 + parent * 2;
        }
        internal static string PathForSlot(string bootstrap, int slot, string nonce)
        {
            Need(slot >= 0 && slot < 23, "full-layout-path-slot");
            if (slot == 0) return bootstrap;
            int frame = slot - 1;
            return PathForSlot(bootstrap, ParentSlot(frame), nonce) + "\\" + Component(frame, nonce);
        }
        // 4096 ancestry code units plus <=136 fixed suffix units and NUL.
        // Verify every literal role path as well; this is not a caller limit.
        internal const int PathCapacity = 4352;
        internal static string BindOriginalAnchor(AncestryObservation expected, HandleObservation before,
            HandleObservation after, string returnedPath, string nonce)
        {
            AncestryData.Ordinary(expected); CheckNonce(nonce);
            Need(SameIdentity(before, after) &&
                before.Volume == expected.Volume && before.IdLow == expected.FileId && before.IdHigh == 0 &&
                before.Directory && after.Directory && !before.DeletePending && !after.DeletePending &&
                before.ReparseTag == 0 && after.ReparseTag == 0 &&
                (before.Attributes & 0x1410) == 0x10 && before.Attributes == after.Attributes &&
                before.Links == after.Links && before.Length == after.Length &&
                String.Equals(expected.FinalPath, returnedPath, StringComparison.Ordinal),
                "full-layout-original-anchor-binding");
            for (int i = 0; i < 23; i++)
                Need(PathForSlot(returnedPath, i, nonce).Length < PathCapacity, "full-layout-path-capacity");
            return returnedPath;
        }
        internal static bool SameIdentity(HandleObservation a, HandleObservation b)
        { return a.Volume == b.Volume && a.IdLow == b.IdLow && a.IdHigh == b.IdHigh; }
        internal static HandleObservation Decode(byte[] basic, byte[] tag, byte[] standard,
            byte[] descriptor, byte[] expectedOwner, bool created)
        {
            Need(basic != null && basic.Length == 52 && tag != null && tag.Length == 8 &&
                standard != null && standard.Length == 24, "full-layout-observation-size");
            uint attributes = U32(tag, 0), links = U32(standard, 16);
            ulong length = U64(standard, 8), oldLength = (ulong)U32(basic, 32) << 32 | U32(basic, 36);
            Need(attributes == U32(basic, 0) && standard[20] <= 1 && standard[21] <= 1 &&
                ((attributes & 0x10) != 0) == (standard[21] == 1) && length <= long.MaxValue &&
                U64(standard, 0) <= long.MaxValue && oldLength == length && U32(basic, 40) == links,
                "full-layout-observation-join");
            ulong id = (ulong)U32(basic, 44) << 32 | U32(basic, 48);
            Need(id != 0, "full-layout-zero-file-id");
            bool policy = false;
            if (created)
            {
                // The expected SID comes from a separately retained process-token
                // security owner, never from this applied descriptor or a caller.
                OwnerSecurityData.RequireFixedDescriptor(descriptor, expectedOwner);
                policy = true;
            }
            else Need(descriptor == null, "full-layout-bootstrap-policy-scope");
            return new HandleObservation(U32(basic, 28), id, 0, standard[21] == 1, standard[20] == 1,
                attributes, U32(tag, 4), links, (long)length, policy);
        }
    }
}
