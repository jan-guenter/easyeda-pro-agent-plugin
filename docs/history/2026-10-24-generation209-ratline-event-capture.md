# Generation209 ratline original-event capture

Source-only continuation on2026-10-24 from main `e49f765`. This implements
private capture runners for the imported PCB and startup-ratline realms.
It changes no public tool, native launch purpose, compatibility pin or bundle.
No EasyEDA call, project-file access or CAD action was performed by this work.

## Implemented sequence

The fixed [capture profile](../../plugins/easyeda-pro-control/server/src/current-pcb-209-ratline-capture-profile.ts)
adds13 exact pause coordinates to the complete source and twelve span checks
from [the earlier source audit](2026-10-23-generation209-ratline-capture.md).
Both installed assets still match their complete SHA-256 and byte lengths.
Inert Node compilation separately confirms that these coordinates are executable
breakpoint locations. Actual EasyEDA must still accept each exact location;
relocation refuses.

The [private runners](../../plugins/easyeda-pro-control/server/src/current-pcb-209-ratline-capture-runner.ts)
accept an original transport dependency, never an MCP request or supplied
milestone report. Separate fixed classes select the PCB and worker profiles;
the internal constructor cannot accept a caller's profile. Every active request
checks the original methods, process/context/source reproof dependency, and
captured script identity. Breakpoint events must match the expected sequence,
original breakpoint ID, script, function and exact coordinate.

The PCB sequence retains five actual pauses:

1. The `Let` constructor's bridge, worker and bus, with its `Ew.addWorker` caller.
2. The factory return position, binding that same Worker and bridge to its
   manager's sole registry entry and completed allocation counter.
3. The `ratlineResultFromWorker` subscription's exact empty-result JSON bytes.
4. The `kRt` entry's actual result object, matching those bytes and worker ID.
5. The `kRt` return position, preserving the result and verifying removal of
   the captured manager's worker and bridge entries.

The startup-worker sequence retains nine actual pauses:

1. Its own `EY` bridge over `self`.
2. The `workerName` callback's value and completed assignment to that same self.
3. The startup service's original world object and selected document/project.
4. The completed `getCanvas` call's local bus, request and successful reply,
   with the requested document matched to that world.
5. The subordinate's separate `EY` bridge and its `Db.addWorker` caller.
6. The subordinate factory's original manager/Worker/bridge registry relation.
7. The loop boundary after environment initialization, requiring empty work and
   results while retaining the same subordinate manager, bridge and local ID.
8. The actual result-publication point, matching the original self bridge,
   exact empty-result bytes and removal of the subordinate's registry entries.
9. The async callback's return position and retained removed-registry state.

Worker IDs remain registry-local. A parent and subordinate may both use0.
The runtime [relation programs](../../plugins/easyeda-pro-control/server/src/current-pcb-209-ratline-capture-program.ts)
use fixed descriptor/Map reads; they invoke no application callback. Nonempty
ratline work, foreign registry entries, changed aliases or changed result bytes
refuse. V8 can discard locals at return positions. Those checks use previously
captured object handles, never inferred replacements or unavailable locals.

## Ownership, cleanup and limits

Successful packets belong to their original in-memory runner. A copied packet
cannot recover its retained objects. Source qualification reports and supplied
JSON do not create an owner. On failure the runner removes original breakpoint
IDs and resumes the original pause once. A late breakpoint acknowledgment is
retained for removal; uncertain instrumentation remains visible in status.
Listeners survive failed capture and are released only after the dependency
proves original process/Job termination. No detach, force exit or retry of an
ambiguous resume is added.

A return-position pause is observed before the function actually returns.
Accordingly callbackReturnCompletionVerified stays false. The worker's result
publication can have returned while native message delivery is still queued.
The PCB handler can reach its return while async copper work remains pending.
No continuous publisher exclusion, native channel peer ownership, complete
baseline, writer eligibility or Save authority follows from these observations.

The runner permits at most112 normal commands within a128-command total,
reserving cleanup capacity. Its fixed successful sequences currently issue26
PCB and65 worker commands. These counts exclude native requests performed by
original-owner reproof callbacks. A future combined owner must derive its full
budget including those reproofs, source transfers, nested worker capture,
common graph streams and cleanup. This cannot be added to the existing
256-command startup purpose by resetting its counter.

## Required native integration

The transport contract begins with an already-paused, source-qualified imported
realm. It does not implement target attachment or the bootstrap-to-import chain.
The factory creates `editor?entry=pcb-ratline-worker.js`, not the imported
`pro-pcb/3.2.195.6b67774e/js/ratlineworker.js` asset URL. PCB startup carries its
current query and adds logging; its subordinate uses the entry URL without
that query or logging suffix. Target identity and complete imported-script
identity must therefore be qualified separately.

Before PCB opening, the combined original owner must retain recursive
pre-execution attachment for the PCB child, startup worker and subordinate.
Capture must be armed before each relevant imported script runs. Its native
helper must accept only these fixed coordinates, object group, expressions and
relation programs. Existing diagnostic/worker-startup owners cannot adopt the
new vocabulary or a completed historical packet.

The captured native Worker object is still not associated with an independently
identified CDP target. Names, target URLs and event proximity do not establish
that association. The canvas call's actual receiver is retained, but the remote
subscribed project-channel peer remains unproved. A separate original binding
must join PCB, startup-worker and subordinate roles, exact publication/delivery
and completion. These flags remain false in every packet. Original subordinate
service execution, async copper completion, destination exclusions and the
complete live/source/SQL baseline remain unfinished.

## Focused verification

Six focused checks pass using Node24.18.0 with the isolated test preload.
Both role sequences use actual V8 debugger pause/resume events in disposable
Node children, exact inert vendor excerpts and synthetic application/native
collaborators. They verify retained object identity, copied-packet refusal,
consumed capture, cleanup after owner loss and termination-only listener release.
The synthetic source deliberately fails complete installed-source qualification.
These tests exercise imported-source capture only, not native bootstrap or
EasyEDA process ownership. Both complete inert installed assets separately pass
all thirteen new coordinate-context checks and the earlier twelve source spans.
Strict type-aware lint and server typechecking pass. No live validation, build,
compatibility refresh, publication or installation is claimed here.

### Final adversarial review

Review found an extra-pause race during the final awaited owner reproof. The
runner now marks the expected sequence exhausted before the last resume,
refuses any later pause immediately, and requires that same final pause and
resume before issuing its packet. `whenArmed()` also reproves the original owner
after its barrier, so a previously resolved barrier cannot outlive ownership.
Two real-V8 hostile event cases cover the final-reproof race for both roles.
All eight focused checks pass and targeted strict lint remains clean. These
additions preserve the native integration and completion limits above.
