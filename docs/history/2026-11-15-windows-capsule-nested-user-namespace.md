# Windows capsule nested user namespace correction

## Observed failure and source cause

An installed Windows-host facade from merged `ced687c65e262859a95ee7e36c2c9374dd7d846c`
served its metadata correctly, but ordinary upstream startup failed at
`pid-admission`, monitor exit1, with no admitted sandbox. Its51-byte diagnostic
SHA256 was `cd0ccbc42517924251d3c1c93678bd759abadea815f11a929853b6705cc02045`.
The fixed Bubblewrap diagnostic `bwrap: setting up uid map: Operation not permitted`
plus newline matches those bytes exactly. The original facade was cooperatively
retired/closed and its original process exit observed; no application launched.

The outer Windows handoff creates a user namespace and drops all capabilities.
For a UID0 caller it previously retained UID0 inside that namespace. Linux5.12+
requires `CAP_SETFCAP` when mapping parent UID0 into a new child user namespace;
the nested upstream Bubblewrap therefore refused its UID map. See the
[Linux user namespace contract](https://www.man7.org/linux/man-pages/man7/user_namespaces.7.html)
and [Bubblewrap0.13.1 UID-map writer](https://github.com/containers/bubblewrap/blob/v0.13.1/bubblewrap.c#L872).
This failure preceded upstream/native/application admission; it did not justify
changing the inner sandbox, sanitizer, source checks or timeout.

## Source correction

Only when the original Linux caller has UID0, the outer capsule now requests
UID/GID1. Its single-ID maps still refer to that same original caller and group;
no host UID, group, permission, sysctl or disk configuration changes. The outer
capsule retains `--cap-drop ALL`, the six immutable captured files and the same
fixed entry/argv. Other callers retain their existing selection. No UID/GID or
capability field was added to either profile or runtime packet.

File ownership and process UID checks compare the current namespace identity.
The inert fixture verified that the original caller's file owner, process UID
and `/proc` UID all translate together to1. UID1 avoids confusing ownership with
the overflow UID65534. Existing control/profile/lease/private-file guards remain
unchanged; historical JSON supplies no process ownership. The explicit machine
profile and inherited HOME retain their original selected paths.

## Bounded validation and limits

One inert six-file capsule comparison reproduced current UID0/capabilities-zero
startup with the exact51-byte failure, then admitted a real nested user/PID
namespace under UID/GID1. The nested executable was a disposable reader, not the
upstream/index/application. Outer and final inner effective/permitted/bounding/
inheritable/ambient capabilities were zero. All six captured files retained exact
bytes,0644/0755 modes and nlink1; write opens refused `EROFS`. Original outer and
inner pidfds and driver closes were retained through observed exits, host source
bytes and the original caller UID stayed unchanged. Private fixture sources,
raw results and closure receipts are retained separately.

The initial fixture location hit the existing8,192 sibling-entry guard before
entry; it was moved to a fresh private temporary parent. A baseline assertion
incorrectly expected no child status: Bubblewrap can report its child before
UID-map failure. The assertion was corrected while retaining the exact failure
and original closure; no runtime guard changed.

The whole affected Windows launcher file passed11 tests with zero skips,
including a new real nested Bubblewrap regression and synthetic UID0 selection
on non-root CI. Both facade TypeScript configurations and strict type-aware lint
on the two changed source/test files passed with zero warnings. No broad suite or
actual upstream/app/native replay was run. Repository/MCP/skill and publication
checks are recorded separately before sealing/integration.

This is a source correction on the merged public base. Final release bundles,
compatibility source projections, installation and actual upstream admission
remain the curated release batch's work; the installed merged package was not
patched. The earlier fresh Linux/Windows metadata proofs do not establish the
corrected upstream runtime or live CAD execution.

Final local checks also passed repository validation, the isolated MCP contract
validator, all seven packaged skill checks, ordinary offline `npm ci` with the
unchanged lock, `npm ls --all`,151 verified registry signatures/42 attestations,
zero moderate-or-higher audit findings, and the unchanged1,440-byte sanitizer
identity. The repository scanner initially refused a check-only dependency
symlink; only that owned link was unlinked, ordinary dependencies materialized,
and the final repository scan passed. No guard was bypassed.

After original fixture closure, an exact-file manifest retained path/identity/
hash provenance and removed21 disposable fake-runtime/profile copies (8,646
bytes) plus21 empty owned directories, with no recursive root deletion. Unique
fixture source, raw results, setup failures and terminal receipts remain private.
