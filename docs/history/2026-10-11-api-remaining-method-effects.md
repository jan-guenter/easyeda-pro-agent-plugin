# Remaining API effects and closed-document rename review

Research date: 2026-10-11. This is a source review, not connected execution
evidence. No live editor call, production-project inspection, Save, current
database access, or installed-cache change was made for this review.

## Primary-source identity

The following installed application files were read directly and their complete
byte hashes recomputed. Paths are relative to `resources/app/assets/`. All
offsets below are zero-based JavaScript string/UTF-16 positions, not byte
offsets. These anchors are meaningful only with the corresponding complete hash.

| Source | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-api/0.2.53.aee2f57a/api.js` | 1881523 | `5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc` |
| `pro-ui/3.2.149.43637efe/js/ui.js` | 17265809 | `12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a` |
| `pro-pcb/3.2.149.5378b690/js/pcb.js` | 10862879 | `65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54` |
| `pro-pcb/3.2.149.5378b690/js/pcb-main.js` | 2219439 | `392995aeffcd72311a96f918c1ff68f7e10a087511fd75c9b823008b0ffa3530` |
| `pro-mgr/3.2.148.154949d9/js/pro-mgr.js` | 2184762 | `23089ec50bf701191c52af4a214b0d19b14e3233ead1bb5ccd50cf443e9e8742` |
| `pro-mgr/3.2.148.154949d9/js/project-worker.js` | 2164464 | `2792c6c87e3c60e09c43f03494a9cbb24e4ebe9c385372bbaf877ed75083a949` |

Official method pages were checked on the research date. They describe public
contracts, not proof that this installed implementation satisfies every case.
The plugin must keep discovery, implemented task subsets, and connected
validation separate.

## Feasible methods still requiring dedicated effect proofs

Source follow-through now implements narrow standalone type-3 text modification,
creation and deletion with exact-frame binding and strict source/durable proof.
Modification changes x/y/text; creation fixes the default-font top-silkscreen
style and reserves an identity before dispatch; deletion has no automatic inverse.
Other styles, layers, fonts and pours remain refused. These routes do not call
the partially mutating public wrapper. Installed131000 passed forward and
explicit reverse modification with complete saved/reopened proof. Creation
consumed one successful Save/close/reopen but stopped on a new STRING's null-to-
black reload difference; its original journal remains unresolved. Deletion has
not been live-tested. The reviewed source correction creates explicit black
in profile v2. Creation-only retained-Save recovery preserves original null
storage and proves the exact legacy cached-decoder effect separately. It never
repeats Save, navigation or creation. Source/offline acceptance is not connected
recovery completion; see [the reload investigation](2026-10-11-pcb-text-cached-reload-recovery.md).
The broader finding below still applies to unimplemented public argument branches.

| Method or family | Demonstrated issue | Work needed before admission |
| --- | --- | --- |
| `pcb_Layer.selectLayer` | Invalid native IDs can return true; valid changes affect more than the active ID. | Exact layer admission, complete view/source delta, context-bound readback and explicit inverse. |
| `dmt_Schematic.reorderSchematicPages` | Sequential writes, doubling indices, insufficient duplicate validation and mutable project lookup between awaits. | Unique complete permutation, fixed project identity, per-write receipts and partial-progress recovery. |
| Pad-pair group rename/edit | Updating replaces the group and its persistent identity. | Preserve or explicitly project group identity, color, pairs and affected rule references; verify complete source and persistence. |
| PCB type-3 String writers | A native modify failure can occur after earlier property assignments. | Fully prevalidated properties, complete text/font/source effect proof, and recovery that does not assume false means no mutation. |
| `pcb_Document.setCanvasOrigin` | Origin changes upload the complete CANVAS and also flush private pending geometry queues. A blank current source does not prove those queues empty. | Enforceable native-queue quiescence or equivalent continuous lifecycle provenance, complete CANVAS baseline/projection and inverse, and disposable persistence validation. No executable route is admitted. |

These are unfinished engineering tasks, not evidence of inherent impossibility.
The bounded footprint type-4 text routes do not establish PCB type-3 coverage
or the full public String contract.

### Layer selection

The official contract says selection returns false when the layer does not
exist. [Official selectLayer reference](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_layer.selectlayer.html).

Installed `api.js` at 1366608 forwards the supplied ID to the UI's
`selectLayerById`; `ui.js` at 13649600 forwards to the PCB handler. The handler
at `pcb.js` 10234952 calls `be.setActiveLayerId(+id)`, publishes flush/update,
and unconditionally returns true. `setActiveLayerId` at 7864588 does nothing
when its lookup is absent. The implementation therefore cannot use that boolean
alone as evidence that the requested layer became active.

`setActiveLayer` at 7863491 changes active/last-active fields, layer order,
top/bottom colors, and gray-mode visibility; it can publish plane start/end,
layer-status and UI-selection events. The UI receiver is at 16888702. The
native active-layer source model at `pcb.js` 4426612 reads the same manager
field, and full source serialization includes `ACTIVE_LAYER` at 10827552.
This establishes a source/view-state effect; it does not establish when the
change reaches durable storage. Switching back to the old ID alone is not
proof that all prior colors, visibility and ordering were restored.

### Schematic page order

The public method is beta and expects the complete array of page items obtained
from an upstream information method.
[Official reorder reference](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_schematic.reorderschematicpages.html).

`api.js` 1318803 forwards the request. `ui.js` 17082000 reads schematic sheets,
checks equal lengths and that each requested UUID occurs in the source set,
then writes each sheet in sequence. Those checks do not reject a duplicate UUID
that replaces another member. Its index starts at 1 and uses `c += c`, producing
1, 2, 4, 8, rather than contiguous indices. Each awaited update uses the current
mutable `w.currentProject.projectId`; there is no complete transaction or
per-result success check in this body. An exception can leave an earlier prefix
written. A future adapter must define the desired stored ordering explicitly,
bind the full page set and project, and recover observed partial progress
without replaying an untracked batch.

### Pad-pair groups

The official API distinguishes pad-pair groups from net equal-length groups and
accepts both component-pad names and standalone-pad identities.
[Official pad-pair API](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_drc.addpadpairtopadpairgroup.html).

`api.js` 1452327 forwards group rename. The PCB rename handler at 10229502
marks the selected group `UPDATED` and invokes `Xw` at 8385008. Its update
branch removes the old group, deletes its `EQLEN_GRP` record through `Z$`,
constructs a new group, and uploads it through `K$` (8382537/8382375). The
new-group constructor at 3444645 defaults its number to a freshly generated
suffix; the update branch does not pass through the former number or color.
The public group-list mapper at `api.js` 1452839 projects names and pad pairs,
so equality of that public list would not prove preservation of those native
fields.

The traced update body demonstrates group replacement and dirty/tree events.
It does **not** demonstrate an explicit write to every associated `RULE` or
`RULE_SELECTOR`, nor prove that references to the former group survive. Rule
reference preservation remains a separate obligation, not an asserted native
side effect. A future writer needs a complete native group/rule projection and
an explicit recovery policy for the delete/create interval.

### PCB String modification

The official modify method is beta and exposes optional text, font, geometry,
reverse, expansion, mirror and lock properties.
[Official String modify reference](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivestring.modify.html).

The native `string-modify` handler at `pcb.js` 10286945 assigns layer, position,
text, font, size, stroke, origin and rotation before checking a requested
reverse change with the default font. That later branch returns false before
executing the queued command and publishing the normal success events. Thus
native false does not prove that the object remained unchanged. This is an
in-memory partial-effect finding, not a claim that a particular failed call
was durably saved. The create/delete handlers at 10286106/10286614 likewise
need their own bounded lifecycle proof. The new type-3 routes use a separate
exact-source adapter, not those public handlers. They reserve a creation ID
before dispatch, retain it for recovery and a creation inverse, and advertise
no deletion inverse. Their offline tests do not establish connected execution.

Native fixture preparation also exposed two saved/exported layer-color
differences before typed dispatch. The exact causes and rejected remedies are
recorded in [the color round-trip investigation](2026-10-11-pcb-text-fixture-color-findings.md).
The adapter now preserves an existing exact null or black text color separately;
that does not resolve or normalize unrelated LAYER differences.

### PCB canvas origin: unresolved predispatch proof

The public contract defines offsets relative to the data origin, in native mil
even when the canvas displays another unit.
[Official setCanvasOrigin reference](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_document.setcanvasorigin.html).
The wrapper at `api.js` 1440540 forwards the two offsets. The PCB handler at
10215588 divides them by 10 and calls `D3` (7837738); the getter multiplies the
internal origin by 10. Type 4 additionally repositions hidden attributes, so a
PCB-only proof cannot admit footprints.

The complete CANVAS field table is at `pcb.js` 3962299. Encoder `Q8` (4425338)
exports origin coordinates through `De(value,4)` (3366766), alongside unit,
grid/snap/alternate-snap sizes, grid types, grid ratio and highlight value.
All 13 fields must be preserved. An absent stored CANVAS or omitted baseline
field cannot be silently materialized while claiming an exact inverse.

`D3` creates an `SV` command (5806917) holding the old origin. Command execution
(7854220) calls its upload synchronously before `D3` assigns the new origin;
`kp` (7291491) then uploads the new complete CANVAS. This demonstrates two
native upload calls, not an exact count of durable history records or chunks:
buffering and storage coalescing require separate proof. The native boolean is
not persistence evidence.

The blocking collateral path is command-group upload (7848624): it also flushes
`ZS` (4815340, pending BOARD flag), `kT` (4685279, pending POURED IDs), and
`v6` (4801900, pending LAYER_FILL IDs). Command execution publishes
`flushTearDrop`; its subscriber at 9013374 schedules deferred queue processing.
The origin command itself adds none of that geometry, but it can flush work
left by earlier activity. No reviewed read-only predicate for these private
queues was found. Their pending state is not part of FileSource.

A blank/text-only source therefore does not establish safe predispatch state
after prior physical-geometry edits or deletion. Materialized history loses
deleted objects, and even complete stored history cannot exclude unsaved
create/delete activity in the current frame. Existing fresh-open receipts do
not retain an uninterrupted no-physical-edit binding through dispatch. A caller
assertion or a successful controlled blank-fixture experiment cannot substitute
for that reusable precondition.

A private, unregistered prototype passed nine isolated Node 24 tests, both
TypeScript configurations and strict type-aware lint. Those tests covered full
CANVAS projection/inverse, stored baseline requirements, captured-frame identity,
26 late-reply refusals, acknowledgment retention and no retry. The prototype
was removed from the production tree before registration or publication; no
connected call, available capability or execution-coverage claim follows.

Future admission requires a source-pinned read-only empty-queue/idle predicate
bound through the mutation boundary, or an enforceable lifecycle/provenance
mechanism establishing the same invariant. Complete native-source and durable
peer proofs, an exact inverse and disposable lifecycle validation still follow.
This is an unfinished adapter proof, not a permanent limitation of the SDK.

## Closed PCB/schematic rename: a bounded task equivalent

Official PCB and schematic rename contracts include collateral renaming of a
same-named reuse-block symbol and its associated other design; schematic rename
is explicitly beta.
[PCB rename](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_pcb.modifypcbname.html),
[schematic rename](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_schematic.modifyschematicname.html).

The new source profile deliberately does not invoke either public wrapper.
It changes one ordinary closed container's title via a project-qualified native
worker route. It is a `native-task-equivalent`, not public-wrapper parity.

### Worker and subscriber effects

In `pro-mgr.js`, the direct `SCHEMATIC.UPDATE` and `PCB.UPDATE` handlers at
2048209/2053340 select `J(projectUuid)` before awaiting the worker update. The
higher-level schematic service at 1848509 can rename the matching PCB; it is
not this direct route. In `project-worker.js`, PCB/SCH `updateData` bodies near
1897330/1906970 update the explicit target. Their serializers near
1896990/1906600 emit fixed META shapes: PCB has `board,title,zIndex,source,parent`;
SCH has `board,title,zIndex,source`. Both force `zIndex` to null. Unknown META
fields and non-null ordering cannot be claimed preserved.

The DOCHEAD encoder `xt` at 241441 includes a user only when its input is
truthy. The base manager `Md` constructor at 2002637 does not initialize a user;
the project constructor at 2091543 synchronously constructs its schematic and
PCB managers near 2093300–2093496. Their base `vi` at 1847563 snapshots the
then-undefined project user. The later project `subscribe` near 2103430 assigns
the login user to the project, not those previously constructed child fields.
This pinned initialization order explains why these writer headers omit the
user; it is not a general rule for every native header producer.

The worker PCB META path at 1891090 emits metadata notification and a canvas
update for that PCB UUID; the schematic META path at 1901090 emits its metadata
notification. Base canvas publication at 1849020 is gated by watches for the
specific target and uses its UUID in the event topic. The sole direct
`PCB.ON_UPDATE` subscriber in `pcb-main.js` at 2214334 has an empty asynchronous
body. Its generic canvas subscribers at 541897/2165752 bind their own document
UUID. This supports excluding a different active PCB from the renamed target's
canvas effect. It is not a proof of universal subscriber absence or immediate
project-tree/tab-title refresh.

### Tab membership alone is insufficient

The UI public split-tree producer at 17090080 fills leaves using
`getFilterTabs` (16273355). Both observe the same tab registry. The native
`getTabIFrame` at 16312392 separately finds a DOM frame by ID. The close path
near 15823629/15825213 removes the tab before separate frame teardown, so an
interrupted close can leave an editor that neither tab view reports.

The added DOM guard therefore inventories the actual document independently.
The UI template at 51668 defines `DIV#tabbar_bodies` and its five static children:
`commandWin`, `exitSmartSizeTool`, `exitPadShapeTool`, `project-blank-page`, and
`assembly-variant-page`. `VP.create` at 15122340 builds an editor body with a
tab UUID and an `editframe`; schematic editors can be DIVs, not iframes.
The PCB opener `Hd`/`Xb` near 15126633/15117600 calls this constructor directly
and marks its iframe `pcb-canvas=true`, with `src=editor?entry=pcb`.

