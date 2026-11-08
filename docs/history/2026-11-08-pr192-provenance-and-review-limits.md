# PR192 provenance corrections and review limits

CodeRabbit review `5817209441` on PR192 raised five inline issues and two
additional nits. All seven are addressed in this source batch. Seven inverse
and compiler records now distinguish the locally verified introducing commit
and tree from the earlier unsealed test worktree. Their C# hashes identify
only emitted compiler input. The retained historical results are not assigned
to a reconstructed or later tested tree.

The DEL RPC entry record now states that its getter calls `assertCurrent()`.
The separate `assertOriginalHeld()` binding checks the live held event. The
earlier summary overstated what the getter itself checked. The PR190
attribution table now explicitly identifies its introduction objects as local
private ancestors and links the public review snapshot of the report. Public
availability of that report does not establish historical test-tree identity.
The two schematic spacing nits are corrected.

Fifteen test-fixture/helper docstrings describe their original Promise,
source-position, inert-realm and isolated-Git guarantees. Changed-test strict
type-aware lint, repository validation, MCP-contract validation and all seven
packaged-skill validations passed. The bounded local link check covered 793
links with no missing target. This documentation checkpoint starts at
`d8dc12b5`; its private correction inventory retains each verified local
introduction object. No previous test was rerun to replace its historical
provenance, and no connected execution is claimed.

Both review-only PR191 and PR192 received the exact requested
`@coderabbitai full review` comment and a "Full review finished" reply.
PR191 currently has no inline review issues, but reports nine files whose
changes were unavailable: the generated native helpers and launchers, plus
the large diagnostic owner module. PR192 reports the compatibility file
unavailable and excludes the three dist bundles through the inherited
`!**/dist/**` filter. These are explicit review coverage limits, not full
review of every byte. Source review and reproducible generated-output checks
must be reported separately.

The general docstring pre-merge check remains open for PR191. It reports 100
functions across 50 files, eight percent coverage, and 80 files over its file
limit. PR192 reports seven functions across eleven test files and zero percent
before the specific docstrings above. Neither report names the individual
functions. No check configuration or threshold was relaxed, and no later
CodeRabbit percentage is inferred from local comments. Further source-batch
review and the exact final CI/merge/publication remain outstanding.

The next comment-only increment adds eighty specific source contract docstrings
for the inverse protocol, original collectors and reversible C# storage APIs.
An independent parsed-AST comparison against `1edc26e4` proves all nineteen
source files retain identical runtime syntax and literal bytes. Changed-file
strict type-aware lint passed. The real runner's synthetic peer was separately
updated to supply the new passive import Array(4) metadata, without bypassing
the decoder; all eighteen SQL-fence runner cases passed. That check used
`1edc26e4` plus the peer patch before the comment-only increment. The complete
frozen batch still needs its mandatory types, build and compatibility checks.
