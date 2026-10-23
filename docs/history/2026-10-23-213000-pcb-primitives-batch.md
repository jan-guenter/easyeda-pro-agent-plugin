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
