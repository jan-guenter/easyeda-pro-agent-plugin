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
`RLIMIT_CORE` of zero, and the exact non-setuid Bubblewrap 0.11.2 runtime recorded in
`reviewed-compatibility.json`. A different Node or Bubblewrap binary is a
reviewed compatibility change, not a reason to relax or skip sandbox tests.

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
npm run bridge:test
npm run lint
npm run build
npm run compatibility:check
npm test
npm run validate
cd ../..
node scripts/validate-repository.mjs
```

Do not commit `node_modules`, live `.eprj2` files, operation journals, evidence, screenshots containing user designs, or credentials.
