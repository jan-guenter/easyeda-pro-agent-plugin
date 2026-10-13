# API execution feasibility and remaining work

Research date: 2026-10-10. This investigation used official documentation and the
installed implementation files below. It did not open a project, call the bridge,
change a journal or execute a CAD writer. No user design was read or modified.

Follow-up: the [October11 source review](api-remaining-method-effects-2026-10-11.md)
traces layer selection, page order, pad-pair replacement, PCB text and a narrow
closed-container rename route. The
[installed083400 fixture report](api-coverage-083400-fixture-validation-2026-10-11.md)
separately records nonempty flat display Save/reopen evidence. Historical pending
statements below describe the original investigation, not those later results.

The useful boundary is method-specific. Some methods already have an executable
adapter. Some are empty in the installed build. Others need a stateful adapter
because they start dialogs, create additional assets or return before the full
workflow ends. The last group is engineering work, not an inherent API limit.

The exhaustive method list is [api-coverage.json](../plugins/easyeda-pro-control/api-coverage.json),
with status definitions in the [inventory guide](api-coverage-inventory-2026-10-10.md).
It classifies all 774 mounted method paths, including 82 implemented-but-blocked
methods and 469 omissions. This report discusses selected methods and families;
it is not an individual feasibility investigation of every omitted method.
Some omissions have method-specific implementation evidence. Others identify
missing adapters or category-level requirements whose exact workflow still
needs investigation. In particular, 106 omissions use the shared
`scoped-effect-adapter-needed` reason, and 345 have no evidence references.
These are remaining implementation or investigation tasks, not proof that the
native API cannot perform them. This release does not complete every feasible
SDK method.

## Current restriction, October 13, installed 084617

Installed `0.3.0+codex.20261013084617` and current source block all
schematic-page, symbol and PCB design transactions, including previously
narrow display and wire profiles.
Eight symbol/page/container metadata operations are also blocked. Source review
found a shared delayed `project_structures` write that their existing document
comparisons do not fully model. Footprint routes retain their separate guards.
The exact affected operations and implementation requirements are in the
[030626 report](api-coverage-030626-release-2026-10-12.md) and
[native completion investigation](project-structure-save-completion-2026-10-12.md);
the [074635 release report](api-coverage-074635-release-2026-10-13.md) records the
retained document-ID and duplicate structure-row corrections. The
[084617 release report](api-coverage-084617-release-2026-10-13.md) records fixed
probe transport and exact pre-navigation abandonment; it enables no new writer.

Internal completion code and the separate disposable-validation tool have not
restored these editing routes. Each route still needs operation-owned integration
and its own complete effect proof. The earlier feasibility analysis below
explains the method-specific work; references to a display exception or admitted
metadata writer describe its original implementation, not present execution
support. Historical test results do not override the current execution guards.

## Earlier schematic-connectivity investigation

Ordinary schematic design transactions are currently blocked by the absence of
an admitted nonmutating transaction-connectivity proof. This is a functional limitation,
not merely a missing live-validation badge. Generic compiled-profile type-1
apply, commit, rollback, repair, reconciliation and navigation refuse before
runtime calls or journal writes. A new sealed display-only exception is described
below. The formerly used schematic netlist path can annotate
DESIGNATOR/UNIQUEID and invoke global SaveAll. It cannot remain a read-only
preflight. See the exact delegated call chains in the
[independent source review](api-coverage-review-2026-10-10.md).

The existing `schematic-flat-topology` reader is a separate native/source-bound
diagnostic profile, implemented in `schematic-flat-read.ts` and
`schematic-flat-topology.ts`. It checks saved-project page membership, requires
every page already loaded, double-samples the complete observation and reports
`transactionTopology:false`. Its named-wire, single-part, flat-project subset
does not silently replace the historical compiled transaction proof. See the
[flat topology review](schematic-flat-topology-review-2026-10-10.md).

The source now integrates a restricted display-only profile into transactions
whose complete before/after states satisfy its exclusions. Connected lifecycle
validation is still pending.
The broader alternative is an adapter exposing a complete compiled graph without
annotation or Save, with source-correlated membership, freshness checks and
explicit treatment of hierarchy, repeated/multipart devices, disconnected pins
and no-connects. The existing page-local `getSchPinNet` observation is useful
but is not equivalent to that proof. Private `F0`/`gT` compiled-graph helpers are
research starting points, not admitted callable replacements. A restricted
transaction profile must independently prove its excluded hierarchy and complete
membership; it is not enough to rename the diagnostic result. Removing
the topology guard or silently substituting page-local evidence is not a fix.

Initial transaction integration should seal the exact flat profile, complete
page membership, per-page source hashes, endpoint proof and intended topology
in the original immutable plan. Every apply step, before-Save check, saved/reopened
check, inverse, repair and reconciliation must use that same profile, never
switch automatically to compiled topology or broaden its domain. All parts
must remain single-part, uniquely annotated and PCB-convertible; every wire
must retain one simple literal name and reviewed orthogonal endpoint geometry.
Flags, ports, hierarchy, buses, standalone labels, generated-name cases and
unsupported inherited images/templates remain refused. An operation that would
leave this domain must refuse before dispatch, including an inverse or repair.
The existing reader requires all pages loaded and unchanged saved membership;
reopen/page-loading and failed-transaction recovery need explicit no-repeat
lifecycle handling rather than assuming those prerequisites survive a close.
Independent disposable forward, inverse, ambiguous-return and retained-runtime
recovery tests are needed before removing any type-1 transaction refusal.

The implemented first integration is a new internal transaction profile admitting
only `sch.layout.batch` steps that change existing `sch.attribute.display` or
`sch.text.display` fields. Their complete source-effect and inverse proofs
already exist. Graphic create/modify/delete schemas alone are insufficient:
the type-1 source-effect verifier does not implement those families. Preserve
the old compiled-journal refusals, retain full flat observation evidence, and
compare normalized endpoint topology separately from source/checkpoint hashes
that legitimately change after a display edit. Start connected acceptance with
one nonempty ordinary sheet satisfying every flat-reader restriction, then
prove its edit, Save/reopen and full-project persistence. This is a proposed
boundary implemented in the new source, not an installed or live-validated claim.
Its immutable plan seals the exact owner/branch, source/native before/after state,
complete member inventory, endpoint topology and stored-field inverse. Every
writer and Save uses final same-execution receiver/observation checks. Before
new Save or inverse authority, complete durable state must be the original
baseline or the exact intended effect. Old compiled journals and all repair/page
loading routes stay blocked. Offline helper/runtime/refusal tests pass; they do
not prove a complete successful connected apply/Save/reopen lifecycle.

