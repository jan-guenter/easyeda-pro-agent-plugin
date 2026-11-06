# Generated disposable fixture import

Use this development route to create a new fixed Via-only, Line/Via,
Arc/Line/Via or separate SCH/SCH_PAGE Text/Wire/Bus project.
It accepts no caller project, path, archive, ID, geometry, SQL or code. It never
deletes a failed or partial output. Query `fixture-import` with
`includeSchemas:true` and validate the assembled request using
`fixture-import-validate` before calling `easyeda_control_fixture_import`.

The schema query goes to `easyeda_control_api` in this exact wrapper:

```json
{"request":{"action":"fixture-import","query":{"includeSchemas":true}}}
```

Start with this facade's retained ordinary209 launch and exact empty Start Page.
Obtain its current authenticated fingerprint. Keep the original manager and
runtime through cleanup. Pass this as `request`, with a unique operation ID up
to64characters, and supply the complete observed `expectedFingerprint` object:

```json
{
  "action": "import-generated-fixture",
  "operationId": "fixture-import-example",
  "fixtureKind": "via-only",
  "confirmDisposableFixture": true,
  "confirmNativeImport": true,
  "acceptPartialImportRetention": true
}
```

`line-and-via` adds one disjoint top-layer line. `arc-line-and-via` adds a
disjoint circular top-layer arc as well.
`schematic-text-wire-bus` selects a separate schematic container and page with
fixed Text and disjoint one-segment Wire/Bus groups. These are disposable data,
without validated electrical connectivity or manufacturing suitability.

The original environment operation has the ID `<operationId>-environment`.
It observes actual native config directories through a tracked getter that can
create configured directories. The importer requires HALF_OFFLINE mode and
complete no-.elib library-directory rosters under original native handles and
filename-change watches. This excludes a detached system-library seed branch
only after original termination and drained watch cancellation. An ambiguous
preflight stops before import and supplies no retry authority.

The sole original SDK Promise remains tracked. A returned project or settled
Promise does not prove delayed work, registration, source content, closed SQL,
or a usable fixture. The current route returns partial evidence and keeps
acceptance fields false. Normal startup and closure can persist profile data.

After any failure, inspect the retained base operation and, if preflight was
the last stage, its environment operation. Do not resend import. Use
`settle-import-records` only when inspection reports retained publication work;
it publishes exact local bytes without another SDK call.

Use the original cleanup nonce from inspection for `request-cleanup-close`,
`observe-cleanup-termination` and `finish-cleanup`. Close requires
`confirmNormalClose:true` and `acceptUnknownFileEffects:true`. It requests one
normal close. Original root exit, empty Job and exact closed HMAC session are
separate required observations. Leave Save/Discard prompts unanswered.
`settle-cleanup-records` completes only retained local publication.

After original cleanup completes, `capture-closed-import` with
`confirmReadClosedFixture:true` retains the complete initial SQL and raw native
source while the original destination handles remain held. A failed
qualification preserves its report and partial file; it permits no replay.
The schematic scenario uses its own complete initial SQL/source qualification
and target with separate schematic/page identities. Its target cannot enter
the PCB opening route. A dedicated fresh schematic registration/page owner and
its local token handoff remain implementation work; page readiness and electrical
connectivity stay unproved.

Then use `release-destination` with `confirmReleaseRetainedDirectory:true`.
It drains the exact original watches and closes directory handles after proved
application termination. It deletes no files. Use `release-owner` with the
base import ID and `confirmReleaseFixtureOwner:true`. If complete closed
PCB qualification and the drained no-library migration proof passed, use
`stage-for-fresh-opening` with that base ID and
`confirmStageClosedFixture:true` before ordinary helper release. This once-only
local action retains an opaque data token in the same facade. It starts no app
and transfers no process, Job, helper or HMAC owner. A copied report cannot
stage a target. Then complete the ordinary launch's termination record and
original helper release. The next separately constructed generated reader
owner consumes the token; use its `open-generated-fixture` action without a
caller target or path. Stay on this facade through that handoff. No new
controller, historical JSON, process-presence sample or restart can replace
these original owners. Follow
[the manager workflow](autonomous-controller-updates.md) for replacement.

Preflight inspection may return `environmentRefusal` with a fixed stage and
bounded response classification. `originalEnvironmentReply` and
`originalImportReply` retain the actual complete bounded upstream reply and its
digest; their raw managed artifacts are recorded in the journal. A native
refusal, malformed result or failed publication accepts no partial fixture.
When only preflight exists, inspecting the original base request reports the
actual environment operation ID. Use that actual ID and its original technical
nonce for cleanup. `nativeEnvironmentMayHaveBeenDispatched` is distinct from
`nativeImportMayHaveBeenDispatched`. Do not infer safe retry from either a
refusal stage or an unallocated importer. Preserve the original case and finish
its cleanup before considering any independently identified later case.
