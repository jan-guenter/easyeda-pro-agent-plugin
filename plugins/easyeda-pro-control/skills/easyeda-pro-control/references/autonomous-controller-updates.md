# Autonomous controller updates

Use the maintained foreground manager for development and repeated disposable
validation. It can retire its own facade, keep the manager alive during an
official plugin installation, and start the verified replacement. Codex stays
running. This is a developer client, not another bridge or native-owner adoption
path. Packages that ship `server/dist/control-session-manager.mjs` can run it
without a source checkout or npm dependencies. Its frontend must still come
from a trusted verified package or frozen build.

A fresh subagent may also receive an automatically started host MCP connection.
When the foreground manager owns the lease, that connection can be a metadata-only
ownership-conflict stub. The conservative Linux absence probe counts it as another
facade. Close the subagent's own stub before it returns or waits through recovery:
inspect that original connection once, require the returned PID's startup-only
conflict state with no lease, live admission or native resources, retain its
original pidfd, then send `close-conflict` with `confirmCloseConflict:true` on the
same connection once. Observe exit separately. The reported `observedOwnerPid`
is a startup snapshot and is never the close target.

Do not retry a closed transport, repeat an uncertain close or start another agent
to adopt a lost connection. A resumed agent can receive a different connection.
Preserve the original PID/start and package evidence for an authorized cleanup
path; never infer native closure or writer authority from an idle stub's exit.

An unused facade that performed only validated source references and the exact
historical Source metadata workflow can retire after that original coordinator
fully settles. Its private callback history, original references, zero active
calls and no-allocation proof must all remain valid. Foreign historical blockers
stay intact and later live admission still checks them. This exception is not a
way to retire an attempted native owner or turn unknown publication into release.

## Establish one controller

First query the current Codex connection's offline `loaded-facade`. Finish its
original native cleanup, resource release, record settlement and pending calls.
If it owns the control lease, validate and execute its supported session
retirement while its original package still exists. Require `state:"retired"`,
`leaseReleaseAcknowledged:true` and `liveAdmissionOpen:false`. Keep that Codex
connection offline afterward. A stale or conflict connection cannot retry the
lease or take over control.

Use a zero soft core limit. The packaged entry reexecutes the machine
profile's descriptor-verified Node 24.18.0 before starting its original manager.
It preserves the PID and stdio. The profile must already be configured. No npm
command or dependency installation is needed at runtime.

```bash
node /absolute/verified/frontend/server/dist/control-session-manager.mjs --plugin-root /absolute/verified/plugin
```

With no arguments, the packaged entry selects its own plugin root. An explicit
`--plugin-root` can select a different canonical verified installed package or
trusted frozen build. For an update that may prune the frontend's original
package, retain a verified copy of the one frontend file outside that cache
before launch, and pass the target plugin root explicitly. Keep that frontend
frozen through the original manager's lifetime. Copying static code before
startup transfers no native owner or admission.

Use pinned Node 24.18.0 with `--frontend-identity` to observe the frontend file's
actual path, bytes, SHA256, build commitment and bundled SDK version. This starts
no SDK client or facade. Compare those observations with the trusted build or
release bytes; the file's own reported hash grants no authority. This frontend
is a separate artifact. The selected facade still requires its original
three-file runtime identity, complete package and actual process/native
admission. Its native graph cannot be replaced with the frontend's build ID.

A source checkout remains a development option with pinned Node 24.18.0,
npm 11.16.0 and its reviewed dependencies installed. Its original command is
`node scripts/control-session-manager.ts --plugin-root /absolute/verified/plugin`.
Older packages without the standalone entry require that source path. A new
file on disk cannot update an already-running frontend.

Keep stdin open. For a foreground PTY, use `stty -icanon -echo` before launch;
canonical terminal input can truncate long JSON requests. The manager publishes
its PID, generation, selected root, actual facade PID, tool catalog, offline
loaded-facade identity and private evidence directory. These are observations,
not runtime admission. Complete the actual process/source/package checks before
native or bridge work. It never chooses an alternate control directory.

Keep process ownership in the root agent's active tool session through native
cleanup, facade retirement and manager closure, or use an explicitly maintained
persistent service with equivalent custody. A subagent that owns live tool
resources must send status and remain active instead of returning a final answer
with those resources retained. A missing tool session or process listing supplies
no original exit or closure evidence and cannot transfer an unfinished owner.

Ordinary tool requests retain the existing foreground-client grammar:

```json
{"id":"status-1","tool":"easyeda_control_api","arguments":{"request":{"action":"loaded-facade"}}}
```

