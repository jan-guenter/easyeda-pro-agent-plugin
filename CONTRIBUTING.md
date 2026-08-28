# Contributing

Read [`AGENTS.md`](AGENTS.md) first. This project controls an EDA application, so changes that look small can affect unsaved or persisted hardware designs.

## Pull requests

- Keep each change to one capability or safety property.
- Describe authority, target scope, failure modes, inverse behavior, persistence proof, and compatibility impact.
- Add adversarial tests for malformed data, context drift, timeout/disconnect, collateral changes, and durable-baseline races where applicable.
- Do not weaken an assertion to make a fixture pass. Normalize only a representation that is independently proven for the pinned build.
- Update skill/reference documentation and the durable engineering record when behavior changes.
- Leave the production writer disabled unless the pull request includes reviewed connected sacrificial-board evidence.

## Local checks

Use Linux x86_64, Node exactly 24.18.0, npm exactly 11.16.0, an inherited soft
`RLIMIT_CORE` of zero, Linux 5.9 or newer, and the exact non-setuid Bubblewrap
0.11.2 runtime recorded in `reviewed-compatibility.json`. The filesystem holding
Bubblewrap must support an unprivileged `security.capability` query. A different
Node, descriptor-sanitizer, or Bubblewrap binary is a reviewed compatibility
change, not a reason to relax or skip sandbox tests.

Install GNU binutils so `/usr/bin/as` and `/usr/bin/ld` can reproduce the native
x86_64 descriptor sanitizer. They are source-verification tools, not installed
plugin runtime dependencies. The committed executable's schema, byte count,
and SHA-256 are defined in
`plugins/easyeda-pro-control/server/src/descriptor-sanitizer-identity.ts`; update
those constants only as part of a reviewed native-boundary change.

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
npm run sanitizer:check
npm run typecheck
npm run bridge:typecheck
npm run bridge:lint
npm run bridge:test
npm run lint
npm run build
npm run compatibility:check
npm test
npm run validate
cd ../..
node scripts/validate-repository.mjs
```

Run the full facade suite once with unrelated high-numbered shell descriptors
open. This is the regression for the boundary that retains only descriptors
`0`–`9` for Bubblewrap and uses `10` only to enter the exact reviewed executable:

```bash
cd plugins/easyeda-pro-control
bash --noprofile --norc -c '
  exec 142</etc/hosts
  exec 145</etc/group
  test "$(readlink /proc/self/fd/142)" = /etc/hosts
  test "$(readlink /proc/self/fd/145)" = /etc/group
  npm test
'
```

`npm run sanitizer:build` is the explicit source-to-committed-binary update. It
uses descriptor-relative atomic publication, then reopens and verifies the
published file. Review the assembly, linker script, identity-constant change,
and binary diff together. A build failure is not a reason to bypass
`sanitizer:check` or substitute a path-selected launcher.

Do not commit `node_modules`, live `.eprj2` files, operation journals, evidence, screenshots containing user designs, or credentials.
