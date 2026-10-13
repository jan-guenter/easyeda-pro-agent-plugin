# Bounded public SDK math adapters

All sixteen `eda.sys_Math` methods now have typed, bounded adapters.
They calculate from caller-supplied coordinates; they do not inspect or modify a
design. The original eleven methods accept simple rings; five clipping methods
have a narrower orthogonal-integer contract described below. This is source
review and offline adapter evidence, not connected execution acceptance or
general admission of the new editor tuple. Historical omission and test records
remain below, explicitly separated from the clipping addition.

## Evidence and scope

Reviewed installed source:

- `/mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-api/0.3.50.ab46409c/api.js`
  — 1,964,920 bytes, SHA-256
  `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76`.
- The adjacent `api-types.d.ts` — 1,733,380 bytes, SHA-256
  `d5fe990034c55001302ea6c3f704c2d4b88cdf23253cc5293b3bad62a32b9def`.

The app installation is 3.2.206.715d940d; its authenticated editor reports
3.2.206. Its complete external tuple remains unadmitted; the old reviewed API
0.2.53 does not acquire these methods merely because their schemas are
discoverable. During the original source review, no private profile, external
pin, installed cache, CAD project, journal or shared setting changed. The installed
bundle was read as text, not imported or executed. Later scoped installation and
connection evidence belongs to its separate release records.

On restarted135500, the bridge authenticated, but one area request refused before
SDK dispatch because the profile expected the suffixed package version. The
source correction pins the observed editor-reported 3.2.206 separately from the
installed bundle identities. That refusal is not a successful math call. No live
clipping validation is recorded.

Source locations below are zero-based UTF-16 string offsets in the exact bundle,
not byte offsets. The full helper closure was reviewed, including clipping and
source-array normalization. The original eleven-method subset avoids both;
the additional five methods use the clipping closure under the narrower guards.

| Implementation | Start offset | Relevant behavior |
| --- | ---: | --- |
| `py`, `jA`, `HA`, `YA` | 1837512, 1837618, 1837781, 1837953 | Local area, centroid, point containment and perimeter arithmetic. |
| Bundled clipping helpers through `C_` | 1838095–1855542 | Sweep-line structures, robust predicates, shared scratch state and clipping entrypoints. |
| `w_`, public `SYS_Math` class | 1855542 | All sixteen methods and private normalization helpers. |
| `Zpe` | 1858847 | Point-to-segment distance. |
| `A_` | 1859036 | Clipping result conversion to polygon groups. |
| `L_`, `Qpe`, `ede` | 1859305, 1859505, 1859711 | Polygon-source, rectangle and circle conversion. |
| `tde`, `ide`, `nde`, `rde`, `w9` | 1859845, 1860491, 1860807, 1861199, 1861335 | Source parsing, segment/arc/cubic sampling; next unrelated class starts at 1861411. |
| `this.sys_Math=new w_` | 1891210 | Public API owner construction; no math-specific constructor state. |

For the accepted point-array inputs, all eleven methods are synchronous local
JavaScript calculations. Their reachable helpers use arrays and numeric
arithmetic, not editor RPC, UI, files, network, project state or settings. This
statement does not cover the broader declared native-object input union.

## Common adapter contract

The adapters live in `plugins/easyeda-pro-control/server/src/sdk-math.ts`.
Offline descriptors expose the exact method name, input schema, parameter order,
result kind, limitations and source provenance. Discovery and exact argument
validation explicitly grant no execution authority. JSON Schema cannot express
all geometric or paired-center refinements; use the exact validator before
requesting execution.

Inputs are strict finite JSON objects. For the original eleven methods, polygon
inputs contain one simple,
nonzero-area ring with 3–128 distinct vertices, with an optional final duplicate
of the first point. Coordinates, offsets and centers are bounded to ±1,000,000.
Duplicate interior vertices, self-touching/crossing edges and adjacent
backtracking are rejected. Exact integer representations of the supplied
IEEE-754 values establish these shape checks without a floating epsilon.
The SDK calculation itself still uses floating-point arithmetic.

