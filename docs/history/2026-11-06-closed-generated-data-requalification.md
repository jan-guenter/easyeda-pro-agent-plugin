# Closed generated data requalification

This increment adds a maintained current-facade verifier for an earlier generated
fixture whose bytes still satisfy its complete initial import profile. It loads
managed archive/capture data from a prior import operation, acquires new read-only
Windows and Linux resources, rereads all SQL, and can issue a new private source
for an independently born reader. It adopts no historical runtime or closure.
The tool still needs the root index/manager mount below. No Windows execution or
connected reuse acceptance is claimed by this source increment.

## Admission and data pipeline

`closedGeneratedFixtureDataRequestSchema` accepts one original attempt with
`operationId` (`fixture-data209-...`,24–80 characters), `importOperationId`,
`generatedArchiveArtifactSha256`, `closedCaptureArtifactSha256`, and the two true
confirmations. These SHA values select exactly one `generated-archive` and one
`closed-import-capture` phase artifact within the given import operation. No
path, SQL, archive bytes, target identity, previous PID, Job, HMAC, native helper
receipt, runtime status or profile override is accepted from the request.

The normal managed artifact reader verifies the journal and complete artifact
bytes. This is unkeyed data integrity, not authentication against a writer with
control-data access. The loader requires the exact generated archive stage and
managed closed snapshot locations, then creates a genuine complete SQL inventory
from the old snapshot and reruns the separate PCB or SCH initial qualifier. Old
JSON target fields locate data; their old owner/closure/acceptance flags grant
no current authority.

A fresh `WindowsControlRuntime` must remain `not-launched` with null launch. Its
original proof helper observes no same-name application before acquisition and
at bounded source-processing boundaries. The original index reservation excludes
other plugin app/native allocations. Boundary observations do not claim a
continuous global process exclusion. Existing applications are never adopted,
closed or signalled.

The separate `closed-generated-fixture-data.ps1` helper holds new handles to the
current Windows TEMP parent, exact `CodexEasyedaFixture_<32hex>` directory and
one generator-named `.eprj2` file. The private directory must have the original
current-SID/SYSTEM protected ACL and an exact one-file roster. The file must be
single-link, regular, non-reparse and512 bytes–64MiB. The file handle permits read
sharing only, denying write/delete sharing. The directory watch starts before
the first hash and is never rearmed; any name notification, overflow, identity,
ACL, content or roster drift refuses qualification. Native hashing must agree
with the earlier closed snapshot before Linux source decoding.

The retained Linux copy owner opens every parent component without following
links, retains the complete component chain, copies through its original file
handle into a new exclusive managed snapshot, runs the genuine complete SQL
reader, and reruns the exact initial qualifier using fresh native FILETIME data.
All source bytes and complete SQL must equal the requalified earlier snapshot.
Only sub-millisecond storage representation is truncated when comparing the
retained Linux times with native integer-millisecond FILETIME observations; the
initial native clock formats/relationships remain unchanged. This is data
bookkeeping, with no writer clock/age authority.

All original Linux close Promises, the new native watch cancellation/drain,
original file/directory handles, original helper transport EOF/exit, and new
proof-supervisor release acknowledgement must settle before successful source
staging. Failure retains the original coordinator and partial files. No source
SQLite attachment/write, Save, application launch, registry change, deletion,
normal-close request, process adoption or force termination exists in this route.
A changed post-open file is deliberately ineligible for this initial profile.
A later profile needs actual complete post-open closed evidence first.

## Index and manager integration

Exports from `server/src/closed-generated-fixture-data.ts`:

- `closedGeneratedFixtureDataRequestSchema`
- `queryClosedGeneratedFixtureData`
- `validateClosedGeneratedFixtureDataArguments`

Suggested public tool: `easyeda_control_fixture_data`, request as its sole
strict body. Offline queries: `closed-generated-fixture-data` and
`closed-generated-fixture-data-validate`. There is no expected runtime
fingerprint or authenticated SDK scope: this is a closed-data route.

