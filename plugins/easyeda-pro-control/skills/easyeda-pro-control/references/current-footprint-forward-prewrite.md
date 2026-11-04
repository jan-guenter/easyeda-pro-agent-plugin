# Forward prewrite source qualification

Use `footprint-forward-prewrite` through
`easyeda_control_pcb209_worker_startup` for a fresh born-forward main/renderer
qualification owner. This route joins original source and route observations.
Its result keeps `executionReady:false` and supplies no writer, create,
scheduler, execution owner, copy/delete or Save action.

Discover offline `footprint-forward-prewrite` with
`query:{includeSchemas:true}` and validate each exact inner request with
`footprint-forward-prewrite-validate`. Send validated requests as:

```json
{
  "request": {
    "action": "footprint-forward-prewrite",
    "request": {
      "action": "inspect",
      "operationId": "footprint-copy-qualify-example"
    }
  }
}
```

Parsing supplies no execution authority. Choose a new
`footprint-copy-qualify-*` operation before launch. Other startup, route,
combined, preparation or cache owners cannot become this owner. Historical
records and matching JSON cannot reconstruct it.

## Qualification sequence

1. Launch with `confirmValidationOnly:true`, `confirmDiagnosticLaunch:true`,
   `acceptExistingProfileEffects:true` and `acceptDebuggerPauseEffects:true`.
   Retain the original binding digest. Existing-profile launch and opening can
   restore tabs, migrate, use the network and automatically persist files.
   The target must be an explicitly identified registered disposable project.
2. Require a successful published `observe-main-construction` result. Then
   qualify the original browser, frame and UI script before `capture-project`.
   Keep the exact target, checkpoint and opening/debugger confirmations from
   [worker startup](current-pcb209-worker-startup.md). Main construction must
   already be published before capture can dispatch.
3. Require successful published `observe-current-assignments`,
   `observe-actor-clock` and `observe-footprint-route` results from this original
   owner. Route qualification retains its fixed parser/callback/destination
   guards. Consult [route preparation](current-footprint-copy-preparation.md#original-worker-and-callback-route-preparation)
   for those guards; its older owner cannot be substituted here.
4. Submit `qualify-footprint-source` once with the same `operationId`,
   `expectedBindingSha256` and one `footprintUuid` from the original completed
   checkpoint. The stage reads the native source twice and derives its original
   owned preparation, source assets and historical head. It accepts no caller
   plan, source, clock, scheduler, execution owner or command budget.

Source reading and preparation reserve 65 and 8 normal requests respectively
from this original channel. These are code-derived capacity bounds, not measured
native timings or permission to reset the shared counter. Keep the separate
original cleanup reserve.

The tool returns qualification hashes and flags, not raw source text. The
complete source packet is retained in the managed `forward-prewrite-result.json`
diagnostic journal. This action does not stream that source through MCP.

The joined result is point-in-time qualification. It does not seal the source
for a closed snapshot, prove current unlocked-head age or atomic prewrite
queues, arm document clocks, prove backend publication or reserve the complete
four-generation writer budget. The result explicitly preserves these limits
and `executionReady:false`. No later write may treat it as permission.

## Keep the original cleanup owner

Every stage is consumed once. Inspect uncertainty and retain its original
records without retrying a failed stage. Native normal close, actual root exit,
empty original Job, helper release and record settlement remain separate steps.
Keep Save/Discard prompts unanswered unless explicitly authorized.

Use the explicit `abort-generation` action only when the user has authorized
forced termination of this original EasyEDA Job. It requires
`confirmAbortOriginalForwardJob:true`, which records that authority. It can
target only this original forward
Job, consumes its own intent and blocks subsequent normal work. A missing
acknowledgment grants no retry. Abort acknowledgment does not prove termination
or helper release; observe both before considering controller retirement.

This mounted contract and its offline tests do not establish connected native
qualification, saved/reopened effects or writer readiness.

## Historical opening without its original owner

If the original facade disappears during opening, do not reconstruct its owner
from journal JSON or replay capture. The separate offline
`footprint-forward-opening-relinquishment` and
`footprint-forward-opening-relinquishment-validate` selectors describe a narrow
historical resolver. Its live wrapper has the same name and accepts only
`relinquish-unknown-opening`, the original operation and three exact expected
intent/binding/opening digests, plus `confirmRelinquishUnknownOpening:true` and
`acceptUnknownCaptureOutcome:true`.

Only the exact reviewed producer, installation and complete opening-intent
roster qualify. The resolver must run in a fresh facade before any application
owner allocation. Other recognized Linux facades, including retired and
ownership-conflict processes, block it. Use their supported normal lifecycle;
do not signal another server without explicit user authority. The resolver
collects its own Windows absence and complete unchanged raw/prepared SQL and
history proof. Supplied audit JSON cannot replace those observations.

Separate append-only receipts can relinquish the historical startup blocker.
They keep capture, termination and helper-release outcomes unknown and
`originalLaunchIdentityVerified:false`. They grant no original owner, replay,
writer, Save or qualification authority. Preserve the failed case and its
original records after successful relinquishment.
