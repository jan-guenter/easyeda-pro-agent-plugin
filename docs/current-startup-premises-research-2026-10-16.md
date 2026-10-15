# Current local-project startup premises

Research date: 2026-10-16. This note narrows the next project-only opening
profile. It does not establish that startup completed or authorize a writer.

The useful historical checks are the exact project migration marker, a valid
undeleted PCB metadata witness, and the absence of active `SCH_PAGE` documents.
Do not require a stored project `editorVersion`: this local backend neither
returns that field nor applies the UI's version-only update request. The exam
predicate belongs to a renderer cache, not to a known project SQL column.

## Sources and method

Only installed application source was read, as inert text. The sole selected
machine-profile field was `easyeda.assetsRoot`. No project database, design,
user/license database, live application, or settings state was read or changed.
All offsets below are zero-based UTF-16 string offsets into the hashed file,
as returned by JavaScript `String.indexOf` and `String.slice`. They are not byte
offsets or minified line numbers. Hashes were rechecked on this date.

| Key and installed primary source | Bytes | SHA-256 |
| --- | ---: | --- |
| [APP](</mnt/c/Program Files/easyeda-pro/resources/app/app.js>) | 2657192 | `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c` |
| [UI](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-ui/3.2.196.26ed3d6c/js/ui.js>) | 17456671 | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |
| [MGR](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-mgr/3.2.184.355087e9/js/pro-mgr.js>) | 2196400 | `005584e02cd9b2d49fdb387b2f997c1c8d3f88b0c48a7531c8097c483ed0bd2e` |
| [WORKER](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-mgr/3.2.184.355087e9/js/project-worker.js>) | 2181284 | `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` |
| [SCH](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-sch/3.2.192.b79ad524/js/sch-main.js>) | 6289422 | `d9d6a955bf40d57daf9f27f31e0fff3191715ff50582418ad0922beb71b424bd` |
| [VERSION](</mnt/c/Program Files/easyeda-pro/resources/app/version.txt>) | 36 | `fc553f3d0a58fb917eb910997e45f9773228af239e9f3ebfcdc759fbd759fe54` |

The installed package version is `3.2.206.715d940d`. `version.txt` contains
`3.2.206.715d940d.6d5480, 10/10/2026` followed by a newline. This is distinct
from the UI asset directory version and the injected editor version below.
The current disposable opener pins APP, UI, MGR and WORKER. SCH and VERSION
are researched dependencies here, not newly admitted executable dependencies.

## Project migration marker

APP defines `db_versions` with string `key` and `value` columns at 1303413;
the table creation is at 1278247. The initializer `Sy` at 1319660 queries the
row whose `key` is exactly `sqlite`, selecting its `value` at 1320007. A missing
row starts at `0.0.0`. Neither SQLite `schema_version` nor `user_version` is
this application migration marker.

For an `.eprj2` project, `d2` at APP 1265024 maps versions through `0.0.1`,
`0.0.2`, `0.0.3`, `0.0.4`, `0.0.5` to terminal `25.10.31.1`. The final SQL
at 1262734 updates `db_versions.value` to `25.10.31.1` where `key='sqlite'`.
The initializer chooses a different map for `.elib`; its terminal value must
not be reused for projects. `z5` at 1320886 applies each mapped SQL list in a
transaction and recurses to its target version.

An exact, uniquely represented `sqlite`/`25.10.31.1` row excludes these reviewed
project migration steps because that terminal value is not a key in `d2`.
Reject unknown values rather than inferring that they are newer and compatible.
This excludes migration scripts only. APP 1320309 still schedules
`PRAGMA journal_mode = delete` through a callback; the initializer does not await
that callback. The terminal marker is not proof of a write-free opening.

## Local project version behavior

The `projects` ORM at APP 2217379 and terminal table definition near 1262734
have no `editorVersion` column. `G.show` at 2317612 explicitly projects project,
owner and membership fields; it omits both `editorVersion` and `exam_info`.
It derives `name` and `title` from the filename. The local detail handler at
2375643 returns this result with the path-derived project UUID. The v4 GET
route at 2616886 uses that handler.

