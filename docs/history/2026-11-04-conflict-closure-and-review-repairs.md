# Conflict connection closure and full-review repairs

This follows the [historical recovery continuation](2026-11-04-historical-recovery-continuation.md).
The frozen `5435a6a036714e0ac320e84644134782029c16be` payload passed all 11
required CI jobs: 14,099 facade tests passed with five expected platform skips,
and all 424 bridge tests passed. Checkout trees, source/runtime projections and
reproducible bundles matched. No duplicate full local suite was run.

## Complete PR review and corrections

CodeRabbit paused automatic reviews at its reviewed-commit threshold. A supported
GitHub review re-request produced no new review. A second exact
`@coderabbitai full review` comment then started and completed the full base-to-head
PR review, selecting 101 changed files. The original command and its completed
review remain retained. No resume or incremental-review command was posted.
This does not claim review of every unchanged repository file.

The full review found two code issues and three wording notes, all addressed in
this follow-up batch:

- The forward qualification failure journal now budgets the complete JSON
  envelope, including maximum escaped source and error content. Its failure-only
  cap is 12,615,680 bytes: six times the 2 MiB source allowance, six times the
  4,096 error UTF-16 units and the existing 8 KiB metadata reserve. Ordinary
  metadata remains independently file-budget bounded. Persisted schemas and
  source/result/unrelated-family limits are unchanged. The 15-test focused slice
  covers exact-cap publication and full reading, one-byte-over refusal and
  original cleanup. Its initial fixture restoration failure is retained.
- Closed-symbol helper release now reserves preflight separately and clears that
  reservation on pre-native refusal. It publishes its exact original release
  owner and completion together only after checks and inert construction pass.
  Native cleanup remains once-only. Eight focused tests include the genuine
  completed-flow refusal, concurrent preflight denial, same-owner retry and
  exactly one helper release.
- The qualification, controller and PR166 records use clearer wording without
  changing their observations or original limitations.

## Normal closure for non-owning connections

Ownership-conflict servers can now accept their own strict `close-conflict`
session request. Their separate `inspect` action reports their own PID so the
caller can verify and retain the original process before requesting closure;
the other owner's PID remains a startup snapshot. This branch never acquired a lease, upstream, gateway, engine
or native owner. One local request schedules its normal shutdown and refuses
subsequent work. It cannot close or signal the observed owner. The new result
explicitly proves neither response delivery nor process exit.

Four isolated startup tests pass. The closure regression uses the original
child handle to observe code-zero exit and stdio closure without client EOF or
signals, while the actual owner's lease stays byte-identical. Malformed close,
owner-PID injection and ordinary retirement requests refuse. Existing snapshots
retain their original status schema and startup snapshot semantics.

The user separately approved a narrow standing exception for normal termination
of verified idle legacy EasyEDA MCP servers without usable shutdown commands.
Four exact original idle processes received one pidfd-bound SIGTERM each; exit
and later process absence were observed. The first exit preceded parent reaping,
so its initial immediate-absence assertion refused and a later observation
confirmed reaping without another signal. No SIGKILL, unrelated-service signal,
lease deletion or native process termination was used. The original disposable
capture, Job termination and helper-release outcomes remain unknown.

A root-owned foreground manager then verified the complete frozen 5435 payload
and its actual child process. Reference-only queries were followed by acknowledged
retirement, lease release, child EOF, code-zero exit and stdio closure with no
signal. The manager stayed alive between generations. No native owner was
allocated by this controller.

The minimal CodeRabbit configuration inherits existing settings and disables
the commit-threshold pause for future review loops. Both settings follow the
[configuration reference](https://docs.coderabbit.ai/reference/configuration)
and [automatic review controls](https://docs.coderabbit.ai/configuration/auto-review).
The repository and packaged guides retain the narrow cleanup authorization and
prefer supported normal closure. The original startup blocker still requires
its fresh typed resolver; these host exits do not clear it by themselves.

Final combined checks, exact-head CI and review, historical relinquishment,
protected merge, official installation and replacement admission remain separate
steps. No new native qualification, design edit or Save ran in this follow-up.
