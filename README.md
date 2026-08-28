# EasyEDA Pro Agent Plugin

`easyeda-pro-control` is a Codex skill and MCP safety facade for inspecting a live EasyEDA Pro project. It provides version-pinned exact readers, stable context checks, SQLite checkpoints, hash-bound evidence, validated PNG capture, draft PCB DSN route-context export, and conservative recovery journals.

The current release is intentionally honest about its boundary: design mutation is not enabled. A narrow, one-component PCB placement writer and its state machine are included as experimental code, but production refuses `plan`, `apply`, `rollback`, and `save_reopen` until the pinned EasyEDA stack passes a connected sacrificial-board save/reopen and rollback validation. The caller-facing MCP exposes no raw JavaScript tool or environment opt-in; its private sandbox executor receives only facade-generated, reviewed programs.

## Architecture

```text
Codex skill
    │
    ▼
easyeda-pro-control safety facade ───► durable journals, evidence, checkpoints
    │                         │
    │                         └── HMAC gateway ◄──► private EasyEDA extension ◄──► EasyEDA Pro
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

## Implemented capabilities after connected admission

The facade implements the capabilities below for an explicitly reviewed and
admitted connected tuple. The private bridge bundled for this release is still
an unconnected `validation-required` candidate: fresh installs may collect
status, context, and bounded reviewed public-read evidence, but exact readers
and every private operation remain fail-closed until connected review updates
the compatibility manifest.

- Exact double-sampled schematic component and compiled connectivity reads, with explicit adapter limitations.
- Exact PCB component, direct-pad, primitive-inventory, net, rule, class, differential-pair, and equal-length-group reads.
- Conservative generic reads with project, document, editor-type, and tab binding.
- SQLite online checkpoints with `quick_check`, logical database comparison, and self-hashed receipts.
- Full-page and viewport capture with PNG signature, chunk, CRC, zlib, scanline, geometry, and payload/image binding checks.
- Draft PCB DSN route-context export with descriptor-bound exclusive artifact creation, inode/hash-bound receipts, and hash-bound failure evidence.
- Durable ambiguous-call recovery with one-use nonce challenges and a global bridge quarantine.

Not production-enabled: schematic or PCB writes, ECO, library changes, routing, rules, stack-up changes, manufacturing export, unrestricted JavaScript, or fabrication submission.

## Install from this GitHub marketplace

The Codex marketplace manifest is [`.agents/plugins/marketplace.json`](.agents/plugins/marketplace.json).

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
npm audit --audit-level=high
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
after rotating the token. A different token location must update `.mcp.json`
and be passed to both provisioning and build with the same absolute
`--token-file` path.

The current fixed receipt names private bridge build `ded07x99dcxb504`.
That archive is an unconnected `validation-required` candidate, not a
production-live build. The reviewed compatibility manifest deliberately retains
the historically connected dispatcher build `d18b6xd531xe6ca`. Importing the
candidate is part of the validation workflow: `easyeda_control_status` may
collect its actual live fingerprint, and narrowly reviewed public generic reads
may proceed only after a bounded smoke test against that current fingerprint.
Exact readers and every private-operation path remain fail-closed until a
connected review deliberately updates the compatibility manifest. Never infer
compatibility from the build receipt or import alone.

## Runtime prerequisites

This compatibility release is pinned to the local integration tuple recorded in [`reviewed-compatibility.json`](plugins/easyeda-pro-control/reviewed-compatibility.json):

- Linux x86_64 with Node.js exactly `24.18.0`, the reviewed Node executable
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
- authenticated bridge derivative reviewed against upstream commit `964c05082f1c7c9e8b98f56e967e36bfc3f26128`: distinct private package, UUID, menu, socket, and repository identity; fixed extension-facing gateway at `127.0.0.1:49621`; nonce-bound mutual HMAC authentication; exact private-build-receipt/index-bundle/key-epoch admission with fail-closed stale-runtime cleanup; a 2 KiB parser limit and bounded pending clients before authentication; browser-Origin rejection; and no adjacent-port fallback or raw-secret transmission (extension manifest `0.3.0`)
- Node's built-in SQLite support plus a reviewed absolute `sqlite3` binary at `/usr/bin/sqlite3` or `/usr/local/bin/sqlite3` for deterministic logical dumps; `PATH` is never used to select it

The checked-in [`.mcp.json`](plugins/easyeda-pro-control/.mcp.json) targets the validated workstation paths. A different machine must install/build `easyeda-mcp-pro`, provision a private token, build and import the vendored authenticated bridge extension, and deliberately create a new reviewed compatibility tuple instead of weakening the checks.

## First live use

1. Open the intended project and document in EasyEDA Pro.
2. Connect the imported private EasyEDA bridge extension.
3. Ask Codex to use `$easyeda-pro-control` and call `easyeda_control_status`; require an authenticated bridge session rather than treating the import dialog or build receipt as connection proof.
4. Use `easyeda_control_context` to collect the current project path/UUID and
   document UUID/type/tab as candidate-validation evidence.
5. While bridge build `ded07x99dcxb504` remains `validation-required`, use only
   the bounded, reviewed public generic readers needed for that validation and
   keep the active tab unchanged throughout each call. Do not call
   `easyeda_control_exact_read`: exact and private operations remain unavailable
   until connected review deliberately admits the candidate in the compatibility
   manifest.

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

```bash
cd plugins/easyeda-pro-control
ulimit -c 0
test "$(ulimit -c)" = "0"
test "$(node --version)" = "v24.18.0"
test "$(npm --version)" = "11.16.0"
npm ci
npm ls --all
npm audit signatures
npm audit --audit-level=high
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
node scripts/validate-repository.mjs
```

GitHub Actions builds the exact non-setuid Bubblewrap 0.11.2 source commit,
proves an empty Linux file-capability set and soft core limit zero, runs strict
TypeScript checking, type-aware Oxlint, the sandbox and bridge
tests, and rebuilds both release payloads on every push and pull request. It
also checks that the committed bundle is reproducible, validates marketplace
safety metadata, and uploads the built plugin archive.

Read [`AGENTS.md`](AGENTS.md) before making agentic changes. Security-sensitive contribution rules are in [`SECURITY.md`](SECURITY.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License and upstream

This repository is MIT licensed. It vendors a reviewed, authenticated derivative
of the MIT-licensed `easyeda-mcp-pro` bridge-extension source and invokes a
separately installed `easyeda-mcp-pro` server at runtime. See
[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
