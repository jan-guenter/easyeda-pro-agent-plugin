# Current PCB readers

Read [offline discovery](api-reference.md) first for schema lookup and coverage.
This reference defines the task-specific contract; it does not grant execution
or replace the current tool's runtime checks.

## Project-local PCB metadata without an editor

For a loaded local project with no editor tabs, query `project-pcb` with
`includeSchemas:true`, then validate through `project-pcb-validate` and
`query:{"request":...}`. Call `easyeda_control_project_pcb` with that request
and the authenticated `expectedFingerprint`:

```json
{"method":"eda.dmt_Pcb.getPcbInfo","target":{"projectUuid":"<64-hex>","branchUuid":"<32-hex>","pcbUuid":"<16-or-32-hex>"}}
```

There is no `arguments` object or tab ID. The Start Page and optional hidden
blank placeholder are allowed; any editor tab, hidden/export editor, pending
restoration or document URL command refuses. Do not open a PCB canvas to make
this reader work. Historical, archived, store, CBB and V2 projects are excluded.

The result is a native metadata equivalent, not an `IDMT_PcbItem`. It returns
`uuid`, `projectUuid`, project `ownerUuid`, `title`, `displayTitle`, `parentUuid`,
`source`, `version`, `boardUuid`, `ticket`, `updateTime` and `docType:3`.
Native title and display title can differ; neither is normalized by the adapter.
The native getter has already replaced falsy source/version/board values with
empty strings, so their original absence cannot be recovered. Parent and board
references do not prove membership. Creator, modifier, creation time and the
native fixed empty description are omitted.

Two matching PCB samples are bracketed by four project/branch/owner checks.
The retained no-editor context and RPC receivers are checked around awaits;
these are observations, not a worker lock. The fixed program calls only native
project and PCB metadata getters. It requests no canvas, library, clock/client,
navigation, mutation, storage-completion operation or Save.

The ten-second deadline stops later reads, not an already dispatched request.
The complete escaped envelope is bounded to64KiB; missing, accessor-backed,
non-finite and oversized values refuse without coercion or truncation. Source
review and isolated tests are recorded. Installed111500 passed one disposable
project-only read with two matching samples, followed by retained normal closure
and unchanged complete SQL/native history. That historical case grants no later
runtime admission and does not validate the separate rename preflight below.
A successful read is not saved-state, write-permission, startup qualification or
PCB rename authority. Use the active-view routes below for geometry.

### Complete observed PCB metadata inventory

The same discovery, validator and `easyeda_control_project_pcb` tool also accept
`eda.dmt_Pcb.getAllPcbsInfo`. Supply only `target:{projectUuid,branchUuid}`; omit
`pcbUuid` and `arguments`. The no-editor requirements above still apply.

The native key/value route is sampled twice, with the same project/owner checks.
It does not use the native array route that can hide an error behind an empty
list. A genuinely empty native map returns an empty `pcbs` array; changing or
malformed maps refuse. Each row has the selected reader's metadata fields.
`observedPcbCount` counts the complete returned map. UUID sorting is comparison
order, not visual tree order. Parent references remain observations, not verified
hierarchical membership.

Limits are128PCBs and64KiB for the complete sample and escaped envelope. There
is no truncation or pagination. Native enumeration happens before those bounds;
the deadline cannot cancel an outstanding request. Complete native-map
observation is not complete saved-source membership, startup qualification or
rename authority. Source/offline tests cover this addition; the earlier live
selected-PCB case does not validate inventory mode.

### Read-only rename preflight

Query `project-pcb-preflight` with `includeSchemas:true`, validate the complete
request with `project-pcb-preflight-validate`, then use the same
`easyeda_control_project_pcb` tool and authenticated fingerprint. This route
does not rename the PCB. It requires the same project-only state, an ordinary
target with empty parent/source, and these exact fields:

- `target:{projectUuid,branchUuid,pcbUuid,ownerUuid}`.
- `expectedBefore:{title,displayTitle,parentUuid,source,version,boardUuid,ticket,updateTime,docType}`.
- `desiredTitle`, a different, nonblank title without surrounding whitespace
  or control characters, at most 512 characters.

