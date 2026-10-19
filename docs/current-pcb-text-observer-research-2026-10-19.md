# PCB text observer research

## Outcome

No reviewed route in the pinned installation supplies the complete PCB model,
loaded Save participants and pending-work inventories required before the first
text creation. The existing supplied-data prerequisite model must remain
unregistered. Repeated public object reads, a successful Save or an upload wait
cannot fill that observation gap.

This audit found a real project-object export, `self.PROJECT`, inside the
dedicated project worker. It is not a renderer export, and the reviewed worker
services do not expose its complete pending state. That is a concrete boundary,
not a claim that every possible observation mechanism is impossible.

The next feasible adapter is a narrow current-PCB component-attribute identity
reader. It can use an existing fixed RPC and extend useful read coverage without
claiming complete PCB ownership or enabling text writes. Its separate owner is
investigating implementation. This document adds no executable adapter.

## Evidence and scope

This was inert source inspection plus official documentation research. No vendor
JavaScript was imported or evaluated. There was no live EasyEDA call, launch,
project access, Save, generated-program execution or test-suite run. Production
designs and records were not inspected. The offline API tool was unavailable;
the committed coverage catalog and installed declarations supplied the local
coverage evidence.

The starting delivery was `a2ad6ad3b3897bcc7ee2990a8193b7cca658c07c`.
Installed files below were rehashed as bytes. Paths are relative to
`/mnt/c/Program Files/easyeda-pro/resources/app/assets/`.

| Label and source | Bytes | SHA-256 |
| --- | ---: | --- |
| PCB, `pro-pcb/3.2.193.682ed44e/js/pcb.js` | 10,976,299 | `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33` |
| API, `pro-api/0.3.50.ab46409c/api.js` | 1,964,920 | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| TYPES, `pro-api/0.3.50.ab46409c/api-types.d.ts` | 1,733,380 | `d5fe990034c55001302ea6c3f704c2d4b88cdf23253cc5293b3bad62a32b9def` |
| WORKER, `pro-mgr/3.2.184.355087e9/js/project-worker.js` | 2,181,284 | `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` |
| MGR, `pro-mgr/3.2.184.355087e9/js/pro-mgr.js` | 2,196,400 | `005584e02cd9b2d49fdb387b2f997c1c8d3f88b0c48a7531c8097c483ed0bd2e` |

Anchors such as PCB1015912 are zero-based JavaScript UTF-16 string offsets,
not UTF-8 byte offsets or line numbers. They identify the inspected source,
not a running owner. The existing
[Save prerequisite audit](current-pcb-string-save-prerequisites-2026-10-19.md)
describes the compiler, custom-footprint, copper and queued-upload effects.

## Renderer globals do not expose the required owners

PCB1015912 defines `HJ`, the message-bus container. PCB1016971 assigns an
instance to `WJ.MSG_BUS_PCB`; `WJ` comes from the global resolver. Looking only
for literal `window.name` assignments would miss this genuine export.

That container holds buses and bridges. It does not publish the main compiler
owner `x`, footprint manager `wi`, command manager `Xe`, copper owner `FP` or
the upload and teardrop managers. Their application declarations remain inside
the enclosing bundle function, including the state declarations at PCB10792646.

The reviewed `rpcService` implementations store wrapper functions that capture
their handler callbacks. Examples occur at PCB16045, PCB185919, PCB307473 and
PCB2737249. Their ordinary properties do not expose the callbacks' lexical
owners. Finding a handler that calls `x.getInstance()` therefore does not give
an extension a direct reference to `x`.

The audit reviewed the fixed service registrations, global aliases and relevant
read, source, state, compiler, queue, upload and debug candidates. It did not
find a published owner reference or a fixed complete-state observer. It did not
attempt debugger access, closure instrumentation, vendor patching or arbitrary
private-path execution.

## Candidate routes and their actual limits

| Route | Pinned evidence | Why it does not establish the prerequisite |
| --- | --- | --- |
| `pro-pcb/pcbEncodeForWorld` | PCB6987783 calls `YC.encode` at PCB6437399 | Returns document UUID/type, project ID, tab IDs and rule configuration. Its IDs are document/context identifiers, not a complete object inventory. No compiler, holder or queue state. |
| `pcb/extensionAPI/pcbmanufacturedata-getSourcePCBInfo` | PCB10321702 constructs `rw`, defined at PCB5947229 | Manufacturing aggregates such as dimensions and counts are not source records or Save-participant membership. |
| `getPcbScene` | PCB10809658 calls `Pi.getScene` at PCB10188016 | Returns UI scene/mode information, not renderer models. |
| `FileSource` | PCB10798451 | Can explicitly Save with `useCompilerSave`. Its ordinary serializer also has repair/deletion behavior documented in the [FileSource audit](current-pcb-filesource-observer-research-2026-10-18.md). It is not a side-effect-free full-state observer. |
| `pcb/saveCompiler` | PCB10798696 | Saves every loaded custom-footprint compiler, the main compiler and dynamic copper. Executing it to discover participants would perform the action whose scope needs proof. |
| `getAllItems` subscription | PCB10859050 | Calls `sYe` and schedules a later publication. It is not a fixed complete-state read RPC or an owned queue snapshot. |
| `getPartitions` | PCB10968553 | The current-document branch returns partition information. A different-document branch initializes and destroys a decoder. Neither supplies the required queue inventory. |
| Region/point object queries | PCB10301017 and PCB10301342 | Selection/filter/partition-dependent serialization does not enumerate all native holders and pending state. |
| Existing family `getAll` readers | For example `iu.getAllItem` at PCB7946904 | Models without `stateWatcher` are omitted. Empty returned collections do not prove an empty renderer. Some family serializers also have their own side effects. |

