# Forward cache envelope and bounded arm source fixes

The retained original inspect reported first exchange refusal at request137,
`Debugger.setBreakpoint`, with `pcb-diagnostic-forward-renderer-envelope`.
Cache construction had attempted its first arm but received no reply. This is
an observed refusal and a source diagnosis, not successful native qualification.
The active frozen package and original native owner were not modified.

The [fixed cache codec](../../plugins/easyeda-pro-control/server/src/current-footprint-copy-cache-construction-native.ts)
serialized its schema-ordered payload as `sessionId,method,params`, then added
`id`. The unchanged forward renderer guard requires `id,method` at the start
of the encoded JSON. All fourteen old cache templates therefore fail that
guard regardless of their valid command values. Their prior smoke hashes
compared against the same serializer order and did not test this join.

The generator now writes only those fixed payloads as `method,params,sessionId`.
All fourteen decoded command values, dynamic field rules, source pins, purpose
checks, IDs and normal/cleanup budgets remain unchanged. Every helper byte
outside the cache codec class is identical to the base helper. The generated
C# smoke checks the actual encoder's request137 prefix for every cache phase,
in addition to the exact hashes and malformed-field refusals. Linux tests
verify the packed table and closed grammar; executing that C# regression still
requires the Windows CI CompileOnly job. No generic command route was added.

The independent [cache runner fix](../../plugins/easyeda-pro-control/server/src/current-footprint-copy-cache-construction-runner.ts)
races its caller's allocation wait against the original lost signal and the
existing2s startup request bound. It keeps the original allocation work and
late raw IDs privately retained. Lost/deadline failure permanently prevents
normal continuation. Unknown allocation refuses cleanup/release before any
join or downstream command and preserves the first error as the cleanup cause.
It neither resolves an allocation as success nor manufactures termination.
The shared channel and original-root/empty-Job termination and helper-release
requirements are unchanged.

The regenerated ASCII helper is1,041,942bytes, SHA-256
`ad8a44744791fdba1c30c07554455cb7c271d1125a378edd4f6fa4566cb979c6`.
Its existing1MiB cap leaves6,634bytes. Only its exact owner/smoke identity pins
refresh. This supersedes the earlier helper-size observation for the new source
leaf; the frozen prior package and its evidence retain their original bytes.

The cache-arm file passed10 focused tests, including held allocation after loss
and deadline, late ID retention and no downstream release/replay. The separate
codec file passed two tests across all fourteen fixed cases. These are12 distinct
tests, not a sum of repeated runs. Complete TypeScript, strict targeted lint,
generator equality and static helper identity checks passed. No full suite,
Windows/helper/native execution, server bundle build, version bump, installation
or publication was performed. Structure observers remain unmounted, and these
fixes grant no new writer or saved-result capability.