Use a fresh `responseFile` in a canonical owner-only directory for large results.
Normal calls remain serial through publication. The bounded pending-capture
control below is the only concurrent exception. The manager writes private
exclusive evidence before proceeding and never retries a tool, navigation, close
or Save.
Semantic tool errors preserve the original connection for explicitly requested
inspection and supported cleanup. Transport or publication ambiguity blocks
replacement; inspect the retained original evidence rather than starting another
controller. A manager generation number is a freshness check, not authority.

`result-publication-refused` reports a complete result already retained in the
referenced evidence file. It means an oversized inline result needed a response
file, or the supplied parent directory failed the private/canonical check before
file creation or emission. Verify the evidence bytes and hash; never replay the
operation to obtain its result. The same original normal or cleanup channel
remains available. Actual file/output/evidence failures still block handoff.

Each request line is limited to 65,536 UTF-8 bytes, excluding its newline.
The manager keeps a fixed 64 KiB frame buffer. An oversized frame is drained
through its newline and rejected once without dispatch. Invalid UTF-8 is
rejected without replacement characters or BOM removal. Later complete frames
continue on the same manager, client and generation; ordinary JSON/schema
errors remain local request rejections too. A rejected frame grants no cleanup
or replacement authority. Actual EOF closes the input channel and retains any
active owner according to the existing EOF contract; it cannot restore stdin.

Caller `timeoutMs` defaults to and cannot exceed 3,720,000 milliseconds. This
finite outer bound covers the native owner's one-hour normal lifetime,
one-minute cleanup allowance and one-minute delivery margin, including
preparation outside a leaf RPC timer. It does not guarantee that all I/O finishes
or that timeout cancels native work. Explicit smaller timeouts remain valid.
The packaged direct MCP connection separately uses 3,720 seconds for its host
tool timeout. A foreground caller's deadline cannot change a direct host's
limit, and neither setting extends the original native owner's budgets.

## Inspect or abort an original pending capture

The manager CLI can keep reading stdin while one strict registered
`footprint-forward-prewrite` `capture-project` call awaits its SDK result. The
capture must use the normal bookkeeping budget, with no top-level
`cleanup:true`. Other tool requests, including launch, keep the serial input
path. This route requires a manager process that loaded this implementation at
startup. Editing the checkout cannot hotpatch an already-running serial manager
or add this route to an earlier pending capture. Keep that original owner on its
own supported completion and cleanup path.

Use a fresh side-request ID and the exact original manager generation and
capture request ID:

```json
{"id":"inspect-pending-1","action":"in-flight-original","generation":1,"originalRequestId":"capture-1","request":{"action":"inspect"}}
{"id":"abort-pending-1","action":"in-flight-original","generation":1,"originalRequestId":"capture-1","request":{"action":"abort-generation","confirmAbortOriginalForwardJob":true}}
```

These are the only two side selectors. The outer object requires `id`,
`action`, `generation`, `originalRequestId` and `request`; its only optional field
is an absolute `responseFile`. The inspection request contains only `action`.
Abort also requires the literal confirmation `true`. IDs are strings of 1 to
128 characters or integers, and generation is a positive safe integer. A side
ID must differ from the capture ID and every earlier dispatched side ID for
that capture. Unknown fields refuse before dispatch. Callers cannot supply a
tool, operation, binding, intent, timeout, code or replacement root.

The retained original Connection, SDK client and transport supply ownership.
Generation and request ID only select that private in-memory capture. The
manager generates the operation and binding arguments from its strict original
capture request and validates the generated forward call. The original facade
still checks its private native owner. Copied status or historical JSON cannot
create this route or transfer an owner.

Only send confirmed abort after the user has authorized forced termination of
that original EasyEDA Job. The literal confirmation records existing approval;
it does not authorize host-gateway termination or prove unchanged saved state.
The manager consumes one shared private abort reservation immediately before
SDK dispatch. It remains consumed after a semantic refusal, SDK rejection or
timeout, including through later derived cleanup contexts. Never repeat abort
to obtain a better acknowledgment.

The bounds are fixed:

| Scope | Bound |
| --- | --- |
| Concurrent work | One original capture and one serialized side-input slot |
| Side SDK calls | At most 16 per capture, including inspection and abort |
| Side SDK deadline | 120,000 milliseconds per call, with no caller override |
| Abort | At most one dispatch for the retained capture resource |
| Evidence reservation | Three cleanup records and 64 MiB plus 64 KiB of cleanup bytes before dispatch |

The existing 128-record, 128 MiB cleanup reserve and 65,536-byte input-frame
limit still apply. The side deadline does not cancel native work or extend any
native budget. Exhausted cleanup capacity, evidence/output faults, ambiguous
retirement or loss of the original connection refuse the route. If the parent
SDK request settles while the side intent is being published, the manager
refuses that side call before dispatch and consumes no abort attempt.

