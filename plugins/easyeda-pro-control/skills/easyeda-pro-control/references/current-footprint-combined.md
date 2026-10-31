# Combined original main and project-worker validation

Use this route when developing the footprint writer and both original main and
renderer ownership must belong to one launch. It is disposable validation only.
It exposes no copy, delete, backend request collection, document-clock arming,
explicit Save or saved-result verification.

Discover `easyeda_control_api` action `footprint-combined` with
`query:{includeSchemas:true}`, then validate each exact inner request with
`footprint-combined-validate`. Send it through
`easyeda_control_pcb209_worker_startup` as
`{request:{action:"footprint-combined",request:{...}}}`.

Start a new `footprint-combined-*` operation. Launch requires
`confirmValidationOnly:true`, `confirmDiagnosticLaunch:true`,
`acceptExistingProfileEffects:true` and `acceptDebuggerPauseEffects:true`.
The purpose is sealed before the original process starts; an old main,
renderer, preparation or saved owner cannot be converted. Existing-profile
startup and opening may restore tabs, use the network, migrate or persist files.
Use only an explicitly identified disposable project.

The current combined purpose requires a private challenge-matched helper-ready
packet before writing its launch request. If the original factory observes its
own helper close with zero input and no launch invocation, it can publish
`factory-before-launch-failed`. This proves application non-dispatch for that
attempt. It does not prove native-resource release or qualify an older failure.
An unclosed helper remains reserved. Inspect after a failure; never infer a
terminal state from stderr, a timeout or an absent window.

After a combined attempt is durably terminal and its reservation is released,
a new `launch` may allocate another combined coordinator in the same facade.
No startup call may remain queued or active. Inspection retains the previous
coordinator, and the old operation ID remains consumed. This does not convert
an owner or retire an unknown/live generation.

## Observe in order

1. Retain the launch's binding digest. Call `observe-main-construction` once
   and require its published, source-qualified successful result. The native
   owner binds the main inspector to its original stderr, root/Job/image handles
   and reciprocal TCP connection. A URL, PID or old receipt cannot replace it.
2. Inspect the browser and current frames, then qualify the exact UI script.
   Use the returned target/frame identities, never historical ones. Before
   `capture-project`, `observe-saved-cache-native` may be called once with the
   same original binding. It requires all three prerequisite results to be
   published and consumes a durable intent before reobserving the original
   parent/frame and any ancillary DOM owner. Preflight reserves ten existing
   discovery IDs: up to four ownership observations, five fixed metadata reads
   and one object-group release. It retains the original `CacheStorage` constructor,
   prototype and `match` descriptor identities, complete bounded metadata and
   the browser engine tuple. It invokes neither `caches` nor `match`. The result
   is unqualified evidence for later profile review: no native-match
   qualification, saved-generation replay token or execution authority is
   issued. Do not repeat it after any refusal or missing reply.
