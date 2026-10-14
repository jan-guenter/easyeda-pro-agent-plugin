# Current Pad shape, mask and thermal observations

Research date: 2026-10-15. Recommendation: enrich the existing current Pad DTO
with default copper-shape dimensions, mask mode/values and a nullable thermal
configuration. Reuse `pcb/extensionAPI/pad-getAll`; no new RPC, SDK instance,
rule refresh or native geometry calculation is needed. The component child-pad
reader can reuse the same global Pad projection. This is source research, not
implementation or connected validation. No application, profile or project data
was accessed.

## Pinned sources

Paths are relative to the installed application's `resources/app/assets/`.
Hashes were rechecked; all offsets below are zero-based UTF-16 positions.

| Source | SHA-256 |
| --- | --- |
| `pro-pcb/3.2.193.682ed44e/js/pcb.js` | `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33` |
| `pro-api/0.3.50.ab46409c/api.js` | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| `pro-api/0.3.50.ab46409c/api-types.d.ts` | `d5fe990034c55001302ea6c3f704c2d4b88cdf23253cc5293b3bad62a32b9def` |

The ordinary and polygon Pad serializers are PCB4392722 and4689759. The existing
callback at10370738 spreads that record, then replaces shape, expansion, angle
and `padRule` fields. Inspect the returned fields, not the discarded serializer
values. The existing [Component/Pad research](current-pcb-component-pad-research-2026-10-14.md)
records enumeration and serializer side-effect boundaries.

## Default copper shape

