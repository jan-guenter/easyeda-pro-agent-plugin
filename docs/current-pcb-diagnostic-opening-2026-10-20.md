# Diagnostic-owned disposable project opening

Historical baseline: this note records the081744 implementation. The later
[PCB-frame opening batch](current-pcb-diagnostic-pcb-opening-2026-10-20.md)
adds the exact source-derived project-title transition and a separate PCB
branch. Preserve the original program pins below as historical evidence.

Status: fixed source implementation, retained-owner integration and focused
synthetic tests pass. Native integration and connected qualification are separate work. No
application, project, existing journal or installed plugin has been changed
by this source-only work.

## Why a new owner path is needed

The existing disposable opener requires its original ordinary launcher and
authenticated extension session. A diagnostic owner has neither. Calling that
opener while the diagnostic launch exclusion is held would mix owners. The
diagnostic route instead needs its own fixed program, checkpoint binding,
durable one-shot dispatch record and original-process cleanup. It must not
reinterpret a historical ordinary opening receipt as current authority.
[Existing opener](../plugins/easyeda-pro-control/server/src/current-disposable-open-runtime.ts),
[diagnostic lifecycle](../plugins/easyeda-pro-control/server/src/current-pcb-diagnostic-lifecycle.ts).

Only an explicitly selected, already registered disposable `.eprj2` is in scope.
Reuse the maintained checkpoint preparation and reproof: raw Windows path
hashes to the project ID; the managed checkpoint supplies its default branch
and one undeleted PCB witness; original source bytes are checked again before
navigation. The PCB is a checkpoint membership witness, not a request to open
a PCB editor. No registration, directory search or new project is needed.
[Checkpoint implementation](../plugins/easyeda-pro-control/server/src/current-disposable-open-checkpoint.ts).

## Exact native route

The official method takes a project UUID and returns a boolean promise. Its
documentation warns that switching projects can lose unsaved data, which makes
the initially empty editor a necessary guard rather than a convenience.
[EasyEDA `DMT_Project.openProject`](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_project.openproject.html).

Inert source inspection found this chain:

| Pinned source | UTF-16 offset | Finding |
| --- | ---: | --- |
| `pro-api/0.3.50.ab46409c/api.js`, 1,964,920 bytes, SHA-256 `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` | 1,315,841 | SDK `openProject` calls the fixed `extensionApi.DMT_Project.openProject` RPC with the UUID. |
| `pro-ui/3.2.196.26ed3d6c/js/ui.js`, 17,456,671 bytes, SHA-256 `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` | 17,230,827 | `SK.openProject` calls `Fs({uuid})` and returns its success field. |
| Same UI source | 17,431,293; 17,445,116 | Service registration binds that handler to `gVars.extensionApiMessageBus2`, which is the original `window._MSG_BUS2_EXTAPI_`. |
| Same UI source | 15,077,172 | `Fs` performs the ordinary project-open workflow, not a worker-only shortcut. |
| Same UI source | 15,074,858; 16,669,194 | Current project publication precedes an asynchronous UI subscriber. `loadProjectCompleted` follows blank-tab setup but precedes restored-document work. |

These are local installed vendor-source observations, not claims about every
EasyEDA build. Paths, complete-source hashes and byte counts are comparison
inputs. The diagnostic owner must verify the actual retained top-page UI script
and unique context before dispatch. A global per-extension `eda` instance is
not assumed in that CDP context. The fixed native-task equivalent invokes only
the same opening service through its original UI bus. It does not call the
lower-level project-manager open routine or synthesize worker creation.

## Fixed program and transport contract

