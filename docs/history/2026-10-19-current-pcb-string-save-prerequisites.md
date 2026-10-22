# PCB String Save prerequisites

## Implemented scope

`current-pcb-string-save-prerequisites.ts` checks a strict pair of supplied
pre-create snapshots. It excludes known loaded-footprint, dynamic-copper,
command-history, upload and project-worker pending state. It predicts only the
main compiler's document arguments, `[pcbUuid, "BLOB", "FONT"]`.

This is not a native observer or a Save authorization. The module has no runtime
registration, executable program, dispatch token or import from an enabled
writer. Every live observation, ownership, complete-baseline, queue-completion,
effect, persistence and execution flag remains false. Equal supplied snapshots
do not establish temporal stability or complete collection.

The initial scope requires a fresh empty root PCB, but this module does not
establish that condition. Empty public object collections leave unsupported
families and private renderer state unaccounted for. Complete native-model,
original-source and original-worker observation remain separate prerequisites.

This source audit did not execute vendor JavaScript, call EasyEDA live, open a
project or modify a design. The offline catalog tool was unavailable to this
subagent. Local catalog/source inspection and the official method page were
used instead. No compatibility pin, package version or generated bundle changed.

## Official contract and pinned implementation

The official `PCB_Document.save()` contract returns `Promise<boolean>`. It reports
Save/upload failure as false. The current page also warns that headless execution
may return true without durable output and recommends checking files separately.
That documentation neither describes all native participants nor supplies an
exact full-SQL or reopen proof. [Official Save reference](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_document.save.html).

Inspected installed sources, independently hashed as bytes:

| Source | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-pcb/3.2.193.682ed44e/js/pcb.js` | 10,976,299 | `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33` |
| `pro-ui/3.2.196.26ed3d6c/js/ui.js` | 17,456,671 | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |
| `pro-api/0.3.50.ab46409c/api.js` | 1,964,920 | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| `pro-mgr/3.2.184.355087e9/js/project-worker.js` | 2,181,284 | `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` |

Offsets below are zero-based JavaScript string positions, not line numbers or
UTF-8 byte positions. These bytes do not identify a running process.

## Save can affect more than the selected text

The API wrapper at API1448356 delegates to the UI. `Vg.save` in UI17311522's
class body checks the current PCB context and calls the shared `save` route.
The PCB Save handler at UI15190678 resolves a tab iframe and calls its
`pcb/saveCompiler`. On success, `successPcb` performs keepalive work, updates
the UI, logs the Save and schedules preview generation. The public wrapper is
therefore not an exact-frame isolated compiler call. This new model enables
neither route.

The fixed PCB service at PCB10798696 does the following:

1. Enumerates every holder returned by `wi.getInstance().getAllItem()`.
2. Saves every `Al` custom-footprint compiler, without filtering by placed
   component count or whether the requested text references it.
3. Saves the main `x.getInstance().compiler`.
4. Calls `FP.getInstance().saveCopper()`.

A custom-footprint response with `success:false` is logged and the loop
continues. A thrown rejection aborts, but a false result need not make the final
PCB result false. The handler only substitutes the copper failure when the
main compiler result succeeded. A final success cannot prove every custom
footprint saved or that none was touched.

`Al` is defined at PCB4309604. `wi` aliases `Dm`, whose manager selection at
PCB4309943 can choose a different project through `otherDecodingProjectId`.
The conservative initial relation therefore requires the complete current
holder map and alternate-project manager inventory to be empty, with no
alternate decoder project. It does not infer this from empty component DTOs.

`FP` aliases `ON` at PCB6439966. `ON.saveCopper` at PCB6439833 uses a truthiness
test on `workerName`. The worker manager at PCB6436177 starts its ID counter at
zero, so ID `0` is an existing worker even though this Save branch skips it.
The model rejects zero, false and empty string. It requires an explicitly
nullish worker name, bus and timer, plus empty active-worker, bus, ratline,
worker-bus and worker-state inventories. It does not terminate workers, toggle
automatic copper, clear registries or claim absent copper geometry from them.

## Creation reaches shared queues before Save

The command manager `kde` at PCB7922234 executes the create composite, filters
its commands, changes undo history, marks the tab unsaved, publishes teardrop
work, calls upload and publishes the extension primitive event. Filtering can
undo an object after its ID was generated. The returned ID is not enough.

Both `De.upload` and `De.increaseUpload` in the class at PCB7916638 flush three
shared managers after individual command uploads:

| Manager | Native state | Possible upload |
| --- | --- | --- |
| `pE`, PCB4852798 | `flag` | Whole `BOARD` record or its deletion |
| `qI`, PCB4721328 | `data` set | `POURED` records or deletions |
| `e5`, PCB4839358 | `data` set | `INNER` records or deletions |

The teardrop subscriber `Sfe` at PCB9092131 has `modify`, `task`, `modifyTears`
and `timeoutId` state. `flushService` schedules a zero-delay callback even when
there is no relevant text geometry. Its removal phase calls
`Xe.increaseUpload()` even for an empty set. Existing composite commands or
upload sets can therefore be flushed by deferred work after the create call.

Before the first create, the supplied relation requires no history stack,
empty undo/redo arrays, false BOARD flag, empty POURED/INNER sets, empty teardrop
sets, no timer and the initial nonmoving/suspended state. This deliberately
rejects an existing otherwise-empty stack. It is not a post-create validator:
the proposed text itself creates history, publication and a deferred callback.
Their original producer, exact effect and completion still need observation.

## A compiler acknowledgment does not finish the project worker

PCB `cachePendData` at3145459 buffers local lines and schedules publication.
The base compiler's `save` at3147112 awaits `pendPromise`, then sends UUID, path,
document IDs, unique edit token and client to project Save. It sends no complete
renderer source. Its default documents are the selected PCB, BLOB and FONT.
The promise is not automatically cleared after resolution. Requiring a nullish
promise here is a conservative fresh pre-create exclusion, not a way to inspect
whether an existing promise settled or permission to clear one.

The worker registers project Save at2159621. `saveCanvas` at2144972 tests
`consistencyManager.isHasData(uniqueId)`:

- With pending token data, it gets backend time, advances a ticket, compresses
  the token's records intersecting the requested documents, then calls
  `uploadLocal([data], false)` and marks `isApplyShot`.
- With no pending token data, it calls `uploadCloud()`, which iterates the
  project-wide `bufferUploadData`. That can include other documents or actors.

`uploadLocal` at2031178 writes upload-cache data and schedules the buffered
uploader. The 500 ms buffered uploader is initialized at2012395. A cache write
failure takes the direct upload branch. `uploadCloud` at2022843 performs
history writes, asynchronous cache cleanup and later synchronization. Empty
renderer queues cannot prove these backend tasks completed or were isolated.

The supplied model excludes all worker task1/task2/task3/cachePromise members,
upload data/cache keys, uploading/batch/sync flags and consistency unique-ID
keys before creation. It also requires ready, nontemporary, ordinary editable
history. These are complete supplied inventories, not counts or native-owned
samples. They do not cover latent debounce closures or prove startup completion.
`isHasData` at WORKER278196 can be false for an existing empty unique-ID entry;
the model conservatively rejects even that entry.

## Concrete observer gap and remaining implementation

The pinned PCB bundle wraps `x`, `wi`, `Xe`, upload managers and `FP` in its
closure. Source searches did not find a reviewed global exposing them. Native
`getPcbScene` at10809658 is not an escape: it returns `Pi.getScene()`, whose
implementation at10188016 is a UI mode array, not the renderer scene or models.
`pro-pcb/pcbEncodeForWorld` at6987783 returns IDs and configuration, not queue
or compiler ownership. Existing object getters omit some model families and
private state. This audit does not establish that another route is impossible,
only that none of these candidates supplies the required observations.

Do not invent a `window` field, call arbitrary private paths, instrument vendor
closures or weaken exact-baseline checks to consume this model. Next work needs
a reviewed native route for complete observation, original worker ownership,
startup/subscriber effects and an interval-bound post-create proof. Only then
can a one-attempt Save lifecycle consume journaled intent. Final acceptance
requires complete closed SQL, fresh reopened same-ID readback, final closure
and a saved visual check. UI acknowledgment, stable repeated data and fixed
waits do not replace any of those checks.

Six focused synthetic tests pass on Node24.18.0 with the test-isolation preload.
They cover every nonempty inventory, missing/extra field, worker zero, identity
drift, deferred state, callbacks/proxies/coercion, malformed arrays and false
authority claims. They do not execute a native worker, timer or Save.

## One-String compiler publication relation

The later source-only `current-pcb-string-publication.ts` adds the missing
create-to-worker payload comparison. It consumes the original inert create
candidate and its original exact-target observation plan. The ID, client,
compiler token and preceding maximum ticket remain supplied inputs, not
native-issued observations. The module adds no listener, live transport,
dispatch token, Save operation or runtime registration.

The pinned PCB producer has this path, using zero-based JavaScript string offsets:

- `uploadString` at3149779 calls `localChange` with ID, body and `STRING`.
- `localChange` at3146068 supplies the target document and head type. The
  consistency manager at2755522 assigns its current maximum ticket plus one.
- `cachePendData` at3145459 places `[id,ticket,type,body]` in the document's
  pending list. Its length counter uses JavaScript string length plus one,
  not encoded UTF-8 byte length.
- `publishPendData` at3145812 publishes
  `[documentMap,client,uniqueId,originDocumentUuid]`, then empties each pending
  list and replaces the cache. A retained reference sampled afterward is not
  the original payload. The tests explicitly preserve a structured copy before
  clearing their synthetic producer cache.

The worker subscriber at2112925 destructures only the first three envelope
entries. Each record becomes a `remoteChange` call with ticket, client, document,
ID, body, record type, document type and compiler token. The fourth origin
document entry is ignored by that subscriber. The new comparison still requires
it to equal the expected PCB document rather than discarding that producer field.
The envelope contains no project or branch identity, so matching it cannot prove
project ownership.

The accepted relation has exactly one PCB document and one `STRING` record. Its
body must match all19 ordered create-candidate fields byte for byte. Extra
documents, pending records, BLOB/FONT records, BOARD/POURED/INNER side effects,
deletions, alternate IDs, nonconsecutive tickets, changed client/token/origin,
unknown fields, accessors, proxies and sparse arrays all refuse. The plan and
comparison are frozen. Their projection hash uses a fixed object-field order;
it is not a raw transport or evidence-artifact hash. Native array positions and
encoded STRING body bytes are never normalized.

Seven focused tests and24 adjacent create/Save-prerequisite tests pass on pinned
Node24.18.0. Strict type-aware lint and typecheck pass. These tests use a
producer-shaped fixture, not an imported vendor renderer, actual worker or
connected publication. The first test run refused a malformed synthetic tab ID
before comparisons; correcting that fixture to `document@project` produced the
31 passing tests. No runtime guard changed for that correction.

The observer gap remains concrete. This follow-up rehashed the PCB, UI and worker
sources against the table above, inspected their registered services and confirmed
that none of the reviewed candidate routes exposes the whole renderer/worker
inventory. `hasSaveData` checks only records belonging to one token;
`awaitUploadEnd` awaits only `task1`; source compression can initialize worker
caches. `getPcbScene` returns UI modes, not models or queues. No vendor closure
was patched or instrumented to expose its private managers. A future observer
must bind the original frame and worker and capture the complete interval,
including additional publications and deferred teardrop callbacks. Passing this
one-batch relation proves neither delivery nor completion, isolation, full SQL
effect, Save or reopened persistence. All corresponding authority flags remain
false. The official [Save contract](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_document.save.html)
was checked again; its boolean result supplies none of those missing observations.
