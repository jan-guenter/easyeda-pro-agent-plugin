// PRIVATE SOURCE-ONLY DATA. No pathname, token or filesystem authority.
using System;

namespace Easyeda.PrivatePreparation
{
    internal sealed class AncestryRefusal : Exception
    {
        internal readonly string Code;
        internal AncestryRefusal(string code) : base(code) { Code = code; }
    }
    internal sealed class AncestryPath
    {
        internal readonly string Drive;
        internal readonly string[] Components;
        internal AncestryPath(string drive, string[] components)
        { Drive = drive; Components = components; }
    }
    internal sealed class AncestryObservation
    {
        internal readonly uint Volume;
        internal readonly ulong FileId;
        internal readonly bool Directory, DeletePending, Reparse, Offline, Ntfs, LocalMappingQualified;
        internal readonly string FinalPath;
        internal AncestryObservation(uint volume, ulong fileId, bool directory, bool deleted,
            bool reparse, bool offline, bool ntfs, bool mapping, string path)
        { Volume = volume; FileId = fileId; Directory = directory; DeletePending = deleted;
          Reparse = reparse; Offline = offline; Ntfs = ntfs; LocalMappingQualified = mapping; FinalPath = path; }
    }
    internal sealed class AncestryAcquisition
    {
        // A future fixed native backend publishes each confirmed acquisition here
        // before any subsequent query. Raw failed-status output is not ownership.
        internal bool Entered, Completed, Confirmed, Unresolved;
        internal IntPtr Handle;
        internal AncestryAcquisition()
        { Entered = false; Completed = false; Confirmed = false; Unresolved = false; Handle = IntPtr.Zero; }
    }
    internal sealed class AncestryQuery
    {
        internal bool Entered, Completed, Unresolved;
        internal AncestryQuery() { Entered = false; Completed = false; Unresolved = false; }
        internal void Begin() { Entered = true; Completed = false; Unresolved = false; }
    }
    internal static class AncestryData
    {
        internal const int PathLimit = 4096, ComponentLimit = 255, ComponentsLimit = 32;
        // Scratch: root +32+Temp. Source: root +32+easyeda-pro+locales. One lease.
        internal const int ScratchSlots = 34, SourceSlots = 35, ChainSlots = 69, LeaseSlot = 69, Slots = 70;
        internal const uint ReadAccess = 0x001200a1, Share = 1, OpenDisposition = 1,
            ObjectFlags = 0x1040, DirectoryOptions = 0x00200021, DuplicateOptions = 2;
        internal static void Need(bool value, string code)
        { if (!value) throw new AncestryRefusal(code); }
        internal static bool Handle(IntPtr value)
        { return value != IntPtr.Zero && value != new IntPtr(-1); }
        internal static void Component(string value)
        {
            Need(value != null && value.Length > 0 && value.Length <= ComponentLimit &&
                value != "." && value != ".." && value[value.Length - 1] != '.' &&
                value[value.Length - 1] != ' ', "ancestry-component");
            for (int i = 0; i < value.Length; i++)
            {
                char c = value[i];
                Need(c >= 32 && c != '\\' && c != '/' && c != ':' && c != '*' && c != '?' &&
                    c != '"' && c != '<' && c != '>' && c != '|', "ancestry-component-character");
                if (Char.IsHighSurrogate(c))
                { Need(i + 1 < value.Length && Char.IsLowSurrogate(value[i + 1]), "ancestry-unicode"); i++; }
                else Need(!Char.IsLowSurrogate(c), "ancestry-unicode");
            }
            int dot = value.IndexOf('.'); string stem = dot < 0 ? value : value.Substring(0, dot);
            Need(!AsciiEqual(stem, "CON") && !AsciiEqual(stem, "PRN") && !AsciiEqual(stem, "AUX") &&
                !AsciiEqual(stem, "NUL") && !(stem.Length == 4 &&
                (AsciiEqual(stem.Substring(0, 3), "COM") || AsciiEqual(stem.Substring(0, 3), "LPT")) &&
                stem[3] >= '0' && stem[3] <= '9'), "ancestry-device-component");
        }
        internal static AncestryPath Discovery(string value)
        {
            Need(value != null && value.Length >= 4 && value.Length <= PathLimit &&
                ((value[0] >= 'A' && value[0] <= 'Z') || (value[0] >= 'a' && value[0] <= 'z')) &&
                value[1] == ':' && value[2] == '\\' && value[value.Length - 1] != '\\', "ancestry-discovery-path");
            string[] parts = value.Substring(3).Split('\\');
            Need(parts.Length > 0 && parts.Length <= ComponentsLimit, "ancestry-depth");
            for (int i = 0; i < parts.Length; i++) Component(parts[i]);
            return new AncestryPath(value.Substring(0, 3), parts);
        }
        internal static bool AsciiEqual(string a, string b)
        {
            if (a == null || b == null || a.Length != b.Length) return false;
            for (int i = 0; i < a.Length; i++)
            {
                char x = a[i], y = b[i];
                if (x >= 'A' && x <= 'Z') x = (char)(x + 32);
                if (y >= 'A' && y <= 'Z') y = (char)(y + 32);
                if (x != y) return false;
            }
            return true;
        }
        internal static string VolumePrefix(string value)
        {
            const string prefix = @"\\?\Volume{";
            Need(value != null && value.Length >= 49 && value.Length <= PathLimit &&
                value.StartsWith(prefix, StringComparison.Ordinal) && value[47] == '}' && value[48] == '\\',
                "ancestry-volume-path");
            for (int i = 0; i < 36; i++)
            {
                char c = value[11 + i]; bool dash = i == 8 || i == 13 || i == 18 || i == 23;
                Need(dash ? c == '-' : c >= '0' && c <= '9' || c >= 'a' && c <= 'f' ||
                    c >= 'A' && c <= 'F', "ancestry-volume-guid");
            }
            if (value.Length > 49)
            {
                string[] parts = value.Substring(49).Split('\\');
                Need(parts.Length <= ComponentsLimit + 2, "ancestry-final-depth");
                for (int i = 0; i < parts.Length; i++) Component(parts[i]);
            }
            return value.Substring(0, 49);
        }
        internal static void Ordinary(AncestryObservation value)
        {
            Need(value != null && value.FileId != 0 && value.Directory && !value.DeletePending &&
                !value.Reparse && !value.Offline && value.Ntfs && value.LocalMappingQualified,
                "ancestry-observation");
            VolumePrefix(value.FinalPath);
        }
        internal static void Same(AncestryObservation a, AncestryObservation b)
        {
            Ordinary(a); Ordinary(b);
            Need(a.Volume == b.Volume && a.FileId == b.FileId &&
                String.Equals(a.FinalPath, b.FinalPath, StringComparison.Ordinal), "ancestry-drift");
        }
        internal static void Child(AncestryObservation parent, string name, AncestryObservation child)
        {
            Ordinary(parent); Ordinary(child); Component(name);
            string prefix = parent.FinalPath.EndsWith("\\", StringComparison.Ordinal) ?
                parent.FinalPath : parent.FinalPath + "\\";
            Need(parent.Volume == child.Volume && parent.FileId != child.FileId &&
                child.FinalPath.StartsWith(prefix, StringComparison.Ordinal) &&
                AsciiEqual(child.FinalPath.Substring(prefix.Length), name), "ancestry-child-join");
            // This checks a returned name from the acquired handle. It does not
            // authorize a second lookup or equate Unicode/case-sensitive paths.
        }
        internal static void OwnerSid(byte[] value)
        {
            Need(value != null && value.Length >= 12 && value.Length <= 68 && value[0] == 1 &&
                value[1] >= 1 && value[1] <= 15 && value.Length == 8 + value[1] * 4, "ancestry-owner-data");
            bool system = value.Length == 12 && value[1] == 1 && value[7] == 5 && value[8] == 18;
            for (int i = 2; i < 7 && system; i++) system &= value[i] == 0;
            for (int i = 9; i < 12 && system; i++) system &= value[i] == 0;
            Need(!system, "ancestry-system-owner");
        }
        internal static bool Equal(byte[] a, byte[] b)
        {
            if (a == null || b == null || a.Length != b.Length) return false;
            for (int i = 0; i < a.Length; i++) if (a[i] != b[i]) return false;
            return true;
        }
    }
}
