# Versioned lazy-owner observations

The v2 PCB observations preserve an unavailable lazy manager without inventing
an empty instance. The original-owner precreate runner now composes these readers
into a versioned observation. This does not enable create, Save or native manager
initialization. The existing v1 model, pending, empty-producer and marker programs
remain byte-identical, including their stricter refusals.

## Source facts

The PCB bundle is `3.2.193.682ed44e`, 10,976,299 bytes, SHA-256
`217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33`.
The following facts were checked by inert text inspection, without evaluating
the bundle:

- ON, captured through FP, initializes its own manager to null near offset
  6,439,950. Its constructor near 6,438,258 sets only `openPcb=false`.
  `getInstance` creates an ON only when the manager is nullish.
- w4, captured through MI, initializes its manager to null near 3,918,717.
  Its constructor near 3,917,595 initializes `idMap` and `_lastRatline=null`
  after its base constructor. Its `getInstance` also initializes only on a
  nullish manager.
- k3e near 6,439,985 schedules an unretained timeout and retries while
  `tl.modelIsBuilt` is false. Current manager state does not show whether
  that callback is queued. The plain tl readiness flags do not close that gap.

Own null is therefore a legitimate lazy state. Missing and own undefined
properties are reported separately as unavailable states, not certified native
initialization. No reader calls `getInstance` to make its checks pass.
The 055237 connected case stopped during common observation before precreate;
it supplied no live FP/MI sample. These source changes do not identify that
earlier refusal or claim connected admission.

## Contract

Each versioned owner is a strict discriminated union:

| Manager marker | State |
| --- | --- |
| absent | null |
| undefined | null |
| null | null |
| present | Complete original present-owner observation |

The fixed shared helper reads only the captured class's `manager` descriptor.
Accessors and inherited substitutes refuse. It rechecks descriptor value and
flags, and the complete bounded prototype path used to establish absence.
The present branch retains the original instance/prototype checks and field
validation. A null state is never replaced with zero counts, empty arrays or
`no-worker-id`. In particular, pending copper's association exists only inside
the present state; unavailable owners have no association result.

The new exports and required retained arguments are:

| Fixed program | Arguments after original Save scope receiver |
| --- | --- |
| CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_V2_FUNCTION | original callback |
| CURRENT_PCB_DIAGNOSTIC_PENDING_STATE_V2_FUNCTION | callback, admitted constructors, original teardrop proof |
| CURRENT_PCB_STRING_EMPTY_PRODUCERS_V2_FUNCTION | callback, admitted precreate constructors |
| CURRENT_PCB_STRING_PRODUCER_MARKERS_V2_FUNCTION | callback, admitted precreate constructors |

The corresponding decoders end in `V2`. They reject v1 payloads, contradictory
state, invented authority and malformed transport objects. These fixed programs
still require original scope/source/context admission, effect checking, retained
cleanup and lifecycle ownership. Their existence does not add transport authority.

The empty-producer v2 reader still requires its selected present collections and
notification state to satisfy the strict empty subset. The separate marker v2
reader can report nonempty selected counts and retained notification callbacks.
Neither interprets a retained callback or a cleared timer as completion.

## Baseline composition

`inspectCurrentPcbStringLazyBaseline` accepts six supplied replies: original root
and raw String observations, plus v2 model, pending, empty-producer and producer
marker observations. It decodes every reply before joining document identity,
repeated owner states and the independent producer/index samples.

When both copper observations are present, the function makes an explicit
present-state data projection into the existing pure v1 comparison. It reuses
those 47 predicates instead of maintaining a second copy. This projection is
not a native v1 reply, historical evidence or an owner token. The six original
decoded observations remain in the comparison commitment.

If either copper owner is absent, undefined or null, `strictV1Comparison` stays
null and the owner-profile condition is unmet. If the ratline owner is unavailable,
its model-owner condition is likewise unmet even when independent view and network
counts are zero. The result retains the actual owner unions, distinct unavailable
and failed comparisons, and named unmet conditions. Empty-board, complete-baseline,
continuous-observation, queue-completion, Save and execution authority stay false.

## Original-owner precreate integration

The existing precreate action uses separate fixed `snapshot-v2`, `pending-v2`,
`empty-producers-v2` and `producer-markers-v2` phases. The diagnostic action keeps
its original v1 phases and strict programs. Each precreate sweep now reads eight
leaves, including the new marker observation, and supplies six of those replies
to the lazy baseline comparison. Two matching sweeps preserve unavailable owner
states and unmet conditions; matching samples are not continuous observation.

The precreate runner issues 66 fixed requests and four parent owner-recheck
callbacks, then releases its original object group once. With qualification,
the precreate-only path uses 135 requests, or 157 with the optional common stage.
The combined action ceiling is 225: 157 plus 58 original worker-producer requests,
six actor/clock samples and four parent target/frame reproof requests. Those
additional evidence stages are composed by the owner, not invented by this runner.

Each joined sample is bounded to 208 KiB: the four model leaves retain their
combined 128 KiB allowance, four added readers retain 16 KiB each, and comparison
metadata has 16 KiB. The paired internal precreate result is bounded to 424 KiB,
including an 8 KiB outer allowance. Its schema is
`easyeda-pro-control.pcb-string-precreate-observation.v2`; the owner's final
composition also retains its separately bounded worker and actor observations.
No new reader calls a native manager initializer, callback or writer.

## Dormant post-create reader

The String command-state program now accepts the original callback, admitted
constructor tuple and retained teardrop proof. It checks command-owner kde and
subscribed Sfe through the constructor tuple, and rechecks all six retained
teardrop subscriptions and method associations. It no longer reads lexical
`Zec`, `Sfe` or `kde` from the Save scope.

The original teardrop runner must issue that proof after comparing all six
actual bound receivers and qualifying their exact methods and empty arguments.
A hand-built tuple cannot replace that issuance. The dormant leaf does not
repeat inspector bound-metadata extraction or turn an arbitrary supplied tuple
into original receiver authority. Its command and upload-state checks remain
unchanged; it still does not execute history, cancel timers or infer Save phase.

## Verification and remaining work

Nine focused tests cover all four manager markers across the v2 readers,
unchanged v1 hashes/refusals, inherited and accessor managers, invalid unions,
the baseline's unavailable comparison, mixed owners, and command-state callback
and constructor substitutions. Synthetic V8 effect checks pass with null managers
and reject a proxy without invoking its trap. No vendor method or initializer ran.
Four additional focused tests cover the complete two-sweep precreate transcript,
unavailable state retention, final-marker refusal, lost owner after cleanup,
fixed argument shapes, and the request/size allowances. The ten existing model
runner tests continue to pass with the String-specific v2 failure phase. These
are synthetic transport and VM checks, not connected validation.
The synthetic native-owner peer also completes the joined worker/actor route in
203 requests, or 225 after a retained common comparison refusal. Its negative
cases preserve the worker cleanup result and distinct actor failure without a
partial final observation or repeated attempt. The worker peer uses a local
Inspector over inert test factories; it does not run an EasyEDA source asset.

Connected admission remains separate from implemented runtime composition. Full readiness,
complete pending effects, unretained ratline callbacks, hidden arrow receivers,
write-destination confinement and closed/reopened persistence are not proved by
these observations. They must be covered by the separate bounded-effect lifecycle,
not by relaxing the unchanged v1 empty predicates.
