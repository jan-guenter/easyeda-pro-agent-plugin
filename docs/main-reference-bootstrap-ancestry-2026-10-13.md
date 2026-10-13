# Fixed bootstrap and source ancestry

Research and design date: 2026-10-13. Source-only proposal. No Windows discovery,
directory query, file read, compilation or test ran for this note. It grants no
filesystem, pathname or execution authority. The native refusal remains intact.

## Decision and existing evidence

Add one fixed ancestry owner, separate from the file owner. It retains the
existing directory chains for the OS-discovered LocalApplicationData plus `Temp`
and ProgramFiles plus `easyeda-pro` and `locales`. It creates none of them. The
file owner continues to own runtime-file acquisition, copying, sealing and
evidence I/O. The ancestry owner supplies only the fixed parent roles.

The private full11 run proves its synthetic `C:\Temp` preparation on the observed
tuple: 22 completed frames, 23 successful handle closes and no deferred cleanup.
Its original result is `Zlb6VPtx/observe-once/99-result.json`, SHA-256
`9d898004d3f0f5684e1a4df218f894771c4d9d95c5b07334a8535e1bfe8dc759`.
That run did not discover production roots or retain their ancestry. The
`zsHkf5hn` retained context and `Y2cRPCdq/CONTRACT.md` define the separate context
and file lifetimes. Neither currently implements the production ancestry walk.
The earlier [reparse research](native-relative-parent-reparse-2026-10-12.md)
remains applicable; the successful miniature cases do not erase its pathname
and metadata limits.

## Fixed discovery, not an authority token

