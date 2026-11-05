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

The joined v1 result is point-in-time qualification. It does not itself seal
the source or prove current unlocked-head age, atomic prewrite queues, document
clocks, backend publication or the complete four-generation writer budget.
The result explicitly preserves these limits and `executionReady:false`. No later write may treat it as permission.

## Read the published source packet

The separate `read-qualified-source` action retrieves the original successfully
published packet. Send only the original `operationId`, `expectedBindingSha256`,
`expectedSourcePacketSha256` from the qualification result, `offsetBytes` starting
at zero and `lengthBytes` from 1 through 65,536. No path or caller packet is
accepted. Every page requires the original coordinator's private packet and
preparation plus an exact unchanged published qualification record and binding.
A fresh coordinator or copied journal cannot supply those original references.

The result identifies `format:"canonical-json-utf8"`, `encoding:"base64"` and
`offsetUnit:"byte"`. Decode each `pageBase64` into bytes and verify its
`pageSha256`. Continue at `nextOffsetBytes` until `endOfPacket:true`. Concatenate
all bytes before strict UTF-8 decoding, verify the complete packet SHA-256 against
`sourcePacketSha256`, then parse the JSON. Its `content` contains the complete
original text. Verify its UTF-8 hash against `sourceSha256`. Byte pages may split
UTF-8 characters, so decoding each page as text would corrupt the source.

This explicit reader leaves the qualifier's v1 hash-only return unchanged. It
returns the complete native-equivalent packet format, without claiming the SDK
wrapper's return format. It makes zero native calls and can read the retained
point-in-time packet from the same original coordinator after helper cleanup,
until controller retirement. It proves no current or saved state, source seal,
writer readiness or Save authority. Reading cannot repeat source collection or
repair failed publication; settle the original retained records separately.

## Seal the original source and prove the closed baseline

After published source qualification, submit `seal-footprint-source` once with
only the same operation and binding. The stage reuses the original native
source seal, owned preparation, opening and completed checkpoint reader. It
reserves six additional normal renderer requests, plus the original control
budget. It verifies exact source/checkpoint identity; opening-related automatic
persistence can make this refuse. A new separate result records the source
seal. The original v1 qualification result and its fixed false fields stay
unchanged.

Then request normal close once. Observe original root exit and an empty original
Job through `observe-termination`. Before helper release, submit
`prove-closed-baseline` once with the same operation and binding. The stage uses
the original seal and termination token to capture the existing complete closed
SQL snapshot, then compares every logical property, schema, table and row with
the original finished checkpoint reader. Equality includes stored history
bytes and peers; it does not establish callback completion, native history
replay, upload-cache exclusion or a saved copy. The result explicitly keeps
`helperReleaseProved:false` and `savedCopyVerified:false`.

Both stages are consumed before their awaited work. Inspect a failed stage and
keep its original cleanup owner. A publication failure can settle the retained
exact result through `settle-records`; settlement never repeats the native seal
or SQL capture. The closed-baseline stage requires the acknowledged normal-close
path. An aborted generation retains its existing termination/release cleanup.
Finish `release-closed` separately after any requested baseline proof.

These results keep `executionReady:false`. They supply no current head-age,
atomic queue, document-clock, backend-publication or four-generation writer
proof and expose no create, scheduler, execution owner, copy/delete or Save.
Source and offline regression coverage do not establish connected acceptance.

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

Only these two exact reviewed producer/installation pairs qualify:

| Original profile | Facade SHA-256 | Installation SHA-256 | Receipt version |
| --- | --- | --- | --- |
| Earlier reviewed opening | `c4da74d20c67fdbba80919e4ad1ff3aed13004aeeb8d4db3f2f21eefdc9cb6cd` | `d5c5727996398d24f60e48439484a88ca1dacacddc6660a7e0723dadd622ea89` | v1 |
| Frozen 190023 opening | `bf9650e7c9b85c698e23fcbf08833dff71aef42f39f1da599e36d1ec5198f1a5` | `4c593053fa7991e49ec0fc7af317a769ee9aa6454d48ea01c31219464eb907d4` | v2 |

The profile comes only from the original managed intent. No caller profile,
producer override, unknown hash or mixed pair is accepted. Both require the
complete thirteen-record opening-intent roster, with no source, route, seal or
later cleanup stage. Released v1 schemas stay unchanged; the second pair uses
separate v2 intent/result markers. The source/offline adapter tests do not
establish a completed live recovery for the second pair.

The resolver must run in a fresh facade before any application
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

An external process-exit receipt cannot replace the resolver's fresh evidence
or grant normal-close baseline authority.