Constructor from `server/src/closed-generated-fixture-runtime.ts`:

```ts
new ClosedGeneratedFixtureDataCoordinator({
  operationId, pluginRoot, assetsRoot, runtime: freshNotLaunchedProofRuntime,
  assertOriginalOwner,
});
```

Use a separate original in-memory data allocation slot. Require all ordinary,
PCB/native lifecycle, import and other app allocations/staging reservations to
be clear before allocating this slot. Construct a new fixed209
`WindowsControlRuntime` using current trusted executable/helper/scope pins;
never assign an old launch or reconstruct it from JSON. Retain the allocating
slot before construction. The synchronous `assertOriginalOwner` closure admits
that bounded original allocating slot, then only the exact assigned coordinator
and proof-runtime object; it must continue to forbid another app allocation.
Pin the prototype methods `execute`, `inspect`, `hasActiveReservation`,
`hasPendingWork`, `stageSourceForFreshOpening`, and
`stageSchematicSourceForFreshOpening` as in the other owners. Route under the
existing bridge gate, outside authenticated bridge dispatch scopes.

Requests are:

```ts
{ action: "requalify-closed-generated-fixture", operationId, importOperationId,
  generatedArchiveArtifactSha256, closedCaptureArtifactSha256,
  confirmReadClosedGeneratedFixture: true,
  confirmFreshNoApplicationCheck: true }
{ action: "inspect", operationId }
{ action: "settle-records", operationId }
{ action: "release-owner", operationId, confirmReleaseClosedDataOwner: true }
{ action: "stage-for-fresh-opening", operationId, confirmStageRequalifiedData: true }
{ action: "stage-schematic-for-fresh-opening", operationId,
  confirmStageRequalifiedData: true }
```

Only the first request allocates a coordinator. `inspect` reads this retained
object, never historical JSON. `settle-records` resumes only immutable original
pending journal/artifact bytes; it cannot reacquire files or repeat qualification.
`release-owner` requires actual new resource acknowledgement and settled records.
The settled journal uses generic terminal state `completed` only after all new
resources acknowledge closure; the qualified/refused data outcome stays in
`mutationState` and the typed result artifact. An uncertain resource release
keeps `closed-data-resource-release-unresolved` with `hardStop:true`. The actual
shared admission scanner verifies both terminal outcomes clear and the uncertain
case remains blocking, without changing a shared guard.

Gate all runtime replacement/retirement on the conservative synchronous pending
observer, including before file allocation and after partial failures.

Handle both stage requests locally in the index after `release-owner`, outside
`execute` (which deliberately refuses staging and any released-owner run). Call
only the corresponding retained `stage...SourceForFreshOpening(operationId)`
method, then place its opaque result into the existing independent PCB or SCH
source slot. A new ordinary/spatial/SCH owner consumes that token once using the
maintained generated prefix. Remove the source from its staging slot before
constructor entry; failed construction consumes that transfer. The SCH data
origin has no importing runtime and invents none. Earlier native runtime,
HMAC, PID, Job, watcher and original closure claims stay false.

The new coordinator releases its own proof helper before staging. Once owner
release and any intended transfer are complete, the index may clear the data
slot; no extra ordinary helper release is due from this route. Manager
classification must retain the data slot during start/settlement/release and
must never automatically repeat the start action.

## Validation and limits

Pinned Node24.18.0/npm11.16.0:10 focused tests plus6 existing SCH opening/cleanup regressions pass, including genuine full old
managed-artifact/SQL requalification, real Linux descriptor copy/SQL, actual
`WindowsControlRuntime` proof lifecycle with explicit synthetic native/file
seams, changed identity/watch, lost release reply, existing-app refusal, lost
result publication settlement without requalification, and distinct new SCH
source transfer. Both TypeScript projects and strict type-aware zero-warning
lint pass. Linux .NET C# compilation checks syntax only; Windows5.1
`-CompileOnly` and actual fresh closed-data/helper execution remain root-owned
prerequisites. No native acceptance is advertised by the tests.
