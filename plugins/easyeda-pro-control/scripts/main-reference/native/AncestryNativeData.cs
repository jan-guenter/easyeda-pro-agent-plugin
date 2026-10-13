// PRIVATE bounded data predicates. No discovery, lookup or authority is issued.
using System;
using System.Text;

namespace Easyeda.PrivatePreparation
{
    internal sealed class AncestryNativeFacts
    {
        internal readonly uint Volume, Attributes, Tag, Links;
        internal readonly ulong FileId, Length;
        internal readonly bool Directory, Deleted;
        internal AncestryNativeFacts(uint volume, ulong id, uint attributes, uint tag,
            uint links, ulong length, bool directory, bool deleted)
        { Volume = volume; FileId = id; Attributes = attributes; Tag = tag; Links = links;
          Length = length; Directory = directory; Deleted = deleted; }
    }
    internal static class AncestryNativeData
    {
        internal const int ArenaBytes = 32768, PathOffset = 1024, PathChars = 4097,
            DosOffset = 10240, DosChars = 4096, CountsOffset = 256, DuplicateOffset = 384, InputOffset = 512, InputChars = 64;
        private static readonly UnicodeEncoding Utf16 = new UnicodeEncoding(false, false, true);
        internal static void Need(bool value, string code) { AncestryData.Need(value, code); }
        internal static uint U32(byte[] value, int at)
        {
            Need(value != null && at >= 0 && at <= value.Length - 4, "ancestry-native-data-bound");
            return (uint)value[at] | (uint)value[at + 1] << 8 | (uint)value[at + 2] << 16 | (uint)value[at + 3] << 24;
        }
        internal static ulong U64(byte[] value, int at) { return U32(value, at) | (ulong)U32(value, at + 4) << 32; }
        internal static void Put16(byte[] value, int at, int number)
        { value[at] = (byte)number; value[at + 1] = (byte)(number >> 8); }
        internal static void Put32(byte[] value, int at, uint number)
        { for (int i = 0; i < 4; i++) value[at + i] = (byte)(number >> (i * 8)); }
        internal static void Put64(byte[] value, int at, ulong number)
        { for (int i = 0; i < 8; i++) value[at + i] = (byte)(number >> (i * 8)); }
        internal static byte[] Wide(string value) { return Utf16.GetBytes(value + "\0"); }
        internal static string WideResult(byte[] value, int chars)
        {
            Need(value != null && chars > 0 && chars < PathChars && value.Length == (chars + 1) * 2 &&
                value[value.Length - 1] == 0 && value[value.Length - 2] == 0, "ancestry-native-wide-bound");
            string result = Utf16.GetString(value, 0, chars * 2);
            Need(result.IndexOf('\0') < 0, "ancestry-native-wide-nul"); return result;
        }
        internal static string CurrentDosTarget(byte[] value, int chars)
        {
            Need(value != null && chars >= 3 && chars <= DosChars && value.Length == chars * 2,
                "ancestry-dos-bound");
            string text = Utf16.GetString(value);
            Need(text[chars - 1] == '\0' && text[chars - 2] == '\0', "ancestry-dos-termination");
            int first = text.IndexOf('\0'); Need(first > 0, "ancestry-dos-empty");
            int start = 0;
            while (start < chars - 1)
            {
                int end = text.IndexOf('\0', start);
                Need(end > start && end < chars - 1, "ancestry-dos-shape");
                for (int i = start; i < end; i++) Need(text[i] >= 32, "ancestry-dos-control");
                start = end + 1;
            }
            Need(start == chars - 1, "ancestry-dos-trailing");
            return text.Substring(0, first);
        }
        internal static void Drive(string value)
        { Need(value != null && value.Length == 3 && value[1] == ':' && value[2] == '\\' &&
            (value[0] >= 'A' && value[0] <= 'Z' || value[0] >= 'a' && value[0] <= 'z'), "ancestry-native-drive"); }
        internal static void DirectTarget(string value)
        {
            const string prefix = @"\Device\HarddiskVolume";
            Need(value != null && value.StartsWith(prefix, StringComparison.Ordinal) &&
                value.Length > prefix.Length && value.Length <= prefix.Length + 10, "ancestry-direct-volume");
            for (int i = prefix.Length; i < value.Length; i++)
                Need(value[i] >= '0' && value[i] <= '9', "ancestry-direct-volume");
        }
        internal static string VolumeDosName(string guidRoot)
        { Need(AncestryData.VolumePrefix(guidRoot) == guidRoot, "ancestry-native-volume-root");
          return guidRoot.Substring(4, guidRoot.Length - 5); }
        internal static void Mapping(string driveTarget, string volumeTarget, string ntRoot)
        {
            DirectTarget(driveTarget); DirectTarget(volumeTarget);
            Need(driveTarget == volumeTarget && ntRoot == driveTarget + "\\", "ancestry-mapping-join");
        }
        // Same field joins as the reviewed full11 decoder, with no applied-ACL claim.
        internal static AncestryNativeFacts Facts(byte[] basic, byte[] tag, byte[] standard)
        {
            Need(basic != null && basic.Length == 52 && tag != null && tag.Length == 8 &&
                standard != null && standard.Length == 24, "ancestry-facts-size");
            uint attributes = U32(tag, 0), links = U32(standard, 16);
            ulong length = U64(standard, 8), oldLength = (ulong)U32(basic, 32) << 32 | U32(basic, 36);
            Need(attributes == U32(basic, 0) && standard[20] <= 1 && standard[21] <= 1 &&
                ((attributes & 0x10) != 0) == (standard[21] == 1) && length <= long.MaxValue &&
                U64(standard, 0) <= long.MaxValue && oldLength == length && U32(basic, 40) == links,
                "ancestry-facts-join");
            ulong id = (ulong)U32(basic, 44) << 32 | U32(basic, 48);
            Need(id != 0 && (attributes & 0x1410) == 0x10 && U32(tag, 4) == 0 &&
                standard[20] == 0 && standard[21] == 1, "ancestry-facts-ordinary");
            return new AncestryNativeFacts(U32(basic, 28), id, attributes, U32(tag, 4), links,
                length, true, false);
        }
        internal static void Same(AncestryNativeFacts a, AncestryNativeFacts b)
        { Need(a.Volume == b.Volume && a.FileId == b.FileId && a.Attributes == b.Attributes &&
            a.Tag == b.Tag && a.Links == b.Links && a.Length == b.Length && a.Directory == b.Directory &&
            a.Deleted == b.Deleted, "ancestry-native-facts-drift"); }
    }
}
