# Current project-only lifecycle validation

## Retained analysis and clock reporting

Update `0.3.0+codex.20261016090000` adds `baseline-analyze` to the offline API. It accepts only an
operation ID and requires the successful 24-phase lifecycle, final snapshot and
terminal retirement. Discovery and exact validation are available as
`baseline-analysis` and `baseline-analysis-validate`.

The analyzer rereads both retained raw SQL copies and both native checkpoints.
It compares every logical table, schema, database property, rowid and typed
cell, plus all selected-branch materialized native records and their provenance.
The response contains table/document hashes and counts, not private cell or
record contents. Reports over512KiB refuse without truncation. The original
project is never read, and no artifact, journal or application state is written.
An unchanged result means historical logical equality, not unchanged physical
SQLite layout, current source contents, qualified startup effects or permission
to write. Receipt hashes establish historical consistency, not authenticated
provenance against an attacker able to rewrite the entire retained history.

Retirement also records the relationship among original native launch,
admission, cache, project-open and termination clock observations. These are
issuer-bound observations from the same process generation. UTC and monotonic
durations are reported separately. Missing stages or a refused comparison remain
explicitly unqualified and do not obstruct otherwise-valid cleanup. Owner,
journal and original termination-proof failures still stop retirement. The
report neither observes the backend actor nor binds document timestamp
producers. It does not widen the separate60-second writer comparison window.

Five more call sites share one fresh history scan between adjacent bridge and
recovery predicates. They cover closed capture, preparation, baseline entry,
generation revalidation and opening dispatch. Synchronous owner checks remain
on both sides; pairs separated by awaited journal revalidation are unchanged.
Synthetic counts show2–3 fewer full scans per ordinary open and3 fewer per
metadata preparation. There is no cross-call cache or measured live speed claim.

The control skill uses its existing opening reference for the new analysis and
clock limits, following skill-creator guidance. No additional general skill or
duplicate execution schema was added. The new implementation passes focused
tests, full facade/bridge typechecks, whole-tree strict type-aware lint with zero
warnings, build, compatibility, API inventory, package/privacy and repository
checks. Independent review accepted the corrected receipt and runtime bindings.
Required full CI and installed-package verification remain release steps.

The resumed073000 session completed historical abandonment of the previous
pre-relaunch failure, then automatically launched and authenticated EasyEDA.
The disposable PCB open, normal closure, original termination and raw/SQL/native
baseline capture succeeded with the original file hash unchanged. The original
ordinary launcher separately recorded its exit before baseline relaunch. The
new relaunch succeeded and replacement-session admission is in progress. No
symbol patch, explicit Save or restoration ran.
Final live and delivery results belong in the release receipt and engineering
record; these source tests do not qualify the new clock report on a live run.

## Previous073000 update

Update `0.3.0+codex.20261016073000` retains a final closed-file snapshot before
releasing the replacement generation's process captures. The result includes
the raw byte-copy receipt, complete SQL inventory commitments and a separate
native-history checkpoint. These preserve evidence for comparing startup
effects; they do not classify those effects or enable a writer.

The live060000 run captured its closed baseline successfully, then exposed a
production wiring defect before relaunch dispatch. The coordinator compared
the engine's forwarding validator object with the runtime itself. The fix binds
the issued forwarder to its actual retained runtime, including later identity
checks, without assuming the objects are identical.

A separate local history action qualifies only the exact stopped seven-phase
baseline before its relaunch intent. It preserves the original journal, verifies
the retained evidence and publishes an exclusive abandonment sidecar. It grants
no current process, source, replay or writer authority. The060000 stopped
operation must use that action after a fresh session loads this update; do not
repeat its relaunch request.

`finishSnapshotStatus` distinguishes captured evidence from a failed or absent
attempt. A failure retains partial artifacts and the original terminal proof.
Only that specific failure can continue retirement without another snapshot,
close or termination probe. Lost ownership and conflicting journals remain
blocked. Historical inspection reports `not-recorded` for older operations.

Upstream closure hashing now processes at most four regular files concurrently
per capture. It keeps the sorted traversal, complete inventory, per-file identity
checks, final path checks and fingerprint format. Every started read and close
settles before an error is returned, with traversal-order failure selection.
No hash cache or freshness interval was introduced. End-to-end latency on the
installed plugin has not yet been measured.

Baseline owner revalidation also evaluates bridge quarantine and recovery
isolation from one fresh complete history scan. Bridge failures still take
precedence, including when they belong to the selected operation. This reduces
the diagnosed pre-checkpoint scans from12 to7; it does not cache admission,
omit artifact verification or remove any later revalidation.

The snapshot binds the exact source lineage and the new engine-issued capture,
close receipt and termination proof. It does not reuse the baseline generation's
expired copy authority. Whole-file SQL comparison and native record comparison
remain separate analysis; successful closure alone is not saved-state evidence.

Update `0.3.0+codex.20261016060000` adds an explicit observation-only mode to
`baseline-open-project`. Its optional `acceptUnqualifiedSchematicStartupEffects:true`
accepts only the original baseline's sole `active-schematic-pages` blocker;
schema, database-version and PCB-count requirements are unchanged. Default
behavior still requires the historical subset. Intent, result and inspection
retain the selected mode and acceptance; the historical blocker remains intact.
No writer, startup-completion or persistence claim is added.

