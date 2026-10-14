# Current PCB Component and Pad observations

Research date: 2026-10-14. Baseline: release150000. The next useful reader slice
is unfiltered Component and Pad IDs, plus a small placement/state projection for
each family. Both can use the existing captured ordinary-PCB receiver pattern.
They should remain native task equivalents, not complete SDK object replicas.

This note comes from official documentation and inert installed-source reads.
It does not establish implementation, connected admission, live validation,
saved membership or writer authority. No live application, bridge, project, profile
or production file was accessed for this research.

## Sources and existing coverage

The installed editor package is 3.2.206.715d940d. Paths below are relative to
`resources/app/assets/`. Every file was rehashed. Offsets are zero-based
JavaScript UTF-16 string positions, not byte offsets.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-api/0.3.50.ab46409c/api.js` | 1964920 | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| `pro-api/0.3.50.ab46409c/api-types.d.ts` | 1733380 | `d5fe990034c55001302ea6c3f704c2d4b88cdf23253cc5293b3bad62a32b9def` |
| `pro-ui/3.2.196.26ed3d6c/js/ui.js` | 17456671 | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |
| `pro-pcb/3.2.193.682ed44e/js/pcb.js` | 10976299 | `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33` |

Baseline `api-coverage.json` lists the four methods as legacy public subsets
through `easyeda_control_exact_read` and/or `easyeda_control_sdk_read`. Those
routes carry runtime guards and no current live claim. They are not registered
as Component/Pad capabilities in the current restricted PCB tools. Preserve
those older routes and add a separately identified current equivalent.

The official Component [getAll](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivecomponent.getall.html)
and [getAllPrimitiveId](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivecomponent.getallprimitiveid.html)
methods take optional layer and lock filters. Pad
[getAll](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivepad.getall.html)
and [getAllPrimitiveId](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivepad.getallprimitiveid.html)
take optional layer, net, lock and pad-type filters. All four pages mark the
methods beta. Installed declarations at lines19901,19933,23459 and23490 agree
on these signatures. This proposal accepts only empty arguments.

Retain the receiver, owner, project, branch, tab, frame, URL and double-sample
contracts in [the existing reader research](current-pcb-readers-research-2026-10-14.md)
and [geometry research](current-pcb-geometry-research-2026-10-14.md). Do not call
the public UI router or infer current admission from the declaration inventory.

## Exact read paths

| Family | Public API and UI | Fixed native callback |
| --- | --- | --- |
| Component | API1426362; UI `wU.getAll` at17290349 | `pcb/extensionAPI/component-getAll`, PCB10336493 |
| Pad | API1410928; UI `LK.getAll` at17314711 | `pcb/extensionAPI/pad-getAll`, PCB10370750 |

Both public ID methods invoke their full `getAll` and extract IDs. They do not
have a cheaper identity-only callback. The native handlers also serialize the
full existing view before the facade can discard fields. Output bounds do not
bound that work, cancel it or remove its dependency chain.

Use a fixed literal `{}` argument with the captured native receiver. Component
destructures its filters; `undefined` would fail. Pad currently ignores its
native argument. The public Pad mapper applies filters after object construction.
Component native filtering uses `aZe` at10331506 to map `primitiveLock` to
`locked`; it is not a field-name mismatch.

Both managers inherit `iu.getAllItem` at7946805. It iterates existing model
entries and emits only their existing `stateWatcher` views. Component `rL`
starts at8002754 and uses `Ms`; Pad `Vde` at7948891 uses `Jn`. Module setup
instantiates `Kt` at10792723 and `gr` at10792996 before registering the extension
handlers. There is no missing-view initialization in these enumeration calls.

## Component serialization and bounded output

`Le.toJSON` at7397863 has a longer read chain than its identity result suggests:

- Existing footprint cache lookup through `Zi.getItem`; custom footprints use
  their source footprint UUID. `Dm.getItem` at4312086 is a Map lookup. An absent
  required footprint logs an error and can then throw; do not convert this into
  an empty component list.
- Existing device cache lookup through `hs.getItem`; `ob.getItem` at4026747
  reads its Map. The serialized `device` can be undefined when no cached device
  is found. Neither lookup invokes the neighboring asynchronous `add`/`parse`
  paths or fetches a library.
- Attribute enumeration through `Le.attributes` at7388086 and each `yr.toJSON`
  at7384285. That serializer reads existing text/model fields and calls
  `getFontCache` at7381314. Font lookup at3977492/3978262 only checks the current
  cache. `isEqual` reads fields and `hasOutline` at3975925 checks array length.
  It does not call font extraction, `i_`, text-box refresh or font upload.
- Pad and Via lists through `getPads` at7391299 and `getVias` at7391475. These
  return or filter existing child arrays. Pad-length lookup at4185703 reads a
  Map. `MR.getInstance` at4185266 may allocate its empty singleton, but that
  allocation does not alter a design, fetch a resource or schedule a Save.
- Native identity, layer, position, rotation, lock and attribute-map getters.
  The view at7386930 delegates to the existing Component model at4313813.
  The reviewed getter path does not invoke neighboring setters or commands.

The native callback copies the returned record, scales `position.x/y` by10
and converts `rotation` from radians to degrees. The position is a native `S`
point. Copy its own finite numeric `x` and `y` data properties; do not require a
plain-object prototype or traverse point methods.

The smallest useful complete projection is:

| Output | Native value | Contract |
| --- | --- | --- |
| `primitiveId` | `globalIndex` | Nonempty bounded string, unique within the returned array |
| `primitiveType` | Fixed `Component` | Loaded-view family label, not saved ownership proof |
| `layer` | `layerId` | Exact finite integer, accept only the declared supported layer profile |
| `x`, `y` | `position.x/y` | Already mil; copy without another scale or rounding |
| `rotation` | `rotation` | Already degrees; copy without normalizing its range |
| `primitiveLock` | `locked` | Exact boolean |

Installed layer aliases at declaration lines14202 and14208 permit Component
layers1/2 and Pad layers1/2/12. Use those finite literal sets for the first DTO
profile; do not widen them because another native object happens to use a
custom or internal layer.

A required bounded own `attrsMap.Designator` string is a useful optional
extension to that schema, but missing or non-string data must refuse rather
than become `""`. It is not necessary for the first identity/placement subset.
Do not traverse or serialize the whole attribute map merely to get one label.

The public UI path calls `rpt` at17288637 after native return. It adds
`deviceUUID` and `_apiExtenceData` based on the active tab's parsed path, then
splits the 3D association string. The public API builds device/footprint/3D
library objects and interprets BOM/properties. A native-only reader should omit
those enrichments and not guess equivalent library identities.

Component `pads` is also not a reliable parent-child proof. The serializer
mixes pads and vias into one list, transforms IDs with string replacement and
uses a parent-derived regular expression for vias. Do not reconstruct full
child IDs, assert root ownership or expose this list as an electrically verified
pin map. A dedicated association reader needs reciprocal model membership and
full identity evidence.

## Pad serialization, units and nullability

Regular Pad view `Li.toJSON` is at4392722; polygon Pad `bn.toJSON` is at4689759.
Base view getters start at4379186. Regular and inherited models at3517283 and
3530247 read their own or template fields. The getters used here do not invoke
their adjacent setters, rule-resolution methods, render refresh or commands.
Polygon serialization also reads existing geometry and allocates transformed
points/segments. Its inherited `polygonPl` at3532654 uses `getPolygonMatrix`
at3539835. Polygon `multiply3` at1277118 constructs new transformed segments,
`area` at1273952 uses local arithmetic and `reverse` at1274838 constructs a new
polygon. These are distinct from the neighboring mutating geometry methods.
This is more work than a scalar-only DTO implies.

The handler calls `zH` at10297659 and `YH` at10298337 to construct pad shapes.
`zH` handles ordinary shapes and polygon output through `$1` at4006345. `YH`
projects special top/inner/bottom shapes. Both read current styles; neither is a
fresh design-rule calculation. `Hf.toJSON` at3427613 copies existing rule
fields. The callback then overwrites its plain `padRule` with the native model's
`Hf` instance or null. Do not apply a plain-object check to that unused field.

The official [unit contract](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_unit.html)
uses mil for PCB API distances. The callback mixes converted and unconverted
fields, so scaling every number would be wrong:

| Native callback field | Units and behavior |
| --- | --- |
| `center.x/y` | Model values times10, already mil |
| `rotation`, `holeRotation` | Converted to degrees |
| `holeOffset.x/y` | Model values times10, already mil |
| `topSolderExpansion`, `bottomSolderExpansion`, `pasteExpansion` | Model values times10, already mil |
| `holeAspect` | Null, or `ROUND`/`SLOT` tuple with diameter/length already mil |
| `defaultPadShapeAspect`, `specialPadShapeAspect` | Constructed shape tuples; dimensions use `qe(...,3,"mil")`, which rounds to one decimal place |
| Raw `topWidth`, `holeRadius`, `holeLength`, `padLen`, etc. from `toJSON` | Native internal units, not uniformly converted |

`qe` is at5435419. The public Pad mapper additionally rounds center, rotation
and mask-expansion values through API `tt`; Component placement does not get
that same extra rounding. A native DTO must state that it preserves the native
callback precision rather than claiming exact public-object parity.

The basic Pad projection can copy `primitiveId`, fixed family `Pad`, `layer`,
`padNumber` from `num`, `x/y`, `rotation`, `primitiveLock`, `net`,
`metallization` from `plated`, and `padType` from `padTypeAspect`.
Installed pad-type enum line14299 defines0/1/2 as normal/test/mark-point. Keep
those exact values and refuse unknown ones. Net text comes from `showNet`, not
the uppercasing `net` getter. Preserve case and empty-string versus null.
Missing/undefined required net or pad-number fields are unsupported data, not
permission to invent a default. Explicitly supporting undefined later needs
a separate tagged representation rather than silent JSON omission.

Two concrete traps argue against adding holes and rules to the first DTO:

- A holeless pad has `holeAspect:null`; its model `holeRotation` can be
  undefined. The callback nevertheless converts it to degrees, yielding NaN.
  Rejecting every raw nonfinite field would reject valid holeless-pad reads.
  Read and validate only the promised fields. A future hole DTO should branch
  on the explicit hole tuple before inspecting hole-specific scalars.
- `padRule` is nested, but the public mapper reads `u.connectMode`,
  `u.lineClearance`, `u.lineWidth` and `u.lineAngle` at the row's top level.
  These are not populated by the reviewed native callback. Copying that public
  heat-welding projection would reproduce missing values. A future rule DTO
  needs explicit nested own-field validation, units and nullable-mode branches.

Neither native Pad result includes a proven parent-component ID. The official
[ComponentPad class](https://prodocs.easyeda.com/en/api/reference/pro-api.ipcb_primitivecomponentpad.html)
is a separate object associated with a footprint and is obtained through
component-specific getters. Do not classify a native row as a free pad merely
because this callback labels it `Pad`, or infer a parent from an ID prefix.

The neighboring `component-getAllPinsByPrimitiveId` handler at10336874 is not
interchangeable with `pad-getAll`: it uses different conversion expressions for
hole tuples and retains raw offsets. Its component/child ownership contract
and projection need a separate review. Likewise, `pad-getConnectedPrimitives`
at10371471 performs a connectivity search and invokes other serializers. It is
outside this read proposal.

## Recommended implementation boundary

Add four empty-argument current routes: the two ID methods and the two narrow
DTO `getAll` equivalents. Reuse the existing strict receiver program and
complete ordered double samples. Keep output limits, malformed/duplicate-ID
refusals, signed-zero handling, native identity observations around awaits and
the exact active target. No arbitrary callback/topic or public object method
should reach the caller.

ID samples prove only stable observed IDs. DTO samples prove only stable
projected fields. The manager omits models without views and can include
inherited or transient views. Neither result proves complete saved records,
root ownership, connectivity, footprint mapping, fabrication validity or an
inverse/edit baseline. Equal projection samples do not establish equality of
discarded state.

Concrete omissions for this slice are filters, arbitrary-ID reads, full shape
and hole tuples, custom-layer pad stacks, rule/thermal data, attributes beyond
an explicitly selected field, library enrichment, ComponentPad associations,
connectivity and every writer. These are representation or ownership gaps,
not a reason to hold back the bounded identity/placement subset.

Keep the established393216-byte response ceiling and finite bounded scalar
profile. Do not serialize discarded raw DTOs, native font/cache instances,
shape objects or `Hf` instances. One focused projection regression should cover
ordinary and holeless Pad rows, native point objects, raw net spelling,
duplicate identities, invalid required fields and an awaited target change.
Existing release gates and one disposable read-only live check are sufficient
for this slice; it does not need a new broad test matrix.
