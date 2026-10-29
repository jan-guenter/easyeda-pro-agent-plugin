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
   Use the returned target/frame identities, never historical ones.
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
raw values. Worker diagnostics retain cache step/failure, command and pause
counts alongside the parent and peer states. A constructor index is the last
accepted pause, not evidence that a later pause is held.

For ordinary closure, observe the original window, request normal close once,
then separately observe original root exit and an empty Job, release the helper
and inspect. Keep any Save/Discard prompt unanswered unless actually authorized.

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

## Private groundwork and remaining integration

The unmounted clock/RPC sequencer is written to join two actual document-clock
invocations through original worker tasks, selected UI callbacks, replies and
post-await values. Its derived unit is 49 normal and 18 cleanup commands. All 67
commands consume IDs from the original allocator; cleanup classification does
not remove ID usage or enlarge a native normal-request cap. The full writer
reservation must account for both limits, every other unit and all generations.

The execution transport now transfers its same already-qualified complete
project-source string to the exact new construction runner before capture.
It adds no fetch, request or await; successful and failed handoff clear the raw
transport reference. This does not grant invocation authority. The fixed native
clock encoder is embedded as an unrouted class in the 1,045,412-byte helper under
the unchanged 1MiB cap. Two existing opener programs use the maintained strict
packing decoder with byte-exact source parity. Actual Windows combined-flag
CompileOnly passed with no application launched. No original native owner issues
the clock origin or routes these commands. Integration still requires the exact
original UI registration and worker construction, paired realm routing, one
allocator/event cursor and retained native root/Job. Source qualification,
codec compilation and synthetic joins do not prove embedded Electron execution.

The original main request collector can select a held-final-PB schedule before
invocation. Its prefix uses 23 normal and 7 cleanup commands, removes all four
request breakpoints and resumes only the first three pauses. The fourth remains
held after the request/actor/fulfilled SQL-owner joins. A separate unmounted
fixed completion sequencer uses 45 normal and 30 cleanup commands for fourteen
ordered source-qualified callback/branch/transaction/project-update/service
joins. Together these main portions use 105 commands; this is not the entire
combined writer budget or a mounted native-purpose reservation.

Completion has a getter-only origin seam with no issuer or native codec. The
real owner must atomically consume or transfer the exact held-PB lease before
its first resume so that the old collector cannot remain held authority after
native advancement. Later checks must retain the same original kernel, channel,
allocator, cursor and root/Job. The selectors admit missing-header and locked or
aged append paths. Fresh unlocked mutable history refuses, and first-header
append support does not qualify new-document lifecycle. A future writer must
prove branch/header eligibility before dispatch; refusal after mutation supplies
no pre-write safety. Completion observations keep SQL durability, publication,
saved-result and execution authority false, including after post-await joins.

Pure delete models retain the originally copied UUID, require the complete
supported SQL inverse and compare an independent saved reader. The inverse
appends a tombstone and preserves history; it does not restore database bytes.
It supports locked or independently aged heads. A fresh unlocked copy needs
another supported model or an aged-head qualification. These models prove no
native manager deletion, replay exclusion, actual reopen or writer lifecycle.

Before mounting a writer, implement genuine origins, the atomic held handoff,
paired router and fixed native completion encoding. Derive the reservation for
all four copy/readback/delete/readback generations, including request IDs,
normal/cleanup categories, native message/output limits and idle/exit/empty Job
joins. Preflight the 16KiB main request envelope even when a source reader
permits 2MiB. Complete worker parser/upload/renderer publication and native SQL
completion, then independently compare closed complete logical SQL, history,
backups and unrelated content. Prove actual reopen/saved copy and supported
native delete/saved absence through their independent owners. A SQL commit can
precede a later failure; neither an upload acknowledgment nor a post-await
observation establishes durability or unchanged storage.
