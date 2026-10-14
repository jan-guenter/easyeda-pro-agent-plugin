# PCB pad holes and component child membership

Candidate `0.3.0+codex.20261015003000`; publication and installation results will be recorded
at delivery. Target remains EasyEDA3.2.206.715d940d, API0.3.50.ab46409c,
UI3.2.196.26ed3d6c and PCB3.2.193.682ed44e. External pins are unchanged.

## Implemented scope

Existing current-version Pad `get` and `getAll` DTOs gain `hole`, either null
or a strict round/slot object. Both hole types include diameter, offsetX,
offsetY and rotation; a slot also includes length. Dimensions and offsets use
mil. Rotation is relative to the pad in degrees. Zero dimensions are preserved
as native observations; this does not approve a drill or fabrication process.
Null holes skip unused hole-specific scalars, including native NaN rotation.

`eda.pcb_PrimitiveComponent.getAllPinsByPrimitiveId` is added to the existing
`easyeda_control_pcb_geometry` tool. It accepts one `primitiveId` plus the exact
PCB target. Two complete compound samples establish that the component is
observed, enumerate its native child-pad list, and correlate those full IDs and
shared scalar fields with the global Pad collection. Returned Pad DTOs preserve
child order. Complete component/Pad collections remain bounded and participate
in stability checks, including rows not returned to the caller.

The relationship is explicitly named
`native-component-child-list-and-global-pad-membership`.
`reciprocalParentVerified:false` and `symbolPinMappingVerified:false` remain
part of the result. The operation does not infer parents from ID prefixes or
claim that pad numbers identify schematic pins.

The tool catalog remains15tools/seven skills. The geometry catalog grows from10
to11method schemas. The exhaustive SDK inventory still contains774distinct
mounted methods; an additional current route does not add a declaration.

## Reviewed implementation

Offsets below are zero-based UTF-16 positions. PCB SHA-256 is
`217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33`;
API SHA-256 is
`021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76`.

The global Pad callback at PCB10370750 emits null or ROUND/SLOT hole tuples,
converts their dimensions and offsets to mil, and converts rotation to degrees.
It substitutes zero for falsy dimensions. The facade copies only the promised
fields, checks own data properties and dense arrays, and applies no new scale
or rounding. Regular and polygon serializers are at4392722 and4689759.
The public Pad mapper at API1410928 reads that same tuple; the official
[hole](https://prodocs.easyeda.com/en/api/reference/pro-api.ipcb_primitivepad.getstate_hole.html),
[offset](https://prodocs.easyeda.com/en/api/reference/pro-api.ipcb_primitivepad.getstate_holeoffsetx.html)
and [rotation](https://prodocs.easyeda.com/en/api/reference/pro-api.ipcb_primitivepad.getstate_holerotation.html)
contracts describe those properties.

The component-specific native callback at PCB10336862 obtains
`gr.getItem(id).getPads()`. The view's `getPads` at7391299 returns its existing
pad array. Child records contain full IDs. The facade correlates those IDs,
pad numbers, raw nets, layers, locks, metallization and pad types with global
Pad rows. Geometry comes from the global Pad callback because the child callback
uses different coordinate rounding and hole units. The official
[component method](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivecomponent.getallpinsbyprimitiveid.html)
returns ComponentPad instances; this adapter returns the documented narrower DTO.

## Concrete remaining gaps

- Reverse ownership needs an independent parent observation. The public API
  mapper at1427274 passes its input component ID into the child constructor;
  the parent getter at1421025 returns that supplied value. It cannot corroborate
  the forward relationship. Native parent data exists in serializer `Ey`, but
  region lookup invokes `boxSelect`, net lookup omits disconnected pads, and
  selection/point lookups are filtered. Those paths are not used by this reader.
- Symbol-pin mapping needs symbol/device/footprint binding and pin semantics.
  A repeated pad number or an observed net string cannot establish that mapping.
- Complete copper shapes, custom layer pad stacks, masks and thermal/rule data
  need their own projections. Native nested `padRule` differs from the public
  mapper's top-level field assumptions. Library/device/3D enrichment, BOM and
  manufacturing exports remain separate work.
- Current schematic/symbol/PCB writers and eight metadata writers still need
  native structure-job completion and complete SQL-effect proof. Lost-handle
  supervision and quarantined-opening closure retain their existing limits.

## Validation scope

Focused regressions extend the existing geometry tests. They cover round/slot/
holeless projection, malformed holes, child order, missing or mismatched child
rows, empty membership for an existing component and changed complete samples.
Twenty-four focused geometry/identity/registration cases and34coverage cases
pass. Both strict TypeScript configurations, full zero-warning type-aware lint,
build/sanitizer, generated coverage, compatibility, package/repository/privacy
checks and all seven official skill validators pass. Main and independent
source reviews accepted the implementation. Required GitHub CI and installation
results will be recorded at delivery.

Final source340 SHA-256:
`89557604fe3f015abf64a2998b4758ed32dece7080eea9dd2d2536223ec33688`.
Runtime3 SHA-256:
`5c2f1d985e018b203263017151cf1313fcd50d9255dd6b703f3cd1054b2fba8c`.

Installed213000 metadata validation belongs to the preceding release and does
not validate these new hole or child-list implementations. Their installed
live check remains separate. No production design or project record is in scope.
