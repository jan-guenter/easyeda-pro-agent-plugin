# First original Via Main failure snapshot

A separate `easyeda-pro-control.pcb209-via-main-failure.v1` data schema now
preserves the first failure at the original Via workflow's `main` stage. The
workflow captures it synchronously before cleanup. Later inspection and cleanup
return the same immutable snapshot without reading a released runner again.
Failures outside that stage leave the new field null.

The workflow uses the original factory/target assertion and the captured
`retainedFootprintMainConstruction` private-field method. Descriptor checks
reject a substituted method or accessor before invocation. The coordinator and
public registration separately retain their original snapshot getter identities.
Copied coordinators cannot access private state. This introduces no caller
callback, runner selector, native request, retry or cleanup authority.

The bounded payload contains runner phase and source-owned refusal label,
request/reply/event/byte counters, construction/cleanup flags, the closed
metadata-role roster, sanitized schema issue codes and path segments, and only
numeric registration location plus script-membership evidence. It includes no
raw Error property, vendor message, stack, source, object/script handle, filename
or private path. An absent runner and refused capture are distinct outcomes.
The same original owner status can retain only its fixed native Main action/code
and source failure label when the runner is absent. The full owner status is
never serialized. A capture refusal cannot replace the original execution error or stop cleanup.
All execution, cleanup and persistence authority fields remain false.

The public tool adds the separate nullable `mainFailure` field. Its strict output
schema and offline query expose the new schema independently. Existing operation
result v1, diagnostic v1 and journal v1/v2 contracts are unchanged. The prior
frozen generation and its observed Main refusal/automatic cleanup remain
historical; this implementation supplies no diagnosis for that closed attempt.
A fresh admitted payload is required before observing the new field live.

The focused checks run the actual Main runner against malformed metadata over
its inert original transport. The workflow uses explicit synthetic native
factory/plan seams and that actual runner, proves the snapshot precedes abort,
retains it after cleanup and rejects owner/workflow accessor substitutions with
zero getter calls. Schema tests reject private path keys, raw messages/handles
and true authority flags. The actual registration property accepts the new
separate field while the old diagnostic schema rejects it. No native owner or
application is constructed by these fixtures.

The initial new workflow cases were placed after the existing final fixture
that deliberately retains its process-local launch quarantine. They correctly
refused before allocation. Moving the new cases before that deliberately final
fixture fixed their ordering. The early-Main fixture also needed to settle its
unused local test Promise instead of rejecting it. Neither correction changes a
production quarantine, failure or cleanup rule.

Source base is `62d3b7c5`. The exact correction-payload manifest and focused test,
type and strict lint outcomes are retained privately under
`via-main-failure-snapshot-20261108`. The manifest records every tracked and
nonignored untracked payload file with mode/bytes/SHA256 and excludes Git metadata
and ignored dependency installs. Its 5,141-file manifest has SHA256
`fca331f2f9c17463c9c3b34bff8f63b63bb690011cf66001f960384b61f3edc2`
and remained unchanged across the final 30 focused cases, both TypeScript
projects and strict lint, all passing with no skipped case or warning.
The introducing source commit is `5989e6a4`; canonical integration is
`3b44041d`. These Git identities do not replace the retained test-payload
manifest. These are source and inert-stream checks only.
There are no Core/pipe/native generator changes, helper/pin/bundle regeneration,
app/live MCP calls or connected validation.
