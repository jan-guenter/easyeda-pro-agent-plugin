# Packed original Via SDK function

The unpublished Via native field now stores its fixed SDK function through
the existing bounded UnpackFixedProgram decoder. The original function is
30,279 UTF-8 bytes, SHA-256
6b37c164828a7f50c01eb79d257afbb2d85ded1cda880cc8a37cc84dc652e1c1.
Its fixed gzip is 6,604 bytes. The decoder checks canonical base64, compressed
and unpacked SHA-256, complete decompression, strict UTF-8 and the unchanged
65,536-byte bound before exposing the same string.

The TypeScript SDK command/native-request adapter already handles this exact
large program through its own literal schema and 65,536-byte frame limit.
It does not pass through the generic clock capture. The regression positively
encodes all five fixed SDK stages and still rejects this program through the
unchanged generic 16,384-character clock capture. No caller-selected program,
function or wider clock input is admitted.

A new pure C# smoke check compares all five actual SDK messages against fixed
expectations derived from the TypeScript command data and the existing native
JSON order. It includes the decoded function bytes. The source fixture uses
only synthetic IDs and paths. The check runs during the existing Via compile
smoke and invokes no owner constructor, SDK function, application or native
resource allocation. The prior target schema appends branchUuid after its
base fields; the existing native encoder places it before documentUuid. Both
represent the same command data, and this change preserves native byte order.

Eight focused boundary cases pass. Both TypeScript projects and strict lint
pass. Private full generation is byte-identical across two passes. Linux
.NET 10 compiles the complete C# and passes the five SDK message hashes plus
all current producer, initial-cache, initial-sync and periodic-sync codecs.
The private helper becomes 1,872,435 bytes, SHA-256
c53694804784b47f560bc5cfd2500156827eaa07099b97eb879134325a9aec57,
a reduction of 16,809 bytes including the new permanent wire smoke.

Repository, MCP-contract and all-skill validation pass. Request budgets,
original owner gates, the unconditional Save refusal and released-purpose
programs remain unchanged. No tracked helper, bundle, external pin or coverage
artifact is regenerated. No Windows, EasyEDA, MCP or live native call runs.
The recovered space supports the remaining producer/Save implementation
within the existing helper-size cap; it grants no execution or persistence.
