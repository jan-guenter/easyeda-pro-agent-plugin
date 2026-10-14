# Current-version disposable PCB opening

Source review supports a separate ordinary-navigation adapter for one explicitly
selected local disposable project and one existing PCB. It does not admit the
legacy writer lifecycle, guarantee unchanged storage, or authorize production
access. This note consolidates the prior worker/backend review and the official
method contracts. No installed code was evaluated, no live call was made, and no
private profile or project contents were read for this research.

## Public contract and installed sources

`eda.dmt_Project.openProject(projectUuid: string): Promise<boolean>` opens the
project in the front end. The official documentation warns that switching from
another project can discard its unsaved changes. An empty initial editor is
therefore an admission condition, not a convenience.
[Official openProject reference](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_project.openproject.html)

`eda.dmt_EditorControl.openDocument(documentUuid: string, splitScreenId?: string)`
returns a promise of a tab ID or `undefined` on failure. The documented inputs
include schematic containers/pages, PCBs and panels. This first adapter should
admit only an existing type-3 PCB, without a split-screen argument.
[Official openDocument reference](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_editorcontrol.opendocument.html)
The class contract scopes document control to the currently open project, not
to an independently supplied project argument.
[Official editor-control reference](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_editorcontrol.html)

The reviewed application is package `3.2.206.715d940d`, editor `3.2.206`.
All paths below are relative to
`/mnt/c/Program Files/easyeda-pro/resources/app/`. Hashes were rechecked on
2026-10-14. Offsets in this note are zero-based UTF-16 string offsets, not bytes.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `assets/pro-api/0.3.50.ab46409c/api.js` | 1964920 | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| `assets/pro-api/0.3.50.ab46409c/api-types.d.ts` | 1733380 | `d5fe990034c55001302ea6c3f704c2d4b88cdf23253cc5293b3bad62a32b9def` |
| `assets/pro-ui/3.2.196.26ed3d6c/js/ui.js` | 17456671 | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |
| `assets/pro-mgr/3.2.184.355087e9/js/pro-mgr.js` | 2196400 | `005584e02cd9b2d49fdb387b2f997c1c8d3f88b0c48a7531c8097c483ed0bd2e` |
| `assets/pro-mgr/3.2.184.355087e9/js/project-worker.js` | 2181284 | `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` |
| `assets/pro-pcb/3.2.193.682ed44e/js/pcb.js` | 10976299 | `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33` |
| `app.js` | 2657192 | `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c` |

The declaration signatures are at lines 1890 and 516 respectively; the
current-project limitation also appears at line 496. Online documentation is
contract evidence; the pinned implementations below determine this profile's
actual effects and limits.

## Project route and local target binding

| Bundle / offset | Call or dependency |
| --- | --- |
| API 1315841 | `openProject` calls fixed `extensionApi.DMT_Project.openProject`. |
| UI 17230843 / 15077172 | `SK.openProject` returns `(await Fs({uuid})).success`; `Fs` obtains/creates `ZDe` and awaits its open flow. |
| UI 15069867 / near 15072100 | `ZDe` captures the prior project as `lastId`; opening can call `closeLast`, publish state, and lock the target. |
| UI 6014581 | The manager opcode is `/pro-mgr/project/open`, not `/pro-mgr/open`. |
| pro-mgr 2084237 / 1788083 / 1782503 | Registered handler → `cO` → existing manager or `new tl().open`; starts the fixed project worker and sends `/mgr/projectWorker/openProject`. |
| worker 2159469 / 2108598 | Registered worker handler calls `open`, retaining UUID/path/options and obtaining project details. |
| worker 2021135 / 1765787 / 1442170 | `requestInNet` → project `get` → GET `/api/v4/projects/{uuid}`, explicitly carrying the same UUID as the `path` header. |
| app 2620912 / 2616603 / 2375643 | Local v4 projects route → `g0.detail` → project service `show`; returned UUID is set to the request's project identity. |
| app 1329828 / 2317612 | `$` resolves the header/query key against the existing project registry first, then other registries; `G.show` opens the selected database and reads project metadata. |
| UI near 15074408 | Success installs the returned branch and selected UUID in `gVars.currentProject`, and initializes project settings. |

Local project identity is **64 lowercase hex**, not the legacy UUID32 schema.
`app.js` `ke` at 1284102 hashes the UTF-8 bytes of its input string with SHA-256.
`K0` at 1326872 returns its input path unchanged. `client.openProject` at
2332540 strips a leading `file://`, then records the project under
`ke(K0(path).path)`. UI `ZI` at 6352687 takes that returned key, and
`ZDe.connect` at 15071855 retains it. Public UUID-only opening does not invoke
that path-registration endpoint because it supplies no `cPath`.

