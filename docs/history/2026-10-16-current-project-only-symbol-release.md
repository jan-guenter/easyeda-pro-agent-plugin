# Project-only symbol reader and writer preparation

Scoped candidate `0.3.0+codex.20261016103000`, 2026-10-16. Frozen payload, final CI,
publication and installed-package results are pending. This update does not
enable any writer. The running `0.3.0+codex.20261016090000` lifecycle is separate
evidence for the previous installed implementation.

## New public reader

`easyeda_control_project_symbol` gains a project-only preflight request alongside
its existing active-PCB metadata request. It observes one exact project-local
ordinary symbol while only the Start Page and optional native hidden blank tab
exist. It does not open a PCB or symbol editor. Offline
`project-symbol-preflight` discovery exposes the request/result schemas;
`project-symbol-preflight-validate` checks arguments without live execution.

The caller supplies exact project, branch, symbol and owner identities plus
`expectedBefore` metadata. The reader compares name, description, raw tags,
source, version and ticket twice. It also observes the project client/max-ticket,
agreeing dual UI actors and bounded renderer/notify clock samples. Complete
bounded registry/DOM guards refuse editor tabs, hidden editors, pending restored
tabs, document URL commands, dirty tabs, cached read-only state and concurrent
strict mode. Initial/final runtime checks and the fixed native observation share
the original authenticated scope.

The request has a ten-second inner deadline and a bounded result. Deadline expiry
does not cancel an already dispatched native request or justify retry. There is
no cloud-library lookup, geometry load, navigation, mutation or explicit Save.
The existing public tool is extended; this is not an unrestricted worker API.

Caller expectations are not saved-source provenance. Matching samples do not
independently lease the worker, establish permission, qualify startup effects,
authenticate the APP actor or establish a write clock. Stored absent/falsy fields
can differ from native getter fallbacks. Result authority and persistence flags
remain false. See the maintained
[request and limits](../../plugins/easyeda-pro-control/server/src/current-project-only-symbol-preflight.ts)
and [runtime coordinator](../../plugins/easyeda-pro-control/server/src/current-project-only-symbol-runtime.ts).

## Internal work included

The new
[actor comparison wrapper](../../plugins/easyeda-pro-control/server/src/current-symbol-transaction-actor.ts)
freezes an agreeing dual-UI actor selection and exactly one matching user row
from the original before inventory. UI names and project-user names remain
separate. Only the original in-memory preparation can reach its retained SQL
plan; serialized plans and caller success flags cannot substitute for it.

`transactionActorMatchesExpected:true` follows the wrapper's own successful
complete SQL comparison. That comparison still requires exact generated history,
project modifier, metadata and collateral invariants. The unchanged comparator
does not learn the expected actor from after data. This is an internal
postcondition, not `backendActorPreverified`, source/session provenance or writer
authority. The [actor plan](2026-10-16-current-backend-actor-adapter-plan.md)
explains the attribution tradeoff and why an effectful `/api/user` diagnostic
would not finish the writer.

A separate fixed persistence-dependency verifier admits the SQLite package
metadata, JS loader, binding loader and exact Win32 native addon for the reviewed
APP route. It rejects changed files, symlinks/hardlinks, substituted ancestors
and higher-precedence module-resolution candidates. Existing opening/read
profiles do not gain a writer through this verifier. File hashes do not prove
the original Job owns every producer, that timers finished, that pending writes
persisted or that upload caches cannot replay. Those remain lifecycle checks.
The [producer-scope review](2026-10-16-current-symbol-producer-scope.md) records
the exact route, dependencies and containment limitations.

Initial disposable-opening admission now evaluates bridge quarantine and native
editing admission from one fresh complete history scan. Both predicates and
their error ordering remain; later dispatch/recovery checks still run. This
saves one full scan at that boundary. Synthetic call counts establish the scan
reduction, not a measured live latency improvement or a cross-call hash cache.

## Verification and live evidence

Nine focused actor-wrapper tests pass under pinned Node 24.18.0, disabled core
dumps and the maintained test-isolation preload. They cover frozen inputs,
UI/project-name separation, malformed or missing actors, forged originals,
coherent unexpected actors, collateral SQL changes and unchanged clock/version
requirements. Targeted strict type-aware lint has zero warnings and facade
typechecks pass. The implementation review accepted this bounded, nonauthorizing
wrapper.

