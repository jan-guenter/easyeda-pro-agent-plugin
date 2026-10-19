# Schematic pages, board metadata and lifecycle follow-through

Published and installed the combined update `0.3.0+codex.20261019163322`,
2026-10-19, through
[PR80](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/80).
The actual143713 host completed a new disposable schematic-title lifecycle before
this upgrade. The delivery chat still holds143713; a fresh session must admit
163322 before further live work. Installation alone is not connected support.

## Combined163322 update

Frozen delivered payload: `0.3.0+codex.20261019163322`. Source506 SHA-256
`c8842080d16347a7b80c912bc44e9e75d478e92767cbc2219c515212a34c9452`;
runtime3 SHA-256
`5f90f560a61ae05d28d45efb720dc40c19e62de75867bc793cf8547bb30cda65`.
Build and compatibility checks passed, with external pins unchanged. Full local
verification and exact-head protected CI passed. The official named Git
marketplace upgrade, exact installed comparison and configured offline startup
verification passed.

- Explicit SCH `advance-batch` accepts two to four adjacent, fully acknowledged
  existing phases. The complete request validates before effects and the
  coordinator remains locked between steps. Pending observations and failures
  stop the batch without polling, retries or automatic cleanup. The separate
  original-launch termination boundary cannot be crossed. This allows a
  write/normal-close pair without another agent roundtrip. Nineteen focused
  tests, strict lint/types, skill validation and independent review passed.
- Private PCB diagnostic-pipe transport implements only two fixed browser
  discovery reads, bounded framing, correlation and retained stream ownership.
  Independent review caught numeric overflow becoming non-finite JSON values;
  the fix and regression are included. Seventeen focused tests, strict
  lint/types and review passed. There is no runtime import or diagnostic launch
  yet; native ownership and frame/worker integration remain backlog. See the
  [transport audit](current-pcb-text-lifecycle-observers-2026-10-19.md).
- Three runtime/source hashers use fixed 1 MiB buffers instead of the default
  64 KiB, preserving every fresh byte, size, descriptor/path identity and
  admission check. The initial stream implementation's six-pass alternating
  read-only pinned-Node benchmark
  matched the same 123,655,872 bytes and SHA on every pass: median wall time
  161.816 to 73.908 ms, median CPU 205.471 to 112.280 ms. Sixty-five existing
  focused tests, strict lint and independent review passed. This is an isolated
  hash-throughput result, not measured live lifecycle savings. Repeated assertions
  exposed retained stream listeners, so the descriptor hasher now uses
  bounded positional reads; the earlier benchmark does not measure that new
  implementation.
- Historical admission retains one private current-Node owner per scan instead
  of repeatedly acquiring it for each closed-journal observer. Each observer
  still freshly checks executable bytes, identity, version and core limits
  before and after reading evidence; the scan checks again before returning.
  Copied, cross-scan, closed and poisoned leases refuse. Observed runtime drift
  aborts the scan without fallback, and failed descriptor cleanup defeats
  success. SQL child execution, journal/sidecar checks and cache keys are
  unchanged. The positional hash loop avoids retained stream listeners and
  preserves the descriptor cursor. Root and independent review accepted the
  change; 49 runtime/lease, 73 scanner, 10 selected cache and three actual
  closure tests passed, with full types and strict lint clean. These checks
  do not measure live latency or establish new CAD authority.

Read-only observation of the admitted host during this continuation reported
675,002,076,343 cumulative `rchar` bytes but 7,191,063,432 physical `read_bytes`,
with 39:59 CPU time over 31:32 elapsed. These are whole-process counters, not a
phase profile or proof that every byte came from one validator. Source tracing
found repeated current-Node acquisition inside historical admission; a
scan-owned reuse change is now reviewed, with no skipped historical journals or
cached quarantine result.

The installed143713 snapshot remained unchanged throughout the original live
case. That lifecycle is terminal and EasyEDA is closed. The combined163322
source update is now delivered; its batching/runtime/transport changes do not
inherit the earlier single-phase live evidence.

