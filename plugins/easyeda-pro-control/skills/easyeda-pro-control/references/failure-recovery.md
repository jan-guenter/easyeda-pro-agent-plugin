# Failure recovery

An ambiguous operation must not be repeated or saved. Inspect its journal and preserve the checkpoint, created IDs, runtime proof and phase artifacts. A delayed call may have completed after the response deadline.

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

An unfinished runtime `open-existing` operation uses `inspect-open`, `recover-open-authority`, `rebind-open-runtime` and `reconcile-open`, not the design/library recovery actions. Reconciliation inspects the current exclusive tab and unchanged database without repeating navigation. See [connection-and-context.md](connection-and-context.md#open-an-existing-saved-project-from-start-page).

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
preserve the journal and both observations. The upload barrier drains queued
writes; it does not initiate Save or guarantee that editor changes were queued.
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

## Native UI failures

A native input failure may report `dispatched:true`; that is uncertainty, not permission to repeat a click, key or import. Reinspect the exact owned window and affected design when bridge quarantine permits it. UI inspection is not a save/reopen or connectivity proof. `observed-unowned` process binding supports native bootstrap but never substitutes for retained Job authority.

For a settled API call whose own unsaved target blocks normal close, the explicit [discard-close recovery](native-ui.md#discard-close-recovery-for-the-operations-own-unsaved-target) action preserves saved evidence and binds one discard click to a fresh screenshot and the original journal/process. It does not permit generic UI edits during an incomplete transaction or classify the resulting saved state.

## Legacy recovery

The legacy one-component writer endpoints remain runtime-disabled. Their retained recovery schema uses a user-supplied `runtimeRestartConfirmation` after an authorized restart. Do not apply that historical attestation workflow to the newer typed tools, which use technical challenges and actual retained termination evidence. Conversely, do not synthesize a legacy confirmation.

## Evidence publication

A result published before its receipt is recoverable through `easyeda_control_evidence_recover` using the same reserved paths. This repairs evidence publication, not the editor operation, and must not rerun the original call. Verify recovered receipts before relying on them.

Never overwrite an open EasyEDA database. An exact inverse is operation-dependent; absence of an inverse is not a promise of automatic checkpoint restoration.
