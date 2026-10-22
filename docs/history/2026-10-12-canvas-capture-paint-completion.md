# Canvas region capture: paint-completion gap

Date: 2026-10-12. Scope: EasyEDA Pro schematic capture on the reviewed
3.2.149 application / 0.2.53 SDK tuple. This is an offline source review, not
an implemented or live-validated paint fix. It does not cover PCB capture.

## Finding

The bridge's region capture waits for animation callbacks or a timer, but does
not establish that the target schematic renderer has painted the requested
viewport. This synchronization gap is confirmed by the source chain below.

In a disposable test, the API returned a full-sheet overview while a later
process-bound native desktop capture showed the requested close-up. The
returned PNG and `captured:true` were therefore insufficient evidence of its
framing. The exact cause of that incident remains unproven: the retained result
does not record per-stage timing, the timer-versus-animation outcome, renderer
state, or a painted-frame identity. In particular, it does not establish that
the timeout fired or that a renderer was interrupted. See the scoped visual
record in [the connected-validation ledger](2026-10-11-through-2026-10-19-api-connected-validation-ledger.md).

## Reviewed sources

All offsets below are JavaScript UTF-16 string indices in the exact installed
assets, not byte offsets. Paths beginning `pro-` are relative to the application's
`resources/app/assets` directory. The installed files were read, not evaluated.

| Source | SHA-256 |
| --- | --- |
| [Packaged bridge canvas operations](../../plugins/easyeda-pro-control/easyeda-bridge-extension/src/canvas-operations.ts) | `6021fde9f2b3ada0ed1903dff8517d18fec19050ead3a8f120b2757af8bc35e0` |
| [Bridge canvas tests](../../plugins/easyeda-pro-control/easyeda-bridge-extension/tests/canvas-operations.test.ts) | `cf4d2780adcd95f293c193c842654c604657e22193610cabaf24772f4cf4f56f` |
| `pro-api/0.2.53.aee2f57a/api.js` | `5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc` |
| `pro-api/0.2.53.aee2f57a/api-types.d.ts` | `32a0d2f8b4bc3d7b2b93b33499d9d768b0c23c77f45843a65166cf4e8ad6dab1` |
| `pro-ui/3.2.149.43637efe/js/ui.js` | `12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a` |
| `pro-sch/3.2.149.35ae2987/js/sch.js` | `3f50136fb4ba2d5593beac7ef3e20ebe5275177b56bbcfdd297e79f176a6618f` |

### Request path

1. Bridge `canvas-operations.ts:68–92` waits for two callbacks from
   `animationRoot.requestAnimationFrame`, with `animationRoot` defaulting to
   `globalThis`. Its 75 ms fallback resolves successfully even when neither
   callback fires. Without that API, it waits one zero-delay macrotask.
   `captureRegion` at lines 102–126 requests the zoom once, rejects only explicit
   `false`, waits, then requests the image. These are scheduling waits, not a
   target-paint acknowledgement.
2. SDK `api.js:472254` and `:472402` forward image and zoom requests to UI RPC.
   `api-types.d.ts:1099–1108` declares the image getter beta and returning a
   `Blob | undefined`; it provides no paint-completion token.
3. UI `ui.js:17092472` awaits `SCHZoomToRegion` but does not inspect its returned
   message before returning `true`. At `:17094368`, schematic image capture
   forwards to `getSCHCanvasImg`.
4. Schematic `sch.js:6177842` handles `SCHZoomToRegion` by resolving the tab's
   document and calling `scene.zoom.scrollRectIntoViewCenter`. It returns `true`
   even if that document is absent. At `:2121229`, the zoom method changes
   `viewBox`/zoom without awaiting a paint. At `:6098452`, `getSCHCanvasImg`
   calls `document.canvas.renderer.root.toBlob` without flushing or verifying
   the requested viewport.

### Paint ownership

The relevant sequence contains two rendering stages:

```text
zoom/viewBox change → model/camera flush → engine bitmap paint → root.toBlob
```

The source proves that these stages are distinct; the current bridge does not
bind the last two stages to the requested view:

- `sch.js:4580288`, `gve.watch`, reacts to scene changes by installing deferred
  `setViewBoxFn`/`setViewPortFn` callbacks. `UF.render`, in the section beginning
  `:4535153`, drains them and updates modified shapes. The viewBox setter adapts
  the camera. It does not itself paint the final bitmap.
- The facade renderer at `:4581621` and `:4584446` calls the model-view update
  and `UF.render`. `canvas.rendererTickerPlugin` at `:2093093` registers this
  work with the target canvas ticker at priority **25**, not a 25 ms delay.
  Listener ordering is defined at `:2091234`. The ticker has its own animation
  loop at `:2090563`; its update skips work while interrupted. Canvas setup at
  `:5634217` interrupts/resumes it around document consistency actions. This
  capability does not prove it was interrupted during the observed incident.
