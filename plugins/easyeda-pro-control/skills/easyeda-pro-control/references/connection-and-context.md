# Connection and context

## Open an existing saved project from Start Page

After contained launch and authenticated status, `easyeda_control_runtime` accepts `request.action:"open-existing"` with `projectUuid`, `projectPath`, `documentUuid`, `documentType:1|3`, the current `expectedFingerprint`, and `confirmOpen:true`. The target must already exist in the saved `.eprj2` checkpoint and the native project-path registry. This path does not require a fabricated active-editor context.

The operation refuses another active project or document and checks the entire split-screen tab tree for hidden unrelated editors. It does not create, replace, close, save or discard a project. It opens only the existing target, verifies its actual tab/context, and checks the complete logical SQLite dump plus all materialized selected-branch document records for changes. This proves saved-state invariance, not that previously unsaved editor contents equal the database.

On failure, use `inspect-open` with its operation ID. If orphan risk remains, `recover-open-authority` requires the normal retained-runtime recovery and `confirmRecovery:true`. `reconcile-open` performs read-only exclusive-tab inspection and database proof without repeating navigation. A later facade-only upgrade can use `rebind-open-runtime` with the replacement fingerprint and `confirmRuntimeUpgrade:true`. No recovery branch chooses Save or Discard or infers a successful open from an unchanged database.

For a non-orphan pending project-open failure, `inspect-editor-tabs` with that operation ID captures bounded native tab IDs, ownership/type fields and tree shape without titles or document content. It retains the same runtime and database checks. Use this evidence to diagnose the exact tab guard; it neither navigates nor completes the pending operation.

## Setup and startup diagnosis

The portable `.mcp.json` invokes `node scripts/launch-machine.ts`, not hard-coded workstation paths. Configure the owner-only profile with `node scripts/configure-machine.ts --upstream-root /absolute/upstream --assets-root /mnt/drive/path/resources/app/assets`; optional explicit Node/control-directory/editor-version flags and WSL/Windows prerequisites are documented in the root README. The upstream checkout must already contain the reviewed built `dist/index.js` and dependency tree; configuration does not fetch or build it. The default profile is `~/.easyeda-pro-control/machine-profile.json`; `EASYEDA_MACHINE_PROFILE` selects another private profile. Configuration validates locations and versions but does not alter compatibility admission.

Reuse a profile with `node scripts/configure-machine.ts` or `node scripts/configure-machine.ts --profile /absolute/control/machine-profile.json`, without overrides. Overrides against an existing profile are refused. A fresh explicit profile belongs inside its owner-only control directory; never switch directories to evade the lease or quarantine.

Provisioning and bridge-building CLIs do not load `EASYEDA_MACHINE_PROFILE`. For a nondefault profile directory, set `EASYEDA_CONTROL_DATA_DIR` to that same directory for both `bridge:provision` and `bridge:build`. Otherwise those commands select the default token and receipt locations. Reuse the existing valid key; a profile-path mismatch does not require key rotation.

For API writes, use the retained `easyeda_control_runtime` launch. A separately running app can be discovered, inspected and normally closed through `easyeda_control_native_ui` before a contained launch. That native bootstrap does not need bridge status or an active document, but it must preserve unrelated work at prompts.

Marketplace installation does not provision a token or import an EasyEDA extension. This release requires the locally built, private mutually authenticated bridge extension. From a trusted plugin checkout with the pinned Node/npm installed, run `ulimit -c 0`, verify `test "$(ulimit -c)" = "0"`, then run `npm run bridge:provision` and `npm run bridge:build`. Reuse an existing valid key unless rotation is requested. Import only the exact content-addressed `.eext` path reported as `outputPath` through EasyEDA's Extension Manager. The fixed `.eext.receipt.json` selects the current generation. Never choose an archive by wildcard. Treat the key and generated `.eext` as credentials: do not print, share, commit, or loosen their permissions. The fixed loopback handshake never transmits the HMAC key. Restart the MCP after import and require authenticated status evidence. Do not substitute the unauthenticated stock bridge.

