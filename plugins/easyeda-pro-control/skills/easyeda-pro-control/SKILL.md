---
name: easyeda-pro-control
description: Inspect and edit live EasyEDA Pro through version-pinned typed MCP operations, checkpoints and saved-result verification. Use for schematic, PCB, library and export work, native dialogs, and bridge setup or recovery. Prefer supported APIs; use process-bound native controls for missing APIs. Not for offline design-file review.
---

# EasyEDA Pro control

Use the typed MCP tools for supported design work. Native controls supplement actual API gaps and dialogs; they are not the default editing path. The facade owns one upstream child and the sole authenticated bridge. Never start a competing owner.

This source package has typed design transactions, operation-specific library/export execution, and native Windows control. Installed snapshots may expose older tools. Consult the actual catalog and [capability matrix](references/capability-matrix.md); an implemented descriptor is not proof of a completed live test.

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

## Connect and choose a path

- Look up methods and exact operation arguments with offline `easyeda_control_api`; read [api-reference.md](references/api-reference.md). Its latest SDK snapshot is documentation, not execution authority. Validate assembled operations offline before a live preflight.
- For supplied-coordinate geometry, query `calculations` and validate with `calculate-validate`. The separate `easyeda_control_calculate` accepts sixteen bounded method subsets on its reviewed new-version tuple. Clipping has stricter orthogonal integer-ring limits; see the API reference before preparing inputs. It needs an authenticated fingerprint but no active design. Calculation-only mode has no design, navigation, native UI or design-recovery tools; see the connection reference before setup.
- For mil/mm/inch conversions and bounded environment metadata, query `system`, validate with `system-validate`, then use `easyeda_control_system` with the actual authenticated fingerprint. Read the API reference for rounding, signed zero and version-comparison direction. These methods do not change editor units or establish project/account state.
- For current-version PCB layer metadata, query `pcb-layers`, validate with `pcb-layers-validate`, then use `easyeda_control_pcb_layers` with an explicit project/branch/document/tab target. Read the API reference for native-equivalent execution, raw colors and copper-count semantics. It does not select layers, open a board or certify its physical stackup.
- For configured shortcut listings, query `shortcuts`, validate with `shortcuts-validate`, then use `easyeda_control_shortcuts`. Read the API reference for the optional system filter, raw key strings and shortcut-specific scope enums. The result neither presses keys nor proves that a shortcut can execute in the current focus.
- For extension startup investigation, query `extensions`, validate with `extensions-validate`, then use `easyeda_control_extensions`. It observes selected metadata from the initialized user-extension index only. Read the API reference before interpreting it; it cannot establish the database's current account, loaded code, builtin inventory or permission to launch.
- When ordinary startup is within the task, use `easyeda_control_launch` on its supported installation instead of repeatedly asking the user to start EasyEDA. Read the connection reference first. It uses the existing profile, journals one attempt and does not prove isolation, connection or Start Page readiness. Inspect uncertain attempts; never repeat them under a new ID.
- After a facade restart loses launch handles, `launch` action `observe-application` can sample process presence but cannot authorize relaunch. For a successful historical launch, explicit `abandon-supervision` can relinquish that ordinary-startup blocker without proving termination. Read the connection reference before recovery; ambiguous launches and design quarantine remain blocked.
- Use `easyeda_control_editor_shell` for authenticated, privacy-limited tab counts and registered Start Page flags on the current reviewed UI. It does not prove window visibility, completed restoration or project closure, and does not authorize navigation.
- Use `easyeda_control_editor_context` when only active-document and current-project/branch identity is needed on the current tuple. Read the connection reference first: unsupported tabs and missing fields are explicit, and this result cannot replace legacy transaction context or authorize a later operation.
- Use its `coverage` action to distinguish direct SDK calls, narrower native task equivalents, lifecycle-only calls and omissions. `easyeda_control_sdk_read` exposes fixed typed local getters and calculations. Matching samples are public SDK observations, not complete native design or persistence proof.
- For setup, missing tools or connection trouble, read [connection-and-context.md](references/connection-and-context.md). The bundled portable launcher loads a private machine profile. The checkout-only foreground client uses the same facade when no other owner is running.
- For API edits, inspect `easyeda_control_runtime`. Editing requires EasyEDA launched by `launch-contained`, with retained Windows Job and authenticated process proof. An ordinary PID or a newly connected renderer is not that proof.
- From Start Page, establish authenticated status and use runtime `open-existing` for an exact saved PCB or schematic-page target; see the connection reference. An unfinished design or library journal uses its own `open-target` recovery instead.
- When sibling editor tabs are already open, use supported library `document.open`, not exclusive Start Page `open-existing`. Successful navigation can precede editor readiness; observe fresh exact context without repeating the open.
- Before navigation or Save/reopen, read [navigation side effects](references/native-ui.md#navigation-preference-side-effects). PCB/footprint tab changes can write global preferences and prune local backups. A native tree click is not a workaround; do not change settings to pass admission.
- If the user started EasyEDA separately, use `easyeda_control_native_ui` discover, retain its observed-unowned `appBinding`, then inspect windows. A confirmed normal-close may request closure before a contained launch. Read [native-ui.md](references/native-ui.md); do not choose Save or Discard for unrelated work.
- Before bridge design calls, require responsive authenticated `easyeda_control_status`, then `easyeda_control_context` with the actual project path/UUID, document UUID/type and tab. Type 15 is a 3D preview, not PCB.
- The reviewed tuple is connected-read-admitted. A `validation-required` mismatch permits only the bounded public validation workflow; never refresh pins merely to make it pass.

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

After timeout, disconnect, unexpected source change or failed persistence proof, stop without saving or retrying. Inspect the transaction and read [failure-recovery.md](references/failure-recovery.md). An orphan marker requires retained old-process termination and replacement authenticated-session proof before reconciliation. Typed recovery uses an operation-bound technical nonce internally; it does not ask the user to repeat a nonce. It never chooses a native prompt response or forces termination.

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
