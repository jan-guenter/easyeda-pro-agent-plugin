---
name: easyeda-pro-control
description: Inspect and audit a live EasyEDA Pro project, create and verify SQLite checkpoints, capture hash-bound evidence, export draft PCB DSN route context, or safely diagnose an incomplete journal through the EasyEDA Pro Control MCP. Use for live EasyEDA Pro work; do not use for an offline file review that never touches the application. The bundled component writer is experimental and runtime-disabled.
---

# EasyEDA Pro control

Use the `easyeda_control_*` facade. It owns one upstream MCP child and the sole EasyEDA bridge connection. Do not start a second bridge owner.

This release requires the locally built, private mutually authenticated bridge
extension. The marketplace install does not create the HMAC key or import an
extension into EasyEDA. If the MCP cannot start because the bridge token is
absent, or status reports bridge authentication failure, stop live work. From a
trusted plugin checkout, first run `ulimit -c 0` and prove `test "$(ulimit
-c)" = "0"`; then run `npm run bridge:provision` and `npm run bridge:build`.
Import only the content-addressed private `.eext` generation
reported as `outputPath` (under `~/.easyeda-pro-control/bridge-build/`) through
EasyEDA Pro's Extension Manager, then restart the MCP. Never guess with a
wildcard: the fixed `.eext.receipt.json` is the atomic current-generation
pointer, and unreferenced older generations remain credentials. The extension-
facing nonce-bound handshake uses only the fixed gateway at `127.0.0.1:49621`,
never scans adjacent ports, and exposes no remote relay. It never transmits the HMAC key.
The upstream child listens on a separate facade-assigned private
loopback port; its ephemeral backend token is forwarded only after Linux PID/
start-time/socket-inode ownership proof.
Treat both the key
and generated `.eext` as credentials: never print, copy into chat, commit, or
weaken their permissions. A build receipt or import dialog is not connection
proof; require an authenticated session from `easyeda_control_status`. Never
substitute the unauthenticated stock bridge.

The fixed receipt currently identifies bridge build `ded07x99dcxb504`. It is
an unconnected `validation-required` candidate, not a production-live build.
The compatibility manifest deliberately retains the historically connected
dispatcher `d18b6xd531xe6ca`. Status and context may collect connected
validation evidence, and narrowly reviewed public generic reads may proceed
after a bounded smoke test against the candidate's actual fingerprint. Do not
use exact readers or any private operation until connected review deliberately
admits that build in the compatibility manifest.

## Contract

The user's request defines authority. Inspection does not authorize editing. Classify each needed capability with [references/capability-matrix.md](references/capability-matrix.md):

- `public-supported`: declared API plus independent readback;
- `private-version-pinned`: exact reviewed implementation tuple plus narrow proof;
- `visible-ui-gate`: a meaningful native or operating-system dialog still needs review;
- `unsupported`: no controlled path currently proves the result.

Never infer completion from a UUID, boolean, toast, preview, or unsaved state. A durable edit needs saved-and-reopened readback and checkpoint proof.

## Start every live task

1. Call `easyeda_control_status`. For candidate validation, collect the actual live fingerprint and require an authenticated bridge session, the facade lease, upstream process, implementation tree, dependency lock, tool and method catalogs, and installed EasyEDA bundles. A build-ID mismatch marked `validation-required` is an admission blocker, not production compatibility.
2. Call `easyeda_control_context`. Collect and verify the project UUID and `.eprj2` path plus document UUID, type, and tab as candidate-validation evidence. Type 15 is a 3D preview, not a PCB editor.
3. While the fixed receipt still names candidate `ded07x99dcxb504`, use only the bounded, reviewed `easyeda_control_read` or `easyeda_control_read_batch` calls needed for connected validation. Keep the active tab unchanged. These public generic reads are renderer-session-bound, but their before/after context checks cannot detect a switch away and back inside one asynchronous handler, so they are advisory evidence and never mutation proof.
4. Do not call `easyeda_control_exact_read` while the candidate remains `validation-required`. After connected review deliberately updates the manifest to admit the live tuple, exact reads may again supply complete, stable evidence: the facade runs its version-reviewed reader twice, holds one authenticated-renderer lease across both samples and evidence publication, checks exact context at entry and after each run, and rejects unequal samples.
5. Use `easyeda_control_discover` only for local capability discovery. Outside the current candidate-validation workflow, keep `easyeda_control_read` and `easyeda_control_read_batch` advisory or supplementary.
6. Store large results in managed evidence files. If the facade exits after result publication, use `easyeda_control_evidence_recover` to commit the stranded receipt without repeating the EasyEDA call. Results and committed receipts bind both exact paths; copied or cross-paired receipts are rejected. Verify receipts with `easyeda_control_evidence_verify` and page them with `easyeda_control_artifact_read`.

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

Enabling it requires a connected sacrificial-board test against the pinned EasyEDA/bridge/upstream tuple, saved-and-reopened proof, collateral-invariant proof, rollback proof, an operation-bound semantic database-delta validator, a complete EasyEDA process-tree termination validator, and a deliberate code change that supplies all three production gates. A successful unit fixture is not that evidence.

Caller JavaScript is rejected from guarded plans. Standalone `easyeda_control_execute` is structurally disabled in this release with no environment opt-in: an unrestricted timeout cannot be given a complete collateral model or safe orphan journal after arbitrary code has begun.

## Captures and export

Use `easyeda_control_capture` for a canvas, framed region, or schematic-page PNG. It parses the non-interlaced PNG chunk stream, checks CRCs, inflates and validates every scanline, then hashes the image into a receipt. Framing changes the visible viewport but not design data. An inferred-A4 full-page capture is diagnostic, not completeness proof.

`easyeda_control_export` currently emits only PCB DSN route context. It uses exact context checks before and after the public call, one authenticated renderer session, a dedicated private directory, descriptor-bound exclusive file publication, file and parent-directory synchronization, and an inode/hash-bound receipt. If a post-write check fails, any valid created artifact is bound into the failure receipt. The installed `getDsnFile` method has no document argument; a switch away and back inside the same renderer during generation is undetectable, so label the DSN active-context/best-effort. It is never fabrication approval. Other manufacturing exports remain gated.

## Recovery and hard stops

After a timeout, disconnect, ambiguous result, or failed inverse, stop writing. Do not retry. List `easyeda_control_recover_incomplete`. If its summary says `orphanedCallPossible: true`, a delayed call may still be running and recovery needs a destructive human gate. Pause and ask the user to terminate EasyEDA Pro, restart it, and reconnect the bridge. If EasyEDA presents an unsaved-changes prompt, never choose Save: saving could persist the unknown call. The user may choose Don't Save or force-quit only when the journaled clean baseline and no-concurrent-edit assumptions still hold and they explicitly authorize discarding all unsaved state; otherwise they must cancel the close and preserve the session for manual review. The resolving call requires a fresh user-attested `runtimeRestartConfirmation` bound to the operation. Never synthesize, infer, copy from an error, or replay that confirmation yourself; pass it only after the user supplies it in a new message after performing the authorized restart. The facade also requires closure of the exact dispatch-leased authenticated session, a distinct fully proxying replacement session, a changed immutable renderer generation and `performance.timeOrigin`, and same-policy proof that the complete captured EasyEDA execution authority terminated. The confirmation alone cannot open the gate. It cannot prove which choice the user made in a native prompt.

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