In EasyEDA's native Extension Manager, distinguish **EasyEDA Pro Control Authenticated Bridge** from the stock **MCP Pro Bridge**. Disable the stock bridge when switching to the companion; importing one does not replace the other's different UUID. Enable external interaction for the companion in the native UI, then use its **Authenticated Control Bridge** menu. Do not edit extension storage directly or infer active enablement from stored archive metadata.

Distinguish these failure layers before changing anything:

| Observation | What it proves | Next step |
|---|---|---|
| Tool is absent or host rejects dispatch as unavailable | No facade handler result | Check the plugin's enabled state. For authorized EasyEDA work, the bundled foreground MCP client below can use the same facade when no other owner is active. Never start a second owner or use a new data root to evade the lease. |
| Structured status error during upstream startup | Facade handler ran, but startup failed | Run `npm run doctor` offline from the trusted checkout. Use reported stage/exit details and failed checks; private stderr remains withheld. Do not infer the cause from its hash or length. |
| Status succeeds but has no authenticated session | Upstream responded; extension connection is unproven | Verify the selected receipt/import and bridge connection. Do not call context or design readers yet. |
| Authenticated session with `validation-required` tuple | Connection succeeded; compatibility remains unadmitted | Collect bounded status/context/public-read evidence for review. Exact/private calls remain blocked. |

Local `easyeda_control_discover` is available independently of upstream startup. It defaults to `source: "local"`, `mode: "read"`, reports `catalogSource` and `schemasAvailable`, and identifies an admitted `facadeTool` or `availability: "unavailable"`. It never starts an upstream process in local mode. For current argument schemas, explicitly request `source: "live", includeSchemas: true` only after startup succeeds. During quarantine that request falls back to the marked local catalog. A catalog entry is not proof that its operation is allowed or that an extension is connected.

Passing the offline doctor does not prove startup under the model host's process environment and does not clear a failed live status. Older installed snapshots may report only the private stderr length/hash; do not invent missing stage or exit evidence.

When present, status `bridgeConnection` reports bounded fixed-code counters and timestamps. `observedUpgradeCount: 0` means this gateway observed no valid WebSocket upgrade, not that no TCP traffic arrived. `origin-rejected`, `authentication-failed`, `authenticated-build-mismatch`, and `credential-epoch-mismatch` separate Origin policy, authentication/protocol, archive and epoch failures. `authentication-failed` alone does not establish a key mismatch or justify rotation. `lastFailure` is historical and may remain after a later `session-established`; require the current authenticated session, not a counter, for live work. These diagnostics are not part of the stable authority fingerprint. Do not repeatedly poll an unchanged disconnected state.

`upstreamProcess` retains fixed protocol-failure codes, process exit status, and private stderr byte count/hash, including after close. Its `stage` is the last startup stage, not a claim that a connected process is still initializing. Raw log contents remain withheld. The reviewed logger transform sends warnings/errors synchronously to stderr; stdout is exclusively JSON-RPC.

Exact-reader failures can identify their reader kind, stage, API, method and
expected field type. These are allowlisted diagnostic values, not native error
messages. Use them to inspect the matching adapter; do not infer missing design
state from a failed getter or relax its validation.

Heartbeats can continue while the extension's serialized command handler is stuck. A healthy heartbeat with `bridge.status_error`, a timed-out `system.getStatus`, or dispatcher source `server_registry` is not a usable exact-read session. Require responsive loader-reported status and the full pinned fingerprint. After a failed read, inspect journals before recovery; do not apply the ambiguous-write restart procedure to an empty journal by inventing an attestation.

## Foreground MCP session

`scripts/control-session.ts --plugin-root /absolute/trusted/plugin` is a persistent client for the facade, not a second bridge implementation. Run it with the pinned Node runtime and `ulimit -c 0`. Retain stdin so later requests reach the same process. Use an ordinary pipe, or configure the foreground PTY with `stty -icanon -echo` before starting the client. Linux canonical terminal input has a 4,096-byte line limit and can truncate a complete fingerprint request before the client receives it. The client accepts request lines up to 65,536 bytes; it cannot recover bytes discarded by the terminal. With a PTY, send each JSON request followed by a newline and shut down using the JSON command below, not Ctrl-D.

