# Documentation reorganization, 2026-10-22

The repository instructions now separate lasting requirements from work history.
`AGENTS.md` contains goals, architecture, safety boundaries, engineering and
release rules, plus instructions for maintaining history. `README.md` contains
installation, usage and a short contributor guide.

Dated reports and the connected-validation ledger moved into `docs/history/`
with date-first filenames. Existing instruction archives and the previous root
AGENTS/README remain as verbatim snapshots with source commits and hashes in
[the index](README.md#verbatim-snapshots). The index maps all former paths to
their replacements. The reusable SDK-validation runner guide remains in `docs/`;
installation, architecture and recording-validation guides now sit alongside it.
The packaged historical-case reference points to the single archived report.
Vendored license and provenance files remain with their source materials.

Local links and maintained evidence paths follow the new layout. Frozen
commit-qualified URLs and verbatim snapshots retain their original contents.
Generated coverage and runtime bundles reflect the moved evidence references;
only permitted facade compatibility projections and review time are refreshed.
No tool behavior, external compatibility pin, live runtime, installed cache or
user design is changed by this documentation task.

Verification passed with pinned Node 24.18.0, npm 11.16.0 and a zero soft core
limit. The affected regression suites passed all 67 tests. Strict types and
type-aware lint passed, along with 184 repository/privacy checks, 81 maintained
plugin/MCP checks, packaged-skill validation and all seven installed official
skill validators. The external official plugin validator was unavailable.
Coverage generation and compatibility checks passed. A second source build
reproduced both committed JavaScript bundles byte-for-byte; sanitizer and SQL
reader generation checks also passed.

All report prose is preserved apart from link/path updates. Four verbatim
snapshots match their original bytes. Local file and heading links pass outside
those explicitly verbatim snapshots. Every history entry has a date-first
filename; the history index maps all 248 relocated or retained records. External
compatibility pins are unchanged, and source/test changes normalize exactly to
the originals when the moved report paths are restored.

The repository validator enumerates Git's index. Its initial run refused an
old path after the move; validation therefore uses an isolated temporary index
that includes the reorganized tree, leaving the user's real index unchanged.
A subsequent check required the legacy dispatcher admission statement in both
root guides; the lasting compatibility constraint is retained without release
chronology. These setup refusals are not runtime failures. No live CAD calls,
installation or publication ran.
