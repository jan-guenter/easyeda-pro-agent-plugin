# Schematic pages during current project-only startup

Research date: 2026-10-16. Scope: the installed EasyEDA Pro tuple used by the
current disposable opener. This is source research, not connected validation.

An active schematic page is not automatically unsafe to open, but its presence
means project-only startup can run a document decoder with repair and save
paths. A stored DOCHEAD, CANVAS record, or previous successful open does not
exclude those paths. This review did not establish a general “already
initialized page” predicate that makes them all no-ops.

For the existing disposable fixture, preserve its pages. A separately named,
explicitly accepted observation-only opening can collect the existing startup
prefix and then close normally without claiming unchanged files, qualified
startup, or writer authority. It must not change the historical report from
unsatisfied to satisfied. The strict no-active-page profile remains distinct.

## Sources and method

The installed bundles below were read as inert text and their hashes rechecked.
No application code was executed. No live tool, process launch, project or
source database, license database, or settings state was accessed for this
research. The existing fact that the selected fixture has two active pages was
supplied by the retained-evidence investigation; no additional fixture data was
read. Private fixture identifiers are intentionally omitted.

Offsets in this report are zero-based UTF-16 string offsets from JavaScript
`String.indexOf`/`String.slice`, not byte offsets or minified line numbers.

| Key and primary source | Bytes | SHA-256 |
| --- | ---: | --- |
| [SCH](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-sch/3.2.192.b79ad524/js/sch-main.js>) | 6289422 | `d9d6a955bf40d57daf9f27f31e0fff3191715ff50582418ad0922beb71b424bd` |
| [WORKER](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-mgr/3.2.184.355087e9/js/project-worker.js>) | 2181284 | `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` |
| [MGR](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-mgr/3.2.184.355087e9/js/pro-mgr.js>) | 2196400 | `005584e02cd9b2d49fdb387b2f997c1c8d3f88b0c48a7531c8097c483ed0bd2e` |
| [UI](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-ui/3.2.196.26ed3d6c/js/ui.js>) | 17456671 | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |

The surrounding migration, local-version, empty-project and exam exclusions
remain as documented in
[current startup premises](current-startup-premises-research-2026-10-16.md).
This report does not replace those conditions.

## The sheet path runs without a sheet tab

UI's ordinary `ON_OPENED` subscriber at 16667083 publishes `sch/openProject`,
then awaits `prjInit`. SCH's `-prjInit` receiver at 6171718 awaits `wb` before
publishing `projectReady`. `wb` at 5471485 fetches all sheet metadata using
`SHEET.GET_ALL_KV` without a schematic filter, then awaits `On` at 5770161, whose
project-initialization branch calls `Kxe`. MGR 2060322 forwards that request to
the selected project's sheet service. WORKER 1921285 builds the map from
active sheets filtered through `get`; `get` at 1919022 rejects absent or deleted
entries and exposes their `schematic_uuid`. [UI, SCH, MGR, WORKER above.]

`Kxe` at SCH 5472590 applies the exact selection condition
`page.schematic_uuid && page.schematic_uuid in project.schematics`. For each
selected page it awaits `Xl`, awaits `mM`, and calls
`deleteIfNotOpenCanvas`. Thus an empty restored-tab set excludes opening editor
tabs, but does not exclude loading these linked pages into memory.

`Xl` at 5769769 obtains an existing sheet manager or calls `getOrInitDoc` at
5758065. Its factory at 5759177 fetches sheet metadata, creates a `ja` sheet
manager, initializes the corresponding schematic-rule compiler if absent, and
awaits the sheet manager's `init`. This is a fresh in-memory initialization,
not a check of a persisted initialized flag. The rule compiler `nj` at 5755753
uses `dse.init` at 791377 to read schematic rules into the project managers.
[SCH.]

The worker's shared `getCanvasOnCompiler` at 1858919 requires an existing
document, waits for its current cache promises, and starts a streamed read.
The sheet receiver at 2165217 also registers a watcher. `flowWriteOnDoc` at
2145548 excludes META, META_PLACEHOLDER and DELETE_DOC from that stream; the
metadata is supplied separately. These methods do not themselves create a
default sheet drawing. The risks below occur in the consuming decoder and its
referenced symbol templates. [WORKER.]

## Concrete effects and their predicates