Keep native `title` and `displayTitle` distinct. The tool compares the supplied
metadata against two complete native PCB maps and explicit target reads. It
uses the worker's own read-only title lookup for collision detection. Any match,
including the same PCB under a case-insensitive title, refuses. It does not
choose a suffix or run the public rename wrapper, which can rename related
reuse-block documents.

Four agreeing client/max-ticket observations and four UI actor/renderer-notify
clock samples accompany the metadata. They do not prove the original worker's
constructor, captured producer identity, backend actor/clock, startup completion
or permission. Supplied expectations are not saved-history provenance. Native
name availability is a sampled observation, not a lock or future writer grant.

Bounds are 4,096 PCB entries, 512 KiB including the escaped response and ten seconds
inside the application. Bounds do not cancel an already dispatched native read.
Missing, changed, malformed or oversized evidence refuses without truncation.
No editor opens, geometry loads, mutation or explicit Save are requested.
Installed121700 passed one disposable preflight with two matching PCB maps,
native title availability and four matching client/ticket/actor samples. Normal
closure and complete comparison proved unchanged raw bytes, all35 SQL tables
and all20 native documents. This is historical read-only evidence, not writer
validation or admission for another runtime.

### Separate disposable rename workflow

The separate [disposable rename workflow](current-pcb-rename.md) connects the
original PCB opening, full SQL baseline, actor/clock checks, fixed title writer,
normal closure and saved reopening. Installed195000 passed one complete disposable
title-only lifecycle with exact closed SQL, fresh saved metadata and final closure.
That historical result does not admit another invocation. Preflight alone does
not issue its ownership or authorize writing.

The private schematic rebuild queue exposes no operation-owned completion
observer. Stable batch/pending-set samples and sleeps do not prove it drained.
The coordinator retains the whole process generation through normal termination,
verifies the complete closed SQL effect, then performs cache-excluded saved
reopening under a fresh owner. Do not substitute
the symbol comparator, which preserves structure bytes unchanged. Public
reuse-block renaming propagates into other document families and remains outside
this scope.

## PCB identities on the current tuple

Query `pcb-identities` with `includeSchemas:true`, validate with
`pcb-identities-validate` and `query:{"request":...}`, then call
`easyeda_control_pcb_identities` with that request and the authenticated
`expectedFingerprint`. The exact `target` uses project32/64, branch32,
document16/32 and `document@project` tab identity, as for layer reads below.
The context observer accepts local 64-hex project IDs; branches stay32.

Supported methods are `eda.pcb_SelectControl.getAllSelectedPrimitives_PrimitiveId`
and `eda.pcb_PrimitiveLine.getAllPrimitiveId`, `eda.pcb_PrimitiveArc.getAllPrimitiveId`,
`eda.pcb_PrimitiveVia.getAllPrimitiveId`, `eda.pcb_PrimitiveComponent.getAllPrimitiveId`,
`eda.pcb_PrimitivePad.getAllPrimitiveId`, `eda.pcb_PrimitiveString.getAllPrimitiveId`,
`eda.pcb_PrimitiveDimension.getAllPrimitiveId`, `eda.pcb_PrimitiveImage.getAllPrimitiveId`
and `eda.pcb_PrimitiveAttribute.getAllPrimitiveId`,
each with empty `arguments`.
`eda.pcb_Primitive.getPrimitiveTypeByPrimitiveId` takes `arguments:{"id":"..."}`
and classifies only a positive unique membership in Line, Arc or Via.
Missing IDs, other families and collisions refuse, never return invented
`undefined`. No optional public filters are supported yet.

These native equivalents retain the active ordinary PCB frame and receiver;
two complete ordered ID samples and surrounding native identities must match.
Selected IDs preserve the selection array. Family IDs enumerate loaded views,
which may include inherited or in-progress objects and omit stored records
without views. Neither means complete saved inventory, ownership, geometry,
connectivity or persistence. Type results retain the three family observations
in their commitment. No public type stub is executed.

