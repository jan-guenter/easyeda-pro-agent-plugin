# PCB209 Arc centers, radii and directed angles

2026-10-24. Researched against main
`eaa4c9be57c5f9d4bf6438e434009f5e4c99a43c` and the installed EasyEDA
3.2.209.8a704eab assets below. This record covers source research and pure
implementation checks. It does not claim connected validation, rendering or
saved-state proof. No project was opened or edited for this research.

## Reviewed installed contract

| Asset | Bytes | SHA-256 |
|---|---:|---|
| `pro-pcb/3.2.195.6b67774e/js/pcb.js` | 10991441 | `a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b` |
| `pro-api/0.3.59.1ca9efb5/api.js` | 1980754 | `e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1` |
| `pro-api/0.3.59.1ca9efb5/api-types.d.ts` | 1814791 | `0a6910f4108f3d09733a9de9176b20c41ccd2a87fc4e335f8d6d656eb054ba72` |

Offsets below are zero-based JavaScript string offsets. Hashes were freshly
checked. The public [Arc collection method](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivearc.getall.html)
accepts optional net/layer/lock filters and returns Arc objects. The new reader
uses complete native collection samples with empty arguments. It is a native
task equivalent, not construction of SDK instances or invocation of their
property getters. Documentation examples were not executed.

The PCB `arc-getAll` callback at offset10334498 enumerates `hr.getAllItem()`
and keeps existing `Oi` Arc views. `hr` is the track manager initialized at
offset10806850; its inherited `iu.getAllItem` at7957486 visits models with an
existing `stateWatcher`. This is loaded-view membership, not complete stored
source membership. The callback calls `Oi.toJSON` from the class at4829730,
then computes endpoint coordinates, degree `arcAngle` and scaled width. It
does not traverse adjacency or call an Arc setter.

`Oi.toJSON` retains native center, radius, start/end angles, sweep, width,
layer, net, lock and interaction mode. Its accessors read the existing model.
The model's underlying `tF` class at4071705 stores center/radius and normalized
angles; its accessors do not serialize Polygon children or allocate manager
objects. The only geometric allocation in this read is temporary points and
the temporary `yo` angle helper.

The callback has mixed units:

| Field | Native callback unit | New result |
|---|---|---|
| center x/y, radius | ten mil per native unit | multiplied by10 to mil |
| start/end x/y, width | already mil | preserved |
| start/end angle | radians | preserved as explicitly named radians |
| `arcAngle` | degrees | preserved |
| sweep | `0=CW`, `1=CCW` | preserved enum |

The interaction mode remains1 or2, separately documented as two-point and
center interaction in the [public enum](https://prodocs.easyeda.com/en/api/reference/pro-api.epcb_primitivearcinteractivemode.html).
It is not a sweep direction. The installed API `NT.getAll` wraps endpoints and
degree angle with its precision helper before constructing `an` SDK objects.
The new native result preserves callback precision and does not apply those
public-wrapper rounding steps.

## Why equal angles are not a circle flag

`q1` at PCB3871539 preserves normalized angles in the inclusive interval
zero through two pi. It does not replace a stored two pi with zero when the
input is already in that interval. `yo.angleToPoint` at3882079 computes the
signed degree angle from a modulo-one-revolution difference. Equal angles can
therefore yield zero, and the clockwise expression can yield signed zero.
Other native model paths, including `tF.sweepAngle`, wrap equal angles to a
full positive or negative revolution. Those distinct projections must not be
collapsed into a guessed full-circle boolean.

The adapter preserves both endpoint angles and the native sweep. It reports
`fullCircleInterpretationVerified:false`. Signed-zero numeric values refuse,
as in the existing JSON observation contract. This means some native
clockwise coincident-angle cases are unsupported; the adapter does not silently
normalize them or claim rendering equivalence.

## New observation

`current-pcb-209-arc-shapes.ts` defines a separate fixed program and decoder.
The packet contains the unchanged complete Arc DTO observation and ordered
`arcShapes` descriptors with `primitiveId`, `centerX`, `centerY`, `radius`,
`startAngleRadians`, `endAngleRadians` and `sweep`. Every Arc row must have
exactly one corresponding descriptor in the same order. Existing observation
programs and v1 decoders remain unchanged.

Each native sample brackets one `arc-getAll` call with identity observations.
Two complete ordered samples must match. Captured frame, project, tab and RPC
receiver checks run around all six awaited calls inside one fixed CDP request.
There is no caller-selected topic, code, filter or row limit. Bounds remain256
rows and393216 UTF-8 bytes for the complete native packet and final result.
The ten-second deadline does not cancel vendor work already dispatched.

Before scaling center/radius, the native program reconstructs the callback's
endpoint and signed-angle arithmetic exactly and refuses contradictions. The
independent decoder validates all fields, IDs and association, and reconstructs
endpoints from the scaled center/radius. That second calculation allows only
16 machine epsilons times the maximum endpoint/center/radius magnitude or1,
because the scaling changes floating arithmetic order. It is not a design
clearance, a repair tolerance or write authority. The degree-angle comparison
remains exact because its arithmetic order is unchanged.

Nonfinite or signed-zero numbers, negative radii, unnormalized angles, invalid
sweep/mode, missing fields, accessors, duplicate IDs, incomplete arrays,
malformed UTF-16, mismatching samples or excess output refuse the whole result.
The result proves no startup completion, source membership, connectivity,
rendering, persistence or writer baseline.

## Focused verification

Seven pure tests passed. They cover positive and negative sweep, two-pi versus
zero endpoints, zero radius, null/empty nets, six-call receiver replacement,
sample drift, malformed native geometry, exact endpoint/angle disagreement,
row/text/aggregate bounds, timeout behavior and independent decoder forgery.
Strict type-aware lint passed without warnings after local declaration-scope,
comment capitalization and nesting fixes. No runtime guard was weakened.

The fixed function is11786 bytes with SHA-256
`9b41e237b02864dbf9d4074d3f7e8181b90220024da879d2ee3a71126970b8fa`.
Pure test and lint logs are retained privately under
`/root/.cache/easyeda-arc-shapes-20261024-uc7ry276`.
Native protocol integration, complete release verification and any new live
case belong to the containing batch. These synthetic tests do not qualify
populated Arcs in the running editor.
