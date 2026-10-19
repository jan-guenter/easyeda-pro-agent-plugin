# Current project-only PCB metadata inventory

## Scope and result

The existing `easyeda_control_project_pcb` tool now accepts
`eda.dmt_Pcb.getAllPcbsInfo` with an explicit loaded local `projectUuid` and
`branchUuid`. It observes the complete bounded native PCB metadata map without
opening an editor. This is a native-task-equivalent adapter, not a call to the
public wrapper and not an `IDMT_PcbItem` compatibility claim.

The existing `getPcbInfo` request, selected `value` result, six native calls,
64 KiB envelope limit and selected-result schema remain unchanged. The latter
also supplies the DTO used by the separate rename preflight. Neither metadata
method grants rename authority.

Inventory returns `ownerUuid`, `pcbs`, `observedPcbCount` and
`completeNativePcbMapObserved: true`, alongside the existing observation flags.
Each PCB uses the existing selected DTO: UUID, project/owner, independent native
title/display title, parent, source, version, board, ticket, update time and
document type 3. UUID sorting supplies deterministic comparison order, not tree
or visual order. Empty maps are supported; failed or missing replies are not
converted to empty inventory.

## Primary sources reviewed

The official [getAllPcbsInfo method documentation](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_pcb.getallpcbsinfo.html)
declares a parameterless promise returning all PCB items in the project. The
documentation's example creates and deletes a PCB; it was not executed. The
adapter needs explicit project/branch identity because it does not inherit the
public wrapper's mutable current-tree context.

The following installed files were read as data and rehashed on 2026-10-19.
Offsets below are zero-based JavaScript string offsets, not byte offsets.
Paths are relative to the installed `resources/app/assets` directory.

| Source | SHA-256 | Relevant location |
| --- | --- | --- |
| `pro-api/0.3.50.ab46409c/api.js` | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` | Wrapper near 476238; `getAllPcbsInfo` dispatch string at 476398 |
| `pro-ui/3.2.196.26ed3d6c/js/ui.js` | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` | Public implementation at 17183353; PCB KV route constant near 6004618 |
| `pro-mgr/3.2.184.355087e9/js/pro-mgr.js` | `005584e02cd9b2d49fdb387b2f997c1c8d3f88b0c48a7531c8097c483ed0bd2e` | PCB handler group near 2063260; `GET_ALL_KV` at 2064064 |
| `pro-mgr/3.2.184.355087e9/js/project-worker.js` | `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` | `Sg.get` near 1901353; `getData` near 1902855; `getAllKVData` at 1903452 |

The installed declarations at
`pro-api/0.3.50.ab46409c/api-types.d.ts`, offset 53236, have the same public
`getAllPcbsInfo(): Promise<Array<IDMT_PcbItem>>` signature. This review does not
update any source pin or infer runtime admission from declarations.

The public UI handler reads the mutable AST's `pcbs` and `boards`, maps display
titles to names and resolves board names. The adapter instead uses the existing
source-qualified project-manager path already used by PCB rename preflight:
`/PrjDB/pcb/getAllKVDatas` with the explicit project UUID. Its manager handler
returns the worker result without the adjacent array route's caught-error `[]`
fallback. Worker `getAllKVData` enumerates `getAll()` and copies each entry through
`get`; deleted records are excluded. That getter supplies metadata only.
`getNeedData(..., true)` is a separate canvas-loading path and is not called.

## Guards and limits

Each sample reads project identity/owner, the complete native PCB metadata map,
then project identity/owner again. Two samples must match exactly after sorted
UUID projection. The existing no-editor guard rechecks the same UI, DOM, tab,
project, RPC receiver and timer owners across awaits. The runtime keeps the same
authenticated scope and verifies the same fixed implementation profile before
and after dispatch. No additional runtime file or pin is needed.

All map keys must be PCB identifiers, match each entry's own UUID and carry the
expected project identity. Selected scalar fields must be own data properties;
unselected fields such as canvas and creator are not traversed. Inventory is
limited to 128 PCBs and 65,536 UTF-8 bytes for its complete copied sample; the
result and its transport envelope have the same separate byte limit. These
checks occur after native enumeration and cannot cancel that enumeration. The
existing ten-second deadline prevents further reads after expiry but cannot
cancel an outstanding native request.

## Concrete omissions

- No public-object parity: board names, item type, creator, modifier, create time
  and fixed empty description are omitted. Native source/version/board empty
  string fallbacks are already lossy and are not reconstructed.
- No parent/board membership proof, visual tree order, focused-PCB lookup,
  canvas, AST source, asset, circuit, layout or connectivity data.
- No cloud lookup, clock/client read, name availability, mutation, navigation,
  explicit Save, source-membership proof or worker lease. A complete observed
  metadata map is not saved-source completeness or startup/queue completion.
- No editor-open operation: only the native Start Page and optional hidden blank
  placeholder are admitted by the existing project-only guard. Historical,
  archived, store, CBB, V2, dirty, read-only/concurrent or restoring states refuse.
- No connected validation is claimed. No live application or production-design
  operations were performed for this change.

## Verification

Focused synthetic tests cover populated and genuine empty maps, deterministic
sorting, key/UUID/project matching, excluded private accessors, malformed or
missing replies, oversized maps and multibyte samples, owner/registry/RPC drift,
second-sample changes, timeout without retry, strict request/result membership,
authenticated runtime admission and existing metadata/preflight registration.
The unchanged selected-reader and PCB rename-preflight regressions remain in
the focused run. Coverage discovery labels both metadata routes as guarded,
native-equivalent and not connected-validated. No full suite, bundle generation,
version change, installation or publication was performed by this task.

Final focused run: 78 tests passed, zero failures/skips, covering the PCB
metadata/program/runtime/registration, unchanged PCB rename preflight and API
coverage tests. Strict type-aware lint on the changed files and shared
registration/coverage files passed with no warnings; both TypeScript projects
passed. Coverage generation and its exact committed-artifact check passed.
