# PCB root model membership

This note records the first census, delivered in105401. Its function hash and
omission list describe that snapshot. The later
[interaction follow-up](current-pcb-string-writer-prerequisites-2026-10-20.md)
adds selected tool state and partition, inner-layer, retained-line, smart-
dimension and group-view indexes to the same request. It still does not prove
complete ownership, cover all secondary roots or authorize writing.

## Result

A useful root-membership census is reachable through the existing source-admitted
Save-handler scope. It must inspect raw managers and several separate roots.
Neither the public object lists nor the16-family native ID lookup is a complete
empty-canvas test.

The first implementation is a fixed, populated-safe raw-root census, with
spatial-index reference witnesses. It can identify prerequisites
that a proposed empty String fixture fails without serializing every supported
geometric type. Nonzero counts are useful output, not a reason to discard the
whole observation. It cannot
yet authorize a writer or claim complete live baseline, source ownership,
producer completion, Save eligibility or persistence.

This work adds the dormant `current-pcb-diagnostic-root-inventory.ts` leaf and
its focused synthetic tests. No vendor code was executed, no live tool was
called, and no project was opened or read. This leaf adds no compatibility
pin, generated bundle, package version, transport or writer.

## Sources and coordinate convention

The installed source was read as inert text and independently hashed:

`C:\Program Files\easyeda-pro\resources\app\assets\pro-pcb\3.2.193.682ed44e\js\pcb.js`

- Bytes:10,976,299.
- SHA-256:
  `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33`.
- Decoded JavaScript length:10,976,278 UTF-16 code units.
- All `PCB@offset` citations below are zero-based UTF-16 positions in that exact
  file, not byte positions or line numbers.

The official String getter returns a public String list. It does not promise
raw renderer-model membership. The official Save method returns a boolean,
not a complete model or durable-state proof.
[String getAll](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivestring.getall.html),
[PCB Save](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_document.save.html).

Existing implementation context was read in
`current-pcb-diagnostic-model-program.ts`,
`current-pcb-diagnostic-model-scope.ts`,
`current-pcb-diagnostic-pending-program.ts` and
`current-pcb-diagnostic-raw-strings.ts`. Their ownership and false-authority
limitations remain applicable. The prior
[Save prerequisite analysis](current-pcb-string-save-prerequisites-2026-10-19.md)
is not superseded by this census.

## Ordinary raw model families

The native `Cc` ID lookup at `PCB@4334080` searches these16 managers.
Each extends `Ni`, whose constructor owns a native `map` and `_last` at
`PCB@3172844`. The table gives the class binding exposed in the outer closure,
its constructor name, and its source declaration.

| Raw binding | Constructor | Declaration | Native family |
| --- | --- | ---: | --- |
| `vn` | `Z4` | `4077755` | Track and ArcTrack |
| `Jn` | `u6` | `4169926` | Pad, including polygon pads |
| `Dn` | `c6` | `4164822` | Via |
| `Xi` | `B4` | `3951180` | Circle profiles |
| `ol` | `g6` | `4214239` | Radius Dimension |
| `nn` | `t6` | `4097225` | Rect profiles |
| `bo` | `U4` | `3988808` | Text, including attribute subclasses |
| `_a` | `f6` | `4209747` | Protractor Dimension |
| `Aa` | `p6` | `4203793` | Length Dimension |
| `GR` | `C6` | `4333764` | Smart Dimension |
| `Ms` | `T6` | `4328853` | Component |
| `Fi` | `r6` | `4110593` | Polygon profiles |
| `oa` | `a6` | `4149147` | Image |
| `c0` | `b6` | `4237393` | Picture |
| `Yo` | `s6` | `4142901` | Copper |
| `zo` | `o6` | `4131362` | Inner |

These classes use their own static `manager` field, initialized to null, and
`getInstance()` creates the instance lazily. The observer must read that field,
not call the method. A null manager is an unallocated owner, not an empty Map;
preserve that distinction. The census also reports absent and undefined own
static fields as distinct diagnostic states with `count:null`. Those are not
the source-initialized null state and confer no eligibility. Accessor-backed
fields, inherited shadows and unexpected present-owner prototypes refuse.
The manager's `_last`
can retain a formerly created object after deletion, so `_last` alone is not
membership evidence. These layouts are visible in each declaration above and
in `Ni`.

Profile family names are broader than public object names. The source encoder
classifies Line, Board Outline, Fill Region, Slot Region, TearDrop, FPC
Stiffener, Prohibited Region, Constraint Region, Partition, Copper Region and
the3D shell variants through the shared profile model inheritance. They are not
additional safe-to-ignore objects when a public Fill or Region getter is empty.
The exact classification is at `PCB@4768348`.

