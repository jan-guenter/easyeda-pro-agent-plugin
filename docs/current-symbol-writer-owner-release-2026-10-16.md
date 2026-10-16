# Current runtime correction and private writer ownership

## Post-write verification implementation, update173000

Candidate `0.3.0+codex.20261016173000` adds the private verification continuation
that was missing from140000. Only an original successful writer with a complete
closed snapshot and successful full SQL comparison can issue it. The checkpoint,
raw copy, complete inventory and original clock plan remain bound to that
operation. Failed writes, partial snapshots, uncertain capture cleanup and
copied journals cannot issue a continuation.

The closed source is revalidated before capture release. Release invalidates
the native copy proof, so the continuation does not try to revive it. Instead,
the new verification owner rehashes the source against the actual post-edit
snapshot before launch and opening. It admits a fresh authenticated generation,
checks both persistent upload-cache namespaces while the project is inactive,
and repeats cache checks immediately before opening only the project.

The current no-editor saved reader reconstructs expected `getStr` output from
the original successful current SQL plan and complete post-edit history. It
retains the current project-only/startup guards and checks metadata, actors,
worker client and maximum ticket around two equal content reads. Normal closure
then produces a separate original verification snapshot. Complete SQL equality
checks that reopening and reading did not change the post-edit database.
The lifecycle never dispatches another mutation or explicit Save.
The reader caps saved content at 65 KiB and stops subsequent reads after its
10-second deadline. It cannot cancel a vendor enumeration already in flight.

If launch succeeds but clock or admission work fails before acquiring a closed
session capture, the coordinator can still request one normal close through
the original launch owner and observe that original root/Job terminating.
Lost close acknowledgment does not permit another close attempt. This cleanup
does not issue copy authority, a snapshot or saved-state proof; uncertain
capture acquisition remains explicit.

The current source review confirms the projection against WORKER
`b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928`
and MGR `005584e02cd9b2d49fdb387b2f997c1c8d3f88b0c48a7531c8097c483ed0bd2e`.
WORKER symbol `getStr` at1939611 builds metadata and current-version DOCHEAD,
then calls `getCanvasByConsistency` at2146197 with the five metadata/deletion
record exclusions and `keepFirst:true`. Its canvas DOCHEAD retains the stored
edit version. MGR at2068665 delegates the exact symbol/project IDs. Offsets are
JavaScript string offsets in the pinned installed sources, read without
execution. The compression path can clean in-memory caches; no global-idle or
background-upload completion claim follows from matching content.

This remains an unregistered private workflow. Actual140000 was independently
admitted after restart, and its main CI passed. No new live EasyEDA lifecycle,
design edit or Save was attempted while implementing this update. Production
designs and their records remain untouched.

The remaining implementation boundary is a deliberately scoped disposable
validation entrypoint and inverse/recovery workflow. Current clock and startup
holder checks still need connected validation. Only after successful disposable
forward/inverse persistence and failure handling should the narrow writer be
registered for normal use. Broader schematic/PCB, library and manufacturing
backlog remains unchanged. The older numbered list below describes140000's
handoff; its cache/reopen implementation item is superseded by this section,
not its connected-validation requirement.

## Earlier140000 scope

Candidate `0.3.0+codex.20261016140000` continues the
[fixed compiler implementation](current-symbol-writer-compiler-release-2026-10-16.md).
It does not enable symbol editing or claim a connected writer test.

## Runtime correction

Review before the first scratch attempt found that 124500's current Date
compiler still used the historical native helper's executable/DLL inventory
and Electron .2 assertion. The installed runtime is Electron .5. The known-bad
stage was not dispatched.

The new `Easyeda.CurrentMainReference.dll` has a separate build manifest,
identity module and fixed 18-file runtime profile. Its reproducible builder
applies two exact, hash-bound source transforms in memory. Historical sources,
helper, manifest and compiler output remain unchanged. Both helpers are checked
in CI. The current facade verifies the packaged binary before constructing its
fixed scratch invocation. This is build/runtime admission, not live validation.

Offline `project-open` discovery now reports `clockPreparation`: expected
helper identity, runtime versions and complete runtime hash inventory. It
explicitly grants no authority and is not a workstation observation. The
control and extension skills explain this distinction and the pre-attempt
runtime comparison.

