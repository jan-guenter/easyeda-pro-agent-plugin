# Native PCB diagnostic validation

Use `easyeda_control_pcb_diagnostic_validation` only to qualify the separate
native diagnostic owner. It starts the reviewed application in its existing
profile, observes fixed browser/frame/script identities, and normally closes
that original process. Separate branches support a one-shot disposable project
opening followed by either direct-child worker inspection or a separately
admitted disposable PCB-frame opening and model observation. An already admitted
PCB frame can also supply model observation. None enables CAD editing.
Installed120717 retained `reason:"event-callback"` and `eventKind:"unknown"`
while its project-open request was pending. That identifies a refused event
callback, not the event name or whether opening completed. Original normal
closure, root/whole-Job termination and terminal helper release passed; the
closed disposable fixture remained unchanged. The case is consumed.
The source-derived navigation-policy corrections below have no connected
qualification yet. Earlier launch/browser/frame/source evidence and unchanged
fixture bytes do not validate project/PCB opening, worker or model samples.
Installed155927 subsequently returned a public project-open acknowledgment but
failed its prefix check. The original process was normally closed and released;
the closed disposable file remained byte-exact. PCB opening and model/worker
observations were not reached. Do not replay either consumed case.
The next source batch separates initialization-prefix checks from final blank-tab
checks and preserves the first fixed failure label. This is source-backed,
not a retrospective diagnosis of the lost original prefix error.
Older snapshots may lack this tool or the additional fields described below.

Existing-profile startup can restore projects, run extensions, contact services,
migrate data or persist preferences/cache. It is neither isolated nor guaranteed
project-free. A later observed Start Page is scoped evidence, not a guarantee
about startup. Use a disposable validation session, never a production-design
test. Keep the same Codex facade alive until original process/Job exit, helper
release and receipt settlement finish.

## Run the fixed stages

First query the offline contract and validate each assembled inner request:

```json
{"request":{"action":"pcb-diagnostic-validation","query":{"includeSchemas":true}}}
```

Use `pcb-diagnostic-validation-validate` with `query:{"request":...}` for argument
checks. These calls do not allocate a helper or grant execution. Live requests
below belong inside the diagnostic tool's `request` object.

1. `launch` takes a new `operationId`, `confirmValidationOnly:true`,
   `confirmDiagnosticLaunch:true` and `acceptExistingProfileEffects:true`.
   The facade supplies compiled installation/PowerShell identities. No caller
   executable, flags, path or hash is accepted. Existing or unresolved owners
   block launch. A failed or uncertain attempt must not be retried under a new ID.
2. Read `bindingSha256` from the result or local `inspect`. All observation and
   normal-cleanup actions require that value as `expectedBindingSha256`, with
   the same `operationId`. The digest selects the original retained record;
   it cannot recreate process ownership after restart.
3. `browser-observation` runs once and returns bounded browser version fields
   and the complete admitted target inventory. Select an unattached `page`
   target from that result. Do not select a worker by its URL or guess an ID.
4. `inspect-frames` takes that `targetId`. It attaches once, retains the original
   session/event handler and returns actual frame IDs with loader and parent
   identity. A frame ID is not necessarily its target ID.
5. For page script identity, `inspect-script` takes a `frameId` from that retained tree and exactly one
   `family`: `ui`, `pcb` or `public-api`. Choose the family actually loaded in
   that frame. The facade supplies the fixed versioned asset path, complete
   source hash and byte count. It checks the default context's unique ID and
   complete source, then rechecks target/frame identity. Only one script
   inspection is available for this generation. A missing family is not
   permission to navigate, attach again or try another family after consumption.
6. For the worker branch, `inspect-workers` requests a fixed direct-child worker
   attachment from the retained page session. It never pauses workers or adopts
   a worker from browser discovery. The returned inventory contains at most
   16 workers with opaque target/session IDs, without titles or URLs. An empty
   inventory is not proof that the application has no workers.
   If the session is on the Start Page, first use the optional `open-project`
   stage described below; opening is unavailable after worker discovery.
7. `inspect-worker-script` takes one `targetId` from that worker inventory.
   The facade binds the original child session, its unique execution context
   and the complete pinned project-worker source. It does not reuse a page
   frame/default-world contract for worker contexts. A missing or mismatching
   source ends this branch; no alternate worker selection or direct attachment.
8. `observe-worker-state` takes no expression or field selector. It takes one
   point-in-time sample using an immutable program with the original unique context ID and inspector
   `throwOnSideEffect:true`. Only own-data identities/flags, named queue counts
   and timer-presence labels are returned. It never invokes vendor methods,
   reads upload/design payloads, waits for tasks or clears queues. Treat counts
   as sampled diagnostics, not complete membership or a completion barrier.
   Do not disable the effect check after a refusal.
