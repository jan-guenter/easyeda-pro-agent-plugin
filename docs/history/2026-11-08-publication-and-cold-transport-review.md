# Publication and cold transport review fixes

This source batch addresses all seven actionable and nine smaller comments in
[CodeRabbit review 179](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/179#pullrequestreview-5815920103),
including the reported legacy code.

- Both the history CLI's HEAD lookup and every scanner Git subprocess use one
  frozen environment without inherited repository-location overrides. The
  regression redirects all eight variables at an unrelated isolated repository
  and checks both the selected HEAD and the complete outgoing object scan.
  Invalid CLI arguments return the fixed `PUBLISHABLE_HISTORY_USAGE` code.
- The cold forward sender frames both fixed producer and tail messages with
  exactly one NUL. It rejects preframed input. Tail admission now refuses an
  active clock RPC before changing state and restores the flag if final
  admission fails. The cold graph, pins and smoke entrypoint were regenerated;
  released forward outputs remain byte-exact.
- All eight reported source checkers require an argument or
  `EASYEDA_ASSETS_ROOT`. Missing configuration refuses before source reads.
  The inverse clock-worker test skips only without configuration; configured
  missing or mismatched assets fail.
- Fixture-import discovery and its reference state the actual canonical TEMP
  grammar. The registered API description now lists every supported fixture
  family, including Pad, local-footprint Component and schematic Relevance.

Six focused history, actual installed-source clock and graph checks passed.
The cold compiler input passed C# 5 compilation, its original fixed codec
checks and the new single-NUL framing check. Both TypeScript checks and strict
type-aware lint passed after narrow explicit Buffer/string annotations required
by the current compiler's inferred overload cycle.

All eight source checkers refused absent configuration. Seven passed their
configured checks immediately. The Relevance serializer check exposed its
stale inert receiver: stored child zIndex1 was compared to the maintained
normalized native zIndex3 projection. Supplying that exact projected native
receiver made the check pass. The raw fixture, production projection, child
sorting checks and runtime guards remain unchanged. Failed check logs were
retained, with the corrected result recorded separately.

These are source and offline build checks. They prove no live writer, Save,
saved/reopened result or installation. The selected native-owning package was
left frozen; the final runtime bundles and full exact-commit CI remain pending.
