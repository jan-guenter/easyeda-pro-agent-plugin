# Selection, component-pad and historical query batch

2026-10-24. Base main `3bae835424571051fa4aeeec8f6bcfc652f02c79`.
Target package `0.3.0+codex.20261024011500`. This record distinguishes the
completed installed000500 live case from the new implementation and pending
release. No production design was opened or edited.

## Completed preceding live case

The [installed000500 extended-reader case](2026-10-24-000500-connected-extended-pcb-readers.md)
completed once, with Component2, Pad4 and Attribute6 observations. Dimension
and Image were empty. Original normal close, retained process/Job termination
and helper release completed. The closed disposable file remained byte-exact.
No edit, Save, prompt choice or forced termination occurred. Never replay this
case. The earlier pending main CI40046123968 also finished successfully.

## Combined implementation

- `observe-selection-relations` captures all nine supported loaded-view families,
  ordered selected IDs and child-pad lists for up to16 explicitly requested
  Component IDs. It brackets each of two matching samples with selection and
  identity checks, retaining the original receiver around every await.
- Every selected ID resolves exactly once or the observation refuses. Child
  lists retain empty versus null, order and complete IDs. Their scalar fields
  must agree with global Pad rows. Child geometry is omitted because that
  handler uses different units and rounding. Reciprocal ownership, symbol-pin
  mapping, stored membership and connectivity remain unproved.
- The fixed native program, transport, owner, journal and public grammar share
  the same bounded request. Its intent is published before dispatch, and each
  stage remains consumed after ambiguous replies or publication failures.
  Original normal cleanup is retained.
- `query-observation` reads one published primitive-stage snapshot by exact
  result-record digest. It reconstructs the complete native packet with the
  original decoder, supplies the original target and Component intent, and
  rechecks the journal snapshot after querying. It supports exact IDs, typed
  equality filters, captured selection and observed component-pad groups.
  These repeatable historical reads need no native process and grant no
  present-state or writer authority. Fresh public `get` remains separate.
- The build verifies generated native-program parity. Coverage, tool metadata,
  README and task-specific skill references describe the same contract. The
  offline validation guide includes the complete `query.request` wrapper.

See [source research and pure implementation](2026-10-24-pcb209-selection-query-research.md)
for official references, installed-source commitments and detailed omissions.
The new native stage uses26–58 local RPCs inside one CDP call. All four reader
stages fit the unchanged103-request transport budget. Native and final decoded
packets remain bounded to393216bytes; each family/selection and aggregate child
references are limited to256. Enumeration precedes these limits and the
ten-second deadline does not cancel already dispatched vendor work.

## Review and corrections

Main and independent review covered the fixed reader, decoder, native transport,
retained method/receiver identity, intent/result linkage, cleanup, historical
reconstruction and mounted callback. The selection intent initially inherited
an8KiB limit that could reject valid escaped IDs. Its dedicated32KiB bound now
covers16 IDs of256 UTF-16 units without enlarging other intent contracts.
The independently reconstructed maximum native request was62004bytes against
the65536-byte ceiling; no transport limit was raised.

The first root focused lifecycle run failed because new test IDs omitted the
fixture's required `-test-` segment. The first assertion left its synthetic
launch exclusion retained, causing subsequent busy failures. The private log
is preserved; the run is a failure, not a product validation. Test IDs were
corrected without relaxing the fixture or runtime gates.

The first integrated frozen run reported231 passes/51 failures. A new test
expected the wrong error name for method substitution; the existing guard
correctly returned `OWNER_PURPOSE_CHANGED`. Its failed assertion retained the
synthetic launch exclusion and caused downstream busy failures. A separate
capability test still expected layer-only scope. Both test expectations were
corrected, preserving guards. Strict lint also required capitalizing a comment
continuation; that source-only formatting correction changed no execution.
The failed logs remain retained and final affected checks must pass separately.
The subsequent affected run exposed another test mistake: it assumed window
inspection would publish a retained result. The test now explicitly calls
`settle-records`, matching the existing lifecycle contract, before checking
the published result. No runtime automatic-settlement behavior was added.
The corrected lifecycle run passed93/94 tests and exposed an unintended
change to legacy inspection responses: the new query provenance fields were
being emitted for every stage. They are now restricted to the three queryable
209 stages. The legacy exact-response assertion remains unchanged.

