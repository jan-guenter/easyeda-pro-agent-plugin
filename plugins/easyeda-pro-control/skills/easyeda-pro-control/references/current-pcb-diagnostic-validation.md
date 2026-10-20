# Native PCB diagnostic validation

Use `easyeda_control_pcb_diagnostic_validation` only to qualify the separate
native diagnostic owner. It starts the reviewed application in its existing
profile, observes fixed browser/frame/script identities, and normally closes
that original process. Separate branches support a one-shot disposable project
opening followed by direct-child worker inspection, or a bounded compiler-state
read from an already admitted PCB frame. Neither branch enables CAD editing.
This registered source route has offline regression coverage; connected native
validation is not recorded. Older installed snapshots may lack the tool.

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

This first route is deliberately worker-only: the original UI frame tree must
contain one top-level frame. Only the selected project's same-document fragment
transition is admitted. Added/restored editor frames, a changed loader/default
context, unrelated URLs or full navigation stop the branch. Do not remove those
guards to accommodate an unsupported project. A failed or uncertain stage is
consumed, including its preflight; inspect and clean up without replay.

## Separate PCB compiler-state observation

After `inspect-script` admits the `pcb` family in an existing disposable PCB
frame, `observe-model-state` takes only the original operation/binding.
It cannot be combined with project opening or worker discovery in that generation.
The worker-only opener does not establish this PCB-frame prerequisite.

The fixed inspector path selects the original `pcb/saveCompiler` callback,
checks its complete source/script location, and follows only its two bounded
V8 scope links. It never calls the callback or Save handler, pauses a debugger,
or accepts an object ID from the tool caller. Eight fixed commands read and
release the private remote-object group. Effect checks remain enabled.

Returned data covers the main compiler, at most128 loaded footprint participants
and selected dynamic-copper flags/counts/timer markers. It excludes primitive
values and queue payloads. It is not a complete model, pending-producer inventory,
worker association, queue barrier or writer/Save authority. The original object
group's release must succeed before the result is accepted.

## Lost replies and failures

- `inspect` is local and does not replay native actions. Supply
  `observation:"browser"`, `"frames"`, `"script"`, `"workers"`, `"worker-script"`
  or `"worker-state"` or `"model-state"` to retrieve one recorded or
  retained stage result. Check `busy`, consumed-stage flags, `resultRetained`
  and `published`; a failed response does not authorize another dispatch.
  The original owner also retains a bounded `nativeLaunchError` label and,
  after a proved failed creation, `createProcessError`. The latter is the
  immediately captured numeric Windows error, not arbitrary exception text.
  Older evidence may lack it; do not guess the failure cause from a generic
  refusal or an absent process. Cleanup proof retains the code when available.
  Opening status/results are separately retained on `inspect`; they never mint
  a new attempt.
- If publication failed, keep the original facade alive. When offered,
  `settle-records` takes the inspected `intentSha256` as `expectedIntentSha256`.
  It publishes only absent records from the original retained bytes. It neither
  repeats native work nor replaces conflicting or partial records.
- Navigation, detach, context loss, an unexpected pause or other protocol
  invalidation ends diagnostic inspection. Original-owner window observation,
  normal closure, termination observation and release remain the cleanup path
  when the helper protocol is still usable. They require local owner integrity,
  not bridge authentication or a fresh full installation admission.
  Only the sealed opening's bounded same-document transition is an exception;
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
The former complete worker path uses32 requests; opening adds8. The separate
PCB-source/model path uses27 total. The fixed budget is not permission for extra
CDP probes or repeated observations. Fixed opening programs allow65,536 outbound
bytes and32,768 native input bytes; other limits are unchanged.

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
