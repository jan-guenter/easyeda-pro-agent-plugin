# Persistence and checkpoints

## What durable proof requires

For a guarded PCB type-3 operation, `easyeda_control_save_reopen` enforces this sequence:

1. Recheck the stable runtime, exact project path, document identity, type, and original active tab, and require `live-verified`.
2. Re-verify the intact pre-checkpoint.
3. Journal `saving` durably. In one generated `easyeda_execute` dispatch, rerun every complete typed live guard twice, compare both normalized SHA-256 snapshots, verify active context, and invoke the document-specific save API only from that same continuation. There is no public editor compare-and-swap primitive, so a guard from an earlier bridge call is not accepted.
4. Require the exact save result, then re-verify the pre-checkpoint.
5. Close the exact document, reopen it, and activate it.
6. Recheck project, document UUID, type, and title, then run fresh reopened verification calls and compare target fields and global invariants.
7. Re-verify that the pre-checkpoint artifact is intact and that the live project's logical SQLite dump differs from it. File timestamp or byte-level churn with an unchanged logical dump does not prove the edit was saved.
8. Create a candidate final database checkpoint and journal its receipt.
9. Recheck context and rerun the typed reopened verifier and assertions after candidate creation.
10. Recheck persistence from the intact pre-checkpoint and verify the candidate checkpoint against the live database.
11. Require an installed semantic database-delta validator whose proof echoes a SHA-256 binding over the operation ID, plan hash, exact pre/final checkpoint receipts, and reopened proof snapshot. Its canonical observed-delta descriptor must hash to `observedDeltaSha256`. A stale proof, arbitrary delta hash, byte change, or generic logical-dump change cannot prove that only the intended design fields persisted.
12. After that policy returns, rerun the exact reopened verifier and assertions, require the proof snapshot to remain identical, and re-verify both pre-checkpoint persistence and the candidate checkpoint immediately before completion. Production keeps the writer disabled until a connected sacrificial-project test supplies this validator.

A reopened editor may reuse or replace a tab ID. The pre-save phases require the original exact tab. After the controlled reopen, require the same project path, document UUID, type, title, and content; accept the newly reported tab.

The operation state machine rejects schematic type 1 and library types 2 and 4. Those need separate workflows with proven lossless mutation and exact persistence semantics. Do not close a library document until a current-version method can reopen and audit that exact asset.

## Evidence artifacts

Evidence result/receipt pairs and phase artifacts are created exclusively and never overwritten. Operation journals are different: each self-hashed journal is replaced atomically as its state advances. Reserve absolute, distinct evidence paths below the control data directory before dispatch. Bind each result to:

- operation ID and plan hash;
- facade and upstream versions;
- project and document identity;
- request or script hash;
- execution timestamps and state transition;
- output hash;
- failure and `mutationMayHaveOccurred` fields.

Store large audits as files, verify receipts with `easyeda_control_evidence_verify`, and use `easyeda_control_artifact_read` for bounded inspection. Managed reads reject symlinks and paths outside the control root. Do not push large JSON or source snapshots through the bridge when a hash-bound artifact is enough.

If a process exits after publishing a result but before publishing its receipt, recover the reservation from the still-durable receipt marker and finalize it with the crash-recovery API. Do not reserve the same paths again or repeat the EasyEDA dispatch. Each published result binds the reservation-token hash and exact result/receipt paths. The committed receipt also carries and self-hashes both exact paths, and verification parses the result's reservation binding. A copied receipt or any cross-paired result/receipt path is rejected. Attachment descriptors are embedded in the result and rehashed before the recovered receipt is committed.

Draft export bytes are published through a file-descriptor-bound managed parent, not by reopening a caller-derived pathname. The facade verifies the published inode, bytes, hash, and directory durability, then requires that same file identity while committing the evidence receipt. A concurrent directory or symlink swap cannot redirect the export write to an unmanaged destination.

## SQLite project checkpoints

`easyeda_control_checkpoint` can create or verify a checkpoint only for the exact active `.eprj2` project database. Creation uses the descriptor-bound Node SQLite backup API, then runs `quick_check`, creates a deterministic logical dump, and hashes both database and dump. The receipt binds the source identity, checkpoint path, hashes, and verification result. Checkpoint output is confined to either the active project's sibling `backups/` directory or the facade-managed `checkpoints/` directory. Arbitrary source and output paths are rejected.

Make a pre-checkpoint before any material mutation and before the clean-baseline reopen. `easyeda_control_plan` must require `checkpoint.source` to normalize to the `.eprj2` path returned by live context. With explicit discard authorization, it journals and reopens the target without saving, binds the returned tab, runs preflight, then proves the source still equals that checkpoint. This is the durable/live baseline binding; a pre-existing unsaved editor state is never accepted into a plan. Create the candidate final checkpoint only after the first reopened verification, then bind it to a second fresh reopened verification and a final source comparison.

The facade re-verifies that same pre-checkpoint after apply and after live assertions before it calls the state `applied-unsaved` or `live-verified`. This catches an autosave, manual save, or concurrent durable change that would otherwise make an “unsaved” claim false.

It repeats both the typed live verifier and the pre-checkpoint proof immediately before save. After reopen, it does not trust a checkpoint created after stale readback: it creates the candidate first, performs another reopened readback, and verifies the candidate against the live database last.

A checkpoint is evidence and a recovery source. It is not proof that the active document contains the intended edit. The reopened audit supplies that proof.

## Restore boundary

The facade does not restore databases. Never overwrite the live project file while EasyEDA is open. A restore needs a separate procedure with:

- explicit user authorization;
- EasyEDA and bridge processes closed;
- exact live target and backup receipt validation;
- an additional backup of the current live file;
- atomic replacement where the platform permits it;
- reopen plus project-wide audit.

If the live API and reopened state disagree, inspect the durable database history before making another edit. Do not repeat a write to force the desired appearance.
