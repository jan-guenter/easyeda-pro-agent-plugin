# 2026-11-09 passive startup refusal context

The startup scheduler previously retained its fixed refusal site but left the
actual selection reply and caller locations unavailable when a later diagnostic
frame read refused. This leaf adds a separate private
`private.selected-file-main-sql-startup-refusal-context.v1` packet. Historical
startup diagnostics, retained runner status, Via inspect and main-failure v1
shapes remain unchanged.

Both original SQL-pause event branches copy only the bounded parsed locations
into a WeakMap keyed by the actual Pause. Source-bound filtering runs once,
only on a genuine first construction/startup refusal before packet issuance.
The original app script ID must match, and line/column numbers must lie inside
that runner's already qualified original app source. The artifact retains the
fixed source SHA256, frame indices and numeric locations. Every foreign-script
or out-of-source omission has an explicit count; no frame list is truncated.
There is no whole-source cache or source split on ordinary pauses.

The packet records the exact recognized/unrecognized selection classification,
fixed role/site, parameter-empty and transaction-depth flags, SQL presence and
the existing progress snapshot. SQL text is neither copied into that packet nor
hashed. Reply-decode and sequence refusals remain distinct, and an unattempted
selection stays explicit for the existing site/tracker fallback. No function
names, URLs, paths, handles, parameter values, Error objects or stacks enter the
new artifact. Projection failure leaves the optional context null.

Capture is synchronous before existing diagnostic awaits. Decode/consume
exceptions are rethrown by identity, and optional projection failure cannot
replace the original failure. The original owner exposes one adjacent passive
getter. The Via workflow pins that exact method, captures the closed packet
once and adds it only to the private failure record. Existing cleanup and
publication rules retain ownership. Post-construction held SQL mutations do
not publish a startup-failure context.

The complete source/test tree is
`76d8318932c11d9669b9163da564ee8354ef6053`, based on
`cb5e7149fee45b065650e223cafc62fbc584314d`. Initial focused checks passed 56
cases across the real runner, outer workflow and passive privacy projector.
Root's independent review then requested the one-time source-bound projection
above. All 34 final runner cases passed after that correction, including the
new zero/one-projection regression. The other 23 unchanged projector/workflow
cases retain their earlier passes. All runs had zero skips and failures.

Regressions retain the original two diagnostic requests and five resumes at
the tested unrecognized startup refusal; the new context issues zero requests
or resumes. Known original sequence errors retain exact identity through an
optional projection failure with zero Error-stack reads. Hostile getters,
proxies, unknown fields and substituted owner methods cannot leak context data,
replace public v1 results, repeat capture or block original cleanup.

Node 24.18.0, npm 11.16.0 and soft RLIMIT_CORE zero were verified. Final
facade/stub types, bridge/test types and strict changed-file type-aware lint
passed with zero warnings. Initial lint issues were corrected before final
checks. Repository, MCP-contract, all seven packaged skills and all seven
installed skill-creator validations passed. Scoped history/index links passed.

This is offline implementation and synthetic scheduling/privacy evidence.
There was no C#, Windows, native helper, SDK, application, CAD or Save action,
build, bundle update, pin change, installation or runtime refresh. The new
packet grants no resume, execution, write, completion or persistence authority.
A fresh target-runtime refusal context remains unobserved until the parent
integrates and validates a coherent payload. Historical packets cannot recreate
an original paused event or transfer its owner.