`String` is PCB text, not `pcb_PrimitiveText`. Its native collection excludes
views with a parent, including component attributes and inherited text. This
filter does not prove complete source ownership. ID reads still invoke the
native serializer and read existing font caches, but return only identities.
String is not added to the positive type-lookup subset.

`Dimension` concatenates length, radius and angle dimension views. `Image`
concatenates vector images and pictures; it does not load picture assets or
return their content. Neither family filters parents or includes models without
a loaded view. Native serialization still reads geometry and annotation fields;
image paths allocate temporary transformed geometry before the adapter copies
only IDs. These methods establish neither rendering nor a complete empty-board
condition, and do not extend positive type lookup. Source review and offline
tests exist. Installed013000 passed two matching empty samples per family on
one disposable board, followed by retained normal closure and exact unchanged
closed-file bytes. Nonempty-family connected validation remains pending; this
historical empty case grants no current-invocation authority.

Do not substitute current Fill/Polyline/Region getters for a read-only inventory:
their polygon serializer can rebuild child models and controllers. Those methods
are not admitted by this current adapter. Discovery of a separately pinned
legacy SDK route does not qualify it for the current runtime.

`Attribute` returns component-attribute IDs in native component/group order.
`attributeParentGroups` preserves each observed `parentPrimitiveId` and its
ordered IDs, including empty groups. Both samples compare the complete grouping,
so identical flat IDs with different parents refuse. Duplicate parents, duplicate
attribute IDs and collisions between parent and attribute IDs also refuse.
This is a native association, not reciprocal or complete stored ownership.
Only loaded component views participate; no independent full component inventory
is obtained. Values, formulas, fonts and geometry are omitted. Native component
serialization still reads existing footprint/device/font caches and pad/via
metadata before the adapter can bound its reply. There are no parent/layer/lock
filters or Attribute type-lookup support. At most20,000 groups and20,000 total
attribute IDs share the existing byte bound. Installed023200 passed one
populated disposable case: six attributes in two groups, with two matching
samples, retained normal closure and unchanged closed-file bytes. Empty groups,
the separate geometry methods and later runtimes remain outside that case.

Limits: 20,000 IDs per family, 256 selected IDs, 256 characters per ID and 393216 UTF-8 bytes
combined evidence. No truncation or coercion. Native serializers allocate DTOs
before projection; output bounds and deadlines do not cancel that work. Only
IDs leave the adapter. No selection change, navigation, settings or Save is
requested. Installed180500 passed one nonempty disposable Component/Pad ID
case; other methods and generations need their own evidence.

## PCB geometry on the current tuple

Query `pcb-geometry` with `includeSchemas:true`, then validate the assembled
request with `pcb-geometry-validate` and `query:{"request":...}`. Invoke
`easyeda_control_pcb_geometry` with the validated request and authenticated
`expectedFingerprint`. Use the same explicit project/branch/document/tab target
as identity reads. The board must already be active; this tool never opens it.

Methods are `eda.pcb_PrimitiveLine.getAll`, `eda.pcb_PrimitiveArc.getAll`,
`eda.pcb_PrimitiveVia.getAll`, `eda.pcb_PrimitiveComponent.getAll`,
`eda.pcb_PrimitivePad.getAll`, `eda.pcb_PrimitiveString.getAll`,
`eda.pcb_PrimitiveAttribute.getAll`, `eda.pcb_PrimitiveDimension.getAll` and
`eda.pcb_PrimitiveImage.getAll`, with empty
`arguments` only. Each family also
supports a narrower `.get` equivalent with `arguments:{"primitiveIds":["id"]}`.
Use 1 to 256 distinct nonempty IDs, each at most256characters. Scalar IDs,
duplicates and empty arrays refuse. `get` returns rows in caller order and
refuses the entire request if any ID is unavailable in the observed family;
unlike the public API, it never silently skips unmatched IDs. That refusal
does not establish absence from saved source. It does not change selection.

`getAll` preserves native row order. Both return plain data, not SDK objects
or methods. Every row
has `primitiveId`, `primitiveType` and `primitiveLock`. All except Component,
String, Attribute, Dimension and Image
also have `net`; null and empty net text remain distinct, and neither proves
resolved connectivity.

