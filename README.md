# EasyEDA Pro Agent Plugin

`easyeda-pro-control` is a Codex skill and MCP facade for EasyEDA Pro inspection and typed API editing, with native controls for missing APIs and dialogs. It provides version-pinned readers, component and geometry transactions, operation-specific library/export workflows, SQLite checkpoints, hash-bound evidence and recovery journals.

The package enables typed editing through `easyeda_control_design` and supported operations through `easyeda_control_library`. Their guards require the reviewed runtime, an authenticated session, a retained Windows process Job, journaled before-state and exact effect verification. Design commit saves and reopens the document, then compares the complete selected-branch project records. The legacy writer remains runtime-disabled: `plan`, `apply`, `verify`, `rollback`, and `save_reopen` are retained refusal endpoints, not the new transaction API. Unrestricted JavaScript has no environment opt-in. Coverage and live validation remain operation-specific.

The October revamp consolidates the September repairs and adds an offline API
reference, exact typed-operation schemas, argument validation, bounded editor
readiness observation and a durable no-repeat Save guard. Failed navigation is
observed and reconciled, not blindly replayed. A failed Save cannot become
repeatable through reconciliation or runtime rebinding.

The source catalog has 26 tools. `easyeda_control_api` exposes 93 reviewed
namespaces / 749 declared signatures and 99 latest official namespaces / 806
signatures. Its `coverage` action inventories all 774 distinct mounted method
paths, linking each to a direct public call, narrower native task equivalent,
internal lifecycle use, or a concrete omission reason and required work.
`sdk-reads` and `sdk-validate` expose the exact schemas and offline argument
checks for the fixed `easyeda_control_sdk_read` allowlist. That separate live
tool performs local getters, fixed primitive-state projections and bounded pure
calculations with authenticated context checks and two matching samples. Three
explicitly classified native equivalents read standalone Text IDs and Wire/Bus group IDs
without the public callbacks or compiler; only the active ordinary page and
empty arguments are supported. A separate native equivalent collects all direct
component attribute names, including inherited attributes, drawing frames and
flags, with complete bounded model membership checks. An ordinary project-symbol
Pin equivalent independently proves membership and matches all twelve explicit
getter fields; custom attributes and multipart symbols refuse. Native Text
`get/getAll` return bounded root-Text state with native coordinates and nullable
styles, not public-getter parity. Wire/Bus `get/getAll` preserve every line's native
geometry/style and all literal names instead of flattening them to one style/net.
Filtered PCB net membership derives identity records from complete requested-family
source/inventory agreement, with explicit standalone/component pad roles.
Native PCB type lookup classifies an existing ID only after complete all-five-family
source/inventory agreement, including unassigned objects. Missing or unsupported
IDs refuse rather than reporting false absence. The native active-layer reader
matches the native document source's selected layer to the complete public layer list.
It preserves raw color strings, including malformed values returned by EasyEDA.
The fixed read catalog has 175 routes, including
bounded polygon splitting that preserves input source arrays and their order. It
accepts no arbitrary method path, caller code, callbacks, navigation or writes.
None of these observations replaces complete design or persistence proof.

The deprecated schematic selection getter now has an explicit replacement
adapter. It uses the documented modern getter under ordinary-page checks and
never calls the obsolete iframe path that can silently report no selection.
Returned wire-segment selections retain the replacement's parent-group IDs.

Installed `071500` passed scoped disposable checks for active Top Layer,
ComponentPad/Via net membership and one selected ordinary component, preserving
complete native and saved-project state. These cases do not validate other
primitive families or admit a later facade build.

The inventory also maps the existing visible-canvas image and region-zoom
workflows. Capture rechecks the complete runtime fingerprint before accepting
managed PNG evidence. This is viewport evidence, not design-state or visual
acceptance. Project-open failures now retain fixed diagnostic categories through
recovery without storing raw private error messages or repeating navigation.

