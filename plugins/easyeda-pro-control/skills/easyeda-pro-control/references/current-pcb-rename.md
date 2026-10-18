# Disposable PCB rename

This route changes one PCB title in an explicitly disposable local project.
It is not ordinary-project support, a drawing edit or a general
`eda.dmt_Pcb.modifyPcbName` implementation. Installed195000 passed one complete
disposable title-only lifecycle: exact closed SQL effect, fresh matching saved
PCB metadata and peers, final SQL equality and original process closure. No
explicit Save or inverse ran. That historical result does not admit another
payload, project history or invocation. The installed121700 read-only preflight
passed separately, with unchanged complete saved data after normal closure.

## Prepare and begin

Read [current project opening](current-project-opening.md) for the original
ordinary launch and disposable opening. Keep that facade alive. The rename
route consumes its retained opening owner; it cannot adopt a separately opened
project, another process or a previous chat's journal.

Query offline `disposable-pcb-rename` with `includeSchemas:true`. Validate the
assembled request through `disposable-pcb-rename-validate` before calling
`easyeda_control_disposable_pcb_rename`. Do not send `expectedFingerprint` to
this tool. Its original opening already retains the runtime and local path.

Pass the following object as the tool's `request` field, using the actual
disposable target:

```json
{
  "action": "baseline-begin",
  "operationId": "pcb-rename-unique-case",
  "openingOperationId": "original-disposable-open",
  "target": {
    "projectUuid": "<64-hex>",
    "branchUuid": "<32-hex>",
    "ownerUuid": "<32-hex>",
    "pcbUuid": "<16-or-32-hex>"
  },
  "desiredTitle": "Disposable PCB title",
  "confirmDisposableProject": true,
  "acceptPcbRename": true
}
```

Use a distinct unused operation ID. The target must be the opening's exact
checkpoint-member PCB. The supported title is trimmed printable ASCII, without
capital `I`, because native locale folding can otherwise disagree. Existing
native names must also pass the original baseline's collision rules. Do not
change project settings, names or locale to bypass a refusal.

## Follow the returned phase

Call `advance` with the same `operationId` and `step.expectedPhase` equal to the
returned `result.nextPhase`. Discovery lists the required acknowledgments for that
phase. No later request accepts a replacement title, target, runtime, clock,
code or verifier.

| Stage | Purpose |
| --- | --- |
| `baseline-close`, `baseline-observe-termination` | One normal close, original process/Job exit, complete raw SQL/native baseline. |
| `baseline-prepare-clock` | One original closed-baseline scratch reference for history-date interpretation. |
| Original launch `observe-termination` | Record the original ordinary launch's termination before replacement launch. Use its launch operation ID, not the rename ID. This is observation, not another close. |
| `baseline-relaunch`, `baseline-admit`, `baseline-observe-caches`, `baseline-open-project` | Fresh retained generation, authenticated capture, inactive upload caches and project-only opening. |
| `baseline-observe-clock` | One PCB startup/metadata sample and original renderer/history clock observation. |
| `rename-write` | Original actor/dual-clock checks and one fixed title-only native update. |
| `rename-close`, `rename-observe-termination` | Normal closure and complete stored-effect comparison. |
| `verification-start`, `verification-admit`, `verification-caches`, `verification-open`, `verification-read` | Fresh generation and cache-excluded saved PCB metadata/peer read. |
| `verification-close`, `verification-finish` | Final original closure and complete SQL equality against the post-edit snapshot. |

The optional `acceptUnqualifiedSchematicStartupEffects` on project opening
permits observation only. It does not skip the later startup or writer checks.
The fixed writer excludes active auxiliary supplier/standardization panels and
requires settled project, schematic and PCB holders. It does not claim that
sampling a settled AST proves complete canvas equality.

The standardization panel has a normal hidden placeholder even before use.
Its presence alone is not activation. The guard requires that exact dormant
container and excludes active, initialized, replaced or changed state. Fixed
startup diagnostic labels identify the failing check without returning private
DOM contents. A historical `auxiliary-panel` failure does not identify its
unseen values. Do not hide, clear or recreate a panel to bypass a refusal;
use the offered original-owner cleanup and preserve the failed case.

Before `rename-write`, the original unlocked SQL history head must be at least
61 seconds old under the retained native date/clock interpretation. If it is
too recent, wait before the sole write attempt. Do not attempt early and retry
after its refusal; that attempt is consumed.

Opening and normal closure can automatically persist files. No explicit Save
is sent. A returned title, successful native acknowledgment or apparently
unchanged screenshot is not completion. Accept completion only when
`result.nextPhase` is `completed` and `result.renameVerified` is true. Inspect the retained
comparison artifacts as needed. Reopened native verification is metadata-only;
saved drawing and peer invariance come from the complete closed SQL checks.

Backend persistence can follow the native acknowledgment: the current worker
buffers uploads for500ms. The immediate return clock bounds renderer samples;
the original process's independently proved exit bounds the later backend
timestamp, still within the fixed pre-dispatch window. Do not add sleep/retry,
extend a consumed window or promote an earlier failed case. The installed184000
case reached the writer but stopped at the old immediate-post backend bound;
it was retired without reopened verification and is not a passed lifecycle.

## Failure and cleanup

Inspect a lost response with `action:"inspect"`. Never repeat begin, launch,
navigation, clock collection, rename or close. In the normal sequence, repeat
an observation only when it returned pending authentication or termination.
An explicitly offered cleanup phase can instead continue from retained partial
evidence. It skips consumed snapshot/comparison steps rather than replaying them.

Inspection can return while the original phase is running. If `busy:true`,
the detached snapshot is not a terminal result: wait and inspect again without
advancing, replaying the phase or restarting the facade. A client response
timeout does not establish cancellation. Historical records can make validation
slow even when no native write is pending.

`action:"cleanup", confirmAbort:true` permanently abandons further writing and
selects an available original-owner cleanup phase. The returned phase may
capture a retained failed opening solely for closure, request one normal close,
observe an already requested close, or retire an already closed capture. It
does not create a new owner or restore a continuation from JSON.

Use only the offered cleanup phase. Missing ownership, a consumed ambiguous
action or changed evidence can leave the attempt stopped. Keep the facade
alive for inspection. Do not answer Save/Discard, force termination, delete the
fixture, revert its title or submit an extra Save as recovery. Historical
inspection after restart is not permission to continue.

Linked reuse-block renaming, ordinary-project renaming, inverse/delete, other
PCB metadata, geometry editing and broad library writers remain unsupported.
