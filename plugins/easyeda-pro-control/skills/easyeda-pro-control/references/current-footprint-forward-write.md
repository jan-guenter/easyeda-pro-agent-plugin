# Controlled disposable footprint copy

Use `easyeda_control_current_footprint_forward_write` only when the actual loaded
tool catalog exposes it in the reviewed `public-utilities-only` profile. It runs
one complete original footprint-copy workflow on an explicitly identified
disposable project. It does not enable an ordinary-project library writer.
Implementation, finite budget reservation and offline tests do not establish
connected validation. Report the actual retained result of each run separately.

## Prepare and execute

Query offline `easyeda_control_api` with `request.action` set to
`current-footprint-forward-write` and `query.includeSchemas:true`. Before a live
call, use `current-footprint-forward-write-validate` with the assembled request
in `query.request`. These actions allocate no controller or native owner.

Prepare with `request.action:"prepare"`, a fresh `operationId` beginning
`footprint-forward-flow-`, the exact `target` and its existing `footprintUuid`.
The target contains only `rawWindowsPath`, `projectUuid`, `documentUuid` and
`expectedSourceSha256`. Obtain these from the actual closed disposable file;
never copy a historical target or invent a source digest. The controller derives
its parent `footprint-forward-writer-` ID. No parent owner, callback, binding,
clock or future destination UUID is accepted.

Preparation requires these literal confirmations:

```json
{
  "confirmValidationOnly": true,
  "confirmDisposableProject": true,
  "acceptExistingProfileEffects": true,
  "acceptNormalOpenEffects": true,
  "acceptDebuggerPauseEffects": true
}
```

Use the same operation ID for the single execute request:

```json
{
  "request": {
    "action": "execute",
    "operationId": "footprint-forward-flow-REPLACE_WITH_FRESH_SUFFIX",
    "confirmDisposableCopy": true,
    "confirmCopyTriggeredPersistence": true,
    "confirmNoExplicitSave": true,
    "acceptUnsupportedInverse": true
  }
}
```

Replace the example suffix with the actual fresh lowercase identifier. This is
an effectful copy: normal opening and the copy may persist data automatically.
No explicit Save is submitted. The tool has no supported inverse.

Execute returns promptly while its original controller retains the operation.
Use `inspect` with the same ID to observe its current stage, execution/cleanup
settlement, publication state and bounded diagnostic. A running response is not
completion. Never repeat execute after a timeout, error or lost acknowledgment.

## Completion and cleanup

A completed result must retain the actual original Create reply, clocks, Main
request, publication and natural timer tail. It then requires writer closure,
complete closed SQL effect, a distinct held cold generation, fresh source/state
reads, independent closed SQL equality and acknowledged helper release.
Inspect `completed`, `savedResultVerified`, both SQL digests and both release
fields. Preview, raw UUID, native return or closed process alone does not prove
this result. Global `connectedValidation` remains false until the route is
deliberately reviewed for broader support.

For interruption, submit `cleanup` with the same ID and
`confirmOriginalJobsOnly:true`. It targets only that controller's retained
original Jobs. Inspect until original execution and any requested cleanup have settled,
writer and saved resources are released, and publication is no longer pending.
A never-allocated generation can be released without a termination observation.
Cleanup does not discard, restore the file or reverse a possible copy.

`settle-publication` repairs the original retained journal bytes. If cleanup was
already requested, it may then continue its remaining original cleanup steps,
reusing acknowledged outcomes without dispatching those consumed steps again.
It cannot repeat an edit, an unknown native attempt, or reconstruct an owner
from historical JSON.
Do not replace the serving facade while its original work or publication is
unfinished. The [foreground manager](autonomous-controller-updates.md) retains
the original flow ID and connection for inspect, cleanup and settlement after
an interrupted call; a cleanup attempt is consumed before transport and cannot
be replayed after an unknown acknowledgment.

## Original preflight release recovery

The current complete birth uses the separate `complete-birth.v3` reservation and
V2 workflow journal/result schemas. Historical V1 workflow records and V2 birth
projections retain their original grammar and reservations. Fresh launch guards
recognize both workflow journal profiles; unfinished or unreadable history keeps
blocking a new launch.

The coordinator can make at most one second release attempt per original writer
or saved generation. Only the same retained provider's exact first failure can
obtain the native owner's opaque proof that release work never started and native
activity is unchanged. The coordinator publishes the second intent with that
proof's current facts, rechecks the original token after publication, and lets
the native owner consume it once before dispatch. Facts, hashes, copied errors,
caller JSON and historical receipts cannot create this capability. The second
result repeats facts about the failed first attempt; it does not describe the
second attempt as undispatched. A second failure, unknown acknowledgment,
activity drift or failed proof keeps the original generation unresolved. No new
caller action, retry flag, termination signal or owner adoption is exposed.

The V3 storage reservation adds four cleanup records, 16,384 artifact bytes and
51,200 manifest bytes. Its single extra normal control and reply header reserve
the genuine precreate body-capacity latch. The original native release budget
is unchanged: the only recoverable first attempt performed no native release.