Latest declarations are not runtime admission. Exact operation schemas cover
105 design actions and 68 library/lifecycle actions; schema availability does
not guarantee execution support. The [coverage inventory](docs/api-coverage-inventory-2026-10-10.md)
and [feasibility review](docs/api-execution-feasibility-2026-10-10.md) name the
remaining work. Closed symbol/page metadata, empty-page and empty-symbol creation, existing-tab
activation and inactive clean-tab close have tracked executor and recovery
paths. Their scopes and remaining connected acceptance are explicit; a public
acknowledgment alone never completes a lifecycle operation. A separate closed
PCB/schematic-container rename adapter requires one other clean PCB, complete
checkpoint invariants and independent DOM checks. It preserves the original
acknowledgment through recovery, performs no Save and has no connected acceptance
yet. The [remaining-effects review](docs/api-remaining-method-effects-2026-10-11.md)
also records concrete blockers for layer selection, page ordering, pad-pair groups
and PCB text. A separate checkpoint-bound flat-topology
diagnostic avoids the mutating netlist exporter. A separate sealed single-page
profile admits only existing stored attribute/text display patches, with exact
inverse, endpoint and whole-project persistence checks. It does not re-enable
electrical edits or historical compiled transactions. Imported library atom provenance has a separate
sealed v2 profile: unchanged SYMBOL/FOOTPRINT peers retain every header occurrence,
raw encoding and tombstone across the lifecycle. Default parsing and legacy v1
remain strict. See the [imported-library contract](docs/native-library-import-history-2026-10-11.md)
and [release evidence](docs/imported-library-peers-release-2026-10-11.md).
Installed `083400` passed imported-project opening, nonempty native flat topology
and forward/reverse stored Designator-coordinate transactions through Save and reopen. The
complete 12-document fixture proof retained imported headers and both pin nets.
See the [scoped fixture evidence](docs/api-coverage-083400-fixture-validation-2026-10-11.md).
The reverse restored the original source exactly. Unsaved rollback and the newer
source generation remain separate validation.
The `202803` disposable text edit reached the intended
state but stopped before Save on a raw source-format comparison defect. Installed
`210100` recovered that journal after one inverse and delayed native persistence,
with complete nine-document restoration proof and no Save. This does not validate
an immediate inverse. A separate `210100` single-text transaction passed Save,
close, reopen and complete saved-project verification. Installed `223200` also
passed both native Text-state readers and one stored frame-attribute display
edit with complete nine-document saved proof and one Save/close/reopen. These
older fixtures contain no electrical parts. The new source still needs its own
connected admission and new read-route checks.
Native discovery handles minimized windows, and
bounded recovery-history caches preserve fresh content verification.
Offline tests do not establish connected validation for this release.
The [lifecycle continuation](docs/api-coverage-lifecycle-continuation-2026-10-10.md)
records disposable refusal recovery and the latest guarded adapters.
See the [API research](docs/easyeda-extension-interface-research-2026-10-10.md)
and [reliability review](docs/revamp-reliability-review-2026-10-10.md).
The [independent review follow-up](docs/revamp-final-review-2026-10-10.md)
also covers descriptor-bound Node launch, timeout-envelope classification and
bounded upload-barrier diagnostics.

## Skills by task

| Skill | Use |
|---|---|
| [easyeda-pro-control](plugins/easyeda-pro-control/skills/easyeda-pro-control/SKILL.md) | Live setup, exact inspection, typed editing, dialogs and recovery |
| [easyeda-schematic-design](plugins/easyeda-pro-control/skills/easyeda-schematic-design/SKILL.md) | Circuit definition, readable sheets, connectivity and ERC |
| [easyeda-pcb-layout](plugins/easyeda-pro-control/skills/easyeda-pcb-layout/SKILL.md) | Stackup, placement, power/return paths, routing and DRC |
| [easyeda-component-library](plugins/easyeda-pro-control/skills/easyeda-component-library/SKILL.md) | Symbols, footprints, terminal mapping and device/model associations |
| [easyeda-manufacturing-release](plugins/easyeda-pro-control/skills/easyeda-manufacturing-release/SKILL.md) | Fabrication/assembly exports and independently inspected release evidence |
| [electronics-design-review](plugins/easyeda-pro-control/skills/electronics-design-review/SKILL.md) | Evidence-backed electrical, layout, library and manufacturing review |
| [easyeda-extension-development](plugins/easyeda-pro-control/skills/easyeda-extension-development/SKILL.md) | Pro SDK research, narrow adapter implementation and compatibility validation |

The design skills include task-specific checklists, detailed references and
dated primary-source research. They distinguish electrical design judgment from
editor control and do not authorize purchases, uploads or live edits. Historical
live coverage is recorded in the [capability matrix](plugins/easyeda-pro-control/skills/easyeda-pro-control/references/capability-matrix.md);
new offline regression tests are not new live editor validation. Completed
historical operations must never be replayed. No design is fabrication-approved
merely because it passed ERC/DRC or exported successfully.

