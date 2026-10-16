# Current project-only lifecycle validation

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

This follow-up is source-tested only. Its live lifecycle must run after a fresh
session loads the published snapshot; do not replay earlier operations. The
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
and freshly hashes the exact post-opening closed source. It does not reuse the
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

Local verification passes 74 focused tests with no failures or skips, full
facade/bridge typechecks and strict type-aware lint with zero warnings. Clean
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

- Run the installed lifecycle once on an explicitly disposable fixture after a
  fresh Codex session loads this snapshot. Retain any refusal and do not replay.
- Qualify remaining startup producers and reopening effects against actual
  closed SQL/native evidence. The prefix event is not a global idle barrier.
- Implement the effect-classified backend actor observation and producer-specific
  clock checks. UI identity and the notify clock do not prove APP's EDIT_HEAD
  actor or clock.
- Connect the fixed symbol name/description writer and exact inverse, then prove
  one disposable forward/inverse/persistence lifecycle and its failure recovery.
- Keep other blocked writer families and broader API omissions visible in the
  maintained coverage inventory. This workflow does not lift their restrictions.

No production project is part of this work. No live EasyEDA call, design change,
Save or restoration was made while implementing these source changes.
