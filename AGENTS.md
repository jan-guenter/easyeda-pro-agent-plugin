# EasyEDA Pro Agent engineering record

This file is the durable engineering record and common ground for every human or agent working in this repository. Keep it current whenever a requirement, assumption, interface, compatibility tuple, safety boundary, or test result changes. Do not silently turn an open question into a requirement.

Last updated: 2026-08-28 (Europe/Berlin)

## Product truth

- The repository is a Codex marketplace named `easyeda-pro-agent`.
- The shipped plugin is `plugins/easyeda-pro-control`.
- Implemented facade capabilities are live inspection, exact typed reads, managed evidence, SQLite checkpoints, validated capture, draft DSN route-context export, local artifact inspection, and conservative recovery. Runtime use remains gated by the reviewed connected tuple.
- The experimental PCB component writer is runtime-disabled. Unit tests do not authorize enabling it.
- Caller-supplied unrestricted JavaScript is structurally disabled and has no environment opt-in. The supervised private executor receives only facade-generated, reviewed programs.
- The facade owns the sole upstream MCP child and bridge connection.
- The facade enters Bubblewrap only through the reviewed native x86_64 descriptor sanitizer. Bubblewrap inherits the deliberate authority set on descriptors `0`–`9`; its exact reviewed executable is admitted on `10`, marked close-on-exec, and entered by descriptor after `close_range(11, UINT_MAX, 0)`. Never add an inherited descriptor without updating the complete mapping, native contract, compatibility fingerprint, and hostile-descriptor tests together.
- Fixed-receipt bridge build `ded07x99dcxb504` is an unconnected `validation-required` candidate, not a production-live build. The compatibility manifest retains historically connected dispatcher `d18b6xd531xe6ca`; status may collect the candidate fingerprint and narrowly reviewed public generic reads may proceed after a bounded smoke test, but exact reads and private operations remain fail-closed until connected review deliberately updates the manifest.
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
- Keep `server/native/easyeda-fd-sanitizer.S`, its linker script, the committed binary, and `server/src/descriptor-sanitizer-identity.ts` synchronized. The exact sanitizer identity is a compatibility boundary, not generated metadata to refresh automatically.

## Required verification

Run on Linux x86_64 with Node exactly `24.18.0`, npm exactly `11.16.0`, and a soft `RLIMIT_CORE` of zero from `plugins/easyeda-pro-control`:

```bash
ulimit -c 0
test "$(ulimit -c)" = "0"
test "$(node --version)" = "v24.18.0"
test "$(npm --version)" = "11.16.0"
npm ci
npm ls --all
npm audit signatures
npm audit --audit-level=high
npm run sanitizer:check
npm run verify
```

Then run from the repository root:

```bash
node scripts/validate-repository.mjs
python3 "$CODEX_HOME/skills/.system/plugin-creator/scripts/validate_plugin.py" plugins/easyeda-pro-control
python3 "$CODEX_HOME/skills/.system/skill-creator/scripts/quick_validate.py" plugins/easyeda-pro-control/skills/easyeda-pro-control
git diff --exit-code -- plugins/easyeda-pro-control/server/dist/server.mjs plugins/easyeda-pro-control/server/dist/upstream-supervisor.mjs
```

The offline doctor validates the pinned local workstation and is not a substitute for a connected EasyEDA smoke test. Never run a connected mutation smoke test against a user project.

## Compatibility manifest

`plugins/easyeda-pro-control/reviewed-compatibility.json` is a drift gate, not a version wish list. Its launcher fingerprint includes the exact descriptor-sanitizer schema and SHA-256. Update it only after source, sanitizer, and bundle are frozen:

```bash
npm run compatibility:update
npm run compatibility:check
```

The update command changes only the facade source/bundle projections and review timestamp. Upstream, EasyEDA, bridge, tool-catalog, dispatcher, and installed-bundle values require separate evidence and must not be inferred or silently refreshed.

The native boundary requires Linux x86_64 on Linux 5.9 or newer,
`close_range(2)`, `execveat(2)`, and an unprivileged readable
`security.capability` xattr namespace. The sanitizer requires descriptor `10` to
be a regular mode-`0755` file whose capability xattr is absent, establishes
`PR_SET_PDEATHSIG(SIGKILL)` against the unchanged expected facade parent, then
closes every descriptor from `11` upward. GNU binutils `/usr/bin/as` and
`/usr/bin/ld` are needed only to rebuild and verify the source; installed
runtime does not invoke them.

## Release discipline