The admission reduction's focused run passed 33 tests with types,
strict lint and independent review. Seven reader/compiler, nine runtime, five
registration and 19 dependency-resolution tests pass. Independent review accepts
the public integration without enabling a writer. Whole-tree types and strict
type-aware lint pass with zero warnings. Initial repository validation caught
literal control bytes in the generated guard's source regex; textual Unicode
escapes replace those bytes without changing its behavior or binary allowlist.
The seven focused compiler tests and final build, compatibility, package/privacy
and repository checks pass after that correction. All seven official skill
validators pass. External runtime pins are unchanged. Bundle reproduction,
protected GitHub CI, publication and installation must be
reported against the frozen payload, not inferred from these focused results.

Initial full CI caught one older callback fixture whose VM omitted the newly
introduced schema. Its import and VM binding are corrected; all existing
assertions and production bytes stay unchanged. All six callback tests, types
and targeted strict lint pass, with independent review. The initial failed CI
is not release acceptance; the updated exact payload requires its own green CI.

Installed 090000 completed the full disposable initial opening, normal closure,
original termination, closed baseline capture, replacement launch, admission,
inactive-cache observation and project-only opening. Its final normal closure,
original root/Job termination, retained final snapshot and capture release also
succeeded. The original 24-phase operation is retired; it must not be replayed.

The maintained offline analyzer accepted that retained lifecycle. Both raw files
are byte-identical at 598,016 bytes, both native checkpoints are identical at
561,152 bytes, all 35 logical SQL tables match, and all 18 selected-branch native
documents and their provenance match. Same-generation Windows clocks were
retained across launch, admission, caches, project opening and termination.
Their endpoint ordering is observed; timestamp-producer binding and continuous
clock stability remain unproved. Historical equality is not startup authority.

That run did not execute the new candidate reader or actor wrapper. Candidate
connected validation, final commit/CI and installed inventory remain pending.
No metadata edit, explicit Save, restoration or production-design change ran.

## Remaining tasks

1. Qualify startup effects separately before using a future opening as a
   before-write baseline. The completed 090000 historical comparison and
   active-sheet observation acceptance are not writer prerequisite waivers.
2. Publish/install this scoped reader update after final verification, then use a
   fresh Codex session for actual candidate admission and a disposable reader
   check. Do not terminate the old facade or modify its loaded cache.
3. Implement the current writer's original clock plan and fresh supervisor-issued
   sampling at the final dispatch boundary. Finish expensive checks before arming
   separate document/backend windows of at most 60 seconds. Preserve the current
   aged-head rule and qualify its current-source native date parsing. Do not reuse
   the historical module's old APP pin. The
   [clock contract](2026-10-16-current-symbol-clock-contract.md) gives the collection
   order, unchanged comparator and explicit stable-OS-clock assumptions.
4. Implement the separately versioned whole-closed-session metadata coordinator.
   Bind its original plan, actor selection, clocks, exact local routing and
   process ownership; journal one mutation; close normally once; prove original
   root/Job termination; and compare complete closed SQL/native effects. Missing
   or unexpected effects fail without Save or automatic retry. Dependency
   admission alone does not satisfy these steps.
5. Exclude both persistent branch-upload cache namespaces in a fresh owned
   inactive-target generation before reopening. Then prove saved/reopened state,
   the exact metadata inverse and failure recovery on the disposable fixture.
6. Continue broader API implementation under the
   [maintained method/route inventory](../../plugins/easyeda-pro-control/api-coverage.json)
   and [omission explanations](2026-10-10-api-coverage-inventory.md). Schematic,
   symbol and PCB transactions and eight metadata routes retain their existing
   restrictions. Remaining work also includes broader typed readers/navigation,
   component and library effects, export paths with hidden annotation/Save,
   managed file transfer and resource-owned callbacks/events. Commercial actions
   need separate task authority. Source discovery is not execution support.

The [connected validation ledger](2026-10-11-through-2026-10-19-api-connected-validation-ledger.md) remains
generation-specific. Historical saved/reopened tests, this reader and internal
comparison helpers do not validate every SDK method or lift older restrictions.
Production designs and their records remain outside this release's validation.
