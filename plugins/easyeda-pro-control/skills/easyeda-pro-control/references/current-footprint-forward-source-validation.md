# Disposable v2 footprint source validation

Use the separate `footprint-forward-source-validation` wrapper through
`easyeda_control_pcb209_worker_startup`. Discover its exact schema offline with
`easyeda_control_api` action `footprint-forward-source-validation` and
`query:{includeSchemas:true}`; validate each nested request with
`footprint-forward-source-validation-validate` before dispatch.

This route creates a fresh original v2 native owner for an explicitly selected
disposable checkpoint. It does not promote a `footprint-copy-qualify-*` v1 owner.
The operation ID uses `footprint-forward-execution-*`; the name identifies its
separate native birth, not execution permission. No clock, route, head/lock,
producer-frontier, create, copy/delete, scheduler, explicit Save or saved-result
action is offered. All source-input results retain `executionReady:false`,
`executionAuthorized:false`, `saveAuthorized:false`, `wholeWriterReserved:false`
and `routeAndClocksQualified:false`.

Every tool call has this outer shape:

```json
{"request":{"action":"footprint-forward-source-validation","request":{"action":"inspect","operationId":"footprint-forward-execution-example"}}}
```

Launch requires the exact registered disposable target and a footprint UUID
from its complete checkpoint, plus `confirmValidationOnly:true`,
`confirmDiagnosticLaunch:true`, `confirmDisposableProject:true`,
`acceptExistingProfileEffects:true`, `acceptNormalOpenEffects:true` and
`acceptDebuggerPauseEffects:true`. Launch and opening can restore tabs, migrate,
contact services and automatically persist files or shared settings. Requested
source validation does not promise profile or storage isolation. Never use a
production project to qualify this route.

Keep the original client and native owner through this sequence:

1. `launch` prepares the whole checkpoint and completed SQL reader before the
   actual v2 factory. Retain the returned `bindingSha256`.
2. `observe-main`, then `observe-browser`; select an actual returned browser
   target for `inspect-frames`, then an actual frame for `inspect-ui`.
3. `capture-source` runs once. It retains original project constructor capture,
   assignments and UI/state observations, reads one checkpoint-member footprint,
   prepares its original source inputs and seals them on that same owner. Its
   step result contains the separate strict v2 source-input result with hashes.
   Complete source/preparation packets remain in the managed opening journal.
4. `observe-window` is a consumed original-owner observation. If it returns a
   HWND, `normal-close` accepts only that exact HWND. Do not answer Save/Discard
   prompts without authorization. When forced termination is authorized,
   `abort-generation` requires `confirmAbortOriginalForwardJob:true` and targets
   only this actual original v2 Job; the historical confirmation name grants no
   permission or v1 ownership.
5. After close or abort, `observe-termination` must prove actual original root
   exit and an empty whole Job. `release-closed` separately awaits original
   construction cleanup and helper release. `observe-release` inspects a
   consumed release; it never sends release again. Settle any original pending
   publication with `settle-records`.

All bound actions require the exact operation ID and `expectedBindingSha256`.
`inspect`, `settle-records`, `cleanup-before-launch` and `cleanup-no-process`
select only the original operation. The latter two use private original factory,
launch and no-process outcomes; absence of a binding is not no-process proof.
An uncertain window observation stays consumed. A failed normal stage never
permits another capture or source read. Physical exit or a result JSON clone
cannot reconstruct an owner, source seal or saved baseline.
Confirmed abort first revokes the normal lane, then joins only an already-active
original journal publication before writing its abort intent. This join retries
no publication or native command. Later normal failure handling cannot race it
by starting another normal diagnostic append; the original error stays retained.

For the maintained foreground manager, a pending `capture-source` supports only
the exact original `in-flight-original` inspect and explicitly confirmed abort.
Use the manager frontend from the reviewed payload that implements this family.
Selecting a replacement facade does not update an existing manager's code. If
its frontend predates this family, finish original cleanup, retirement and EOF,
shut down that resourceless manager and start the updated maintained frontend
before new native work. This requires no Codex restart or ownership transfer.
After SDK rejection, use `cleanup-original` on that same retained connection,
generation and interrupted request. The manager selects the wrapper, operation
and binding privately. New-family interrupted launches also permit original
record settlement and the two guarded prelaunch/no-process cleanup selectors;
they never authorize an old-family cleanup or a replacement. A learned binding
requires the same client's complete private-provider inspection and published
original binding record. Cleanup does not resolve the interrupted outcome.

After a prelaunch cleanup publication failure, keep this same provider and use
`cleanup-before-launch` to settle its original terminal record. The provider
retains the original helper-release promise and proven cleanup kind; it sends
neither release nor a settled terminal record again. A rejected or unknown
original release remains unproved and retains custody.
After the same failure during no-process cleanup, repeat only the same
`cleanup-no-process` selector to settle its original consumed release and
terminal record. A bound postlaunch release uses `observe-release`; the
manager admits that observer only for this source-validation family and its
retained original binding. Neither path resends release or clears uncertainty
from a rejected original operation.

Finish actual helper closure and record settlement, then the original facade's
cooperative retirement and observed EOF/process closure before replacement.
Read [autonomous controller updates](autonomous-controller-updates.md) for the
manager protocol. Local schemas, synthetic regressions and native compilation
remain separate from connected qualification.

A capture wrapper that never invoked its original opening can release only after
actual original root/whole-Job termination and a complete idle/unconsumed state
check. This does not settle an opening that ran or returned ambiguously. Keep
release and journal settlement separate. New allocations retain a separately
versioned producer subobject from the verified installation; that evidence does
not change old persisted result contracts.

For the single supported historical Source v2 cleanup failure, consult the
[historical startup-blocker receipt](current-footprint-forward-source-relinquishment.md).
It requires original process cleanup first and does not resume that capture.

Before native launch is invoked, an uncertain launch-intent publication is still
an original prelaunch cleanup case. Retain the same provider, settle the intent,
and use `cleanup-before-launch`. A ready original helper must acknowledge its
unlaunched release and actually close. The separate
`cleanup-unlaunched-owner` terminal records those facts before or after a launch
intent; it makes no zero-total-input claim. The old zero-input terminal remains
reserved for its original closed-before-owner factory diagnostics. An actual
native launch invocation rules out this prelaunch path.

A release rejected strictly before any release work can be tried again only
when the provider consumes the native owner's one-use original preflight proof.
It clears only that rejected cleanup attempt or promise. Make the later cleanup
call explicitly on this same owner; normal work remains ended. No status boolean,
error message or copied result can supply the proof. Once release work begins,
including its termination query or channel cleanup, later failures cannot reset
the attempt. Keep unknown and partial releases in their existing consumed state.
