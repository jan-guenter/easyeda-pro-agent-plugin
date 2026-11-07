# Project-open library-refresh frontier

The pinned current209 `Lg.open` tail starts a library refresh outside its own
awaited result. This applies to the same project-worker used by disposable Via,
seven-record schematic and saved-footprint inverse openings. A fulfilled open
result or a cancelled `checkProject` timer does not settle that refresh.

The primary source is the installed
`pro-mgr/3.2.185.bf63a159/js/project-worker.js`, 2,181,308 bytes,
SHA256 `0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046`.
All offsets below are zero-based UTF16. The maintained
[source roster](../../plugins/easyeda-pro-control/server/src/current-project-library-refresh-source.ts)
pins nineteen library-loop methods and sixty opening/constructor/task methods
against that complete source. Inspection and compilation do not execute the app.

## Opening path and constructors

`Lg.open` at 2108622–2111587 awaits `requestInNet`, selected-branch history,
`initCache`, `getLocalIndex`, the selected cold/local loading branch and
`subscribe(1)`. The generated inverse route excludes conversion, warm local
index, pending-local upload, cache fallback and failed fetch before their model
work. The admitted saved history has at most eight complete chunks/heads;
source `applySnap` at 2024986–2025453 requires more than100 heads after its
initial offline return, so the snapshot request and detached createSnapshot
branch are excluded by the actual complete head count.

The complete direct construction closure is:

- `Lg` → `Gd` → `ja` → `Vc` → `zy`, plus `gT` and `mI`. These allocate model,
  order, callback, watcher and task collections. `Gd` creates a buffered-upload
  closure without starting its500ms timer.
- `Lg` creates `Pg`, `Cg`, `bg`, `Dg`, `vg`, `Og`, `Sg`, `wg`, `Eg`, `_g`,
  `Tg`, `Ag`, `xg`, `Ig`. Their bases are `Pi` or `ar`. Constructors capture
  the selected project/client and allocate data/maps/empty watcher IDs and
  null timer fields. They do not start canvas/revoke/variant timers.
- `Nd`, `QA` and `ZA` only create closures at construction. Invoking them can
  create queued Promises, a300ms structure timer, or the0ms+10ms cooperation
  stream. Original wrapper/closure custody remains necessary.
- `ci` stores progress counters. Its `update`/`publish` methods can publish UI
  progress when `needProgress` is true; they do not write design history.
- `fu` → `Hm`; `fu.init` creates `Fd`, `kd`, `Ld`, `Md`, `jd`, `Bd`, `Ud`.
  Each creates `mr(li, namespace)` then `Kr`. `mr` creates/reuses the worker
  global `__PROJECT_UPDATE_DATA__` namespace and seven in-memory library-cache
  objects; `fu` assigns `__UPDATE_DATA_MGR__`. These are declared worker-global
  bookkeeping effects, not selected-file SQL. A fresh original capture must
  prove both globals absent before construction and the exact empty seven-cache
  roster afterward; it must never clear or adopt existing cache objects.

The source contains no other `requestAnimationFrame` or
`cancelAnimationFrame` call. Those two calls belong to `Hm.loop`/`destroy`.

## Asynchronous and event work through terminal return

