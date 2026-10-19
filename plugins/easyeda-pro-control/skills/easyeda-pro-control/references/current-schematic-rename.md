# Disposable schematic-container rename

This route changes one ordinary project-local SCH container's title, not a
sheet title or circuit. It is a native task equivalent with a separate SCH
owner. The source implements the lifecycle; no connected SCH rename case has
passed yet. Use only an explicitly disposable project, after admitting the
installed payload. Ordinary projects, imported/reuse/block containers, child
reparenting, inverse/delete and explicit Save are unsupported.

## Select the original owner

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
at the maximum time and historical reparenting refuse. This source support still
needs a complete connected lifecycle on the updated installed generation.

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

## Lost replies and cleanup

Inspect an uncertain result with `action:"inspect"`. If `busy:true`, wait and
inspect again. A client timeout is not cancellation. Do not repeat begin,
launch, navigation, clock collection, rename or close. Normal observation polls
repeat only when authentication or termination is explicitly pending.

`action:"cleanup", confirmAbort:true` permanently abandons further writing and
selects only an available original-owner cleanup phase. Follow that phase;
partial evidence does not authorize replay of a consumed step. Keep the facade
alive until closure and retirement finish. After a restart, historical inspection
does not restore ownership or continuation.

Do not choose Save/Discard, force exit, restore files, revert the title, clear
caches or alter settings to get past a refusal. Some ambiguous actions can leave
the operation stopped without an available automated cleanup. Preserve the
retained evidence and report the exact stopping point.
