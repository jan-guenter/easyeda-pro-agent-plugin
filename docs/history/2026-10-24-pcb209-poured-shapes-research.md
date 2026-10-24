# Existing Poured copper serialization on 3.2.209

2026-10-24. Source research and implementation record for the combined Arc and
Poured reader batch. Base main is `eaa4c9be57c5f9d4bf6438e434009f5e4c99a43c`.
No live application call, copper rebuild, edit or explicit Save is part of
this research. Connected validation remains separate.

## Sources and public contract

The official [Poured collection](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivepoured.html)
and [Poured instance](https://prodocs.easyeda.com/en/api/reference/pro-api.ipcb_primitivepoured.html)
references describe collection access and pour-fill associations. The installed
implementation determines this version's grouping, serialization and effects.
Documentation examples were not executed.

Reviewed installed sources:

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| PCB `3.2.195.6b67774e/pcb.js` | 10,991,441 | `a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b` |
| API `0.3.59.1ca9efb5/api.js` | 1,980,754 | `e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1` |
| API declarations | 1,814,791 | `0a6910f4108f3d09733a9de9176b20c41ccd2a87fc4e335f8d6d656eb054ba72` |

All locations below are zero-based UTF-16 offsets in those complete assets.
The mounted sources were read as inert data. No application owner, closure
or callable function was obtained through this research.

The installed API's `DT.getAll` at API1382641 calls the Poured collection
service and groups returned native fills by `pourPrimitiveId`. Its public
instance `primitiveId` is the parent pour ID, while `pourFills[].id` retains
the individual fill ID. Its style projection gives nonzero line width only
to `90grid`, collapsing the separate native `45grid` interpretation. The
new reader therefore returns native fill rows and explicit ordered parent
groups. It does not present those fill IDs as public instance identifiers.

## Native callback and effect audit

The fixed callback `pcb/extensionAPI/poured-getAll` at PCB10417368 enumerates
the existing `Ai` manager and returns each view's `toJSON` with its parent's
global index. `Ai` is the `Sfe` manager at9093392. Inherited `getAllItem`
at7957486 includes only models that already have `stateWatcher` views. It
does not materialize missing views or establish complete stored membership.

`si.toJSON` at4714659 reads global index, partition, layer, showNet, style,
grid line width, clearance, optimization, optimization width and copperPath.
The scalar accessors in `si` at4712627 read existing model fields. Partition
uses the view's parent projection at3863031, falling back to the model's
string projection at3424638. `getParent` returns the existing parent. These
reads do not create, modify or rebuild a pour border or copper result.

`k0.copperPath` at4678736 delegates to `Ic.source` at3888069, which invokes
`df` at3883319. That serializer creates response arrays. For a single
counterclockwise full circle it creates two temporary mathematical arcs and
a temporary path, without registering models or controllers. Reviewed leaves
include the `q` constructor/build3/pointOn family at1284694, direct
start/end/isCCW at1289617, empty geometry base at1080675, numeric checks
at1045932, angle normalization at1065364, point construction/addition
at1060380/1062805, and `jMe` construction/build7 at1268912/1269561.
The involved success paths use scalar math and newly allocated geometry;
invalid native parameters may throw. `Qd` at3410702 reads radius and sweep
for the tiny-arc check. Line and Bezier endpoint accessors return their
existing endpoints/control points.

This callback avoids the polygon serializer's `refreshChildrenByOutline`
path. That distinction does not admit Fill, Polyline, Region or Pour-border
collection callbacks, which can create polygon child models/controllers.
Local RPC bookkeeping and possible lazy identity-environment initialization
remain incidental effects of the surrounding original-owner observation.

## Fields, units and omission limits

Rows retain all observed native fill identifiers, parent associations,
partition strings, layer, net, four raw styles, widths/clearance and ordered
copper contours. Native numeric distances and path coordinates use **ten mil
per unit**; no blanket mil conversion is applied. ARC sweep tokens use degrees.
Null and empty nets remain distinct. Negative dimensions, signed numeric zero,
nonfinite values, malformed fields and unsupported styles refuse.

The grid-profile builder at4143320 and `BSe.getStyleAndWidth` at4145682 can
forward an undefined optimization value. Each returned row preserves
`optimizationState` as `present`, `undefined`, `absent` or `null`, paired with
a boolean or explicit null. Missing or undefined values are not coerced to
false. Other required serialized fields must be present.

The pinned `df` grammar emits CIRCLE and coordinate runs with L, ARC or C.
Consecutive lines omit repeated L commands; C preserves variable-degree
Bezier control points. Every contour is retained in order, including
geometrically duplicate contours. There is no polygon constructor, Boolean
operation, topology inference, closing step or conversion to generated copper.

The serializer can omit tiny or unsupported segments. CIRCLE retains only
`rx`; ARC retains endpoints and sweep without an independent second radius.
Its output cannot establish arbitrary elliptical geometry. Circle splitting
can change representation, and an empty serialized list proves only an empty
observation. No freshness, connectivity, winding, hole topology, rendered
boundary or fabrication geometry is established.

## Implementation and focused checks

`current-pcb-209-poured-shapes.ts` adds a distinct fixed program and strict
independent decoder. Existing v1 readers remain unchanged. Two complete ordered
samples must match. Each sample has native identity reads before and after its
one collection call, for six local RPCs in one CDP evaluation. Original frame,
target, receiver and timer ownership are rechecked around each awaited call.
The ten-second deadline does not cancel vendor work already dispatched.

The limits are 256 native fill rows, 256 contours per fill, 8,192 tokens per
contour, 32,768 tokens across the complete sample, and 393,216 UTF-8 bytes for
both native packet and final result. Bounds refuse whole; they never truncate.
Parent groups preserve first-parent appearance and native fill order. The
host independently reconstructs those groups and rejects duplicate fills,
target mismatch, contradictory state tags or altered associations.

Six focused VM/decoder tests passed on pinned Node24.18.0 with isolated
test roots and core dumps disabled. They cover populated mixed paths,
optimization states, parent ordering, owner changes at each await, sample
drift, malformed/accessor data, row/path/token/byte bounds, timeout and
independent decoder failures. These are synthetic checks, not connected
copper validation. An initial test-generation command used the wrong working
directory and failed before creating the test file; it was corrected with
absolute paths. The initial targeted lint found one declaration-order issue;
the declarations were reordered without changing runtime behavior.

Native packing, lifecycle integration, final unchanged-payload checks and
publication belong to the combined batch. The new observation supplies no
writer, explicit Save or complete live/source/SQL baseline authority.
