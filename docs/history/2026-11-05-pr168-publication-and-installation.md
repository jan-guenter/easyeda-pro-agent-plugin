# PR168 publication, installation and controller handoff

On 2026-11-05, [PR168](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/168)
was squash-merged through the protected workflow from reviewed head
`891601248e0254ff54c6c5f553a5e591cc444ae9` into main
`4bdd63f5fdeb9d74975bf18565209942f6e39ff0`. Its sole parent is
`4bd261cb3579c09769509756a0fbde95f383c77e`, the
[PR167 release](2026-11-04-pr167-controller-release.md). The merge used neither
an administrator bypass nor branch deletion.

The official Git marketplace
[`https://github.com/jan-guenter/easyeda-pro-agent-plugin.git`](https://github.com/jan-guenter/easyeda-pro-agent-plugin.git)
installed and enabled `0.3.0+codex.20261105000443`. This is the terminal release
record for that payload. The earlier pending observations and failed checks in
the [review-fix record](2026-11-05-pr168-review-fixes.md) remain historical.
Future writer work is a separate unpublished batch.

## Exact payload and required CI

The reviewed head and merged main have root tree
`9dcdbb1cba821a82a674e76a07106989aa20c54f` and plugin tree
`fd27c0b0ee4a63f1772290b13f254c94fbf698a4`. Their facade projections are:

| Projection | Files | SHA-256 |
| --- | ---: | --- |
| Source | 1,016 | `be7547a55fffe6be89ea5c64308d89282252774c787bb6505406f625c6687181` |
| Runtime | 3 | `d66e084646c4b0cf7a4ea3a2ccbb8831ad5838683a71a2ddb357f4e013fae32d` |

All eleven required jobs passed for the final PR head: eight facade shards,
build verification, the dependent test/build aggregate and Windows recovery.
The complete [PR CI run](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/41975983899)
and [PR Windows run](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/41975983871)
were retained separately from the automatic
[main CI run](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/41978226659)
and [main Windows run](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/41978226521).
All eleven automatic main jobs also passed. Complete workflow archives passed
CRC verification; checkout trees and source/runtime pins matched the reviewed
payload. The main jobs checked out the exact merged commit.

Both final CI selections reported 14,201 facade tests: 14,196 passed, five
expected platform skips and zero failures, across 65 suites. The bridge suite
passed 424 tests in 28 files. Windows `CompileOnly` exercised the generated C#
request-ID policy: forward 1,002/1,003 admission/refusal boundaries, unchanged
legacy worker 811/812 and parent/cache 856/857 boundaries, and refusal of request
ID 0.
That job launched no EasyEDA application and establishes no writer validation.

## Review scope and final documentation corrections

The completed full CodeRabbit review of
`90371eaad19c1c6887330bfc647fd7bb65f0c8b7`,
[review 5780338969](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/168#pullrequestreview-5780338969),
anchors the final review scope. Its two documentation findings were corrected
in the independently reviewed, exact two-file delta to final head `89160124`.
The plugin tree and entire payload remained byte-identical to `90371eaa`;
the documentation-only correction required no new build or version.

The exhaustive inventory retained all 28 raw bodies, including 23 bot bodies,
with inline, collapsed, outside-diff and earlier findings. All 14 reported
concrete items in 13 groups were addressed, and all eight review threads were
resolved. A skipped or rate-limited automatic check was not counted as a new
full review of the final documentation-only head.

The actual final full review reported docstring coverage **80.36%, PASSED**.
It analyzed 56 functions in 47 files and skipped 44 files: 21 unsupported, three
large and 20 at the file limit. Those analyzer limits remain; this is not a
claim that every file or function received bot coverage.

## Installation and actual replacement process

The installed comparison checked all 2,570 committed files, 51,438,653 bytes
and 42 directories, including file modes. Inventory SHA-256 is
`70ea55cd6ac2bbb23f5fddc78850f14d50f2586c4e98cde3b711ebece245563b`.
The complete inventory stayed exact before and after the configured synthetic
offline probe: 54 configured tools, 29 discovered tools, 71 queries and 73
requests. The probe observed stdin EOF, stdio closure and child exit code zero.
The machine profile remained unchanged. CLI success alone was not treated as
proof of installed bytes, process identity or native admission.

The original foreground manager stayed alive. Its generation 3 facade
acknowledged `retired`, zero active calls, closed live admission and released
its lease while the selected package still existed. The manager then closed
that original child's stdin and observed exit code zero, no signal and stdio
closure. After official installation it explicitly selected the verified
installed package and started generation 4. The replacement's offline identity,
actual Node 24.18.0 process, parent/start identity, held pidfd, full installed
payload, source/runtime pins and local resources were verified. The manager's
original frontend remained unchanged; no unfinished owner was transferred.

No Codex restart, host-process signal or manual cache edit was needed. The new
facade remained idle with no bridge or native call. Package/process verification
granted no native authority or runtime admission.

## Connected result and remaining limits

Before publication, one frozen `845eae3b` disposable qualification passed the
original forward capture: four pauses were resumed, two namespaces completed,
30 requests/replies matched, and no allocation remained pending or uncertain.
The later footprint-route observation stopped at the consumed
`FOOTPRINT_COPY_CLOCK_REGISTRATION_SOURCE` refusal. It was not replayed, and
route, source, source-seal, saved-result and writer qualification were not
claimed.

That original case completed normal application closure, original root/empty-Job
termination, helper release, facade retirement and EOF/exit-zero closure. The
closed disposable file remained byte-identical. The
[review-fix record](2026-11-05-pr168-review-fixes.md) retains the connected result
and refusal separately from the earlier
[unknown-capture recovery](2026-11-05-forward-capture-recovery-and-source-fixes.md).
The production project was not opened or edited. No writer or explicit Save was executed; `executionAuthorized` and
`saveAuthorized` remained false. Same-writer execution, mixed clock qualification,
complete structure/SQL completion and the broader API backlog remain separate
work.
