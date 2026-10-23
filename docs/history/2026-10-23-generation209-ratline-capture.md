# Generation209 ratline startup source and finite-role model

This is source-only work for the application installed on2026-10-23,
`3.2.209.8a704eab`. It does not change the admitted compatibility tuple, enable a
native diagnostic purpose, or call EasyEDA. No project files were read.

## Primary sources and checked locations

The sources are complete JavaScript assets under the configured application's
`assets` directory. Their versions differ from the previously reviewed
`pro-pcb/3.2.193.682ed44e` assets. The verifier records exact bytes and each slice
in [the generation209 source profile](../../plugins/easyeda-pro-control/server/src/current-pcb-209-ratline-source.ts).

| Asset | Bytes | SHA-256 |
|---|---:|---|
| `pro-pcb/3.2.195.6b67774e/js/pcb.js` |10,991,441|`a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b`|
| `pro-pcb/3.2.195.6b67774e/js/ratlineworker.js` |4,058,748|`011f5a8e2b9f4ce4bb4ffd9ea5eb288ec4a2f292473bf7fd023bbc8cf14901d3`|

The following half-open offsets count UTF-16 code units. They are not UTF-8
positions or unverified breakpoint locations. Acorn8.17.0 parsed the complete
assets to identify the function, class or registration boundaries.

| Source | Owner or operation | Start | End |
|---|---|---:|---:|
|PCB|`ec` startup state|3,224,476|3,224,597|
|PCB|`Let` WorkerMessageBridge|13,743|14,205|
|PCB|`Ew` worker manager and factory|6,443,331|6,444,552|
|PCB|`z3e` model-readiness timer|6,447,160|6,447,294|
|PCB|`kRt` result handler|6,447,294|6,448,115|
|PCB|`ratlineResultFromWorker` subscription|6,992,856|6,992,906|
|PCB|Original initializer callback|10,861,543|10,866,599|
|Worker|`EY` WorkerMessageBridge|4,822|5,281|
|Worker|`Db` subordinate worker manager|3,969,183|3,970,058|
|Worker|`workerName` subscription|4,051,743|4,051,792|
|Worker|Startup RPC registration|4,052,103|4,053,758|
|Worker|Sole startup result publication|4,053,736|4,053,751|

All twelve slices and both complete sources passed the verifier against the
installed inert assets. Full source equality and per-slice equality are separate
reported checks. These research hashes do not establish native context ownership
or grant external compatibility admission.

## Changed startup state

The new `ec` object has six booleans: `useWebgl`, `multiThreadingOnOpen`,
`needFlushService`, `modelIsBuilt`, `controllerIsBuilt` and `engineHighlightReady`.
The complete new PCB asset contains no `rebuildingRatlineInWorker` spelling.
The older seven-field observer and terminal condition in the
[previous finite-effects record](2026-10-21-current-pcb-string-finite-effects.md)
cannot be reused by changing only a bundle hash. The new `ec` slice and `kRt`
slice above establish this change.

The original initializer still computes the worker branch from preview=false,
docType3, unRebuildRatline=false, userWorker=true and unActive=false. It assigns
`ec.multiThreadingOnOpen`, creates a named PCB ratline worker and awaits one
`rebuildRatlineInWorker` RPC with the selected world. That RPC acknowledges
scheduling, not completion of the later ratline work.

## Exact role and message relationships

The PCB `Ew.addWorker` source creates the native Worker, stores it in its registry,
constructs a `Let` bridge using the PCB message bus and that Worker, publishes
`workerName`, retains the bridge and increments its own numeric allocation ID.
The bridge constructor installs a native worker onmessage arrow that calls its
retained receiver's `processRemoteMessage`.

The ratline bootstrap constructs its own `EY` bridge over `self` and subscribes
to `workerName`. The startup handler schedules one async callback. That callback
gets the selected canvas through a project BroadcastChannelMessageBus, loads
the compiler/model, creates a new `Db` manager and always allocates one subordinate
ratline worker. An empty input still creates and initializes the subordinate.
The distinct `rebuildSubRatlineInWorker` service has an early empty-input return;
that branch does not describe startup. These facts come from the startup service
slice and the following distinct service in the complete worker asset.

The subordinate gets one `ratlineEnviromentInit` RPC, then one
`singrebuildRatlineTopic` RPC per generated work item. After the loop, startup
deletes its subordinate and publishes one JSON string with ordered fields
`ratlineRes` and `workerName`. The startup callback has no retry around that
publication. The numeric subordinate and startup IDs belong to different
registries and can both be0. They are not globally unique role identities.

The PCB subscriber passes the payload to `z3e`, whose unretained timer reschedules
after50ms until the model is built. It then calls `kRt`. The handler deletes the
startup worker, imports ratlines, updates network views, enables compiler pulling,
publishes flush/loading/copper topics and calls `GP.startPcb`. Calling startPcb
sets its open flag before a configuration-dependent async copper path settles.
An empty result, absent worker or open flag alone therefore proves no callback
completion or empty destination set.

## Implemented comparison groundwork

The new [generation209 model](../../plugins/easyeda-pro-control/server/src/current-pcb-209-ratline-model.ts)
validates strict supplied semantic milestones for the empty-ratline branch:
initializer, startup creation and entry, subordinate creation and settlement,
result publication, result receipt and terminal handler return.

It compares selected world, target/session parent relationships, registry-local
worker IDs, bridge aliases and exact empty result bytes. It rejects skipped,
duplicate or extra milestones, a foreign receiver, a changed result, nonempty
work and the removed rebuilding flag. Proper prefixes remain incomplete and
report their next milestone. This is a semantic order for a prospective capture
protocol, not an assumed total ordering of events arriving from multiple CDP
sessions.

Every input is supplied comparison data. A caller can describe events that never
happened. Consequently every output retains originalNativeOwnershipVerified,
startupCallbackCompletionVerified, completeLiveBaselineVerified, saveAuthorized
and executionAuthorized=false. The implementation creates no original-owner
token, native sender, breakpoint, pause or resume endpoint. It changes none of
the existing worker-startup budgets or event rules.

## Required runtime capture before integration

The future combined purpose must begin before the original initializer and
retain both native Worker/bridge constructions. It must separately associate
the native worker object with the original source-qualified target, context and
creation parent. Matching names, URLs, target IDs or supplied bridge aliases do
not replace that association.

Capture must bind the original project-channel canvas receiver, startup request,
workerName delivery, subordinate initialization and result publication to those
roles. The PCB receive path and terminal handler need their own original retained
events. Callback inspection must not invoke callbacks to manufacture evidence.
Other publishers and configuration-triggered destinations remain exclusions.

The six new flags cannot replace the removed completion flag. A terminal capture
must account for `GP.startPcb` and its async copper branch, then join the complete
stable PCB/common/source/SQL baseline. Normal worker destruction needs attributed
completion. Lost replies, late breakpoint allocation and one-shot pause cleanup
must stay attached to original ownership through process/Job termination.

These are implementation requirements. No new runtime capture is implemented in
this batch, and no new source or role is admitted by the existing startup owner.

## Verification

Nine focused tests pass on Node24.18.0 with the private test-isolation preload.
They cover valid supplied traces, all prefixes, duplicate and missing milestones,
foreign parents/worlds/receivers, exact payloads, removed flags, pending effects
and accessor-backed input refusal. Whole-source positive checks used only the
two installed inert JavaScript assets; the portable test suite does not require
those private installation files. Full server/bridge-stub typechecking passes.
Strict type-aware lint on all three new TypeScript files reports zero warnings.
No build, compatibility refresh, native request, application launch or connected
validation was performed by this subtask.
