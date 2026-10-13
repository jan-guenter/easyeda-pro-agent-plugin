# Candidate 030626

`0.3.0+codex.20261012030626` includes the Unicode reader fixes and scoped wire
validation record from [024750](api-coverage-024750-release-2026-10-12.md), plus
a correction for native metadata and geometry-write lifecycles. Full local
verification and exact-head CI passed; the official Git marketplace installed
and enabled this version. Installed offline checks passed. The original
eight-action restriction alone was not an exhaustive fix for native structure persistence.

## Why installation was held

The preceding payload passed all local checks and GitHub CI. The follow-up
symbol-deletion investigation then found that existing symbol/page/container
metadata writers share the same delayed `project_structures` scheduler.
Their document-record effect verifiers do not model that SQL table. Comparing
the database to a newly captured final checkpoint proves stability at that
boundary, not the intended table delta or absence of another queued write.

The [source review](symbol-delete-native-effects-2026-10-12.md#existing-metadata-writers)
records exact application hashes, native offsets and maintained call paths.
This is a completeness defect in the adapter's contract. It does not establish
that any historical disposable test damaged a project.

## Current restriction

The following eight operations refuse before new execution:

- `library.symbol.create` and `library.symbol.modify`;
- `document.page.create` and `document.page.rename`;
- `document.pcb.create` and `document.pcb.rename`;
- `document.schematic.create` and `document.schematic.rename`.

Classification, strict argument schemas, pure effect verifiers and historical
evidence remain inspectable. The policy is separate from operation classification
so receipt decoding does not itself become unavailable. Potentially dispatched
affected journals cannot gain a false terminal state through ordinary
reconciliation, including its no-mutation mode. Exact undispatched-preparation
invalidation and completed-journal inspection remain separate cases.

Footprint and DEVICE types are outside this native scheduler's type gate; this
restriction does not disable their routes, ordinary reads or navigation.
They retain their existing operation-specific guards. Design transactions for
schematic-page, symbol and PCB editors are also blocked, as explained below.
No caller flag, delay, repeated Save, callback suppression or raw-code path
overrides the restriction.

Restoring execution requires a complete structure-table effect model and an
operation-owned native job-completion witness, followed by disposable validation.
The refusal is containment, not completion of that remaining implementation.
Symbol deletion and target-paint capture synchronization also remain unfinished.

The source inventory now reports 774 method paths: 193 public subsets, 30 native
equivalents, no lifecycle-only methods, 82 implemented-but-blocked methods and
469 omissions. Routes total 274 available with their runtime guards, 94 blocked
and two partially blocked. These classifications describe execution scope,
not connected validation. The 108 design and 68 library schemas remain available;
89 design schemas are blocked and 19 footprint schemas retain their guards.

## Broader Save-path finding

The scheduler also admits a non-META change when its pending flag is absent.
Native `saveCanvas` compresses pending geometry with its unique ID, clears that
flag and publishes the change again. Source review therefore identifies the
same completion gap for saved PCB, schematic-page and symbol geometry, not
only the eight metadata operations. FOOTPRINT is outside this scheduler's
document-type gate. The design executor now refuses new apply, preflight for
Save, final dispatch, commit, rollback and layout repair for document types
1, 2 and 3. Potentially dispatched nonterminal reconciliation also refuses.
Historical terminal inspection remains read-only. Footprint type4 keeps its
existing guards. Both restrictions are tested together; the eight-action
restriction alone is not reported as an exhaustive fix.

The prior wire tests retain their exact source, document and checkpoint
observations. They do not prove that no later structure job remained queued.
This finding does not establish historical project damage. The
[Save and structure investigation](project-structure-save-completion-2026-10-12.md)
records the full call chain, exact scheduler scope, rejected completion
shortcuts and concrete requirements for a future observer and SQL-effect proof.

## Verification and publication

Focused regression tests prove zero dispatch and no runtime/checkpoint/journal side effects
on fresh refusal, safe inspection of historical terminal evidence, refusal of
both changed and apparently unchanged post-dispatch recovery, and unaffected
routes. Pure planner, expression and document-effect tests remain relevant but
cannot stand in for enabled coordinator tests.

The initial metadata-only 17-file run passed 607 tests with no skips. It predates
the broader design restriction and is not release acceptance. Seven coordinator suites
now contain 88 boundary, retained-storage and terminal-inspection tests. They
replace 139 former cases that required an enabled writer to construct their
journals, including 12 late-readback subtests. Those former cases are not counted
as passing or silently skipped. Pure planner, expression, document-effect and
exact undispatched-recovery suites remain. The replacement tests use sealed
synthetic journals and cannot establish connected write support.

The design restriction also displaces the former enabled-coordinator matrices.
Their pure profile, native-program, encoding, persistence and Save-evidence tests
remain active. Replacement tests exercise retained managed journals, exact
artifact hashes, byte invariance, read-only terminal summaries and refusal
before engine access. Fifty-one former flat-apply cases were replaced by six
sealed-profile refusal cases. Twenty-four flat nonterminal lifecycle cases now
check historical refusal; two terminal cases remain. Ten former PCB text
coordinator cases were replaced by 23 retained-journal refusal cases. These
changes test the restricted behavior; they do not validate the disabled writers.

The legacy recovery endpoint now receives a separate family check. Typed design,
library and other journal families must use their owning tool; shared state
names do not authorize legacy authority recovery or target navigation. Public
MCP refusals must happen before opening a bridge connection, not only inside
the transaction coordinator.

Clean full verification passed 4,065 facade tests, with one platform-specific
skip and zero failures, plus 424 bridge tests. A separate hostile inherited-fd
142/145 run passed the same facade totals. All four TypeScript checks and strict
type-aware lint passed without warnings. Dependency checks verified 151
signatures and 40 attestations with no audit findings. Sanitizer, generated
coverage, all seven official skill validators, repository/privacy/license checks,
offline doctor and actionlint passed. All three packaged runtime files rebuilt
with identical bytes and modes. A manifest-description check initially failed
on missing required wording, was corrected, and then passed without weakening
the validator or changing runtime code.

Frozen identities:

- 209 source files: `b94d4dbe1f939f8c45e65b39cce4a5caa10077d464efdca538bd9b38b809267e`.
- Three runtime files: `68ce4209f688f158b1c8120ef38a1c6bb80d1183cf306cf99bb399a27491e8b9`.
- Compatibility manifest: `ba9b639a98dd278be293e26a919c13ac914c8f7c88cfb48b89cc383d972560f0`.
- Full verification log: `b676b49580fa8f5e3bf71e2eb8cc4e80e917f326ceda5eec2e47f83dc7b4d594`.
- Hostile-fd log: `84e31f13e8d79e0d8568d0cbba9418b4174aa269b8cef9bd26127e9594e4332f`.

External compatibility pins are unchanged. The completed013324 wire
transactions retain their scoped historical evidence only. EasyEDA is closed;
no CAD, Save or navigation call is pending. Production remains excluded.

## Publication and installed verification

Payload `6535cfadf9a67ef0a4beae495467ccf07f8f6c32` is published on
`feature/api-execution-coverage` in draft [PR9](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/9).
Required [CI38202074298](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/38202074298)
passed 4,025 facade tests with five platform skips and zero failures, plus 424
bridge tests. All build, audit and package steps passed. Local verification
also exercised the mounted-source and Windows cases absent on CI.
Package subtree: `5f9bbb1b8379e1c4fd9c6b29a411cd270c2c810e`.

The official named upgrade from
[the Git marketplace](https://github.com/jan-guenter/easyeda-pro-agent-plugin.git)
installed and enabled this version with no errors. All 652 files, 17,001,549
bytes and committed permissions match the payload. The marketplace checkout
matches the same commit. The installed probe used the configured entrypoint,
including its ambient Node 26.7 to pinned Node 24.18 handoff.

The probe verified 26 tools, seven skills, both SDK signature catalogs, all
operation schemas and the complete coverage inventory. It checked all 108
design descriptors, the eight metadata restrictions, rejected policy overrides
and 20 actual fresh-handler refusals. No journal was created. Across 933
process observations, no upstream child or non-stdio socket was observed, and
the synthetic upstream sentinel stayed absent. Installed files stayed unchanged.
These are offline checks, not connected runtime or native completion evidence.

- Installed inventory: `2d1d67aa4793f0d3196b7ce115964fa8a77625b5e1cd42f1be5164d05042b594`.
- Installed proof: `fc6c5e6a54e9954efc936ac300f1ffcbda58e2399d8a204b4796ba57deeaf563`.
- CI log: `ca0cbd463e206e45c91e9e91ae514efa9a708be3c28bd6c482e7a2ce436f474b`.

No live call followed installation. A fresh Codex host is required before
connected work. No loaded cache or owner was modified or terminated.

## Work after containment

The [completion investigation](project-structure-save-completion-2026-10-12.md#alternative-a-transaction-that-owns-the-whole-app-session)
describes a feasible separate route using whole contained-session termination
and an exact closed-database effect proof. It still needs a maintained
implementation, persistent-upload replay exclusion and disposable validation.
Private synthetic SQL work is not shipped in this candidate and grants no
execution authority. Broader API coverage and PR9 remain unfinished.
