# Current-version disposable project opening

Use `easyeda_control_project_open` only for an explicitly selected disposable
local `.eprj2` file and one existing PCB. This is the separately pinned current
3.2.206 application route. It does not enable legacy `runtime open-existing`,
generic document navigation or design writers.

Query offline `project-open` with `includeSchemas:true`, then validate the
assembled request with `project-open-validate`. Confirm the actual installed
catalog exposes the tool before trying it. Declaration discovery or an older
installation does not supply this implementation.

## Prepare and open

Resolve any supported historical unfinished-record blocker before opening.
The current `history` tool qualifies the exact sixteen-event pre-navigation
validation and seven-phase pre-relaunch baseline boundaries; see
[failure recovery](failure-recovery.md). Do not replay
navigation or bypass the guard merely because an older record is data-only.

Use the normal supported launcher in the same facade process. A manually
started app, a historical launch receipt or an authenticated bridge alone is
not retained process authority. The editor must initially have only its genuine
Start Page and optional hidden placeholder, without a current project.

Obtain the exact path and PCB ID from the selected disposable fixture or its
retained receipt. Do not search production projects for a convenient test case.
The file must already be registered with EasyEDA. Missing registration refuses;
this tool does not scan project directories, register a path or create a project.

The `open` request contains:

- A fresh `operationId` used only once.
- `rawWindowsPath`, exactly as registered, with drive letter and backslashes.
- `projectUuid`, the SHA-256 of that raw path's UTF-8 bytes. Do not normalize
  case or slashes before hashing. This is a local 64-hex ID, not UUID32.
- `documentUuid`, the selected existing 16- or 32-hex PCB ID.
- `expectedSourceSha256`, the original selected file's SHA-256, not the
  checkpoint hash. SQLite checkpoint bytes can differ from source bytes.
- `confirmDisposableProject:true` and `acceptNormalOpenEffects:true`.

Pass the actual authenticated status fingerprint at the tool's top level as
`expectedFingerprint`. The host creates a private managed checkpoint, derives
the default branch and proves the PCB is present and not deleted. It checks the
original source again before dispatch. The generated adapter verifies the
registered raw path and complete bounded editor registry around awaited calls.

Opening is not read-only. EasyEDA can migrate the selected database, replay
cached uploads, restore selected-project tabs, update shared preferences or
bookkeeping, start background work and automatically Save. The agent must have
task authority for these ordinary effects. No explicit Save, discard, close,
restore or design-edit method is issued. The backup is preservation, not an
automatic restoration plan or proof of unchanged post-open storage.

## Read the outcome without replay

Project opening, document opening and observed native identity are separate
facts. Public methods route through mutable global state, so before/after
observations are not an atomic lock. Keep other app input quiescent.

Ordinary opening changes the URL to `#id=<project>` and document focus can add
`,tab=[*]<document>@<project>|...`. The opener requires an empty initial fragment
for project dispatch, admits only the selected project's ordinary fragment at
the public navigation return, then freezes the URL again. Listed tabs and any
active marker must match its independently sampled registry. Unknown fragment
keys, command/history modes and library/device syntax are refused. The current
PCB layer, identity and geometry readers accept this target-bound grammar but
keep their captured URL unchanged across all awaits. The URL never substitutes
for their project, branch, frame or native identity checks.

Each navigation stage is consumed before dispatch. `inspect` reads the journal
without contacting EasyEDA. `observe` checks the existing target without
opening it again. An absent frame or incomplete native identity is not permission
to repeat `open`. Even a successful public return does not prove rendering,
completed restoration, saved state or writer support.

Once the exact target is active and observed, `easyeda_control_pcb_layers` can
read its layer metadata using that project, branch, document and tab ID. That
reader still performs its own admission. Opening does not grant general CAD
execution authority.

## Interrupted calls

Newer snapshots retain `failureDiagnostic` in the stopped operation and a
managed `failure-diagnostic` artifact. It contains the operation `phase`, last
`hostStage`, fixed `category`, and nullable `nativeStage`/`nativeCode`. Unknown
exceptions remain `unknown`; raw messages, stacks and private values are not
returned. When recognized, optional `upstreamCategory` retains one of the seven
fixed host categories, such as `native-api-error` or `invalid-envelope`. Older
journals can omit it; never infer a missing subtype from a later release.
`native-timeout` and `bridge-timeout` remain unsettled execution, not
proof of cancellation. A stage identifies where observation stopped, not which
file effects occurred or whether navigation succeeded. Inspect the original
operation instead of repeating it to obtain a better error.