WORKER `project.get` at 1765780 returns the backend result. Opening at 2108598
adds `timeOfOpenProject` and `filePath` to `projectDetails`, without injecting
an editor version. `getDetail("project")` at 2126708 returns those details.
MGR 1761234 and 2056037 forward the ready project's details to the UI.

UI `a3e.compare` at 16592601 reads the project's `editorVersion` and the DOM
meta element `editorMainVersion`. It does nothing when the DOM version is
empty or the two strings are equal. Otherwise it warns if its `greaterThanAB`
comparison considers the project newer, or sends `PROJECT.UPDATE` with the
DOM version. That comparison examines only the first two dotted numeric
components; it is not a full semantic-version comparison. With a missing local
project version and a nonempty DOM version, the UI reaches the update request.

MGR 2092941 forwards `PROJECT.UPDATE` to its network project service. APP
2373800 handles a truthy `requestParams.editorVersion` by assigning an empty
response body and skipping the actual project-update branch. This is a
source-backed local handler no-op. It does not prove that arbitrary requests,
middleware, online project APIs, or every startup action are read-only. There
is no reason to call the update endpoint as an observation.

This corrects the earlier candidate premise of requiring a stored current
project `editorVersion` in
[the reopening research](current-reopen-effects-research-2026-10-15.md).
Do not substitute SYMBOL `DOCHEAD.editVersion`, a project-file header, or the
asset-directory version for a field this local detail route does not return.

### Origin of the renderer version

APP 1332640 reads VERSION and takes the trimmed field before the comma as
`q0`. APP 2578738 removes the suffix using its fixed regex and supplies
`self.PRO_EDITOR_VERSION`; APP 2579159 inserts the same value into the root
HTML's `editorMainVersion` meta element. For the installed VERSION bytes the
result is `3.2.206`.

This is the installed producer's value, not a fresh DOM observation. VERSION
is not currently part of the disposable opening profile's pins. The UI may
still send its update request even though the local backend ignores it. Keep
`localEditorVersionUpdateNoOp` separate from any claim that the renderer version
was checked or that the UI version-check stage completed.

## What the empty-project check counts

UI `dko` at 15766745 requests `PROJECT.COUNT_DOC` after its permission and
document-list checks. A truthy count returns before the empty-project creation
branch. If permitted and the count is zero, that branch can create a board,
create a panel on its applicable path, and apply defaults. The topic string is
at UI 6000385. MGR 2056238 dispatches the fixed project's count request.

WORKER `countDoc` at 2144574 sums exactly seven per-type `count()` results.
Each count returns `getAll().length`; each `getAll()` filters its map entries
through `get(uuid)`. The native type strings are defined at WORKER 237289.

| Native type | `get` offset | `getAll` offset | `count` offset | Additional rejection beyond absent entry or truthy `isDelete` |
| --- | ---: | ---: | ---: | --- |
| `SCH_PAGE` | 1919022 | 1920558 | 1927094 | None |
| `SIMULATION` | 2001205 | 2002620 | 2007544 | None |
| `PCB` | 1901353 | 1902735 | 1908671 | None |
| `PANEL` | 1893722 | 1894234 | 1898907 | None |
| `DEVICE` | 1866990 | 1868022 | 1875725 | Absent or falsy `attributes` |
| `SYMBOL` | 1930476 | 1931191 | 1939569 | None |
| `FOOTPRINT` | 1880738 | 1881456 | 1890186 | None |

These getters do not require drawable canvas content or a linked parent.
DEVICE reads referenced symbol and footprint details for projected type fields,
but missing references are not an explicit rejection. SYMBOL count has no
regular-versus-block-symbol filter. BOARD, SCH containers, CONFIG, BLOB, FONT,
INSTANCE, variants/component groups and PANEL_LIB are not counted here.