| Family | Additional fields |
|---|---|
| Line | `layer`, `startX`, `startY`, `endX`, `endY`, `lineWidth` |
| Arc | Line fields plus `arcAngle`, `interactiveMode` |
| Via | `x`, `y`, `holeDiameter`, `diameter`, `viaType`, `designRuleBlindViaName`, `startLayer`, `endLayer`, `maskExpansionMode`, `topMaskExpansion`, `bottomMaskExpansion` |
| Component | `layer` (1/2), `x`, `y`, `rotation`; optional raw `designator`, `name`, `manufacturer`, `manufacturerPart`, `supplier`, `supplierPart` |
| Pad | `layer` (1/2/12), `padNumber`, `x`, `y`, `rotation`, `metallization`, `padType` (0/1/2), `hole`, `defaultCopperShape`, `maskExpansion`, `thermal` |
| String | `layer`, `x`, `y`, `text`, `fontFamily`, `fontSize`, `lineWidth`, `alignMode`, `rotation`, `reverse`, `expansion`, `mirror`, `key`, `showKey`, `showValue`, `positionIsNull`, `silkColor` |
| Attribute | `parentPrimitiveId`, `layer`, `x`, `y`, `key`, `value`, `keyVisible`, `valueVisible`, `fontFamily`, `fontSize`, `lineWidth`, `alignMode`, `rotation`, `reverse`, `expansion`, `mirror`, `positionIsNull`, `silkColor` |
| Dimension | `layer`, `dimensionType`, `coordinateSet`, `lineWidth`, `precision`, `canvasUnit` |
| Image | `imageType`, `layer`, `x`, `y`, `width`, `height`, `rotation`, `horizonMirror` |

Lengths use mil from the data origin, which can differ from the displayed
canvas origin. Arc angle and Component/Pad/String rotation use degrees. Arc modes
are native1/2, Via types0/1/2.
The adapter preserves the native callback precision. It does not apply the
public wrapper's Arc rounding or Via radius rounding before deriving diameter.
Via mask fields are loaded model values, not proof of a stored custom override
or fresh rule evaluation. Arc endpoints and angle omit center/radius/sweep;
a full-circle case can project to zero `arcAngle`. Do not reconstruct a complete
shape or derive an editing baseline from this projection.

Component adds six fixed strings from the native attribute map. Missing and
own-undefined values omit the corresponding field; empty strings are preserved.
Selected null, non-string, inherited or accessor-backed values refuse. `name`
may be an unevaluated formula, not rendered text. These values are observations,
not verified manufacturer part identity or schematic linkage. Other Component
attributes and library enrichment remain omitted. For observed child membership,
use the separate component method below.

### Selected PCB objects

Use `eda.pcb_SelectControl.getSelectedPrimitives` with empty `arguments` on
`easyeda_control_pcb_geometry` for the current selection. Keep the exact active
PCB target and authenticated fingerprint. The result contains the nine supported
geometry families' plain DTOs in selection order, not executable SDK instances.
Every selected ID must belong to exactly one observed family. Unsupported
objects, missing IDs and ambiguous membership refuse the whole request.

Each compound sample reads selected IDs before and after the family projections.
Two complete samples must match, including ordered family ID rosters and
Attribute parent groups. Nonempty selection uses26 fixed native RPCs; empty
selection uses eight and skips family enumeration. `observedRowCount` counts
all scanned rows, while `returnedRowCount` counts selected DTOs. The existing
256-row limit applies to each family and the selection, with one shared384KiB
envelope bound. A selected-ID request does not make a large family cheap to read.

The native raw selected-object serializer can omit unsupported objects and
overwrite net values with display nets. This route does not call it. It keeps
each admitted family reader's existing field and unit semantics. Fill, Polyline
and Region remain excluded. Matching samples are not an atomic lock, complete
saved membership, connectivity, rendering or writer authority. This addition
has source and isolated-test evidence; connected validation is pending.

### PCB text

Use `eda.pcb_PrimitiveString.getAll` for the complete supported loaded collection
or `.get` with an explicit `primitiveIds` array. Both use the same parentless
native collection. Component designator/value attributes and inherited text
are outside this subset, even when their IDs are known. Missing IDs refuse
the whole request; neither method changes selection.

