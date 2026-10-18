# PCB rename lifecycle implementation

## Scope

The candidate adds `easyeda_control_disposable_pcb_rename` and offline
`disposable-pcb-rename` / `disposable-pcb-rename-validate` discovery. It connects
the existing exact structure/history/SQL model to an original PCB owner,
startup and actor observations, dual-clock checks, one fixed native rename,
normal process closure and fresh saved-result verification.

It is restricted to an explicitly disposable project opened by the same
facade. It does not enable ordinary-project PCB rename, the general public
rename wrapper, linked reuse-block propagation, drawing changes or an inverse.
The new writer has not run live. Source tests, implementation and publication
are separate from connected execution support.

## Completed read-only case

The installed121700 facade was independently admitted against its complete
package before live calls. A new disposable opening and baseline case ran once.
After initial normal closure and complete baseline capture, the original
ordinary launch's termination was recorded before replacement launch.
Admission, inactive-cache observation and project-only opening passed.

The separate read-only rename preflight returned two matching complete PCB maps,
the expected target metadata, exact native empty-string name availability and
four matching client/ticket/dual-actor samples. It dispatched no rename,
symbol patch or explicit Save. Native data ticket452 differed from DOCHEAD453;
the stable project maximum was777. These values are observations, not controls
for a future case.

Original normal closure, retained process/Job termination, complete finish
snapshot and capture retirement completed. Offline analysis verified all24
phase artifacts, unchanged598016-byte raw files, all35 SQL tables/148 rows,
all20 native documents and53 history rows/57 chunks. The canonical terminal
journal SHA was`0d2986aaa9ecd39ef79f8c1eea27ecb7734ba69a38ca0ddf2ef5390a446e063c`.
Raw before/after SHA was`41ac606247582f9c4be17eda1492d76c0f33f70efa4d36a2ac8bf6ef780e5c12`;
logical SQL SHA was`09a74ea168ec928ed2c4708997dd3c8b1d2b55f9305ddb1cf5696efe025645d9`.
The case is terminal. Do not replay it. No production design or production
record was opened or edited.

## Native and lifecycle boundaries

The fixed rename calls the project-qualified native PCB `updateData` path with
only `uuid` and `display_title`. It never invokes public `modifyPcbName`, which
can rename linked reuse documents. The original SQL baseline, whole PCB map,
native name lookup, requested title, client and actor remain bound to the same
original process generation. Caller data cannot issue that ownership.

The pinned worker's fresh PCB producer is created before project subscription
sets its user. Its new header omits user; historical user-bearing headers remain
byte-exact. Native data-ticket maxima exclude DOCHEAD tickets. The original
Windows/backend and renderer/notify clock observations bound document and
backend timestamps separately; complete post-closure SQL verifies actual times.

Pinned schematic `PCB.UPDATE` handling enters a clean batch. With both pending
sets initially empty, its source-model initialization loops have no queued
sheet work. The later work rebuilds derived AST/net/display state. This is a
bounded no-source-repair prerequisite, not complete AST/source equality or a
global idle claim. Active supplier/standardization panels are separately
excluded because their subscribers can request external data.

The existing asynchronous rebuild path has no operation-owned completion
observer. The adapter therefore keeps the original process/Job through normal
termination, captures complete SQL, checks the exact requested title-only
effect, then starts a fresh verification generation. The new generation excludes
inactive upload caches, checks exact saved raw bytes before opening, reads PCB
metadata and peers, closes normally and compares complete SQL again. A native
acknowledgment alone cannot complete the operation.

Original ownership is registered before fallible follow-up checks. Failed
transfers preserve cleanup-only handles, not writer authority. Partial replies,
snapshots and native acknowledgments remain available when later checks fail.
Only explicit pending observations repeat. Consumed write, launch, close,
snapshot and release attempts cannot be retried. Cleanup availability comes
from the owning coordinator, not inferred process absence.

## Validation and delivery

Focused synthetic tests cover the fixed native program, original-token
substitution, startup/panel guards, clock order and post-closure checks,
stored-effect comparison, snapshot retention, ownership transfer, saved-read
binding, exact public phase order, cleanup and registration. These tests do not
establish live rename behavior. Final full verification, CI, publication and
installation will be recorded after completion.

## Open work

- Install and admit the final candidate in a fresh Codex session, then run one
  complete disposable PCB rename lifecycle. Preserve its requested title; no
  inverse is offered.
- Validate the current PCB String readers on a nonempty disposable text fixture.
- Extend supported current-runtime design and library writers using complete
  stored-effect proofs. Schematic topology still has hidden annotation/Save All
  side effects; general PCB/schematic transaction support remains blocked.
- Continue remaining footprint/device/3D, routing/copper/stack/rule, ECO/dialog
  and export adapters. Each omitted SDK method retains its concrete coverage
  reason. A broad method inventory is not a live-support claim.
- Bundle/bootstrap the upstream MCP and admit additional platform/runtime tuples.

Production designs remain excluded from these validations.