Do not equate this sum with the history decoder's document count. Native maps
can receive entries through DOCHEAD `setEditData` routing at WORKER
2119200 through 2120220, as well as per-record change handlers. A count of valid META
records is therefore not an exact reconstruction of native `countDoc`.

### A conservative positive PCB witness

PCB `onDataChange` at WORKER 1899987 creates a map entry for its UUID. A META
record copies `title`, `parent`, `source` and `board`. A DELETE_DOC record sets
`isDelete` from the truthiness of `payload && payload.isDelete`; a false branch
clears deletion. META does not itself clear a prior deletion.

PCB `get` at 1901353 rejects only a missing map entry or truthy `isDelete`.
It does not require a nonempty board, parent, source, drawing, or component set.
An owned PCB document with a well-formed current META containing a string title
and a maintained, unambiguous not-deleted result is therefore a sufficient
positive witness. Label the conclusion `nonemptyNativeDocumentSet`, not an
exact native count. A stricter metadata shape may refuse additional native
inputs without weakening this implication.

Keep malformed or conflicting deletion histories blocked. Native truthiness
does not justify coercing malformed values in the plugin. The materialized
history must retain deleted documents and resolve current records before
counting active types. Its sorted record order is not the producer's original
insertion order and must not select an arbitrary first META as authoritative.

## What zero active schematic pages excludes

WORKER sheet META handling in the class starting at 1917350 copies `title`,
`schematic`, `source` and `zIndex`. Its `get` at 1919022 rejects deleted entries
and exposes `schematic_uuid`. `getAllKVData` at 1921285 filters through
`getAll`; with no schematic argument it returns all active pages. MGR 2060322
forwards `SHEET.GET_ALL_KV` to that project-specific method.

The SCH `-prjInit` receiver at 6171718 awaits `wb` at 5471485 before publishing
its project-ready event. `wb` requests `SHEET.GET_ALL_KV` with no schematic
filter. Its initialization reaches `Kxe` at 5472590. That function iterates the
sheet map and initializes a sheet only when `schematic_uuid` is truthy and is
present in the schematic map. The selected branch calls `Xl` and `mM` before
releasing a document not open on a canvas.

Zero active `SCH_PAGE` documents therefore excludes this linked-sheet loop
under the reviewed native materialization. It is stronger than necessary,
since active unlinked pages skip the conditional too. Deleted pages do not
enter the filtered map. Raw document-type absence checks without deletion
resolution are not the same predicate.

This does not exclude other code in `Kxe`, all `prjInit` subscribers, schema or
journal-mode work, cache replay, or later native edits. It does not establish
startup completion. Executable reliance on this exclusion needs the SCH source
dependency qualified in addition to APP, UI, MGR and WORKER.

## Exam status is a renderer-cache predicate

UI constructs `_projectInfo={}` at 15178666. `setProjectDetailCache` at
15182470 assigns the supplied detail object by project ID. One path gets
details through `Ni.PROJECT.GET` at 15182410. `Ef` at 15965623 also fetches
those details, and the second ON_OPENED subscriber at 16737080 passes them
to the cache setter at 16737547. Cache clearing at 15185791 resets this map.

`getExamProjectStatus` at UI 15185234 first computes
`Boolean(detail && detail.exam_info)` from that cache. If true it fetches fresh
details and updates the cache, but the returned `isExamProject` remains the
initial boolean. If initially false, it does not fetch fresh details. Thus the
earliest no-exam condition is an absent cache entry or falsy cached `exam_info`,
not a known SQL setting.

The local APP detail producer above omits `exam_info`, and WORKER forwards its
result without adding that field. This supports the narrow source statement
`localProjectDetailOmitsExamInfo`. It does not prove that the renderer currently
holds that exact detail object, that an empty cache means the project was
checked, or that another route cannot replace it. Keep
`runtimeExamStateVerified:false` until the actual renderer state and its owner
are separately established.

