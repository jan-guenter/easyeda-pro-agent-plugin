# `sys_Math` clipping research

Researched 2026-10-13. Documentation and installed-source findings are separated
below. Neither establishes connected execution. The installed application bundle
was read as text, not imported or executed. No project, CAD/UI session or private
profile was accessed for this research.

## Official documentation

### Method contracts

Each method takes `polygon1: TSYS_MathPolygonInput` and
`polygon2: TSYS_MathPolygonInput`. The published signatures are synchronous.

| Method | Return type | Documented meaning |
| --- | --- | --- |
| `intersects` | `boolean` | Region overlap includes containment, partial overlap and boundary contact. Its example explicitly expects `true` for rectangles sharing an edge. [Reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_math.intersects.html) |
| `union` | `TSYS_MathPolygonGroup` | Set union preserves outer-ring/hole associations. Examples produce one polygon for overlapping rectangles and two polygons for disjoint rectangles. [Reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_math.union.html) |
| `subtract` | `TSYS_MathPolygonGroup` | Directional difference, first input minus second. Subtracting an interior rectangle produces a hole. A disjoint subtraction returns an equivalent original shape as a group, with no promise of identical vertex encoding. [Reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_math.subtract.html) |
| `intersection` | `TSYS_MathPolygonGroup` | Intersection result. An empty array denotes no intersection. The examples cover area overlap and disjoint regions, not edge-only or point-only contact. [Reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_math.intersection.html) |
| `xor` | `TSYS_MathPolygonGroup` | Symmetric difference preserves outer-ring/hole associations. Identical inputs return `[]`. The example warns that passing an empty result to `calculateArea` throws an unrecognized-input-format error. [Reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_math.xor.html) |

The `intersects` boundary-contact promise cannot be replaced by an undocumented
assumption that `intersection(...).length > 0` has the same meaning. The group
type represents polygon rings; the reference does not explain how a zero-area
shared edge or point would appear in that group. This is a contract gap to check
against the installed implementation, not evidence of its behavior.

### Input and result representations

