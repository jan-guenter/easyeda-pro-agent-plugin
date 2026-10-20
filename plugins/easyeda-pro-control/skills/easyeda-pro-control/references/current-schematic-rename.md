# Schematic-container rename lifecycles

These routes change one ordinary project-local SCH container's title, not a
sheet title or circuit. Each is a native task equivalent with an original SCH
owner. `easyeda_control_project_schematic_rename` supports ordinary projects;
`easyeda_control_disposable_schematic_rename` remains disposable-only. Admit the
installed payload before either workflow. Imported/reuse/block containers,
child reparenting, inverse/delete and explicit Save remain unsupported.

## Ordinary project route

Use `easyeda_control_project_schematic_rename` for the ordinary-purpose
lifecycle. Installed203733 passed this route's own complete title-only lifecycle
on a disposable fixture, including batching. Discovery reports
`validationOnly:false`, `ordinaryProjectsSupported:true` and historical label
`installed203733-ordinary-schematic-title-only-lifecycle`.
`connectedValidation:false` and `executionAuthorized:false` remain intentional:
historical success does not admit the current payload, project or invocation.

Query `project-schematic-operation` with `includeSchemas:true`; validate exact
requests with `project-schematic-operation-validate`. Its `open` includes the
registered path, project UUID, existing PCB UUID, source hash,
`acceptNormalOpenEffects:true` and
`rename:{target,desiredTitle}`. Only this initial open accepts the actual
authenticated `expectedFingerprint` at the tool's top level.
For old sealed opening journals, `confirmDisposableProject:true` remains
accepted but is optional. An omitted field stays omitted; `false` is rejected.
Do not copy a disposable-route owner or its different phase acknowledgments.

Before navigation, the managed checkpoint seals the rename intent, supported
startup, SCH metadata peers and complete child projection. The closed baseline
must still match it. Unsupported or changed data refuse before a title write.
Do not select the old disposable opener or provide an unqualified-startup opt-in
to get past that refusal: the new route retains a distinct purpose throughout.

After successful opening, use a separate `baseline-begin` operation ID with
the same target/title, original `openingOperationId` and
`acceptSchematicRename:true`. Continue through this same tool. Its phase order,
clock/closure requirements and completion criteria below remain unchanged,
but its write step has only `confirmWrite:true` and
`acceptSchematicRename:true`; it never accepts a disposable confirmation.
Its `baseline-open-project` accepts only `acceptNormalOpenEffects:true`, never
the old route's unqualified schematic-startup acknowledgment.

For an uncertain initial open use `inspect-opening`; for a lifecycle use
`inspect`. Both allow historical inspection without recreating process ownership.
Opening recovery offers `observe`, `request-normal-close` or
`retire-after-termination` only as allowed by the original retained state.
After baseline transfer, use the rename lifecycle's offered cleanup instead.
No caller-supplied fingerprint or saved journal can restore continuation.

## Historical connected scope

Installed `0.3.0+codex.20261019203733` completed the separate ordinary-purpose
case with `nextPhase:"completed"`, `renameVerified:true`, retained-owner
retirement and original root/Job termination. Its one acknowledged write passed
complete closed SQL effect verification. Fresh cache-excluded reopening matched
the container, all metadata peers, complete child roster and both AST readbacks.
Final normal closure preserved the complete post-edit SQL. No explicit Save was
sent. This supports the narrow ordinary-project scope above, not generic writers,
another history's startup qualification, complete sheet canvases/connectivity
or delayed subscriber completion. Never replay the completed case.

Installed `0.3.0+codex.20261019143713` completed one title-only case with
`nextPhase:"completed"` and `renameVerified:true`. One acknowledged write was
followed by original root/Job termination and the exact complete closed SQL
effect. Fresh cache-excluded reopening matched the container, metadata peers,
complete child roster and both AST memberships/order. Final normal closure and
complete SQL equality against the post-edit snapshot passed.

Discovery records this as
`installed143713-disposable-schematic-title-only-lifecycle`, not current
execution authority. It does not validate another history, payload or invocation,
complete sheet canvases/connectivity, delayed subscriber completion or
prospective backend actor identity. The separate disposable route gains no
inverse, ordinary-project support or generic SDK wrapper. Installed163322 later
passed its batched disposable lifecycle; that is distinct from the ordinary
route's installed203733 case. None of these completed cases may be replayed.

## Disposable route's original owner