`{"id":"manager-pending","action":"inspect"}` reports bounded local manager
state while the capture is pending. `inFlightRequest` distinguishes an SDK
request still pending from side work still publishing. All side inputs,
including local inspection and rejected commands, hold the parent settlement
until their output settles. Evidence files and stdout publication are
serialized; each result uses its own retained evidence receipt. Correlate each
response by ID. A side response does not complete the parent capture.

While the parent or side publication remains pending, ordinary tools, replay,
`cleanup-original`, termination observation, helper release, record settlement,
retirement, startup, shutdown and replacement refuse before dispatch. Wait for
both calls and their publications to settle before those cleanup stages.

Keep the outcomes separate:

- A returned parent result, including a semantic error, remains its exact
  retained result. Side inspection or abort cannot convert it into success.
- A rejected or timed-out parent SDK request retains its unknown outcome under
  its original request ID. The SDK-rejection recovery contract below still
  applies.
- A rejected side SDK request has its own unknown ID and action, with
  `originalCaptureRequestId` recording its parent. A later known parent result
  stays known. Use the actual `interruptedRequest.id` for subsequent
  `cleanup-original` correlation.
- Dispatching confirmed abort blocks ordinary calls permanently for that
  capture. `controlledCapture.parentOutcome` preserves `pending`, `returned`
  or `unknown` separately. If no SDK request was rejected, the retained cleanup
  context is `controlledCapture.id`; use that ID in the existing
  `cleanup-original.interruptedRequestId` field. The
  parent outcome remains known.

After both calls settle, finish original inspection, actual original-root and
empty-Job termination, record settlement and acknowledged helper release through
the supported five-action cleanup route. Its inspection must supply the exact
intent before `settle-records`. A successful side abort alone proves none of
these later steps. Only genuine facade retirement followed by observed original
child EOF, code-zero exit and stdio closure permits replacement. Closing stdin
while an owner remains never performs that cleanup.

## Recover after an SDK rejection

After an RPC rejection or timeout of a bound `footprint-forward-prewrite`
request, `inspect` reports
the privately retained interrupted request ID and generation. Normal calls,
replay and replacement stay blocked. The manager's separate `cleanup-original`
command uses that exact original client and transport.

A strict interrupted `launch` has no binding in its original arguments. Until
the manager learns it, only `cleanup-original` with `request:{action:"inspect"}`
is available. The same original client must return a complete matching private
attempt inspection: `state:"launched"`, acknowledged launch, full binding,
intent/binding digests and `publicationSettlementAvailable:true`. Incomplete or
historical inspections leave cleanup restricted to inspection. The learned data
cannot recreate a native owner; every cleanup action still passes the original
facade's private owner guards. Result-publication failures cannot create this
launch-recovery context.

Use `abort-generation` only when the user has authorized forced termination of
that original EasyEDA Job. The confirmation below records that authority; it
does not grant it or prove unchanged saved state.

```json
{"id":"inspect-original","action":"cleanup-original","generation":1,"interruptedRequestId":"capture-1","request":{"action":"inspect"}}
{"id":"abort-original","action":"cleanup-original","generation":1,"interruptedRequestId":"capture-1","request":{"action":"abort-generation","confirmAbortOriginalForwardJob":true}}
```

Only `inspect`, explicitly confirmed `abort-generation`, `observe-termination`,
`release-closed` and `settle-records` are accepted. The manager injects the
original operation and binding from its interrupted arguments or qualifying
same-client private launch inspection, and validates the generated call with the maintained forward schema. Callers cannot supply a tool,
operation, binding, code or intent hash. `settle-records` requires the intent hash
from an earlier same-operation, same-binding original inspection. These calls
consume the bounded cleanup reserve and never retry automatically. A refused or
disconnected cleanup stays blocked. Unpublished evidence, failed result
publication or an ambiguous retirement supplies no cleanup or replacement
permission. Finish supported original cleanup, then
request ordinary manager retirement. Only its genuine facade retirement and
observed original child closure permit replacement; the interrupted request's
unknown outcome remains retained even after separate cleanup succeeds.

### Separate disposable v2 source-validation family

The strict `footprint-forward-source-validation` wrapper uses the same manager
protocol for its once-only `capture-source`. The private original request also
retains its exact family; a caller cannot choose another wrapper during cleanup.
Pending capture accepts only original inspection and the explicitly confirmed
`abort-generation`. Despite its historical `confirmAbortOriginalForwardJob`
name, that confirmation targets the actual original v2 Job.