## Architecture

```text
Codex skill
    │
    ▼
easyeda-pro-control safety facade ───► durable journals, evidence, checkpoints
    │                         │
    │                         └── HMAC gateway ◄──► private EasyEDA extension ◄──► EasyEDA Pro
    ▼
native descriptor sanitizer
    │
    ▼
Bubblewrap + Node permission boundary
    │
    ▼
descriptor-mounted reviewed easyeda-mcp-pro module graph
```

The facade is the sole bridge owner. It does not execute the mutable upstream
checkout directly: it captures and hashes the statically reachable module
graph, mounts that graph and the reviewed supervisor from retained descriptors,
and starts the pinned upstream in a minimal sandbox. Do not run a second
EasyEDA MCP process against the same bridge.

For authorized EasyEDA work when the host does not expose MCP tools,
`scripts/control-session.ts` provides a persistent foreground client for the
same facade. Run this developer CLI from a trusted checkout after `npm ci`
with the pinned toolchain; it is not a dependency-free installed runtime.
`--plugin-root` may select a Git-installed plugin. It uses that plugin's `.mcp.json`, checks its reviewed
bundle, and retains the normal single-owner lease. Use a normal pipe or a
noncanonical PTY so terminal input does not truncate fingerprint requests. See
the skill's [connection reference](plugins/easyeda-pro-control/skills/easyeda-pro-control/references/connection-and-context.md#foreground-mcp-session)
for terminal setup and the JSON-line protocol. `easyeda_control_native_ui` wraps
the packaged native Windows helpers, bound to the installed executable digest,
process generation and current owned window. It works on Start Page and native
dialogs without an authenticated bridge. Native edits still require independent
saved-and-reopened verification and do not grant retained Job authority.

The native Linux x86_64 sanitizer closes the descriptor-inheritance gap between
Node and Bubblewrap. The facade gives it the expected facade PID and exactly
this descriptor layout: MCP stdin/stdout/stderr on `0`–`2`, the data directory
on `3`, module graph on `4`, supervisor on `5`, Bubblewrap status pipe on `6`,
reviewed Node executable on `7`, startup block pipe on `8`, seccomp program on
`9`, and the already hash-admitted Bubblewrap executable on `10`. The sanitizer
requires every descriptor `0`–`10` to be present without `FD_CLOEXEC`, binds its
lifetime to the unchanged expected parent with `PR_SET_PDEATHSIG(SIGKILL)`, and
requires descriptor `10` to be a regular mode-`0755` file with no
`security.capability` xattr. It then marks `10` close-on-exec, atomically closes
all descriptors `11` and above with `close_range(2)`, and enters Bubblewrap from
descriptor `10` with `execveat(2)`. Bubblewrap receives only descriptors `0`–`9`;
an arbitrary descriptor inherited by the facade's shell cannot reach it.

## Implemented capabilities

The live evidence in this section is historical and operation-specific. It is
not a connected test of the October facade generation.

The October API audit found hidden annotation and Save All in the previously
used schematic netlist path. Current code refuses `schematic-topology` and
dependent schematic transactions before dispatch. It also refuses schematic
netlist/BOM/document and PCB netlist/BOM/PDF exports that can save dirty tabs,
plus simulation export outside its required NGSPICE editor. Historical matching
outputs did not establish read-only execution. See the
[source-backed safety review](docs/api-coverage-review-2026-10-10.md).

The current tuple is connected-read-admitted following authenticated status,
PCB and schematic public-read smoke tests against an independently decoded,
saved disposable project, plus installed-source review. Exact reads require
that complete pinned tuple on every call; later mismatches remain fail-closed.
Admission does not claim every reader variant or typed writer has passed a live test.

Historical live validation included schematic components and compiled topology. The
in-memory `getNetlistFile` topology route returned the four expected fixture
endpoints in two identical samples. Revised PCB component and inventory readers
also passed with two components, four direct pads and one outline; all four
pad-parent correlations and expected net endpoints matched, and evidence receipt
verification passed. The lossless PCB rules recheck also passed with equal
samples and no placeholders. Exact results use a
bounded, shallow JSON envelope so the bridge cannot replace nested rule data
with depth-limit markers; earlier placeholder-bearing rule results are invalid
as complete evidence.

