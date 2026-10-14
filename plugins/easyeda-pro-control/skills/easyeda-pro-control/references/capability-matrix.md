# Capability matrix

Use supported typed APIs first. Native controls cover genuine API stubs and dialogs. This matrix describes the current source package; an older installed snapshot may not contain these tools. Historical external-tuple admission and installed-generation evidence do not admit this new source. Exact reads and typed operations still require their pinned implementation identities and operation-specific proof.

Current safety restriction (October 10): schematic compiled topology is disabled.
The installed netlist File getter can annotate components and invoke Save All.
All schematic transactions or recovery paths needing that reader stop at the
missing proof; do not bypass it with UI export or a generic SDK call. Schematic
netlist/BOM/document and PCB netlist/BOM/PDF exports are also refused because of
hidden Save All. Simulation export requires an unsupported NGSPICE editor.
Historical observations below do not override these current restrictions.
Separate sealed single-page display and wire-reroute observers avoid that
compiler, but their transactions are also blocked by the later structure-job
finding below. Their retained contracts are not execution exceptions.
PCB/footprint navigation also needs passive preference-side-effect admission.
See [native navigation limits](native-ui.md#navigation-preference-side-effects);
project-file invariance does not cover global preferences or backup pruning.

The source inventory classifies 774 method paths as 212 public subsets, 29
native equivalents, no lifecycle-only, 82 implemented-but-blocked and 451
omitted. It maps 321 runtime-guarded available routes, 94 blocked routes and
two partially blocked routes. The fixed SDK-read catalog has 182 entries,
including 21 native equivalents. These counts describe implementations, not
whole-method live validation or admission of the installed host.
The legacy-compatible catalog has 40 tools; the restricted current-version
catalog has fifteen, with separate exact admission for each live capability.

Eight symbol/page/container metadata-writing routes are also blocked pending
operation-owned structure-job completion and exact SQL-effect proof. Historical
document-record tests below do not prove that later-discovered requirement.
See [the exact restriction](libraries-and-eco.md#structure-write-completion-restriction).
Pure schemas and historical evidence remain readable; a nonterminal affected
journal cannot become complete through ordinary reconciliation.

The same job is scheduled when native Save republishes pending geometry without
its pending flag. Schematic-page, symbol and PCB design transactions are therefore
blocked too, including the sealed display and wire profiles. New apply, Save,
inverse, repair and nonterminal reconciliation refuse. Footprint transactions
retain their separate guards. The design descriptions and historical results
below describe retained source contracts, not execution support for types1/2/3.

| Capability | Controlled path | Current boundary |
|---|---|---|
| Current PCB loaded-view geometry | pcb_geometry; api pcb-geometry/pcb-geometry-validate | Line/Arc/Via geometry and basic Component/Pad placement on one exact active ordinary PCB. getAll uses empty arguments; get accepts a distinct primitiveIds array and returns all requested rows in caller order or refuses. Both retain complete-family validation, captured native receiver, two matching ordered observations, at most256rows and384KiB. Native mil/degree fields; no full shapes, pad holes/rules, libraries, child mapping or SDK object parity. No saved membership, ownership, connectivity or persistence proof. Installed180500 Component/Pad getAll passed one nonempty disposable case; new get routes remain live-unvalidated |
| Current PCB loaded-view identities | pcb_identities; api pcb-identities/pcb-identities-validate | Selected IDs or unfiltered Line/Arc/Via/Component/Pad IDs; positive type lookup remains Line/Arc/Via-only. Explicit target and captured native receiver, two matching ordered samples. No stored membership, ownership, geometry, connectivity or persistence claim; missing/ambiguous IDs refuse. Current connected validation pending |
| Local historical abandonment | history; api history/history-validate | Exact sixteen-event closed-symbol validation marker-read boundary only. Requalifies retained history/claim/checkpoint and unchanged source before exclusive sidecar publication; preserves journal and permanent claim. No bridge, restart, process closure, completion or replay. Six-event baseline and generic recovery remain unavailable in restricted mode |
| Offline SDK and exact operation reference | api sdk/operations/validate | 749 reviewed / 806 latest official declaration signatures; exact strict design/library schemas and offline custom-refinement validation; no SDK invocation or runtime admission |
| Ordinary current-version startup | launch | Fixed no-argument executable with exact installed code/helper pins, explicit existing-profile effects and durable attempt tracking. Retained root/Job termination or separately acknowledged supervision abandonment can permit consideration of a new-ID launch. No isolation, bridge, Start Page, navigation or CAD claim |
| Current disposable project/PCB opening | project_open; api project-open/project-open-validate | Already registered local disposable file, exact raw-path hash/original source digest, checkpoint-member default-branch PCB, initially empty editor and retained ordinary launch. Public project/document calls run once with orphan tracking. Normal opening may migrate data, replay caches and automatically Save. Inspection/observation never navigate. Terminal retirement requires original root/Job termination and exact session closure; no writer, persistence or full-initialization claim. Connected opening pending; read [the opening guide](current-project-opening.md) |
| Application presence after facade restart | launch observe-application | Existing historical operation required; two matching same-name process reads through the pinned diagnostic helper. Historical state stays unchanged. Presence can belong to another installation; absence grants no original-Job termination proof, recovery or relaunch authority |
| Explicit ordinary-supervision relinquishment | launch abandon-supervision | Successful historical launch and inspected digest, no current retained owner, explicit acceptance of unobserved descendants, two absent samples and unchanged admission/journal. Exclusive abandonment receipt preserves history and consumed ID. Not termination/design recovery; unknown dispatch remains blocked. Only a separately confirmed new ordinary startup can follow |
| Current editor-shell observation | editor_shell | Bounded container/tab counts and registered Start Page flags on separately pinned API/UI; two stable samples, no titles/paths/document IDs. No visibility, restored-state completion, project closure or navigation authority |
| Current identity-only context | editor_context | Bounded active ordinary document and UI project/branch identity metadata; explicit no-document/unsupported states, no titles/paths/content. No manager/database ownership, persistence or later-operation authority; not legacy context admission |
| Current PCB layer metadata | pcb_layers; api pcb-layers/pcb-layers-validate | Explicit active ordinary PCB project/branch/document/tab, captured native receiver and two matching complete layer samples under current API/UI/PCB pins. Nine-field layer projection or enabled native SIGNAL/PLANE plus two; raw colors preserved. Native equivalent, not public-wrapper execution. No layer selection, navigation, Save, physical-stackup or ready-state proof; connected validation pending |
| Current configured shortcuts | shortcuts; api shortcuts/shortcuts-validate | Fixed public getShortcutKeys query; optional includeSystem defaults false. Preserves raw key strings and shortcut-specific scope enums under complete bounded double samples and API/UI pins. No keypress, registration, focus/executability or complete inventory claim; source-tested, connected validation pending |
| System-library LCSC lookup | Discovery only; omitted | Current desktop network-disabled fallback reaches the local device-update router. Concurrent library refresh can expose a physical system-library database to initialization/migration. Renderer checks cannot atomically rule out this path; a remote-only adapter or scoped library-effects contract is still required |
| Connection and active context | status, context | Authenticated responsive session, exact project path/UUID and document/type/tab |
| Existing project/document open | runtime open-existing | Saved PCB or schematic page; exact registry/checkpoint membership, exclusive-tab guard and complete unchanged SQLite proof. Imported SYMBOL/FOOTPRINT header provenance is retained and compared; installed083400 passed a disposable12document open. Later generations require separate admission. No creation, save, discard or replacement |
| Exact schematic components | exact_read | Stable double samples with fixed public projections; schematic-topology disabled pending a verified non-mutating replacement |
| API coverage and fixed reads | api coverage/sdk-reads/sdk-validate, sdk_read | Complete per-method inventory; fixed schemas and explicit public/native implementation labels; bounded observations, not complete source or persistence proof. Generation-specific cases below do not validate the full allowlist or newer source |
| System-library identity | sdk_read, lib_LibrariesList.getSystemLibraryUuid | Empty arguments; one nonmissing 32-character lowercase-hex UUID from the pinned public implementation. Malformed or absent result refuses, with no hardcoded fallback. No account/library enumeration, asset access or write authority. Installed204104 passed one disposable read with matching observations and unchanged native/source/checkpoint evidence; later generations require separate admission |
| Configured font titles | sdk_read, sys_FontManager.getFontsList | Native title-only equivalent, empty arguments and one exact ordinary active tab. Own data fields and retained UI/project/tab/path owners; missing configuration refuses, without the public false-empty fallback. Preserves order, duplicates, empties and case; at most 512 titles, 1024 UTF-16 units each and 131072 combined. No preference writes, account/persistence identity, OS-font inventory or rendering proof. Installed220050 passed one ordinary schematic case with unchanged native/source and complete saved checkpoint; other document types and later generations remain separate |
| Schematic Text/Wire/Bus IDs | sdk_read, getAllPrimitiveId | Native ID-only equivalent on an ordinary active type-1 page; empty arguments only, no Wire net filters or symbol/block-instance scenes. Complete reciprocal tree/index proof and source-backed root-family membership; generated frame descendants excluded, structural GROUP records refused. Two stable observations, no callback/compiler/Save. Group IDs are not LINE IDs. Offline-tested; connected validation pending |
| Schematic component property names | sdk_read, sch_PrimitiveComponent.getAllPropertyNames | Native key-only equivalent on one ordinary page; complete root Symbol/attribute-map/tree/index proof, including inherited/generated frame/flag keys. No values, compiler, source serializer or Save; unsupported ownership/groups refuse. Exact sorted bounded strings, not all-pages or persistence proof. Connected validation pending |
| Deprecated schematic selected-ID getter | sdk_read, sch_SelectControl.getSelectedPrimitives_PrimitiveId | Explicit equivalent using its documented public replacement getAllSelectedPrimitives_PrimitiveId. Exact ordinary page/readiness/receiver checks, bounded ordered unique IDs, two stable samples. Never calls the obsolete iframe route, which can falsely return an empty list. Selected line children resolve to parent groups; no complete ownership or persistence claim. Installed071500 passed one selected ordinary component; later generations and other selections remain separate |
| Ordinary symbol Pin enumeration | sdk_read, sch_PrimitivePin.getAll | Native single-PART membership plus explicit public-getter parity; 256-Pin bound, exact standard attributes, generated-dot ownership and reproof around awaits. Custom attributes/multipart/device/no-connect/junction cases refuse. Getter rotation is not stored rotation; JSON normalizes signed zero. Connected validation pending |
| Schematic Text state | sdk_read, sch_PrimitiveText.get/getAll | Complete bounded ordinary page-root Text membership and 14 native scalar fields. Exact selected IDs or all roots; sorted arrays, native Y/null/style/alignment semantics, no public-getter parity. Synchronous reproof plus two facade observations; no compiler, serializer or Save. Installed223200 fixture evidence below; new-generation connected admission pending |
| Schematic Wire/Bus state | sdk_read, sch_PrimitiveWire/Bus.get/getAll | Root NetGroup DTOs retain every line's native points/styles, all literal NET names and custom attribute IDs. Complete bounded reciprocal tree/index/source/child proof; no public wrappers/compiler/serializer/Save, no net filters or resolved-net claim. Installed010000 nonempty fixture evidence below; later-generation acceptance remains separate |
| Mixed schematic ID lookup | sdk_read, sch_Primitive.getPrimitiveByPrimitiveId / getPrimitivesByPrimitiveId | One literal ID or 1–256 unique IDs in caller order. Only ordinary-page root Text and Wire/Bus NetGroup DTOs; one retained page/tree/index/source capture checks all modeled families before selection. Complete-family and combined-string bounds apply. Any missing, unsupported, descendant or wrong-owner selector refuses the whole call. No SDK instances/all-property parity, compiler, Save or complete source/connectivity/persistence proof. Installed204104 passed one root Text and one populated Wire through singular/plural reads and both orders of their two-item selection; Bus, invalid selectors and later generations remain separate |
| Filtered PCB net membership | sdk_read, pcb_Net.getAllPrimitivesByNet | Explicit Line/Arc/Via/standalone-Pad/ComponentPad filters and nonempty net only. Complete requested-family source/inventory correspondence before filtering, component-pad ownership and two matching source/inventory/source cycles. Full observed tab/owner context required. Identity records, not public classes/connectivity/persistence. Installed071500 passed populated ComponentPad/Via, lowercase matching and empty Pad/Arc cases; Line/type coverage remains pending |
| PCB primitive type | sdk_read, pcb_Primitive.getPrimitiveTypeByPrimitiveId | Existing literal ID only; complete all-five-family source/inventory proof, including empty-net objects. Returns Line/Arc/Via/Pad/ComponentPad; missing, other-family and colliding IDs refuse without an absence claim. Native equivalent of an installed empty stub; two cycles/runtime/context checks, connected acceptance pending |
| PCB active layer | sdk_read, pcb_Layer.getCurrentLayer | Empty arguments, ordinary project PCB and full observed tab/owner context only. One canonical ACTIVE_LAYER and complete bounded source are matched to the public all-layer list across two source/list/source cycles. Selected name/type/visibility/use/lock must agree; raw bounded color strings are not validated CSS. No public-stub invocation or layer change. Installed071500 passed Top Layer 1 with complete saved/native invariance; later generations remain separate |
| Selected PCB source objects | sdk_read, pcb_SelectControl.getAllSelectedPrimitives | Empty arguments; complete ordered source DTOs for root Line/Arc/Via/Pad/Component/String plus direct source ATTRs. Two source/IDs/inventory/IDs/source cycles, complete owning-family membership and no generated pours. Any unsupported or ambiguous selected ID refuses the whole result. Not public classes, inherited footprint geometry, atomic selection or saved-file proof. Installed20261011150000 passed empty selection and one original STRING with saved-fixture invariance; other families and newer optimized code remain separate |
| Explicit-ID PCB source objects | sdk_read, pcb_Primitive.getPrimitiveByPrimitiveId / getPrimitivesByPrimitiveId | One exact ID or 1–256 unique ordered IDs; same six supported root families and direct ATTRs, complete owning-family proof and two source/inventory/source cycles. No selection reads, public class instances, missing-ID success or partial results. Installed164600 passed singular and one-element plural reads of one standalone STRING with no direct ATTRs; other families, multi-ID ordering and later source remain separate |
| Visible and region canvas capture | capture, easyeda_canvas_capture / easyeda_canvas_capture_region | Existing public image and zoomToRegion calls on the explicit active tab, bounded PNG and managed evidence; before/after runtime/context proof. Region mode changes viewport. No standalone zoom, native receiver identity, complete-design or visual-acceptance claim |
| Polygon splitting | sdk_read, pcb_MathPolygon.splitPolygon | Bounded JSON complex-polygon groups, temporary SDK constructors and exact ordered source-array output with duplicates retained. No native handles or CAD mutation; shared aggregate limits apply. Offline-tested including pinned constructor bodies; connected validation pending |
| Owned editor tab/split-screen lookup | sdk_read, getSplitScreenIdByTabId / getTabsBySplitScreenId | Exact existing selector, complete bounded owned tree and saved project membership; identity-only direct result checked against the tree before/after, two matching samples and unchanged checkpoint/context. No foreign projects, empty leaves, title/data export, navigation or current-generation live claim |
| Single-page stored display changes | design sch.layout.batch, sealed flat-display profiles | Existing literal-ID attribute/text display patches only; complete inverse, unchanged endpoint topology, sole page of one ordinary schematic and full saved-project proof. V1 remains strict; v2 additionally seals unchanged imported-library header occurrences from immutable checkpoints at every lifecycle gate. No electrical edits, NO_CONNECT, creation/deletion, translation, non-display steps or historical repair/page loading. Installed083400 passed a nonempty Designator-coordinate forward/reverse Save/reopen; unsaved rollback and newer generation remain separate. See schematic.md |
| Closed PCB/schematic rename | library document.pcb.rename / document.schematic.rename, blocked | Retained title-only schema, frame/record proof and historical120000 cases do not prove the delayed structure-table effect or job completion. No new execution or potentially dispatched terminal reconciliation. See libraries-and-eco.md |
| Historical presentation-only schematic batch | design sch.layout.batch, compiled profile | Currently blocked by the compiled reader. Historical translation, wire/label edits and flag clones passed selected saved/reopened checks, but that does not enable this route now |
| Single-page wire rerouting | design sch.wire.modify, sealed flat-wire-reroute.v1 | Existing unlocked named WIRE endpoint changes only; every LINE ID/count/style, ATTR field and child order preserved. Complete flat topology and contact-incidence multiset, fixed pin/foreign contacts and generated-marker index proof. No shared-WIRE endpoints or pin-bearing junctions. Exact ID-to-segment inverse only while durable baseline remains unchanged; one-shot Save/reopen and full peer proof. Installed220050 passed one three-segment forward/reverse saved/reopened pair with omitted lock and complete 12-document proof. Not unsaved rollback or original-history restoration; other shapes and later generations remain separate. See schematic.md |
| Historical compiled wire geometry | design sch.wire.modify, compiled profile | Currently blocked by compiled topology. Sept25 disposable lifecycle/retained-Save evidence belongs to that older profile and does not admit the new sealed wire route |
| Retained split-wire layout repair | design repair-layout-wire-groups | Exact original island/drop/flag identities only; S06 correction and retained Save reconciliation completed live with original topology restored; consumed repairs must never be replayed |
| Recovery schematic page loading | design load-layout-pages | Unfinished layout or restored standalone wire baseline; one-shot sibling navigation, no Save, original topology and unchanged active native state required; restored-wire recovery passed nine-page loading and 850-document reconciliation, not writer validation |
| Exact PCB components/inventory/rules | exact_read | Direct-pad authority and global pad-parent correlation; known adapter-normalized fields remain documented in compatibility.md |
| Native source and schematic state | exact_read source/native profiles | Lossless bounded document records; volatile export DOCHEAD fields excluded; native hidden component state retained where public mappers omit it |
| PCB component pose/layer/lock | design | Typed effect plus attached records and whole-source comparison |
| PCB component / footprint 3D transform | design, pcb.component.model-transform / footprint.model-transform | Exact existing `3D Model Transform` ATTR value only; typed legacy mil/degree fields or native v2 affine; lock ancestry and full source/durable invariants; connected validation pending |
| PCB line/arc/via/pad/polyline/region/pour/fill create/modify/delete | design | Only representable installed source profiles; unsupported shapes fail before dispatch; create IDs are journal-owned; exact inverse not universal |
| Standalone PCB text | design, pcb.text.create / modify / delete | Top-silkscreen default-font STRINGs with bounded ASCII and four-decimal native mil. Modify preserves exact null/black; v2 create fixes explicit black and one journal-owned ID. Creation inverse deletes that ID; delete has no inverse. Creation-only retained-Save proof never repeats Save or navigation, with a separate narrow legacy cached-decoder proof. Complete source/persistence and receiver guards remain. Installed131000 forward/reverse modify passed saved/reopened proof; installed20261011150000 completed its legacy create recovery without repeating Save. Installed164600 separately passed one v2 create and its saved deletion, each with one Save/close/reopen and complete 11-document proof. Not an unsaved inverse test. See pcb-geometry.md and failure-recovery.md |
| Multiple PCB operations | design, pcb.batch | 1–256 sequential typed effects; geometry-only source merge or ordered source-bound public steps when rules are included; prior create references; initially locked records and descendants protected; no stack/rebuild inside batch |
| Net classes, differential pairs, equal-length and numeric rule collections | design | Typed collection/source adapters; support depends on exact representable records, not arbitrary rule JSON invocation |
| Physical layer stack | design, pcb.stack.replace | Complete typed physical layer list and enabled copper IDs; preserves existing native IDs/unknown metadata; native thickness quantization is explicit |
| Derived copper | design, pcb.pour.clear-derived / pcb.pour.rebuild | Separate selected-parent clear and rebuild with scoped derived geometry proof; source merge cannot silently rewrite existing derived copper |
| Schematic component properties and supported geometry | design | Native hidden properties preserved; per-family source proof; declarations that are SDK stubs remain refused or use a specific maintained adapter |
| Schematic net labels and no-connect | design, supported electrical adapters | Typed native paths for genuine SDK gaps, exact record and topology consequences; no generic private invoke |
| Library metadata | library capabilities/execute | Double-sampled supported metadata operations |
| Closed symbol creation/metadata | library.symbol.create / library.symbol.modify, blocked | Schemas and pure META/header/peer proofs retained. Missing exact structure-table delta and operation-owned native completion; historical194400/182554 observations do not supply those witnesses |
| Closed schematic-page creation/rename | document.page.create / document.page.rename, blocked | Parent-only creation and closed-sibling rename contracts retained for offline review. Both native META paths schedule an unproved structure job; no new execution or dispatched-result completion |
| Closed free-PCB creation | document.pcb.create, blocked | Retained absent-boardName, META-only and raw-peer-chain contract. Historical120000 document proof does not cover the delayed structure SQL/job lifecycle |
| Closed schematic-container creation | document.schematic.create, blocked | Retained free-container, local-symbol-reference and raw-peer-chain contract. Historical164600 document proof does not cover the delayed structure SQL/job lifecycle |
| Already-open document activation | library, document.activate | Exact checkpoint-member current-project tab and complete tab ownership; PCB/footprint target requires existing pcbCommandTab=true to avoid a shared-preference write and possible backup pruning. One activation, two coherent target observations and unchanged saved database; no setting change, reopen or current-generation connected claim |
| Inactive clean document close | library, document.close | Ordinary symbol (2), PCB (3) or footprint (4) target with a separate clean PCB/footprint active; exactly two owned project tabs, one unsplit container. Await terminal tab/frame cleanup and prove unchanged active source/context and complete logical database. No Save, reopen, exact inverse or current-generation live claim; post-dispatch failure remains quarantined until retained runtime termination |
| Project footprint library create/modify | library | Scoped current-project record proof; save and reopen facts reported separately |
| Project DEVICE creation | library, library.device.create | One device bound to existing project symbol/footprint; no asset import/copy; complete durable addition and unrelated-record proof; no editor reopen claim |
| Project DEVICE association editing | library, library.device.modify | Association-only patch; existing metadata preserved; inherited placed-instance binding changes refused; no PCB footprint rebuild or implicit ECO |
| Existing external 3D model binding | library, supported DEVICE create/modify | Exact 32-hex model and collection identities; double-sampled metadata and pre-write recheck; changes binding/title only, not model file or transform |
| Project DEVICE model transform | library, library.device.model-transform | One stored DEVICE META transform; exact acknowledged inheriting SCH/PCB instance list; preserves all stored placement records and model bindings; saved record proof is not reopened or mechanical proof |
| Library recovery | library inspect/recover-authority/open-target/rebind-runtime/reconcile | Immutable plans/returned IDs; never redispatch or infer reopened geometry. The eight blocked metadata writers cannot complete potentially dispatched reconciliation. Terminal inspection and exact undispatched-preparation invalidation remain available. Standalone close recovery only observes target presence; no close/open/activation retry |
| Project footprint geometry | design, footprint operations | Exact-owner native history handlers, no full-source decoder; actual created IDs; identity-preserving modifies and explicit shape delete/create; full source/save/reopen proof; PAD tool-default effects documented |
| Project symbol geometry | design, type-2 schematic graphics | Existing single-part circle/rectangle/text/pin/attribute edits; explicit compiler save and exact library reopen; unsupported pin rotations refused |
| Other library and project lifecycle operations | library capabilities | Asset import/copy/delete and metadata changes outside supported profiles remain refused; inspect the actual execution-enabled action |
| File exports | library, supported export entries | Bounded in-memory file transfer to exclusive managed artifacts; hidden-Save routes listed above refused; fabricationApproved is false; inspect actual capabilities |
| Draft PCB DSN route context | export | Active-context/best-effort descriptor-bound artifact; not route/fabrication approval |
| Native windows/dialogs | native_ui | Discover exact installed process, inspect current handles, confirmed focus/pointer/keyboard input and normal-close. Installed204104 passed one pointer-only hover with a separately observed overflow-menu effect. Input acknowledgments do not prove canvas snapping, wire creation or saved results; each workflow needs its own evidence. No bridge needed for bootstrap; observed-unowned is not Job authority |
| Itemized native ERC/DRC | check run | Fixed reviewed calculation, complete live calculation-scope snapshot, full saved SQLite invariance, itemized managed report; both fixture paths passed, current enabled rules only |
| Route lengths, paths, skew and widths | check route-audit | Stable exact source/pad inventory; planar lengths and typed width contracts; ambiguous contacts and omitted barrel delay remain indeterminate |
| Schematic-to-PCB ECO | native dialog workflow | Inspect scope/rows/options; applying an ECO requires separate full identity/net audit |
| Canvas and desktop captures | capture / native_ui capture | Managed visual evidence; canvas path has full PNG validation; desktop capture is not geometric, connectivity or persistence proof |
| Design commit | design commit | Durable no-repeat Save intent, save/reopen, source readback and exact complete selected-branch durable delta; unrelated library/documents invariant; retained recovery is operation-specific |
| One-request design completion | design execute | Apply then commit only its verified non-orphan result; same proof gates and retained failure journal; no retry or automatic inverse |
| Design rollback | design rollback | One-shot exact inverse and fresh desired-state proof; flat display and wire profiles additionally require unchanged durable baseline immediately before dispatch. Queued-upload completion is not a Save or guaranteed persistence flush. Full live/durable restoration required before terminal; delayed persistence can be reconciled read-only. Never repeats an inverse or saves afterward |
| Runtime and orphan recovery | runtime / typed recover-authority | Retained Windows Job, authenticated native process ownership, immutable dispatch capture, old termination and replacement-session proof |
| Checkpoints and evidence | checkpoint / evidence tools | Read-only SQLite online backup, quick_check, managed hashes and receipts; checkpoint creation is not database restore |
| Legacy writer endpoints | runtime-disabled | plan/apply/verify/rollback/save_reopen remain refusal endpoints; use design instead |
| Raw JavaScript, automatic database restore, fabrication submission | unsupported | No unrestricted-code switch or implicit purchasing/manufacturing authority |

## Reported live coverage

Installed `0.3.0+codex.20261013201500` completed ordinary existing-profile launch,
then separately authenticated and observed the registered Start Page. The
identity reader returned Start Page, undefined project and empty branch fields
under the same before/after fingerprint. No project was deliberately opened.
The shell response is bound to
`c00242a36d07dd88424fbf51f2dcda85e94ffbede029d15a2c81bc4c48aab44e`
and context response to
`bad904f7c3700c48674c1ac6f8b8356ce939171e6bbfe5507b7cc54e022b69dd`.
These observations prove neither visibility/focus nor restoration completion,
project closure or persistence. They do not validate the new shortcut reader,
the shared UI-verifier refactor or other context states.

Installed220050 passed one configured-font-title observation in an ordinary
schematic and a named three-segment wire's forward/reverse Save/reopen pair.
Independent source/native and full-project proof retained all 12 documents,
11 peers and 66 imported atom-header occurrences. The reverse restored source
geometry, not original SQLite history. Independent raw contact reconstruction
covers before/apply/pre-Save, while final source/native/persistence and a fresh
native read were independently verified; the executor did not retain its final
raw flat observation. Unsaved rollback and later generations remain separate.
Offline reader discovery now indexes nine historical cases with exact scope,
generation and exclusions. The index does not grant current execution authority
or whole-method validation; absence means no indexed case, not never tested.

Installed204104 passed the system-library UUID reader and both mixed schematic
ID readers selecting one existing root Text and one populated Wire, including
both caller orders of their two-item selection. Every DTO field matches source
and immutable stored records. Complete before/after native state and the saved
checkpoint stayed unchanged. Bus and invalid-selector cases remain separate.
One confirmed hover also opened the overflow menu, proved by separate managed
before/after images. These cases are bound to runtimec4d9b324, not later source.
The native-created named wire seed subsequently passed Save and reopen proof,
with all original records and peer documents preserved. This is fixture setup,
not a sealed reroute test. The later220050 cases above provide separate evidence
for the configured-font reader and one corrected wire-adapter profile.

Installed164600 passed singular and one-element plural explicit-ID PCB reads of
the same original standalone STRING with no direct ATTRs. Independent retained
receipt verification and complete-baseline parsing matched every DTO field and
both source/inventory/source cycles. No public stub, selection change or Save
was used. This tests one STRING, not multi-ID ordering, other families or live
missing-ID refusals.

That generation then completed one explicit-black v2 text creation and a separate
saved deletion of its original created identity. Each retained exactly one Save
intent and one Save/close/reopen acknowledgment. Complete immutable-checkpoint
proof preserved ten peer raw histories and all 131 original target records across
each transaction. The only additions were DOCHEAD/STRING, then DOCHEAD/the
created STRING's tombstone. Deletion restored the original source, not database
bytes or history. Neither transaction establishes unsaved rollback support.

One closed free-schematic-container creation also completed on 164600. Its
original native return and two closed-target readbacks matched. Checkpoint
recomputation proved all 11 existing documents, 331 current records and 368 raw
record occurrences unchanged; the sole new SCH contained exactly DOCHEAD/META.
There was no page, template, canvas, editor open, Save or automatic inverse.
These are point-in-time disposable cases under the 164600 runtime fingerprint
`8610ba8c5ae61406526379fe205003ce5b3418de288cdcabdd3c31c573086d77`.
They do not admit later source changes or every argument of the tested methods.
The system-library and mixed schematic reader cases above were tested separately
on 204104, not by these 164600 cases. Fresh runtime/context and normal operation
proof gates still apply; no current database was opened for the independent
retained-evidence reviews.

Installed120000 passed closed PCB and schematic-container rename, each followed
by a separate explicit inverse transaction, then one closed free-PCB creation.
All five original acknowledgments and exact target DOCHEAD/META changes passed
complete raw per-document history checks. The project went from 10 documents
and 69 materialized records to 11 documents and 70 records. Every peer and the
active PCB source stayed exact. Reversing the titles did not restore timestamps
or history bytes. No Save, target open/reopen, automatic inverse or deletion ran.
These tests do not establish public-wrapper counterpart renaming, initialized
PCB creation or later-generation admission.

Native preparation of a separate text fixture in that disposable project saved
and reopened one default black STRING. Before any typed text dispatch, preflight
refused two layer-color differences between saved records and exported source,
and the former null-only text-color restriction. The source candidate admits
exact black without changing its meaning. The private whole-source/storage
equality check was overbroad: native decode skips unchanged live layer records,
and maintained baseline admission checks the intended target fields. Offline
regressions preserve both color representations and reject changed durable layer
bodies, types or membership. They do not prove unchanged raw history clocks.
Installed131000 subsequently passed explicit text x/y/content modification and
reverse transactions, each with one Save/close/reopen, complete 11-document proof
and unchanged peer raw chains. The reverse restored the original native source,
not history timestamps or database bytes. This is not unsaved rollback proof.

A following text-creation transaction passed immediate effect verification and
received its Save/close/reopen acknowledgment, then stopped at the source check.
The sole difference was its new STRING's `specialColor`, null before Save and
black after reopen. The checkpoint retains null; all original target records
and ten peer documents remain unchanged. Native full-load decode reuses a text
decoder that retains the preceding color across null. Installed20261011150000 completed
the original journal through retained-Save recovery, preserving stored null and
observed black as separate evidence. No creation, Save or deletion was repeated.
Its complete 11-document proof and unchanged peer histories validate that narrow
recovery, not the explicit-black v2 create/delete writer.

Installed103000 passed five PCB reader cases: Line-only and combined five-family
nonempty-net membership, one track type lookup and two neutral inherited
footprint-Line type lookups. The empty-net inherited lines were excluded from
the nonempty net result. Complete native source/inventory/context, all18saved
documents/383records and the full SQLite dump stayed unchanged. Normal close
and maintained offline checkpoint verification also passed, without Save.
These cases do not validate nonempty standalone Pad/Arc, electrical connectivity,
public-stub parity, writers or the unpublished latency changes.

Installed071500 passed the active Top Layer reader and filtered PCB membership
for two component pads and one via, lowercase component-pad matching, and empty
Pad/Arc membership. All native source/inventory, 18 documents, 383 records and
the full saved SQLite dump stayed unchanged. One ordinary selected resistor
also returned the same exact ID through both the modern public getter and the
explicit deprecated-name adapter, with complete native/saved invariance.
Normal application close preserved the saved file hash; no Save or design edit
was performed. These cases do not validate Line/type lookup, nonempty standalone
Pad/Arc membership, line-parent selection, connectivity, writers or a later build.

Installed083400 passed one imported-project open, native and nonempty flat
diagnostics, and a single stored Designator-coordinate transaction through Save
and reopen. The disposable fixture contained one resistor and two unconnected
pins. All12saved documents and66imported header occurrences were included in
the maintained proof; the sole intended live change was x580 to585. An explicit
reverse transaction passed Save/reopen and restored the original source exactly.
Normal close and maintained checkpoint verification passed. This does not validate other display fields,
electrical edits, rollback, or a newer facade generation. Never replay prior
Paste, placement, identity editing or either completed transaction.

Installed010000 Wire/Bus get and getAll matched four Wire groups containing
eleven segments and one Bus on the disposable fixture. Independent reconstruction
matched every retained geometry/style/name/custom-attribute identity. Complete
native snapshots, all 383 stored records and all 18 documents stayed unchanged.
These are native DTO observations, not public-wrapper parity, resolved electrical
connectivity, writer validation or admission of a later facade generation.

The same installed generation exposed a false-empty legacy selection result.
The native panel showed one selected resistor while the deprecated getter
returned an empty list. Its documented modern replacement returned that exact
component ID twice. That earlier public observation did not admit the newer
adapter; the scoped installed071500 evidence above now tests that adapter.

The same fixture exposed two PCB admission gaps before net/type dispatch.
The current source now accepts the actual identity-only component inventory and
one exact disabled default PANELIZE record. Active, malformed or aliased panel
records still refuse. A separately guarded adapter binds inherited neutral lines
to exact footprint-library records through fresh complete checkpoints. Its narrow
geometry and ownership limits are in pcb-geometry.md; the scoped installed103000
acceptance is above. Do not infer owners from ID prefixes or claim complete Line/type coverage.
Installed071500 covers the active-layer
and filtered non-Line cases listed above, not the full method domains.

Installed223200 Text get/getAll returned exactly one root Text and all fourteen
native fields. Raw null/null alignment agrees with the stored null alignment
under the pinned admitted domain; coordinates/styles remain native. Complete
before/after native state and all nine saved documents stayed unchanged. This
validates that fixture, not other style combinations or a newer facade build.

The same generation passed one stored frame Version display edit x717-to722,
complete native effect and nine-document/eight-unchanged-peer saved proof. The
durable target also has the reviewed zIndex/strikeout initialization and native
header bookkeeping. One explicit Save/close/reopen completed; the effect had
already auto-persisted before Save. Independent retained-proof review and a
fresh native capture passed, followed by normal close, empty process discovery
and final offline checkpoint verification. This zero-electrical-part fixture
does not validate nonempty flat topology or other attribute fields. Never
replay the completed edit or Save.

Installed214400 also enumerated two ordinary-symbol Pins with exact twelve-field
getter parity, explicit OtherProperty absence and unchanged complete symbol
source and 18-document saved history. The tested pins have zero Y, length 10,
shape None, type IN and getter rotations 0/180. Other geometry/enums, custom
attributes, multipart symbols and later generations are not covered.

Installed214400 returned exact property-name sets on two disposable fixtures:
29 frame keys, then 57 keys across two ordinary parts, three ground flags and a
frame. The latter includes 19 inherited keys absent from page ATTR records.
Independent reconstruction from saved page/library/device records matched both
results. Four nonempty Wire groups also matched their stored identities. Every
reader returned two equal observations; complete native and saved-project
comparisons stayed unchanged. This does not validate nonempty Bus membership,
general hierarchy or a later facade generation.

The same generation renamed one closed empty page while a clean sibling was
active. Exactly its title and native header bookkeeping changed, with all 17
other documents unchanged. The original acknowledgment and separate readback
were retained and independently verified. No Save, reopen or editor-caption
refresh is claimed. This completed operation must not be replayed.

Installed210100 reconciled the exact earlier text effect, then dispatched one
inverse on the nine-document disposable fixture. Immediate durable verification
refused; several minutes later native persistence restored the saved baseline.
Complete native and nine-document/eight-peer proof then passed, and read-only
same-journal reconciliation finished without another inverse or Save. This is
delayed-restoration evidence, not immediate rollback or Save/reopen validation.
Text-ID, empty Wire/Bus and rectangle/circle/duplicate polygon observations also
returned expected stable results. A controlled batch after persistence settled
preserved the complete native snapshot and saved SQLite bytes/logical dump.
Nonempty Wire/Bus and the property-name and Pin readers were unvalidated on210100;
the214400 subsets above supersede that status only for their tested cases.
Later010000 nonempty Bus and223200 frame-attribute evidence is listed above;
nonempty flat topology still requires acceptance.
A separate210100 one-field text transaction completed one Save/close/reopen with
exact native readback, complete nine-document proof and eight unchanged peers.
Normal application close preserved the final checkpoint's source bytes. This
does not admit a newer facade, attribute edits or nonempty electrical topology.

Historically, installed202803 reached the exact requested single-field text effect on a
nine-document disposable fixture, then stopped before Save on differing raw
source encodings in the flat native hash. Independent parsed-source/native and
complete durable proof passed. The210100 recovery above supersedes its pending
original-journal recovery/inverse status; new-source Save/reopen validation remains
separate. Its new Text-ID call also failed; the corrected root/descendant
membership subsequently passed the scoped210100 Text-ID case above. Neither
result admits a newer facade or authorizes replay of the historical edit.

Installed194400 completed one empty ordinary-symbol creation from a clean PCB:
the original returned identity was retained, exactly one META-only SYMBOL was
added, and all17existing documents stayed unchanged. Independent retained-artifact
and complete-checkpoint verification agreed with the terminal proof. Normal
application close preserved the final receipt's exact source bytes. This was
native metadata persistence without Save or editor open/reopen; it does not
validate PART initialization, geometry, deletion or an inverse.

Installed182554 completed disposable closed-symbol description updates, empty
page creation, both owned tab/split lookups and inactive PCB close. The tests
proved the exact complete saved-project delta or invariance. These paths invoked
no Save and make no reopened-result claim. Empty-page creation does not validate
the public template-initializing wrapper. Evidence is retained in the repository's
dated disposable-validation report. This validates that installed snapshot, not
the later flat-display or dispatch-cleanup source changes. The194400 empty-symbol
test above is separately scoped to that installed generation.

The five original exact reader kinds passed on a small disposable fixture, including lossless rules and all four pad-parent/topology endpoints. Complete source and native schematic double reads also passed.

PCB component movement passed public and source-merge paths with save/reopen/inverse and all 12 documents compared. Schematic property restoration, a PCB batch and copper clear later passed save/reopen with all 13 fixture documents checked. Copper rebuild was recovered as completed from exact durable and reopened evidence without repeating Save; a separate four-ULP native arc reload difference was reported rather than treated as a general tolerance.

Native ERC reported one warning for floating fixture pins. Native PCB DRC reported zero violations under the current enabled rules. Both checks proved the complete saved database unchanged. Route audit reported the expected centerline length and width results; its documented ambiguity and omitted barrel-length limits remain.

Line creation and inverse had exact live checks without a saved lifecycle claim. Footprint-library creation had durable addition and all 13 document invariants, but no reopen claim. A managed schematic netlist export passed with hash-bound bytes.

The initial stack test exposed a real persistence failure: visible layer changes were not stored. The repaired stack and a net-class edit subsequently passed saved/reopened proof across all 14 fixture documents. DEVICE creation, reassignment and an inherited-model transform passed complete 14-document durable proofs.

Symbol geometry later passed save/reopen with all 14 documents checked. Its result separately composed the fully journaled prior LINE inverse that persisted late, explicitly reporting `isolatedTransaction:false` and both durable proofs rather than claiming unchanged collateral. A subsequent footprint LINE passed save/reopen and complete 14-document proof. After correcting a legacy PAD encoding mismatch, a footprint PAD land/mask edit passed exact live and complete 14-document saved proof. Its first reopen failed after the saved proof. Recovery then completed one observed close/reopen with exact source and all 14 durable documents verified, without repeating the edit or Save. These results do not establish every geometry path's live coverage.

These results do not cover every collection or export format, and no user design is fabrication-approved. Query the current catalog and report the verified phase.

The recorded ten-sheet schematic redraw completed Sept26 with saved/reopened
proof, complete 850-document comparison and 604 parts / 2,042 pin assignments
preserved. Its narrow historical corrections are completed, never replayable
recipes. The standalone native wire adapter separately passed a disposable
16-document lifecycle and retained recovery Sept25. Neither establishes every
possible source profile, general ERC closure or fabrication approval. This
revamp's new readiness/Save safeguards have offline regression coverage; no
new user-design edits or live lifecycle tests were performed for them.

## Adding support

Add a narrow schema, fixed API/adapter implementation, complete source effect and applicable topology proof, durable journal, created-ID/inverse model and recovery path. Validate newly admitted behavior on a disposable project before describing it as live-tested. Do not route a refusal through raw JavaScript or native UI to evade a failed invariant.
