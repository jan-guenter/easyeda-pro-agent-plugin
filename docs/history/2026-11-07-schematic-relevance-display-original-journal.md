# Original Relevance display journal

`GeneratedSchematicRelevanceDisplayJournal` now retains a separate immutable
seven-row operation chain, original argument/checkpoint pair and private
Modify/Save dispatch registry. Its operation prefix, plan profile, record schema
and dispatch profile differ from the old six-row family. Its constructor requires
the genuine Relevance argument issuer and checkpoint. JSON and copied tokens
cannot recreate a dispatch, and the old journal reader/consumer rejects them.

Prospective Main setup can enroll one unspent original Modify marker through
`enrollGeneratedSchematicRelevanceDisplayModifyIntent`. Enrollment consumes no
dispatch. The actual original generation must separately consume the exact
marker synchronously before its first asynchronous admission. Both retain
published-chain reproof; failed or lost publication must settle its original
pending candidate before dispatch. The registry neither refunds an attempt nor
reconstructs a token from persisted records.

Three focused tests exercise the actual managed artifact/journal publisher
with an explicit inert original-argument seam. They cover exact owner/argument
and cross-family refusal, once-only consumption, lost intent publication and
nonconsuming enrollment. Both TypeScript projects and strict changed-file lint
pass. This journal issues no native owner, setter, worker, clock, SQL, Save or
saved/reopened authority. The distinct Relevance native lifecycle must still
join its actual records and original factory before any generation is admitted.
