# Libraries and ECO

## Resolve identity before creating

Search by more than one identity where available, such as supplier ID, manufacturer part number, exact name, and direct catalog lookup. Reject a candidate when top-level and nested identities disagree. Search the project library before creating or copying an asset because a prior partial operation may already have added it.

Useful public APIs include library listing, symbol copy, footprint copy, device create or modify, and 3D model lookup. Public library getters return metadata, not live editor geometry. Open the exact symbol or footprint document to inspect its primitives.

When reading native library document history, fold records by their ordering field and remove tombstoned items. The source is an event history, not a ready current-state list.

After creating or modifying an asset:

1. Verify its exact identity in the project library.
2. Save it through a reviewed version-pinned library workflow.
3. Close and reopen its exact library document.
4. Audit geometry, pins or pads, custom properties, model association, and binding IDs.
5. Search again for duplicates.

The guarded operation state machine and its `easyeda_control_save_reopen` phase accept PCB type 3 only. Schematic type 1 and library types 2/4 are rejected. Library persistence remains `private-version-pinned` outside the facade until a safe typed workflow is proven.

## Devices and placed PCB components

PCB component creation is device-driven. Passing a footprint record where the wrapper expects a device can fail after partially interpreting the input. Create or use a valid project DEVICE bound to the intended project footprint.

For schematic-to-PCB association, both the device and footprint bindings must resolve to durable project records. Do not keep a stale 3D model association merely because a populated field looks better. Clear it unless the exact model is proven.

Public `pcb_PrimitiveComponent.modify` changes placement, layer, lock, and metadata. It does not replace the bound device or footprint and does not rebuild child pads or graphics.

The guarded facade deliberately exposes only placement, Top/Bottom layer, and lock for one existing PCB component. It does not expose component metadata or binding changes, even though the underlying public method has a wider patch surface. Schematic and library writers are also rejected. Do not use standalone raw execution to bypass these omissions in production work.

A footprint instance rebuild through native `buttomCommand` and `recoverFootprint` is `private-version-pinned`. Before calling it, prove one handler in the installed implementation. Afterward, compare placed component ID, pad IDs, `UniqueId`, pose, pad nets, every child graphic, model association, and the intended project footprint.

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