The documented input union accepts a discrete point array, native polygon source
array, `IPCB_Polygon`, `IPCB_ComplexPolygon`, or polygon group. The public type
does not require a design object for supplied-coordinate calculations.
[Input type](https://prodocs.easyeda.com/en/api/reference/pro-api.tsys_mathpolygoninput.html)

`TSYS_MathPolygonGroup` is an array of `ISYS_MathPolygonWithHoles`. Each member has
`outer: Array<ISYS_MathPoint>` and `holes: Array<Array<ISYS_MathPoint>>`.
The stated purpose is to retain which holes belong to which outer ring. Multiple
disconnected output polygons are therefore part of the contract, and flattening
all rings would lose information.
[Group type](https://prodocs.easyeda.com/en/api/reference/pro-api.tsys_mathpolygongroup.html),
[Polygon with holes](https://prodocs.easyeda.com/en/api/reference/pro-api.isys_mathpolygonwithholes.html)

The native `TPCB_PolygonSourceArray` can contain numbers and `L`, `ARC`, `CARC`,
`C`, `R`, or `CIRCLE` tags. Its reference explicitly promises automatic closure
when start and end differ. It describes line segments, two arc encodings, cubic
Bezier segments, rectangles and circles. Arc angles use degrees; negative arc
angles turn clockwise.
[Native source-array type](https://prodocs.easyeda.com/en/api/reference/pro-api.tpcb_polygonsourcearray.html)

That closure statement belongs to the native source-array page. The clipping
examples use discrete point arrays without a repeated endpoint, but neither the
input type nor the group/holes pages state an equivalent closure rule for those
representations. They also do not specify required winding, a fill rule, output
ring closure, ring ordering or a canonical first vertex. These are undocumented
in the reviewed pages; do not turn example formatting into a general promise.

### Units and stability

The clipping pages do not specify units or unit conversion. The `calculateArea`
example says coordinates use the input coordinate system and that PCB coordinates
are normally in mil. For groups, that method subtracts hole areas from outer-ring
areas. Interpreting area in squared input units follows from the formula and
examples; the clipping methods do not promise conversion to the editor's current
display unit.
[Area reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_math.calculatearea.html)

No development-stage warning appeared on the five reviewed method pages. The
general stability policy distinguishes extension API versions from application
versions, allows behavior-affecting bug fixes in minor releases and permits
TypeScript declaration changes in patch releases. The current website therefore
does not qualify an installed generation by itself.
[Interface stability policy](https://prodocs.easyeda.com/en/api/guide/stability.html)

### Undocumented limits and adapter consequences

The reviewed method and type pages do not define the following:

- Validity rules for self-intersections, repeated vertices, zero-area rings,
  overlapping holes, holes outside their outer ring, nested islands or empty
  group inputs across all five methods.
- Numeric tolerance, coordinate range, finite-number checks, curve approximation
  error, snapping or rounding policy.
- Maximum vertices, rings, groups, result size, time or memory cost, cancellation,
  concurrency or reentrancy.
- General exception types, partial-result behavior, input mutation, logging or
  shared-state effects.

These omissions require separate source review and bounded adapter policy. A
useful initial adapter can accept fewer representations than the SDK, but must
publish that subset and preserve the complete admitted result, including empty
groups and outer/hole relationships. It must not claim the `intersects`
boundary-contact contract based only on successful area-overlap cases.

## Installed source

The reviewed file is
`/mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-api/0.3.50.ab46409c/api.js`,
1,964,920 bytes, SHA-256
`021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76`.
The adjacent declarations are 1,733,380 bytes, SHA-256
`d5fe990034c55001302ea6c3f704c2d4b88cdf23253cc5293b3bad62a32b9def`.
This is the installed suffixed API generation, not an assertion that a matching
npm version has identical bytes. Offsets are zero-based UTF-16 string positions.

| Function | Start offset | Source-derived behavior |
| --- | ---: | --- |
| `Au` | 1849584 | Splits an event segment. Its sole warning prints the event when that existing segment already has equal endpoints. |
| `Hpe` | 1850010 | Segment intersection uses floating cross products, division and interpolation; the returned point can differ from an exact integer crossing. |
| `WA` | 1850532 | One-point intersections split only when the point differs from both endpoints. Two-point overlaps use separate splitting branches. Same-operand overlap returns before those branches. |
| `Ype` | 1851384 | Sweep-tree ordering, including contour IDs for otherwise tied collinear events. |
| `zpe` | 1851974 | Sweep queue, neighbor intersections and event insertion/removal. |
| `Gpe` | 1852656 | Result-event ordering uses repeated adjacent swaps. It is quadratic in the worst case, not merely a logarithmic sweep. |
| `Wpe` | 1853620 | Walks selected events into contours and retains their hole assignments. |
| `S9` | 1853988 | Builds segments only from consecutive entries through `length - 2`; equal endpoints are skipped. |
| `Xpe` | 1854374 | Builds initial events and increments the module-global contour counter. |
| `C_` | 1854939 | Shared Boolean implementation. Its disjoint-box shortcut follows event construction and counter increments. |
| `C9`, `A9`, `L9`, `KA` | 1855402, 1855437, 1855472, 1855507 | Union, subtraction, XOR and intersection dispatch to `C_`. |
| Public `SYS_Math` class | 1855542 | `intersects` uses bbox filtering then checks a nonempty clipping result. Boolean methods return `A_`'s full group conversion. |
| `A_` | 1859036 | Preserves each returned outer ring and all associated holes; an empty clipping result becomes `[]`. |

The reviewed closure includes the splay tree, heap, robust orientation helpers,
their scratch arrays, event comparison, splitting, sweep and contour assembly.
There is no editor RPC, project read, native object call, file or network effect
on the point-array path. There is local module state: the contour counter and
predicate scratch arrays. This means "supplied-coordinate calculation with
module scratch state," not strict functional purity. The counter does not by
itself justify omitting an adapter. No counter reset or console replacement is
proposed.

### Closure and representation

The adapter must close each validated point ring in its own copied arguments.
If the caller already repeats the first point, retain exactly one repeat; do not
insert other vertices, round coordinates or reorder winding. `S9` then receives
every boundary edge. The SDK's normalization maps the caller's objects to its
own coordinate arrays, so frozen caller copies are sufficient for this path.

For a first supported contract, accept one outer point ring per operand. Reject
input groups and holes instead of silently taking the first group. Preserve all
output groups and holes exactly, including `[]`, with bounded result validation.
This supports a useful distinction: subtracting a strictly interior ring can
produce a hole even though a hole-bearing input is not yet accepted. Disjoint
union/XOR can produce multiple outer groups. Output must not be flattened or
fed implicitly to a different SDK method that rejects empty/group inputs.

### Proposed bounded crossing contract

The candidate contract accepts simple orthogonal rings with integer coordinates
within ±32,768, at most sixteen distinct vertices per operand, and no redundant
collinear corners. The latter requires horizontal and vertical edges to alternate.
Each ring must have nonzero area, no repeated interior vertices, self-contact,
self-intersection or zero-length edge. The caller may omit the closing repeat.

Across operands, reject every endpoint-on-edge or shared-vertex contact. Also
reject collinear edge lines, including disjoint edges on the same horizontal or
vertical line. This deliberately excludes common aligned rectangle/outline cases;
the contract must say so in argument errors and discovery. Proper perpendicular
crossings are allowed, with at most two per original edge. Strictly nested and
separated rings are allowed when their edge lines satisfy the same restrictions.

Integer input alone is insufficient. The source computes an intersection by
dividing cross products and interpolating, and an integer mathematical answer
can round to a nearby float. The proposed admission guard therefore does this
finite check before the SDK call:

1. Compute every exact axis-aligned crossing directly from the horizontal edge's
   y coordinate and vertical edge's x coordinate. Check integer interval bounds.
2. For each original edge, collect its endpoints and at most two crossings.
   Enumerate every nonzero fragment between those points, at most six per edge.
3. For every cross-operand perpendicular fragment pair, in both argument orders,
   evaluate the reviewed `Hpe` cross/divide/interpolate arithmetic. Require its
   result to equal the exact crossing point or the exact no-intersection outcome.
   No epsilon or output snapping is allowed. Orient fragments lexicographically
   as the SDK's left events do.

This is an input qualification of a small arithmetic formula, not a replacement
clipping implementation. A request that fails it must refuse before dispatch.
The public result must still come from the actual fixed `eda.sys_Math` method.
The app bundle must not be extracted and executed as a surrogate SDK.

The finite check covers all possible later fragment pairs because every split
point comes from the initial crossing set. Under that checked invariant, all
fragments remain orthogonal integer segments. Cross-operand two-point overlaps
are excluded by the line restriction. The only splitting branch is then `WA`'s
one-point branch, which tests both endpoint inequalities before calling `Au`.
Initial segments are nonzero, and those guarded splits preserve nonzero segments,
so the warning's already-collapsed-segment condition is unreachable for the
qualified subset. This argument is specific to the reviewed source and guard;
it is not a claim that arbitrary floating polygons cannot reach the warning.

Same-operand fragments cannot acquire crossings because the input ring is simple
and splitting does not move the qualified integer points. Distinct active
descendants partition each original segment. Any transient collinear comparison
within the same operand exits `WA` before splitting. Shared endpoints do not
create new nonzero subdivisions. The ±32,768 range keeps coordinate
differences within 65,536 and all two-product orientation expressions below
2^34, exactly representable as integers. The arithmetic-closure guard, not that
range alone, covers division and interpolation.

### Work and output budgets

Let `N` be the total original edges, at most 32, and `K` the proper crossings.
At most two crossings on every edge gives `K <= N`, hence at most 32. Each crossing
splits two edges, so there are at most `N + 2K = 96` nonzero fragments and 192
event endpoints. The preflight enumerates at most 96 possible fragments per
operand and 9,216 cross-operand pairs, each checked in both orders. These are
finite input-derived work bounds, not measured latency or an interruptible
wall-clock guarantee.

For the result, retain a separate conservative cap on groups, total rings, total
points and encoded bytes, and verify that every vertex belongs to the original
endpoint/crossing set. The 96-fragment budget permits a conservative 192-point cap
including closing repeats, with at most 32 output rings/groups. A valid result
must not be truncated to meet a cap. The existing 32 KiB exact-read envelope can contain this
bounded geometry without a new pagination mechanism.

`Gpe`'s quadratic ordering and the synchronous SDK call make a small input limit
important. A transport timeout does not preempt synchronous renderer JavaScript.
Do not advertise a hard execution-time bound merely because the coordinator has
a deadline. Keep the clipping call in the existing serialized calculation route,
with both synchronous samples inside one execute and fresh admission around it.

### `intersects` semantics and remaining limits

For the admitted subset there is no boundary-only contact. A positive-area
overlap or strict containment can use the SDK's nonempty clipping result without
claiming its documented touching-edge behavior. The API remains discoverable
under its actual name with this restriction, not redefined as a different
mathematical predicate. Bbox-only intersection is not substituted for the call.

General nonorthogonal polygons, fractional coordinates, aligned/touching edges,
overlapping input groups, input holes and cases failing exact fragment arithmetic
remain implementation backlog. The restriction is based on unqualified numerical
and degeneracy branches, not on the mere presence of globals. An eventual wider
contract needs reviewed admission for those branches and complete bounded group
semantics; it must not suppress global logging to conceal their effects.

## Implementation and verification

All five bounded adapters are implemented in
`plugins/easyeda-pro-control/server/src/sdk-math-clipping.ts` and integrated in
`sdk-math.ts`. Independent review accepted the fragment-arithmetic and warning
argument. The existing fixed-call builder still invokes the actual public SDK
method twice synchronously, retains its receiver and catches raw exceptions with
the same fixed public error. Inputs are copied, explicitly closed and frozen.
No console monkey-patch, module-counter reset or alternate clipping algorithm is
used. The calculation runtime profile remains separately hash-admitted.

The result projector requires bounded own-data arrays and exact `outer`/`holes`
keys, then preserves their order and coordinates. Independent host validation
checks closed simple orthogonal rings, known arrangement vertices and each hole's
strict containment in its outer. It samples every cell between distinct input
x/y boundaries and compares the SDK group's membership with the requested set
operation on the two inputs. Those cell samples cover positive-area regions
because every admitted returned boundary is orthogonal and its coordinate occurs
in the arrangement. They detect omitted components, misplaced holes, unexpected
overlap and contradictory empty results. They never generate a replacement SDK
result. `intersects` receives the corresponding area-overlap check on this
contact-free subset.

Different output groups may share isolated crossing vertices, as ordinary XOR
results do. Self-touching individual rings and holes touching their own outer
boundary remain unsupported output encodings. If the SDK produces one, the
adapter refuses after execution; it does not split, repair or discard the ring.
Input admission therefore does not promise successful result acceptance for
every possible contour encoding of every admitted pair.

Four focused clipping tests plus the six existing math tests pass on pinned
Node 24.18.0. They cover all five new literal calls, closure and frozen inputs,
proper-crossing XOR with shared vertices, a nested hole, disconnected outers,
empty output, exact-arithmetic refusal and malformed/contradictory results.
Targeted strict type-aware lint has zero warnings. These tests use synthetic SDK
stubs and do not execute the installed bundle. Release/integration checks have
their own receipts; no connected clipping calculation or CAD operation was
performed for this evidence.