- Marketplace, plugin manifest, README, skill frontmatter, agent metadata, and MCP tool descriptions must agree about enabled capabilities.
- CI must be green and the built bundle reproducible before publishing.
- Scan the staged tree for secrets and user design artifacts.
- Record the test count, commit, marketplace URL, and local installation result in this file and the originating project record.
- Use a new Codex task after installing a new marketplace snapshot.

## Current validation record

- Compatibility target: EasyEDA Pro `3.2.149.88089769`, PCB bundle `3.2.149.5378b690`, public API `0.2.53.aee2f57a`, historically connected upstream MCP/health/extension/bridge `1.0.0-rc.1`, unconnected authenticated extension manifest `0.3.0`, and Node `24.18.0`.
- Node source/toolchain: TypeScript `7.0.2` with all strict compiler checks enabled; Oxlint `1.80.0` plus type-aware `oxlint-tsgolint` `7.0.2001`; correctness, suspicious, pedantic, performance, style, and restriction diagnostics are errors, warnings are denied, and unused suppressions are errors. Architectural exceptions for Node, async protocol control, typed named modules, generated bridge programs, sequential transactions, and audit-oriented test vectors are individually documented in `.oxlintrc.json`.
- Connected production-writer validation: **not performed; writer disabled**.
- Unrestricted raw bridge execution: **structurally disabled**.
- Release payload commit, final GitHub Actions run, and Git-marketplace installation evidence are pending the final push. Initial run `33189714952` exposed Ubuntu SQLite CLI, setup-node executable-path, and x64-loader portability defects. Runs `33191248912`, `33202470104`, and `33203210507` exposed retained host descriptors in Bubblewrap when GitHub's runner shell entered the facade with descriptors `142` and `145` open. Bubblewrap and libuv both preserve arbitrary inherited descriptors; rearranging loader binds could not close that authority. The native descriptor sanitizer now makes the boundary explicit and fail-closed before Bubblewrap starts. A new full-suite and CI result is pending; do not describe this implementation as released or installed yet.
- Current sanitizer identity, read from `server/src/descriptor-sanitizer-identity.ts`: schema `easyeda-pro-control.descriptor-sanitizer.v1`, file `easyeda-fd-sanitizer`, 1,440 bytes, SHA-256 `a8b52e8439bdb479a5621052ab03e9030d67b7948c6e2cc448ee5d7bb1dc9b41`, regular single-link mode `0755`. It is a static stripped ELF64 x86_64 image with one read/execute load segment, no interpreter, no dynamic section, no relocations, no writable load segment, and a non-executable stack. The FD contract, parent-death behavior, mode admission, exec failure, and hostile high-descriptor closure have dedicated adversarial tests; the offline doctor exercises successful no-capability admission against the real reviewed Bubblewrap descriptor. The production upstream regression with inherited descriptors `142` and `145` must pass before release.
- The last complete pre-sanitizer local baseline had zero strict TypeScript or type-aware Oxlint diagnostics, 346/346 facade tests across 40 suites, 404/404 authenticated-bridge tests across 28 files, and passing dependency, registry-signature, vulnerability, plugin, skill, compatibility, repository, privacy, actionlint, and reproducible-bundle checks on Node `24.18.0`. Those counts and the prior two-file bundle/source hashes are superseded by the sanitizer integration and are not current release evidence.
- The private authenticated bridge candidate was built twice reproducibly from closure `ce52ca1bf5b2d3d214454790a24516ae5182f1867851c2786c0269bbc7892680` (70 files, 847,709 bytes). Fixed receipt build `ded07x99dcxb504` selects authenticated index `ipamxAl7WLjoauIx5hQI-Sck8LB7JWeJMW_7DAXOcdcU` and archive SHA-256 `82cb8f241632ebed931a568085daf23f565960b71ac53cb4fb128e426b9abb0c` (138,874 bytes, mode 0600). It was not imported or connected; offline doctor is therefore fail-closed only on the intended reviewed-connected-build mismatch.
- Marketplace `easyeda-pro-agent` remains configured from `https://github.com/jan-guenter/easyeda-pro-agent-plugin.git`. The final installed version, payload equality, 19-tool stdio inventory, and GitHub CI evidence must replace this pending record after publication.

## Open questions

- Which disposable EasyEDA project and acceptance fixture will be used for connected writer validation?
- Should future releases bundle or bootstrap the upstream MCP, or continue to pin an externally installed checkout?
- Which additional write capability should be modeled first after the one-component writer is proven?
