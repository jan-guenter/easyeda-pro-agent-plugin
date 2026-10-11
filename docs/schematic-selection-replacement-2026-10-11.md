# Deprecated schematic selection getter

The fixed reader for `eda.sch_SelectControl.getSelectedPrimitives_PrimitiveId`
uses an explicit equivalent: the documented public replacement
`eda.sch_SelectControl.getAllSelectedPrimitives_PrimitiveId`. It never calls the
deprecated wrapper. This is a narrowed task equivalent, not evidence that the
deprecated public method works.

## Pinned source evidence

Offsets below are UTF-16 positions in the installed minified source.

- `assets/pro-api/0.2.53.aee2f57a/api.js`, SHA256
  `5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc`:
  modern wrapper at1614681 returns the modern selection RPC result directly;
  legacy wrapper at1620184 maps a truthy response to `item.id`, but returns `[]`
  for a falsy response.
- `api-types.d.ts:17994–18000` marks the legacy getter deprecated and explicitly
  names `getAllSelectedPrimitives_PrimitiveId` as its replacement. Both return
  `Promise<Array<string>>`.
- `assets/pro-ui/3.2.149.43637efe/js/ui.js`, SHA256
  `12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a`:
  `LR` at17040899 sends the legacy getter through `An("getSelected")`.
  `An` at15819414 locates an old iframe and either invokes a `callCommand` hook
  or an iframe global. An absent/unready iframe returns undefined. A missing
  command is caught, logged, and also returns undefined. The public wrapper then
  turns that failure into an empty selection.
- The modern UI route uses
  `extensionApi/SCH_SelectControlUtil/getAllSelectedPrimitives_PrimitiveId`.
  `assets/pro-sch/3.2.149.35ae2987/js/sch.js`, SHA256
  `3f50136fb4ba2d5593beac7ef3e20ebe5275177b56bbcfdd297e79f176a6618f`,
  implements it at6074441. It reads the active ordinary schematic's project
  selection manager at the active UI tab. It promotes selected `NetGroupLine`
  children to their parent group and deduplicates with a Set. `Sr` at1992446 is
  the `tagName === "NetGroupLine"` predicate; `Le` at6376135 reads the active tab.

A disposable-session observation showed one selected component in the native
property panel while the legacy public getter twice returned an empty list.
The exact swallowed branch in that live call is unknown. Regression fixtures
replay the pinned wrapper, obsolete UI shim, modern wrapper and modern native
handler. A ready frame without the old command reproduces the false empty;
the new route never accesses that deprecated wrapper.

The already-installed modern public reader subsequently returned the selected
component ID in two stable samples, agreeing with the native property panel.
That validates this specific public replacement observation, not connected
execution of the newly added deprecated-name adapter.

## Supported contract and limits

Only document type1, the exact active ordinary schematic page, is admitted.
Symbols and block-instance pages refuse. Before and after the awaited public
replacement, the adapter verifies page, project, tab, manager, method receiver,
shape owner, initialized consistency and idle action-runner identity. Existing
outer context and pinned runtime checks remain in force, with two equal samples.

The result is a dense ordered array of at most20000 unique IDs, each1–256 UTF-16
units without control characters. Missing, duplicate, sparse, malformed,
accessor-backed and over-bound results refuse. No sorting, coercion or empty
fallback is applied. An actual empty replacement result is a selection
observation, not proof of an empty document.

The replacement's group-parent normalization is preserved. Results are not a
complete selected-model ownership proof, physical LINE inventory, source
snapshot, connectivity proof or persistence proof. Selection changes that
return to the same state between checks remain undetectable. No private bus,
selection writer, navigation, compiler, serialization or Save is introduced.

Offline replay and coordinator tests are not connected execution of the new
adapter. Coverage retains `not-recorded` current-generation live validation.

## Separate project-open failure

The reviewed direct project-open path does not use the obsolete selection shim:
API `openProject` at1315674 reaches UI `UQ.openProject` at17100028 and `Ps` at
14956555. Document opening at API470449 reaches UI `S2.openDocument` at17088184,
which uses document lookup and modern message-bus routes. No evidence connects
the legacy selection bug to the earlier unclassified project-open failure.
Fixed-boundary navigation diagnostics improve its next diagnosis; they do not
establish or repair the original native cause.
