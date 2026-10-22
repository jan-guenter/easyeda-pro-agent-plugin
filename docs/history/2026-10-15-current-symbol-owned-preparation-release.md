# Owned symbol preparation, launch recovery and sandbox upgrade

Candidate `0.3.0+codex.20261015140000` connects the current-version disposable
opener to an internal symbol preparation stage. It also makes launch-recovery refusals
specific and keeps local launch inspection available during quarantine.
No public symbol writer is enabled. Publication, installation and connected
validation are separate release gates, not consequences of these source changes.

## Implemented symbol preparation

`CurrentDisposableOpenCoordinator.prepareSymbolMetadata` consumes the original
in-memory opening owner after successful native PCB identity observation. It
requires the genuine engine and Windows runtime, unchanged completed journal,
retained authenticated session and matching current implementation. Injected
test services, copied JSON, a historical receipt or a matching PID cannot issue
that generation. Owner or session drift invalidates it.

Within that authenticated scope, the stage collects fresh symbol metadata with
a fixed generated program. It binds the exact project, branch, symbol and
companion PCB, traverses the complete editor registry and checks the current
top-level DOM. The DOM guard rejects other symbol/schematic DIV editors,
export frames, hidden panel pools and unmarked iframes anywhere in the document.
It retains element and method identity and rechecks around native awaits.
The runtime collector verifies the exact installed implementation before and
after its sole fixed execute, requires a settled reply, and rejects runtime or
result drift.

The stage rejects a caller-supplied observation projection. It explicitly
converts its fresh witness to the narrower core metadata DTO and invokes the
actual checkpoint decoder/preparer. That conversion drops the internal
hidden-editor claim. The public metadata reader and separate offline checkpoint
preparation API keep their existing contracts.

The result is an original-object-bound preparation, not a permission to edit.
`postOpeningBaselineVerified`, `writerReady` and `executionAuthorized` remain
false. Worker identity, persistence, complete source membership and SQL effect
are not established. The pre-navigation checkpoint is still only a
pre-navigation checkpoint because ordinary opening can change the project.
The checks do not atomically exclude a user switching away and back between
samples or prove the absence of editors in every process.

The exact current source identities, producer paths and implementation links
are recorded in
[the owned-preparation research](2026-10-15-current-symbol-owned-preparation-research.md).
This is internal lifecycle code, with no new caller-selectable program, public
writer action or compatibility override.

## Launch recovery changes

An unknown-launch abandonment refusal now says whether the observed blocker
was another PowerShell process, a same-name EasyEDA application, or both. It
does not disclose process command lines or grant permission to terminate them.
The same two-sample absence checks remain mandatory. A refusal preserves the
original intent and consumed attempt, creates no abandonment sidecar and
allocates no runtime.

The registered launch callback now lets the coordinator handle local `inspect`
before the live quarantine guard. Inspection reads only the bounded managed
launch record and needs no upstream connection, native helper or runtime.
Every other launch action still reaches `assertAllowed` before native work.
This removes an unnecessary live admission check from local inspection; no
connected latency improvement has been measured.

The original interrupted startup was subsequently abandoned through the
maintained route after the user closed the idle PowerShell session. Its original
ID stays consumed; abandonment does not reconstruct old native handles or prove
the old attempt's effects. One new owned ordinary startup then launched and
closed normally, with retained termination proof. Status refused the changed
Bubblewrap identity before connecting the bridge. This establishes the scoped
startup/recovery result, not a writer or project-opening result.

## Bubblewrap upgrade qualification

The host package changed from Bubblewrap 0.11.2 to 0.13.1, so the old exact
executable admission correctly refused it. The
[sandbox admission research](2026-10-15-bubblewrap-admission-research.md)
records the signed-package and exact executable verification, upstream changes,
and the build assumptions. This supports a deliberate upgrade review, not an
automatic checksum replacement.

