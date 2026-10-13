// PRIVATE source-only data binding. No process launch or pathname authorization.
using System;
using System.Text;

namespace Easyeda.PrivatePreparation
{
    internal sealed class PreparedDirectoryBinding
    {
        internal readonly LayoutRole Role;
        internal readonly IntPtr Handle;
        internal readonly string Name;
        internal PreparedDirectoryBinding(LayoutRole role, IntPtr handle, string name)
        { Role = role; Handle = handle; Name = name; }
    }
    internal sealed class PreparedDirectorySnapshot
    {
        internal readonly FixedLayoutContext Context;
        internal readonly FixedSourceAncestry Ancestry;
        internal readonly string Nonce;
        private readonly PreparedDirectoryBinding[] entries;
        internal PreparedDirectorySnapshot(FixedLayoutContext context, FixedSourceAncestry ancestry,
            string nonce, PreparedDirectoryBinding[] values)
        { Context = context; Ancestry = ancestry; Nonce = nonce;
          FixedFileData.Need(values != null && values.Length == 11, "launch-directory-count");
          entries = (PreparedDirectoryBinding[])values.Clone(); }
        internal int Count { get { return entries.Length; } }
        internal PreparedDirectoryBinding At(int role)
        { FixedFileData.Need(role >= 0 && role < entries.Length, "launch-directory-role"); return entries[role]; }
    }
    internal sealed class PreparedSealBinding
    {
        internal readonly int Role;
        internal readonly IntPtr Handle;
        internal readonly FileFacts Facts;
        internal readonly string Hash;
        internal PreparedSealBinding(int role, IntPtr handle, FileFacts facts, string hash)
        { Role = role; Handle = handle; Facts = facts; Hash = hash; }
    }
    internal sealed class PreparedSealSnapshot
    {
        internal readonly FixedMainReferenceFiles Owner;
        internal readonly FixedLayoutContext Context;
        internal readonly FixedSourceAncestry Ancestry;
        internal readonly string Nonce, MainHash, RequestHash, PreparedHash;
        private readonly PreparedSealBinding[] entries;
        internal PreparedSealSnapshot(FixedMainReferenceFiles owner, FixedLayoutContext context,
            FixedSourceAncestry ancestry, string nonce, string main, string request, string prepared,
            PreparedSealBinding[] values)
        { Owner = owner; Context = context; Ancestry = ancestry; Nonce = nonce;
          MainHash = main; RequestHash = request; PreparedHash = prepared;
          FixedFileData.Need(values != null && values.Length == 22, "launch-seal-count");
          entries = (PreparedSealBinding[])values.Clone(); }
        internal int Count { get { return entries.Length; } }
        internal PreparedSealBinding At(int role)
        { FixedFileData.Need(role >= 0 && role < entries.Length, "launch-seal-role"); return entries[role]; }
    }

    // An immutable record is data, not a grant. Only the original session's
    // stored reference can pass its one-shot immediate-prelaunch reproof.
    internal sealed class FixedLaunchRecord
    {
        internal readonly FixedFileSession Session;
        internal readonly FixedLayoutContext Context;
        internal readonly FixedSourceAncestry Ancestry;
        internal readonly FixedMainReferenceFiles Files;
        internal readonly string Nonce, MainHash, RequestHash, PreparedHash;
        internal readonly string Application, Command, WorkingDirectory, EnvironmentBlock;
        internal readonly bool NativeLaunchQualified = false, PathnameHandoffAuthorized = false,
            ExecutionAuthorized = false;
        private readonly PreparedDirectorySnapshot directories;
        private readonly PreparedSealSnapshot seals;
        private readonly string[] fileNames;
        private readonly string[] launchDirectories;

