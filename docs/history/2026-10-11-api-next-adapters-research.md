# Next API adapters after 204104

Research date: 2026-10-11, Europe/Berlin. Starting package: `204104`.
This is source research, followed by a source-only configured-font reader
candidate. No current profile, design, editor session or installed package was
read or changed for this work. The candidate has no connected acceptance.

## Pinned sources

Each complete installed file was read and its SHA-256 independently recomputed.
Paths below are relative to the application's `resources/app/assets` directory.
Offsets are zero-based UTF-16 positions in the decoded file, not byte offsets.

| File | SHA-256 |
| --- | --- |
| `pro-api/0.2.53.aee2f57a/api.js` | `5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc` |
| `pro-api/0.2.53.aee2f57a/api-types.d.ts` | `32a0d2f8b4bc3d7b2b93b33499d9d768b0c23c77f45843a65166cf4e8ad6dab1` |
| `pro-ui/3.2.149.43637efe/js/ui.js` | `12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a` |
| `pro-sch/3.2.149.35ae2987/js/sch.js` | `3f50136fb4ba2d5593beac7ef3e20ebe5275177b56bbcfdd297e79f176a6618f` |
| `pro-pcb/3.2.149.5378b690/js/pcb.js` | `65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54` |

These identities agree with the retained compatibility profiles. The current
official pages are contract references, not evidence that newer behavior exists
in this installed build. No compatibility pin was changed.

## Configured font titles

`sys_FontManager.getFontsList` is a useful small addition. The official method
returns the configured font-name list. The namespace documentation describes
fonts the application allows callers to use, not an OS font inventory or glyph
rendering guarantee. The installed declaration agrees at line 19661.
[Official method](https://prodocs.easyeda.com/cn/api/reference/pro-api.sys_fontmanager.getfontslist.html),
[official namespace](https://prodocs.easyeda.com/cn/api/reference/pro-api.sys_fontmanager.html).
The English method-page fetch failed; the Chinese official page was available.

The API wrapper at `api.js@1488634` awaits the native rows, maps their `title`
fields and catches every exception as `[]`. The UI handler at
`ui.js@17039256` reads only this path and also substitutes `[]` for missing data:

```text
gVars.profileSetting.commSystemSetting.COMM_TYPEFACE.commonlyList.value
```

`self.gVars` and `UI.gVars` refer to the same host at `16821281` and `17033436`.
The default font rows at `9199520` and the add-font construction at `17039446`
use plain own data fields. Profile initialization at `15771416` and the `RU`
setter at `8438174` replace the profile/settings objects, so retaining only the
initial array would miss owner drift. Native tab readers at `16272991` and
`16301082` inspect the current registry and active tab ID without changing them.

The candidate in
[configured-font-read.ts](../../plugins/easyeda-pro-control/server/src/configured-font-read.ts)
does not call the lossy wrapper, mutate preferences or expose the full settings
object. It binds the main UI host, current project and active tab, then reads
only the existing configured list through own data descriptors. It preserves
order, duplicates, empty strings, whitespace and case. Missing paths, accessor
fields, sparse or extra-property arrays, invalid rows and drift refuse.
Limits are 512 rows, 1024 UTF-16 code units per title and 131072 combined units.
Two synchronous complete observations and a final reproof precede the existing
coordinator's second independently guarded dispatch.

This is an in-memory configured-title observation. It does not establish the
current account, persisted settings, installed OS fonts or rendering quality.
Snapshot checks do not provide atomic isolation against changes away and back.
No arbitrary profile path, font mutation or whole-preference export is exposed.

The new 25 focused tests pass. They include the exact old fallback bodies,
no-false-empty checks, accessors that must never execute, title/order/owner drift,
strict schemas, bounds, fixed private-error suppression and the maintained
coordinator's context/runtime/quarantine/disconnect checks. TypeScript and strict
type-aware lint pass. Source tests are not connected validation; publication,
installation and disposable read acceptance remain separate steps.

## Active schematic viewport controls

The next larger practical improvement is a dedicated viewport-action adapter.
Start with `dmt_EditorControl.zoomToAllPrimitives` on one exact active ordinary
schematic page. The official beta method accepts an optional tab and returns
the resulting visible bounds. Its schematic units are 0.01 inch and PCB units
are mil. The adapter must always pass the retained explicit tab.
[Official fit-all contract](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_editorcontrol.zoomtoallprimitives.html).

UI dispatch at `17091925` calls `SCHFitviewByTabId`. The schematic handler at
`6177435` resolves the document, calls its canvas `zoom.fitView()` and returns
the actual view-box bounds with Y-sign conversion. The delegated `fitView`,
`scrollRectIntoViewCenter` and zoom-set code around `2122376`, `2121229` and
`2120141` changes view-box/zoom state. The zoom notification at `2124065` sends
canvas information; UI receiver `16593645` updates the per-tab scale/unit stores.
Those traced bodies do not compile a schematic, Save, navigate to another
document or persist preferences.

This still needs a separate implementation and full effect review. View-box
change notification queues a microtask through `PW` near `2118500`, and renderer
work is deferred through the observer at `4580926`. The RPC return alone does
not establish completed rendering. Bind the exact document/canvas/zoom receiver,
refuse an active drawing or text-editing interaction, require finite bounded
geometry and a nonzero viewport, observe completion with a deadline, and prove
unchanged selection and complete design source. Test empty and nonempty scenes,
context replacement, delayed notifications, timeout and extreme bounding boxes.
Disposable acceptance should check visible framing and unchanged persisted
design state. Do not promise automatic viewport restoration without its own
implementation and proof. No viewport adapter was added by this research.

## Adjacent methods need different contracts

`dmt_EditorControl.zoomTo` should not be enabled as a generic public wrapper.
The [official contract](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_editorcontrol.zoomto.html)
says missing coordinates or scale retain their current values. The pinned
schematic handler at `sch.js@6178033` instead unconditionally calls centering
and scale setters. Its centering implementation at `2121090` performs arithmetic
with both arguments, so omitted coordinates are unsafe. At `ui.js@17093254`,
the returned schematic bottom is computed as `height - y`, unlike the fit-all
path's `-(y + height)`. The same public method's PCB branch returns native pixel
bounds without the mil conversion in `PcbBboxToBounding@17097043`. A native
equivalent needs explicit required arguments and independently projected bounds.

`pcb_Document.navigateToCoordinates` and `navigateToRegion` are also poor first
choices. Their native bodies at `pcb.js@10215739` and `10216198` change the view,
then schedule requestAnimationFrame and a 75-ms timer for three-second marker
effects. They return `true` before that work finishes. A maintained adapter needs
ownership and completion handling for those timers/markers. A boolean is not
proof that the requested view was reached or that the effects are finished.
[Official coordinate-navigation contract](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_document.navigatetocoordinates.html).

`zoomToSelectedPrimitives` adds complete selection membership and selected-object
bounding-box requirements. Its schematic route begins at `ui.js@17091351`,
continues at `sch.js@6177630`, and enumerates selected models through
`adaptSelectionView@2122996`. Implement and validate fit-all first. Neither path
justifies enabling schematic compilation, global Save, cloud actions or
unrestricted method invocation.