Combining these partial answers does not establish absence of omitted state.
The conservative empty-root condition still needs a complete native-model
observer and its exact original owner.

## The worker export is real, but in a different context

WORKER2176852 constructs the worker message bridge and project object `TP`.
WORKER2177102 publishes `self.PROJECT=TP`, then registers the services. The
project manager creates this code through `new Worker` near MGR1782782,
MGR1785548 and MGR1786387. It communicates through a worker bridge and a
project-named broadcast bus. MGR1780804's `Hn` exposes that bus, not the worker's
JavaScript global object.

The reviewed service set at WORKER2159430 through WORKER2162400 includes
project open/close, Save, metadata, history, compression and upload operations.
It contains no read-only complete `PROJECT` state or pending-inventory service.
Ordinary RPC access cannot read the worker global merely because the worker
itself publishes a property on `self`.

Several existing methods are insufficient or unsafe substitutes:

- `hasSaveData` at WORKER2159549 returns the consistency manager's boolean for
  one supplied unique edit ID. It neither establishes the original compiler
  token nor lists other tokens, upload buffers, worker tasks or pending timers.
- `awaitUploadEnd` at WORKER2132110 awaits a snapshot of `task1` only. Its
  service at WORKER2160444 returns success afterward. That does not cover
  `task2`, `task3`, `cachePromise`, later tasks or latent buffered callbacks.
- `checkHistorySynced` immediately following WORKER2132110 can query or sync
  cloud history and load cache state. It is not a pure queue-inspection method.
- `getSnapShot` at WORKER2127666 returns project identity and placeholder maps,
  including schematic/sheet IDs with zero values. It is not live PCB source.
- `getDataByType` at WORKER2144808 calls compression of backend document data.
  Persisted records do not reveal unsent renderer changes or complete queues.

A fixed worker diagnostic would still need an exact association with the
original renderer compiler. Neither a caller-supplied project ID nor two equal
responses establishes that relationship.

## Official API contracts do not close the gap

The official `PCB_Document.save()` returns `Promise<boolean>`. Its current
documentation also warns about successful headless responses without durable
output. It does not promise complete pending-work isolation or identify all
native participants. [Official Save reference](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_document.save.html).

The documented document methods offer region/point queries and status methods,
while the generic PCB object class has no complete native model/queue getter.
[Document methods](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_document.html),
[generic PCB methods](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitive.html).

`getCanvasUpdateCalculationStatus` was added in EDA v4.2 and concerns canvas and
property-panel calculations. It is absent from the pinned API0.3.50 and is not
an upload barrier. The local catalog records it as latest-only.
[Official calculation status](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_document.getcanvasupdatecalculationstatus.html).

The older `getCalculatingRatlineStatus` reports enablement. Its pinned handler
at PCB10299067 reads `_L.activeStatus`, whose constructor initializes it to
`active` at PCB10293314. The callback at PCB10957313 tests that flag before
running. It is not a pending-task counter. The official page marks this method
obsolete since v4.2.
[Official ratline status](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_document.getcalculatingratlinestatus.html).

## Concrete adapter identified and implemented

This research identified a current-PCB attribute identity subset using the fixed
`pcb/extensionAPI/attribute-getAll` handler at PCB10411443. It enumerates
`gr.getAllItem()` and returns each component's serialized `ATTR` entries with
`parentPrimitiveId`. The SDK flattens those groups at API1492267. The installed
declarations at TYPES436014 and TYPES437434 expose `getAllPrimitiveId` and
`getAll`. The official `getAll` contract accepts optional parent, layer and
lock filters. The subset accepts empty arguments rather than silently implementing
those filters. [Official attribute getter](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitiveattribute.getall.html).

Candidate023200 implements this subset with the checks below; see the
[Attribute reader contract](current-pcb-attribute-identities-2026-10-19.md).
It remains source-reviewed/offline-tested, with connected validation pending.

- `rL` at PCB8002758 uses the component model manager. Its inherited reader at
  PCB7946904 omits models without `stateWatcher`. Report the returned subset;
  do not claim a complete model roster or an empty canvas.
- Component `Le.toJSON` at PCB7397863 reads footprint/device caches and pad
  metadata. Missing footprint data can throw after logging. Reject that result;
  do not turn serializer failures into an empty array.
- The native handler serializes complete components before the response can
  be bounded. Response limits do not bound native work or imply cancellation.
- Validate the parent/attribute ID relation and duplicate identities before
  flattening. Preserve the ordered grouping across the two samples so moving
  an attribute between parents cannot disappear behind identical flat IDs.
- Bind both samples to the same reviewed ordinary PCB frame and context.
  Reject owner drift, malformed own-data records and unsupported arguments.
  A stable identity response is read evidence only, with no Save authority.

This is useful progress on component text inspection. It does not enable
standalone String creation or complete the Save prerequisite. That remaining
work needs a reviewed, nonmutating native observation contract for both the
renderer owners and original project worker, including deferred producer
state. No such contract was found among the pinned routes reviewed here.

If upstream adds those diagnostics, re-audit their exact implementations and
ownership before using them. Debugger injection or modified vendor bundles
would be a separate capability and security review, not a fallback hidden
inside a read adapter. Existing baseline, effect and persistence guards stay
unchanged.