        private FixedLaunchRecord(FixedFileSession session, PreparedDirectorySnapshot names,
            PreparedSealSnapshot bindings, string[] returnedFileNames)
        {
            FixedFileData.Need(session != null && names != null && bindings != null &&
                returnedFileNames != null && names.Count == 11 && bindings.Count == 22 &&
                returnedFileNames.Length == 22, "launch-record-shape");
            session.RequireLaunchOwners(names.Context, names.Ancestry, bindings.Owner);
            FixedFileData.Need(Object.ReferenceEquals(names.Context, bindings.Context) &&
                Object.ReferenceEquals(names.Ancestry, bindings.Ancestry) && names.Nonce == bindings.Nonce &&
                FixedFileData.IsHash(names.Nonce) && FixedFileData.IsHash(bindings.MainHash) &&
                FixedFileData.IsHash(bindings.RequestHash) && FixedFileData.IsHash(bindings.PreparedHash),
                "launch-record-original-binding");
            Session = session; Context = names.Context; Ancestry = names.Ancestry; Files = bindings.Owner;
            Nonce = names.Nonce; MainHash = bindings.MainHash; RequestHash = bindings.RequestHash;
            PreparedHash = bindings.PreparedHash; directories = names; seals = bindings;
            fileNames = (string[])returnedFileNames.Clone();
            for (int role = 0; role < 11; role++)
            {
                PreparedDirectoryBinding current = names.At(role);
                FixedFileData.Need(current != null && (int)current.Role == role &&
                    FixedFileData.Valid(current.Handle), "launch-directory-binding");
                Name(current.Name);
                if (role == 0)
                    FixedFileData.Need(current.Name.EndsWith("\\" + FixedScratchLayout.RootPrefix + Nonce,
                        StringComparison.Ordinal), "launch-directory-root");
                else FixedFileData.Need(current.Name == names.At(FullLayoutData.Parents[role]).Name +
                    "\\" + FullLayoutData.Names[role], "launch-directory-graph");
                for (int peer = 0; peer < role; peer++)
                    FixedFileData.Need(names.At(peer).Handle != current.Handle &&
                        names.At(peer).Name != current.Name, "launch-directory-alias");
            }
            for (int role = 0; role < 22; role++)
            {
                PreparedSealBinding current = bindings.At(role);
                FixedFileData.Need(current != null && current.Role == role &&
                    FixedFileData.Valid(current.Handle) && FixedFileData.IsHash(current.Hash),
                    "launch-file-binding");
                FileFacts facts = current.Facts;
                FixedFileData.Length(role, facts.Length);
                FixedFileData.Need(!facts.Directory && !facts.DeletePending && facts.Links == 1 &&
                    facts.ReparseTag == 0 && (facts.Attributes & 0x1410U) == 0 && facts.AppliedPolicy &&
                    (facts.IdLow != 0 || facts.IdHigh != 0), "launch-file-facts");
                Name(fileNames[role]);
                FixedFileData.Need(fileNames[role] == names.At((int)FixedFileData.Parent(role)).Name +
                    "\\" + FixedFileData.Name(role), "launch-file-name");
                for (int peer = 0; peer < 11; peer++)
                    FixedFileData.Need(names.At(peer).Handle != current.Handle, "launch-cross-owner-alias");
                for (int peer = 0; peer < role; peer++)
                    FixedFileData.Need(bindings.At(peer).Handle != current.Handle &&
                        !FileFacts.Same(bindings.At(peer).Facts, current.Facts), "launch-file-alias");
                if (role < 18) FixedFileData.Need(current.Hash == FixedFileData.RuntimeHash(role),
                    "launch-runtime-hash");
            }
            FixedFileData.Need(bindings.At(19).Hash == RequestHash && bindings.At(20).Hash == MainHash &&
                bindings.At(21).Hash == PreparedHash, "launch-input-hashes");
            // GUID ownership names remain unchanged. Only launch names use the
            // original ancestry's rechecked DOS drive/GUID mapping. No fallback.
            launchDirectories = new string[11];
            launchDirectories[0] = Ancestry.CopyScratchLaunchRoot(names.At(0).Name, Nonce);
            for (int role = 0; role < launchDirectories.Length; role++)
            {
                if (role != 0) launchDirectories[role] =
                    launchDirectories[FullLayoutData.Parents[role]] + "\\" + FullLayoutData.Names[role];
                Name(launchDirectories[role]);
                FixedFileData.Need(launchDirectories[role].Length < 260,
                    "launch-dos-directory-bound");
            }
            // First-host admission only. No ambient-variable fallback.
            FixedFileData.Need(FixedLaunchPlatform.ObserveWindowsDirectory() == @"C:\Windows",
                "launch-windows-directory-unqualified");
            WorkingDirectory = LaunchDirectory(LayoutRole.Runtime);
            Application = WorkingDirectory + "\\" + FixedFileData.Name(0);
            Name(Application); FixedFileData.Need(Application.Length < 260, "launch-dos-application-bound");
            Command = "\"" + Application + "\" \"--user-data-dir=" +
                LaunchDirectory(LayoutRole.UserData) +
                "\" --disable-background-networking --no-proxy-server --lang=en-US --easyeda-clock-reference=once";
            FixedFileData.Need(Command.Length <= 30000 && Command.IndexOf('\0') < 0, "launch-command-bound");
            // Literal ordinal order. Do not inherit ambient environment entries.
            string[] keys = { "APPDATA", "ComSpec", "LOCALAPPDATA", "PATH", "SystemDrive",
                "SystemRoot", "TEMP", "TMP", "USERPROFILE", "WINDIR" };
            string[] values = { LaunchDirectory(LayoutRole.UserData), @"C:\Windows\System32\cmd.exe",
                LaunchDirectory(LayoutRole.Root), @"C:\Windows\System32", "C:", @"C:\Windows",
                LaunchDirectory(LayoutRole.Temp), LaunchDirectory(LayoutRole.Temp),
                LaunchDirectory(LayoutRole.Root), @"C:\Windows" };
            StringBuilder environment = new StringBuilder();
            for (int i = 0; i < keys.Length; i++)
            {
                if (i != 0) FixedFileData.Need(String.CompareOrdinal(keys[i - 1], keys[i]) < 0,
                    "launch-environment-key-order");
                Name(values[i]); environment.Append(keys[i]).Append('=').Append(values[i]).Append('\0');
            }
            EnvironmentBlock = environment.Append('\0').ToString();
            FixedFileData.Need(EnvironmentBlock.Length <= 32768 &&
                EnvironmentBlock.EndsWith("\0\0", StringComparison.Ordinal), "launch-environment-bound");
        }
        internal static FixedLaunchRecord Create(FixedFileSession session, PreparedDirectorySnapshot names,
            PreparedSealSnapshot bindings, string[] returnedFileNames)
        { return new FixedLaunchRecord(session, names, bindings, returnedFileNames); }
        private static void Name(string value)
        {
            FixedFileData.Need(!String.IsNullOrEmpty(value) && value.Length < FullLayoutData.PathCapacity &&
                value.IndexOf('\0') < 0 && value.IndexOf('\r') < 0 && value.IndexOf('\n') < 0 &&
                value.IndexOf('"') < 0, "launch-name-shape");
            new UnicodeEncoding(false, false, true).GetByteCount(value);
        }
        internal PreparedDirectoryBinding Directory(LayoutRole role) { return directories.At((int)role); }
        internal string LaunchDirectory(LayoutRole role)
        { int index = (int)role;
          FixedFileData.Need(index >= 0 && index < launchDirectories.Length, "launch-directory-role");
          return launchDirectories[index]; }
        internal PreparedSealBinding Seal(int role) { return seals.At(role); }
        internal string FileName(int role)
        { FixedFileData.Need(role >= 0 && role < fileNames.Length, "launch-file-role"); return fileNames[role]; }
        private static bool SameFacts(FileFacts a, FileFacts b)
        {
            return FileFacts.Same(a, b) && a.Length == b.Length && a.Links == b.Links &&
                a.Attributes == b.Attributes && a.ReparseTag == b.ReparseTag &&
                a.Directory == b.Directory && a.DeletePending == b.DeletePending && a.AppliedPolicy == b.AppliedPolicy;
        }
        internal void RequireSame(FixedLaunchRecord after)
        {
            FixedFileData.Need(after != null && Object.ReferenceEquals(Session, after.Session) &&
                Object.ReferenceEquals(Context, after.Context) && Object.ReferenceEquals(Ancestry, after.Ancestry) &&
                Object.ReferenceEquals(Files, after.Files) && Nonce == after.Nonce && MainHash == after.MainHash &&
                RequestHash == after.RequestHash && PreparedHash == after.PreparedHash &&
                Application == after.Application && Command == after.Command &&
                WorkingDirectory == after.WorkingDirectory && EnvironmentBlock == after.EnvironmentBlock,
                "launch-record-reproof");
            for (int role = 0; role < 11; role++)
                FixedFileData.Need(directories.At(role).Handle == after.directories.At(role).Handle &&
                    directories.At(role).Name == after.directories.At(role).Name &&
                    launchDirectories[role] == after.launchDirectories[role], "launch-directory-reproof");
            for (int role = 0; role < 22; role++)
                FixedFileData.Need(seals.At(role).Handle == after.seals.At(role).Handle &&
                    SameFacts(seals.At(role).Facts, after.seals.At(role).Facts) &&
                    seals.At(role).Hash == after.seals.At(role).Hash &&
                    fileNames[role] == after.fileNames[role], "launch-seal-reproof");
        }
    }
}