Use one immutable async function with strict by-value data arguments. Its
internal phase is only `preflight` or `open-project`; no caller supplies code,
RPC topics, command names, context IDs or method options. CDP
`Runtime.callFunctionOn` supports a system-unique context ID, JSON arguments,
promise awaiting and by-value results. It has no inspector timeout parameter,
so a local timer and the original transport deadline are separate requirements.
Timeout does not cancel an in-flight vendor RPC.
[Primary CDP Runtime schema](https://github.com/ChromeDevTools/devtools-protocol/blob/master/json/js_protocol.json).

Both phases reprove original UI/bus/method bindings, exact registration and a
complete bounded empty-editor sample. The opening phase subscribes before its
single RPC, admits only the selected project's ordinary URL grammar, and
requires the expected branch and target-only tabs. It observes the
startup prefix and cancels only its own subscription. It never opens a document,
presses a button, chooses Save/Discard, changes preferences or invokes Save.
[Maintained original opening guards](../plugins/easyeda-pro-control/server/src/current-disposable-open.ts),
[ordinary project URL grammar](../plugins/easyeda-pro-control/server/src/current-project-url.ts).

The host must journal intent and consume the stage before sending the command.
The function returns a bounded string containing identities, counts, fixed
failure labels and whether navigation was attempted. Missing replies, native
exceptions, timeout and malformed output remain consumed and unresolved; none
permits another open. A returned startup prefix is not complete restoration,
queue completion, persistence proof or writer authority.

The page context now has a separately armed, one-shot transition; it never
resets a failed identity. `openingContext()` requires an exact-source-qualified
top-level UI/default context and a single-frame tree. `beginOpeningTransition`
consumes the transition and accepts at most eight same-document events with
the exact selected project URL. `finishOpeningTransition` requires the
original target, frame, loader, origin, default context and script. The only
admitted content change is the project hash: CDP puts it in `Frame.urlFragment`,
not `Frame.url`. The pre-open fragment may be absent or `#`, matching the
maintained UI grammar; `#/` is not an admitted alias.
[Primary CDP Page schema](https://github.com/ChromeDevTools/devtools-protocol/blob/master/json/browser_protocol.json).

This is deliberately a worker-only route: any restored editor iframe, added
frame, full navigation, context destruction or target-title change refuses.
A frame URL does not establish its document's checkpoint membership. Supporting
restored SCH/PCB tabs needs a separate source-bound DOM/document-frame association,
not a relaxed frame-tree check. A valid opening prefix can therefore be followed
by a refused host transition; that still consumes navigation and retains cleanup.
Start worker discovery only after the accepted transition. A sealed empty worker
inventory cannot later adopt the newly created project worker.

The fixed function is 14,181 UTF-8 bytes, SHA-256
`3126e3b0b3d19c34c00ce57a261087b0b773c52ed908f5efb9f157c8fc3dbfe4`.
Its arguments are the existing sealed target and one fixed phase; its strict
reply decoder admits only a by-value JSON string of at most 49,152 bytes.
Its 10-second preflight and 45-second opening timers stop observation, not
vendor work. The opening call requires `throwOnSideEffect:false` because it
intentionally opens a project; subsequent worker snapshots keep their separate
side-effect-rejection contract.
[Fixed function and decoder](../plugins/easyeda-pro-control/server/src/current-pcb-diagnostic-opening.ts),
[retained context transition](../plugins/easyeda-pro-control/server/src/current-pcb-diagnostic-context.ts).

Eight new leaf tests and five new context-transition tests pass, together with
the fifteen existing context tests. Coverage includes consumed timeout, missing
prefix, wrong registration, bus/owner drift, private exceptions, exact result
decoding, absent navigation, foreign fragments, loader/context loss, extra
frames and repeat attempts. TypeScript and strict targeted type-aware lint pass.
These synthetic tests do not qualify Electron execution or startup effects.

The original owner now composes preflight, one checkpoint reproof callback and
opening, with installation/native identity checks around the operation. It
retains the decoded reply before final host checks. A retained successful
renderer reply is not an accepted transition if those checks fail; the lifecycle
only publishes a successful opening after the owner method returns normally.
Six added owner tests cover opening, long Unicode paths, refused replies,
checkpoint/installation/source drift, missing navigation, restored child frames,
context loss and worker-discovery ordering over real synthetic child pipes.
The browser/UI/source path uses fifteen requests; opening adds eight and initial
worker inventory adds five. Rejected observations leave normal close and original
root/Job/helper termination available.
[Owner integration](../plugins/easyeda-pro-control/server/src/current-pcb-diagnostic-owner.ts).

Normal opening may migrate the selected database, replay caches, restore its
tabs, contact services, update shared settings and automatically Save. Require
explicit ordinary-effect acceptance and preserve the pre-open checkpoint.
No unchanged-storage or full-startup claim follows from successful opening.
Original diagnostic normal-close, root/Job termination and helper release stay
available after any stopped opening. Do not disconnect its pipe as cleanup.
[Opening effects and recovery contract](../plugins/easyeda-pro-control/skills/easyeda-pro-control/references/current-project-opening.md),
[diagnostic cleanup contract](../plugins/easyeda-pro-control/skills/easyeda-pro-control/references/current-pcb-diagnostic-validation.md).
