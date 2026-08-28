# EasyEDA Pro Agent engineering record

This file is the durable engineering record and common ground for every human or agent working in this repository. Keep it current whenever a requirement, assumption, interface, compatibility tuple, safety boundary, or test result changes. Do not silently turn an open question into a requirement.

Last updated: 2026-08-28 (Europe/Berlin)

## Product truth

- The repository is a Codex marketplace named `easyeda-pro-agent`.
- The shipped plugin is `plugins/easyeda-pro-control`.
- Production capabilities are live inspection, exact typed reads, managed evidence, SQLite checkpoints, validated capture, draft DSN route-context export, local artifact inspection, and conservative recovery.
- The experimental PCB component writer is runtime-disabled. Unit tests do not authorize enabling it.
- Unrestricted JavaScript is structurally disabled and has no environment opt-in.
- The facade owns the sole upstream MCP child and bridge connection.
- A boolean, toast, preview, unsaved readback, or file timestamp is never durable design proof.

## Non-negotiable safety rules

1. User authority defines scope. Inspection never implies permission to edit, save, discard unsaved state, restore a database, fabricate, purchase, publish a release, or contact a third party.
2. Never mutate a real design to test a writer. Connected writer validation must use a disposable, explicitly identified sacrificial project and must prove exact live state, collateral invariants, save/close/reopen state, logical SQLite change, and rollback.
3. Never enable the private writer merely by setting a flag in production. Record the connected evidence, review it, update the capability docs, add regression tests, and make the enablement change deliberately.
4. Never bypass the global bridge quarantine. An orphan-risk or unreadable journal blocks every live bridge path except the isolated nonce-bound recovery resolver. Local discovery and managed artifact/evidence inspection may continue.
5. Never synthesize or replay a restart challenge. Only pass the current nonce after the user reports completing the authorized EasyEDA terminate/restart/reconnect boundary.
6. Never save after an ambiguous call, invariant mismatch, context drift, runtime drift, or durable-baseline drift.
7. Preserve unrelated user changes. Do not rewrite the upstream `easyeda-mcp-pro` checkout as part of facade work.
8. Never commit credentials, private keys, EasyEDA projects, generated evidence, operation journals, or user-specific design data.

## Engineering workflow

- Read the relevant skill and reference document before changing a capability.
- Prefer narrow typed schemas, facade-generated bridge programs, exact independent readers, explicit collateral invariants, and complete inverse models.
- Every awaited bridge boundary needs context reproof appropriate to its risk.
- Journal before dispatch, not after it. Any potentially delayed call needs an orphan marker and recovery path.
- Reject missing, malformed, non-finite, coerced, truncated, or contradictory evidence. Do not turn adapter defects into global corrections.
- Use append-only or exclusive evidence writes, bounded symlink-safe reads, file-descriptor identity checks, and durable directory synchronization.
- Add adversarial tests for every safety fix. A test must fail on the unsafe implementation and prove that no downstream mutation was dispatched.
- Keep source and committed bundle in sync. Do not hand-edit `server/dist/server.mjs`.

## Required verification

Run with Node 24 from `plugins/easyeda-pro-control`:

```bash
npm ci
npm run build
npm run compatibility:check
npm test
npm run validate
```

Then run from the repository root:

```bash
node scripts/validate-repository.mjs
git diff --exit-code -- plugins/easyeda-pro-control/server/dist/server.mjs
```

The offline doctor validates the pinned local workstation and is not a substitute for a connected EasyEDA smoke test. Never run a connected mutation smoke test against a user project.

## Compatibility manifest

`plugins/easyeda-pro-control/reviewed-compatibility.json` is a drift gate, not a version wish list. Update it only after source and bundle are frozen:

```bash
npm run compatibility:update
npm run compatibility:check
```

The update command changes only the facade source/bundle projections and review timestamp. Upstream, EasyEDA, bridge, tool-catalog, dispatcher, and installed-bundle values require separate evidence and must not be inferred or silently refreshed.

## Release discipline

- Marketplace, plugin manifest, README, skill frontmatter, agent metadata, and MCP tool descriptions must agree about enabled capabilities.
- CI must be green and the built bundle reproducible before publishing.
- Scan the staged tree for secrets and user design artifacts.
- Record the test count, commit, marketplace URL, and local installation result in this file and the originating project record.
- Use a new Codex task after installing a new marketplace snapshot.

## Current validation record

- Compatibility target: EasyEDA Pro `3.2.149.88089769`, PCB bundle `3.2.149.5378b690`, public API `0.2.53.aee2f57a`, upstream/bridge `1.0.0-rc.1`, Node `24.18.0`.
- Connected production-writer validation: **not performed; writer disabled**.
- Unrestricted raw bridge execution: **structurally disabled**.
- Final repository test/commit/install record: pending release completion.

## Open questions

- Which disposable EasyEDA project and acceptance fixture will be used for connected writer validation?
- Should future releases bundle or bootstrap the upstream MCP, or continue to pin an externally installed checkout?
- Which additional write capability should be modeled first after the one-component writer is proven?
