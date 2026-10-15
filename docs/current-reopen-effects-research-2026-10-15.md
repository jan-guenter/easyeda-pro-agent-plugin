# Current reopening effects and the before-write boundary

## Decision

A fresh SQL snapshot after reopening is useful evidence, but it is not a
completion barrier for work started by reopening. The current application can
replay persistent upload-cache entries, schedule a structure upload, and start
a PCB Save after an opening promise has resolved. An exact later comparison
can reject unexpected effects; it cannot prevent their interleaving with the
proposed symbol write or establish that the earlier snapshot preceded only
that write.

The smallest next implementation is retained release/relaunch plus a
current-only, inactive-target upload-cache observation before opening. For
the eventual symbol metadata writer, prefer a separate **project-only opening
profile** over the current companion-PCB profile. The manager's metadata
getters need no editor. Native project opening can nevertheless restore
editors and run asynchronous initialization, so merely omitting the explicit
PCB-open call is insufficient. Do not change the native opening semantics,
set private skip flags, or suppress persistence to manufacture a boundary.

This note distinguishes source-supported exclusions from missing proof. It
does not admit a writer, qualify reopening effects, or replace the original
owned-generation checks. It read the installed APP/UI/MGR/WORKER files as
inert text and plugin source. Only `easyeda.assetsRoot` was selected from the
machine profile. No design, user/license database, account record, live
project, setting or EasyEDA process was accessed. This subtask changes only
this note; the parent records implementation and automated checks separately.

## Source identities

Files were hashed on 2026-10-15. Paths below are relative to the installed
`resources/app/` directory. Offsets are zero-based UTF-16 JavaScript string
offsets, not byte positions. Package `3.2.206.715d940d` supplies editor
`3.2.206`; the UI and manager asset directory versions differ as shown.

| Key | Relative path | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| APP | `app.js` | 2657192 | `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c` |
| UI | `assets/pro-ui/3.2.196.26ed3d6c/js/ui.js` | 17456671 | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |
| MGR | `assets/pro-mgr/3.2.184.355087e9/js/pro-mgr.js` | 2196400 | `005584e02cd9b2d49fdb387b2f997c1c8d3f88b0c48a7531c8097c483ed0bd2e` |
| WORKER | `assets/pro-mgr/3.2.184.355087e9/js/project-worker.js` | 2181284 | `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` |

These identify reviewed text, not an installed runtime receipt or a new
compatibility manifest. Native PCB-frame implementation was not reviewed in
this bounded subtask; its initialization remains an explicit dependency if
the companion-PCB route is retained.

## What ordinary reopening starts

| Source offsets | Effect and completion limit |
| --- | --- |
| APP 1318983–1320886 | Database selection opens writable SQLite handles. Initialization conditionally executes schema scripts, recursively upgrades the version, and queues `PRAGMA journal_mode = delete`. The PRAGMA callback is not awaited by the initializer's promise. |
| APP 1265024; 1320886 | The project migration map ends at `25.10.31.1`; that terminal version is not a migration-map key. Exact terminal version excludes those migration scripts, not all opening effects. |
| WORKER 2108598–2118424 | Project open selects branch/history, initializes caches, loads local or backend history, subscribes, starts `syncCloud(...).catch(...)` without awaiting it, starts recurring checks, initializes the updater and returns ready. Missing branch/history can enter conversion/upload paths. |
| WORKER 2128270–2129000; 2131260 | `openInLocal` calls `flowGetLocalHistory`, which calls `getUploadedData` and parses those cached chunks. Local-save retention cleanup and an index-cache write are detached from the opening result. |
| WORKER 2021739–2022597 | `getUploadedData` reads both upload caches and schedules every returned entry through the buffered uploader. Despite its name, it is not a passive cache getter. |
| WORKER 2029648; 2023200–2024968 | Upload buffering uses a 500 ms timer and `task1` promises. Successful backend upload starts a detached cache-write/delete continuation; cache retirement is not implied by the backend response. |
| WORKER 2103240–2107000 | Consistency changes invoke the debounced structure producer. Its 300 ms callback creates a `task2` promise only when the callback begins. An empty `task2` can therefore coexist with a scheduled structure write. |
| APP 2607938–2608820 | Structure persistence updates an existing branch row only if its ticket is lower. Otherwise it inserts a row; an equal-ticket call is not an idempotent SQL no-op. |
| WORKER 2126981; 1964464–1967047 | Recurring project checks can call synchronization. The project updater mounts background work; the caller does not await `mount()`. Its readiness is not a complete opening-effects barrier. |
| UI 15069867–15075500 | The ordinary project opener awaits the worker and its own success handling, but that handling publishes `ON_OPENED`. It does not await all asynchronous event subscribers. |
| UI 16667083–16671000; 16737077 | Asynchronous `ON_OPENED` handlers perform initialization, metadata checks, path/session updates and restored-tab opening after the public opener can return. |
| UI 15241000–15246400 | PCB creation waits for `rpcInitFrameInfo`, activates the tab and performs further setup. The native frame's internal producer lifetime is not established by this root-side code. |
| UI 15250454–15252415; 14734537–14735200 | PCB opening awaits partition reconciliation. A successful partition-title update can dispatch `save` without awaiting that Save. Resolving the PCB-open promise does not imply that Save finished. |

