# Fixed compiler storage v2 with original review restoration

This follows [the v1 storage record](2026-11-07-fixed-native-csharp-storage.md).
The v1 module, decoder and original 2MiB body guarantees are unchanged. The
separate v2 format compiles a conservative trivia-compacted C# body, while
retaining the exact original review source and marker bytes through a bounded
spacing sidecar. No native operation or permission changes.

Only outside-literal comments/whitespace become one separator space; token and
regular/verbatim/character literal bytes remain exact. Unsupported preprocessing,
interpolation/raw strings, escaped identifiers, non-ASCII source and
line-sensitive caller attributes refuse. Original/compact hashes and ordered
token hash bind the canonical sidecar. Sidecar bytes are capped at128KiB;
build-only review bytes at2MiB+128KiB and at compact bytes+128KiB. Stored helper
and actual runtime compiler input remain capped at2MiB. Runtime decodes only
the compact body with the unchanged v1 decoder; sidecar data is an inert comment
covered by the admitted whole-helper identity and checked by build restoration.

`expandCurrentPcbDiagnosticCSharpReviewSource` restores original bytes before
source generators and released-role derivation. `currentPcbDiagnosticCSharpReviewSource`
returns that original body for the readable review copy.
`currentPcbDiagnosticCSharpRuntimeCompilerInput` returns the actual compiler
body. Private compiler projects must place only the latter in `Native.cs` and
keep any review view outside their compilation roster. Mechanical source-reader
changes use the review API for C# assertions/mutations, retaining raw at-rest
hash/size consumers. The synthetic CompileOnly reader extracts compact bytes
and inserts its existing test hooks at unique semantic declarations.

Pinned Node24.18.0/core0 measurement on the parent's coherent7ccb81c5 private
combined body: original2,075,796 bytes, SHA256
`1edcedc6b471a60c58ba37e62284557ae6eb3c4d29239be3250866d0769e14b9`;
compact2,034,864 bytes, SHA256
`8d39b82072aef81a60ef8a33246c1fc535739e97e7727ac1a33c3785b78ced99`.
The saving is40,932 bytes. Its canonical spacing is70,898 bytes and the v2
stored helper is1,505,128 bytes, below the unchanged runtime/storage bounds.

Thirteen focused v1/v2 storage, source-packing and full-generation cases pass,
including malformed sidecars/streams, token and literal mutation, unsupported
forms, a review body larger than the compiler ceiling, idempotence and exact
all-six released forward/cold outputs. Both TypeScript projects and changed
strict type-aware lint pass. The actual compact bytes compiled under C#5 in
the parent's Linux net10 harness and passed18 pure codecs plus14 current fixed
Relevance wire hash cases, with no owner constructors/application. The first
harness run compiled successfully but refused its older14 wire hashes; only
those expected cases were regenerated from the current canonical fixed command
and2735 profile before the successful run. No guard was relaxed.

No tracked helper/readable-copy emission, pin, bundle, version, native owner,
application or MCP action was performed. Windows runtime and connected workflow
validation remain the parent's final frozen-batch work.
