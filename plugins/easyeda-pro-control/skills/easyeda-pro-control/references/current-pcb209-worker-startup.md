# Disposable project-worker startup on 3.2.209

Use `easyeda_control_pcb209_worker_startup` to capture the original project
worker as an explicitly disposable, already registered local project opens.
This tool owns a separate native launch. It cannot attach to an ordinary
EasyEDA process or upgrade the `pcb209_opening` owner.

Discover `pcb209-worker-startup` with `query:{includeSchemas:true}` and validate
each inner request with `pcb209-worker-startup-validate`. The API wrapper is:

```json
{
  "request": {
    "action": "pcb209-worker-startup-validate",
    "query": {
      "request": {
        "action": "inspect",
        "operationId": "pcb209-startup-example-01"
      }
    }
  }
}
```

Validation is offline. It neither creates a journal nor grants authority.

## Original-owner sequence

1. `launch` requires a unique `pcb209-startup-*` operation ID and
   `confirmValidationOnly:true`, `confirmDiagnosticLaunch:true`, and
   `acceptExistingProfileEffects:true`. Retain the returned binding digest.
   Keep this Codex session alive until the original helper is released.
2. Call `browser-observation`, then `inspect-frames` with its observed page
   `targetId`, then `inspect-script` with the observed top-level `frameId` and
   `family:"ui"`. Use the original operation ID and `expectedBindingSha256`
   for each bound action. Each observation is consumed once.
3. `capture-project` takes `target:{rawWindowsPath,projectUuid,documentUuid,
   expectedSourceSha256}`, `confirmDisposableProject:true`,
   `acceptNormalOpenEffects:true`, and `acceptDebuggerPauseEffects:true`.
   The path must identify the registered disposable file; its exact raw-path
   hash identifies the project. The document is an existing checkpoint-member
   PCB. The coordinator derives the branch and creates its own checkpoint.
   It arms original worker capture before the single project opening. The
   target is the generated editor bootstrap, followed by the preload and
   project-worker imports. Each paused script is qualified separately; the
   constructor breakpoints are armed before the project script resumes.
4. After successful published capture, `observe-current-assignments` checks
   the current wrappers against retained constructor callbacks. After that
   published result, `observe-current-channel` and `observe-actor-clock` are
   independent optional stages. Each takes only the same ID and binding.
   The channel stage reads relations, method locations and paired gates; it
   does not invoke publisher methods. The actor stage samples UI, worker,
   worker, UI identity and local Date values in that order.
5. Use `observe-window`, then one `normal-close` with the observed `hwnd` and
   `confirmNormalClose:true`. Separately call `observe-termination` and
   `release-closed`. Complete any offered `settle-records` using the retained
   intent digest. Release requires original root exit and an empty original Job.

The parent discovery and startup channel share one monotonic request counter
with a fixed256-command limit. Handoff does not reset it. This is sufficient
for the defined startup stages; it does not admit the private common-state
reader, whose complete bounded sequence needs up to3090 commands, or its
empty-root bracket, which raises that private sequence to3099 commands.

## Interpreting results and failures

The exact209 source and breakpoint profiles differ from the old206 route.
Do not substitute old worker source, debugger coordinates, packet profiles or
operation prefixes. A successful source comparison proves only the observed
bytes. A constructor packet remains tied to its original in-memory owner;
matching JSON and historical receipts cannot recreate it.

Current assignment and channel observations are sequential samples. They do
not prove continuous wrapper ownership, native BroadcastChannel peers,
contained publication destinations or queue completion. The actor stage's
local Date bracket is not a native/server clock proof or a future Save clock.

Project opening can restore tabs, migrate files, replay caches, use network
services and automatically persist or Save. Debugger pauses alter application
timing. The tool offers no explicit Save, CAD edit, PCB-worker/ratline capture,
complete live/source/SQL baseline or writer eligibility. A PCB already opening
as part of restoration may create an unexpected worker and cause refusal.
Do not disable threading or use another launch purpose to evade that result.

After a timeout or lost reply, use `inspect`; do not repeat capture or the
consumed observation. Retain the original process owner for supported cleanup.
Phase diagnostics distinguish the bootstrap, preload and project script. A
target failure records bounded URL/name classifications and digests rather
than a private URL. Generic project-opening consumption remains true through
cleanup and historical inspection, including when constructor capture failed.
Consumption does not imply a published successful opening result.
Normal close does not prove discard or unchanged files. Leave Save/Discard
prompts unanswered. Do not restart Codex while a live owner still needs cleanup.
Source tests and a successful installation are separate from connected
validation of this route.
