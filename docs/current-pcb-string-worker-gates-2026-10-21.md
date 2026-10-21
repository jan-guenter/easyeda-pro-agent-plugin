# Worker gate and publisher qualification

This private component qualifies eight source-defined method references and
observes their original receiver's raw gate values. It does not call the
methods, register a transport, arm publication capture or enable a writer.

The source is the installed project-worker bundle `3.2.184.355087e9`,
2,181,284 bytes, SHA-256
`b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928`.
The bundle was parsed and read as inert text. It was not evaluated.

## Fixed qualification

`current-pcb-string-worker-gate-scope.ts` pins exact method bytes, hashes,
function locations, names and argument counts. Its fixed order is:

| Receiver | Method | UTF-16 source offset |
| --- | --- | ---: |
| Gd prototype | isReadOnly | 2,013,215 |
| Gd prototype | isV2Format getter | 2,012,635 |
| Lg prototype | canWsPublish | 2,108,520 |
| KP prototype | publish | 9,842 |
| JP prototype | broadcastPublish | 12,230 |
| JP prototype | post | 12,638 |
| JP prototype | onMessage | 11,813 |
| KP prototype | onReceivedPublish | 10,418 |

The fixed selector in `current-pcb-string-worker-gate-program.ts` returns only
these methods from the current worker's own `PROJECT` and `PROJECT.workerBus`.
It requires the source-defined `Lg -> Gd` and `JP -> KP -> Mb` prototype chains,
own method descriptors and absence of receiver/intermediate method shadows.
The descriptor reader requires the same original tuple, a fresh leading scope
from its qualified `canWsPublish`, and the same original PROJECT receiver.
It rechecks retained descriptors, method references and prototype identities.
Every method still needs host-side body and location qualification; matching a
constructor name alone is not sufficient.

No public caller chooses a method, expression, object handle or scope. The
private fixed worker-producer runner now binds the tuple and freshly acquired
scope to its original worker/context, enforces effect checking, retains exact
reader replies, releases its group and rechecks its original owner. The gate
component itself does not register a transport. See
[the collector contract](current-pcb-string-worker-producer-runner-2026-10-21.md)
for the native integration boundary and remaining limitations.

## What the gates mean

The reader preserves the own booleans `isTemporary`, `isHistoryBack`,
`_isV2Format` and `isReady`. The source does not initialize `isSyncing` in the
constructor. It is assigned during later parsing/synchronization, so absent,
own undefined and own boolean are separate reported shapes. An inherited
substitute, accessor, null, number or object refuses. Missing isSyncing is not
reported as an empty queue.

The captured `jr` boolean comes from `L1.IS_PRIVATE` at source offset 1,654,685.
It is a private-deployment flag, not offline mode or proof of network isolation.
The reader never invokes the namespace's accessor. Full pinned source and the
original canWsPublish scope establish the binding's meaning; its value remains
a sampled primitive rather than a stable configuration guarantee.

The fixed predicates reproduce these exact source expressions:

- `isReadOnly = isTemporary || isHistoryBack || isV2Format`.
- `canWsPublish = privateMode && isReady && !isReadOnly && !isSyncing`.
- The cooperation callback is gated only by `!isReadOnly`.
- The structure callback's state gate is `isReady && !isReadOnly && !isSyncing`.
  Its separate document/event-type filter remains outside this predicate.

The host decoder independently recomputes these predicates from the returned
raw values. In particular, `canWsPublish:false` does not establish that the
cooperation callback or other network/backend routes are blocked.

## Publisher facts and remaining limits

The selected path is KP.publish to JP.broadcastPublish, JP.post, JP.onMessage
and KP.onReceivedPublish. The reader retains the original workerBus sender UUID
and verifies that these exact method references still occupy their native
prototype positions. This is useful method ownership evidence, not complete
publication provenance.

JP.post sends through `bc.postMessage` and self-delivers the same payload object
in a microtask. Native BroadcastChannel identity, its postMessage intrinsic,
the hidden onmessage receiver and its external peers remain unqualified.
Other publishers, including compiler publishPendData, still require admission.
The callback task catches exceptions and later subscribers can still run.
Therefore a later observed batch is not proof that the original handler
succeeded or that the original sender/payload was confined to this operation.

The four previously identified hidden arrow receivers remain unresolved.
These gates do not prove what a foreign captured receiver would do. No field
claims write-destination containment, atomic sampling, queue completion,
publication delivery, original owner authority, Save authority or execution
authority. The finite-effect writer still needs those independent scope and
original-lifecycle prerequisites, plus exact closed/reopened effects.

## Verification

The focused inspector test uses synthetic receiver construction with the eight
inert method excerpts at their reviewed source locations. It qualifies the
complete tuple and fresh jr scope under effect checking, without invoking a
native method/getter/callback. It covers the optional syncing shapes, private
mode distinction, read-only branches, method shadows, inherited state,
accessors, Proxies, foreign scripts and hostile host input. No debugger pause
or instrumented trap ran. Strict type-aware lint and TypeScript pass.

These are synthetic/source results. No connected worker gate or publisher
qualification, finite-effect execution or additional SDK-method coverage is
claimed.
