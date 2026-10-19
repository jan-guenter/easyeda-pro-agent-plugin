# Current-project schematic and page metadata

Date: 2026-10-19. This is a source-reviewed, offline-tested native metadata
reader, not a connected validation report. It adds no schematic writer, canvas
reader or permission to open a project.

## Public API scope

EasyEDA documents four Beta methods covered by this reader:

- `getSchematicInfo(schematicUuid: string): Promise<IDMT_SchematicItem | undefined>`.
- `getAllSchematicsInfo(): Promise<Array<IDMT_SchematicItem>>`.
- `getSchematicPageInfo(schematicPageUuid: string): Promise<IDMT_SchematicPageItem | undefined>`.
- `getAllSchematicPagesInfo(): Promise<Array<IDMT_SchematicPageItem>>`.

The all-pages method covers every schematic page in the project, not only the
current container. The reader implements four native task equivalents with
explicit local project/branch targets and stricter observed results. It does not
dispatch the public wrappers or claim `IDMT_SchematicItem` or
`IDMT_SchematicPageItem` parity. The two page methods now have their own strict
request/result branches in the existing tool; they are not container aliases.
Sources: [getSchematicInfo](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_schematic.getschematicinfo.html),
[getAllSchematicsInfo](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_schematic.getallschematicsinfo.html),
[getSchematicPageInfo](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_schematic.getschematicpageinfo.html),
[getAllSchematicPagesInfo](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_schematic.getallschematicpagesinfo.html).

## Installed implementation evidence

These locally installed files were read as bytes, not executed. Offsets are
zero-based JavaScript string offsets in the pinned files, not public API
contracts. Runtime admission retains the existing complete implementation pin
set rather than trusting a filename or version label alone.

