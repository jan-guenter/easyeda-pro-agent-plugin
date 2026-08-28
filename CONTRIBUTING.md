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

Use Node 24.x:

```bash
cd plugins/easyeda-pro-control
npm ci
npm run build
npm run compatibility:check
npm test
npm run validate
cd ../..
node scripts/validate-repository.mjs
```

Do not commit `node_modules`, live `.eprj2` files, operation journals, evidence, screenshots containing user designs, or credentials.