UI `glt` at 15252415 obtains that status at 15253119 and returns on false
before its exam timer and auto-save registration. The source omission can
exclude that branch only when its cache premises hold. Do not invent an
`exam_info` project column or a CONFIG exam flag, and do not use the status
method as an assumed passive getter because its true branch fetches details.

## Recommended historical report and remaining work

A report derived from the original hash-bound closed copy can retain the
exact `db_versions` row, the positive PCB witness and the factual active
`SCH_PAGE` count. Unknown schema or a missing conservative metadata witness
can produce explicit blockers. Malformed deletion or contradictory data under
the supported schema must fail, not become an unknown-schema report. Keep the
original copy's SQL inventory and checkpoint provenance behind those facts;
standalone report JSON or a supplied history object is not that provenance.

Keep local version-update and exam-detail claims labeled as source findings.
They are not stored project fields. Keep startup-complete, pre-opening
continuity, runtime exam verification, persistence-complete, before-write
baseline and execution-authority claims false. A later executable profile
still needs its additional source dependencies, current target continuity and
operation-owned startup completion. Repeated equal snapshots do not supply
that producer-owned boundary.

This source-only research adds no implementation or test result. It does not
change native persistence, open a project, run a writer, publish a release, or
install an update. The research and extension-development skills kept the
findings tied to exact installed producers and separate from live validation.

## Continuation: project-only completion and backend evidence

This continuation rechecked the APP, UI, MGR, WORKER and SCH hashes above.
It also reviewed [WS](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-mgr/3.2.184.355087e9/js/ws-service.js>),
855142 bytes, SHA-256
`7a372d7271225999c3d16bcef1cd91c0fa2d3a1a402ebcf9761442ecf3187453`.
The same source-only restrictions apply. Recommendations below are not new
execution support, new pins, or observations of a running application.

### The generic document opener does not create the blank project tab

UI `xr` at 15254890 is the ordinary document-tab opener. It obtains document
data, calls `J8o` to create the tab, then awaits `glt` at 15256604 before its
editor/import steps. This includes lazy document tabs. Its two other direct
`glt` callsites at 15246044 and 15251262 belong to PCB opening.

The main project `ON_OPENED` subscriber at UI 16667083 reaches `xr` inside
the restored-document loop at 16669200 through 16670240. A genuinely empty
retained `sessionStorageTabs` set excludes that loop. Its later `urlCmd`
dispatch must also be absent. The separate temporary-project subscriber at
16670635 does open a first document, so the conclusion does not apply to
temporary/imported projects.

`createBlankTab` at UI 16424893 directly uses `vt.addTab` and may activate the
hidden blank tab. It does not call `xr` or `glt`. Thus ordinary project-only
opening with no restoration, URL command or later document navigation excludes
these exam-autosave registrations without querying or changing exam settings.
Other callers of `getExamProjectStatus` remain, so this is a call-path
exclusion, not `runtimeExamStateVerified:true`.

The single-object `vt.addTab` path at UI 15675019 appends the blank entry with
`tabs.push`, preserving the existing container-info object, tabs array and
Start-tab object. `render` at 15673102 updates active order and React-renders
the view without replacing those owners. Other addTab branches can replace
the array, so this preservation claim applies only to ordinary blank creation.
It does not promise that React retains every DOM node. `createBlankTab` does
not await `simulateClick`; a later observer may still see Start or blank active.

### A useful owned stage, not a global idle signal

The main subscriber awaits `prjInit`, `dko` and any `JP.flushTasks` before it
publishes `loadProjectCompleted` at UI 16669194. That event is later than
`openProjectInitCompleted`, which it publishes at 16667751 before those awaits.
Neither event waits for the second ON_OPENED subscriber at 16737077, which
fetches project details and fills the renderer cache separately.

