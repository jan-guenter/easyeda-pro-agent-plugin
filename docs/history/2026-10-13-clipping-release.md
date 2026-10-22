# Bounded clipping and runtime-version correction

Candidate `0.3.0+codex.20261013161000` continues the API implementation backlog
after PR11. It adds typed subsets of `intersects`, `union`, `subtract`,
`intersection` and `xor`, completing bounded adapters for all sixteen
`sys_Math` methods. This is not full support for every declared input type.

## Scope

Clipping accepts two simple, alternating orthogonal integer rings, each with at
most 16 distinct vertices and coordinates within ±32,768. The adapter copies
and explicitly closes each ring before invoking the actual SDK method. It
rejects cross-operand collinear supporting lines, endpoint contacts and more
than two proper crossings per edge. A bounded arithmetic check covers all
possible fragments before SDK dispatch; it neither replaces the SDK operation
nor suppresses its console globally.

Returned groups retain every outer ring and associated hole, including empty
results and disconnected components. Output is bounded to 192 stored points,
32 rings/groups and the existing 32 KiB transport envelope. The result validator
checks geometry without synthesizing a replacement SDK result. Input holes,
groups, curves, noninteger or nonorthogonal clipping, touching boundaries and
native objects remain unsupported. The eleven preceding methods retain their
larger point-array contract. See the [source research](2026-10-13-sys-math-clipping-research.md)
and [method review](2026-10-13-sys-math-implementation-review.md).

Offline coverage now records 209 public subsets, 30 native equivalents,
82 implemented-but-blocked methods and 453 omissions across 774 distinct paths.
Execution routes include 290 guarded, 94 blocked and two partially blocked
routes. These counts describe implementation, not live validation.

## Observed runtime defect and correction

The restarted installed135500 facade successfully authenticated the existing
bridge on EasyEDA 3.2.206. Its first triangle-area request refused before SDK
execution: the new profile expected `3.2.206.715d940d`, the installed package
version, but the bridge reports `3.2.206` from `getEditorCurrentVersion()`.

The corrected profile pins that exact observed value as `editorReportedVersion`.
It does not use prefix matching or normalize a fabricated fingerprint. The
installed package check, exact API/adapter/declaration/PCB hashes, bridge
identity and old design compatibility manifest remain unchanged. A literal
observed-version test replaces the fixture that previously copied its expected
value from the same profile, and verifies that other versions still refuse.

There has been no successful live math call on either release. Installed135500
is not hotpatched. The corrected installed snapshot needs a fresh host before
one supplied-coordinate smoke test. No project is needed for that test.

## Verification and delivery

Focused synthetic adapter/coordinator tests, strict types and zero-warning lint,
the existing CI suite, reproducible bundles, package/privacy checks and all seven
skill validators remain release gates. Final CI counts, protected merge and
official Git-marketplace installation results are recorded in the
[PR12 delivery receipt](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/12).
Local verification passes 56 focused/integration tests and all 424 existing
bridge tests, full facade/bridge types and strict zero-warning lint, package/
repository/privacy checks and all seven skill validators. Dependency audit found
zero vulnerabilities and verified all 151 package registry signatures.
Independent implementation review found no blockers. Source projection312 is
`54a886272cff526166f57b5d824198710313705336a42a3db33ca90502b2fe32`; runtime
projection3 is `3654c59582f1653094773e316f4268558a850786c84aa223810f2471f1745641`.
External compatibility pins are unchanged.

No CAD edit, navigation, Save, project access, shared-setting change, journal
recovery, credential rotation or bridge import is included. The consumed C10
request stays untouched. Production designs and their project records remain
outside scope. The same private machine profile is already migrated; do not
repeat migration or start another gateway to test this update.

## Remaining work

1. Validate one supplied-coordinate calculation after installing this snapshot
   and restarting the host; then add scoped live clipping examples if useful.
2. Broaden clipping inputs only after addressing coincident/touching edges,
   floating-point degeneracy and complete group-input semantics.
3. Review newer editor implementations before restoring design readers,
   navigation, native UI or writers on this app generation.
4. Finish native structure-job completion and complete SQL-effect proof before
   enabling the blocked metadata and schematic/symbol/PCB transactions.
5. Continue other omitted SDK families under typed, task-scoped contracts.

Installation uses the existing Git marketplace and supported CLI, as described
in the [official packaging documentation](https://developers.openai.com/plugins/build/plugins).
No installed cache or host-owned process is modified manually.