Do not filter these raw maps by parent, partition, visibility, layer, lock or
state watcher. The base `_parent`, `_partition` and `_groupID` belong to the
model, while public getters normalize some values. `iE` recursively registers
Component children and attributes in their family managers. A nonempty map
therefore rejects the initial empty scope even if every member is hidden or
has a parent. `nP` is at `PCB@3424326`; recursive registration follows
`PCB@4334080`.

The view manager `iu.getAllItem()` explicitly skips models lacking a
`stateWatcher` at `PCB@7946809`. Repeating the public enumeration cannot repair
that omission. The raw map is the first inventory.

## Additional roots that the16-family lookup misses

### Groups

`Mp`, constructor `l6`, owns a separate `map` of `oE` Combination models.
Its keys are group IDs allocated by `numberManager`, not the ordinary
hexadecimal primitive-ID contract. Empty-root qualification needs this map
too. The declaration is at `PCB@4156444`; the exporter feeds groups separately
at `PCB@5843367`. The corresponding view manager `Ft`, constructor `jde`, has
its own Map rather than an `iu.mgr` relationship at `PCB@7970019`.

### Board

`_s`, constructor `lD`, uses static `instance`, not `manager`. It owns
`_board`, `_outlineCollect` and `_autoGenerate`. A BOARD decoder can construct
a shape without inserting it into the ordinary family managers, then give its
view to this owner. The decoder explicitly disables normal result caching.
`lD` is at `PCB@4631495`; the BOARD decoder path is at `PCB@4818129`.

An initial empty scope needs absent/nullish `_board` with its precise marker
retained, an empty `_outlineCollect`, and a reviewed `_autoGenerate` state.
Absent `_board` is normal before its setter is used; it is not equivalent to
an absent owner. Merely checking `Xi`, `nn` and `Fi` cannot exclude BOARD.

### Panelization

`ai.model` is the panelization singleton. Its constructor at `PCB@4755630`
owns these geometry collections:

- `items`, `outlines`, `slots`, `originOutline`, `holes`, `positionHoles`.
- `stampGroups`, `marks`, `vCutShapes`, `closures`.
- `borderClosures`, a two-entry array of arrays.
- `borderClosures_outerMost`.

The same class directly constructs `Tc`, `vh`, `eE`, `rd`, `rp`, `np` and
`l0` objects in its add/copy methods, without registering them in the16 family
maps. It can therefore contain text, pads, holes or outline geometry while all
ordinary maps are empty. `Si`, constructor `Jse`, retains this exact model;
its render/source enumeration explicitly uses those arrays at `PCB@5847932`
and `PCB@5848327`.

A conservative initial scope needs all these arrays empty, both nested
`borderClosures` arrays empty, and `_param.on === false` plus
`_param.success === false`. Preserve the raw `_param` object for separate
source/configuration comparison. Those two flags alone do not prove the arrays
empty. Never call `remove()` to manufacture eligibility.

## Spatial, derived and transient membership

There is no single reviewed "scene children" array that replaces these roots.
The native `getPcbScene` service returns UI modes via `Pi.getScene()`.
`Kme.scene` is initialized to `[1]`; its draw/place/select setters replace it
with mode numbers. This is not native object enumeration.
See `PCB@10187481` and `PCB@10809690`.

The original `Ht`, constructor `tV`, is the spatial index. Its raw layout at
`PCB@5042425` contains:

- `map`: model-type → layer → tree.
- `otherMap`: layer → tree for types outside the fixed group set.
- `ratlineMap`: net → tree.

Its group set includes ordinary geometry, Smart Dimension, Line, Arc, Ratline,
DRCResult and Combination. Unknown types can enter `otherMap`. Do not skip that
map or treat the fixed set as an exhaustive global model-type whitelist.

The tree types are `Md` at `PCB@3934888` and `F0` at `PCB@5039175`.
Both own `items`, `changeList`, `deadList` and `root`. Their root types
`NI` at `PCB@3932541` and `iy` at `PCB@5036382` own `childs`.
`items.size === 0` alone misses pending removals or stale tree nodes.
For the initial empty case, accept only empty `items`, `changeList`,
`deadList` and root `childs`, with original class/owner references retained.
Empty allocated type/layer trees can remain after deletion; an allocated tree
is not by itself a live primitive. Never invoke search, flush or recycle,
since these routines update the index.

