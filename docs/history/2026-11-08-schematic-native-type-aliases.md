# 2026-11-08 fixed schematic compiler type aliases

This build-only leaf replaces contiguous lexical references to sixteen fixed,
concrete framework types with fresh short using aliases. It does not replace
quoted data, comments, generic type definitions, other qualified roots or
noncontiguous spellings. Global using directives are preserved, avoiding alias
chaining inside another using directive. A full identifier census refuses alias
collisions, escaped aliases, namespaces or declarations that could shadow root
System. There is no caller catalogue or runtime selection interface.

The versioned alias block retains the original byte length and SHA256 in
build-only comments. Expansion accepts only the exact fixed block, restores
alias identifiers, checks the complete original bytes and requires canonical
reprojection. Original whitespace and comments round-trip byte-for-byte.
The source and compiler/spacing byte caps remain unchanged. The future generator
hook belongs to the parent implementation; this leaf edits no generator,
controller, native issuer or artifact.

Node-only measurement read the current uncommitted writer factory and captured
its final original review input immediately before the unchanged pack. The raw
C# input was 2,154,654 bytes, SHA
`2abdcf4e9a5b08cda86c49d87bfa3e313c4c8ca6905fe128412df89dd8d557e6`.
Its compact input SHA exactly matched the actual unmodified factory output:
2,097,047 bytes, SHA
`c945ce928529b3e1482b2518331de20818859504a7f303f312f2076830f2c7c1`.
That current factory succeeded with 105 bytes remaining; earlier capacity
failures belong to their separately retained source states.

The projected review SHA is
`321b22df4f8608cc36d1cd4cdbc5c7580afab953cd6443bbc81222866e433fb6`.
The existing V3 pack over that analysis input produced a 2,062,601-byte compiler
input: 34,446 bytes saved and 34,551 bytes below the unchanged 2 MiB ceiling.
This is a measured C# input/projection comparison, not a sealed whole-parent
worktree or final purpose-helper result. Full C#5 compilation and integrated
other-purpose parity remain future evidence. No oversized helper was admitted.

The complete tested runtime/test tree is
`58606c4d5628e2b7afa58179a69734d6e5f76cfe`, based on
`a46e18e4`; this record is added afterward. Final Node 24.18.0 checks passed
two focused cases with zero skips, both TypeScript configurations, and strict
type-aware two-file lint (all actual exit 0). The cases cover exact restoration,
repeat projection, unchanged literals/directives, existing V3 storage and
collision/malformed-block/hash refusals. A post-style comparison proves the
measured projection SHA stayed exact. Initial local lint and an analysis-harness
esbuild filter failure are retained privately. No C#, Windows, original app,
native owner, MCP or CAD operation ran; no runtime authority is issued.
