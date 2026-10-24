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

## Protected publication and official installation

[PR112](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/112)
merged reviewed head `cdb6fd9257ecf412ffd1aa4ff7da2da1596326f6` to main
`a9f44a98b80cd257f0ecfdcccb1aae978421ef4d` at2026-10-24T01:38:07Z.
All final-head [Linux CI40049509150](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/40049509150)
and [Windows CI40049509164](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/40049509164)
jobs passed, including the protected aggregate check and committed-bundle
reproducibility. Facade:12538 passed,5 expected platform skips,0 failures or
cancellations. Bridge:424 passed across28 files. The private independently
reviewed CI summary SHA-256 is
`a1f25839356a15ce3a42978b2c5afd3e116f186d2a7b3a3dd4a12d1b47688e38`.
No guard, test selection or branch protection was bypassed.

Merged main and the tested head have identical full tree
`39b96fbd5d77801ef7b6858ca1fa5b83bcbdfb57` and plugin subtree
`bf4ac540c1b0c4cab103eab66f5461ebce6c612c`. The automatic main follow-up
[Windows40050687870](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/40050687870)
has passed; [Linux40050687858](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/40050687858)
is still running at this terminal observation. Its later outcome must be read
separately; no second complete local suite was run to duplicate CI.

The official CLI, run from a neutral directory with installer umask022,
upgraded only Git marketplace
`https://github.com/jan-guenter/easyeda-pro-agent-plugin.git` and reported no
upgrade errors. Its final listing confirms011500 installed and enabled.
Cached marketplace HEAD equals merged main; its only untracked file is the
CLI-owned marketplace-install metadata. No cache file or active host was patched.
The CLI emitted its existing stale-arg0-directory permission warning; this did
not prevent the successful upgrade or exact verification.

The maintained installed verifier matched all1819 files/42 directories,
39160444bytes and modes against merged main. Inventory SHA-256:
`ab44104c7ad1e2e2a1236510d1eb8a941092893df8e8c13eb153caa2f925c14c`.
Private receipt SHA-256:
`a666f542972e2f793f7a00a56344b228a92aa2ec3e65450566a7362d92c1672f`.

The installed offline probe passed under pinned Node24.18.0 using only its own
synthetic profile/control root:26 tools,10 catalog queries,12 replies, no stderr,
normal EOF/exit0 and no sampled descendants or non-stdio sockets. This is the
probe's synthetic legacy selector, not the actual209 host's13-tool admission.
No live control root, CAD call or upstream process was selected, and continuous
isolation is not claimed. Probe receipt SHA-256:
`473c04d397efee85d26842d19128e23c1318bebe8df6c8def38c369cef2b3d8c`.

GitHub's push warning still listed old fast-uri3.1.8/body-parser2.3.0 alerts.
Both the fetched base main and released lockfile already contain patched
fast-uri3.1.9/body-parser2.4.0; the local audit is clean. No alert was dismissed.

## Fresh-session handoff

Publication and installation in remaining-work item1 are complete. Actual
011500 host admission and the new connected selection/relations case remain
pending. The current retained host is still000500; its original process start
identity remains unchanged. Do not invoke the new live stage through it,
hotpatch its files or terminate/rebind it. Start a fresh Codex session, inspect
its actual installed payload, then use a new disposable operation with the
maintained original-owner lifecycle. The completed000500 case is terminal and
must never be replayed. No CAD operation or journal recovery is pending.

Items2–6 above remain the implementation/validation backlog. A small optional
future CI improvement is to extract two repeatedly transformed test fixture
factories; a read-only audit found no duplicate test-entry imports to remove.
No timing improvement is claimed. Batch these follow-ups with useful capability
work, preserving current v1 historical decoders.

This terminal appendix is retained locally and published with the PR release
record. Include it in the next grouped source change; do not manufacture a new
plugin version or repeat a release solely to commit post-install receipts.
