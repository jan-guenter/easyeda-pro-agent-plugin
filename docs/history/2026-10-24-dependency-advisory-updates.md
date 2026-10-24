# Dependency advisory updates

2026-10-24, based on main
`1363bddb4b9a642cc2ca4d042b5c7f85bafbfc17`. This records dependency work for
the next combined batch; it does not claim a new release or live CAD validation.

## Findings and changes

Main [CI40035140331](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/40035140331)
failed its moderate-or-higher dependency audit on the new body-parser advisory.
All eight facade-test shards passed. The preceding
[PR CI40031752806](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/40031752806)
passed at `d9beeb9e7cc7c90b2b3a22b8725371c38e157975`; the two commits have
identical trees. This failure did not establish a test regression.

Only these three lockfile package entries change:

| Package | Previous | Updated | Dependency path |
| --- | --- | --- | --- |
| body-parser | 2.3.0 | 2.4.0 | MCP SDK1.32.1 → Express5.2.1 |
| qs | 6.16.0 | 6.16.1 | Required by body-parser2.4.0; shared with Express |
| fast-uri | 3.1.8 | 3.1.9 | MCP SDK1.32.1 → Ajv8.20.0 |

Existing semver ranges admit all three updates, so no package.json dependency
or override is added. Targeted npm lock regeneration preserves all other
package versions and top-level lockfile metadata. No broad audit-fix was used.

## Compatibility review

[GHSA-27r3-jxmh-p828](https://github.com/advisories/GHSA-27r3-jxmh-p828)
affects body-parser2.0.0 through2.3.0. The
[2.4.0 release](https://github.com/expressjs/body-parser/releases/tag/v2.4.0)
fixes a process crash from trailing bytes after a compressed request. Its
[upstream patch](https://github.com/expressjs/body-parser/commit/f7075ea)
detaches and destroys the finished decoder while retaining an error listener;
unsupported charsets are rejected before creating that stream. Node>=18
support remains. The minor release also adds zstd handling, avoids parser-option
mutation and raises three dependency minimums. content-type2.1.0 and
iconv-lite0.7.3 were already locked; only qs needs a further update.

The [qs6.16.1 changes](https://github.com/ljharb/qs/blob/v6.16.1/CHANGELOG.md)
include parsing, encoding and merge-limit corrections. First-party code imports
the SDK's stdio transport. The current reviewed esbuild inventory excludes
Express, body-parser and qs; the final build must verify this remains true.
The update does not add an HTTP transport or compressed-request endpoint.

A fresh audit then reported four fast-uri advisories. The
[3.1.9 security release](https://github.com/fastify/fast-uri/releases/tag/v3.1.9)
fixes all four on the existing3.x line. Review covered the complete index.js
and lib/utils.js changes against3.1.8. The resulting behavior changes are:

- Percent-encoded schemes are rejected instead of decoded into a live scheme.
  [GHSA-w74x-v6f9-j3xg](https://github.com/advisories/GHSA-w74x-v6f9-j3xg).
- Ambiguous delimiters or stripped control characters in domain hosts are
  rejected instead of silently canonicalized to a different host.
  [GHSA-wjr9-j795-jxcr](https://github.com/advisories/GHSA-wjr9-j795-jxcr).
- Relative-reference normalization preserves leading parent segments and
  document-relative meaning.
  [GHSA-xhq7-xmqj-769h](https://github.com/advisories/GHSA-xhq7-xmqj-769h).
- Path-only suffix references escape a first-segment colon.
  [GHSA-333x-w4r6-6crp](https://github.com/advisories/GHSA-333x-w4r6-6crp).

These are observable URI semantics changes, including stricter handling of
formerly accepted malformed inputs. Ajv uses fast-uri for schema references;
its local and relative-reference behavior receives a focused check below.
This review does not prove that every possible third-party schema is unaffected.
The package adds no dependencies and changes no public type declarations.
Both notice files and the bundled-runtime inventory now identify3.1.9. The
upstream license digest remains
`b010b0dfdfdb23d7396e03b82cd4621fc9bb8f95d6b0aea70b9c24e12074c786`;
the vendored license text is unchanged. External EasyEDA compatibility pins
are unchanged.

## Verification and remaining work

The first focused URI check failed because actual node_modules still contained
3.1.8 after npm's lock-only update and subsequent install reported up-to-date.
Both lockfiles and npm ls showed the new versions; direct package reads exposed
the stale files. After coordinating a pause in other dependency consumers,
`npm ci --ignore-scripts --no-audit --no-fund` installed151 packages. Direct
installed-package reads now match all three updated lock entries.

The repeated focused check passes all four changed URI behaviors and the
actual SDK/Ajv provider's absolute-base, relative and local-reference validation,
including invalid-value rejection. The dependency audit reports zero
vulnerabilities;151 registry signatures and42 attestations verify. The lockfile
diff and whitespace checks pass.

A pre-freeze typecheck stopped on the concurrent extended-primitive work's
unfinished module imports and owner method. It is not a passing typecheck.
Final types, combined build, bundle/inventory verification, compatibility
refresh, required tests and CI remain with the batch owner. No application,
bridge, design, installed-plugin cache or historical validation record was
changed by this dependency work.
