# Intent-only ordinary startup recovery

Candidate `0.3.0+codex.20261015060000` adds `abandon-unknown-launch` to
`easyeda_control_launch`. Tool count remains 16 on the restricted tuple and 41
on the legacy tuple, with seven skills. No design writer is enabled.

## What changed

A facade can disappear after publishing launch intent but before recording the
native result. Its PowerShell helper may still finish hashing the executable
and launch EasyEDA later. Looking only for EasyEDA processes cannot settle that
case.

The new action requires the exact intent digest, explicit acceptance of
unobserved descendants and a fresh coordinator without an allocated runtime.
A separate pinned read-only helper takes two samples. Each enumerates all
PowerShell processes before EasyEDA, excluding only the helper's own PID.
Other PowerShell processes conservatively block recovery, even when unrelated.
Errors, incomplete output and missing successful helper exit refuse recovery.
No process is closed, killed or adopted.

The adapter executes the descriptor-verified helper bytes through PowerShell's
encoded command argument. It never reopens the helper pathname for execution.
This fixes the reviewed parent-directory substitution race; post-execution
file checks remain drift detection, not the source of execution identity.

The historical v1 route admits only the reviewed 020000 facade/profile pair.
New launches write v2 intents recording the helper-before-intent protocol;
their recovery also requires the original facade to match the current verified
facade. An unknown historical v2 producer needs a separate review. The
[source review](ordinary-launch-recovery-source-review-2026-10-15.md) explains
the launch ordering and exact historical admission.

Success appends `unknown-abandonment.json` and leaves the original intent and
operation ID consumed. Launch outcome stays unknown. The receipt does not prove
original root or Job termination, saved state, or absence of differently named
descendants. It changes only the ordinary-startup prerequisite; design
quarantine and all other guards remain intact.

The control skill now distinguishes acknowledged-launch abandonment from
intent-only recovery, including the requirement to recover before allocating
a diagnostic runtime. Offline launch discovery and validation expose the new
request without starting Windows or touching live journals.

## Verification and remaining work

Focused coordinator/registration tests pass, including exact historical
admission, delayed-helper refusal, original-intent preservation and no replay.
The helper adapter has focused bounded-transport tests and a parent-directory
swap/restore regression. All 35 focused checks,
types, targeted zero-warning lint, dependency audits, build and package/repository/
skill validation pass. A partial local full-suite run was stopped after the final
receipt-reader adjustment. Full-suite acceptance uses existing complete GitHub
CI, without another local full rerun. Final CI and installed-package evidence
are recorded in the repository engineering checkpoint after execution.

Three local read-only adapter attempts refused; the two categorized attempts
reported timeout, including the Windows-local helper path. They establish no
process absence or termination. Fixed failure categories now distinguish source,
spawn, timeout, stream, output and exit failures without exposing Windows errors.
The separate Windows CI smoke checks native PowerShell5.1 script execution and
detection of its waiting parent. It does not validate local WSL transport or a
successful absent-helper recovery.

The historical live attempt is still unresolved at implementation time. This
release does not claim that its recovery or a replacement launch succeeded.
The loaded old facade must be replaced through a normal Codex restart before
using the installed new action. No production project or project record was
accessed.

After recovery, continue current closed-symbol rename preparation, owned
save/close/reopen and SQL-effect proof, then one disposable forward/inverse
validation. Broader API work remains in the
[current implementation backlog](current-symbol-metadata-release-2026-10-15.md).
