# Current PCB Attribute geometry

Research date: 2026-10-19. A narrow `pcb_PrimitiveAttribute.get/getAll`
reader is feasible using the already captured native `attribute-getAll`
receiver. Reuse the current String scalar projection, but retain Attribute
parent groups and use `value`, `keyVisible` and `valueVisible` in its DTO.
This report is source research, not an implementation or connected validation.
No vendor code was imported, example executed, design opened or CAD call made.

## Exact sources and public contract

Installed paths below are relative to
`/mnt/c/Program Files/easyeda-pro/resources/app/assets/`. All three files were
rehashed. Offsets are zero-based JavaScript UTF-16 positions, not byte offsets.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-api/0.3.50.ab46409c/api.js` | 1,964,920 | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| `pro-api/0.3.50.ab46409c/api-types.d.ts` | 1,733,380 | `d5fe990034c55001302ea6c3f704c2d4b88cdf23253cc5293b3bad62a32b9def` |
| `pro-pcb/3.2.193.682ed44e/js/pcb.js` | 10,976,299 | `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33` |

The official [getAll reference](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitiveattribute.getall.html)
marks the method beta and accepts optional parent, layer and lock filters.
The [get reference](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitiveattribute.get.html)
describes a scalar ID and also documents array input. The installed declarations
at 434456 and 434737 explicitly provide both overloads. Array lookup can omit
missing IDs. The installed scalar implementation at API 1491351 returns an
empty array when no match exists, despite the declared `undefined` alternative.
Do not reproduce that ambiguity in the narrower adapter.

The [Attribute class](https://prodocs.easyeda.com/en/api/reference/pro-api.ipcb_primitiveattribute.html)
provides scalar getters and setters. Its
[constructor](https://prodocs.easyeda.com/en/api/reference/pro-api.ipcb_primitiveattribute._constructor_.html)
and [X getter](https://prodocs.easyeda.com/en/api/reference/pro-api.ipcb_primitiveattribute.getstate_x.html)
allow null coordinates. Installed declarations at 392511 and 393323 agree.
That declaration does not justify coercing null native coordinates to zero.
The current mapper instead unconditionally multiplies `position.x/y` by 10.
The initial native DTO should require finite numeric coordinates, report
`positionIsNull` separately, and refuse null or missing coordinate fields.

Both methods already have legacy public-subset coverage. This would add a
separately pinned current native equivalent, not remove two wholly omitted
methods. The advertised offline SDK/coverage tool was unavailable to this
research subagent; local declarations and the checked-in coverage inventory
were used instead. Requery discovery from the host before activation.

## Native path and field meanings

PCB `attribute-getAll` registration at 10411430 returns one
`{attrs, parentPrimitiveId}` group per existing component view. Each `attrs`
array is `component.toJSON().ATTR`; the parent ID comes from that enclosing
component. Manager `getAllItem` at 7946904 includes only existing
`stateWatcher` views. There is no full stored component inventory and no
reciprocal parent lookup. Empty groups and their order are meaningful evidence.

API `getAll` at 1492186 maps those groups to `Ec` objects, flattens them and
then applies filters. Constructor `Ec` at 1492763 merely assigns its arguments;
getters at 1493273 through 1493913 return assigned fields. It does not resolve
formulas, fetch fonts or derive geometry. The native `getByIds` registration at
10411138 likewise serializes all existing components before selecting IDs.
Use the existing fixed `getAll` route for both adapter methods and select only
after complete double-sample validation.

`yr.toJSON` at PCB 7384285 is the same serializer used for parentless String
views. Its scalar fields permit this projection:

| Native field | Proposed Attribute DTO | Treatment |
| --- | --- | --- |
| `globalIndex`, `locked` | `primitiveId`, `primitiveLock` | Own bounded string and boolean |
| Enclosing group ID | `parentPrimitiveId` | Observed association only |
| `layerId` | `layer` | Native integer layer ID |
| `position.x/y` | `x/y` | Multiply by 10, mil in the data coordinate system |
| `key`, `value` | `key`, `value` | Preserve exact strings, including empty strings |
| `showKey`, `showValue` | `keyVisible`, `valueVisible` | Preserve booleans, not actual rendered visibility |
| `fontFamily` | `fontFamily` | Preserve exact string, including empty |
| `fontSize`, `strokeWidth` | `fontSize`, `lineWidth` | Multiply by 10, mil |
| `origin` | `alignMode` | Integer 1 through 9 |
| `rotation` | `rotation` | Multiply by 180, then divide by Math.PI, degrees |
| `reverse`, `reverseExpansion`, `mirror` | `reverse`, `expansion`, `mirror` | Boolean, distance multiplied by 10, boolean |
| `positionIsNull` | `positionIsNull` | Preserve separately from numeric position |
| `silkColor` | `silkColor` | Null or nonempty bounded serialized color string |

Use `primitiveType:"Attribute"`. Position, font, width, angle, reverse,
expansion, mirror, lock and alignment conversions match API 1492186 and the
existing String reader. Preserve operation order for floating-point conversion;
do not round or normalize angles. Do not add a net field. `positionIsNull` and
`silkColor` are explicit native observations beyond the public getter set.

The view's `value` getter at PCB 7377447 returns `model.value`. Its setter at
7377483 can evaluate a Name formula through the parent. `getFormulaName` at
4325200 substitutes the parent's attribute map into a leading-`=` expression.
The serializer independently includes `formulaName` from
`parent.attrsMapSource[key]`; the view and model accessors at 7388234 and
4314525 read the backing map. Therefore Attribute `value` can differ from the
raw Name formula exposed by the Component metadata reader. It is current
model text, not proof of either the stored expression or freshly evaluated
display text. Do not call the evaluator or equate those two values.

Initially omit `formulaName`. It can be undefined and is not part of the public
Attribute getter contract. A future optional raw-map field needs its own
missing/undefined/null contract and must remain distinct from `value`.
`getTextValue` at 7380532 combines key/value and display flags locally, but the
reader should not claim rendered text, glyph bounds or visibility from it.

`silkColor` is `color.toString() || null` in the serializer. Null does not prove
an absent raw model color, and a nonempty string is not validated CSS. The
same limitation already applies to String. Font cache, outlines, model type,
z-index, partition/group, source ownership and saved state remain omitted.

## Read effects

The native callback serializes the whole component. `Le.toJSON` at 7397863
reads footprint/device caches, all attributes, existing pads/vias and pad
lengths before returning `ATTR`. Missing required footprint data can throw;
do not convert that into an empty family. `attributes` at 7388086 creates an
array from current attribute values. The existing
[identity review](2026-10-19-current-pcb-attribute-identities.md) records the
complete component read chain and its original offsets.

`yr.getFontCache` at 7381314 reads existing templates or cache entries. The
template getter at 3978262 is a Map lookup; cache lookup at 3977492 scans
existing entries. It can call `getText`, but does not call the neighboring font
loader, setters, `updateCurrentBox` or render refresh. Do not construct new
`yr` views: their constructor at 7376314 invokes font-family correction and
`Gp.addText`, which are effectful. Existing getter serialization does not.

This inspected path requests no design mutation, Save, library fetch or font
load. Local RPC bookkeeping and possible empty pad-length singleton allocation
remain incidental effects. Native enumeration and component serialization run
before response limits; a facade timeout does not cancel that vendor work.

## Initial adapter and focused tests

Extend `current-pcb-geometry.ts` and its fixed generated program. Keep exact
active ordinary PCB target/frame/receiver checks and all existing runtime pins.
`getAll` accepts only `{}`. `get` accepts 1 through 256 distinct IDs, returns
caller order and refuses if any requested ID is absent. Parent/layer/lock
filters, scalar `get`, SDK object construction, setters and writers stay out.

Retain ordered `attributeParentGroups` with all parent IDs and complete ordered
child ID lists, including empty groups. Validate every parent before children,
then reject duplicate parents, duplicate attributes and any parent/attribute
ID collision. Keep all groups even for selected-ID reads. Compare full groups
and projected rows twice before selecting requested IDs. The result must not
claim reciprocal ownership, complete source membership or persistence.

Reuse the geometry limits: 256 groups and 256 total Attribute rows, 256
characters per identity, 1024 per key/font family, 65536 per value, 128 per
serialized color, scalar magnitude at most 1e12 and 393216 UTF-8 evidence bytes.
Check outer/per-group/aggregate counts before flattening. Refuse sparse arrays,
accessors, inherited projected properties, undefined fields, coercions,
non-finite values and signed zero. Copy only own data fields; never walk the
omitted font object or arbitrary attribute getters. Full-family bounds apply
even when the caller selects one ID.

Focused synthetic tests should cover:

- Multiple and empty parent groups; ordered selection; empty whole-family
  success; missing requested IDs; all collision and descriptor refusals.
- String-equivalent distance/angle arithmetic, empty strings, independent
  display flags, true `positionIsNull` with numeric positions, null coordinate
  refusal, serialized-color null/empty distinctions and all bounds.
- Name `value` differing from `formulaName`, with no evaluator or omitted-field
  getter called; no claim that source formula or rendered text was returned.
- Parent/order/empty-group changes with identical flattened IDs, and drift in
  any projected scalar on unselected rows between samples.
- Wrong frame/receiver/runtime, failed native callback, timeout and oversized
  complete compound evidence. Require no downstream mutation calls.

After implementation, update current geometry discovery, both coverage routes
and their regressions. A separately admitted populated disposable case is the
useful connected check. An empty Attribute response alone does not validate
formula, style or geometry projection.
