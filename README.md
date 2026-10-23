# EasyEDA Pro Agent Plugin

`easyeda-pro-control` is a Codex plugin for inspecting and editing EasyEDA Pro
through version-pinned MCP tools and task skills. Its safety facade provides
typed operations, exact readers, SQLite checkpoints, durable journals and
saved/reopened verification. Native Windows controls cover supported API gaps
and dialogs.

Support depends on the exact application version and operation. General
schematic, PCB and library writers remain disabled on EasyEDA Pro 3.2.206.
EasyEDA Pro 3.2.209 has a separate six-tool utility-only profile: API reference,
local discovery, status, bounded calculations/system observations and ordinary
application launch. It does not enable project opening or design operations.
The ordinary symbol-metadata route allows forward name/description edits of
unused project-local symbols with eligible history. Disposable validation
routes have separate gates. Check the
[capability matrix](plugins/easyeda-pro-control/skills/easyeda-pro-control/references/capability-matrix.md)
and the tool's schema before planning work.

## Requirements

The supported desktop profile is Linux x86_64 under WSL controlling a pinned
Windows EasyEDA Pro installation. Windows interop and PowerShell must work.
Native Linux/macOS EasyEDA and browser-only editing need separate admission.

- Node.js exactly `24.18.0`, its reviewed executable identity, and a soft `RLIMIT_CORE` of exactly `0`.
- npm exactly `11.16.0` for checkout setup and development.
- Linux 5.9 or newer with `close_range(2)` and `execveat(2)`.
- The reviewed non-setuid Bubblewrap `0.13.1` at `/usr/sbin/bwrap`, on a
  filesystem with readable `security.capability` attributes.
- The reviewed external `easyeda-mcp-pro` checkout, with its built
  `dist/index.js` and dependency tree, plus the matching Windows EasyEDA assets.
- Node SQLite support and the reviewed absolute `sqlite3` binary at
  `/usr/bin/sqlite3` or `/usr/local/bin/sqlite3`.

The [compatibility manifest](plugins/easyeda-pro-control/reviewed-compatibility.json)
pins exact binaries, module graphs and application bundles. Matching version
labels alone do not establish compatibility. See the
[setup guide](docs/installation.md) for host limits, machine profiles, custom
control directories and bridge-build recovery.

The legacy read profile pins dispatcher `ded07x99dcxb504` as
`connected-read-admitted`. Exact reads still require its complete compatibility
tuple and fresh authentication. That profile does not admit other application
versions or general writing.

## Installation

Install the published GitHub marketplace snapshot:

```bash
codex plugin marketplace add https://github.com/jan-guenter/easyeda-pro-agent-plugin
codex plugin add easyeda-pro-control@easyeda-pro-agent
```

Start a fresh Codex chat after installation or upgrade to load its skills and
MCP catalog. The marketplace
[manifest](.agents/plugins/marketplace.json) identifies the plugin package.

Marketplace installation does not create a credential or modify EasyEDA. From
a trusted checkout of this repository, prepare the pinned toolchain and build
the private companion extension:

```bash
git clone https://github.com/jan-guenter/easyeda-pro-agent-plugin.git
cd easyeda-pro-agent-plugin/plugins/easyeda-pro-control
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

Provisioning creates an owner-only token in `~/.easyeda-pro-control`. The build
publishes a private `.eext` archive outside the repository. Import the exact generation path reported as `outputPath`
through **Advanced > Extension Manager > Import** in EasyEDA Pro. The fixed
receipt is the authoritative current-generation pointer. Treat the token and
generated archive as credentials. Keep them out of Git, and rebuild/reimport
after rotating the key. Do not use the unauthenticated stock bridge.

Configure the machine profile from the same prepared checkout:

```bash
node scripts/configure-machine.ts \
  --upstream-root /absolute/upstream \
  --assets-root /mnt/drive/path/resources/app/assets
