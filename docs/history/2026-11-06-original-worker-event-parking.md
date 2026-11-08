# Original worker event parking

The Via and schematic event routers now park a collector when another collector
owns the original worker's held pause. They drain events already received by the
same controller before parking. A consumed original resume or an actual queued
event wakes the reader. The clock lane may also read while its original UI
roundtrip is in progress; the worker push and UI completion delimit that state.

This removes redundant native polling and its repeated current-owner checks
while the worker cannot make progress. It adds no timeout-based completion,
resume, source adoption or writer authority. Abort revokes and wakes parked
readers. A native poll that already entered remains retained until its actual
settlement; revocation never cancels or races that Promise.

The focused regression uses both production routers and both production worker
controllers. It proves no further poll during an original structure pause,
correct continuation after the original resume, queued UI delivery, revocation
of a parked reader, and retained settlement of an already-entered poll. All25
focused cases pass. Both TypeScript projects and strict targeted lint pass.
No native application, Windows compiler, helper regeneration or live call ran.

Continuous planned producer continuation and complete upload frontier remain
unproved. The original ten pre-action guards still refuse their source entries;
the parking change does not release any of them or enable Save.


## Historical source attribution, 2026-11-08

This record first entered canonical source history in commit `3841956723842c525ec4c923d84748f1fffcc949`,
whose complete committed tree is `7fcadac6d44a7254f331b2ceb11ae3cd1732e447`. Those identities establish
which committed increment introduced this record. The full working tree used
for the earlier reported checks, including any concurrent uncommitted work,
was not retained as an independently sealed snapshot. The introducing commit
is therefore not asserted to be the exact tested payload. The earlier results
remain historical observations and cannot replace final exact-commit release
validation. See the [review assessment](2026-11-08-pr184-history-attribution.md).
