# Explicit Via action scope

The eventual public execute action requires four strict literal acknowledgements:
`confirmDisposableViaWrite:true`, `confirmOneSave:true`,
`confirmForwardOnly:true` and `confirmNormalOpenEffects:true`.
Abort requires `confirmOriginalJobOnly:true`. These record the existing user
authorization for this disposable operation and original-Job cleanup. They do
not ask the user for another approval, authorize arbitrary code or grant native
eligibility. The maintained manager may supply the abort acknowledgement from
its retained original call family.

Inspect, observe-termination, release and settle-publication still accept only
the original operation identifier. Prepare accepts only the same-facade managed
fixture operation identifier and bounded Via data. Unknown fields, missing or
false scope acknowledgements refuse. The focused action/publication tests pass;
no tool registration, native owner or live CAD dispatch is added by this change.

## Public result and original-request cleanup classification

The new `easyeda-pro-control.pcb209-via-write-operation.v1` result envelope is
fixed in `currentPcbViaWriteResultSchema`. It retains action and operationId,
state (`prepared`, `running`, `needs-cleanup`, `verification-pending`, `completed`),
create attempt/acknowledgement and Save attempt/outcome, independent saved/reopened
complete-SQL/peer verification, and original-generation cleanup state.

Cleanup contains generation (`none`, `writer`, `readback`), allocation
(`not-entered`, `no-resource`, `unresolved`, `retained`, `released`),
`nativeResourcesRetained`, `abortAttempted`, `originalTerminationVerified`,
`helperReleaseVerified` and `publicationPending`. A released helper cannot still
claim retained native resources; unresolved allocation conservatively retains
resource risk. Completion requires saved/reopened/full-SQL/peer proof, original
termination, helper release and settled publication. An SDK acknowledgement alone
cannot satisfy any of those independent persistence requirements.

Save outcome describes its original SDK acknowledgement. An unknown outcome stays
unknown even if a later independent full closed/reopened proof establishes the
stored effect. It never refunds an attempt or permits another Save. This is a
result-shape boundary, not a mounted writer or a native ownership issuer.

The maintained manager must bind the original tool call and operationId, retain
its actual in-flight Promise and connection, and inject only the approved original
Job abort literal. Matching output JSON, a timeout, a PID or a recorded result
cannot recreate ownership or establish exit. Public coordinator output uses this
envelope only after its original operation derives the facts; the schema itself
enables no action. Four focused journal/contract cases, strict types and zero-
warning type-aware lint pass. No helper, pin, bundle or live/native call changed.
