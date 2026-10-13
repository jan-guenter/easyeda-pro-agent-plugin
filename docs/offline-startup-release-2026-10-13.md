# Upgrade-resilient offline startup

Version: `0.3.0+codex.20261013124500`.

The backlog continuation found an application upgrade before any live work.
The configured old PCB and API files are absent. EasyEDA's assets root itself
exists. The [read-only inventory](easyeda-3.2.206-upgrade-inventory-2026-10-13.md)
records the new generation without admitting it.

## Changes

The common launcher first verifies the private profile, control directory and
descriptor-bound pinned Node. External installation failure then selects a
separate offline-only entrypoint with a fixed failure code. Invalid profiles
and unverified executables still fail startup. Strict configuration reuse and
doctor still refuse an invalid installation.

The restricted process exposes exactly three tools:

- `easyeda_control_api`: the existing bundled reference and argument validator.
- `easyeda_control_discover`: local catalog only; all execution routes unavailable.
- `easyeda_control_status`: bounded installation failure and restart guidance.

There is no upstream client, native controller, execution tool, recovery tool
or automatic promotion to live mode. The sole-owner lease remains mandatory.
The maintained foreground client now enters the same launcher. Normal-mode
API schemas and handler behavior remain shared and unchanged.

The declaration parser now tracks nested delimiters, strings and block comments.
This fixes four truncated method signatures in the newer installed declarations.
It also refuses malformed or unsupported syntax instead of publishing a prefix.
All 749 reviewed and 806 official-reference signatures remain byte-exact. No
new declaration snapshot or compatibility checksum is admitted.

## Verification and delivery

Local types, full strict type-aware lint with zero warnings, package/coverage,
repository/privacy and all seven skill validators pass. The 24 focused
profile/launcher/client tests, eight parser/catalog tests and four packaged
startup tests pass. One new packaged case removes a synthetic pinned PCB file,
verifies the three-tool interface, queries status/reference/validation, refuses
live requests, restores the file without promotion, observes no upstream child
or non-stdio socket, and verifies lease removal after close.

The first composed test exposed an MCP output-schema normalization error in the
new entrypoint. Replacing the generic record schema with the SDK-supported
object schema fixed it; the same case then passed. Normal startup still exposes
28 tools. These are isolated package tests, not connected EasyEDA validation.

Source projection:307 files,
`d341d2864b7ffb3f955a86c2807e75916ab3b674d3a641fd40842d35600bae45`.
Runtime projection:three files,
`682a26284c78f6508469a6d94ea301b10151b9d426c0f96973d3b742f179488b`.
External runtime, native helper and bridge pins are unchanged.

A second build reproduces both committed JavaScript bundles byte-for-byte.
Dependency audit reports zero vulnerabilities, 151 verified registry signatures
and 40 verified attestations.

This is the pre-delivery snapshot. The
[PR10 delivery receipt](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/10)
records exact-payload CI, protected merge and installation results. Consult it
before repeating those actions. Existing full regression suites remain in
GitHub CI; this work does not add a broad test matrix.

## Remaining backlog

The upgraded public wrappers and delegated native implementations need review
before connected execution can resume. Updating version labels is insufficient.
The inventory identifies 16 new `sys_Math` calculation candidates for follow-up;
none is enabled by this release.

The preceding [implementation backlog](scoped-release-2026-10-13.md#implementation-backlog)
remains open. Closed-symbol lifecycle validation and ordinary-writer enablement
are incomplete. The consumed C10 request must not be replayed; its historical
abandonment has not run. No design, private profile, external pin or original
operation record was changed by this implementation.
