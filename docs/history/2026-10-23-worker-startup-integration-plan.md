# Worker-startup integration plan, 2026-10-23

This is a design and backlog record, not an implementation or connected-validation
claim. It reviews the pending 2026-10-23 batch on base commit
`67a3329503a2f05990b4f1591171ebdcaa0aa83b`. The batch provides separate startup,
construction-assignment and native-protocol pieces; their presence does not make
the original native-owner workflow available. No design was opened for this review.

## Smallest next combined change

Wire one private worker-startup owner and lifecycle to the retained native helper,
then compose its channel with the startup transport and constructor runner. Do not
add a public writer, general debugger interface or caller-selected source profile.
Keep ordinary diagnostics and String precreate on their existing fixed purposes.

The existing [owner](../../plugins/easyeda-pro-control/server/src/current-pcb-diagnostic-owner.ts)
already retains the helper process, original application process, non-breakaway
Job and anonymous pipes. Extend that ownership model with a genuinely third factory
that launches `-WorkerStartup`; do not upgrade an existing diagnostic/String owner,
adopt a process by PID, or reconstruct authority from serialized observations.

## Lifecycle and durable purpose

- Add an exact worker-startup launch-intent schema and reserved operation prefix to
  the [journal](../../plugins/easyeda-pro-control/server/src/current-pcb-diagnostic-lifecycle-journal.ts).
  Reserve the shared launch exclusion and publish durable intent before allocating
  the helper. Preserve allocation-attempt, no-process and unresolved-operation checks.
- Replace the [lifecycle](../../plugins/easyeda-pro-control/server/src/current-pcb-diagnostic-lifecycle.ts)
  two-way String/non-String test with exact three-way purpose matching. Otherwise a
  new non-String schema can be mistaken for ordinary diagnostics. Reject the new
  prefix and records through both older purposes, including inspection and cleanup.
- Bind normal close, observed root/whole-Job termination and release records to the
  original intent and retained owner. A close request, timeout or copied receipt is
  not termination. A failed startup retains ownership and quarantine until resolved.

## Native channel handoff

Qualify the original parent target/session and complete pinned UI source before
handoff. Require no project-open, model or worker-discovery attempt, no pending
legacy request and a clean framing boundary. The owner must retain one immutable
parent object, not accept equivalent caller-supplied target/session fields.

The channel uses four private native capabilities:

1. `requireOriginalParent()` returns that same original object, containing the
   target, session and next shared request ID, after checking retained ownership.
2. A serialized exchange accepts the fixed startup-wire request grammar or a poll;
   it cannot carry arbitrary CDP methods or JavaScript. The channel distinguishes
   the native write acknowledgment from the eventual CDP reply.
3. `assertOriginalTermination()` proves original root and whole-Job termination
   before event listeners and local pipe ownership can be released.
4. `observeOriginalParentEvent()` passes non-attachment parent events to the
   retained context observer. Its refusal must stop ordinary startup work.

Handoff is irreversible. Route all subsequent poll bytes to the startup channel;
block legacy transfers permanently. Keep old listeners dormant until their normal
closed-stream cleanup rather than releasing them on live pipes. Seed IDs from the
legacy pipe's next request ID, retaining the native helper's single monotonic
counter, request ceiling and overall byte budget. Never reset IDs or allow two poll
owners. Check original binding after awaits. A bounded poll pump must receive
unsolicited pause events between replies, and late allocation replies must remain
available for cleanup after a semantic deadline.

## Before-open choreography: unresolved integration work

The construction capture must be armed before the worker's first bootstrap. Opening
a project first and then attaching cannot establish original constructor capture.
The current worker-startup native discovery allowlist does not admit the legacy
project-open program, so a factory alone cannot complete this sequence.

Add a narrow, reviewed disposable-project opener with its own intended-effect and
checkpoint binding. Arm startup auto-attach first, invoke that opener once, retain
the original parent through the expected navigation, and then admit only the
expected waiting worker. Do not route the opener through a reactivated legacy pipe.

The [startup transport](../../plugins/easyeda-pro-control/server/src/current-pcb-worker-startup-transport.ts)
rejects non-attachment events on its parent session. The new channel separates
those events through its explicit parent-event callback; the native factory still
needs to supply the original observer and validate expected Page/context
transitions. Dropping these events or allowing every parent event is insufficient.
Keep initial instrumentation resume separate from constructor resumes, retain late
attachment/breakpoint acknowledgments, and clean up through the same original owner.
Production must use the default pinned worker-source profile, not the synthetic
source-profile seam used by tests. Ordinary diagnostics must remain non-pausing.

## Acceptance and remaining boundaries

Prioritize a few composed regressions for exact purpose separation, durable intent
before allocation, shared IDs, irreversible handoff, expected parent navigation,
late replies and original-owner cleanup. Then validate one explicitly disposable
connected lifecycle through the new native factory. These checks should accompany
the combined wiring, not another broad standalone test campaign.

Compose constructor capture with the
[assignment runner](../../plugins/easyeda-pro-control/server/src/current-pcb-worker-construction-runner.ts)
on the same retained owner and object group. Its original callback/receiver and
current-wrapper observations do not establish continuous ownership, all publishers
or foreign subscribers, sink destinations, native channel isolation, ratline
completion, a stable baseline, or create/Save authority. Those remain separate
backlog gates, followed by intended-effect, collateral, full logical SQLite and
saved/reopened proof before any writer can be enabled.
