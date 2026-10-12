# Closed-session evidence foundations

These internal modules support the whole-application completion route described
in [the Save investigation](project-structure-save-completion-2026-10-12.md).
They do not enable a writer or add an MCP method. The existing structure-lifecycle
refusals remain in force.

## Normal close and retained process exit

[Windows authority](../plugins/easyeda-pro-control/server/src/windows-authority.ts)
separates three events: preparing a close intent, dispatching normal close once,
and proving that the captured application Job and retained processes have exited.
The intended coordinator must publish the intent durably before dispatch.
The authority module itself does not publish an operation journal.

The binding retains the operation, phase, attempt, authenticated bridge session,
runtime generation, launch, helper, Job and window. Close consumes its reservation
before awaiting native work. An error or missing acknowledgment does not allow a
second close. The generic close path cannot bypass a reserved close on the same
Job. The module does not select Save or Discard, suppress a dialog, terminate
EasyEDA forcibly, or repeat a write.

An acknowledged close is not an exit proof. The separate termination call uses
the existing native helper's retained handles and whole-Job checks. It does not
weaken the replacement-session contract of the existing recovery method.
Read-only termination checks can be retried after a live-child refusal without
repeating close.

Issued proofs belong to a module-private registry. Serialized receipts, clones
and caller-created objects cannot supply the proof required by a consumer.
The historical exit fact remains separate from permission to copy a closed
file. A later launch, capture or release attempt invalidates copy admission.
Both paths recheck retained helper availability and its reviewed source.

This proves the captured Job exited. It does not prove all queued work ran, that
another process cannot write the project, or that upload storage cannot replay
work after restart. The receipt explicitly marks queued persistence and replay
exclusion as unproved.

## Byte-preserving closed-file copy

[The copy module](../plugins/easyeda-pro-control/server/src/closed-file-copy.ts)
requires an issued current copy proof and an independently bound source hash.
It reads a canonical single-link source through retained directory and file
descriptors. Symlinks, sidecars, zero-length files and files over 256 MiB refuse.
The output is a new exclusive mode-0600 file under an owner-only control root.
There is no overwrite, deletion, SQLite connection or `VACUUM` operation.

Asynchronous 1 MiB chunks bound individual reads and writes. Independent hashes,
path/descriptor identities, file metadata and sidecar checks cover the copy
window. Every owned final handle receives a cleanup attempt even if another
close fails. Failed copies retain their partial private artifact and never
receive an issued success receipt. Copy authority is checked again after all
filesystem work and cleanup.

The receipt retains size, hashes, inode identity, timestamps, mode, owner, group
and link count. It does not claim those files can never change afterward.
A downstream reader must rebind the artifact and hash. Project-to-process
association and execution authorization are explicitly false in this leaf's
receipt; a coordinator must establish the former independently.

This copy preserves source bytes that a checkpoint created with `VACUUM INTO`
can normalize, including the SQLite schema cookie and implicit row IDs.
Byte preservation is not proof of the intended SQL effect.

## Cleanup regression

Review exposed an existing descriptor leak in control-root traversal. If closing
the old parent failed after opening its child, the outer cleanup still owned
only the parent. Both root acquisition and nested directory opening now close
the newly acquired child on that failure. Regression tests fail against the
previous implementation and pass with the fix. An aggregate error retains both
failures when child cleanup fails too.

## Completion work still required

The internal SQL reader and inactive-target upload observer are now implemented.
Their contracts and limits are in
[closed SQL and upload observations](closed-sql-and-upload-observers-2026-10-12.md).
Neither is connected to a public execution route.

The first proposed live case remains a disposable ordinary-symbol metadata
rename. Before enabling it, the coordinator must bind the complete sequence:

1. Admit one owned session and exact disposable project, capture the baseline,
   and derive the complete expected source, history and structure-table effects.
2. Dispatch the edit once and retain its acknowledgment and immediate effect.
3. Publish and dispatch normal close once, prove whole-Job exit, and copy the
   exact closed source without rewriting it.
4. Verify the complete SQL effect, including peer rows, raw history, bookkeeping,
   structure ticket, row multiplicity and schema.
5. Start a fresh owned generation at its clean Start Page and check the exact
   two target upload queues without creating, deleting or reading entry bodies.
   Bind that observation to the next single project-open attempt.
6. Verify the reopened design, close normally, and verify the second closed
   database state. Persist all intent and result evidence without granting a
   repeated edit, Save or close after a restart.

The operation-specific effect model, clean-generation admission, durable
coordinator and actual browser validation remain separate work. Synthetic tests
of the modules above are not connected EasyEDA validation. No production project
is needed for any of these tests.
