# Disposable project/PCB opening and bounded readers on 3.2.209

Use `easyeda_control_pcb209_opening` for an explicitly disposable,
already-registered local project and an existing PCB. Live actions own a separate
native launch through cleanup. Historical queries only read that operation's
published snapshots. Neither path can adopt an ordinary launch or enable the
older 3.2.206 diagnostic, worker, model or writer routes.

Discover `pcb209-opening` with `query:{includeSchemas:true}` and validate each
inner request with `pcb209-opening-validate`. The registered request grammar,
not the larger older diagnostic catalog, determines available actions.

The `easyeda_control_api` tool takes this complete offline validation wrapper.
Replace the inner `query.request` with the proposed opening action. This example
validates an inspection request without opening a journal or starting EasyEDA.

```json
{
  "request": {
    "action": "pcb209-opening-validate",
    "query": {
      "request": {
        "action": "inspect",
        "operationId": "pcb209-example-01"
      }
    }
  }
}
```

The inner action does not belong directly in `query`, and the API does not take
an `arguments` wrapper. A `valid:true` response grants no execution authority.

## Fixed sequence

1. `launch` takes a unique `pcb209-*` operation ID and
   `confirmValidationOnly:true`, `confirmDiagnosticLaunch:true`, and
   `acceptExistingProfileEffects:true`. Existing or unresolved owners block it.
   Keep this Codex session alive through final helper release.
2. Retain the returned `bindingSha256`; later bound actions require it as
   `expectedBindingSha256` with the same operation ID. It is not an ownership
   token that another facade can adopt.
3. Run `browser-observation`, select its unattached page target, then
   `inspect-frames` with that observed `targetId`. Use an observed top-level
   `frameId` for `inspect-script` with `family:"ui"`. Do not guess IDs or select
   another script family. Each stage is consumed once.
4. `open-project` requires `target:{rawWindowsPath,projectUuid,documentUuid,
   expectedSourceSha256}`, `confirmDisposableProject:true` and
   `acceptNormalOpenEffects:true`. Use the exact registered Windows path, its
   raw-path hash as project UUID, the existing PCB UUID and current file digest.
   The coordinator creates its own checkpoint and derives default-branch PCB
   membership; caller SQL, branch overrides or replacement checkpoints are
   not accepted. It requires an empty editor under the original UI owner.
5. After accepted project opening, call `open-pcb` with the original binding
   and `acceptNormalOpenEffects:true`. The target is already sealed; do not
   supply a replacement document. `observe-pcb-opening` then separately checks
   the child frame, DOM owner, complete PCB source and native target identity.
6. If layer metadata is needed, call `observe-layers` once after successful
   `observe-pcb-opening`, with only the original operation ID and binding.
   It returns both the layer projection and copper count. A separate target,
   method or existing ordinary owner cannot be substituted.
   For Line, Arc, Via and parentless text, `observe-primitives` is a separate
   once-only stage with the same binding and no family, filter or ID arguments.
   `observe-extended-primitives` is a third once-only stage for Component, Pad,
   Attribute, Dimension and Image. It has the same original binding and accepts
   no selectors. A fourth stage, `observe-selection-relations`, captures all nine
   families, selected IDs and child-pad lists for up to 16 requested Component
   IDs. Its optional `componentIds` defaults to `[]`; IDs must be unique and are
   preserved in request order. Use only the readers needed for the task; all four
   can share the original owner within the existing transport budget.
7. Use `observe-window`, then one `normal-close` with its observed `hwnd` and
   `confirmNormalClose:true`. Observe original root/Job termination with
   `observe-termination`, then call `release-closed`. Finish any offered
   `settle-records` using the inspected original intent digest.

Startup/opening use the existing profile and can restore tabs, migrate files,
replay caches, contact services, write shared settings and automatically Save.
This is neither isolated nor a zero-write operation. No agent edit or explicit
Save is dispatched. Leave unexpected Save/Discard prompts unanswered.

An opening acknowledgment is not readiness. Source/frame identity does not
prove ratline delivery, complete startup, geometry, saved contents or writer
eligibility. The result leaves those claims false. This route has source and
offline validation; a later installed generation needs its own live evidence.

## Layer result

`observe-layers` captures the original PCB receiver and brackets two complete
layer reads with native tab/type observations and owner checks. It returns raw
twelve-field native rows, the nine-field `getAllLayers` equivalent and
`copperLayerCount`: enabled native SIGNAL/PLANE rows plus two. Do not recount
public SIGNAL rows without checking status; public TOP/BOTTOM also map to
SIGNAL. Disabled inner layers remain in the returned collection. Native color
strings are preserved even if malformed, not repaired or validated as CSS.

