# Current runtime correction and private writer ownership

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
3. Complete both inactive upload-cache exclusions and reopen verification
   around the writer lifecycle. The private coordinator explicitly reports
   these missing guarantees; successful closed SQL comparison alone is not
   sufficient for enablement.
4. Prove disposable forward/inverse metadata persistence and ambiguous-failure
   recovery. Then deliberately register only the validated narrow writer and
   update its capability evidence. Do not enable it by bypassing a flag.
5. Continue the generated API backlog: schematic/PCB structure completion,
   remaining geometry and library workflows, and operation-specific
   manufacturing adapters. Symbol metadata work does not validate these.
6. Use real launch timings to identify repeated expensive preparation. Any
   consolidation must preserve quarantine, identity and lifecycle checks.

The timestamp comparison still assumes reviewed Date/VFS behavior, a shared
Windows clock without intervening changes and no competing target-file writer.
The implementation does not claim continuous proof of those assumptions.
