# Connection and context

## Prove the chain

Start with `easyeda_control_status`. Require all of the following before a design call:

- the control facade is responsive;
- the upstream MCP child is responsive;
- the EasyEDA bridge extension is connected to that child;
- exactly one server owns the extension-facing bridge;
- the application, MCP, and extension versions are present;
- the stable fingerprint pins the exact Node executable, entrypoint, complete built module tree, and the full upstream execution closure captured before launch: `dist`, `node_modules`, `package.json`, dependency lockfile, and in-tree symlink mappings;
- the stable fingerprint pins the native descriptor-sanitizer schema/SHA-256 and exact Bubblewrap executable; the sanitized launch must succeed before the upstream can report readiness, and the offline doctor must also pass its direct runtime probe;
- the authenticated extension and facade share an owner-only HMAC key used only for nonce challenge/response on the fixed extension-facing `127.0.0.1:49621` gateway; the raw key never crosses that socket, the extension does not scan adjacent ports or expose a remote relay, and the gateway forwards the private backend token to the separate facade-assigned private loopback listener only after the extension presents the exact index-build ID and credential epoch from the verified private archive receipt;
- pre-authentication frames are parser-limited to 2 KiB, pending clients are bounded, and any HTTP `Origin` header is rejected. The reviewed EasyEDA `SYS_WebSocket` path is expected to omit `Origin`; do not substitute a browser or raw-WebSocket fallback if that assumption fails;
- a session becomes active only after that exact bridge admission and the private backend's verified hello;
- the facade creates a separate ephemeral backend token and forwards it only after Linux PID, process-start-time, and established-socket-inode ownership prove that the exact supervised child owns the backend connection; this proof is Linux-only and fails closed elsewhere;
- the strict child environment disables runtime `.env` loading, inherited credentials, remote sourcing, telemetry, OAuth, HTTP service, and ordering;
- the supervised upstream shares one process with its bridge-owning server and exits when facade stdio or parent identity disappears;
- the tool catalog, bridge method registry, installed EasyEDA bundles, and EasyEDA/extension versions match the reviewed tuple;
- the current upstream files still match that startup fingerprint (`upstreamImplementationDrift` is false);
- no earlier incomplete write has an unresolved outcome.

The status probe fingerprints the configured installed PCB implementation, public API entry, public API adapter, and public API declarations. A private plan additionally requires their versions and hashes, plus the application, dispatcher, extension, MCP, and Node versions, to match the reviewed compatibility baseline. Do not infer any bundle version from the application version.

Before Bubblewrap starts, the Linux x86_64 descriptor sanitizer requires the
unchanged expected facade parent and installs `PR_SET_PDEATHSIG(SIGKILL)`. Its
entire inherited contract is MCP stdio `0`–`2`, data root `3`, captured module
graph `4`, supervisor `5`, Bubblewrap status `6`, reviewed Node executable `7`,
startup block `8`, seccomp program `9`, and the exact reviewed Bubblewrap
executable `10`. It requires `0`–`10` to be present, admits descriptor `10` only
as a regular exact mode-`0755` executable with no `security.capability` xattr,
marks `10` close-on-exec, closes every descriptor at or above `11`, and enters
Bubblewrap with `execveat(2)`. Bubblewrap therefore sees only `0`–`9`. A missing
descriptor, unexpected capability xattr, parent race, unsupported xattr query,
`close_range(2)` failure, or executable drift stops startup; do not bypass this
gate or substitute a pathname launch.

A listening port does not prove that EasyEDA connected to it. Do not start another MCP child to fix a stale bridge. Let the facade own the child. If EasyEDA needs a manual bridge reconnect, treat that as a visible application action, then repeat status and context checks.

Every live design facade acquires an authenticated dispatch lease for the exact proxying renderer session before its first EasyEDA call. The lease stays active across runtime and context probes, the design read/capture/export, the post-context proof, and durable evidence publication. A replacement renderer cannot inherit the call even when it reports the same project, document, and tab IDs. Mutation and recovery phases reuse that same lease for their journal-bound dispatches and verification. A disconnected status call is a narrow read-only bootstrap diagnostic; context, reads, capture, export, checkpoints, mutation, and live recovery require an active authenticated session.

## Prove the active target

Call `easyeda_control_context` immediately before a scoped read or write. Compare exact values supplied by the current project, not names copied from an old script. Require a nonempty project UUID and `.eprj2` path, a nonempty document UUID, an observed document type, and the active tab when a tool targets a tab.

Useful public context calls in raw code are:

```js
const project = await eda.dmt_Project.getCurrentProjectInfo();
const document = await eda.dmt_SelectControl.getCurrentDocumentInfo();
const pcb = await eda.dmt_Pcb.getCurrentPcbInfo();
const schematic = await eda.dmt_Schematic.getCurrentSchematicInfo();
```

Read `document.documentType ?? document.docType`. Observed document types are:

| Type | Editor |
|---:|---|
| 1 | Schematic sheet |
| 2 | Symbol library editor |
| 3 | PCB editor |
| 4 | Footprint library editor |
| 15 | PCB 3D preview |

Library open calls use string library types `"2"` for symbols and `"4"` for footprints. These values are not interchangeable with active document types.

