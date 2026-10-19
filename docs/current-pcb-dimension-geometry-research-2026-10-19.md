# Current PCB Dimension geometry

Research date: 2026-10-19. The smallest useful next PCB read adapter is a
bounded `pcb_PrimitiveDimension.get/getAll` projection through the existing
captured native `dimension-getAll` receiver. It would expose measurement
coordinates, line width, type, layer, precision and lock state. It would not
infer rendered measurements, actual annotation units or complete source
membership. The implementation status below records subsequent source work;
it is not connected validation. No vendor code, documentation example or CAD
action was executed.

## Public contract and source pins

The official beta [getAll method](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivedimension.getall.html)
accepts optional layer and lock filters. The beta
[get method](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivedimension.get.html)
documents a scalar ID and describes array input. The installed declaration
explicitly supplies scalar and array overloads at645318 and645605. The initial
adapter should accept only empty `getAll` arguments or a distinct nonempty
bounded `primitiveIds` array, requiring every requested ID to exist.

The [dimension enum](https://prodocs.easyeda.com/en/api/reference/pro-api.epcb_primitivedimensiontype.html)
has `Length Dimension`, `Radius Dimension` and `Protractor Dimension`.
The [coordinate-set contract](https://prodocs.easyeda.com/en/api/reference/pro-api.tpcb_primitivedimensioncoordinateset.html)
uses eight coordinates for Length and six for Radius or Angle. These describe
geometry, not a separately validated rendered value. The declaration confirms
the enum at620424 and coordinate union at621554.

Source files were rehashed during this review. Paths are relative to
`resources/app/assets/`; offsets are zero-based JavaScript UTF-16 positions.

| Source | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-api/0.3.50.ab46409c/api.js` | 1,964,920 | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| `pro-api/0.3.50.ab46409c/api-types.d.ts` | 1,733,380 | `d5fe990034c55001302ea6c3f704c2d4b88cdf23253cc5293b3bad62a32b9def` |
| `pro-ui/3.2.196.26ed3d6c/js/ui.js` | 17,456,671 | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |
| `pro-pcb/3.2.193.682ed44e/js/pcb.js` | 10,976,299 | `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33` |

## Native projection and the unit mismatch

The native `dimension-getAll` registration at PCB10344964 concatenates Length
manager `Do`, Radius manager `wo`, then Angle manager `Ho`. Each manager's
inherited `getAllItem` at7946904 visits only existing `stateWatcher` views.
There is no parent filter. Full native serialization precedes facade bounds.
See the prior [identity review](current-pcb-dimension-image-identities-2026-10-19.md#dimension)
for the complete loaded-view scope and its separately recorded empty-family
live case. That case does not validate nonempty geometry.

The handler calls the existing serializers at4693729 for Length, 4780847 for
Radius and4696346 for Angle. These read existing model/text scalars. The
coordinate helpers allocate new arrays and multiply their existing coordinates
by ten. The handler also multiplies serialized width by ten. The public
mapper at API1438612 passes those results directly into `ns`, whose constructor
at1438906 stores them. The adapter must not scale these numbers a second time.

| Dimension type | Helper | Native fields in coordinate order | DTO size |
| --- | --- | --- | ---: |
| Length | `Pge` at10293851 | left x/y, start x/y, end x/y, right x/y | 8 |
| Radius | `bge` at10293681 | end x/y, start x/y, textPosition x/y | 6 |
| Angle | `Ige` at10294047 | start x/y, center x/y, end x/y | 6 |

Coordinates and line width use the existing PCB geometry convention of mil.
Preserve exact operation order and numeric values; do not round or compute
an inferred length, radius or angle. The Radius text anchor belongs to the
native coordinate tuple. It is not a complete glyph bounding box.

The native handler writes `unit:x.getInstance().unit` after spreading the
serializer's fields. This overwrites each Length/Radius model's own unit;
the Angle serializer has no unit field. Consequently the returned `unit` is
the current canvas unit for every row, even if an individual dimension uses
another annotation unit. Length and Radius view getters at4691686 and4778968
read the real model units before this overwrite, but those original views are
not returned. The public SDK mapper inherits the mismatch.

Use `canvasUnit` for this observation, limited to reviewed ordinary units
`mm`, `cm`, `inch` and `mil`, with an explicit statement that it is not the
coordinate unit or verified annotation unit. Do not expose a bare `unit`
field that invites conversion of the mil coordinates. This is a narrower
native DTO, not public-object return parity. The class declaration at621944
limits the dimension unit property to those four enum members; other native
canvas-unit strings should refuse until reviewed.

Other proposed fields are `primitiveType:"Dimension"`, bounded
`primitiveId`, boolean `primitiveLock`, integer `layer`, exact `dimensionType`,
the type-sized numeric `coordinateSet`, nonnegative `lineWidth`, and integer
`precision` in0..4. Existing strict finite-number and signed-zero checks apply.
Omit annotation content, font size, color, text-follow defaults, parent/group,
partition and z-index. Native serializers may read unprojected fields, but the
facade should not invoke DTO accessors while copying selected data.

## Use complete enumeration for both methods

Native `dimension-getByIds` at10344617 uses the generic `rr` lookup at3873886,
which searches many unrelated object managers, before calling `toJSON` and
choosing a coordinate helper. It does not first establish Dimension-family
membership. Do not use that callback in the new adapter.

Instead use the already captured fixed `dimension-getAll` with `{}` for both
methods. Copy and validate the complete family twice, bracket every awaited
call with the existing original frame/project/branch/tab/receiver checks, then
select requested IDs in caller order. Missing IDs must refuse, not silently
drop. At most256 complete rows,256 requested IDs,256 characters per ID and
393,216 UTF-8 evidence bytes fit the existing geometry adapter. Double samples
must compare the entire bounded family, including unrequested peers.

No new RPC, public SDK object, arbitrary callback, selection change, source
export, Save or writer is needed. The source path already admitted for identity
observation supplies all proposed fields. This makes the implementation
feasible without the inaccessible polygon-manager boundary described in the
[polygon report](current-pcb-polygon-identities-research-2026-10-19.md).

## Focused verification before publication

Tests should cover all three native-shaped rows, exact tuple lengths and order,
unscaled mil values, document-unit changes, all required own data properties,
unsupported types/units, duplicate and missing IDs, sparse/accessor coordinate
arrays, finite bounds, negative widths, precision bounds and owner drift.
An unrequested invalid or changed peer must refuse an explicit-ID request.
Unprojected getters should remain uninvoked.

Exercise actual registered callbacks and offline schemas as well as the fixed
program in a synthetic VM. Update catalog counts, coverage routes, bundled
startup expectations and limitations together. Keep current generic type lookup
restricted to its existing families. A nonempty disposable live case can follow
publication and fresh installed admission; source review and synthetic tests
alone do not establish it.

## Implemented candidate

The current geometry schema and fixed program now implement this bounded
`get/getAll` subset. The catalog has17 methods. Two current-native routes were
added alongside the existing legacy methods, so the774 distinct-method status
counts remain unchanged, including450 omissions. Execution route counts are
346 guarded,94 blocked and2 partially blocked. These are multi-profile
implementation counts, not universally callable methods.

On pinned Node24.18.0/npm11.16.0 with core dumps disabled,77 focused geometry,
registration and coverage tests passed. TypeScript and targeted strict
type-aware lint passed with zero warnings. The generated inventory matches
the added routes. The bundled-startup assertion is updated to17 but was not
run against the unchanged old bundle. Build, final release checks, installed
admission and populated connected validation remain separate root-owned work.