9. `observe-window` returns the original application's unique `hwnd`, or no
   usable window. `normal-close` additionally takes that observed `hwnd` and
   `confirmNormalClose:true`. It rechecks the window and sends one normal-close
   request. Never choose Save/Discard or force exit as part of this workflow.
10. Use `observe-termination` until it proves the original root exited and its
   entire Job is empty. A close acknowledgment or missing window is not that
   proof. Then use `release-closed`. Completion requires `state:"released"`,
   not merely `state:"terminated"`; durable receipt settlement may still be needed.

Normal closure may persist application data or display a prompt. Leave an
unexpected Save/Discard prompt unanswered and report it. Do not disconnect the
diagnostic pipe to close EasyEDA: Electron can quit when that pipe closes.

Each worker stage is consumed once. On the Start Page, no project worker may
exist: the pinned project manager creates it while opening a project. This
workflow supplies only the fixed diagnostic-owned opening below;
ordinary/bridge opening is excluded while the diagnostic owner is retained.
Do not use an unrelated opener, DevTools expression or manual project navigation
to manufacture reachability. Unsupported prerequisites require normal cleanup.
Worker diagnostics can also inspect a qualifying worker already present
within the authorized session; they do not authorize restoring production tabs.

## Optional disposable project opening

After `inspect-script` admits the top-level `ui` family, and before
`inspect-workers`, `open-project` takes the same operation/binding, plus:

- `target`: exact `rawWindowsPath`, raw-path SHA-256 `projectUuid`, existing PCB
  `documentUuid`, and `expectedSourceSha256`.
- `confirmDisposableProject:true` and `acceptNormalOpenEffects:true`.

The original lifecycle preserves a managed checkpoint, derives the default
branch and verifies undeleted PCB membership. It publishes one opening intent
before the fixed registration/preflight call. The original source/checkpoint,
native owner and intent are rechecked immediately before navigation. No caller
branch, function, method, context ID or checkpoint replacement is accepted.

The compiled function uses the pinned public project-open service. It requires
the exact registered local path and an empty editor. Opening can migrate the
file, replay cached work, restore tabs, change shared metadata and automatically
Save. It performs no explicit Save or document-open call. A result
`opened-prefix-observed` is only the public acknowledgment plus the operation's
`loadProjectCompleted` prefix; it does not prove restoration completion.
The prefix checks the initialized root/project/branch/format/history identity.
The source emits that event before the asynchronous blank-tab update; exact
title, tab and container-registry checks therefore run after acknowledgment and
again at the final check. Their requirements are unchanged. Results preserve
the first failing stage/code/substage separately from cleanup failure.

This project-only stage retains the original top-level UI frame and optionally
one pre-existing, unchanged ancillary child. The child must be `about:blank`
and its actual DOM owner must satisfy the source-shaped hidden resize-sensor
`OBJECT` contract. A URL alone or an iframe is not enough. Fixed owner/node
reads recheck the original backend identity and complete attributes before and
after project opening, before PCB opening, and during PCB observation.
The returned `ancillaryFrame` evidence explicitly does not prove the direct
DOM parent, private observer-registry ownership or continuous inactivity.
Do not manufacture this shape, remove the child, navigate it or relax the
check for an unsupported owner.

Only the selected project's same-document fragment
transition and the source-derived project-name window-title prefix are admitted.
The original product/version title must match the retained target; arbitrary
title changes are not accepted. Added/restored editor frames, a changed loader/default
context, unrelated URLs or full navigation stop the branch. Do not remove those
guards to accommodate an unsupported project. A failed or uncertain stage is
consumed, including its preflight; inspect and clean up without replay.

The root transition also accounts for bounded CDP scheduling, clearing,
same-document start and loading notifications. Scheduling is bound to the
selected root, exact selected URL, zero delay and script-initiated reason.
A pending start's loader token does not replace the committed root loader.
Browser and renderer notifications need not arrive in one total order; loading
counts do not prove editor readiness. The original full frame/target comparison
and source/context checks still decide whether the transition is accepted.

## Optional disposable PCB-frame opening

After accepted `open-project`, choose either this branch or worker discovery,
not both. `open-pcb` takes only the original operation/binding and
`acceptNormalOpenEffects:true`. It derives the PCB, project, branch and registered
path from the retained project-opening target. No replacement target or caller
code is accepted. It uses the fixed public document-opening service once and
does not dispatch an edit or explicit Save. Ordinary opening may still have
automatic effects. The retained pre-project checkpoint is historical evidence,
not a claim that the now-open file still has its original bytes.

An opening acknowledgment is not editor readiness. Continue with
`observe-pcb-opening`, using only that same operation/binding. This separately
consumed stage checks the exact new child frame and its DOM owner attributes,
admits the complete pinned PCB source and default execution context, then
observes native tab/document identity through the fixed UI program. It preserves
the original UI source/context; unrelated frames, navigation, mixed tabs,
replacement owners or conflicting identity refuse.

