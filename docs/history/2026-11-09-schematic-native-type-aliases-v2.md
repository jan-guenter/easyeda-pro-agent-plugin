# 2026-11-09 schematic compiler aliases V2

This source-only leaf adds a separate composite V2 codec over the unchanged
schematic V1 projection. Its immutable 37-entry catalogue contains framework
types, one generic namespace prefix, three bare framework names, and fixed
global static helper names. The catalogue SHA256 is
`60ff2369145476db7f25091bfcabe453fdf5a3cb13b868c4c58709c37aa1567d`.
Changing the catalogue requires another format version. Each emitted alias
must pay for its directive and selection metadata, and the complete V2 block
must reduce source length.

The restricted lexer preserves comments, literals, escaped literal bytes and
noncontiguous qualified spellings. Fresh aliases and escaped candidate names
refuse collisions. The bare framework names require fixed namespace imports
and a complete declaration/shadow census. Exception references admit only
new/catch type positions; comparer references require static member access.
Each present helper requires exactly one global static class declaration, and
every other occurrence must be its unqualified static member access. Original
class declarations and external names remain intact. Other contexts refuse.

The V2 block records the exact V1-layer length, SHA256 and catalogue selection.
Expansion bounds cumulative restored bytes, verifies the full hash and canonical
projection, then invokes the unchanged V1 decoder. Both source and compiler
limits retain their existing values. Historical V1 and inverse modules, their
imports and output formats remain unchanged.

Pure Node generation on base `a173be47` measured the actual schematic factory.
The full original C# review was 2,163,097 bytes, SHA256
`40f594b60426f4c188af1fcadc75cedddd10f99424a0ee93ead4eff836a1c1a0`.
The canonical V1 review was 2,128,662 bytes, SHA256
`7a174c8fd72fb0857261d77cab0e781f202eedb0346b8a2aa5b4ea7795f172a3`.
The V2 review is 2,103,339 bytes, SHA256
`4277290eaa40bd23d4b91b253adbf117b9139ca8282958773ff55afa70e2492d`.
Thirty-six entries are useful on that source. Complete original-byte expansion
and final-projection repeat checks passed.

The existing V3 storage pack measured 2,070,707 compiler bytes before V2,
SHA256 `c8adec19346ff1db0f7c1992484508db17a5a7ca0a5dcf1d25be00a18d2ba792`.
After V2 it measured 2,044,949 bytes,
SHA256 `8106324ae0ee3c08316e0848e84e1060e5f730310b893dec749995e451a77613`.
This saves 25,758 compiler bytes and leaves 52,203 bytes below the unchanged
2,097,152-byte limit. These measurements describe this clean-base factory,
not the parent's later composed Canvas/return/echo source.

The source/test tree is `2af562ab0eb1ee81c17e6e244e4a08d7264e84c0`.
Nine focused V2, V1 and inverse cases passed with zero skips. Strict changed-file
type-aware Oxlint passed with zero warnings. Initial local lint and TypeScript
annotation failures were corrected; their failures remain separate from final
verification. Final facade/stub and bridge/test TypeScript configurations passed.
MCP-contract, all seven packaged skills and all seven installed skill-creator
checks passed. Repository validation first refused a temporary dependency
symlink; that dependency materialization was replaced with a regular directory,
with no validator or source guard changed. Final repository validation passed
all checks over 5,497 repository files and 4,681 package files. Node was exactly
24.18.0, npm 11.16.0, and soft RLIMIT_CORE was zero throughout verification.

Root independently read the complete codec and found no actionable weakening
in the alias census, canonical roundtrip or restored-byte bounds.

The parent owns generator hooks, generated source/bundles, identity pins and the
one exact final C# compiler proof. This leaf changes none of those files and
ran no C#, Windows helper, application actor, CAD operation or native allocation.
It grants no execution, write, Modify, Save or persistence authority. Source
alias preservation is separate from target-runtime compilation and connected
validation, which remain pending for the composed parent payload.