`text` is the raw native value, not a rendered or formula-expanded label.
`fontFamily` is a raw font name, not proof that the font is installed or that
glyphs rendered. Empty strings remain empty. Null or unavailable projected
fields refuse instead of receiving SDK defaults. Native internal distances
are multiplied by10 to mil, and rotation by180 then divided byMath.PI to
degrees, preserving the installed mapper's arithmetic order. `alignMode` is
1 left-top,2 left-middle,3 left-bottom,4 center-top,5 center,6 center-bottom,
7 right-top,8 right-middle or9 right-bottom. `expansion` is the loaded reverse
text expansion; it is not a validated fabrication clearance.

`key`, `showKey`, `showValue` and `positionIsNull` are loaded display fields,
not rendered-text or parent-ownership proof. `silkColor` is a bounded raw string
or null, not validated CSS. The native serializer uses `color.toString()||null`;
null therefore does not prove an absent raw model color. Null and explicit black
remain distinct. Both complete-family samples compare all these fields.

Outlines, cached font data, zIndex, partition/group, model type and parent/source
ownership are not returned or compared. The native serializer reads existing
font caches; these calls request no font loading, geometry refresh or Save.
String text is bounded to65,536UTF-16 units, fontFamily/key to1,024, serialized
silkColor to128, and the whole
family to256rows and384KiB including the escaped envelope. Explicit selection
does not reduce native enumeration or full-family checks. Signed zero,
non-finite numbers, invalid alignment, duplicate IDs and incomplete output refuse.

These three current-runtime String readers have source review and offline tests
only. A returned text observation is not saved-source, rendering, connectivity
or writer proof.

### Component attribute text and placement

Use `eda.pcb_PrimitiveAttribute.getAll` with empty arguments or `.get` with a
distinct `primitiveIds` array. Both enumerate existing component views and
compare the complete projected family twice before selecting requested IDs.
`attributeParentGroups` retains every observed parent and its ordered child IDs,
including empty groups, even for selected-ID reads. Duplicate parents, duplicate
children, parent/child collisions and changed grouping refuse. This is native
association evidence, not reciprocal or complete saved ownership.

`value` is current model text. A Name formula may already have been evaluated
by a previous native update; this reader does not evaluate it or return the
raw `formulaName` field. Do not equate Attribute `value` with the Component
reader's raw `name`. `keyVisible`/`valueVisible` describe flags, not rendered
visibility. Distances use mil and rotations degrees, with String's same scalar
conversion, alignment and serialized-color limits. Numeric coordinates remain
required even when `positionIsNull` is true; null coordinates are not coerced.

At most256 parent groups and256 total rows share the384KiB evidence bound.
Full-family checks still apply when selecting one ID. Font caches, outlines,
source expressions, saved membership and rendering are omitted. No filters,
scalar lookup, setters, font loading or Save are requested.

Installed060000 passed one disposable case: six attributes in two complete
parent groups, followed by two Designators requested in reversed caller order.
Both calls returned matching complete double samples and identical projected
values/groups. Original-process/Job closure was proved and the closed fixture
remained byte-exact with no sidecars. No edit or explicit Save was requested.
This case covers the observed default fonts/styles and null serialized colors;
it does not validate Name formulas, nondefault styles, rendering, saved ownership
or a later runtime. The earlier ID-only case is separate evidence.

### Dimension coordinates and styles

Use `eda.pcb_PrimitiveDimension.getAll` with empty arguments or `.get` with a
distinct `primitiveIds` array. Both use the complete native Dimension family,
with two matching ordered samples before caller-order selection. The native
get-by-ID callback is not used because it also searches unrelated families.

`coordinateSet` contains eight numbers for Length: left, start, end and right
X/Y pairs. Radius contains six: end, start and text-anchor X/Y pairs. Angle
contains six: start, center and end X/Y pairs. These coordinates and `lineWidth`
are already in mil. Do not multiply them by ten again or convert them based on
`canvasUnit`. The DTO also retains dimension type, layer, lock and precision.

