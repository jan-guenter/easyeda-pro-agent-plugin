# Offline API and operation reference

Use `easyeda_control_api` before guessing a method, argument name, unit or nested
operation shape. It does not start the bridge, invoke EasyEDA or change journals.
Its request actions separate documentation from execution:

```json
{"request":{"action":"sdk","query":{"reference":"reviewed-installed","namespace":"sch_PrimitiveComponent","limit":25,"detail":true}}}
```

`sdk` searches the mounted `eda` namespaces and method/type declarations. The
reviewed snapshot has 93 namespaces and 749 signatures. `official-latest` has
99 namespaces and 806 signatures, from official declaration package 0.4.26.
Every response includes the exact package version, source digest and provenance.
Use `kind:"types"` to look up parameter interfaces/enums; type searches do not
take a namespace filter. Page with returned `nextOffset`, never infer that a
short first page is the complete catalog.

These are declaration snapshots, not runtime probing. Every SDK entry is marked
non-executable. Latest methods can be missing, stubbed or differently implemented
in the installed application. A method name that appears harmless can mutate
cache, UI, calculation or storage. Do not turn catalog entries into raw scripts,
private calls, compatibility changes or newly granted permission.

## Per-method coverage and omissions

```json
{"request":{"action":"coverage","query":{"namespace":"sch_PrimitiveWire","detail":true,"limit":25}}}
```

Coverage uses distinct mounted method paths, not overload counts. Every method
in either pinned snapshot has a row. A row can name a direct public call, a
narrower native task equivalent, an internal lifecycle dependency, or a concrete
omission with the evidence and work required to support it. A native equivalent
does not prove the public wrapper works. An internal Save call is not a new
standalone Save capability. Follow the returned route and its exact scope.

The current source inventory contains 774 distinct paths: 212 public subsets,
29 native equivalents, no lifecycle-only methods, 82 implemented-but-blocked
methods and 451 omissions. Its routes include 321 available with runtime guards,
94 blocked and two partially blocked. These are implementation classifications,
not connected validation counts; one method can have several routes.

For current-version disposable project/PCB opening, query `project-open` with
`includeSchemas:true` and validate with `project-open-validate`. Read
[the opening guide](current-project-opening.md) before invoking the live tool.
Its two public open methods accept ordinary writable application effects;
they do not inherit the legacy lifecycle's unchanged-storage guarantee.

An omission marked as needing a scoped adapter is remaining implementation work,
not a claim that the method is impossible. Newer-only declarations require a
reviewed installed implementation. Known native stubs must not return fabricated
empty success. Current live validation is tracked separately from historical
proofs and offline contract tests.

The October source audit disabled `schematic-topology`: its netlist exporter
can annotate designators/Unique IDs and invoke Save All. Dependent schematic
transactions must stop at that proof requirement. Schematic netlist/BOM/document
and PCB netlist/BOM/PDF exports are also refused for hidden Save All. Simulation
export needs an unsupported NGSPICE editor. A File-returning method is not
necessarily read-only; never bypass these refusals with another dispatcher.

The separate exact-read kind `schematic-flat-topology` is a restricted diagnostic
replacement, not permission to resume those transactions. Its current profile
requires at most 16 already-loaded ordinary pages with single-part components,
literal named orthogonal wires, and both default net naming and inter-page name
connection enabled. It rejects hierarchy, ports/flags, buses, standalone net
labels, multipart parts, images, unknown serializers and unsplit contacts.
Page membership comes from a fresh verified complete-project checkpoint and
matching public declarations; native endpoint sets and serialized source must
agree in two observations. The escaped response remains bounded to 4 MiB.
It never opens pages, compiles a netlist or saves. The result explicitly reports
`transactionTopology:false` and does not claim connected validation. Use its
specific refusal to identify unsupported input; do not substitute cached nets.

## Ordinary startup and editor-observation schemas