- Exact double-sampled schematic component reads. Compiled topology is currently disabled for the hidden-Save reason above.
- Exact PCB component, direct-pad, primitive-inventory, net, rule, class, differential-pair, and equal-length-group reads.
- Conservative generic reads with project, document, editor-type, and tab binding.
- SQLite online checkpoints with `quick_check`, logical database comparison, and self-hashed receipts.
- Full-page and viewport capture with PNG signature, chunk, CRC, zlib, scanline, geometry, and payload/image binding checks.
- Draft PCB DSN route-context export with descriptor-bound exclusive artifact creation, inode/hash-bound receipts, and hash-bound failure evidence.
- Durable ambiguous-call recovery with one-use nonce challenges and a global bridge quarantine.
- Typed PCB and schematic transactions with exact source effects, scoped durable baselines and explicit commit or verified inverse.
- PCB batches of up to 256 sequential typed effects, journaled created-ID references and locked-part preservation. Pure geometry uses one source merge; batches containing supported rules use ordered source-bound public writer steps. Stack and copper rebuild are separate operations.
- Supported project-library footprint edits, DEVICE creation and association changes, existing external model binding, device-default model transforms, and bounded file exports through an explicit capability catalog.
- Process-bound native window discovery, inspection, confirmed input and normal close without automatic save/discard choices.

DEVICE creation binds existing project symbols and footprints without importing assets. Association editing preserves other device metadata and refuses implicit inherited binding changes. Device-default transform edits instead require the exact acknowledged inheriting instances and preserve all stored placement records. Existing 3D model assignment uses exact external identities and stable metadata reads. These source capabilities have separate live-validation status; see the [library workflow](plugins/easyeda-pro-control/skills/easyeda-pro-control/references/libraries-and-eco.md).

Live evidence includes the five exact reader kinds; PCB component movement with save/reopen/inverse; schematic property restoration, a PCB batch and copper clear with saved/reopened full-project proof; recovered copper rebuild without repeating Save; itemized ERC/DRC; route centerline/width reporting; and a managed schematic netlist export. Earlier line creation/inverse had live-only proof, and footprint-library creation had durable addition proof without reopen. After its initial persistence failure, the repaired stack and a net-class edit passed save/reopen with all 14 fixture documents checked. DEVICE creation, reassignment and inherited-model transform passed complete durable proofs. Symbol geometry subsequently passed save/reopen with a separately proved prior transaction's delayed inverse, explicitly reported as `isolatedTransaction:false`; it is not an unchanged-collateral claim. A footprint LINE then passed save/reopen and complete 14-document proof. Remaining geometry paths need their own live checks. See the [capability matrix](plugins/easyeda-pro-control/skills/easyeda-pro-control/references/capability-matrix.md) for exact phases and limits. ECO remains a native dialog workflow. Unsupported operations, arbitrary code, database restore and fabrication submission are not enabled. This is not a production-live build approval for a user's design.

The installed package's PAD test initially saved successfully but failed library reopen. Retained recovery subsequently completed the original transaction as `saved:true,reopened:true`, with exact live and complete 14-document durable proof. Neither the original edit nor Save was repeated. A recovery target-open readback had separately failed before the exact target was confirmed read-only; that navigation result is not reclassified as success.

For startup trouble, use `easyeda_control_discover` in its default local mode.
It works without starting the upstream and marks each catalog entry with its
admitted facade route or `unavailable`. Upstream annotations are not permission
to call a tool. Request `source: "live", includeSchemas: true` for current
argument schemas only after startup succeeds. Startup errors report a fixed
launch stage and observed exit status while keeping private diagnostic text
withheld. The skill's connection reference distinguishes host dispatch failure,
upstream startup failure, an unauthenticated extension, and compatibility drift.
Runtime diagnostics retain fixed protocol/exit codes and exact-reader field/stage
categories without exposing native error text. The reviewed logger writes
synchronously to stderr, keeping warnings and errors out of JSON-RPC stdout.

## Install from this GitHub marketplace

The Codex marketplace manifest is [`.agents/plugins/marketplace.json`](.agents/plugins/marketplace.json).

These commands install the published GitHub snapshot. Check its plugin version
and actual tool catalog; an older cached snapshot can differ from this checkout.

```bash
codex plugin marketplace add https://github.com/jan-guenter/easyeda-pro-agent-plugin
codex plugin add easyeda-pro-control@easyeda-pro-agent
```

Start a new Codex task after installation so the skill and MCP catalog are loaded from the new marketplace snapshot.