An operation-local listener registered before the single open dispatch can
observe `loadProjectCompleted` as evidence that this native subscriber reached
that prefix. The event carries no project ID, so a future fixed observer must
retain the exact root, bus and listener; recheck target, branch and owned
opening generation at delivery; reject duplicate or foreign transitions; and
cancel only its own registration. It must not replace native callbacks or
publish a synthetic completion event. Timeout consumes navigation, not a retry.

The binding is source-backed. UI `kFo` at 16956605 assigns the root
`_MSG_BUS_`/`gVars.messageBus` to `dde.MessageBus`; `dde` at 8102091 imports WU,
whose export at 1643547 selects `Zcn`. Its `subscribe` at 1649345 returns a
`v2t` task. The task implementation at 1648690 makes `cancel()` clear its
callback and running flag. It does not immediately splice the task from the
subscription array; a later publish removes the inert entry. `publish` at
1649137 calls subscribers synchronously, without awaiting returned promises.
Task execution catches thrown callback errors, so a fixed observer must retain
failure in its own state or promise rather than rely on a throw escaping the
publisher. The reviewed local event sends `null` and no bridge/source arguments.
The payload cannot authenticate its producer. Keep that limitation explicit
even when the operation observes the expected event under its retained context.

`me.isOpenProjectDoc` is unsuitable as the sole signal. UI 16445348 initializes
it false once, but Start Page initialization at 15080752 already sets it true
when there is no initial project URL. The ordinary opening code does not
reset it. Its later assignment in `Promise.all(restoredOpeners).finally` at
16670244 also occurs after failed restored openers. Do not require an invented
false-to-true transition or promote a sampled true value to success.

After the event, the empty restored-opener array still has a detached `finally`
that calls layout and assembly-variant initialization. `restoreLayout` at UI
16422020 returns immediately if the originally retained `initContainerTree`
is null. SCH's `assemblyVariantInit` handler at 6229033 calls `Qs.init`; the
implementation at 5554589 reads variant/group lists into memory and publishes
`initSortVariantEnd`. This reviewed initialization body has no native project
write call. The event is not a barrier for unrelated or future subscribers.

### Remaining producers are specific, not one undifferentiated queue

| Producer | Reviewed scope and remaining condition |
| --- | --- |
| `JP` startup tasks | UI 10169377 awaits each queued function. The only two `JP.addTaskItem` sites, 10179733 and 10180316, are import-to-existing-project flows. Fresh non-import opening excludes those producers by provenance; do not clear the queue to manufacture emptiness. |
| Initial project settings | UI `ace.init` at 15068746 initializes its consistency reader and fills absent defaults in memory. Its separate `save` and `fEo` paths perform uploads. The positive native-count witness excludes the `dko` call to `fEo`. |
| Startup library-update notice | UI 16668775 invokes `VW` with `needUpdateSymbolData:false`. `S0i` at 8151752 then skips the updater `FORCE` request, reads updater results and may open the update dialog through `openCore` at 15630970. Actual library mutation is in `confirmUpdate` at 15632576. Do not confirm that dialog during this operation. |
| Worker updater | WORKER 2107714 does not await `updateData.mount`. The updater at 1964467 reads origin data into its own caches and publishes notifications. The reviewed device/footprint/symbol/PCB/block-symbol update bodies at 1947714, 1949977, 1959479, 1952403 and 1962140 do not call target metadata setters. Origin lookups can still access other libraries/projects, so this is not a claim that all its reads are within the disposable target. |
| Offline synchronization | WORKER `syncCloud` at 2031829 loads history into memory and caches under `isSyncing`; it remains detached and recurring through `checkProject` at 2126981. `applySnap` at 2024968 returns immediately for `Fe`, the client non-online mode defined at 1654779. Empty upload caches exclude pre-existing replay, not every future upload producer. |
| Structure persistence | WORKER 2103200 checks ready/read-only/syncing state before scheduling structure work. Initial parse or sync is not interchangeable with a fresh local change. The existing 300 ms debounce still matters after any real metadata change; sampled empty task sets are not a drain operation. |
| SCH project construction | SCH 6148653 constructs `Tj`. Its constructor at 5918477 starts detached instance-attribute and version reads. `loadAll` at 5880985 assigns fetched attributes to memory. The abnormal detector near 5889200 only inspects an active schematic document, excluded by the project-only tab contract. Zero active sheets excludes the previously traced linked-sheet initializer. |

