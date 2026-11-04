# Autonomous controller updates

Use the maintained foreground manager for development and repeated disposable
validation. It can retire its own facade, keep the manager alive during an
official plugin installation, and start the verified replacement. Codex stays
running. This is a developer client, not another bridge or native-owner adoption
path. It requires a trusted checkout with the pinned dependencies installed.

## Establish one controller

First query the current Codex connection's offline `loaded-facade`. Finish its
original native cleanup, resource release, record settlement and pending calls.
If it owns the control lease, validate and execute its supported session
retirement while its original package still exists. Require `state:"retired"`,
`leaseReleaseAcknowledged:true` and `liveAdmissionOpen:false`. Keep that Codex
connection offline afterward. A stale or conflict connection cannot retry the
lease or take over control.

Run the client from the trusted checkout's `plugins/easyeda-pro-control`
directory, with Node24.18.0, npm11.16.0 and zero soft core limit. The relative
script path below belongs to that checkout; `--plugin-root` selects a canonical
verified installed package or trusted frozen build:

```bash
node scripts/control-session-manager.ts --plugin-root /absolute/verified/plugin
```

Keep stdin open. For a foreground PTY, use `stty -icanon -echo` before launch;
canonical terminal input can truncate long JSON requests. The manager publishes
its PID, generation, selected root, actual facade PID, tool catalog, offline
loaded-facade identity and private evidence directory. These are observations,
not runtime admission. Complete the actual process/source/package checks before
native or bridge work. It never chooses an alternate control directory.

Ordinary tool requests retain the existing foreground-client grammar:

```json
{"id":"status-1","tool":"easyeda_control_api","arguments":{"request":{"action":"loaded-facade"}}}
```

Use a fresh `responseFile` in a canonical owner-only directory for large results.
The manager serializes calls through publication. It writes private exclusive
evidence before proceeding and never retries a tool, navigation, close or Save.
Semantic tool errors preserve the original connection for explicitly requested
inspection and supported cleanup. Transport or publication ambiguity blocks
replacement; inspect the retained original evidence rather than starting another
controller. A manager generation number is a freshness check, not authority.

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
