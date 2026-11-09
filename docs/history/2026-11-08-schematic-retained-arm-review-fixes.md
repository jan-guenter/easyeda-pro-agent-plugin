# Retained own7 transport and exact Main arm review fixes

The original Modify pipe's second retained-request scope check omitted the
new local status-bus and subscriber-task phases. The existing real duplex
fixture was extended first and reproduced PCB_VIA_RETAINED_PENDING_SCOPE at
the actual status-bus send. These two phases now pass only with the own7
purpose and their corresponding fixed marker. Their public pipe methods still
require the same original pending Modify Promise. Other purposes, markers and
phases remain refused. The fixture drives every fixed command through both
lanes while proving that the original Modify request remains pending.

CodeRabbit PR177 comment 4504287855 also identified that the own7 live-history
observer stored an arm breakpoint without checking actualLocation. The observer
now requires strict location fields and canonical equality with its exact
requested script/line/column, plus a breakpoint distinct from the persistent
driver, before storing it. Actual production observer methods run against an
explicit inert origin shim in the focused test: rounded/foreign locations and
driver aliases fail once and cannot store a return point, read events or rearm;
exact reordered location fields pass. The original Main custody already checks
exact location and registers against existing SQL points before returning to
Core, so the readiness signal is downstream of that underlying protection.
No extra Core signal or new issuer is introduced.

Three focused tests, both TypeScript projects and changed strict lint pass.
No native program, reservation, design/journal/result schema, app owner, live
MCP connection or installed artifact changes in this fix.

## 2026-11-08 source provenance correction

The Git checkpoint introducing this record and its source/test changes is
`eac5b4629b77eff93585259154815eb7fcc808e6`; its committed tree is
`bdcafcd4deae97debf316a6d7f00e505727af8e8`. Its Git author timestamp is
`2026-11-08T01:32:51+01:00`. These identify the committed increment only.
The complete test-time worktree was not sealed in the retained evidence and
cannot be reconstructed from it. The reported checks above keep their original
scope and observations; they are not attributed to this commit or a later tree.
See the [PR190 attribution correction](2026-11-08-pr190-history-attribution.md) for the evidence limits.
