# EasyEDA Pro Control Authenticated Bridge

This extension is the private, credential-bearing EasyEDA companion for the
enclosing `easyeda-pro-control` facade. It is a reviewed derivative of the
EasyEDA bridge extension, not a standalone MCP server or a public release
artifact.

## Build and import

Build only from the enclosing `plugins/easyeda-pro-control` package:

```bash
ulimit -S -c 0
test "$(ulimit -S -c)" = "0"
test "$(node --version)" = "v24.18.0"
test "$(npm --version)" = "11.16.0"
npm run bridge:provision
npm run bridge:build
```

Import the exact content-addressed `.eext` reported as `outputPath` by the
build. The archive embeds a private authentication key. Keep it in its
owner-only build directory, never commit or publish it, and rebuild and
reimport it after rotating the key.

Run only the enclosing facade with this extension. Disable or uninstall the
stock `easyeda-mcp-pro` bridge first: the authenticated facade rejects it, but
a competing auto-connect process is noisy and can make the active bridge
unclear. In EasyEDA, use the **Authenticated Control Bridge** menu and require
an authenticated facade status response as live connection proof.

The facade grants and limits authority. Production design mutation and
unrestricted JavaScript remain disabled; importing this extension does not
enable writes. A build receipt proves only the reviewed local artifact, not
that EasyEDA imported or loaded it.

## Safety and attribution

Standalone build, package, and watch entry points fail closed because they
cannot satisfy the enclosing facade's private-output and receipt policy. This
archive's `CHANGELOG.md` records its exact upstream provenance, while its
`NOTICE` and `LICENSE` carry the attribution and license terms. The
enclosing repository documents the operational contract, threat model, and
complete derivative inventory.
