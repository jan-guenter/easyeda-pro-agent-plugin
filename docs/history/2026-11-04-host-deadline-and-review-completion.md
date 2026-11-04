# Direct host deadline and completed review corrections

This follows the [settled-delivery and recovery corrections](2026-11-04-settled-delivery-and-recovery-confirmation.md).
CodeRabbit's complete PR review of
`0d8a637dba93ad1cb5ad09b0b07eb8adf6971508` finished with two inline
findings, one outside-diff finding and two test-maintenance nitpicks. All five
were accepted. That unchanged head passed all eleven required CI jobs, with
14,116 facade passes, five supported skips, zero failures and 424 bridge passes.
Those results do not establish CI coverage of the later corrections below.

The packaged direct MCP host timeout is now 3,720 seconds, matching the
foreground client's 3,720,000-millisecond outer bound. The former 600-second
host limit could cut off capture before the original native opening and
completion budgets finished. The foreground configuration parser now requires
the same derived packaged timeout; the existing selection regression rejects
both 600 seconds and an omitted host deadline. This changes configuration for
new connections and does not claim to reconfigure an already-loaded host.
The [official MCP configuration documentation](https://learn.chatgpt.com/docs/extend/mcp?surface=cli#other-configuration-options)
describes the per-tool host setting. The native lifetime, command and cleanup
budgets remain separate.

Forward source qualification now retains the original error and any additional
failure-record snapshot/publication error in an AggregateError, with the original
qualification as cause. The retained success-plan guard still prevents creation
of a contradictory failure record after success publication fails. Twelve
focused lifecycle tests passed, including exact original error identities,
unpublished-record settlement, consumed dispatch and original-owner cleanup.
Those collectors are synthetic; no connected source qualification is claimed.

The extension validation/release guide now states the complete user-authorized
idle-legacy SIGTERM boundary, including unavailable shutdown, allowed server
states, no native owner, immediate process/module/resource checks and a held
pidfd through observed exit. It also preserves the prohibitions on SIGKILL,
unrelated services, manual lease removal and native-owner adoption. No extra
permission is required where the user has already supplied that exact authority.

Two existing symbol disposal tests had inspection clones that were modified
but never supplied to any operation. Those dead lines are removed and the copy
test title now describes its actual completion coverage. The original
pre-completion refusal, final verifier selection and once-only release assertions
remain; no cloned-inspection behavior is claimed.

The completed CodeRabbit review remains scoped to `0d8a637d`; it is not a review
of the final correction commit. The correction delta receives independent source
review, focused checks and complete exact-final-commit CI before protected merge.
Every reported inline, outside-diff and legacy issue must have a concrete
verified disposition. A skipped automatic check is not relabeled as a current-head
review. This closes the existing review rather than requesting another full-PR
review after each accepted correction. No substantive CodeRabbit recommendation
was disputed. The earlier stricter private gate and its failure records remain
preserved separately.

Final combined verification, CI and installation are pending at this record's
creation. The next combined frozen build remains unpublished; native qualification,
source seal, closed-baseline proof and full captured-content retrieval are pending.
No production design was opened, edited or saved during these corrections.
