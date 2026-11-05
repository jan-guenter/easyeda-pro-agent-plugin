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
result. Symbols, placed-component pins and arbitrary annotations are excluded.

These reads invoke no compiler, serializer, source exporter, public family
getter, selection change or Save. Stable source-ID membership is not complete raw
source, connectivity, saved membership or persistence proof. The current209 SCH
and UI files are independently hash-qualified around the read; legacy schematic
writer pins remain unchanged.

For local evidence after an uncertain open, submit the opening wrapper with
`request:{action:"inspect",operationId:<original>}`. Inspection reads the managed
journal without live admission and never recreates the original owner, clears
quarantine or repeats navigation. Never reuse that operation ID. After a
successful open/read, finish the original application launch's supported normal
close, observed termination and helper release.