Ordinary startup and editor-shell observation also have offline schemas. Query
`launch`, `editor-shell` or `editor-context` with `query:{"includeSchemas":true}`, then use
the corresponding `launch-validate`, `editor-shell-validate` or
`editor-context-validate` with `query:{"request":...}`.
Validation does not launch or authorize anything. The launcher accepts only
fixed launch/inspect/observe-application/observe-termination/abandon-supervision requests. For
read-only presence after restart, validate
`{"action":"observe-application","operationId":"<original-operation-id>"}`.
It requires an existing journal and accepts no PID, executable or replacement
identity. This is not termination reconciliation. Explicit `abandon-supervision`
additionally requires the inspected `expectedLaunchedSha256`,
`confirmAbandonSupervision:true` and `acceptUnobservedDescendants:true`.
It appends a separate relinquishment receipt; it never proves original process
termination or grants design authority. Read the connection workflow before use.
The editor observer accepts only
`{"action":"observe-editor-shell"}` or, for identity metadata,
`{"action":"observe-editor-context"}`. Their lifecycle and interpretation limits
are in [connection and context](connection-and-context.md#ordinary-application-startup-on-the-current-tuple).
These are not newly covered public SDK methods, so the distinct-method inventory
above does not increase.

## Omitted system-library component lookup

`eda.lib_Device.getByLcscIds` remains discovery-only. On the reviewed current
desktop implementation, a network-disabled request can fall through to the local
device-update router. During concurrent library refresh, even the fixed system
library can temporarily resolve to a physical database and trigger initialization
or migration. A renderer mode/network check cannot atomically prevent this path.
Do not expose it as a read-only catalogue query. Supporting it needs a reviewed
remote-only route or a separately scoped library-effects contract. Its vendor
handler also maps failed service responses to empty arrays, so missing results
cannot prove that a part does not exist.

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

## PCB identities on the current tuple

Query `pcb-identities` with `includeSchemas:true`, validate with
`pcb-identities-validate` and `query:{"request":...}`, then call
`easyeda_control_pcb_identities` with that request and the authenticated
`expectedFingerprint`. The exact `target` uses project32/64, branch32,
document16/32 and `document@project` tab identity, as for layer reads below.
The context observer accepts local 64-hex project IDs; branches stay32.

Supported methods are `eda.pcb_SelectControl.getAllSelectedPrimitives_PrimitiveId`
and `eda.pcb_PrimitiveLine.getAllPrimitiveId`, `eda.pcb_PrimitiveArc.getAllPrimitiveId`,
`eda.pcb_PrimitiveVia.getAllPrimitiveId`, each with empty `arguments`.
`eda.pcb_Primitive.getPrimitiveTypeByPrimitiveId` takes `arguments:{"id":"..."}`
and classifies only a positive unique membership in those three families.
Missing IDs, other families and collisions refuse, never return invented
`undefined`. No optional public filters are supported yet.

These native equivalents retain the active ordinary PCB frame and receiver;
two complete ordered ID samples and surrounding native identities must match.
Selected IDs preserve the selection array. Family IDs enumerate loaded views,
which may include inherited or in-progress objects and omit stored records
without views. Neither means complete saved inventory, ownership, geometry,
connectivity or persistence. Type results retain the three family observations
in their commitment. No public type stub is executed.

Limits: 20,000 IDs per family, 256 selected IDs, 256 characters per ID and 393216 UTF-8 bytes
combined evidence. No truncation or coercion. Native serializers allocate DTOs
before projection; output bounds and deadlines do not cancel that work. Only
IDs leave the adapter. No selection change, navigation, settings or Save is
requested. Current connected validation remains pending.

## PCB geometry on the current tuple

Query `pcb-geometry` with `includeSchemas:true`, then validate the assembled
request with `pcb-geometry-validate` and `query:{"request":...}`. Invoke
`easyeda_control_pcb_geometry` with the validated request and authenticated
`expectedFingerprint`. Use the same explicit project/branch/document/tab target
as identity reads. The board must already be active; this tool never opens it.

Methods are `eda.pcb_PrimitiveLine.getAll`, `eda.pcb_PrimitiveArc.getAll` and
`eda.pcb_PrimitiveVia.getAll`, with empty `arguments` only. Results preserve
native row order and contain plain data, not SDK objects or methods. Every row
has `primitiveId`, `primitiveType`, `net` and `primitiveLock`. Null and empty
net text remain distinct; neither proves resolved connectivity.

| Family | Additional fields |
|---|---|
| Line | `layer`, `startX`, `startY`, `endX`, `endY`, `lineWidth` |
| Arc | Line fields plus `arcAngle`, `interactiveMode` |
| Via | `x`, `y`, `holeDiameter`, `diameter`, `viaType`, `designRuleBlindViaName`, `startLayer`, `endLayer`, `maskExpansionMode`, `topMaskExpansion`, `bottomMaskExpansion` |

Lengths use mil from the data origin, which can differ from the displayed
canvas origin. Arc angle uses degrees. Arc modes are native1/2, Via types0/1/2.
The adapter preserves the native callback precision. It does not apply the
public wrapper's Arc rounding or Via radius rounding before deriving diameter.
Via mask fields are loaded model values, not proof of a stored custom override
or fresh rule evaluation. Arc endpoints and angle omit center/radius/sweep;
a full-circle case can project to zero `arcAngle`. Do not reconstruct a complete
shape or derive an editing baseline from this projection.

Two matching ordered projected samples retain the exact frame and receiver
around each await. Omitted fields are not compared. Limits are256rows,
256characters per ID,1024per net/rule name, scalar magnitude1e12 and384KiB.
Signed zero, non-finite values, duplicates, unknown enum values, missing fields
and oversized data refuse without truncation. The bounds and deadline do not
cancel the native enumeration or serializer.

Loaded views may omit saved records and include inherited or preview objects.
These native equivalents establish neither saved membership, parent ownership,
complete source, connectivity nor persistence. Filters, selected-ID geometry and
other object families remain separate implementation work. No selection change,
navigation, source export, settings change or Save is requested. Current
connected geometry validation remains pending.

## Local historical abandonment

Query `history` with `includeSchemas:true`, then validate the request using
`history-validate` before calling `easyeda_control_history`. The sole request
is `action:"abandon-before-navigation"`, original `operationId` and
`confirmation:"<operationId>:abandoned-before-navigation"`. This exact string
checks argument consistency, not human restart attestation. The tool qualifies
only the maintained sixteen-event validation marker-read boundary and publishes
an exclusive historical sidecar. It has no bridge or runtime dependency and
never rewrites the journal or permanent claim. Read [failure recovery](failure-recovery.md)
for required retained evidence and the distinction from six-event baseline,
later-phase, design or process recovery.

## PCB layer metadata on the current tuple

Query `pcb-layers` with `includeSchemas:true`, then validate the inner request
using `pcb-layers-validate` with `query:{"request":...}`. Pass that request and
a fresh authenticated `expectedFingerprint` to `easyeda_control_pcb_layers`.
The two methods are `eda.pcb_Layer.getAllLayers` and
`eda.pcb_Layer.getTheNumberOfCopperLayers`, both with empty `arguments`.
The required `target` contains `projectUuid`, `branchUuid`, `documentUuid` and
`tabId`; the last must equal `documentUuid + "@" + projectUuid`.
Project IDs admit 32/64 lowercase hex, branch 32, document 16/32. The current
identity-only observer is not a source of CAD authority or a substitute for
an explicit known target; local project IDs may use a 64-character path hash.

This route requires an already active ordinary type-3 project PCB. It does not
open or activate it. A retained native frame receiver supplies two complete
matching layer samples, bracketed by native tab/type checks. The public wrapper
instead selects an active frame after an asynchronous UI hop, so the result
honestly reports `native-task-equivalent`, not public-method execution.

Layer lists expose the public nine-field projection and exact two-decimal
alpha conversion. Preserve raw color strings, including malformed native
fractional-hex output. Copper count follows EasyEDA's enabled native SIGNAL or
PLANE rows plus two; hidden configured inner copper counts, disabled inner
copper does not. This is not physical-stackup or manufacturing verification.
Limits are 512 unique layers, 1024 name characters, 128 type/color characters
and 262144 UTF-8 bytes. Malformed, changed or oversized replies refuse whole.

Exact current API/UI/PCB identities are checked separately from the old design
profile. No selection, source serialization, navigation, settings or Save is
requested. RPC bookkeeping and premature local environment defaults are
possible incidental memory effects. The deadline does not cancel vendor
enumeration. Matching observations are not an atomic lock or completed-load
proof; current-generation connected validation remains pending.

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

## Fixed SDK reads and calculations on the older tuple

```json
{"request":{"action":"sdk-reads","query":{"method":"eda.pcb_PrimitivePad.get","includeSchemas":true}}}
```

```json
{"request":{"action":"sdk-validate","query":{"request":{"method":"eda.sys_Environment.getEditorCurrentVersion","arguments":{}}}}}
```

`sdk-reads` reports the exact fixed allowlist and per-method input schema used by
`easyeda_control_sdk_read`. `sdk-validate` checks those arguments offline. Neither
dispatches a method. Class-returning methods use maintained state projections;
callers cannot select arbitrary getters, callbacks or prototype members.
The current allowlist has 182 fixed readers, including 21 native equivalents.
Query the installed catalog rather than assuming it matches this source version.

Discovery's `historicalValidation` indexes separately reviewed connected cases,
with their tested generation, exact argument domain, evidence and exclusions.
It is not current-runtime admission or whole-method validation. An empty case
list means no indexed case, not proof that the method has never been tested.
Follow the immutable ledger link for the full record. Live reader payloads keep
their original validation metadata and consistency hashes; discovery history
does not change them or grant execution authority.

For live execution, pass the validated `request`, fresh `expectedContext` and
`expectedFingerprint` to `easyeda_control_sdk_read`. The facade serializes the
call within one authenticated session, enforces the editor family, proves context
before and after each observation, and requires two equal results. A failed call
stops without retry. Exact delegated UI, project-manager/worker and schematic
implementation hashes are checked before dispatch and before releasing results;
the public wrapper hash alone is not sufficient. Use managed evidence with
`summary` or `receipt-only` for large results. Undefined results remain distinct from an
empty collection.

`eda.lib_LibrariesList.getSystemLibraryUuid` takes `arguments:{}` and returns only
a 32-character lowercase-hex system-library UUID. Missing, empty or malformed
results refuse rather than substituting a hardcoded identity. It neither lists
account libraries nor reads assets or grants write authority. The pinned public
implementation returns a constant. Installed204104 passed one disposable read
with two matching observations, unchanged complete native/source evidence and
saved-checkpoint equality. That case does not admit later generations.

`eda.sys_FontManager.getFontsList` is a native equivalent for configured font
titles in the current UI, not an OS font or rendering inventory. It takes empty
arguments on an exact active ordinary schematic, symbol, PCB or footprint tab.
Missing configuration refuses instead of invoking the public wrapper's false-empty
fallback. Own data fields, retained UI/project/tab/path owners and repeated
observations preserve exact title order, duplicates, empty strings and case.
Bounds are 512 titles, 1024 UTF-16 units per title and 131072 combined. No other
settings, font IDs or credentials are returned; no preferences are changed.
Installed220050 passed one ordinary schematic case with two matching configured-
title observations and unchanged complete native/source/saved-project evidence.
That historical case does not admit a new generation or the other editor types.
It does not prove current-account or persisted-settings identity, installed
glyphs or rendering.

For native PCB active-layer, net-membership and primitive-type readers, retain
the observed `document.tabId` and `document.parentProjectUuid` as well as the
project UUID/path and document UUID/type in `expectedContext`. Their ownership
checks reject the minimal selector accepted by generic exact readers. Copy the
fields from fresh `context`; do not synthesize a tab ID or owner. A refusal at
this input check is pre-dispatch, not a failed editor operation.

Most routes are public SDK observations. Three ID-only routes are explicitly
classified as `native-task-equivalent`: schematic Text, Wire and Bus
`getAllPrimitiveId`. They accept only `arguments:{}` on the exact active ordinary
type-1 page. Wire net filters and symbol/block-instance scenes are refused.
The complete connected model tree must agree with the ID index; returned family
members must be source-backed direct root children. Generated drawing-frame Text
descendants are not standalone Text IDs. Structural GROUP source records remain
unsupported and refuse the observation rather than returning a partial list. Wire and Bus
IDs identify groups, not LINE children. These routes avoid the public callbacks
and compiler-backed wire/bus getters; they do not serialize source or invoke Save.
Their native-only authority labels distinguish them from public SDK projections.
Installed210100 returned one source-backed Text and empty Wire/Bus sets on the
disposable frame/text fixture. Installed214400 additionally returned all four
Wire group IDs on the populated disposable page with unchanged complete native
state and saved project. Installed010000 additionally validated one nonempty
Bus group on that disposable fixture, as recorded in the capability matrix.
That evidence does not validate later facade generations. The older public-SDK validation runner
rejects these native routes before any dispatch; it is not their test runner.

`eda.sch_PrimitiveComponent.getAllPropertyNames` is a native equivalent on one
ordinary active schematic page, not the installed broken public wrapper or an
all-pages query. It reads exact keys from owned component attributes, including
inherited/generated frame and flag attributes, without reading values. Pin
attributes are excluded. Unknown Symbol kinds, structural GROUP records and
nonreciprocal ownership refuse the entire result. Empty and case-distinct keys
are preserved; shared transport-placeholder guards still apply.

`eda.sch_PrimitivePin.getAll` supports one ordinary active project-symbol PART
only. It proves native Pin membership and all twelve fixed getter fields around
each explicit `get(id)`, never invoking the broken public `getAll`. Custom pin
attributes, multipart/inherited shapes, associated devices and no-connect or
junction children refuse. Exact generated UnConnectDot ownership is admitted.
OtherProperty is explicitly undefined, not an inferred empty property map.
Rotation follows the installed getter, which differs from stored PIN rotation;
JSON transport normalizes signed zero. Installed214400 returned two expected
ordinary-symbol Pins with complete unchanged source and saved-project evidence.
Both had zero Y, length 10, shape None and type IN; wider geometry/enums and custom
attributes are not validated. Property-name enumeration passed a 29-key frame case and a
57-key case with two ordinary parts, three ground flags and a frame. The latter
included 19 inherited keys absent from page ATTR records, independently derived
from the referenced library and device records. Complete native and saved-project
state stayed unchanged. Neither native route is accepted
by the public-only fixture runner. Inspect their full limits and strict
empty-argument schemas offline.

`eda.sch_PrimitiveText.get/getAll` are native state observations for source-backed
root Text on one ordinary schematic page. `get` accepts `primitiveIds` as one
string or 1–256 distinct strings; both methods return arrays sorted by ID.
Missing, descendant or non-Text selectors refuse. The entire root Text family
must fit the 256-item bound even for a selected read, and complete reciprocal
tree/index/source ownership must fit 20,000 entries. Structural GROUP records,
symbol editors and block-instance pages are unsupported.

The fixed fields are `primitiveId`, `modelType`, `x`, `y`, `value`, `rotation`,
`color`, `fontFamily`, `fontSize`, `fontWeight`, `italic`, `underline`, `hAlign`
and `vAlign`. Coordinates retain native direction, including Y. Pose/style nulls
remain null; the native value getter maps an unset backing value to an empty
string. Horizontal alignment is null or 0/1/2 for left/center/right; vertical
alignment is null or 0/1/2 for top/middle/bottom. This is not public SDK getter
parity or resolved theme/default rendering. Two synchronous scalar captures and
two facade observations detect drift, with signed zero normalized only by JSON
transport. No public Text callback, compiler, serializer, RPC or Save is called.
Installed223200 passed both methods on one root Text with null styles/alignment,
with complete native and saved-project invariance. Other style/alignment cases
and later generations remain unvalidated. Use complete source and checkpoint
evidence separately when a task needs invariance or persistence proof.

`eda.sch_PrimitiveWire.get/getAll` and `eda.sch_PrimitiveBus.get/getAll` return
native group-state arrays, never public primitive handles. `get` accepts one
literal `primitiveIds` string or up to 256 distinct strings; `getAll` takes `{}`.
Wire net filters refuse. Only root groups on an ordinary active page are admitted;
complete Wire and Bus membership is checked even when selecting one group.

Each group has `primitiveId`, `modelType: "NetGroup"`, `kind`, `lines`, `names`
and `customAttributeIds`. Each line retains its own ID, one or two native XY
pairs, nullable `color`, `width` and `strokeStyle`. Styles are native
`SOLID/SHORT_DASH/DOT/DOT_DASH`, projected from exact native enum values 0–3.
Null remains null; the original numeric value is retained for drift checks.
These are not resolved theme defaults. Names retain every
source-backed NET child's ID and literal value; conflicting or empty strings
are not interpreted as resolved nets. Custom attributes are IDs only. Generated
junction/disconnection markers are ownership-checked but not returned.

The entire scene must fit 20,000 tree/source entries; both group families together
must fit 256 groups, 1,024 lines, 1,024 names, 1,024 custom attributes and 262,144
string units. Unsupported children, structural groups or incomplete selections
refuse before returning partial data. Two scalar captures and final field/type
reproof avoid serializers, compiler, public wrappers, RPC and Save. Installed233100
refused a populated Wire fixture because its adapter expected serialized style
strings instead of native numbers. Complete native and saved state stayed
unchanged. Installed010000 subsequently validated all four Wire groups (eleven
segments) and one Bus through `get` and `getAll`, with complete native and saved
project invariance. This does not validate resolved connectivity or later builds.

### Mixed schematic ID lookup

`eda.sch_Primitive.getPrimitiveByPrimitiveId` takes `{id}` and returns one DTO.
`getPrimitivesByPrimitiveId` takes `{ids}` with 1–256 unique IDs and returns DTOs
in caller order, unlike the sorted family readers above. Any missing,
unsupported, descendant or wrong-owner ID refuses the whole call. Empty or
duplicate selections refuse; no `undefined`, skipped row or partial array is
returned.

Only source-backed root Text and Wire/Bus NetGroup on the exact active ordinary
type-1 page are supported. The fields are the Text and NetGroup DTOs described
above, including native Y, nullable styles, literal NET values and identity-only
custom attributes. Components, pins, other shapes, symbol/block-instance scenes
and combined groups refuse. These are narrower native equivalents, not public
SDK instances or all-property parity; the official plural method is beta.

One retained page/manager, reciprocal tree/index/source and complete mixed-family
membership are checked together, not stitched from independent family results.
Two synchronous captures and final scalar reproof cover unrequested members too.
Before selection, the scene must fit 20,000 tree/source IDs, 256 Text, 256 groups,
1,024 lines, 1,024 names, 1,024 custom attributes and 262,144 combined string units.
Two matching facade observations retain context/runtime checks. No public generic
or family getter, compiler, serializer, RPC or Save is called. Installed204104
passed one root Text and one populated Wire through singular and plural selectors,
including both caller orders of their two-item selection. Bus, invalid selectors
and later generations remain separate. These observations do not
establish complete source, connectivity, persistence or atomic read isolation.

### PCB readers and calculations

`eda.pcb_Net.getAllPrimitivesByNet` requires a nonempty `net` and an explicit
nonempty unique `primitiveTypes` subset of `Line`, `Arc`, `Via`, `Pad` and
`ComponentPad`. Pad means standalone; ComponentPad means a physical pad owned by
a component. The returned sorted identity records include `primitiveId`,
`primitiveType`, original `net` spelling, `parentComponentPrimitiveId`,
`sourceRecordId` and `sourceType`. Net matching uses uppercase keys.

This native equivalent avoids the installed broken type filter and public-class
projection. It proves complete requested families across all nets before
filtering, and correlates component pads against canonical PAD_NET records and
their owners. Two matching source/inventory/source cycles retain exact runtime
and context. Only the pinned project-owned type-3 PCB/source editVersion is
supported; unfiltered/empty-net queries, other shapes, partitions and unmodeled
source records refuse. It is source-tested, not yet connected-validated, and
does not establish electrical connectivity or saved-file invariance.
Ordinary STRING text and FONT/RULE_TEMPLATE/PRIMITIVE/PREFERENCE/SILK_OPTS
metadata and BOARD outlines are admitted. The pinned BOARD decoder produces
non-electrical drawing controllers, not the Track/ArcTrack models enumerated by
the electrical inventory. Extra or missing electrical identities still refuse.
Outline geometry and drawing-child ownership are not part of this result.

`eda.pcb_Primitive.getPrimitiveTypeByPrimitiveId` accepts one literal `id` and
returns `Line`, `Arc`, `Via`, `Pad` or `ComponentPad`. It proves all five complete
source/inventory families, including unassigned objects, before classifying the
ID. Pad roles are disjoint and component-owned identities must match canonical
PAD_NET ownership. Unknown IDs, unsupported families and ambiguous identities
refuse; a refusal is not proof of absence. The installed public method is empty,
so this is an explicitly labeled native equivalent. It uses the same pinned
project-owned PCB and two-cycle checks as net membership, without inventing a
net filter. Source-tested only; it does not establish geometry, connectivity or
persistence.

`eda.pcb_SelectControl.getAllSelectedPrimitives` accepts empty arguments and
returns ordered native-source DTOs, not public class instances. Each row retains
its exact source record and all direct source-backed ATTR records. Root Line,
Arc, Via, standalone Pad, Component and String are supported. One unsupported,
inherited, missing or ambiguous selected ID refuses the whole call. Components
do not include inherited footprint geometry or generated attributes.

The reader brackets inventory with source and selected IDs, then repeats the
whole cycle. Each constituent read is independently double-sampled. Complete
selected-family membership must agree; generated poured state must be empty.
Inherited unselected Lines can require the existing checkpoint-bound footprint
proof, but selected inherited Lines still refuse. Supply the complete observed
PCB tab and owner context. Limits are 256 selected IDs, 20,000 source records
and 2 MiB output; excess data refuses without truncation. This source-tested
reader changes neither selection nor design. Stable observations are not an
atomic snapshot, resolved connectivity or persistence proof. Installed20261011150000
passed empty selection and one original standalone STRING, with complete saved
fixture invariance. Other families and the newer optimized reader remain untested
live. Fixed stage timings are diagnostic only and excluded from semantic hashes;
inclusive timings overlap and do not establish an end-to-end speedup.

`eda.pcb_Primitive.getPrimitiveByPrimitiveId` accepts `{id}`;
`getPrimitivesByPrimitiveId` accepts `{ids}` with 1–256 unique IDs in caller order.
These native equivalents return the same complete supported source DTOs without
reading or changing selection. They repeat source/inventory/source observations,
with the same owner, inherited-source and whole-call refusal rules above. Missing
IDs refuse rather than returning `undefined` or a partial array. The installed
singular public method is empty and the plural wrapper delegates to that stub;
neither is called. Installed164600 passed one singular read and one one-element
plural read of the same original standalone STRING, with an empty direct-ATTR
array. Independent receipt and complete-baseline correlation matched every DTO
field and both source/inventory/source cycles. This does not validate multi-ID
ordering, other families, live missing-ID refusal or later source revisions.

`eda.pcb_MathPolygon.splitPolygon` accepts JSON `complexPolygons`: one to eight
groups, each a source array or one to eight source arrays, each at most 1024 tokens.
Shared aggregate bounds still apply. The facade constructs temporary SDK objects
and returns source arrays, preserving order and duplicates; no reusable handle
or CAD object is created. Installed210100 returned the exact rectangle/circle/
duplicate sequence on the disposable schematic; other polygon commands and
later generations still need separate connected evidence. The installed
`discretize` method throws `Not implemented`; a newer
declaration does not make it executable on this runtime.

Neither public results nor native ID observations replace complete native-source,
connectivity, lock, collateral or saved-project proof in a design transaction.
Stable public output can still reflect an SDK mapping limitation. The fixed
reader excludes writes, file/network transfers, navigation and resource creation.

## Typed design and library operations

```json
{"request":{"action":"operations","query":{"family":"design","prefix":"sch.","includeSchemas":true,"limit":10}}}
```

`operations` derives entries from the same strict design/library parsers used by
the executor. Request an exact `operationAction` for a complete individual
schema. `includeSchemas:true` includes input JSON Schema and its SHA-256. It
describes nested objects, defaults and bounds; JSON Schema does not capture all
custom refinements. Library status distinguishes unavailable operations. Design
actions still need their operation-specific context, source, authority and
durable proof. The [capability matrix](capability-matrix.md) records live coverage.

When present, a library entry's `executionCapabilities` retains the executor's
full scope alongside the structural schema. Check it before assembling a write.
For example, `document.pcb.create` and `document.schematic.create` structurally
accept the SDK's optional `boardName`, but their native executors require that
field to be absent. Closed-target requirements, supported editor types and
original-return recovery limits
are execution conditions, not JSON Schema validation. Older installed catalogs
may expose only the status; query the library capabilities tool in that case.

Installed164600 completed one closed free-schematic creation with its original
native-return identity. Complete checkpoint proof found exactly one DOCHEAD/META
addition and all 11 prior documents unchanged, with no page, template, open or
Save. The same generation separately completed one explicit-black v2 PCB text
creation and its saved deletion, each with one Save/close/reopen. See the packaged
[capability matrix](capability-matrix.md#reported-live-coverage) and
[text contract](pcb-geometry.md#standalone-silkscreen-text) for the tested domains.
These cases do not make every structurally valid request executable.

```json
{"request":{"action":"validate","query":{"family":"design","operation":{"action":"sch.wire.modify"}}}}
```

`validate` runs the exact offline parser, including custom refinements, and
returns normalized arguments or bounded field errors. The example is
intentionally incomplete: use its errors or the operation schema to assemble
the real request. A valid result means argument validity only. It performs no
native preflight, allocates no native IDs and authorizes no execution.

For callable upstream read schemas use `easyeda_control_discover` local mode;
its admitted route, not the upstream annotation, controls invocation. For typed
changes use the design/library executor after live status and exact context.
For genuine SDK gaps use the maintained native adapter or process-bound native
control, never bypass an incomplete transaction or orphan quarantine.