## Combined163322 delivery

Final payload `86b34605c9de418cd6e55bdca900e27a7ea8dba1` passed
[Linux CI](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/39287066949)
and [Windows recovery](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/39287066532).
The eight Linux shards report 11,611 passes, five skips and zero failures;
424 bridge tests passed and both lint checks have zero warnings/errors.
The complete local verification finished successfully with 11,612 facade
passes, four skips and zero failures, plus all 424 bridge tests. Dependency
signatures/attestations, vulnerability checks, repository/privacy checks and all
seven skill validators passed. The official standalone plugin validator was
unavailable; maintained repository/package/contract checks remained mandatory.

PR80 merged normally as `a4c4576dca6518dece8ab7ec7d60f623c19cd65a`, with the
complete tree identical to the tested payload. Post-merge
[Linux CI](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/39289237232)
is still running; its build passed. Post-merge
[Windows recovery](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/39289237330)
passed. Exact-payload PR evidence and post-merge evidence are distinct.

The official CLI upgraded only the existing `easyeda-pro-agent` Git marketplace
from `https://github.com/jan-guenter/easyeda-pro-agent-plugin.git`, with no errors.
It lists163322 installed/enabled; the marketplace checkout is the merged main.
The maintained verifier from a fresh exact-main worktree compared all 1,536
packaged files, 31,401,025 bytes and 42 directories, including exact modes.
Inventory SHA-256:
`d3b72af6b28a4b440e796664048cf2f17f5a26db20470ccf6b458a953fe8f526`.
No installed cache was patched or host terminated.

A single fully reviewed configured-startup probe passed all 49 offline
discovery/validation requests, including eleven checks of the new batch schema.
It exposed 23 restricted tools from the 48-tool configuration. Ambient Node26
handed off to pinned Node24 without source dependencies. The retained original
child exited cleanly on cooperative EOF, without signals or leftover handles;
stderr was empty. Three complete installed inventories matched. No upstream
execution marker, descendant or non-stdio socket was observed at either sampled
checkpoint; this is not continuous network isolation or a live CAD test.
Private proof remains in
`/root/.cache/easyeda-combined-batch-offline-probe-jmMfmUNb`; it is consumed and
must never be rerun. Proof SHA-256:
`c45a7d4733266b5667e4c3ebd0a075bb27dc2cd25239179ca02b2d8ea4eb8281`.

The current chat still holds the old143713 facade. A single fresh Codex session
is required to load and admit163322 before new live work. The old facade was not
hot-reloaded, rebound or terminated. EasyEDA remains closed; the completed
disposable title case must not be replayed. The updated control/extension skill
guidance distinguishes that historical success from the new batch action and
unfinished PCB transport, and specifies the corresponding continuation limits.

## Batched implementation

The user requested more useful changes between session restarts. This batch
extends existing project metadata coverage rather than publishing a separate
release for each reader or an inert PCB-writer prerequisite.

- The schematic metadata tool now has selected-page and whole-project page
  collection methods. Selected pages bind both their UUID and expected parent;
  both complete container and page maps are checked before filtering. Existing
  container result contracts remain unchanged. See the
  [schematic metadata report](current-project-schematic-metadata-2026-10-19.md).
- A separate board metadata tool resolves board IDs returned by project
  metadata without opening editors. Its selected and inventory methods return
  the native UUID, raw title, order and ticket subset, not public board-item
  objects or a schematic/PCB hierarchy. The complete board map is checked
  before selected filtering. See the
  [board metadata report](current-project-board-metadata-2026-10-19.md).
- Discovery, argument validation, tool policies, per-method coverage and
  task-specific skill guidance are updated together. New metadata routes
  require the exact pinned implementation and authenticated original reader
  lease. They grant no navigation, writer or saved-state authority.
- The schematic clock stage now captures immutable expected binding text once,
  instead of comparing two serializations of the same potentially mutable
  binding object. Two regressions cover drift before dispatch and after the
  retained return. All fresh authority, file, clock and admission checks remain.
  This removes a redundant serialization but is not a measured latency fix.
