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

## 2026-11-08 source provenance correction

The Git checkpoint introducing this record and its source/test changes is
`1f80fe477988bf2b7dbbffcd7f0183a2f6be6bb8`; its committed tree is
`9862ddb2bac08e001134c1aafb2a411ce8bf5039`. Its Git author timestamp is
`2026-11-08T00:16:55+01:00`. These identify the committed increment only.
The complete test-time worktree was not sealed in the retained evidence and
cannot be reconstructed from it. The reported checks above keep their original
scope and observations; they are not attributed to this commit or a later tree.
See the [PR190 attribution correction](2026-11-08-pr190-history-attribution.md) for the evidence limits.