npm run doctor
```

Use the actual external checkout and Windows asset paths. Configuration does
not fetch or build the upstream server and does not grant compatibility
admission. The default private profile is
`~/.easyeda-pro-control/machine-profile.json`. The installed bundled launcher
uses that profile without needing plugin `node_modules`. The offline doctor
checks setup; the first authenticated status call proves the live connection.

To reuse an existing profile, run `node scripts/configure-machine.ts` without
overrides. See [machine configuration](docs/installation.md#runtime-prerequisites)
for `EASYEDA_MACHINE_PROFILE`, nondefault control directories and offline-only
startup. Restart the MCP session after repairing an installation.

## Usage

Start by asking Codex to use the control skill and inspect the installed
catalog and runtime before opening a project. For example:

> Use $easyeda-pro-control to inspect the available tools and connection status.
> Report the supported read operations for my installed EasyEDA version.

Use `easyeda_control_api` to inspect exact schemas and check planned arguments
offline. Local `easyeda_control_discover` works without starting the upstream.
Status and the task-specific skill reference determine the next supported
workflow. Keep one facade connected to the bridge.

For ordinary symbol metadata, follow the
[project-opening and metadata guide](plugins/easyeda-pro-control/skills/easyeda-pro-control/references/current-project-opening.md#ordinary-forward-only-symbol-metadata).
Use a separately identified disposable project for validation. The
[API reference](plugins/easyeda-pro-control/skills/easyeda-pro-control/references/api-reference.md)
and [connection guide](plugins/easyeda-pro-control/skills/easyeda-pro-control/references/connection-and-context.md)
explain tool arguments, context binding and version-specific operation gates.

An inspection request authorizes inspection only. Before editing, identify the
project, document and intended change. A successful acknowledgment or preview
is not saved-state proof. If an operation becomes uncertain, inspect its
journal and follow [failure recovery](plugins/easyeda-pro-control/skills/easyeda-pro-control/references/failure-recovery.md).
Never replay an ambiguous edit or Save, bypass quarantine, or answer unrelated
Save/Discard prompts automatically.

## Skills by task

| Skill | Use |
| --- | --- |
| [easyeda-pro-control](plugins/easyeda-pro-control/skills/easyeda-pro-control/SKILL.md) | Setup, exact inspection, typed editing, dialogs and recovery |
| [easyeda-schematic-design](plugins/easyeda-pro-control/skills/easyeda-schematic-design/SKILL.md) | Circuit definition, readable sheets, connectivity and ERC |
| [easyeda-pcb-layout](plugins/easyeda-pro-control/skills/easyeda-pcb-layout/SKILL.md) | Stackup, placement, return paths, routing and DRC |
| [easyeda-component-library](plugins/easyeda-pro-control/skills/easyeda-component-library/SKILL.md) | Symbols, footprints, pin mapping and device/model associations |
| [easyeda-manufacturing-release](plugins/easyeda-pro-control/skills/easyeda-manufacturing-release/SKILL.md) | Fabrication/assembly exports and release verification |
| [electronics-design-review](plugins/easyeda-pro-control/skills/electronics-design-review/SKILL.md) | Electrical, layout, library and manufacturing review |
| [easyeda-extension-development](plugins/easyeda-pro-control/skills/easyeda-extension-development/SKILL.md) | SDK research, adapter implementation and compatibility checks |

Design skills provide engineering guidance within the control tool's gates.
They do not grant fabrication, purchase, upload or publication authority.

## Architecture

The facade owns the authenticated gateway and a single sandboxed upstream MCP
child. A private EasyEDA extension connects over HMAC-authenticated loopback.
The facade captures a hash-bound upstream module graph and launches it through
a native descriptor sanitizer, Bubblewrap and Node permissions. Journals and
checkpoints retain operation intent and evidence for verification and recovery.
See [architecture and runtime isolation](docs/architecture.md) for details.

## Developer and contributor quick start

Read [AGENTS.md](AGENTS.md), [CONTRIBUTING.md](CONTRIBUTING.md) and
[SECURITY.md](SECURITY.md). Use the pinned Node/npm versions above, install GNU
binutils for sanitizer checks, and run `npm ci` in `plugins/easyeda-pro-control`.
First-party server, test and tooling source is TypeScript. Node runs erasable
TypeScript directly; TypeScript checks types, Oxlint checks code, and esbuild
produces committed runtime bundles.

```bash
# From plugins/easyeda-pro-control, with the pinned toolchain and core limit:
npm run sanitizer:check
npm run verify
npm run repository:validate
```

`verify` checks types, lint, coverage generation, builds, compatibility, facade
and bridge tests, skills and the MCP contract. For focused facade tests, retain
the isolation preload:

```bash
node --import ./scripts/test-isolation.ts --test server/tests/validation-registry.test.ts
```

Keep changes scoped, add regressions for changed safety properties, and update
the relevant skill reference. Regenerate bundles from source. Do not hand-edit
`server/dist`, relax compatibility pins to suppress a refusal, or test writers
on user designs. Follow the verification and release rules in `AGENTS.md`.

Reusable guides are indexed in [docs](docs/README.md). Write research, work logs,
validation results and release notes in [docs/history](docs/history/README.md)
using date-first filenames. Keep private evidence and user designs outside the
repository.

## License and upstream

MIT licensed. The plugin vendors an authenticated derivative of the MIT-licensed
`easyeda-mcp-pro` bridge extension and invokes a separately installed upstream
server. See [third-party notices](THIRD_PARTY_NOTICES.md).