The child policy permits at most one optional initial blank commit followed by
one distinct PCB commit. It checks navigation type, reason, disposition and
pending-to-committed loader agreement. Exact initial-child context teardown is
allowed only before the PCB commit and must match its retained unique context
ID. Later context destruction, repeated commits and unrelated loading events
remain failures. Matching event counts are not completed-load evidence.

Only the complete accepted observation permits `observe-model-state`. The
composite's document identity must still match the original sealed PCB target.
Source admission alone, a returned tab ID or an iframe URL is insufficient.
Neither stage grants worker-discovery, editing, Save or saved-state authority.
Inspect retained outcomes after a lost or failed reply; do not repeat opening
or manufacture readiness with manual navigation. Original normal cleanup
remains available after failure.

## Separate PCB compiler-state observation

After `inspect-script` admits the `pcb` family in an existing disposable PCB
frame, or after the complete PCB-frame opening branch above,
`observe-model-state` takes only the original operation/binding.
It cannot be combined with worker discovery. Project-only opening by itself
does not establish this PCB-frame prerequisite.

The fixed inspector path selects the original `pcb/saveCompiler` callback,
checks its complete source/script location, and follows only its two bounded
V8 scope links. It never calls the callback or Save handler, pauses a debugger,
or accepts an object ID from the tool caller. Eleven fixed commands read and
release the private remote-object group. Effect checks remain enabled.

The composite contains four separate samples from the same original handler
scope and document identity:

- `compilerState`: main compiler, at most128 loaded footprint participants,
  and selected dynamic-copper flags/counts/timer markers.
- `pendingProducers`: upload-buffer counts, command/teardrop state and a local
  dynamic-copper worker/bus reference comparison. A matched local reference is
  not a CDP target association, project-worker binding or proof of liveness.
- `rawStrings`: at most16 root String-manager models, including text and raw
  identity, ordering, partition/group and base fields. Missing, undefined, null
  and zero remain distinct; models without a state watcher are not omitted.
- `rootInventory`: counts and presence markers for seventeen model managers,
  the board owner, panelization arrays and three spatial-index branches.
  Populated collections are accepted within fixed bounds. Root-tree/Set
  disagreements are reported, not silently corrected or treated as emptiness.
  Absent or undefined owners are diagnostic abnormal states, not empty models.
  Its `interaction` subset also reports the original tool chain, selection,
  selected controllers and secondary indexes. The ordinary idle chain is
  `$0 → m0e → Eh`; a fresh smart-dimension controller has an empty command,
  not a null command. Unknown active tools are labeled `other`, not treated
  as idle. Missing, undefined, null and present timer fields stay distinct.

These samples are not atomic. The String manager is not the whole PCB, and an
empty manager or zero root census does not prove an empty board. The census
does not cover every secondary index or active tool, geometry or complete
ownership. Ratline/network indexes and the latent move-callback closure remain
outside the interaction subset. A timer's presence does not prove it is pending
or completed. These fields do not establish writer readiness.
Unsupported models or over-budget
results refuse without truncation. The combined reply stays within128KiB.
No queue payloads are returned. This is not a complete pending-producer inventory,
queue barrier, saved-state comparison or writer/Save authority. The original
object group's release must succeed before the composite is accepted.

Two offline String models consume supplied observations without adding a tool
or write token. `current-pcb-string-empty-baseline.ts` reports named unmet
conditions for the first fixture, while retaining unobserved producer/source
requirements. `current-pcb-string-postcreate.ts` joins original inert plans,
a supplied create acknowledgment, raw zero-to-one String samples and one exact
publication. Even a matching relation leaves ownership, complete effect, Save,
rendering and persistence unverified. Do not treat these results as instructions
to call the dormant create program.

## Lost replies and failures

- `inspect` is local and does not replay native actions. Supply
  `observation:"browser"`, `"frames"`, `"script"`, `"workers"`, `"worker-script"`
  or `"worker-state"`, `"pcb-opening"` or `"model-state"` to retrieve one recorded or
  retained stage result. Check `busy`, consumed-stage flags, `resultRetained`
  and `published`; a failed response does not authorize another dispatch.
  The original owner also retains a bounded `nativeLaunchError` label and,
  after a proved failed creation, `createProcessError`. The latter is the
  immediately captured numeric Windows error, not arbitrary exception text.
  `nativeSendError` retains a bounded native dispatch label when available,
  without exception text or request payloads. It does not prove that no bytes
  were sent, and cannot explain older failures whose label was not retained.
  Older evidence may lack it; do not guess the failure cause from a generic
  refusal or an absent process. Cleanup proof retains the code when available.
  Opening status/results are separately retained on `inspect`; they never mint
  a new attempt.
