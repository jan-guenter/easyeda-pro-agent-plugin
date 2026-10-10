# Libraries and ECO

## Resolve identity before creating

Search by more than one identity where available, such as supplier ID, manufacturer part number, exact name, and direct catalog lookup. Reject a candidate when top-level and nested identities disagree. Search the project library before creating or copying an asset because a prior partial operation may already have added it.

Useful public APIs include library listing, symbol copy, footprint copy, device create or modify, and 3D model lookup. Public library getters return metadata, not live editor geometry. Open the exact symbol or footprint document to inspect its primitives.

When reading native library document history, fold records by their ordering field and remove tombstoned items. The source is an event history, not a ready current-state list.

## Choose the execution path

Query `easyeda_control_library` with `{request:{action:"capabilities"}}`. A catalog descriptor is not execution support. Metadata reads, DEVICE writes, geometry edits and exports have separate proof paths.

For symbol or footprint geometry, open the exact project library member and use its supported `easyeda_control_design` operation. Commit saves and reopens that editor, then verifies the complete selected-branch project-record delta. The legacy `easyeda_control_save_reopen` endpoint remains disabled.

The pinned footprint editor exports a `PCB` DOCHEAD, while its saved library record is `FOOTPRINT`. Keep that raw header and hash; the executor binds library identity through editor type 4, project/owner/UUID and the complete checkpoint. New footprint geometry omits the PCB-only `partitionId` in both native export and storage. Do not rewrite headers or infer editor type from source alone.

Footprint geometry now uses the installed native history handlers, not full-source decode. The earlier decoder failed after a partial in-memory edit and did not establish durable line creation. A later public LINE test exposed a separate delayed project-worker write: the immediate checkpoint lacked the line, while later checkpoints proved both creation and the subsequent inverse reached storage. A decoder error, public acknowledgment and immediate checkpoint must not be conflated. LINE create/delete use public APIs; modification explicitly awaits the object's `done()` because the SDK wrapper drops that Promise. ARC, POLY, FILL and STRING use fixed, exact-frame history calls. Modifiers correlate native getter values with complete source and preserve unrequested native precision. Created identities come from the native reply and enter the journal before proof.

Geometry modifications preserve identity and layer. Use explicit delete/create for POLY/FILL shape replacement and graphic-arc angle/mode changes. FILL supports solid mode and one-contour modification; slot regions and default-font reverse changes are refused. Text creation compensates for the native expansion-unit mismatch. PAD create uses canonical numeric pins, simple lands and default mask/thermal settings; its property adapter supports explicit zero values and custom settings without the lossy SDK round trip. Native pad property edits may update in-memory default-pad tool settings, as the UI does. That is an explicit tool-setting effect, not an exception to exact project-source or SQLite invariants.

Native PAD history writes the complete target record. A legacy standalone SMD pad may therefore lose inactive drill offsets/angle, gain missing empty attribute/inner-layer defaults, and encode its shared paste expansion to the native four-decimal format. Before editing, the facade proves each such conversion from that pad's saved body and reports the raw hashes and field differences. Every other field and every untouched pad remains strict. Unequal stored top/bottom paste values are refused because the native model shares one value. A pad requiring this legacy conversion has no advertised exact inverse; native editing cannot reconstruct the original inactive fields or missing defaults.

Public history edits do not assume the decoder's empty-net selector correction. The older failed transaction's exact default-NET/selector bookkeeping remains a separate recovery/persistence proof, with raw hashes retained. Commit calls the selected frame's compiler save after another complete source check, without decoding again, then awaits native scheduled-upload completion before checkpointing and closing. This wait is not another Save or forced upload; full source and durable project-record proofs still decide success. The footprint LINE path passed save/reopen and complete 14-document proof. Other history adapters have focused offline tests; their live coverage is reported separately.

Symbol opening and reopening use `lib_Symbol.openInEditor`: the pinned `dmt_EditorControl.openLibraryDocument` symbol branch can leave its Deferred unresolved or miss `tabChange`. The supported route still requires exact project membership, returned-tab activation and independent context proof. A timed-out open is ambiguous; recover the existing journal instead of retrying it.

Symbol source edits may materialize one previously unexported null `Symbol` attribute on their existing PART. The exact-effect proof checks its complete body and records its native identity; it does not omit the row from hashes. Such a baseline has no advertised exact inverse. Symbol durable proof separately reports only source-bound legacy empty-group/version removal and empty-parent-to-PART conversion, plus a baseline-proved user-stamp insertion. Every other record and document remains invariant. These encoding rules do not authorize a delayed change from another transaction; recover that with its own retained evidence.

Activation is called once. A false boolean is accepted only when fresh project, document, type, tab and library-owner readback proves the requested target is active. A missing or malformed acknowledgment, or any context mismatch, remains a failure.

Supported DEVICE writes use `easyeda_control_library` with `request.action:"execute"`, the typed operation, fresh `expectedContext` and `expectedFingerprint`, and `confirmWrite:true`. They journal the plan before dispatch and verify the durable project-record delta afterward. A successful result reports `saved:true,reopened:false`; it is not reopened geometry proof. Do not open an unrelated editor to manufacture that claim.

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