A new-family interrupted launch may settle its original private journal before
a binding has published. `cleanup-before-launch` and `cleanup-no-process` are
additional fixed selectors only for that same interrupted new-family launch.
The original provider must prove its own allocation/launch outcome and closure;
no journal, owner or receipt is adopted. A successful acknowledgment only lets
the manager attempt genuine facade retirement; it is not termination or native
ownership proof. Old `footprint-forward-prewrite` requests refuse these selectors.

New-family launch binding learning requires its exact inspection schema,
matching operation, retained original owner/lease, settled publication and the
published original binding record. A failed launch may retain cleanup custody
without a successful launch acknowledgment. This grants cleanup data only;
normal work, replay and replacement remain blocked. Unlike the old-family
intent-bound selector, new-family `settle-records` selects only that exact
original private provider/journal and sends no native request. Read
[the source-validation workflow](current-footprint-forward-source-validation.md).

## Finish the original workflow

Diagnostic and ordinary-launch owners use their own existing release actions.
Project opening, PCB/SCH rename and symbol workflows have a separate explicit
helper-release tool. Query offline `native-release` with `includeSchemas:true`,
then validate the exact request with `native-release-validate` before execution.
The initial ordinary launch's termination record must already be published.
For opening-only work, finish its original `observe-termination` action before
helper release. Later metadata generations retain their own final verification
proof, with initial ordinary termination recorded before the first relaunch.

```json
{"id":"release-1","cleanup":true,"tool":"easyeda_control_native_release","arguments":{"request":{"action":"release-completed","kind":"pcb-rename","operationId":"original-operation-id","confirmReleaseOriginalRuntime":true}}}
```

The top-level `cleanup:true` marker charges the manager's reserved cleanup
budget. Use it for explicit cleanup calls after normal-call capacity is
exhausted. It grants no facade authority and changes no tool arguments.

Kinds are `project-opening`, `pcb-rename`, `schematic-rename`, `symbol-metadata`
and `symbol-copy`. Each original owner determines whether its exact workflow is
eligible. Completion alone does not close EasyEDA: original latest-root and empty
Job termination, released captures, settled journals and acknowledged helper
closure are required. Partial construction and unsupported stopped states remain
blocked. Never clear coordinator references or infer disposal from JSON status.

The result preserves both `requestedOperationId` and the actual final disposal
operation ID. Completed disposable metadata validation can release its final
inverse verification generation. This distinction grants no inverse execution.

If helper closure was acknowledged but completion publication failed, use the
same tool's `settle-release-records` action with the original kind and operation
ID. It publishes retained evidence only. It cannot invoke helper release again,
recover ownership from history or turn a rejected release into success.

## Retire, install and replace

After every original workflow and call has settled, send:

```json
{"id":"retire-1","action":"retire","generation":1,"confirmRetire":true}
```

The manager invokes its original facade's retirement tool. It requires the exact
retired acknowledgment, then closes that child's stdin and separately observes
both process exit and stdio closure with code zero and no signal. It sends no
termination signal. Only then does it publish `replacementAllowed:true`.

An acknowledged preflight refusal is inspected on that same connection. Exact
active state preserves the original cleanup path; finish that cleanup before
another explicit retirement while its cleanup reserve remains available.
Before dispatch, inspect `budgets.records.cleanup` and `budgets.bytes.cleanup`.
An ordinary retirement requires room for three cleanup records and 4 MiB in
that reserve: at most 125 used records and 130,023,424 used bytes, within the
128-record and 128 MiB limits. If either threshold is exceeded, the manager
permits one final retirement and sets `finalRetirementAttemptConsumed` before
dispatch. For example, at 126 used cleanup records another cleanup call can
still fit, but retirement is already final. Even an exact active-state
preflight refusal consumes that final attempt. Finish original cleanup before
using it. After successful final retirement and child closure, shut down the
exhausted manager; it cannot start another generation. Unknown acknowledgments
or transport failures never authorize a replacement. Keep the manager alive
through review of ambiguity.

Run the official Git marketplace upgrade and verify the installed state and
complete package after retirement. Installation can prune the old package, so
retirement must precede it. No installer command or arbitrary hook is accepted
by the manager. The agent runs the official CLI separately and checks whether
the upgrade already installed the target before considering plugin add.

Then select the verified replacement explicitly:

```json
{"id":"start-2","action":"start","afterGeneration":1,"pluginRoot":"/absolute/verified/replacement"}
```

Selection consumes the retained replacement permit before startup. The new
generation must match its actual loaded PID/module and pinned Node. A conflict,
failed selection or uncertain startup cannot retry using that permit. Prove the
new process/source/runtime admission before live work; the predecessor's
admission does not transfer. A trusted frozen build can be selected for scoped
validation before publication, avoiding a new release for each source change.

