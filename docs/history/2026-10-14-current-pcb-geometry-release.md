# Current PCB geometry release

Candidate `0.3.0+codex.20261014133000` adds three current-version native
equivalents for Line, Arc and Via `getAll`. This is another scoped backlog
release, not whole-SDK execution support. Final CI, publication and installation
receipts belong on the originating PR.

## Delivered implementation

`easyeda_control_pcb_geometry` returns bounded plain geometry data on an exact
active ordinary PCB. Offline `pcb-geometry` and `pcb-geometry-validate` expose
the strict request. Empty arguments only; no filters or caller code. Captured
frame/native receiver and surrounding target checks bind two matching ordered
observations. Output is limited to256rows and384KiB, without truncation.

Line fields include endpoints, layer and width. Arc adds angle and native mode.
Via includes position, hole/outer diameters, type, layer endpoints and mask
expansion values. All include identity, displayed net and lock state. Linear
fields use mil and Arc angle uses degrees. Native precision is retained rather
than applying the public wrapper's Arc and Via radius rounding.

These are loaded-view projections, not SDK class instances or complete source
records. They do not establish saved membership, parent ownership, connectivity
or persistence. Arc center/radius/sweep are omitted; full-circle cases can have
zero projected `arcAngle`. Via mask values reflect the loaded model, not a verified
stored custom override or freshly evaluated rule. Missing fields, signed zero,
unknown enum values, duplicate IDs and excess output refuse whole.

The adapter reuses the reviewed native family callbacks already used for
identity enumeration. No additional vendor getter, selection change, source
export, project/library service, navigation or Save is invoked. Runtime version
and file admission remain unchanged. The [research note](2026-10-14-current-pcb-geometry-research.md)
records exact installed handlers, serializers, units and official contracts.

The catalogs contain40legacy-compatible tools,15restricted tools and the
unchanged3offline fallback tools. Distinct method classifications remain
774total,212public subsets,29native equivalents,82blocked and451omitted.
Three added routes bring guarded availability to321, with94blocked and2partial.
Those counts are implementation inventory, not live-validation counts.

## Connected work on installed054500

Fresh installed054500 and its source/bundle identity were independently verified.
The supported local history tool qualified and published the C10 sixteen-event
pre-navigation abandonment. Independent retained-evidence inspection passed;
the original journal and permanent claim remain intact. No validation request,
navigation, edit or Save was replayed. This resolves only that historical blocker.

After supported supervision relinquishment of the old successful launch,
one new ordinary startup completed. The bridge authenticated with the expected
current application/API/PCB tuple and no implementation drift. The shell showed
only Start Page. Disposable opening passed preflight, then stopped without a
reliable project-open acknowledgment. The original attempt is quarantined;
neither opening nor explicit Save was retried. Normal application closure and
retained-owner retirement are pending. No current PCB reader was dispatched.
This source update's geometry methods have not been dispatched live. AGENTS.md
and the PR delivery receipt retain the final recovery and installation status.

## Verification and remaining work

Five focused geometry tests cover all three projections, cross-realm points,
unit conversion without wrapper rounding, malformed/drifting data, bounds and
no retries. Registration, coverage and catalog checks retain the shared live
gate and strict request. Existing types, zero-warning lint, reproducible build,
dependency/privacy checks, full suite and required GitHub CI remain release gates.
Final results are recorded in AGENTS.md and the PR delivery receipt.

Remaining implementation includes filtered and selected-ID geometry, complete
Arc representation, Component/Pad getter review, canonical active-layer identity,
and broader current-version readers. Blocked schematic/symbol/PCB writers still
need operation-owned native structure-job completion and full SQL-effect proof.
The broader [scoped backlog](2026-10-13-scoped-release.md) remains open. No bridge
extension or external compatibility pin changes. Production designs and their
records remain outside this work.
