# PCB constructor and held ratline import on 3.2.209

Use this disposable diagnostic to observe the original PCB constructor and the
first ratline child's source loading. It qualifies 29 PCB source phases, checks
the PCB's native frame/context ancestry, then qualifies seven child source
phases and leaves the final child import paused. It does not continue that
import or independently associate the JavaScript Worker object with its CDP
target. Connected validation is separate from offline tests and installation.

Query `pcb209-ratline-held-import` with `query:{includeSchemas:true}` through
`easyeda_control_api`; validate inner requests using
`pcb209-ratline-held-import-validate`. Dispatch every request, including
inspection and cleanup, through `easyeda_control_pcb209_worker_startup`:

```json
{
  "request": {
    "action": "ratline-held-import",
    "request": {
      "action": "inspect",
      "operationId": "pcb209-ratline-example-01"
    }
  }
}
```

Choose this purpose before launch. It cannot upgrade a retained constructor,
empty-baseline or ordinary diagnostic owner. The original helper retains the
process, non-breakaway Job, debugger pipes and the complete fixed installation
source set. Matching files, PIDs or historical JSON cannot recreate ownership.

1. Launch a fresh `pcb209-ratline-*` operation with the acknowledgments in the
   schema. Retain its binding digest and keep the Codex session alive.
2. Qualify `browser-observation`, `inspect-frames` and `inspect-script` for the
   observed root frame with `family:"ui"`.
3. Use `capture-project` once for an explicitly registered disposable PCB
   target, following [the constructor workflow](current-pcb209-worker-startup.md).
   It retains the original completed SQL reader and exact target.
4. After published constructor capture, call `observe-ratline-held-import` with
   the original operation and binding digest, `acceptNormalOpenEffects:true`
   and `acceptDebuggerPause:true`. The lifecycle writes durable intent before
   opening the retained PCB. It accepts no replacement target or custom code.
5. Inspect the retained result or failure. A successful packet records a
   point-in-time held-import boundary. Its Worker-target identity, complete
   startup, full baseline, execution and Save claims remain false. It cannot
   serve as a continuation capability.
6. Use `observe-window`, one `normal-close`, `observe-termination` and
   `release-closed`. The lifecycle aborts diagnostic work before close, retains
   failed or unqualified pauses, and releases only after the original root and
   Job have exited. Settle any offered record using its original intent digest.

The launch keeps one cumulative request/byte/event ledger and clock through
discovery, source loading and capture. Exact source slots have separate reply
limits; cleanup has reserved requests, bytes, polls and time. These limits are
fixed and cannot be selected or reset by a caller. Large source qualification
can take time; timeout or missing acknowledgment consumes the operation.

Before the PCB frame exists, the fixed navigation function itself can trigger
`beforeScriptExecution`. The router may read and resume that one pause only
while the original `open-document` request remains pending, in its original UI
context, with the original script/stop events and byte-exact generated function
source. It retains PCB instrumentation and consumes neither a PCB source slot
nor a PCB bootstrap resume. Any different or unqualified stop still refuses.
These two fixed operations have their own two-request class. The subsequent
UI loader can construct one default empty callback before creating the PCB
frame. That pause has its own two-request source/resume class. It requires the
original three-frame creator stack, UI script/context, complete generated source
and pending opening. A pause arriving before the navigation resume reply waits
for that original acknowledgment. Neither UI pause advances PCB source ordinals.
Electron can then run its exact six-byte window-context hook for the initial
iframe and the committed document. Each has a separate one-use source/resume
class. The initial hook requires the retained child context, selected iframe
DOM owner and pinned UI caller stack; the committed hook requires that same
frame and its actual committed context. The complete source is read before
resuming. These hooks consume no PCB source ordinals. Unknown, repeated or
changed hooks refuse without a manual resume.

The normal limit is 337, with a 46-request cleanup reserve (383 total).
The initial window and first/final PCB sources each transfer to an ordinary
breakpoint at their qualified source location before DOM ancestry queries.
Each transfer requires its original resume acknowledgment, unchanged stack
and sole owned breakpoint hit, followed by one breakpoint removal. These nine
requests and three cleanup removals have separate finite phases and consume
no source ordinals. Only inline source admission uses its original script
event's absolute start location; no caller location is accepted. Instrumentation
pauses cannot service the DOM queries. Fixed aggregate waits include all four
UI/window phases and these transfers. Existing source slots, individual
request deadlines and cleanup time remain unchanged. Actual
V8 fixture reproduction validates this compilation case; it does not establish
the cause of a historical EasyEDA refusal whose original pause was unavailable.

