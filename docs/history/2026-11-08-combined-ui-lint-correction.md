# Combined UI lint correction

The first private build from `3b44041d`, version
`0.3.0+codex.20261108080044`, stopped at full type-aware lint. Dependency,
signature, vulnerability, sanitizer, native generation, type and bridge checks
had passed. Lint reported ten issues in the new schematic callback controller
and its test. No bundle, replacement selection or native attempt followed.
The failed worktree, full lint output and unsuccessful preselection report
remain intact in the private build directory.

The [menu-command record](2026-11-08-schematic-menu-toolbar-command-bodies.md)
had reported changed-file lint before observing its final exit. That was an
incorrect success inference from an empty pending log. The combined check
caught the outstanding import order, call nesting, nested conditional,
declaration ordering and nullable-boolean issues.

Source fix `ada39d19` uses named schemas and explicit branches without relaxing
lint. The notify continuation now explicitly refuses a missing change proof
before choosing or advancing its next callback. Its regression proves a resume
cannot be reserved at command entry until that proof exists. Fixed program,
protocol and generated native bytes are unchanged by this correction.

Observed final exit codes were zero for 52 callback cases, both TypeScript
projects and strict lint on the two corrected files. No case was skipped.
Those checks used the canonical worktree with this patch unstaged; no complete
test-worktree seal was retained. The fix commit identifies its source, not a
recovered complete test-time tree. The subsequent frozen combined build must
establish its own exact payload and mandatory checks before selection.
