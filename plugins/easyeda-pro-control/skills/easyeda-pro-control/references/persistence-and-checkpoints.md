# Persistence and checkpoints

## What durable proof requires

Use `easyeda_control_design` commit after an exact applied-unsaved result. It rechecks the intended native source and durable baseline, journals the save/reopen dispatch, saves the exact document, reopens it, rebinds the new tab, and verifies the intended source again. The final checkpoint is decoded and compared against the pre-checkpoint with the exact intended source delta. All unrelated selected-branch document/library records remain unchanged.

A supported recovery that composes a prior journal's delayed inverse is separately reported as `isolatedTransaction:false`, with complete proofs for both transactions and original hashes. It is not an unchanged-collateral result; see [failure-recovery.md](failure-recovery.md).

EasyEDA can acknowledge its cache write before a queued project-worker write reaches `.eprj2`. Typed transactions await the native project upload queue before their baseline checkpoints and after Save, before checkpointing or closing. The receipt proves only that already scheduled writes settled. It neither saves current editor changes nor proves the requested values persisted. Complete durable comparison remains mandatory. Rollback also drains scheduled writes and checks a fresh durable checkpoint before it can become terminal; an exact live inverse alone is insufficient.

The source export and durable storage need not encode unchanged defaults identically. Scoped baseline targets must match, every previously persisted unchanged record remains invariant, and each intended changed record/field must persist. The generic verifier additionally admits validated target-document client/updateTime/version bookkeeping. Document-specific adapters separately prove and report narrowly supported encoding conversions, including the symbol profile described in [libraries-and-eco.md](libraries-and-eco.md); they retain raw hashes and do not permit unrelated document changes. See [safety-state-machine.md](safety-state-machine.md) for the full proof boundary.

Standalone native wire edits use exact typed source/native effect proof before
the existing schematic storage verifier. That verifier records supported raw
versus captured attribute-order encodings without relaxing geometry, net values
or unrelated durable records. If an acknowledged Save/reopen fails final proof,
the [retained wire recovery](failure-recovery.md#retained-wire-save) rechecks the
same journal without repeating Save or navigation. That retained-fixture recovery
and a fresh 16-document wire lifecycle completed Sept25; coverage remains narrow.

A saved/reopened result is different from a library operation reporting saved but not reopened, and from an export reporting managed bytes. The legacy `easyeda_control_save_reopen` endpoint remains disabled. Never infer durable changes from a timestamp, changed SQLite file bytes or a returned boolean.

Native Close can acknowledge before its asynchronous cleanup ends. The lifecycle adapter observes the terminal close notification and proves the old tab and frame were removed before opening once. Reopen requires two matching observations of the new frame, exact document/tab and library owner where applicable. Shared schematic model aliases are refused. A native close/open deadline retains execution uncertainty because the underlying operation may still be running.

For a saved symbol/footprint edit whose reopen failed, design reconciliation can establish `saved-awaiting-reopen` from hash-verified phase artifacts and recomputed complete durable proofs. A subsequent commit reuses the original Save evidence and performs only the missing navigation and final verification. A retained successful reopen acknowledgment is reused too. Neither the `saved` flag nor the old persistence result substitutes for decoding and rechecking the checkpoints. See [failure-recovery.md](failure-recovery.md#saved-library-edit-awaiting-reopen).

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

Evidence verification also requires the result and receipt to agree on the result schema, request hash, metadata, and complete attachment or capture-image list. A valid self-hash alone does not establish that consistency. JSON evidence, reservations, operation journals, and phase artifacts have a 64 MiB per-file limit for whole-file publication and verification. Oversized or growing files fail before an unbounded read. Capture images and other binary attachments are hashed as streams. Page large artifacts with `easyeda_control_artifact_read`; each page is capped at 256 KiB. Caller-selected evidence paths cannot enter `operations/`, which is reserved for the journal APIs. Existing journals remain readable through the local artifact tool.

If a process exits after publishing a result but before publishing its receipt, recover the reservation from the still-durable receipt marker and finalize it with the crash-recovery API. Do not reserve the same paths again or repeat the EasyEDA dispatch. Each published result binds the reservation-token hash and exact result/receipt paths. The committed receipt also carries and self-hashes both exact paths, and verification parses the result's reservation binding. A copied receipt or any cross-paired result/receipt path is rejected. Attachment descriptors are embedded in the result and rehashed before the recovered receipt is committed.

Draft export bytes are published through a file-descriptor-bound managed parent, not by reopening a caller-derived pathname. The facade verifies the published inode, bytes, hash, and directory durability, then requires that same file identity while committing the evidence receipt. A concurrent directory or symlink swap cannot redirect the export write to an unmanaged destination.

## SQLite project checkpoints

`easyeda_control_checkpoint` can create or verify a checkpoint only for the exact active `.eprj2` project database. Creation uses the descriptor-bound Node SQLite backup API, then runs `quick_check`, creates a deterministic logical dump, and hashes both database and dump. A `checkpoint.v2` receipt binds the source and checkpoint device, inode, creation time, change time, path and hashes. Path replacement or a later hard-link event invalidates that identity even when bytes and the logical dump still match. Older `checkpoint.v1` receipts fail closed. Checkpoint output is confined to either the active project's sibling `backups/` directory or the facade-managed `checkpoints/` directory. Arbitrary source and output paths are rejected.

Checkpoint receipts have a 1 MiB whole-file read limit. After receipt publication or verification hashing, the facade rechecks the source pathname, file metadata and SQLite `data_version`. This catches both ordinary database writes and WAL-only commits that occurred after the source snapshot. Verification also rechecks the checkpoint file after hashing. A checkpoint is still a point-in-time snapshot: no check locks the editor against a later commit. Any operation that depends on current baseline equality must reverify immediately before its dispatch boundary.

Typed apply creates and verifies its pre-checkpoint before dispatch. It checks scoped live target fields against persisted records without discarding the document or claiming every unchanged exported default proves a clean editor. Reverify durable baseline before saving. Commit compares whole durable deltas, so unrelated unsaved work cannot be accepted as intended collateral merely because it was already present in live source.

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