The held-import purpose completes a fixed PCB capture of the original bridge
and factory pauses before returning. It removes both owned breakpoints and
observes both parent resumes. Its capture and composite diagnostics report
`scope:"pcb-held-prefix"` and `settled:true`. The original capture handles and
owners remain bound to later inspection and cleanup. No wait for the child's
result callbacks remains active while the final import is held. A single fixed
comparison then joins the original constructor's Worker and manager objects to
the bridge and registry captures in that same JavaScript realm. It requires the
ordered original handle replies and consumes one existing capture request.
The held composite v2 records those two object matches. It does not associate
the JavaScript Worker with the native CDP target or authorize child continuation.
The separate full capture still requires its result and return events.

After a refusal, inspect the original owner's `firstFailure` chain through
the native session, PCB context/source owner, child source owner and startup channel. It retains
fixed reason codes, stage/step, last command/event classes and bounded counters.
`SCHEMA` and `UNCLASSIFIED` are diagnostic categories, not permission to retry.
These summary fields omit remote exception text, URLs, source and document identifiers.
The first reason survives later cleanup failures and release. A historical
generic bootstrap failure cannot be assigned a cause from newer diagnostics.

Original-owner inspection also exposes `workerStartupRatlineRejectedStopEvidence`
for the first refused parent stop: the complete bounded event (32 KiB), matching
script record (16 KiB) and original context record (8 KiB), plus a digest-only
status summary. Each record explicitly reports captured, malformed, oversized
or unavailable; nothing is truncated into authority. Script provenance retains
at most the most recent 32 records and 128 KiB in total. Missing or evicted
provenance cannot qualify navigation. Raw evidence is private inspection data,
never an execution token, and survives original cleanup without replacement.

Aggregate waits account for serial owner/request/owner checks and four ancestry
snapshots. The first PCB source pause also allows the four preceding UI/window pause
sequences. Later source-pause deadlines, individual request deadlines, launch
limits and cleanup reserves remain fixed. A timeout does not cancel the original request.
Late breakpoint acknowledgments belong to the original cleanup owner and never
authorize another allocation or capture.

The first-child aggregate also accounts for its serial parent-ownership checks.
Only actual PCB dispatcher transports and that original first child use these
composition windows. Standalone and subordinate paths retain their previous
limits. The creation and capture watchdogs remain independent limits, so a
larger aggregate arming window does not promise completion before those limits.

## Interpreting native origin evidence

Before either realm executes its relevant source, the diagnostic enables
async stack capture at fixed depth one. At the first child's first qualified
script pause, it retains the complete pause and both original PCB constructor
pauses. If the child's external stack ID names the original PCB debugger, it
performs one lookup in that original parent session. It does not follow an
inline stack as a substitute or retry with another ID.

`nativeOrigin.reason` explains the comparison. `matched` means the retained
native stack and constructor locations satisfy this observation profile.
Missing IDs, foreign debugger IDs, unsupported frame/scope shapes and location
mismatches produce explicit diagnostic reasons. Even `matched` leaves
`nativeWorkerTargetIdentityVerified` and execution authority false. The custom
EasyEDA runtime still needs connected qualification of the complete link.

The published packet includes `nativeOriginEvidence` and its summary digest.
Each of the four complete observations has a 64 KiB limit; the complete result
has a 288 KiB limit. Oversized evidence is rejected, never truncated. Inspect
returns one raw copy: the durable result when available, or
`workerStartupRatlineUnpublishedOriginEvidence` from the original retained
session when no result has been published. Preserve that evidence before ending the
session. A summary hash alone cannot explain a refused frame or source position.

Normal opening can migrate, replay caches, use network services and persist
data automatically. Debugger pauses change timing. Never replay launch,
navigation or capture after uncertainty. Keep the original owner for inspection
and cleanup; leave Save/Discard prompts unanswered unless authorized. Normal
exit proves neither discard nor unchanged storage.

This purpose offers no actor/channel observation, empty baseline, geometry
editing or Save. The separate [fresh continuation purpose](current-pcb209-ratline-continuation.md)
can observe both worker imports and full capture packets; it cannot upgrade this retained owner.
Independent Worker-target association, callback completion, publication
completion, complete live/source/SQL membership and saved/reopened persistence
remain separate work.