Official [getState_Pad](https://prodocs.easyeda.com/en/api/reference/pro-api.ipcb_primitivepad.getstate_pad.html)
returns a shape tuple or undefined. The
[shape contract](https://prodocs.easyeda.com/en/api/reference/pro-api.tpcb_primitivepadshape.html)
and declaration lines14214-14260 enumerate `ELLIPSE`, `OVAL`, `RECT`, `NGON`
and `POLYGON`. API1410928 passes native `defaultPadShapeAspect` unchanged;
getter1414366 returns it without geometry reconstruction.

PCB `zH` at10297659 selects top for layer1/12 and bottom for layer2. For ordinary
shapes it returns `[type,width,height]`, adding `ratio*100` for `RECT`. Width
and height pass through `qe`5435419: internal distance times10, rounded to0.1mil.
Do not rescale them or claim unrounded dimensions. Rectangle percentage is
dimensionless; it is not the physical corner radius named by the public docs.
Native radius uses `min(width,height)/2*ratio`, corroborated by6249808.

Recommended field: `defaultCopperShape` with exact `ELLIPSE`/`OVAL` type and
width/height, or `RECT` plus `cornerRatioPercent`. Preserve zero produced by
native rounding and finite bounded values; do not clamp or normalize them.
These are observed parameters, not a rendered outline or manufacturing check.
In particular native `eC`3416190 uses width alone for its `ELLIPSE` circle path;
do not infer a physically elliptical outline from unequal reported dimensions.

Known exclusions should remain explicit:

- `POLYGON`: `zH` delegates to `$1`4006345, whose CIRCLE/L/ARC/CARC/C encoding
  filters degenerate segments and rounds coordinates to four decimals. A bounded
  complete path interpretation is separate work, not a bounding-box substitute.
- `NGON`: declared diameter/sides semantics are not established by the ordinary
  native shape path. Native `go`3321842 enumerates ELLIPSE/RECT/OVAL/POLYGON;
  generic `zH` applies distance conversion to both numeric fields. Do not guess
  a sides count from that output.
- Physical pad stack: `YH`10298337 emits three fixed top/inner/bottom tuples
  only for nonpolygon model type2. Its `[1,1]`, `[1,2]`, `[2,2]` ranges are not
  complete physical-layer membership. The
  [public special-pad contract](https://prodocs.easyeda.com/en/api/reference/pro-api.tpcb_primitivespecialpadshape.html)
  is broader. Empty special output alone does not prove a uniform stack.

For the native-recognized `POLYGON` only, recommend an explicit
`{shape:"POLYGON", details:"not-projected"}` branch. Require the outer tuple to
have exactly two dense own entries, the exact tag and an own array-valued path;
do not interpret, forward or claim equality of its omitted path contents. This
preserves placement reads without pretending polygon geometry is supported.
Keep SDK-only `NGON` refused until its native representation is established.
Unknown tags, accessors, sparse tuples or malformed supported shapes refuse
rather than silently omit. The native-recognized labels are exactly ELLIPSE,
OVAL, RECT and POLYGON, not every label accepted by an SDK writer's enum.

## Mask mode and expansion values

The [public mask interface](https://prodocs.easyeda.com/en/api/reference/pro-api.ipcb_primitivesoldermaskandpastemaskexpansion.html)
has optional top/bottom solder and paste values; layer applicability differs
between SMD and through-hole pads. Its
[getter](https://prodocs.easyeda.com/en/api/reference/pro-api.ipcb_primitivepad.getstate_soldermaskandpastemaskexpansion.html)
can return null. Installed declarations10295-10304 and14793 agree.

The native representation is different. `I4`3511612 holds `expansionType`,
`pasteExpansion`, `topSolderExpansion` and `bottomSolderExpansion`. Mode1 follows
rules; mode2 is custom, shown by `cloneToCustom`, native creation10365292
and the property UI at8238899. The serializers retain `expansionType`; callback
10370738 multiplies each of the three expansions by10, already mil. API1410928
instead rounds them and duplicates the one native paste value into both public
paste fields, without exposing mode. Do not repeat that duplication as two
independent observations.

Recommended field: `maskExpansion: {mode:1|2, topSolder, bottomSolder, paste}`
with finite bounded mil values and negative/zero values preserved. The callback
has already coerced native null to zero and undefined to NaN through multiplication.
Therefore zero does not prove an explicit zero override. A nonfinite promised
scalar must refuse; do not convert it to zero or null. The public input permits
partial configurations, so missing scalar cases need an explicit unsupported
representation if the implementation later elects to retain those rows.

The ordinary view getters at4390156/4390449/4390612/4390787 read existing model
fields. Polygon getters4685558/4685705/4685868/4686043 likewise read existing
fields. Inherited model getters3538183-3539153 may select template values and
swap top/bottom according to layer/flip. These are loaded observations, not
proof of local overrides or applicability to both faces.

Do not call `w0`3513057 to refresh them. It resolves net rules and assigns model
expansion fields. The reader does not call it, so even mode1 values do not prove
fresh rule evaluation or final fabrication apertures. Another native property projection
near4171043 instead emits null for mode1; that is another representation, not
permission to substitute null for the callback's observed numbers.

## Thermal configuration

The [public thermal interface](https://prodocs.easyeda.com/en/api/reference/pro-api.ipcb_primitivepadheatwelding.html)
defines divergent/direct/nonconnected modes; spacing, width and angle do not
apply to the latter two. Declarations14322-14344 use the strings `Divergent`,
`Direct-connected` and `Non-connected`.

Callback10370738 replaces the serialized plain `padRule` with the native `Hf`
instance or null. `Hf`3427613 has own `connectMode`; only mode0 constructs own
`lineClearance`, `lineWidth` and `lineAngle`. Numeric mapping0/1/2 is established
by `SZe`10362847. Distances are internal units and angle is radians: native
creation near10365300 divides public distances by10 and converts degrees to
radians; native export near4171525 performs the inverse.

Recommended `thermal` union: null; `{mode:1|2}`; or
`{mode:0, clearance, spokeWidth, angle}` using mil and degrees. Read only fixed
own data fields, accepting the reviewed native class instance rather than
requiring a plain-object prototype. Branch on null/mode before inspecting
mode0-only fields. Validate finite bounds before and after conversion; unknown
modes, inherited/accessor fields and unavailable mode0 values refuse.

This avoids the public mapper defect at API1410928: it tests `u.padRule` but
reads `u.connectMode` and the other fields at the row's top level. It neither
reads the nested values nor performs the needed unit conversions. Do not use
that result as a second independent rule proof. Native inherited getter3532264
can return the footprint template's rule. Null means no per-pad configuration
in this loaded projection, not no copper connection; rule resolution and
actual poured spokes remain unverified.

## Implementation boundary

Add these fields only to the existing schema and fixed projection in
`current-pcb-geometry.ts` and `current-pcb-geometry-program.ts`. Keep the exact
retained receiver, two complete ordered samples, own-data checks, scalar/row/
byte bounds, whole-request refusal and child/global correlation. Do not traverse
raw instances, invoke their methods, refresh rules or add caller-selectable
topics. Native serialization still precedes output bounds; no new cancellation
or computational bound is implied.

Extend the existing focused tests for common shapes and ratio units, both mask
modes with negative/zero values, null and all three thermal modes, inherited
fields and unavailable scalars. This needs no new harness. Polygon paths,
custom physical stacks, fresh rule resolution, fabrication validity, saved
membership, reverse ownership and symbol-pin mapping remain outside the DTO.