These source findings avoid waiting for harmless UI/cache work merely because
it is asynchronous. They do not prove every downstream notification subscriber
or backend request write-free. Preserve the distinction between a target-file
write, a shared cache/profile effect, a read of another library and a UI update.
No shared preferences need to be toggled to use the exclusions above.

There is also a concrete database-lifetime gap. APP `Sy` at 1319660 uses its
own initialization connection for `journal_mode=delete`, resolves without
awaiting that callback, then calls `a.close()` in `finally`. APP `xt` at
1319235 creates another connection after waiting for `Y5`; `y` at 1318983
caches handles only in the current request. The router at 2620057 creates a
fresh `n.db={}` per request. A later project GET is therefore not a same-queue
barrier for the initialization PRAGMA. If a future profile relies on this
being a harmless same-mode operation, qualify that exact premise separately;
do not report the callback as observed complete.

### Backend actor and clock have different producers

APP `wC` at 2620025 creates `rC` once. `rC` at 2573782 awaits `Wa` once and
retains the license result in its middleware closure. `eC` at 2574653 selects
the system user by that retained license username for each request. If the row
is missing, it can insert one before reselecting it. APP `T0.login` at 2220292
returns UUID, username and nickname from that system table.

For persisted EDIT_HEAD, APP `L3` at 2602467 uses the request user's UUID but
looks up username and nickname in the target project's users table. A missing
target row produces empty names. Neither UI user object is this exact producer.
An actual operation-bound response from the local user endpoint could establish
the request user's projection, followed by correlation with the retained target
users table. That is a candidate for a small fixed actor observer, not an
implemented passive read. The route at APP 2478354 also reads preferences and
distinct-ID data, and its middleware can insert a system user. Any future use
must classify those effects, select only bounded needed fields for retention,
bind the actual local route and process generation, and keep the no-intervening
account-change premise explicit. No such request was made in this research.

WS 851427 through 851621 exposes `/pro-mgr/serverTime/now` as `Date.now()+Jd`
in the notify module. It is not an APP request-clock endpoint. APP EDIT_HEAD
at 2602792 uses its own `Date.now`; project timestamps at 2601230 use APP local
calendar formatting; SQL history defaults use SQLite UTC whole seconds. No
fixed passive APP clock endpoint was identified in the reviewed routes.

The practical next clock work is to reuse original supervisor-issued launch,
capture and termination clock observations, separately bracket the document
clock, and validate each stored timestamp according to its actual producer.
The existing native clock transport and endpoint/closed-clock comparators are
reusable components, not proof by themselves. A helper observation does not
expose APP's `Date` receiver or continuously lock the OS clock. Keep the common
OS clock, timezone and no-intervening-change assumptions explicit; refuse a
mismatch rather than silently widening the timestamp interval. Do not create
an arbitrary APP evaluator or reuse the notify clock as the backend clock.

### Smallest useful implementation outcome

The next bounded result can be one owned project-only opening, with fresh
source/cache continuity and an operation-local observation of the native
startup prefix. Require the original empty restoration state, no command and
no editor tabs throughout. Retain actual returns and stage observations on
failure; never repeat navigation. This is useful progress without claiming
global idle, backend actor/clock verification, or writer readiness.

To enable the writer, combine the specific no-write exclusions with fresh
consistent SQL/native evidence and the retained original generation. Resolve
the remaining producer-specific gaps rather than starting another generic
idle detector or repeated opening/closing cycle. A point-in-time snapshot can
show equality, but cannot observe a hidden callback's completion. This report
adds no code, live validation, account/design access, publication or install.
