# Schematic pages, board metadata and lifecycle follow-through

Candidate `0.3.0+codex.20261019143713`, 2026-10-19. The installed live host remains125900;
source changes below are not installed or connected-validation claims yet.
Release and installation evidence will be recorded in `AGENTS.md`.

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

## Release verification

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
methods; all five startup tests and strict lint then pass. Runtime sources,
bundles and compatibility pins are unchanged. The original failed run is retained;
final exact-payload protected CI and official installation remain pending at this
checkpoint. No failed run is presented as a clean full-suite result.

## Remaining work

- Actor-model correction, reader review and focused checks are complete;
  connected rename success still needs a fresh admitted installed generation.
- The complete runtime batch is frozen. Finish release checks and protected CI,
  publish once and install through
  the existing Git marketplace. Verify exact installed bytes and modes.
- Validate the new page/board routes on the next admitted installed generation.
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