Marketplace installation does not create a credential or modify EasyEDA. From
a trusted checkout of this repository, provision the owner-only bridge token
and build the matching private extension:

```bash
cd plugins/easyeda-pro-control
ulimit -c 0
test "$(ulimit -c)" = "0"
test "$(node --version)" = "v24.18.0"
test "$(npm --version)" = "11.16.0"
npm ci
npm ls --all
npm audit signatures
npm audit --audit-level=moderate
npm run bridge:provision
npm run bridge:build
```

`npm run bridge:provision` creates `$HOME/.easyeda-pro-control/bridge-token` as an
owner-only, single-link file and never prints the key. It creates the immediate control directory
as mode `0700` when missing. If that directory already exists, it must be owned
by the current user and already be mode `0700`; provisioning fails with a
remediation message and never changes a pre-existing directory's permissions.
`npm run bridge:build` embeds that HMAC key in a private, content-addressed
`.eext` generation and atomically commits a non-secret receipt under the
owner-only `$HOME/.easyeda-pro-control/bridge-build/` directory, outside the
repository. Import the exact generation path reported as `outputPath`; do not
select an archive by wildcard. The fixed
`easyeda-pro-control-authenticated-bridge.eext.receipt.json` receipt is the
authoritative current-generation pointer, so an interrupted rebuild leaves the
prior generation authoritative. An explicit `--output` value is a logical base
name for that fixed receipt, not the final archive name, and must end in `.eext`.
Use the bare default command for the facade-loaded production build: the current
facade admits only the fixed default receipt. Alternate bases are for isolated
build verification. The builder double-samples the reviewed source identities
and metadata, descriptor-reads the stable files directly into a hash-verified
memory snapshot, and gives esbuild and the archive packager only that snapshot.
It creates no mutable source-staging tree, and neither consumer rereads source
paths after capture.

The archive and receipt commit is serialized by an owner-only hard-link lock
named `.<output-base>.archive-receipt.lock` in the private build directory. Its
versioned record binds the Linux boot ID, PID-namespace identity, PID, process
start time, and a random nonce. A live matching owner makes contenders wait.
A dead, legacy, malformed, cross-boot, or cross-PID-namespace owner is
unverifiable: the builder fails closed and never removes the lock, because a
pathname check followed by unlink cannot safely act as compare-and-swap. A
crash before lock publication can also leave a one-link
`..<output-base>.archive-receipt.lock.<nonce>.candidate`. The builder never
deletes another contender's lock candidate; successful builds and the offline
doctor report exact candidate names observed in a read-only snapshot. An
observed name may belong to a live contender and may disappear immediately.

Manual lock recovery requires global quiescence. Stop every bridge builder in
every relevant PID namespace, then re-prove that the private build directory is
owned by the current user, mode `0700`, and still has the expected device and
inode. Never use a wildcard. For a one-link fixed lock, recheck its exact
device/inode, owner, regular-file type, and mode `0600`, then unlink only that
path. For a two-link lock, derive the exact candidate from the recorded nonce,
prove both names are the same reported inode with two links, unlink the
candidate first, recheck that the fixed lock is still that inode with one link,
then unlink the fixed lock. Treat an observed candidate without a fixed lock as
live until every builder is stopped; only then recheck that exact non-symlink,
owner-only, one-link regular file before unlinking it. If any identity, link
count, ownership, mode, or process proof differs, stop and investigate. Run the
build again after recovery; never delete a lock whose recorded owner is live.

The build rejects output inside the
plugin checkout, outside the reserved `bridge-build` subtree when it is under
the control-data directory, or overlapping the token path. An external output
directory is allowed only when an existing directory is already owner-only;
the builder may create a missing immediate parent as mode `0700`, but it never
creates missing ancestors. A crash or replacement can leave an unreferenced
immutable generation. It is still a credential: remove it only after confirming
that the fixed receipt does not select it and that no EasyEDA import still needs
it. The extension and facade authenticate each other with fresh nonces;
the HMAC key never crosses the extension-facing loopback socket. Only after the
supervisor readiness and sandbox-admission proofs does the facade frame a fresh
backend-session token on the child's stdin. The child assigns that ephemeral
token to `process.env.BRIDGE_TOKEN` for upstream compatibility; it is absent
from the launch argv and base environment and is never sent to EasyEDA. Treat
both the long-lived token and generated `.eext` as credentials. In
EasyEDA Pro, import the `.eext` through **Advanced > Extension Manager >
Import**. A build receipt proves the local artifact and reviewed source closure,
not that EasyEDA imported or loaded it; the first authenticated status call is
the live proof. Do not use the unauthenticated stock bridge with this facade, do
not commit the token or generated extension, and rebuild/reimport the extension
after rotating the token. The machine profile derives the token path inside its
control directory. Provisioning and bridge building must use that same location;
do not put credentials or workstation paths in the portable `.mcp.json`.

