# Third-party notices

The generated MCP bundle contains code from these exact runtime packages.
Versions are locked in `package-lock.json`; `licenses/bundled-runtime.json` is
checked against every esbuild input and its installed license during each
build.

- `@modelcontextprotocol/sdk` 1.32.1 — MIT (`licenses/model-context-protocol-sdk-MIT.txt`)
- `acorn` 8.17.0 — MIT (`licenses/acorn-MIT.txt`)
- `ajv` 8.20.0 — MIT (`licenses/ajv-MIT.txt`)
- `ajv-formats` 3.0.1 — MIT (`licenses/ajv-formats-MIT.txt`)
- `fast-deep-equal` 3.1.3 — MIT (`licenses/fast-deep-equal-MIT.txt`)
- `fast-uri` 3.1.8 — BSD-3-Clause (`licenses/fast-uri-BSD-3-Clause.txt`)
- `json-schema-traverse` 1.0.0 — MIT (`licenses/json-schema-traverse-MIT.txt`)
- `ws` 8.21.3 — MIT (`licenses/ws-MIT.txt`)
- `zod` 4.6.7 — MIT (`licenses/zod-MIT.txt`)
- `zod-to-json-schema` 3.25.2 — ISC (`licenses/zod-to-json-schema-ISC.txt`)

The development and CI toolchain uses:

- `esbuild` 0.28.2 — MIT (`licenses/esbuild-MIT.txt`)
- `TypeScript` 7.0.2 — Apache-2.0 (`licenses/typescript-Apache-2.0.txt`) and its notice (`licenses/typescript-NOTICE.txt`)
- `@types/node` 24.13.3 — MIT (`licenses/types-node-MIT.txt`)
- `@types/ws` 8.18.1 — MIT (`licenses/types-ws-MIT.txt`)
- `Oxlint` 1.87.0 — MIT (`licenses/oxlint-MIT.txt`)
- `oxlint-tsgolint` 7.0.2003 — MIT (`licenses/oxlint-tsgolint-MIT.txt`)
- `Vitest` 4.1.12 — MIT (`licenses/vitest-MIT.txt`)

The offline extension API catalog derives method/type metadata from the official
`@jlceda/pro-api-types` declarations. Its pinned versions, SHA-256 digests and
source locations accompany every response. Apache-2.0 license and upstream
notice are included in `third-party/pro-api-types/`; it is not a runtime executor.

This plugin vendors a reviewed derivative of the EasyEDA bridge-extension
source from `easyeda-mcp-pro` commit
`964c05082f1c7c9e8b98f56e967e36bfc3f26128`. Its included `LICENSE` is the
upstream MIT license, and the derivative changes are also MIT-licensed. See
`easyeda-bridge-extension/CHANGELOG.md` and
`easyeda-bridge-extension/LICENSE` plus `easyeda-bridge-extension/NOTICE` for
provenance and copyright notices. The
separately installed upstream MCP server is invoked at runtime but is not
bundled in this plugin.

Bubblewrap is an external runtime and CI prerequisite. It is not bundled in
the plugin. The CI workflow builds version 0.13.1 from reviewed commit
`362936aea0d5c6e70f7af75d2d44b5a914cb4ba2`; Bubblewrap is
LGPL-2.1-or-later.

The corresponding packages and upstream repositories contain their
authoritative license texts and source notices.
