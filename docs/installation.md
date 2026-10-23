# Installation and runtime setup

The Codex marketplace manifest is [`.agents/plugins/marketplace.json`](../.agents/plugins/marketplace.json).

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

The fixed receipt identifies the private dispatcher build. Compare it with the
reviewed compatibility manifest and require a fresh authenticated status result.
A build or import receipt alone does not establish live runtime admission.

## Runtime prerequisites

This compatibility release is pinned to the local integration tuple recorded in [`reviewed-compatibility.json`](../plugins/easyeda-pro-control/reviewed-compatibility.json):

The supported editing/runtime profile is Linux x86_64 under WSL controlling the pinned Windows EasyEDA Pro desktop installation. Windows interop and Windows PowerShell must work, and the EasyEDA assets must be reachable through a canonical `/mnt/<drive>/.../resources/app/assets` path. The packaged helper uses a mounted path or a `\\wsl.localhost` path derived from `WSL_DISTRO_NAME`. Native Linux or macOS EasyEDA and a browser-only editor are not covered by the retained Windows Job profile. Linux facade support alone does not establish editing support on those hosts.

- Linux x86_64 on Linux 5.9 or newer. The sanitizer requires working
  `close_range(2)` and `execveat(2)`, and the filesystem holding Bubblewrap must
  expose a readable `security.capability` xattr namespace whose absent-attribute
  result is `ENODATA`. An unavailable syscall, unreadable/unsupported xattr, or
  present capability xattr fails closed.
- The committed static descriptor sanitizer must be the regular, single-link,
  mode-`0755` file named by
  [`descriptor-sanitizer-identity.ts`](../plugins/easyeda-pro-control/server/src/descriptor-sanitizer-identity.ts).
  The current constants pin schema
  `easyeda-pro-control.descriptor-sanitizer.v1`, 1,440 bytes, and SHA-256
  `a8b52e8439bdb479a5621052ab03e9030d67b7948c6e2cc448ee5d7bb1dc9b41`.
  Runtime and compatibility admission reject any other identity.
- Node.js exactly `24.18.0`, the reviewed Node executable
  identity recorded in the compatibility manifest, and a soft `RLIMIT_CORE` of exactly `0`.
  The runtime's executable hash and complete file-
  descriptor baseline are exact compatibility inputs, not generic Node 24.x
  support.
- Bubblewrap exactly `0.13.1` at `/usr/sbin/bwrap`, as a root-owned,
  non-symlink, non-setuid/non-setgid mode-`0755` executable. The reviewed local
  SHA-256 is recorded in the compatibility manifest. Ubuntu 24.04's older
  distribution build does not implement the descriptor-mount options this
  sandbox requires; install or build the reviewed version rather than weakening
  the launch policy.
  CI builds the immutable upstream revision with kernel fallbacks enabled.
  The reviewed local Arch package assumes Linux 6.18 or newer; its binary pin
  does not establish support on older kernels. See the
  [upgrade review and execution scope](history/2026-10-15-bubblewrap-admission-research.md).
- Legacy full-review tuple: EasyEDA Pro `3.2.149.88089769`, PCB editor bundle
  `3.2.149.5378b690`, public API bundle `0.2.53.aee2f57a`. Current3.2.206
  capabilities use separate, narrower admission profiles described in the [capability matrix](../plugins/easyeda-pro-control/skills/easyeda-pro-control/references/capability-matrix.md).
- external `easyeda-mcp-pro` server `1.0.0-rc.1`
- authenticated bridge derivative reviewed against upstream commit `964c05082f1c7c9e8b98f56e967e36bfc3f26128`: distinct private package, UUID, menu, socket, and repository identity; fixed extension-facing gateway at `127.0.0.1:49621`; nonce-bound mutual HMAC authentication; exact private-build-receipt/index-bundle/key-epoch admission with fail-closed stale-runtime cleanup; a 2 KiB parser limit and bounded pending clients before authentication; absent-or-exact-native `https://client` Origin admission (never an authentication substitute); and no adjacent-port or raw/browser transport fallback or raw-secret transmission (extension manifest `0.3.0`)
- Node's built-in SQLite support plus a reviewed absolute `sqlite3` binary at `/usr/bin/sqlite3` or `/usr/local/bin/sqlite3` for deterministic logical dumps; `PATH` is never used to select it

