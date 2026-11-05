# Historical Source v2 startup-blocker relinquishment

Use `footprint-forward-source-relinquishment` through
`easyeda_control_pcb209_worker_startup` only for the single externally reviewed
23-record Source v2 history supported by the installed contract. Discover its
strict request and result schemas offline with `easyeda_control_api` action
`footprint-forward-source-relinquishment`, `query:{includeSchemas:true}`. Validate
arguments with `footprint-forward-source-relinquishment-validate` before dispatch.
Other Source histories remain unsupported.

This route records historical metadata. It creates no native owner and offers
no close, signal, helper release, replay, restore, edit or Save action. Its
receipt keeps original capture, termination and helper release `unknown`, even
when separate process observations are available. The sole positive result is
`startupBlockerRelinquished:true`; execution and Save authority stay false.

Use a fresh facade that has never allocated an application owner. First finish
original cleanup and observe original processes leaving through their supported
owner or separately authorized cleanup. Do not replace an active owner to reach
this route. The resolver independently requires global Linux facade absence and
two Windows absence observations; an old PID, user assertion or copied result
cannot supply those observations.

The nested request uses action `relinquish-unknown-source-opening`, the original
`operationId`, and four expected digests: `expectedManifestSha256`,
`expectedRosterSha256`, `expectedIntentSha256` and `expectedBindingSha256`.
The binding digest covers the complete original binding record, not only its
native binding subobject. Both `confirmRelinquishUnknownSourceOpening` and
`acceptUnknownCaptureOutcome` must be true. The caller supplies no profile,
nonce, observations, native process targets or replacement authority.

The maintained reader must match the complete raw manifest and every original
record/artifact against the fixed reviewed roster. That old journal lacks a
persisted producer digest; the contract labels its exact payload provenance as
external review. Newly allocated Source owners record separately versioned
producer evidence. Neither provenance form reconstructs native ownership.

Before publishing a receipt, the resolver verifies the registered source bytes,
absence of SQLite sidecars, original and fresh prepared checkpoints, completed
whole-SQL readers, and complete materialized history equality. It also excludes
other unfinished operations. Refusal or changed data grants no retry of the
original capture and no permission to alter a journal or lease.

Publication appends separate exclusive receipt files and preserves the original
journal. If acknowledgment is lost, retain this same resolver and repeat only
the exact historical request to settle its original pending bytes. Its metadata
reservation persists while an observation or publication is active. A receipt
never proves that the original source capture completed, that a helper released,
or that a later writer can run. Retire the resourceless facade normally before
selecting a fresh generation for a new disposable validation operation.
