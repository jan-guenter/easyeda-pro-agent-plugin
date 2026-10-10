# Typed design transactions

This is the workflow for `easyeda_control_design`, not the disabled legacy one-component endpoints. One transaction can be an individual typed operation or a PCB batch. No caller source or JavaScript is accepted.

## Apply, commit and inverse

| Phase | Required evidence | Result |
|---|---|---|
| Apply | Exact context/fingerprint, supported source profile, retained Windows Job, authenticated process probe, native source baseline and verified checkpoint | Journal is durable before dispatch; returned effect is compared against complete source records |
| Applied unsaved | Complete intended source effect; no verified save/reopen lifecycle yet | Explicit commit or supported exact inverse |
| Commit | Fresh intended live state, intact pre-checkpoint and context | Save, close, reopen, verify source again, then decode and compare complete selected-branch durable project records |
| Completed | Intended changed values persisted; all unrelated documents/library records unchanged | Saved/reopened proof and final checkpoint |
| Rollback | Exact intended state still present, unchanged durable baseline and supported inverse | Apply and verify the live inverse, drain scheduled project writes, and prove a fresh durable baseline before terminal; no automatic Save |
| Unknown/review | Timeout, context drift, source mismatch, persistence failure or unavailable inverse | Inspect; recover authority if necessary; reconcile before further writes |

An applied-unsaved result is not completion. Never infer save from a returned boolean, toolbar marker or file timestamp.

`applied-unsaved` is the transaction's historical state name, not a guarantee that EasyEDA has not already auto-persisted its edit. Native history may reach SQLite before explicit commit. Commit proves the complete intended durable delta and reopen state; rollback must not claim durable restoration from a live-only inverse. Keep the checkpoint even when no explicit save was called.

`design execute` composes apply and commit in one request. It commits only the exact operation ID returned in `applied-unsaved` state, with no hard stop or orphan risk. It does not retry, roll back on error, or replace any proof stage. Use separate apply/commit when unsaved review is part of the task.

The immutable plan retains the original operation, context and fingerprint. Later tab rebinding is journal state, not permission to change that plan. Creation IDs are retained before readback and reused during proof; never rerun creation to discover its ID.

## Baseline and durable proof

The source profile retains every record and document metadata except the three volatile DOCHEAD export fields `client`, `updateTime`, and `version`. Exact source comparison preserves unknown records. Operation adapters specify the allowed fields and necessary consequences such as attached component labels.

Live exports can omit durable metadata or emit default records absent from storage. Baseline verification checks the intended target fields against the checkpoint; it does not certify that the entire editor has no unsaved changes. Commit compares durable before/after deltas against the intended source delta. Previously persisted records, including hidden META and LAYER values, must remain identical unless explicitly changed by the operation. All other selected-branch documents and library records must match. Only validated target-document client/updateTime/version bookkeeping is allowed in addition to the intended changes.

This proof covers the native-history reader's materialized selected branch. It does not claim equivalence of unselected history branches or arbitrary non-history SQLite tables. A pre-existing unrelated unsaved change cannot be silently accepted as intended collateral if saving changes its durable record.

## PCB batch

A `pcb.batch` contains 1–256 uniquely named operations. A target may reference a prior same-family create with `resultOf`; the facade allocates all native IDs before dispatch and journals their exact map. Every intermediate step is simulated and verified. Pure geometry batches use one guarded native source merge. Batches containing supported rules use ordered source-bound public writer steps with intermediate and whole-result comparisons.

Initially locked records and descendants are preserved across every intermediate step. Explicitly unlocking a protected part is a separate authorized operation. Batches exclude stack and copper rebuild. Source merge refuses unsupported derived-copper records. A reverse batch is exposed only if its sequential effects restore the exact baseline. Deletion or an unsupported inverse may therefore prevent rollback; a checkpoint is evidence, not an implemented automatic database-restore mechanism.

## Limits and authorization

The active project/document/tab must remain unchanged during an operation; optimistic checks cannot detect every switch away and back within one asynchronous native handler. Keep other edits quiescent. Generic readers and aggregate counts cannot replace complete source comparison.

Confirmation fields acknowledge an already authorized task. They do not authorize unrelated changes, discarding user work, manufacturing submission or purchasing.

For uncertain dispatch, follow [failure-recovery.md](failure-recovery.md). Do not invoke native Undo repeatedly, save an unknown result, or restore a live database.
