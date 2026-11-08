# Adjacent registration fixtures

Five extracted registration tests now install the actual adjacent custody and
gate declarations before invoking their original MCP callbacks. The managed
library and netlist fixtures extract the two registration helper functions by
syntax node, so unrelated top-level registrations cannot enter the fixture.
The helper rejects missing, duplicate or oversized declarations.

The focused eighteen callback cases and both TypeScript configurations passed.
The first strict lint run found suppression positions shifted by the new helper
import and one necessary dependency-count exception. Existing comments were
moved to their actual warning sites. The netlist composition test has a narrow
inline exception explaining why its real gate, API and custody dependencies
belong in the same callback exercise. Final changed-file type-aware lint passed
with zero warnings.

This is test-only work. Production registration, ownership, quarantine,
fingerprint and output limits remain unchanged. Exact final package CI is still
required. Private failure and final logs are retained outside the repository.