The retained fixture has active schematic pages, so the preceding snapshot could
not perform its project-only continuation. The new mode permits observing that
ordinary startup without deleting pages or calling the prepared symbol writer.
[Installed-source research](current-schematic-startup-effects-research-2026-10-16.md)
shows why effects must remain unqualified: closed-tab sheet decoding can rewrite
native records and queue persistence, and caught initialization failures can
still precede the startup-prefix event. Existing navigation, context, source,
cache, retained-owner, quarantine and normal-close guards remain unchanged.

The060000 live baseline and prelaunch refusal are recorded above. Project-only
reopening remains unvalidated; the new073000 fixes are source-tested only until
a fresh session loads the published snapshot. Do not replay earlier operations. The
control reference was updated using skill-creator guidance to keep this opt-in
next to the existing workflow, without adding a general-purpose bypass.

Update `0.3.0+codex.20261016013000` turns the retained baseline work into a fixed disposable validation
workflow in `easyeda_control_project_open`. It does not enable a symbol writer.
The GitHub payload, CI result and installed snapshot are recorded in the PR36
release receipt and repository engineering record. Source tests are not
connected execution evidence.

## Scope

The original ordinary opener still selects one registered disposable project and
existing PCB. A new baseline operation consumes that retained owner, independently
prepares a closed ordinary symbol, normally closes the application, proves the
original process and Job terminated, and collects complete raw SQL and native
history evidence. The baseline is an original in-memory object, not caller JSON.

The next stages retain one new launch, its authenticated session and native
capture. Inactive upload-cache observations do not authorize opening by themselves.
The project-only continuation requires the original supported historical subset
or its explicit sole-active-page observation mode. It freshly hashes the exact
post-opening closed source. It does not reuse the
initial opener's digest or the previous generation's invalidated termination proof.
The raw reader uses descriptor-relative no-symlink traversal, bounded cooperative
hashing, identity checks and sidecar absence observations. It never attaches
SQLite to the live source and does not claim an atomic snapshot.

Within the single tracked navigation attempt, the generated program checks the
exact registry path and repeats fixed inactive-project/cache observations. Its
last synchronous guard directly precedes one public `openProject` call. No
`openDocument` or explicit Save call is generated. The post-open profile accepts
the native Start/hidden-blank transition, not restored editor tabs.

An operation-local listener observes `loadProjectCompleted` under the exact
retained root, project and branch. The event carries no producer identity. The
reply records that limitation and does not claim complete startup. The listener
cancels only its own retained task; timeout consumes the navigation attempt.

Finish actions normally close the retained replacement generation and observe
its original termination. They never answer Save/Discard or force exit.
No-replay retirement accepts unknown disposable file effects without calling them
the intended patch. Local inspection survives facade loss; process authority does
not. Unsupported lost-owner or missing-receipt recovery stays blocked.

## Source qualification

The ordinary opening APP/UI/MGR/WORKER pins remain unchanged. The project-only
profile additionally pins SCH 3.2.192 because its no-active-sheet premise relies
on that initializer. The startup report now calls an unrecognized stored version
`unsupported-database-version`; it does not claim every unknown value would run
a native migration.

The [startup source report](current-startup-premises-research-2026-10-16.md)
records the exact producers, offsets and hashes. It distinguishes the native
count witness from a raw document count, the local version-update no-op from
a stored version value, and the no-editor exam-autosave exclusion from a live
exam-state observation. No preference changes are needed for those exclusions.

The control skill's existing opening reference now documents the typed sequence,
pending-state handling, finish actions and restart boundary. Skill-creator
guidance kept this detail in that task-specific reference rather than adding
another general skill or duplicating schemas.

## Verification

For 073000, focused verification passes 27 admission/opener tests, 13
validator/relaunch/finish regressions and 87 historical-route/admission/registration
tests. Final affected recovery checks pass 15/15; packaged-startup smoke passes 5/5.
Snapshot and upstream hashing regression tests also pass. Full
facade/bridge typechecks and strict type-aware lint pass with zero warnings. Clean
dependency installation, build/sanitizer, compatibility, package/privacy,
repository, 774-method coverage, actionlint and all seven official skill checks
pass. Dependency audit verifies 151 registry signatures, 40 attestations and no
vulnerabilities. Independent reviews accept the scoped implementation.

The offline doctor's legacy installed-bundle and full-catalog checks still fail:
the current application uses separately pinned adapters and exposes the restricted
16-tool catalog, not the legacy full 41-tool catalog. No external pin or capability
gate was relaxed to obtain a pass. Final CI and the installed offline probe are
separate release requirements; their receipts must identify the actual payload.

## Remaining tasks

- Finish the current073000 disposable lifecycle, including final closed snapshot
  and retirement. The older pre-relaunch history has been qualified; do not
  abandon or replay it again. Retain any new refusal without replay.
- Run the new offline comparison on successful retained evidence after installing
  the update. A changed report identifies affected tables/documents, not their
  producer or an accepted startup transformation.
- Qualify remaining startup producers and reopening effects against actual
  closed SQL/native evidence. The prefix event is not a global idle barrier.
- Implement the effect-classified backend actor observation and producer-specific
  clock checks. UI identity and the notify clock do not prove APP's EDIT_HEAD
  actor or clock.
- Connect the fixed symbol name/description writer and exact inverse, then prove
  one disposable forward/inverse/persistence lifecycle and its failure recovery.
- Keep other blocked writer families and broader API omissions visible in the
  maintained coverage inventory. This workflow does not lift their restrictions.

No production project is part of this work. The earlier060000 live attempt used
only the existing disposable fixture. Its initial PCB open, normal closure and
closed baseline succeeded with the original file hash unchanged. Its relaunch
stopped before intent or native dispatch, then received exact historical
abandonment on073000. No metadata writer, explicit Save or restoration ran.
