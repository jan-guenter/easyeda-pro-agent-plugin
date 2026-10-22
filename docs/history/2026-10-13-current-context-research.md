# Current-version identity-only context reader

The next useful reader can report registered active-document identity and the
UI's current project and branch fields without calling a project manager. Build
it as a separate native metadata observer beside `editor-shell.ts`. Do not
reactivate the old context tool or describe this as complete SDK coverage.

This note used the research and extension-development skills. Installed vendor
files were read as inert text. No installed module was imported or evaluated,
no live call ran, and no project, private profile or journal data was read.

## Exact sources

Installed `resources/app/package.json` identifies EasyEDA Pro
`3.2.206.715d940d`. The existing capability-specific runtime pins the separately
reported editor version `3.2.206`. These values are not interchangeable.

| Source under installed `resources/app/assets` | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-api/0.3.50.ab46409c/api.js` | 1964920 | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| `pro-api/0.3.50.ab46409c/api-types.d.ts` | 1733380 | `d5fe990034c55001302ea6c3f704c2d4b88cdf23253cc5293b3bad62a32b9def` |
| `pro-ui/3.2.196.26ed3d6c/js/ui.js` | 17456671 | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |

The API directory's `api.d.ts` is only 11 bytes. The substantive declarations
are `api-types.d.ts`, not a same-number npm package. Its lines 338-364 define
the document enum, 2637-2648 the document result, and 2057-2065 the two project
getters. Offsets below are zero-based UTF-16 offsets in the pinned JS strings.
These hashes were recomputed for this review.

## Public contracts and why the narrow reader should not call them

`dmt_SelectControl.getCurrentDocumentInfo()` returns a promise of an
`IDMT_EditorDocumentItem` or `undefined`. Its contract concerns the last-focused
open document, and `undefined` means retrieval failed, not an empty editor.
It is a beta API. The item contains `documentType`, `uuid`, `tabId` and optional
`parentProjectUuid` and `parentLibraryUuid`.
[Official method](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_selectcontrol.getcurrentdocumentinfo.html),
[official result type](https://prodocs.easyeda.com/en/api/reference/pro-api.idmt_editordocumentitem.html).

The installed API wrapper at `1320779` sends one fixed RPC. The UI handler at
`17230482` reads `me.getActiveTabData()`, then dereferences `e.data` and `e.tabId`
without checking `e`. Native `getActiveTabData` at `16398272` returns `null` when
no registered tab matches. The public call can therefore throw in that case;
do not catch that failure and return a fabricated empty document.

The handler derives `uuid` from `tabId.split("@")[0]`. It copies `data.pid` for
types 1, 3, 12, 15, 26 and 27, and `data.owner` for types 2, 4, 17, 18, 19, 20,
21, 22 and 29. It returns only the base fields for all other types. In
particular, the declared off-page connector type 25 is not in that installed
library-owner set. Do not fill omissions by guessing another enum's behavior.
The public enum is broader than the proposed first subset.
[Official enum](https://prodocs.easyeda.com/en/api/reference/pro-api.edmt_editordocumenttype.html).

`dmt_Project.getCurrentProjectInfo()` is already an existing public-read and
context route in this repository. Installed declarations promise detailed
project data or `undefined` on failure. Its API wrapper at `1316838` uses RPC;
the UI implementation at `17232077` then calls `getCurrentProjectInfo` and
`PROJECT.GET` on the manager bus. It scans folder trees and a client project
store, returns document inventory, names and description, and on the client may
put a local directory path into `teamUuid`. Those reads are unnecessary for an
identity-only result. This review does not establish the full manager call's
effect closure. The
[official project method page](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_project.getcurrentprojectinfo.html)
was reached, but subsequent page fetches timed out; the pinned declaration and
implementation are the basis for the exact contract and behavior here.

`getProjectInfo(projectUuid)` is a different, still omitted lookup. UI offset
`17235928` calls `AH({uuid:e,path:e})` before returning brief metadata. It is not
a shortcut to a local current-project identity and should stay outside this
slice. `getSplitScreenTree` at `17220881` deep-clones the tree and full tab
objects, which is also more data than this observer needs. Its declared result
is a split-screen tree, not readiness or a closed-project certificate.

## Fixed read closure

The existing editor-shell observer already checks bounded container/tree/tab
membership and retains each owner across two samples. Reuse that same fixed
closure rather than introduce a second registry traversal with weaker rules.
The source locations supporting it are also recorded in
[editor-shell research](2026-10-13-editor-shell-research.md).

| Fixed path or operation | Installed behavior and source |
| --- | --- |
| `globalThis.UI.gVars === globalThis.gVars` | UI exports the same `w` object at `17169409`; `self.gVars=w` is assigned at `16956653`. |
| `UI.tabBar.getActiveTab()` | Static getter at `16426363` returns `tt.currentTabId || ""` only. Recheck the actual own data field rather than accepting coercion. |
| `UI.tabBar.getContainerInfo(id)` | Static getter at `16399060` returns the registered container reference. The existing bounded scan supplies `id`; callers never do. |
| Active tab own `tabId` and own `data.doctype` | The public current-document mapper reads these fields at `17230482`. `createTab` at `16440164` first inserts the tab, awaits `getModelSheetUuid`, then attaches its data. A partially initialized active tab must refuse, not become empty. |
| Active project-backed tab own `data.pid` | The ordinary tab builder at `15268145` supplies `pid:o.project_uuid||o.projectId` to `createTab`. It is metadata, not proof that a document manager is ready. |
| Own `gVars.currentProject.projectId` and `branchUuid` | Plain object construction at `8100442`, project-open assignment at `15074647`, and close/failure assignments at `15075102` and `15076067`. Read only these descriptors, not `settings`, titles, owners or paths. |

No new getter is required. Do not call `getActiveTabData`, whose internal scan
has no caller-enforced bound. The existing complete bounded scan already finds
the unique active tab. Do not call `getTabInfo`: at `16430593` it awaits an
iframe lookup, reads DOM and jQuery data, and includes titles and file paths.
`getTabIFrame` at `16437804` also contains a schematic manager RPC.

The generated program should read own data descriptors, refuse accessors on
inspected fields, and retain the frame, UI, `gVars`, tab-manager methods,
registry arrays/tree/containers, active tab/data and current-project object.
Read the same bounded projection twice with one microtask yield. Reject changed
objects, changed values, inconsistent registry membership and oversized output.
No RPC, manager initialization, DOM query, file access, callback subscription,
navigation, Save or preference setter belongs in the editor program.

## Missing values and identity limits

Native project state has several real forms. Initialization uses an own
`projectId:undefined` and `branchUuid:""` at `8100442`. Successful opening at
`15074428` takes the branch from `e.currentBranch`. Failed or completed closing
can replace the whole object with `{}`. A separate open handler at `16670750`
assigns project ID and settings without a branch field. Conversion at `16698260`
can later assign `branchUuid`. Therefore an absent branch is not evidence that
no project exists, and a present branch is not proof of persisted branch state.

Preserve these distinctions in the result. A small tagged scalar avoids JSON's
loss of `undefined`:

```ts
type ObservedIdentity =
  | { state: "absent" }
  | { state: "undefined" }
  | { state: "empty" }
  | { state: "value"; value: string };
