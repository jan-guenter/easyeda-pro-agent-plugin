---
name: easyeda-pro-control
description: Inspect and audit a live EasyEDA Pro project, create and verify SQLite checkpoints, capture hash-bound evidence, export draft PCB DSN route context, or safely diagnose an incomplete journal through the EasyEDA Pro Control MCP. Use for live EasyEDA Pro work; do not use for an offline file review that never touches the application. The bundled component writer is experimental and runtime-disabled.
---

# EasyEDA Pro control

Use the `easyeda_control_*` facade. It owns one upstream MCP child and the sole EasyEDA bridge connection. Do not start a second bridge owner.

## Contract

The user's request defines authority. Inspection does not authorize editing. Classify each needed capability with [references/capability-matrix.md](references/capability-matrix.md):

- `public-supported`: declared API plus independent readback;
- `private-version-pinned`: exact reviewed implementation tuple plus narrow proof;
- `visible-ui-gate`: a meaningful native or operating-system dialog still needs review;
- `unsupported`: no controlled path currently proves the result.

Never infer completion from a UUID, boolean, toast, preview, or unsaved state. A durable edit needs saved-and-reopened readback and checkpoint proof.

## Start every live task

1. Call `easyeda_control_status`. Require the facade lease, operation-bound reviewed-manifest digest, upstream process, bridge, implementation tree, dependency lock, tool and method catalogs, installed EasyEDA bundles, and `upstreamImplementationDrift: false`.
2. Call `easyeda_control_context`. Match the exact project UUID and `.eprj2` path plus document UUID, type, and tab. Type 15 is a 3D preview, not a PCB editor.
3. Use `easyeda_control_exact_read` for evidence that must be complete and stable. The facade runs its version-reviewed reader twice, checks exact context at entry and after each run, and rejects unequal samples. Keep the active tab unchanged during the calls; a switch away and back is not detectable.
4. Use `easyeda_control_discover`, `easyeda_control_read`, or `easyeda_control_read_batch` only for advisory or supplementary queries. Their before/after context checks do not bind an asynchronous upstream call to the tab throughout the call, so they are not mutation proof.
5. Store large results in managed evidence files. Verify receipts with `easyeda_control_evidence_verify` and page them with `easyeda_control_artifact_read`.

If status or any other live call reports bridge quarantine, stop and call `easyeda_control_recover_incomplete` with no operation ID. While an orphan-risk or unreadable journal exists, the facade blocks live status, context, exact/generic reads, captures, exports, checkpoints, and every write. Only local capability discovery, managed artifact/evidence inspection, and the nonce-bound recovery path remain available.

## Exact read coverage

`easyeda_control_exact_read` supports:

- schematic components, normal associations, CBB/project and symbol UUIDs, adapter-filtered properties, pins, and bounds; the installed Component3 mapper removes `3D Model`, title/transform, Channel ID, Group ID, Reuse Block, supplier, and supplierId property keys, omits pin `OtherProperty`, and omits CBB `libraryUuid` ownership, so those fields are not claimed;
- compiled schematic pin connectivity from `sch_Netlist.getNetlist("JLCEDA")`, accepted only when it exactly correlates to all-page `part` component identities and public pin-number sets;
- PCB components, transformed pin centers/nets, and bounds;
- PCB primitive inventory, with explicit supported state for physical pads, vias, tracks, regions, pours, derived poured fill pieces, and fills; component-pad summaries correlate to the direct pad records and poured state correlates to parent pours instead of being double-counted; region rule types and fill modes are omitted because the pinned adapter drops `NO_VIAS` and hardcodes `fillMode`; arc coordinates/angles and via radii are adapter-normalized to one decimal before exposure and are not raw persisted precision;
- PCB rule, net-class, differential-pair, equal-length, pad-pair, and net-name inventories.

The installed `sch_Net` methods are empty stubs, and the installed wire enumerator hides failures as empty arrays. The topology reader therefore does not claim complete schematic wire geometry. The transformed PCB component-pin wrapper is authority only for transformed placement and net identity; it is not authority for drill or land geometry. Use direct pad primitives or the durable footprint source for those dimensions.

## Experimental mutation engine: runtime-disabled

