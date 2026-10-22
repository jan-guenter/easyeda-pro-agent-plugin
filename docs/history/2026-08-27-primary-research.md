# EasyEDA Pro automation: primary-source research

Research date: 2026-08-27, Europe/Berlin

## Scope and conclusion

This note answers one narrow question: what first-party EasyEDA Pro interfaces can support dependable agent control, and where do they stop? It uses EasyEDA documentation, EasyEDA-owned source repositories, the API files bundled with the installed desktop client, and the current first-party npm type package. The project handoff was used only to identify experiments worth reproducing. It is not an API authority.

EasyEDA now publishes most of the pieces needed for broad automation. Its extension API covers document management, schematic and PCB data, library access, rules, DRC, manufacturing exports, dialogs, files, WebSockets, and in-process messaging. EasyEDA also publishes an Agent Skill and a gateway extension that execute JavaScript in the running editor. The official bridge is useful for debugging, but it is not MCP, it has no typed operation boundary, and its shipped authentication model is only a predictable service-name string. It should not be the production control plane for an agent that can alter a real board. [EasyEDA describes the extension API as JavaScript wrappers around editor functions](https://prodocs.easyeda.com/en/api/guide/), while its [first-party Agent Skill describes the HTTP and WebSocket code-execution bridge](https://github.com/easyeda/easyeda-api-skill/blob/8895d98637dab59ed9de10bb2a340e3e4be26d99/README.md).

The practical answer is a three-part system:

1. A version-pinned EasyEDA extension should expose a small, typed set of read, plan, mutate, save, export, and verify operations.
2. A loopback MCP server should authenticate the extension and translate MCP tools into those typed operations.
3. A skill should select tools, enforce project-specific safety gates, and require durable readback before it treats a mutation as complete.

Raw JavaScript execution can remain as an explicitly enabled development escape hatch. It is too broad for routine use.

## Frozen source set

The installed client matters more than the newest web reference. EasyEDA's own extension-development skill says the target project's installed `@jlceda/pro-api-types/index.d.ts` is the structural authority, then the build result, then JSDoc maturity tags. It explicitly warns against treating generated Markdown references as the source of truth. [First-party extension-dev-skill, commit `d9148cba`](https://github.com/easyeda/extension-dev-skill/blob/d9148cba524149d17afcbfd196fab3226a8df5da/SKILL.md)

| Evidence | Frozen identity | Why it matters |
|---|---|---|
| Installed desktop app | `client.pro.easyeda.com` `3.2.149.88089769`, read from [`resources/app/package.json`](</mnt/c/Program Files/easyeda-pro/resources/app/package.json>) | This is the editor that must execute the extension. |
| Installed extension API | `pro-api` `0.2.53`, read from the bundled [`extension.json`](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-api/0.2.53.aee2f57a/extension.json>) | This is the locally bundled runtime API, not the newest online API. |
| Installed declarations | 21,498 lines, 127 classes, 70 enums, 129 interfaces, 32 type aliases; SHA-256 `32a0d2f8b4bc3d7b2b93b33499d9d768b0c23c77f45843a65166cf4e8ad6dab1`; [`api-types.d.ts`](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-api/0.2.53.aee2f57a/api-types.d.ts>) | This is the best available declaration of what editor `3.2.149` exposes. |
| Installed API implementation | SHA-256 `5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc`; [`api.js`](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-api/0.2.53.aee2f57a/api.js>) | Runtime probes should freeze this hash as well as the editor version. |
| Current first-party type package | `@jlceda/pro-api-types@0.4.16`; tarball SHA-256 `2a47d70511128cc0f2b619e7dde653aea65c3a32b78aaef899c9fb66f36be13c`; [`npm tarball`](https://registry.npmjs.org/@jlceda/pro-api-types/-/pro-api-types-0.4.16.tgz) | Useful for seeing newer functions, but unsafe as the contract for `3.2.149`. |
| Extension SDK | `pro-api-sdk` `1.6.18`, commit `c66c4a68`; its package requires Node `>=20.17.0` and depends on `@jlceda/pro-api-types ^0.4.15`; [package.json](https://github.com/easyeda/pro-api-sdk/blob/c66c4a685da7260491dc67a5a3bddd9545c8d1f0/package.json) | The current SDK compiles against a newer declaration family than the installed editor bundles. |
| First-party agent skill | `easyeda-api` `1.1.28`, commit `8895d986`; [package.json](https://github.com/easyeda/easyeda-api-skill/blob/8895d98637dab59ed9de10bb2a340e3e4be26d99/package.json) | This is EasyEDA's own attempt at agent access. |
| First-party gateway extension | `run-api-gateway` `1.0.5`, commit `479d9b3e`; engine constraint `~3.2.0`; [manifest](https://github.com/easyeda/eext-run-api-gateway/blob/479d9b3e58d105229dc00f914c0871700a9f04df/extension.json) | This is the code that receives and evaluates agent-supplied JavaScript inside EasyEDA. |
| First-party extension-development MCP | `extension-dev-mcp-tools` `1.3.2`, commit `edce0424`; Node `>=20.17.0`; [package.json](https://github.com/easyeda/extension-dev-mcp-tools/blob/edce042465fcccb6dc9cce8c17179de121bbb1a1/package.json) | This is a real MCP server for importing and debugging extensions. It does not control design documents. |
| First-party API Debug Tool | `eext-api-debug-tool` `2.7.2`, commit `e7bf7376`; engine `>=3.1.59`; [manifest](https://github.com/easyeda/eext-api-debug-tool/blob/e7bf7376bcac92879f5eb2414ceef7fb7078b586/extension.json) | This is an in-editor script and API debugging aid, not an external agent protocol. |

The current `0.4.16` declarations contain functions marked as added in editor `3.2.162`, `3.2.166`, `3.2.167`, `3.2.176`, `3.2.183`, version 4, and version 4.2. Examples include autorouting and autolayout at `3.2.162`, editor-version readback at `3.2.176`, schematic PNG and SVG export at `3.2.183`, and several detailed PCB rule or stack interfaces at `4.2`. Those declarations cannot be copied into a `3.2.149` extension without a runtime gate. The exact annotations are in the [published `0.4.16` declaration tarball](https://registry.npmjs.org/@jlceda/pro-api-types/-/pro-api-types-0.4.16.tgz).

The local and current declarations each contain 127 classes, but the names differ. The installed file has `SCH_PrimitiveComponent3` and `ISCH_PrimitiveComponent`; the current package instead has `LIB_SimulationModel` and `SYS_Math`. Equal class counts therefore do not imply compatibility. This comparison is reproducible from the [installed declarations](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-api/0.2.53.aee2f57a/api-types.d.ts>) and the [current npm package](https://registry.npmjs.org/@jlceda/pro-api-types/-/pro-api-types-0.4.16.tgz).

EasyEDA gives its API a separate semantic version from the editor. A major API release may remove methods or change behavior. Minor releases can add APIs and fixes automatically with a newer editor. Even a patch release may break TypeScript declarations. Development-stage APIs can require a development extension. [EasyEDA's stability policy](https://prodocs.easyeda.com/en/api/guide/stability.html)

This makes runtime fingerprinting mandatory. A session handshake should return at least the editor build, bundled `pro-api` version and hashes, extension version, document type and UUID, project UUID, execution mode, and enabled permissions. If a capability has not passed on that exact fingerprint, the MCP server should report it as unavailable rather than trying a newer signature.

## Extension runtime, package, lifecycle, and commands

Every extension runs as an independent JavaScript program with its own `eda` object and scope chain. User extensions run locally, but EasyEDA restricts direct DOM access, external requests, local filesystem access, and normal browser APIs in the main extension thread. EasyEDA expects extensions to use `eda.sys_*` wrappers for those operations. [How to get started](https://prodocs.easyeda.com/en/api/guide/how-to-start.html), [invoking the extension API](https://prodocs.easyeda.com/en/api/guide/invoke-apis.html)

The official package format is an `.eext` archive built from an SDK project with `extension.json` at its root and an ES module entry such as `./dist/index`. EasyEDA Pro V3 imports it through `Advanced > Extension Manager > Import`. The current SDK template declares `engines.eda` as `^3.2.0`; the official agent gateway narrows that to `~3.2.0`. [SDK template manifest](https://github.com/easyeda/pro-api-sdk/blob/c66c4a685da7260491dc67a5a3bddd9545c8d1f0/extension.json), [installation guide](https://prodocs.easyeda.com/en/api/guide/how-to-start.html)

`extension.json` can add static header menus for `home`, `blank`, `sch`, `symbol`, `pcb`, `footprint`, `pcbView`, `panel`, and `panelView`. A menu's `registerFn` names an ES module export in the extension entry. Menu items can nest two levels, and one item cannot have both `menuItems` and `registerFn`. The guide labels `activationEvents` and `dependentExtensions` as work in progress. [Manifest reference](https://prodocs.easyeda.com/en/api/guide/extension-json.html)

The gateway proves the usable lifecycle shape. It exports `activate`, `deactivate`, and menu handlers. `activate` reads stored auto-connect state and starts connection discovery. `deactivate` cancels timers and connections. [Gateway lifecycle source](https://github.com/easyeda/eext-run-api-gateway/blob/479d9b3e58d105229dc00f914c0871700a9f04df/src/index.ts#L162-L183)

Standalone scripts are a useful probe mechanism, not a persistent agent integration. EasyEDA Pro V3 exposes them under `Advanced > Run Script`. Each run receives a throwaway `eda` object. Some extension-only functions, including `SYS_IFrame`, are unavailable. Saved scripts live in browser `localStorage` or IndexedDB, and EasyEDA calls that storage insecure. [Standalone-script documentation](https://prodocs.easyeda.com/en/api/guide/invoke-apis.html)

### Permissions that affect automation

The main declaration and official examples do not expose an extension permission manifest with fine-grained machine-readable grants. Instead, several methods state that the user must enable the extension's "external interaction" permission. Without it they throw. That includes direct desktop filesystem access and `SYS_WebSocket`. [Installed `SYS_FileSystem` and `SYS_WebSocket` declarations](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-api/0.2.53.aee2f57a/api-types.d.ts>), [current `SYS_FileSystem` reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_filesystem.html), [current `SYS_WebSocket` reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_websocket.html)

`SYS_FileManager.getProjectFileByProjectUuid` separately requires the project-management permission to download a project. Missing permission throws rather than returning `false`. The bundled declaration records this requirement. [`SYS_FileManager` in the installed declarations](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-api/0.2.53.aee2f57a/api-types.d.ts>)

The extension therefore needs a permission self-test at activation. It should probe each optional permission without changing a document, report exactly which capability is disabled, and offer a human-readable menu or iframe status page. It should not discover a missing permission halfway through a board mutation.

## Public control coverage

The table below names the public families present in the installed `0.2.53` declarations. The current web reference often describes a newer signature. For implementation, inspect the installed declaration and test the exact method before exposing the capability.

| Area | Official functions available | Hard limit or uncertainty |
|---|---|---|
| Project and document tree | `DMT_Project`, `DMT_Board`, `DMT_Schematic`, `DMT_Pcb`, `DMT_Panel`, folders, teams, workspaces, current-selection queries, and editor-tab control. The current reference lists these families under [Document Tree](https://prodocs.easyeda.com/en/api/reference/pro-api.html). | Operations are scoped to the currently open project in several editor-control calls. Active document, document UUID, page UUID, tab ID, project UUID, and board association must stay distinct. |
| Open, focus, and close | `DMT_EditorControl` can open and activate documents, inspect split screens and tabs, zoom, and close documents. The installed JSDoc warns that `closeDocument` discards unsaved data. [`DMT_EditorControl` declaration](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-api/0.2.53.aee2f57a/api-types.d.ts>) | Closing without save is a coarse rollback option, not a transaction system. It may also discard unrelated user edits in the same dirty document. |
| Save | Installed `SCH_Document.save()` and `PCB_Document.save(uuid)` return `Promise<boolean>`. [Schematic document reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sch_document.html), [PCB document reference](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_document.html) | A `true` result says the save operation succeeded, but it does not prove every requested field serialized as intended. Reopen and structural readback are still required for risky changes. |
| Schematic primitives | The installed API has general and concrete component, pin, wire, bus, arc, circle, polygon, rectangle, text, and attribute families with read, create, modify, and delete methods. [Schematic API families](https://prodocs.easyeda.com/en/api/reference/pro-api.html), [SCH_Primitive reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sch_primitive.html) | Mutation styles differ across primitive types and API generations. Some builders are synchronous, some return a state builder with `done()`, and some current mounts are unions. The exact returned shape must be queried and probed. |
| Schematic connectivity and checks | `SCH_Net`, `SCH_Netlist`, `SCH_Drc`, component-pin access, document import, and schematic manufacturing exports are declared. [Schematic reference index](https://prodocs.easyeda.com/en/api/reference/pro-api.html) | Visual wires, net names, logical net membership, native NC state, and netlist output are separate facts. A correct-looking canvas is not a netlist proof. |
| PCB primitives | The installed API declares components, pads, vias, lines, arcs, polylines, text, dimensions, images, regions, pours, poured results, and fills. It exposes general and concrete read, create, modify, and delete calls. [PCB reference index](https://prodocs.easyeda.com/en/api/reference/pro-api.html), [PCB_Primitive reference](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitive.html) | Component wrappers and physical pad primitives can report transformed or differently scaled fields. A control layer should return raw field provenance and units, not a naked number. |
| PCB nets and selection | `PCB_Net` reads nets, names, lengths, colors, primitives by net, netlists, and selection or highlighting state. [PCB_Net reference](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_net.html) | Net length and primitive membership need a declared interpretation. Routed geometry, ratlines, pads, pours, and filled copper should not be silently conflated. |
| PCB rules and DRC | The installed `PCB_Drc` declaration includes DRC execution, real-time DRC, named rule configurations, per-net rules, net-to-net rules, region rules, net classes, differential pairs, equal-length groups, pad-pair groups, and minimum wire-length queries. [`PCB_Drc` in installed declarations](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-api/0.2.53.aee2f57a/api-types.d.ts>), [PCB DRC reference](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_drc.html) | Several rule and stack methods are alpha or beta and accept broad records or `any` in `0.2.53`. The ability to create an object does not prove that all numeric physics fields can be assigned or survive reopen. |
| PCB layers and physical stack | `PCB_Layer` reads and changes logical layers. The installed declaration also has alpha methods to read, save, rename, delete, select, and overwrite physical stacking configurations, but most payloads are `{[key: string]: any}` and one getter is synchronous while adjacent calls are promises. [`PCB_Layer` in installed declarations](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-api/0.2.53.aee2f57a/api-types.d.ts>), [current PCB_Layer reference](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_layer.html) | Treat `3.2.149` stack writes as experimental. A field-by-field readback against the native stack manager is required before the MCP advertises write support. |
| Library objects | `LIB_Device`, `LIB_Symbol`, `LIB_Footprint`, `LIB_3DModel`, library lists, classifications, CBB modules, panel libraries, and selection controls are declared. [Integrated Library index](https://prodocs.easyeda.com/en/api/reference/pro-api.html) | Library UUID, placed primitive UUID, device UUID, symbol UUID, footprint UUID, and model UUID are different identifiers. Deep association replacement and project-library persistence need isolated tests. |
| Manufacturing and exchange files | `SCH_ManufactureData` and `PCB_ManufactureData` declare netlists, PDFs, Gerbers, pick-and-place, BOM, STEP or OBJ, shell, flying-probe, DXF, IPC-D-356A, IPC-2581C, ODB++, DSN, autorouter exchange, and other exports. [`PCB_ManufactureData` in installed declarations](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-api/0.2.53.aee2f57a/api-types.d.ts>), [manufacturing reference](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_manufacturedata.html) | File generation is not fabrication release. The extension should return hashes and metadata, then an external validator should inspect the files. Ordering calls are external side effects and must never be exposed as ordinary design tools. |
| Import schematic or PCB changes | `PCB_Document.importChanges` and `SCH_Document.importChanges` return only `Promise<boolean>` in the public reference. [PCB importChanges](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_document.importchanges.html), [schematic importChanges](https://prodocs.easyeda.com/en/api/reference/pro-api.sch_document.importchanges.html) | The public contract does not describe dialog row enumeration, row selection, or whether `true` means that a dialog opened or that changes were applied. This is an explicit probe gate. |
| Whole-document source | Beta `SYS_FileManager.getDocumentSource` and `setDocumentSource` read or replace the current document source. [setDocumentSource reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_filemanager.setdocumentsource.html) | The API has no declared revision token or compare-and-swap guard. Whole-source writes should be disabled by default and allowed only with preimage hash, schema validation, backup, closed-form diff, and post-write readback. |
| Document files and direct format work | EasyEDA's first-party Agent Skill includes specifications for `.epro`, schematic, and PCB source formats. [First-party format index](https://github.com/easyeda/easyeda-api-skill/blob/8895d98637dab59ed9de10bb2a340e3e4be26d99/format/index.md) | Format documentation is useful for offline inspection and generation. It is not evidence that editing a live `.eprj2` database behind an open client is safe. Direct file mutation should require the editor to be closed and a recoverable copy. |

### No declared transaction or undo API

A case-insensitive search of all 21,498 lines in the installed declaration found no public `undo`, `redo`, `transaction`, `rollback`, or history method. The same file explicitly documents only the destructive close-without-save behavior noted above. [Installed API declaration and its SHA-256 identity](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-api/0.2.53.aee2f57a/api-types.d.ts>)

This absence changes the design. Each mutation should use a two-phase protocol:

1. Read and hash the target state. Resolve exact UUIDs, references, units, document identity, and expected cardinality.
2. Return a plan and a machine-checkable precondition set without changing EasyEDA.
3. Apply to the open document without saving.
4. Read back every changed field and global invariants.
5. Save only if the local audit passes.
6. Close and reopen, then repeat the audit for persistence.
7. On failure before save, close only if the tool can prove that no unrelated unsaved user edits exist. Otherwise stop and ask the user to choose the recovery action.

This protocol is an architectural response to the missing API, not an EasyEDA guarantee.

## Dialogs, custom UI, and native UI gaps

`SYS_Dialog` provides confirmation, information, text input, and selection dialogs. The input and selection calls in the installed declaration are beta and callback-oriented. [SYS_Dialog reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_dialog.html)

For richer extension UI, EasyEDA supports packaged HTML in an iframe. The extension calls `SYS_IFrame.openIFrame` for a file inside the extension package. The loader does not recursively parse resources because of its secure-resource rules. [Inline-frame guide](https://prodocs.easyeda.com/en/api/guide/inline-frame.html), [SYS_IFrame reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_iframe.html)

The main `SYS_Window` API is intentionally limited for security to window opening plus focus and blur listeners. [SYS_Window reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_window.html)

Static extension menus are the stable command entry point. `SYS_HeaderMenu.insertSystemHeaderMenuItem` is a beta exception. Its reference says it cannot add a top-level menu or add under `Advanced`, rewrites new IDs with the extension UUID, requires external-interaction permission, and relies on a non-public interface that may change without notice. [insertSystemHeaderMenuItem reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_headermenu.insertsystemheadermenuitem.html)

No generic native-dialog inspector, accessibility tree, keyboard injector, mouse injector, or arbitrary host-DOM controller appears in the installed public declarations. File pickers and other native dialogs therefore remain focus-sensitive human gates unless a specific EasyEDA API bypasses the dialog. This is a declaration audit, not proof that no private implementation exists. The extension should prefer direct typed calls and file objects. A separate UI driver may handle the few irreducible dialogs, but it must be version-specific and should never be the default path for design mutations.

## Filesystem, network, and IPC boundaries

### Filesystem

`SYS_FileSystem` can load packaged extension files and invoke open or save dialogs. In the desktop client, beta methods can directly read, write, list, and delete filesystem paths. Direct access requires external-interaction permission and throws in a browser. Some paths are further limited by offline mode. [SYS_FileSystem reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_filesystem.html), [installed declarations](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-api/0.2.53.aee2f57a/api-types.d.ts>)

Current `0.4.16` declarations add directory creation at editor `3.2.166` and path-existence checks at `3.2.167`. Neither can be assumed on `3.2.149`. [Published `0.4.16` declarations](https://registry.npmjs.org/@jlceda/pro-api-types/-/pro-api-types-0.4.16.tgz)

The MCP server should own normal filesystem work. The extension should exchange byte arrays, small JSON results, or content hashes and use EasyEDA filesystem APIs only when the editor itself must create or consume a `File` object. Path allowlists must prevent writes outside explicit project and export directories.

### Network

The extension main thread cannot rely on normal browser fetch. `SYS_WebSocket.register`, `send`, and `close` are the documented persistent transport and require external-interaction permission. [SYS_WebSocket reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_websocket.html)

The first-party gateway comments that raw `fetch` from the HTTPS web editor to `http://127.0.0.1` is blocked as mixed content, so it scans loopback WebSocket ports through `eda.sys_WebSocket.register`. [Gateway connection source](https://github.com/easyeda/eext-run-api-gateway/blob/479d9b3e58d105229dc00f914c0871700a9f04df/src/index.ts#L247-L400)

### In-process message bus

`SYS_MessageBus` exposes private and public push, pull, publish, subscribe, one-shot subscriptions, and RPC service calls. The public variants enable communication between extensions in the same EasyEDA runtime. [SYS_MessageBus reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_messagebus.html)

This is useful for splitting a UI extension from an executor extension. It is not an operating-system bridge to Codex or another agent. Any public topic or RPC name should include a namespaced extension UUID and validate payloads because other extensions can reach it.

## Audit of EasyEDA's first-party agent bridge

The first-party `easyeda-api-skill` is real and useful. It includes 120-plus API class references, code patterns, document-format notes, and a Node bridge. The bridge chooses ports `49620` through `49629`, exposes health and EasyEDA-window discovery, accepts code through HTTP, and forwards it over WebSocket to the gateway extension. [Skill README](https://github.com/easyeda/easyeda-api-skill/blob/8895d98637dab59ed9de10bb2a340e3e4be26d99/README.md), [bridge source](https://github.com/easyeda/easyeda-api-skill/blob/8895d98637dab59ed9de10bb2a340e3e4be26d99/scripts/bridge-server.mjs)

The bridge binds `127.0.0.1`, which prevents direct remote-network access. It sets `Access-Control-Allow-Origin: *`, accepts `POST /execute` with a raw JavaScript string, and uses a fixed 30-second request timeout. No bearer token, shared secret, origin allowlist, request-size limit, or operation allowlist appears in the server. [Host and timeout](https://github.com/easyeda/easyeda-api-skill/blob/8895d98637dab59ed9de10bb2a340e3e4be26d99/scripts/bridge-server.mjs#L38-L58), [CORS and `/execute`](https://github.com/easyeda/easyeda-api-skill/blob/8895d98637dab59ed9de10bb2a340e3e4be26d99/scripts/bridge-server.mjs#L134-L228)

The WebSocket server classifies `/eda` as the editor and every other path as an agent. The reviewed connection handler has no authentication step. [WebSocket connection source](https://github.com/easyeda/easyeda-api-skill/blob/8895d98637dab59ed9de10bb2a340e3e4be26d99/scripts/bridge-server.mjs#L234-L330)

The gateway scans the same port range and accepts a handshake whose identity test is the literal `service === "easyeda-bridge"`. After that, an `execute` message is compiled with `new AsyncFunction('eda', msg.code)` and run with the full extension `eda` object. [Discovery and handshake](https://github.com/easyeda/eext-run-api-gateway/blob/479d9b3e58d105229dc00f914c0871700a9f04df/src/index.ts#L247-L400), [code execution](https://github.com/easyeda/eext-run-api-gateway/blob/479d9b3e58d105229dc00f914c0871700a9f04df/src/index.ts#L469-L520)

That combination means any local process can submit arbitrary extension-context code while the bridge is running. The wildcard CORS policy also allows browser JavaScript to attempt cross-origin calls to the loopback server. Whether a given browser adds a separate private-network restriction is outside this bridge's control. The predictable service string protects against accidental connection to an unrelated port, not an active local impersonator. This is a direct inference from the cited source.

The response path also serializes ordinary JavaScript results as JSON. Complex EasyEDA objects, cyclic graphs, `File` and `Blob` instances, large primitive sets, and long-running jobs need explicit encoders or handles. A fixed HTTP timeout does not cancel an editor-side operation after the caller gives up. The new control plane needs separate submission, progress, cancellation request, completion, and result-fetch messages.

There is no MCP implementation in the first-party bridge. It is an HTTP and WebSocket arbitrary-code tunnel. An MCP server must add tool schemas, capability discovery, authentication, error taxonomy, audit records, and lifecycle control.

## Other first-party development automation

EasyEDA does publish one MCP server, `extension-dev-mcp-tools`. Its scope is extension development. Version `1.3.2` registers exactly three stdio tools: `import_plugin`, `dev_plugin`, and `get_console_logs`. [MCP tool registry](https://github.com/easyeda/extension-dev-mcp-tools/blob/edce042465fcccb6dc9cce8c17179de121bbb1a1/src/index.ts#L1-L53)

The development MCP launches or attaches to Chrome through the DevTools protocol, opens the web editor in debug mode, drives the extension-manager upload flow with Playwright, and captures at most 500 console entries. It caches browser login state under its `.browser-data` directory. [First-party README](https://github.com/easyeda/extension-dev-mcp-tools/blob/edce042465fcccb6dc9cce8c17179de121bbb1a1/README.en.md), [browser connection source](https://github.com/easyeda/extension-dev-mcp-tools/blob/edce042465fcccb6dc9cce8c17179de121bbb1a1/src/browser.ts#L1-L215), [import and log source](https://github.com/easyeda/extension-dev-mcp-tools/blob/edce042465fcccb6dc9cce8c17179de121bbb1a1/src/tools/dev-plugin.ts#L1-L220)

This tool is a good fit for the build, import, and console-test loop of the new extension. It does not expose schematic or PCB tools, and its Playwright selectors target the web editor's current DOM. Treat `.browser-data` as credential-bearing local state and keep DOM selectors out of the production design-control path.

The SDK's `npm run debug` command supplies a different hot-reload path. It watches and rebuilds the extension, starts a WebSocket server on port `59394`, and sends the packaged `.eext` as base64 to every connected client. The reviewed server does not specify a loopback host or authenticate clients. It is a development file-push channel, not an EasyEDA API-control channel. [SDK debug server](https://github.com/easyeda/pro-api-sdk/blob/c66c4a685da7260491dc67a5a3bddd9545c8d1f0/build/dev.ts#L16-L109)

The official API Debug Tool uses an iframe for its editor UI. Its startup code also reads the private global `_EXTAPI_SCRIPT_SPACES_` to reach extension script spaces. This proves that first-party debugging code sometimes depends on editor internals. It does not make that global part of the public compatibility contract. [API Debug Tool startup source](https://github.com/easyeda/eext-api-debug-tool/blob/e7bf7376bcac92879f5eb2414ceef7fb7078b586/src/index.ts#L1-L60)

## Recommended control architecture

### EasyEDA extension

The extension should run one serialized command queue per document and expose only named operations. Each request should include protocol version, request ID, editor-session ID, document UUID, expected document type, precondition hash, dry-run flag, and mutation intent. Each response should include the same identity fields, elapsed time, warnings, changed-object UUIDs, before and after hashes, and a structured error code.

The extension should separate these capabilities:

- Read-only discovery, document tree, object lookup, netlist and rule inspection.
- Canvas and object snapshots with explicit units and field provenance.
- Plan generation with no mutations.
- Narrow mutations against UUID-addressed targets.
- Save and close as separate calls. No mutator should save implicitly.
- Reopen and durable verification.
- Export to `File` or byte content without ordering or purchasing.
- A quarantined adapter for alpha or private behavior, keyed to an exact editor and API hash.

The extension should expose a status iframe and static menu commands for connect, disconnect, read-only mode, pending mutation review, emergency stop, and diagnostics. Static menu registration is preferable to the beta system-menu insertion API. The official iframe and manifest mechanisms support this design. [Manifest guide](https://prodocs.easyeda.com/en/api/guide/extension-json.html), [iframe guide](https://prodocs.easyeda.com/en/api/guide/inline-frame.html)

### MCP server

The MCP server should bind loopback and use a random per-install or per-session secret. The extension and server should mutually authenticate with a nonce challenge. CORS should be absent because MCP clients do not need browser cross-origin access. WebSocket paths should include an unguessable session identifier, and every message should carry a monotonically increasing sequence number.

Expose typed MCP tools such as `easyeda.session.describe`, `document.snapshot`, `schematic.query`, `pcb.query`, `mutation.plan`, `mutation.apply`, `document.save`, `document.reopen_verify`, `drc.run`, and `export.generate`. Keep arbitrary `execute_javascript` disabled by default. When a developer enables it, require an explicit session switch, show a persistent warning in EasyEDA, deny filesystem and ordering calls where possible, and log the exact source and result.

Separate tool timeouts from editor jobs. A timeout should mark the request uncertain, not failed. The server must query the request ID before retrying so an at-most-once mutation is not applied twice.

### Skill

The skill should consult a generated capability catalog for the connected fingerprint. The catalog should include method signature, maturity tag, unit conventions, side effects, test status, known serialization behavior, and required verification. EasyEDA's own development skill already supplies a type-query tool and evidence order that can be adapted for this catalog. [First-party extension-dev-skill](https://github.com/easyeda/extension-dev-skill/blob/d9148cba524149d17afcbfd196fab3226a8df5da/SKILL.md)

Recipes should operate on semantic results, not emit large one-line JavaScript programs. For example, a placement recipe should ask the server for candidate UUIDs and bounding boxes, submit a move plan with exact preconditions, apply it in chunks, then run collision and persistence audits. The skill should never infer success from an API boolean alone when a durable readback exists.

### Private adapters and UI automation

Public APIs should be the default. If a required editor feature has no public write path, isolate the native message, private method, or UI workflow behind one adapter with these gates:

- Exact editor and bundled API hashes match a tested profile.
- A read-only probe proves message shape and response correlation.
- The adapter has a narrow schema and rejects extra fields.
- A fixture test proves the before and after state plus close and reopen persistence.
- The skill names the private dependency in the operation plan.
- Failure disables the capability for the session. It does not fall through to guessed messages.

This keeps private behavior replaceable when EasyEDA changes. It also prevents an old native message from becoming a silent general-purpose backdoor.

## Experimental probe suite

The official sources document method signatures better than runtime semantics. The following tests must run on disposable local projects before claiming comprehensive control on `3.2.149`.

### P0: environment and transport

- Capture editor build, API version and hashes, desktop versus web mode, offline mode, extension UUID, gateway version, and enabled permissions.
- Verify loopback authentication, origin rejection, maximum message size, malformed JSON handling, replay rejection, multi-window selection, reconnect, heartbeat, and extension deactivation cleanup.
- Start a request that exceeds the client timeout. Prove whether it continues in EasyEDA and how the server reconciles its final state.
- Return a large primitive set, a `File`, a `Blob`, `undefined`, a thrown string, an `Error`, and a cyclic object. Freeze the encoding behavior.

### P1: document identity and lifecycle

- Enumerate project, board, schematic, page, PCB, tab, and split-screen identifiers. Open and activate each supported document type.
- Make one harmless unsaved change in a disposable document. Test save, close without save, close after save, reopen, and cross-tab behavior.
- Determine whether a reliable dirty-state API exists at runtime. No such public declaration was found. If none exists, prohibit automatic close when the user may have unsaved work.
- Verify that a request addressed to one document cannot mutate another after the user changes focus.

### P2: schematic primitives and connectivity

- For every primitive family used by the skill, test get, create, modify, delete, builder completion, UUID stability, and save or reopen persistence.
- Compare component-wrapper pin data with direct pin primitives. Record coordinate, length, rotation, net, and unit transformations.
- For a controlled wire and net-port fixture, compare visual geometry, reported pin net, `SCH_Net`, `SCH_Netlist`, exported netlist, ERC, and reopen state.
- Test library-device, symbol, footprint, supplier, model, and `UniqueId` associations as separate fields. Never accept a displayed MPN as proof of the underlying association.

### P3: PCB primitives and geometry

- Test each concrete primitive on Top, Bottom, an inner copper layer, and a mechanical layer where legal. Include mirrored components and rotated pads.
- Compare `component.getAllPins` with direct `PCB_PrimitivePad` reads for dimensions, hole sizes, layer, pad number, and net. Record every scale or transform.
- Verify bbox definitions, board origin versus canvas origin, rotation direction, layer IDs, mil and millimetre conversions, locked state, and selection side effects.
- Test move, rotate, layer change, lock, route creation, via creation, region, pour, fill, refill, and delete in small fixtures. Confirm ratline, DRC, fill, and reopen effects separately.

### P4: rules, differential pairs, and stack

- Round-trip every field in a disposable named rule configuration. Test net rules, net-to-net rules, region rules, net classes, differential pairs, equal-length groups, and pad-pair groups.
- For pair rules, prove member width, intra-pair gap, selected rule profile, mismatch limit, and child-net behavior through native UI plus API readback.
- Round-trip a physical stack with unique sentinel values in every supported field. Compare public API, native stack manager, save, close, reopen, and export behavior.
- Classify each method as supported, read-only, partial write, silent no-op, or corrupting for this exact build. Alpha methods remain disabled until they pass.

### P5: DRC, manufacture, and exports

- Seed known schematic and PCB violations. Compare API DRC counts and object UUIDs with native DRC output.
- Export every required artifact and record filename, MIME type, byte length, SHA-256, deterministic versus nondeterministic fields, and failure mode.
- Validate Gerbers, drill, pick-and-place, BOM, IPC-D-356A, and 3D outputs with independent parsers.
- Do not probe order-placement methods on a real account. If they must be characterized, use a vendor-approved sandbox and a separate explicit authorization.

### P6: import changes and native dialogs

- Create fixtures with one component add, delete, footprint change, property change, and net change. Call each `importChanges` direction and observe whether `true` means dialog shown, operation applied, or both.
- Determine whether row data and row selection are reachable through a public API. If not, keep this workflow human-controlled or put the native adapter behind exact-build tests.
- Exercise file-open, file-save, confirmation, input, selection, extension iframe, 3D preview, stack manager, rule manager, and import-change dialogs. Record focus changes and which operations can bypass the dialog with a direct API.

### P7: whole-source and offline formats

- On disposable documents, get source, perform a no-op set, then change one well-understood field. Compare hashes, parsed structure, editor readback, save, reopen, and export.
- Reject a stale preimage hash to prove compare-and-swap behavior in the new extension wrapper.
- Test corrupt and oversized sources. Confirm that failure leaves the original document recoverable.
- For `.eprj2` or other local stores, work only on a copy with EasyEDA closed. Run database integrity checks before and after. Reopen in EasyEDA and compare all document identifiers and counts.

## What the attached handoff adds

The handoff reports build-specific failures and workarounds around net-rule writes, pair physics, physical stack entry, transformed pad data, device association repair, native import dialogs, and save or reopen persistence. Those observations are valuable regression targets. They do not establish a supported API contract.

Each reported behavior should become a minimal fixture under P2, P3, P4, or P6. Once reproduced, store the fixture, editor and API hashes, request and response transcript, preimage and postimage summaries, and reopened-state assertion. Until then, label the corresponding capability `unverified` in the MCP handshake.

## Bottom line

Public EasyEDA APIs can cover most read and write operations needed for schematic and PCB work. They cannot, on the evidence reviewed here, provide a trustworthy all-or-nothing transaction, generic control of native dialogs, or a stable promise that today's online declaration works in editor `3.2.149`. The first-party bridge closes the reachability gap by evaluating arbitrary code, but it trades away type boundaries, authentication, cancellation, and safe retries.

A comprehensive agent integration is feasible. Its core should be a typed, authenticated, version-gated extension and MCP server with plan, apply, save, and reopen-verification phases. Private messages, whole-source writes, and UI driving should sit behind narrow adapters and exact-build fixture tests. That is the difference between merely reaching every menu and controlling EasyEDA without quietly damaging the design.