When a new tracked phase is marked, its preceding phase's return timestamp is
cleared. Older journals can retain that stale timestamp; interpret it with the
recorded phase/marking time and artifacts, never as current-phase completion.
Do not rewrite historical evidence or infer its missing cause from new codes.

Never repeat an uncertain project or document stage, including under a new ID.
Keep the same facade alive. If a tracked call remains orphaned, normal application
closure must finish before `retire-after-termination` can run. Do not force-quit
or choose Save/Discard for unrelated work.

Retirement requires `confirmRetire:true`, `acceptUnknownFileEffects:true` and
the exact operation ID. The coordinator proves its original retained root and
Windows Job terminated, the original authenticated session closed, and no
dispatch lease remains. It durably invalidates this attempt without replay,
continuation or a claim about file contents. This local terminal proof is
different from legacy design reconciliation, which still requires replacement
session evidence. It does not weaken that recovery policy or clear another
operation's quarantine.

A facade restart loses the required retained handles and in-memory ownership.
Inspection remains available, but this retirement route cannot reconstruct
authority from process absence, PID, saved receipts or a new bridge session.
Do not delete or rewrite the journal to make it pass. Record the unresolved
operation for a separately supported recovery procedure.

This adapter is source-tested. Connected opening and persistence validation
must be reported separately; the current release makes no writer-lifecycle
claim.

## Retained baseline validation

The `baseline-*` actions collect bounded startup evidence on the disposable project selected by
the original `open`. They do not execute the prepared name/description patch.
Check the installed offline schema first. Older snapshots do not expose them.

Keep this facade alive throughout. Start only after the original opener reports
the exact active PCB and native identity. The source project must contain an
ordinary symbol that is closed in every editor. Use its existing managed
checkpoint descriptor and exact project, branch, owner and symbol IDs to assemble
`preparation`. Do not supply `observationProjection`; the coordinator collects
its own observation. Preparation still does not authorize editing.

1. `baseline-begin` takes a new `operationId`, the original `openingOperationId`,
   `preparation`, and all three confirmations: `confirmNormalClose`,
   `confirmDisposableProject`, `acceptNormalOpenEffects`. It transfers ownership
   from the opener, captures the original session and requests normal closure
   once. It never chooses Save/Discard or forces exit.
2. `baseline-observe-termination` checks the original process and Job. A qualified
   pending result permits another observation, never another close. After proven
   termination it captures a raw closed-file SQL baseline and a separate native
   history checkpoint. Their hashes need not be equal.

   Before `baseline-relaunch`, also use the ordinary launcher's
   `observe-termination` with the original ordinary launch operation ID.
   Require `terminated` and the matching original launch digest. This records
   the old launcher's exit while its original Job is still selected. The baseline
   relaunch replaces that Job, so defer neither this observation nor its receipt
   until afterward. Do not request another close or abandon a proved exit.
3. Inspect `startupPremises`. `historicalSubsetSatisfied` requires the reviewed
   database version, a nondeleted PCB metadata count witness and no active
   schematic pages. Do not delete pages or edit the fixture to satisfy this guard.
   If `active-schematic-pages` is the only blocker, the explicit observation mode
   below can collect startup evidence without qualifying those effects. Other
   blockers still refuse opening.
4. `baseline-relaunch` requires `acceptNormalOpenEffects:true`. It launches one
   new retained generation. `baseline-admit` then captures its authenticated
   session. An authentication-pending result permits another admission check,
   not another launch.
5. `baseline-observe-caches` records one inactive-target upload-cache observation.
   `baseline-open-project`, with `acceptNormalOpenEffects:true`, independently
   rechecks raw source bytes, registration and caches before one project open.
   It accepts only the native Start/hidden-blank transition and no editor tabs.
   It observes the operation-local `loadProjectCompleted` event under the exact
   target context. That event has no producer identity and is only a startup
   prefix, not proof that every background callback finished.
   For an explicitly disposable project whose sole blocker is
   `active-schematic-pages`, additionally pass
   `acceptUnqualifiedSchematicStartupEffects:true` only when native sheet
   initialization effects are within the approved scope. Initialization can
   rewrite documents and queue persistence even with no sheet tab open. This
   opt-in preserves the blocker and `historicalSubsetSatisfied:false`; it records
   `projectOpeningMode:unqualified-schematic-startup-observation` and enables no
   writer. Omitting it preserves the strict no-active-page gate. A timeout or
   unexpected editor tab still consumes the attempt; use retained finish recovery,
   never repeat navigation. Check that the installed schema supports the field.
