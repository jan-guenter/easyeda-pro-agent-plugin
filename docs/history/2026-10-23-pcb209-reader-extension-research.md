# Generation209 PCB primitive reader research

2026-10-23. Source review against repository base
`ac5012c79d9cbea860e6b431db154860ecab8182`, installed EasyEDA
`3.2.209.8a704eab`, and the exact assets below. This record covers the next
read-only disposable-opening stage. It is not live validation, an empty-board
proof, or permission to write a design.

## Result

Line, Arc, Via and parentless String loaded-view projections can use the existing
strict DTO contracts after separate209 ownership and source admission. The native
handlers still expose the same projected scalars and conversions. Reusing the206
runtime, its bridge admission, or its generated execution program would be wrong.
The new stage instead uses the original209 opening owner and its captured UI/PCB
frame. The implementation is
[`current-pcb-209-primitives.ts`](../../plugins/easyeda-pro-control/server/src/current-pcb-209-primitives.ts).

The stage observes the four families together. Each family includes ordered IDs
and bounded DTO rows. It corresponds to unfiltered `getAll` and
`getAllPrimitiveId` subsets, without SDK class instances or exact public-wrapper
return parity. The installed public API rounds Arc endpoints/angles and Via
radii; the native-equivalent DTOs retain the unrounded callback values.

## Primary evidence