| Method | Admitted input and important limitation |
| --- | --- |
| `bboxIntersects` | Two ordered finite axis-aligned boxes. Edge contact counts; this says nothing about polygon intersection. |
| `calculateArea` | One ring; absolute shoelace result, in squared input-coordinate units. |
| `calculatePerimeter` | One ring; the final-to-first segment is included even when the array is not explicitly closed. |
| `contains` | Strictly convex outer ring and one simple inner ring. SDK checks only inner vertices; boundary classification remains its ray-casting result. |
| `containsPoint` | One ring and point. Boundary points are not classified consistently across edge orientations. |
| `distanceToPoint` | One ring and point. Both interior and boundary points can return zero. |
| `getBBox` | Extrema of the supplied ring, not native primitive or curved geometry bounds. |
| `getCentroid` | Signed-area centroid. Nonfinite or out-of-bounds results refuse; cancellation is not repaired. |
| `translate` | Ring plus bounded x/y offsets. Returns points without moving CAD objects. |
| `rotate` | Angle bounded to ±360,000 degrees, positive counterclockwise. Both center coordinates or neither; neither selects the SDK centroid. |
| `scale` | Factors bounded to ±1,000. Omitted y factor uses x. Both center coordinates or neither; zero and negative factors may collapse or reflect output. |

Transform results retain the supplied vertex count and closure representation.
No implicit units conversion, snapping, CAD connectivity, clearance or
manufacturing guarantee is provided. The official
[math class](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_math.html),
[rotation](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_math.rotate.html)
and [scaling](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_math.scale.html)
references describe the public signatures and coordinate conventions.

Each program selects a fixed literal method and positional argument list from
the adapter's definitions. It freezes copied JSON inputs, binds the exact owner,
projects only expected own-data result properties, samples twice synchronously,
and rejects differing results or a replaced owner/method. Both samples occur
within one upstream execute request. Promises, accessors, unexpected fields,
nonfinite values and malformed outputs refuse. Output uses the maintained exact
JSON envelope, bounded to 32 KiB, with an independent host-side result validator.
Raw SDK exceptions are replaced by `SDK_MATH_CALCULATION_FAILED`; geometry from
an SDK error cannot become the public error text.

The runtime coordinator must separately admit the exact current API hash before
and after execution. The adapter does not start an app, discover a project, open
a document or bypass an unavailable runtime. The result identifies its authority
as supplied-coordinate calculation only.

## Why broader inputs are excluded

