# Libraries and ECO

## Resolve identity before creating

Search by more than one identity where available, such as supplier ID, manufacturer part number, exact name, and direct catalog lookup. Reject a candidate when top-level and nested identities disagree. Search the project library before creating or copying an asset because a prior partial operation may already have added it.

Useful public APIs include library listing, symbol copy, footprint copy, device create or modify, and 3D model lookup. Public library getters return metadata, not live editor geometry. Open the exact symbol or footprint document to inspect its primitives.

When reading native library document history, fold records by their ordering field and remove tombstoned items. The source is an event history, not a ready current-state list.

## Choose the execution path

Query `easyeda_control_library` with `{request:{action:"capabilities"}}`. A catalog descriptor is not execution support. Metadata reads, DEVICE writes, geometry edits and exports have separate proof paths.

On the current restricted tuple, use `easyeda_control_project_symbol` for one
project-local symbol's metadata while an ordinary PCB is active. Read
[its exact contract](api-reference.md#current-project-local-symbol-metadata)
first. It observes registry absence and loaded metadata only. It does not prove
hidden-editor absence, saved source or readiness to rename, and it never enables
the blocked writer below.

With a loaded project and no editor tabs, use the separate
`project-symbol-preflight` request instead. Read [the no-editor comparison
contract](api-reference.md#symbol-observation-with-no-editor-tabs) before use.
Do not open a PCB solely for that comparison. Caller-supplied expectations
neither verify source provenance nor enable renaming.

## Current ordinary metadata route

Use `easyeda_control_project_symbol_metadata` for a name and/or non-null
description change to one closed, unused project-local symbol. Discover
`project-symbol-operation` and validate with `project-symbol-operation-validate`
first. Read [the retained-owner workflow](current-project-opening.md#ordinary-forward-only-symbol-metadata).
It requires complete META-only raw history, including overwritten and deleted
records, exact project/branch/owner/symbol and companion-PCB identities, and a
supported startup expectation. Tags, source and peers stay unchanged. It has no
inverse, general recovery, explicit Save or replacement-owner continuation.
The older `easyeda_control_symbol_metadata` and `library.symbol.modify` remain
blocked; they are not aliases for this route.

The separate disposable lifecycle admits only symbols unreferenced by active
schematic pages. Its current META-only saved-content check models both raw-history
and document-cache serialization from the pinned producer. It compares the entire
string exactly; the cache form is not permission to omit or normalize user fields.
A matched form does not prove which cache branch ran. SQL actor identity remains
independently checked. The separate bounded canvas-segments profile is available
only for disposable validation and has no connected result; read its exact
[history limits](current-project-opening.md#disposable-forwardinverse-validation).
A stopped
verification is still a failed lifecycle even if closed SQL proves the intended
metadata persisted. Close through its original owner; never retry, manually invert
or issue Save to repair that result. Installed101500 passed a complete disposable
forward/inverse lifecycle with independent review. This validates that narrow
shared writer, not every symbol shape. Installed123000 separately validated the
ordinary unused META-only forward-only entrypoint on a disposable fixture.

## Structure-write completion restriction

These eight operations are blocked before dispatch:

- `library.symbol.create` and `library.symbol.modify`;
- `document.page.create` and `document.page.rename`;
- `document.pcb.create` and `document.pcb.rename`;
- `document.schematic.create` and `document.schematic.rename`.

Their native META writes also schedule a delayed `project_structures` update.
The existing task1 upload wait and document-record comparisons do not prove that
SQL effect or completion of its timer/task2 job. Repeated structure calls can
insert duplicate equal-ticket rows. A quiet interval or matching checkpoint is
not a substitute. The code retains strict schemas and pure effect verifiers,
but these are not executable lifecycle support.

Completed historical journals remain readable. Potentially dispatched affected
journals cannot be marked complete by ordinary reconciliation, including its
no-mutation mode. The existing exact undispatched-preparation invalidation
remains separate; do not clear flags or replay a write to reach it. This is an
unimplemented completion contract, not evidence that an earlier project was
damaged. Footprint/DEVICE routes, readers and ordinary navigation are not part
of this eight-action restriction and retain their own checks. Native Save also
clears pending geometry flags, scheduling the same structure job for
schematic-page, symbol and PCB editors. Their design transactions, including
new apply, commit, inverse, repair and nonterminal reconciliation, are blocked
too. Footprint geometry is outside this scheduler gate and retains its own
proof requirements. Do not use an unsaved apply or native Save to bypass the
unimplemented completion contract.

The creation and container-rename sections below describe retained source
contracts for inspection and future implementation. They do not authorize
execution while this restriction is active. Query current capabilities first.

## Geometry and navigation

For supported footprint geometry, open the exact project library member and use its `easyeda_control_design` operation. Commit saves and reopens that editor, then verifies the selected-branch project-record delta. Symbol geometry is currently blocked by the structure-write restriction above. The legacy `easyeda_control_save_reopen` endpoint remains disabled.

Choose `library.footprint.open` or `library.symbol.open` for library assets, with
`libraryUuid` equal to the observed project UUID and `target.uuid` equal to the
checkpoint member. `document.open` is for a PCB or schematic page; supplying a
footprint ID to it refuses before navigation. Use the asset-specific operation
only after confirming that refusal was pre-dispatch, not to retry an ambiguous
open under another name.

The pinned footprint editor exports a `PCB` DOCHEAD, while its saved library record is `FOOTPRINT`. Keep that raw header and hash; the executor binds library identity through editor type 4, project/owner/UUID and the complete checkpoint. New footprint geometry omits the PCB-only `partitionId` in both native export and storage. Do not rewrite headers or infer editor type from source alone.

Footprint geometry now uses the installed native history handlers, not full-source decode. The earlier decoder failed after a partial in-memory edit and did not establish durable line creation. A later public LINE test exposed a separate delayed project-worker write: the immediate checkpoint lacked the line, while later checkpoints proved both creation and the subsequent inverse reached storage. A decoder error, public acknowledgment and immediate checkpoint must not be conflated. LINE create/delete use public APIs; modification explicitly awaits the object's `done()` because the SDK wrapper drops that Promise. ARC, POLY, FILL and STRING use fixed, exact-frame history calls. Modifiers correlate native getter values with complete source and preserve unrequested native precision. Created identities come from the native reply and enter the journal before proof.

Geometry modifications preserve identity and layer. Use explicit delete/create for POLY/FILL shape replacement and graphic-arc angle/mode changes. FILL supports solid mode and one-contour modification; slot regions and default-font reverse changes are refused. Text creation compensates for the native expansion-unit mismatch. PAD create uses canonical numeric pins, simple lands and default mask/thermal settings; its property adapter supports explicit zero values and custom settings without the lossy SDK round trip. Native pad property edits may update in-memory default-pad tool settings, as the UI does. That is an explicit tool-setting effect, not an exception to exact project-source or SQLite invariants.

Native PAD history writes the complete target record. A legacy standalone SMD pad may therefore lose inactive drill offsets/angle, gain missing empty attribute/inner-layer defaults, and encode its shared paste expansion to the native four-decimal format. Before editing, the facade proves each such conversion from that pad's saved body and reports the raw hashes and field differences. Every other field and every untouched pad remains strict. Unequal stored top/bottom paste values are refused because the native model shares one value. A pad requiring this legacy conversion has no advertised exact inverse; native editing cannot reconstruct the original inactive fields or missing defaults.

Public history edits do not assume the decoder's empty-net selector correction. The older failed transaction's exact default-NET/selector bookkeeping remains a separate recovery/persistence proof, with raw hashes retained. Commit calls the selected frame's compiler save after another complete source check, without decoding again, then awaits native scheduled-upload completion before checkpointing and closing. This wait is not another Save or forced upload; full source and durable project-record proofs still decide success. The footprint LINE path passed save/reopen and complete 14-document proof. Other history adapters have focused offline tests; their live coverage is reported separately.

Symbol opening and reopening use `lib_Symbol.openInEditor`: the pinned `dmt_EditorControl.openLibraryDocument` symbol branch can leave its Deferred unresolved or miss `tabChange`. The supported route still requires exact project membership, returned-tab activation and independent context proof. A timed-out open is ambiguous; recover the existing journal instead of retrying it.

Symbol source edits may materialize one previously unexported null `Symbol` attribute on their existing PART. The exact-effect proof checks its complete body and records its native identity; it does not omit the row from hashes. Such a baseline has no advertised exact inverse. Symbol durable proof separately reports only source-bound legacy empty-group/version removal and empty-parent-to-PART conversion, plus a baseline-proved user-stamp insertion. Every other record and document remains invariant. These encoding rules do not authorize a delayed change from another transaction; recover that with its own retained evidence.

Activation is called once. A false boolean is accepted only when fresh project, document, type, tab and library-owner readback proves the requested target is active. A missing or malformed acknowledgment, or any context mismatch, remains a failure.

Activating a PCB or footprint also requires the existing native preference
`pcbCommandTab === true`. The installed alternative can write an account
preference; activation authority does not authorize that side effect. The adapter
reads a bounded preference value and reports fixed failure codes for missing,
malformed, inaccessible or false/non-boolean values without exposing account
data. Do not change the setting as a shortcut, weaken the guard or repeat an
ambiguous activation. A refusal after dispatch uses the original journal's
read-only reconciliation, not another activation call.

Supported DEVICE writes use `easyeda_control_library` with `request.action:"execute"`, the typed operation, fresh `expectedContext` and `expectedFingerprint`, and `confirmWrite:true`. They journal the plan before dispatch and verify the durable project-record delta afterward. A successful result reports `saved:true,reopened:false`; it is not reopened geometry proof. Do not open an unrelated editor to manufacture that claim.

## Observe owned editor tabs

The fixed SDK readers `eda.dmt_EditorControl.getSplitScreenIdByTabId` and
`getTabsBySplitScreenId` accept an exact existing `tabId` or leaf `splitScreenId`.
They bind every tab in the complete bounded tree to saved current-project
membership, compare the direct lookup with the tree, and require two matching
observations plus unchanged checkpoint/context. Results contain identities and
types, not raw tab titles or private data. A canonical Start Page may coexist but
cannot be the tab selector; foreign projects, empty leaves, duplicate documents
and unsupported symbol types refuse. These are read-only observations, not
navigation authority or current-generation live-validation claims.

## Blocked: create one closed empty schematic page

The retained `document.page.create` contract is for an empty page in an
existing ordinary project schematic. Supply the parent identity, not a title,
source string, drawing-frame choice or template:

```js
{ id: "create-empty-page", action: "document.page.create", schematic: { uuid: schematicUuid } }
```

The checkpoint-bound adapter derives the native `P` name from the largest
existing `P` numeric suffix plus one, and the page order from
`max(1, sibling zIndex) + 1`. It requires one clean owned active PCB (type 3) or
sibling schematic page (type 1), an exact writable local branch, and no
hierarchical INSTANCE or CBB project records. Unrelated open editor tabs and
concurrent strict mode are refused; the canonical Start Page and hidden native
project placeholder are not treated as design editors.

Execution uses one project-qualified native worker addition. The public
`createSchematicPage` workflow also initializes a drawing frame and opens an
editor; those steps are deliberately not invoked here. Success proves exactly
one new empty page and unchanged complete pre-existing documents/hierarchy,
plus unchanged active source/context. `saved:true` reports native persistence,
not an invoked Save. No template initialization, open/reopen, exact inverse or
current-generation live validation is claimed.

After an ambiguous result, inspect and reconcile the original journal—never
create again. Changed-result reconciliation needs both its immutable prepared
plan and original native returned page ID. Even exactly one matching new page
cannot substitute for that identity evidence. Missing return evidence remains
unresolved; deleting the observed page is not an automatic rollback.

## Blocked: create one closed empty ordinary symbol

The retained `library.symbol.create` contract accepts `symbolType:2`, the exact current-project UUID
as `libraryUuid`, a unique nonblank name, and an optional description. An ordinary
clean PCB must be the only project editor. Classification, inherited source,
hierarchical/CBB projects and other symbol types are refused.

This native task equivalent creates one closed META-only symbol. It does not
initialize a PART, canvas, pins or template, open an editor, invoke Save, or create
a device. Do not treat it as a ready-to-place component or assume subsequent
geometry operations admit an uninitialized symbol. Those steps need their own
supported operations and proofs. Permission denial may open a native dialog;
the preflight is not strictly observational.

Success requires the original native returned ID, exact new metadata/header and
complete unchanged-peer evidence. As with page creation, reconcile the original
journal after uncertainty; never identify a result by name alone or repeat
creation. There is no automatic deletion/inverse or connected-validation claim.

## Blocked: create one closed empty free PCB

`document.pcb.create` admits only an absent `boardName`. A supplied board name,
even an empty string, is outside this execution profile. Keep one clean ordinary
PCB active and no other design editors open. The adapter derives the next `PCB`
numeric name from the complete checkpoint and creates one closed, unbound,
META-only PCB. It does not initialize layers, canvas, rules, placeable objects
or a template, open the result, invoke Save, or create a board.

The original native UUID is retained before readback. Completion requires its
exact DOCHEAD/META pair, unchanged raw record chains for every existing document,
unchanged active source/context and complete checkpoint proof. Imported atom
histories, inherited documents, hierarchical/CBB projects and hidden or pooled
editor frames refuse. `saved:false`, `reopened:false`, `saveInvoked:false` and
`canvasInitialized:false` remain separate from verified native persistence.
Current-generation live validation is not claimed.

After uncertainty, reconcile the original journal using its retained preparation.
Changed-result recovery also requires the original native return; an exact
unchanged-baseline proof does not infer or require a created identity.
Never create again or infer identity from a matching name.
There is no automatic delete, inverse, opening or canvas-initialization recovery.

## Blocked: create one closed empty schematic container

`document.schematic.create` with `boardName` absent creates a closed, unbound
`SCH` container. It does not create a page. Keep one clean ordinary PCB active
and no other design editor open. The adapter derives the next `Schematic`
numeric name from the checkpoint. There is no caller title, board attachment,
template, drawing frame, canvas initialization, opening or Save.

Admission requires ordinary local symbol references for every existing page
component and absent or empty inline component attributes. Native inline
attributes invoke model setters and can turn an apparently ordinary symbol into
a block symbol. Hierarchy, CBB, inherited documents, imported atom histories,
hidden exports and pooled editors refuse. Do not remove those attributes or
change a design merely to satisfy admission.

Success requires the original returned ID, exactly one DOCHEAD/META pair,
unchanged complete peer records and raw occurrence chains, and unchanged active
source/context. Recovery inspects that same journal without recreating, opening
or deleting the result. It cannot infer identity from a matching title.
Native subscribers are asynchronous, so keep the project unchanged throughout;
context checks detect observed drift but do not provide atomic project isolation.
This adapter has offline tests, not connected validation or parity with the
public page-producing workflow. Query separate page operations when a drawable
sheet is needed.

## Close one inactive clean document

`document.close` accepts an exact project-qualified `tabId` for a loaded ordinary
symbol (type 2), PCB (3) or footprint (4). A separate clean PCB or footprint must
remain active. Exactly those two owned project editor tabs must share one unsplit
container; no dirty tabs, shared symbol model, CBB symbol or active-target close
is admitted. This does not authorize a general discard operation.

The native public acknowledgment returns before teardown finishes. The adapter
therefore waits for its terminal removal notification, verifies target tab/frame
and symbol-manager cleanup, then observes coherent context twice. Completion
also requires unchanged active source and the entire logical saved database.
There is no Save, automatic reopen or exact inverse: native close clears editor
undo/export caches. Schematic-page close is excluded because its installed
cleanup can persist INSTANCE attributes even when the tab reports clean.

Any post-dispatch failure retains execution quarantine. A still-visible tab or
later disappearance is not proof that the original native work terminated; use
the retained-runtime termination workflow before reconciliation. Recovery only
observes whether the original target remains present and checks the complete
unchanged baseline. It never repeats close, opens or activates a tab. This route
has offline regression coverage, not a current-generation live-validation claim.

## Blocked: rename one closed PCB or schematic container

`document.pcb.rename` and `document.schematic.rename` accept an exact existing
`target.uuid` and a trimmed, unique `name`. Use the library executor, fresh full
context/fingerprint and `confirmWrite:true`. One different clean project-owned
PCB must be active; the target and every child page must be closed. Independent
DOM checks also exclude tabless editors, hidden export frames and panel pools.
An empty tab listing alone is insufficient.

This separate native adapter changes only the container's stored title. It
refuses inherited/CBB/variant projects, imported atom-header histories, unknown
target metadata and non-null target ordering. It does not invoke the public
wrapper's paired-design renames, update open editor titles or perform Save.
Complete checkpoint proof preserves peer records, clocks, insertion provenance
and schematic-header lineage. Checkpoint-bound per-document raw occurrence
chains also retain repeated/stale headers, overwritten records and tombstones.
Every peer chain must be unchanged; the target appends exactly the pinned
DOCHEAD/META pair. EDIT_HEAD, chunk boundaries and interdocument ordering are
outside this per-document commitment. Only the target META title and reviewed
native clock/header bookkeeping may change. Completion reports `saved:false`,
`reopened:false`, and `saveInvoked:false` despite verified native persistence.
Current-generation connected acceptance remains pending.

An acknowledged write is retained before post-write readback. After any failure,
inspect and reconcile its original journal; never repeat the rename or infer
success from the current title. Restore the original clean PCB context if
necessary, but do not open the target or children for this recovery. An inverse
is a separately admitted new transaction using the original name, not automatic
rollback. A project checkpoint does not prove the tree caption refreshed.

The raw-occurrence proof corrects a gap in installed103000's materialized-only
container proof. Do not validate that older rename adapter by dispatching it.
Previously prepared plans without the new commitment fail rederivation after
upgrade; they are not silently migrated or permission to replay a write.

## Recover an unpublished preparation

For `document.activate`, `document.close`, `document.page.create`,
`document.pcb.rename`, `document.schematic.rename`, `document.pcb.create`,
`document.schematic.create` and
`library.symbol.create`, a failed
journal publication can leave an initial plan without its preparation artifact.
Use the original journal's reconciliation on the same compatible runtime. Only
exact initial publication states with no dispatch, orphan, Save or recovery
markers qualify. The adapter rederives the plan from its original checkpoint
and proves unchanged source, complete saved database/history and exact context
before marking it `plan-invalidated`. This is not successful execution and does
not retry the action. A fresh intent needs a separately reviewed operation.

Read-only verification failure leaves this initial journal intact for another
inspection. Rebind, target navigation and dispatch-authority recovery refuse
before changing it; replacement-runtime invalidation is not implemented. Do not
delete artifacts, clear flags or treat a missing acknowledgment after dispatch
as an unpublished preparation. Retained preparation and dispatched recovery
continue to use their original evidence requirements.

## Create a project DEVICE

`library.device.create` creates one device bound to an existing project symbol and, optionally, an existing project footprint. It does not create or copy those assets, place a component, or apply an ECO. The executor checks names for duplicates and retains the returned native ID before readback.

Use the actual current project UUID as `libraryUuid`, not the metadata owner UUID or the `Project` alias. Symbol and footprint IDs must occur in the complete current-project checkpoint. In these examples, variables represent independently observed identities:

```js
{
  id: "create-connector-device",
  action: "library.device.create",
  libraryUuid: projectUuid,
  name: "Connector device",
  association: {
    symbol: { uuid: symbolUuid, libraryUuid: projectUuid },
    footprint: { uuid: footprintUuid, libraryUuid: projectUuid }
  },
  property: { designator: "J?", addIntoBom: true, addIntoPcb: true }
}
```

Creation also supports description, up to two classification strings and supported device properties. `otherProperty` preserves scalar `0` and `false` but rejects reserved binding/metadata fields and null values. New-device BOM/PCB inclusion defaults to true unless explicitly false. No image upload is performed.

## Change a project DEVICE binding

The `library.device.modify` executor accepts an exact `target.uuid` and an association-only patch. It preserves images, tags, source, sourcing fields and all other attributes. A symbol cannot be cleared. `footprint:null` clears the footprint binding; `model3D:null` clears only the model binding, preserving title and transform metadata.

```js
{
  id: "rebind-connector-footprint",
  action: "library.device.modify",
  libraryUuid: projectUuid,
  target: { uuid: deviceUuid },
  patch: {
    association: {
      footprint: { uuid: replacementFootprintUuid, libraryUuid: projectUuid }
    }
  }
}
```

A null stored component attribute can mean inheritance. If a schematic instance would inherit a changed Symbol, Footprint, model or model title, this metadata-only operation refuses. Plan the separately authorized instance change or ECO.

## Assign an existing 3D model

The pinned native project library does not expose project-local model storage. Existing model assignment therefore uses its exact external model UUID and collection UUID, both 32 lowercase hexadecimal characters. Filenames, paths, aliases and implicit system-library fallback are not accepted.

For DEVICE create, add `association.model3D`. For modify, use `patch.association.model3D: {uuid:modelUuid,libraryUuid:externalModelLibraryUuid}`. The executor reads metadata twice, validates UUID, owner, library type `5` and title, and rechecks it immediately before writing. It stores the native `uuid|collectionUuid` binding and observed title without modifying the external model or current transform. Metadata identity does not prove model dimensions or clearance.

Keep existing model bindings during unrelated changes. Clear or replace one only within the task's explicit scope and after resolving inheritance consequences.

## Adjust an inherited DEVICE model transform

`library.device.model-transform` changes one existing DEVICE META `attributes['3D Model Transform']` value. It preserves the model identity/title, all other device metadata and every stored placement record. The current DEVICE must already have a model binding and transform. It does not create an instance override or propagate an ECO.

Supply `inheritedInstances` as the exact complete list of affected `{documentUuid,documentType,componentUuid}` entries, with `documentType` either `PCB` or `SCH_PAGE`. Derive it from the complete checkpoint: the component resolves to the selected Device, and neither its stored ATTR nor its body attribute map supplies a non-null transform override. The executor rejects missing, duplicate, unexpected, locked or unreviewed consumers. This list explicitly authorizes changing their inherited default, not their placement or model binding.

```js
{
  id: "adjust-device-model-height",
  action: "library.device.model-transform",
  libraryUuid: projectUuid,
  target: { uuid: deviceUuid },
  transform: {
    format: "legacy",
    dimensionsMil: observedDimensions,
    rotationDegrees: observedRotation,
    offsetMil: requestedOffset
  },
  inheritedInstances: observedInheritingInstances
}
```

The transform uses the same typed mil/degree legacy or affine-v2 forms described in [pcb-geometry.md](pcb-geometry.md). Mixed zero dimensions are valid native values and must not be filled in by guesswork. The complete saved-record proof does not prove a cached editor refreshed its model, nor that the resulting model fits mechanically. Inspect the reopened identity/transform and required mechanical datums separately.

## Devices and placed PCB components

The controlled PCB component-create profile is device-driven. Passing a footprint record where the wrapper expects a device can fail after partially interpreting the input. Create or use a valid project DEVICE bound to the intended project footprint.

For schematic-to-PCB association, both the device and footprint bindings must resolve to durable project records. Model-binding and model-transform edits are separate from rebuilding a placed PCB footprint.

Public `pcb_PrimitiveComponent.modify` changes placement, layer, lock, and metadata. It does not replace the bound device or footprint and does not rebuild child pads or graphics.

Typed PCB placement does not rebuild a footprint association. Schematic component edits and supported project-library changes have separate adapters; neither implies a PCB ECO was applied. Use a reviewed native ECO for binding changes that lack a typed execution path, never standalone raw execution.

The native `buttomCommand` / `recoverFootprint` handler is an implementation-research lead, not an admitted execution route. Inspecting its source does not authorize private/raw dispatch. Current live rebuilds must use the supported process-bound native dialog/ECO workflow. A future typed adapter needs reviewed handler identity, scoped arguments, journaling, a complete effect model and disposable save/reopen validation before enablement. Whether using that future adapter or the current dialog, compare placed component ID, pad IDs, `UniqueId`, pose, pad nets, every child graphic, model association and the intended project footprint.

## Schematic-to-PCB import

Calling `PCB_Document.importChanges` can request the import dialog and return true. This does not mean any comparison row was applied. Treat the dialog as a `visible-ui-gate`.

For a scoped repair:

1. Compile or otherwise establish the comparison source. If that result is unknown, narrow the allowed rows further.
2. Open the import dialog.
3. Inspect every row.
4. Clear every row and option.
5. Select only the intended device or footprint modification.
6. Keep add, remove, net-update, and unrelated rows off.
7. Keep track-net update options off unless separately requested and verified.
8. Apply once.
9. Audit the exact component and the global component and net inventory.
10. Save, reopen, audit again, and checkpoint.

The comparator associates schematic and PCB components by `UniqueId`. If one intended modification appears as an Add row plus a Remove row, cancel. Repair the UID or binding first.

Never combine unrelated rows for convenience. Preserve PCB-only mechanics, locked objects, and nets outside the requested scope. A UI message such as "Import finished" is not evidence.