The fixed `awaitUploadEnd` at WORKER 2132116 waits once for the current
`task1` set. It does not wait for the structure debounce closure, all `task2`
work, the detached upload-cache cleanup, root event subscribers or a later
native Save. `checkHistorySynced` at 2132192 performs synchronization and has
different coverage; it is not a passive observation or a replacement global
barrier. Worker close at 2118424 waits sampled upload/structure tasks, but
does not expose every timer closure. The existing owned process-termination
proof is stronger for that dead process, yet it cannot rule out cache replay
by a future process.

Do not classify every background task as a target-file SQL write. In
particular, the `PROJECT_OPEN` log call at UI 16667083 uses
`/CommonDB/log/setData` (UI 6341123); MGR 2053381 routes it to the Common store
created at 2051432. This is separate from APP's `project_logs` SQL table.
The exact downstream scope of all startup subscribers was not established
here, and no user/common-store contents were read.

## Concrete exclusions available from source

### Persistent upload replay

WORKER 1708800–1708910 names the caches `project_<projectUuid>_v6` and
`localProject_<projectUuid>_v1`, with keys under `upload/<branchUuid>`.
`getUploadedData` matches each branch key with `ignoreSearch: true`; query
parameters distinguish queued entries. Absence must cover both caches and
all query variants.

The existing internal
[`upload-queue-read.ts`](../plugins/easyeda-pro-control/server/src/upload-queue-read.ts)
already uses native `CacheStorage.match` with a fixed cache name, the exact
branch request and `ignoreSearch: true`, without opening/creating a cache,
reading bodies, deleting entries or scheduling uploads. Its old URL/root
profile must not be reused unchanged. A separate current profile can retain
the same small read contract:

1. Retain the original closed-baseline owner and prove its old Job terminated.
2. Release/relaunch through the owned runtime and retain the genuinely new
   launch/session/root objects, not a copied JSON identity.
3. Before project opening, require the target absent, current Start Page,
   expected origin/mode, no controlling service worker, and no competing
   target-opening authority. Retain the CacheStorage receiver/method.
4. Bracket the two fixed cache matches with explicit-target `hasProject`
   absence checks and the current generation proof. Require both absent.
5. Preserve that inactive-target proof through the single owned dispatch.

This excludes replay of pre-existing branch upload entries under those
ownership premises. It does not prove the new worker cannot enqueue new
uploads, prove another renderer cannot create entries, or prove application
startup completed. A later cache sample cannot reconstruct the missing
pre-open exclusion. Do not call `getUploadedData`, `getLocalHistory` or cache
cleanup as probes: the reviewed local-history paths themselves reach replay.

### Known project initialization writes

UI `a3e.compare` at 16592601 obtains the project `editorVersion` and the
current `editorMainVersion` meta value. Equal values take its no-update
branch. Otherwise it can call `PROJECT.UPDATE`; a later-version warning is
not a generic no-write criterion. A new current profile can require exact
equality using independently bound baseline/runtime data.

UI `dko` at 15766745 checks document count before creating a blank board and
saving default settings. An existing nonempty project takes its early return
under either permission branch. The baseline must prove actual nonempty
document content; an arbitrary truthy caller count is not sufficient.

