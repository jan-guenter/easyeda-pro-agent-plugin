# Generated disposable fixture import

Use this development route to create a new fixed Via-only, Line/Via,
Arc/Line/Via, standalone circular SMT Pad or separate SCH/SCH_PAGE Text/Wire/Bus project.
It accepts no caller project, path, archive, ID, geometry, SQL or code. It never
deletes a failed or partial output. Query `fixture-import` with
`includeSchemas:true` and validate the assembled request using
`fixture-import-validate` before calling `easyeda_control_fixture_import`.

The schema query goes to `easyeda_control_api` in this exact wrapper:

```json
{"request":{"action":"fixture-import","query":{"includeSchemas":true}}}
```

Start with this facade's retained ordinary209 launch and exact empty Start Page.
The resolved Windows TEMP directory must use ASCII letters, digits, spaces,
underscores, hyphens and path separators after its drive colon. Dots and
non-ASCII characters are unsupported, including a path under
`C:\Users\first.last`. Configure a compatible TEMP directory before starting
fixture import. Destination preparation refuses incompatible paths before
import dispatch; any already-created environment owner still needs cleanup.

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

For offline validation, place that inner request directly in `query.request`:

```json
{"request":{"action":"fixture-import-validate","query":{"request":{"action":"import-generated-fixture","operationId":"fixture-import-example","fixtureKind":"via-only","confirmDisposableFixture":true,"confirmNativeImport":true,"acceptPartialImportRetention":true}}}}
```

Use the same direct inner-request shape for `launch-validate`. The execution
tools have their own outer `request` wrapper. The fingerprint comes from the
current status result's `upstream.stableFingerprint`; an offline validator does
not obtain or admit one.

`line-and-via` adds one disjoint top-layer line. `arc-line-and-via` adds a
disjoint circular top-layer arc as well.
`schematic-text-wire-bus` selects a separate schematic container and page with
fixed Text and disjoint one-segment Wire/Bus groups. These are disposable data,
without validated electrical connectivity or manufacturing suitability.

Use `circular-smt-pad-only` for the separate Pad point reader. It has its own
initial SQL qualification and read-opening token; it cannot enter the Via
writer through an older target brand. Use
`schematic-text-wire-bus-relevance` for the distinct schematic reader fixture
with one explicit source-owned Wire Relevance attribute. That variant avoids
relying on an implicit unstored default child. It preserves the Bus group
without adding a Wire attribute to it. The original schematic fixture and its
display-writer contracts remain separate.

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
Follow [the generated schematic workflow](generated-schematic-opening.md) for
the distinct SCH route. The schematic scenario uses its own complete initial SQL/source qualification
and target with separate schematic/page identities. Its target cannot enter
the PCB opening route. Its separate `stage-schematic-for-fresh-opening` action
retains the original data token for a new original ordinary runtime. The
`generated-schematic` wrapper opens that real project/page once, then optionally
observes its Text/Wire/Bus through a separate one-shot action. Keep page
readiness, complete accepted reads and electrical connectivity separate.

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

Refusal V2 also records the fixed capture member and bounded descriptor/value
classifications for `fetch` and `Response`. These standard browser globals can
be inherited or lazily exposed. The preflight reads them only after the empty
Start Page guard; application globals still require own data properties.
Historical V1 refusals have no member evidence. A `capture-context` failure in
that version does not identify a particular global. Neither diagnostic version
grants replay or replaces original native cleanup.

For unchanged generated data after a completed controller replacement, use the
separate [closed fixture requalification route](closed-generated-fixture-data.md).
It acquires new read-only resources and verifies the entire initial source/SQL.
It accepts no earlier runtime authority and refuses any post-open file change.
Pad and explicit-Relevance reports use separate historical parser and initial
qualification branches. Their fresh Windows lease has a distinct schema and
accepts only their exact generated basenames. Use a facade containing those
branches; an older parser must refuse their reports.

A destination preparation failure can follow a completed environment getter.
Inspect the explicit environment operation even when base import inspection
reports no cleanup owner for the import itself. Preserve any original helper
failure artifacts. A complete stderr record and a truncated prefix are distinct;
neither authorizes another import or proves whether a directory was allocated.
After original application termination, release the original destination
transport through its supported action, including after failed initialization.
Do not delete unknown partial directories or reconstruct an owner from paths.

The separate `component-circular-smt-pad` generator includes a real project-local
FOOTPRINT document, one owned circular SMT Pad, the placed Component and all four
explicit hidden attributes. Its complete initial SQL/checkpoint and private
opening token have separate schemas. After the acknowledged original destination
and fixture-owner releases, `stage-component-for-fresh-opening` transfers only
that original qualified data to the separate `component-spatial` native birth.
Use its [Component point contract](current-pcb209-spatial.md#separate-generated-component-point-birth).
Older PCB/Pad owners, old reader closed capture and historical data loaders refuse
this target. Frozen build `20261108135950` passed one initial two-document/35-table qualification
and a separate three-point cloned-Pad case with normalized model state 64. Its
original owners released after closure and exact closed raw/SQL preservation.
Fresh post-reader initial qualification still refused WSL birth time zero;
reference-linked points, general Component scenes, registration and writer
authority remain unproved. See the
[scoped Component case](https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/5e42f5817360f830a7b8d2e53e5870e208519bca/docs/history/2026-11-08-generated-component-import-qualification.md).
