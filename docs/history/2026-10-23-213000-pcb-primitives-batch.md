# PCB primitive reader batch

2026-10-23. Based on protected main
`ac5012c79d9cbea860e6b431db154860ecab8182`; intended install version
`0.3.0+codex.20261023213000`. This is an implementation/release record, not
authority to replay any historical EasyEDA operation.

## Completed work

- Admitted the restarted195500 host and completed its two pending live cases:
  layer metadata/copper count and configured shortcuts. The separate
  [connected record](2026-10-23-195500-connected-layers-shortcuts.md) retains
  scoped results and original normal cleanup. No production project was opened
  or edited; no agent Save, restore or force termination was performed.
- Added one original-owner209 `observe-primitives` stage for Line, Arc, Via and
  parentless String. It returns two matching ordered loaded-view projections
  and their IDs, with exact target/receiver checks,256rows per family and384KiB
  aggregate bounds. Original intent/result records and cleanup survive failures.
- Added fixed native protocol reconstruction, generator equality checks,
  original-owner integration and regressions. No caller code, topics, filters,
  replacement target or saved-state authority are exposed. Both readers fit
  the existing103-request transport budget, including ancillary-frame checks.
- Added eight generation209 native-task-equivalent coverage routes while
  preserving older206 routes and unsupported domains. The inventory remains
 835 distinct methods; route count increases from365 to373. These are
  implementation classifications, not connected validations.
- Updated the existing control skill's task reference, API discovery and public
  scope descriptions. The skill-creator guidance kept the detailed procedure
  in the task reference instead of expanding general agent rules.

The [source research](2026-10-23-pcb209-reader-extension-research.md) records
exact installed callbacks, serializers, units, API rounding differences and
omissions. Independent reviews covered that source correlation and the
original-owner lifecycle. The new primitive reader has no live validation yet.

## Verification in progress

Focused checks completed before final freeze: seven pure-reader tests,
101owner/pipe tests,20native/protocol tests,51coverage tests and92public-schema/
lifecycle tests. These overlap the required full suite and are not summed as
a separate coverage claim. Strict types and targeted type-aware lint pass.
An initial root lint run found three test-style issues; they were corrected
and the focused rerun passed. Required final frozen-payload verification,
Windows compile-only, CI, publication and official installation remain pending.

## Remaining work

1. Validate the newly installed primitive reader once on the disposable fixture;
   populated family coverage is not implied by an empty fixture result.
2. Extend209 readers to components/pads/attributes, dimensions/images, selected
   objects, filters and exact-ID semantics after reviewing their serializers
   and parent/child associations.
3. Finish pre-open ratline/worker capture, receiver/publication ownership and
   complete common live/source/SQL baselines with actor-clock ownership.
4. Implement contained writer destinations and disposable create/Save/close/
   reopen plus full peer/SQL checks and operation-specific recovery.
5. Expand schematic/PCB editing, connectivity/rules/routing, library pin-pad
   mappings and manufacturing exports. Hidden annotation/SaveAll paths and
   installed native stubs remain explicit omissions, not empty successes.
6. Complete catalog geometry/assets, linked-asset ownership and bounded
   encrypted/compressed asset handling.

No new tiny release is needed for the two successful195500 observations alone.
They are batched with the four-family implementation and coverage updates here.

## Pre-release findings

The exact Windows PowerShell5.1 helper compile-only check passed with
`compiled:true`, `pipesChecked:true`, `emptyJob:true`, `processLaunched:false`.
The unchanged912898-byte helper hash is
`989e51d7328bfad6d0a94c372db5480c884870ccf21b07709f6c312e55ebe7d9`.
Private receipt SHA-256:
`deafc9e4912d14c143ee9c65106ff87d80b39a308ed29790c8164b65a7cebb60`.
This compiles and exercises fixed protocol checks; it is not a live primitive read.

The initial required dependency audit reported one new high-severity Zod
advisory, so verification stopped before building or freezing the package.
The report and151 verified registry signatures/40 attestations were retained.
The exact dependency update is being included in this same batch rather than
shipping a known-vulnerable pin or bypassing the audit.