All offsets below are UTF-16 indices in complete installed source, not line
numbers. Source files were read without evaluating vendor code.

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-pcb/3.2.195.6b67774e/js/pcb.js` | 10991441 | `a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b` |
| `pro-ui/3.2.198.2800f583/js/ui.js` | 17468192 | `3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6` |
| `pro-api/0.3.59.1ca9efb5/api.js` | 1980754 | `e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1` |
| `pro-api/0.3.59.1ca9efb5/api-types.d.ts` | 1814791 | `0a6910f4108f3d09733a9de9176b20c41ccd2a87fc4e335f8d6d656eb054ba72` |

The installed `api.d.ts` is only an11-byte placeholder. The declaration source
used here is `api-types.d.ts`. The
[`209 opening profile`](../../plugins/easyeda-pro-control/server/src/current-pcb-209-opening-profile.ts)
already pins the complete UI and PCB assets independently of these projections.

The official method pages describe optional filters, Promise-returning arrays
and beta stability. The proposed batch accepts no filters. It uses the four
fixed native collection topics, then copies IDs from those same observed rows.
The public ID wrappers likewise call their own `getAll` and map IDs, but that
does not make the native DTOs public class instances.

| Family | Installed declaration lines, `getAll` / IDs | Native handler offset | Public mapper offset | Contract |
| --- | --- | ---: | ---: | --- |
| Line | 23232 / 23201 | 10404828 | 1362549 | [getAll](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitiveline.getall.html), [IDs](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitiveline.getallprimitiveid.html) |
| Arc | 13612 / 13581 | 10334540 | 1369574 | [getAll](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivearc.getall.html), [IDs](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivearc.getallprimitiveid.html) |
| Via | 26465 / 26435 | 10409897 | 1356367 | [getAll](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivevia.getall.html), [IDs](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivevia.getallprimitiveid.html) |
| String | 26265 / 26235 | 10401031 | 1510206 | [getAll](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivestring.getall.html), [IDs](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivestring.getallprimitiveid.html) |

The first String `getAll` page fetch returned its reference page, but subsequent
attempts to retrieve the method section timed out. The installed declaration and
implementation supply that contract here; the String IDs page was retrieved.
The other six listed method sections were retrieved successfully. No tutorial
example's create/delete calls were executed.

The mounted offline `easyeda_control_api` call returned tool-unavailable before
execution, and the namespace then disappeared. The committed
[`api-coverage.json`](../../plugins/easyeda-pro-control/api-coverage.json) was read
instead. At the base commit all eight method entries had existing legacy routes
and installed209 declarations. Those entries did not grant209 execution.

## Native semantics and deliberate differences

The `iu` view-manager implementation at7957391 returns only existing
`stateWatcher` instances. It does not construct missing views while enumerating.
Line/Arc share `hr=new r7`, Via uses `Vr=new zde`, and String uses `Jr=new i7` at
10806850 onward. The native stage therefore observes instantiated views, not all
raw models. Empty results cannot prove an empty PCB.

- Line filters the shared manager to `xr` views. `xr.toJSON` at4786715 includes
  identity, partition, layer, endpoints, width, lock and `showNet`. The handler
  scales endpoints and width by10 to mil. The DTO omits partition and native
  Point objects, and preserves the displayed net spelling.
- Arc filters the same manager to `Oi`. Its serializer starts in the class at
  4829734 and retains center, radius, angles, sweep and arc type internally.
  The handler calculates endpoint coordinates from center/radius/start/end,
  multiplies distances by10 and converts its angle to degrees. The DTO retains
  those callback endpoints, width, angle and interactive mode. It does not
  reconstruct the complete arc, and a full-circle case can project a zero angle.
  The API mapper rounds coordinates and angle to one decimal; this stage does
  not apply that rounding.
- Via's serializer at4405065 retains start/end layer, unused inner layers,
  net, radii, center, lock, expansion mode and suture state. The handler scales
  center and radii to mil. The DTO doubles these radii without the API's earlier
  one-decimal rounding. It also retains start/end layers and observed mask
  configuration, but omits unused-layer and suture fields. Mask values are not
  a rule-resolution or manufacturing proof.
- String's handler excludes views with a parent. Its serializer at7394676
  reads existing font caches through `getFontCache` at7391705, then returns raw
  text/style/display fields. It does not request font loading or refresh text
  outlines. The stage scales internal distances by10 and radians by180/PI.
  Empty text/font/key strings remain empty. The serialized color expression
  returns null for an absent or empty color string, so null cannot prove raw
  model color absence. Glyphs, outlines, font contents, partition/group, zIndex
  and raw model ownership remain unobserved.

The String DTO follows the existing
[`geometry schema`](../../plugins/easyeda-pro-control/server/src/current-pcb-geometry.ts),
including key/show flags, positionIsNull and bounded serialized silkColor. It
does not silently apply constructor defaults. Missing/undefined projected fields,
non-finite values, negative zero, unsupported modes, malformed Unicode, accessors,
sparse arrays and duplicate IDs refuse. Null is allowed only where the existing
projection explicitly permits it, and remains distinct from an empty string.

## Fixed stage and integration requirements

The generated function accepts only the original sealed target and literal
`observe` phase. It captures the original UI frame, PCB child and native message
bus receiver before awaiting. It rechecks project/branch/tab/frame, ordinary
nonhistory mode, native receiver and DOM relationships around every awaited RPC.
Each sample has this fixed sequence:

1. Native tab/document-type identity.
2. Complete Line, Arc, Via and parentless String collections, in that order.
3. Native tab/document-type identity again.

Two complete ordered projected samples must match exactly. Cross-family IDs must
also be unique. The stage uses12 local native RPCs inside one CDP
`Runtime.callFunctionOn`. It admits at most256 rows per family and393216 UTF-8
bytes for the complete native packet and final result. These limits bound output,
not vendor enumeration work before the returned result. A10-second deadline
stops subsequent facade calls but cannot cancel an already dispatched vendor
callback. No partial family result is returned.

Original-owner integration must retain these existing layer-stage boundaries:

- Consume the stage once, before dispatch, and retain its original sealed target.
- Require completed original PCB source/DOM/identity observation.
- Keep209 separate from206 model/worker/precreate purposes and historical owners.
- Reprove installation, source, retained parent and ancillary frames before and
  after the one fixed call. These extra reproofs retain their existing CDP cost.
- Reconstruct the function in the native helper from the fixed tagged command.
  Accept no caller code, method path, target replacement or function text.
- Journal the attempt/result and retain original normal-close/termination/release
  cleanup. A successful observation grants no writer or Save authority.

The new decoder reuses the existing geometry validators as pure data checks,
then independently rechecks the sealed target, family order, bounds and
cross-family uniqueness. It returns only the four admitted families. It reports
startup, complete baseline, saved membership, connectivity, persistence, edit
and Save proof as false.

Root integration owns the public schema/coordinator and coverage. The native
integration agent owns the diagnostic owner/pipe/protocol/helper generator.
This research task changed only the new program/decoder, its focused tests and
this record. No existing pure-schema export was needed. Required release work
still includes generated-helper equality, helper identity update, the permitted
facade projections, strict types/lint and frozen-payload verification.

## Omissions retained for concrete reasons

- Component, Pad and Attribute require separate209 serializer/association review.
  Their206 DTO implementation alone does not prove209 cache, parent/child or
  shape behavior. The new stage does not silently omit malformed rows in these
  families; it does not query these families at all.
- Dimension and Image need their separate coordinate/unit and image-path
  serializers requalified. A complete model/source baseline is still absent.
- Selection, positive generic type lookup, filtered queries and requested-ID
  lookup are not part of this fixed stage. Their argument, missing-ID and
  cross-family semantics need separate contracts.
- Ratline/startup completion, actor-clock ownership, source/SQLite baselines,
  editing, Save/reopen and rollback remain separate unfinished lifecycles.
  These DTOs do not establish them.

## Focused verification

Seven focused Node24.18.0 tests pass with isolated test roots and core dumps
disabled. They cover four populated synthetic families, empty observations,
cross-realm receiver/identity changes around awaits, scalar/order drift,
malformed data and bounds, a timeout that prevents later native calls, and
independent decoder rejection. Strict type-aware lint for both new TypeScript
files passes with zero warnings.

The first lint run identified test-local typing/style problems. The next test
run failed because a freeze assertion inspected a Zod clone instead of the
original result; the assertion was corrected and the final seven tests pass.
An intermediate full typecheck saw an unrelated in-progress pipe-test method
name during parallel integration. The root must use the final integrated
typecheck, not treat that intermediate run as clean. No live EasyEDA call,
navigation, write, Save, or project-file read was made by this research task.

The subsequent integrated `npm run typecheck`, both-file strict lint and the
seven focused tests completed with exit0. The final generated function is
12558 UTF-8 bytes, SHA-256
`e8f6ab0a2b2548d55230ef623e622b02033dfb805d5a3627b81a203e14c5d219`.
This verifies the source-stage payload only; root release verification and
future installed/live validation remain separate.
