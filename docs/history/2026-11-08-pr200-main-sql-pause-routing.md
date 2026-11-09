# PR200 Main SQL pause routing

[PR200](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/200)
received the exact requested `@coderabbitai full review` comment. Review
`5819877595` completed on public head
`7231e2eef322413d8d2897e81e038c57683ad56d`, whose complete tree matches local
development payload `36b37df90375790df892963c0295d32250625987`.
It selected all 50 paths in this review partition, with no filtered or
unavailable files, additional legacy issues or nits.

CodeRabbit reported two Major stability issues. Its separate documentation
check measured 79.17 percent across 48 functions, below the 80 percent threshold;
the other four pre-merge checks passed. The successful bot check records review
completion and does not mean these issues or the documentation gate passed.

The [delivery issue](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/200#discussion_r4507996479)
is corrected by servicing only guard-passed original SQL pauses before Via
event delivery, including pauses received while the observer waits. Actually
held pauses remain queued for their intended observer. The same guard-only
service supports idle pumping without duplicating classification.

The [stale held-reference issue](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/200#discussion_r4507996484)
is corrected after validating the exact original resumed event. The service
clears the held reference only if it still identifies that pause. A newer
held pause received in the same transport batch survives. Classification
failure and lost acknowledgment stop without replay.

The local unpublished correction leaf is
`3cb85f26b4598aea70f70e394027c4a0109a90f9`, integrated as `b168220c` after
the separate [startup binding fix](2026-11-08-startup-path-name-binding.md).
Thirty focused original-runner cases passed with zero skips. Replacing the
runner with the original unsafe source made the new semantic regressions fail;
the exact corrected bytes were restored before final checks. Facade and bridge
types, strict changed-file lint, repository/MCP-contract validation and all
seven skill validations passed on that correction leaf. No native owner,
application or C# execution was allocated.

Three source contract docstrings address the documentation warning without
changing native programs or validation. A later external review must measure
the corrected head; no improved percentage is inferred here. Bundles,
compatibility, connected validation, corrected-head review, exact final CI,
release and official installation remain pending for the combined batch.
PR196's five and PR198's eight historical unavailable generated files retain
their separate provenance and coverage limits. This source partition does not
clear those gaps. No production project was opened or edited.
