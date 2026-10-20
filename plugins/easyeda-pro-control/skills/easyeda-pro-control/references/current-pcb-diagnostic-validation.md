# Native PCB diagnostic validation

Use `easyeda_control_pcb_diagnostic_validation` only to qualify the separate
native diagnostic owner. It starts the reviewed application in its existing
profile, observes fixed browser/frame/script identities, and normally closes
that original process. It does not open a project or enable CAD operations.
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
5. `inspect-script` takes a `frameId` from that retained tree and exactly one
   `family`: `ui`, `pcb` or `public-api`. Choose the family actually loaded in
   that frame. The facade supplies the fixed versioned asset path, complete
   source hash and byte count. It checks the default context's unique ID and
   complete source, then rechecks target/frame identity. Only one script
   inspection is available for this generation. A missing family is not
   permission to navigate, attach again or try another family after consumption.
6. `observe-window` returns the original application's unique `hwnd`, or no
   usable window. `normal-close` additionally takes that observed `hwnd` and
   `confirmNormalClose:true`. It rechecks the window and sends one normal-close
   request. Never choose Save/Discard or force exit as part of this workflow.
7. Use `observe-termination` until it proves the original root exited and its
   entire Job is empty. A close acknowledgment or missing window is not that
   proof. Then use `release-closed`. Completion requires `state:"released"`,
   not merely `state:"terminated"`; durable receipt settlement may still be needed.

Normal closure may persist application data or display a prompt. Leave an
unexpected Save/Discard prompt unanswered and report it. Do not disconnect the
diagnostic pipe to close EasyEDA: Electron can quit when that pipe closes.

## Lost replies and failures

- `inspect` is local and does not replay native actions. Supply
  `observation:"browser"`, `"frames"` or `"script"` to retrieve one recorded or
  retained stage result. Check `busy`, consumed-stage flags, `resultRetained`
  and `published`; a failed response does not authorize another dispatch.
- If publication failed, keep the original facade alive. When offered,
  `settle-records` takes the inspected `intentSha256` as `expectedIntentSha256`.
  It publishes only absent records from the original retained bytes. It neither
  repeats native work nor replaces conflicting or partial records.
- Navigation, detach, context loss, an unexpected pause or other protocol
  invalidation ends diagnostic inspection. Original-owner window observation,
  normal closure, termination observation and release remain the cleanup path
  when the helper protocol is still usable. They require local owner integrity,
  not bridge authentication or a fresh full installation admission.
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

## Evidence and bounds

Public results contain identity fields and event counts/kinds, at most 128 KiB
per observation. They exclude script text and console/exception payloads.
Browser discovery is bounded to 8 MiB. Attached transport allows 64 MiB total,
32 requests, and 4096 events/8 MiB. Ordinary protocol frames stay at 1 MiB;
only the script-source reply allows a 32 MiB encoded frame and 20 MiB decoded
UTF-8 source. The larger source allowance covers the pinned UI asset, not
arbitrary event or response expansion.

`sourceVerified:true` proves only the selected script's complete bytes in the
observed target/frame/default context. URL matching alone is insufficient.
It does not prove a project-worker association, compiler ownership, bridge
authentication, complete drawing state, queue completion or saved contents.
There is no arbitrary CDP method, JavaScript evaluation, pause/resume, project
navigation, CAD writer or Save. Observation is sampled, not continuous.
`projectFreeVerified`, `profileIsolated`, `debuggerSocketAbsenceVerified` and
`executionAuthorized` remain false. Pipe-only launch arguments do not prove
that no debugger socket exists.
