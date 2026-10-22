# Native physical-stack persistence

The reviewed source setter changes live `LAYER` and `LAYER_PHYS` models but does
not upload their changes to EasyEDA's consistency history. Save success does
not repair that omission. The disposable four-layer attempt reverted to its
exact baseline on reopen; its source and complete database were independently
equal to the pre-edit checkpoint. It is not a successful four-layer edit.

## Pinned native contract

`pro-pcb/3.2.149.5378b690/js/pcb.js`, SHA-256
`65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54`:

- `xV.build`, offset 5860562, builds layer models but only creates ordinary item
  history commands. It does not invoke the layer upload helpers.
- `_p` / `yF`, offsets 4754315 / 4754581, increment compiler tickets and upload
  exact `LAYER` / `LAYER_PHYS` records.
- `mfe.applyLayerPhysConfig`, near 9158500, constructs substrate models and calls
  `be.setLayerPhys(rows, true)`. That path uploads physical rows and removes
  retired physical records. It is synchronous.
- `Qfe.getDialog`, near 9240000, constructs `mfe` for command 15 and publishes
  `openDialog`. `fi`'s constructor sets three scalar fields; `mfe` adds only its
  option. Neither constructor registers listeners, timers, preferences or UI.
- `getTabIdAndDocType` returns the native frame's exact tab/type; `FileSource`
  without `useCompilerSave` reads the current models without saving.
- `toggleLayerState` with IDs but no visibility/lock fields invokes `_p` and
  rendering refresh, without changing those fields.
- `getfilterPhyLayers` excludes `SUBSTRATE` records lacking physical rows.
  Physical retirement does not delete their existing durable `LAYER` records.

## Maintained adapter

The generated program locates one same-origin PCB frame by its native tab/type,
requires its complete source to match the journal baseline, and captures one
new native Layer Manager handler. During the synchronous constructor dispatch,
only `TempMaskRightClickMenu` and `openDialog` delivery are intercepted. The
original `publish` property descriptor is restored in `finally`, including on
failure. No dialog opens and no listener or handler is retained after execution.

Only `applyLayerPhysConfig` is invoked. Full `applyConfig`, `updateCanvas`,
preferences, unused-pad cleanup and automatic design changes are not invoked.
The exact resulting physical rows and temporary substrate presentation are
verified as the baseline of a maintained source merge. That merge restores all
requested copper-use and original layer presentation fields. An ID-only native
layer upload persists those exact final layer models. Independent source and
whole-database proofs remain mandatory before reporting completion.

Supported order is the native standard stack: 3,7,5; Top copper; alternating
dielectrics and consecutive inner copper IDs from 15; Bottom; 6,8,4. Copper count
is even. Dielectric IDs start at 361. Explicit `zIndex` must equal native physical
order, not an arbitrary sortable key. No native method is overridden to force a
different order. Disabling a visible copper layer is refused because preserving
`show=true` with `use=false` is not represented by the native layer decoder.

For reduction only, the persistence proof retains exact prior substrate layer
records whose corresponding physical rows were deleted and whose public source
rows are absent. Their full previous body must remain identical. All physical
records, surviving layers, other objects and other documents are still compared
strictly. Raw source and checkpoint hashes are retained; this is not a general
layer-ignore or numeric-normalization rule.

The native layer manager does not provide one reversible ordinary-item history
command. Recovery uses the retained journal/checkpoint and typed inverse. A
partial or failed operation is never retried blindly. Baseline-equivalent
recovery uses the existing no-mutation reconciliation path, without another
save or stack write.

Focused local checks cover canonical stack/inverse effects, exact retired-layer
storage, foreign/duplicate dispatch refusal, and interceptor restoration on
success and failure. Connected save/reopen validation of this repaired route is
still required; mocked tests do not establish native persistence.