- Schematic operation inspection now identifies the active phase, whether it
  is performing work or selecting cleanup, elapsed monotonic time, and the
  last attempt's outcome/duration. Only one current and one last diagnostic
  are retained. A reserved `nextPhase:"stopped"` while busy is not a terminal
  failure. Diagnostics never grant clock authority, cancellation or retries.
- Reader runtime tests now remove their own synthetic bundle directories after
  each test, including failed setup. Worker logs and pre-existing evidence are
  retained; no shared temporary directory or application data is removed.
- Schematic rename keeps two distinct actor projections: the original current
  UI actor, checked unchanged at native dispatch and saved reopening, and the
  historical project-user names selected for the same UUID by the backend.
  A missing historical row has the native empty-name fallback. Exact stored
  header/modifier and complete SQL comparisons remain mandatory; no account or
  historical user-table row is created or changed to satisfy the check.
- The [PCB lifecycle observer audit](current-pcb-text-lifecycle-observers-2026-10-19.md)
  now covers the remaining renderer exports and desktop preload/main boundary.
  A complete pre-create observer needs a separately reviewed original-process,
  frame and worker diagnostic transport. No debugger was activated and no
  writer guard was removed.
- The engineering handoff now keeps current state and rules in a short
  `AGENTS.md`. Its former historical section is preserved byte-for-byte in a
  linked archive, with a recorded digest. No recovery record was deleted.

## Installed schematic lifecycle

The actual125900 host and complete installed payload were independently
admitted. Its new disposable case passed ordinary opening, original normal
closure, root/Job termination, the complete closed baseline and its scratch
history-clock reference. The original launch also recorded termination before
replacement launch. The raw disposable file remained byte-identical at that
baseline. No production design was accessed.

Replacement launch, fresh admission, inactive-cache exclusion, project-only
opening and startup/history-clock checks passed. Rename preparation then stopped
before mutation on a historical SQL actor-string versus UI actor comparison.
The disposable baseline had no user-table row for the observed UUID, so the
native backend selects empty author names while the UI retains its current names.
Normal closure, original root/Job termination and complete closed SQL equality
passed; the consumed case is retired unchanged. No rename or explicit Save ran.
Connected rename validation remains pending. The actor-model diagnosis is being
included in this batch; the consumed case must not be replayed.

Independent terminal review verified all 29 artifact hashes and the retired
journal with no orphan or hard-stop state. Both complete raw closed copies and
the disposable source remained byte-identical; both checkpoints also matched.
The complete logical/native inventory covered 20 documents, 55 rows and 59
history chunks. This is an unchanged failed case, not a successful rename.

## Installed143713 result

The corrected actor model passed a new complete disposable schematic-title
lifecycle. The original write was acknowledged once, normal closure proved
root/Job exit, and the complete SQL comparison found exactly the intended
title/history/structure delta. A fresh admitted generation excluded upload
caches, reopened without editor tabs and matched saved container/all-peer
metadata, the complete child roster and both AST memberships/order. Final
normal closure and complete unchanged SQL passed. The coordinator returned
`nextPhase:"completed"` and `renameVerified:true`; no explicit Save was sent.
The title remains in the disposable fixture. No production design was accessed.