EasyEDA can keep a PCB iframe alive while the visible document is type 15. A frame's existence does not prove that the PCB editor is active. Activate and verify the exact PCB for a mutation. A focus-free read against a hidden frame is acceptable only when the operation is read-only and the script guards the exact PCB identity.

There is no proven public open-by-UUID path that handles every schematic-sheet state. For a sheet-local mutation, require the intended sheet to be visible and verify its UUID, title, type, and tab immediately before apply.

## Discover and read

Use `easyeda_control_exact_read` when a claim must be complete enough for mutation proof. The facade generates the source, checks exact project/document/type/tab at generated entry and after each call, validates an explicit payload shape, runs it twice, and rejects unequal samples. Both samples are bound to one authenticated renderer session. It still cannot detect a user switching away and back inside that same renderer while an awaited reader executes. Keep the active tab unchanged for the entire read or guarded operation. Exact field coverage and limitations are listed in [capability-matrix.md](capability-matrix.md).

Use `easyeda_control_discover` to inspect upstream tool schemas. During orphan-risk quarantine it returns a conservative facade-local snapshot of the reviewed 116 tool names and classifications, marks live schemas unavailable, and does not start or connect the upstream process. After recovery it uses the live catalog. Use `easyeda_control_read` or `easyeda_control_read_batch` for bounded advisory queries. They bind available project/document/tab arguments, enforce editor-family compatibility, and compare context before and after dispatch. The admitted PCB constraint readers must derive their board data from the proven live board; the facade rejects any caller-supplied `boardData` property. Context checks do not prevent an asynchronous upstream handler from sampling a different tab between those checks, including a switch away and back. Generic reads may supplement an audit but cannot satisfy guarded mutation phases.

The facade excludes upstream tools that are labeled read-only but mutate visible UI state. In the pinned upstream build, `easyeda_canvas_locate` changes the viewport and `easyeda_schematic_layout_qa` can capture with selection clearing by default; neither is admitted through generic reads. Use the guarded capture path for supported visual evidence.

Every mutation phase must include the facade-owned exact readers required by the state machine, including exact all-component summary, detailed one-target state, PCB primitive inventory, and PCB rules. Health, catalog, guidance, transaction-status, fallback-empty, reduced-summary, and context-free calls are never design proof.

For large output, choose `summary` or `receipt-only` and supply fresh result and receipt paths below the reported control data directory. The facade reserves both before dispatch and finalizes a failure receipt after an uncertain dispatched call. If the facade process exits after publishing the result but before committing the receipt, call `easyeda_control_evidence_recover` with the same two paths. It reconstructs the reservation and never repeats the EasyEDA call. Then use `easyeda_control_evidence_verify` and page the managed result with `easyeda_control_artifact_read`.

## Raw execution

Raw JavaScript is unrestricted and is not a read sandbox. Standalone `easyeda_control_execute` is structurally disabled in this release and has no environment opt-in. Add a new narrow typed capability with a complete effect model, journal, exact verifier, and ambiguous-call recovery path instead of trying to bypass the facade.

Raw execution rules:

- `confirmWrite: true` is required by the upstream raw executor for every script; it is risk acknowledgement, not design authorization.
- The allowed timeout is 1,000 through 60,000 milliseconds.
- Await every EasyEDA call.
- Split long work into deterministic stages instead of extending the timeout.
- Return compact objects containing strings, numbers, booleans, nulls, and short arrays.
- Do not return runtime objects. Deep output can collapse to `[MaxDepth]` and destroy the evidence.
- Treat MCP `isError`, outer failure fields, and nested EasyEDA failure fields as failures.

Raw code cannot appear anywhere in a guarded plan. Guarded apply and rollback use a facade-internal pseudo-call that generates one exact component patch from the durable journal. The facade's standalone static checks are defense in depth, not a JavaScript security boundary.

## Captures

Use `easyeda_control_capture` for application images. It accepts only these upstream capture tools:

- `easyeda_canvas_capture` for the current visible canvas;
- `easyeda_canvas_capture_region` for a framed schematic or PCB area;
- `easyeda_schematic_capture_full_page` for a deterministically framed active schematic sheet, or an approximate diagnostic image when inferred-A4 fallback is explicitly allowed.

Guard the exact context and runtime fingerprint, and pass `arguments.tabId` equal to the active proven tab. Fresh managed evidence paths are mandatory. The facade parses the complete non-interlaced PNG chunk stream, verifies chunk CRCs, inflates it to the exact IHDR-derived byte count, checks scanline filters, stores the image bytes, and records their hashes so the receipt identifies the exact files.

Region and full-page capture change the user's visible viewport because EasyEDA has no offscreen renderer for those paths. They do not change design objects. Capture the intended tab or sheet, then recheck active context before a later mutation.

When the full-page result says its geometry came from inferred A4, it is approximate viewport evidence only. It cannot prove page completeness, design coverage, or that every primitive was inside the frame. Use only a deterministic sheet source for a completeness claim.

Use images to inspect legibility, approximate placement, and obvious visual defects. Do not use a screenshot as proof of net membership, primitive identity, clearance, drill size, save state, or persistence. Pair it with structured readback.
