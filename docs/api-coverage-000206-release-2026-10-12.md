# Candidate 000206

`0.3.0+codex.20261012000206` adds historical reader-test metadata to offline
API discovery. Local verification passed; publication and installation are pending.
It changes no live reader/writer handler or argument schema. Production designs
and their project records remain untouched; the disposable editor is closed.

## Discovery change

`easyeda_control_api` action `sdk-reads` now returns `historicalValidation` for
each entry. Nine historical cases, R01–R09, cover six reader paths across the
164600, 204104 and 220050 installed generations. Each indexed record includes
the actual generation/source/runtime bindings, argument domain, independently
retained evidence commitments, exclusions and immutable ledger link. Separate
current source-review hashes do not transfer that old execution evidence.

The catalog label is `current-generation-unclaimed;historical-cases-separate`.
Execution authority and complete-contract validation remain false. The other
176 entries return explicit empty history: no indexed case, not an assertion
that the method was never tested. Catalog pagination remains bounded in both
schema modes. Runtime samples retain their original labels and schemas.

The index is deliberately R01–R09 only, not an exhaustive historical registry.
The frozen historical projection is
`6f17d3aaa64fdbecf759a8f5fc559ad52af492bca6f603d5d2abbac814342b0a`.
The immutable source ledger is committed at
`a805ffeef142a760eb8b86b2c466bd84f0b3b534`.

Inventory is unchanged: 774 methods (193 public subsets, 103 native task
equivalents, two lifecycle-only, seven implemented-but-blocked, 469 omitted),
358 guarded routes, nine blocked and three partial; 182 fixed readers including
21 native equivalents; 108 design and 68 library schemas; 26 tools/seven skills.
These are implementation counts, not live-validated-method counts.

## Connected evidence on 220050

The preceding installed generation passed configured-font R09 on an ordinary
schematic and sealed-wire forward/reverse C04/C05. Each wire transaction used
one Save/close/reopen. Independent complete source/native/persistence proof
retained all 12 documents, 11 peers and 66 imported atom-header occurrences.
The reverse restores original source geometry, not original database history.
Final raw flat observations were not retained for independent reconstruction;
the executor's final topology check and independent source/native/durable proof
are distinct evidence. Unsaved rollback and broader shapes remain untested.

Normal close and empty process discovery prove the editor exited. Closed-file
verification retains database `471d6b9e`, checkpoint `621cb2f6` and logical dump
`ea3da0fa`; all nine approved listing-only backup inventories are unchanged.
The [case report](api-coverage-220050-fixture-validation-2026-10-12.md) and
[connected ledger](api-connected-validation-ledger.md) retain exact boundaries.
The packaged control guides now describe those historical cases without
granting a later generation admission. No completed operation is replayed.

## Concrete remaining viewport omission

The [schematic viewport investigation](api-schematic-viewport-research-2026-10-12.md)
reviews official contracts and the pinned native fit/zoom implementation.
Standalone fit-all remains omitted: ordinary frame/text/symbol/wire bounds,
settled interaction state, complete spatial-index correspondence and retained
renderer completion still need proof. A rectangle-only shortcut would exclude
ordinary schematics. Synthetic numeric tests are source research, not connected
viewport validation. Existing bounded region capture remains available.

## Release checks

Clean Node24.18.0/npm11.16.0 installation passed dependency-tree verification,
151 registry signatures, 40 attestations and a zero-vulnerability audit.
All four TypeScript configurations and both strict type-aware lint checks passed
with zero lint diagnostics. Full verification passed 3,725 facade tests with one
platform skip and zero failures, plus 424 bridge tests. All seven official skill
validators, repository/privacy/license checks, packaged validators, offline
doctor and actionlint passed. The full verification log commitment is
`d15e393fe5056a8fa3a120fa6644d8ab1c6bc6263cfac1e882cf8aff69720be3`.
A second complete facade run with hostile inherited descriptors142/145 passed
the same 3,725 tests/one skip/zero failures; log commitment
`4d14e98b52c9ce4cc1e5cbc23ce32216e01553b94389ffe779cb27cefc19b26b`.
The subsequent clean rebuild reproduced both bundles and the sanitizer exactly;
compatibility rechecking passed.

Source fingerprint is `8d2f84bfec4866f4e6cf5e313ae1a0169c9ea9ccca7c4e86eb89b2f9b7ad6aa6`
across 205 files; runtime fingerprint is
`afdec3fcaee2dbce0b3f8e39a3fbd1db167f34ad840c16c21f6956883c38f280`
across three files. Compatibility manifest SHA is
`74b931b670a218de3b29fd02d15d830d51b1a2d9ca317fd8a4cd0d78a21c614f`.
Only the facade projections and review timestamp changed; all external pins
remain unchanged. The supervisor's only byte change is the reproducible bundle
pair identity. The descriptor sanitizer remains unchanged.

Required exact-payload CI and official Git-marketplace installation are pending.
New offline discovery does not need a live design mutation; installed
catalog/startup proof and fresh-host admission remain separate. PR9 remains
draft while broader API execution work is unfinished.
