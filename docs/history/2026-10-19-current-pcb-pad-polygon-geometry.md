# Current PCB polygon pad paths

The current Pad geometry reader now returns the bounded native polygon path
instead of a `details:not-projected` marker. This applies to the existing
`pcb_PrimitivePad.get/getAll` routes and the global-Pad portion of
`pcb_PrimitiveComponent.getAllPinsByPrimitiveId`. No new tool or native topic
is required. All complete-family samples, target checks and runtime admission
remain in place. Source implementation and synthetic validation do not establish
connected validation on a populated polygon pad.

## Public contract and exact producer

The official [Pad shape type](https://prodocs.easyeda.com/en/api/reference/pro-api.tpcb_primitivepadshape.html)
admits a polygon source array or nested complex arrays. The broader
[polygon source type](https://prodocs.easyeda.com/en/api/reference/pro-api.tpcb_polygonsourcearray.html)
also permits rectangle tokens. The implemented observation follows the narrower
installed native producer. The existing
[getAll contract](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivepad.getall.html)
has optional filters; this adapter continues to accept only empty getAll
arguments or an exact requested-ID list for get. Documentation examples were
not executed.

The following files were read as data and rehashed on 2026-10-19. Paths are
relative to the installed `resources/app/assets/` directory. Offsets below
are zero-based JavaScript UTF-16 positions.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-api/0.3.50.ab46409c/api.js` | 1,964,920 | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| `pro-api/0.3.50.ab46409c/api-types.d.ts` | 1,733,380 | `d5fe990034c55001302ea6c3f704c2d4b88cdf23253cc5293b3bad62a32b9def` |
| `pro-pcb/3.2.193.682ed44e/js/pcb.js` | 10,976,299 | `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33` |

Native `pad-getAll` at PCB10370738 already sets
`defaultPadShapeAspect:zH(n.model)` while serializing each loaded pad view.
`zH` at 10297659 detects polygon pads, visits layers 1, 2, 15, and retains the
last available pad style. It calls `$1(style.pl,10)`. This is the style's
existing polygon, not a physical-layer-resolved or placement-transformed
outline. Inherited models can select template styles or flipped top/bottom
styles. The adapter must not infer an effective board transform from these
tokens; it retains the separate existing x/y/rotation fields unchanged.

`$1` at 4006345 emits a new flat token array. It multiplies point coordinates
and circle radius by 10, yielding mil, and uses `we(...,4)` at 3214815 to round
to four decimal places. ARC/CARC sweep remains degrees with the same rounding.
The single positive 360-degree arc branch yields `CIRCLE`. Otherwise, line
segments produce `L` runs, arcs preserve `ARC` versus `CARC`, and Bezier segments
produce `C` with their existing interior controls. The native Bezier constructor
at 1131463 permits at least two control points, so the reader preserves variable
degree rather than imposing the documentation's cubic-only label.

The converter reads existing primitives and returns a fresh array. It does not
call Polygon `toJSON`, `refreshChildrenByOutline`, a create-area getter or a
path decoder. The already-reviewed Pad serialization remains unchanged; see
the [Pad source review](2026-10-14-current-pcb-component-pad-research.md#pad-serialization-units-and-nullability).
The API mapper at 1411049 forwards `defaultPadShapeAspect` into `Dr` at 1411721;
its `getState_Pad` at 1414366 returns the assigned value without an additional
polygon conversion. The facade does not construct that SDK object.

## Returned fields and limits

`defaultCopperShape` for a polygon is now:

```json
{"shape":"POLYGON","pathSource":[0,0,"L",10,0,10,10,0,0],"coordinateSpace":"native-pad-style"}
```

The exact ordered path array participates in both complete samples, including
unrequested pads. No token, point, control or arc is normalized or approximated.
The accepted native output grammar is an empty array, a four-item `CIRCLE`
with nonnegative radius, or an initial point followed by `L`, `ARC`, `CARC`
and `C` blocks. L/C blocks contain one or more point pairs; ARC/CARC blocks
contain a sweep and one endpoint pair. R and nested complex arrays refuse
because this pinned producer does not emit them. Unknown tokens, incomplete
blocks, holes/accessors/inherited elements, extra array properties, signed zero,
nonfinite values and out-of-range scalars refuse before another sample.

Each path is limited to 2048 tokens. Existing limits remain 256 complete pad
rows, scalar magnitude 1e12 and 393216 UTF-8 evidence bytes. The complete-family
byte limit can be reached before the row or path limits. Those bounds apply
after the vendor's enumeration and serialization and do not cancel its work.

Exact serialized paths are useful geometry evidence, but have concrete limits.
The producer omits tiny lines/arcs and unsupported primitive kinds. It can
therefore return an empty path for a nonempty model, and it appends the final
native endpoint without proving a closed polygon. It reports only the selected
style, omits special physical-layer stacks, and does not establish inherited
mirroring or a complete board-coordinate transform. The adapter does not close
paths, infer bounds, claim rendered copper or establish saved membership,
connectivity, manufacturing validity or a writer baseline.

Fill/Polyline/Region identity and geometry remain separate omissions for the
concrete reasons in the [polygon-family audit](2026-10-19-current-pcb-polygon-identities-research.md).
Their effectful serializers are not called by this change.

## Verification

Focused generated-program tests cover all emitted token families, mixed and
variable-degree sequences, empty paths, exact numeric preservation, unchanged
pad placement, unrequested peer drift, schema refusal, malicious descriptors,
token overflow, the inclusive 2048-token limit and complete response overflow.
Omitted special-stack getters remain uninvoked. The existing frame/receiver,
timeout, selection-order, component-pad association and scalar tests continue
through the same program and host validator. Tests are synthetic, not live CAD
or saved/reopened validation. Final test counts and release evidence are owned
by the combined release record.
