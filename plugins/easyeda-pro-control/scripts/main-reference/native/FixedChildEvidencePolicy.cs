// PRIVATE exact child-file data policy. No default-owner provenance claim.
using System;

namespace Easyeda.PrivatePreparation
{
    internal static class FixedChildEvidencePolicy
    {
        private static readonly byte[] system = { 1, 1, 0, 0, 0, 0, 0, 5, 18, 0, 0, 0 };
        private static void Put(byte[] bytes, int at, uint value, int count)
        { for (int i = 0; i < count; i++) bytes[at + i] = (byte)(value >> (8 * i)); }
        private static void Ace(byte[] bytes, int at, byte[] sid)
        {
            Put(bytes, at + 2, (uint)(8 + sid.Length), 2);
            Put(bytes, at + 4, 0x001f01ff, 4);
            Array.Copy(sid, 0, bytes, at + 8, sid.Length);
        }
        internal static void Require(byte[] actual, byte[] expectedUser)
        {
            FixedFileData.Need(expectedUser != null && expectedUser.Length >= 8 &&
                expectedUser[0] == 1 && expectedUser[1] <= 15 &&
                expectedUser.Length == 8 + 4 * expectedUser[1], "child-policy-user-sid");
            int s = expectedUser.Length, acl = 20 + 2 * s;
            FixedFileData.Need(actual != null && actual.Length == 56 + 3 * s, "child-policy-length");
            // Exact canonical bytes cover every header, offset, reserved byte,
            // trustee, mask and gap. The input descriptor is never modified.
            byte[] expected = new byte[actual.Length];
            expected[0] = 1; Put(expected, 2, 0x8004, 2);
            Put(expected, 4, 20, 4); Put(expected, 8, (uint)(20 + s), 4);
            Put(expected, 16, (uint)acl, 4);
            Array.Copy(expectedUser, 0, expected, 20, s);
            Array.Copy(expectedUser, 0, expected, 20 + s, s);
            expected[acl] = 2; Put(expected, acl + 2, (uint)(36 + s), 2);
            Put(expected, acl + 4, 2, 2);
            Ace(expected, acl + 8, expectedUser);
            Ace(expected, acl + 16 + s, system);
            FixedFileData.Need(FixedFileBackendPolicy.Same(actual, expected), "child-policy-descriptor");
        }
    }
}
