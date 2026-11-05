# Original pending capture control in source

This source-only manager change is isolated in
`feature/structure-completion-transport`, based on
`15dc1cc6fed3bb90cfebfff3e3ea3bf3cd45da8c`. The separately frozen
[structure observer work](2026-11-04-project-structure-observer-source.md)
retains its own scope and proof. No release version, package, native owner,
Windows command vocabulary or current frozen controller was changed.

The [manager](../../plugins/easyeda-pro-control/scripts/control-session-manager.ts)
previously awaited each input command through the full SDK deadline. Its
original facade allowed inspection and confirmed abort during a pending
capture, but the CLI could not send either command until the capture returned
or timed out. The CLI now retains that one original capture Promise and reads
only local inspection or a strict `in-flight-original` side selector. All other
owner work keeps serial admission.

The [maintained controller guide](../../plugins/easyeda-pro-control/skills/easyeda-pro-control/references/autonomous-controller-updates.md#inspect-or-abort-an-original-pending-capture)
records the exact grammar. Only original inspection and explicitly confirmed
`abort-generation` are admitted while a strict forward `capture-project` SDK
request is pending. The capture uses the normal bookkeeping budget. Its
original Connection, client, transport, generation, request ID and bound forward
arguments stay private. Side input supplies no tool, operation, binding,
intent, timeout, code or replacement root. Each capture permits at most 16 side
SDK calls with a 120,000 ms deadline per call, within the existing cleanup
reserve. There is one side-input slot and one shared private abort reservation.
User approval for forced termination of the original EasyEDA Job is still
required; confirmation alone grants no authority.

Evidence and stdout queues serialize the parent and side publications. Each
result carries its own exact retained evidence receipt. Even local inspection
and refusal output hold the parent's settlement through backpressure. The
manager rechecks that the parent is still pending after publishing a side
intent. Parent settlement during that await refuses before SDK dispatch and
consumes no abort attempt. Normal calls, replay, retirement, replacement and
other cleanup stages cannot enter while either publication remains pending.

Dispatching abort leaves a separate controlled-capture cleanup context and
blocks ordinary calls. Its parent outcome remains pending, returned or unknown.
Only an actual SDK rejection creates an interrupted-request context. A rejected
side inspection keeps its own ID/action and parent reference; it cannot relabel
a later known parent result as an unknown capture. All derived contexts retain
the same private abort reservation, so an older side failure cannot reset abort
consumption. The original SDK-rejection and interrupted-launch recovery
contracts remain available under their existing guards.

Cleanup still requires fresh original inspection, actual original-root and
empty-Job termination, settled records and acknowledged helper closure. A side
abort response supplies no replacement permit. Final facade retirement, original
child stdin EOF, code-zero exit and stdio closure remain mandatory. Evidence or
publication faults preserve the existing handoff freeze.

Seven focused regressions passed with Node 24.18.0, npm 11.16.0, test isolation
and core dumps disabled. Two new actual SDK peer cases prove pending input
inspection/abort and separate side-rejection/known-parent outcomes. The existing
timeout case now also holds local inspection output after the SDK timeout and
proves retirement stays blocked through that publication. The remaining cases
cover serial input framing, pre-emit delivery refusal, asynchronous stdout
failure and pending-result publication custody. Full types, strict targeted
lint and diff checks passed. These peers are inert test children, not EasyEDA
or native-owner validation.

An initial fixture supplied a project key that did not match its raw path.
The strict capture schema correctly withheld the new side route, so the test
stayed on the serial path and reached its SDK timeout. The fixture was corrected
to the maintained path-derived project key. No production guard was relaxed.
The failed fixture and targeted lint runs remain in private evidence alongside
the final passing run.

The frozen two-file source/test patch is
`af63611b4a4c7895987dd6795827b4cdf1dd1c7ad2fa4ad87546aed4e0f4e6c7`;
its private proof is
`01d59e1c428f01d10d028bbb085ce21430f7ccbf66bc9e374e34595fff2e57b3`.
The documentation follow-up changes no code or tests. No full local suite,
build, installation, live MCP call or native execution was performed for this
manager change. Combined release checks and exact-head CI remain separate.

This source cannot hotpatch an already-running serial manager or capture27.
That original frozen owner retains its own terminal-result and supported-cleanup
obligations. Replacing source files, binding a new client, copying native handles
or reading this history transfers none of that ownership.
