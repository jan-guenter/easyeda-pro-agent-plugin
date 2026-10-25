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

Normal opening can migrate, replay caches, use network services and persist
data automatically. Debugger pauses change timing. Never replay launch,
navigation or capture after uncertainty. Keep the original owner for inspection
and cleanup; leave Save/Discard prompts unanswered unless authorized. Normal
exit proves neither discard nor unchanged storage.

This purpose offers no actor/channel observation, empty baseline, geometry
editing or Save. Remaining work includes independent Worker-target association,
worker and subordinate continuation, callback return, publication completion,
complete live/source/SQL membership and saved/reopened persistence.
