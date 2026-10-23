# Installed 3.2.209 declaration inventory

Date: 2026-10-23. Source-only work based on main
`722c4ae6aeeab35d0cdf9bdc29193f2f5ff05d35`. This record covers the declaration
inventory and omission findings, not connected execution or a release result.
No EasyEDA method, project, profile mutation, Save or process launch was used
for this research.

## Separate reference, unchanged admission

The `installed-209` SDK and coverage selector records the exact installed
`api-types.d.ts` from API `0.3.59.1ca9efb5` in application
`3.2.209.8a704eab`. It is 1,814,791 bytes with SHA-256
`0a6910f4108f3d09733a9de9176b20c41ccd2a87fc4e335f8d6d656eb054ba72`.

The old `reviewed-installed` and `official-latest` snapshots remain unchanged.
The latter name still identifies the frozen 0.4.26 reference retrieved on
2026-10-10. It is not a new claim about the latest published package today.
The default SDK selector remains `reviewed-installed`. No compatibility pin or
runtime registration changes because a declaration was added.

| Reference | Namespaces | Mounted signatures | Distinct method paths | Types |
| --- | ---: | ---: | ---: | ---: |
| reviewed-installed, 0.2.53.aee2f57a | 93 | 749 | 697 | 296 |
| official-latest, frozen 0.4.26 | 99 | 806 | 773 | 331 |
| installed-209, 0.3.59.1ca9efb5 | 113 | 844 | 811 | 436 |

The combined inventory grows from 774 to 835 distinct paths. The new reference
adds 61 paths absent from both older snapshots. Relative to the frozen latest
reference, 750 paths are shared, 109 shared paths have different raw signature
sets, 171 installed signatures have no identical latest signature, and 23 latest
paths are absent from installed-209. These are lexical comparisons, not 109
proved behavioral incompatibilities. Parameter names, formatting and overloads
must be reviewed before deciding what a difference means.

The generated catalog retains signatures, overloads, mounted class alternatives,
declaration line numbers, stability tags and source provenance. It does not turn
TypeScript into a JSON execution schema. Complete installed declarations are
not committed. Only generated signature/type metadata is packaged.

## Why the 61 additions do not enable execution

All 61 additions have concrete omission records in
`extension-api-installed-209-omissions.ts`. The classification uses closed exact
path lists, not namespace-prefix rules that could classify future methods.

| Finding | Methods | Evidence and implementation consequence |
| --- | ---: | --- |
| Literal error stubs | 18 | API methods return `ok:false` with `INTERNAL_ERROR` and an empty message without calling a backend. A facade wrapper would expose only that failure. |
| Source-operation backend absent | 29 | API wrappers exist, but their named UI or project-worker routes are absent from the inspected UI registry, manager, project-worker and schematic bundles. |
| Readiness backend absent | 4 | API wrappers exist, but the four UI handlers are absent from the installed registry. |
| Auto-job backend absent | 5 | API wrappers exist, but the named UI handlers and PCB job methods are absent from the inspected implementation. |
| Added raytracer backend absent | 5 | API wrappers exist, but the named scene/image handlers are absent from the installed UI registry and PCB implementation. |

These are findings from exact source bytes. No live failed call is claimed.
The absence finding covers the inspected installed handlers, not every possible
future application or externally supplied extension. Registering a wrapper does
not supply its missing receiver.

### Literal error stubs, 18 methods

- `dmt_SourceBoard`: `addBoard`, `getAllBoards`, `getBoard`, `removeBoard`.
- `dmt_SourcePcb`: `addPcb`, `removePcb`, `updatePcb`.
- `dmt_SourceProject`: `closeVirtualProject`, `getAllVirtualOpenedProjects`,
  `virtualOpenProject`.
- `dmt_SourceSchematic`: `addPage`, `addSchematic`, `removePage`,
  `removeSchematic`, `updatePage`.
- `sch_SourceDrc.check`, `sch_SourceNet.getConnections`,
  `sch_SourceNetlist.getNetlistInRegion`.

API UTF-16 source offsets 1,323,589 through 1,324,803 contain the document-tree
stub classes. Offsets 1,625,069 through 1,625,345 contain the three schematic
connectivity/DRC stubs. These offsets refer to decoded JavaScript strings,
not UTF-8 byte positions.

The virtual-project declaration at lines 3070 through 3181 explicitly says
virtual and foreground projects share the same project data and that changes
persist. It also requires the returned project identity for later operations.
Even an implemented virtual opener would not be an isolated validation profile.
Closing a virtual project is not a rollback or proof that pending changes were
saved. Source families concern project schematic data, not a general replacement
for symbol or footprint library definitions.

### Source-operation wrappers without the corresponding backend, 29 methods

- `sch_SourceDocument`: `getElementsInRegion`, `getFunctionGroups`,
  `removeFunctionGroup`, `renderRegion`, `transformFunctionGroup`.
- `sch_SourcePrimitiveArc`: `add`, `remove`.
- `sch_SourcePrimitiveAttribute`: `addNetLabel`, `removeNetLabel`,
  `updateNetLabel`.
- `sch_SourcePrimitiveCircle`: `add`, `remove`.
- `sch_SourcePrimitiveComponent`: `add`, `addNetFlag`, `get`, `remove`,
  `removeNetFlag`, `replace`, `update`, `updateAttribute`.
