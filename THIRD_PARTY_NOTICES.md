# Third-party notices

The generated MCP bundle contains code from the following exact runtime
packages. Versions are locked in
`plugins/easyeda-pro-control/package-lock.json`; the machine-readable
inventory at
`plugins/easyeda-pro-control/licenses/bundled-runtime.json` is checked
against every esbuild input and its installed license during each build.

- [`@modelcontextprotocol/sdk` 1.29.0](https://github.com/modelcontextprotocol/typescript-sdk), [MIT License](plugins/easyeda-pro-control/licenses/model-context-protocol-sdk-MIT.txt).
- [`acorn` 8.17.0](https://github.com/acornjs/acorn), [MIT License](plugins/easyeda-pro-control/licenses/acorn-MIT.txt).
- [`ajv` 8.20.0](https://github.com/ajv-validator/ajv), [MIT License](plugins/easyeda-pro-control/licenses/ajv-MIT.txt).
- [`ajv-formats` 3.0.1](https://github.com/ajv-validator/ajv-formats), [MIT License](plugins/easyeda-pro-control/licenses/ajv-formats-MIT.txt).
- [`fast-deep-equal` 3.1.3](https://github.com/epoberezkin/fast-deep-equal), [MIT License](plugins/easyeda-pro-control/licenses/fast-deep-equal-MIT.txt).
- [`fast-uri` 3.1.6](https://github.com/fastify/fast-uri), [BSD 3-Clause License](plugins/easyeda-pro-control/licenses/fast-uri-BSD-3-Clause.txt).
- [`json-schema-traverse` 1.0.0](https://github.com/epoberezkin/json-schema-traverse), [MIT License](plugins/easyeda-pro-control/licenses/json-schema-traverse-MIT.txt).
- [`ws` 8.21.3](https://github.com/websockets/ws), [MIT License](plugins/easyeda-pro-control/licenses/ws-MIT.txt).
- [`zod` 4.4.3](https://github.com/colinhacks/zod), [MIT License](plugins/easyeda-pro-control/licenses/zod-MIT.txt).
- [`zod-to-json-schema` 3.25.2](https://github.com/StefanTerdell/zod-to-json-schema), [ISC License](plugins/easyeda-pro-control/licenses/zod-to-json-schema-ISC.txt).

The development and CI toolchain uses:

- [`esbuild` 0.28.2](https://github.com/evanw/esbuild), copyright Evan Wallace and contributors, [MIT License](plugins/easyeda-pro-control/licenses/esbuild-MIT.txt).
- [`TypeScript` 7.0.2](https://github.com/microsoft/TypeScript), copyright Microsoft Corporation, [Apache License 2.0](plugins/easyeda-pro-control/licenses/typescript-Apache-2.0.txt) and [NOTICE](plugins/easyeda-pro-control/licenses/typescript-NOTICE.txt).
- [`@types/node` 24.13.3](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/node), copyright Microsoft Corporation, [MIT License](plugins/easyeda-pro-control/licenses/types-node-MIT.txt).
- [`@types/ws` 8.18.1](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/ws), copyright Microsoft Corporation, [MIT License](plugins/easyeda-pro-control/licenses/types-ws-MIT.txt).
- [`Oxlint` 1.80.0](https://github.com/oxc-project/oxc), copyright VoidZero Inc., Boshen, and contributors, [MIT License](plugins/easyeda-pro-control/licenses/oxlint-MIT.txt).
- [`oxlint-tsgolint` 7.0.2001](https://github.com/oxc-project/tsgolint), copyright VoidZero Inc., typescript-eslint, and contributors, [MIT License](plugins/easyeda-pro-control/licenses/oxlint-tsgolint-MIT.txt).
- [`Vitest` 4.1.9](https://github.com/vitest-dev/vitest), copyright VoidZero Inc. and Vitest contributors, [MIT License](plugins/easyeda-pro-control/licenses/vitest-MIT.txt); used to test the authenticated bridge source.

The repository vendors a reviewed derivative of the EasyEDA bridge-extension
source from
[`easyeda-mcp-pro` commit `964c05082f1c7c9e8b98f56e967e36bfc3f26128`](https://github.com/oaslananka/easyeda-mcp-pro/tree/964c05082f1c7c9e8b98f56e967e36bfc3f26128/easyeda-bridge-extension).
Relative to that upstream tree, the reviewed derivative adds 5 files, modifies
57 files, and removes 5 files. Its changes include a distinct private extension
and menu identity, nonce-bound HMAC authentication on a fixed loopback port,
credential- and build-bound runtime replacement, bounded parser and connection
policy, hardened lifecycle cleanup, strict TypeScript and type-aware lint
remediation, and fail-closed standalone build commands. The source closure and
complete added, modified, and removed file lists are pinned in
`plugins/easyeda-pro-control/scripts/reviewed-bridge-source.ts`. The
redistributed extension `LICENSE` is an exact copy of the upstream repository's
MIT license: original source copyright 2026 oaslananka. Its added `NOTICE`
records that derivative modifications are copyright 2026 Jan Günter and are
also distributed under that MIT license. See the vendored
[MIT License](plugins/easyeda-pro-control/easyeda-bridge-extension/LICENSE) and
[notice](plugins/easyeda-pro-control/easyeda-bridge-extension/NOTICE).
The separately installed upstream MCP server is invoked at runtime but is not
bundled in this repository.

GitHub Actions builds
[`Bubblewrap` 0.11.2 from peeled commit `1b80120ef26a28e065e67f89bfef873f13bdd317`](https://github.com/containers/bubblewrap/tree/1b80120ef26a28e065e67f89bfef873f13bdd317)
as a non-setuid external test/runtime prerequisite. Bubblewrap is licensed
under `LGPL-2.0-or-later`; its authoritative
[`COPYING`](https://github.com/containers/bubblewrap/blob/1b80120ef26a28e065e67f89bfef873f13bdd317/COPYING)
is in that source tree. Bubblewrap source and binaries are neither bundled in
the plugin archive nor uploaded as repository release artifacts.

The corresponding packages and upstream repository contain their
authoritative license texts.
