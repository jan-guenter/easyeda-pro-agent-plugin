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