The fixed receipt names private dispatcher build `ded07x99dcxb504`, now
connected-read-admitted on EasyEDA Pro `3.2.149.88089769` with bridge protocol
`1.0.0`. It supersedes historical dispatcher `d18b6xd531xe6ca` for current read
admission. The health result reports the authenticated handshake's application
version; the separate bridge-status getter omits its optional application
version, pinned explicitly as `bridgeEasyedaVersion: null`. No version is copied
between those sources. A future `validation-required` tuple permits only the
bounded public validation workflow until reviewed. Never infer compatibility
from a build receipt or import alone.

## Runtime prerequisites

This compatibility release is pinned to the local integration tuple recorded in [`reviewed-compatibility.json`](plugins/easyeda-pro-control/reviewed-compatibility.json):

The supported editing/runtime profile is Linux x86_64 under WSL controlling the pinned Windows EasyEDA Pro desktop installation. Windows interop and Windows PowerShell must work, and the EasyEDA assets must be reachable through a canonical `/mnt/<drive>/.../resources/app/assets` path. The packaged helper uses a mounted path or a `\\wsl.localhost` path derived from `WSL_DISTRO_NAME`. Native Linux or macOS EasyEDA and a browser-only editor are not covered by the retained Windows Job profile. Linux facade support alone does not establish editing support on those hosts.

- Linux x86_64 on Linux 5.9 or newer. The sanitizer requires working
  `close_range(2)` and `execveat(2)`, and the filesystem holding Bubblewrap must
  expose a readable `security.capability` xattr namespace whose absent-attribute
  result is `ENODATA`. An unavailable syscall, unreadable/unsupported xattr, or
  present capability xattr fails closed.
- The committed static descriptor sanitizer must be the regular, single-link,
  mode-`0755` file named by
  [`descriptor-sanitizer-identity.ts`](plugins/easyeda-pro-control/server/src/descriptor-sanitizer-identity.ts).
  The current constants pin schema
  `easyeda-pro-control.descriptor-sanitizer.v1`, 1,440 bytes, and SHA-256
  `a8b52e8439bdb479a5621052ab03e9030d67b7948c6e2cc448ee5d7bb1dc9b41`.
  Runtime and compatibility admission reject any other identity.
- Node.js exactly `24.18.0`, the reviewed Node executable
  identity recorded in the compatibility manifest, and a soft `RLIMIT_CORE` of exactly `0`.
  The runtime's executable hash and complete file-
  descriptor baseline are exact compatibility inputs, not generic Node 24.x
  support.
- Bubblewrap exactly `0.11.2` at `/usr/sbin/bwrap`, as a root-owned,
  non-symlink, non-setuid/non-setgid mode-`0755` executable. The reviewed local
  SHA-256 is recorded in the compatibility manifest. Ubuntu 24.04's older
  distribution build does not implement the descriptor-mount options this
  sandbox requires; install or build the reviewed version rather than weakening
  the launch policy.
- EasyEDA Pro `3.2.149.88089769`
- PCB editor bundle `3.2.149.5378b690`
- public API bundle `0.2.53.aee2f57a`
- external `easyeda-mcp-pro` server `1.0.0-rc.1`
- authenticated bridge derivative reviewed against upstream commit `964c05082f1c7c9e8b98f56e967e36bfc3f26128`: distinct private package, UUID, menu, socket, and repository identity; fixed extension-facing gateway at `127.0.0.1:49621`; nonce-bound mutual HMAC authentication; exact private-build-receipt/index-bundle/key-epoch admission with fail-closed stale-runtime cleanup; a 2 KiB parser limit and bounded pending clients before authentication; absent-or-exact-native `https://client` Origin admission (never an authentication substitute); and no adjacent-port or raw/browser transport fallback or raw-secret transmission (extension manifest `0.3.0`)
- Node's built-in SQLite support plus a reviewed absolute `sqlite3` binary at `/usr/bin/sqlite3` or `/usr/local/bin/sqlite3` for deterministic logical dumps; `PATH` is never used to select it

