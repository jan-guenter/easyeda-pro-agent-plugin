# PCB and worker continuation on 3.2.209

Use this disposable diagnostic to qualify the original PCB, first ratline
worker and subordinate worker sources, then observe the full PCB and worker
capture packets. It requires a fresh launch selected for this purpose. It
cannot continue an existing held-import operation or enable design editing.

Discover `pcb209-ratline-continuation` with `query:{includeSchemas:true}` through
`easyeda_control_api`. Validate each inner request using
`pcb209-ratline-continuation-validate`, then dispatch through
`easyeda_control_pcb209_worker_startup`:

```json
{
  "request": {
    "action": "ratline-continuation",
    "request": {
      "action": "inspect",
      "operationId": "pcb209-continuation-example-01"
    }
  }
}
```

Choose this route when the task needs worker continuation observations.
Choose the [held-import route](current-pcb209-ratline-held-import.md) when it
needs the first child's paused boundary. The modes retain separate native
owners, command admission and cumulative budgets. Serialized evidence from
either mode cannot transfer authority to the other.

1. Launch a fresh `pcb209-continuation-*` operation with the schema's required
   acknowledgments. Retain the original binding digest and Codex session.
2. Qualify `browser-observation`, `inspect-frames` and `inspect-script` for the
   original root frame with `family:"ui"`.
3. Call `capture-project` once for an explicitly registered disposable PCB.
   Use [the project-worker workflow](current-pcb209-worker-startup.md) for
   target selection and SQL checkpoint requirements.
4. After the constructor packet is published, call
   `observe-ratline-continuation` with the original binding and the required
   opening/debugger acknowledgments. The lifecycle consumes one navigation
   intent for the retained target. It accepts no replacement target or code.
5. Inspect the result or first failure. Retain the original owner through
   `observe-window`, one `normal-close`, `observe-termination` and
   `release-closed`. Settle any offered publication record with its original
   intent digest. A failure or missing reply never permits another capture,
   navigation or Save.

The coordinator qualifies 29 PCB source phases and seven phases in each worker.
Each child starts only after its original constructor/attachment relationship
and debugger setup have been checked. PCB and first-worker capture run
concurrently with subordinate qualification. The subordinate route permits
source handling and its final source resume only. It cannot evaluate arbitrary
code, create another child or run the parent's capture commands.

The fresh launch has 453 normal requests and 59 cleanup requests, 512 total,
with separate source, event, byte and timing limits. Original session ownership
and command use remain cumulative across phases. Fixed aggregate waits cover
the serial ownership checks and concurrent source loading; individual native
requests retain their deadlines. Limits are internal to the selected launch
and cannot be reset or chosen by a caller.

PCB navigation under either ratline purpose uses the time remaining on the
original native launch stopwatch. The native encoder supplies this value; the
tool accepts no timeout argument. Opening does not start another launch budget
or consume the cleanup reserve. A refused or timed-out opening remains consumed
and reports `openingAcknowledged: false`; inspect and finish original-owner
cleanup without replaying navigation.

Initial and committed Electron window-context hooks have separate fixed source
and resume phases. The initial hook also requires the selected iframe DOM
binding and pinned UI caller stack. Neither hook consumes PCB source ordinals.
An unknown pause remains a refusal; do not manually resume it.

With async-stack capture enabled, a generated preload helper can carry a
`stackTrace.parentId`. The ratline owner admits that field only when both its ID
and debugger ID match the original child's retained bootstrap pause. Exact
preload creator, ordered caller and source checks remain required. On an event
refusal, `workerSource.firstRejectedEvent` or the subordinate source state retains
the first bounded raw event; `firstFailure.step` identifies the parsing stage.
Inspect that evidence before proposing a schema correction.

Before the initial window's DOM checks, first PCB source admission and final
PCB source release, the source owner transfers its instrumentation pause to an
ordinary breakpoint at the same qualified source location. It requires the
original resume acknowledgment, exact stack and sole owned breakpoint hit
before DOM requests. Instrumentation pauses cannot service those requests.
The temporary breakpoint is removed once; the original owner retains its
final resume. These three transitions add nine requests without consuming
PCB source ordinals. Only the inline admission source can use a nonzero start
location, taken from its original script event; callers cannot choose it.

The initial hook retains its actual pre-commit Window context. If the already
tracked same-origin child navigation commits while that hook is paused,
reproof follows that same context through the commit. A new initial binding
after commit, a destroyed context or a replacement context still refuses.
The next document hook selects a reused context through the committed-frame
checks even when Chromium emits no second context-created event.

During source-held bootstrap, the root can still have its original project-only
URL. Native tab activation updates that fragment after iframe onload and frame
initialization. Bootstrap ancestry retains the original root until its exact
fragment event, then accepts only the final PCB root. Ordinary completed-opening
checks still require the final root. Neither phase proves callback completion.

Original-owner inspection includes bounded ancestry replies for Target,
frame-tree and DOM checks, even when later validation fails. Each capture is
complete or explicitly unavailable/oversized; limits are 16 KiB per reply and
64 KiB total. These private historical replies aid diagnosis, grant no owner
authority and cannot be used to retry a consumed request.

The original coordinator seals subordinate observations before the worker can
terminate that subordinate. It then holds the PCB received pause until the
worker terminal capture, breakpoint removals and resume acknowledgments are
sealed. Only matching expected retirement events are accepted; retired child
owners cannot issue further commands. These historical seals do not recreate
live ownership. Worker publication must match PCB receipt and the original
project, document and window bindings.

A successful packet establishes the captured observations, source continuation
and source-qualified retirement observations. It keeps these claims false:

- Independent JavaScript Worker-object to CDP-target identity.
- Callback completion and subscribed canvas-peer ownership.
- Asynchronous copper completion and complete startup.
- Complete live/source/SQL baseline, saved/reopened persistence and editing or
  Save authority.

Seeing a callback return breakpoint is not proof that all asynchronous work
completed. Native origin evidence and source matches do not replace these
missing observations. Offline V8 composition tests use synthetic source replies
and target attachments; they do not establish live EasyEDA completion.

Normal opening can migrate files, restore caches, use network services and
persist automatically. Do not claim unchanged storage from normal exit alone.
Leave Save/Discard prompts unanswered unless authorized. After an uncertain
call, retain its evidence and original process owner for cleanup; do not launch
a replacement as a retry.