The checked-in [`.mcp.json`](../plugins/easyeda-pro-control/.mcp.json) runs `node server/dist/server.mjs --machine-launch` with an empty environment map. This bundled launcher needs no plugin `node_modules`; it loads the private machine profile, verifies its Node/install identities and starts the sole facade. `scripts/launch-machine.ts` remains a developer wrapper requiring the trusted checkout's pinned dependencies. Create a profile with `node scripts/configure-machine.ts --upstream-root /absolute/upstream --assets-root /mnt/drive/path/resources/app/assets` from that prepared checkout's plugin directory. Optional `--node`, `--control-dir`, `--pcb-version` and `--api-version` select explicit installation values. The default profile is `~/.easyeda-pro-control/machine-profile.json`; `EASYEDA_MACHINE_PROFILE` selects another existing private profile. Configuration finds paths and versions, not compatibility admission. A different tuple still needs deliberate review.

The external upstream checkout must already contain its reviewed built `dist/index.js` and dependency tree. Configuration does not fetch, install or rebuild it. The same version label is insufficient: the runtime checks the pinned module graph and executable identities.

Missing or invalid external installation files now select a restricted
offline-only process. It retains the same sole-owner lease and exact Node/profile
trust checks but never constructs an upstream client or native controller.
`easyeda_control_status` retains the startup `machine-installation-*` code and
adds read-only metadata diagnostics: configured file-role availability,
bounded candidate bundle directory names and the app package version, without
private paths or raw errors. It starts no subprocess and changes no configuration.
Candidate names and `configuredBundleFilesPresent` are not compatibility
admission. Local API catalogs describe bundled references,
not the currently installed application. An unsafe profile or unverified Node
still prevents startup. Configuration reuse and the offline doctor remain strict.
After repairing and reviewing the installation, restart the MCP session; do not
change compatibility pins merely to suppress the failure. Current capability profiles do not admit the legacy tuple's general writer
routes. Each operation retains its own exact gates.

For the separately reviewed `3.2.209.8a704eab` installation, an explicit migration
from the older 3.2.206 selector pair is available in the trusted checkout:

```bash
node scripts/upgrade-calculation-profile.ts --target public-utilities-209
```

An optional `--profile /absolute/control/machine-profile.json` selects the
existing private configuration. The helper verifies the exact new package and
PCB/API files, keeps a byte-exact private backup and changes only two bundle
selectors. The control root, Node, upstream, credentials and journals stay
unchanged. It never promotes an existing process or updates the legacy global
compatibility profile. Restart Codex afterward. The new `public-utilities-only`
mode registers eleven tools, with separate runtime admission for 16 Math, 18
Unit/Environment operations, three language/API-page viewport readers,
tab-count/active-identity/shortcut observations and ordinary launch. A separate
public footprint catalog lookup requires explicit network confirmation but no
application, bridge or SDK execution. No project-opening, design-content,
native diagnostic, Save or design-recovery route is registered.
Source/synthetic verification is not connected validation.
Omitting `--target` retains the older 3.2.206 migration; neither form discovers
or admits arbitrary future releases.

Reuse a profile with `node scripts/configure-machine.ts` or `node scripts/configure-machine.ts --profile /absolute/control/machine-profile.json`, without configuration overrides. Overrides against an existing profile are refused. For another supported installation, create a fresh explicit profile path inside its owner-only control directory. Do not overwrite an active profile or change directories to evade the sole-owner lease or quarantine.

`EASYEDA_MACHINE_PROFILE` selects the profile for the launcher. The provisioning/build CLIs do not read that profile. With a nondefault control directory, set `EASYEDA_CONTROL_DATA_DIR` to that same directory for both `bridge:provision` and `bridge:build`; otherwise they select the default token and receipt locations. Do not rotate an existing key merely to correct a path mismatch.