Ordinary launch now returns bounded, process-local stage timings. Fourteen
fixed labels retain completed/failed counts and elapsed totals, without paths,
arguments or errors. Only the first 32 distinct launch requests are retained.
Same-owner inspection can show failure timings; replay cannot replace them.
Restart discards the timings. No admission check was removed or reordered.

## Private writer integration

The new coordinator consumes the original project-only generation and takes
exclusive closure ownership under the same operation ID. It preserves the
complete prior journal as an append-only artifact before changing the mutable
plan profile. Baseline close/observation and generation lookup then refuse;
there is no second competing recovery journal.

Startup qualification derives a narrow no-initial-component-repair predicate
from the complete retained native history. It excludes simulation, missing or
ambiguous references, multipart symbols and component attribute overrides.
Fixed renderer checks inspect initialized schematic template holders, pending
work and absence of editor documents. The issuer binds the original baseline,
generation and source checks. The writer repeats the holder guard in its own
invocation; the token does not promise receiver identity across invocations,
global idleness or a continuously locked source tree.
The [source qualification note](current-symbol-startup-qualification-2026-10-16.md)
records the pinned implementation trace and exact supported predicate.

The coordinator retains original preflight, Windows/document clock samples,
aged-history qualification, one write intent and the raw reply. It uses the
existing immutable timestamp windows and complete SQL/native comparator.
Failure consumes the attempt; no write, Save, clock-window or close replay is
authorized. Normal closure remains owned by that coordinator, followed by
original Job termination, closed snapshot, comparison and authority retirement.
If the engine clears its journal and then fails during capture cleanup, the
coordinator accepts only the exact retained transition and reports cleanup
uncertainty. It does not repeat the release or claim that retirement proves
every native handle was released. Foreign journal changes still refuse.
The existing 24-phase baseline analyzer remains unchanged and refuses the
distinct writer profile.

This path is private and unregistered. Source integration and synthetic tests
do not establish live startup-holder shapes, persisted changes or recovery.
The current public writer restrictions and API availability counts are unchanged.

## Actual live work

The restarted 124500 facade and installed package were independently admitted.
A new disposable PCB opening completed once, followed by normal close and
original Job termination. The closed fixture remained 598,016 bytes with its
original SHA-256; no sidecars remained. No baseline/scratch stage, design edit,
explicit Save, Save/Discard choice or forced termination occurred. This
lifecycle is terminal and must not be replayed. Production designs and their
records were not accessed.

## Verification

Focused local tests, main/independent review, whole-project types and strict
type-aware lint are required before publication. GitHub CI runs the complete
test matrix and reproducible builds; it is not duplicated locally. Exact
results and publication/installation receipts belong in the engineering
checkpoint after they complete, not inferred from this candidate document.

## Remaining work

1. Load the installed update in a fresh Codex session. In one new original
   disposable lifecycle, validate the corrected scratch/renderer clock stages
   and finish/compare the closed result. No historical owner can be adopted.
2. Validate the narrow startup predicate and actual native holders. Review
   source qualification at the final writer boundary, including the current
   APP/manager/worker/notify chain. Existing SQLite dependency admission is
   implemented; it is not evidence that startup or background work is absent.
3. Validate the inactive upload-cache exclusions and reopen verification
   implemented privately in173000. Successful closed SQL comparison alone is
   not sufficient for enablement.
4. Implement the scoped disposable-validation entrypoint and inverse/recovery
   orchestration. Prove disposable forward/inverse metadata persistence and
   ambiguous-failure handling, then deliberately register only the validated
   narrow writer and update its capability evidence. Do not enable it by
   bypassing a flag.
5. Continue the generated API backlog: schematic/PCB structure completion,
   remaining geometry and library workflows, and operation-specific
   manufacturing adapters. Symbol metadata work does not validate these.
6. Use real launch timings to identify repeated expensive preparation. Any
   consolidation must preserve quarantine, identity and lifecycle checks.

The timestamp comparison still assumes reviewed Date/VFS behavior, a shared
Windows clock without intervening changes and no competing target-file writer.
The implementation does not claim continuous proof of those assumptions.