Use `{"id":"inspect-1","action":"inspect"}` for bounded manager state and
private record references. Use `{"id":"done","action":"shutdown"}` after
acknowledged retirement and observed child closure. Do not end stdin while a
native owner remains. The manager's bounded evidence budgets reserve cleanup
and control capacity; budget refusal grants no replay or takeover.

Keep new MCP connection creation outside the retirement-to-replacement window.
Source/review subagents can initialize their plugin connection while the live
controller still owns the lease. A competing connection from the same agent
team must retire through its own supported tool; another chat's owner cannot
be displaced. If startup fails, inspect first. A selection or runtime failure
before child allocation leaves no original starting child, so `cleanup-startup`
refuses. Shut down only after inspection confirms no owned child remains.
If startup retained an unused child, with no caller tool dispatched, use
`{"id":"startup-cleanup","action":"cleanup-startup","confirmCloseOriginalStartup":true}`.
It closes only that manager's retained unused startup child through EOF and
observed exit/stdio closure. It never retries or promotes the conflict, creates
a replacement permit, or closes the competing owner. After cleanup, shut down
the blocked manager and establish a genuinely new client only after the lease
is free. Retained raw catalog evidence distinguishes this failure from an
admitted live controller.

This workflow removes routine Codex restarts and manual EasyEDA closing from
supported lifecycles. It does not unlock a Windows desktop, answer credentials
or unknown prompts, repair unsupported native failures, or transfer unfinished
native ownership to another process.

### Historical Source v2 metadata recovery

The separate `footprint-forward-source-relinquishment` wrapper creates no native
owner. After original process cleanup, a fresh facade may qualify only the fixed
externally reviewed history with global Linux/Windows absence and complete
unchanged source, SQL and history checks. Its original capture, termination and
helper-release outcomes remain unknown. Keep its same metadata coordinator
through a pending receipt acknowledgment; retire it normally before a new
native validation generation. Read the [exact historical contract](current-footprint-forward-source-relinquishment.md).

After an SDK timeout in historical Source metadata work, use only the original
manager's `cleanup-original` selector `settle-historical-metadata`. It sends a
settlement-only request reconstructed from the private original call. No caller
payload, new observation or native cleanup is admitted. Busy or missing pending
evidence refuses; the original outcome remains unknown. Only the original
facade's retirement preflight can authorize closure and a later generation.

## Original spatial cleanup

The maintained frontend also classifies strict `spatial` and
`component-spatial` requests under `easyeda_control_pcb209_opening`. The latter
uses only its separate `pcb209-spatial-component-*` purpose. These are data
classifications; the facade retains the actual native owner.

While one original spatial call is pending, `in-flight-original` admits only
`inspect` on that same operation/client. It offers no navigation, point replay,
normal close or force-abort side action. After a timeout/rejection, use the
returned original request ID and generation with `cleanup-original`:

```json
{"id":"spatial-inspect","action":"cleanup-original","generation":1,"interruptedRequestId":"original-spatial-call","request":{"action":"inspect"}}
{"id":"spatial-window","action":"cleanup-original","generation":1,"interruptedRequestId":"original-spatial-call","request":{"action":"observe-window"}}
{"id":"spatial-close","action":"cleanup-original","generation":1,"interruptedRequestId":"original-spatial-call","request":{"action":"normal-close","confirmNormalClose":true}}
{"id":"spatial-terminated","action":"cleanup-original","generation":1,"interruptedRequestId":"original-spatial-call","request":{"action":"observe-termination"}}
{"id":"spatial-release","action":"cleanup-original","generation":1,"interruptedRequestId":"original-spatial-call","request":{"action":"release-closed"}}
```

A fresh same-client private-attempt inspection must supply the exact intent and
original binding, and report that the original call is no longer busy. The
manager obtains the HWND only from its own `observe-window` result and injects
the operation, binding, wrapper and HWND. Caller substitutions refuse. Close and
release consume their attempts before the original SDK call; a lost reply does
not permit replay. The facade independently rechecks its real window/root/Job
and cleanup state. `settle-records` publishes only that facade's retained local
records. Prelaunch `cleanup-before-launch` maps to `cleanup-unlaunched`, and
`cleanup-no-process` requires the corresponding fresh original inspection data.

This path creates no owner from historical JSON, signals no PID, answers no
Save/Discard prompt and grants no persistence or replacement proof. Complete
actual original termination and helper release before normal manager retirement.
Source/synthetic recovery checks do not establish a connected Component case.
