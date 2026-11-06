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
