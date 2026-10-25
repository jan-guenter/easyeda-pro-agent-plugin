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

After a refusal, inspect the original owner's `firstFailure` chain through
the native session, PCB context/source owner, child source owner and startup channel. It retains
fixed reason codes, stage/step, last command/event classes and bounded counters.
`SCHEMA` and `UNCLASSIFIED` are diagnostic categories, not permission to retry.
Remote exception text, URLs, source and document identifiers are omitted.
The first reason survives later cleanup failures and release. A historical
generic bootstrap failure cannot be assigned a cause from newer diagnostics.

Aggregate waits account for serial owner/request/owner checks and four ancestry
snapshots. Individual request and first-pause deadlines, launch limits and
cleanup reserves remain fixed. A timeout does not cancel the original request.
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
editing or Save. Remaining work includes independent Worker-target association,
worker and subordinate continuation, callback return, publication completion,
complete live/source/SQL membership and saved/reopened persistence.
