# Current writer completion research

## Decision

The current EasyEDA build still lacks a reviewed structure-write drain. The
smallest useful writer remains a name/description change to one closed ordinary
project symbol, with whole-session termination and complete closed-file SQL
comparison. Public Save is not a shortcut. The existing closed-symbol lifecycle
is implemented against an older tuple and cannot be enabled by replacing hashes.

A bounded implementation step is available now: add a current-version exact
project-symbol metadata read, then use it as the input to a fixed metadata
preflight/compiler. Keep writer registration blocked until the current-version
actor, navigation, persistence and failure paths are qualified. A metadata read
does not prove that a symbol is closed, that its sources are valid, or that a
write can complete.

This review read installed application sources and repository code only. It did
not access projects, profile databases, live tools or production records.

## Reviewed sources

Paths are relative to the installed `resources/app/` directory. All source
positions below are zero-based UTF-16 JavaScript string offsets. The files were
read and SHA-256 checked during this review.

| Key | Path | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| APP | `app.js` | 2657192 | `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c` |
| UI | `assets/pro-ui/3.2.196.26ed3d6c/js/ui.js` | 17456671 | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |
| API | `assets/pro-api/0.3.50.ab46409c/api.js` | 1964920 | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| MGR | `assets/pro-mgr/3.2.184.355087e9/js/pro-mgr.js` | 2196400 | `005584e02cd9b2d49fdb387b2f997c1c8d3f88b0c48a7531c8097c483ed0bd2e` |
| WORKER | `assets/pro-mgr/3.2.184.355087e9/js/project-worker.js` | 2181284 | `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` |
| WS | `assets/pro-mgr/3.2.184.355087e9/js/ws-service.js` | 855142 | `7a372d7271225999c3d16bcef1cd91c0fa2d3a1a402ebcf9761442ecf3187453` |

The application package is `3.2.206.715d940d`, with editor version `3.2.206`.
Package, editor, UI and API versions are separate identities. Current identity
selection is recorded in [the context research](current-context-research-2026-10-13.md).

## Why the completion blocker remains

| Current source | Effect |
| --- | --- |
| WORKER 1847033, `Nd` | Retains the active promise, one queued invocation and latest arguments in lexical closures. |
| WORKER 2011134, `QA` | Creates a delayed callback with `setTimeout`; the structure caller supplies 300 ms. |
| WORKER 2104005–2105060 | `uploadStructure` and `structure` both use `Nd`. The structure callback adds its task2 promise only after the timer starts. It serializes the complete tree, captures current maxTicket and awaits `setProfile`. |
| WORKER 2106923 | The consistency callback invokes `uploadStructure` without awaiting the returned promise. |
| WORKER 2132116 | `awaitUploadEnd` awaits task1 only. |
| WORKER 2118424–2119190 | Project close awaits task1 and the task2 set then present. It does not observe either closure's queued timer. |
| WORKER 2144978–2145510 | `saveCanvas` compresses pending content, then awaits `uploadLocal`; it does not add a structure drain. |
| WORKER 2159550–2162650 | Worker RPC registrations expose upload waits, history synchronization and mutation-capable operations, but no structure-closure observer. |

The newer `checkHistorySynced` method at WORKER 2132192–2134310 is not a
replacement barrier. It compares the remote head with the loaded history,
checks task3/cache/loading state, can call `syncCloud` and load missing segments,
then rereads the head. It never awaits the two structure closures. It can also
perform synchronization and cache work, so it is not a passive queue getter.

APP 2607938–2608820 retains the same structure-table behavior as the older
review: a lower existing ticket causes an UPDATE for every matching branch row;
an absent row or non-increasing ticket causes INSERT. The schema at APP 1255820
still uses an AUTOINCREMENT identity. A repeated write can create a duplicate
row; a settled task2 promise does not independently establish the intended SQL
effect.

Whole owned-session termination prevents that worker from running a later
timer. It does not prove successful persistence. Keep the existing independent
SQL comparison and fresh-generation saved-content check. Durable upload-cache
handling also remains necessary: WORKER 2022078 reloads branch upload entries,
while 2024488 deletes uploaded entries in a detached async task. Neither an
acknowledgment nor process exit proves the queue was empty before reuse.

## Current metadata-only getter chain

Use the fixed native equivalent `/PrjDB/symbol/getData` with exactly
`[targetUuid, projectUuid]`. Do not expose caller-selected RPCs or a `need` flag.

| Current source | Bound path |
| --- | --- |
| MGR 688175 | Symbol GET topic is `/PrjDB/symbol/getData`. |
| MGR 2066127 | The registered callback calls `K(projectUuid).symbol.getData(targetUuid)` and returns its result. |
| MGR 1787848 | `K` looks up the existing project registry and throws for an absent project. It does not open one. Explicit project identity avoids its default-current-project branch. |
| MGR 1755862 | Symbol `getData` requires its existing project to be ready and sends `{uuid, need}` to the worker. This two-argument outer RPC leaves `need` undefined. |
| WORKER 2168108 | The worker routes to `symbol.getNeedData(uuid, need)`. |
| WORKER 1931625 | `getNeedData` calls `getData`; only a truthy `need` adds `getCanvasData`. The proposed fixed call does not take that branch. |
| WORKER 1931468, 1930476 | `getData` uses `get`, which rejects absent/deleted entries and creates a projected metadata object from the loaded symbol and project owner. |

