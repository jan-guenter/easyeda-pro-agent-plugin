# Current-version PCB identity readers

Research date: 2026-10-14. Baseline: release033000. This note recommends a
coherent current-version reader addition: selected IDs, unfiltered Line/Arc/Via
IDs, and a three-family existing-ID type lookup. It does not recommend deriving
`getCurrentLayer` from the layer-list `active` flags alone.

This was source-only research. Installed bundles were read as inert text and
hashed, not evaluated. No live MCP, native process, editor, profile, project or
design file was accessed. No method in this note has new connected evidence.

## Inventory before implementation

The baseline `api-coverage.json` already lists the following methods. Its
implemented labels describe routes with their own runtime gates, not admission
on the current installed editor.

| Exact mounted method | Existing coverage | Current-version gap |
| --- | --- | --- |
| `eda.pcb_Layer.getCurrentLayer` | Legacy native equivalent via `pcb-active-layer-read.ts` | Requires old full source/profile and source/list correlation; not registered in the current restricted layer tool. |
| `eda.pcb_Primitive.getPrimitiveTypeByPrimitiveId` | Legacy native equivalent via `pcb-primitive-type-read.ts` | Old source/inventory correlation and editVersion, not current native-view metadata. |
| `eda.pcb_SelectControl.getAllSelectedPrimitives_PrimitiveId` | Legacy public SDK read | No current bound-receiver route. |
| `eda.pcb_PrimitiveLine.getAllPrimitiveId` | Legacy public SDK/exact reads | No current bound-receiver route. |
| `eda.pcb_PrimitiveArc.getAllPrimitiveId` | Legacy public SDK/exact reads | No current bound-receiver route. |
| `eda.pcb_PrimitiveVia.getAllPrimitiveId` | Legacy public SDK/exact reads | No current bound-receiver route. |
| `eda.pcb_PrimitiveComponent.getAllPrimitiveId` | Legacy public SDK/exact reads | Extra serializer/library enrichment dependencies; defer this slice. |
| `eda.pcb_SelectControl.getAllSelectedPrimitives` | Legacy source-backed DTO equivalent | Not the same as selected IDs; geometry, ownership and mapper completeness remain separate. |
| `eda.pcb_SelectControl.getSelectedPrimitives` | Omitted, lossy selected-object projection | Native handler filters objects lacking `toJSON`; never interpret its result as complete selection. |

The baseline current `pcb_layers` route admits only `getAllLayers` and
`getTheNumberOfCopperLayers`. It already retains the exact ordinary PCB frame,
local message-bus receiver, complete target identity and two matching samples.
Reuse that admission, not the old full-editor profile.

## Primary sources and fixed identities

Paths below are relative to
`/mnt/c/Program Files/easyeda-pro/resources/app/`. Editor version is 3.2.206,
installed package 3.2.206.715d940d. All implementation offsets in this note are
zero-based JavaScript UTF-16 string offsets, not byte offsets or line numbers.

| Installed file | Bytes | SHA-256 |
| --- | ---: | --- |
| `assets/pro-api/0.3.50.ab46409c/api.js` | 1964920 | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| `assets/pro-api/0.3.50.ab46409c/api-types.d.ts` | 1733380 | `d5fe990034c55001302ea6c3f704c2d4b88cdf23253cc5293b3bad62a32b9def` |
| `assets/pro-ui/3.2.196.26ed3d6c/js/ui.js` | 17456671 | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |
| `assets/pro-pcb/3.2.193.682ed44e/js/pcb.js` | 10976299 | `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33` |

Official method pages were checked on the research date. The
[selected-ID method](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_selectcontrol.getallselectedprimitives_primitiveid.html)
returns an array of strings without arguments. The
[Line](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitiveline.getallprimitiveid.html),
[Arc](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivearc.getallprimitiveid.html)
and [Via](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivevia.getallprimitiveid.html)
ID getters accept optional filters. For the first current adapter, support only
empty arguments, with no filters. These official methods are beta previews.
The corresponding installed declaration lines are 25638, 22275, 12660 and
25507. Declaration presence does not prove the installed execution chain.

