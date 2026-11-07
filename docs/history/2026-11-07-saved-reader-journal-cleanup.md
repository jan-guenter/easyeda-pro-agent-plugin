# Saved-reader journal and honest no-root cleanup

The private saved-reader workflow accepts an optional original Via operation
journal. Its genuine journal and closed-checkpoint lookups must identify the
same original plan, and the outer writer must publish `reopen-intent` first.
Standalone use retains the existing original-owner contract.

The reader records opening/source completion, native and complete-scene
observation intents/results, normal close, observed exit and actual helper
release, then fresh complete closed SQL/source capture. Helper release now
precedes that independent read-only file capture. Its original historical
termination/model lookups remain required after release. The reader publishes
no final operation completion; the outer writer owns that conjunction.

Failure cleanup first settles and reproves the same original publication.
Unreproved publication retains the owner and dispatches no unrecorded cleanup.
A single additional settlement can join that original publication and the same
abort/release Promises; it cannot replay a consumed control or produce a
readback proof. The existing single additional bounded exit wait remains
separate from operation success. An unacknowledged original file-descriptor
close keeps cleanup incomplete even after native helper closure.

Two new v2-only, nonterminal cleanup records describe a helper whose root was
never created: `no-process-release-intent` and `no-process-release-result`.
Separate writer/readback methods verify the actual original factory, target,
plan and allocation; the reader additionally verifies its original saved
checkpoint. A private once-only generation reservation prevents mixing these
routes. The result requires the original supported release acknowledgment and
helper closure, states `rootNeverCreated`, and explicitly claims neither design
nor readback completion. These records require failure and cannot mix with
generic process-exit cleanup. Immutable v1 records are unchanged.

Validation uses actual managed journal/artifact publication with explicit inert
factory issuer seams and the production saved workflow with original native
issuer seams. Focused cases cover writer/readback no-root cleanup, copied
owners, v1 refusal, journal-before-effect order, lost publication, delayed
original launch/cache cleanup, bounded exit settlement and unknown descriptor
close acknowledgment. These are offline checks; no native helper, EasyEDA,
CacheStorage mutation, SDK write or connected persistence proof ran here.
