# EasyEDA Pro Agent Plugin

`easyeda-pro-control` is a Codex skill and MCP safety facade for inspecting a live EasyEDA Pro project. It provides version-pinned exact readers, stable context checks, SQLite checkpoints, hash-bound evidence, validated PNG capture, draft PCB DSN route-context export, and conservative recovery journals.

The current release is intentionally honest about its boundary: design mutation is not enabled. A narrow, one-component PCB placement writer and its state machine are included as experimental code, but production refuses `plan`, `apply`, `rollback`, and `save_reopen` until the pinned EasyEDA stack passes a connected sacrificial-board save/reopen and rollback validation. Unrestricted JavaScript is structurally disabled.

## Architecture

```text
Codex skill
    │
    ▼
easyeda-pro-control safety facade ───► durable journals, evidence, checkpoints
    │
    ▼
easyeda-mcp-pro (pinned runtime dependency)
    │
    ▼
EasyEDA bridge extension ───► EasyEDA Pro
```

The facade is the sole bridge owner. Do not run a second EasyEDA MCP process against the same bridge.

## Current production capabilities

- Exact double-sampled schematic component and compiled connectivity reads, with explicit adapter limitations.
- Exact PCB component, direct-pad, primitive-inventory, net, rule, class, differential-pair, and equal-length-group reads.
- Conservative generic reads with project, document, editor-type, and tab binding.
- SQLite online checkpoints with `quick_check`, logical database comparison, and self-hashed receipts.
- Full-page and viewport capture with PNG signature, chunk, CRC, zlib, scanline, geometry, and payload/image binding checks.
- Draft PCB DSN route-context export with exclusive durable artifact creation and hash-bound failure evidence.
- Durable ambiguous-call recovery with one-use nonce challenges and a global bridge quarantine.

Not production-enabled: schematic or PCB writes, ECO, library changes, routing, rules, stack-up changes, manufacturing export, unrestricted JavaScript, or fabrication submission.

## Install from this GitHub marketplace

The Codex marketplace manifest is [`/.agents/plugins/marketplace.json`](.agents/plugins/marketplace.json).

```bash
codex plugin marketplace add https://github.com/jan-guenter/easyeda-pro-agent-plugin
codex plugin add easyeda-pro-control@easyeda-pro-agent
```

Start a new Codex task after installation so the skill and MCP catalog are loaded from the new marketplace snapshot.

## Runtime prerequisites

This compatibility release is pinned to the local integration tuple recorded in [`reviewed-compatibility.json`](plugins/easyeda-pro-control/reviewed-compatibility.json):

- Node.js 24.x (validated with 24.18.0)
- EasyEDA Pro `3.2.149.88089769`
- PCB editor bundle `3.2.149.5378b690`
- public API bundle `0.2.53.aee2f57a`
- `easyeda-mcp-pro` and bridge extension `1.0.0-rc.1`
- `sqlite3` on `PATH`

The checked-in [`.mcp.json`](plugins/easyeda-pro-control/.mcp.json) targets the validated workstation paths. A different machine must install/build `easyeda-mcp-pro`, install its EasyEDA bridge extension, and deliberately create a new reviewed compatibility tuple instead of weakening the checks.

## First live use

1. Open the intended project and document in EasyEDA Pro.
2. Connect the EasyEDA bridge extension.
3. Ask Codex to use `$easyeda-pro-control` and call `easyeda_control_status`.
4. Prove the exact project path/UUID and document UUID/type/tab with `easyeda_control_context`.
5. Use exact readers for authoritative claims. Keep the active tab unchanged throughout each call.

If any call reports bridge quarantine, use `easyeda_control_recover_incomplete` with no operation ID. Do not bypass, delete, or rewrite the journal: a delayed call may still be running.

## Development

First-party MCP source, test, and plugin scripts are TypeScript. Node 24 runs the erasable TypeScript directly during development; `tsc --noEmit` performs the strict compiler check, and esbuild produces the committed JavaScript MCP bundle.

```bash
cd plugins/easyeda-pro-control
npm ci
npm run typecheck
npm run lint
npm run build
npm run compatibility:check
npm test
npm run validate
```

Repository validation runs from the marketplace root:

```bash
node scripts/validate-repository.mjs
```

GitHub Actions runs strict TypeScript checking, type-aware Oxlint, the build, and all tests on every push and pull request. It also checks that the committed bundle is reproducible, validates marketplace safety metadata, and uploads the built plugin archive.

Read [`AGENTS.md`](AGENTS.md) before making agentic changes. Security-sensitive contribution rules are in [`SECURITY.md`](SECURITY.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License and upstream

This repository is MIT licensed. It depends at runtime on the separate MIT-licensed [`easyeda-mcp-pro`](https://github.com/oaslananka/easyeda-mcp-pro) project; that upstream repository is not vendored here. See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
