# Wire foundations release and automated installation

PR216 merged reviewed head
`f0f1dfeec1a8dac653dc7589cedb6b485415ea09` as
`2c37d052a2c8206910ac058119107840f2e1c337`. The complete Git trees match
`1eb0dda13424afd6c8a1e424a09cd31cb3dd0a35`. All thirteen reviewed-head
checks passed. The merged commit separately passed all ten CI jobs, including
every facade shard and the aggregate build, and the Windows native recovery job.
The completed feature branch was removed after checking its exact head.

CodeRabbit's full and subsequent reviews reported seventeen comments, including
legacy and outside-diff lifecycle issues. All were accepted and corrected. Its
final walkthrough explicitly reports no actionable comments and identifies the
exact reviewed head through its source/covered commit metadata. For this zero-
finding review it emitted no additional GitHub Review object. That absence does
not mean review remains pending; a green check alone also would not establish
this result. The actual walkthrough, earlier review bodies and resolved thread
inventory were read before merge. Only the originally requested full-review
command was posted; subsequent reviews were automatic.

The final local payload passed both TypeScript projects, global strict type-
aware lint with zero warnings/errors, dependency/signature/security checks, all
non-suite build/bridge/API/repository/MCP/skill phases and seven official skill
validators. All three runtime bundles reproduce PR215 byte-for-byte. The
[originating record](2026-11-15-wire-parser-service-public-foundations.md) retains
the separate focused runs, counterfactuals and corrected fixture/style failures.
No complete local facade campaign was duplicated.

The official marketplace CLI upgraded only `easyeda-pro-agent` on Linux and
Windows from its canonical GitHub source. Both installations now use
`0.3.0+codex.20261116085829`. Complete comparisons against the merged Git payload
verify 5,228 files and 99,842,412 bytes on each host. Linux V2 also verifies exact
file/directory modes and original regular-file identity, with 47 directories
including root. Its inventory SHA-256 is
`fe9b59ee51cd703bf577ff26019280836b4acaf17b851d03feece367d69e42a5`.
Windows checks 46 descendant directories, reparse-free ancestry/entries, original
file-handle hashes and single hard links; it claims no POSIX modes, ACL custody
or NTFS directory durability. Both global Codex configuration hashes remain
unchanged. The supported Windows WSL launcher configuration now points to the
new Linux package. No WSL disk or distribution configuration was changed.

Both maintained fresh-client proofs passed: Linux V1 and Windows V2 with the
Linux fsync evidence broker. Each loaded the new exact package namespace, held
its original facade pidfd and all six namespace descriptors before inspection,
obtained supported retirement and lease-release acknowledgment, closed the
retired facade once, and observed original facade/CLI/watcher exits. Original
driver stdin stayed open through exit; the Windows original process handle was
retained. All terminal transports exited zero with healthy protocols and zero
driver stderr. Neither proof started a model turn or granted runtime admission.
The helper-created workspaces were removed nonrecursively only after all
original exits and a verified empty cleanup manifest. Evidence is retained.

No manual Codex restart or user interaction was needed. This is still a source-
only Wire foundation release: no new native, application, design or Save call
was made during installation. The earlier PR215 Windows-host 116-tool runtime
proof remains separately scoped. Connected Wire/native completion, ordinary
writers and saved-result proofs are not inferred from installation or metadata
client success. Subsequent private native/Wire source work remains unpublished
until its own curation, checks and review.