The direct PCB path does **not** necessarily create a hidden panel pool. A
different generic `jLo`/`x$n` path near 15140950–15142773 invokes pool setup.
The current rename profile refuses any pool; no panel source pin or neutral-pool
admission is deployed. Export creation near 16361218 can put a hidden
`frame_export_*` iframe in an anonymous body, which is why UUID-body checks
alone are insufficient. Complete editor-marker enumeration plus an iframe
inventory under the root rejects these cases, including tabless schematic,
export and orphan frames.

### Profile and validation limits

The reviewed [planner](../../plugins/easyeda-pro-control/server/src/document-container-rename.ts)
requires a complete strict-history checkpoint, one exact closed target, and one
different owned active PCB. It refuses imported atom-header histories,
inheritance, reuse blocks/hierarchy/variants, unknown META fields, and a target
with non-null `zIndex`. Schematic children are enumerated and must remain
closed. The [runtime](../../plugins/easyeda-pro-control/server/src/document-container-rename-runtime.ts)
rechecks receiver identity, project/branch, clean tabs, edit version, permission
and DOM around awaited reads and synchronously immediately before its one
write. It retains a valid acknowledgment before a separate fallible readback;
exceptions expose only fixed stage/code tokens.

The initial standalone durable proof compared every peer and child and required
the target title change plus reviewed DOCHEAD bookkeeping. Its semantic-only
record projection was subsequently tightened as described below. Neither
version proves a Save, reopen, public-wrapper equivalence, or editor-title
refresh. An inverse is a separate explicit transaction, never an automatic retry.

