# 2026-11-09 schematic hash-vector storage

The new schematic-only V1 codec stores repeated fixed smoke hashes in
first-occurrence order, split into immutable 256-entry banks. Banks call the
unchanged `EasyedaDiagnosticFixedTable.Hashes` decoder. Each original vector
uses canonical little-endian ushort indexes, with its original 1–256 entry
bound. The fixed storage roster permits at most 128 vectors and 32,768 unique
hashes. The existing compiler and review source limits are unchanged.

`current-schematic-native-hash-vector-storage.ts` exports
`projectCurrentSchematicNativeHashVectors`,
`expandCurrentSchematicNativeHashVectors` and
`hasCurrentSchematicNativeHashVectorStorage`. It accepts only the old emitter's
exact unqualified verbatim-call spelling through the existing bounded ASCII
C# lexer. Comments and literals remain untouched. Escaped or foreign roots,
helper collisions, unsupported forms, duplicate/mixed markers, altered
decoder bodies and noncanonical data refuse. Expansion checks original byte
length and SHA-256, progressive restored-byte bounds, exact suffix bytes and
deterministic re-projection. A reordered dictionary with corresponding index
changes still refuses. The emitted V1 body and ordering are immutable; future
format changes need another version.

The parent owns generator integration: project stored programs, then hash
vectors, then schematic aliases V2, then token-fusion storage. Restore aliases
V2 before hash vectors and stored programs. Existing shared hash emission,
native decoder, inverse storage, aliases V1/V2 and generated files are
unchanged in this leaf.

The captured current review was 2,139,681 bytes, SHA-256
`6c34c03fff73f880ade968698c541fbaf1acbbce9b6b2dc823390d3b1a1ec5b3`.
Expanding its aliases produced 2,200,321 bytes, SHA-256
`072ddc8ce30fc975342ef3fc653a5b708767beaa1f9b2bf4b0c7c6d49b23e49a`.
Its 82 vectors contain 2,915 entries and 2,084 unique hashes. Hash projection
produced 2,174,872 bytes, SHA-256
`48402cc2a01b6bb48fadbbf2bca5e779b460b18856b6b0cae6c5d2861b143ae2`.
After aliases and token-fusion storage, the exact compiler input changed from
2,080,961 bytes (`9d2a83f1c5f9e36b1a83dacdf0bb6d6d2b48e80ab016601448c32ad62c5d6c8d`)
to 2,056,986 bytes (`5048ab1e0bdc249aff6ebea41a4af8c697da1806552a09ada774b1e10e795b75`).
That saves 23,975 compiler bytes and leaves 40,166 bytes below the unchanged
2,097,152-byte compiler limit. Full original review restoration was exact.
These are Node source/factory measurements, not C# compilation evidence.

The tested source/test tree is `d3a2b0bf880f8500599128ea9ffececfc4945022`,
based on `5f4da3031b1bf7d40cad11f184b6b451b85e4eee`. All five focused
regressions passed without skips or failures, including unchanged inverse
vector storage. Cases cover full and partial banks, ushort boundary indexes,
one-entry vectors, exact old decoder bytes, V3 storage, a pinned V1 projection
hash, metadata/body/peer tampering, canonical reorder rejection and all fixed
bounds. Facade/stub and bridge/test types and strict two-file type-aware lint
passed at zero warnings with Node 24.18.0, npm 11.16.0 and soft RLIMIT_CORE zero.
Repository, MCP-contract, all seven packaged skills and all seven installed
skill-creator checks passed, including scoped history/index links.

This leaf runs no C#, native helper, Windows, application, SDK or CAD action.
It changes no execution authority, capabilities, command, request ceiling,
source pin or runtime package. Final composed C# compilation and connected
evidence remain the parent's separate responsibility.
