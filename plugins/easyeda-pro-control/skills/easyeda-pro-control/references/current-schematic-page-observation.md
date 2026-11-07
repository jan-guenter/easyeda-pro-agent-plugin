# Ordinary schematic page opening and observation on 3.2.209

This workflow uses the already loaded ordinary local project and the original
application launch owner in this same facade. The original launch allocation is
checked around every await; historical launch JSON does not qualify. It opens one existing page, then separately reads the
ready canvas. Its source implementation and offline tests do not establish
connected admission or saved state. Do not use a completed production project
record as permission to open, edit or Save it.

Discover `schematic-page-opening` through `easyeda_control_api` with
`query:{includeSchemas:true}`. Validate the inner request with
`schematic-page-opening-validate`. The registered tool is
`easyeda_control_pcb209_opening`, using
`request:{action:"schematic-page-open",request:<inner>,expectedFingerprint:<actual>}`.

The inner open request names a new `sch209-open-*` operation, the exact raw
registered Windows path and its path-derived project UUID, current file SHA-256,
default branch, page UUID and parent schematic UUID. It requires
`confirmOrdinaryProject:true` and `acceptNormalOpenEffects:true`. The project must
already be loaded with no editor tabs or PCB iframes. This route does not open a
different project or substitute another page after dispatch.

The facade preserves a complete managed checkpoint and independently proves an
undeleted ordinary `SCH_PAGE` and its `SCH` parent in the default branch. It
rechecks the original file, checkpoint, registry path and UI/window receivers
before one public `openDocument` invocation. The maintained tracked dispatcher
captures original physical process authority and authenticated bridge ownership.
A durable operation intent precedes navigation. A lost or timed-out reply retains
its quarantine and cannot authorize a retry.

Opening can initialize drawings, update partition/title metadata, replay caches,
contact services, change shared state and automatically persist or Save. The
route makes no promise of passive navigation or unchanged storage. It offers no
CAD edit, explicit Save, prompt choice, discard, restoration or replacement owner.
Original normal closure and helper release remain with the application launch
owner.

The acknowledged tab is separate from page readiness. When the page is ready,
discover `schematic-page-read` and validate with `schematic-page-read-validate`.
Execute through the same tool using
`request:{action:"schematic-page-read",request:{target,operation},expectedFingerprint:<actual>}`.
The opener returns the exact `pageReadTarget` for this step. The target binds the
project, branch, page, parent schematic and `page@project` tab.

Supported operations are Text, Wire and Bus `get`/`getAll`, plus
`eda.sch_SelectControl.getSelectedPrimitives`. Results are native DTOs. They
retain schematic units, native Y direction, literal names and nullable styles.
The complete supported family, reciprocal tree, ID index, source-ID membership
and scalar samples must agree under one retained type-1 page. Selected Wire/Bus
line children promote to their root group, deduplicated in native selection
order. Missing, inherited and unsupported selected families refuse the complete
result. This DTO family excludes symbols, placed-component pins and arbitrary
annotations; the separate aggregate below observes raw component/pin state.

These reads invoke no compiler, serializer, source exporter, public family
getter, selection change or Save. Stable source-ID membership is not complete raw
source, connectivity, saved membership or persistence proof. The current209 SCH
and UI files are independently hash-qualified around the read; legacy schematic
writer pins remain unchanged.

For raw components, placed pins and native endpoint-cache membership, use the
same `schematic-page-read` wrapper with
`operation:{method:"native.sch_Page.observeComponentsPinsNets",arguments:{}}`.
This is an explicitly separate aggregate native DTO, rather than the public SDK
getter-instance projection. Its single `value` row contains the complete bounded
root Symbol roster, component and pin origins, raw attribute/no-connect backing
fields, literal Wire/Bus DTO names and lines, and the already-built contact
cache's member IDs. A pin's `contactIndex` selects its one observed contact row;
wire and bus group IDs identify the corresponding literal name rows.

Raw fields distinguish absent properties, own `undefined` and own scalar values,
including `null`. They retain symbol, block and variant backing values separately.
The route does not evaluate effective instance or inherited values, assign a
designator, resolve a compiled pin net or rebuild the contact cache. It reads the
original `sourceCodeIdMap`, Symbol/Pin maps, raw point values and already-built
`_netPointData.points` Set; the lazy `netPointData` getter is never used. Original
Maps, Sets, child rosters, identities, scalar fields and points must remain exact
through the final synchronous reproof after the last source-reader callback.

Missing caches, contradictory or incomplete pin/line membership, BusEntry,
unsupported component kinds and malformed raw fields refuse the complete result.
The aggregate admits at most256 components,4096 pins,8192 attributes/contact
nodes and256 Wire/Bus groups within the existing2MiB bound. Genuine independently
proved empty inventories remain empty; a missing cache is not an empty fallback.
Effective attribute values, cache freshness, complete topology, persistence and
writer authority remain false. Cached contacts can reflect native tolerance and
are not a cross-sheet or complete electrical net proof. The generic schematic
topology and display-transaction guards remain unchanged.

For local evidence after an uncertain open, submit the opening wrapper with
`request:{action:"inspect",operationId:<original>}`. Inspection reads the managed
journal without live admission and never recreates the original owner, clears
quarantine or repeats navigation. Never reuse that operation ID. After a
successful open/read, finish the original application launch's supported normal
close, observed termination and helper release.

If the original dispatcher has settled and this facade still holds its actual
ordinary runtime and journal object, inspection offers a technical
`cleanupNonce`. This is separate from admission and design-state evidence.
Use the same opening wrapper with the original operation ID and nonce:

1. `request-cleanup-close`, `confirmNormalClose:true` and
   `acceptUnknownFileEffects:true` consume one original normal-close request.
   The intent is durable before native close. A close can automatically persist
   data; acknowledgment proves neither process exit nor saved contents. No prompt
   choice or force quit is offered.
2. `observe-cleanup-termination` reads retained original root and Job handles.
   Original root exit and a complete empty Job are mandatory. An existing
   independently observed original termination can skip the close request.
3. `finish-cleanup` reobserves that termination and requires the exact old HMAC
   session closed with no active authenticated context or dispatch lease. Only
   then can it consume the original technical nonce and clear global quarantine.
   The terminal record explicitly retains unknown navigation/storage effects,
   `mutationMayHaveOccurred:true`, `saved:false` and `reopened:false`.
4. `settle-cleanup-records` publishes only an exact artifact or journal candidate
   already retained by this original cleanup owner after a local publication
   failure. It does not repeat native close or navigation. If close was requested
   but never dispatched, it can proceed to the first close after durable intent
   and a fresh exact same-window observation. Changed bytes refuse settlement.

These actions do not create a replacement renderer or adopt a historical
journal. A still-pending original dispatcher cannot enter cleanup. After cleanup
completion, finish the original launch's termination record and helper release.
No saved-content, unchanged-storage, replay, Save or writer authority follows.
