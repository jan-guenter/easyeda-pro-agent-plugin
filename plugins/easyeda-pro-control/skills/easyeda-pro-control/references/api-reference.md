# Offline API and operation reference

Use `easyeda_control_api` before guessing a method, argument name, unit or nested
operation shape. It does not start the bridge, invoke EasyEDA or change journals.
Catalog options belong inside `request.query`, not directly inside `request`.
For example, inspect one geometry method with
`request:{action:"pcb-geometry",query:{method:"eda.pcb_PrimitiveAttribute.getAll",includeSchemas:true}}`.
Validate its assembled inner request with
`request:{action:"pcb-geometry-validate",query:{request:operation}}`.
Filter by one method when possible; unfiltered schema catalogs can be large.

Its request actions separate documentation from execution:

```json
{"request":{"action":"sdk","query":{"reference":"reviewed-installed","namespace":"sch_PrimitiveComponent","limit":25,"detail":true}}}
```

`sdk` searches the mounted `eda` namespaces and method/type declarations. The
reviewed snapshot has 93 namespaces and 749 signatures. `official-latest` has
99 namespaces and 806 signatures, from official declaration package 0.4.26.
Every response includes the exact package version, source digest and provenance.
Use `kind:"types"` to look up parameter interfaces/enums; type searches do not
take a namespace filter. Page with returned `nextOffset`, never infer that a
short first page is the complete catalog.

These are declaration snapshots, not runtime probing. Every SDK entry is marked
non-executable. Latest methods can be missing, stubbed or differently implemented
in the installed application. A method name that appears harmless can mutate
cache, UI, calculation or storage. Do not turn catalog entries into raw scripts,
private calls, compatibility changes or newly granted permission.

## Choose the task reference

After offline discovery, read only the reference for the operation you will use:

- [Current PCB readers](current-pcb-readers.md): project metadata without an editor, layers, IDs, geometry, raw text and component pads.
- [Current schematic metadata](current-schematic-readers.md): container names and observed child rosters without opening a sheet.
- [Current symbol metadata](current-symbol-readers.md): metadata observation and checkpoint preparation.
- [Current utility readers](current-utility-readers.md): geometry calculations, units, shortcuts and extension metadata.
- [Legacy SDK readers](legacy-sdk-readers.md): older-tuple schematic, PCB and library read contracts.
- [Current project opening](current-project-opening.md): retained startup, metadata writing and closure workflows.
- [Native diagnostic validation](current-pcb-diagnostic-validation.md): separate existing-profile launch, bounded target/frame/script observation and original-owner cleanup, without CAD execution.
- [String precreate validation](current-pcb-string-precreate-validation.md): separate launch-sealed combined PCB/worker observations on a disposable project, without create or Save.
- [Schematic rename lifecycles](current-schematic-rename.md): distinct ordinary and disposable SCH-container title workflows, exact phase acknowledgments and historical connected scope.

The legacy links below retain their anchors and route to these contracts. Do not
read an unrelated runtime's contract as permission to use its adapters.

## Per-method coverage and omissions

```json
{"request":{"action":"coverage","query":{"namespace":"sch_PrimitiveWire","detail":true,"limit":25}}}
```

Coverage uses distinct mounted method paths, not overload counts. Every method
in either pinned snapshot has a row. A row can name a direct public call, a
narrower native task equivalent, an internal lifecycle dependency, or a concrete
omission with the evidence and work required to support it. A native equivalent
does not prove the public wrapper works. An internal Save call is not a new
standalone Save capability. Follow the returned route and its exact scope.

Use the coverage response's summary for current method and route counts.
They are implementation classifications, not connected validation counts;
one method can have several routes. Do not add route counts to method counts.

For current-version disposable project/PCB opening, query `project-open` with
`includeSchemas:true` and validate with `project-open-validate`. Read
[the opening guide](current-project-opening.md) before invoking the live tool.
Its two public open methods accept ordinary writable application effects;
they do not inherit the legacy lifecycle's unchanged-storage guarantee.

An omission marked as needing a scoped adapter is remaining implementation work,
not a claim that the method is impossible. Newer-only declarations require a
reviewed installed implementation. Known native stubs must not return fabricated
empty success. Current live validation is tracked separately from historical
proofs and offline contract tests.

The October source audit disabled `schematic-topology`: its netlist exporter
can annotate designators/Unique IDs and invoke Save All. Dependent schematic
transactions must stop at that proof requirement. Schematic netlist/BOM/document
and PCB netlist/BOM/PDF exports are also refused for hidden Save All. Simulation
export needs an unsupported NGSPICE editor. A File-returning method is not
necessarily read-only; never bypass these refusals with another dispatcher.

