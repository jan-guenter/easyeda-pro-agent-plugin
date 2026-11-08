# Saved Via late-preflight request IDs

Source inspection found that saved-reader cache-deletion and loading guards
passed their actual request ID directly to the ordinary opening codec. That
codec deliberately accepts at most103 requests. The existing saved-reader
cache/metadata sequence can place these guards above103, so the valid late
guard would refuse before dispatch. This is a concrete source applicability
defect; no connected failure is claimed.

A separate fixed preflight encoder now builds the unchanged ordinary program
with ID1, requires its exact initial JSON prefix and substitutes only the
original physical request ID. Its bound is the existing saved-reader readonly
budget, and the complete UTF8 frame remains limited to65,536bytes. The initial
preflight, both deletion guards and loading guard retain their original native
purpose, session, context, target and once-only checks. The ordinary103-request
codec remains unchanged.

The native compile-only path now executes three independently constructed
JavaScript/native wire hashes, including ID104 and the saved-reader ceiling.
It also rejects nonpositive and out-of-budget IDs and proves the ordinary
codec still rejects104. Full Linux C#5 compilation and this pure smoke pass;
compiler input is1,860,784bytes, below the unchanged2MiB ceiling. Two-pass
generation is identical. No Windows process, Job, application, native cache
request or Save ran in that check. Strict type-aware lint passes.

Native artifacts, pins and connected saved-reader validation remain separate
from this source correction. The currently selected frozen disposable reader
package is unchanged.

Both TypeScript projects also pass. The earlier private documentation write
refused an incorrect working directory before creating any file; its log is
retained separately from these successful checks.
