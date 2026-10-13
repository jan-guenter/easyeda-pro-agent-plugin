// PRIVATE fixed existing-read policy. No supplied filename, flags or disposition.
using System;
namespace Easyeda.PrivatePreparation
{
    internal sealed class FixedReadOpenRequest
    {
        internal const int NameMaximum = 64;
        internal const uint ObjectAttributes = 0x1040, ReadAccess = 0x00120089,
            ShareAccess = 1, Disposition = 1, Options = 0x60, FileAttributes = 0;
        internal readonly int Role;
        internal readonly IntPtr Parent;
        internal string Component { get { return FixedFileData.Name(Role); } }
        internal FixedReadOpenRequest(int role, IntPtr parent) { Role = role; Parent = parent; }
    }
}
