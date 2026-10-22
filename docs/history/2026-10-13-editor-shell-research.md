# Current-version editor-shell observation

This source review supports the ordinary launcher's post-start observation. It
does not qualify prelaunch policy, complete startup or a CAD operation. Installed
JavaScript was inspected as inert text only. No project/profile data or live
editor state was read for this implementation.

## Exact reviewed closure

The application is EasyEDA Pro `3.2.206.715d940d`, reporting editor `3.2.206`.
The authenticated executor remains under the shared capability-specific runtime
profile. The reader separately hashes the installed UI before and after its
single fixed execute.

| Installed source | SHA-256 |
| --- | --- |
| `assets/pro-api/0.3.50.ab46409c/api.js` | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| `assets/pro-ui/3.2.196.26ed3d6c/js/ui.js` | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |

Offsets below are zero-based UTF-16 offsets in that UI file. They identify
installed source, not the separately published declaration version.

- `tt`, a class with static members, starts at `16394679`; `me=tt` at `16449869`.
  `O2.tabBar=me` at `17169635`, followed by `self.UI=O2`, exposes the exact owner.
- `getActiveTab` at `16426363` returns `tt.currentTabId || ""` only.
- `getContainerInfo` at `16399060` returns `vt.containerInfo[id]` only. It does
  not clone data, dispatch messages, open a project or initialize containers.
- `createTabBar` at `16396402` constructs a record containing `id`, `belong`,
  `tabs` and `activeTabId`. `addTabBar` at `15673253` stores that same record in
  `containerInfo`; `addTab` at `15675019` retains inserted tab objects. None of
  those construction/mutation methods is called by the reader.
- Start Page creation at `16395142` uses `tabId:"tab_page1"`, `data:{doctype:-1}`,
  `isAbleDelete:false`, `group:"start_blank"`, `draggable:true`, and boolean
  `isDisplayNone`. The last field reflects viewer mode, not window visibility.
- `createBlankTab` at `16424893` creates the project placeholder with id `"0"`,
  `data:{doctype:0}`, `isAbleDelete:false`, `group:"start_blank"`,
  `draggable:false`, and `isDisplayNone:true`. Its title is project-related and
  is neither read nor returned. The enum `BLANKTAB=0` is at `5431308`.
- Static registry initialization at `16445135` supplies `currentTabId`,
  `belongContainer`, `containerIds` and `containerTree`. The observer checks the
  complete bounded tree-to-container membership and each container's tab list.

Only those fixed getter/data paths are used. Identity-bearing Start Page and
placeholder fields must match their source shapes. Other tabs are counted by
opaque identity only, not decoded as designs. Cosmetic fields, titles, raw tab
data and arbitrary nested values are deliberately outside the projection. No
complete tab-payload validation or document-source claim is made.

The public `getSplitScreenTree` implementation at `17220881` deep-clones the
tree and full tab objects before returning. That is unnecessary for this count
projection. Its documented contract returns the split-screen property tree,
not startup readiness. [Official tree reference](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_editorcontrol.getsplitscreentree.html)

`getCurrentDocumentInfo` at `17230475` dereferences the result of
`getActiveTabData`, which can be null. A failure cannot prove an empty editor.
Its public contract concerns the document with the last input focus and permits
retrieval failure. It is not called here. [Official current-document reference](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_selectcontrol.getcurrentdocumentinfo.html)

Frontend unit observation is deferred. The public method is asynchronous; the
pinned UI reads a toolbar store initialized to `unit(mil)`. That does not prove
a document's actual unit on Start Page. [Official unit reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_unit.getfrontenddataunit.html)

## Request and result

The sole strict request is `{"action":"observe-editor-shell"}`. Exports are
`editorShellRequestSchema`, `editorShellQuerySchema`, `editorShellResultSchema`,
`queryEditorShell`, `validateEditorShellArguments`, `buildEditorShellProgram`,
`validateEditorShellResult`, and `readEditorShell` in the paired runtime module.
The runtime accepts the actual authenticated `expectedFingerprint`, with no
caller-selected file, code, method, checksum or permission override.

The result contains bounded `containerCount`, `tabCount`, `placeholderTabCount`,
`otherTabCount`, and booleans `startPagePresent`, `startPageActive`,
`activeTabPresent`. Internal tab/container IDs never leave the program. All of
`visibilityVerified`, `restorationCompletionVerified`, `projectClosureVerified`,
`startupQualified`, `cadAuthority`, and `persistenceVerified` remain false.

Both samples preserve the same frame, UI/class/method owners, registry arrays,
tree nodes, containers and tab objects, plus the same ordered identities and
counts. Limits are 128 containers, 256 tabs, 255 tree nodes, depth 16 and 8192
UTF-8 output bytes. State missing from any registry, duplicates, unsupported
sentinels, accessors on inspected fields, replacement owners, or changed samples
refuse with a fixed error. No truncation, retry or normalizing defaults.

The editor program performs synchronous metadata reads and one microtask yield.
It does not call RPC, project managers, public deep-clone readers, files, Save,
navigation, settings, event subscriptions or UI callbacks. The coordinator's
authenticated status and installed-bundle hashing remain separate host effects.

Two matching samples are a point-in-time observation, not a restoration barrier
or an atomic guard for a later command. Start Page can coexist with a loaded
project, hidden tabs or pending work. The launcher may report these observations
alongside process/authentication facts, but must not present them as permission
to edit or proof of clean startup. Existing broader context tools remain gated.

## Validation scope

Focused tests use synthetic class/record fixtures matching the source fields.
Runtime tests substitute only a synthetic UI digest inside the test process;
production has no hash override. Source tests do not establish connected
execution. A future fresh-host observation must record its own actual runtime
and result. This native diagnostic does not increase public SDK method coverage.

The four adapter and three coordinator cases passed under pinned Node 24.18.0.
Full TypeScript checking and targeted strict type-aware lint passed. These are
local source checks, not live observation or launcher validation.
