# Disposable PCB point and region identities

Use this reference for the separate `spatial` development/validation purpose on
the reviewed EasyEDA 3.2.209 installation. It supports restricted Via, Line/Via,
Arc/Line/Via and standalone circular SMT Pad-only scenes. For general object
observations, use [the opening reader](current-pcb209-opening.md).

Discover `easyeda_control_api` action `pcb209-spatial` with
`query.includeSchemas:true`, then validate requests with `pcb209-spatial-validate`.
Dispatch through the existing `easyeda_control_pcb209_opening` tool:

```json
{
  "request": {
    "action": "spatial",
    "request": {
      "action": "launch",
      "operationId": "pcb209-spatial-example",
      "confirmValidationOnly": true,
      "confirmDiagnosticLaunch": true,
      "acceptExistingProfileEffects": true
    }
  }
}
```

Choose a unique operation ID and an explicitly identified disposable project.
This purpose must be selected before launch. Existing opening, visual, worker
and model owners cannot become spatial owners. Keep the same original facade
through cleanup; [the controller manager](autonomous-controller-updates.md)
supports development without repeatedly publishing or restarting Codex.

## Opening and observation

Use the same original-owner setup stages as the
[opening reader](current-pcb209-opening.md): browser observation, retained target
and frame inspection, fixed UI source inspection, checkpoint-bound project
opening, the retained PCB opening, then `observe-pcb-opening`. Use the returned
binding digest and observed IDs. The target comes from the registered disposable
checkpoint, not an inferred active tab or another project.

Opening can restore tabs, migrate data, replay caches and automatically persist
or Save. The read stage offers no explicit Save or design writer.

Submit one `observe-spatial` request with `acceptNativeScratchEffects:true` and
an ordered `queries` array of one to sixteen entries. Point queries contain
`kind:"point"`, `xMil` and `yMil`. Region queries contain `kind:"region"`,
`mode:"inside"|"intersects"`, `leftMil`, `rightMil`, `bottomMil` and `topMil`.
Coordinates use the PCB data origin in mil. Region bounds must have positive
width and height. Query exact schemas for finite coordinate bounds and flags.

Batch related queries before dispatch so the fixed original-function
qualification is shared. A failed or lost observation consumes that stage.
Inspect its retained result and finish cleanup; do not submit it again under
the same operation or infer that an absent response means no dispatch.

After a refusal, inspect the original operation with the inner request
`{action:"inspect",operationId,observation:"spatial209"}`. This inspection takes
no binding digest and does not collect another native sample. The usual outer
tool wrapper remains `{request:{action:"spatial",request:innerRequest}}`.
A metadata decode failure can retain `spatialDecodeFailure` with its fixed
failed step, private record locator and content digest. The bounded normalized
inspector packet stays private because it contains original remote handles.
Its labels or handles cannot recreate an owner, qualify a function or authorize
another query. An earlier payload may have retained no packet; preserve that
unknown outcome instead of inferring its cause from a later case.

When fixing the adapter, develop in a separate checkout while the selected
payload stays frozen. Finish original normal close, observed root/empty-Job
exit, closed capture and helper release before retiring its facade. Then use
the retained manager to select and admit a verified replacement. A new consumed
case still needs fresh fixture-data qualification. Neither an in-place package
edit nor switching query variants completes the failed case.

For a scene containing native Tracks and Vias, choose `observe-spatial-lines`
instead, with the same scratch-effect acceptance and one to fifteen queries.
Native Track identities are returned with family `Line`, matching the SDK's
Line meaning. This is a separate mixed-family result contract. It consumes the
same observation slot as the Via batch; a failure never permits switching to
the other action. The256-callee qualification and fifteen-query limit fit the
existing384-request purpose, including original group release.

For circular ArcTrack models, choose `observe-spatial-arcs` with one to six
queries. It admits the same Line/Via subset and projects native ArcTrack as SDK
family `Arc`. It qualifies265 original application functions, keeping the same
384-request cap and original release reserve. It uses a third immutable result
schema and consumes the same observation slot; no variant can follow another
variant's completed or failed attempt.

For a scene containing only ready standalone circular SMT Pads, choose
`observe-spatial-pads` with one to sixteen point queries. Its distinct immutable
result shares that same consumed observation slot. It qualifies 215 original
callees and uses 344 of the unchanged 384 request IDs, including group release.
Pads must use the supported Mi view and tE model, copper layer 1 or 2, rotation
zero and padType zero, with no parent or smart Pad state. Mixed families,
placed or polygon Pads and every region query refuse before native hits.
The existing Via/Line/Arc generated fixtures cannot establish positive Pad
validation. A matching generated Pad fixture and connected acceptance remain
pending.

## Supported scene and effects

The initial scene contains only standalone, unlocked, visible through vias in
the supported complete ready native indexes. It requires existing initialized
camera/filter state, smart mode off and no dialog or expansion mode. Pending,
empty/stale tree leaves, other primitive families and contradictory ownership
refuse. A region query refuses any Via box crossing its boundary. This avoids
claiming unsupported boundary-intersection semantics.

The mixed action additionally admits standalone unlocked nondegenerate Tracks
on copper layer1 or2 with width at least0.05 native units. Their complete ready
octagon indexes, original model bounds, reciprocal model/view and shared
layer/width/lock/net fields must agree. Lazy geometry, maintenance queues and
region border crossings refuse before the native hit. The256-object ceiling
applies across admitted families and layers. The Arc action additionally
requires a finite positive circular radius, bounded start/end angles, an exact
clockwise/counterclockwise enum, arcType1, width at least0.05 native units and
copper layer1 or2. It requires the original ready model/view/index and cached
bounds. Graphical native Arc/Line models and components remain unsupported.
The Pad-only alternative does not extend those mixed-family scenes. Component
point prefiltering needs qualified footprint-cache lineage, the yqe/Ae transform
chain and its iE._modify scratch effect; region filtering also needs Gs.
These actions do not accept an ordinary populated board.

Each query returns bounded ordered supported identities from two matching native
samples, together with the ordered selected IDs and retained-descriptor checks.
It executes neither the lossy public point mapper nor the selection-changing
public region handler. It does not select a later supported hit after an
unsupported object, restore selection or clear caches to force admission.

The fixed application callee descriptions and original script/function
locations are qualified before sampling. Current member resolution must still
match the captured references immediately before each native call. Standard
ECMAScript renderer intrinsics are trusted; their identity is not independently
proved. This is not a sandbox for a hostile or modified renderer.

The native geometry helpers use bounded shared bit-mask, rectangle and lexical
scratch state. Exact acceptance is recorded in the result's effect field. These
effects are distinct from circuit edits. The reader does not promise zero
existing-object mutation or claim complete native/SQL source membership,
connectivity, a continuous snapshot, full SDK instance parity or persistence.
Source and synthetic tests do not establish connected validation.

## Closure

Finish with the original observed window's one normal close, separately observed
original root and empty-Job termination, acknowledged helper release and record
settlement. Do not answer Save/Discard prompts or substitute process-presence
samples for original termination proof. Report read results separately from
closed-file invariance, installation and connected evidence.
