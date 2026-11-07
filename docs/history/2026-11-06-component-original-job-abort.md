# Component original Job abort

The separate `component-spatial` wrapper now accepts `abort-component` with its
original operation ID, binding digest and literal
`confirmAbortOriginalComponentJob: true`. It accepts no caller PID, path, HWND,
Job ID or helper identity. The older `spatial` wrapper is unchanged.

The original lifecycle reserves cleanup synchronously before its first await,
seals normal work, waits only for its disk publication barrier and records the
complete published prefix hash. The original opaque reservation can dispatch
once after durable intent. Interrupted unpublished normal candidates remain
private and cannot become success records. Lost publication or acknowledgment
consumes the attempt; it grants no automatic retry or replacement ownership.

The original Component helper rechecks its retained root handle's PID and
creation identity, original Job membership and limits, then calls
`TerminateJobObject` once with its original Job handle. It signals no helper,
manager or caller-selected process. The acknowledgment says only that termination
was dispatched. `observe-termination` must independently prove original root exit
and an empty original Job. `release-closed` must then close the retained helper.
Abort proves no Save, discard, durability or read acceptance.

Component helper exchanges now use the existing original serialized native
queue, so this control cannot collide with a pending poll. The original pipe
failure settles an interrupted reader without replay. The public index admits
this confirmed Component cleanup outside the interrupted reader's global gate.
The lifecycle still pins the inherited original core `run` method. Normal work,
new navigation, object-group cleanup and normal-close are refused after abort.

The foreground manager admits this one Component selector on its same original
connection, including the existing bounded in-flight lane. It derives the wrapper,
operation and binding from its own request and fresh private owner inspection.
It consumes the abort before SDK dispatch and retains its original pending call.
Copied historical JSON supplies no client or Job. Termination, helper release and
facade retirement remain separate. Older spatial recovery still offers normal
close and no abort.

The renderer budget remains 419 requests, including its one group-release slot.
Abort uses one separate helper control and no CDP request. The actual guarded
Component read frame remains 65,261 of 65,536 bytes after the optional-environment
correction, with 275 bytes of headroom. No limit was raised.

Offline checks used Node 24.18.0/npm 11.16.0 and core dumps disabled. The first
production queue regression found `REQUEST_PENDING` because Component polling
was not serialized. That failing synthetic result was retained, and the corrected
queue passes with one original synthetic child. The manager regression initially
asserted the wrong outer response field; the complete original dispatch result
was already retained and its actual nested termination field is now checked.

Focused checks cover the production Core and real synthetic child, actual
lifecycle/private journal with only an inert closed-checkpoint VM seam, exact
interrupted-prefix preservation, copied reservation refusal, malformed transport,
strict manager selectors, original in-flight manager cleanup and the exact index
gate branch. No test has a Windows Job or application process. Full combined
startup generation is identical on its second pass, contains one Component abort
block and preserves old 384-request purposes. The complete emitted C# compiles
and its Component/old-spatial/Via/SCH pure smoke checks pass on Linux .NET 10.
Twenty-seven focused regressions, strict types, type-aware lint, repository, MCP contract and all-skill validation pass. These are source/offline checks; connected
Component abort and positive Component point reads remain unvalidated.

Shared generated helper bytes, compatibility pins, bundles and released artifacts
are intentionally outside this source commit. The integration owner regenerates
and freezes them before connected validation.