The native getter overwrites the annotation's unit with the current canvas unit.
The adapter therefore calls this field `canvasUnit`, limited to `mm`, `cm`,
`inch` and `mil`. It is not the coordinate unit or proof of the stored annotation
unit. Annotation text, actual rendered length/radius/angle, glyph bounds and
parent ownership remain unverified. No measurement is recomputed.

All three native managers include existing loaded views without a parent filter.
The geometry limits of256rows and384KiB apply to the full family even for one
requested ID. No filters, scalar lookup, selection change, mutation or Save is
supported. Source review and synthetic tests do not establish a populated live
Dimension case; the historical empty ID result is separate evidence.

### Image placement and dimensions

Use `eda.pcb_PrimitiveImage.getAll` with empty arguments or `.get` with a
distinct `primitiveIds` array. Both sample the complete combined vector-image
and picture collection twice before selection. Native get-by-ID only searches
vector images, so this adapter deliberately uses getAll for both methods.

`primitiveType` is `Image`; `imageType` distinguishes native `Image` and
`Picture`. The start anchor `x`/`y` and `width`/`height` are already in mil;
rotation is already degrees. Do not rescale them. `horizonMirror` preserves the
native mirror flag. Width and height can be zero; that observation is not
renderability or manufacturing approval. The anchor and dimensions are not a
computed rotated/mirrored bounding box.

Template geometry, transformed paths, asset IDs, binary/source content and
silkscreen color are omitted and not compared. The native vector serializer
can allocate temporary transformed geometry before facade bounds apply; the
Picture serializer does not access its asset-backed source getter. Neither
method proves asset availability, rendered content, parent ownership or saved
source membership. The full-family256row/384KiB bounds also apply to one-ID
requests. Source review and synthetic tests are recorded; populated connected
validation remains pending. These results are not a writer baseline.

### Polygon-family identity limits

Fill, Polyline and Region identity enumeration is unavailable on the current
runtime. Their native family getters serialize shapes before returning IDs;
simplified polygons can rebuild model/view children during serialization.
Selecting only IDs afterward does not avoid those effects.

The object-tree event is not an equivalent fallback. Its parent filtering differs
from all three family contracts, and its delayed reply has no request or frame
identity. The original serializer-free managers are not exposed to the extension.
Do not substitute tree IDs, select-all, a region query or a private topic call.
A fixed observer bound to the original managers is needed before these methods
can join the current identity reader. This restriction does not change separately
pinned legacy routes or authorize a runtime patch.

### Pad parameters

Pad `hole` is null or one of these strict objects:

```ts
{ shape: "ROUND", diameter, offsetX, offsetY, rotation }
{ shape: "SLOT", diameter, length, offsetX, offsetY, rotation }
```

Dimensions and offsets use mil. Hole rotation uses degrees relative to the pad;
it is separate from the pad's board rotation. The `length` field preserves the
native slot-length value. Dimensions must be nonnegative, but zero is retained
because the native callback can substitute zero for an unavailable dimension.
This is not drill or fabrication validation. A null hole does not inspect unused
rotation/offset fields, so native NaN for a holeless pad stays outside the DTO.
Default copper parameters, mask values and thermal configuration are described
below; reverse parent identity remains unverified.
A Pad row may be inherited; never infer that it is standalone or derive its
parent from an ID prefix. Required missing fields refuse rather than receive SDK
constructor defaults. Native Component serialization still reads existing
footprint/device/font caches and child arrays before projection; ID-only reads
do not avoid that work or fetch missing libraries.

`defaultCopperShape` is one of:

```ts
{ shape: "ELLIPSE" | "OVAL", width, height }
{ shape: "RECT", width, height, cornerRatioPercent }
{ shape: "POLYGON", pathSource, coordinateSpace: "native-pad-style" }
```