At this note's review checkpoint the four standalone rename modules and two
test files passed independent review, 46 isolated tests on pinned Node 24.18.0,
and strict type-aware lint with zero diagnostics. Executor integration,
acknowledgment persistence and recovery were being implemented separately and
had not yet passed this independent review. No current-generation connected
rename lifecycle is established by these source and synthetic checks.

### Final integration review amendment

The later independent review accepted the executor and recovery integration and
the rename-specific complete-record proof. The final focused rerun passed all
126 tests across the planner, native runtime, transaction coordinator,
unpublished-preparation recovery and fixed diagnostics on pinned Node 24.18.0.
The earlier 46-test checkpoint above remains the standalone review record;
neither count is connected execution evidence.

The revised projection binds every materialized record envelope, including
ticket/client clocks and admitted schematic ATTR insertion provenance. Peer
records, target non-META records and retained schematic DOCHEAD lineage must
remain exact. Lineage receipts are validated against their own checkpoint and
hash before comparing the unchanged header sequence; a new checkpoint receipt
is not itself a header change. Unsupported extra envelope fields and imported
atom-header provenance remain refused. No-mutation recovery uses this complete
projection in addition to logical-database and semantic equality, so a reticket
with unchanged content cannot be accepted as unchanged.

Candidate120000 corrects the scope of that older claim: it covered retained,
materialized rows, not every native history occurrence. Review found that an
extra non-SCH_PAGE DOCHEAD could escape that projection. Creation and container
rename now require checkpoint-bound raw per-document chains, including repeated,
stale, tombstoned and header records. Chunk boundaries, EDIT_HEAD and
interdocument packaging remain outside that per-document commitment.

