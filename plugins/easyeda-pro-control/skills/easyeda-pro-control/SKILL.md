---
name: easyeda-pro-control
description: Inspect and edit live EasyEDA Pro through version-pinned typed MCP operations, checkpoints and saved-result verification. Use for schematic, PCB, library and export work, native dialogs, and bridge setup or recovery. Prefer supported APIs; use process-bound native controls for missing APIs. Not for offline design-file review.
---

# EasyEDA Pro control

Use the typed MCP tools for supported design work. Native controls supplement actual API gaps and dialogs; they are not the default editing path. The facade owns one upstream child and the sole authenticated bridge. Never start a competing owner.

This source package has typed design transactions, operation-specific library/export execution, and native Windows control. Installed snapshots may expose older tools. Consult the actual catalog and [capability matrix](references/capability-matrix.md); an implemented descriptor is not proof of a completed live test.

The legacy tuple is `connected-read-admitted`. A `validation-required` mismatch
permits only its bounded public validation workflow; never refresh pins to make
it pass. Separate current-version routes retain their own admission contracts.

After an update, query offline `easyeda_control_api` with
`{"request":{"action":"loaded-facade"}}` before live calls. Its serving PID,
module URL and Node version help detect a stale MCP generation even when skills
have refreshed. An older server may reject the action. The report grants no
runtime admission or native ownership; retain the required process/source checks.

