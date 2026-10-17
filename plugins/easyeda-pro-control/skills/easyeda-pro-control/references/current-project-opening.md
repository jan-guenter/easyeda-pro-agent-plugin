# Current-version disposable project opening

Use `easyeda_control_project_open` only for an explicitly selected disposable
local `.eprj2` file and one existing PCB. This is the separately pinned current
3.2.206 application route. It does not enable legacy `runtime open-existing`,
generic document navigation or normal design writers. The separate disposable
`validation-*` workflow below can perform its sealed symbol-metadata edit and
internally derived inverse; ordinary opening and baseline observation cannot.

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

The current opener subscribes before project navigation and awaits one bounded
`loadProjectCompleted` prefix event before freezing post-open observations.
This covers the native blank-tab setup after the public promise returns.
The event has no authenticated producer identity and precedes further tab
restoration; it does not prove all startup work completed. Missing or conflicting
events and later context drift still consume the attempt without retry.

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
Keep the same facade alive. For an orphaned, stopped attempt whose original
opener still owns its runtime, use `request-normal-close` with the original `operationId`,
`confirmNormalClose:true` and `acceptUnknownFileEffects:true`. Check the installed
schema first; older releases lack this action. It selects the original owned
window internally and requests normal closure once. Supply no HWND, PID or
replacement fingerprint. It performs no bridge call and leaves quarantine set.
The ordinary launcher's close route remains blocked during quarantine; it is
not an alternative to the opener's scoped cleanup.

A close acknowledgement is not termination. Inspect an uncertain response;
never repeat the close or answer Save/Discard. If the retained close route is
unavailable, ask the user to close normally while keeping this facade alive.
Normal application closure must finish before `retire-after-termination` can
run. Do not force-quit or choose Save/Discard for unrelated work.

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

New opening results expose `preparationCheckpoint` for
`baseline-begin.preparation.checkpoint`. It contains the managed snapshot's
actual path, byte count and SHA-256. Do not substitute source-file size: SQLite
backup bytes can differ. Historical journals without this field omit it; the
descriptor is historical preparation evidence, not a fresh closed baseline.

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

## Optional current clock preparation

Use these stages only when qualifying the current metadata writer's date parsing.
They are not required to repeat an already completed opening or reader check.
Confirm the installed `project-open` schema includes both actions.
Read its offline `clockPreparation` entry before reserving a scratch attempt.
It lists the fixed helper, runtime versions and complete 18-file runtime hash
inventory. Compare those expectations with read-only installed-runtime evidence;
the entry itself does not observe the workstation or claim connected validation.
A mismatch needs a separately reviewed helper/profile update, not a retry or
an edit to historical pins. The 124500 release retained old scratch runtime pins;
do not use that release for this stage.

After `baseline-observe-termination` has captured the closed baseline, but before
`baseline-relaunch`, call `baseline-prepare-clock` with the original baseline
`operationId` and `acceptScratchProcessEffects:true`. It selects the exact
unlocked history-head date from that baseline. A source-qualified scratch
process tests the fixed Date program without loading EasyEDA's application or
profile. Its separate evidence retains the original process result. It neither
changes the fixture nor locks a history head to make it eligible.

After the same baseline's project-only opening succeeds, `baseline-observe-clock`
takes only that `operationId`. It binds the fixed renderer Date controls to the
original replacement generation and independent Windows clock observations.
No arbitrary script, date literal, process identity or supplied result is accepted.
The evidence remains separate from the original 24-phase lifecycle.

Each optional stage is one-shot, including an ambiguous failure. Inspect its
retained state instead of retrying. Keep the same facade and original process
handles. The ordinary finish workflow still owns application closure. A failed
scratch reference prevents replacement relaunch; do not bypass that refusal.

These controls do not arm a write window, prove continuous clock stability or
directly observe APP's clock. The validation writer must bind the original result
to its fresh immutable timestamp window. Startup qualification, full persistence
comparison and writer enablement remain separate.

