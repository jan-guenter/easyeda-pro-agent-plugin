# PR170 publication and installation

[PR170](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/170) merged
through the normal protected squash path as main
`b16fb1e64c0d4cb0b2f57d2c4f07a894bb80940d`, with sole parent
`f06279f1c13f25812e4a68e5ccfd10c133233dd0`. Its final source head was
`2db20db660cefcd90bc6fc3660e060cdee76f376`. Main's root tree
`162a8d8cdc44c3ac3eae1c9f5bbd1369a9d36ea9` and plugin tree
`c9543b93882fb5b98fac3131a3b79588a1b7d30f` equal that final payload.
No administrator bypass was used.

## Review and verification

CodeRabbit completed two actual full PR reviews, at `5a2a1e2` and
`73d08e6561bb330dc406f7840a669bab2be47208`. All four reported issues are fixed:
the duplicate native constructor, fractional-number decoding, invariant double
round trips, and four missing spaces in the coverage description. All four
threads are resolved. Named-function documentation was added; the provider's
scoped documentation metric reached 82.61%, with skipped files retained.

CodeRabbit reviewed 68 selected PR files, filtered two bundles and could not
fully review the large source-profile file. Its command covered the full PR
diff, rather than every unchanged repository file. The final `2db20db6` delta
received independent root/peer review: four text spaces, derived inventory and
bundle fingerprints, and one historical snapshot link. A bot review of that
final formatting-only commit is not claimed.

Exact-payload PR CI passed all 11 jobs: 14,364 facade passes, five platform
skips, zero failures, and 424 bridge passes. Source and bundle projections,
actual checkout ancestry, package bytes/modes and archive CRCs all match.
Main's first attempt lost one runner, producing cancelled tests with zero
assertion failures. Its raw failure remains retained. One failed-jobs POST
reran only that shard and its dependent aggregate. The other successful
executions were retained; provider-created alias records were matched by
complete execution metadata and identical logs. Main's final selected 11 jobs
passed with the same complete counts and artifact. No failed attempt was
rewritten as success, and no test cases were lost or counted twice.

Strict types and type-aware lint passed with zero warnings. Dependency audits,
reproducible bundles, privacy/package, coverage, compatibility and all seven
skill checks passed. Full suites ran in CI; no duplicate full local suite ran.

## Official installation and automatic update

The official CLI upgraded Git marketplace
`https://github.com/jan-guenter/easyeda-pro-agent-plugin.git`, ref `main`, and
installed/enabled `0.3.0+codex.20261105182454`. All 2,655 files, 43 directories
and 54,398,888 bytes match committed bytes and modes. Package inventory SHA-256
is `d13c05f1179e718c9691353ac21476a5f6b2fe631b10b886eea8f11d36c49a32`.
The source projection has 1,062 files, SHA-256
`9f7a7213629722301519f1c678059188b0809edadc4bc1394dc4514e6b0ea46e`;
the three-file runtime projection has SHA-256
`e99d4fff3a6c5e44bb338b6c5f41a2584fa811ebc1e521472973f50d3b3711ce`.
No cache was edited manually.

The installed dependency-free probe completed 79 queries and 81 requests,
then observed EOF/close with exit zero. The same original foreground manager
retired its frozen facade, selected the installed replacement, and exposed
the new spatial schema. Full package, actual process, original parent,
executable, module, lease and source identity were independently admitted.
Both facade generations retired and exited zero, followed by manager shutdown
and separately observed original pidfd exit. All 18 records settled; no owned
process or control lease remained. No signal or Codex restart was required.

This is facade/package/schema admission. No EasyEDA application, native design
operation, bridge action or user project was opened or edited during this
batch. Positive connected spatial validation still needs a Via-only disposable
fixture. The installed readers remain restricted native equivalents, with no
ordinary-project, writer, explicit Save or persistence authority.

## Retained proof commitments and remaining work

| Private proof | SHA-256 |
| --- | --- |
| Final PR CI | `6e37f93cb4d8d34334a568e4e5b86aacfbcc7b1346785dd9ba1d112b19d4ebea` |
| Actual full review at 73d | `4eb02cab3613a37b3d4f89c3fd12ad409876ac3acda4fe44fa2400de1f98a3da` |
| Independent final text delta | `150dd4de8d17beb0650d372c151253d58cbad497fc2f62b631cf1d68e803d783` |
| Final main CI with retained retry history | `564b84a84b8658d3e181d706745bd9eb5adacbb29d9710eb9ff7e0258eebcca6` |
| Installed update without Codex restart | `1e007f87a1cd9451fab88ca9185a2c3a72a933ebe1182fe1551ce31621731c68` |

The [backlog assessment](2026-11-05-api-backlog-priorities.md) retains the full
835-method inventory, 481 omissions and 79 implemented-but-blocked entries.
Next foundations are fixture provisioning/registration, ordinary PCB
observations, passive schematic-page reads, operation-owned structure/Save
completion and one PCB writer, then schematic display and separate wiring
transactions. Line picking also needs additional native profiles and an
explicitly derived transport plan. No broader coverage is inferred from this
release.