Use exactly two managed calls, with `SpecialFolderOption.None`:
`Environment.GetFolderPath(LocalApplicationData)` and
`Environment.GetFolderPath(ProgramFiles)`, in the fixed Windows x64 host. `None`
checks existence and can return an empty string; `Create` would create a folder
and is excluded. Locations are configurable. A returned string does not identify
an opened object. Empty, exceptional or unsupported results refuse with no
alternate discovery route. [GetFolderPath](https://learn.microsoft.com/en-us/dotnet/api/system.environment.getfolderpath?view=netframework-4.8.1),
[folder options](https://learn.microsoft.com/en-us/dotnet/api/system.environment.specialfolderoption?view=netframework-4.8.1),
[special-folder meanings](https://learn.microsoft.com/en-us/dotnet/api/system.environment.specialfolder?view=netframework-4.8.1).

This is the sole selected route, not an Environment fallback after a Shell error.
Microsoft recommends the managed API for .NET. A direct `SHGetKnownFolderPath`
implementation would add calling-thread COM initialization, returned-pointer
cleanup and token-selection obligations. We do not add that path or change the
PowerShell apartment. [Known Folders](https://learn.microsoft.com/en-us/windows/win32/shell/known-folders),
[SHGetKnownFolderPath](https://learn.microsoft.com/en-gb/windows/win32/api/shlobj_core/nf-shlobj_core-shgetknownfolderpath).

Retain the existing fixed no-impersonation admission and independently derived
process-owner SID. Distinguish `ERROR_NO_TOKEN` from a thread-token query failure;
refuse an impersonation token. `OpenAsSelf` changes the access-check context, not
the token being opened. Do not infer that a process-token SID proves an
impersonating thread's identity, and do not print or accept that SID as caller
authority. [Impersonation tokens](https://learn.microsoft.com/en-us/windows/win32/secauthz/impersonation-tokens),
[OpenThreadToken](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-openthreadtoken).

Appending `Temp` is this plugin's fixed policy. `GetTempPath2` instead uses
environment-dependent locations, does not check their existence/access, and
preserves symbolic links. It is not an alternative trust source.
[GetTempPath2W](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-gettemppath2w).

The first profile supports bounded local drive-rooted NTFS paths only. UNC,
device/relative paths, mapped or substituted roots, reparses, non-NTFS volumes
and unsupported path shapes refuse. Lexical parsing alone cannot establish all
those facts. Also, a local configured relocation of a known folder cannot be
distinguished from its default by these two returned strings. Do not claim that
the managed call proves an unredirected configuration. Any stronger exclusion
needs a separately reviewed fixed predicate, not a hardcoded user-directory
guess. No discovery fallback or ACL change compensates for a refusal.

## Small internal interface and ownership

The proposed parameterless owner allocates its handle slots, argument records,
query storage and cleanup bookkeeping before acquisition. It exposes no path,
SID, raw parent, callback or backend-provider argument.

```text
FixedSourceAncestry()
PrepareOnce()
AcquireLayoutAnchorLease()         fixed scratch-parent role, once
BorrowRuntimeSourceParent(role)    only the existing eighteen runtime roles
RecheckRetainedAncestry()
RequireNotAncestorHandle(candidate)
RetainForUnresolvedDependentCall() monotonic
CloseOwnedResources()             bounded outcome plus original failure
```

The source-role mapping is literal: role 16 uses the retained `locales` parent;
the other seventeen use the retained `easyeda-pro` parent. Symbol's file adapter
still opens the exact file, checks its immutable pin and owns that file handle.
It must reject a returned raw handle that aliases any live ancestry or layout
handle before file I/O. A failed close remains live for alias accounting.

Layout slot 0 currently owns and closes its bootstrap handle. It must receive an
independently tracked lease, never the ancestry owner's sole raw handle. Prefer
one same-process `DuplicateHandle`, with `DUPLICATE_SAME_ACCESS`, inheritance
false and no `DUPLICATE_CLOSE_SOURCE`. Microsoft documents that the duplicate
refers to the same object and shares file position; it is a separate handle, not
a separate file object or fresh access/share admission. No enumeration or data
position operations may run concurrently through these two handles.
[DuplicateHandle](https://learn.microsoft.com/en-us/windows/win32/api/handleapi/nf-handleapi-duplicatehandle).

A second fixed relative `FILE_OPEN` is the alternative. It would create another
open with another name lookup, access/share decision and identity comparison.
It adds no useful capability for this slot. Choose duplication, verify equal
object identity and distinct live raw values, and retain the original chain.
The lease's concrete transfer/adoption record must nominate exactly one closer.
An exception between acquisition and adoption must leave the lease retained;
zero output after an opaque call is not proof of no acquisition. Never use
`DUPLICATE_CLOSE_SOURCE`, which can close the source even when duplication fails.
[DuplicateHandle flags](https://learn.microsoft.com/en-us/windows/win32/api/handleapi/nf-handleapi-duplicatehandle).

The fixed session serializes borrowing, native entry, uncertainty latching and
closure. It retains ancestry until the file owner, layout and eventual Job are
settled. A context-only cleanup receipt is insufficient. Any unresolved dependent
call retains its argument storage, endpoint handles and the ancestor chain.
Confirmed independent closes are attempted once; first failure and cleanup
failures remain separate. No deletion or residue traversal is part of this owner.

## Acquisition algorithm

1. Consume one attempt and establish the fixed host/token admission. Obtain the
   two discovery strings. Parse bounded components without case folding, Unicode
   normalization, dot-segment repair or alternate-name lookup. Reject empty
   components, traversal, stream syntax and unsupported namespaces. The source
   draft should use explicit support caps, not claim every Windows path works.
2. Open each discovered drive root read-only and retain its handle before any
   query. Establish the supported local-volume predicate, NTFS, ordinary directory
   type, nonzero file identity and handle-derived volume-GUID namespace. The drive
   letter is used only for this initial open. Its mapping is not established by
   the special-folder string, so this bootstrap step requires native qualification.
3. Walk one fixed parsed component at a time relative to the retained preceding
   handle. Use only existing-directory `FILE_OPEN`, a source-fixed access/share
   tuple, no inherited handle and no descriptor application. Require completed
   `FILE_OPENED`, then independently observe type, reparse/offline/delete-pending
   state and identity before accepting the next component. `RootDirectory`
   anchors a relative name; `FILE_OPEN` does not create a missing object.
   [NtCreateFile](https://learn.microsoft.com/en-us/windows/win32/api/winternl/nf-winternl-ntcreatefile).
4. Use `OBJ_DONT_REPARSE` and the reviewed final-object open policy with explicit
   post-open rejection of a reparse object. Qualify the exact existing-directory
   flags rather than transplanting the tested `FILE_CREATE` request. No flag
   promises that an already-open ancestor's metadata is frozen. Retain every
   component and recheck complete observations around preparation and each fixed
   source-open group. [OBJECT_ATTRIBUTES](https://learn.microsoft.com/en-us/windows/win32/api/ntdef/ns-ntdef-_object_attributes),
   [reparse open option](https://learn.microsoft.com/en-us/windows-hardware/drivers/ddi/ntifs/nf-ntifs-ntcreatefile).
5. Preserve the handle-returned GUID path and object identity without substituting
   a separately reopened path. Expected equal identities are allowed only for
   the lease or deliberately shared ancestor roles; equal raw handles never
   create two close owners. Different branches may meet at the same volume/root,
   so identity equality alone is not an alias failure.
   [GetFinalPathNameByHandleW](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-getfinalpathnamebyhandlew).

## Boundaries before native integration

The smallest implementation is the owner/data/lease state machine with a refused
production backend and a separate fixed fake. Model the exact role walk, duplicate
adoption, cross-owner aliases, rechecks, opaque/pending retention and attempt-all
cleanup. Do not copy the file adapter or add a configurable permission system.

The actual backend still needs the precise root-mapping and existing-directory
open contracts, bounded Unicode argument storage, same-handle query joins and
lease acquisition tested on the supported tuple. Existing directories must not
be fed into the newly-created owner/SYSTEM descriptor parser or have their ACLs
rewritten. A read-only access grant and object continuity do not prove an existing
directory's ACL excludes every other writer. Define any required existing-ACL
admission separately and keep arbitrary hostile same-token or privileged takeover
outside the stated threat model. [File security](https://learn.microsoft.com/en-us/windows/win32/fileio/file-security-and-access-rights).

Read-only sharing does not block all attribute/EA access. Retained child names and
scratch guards are relevant nonempty-state controls, but the observed synthetic
cases do not qualify every ancestor, pre-existing metadata handle or POSIX name
removal. Do not turn a postcheck into retroactive protection against a wrong-parent
write. [CreateFileW sharing](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-createfilew),
[reparse restrictions](https://learn.microsoft.com/en-us/windows/win32/fileio/reparse-points#reparse-point-restrictions).

The later string-based executable/working-directory handoff still needs its own
binding through Job settlement. A GUID path is a returned name, not a promise about
future traversal. This owner neither authorizes that handoff nor bootstraps the
byte-loaded DLL; the trusted consumer must already have verified that fixed DLL.

## Launch-path integration follow-up

The private joined context now retains the original ancestry lease, and the
source-streaming backend has passing model coverage. Neither exposes a
qualified executable/working-directory handoff. The current backend observes
normalized volume-GUID paths through retained handles; those observations must
not be replaced by the original special-folder discovery strings when the
complete session is implemented.

`GetFinalPathNameByHandleW` distinguishes normalized/opened names and DOS/GUID/NT
volume representations. Its DOS form is also extended-length syntax; the GUID
form starts with a volume identifier. The API reports required capacity on an
undersized buffer and can fail for unsupported volume mappings. It does not
promise that a later application accepts the returned namespace.
[Handle-derived paths](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-getfinalpathnamebyhandlew).

`CreateProcessW` accepts an explicit module path, separate mutable command line,
environment and working directory. It returns before initialization finishes.
The complete session should retain the existing non-null application argument
and exact original process/Job owner; successful process creation is not proof
that the intended runtime and custom main initialized.
[Process creation](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessw).
Microsoft warns that namespace support differs across APIs. Documentation alone
therefore does not qualify volume-GUID paths for this pinned Electron runtime,
its reported paths or its environment-directory handling.
[Namespace limits](https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file).

Implementation constraints, not completed proof:

- Form a fixed internal launch-name record from the same retained prepared
  directory/file handles and verified role graph. Recheck exact identities,
  contents and names around this operation. No caller-selected paths, fallback
  executable search, alternate namespace retry or directory reopen should
  manufacture authority.
- Keep the original ancestry, layout and sealed file owners live through
  launch, receipt validation and observed original root/complete-Job termination.
  The complete session serializes that interval; separate component locks do
  not reserve each other's lifetimes.
- Treat any supported path conversion as a separately tested binding, not a
  string normalizer that makes arbitrary reported paths equivalent. Exact
  producer reports and semantic receipt checks still need their own joins.
- On an entered launch without observed termination, retain dependent owners.
  A kill-on-close attempt alone does not prove termination. The old refused
  PowerShell draft's subsequent file-lock release must not become the new
  session's settlement rule.

The actual pathname selection and full-session implementation remain pending.
No process, token, source file or design was opened for this follow-up; it used
official documentation and local source inspection only.
No broad replay of the completed descriptor, frame or full11 cases is required
to author this next bounded state machine.