Zod is now pinned exactly to4.6.7, with no other dependency version changes.
The [advisory](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) affects
versions below4.6.6; the [upstream fix](https://github.com/colinhacks/zod/pull/6652)
checks collection size before walking over-limit elements. The update also
inherits4.5's Unicode code-point string-length semantics. Explicit local
refinements retain the existing native UTF-16 bounds for Windows paths,
geometry IDs/text/metadata/colors, layer text, font titles, shortcuts and symbol
metadata/preparation/write budgets/actors. Oversized paths refuse before program
construction. Fixed native program text and helper pins did not change during
this dependency correction. HTTP-only catalog strings remain code-point bounded;
their independent body/result byte ceilings are unchanged. This is not an
exhaustive compatibility audit of every Zod consumer.

The dependency-only checks passed0audit vulnerabilities,151registry signatures,
40attestations and full types. The UTF-16 corrections passed148affected tests;
the final geometry expansion then passed54geometry/layer/primitive tests and
strict type-aware lint. Root final verification follows on the frozen aggregate.

The first aggregate build refused the stale machine-readable bundled Zod
inventory. The inventory and both third-party notices now match4.6.7; the
bundled license remains byte-identical. Independent final review also found
that the Windows path minimum still counted code points. Both minimum and
maximum now explicitly retain UTF-16 units, with supplementary-Unicode
boundary regressions; all12disposable-opening tests pass. No shared native
guard or installed external pin changed.

The first aggregate `verify` stopped at a test-only wildcard re-export whose
dependency graph now exceeded Oxlint's barrel threshold. The shim now re-exports
only its four unchanged core dependencies; no lint rule was relaxed. The
failed log is retained and the complete frozen verification is being rerun.

## First CI candidate and current-adapter review

PR108 candidate`6925f2bb04a34ba40d632562e8c26b531ab88519` passed Windows
recovery/compile CI40028249006 and Linux build checks. Linux shard1 in
CI40028249007 refused the changed configured-font adapter's deliberately pinned
current source review. Its1498tests had1497passes and one failure. The local
aggregate run was interrupted before changing that review record; it is not a
completed successful verification. Its private log and the CI failure remain
retained.

Root and independent review compared the complete configured-font adapter with
its historical implementation. The only implementation change adds an explicit
host-schema`title.length <= 1024`refinement to retain the native UTF-16 bound
under Zod4.6.7; the generated native expression, context/receiver checks,
512row/131072aggregate limits and operation authority are unchanged. The
supplementary-Unicode boundary tests are in the
[immutable candidate](https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/6925f2bb04a34ba40d632562e8c26b531ab88519/plugins/easyeda-pro-control/server/tests/configured-font-read.test.ts).
The new current source review uses date2026-10-23 and digest
`d0d2aabee1d9c6e14672b60972d388b340969a5f7e82a526d8e68f3ddafbd73f`.
The historical font binding remains
`d662d4aeb294b779494ba63ca89c7bb9a2446d430f36302b2463cc96d2e8a1c1`;
all original generations, R01–R09cases and their immutable commitment remain
unchanged. This source review transfers no live evidence to the new generation.

## Second CI candidate: inverse test fixture

Candidate`9d69992d2edeb1d24fbced0b65d61b76880af963` passed Windows CI40029809243,
Linux build checks and seven of eight facade shards in CI40029809256. The
remaining shard had1178tests:1168passed, nine failed and one platform skip.
All nine failures occurred while constructing the inverse test VM: its empty
replacement metadata-preparation schema omitted the production
`observationProjection`field, which Zod4.6.7now checks when `.omit()`runs.
The actual production schema already contains that field. This is a test-fixture
initialization mismatch, not evidence that the production inverse ran or failed.
The local aggregate was interrupted before editing the fixture; its partial run
is not a final verification. Production source, bundles and pins remain frozen
for this test-only correction. The failed CI and local logs are retained.

## Terminal release and installation

2026-10-23 22:44 UTC, 2026-10-24 in the local timezone. This appendix resolves
the earlier pending release statements without replacing their failure records.

Final PR payload `d9beeb9e7cc7c90b2b3a22b8725371c38e157975` passed the complete
frozen local verification. The facade suite ran 12,498 tests, with 12,494 passes,
four platform-specific skips and no failures or cancellations. All 424 bridge
tests passed. Strict types, type-aware lint with zero warnings, coverage,
generated protocols, build, compatibility, repository privacy checks, the MCP
contract and all seven skills passed. The installed skill-creator validator
also accepted all seven skills. No external official plugin validator was
available; the mandatory maintained validators passed.

The clean dependency install, dependency tree, 151 registry signatures,
40 attestations, zero-vulnerability audit and sanitizer check passed under
Node 24.18.0 and npm 11.16.0 with core dumps disabled. Both generated runtime
bundles reproduced exactly after the full suite and merge. The facade source
projection covers 635 files with SHA-256
`405e1ec86326b31f939df6ab42094ee3cc379d80c7a3ca48da06588b7f3fda53`.
The three-bundle projection is
`6e98ff2cc2b8c00f8ed4490b61f03b84741615732a4ad06a07a0691c0ce9a0f7`.
External upstream, EasyEDA, bridge and installed-bundle pins stayed unchanged.

[PR 108](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/108)
merged normally through branch protection as
`1363bddb4b9a642cc2ca4d042b5c7f85bafbfc17`. Its exact final payload passed
[Linux CI 40031752806](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/40031752806)
and [Windows CI 40031752814](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/40031752814).
The PR and main full Git trees both equal
`4cdb7d9060241068722dafcef308f6f77c15a96c`; the plugin subtree is
`e110fd085739ab188a7e51b5a189e7a98419bb9e`.
The same-tree main [Windows follow-up](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/40035140373)
passed. At this cutoff the main [Linux follow-up](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/40035140331)
was still running; the exact-payload PR checks were already green.

The official CLI upgraded the configured Git marketplace
`https://github.com/jan-guenter/easyeda-pro-agent-plugin.git` from a neutral
directory with installer umask 022. Its completed result reported no errors.
A subsequent listing confirmed `0.3.0+codex.20261023213000` installed and enabled;
the cached marketplace HEAD equals the merged main commit. No redundant add,
manual cache edit, owner termination or gateway rebinding occurred.

The maintained read-only installed-payload verifier matched all 1,809 files,
42 directories including the root, 38,746,097 bytes and exact committed modes.
Inventory SHA-256 is
`a02861722d5f9378af474885a8a8b123c95edfd33b3e0f4f94ddb622e6190eb4`;
the private verification receipt hashes to
`c16a47986643a2ea5d4b77ac5ff7db8e17bd2388ff7487eca2d1803fa5d7ccd8`.
The installed configured-startup probe passed with 26 exposed tools and ten
offline catalog queries using a new private synthetic profile. It observed
normal EOF exit of its own child and sampled no descendants or non-stdio
sockets. It selected no live control root and ran no upstream implementation or
EasyEDA process. Continuous isolation and current-generation live admission
are not claimed. Its private receipt hashes to
`f87e01b956f2be4be9e8463983cace72c59c3c38b7927147e29b4e11dec8435a`.

## Fresh-session handoff

The current host still runs `0.3.0+codex.20261023195500`. Stop live calls here;
load the installed `213000` snapshot in a fresh Codex session and admit the
actual process before the new disposable primitive-reader case. The completed
layer and shortcut cases are terminal and must not be replayed. No EasyEDA
Save, restore, design edit or excluded production-project access occurred in
this batch.

The six remaining-work items above remain open. The next implementation batch
should group related readers and lifecycle work before another release. An
empty fixture result must not be presented as populated Line, Arc, Via or text
coverage. Source/offline tests and installation do not establish that live
coverage or authorize production writers.

This terminal appendix is retained locally for the next grouped documentation
commit and published as a comment on PR 108. It changes no installed payload
and does not require another plugin version.

The initial appendix privacy check rejected a private project name before
publication. That name was removed, without changing the privacy rule. The
failed check remains in private evidence; the corrected appendix was rechecked.
