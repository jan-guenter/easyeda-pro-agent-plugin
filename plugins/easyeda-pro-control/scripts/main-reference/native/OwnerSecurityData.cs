// Pure bounded DATA checks. These functions do not issue identity or authority.
using System;
using System.Globalization;
using System.Text;

namespace Easyeda.PrivatePreparation
{
    internal static class OwnerSecurityData
    {
        private static readonly byte[] SystemSid = { 1, 1, 0, 0, 0, 0, 0, 5, 18, 0, 0, 0 };
        internal static byte[] ReadSid(byte[] bytes, int offset)
        {
            Range(bytes, offset, 8);
            int count = bytes[offset + 1];
            if (bytes[offset] != 1 || count < 1 || count > 15)
                throw new LayoutRefusal("owner-security-sid-format");
            int length = 8 + count * 4;
            Range(bytes, offset, length);
            byte[] sid = new byte[length]; Array.Copy(bytes, offset, sid, 0, length);
            return sid;
        }

        internal static string FixedSddl(byte[] sid)
        {
            byte[] checkedSid = ReadSid(sid, 0);
            if (checkedSid.Length != sid.Length || Equal(sid, SystemSid))
                throw new LayoutRefusal("owner-security-owner-profile");
            ulong authority = 0;
            for (int i = 2; i < 8; i++) authority = (authority << 8) | sid[i];
            StringBuilder owner = new StringBuilder("S-1-");
            if (authority <= UInt32.MaxValue) owner.Append(authority.ToString(CultureInfo.InvariantCulture));
            else owner.Append("0x").Append(authority.ToString("x12", CultureInfo.InvariantCulture));
            for (int i = 0; i < sid[1]; i++)
                owner.Append('-').Append(U32(sid, 8 + 4 * i).ToString(CultureInfo.InvariantCulture));
            // No account lookup, environment string or caller-controlled grammar.
            string text = owner.ToString();
            return "O:" + text + "D:P(A;OICI;FA;;;" + text + ")(A;OICI;FA;;;SY)";
        }

        internal static void RequireFixedDescriptor(byte[] bytes, byte[] expectedOwner)
        {
            if (bytes == null || bytes.Length < 20 ||
                bytes.Length > FixedOwnerSecurity.DescriptorMaximumBytes)
                throw new LayoutRefusal("owner-security-descriptor-size");
            // Only the exact self-relative/present/protected construction profile.
            if (bytes[0] != 1 || bytes[1] != 0 || U16(bytes, 2) != 0x9004 ||
                U32(bytes, 8) != 0 || U32(bytes, 12) != 0)
                throw new LayoutRefusal("owner-security-descriptor-header");
            int owner = Offset(bytes, 4), acl = Offset(bytes, 16);
            byte[] ownerSid = ReadSid(bytes, owner);
            if (!Equal(ownerSid, expectedOwner) || Equal(ownerSid, SystemSid))
                throw new LayoutRefusal("owner-security-owner-mismatch");
            Range(bytes, acl, 8);
            int aclBytes = U16(bytes, acl + 2);
            Range(bytes, acl, aclBytes);
            if (bytes[acl] != 2 || bytes[acl + 1] != 0 || U16(bytes, acl + 4) != 2 ||
                U16(bytes, acl + 6) != 0 || aclBytes < 8)
                throw new LayoutRefusal("owner-security-acl-header");
            int next = RequireAce(bytes, acl + 8, acl + aclBytes, expectedOwner);
            next = RequireAce(bytes, next, acl + aclBytes, SystemSid);
            if (next != acl + aclBytes)
                throw new LayoutRefusal("owner-security-acl-trailing");
            // Offset order is not assumed. Components must be disjoint in this
            // fixed construction profile; no pointer/body alias normalization.
            if (owner < acl + aclBytes && acl < owner + ownerSid.Length)
                throw new LayoutRefusal("owner-security-component-alias");
            // Disjoint bounded components plus this exact total cover all bytes
            // after the header. No ignored gaps, padding or trailing payload.
            if (bytes.Length != 20 + ownerSid.Length + aclBytes)
                throw new LayoutRefusal("owner-security-unused-bytes");
        }

        private static int RequireAce(byte[] bytes, int offset, int end, byte[] expected)
        {
            Range(bytes, offset, 8);
            int length = U16(bytes, offset + 2);
            if (offset > end - 8 || length < 16 || offset > end - length ||
                bytes[offset] != 0 || bytes[offset + 1] != 3 || U32(bytes, offset + 4) != 0x001f01ff)
                throw new LayoutRefusal("owner-security-ace-policy");
            byte[] sid = ReadSid(bytes, offset + 8);
            if (length != 8 + sid.Length || !Equal(sid, expected))
                throw new LayoutRefusal("owner-security-ace-sid");
            return offset + length;
        }

        private static int Offset(byte[] bytes, int field)
        {
            uint offset = U32(bytes, field);
            if (offset < 20 || offset % 4 != 0 || offset > (uint)(bytes.Length - 8))
                throw new LayoutRefusal("owner-security-descriptor-offset");
            return checked((int)offset);
        }
        private static void Range(byte[] bytes, int offset, int count)
        {
            if (bytes == null || offset < 0 || count < 0 || offset > bytes.Length - count)
                throw new LayoutRefusal("owner-security-data-bound");
        }
        private static int U16(byte[] bytes, int offset)
        { Range(bytes, offset, 2); return bytes[offset] | bytes[offset + 1] << 8; }
        private static uint U32(byte[] bytes, int offset)
        {
            Range(bytes, offset, 4);
            return (uint)bytes[offset] | (uint)bytes[offset + 1] << 8 |
                (uint)bytes[offset + 2] << 16 | (uint)bytes[offset + 3] << 24;
        }
        private static bool Equal(byte[] left, byte[] right)
        {
            if (left == null || right == null || left.Length != right.Length) return false;
            for (int i = 0; i < left.Length; i++) if (left[i] != right[i]) return false;
            return true;
        }
    }
}
