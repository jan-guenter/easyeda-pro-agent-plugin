# Inverse build omits unused schematic senders

The inverse-purpose helper retains shared startup, worker, SQL, cache and actor
codebooks. Its closed driver cannot select a schematic birth. This build now
omits the unused legacy schematic clock, accessor, action and action-guard
implementations, their PowerShell dispatch and their compile-only hooks.
The other three layouts do not apply this projection. Request limits and the
2 MiB helper/compiler limits remain unchanged.

The projection requires each original generated boundary, dispatch and smoke
exactly once. Missing, duplicate or edited boundaries refuse generation.
Regeneration restores the complete input family before applying the same
projection, so a second pass produces identical bytes.

Validation at source `1eb987d9` plus this change passed both TypeScript checks,
strict type-aware lint and the two focused shared-codec regressions. All four
layouts passed repeat generation and C# 5 compilation. The inverse compiler
input is 2,049,026 bytes, leaving 48,126 bytes under the unchanged limit. Its
30 inverse codec checks passed. The other layouts passed the two shared clock
checks. These are offline build checks, with no connected inverse execution.

The first private compilation attempt included both the full review copy and
the compiler input through default project globbing, causing duplicate types.
That failed log is retained. A separate project selecting only the actual
compiler input passed for all four layouts. No production guard changed.

Native artifacts, pins and runtime bundles will be regenerated with the next
complete source batch. The active selected package and retained native owner
were not changed by this source-only work.
