# Vitest dependency audit fix, 2026-10-22

PR97 initially failed Linux verify-build in run39827000065 at the dependency
audit step, before build verification. Installed signatures and attestations
passed. npm reported two moderate advisories in the pinned development-only
`@vitest/mocker` dependency, inherited through Vitest4.1.11. The Windows recovery
check passed separately. The failure is retained, not relabeled successful.

The maintainer's [4.1.12 release](https://github.com/vitest-dev/vitest/releases/tag/v4.1.12)
backports the fixes for [manual mock code injection](https://github.com/advisories/GHSA-qxg6-89mg-rqv8)
and [Windows redirect traversal](https://github.com/advisories/GHSA-xp26-3454-mjgp).
Root and vendored bridge development manifests now pin Vitest4.1.12. The root
lockfile updates only Vitest and its seven @vitest packages; unrelated locked
packages remain unchanged. Maintained toolchain checks, provenance description
and third-party notices use the same exact patch version.

No bridge production source, runtime dependency, dispatcher identity, installed
cache or external compatibility pin is changed. Both runtime bundles remain
byte-exact to the documentation commit. Dependency preparation, 151 registry
signatures, 40 attestations, the zero-vulnerability audit, sanitizer/source build,
compatibility checks, local links and all184 repository/privacy checks passed.
The existing Vitest core MIT notice still matches the installed core license.
Full local and hosted verification are tracked with
[PR97](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/97).
No live CAD or bridge call is needed.
