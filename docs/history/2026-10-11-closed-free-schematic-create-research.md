# Closed empty free schematic creation: installed-source review

This profile creates one closed `SCH` container with one `META` record. It does
not create a page, drawing frame, reuse-block symbol or editor. The operation is
`document.schematic.create` with `boardName` absent. Its active context remains
one clean, directly opened ordinary PCB in the same local project.

This is a native-task-equivalent adapter, not execution of the public
`eda.dmt_Schematic.createSchematic` workflow. Offline fixtures are not connected
validation. No production project was inspected or changed for this review.

The official [createSchematic method contract](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_schematic.createschematic.html),
checked 2026-10-11, accepts optional `boardName` and resolves to a schematic UUID
or `undefined` on failure. Omitting the board creates a free schematic; the
current official example also describes its automatically created page. This
adapter deliberately supports only the closed empty-container task, not that
sheet-producing public workflow. The installed
`pro-api/0.2.53.aee2f57a/api-types.d.ts:615` declaration was checked separately
against this parameter/return distinction (`api.d.ts` is only an empty export).

## Reviewed installed implementations

Paths are relative to the EasyEDA installation's `assets` directory. Anchors
below are UTF-16 string indices, not byte offsets.

| File | SHA-256 |
| --- | --- |
| `pro-api/0.2.53.aee2f57a/api.js` | `5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc` |
| `pro-ui/3.2.149.43637efe/js/ui.js` | `12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a` |
| `pro-mgr/3.2.148.154949d9/js/pro-mgr.js` | `23089ec50bf701191c52af4a214b0d19b14e3233ead1bb5ccd50cf443e9e8742` |
| `pro-mgr/3.2.148.154949d9/js/project-worker.js` | `2792c6c87e3c60e09c43f03494a9cbb24e4ebe9c385372bbaf877ed75083a949` |
| `pro-sch/3.2.149.35ae2987/js/sch-main.js` | `0ed765f9fbc6482a0d8c209a73316aee1e4605c3faa5dd6c434dbfe96019a88d` |
| `pro-pcb/3.2.149.5378b690/js/pcb-main.js` | `392995aeffcd72311a96f918c1ff68f7e10a087511fd75c9b823008b0ffa3530` |

The new native profile retains the existing UI/manager/worker/PCB subscriber
pins and additionally checks `sch-main.js` as a bounded, canonical regular file
with no-follow open, stable identity and exact hash. It does not update the
installed manifest or relax existing PCB admission.

## Why the public creation path is not used

API `Yb.createSchematic` (1316816) delegates to UI `Ag.createSchematic`
(17074093). The UI calls `DMT_CreateNew` with `notOpen:true`. In `sch-main.js`,
handler `ah` (3647811) nevertheless requests `createSheet:true`; `d6` calls
`p6(sheet)` before checking `notOpen`. That initializes a page and can obtain or
create a project drawing and set the document drawing. A closed empty-container
request does not authorize that additional lifecycle.

The adapter instead calls exactly
`/PrjDB/schematic/addData([{name: desiredTitle, board: ""}, projectUuid])`.
Manager registration (2048141) resolves `J(explicitProjectUuid).schematic`.
Worker `fg` (1901091 onward) allocates a native identity, sets doctype `SCH`,
builds `DOCHEAD` plus `META`, and queues `uploadLocal` before returning `get(id)`.
The returned DTO has `name` and `display_name`, not PCB `display_title`,
`parent_uuid` or `docType` fields.

The exact persisted defaults are `{title,source:"",board:"",zIndex:null}`.
The header has native client, time/version and existing editor version; it does
not invent an author. The maintained raw-record chain must equal the exact new
DOCHEAD/META pair. An acknowledgment is not SQLite persistence evidence.

