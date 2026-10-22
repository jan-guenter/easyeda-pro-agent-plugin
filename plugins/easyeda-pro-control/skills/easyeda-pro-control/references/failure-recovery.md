# Failure recovery

An ambiguous operation must not be repeated or saved. Inspect its journal and preserve the checkpoint, created IDs, runtime proof and phase artifacts. A delayed call may have completed after the response deadline.

For an ordinary application launch with only an intent after a facade restart,
use the [intent-only startup recovery procedure](connection-and-context.md#intent-only-launch-after-a-restart).
It requires a fresh coordinator and excludes the old helper's delayed launch
before recording abandonment. It does not settle a design operation or prove
that the earlier application never launched.

Current restriction: schematic-page, symbol and PCB design journals cannot
commit, roll back, repair or complete nonterminal reconciliation. Eight
symbol/page/container metadata writers are likewise blocked; see
[the exact library list](libraries-and-eco.md#structure-write-completion-restriction).
Native structure-job completion and its full SQL effect remain unimplemented.
Historical terminal inspection and pure evidence checks remain available, as
does invalidation of an exactly undispatched library preparation. Summaries
retain old advice separately; it is not current execution authority. The
affected recovery profiles below describe historical contracts only. Footprint
and unrelated library recovery retain their independent guards.

## Closed-symbol validation rejected before navigation

For exactly sixteen closed-symbol validation events ending at `edit-marker-read`,
the maintained verifier accepts either `ERR_CONFIRM_WRITE_REQUIRED` before the
handler or a complete successful fixed marker read with no marker creation.
On the current tuple use `easyeda_control_history`, with
`request:{action:"abandon-before-navigation",operationId:"...",confirmation:"<operationId>:abandoned-before-navigation"}`.
Query offline `history` and validate with `history-validate` first. The exact
confirmation is not a human restart attestation. Supply no restart, discard,
repeat or fingerprint fields. This local serialized route checks the complete
retained prefix, fixed request/result, absence of later navigation/edit evidence,
permanent claim and unchanged complete saved database before publishing an
exclusive abandonment record.
It makes no application call and leaves the original journal, startup marker and
permanent target claim intact.

A separate legacy-only profile accepts exactly six successful baseline events ending in
`baseline-marker-create`, with no later phase evidence. It is not exposed by
`history`: its retained-entry reservation requires the original legacy recovery
route. On that tuple use `easyeda_control_recover_incomplete` with the original
ID, `resolution:"abandoned-before-navigation"` and matching confirmation.
That legacy route also retains the sixteen-event case. It validates the fixed
startup program, complete original result, marker/claim binding and preserved
artifacts. An optional retained window diagnostic is evidence only. The recovery
callback shares the coordinator's gate and cannot abandon an active invocation;
a same-host retained attempt must have returned stopped for this operation.
This profile makes no current project read and proves neither file invariance
nor process closure. It is not the sixteen-event transport-refusal profile.

Abandonment is not completion, rollback, process-termination proof or permission
to repeat the validation request. Its historical evidence only removes that
specific unfinished-operation blocker; every new operation retains its normal
admission checks. Other failure phases and ambiguous calls remain unsupported.
An existing valid abandonment record can be inspected again without publishing
another record or rechecking the now-current design as historical evidence.

## Closed baseline stopped before relaunch

For the current disposable baseline workflow, `easyeda_control_history` also
accepts `action:"abandon-baseline-before-relaunch"`, the exact `operationId`,
`confirmDisposableProject:true` and
`confirmation:"<operationId>:abandoned-before-relaunch"`. Check offline `history`
and `history-validate` first; older installed versions do not expose this action.

This accepts only the complete seven-phase record ending in a stopped relaunch
before its durable launch intent. It verifies the original journal, capture,
normal-close and termination evidence, closed baseline and absence of later
phase evidence. A boolean saying launch failed is insufficient. Retained binary
copies are rehashed without reading the original project or running EasyEDA.

The exclusive `abandoned-baseline-before-relaunch.json` sidecar leaves the
original journal and all copies intact. A valid sidecar removes only this
specific historical blocker. It does not prove current process absence or
current source invariance, restore lost handles, complete the lifecycle or
permit replay. A later launch intent, ambiguous dispatch, missing evidence or
changed artifact still refuses. Any new operation needs its own admission.

## Typed design and library recovery

1. Use `easyeda_control_design` inspect with the operation ID, or the corresponding library inspect action. `easyeda_control_recover_incomplete` with no ID lists managed incomplete operations. Local artifact/evidence inspection remains available.
2. If `orphanedCallPossible` is true, the global bridge quarantine applies. Do not route around it through another facade, a new control directory or native design edits. The selected recovery must be isolated from other incomplete/unreadable journals.
3. Request normal close of the retained EasyEDA runtime only within the user's authority. Inspect any prompt. Never choose Save after an unknown write. Discarding unsaved state or force termination requires separate applicable authority; the packaged controller does neither automatically.
4. After old execution authority actually terminates, launch the replacement contained runtime and establish a new authenticated session. Typed `recover-authority` consumes its current operation/phase/attempt-bound technical challenge internally. The retained process handles, old-session closure in the same gateway, replacement renderer/session and unchanged policy are the proof. A copied PID, reconnection or confirmation flag is insufficient.
5. Recovery clears only the execution-authority gate. It does not classify the design or assume unsaved changes were discarded. Design and library `open-target` take the original operation ID and `confirmOpen:true`; they open its checkpoint-proven original target and retain the current tab without rewriting the sealed plan. Do not start a new runtime `open-existing` transaction while another operation is incomplete.
6. Use design `reconcile`. Exact live baseline plus unchanged complete durable records can finish as no-mutation. Exact intended live state can return to applied-unsaved only when no Save intent or legacy Save evidence exists. A supported retained save/reopen result may finish without repeating Save. A prior attempted Save with incomplete proof, or any collateral change, remains a review stop.

Library `reconcile-no-mutation` accepts only the unchanged baseline. Library `reconcile` may instead verify the original returned mutation against its retained native-return artifact, prepared device plan and complete durable project-record delta. It never repeats a mutation, export, save, close or inverse. Missing identity or conflicting evidence remains a review stop. A recovered changed result is saved-record proof, not library-editor reopen proof.

A library-design commit can separately account for one earlier, fully journaled rollback whose native disk write arrived after the current baseline. This requires the exact terminal prior journal and inverse artifact, the same project/owner/runtime, chronological preparation evidence, and complete forward and inverse project proofs. The result is explicitly `isolatedTransaction:false` with both proofs and original hashes, not an unchanged-collateral claim. Any other change still stops recovery. Never change the sealed baseline or delete the prior journal to make a comparison pass.

A facade/gateway restart can lose the retained authority and closed-session history needed for automatic proof. Do not forge replacement evidence or delete the journal to proceed. Preserve the files and request a reviewed recovery path.

For an exactly diagnosed schematic flag/drop split, `repair-layout-wire-groups` corrects the original failed layout without replaying it. Keep its original plan, checkpoint, created IDs and returned acknowledgment. It refuses prior correction intents, Save attempts, unrelated source/durable changes and pin-net differences outside the enumerated generated-name defect. Reconcile or commit the same operation afterward; never create a second layout to work around the failed journal. Native auto-persistence can already have written the failed layout despite `saved:false`.

For an unfinished design or library journal after a facade upgrade, `rebind-runtime` accepts the replacement `expectedFingerprint` and `confirmRuntimeUpgrade:true` only when no orphan risk remains and every external EasyEDA/upstream fingerprint field is unchanged. It records the replacement facade identity without modifying the sealed original plan. Reconciliation is still required; this cannot clear an orphan or accept a changed EasyEDA implementation.

If full schematic topology is unavailable after reopening, `load-layout-pages` with the original design operation ID and `confirmOpen:true` loads the declared sibling pages and returns to the target without saving. Besides unfinished layouts, the path admits a settled, pre-Save `sch.wire.modify` failure only after its exact stored baseline and lifecycle-equivalent native state are restored. It rejects prior page-loading intent, correction, inverse or Save evidence. The fresh target must remain fully unchanged during navigation, and all original endpoints must match afterward. Reconcile the same journal separately. Never replay a partially dispatched page load. This restored-wire path passed nine-page loading and subsequent 850-document no-mutation reconciliation on private design; it does not restore a checkpoint, authorize another edit, or validate the wire writer.

An unfinished runtime `open-existing` operation uses `inspect-open`, `recover-open-authority`, `rebind-open-runtime` and `reconcile-open`, not the design/library recovery actions. Reconciliation inspects the current exclusive tab and unchanged database without repeating navigation. See [connection-and-context.md](connection-and-context.md#legacy-existing-project-open-from-start-page).

New project-open failures retain a fixed category and coordinator phase in an
immutable failure artifact. It survives later inspection and reconciliation;
raw error messages and private payloads are not retained there. Recognized
`RECOVERY_EDITOR_READINESS_*` categories identify the failed readiness check,
not permission to retry navigation. Older journals may lack this artifact. A
later observed open tab does not reconstruct a missing initial acknowledgment
or establish the initial failure's exact cause.

Current disposable opening has its own original-owner `request-normal-close`
and terminal-only `retire-after-termination` actions. Follow
[the interrupted-call procedure](current-project-opening.md#interrupted-calls).
That narrow close does not contact the bridge, clear quarantine, repeat
navigation or prove file contents. The ordinary launcher's close remains
subject to quarantine; do not switch to it after the scoped close is consumed.

Rule checks have their own inspect, recover-authority, open-target, rebind-runtime and reconcile-no-mutation actions under `easyeda_control_check`. A failed or timed-out check is never rerun by recovery. Reconciliation compares the retained full calculation scope and complete saved SQLite baseline; it does not manufacture a report from an unknown check outcome. Other incomplete operations block a new check.

## Saved library edit awaiting reopen

If a symbol or footprint Save succeeded but reopen failed, reconcile the original design journal. It rehashes the retained Save and durable-before-close artifacts, recomputes the full project proof from their checkpoint, then checks fresh source and saved records. `saved-awaiting-reopen` means that evidence passed, not that reopen completed. Missing acknowledgments or conflicting durable evidence stop recovery; a saved flag alone cannot authorize it.

Commit that same operation ID to perform only close/reopen and final verification. It never repeats Save or the edit. An exact retained successful reopen receipt can instead finish verification without another navigation. Read or checkpoint failures before dispatch do not consume the recovery navigation. A dispatched navigation without a success receipt remains incomplete and is never blindly repeated.

## Save is never retried

Every typed design commit records a durable Save intent immediately before
dispatch, after final authority checks. Failed, missing or ambiguous
acknowledgments do not erase that intent. Reconciliation, runtime rebinding and
facade restarts cannot authorize a second Save. Legacy Save lifecycle artifacts
also count. A refusal before dispatch and before intent is different from an
attempted Save; inspect the actual retained evidence, not the error text alone.

Retained-proof recovery remains operation-specific. Do not generalize wire,
layout, copper or library recovery to another action. If no maintained path can
prove the already attempted lifecycle, preserve evidence and request review.

## Inverse and delayed persistence

An inverse is also one-shot. Its retained intent, preparation or acknowledgment
survives reconciliation and runtime rebinding; none authorizes another inverse
or a subsequent Save. The summary's `inverse.available` is conditional admission information,
not permission to dispatch from a stale summary.

For flat display edits, an unsaved inverse requires fresh proof that durable
state still matches the original baseline. If native auto-persistence already
stored the forward effect, rollback refuses before dispatch. Do not relabel that
effect as unsaved because the agent has not clicked Save.

If an older inverse already restored live state but its durable proof failed,
preserve the journal and both observations. The upload barrier waits for task1;
it does not drain a pending structure timer or later task2 job, initiate Save,
or guarantee that editor changes were queued.
A later read-only checkpoint may show delayed native persistence. Only then can
same-journal reconciliation verify the original live baseline, complete durable
restoration and unchanged peers. Do not change autosave settings, repeat the
inverse, click Save or close the editor to force this outcome. A continuing
live/saved mismatch remains unresolved.

### Retained wire Save

After standalone `sch.wire.modify` reaches Save, never commit it again. The
executor retains a Save-attempt marker before dispatch and also recognizes
legacy lifecycle artifacts. Missing, failed or duplicate acknowledgments cannot
return that journal to `applied-unsaved` or authorize another Save.

With one complete successful Save/close/reopen acknowledgment, reconcile the
same journal. The wire-only path verifies its hash-bound preceding after-state,
the exact Save guard and lifecycle receipt, fresh typed source/native effect,
original full topology, complete durable project delta and final stable state.
It dispatches neither Save nor navigation. Conflicting evidence remains a stop;
do not edit the journal or substitute a new operation. After a package/runtime
change use the ordinary rebind and target recovery first. The retained fixture
recovery and fresh 16-document wire lifecycle completed Sept25. This is a
narrow source/lifecycle profile, not blanket permission for wire changes.

### Retained PCB text creation Save

For `pcb.text.create`, reconciliation can reuse the original six sealed phases
and exactly one successful Save/close/reopen acknowledgment. It checks fresh
source, complete durable records, peer raw histories, checkpoint stability and
the pinned native decoder implementation. It does not create text, regenerate
an ID, navigate or Save. Missing or conflicting evidence stays a review stop.
Consumed-Save text modification and deletion are not covered by this path.

Creation profile v2 requires exact explicit-black source and storage. The legacy
v1 exception accepts only one original black STRING followed by the reserved
null STRING, with its full raw creation suffix and historical decode order
proved. Components/templates, mixed global FONT/BLOB families and every other
source or durable change refuse. The journal's original null intent stays
unchanged; the observed black export is separate evidence, never normalization.

This is read-only completion, not permission for a later inverse or text edit.
Use a fresh clean disposable target for v2 lifecycle validation unless a separate
strict preflight proves that a later write will preserve the legacy stored null.
Do not delete the recovered text, repeat Save or repair its color automatically.
Source/offline tests do not yet establish connected recovery success.

## Native UI failures

A native input failure may report `dispatched:true`; that is uncertainty, not permission to repeat a click, key or import. Reinspect the exact owned window and affected design when bridge quarantine permits it. UI inspection is not a save/reopen or connectivity proof. `observed-unowned` process binding supports native bootstrap but never substitutes for retained Job authority.

For a settled API call whose own unsaved target blocks normal close, the explicit [discard-close recovery](native-ui.md#discard-close-recovery-for-the-operations-own-unsaved-target) action preserves saved evidence and binds one discard click to a fresh screenshot and the original journal/process. It does not permit generic UI edits during an incomplete transaction or classify the resulting saved state.

## Legacy recovery

The legacy one-component writer endpoints remain runtime-disabled. Their retained recovery schema uses a user-supplied `runtimeRestartConfirmation` after an authorized restart. Do not apply that historical attestation workflow to the newer typed tools, which use technical challenges and actual retained termination evidence. Conversely, do not synthesize a legacy confirmation.

## Evidence publication

A result published before its receipt is recoverable through `easyeda_control_evidence_recover` using the same reserved paths. This repairs evidence publication, not the editor operation, and must not rerun the original call. Verify recovered receipts before relying on them.

Never overwrite an open EasyEDA database. An exact inverse is operation-dependent; absence of an inverse is not a promise of automatic checkpoint restoration.
