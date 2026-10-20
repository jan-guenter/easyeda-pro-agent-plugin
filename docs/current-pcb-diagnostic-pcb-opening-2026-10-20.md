# Disposable PCB-frame opening — 2026-10-20

## Scope and evidence

This change gives the retained diagnostic owner a separate route from an
accepted project-only opening to the exact checkpoint-selected PCB frame.
It uses the documented document-opening service. It does not bypass project
startup, manufacture a worker relationship, open a caller-supplied document,
or authorize a writer.

The new leaf is
`plugins/easyeda-pro-control/server/src/current-pcb-diagnostic-pcb-opening.ts`.
Its fixed function is 13,044 UTF-8 bytes, SHA-256
`62d282abfdea1db218ba057d5af99ca7b7198390454efdded7a72ab57d5568bf`.
Its by-value result limit is 16,384 bytes. The original project opener now
also admits the source-derived normal window-title transition; that fixed
function is 15,508 bytes, SHA-256
`55d5bccdd6e4a661a2f1dfac4c496e103a1df87211ad08e06b1d68083210db87`.

The work below used local installed application assets as inert source and
synthetic VM tests. This research did not open an EasyEDA project, invoke a
live bridge, edit a design, or establish successful live opening.

## Primary sources

The public API accepts a document UUID and an optional split-screen ID and
returns a tab ID or `undefined`. That documented signature does not promise
that the resulting editor has finished loading.
[EasyEDA `DMT_EditorControl.openDocument`](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_editorcontrol.opendocument.html)

Inspected installed assets, identified independently of their filenames:

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-api/0.3.50.ab46409c/api.js` | 1,964,920 | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| `pro-ui/3.2.196.26ed3d6c/js/ui.js` | 17,456,671 | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |
| `pro-pcb/3.2.193.682ed44e/js/pcb.js` | 10,976,299 | `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33` |

Positions below are zero-based JavaScript string offsets, not byte offsets.

- API at 424200 maps the documented method to the fixed UI service
  `extensionApi.DMT_EditorControl.openDocument`, with `documentUuid` and
  `splitScreenId`.
- UI `R2.openDocument` at 17218992 resolves the current project's document
  type through `eWt`, then awaits `Zd` for PCB type 3. After that wait, its
  new-tab branch subscribes to a notification and resolves immediately.
  The normal `Zd`/`gy` path inserts the iframe and awaits its onload work and
  tab activation before this acknowledgment. Early-return error branches can
  still return the expected tab ID, so acknowledgment alone is insufficient.
- UI `Zd` at 15250454 checks other windows, obtains the PCB document, and
  creates the normal tab/frame through `gy`. Existing-tab activation has a
  different timed path; this diagnostic deliberately requires no existing
  drawing tab.
- UI `MO` at 15246203 creates the ordinary PCB iframe. Its relative source
  is `editor?entry=pcb`; its ID is `frame_` plus the document/project tab ID.
  It sets `c_dbid`, `c_doctype="3"`, `pcb-canvas="true"` and the `editframe`
  class. Its parent panel has `uuid` equal to the tab ID.
- Non-lazy `gy` at 15241107 awaits tab creation, inserts the iframe through
  `MO.create`, and resolves its deferred result only after `rpcInitFrameInfo`
  and awaited `setTabActive`. This supports the immediate tab/iframe check
  after acknowledgment; the separate observation still independently proves
  child ownership, source and identity.
- UI `Zd` also reaches partition-title synchronization and ordinary
  autosave setup. The title synchronizer `dye` at 14734537 can call `save`.
  An ordinary opening therefore requires acceptance of normal opening
  effects; it must not be advertised as a no-save or no-persistence action.

The browser-side relationship is established with the fixed frame-owner
lookup followed by a bounded node description, not a DOM selector supplied
by the caller. These protocol operations provide the iframe owner node for
an already retained frame ID and describe that exact node.
[CDP `DOM.getFrameOwner`](https://chromedevtools.github.io/devtools-protocol/tot/DOM/#method-getFrameOwner),
[CDP `DOM.describeNode`](https://chromedevtools.github.io/devtools-protocol/tot/DOM/#method-describeNode)

## Staged implementation

The public actions are `open-pcb` and `observe-pcb-opening`. They retain the
original operation and sealed target; neither introduces a path, document
UUID, script, context ID, selector, or remote-object handle from the caller.

1. The original project-only opening must already have returned its accepted
   prefix and passed target/frame postchecks. Its single-frame guard is not
   weakened. The PCB branch and worker-discovery branch are mutually exclusive.
2. `open-pcb` consumes its one-shot attempt, revalidates the original sealed
   target, and runs the fixed preflight in the original source-admitted UI
   context. It requires the exact project and branch, nonhistory/non-V2 mode,
   one unsplit container, only genuine Start/hidden-placeholder tabs, and no
   iframe.
3. The fixed `open-document` phase invokes the documented service once with
   the retained document UUID and no split-screen target. A successful reply
   requires the exact returned tab ID and only the selected ordinary PCB tab.
   It does not call into the child or claim child-source admission.
4. `observe-pcb-opening` is a separate consumed observation, not a replay of
   the opener. The owner binds the one new child to the original parent,
   loader/context and exact iframe attributes through fixed CDP DOM calls.
   The child URL must be `https://client/editor?entry=pcb`, with origin
   `https://client`. No frame-name inference is used.
