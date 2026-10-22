# EasyEDA Pro extension interface research

Research date: 2026-10-10. No live editor, design, private credential, installed cache or upstream checkout was changed during this investigation.

## What changed

The plugin's main usability gap was discovery. Its design capabilities listed action names, while host-compatible tool publication intentionally hid the complex operation schema. An agent could see that an action existed without knowing its exact arguments. The new offline API catalog exposes declaration signatures and type names separately from execution. Strict facade operation schemas remain the source of execution arguments.

The latest official declaration package observed in the npm registry is `@jlceda/pro-api-types@0.4.26`, published 2026-09-28. The installed, reviewed public API remains `0.2.53.aee2f57a` for EasyEDA `3.2.149.88089769`. The new package is research material, not a compatibility upgrade. EasyEDA documents independent API versioning and explicitly allows type-definition corrections even in patch releases. [Official package metadata](https://registry.npmjs.org/@jlceda/pro-api-types/0.4.26), [API version policy](https://prodocs.easyeda.com/en/api/guide/stability.html).

## Sources and reproducibility

| Snapshot | Exact source | SHA-256 | Bytes |
|---|---|---|---|
| Reviewed installed | Installed `api-types.d.ts`, public API build `0.2.53.aee2f57a`; checksum already in the plugin's compatibility manifest | `32a0d2f8b4bc3d7b2b93b33499d9d768b0c23c77f45843a65166cf4e8ad6dab1` | 678,232 |
| Official latest | [Versioned npm declaration](https://cdn.jsdelivr.net/npm/@jlceda/pro-api-types@0.4.26/index.d.ts) | `7b2a0407ec516ea3f5021c8373d24cdced2a3946f990a4a524ec3ec394a1173f` | 1,762,250 |
| Latest package archive | [npm tarball](https://registry.npmjs.org/@jlceda/pro-api-types/-/pro-api-types-0.4.26.tgz) | `2f8a966aeb91be1db13d12482fbe5309d444ce2ba46d36c72f26a0dc6ad464f1` | Package transport, not runtime admission |

The npm `0.2.53` declaration differs from the installed `0.2.53.aee2f57a` declaration. Its SHA-256 is `bef508a891e38546250b027c13c06d8c2caace55f6114f76d80fea70d94ac32c`. A matching numeric version is not enough to reconstruct installed evidence. [Versioned npm 0.2.53 declaration](https://cdn.jsdelivr.net/npm/@jlceda/pro-api-types@0.2.53/index.d.ts).

`plugins/easyeda-pro-control/scripts/generate-extension-api-catalog.ts` accepts the two source files and refuses either checksum mismatch. It extracts a compact inventory, not implementation code. Source line numbers remain available in detailed queries. It excludes unrelated bundled UI declarations. Regeneration does not fetch the latest package or update runtime compatibility pins.

The latest declarations use Apache-2.0. The plugin includes the upstream license and extraction notice under `third-party/pro-api-types/`. The official SDK recommends its declaration package for extension development. [Official type-package guide](https://prodocs.easyeda.com/en/api/guide/ancillary-projects/pro-api-types.html).

## Pro is not Standard

EasyEDA Standard documents a command-style global `api(...)` interface and its own document format. Pro exposes a per-extension `eda` object with mounted class instances, such as `eda.pcb_PrimitivePad` and `eda.lib_Device`. Standard scripts, `gge` identity assumptions and Standard JSON field names must not be copied into Pro adapters. [Standard API guide](https://docs.easyeda.com/en/API/EasyEDA-API/), [Pro invocation guide](https://prodocs.easyeda.com/en/api/guide/invoke-apis.html).

The Pro extension runs in the editor's main thread. Browser/DOM, external-request and local-file operations are restricted; the predefined API supplies controlled replacements. The SDK produces importable `.eext` packages. Its documented Node minimum is `20.17.0`; this repository keeps its stricter pinned Node toolchain. The manifest needs a 32-character UUID, and the SDK can generate one during its build. [Official extension initialization guide](https://prodocs.easyeda.com/en/api/guide/how-to-start-for-ai.html), [SDK package definition](https://github.com/easyeda/pro-api-sdk/blob/master/package.json).

`extension.json` declares identity, editor-engine compatibility, entrypoint, activation events, dependencies and menus. Those fields describe an extension package. They do not prove that an installed bridge has the correct code, is enabled, has external-interaction permission, or authenticated successfully. [Manifest reference](https://prodocs.easyeda.com/en/api/guide/extension-json.html).

Official external-tool and MCAD examples require external-interaction permission for filesystem and WebSocket integration. Their demonstration HTTP/CORS or listener settings are examples, not this plugin's security policy. This plugin retains its exact loopback ownership, mutual authentication and admitted Origin contract. [External-tool example](https://github.com/easyeda/eext-external-tool-integration-demo), [Official Fusion360 integration](https://github.com/easyeda/mcad-integration-with-fusion360/blob/main/README.en.md).

## Inventory

Counts below come from the two exact declarations, not a live probe. A signature count includes overloads and declared union alternatives; it is not a count of separately callable runtime methods.

| Group | Reviewed namespaces | Reviewed signatures | Latest namespaces | Latest signatures |
|---|---:|---:|---:|---:|
| Document tree | 11 | 86 | 11 | 87 |
| Integrated library | 9 | 65 | 10 | 76 |
| PCB and footprint | 25 | 278 | 27 | 302 |
| Panel | 1 | 1 | 1 | 1 |
| Schematic and symbol | 21 | 161 | 21 | 144 |
| System | 26 | 158 | 29 | 196 |
| Total | 93 | 749 | 99 | 806 |

There are 697 unique mounted method paths in the reviewed inventory and 773 in the latest inventory. The parser also indexes 296 reviewed and 331 latest Pro classes, interfaces, enums and type aliases. Their fields are not silently converted into permissive JSON schemas. Inspect the declaration or official type reference when a signature uses an unresolved interface or enum. [Official declaration source](https://cdn.jsdelivr.net/npm/@jlceda/pro-api-types@0.4.26/index.d.ts), [Reference index](https://prodocs.easyeda.com/en/api/reference/pro-api.html).

### Document tree

Mounted classes are `dmt_Board`, `dmt_EditorControl`, `dmt_Event`, `dmt_Folder`, `dmt_Panel`, `dmt_Pcb`, `dmt_Project`, `dmt_Schematic`, `dmt_SelectControl`, `dmt_Team` and `dmt_Workspace`.

They cover project/board/document metadata, creation and copying, naming and deletion, document tabs, split views, selection, images, zoom and event registration. Important distinctions remain:

- A schematic container UUID is not its page UUID.
- A tab ID is not a document UUID or project path.
- Open and activate can change context without changing the design.
- Close can trigger unsaved-work prompts or delayed teardown.
- Project/team/folder methods can affect cloud data, unlike local metadata inspection.

The current plugin has typed descriptors for many lifecycle actions but only operation-specific executors. In particular, runtime `open-existing` is an exclusive saved-project opener. It must not replace the supported document opener when sibling tabs are already present. [Editor control reference](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_editorcontrol.html), [Schematic tree reference](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_schematic.html), local sources `library-operations.ts`, `library-execution.ts`, `windows-runtime.ts` and `runtime-scripts.ts`.

### Schematic and symbol

The declared families include document actions, rule checks, events, manufacturing/netlist exports, nets, selection, simulation and graphic/electrical objects. Graphic families include arc, attribute, bus, circle, component, object, pin, polygon, rectangle, text and wire.

The reviewed `sch_PrimitiveComponent` mount is a union of `SCH_PrimitiveComponent` and `SCH_PrimitiveComponent3`. Queries retain the class alternative for every signature. An agent must not combine their methods or return fields into a guessed universal object. The official extension-development skill also recommends inspecting union branches and keeping overloaded declarations separate. [Official developer skill](https://github.com/easyeda/extension-dev-skill/blob/main/SKILL.md), reviewed declaration snapshot.

Current typed schematic adapters preserve hidden native attributes and complete connectivity. They do not assume that geometry touching a wire implies membership in the same native wire group. The separate wire adapter explicitly awaits the native action. Existing compatibility notes document empty net getters, lossy component mapping and dropped `done()` promises. These are reviewed-build findings, not universal claims about the latest SDK. Local sources `schematic-native-wire.ts`, `schematic-layout-batch.ts`, `exact-readers.ts` and the control skill's `compatibility.md`.

### PCB and footprint

The declarations cover document lifecycle, layers/stackup, DRC/rules, nets/classes, copper, manufacturing exports, selection, events, polygon math, 3D rendering and graphic/electrical objects. Primitive families include line, arc, attribute, component, dimension, fill, image, object, pad, polyline, pour, poured geometry, region, string and via.

Current plugin operations include typed single edits and batches, stack replacement, rule collection changes and separate derived-copper workflows. Their support is limited by complete source-effect and durable proofs. A declared pad or region method does not admit every native shape or legacy encoding. Footprint geometry uses exact-owner history adapters for operations whose public wrappers lose data. Local sources `design-operations.ts`, `design-native-adapter.ts`, `footprint-action.ts`, `design-rule-collections.ts`, `design-rule-configuration.ts`, `design-stack-adapter.ts`, `stack-persistence.ts` and `copper-lifecycle.ts`; [PCB API index](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_document.html).

### Libraries

The reviewed mount list includes device, symbol, footprint, CBB, 3D model, classification, collection, panel-library and selection APIs. The latest package also has `lib_SimulationModel`.

Metadata, editor geometry, placed instances and device associations have different identity and persistence rules. A library metadata getter does not inspect an open editor's geometry. A DEVICE binding change does not rebuild a placed footprint or apply an ECO. The current plugin permits specific project-device writes, existing model associations and native geometry edits; asset copying/deletion/import and external writes remain operation-specific. Local sources `library-execution.ts`, `library-persistence-proof.ts` and the control skill's `libraries-and-eco.md`; [Device reference](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_device.html).

### System

System APIs cover UI, menus, dialogs, storage, environment, messaging, timers, units, files, networking and windows. They are not harmless simply because they do not draw PCB geometry. A filesystem call, remote request, event subscription or new window changes resources or can disclose design data.

Receiver binding is part of the signature contract. Prior bridge repairs showed timer cleanup needing the original object as `this`, and a WebSocket registration requiring the native callback/protocol argument order. The catalog exposes those signatures directly. It never calls them. Local sources `easyeda-bridge-extension/src/runtime-timers.ts`, `easyeda-bridge-extension/src/index.ts` and the September connection-repair report; [Timer reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_timer.html), [WebSocket reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_websocket.html).

Custom inline windows use the extension API and package-owned resources rather than unrestricted DOM access. EasyEDA documents the `/iframe/` convention and secure resource-access limits. [Inline-frame guide](https://prodocs.easyeda.com/en/api/guide/inline-frame.html).

## What the latest package adds

The six new mounts are `lib_SimulationModel`, `pcb_ImageTool`, `pcb_Tool`, `sys_ExternalApi`, `sys_Help` and `sys_Math`. Other additions include PCB autorouting/autolayout, image tracing, new 3D event hooks, file-path dialogs, library source retrieval and direct schematic PDF/PNG/SVG getters. These are declaration additions, not newly enabled plugin execution.

An exact comparison by mounted path plus declaring class gives 80 added keys, 23 removed keys and 159 changed signature strings. Of the 23 removals, 22 belong to the former `SCH_PrimitiveComponent3` union branch. The latest declaration consolidates that mount; this does not establish removal of those editor functions. Some of the 159 changes are spelling or type-format changes, so that count is not a behavioral-break count. Derived from the two source checksums above.

The strongest future improvement is `sys_Help.help(namespace?, className?, methodName?)`. Its documented progressive responses include overview, class summaries, enum/interface/type details and per-method inputs/outputs. It also indexes protocol format types and registered external APIs. The reviewed installation has no `sys_Help` mount, so a live help adapter must wait for deliberate newer-runtime admission. The offline catalog gives the current agent similar discovery without claiming that new runtime. [Help method reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_help.help.html).

`sys_ExternalApi` can register other extensions' APIs. Its availability does not make arbitrary extension-provided code trusted. A future adapter must bind the extension identity, method contract and help metadata, then apply the same scoped journal and proof rules. [External API reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_externalapi.html).

## Exposure model

The new `extension-api-catalog.ts` route is offline and accepts only bounded data selectors. It returns frozen-source provenance, namespace summaries, literal search, pagination and optional signatures/tags/source lines. Every entry states `executable:false`, `validation:"declaration-only"` and `runtimeAvailability:"not-probed"`.

The complete SDK catalog response is capped at 64 KiB, with a 48 KiB entry-array budget and at most 100 entries. Queries preserve literal search rather than treating caller strings as regexes or code. The generator checks file size before reading and exact source hashes before inventory extraction.

Examples of its query input:

```json
{"namespace":"pcb_PrimitivePad","detail":true,"limit":20}
```

```json
{"reference":"official-latest","namespace":"sys_Help","detail":true}
```

```json
{"kind":"types","search":"EPCB_LayerId","limit":10}
```

Method-name risk labels are triage hints, not permission. A getter can return a file, compile a design, perform external reads or be an SDK stub. `unknown` remains unknown. Execution uses the facade's exact operation schema and dedicated adapter, never a method path plus arbitrary arguments or caller JavaScript.

Three separate catalogs should remain visible to the agent:

1. The SDK declaration catalog explains which signatures a version declares.
2. The strict operation catalog explains the plugin's accepted data and validation-only requests.
3. Runtime capabilities and operation-specific journals prove what the active tuple can execute and which phases completed.

A tuple mismatch cannot be fixed by selecting the latest reference catalog. Native UI also cannot evade a failed typed transaction or orphan quarantine.

### SDK names versus typed facade actions

These mappings describe source-level correspondence, not execution admission or a shared argument list. Retrieve the exact operation schema and runtime capabilities before use.

| SDK method family | Facade route and action | Important boundary |
|---|---|---|
| `pcb_PrimitivePad.create/modify/delete` | `easyeda_control_design`, `pcb.pad.create/modify/delete` | Native source adapters preserve fields lost by public wrappers; supported shape/profile restrictions still apply |
| `sch_PrimitiveWire.create/modify/delete` | `easyeda_control_design`, `sch.wire.create/modify/delete` | Reviewed wire modification uses the dedicated awaited native adapter, not direct public invocation |
| `dmt_EditorControl.openDocument` | `easyeda_control_library`, `document.open` | Requires the checkpoint-bound target and exact document context; not the exclusive runtime project opener |
| `lib_Symbol.get`, `lib_Footprint.get`, `lib_Device.get`, `lib_3DModel.get` | `easyeda_control_library`, `library.<family>.get` | Library asset metadata does not substitute for editor geometry or complete project records |
| `pcb_ManufactureData.getGerberFile` | `easyeda_control_library`, `export.pcb.gerber` | Uses managed complete file bytes and receipt checks; never filesystem paths or fabrication submission |
| `pcb_Document.importChanges` | No admitted generic API action; native ECO workflow | Dialog-only gate, comparison and full connectivity review remain necessary |
| Latest `sys_Help.help` | Offline SDK catalog only on the reviewed tuple | Declared in `0.4.26`; absent from the reviewed snapshot, so no live call is admitted |

Mapping evidence is in `design-operations.ts`, `schematic-operations.ts`, `design-action.ts`, `schematic-native-wire.ts`, `library-operations.ts`, `library-execution.ts` and `library-runtime.ts`. Public compiler descriptors can be overridden by dedicated native execution adapters. The parser catalog therefore must not infer direct SDK dispatch from an action name.

## Gaps and next adapters

| Candidate | Why useful | Required proof before enabling execution |
|---|---|---|
| Current-runtime help | Removes signature guessing after upgrades | New installed declarations/implementation review, exact method metadata, bounded normalization and connected read smoke |
| Library source getters | Avoids opening an editor for metadata-only/source inspection | Exact asset owner, complete source bytes and double samples; reject unknown latest-only methods |
| Document naming/frame changes | Removes repeated ad hoc native finishing scripts | One scoped document delta, explicit metadata/history model, no repeated Rename/Save, all peer records unchanged |
| ECO application | Automates a common dialog-only transition | Typed comparison rows, complete UID/pin/pad/net/lock audit and save/reopen proof; separate authorization |
| Additional manufacturing formats | Completes release workflows | Exact native file type/result, full bounded bytes, managed artifacts and read-only design invariance |
| Event/interactive tool control | Supports UI inspection and interactive placement | Callback lifecycle, subscription cleanup, foreground/context proof and no delayed unjournaled writes |
| Latest autorouting/autolayout | Can automate larger edits | Explicit scope, bounded route result, exact source/net/lock/collateral model and disposable full lifecycle test |
| External extension APIs | Allows other tools to contribute capabilities | Extension provenance, fixed schema, no unrestricted dispatch and operation-specific verification |

The current plugin already implements broad schematic, PCB, library and export workflows. The right expansion is dedicated adapters for unmet tasks, with good parameter discovery. A generic `eda.*` dispatcher would recreate the uncertainty that caused the repair history.

## Validation of this addition

Six focused tests cover provenance separation, refusal of caller code/coerced/unbounded/prototype-injected queries, deterministic pagination, response mutation isolation, complete mounted namespace coverage, output bounds, API-only type selection, and malformed/duplicate/missing declaration grammar. Strict TypeScript and type-aware Oxlint passed on the pinned Node toolchain. Two regenerations produced identical data SHA-256 `6be0b9c91b44ac657ef635fafc04656dcb35bcda08c524adf1f963c48f6a3380`.

This is offline catalog validation. No new editor API or writer has received live validation through this work.