Read [current project opening](current-project-opening.md) for the retained
ordinary launch and disposable opening. The opener's selected PCB binds the
project path. The rename target is a separate existing SCH container, whose
identity, owner, children and history must match the complete closed SQL
baseline. Do not substitute a SCH_PAGE UUID or a PCB UUID.

Query offline `disposable-schematic-rename` with `includeSchemas:true`, then
validate the assembled request with `disposable-schematic-rename-validate`.
Call `easyeda_control_disposable_schematic_rename` with this inner `request`:

```json
{
  "action": "baseline-begin",
  "operationId": "sch-rename-unique-case",
  "openingOperationId": "original-disposable-open",
  "target": {
    "projectUuid": "<64-hex>",
    "branchUuid": "<32-hex>",
    "ownerUuid": "<32-hex>",
    "schematicUuid": "<16-or-32-hex>"
  },
  "desiredTitle": "Disposable SCH title",
  "confirmDisposableProject": true,
  "acceptSchematicRename": true
}
```

Use a distinct unused operation ID. Do not supply a replacement fingerprint,
runtime, file path, clock, actor, program or verifier. The retained opening
already binds those inputs. The title must be trimmed printable ASCII without
capital `I`; case-only changes and collisions refuse. The old normalized name
must also be unique for the later saved absence query.

## Follow the returned phase

Every `advance` names the exact returned `result.nextPhase` in
`step.expectedPhase`, with the acknowledgments shown by offline discovery.

`advance-batch` accepts two to four explicit adjacent phase steps in one request.
Installed163322 passed the disposable batched lifecycle; installed203733 passed
the ordinary-purpose batched lifecycle. Neither admits a later invocation.
Prefer a write/close pair once the returned next phase is `rename-write`, so
normal closure follows the acknowledged write without another agent roundtrip.
The following example is for the disposable route. For the ordinary route,
omit `confirmDisposableProject` from the write step; otherwise validation refuses:

```json
{
  "action": "advance-batch",
  "operationId": "sch-rename-unique-case",
  "steps": [
    {
      "expectedPhase": "rename-write",
      "confirmWrite": true,
      "acceptSchematicRename": true,
      "confirmDisposableProject": true
    },
    {
      "expectedPhase": "rename-close",
      "confirmNormalClose": true,
      "acceptUnknownFileEffects": true
    }
  ]
}
```

The entire array validates before any phase runs. Every listed step keeps the
single-phase guards, acknowledgments, owners and journal behavior. The coordinator
holds its lock between steps and rechecks the exact next phase. It stops on the
first error or pending observation, without retrying, polling, dispatching cleanup
or inferring an unlisted next step. There is no new timeout or clock allowance.
Cleanup steps are excluded. Split a batch before `baseline-relaunch`; the original
launch's separate termination record must already be complete before relaunch.
Do not include that external action in a SCH batch.

Inspect a lost batch reply. `lastBatch` records the explicit requested phases,
attempted and completed step counts, and `running`, `finished`,
`observation-pending` or `failed` status. A finished batch is not a finished rename.
The counts report coordinator attempts, not mutation or persistence proof. A
pending observation counts as attempted but not completed. Only the last batch
is retained in memory; later single-phase calls leave that historical summary
unchanged. Never resubmit the whole batch. If the result explicitly permits a
pending observation, issue a new single advance for that phase. Resume any later
unconsumed phases only from the returned next phase and their own acknowledgments.

| Phases | Required result |
| --- | --- |
| `baseline-close`, `baseline-observe-termination` | One normal close, original root/Job exit and complete raw SQL/native baseline. |
| `baseline-prepare-clock` | One closed-baseline scratch reference for history-date interpretation. The public route supports the aged unlocked-head branch. |
| Original launch `observe-termination` | Record the original ordinary launch's termination before replacement launch, using its launch operation ID. This is not another close. |
| `baseline-relaunch`, `baseline-admit`, `baseline-observe-caches`, `baseline-open-project` | Fresh retained generation, authenticated capture, absent inactive upload caches and project-only opening. |
| `baseline-observe-clock` | Original metadata, complete child roster, startup state and renderer/history clock. |
| `rename-write` | One original-owner clock/actor qualification and fixed title update. |
| `rename-close`, `rename-observe-termination` | Normal closure and exact complete stored-SQL effect. |
| `verification-start`, `verification-admit`, `verification-caches`, `verification-open`, `verification-read` | Fresh generation and matching saved container metadata, all peers and complete child roster. |
| `verification-close`, `verification-finish` | Final original closure and complete SQL equality against the post-edit snapshot. |

