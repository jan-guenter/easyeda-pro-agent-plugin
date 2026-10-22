# First-String finite effects and startup completion

This source-only batch adds an original-owned move collector, a fixed startup
marker reader and an original-packet finite-effect report. They do not dispatch
create or Save. The collector is integrated into the private fixed native
protocol; lifecycle integration is separate.

The aim is a finite, attributable operation, not a claim that every browser
timer is absent. A rendering timer can remain active without modifying source.
Conversely, an empty worker map cannot rule out a queued result that will start
another worker. The original producer and its destination must be identified.

## Move closure

`CurrentPcbStringMoveRunner` makes twelve fixed requests through its original
PCB source/frame owner. It qualifies the original Save wrapper and handler,
selects `eL`, checks its exact source/location and freshly acquired scope, reads
its four retained fields and the original handler's startup flags, then releases
its own group. There is no selection, timer cancellation or callback execution.

The report preserves timer, selection count, builder and command separately.
`eL` leaves its selected array populated after normal completion. Empty visible
tools do not replace this closure observation; a retained selection does not
prove a running timer. All four fields must be empty for the narrow
`noRetainedMoveState` relation. That relation describes one sample, not continuous
input exclusion or complete producer coverage.

Exact raw move and startup reply texts are retained together on success, and
each received raw reply is retained on failure.
Original issuance is private. Copies, cross-runner substitution, overridden
`requireOriginal` methods and recovered-looking owners cannot recreate it.
Owner loss is sticky. Failed requests consume the attempt and cleanup still
targets the original group without reattachment or replay.

The worker collector applies the same arrival-time retention to each of its
seven fixed samples. Later owner refusal preserves the received immutable text;
a mutating owner callback cannot replace it with altered transport data.

## A concrete route for the unretained ratline timer

The installed PCB asset is `pro-pcb/3.2.193.682ed44e/js/pcb.js`,
10,976,299 bytes, SHA-256
`217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33`.
All offsets below are zero-based UTF-16 offsets, not UTF-8 positions.

The original initializer at about10,848,600 computes:

```js
Oe = !isPreview && docType === 3 && !La.unRebuildRatline && d_.userWorker && !unActive
```

It stores `tl.multiThreadingOnOpen=Oe`. If true, it creates a ratline worker,
awaits one `rebuildRatlineInWorker` RPC and sets
`tl.rebuildingRatlineInWorker=true`. The later model build sets
`tl.modelIsBuilt=true` and `tl.controllerIsBuilt=true`. Source inspection found
only the initialization default and `ARt` assigning rebuilding to false.

`k3e` at6,439,976 is134 bytes, SHA-256
`a2f4ccf5f4ba6553aa23b3fbf67647c94124ce8e857cbac38a88c435d27eafb5`.
It schedules one callback. If the model is not built, that callback schedules
one replacement after50ms; otherwise it parses the retained payload and calls
`ARt`. The timer ID is not retained in a reachable holder. Repeated empty
snapshots cannot prove this chain ended.

`ARt` at6,440,110 is837 bytes, SHA-256
`4eda70872376545740c0de153603688f69cf11f0f6aec85aad01218aee5f4962`.
It deletes the named worker, calls `Xh.input(ratlineRes)`, updates network views,
enables compiler pulling and clears the rebuilding flag. It can then publish
`flushService`, `DelayCopper` and `hideLoading`, and calls
`FP.getInstance().startPcb`. Even an empty ratline array reaches that last call.
`FP.startPcb` sets `openPcb=true` before invoking its configuration-dependent
dynamic-copper path. The rebuilding flag alone is therefore too early to claim
all effects finished.

The worker source is `pro-pcb/3.2.193.682ed44e/js/ratlineworker.js`,
4,053,803 bytes, SHA-256
`680303776406ddc95790540c79683c3eefa7c236613b5a508901801e047c5c8f`.
Its startup handler slice4,047,158–4,048,814 is1,656 bytes, SHA-256
`ee585e63127df198171839030c9eb99fd41224292977ac4769bf259e0dd7ee83`.
This is research evidence, not a newly admitted external compatibility pin.

For each invocation with a world, that handler schedules one async callback.
It gets the selected canvas through the project channel, builds its own model,
awaits its subordinate worker, deletes that worker, and publishes exactly one
`ratlineResultFromWorker` JSON payload. The work loop precedes the publication;
there is no retry or loop around the publication. The distinct
`rebuildSubRatlineInWorker` handler returns a JSON result rather than publishing
this topic. This limits the original startup invocation, not foreign publishers.

