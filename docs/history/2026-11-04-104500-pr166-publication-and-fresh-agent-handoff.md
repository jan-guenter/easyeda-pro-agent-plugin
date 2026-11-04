# PR166 publication, installation and fresh-agent handoff

This records the release of the [session retirement and cache batch](2026-11-04-session-retirement-and-cache-batch.md).
PR [166](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/166)
merged through the protected branch as
`8948ac54d48ddd51218cae2ca6fb26356a7c1653`. Its sole parent is
`bd357765a3801afa3642014775b2af3afe9a3a58`. The squash commit preserves the
reviewed payload `8d27c078408c3cc5c21cded0b58a722ceef27a7f` exactly:
root tree `b79d7549193b7544780d36ef2cc365efb935d301`, plugin tree
`09df452c25c3457c8783606a83845b9392889677`. No administrative bypass was used.

## Review and verification

All eleven required final-payload CI jobs passed before merge, including all
eight facade shards, build checks and Windows recovery. The facade reported
14,020 tests in 65 suites: 14,015 passed and five expected platform skips,
with no failures, cancellations or TODOs. All 424 bridge tests passed across
28 files. Source and runtime pins matched the frozen local payload. Local
non-suite checks, focused regressions, zero-warning strict type-aware lint and
reproducible bundles are recorded in the originating batch and retained private
proofs. No duplicate full local suite was run.

CodeRabbit's four reported issues were fixed, including the two findings in
collapsed review text and the persisted-record compatibility issue. Both inline
threads were naturally resolved/outdated after the fixes. The final exact-head
review reported no new actionable or legacy issues. The one authored command
was exactly `@coderabbitai full review`. That particular invocation stopped
after the head changed. The initial full PR review and subsequent exact-head
reviews cover the PR changes; they do not establish review of every unchanged
file in the repository.

At initial writing, automatic push CI for the actual merged main commit was
still running and its terminal result remained pending. This is a separate
check; premerge results are not presented as a run on the squash commit.

### Merged-main completion

At 10:50 UTC, all eleven checks passed for actual main `8948ac54`, in
[Linux CI 41814871149](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/41814871149)
and [Windows CI 41814871136](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/41814871136).
All ten checkout jobs used that actual main commit, with its single parent and
both trees matching the reviewed payload. Complete retained archives passed
CRC checks. Facade totals were again 14,020 tests in 65 suites, with 14,015
passed, five expected platform skips and no failures, cancellations or TODOs.
All 424 bridge tests in 28 files passed. Source/runtime pins matched exactly.
No workflow was rerun to obtain this result. This is automated CI evidence,
not new connected EasyEDA validation.

## Official Git marketplace installation

The official CLI upgraded marketplace `easyeda-pro-agent` from
`https://github.com/jan-guenter/easyeda-pro-agent-plugin.git`, ref `main`.
That one upgrade installed and enabled
`0.3.0+codex.20261104084035`; no additional plugin-add command was needed.
The marketplace checkout names the actual merged main commit.

Before and after the configured synthetic offline probe, the complete installed
package matched all 2,525 files, 42 directories including root and 48,849,063
bytes. Its inventory SHA-256 is
`ad866e83a2cb76bf2e423635877136d5968ee8f3ac5e2adfd58c7f5ec76b5df3`.
The 998-file source projection is
`0db496b9317f2ad881d921e6f622f01dd43797ac20b590a814bf21ec3f021f64`;
the three-file runtime projection is
`a238fa583234736e327e13f6670c62b05bb939d9f630275ee9021752485ccb98`.

The installed probe checked 53 configured tools, 28 discovered tools, 54 queries
and 56 requests. Its original child acknowledged EOF and exited normally with
code zero and no signal. The original machine profile and retained CLI identity
were unchanged. A separate read-only audit verified all command results and
their retained output hashes. This proves installation and synthetic offline
behavior, not host admission, connected execution or continuous isolation.

## Fresh-context subagent result

After installation, a genuinely new subagent was started with no inherited
conversation context and the expected latest version and proof references.
It started a distinct Node24.18.0 MCP process using the latest installed
package. Process arguments, exact working directory, parent and original stdio
pipes correlated that process with the host connection. Complete installed
package comparison and all source/runtime file hashes matched again.

The connection exposed only ownership-conflict status. One passive snapshot
reported the original installed193000 owner, which still retained the exact
control-directory descriptor and unchanged lease. The conflict connection had
no control descriptor, children or sockets. It did not retry or promote itself.
Because conflict mode omits serving identity and the API tool, no direct
`loaded-facade` report or in-memory source attestation was available. The process
and package observations grant no live or native admission.

This demonstrates latest-package startup in a fresh subagent, but does not
transfer control from this older owner. Installed193000 lacks the retirement
tool. Its native diagnostic cleanup had already completed before the one
bootstrap installation. The host owner was left intact; no lease edit,
alternate control root, cache repair, host signal or unsupported stdio command
was used. No new EasyEDA process, project opening, cache observation, CAD edit
or Save followed installation. Supported closure of the original connection is
still needed before another distinct connection can acquire this lease.

For a serving snapshot that supports retirement, future diagnostic handoffs
must finish original cleanup and retire while its original package still
exists, before upgrading/installing. Only then may a fresh replacement start.
Project-opening and metadata-writer owner disposal remains a separate limit.

## Open work

1. After genuine release of the original lease, start another distinct latest
   connection and prove its loaded snapshot and complete process/source
   admission. The already-conflicted connection cannot retry. Run a new V3
   held-cache case through first/fresh observations, release, original root/Job
   termination and helper cleanup. All earlier cases remain consumed.
2. Complete genuine native writer birth and its four-generation capacity,
   dispatch interval, main/RPC/worker/task-2 and publication custody. Then
   validate forward copy against full history/SQL and saved/reopened content;
   inverse deletion needs its separate tombstone/history/saved-absence proof.
3. Establish native `project_structures` constructor, event, queue and SQL-service
   completion. The source model grants no native authority. Seventy-nine SDK
   methods remain blocked by this family; ten also require complete
   nonmutating schematic topology.
4. Finish native public-library exporter receiver, empty-worker, File and
   dependency closure with timeout retention. Device, panel and legacy archive
   conversion remain outside the supplied-library readers.
5. Implement the remaining CBB get/search and PCB point/region routes when the
   concrete capture and effect proofs in the
   [reader feasibility report](2026-11-04-cbb-and-pcb-hit-reader-feasibility.md)
   exist. Declaration discovery and the retained anonymous HTTP 403 results
   do not enable them.
6. Add explicit original-runtime/helper release and acknowledged index disposal
   after terminal project-opening and metadata workflows. A terminal journal or
   `WindowsControlRuntime.status` value alone is insufficient: the released flag
   can precede awaited supervisor closure. Reuse the release discipline of
   ordinary launch, while preserving each workflow's actual latest generation
   and termination binding. Do not simply clear retained coordinator fields.

The exhaustive 835-method inventory remains 216 public subsets, 44 native
equivalents, 13 HTTP equivalents, 79 blocked methods and 483 documented
omissions. These categories do not claim full SDK parity. The completed
installed193000 read-only clock lifecycle need not be repeated merely because
the package changed; a future writer still needs its own bound clock interval.

Raw evidence remains private. This report and its history-index entry are local
handoff additions after the release; they are not part of the installed payload
and require no new plugin version. No production-design operation was performed.
