# Candidate 054207

`0.3.0+codex.20261013054207` packages the complete native helper and the
`easyeda_control_validate_closed_symbol` disposable workflow. The offline
catalog now has 27 tools and seven skills. This candidate does not enable the
affected general editing routes.

## Delivered implementation

The maintained 39-unit Windows helper owns runtime copying, process launch,
handshake, result collection and cleanup. The PowerShell v3 transport loads the
hash-pinned DLL from bytes without runtime compilation. Current and retained
evidence readers validate the v3 result separately from legacy evidence.
The public callback reserves a single attempt before asynchronous work and
uses the existing closed-session coordinator. It is not a general writer.

The public pinned compiler and Framework references produce identical DLLs
from two independent build roots. CI checks that reproducibility against the
committed artifact. Package checks include its bytes, identity and permissions.

## Verification

The corrected helper passed a standalone Windows run in 28.370 seconds. The
original process exited zero, its Job was empty, and all 109 file handles,
23 layout handles and 11 ancestry handles closed without cleanup errors or
retained dependencies. The actual v3 result validator accepted the output.
This used a synthetic request, not an EasyEDA project. The earlier failed
process-creation attempt and its retained residue remain separate evidence.

Both facade typechecks, bridge typechecks, strict type-aware lint, actionlint,
package and repository/privacy checks, exhaustive coverage and seven skill
checks pass. The v3 integration passed 153 affected existing tests and 64
legacy/parity tests. No additional test matrix was added for this release.
The earlier 9,701-pass full facade result predates the v3 integration and is
not presented as this candidate's complete regression result.

The first published payload, `41384ed5ab93b73268bf04c6f984405b7afc53c5`,
passed GitHub's build checks in run38353691646. Its integration jobs found a
shared synthetic fixture still using the v2 command marker, input limit and
response shape. Three fixture-only corrections align it with v3. Production
code and the native DLL are unchanged. All 15 affected existing cases, types
and strict lint pass locally. Corrected
[CI38354770224](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/38354770224)
passed at `2e2440f1fab83d825dd7c9616f880eb820d14f28`: 9,713 facade tests passed,
five skipped, zero failed, plus 424 bridge tests. All build, audit and package
checks passed, including public-toolchain helper reproduction.

Frozen implementation identities:

- Native DLL: 175,104 bytes, SHA256 `378f82d9e92fe74e1f61b13d90472d2f80a1b9959941da7133de08e53c45cd20`.
- Facade source, 297 files: `da96c5124b0476b3e2ff64f5829f8f7f8af105cb116aa96639896e0985970bd9`.
- Runtime bundle, three files: `59730dd11dc08ec8c6cfa76e4a098317be6cbf8c0ade385a2f4789e0db087c2b`.

## Publication and installation

Payload `2e2440f1fab83d825dd7c9616f880eb820d14f28` is published on
`feature/api-execution-coverage` in draft [PR9](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/9).
Its plugin subtree is `83b840838f4b7dc896678f36164508f2d0e0d86e`.
The official CLI upgraded the Git marketplace at
`https://github.com/jan-guenter/easyeda-pro-agent-plugin.git` and installed
054207 with the required permissions. Final discovery reports it installed and
enabled. The first successful installer return was followed by an absent cache;
that failed verification is retained. A supported reinstall resolved it without
manual cache edits. The cause of the first disappearance was not established.

All 1,102 committed files, 21,484,081 bytes and file modes match the installed
package, before and after the offline probe. Configured startup hands ambient
Node26.7 to pinned Node24.18 and exposes exactly 27 tools and seven skills.
The probe made no tool calls. Its original child closed; two process snapshots
showed no upstream child or non-stdio socket, and the upstream sentinel remained
absent. This is an offline installation check, not live admission.

Installed inventory SHA256:
`bfdacb09f65813422cf6a1a590b09b46f516f0599a779416ff58bd45674f3a72`.
Retained installation proof SHA256:
`6b38ac155c74a8dacf92d1bdb15eb3b73a733788f4b1364da30f1ea726cc8593`.

## Remaining work

1. Start a fresh Codex host. The existing host loads 030626 and cannot expose
   the new public tool; do not replace its loaded files or start a competing
   gateway.
2. Complete the public disposable workflow and inspect its exact durable
   effects. The standalone helper run does not establish that result.
3. Integrate the resulting operation-owned completion evidence into each
   supported writer. The symbol modification model cannot be reused unchanged
   for new symbols, page/container metadata or geometry Save.
4. Enable only routes whose complete effect model and disposable lifecycle pass.
   Keep concrete omissions in the API inventory. Additional adversarial test
   expansion is deferred at the user's request.

Schematic-page, symbol and PCB design transactions and the eight metadata
writers remain blocked. Footprint and unrelated routes keep their existing
guards. No production design was opened or edited.
PR9 remains a draft while this broader execution work is unfinished.