6. `baseline-finish-close` requires `confirmNormalClose:true` and
   `acceptUnknownFileEffects:true`. It uses the retained new generation's
   capture to request normal closure. Follow with `baseline-observe-finish`.
   A terminal retirement invalidates this attempt without replay or a claim
   about intended file changes. Use the returned state, not a close
   acknowledgment, to distinguish pending closure from proved termination.

   Updated finish implementations retain one final closed raw-file copy, SQL
   inventory commitment and native-history checkpoint before releasing the
   original capture. Inspect `finishSnapshotStatus` independently of retirement.
   `captured` means evidence is available, not that startup effects matched the
   baseline. Compare both complete inventories and native histories separately.
   Older journals report `not-recorded`; a termination receipt cannot recreate
   the lost copy authority.

   If the snapshot alone fails after proved termination, the journal retains
   its partial evidence and reports `failed`. Only this explicitly qualified
   failure may continue with `baseline-observe-finish` to retire from the same
   retained proof. It never repeats the snapshot, termination probe or close.
   Other errors, owner loss or conflicting evidence still require review.

   Newer retirement proofs also include a retained clock relation. It compares
   genuine launch, admission, cache, project-open and termination observations
   before releasing the original process captures. A missing stage or failed
   comparison reports unavailable evidence; it does not turn cleanup into a
   new startup attempt. This report describes sampled Windows clocks, not the
   APP backend actor or the clocks that produced document records. Durations
   longer than a minute do not extend the separate writer comparison window.

Continuation requests take only their operation ID and listed confirmations.
Do not pass a replacement top-level fingerprint, target, runtime or code.
`baseline-inspect` stays local after restart, but historical JSON cannot restore
lost handles or authorize continuation. A pre-admission launch failure, uncertain
close without its actual receipt, conflicting history or lost owner requires
review. The sole historical exception is the exact seven-phase stopped baseline
before any relaunch intent, documented in
[failure recovery](failure-recovery.md#closed-baseline-stopped-before-relaunch).
It permits abandonment only, never continuation of the old attempt. Do not
restart Codex mid-validation to try to clear other conditions.

`startupQualified`, `openingEffectsVerified`, `beforeWriteBaselineVerified`,
backend actor/clock qualification and writer authority remain false. The raw
source check is a point-in-time observation, not a file lock. Ordinary opening
can still have automatic effects. Never issue an extra Save, open a document,
confirm an update dialog, or run the prepared patch to complete this validation.

## Compare retained snapshots

Use offline `easyeda_control_api` after a successful terminal retirement with
`finishSnapshotStatus:captured`. First query `baseline-analysis` with
`includeSchemas:true`, then validate the exact request using
`baseline-analysis-validate`. Run `baseline-analyze` with
`query:{request:{operationId:"the-original-baseline-id"}}`.
The only input is that operation ID. Do not supply file paths, a runtime or code.

The analyzer requires the complete 24-phase lifecycle and both managed raw
copies and native checkpoints. It verifies their receipts and rereads the
evidence around the comparison. Incomplete, stopped, conflicting or corrupted
history refuses; do not manufacture missing records or repeat the lifecycle
just to make analysis pass. A failed final snapshot cannot be reconstructed
from the retirement proof.

The report compares all logical SQLite tables, schema, properties, rowids and
typed cells, plus all selected-branch native records and their provenance.
Table and document hashes/counts identify where differences occurred without
returning raw cell or record contents. Oversized reports refuse rather than
silently omit comparisons. Global history and other branches are covered by
the complete SQL comparison, not by the selected-branch native projection.

`classification:unchanged` means those retained logical states match. Raw
SQLite bytes can still differ due to physical layout. `classification:changed`
does not identify the producer or approve the change. Neither result proves
current source contents, startup completion, backend identity, safe editing
or saved-write verification. The original project is never read by this
analysis, and it performs no application calls or file writes.