The candidate upgrade retains the native descriptor sanitizer, descriptors
0 through 10, parent-death behavior, strict mount failures, seccomp, quarantine
and all unrelated external pins. The updated CI recipe targets the immutable
0.13.1 revision and keeps kernel compatibility fallbacks. It does not use the
new fail-open option. The reviewed signed 0.13.1 executable passes 47 focused
upstream, sanitizer and lifetime tests. The existing startup test now also proves
the synthetic child's exact kernel mount is read-only before attempting a
nontruncating write-open. That attempt must fail with EROFS or EACCES, with
retained process identity and graph/source bytes unchanged. The initial GitHub
run exposed EACCES preceding EROFS on a nonroot runner because the graph file
also denies writes by mode; accepting that denial alone would not prove a
read-only mount, so the corrected check requires the kernel flag too. The
changed GitHub build remains pending at this checkpoint. No
EasyEDA connection or production project is needed for those checks. Sandbox
qualification does not admit the EasyEDA runtime or enable design writes.

## Validation status

Completed local checks for the closed-target collector/compiler changes include
14 focused tests. Full TypeScript checks, whole-tree type-aware lint with zero
warnings, and whitespace checks pass. The tests run the real generated program with
synthetic owners and cover hidden/export/pool refusal, unmarked outside-root
iframes, owner changes across awaits, result tampering and runtime/source drift.
They do not establish connected execution or a saved/reopened edit.

The sandbox research separately records 24 passing CI-contract tests, targeted
lint, actionlint and whitespace checks for the workflow changes. The actual
sandbox-focused run passed 47 tests. After rebuilding, all 104 combined
preparation, metadata, launch, core and CI-contract tests pass. The earlier
source-hash refusal was resolved by rebuilding and updating only the facade
projections. Clean dependencies, registry signatures and attestations,
zero-vulnerability audit, coverage, repository/package validators and all seven
official skill checks pass. Exact-payload CI, merge, official Git-marketplace upgrade
and installed-file verification belong in the engineering checkpoint once
completed. Do not carry the previous release's passing CI onto this payload.

No live tools were used for the symbol preparation and documentation work.
The separate ordinary startup/recovery observations above did not connect the
bridge or deliberately open a design. Production designs and their records
were excluded. No design edit, Save or restoration was performed.

## Remaining work

1. Finish exact-payload GitHub CI and normal release delivery.
   After installation, use a fresh Codex chat and independently admit the loaded
   owner. Preserve the now-terminal startup/recovery receipts. Do not replay the
   abandoned original attempt or the completed normal launch/close, kill unrelated
   processes, or infer a connected session from sandbox qualification.
2. Add the current writer witness. Fixed client/maxTicket read paths are now
   source-reviewed, but their scalars do not lock a worker. Bind them to the
   original generation, implement the current actor contract, and review the
   native manager/WS time producer and separate backend EDIT_HEAD clock. Model
   DOCHEAD's current editVersion rather than silently preserving an older value.
3. Establish an operation-owned post-opening baseline with retained close and
   termination authority, a genuine closed-file copy and complete SQL inventory.
   Prove subsequent reopening effects. Do not promote the opener's checkpoint,
   caller descriptors or a copied receipt to that authority.
4. Connect the fixed name/description modifier and complete inverse. Model the
   full DOCHEAD/META/EDIT_HEAD and structure-table effects, upload-cache handling,
   collateral invariants and ambiguous-failure recovery. Keep the legacy SQL
   comparator strict. A returned boolean or upload wait is not durable proof.
5. Complete one disposable forward change, requested-field inverse, owned close
   and fresh-generation reopen with complete source/SQL comparison before
   enabling this writer. Further case expansion can follow that focused proof.

Other metadata writers, schematic/symbol/PCB geometry, connectivity, library and
manufacturing adapters remain in the
[prior release backlog](2026-10-15-current-symbol-preparation-release.md#verification-and-remaining-work)
and exhaustive API inventory. This update closes one internal preparation gap;
it does not claim those implementations are finished.
