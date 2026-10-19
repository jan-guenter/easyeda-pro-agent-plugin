# Current PCB polygon identity feasibility

Research date: 2026-10-19. The three requested unfiltered identity methods are
`pcb_PrimitiveFill.getAllPrimitiveId`,
`pcb_PrimitivePolyline.getAllPrimitiveId`, and
`pcb_PrimitiveRegion.getAllPrimitiveId`.

The underlying native family selectors can read IDs without serializing
polygons. The installed extension boundary does not expose those selectors or
their original managers. The available family RPCs serialize first and can
rebuild live children. The object-tree event is serializer-free for these
families, but has different membership rules and no correlated response.
It is not a complete substitute. No new executable adapter is justified by
this review.

This is an inert source and official-documentation review. No vendor JavaScript,
documentation example, CAD call, project file, live bridge or debugger was used.
Existing separately pinned legacy routes are unchanged. No complete canvas,
saved membership, rendering or writer authority follows from this report.

## Official contracts and pinned sources

All three official methods are beta and return `Promise<Array<string>>`.
Fill's optional arguments are layer, net and lock. Polyline uses net, layer and
lock, in that order. Region uses layer, rule-type array and lock. A proposed
initial adapter would accept empty arguments only. The published examples
create and delete shapes; this review did not execute them.
[Fill method](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivefill.getallprimitiveid.html),
[Polyline method](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivepolyline.getallprimitiveid.html),
[Region method](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitiveregion.getallprimitiveid.html).

The following installed files were read and independently hashed as data.
Paths are relative to `resources/app/assets/`. Offsets below are zero-based
JavaScript UTF-16 string positions, not byte offsets.