The Windows `CompileOnly -Layers209` check passed on the final native helper:
compiled and pipes checked, empty Job, no process launched. Helper967711bytes,
SHA-256 `7068a383a7d0ad5a0e3e930cfc134240dac322efb8739943e9c3096656950bed`.
The fixed23381-byte function SHA-256 is
`6a0ab1809fb746a478be73cad8d5e1cd75f23e343ad760963ba609dcd50f6aa1`.
Pure reader/query tests passed14 cases before integration. Separate native
protocol and owner/pipe checks passed. These remain offline evidence.

## Verification and publication

Required Node24.18.0/npm11.16.0/core0 installation and dependency checks passed:
151 verified registry signatures,42 attestations and no moderate-or-higher
vulnerabilities. Final source/bundle checks, focused integration regressions,
exact-commit GitHub suites, protected publication and official installation
are pending at this draft. The full suites will use final-commit CI, avoiding
a duplicate local run as permitted by repository requirements.

## Remaining work

1. Complete this batch's final checks, protected publication and official
   marketplace installation. Admit the newly loaded process in a fresh session.
2. Validate the new selection/relations stage once on the disposable fixture,
   including populated child lists where available. Keep empty-only selection
   or family coverage explicit. Historical queries require a separately
   accepted published snapshot and do not replay the live read.
3. Finish fresh filtered/exact-ID lookup where useful, remaining Pad layer/shape
   encodings, full Image assets/geometry and rendered text/Dimension reads.
   Populated Arc/String/Dimension/Image and precision-edge validation remain
   outside the small completed fixture cases.
4. Finish pre-open ratline/worker capture, receiver/publication ownership,
   complete common live/source/SQL baselines and actor-clock ownership.
5. Implement contained writers and disposable create, consumed Save, close/reopen,
   full peer/SQL checks and operation-specific recovery before claiming those
   editing lifecycles.
6. Extend schematic/PCB editing, connectivity/rules/routing, component pin-to-pad
   mappings, manufacturing exports and catalog geometry/assets. Linked-asset
   ownership and bounded encrypted/compressed assets remain unfinished.
   Hidden annotation/SaveAll paths and installed native stubs remain omissions.

Batch further implementation before another installation. Never transfer older
generation validation to this package or reconstruct ownership from a journal.

## Final source freeze

The final source projection contains638 files, SHA-256
`a30c9cd0514f07f12b1b0d27e32baba5c9d0e4810239708f0e2ebfe91e8219cd`.
The three-bundle projection is
`19dcd70eebd0d15caea257f822c59f80bdeba71f340de2cf3a412a90c77da406`.
Only facade source/bundle projections and review time changed in compatibility
metadata; a deep comparison confirms every external pin is unchanged.
The coverage inventory retains835 distinct methods and506 explicit omissions,
with387 runtime-guarded routes. Historical queries add no fresh SDK route count.

Final local types, strict type-aware lint with zero warnings, bridge types/lint,
coverage generation, sanitizer/native generators, build, compatibility, all-skill,
plugin/MCP and repository/privacy checks passed. All seven installed
skill-creator validators and the available official plugin validator passed.
The final unchanged lifecycle test result and exact-payload CI follow below.

A private next-batch source review identified special Pad style groups as the
next useful reader extension. Preserve the current v1 decoders for historical
queries. Native NGON/rendering inconsistencies, inner-only-layer handler gaps
and image asset ownership/grammar remain concrete omissions, not supported
geometry. That investigation made no repository, project or live changes.

The final complete lifecycle file passed94/94 tests with no failures or skips.
The other focused reader/query/native/protocol/coverage/registration checks
passed in the retained combined run; corrected facade metadata checks passed
in the affected run. Earlier failed attempts remain described above. The
complete final facade and bridge suites remain delegated to exact-commit CI.
