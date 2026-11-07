# Managed fixture archive preparation and importer research

This source batch starts at `b16fb1e64c0d4cb0b2f57d2c4f07a894bb80940d` on
`feature/managed-fixture-import-20261105`. It implements the preparation portion
of [backlog item 1](2026-11-05-api-backlog-priorities.md#next-implementation-batches).
It does not complete native project import or registration.

## Reachable preparation

The existing `easyeda_control_library_files` tool now accepts
`prepare-fixture-archive`. Its strict request requires a previously prepared
`.epro2` descriptor, `confirmDisposableFixture:true` and
`confirmLocalArtifact:true`. It freshly reads and hashes that managed input.
Caller-selected source paths, destinations and false confirmations refuse.

The independent archive qualifier requires exactly `project2.json` plus one
canonical root `.epru`, an ordinary-project manifest, a safe ASCII title and an
absent or exact `3.2.209` editor version. It reuses complete ZIP32 extent,
expansion and CRC checks, then decodes every native record and every DOCHEAD
segment. The complete supplied roster has 1 to 32 unique document IDs, unique
record IDs per document and no EDIT_HEAD, DELETE or tombstone records. It hashes
the original manifest, source member and every document. Native bodies remain
opaque, so neither geometry nor dependency closure is claimed.

The runtime allocates a fresh exclusive private staging directory. It retains
the parent and staging descriptors, rechecks their identities through each
exclusive publication, and checks the complete three-file roster. The durable
intent precedes the byte-exact archive and qualification report. A failure
retains its stage and completed files for inspection. There is no native import
or project deletion to retry or reverse. The stage is not a Windows native
destination or registered project.

## Pinned importer findings

The official beta
[importProjectByProjectFile reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_filemanager.importprojectbyprojectfile.html)
declares a File input and the `Offline Client Local Path` save option. Source
inspection separately used these installed 3.2.209 files:

| Source | SHA-256 |
| --- | --- |
| API `0.3.59.1ca9efb5/api.js` | `e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1` |
| UI `3.2.198.2800f583/js/ui.js` | `3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6` |
| Manager `3.2.185.bf63a159/js/pro-mgr.js` | `b3260ec9d98d6cad5f65a6234aa839b32f6bf5954cb03de0bd6ce003577b388d` |
| Main `app.js` | `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c` |

The public API selects its local permission check from `saveTo.operation`, then
passes the File and save option through RPC. The UI selects its local branch
from that same discriminator. Native archive inputs go through `xGo`,
`Qa.importNewProject` and `Lcn`; the manager's `Si.decompress` passes the File to
JSZip `loadAsync`. This path does not depend on the nonstandard File `.path`
property. A File constructed from exact archive bytes therefore matches the
source contract. This is source evidence, not a connected test.

`Lcn` defaults `autoOpen:false`. For `.epro2` it awaits the manager's unzip/flow
reply, then invokes the import job. The job creates a project and branch,
uploads history and builds its structure. Main-process creation joins the
supplied directory with the project name plus `.eprj2`, then hashes that Windows
pathname with SHA-256 for local registration identity. The public import API
does not return the UI's UUID string directly. After that reply it calls
`DMT_Project.getProjectInfo` and returns the brief project item or undefined.

Several completion and partial-effect gaps remain. The manager's
`buildStructure` warns on a failed profile write without propagating failure.
Image migration starts without awaiting its Promise, including an initially
empty images map. The outer failure method is also called without awaiting it.
Local failed imports do not execute the cloud-only deletion branch. The
unzip/flow implementation uses an async Promise executor whose catch throws;
the original request can therefore remain pending after extraction failure.
A returned project item is not complete job, registration or durable roster
proof.

## Dormant original-Promise capture

`managed-fixture-import-program.ts` provides fixed launch and observation
programs. It is deliberately unregistered. It accepts no JavaScript or method
selector, requires the complete qualified archive, and limits inline input to
32 KiB and each generated program to 65,536 bytes. It constructs a File with
the exact input bytes, checks its hash, retains method receivers and checks the
same start-page URL and null current-project context around asynchronous work.
These checks do not prove an empty tab roster or issue a new process owner.

The launch program stores one immutable nonce-bound job before the sole public
SDK invocation. The original Promise remains retained in its closure. Repeated
observations invoke no importer. Pending, recognized brief project,
undefined/unrecognized result, rejection and synchronous throw remain separate.
The expected local UUID comes from the exact source-defined Windows destination
pathname. A returned cloud-shaped project or different UUID stays visible as a
different identity. Owner drift retains the original acknowledgement while
leaving authority false.

Every observation leaves delayed-job completion, registration, complete closed
SQL, original closure, retry and execution authority false. This module does not
issue a native process owner, reserve a Windows destination, inspect native
global project registration or supply a cleanup method. A public Promise cannot
replace those proofs.

## Verification and remaining integration

Node `24.18.0`, npm `11.16.0` and soft core limit zero were used. Twelve focused
tests pass: six archive/preparation regressions and six synthetic VM
original-Promise regressions. The tests cover exact archive copying, whole
rosters, CRC/framing failures, unsafe names, extra members, false confirmations,
input substitution, delayed callbacks, undefined/failed returns, original
acknowledgement after owner drift and no redispatch. Typecheck and focused
type-aware lint pass. The VM tests execute fixed programs against synthetic
callbacks; they are not connected import evidence. The adjacent metadata and
project-document source tests also pass. Dependency inspection, all 151 registry
signatures, 42 available attestations, the moderate vulnerability audit,
sanitizer identity, repository, MCP-contract and all-skill validation pass.

The integrating controller must retain a distinct original native Job from
before import, reserve a host-visible destination exclusively, verify the exact
registered path hash and brief item, observe all original import and delayed
jobs, then close that original process and compare the complete resulting SQL
and document roster against the archive. Partial failures must retain their
original job and destination without blind retry or speculative deletion.
Source admission must include the API, UI, manager, main process, extract/flow
and persistence dependencies. Only that dedicated lifecycle may mount the
dormant programs. Its public request, durable journal, orphan/recovery contract
and helper release still need implementation and connected disposable proof.

No controller, EasyEDA process, native owner or live MCP call was started in
this batch. No user project was opened, edited, saved or restored. Generated
bundles, compatibility projections and coverage are left to root integration.