The current official
[active-layer page](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_layer.getcurrentlayer.html)
describes an asynchronous layer result or `undefined`, and says it was added in
EDA v4.2. In contrast, this installation declares a synchronous result at line
7997 and has an empty `getCurrentLayer(){}` body at API1374457. The
[layer record](https://prodocs.easyeda.com/en/api/reference/pro-api.ipcb_layeritem.html)
describes the public nine-field projection, not a native active-ID witness.

The direct primitive-type method page was inaccessible during this research;
the official [PCB_Primitive class index](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitive.html)
does not list it. Installed declaration line10162 retains the promise signature,
but API1349145 is an empty async body. Neither web absence nor the empty body
justifies returning a fabricated type or treating `undefined` as proof of absence.

## Selected IDs: short complete effect trace

| File / offset | Behavior |
| --- | --- |
| API1510821 | Public method calls fixed `extensionApi.PCB_SelectControl.getAllSelectedPrimitiveIds` with `{}`. |
| UI17315666 | Handler checks PCB/footprint context and delegates through `Ot` to the selected-ID topic. |
| UI15781978 / 8959577 | Generic `Ot` chooses the active tab across asynchronous frame routing. Do not call it for an exact-target observation. |
| PCB10793768 / 10413485 | `QZe(ie, Fe)` installs the extension handlers with the existing selection controller; it passes that receiver to `$Ze`. |
| PCB10406424 | Fixed local topic `pcb/extensionAPI/selectcontrol-getAllSelectedPrimitiveIds` maps `t.getItems()` to each item's `globalIndex`. |
| PCB7871459 / 7816267 / 7886868 | `getItems()` returns the existing controller array; the controller was instantiated during normal module initialization. |
| PCB3859880 / 3424496 | Ordinary view/model identity getters read existing fields. Other native item classes can have their own getters; the reviewed identity getters do not select, refresh, save or request services. |

Call the fixed native topic on the already captured ordinary PCB receiver,
with no caller topic or callback. Preserve array order and every returned ID.
Return no selected-object data. Native selection can include inherited,
generated, preview or grouped identities; an ID alone proves neither persisted
membership nor a particular primitive type. A valid empty array means the
observed selection was empty, not that the board was empty. Undefined, malformed,
oversized or duplicate-ID results must fail, not become `[]`.

The reviewed handler only allocates the result array and reads IDs, plus normal
local RPC bookkeeping. It does not invoke `toJSON`, project/library services,
selection changes, navigation, Save or source export. This is a native task
equivalent because the public wrapper and its mutable active-tab routing are
not executed.

## Line, Arc and Via IDs: shared receiver and distinct membership

All three public ID getters first invoke their full getter and then extract IDs.
The public wrappers are API1358401, 1365426 and 1352253 respectively. UI handlers
delegate to native topics through `Ot`; examples are UI17241960 for Track,
UI17242948 onward for Arc and UI17241489 for Via. A bound native equivalent
avoids that routing and does not construct SDK primitive instances.

| Native topic | PCB handler offset | Native family |
| --- | ---: | --- |
| `pcb/extensionAPI/track-getAll` | 10400807 | `hr.getAllItem()`, filtered to `xr` views |
| `pcb/extensionAPI/arc-getAll` | 10330519 | Same manager, filtered to `Oi` views |
| `pcb/extensionAPI/via-getAll` | 10405876 | `Vr.getAllItem()` |

Pass a fixed literal empty object. These handlers destructure optional filters;
passing `undefined` would throw. The handlers serialize each matching view,
calculate display coordinates, and return allocated records. The facade should
validate the complete bounded array, each plain row and its own nonempty string
`globalIndex`, then copy only IDs. It should not enumerate or serialize the
discarded geometry again. No arbitrary getter, prototype walk or ID coercion is
needed. Never evaluate or render ID text.

The family managers `e7` at7947274 and `Gde` at7953970 derive from `iu` at7946805.
Its `getAllItem` at7946904 visits existing models and includes only those with
a `stateWatcher`. Its underlying `Ni.iterator` at3173039 iterates the existing
Map. This is loaded native-view membership, not proof that every stored record
has a view. Active placement previews or inherited models may appear. Do not
silently remove them or call the result a complete saved-design inventory.

The serializers are Track4783800, Arc4827571 and Via4402441. Their read closures
use existing view/model identity, geometry, lock and net fields. Relevant
view getters are Ue4365760, Oi4826708 and Ve4396601; model getters include
3888893 onward for Track, Q8 at4069861 onward for Arc calculations, and
4159100 onward or4284220 onward for base/inherited Via data. They allocate
plain DTOs, points and arithmetic intermediates. The reviewed getter closure
does not select, redraw, request project/library data, modify the circuit or
Save. Getter names alone were not used as proof of that boundary.

Two equal ID arrays with matching surrounding native identity samples can
establish stable observed IDs. They do not establish equal geometry between
samples. Keep that narrower result explicit. Vendor enumeration/serialization
runs before facade output bounds; an output limit is not a vendor execution
limit or cancellation guarantee.

### Existing-ID type lookup

The same adapter can read all three families twice and classify one literal
existing ID as `Line`, `Arc` or `Via`. Reject duplicate IDs within a family,
cross-family collisions, missing IDs and any other requested type. Preserve the
full per-family ID observations in the result commitment. No public stub call
is needed. The result describes membership in one of those loaded native view
families, not root ownership, inherited provenance, full public-method parity,
connectivity or durable source. It should not return `undefined` for an ID it
cannot classify.

## Why active-layer and broader identities need more work

The existing layer-list callback at PCB10319155 includes each view's `active`
boolean. That getter at7928136 returns `_active`. It is not an independent
canonical active-layer identifier:

- The setter at7928169 mirrors layer12's active state onto hole layer47, so a
  valid view can have more than one active flag. Choosing the first is wrong.
- `Bde.activeLayer` at7929826 reads the model manager's separate
  `activeLayer` field. `getActiveLayerID` at7932775 returns that field. Normal
  `setActiveLayer` updates flags and the model identity together, but the source
  decoder `Cie.finish` at4035765 can assign the model identity directly before
  view synchronization. Stable flags alone do not establish completion of that
  transition.

Therefore, do not add `getCurrentLayer` by simply filtering `nativeLayers.active`
and claiming canonical active-layer identity. The legacy adapter's separate
canonical `ACTIVE_LAYER` source correlation addresses a different, stronger
claim. A current implementation needs a reviewed bounded canonical-ID witness
or an explicitly renamed view-flag observation that does not masquerade as
that method. No direct active-ID native RPC was found in this pinned bundle.
Avoid new source export or editor initialization merely to finish this reader.

Component IDs are not as short a trace as their return type suggests. Native
`component-getAll` at10336481 invokes `Le.toJSON` at7397863, which visits
footprint/device caches, attributes, pads, vias and pad-length lookup. The public
UI path at17290493 additionally invokes `rpt` enrichment for every component.
Full closure review remains needed; this note does not claim those effects are
unsafe or proven harmless. Pad serialization additionally builds hole/pad shape
and rule projections. Defer these two families until their dependencies are
reviewed rather than reusing the simpler Track/Via proof.

The selected-object native handler at10406553 filters objects without `toJSON`;
the public all-selected mapper at1510977 also drops some types, including Text.
These are concrete omissions that selected IDs alone do not repair. Geometry
and source-backed object DTOs remain outside this proposed release slice.

## Proposed integration and focused validation

Keep the same exact target as current layer reads: project32-or64 lowercase
hex, branch32, document16-or32 and the exact `document@project` tab. The 64-hex
local-project path hash is legitimate; existing layer research traces its
installed producer. A 32-only identity observer cannot supply local targets and
should be corrected independently, without widening document or branch IDs.

Reuse current API/UI/PCB admission, serialized authenticated execution, retained
frame/bus/owner checks and native tab/type identity before and after each await.
Take two complete matching identity snapshots. Use strict method literals and
empty arguments except one bounded ID for type lookup. Reasonable initial facade
bounds are 20,000 IDs per family, 256 selected IDs and 256 characters per ID.
The integrated inline route uses 384 KiB, or 393216 UTF-8 bytes, total serialized
evidence rather than the initially proposed 2 MiB, leaving room inside the shared
512 KiB tool-response ceiling. The byte bound can be reached before the count
bound; there is no paging fallback. These are adapter bounds, not vendor guarantees.
Fail without truncation. Keep current quarantine checks and no automatic retry.

One focused program test should cover ordered IDs and family classification,
empty selection/families, malformed or duplicate IDs, unsupported/missing type,
and target drift at an awaited boundary. Reuse the maintained captured-receiver
tests rather than create another test matrix. Run existing types, zero-warning
lint, packaging/inventory checks and CI. After installation, one existing
disposable PCB can validate selection plus nonempty family observations. An
empty Arc family validates only the empty case. No layer switch, selection
change, new geometry, Save or reopen is necessary for this reader validation.

Research supports this implementation boundary; it is not implementation,
installation, connected admission or live validation evidence.