Width/height are already rounded to0.1mil by the native shape callback. The
rectangle's fourth value is a percentage, not the corner radius named by the
public docs. Do not infer a rendered outline: native ELLIPSE may use width
alone. POLYGON preserves and compares the native ordered path tokens, including
on unrequested pads. Coordinates/radii use mil and ARC/CARC sweeps use degrees,
rounded natively to four decimal places. L, ARC, CARC, variable-degree C and
CIRCLE are supported, up to2048tokens per pad within the complete response bound.
An empty serialized path remains an empty observation. Nested paths and R refuse.
The native callback chooses the last available style in layer order1,2,15;
`native-pad-style` is not board space. Keep pad x/y/rotation separate: do not
apply an assumed placement, mirror or layer transform. The serializer may omit
tiny or unsupported segments, so equality does not prove full model geometry,
rendered copper or manufacturability. No polygon constructor/decoder or outline
refresh runs. This added projection has synthetic tests, not populated live
validation. NGON and unknown representations refuse. Physical-layer pad stacks remain
unimplemented; default shape is not proof that every layer uses that shape.

`maskExpansion` contains `mode`, `topSolder`, `bottomSolder` and one shared
`paste` value. Mode1 follows rules and mode2 is custom; values are observed mil,
including negative and zero. Native null-to-zero coercion means zero does not
prove an explicit override. No rule refresh is requested; these values do not
prove fresh resolution, applicability to both faces or fabrication apertures.

`thermal` is null, `{mode:1}` (direct), `{mode:2}` (nonconnected), or
`{mode:0, clearance, spokeWidth, angle}` (thermal spokes). Clearance and width
use mil; angle uses degrees. Null means no pad configuration in this projection,
not no copper connection. Values may come from a footprint template and do not
prove stored overrides or actual poured spokes. The adapter reads fixed own
fields from the native thermal object, avoiding the public mapper's incorrect
top-level reads and missing unit conversions. All three fields describe loaded
parameters, not DRC or manufacturing validity.

Two matching ordered projected samples retain the exact frame and receiver
around each await. For `get`, the complete family is validated and compared
before selecting requested IDs; unrequested-row drift or an oversized family
still refuses. `returnedRowCount` counts selected DTOs; `observedRowCount`
counts the full family. Explicit IDs reduce returned data, not vendor work.
Omitted fields are not compared. Limits are256rows,
256characters per ID,1024per net/rule name/pad number or Component metadata
string, scalar magnitude1e12 and384KiB.
Signed zero, non-finite values, duplicates, unknown enum values, missing fields
and oversized data refuse without truncation. The bounds and deadline do not
cancel the native enumeration or serializer.

Loaded views may omit saved records and include inherited or preview objects.
These native equivalents establish neither saved membership, parent ownership,
complete source, connectivity nor persistence. Optional public filters, scalar
`get` and other object families remain separate implementation work. No selection
change, navigation, source export, settings change or Save is requested.
Installed180500 passed nonempty Component/Pad `getAll` on one disposable PCB;
the new explicit-ID routes and other generations have no connected claim yet.

### Component child-pad membership

The same tool accepts `eda.pcb_PrimitiveComponent.getAllPinsByPrimitiveId` with
`arguments:{"primitiveId":"<component-id>"}` and the exact PCB target.
It requires the component in the complete native Component ID collection,
reads its complete native child-pad list, and correlates every full child ID
with the complete global Pad collection. Shared identity, number, raw net,
layer, lock, metallization and pad-type values must agree. It repeats the
compound observation and compares both complete samples before returning.

The result contains Pad DTOs in native child order, including hole geometry,
default shape, mask and thermal fields from the global Pad callback. The component-specific callback uses different
rounding and hole units, so its geometry is not copied. An existing component
may return an empty child list; a missing component or child refuses. Unrelated
pads stay outside the result but participate in full-family stability checks.

`componentPrimitiveId` identifies the requested component. Counts are
`observedComponentCount`, `observedPadCount` and `returnedRowCount`.
`relationshipEvidence` is `native-component-child-list-and-global-pad-membership`.
`reciprocalParentVerified` and `symbolPinMappingVerified` remain false. The
public parent getter stores the caller-supplied component ID, so it cannot
independently corroborate the reverse relationship. Pad numbers may repeat;
they are not symbol-pin identities. These are plain Pad DTOs, not SDK
ComponentPad instances or a verified electrical mapping.

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
