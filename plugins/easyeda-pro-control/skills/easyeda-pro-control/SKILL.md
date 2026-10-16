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
- For supplied-coordinate geometry, query `calculations` and validate with `calculate-validate`. The separate `easyeda_control_calculate` accepts sixteen bounded method subsets on its reviewed new-version tuple. Clipping has stricter orthogonal integer-ring limits; see the API reference before preparing inputs. It needs an authenticated fingerprint but no active design. Restricted mode has no generic design, navigation, native UI or design-recovery tools; disposable opening has its own contract below.
- For mil/mm/inch conversions and bounded environment metadata, query `system`, validate with `system-validate`, then use `easyeda_control_system` with the actual authenticated fingerprint. Read the API reference for rounding, signed zero and version-comparison direction. These methods do not change editor units or establish project/account state.
- For current-version PCB layer metadata, query `pcb-layers`, validate with `pcb-layers-validate`, then use `easyeda_control_pcb_layers` with an explicit project/branch/document/tab target. Read the API reference for native-equivalent execution, raw colors and copper-count semantics. It does not select layers, open a board or certify its physical stackup.
- For current-version selected IDs or unfiltered Line/Arc/Via/Component/Pad IDs, use offline `pcb-identities`/`pcb-identities-validate` then `easyeda_control_pcb_identities`. Positive type lookup remains limited to Line/Arc/Via. Read the API reference for loaded-view membership and bounds; these IDs are not a complete saved-design inventory or editing authority.
- For one project-local symbol's metadata on the current tuple, query `project-symbol`, validate with `project-symbol-validate`, then use `easyeda_control_project_symbol` with an exact active PCB target. Read [the metadata contract](references/api-reference.md#current-project-local-symbol-metadata). The symbol must be absent from the tab registry. This read does not load symbol geometry, contact a cloud library or enable renaming.
- If the project is loaded without editor tabs, use the separate `project-symbol-preflight` discovery and validation request on that same tool. Read [the no-editor contract](references/api-reference.md#symbol-observation-with-no-editor-tabs); do not open a PCB just for this comparison. Caller-supplied expected metadata is not provenance or permission to write.
- To prepare a symbol name/description change from an existing managed checkpoint, use offline `project-symbol-preparation`, `project-symbol-prepare-validate` and `project-symbol-prepare`. Read [checkpoint preparation](references/api-reference.md#checkpoint-bound-symbol-preparation) first. Supply the exact checkpoint path/bytes/hash and project/branch/owner/symbol IDs. This verifies selected-branch records and peer names without accessing the original design; it neither creates a checkpoint nor enables a writer.
- For current-version Line/Arc/Via geometry, Component metadata or Pad placement/hole geometry, use offline `pcb-geometry`/`pcb-geometry-validate` then `easyeda_control_pcb_geometry`. Use `getAll` with empty arguments or `get` with a distinct `primitiveIds` array; explicit IDs still require complete-family validation. `getAllPinsByPrimitiveId` accepts one component `primitiveId` and correlates its native child list with global Pad membership. Read the API reference for units and exact fields. This forward relationship does not verify reverse ownership or schematic pin mapping; raw metadata does not verify part identity. Loaded-view observations do not establish saved records or connectivity.
- For a stopped sixteen-event closed-symbol validation at the fixed marker-read boundary, or a completed closed baseline stopped before its relaunch intent, read [failure-recovery.md](references/failure-recovery.md) and use offline `history`/`history-validate` before `easyeda_control_history`. Its separate exact-prefix actions qualify local historical abandonment only, not generic recovery, restart or replay.
- For current-version disposable PCB opening, read [current-project-opening.md](references/current-project-opening.md), then use offline `project-open`/`project-open-validate` and `easyeda_control_project_open`. It requires an already registered disposable file, checkpoint-member PCB, initially empty editor and this facade's retained ordinary launch. Normal opening can migrate data or automatically Save. Each stage runs once; inspection and observation never replay navigation.
- For disposable startup qualification, use that tool's `baseline-*` actions only after reading [the retained baseline workflow](references/current-project-opening.md#retained-baseline-validation). Keep the same facade alive through close, copy, relaunch and project-only reopening. These actions do not write symbol metadata or enable a writer. Finish with the baseline's own normal-close and termination actions, not the older launch receipt.
- For the current writer's exact history-date controls, read [optional clock preparation](references/current-project-opening.md#optional-current-clock-preparation). `baseline-prepare-clock` belongs before replacement relaunch; `baseline-observe-clock` belongs after project-only opening. Both consume one original attempt and leave writer authority false.
- For explicitly authorized disposable symbol-metadata validation, read [forward/inverse validation](references/current-project-opening.md#disposable-forwardinverse-validation). The separate `validation-*` actions consume that same prepared baseline and can change its sealed symbol name/description, verify persistence, and derive an inverse. They are not a general writer or a substitute for missing live validation. Follow the returned exact phase; do not replay a lost response or restart midway.
- After successful retirement with both snapshots captured, use offline `baseline-analysis`, `baseline-analysis-validate`, then `baseline-analyze` to compare retained files. Read [the analysis limits](references/current-project-opening.md#compare-retained-snapshots). Historical equality and retained clock observations do not establish backend identity, startup completion or writer authority.
- For configured shortcut listings, query `shortcuts`, validate with `shortcuts-validate`, then use `easyeda_control_shortcuts`. Read the API reference for the optional system filter, raw key strings and shortcut-specific scope enums. The result neither presses keys nor proves that a shortcut can execute in the current focus.
- For extension startup investigation, query `extensions`, validate with `extensions-validate`, then use `easyeda_control_extensions`. It observes selected metadata from the initialized user-extension index only. Read the API reference before interpreting it; it cannot establish the database's current account, loaded code, builtin inventory or permission to launch.
- When ordinary startup is within the task, use `easyeda_control_launch` on its supported installation instead of repeatedly asking the user to start EasyEDA. Read the connection reference first. It uses the existing profile, journals one attempt and does not prove isolation, connection or Start Page readiness. Inspect uncertain attempts; never repeat them under a new ID.
- For normal closure of this facade's retained ordinary launch, use its `observe-window` and confirmed `normal-close` actions, then separately `observe-termination`. Read the connection reference first. This avoids foreground input, but never answers Save/Discard, forces exit, repeats close or bypasses quarantine. Lost original handles cannot authorize it.
- After a facade restart loses launch handles, read the connection reference before recovery. An acknowledged launch can use `abandon-supervision`; a reviewed intent-only launch can use `abandon-unknown-launch` from a fresh coordinator, before allocating a runtime. Neither proves termination or clears design quarantine. Presence observation alone does not authorize relaunch.
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