This blocker does not prohibit all type-1 activity: read-only observations and
the separately proved closed-page metadata/creation transactions have different
effect boundaries. Symbol type-2 geometry is also distinct from type-1 design
transactions.

## Source identity

| Source | Bytes | SHA-256 |
|---|---:|---|
| Installed public adapter, `pro-api/0.2.53.aee2f57a/api-types.js` | 1,730,198 | `4da5b5184a78e2d3aca843dad6b147d7feb7ec1368160d73f49c4acbcf97dfdb` |
| Installed UI, `pro-ui/3.2.149.43637efe/js/ui.js` | 17,265,809 | `12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a` |
| Installed project worker, `pro-mgr/3.2.148.154949d9/js/project-worker.js` | 2,164,464 | `2792c6c87e3c60e09c43f03494a9cbb24e4ebe9c385372bbaf877ed75083a949` |

Paths are relative to the configured EasyEDA asset root. These hashes identify
the source examined; this report does not update runtime compatibility pins.
The [existing interface research](easyeda-extension-interface-research-2026-10-10.md)
records the separate declaration snapshots and full namespace counts. Official
documentation currently describes a newer API, so installed behavior below must
not be inferred from the latest method page alone. EasyEDA versions the API
separately from its editor. [Official version policy](https://prodocs.easyeda.com/en/api/guide/stability.html).

Local executor findings refer to
[library-runtime.ts](../plugins/easyeda-pro-control/server/src/library-runtime.ts),
[library-execution.ts](../plugins/easyeda-pro-control/server/src/library-execution.ts),
[library-operations.ts](../plugins/easyeda-pro-control/server/src/library-operations.ts)
and
[library-persistence-proof.ts](../plugins/easyeda-pro-control/server/src/library-persistence-proof.ts).

## Historical typed library and lifecycle implementation

At the start of this work, 32 of the 68 strict library/lifecycle operation
schemas had no executor profile. Eight additional named gaps were outside
those schemas. The table retains all 40 original entries and identifies the
subsets implemented during that earlier investigation. Its implementation
descriptions and the counts in this paragraph are historical source findings,
not a list of currently executable actions. A follow-up source audit of
`listLibraryExecutionCapabilities()` found 37 implemented subsets among 76
named actions after empty ordinary symbol creation and closed PCB/schematic
rename. At that review, 24 typed actions lacked an executor, seven exports were
explicitly refused, and eight named native/dialog gaps remained. Thus 39 actions
were not standalone executable library operations; `project.open` and the Save
actions had separate restricted lifecycle routes. These counts described the
audited source, not installed or connected validation. The current restriction
above also blocks eight metadata actions whose implementations appear below.
Use the [generated API inventory](../plugins/easyeda-pro-control/api-coverage.json)
for current method and execution-route status; overloads and alternate routes
are counted separately.

| Action or exact action group | Concrete reason it cannot use the existing executor unchanged | Implementation needed |
|---|---|---|
| `library.symbol.modify` | The public wrapper's awaited current-project comparison can redirect a local write to a cloud library. Its classification and default-title projections can also alter unrelated metadata. | Implemented as a fixed project-qualified native task equivalent for closed ordinary symbols, preserving exact display title and stored tags. Complete project and recovery proofs are integrated; current-generation disposable saved/reopened validation remains unclaimed. |
| `library.symbol.create` | The public method calls the symbol service, which generates metadata and obtains initial canvas data. Ordinary symbols and sheet-symbol templates use different paths. | Implemented as a narrower native equivalent: a closed empty ordinary project symbol, exact original returned ID, native header and META-only addition, with all peers unchanged. No PART/template/canvas initialization, open, Save, classification or inverse. Flags, ports, sheet symbols and initialized templates still need their own exact proofs. The permission-denied path may open a native dialog; connected validation is pending. |
| `library.symbol.delete`, `library.footprint.delete`, `library.device.delete` | UI deletion runs dependency checks, but its `$3` delegate starts individual service deletions in unawaited `forEach` callbacks. Its success acknowledgment does not establish terminal completion. The symbol worker separately has an awaited `deleteData` path emitting DOCHEAD plus DELETE_DOC. | Feasible first subset: closed, dependency-free project asset, with full checkpoint dependency inventory and a project-qualified awaited worker adapter. Refuse nonempty closure, retain deleted records and prove exact tombstone/header changes plus unchanged peers. Review each asset manager separately; a restoration procedure is not an automatic inverse. |
| `library.symbol.copy`, `library.footprint.copy`, `library.device.copy` | Copy can migrate canvas data and associated assets to another collection. The public DEVICE copy additionally hard-codes `isProject:false` for its read, destination create and associated asset inputs, so it is not a project-local copy adapter. Symbol/footprint copy use mutable-current-project comparisons and source/template services. | Feasible with new project-qualified adapters: first admit one closed local asset and exact copied geometry/identity mapping. DEVICE copy must explicitly preserve or authorize copied associations rather than reuse its public cloud-oriented path. Prove every added record and unchanged peer. |
| `library.model3d.create` | The importer accepts file data and can return multiple UUIDs. Project-local model create is not implemented in the installed service dispatch. A single local project checkpoint does not back up an external model collection. | Add bounded managed-input transfer, explicit external collection authority, importer result inventory, units and geometry checks, external backup/recovery and per-model identity evidence. |
| `library.model3d.modify`, `library.model3d.delete`, `library.model3d.copy` | The installed service treats model storage separately from project DEVICE metadata. The local project checkpoint cannot prove or restore external model assets or references. | Add an external-library transaction store and exact model metadata/content/dependant proofs. Existing DEVICE model association actions do not edit the model asset. |
| `library.symbol.source.replace`, `library.footprint.source.replace` | Full source replacement invokes a document decoder. The footprint wrapper can create a preview iframe and invokes its compiler save. These are not metadata-only operations and can change unknown records or persist before a separate design commit. | Validate complete source grammar, owner and locks, enumerate accepted record changes, model decoder-generated IDs, preserve unknown records, and integrate the wrapper's actual save boundary with no-repeat recovery. Prefer existing typed geometry actions for ordinary edits. |
| `project.create` | The API takes team/folder identity and can create account/cloud state. The disposable-local-project request does not designate an external destination. The pinned public delete method is an empty refusal, so public create cannot promise an inverse. | Add explicit destination authority, account-scoped inventory and recovery, or a separately reviewed local-project creation adapter. Never test this against a personal/team workspace by default. |
| `project.open` | The installed open path can discard unsaved state. The generic descriptor has no proof that every open document is clean. | Use the existing retained-runtime `open-existing` route for its supported saved project case. A broader opener needs complete tab/dirty-state proof and one-shot navigation/recovery. |
| `document.activate` | Activation changes the exact context; an acknowledgment can be false even when the requested tab becomes active. The existing executor's preserve-context path is inappropriate. | Implemented for already-open current-project schematic pages, PCBs, ordinary symbols and footprints. The retained checkpoint fixes target membership and owner; the complete tab tree is checked before one activation and after two coherent target observations. Complete durable project and logical database remain unchanged. Recovery observes only the original/target state and never reactivates or opens a tab. Current-generation connected validation is not claimed. |
| `document.close` | The public method starts unawaited teardown and immediately returns true. Schematic type-1 cleanup can persist INSTANCE attributes even when the tab is clean. | Implemented only for an inactive clean loaded ordinary SYMBOL, PCB or FOOTPRINT beside one clean active PCB/FOOTPRINT. One close, terminal removal evidence, unchanged active context/source and complete project/SQLite proof; no Save or automatic inverse. Any post-dispatch failure retains execution quarantine. Type-1, active-target and split-screen close remain outside this subset. |
| `document.page.create` | The public new-page workflow creates/gets a drawing frame and opens the editor in addition to adding the page. Those are separate effects. | Implemented as a project-qualified empty-page addition under an existing ordinary schematic: exact returned UUID, DOCHEAD/META addition, parent/peer preservation and original-journal recovery. No drawing-frame initialization, editor opening, Save or automatic inverse is claimed. |
| `document.pcb.create`, `document.schematic.create` | Creation assigns identities and changes board/container membership. Public create routes through `DMT_CreateNew` (`new_PCB`/`new_schematic`); the input is a board name, not the new document title. The page-addition proof does not cover their defaults or hierarchy. | Feasible next local creation work after reviewing each worker `addData` and its generated defaults. Retain the exact new board/container/document inventory; exclude CBB and inherited cases initially. A chosen title requires a separate returned-ID-bound rename unless explicitly added to the native equivalent's contract. |
| `document.pcb.copy`, `document.schematic.copy`, `document.page.copy` | Copies clone source, pages, IDs and parent membership, beyond the current single-document patch proof. The strict copy schemas expose target/parent scope, not a new document title. | Retain the copied hierarchy and identity mapping, then separately rename if requested. Check every copied source and all untouched documents. |
| `document.page.rename` | Implemented as a project-qualified native task equivalent. The public wrapper retains a mutable tree-row index across awaited work, which can select a different document. | Closed ordinary checkpoint-member page, one clean active sibling, writable local non-V2 branch only. Exact title/header effect and all peer/source invariants; no Save, reopen or UI-caption refresh claim. Disposable connected validation remains pending. |
| `document.pcb.rename`, `document.schematic.rename` | Public wrappers can update paired CBB/container state. Their contract is broader than a title-only edit. | Implemented through a separate direct project-qualified worker adapter for one closed ordinary target, with every schematic child closed and one other clean PCB active. Strict META shape, duplicate-name checks, independent DOM inventory, complete peer records/clocks/provenance and original-acknowledgment recovery. No public paired rename, Save, reopen, automatic inverse or connected acceptance. See the October11 review. |
| `document.pcb.delete`, `document.schematic.delete`, `document.page.delete` | Deletion changes hierarchy and board associations. The public page deleter marks a last page for schematic deletion and can add its paired PCB to the deletion set. `deletePcb` returns true after its RPC without checking the RPC result. | Feasible first subset: a closed empty non-last ordinary page, after reviewing awaited worker completion and manager cleanup. Broader support must authorize the entire deletion closure and prove its tombstones/parent changes. Retain a recoverable project backup; creating a new empty document is not an inverse. |
| `document.pcb.save`, `document.schematic.save` | A standalone Save would bypass the design transaction's pre-dispatch intent and saved/reopened source proof. A second Save after an ambiguous first one is unsafe. Current schematic-page, symbol and PCB commits also lack complete native structure-job completion and SQL-effect proof; broader schematic transactions separately lack a safe nonmutating connectivity proof. | Keep these Save routes blocked. Restore only exact original-journal-bound transaction subsets after proving native completion, complete source/SQL effects and saved/reopened recovery. A Boolean Save endpoint or a prior successful lifecycle does not meet those requirements. Footprint transactions retain their separate restrictions. |
| `project.rename`, `project.description.modify`, `project.copy`, `project.delete` | The corresponding pinned public implementations are empty or return false. | A dedicated native adapter or deliberate newer-runtime review is required. Merely exposing the method cannot make these pinned bodies work. |
| `library.device.source.replace`, `library.model3d.source.replace` | The reviewed mounted classes contain no `updateDocumentSource` method. DEVICE metadata and model file storage are different contracts. | Use dedicated DEVICE association/property operations; add a model import/replacement transaction for model files if needed. Do not fabricate a source-replacement API. |
| `eco.schematic-to-pcb` | Public `pcb_Document.importChanges` opens the ECO workflow. Applying the change set is not the same operation as opening the dialog. | Capture the exact comparison rows/options and UID/pin/pad/net consequences, then add a reviewed apply adapter or guarded native dialog sequence and complete saved/reopened proof. |
| `export.pcb.interactive-bom` | The installed UI creates a hidden welding-tools iframe, changes a global export flag and URL hash, then waits on an event subscription. That helper has no bounded cancellation or subscriber cleanup. | Own the iframe/subscription lifetime and timeout recovery. Verify generated HTML as inert managed bytes and unchanged design state. The ordinary `File` wrapper alone does not cover this workflow. |

These rows distinguish a genuine pinned implementation gap from an incomplete
plugin adapter. Most local metadata/lifecycle gaps are implementable. Cloud and
external model changes need a different authority and evidence model rather
than a weaker project-checkpoint comparison. Official method families are
documented under [editor control](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_editorcontrol.html),
[schematic documents](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_schematic.html),
[symbols](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_symbol.html)
and [manufacturing export](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_manufacturedata.html).

### Next feasible local adapters

After resolving transaction topology, the most useful narrow increments are:

1. **Validate empty-symbol creation, then investigate initialized symbols.**
   The closed, META-only ordinary project-symbol adapter is now implemented;
   connected validation remains pending. It excludes PART/canvas initialization,
   classification and inherited source. The broader `VL.create` delegates through
   `hTt` and the symbol service; `hTt` produces ordinary metadata directly but
   resolves a separate existing template for sheet symbols. The worker `gg`
   manager's `create` builds metadata and obtains source through
   `si.getProLibSource` before uploading both strings. Review the new-symbol
   service branch and exact default canvas/part records, then bind every new
   identity to one returned UUID and a complete addition proof. That initialized
   subset remains unfinished, not inherently unavailable. The latest
   [symbol creation reference](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_symbol.create.html)
   includes additional parameters; it does not establish those parameters in
   the pinned build.
2. **Closed, dependency-free project-asset deletion.** The symbol worker's
   `deleteString` emits one DOCHEAD and `DELETE_DOC {isDelete:true}`;
   `deleteData` awaits `uploadLocal`. That is a tractable first tombstone
   proof when the complete project contains no dependent DEVICE, placed or
   inherited references and the target is absent from all tabs. Do not reuse
   public `$3` completion: its individual service deletions are unawaited.
   Footprint/device deletion needs the corresponding manager and dependency
   review, not an assumed shared implementation.
   The [October12 follow-through](symbol-delete-native-effects-2026-10-12.md)
   also found preview/close-tab/cache subscribers and a debounced structure-table
   write outside the ordinary upload barrier. A closed META-only target does not
   remove those effects. The exact tombstone proof is necessary but insufficient;
   runtime enablement still needs request-bound completion of that lifecycle.
3. **Closed ordinary schematic/PCB creation.** Public creation
   already requests `notOpen:true` or `unOpen:true`, but traverses
   `DMT_CreateNew` and can create board/default records. Review project-qualified
   worker additions and enumerate the full expected hierarchy. Closed ordinary
   rename is now implemented by a separate native profile with its own serializer,
   subscriber, DOM and complete-record proof. Its connected acceptance remains
   pending. Neither rename proof can be reused as a creation proof.
4. **Same-project copy, then non-last empty-page deletion.** These are feasible
   but need more identity/dependency work than metadata. Preserve exact source,
   explicitly model remapped children and associations, and independently
   prove the target parent. The public DEVICE copy is cloud-oriented even
   when given a project UUID. A last-page delete is deliberately not the
   first deletion subset because it can cascade to its schematic and PCB.

Read-only tab/split-screen lookup is now implemented as a separate restricted
increment, discussed below; it does not resolve schematic connectivity. Export rehabilitation also
remains useful, but should start from a reviewed nonmutating single-document
projection, not an unchecked call to a SaveAll-bearing wrapper. Full-source
replacement, ECO, external model import and cloud project creation require
larger transaction or authority boundaries; they remain engineering backlog,
not claims of permanent infeasibility.

For reproducibility, the follow-up native findings use the UI/worker hashes
above. These are zero-based UTF-16 search anchors, not claimed complete
function ranges: UI `VL` at 17185634, `hTt` at 9746363, `$3` at 15202843,
DEVICE `copy` at 17065815, `Xk.createPcb` at 17052002,
`Ag.createSchematic` at 17074087 and `Ag.deleteSchematicPage` at 17075419;
worker `gg` at 1919322 and its `addData`/`create` neighborhood at 1926024.
Public page deletion marks the last page with `isLast:true`, adds its parent
schematic, and can add the associated PCB before calling `leftTreeDelete2`.
The public PCB deleter ignores the RPC result and returns true. These facts
explain why Boolean acknowledgment cannot serve as the deletion effect proof.

## Implemented symbol-metadata transaction

[project-symbol-metadata.ts](../plugins/easyeda-pro-control/server/src/project-symbol-metadata.ts)
adds a narrow ordinary-symbol metadata adapter, now registered in the tracked
`LibraryExecutor` through the existing `library.symbol.modify` schema. It
supports exact project-local name and non-null description patches. Empty-symbol
creation has its separate narrow adapter. Initialized creation, classification,
source replacement and external library edits retain their separate omission
reasons.

The installed public `VL.modify` wrapper takes a normalized search title as its
default and reprojects classification. More importantly, it awaits metadata
retrieval before comparing the requested project with mutable `currentProject`.
A project switch during that await can route the write to a cloud/personal
library. Checks around the entire call cannot close that internal race.
The replacement uses the fixed project-qualified `/PrjDB/symbol/updateData`
worker path, not the public modifier, and therefore is a native task equivalent.
It supplies the exact checkpoint display title and requested description while
preserving stored tags. The documented optional classification argument alone
does not describe these implementation hazards.
[Official symbol modifier](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_symbol.modify.html).

The project worker's `gg` symbol manager maps native metadata into its stored
META record using `title`, numeric `docType`, `tags`, `description` and `source`.
Its getter separately derives normalized search and display titles. The
adapter therefore requires stored `META.docType === 2`, not an invented
`symbolType` field. It compares the supplied complete before/after histories,
allows only requested META title/description changes and the reviewed edit
header fields, and preserves every other record. Unknown serialized META or
DOCHEAD keys refuse before writing. The serializer drops the captured undefined
`user` and rewrites client/time/version; only that deterministic removal is
admitted, with the existing editor version bound before dispatch. This is a local comparison,
not a claim that the histories came from verified checkpoint receipts. This pure
helper reports `effectVerified` and `persistenceEvidence`, never `saved:true`.
The executor obtains both histories from its maintained checkpoint path, waits
for project uploads, checks the complete effect, and verifies the final receipt
before completing the journal. Its durable `saved` result does not claim a
separate editor reopen.

The focused regressions cover rejected families and raw fields, normalized
name collisions, geometry/binding/peer/header changes, the display-title and
native routing and tag preservation, owner/context drift across an awaited read, false
acknowledgment and a throwing writer. Failure after a writer invocation consumes
one invocation; the generated program never retries. Tests use synthetic
history and API doubles. They are not connected validation.

Preparation and original dispatch are recorded as an immutable operation,
`symbolPlan`, `symbol-prepared` artifact and exact target mutation receipt.
Reconciliation requires the original return artifact and recomputes the plan
from the immutable operation and original checkpoint. Missing return evidence,
changed target IDs, substituted preparation, geometry or peer changes retain
the failure state; reconciliation never invokes the modifier or Save again.

The active editor must be a different document: the executor refuses an active
symbol target before any upstream access because its active-source invariant
requires that source to remain unchanged. Immediately before the modifier, a
complete bounded split-screen tree must prove that the target is absent from
every tab and all other tabs have known project/library ownership. An inactive
open symbol is also refused to protect its potentially unsaved source. Malformed,
cyclic, oversized, duplicate and contradictory ownership entries refuse before
the modifier. Metadata preservation is checked
across every document, including devices and placed instances. A helper builds
an inverse operation only after the supplied full histories prove the forward
effect. The inverse requires a new transaction and fresh checkpoint;
it is never an implicit retry, database restoration or same-journal mutation.
An inverse restores requested metadata, not the serializer's removed header user.

### Disposable acceptance still required

1. Use an admitted fresh facade with no incomplete journal and an explicitly
   disposable project. Capture complete baseline project history, exact source,
   symbol membership, owner and current runtime identity.
2. Choose an existing ordinary symbol with a mixed-case display title, stored
   description, at least one pin and a placed DEVICE dependant. Retain the exact
   geometry and all instance bindings. A fixture without those records cannot
   test their preservation.
3. Use the integrated library executor with its prepared plan, dispatch intent,
   returned receipt and reconciliation. Its compatibility, no-orphan and
   complete-durable-baseline gates apply. Do not call the compiler as an ad hoc
   script around those controls.
4. Patch the description only. Prove the mixed-case title and every pin/part/
   instance record unchanged, the one description changed and no peer document
   altered. Retain verified checkpoint receipts separately from the pure effect
   comparison.
5. Close/reopen the exact library asset once and inspect the retained source and
   saved project again. Apply the inverse metadata patch through a new verified
   transaction and repeat the saved/reopened checks. Never repeat an ambiguous
   call or bypass a failed comparison.
6. Repeat with a rename, duplicate-name rejection, false/late native result and
   interrupted transport. Recovery must retain the original identity and must
   not redispatch the original mutation.

Only after those phases pass should the capability matrix advertise connected
symbol metadata support. The executor currently reports
`currentGenerationLiveValidated:false` and `reopened:false`; a registered
operation does not establish either claim.

## Implemented closed-page rename transaction

`document-page-rename.ts` derives a complete immutable plan from the retained
checkpoint. It admits an ordinary closed `SCH_PAGE` and one clean active sibling
under the same `SCH`; hierarchical instances, CBB assets, inherited source,
unknown META/DOCHEAD fields and unsupported symbols are refused before dispatch.
Both server normalization and the installed UI's locale-aware comparison check
the complete bounded sibling-title set.

The pinned public setter crosses an await with a mutable left-tree index. The
adapter instead awaits its project-qualified `/PrjDB/sheet/updateData` path
once. Native branch, owner, version, history and concurrent-design permission
checks run immediately before that dispatch. Two native dirty-state methods
must return false; a pristine tab may omit its dirty field, but malformed or
contradictory values refuse. Every native metadata read is followed by context
reproof.

The worker serializer removes the old DOCHEAD `user` because the sheet handler
captures an undefined user during construction. It updates client/time/version
and writes the editor version. The adapter admits only that exact actor-field
removal, requires the editor version already to match, and preserves all other
header fields. The only allowed design-record change is the requested META
title. The metadata inverse is a separately authorized transaction, not a byte
restoration of old header bookkeeping.

The executor retains preparation and native-return artifacts, checks complete
project history and active source, then rechecks the final checkpoint/context.
Recovery rederives the original plan and requires its original acknowledgment;
it never repeats the native call or Save. Durable title verification does not
prove visible tree-caption refresh or reopen. Tests cover the real sealed
journal executor/recovery with synthetic native data, not a connected writer.

## Implemented empty-page creation

[document-page-create.ts](../plugins/easyeda-pro-control/server/src/document-page-create.ts)
implements `document.page.create` as an empty, unopened page under a retained
ordinary `SCH`. It uses one project-qualified `/PrjDB/sheet/addData` call with
explicit parent, native-derived `P<number>` title and next zIndex. The public
new-page workflow's drawing-frame creation and tab opening are not included.

The complete checkpoint excludes active hierarchy/CBB cases and inherited
parent/page metadata. One clean owned schematic sibling or PCB may be active;
the new page must not become an editor tab. Writable local branch, native
dirty state and exact context are rechecked across awaited reads. The strict
hidden native project placeholder is admitted only under its exact reviewed
shape and an independent clean-state check.

The effect verifier requires exactly one new SCH_PAGE with its generated
16-hex identity, expected META and DOCHEAD, no geometry, unchanged parent and
all other records unchanged. The immutable native return supplies the created
identity. Recovery cannot infer success from a similarly named page, substitute
another returned ID or repeat creation when that evidence is missing. There is
no automatic deletion inverse. The result does not claim that the page was
opened, drawing-frame initialized or reopened, nor that a design Save occurred.
Connected acceptance must test those later lifecycle operations separately.

## Implemented inactive clean-document close

[document-close.ts](../plugins/easyeda-pro-control/server/src/document-close.ts)
implements one inactive clean ordinary SYMBOL, PCB or FOOTPRINT close while a
different clean PCB/FOOTPRINT remains active. Exactly two project-owned loaded
document tabs in one unsplit container are required; only the canonical Start
Page and exact clean hidden project placeholder may accompany them. Complete
history, branch/owner, canonical tab IDs, connected frame identity and native
dirty predicates are bound before dispatch. Ordinary symbols also require an
exact loaded document-manager entry, canvas and no schematic/model-tab alias.
The public contract warns that close discards unsaved changes, so dirty targets
are never admitted.
[Official close contract](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_editorcontrol.closedocument.html).

The pinned public close starts `$b(tabId)` without awaiting it, then returns
true. The adapter subscribes before one dispatch, waits for the exact terminal
`sch/SubTabbarMapRemove` notification, and independently observes target-tab
and frame removal twice while the active editor stays unchanged. For a symbol,
its manager entry must be gone and original canvas disposed. Complete durable
project records, logical SQLite dump, active source and final context remain
unchanged. No Save, activation, reopening or inverse is performed; reopening
would not restore the undo/export caches destroyed by native teardown.

Every failure after dispatch reports the fixed
`NATIVE_LIFECYCLE_CLOSE_UNSETTLED` marker. This includes false or malformed
acknowledgment, rejection, a missing terminal event, an observer deadline or
subscription cleanup failure. The existing
engine retains the journal's orphan risk, bridge lease and captured execution
authority. A later still-open sample cannot clear that quarantine while the
old runtime may finish its delayed close. Only supported retained-runtime
termination recovery can resolve that execution risk; subsequent reconciliation
is read-only and never repeats close or opens a replacement tab. An unchanged
database reconciliation does not claim that the original native close finished.

Type-1 schematic close remains excluded for a concrete additional effect:
`sch/InstanceValue.beforeClosePage` reaches `clearOnePage`, which can delete or
rewrite INSTANCE attributes and save them even when the ordinary tab is clean.
A future no-instance flat-project subset could be representable after complete
delegated cleanup review; the current SYMBOL/PCB/FOOTPRINT close proof does not
admit it. This adapter has offline transaction and real-engine quarantine
regressions, not a current-generation connected acceptance claim.

### Preparation publication failures

Page creation, activation and clean close prepare their complete immutable plan
before creating a journal. A storage failure can still leave a journal without
its preparation artifact. Recovery now distinguishes that exact initial
publication prefix from any dispatched or recovered operation. It accepts only
the original planned state or the specific failed preparation-publication
state, with at most the original `before` artifact, no dispatch/authority fields
and no mutation or lifecycle evidence. Unknown journal fields refuse.

The read-only path rederives the plan from the original operation and checkpoint
and verifies the unchanged active source, complete project history, logical
database, runtime and context. One sealed journal update marks the attempt
`plan-invalidated`. It does not infer that a page was created, a tab activated
or a close completed. Failed inspection preserves the initial journal for a
later read-only check; no upload barrier, navigation, Save or retry runs.
Dispatched operations still require their original preparation and returned
identity where applicable.

This subset requires the original compatible runtime. Rebind, target-open and
authority-recovery requests refuse before altering a missing-preparation
journal, directing the caller to original-runtime reconciliation. Supporting
replacement-runtime invalidation would need a separately preserved original
pre-dispatch proof; it is not implied by this recovery path.

## Other SDK groups

The [method-level inventory](../plugins/easyeda-pro-control/api-coverage.json)
contains every mounted method. The following category-level requirements guide
adapter work; they do not establish that each method has been investigated
individually or cannot be implemented. Missing adapters remain unfinished work.

| Group | Required adapter boundary |
|---|---|
| Plain project/editor/layer/rule/library reads | Fixed method allowlist, exact argument parser, retained runtime/context checks, complete bounded serialization and unchanged saved design evidence. These are the best broad coverage increment. Public fields can remain lossy; preserve existing exact-native readers for authoritative geometry and connectivity. |
| Geometry classes and helpers returning class instances | Convert only explicitly defined fields or maintained source records. JSON serialization can erase methods, undefined values and prototype state. Do not claim returned JavaScript objects are an exact native record model. |
| Schematic/PCB interactive placement | Callback and canvas state persist beyond the initial invocation. A transaction needs cancellation, foreground/context ownership and complete terminal geometry, rather than passing a JavaScript callback from the agent. |
| Event, timer, menu and shortcut registration | Register only plugin-owned functions under owned IDs. Require bounded event queues, unsubscribe/remove on completion and recovery after interrupted ownership. These methods are extension plumbing, not ordinary one-shot CAD queries. |
| Generic message bus and external APIs | Arbitrary topics or extension-provided method names can invoke unreviewed code. Each useful operation needs its own fixed schema, implementation identity and resource scope. |
| Filesystem, network and storage | A getter can disclose private files or account data; a write can affect files outside the disposable design. Require managed paths/artifacts or separately authorized endpoints and payloads. Existing bridge networking is infrastructure, not authorization for an arbitrary network request tool. |
| User dialogs and windows | A Boolean or window ID does not prove which dialog remained visible or what a later user choice did. Use process-bound native observation or a tracked plugin-owned window with an explicit lifecycle. |
| Latest-only help, simulation-model library, autorouting and image tools | These mounts are absent from the reviewed 0.2.53 declaration/implementation tuple. New declarations cannot be used to bypass installed-runtime compatibility. Admit a newer tuple and test each operation before dispatching it. |

The ownership concern follows directly from the documented callback-bearing
[schematic event APIs](https://prodocs.easyeda.com/en/api/reference/pro-api.sch_event.html)
and topic-based [message bus APIs](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_messagebus.html).
The file APIs explicitly include arbitrary filesystem reading, writing and
deletion, not only export downloads.
[Official filesystem reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_filesystem.html).

### Public-wrapper defects and replacement adapters

A further read-only review of the pinned installed code found specific defects
beyond the generic class-instance serialization limitation. The original public
wrappers remain excluded. Subsequent bounded native adapters now cover Text,
Wire/Bus and filtered PCB net membership; their narrowed contracts and connected
evidence are listed in the [current inventory](api-coverage-inventory-2026-10-10.md).
The defect evidence below does not itself validate those replacements.

- In `pro-api/0.2.53.aee2f57a/api.js`, `SCH_PrimitiveBus.get` and `getAll`,
  and `SCH_PrimitiveWire.get` and `getAll`, catch RPC exceptions. The singular
  getters return `undefined` without a retained result; enumeration returns an
  empty array. These failures are indistinguishable from missing objects. The
  class getters themselves are simple projections, but that does not repair the
  wrapper's lost error evidence.
- The same file's `s0` text wrapper publishes `api/getText` or `api/getAllText`
  and returns a callback-populated local without awaiting completion. Its
  singular array overload filters undefined entries. All three text readers,
  including `getAllPrimitiveId`, need an awaited, bounded native projection.
- The public PCB point, region and all-selected wrappers skip native `Text`
  and default switch cases. Point lookup returns the first surviving mapped
  item, which need not be the first native hit. Region and selection results
  can be incomplete even when two samples match. Generic class serialization
  and active-context checks cannot reconstruct identities already discarded.
- In `pro-pcb/3.2.149.5378b690/js/pcb.js`, the
  `pcb/extensionAPI/pcbnet-getAllPrimitivesByNet` handler assigns `c = l.model`
  and checks `primitiveTypes.indexOf(c)`. The documented filter contains enum
  values, not model objects, so a nonempty filter drops matches. With an absent
  or empty filter the handler projects `my(l)`, native DTOs whose fields and
  units differ by family, instead of constructing the declared SDK classes.
  `my` invokes family-specific `toJSON` methods and therefore needs a complete
  delegated-serializer review before admission. The official method still
  declares an optional primitive-type filter and primitive-object array.
  [Official net membership getter](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_net.getallprimitivesbynet.html).

The public API source SHA-256 is
`5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc`,
already pinned by `public-sdk-read.ts`. Review anchors are the Bus getter RPC
strings, Wire getter RPC strings, class `s0`, the PCB point/region methods,
`getAllSelectedPrimitives`, and the native net-handler topic above. These
findings justify narrower implementation work, not permanent infeasibility.

The editor split-screen lookup pair now has a dedicated read-only adapter in
`server/src/editor-tab-lookups.ts`, reached through `sdk-read` rather than the
generic descriptor compiler.
The pinned UI's `S2.getSplitScreenIdByTabId` calls `fe.getTabContainer`, a
container lookup. `S2.getTabsBySplitScreenId` filters the container's tabs and
deep-clones them. Neither path navigates, activates a tab or saves. However,
`getFilterTabs` returns an empty array when a requested container is missing,
and the returned raw tab data can describe unrelated projects. Official docs
also allow an empty result for a non-leaf split-screen node.
[Tab lookup](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_editorcontrol.getsplitscreenidbytabid.html),
[split-screen lookup](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_editorcontrol.gettabsbysplitscreenid.html).

The adapter binds the complete saved-project member set and validates every
public tree identity and owner before and after the direct method call. Its
scope is project-owned schematic pages, PCBs, footprints and ordinary symbols
whose saved `META.docType` is 2. It requires one unique existing owned tab or
one unique nonempty leaf, and compares the method result with that complete
tree projection. The tree is bounded to 128 nodes, depth 16 and 256 tabs.
Missing containers, unknown owners, duplicate identities, changed membership
and unsupported document types refuse. Only identity, type and parent-owner
fields are returned, never raw titles or tab data. A canonical Start Page may
coexist but cannot be the selected tab; the native public tree already omits
the hidden project placeholder.

Authenticated runtime admission, native branch/history checks, unchanged full
checkpoint membership, active-context checks across awaits and two identical
observations are all required. Final pinned-implementation checks remain part
of the read. No navigation, preference write or Save is invoked. Focused tests
exercise the fixed reader and its coordinator; they are offline evidence, not
current-generation live validation. Merely assigning generic `string` or
`records` result descriptors would not establish these ownership proofs.

These lookups help choose an exact already-open disposable tab. They do not
create a fixture or solve Start Page setup: the SDK-read path accepts only
document types 1 through 4 and requires an active design context. Broader
Start Page inspection belongs in the separately process-bound native/editor
bootstrap workflow, without weakening the design reader's context guard.

## Exports and practical limits

The existing executor had admitted its typed export actions through a bounded
file-transfer path. Deeper delegated-source review found six hidden-Save paths:
schematic netlist, schematic BOM, schematic document, PCB BOM, PCB PDF and PCB
netlist. They now refuse before dispatch; the schematic netlist can also
annotate designators and Unique IDs. The simulation export separately refuses
because its installed handler requires an unsupported NGSPICE editor.
[The independent review](api-coverage-review-2026-10-10.md) records complete
call chains, hashes and function boundaries, including the impact on the former
schematic-topology reader. Returning a File is not evidence of a read-only
method.

These are the seven refused export actions included in the 41-action count
above; interactive BOM is one of the eight separately named gaps, not an eighth
entry in this table.

| Exact action | Installed blocker | Feasible replacement boundary |
|---|---|---|
| `export.schematic.netlist` | Annotation can change DESIGNATOR/UNIQUEID, then SaveAll. | Nonmutating complete topology/format projection, or a separately authorized annotation and whole-scope Save transaction. |
| `export.schematic.bom` | Shared BOM helpers invoke SaveAll before generation. | Source-bound component/property projection with explicit grouping/filter rules, or an authorized no-repeat Save lifecycle. |
| `export.pcb.bom` | Shared BOM helpers invoke SaveAll; template selection can change preferences. | Nonmutating board-scoped BOM projection without global template mutation. |
| `export.schematic.document` | Export immediately awaits the global SaveAll helper. | Separately reviewed renderer with complete page scope and owned output resources. |
| `export.pcb.pdf` | The PDF helper invokes global SaveAll before rendering. | Nonmutating board renderer with bounded settings and complete output evidence. |
| `export.pcb.netlist` | Any dirty editor tab triggers SaveAll, including unrelated tabs. | Single-board nonmutating netlist extraction; a prior non-atomic clean check is insufficient. |
| `export.schematic.simulation` | Native handler requires an NGSPICE editor, outside admitted types 1–4. | Explicit simulation-editor ownership, bounded export and an appropriate disposable simulation fixture. |

For the remaining admitted formats, transfer requires a real nonempty File,
bounded filename/type, complete byte count,
canonical base64 chunks, a matching SHA-256 and an exclusive managed artifact.
The current single-dispatch cap is 2 MiB, although the descriptor schema can
describe larger requested files. Larger exports need a tracked chunk service
with a lifetime-bound file handle and hash, not a raised JSON transport limit.
The existing 3D export rejects automatic model generation because that option
can create library data outside a read-only export transaction. These are
explicit runtime constraints in `library-runtime.ts`, not unsupported SDK
methods.

Interactive BOM is separate for the concrete asynchronous UI behavior described
above. STEP/OBJ, IPC-2581, Gerber/drill and placement exports still
need content-format checks and operation-specific fixture runs before release
approval. A file hash proves byte identity, not manufacturing correctness.

## Implemented document activation

[document-activation.ts](../plugins/easyeda-pro-control/server/src/document-activation.ts)
implements the existing `document.activate` schema through the tracked library
executor. It accepts an exact already-open tab belonging to the current saved
project. It does not open a missing tab or navigate to another project.
An already-active target refuses before journal creation. The pinned native
method resolves early for this case but continues scheduling its tab callback
and timer, so a context read is the supported way to confirm an active tab.

The pinned public API `0.2.53.aee2f57a` forwards the method to UI
`3.2.149.43637efe`, whose reviewed SHA-256 is
`12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a`.
`S2.activateDocument` checks `isOpenTab` and awaits `setTabActive`.
The latter registers a tab-active callback, sets a five-minute native timeout
and publishes a simulated tab click. Its completion is event-based, so the
adapter does not infer selected context from the Boolean acknowledgment.
The documented method promises a Boolean and input focus on the requested tab.
[Official activateDocument contract](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_editorcontrol.activatedocument.html).

The adapter journals its checkpoint-derived membership plan before dispatch.
The fixed generated program enumerates every split-screen leaf and refuses
malformed, empty, duplicate, unknown-owner or foreign-project tab entries.
An empty leaf is ambiguous in this build: `getFilterTabs` also returns an empty
list when the native container entry is missing. Both the original and target
tab must be present. No title-based lookup or caller-defined code is accepted.
[Official split-screen tree contract](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_editorcontrol.getsplitscreentree.html).

Tab presence alone does not prove a loaded editor. The pinned UI and schematic
click handlers lazily open documents whose native frame is absent. The adapter
therefore binds both existing frame objects by `frame_<tabId>`, connection,
`c_dbid`, native type and element tag before activation, then requires the same
objects throughout observation. Schematic and symbol model-tab aliases refuse.
The schematic source hash `3f50136fb4ba2d5593beac7ef3e20ebe5275177b56bbcfdd297e79f176a6618f`
is verified alongside the UI source before, after and during recovery.

PCB and footprint activation has another native branch: when the stored
`pcbCommandTab` preference is false or absent, the click handler writes account
preferences. The adapter only reads bounded UI local-storage JSON and requires
this field to be exactly `true`; it never enables or changes the preference.
False, missing, malformed and non-Boolean values refuse before activation.
These guards exclude the reviewed lazy-open and preference-write branches;
they do not describe all native UI effects as side-effect-free.

After one activation, only a missing document or the exact original document
may wait for readiness. A third document, conflicting alias, wrong type or
wrong owner stops immediately. Two exact target observations must agree with
the complete original tab inventory, within a 15-second observation deadline.
The executor independently rechecks context and target source, waits for
scheduled uploads and compares every durable project record and the complete
logical SQLite dump. The adapter never calls design Save, close or open; normal
native selection, focus and measurement-tool cleanup remain part of activation.

Recovery uses the original retained plan and checkpoint. It classifies one
independent context observation, then reproves that same exact context. A
failed target assertion cannot be hidden by probing the original tab instead.
With no outstanding
orphan risk, it can prove either the target is active or the original tab is
still active and the entire durable project is unchanged. It does not infer
an acknowledgment when return evidence is missing. `reconcile-no-mutation`
means no design/database mutation, not that the active tab could not have
changed. The result explicitly reports `targetActive`; it never redispatches
activation, opens a tab, saves or marks the editor reopened.

The shared library executor also verifies the baseline again after expensive
runtime and implementation admission. `sourceChanged:false` is insufficient:
a corrupt checkpoint can report that flag too. Preflight, final admission,
completion and recovery now require the complete positive verification and
the exact retained receipt, source, checkpoint and hashes.

## Evidence in this change

The earlier integrated metadata, activation, checkpoint, executor, library-runtime,
library-recovery and editor-tab run passed 73 tests on Node 24.18.0. Those tests exercise the actual executor and
generated program with real temporary sealed journals, including publication
failure, missing returned evidence, rewritten preparation and no-repeat recovery.
Targeted type-aware Oxlint reports zero diagnostics. This report and the adapter
contain no connected test claim.
The later close-focused run passed 57 close/settlement/retained-authority tests;
the broader close, activation, page-rename, recovery and diagnostic run passed
178 tests with zero failures or skips. The latter counts are overlapping runs,
not additive repository totals. Strict TypeScript and targeted type-aware
Oxlint passed for the close implementation. Empty-page creation has its own
focused suite; final combined counts belong in the release verification record.
Publication, installed-package verification and live fixture results belong in
the release record after they actually complete.