The examined fixed branch has no Save, canvas parse/export, watcher registration,
structure invocation, project open, network fallback or cloud-library routing.
This is a source-level result for that branch, not connected validation or
global runtime quiescence. Bind the current authenticated process, project,
branch and active companion context around both samples. Project readiness is
not an atomic guarantee across awaited calls.

The getter returns `display_title`, a normalized `title`, `description`,
`custom_tags`, `source`, `version`, `ticket`, UUID/project/path and owner data,
plus actor/time fields. Its `source` and `version` use native empty-string
fallbacks; `custom_tags` is native JSON text. These are observed metadata, not a
complete source or lossless stored META record. A new typed DTO should select
bounded own data fields, retain relevant exact values and avoid returning the
whole owner/actor object. Validate the returned symbol/project/path and ordinary
`docType === 2` independently. Compare complete projected samples, not only IDs.
The getter forwards `ticket` without coercion; require a finite safe integer
rather than interpreting missing or string tickets.

For independent loaded-project owner correlation, the fixed
`/PrjDB/project/getData` call with `[projectUuid]` is also a metadata read on the
examined branch. MGR 2056032 calls `K(projectUuid).project.getData`;
MGR 1761234 requires readiness and forwards to the worker's project-detail
service. WORKER 2126708 defaults to the `project` selector and returns the loaded
`projectDetails`. The getter at WORKER 2013000 returns `_projectDetails`; its
setter attaches current `isV2Format` and `currentBranch`. Select and compare
only own `uuid`, `owner.uuid`, `currentBranch` and `isV2Format` fields against the
existing context and symbol metadata. Do not return the full project object,
select a network project getter, or call its adjacent update operation.

Official [LIB_Symbol.get documentation](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_symbol.get.html)
describes a beta public getter with optional library identity. The proposed
exact project route is a narrower native equivalent, not the public getter's
general system/personal/cloud-library contract.

## Current metadata write and Save paths

WORKER 1937501–1938500 still provides a narrow metadata path. `updateData`
reads the loaded symbol, changes supplied fields, takes native server time,
builds the symbol header and META through `updateString`, and awaits
`uploadLocal`. `newTicket` at WORKER 1856471 increments maxTicket. No explicit
editor Save is needed. Ordinary symbols are omitted by the block-symbol-only
tree serializer at WORKER 1941037, which makes this a smaller SQL contract than
a page or PCB rename. A structure ticket write can still occur even when the
tree's serialized contents remain unchanged.

Do not reuse the public modifier directly as an exact local patch. API 1326955
forwards to UI. UI 17365557–17366840 first awaits a symbol lookup, then chooses
project routing by comparing the supplied library ID with the current project.
It also rebuilds metadata and classification inputs. The fixed project-qualified
worker update is the more precise route once its lifecycle is qualified. The
[official modifier contract](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_symbol.modify.html)
returns a boolean and labels the API beta; it does not promise structure-queue
settlement or closed-file SQL verification.

The public schematic Save still reaches Save All. API 1514815 forwards the
operation; UI 17426038 maps it to `ll`, whose implementation at 15201624
collects unsaved tabs and processes them. Its optional filters select document
families, not one exact UUID. PCB Save at UI 17312555 ignores its argument and
sends an empty target to the `save` RPC. The handler at UI 17158208 then selects
the active tab. The documented booleans for
[schematic Save](https://prodocs.easyeda.com/en/api/reference/pro-api.sch_document.save.html)
and [PCB Save](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_document.save.html)
do not resolve those installed target/completion constraints.

## Concrete implementation order

1. Add the fixed current metadata read/preflight described above. Reuse current
   context and loaded-frame guards, but prove the target symbol is absent from
   the complete editor-tab/split-screen registry before treating it as closed.
   This is a usable baseline capability and a writer dependency.
2. Add a separately profiled fixed name/non-null-description compiler. Preserve
   source, tags and ordinary-symbol type. Bind the exact worker client/ticket,
   actor, current project/branch, clean companion tab and closed target before
   the update. Reuse the existing SQL planner only after confirming current
   header serialization and actor/time behavior against the current sources.
   A dormant compiler alone must not change API availability.
3. Migrate the existing owned-session coordinator to a current-version lifecycle,
   not a relaxed legacy profile. Its old URL guard excludes current workspace
   fragments and its worker guard requires `urlCmd === null`. Current
   [project URL grammar](../plugins/easyeda-pro-control/server/src/current-project-url.ts)
   is already separate. The
   [current opener review](current-disposable-open-research-2026-10-14.md)
   also records native initialization and possible Save effects; the old
   pre-open byte-invariance premise cannot be copied blindly.
4. Run one scoped disposable name/description lifecycle and its requested-field
   inverse using retained normal-close/termination, complete SQL/source
   comparison and fresh-generation readback. No extra matrix is needed to start.
   Preserve any prompt or ambiguous write for recovery; never replay Save or
   manufacture completion with a sleep.

The current task's initial useful deliverable can stop at steps 1 and 2 while
truthfully reporting that editing remains blocked. Restoring this one writer
does not restore the seven other metadata actions or general schematic, symbol
and PCB geometry writers. Their completion and exact SQL effects remain separate
work, as recorded in the
[original structure-completion analysis](project-structure-save-completion-2026-10-12.md).
