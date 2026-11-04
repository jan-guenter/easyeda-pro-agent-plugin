# Controller timeout recovery and retired connection closure

This follows the [controller lifecycle](2026-11-04-autonomous-control-loop.md),
[forward source qualification](2026-11-04-footprint-forward-prewrite-qualification.md)
and [registration fixture follow-up](2026-11-04-registration-fixture-followup.md).
The changes remain in the same unpublished `0.3.0+codex.20261104120101` batch.

## Interrupted disposable opening

One frozen `bb7f0f4421b962b16d420dbc72e4632846d11b76` candidate was admitted
through its actual foreground manager and child process. Its new forward
qualification owner completed launch, main construction, browser/frame and
pinned UI-source qualification. The disposable project-capture request was
dispatched once and retained its opening intent. The client timed out after
600 seconds, before the native opening and completion budgets had expired.
Assignments, actor, route and footprint-source qualification were not dispatched.

The manager then refused all ordinary and cleanup requests. Later its original
manager and facade processes were absent. No orderly retirement, original
process exit, stdio closure, original Job termination or helper-release
acknowledgment was observed. The cause of their disappearance is unknown.
The capture remains consumed and its outcome unknown. It was not replayed.

An independent maintained Windows collector subsequently observed neither
EasyEDA nor another PowerShell process in both samples. The raw disposable
project bytes were unchanged and had no SQLite sidecars. Comparing the original
prepared checkpoint directly with the raw source correctly refused complete
SQL equality because preparation changes SQLite's schema version. That refusal
was retained. A fresh maintained preparation of the unchanged raw source then
matched the original preparation in complete logical SQL and materialized
document history. These observations establish no original termination or
helper-release acknowledgment. No user project was opened or changed.

## Supported automation changes

The foreground manager's default and maximum RPC timeout now cover the full
native lifetime, cleanup allowance and response delivery. An explicitly shorter
caller timeout remains possible. When an SDK call fails, the manager retains
its actual original client, transport and generation. Strict `cleanup-original`
requests can select only the interrupted forward operation's existing cleanup
actions. The manager constructs the tool name, operation and binding itself.
Normal work, replay and foreign operations remain blocked. Evidence-publication
failure does not grant this path. Successful original cleanup must still be
followed by genuine facade retirement and observed child closure.

Source-only retirement now uses private monotonic callback history. A session
that has admitted only static API reference queries can retire despite a
historical journal format it does not need to interpret. Local owners, active
calls and reservations are checked first. Any admitted non-reference callback
permanently consumes this source-only status, including a callback that refuses.

After acknowledged retirement, the separate `close-retired` request schedules
the facade's existing normal shutdown once. It refuses active callbacks and
blocks later requests. Its new close-scheduled result explicitly proves neither
reply delivery nor process exit. The existing retirement result is unchanged.
The manager's ordinary retirement followed by EOF remains supported.

## Historical unknown-opening resolution

A separate typed relinquishment route accepts only the reviewed original
opening-intent roster and producer/installation pins. It requires a fresh
facade with no prior application-owner allocation, global exclusion of other
recognized Linux facades, fresh Windows process-absence observations and its
own complete unchanged raw/prepared SQL and history proof. It writes separate
append-only receipts and preserves the original journals.

This route relinquishes only the historical startup blocker. Capture,
termination and helper-release outcomes remain unknown. It explicitly records
`originalLaunchIdentityVerified:false`, grants no owner adoption, writer,
replay or Save authority, and does not replace the original failed case with
a successful qualification claim. External diagnostic JSON cannot supply the
resolver's fresh proof or original in-memory observation.

## Verification and deployment limits

The bounded manager regressions passed 24 tests. The separate historical
coordinator/file-proof slice passed nine tests. The session slice passed 14,
including an actual original child exiting through its own normal shutdown
with code zero, no signal and no client EOF. The historical wrapper/registration
slice passed 25 tests. These slices overlap existing checks and are not summed
into a new full-suite count. Native qualification remains unvalidated.

Existing old host processes cannot acquire these new shutdown paths by changing
source files. Their current lifecycle must finish before installation. Final
combined verification, exact-head CI and CodeRabbit review, protected merge,
official marketplace installation and actual replacement admission remain
separate steps.
