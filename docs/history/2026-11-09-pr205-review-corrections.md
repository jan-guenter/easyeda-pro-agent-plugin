# PR205 review corrections

[CodeRabbit's full review](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/205#pullrequestreview-5822635274)
completed on public head `facb84828ff57a6634eb60b36e2239cca408d5de`.
It reported three inline issues, one Major issue outside the diff and one
Trivial test nit. All five remain valid against the source starting point
`f4677056f5f747412348677a5a58479b70e7236b` and are addressed in this batch.
The original full-review request was already posted. This task sent no bot
command, review comment, CLI review or publication.

## Corrections

The CLI metadata runner reserves its exclusive failure-record attempt before
calling the writer and retains the original Promise. A synchronous throw or
rejected publication preserves the primary failure and publication failure in
one AggregateError without inspecting either value. Repeated calls return the
same Promise without more I/O. Successful recording still leaves the runner's
original failure as its thrown result.

The static reviewed Bubblewrap descriptor opener now rejects identity mismatch
through its declared Promise. Its filesystem checks and execution prohibition
are unchanged. The three custody tests remove only their own temporary parents
in finally blocks. The executable stub writes a marker if run; the test proves
the marker remains absent after successful and refused descriptor opens.

The private Modify array-property caller now selects a separate capture for
its cumulative roster of 256 objects plus the length descriptor. Its bounds are
8,192 nodes and 257 array rows. Depth 12, 32 object fields, 128-character keys,
16,384-character strings and 131,072 serialized bytes retain the ordinary
clock capture's limits. Every other reply still uses that ordinary capture.
The shared 64-field schema, separate 128-new-object budget, complete dense
roster checks and owner/context custody are unchanged. Regressions exercise the
same capture function selected by Modify send before decoding, including large
rosters, ordinary-path refusal, overflow, hostile descriptors and aliases.

The [Wire checkpoint correction](2026-11-09-wire-lifecycle-source-checkpoint.md#2026-11-09-test-provenance-correction)
preserves its original nine passes as unbound historical observations because
their complete dirty source and test tree cannot be recovered. It identifies a
separate later frozen ten-case run without substituting that payload for the
missing original snapshot.

## Review scope

All five walkthrough gates passed on the public review head. Docstring coverage
was 80.77% against 80%, covering 78 functions across 50 files. The bot skipped
75 files for this gate, comprising 16 unsupported files and 59 over its file
limit. This resolves the earlier reported threshold failure only for that
reviewed payload. It supplies no percentage for this correction or a later head.

CodeRabbit also reported incomplete review coverage for two files because their
changes were unavailable: `current-pcb-diagnostic-owner.ts` and
`current-pcb-diagnostic-pipe.ts`. The successful check does not establish a full
review of those files. Complete raw API replies, including that warning, remain
retained privately.

## Verification

The frozen correction input is commit
`5e1d9123c922267de3461406385671d69d942e10`, tree
`4d515b92d373e5d7baff7fcc21d7f9258694db43`. Its complete 5,734-file bytes/modes
inventory has SHA-256
`1614487d3271ebaa7fa7d30a2b7f6162f71868d296067cb9e35025ee41bfafb4`.
Node 24.18.0, npm 11.16.0 and soft core limit zero were verified.

On that unchanged input, all 35 focused cases passed without skips. Both source
TypeScript projects, changed-file type-aware lint with zero warnings, dependency
enumeration, package-signature audit, moderate vulnerability audit, sanitizer,
repository, MCP-contract/plugin and all-skill checks passed. Initial lint
failures concerning error causes, async-return style and test expressions remain
retained privately; they are not replaced by the later passes.

This source delivery excludes bundle, generated native helper and compatibility
projection changes. The integrator owns their combined regeneration and final
exact-payload CI. No full local suite, C# compilation, Windows actor, native
owner, installation, merge or push ran in this task. Its own startup-conflict
stub was inspected once and closed through its supported action, with the
complete replies and original pidfd retained through observed exit.