The selected plugin must have its reviewed bundle and `.mcp.json`; the client checks bundle hashes and starts only that facade. Its existing atomic lease rejects a concurrent owner. Do not stop a host-owned facade or substitute another data directory to make the client start. A truncated line returning `invalid-request` with `dispatched:false` was not dispatched. Close that client, fix the terminal mode, then establish status and context in the replacement session before resubmitting a scoped request. This does not permit retrying an ambiguous dispatched call.

After its `ready` response, send one JSON request per line:

```json
{"id":1,"tool":"easyeda_control_status","arguments":{}}
```

Only tools actually listed by that facade are accepted. The client dispatches serially and never retries a timeout, disconnect, or failed result publication. Such failures close the session; inspect the facade journal before retrying an uncertain operation. Tool error results remain errors, even though transport succeeded. All facade authentication, compatibility, quarantine and writer restrictions remain in force.

For a large response, supply `responseFile` with a fresh absolute filename inside an existing canonical owner-only `0700` directory. The client creates it exclusively at `0600` and reports its size and SHA-256. This transport result is not a facade evidence receipt. Use the facade evidence tools for engineering proof.

End with `{"id":2,"shutdown":true}` or close stdin. The client closes the MCP transport and its facade. Do not launch the upstream, expose raw JavaScript, or infer connection from the client's `ready` message.

## Prove the chain

Start with `easyeda_control_status`. The following describe a fully admitted connection. Candidate validation may collect status, context, and narrowly reviewed public generic reads with the actual fingerprint while the connected build ID is `validation-required`. That exception never admits exact/private operations or bypasses authentication, launcher identity, quarantine, or context checks:

- the control facade is responsive;
- the upstream MCP child is responsive;
- the EasyEDA bridge extension is connected to that child;
- exactly one server owns the extension-facing bridge;
- the application, MCP, and extension versions are present;
- the stable fingerprint pins the exact Node executable, entrypoint, complete built module tree, and the full upstream execution closure captured before launch: `dist`, `node_modules`, `package.json`, dependency lockfile, and in-tree symlink mappings;
- the stable fingerprint pins the native descriptor-sanitizer schema/SHA-256 and exact Bubblewrap executable; the sanitized launch must succeed before the upstream can report readiness, and the offline doctor must also pass its direct runtime probe;
- the authenticated extension and facade share an owner-only HMAC key used only for nonce challenge/response on the fixed extension-facing `127.0.0.1:49621` gateway; the raw key never crosses that socket, the extension does not scan adjacent ports or expose a remote relay, and the gateway forwards the private backend token to the separate facade-assigned private loopback listener only after the extension presents the exact index-build ID and credential epoch from the verified private archive receipt;
- pre-authentication frames are parser-limited to 2 KiB and pending clients are bounded. The gateway admits absent `Origin` or exactly one canonical `https://client` Origin used by the pinned EasyEDA renderer; duplicate, null, foreign and noncanonical Origins are rejected. Origin is not authentication: the HMAC, exact build, key epoch and backend-owner proofs remain mandatory. The extension calls only native `SYS_WebSocket.register(id, url, receive, connected)`; its optional fifth argument is a protocol name/list, not a close callback. Native send/close return synchronously. Native timeouts, send failures and heartbeats handle connection loss; do not add browser/raw-socket fallbacks;
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