The original unlocked SQL head must be at least 61 seconds old under the
retained clock interpretation before the sole write attempt. Wait before that
attempt if needed; a refusal does not grant a retry. Startup must have no editor
tabs, settled project/SCH/PCB holders, complete child membership and dormant
supplier/standardization panels. The optional opening acknowledgment of
unqualified schematic startup effects does not bypass these later checks.

A container's metadata clock can come from a newer child sheet, even though its
own stored SCH header is older. The baseline keeps both clocks and requires a
write newer than both. It preserves the container's own data ticket and every
child record; never substitute a child ticket or edit the header to satisfy the
projection. Stable ordinary parent lineages are supported; conflicting versions
at the maximum time and historical reparenting refuse. The installed143713
result covers its disposable history, not every supported lineage or a later
installed generation.

Ordinary symbols already stored in the project may retain a canonical library
origin. That provenance is not a block-symbol association and does not trigger
a remote fetch. Referenced templates still need complete local source and the
existing PART/startup checks. Imported schematic/page containers, block symbols
and unresolved templates remain unsupported. The admitted stored sheet shape
omits `docType` while the native getter returns `1`. Historical explicit fields
refuse because native reserialization would drop them, violating unchanged-child
proof. Keep those representations separate; never edit the project file to
satisfy a reader.

An unchanged child name may contain capital `I`, but the native getter and both
retained ASTs must match the proposed ASCII-lowercase title before writing.
This is conditional observation support, not a locale-invariant name claim.
Turkic dotless output and non-ASCII child names remain unsupported. The target
container and new rename title retain their stricter no-capital-`I` policy.

Opening and normal closure may automatically persist data. No explicit Save
is sent. A returned title or native acknowledgment is not completion. Require
`result.nextPhase:"completed"` and `result.renameVerified:true`. Completion
includes both reopened metadata and child-roster verification, plus full closed
SQL comparisons. It does not read sheet canvases or verify electrical connectivity.

The delayed SCH subscriber may not have run before closure. Original root/Job
exit proves that generation's contained producers ended; the complete stored
effect then decides whether the intended change persisted. The route keeps
`schematicSubscriberCompletionVerified:false`. Backend actor identity is checked
against the actual saved header and modifier, not inferred from a UI sample
or an extra account query. An unexpected actor or missing effect fails without
another write or Save.

Current UI names and historical project-user names are separate observations.
The route retains the exact UI actor before writing and requires the same UI
actor after reopening. Its UUID selects the backend names from the original
project users table; a missing row produces native empty names. The closed SQL
proof must match those frozen backend names exactly, even when they differ
from the UI. Do not repair the project users table or change accounts to make
the names agree. The installed125900 pre-write refusal on their equality is
terminal for that attempt. Installed143713 passed a new disposable lifecycle
with the corrected actor model; it did not retry or revive the earlier case.

## Lost replies and cleanup

Inspect an uncertain result with `action:"inspect"`. While `busy:true`,
`nextPhase:"stopped"` reserves the consumed phase; it is not a terminal failure.
Await the original tool call. Inspection may be repeated without replaying work.
A client timeout is not cancellation. Do not repeat begin,
launch, navigation, clock collection, rename or close. Normal observation polls
repeat only when authentication or termination is explicitly pending.

`phaseDiagnostics.current` identifies this operation's in-flight action and phase,
its `performing` or `cleanup-selection` stage, and elapsed monotonic milliseconds.
`last` retains only the previous consumed attempt's action, phase, duration and
`succeeded`, `failed` or `observation-pending` outcome. A failed attempt stays
current while its original asynchronous cleanup selection is pending, then
finishes as failed even if cleanup selection succeeds. Durations include that
cleanup work. A successful attempt is not a completed rename; completion still
requires the verified result above. These bounded in-memory diagnostics disappear
with their facade. They are not writer clocks, journal evidence, a timeout or
permission to repeat an action. `busy` applies to the coordinator, so another
operation can keep it true while this operation's `current` is null.

`action:"cleanup", confirmAbort:true` permanently abandons further writing and
selects only an available original-owner cleanup phase. Follow that phase;
partial evidence does not authorize replay of a consumed step. Keep the facade
alive until closure and retirement finish. After a restart, historical inspection
does not restore ownership or continuation.

Do not choose Save/Discard, force exit, restore files, revert the title, clear
caches or alter settings to get past a refusal. Some ambiguous actions can leave
the operation stopped without an available automated cleanup. Preserve the
retained evidence and report the exact stopping point.
