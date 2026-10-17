# Current utility and environment readers

Read [offline discovery](api-reference.md) first for schema lookup and coverage.
This reference defines the task-specific contract; it does not grant execution
or replace the current tool's runtime checks.

## Supplied-coordinate calculations on the new tuple

```json
{"request":{"action":"calculations","query":{"method":"eda.sys_Math.calculateArea","includeSchemas":true}}}
```

```json
{"request":{"action":"calculate-validate","query":{"request":{"method":"eda.sys_Math.calculateArea","arguments":{"polygon":[{"x":0,"y":0},{"x":10,"y":0},{"x":0,"y":10}]}}}}}
```

These offline actions expose sixteen fixed methods without granting execution
authority. Pass the validated inner `request` and the fresh authenticated status
`expectedFingerprint` to `easyeda_control_calculate`. No design context is
required: the result describes only supplied geometry. Runtime admission pins
editor-reported EasyEDA 3.2.206 and API 0.3.50.ab46409c independently from the old
design profile, with exact source hashes before and after the two synchronous
samples. The installed package version is separately 3.2.206.715d940d; it is not
the version string returned by the authenticated editor.
An unknown tuple may list the tool but cannot pass its execution checks.

The eleven non-clipping methods are `bboxIntersects`, `calculateArea`, `calculatePerimeter`,
`contains`, `containsPoint`, `distanceToPoint`, `getBBox`, `getCentroid`,
`translate`, `rotate` and `scale`. Polygon inputs are one simple nonzero-area
ring of 3–128 vertices with optional repeated closing point. Coordinates and
offsets are bounded to ±1,000,000. Holes, groups, curves and native object
references refuse. `contains` additionally requires a strictly convex outer
ring. Use the exact validator; JSON Schema does not express every refinement.

Units are supplied-coordinate units, or their square for area. Rotation is in
degrees, positive counterclockwise. Rotation and scale centers must supply both
coordinates or neither; omitted centers use the SDK centroid. Transformations
return points and never move CAD objects. Point containment is inconsistent on
boundaries, and zero distance can mean an interior point, not just a boundary.
These floating-point calculations are not electrical clearance or connectivity
proofs.

The five clipping methods are `intersects`, `union`, `subtract`, `intersection`
and `xor`. Each accepts `polygon1` and `polygon2`, with a narrower contract:

- One simple nonzero-area outer ring per operand, at most 16 distinct vertices,
  integer coordinates within ±32,768 and alternating horizontal/vertical edges.
  A repeated closing point is optional; the adapter explicitly closes its copy.
- No input groups, holes, curves, native objects, redundant collinear corners,
  self-contact or self-intersection. Across operands, all endpoint-on-edge or
  shared-vertex contacts refuse. Collinear supporting edge lines also refuse,
  even when those edges are disjoint.
- At most two proper crossings per edge. Exact preflight also checks the SDK's
  floating-point intersection arithmetic for all possible split fragments;
  failure refuses before dispatch, without snapping or an epsilon.

`intersects` returns a boolean for this admitted domain only. Boundary-only
contact is excluded; do not rely on this adapter for touching-edge clearance.
The four set operations return the complete array of `{outer, holes}` groups,
including disconnected components, all holes and empty `[]`. Components may
share output vertices, as in XOR. Results allow at most 32 groups and 32 total
rings, 192 total points including closing repeats, and the existing 32 KiB
response bound. Oversized or malformed output refuses without truncation. A
returned group is not automatically a valid input to another calculation.

Installed161000 returned area 50 for the triangle (0,0),(10,0),(0,10), and one
outer square with a complete square hole for subtraction of [2,6] squared from
[0,8] squared. Both calls passed their double samples and before/after runtime
checks. These two cases do not validate other methods, boundary inputs or newer
source generations. Installed135500's earlier version refusal remains historical.

## Local environment and unit methods

Query `system` with `includeSchemas:true`, then use `system-validate` before
calling `easyeda_control_system`. The request contains a fixed `method` and
strict `arguments`, for example:

```json
{"method":"eda.sys_Unit.inchToMm","arguments":{"inch":1,"numberOfDecimals":3}}
```

Six conversions cover both directions among mil, mm and inch. Input magnitude
is at most 1e9; decimal precision is an integer from 0 to 12, default 4. Results
include explicit input/output units and precision. This uses the SDK's rounded
floating-point result, not exact decimal arithmetic. Numeric results carry
`negativeZero`; `value:0, negativeZero:true` represents SDK -0. Do not discard
the flag when exact scalar identity matters. No canvas unit or origin changes.

