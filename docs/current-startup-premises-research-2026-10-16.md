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