The checked-in [`.mcp.json`](plugins/easyeda-pro-control/.mcp.json) runs `node server/dist/server.mjs --machine-launch` with an empty environment map. This bundled launcher needs no plugin `node_modules`; it loads the private machine profile, verifies its Node/install identities and starts the sole facade. `scripts/launch-machine.ts` remains a developer wrapper requiring the trusted checkout's pinned dependencies. Create a profile with `node scripts/configure-machine.ts --upstream-root /absolute/upstream --assets-root /mnt/drive/path/resources/app/assets` from that prepared checkout's plugin directory. Optional `--node`, `--control-dir`, `--pcb-version` and `--api-version` select explicit installation values. The default profile is `~/.easyeda-pro-control/machine-profile.json`; `EASYEDA_MACHINE_PROFILE` selects another existing private profile. Configuration finds paths and versions, not compatibility admission. A different tuple still needs deliberate review.

The external upstream checkout must already contain its reviewed built `dist/index.js` and dependency tree. Configuration does not fetch, install or rebuild it. The same version label is insufficient: the runtime checks the pinned module graph and executable identities.

Reuse a profile with `node scripts/configure-machine.ts` or `node scripts/configure-machine.ts --profile /absolute/control/machine-profile.json`, without configuration overrides. Overrides against an existing profile are refused. For another supported installation, create a fresh explicit profile path inside its owner-only control directory. Do not overwrite an active profile or change directories to evade the sole-owner lease or quarantine.

`EASYEDA_MACHINE_PROFILE` selects the profile for the launcher. The provisioning/build CLIs do not read that profile. With a nondefault control directory, set `EASYEDA_CONTROL_DATA_DIR` to that same directory for both `bridge:provision` and `bridge:build`; otherwise they select the default token and receipt locations. Do not rotate an existing key merely to correct a path mismatch.

## First live use

Before connecting, use `easyeda_control_api` to inspect exact operation schemas
and validate the planned arguments offline. See the skill's [API reference](plugins/easyeda-pro-control/skills/easyeda-pro-control/references/api-reference.md).