Other independently retained collections are relevant to a stronger fresh
scene predicate:

| Owner | Raw state | Source |
| --- | --- | ---: |
| `zo.manager` | `layerMapSet`, alternate index of Inner models | `4131362` |
| `Nn.manager`, constructor `p_` | `items`, Partition view index | `4376220` |
| `MI.manager`, constructor `w4` | `map`, `idMap`, Ratline model indexes | `3917595` |
| `jo`, constructor `mpe` | `map`, `idMap`, Ratline view indexes | `8149267` |
| `Hb.manager`, constructor `KN` | `map`, `updateIds`, retained Line/Arc selections | `7813000` |
| `Yh`, constructor `Qme` | its own Smart Dimension view Map | `10199676` |
| `ze`, constructor `Yde` | `map`, `noneNetMap`, model-bearing network indexes | `7963914` |
| `w8.instance`, constructor `C4` | DRC display model Map | `3626567` |
| `X1._instance`, constructor `v4` | DRC display view Map | `3872911` |
| `_4.instance`, constructor `gR` | Creepage view Map | `3872304` |
| `mi.manager`, constructor `x6` | DRC content Map and13 `_id2…Map` indexes | `4478688` |

The `iu` views for ordinary families should retain the exact corresponding raw
manager in `mgr`; the original instances are constructed at `PCB@10792778`.
Smart Dimension and Combination views use their own maps, so they need explicit
checks rather than a guessed `mgr` field.

Rendering and tools also retain objects outside persisted membership.
For example, `Ro` owns queued render lists, layers and view-group changes at
`PCB@3856810`; `OL.build` directly constructs temporary text at
`PCB@10188621`. The selection owner `Fe` retains items,
components, tracks, lines, annotations and DRC items at `PCB@7816267`.
A zero persistent-root census is consequently not proof of no active tool,
selection, render work or future publication. The existing pending observer
does not cover every one of these owners.

## Fixed census implementation

The leaf is one internally generated `Runtime.callFunctionOn` function for the
already retained Save-handler scope. It retains the original callback argument
and current callback equality check. It uses own data descriptors, reviewed prototypes,
bounded native Map/Set/Array inspection and reference rechecks. Do not call
`getInstance()`, model getters, serializers, native lookup methods, exporters,
tree search, flush or Save.

The implemented result contains:

1. Original document ID and raw environment/manager ownership checks.
2. The fixed16-family table plus GROUP, each with an explicit singleton marker
   and raw count. No caller-supplied manager or family selector.
3. Board owner/board markers and outline count.
4. Every named panelization-array count, nested-array shape and the two raw
   activation flags.
5. Original `Ht` identity, all three index branches, bounded tree counts and
   each tree's item/change/dead/root-leaf counts. Refuse unexpected tree
   prototypes, invalid map shapes, cycles and over-budget traversal, not
   ordinary nonempty trees.

The secondary indexes listed above remain omitted and
`secondaryIndexesCovered:false` is explicit. Active tools, geometry, source,
queue completion and persistence also remain outside the leaf.

The strict result uses these shapes:

```typescript
type Marker = "absent" | "undefined" | "null" | "present";
type CountedOwner = {
  marker: Marker;
  count: number | null;
};
type TreeWitness = {
  itemCount: number;
  changeCount: number;
  deadCount: number;
  rootNodeCount: number;
  rootLeafCount: number;
  rootLeafWithoutItemCount: number;
  rootLeafWithoutItemOrDeadCount: number;
  itemWithoutRootLeafCount: number;
  itemWithoutRootLeafOrChangeCount: number;
  repeatedRootLeafCount: number;
};
```

Use fixed named family properties, not arbitrary records of caller-selected
classes. Use the same `CountedOwner` distinction for optional singleton maps.
BOARD needs a separate owner marker and `_board` marker. Panelization needs
its owner marker, exact named-array counts, the two nested closure counts,
two activation booleans and `Si.model === ai.model` witness. `Ht` needs the
three fixed branch aggregates. Each tree's `TreeWitness` is summed into its
branch, and tree counts are returned separately. User net names and primitive
values never leave the frame. The leaf enforces128 trees,65,536 total inspected
collection entries,64 levels of tree depth and528,384 retained descriptor
reads. The strict result cap is8KiB. Every returned string is a fixed ASCII
label or admitted hexadecimal document ID, so its native string-length cap
also bounds UTF-8 bytes. The facade independently checks encoded bytes.