## Disposable forward/inverse validation

Use this route only for the explicitly authorized sacrificial project. It is
an implementation-validation workflow, not enabled general symbol editing.
Query the installed `project-open` schema; older snapshots expose only opening
and baseline observations. Keep the same facade alive until both writes and
their verification generations have closed. A restart cannot reconstruct the
original owners from journals.

Finish baseline preparation through project-only opening and both clock
controls, but do not run the baseline-only finish actions. `validation-begin`
accepts the retained baseline operation ID and explicit disposable-project
acknowledgement. It retains the original generation, target, patch and clock
evidence. No replacement paths, metadata, fingerprint or execution code are
accepted. The forward-write phase requires a separate metadata-mutation
acknowledgement, and startup qualification still runs before that one write.

Use `validation-inspect` to read `nextPhase`. Each `validation-advance` supplies
that exact `step.expectedPhase` and only its schema-required acknowledgements.
A repeated request with a consumed phase refuses rather than advancing into a
different write, launch or close. Poll only a returned pending observation.
After a lost response, inspect before taking the next step.

The forward writer requests normal close, observes its original process/Job
termination and compares the complete closed SQL effect. A new admitted
verification generation excludes both inactive upload caches, reopens only the
project, checks saved symbol content, closes, and compares complete SQL again.
Only that fully verified result can supply the inverse. The inverse derives
its patch from the initial metadata and its baseline from the actual verified
post-edit snapshot; it obtains fresh clock evidence and repeats the same write
and reopen verification. It restores metadata, not historical SQLite bytes,
tickets, timestamps or history.

The writer requires the unlocked history head to be at least 61 seconds old at
its fresh backend-clock observation. A quickly completed forward verification
does not waive that requirement for the inverse. Allow the new head to age
before attempting the inverse write; an early refusal consumes the attempt and
is not permission to retry it or rewrite the head's timestamp/lock.

On failure, inspect the retained owner and use only the returned cleanup phase.
Never issue another edit, explicit Save, manual inverse, replacement operation
ID or prompt response. Closed recovery may report `unchanged`,
`exact-intended-effect` or `unresolved`; these are diagnostics, not permission
to continue a failed write. Missing original post-dispatch clock evidence or
uncertain capture cleanup remains unresolved even if later SQL looks unchanged.
Lost owners and conflicting journals require separate recovery work.

After a facade restart, `validation-inspect` can read managed baseline, writer
or verification history when no original coordinator remains. This returns
recorded state, flags and verified artifact descriptors with
`historicalEvidenceOnly:true` and `continuationAuthorized:false`. It does not
reconstruct `nextPhase`, infer completion, clear quarantine or permit replay.
Use `validation-inspect` for a baseline already transferred to its writer;
`baseline-inspect` still expects the baseline profile. Older installed versions
may refuse ownerless writer inspection. Neither refusal nor recorded terminal
flags establish current application state.

Source tests do not establish a live forward/inverse lifecycle. Record actual
connected results before deliberately enabling any normal writer capability.

Startup observation may return one fixed diagnostic stage: `project-only-context`,
`sch-holder`, `scheduler`, `cache`, `template`, `native-queue`, or `parts`.
Treat this as a consumed qualification failure, not a retry hint. Inspect the
original validation owner and follow only its offered cleanup phase. Preserve
the retained result for source review; do not invoke getters, relax a predicate
or repeat navigation to make the stage pass. Older snapshots return only a
generic startup failure. A diagnostic stage does not prove the failing holder's
actual value or identify every later failing check.

The ordinary forward-only metadata workflow is internal and unregistered.
Do not substitute ordinary projects into this disposable route, fabricate a
disposable acknowledgement, or call the older blocked symbol coordinator.
Future ordinary use must bind its own purpose and supported startup expectation
before navigation, retain the original owners, and complete full reopened
saved-content/SQL verification without an automatic inverse.

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
