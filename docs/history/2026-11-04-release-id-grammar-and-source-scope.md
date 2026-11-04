# Release IDs and source-qualification scope

This follows the [completed historical controller recovery](2026-11-04-controller-recovery-completed.md).
The complete review of `0a24897269c32a7df8d9dbba6ab21696674f7c0c`
found a release-ID grammar mismatch and a collapsed, unverified scope note.
Both findings were checked against the actual producers and handler results.

Symbol-copy baselines accept IDs containing uppercase letters, dots,
underscores and colons, with a broader length range than the release adapter.
The shared release validator could therefore reject a genuine completed
operation before its original-owner lookup. The corrected request and result schemas now reuse each family's actual
producer grammar, including requested and final-disposal IDs. The copy baseline
uses the existing metadata baseline ID schema to prevent drift. Original
terminal ownership is unchanged. The correction grants no native close,
termination, reconstructed owner or replay authority.

The inventory also found a narrower managed-journal boundary: its existing
operation path accepts case-insensitive alphanumeric/hyphen IDs of eight to
ninety-six characters. The genuine completion regression therefore uses an
uppercase copy baseline admitted by that path. Punctuation and wider length
bounds are parser-contract checks, not proof of a published native workflow.
The artifact path guard is unchanged. Aligning fresh baseline admission with
that publication boundary remains a separate follow-up; no path widening or
normalization is justified by this release-schema correction.

The forward footprint qualifier stores its complete source packet in the
managed `forward-prewrite-result.json` journal. Its MCP result returns
qualification hashes and flags. The maintained coverage scope and operating
reference now state that difference explicitly; no source handling or getter
execution changed. Generated inventory follows the maintained scope.

The preceding unchanged head passed all eleven required GitHub CI jobs:
14,105 facade tests passed with five expected platform skips and no failures,
plus 424 bridge tests in twenty-eight files. Complete checkout/tree and
source/runtime parity passed. Those results remain evidence for that head;
the corrected payload requires its own final CI and review before merge.

A fresh source-review subagent also initialized an older installed084035
facade automatically while no foreground manager owned the lease. Its exact
original connection identified the serving PID and made one validated normal
retirement attempt. The old parser refused the newer forward launch-intent
schema. This supplied no retirement or lease-release acknowledgment.

Under the user's standing narrow idle-legacy authorization, the original
process, start identity, executable, full installed package and control-root
reference were verified. It had no children, nonstdio sockets or native owner;
the maintained Windows observation found no application or PowerShell process.
One pidfd-bound SIGTERM followed a durable intent and immediate identity/resource
reproof. Original exit, process absence and lease removal were observed. No
SIGKILL or manual lease removal occurred. A first package comparison had refused
the wrong verifier checkout context before signaling; that refusal is retained,
and the completed comparison used the exact older installed commit. No retry
of the consumed historical opening, Save or production-design action ran.

All fifty focused regressions passed, including an actual uppercase copy
baseline/verifier/helper-disposal result and derived inverse final identity.
These use synthetic native collectors; they do not prove connected execution.
Full types and zero-warning targeted lint passed. Independent source review
found no blocker. Final unchanged-payload CI, review, protected merge and official
installation remain separate stages. The source-sealing candidate is an
unpublished implementation batch, with no writer or Save enablement.
