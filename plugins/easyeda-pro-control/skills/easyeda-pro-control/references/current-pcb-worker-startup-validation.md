# Disposable worker-startup capture

Use this route only to validate constructor capture on an explicitly disposable
project. It offers no CAD edit or explicit Save, and has no connected-validation
claim yet. Existing-profile launch and project opening can restore tabs, migrate
files, replay caches, contact services and automatically persist data. Debugger
pauses change application timing. Neither startup nor opening is isolated.

The tool is `easyeda_control_pcb_diagnostic_validation`, with a distinct wrapper:

```json
{"request":{"action":"worker-startup","request":{"action":"inspect","operationId":"worker-startup-example"}}}
```

The example is an inspection shape, not an existing operation. Query offline
`pcb-diagnostic-validation` with `includeSchemas:true` for the exact nested
schema, then validate assembled requests with
`pcb-diagnostic-validation-validate`. Discovery does not allocate an owner.

## Sequence

1. Choose a fresh `worker-startup-*` operation ID. Nested `launch` requires
   `confirmValidationOnly:true`, `confirmDiagnosticLaunch:true` and
   `acceptExistingProfileEffects:true`. Do not retry a failed launch under
   another ID. Existing/unresolved owners block allocation.
2. Retain the returned `bindingSha256`. Use the same operation ID and
   `expectedBindingSha256` for subsequent actions. Run `browser-observation`,
   select an unattached page from its retained inventory, then `inspect-frames`
   with that target and `inspect-script` with the actual top-level frame ID
   and `family:"ui"`. No caller executable, source hash, URL or code is accepted.
3. Use nested `capture-project` once. Supply the exact disposable target's
   `rawWindowsPath`, path-derived `projectUuid`, existing PCB `documentUuid`,
   and `expectedSourceSha256`, plus `confirmDisposableProject:true`,
   `acceptNormalOpenEffects:true` and `acceptDebuggerPauseEffects:true`.
   The lifecycle derives the default branch and retains a managed checkpoint
   and complete pre-open SQL inventory; caller JSON cannot replace them.
4. The single capture call publishes its intents, hands off the original pipe,
   preflights the empty UI and rechecks the checkpoint. It arms worker
   auto-attachment before opening and services constructor capture concurrently
   with the fixed project opener. Do not open the project manually or through
   another route first: that loses the original constructor observation.
5. Inspect the returned data and retained records. The expected worker name is
   bound before capture; the retained PROJECT receiver must subsequently match
   the selected project, derived branch and original UI window. Full worker
   source, constructor and project-identity observations remain separate from
   continuous ownership, every publisher, destination containment, completed
   startup, a stable design baseline and saved content. Success grants no writer
   or Save authority.
6. After successful capture and publication, `observe-current-assignments`
   consumes one check of the four current PROJECT wrappers against the original
   constructor callbacks. After that result is published, `observe-actor-clock`
   consumes a UI/worker/worker/UI bracket using the same original owners. Both
   requests take only the operation ID and binding digest; do not supply actor,
   clock or object-handle values. These reads are sequential, not atomic or
   continuous. Matching user JSON and local Date samples do not prove a backend
   actor, Windows/server time, queue completion or a future Save.
7. Keep the same facade alive. `observe-window`, `normal-close`,
   `observe-termination` and `release-closed` use that original owner. Normal
   close requires the observed `hwnd` and `confirmNormalClose:true`. Do not
   answer a Save/Discard prompt. A close acknowledgment is not process exit;
   release requires both original root exit and an empty whole Job. Debugger
   cleanup does not detach or release live native pipes to force closure.

## Refusals and retained results

Every preparation/opening/capture stage is consumed once, including uncertain
replies. Nested `inspect` remains local while another call is running. Look at
`workerStartupOpeningState` (including its stage/step diagnostics),
`workerStartupOpeningNativeReply`, retained opening result and record publication;
never
repeat `capture-project` to obtain a clearer response. `settle-records` publishes
only absent records from the same original in-memory bytes. It cannot rerun
capture or replace conflicting evidence. Original unlaunched/no-process cleanup
has the same strict retained-handle requirements as ordinary diagnostics.

Assignment and actor attempts also remain consumed after failure or publication
uncertainty. Inspect their retained-result and publication fields. The actor
summary identifies its full managed result record; partial samples are diagnostic
evidence only. A deadline does not prove that an outstanding call stopped. Do
not start a second capture, extend a timeout ad hoc or treat an unpublished
result as authority. Finish original-owner closure and retain the failed case.

Different workers, extra children, changed source/context, unsupported navigation,
failed checkpoint reproof or expired capture refuse. Cleanup retains late
attachment/breakpoint replies. Historical journals and matching PIDs cannot
recreate the original owner after a restart. Do not borrow String-precreate or
ordinary diagnostic methods, select a synthetic source profile, accept arbitrary
CDP commands, or clear exclusion records to continue.

The shared native ceiling is 256 request IDs across discovery and handoff,
64 MiB received data and 4,096 events/8 MiB event data. These are ceilings, not
allowances for extra probes. Fixed opening text is reconstructed in the native
helper; caller source text never crosses that boundary. The ordinary diagnostic
and String purposes retain their own unchanged command sets and budgets.

Full installation bytes are verified at launch and handoff. During startup,
the original native helper actively rechecks its continuously held installation
file/ancestor leases around fresh facade and helper checks. No public request
can supply or adopt those leases. The fixed request and pause deadlines still
apply; a slower host must report its retained stage/channel state, not bypass
checks or replay a consumed stage.
