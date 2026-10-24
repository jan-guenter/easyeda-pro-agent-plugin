# Worker bootstrap, raw PCB roots and ratline capture batch

This batch starts at main `e49f765d556dc8767380f25cba9e993bcbbfd6f1` on
`feature/pcb209-workers-baseline-batch-20261024`. It follows the
[132442 connected startup refusal](2026-10-24-132442-connected-worker-startup.md)
and combines the resulting startup repair with two PCB implementation groups.
The prior disposable attempt is terminal. No production project was opened or
edited. The repaired startup code has not yet run against the editor.

## Changes

The209 startup transport separates the generated editor target, preload and
project-worker script. It qualifies each script at its original instrumentation
pause and retains a distinct consumed resume for each stage. Constructor
breakpoints are armed on the project script before its normal resume. Rejected
target diagnostics retain classifications and digests without private URL
values. Fixed backend/configuration/version/manager/import dependencies are
read through exact descriptors before allocating the native owner. These are
source snapshots; the existing five native installation leases are unchanged.

Lifecycle status now reports a project-opening attempt as consumed when its
worker-startup opening intent exists, including during cleanup and historical
inspection. It does not promote that intent to a successful generic opening
result. Four existing lifecycle scenarios exercise success, combined capture,
result-publication failure and native failure through original release and a
new historical coordinator.

The [empty-root baseline](2026-10-24-generation209-empty-root-baseline.md)
checks17 raw manager collections, inner-plane per-layer sets, board/panel state
and spatial collections. It brackets the retained common/SQL comparison with
two matching root observations. Watcherless models now cause refusal. This
private reader needs up to3099 commands, excluding enclosing startup and owner
checks, and is not placed inside the existing256-command owner.

The [ratline capture modules](2026-10-24-generation209-ratline-event-capture.md)
retain original bridge/factory objects and callback events for the fixed empty
startup branch. An independent review found and fixed a race where an extra
pause during final ownership reproof could precede packet issuance. The final
expected pause and resume must remain current; an extra pause causes refusal
and cleanup. Native worker-to-target association, subscribed canvas peer,
callback delivery and copper completion remain unproved.

## Scope and next work

The public change repairs the separate209 disposable project-worker startup
route. Raw-root and ratline modules remain private building blocks with explicit
limits. No writer, explicit Save or production admission is added.

After publication and installation, the next fresh host must be admitted before
one new disposable startup attempt. It must qualify all three scripts and
capture constructors before optional assignment/channel/actor observations.
That case needs original normal close, root and Job termination, helper release
and closed-file comparison. Never replay the132442 attempt.

Further integration needs original PCB and nested-worker capture, native target
association, terminal delivery and pending-producer evidence. The raw/common
SQL baseline needs a separately derived native command budget and populated
geometry support. Actor/native/server clocks, contained editing, consumed Save,
full closed/reopened SQL comparison and operation-specific recovery follow
those prerequisites. Broader schematic/PCB/library/routing/rule and export
families remain in the earlier API backlog; this batch does not relabel them
as implemented or connected-validated.

## Verification and release

Final frozen-payload checks, exact-commit CI and installation results will be
appended after implementation review. Focused implementation tests are offline
evidence, not a connected success for the repaired startup route.

## Reviewed candidate and local verification

Candidate `0.3.0+codex.20261024161458` contains665 source files with projection
`d3bedabe2aa53c03811ecead1499cd63b71b4f8b9c253f2347d261f041f4d7b1` and three bundle inputs with projection
`c10f8869b41664d72071d4c5073408f25ad35c08ab91f3ee874ad8edff93c70a`. Compatibility manifest SHA-256:
`2f1a0de2f249b8e95b5550c7f324aa21083cbd3949f10f6cab7ed210420c3799`. Only facade projections and review time
changed in the compatibility manifest; external pins and native helper bytes
remain unchanged.

Independent reviews covered the raw-root membership, common/SQL issuance,
ratline callback lifetime, bootstrap source derivation and event ordering,
installation wiring, lifecycle status, and documentation. All six actual
bootstrap dependency sources qualified. A separate reconstruction from the
pinned backend generator, root configuration and version file produced exactly
the three compiled bootstrap variants without executing application/import code.

Implementation verification passed7 empty-baseline tests,8 ratline capture
tests,4 bootstrap-source tests and4 lifecycle status scenarios. The startup
transport selection passed30 tests, followed by a final affected5-test run.
These exercise real V8 pauses and explicitly synthetic protocol fixtures; they
do not establish a connected successful209 startup. The transport evidence
summary identifies its original tool outputs rather than claiming raw log files.

Required local dependency installation, dependency tree, package signatures and
vulnerability audits, TypeScript, bridge types/lint, strict type-aware lint,
API coverage, generated protocols, build, compatibility, repository/package
and all-skill checks passed. All seven installed skill metadata validators
also passed. The initial full lint found the existing narrow dependency-count
exception attached to the wrong import after adding the bootstrap qualifier.
Moving that exception to the reported import fixed both findings; the rerun
reported zero warnings. No lint category or global configuration was relaxed.

The full facade/bridge suites and Windows native jobs remain assigned to the
exact final GitHub commit. Publication and installation are not claimed by
these local checks.
