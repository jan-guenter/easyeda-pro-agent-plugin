# Changelog

## 0.3.0 — EasyEDA Pro Control derivative

- Assigned a distinct extension UUID, package name, display name, publisher,
  repository, socket identifier, and menu identity so the private companion is
  not confused with the stock bridge.
- Added nonce-bound mutual HMAC authentication on fixed loopback port `49621`,
  strict origin and parser limits, bounded pre-authentication clients, and
  credential-epoch-bound runtime replacement.
- Hardened connection, dispatcher, binary-result, and runtime lifecycle policy;
  expanded regression coverage for authentication, cleanup, and stale runtime
  rejection.
- Disabled standalone build, package, and watch entry points. The enclosing
  facade's `npm run bridge:build` path exclusively publishes the private,
  credential-bearing archive and receipt.
- Applied the strict TypeScript 7 compiler family and a separate type-aware
  strict, pedantic, all-category Oxlint gate while retaining the ES2020 EasyEDA
  renderer target.
- Kept production design mutation and unrestricted JavaScript disabled by the
  enclosing facade. Installing this extension does not grant write authority.

This derivative is based on `easyeda-mcp-pro` commit
`964c05082f1c7c9e8b98f56e967e36bfc3f26128`. The upstream source and these
modifications are distributed under the MIT license; the included `LICENSE`
and `NOTICE` contain the license terms and both copyright notices.