```

`empty` is admitted only where the reviewed source uses an empty sentinel, such
as `branchUuid`. Do not accept a native `null`, number or unexpected empty
project ID by coercing it. An empty/absent project field means that the UI has
no identity there, not that every project or worker is closed. Keep active-tab
classification separate from project fields; Start Page can coexist with a
current project.

The tab separator is `@`, defined at `15974248`. `co(t,e)` at `15978280` appends
its second argument, and `createTab` can supply `a.path` as that argument.
`getUuidAndPathByTab` explicitly names the two pieces `uuid` and `path` at
`16433433`. Thus an arbitrary raw `tabId` is not privacy-safe merely because the
public API calls it an ID. Do not return path-bearing library tab IDs or raw
unsupported values in errors.

For the first implementation, recommend ordinary project-backed schematic and
PCB tabs, document types 1 and 3, plus the known no-active-tab, Start Page and
placeholder states. Admit lowercase 16- or 32-hex document IDs, 32-hex project
IDs and the exact tab form `documentUuid@projectUuid`; require the tab suffix,
own `data.pid` and observed current-project ID to agree. This is a deliberately
declared subset, not a claim that every EasyEDA document ID has that grammar.
Report an explicit unsupported state for temporary, instance, bare, path-bearing
or unknown tab formats without returning their strings. Branch IDs, when
present, must be 32 lowercase hexadecimal characters.

The ordinary opener `irr` at `15259891` derives its path from document
`project_uuid` or the current project, then calls `co(uuid,path)`. `J8o` at
`15267571` passes that tab ID unchanged and sets `data.pid` from the document's
`project_uuid` or `projectId`. The adapter checks the resulting equality instead
of assuming every `a.path` is a project ID. The existing maintained
`closed-symbol-journal.ts`, `closed-symbol-validation-request.ts` and
`saved-symbol-reader.ts` already distinguish 16/32-hex document IDs from 32-hex
project/branch IDs. That narrower document grammar remains valid for this
metadata projection; it does not assert a universal native ID generator.

Symbols and footprints can later reuse the registry projection, but their
public `parentLibraryUuid` is actually projected from `data.owner`. That may be
an account or library identity, not the current project. Do not return it in
this project/document/branch-only tool or assert project membership from the
public name. No access to library code or contents is needed for this decision.

## Ready-to-implement shape

Add `editor-context.ts` with `editorContextRequestSchema`,
`parseEditorContextRequest`, `queryEditorContext`,
`validateEditorContextArguments`, `buildEditorContextProgram` and
`validateEditorContextResult`. The tool is `easyeda_control_editor_context` and
its only request is `{"action":"observe-editor-context"}`. No path, document selector, method,
callback or caller code is needed.

Return a strict discriminated active state:

- `none`, with no active tab and no document fields;
- `start-page`, requiring the existing exact `tab_page1` sentinel shape;
- `placeholder`, requiring the existing exact `"0"` sentinel shape;
- `document`, containing only type 1 or 3, canonical document UUID, canonical
  project UUID and their reconstructed tab ID;
- `unsupported`, carrying a fixed reason but no raw identity or payload.

Return the two observed project/branch tagged fields alongside that state.
An unsupported active tab must not become `none`. Missing or malformed active
data still refuses with a fixed error. Preserve the existing 128-container,
256-tab, 255-node, depth-16 and
8192-byte bounds. Only selected identity metadata may leave the program. Other
tabs remain opaque bounded entries needed to prove unique active membership.

Share `editor-shell-runtime.ts`'s fixed bundle verifier and runtime coordinator,
exporting a distinct `EDITOR_CONTEXT_RUNTIME_PROFILE` and
`readEditorContext(engine, request, expectedFingerprint)`. Retain its global quarantine, serialized
authenticated dispatcher, actual runtime fingerprint and fixed installed UI
hash checks before and after dispatch. Use the same exact API/UI hashes above.
Do not substitute this result into legacy `ExpectedContext`, and do not edit
the external compatibility manifest to admit all old APIs.

Required result claims remain `cadAuthority:false`, `persistenceVerified:false`,
`projectClosureVerified:false`, `restorationCompletionVerified:false` and
`startupQualified:false`. This is registered UI identity, not actual keyboard
focus, visibility, loaded native document ownership, editability or an atomic
guard for a later operation. The UI project/branch fields are not an independent
manager/database witness.

## Coverage and remaining work

`extension-api-coverage-routes.ts` already maps the three legacy context methods,
and `public-sdk-read.ts` already has current-project/current-document readers.
They are blocked on this new application tuple, not missing implementations.
The proposed tool is a narrower native equivalent and must be recorded that
way. It does not complete the public detailed-project or arbitrary-project
lookup contracts, and it should not raise the direct-public-method count.

The adapter is implemented in `editor-context.ts`, with the original shell
observer and new context observer using the fixed shared compiler in
`editor-observation-program.ts`. The coordinator stays in
`editor-shell-runtime.ts` with separate shell/context profiles. Six focused
context tests and the four unchanged shell tests pass under Node 24.18.0.
Targeted strict type-aware lint reports no warnings. These cover sentinels,
ordinary 16/32-hex document identities, missing branch metadata, private
payload exclusion, unsupported IDs, owner drift and malformed state. No new
test framework was added. Connected acceptance still needs a fresh admitted installed host and
a disposable ordinary project; source inspection does not supply that evidence.
There is no reason to postpone implementation for a complete manager decoder,
but the current global admission refusal must remain effective until resolved
through its own supported path.
