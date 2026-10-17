# EasyEDA Pro Agent Plugin

`easyeda-pro-control` is a Codex skill and MCP facade for EasyEDA Pro inspection and typed API editing, with native controls for missing APIs and dialogs. It provides version-pinned readers, component and geometry transactions, operation-specific library/export workflows, SQLite checkpoints, hash-bound evidence and recovery journals.

On the current EasyEDA Pro 3.2.206 runtime, general schematic/PCB and library
writers remain disabled. Disposable symbol-metadata validation has passed both
forward and inverse edits, complete closed SQL comparisons and reopened-content
checks. The separate current-version tool now supports forward-only name and/or
description edits for unused, metadata-only project-local symbols. This is a
narrow native equivalent, not general library or symbol-geometry editing.
Older implemented adapters and their historical proofs do not enable them on
this newer runtime. See the [current result and remaining work](docs/current-symbol-clock-lifetime-2026-10-17.md).

The scoped release limits `easyeda_control_design` execution to footprint
editors under their existing guards. Schematic-page, symbol and PCB transactions,
plus eight library metadata writers, are blocked pending native structure-job
completion and complete SQL-effect proof. Their schemas and pure effect
verifiers remain available. Other `easyeda_control_library` routes keep their
operation-specific gates. Enabled writes require the reviewed runtime, an
authenticated session, a retained Windows process Job, journaled before-state
and exact effect verification. The legacy writer remains runtime-disabled.
Unrestricted JavaScript has no environment opt-in. Coverage and live validation
remain operation-specific.

The October revamp consolidates the September repairs and adds an offline API
reference, exact typed-operation schemas, argument validation, bounded editor
readiness observation and a durable no-repeat Save guard. Failed navigation is
observed and reconciled, not blindly replayed. A failed Save cannot become
repeatable through reconciliation or runtime rebinding.

Update `0.3.0+codex.20261017181500` adds a separate disposable-only symbol-copy
workflow. It retains the original returned UUID, verifies the complete closed
SQL effect, reopens and checks the new symbol, then verifies final SQL equality.
The supported source is a bounded single-part self-contained drawing; ordinary
copying, chosen names, classifications, assets and deletion remain unsupported.
Source/peer preservation and generated-reader capacity are checked explicitly.
The implementation has offline tests; connected validation remains pending.
See the [workflow](plugins/easyeda-pro-control/skills/easyeda-pro-control/references/current-symbol-copy.md)
and [native contract and remaining work](docs/current-symbol-copy-contract-2026-10-17.md).

Earlier update `0.3.0+codex.20261017170000` adds current-version PCB text readers for
`get`, `getAll` and `getAllPrimitiveId`. They return bounded raw text, font,
placement and style from parentless loaded String views, not component
attributes, rendered glyphs or saved-source ownership. These native equivalents
have source review and offline tests, not connected validation. The control
skill now routes to shorter task-specific API references. See the
[release scope](docs/current-pcb-text-2026-10-17.md) and
[symbol-copy contract](docs/current-symbol-copy-contract-2026-10-17.md).

Earlier update `0.3.0+codex.20261017160000` extends disposable symbol-metadata validation
to bounded multi-segment drawing histories. It checks byte-exact records and
possible concurrent replay order, with capacity reserved for both metadata
writes. Imported records, ambiguous cache actors and histories beyond the
101-chunk batch remain unsupported. This is offline-tested support, not a live
drawn-symbol result; ordinary editing remains META-only. See the
[current scope and backlog](docs/current-symbol-clock-lifetime-2026-10-17.md).

Earlier update `0.3.0+codex.20261017143000` adds a disposable-only single-canvas-segment
symbol-metadata validation profile and bounded historical JSON-digest reuse.
Every cached digest still requires fresh byte, identity and runtime checks;
connected latency improvement is not claimed. The new drawn-symbol profile is
offline-tested and leaves ordinary editing META-only. Installed123000 has now
passed the ordinary public route end to end on a disposable fixture, with exact
SQL/reopened content and all 17 peer documents preserved. See the
[current scope and backlog](docs/current-symbol-clock-lifetime-2026-10-17.md).