| Source | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-api/0.3.50.ab46409c/api.js` | 1,964,920 | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| `pro-api/0.3.50.ab46409c/api-types.d.ts` | 1,733,380 | `d5fe990034c55001302ea6c3f704c2d4b88cdf23253cc5293b3bad62a32b9def` |
| `pro-ui/3.2.196.26ed3d6c/js/ui.js` | 17,456,671 | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |
| `pro-pcb/3.2.193.682ed44e/js/pcb.js` | 10,976,299 | `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33` |

API wrappers at 1403182 for Fill, 1397828 for Polyline and 1383359 for Region
call their own `getAll`, then map the resulting SDK objects to IDs. They do
not bypass serialization. UI topic constants at 8953824, 8955318 and 8956370
identify the same native family getters reviewed below.

## Exact family membership before serialization

All three selectors visit existing Polygon, Rectangle, then Circle views in
that order. Managers `ut`, `$t` and `Jt` are constructed at PCB10792877,
PCB10792756 and PCB10792745 respectively. Their classes are `Jde` at7988479,
`Hde` at7957637 and `Ude` at7956041. Each inherits `iu.getAllItem` at7946904,
which iterates the original model manager and returns only models that already
have a `stateWatcher`. It does not construct a missing controller. Thus these
are loaded-view memberships, not all stored models.

| Family | Selector | Native types | Parent treatment |
| --- | --- | --- | --- |
| Fill | `Ege` at10347713 | `Fill Region`, `Slot Region` | Excludes every view with a parent. |
| Polyline | `tve` at10371699, followed by the filter at10375804 | `Line`, `Board Outline` | Excludes every view with a parent in `getAll`. |
| Region | `Dge` at10384344 | `Constraint Region`, `Prohibited Region` | No parent filter. |

The collection read and type/ID/parent projections themselves have no traced
design write. Base model manager `Ni` at3172844 owns a Map; `iterator` at3173039
visits it without adding or sorting entries. View `globalIndex` at3859880
reads the existing model ID, whose base getter at3424496 reads `_globalIndex`.
`getParent` at3862096 reads `_parent`. Polygon, Rectangle and Circle `type`
getters at4651803, 4623480 and7891946 read their existing model's type.
These facts describe a feasible internal implementation, not an accessible
extension owner or a guarantee that all models have loaded.

## Why the available getters are not read-only identities

Native `fill-getAll` at10352400, `polylines-getAll` at10375804 and
`region-getAll` at10391515 map the views through `toJSON` before returning
data. Projecting only `globalIndex` afterward does not avoid that work.

Polygon `lt.toJSON` at4662106 calls `refreshChildrenByOutline` when
`isSimplify` is true. Its view method at4655833 can create Line/Arc
controllers through `nd.addByModel` and `ih.addArcByModel`, set their parents,
and replace `_children`. The underlying model method at4104977 can generate
child identities and rebuild model children. Existing children can make the
refresh a no-op, but there is no admitted pre-serialization observer that
proves this condition for every selected view. Region serialization also
reads/clones its rule selector. Calling it solely to inspect an ID still
takes the full serialization path.

The `getByIds` variants do not solve this problem. They select matching views
before invoking the same serialization. They also require known IDs and do
not establish complete family enumeration. Filters on the `getAll` RPCs are
applied after serialization and cannot make the unfiltered call safe.

## Why original managers cannot currently be captured

PCB1015912 defines the message-bus container; PCB1016971 exports its instance
as `WJ.MSG_BUS_PCB`. Its published fields hold buses and bridges. They do not
hold `ut`, `$t`, `Jt` or their model managers. The three manager instances and
family selector functions remain lexical bindings inside the PCB bundle's
enclosing function, whose final initialization calls start at10969417.

Reading a registered RPC wrapper does not expose the handler's lexical
environment. The reviewed bus implementations register wrapper callbacks,
not manager properties. A function's source text is likewise not the original
manager owner. See the separate
[renderer-owner audit](current-pcb-text-observer-research-2026-10-19.md#renderer-globals-do-not-expose-the-required-owners).

This review found no fixed RPC that enumerates these original three managers
into identities without serialization. It reviewed the family RPCs, generic
object queries, net queries, object-tree event, relevant global assignments
and manager uses. This is a conclusion about the pinned inspected boundary,
not proof that no future vendor API can provide it. No closure extraction,
runtime patch, prototype replacement or arbitrary code route was attempted.

## The serializer-free object tree is a different observation

`aYe` at6299310 obtains the same three manager arrays for its polygon-family
branches. It reads type, parent and ID without calling polygon `toJSON`.
Its default node builder at6305363 inside `nYe` at6300990 produces identity strings;
`Y0` at6298625 and `CN` at6298685 encode those IDs. Natural-sort helper `Vx`
at3241333 creates a sorted result array instead of preserving manager order.

This route has three concrete mismatches:

1. It excludes only views whose parent is a Component `Le`. Fill and Polyline
   exclude every parent in the API getter, while Region excludes none. The
   tree does not return enough parent information to reconstruct those three
   exact memberships. Renaming this list as complete API output would hide
   both potential omissions and additions.
2. `getAllItems` at10859050 is a subscription, not a read RPC. It publishes
   loading roots immediately, then schedules a ten-millisecond callback that
   publishes `getAllItemsBack`. The response contains no request nonce, target
   tab or original captured manager identity. Bracketing the wait with current
   context checks does not prove which request produced a matching event.
3. The publication also reaches the real object-tree UI subscriber at
   UI16881868 and changes its loading/tree state. It is not an isolated
   identity transport. A no-token repeated event is not an original-owner
   completion proof, and filtering a mismatched result is not completeness.

An object-tree inspection adapter could separately document its own semantics,
but it would not finish these three methods and is not recommended as a
substitute in the identity catalog.

Generic region/point queries at10301016/10301341 use selection/filter logic
and `Ey` serialization. Net membership at10323117 also serializes through
`Ey`. Selected-ID retrieval only observes the current selection. Selecting
everything first changes editor state and still does not prove the required
manager memberships. These alternatives do not remove the gap.

## Minimal implementation once the missing boundary exists

The practical requirement is one fixed, reviewed native observer with access
to the original managers, not a public arbitrary private-topic or JavaScript
executor. A vendor-supported ID endpoint or a separately reviewed installation
that exports such an observer could supply it. An ordinary packaged extension
using the current SDK cannot create lexical access merely by registering a
new method name.

The observer should accept only a literal family discriminator and bind the
same exact ordinary PCB frame, project, branch and tab as current identity
reads. It should iterate the three original managers, bound the complete input
count before projection, retain manager order, apply the family/type/parent
rules above, and copy only existing IDs. It must not call `toJSON`, geometry,
outline, child-refresh, asset or create-area getters, initialize controllers,
change selection, or expose caller-selected properties or callbacks.

Existing facade checks can then require two complete ordered samples,
20,000 IDs, 256 characters per ID and 393,216 UTF-8 evidence bytes, rejecting
duplicates, sparse/accessor values, changing owner/context and overflow without
truncation. A direct manager path must account for missing `stateWatcher`
entries explicitly; it must not silently change loaded-view semantics to
all-model semantics. Synthetic tests need simplified polygons whose
serialization/refresh accessors throw, all parent variants, mixed manager
ordering, malformed identities and owner drift. A nonempty disposable live
case remains a separate requirement after publication and fresh admission.

Until that owner-bound observer exists, keep these three current-runtime
routes unavailable with the concrete reason above. No geometry, Fill mode,
Region rule projection, positive generic type lookup or writer should be
enabled as part of this identity-only change.
