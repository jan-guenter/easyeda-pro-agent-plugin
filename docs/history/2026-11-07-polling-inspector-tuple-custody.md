# Polling Inspector tuple custody

The original polling capture used `Object.freeze` while requesting
`throwOnSideEffect: true`. Actual Node 24.18.0 Inspector execution rejects even
freezing a fresh array as a possible side effect. Earlier tests created frozen
arrays without that flag and therefore missed the contradiction.

The fixed capture, entry and return programs now create ordinary private
arrays. The captured closure checks the exact prototype, length, own property
roster, values and descriptor flags. The entry closure rechecks its original
tuple and all retained application/native descriptors. Only the original
once-only cancel command mutates the timer state. The exact tuple decoder
rejects frozen, accessor, missing, extra and malformed forms.

Nine focused checks passed with strict changed-file lint and TypeScript checks.
One runs the unchanged production capture/entry/return programs through actual
Inspector with side-effect checking enabled. It uses inert browser globals and
timer substitutes, then mutates a private tuple and proves the next read refuses
without scheduling or cancelling a timer. Other checks retain unknown outcome,
no-replay and original completion-ack behavior.

The shared polling programs cover the separately owned Via, inverse and
seven-record paths; no owner, intent or completion transfers between them.
Library-refresh capture already has its own fixed false side-effect flag and
does not need this correction. Native artifacts will regenerate with the next
combined source batch. There is no connected timer or writer success claim.


## Historical source attribution, 2026-11-08

This record first entered canonical source history in commit `9660020ae52d831539a2f603029ac8c16c114774`,
whose complete committed tree is `a883587dda1d6130ec5eee4c69205d7bcb1ac1a0`. Those identities establish
which committed increment introduced this record. The full working tree used
for the earlier reported checks, including any concurrent uncommitted work,
was not retained as an independently sealed snapshot. The introducing commit
is therefore not asserted to be the exact tested payload. The earlier results
remain historical observations and cannot replace final exact-commit release
validation. See the [review assessment](2026-11-08-pr184-history-attribution.md).