The tree witnesses compare original object references using intrinsic Set
membership, without reading leaf geometry or invoking leaf getters. They
describe discrepancies, not proven orphan objects. Native insertion adds to
`items` and `changeList` before updating the root; removal deletes from `items`
and adds to `deadList` before root removal. The two pending-aware discrepancy
counts preserve that distinction. See `PCB@3936749` and `PCB@5040763`.
Count each root's nodes and leaves with that same global traversal budget and
no cycle. Do not infer that equal cardinality
means equal membership. Recheck original singleton, map, tree, set and array
references and sizes before return.

The program retains every required field descriptor it reads and rechecks
those references before returning. It separately rechecks original Map/Set
prototypes and sizes. Count-only panel arrays validate dense own data slots,
but do not retain the geometry objects inside those slots. Walked tree-child
references and the two panel border-array references are retained. This is
one synchronous sample, not content-identity or continuous-observation proof.

The facade decoder checks the exact fixed fields, marker/count consistency,
tree-count relationships, witness inequalities and the exact aggregate
collection-entry budget formula. Unknown fields, duplicate JSON keys,
negative-zero counters, exception-bearing replies and claimed authority
fields refuse. Returned data and all false authority flags are frozen.

For a later empty-only eligibility predicate, nonempty ordinary families or
exceptional geometry roots would reject before geometric decoding. The
diagnostic itself should still report those valid populated states. A lazy
null owner must remain distinguishable from an allocated empty owner.
Source-proved lazy absence can be modeled explicitly; missing closure bindings
are not zero. Preserve separate markers for optional raw fields and refuse
accessors or unexpected inherited shadows.

Do not emit an inferred `listedPersistentRootMembershipEmpty` claim in this
first census. Return the observations and leave
`completeModelMembershipVerified`, `emptyRootPcbVerified`,
`completeLiveBaselineVerified`, `sourceOwnershipVerified`,
`queueCompletionVerified`, `saveAuthorized` and `executionAuthorized` false.
The remaining work is the scene/tool exclusions, complete stored source
correlation, original worker ownership and interval-bound producer/effect
proof, not more public getter polling.

## Reachability and limits

All listed bindings are declared in the same bundle's outer closure as the
Save handler at `PCB@10798714`. Existing scope inspection reaches that closure
without calling Save. Source reachability is therefore established for a
fixed observer design; runtime availability of every new binding is not.
V8 may omit or optimize a binding. A missing binding must fail without another
scope index, debugger pause, vendor patch or global alias fallback.

No fundamental source-access impossibility was found. The remaining obstacles
are live qualification of this fixed census, secondary scene/tool observations,
then correlation with source and producers. The prior three model samples do
not supply that evidence. This census also cannot prove that
the source decoder loaded every stored record successfully. Full selected-
branch history and document/asset invariants remain independent requirements.

## Focused evidence

`CURRENT_PCB_DIAGNOSTIC_ROOT_INVENTORY_FUNCTION` is12,838 UTF-8 bytes, SHA-256
`b7bbf6d7fee73c528d3100aeffe6bc358eabb5bace66a3270802fe1a745e5092`.
The original PCB source was rehashed after review and remained byte-exact.

Eight focused tests pass under Node24.18.0 with the maintained test-isolation
preload. They cover all17 raw family counts, watcherless/unsupported model
contents, distinct lazy markers, populated BOARD and panel roots, all three
spatial branches, pending-aware reference discrepancies, malformed layouts,
accessors, inherited shadows, aggregate/tree/depth limits, cycles, decoder
contradictions and privacy of native keys/values.

A real local inspector executes only the self-authored fixture and this fixed
leaf with side-effect checking enabled. Populated trees pass; a state-changing
proxy trap refuses without incrementing its counter. The first inspector test
refused the captured scalar tree counter. Replacing the local counters with
a newly allocated budget object passed the same effect-checked test without
changing the limits or disabling effect checking. This is synthetic evidence,
not qualification of the custom EasyEDA Electron/V8 runtime.

Targeted strict type-aware Oxlint reports zero warnings or errors. The first
whole-project typecheck found only the concurrently changing integration
fixture's missing `rootInventory` property, outside these two owned files.
It is not reported as a passing typecheck; final integrated verification belongs
to the parent batch. No full suite or native application launch was performed.

This leaf's research and focused validation were transport-free. Subsequent
same-day parent integration adds the fixed census as a fourth diagnostic sample
in the runner and native transport. That integration does not establish connected
EasyEDA runtime qualification, complete model membership or an empty-root proof,
and does not authorize any writer. The function bytes and hash above are unchanged.
