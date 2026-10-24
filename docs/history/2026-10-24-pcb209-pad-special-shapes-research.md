# PCB209 special Pad style groups

2026-10-24. Researched against main `a9f44a98b80cd257f0ecfdcccb1aae978421ef4d`
and the installed EasyEDA 3.2.209.8a704eab assets below. This is source research
and offline implementation evidence. The new reader has no connected validation
in this record. No project was opened or edited for this research.

## Installed contract

| Asset | Bytes | SHA-256 |
|---|---:|---|
| `pro-pcb/3.2.195.6b67774e/js/pcb.js` | 10991441 | `a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b` |
| `pro-api/0.3.59.1ca9efb5/api.js` | 1980754 | `e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1` |
| `pro-api/0.3.59.1ca9efb5/api-types.d.ts` | 1814791 | `0a6910f4108f3d09733a9de9176b20c41ccd2a87fc4e335f8d6d656eb054ba72` |

Hashes and the relevant complete handlers were rechecked. Offsets below are
zero-based JavaScript string offsets in the named asset. The original UI owner,
source qualification and complete target remain lifecycle prerequisites.

The public [special Pad type](https://prodocs.easyeda.com/en/api/reference/pro-api.tpcb_primitivespecialpadshape.html)
is an array of start/end selectors and shape tuples. It does not establish how
this installed handler expands those selectors. Its
[property getter](https://prodocs.easyeda.com/en/api/reference/pro-api.ipcb_primitivepad.getstate_specialpad.html)
returns the SDK object's copied property, optionally undefined. The installed
wrapper at API offset 1418588 does the same. The new adapter observes native
loaded views and does not construct an SDK object or execute that getter.

The PCB `pad-getAll` handler at offset 10374759 already emits
`specialPadShapeAspect:qH(n.model)`. Adding this projection invokes no new
native topic. `qH`, at offset 10302253, emits an empty array unless the object
is a non-polygon `et` Pad with internal style type 2. That internal style type
is distinct from normal/test/fiducial `padTypeAspect`.

For that case, `qH` emits exactly these ordered groups:

| Native selectors | Style read |
|---|---|
| `[1,1]` | top |
| `[1,2]` | inner |
| `[2,2]` | bottom |

They are style groups, not a physical copper-layer expansion. `getPad`, at
PCB offset 3528043, independently chooses top for layer 1/7/5, bottom for
2/8/6, and inner otherwise. Neither that function nor the `qH` result proves
which physical layers use a Pad or whether an inner layer is unused.

`qe`, at offset 5438487, converts the native dimensions to mil and rounds to
one decimal in this call. RECT's fourth scalar is `ratio * 100`, a corner
percentage. The [public shape documentation](https://prodocs.easyeda.com/en/api/reference/pro-api.tpcb_primitivepadshape.html)
uses a radius term and also describes regular polygons. Installed behavior
governs this native projection; neither description is silently substituted.

## New versioned observation

`observe-pad-shapes` and its `pad-shapes209` stage preserve all earlier v1
programs and decoders. The new packet contains the unchanged complete Pad DTO
observation plus a separate ordered `specialShapeGroups` array. Every observed
Pad has exactly one group entry, including a valid empty group list. Decoder
validation requires its IDs and ordering to match the complete Pad roster.

Supported special shapes are ELLIPSE and OVAL width/height, and RECT
width/height/corner percentage. Dimensions must be finite, nonnegative and at
most 1e12 mil; corner percentage is 0 through 100. Signed zero, coercion,
accessors, partial/reordered/duplicated selectors, unknown shapes and malformed
text refuse. The stage keeps the older default Pad shape contract unchanged.

Each of two samples performs native identity, Pad collection, native identity.
The original receiver, frame and target are rechecked around every awaited RPC.
All six local calls occur inside one fixed CDP request. Both ordered complete
projections must match. The reader retains at most 256 Pads, at most three
special groups per Pad, and 393216 UTF-8 bytes for both native and final results.
Native enumeration precedes these bounds; the ten-second deadline cannot cancel
already dispatched vendor work. Refusal consumes the stage, with original
normal cleanup retained by the lifecycle.

The result explicitly reports `specialShapeScope` as
`native-top-inner-bottom-style-groups` and `physicalLayerExpansionVerified:false`.
An empty group list means only that the native serializer emitted no special
groups. It does not prove uniform or absent physical-layer configuration.
No complete source membership, physical stackup, connectivity, reciprocal
component ownership, rendering, saved state or writer baseline is claimed.

## Concrete omissions

- NGON is declared as diameter and side count, but the installed PCB geometry
  enum at offset 3321906 lacks NGON. The `tC` shape implementation at offset
  3416254 has no reviewed NGON rendering branch. Native creation near offset
  10367700 accepts that supplemental enum but handles both numbers as width and
  height. No native side-count contract has been proved, so both default and
  special NGON shapes remain refused.
- The special serializer has no complete polygon path branch. An inner polygon
  can become a three-scalar POLYGON tuple without its path. Polygon special
  groups refuse. Existing default POLYGON paths retain their native Pad-style
  scope and do not prove per-layer equivalence or board transforms.
- `XH`, at offset 10301575, selects top for ordinary top/multilayer Pads and
  otherwise dereferences bottom. Inner-only models can lack bottom and fail in
  the native handler before serialization. Widening a schema would not fix that
  behavior; layer IDs remain limited to the existing 1/2/12 contract.
- A successful native read does not establish public SDK instance/getter parity.
  Historical filtering of a published new snapshot may return these groups,
  but does not execute fresh public `get` or grant present-state authority.

## Focused verification

Seven pure cases cover distinct/empty groups, unchanged full DTO fields,
receiver and target replacement around all six awaits, changes only in the
middle group, malformed and unsupported data, row/text/aggregate bounds,
deadline consumption and independent decoder forgeries. Two native-protocol
cases check exact generated program/hash parity, fixed transport reconstruction,
unchanged request budget and purpose rejection. All nine passed. Targeted
strict type-aware lint passed without warnings after correcting test
import/declaration ordering and Unicode-literal style errors. No runtime guard
was changed for those fixes.

The fixed generated function is 14829 bytes with SHA-256
`82cc18f4569a60d05183677463fb8b96ecd3781bba8c2a3d29bed1c9f4cdc9f0`.
Complete integration checks, publication, installation and a separately admitted
live case are recorded by the containing batch. Synthetic observations do not
validate populated special Pads in EasyEDA.