Earlier update `0.3.0+codex.20261017123000` registers
`easyeda_control_project_symbol_metadata` with strict offline schemas and
purpose-bound ownership. It retains the shared writer validated by the 101500
disposable round trip; its later installed-session ordinary run also passed.
Referenced symbols and ordinary editing of historical drawing content remain
unsupported. That update also corrects current-runtime doctor expectations and
removes a redundant full-history scan used only to check an operation ID.
See the [workflow](plugins/easyeda-pro-control/skills/easyeda-pro-control/references/current-project-opening.md#ordinary-forward-only-symbol-metadata)
and [evidence and backlog](docs/current-symbol-clock-lifetime-2026-10-17.md).

Earlier update `0.3.0+codex.20261017101500` corrects inverse journal adoption after the
090000 run passed forward verification but stopped before restoration. It also
rejects historical drawing content before metadata dispatch and reserves the
history, SQL and saved-result capacity required to verify both disposable edits.
Raw database and normalized-checkpoint hashes stay separately bound; physical
file growth, memory and deadlines remain runtime limits. The failed operation
is terminal, with the forward metadata retained. Its later installed-session
round trip passed; the 123000 update adds the separate ordinary route. See the
[current result and backlog](docs/current-symbol-clock-lifetime-2026-10-17.md).

Earlier update `0.3.0+codex.20261017090000` models exact current document-cache
serialization for META-only symbol verification and bounds parallel journal
hashing. The 072500 run acknowledged its forward write and passed complete
closed SQL checks, then stopped on a saved-header user mismatch. Original-owner
cleanup completed with the post-write database unchanged. The requested metadata
remains in the disposable fixture; no inverse, Save or retry was issued. The
complete round trip and ordinary writer enablement remain pending. Delivery
results are recorded in AGENTS.md and the
[current result and remaining work](docs/current-symbol-clock-lifetime-2026-10-17.md).

Update `0.3.0+codex.20261017072500` restricts disposable metadata validation
to unreferenced symbols and adds fixed post-mutation failure diagnostics.
The 043703 run dispatched its edit, then stopped at an ambiguous `MUTATION`
marker. Original-owner cleanup completed; a full closed-file diagnostic found
the intended metadata change, expected native bookkeeping and 17 unchanged peer
documents. The lifecycle remains unresolved, with no retry or inverse authority.
Used symbols invoke native linked-sheet propagation that this writer does not
yet verify. Ordinary writers remain disabled pending a complete new
unused-symbol validation lifecycle. Delivery results are recorded in AGENTS.md.
See the [current result and remaining work](docs/current-symbol-clock-lifetime-2026-10-17.md).

Update `0.3.0+codex.20261017043703` supports the native case where the selected
account has no historical project-user row: its UUID stays fixed, while persisted
display names must be empty. It also adds ownerless historical inspection,
preparation checkpoint descriptors in opening results, and lower-overhead fresh
file hashing. The 033309 run passed the former clock failure point but stopped
before editing at this missing-user case; cleanup proved the fixture unchanged.
Normal writers remain disabled pending the complete disposable round trip.
See the [current result and remaining work](docs/current-symbol-clock-lifetime-2026-10-17.md).

Update `0.3.0+codex.20261017033309` fixes historical clock evidence being invalidated
by legitimate writer capture/release steps. It also adds per-sample diagnostics,
reduces repeated historical SQL parsing while retaining fresh integrity checks,
and completes failed-opener close parity for the still-unregistered ordinary
metadata workflow. The 020000 run stopped before its edit; original-owner cleanup
proved complete SQL and raw-file equality. Normal writers remain disabled.
See the [clock correction and remaining work](docs/current-symbol-clock-lifetime-2026-10-17.md).

Update `0.3.0+codex.20261017020000` adds a bounded native startup-prefix wait
before post-open observations and a retained-owner normal-close action for a
failed disposable opening. The close leaves quarantine set until termination
and bridge closure are proved. Fixed diagnostics distinguish project, tab and
snapshot mismatches without returning private values. The211500 opening stopped
before symbol validation; its original process was closed and retired, and the
disposable file remained byte-identical. Normal writers remain disabled.
See [opening recovery and remaining work](docs/current-opening-recovery-2026-10-17.md).

Update `0.3.0+codex.20261016211500` corrects a source-proven startup-holder
mismatch and adds bounded failure categories. The200000 disposable run passed
both clock controls, then refused before writer transfer. Original-owner cleanup
completed with unchanged raw bytes, all 35 SQL tables and 18 native documents.
The new internal ordinary metadata workflow is forward-only and purpose-bound,
but remains unregistered pending a successful disposable round trip.
See the [startup correction and remaining work](docs/current-symbol-writer-owner-release-2026-10-16.md).

Update `0.3.0+codex.20261016200000` fixes missing production clock-method
forwarding and removes redundant launch/baseline admission scans while retaining
the final checks. The190000 disposable run passed its isolated clock check and
project-only reopening, then refused before renderer sampling or any edit.
The fix preserves original capture ownership; it does not enable normal writers
or claim a successful connected metadata round trip.
See the [failure, implementation and backlog](docs/current-symbol-writer-owner-release-2026-10-16.md).

Update `0.3.0+codex.20261016190000` adds a disposable-only forward/inverse
symbol-metadata workflow through `project-open`'s `validation-*` actions.
It retains the prepared baseline and actual writer/verifier owners, requires
an exact phase on every continuation, and derives the inverse only from the
verified forward result and original metadata. Closed recovery classifications
never authorize retries or blind inversion. Normal writers remain disabled;
connected forward/inverse validation is the next step, not a claimed result.
See the [workflow and backlog](docs/current-symbol-writer-owner-release-2026-10-16.md).

Update `0.3.0+codex.20261016173000` completed the private post-write
verification workflow: original post-edit snapshot transfer, a fresh admitted
generation, both inactive upload-cache exclusions, project-only reopening,
exact saved-symbol content comparison, normal closure and complete SQL
invariance checks. Failed writes do not receive reopening authority. These
paths were not public writer enablement or connected validation. The190000
entrypoint supersedes the implementation gap; connected validation remains open.
See the [implementation and backlog](docs/current-symbol-writer-owner-release-2026-10-16.md).

Update `0.3.0+codex.20261016140000` corrects the scratch helper's runtime
profile, exposes its complete expected runtime in offline discovery, and adds
bounded launch-stage timing diagnostics. It also integrates a private symbol
writer coordinator with startup checks, original clock ownership, normal closure
and complete closed-file comparison. Later updates implement its private
cache/reopen and inverse/recovery workflow; live validation remains separate.
See the [scope and remaining work](docs/current-symbol-writer-owner-release-2026-10-16.md).

Update `0.3.0+codex.20261016124500` adds two optional, one-shot clock-preparation
actions to the retained disposable workflow and a private fixed symbol-metadata
writer compiler. The clock actions retain original scratch-process and renderer
observations; they do not enable editing. The compiler refuses changed metadata,
actors, tickets, receivers and expired windows before its sole native mutation,
but remains unregistered pending lifecycle integration and live validation. See
the [scope and remaining work](docs/current-symbol-writer-compiler-release-2026-10-16.md).

Update `0.3.0+codex.20261016120000` adds internal fresh Windows clock sampling,
current-version aged-history parsing and a one-shot persisted-timestamp
comparison. The new path keeps its timestamp windows fixed even when final
verification happens later. It adds no public writer or execution authority;
the coordinator and disposable forward/inverse proof remain unfinished. See the
[implementation and remaining work](docs/current-symbol-clock-implementation-2026-10-16.md).

Update `0.3.0+codex.20261016103000` adds a project-only symbol comparison without
opening a PCB or symbol editor, plus internal actor postconditions and exact
SQLite dependency checks for the future writer. The previous installed lifecycle
completed normal close/reopen/close with unchanged retained raw files, complete
SQL and native history. This does not qualify startup effects or enable editing.
See the [scope and concrete remaining work](docs/current-project-only-symbol-release-2026-10-16.md).

Update `0.3.0+codex.20261016090000` adds offline `baseline-analyze` for complete retained SQL/native
snapshot comparisons, process-bound clock reporting at retirement, and fewer
redundant history scans. It also fixes authenticated status checks around cache
observation and project-only opening. These diagnostics do not enable a writer. See the
[implementation scope and remaining tasks](docs/current-project-only-lifecycle-release-2026-10-16.md).

Update `0.3.0+codex.20261016073000` preserves final closed-file SQL and native
history evidence before releasing the disposable process captures. Snapshot failure is
reported separately from retirement and never permits another copy or close.
The same update batches up to four independent upstream file hashes and combines
two history-admission predicates into one fresh scan. It preserves complete
fingerprint, identity and quarantine checks, without caching admission or
reducing its frequency. This supports startup-effect analysis without enabling a writer. See the
[scope and remaining tasks](docs/current-project-only-lifecycle-release-2026-10-16.md).

Update `0.3.0+codex.20261016060000` adds an explicit disposable startup-observation
opt-in for projects with schematic pages. It preserves their unqualified-startup
blocker and permits no writer. Native initialization may rewrite documents and
queue persistence even without a sheet tab; the skill explains the acceptance
and one-shot finish workflow. See the [scope and remaining tasks](docs/current-project-only-lifecycle-release-2026-10-16.md).

Update `0.3.0+codex.20261016013000` exposes retained disposable baseline validation, project-only
reopening and normal-close completion without enabling a writer. It binds the
post-opening closed file, fresh cache checks and the original process/session.
See the [lifecycle scope and remaining tasks](docs/current-project-only-lifecycle-release-2026-10-16.md).

Published update `0.3.0+codex.20261015140000` connects retained disposable-project
opening to internal checkpoint-bound symbol preparation. It rejects hidden
editor containers and lost ownership without enabling a writer. It also removes
a redundant full-journal scan from local launch inspection, identifies blocked
recovery prerequisites and launcher drift precisely, and qualifies Bubblewrap
0.13.1. See the [scope and remaining implementation](docs/current-symbol-owned-preparation-release-2026-10-15.md).

Published update `0.3.0+codex.20261015090000` integrates checkpoint-bound symbol
name/description preparation into the existing offline API. It checks complete
selected-branch history and peer names without opening the original design or
enabling a writer. It also fixes PowerShell first-use progress breaking startup
recovery and checks raw stderr in Windows CI. See the
[scope, usage and remaining work](docs/current-symbol-preparation-release-2026-10-15.md).

Published update `0.3.0+codex.20261015060000` adds recovery for a reviewed intent-only
ordinary startup after its facade restarts. A separate read-only Windows helper
excludes a delayed old-helper launch before recording explicit abandonment.
It preserves the original intent and does not claim termination or authorize
design work. See the [recovery scope and limits](docs/ordinary-launch-recovery-release-2026-10-15.md).

Published update `0.3.0+codex.20261015040000` adds `easyeda_control_project_symbol`
for metadata of one exact project-local symbol absent from the tab registry while a PCB
is active. It avoids the public getter's cloud-library fallback and geometry
loading. This provides a reusable read needed by the current-version rename
workflow; it does not enable that writer. See the
[implementation scope and backlog](docs/current-symbol-metadata-release-2026-10-15.md).

Published update `0.3.0+codex.20261015020000` adds default Pad copper-shape parameters,
mask expansion values and thermal configuration to the existing PCB reads and
component child-pad results. Rectangle corners are reported as a ratio percent,
not a radius. Polygon paths, full pad stacks and fresh rule resolution remain
excluded. The existing skill reference documents these distinctions; the
[release scope and backlog](docs/current-pad-parameters-release-2026-10-15.md)
records what is implemented and what still needs live validation.

Published update `0.3.0+codex.20261015003000` adds nullable round/slot Pad hole geometry and a component's
ordered child-pad list to the current PCB reader. The child list is correlated
with the complete global Pad collection; results identify forward membership
and explicitly leave reverse-parent and schematic pin mapping unverified.
Hole dimensions/offsets use mil and rotation is relative to the pad in degrees.
See [implementation scope and remaining work](docs/current-pcb-pad-details-release-2026-10-15.md).

Published update `0.3.0+codex.20261014213000` adds six optional raw Component metadata
fields to existing PCB `get`/`getAll` reads: designator, name, manufacturer,
manufacturer part, supplier and supplier part. Empty strings and name formulas
are preserved; unavailable values stay omitted. This is loaded-view metadata,
not verified part identity, BOM export, component-pad ownership or writer support.
It also caches immutable dependency-parse results for unchanged upstream bytes;
fresh file hashing and graph validation remain mandatory on every admission.
See [scope and remaining work](docs/current-component-metadata-release-2026-10-14.md).

Published update `0.3.0+codex.20261014201000` adds retained-owner window observation and
one-shot normal application closure to `easyeda_control_launch`. It uses the
original Windows helper and process Job, without foreground input or Computer
Use. It never selects Save/Discard, forces exit or repeats an uncertain close.
The original launch must still be retained in this facade; quarantine remains
enforced. A close acknowledgment is not termination or saved-state proof.
See [scope and remaining checks](docs/current-normal-close-release-2026-10-14.md).

Previous update `0.3.0+codex.20261014190000` adds explicit-ID reads for Line, Arc, Via,
Component and Pad using the current geometry tool. Pass a distinct ID array;
results preserve caller order and any unavailable ID refuses the request.
Whole-family checks and bounds still apply. These are plain loaded-view DTOs,
not complete SDK objects or editing support. Installed180500 independently
passed disposable PCB opening and all four Component/Pad ID and geometry reads.
The new explicit-ID routes still need their own installed live check. See
[scope and backlog](docs/current-pcb-selected-read-release-2026-10-14.md).

Previous update `0.3.0+codex.20261014180500` corrects the disposable opener's
navigation timeout to fit the upstream executor's 60-second maximum. Native
observation expires at 50 seconds and the outer host waits 70 seconds. Timeout
still requires recovery; it is not cancellation or permission to replay.
See the [source investigation](docs/current-project-open-investigation-2026-10-14.md).

Previous update `0.3.0+codex.20261014163000` adds unfiltered Component/Pad IDs and
basic placement/state reads to the current PCB tools. Component libraries,
child mappings and Pad shapes/holes/rules remain omitted with concrete reasons.
These are bounded loaded-view projections, not complete public SDK objects or
writer support. See [scope and backlog](docs/current-pcb-component-pad-release-2026-10-14.md).

Previous update `0.3.0+codex.20261014150000` fixes the disposable opener and current PCB
readers rejecting EasyEDA's ordinary project/tab URL fragments. The opener
accepts only target-bound transitions at its owned navigation boundary; reads
retain exact URL equality. Failed opening now retains bounded phase/stage
diagnostics, and a new orphan-risk phase clears the preceding return timestamp.
No navigation, retry or writer authority is added. See the
[release scope](docs/current-open-diagnostics-release-2026-10-14.md).

Previous update `0.3.0+codex.20261014133000` added bounded native geometry reads for
Line, Arc and Via on the current EasyEDA version. These return loaded-view
geometry, not public SDK objects, saved membership or connectivity proof.
Empty arguments, an exact active PCB target and two matching observations are
required. See [release scope](docs/current-pcb-geometry-release-2026-10-14.md).

Previous update `0.3.0+codex.20261014054500` added five current-version PCB identity
readers: selected IDs, unfiltered Line/Arc/Via IDs, and positive type lookup
within those three families. They describe stable loaded-view observations,
not saved membership or geometry. Local-project context now accepts EasyEDA's
64-hex path hashes. A local-only historical recovery tool exposes the existing
sixteen-event pre-navigation abandonment verifier without enabling legacy
recovery. See [release scope and remaining work](docs/current-pcb-readers-release-2026-10-14.md).

Previous update `0.3.0+codex.20261014033000` added `easyeda_control_project_open` for one registered local
disposable project and existing PCB. It preserves a checkpoint and journals
project/document navigation once. Normal EasyEDA opening can migrate data,
replay caches and automatically Save; this is not the legacy unchanged-storage
workflow. Inspection and observation never repeat navigation. A retained-owner
terminal retirement path handles interrupted calls without claiming a design
outcome. Installed180500 passed one scoped disposable opening; this is not
full initialization or persistence proof. See the
[opening guide](plugins/easyeda-pro-control/skills/easyeda-pro-control/references/current-project-opening.md)
and [release scope](docs/current-disposable-open-release-2026-10-14.md).

Previous update `0.3.0+codex.20261014020500` added `easyeda_control_pcb_layers` for
current-version board layer metadata and copper-layer count. It reads an
explicitly identified active PCB through a retained native receiver, with two
matching samples and exact API/UI/PCB admission. This is a native equivalent,
not execution of the public wrapper, full stackup validation or editing support.
Offline `pcb-layers` and `pcb-layers-validate` expose the request contract.
See the [layer-reader release](docs/current-pcb-layers-release-2026-10-14.md).

Previous update `0.3.0+codex.20261014011500` added explicit `abandon-supervision` recovery
for a successful ordinary launch whose original process handles were lost.
It preserves history and requires the inspected launch digest, explicit risk
acceptance and two absent process samples. It does not prove termination or
unlock design operations. A separately confirmed, new-ID startup remains subject
to all current launch checks. LCSC lookup remains omitted because its installed
server fallback can open and modify a library database during concurrent refresh.
See the
[supervision-recovery release](docs/supervision-recovery-release-2026-10-14.md).

Previous update `0.3.0+codex.20261014002000` added `observe-application` to the ordinary
launcher. After a facade restart it can report same-name process presence for
an existing launch journal, without launching EasyEDA or changing the journal.
It does not recover lost process handles or authorize another launch. See the
[application-presence release](docs/application-presence-release-2026-10-14.md).

Previous update `0.3.0+codex.20261013214500` added `easyeda_control_shortcuts` for the
current-version configured-shortcut registry. It preserves actual key spellings
and scope metadata; it cannot send keys, register callbacks or change settings.
Offline `shortcuts` and `shortcuts-validate` expose its strict request schema.
See the [shortcut reader release](docs/shortcut-reader-release-2026-10-13.md).

Previous update `0.3.0+codex.20261013201500` added `easyeda_control_editor_context` for
identity-only active-document and current-project/branch observations. It reads
bounded native UI metadata, not project contents or the public detailed-project
getter. Missing fields and unsupported tabs remain explicit. It does not enable
navigation or the legacy design routes. See the
[context reader release](docs/current-context-release-2026-10-13.md).

Previous update `0.3.0+codex.20261013193500` added `easyeda_control_launch` for journaled, fixed no-argument
startup in the existing EasyEDA profile, plus `easyeda_control_editor_shell` for
bounded tab counts and registered Start Page flags. Startup can run extensions,
load project lists and change cache/preferences; it is not profile isolation.
Launch, bridge authentication and editor observations are reported separately.
An uncertain launch is never automatically repeated. See the
[ordinary startup release](docs/ordinary-startup-release-2026-10-13.md).

Previous update `0.3.0+codex.20261013182500` added `easyeda_control_extensions`, a fixed
read-only observation of selected metadata in the initialized extension index.
It excludes code, user configuration and account identifiers. The index can lag
an account switch and omits builtin/loaded activation state, so it cannot qualify
automatic startup. See the [extension-index release](docs/extension-index-release-2026-10-13.md)
and [startup research](docs/bootstrap-implementation-research-2026-10-13.md).

The previous `0.3.0+codex.20261013170000` added `easyeda_control_system` with six
mil/mm/inch conversions and twelve environment methods, including the two
version comparators. Strict arguments, signed-zero transport and fixed scalar
projections preserve the reviewed SDK semantics. The sixteen geometry methods
remain under `easyeda_control_calculate`. Installed161000 passed one triangle
area and one nested-square subtraction with a complete hole; these cases do not
validate all methods or this newer source generation.

The older reviewed tuple exposes 41 tools. A configured newer or unknown tuple
exposes sixteen: API reference, local discovery, status, calculations, local
system methods, extension-index/editor-shell/identity-context/shortcut observers,
explicit-target PCB layer/identity/geometry and project-symbol metadata observations, local historical abandonment,
ordinary launch and disposable project opening.
The project-symbol tool also has a separate no-editor-tab preflight: it compares
known metadata in a loaded project and observes bounded UI actor/ticket/clock
data without opening a PCB. Discover `project-symbol-preflight` before use;
success is not permission, backend attribution or writer authority.
The internal mode name remains `calculation-only`. Bridge execution separately
requires exact reviewed EasyEDA 3.2.206 / API 0.3.50 hashes and authentication;
launch instead verifies its installed executable/app/helper identities.
The scoped layer/identity/geometry readers and disposable opener can access a board on the new
version. Generic project-content readers, navigation and design writers remain unavailable.
Seven skills remain included. See the
[system-method release](docs/system-release-2026-10-13.md) for limits and backlog.

When a trusted machine profile selects missing or invalid external
installation files, startup instead exposes three offline-only tools: API
reference with existing managed-checkpoint preparation, local discovery and bounded startup status. Live execution and
recovery are unavailable in that process, even if the files are later repaired.
See the [upgrade-resilient startup report](docs/offline-startup-release-2026-10-13.md).

The preceding release `0.3.0+codex.20261013113000` has 28 tools and seven skills.
See the [scoped release report](docs/scoped-release-2026-10-13.md) for verification,
publication, installation and the implementation backlog. The ordinary
`easyeda_control_symbol_metadata` entry is implemented but refuses before runtime
allocation until disposable full-lifecycle validation succeeds. It accepts one
explicit name/description operation with a unique caller ID and exact closed
symbol/project identity. Its operation-intent reservation is separate from the
validation-only permanent target claim. It does not enable the old library
executor or other metadata/geometry writers.

`easyeda_control_validate_closed_symbol` is a one-attempt, approval-required
disposable validation route, not a general editing endpoint. The compiled helper
and v3 transport pass a standalone Windows smoke run, including process cleanup.
The latest disposable run passed baseline closure and native reference checks,
then stopped after a successful startup-marker read, before navigation or editing.
Its closed fixture is unchanged. This release corrects the expected Node version
format (`v24.18.0`, matching the upstream health response), adds bounded failure
diagnostics and admits evidence-preserving abandonment of that exact pre-navigation
boundary. It does not retry the operation or enable the writer. Earlier fixes
cover native 16-hex document IDs, duplicate structure rows, transport confirmation
and tooltip-aware application-window selection. The
[connected ledger](docs/api-connected-validation-ledger.md) records the evidence
and limitations of each case. Full closed-symbol lifecycle validation remains
unfinished.
Start a fresh Codex host after updating.
`easyeda_control_api` exposes 93 reviewed
namespaces / 749 declared signatures and 99 latest official namespaces / 806
signatures. Its `coverage` action inventories all 774 distinct mounted method
paths, linking each to a direct public call, narrower native task equivalent,
internal lifecycle use, or a concrete omission reason and required work.
Current source classifications are 212 public subsets, 30 native equivalents,
no lifecycle-only methods, 81 implemented-but-blocked methods and 451
omissions. Their execution routes comprise 336 available with runtime guards,
94 blocked and two partially blocked. Method and route counts differ;
neither is a live-validated-method count.
The [030626 release record](docs/api-coverage-030626-release-2026-10-12.md)
describes the earlier containment changes. The [preceding054207 candidate](docs/api-coverage-054207-release-2026-10-13.md)
packages the native-helper and disposable-workflow implementation.
The [completion report](docs/project-structure-save-completion-2026-10-12.md)
tracks native lifecycle work. Remaining adapters are an implementation backlog,
not merely missing tests and not a claim that the native APIs are impossible.
The scoped release does not complete every feasible SDK method.
The030626 release introduced the Unicode evidence-reader
fixes from024750 and blocks eight metadata-writing routes plus schematic-page,
symbol and PCB design transactions whose delayed native structure-table effects
lack a complete lifecycle proof. Footprint transactions retain their own guards.
Candidate024750 passed CI but was not installed after this gap was found.
Two new disposable wire commits on installed013324 passed saved/reopened
source, connectivity and full-project checks, recorded as
[C06/C07](docs/api-connected-validation-ledger.md#2026-10-12-c06-final-wire-observation-retained-on-013324).
Those results do not validate the newer parser build. Flat transactions retain their final raw
connectivity observation in a separate bounded artifact, without adding reads
or changing Save/recovery authority. It does not replace durable proof or
retroactively fill gaps in historical journals.
Offline discovery includes nine indexed
historical reader cases with exact generation, argument scope, evidence and
exclusions. These records neither grant execution authority nor validate the
whole method or current package generation.
`sdk-reads` and `sdk-validate` expose the exact schemas and offline argument
checks for the fixed `easyeda_control_sdk_read` allowlist. That separate live
tool performs local getters, fixed primitive-state projections and bounded pure
calculations with authenticated context checks and two matching samples. Three
explicitly classified native equivalents read standalone Text IDs and Wire/Bus group IDs
without the public callbacks or compiler; only the active ordinary page and
empty arguments are supported. A separate native equivalent collects all direct
component attribute names, including inherited attributes, drawing frames and
flags, with complete bounded model membership checks. An ordinary project-symbol
Pin equivalent independently proves membership and matches all twelve explicit
getter fields; custom attributes and multipart symbols refuse. Native Text
`get/getAll` return bounded root-Text state with native coordinates and nullable
styles, not public-getter parity. Wire/Bus `get/getAll` preserve every line's native
geometry/style and all literal names instead of flattening them to one style/net.
Two mixed schematic ID readers return these same Text/Wire/Bus DTOs from one
complete page-bound capture. Singular lookup returns one DTO; plural lookup
preserves caller order. Missing, unsupported or wrong-owner IDs refuse the whole
call. They do not return SDK instances or every primitive family. Installed204104
passed both selectors for one root Text and one populated Wire, including both
orders of a two-item selection, with unchanged native and saved-checkpoint
evidence. Bus, invalid selectors and later generations remain separate cases.
Complete-family bounds apply before selection.
Filtered PCB net membership derives identity records from complete requested-family
source/inventory agreement, with explicit standalone/component pad roles.
Native PCB type lookup classifies an existing ID only after complete all-five-family
source/inventory agreement, including unassigned objects. Missing or unsupported
IDs refuse rather than reporting false absence. The native active-layer reader
matches the native document source's selected layer to the complete public layer list.
It preserves raw color strings, including malformed values returned by EasyEDA.
The selected PCB object equivalent preserves exact selection order and returns
complete native-source records for supported root objects. It refuses unsupported
or generated selections instead of returning a partial array; public primitive
instances and persistence are not claimed. Two explicit-ID equivalents use the
same source DTOs without reading or changing selection. Missing or unsupported
IDs refuse the whole call. Installed20261011150000 passed empty selection and one
original standalone STRING. Installed164600 subsequently passed singular and
one-element plural explicit-ID reads of one standalone STRING with no direct
attributes, matching the complete baseline and independently verified receipts.
Other families, multi-ID ordering and later source changes remain separate.
The fixed read catalog has 182 routes, including 21 native equivalents and
bounded polygon splitting that preserves input source arrays and their order. It
accepts no arbitrary method path, caller code, callbacks, navigation or writes.
The new `lib_LibrariesList.getSystemLibraryUuid` route returns only a nonmissing
32-character lowercase-hex identity, with no account/library enumeration.
Installed204104 passed one exact disposable read. The native
`sys_FontManager.getFontsList` equivalent reads only bounded configured titles,
preserving order and duplicates while refusing missing or malformed settings.
It never invokes the public wrapper's false-empty fallback or changes preferences.
It does not establish current-account identity, OS font installation or rendering.
Installed220050 passed one ordinary schematic case with unchanged complete
native/source/checkpoint evidence; other document types and later generations
remain separate cases.
None of these observations replaces complete design or persistence proof.

The deprecated schematic selection getter now has an explicit replacement
adapter. It uses the documented modern getter under ordinary-page checks and
never calls the obsolete iframe path that can silently report no selection.
Returned wire-segment selections retain the replacement's parent-group IDs.

Installed `071500` passed scoped disposable checks for active Top Layer,
ComponentPad/Via net membership and one selected ordinary component, preserving
complete native and saved-project state. These cases do not validate other
primitive families or admit a later facade build.

The inventory also maps the existing visible-canvas image and region-zoom
workflows. Capture rechecks the complete runtime fingerprint before accepting
managed PNG evidence. This is viewport evidence, not design-state or visual
acceptance. Project-open failures now retain fixed diagnostic categories through
recovery without storing raw private error messages or repeating navigation.

Latest declarations are not runtime admission. Exact operation schemas cover
108 design actions and 68 library/lifecycle actions; schema availability does
not guarantee execution support. The [coverage inventory](docs/api-coverage-inventory-2026-10-10.md)
and [feasibility review](docs/api-execution-feasibility-2026-10-10.md) name the
remaining work. Closed symbol/page metadata, empty-page and empty-symbol creation,
and PCB/schematic-container creation/rename currently refuse execution pending
operation-owned structure-job completion and exact SQL-effect proof. Their
schemas and document-effect implementations remain available for offline review.
Schematic-page, symbol and PCB geometry Save can schedule that same structure
job, so those design transaction routes are blocked too. Historical tests retain
their document and checkpoint scope, not proof of native job completion.
Existing-tab activation and inactive clean-tab close retain separate tracked
paths. Their scopes and remaining connected acceptance are explicit; a public
acknowledgment alone never completes a lifecycle operation. A separate closed
PCB/schematic-container rename implementation requires one other clean PCB, complete
checkpoint invariants and independent DOM checks. It preserves the original
acknowledgment through recovery and performs no Save. Installed120000 passed
forward/reverse PCB and schematic-container rename and one free-PCB creation;
those results do not prove the newly identified structure-table lifecycle or
admit a later generation. Creation and container rename preserve every raw per-document history
occurrence. Closed free-PCB creation requires an absent board name and creates
only META, with no canvas initialization, open, Save or automatic inverse.
A separate free-schematic route creates only a closed META container, with no
page, template, canvas or Save. Standalone PCB text retains bounded modify,
create and delete contracts, currently blocked. Installed131000 passed forward/reverse modification, but its
v1 creation exposed a cached null-to-black reload.
New v2 creation fixes explicit black; creation-only retained-Save recovery proves
the original storage and observed reload separately without another Save.
Installed20261011150000 completed that retained-Save recovery with full unchanged peer
history and exact original storage/reload proof, without another Save or edit.
Installed164600 then passed separate explicit-black v2 creation and deletion,
each with exactly one acknowledged Save/close/reopen and complete 11-document
proof. Deletion restored the original source, not history or database bytes.
One closed free-schematic creation also passed: 11 existing documents remained
exact and the only addition was DOCHEAD/META, with no page, template, editor open
or Save. These are fixed disposable cases, not whole-method or later-generation
admission. Exact generation bindings, argument domains and evidence commitments
are in the append-only [connected validation ledger](docs/api-connected-validation-ledger.md).
The earlier [candidate20261011150000 report](docs/api-coverage-150000-release-2026-10-11.md)
retains its historical status. The
[remaining-effects review](docs/api-remaining-method-effects-2026-10-11.md)
records blockers for layer selection, page ordering, pad-pair groups and broader
PCB text cases. A separate checkpoint-bound flat-topology
diagnostic avoids the mutating netlist exporter. A separate sealed single-page
profile describes only existing stored attribute/text display patches, with exact
inverse, endpoint and whole-project persistence checks. It does not re-enable
electrical edits or historical compiled transactions; the structure-job
restriction now also blocks this sealed profile. Imported library atom provenance has a separate
sealed v2 profile: unchanged SYMBOL/FOOTPRINT peers retain every header occurrence,
raw encoding and tombstone across the lifecycle. Default parsing and legacy v1
remain strict. See the [imported-library contract](docs/native-library-import-history-2026-10-11.md)
and [release evidence](docs/imported-library-peers-release-2026-10-11.md).
Installed `083400` passed imported-project opening, nonempty native flat topology
and forward/reverse stored Designator-coordinate transactions through Save and reopen. The
complete 12-document fixture proof retained imported headers and both pin nets.
See the [scoped fixture evidence](docs/api-coverage-083400-fixture-validation-2026-10-11.md).
The reverse restored the original source exactly. Unsaved rollback and the newer
source generation remain separate validation.
A separate [sealed wire profile](docs/flat-wire-reroute-2026-10-11.md) retains a blocked source contract for
endpoint-only rerouting with existing LINE identities, unchanged styles/names,
full contact-incidence proof and an exact inverse only while the durable baseline
is unchanged. Installed220050 passed one three-segment forward/reverse pair,
each through Save/reopen with complete 12-document collateral proof. Original
source geometry was restored, not original database history. Unsaved rollback,
other shapes and later generations remain separate; the generic compiled route
stays blocked. See the [connected case report](docs/api-coverage-220050-fixture-validation-2026-10-12.md).

Source review found that PCB/footprint opening, activation and some active-tab
closes can write shared local preferences and prune backups under EasyEDA's
retention setting. Project opening may restore PCB tabs even for a schematic
target. No past pruning or remote upload is established. Passive admission must
precede navigation and Save/reopen; native UI is not a bypass, and this plugin
does not change preferences to pass. See the skill's
[navigation limits](plugins/easyeda-pro-control/skills/easyeda-pro-control/references/native-ui.md#navigation-preference-side-effects).
The `202803` disposable text edit reached the intended
state but stopped before Save on a raw source-format comparison defect. Installed
`210100` recovered that journal after one inverse and delayed native persistence,
with complete nine-document restoration proof and no Save. This does not validate
an immediate inverse. A separate `210100` single-text transaction passed Save,
close, reopen and complete saved-project verification. Installed `223200` also
passed both native Text-state readers and one stored frame-attribute display
edit with complete nine-document saved proof and one Save/close/reopen. These
older fixtures contain no electrical parts. The new source still needs its own
connected admission and new read-route checks.
Native discovery handles minimized windows, and
bounded recovery-history caches preserve fresh content verification.
Offline tests do not establish connected validation for this release.
The [lifecycle continuation](docs/api-coverage-lifecycle-continuation-2026-10-10.md)
records disposable refusal recovery and the latest guarded adapters.
See the [API research](docs/easyeda-extension-interface-research-2026-10-10.md)
and [reliability review](docs/revamp-reliability-review-2026-10-10.md).
The [independent review follow-up](docs/revamp-final-review-2026-10-10.md)
also covers descriptor-bound Node launch, timeout-envelope classification and
bounded upload-barrier diagnostics.

## Skills by task

| Skill | Use |
|---|---|
| [easyeda-pro-control](plugins/easyeda-pro-control/skills/easyeda-pro-control/SKILL.md) | Live setup, exact inspection, typed editing, dialogs and recovery |
| [easyeda-schematic-design](plugins/easyeda-pro-control/skills/easyeda-schematic-design/SKILL.md) | Circuit definition, readable sheets, connectivity and ERC |
| [easyeda-pcb-layout](plugins/easyeda-pro-control/skills/easyeda-pcb-layout/SKILL.md) | Stackup, placement, power/return paths, routing and DRC |
| [easyeda-component-library](plugins/easyeda-pro-control/skills/easyeda-component-library/SKILL.md) | Symbols, footprints, terminal mapping and device/model associations |
| [easyeda-manufacturing-release](plugins/easyeda-pro-control/skills/easyeda-manufacturing-release/SKILL.md) | Fabrication/assembly exports and independently inspected release evidence |
| [electronics-design-review](plugins/easyeda-pro-control/skills/electronics-design-review/SKILL.md) | Evidence-backed electrical, layout, library and manufacturing review |
| [easyeda-extension-development](plugins/easyeda-pro-control/skills/easyeda-extension-development/SKILL.md) | Pro SDK research, narrow adapter implementation and compatibility validation |

The design skills include task-specific checklists, detailed references and
dated primary-source research. They distinguish electrical design judgment from
editor control and do not authorize purchases, uploads or live edits. Historical
live coverage is recorded in the [capability matrix](plugins/easyeda-pro-control/skills/easyeda-pro-control/references/capability-matrix.md);
new offline regression tests are not new live editor validation. Completed
historical operations must never be replayed. No design is fabrication-approved
merely because it passed ERC/DRC or exported successfully.

## Architecture

```text
Codex skill
    │
    ▼
easyeda-pro-control safety facade ───► durable journals, evidence, checkpoints
    │                         │
    │                         └── HMAC gateway ◄──► private EasyEDA extension ◄──► EasyEDA Pro
    ▼
native descriptor sanitizer
    │
    ▼
Bubblewrap + Node permission boundary
    │
    ▼
descriptor-mounted reviewed easyeda-mcp-pro module graph
```

The facade is the sole bridge owner. It does not execute the mutable upstream
checkout directly: it captures and hashes the statically reachable module
graph, mounts that graph and the reviewed supervisor from retained descriptors,
and starts the pinned upstream in a minimal sandbox. Do not run a second
EasyEDA MCP process against the same bridge.

For authorized EasyEDA work when the host does not expose MCP tools,
`scripts/control-session.ts` provides a persistent foreground client for the
same facade. Run this developer CLI from a trusted checkout after `npm ci`
with the pinned toolchain; it is not a dependency-free installed runtime.
`--plugin-root` may select a Git-installed plugin. It uses that plugin's `.mcp.json`, checks its reviewed
bundle, and retains the normal single-owner lease. Use a normal pipe or a
noncanonical PTY so terminal input does not truncate fingerprint requests. See
the skill's [connection reference](plugins/easyeda-pro-control/skills/easyeda-pro-control/references/connection-and-context.md#foreground-mcp-session)
for terminal setup and the JSON-line protocol. `easyeda_control_native_ui` wraps
the packaged native Windows helpers, bound to the installed executable digest,
process generation and current owned window. It works on Start Page and native
dialogs without an authenticated bridge. Native edits still require independent
saved-and-reopened verification and do not grant retained Job authority.

The native Linux x86_64 sanitizer closes the descriptor-inheritance gap between
Node and Bubblewrap. The facade gives it the expected facade PID and exactly
this descriptor layout: MCP stdin/stdout/stderr on `0`–`2`, the data directory
on `3`, module graph on `4`, supervisor on `5`, Bubblewrap status pipe on `6`,
reviewed Node executable on `7`, startup block pipe on `8`, seccomp program on
`9`, and the already hash-admitted Bubblewrap executable on `10`. The sanitizer
requires every descriptor `0`–`10` to be present without `FD_CLOEXEC`, binds its
lifetime to the unchanged expected parent with `PR_SET_PDEATHSIG(SIGKILL)`, and
requires descriptor `10` to be a regular mode-`0755` file with no
`security.capability` xattr. It then marks `10` close-on-exec, atomically closes
all descriptors `11` and above with `close_range(2)`, and enters Bubblewrap from
descriptor `10` with `execveat(2)`. Bubblewrap receives only descriptors `0`–`9`;
an arbitrary descriptor inherited by the facade's shell cannot reach it.

## Implemented capabilities

Current type-1/2/3 transaction execution is blocked by the structure-job
completion gap described above. Footprint and unrelated routes retain their
own guards; the historical writer results below are not exceptions.

The live evidence in this section is historical and operation-specific. The
separately recorded 164600 cases above do not transfer these older results to
that generation or admit later source changes.

The October API audit found hidden annotation and Save All in the previously
used schematic netlist path. Current code refuses `schematic-topology` and
dependent schematic transactions before dispatch. It also refuses schematic
netlist/BOM/document and PCB netlist/BOM/PDF exports that can save dirty tabs,
plus simulation export outside its required NGSPICE editor. Historical matching
outputs did not establish read-only execution. See the
[source-backed safety review](docs/api-coverage-review-2026-10-10.md).

The current tuple is connected-read-admitted following authenticated status,
PCB and schematic public-read smoke tests against an independently decoded,
saved disposable project, plus installed-source review. Exact reads require
that complete pinned tuple on every call; later mismatches remain fail-closed.
Admission does not claim every reader variant or typed writer has passed a live test.

Historical live validation included schematic components and compiled topology. The
in-memory `getNetlistFile` topology route returned the four expected fixture
endpoints in two identical samples. Revised PCB component and inventory readers
also passed with two components, four direct pads and one outline; all four
pad-parent correlations and expected net endpoints matched, and evidence receipt
verification passed. The lossless PCB rules recheck also passed with equal
samples and no placeholders. Exact results use a
bounded, shallow JSON envelope so the bridge cannot replace nested rule data
with depth-limit markers; earlier placeholder-bearing rule results are invalid
as complete evidence.

- Exact double-sampled schematic component reads. Compiled topology is currently disabled for the hidden-Save reason above.
- Exact PCB component, direct-pad, primitive-inventory, net, rule, class, differential-pair, and equal-length-group reads.
- Conservative generic reads with project, document, editor-type, and tab binding.
- SQLite online checkpoints with `quick_check`, logical database comparison, and self-hashed receipts.
- Full-page and viewport image requests with PNG signature, chunk, CRC, zlib, scanline, geometry, and payload/image binding checks. These do not prove target paint completion or page completeness; inspect the returned image.
- Draft PCB DSN route-context export with descriptor-bound exclusive artifact creation, inode/hash-bound receipts, and hash-bound failure evidence.
- Durable ambiguous-call recovery with one-use nonce challenges and a global bridge quarantine.
- Typed PCB and schematic transactions with exact source effects, scoped durable baselines and explicit commit or verified inverse.
- PCB batches of up to 256 sequential typed effects, journaled created-ID references and locked-part preservation. Pure geometry uses one source merge; batches containing supported rules use ordered source-bound public writer steps. Stack and copper rebuild are separate operations.
- Supported project-library footprint edits, DEVICE creation and association changes, existing external model binding, device-default model transforms, and bounded file exports through an explicit capability catalog.
- Process-bound native window discovery, inspection, confirmed input and normal close without automatic save/discard choices.

DEVICE creation binds existing project symbols and footprints without importing assets. Association editing preserves other device metadata and refuses implicit inherited binding changes. Device-default transform edits instead require the exact acknowledged inheriting instances and preserve all stored placement records. Existing 3D model assignment uses exact external identities and stable metadata reads. These source capabilities have separate live-validation status; see the [library workflow](plugins/easyeda-pro-control/skills/easyeda-pro-control/references/libraries-and-eco.md).

Live evidence includes the five exact reader kinds; PCB component movement with save/reopen/inverse; schematic property restoration, a PCB batch and copper clear with saved/reopened full-project proof; recovered copper rebuild without repeating Save; itemized ERC/DRC; route centerline/width reporting; and a managed schematic netlist export. Earlier line creation/inverse had live-only proof, and footprint-library creation had durable addition proof without reopen. After its initial persistence failure, the repaired stack and a net-class edit passed save/reopen with all 14 fixture documents checked. DEVICE creation, reassignment and inherited-model transform passed complete durable proofs. Symbol geometry subsequently passed save/reopen with a separately proved prior transaction's delayed inverse, explicitly reported as `isolatedTransaction:false`; it is not an unchanged-collateral claim. A footprint LINE then passed save/reopen and complete 14-document proof. Remaining geometry paths need their own live checks. See the [capability matrix](plugins/easyeda-pro-control/skills/easyeda-pro-control/references/capability-matrix.md) for exact phases and limits. ECO remains a native dialog workflow. Unsupported operations, arbitrary code, database restore and fabrication submission are not enabled. This is not a production-live build approval for a user's design.

The installed package's PAD test initially saved successfully but failed library reopen. Retained recovery subsequently completed the original transaction as `saved:true,reopened:true`, with exact live and complete 14-document durable proof. Neither the original edit nor Save was repeated. A recovery target-open readback had separately failed before the exact target was confirmed read-only; that navigation result is not reclassified as success.

For startup trouble, use `easyeda_control_discover` in its default local mode.
It works without starting the upstream and marks each catalog entry with its
admitted facade route or `unavailable`. Upstream annotations are not permission
to call a tool. Request `source: "live", includeSchemas: true` for current
argument schemas only after startup succeeds. Startup errors report a fixed
launch stage and observed exit status while keeping private diagnostic text
withheld. The skill's connection reference distinguishes host dispatch failure,
upstream startup failure, an unauthenticated extension, and compatibility drift.
Runtime diagnostics retain fixed protocol/exit codes and exact-reader field/stage
categories without exposing native error text. The reviewed logger writes
synchronously to stderr, keeping warnings and errors out of JSON-RPC stdout.

## Install from this GitHub marketplace

The Codex marketplace manifest is [`.agents/plugins/marketplace.json`](.agents/plugins/marketplace.json).

These commands install the published GitHub snapshot. Check its plugin version
and actual tool catalog; an older cached snapshot can differ from this checkout.

```bash
codex plugin marketplace add https://github.com/jan-guenter/easyeda-pro-agent-plugin
codex plugin add easyeda-pro-control@easyeda-pro-agent
```

Start a new Codex task after installation so the skill and MCP catalog are loaded from the new marketplace snapshot.

Marketplace installation does not create a credential or modify EasyEDA. From
a trusted checkout of this repository, provision the owner-only bridge token
and build the matching private extension:

```bash
cd plugins/easyeda-pro-control
ulimit -c 0
test "$(ulimit -c)" = "0"
test "$(node --version)" = "v24.18.0"
test "$(npm --version)" = "11.16.0"
npm ci
npm ls --all
npm audit signatures
npm audit --audit-level=moderate
npm run bridge:provision
npm run bridge:build
```

`npm run bridge:provision` creates `$HOME/.easyeda-pro-control/bridge-token` as an
owner-only, single-link file and never prints the key. It creates the immediate control directory
as mode `0700` when missing. If that directory already exists, it must be owned
by the current user and already be mode `0700`; provisioning fails with a
remediation message and never changes a pre-existing directory's permissions.
`npm run bridge:build` embeds that HMAC key in a private, content-addressed
`.eext` generation and atomically commits a non-secret receipt under the
owner-only `$HOME/.easyeda-pro-control/bridge-build/` directory, outside the
repository. Import the exact generation path reported as `outputPath`; do not
select an archive by wildcard. The fixed
`easyeda-pro-control-authenticated-bridge.eext.receipt.json` receipt is the
authoritative current-generation pointer, so an interrupted rebuild leaves the
prior generation authoritative. An explicit `--output` value is a logical base
name for that fixed receipt, not the final archive name, and must end in `.eext`.
Use the bare default command for the facade-loaded production build: the current
facade admits only the fixed default receipt. Alternate bases are for isolated
build verification. The builder double-samples the reviewed source identities
and metadata, descriptor-reads the stable files directly into a hash-verified
memory snapshot, and gives esbuild and the archive packager only that snapshot.
It creates no mutable source-staging tree, and neither consumer rereads source
paths after capture.

The archive and receipt commit is serialized by an owner-only hard-link lock
named `.<output-base>.archive-receipt.lock` in the private build directory. Its
versioned record binds the Linux boot ID, PID-namespace identity, PID, process
start time, and a random nonce. A live matching owner makes contenders wait.
A dead, legacy, malformed, cross-boot, or cross-PID-namespace owner is
unverifiable: the builder fails closed and never removes the lock, because a
pathname check followed by unlink cannot safely act as compare-and-swap. A
crash before lock publication can also leave a one-link
`..<output-base>.archive-receipt.lock.<nonce>.candidate`. The builder never
deletes another contender's lock candidate; successful builds and the offline
doctor report exact candidate names observed in a read-only snapshot. An
observed name may belong to a live contender and may disappear immediately.

Manual lock recovery requires global quiescence. Stop every bridge builder in
every relevant PID namespace, then re-prove that the private build directory is
owned by the current user, mode `0700`, and still has the expected device and
inode. Never use a wildcard. For a one-link fixed lock, recheck its exact
device/inode, owner, regular-file type, and mode `0600`, then unlink only that
path. For a two-link lock, derive the exact candidate from the recorded nonce,
prove both names are the same reported inode with two links, unlink the
candidate first, recheck that the fixed lock is still that inode with one link,
then unlink the fixed lock. Treat an observed candidate without a fixed lock as
live until every builder is stopped; only then recheck that exact non-symlink,
owner-only, one-link regular file before unlinking it. If any identity, link
count, ownership, mode, or process proof differs, stop and investigate. Run the
build again after recovery; never delete a lock whose recorded owner is live.

The build rejects output inside the
plugin checkout, outside the reserved `bridge-build` subtree when it is under
the control-data directory, or overlapping the token path. An external output
directory is allowed only when an existing directory is already owner-only;
the builder may create a missing immediate parent as mode `0700`, but it never
creates missing ancestors. A crash or replacement can leave an unreferenced
immutable generation. It is still a credential: remove it only after confirming
that the fixed receipt does not select it and that no EasyEDA import still needs
it. The extension and facade authenticate each other with fresh nonces;
the HMAC key never crosses the extension-facing loopback socket. Only after the
supervisor readiness and sandbox-admission proofs does the facade frame a fresh
backend-session token on the child's stdin. The child assigns that ephemeral
token to `process.env.BRIDGE_TOKEN` for upstream compatibility; it is absent
from the launch argv and base environment and is never sent to EasyEDA. Treat
both the long-lived token and generated `.eext` as credentials. In
EasyEDA Pro, import the `.eext` through **Advanced > Extension Manager >
Import**. A build receipt proves the local artifact and reviewed source closure,
not that EasyEDA imported or loaded it; the first authenticated status call is
the live proof. Do not use the unauthenticated stock bridge with this facade, do
not commit the token or generated extension, and rebuild/reimport the extension
after rotating the token. The machine profile derives the token path inside its
control directory. Provisioning and bridge building must use that same location;
do not put credentials or workstation paths in the portable `.mcp.json`.

The fixed receipt names private dispatcher build `ded07x99dcxb504`, now
connected-read-admitted on EasyEDA Pro `3.2.149.88089769` with bridge protocol
`1.0.0`. It supersedes historical dispatcher `d18b6xd531xe6ca` for current read
admission. The health result reports the authenticated handshake's application
version; the separate bridge-status getter omits its optional application
version, pinned explicitly as `bridgeEasyedaVersion: null`. No version is copied
between those sources. A future `validation-required` tuple permits only the
bounded public validation workflow until reviewed. Never infer compatibility
from a build receipt or import alone.

## Runtime prerequisites

This compatibility release is pinned to the local integration tuple recorded in [`reviewed-compatibility.json`](plugins/easyeda-pro-control/reviewed-compatibility.json):

The supported editing/runtime profile is Linux x86_64 under WSL controlling the pinned Windows EasyEDA Pro desktop installation. Windows interop and Windows PowerShell must work, and the EasyEDA assets must be reachable through a canonical `/mnt/<drive>/.../resources/app/assets` path. The packaged helper uses a mounted path or a `\\wsl.localhost` path derived from `WSL_DISTRO_NAME`. Native Linux or macOS EasyEDA and a browser-only editor are not covered by the retained Windows Job profile. Linux facade support alone does not establish editing support on those hosts.

- Linux x86_64 on Linux 5.9 or newer. The sanitizer requires working
  `close_range(2)` and `execveat(2)`, and the filesystem holding Bubblewrap must
  expose a readable `security.capability` xattr namespace whose absent-attribute
  result is `ENODATA`. An unavailable syscall, unreadable/unsupported xattr, or
  present capability xattr fails closed.
- The committed static descriptor sanitizer must be the regular, single-link,
  mode-`0755` file named by
  [`descriptor-sanitizer-identity.ts`](plugins/easyeda-pro-control/server/src/descriptor-sanitizer-identity.ts).
  The current constants pin schema
  `easyeda-pro-control.descriptor-sanitizer.v1`, 1,440 bytes, and SHA-256
  `a8b52e8439bdb479a5621052ab03e9030d67b7948c6e2cc448ee5d7bb1dc9b41`.
  Runtime and compatibility admission reject any other identity.
- Node.js exactly `24.18.0`, the reviewed Node executable
  identity recorded in the compatibility manifest, and a soft `RLIMIT_CORE` of exactly `0`.
  The runtime's executable hash and complete file-
  descriptor baseline are exact compatibility inputs, not generic Node 24.x
  support.
- Bubblewrap exactly `0.13.1` at `/usr/sbin/bwrap`, as a root-owned,
  non-symlink, non-setuid/non-setgid mode-`0755` executable. The reviewed local
  SHA-256 is recorded in the compatibility manifest. Ubuntu 24.04's older
  distribution build does not implement the descriptor-mount options this
  sandbox requires; install or build the reviewed version rather than weakening
  the launch policy.
  CI builds the immutable upstream revision with kernel fallbacks enabled.
  The reviewed local Arch package assumes Linux 6.18 or newer; its binary pin
  does not establish support on older kernels. See the
  [upgrade review and execution scope](docs/bubblewrap-admission-research-2026-10-15.md).
- EasyEDA Pro `3.2.149.88089769`
- PCB editor bundle `3.2.149.5378b690`
- public API bundle `0.2.53.aee2f57a`
- external `easyeda-mcp-pro` server `1.0.0-rc.1`
- authenticated bridge derivative reviewed against upstream commit `964c05082f1c7c9e8b98f56e967e36bfc3f26128`: distinct private package, UUID, menu, socket, and repository identity; fixed extension-facing gateway at `127.0.0.1:49621`; nonce-bound mutual HMAC authentication; exact private-build-receipt/index-bundle/key-epoch admission with fail-closed stale-runtime cleanup; a 2 KiB parser limit and bounded pending clients before authentication; absent-or-exact-native `https://client` Origin admission (never an authentication substitute); and no adjacent-port or raw/browser transport fallback or raw-secret transmission (extension manifest `0.3.0`)
- Node's built-in SQLite support plus a reviewed absolute `sqlite3` binary at `/usr/bin/sqlite3` or `/usr/local/bin/sqlite3` for deterministic logical dumps; `PATH` is never used to select it

The checked-in [`.mcp.json`](plugins/easyeda-pro-control/.mcp.json) runs `node server/dist/server.mjs --machine-launch` with an empty environment map. This bundled launcher needs no plugin `node_modules`; it loads the private machine profile, verifies its Node/install identities and starts the sole facade. `scripts/launch-machine.ts` remains a developer wrapper requiring the trusted checkout's pinned dependencies. Create a profile with `node scripts/configure-machine.ts --upstream-root /absolute/upstream --assets-root /mnt/drive/path/resources/app/assets` from that prepared checkout's plugin directory. Optional `--node`, `--control-dir`, `--pcb-version` and `--api-version` select explicit installation values. The default profile is `~/.easyeda-pro-control/machine-profile.json`; `EASYEDA_MACHINE_PROFILE` selects another existing private profile. Configuration finds paths and versions, not compatibility admission. A different tuple still needs deliberate review.

The external upstream checkout must already contain its reviewed built `dist/index.js` and dependency tree. Configuration does not fetch, install or rebuild it. The same version label is insufficient: the runtime checks the pinned module graph and executable identities.

Missing or invalid external installation files now select a restricted
offline-only process. It retains the same sole-owner lease and exact Node/profile
trust checks but never constructs an upstream client or native controller.
`easyeda_control_status` reports a fixed `machine-installation-*` code without
private paths or raw errors. Local API catalogs describe bundled references,
not the currently installed application. An unsafe profile or unverified Node
still prevents startup. Configuration reuse and the offline doctor remain strict.
After repairing and reviewing the installation, restart the MCP session; do not
change compatibility pins merely to suppress the failure. The currently observed
EasyEDA update is [inventoried separately](docs/easyeda-3.2.206-upgrade-inventory-2026-10-13.md)
and is not yet admitted.

Reuse a profile with `node scripts/configure-machine.ts` or `node scripts/configure-machine.ts --profile /absolute/control/machine-profile.json`, without configuration overrides. Overrides against an existing profile are refused. For another supported installation, create a fresh explicit profile path inside its owner-only control directory. Do not overwrite an active profile or change directories to evade the sole-owner lease or quarantine.

`EASYEDA_MACHINE_PROFILE` selects the profile for the launcher. The provisioning/build CLIs do not read that profile. With a nondefault control directory, set `EASYEDA_CONTROL_DATA_DIR` to that same directory for both `bridge:provision` and `bridge:build`; otherwise they select the default token and receipt locations. Do not rotate an existing key merely to correct a path mismatch.

## First live use

On the current3.2.206 runtime, use the separately guarded
[ordinary metadata workflow](plugins/easyeda-pro-control/skills/easyeda-pro-control/references/current-project-opening.md#ordinary-forward-only-symbol-metadata)
or the explicitly disposable validation workflow in that guide. The sequence
below is for the older legacy-reviewed tuple; its tools are not registered for
general design work on the current runtime.

Before connecting, use `easyeda_control_api` to inspect exact operation schemas
and validate the planned arguments offline. See the skill's [API reference](plugins/easyeda-pro-control/skills/easyeda-pro-control/references/api-reference.md).

1. Inspect `easyeda_control_runtime` status. For API editing, launch a contained instance. If EasyEDA was started separately, use `easyeda_control_native_ui` discover, retain the observed binding, inspect current windows, and request a confirmed normal close before `launch-contained`. Do not discard or save unrelated work at a prompt.
2. Ask Codex to use `$easyeda-pro-control` and call `easyeda_control_status` on Start Page; require the imported private bridge to authenticate rather than treating its import dialog or build receipt as connection proof.
3. Open a saved target with `easyeda_control_runtime`, `request.action:"open-existing"`, observed `projectUuid`, `projectPath`, `documentUuid`, `documentType:1|3`, the current `expectedFingerprint`, and `confirmOpen:true`. It checks checkpoint/registry membership, exclusive tabs and the complete saved database unchanged. It does not create, replace, save or discard. See the [connection reference](plugins/easyeda-pro-control/skills/easyeda-pro-control/references/connection-and-context.md#legacy-existing-project-open-from-start-page) for recovery; an unfinished transaction uses its own recovery path.
4. Use `easyeda_control_context` to prove the current project path/UUID and
   document UUID/type/tab.
5. For the admitted tuple, use `easyeda_control_exact_read` with the current
   context and fingerprint when complete supported fields are needed. Keep the
   active tab unchanged throughout the call. A future mismatch returns to the
   bounded public validation workflow; do not refresh the manifest to make it pass.
6. Use `easyeda_control_design` execute with a typed operation for one request that applies, verifies, saves and reopens. Use apply separately when an unsaved review or inverse is needed, followed by explicit commit. Both paths use the same whole-project record-delta proof. Inspect and reconcile an uncertain operation before proceeding; never repeat it blindly. Read the [transaction reference](plugins/easyeda-pro-control/skills/easyeda-pro-control/references/safety-state-machine.md) for rollback and recovery limits.

If any call reports bridge quarantine, use `easyeda_control_recover_incomplete` with no operation ID. Do not bypass, delete, or rewrite the journal: a delayed call may still be running.

Live context, read, capture, export, checkpoint, mutation, and recovery calls are bound to one exact authenticated renderer session through final evidence publication. A reconnect cannot substitute a new renderer with matching logical IDs. Status alone retains a disconnected read-only bootstrap mode so it can report why no authenticated session exists.

The external upstream runs from a descriptor-captured, hash-bound module graph
inside a minimal Bubblewrap mount/PID namespace. Before releasing Bubblewrap's
startup block, the facade binds the reported sandbox PID to the live Bubblewrap
monitor, process start times, `NSpid` mapping, and cgroup/IPC/mount/PID/UTS
namespace identities. The child emits readiness only after checking its mounted
supervisor, exact environment and data directory, Node permission/code-
generation policy, local descriptor baseline, kernel `connect(2)` denial, and
JavaScript network restrictions. The facade then re-proves process topology,
the exhaustive Node 24.18.0 descriptor boundary, zero soft core limit, and every
retained input seal before closing its inherited payload descriptors and
delivering the ephemeral token.

Only the dedicated owner-only data directory is writable. The host source tree,
control-root credentials, host `/proc` and `/etc`, workers, child processes,
native addons, and WASI are unavailable. The seccomp filter rejects outbound
`connect`, datagram-send, message-send, and `io_uring_setup` syscalls; the
JavaScript boundary also blocks high- and low-level client/datagram APIs and
permits the child to listen only on the exact facade-assigned private backend
loopback port. That per-start backend port is distinct from the authenticated
extension-facing gateway at `127.0.0.1:49621`. Runtime staging uses unlinked
descriptor-only payloads rather than mutable snapshot paths.

## Development

First-party MCP source, test, and plugin scripts are TypeScript. The exact Node 24.18.0 runtime runs the erasable TypeScript directly during development; `tsc --noEmit` performs the strict compiler check, and esbuild produces the committed JavaScript MCP bundle. The vendored EasyEDA renderer bridge is checked separately against its ES2020/DOM production-source target with the same strict compiler family; that profile's only exception is `noPropertyAccessFromIndexSignature`, because reverse-engineered host values are intentionally dynamic records. Its test profile targets ES2023 and permits test-only parameter properties by disabling `erasableSyntaxOnly`; those tests are never emitted into the renderer bundle. Type-aware Oxlint treats the correctness, suspicious, pedantic, performance, style, and restriction categories as errors, denies warnings, and rejects unused suppressions. Root and renderer-bridge exceptions are narrowly documented next to their rationale in `.oxlintrc.json` and `.oxlintrc.bridge.json`.

GNU binutils `/usr/bin/as` and `/usr/bin/ld` are development-only inputs for
rebuilding and byte-verifying the static sanitizer. An installed release runs
the committed reviewed binary and does not invoke binutils. `sanitizer:check`
builds twice, requires byte-for-byte reproducibility, and compares the result
with the identity constants and committed executable.

```bash
cd plugins/easyeda-pro-control
ulimit -c 0
test "$(ulimit -c)" = "0"
test "$(node --version)" = "v24.18.0"
test "$(npm --version)" = "11.16.0"
npm ci
npm ls --all
npm audit signatures
npm audit --audit-level=moderate
npm run sanitizer:check
npm run typecheck
npm run bridge:typecheck
npm run bridge:lint
npm run lint
npm run build
npm run compatibility:check
npm test
npm run bridge:test
npm run validate
```

Repository validation runs from the marketplace root:

```bash
npm --prefix plugins/easyeda-pro-control run repository:validate
```

GitHub Actions installs binutils, rebuilds the sanitizer twice, and requires its
exact committed identity before building the plugin. The sandbox regression
also injects otherwise valid high-numbered host descriptors and proves that
they cannot reach Bubblewrap. CI separately builds the exact non-setuid
Bubblewrap 0.13.1 source commit, proves that its `security.capability` xattr is
absent and the soft core limit is zero, runs strict TypeScript checking,
type-aware Oxlint, and the sandbox and bridge tests, and rebuilds both release
payloads on every push and pull request. It also checks that the committed
bundle is reproducible, validates marketplace safety metadata, and uploads the
built plugin archive.

Read [`AGENTS.md`](AGENTS.md) before making agentic changes. Security-sensitive contribution rules are in [`SECURITY.md`](SECURITY.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License and upstream

This repository is MIT licensed. It vendors a reviewed, authenticated derivative
of the MIT-licensed `easyeda-mcp-pro` bridge-extension source and invokes a
separately installed `easyeda-mcp-pro` server at runtime. See
[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
