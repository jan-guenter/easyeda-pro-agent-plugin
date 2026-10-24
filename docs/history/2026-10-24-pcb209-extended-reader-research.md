# 209 Component, Pad, Attribute, Dimension and Image reader research

Date: 2026-10-24. Starting commit:
`1363bddb4b9a642cc2ca4d042b5c7f85bafbfc17`, installed plugin generation
`0.3.0+codex.20261023213000`. This record covers source research and the new pure
five-family program, decoder and focused tests. It does not claim connected
execution, installation, complete-board coverage or writer qualification.

The work read installed application assets, declarations, maintained schemas,
the offline coverage inventory and official method pages. No EasyEDA tool,
project file, bridge, navigation, Save or design mutation was used. The main
agent owns lifecycle, native integration, coverage and release work separately.

## Exact sources

Application profile is EasyEDA Pro `3.2.209.8a704eab`. Asset versions are separate
from that application version. Paths below are relative to the installed
`resources/app/assets/` directory. Offsets throughout this record are zero-based
JavaScript UTF-16 string offsets, not file byte offsets.

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-pcb/3.2.195.6b67774e/js/pcb.js` | 10991441 | `a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b` |
| `pro-ui/3.2.198.2800f583/js/ui.js` | 17468192 | `3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6` |
| `pro-api/0.3.59.1ca9efb5/api.js` | 1980754 | `e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1` |
| `pro-api/0.3.59.1ca9efb5/api-types.d.ts` | 1814791 | `0a6910f4108f3d09733a9de9176b20c41ccd2a87fc4e335f8d6d656eb054ba72` |

The offline catalog at the starting commit already listed older-generation
`getAll` and `getAllPrimitiveId` routes for these five families. It did not admit
those routes on the separate original 209 owner. Existing 206 geometry schemas
can validate an unchanged DTO shape without conferring their runtime admission.
The new function does not call the old geometry executor.

## Official API contracts

The five current official method pages mark their collection methods beta and
return promises of public object arrays. Installed declarations agree on the
following optional filters. This batch accepts no filters and creates no public
SDK class instances. The example programs on those pages create/delete objects;
none was executed.

- Component permits layer and lock filters. Its public result includes richer
  component/library associations than this native projection.
  [Component.getAll](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivecomponent.getall.html).
- Pad permits layer, net, lock and pad-type filters. The page also distinguishes
  embedded footprint drawing objects from ordinary Pad membership.
  [Pad.getAll](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivepad.getall.html).
- Attribute permits parent ID, layer and lock filters and returns flattened
  public objects. This batch instead preserves the native ordered parent groups.
  [Attribute.getAll](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitiveattribute.getall.html).
- Dimension permits layer and lock filters and returns dimension objects.
  Its declared collection contract alone does not specify native manager order
  or the installed DTO's unit substitution.
  [Dimension.getAll](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivedimension.getall.html).
- Image permits layer and lock filters and returns image objects. The installed
  native collection additionally distinguishes vector Image and Picture DTOs.
  [Image.getAll](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitiveimage.getall.html).

## Installed native and public paths

| Family | Native handler in PCB asset | Public getAll call in API asset | Retained projection |
| --- | ---: | ---: | --- |
| Component | 10340502 | 1430243 | Identity, lock, layer 1/2, mil placement, degree rotation, six raw metadata strings and presence states |
| Pad | 10374759 | 1414809 | Identity, lock, number/net, placement, type, metallization, hole, default copper shape, mask expansion, thermal configuration |
| Attribute | 10415464 | 1497239 | Ordered component groups, child identities, text/style/display scalars, serialized color |
| Dimension | 10348986 | 1443021 | Length/Radius/Protractor type, ordered coordinates, layer, lock, width, precision, observed canvas unit |
| Image | 10361338 | 1448209 | Vector/Picture type, identity, layer, lock, start, dimensions, rotation, mirror |

Every manager used here inherits the view-only `iu.getAllItem()` implementation
at PCB7957387. It iterates the model manager and includes only existing
`stateWatcher` values. The relevant managers are `gr=new nL`, `Kt=new Wde`,
`wo=new qde`, `Lo=new Qde`, `Ho=new Xde`, `Rn=new I7` and `So=new uge`, initialized
around PCB10806859. Empty collections therefore do not prove an empty board.

### Component and Attribute associations

Both handlers call the same `gr.getAllItem()` and map it without reordering when
no filters are supplied. Component serialization is `Le.toJSON()` at PCB7408336.
Its `attributes` getter at7398477 returns `Object.values(this.attrs)` order.
Attribute returns every observed component group, including groups with no
attributes, using that serializer's `ATTR` array. Requiring the two observed
parent sequences to match is source-defined; the reader does not infer parents
from ID prefixes. Matching groups do not prove reciprocal model ownership,
complete stored children or ownership of pads and other footprint contents.

The component serializer reads existing footprint/device/font caches and each
child's existing display metadata. It can allocate the otherwise empty pad-length
singleton, `NR.getInstance()` at4187110, whose `getPadLen()` at4187547 is a lookup.
Missing footprint cache entries can make the serializer fail before the facade
receives any DTO. This batch refuses rather than reconstructing missing data or
contacting a library service. Child pad IDs generated by the component serializer
are not treated as a reciprocal child relationship proof.

The Component projection keeps Designator, Name, Manufacturer, Manufacturer Part,
Supplier and Supplier Part verbatim. The installed public mapper takes them from
`attrsMap`. New `componentMetadataStates` entries record absent, own-undefined or
present for each selected key. Only present strings appear in the DTO. Null,
non-string, inherited or accessor-valued selected metadata refuses; an empty
string stays empty. This is stricter evidence than treating absent and undefined
as one omission. Name formulas remain raw and are not evaluated.

Attribute uses `yr.toJSON()` at7394676 and the existing font cache lookup
at7391705. Distances are multiplied by10 to mil and rotation by180/PI to degrees,
matching the installed public scalar mapper. Key/value visibility, nullable
position state and serialized silk color remain distinct. Color serialization
uses a string-or-null result, so null does not prove raw-model color absence.
Current Name text may already be formula-expanded, unlike Component metadata.
Formula source, font objects, glyph outlines and rendered text are not projected.

### Pad geometry and configuration

The native callback already scales center, hole diameters/offsets and mask values
to mil and rotations to degrees. Unlike the public Pad mapper, this reader does
not round placement and mask values to one decimal place. Native display nets
retain their case and null/empty-string distinction.

ROUND and SLOT holes retain their complete supported tuples. A null hole branches
before reading hole-specific scalars because a legitimate holeless DTO can carry
a non-finite hole rotation. That omission is explicit, not a fabricated zero hole.
Default copper shape uses `XH` at10301575. ELLIPSE, OVAL and RECT preserve existing
dimensions; RECT's fourth value is a corner ratio percentage, not a radius.
POLYGON retains the bounded token sequence emitted by `$1` at4008157. It supports
L, ARC, CARC, variable-degree C and CIRCLE in native pad-style coordinates. Native
serialization rounds to four decimals and can omit tiny or unsupported segments.
It chooses the last available style in layer order1/2/15 rather than supplying a
complete physical-layer stack. No outline reconstruction or placement transform
is performed. NGON, nested/unknown polygon encodings and other unsupported shapes
refuse the whole observation.

Mask mode1/2, both solder values and the single native paste value are retained.
Native null-to-zero scaling cannot prove explicit overrides. Thermal mode0 copies
the `Hf` data fields from PCB3427673 and scales distances/angle; modes1/2 need no
dimensions, and null remains null. No mutating rule resolver is called. These
fields can be inherited and do not prove current poured spokes, rule resolution,
manufacturability or component/symbol pin mapping.

### Dimension and Image details

Dimension joins Length, Radius then Protractor manager order. Coordinate builders
around10297767 yield eight Length or six Radius/Protractor numbers, already in
mil. The callback replaces the returned DTO's unit with `x.getInstance().unit`;
it does not assign the live dimension model's unit. The result therefore calls
this field `canvasUnit`, not a verified annotation unit. No measurement, rendered
label, glyph bounds, text-follow state or parent/partition association is inferred.

Image joins vector `Rn` then Picture `So` order without a parent filter. Vector
`qn.toJSON()` at4838506 serializes the template; the handler also builds a
transformed path string from temporary geometry. Picture `Ms.toJSON()` at4848323
copies its hash and placement without invoking the asset-backed source getter.
The new projection omits both path/template and Picture asset information. The
public constructor can substitute computed dimensions when native dimensions
are zero; this reader preserves zero and labels it observation only. The start
anchor and mirror flag are not rendered bounds or effective mirrored geometry.

## Implemented contract

New source is
[`current-pcb-209-extended-primitives.ts`](../../plugins/easyeda-pro-control/server/src/current-pcb-209-extended-primitives.ts).
The exported fixed `CURRENT_PCB_209_EXTENDED_PRIMITIVES_FUNCTION` accepts only
the original sealed target and phase `observe`. Its complete UI/PCB source
qualification belongs to the original owner, not to JSON arguments or this
function alone. It captures the original ordinary frame and native receiver
before awaiting work, and rechecks their identity plus project/branch/tab state
around each await. There is no caller code, topic, filter or ID selection.

Each snapshot brackets five fixed `getAll` topics with native tab/type identity
reads. Two snapshots require 14 local RPCs inside one CDP call. Complete ordered
projected values, metadata presence states and Attribute group order must match.
These sequential observations are not an atomic lock or proof against a switch
away and back between checks. The 10-second deadline stops later facade dispatch
but does not cancel a native callback already running.

Bounds are 256 rows per family, 256 component/Attribute groups, 256 total Attribute
children, 2048 tokens per Pad polygon, scalar magnitude 1e12, 256 UTF-16 units per
identity, 1024 per selected metadata/key/font/net string, 65536 per Attribute value
and 128 per serialized color. Native and decoded aggregate outputs are each
limited to 393216 UTF-8 bytes. The native serializer runs before these limits.
Sparse arrays, accessors, missing projected values, malformed UTF-16, signed zero,
non-finite numbers, duplicate/cross-family identities and unsupported DTOs refuse.

The native packet is `pcb209-original-extended-primitives-observation`, with five
existing geometry observations and ordered `componentMetadataStates`. The host
decoder independently validates all DTOs, targets, groups, global identities,
metadata presence and aggregate size. It returns deeply frozen
`easyeda-pro-control.pcb209-extended-primitives-observation.v1`, DTO and ID arrays,
ordered Attribute groups and a projection hash. All complete-baseline, source
membership, reciprocal ownership, connectivity, persistence, execution and Save
authority flags remain false. Comparison hashes are not raw source hashes.

Frozen function: 18284 UTF-8 bytes,
SHA-256 `5ae0fa27a7475f96aaad549a7c029ea165fe78788cb8ab0187dcaae86c2e7a63`.
The original owner must consume and journal one attempt before dispatch, retain
the fixed target/receiver through decoding, and keep normal cleanup available
after failure. Lifecycle/native helper/catalog work is integrated separately.

## Verification and remaining scope

Nine focused tests in
[`current-pcb-209-extended-primitives.test.ts`](../../plugins/easyeda-pro-control/server/tests/current-pcb-209-extended-primitives.test.ts)
pass under Node 24.18.0 with the maintained test-isolation preload and core dumps
disabled. They cover populated and empty families, all 14 awaited RPC boundaries,
group/identity collisions, metadata absence/undefined changes, scalar/order
changes, unsupported shapes, descriptors, numeric/text/byte limits, timeout and
independent decoder forgeries. Scoped strict type-aware lint has zero warnings.

An initial synthetic assertion expected native identity reads after every RPC.
The actual contract brackets each snapshot; UI/frame/receiver checks run after
every RPC. The test assertion was corrected to that contract, without changing
the fixed program. Initial style lint findings in host/test source were corrected.
These are offline tests, not connected performance or installed execution proof.

No requested family was omitted. Full public contracts remain intentionally
unsupported: filtered/explicit-ID queries, selected objects and component-child
Pad association need separate contracts; library/3D enrichment can add external
service dependencies; source/model membership, worker/queue qualification and
saved-state proof cannot be inferred from view DTOs. Image assets/full geometry,
special Pad layer stacks, unsupported shape encodings and complete rendered
Dimension/Attribute text need additional readers. No design writer or Save is
enabled by this batch. The main agent owns final frozen verification, coverage,
packaging and any disposable connected validation.