All four new page/board metadata routes also passed in the no-editor generation,
including a selected page with its expected parent and a populated selected
board. Version-specific hashes and limits are recorded in the
[validation ledger](api-connected-validation-ledger.md#generation-g20261019-143713-disposable-schematic-title-lifecycle).
This does not validate full canvases, connectivity, later generations, or the
new source-only batching/lease/transport changes.

## Historical143713 release verification

The frozen source projection contains 504 files; runtime projection contains
three files. External EasyEDA, bridge, dispatcher and upstream compatibility
pins are unchanged. The catalog has 48 configured tools, 23 available in
restricted mode, seven skills and 356 guarded routes. The 774 distinct SDK
methods retain 212 public-subset, 33 native-equivalent, 79 blocked and 450
omitted classifications; the four added current routes supplement already
covered methods. These are inventory counts, not connected-validation counts.

Focused page/board, lifecycle diagnostics, immutable-reference and actor tests
passed, with strict type-aware lint and types clean. The initial full local suite
found two startup-test failures from stale catalog assertions. The test-only
correction updates board-tool sorting, the 48-tool total and four schematic
methods; all five startup tests and strict lint then pass. Three SDK-test failures
shared the old counts; the catalog audit also found two doctor assertions.
Five literal expectations in those two files were corrected, and all 12 focused
tests passed. The 424 bridge tests, package/repository/privacy checks and all
seven skill validators passed. The initial full run finished with 11,566 passes,
seven stale-catalog assertion failures and four skips; all seven failures are
covered by the 17 passing corrected focused tests. Final CI runs the complete
corrected suite. Runtime sources,
bundles and compatibility pins are unchanged. The original failed run is retained;
the final exact-payload CI and installation results follow. No failed local run
is presented as a clean full-suite result.

## Historical143713 delivery

Final payload `57fa2449236ea632910906830d0533d0fdb8a204` passed
[Linux CI](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/39274287628)
and [Windows recovery](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/39274287643).
The eight Linux shards report 11,572 passes, five skips and zero failures;
424 bridge tests passed and both lint checks report zero warnings/errors.
Official Codex validators were unavailable on the hosted runner; mandatory
repository validation passed. Local validation also covered all seven skills.

Protected PR79 merged as `f1fc00d1047045a514da9f464049efa59639bcd1`, with the
complete tree identical to the tested payload. The post-merge
[Linux run](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/39277119967)
reported completed/success on continuation; all build/shard jobs and final gate
steps passed. Post-merge
[Windows recovery](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/39277119974)
passed. Final PR evidence and post-merge evidence are distinct.

The official CLI upgraded the existing named Git marketplace without errors and
lists143713 installed/enabled. The marketplace checkout equals merged main.
The maintained exact-main comparison verified all 1,531 packaged files,
31,319,304 bytes and 42 directories, including exact modes. Inventory SHA-256:
`d5289f16d3272a0e3bd24e6744c3db146195febaf44a3131b7763ffdd5e318b6`.

A single reviewed configured-startup probe passed all 38 offline requests with
23 restricted tools and 48 configured tools. Ambient Node26 handed off to pinned
Node24 without source dependencies. The original child exited cleanly on EOF;
three full installed inventories matched before/after the probe. No upstream
execution marker, child process or non-stdio socket was observed at its two
sampled checkpoints. This does not prove continuous network isolation or live
EasyEDA validation. Private proof is retained under
`/root/.cache/easyeda-page-board-offline-probe-7e85NB2a`; it is consumed and must
never be rerun. No installed cache was patched and no live host was terminated.

## Remaining work

- Actor-model correction, four public page/board reads and the complete
  disposable schematic rename lifecycle passed on admitted143713.
- The163322 combined update is published, installed and offline-verified with
  exact-payload CI and byte/mode comparison complete. Admit the actual new
  process in one fresh session. Live batching and runtime
  performance remain unvalidated; the completed143713 case must not be replayed.
- All four new page/board routes passed on admitted143713: the complete two-page
  schematic map and populated one-board map matched their selected reads.
  These are metadata observations, not write or saved-state authority.
  Populated Image/Dimension cases remain separate validation work.
- Implement the complete PCB text pre-create observer/writer/persistence path.
  The audit identifies a transport boundary, not a claim that all future
  integrations are impossible.
- Polygon serializers still have side effects; broader current geometry and
  structure writers need bounded adapters and full persistence models.
- Broader library/3D, placement/routing/copper, rules/stackup, ECO/ERC/DRC and
  manufacturing/export families retain their per-method omissions and gates.
  Hidden annotation or Save All is not a read-only workaround.
- Bundled upstream bootstrap and independently admitted additional platforms
  remain packaging/compatibility backlog.

The generated coverage inventory is the exhaustive method-level record. Neither
an SDK declaration nor an implemented route proves a complete family works live.
