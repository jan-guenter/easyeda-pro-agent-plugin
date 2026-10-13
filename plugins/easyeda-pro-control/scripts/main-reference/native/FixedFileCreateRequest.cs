// PRIVATE fixed create policy. No supplied pathname, flags, ACL or disposition.
using System;

namespace Easyeda.PrivatePreparation
{
    internal sealed class FixedFileCreateRequest
    {
        internal const int NameMaximum = 64;
        internal const uint ObjectAttributes = 0x1040; // DONT_REPARSE | CASE_INSENSITIVE
        internal const uint WriterAccess = 0x0012019F; // FILE_GENERIC_READ | FILE_GENERIC_WRITE
        internal const uint ShareAccess = 1;          // READ, never WRITE or DELETE
        internal const uint Disposition = 2;          // FILE_CREATE, never OPEN_IF
        internal const uint Options = 0x60;           // NON_DIRECTORY | SYNCHRONOUS_NONALERT
        internal const uint FileAttributes = 0x80;    // NORMAL on newly-created file
        internal readonly int Role;
        internal readonly IntPtr Parent;
        internal string Component { get { return FixedFileData.Name(Role); } }

        // Only the fixed file adapter constructs this from its checked role and
        // retained context. A raw handle here is not independent authority.
        internal FixedFileCreateRequest(int role, IntPtr parent)
        { Role = role; Parent = parent; }
    }
}