`I9.init` at SCH 4456057 initializes the compiler, commits decoded records,
runs the manager's initialization callback, and enables realtime-sync handling.
The initial commit calls `x9.runTask` at 4430131, which awaits decoding and then
`consistencyImpl.trySave`. That save check is therefore part of startup even
without an agent Save command. [SCH.]

| Path | Exact source condition and effect | What would exclude this branch |
| --- | --- | --- |
| Page loop, `Kxe` 5472590 | A truthy `schematic_uuid` present in the schematic map loads the page. | No active linked pages. Zero active pages is a sufficient stronger predicate, not a necessary one. |
| Net-group decode, `QJ.commit` 4440670 | A decoded group with falsy `lineSize` is detached and sent through `deleteFromConsistencyManager`. `setLines` receives another deletion callback. | Prove complete native decoding leaves each selected group nonempty and does not remove any existing decoded line. A raw WIRE/BUS count is insufficient. |
| Component decode, `S9.createSymbols` 4420080 | When a constructed component's `partId` differs from its supplied component data at the comparison, it is added to the set later sent through `uploadSelf`. | Prove exact referenced template/part selection and component data for every decoded component. The implementation can also mutate its input during fallback, so merely comparing raw part strings is not a complete model. |
| Referenced symbol template, `C9.handleAdd` near 4448873 and `tryCreateDefaultPart` 5754600 | A template with no decoded parts creates a default part, sets version `2`, and uploads that part. | Every reachable template has a successfully decoded native PART. A SYMBOL META/DOCHEAD alone does not suffice. |
| Initial save, `P9.trySave` 4459112 | Outside project-history/read-only mode, a truthy awaited compiler `checkSave()` leads to awaited `save()`. | Prove no pending records for that original compiler instance, including decode repairs and deferred pending publication. Historical records do not directly prove this runtime fact. |

These are source predicates, not assertions that the fixture takes a repair
branch. This research did not execute the decoder or evaluate the fixture's
complete component/template graph.

The net-group callback is concrete: `QJ.commit` supplies
`onDelete(line) => line.deleteFromConsistencyManager()` to `setLines`.
`setLines` at SCH 3917996 compares the existing line map with the decoded list
and invokes it for leftover entries. A fresh manager often starts with no such
entries, but that observation cannot replace a decoder-specific proof for
conflicting IDs, repeated records, or later realtime updates. The empty-group
delete is unconditional once that decoded group has no lines. [SCH.]

Template decoding is also transitive. `S9.createSymbols` reads device and symbol
metadata and obtains a template document manager before constructing page
components. `createSchSymbol` in the same body selects a fallback first part
when the requested part is missing, may prefer a non-abnormal part, copies
template descendants, and supplies inherited attributes. A check of only page
DOCHEAD and CANVAS records misses these dependencies. [SCH 4420080 through
4426900.]

There is separate in-memory normalization. `ja._init` at SCH 5372957 calls
`correctNetNamesValueVisibleForOnes144542` before registering base watchers and
the upload watcher. The correction at 4197241 compares connected special-symbol
names; absent matching names it can make net captions visible, and it calls
`tryAutoAdjustPosition`. The latter at 3929028 adjusts a visible caption when
`hasPosition` is false; `hasPosition` at 3495688 tests non-null x/y. These calls
do not themselves prove a durable write. They do show why stored/native equality
cannot be assumed merely because the page has been opened before. A stronger
source profile can require already-visible, explicitly positioned net captions
to exclude these particular changes, but that does not exclude the other
decoder branches. [SCH.]

`mM` at SCH 5446807 builds the page AST and performs library-existence checks
through `ait` at 5463313 when not closing, batching, pasting, clearing bad
devices, or in history mode. The reviewed `ait` body reads referenced library
objects and publishes diagnostic logs/links; it does not itself invoke the
linked cleanup action. Do not click repair links or confirm library-update
dialogs as part of observation-only startup. The absence of an explicit write
in `mM` does not make the preceding `Xl` initialization passive. [SCH.]

## Completion is not a persistence barrier

Compiler local changes are batched by `cachePendData` at SCH 779257 through a
zero-delay timer. `checkSave` at 781964 waits its pending-publication promise,
then asks `/mgr/check/hasSaveData` with the compiler `uniqueId`. The worker
receiver at 2159549 reads `consistencyManager.isHasData(uniqueId)`; the
implementation at WORKER 278196 checks that unique ID's pending sets.
This is original runtime-instance state, not a durable “initialized” marker.

