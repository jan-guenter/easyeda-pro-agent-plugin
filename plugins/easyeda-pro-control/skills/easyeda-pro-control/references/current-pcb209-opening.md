# Disposable project and PCB opening on 3.2.209

Use `easyeda_control_pcb209_opening` only for an explicitly disposable,
already-registered local project and an existing PCB. It owns a separate native
launch through cleanup. It cannot adopt an ordinary launch or enable the older
3.2.206 diagnostic, worker, model or writer routes.

Discover `pcb209-opening` with `query:{includeSchemas:true}` and validate each
inner request with `pcb209-opening-validate`. The registered request grammar,
not the larger older diagnostic catalog, determines available actions.

## Fixed sequence

1. `launch` takes a unique `pcb209-*` operation ID and
   `confirmValidationOnly:true`, `confirmDiagnosticLaunch:true`, and
   `acceptExistingProfileEffects:true`. Existing or unresolved owners block it.
   Keep this Codex session alive through final helper release.
2. Retain the returned `bindingSha256`; later bound actions require it as
   `expectedBindingSha256` with the same operation ID. It is not an ownership
   token that another facade can adopt.
3. Run `browser-observation`, select its unattached page target, then
   `inspect-frames` with that observed `targetId`. Use an observed top-level
   `frameId` for `inspect-script` with `family:"ui"`. Do not guess IDs or select
   another script family. Each stage is consumed once.
4. `open-project` requires `target:{rawWindowsPath,projectUuid,documentUuid,
   expectedSourceSha256}`, `confirmDisposableProject:true` and
   `acceptNormalOpenEffects:true`. Use the exact registered Windows path, its
   raw-path hash as project UUID, the existing PCB UUID and current file digest.
   The coordinator creates its own checkpoint and derives default-branch PCB
   membership; caller SQL, branch overrides or replacement checkpoints are
   not accepted. It requires an empty editor under the original UI owner.
5. After accepted project opening, call `open-pcb` with the original binding
   and `acceptNormalOpenEffects:true`. The target is already sealed; do not
   supply a replacement document. `observe-pcb-opening` then separately checks
   the child frame, DOM owner, complete PCB source and native target identity.
6. Use `observe-window`, then one `normal-close` with its observed `hwnd` and
   `confirmNormalClose:true`. Observe original root/Job termination with
   `observe-termination`, then call `release-closed`. Finish any offered
   `settle-records` using the inspected original intent digest.

Startup/opening use the existing profile and can restore tabs, migrate files,
replay caches, contact services, write shared settings and automatically Save.
This is neither isolated nor a zero-write operation. No agent edit or explicit
Save is dispatched. Leave unexpected Save/Discard prompts unanswered.

An opening acknowledgment is not readiness. Source/frame identity does not
prove ratline delivery, complete startup, geometry, saved contents or writer
eligibility. The result leaves those claims false. This route has source and
offline validation; a later installed generation needs its own live evidence.

## Failure and cleanup

After an error or lost reply, use `inspect`; never repeat navigation under the
same or a new ID. Optional inspection stages are only `browser`, `frames`,
`script` and `pcb-opening`. It cannot inspect workers or native model state.
Original normal cleanup remains available after a failed observation and does
not depend on bridge authentication. A requested close is not termination.

`cleanup-unlaunched` and `cleanup-no-process` are distinct, offered only with
their original retained non-dispatch/no-process proof. They require
`expectedIntentSha256`. They are not a workaround for ambiguous creation,
post-creation failure or a lost host. Do not disconnect the native pipe to
force exit, recreate ownership from journal JSON, choose prompts or use another
launcher. Detailed retained cleanup semantics are shared with
[native diagnostic validation](current-pcb-diagnostic-validation.md#lost-replies-and-failures).

The fixed transport remains bounded to 103 requests and 64 MiB; callers cannot
choose a command, expression, debugger pause, source pin or budget. UI and PCB
source are verified in the original renderer context; installed selectors,
manager and project-worker files are separately hashed. Asset hashes are not
continuous file leases or proof of every transitive module. Ratline capture and
the complete write/save/reopen lifecycle remain separate work.