The twelve environment methods cover eight mode/edition booleans, editor version,
compiled date and two version comparisons. Booleans are captured at API loading,
not a fresh network probe or account authorization. The compiled-date getter may
fill an API-local cache, but does not persist settings. Date text remains raw;
no timezone is inferred. Version comes from editor metadata, not installer identity.

Despite their English names, the comparators test SUPPLIED >= CURRENT or
SUPPLIED <= CURRENT. Supply canonical major.minor.patch only, each component
0 through 999999. No prefixes, leading zeros, prerelease or build suffixes.
The SDK semver dependency may emit console diagnostics if semver debugging was
enabled when the API loaded; the adapter does not patch console or settings.

Each method returns two matching synchronous scalar observations, bounded to
8192 bytes with metadata strings at most 128 printable ASCII characters. Runtime
admission and authentication match the separately reviewed new tuple. No active
document, project, selection, private account, file, network, navigation or Save
is accessed. `getFrontendDataUnit` is excluded because it dispatches to UI state.
New system methods are source-tested, not connected-validated.

## Configured shortcut listing on the current tuple

Query `shortcuts` with `includeSchemas:true`, then use `shortcuts-validate`
with `query:{"request":...}` before `easyeda_control_shortcuts`:

```json
{"method":"eda.sys_ShortcutKey.getShortcutKeys","arguments":{"includeSystem":true}}
```

Pass the inner request and the fresh authenticated `expectedFingerprint`.
Omitted `includeSystem` becomes `false`, which lists vendor `isCustomize`
entries only. `true` includes system entries in the same initialized registry,
not the separate menu registry or every local shortcut. No active design or
legacy `expectedContext` is required.

Each returned shortcut contains raw `shortcutKey` strings, localized `title`,
`documentType` scopes and `scene` scopes. Preserve case, order, duplicates and
empty strings. The installed mapper returns tokens such as `Ctrl`, `Delete`
and `Page Down` despite its uppercase declaration union. `[]` differs from
`[""]`; do not normalize either into a keypress instruction.

Shortcut `documentType` is 0 blank, 1 Home, 2 schematic page, 3 symbol, 4 PCB,
5 footprint, 6 panel, 7 PCB 3D, 8 PCB 2D, 9 panel 3D and 10 panel library.
It is not the ordinary document enum. Scenes are 1 editor, 2 selected canvas,
3 unselected canvas, 4 drawing, 5 placement and 6 local.

The reader permits 1024 records, eight key tokens per record, 32 characters
per token, 1024 title characters, 32 entries per scope array and 262144 UTF-8
bytes. It rejects malformed, changed or oversized results without truncation.
Two complete copied samples retain public method, frame, RPC and locale owners;
the current API and UI hashes are checked separately. Vendor enumeration runs
before these bounds, and the 10-second deadline does not cancel that work.
No registration, callback, input, navigation, settings or design action is
dispatched. It does not prove focus, executable keys or complete shortcut
inventory. This route is source-tested only; connected validation is pending.
It adds a current-version route for an existing method, not a new distinct
method in the coverage inventory.

## Initialized extension-index observation

Query `extensions` with `includeSchemas:true`, then validate the sole request
with `extensions-validate`:

```json
{"action":"list-startup-index"}
```

Pass this request and the fresh authenticated `expectedFingerprint` to
`easyeda_control_extensions`. It uses one fixed internal read-only RPC on the
reviewed API 0.3.50 and independently hashed UI 3.2.196. Two matching samples
retain the top frame, UI actor objects and RPC receiver. The response projects
UUID, name, version, raw entry string, optional activation events and the actual
enable/update/sync booleans. It preserves order and literal false values.
No file content, user configuration, credentials or account IDs are returned.

This observes an already initialized database, not a complete startup baseline.
The API switches its database asynchronously after UI account changes, so
`databaseActorBound:false` and `startupQualified:false` are mandatory. Builtin
extensions, loaded code and queued activation are outside this result. Enabled
entries can run without startup activation flags. Never use this observation
to authorize launch, enablement, import or updates.

Bounds are 128 entries and 65536 UTF-8 bytes; malformed, empty, changed or
oversized results refuse. The authenticated bridge UUID must be present. The
vendor cursor enumerates the full index internally before projection, and the
10-second observer deadline does not cancel that work. Vendor RPC errors may
produce local diagnostics; outward failures are redacted. A timeout authorizes
neither retry nor startup. This internal diagnostic does not increase the public
SDK method coverage count. Connected validation is not yet recorded.
