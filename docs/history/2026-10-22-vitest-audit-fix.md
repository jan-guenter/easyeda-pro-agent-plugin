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
cache or application/upstream compatibility pin is changed. The initial development-only patch retained byte-exact runtime bundles. The
reviewed source-identity correction below also updates the facade admission pin
and regenerates the bundles and allowed facade compatibility projections. Dependency preparation, 151 registry
signatures, 40 attestations, the zero-vulnerability audit, sanitizer/source build,
compatibility checks, local links and all184 repository/privacy checks passed.
The existing Vitest core MIT notice still matches the installed core license.
Full local and hosted verification are tracked with
[PR97](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/97).
No live CAD or bridge call is needed.

The first broad local verification attempt correctly refused bridge builds after
the development-manifest change. Its partial failures are retained in the private
verification log; that run was stopped as a failed attempt, not reported green.
An independent Git-byte comparison reproduced the original70-file closure and
proved that the sole vendored change is `devDependencies.vitest`4.1.11 to4.1.12.
The facade's own closure reader independently agreed with the new digest.
The reviewed derivative-source hash is therefore updated from
`3281712da24240fa4962fd47855795df71878bb651d820e0c73960875bc701f2` to
`5f22ad229477ccb898ad6502cb47fd67d24171c9bededd330f118b527e4eb204`, retaining
70files and856665bytes. The mismatch refusal remains intact. This changes the
reviewed local derivative identity, not the upstream commit or dispatcher pins.

Focused follow-up first passed31/32 tests, with the remaining assertion detecting
the runtime admission pin still naming the old closure. The source identity,
runtime identity, validator expectation and capture fixture now name the same
independently derived closure. No guard or assertion is removed. This requires
a matching private bridge build receipt for a future installation; the running
installed bridge and cache are left untouched. The runtime change is confined
to reviewed derivative-source admission, with no editing capability added.

Final focused verification passed all50 bridge-build, reviewed-source, identity
and facade-capture regressions. The actual Vitest4.1.12 bridge suite passed
all424 tests across28 files. Root/bridge types, root/bridge lint, source build
and compatibility checks passed. The intermediate hosted run39828156838 failed
its authenticated bridge fixture-build stage before this coordinated identity
correction. It is superseded by final-head verification, not reclassified green.