Consequently, admit only a selected, already registered `.eprj2` file in the
first implementation. Hash the **exact raw Windows registry path**, not a
normalized Linux path or case-folded Windows path. Separately bind that string
to the selected file's canonical host path, regular-file identity, checkpoint
digest and existing PCB membership. The hash is not proof of file ownership or
content. Reject an absent or conflicting registration; do not scan directories
or register arbitrary new paths to make the check pass.

### Fixed registration query

The narrow existing route is
`gVars.messageBus.rpcCall('/pro-mgr/api/client/getProjectPaths', {})`.
UI opcode 5993877 and an ordinary no-refresh use at 10420585 establish the
route. pro-mgr registration 2099812 calls `client.getProjectPaths` at 1800026,
which issues GET `/api/client/projectPaths` with no `refresh` or `cbb` parameter.
The backend GET registration is at 2346575 and controller at 2327644.
The result is the normal `{success, result}` API response inside the RPC
envelope; `result` is a UUID-keyed registry. Project-list helpers are unsuitable:
pro-mgr 1843453 / worker 1762424 explicitly set `refresh: 'yes'`.

With literal empty arguments, the controller does not scan directories or
open project databases. It does add `dir`/`fileName` fields to existing registry
entries and log the request. The shared request middleware (`rC`/`eC`, app
2573788/2574659, mounted at 2620080) can open/migrate the shared user database
and create a missing local license user. This is a registry read with incidental
ordinary application bookkeeping, **not** a zero-write operation.

Keep the topic and empty arguments fixed. Bound the returned registry and
copy only the selected entry's raw path and relevant project/CBB flags; do not
return unrelated paths, owners, titles or project contents. Recheck receiver,
selected registration and editor state across its await. No-refresh registry
absence is a supported refusal, not permission to broaden discovery.

## Document route and ordinary-opening effects

API 424200 delegates to `extensionApi.DMT_EditorControl.openDocument`.
UI `R2.openDocument` at 17218992 reads the current project, awaits `eWt` at
15262125 to resolve the document type, then for type 3 awaits `Zd` at 15250454.
`Zd` activates an existing tab or obtains the PCB and builds its frame through
`gy` at 15241150. `Zp` at 15239492 constructs `documentUuid@projectUuid`.
The wrapper may resolve immediately after frame creation; its returned tab ID
does not prove native initialization, rendering or completed restoration.
`eWt` also has a library fallback when project lookup fails, which is another
reason to prove the selected document is an existing PCB before dispatch.

These are reachable source effects, not reported observations of a live call:

- Backend database opening (`y`, app 1318983; initialization/migrations near
  13197xx/13208xx) uses writable SQLite and can change the selected file.
  A boolean response cannot establish unchanged storage.
- pro-mgr `Ip` at 1779388 adds opened-project metadata to IndexedDB.
  The worker opens project/local-project caches (2020061, 1708800), loads
  history, can replay pending uploads (2021733), and deletes selected-branch
  local-save cache entries older than seven days (2022597).
- Missing branch/history can invoke conversion (`convert` 2120227,
  `convertNormal` 2121554 → `flowUpload`). Opening starts background
  synchronization (2031829) and checking (2126981), which can outlive the
  public promise. Internal names containing “Cloud” do not prove a public
  upload: desktop requests can route to the local backend. Conversely, do not
  claim opening has no network effects.
- PCB `Zd` invokes partition cleanup `hlt` at 15238915, including
  `removeFileUuids`, and title synchronization `dye` at 14734537. A truthy
  `updatePartitionItemTitle` response can lead to the `save` RPC. `glt` at
  15252415 can register exam-related autosave. The public API does not expose
  the private `unUpdatePartition` option; do not call a private function to
  suppress ordinary behavior.
- `J5e` at 15260328 checks other windows, potentially focusing an existing
  matching document; its browser branch can prompt save/close. Project
  opening can restore other tabs from the selected project. Settings, recent
  state, caches, logs and normal background bookkeeping are within the
  disclosed ordinary-open effects, not guaranteed unchanged collateral.

The review does not establish an exhaustive migration or background-task
effect list. Desktop `updateTeam` at worker 1967047 returns early, and
`applySnap` at 2024968 returns in offline/half-offline mode; do not turn these
specific reachable branches into unsupported claims of mandatory uploads.

