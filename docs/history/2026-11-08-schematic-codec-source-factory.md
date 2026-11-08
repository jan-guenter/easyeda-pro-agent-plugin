# Byte-preserving own7 native source factory

CodeRabbit PR178 requested deduplicating the entry/model/serializer native
source generators. The nine identical own7 UI-stage source builders now share
one build-only factory. Each module still supplies its own closed cases,
program table, class/error names, placeholder marker and complete message hashes.
The factory preserves the original 65,536-byte table bound, pinned-Node gzip,
raw/packed hashes, row order, static Encode signature and smoke implementation.
It has no owner/origin issuer, runtime dispatcher or caller-selected live route.

A permanent comparison checks the complete emitted C# class length and SHA256
for all nine modules against the pre-refactor outputs. Every byte is unchanged,
including all Rows/Programs and independent hash vectors. The focused
byte-preservation case, both TypeScript projects and changed strict lint pass.
This source refactor changes no compiled/native payload byte, reservation,
continuation rule, journal/result schema, app owner, MCP connection or installed
artifact. It complements the earlier shared compiled encoder rather than
replacing per-stage state and authority.

## 2026-11-08 source provenance correction

The Git checkpoint introducing this record and its source/test changes is
`d624e9253225187f56157cb39abc0dcc39e2b2ea`; its committed tree is
`406a8a68658b3558d2018cad04fd81e0153c8dec`. Its Git author timestamp is
`2026-11-08T01:33:46+01:00`. These identify the committed increment only.
The complete test-time worktree was not sealed in the retained evidence and
cannot be reconstructed from it. The reported checks above keep their original
scope and observations; they are not attributed to this commit or a later tree.
See the [PR190 attribution correction](2026-11-08-pr190-history-attribution.md) for the evidence limits.