The release server intentionally constructs the engine without its private-writer validation flag. `easyeda_control_plan` therefore refuses before it creates a checkpoint, closes a document, or dispatches a mutation. Do not call `easyeda_control_plan`, `easyeda_control_apply`, `easyeda_control_verify`, `easyeda_control_rollback`, or `easyeda_control_save_reopen` in production. Their schemas, journal engine, inverse model, and tests are retained as a candidate capability, not an enabled promise.

The candidate engine accepts exactly one existing type-3 PCB component and only top-level `x`, `y`, `rotation`, `layer` (Top/Bottom), or `primitiveLock`. Bounds and transformed pins are declared consequences, never writer inputs. It uses exact phase readers, a clean-baseline reopen, optimistic preconditions, durable journals, rollback, and saved/reopened SQLite proof. This narrow design remains useful for review and future validation, but it is not available for design work in this release.

Enabling it requires a connected sacrificial-board test against the pinned EasyEDA/bridge/upstream tuple, saved-and-reopened proof, collateral-invariant proof, rollback proof, and a deliberate code change that supplies the validation flag. A successful unit fixture is not that evidence.

Caller JavaScript is rejected from guarded plans. Standalone `easyeda_control_execute` is structurally disabled in this release with no environment opt-in: an unrestricted timeout cannot be given a complete collateral model or safe orphan journal after arbitrary code has begun.

## Captures and export

Use `easyeda_control_capture` for a canvas, framed region, or schematic-page PNG. It parses the non-interlaced PNG chunk stream, checks CRCs, inflates and validates every scanline, then hashes the image into a receipt. Framing changes the visible viewport but not design data. An inferred-A4 full-page capture is diagnostic, not completeness proof.

`easyeda_control_export` currently emits only PCB DSN route context. It uses exact context checks before and after the public call, a fresh private directory, exclusive file creation, file and parent-directory synchronization, and a hash-bound receipt. If a post-write check fails, any valid created artifact is hash-bound into the failure receipt. The installed `getDsnFile` method has no document argument; a switch away and back during generation is undetectable, so label the DSN active-context/best-effort. It is never fabrication approval. Other manufacturing exports remain gated.

## Recovery and hard stops

After a timeout, disconnect, ambiguous result, or failed inverse, stop writing. Do not retry. List `easyeda_control_recover_incomplete`. If its summary says `orphanedCallPossible: true`, a delayed call may still be running and recovery needs a destructive human gate. Pause and ask the user to terminate EasyEDA Pro, restart it, and reconnect the bridge. If EasyEDA presents an unsaved-changes prompt, never choose Save: saving could persist the unknown call. The user may choose Don't Save or force-quit only when the journaled clean baseline and no-concurrent-edit assumptions still hold and they explicitly authorize discarding all unsaved state; otherwise they must cancel the close and preserve the session for manual review. The resolving call requires a fresh user-attested `runtimeRestartConfirmation` bound to the operation. Never synthesize, infer, copy from an error, or replay that confirmation yourself; pass it only after the user supplies it in a new message after performing the authorized restart. The facade records the attestation but cannot independently prove process generation.

Only after that boundary may recovery verify the pre-checkpoint and read fresh exact state. A one-component state must classify as exact before, exact after, or other; `other` requires manual review.

Stop without saving when identity, tab, version, target, or checkpoint differs; an expected field is absent; an unrelated invariant changes; rollback cannot prove baseline; a native dialog carries design meaning; or an operation is in an unknown or failed persistence state. Never overwrite a live project database while EasyEDA is open.

## Reference router

- State transitions, assertions, and rollback: [references/safety-state-machine.md](references/safety-state-machine.md)
- Bridge, context, generic reads, raw development, and captures: [references/connection-and-context.md](references/connection-and-context.md)
- Version tuple and private-call rules: [references/compatibility.md](references/compatibility.md)
- Schematic reads and limitations: [references/schematic.md](references/schematic.md)
- Libraries, devices, and ECO: [references/libraries-and-eco.md](references/libraries-and-eco.md)
- Placement, units, pads, regions, and 3D: [references/pcb-geometry.md](references/pcb-geometry.md)
- Rules, stack, routing, and export: [references/pcb-rules-stack-and-routing.md](references/pcb-rules-stack-and-routing.md)
- Durable evidence and checkpoints: [references/persistence-and-checkpoints.md](references/persistence-and-checkpoints.md)
- Ambiguous outcomes: [references/failure-recovery.md](references/failure-recovery.md)