3. Call `capture-project` once with that original binding, exact disposable
   target/checkpoint and all required opening/debugger acknowledgments. Main
   construction must already be published. Follow
   [worker startup](current-pcb209-worker-startup.md) and
   [the route preparation](current-footprint-copy-preparation.md#original-worker-and-callback-route-preparation)
   for the retained constructor and peer guards.
4. The original pending handshake permits one parent continuation. Its four
   instrumented cache-open pauses must qualify and resume before the message
   receipt's two-second leaf wait starts. This waits for the original native
   work; the agent invokes no Cache.open and consumes no later result/join proof.
   A pending token, continued parent or cache settlement is not peer proof.
   Require the actual trusted receipt and listener removal.
5. Only after successful capture, call `observe-current-assignments`,
   `observe-actor-clock`, then `observe-footprint-route`, each once and with the
   same operation and binding. A refusal leaves later stages unavailable.

The main and renderer channels share one original kernel generation and absolute
lifetime. Their protocol IDs are independent, and the main construction/request
collectors share one main allocator and event cursor. The budget distinguishes
global IDs from cleanup-class commands; a cleanup command still consumes an ID.
Consult the discovered profile for exact limits. The future four-generation
copy/readback/delete/readback reservation is incomplete and refuses authority.
Do not supply caller programs, capabilities, clocks, budgets or reconstructed
ownership packets.

## Inspect and close

After uncertainty, inspect without repeating the stage. Bounded main diagnostics
retain the metadata role, locally issued failure reason and schema paths without
raw values. The optional native-cache probe retains complete raw descriptor
replies up to32KiB each and192KiB in aggregate, with phase, index, byte count and
hash. Its original replies remain private; failure inspection grants no replay.
Worker diagnostics retain cache step/failure, command and pause
counts alongside the parent and peer states. A constructor index is the last
accepted pause, not evidence that a later pause is held.

For ordinary closure, observe the original window, request normal close once,
then separately observe original root exit and an empty Job, release the helper
and inspect. Keep any Save/Discard prompt unanswered unless actually authorized.

For main/combined owners, normal close first releases the observed main object
group and detaches its original inspector socket. This requires acknowledged
resume, removed breakpoints and no pending reply or active origin. It issues no
extra resume. A provably never-attempted attachment needs no detach; ambiguous
attachment or cleanup refuses. The once-only close attempt stays consumed on
error. Process, Job and stdio handles remain retained until actual termination
and final release. Detachment does not prove that normal close will finish.

When force termination is authorized, use `abort-generation` with the original
binding and `confirmAbortOriginalCombinedJob:true`. The lifecycle durably consumes
the abort intent before requesting termination of this original Job. Missing
acknowledgment does not permit another abort. Normal work is blocked after abort;
retained exit observation, release and record settlement remain separate.
If publishing the abort intent fails, no native abort is dispatched. The logical
reservation still blocks normal work. Record settlement can publish those retained
bytes, but it does not grant another abort attempt. Keep the original owner and
report the need for separately authorized process recovery.
An abort acknowledgment is not exit, rollback, unchanged storage or proof of a
completed write. Any ambiguous future write needs complete closed-SQL effect
classification and its supported recovery before continuation.

Use `settle-records` only when fresh inspection reports
`publicationSettlementAvailable:true`. Preserve the original owner until cleanup
finishes. These observations prove neither complete application startup nor
request/clock/SQL completion, durable copying, supported inverse or production
eligibility.

## Relinquish an older unknown launch

`abandon-unknown-launch` is a separate historical action for the reviewed
installed223950 v1 producer's intent-only combined launches. It does not invoke
the old launch or reconstruct its ownership. Use a fresh facade before any
ordinary, native, main or startup coordinator is allocated. Even calling the
ordinary startup `inspect` first allocates a coordinator and prevents this path.
Offline API discovery and exact-argument validation can run first. In a fresh
Codex session, admit the actual root facade and finish this historical recovery
before starting subagents. Automatic connector initialization can create a
competing facade even when an agent makes no MCP call. A conflict stub is still
a blocker; never kill gateways or edit records to make the roster pass.

Supply the original operation ID and its `expectedIntentSha256`, plus
`confirmAbandonUnknownLaunch:true`, `acceptUnobservedDescendants:true` and
`acceptUnknownProfileEffects:true`. These acknowledgments must match the user's
authorized scope. The route requires the exact unchanged intent-only roster,
no other Linux facade, no other Windows PowerShell and two absent EasyEDA
samples. Another facade or a conflict stub blocks it; do not terminate gateways
or edit journals to pass the check.

If the absence check reports an application or PowerShell, finish its separately
authorized OS cleanup without allocating a plugin owner, then repeat only this
historical recovery action. Current209 exposes no unowned close/kill route. If
cleanup allocates a plugin owner, finish that cleanup and use another fresh
facade before relinquishment. Process cleanup is separate from accepting the
historical uncertainty; this action cannot kill or adopt a process.

The process-presence refusal's `assertionResults` contains only the validated
two-sample `otherPowerShellPresent` and `easyedaProcessPresent` flags. It returns
no PID, command line or process identity. An unrelated PowerShell process is
outside permission to terminate EasyEDA. Use separately authorized OS cleanup;
do not infer that every shell belongs to this plugin.

The route writes a separate digest-bound relinquishment receipt and preserves
the original directory. Its outcome remains unknown. It proves no non-dispatch,
termination, native-resource release, original launch identity, design effect or
persistence. A complete receipt relinquishes only that selected startup blocker;
all other launch and design gates still apply. A new disposable operation is a
new attempt, never a replay of the historical ID.

## Retained connected scope

Installed042605 passed the separate historical relinquishment, then one fresh
disposable combined main construction, project/worker capture, four cache-open
pauses, peer receipt/listener removal and callback assignments. Actor collection
completed all four coherent samples, but result publication refused a missing
combined-purpose entry in its generation classifier. The source correction adds
only that exact purpose and preserves packet, timing and byte checks. It does
not repair or replay the consumed historical stage.

Normal close acknowledged without exit. One authorized original-Job abort was
followed by retained root-exit/empty-Job proof and release. The entire closed
disposable fixture remained byte-exact. Those observations supply no copy/delete,
explicit Save, complete startup or saved-result proof. Historical results do not
admit a later payload. The [current batch record](https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/main/docs/history/2026-10-29-combined-recovery-and-native-clock.md)
retains the failure and its narrower conclusions.

Installed081309 was subsequently admitted as the actual host-owned facade with
complete packaged-file equality. One new disposable combined generation passed
main construction, project/worker capture, current assignments and actor result
publication. Four coherent UI/worker/worker/UI samples spanned38,481ms. Route
observation passed cache construction, manager-state comparison and producer
capture, then refused dependency capture because a later lexical class alias
was unavailable. The route was consumed and not repeated.

The correction retains all eleven original manager/common/project/bus
constructors at the source-qualified constructor point, then compares their
identities and qualified encoder ancestry. It adds no request IDs. This source
correction has no connected acceptance yet. Normal close acknowledged without
exit; one authorized original-Job abort was followed by actual retained root
exit, empty Job and release. Final inspection was released, not busy and had no
publication settlement pending. The whole closed disposable fixture remained
byte-exact. These observations supply no copy/delete or saved-result proof.
The [following batch record](https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/main/docs/history/2026-10-29-footprint-completion-owner-and-route.md)
retains the new actor result and route refusal separately.

## Separate caches accessor diagnostic

`observe-saved-cache-accessor` is a distinct optional pre-opening diagnostic,
using the original combined owner after published main construction, browser and
source-qualified UI observations. Its exact operation arguments are the operation
ID and current binding digest. Discover and validate the action offline first.

It reserves eleven existing discovery IDs before dispatch: up to four original
parent/frame and ancillary DOM checks, six fixed metadata reads and one object
group release. A fresh five-slot tuple retains the CacheStorage constructor,
prototype, match function, the global `caches` getter and descriptor baseline.
The getter descriptor must be an own accessor with no setter. The tuple and
original descriptors are rechecked after all three complete function metadata
reads. No constructor, getter or cache method is called. The native codec accepts
only these seven fixed commands under the original combined or private forward
purpose. The legacy six-command diagnostic and353-ID saved execution purpose
remain separate and unchanged.

Intent publication consumes the attempt before native dispatch. Inspect after a
lost reply. The original runner releases its group even after a failed read,
while uncertain cleanup still requires original process/Job termination and
release. Returned metadata keeps native getter qualification, match
qualification, replay-token issuance and execution authority false. This path
exists to acquire the missing engine-specific getter roster. Historical JSON
cannot recreate its original handles or qualify a later saved generation.
Actual native execution of this new diagnostic remains unvalidated.

## Private groundwork and remaining integration

Installed095000 subsequently passed a fresh original main/worker/cache/peer
capture, assignments and four coherent actor samples. Dependency capture
progressed past the missing-alias check and refused an incorrect receiver
resolution assumption. The pinned worker has a real `ja.parseFull` override.
Source qualifies that override and its `zy.parseFull` superclass separately,
while keeping arbitrary shadows refused. Current preparation reserves
593 normal, 34 cleanup and 627 total commands; the combined renderer reserves
811 normal, 45 cleanup and 856 total. Original main construction also captures
and qualifies the pinned `rl` timestamp parser. Its extra metadata read brings
main capacity to 42 normal, 13 cleanup and 55 total commands. These are source
budgets, not acceptance of a connected execution.

The consumed095000 route was not retried. Original normal close, one authorized
original-Job abort, actual termination and release completed. The closed
disposable fixture stayed byte-exact. This is not acceptance of the corrected
dependency or destination reader. Its [batch record](https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/main/docs/history/2026-10-29-footprint-create-scheduling.md)
retains the original failure and source correction separately.

The private clock/RPC integration joins original worker construction and UI
registration leases through the same retained combined native owner. A one-way
handoff replaces the original transport subscription with one paired router,
allocator and event cursor. Its fixed unit uses49 normal and18 cleanup commands.
All67 commands consume global IDs. A conservative preflight reserves up to69 IDs
for original group handoff and the unit, entirely within the existing normal-ID
ceiling784. The source-qualified parser override and three destination classes
add exactly four reads to the prior780-command normal allowance. This does not
reserve a whole writer.

Fixed native begin/send/retire actions retain the original two sessions, consume
before possible pipe writes and exclude other normal renderer/main sends while
active. A failed or incomplete phase needs original retained root exit and an
empty Job before retirement; a close or abort acknowledgment is insufficient.
This private integration exposes no public clock invocation action. Its actual
origin/router and embedded document-clock execution remain unvalidated. The
full writer still needs every other unit, output/control bounds and generation.

The execution transport now transfers its same already-qualified complete
project-source string to the exact new construction runner before capture.
It adds no fetch, request or await; successful and failed handoff clear the raw
transport reference. This does not grant invocation authority. The fixed native
clock encoder is embedded under the unchanged1MiB helper cap. Additional existing
fixed programs use the maintained strict packing decoder with byte-exact source
parity. The preceding installed helper passed actual Windows combined-flag
CompileOnly without an application launch; the new fixed codecs and native phase
accounting have inert C#5 compilation/smoke coverage. Source qualification,
compilation and synthetic joins do not prove connected origin/router or embedded
Electron execution.

The original main request collector can select a held-final-PB schedule before
invocation. Its prefix uses 23 normal and 7 cleanup commands, removes all four
request breakpoints and resumes only the first three pauses. The fourth remains
held after the request/actor/fulfilled SQL-owner joins. A separate unmounted
fixed completion sequencer uses 45 normal and 30 cleanup commands for fourteen
ordered source-qualified callback/branch/transaction/project-update/service
joins. Together these main portions use 105 commands; this is not the entire
combined writer budget or a mounted native-purpose reservation.

The fixed completion codec now embeds48 exact native variants with flat scalar
parity. Its maximum CDP body is9,412 bytes with all supported handle maxima, below
the16KiB main envelope. A genuine private completion issuer now transfers the
exact held-PB lease atomically before any native advancement. The old collector
loses held authority, while the original kernel, channel, allocator, cursor and
root/Job remain bound. Fixed native completion begin/send/retire is implemented.
The current observation profile reserves 42 normal and 13 cleanup commands,
55 total. It refuses the75-command completion unit plus the final construction
release before the held lease can transfer. The known main stages need at least
87 normal and 41 cleanup commands, 128 total. That partial lower bound is neither
a complete writer reservation nor a reason to enlarge an existing profile.
Connected completion execution remains unvalidated. The selectors admit
missing-header and locked or aged append paths. Fresh unlocked mutable history refuses, and first-header
append support does not qualify new-document lifecycle. A future writer must
prove branch/header eligibility before dispatch; refusal after mutation supplies
no pre-write safety. Completion observations keep SQL durability, publication,
saved-result and execution authority false, including after post-await joins.

The distinct private create/clock unit uses68 IDs,50 normal and18 cleanup,
with exactly one native create at offset13 after arming. It retains either the
original early reply or one exact original pending reply across clock retirement.
Old renderer sends remain unavailable afterward while original main collection
can continue. Fixed native encoding, request accounting and complete escaped
input preflight are implemented, but every existing native birth purpose
rejects this unit before beginning. No validation owner can upgrade into it.

The private paired scheduler composes the actual main, clock and completion
runners in that order. Its separate late request mode reserves the maximum
escaped native envelope from the original copy projection before main arming.
After both genuine paired-clock samples, it binds their exact ordered upload
body through the same original combined owner. The known-plan mode still
requires its exact body before arming. These are private source capabilities.

The scheduler now has a separate private pre-await allocation mode. A fixed
breakpoint after native UUID allocation and before its first `qe` call captures
adjacent `buildString`, `create` and the exact generated invocation wrapper.
Descriptor joins compare the same original argument object, five retained
construction handles, eight methods and consumed original invocation lease.
The emitted destination UUID can then feed both genuine clock producers.
Known-UUID mode remains separate and unchanged. Equal JSON or an ordinary
same-manager call cannot issue this custody.

The allocation observer adds seven normal and three cleanup commands, raising
this create/clock minimum from68 to78. Its strict grammar, collector and private
scheduler composition, fixed native encoding and78-command request ledger are
implemented and source-tested. The allocated unit has57 normal and21 cleanup
commands and exactly22 event slots. Its create is at offset14; the separate
known-UUID68-command unit is unchanged. Existing native birth purposes still
reject its first arm before dispatch. Connected allocation/clock/main execution
remains unvalidated. Focused tests cover the real allocation collector with
explicit synthetic issuers and the existing known-UUID clock/scheduler path;
they do not establish a complete allocation/clock/main generation. Neither the
new lease nor an allocated UUID supplies whole-writer authority.

The private fixed create invocation also retains the original asynchronous
observer's scope, fourteen-object roster and three upload callbacks. Immediately
before calling native create, it synchronously rechecks those identities, empty
task/cache/upload collections, false upload flags and null timer/promise/resolver
state. Collection receiver-brand checks use fixed native methods and a facade
rejection callback; they do not read size getters or caller iterators. Changed
state refuses before the native call. This guard does not freeze vendor work
across later awaits, observe detached cache cleanup, qualify the history head or
mount a writer purpose. The fixed envelope has ten arguments and accepts no
caller programs, callbacks or free-form prewrite handles.

A separate source-derived forward-only reservation now covers two generations:
renderer935 normal/61 cleanup/996 total commands, main127 known-minimum commands,
helper stdout, events, raw replies, SQL snapshots and failure journals. The
actual private coordinator now spends its result/artifact/journal ledger before
callbacks; normal failure leaves only bounded cleanup publications. These
counters neither authenticate a caller-supplied owner nor mount a native writer.
The existing coordinator now consumes the original allocated paired scheduler,
its exact returned create packet and paired samples. Closed SQL must match both
document clocks, the main history UUID and project timestamp. Qualification
failure retains the armed schedule for cleanup after original exit. A genuine
forward factory must still join the allocated unit, current source/head/dependency/
empty-queue eligibility and saved-generation replay exclusion
before any write. Four-generation copy/delete/readback capacity remains
unreserved. A native create result can precede the buffered backend upload;
neither an early acknowledgment nor waiting for it proves SQL completion.

Installed161500 subsequently reached the UI registry compound guard after61
dependencies and31 destinations, then closed through its original Job with
byte-exact disposable storage. Source investigation found preload creates the
registry before UI defines its separate class. The fixed route now qualifies
that exact preload constructor, methods, lexical Block/Closure scopes and shared
map/original notification receiver; original Map guards remain strict. UI
observation/reproof budgets are39/11, preparation49/21, and the existing execution
preparation ceiling is now 811 normal/45 cleanup/856 total. This source correction
still needs connected validation. See the [batch record](https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/main/docs/history/2026-10-29-native-allocation-and-window-capture.md)
and [source finding](https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/main/docs/history/2026-10-29-preload-registry-source-qualification.md).

Pure delete models retain the originally copied UUID, require the complete
supported SQL inverse and compare an independent saved reader. The inverse
appends a tombstone and preserves history; it does not restore database bytes.
It supports locked or independently aged heads. A fresh unlocked copy needs
another supported model or an aged-head qualification. These models prove no
native manager deletion, replay exclusion, actual reopen or writer lifecycle.

A dormant fixed delete-trigger grammar now captures nine original method/getter
references, checks own project/branch/client/live-target/ticket scalars without
invoking native methods, and fixes one original `Tg.deleteData` invocation. Its
eleven-constructor vector binds original project and bus ancestry. The pinned
entry producer creates the target's own UUID before folding metadata. A flat
scalar wire and three-variant C#5 encoder forward no caller program or session.
There is no genuine inverse origin, consumed journal dispatch issuer, single
actual delete-clock collector or native helper mount. Scalar preflight is not
complete dependency eligibility. Native success remains only an acknowledgment,
because `deleteData` ignores a false `uploadLocal` result.

Before mounting a writer, validate the private original-owner clock/router path
and the implemented genuine completion issuer, atomic held handoff and native
completion phase. Derive the reservation for
all four copy/readback/delete/readback generations, including request IDs,
normal/cleanup categories, native message/output limits and idle/exit/empty Job
joins. Preflight the 16KiB main request envelope even when a source reader
permits 2MiB. Complete worker parser/upload/renderer publication and native SQL
completion, then independently compare closed complete logical SQL, history,
backups and unrelated content. Prove actual reopen/saved copy and supported
native delete/saved absence through their independent owners. A SQL commit can
precede a later failure; neither an upload acknowledgment nor a post-await
observation establishes durability or unchanged storage.

The forward resource ledger now charges renderer data/idle/wait polls separately,
main normal/cleanup polls and every main WebSocket frame, including empty control
frames. Renderer event count/per-frame/total bytes are charged independently.
These finite counters use existing caps and original role references; a future
native factory must feed them from its actual captured traffic. They do not
mount that factory or prove pre-write eligibility.

The private saved-generation queue program has a separate pinned209 Start Page
guard; the generic206 observer remains unchanged. Exact209 UI/backend source
establishes its field and page-version assumptions. A separate diagnostic has
observed constructor/match metadata; the accessor diagnostic can now collect the
missing getter roster without invoking it. These released diagnostic groups do
not qualify the original getter/match in a fresh saved generation. The old queue
program still reads those globals directly, so a stable substitute can fabricate
absence. Native cache ownership and replay exclusion remain concrete blockers
before any saved writer lifecycle is mounted.
