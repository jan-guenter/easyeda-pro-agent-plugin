# Current-version PCB layer readers

Source review on 2026-10-14 supports a narrow, document-bound native equivalent
for `eda.pcb_Layer.getAllLayers` and
`eda.pcb_Layer.getTheNumberOfCopperLayers`. It does **not** admit the old PCB
reader/writer profile, execute either public wrapper, or validate a connected
PCB. No installed code was imported or evaluated; no project, private profile,
live bridge, settings or saved design was accessed for this research.

## Primary sources and installed identities

The official [getAllLayers reference](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_layer.getalllayers.html)
documents an argument-free promise of layer records and labels it beta.
The [layer-record reference](https://prodocs.easyeda.com/en/api/reference/pro-api.ipcb_layeritem.html)
lists nine scalar fields. The current
[PCB_Layer class index](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_layer.html)
does not list the copper-count getter; its direct reference URL was unavailable.
The installed declaration, rather than an invented web contract, supplies
`getTheNumberOfCopperLayers(): Promise<number>` at line 8150, marked alpha.
`getAllLayers` is declared at line 8336; types/status/record fields are at
lines 7889–7932. Declaration presence alone does not prove execution.

Installed application: package `3.2.206.715d940d`, reported editor `3.2.206`.
Paths below are relative to
`/mnt/c/Program Files/easyeda-pro/resources/app/`. Complete implementation
files were read as inert text and rehashed. Offsets below are zero-based UTF-16
string offsets, not byte offsets or line numbers.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `assets/pro-api/0.3.50.ab46409c/api.js` | 1964920 | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| `assets/pro-ui/3.2.196.26ed3d6c/js/ui.js` | 17456671 | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |
| `assets/pro-pcb/3.2.193.682ed44e/js/pcb.js` | 10976299 | `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33` |
| `app.js` (identity provenance only, not a reader dependency) | 2657192 | `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c` |

The corresponding installed `api-types.d.ts` is 1733380 bytes,
SHA-256 `d5fe990034c55001302ea6c3f704c2d4b88cdf23253cc5293b3bad62a32b9def`.

## Complete delegated read closure

| Bundle / offset | Relevant implementation |
| --- | --- |
| API 1377048 | `getAllLayers` awaits fixed `extensionApi.PCB_Layer.getAllLayers`, then maps nine scalar fields. |
| API 1376030 | Copper getter awaits fixed `extensionApi.PCB_Layer.getTheNumberOfCopperLayers`, without arguments. |
| UI 17440729 / 17440817 | Registers the two layer handlers in the extension API table; registration helper at 174447xx uses `extensionApiMessageBus2.rpcService`. |
| UI 17347974 | Layer handler checks PCB/footprint context using `vi`, then calls `Ot(Pt.Pcb.GetAllLayers)`; otherwise returns null. |
| UI 17345068 / 17343157 | Copper handler reads the same native layer list and counts native `SIGNAL`/`PLANE` entries whose status is not zero, then adds two. |
| UI 15781978 / 8959577 | `Ot` defaults its target to the active tab, checks topic/document compatibility, awaits its iframe, then uses `windowBridge.rpcCall` to that frame. |
| PCB 10319184 | Fixed topic `pcb/extensionAPI/pcblayer-getAllLayers` maps `ye.getAllLayer()` to twelve scalars. |
| PCB 7931205 | `getAllLayer` allocates an array by enumerating the existing `layerMap`; no model update, refresh or save. |
| PCB 7926100–7928640 | Layer getters read model/instance fields. Status is `config ? (visible ? 1 : 2) : 0`. |
| PCB 3174480 onward | Model color getter reads temporary display color or base color; status getters read existing bit fields. |
| PCB approximately 1453710 | Color `toString` formats channels; it does not normalize fractional hex into guaranteed CSS. |
| PCB 10807394 / 3223075 / 3223244 | Fixed `getTabIdAndDocType` returns the environment tab ID and type. A preview PCB reports type 23, not type 3. |
| PCB 1015912 / 1016974 | Ordinary iframe `MSG_BUS_PCB` owns an iframe-local `MessageBus(true)`, separate from the global bridge. |
| PCB 16045 / 16344 | Local RPC services and calls return a child-realm `{message, bridge, source}` envelope. Handler errors can be logged and become an undefined message. |

The layer reply has `layerId`, `type`, `name`, `order`, `activeColor`,
`activeColorAlpha`, `deactiveColor`, `deactiveColorAlpha`, `visible`, `locked`,
`active`, and `layerStatus`. The public API's exact projection is:

- `id = layerId`, with `name`, `locked`, and `layerStatus` unchanged.
- `color = activeColor`, `inactiveColor = deactiveColor`.
- Each transparency uses `(1 - alpha) * 100`, then `x3` at API 1378494:
  round the input times 100, divide by 100, `toFixed(2)`, then `parseFloat`.
  Do not clamp or substitute a different rounding convention.
- `yse` at API 1378091 maps TOP/BOTTOM/SIGNAL to SIGNAL; PLANE to PLANE;
  TOP/BOT SILK to SILKSCREEN; TOP/BOT SOLDER_MASK, PASTE_MASK and ASSEMBLY to
  their shared category; CUSTOM to CUSTOM; missing/other values to OTHER.

The copper count uses **native** categories, not public categories: the latter
collapse TOP/BOTTOM into SIGNAL. Hidden configured inner copper counts;
disabled inner copper does not. Adding two is the actual UI algorithm, not a
measurement or certification of the physical stackup. It is not restricted
to the setter's even-number union by the getter declaration.

These handlers allocate result arrays/objects and RPC tickets/subscriptions.
The reviewed layer closure does not call project services, serialize circuit
primitives, read files, request network data, select a layer, redraw, write a
model, or Save. Incidental vendor error logging is possible; outward errors
should stay fixed and omit vendor exceptions. Vendor enumeration itself is
not bounded by the facade's eventual result limit.

## Why capture a native receiver

The public wrappers have no document/receiver argument. Their API-bus hop
precedes UI `Ot`'s active-tab capture; binding `this` does not change that
global routing. Before/after active-tab checks alone cannot exclude an
intervening A→B→A switch. Use only the two fixed native topics on one retained
PCB-local bus, and disclose native-equivalent execution in the result.

Current UI sources establish an ordinary PCB frame as follows:

- `Zp` at 15239492 constructs `documentId + "@" + projectId`.
  Normal PCB opening near 15250454 supplies the current project as `path`;
  `gy` at 15241150 uses that identity for the tab and its `pid`.
- `MO` at 15246203 creates an iframe with `id="frame_" + tabId`, matching
  `c_dbid`, `c_doctype="3"`, and `src="editor?entry=pcb"`, under the direct
  tab panel with the same `uuid`. `gy` sets `pcb-canvas="true"` at 15242986.
  `rpcInitFrameInfo` passes that tab ID, type, and current project to the PCB.
- `getTabIframeSync` at 16438229 calls `getModelTabIdSync` at 16438039.
  For a proven ordinary type-3 PCB this performs no schematic callback;
  `Jn` at 15982500 is a DOM lookup. The implemented adapter does not call
  either helper: it requires one exact frame from `document.querySelectorAll`
  and retains/rechecks `getActiveTab`, `getTabById` and their owners.
- `updateTabInfo` at 16431269 can rename frame IDs, `c_dbid` and panel UUID
  after an awaited update. Frame attributes alone are not immutable proof.
  Recheck the active registry, DOM ancestry, frame/Window/Document/bus and
  native identity around every awaited read, then compare two layer samples.

The request should bind explicit document, project, branch and full tab ID,
not merely use the current identity observer as CAD admission. Native document
IDs may be 16 or 32 lowercase hex; project IDs may be 32 or 64. In particular,
`app.js` `ke` at 1284102 hashes local paths to SHA-256 hex, and local
`openProject` at 2332540 keys returned projects by that hash. UI `ZI` at
6352687 takes the returned project's first key as its UUID; `ZDe.connect` at
15071855 retains it and the open-success assignment near 15074408 retains
it as `currentProject.projectId`, with the returned `currentBranch`.
Thus a 32-only project schema excludes valid local projects; it is not a
general safety requirement. Branch should remain an explicit 32-hex identity
for this first project-owned reader. Do not read paths or infer file ownership
from the hash, and reject missing/empty branch rather than invent one.

## Implementable boundary and remaining proof

Use the existing serialized authenticated current-SDK admission and its fresh
before/after PCB/API bundle fingerprints, the fixed UI-file verifier, and a
separate native-layer-reader profile. Do
not change the old full-editor compatibility gates. Strict requests accept
only the two method names, empty arguments, and the expected identity tuple;
there is no caller-supplied topic, code, file path, frame index or selector.

Bound own-data copies before JSON serialization: at most 512 unique layer IDs
in 1–65535, names at most 1024 characters, raw color strings 1–128 characters,
finite alpha 0–1 / projected transparency 0–100, status 0/1/2 and boolean
locked. Preserve enumeration order and display colors, including malformed
native colors. Validate child-realm plain arrays/objects against retained
child prototypes; reject accessors, extra/missing fields, ambiguous frames,
undefined RPC messages, identity drift and unequal samples. Bounds are facade
admission rules, not newly inferred vendor limits.

The intended fixture is a fully loaded ordinary project-owned type-3 PCB, not a
footprint, preview, history, blank/temporary editor, partition, recovery or
detached frame. Exact tab identity and matching layer samples do not themselves
prove loading/restoration completion. The identity RPC uses the environment's lazy singleton getter
at 3216661. Normal `rpcInitFrameInfo` initialization captures that instance near
10847800, but handler registration does not prove prior initialization.
A premature identity read can allocate the environment: its constructor at
3215160 sets in-memory defaults, time/random metadata, a compiler-channel
holder (`mCe` at 3133961), and the grid unit-conversion callback. The grid
singleton at 3207349 likewise only allocates defaults. This is not a claim of
zero in-memory effects; the reviewed constructor path does not open a project,
load a compiler, write settings or dispatch CAD work. Its blank tab ID and
type 0 must refuse rather than being accepted as an initialized board.

No new current-version connected validation is claimed here. One authorized
disposable board can establish the retained-frame identity and two matching
layer/count observations after installation. Saving, reopening, changing a
layer, or building a writer test matrix is unnecessary to validate these
reads. Old 3.2.149 layer evidence is useful as a schema regression fixture,
not as admission or execution evidence for 3.2.206.

## Next disposable-navigation slice

The next useful capability is one-shot opening of an explicitly selected
existing disposable PCB from Start Page, without admitting the old writer
lifecycle. The fixed public routes are
[DMT_Project.openProject](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_project.openproject.html)
and [DMT_EditorControl.openDocument](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_editorcontrol.opendocument.html).
Their current implementation chains are:

- API 1315841 → `extensionApi.DMT_Project.openProject` → UI
  `SK.openProject` 17230843 → `Fs` 15077172 → `ZDe.open` near 15072100 →
  project-manager `h4.OPEN` (`/pro-mgr/project/open`, enum at 6014581).
  The remaining review must follow that worker route and correlate the selected local project UUID
  with its canonical file path before dispatch.
- API 424200 → `extensionApi.DMT_EditorControl.openDocument` → UI
  `R2.openDocument` 17218992 → `eWt` 15262125 → PCB `Zd` 15250454 → `gy`.
  This document call is scoped to the current project, not an explicit
  project argument; identity drift across its awaits cannot be repaired by
  blindly repeating it.

Ordinary opening is **not** a no-Save operation. After `gy`, `Zd` invokes
partition cleanup `hlt` at 15238915, title synchronization `dye` at 14734537
(which can call `updatePartitionItemTitle` and then `save`), and exam-specific
autosave setup `glt` at 15252415. Cross-window checking `J5e` at 15260328 can
also focus another window or prompt to save/close its matching document.
Project opening may restore other tabs within the selected disposable
project. These are reachable source paths, not observed effects of a live call.

The proposed coordinator needs an empty/unrelated-project-free initial
registry, immutable selected-file target/PCB membership evidence, explicit
acceptance of ordinary-opening effects, and durable intent before each
one-shot dispatch. Report invocation, returned identity and observed frame
readiness separately; do not promise unchanged storage or no automatic Save.
Observe after a timeout instead of retrying navigation. Reuse current scoped
authentication and frame inspection, not the old compatibility profile.
Completing the current project-manager/backend closure and a focused
disposable live opening remain implementation work; no opener is admitted
or executed by this research note.