If save occurs, WORKER `saveCanvas` at 2144972 obtains time, advances the ticket,
compresses the selected pending records, and calls `uploadLocal`.
`uploadLocal` at 2031178 writes an upload-cache entry and schedules buffered
upload; its usual return does not wait for final history persistence.
`uploadCloud` at 2022843 sends the data to `projectHistory.set`, then starts
cache cleanup and history synchronization. A save response, a drained renderer
pending timer, and a completed backend history request are different events.
[SCH, WORKER.]

The worker also calls `uploadStructure` after record changes at 2106923. Its
guard and 300 ms debounced producer at 2103000 through 2105027 create a `task2`
promise only when the delayed function starts. The producer writes the project
structure profile. `awaitUploadEnd` at 2132117 waits only a snapshot of `task1`;
MGR 2055482 forwards that same operation. Even worker close at 2118967 waits
only the then-present `task2` set after upload waiting. These are not proof
that a not-yet-started structure timer has completed. Do not add a fixed sleep,
repeat empty snapshots, or call Save to manufacture a barrier. [WORKER, MGR.]

UI publishes `loadProjectCompleted` at 16669194 after its awaited `prjInit`,
empty-project check and applicable startup tasks, before restored-document
opening and the detached finalizer. An operation-owned listener can record
that prefix under retained target/session context. It cannot authenticate the
publisher from the null payload or prove all startup callbacks complete. [UI.]

There is an additional decode-success limit: `I9.init` catches compiler-init
failure and returns false, while `createDocManagerWithRealTimeSync` awaits
`y.init()` without checking that boolean. `x9._commitCore` at SCH 4431323
catches and logs errors from `handleAdd`. Consequently, reaching the outer
startup prefix is not proof that every page decoded successfully, even before
considering persistence. Keep `startupQualified:false` and
`openingEffectsVerified:false`. [SCH, UI.]

Disposal is not a flush receipt either. `deleteIfNotOpenCanvas` at SCH 5757936
calls synchronous manager disposal. `O9._realDispose` at 4407486 calls the
async compiler `destroy` without awaiting it. That lower-level destroy at
780396 can await pending publication before revoke/unwatch. The caller's
return therefore does not supply an operation-owned completion barrier. [SCH.]

## What original closed history can and cannot establish

A complete history materialized from the original issued, hash-bound closed
copy can establish selected-branch record facts: current active/deleted sheet
membership, metadata links to schematic containers, explicit PART records in
referenced symbols, component references, and complete wire/line/attribute
records. It must retain deletion semantics and original copy provenance;
standalone summary JSON or a caller-provided history object is not equivalent.

It cannot establish a new process's sheet-manager state, compiler `uniqueId`,
pending publication timer, action-runner queue, successful decode, or completion
of the later structure job. A historical successful open or unchanged saved
checkpoint is evidence about that old run, not proof that current decode is
idempotent. Current source-file hash continuity still matters separately.

## Smallest next qualification

There are two distinct paths:

1. **Observation-only now.** Accept only the existing active-page blocker as
   an explicit exception for collecting the startup prefix, with all other
   historical, source, owner, cache, tab and one-shot dispatch guards intact.
   Preserve `historicalSubsetSatisfied:false`, expose the different opening mode,
   accept unknown file effects explicitly, and use the retained normal-close /
   termination sequence. No automatic repeat, Save, repair, page deletion,
   persistence acceptance, or writer grant follows from this observation.
2. **Qualified effects later.** Add a bounded source-derived decoder profile for
   the complete selected pages and their reachable templates. It must exclude
   or model each direct upload/delete above, reject unsupported records and
   identity conflicts, and distinguish in-memory normalization from stored
   effects. If any repair/save is allowed, retain original operation-owned
   completion for every relevant persistence producer and compare the complete
   closed result, including structure SQL, against that explicit effect model.

An empty, linked page with a narrowly accepted record vocabulary could be an
initial decoder-profile candidate because it avoids component and wire repair
branches. That is a future profile, not demonstrated support for the existing
two-page fixture, and not a reason to empty or replace its pages. A populated
“already initialized” profile requires the transitive checks above; a boolean
derived from headers would be unsafe.

The research and extension-development skills kept this work source-cited and
separate from runtime admission. No implementation, tests, live validation,
publication or installation was performed by this research task.