## Native preflight and post-open observation

Use a separate fixed current-version observation projection, preserving the
existing shell and identity tools unchanged. `editor-observation-program.ts`
already demonstrates bounded complete traversal of `UI.tabBar.containerIds`,
`containerTree`, and `getContainerInfo`, with own-data checks and matching
owner/identity samples. The underlying getters are UI 16398279/16398470,
`getContainerInfo` at 16399060, and `getActiveTab` 16426370.

Before project dispatch, require all tree leaves and all container IDs to
correspond, no duplicated/unlisted tabs, only the genuine Start Page and
optional known hidden placeholder, and no current project or branch identity.
Reject unknown tabs, inherited/accessor data and nonempty hidden containers.
Checking only the active tab or the shell's `otherTabCount` is insufficient.
This establishes a sampled empty registered editor, not every window's state
or absence of delayed work. Keep the maintained owned-runtime/global gates.

After project opening, require `currentProject.projectId` to equal the target
64-hex key, a 32-hex branch, non-history/non-V2 mode, and a complete registry
whose ordinary project tabs all belong to that target. Restored peers within
the selected disposable project are permitted; unrelated project/library tabs
are not. Seal the observed branch before document dispatch and reprove it
after every await. The existing identity observer's 32-only project schema
is not suitable for this admission; do not weaken it implicitly.

For the final PCB, reuse the binding rules in `current-pcb-layers.ts`: explicit
document ID16/32, project64, sealed branch32, full `document@project` tab ID,
type 3, matching tab `pid`, no library parent, and one retained ordinary PCB
iframe. `MO` at UI 15246203 creates its ID, `c_dbid`, `c_doctype`, parent panel
UUID and `editor?entry=pcb` source; `gy` sets `pcb-canvas` at 15242986.
Retain/recheck the frame, child Window/Document/bus and prototypes, then call
only native `getTabIdAndDocType` (PCB 10807394). It returns the initialized
tab/type through plain getters; a premature call can allocate in-memory
environment defaults but must refuse blank/type-0 identity. Two matching
samples prove observed identity, not full loading/restoration or persistence.

Public opening routes through mutable global state. Receiver retention and
before/after checks detect drift but cannot atomically exclude an intervening
A→B→A user switch. Do not claim receiver-bound execution for these public
methods, unlike the retained-frame layer reader. A drift or ambiguous result
must stop subsequent dispatch and preserve the consumed attempt.

## Minimal implementation contract

Use one strict `open` request with `operationId`, `projectUuid`64,
`documentUuid`16/32, `rawWindowsPath`, `expectedSourceSha256`,
`confirmDisposableProject: true`, and `acceptNormalOpenEffects: true`.
An `observe` action accepts only the retained operation ID and never repeats
navigation. Obtain the selected path from an explicitly named disposable file
or an already retained disposable fixture receipt, not a production inventory.

The source digest binds the caller-selected original file, not the potentially
different SQLite snapshot bytes. The checkpoint helper derives the selected
default branch and PCB membership, sealing the branch before any dispatch.
The host binds the selected file/checkpoint and PCB membership. Its coordinator
persists durable intent and separate project/document dispatch reservations.
The generated programs contain only fixed registry/preflight observation,
one public project call, one public document call, and bounded observation.
The coordinator observes the project before allowing the document stage;
timeouts, undefined replies or failed postchecks never authorize replay.
Return invocation, public return value and observed target/frame separately.
Do not issue an explicit Save, discard, close, restore or writer call.

Keep authenticated current-profile admission, exact implementation pins,
serialization, global quarantine and orphan tracking. Reuse journal primitives
and `dispatchWithOrphanTracking`, not the legacy `ProjectOpenExecutor`'s
unchanged-database promise or old native compatibility admission. Public-open
deadlines must preserve the maintained `NATIVE_LIFECYCLE_OPEN_TIMEOUT` signal
so that an unfinished vendor call cannot be falsely marked settled.
The selected narrow recovery is `retire-after-termination`, with explicit
`confirmRetire` and `acceptUnknownFileEffects`: it requires termination of the
original retained root and Job plus closure of its authenticated session.
It invalidates the plan without replay, replacement, restoration or a claim
that file effects are known. A lost facade owner cannot be replaced by PID
adoption or a historical receipt. Full lifecycle recovery is separate work.

The focused live acceptance is one explicitly selected disposable PCB opened
once, with recorded stage outcomes and exact final identity/layer observation.
It does not need a writer/save/reopen matrix. No live opener validation or
implementation enablement is claimed by this note.
