# CodeRabbit path quoting and publication handling

The first full-review partition, [PR172](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/172),
reviewed140 changed paths against the complete public payload tree. Its review
is evidence for those submitted file versions, not for subsequent changes.
The final release still needs review coverage of its changed file versions.

## Native bootstrap paths

[Comment4504116941](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/172#discussion_r4504116941)
correctly identified missing Unicode single-quote escaping. PowerShell recognizes
U+2018 through U+201B as quote delimiters. The new shared encoder doubles these
and the ASCII apostrophe before a path enters a single-quoted literal. Both
forward graph loaders and all three adjacent native helper loaders now use it.
It preserves other path characters and changes no generated helper bytes,
source hashes, native ownership checks or bootstrap length limits.

This follows [Microsoft's quoting rules](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_quoting_rules?view=powershell-5.1).
A Windows PowerShell5.1.19041.6456 parser check accepted each of the five
production-encoded delimiter cases as one assignment with one exact
single-quoted constant. The input contained dollar-subexpressions, double
quotes and apparent code. The check parsed this input without executing it.
The original PowerShell subprocess exited normally. This proves literal
encoding, not an EasyEDA launch or connected editing behavior.

## Retained publication failures

The review's additional cache-backup comment explicitly allowed documenting an
intentional single-attempt publication. That is the maintained contract here.
An exclusive artifact creation can finish before its acknowledgment or a later
ownership reproof fails. Evicting that rejected promise would allow another
artifact at a new random path without resolving the first result.

The source now documents why it retains rejected attempts. A regression uses
the real exclusive artifact publisher, loses the acknowledgment after durable
creation, and verifies that the repeated call returns the exact original
rejected promise with only one publication. No retry or cleanup authority was
added. This follows the review's documented alternative and needs no opinion
tie-breaker.

Six focused cases initially passed. After strict lint corrections, the five
affected encoder/publication cases passed again, and changed-file type-aware
lint had zero warnings. Both TypeScript configurations passed. The complete
released/native graph regression passed with its existing byte-exact pins.
Final generated artifacts, full CI and remaining review partitions are still
pending; no release or installation is claimed.