Limits are512 unique layers,65536 native JSON bytes and131072 final result
bytes. Unknown/accessor fields, duplicates, drift or incomplete collections
refuse whole. The ten-second observation deadline does not cancel native RPC
work; failure consumes the attempt. RPC bookkeeping and possible lazy local
identity-environment initialization are incidental effects. Neither this read
nor copper count establishes physical stackup, ratline completion, saved
contents or writer eligibility. `getCurrentLayer` remains an unsupported stub;
do not substitute the first active row.

## Primitive result

`observe-primitives` reads Line, Arc, Via and parentless String collections in
that order, with native tab/type checks before and after each complete sample
and captured receiver checks around every awaited call. Two ordered projected
samples must match. The result includes each family's DTO rows and ordered IDs,
with at most256 rows per family and393216 UTF-8 bytes in the complete packet
and final result. It refuses unsupported data or excess output, never truncates.

These are native loaded-view projections, not public SDK instances. Models
without an existing `stateWatcher` view and parented text are absent by the
vendor's enumeration contract; an empty result does not prove an empty board.
Other families, complete source membership and connectivity are not observed.
Distances are mil and angles degrees. Arc endpoints/angle omit center, radius
and sweep; Via omits unused-layer and suture state. Arc/Via preserve native
precision rather than the public wrappers' rounding. String text/style and
display flags do not verify glyphs or font contents; serialized null color can
mean an empty native color string. Null and empty nets remain distinct.

Native enumeration precedes bounds. The ten-second deadline cannot cancel an
already dispatched callback; failure consumes this stage. No partial family
result, selected-object query, source export, edit or Save is provided. Use the
result for its four projected families, not as a complete baseline for writing.

## Extended object result

`observe-extended-primitives` reads Component, Pad, Attribute, Dimension and
Image in that order. Each of two matching snapshots is bracketed by native
tab/type observations. Captured frame, project and receiver checks run around
every awaited call. Limits are 256 rows per family, 256 Attribute parent groups
and 393216 UTF-8 bytes for the complete native packet and final result. A refusal
consumes the stage and returns no partial family results.

The result retains ordered IDs and these projected fields:

- Component placement, layer, lock and six optional metadata strings. A separate
  `componentMetadataStates` array distinguishes absent, undefined and present
  fields. Empty strings and Name formulas remain unchanged. This is not library,
  device or 3D enrichment.
- Pad placement, number/net, null/ROUND/SLOT holes, ELLIPSE/OVAL/RECT/POLYGON
  default copper shapes, mask expansion and thermal settings. Distances are mil,
  rotation and thermal angles are degrees, and rectangle corner ratio is percent.
  Polygon paths remain in native-pad-style space. Do not infer a board transform
  or complete physical layer stack. Unsupported shapes refuse the whole result.
- Attribute text, placement, style and display flags, with complete observed
  component groups including empty groups. Their parent roster must match the
  same snapshot's Component roster in native order. This establishes that
  association only, not reciprocal ownership or symbol-pin mapping. Name values
  may already be formula-expanded; null color can represent an empty native color.
- Dimension Length/Radius/Protractor coordinates and annotation style. Geometry
  uses mil; `canvasUnit` is the current document setting returned by the getter,
  not proof of the stored annotation unit or the rendered measurement.
- Image and Picture placement, dimensions, rotation and mirror state. No asset
  bytes, paths, hashes, availability or rendered boundaries are returned.

These are loaded-view projections. Models without existing views are absent.
Native serializers can round shape parameters or omit small polygon segments;
the observations do not reconstruct them. Image serialization can allocate
temporary geometry before bounds, and Component observation can initialize an empty
length-cache singleton. There is no geometry edit, source export or explicit
Save. The ten-second deadline does not cancel an already dispatched vendor
callback. Samples are sequential, not atomic, and grant no writer baseline.

## Selection and component-pad result

`observe-selection-relations` requires the same accepted original PCB opening,
operation ID and binding. It is consumed once, independently of the other
readers. It reads Line, Arc, Via, Component, Pad, parentless String, Attribute,
Dimension and Image in that order. Two complete snapshots must match. Native
identity checks bracket each snapshot, selected IDs are read before and after
its collections, and the captured receiver is checked around every await.
The fixed program uses one CDP call and up to 58 local RPCs when all 16 requested
component child lists are included. It does not change the selection.

The result retains every selected ID in native order and resolves it to a DTO
from the nine families. An unsupported or missing selected object refuses the
whole observation; it is never silently dropped. Parented String views remain
unsupported. The result is an observation of loaded views, not SDK instances.

