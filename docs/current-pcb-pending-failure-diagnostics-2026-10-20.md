# Pending-reader failure diagnostics

The pending reader now reports fixed stage/reason labels and retains the first
observation failure through owner status, lifecycle inspection and an append-only
journal record. These are refusal diagnostics, not execution authority or evidence
that no application effect occurred. Success predicates and null-manager admission
are unchanged.

## What the old failure establishes

The reviewed disposable case returned `PCB_STRING_PRECREATE_OBSERVATION_FAILED_PENDING`
without `_RELEASE_FAILED`. Its runner therefore completed remote-object cleanup.
The later owner status reported an input failure after the completed
`Runtime.releaseObjectGroup` request, with `requestPending:false`. The owner emits
that synthetic input error when invalidating further diagnostic access after the
original observation failure; it does not identify the pending reader's original
guard. No pending reply was retained in that case. The precise guard remains
unknown and is not inferred from the source audit below.

## Bounded retention

- The fixed pending program returns only an enumerated stage and reason when a
  guard refuses. It never returns an exception message, expression, handle,
  collection entry, path or design value in that failure envelope.
- The decoder converts that envelope into a locally branded error. WeakMap
  provenance prevents arbitrary error messages, copied report objects, getters
  or Proxies from being interpreted as retained local failures.
- The runner keeps its original private cause chain and cleanup result. Public
  messages may add the bounded leaf label, without replacing the original phase.
- The owner retains that normalized first failure before synthetic invalidation.
- `observation-failure.json` is tied to the exact consumed model/String intent
  digest and purpose. It cannot coexist with that stage's success result. It
  authorizes no retry, dispatch, Save or recovery operation. A failed publication
  retains the original failure as the primary cause; existing same-byte record
  settlement can publish the retained record without repeating observation.

The synthetic child-pipe test reproduces the important distinction: a pending
`teardrops/own` refusal survives successful cleanup and the subsequent synthetic
input failure, while repeat observation remains unavailable. Separate tests cover
both lifecycle purposes, interrupted publication, same-byte settlement, historical
inspection and non-disclosure of arbitrary private exceptions.

## Source-shape audit: unresolved prerequisites

This is inert byte inspection of PCB asset
`pro-pcb/3.2.193.682ed44e/js/pcb.js`, 10,976,299 bytes, SHA-256
`217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33`.
Offsets below are zero-based JavaScript string offsets. No vendor code was evaluated and none
of the following values was observed in a running editor.

| Source fact | Consequence for future admission |
| --- | --- |
| `ON` at 6,438,262 starts with `openPcb=false`; `ON.manager=null` at 6,439,950, aliased as `FP` at 6,439,970. `getInstance` constructs the manager lazily. | The pending reader currently requires an instance. A legitimate not-yet-created marker may refuse. Do not turn that marker into proof that dynamic-copper work is empty. |
| `w4`/`MI` at 3,917,595/3,918,733 starts with a null manager; the `mpe` view constructor at 8,149,271 does not initialize it. | The later empty-producers reader's unconditional `MI.manager` requirement can also refuse. Its absence needs a separate source-backed model, not an empty collection substitution. |
| `U5` at 5,436,598 retains `func`, `lastTime` and delay after running a debounce callback; completion clears only `animationFrameId`. `Yde` at 7,963,918 uses delay 200 for the net update. | The current empty-producers requirement `func=null`, `lastTime=-1`, delay 0 proves an initial unused state, not every completed state. Completion cannot be inferred by relaxing those fields individually. |
| `t7` at 7,959,346 constructs `bo.getInstance()` for its view. | Raw String's `bo.manager` dependency has constructor evidence, unlike the two lazy managers above. |
| `Cw` at 6,436,181 extends `Ni` at 3,172,844; the base creates the expected Map. `Cw` initializes its own worker registries. | The reviewed own-registry/Map shape matches this source; no class correction was identified. |
| `EYe=fd(Xb())` at 6,434,876; `Xb` exports `Cet` as `WorkerMessageBridge`. `Cet` at 13,743 extends `Xve` at 13,081. | The pending reader's bridge constructor association and own `worker`/`bus` assumptions have source support. The export wrapper is not evidence of a different bridge class. |

These facts narrow future investigation; none establishes the previous case's
runtime values or changes its refusal into a passing observation.

## Verification boundary

The pending-program/native embedding equality test, focused diagnostic tests,
strict TypeScript/type-aware lint and both Windows native-helper CompileOnly
profiles pass. CompileOnly creates no EasyEDA process. No connected pending
observation, writer, publisher, Save or production-design validation was performed
for this diagnostic change.