Only the target META title and its reviewed writer envelope may change. The
new META ticket must advance beyond all visible baseline record and retained
header tickets, and its client must match the reviewed new DOCHEAD client.
The source clock can include tombstones absent from the materialized view;
the proof therefore does not invent an exact `+1` requirement. The target
DOCHEAD permits only reviewed client/time/version and user omission; edit
version must already match. This is an exact admitted materialized-record
delta, not equality of compressed/encrypted raw history bytes.

The original valid native acknowledgment is published before any fallible
post-write readback or settled-dispatch cleanup. Missing or invalid return
evidence cannot be reconstructed from a matching title. Changed-result
reconciliation rederives the original prepared plan, verifies its retained
acknowledgment and complete checkpoint delta, then runs a separate read-only
closed-target observation. Both execution and reconciliation recheck active
source, durable checkpoint identity and context after their last readback.
Regressions cover source/checkpoint drift during that readback, publication
failure, receiver substitution, missing acknowledgments and orphan quarantine.

Recovery never repeats rename, opens its target/children, saves or runs an
inverse. It requires the original clean other-PCB context. Exact unpublished
preparation prefixes may instead be invalidated after complete unchanged-state
proof, without acquiring native dispatch authority. A retained acknowledgment
plus failed readback is not such an unpublished prefix. Completion reports
`saved:false`, `reopened:false` and `saveInvoked:false`; native metadata
persistence and current-generation connected acceptance remain separate facts.

The offline coverage catalog now exposes three concrete omission reasons for
layer selection, page reorder and pad-pair group rename. Each remains omitted,
with no execution route or runtime authority. Other pad-pair methods retain
their generic omission pending method-specific tracing. The new omission tests
and existing non-generated coverage checks passed 22 tests, with zero strict
type-aware lint diagnostics for the changed catalog source and new test file.