When host tools are missing, read the
[foreground session workflow](references/connection-and-context.md#foreground-mcp-session)
before requesting another restart. If the control lease is free, the maintained
client can target a verified installed package or a trusted frozen build. Admit
its actual serving facade and retain that client through native closure and
release. Record foreground validation separately from Codex-host admission.

Current restriction: compiled schematic topology and transactions depending on
it are disabled because the installed netlist getter can annotate parts and
Save All. Separate sealed profiles retain contracts for stored attribute/text
display changes and identity-preserving wire endpoint rerouting, but are also
blocked by the structure-write restriction below. For their retained scope read
[schematic.md](references/schematic.md#single-page-display-only-transactions)
and its [wire limits](references/schematic.md#single-page-wire-rerouting).
Source tests are not connected lifecycle validation. Several File exports
remain refused for hidden Save All. Inspect the installed capabilities; do not
bypass refusals or replay historical work.

Schematic-page, symbol and PCB design transactions currently refuse because
native Save can schedule an unproved structure-table write. Eight
symbol/page/container metadata writers share that restriction. Typed schemas and historical records
remain discoverable. Read the [current library restriction](references/libraries-and-eco.md#structure-write-completion-restriction)
before editing, creating or renaming those assets; a document-only checkpoint proof
does not cover EasyEDA's delayed structure-table writes.

The separate current-version `easyeda_control_project_symbol_metadata` route
supports a closed, unused project-local symbol with metadata-only raw history
or the bounded canvas-segments history described in its workflow. It changes
name and/or non-null description through a retained-owner,
forward-only lifecycle. Read [the ordinary metadata workflow](references/current-project-opening.md#ordinary-forward-only-symbol-metadata)
before use. Installed101500 passed the disposable META-only round trip;
installed123000 passed the ordinary forward-only route on a disposable fixture.
The ordinary canvas route reserves exactly one write. Installed080000 passed
its disposable case through full SQL, exact saved content and final closure.
Historical evidence does not admit a later runtime or other histories.

## Choose the task

Look up exact methods, coverage and argument schemas with offline
`easyeda_control_api`, then validate the assembled operation before a live call.
Read only the relevant section of [task navigation](references/task-navigation.md)
and its linked operating reference. Start with the user's goal:

| Task | Read first |
| --- | --- |
| Inspect supplied project/library files or compare netlists | [Files, calculations and catalogs](references/task-navigation.md#supplied-files-calculations-and-catalogs) |
| Read loaded project metadata or current PCB objects | [Project and editor readers](references/task-navigation.md#loaded-project-and-editor-readers) |
| Rename a supported container or change unused-symbol metadata | [Scoped metadata changes](references/task-navigation.md#scoped-metadata-changes) |
| Start EasyEDA, connect, close it or inspect an interrupted operation | [Launch, connection and cleanup](references/task-navigation.md#launch-connection-and-cleanup) |
| Develop the extension or validate native startup/cache/renderer behavior | [Extension diagnostics](references/task-navigation.md#extension-diagnostics) |
| Work on an older supported design transaction | [Legacy design navigation](references/task-navigation.md#legacy-design-navigation), then the transaction sequence below |

An extension diagnostic is a separate development task. It does not enable a
refused design operation. For setup trouble, start with
[connection and context](references/connection-and-context.md); use the maintained
launch tool when available instead of repeatedly asking the user to start EasyEDA.

## Edit through typed transactions

Read [safety-state-machine.md](references/safety-state-machine.md) before a design change.
The design sequence below currently applies only to footprint document type 4
under its existing guards. Schematic-page, symbol and PCB schemas remain
inspectable, but their apply, commit, rollback and nonterminal reconciliation
are blocked. Historical sealed profiles are not exceptions.

1. Inspect exact current state. Use `easyeda_control_exact_read` for supported fields and complete native document-source profiles; preserve user locks and all unrelated records. Keep the document/tab quiescent throughout.
2. Submit `easyeda_control_design` with `request.action:"execute"`, a typed `operation`, current `expectedContext`, current `expectedFingerprint` and `confirmWrite:true` for apply, exact proof, save/reopen and durable verification in one request. Use `action:"apply"` instead when the requested workflow needs unsaved review or rollback before a separate commit. Confirmation records task authority; it does not broaden it.
3. An `applied-unsaved` result has exact live-effect proof, not persistence. Commit the returned operation ID explicitly to save/reopen and verify the complete durable project-record delta. Rollback is available only when an exact inverse is supported and the current state still matches. For a failed library reopen, reconciliation can instead return `saved-awaiting-reopen`; commit then reuses the independently verified save and finishes the lifecycle without another Save.
4. `pcb.batch` retains a 1–256-step source contract, but PCB execution is currently blocked. Do not split a refused batch into individual edits or substitute native UI.
5. For libraries, existing-document open or managed exports, request `easyeda_control_library` capabilities first. Read [libraries-and-eco.md](references/libraries-and-eco.md) before editing symbol/footprint geometry, creating a DEVICE or changing a binding or inherited model transform. Use exact project collection IDs for project assets and exact external IDs for existing 3D models. Only execution-enabled entries may run. Saved, reopened, exported and ECO-applied are separate facts.

For itemized ERC/DRC, use `easyeda_control_check` with `request.action:"run"`, `kind:"schematic-erc"` or `"pcb-drc"`, exact context and fingerprint. It journals the calculation scope and proves the full saved SQLite database unchanged without saving. `maxInlineItems` bounds the response; the complete itemized report and enabled-rule policy remain in the returned managed artifact. Both paths passed disposable-fixture checks. Read the relevant schematic/routing reference before interpreting a zero-violation result; current enabled rules are not an all-rules or fabrication approval.

Unsupported source shapes or methods stop before dispatch. Do not replace a refusal with caller JavaScript, an unreviewed API, or a UI action that bypasses quarantine. Source-level bounds and operation-specific live coverage are in the capability matrix.

The legacy writer remains runtime-disabled: `easyeda_control_plan`, `apply`, `verify`, `rollback`, and `save_reopen` are not the typed transaction API. `easyeda_control_execute` always refuses and has no environment opt-in.

## Evidence and recovery

Use managed evidence paths with `summary` or `receipt-only` for large reads, verify receipts, and page results with `easyeda_control_artifact_read`. Exact reads double-sample and reject unstable or truncated output. Generic reads remain advisory. A screenshot, returned ID, boolean or unsaved readback is not durable design proof.

After timeout, disconnect, unexpected source change or failed persistence proof, stop without saving or retrying. Inspect the transaction and read [failure-recovery.md](references/failure-recovery.md). An orphan marker requires retained old-process termination and replacement authenticated-session proof before design reconciliation. Typed recovery uses an operation-bound technical nonce internally; it does not ask the user to repeat a nonce. It never chooses a native prompt response or forces termination. Disposable opening has a separate terminal-only retirement route in [current-project-opening.md](references/current-project-opening.md); it invalidates the attempt without reconciling file contents or granting continuation.

If a Save was attempted, never submit another Save because reconciliation reports
`applied-unsaved`. The durable Save intent remains authoritative across failure,
rebind and restart. Only a supported retained-proof path can finish without Save;
missing or conflicting evidence requires review.

## Task references

- [API reference](references/api-reference.md): SDK declarations, exact schemas and offline argument checks.
- [Native controls](references/native-ui.md): Start Page, window discovery, confirmed input, dialogs and normal close.
- [Compatibility](references/compatibility.md): pinned versions and read adapter limits.
- [Schematic](references/schematic.md): identities and connectivity.
- [Libraries and ECO](references/libraries-and-eco.md): asset binding and native ECO review.
- [PCB geometry](references/pcb-geometry.md): placement, units, pads, regions and 3D.
- [Rules and routing](references/pcb-rules-stack-and-routing.md): constraints, stack and export.
- [Persistence](references/persistence-and-checkpoints.md): managed files and SQLite proof.