- A separate scene engine paints the bitmap. `UF.init` at `:4533197` requests
  a Canvas2D preference, but engine selection at `:3109265` first honors
  CPU/GPU settings. The preference alone therefore does not identify the active
  engine. CPU scene `$D` at `:3087874` owns a second animation loop at `:3093632`,
  calling `render` and `renderRuler`. CPU `render` at `:3103005` paints
  synchronously when rendering is needed and the camera is orthographic.
  WebGPU has its own animation/submission loop at `:3828554`. Its use of
  `queue.onSubmittedWorkDone` is not, by itself, evidence that the requested
  viewport was submitted before that wait.

No directly usable paint-completion promise/event was identified in these
reviewed wrappers. This is a bounded finding, not a claim that no such signal
exists elsewhere. Waiting only for the target model ticker would still omit
the separate bitmap-paint stage.

### An explicit renderer flush can change model state

The facade's model-view renderer is not an unconditional read-only operation.
At `sch.js:4578133`, its `render()` drains model updates and, when
`hasZIndexChange` is set, sorts root and descendant containers. The recursive
traversal at `:4500788` also calls `trySortChildrenByZIndex()` for each container.
That sorter at `:1929853` can repair invalid ordering by assigning model
`zIndex` values, rather than merely sorting an independent view list.

The setter at `:1922659` changes `_zIndex` and calls the modification monitor.
When watched, that monitor at `:1886853` notifies bounding-box, attribute and
history listeners. Some assignments request exclusion from history, but that
does not make the model assignment itself a viewport-only change. This is a
source finding, not evidence that a capture changed a design.

A candidate adapter must therefore prove an appropriate clean state before
calling any such flush, or use a separately reviewed narrower route. Checking
only `hasZIndexChange` is not sufficient: pending model, table, part and removal
work, deferred camera updates and camera change listeners need their own review.
No clean-state predicate is implemented or admitted yet.

The CPU scene's `render()` returns `true` after its synchronous paint, but
returns without a value when rendering is unnecessary or the camera is not
orthographic. A clean `needRender` flag alone remains insufficient. Nor is an
exact increment of `renderI` a reliable paint witness: texture generation at
`:3084250` increments that counter too. A candidate must bind the actual paint
call and its result to the exact scene, camera and bitmap, without forcing a
dirty flag to make the call succeed.

## Implementation direction

Use a separately reviewed, sealed schematic adapter. It should bind the exact
document, canvas, renderer, root canvas, underlying scene and camera identities;
record the requested and observed viewBox, viewport, zoom and pixel dimensions;
and reject unsupported runtime/engine shapes. A successful zoom response alone
must not establish readiness. Recheck identity and viewport after every awaited
boundary, including the asynchronous blob callback.

The narrowest candidate is CPU-only support: allow pending reactive updates to
reach the target, establish a clean-state contract for any explicit model/camera
flush, verify that camera mapping matches the request, then bind capture to
completion of the exact underlying CPU paint. The side effects above mean that
calling the general facade renderer without that contract is not acceptable.
The case where `needRender` is already false also needs a separate witness or
an explicit refusal. Do not force that flag, resume an interrupted ticker,
change engine settings or patch prototypes to manufacture a successful
observation.

Alternatively, use an engine-specific completion observer for a successful
paint of that exact scene and viewport. The source establishes frame ownership
but does not supply a ready-made public observer. GPU support would require
evidence of submission **and** completion for the requested frame. Leave it
explicitly unsupported until that contract is established.

Longer fixed sleeps, two identical PNGs or extra zoom calls are not substitutes:
an unchanged wrong bitmap can satisfy those heuristics. Neither candidate is
implemented or admitted by this note.

## Required tests and admission

Extend the maintained dependency-injected canvas harness with separate queues
for bridge animation callbacks, target model updates, engine paint/submission,
and blob completion. The fake image should carry a viewport/paint-epoch witness,
not merely return a canned Blob. Cover:

- Outer animation callbacks completing while the target bitmap remains stale.
- Timer expiry or missing animation support without a verified target paint.
- Model/camera updates completing before the underlying engine paint.
- A `true` zoom response with no target document; replacement of the tab,
  document, canvas, renderer, root or camera during any await.
- An exact CPU paint with matching camera/dimensions; changed viewport or
  identity while `toBlob` is pending.
- A GPU queue becoming idle before the requested frame is submitted, or an
  explicit refusal when that engine is outside the adapter's contract.
- Identical stale images, null/throwing image results, interrupted consistency
  actions, bounded deadlines, and cleanup of only the adapter's own observers.
- No second zoom, Save, forced rendering flags or ticker-resume recovery on
  any failure path.

The existing bridge tests establish argument forwarding and scheduling order;
they explicitly permit timer-fallback capture without animation callbacks.
They do not establish correct target framing. Unit/source proof must be
followed by a new disposable, foreground API/native visual comparison before
claiming connected support. For now, retain mismatched images, inspect their
actual framing and use a legible, correctly bound native capture for visual
review. Do not repeat a design edit to repair an image.