The official [input union](https://prodocs.easyeda.com/en/api/reference/pro-api.tsys_mathpolygoninput.html)
also permits source arrays, native polygon objects and polygon groups. In this
installed implementation, `normalizeToPoints` reduces a group to its first outer
ring, ignoring every hole and later outer ring. Most methods therefore lose
geometry. `calculateArea` is the exception: it explicitly sums all outers minus
holes. A shared broad input schema would conceal these incompatible semantics.
The official [group type](https://prodocs.easyeda.com/en/api/reference/pro-api.tsys_mathpolygongroup.html)
does not make that reduction an acceptable preservation guarantee.

Native objects can invoke `getSource`, `toPolygon` or
`getSourceStrictComplex`; those paths require their own side-effect and lifetime
review. Source-array circles/arcs/curves are approximated with fixed sampling,
without a demonstrated error bound suitable for design clearance. None of those
inputs are admitted by the new adapters.

`contains` is narrowed because vertex-only containment is insufficient for a
concave outer polygon: an inner edge can cross an outer notch even when every
inner vertex passes. Strict convexity removes that particular ambiguity without
claiming tolerant boundary semantics. The official
[point-containment page](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_math.containspoint.html)
acknowledges boundary inconsistency. Its suggested zero-distance boundary check
must not be used as proof: the implementation and
[distance documentation](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_math.distancetopoint.html)
also return zero for interior points.

## Added clipping contract

The five additional methods are `intersects`, `union`, `subtract`, `intersection`
and `xor`. Their input admission follows the separate
[official-contract and installed-source review](sys-math-clipping-research-2026-10-13.md).
It qualifies a subset for calls to the actual fixed public SDK methods, not a
replacement clipping algorithm or execution of an extracted app bundle.

Each operand is one simple nonzero-area orthogonal ring with at most 16 distinct
vertices. Coordinates must be integers within ±32,768. Horizontal and vertical
edges alternate; redundant collinear corners, self-contact, self-intersection,
duplicate interior vertices and zero-length edges refuse. The caller may repeat
the first point at the end or omit that repeat. The adapter creates an explicitly
closed copy without changing other vertices or winding.

Across operands, endpoint-on-edge and shared-vertex contacts refuse. Collinear
supporting edge lines refuse even when the segments themselves are disjoint.
At most two proper perpendicular crossings are allowed per original edge.
This excludes many ordinary aligned rectangle cases deliberately; it is not a
general orthogonal clipping contract.

Before dispatch, the guard derives the exact integer crossing set, enumerates
possible split fragments and checks the installed intersection formula in both
source argument orders. A formula result must equal the exact crossing or
no-intersection outcome. No floating epsilon, snapping, output repair or global
logger replacement is used. This guard addresses the collapsed-segment warning
path identified in the historical review below. The source argument and its
limits are recorded in the separate clipping review.

Input bounds allow at most 32 proper crossings, 96 final nonzero segments and
192 event endpoints. These are finite work bounds, not measured speed or an
interruptible wall-clock deadline for synchronous renderer JavaScript.

`intersects` returns the SDK boolean. The admitted domain excludes boundary-only
contact, so this route does not establish the official touching-edge behavior.
The four set operations preserve the complete group output, including holes,
multiple outer rings and empty `[]`. Different result components may share
vertices, as in XOR; that alone does not invalidate a complete result. Caps are
32 groups, 32 total rings, 192 total points including closing repeats and the
common 32 KiB response bound. Output is validated rather than truncated.

No input groups or holes are admitted. General angled edges, fractional
coordinates, aligned or touching operands and cases failing exact fragment
arithmetic remain unsupported inputs, not omitted methods. A clipping result
must not be implicitly flattened or passed to a different calculation whose
input schema rejects groups or empty input. No connected clipping validation
is claimed.

## Historical omission rationale before clipping implementation

The first eleven-method release omitted `intersects`, `union`, `subtract`,
`intersection` and `xor`. These were implementation gaps, not native
impossibilities or methods dismissed as merely untested. The original source
findings below motivated the narrower contract now implemented:

- The sweep-line helper consumes edges only through `length - 2`. Point-array
  normalization does not explicitly close an unclosed ring, so the implicit
  final edge used by the eleven simple methods is not assured here. An adapter
  needs reviewed explicit-closure admission or normalization, not copied examples.
- Clipping increments a module-global contour counter and uses shared predicate
  scratch arrays. It is not strictly pure, even though no editor RPC or file
  operation was found in this dependency closure.
- A collapsed-segment branch calls `console.warn` with geometry. The outer error
  catch cannot suppress that separate channel; a supported subset or reviewed
  no-log execution path is needed before accepting sensitive coordinates.
- The algorithm needs bounded work and output policies for intersections,
  coincident edges, holes and multiple resulting rings. Input vertex count alone
  does not establish a suitable output bound or degenerate-case behavior.
- `intersects` first filters on `getBBox`, which only sees a group's first outer
  ring. Group-wide intersection can therefore be rejected prematurely. Its
  documented inclusion of boundary contact also needs separate checking against
  the clipping result's nonempty-area test.

These points follow the installed source, not an assumption that documentation
equals execution support. Official contracts are available for
[intersects](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_math.intersects.html),
[union](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_math.union.html),
[subtract](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_math.subtract.html),
[intersection](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_math.intersection.html)
and [xor](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_math.xor.html).

## Historical eleven-method verification

Six focused offline tests cover all eleven literal call mappings, receiver and
argument binding, immutable inputs, exact envelopes, result validation,
non-authorizing discovery, malformed/unsupported geometry, transform options,
drift and fixed error redaction. They execute synthetic SDK stubs, not the
installed EasyEDA bundle. All six pass on pinned Node 24.18.0; targeted strict
type-aware lint reports zero warnings. Integration types, release checks and
connected acceptance belong to their separate receipts. No connected SDK math
call or CAD operation was performed for this evidence.

That six-test record predates clipping and must not be counted as its validation.
Current clipping test and release results belong to their separate receipts.
Neither synthetic SDK stubs nor the authenticated pre-dispatch refusal on135500
establish live execution of these five methods.