`ED("Schematic")` (5734938) numbers normalized existing schematic titles with
`^Schematic[\s_]*(\d+)$`, case-insensitive, then takes maximum suffix plus one.
The adapter supplies that name explicitly; the worker's doc-ID-count fallback
is different. Unsafe integer suffixes refuse. Runtime readback checks display
and ASCII-normalized search names separately, refusing locale-sensitive
divergence rather than guessing the native naming input.

## Subscriber and collateral-effect boundaries

SCH `ON_ADD` (6163707) calls `xTe` (5736739). The latter creates an AST for the
new empty schematic through `U1`, then visits existing pages only when their
`typeSymbols.block_symbol` entries match the new display name. Admission excludes
hierarchy/variant/reuse-block documents and nonordinary symbol definitions. It
also resolves every persisted page `COMPONENT` through one `ATTR` named `Symbol`
to an existing local `SYMBOL` with an ordinary type, rejecting unresolved,
duplicate, deleted and block references. Component inline `attrs` must be
absent or empty: `T9._handleSymbolData` (4488594) applies every inline attribute
through `Reflect.set` (4489068) after `createSchSymbolWithTemplate` (4491894)
constructs the model and calls the handler (4493484). An inline `cmdKey` could
otherwise override an ordinary definition
and make it a block symbol. No blacklist of a few known setters is sufficient.
`Sue` (1676460)
maps type 17 to `block_symbol`; AST construction (3768141) indexes by `cmdKey`.

`Ge.startBatch/endBatch` (5522991) resets pending sets on depth-zero entry;
nested entry increments depth and its paired exit does not drain the outer
batch. The adapter does not invent a globally observable idle flag. Existing
clean-tab/context/upload checks and complete before/after evidence still apply
to asynchronous races. An unexpected effect stops the journal; it is not
accepted as harmless and is not automatically reversed.

`Za` (3688388) rebuilds the project AST and publishes `deviceStandardization`
and `ASTUpdate`. The former handler (6147168) uses `Ax.initData` (3665148) and
`Uw` (5701007) to derive/render a list; the latter subscriber (3962824) clears
temporary designator caches. No Save or annotation call was found on this
reviewed empty-container path. The strict shared DOM guard independently
rejects schematic canvases, hidden exports, orphan frames and panel pools.

The trailing `NP.SCHEMATIC.UPDATE` resolves through manager registration
(2075010) to worker `Nd.update` (1945814). That scans nonempty inherited
schematic sources. Admission requires all ordinary schematic sources empty, so
it returns before external profile/list lookup or update notification. A title
or semantic-only comparison would not establish these boundaries.

`ON_ADD` checks the current project before awaiting `xTe`, whereas its trailing
unqualified `NP.SCHEMATIC.UPDATE` resolves `J(undefined)` afterward. Explicit
worker creation is project-bound, but asynchronous native subscribers are not
atomic against concurrent user project changes. Context checks and final
evidence detect drift; they do not provide compare-and-swap isolation.

## Persistence and recovery contract

Preparation seals complete document membership, record clocks, schematic header
lineage and every raw per-document occurrence chain. The writer's returned new
identity is retained before fallible readback or dispatch cleanup. Completion
requires exactly one new `SCH`, exact defaults/raw pair, all prior documents
unchanged, unchanged active PCB source, native closed-target metadata, and final
checkpoint/context checks after the last readback.

Recovery never repeats creation, Save, navigation, template initialization or
an inverse delete. Changed-result recovery requires the original returned ID,
original prepared artifact and the same complete effect proof. Missing-result
success cannot be inferred from a matching new title. A failed preparation
publication can be invalidated only through the maintained exact-undispatched
prefix proof. All result flags retain `saveInvoked:false`, `reopened:false` and
`currentGenerationLiveValidated:false`.

Public sheet-producing parity, board-attached creation, hierarchy/CBB projects,
imported atom-header histories, arbitrary caller names, unknown symbol
references, nonempty component inline attributes and live fixture validation
are separate work. The integrated catalog reports the empty-container limits
separately from the public argument schema. Release manifests and connected
validation require their own final verification.