| Installed source | SHA-256 | Relevant evidence |
| --- | --- | --- |
| `pro-mgr/3.2.184.355087e9/js/pro-mgr.js` | `005584e02cd9b2d49fdb387b2f997c1c8d3f88b0c48a7531c8097c483ed0bd2e` | Schematic exact getter at 2058248, schematic KV getter at 2058801, sheet KV getter at 2060322 and sheet exact getter at 2060425 delegate to project-qualified worker methods. |
| `pro-mgr/3.2.184.355087e9/js/project-worker.js` | `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` | Schematic getter near 1911033 and KV getter 1912957; sheet getter 1919022 and KV getter 1921285. |
| `pro-api/0.3.50.ab46409c/api.js` | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` | Public schematic wrappers near 1318038/1318290 use extension message dispatch, which this native route does not call. |
| `pro-api/0.3.50.ab46409c/api-types.d.ts` | `d5fe990034c55001302ea6c3f704c2d4b88cdf23253cc5293b3bad62a32b9def` | Installed public declaration snapshot. |

All four paths are below
`/mnt/c/Program Files/easyeda-pro/resources/app/assets/`.

The worker schematic getter excludes deleted/missing records and records without
a title. It returns independently normalized `name` and retained `display_name`.
The sheet getter excludes deleted/missing records, returning normalized `title`
and retained `display_title`, its parent schematic UUID, native type 1 and
`zIndex`. Native `source`, `version` and `board` use truthy-or-empty-string
fallbacks. These are observed getter semantics, not lossless storage reads.
The native name normalizer near 1845057 is environment-dependent; the reader
preserves its returned strings, including Unicode, rather than normalizing them
again.

The selected KV routes do not have the array routes' catch-and-return-empty
fallback. The sheet exact route delegates `K(projectUuid).sheet.getData(pageUuid)`
and returns that response's `result`; it neither requests canvas data nor
substitutes an empty collection on failure. The worker's `getData` checks the
selected ID and projects the same metadata as its KV getter. The KV getter's
first argument optionally filters by schematic UUID; passing `undefined`
observes the whole project. Sheet enumeration does calculate its native `doc_id` using the
existing order map (`getOrderNum` near 273581); that implementation reads the
map without initializing missing entries. The reader omits that derived field,
creator/modifier/create time, public board names and title blocks. It does not
read canvas data, AST holders or `getNeedData`.

## Bounded implemented contract

`easyeda_control_project_schematic` accepts one of:

- `eda.dmt_Schematic.getSchematicInfo`: exact project, branch and schematic UUID.
- `eda.dmt_Schematic.getAllSchematicsInfo`: exact project and branch UUID only.
- `eda.dmt_Schematic.getSchematicPageInfo`: exact project, branch, expected
  schematic UUID and `schematicPageUuid`.
- `eda.dmt_Schematic.getAllSchematicPagesInfo`: exact project and branch UUID only.

All four require the original authenticated reader lease, exact pinned current
implementation, the existing local-project Start Page guard and no editor tabs
or hidden editor frames. The guard also rejects dirty tabs, tab restoration,
document URL commands, historical/read-only/concurrent state and unsupported
project formats. A hidden blank placeholder is permitted by the existing guard;
it is not a schematic editor.

Each sample brackets complete native schematic and sheet KV reads with project
owner checks. Selected lookup also requires the exact schematic or sheet getter
to match the corresponding KV entry. A selected page must belong to the caller's
expected schematic, which must itself be in the complete observed map. The
complete sample must match twice, including
unselected peers and children. RPC receiver and UI ownership are rechecked after
each asynchronous boundary. The only admitted native RPCs are:

- `/PrjDB/project/getData`: `[projectUuid]`.
- `/PrjDB/schematic/getAllKVDatas`: `[projectUuid]`.
- `/PrjDB/sheet/getAllKVDatas`: `[undefined, projectUuid]`.
- `/PrjDB/schematic/getData`: `[schematicUuid, projectUuid]`, selected mode only.
- `/PrjDB/sheet/getData`: `[schematicPageUuid, projectUuid]`, selected-page mode only.

Every observed sheet must name an observed schematic. Duplicate or overlapping
schematic/sheet UUIDs, map-key/record identity mismatches and malformed metadata
refuse the entire result. Container methods return `schematics`; page methods
return `pages` and reject a container-shaped result. Selected-page output has
exactly one entry. The all-pages array is globally UUID-sorted, independently of
parent order, and includes each observed page once. The full project container
and sheet counts remain available even when the output selects only one item.
Container and child arrays also use UUID comparison order;
native child `zIndex` is returned separately and is not a visual-order promise.
An empty project is accepted when both maps are empty. Containers may have no
observed children; an all-pages request can therefore return no pages while
containers exist. Missing selected containers or pages refuse instead of
becoming a fabricated empty result.

Limits are 128 containers and 128 total sheets, with 512 KiB for the complete
combined projected sample **before selected filtering**, plus a separate 512 KiB
result-envelope limit. Both full maps are validated and bounded before a selected
page or container is filtered. A small selected result never permits malformed,
oversized or orphaned unselected metadata. Native enumeration occurs before these output bounds.
The ten-second deadline prevents further reads after timeout but cannot cancel
an outstanding native call. No partial map or truncation is returned.

Offline discovery/argument validation use `project-schematic` and
`project-schematic-validate` on `easyeda_control_api`. Discovery and valid
arguments grant no execution authority. Coverage records a guarded
native-task-equivalent route, with current connected validation unclaimed.

## Evidence limits and concrete omissions

Complete **observed native maps** are not complete durable SQL/source membership.
The result explicitly reports no worker identity lease, persistence proof,
permission verification, startup completion, CAD authority, mutation or explicit
Save. It does not reuse the schematic rename preflight's expected-before,
name-availability, client/ticket/clock or hidden-holder claims. No name lookup,
cloud request, navigation, canvas/source loading, selection, write or Save is
introduced.

The public wrapper's optional missing result, full public item fields and exact
wrapper dispatch are intentionally not replicated: this route's contract is an
exact-target, fail-closed native observation. The former standalone-page getter
backlog is resolved only at the implementation/offline-test layer. Connected
page observation remains unvalidated. Current-page/current-container getters
are not offered because this route requires no open editor. Public title-block
fields, canvas primitives and topology remain omitted because native page
metadata does not establish circuit contents, electrical connectivity or
rendered state.

## Focused verification

The synthetic VM tests cover all four selected/collection reads, exact Unicode fields,
complete parent-child membership, empty maps, malformed maps, ownership drift,
no-editor refusals, timeout/no-late-continuation and complete combined byte
bounds. Page-specific cases cover expected-parent mismatch, a contradictory
direct getter, globally sorted pages, childless containers, complete peer
validation before selection, every awaited read boundary and a timed-out direct
page lookup. Runtime tests cover original lease/fingerprint/source pins before and
after dispatch, quarantine, malformed arguments and reply authority promotion.
Registration/offline tests exercise the maintained source registration and
strict discovery routing. These are offline regressions, not evidence that the
reader has executed in a connected EasyEDA generation.
