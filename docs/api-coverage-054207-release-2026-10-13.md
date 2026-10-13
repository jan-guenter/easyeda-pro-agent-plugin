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
and strict lint pass locally; the corrected CI result is still pending.

Frozen implementation identities:

- Native DLL: 175,104 bytes, SHA256 `378f82d9e92fe74e1f61b13d90472d2f80a1b9959941da7133de08e53c45cd20`.
- Facade source, 297 files: `da96c5124b0476b3e2ff64f5829f8f7f8af105cb116aa96639896e0985970bd9`.
- Runtime bundle, three files: `59730dd11dc08ec8c6cfa76e4a098317be6cbf8c0ade385a2f4789e0db087c2b`.

## Remaining work

1. Publish the candidate, pass the existing GitHub CI gates and install it from
   the Git marketplace. Verify installed bytes, modes and offline discovery.
2. Start a fresh Codex host. The existing host loads 030626 and cannot expose
   the new public tool; do not replace its loaded files or start a competing
   gateway.
3. Complete the public disposable workflow and inspect its exact durable
   effects. The standalone helper run does not establish that result.
4. Integrate the resulting operation-owned completion evidence into each
   supported writer. The symbol modification model cannot be reused unchanged
   for new symbols, page/container metadata or geometry Save.
5. Enable only routes whose complete effect model and disposable lifecycle pass.
   Keep concrete omissions in the API inventory. Additional adversarial test
   expansion is deferred at the user's request.

Schematic-page, symbol and PCB design transactions and the eight metadata
writers remain blocked. Footprint and unrelated routes keep their existing
guards. No production design was opened or edited.
PR9 remains a draft while this broader execution work is unfinished.