1. Inspect `easyeda_control_runtime` status. For API editing, launch a contained instance. If EasyEDA was started separately, use `easyeda_control_native_ui` discover, retain the observed binding, inspect current windows, and request a confirmed normal close before `launch-contained`. Do not discard or save unrelated work at a prompt.
2. Ask Codex to use `$easyeda-pro-control` and call `easyeda_control_status` on Start Page; require the imported private bridge to authenticate rather than treating its import dialog or build receipt as connection proof.
3. Open a saved target with `easyeda_control_runtime`, `request.action:"open-existing"`, observed `projectUuid`, `projectPath`, `documentUuid`, `documentType:1|3`, the current `expectedFingerprint`, and `confirmOpen:true`. It checks checkpoint/registry membership, exclusive tabs and the complete saved database unchanged. It does not create, replace, save or discard. See the [connection reference](plugins/easyeda-pro-control/skills/easyeda-pro-control/references/connection-and-context.md#open-an-existing-saved-project-from-start-page) for recovery; an unfinished transaction uses its own recovery path.
4. Use `easyeda_control_context` to prove the current project path/UUID and
   document UUID/type/tab.
5. For the admitted tuple, use `easyeda_control_exact_read` with the current
   context and fingerprint when complete supported fields are needed. Keep the
   active tab unchanged throughout the call. A future mismatch returns to the
   bounded public validation workflow; do not refresh the manifest to make it pass.
6. Use `easyeda_control_design` execute with a typed operation for one request that applies, verifies, saves and reopens. Use apply separately when an unsaved review or inverse is needed, followed by explicit commit. Both paths use the same whole-project record-delta proof. Inspect and reconcile an uncertain operation before proceeding; never repeat it blindly. Read the [transaction reference](plugins/easyeda-pro-control/skills/easyeda-pro-control/references/safety-state-machine.md) for rollback and recovery limits.

If any call reports bridge quarantine, use `easyeda_control_recover_incomplete` with no operation ID. Do not bypass, delete, or rewrite the journal: a delayed call may still be running.

Live context, read, capture, export, checkpoint, mutation, and recovery calls are bound to one exact authenticated renderer session through final evidence publication. A reconnect cannot substitute a new renderer with matching logical IDs. Status alone retains a disconnected read-only bootstrap mode so it can report why no authenticated session exists.

The external upstream runs from a descriptor-captured, hash-bound module graph
inside a minimal Bubblewrap mount/PID namespace. Before releasing Bubblewrap's
startup block, the facade binds the reported sandbox PID to the live Bubblewrap
monitor, process start times, `NSpid` mapping, and cgroup/IPC/mount/PID/UTS
namespace identities. The child emits readiness only after checking its mounted
supervisor, exact environment and data directory, Node permission/code-
generation policy, local descriptor baseline, kernel `connect(2)` denial, and
JavaScript network restrictions. The facade then re-proves process topology,
the exhaustive Node 24.18.0 descriptor boundary, zero soft core limit, and every
retained input seal before closing its inherited payload descriptors and
delivering the ephemeral token.

Only the dedicated owner-only data directory is writable. The host source tree,
control-root credentials, host `/proc` and `/etc`, workers, child processes,
native addons, and WASI are unavailable. The seccomp filter rejects outbound
`connect`, datagram-send, message-send, and `io_uring_setup` syscalls; the
JavaScript boundary also blocks high- and low-level client/datagram APIs and
permits the child to listen only on the exact facade-assigned private backend
loopback port. That per-start backend port is distinct from the authenticated
extension-facing gateway at `127.0.0.1:49621`. Runtime staging uses unlinked
descriptor-only payloads rather than mutable snapshot paths.

## Development

First-party MCP source, test, and plugin scripts are TypeScript. The exact Node 24.18.0 runtime runs the erasable TypeScript directly during development; `tsc --noEmit` performs the strict compiler check, and esbuild produces the committed JavaScript MCP bundle. The vendored EasyEDA renderer bridge is checked separately against its ES2020/DOM production-source target with the same strict compiler family; that profile's only exception is `noPropertyAccessFromIndexSignature`, because reverse-engineered host values are intentionally dynamic records. Its test profile targets ES2023 and permits test-only parameter properties by disabling `erasableSyntaxOnly`; those tests are never emitted into the renderer bundle. Type-aware Oxlint treats the correctness, suspicious, pedantic, performance, style, and restriction categories as errors, denies warnings, and rejects unused suppressions. Root and renderer-bridge exceptions are narrowly documented next to their rationale in `.oxlintrc.json` and `.oxlintrc.bridge.json`.

GNU binutils `/usr/bin/as` and `/usr/bin/ld` are development-only inputs for
rebuilding and byte-verifying the static sanitizer. An installed release runs
the committed reviewed binary and does not invoke binutils. `sanitizer:check`
builds twice, requires byte-for-byte reproducibility, and compares the result
with the identity constants and committed executable.

```bash
cd plugins/easyeda-pro-control
ulimit -c 0
test "$(ulimit -c)" = "0"
test "$(node --version)" = "v24.18.0"
test "$(npm --version)" = "11.16.0"
npm ci
npm ls --all
npm audit signatures
npm audit --audit-level=moderate
npm run sanitizer:check
npm run typecheck
npm run bridge:typecheck
npm run bridge:lint
npm run lint
npm run build
npm run compatibility:check
npm test
npm run bridge:test
npm run validate
```

Repository validation runs from the marketplace root:

```bash
npm --prefix plugins/easyeda-pro-control run repository:validate
```

GitHub Actions installs binutils, rebuilds the sanitizer twice, and requires its
exact committed identity before building the plugin. The sandbox regression
also injects otherwise valid high-numbered host descriptors and proves that
they cannot reach Bubblewrap. CI separately builds the exact non-setuid
Bubblewrap 0.11.2 source commit, proves that its `security.capability` xattr is
absent and the soft core limit is zero, runs strict TypeScript checking,
type-aware Oxlint, and the sandbox and bridge tests, and rebuilds both release
payloads on every push and pull request. It also checks that the committed
bundle is reproducible, validates marketplace safety metadata, and uploads the
built plugin archive.

Read [`AGENTS.md`](AGENTS.md) before making agentic changes. Security-sensitive contribution rules are in [`SECURITY.md`](SECURITY.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License and upstream

This repository is MIT licensed. It vendors a reviewed, authenticated derivative
of the MIT-licensed `easyeda-mcp-pro` bridge-extension source and invokes a
separately installed `easyeda-mcp-pro` server at runtime. See
[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
