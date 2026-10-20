# PCB producer markers: diagnostic evidence only

The new `current-pcb-string-producer-markers.ts` contains a dormant fixed reader
and strict decoder for `easyeda-pro-control.pcb-string-producer-markers.v1`.
It can describe lazy null managers and retained notification fields without
accepting them as an empty baseline. No command, dispatcher, native embedding,
lifecycle stage or writer consumes this schema in this batch.

The existing model, pending-state and empty-producer refusal conditions are
unchanged; the latter two now receive source-qualified constructor tuples.
This work does not identify the cause of any
earlier live refusal; no missing runtime reply has been reconstructed.

## Source basis

Read as inert text, not evaluated: EasyEDA asset
`pro-pcb/3.2.193.682ed44e/js/pcb.js`, 10,976,299 bytes, SHA-256
`217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33`.
Offsets below are zero-based JavaScript string offsets.

| Source | Consequence for the reader |
| --- | --- |
| `ON` / `FP`, 6438262; `ON.manager=null`, 6439950 | `getInstance()` creates the manager lazily. An own null manager is reported as `{manager:"null",state:null}`, not as zero workers or an initialized empty owner. |
| `ON.deleteWorker` / `saveCopper`, same class | Worker deletion clears `workerName` but can retain `_bus`. Native Save tests workerName by truthiness. The reader retains numeric worker ID zero as present and does not interpret a bus marker as a live worker. |
| `w4` / `MI`, 3917595–3918733 | This manager is also lazy. A null model owner has no fabricated model counts. |
| `mpe`, 8149271; `Yde`, 7963918 | The ratline view and network owners are separate objects. They are sampled even when MI is null. Present managers and all selected owner instances must match the retained scope's exact class prototypes. |
| `U5`, 5436598 | Execution can leave func, lastTime and delay retained while clearing the animation-frame marker. Cancellation can leave the same fields. These values do not distinguish completion from cancellation. |
| `Yde.updateLeftTreeNets` / `notifyUpdateNets`, 7964398 / 7964834 | Notification drains selected update collections, publishes, then clears updateLeftTree; its callback closes over the original receiver. Empty collections and a null updateLeftTree are not subscriber-delivery or lexical-receiver evidence. |

## Reported fields

- `dynamicCopper`: exact own null manager, or a present owner with openPcb and
  raw worker-name, timer and bus markers. A present worker name must be a finite
  nonnegative safe integer; its value is retained, including zero. Timer/bus
  markers distinguish absent, undefined, null and present; they do not qualify
  a timer, connection, worker registry or payload.
- `ratlineModel`: exact own null manager, or selected map/idMap cardinalities
  and raw `_lastRatline` / `_last` markers. Null is not converted to counts.
- `ratlineView`, `net`, `clusters`: selected bounded cardinalities plus the two
  raw cluster flags. Map/Set members, names, object keys, array entries and
  payloads are not returned. The optional view-group marker and count must agree.
- `notification`: func is null or a function; animationFrameId is null or a
  nonnegative safe-integer token, including zero. Finite lastTime and delay are
  reported without elapsed-time interpretation. updateLeftTree distinguishes
  absent, undefined, null and function. sameCallbackReference is a boolean only
  when both fields contain functions; otherwise it is null. Equality proves
  neither original callback ownership nor lexical `this`.

Signed zero is rejected for numeric fields rather than silently erased by JSON.
Missing/undefined managers, unsupported instance shapes, getters for selected
fields, inherited substitutes for absent fields, sparse arrays and malformed
collection shapes refuse. Nonempty selected collections can be reported; they
are not silently dropped. Count bounds are 65,536, and the existing String
decoder enforces its 16 KiB reply limit.

## Execution boundary and limits

A future caller must first qualify the original Save wrapper, handler, source
locations and fresh handler scope. The fixed function expects that retained
scope as `this`, the original callback and a separately source-qualified
precreate constructor tuple. The tuple handles classes omitted from the V8
closure without falling back to name-only matching. It checks the
registry callback before and after reading, uses own data descriptors, and
rechecks references, scalar values, owner prototypes, selected key rosters and
collection cardinalities. It must run with `throwOnSideEffect:true` and must not
adopt a synthetic scope or fall back to an arbitrary expression.

The leaf does not call getInstance, a constructor, getter, callback, scheduler,
cancel/destroy method, publisher or Save. Map/Set size uses the selected
intrinsic descriptor; pristine intrinsics and proxy exclusion are not proved by
this reader alone. Collection values are not sampled: even equal key rosters
and counts do not establish model/view membership equality or a complete
inventory. Rechecks within a call do not establish an asynchronous interval.

The decoder rejects extra fields, contradictory unions and markers, duplicate
JSON keys and malformed remote envelopes. It freezes the result and adds false
limits itself; the input cannot supply authority flags. In addition to the
existing observation limits, the result explicitly sets:

- `managerAbsenceImpliesEmpty:false`
- `emptyBaselineVerified:false`
- `callbackOwnerVerified:false`
- `producerCompletionVerified:false`
- `continuousObservation:false`

`queueCompletionVerified`, `publicationDelivered`, `saveAuthorized` and
`executionAuthorized` remain false, as do original-owner, native-intrinsic,
project-worker association and complete-baseline verification.

This schema must not be translated into an existing v1 success result, an
`EmptyProducers` object, `no-worker-id`, or supplied Save prerequisites. A future
live route needs a separate reviewed stage with original-owner admission,
one-shot consumption, intent/result journaling, cleanup and first-failure
retention. The fixed 82/112-request grammars do not authorize extra calls.
The complete inventories, producer callback receivers and scheduling/delivery
proofs, create/Save effects, closed SQLite comparison and fresh reopen remain
independent requirements.

## Focused verification

Six new synthetic tests cover null versus initialized owners, nonempty selected
counts, worker/frame token zero, retained and unequal callbacks, hostile shapes,
strict decoding and a local V8 `throwOnSideEffect` check. The latter also refuses
a Proxy without running its trap. The four unchanged empty-producer tests still
pass, including their null-manager and retained-notification refusals.
These results are not connected EasyEDA validation or a producer-completion
claim. No vendor code was evaluated and no live app, design or writer was used.
