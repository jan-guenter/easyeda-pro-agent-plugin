# Startup helper correction and private capture integration

This batch starts from main `cd2ab88c39aff06ac2921ade99eebfcbf1659d51`.
It combines the correction identified by the
[161458 disposable startup](2026-10-24-161458-connected-worker-startup.md)
with two implementation steps toward a complete PCB baseline. The production
project was not accessed. The connected case is terminal and must not be replayed.

## Changes and review

The startup transport now models seven phases: generated bootstrap, preload,
four anonymous helper copies and project-worker import. Every phase requires
the exact source before normal resume. The four helpers also require the
original preload creator and their distinct ordered call sites. This fixes a
source-derived mismatch in the earlier three-phase implementation; the original
failed event did not retain enough metadata to identify its source retrospectively.
Bounded failed-script metadata now preserves that distinction without returning
raw source or private URLs. A preload log after failure cannot become a new
successful initialization observation.

The [baseline continuation](2026-10-24-generation209-baseline-continuation.md)
retains the actual PCB session, dependency and completed SQL reader returned by
the original preparation callback. It accepts no replacement inventory from a
caller. Root review rejected a proposed source-file/checkpoint-hash equivalence;
the final implementation uses the original reader object instead.

The [ratline creation stage](2026-10-24-generation209-ratline-creation-boundary.md)
captures the original Worker constructor arguments, before/after pauses,
Worker receiver and correlated waiting child. Root review found synchronous
resume and unresolved-breakpoint cleanup races. The corrected implementation
records each consumed promise before dispatch and keeps execution paused while
an allocation or removal remains unresolved.

Independent reviews covered the startup source and phase ordering, baseline
ownership and ratline cleanup corrections. These source reviews do not establish
connected execution of the new code.

## Scope and remaining work

The existing native startup limit remains256 commands, with normal work through
224 and cleanup capacity reserved. The revised startup bound is186. The
private PCB continuation would bring that source sum to251, so it cannot be
activated under the current normal-work reservation. The private baseline
continuation needs a separately derived larger native purpose, including byte,
event, polling and cleanup bounds. Counters cannot be reset or owners upgraded.

Remaining work includes successful connected constructor capture; original
PCB and nested ratline source capture and target association; native integration
of the common/raw-root baseline; complete populated source and producer checks;
actor/native/server clocks; contained writers with consumed Save, full SQL and
saved/reopened verification; and the remaining schematic, library, routing and
manufacturing-export API families. Concrete unsupported domains stay documented
in the coverage inventory and task references.

The private additions enable no public writer, Save or recovery route. The
startup source correction still requires a new installed snapshot and fresh
actual-host admission before connected use.

## Frozen local payload and checks

Candidate `0.3.0+codex.20261024171142` contains668 production source files.
Source projection SHA-256:
`ec881d82bf8455a426e795f5d804dcab785056dc1aed9922804ab9dc653cabc9`.
Three-bundle projection SHA-256:
`65810b3119724b8d7d0f498fceaf9ac215d8f161f9b694c44f21da155b2f3f96`.
Only facade source/bundle projections and review time changed in compatibility;
external application, upstream, bridge and native-helper pins remain unchanged.

The final focused selections passed20 startup/source/lifecycle cases, six
ratline cases and five baseline-continuation cases. The existing lifecycle
fixture was expanded from three to seven phases; each phase is covered by
source refusal, owner loss and consumed-resume checks. Tests distinguish real
V8 events in inert Node programs from synthetic application owners and target
inventories. They do not establish connected success for this candidate.

Required local dependency installation/tree/signature/security checks,
TypeScript, bridge types/lint, strict type-aware lint, exhaustive coverage,
generated-protocol/build, compatibility, repository/package and all-skill
validation passed. Strict lint reported zero warnings. All seven official skill
metadata checks and the available official plugin validator passed.

Both runtime bundles reproduced byte for byte. Their generated0600 modes were
normalized to the committed0644 modes before publication, without changing
bytes. Complete facade/bridge and Windows native suites will run against the
exact final GitHub commit. Publication and installation remain separate from
these local results.

## Initial CI result: publication held

Candidate commit `99d29dae795aa66e1573c51788945580d9542457` was pushed in
[PR117](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/117).
The build/bridge check, Windows recovery job and seven facade shards passed.
Bridge tests reported424 passes. Facade shard4 was cancelled at its30minute
job limit, so the aggregate check failed and this candidate was not published
or installed. The failed run is
[CI40115355941](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/40115355941).

The shard's final test result was the last opening-schema case at17:25:02UTC;
the log then remained silent until cancellation at17:46:34UTC. Its next selected
file was `current-pcb-209-ratline-capture.test.ts`, an inert V8 test. This is a
hang investigation, not evidence that the overall suite needs a larger timeout.
Raw logs and the original failure are retained privately. No workflow rerun,
merge, installation or further EasyEDA action had occurred at this observation.

## CI fixture correction

The eight original capture cases passed locally in10.1seconds. The exact await
that stalled in CI remains unidentified. Review found unbounded waits for the
fixture's inspector address, socket opening, command replies and child exit,
with no rejection of pending requests on child or socket loss. These files
were unchanged from the preceding main commit.

The test helper now bounds those waits, rejects pending work on transport loss,
and observes closure of its own synthetic Node child. One added regression uses
a child that exits before advertising an inspector and requires prompt rejection;
the old helper would wait indefinitely. Original capture assertions and production
timeouts remain unchanged. This correction changes test infrastructure and this
record only; the frozen production source, runtime bundles and compatibility
projections above remain unchanged. Final checks and replacement CI are pending.

Final focused verification passed nine cases in10.13seconds; full TypeScript
checking and targeted strict type-aware lint passed. The initial correction's
test run exposed that the WebSocket callback supplies null on success. That
failure was retained, the callback check was corrected, and the final nine-case
run passed. Root and independent review accepted the bounded fixture cleanup.
The preceding CI cancellation remains a failure; new exact-commit CI is required.