The current connected-read-admitted tuple and source-specific version/path rules are in [compatibility.md](compatibility.md#current-read-admission-2026-09-11). The facade resolves the missing public project path using an exact native registry record with original-path hash proof and post-read context equality. It checks the active schematic page separately from its parent container.

The fixed context implementation uses these public calls. They explain its
underlying evidence, not a caller-invokable script or raw execution route:

```js
const project = await eda.dmt_Project.getCurrentProjectInfo();
const document = await eda.dmt_SelectControl.getCurrentDocumentInfo();
const pcb = await eda.dmt_Pcb.getCurrentPcbInfo();
const schematic = await eda.dmt_Schematic.getCurrentSchematicInfo();
const schematicPage = await eda.dmt_Schematic.getCurrentSchematicPageInfo();
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

Exact readers use a shallow JSON envelope to preserve nested data through bridge
normalization. The facade checks its UTF-8 count and 4 MiB escaped-size limit,
then validates and compares the decoded snapshots. Placeholder-bearing results
are invalid even when stable. See [compatibility.md](compatibility.md) for the
normalizer boundary; generic reads remain advisory.

Use explicit live `easyeda_control_discover` to inspect current upstream tool schemas. Its default local mode uses the reviewed 116-tool snapshot without starting a bridge. Use `easyeda_control_read` or `easyeda_control_read_batch` for bounded advisory queries. They bind available project/document/tab arguments, enforce editor-family compatibility, and compare context before and after dispatch. The admitted PCB constraint readers must derive their board data from the proven live board; the facade rejects any caller-supplied `boardData` property. Context checks do not prevent an asynchronous upstream handler from sampling a different tab between those checks, including a switch away and back. Generic reads may supplement an audit but cannot satisfy guarded mutation phases.

The facade excludes upstream tools that are labeled read-only but mutate visible UI state. In the pinned upstream build, `easyeda_canvas_locate` changes the viewport and `easyeda_schematic_layout_qa` can capture with selection clearing by default; neither is admitted through generic reads. Use the guarded capture path for supported visual evidence.

The typed design executor selects complete source/native readers and applicable topology proof for its operation. Health, catalog, aggregate counts, fallback-empty and context-free responses are never design proof. The old mandatory one-target PCB reader list belongs to the disabled legacy writer.

For large output, choose `summary` or `receipt-only` and supply fresh result and receipt paths below the reported control data directory. The facade reserves both before dispatch and finalizes a failure receipt after an uncertain dispatched call. If the facade process exits after publishing the result but before committing the receipt, call `easyeda_control_evidence_recover` with the same two paths. It reconstructs the reservation and never repeats the EasyEDA call. Then use `easyeda_control_evidence_verify` and page the managed result with `easyeda_control_artifact_read`.

## Raw execution

Raw JavaScript is unrestricted and is not a read sandbox. Standalone `easyeda_control_execute` is structurally disabled in this release and has no environment opt-in. Add a new narrow typed capability with a complete effect model, journal, exact verifier, and ambiguous-call recovery path instead of trying to bypass the facade.

Only facade-generated typed programs may enter the private executor. Caller raw code cannot appear in a design, batch, library or native UI request. Add a maintained typed capability when a required API is missing; do not bypass the facade.

## Captures

Use `easyeda_control_capture` for application images. It accepts only these upstream capture tools:

- `easyeda_canvas_capture` for the current visible canvas;
- `easyeda_canvas_capture_region` for a framed schematic or PCB area;
- `easyeda_schematic_capture_full_page` for a deterministically framed active schematic sheet, or an approximate diagnostic image when inferred-A4 fallback is explicitly allowed.

Guard the exact context and runtime fingerprint, and pass `arguments.tabId` equal to the active proven tab. Fresh managed evidence paths are mandatory. The facade parses the complete non-interlaced PNG chunk stream, verifies chunk CRCs, inflates it to the exact IHDR-derived byte count, checks scanline filters, stores the image bytes, and records their hashes so the receipt identifies the exact files.

Region and full-page capture change the user's visible viewport because EasyEDA has no offscreen renderer for those paths. They do not change design objects. Capture the intended tab or sheet, then recheck active context before a later mutation.

When the full-page result says its geometry came from inferred A4, it is approximate viewport evidence only. It cannot prove page completeness, design coverage, or that every primitive was inside the frame. Use only a deterministic sheet source for a completeness claim.

Use images to inspect legibility, approximate placement, and obvious visual defects. Do not use a screenshot as proof of net membership, primitive identity, clearance, drill size, save state, or persistence. Pair it with structured readback.
