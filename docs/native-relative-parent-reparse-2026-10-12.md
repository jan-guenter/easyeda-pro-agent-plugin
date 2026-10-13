# Retained-parent reparse boundary

Research date: 2026-10-12. This supplements the
[native hardening record](main-reference-native-hardening-2026-10-12.md).
It changes no helper, native asset, gate or execution permission. No Windows
filesystem operation was performed for this research.

## Conclusion

A retained directory handle is a better preparation anchor than reopening a
pathname. It is not documented as a lock on that directory's reparse metadata.
The reviewed Microsoft contracts do not settle whether a relative `NtCreateFile`
rechecks an already-open `RootDirectory` after that object is converted in place.
Do not assert either redirection or automatic refusal without separate evidence.

The smallest next qualification is a fixed, synthetic relative-create experiment
covering that exact transition, followed by the guard/share controls below. It is
not an EasyEDA launch. Until the empty-parent interval and later pathname use are
resolved, preparation must not issue a pathname-handoff or launch grant.

## What the contracts establish

`NtCreateFile` accepts a relative name anchored at `RootDirectory`; `FILE_CREATE`
refuses an existing final object, and the creation descriptor applies when a new
object is created. The returned handle can be used for subsequent data and
attribute operations. These support one fixed component per acquisition, immediate
handle retention, and handle-based I/O. They do not establish an atomic
create-directory-plus-guard operation. [NtCreateFile](https://learn.microsoft.com/en-us/windows/win32/api/winternl/nf-winternl-ntcreatefile).

The kernel-facing `FILE_OBJECT.RelatedFileObject` describes an open relative to an
already-open object and is valid during `IRP_MJ_CREATE`. This supports the distinction
between the retained directory object and its original textual ancestry. It does
not specify how a filesystem handles that object's changed reparse metadata.
[FILE_OBJECT](https://learn.microsoft.com/en-us/windows-hardware/drivers/ddi/wdm/ns-wdm-_file_object).

| Mechanism | Documented scope | Claim it does not establish |
| --- | --- | --- |
| `OBJ_DONT_REPARSE` | Refuse a reparse encountered while parsing the associated object's name. | Revalidate or freeze an already-open parent or its ancestry. |
| `FILE_OPEN_REPARSE_POINT` | Open the reparse object rather than perform its normal reparse processing. | Reject every reparse, protect all ancestors, or freeze metadata afterward. |
| No `FILE_SHARE_DELETE` | Reject incompatible delete-access opens; delete access includes rename. | Block attribute-only access or in-place reparse mutation. |
| No `FILE_SHARE_WRITE` | Reject incompatible data-write sharing. | Block every metadata/EA writer. |

Sources: [OBJECT_ATTRIBUTES](https://learn.microsoft.com/en-us/windows/win32/api/ntdef/ns-ntdef-_object_attributes),
[native open options](https://learn.microsoft.com/en-us/windows-hardware/drivers/ddi/ntifs/nf-ntifs-ntcreatefile),
[CreateFileW sharing and symbolic-link behavior](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-createfilew).
The flag combination needs its own qualification; the two reparse flags are not
interchangeable. A successful open of a link is not a no-link proof.

For a one-component request, old ancestor names are not supplied in `ObjectName`.
That is a reason to retain the anchor, not a published guarantee about all filters
or a future full-path open. MS-FSA's `RootOpen` is a share-root abstraction whose
algorithm constructs an `Open.FileName`; it is not an implementation specification
for local user-mode `NtCreateFile.RootDirectory`. Do not substitute its path walk
for the missing native contract. [MS-FSA open algorithm](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-fsa/8ada5fbe-db4e-49fd-aef6-20d54b748e40).

## Sharing, guards and ACLs are separate controls

CreateFileW explicitly excludes attribute and extended-attribute access from its
sharing restrictions. MS-FSA permits `FSCTL_SET_REPARSE_POINT` when the retained
open has `FILE_WRITE_DATA` **or** `FILE_WRITE_ATTRIBUTES`, subject to its other
checks. Thus a read-sharing-only handle is not an attribute lock; test both newly
opened and pre-existing attribute handles. A sharing success does not establish
that no such handle exists. [CreateFileW](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-createfilew),
[MS-FSA reparse mutation](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-fsa/4aeefef8-92c3-4abc-af7a-a610caf8a165).

NTFS documentation requires an empty directory when establishing a reparse point;
MS-FSA also rejects a nonempty directory in its set-reparse algorithm. This supports
a retained guard entry as a nonempty-state control. But creation of that guard is
itself the first relative write whose safety must be established. A later successful
guard cannot retroactively protect the interval after root creation. Initial
reparse objects must still be rejected: directory-bit tags can already contain
children, and that bit is incompatible with the name-surrogate bit.
[Reparse-point restrictions](https://learn.microsoft.com/en-us/windows/win32/fileio/reparse-points#reparse-point-restrictions),
[MS-FSA mutation checks](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-fsa/4aeefef8-92c3-4abc-af7a-a610caf8a165).

The guard's name must remain present, not merely have an open handle. Retain it
without delete sharing and qualify removal/rename attempts, including parent
delete-child rights. Ordinary deletion and POSIX deletion have different documented
name-lifetime behavior. Any failed guard insertion is partial preparation: retain
diagnostics and owned resources, stop, and never reuse the directory as qualified.
[DeleteFileW](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-deletefilew).

Apply and read back the fixed protected descriptor on each newly created object,
not only the root. A parent's ACL is not generally the child's access check; default
inheritance is a separate mechanism. The successful memory-only descriptor test
does not prove application to any file. [File security](https://learn.microsoft.com/en-us/windows/win32/fileio/file-security-and-access-rights).

The owner-plus-SYSTEM policy does not isolate hostile code running with the same
owner identity. DACL checks compare token SIDs, not this plugin's operation identity,
and an owner can change the DACL. The scope must exclude arbitrary same-token code
execution, privileged takeover and hostile kernel/filter behavior. This does not
remove the need to test ordinary concurrent filesystem changes; it limits what
passing those tests can claim. Do not introduce identity output, ACL manipulation
of existing user directories, or a new security principal to conceal this limit.
[AccessCheck](https://learn.microsoft.com/en-us/windows/win32/secauthz/how-dacls-control-access-to-an-object),
[object ownership](https://learn.microsoft.com/en-us/windows/win32/secauthz/owner-of-a-new-object).

## Minimal future Windows controls, in order

Qualification note, 2026-10-13: the Win32 `FSCTL_SET_REPARSE_POINT` page broadly
requires `SE_CREATE_SYMBOLIC_LINK_NAME`. MS-FSA instead puts its
`HasCreateSymbolicLinkAccess` check on `IO_REPARSE_TAG_SYMLINK`, with a separate
directory constraint for `IO_REPARSE_TAG_MOUNT_POINT`. These sources have different
scopes; the latter is not proof that the local junction call will succeed without
that privilege. A fixed junction experiment must retain its actual setup error
and stop if unsupported. Do not enable privileges, change Developer Mode or
machine policy, or count failed setup as a nonempty-guard result.
[Win32 FSCTL requirement](https://learn.microsoft.com/en-us/windows/win32/api/winioctl/ni-winioctl-fsctl_set_reparse_point),
[MS-FSA tag-specific checks](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-fsa/4aeefef8-92c3-4abc-af7a-a610caf8a165).

These are proposed controls, not authorization or observed results. Use only a
separately approved sacrificial tree on a declared local filesystem/Windows tuple.
Record actual status, granted access where established, object identities, guard
presence and both possible destination contents. A failed mutation setup is not
proof that the relative-create guard worked.

1. **Exact retained-parent transition.** First establish ordinary relative create.
   Then use a separately retained attribute-capable handle to convert the empty
   anchor in place before the first child create. Compare no-reparse flags
   separately and the proposed combination. Test a junction and a directory
   symlink where privileges permit; report unsupported controls honestly. Any
   create outside the intended object is a failure even if detected afterward.
2. **Ancestor versus anchor.** Test replacement/rename attempts on retained chain
   components separately from in-place mutation. If an ancestor cannot be converted
   because its child is still present, retain that refusal as the tested mechanism;
   do not describe it as `OBJ_DONT_REPARSE` revalidating ancestry.
3. **Guard transition.** Pause before and after guard insertion. After insertion,
   attempt conversion through new and pre-opened attribute handles and attempt
   guard removal/rename. Require the documented nonempty condition to remain true.
   Cover every otherwise-empty directory in the fixed root-plus-ten-child layout;
   do not create unplanned files inside source inputs.
4. **Actual object policy and bytes.** Verify the applied owner/DACL and type/tag
   through retained handles. Create fixed outputs exclusively, then write and
   reread/hash through owned handles. Read source inputs from retained, verified
   handles. Retain sharing restrictions against data mutation/replacement for
   immutable inputs and outputs; explicitly test any writer-close/reader-open gap.
   No later pathname check can undo an earlier wrong-parent write.

The immediate engineering decision is bounded: qualify steps 1 and 3 before
expanding the preparation adapter. If their safety depends on an undocumented
transition, retain the refusal and narrow the supported environment or obtain a
supported contract. A finite passing matrix is tuple-specific evidence, not a
universal atomic-filesystem guarantee.

## Pathname handoff remains a later boundary

`GetFinalPathNameByHandleW` can produce a volume-GUID path, avoiding a drive-letter
choice. It reports a resolved path; it does not promise that subsequent traversal
remains bound to the same objects. Retain the relevant ancestry and object handles,
and qualify the exact namespace across executable, working-directory and runtime
data paths. No drive-letter fallback after failure. [Final-path API](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-getfinalpathnamebyhandlew).

`CreateProcessW` takes executable/current-directory strings, not the prepared
directory handle. An explicit application path avoids command-token ambiguity but
does not transfer retained-parent semantics into the loader or later Electron file
opens. Image/path readback after launch cannot undo execution through the wrong
path. That handoff needs a separate supported-path and concurrent-redirection
qualification before any application launch grant. [CreateProcessW](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessw).

The existing unconditional native refusal remains appropriate. This note establishes
no applied ACL, safe filesystem preparation, pathname authority or EasyEDA result.
