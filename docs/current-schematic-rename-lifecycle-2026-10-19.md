# Disposable schematic rename lifecycle

Published version: `0.3.0+codex.20261019100838`.

Later evidence: installed143713 completed the disposable title-only lifecycle,
including complete intended SQL effect, fresh metadata/peer/child-roster
verification and final normal closure with unchanged SQL. See the
[version-specific ledger](api-connected-validation-ledger.md#generation-g20261019-143713-disposable-schematic-title-lifecycle).
The implementation/release checkpoints below describe the earlier100838
generation; their pending-validation statements are historical. New phase
batching and later generations are not covered by the143713 single-phase case.

The new `easyeda_control_disposable_schematic_rename` tool implements a separate
forward-only title change for one ordinary project-local SCH container in an
explicitly disposable project. It has offline discovery and validation through
`disposable-schematic-rename` and `disposable-schematic-rename-validate`.
Connected validation has not been recorded. Implementation and synthetic tests
do not establish live support on the installed runtime.

The [agent workflow](../plugins/easyeda-pro-control/skills/easyeda-pro-control/references/current-schematic-rename.md)
contains the request and phase sequence. It is deliberately separate from
sheet-title editing, circuit editing and the generic library writer.

## Implemented chain

The coordinator consumes only the retained disposable opening. Its PCB target
binds the local project path; a separate existing SCH target is verified against
the complete closed SQL baseline. The SCH baseline, replacement generation,
writer, clocks, snapshots and saved verifier have separate original-object
registries. No PCB token is converted into SCH authority.

Before dispatch, the route checks ordinary container history, metadata peers,
complete child membership and order, settled no-editor startup, inactive upload
caches, dormant auxiliary panels, actor observations and original native clock
brackets. The exposed workflow supports the independently aged unlocked-head
branch. It refuses child-derived container clocks, unsupported histories,
normalized-name ambiguity and reuse/import branches.

The pre-write clock read and one fixed rename share one retained dispatch mark.
Releasing and reacquiring a capture between them would advance the Windows
supervisor lifecycle epoch and invalidate the original clock tokens. The source
retains the actual raw responses and post-clock before clearing the mark. A
lost response or rejected postcondition never grants another write.

Normal closure must prove exit of the retained root and its non-breakaway Job.
The first complete closed SQL comparison admits only the modeled title/history/
structure/bookkeeping delta and preserves every unrelated table and cell.
The actual stored header and modifier must match the frozen expected actor.
That is a saved-effect postcondition, not advance attestation of the backend's
account state. No additional account request was added.

Only a successful retired writer issues the continuation. A fresh generation
checks the exact post-edit source before opening, excludes persistent upload
replay caches and reads saved SCH metadata, complete peers and child roster.
The final normal closure compares complete SQL against the post-edit snapshot.
Completion requires all these stages, including the child-roster result.

Cleanup consumes only retained original-owner close, termination or retirement
paths. It cannot restore ownership from JSON, adopt another process, replay
navigation, Save, invert the title change or restore files.

## Scope and source interpretation

The official
[modifySchematicName contract](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_schematic.modifyschematicname.html),
checked on 2026-10-19, remains a beta `Promise<boolean>` method. Its documented
reuse-block behavior can also rename the associated symbol and PCB. This route
uses the pinned native title-only path and excludes those branches; it is not
whole-wrapper support.

The delayed SCH subscriber may not run before closure. The lifecycle proves
that the old generation's contained producers ended, then verifies the actual
stored result. It keeps `schematicSubscriberCompletionVerified:false`.
Neither this proof nor final SQL equality establishes whole-profile invariance,
external-request absence, rendered sheet content or electrical connectivity.
Rename-triggered external-data branches are excluded before dispatch.

No explicit Save, inverse, ordinary-project write, design restore or production
project access was performed during implementation. No new live rename result
is claimed.

See the [producer and actor source review](current-schematic-rename-producer-scope-2026-10-19.md)
for exact installed source hashes, offsets and the scope/clock corrections.

## Admission cache change

Completed nonblocking legacy journals now retain compact cached projections.
The scanner still checks every current journal/artifact byte and path identity.
Ownership, admission, quarantine and writer authority are never cached.
The [synthetic measurements](admission-compact-projections-2026-10-19.md) reduced
warm reparses from 156 to zero across 390 journals. Timing varied in both
directions, so connected latency remains unmeasured.

## Frozen release candidate

The frozen candidate contains 496 facade source files, composite SHA-256
`ac8979538b6bbb250040a7d7c699391f52ee6e58625f055874a3842554989e6b`.
Its three runtime files have composite SHA-256
`9a380da1483012a6a76b3982ad7dc71a22310809f40aa93a0c0a496ff6310795`;
the compatibility manifest is
`30e0bedd85122f3bf1898fd878fac168490b7f750d2a110057e218f801ae1915`.
External runtime, SDK and bridge pins are unchanged. Root and independent
reviews accepted the source and complete changed-file privacy scan.

Initial release checks found a strict lint formatting issue and an 8 MiB
repository file limit exceeded by the generated facade. Both failures are
retained in the local release evidence. The correction permits at most 12 MiB
only for the exact facade bundle path, with a unique reviewed size/hash match.
Every accepted byte still receives the complete secret/privacy scan. Other
files retain their previous limit; installed verification keeps its separate
limits. The 56 focused repository/coverage checks passed. Corrected lint,
types, rebuild, compatibility and repository validation passed. Full frozen
verification and protected CI were pending at this prepublication checkpoint.

The new skill reference routes agents through the phase-specific SCH workflow
and explicitly separates discovery, installation and live validation.

## Delivery

[PR76](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/76) merged
as `3c7afb9e3eb2066ad1890f3fa4bd43b1381bbf89`. Its complete tree matches the
reviewed payload `e3c0583aca288ecc22d1a341e6c044256761d36d` exactly.
Exact-head Linux CI39236751786 passed the build, all eight test shards and the
aggregate check. The facade totals were 11,472 passes, five platform skips,
zero failures and zero cancellations. Windows39236751716 also passed. CI passed
424 bridge tests, strict zero-warning lint/types, signatures/security audits,
reproducible builds and the package, repository and seven-skill checks.
Copilot could not review because of quota; root and independent reviews passed.

The local full-suite results remain failed. The first exhausted the 48 GiB
`/tmp` mount and ended with 10,379 passes, 986 failures, 21 cancellations and
three skips. The unchanged disk-backed retry ended with 11,339 passes, 112
failures and four skips; older tests still hardcode `/tmp`. All four ambiguous
first-run errors and every failed retry title explicitly passed on clean CI.
Fourteen retry errors mask an earlier predispatch rejection, so their individual
local causes remain unproved. Local bridge/skill checks
passed, but the local catalog smoke and cleanup also failed on that mount.
No failed test directory was deleted, and no guard was relaxed to obtain CI
success. Removing hardcoded temporary paths is test-infrastructure backlog.

The official Git marketplace upgrade installed and enabled the new version.
Its cached HEAD equals merged main. Maintained verification compared all 1,507
files, 30,916,896 bytes and 42 directories with committed bytes and modes, with
no extras. The inventory SHA-256 is
`feb1cb5d58fcdc6392842ebcd0b8d929301652e7697f0790900b6a1d0be950c2`.
An initial read-only comparison refused the feature checkout's different HEAD;
the corrected call used the cached merged-main verifier. No cache was edited.
The new configured offline probe passed once in its original shell. Ambient
Node26.11.1 handed off to pinned24.18.0. It listed 21 restricted tools and passed
eight SCH discovery/schema acceptance and refusal queries, without calling the
live SCH tool. The original child exited0 through stdin EOF with no retained
handles, signals or adoption. Its synthetic profile and the complete installed
inventory stayed unchanged; the facade lease was removed. Two samples observed
no non-stdio sockets or descendants. They do not establish continuous isolation.
Proof SHA-256 is
`d4e0918341a5b623e8f8d3d80bdeb0ab4ce4287f981ed489a518594e8c4ed7a0`.
This probe is consumed and must never run again. Actual host admission and
connected SCH validation have not occurred. Root and independent reviews of
the retained proof, three inventories and all eight response hashes passed.

## Remaining work

- Fresh host admission and one original-owner disposable SCH rename lifecycle after installation. No consumed historical probe or completed case may be replayed.
- Populated Dimension/Image validation, PCB text writer prerequisites and full lifecycle.
- Safe complete polygon identities; broader component-library/3D, schematic/PCB editing, routing, ECO and export adapters.
- Additional platform tuples, bootstrap packaging and connected admission timing.
- Remove hardcoded `/tmp` paths from older test and validation fixtures without deleting retained evidence. Preserve original setup errors when adversarial assertions expect rejection.

Exact per-method omissions remain in the generated API inventory. Route counts
are not a count of currently callable or live-validated methods.
