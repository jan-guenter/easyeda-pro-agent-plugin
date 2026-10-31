# Read-only native SQL-head age observation

Use `footprint-head-age` when developing the pinned EasyEDA Pro 3.2.209 adapter
and checking how its original main realm interprets an unlocked SQL history
head. This is a distinct original native generation. It opens no project and
performs no copy, delete or explicit Save. It does not enable a blocked writer.
Source implementation and offline tests do not establish a connected result.

## Discover and validate offline

Query `easyeda_control_api` before execution:

```json
{"request":{"action":"footprint-head-age","query":{"includeSchemas":true}}}
```

Validate each exact inner request separately:

```json
{"request":{"action":"footprint-head-age-validate","query":{"request":{"action":"inspect","operationId":"footprint-head-age-example-01"}}}}
```

These requests allocate no native owner, read no selected project and issue no
execution or replay permit. Execute validated requests through the existing
startup tool, with the separate wrapper:

```json
{"request":{"action":"footprint-head-age","request":{"action":"inspect","operationId":"footprint-head-age-example-01"}}}
```

The tool is `easyeda_control_pcb209_worker_startup`. Its name does not imply
that this purpose captures a worker. Existing cache, renderer, main-observation
and ordinary application owners cannot be upgraded to this role.

## Select the disposable checkpoint before allocation

Use a fresh operation ID beginning `footprint-head-age-`, with 24 to 80
lowercase letters, digits and hyphens total. The suffix begins with a letter or
digit. Continue with that same ID and original Codex session through cleanup.

The exact `launch` request contains these fields:

| Field | Required value |
| --- | --- |
| `action` | `"launch"` |
| `operationId` | A fresh ID under the prefix above |
| `target.rawWindowsPath` | Canonical absolute Windows path to the registered disposable `.eprj2` |
| `target.projectUuid` | SHA-256 of the exact UTF-8 raw Windows path string |
| `target.documentUuid` | An undeleted checkpoint-member PCB UUID |
| `target.expectedSourceSha256` | Current complete source-file SHA-256 |
| `confirmValidationOnly` | `true` |
| `confirmDiagnosticLaunch` | `true` |
| `confirmDisposableProject` | `true` |
| `acceptExistingProfileEffects` | `true` |
| `acceptNativeClockObservation` | `true` |

The controller creates and verifies an original managed checkpoint, derives its
default branch and PCB membership, and completes the machine-pinned full SQL
reader before native allocation. The factory independently joins the actual
project, branch and unlocked history head to those original references. A
locked head refuses this age-specific diagnostic. Caller timestamps, branch
IDs, clock samples, runtimes, inspector commands and qualification flags are
not accepted. Equal JSON cannot recreate a completed reader or native owner.

Startup uses the existing profile. It may restore tabs, contact services,
migrate files or persist shared state. Read-only describes the requested clock
work. It does not promise an isolated profile or unchanged project storage.
Do not open the disposable target manually to satisfy a refusal.

## Observe once and finish cleanup

All continuation requests contain only `action` and the original `operationId`,
except `abort`, which also requires `confirmOriginalJob:true`.

| Action | Meaning |
| --- | --- |
| `launch` | Prepare the exact historical checkpoint and start this original native generation once |
| `observe-head-age` | Once after launch, qualify original main-realm Date/now/parser observations and the owner-issued Windows UTC/QPC/zone bracket |
| `normal-close` | Request closure of the original application window once, without choosing Save or Discard |
| `abort` | With explicit original-Job confirmation, cut off later normal work and terminate only this retained Job once |
| `observe-termination` | Observe original root exit and an empty original Job separately, at most 240 times |
| `release-closed` | After observed termination, release original helper resources and observe helper closure |
| `inspect` | Read bounded original or historical status without replaying clock work |
| `settle-records` | Publish only this controller's retained unpublished records; dispatch no native action |

The complete original observation remains in private, bounded, append-only
managed evidence. Public inspection reports its digest and whether it was
observed, plus the bounded observed age and Windows bracket for the original
retained packet. Historical inspection cannot adopt that packet or report a
fresh owner. The two exhaustive timestamp-control rosters each have 1681 entries.
Their dedicated copier admits those arrays only inside the once-retained
native observation; ordinary request and record arrays keep their smaller
bounds. The journal reserves cleanup rows and bytes before normal work can use
them. A clock result proves neither future age at dispatch nor saved content.

The age follows the installed `rl` parser and its use of the current timezone
offset. It is not a canonical UTC creation age. A historical local timestamp
and the current instant can use different daylight-saving offsets. Keep
`timestampInterpretation:"original-rl-with-current-offset"` with the result;
do not replace that behavior with a facade UTC parser or relabel its age.

## Original main process context

The embedded Node 24.14.1 runtime exposes `globalThis.process` through an
accessor. This workflow qualifies its exact bootstrap script, getter/setter
locations and original lexical scopes before binding the original process,
native root PID and environment. The separate opaque capability belongs only
to this native owner's main transport. Copied metadata or a matching script
hash cannot create it. The setter is never called and no global descriptor is
replaced. Each synchronous clock boundary rechecks the original descriptor,
getter result, process/PID/environment identities and absence of every
case-insensitive `TZ` key. Shared scratch and renderer clock guards retain
their own contracts.

The native main budget is 41 normal and four cleanup requests, 45 in total.
Eight fixed preparation requests qualify this process context before the
existing Date-method checks. The native Windows observation bracket still
permits one call, 1024 bounded polls and ten seconds; the process-context work
does not extend it.

A valid bounded CDP exception remains failure evidence. The original runner
retains its complete canonical envelope privately, at most 65,536 bytes, under
the genuine thrown Error. The public failure reports a fixed code, phase and
digest, without foreign exception text. This packet and a successful native
observation share one exclusive journal slot; the existing operation and
cleanup limits remain unchanged. Historical error JSON cannot reconstruct an
owner or permit a retry. Missing, malformed or oversized replies still refuse.

Abort has a separate lane while an observation is pending. The controller
reserves the original owner's cutoff synchronously before its first journal
await, then publishes intent before dispatch. Missing intent acknowledgment
consumes abort without dispatch. A late observation cannot restore normal
continuation. A close or abort acknowledgment is not termination.

After any ambiguous or failed stage, inspect before cleanup. Never retry the
launch, native observation, close or abort. Use only the cleanup actually
offered by the original allocation registry:

- `cleanup-no-resource` requires a genuine factory no-resource outcome.
- `cleanup-unlaunched` requires an original helper whose app launch was never attempted.
- `cleanup-no-process` requires proof that attempted app launch produced no process.

A restarted facade can read historical evidence but cannot adopt its native
owner from an ID, PID, copied packet or journal. Keep the original session alive
until root/Job termination, helper release and all record publication finish.

This workflow issues no native qualification token, runtime admission, replay
permit, writer authority, project-open permission or Save authority. The full
saved copy/delete composition remains separate work. Use
[$easyeda-extension-development](../../easyeda-extension-development/SKILL.md)
for implementation and publication changes.