For APP initialization, exact terminal schema version `25.10.31.1` excludes
the reviewed migration scripts. Native journal-mode setup remains. These
three exclusions are useful but do not cover the entire startup event graph.

### PCB-specific effects

UI `getPartitionList` at 11265686 calls the native frame's `getPartitions`,
then combines it with project-tree children. An empty result causes the
partition-title loop at 14734537 to make no update or Save call. Project-tree
absence alone does not prove that native result empty. Conversely, using
`updatePartitionItemTitle` as an observation would already perform the
mutation being excluded.

The earlier reconciliation at 15238915 publishes `removeFileUuids` and
`refreshPcbItemView`. The native subscribers and `rpcInitFrameInfo` internals
are not covered by this root-source trace. The private `unUpdatePartition`
option at 15250454 bypasses native work; do not use it to claim ordinary
opening is harmless.

UI `glt` at 15252415 returns without exam setup when `isExamProject` is false.
For an exam it can register autosave and later invoke Save All. An independently
bound non-exam predicate excludes that branch only. Ordinary auto-save and
auto-backup preferences are another producer family; this research neither
read nor changed them. No source-complete no-Save/settled-PCB certificate was
found in the reviewed root-side interfaces.

## Prefer a separate project-only metadata profile

The ordinary SDK project opener at UI 17230843 delegates to the native
project-opening path; it does not require an explicit document open.
MGR 1761234 forwards project metadata to the ready worker, whose
`getDetail("project")` at WORKER 2126708 returns `projectDetails`.
MGR 2066127 similarly forwards symbol metadata through the explicit project.
These getter paths do not need a PCB canvas. A project-only profile therefore
has a genuine native route, not a fabricated worker or database substitute.

However, UI's `ON_OPENED` handler at 16667083 later copies
`gVars.sessionStorageTabs`, looks up every saved document and invokes its
ordinary editor opener. It also handles `urlCmd` after restoration. A fresh
owned launch must retain an empty restore set and no command through this
stage. Do not clear either value to satisfy the proof. The startup parser
assigns `sessionStorageTabs` at UI 15080214, so a later empty DOM alone cannot
show that no restoration was pending.

The handler publishes `openProjectInitCompleted` before many awaited steps,
and `loadProjectCompleted` before restored-tab opening. Neither event is a
full boundary. Its `Promise.all(restoredOpeners).finally(...)` sets
`isOpenProjectDoc` but is itself detached and also runs after opener failures.
That flag cannot stand alone as success or no-pending-write evidence. A new
collector should record stage facts without promoting them to a writer
admission until the relevant producer lifetime is proved. Do not weaken the
current one-PCB collector to accept any empty editor state.

Remaining project-only qualifications are finite source dependencies:
`prjInit`, pending `JP` startup tasks, initial settings behavior, the worker
updater/synchronization conditions, and other applicable `ON_OPENED`
subscribers. These are preferable to additionally qualifying native PCB-frame
repair, partition and Save behavior. No assertion here says that simply
waiting a fixed interval, repeating snapshots or observing equal tickets
settles those dependencies.

## What the eventual before-write evidence must establish

The existing owned post-opening closed copy remains a historical, complete
baseline. After a future opening, it is not automatically the baseline
immediately before a metadata write. A defensible operation needs:

- Original close/release/new-launch ownership, exact target/branch/source
  identity and the pre-open upload-cache exclusion.
- Source-qualified opening premises and an observed completion boundary for
  every relevant opening write producer, or proof that the producer's
  no-write branch applies. No callback replacement or suppression.
- Fresh operation-owned metadata/native-history and complete SQL evidence
  taken after that boundary, with exact preservation checks against the
  historical closed copy. The snapshot mechanism itself must be valid for
  an open SQLite database; do not raw-copy an active file as a substitute.
- The same generation and relevant no-interference premises at the one
  writer dispatch, followed by exact closed-result comparison. Unexpected
  opening or unrelated effects must remain a refusal, not become a broad
  allowed-delta category.

The final comparison is still necessary even with producer qualification.
It detects divergence; it does not retroactively supply missing authority.
Backend actor/clock correlation, the current writer and inverse, recovery,
and one disposable full lifecycle also remain separate work. This research
does not expand that lifecycle into a new broad test matrix or authorize
production-design access.