A workable completion path is therefore:

1. Retain the original initializer inputs and its one startup-worker creation,
   source/context and RPC. This must begin during opening, not after the worker
   has already disappeared.
2. Bind that worker's native message bridge and its sole result to the original
   PCB receiver. Retain exact empty `ratlineRes` and the original worker ID.
   Same channel names, function bodies or supplied JSON are not this proof.
3. Require model/controller built, original multithreaded branch true and
   rebuilding false. Also require the original FP owner has `openPcb=true`, no
   dynamic worker/bus/timer, no deferred flush and complete empty worker maps.
4. Reprove the complete empty target/source and original parent context before
   creation. Keep channel/subscriber exclusions through the dispatch interval.

This discharges one known timer chain through source-defined completion effects;
it does not require an impossible inventory of browser timers. The newly added
`CURRENT_PCB_STRING_STARTUP_STATE_FUNCTION` reads all seven raw `tl` booleans
through own descriptors and effect checking. Its route classifier distinguishes
model-not-built, pending, single-result-terminal-compatible and
no-startup-worker-compatible. Compatibility is not completion proof.

An alternative source branch uses `unActive=true`, making Oe false before
opening. It would still need original opening-argument proof, subsequent
activation semantics and exclusion of all other result publishers. It is not
implemented by toggling private `La` or `d_.userWorker` values, weakening active
editor checks, or assuming an isolated profile. A fresh process alone can still
share BroadcastChannels and existing-profile upload caches.

## Hidden receivers, publishers and destinations

The four source-qualified worker arrows still hide lexical `this` from the
inspected V8 metadata. Method identity and membership in `PROJECT` do not prove
which receiver was captured. A solution must retain the original construction
and dispatch relationship, or prove an equivalent destination restriction.
Calling the callback to discover its receiver would itself execute effects.

The publisher chain also reaches native BroadcastChannel postMessage and
self-delivery. A matching name or class is insufficient. The initial route
needs native peer/receiver ownership and all producer paths able to publish to
that target. `canWsPublish:false` does not disable cooperation, which has its
own gate. Empty buffered-upload fields do not prove completion because they
are cleared before the awaited upload returns. QA timer/resolver fields are
retained after completion and are not treated as perpetual pending work.

`inspectCurrentPcbStringFiniteEffects` now joins the original current move and
worker packets, not supplied JSON. It reports five necessary observed relations
and their named failures, preserving unresolved provenance separately. The fixed
destination envelope requires the one STRING and modeled selected-PCB history,
selected structure clock, branch/project bookkeeping and exact SQL allocation.
Every other record, structure row, FONT/BLOB and SQL cell remains unchanged.

Before dispatch it excludes foreign project/branch receivers, cooperation and
cloud publication, persistent upload/replay caches, unreviewed subscribers,
dynamic-copper and custom-footprint Save participants, and operation-triggered
global-profile or filesystem writes. Startup profile effects are a separate
baseline question. Full closed SQL cannot retroactively undo an external
request or prove that an unobserved destination was never touched.

No report issues writer authority. The original startup/native-channel path,
callback construction ownership, complete publisher/destination restrictions,
actor/clock provenance and one-create/one-Save/full-SQL/reopen lifecycle remain
actual implementation requirements, not optional tests. Root's latest common
reader watchdog is independent; its live timeout cause has not been established.

## Verification

Twelve focused move/startup tests and seven worker collector tests pass on
Node24.18.0 with the test-isolation preload. Full server/bridge-stub typechecking
also passes.
They cover original packet identity, sticky owner loss, partial failure and
cleanup, active move state, arrival-time alias changes, later prototype
replacement, finite-effect joining, startup branch semantics and
fixed wire/native program parity. The twelve-phase native state machine seals
the original session/context, consumes requests before sending, rejects changed
programs and reordering, and releases only its original group. The private String
request ceiling is237; the diagnostic-only ceiling remains103.
The worker join uses the maintained real synthetic V8 responder. The startup
reader executes under actual inspector `throwOnSideEffect:true`, including a
Proxy refusal without triggering traps. Strict type-aware lint reports no
warnings. No native/live request, full vendor-bundle execution, production-design
access, pin refresh, build or release was made by
this subtask.
