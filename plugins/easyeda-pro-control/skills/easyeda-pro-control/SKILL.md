---
name: easyeda-pro-control
description: Inspect and audit a live EasyEDA Pro project, create and verify SQLite checkpoints, capture hash-bound evidence, export draft PCB DSN route context, or diagnose an incomplete journal through the EasyEDA Pro Control MCP. Use for live EasyEDA Pro work and bridge startup troubleshooting; not for offline design-file review. The bundled component writer is experimental and runtime-disabled.
---

# EasyEDA Pro control

Use the `easyeda_control_*` facade. It owns one upstream MCP child and the sole EasyEDA bridge connection. Do not start a second bridge owner.

This release supports inspection and evidence, not complete design control. Exact readers and private operations require an admitted connected tuple. A locally built or imported extension is not connection proof. The current private bridge candidate remains `validation-required` until connected evidence is reviewed.

## Choose the path

- For startup or connection trouble, read [connection-and-context.md](references/connection-and-context.md). Local `easyeda_control_discover` works without starting the upstream. Each result identifies its facade route or says `unavailable`; an upstream read-only annotation does not grant facade access.
- For a live audit, follow the sequence below, then read the relevant schematic, geometry, or rules reference.
- For an unsupported edit, explain the missing capability. Do not attempt the disabled writer or substitute unrestricted JavaScript. Read [capability-matrix.md](references/capability-matrix.md) before choosing a native-dialog or new-capability workflow.
- For evidence, checkpoints, or incomplete operations, use the corresponding reference below. Local evidence inspection and journal listing remain available during bridge quarantine.

## Start live work

1. Call `easyeda_control_status`. Require a responsive facade and upstream, an authenticated renderer session, the single-process lease, and the reported runtime fingerprint. A host-level "tool unavailable" is not a facade response. A failed status is not evidence of an authenticated connection. Stop design calls and diagnose that layer first.
2. After status succeeds, call `easyeda_control_context`. Check the actual project UUID and `.eprj2` path, document UUID/type, and tab. Type 15 is a 3D preview, not the PCB editor. Keep the active tab unchanged throughout the operation.
3. If the tuple is `validation-required`, collect only the bounded reviewed public generic reads needed for connected validation. Pass the current expected context and fingerprint. Do not refresh the compatibility manifest merely to make a mismatch pass.
4. For an admitted tuple, use `easyeda_control_exact_read` when the claim needs complete supported fields. It samples twice under one authenticated renderer lease and rejects unequal results. Generic reads remain advisory because before/after checks cannot detect a switch away and back inside an asynchronous handler.
5. For large results, supply fresh managed evidence paths and use `summary` or `receipt-only`. Verify receipts, then page results with `easyeda_control_artifact_read`. If publication stopped after writing a result, use `easyeda_control_evidence_recover` with the same result/receipt pair instead of repeating the EasyEDA call.

The user's request defines authority. Inspection does not authorize editing, saving, discarding unsaved state, or applying an ECO dialog. A UUID, boolean, toast, preview, or unsaved readback is not persistence proof. Durable edits require saved-and-reopened readback and checkpoint proof.

## Field and operation limits

- Exact schematic reads cover component identities, supported associations/properties, pins/bounds, and correlated compiled pin connectivity. The installed wire enumerator hides failures as empty arrays, and `sch_Net` methods are stubs. Do not claim complete wire geometry from them.
- Exact PCB reads cover supported component, direct-pad, primitive, net, rule, and group state. Transformed component pins prove placement and net identity, not drill or land dimensions. Use direct pad records or durable footprint source for geometry.
- Adapter omissions and rounded fields are listed in [compatibility.md](references/compatibility.md) and [capability-matrix.md](references/capability-matrix.md). Do not convert a known adapter defect into a universal unit correction.
- Capture validates PNG bytes and stores hash-bound evidence. Region/full-page capture changes the viewport. Inferred-A4 capture is diagnostic, not page-completeness proof.
- Export supports only draft PCB DSN route context. Its active-context/best-effort result is not manufacturing approval. The public API has no document argument, so an internal tab switch cannot be excluded.

## Disabled writer

`easyeda_control_plan`, `apply`, `verify`, `rollback`, and `save_reopen` retain experimental schemas but refuse production use. `easyeda_control_execute` always refuses and has no environment opt-in. Do not call them to test whether the gate can be bypassed.

The candidate writer models one existing PCB component's pose, layer, or lock. Enabling it requires an explicitly authorized disposable project, connected live/collateral/save-close-reopen/rollback evidence on the exact tuple, an operation-bound semantic database-delta validator, a complete process-tree termination validator, and a deliberate code change supplying all production gates. Never use the user's real design as the writer fixture.

## Ambiguous outcomes

After timeout, disconnect, context/runtime drift, an invariant mismatch, or failed persistence proof, stop without saving or retrying. List `easyeda_control_recover_incomplete` with no operation ID and read [failure-recovery.md](references/failure-recovery.md).

An orphan-risk or unreadable journal quarantines every live bridge path. Do not bypass it. If recovery needs a restart, ask the user to terminate EasyEDA, restart it, and reconnect the bridge. Never choose Save at an unsaved-changes prompt. Discard or force-quit requires explicit authority and valid clean-baseline/no-concurrent-edit assumptions; otherwise preserve the session for manual review.

Pass a fresh operation-bound `runtimeRestartConfirmation` only after the user supplies it in a new message after the authorized restart. Never synthesize, infer, copy from an error, or replay the attestation. The facade also requires old-session closure, a distinct proxying replacement renderer, changed generation/time origin, and proof that the captured execution authority terminated. The attestation alone cannot open the gate. Never overwrite a live project database.

## References

- Setup, startup diagnostics, tool discovery, context, captures: [connection-and-context.md](references/connection-and-context.md)
- Version admission and installed adapter defects: [compatibility.md](references/compatibility.md)
- Capability selection and unsupported operations: [capability-matrix.md](references/capability-matrix.md)
- Schematic identity and connectivity: [schematic.md](references/schematic.md)
- Library assets, devices, and ECO: [libraries-and-eco.md](references/libraries-and-eco.md)
- Placement, units, pads, regions, and 3D: [pcb-geometry.md](references/pcb-geometry.md)
- Rules, stack, routing, and export: [pcb-rules-stack-and-routing.md](references/pcb-rules-stack-and-routing.md)
- Evidence and checkpoints: [persistence-and-checkpoints.md](references/persistence-and-checkpoints.md)
- Experimental state machine: [safety-state-machine.md](references/safety-state-machine.md)
- Ambiguous calls and restart proof: [failure-recovery.md](references/failure-recovery.md)