- `sch_SourcePrimitivePolygon`, `sch_SourcePrimitiveRectangle`,
  `sch_SourcePrimitiveText`: `add`, `remove` on each namespace.
- `sch_SourcePrimitiveWire`: `add`, `remove`, `removePinWires`.

API offsets 1,619,950 through 1,628,900 contain the fixed UI RPC names,
project-worker route table, transport wrappers and methods. Fourteen methods
use `/mgr/projectWorker/source/` routes. Their transport builds a
project-specific channel and probes `/mgr/projectWorker/getReadyState`.
Two region methods use separate UI RPC wrappers; `renderRegion` reconstructs
a File from the response. Thirteen other drawing methods use named UI RPC
routes. Timeout/error conversion in these wrappers does not implement a
backend or prove that a write did not occur in a later compatible generation.

The inspected manager and project-worker bundles contain neither the source
route prefix nor its readiness route. The UI registry and schematic bundle
contain no `SCH_Source` handlers. A future adapter needs an exact functioning
backend, target identity, response bounds and completion/effect proof. Writers
also need the complete disposable persistence lifecycle. A matching declaration
or a synthetic wrapper test is insufficient.

### Readiness, 4 methods

`dmt_EditorControl.getDocumentReadyState`,
`dmt_EditorControl.waitForDocumentReady`, `dmt_Project.getReadyState` and
`dmt_Project.waitForReady` have API wrappers at offsets 427,084 through
427,400 and 1,317,470 through 1,317,730. The corresponding handlers are missing
from the current UI registry. The official
[project readiness reference](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_project.waitforready.html)
marks the API beta and says it was added in EDA 4.1.79. Its timeout returns a
boolean; it is not navigation authority. Existing original-owner readiness
checks cannot be replaced with one of these unimplemented wrappers.

### Auto jobs, 5 methods

`pcb_Document.startAutoRouting`, `startAutoLayout`, `getAutoJobStatus`,
`cancelAutoJob` and `getAutoJobLog` wrap named UI calls at API offsets
1,459,690 through 1,460,316. The installed UI and PCB bundles contain none
of these method names or registered handlers. Declaration lines 7441 through
7503 specify a job lifetime independent of the initiating call and mark these
methods as additions in EDA 4.1.79. Cancellation acknowledges a request, not
observed termination. Status/log reads are meaningful only for an owned job.

The older blocking
[auto-routing method](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_document.autorouting.html)
is a different contract. Its documentation describes a 900-second internal cap,
enabled-layer requirements and no intermediate geometry commit after timeout
or failure. An adapter must not silently substitute it for the job protocol.

### Added raytracer methods, 5 methods

`pcb_RayTracerEngine.addSceneElement`, `exportImage`, `getSceneElements`,
`removeSceneElement` and `setSceneElementTransform` wrap named UI calls at API
offsets 1,515,791 through 1,516,440. The inspected UI and PCB bundles contain
none of these names. The older renderer methods in the UI registry do not
register these additions. The official
[renderer class](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_raytracerengine.html)
documents scene resources separately from initialization and disposal.
[ExportImage](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_raytracerengine.exportimage.html)
returns PNG data as a Blob and is marked as added in EDA 4.1.79;
[getSceneElements](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_raytracerengine.getsceneelements.html)
has the same generation note. A future adapter needs a retained renderer/scene
owner, managed Blob validation, bounded results and explicit disposal.

Direct initial fetches of individual auto-job and source-component documentation
pages were unavailable through the web tool. Their contracts above use the
exact installed declaration, not invented page contents. Raytracer pages were
read successfully through links on the official class page.

## Exact source identities

All implementation paths below are relative to the installed asset root. They
are research identities, not new execution admission pins.

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| pro-api/0.3.59.1ca9efb5/api.js | 1,980,754 | `e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1` |
| pro-ui/3.2.198.2800f583/js/ui.js | 17,468,192 | `3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6` |
| pro-pcb/3.2.195.6b67774e/js/pcb.js | 10,991,441 | `a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b` |
| pro-sch/3.2.193.5dbe8bb3/js/sch.js | 6,472,538 | `b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd` |
| pro-mgr/3.2.185.bf63a159/js/pro-mgr.js | 2,196,424 | `b3260ec9d98d6cad5f65a6234aa839b32f6bf5954cb03de0bd6ce003577b388d` |
| pro-mgr/3.2.185.bf63a159/js/project-worker.js | 2,181,308 | `0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046` |

## Implementation and focused checks

`generate-installed-209-api-catalog.ts --check|--write DECLARATION_PATH`
requires the exact byte size and SHA-256 above. It writes only the separate
generated snapshot. The existing generator continues reproducing both older
snapshots and imports this separate snapshot; it does not silently refresh
their input pins or retrieval dates.

Regression checks preserve the complete serialized objects of both old
snapshots, enumerate all three catalogs with bounded advancing pages, verify
all 61 exact omissions and ensure they expose no registered execution route.
Catalog and coverage defaults remain backward compatible. The generated
machine-readable inventory includes all 835 paths and separate
`installed209Declaration` metadata. It reports no current-generation live
validation or complete declared-contract support.

On Node 24.18.0 with core dumps disabled, the three focused catalog/coverage
suites passed 60 tests. Type checking, targeted strict type-aware lint and
the exact-source regeneration check passed. Bundled-startup and public-facade
schema expectations were updated for the third snapshot but await the final
combined payload's build and tests. No connected evidence follows from these
checks.