The separate exact-read kind `schematic-flat-topology` is a restricted diagnostic
replacement, not permission to resume those transactions. Its current profile
requires at most 16 already-loaded ordinary pages with single-part components,
literal named orthogonal wires, and both default net naming and inter-page name
connection enabled. It rejects hierarchy, ports/flags, buses, standalone net
labels, multipart parts, images, unknown serializers and unsplit contacts.
Page membership comes from a fresh verified complete-project checkpoint and
matching public declarations; native endpoint sets and serialized source must
agree in two observations. The escaped response remains bounded to 4 MiB.
It never opens pages, compiles a netlist or saves. The result explicitly reports
`transactionTopology:false` and does not claim connected validation. Use its
specific refusal to identify unsupported input; do not substitute cached nets.

## Ordinary startup and editor-observation schemas

Ordinary startup and editor-shell observation also have offline schemas. Query
`launch`, `editor-shell` or `editor-context` with `query:{"includeSchemas":true}`, then use
the corresponding `launch-validate`, `editor-shell-validate` or
`editor-context-validate` with `query:{"request":...}`.
Validation does not launch or authorize anything. The launcher accepts only
fixed launch/inspect/observe-window/normal-close/observe-application/observe-termination/abandon-supervision/abandon-unknown-launch requests. Window observation and normal closure require this facade's retained original launch and its inspected `expectedLaunchedSha256`. Closure additionally takes the observed `hwnd` and `confirmNormalClose:true`; it consumes one durable attempt and never selects a prompt response. See the connection reference for exit verification. For
read-only presence after restart, validate
`{"action":"observe-application","operationId":"<original-operation-id>"}`.
It requires an existing journal and accepts no PID, executable or replacement
identity. This is not termination reconciliation. Explicit `abandon-supervision`
additionally requires the inspected `expectedLaunchedSha256`,
`confirmAbandonSupervision:true` and `acceptUnobservedDescendants:true`.
It appends a separate relinquishment receipt; it never proves original process
termination or grants design authority. Read the connection workflow before use.
For a reviewed intent-only launch, `abandon-unknown-launch` instead takes the
inspected `expectedIntentSha256`, `confirmAbandonUnknownLaunch:true` and
`acceptUnobservedDescendants:true`. It must run before this coordinator allocates
a runtime. Other PowerShell or EasyEDA processes block it; do not terminate
unrelated processes to pass the check. Neither abandonment action reuses the old ID.
The editor observer accepts only
`{"action":"observe-editor-shell"}` or, for identity metadata,
`{"action":"observe-editor-context"}`. Their lifecycle and interpretation limits
are in [connection and context](connection-and-context.md#ordinary-application-startup-on-the-current-tuple).
These are not newly covered public SDK methods, so the distinct-method inventory
above does not increase.

## Native diagnostic validation schemas

Query `pcb-diagnostic-validation` with `query:{"includeSchemas":true}` and
validate with `pcb-diagnostic-validation-validate` and `query:{"request":...}`.
The separate `easyeda_control_pcb_diagnostic_validation` tool uses a retained
native owner, not ordinary-launch or authenticated bridge authority. Its fixed
stages discover browser targets, inspect an actual frame tree and verify one
compiled UI/PCB/public-API script family in the selected default context.
No caller code, protocol method, URL or source hash is accepted. Read
[the diagnostic workflow](current-pcb-diagnostic-validation.md) before launch
or cleanup. It is validation-only existing-profile startup, not isolated,
guaranteed project-free or connected-validated. It adds no public SDK method
coverage and enables no CAD writer.

For the separate combined PCB/worker path, query
`pcb-string-precreate-validation` and validate with
`pcb-string-precreate-validation-validate`. The tool is
`easyeda_control_pcb_string_precreate_validation`; operation IDs begin
`string-precreate-`. Its fixed purpose is not a mode of an existing diagnostic
owner. Read [the String sequence](current-pcb-string-precreate-validation.md)
before launch. Its optional `observe-common-baseline` stage consumes the original
pre-open SQL reader and five fixed replies; it accepts no caller observation.
Only an explicitly retained comparison refusal with successful context/cleanup
checks and completed publication permits continuing to the independent precreate
read. Other failures require normal cleanup. Two matching sweeps do not establish complete live source,
publication, saved state or writer eligibility.

## Omitted system-library component lookup

`eda.lib_Device.getByLcscIds` remains discovery-only. On the reviewed current
desktop implementation, a network-disabled request can fall through to the local
device-update router. During concurrent library refresh, even the fixed system
library can temporarily resolve to a physical database and trigger initialization
or migration. A renderer mode/network check cannot atomically prevent this path.
Do not expose it as a read-only catalogue query. Supporting it needs a reviewed
remote-only route or a separately scoped library-effects contract. Its vendor
handler also maps failed service responses to empty arrays, so missing results
cannot prove that a part does not exist.

## Supplied-coordinate calculations on the new tuple

Read [supplied-coordinate calculations on the new tuple](current-utility-readers.md#supplied-coordinate-calculations-on-the-new-tuple)
before using this route. Its exact arguments, fields, units, bounds and evidence
limits live in that task-specific reference.

## Local environment and unit methods

Read [local environment and unit methods](current-utility-readers.md#local-environment-and-unit-methods)
before using this route. Its exact arguments, fields, units, bounds and evidence
limits live in that task-specific reference.

## Project-local PCB metadata without an editor

Query `project-pcb` or validate an exact request with `project-pcb-validate`.
Read [the no-editor PCB contract](current-pcb-readers.md#project-local-pcb-metadata-without-an-editor)
before calling `easyeda_control_project_pcb`. This metadata observation neither
opens the PCB nor qualifies a rename or saved-state claim.

For a read-only comparison before a proposed rename, query
`project-pcb-preflight` and validate with `project-pcb-preflight-validate`.
Read [the preflight contract](current-pcb-readers.md#read-only-rename-preflight)
for exact expected metadata, complete native peer observations and title
availability. It uses the same live tool but supplies no writer authority.

## PCB identities on the current tuple

Read [pcb identities on the current tuple](current-pcb-readers.md#pcb-identities-on-the-current-tuple)
before using this route. Its exact arguments, fields, units, bounds and evidence
limits live in that task-specific reference.

## PCB geometry on the current tuple

Read [pcb geometry on the current tuple](current-pcb-readers.md#pcb-geometry-on-the-current-tuple)
before using this route. Its exact arguments, fields, units, bounds and evidence
limits live in that task-specific reference.

### Component child-pad membership

Read [component child-pad membership](current-pcb-readers.md#component-child-pad-membership)
before using this route. Its exact arguments, fields, units, bounds and evidence
limits live in that task-specific reference.

## Ordinary schematic-container title operation

Discover `project-schematic-operation` and validate the exact inner request with
`project-schematic-operation-validate` before calling
`easyeda_control_project_schematic_rename`. Read [the ordinary project
workflow](current-schematic-rename.md#ordinary-project-route) first. It supports
one title-only forward change under sealed pre-navigation startup, original-owner,
clock and complete closed/reopened/final-SQL guards. Legacy
`confirmDisposableProject:true` at open is optional; omission stays omitted and
`false` refuses. The separate disposable route still requires its confirmations.

Discovery reports `ordinaryProjectsSupported:true`, `validationOnly:false` and
`historicalConnectedValidation:"installed203733-ordinary-schematic-title-only-lifecycle"`.
That completed disposable-fixture case does not grant current admission:
`connectedValidation` and `executionAuthorized` stay false. Sheet rename,
circuit edits, explicit Save, inverse and generic schematic writers are excluded.

## Current project-local symbol metadata

Read [current project-local symbol metadata](current-symbol-readers.md#current-project-local-symbol-metadata)
before using this route. Its exact arguments, fields, units, bounds and evidence
limits live in that task-specific reference.

### Ordinary symbol metadata operation

Read [ordinary symbol metadata operation](current-symbol-readers.md#ordinary-symbol-metadata-operation)
before using this route. Its exact arguments, fields, units, bounds and evidence
limits live in that task-specific reference.

### Symbol observation with no editor tabs

Read [symbol observation with no editor tabs](current-symbol-readers.md#symbol-observation-with-no-editor-tabs)
before using this route. Its exact arguments, fields, units, bounds and evidence
limits live in that task-specific reference.

### Checkpoint-bound symbol preparation

Read [checkpoint-bound symbol preparation](current-symbol-readers.md#checkpoint-bound-symbol-preparation)
before using this route. Its exact arguments, fields, units, bounds and evidence
limits live in that task-specific reference.

### Retained baseline comparison

Read [retained baseline comparison](current-symbol-readers.md#retained-baseline-comparison)
before using this route. Its exact arguments, fields, units, bounds and evidence
limits live in that task-specific reference.

## Local historical abandonment

Query `history` with `includeSchemas:true`, then validate the request using
`history-validate` before calling `easyeda_control_history`. Each action takes
the original `operationId` and an exact confirmation string:

- `abandon-before-navigation` takes
  `confirmation:"<operationId>:abandoned-before-navigation"` for the maintained
  sixteen-event validation marker-read boundary.
- `abandon-baseline-before-relaunch` additionally requires
  `confirmDisposableProject:true` and
  `confirmation:"<operationId>:abandoned-before-relaunch"`. It accepts only the
  seven-phase closed baseline stopped before a durable relaunch intent.

These strings check argument consistency, not human restart attestation.
Both actions publish exclusive historical sidecars without bridge/runtime
calls or original-journal rewrites. The second verifies retained copies only,
not the current source or process. Read [failure recovery](failure-recovery.md)
for the exact evidence boundaries. Neither permits replay or generic recovery.

## PCB layer metadata on the current tuple

Read [pcb layer metadata on the current tuple](current-pcb-readers.md#pcb-layer-metadata-on-the-current-tuple)
before using this route. Its exact arguments, fields, units, bounds and evidence
limits live in that task-specific reference.

## Configured shortcut listing on the current tuple

Read [configured shortcut listing on the current tuple](current-utility-readers.md#configured-shortcut-listing-on-the-current-tuple)
before using this route. Its exact arguments, fields, units, bounds and evidence
limits live in that task-specific reference.

## Initialized extension-index observation

Read [initialized extension-index observation](current-utility-readers.md#initialized-extension-index-observation)
before using this route. Its exact arguments, fields, units, bounds and evidence
limits live in that task-specific reference.

## Fixed SDK reads and calculations on the older tuple

Read [fixed sdk reads and calculations on the older tuple](legacy-sdk-readers.md#fixed-sdk-reads-and-calculations-on-the-older-tuple)
before using this route. Its exact arguments, fields, units, bounds and evidence
limits live in that task-specific reference.

### Mixed schematic ID lookup

Read [mixed schematic id lookup](legacy-sdk-readers.md#mixed-schematic-id-lookup)
before using this route. Its exact arguments, fields, units, bounds and evidence
limits live in that task-specific reference.

### PCB readers and calculations

Read [pcb readers and calculations](legacy-sdk-readers.md#pcb-readers-and-calculations)
before using this route. Its exact arguments, fields, units, bounds and evidence
limits live in that task-specific reference.

## Typed design and library operations

```json
{"request":{"action":"operations","query":{"family":"design","prefix":"sch.","includeSchemas":true,"limit":10}}}
```

`operations` derives entries from the same strict design/library parsers used by
the executor. Request an exact `operationAction` for a complete individual
schema. `includeSchemas:true` includes input JSON Schema and its SHA-256. It
describes nested objects, defaults and bounds; JSON Schema does not capture all
custom refinements. Library status distinguishes unavailable operations. Design
actions still need their operation-specific context, source, authority and
durable proof. The [capability matrix](capability-matrix.md) records live coverage.

When present, a library entry's `executionCapabilities` retains the executor's
full scope alongside the structural schema. Check it before assembling a write.
For example, `document.pcb.create` and `document.schematic.create` structurally
accept the SDK's optional `boardName`, but their native executors require that
field to be absent. Closed-target requirements, supported editor types and
original-return recovery limits
are execution conditions, not JSON Schema validation. Older installed catalogs
may expose only the status; query the library capabilities tool in that case.

Installed164600 completed one closed free-schematic creation with its original
native-return identity. Complete checkpoint proof found exactly one DOCHEAD/META
addition and all 11 prior documents unchanged, with no page, template, open or
Save. The same generation separately completed one explicit-black v2 PCB text
creation and its saved deletion, each with one Save/close/reopen. See the packaged
[capability matrix](capability-matrix.md#reported-live-coverage) and
[text contract](pcb-geometry.md#standalone-silkscreen-text) for the tested domains.
These cases do not make every structurally valid request executable.

```json
{"request":{"action":"validate","query":{"family":"design","operation":{"action":"sch.wire.modify"}}}}
```

`validate` runs the exact offline parser, including custom refinements, and
returns normalized arguments or bounded field errors. The example is
intentionally incomplete: use its errors or the operation schema to assemble
the real request. A valid result means argument validity only. It performs no
native preflight, allocates no native IDs and authorizes no execution.

For callable upstream read schemas use `easyeda_control_discover` local mode;
its admitted route, not the upstream annotation, controls invocation. For typed
changes use the design/library executor after live status and exact context.
For genuine SDK gaps use the maintained native adapter or process-bound native
control, never bypass an incomplete transaction or orphan quarantine.
