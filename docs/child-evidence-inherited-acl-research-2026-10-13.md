# Child evidence ACL admission, 2026-10-13

Source research only. No child ACL parser was implemented or relaxed, and no
native fixture, token query, file creation or application call ran for this note.
The existing source-open step remains independent of child evidence admission.

## The parent parser is not the child parser

The reviewed `OwnerSecurityData.RequireFixedDescriptor` constructs and checks an
explicit parent descriptor. It requires control `0x9004`, no group or SACL
component, and exactly two allow ACEs with flags `3` and mask `0x001f01ff`, for the
observed process `TokenUser` and SYSTEM. That is the fixed construction profile,
not an inherited-file profile. Inspected private source SHA256 is
`a15b362e134ce6d8bbebad24b0313db507b9d1a6aa06e91b27c18a711d5abfc9`.

For a noncontainer child, a parent ACE with both object-inherit and
container-inherit flags becomes effective. Windows maps generic rights and
generic creator SIDs when an inherited ACE becomes effective. `INHERITED_ACE`
marks system propagation; `INHERIT_ONLY_ACE` means an ACE does not govern the
object to which it is attached. These rules do not justify copying the parent's
exact ACE flag byte into a child parser.
[ACE inheritance rules](https://learn.microsoft.com/en-us/windows/win32/secauthz/ace-inheritance-rules),
[ACE_HEADER](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-ace_header).

`SE_DACL_PROTECTED`, `0x1000`, prevents incoming inherited ACEs from changing that
descriptor's DACL. It does not prevent the protected parent from carrying
inheritable ACEs for its children. `SE_DACL_AUTO_INHERITED`, `0x0400`, describes
automatic propagation support; `SE_SELF_RELATIVE`, `0x8000`, describes memory
representation. Parent protection therefore establishes neither child
protection nor the child's complete control word. This is an inference from
the documented meanings, not an observed NTFS result.
[Descriptor control flags](https://learn.microsoft.com/en-us/windows/win32/secauthz/security-descriptor-control).

## Separate creator provenance from admission policy

Windows takes a new object's default owner from the creating process's primary
token or the effective impersonation token. `TOKEN_OWNER` names that default
owner. `TokenUser` identifies the token's user account; the two are separate
observations. A fixture claiming to explain default-owner selection must compare
the actual owner with the separately observed creator `TokenOwner`, not assume
it equals `TokenUser`. That explanatory requirement is not necessarily a
production admission prerequisite.
[Owner of a new object](https://learn.microsoft.com/en-us/windows/win32/secauthz/owner-of-a-new-object),
[TOKEN_INFORMATION_CLASS](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ne-winnt-token_information_class).

The narrower production policy can instead require the actual, same-handle
descriptor owner to equal the original retained session `TokenUser`, together
with the exact user/SYSTEM DACL and fixed group/descriptor structure. A different
actual owner then refuses, irrespective of its provenance. This is a design
inference: it validates the resulting security state without claiming which
default owner the child token contained. It does not require a new child-token
API, PID-based token reopen or caller-supplied SID. The existing original
process/Job/program and semantic receipt bindings remain required. The owner
check matters separately from the DACL because ownership permits DACL changes.
[Object ownership](https://learn.microsoft.com/en-us/windows/win32/secauthz/owner-of-a-new-object),
[same-handle security query](https://learn.microsoft.com/en-us/windows/win32/api/securitybaseapi/nf-securitybaseapi-getkernelobjectsecurity).

The maintained generated program creates evidence with `fs.writeFileSync` and
`flag: 'wx'`. Its source does not specify a security descriptor. That JavaScript
alone does not establish the exact native security argument or the resulting
descriptor from the pinned Electron/Node producer. The documented default file
ACL is inherited from its parent when a new file is created without an explicit
descriptor, but the actual producer still needs qualification.
[File security and access rights](https://learn.microsoft.com/en-us/windows/win32/fileio/file-security-and-access-rights).
Inspected program source SHA256 is
`b06d736a952d03901766709bd30760367713b4078a8ecbb9802a63da1544a467`.

## Remaining fixed qualification

Use a disposable file from the exact producer and retained parent/file
identities. Retrieve a bounded
self-relative descriptor from the same file handle. `GetKernelObjectSecurity`
requires `READ_CONTROL` for owner, group or DACL reads; if the required length
exceeds the supplied buffer, it does not copy a partial descriptor. An
`OWNER|DACL` request does not establish absence of an unrequested SACL.
[GetKernelObjectSecurity](https://learn.microsoft.com/en-us/windows/win32/api/securitybaseapi/nf-securitybaseapi-getkernelobjectsecurity).

Before implementing the separate parser, retain the actual control word,
returned group representation, complete bounded ACE sequence, SID bindings,
mapped masks, flags, component offsets and padding. Do not preselect `0x8404`,
assume the parent's zero group offset, or accept arbitrary extra ACEs as
equivalent. Inherited and auto-inherited flags alone prove neither the intended
trustees nor parent identity. Unexpected shapes stop qualification; they do not
authorize permission repair, token privilege changes or broader ACL acceptance.

Fresh independently checked the ACE and descriptor-control documentation for
this note. Existing explicit-descriptor evidence and native refusal remain
unchanged. No production pathname handoff, child evidence polling or complete
helper qualification is claimed here.

## Later observation and remaining scope

The fixed NULL-SD native fixture subsequently passed; its retained result is
recorded in the [native hardening report](main-reference-native-hardening-2026-10-12.md).
It separately observed its own TokenUser and TokenOwner and reported their
equality for that run. The140-byte descriptor had control0x8004, separate owner
and group ranges, and exactly two flags0/full-control allow ACEs for that
principal and SYSTEM. These are measured facts for that fixture, not a general
Windows or Electron inheritance claim. The proposed child parser remains
separate from the protected-parent parser. Actual Electron-produced receipts,
readiness polling, final failure-file absence and complete session settlement
remain unqualified. No execution gate changes follow from this note.