For each requested `componentIds` entry, the Component must occur in the same
snapshot. Its complete observed child-pad ID list preserves native order and
valid empty groups. Each child must occur in the global Pad collection, with
matching number, net, layer, lock, metallization and pad type. Duplicate child
assignment across requested parents refuses. This does not prove exclusivity
across unrequested parents, reciprocal ownership or symbol-pin mapping.
Child-handler geometry has different units and rounding and is not returned.
Any geometry in the corresponding Pad DTO comes from the global Pad reader.

Limits remain 256 rows per family, 256 selected IDs, 256 Attribute parent groups,
16 requested component groups, 256 child IDs across those groups and 393216
UTF-8 bytes for the native packet and final result. Unsupported data, changed
ordering or excess output refuses without truncation. Existing family omissions,
serializer effects and the ten-second non-cancelling deadline still apply.
This reader supplies no complete-board, connectivity, saved-state or writer proof.

## Query a recorded observation

Use `inspect` with the original operation ID and observation stage to obtain
its published result-record digest. Pass that exact digest as
`expectedResultRecordSha256` to `query-observation` through
`easyeda_control_pcb209_opening`. This action reads the journal snapshot on disk;
it makes no live RPC, starts no process and cannot adopt an old owner. It is
repeatable, including after original cleanup, and needs no binding token.
An unpublished, failed, altered or incompatible observation refuses.

The inner request has this shape. Replace the example ID and digest with those
from the original inspection before calling the tool.

```json
{
  "action": "query-observation",
  "operationId": "pcb209-example-01",
  "observation": "selection-relations209",
  "expectedResultRecordSha256": "0000000000000000000000000000000000000000000000000000000000000000",
  "query": { "kind": "family", "family": "Pad", "where": { "net": "GND" } }
}
```

Choose the observation that actually contains the requested data:

| Observation | Available families and queries |
|---|---|
| `primitives209` | Family queries for Line, Arc, Via and String |
| `extended-primitives209` | Family queries for Component, Pad, Attribute, Dimension and Image |
| `selection-relations209` | All nine families, `{"kind":"selection"}`, and `{"kind":"component-pads","componentId":"observed-id"}` |

A family query may include `primitiveIds` and `where`. IDs are a nonempty list
of at most 256 unique exact IDs. Every requested ID must exist in that observed
family before filters run. Results preserve request order when IDs are supplied
and source order otherwise. Filters combine by exact equality; case, empty
strings and null remain distinct. Only these fields are supported:

| Field | Families |
|---|---|
| `primitiveLock` | All nine |
| `layer` | All except Via |
| `net`, including null | Line, Arc, Via, Pad |
| `designator` | Component |
| `padNumber`, `padType` | Pad |
| `parentPrimitiveId` | Attribute |

Selection queries retain the captured selection order. A component-pad query
requires a component group requested in the original live stage, including an
observed empty group; it cannot fetch an unobserved component. It returns the
corresponding global Pad DTOs in observed child order.

Results identify `historical:true` and `freshObservation:false`, the original
record provenance, target and projection digest, ordered rows and IDs, and
source/candidate/returned counts. Relevant Component metadata presence states
are retained. Attribute queries retain the complete observed parent roster,
explicitly labeled even when returned rows are filtered. The original decoder
revalidates the whole snapshot before querying; the result remains bounded to
393216 bytes. None of this establishes present editor state, saved membership,
connectivity, owner authority or a baseline for editing.

## Failure and cleanup

After an error or lost reply, use `inspect`; never repeat navigation under the
same or a new ID. Optional inspection stages are only `browser`, `frames`,
`script`, `pcb-opening`, `layers209`, `primitives209`,
`extended-primitives209` and `selection-relations209`. Inspection returns the
retained attempt; it does not dispatch another read. Workers and the complete native
geometry/model baseline remain unavailable.
Original normal cleanup remains available after a failed observation and does
not depend on bridge authentication. A requested close is not termination.

`cleanup-unlaunched` and `cleanup-no-process` are distinct, offered only with
their original retained non-dispatch/no-process proof. They require
`expectedIntentSha256`. They are not a workaround for ambiguous creation,
post-creation failure or a lost host. Do not disconnect the native pipe to
force exit, recreate ownership from journal JSON, choose prompts or use another
launcher. Detailed retained cleanup semantics are shared with
[native diagnostic validation](current-pcb-diagnostic-validation.md#lost-replies-and-failures).

The fixed transport remains bounded to 103 requests and 64 MiB; callers cannot
choose a command, expression, debugger pause, source pin or budget. UI and PCB
source are verified in the original renderer context; installed selectors,
manager and project-worker files are separately hashed. Asset hashes are not
continuous file leases or proof of every transitive module. Ratline capture and
the complete write/save/reopen lifecycle remain separate work.