- New snapshots also return `diagnosticFailureObservation` from the original
  retained owner. It records the first transport failure's fixed request
  method/phase/number, pending status, reason label and bounded event kind.
  Unknown event names become `unknown`; payloads and exception text are absent.
  This distinguishes a malformed reply from an event-policy refusal without
  extra protocol requests. It does not prove dispatch absence, authorize a
  retry or recover the cause of an older opaque failure.
  More known navigation and identity-loss event names now have fixed labels;
  adding a label does not admit that event or identify the older `unknown`.
- If publication failed, keep the original facade alive. When offered,
  `settle-records` takes the inspected `intentSha256` as `expectedIntentSha256`.
  It publishes only absent records from the original retained bytes. It neither
  repeats native work nor replaces conflicting or partial records.
- Navigation, detach, context loss, an unexpected pause or other protocol
  invalidation ends diagnostic inspection. Original-owner window observation,
  normal closure, termination observation and release remain the cleanup path
  when the helper protocol is still usable. They require local owner integrity,
  not bridge authentication or a fresh full installation admission.
  Only the sealed opening's exact title, fragment and child-frame transitions
  described above are exceptions;
  there is no general context reset.
- `cleanup-unlaunched` is only for offered original never-dispatched attempts.
  It takes `expectedIntentSha256` and requires proof that native launch was
  never invoked. An allocated helper must prove an empty original Job before
  release. An uncertain launch or factory failure without a returned owner
  cannot use this action.
- After a facade restart, historical `inspect` remains evidence only. There is
  no PID adoption, reattachment, diagnostic abandonment or journal-to-owner
  reconstruction. Do not substitute ordinary-launch recovery or delete records
  to clear diagnostic exclusion. Lost original handles require evidence review.
- `cleanup-no-process` is distinct from never-dispatched cleanup. Use it only
  when offered by the original owner, with its `expectedIntentSha256`. The owner
  must prove a settled local refusal before issuing launch, or an exact native
  refusal before creation/after a normal failed creation with empty outputs.
  The original helper independently rechecks zero process handles and an empty
  Job before releasing. Timeout, malformed replies, uncertain creation and
  post-creation failures are excluded. This proves no application process was
  created by that attempt, not absence of earlier helper/profile/OS effects.
  Retained release proof can finish publication through `settle-records`; never
  replay release because its journal publication failed.
- Native creation uses a suspended primary thread. The helper verifies its
  created native image against the retained executable before resuming once.
  A failed post-create check may leave the original root suspended, with no GUI
  window to close. Keep the helper/facade alive and report that state; do not
  claim no-process cleanup, force termination or attempt a separate resume.

## Evidence and bounds

Public results contain identity fields and event counts/kinds, at most 128 KiB
per observation. They exclude script text and console/exception payloads.
Browser discovery is bounded to 8 MiB. Attached transport allows 64 MiB total,
64 requests, and 4096 events/8 MiB. Ordinary protocol frames stay at 1 MiB;
only the script-source reply allows a 32 MiB encoded frame and 20 MiB decoded
UTF-8 source. The larger source allowance covers the pinned UI asset, not
arbitrary event or response expansion.
The former complete worker path uses32 requests; opening adds8, and an admitted
ancillary child adds6 to that project-only branch. The separate
existing-PCB-source/model path uses30 total; the separate complete UI/project/
PCB-opening/model path uses54, or64 with the five ancillary-owner checks,
including release of the original object group.
The fixed budget is not permission for extra
CDP probes or repeated observations. Fixed opening programs allow65,536 outbound
bytes and32,768 native input bytes; other limits are unchanged.
The root census is bounded to8KiB,128trees,65,536 collection-entry visits,
64levels and528,384 retained descriptors. It does not emit model keys or
geometry. These are sampled observations, not a write-admission token.

`sourceVerified:true` proves only the selected script's complete bytes in the
observed target and its retained page or worker context. URL matching alone is insufficient.
It does not prove a project-worker association, compiler ownership, bridge
authentication, complete drawing state, queue completion or saved contents.
There is no arbitrary CDP method or caller JavaScript. The fixed worker expression
has a one-second inspector deadline, no command-line API, user gesture, promise
awaiting, preview generation or CSP bypass. Its by-value result is bounded to
16 KiB; selected queue counts are bounded to 65,536. These output limits do not
make native reflection free or prove that another process stayed unchanged.
The effect check is not a sandbox or proof of pristine builtins. Native worker
association, latent callbacks and full compiler participation remain unverified.
There is no debugger pause/resume, CAD writer or explicit Save. Observation is
sampled, not continuous. The suspended native launch's single primary-thread
resume is internal startup, not a debugger control.
`projectFreeVerified`, `profileIsolated`, `debuggerSocketAbsenceVerified` and
`executionAuthorized` remain false. Pipe-only launch arguments do not prove
that no debugger socket exists.