5. The owner admits the complete pinned PCB source and original child context
   before the fixed UI observation invokes child RPC. The observation checks
   iframe/window/document/message-bus reciprocity and samples
   `getTabIdAndDocType` twice. Both must report the exact selected PCB.
6. Final parent/child/source/installation checks must pass before model
   observation becomes available. Source admission alone is not this
   completion condition.

Every failure after a possible dispatch retains the returned result, consumed
attempt and uncertainty. Timeouts stop the observation, not vendor work.
Cleanup remains available from failed phases. The existing 64-request hard
budget remains; this path excludes worker discovery.

The fixed call uses a retained `uniqueContextId`, `returnByValue`, `awaitPromise`
and `silent`. It does not claim the opener is side-effect-free. No caller can
change the fixed function or execution options.
[CDP `Runtime.callFunctionOn`](https://chromedevtools.github.io/devtools-protocol/tot/Runtime/#method-callFunctionOn)

## Source-derived title and URL transitions

The previous project transition required an unchanged `TargetInfo.title`.
That would reject this client's normal project opening.

The mode parser at UI 5432904 splits the global `PRO_EDITOR_MODE` into exact
tokens. The two admitted modes contain `CLIENT` and `EASYEDA`, but neither
`PRIVATE` nor `ONLINE`. The aliases at 6363625 therefore give `wi=true`,
`Ct=false`, `qe=true`, `eo=true`, `rr=false` and `Et=false`.

`U9o` at 15979227 derives `client.currentProjectName` from the registered
Windows path: after the final backslash, before the first `.eprj2` occurrence.
The `ON_OPENED` subscriber at 16737077 invokes it before `LJ`. In the admitted
client/non-private branch, `LJ` at 9757098 sets the localized product/version
title, then prefixes the project name and ` | `.

The project leaf retains the original product/version title and its fixed
`editorMainVersion` meta element. It requires the exact numeric version suffix,
no existing project-title prefix, and no existing client project name. It derives
the predicted opened title from the exact registered path. After the prefix,
both the client name and actual document title must match that prediction.
The decoder independently derives the predicted title from the original sealed
path. The host binds the initial title to the original CDP target and permits
only the predicted transition; other target fields remain exact.
The globals initializer at 8100714 sets `client.currentProjectName` to the empty
string, matching this fresh-Start-Page precondition.

This requires no delay. `Zcn.publish` at 1649137 invokes subscribers
synchronously through `v2t.execute`; `nde`/`D4e` do not defer the title handler's
start. The handler changes the title before its first suspension. The separate
`loadProjectCompleted` producer at 16669194 follows multiple awaited operations.
Thus its accepted prefix must already carry the predicted title.

In client mode, ordinary PCB tab-title update calls at 16431867 and 16666157
are skipped. Opening this one PCB therefore retains the accepted project title.
The URL helper at 16368903/16370630 focuses a new ordinary tab by extending
the project hash to exactly:

```text
#id=<projectUuid>,tab=*<documentUuid>@<projectUuid>
```

This is a single-tab transition, not permission to accept arbitrary hashes,
restored tabs, full navigation, or a different document.

## Verification and remaining limits

Thirteen focused tests cover the updated project opener and new PCB opener.
They pass under pinned Node 24.18.0. Targeted strict type-aware lint passes with
zero warnings. Tests cover preflight refusal, one dispatch, distinct observation,
mixed/restored tabs, split containers, path/branch/owner drift, child identity,
timeouts, private error redaction, title/version drift, malformed replies and
unsupported authority claims.

This does not prove live startup completion, persistence, all restoration work,
native-intrinsic integrity, queue completion, writable ownership, or the safety
of any CAD mutation. Those fields remain false. A successful frame observation
is a prerequisite for a separately bounded diagnostic sample, not permission
to save, create, update or delete PCB objects.