| Source path | Work and actual disposition required |
| --- | --- |
| `Gd.initCache`,2020085 | Two awaited `bb.open`/CacheStorage opens. Original empty-cache and full backup/deletion custody is separate from the worker's later opening. |
| `openInCloud`,2129074 | Awaited complete `du` jobs; flow cache puts and final head-index put can outlive this method. The inverse cache collector binds every expected key/body/native put and original outer Promise, rather than trusting the opening result. |
| `getFlowParse`,2020325 | Actual flow callbacks create cache puts, add to `cachePromise` and drop the Promise returned by `.then` cleanup. Same native job and successful cleanup must be observed. |
| `consistencyManager.onChange`,Lg constructor | Calls original `uploadStructure`, `localPublishTicket` and, conditionally, cooperation buffering. The selected callback/serial queues need their own actual completion; an empty final Set is insufficient. |
| `localPublishTicket`,2108156 | A separate20ms timer may be created during parsing even before `isReady`. It later publishes only when ready and clears its slot. It has no task Set and is not the `checkProject` timer. Its original callback/slot completion must be observed or deliberately controlled before an idle claim. |
| `orderChange`,Lg constructor | Can create a20ms order-publication timer, or publish directly at50000 entries. Exact incoming row/order effects and the actual pending timer must be bounded; do not infer absence from document count. |
| `ar.publishCanvas`,1857789 | Empty original `watchIds` excludes its two20ms canvas/revoke branches. If any target is already watched, actual publishTask/native callback custody is required instead. |
| `Ag.onDataChange`,1942925; `xg.onDataChange`,2008633 | BLOB/FONT records can create their own20ms canvas/revoke jobs even without `ar.watchIds`. Mixed projects containing those families require those actual source callbacks or an explicit pre-model eligibility refusal. |
| `Ig.onVariantChange`/`onGroupChange`/`onGroupDataChange`,1975237/1976632/1978506 | VARIANT/group families create another20ms publication timer. These branches cannot be dismissed by an empty canvas watcher roster. |
| `ja.delayClear`,278374 | Its external callers are only `chunkCompressFull`, `asyncCompressFull` and `flowCompressFull` (292205/294343/294670); the cold parser does not call them. Original compression guards exclude that5s cleanup during the admitted opening. Later Save/compression requires its own custody; no general cache-clear permission is implied. |
| `subscribe(1)`,2115324 | May create a BroadcastChannel message-bus wrapper and awaits the login-user RPC. Installs project/branch and worker subscriptions; `watchWs` publishes watch registrations only if actual `isEstablished` is true. The half-offline label alone does not exclude later deliveries. |
| `projectSubscribe`,2112374 | `g_ticket` can call detached `updateProjectInNet`; established notification clears/resets projectTimer; closed expression's `&&checkProject()` operand is dead after assigning false. Batch-pend/revoke worker subscriptions can change models. Those actual callback ingress paths remain guarded/refused until separately qualified. |
| `branchSubscribe`,2113625 | History deliveries can start detached sync+metadata GET; cooperation deliveries can remoteChange/revoke/publish. Explicit callback/source guards must remain installed; no quiet-period inference is accepted. |
| `syncCloud(h)`,Lg.open | Detached by `.catch`; original task3/cachePromise/finalizer and each of four same-head GET/SQLite replies are owned separately. Changed-head, fallback and recursive pending sync cannot inherit that narrow completion. |
| `checkProject`,2127005 | Schedules the first1000/3000ms recursive timer before library init/readiness. A separately journaled original once-only cancellation retains its positive timer slot. Later subscriptions can reset it and therefore remain guarded. |
| `new fu` then `initUpdateData`,2107738 | Awaits `updateTeam`, calls `init`, drops the original `mount()` Promise. This is an additional independent frontier. |
| `applySnap`,2024986 | Its network/createSnapshot work is count-excluded for the complete≤8-head admitted profile; its async return alone proves nothing for larger projects. |
| final `isOpening=false;isReady=true;progress.update` | Marks the synchronous opening tail. It is not a barrier for detached cache/sync/mount/publication tasks or future subscription callbacks. |

This inventory is scoped to the exact direct constructor closure, all branches
of the source opening method and model/subscription callbacks reachable through
those branches. The imported BroadcastChannel implementation and external RPC
handlers are separate original-source dependencies; an installed subscription
is not permission to accept an arbitrary callback.

## First library-loop control

`fu.updateTeam` at1967071 returns immediately when actual worker `ln` is true
(`IS_CLIENT`). Otherwise it awaits a teams query and writes the in-memory
team roster. This predicate excludes only that query; it does not exclude mount
or todo. The fixed first-loop route requires the original client predicate
before releasing to init, rather than assuming it from renderer mode.

`Hm.mount` at1652337 awaits `shouldMount`, calls empty `fu.beforeMount`, sets
`timer=1`, awaits `loop(false)` and calls empty `fu.mounted`. Suspending before
mount is ineffective because mount resets the timer. `Hm.loop` at1651750 tests
`timer>-1 && (!timer || !e || intervalExpired)`: for first `e=false`, the60000ms
interval does not defer work. Its condition still calls Main `IsActive` even
though false `e` makes that condition's final result true. `fu.todo` can then
query project profiles, populate caches and update all seven model managers.

The fixed control stops the actual first loop at its source guard before the
condition/todo. A separately consumed purpose intent invokes the genuine pinned
`Hm.suspend` on that same original receiver. Its pinned timer setter sets
`_timer=-1` and `fu.suspended` is empty. The actual loop then skips conditions
and todo, but still schedules a RAF unconditionally. At the original loop's
return pause, retain its actual positive animation ID and call only the
metadata-qualified original `cancelAnimationFrame`, once, while that callback
cannot yet enter. Keep the timer at-1 and the positive animation slot unchanged.
Observe the original mount body normal-return pause after its awaited loop;
retain refusal breakpoints for animation entry, todo, resume and force.

The raw dropped mount Promise is not invented or reconstructed. The result
explicitly distinguishes an observed normal async body return and its completed
loop await from retention of a mount Promise object. Neither control nor its
inert result claims the full producer frontier, Save, SQL or persistence.

The inverse parser currently retains `FOOTPRINT_INVERSE_LIBRARY_UPDATE_FRONTIER_PENDING`
at its original parsed pause. These inert source/program leaves do not remove
that guard or issue a native owner. Via and seven-record schematic callers must
use distinct original intents/origins; no inverse owner or token transfers.

The finite inert transport reserves41 normal CDP commands,11 exact helper-source
receipts and8 cleanup commands (60 total). Three original pause holds, one bind
and one completion control produce65 native controls. Actual purpose adapters
must retain all counters, original IDs and the private completion reference.
