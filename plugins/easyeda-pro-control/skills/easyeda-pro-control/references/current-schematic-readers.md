# Project-local schematic metadata

Use this reader for container names, page metadata and sheet membership in an
already loaded local project with no editor tabs or hidden editors. It does not open a project
or sheet. Start Page without a loaded project is insufficient. For circuit
contents, this metadata reader is not a substitute for a schematic observer.

Query offline `project-schematic` with `includeSchemas:true`, validate with
`project-schematic-validate` and `query:{"request":...}`, then call
`easyeda_control_project_schematic` with the validated request and authenticated
`expectedFingerprint`.

```json
{"method":"eda.dmt_Schematic.getSchematicInfo","target":{"projectUuid":"<64-hex>","branchUuid":"<32-hex>","schematicUuid":"<16-or-32-hex>"}}
```

For the complete observed container collection, use
`eda.dmt_Schematic.getAllSchematicsInfo` and omit `schematicUuid`.

For one page, use `eda.dmt_Schematic.getSchematicPageInfo` and supply both its ID
and the expected parent container. A page with a different parent refuses.

```json
{"method":"eda.dmt_Schematic.getSchematicPageInfo","target":{"projectUuid":"<64-hex>","branchUuid":"<32-hex>","schematicUuid":"<16-or-32-hex>","schematicPageUuid":"<16-or-32-hex>"}}
```

For every page in the project, use `eda.dmt_Schematic.getAllSchematicPagesInfo`
with only `projectUuid` and `branchUuid`. It is not filtered to the current
container. No method takes an `arguments` object or tab ID. An active canvas,
hidden/export editor, pending restoration, document URL command, or unsupported project mode refuses.
Do not close unsaved work merely to satisfy the reader.

All four methods sample the complete native schematic and sheet metadata maps twice,
checking the project, branch and owner around the reads. Every sheet must refer
to an observed container; orphaned or changing membership refuses. The selected
methods also check the selected container or page's direct metadata getter
against the complete map.
UUID sorting makes comparisons deterministic; it is not visual page order.

Container methods return a `schematics` array. Each container has `uuid`, `name`,
`displayName`, `boardUuid`, `source`, `version`, `ticket`, `updateTime` and its
complete observed `children`. A child
returns `uuid`, `schematicUuid`, `title`, `displayTitle`, `docType:1`, `zIndex`,
`source`, `version`, `ticket` and `updateTime`. Page methods instead return a
`pages` array with those same child fields. A selected page yields exactly one
entry; the all-pages route can return an empty array even when childless
containers exist. Both counts still describe the complete observed project,
not just the selected result. Names and display names, like
titles and display titles, remain separate native strings. Unicode is preserved.
Source/version/board have already passed through native empty-string fallbacks;
the reader cannot recover their original absence. It returns native metadata
equivalents, not public SDK objects or title blocks.

The official [selected-page method](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_schematic.getschematicpageinfo.html)
takes a page UUID; the [all-pages method](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_schematic.getallschematicpagesinfo.html)
takes no arguments. Both are Beta APIs. This adapter additionally binds the
project and branch, and the selected page's expected parent. It intentionally
does not return public `showTitleBlock` or `titleBlockData`: those are outside
the observed native metadata maps. No current-page or current-container lookup
is offered because this route requires no open editor.

Limits are 128 containers, 128 sheets and 512 KiB of evidence. Complete-map checks
still apply to a selected container or page. Oversized, missing, accessor-backed,
non-finite or contradictory values refuse without truncation. Native enumeration
happens before these bounds. A timeout prevents subsequent reads, but does not
cancel an outstanding native call.

This establishes observed metadata and parent membership only. It does not read
either schematic AST, sheet canvas, pins, nets or connectivity; prove saved
membership, startup/queue completion or worker ownership; or authorize a rename.
No canvas load, navigation, clock/client lookup, name-availability check, cloud
lookup, mutation or Save is requested. Source review and offline tests are
separate from connected validation, which remains pending.

The [disposable rename lifecycle](current-schematic-rename.md) has separate
baseline, ownership, clock and persistence requirements. Successful metadata
reads cannot replace them.
