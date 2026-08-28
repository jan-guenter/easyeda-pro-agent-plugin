# Schematic work

Do not use `easyeda_schematic_verify_write` for component proof in the pinned upstream build. Its handler expects an array while the bridge returns `{ total, items }`, so it can report `components_available: false` despite live components. Its name does not make its payload trustworthy.

Use `easyeda_control_exact_read` with `schematic-components` for placed component state. It exposes primitive and unique IDs, normal component/symbol/footprint associations, CBB/project and CBB-symbol UUIDs, pose, BOM/PCB inclusion, sourcing fields, adapter-filtered component `OtherProperty`, and optional pins and bounds. The pinned Component3 mapper removes `3D Model`, title/transform, Channel ID, Group ID, Reuse Block, supplier, and supplierId keys from component `OtherProperty`; it also does not populate pin `OtherProperty` or either CBB `libraryUuid`. Those filtered ownership/property fields are unavailable. The reader is read-only. The guarded mutation state machine does not accept schematic documents.

## Work sheet by sheet

Schematic primitives are sheet-local. Require the target sheet to be active, verify its identity, edit that sheet only, and complete live plus reopened verification before moving to another sheet. Do not collision-scan coordinates from different sheets as if they share one plane. Page borders and title blocks are not electrical obstacles.

For any component edit, capture and verify:

- reference, primitive ID, and `UniqueId`;
- device, symbol, footprint, and source-library identities;
- pose and displayed attributes;
- BOM and PCB inclusion flags;
- every pin number, name, type, net, and native no-connect state;
- the identity and topology of non-target objects required to prove scope.

The guarded state machine admits no schematic writer. In the pinned public mapper, a component modify can clear placed properties that its mapper omits; moves can also report success despite wire-follow failures. Caller-supplied raw apply/rollback is rejected from plans. Treat schematic editing as unsupported until a lossless facade-generated writer, complete collateral reader, inverse model, and connected sacrificial save/reopen proof are added.

## Component and property changes

Public component and device modify calls can clear nonstandard `OtherProperty` fields that the patch omits. The current facade cannot read the complete placed-property map, so do not invoke those calls. A future lossless writer would have to read every field from a more authoritative source, merge only the intended change, pass sourcing fields explicitly, and use null only for an authorized clear.

The following native spellings are historical compatibility evidence for designing such a future facade writer; they are not an admitted workflow and must not be called through raw execution:

```js
const bus = globalThis.SCH?.gVars?.messageBus;
const source = await bus.rpcCall("getAllSymbolMultipartBySchUuid", sheetUuid);
const result = await bus.rpcCall("sch/replaceDevice", payload);
```

A future typed writer would need to build its payload from exactly one current native inventory record, use the real source part ID, and preserve designator, symbol placement, footprint policy, pin topology, and inclusion flags. A copied symbol need not use part `"1"`.

The native handler may copy a catalog item into the project library before it changes the placed symbol. A failed post-audit can therefore leave library state changed. Mark `mutationMayHaveOccurred`. Use Undo only under the conditions in [safety-state-machine.md](safety-state-machine.md).

## Pins and no-connect state

In the baseline public API, passing a component pin object to `sch_PrimitivePin.modify` could do nothing, while a primitive pin ID string worked. The current guarded facade has no exact typed pin writer or complete collateral proof, so neither form is admitted. A future reviewed writer must use one typed argument form and independently prove the result.

If the ID form also fails, a native shape-manager action can be considered `private-version-pinned`. Resolve the exact active native document and exact pin shape. Run one history action, then poll the public pin state. A native no-connect setter may return an object with `done`; await the setter and its completion path. Do not place the upstream `easyeda_schematic_set_pin_no_connect` wrapper in a `public-supported` plan: the installed bridge prefers that private native setter before its public fallback.

Do not add a no-connect marker to silence ERC until the circuit intent says the pin is deliberately unused.

## Symbol graphics

Public graphic creation in a type-2 symbol editor has routed rectangles or polygons through the wrong shape manager in the baseline build. Pins did not share this fault. For affected graphics, use the exact active native symbol document and one history action only after a version guard. Audit the public graphic collection afterward. Never replace the whole document source to add one shape.

## Wires and nets

Build a new net as a connected explicit-vertex tree. Do not rely on visually overlapping stubs. Prove connectivity through netlist membership and pin-net readback.

The exact `schematic-topology` reader compiles component `UniqueId`, designator, pin number, and pin net from `sch_Netlist.getNetlist("JLCEDA")`. It rejects malformed or silently skipped entries and requires an exact identity/count and per-component pin-number-set match against all-page `sch_PrimitiveComponent` reads. In the pinned API bundle, `sch_Net.getAllNets` and `getAllNetsName` are unconditional empty stubs, while `sch_PrimitiveWire.getAll*` catches RPC errors and returns empty arrays. The facade deliberately omits those fields and reports wire geometry unavailable; do not interpret a missing wire inventory as a blank sheet.

For a staged sheet change, create internal nets and source connections before labels or net ports that describe them. Generate fresh evidence after each dependent mutation. A baseline coordinate receipt cannot prove topology after new wires are added.

Check for:

- floating pins and wire ends;
- pins on the wrong named net;
- duplicate or conflicting labels;
- accidental junctions at crossings;
- native no-connect state that contradicts wiring;
- unrelated primitive changes on the sheet.

## ERC

The public schematic DRC call can return aggregate counts without itemized warnings. If the request needs a complete warning disposition, run native ERC and export its report through the visible Save As dialog. This is a `visible-ui-gate`.

Parse the saved report offline. Verify its footer, total counts, and every category. Reject unknown categories. Do not bulk-delete labels or suppress warnings from aggregate counts.

A whole-schematic compiler timeout is an unknown result, not proof that no PCB changes are pending. Restrict later ECO work to exact reviewed rows until pending topology can be proven.
