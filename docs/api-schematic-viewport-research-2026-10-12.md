# Schematic fit-all viewport adapter research

Research date: 2026-10-12, Europe/Berlin. Baseline payload `e566f2ab`, installed
plugin `0.3.0+codex.20261011220050`. This extends
[the earlier adapter survey](api-next-adapters-research-2026-10-11.md).
It is an implementation proposal, not an enabled route or connected test.
Only official documentation, repository source and installed static application
code were read. No current editor, project, profile or design was accessed.

## Recommendation

Keep fit-all omitted from this release. The focused feasibility work below
produced tested bounded fit math, but its simplest complete geometry profile
would admit only frame-free root rectangles. That is not useful schematic
coverage. Frame/text geometry and the interaction/rendering proofs remain
unimplemented, so this is a concrete omission, not a validated execution route.

The next useful candidate is one schematic-only **fit-all and capture** action
inside the guarded capture workflow. Use the retained ordinary page's native
zoom receiver and the existing PNG evidence handling. Do not add an arbitrary
SDK-call tool or describe this as a getter. The operation changes the visible
viewport and UI scale state. It must preserve design source and selection, and
stop if rendering completion cannot be observed. Do not reset the viewport
automatically after a failure.

The native route is feasible, but an adapter still needs the ownership,
interaction, bounds and renderer proofs below. The current capture gate does
not already provide them. This research neither changes compatibility pins nor
claims that the full public method contract is supported.

## Public contract and static identities

The official method is beta. It accepts an optional tab, returns four visible
region bounds or `false`, and otherwise chooses the last input-focused canvas.
Schematic and symbol bounds use 0.01-inch units; PCB and footprint bounds use
mil. The method page warns against production use of the beta API. A first
adapter should require the exact active ordinary schematic page and never rely
on the omitted-tab default. [Official fit-all method](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_editorcontrol.zoomtoallprimitives.html).

The installed declaration agrees at line 1149. The declaration does not promise
completed pixel rendering, unchanged selection, no persistence effects or exact
receiver ownership. Those are additional adapter obligations, not implied by a
resolved promise. [Official editor-control class](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_editorcontrol.html).

All complete static files below were hashed independently. Paths are relative
to `resources/app/assets`. Offsets throughout this document are zero-based
UTF-16 positions in the decoded file, not byte offsets or line numbers.

| Static file | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-api/0.2.53.aee2f57a/api.js` | 1881523 | `5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc` |
| `pro-api/0.2.53.aee2f57a/api-types.d.ts` | 678232 | `32a0d2f8b4bc3d7b2b93b33499d9d768b0c23c77f45843a65166cf4e8ad6dab1` |
| `pro-ui/3.2.149.43637efe/js/ui.js` | 17265809 | `12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a` |
| `pro-sch/3.2.149.35ae2987/js/sch.js` | 6431214 | `3f50136fb4ba2d5593beac7ef3e20ebe5275177b56bbcfdd297e79f176a6618f` |

These match the retained compatibility and native profiles. Researching the
latest official documentation does not upgrade the installed implementation.

## Dispatch and exact ownership

The API wrapper at `api.js@472707` forwards the argument to the fixed
`extensionApi.DMT_EditorControl.zoomToAllPrimitives` message. The UI method at
`ui.js@17091925` first resolves its tab. The schematic branch sends
`SCHFitviewByTabId`; other branches target panel, PCB or footprint frames.
The method is therefore not a single cross-editor implementation.

At `sch.js@6177435`, the handler resolves the document, calls its
`canvas.scene.zoom.fitView()`, then reads `canvas.scene.viewBox.bbox`. It returns
`left=minX`, `right=maxX`, `top=-minY`, `bottom=-maxY`. Its missing-document
check protects the call but not the later dereference. A disappearing page can
throw, despite the public contract's `false` result. Do not retry after that
exception because the viewport might already have changed.

The document manager resolves a tab through the document UUID and its own map,
at `sch.js@6416877` and `6418183`. Its active-document getter consults
`window.UI.tabBar.getActiveTab()`. The tab-bar readers at `ui.js@16272998` and
`16273182` search the current container registry. A matching document UUID alone
does not prove the expected project, active container, canvas or frame.

Proposed retained references, all rechecked immediately before dispatch and
after every awaited boundary:

- `globalThis.SCH`, `globalThis.UI`, `UI.tabBar`, its active-tab and tab lookup
  functions, the exact tab row and its ordinary active container.
- `SCH.docMemoryManager`, its document-map entry, the exact page, project
  manager, `shapeManager`, `idManager`, consistency implementation and action
  runner. Require exact project/branch/page/tab/path context, initialized
  consistency, ordinary `SCH_PAGE`, and no block-instance or symbol document.
- `page.canvas`, `canvas.shapeManager`, `canvas.scene`, `scene.canvas`,
  `scene.zoom`, `zoom.scene`, `scene.viewBox` and `scene.viewPort`. Require each
  reciprocal owner and the original `fitView` receiver/function identity.
- The host DOM element, `ownerDocument`, connected renderer root, renderer,
  scene graph, scene-graph camera and canvas ticker. Retain the same objects,
  nonzero dimensions and unchanged host rectangle throughout the action.

The canvas constructor at `sch.js@5629115`, scene constructor at `2125157`,
renderer accessors near `5634940`, and renderer construction at `4581436`
establish those relations. DOM/frame ownership must be checked in addition to
these JavaScript references. Do not call `getOrInitDoc`, activate a tab, create a
canvas, restart a ticker or focus an element to make admission pass.

Prefer a fixed native-equivalent adapter invoking the captured zoom method
synchronously after its final checks. The public message-bus path looks up the
document again after an await, so explicit `tabId` alone cannot retain the
receiver. Report the native equivalent separately from direct public execution.
Neither approach is an atomic lock against user actions between observations.

## Idle interaction is more than an idle action runner

The tool manager at `sch.js@2101194` has a default tool and an active tool.
Its `isIdle` getter also accepts a table tool under a special condition. A first
adapter should require the narrower exact default-tool identity, not just
`isIdle=true`. Never switch tools or cancel a drawing to satisfy the guard.

The event reactor at `sch.js@2109979` initializes separate left, middle and
right mouse statuses. Proposed admission requires all three to be exactly zero,
retains the event-context owner, and checks for no live point-acquisition or
placement transaction. Registered `eventReactor.actions` is not itself a list
of active actions; the point-acquisition constructor adds permanent services at
`5584455`. Rejecting any nonempty `actions` collection would reject idle canvases.

The global action runner's `running` getter at `1840098` means a current action
exists. Retain that runner and require `running=false` and no current action.
This is necessary but insufficient for modal editors and tools.

The text editor at `5576204` sets `textModel` when editing begins but does not
clear it on normal completion. Its field cannot be used as an active-edit flag.
The text-input DOM helper starts at `5578831`; blur commits via an `onChange`
callback and removes the container. Escape or Enter can hide it before blur.
Require absence of both `textBoxContainer` and `textInputBox`, not merely hidden
styles or a nonfocused textarea. Refuse an editable active element or visible
modal editor; never focus or blur it. Source range: `5579150` through `5582125`.

The ordinary page proof must also reject an active drag, panning, control-dot,
paste/placement, simulation, table-edit or property-edit session. The concrete
default-tool/action/mouse/text gates above cover important paths, but they are
not yet an exhaustive live interaction predicate. Implementation review must
trace any additional retained service flags it proposes. Unknown or ambiguous
state refuses before viewport mutation. Do not invent a generic `isEditing`
flag or assume a quiescent screenshot establishes idleness.

## Bounds, cache freshness and fit prediction

`fitView` at `sch.js@2122376` reads `shapeManager.bbox`. That getter at `4494661`
reads the R-tree aggregate; it does not recompute every model's geometry. The
aggregate getter at `4167116` catches an invalid bounding box and substitutes a
zero box. Thus a returned zero box is not by itself evidence of an empty scene.

The bbox monitor at `4147372` separately queues model/type changes and a
microtask. It can update cached bounds after an action or later when the action
runner is idle. Proposed admission requires its pending model/type collections,
pending bbox-event map and next-tick promise to be drained on two observations.
Do not call its `update` method or clear its queues from the viewport adapter.

Independently validate complete R-tree cached membership and finite ordered
per-entry bounds, then recompute the aggregate. Bind the same R-tree owner and
ID-to-model ownership to complete source/model membership. Empty aggregate
handling needs an explicitly empty index, not the getter's fallback. In
particular, drawing frames, inherited children, invisible objects and temporary
preview models must have deliberate inclusion rules. The aggregate is a render
index, not an electrical-component enumeration. Do not substitute a component
bounding box or filter unknown entries silently.

For an ordinary nonempty schematic page, native fit expands aggregate bounds by
2 drawing units per side. After that padding, any still-zero axis receives a
100-unit extent centered at zero for that axis. An explicitly empty index uses
the native zero aggregate before this fallback. Symbol-only 50-pixel reserved padding is outside
the proposed scope. `scrollRectIntoViewCenter` at `2121229` fits that rectangle
to viewport width/height, centers it and clamps scale. Native zoom limits are
5 percent and 100000 percent; `gZoom` is percent divided by 100. These limits
are implementation facts, not safe input limits for the adapter.

Require finite positive viewport dimensions and scale, consistent
`viewBox.width = viewport.width / gZoom` and corresponding height before
dispatch. Predict final center and scale from the validated fit rectangle.
Reject coordinates/extents beyond a separately documented numerical bound.
Require predicted final bounds to contain the entire fit rectangle. A huge
scene clamped at minimum zoom can otherwise return bounds that do not fit all
content. Test nearly zero spans, overflow and zoom-limit cases before choosing
that product bound. Do not silently round, normalize sign or invent units.

Native canvas Y increases downward. SDK schematic bounds reverse Y, so
`top > bottom` for a positive-height viewport. A 100-unit schematic extent
represents one inch, independent of the UI's current display unit. Record both
the raw native rectangle and the projected SDK-style bounds. Use an explicit,
scale-derived floating-point tolerance only for computed geometry; preserve
exact source fields, identities and selection ordering.

## Selection must be observed without changing it

The page selection getter at `sch.js@4138581` applies filters and drops IDs
which do not resolve. `getAll` at `4135364` also coalesces table selections.
The public modern selected-ID method promotes selected wire segments to their
parent groups, as documented in the maintained
[selection adapter](../plugins/easyeda-pro-control/server/src/schematic-selection-read.ts).
None alone proves unchanged physical selection.

The project selection manager's `getTarget` at `4382358` returns ordered IDs
from its tab sets without loading a document. Retain that manager and its
backing selection sets, exact ordered IDs, filters, staged selections, and
resolved model identities/parents. Check the complete disposable-project
selection map before and after, not only the active page's filtered list.
Never invoke `getAllModel`, whose following implementation can initialize
documents. Include drawing-frame descendants, physical LINE selections, table
cells and parent groups in tests. Missing or aliased selected IDs must refuse.

Fit-all itself does not call the traced selection mutators. View changes can
update control-dot and cursor overlays through subscribers at `4465417`,
`5416876` and `5480910`. Therefore distinguish selection preservation from pixel
equality of overlays. Do not clear selection for a cleaner image and then claim
it was preserved. Preserve the original highlight and selection state in the
PNG, or make overlay removal a separate, independently specified operation.

## Deferred completion and image ownership

The zoom setter at `sch.js@2120182` changes view-box fields and dispatches a
zoom event. The `PW` batcher at `2118756` delivers field notifications in a
microtask. The renderer watcher at `4580925` records `setViewBoxFn`; it does
not immediately render pixels. The scene-graph renderer at `4535153` drains
that callback, applies the Y-mirrored rectangle to its camera and processes
modified render objects. Camera fitting is at `3849690`.

The canvas renderer plugin at `2093059` registers rendering on the canvas
ticker. The ticker at `2090220` runs through requestAnimationFrame, can stop or
be interrupted, and advances `lastTime` only when its update path runs. The
canvas wires consistency-update start/end to ticker interruption at `5633601`.
Two arbitrary animation frames in another window do not establish that this
retained canvas's ticker or renderer ran.

Proposed completion contract:

1. Retain an intent before the one synchronous fit dispatch. Capture immediate
   post-fit native bounds and expected target geometry. Never repeat fit after
   an exception, transport timeout, context drift or uncertain acknowledgment.
2. Observe the exact owning window and canvas ticker under a bounded deadline.
   Require a started, noninterrupted ticker and advancing retained `lastTime`.
   Recheck all owners, interaction gates, viewport dimensions, source and
   selection after each await. A deadline expiration is failure, not success.
3. Require the retained scene graph's pending viewport/view-box callbacks to be
   null and modified-object set empty. Its retained camera target, scale and
   bounds must agree with the predicted mirrored view box. Require two stable
   coherent samples separated by observed ticker advancement. Do not call
   camera getters that update matrices merely to manufacture that evidence.
4. Capture the retained renderer root with its original `toBlob` function and
   strict PNG limits, bracketed by those same checks. The native public image
   route at `sch.js@6098454` awaits a fresh document lookup before calling its
   current renderer's `toBlob`; that is not retained-receiver capture. Reusing
   the public capture route requires explicit final identity reproof and a
   weaker, honestly labelled binding, or a reviewed retained-root equivalent.
5. Archive before/after bounds, scale, owner commitments, ticker/renderer
   observations, selection/source commitments, PNG dimensions and receipt.
   Independently verify the complete saved project remains unchanged. No Save,
   activation, compiler call or persistence flush belongs in this workflow.

A renderer `needRender=false` flag is not enough. The Canvas2D scene clears it
before rendering at `3103110`, and other rendering work can be deferred.
The proposed observations plus captured pixels provide scoped evidence, not a
universal GPU-completion or continuous-isolation guarantee. Disposable visual
acceptance must independently verify that all expected content is framed.

## Integration with the current capture workflow

The current facade's strict capture union and handler are in
[index.ts](../plugins/easyeda-pro-control/server/src/index.ts), lines 174 and
2327 onward, SHA-256
`1a6d9a0ee95ee6649abf0d1457678ce6bed63056713f01b05acc20abf7474ecb`.
It validates exact context/tab, runtime fingerprints before/after, PNG payloads,
16 MiB compressed and 64 MiB decoded image limits, managed evidence and failure
retention. Existing region/full-page capture changes the viewport and is
truthfully marked non-idempotent and not read-only.

Add a facade-owned literal request such as `action: "schematic.fit-all"`, with
no caller JavaScript, method path, inferred current tab, coordinates, callback,
timeout override or private-property selector. Keep old request shapes intact.
Run its native ownership/effect adapter through the existing serialized live
gate and authenticated execution machinery, not a new bridge owner or a raw
upstream tool name. Retain operation-specific dispatch intent and timeout state
before mutation. The design-transaction Save/reopen executor is the wrong
lifecycle for a viewport-only action.

Reuse the capture evidence reservation, PNG checks, final full fingerprint and
exact context checks, then add this action's selection/native-source and
saved-project invariance proof. Keep failure evidence after dispatch, including
whether viewport mutation occurred and whether pixels were accepted. A failed
PNG encode must not trigger fit again. Do not call region capture after fit,
because that performs a second viewport mutation.

The reviewed bridge's `src/canvas-operations.ts`, SHA-256
`bffcf93541f993055ff73d4e4a5bf1133cc2970bcd847184354a6c61f6bdc61a`,
uses two requestAnimationFrame callbacks with a 75-ms success fallback before
region capture. That is a bounded best-effort delay. It must not be reused as
the new action's completion proof. Its existing standalone capture uses the
public image method; it does not bind a retained renderer root.

Coverage should initially say `native-equivalent`, `schematic-only`,
`capture-workflow-only`, with separately recorded source/offline/disposable
evidence. Do not mark the generic SDK method or PCB, footprint, symbol, selected
fit, arbitrary zoom, viewport restoration or hidden/tab-inactive cases enabled.
The adjacent public `zoomTo` contract permits omitted position/scale, but the
pinned schematic implementation applies setters unconditionally, as established
in the earlier survey. It is not a safe restoration shortcut.
[Official zoom contract](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_editorcontrol.zoomto.html).

## Required tests and remaining implementation work

| Area | Required cases and acceptance |
| --- | --- |
| Owner/context | Replace each retained page/project/tab/container/canvas/scene/zoom/renderer/root/ticker/function reference, before dispatch and after each await. No dispatch on preflight failure; no accepted image on later drift. Include same UUID under another project and switch-away/back limits. |
| Interaction | Idle default tool; armed empty wire preview; partial wire; placement/paste; drag/pan/mouse held; text input visible/hidden/unfocused; stale textModel after completion; property/table editor; active action; missing service state. Never cancel, blur, focus or clear queues. |
| Selection | Empty; root object; inherited child; one physical wire segment; whole wire group; filtered IDs; table cells; multiple tabs in the disposable project; staged/invalid ID; order-only change. Exact raw selection remains unchanged. |
| Geometry | Truly empty index; frame-only page; ordinary parts/wires; hidden/extreme items; pending bbox work; malformed aggregate masked by native zero fallback; stale membership; zero-span axis; nonfinite values; tiny/huge spans; min/max clamp; viewport resize/zero size. Recompute the exact native result and require full containment. |
| Completion | Delayed microtask, stalled/stopped/interrupted ticker, retained ticker advances without graph drain, pending camera/view callbacks, delayed scene render, callback after deadline, disconnect, owner replacement during PNG encoding. No timer-based success or fit retry. |
| Evidence | Strict PNG signature/dimensions/limits, missing/null Blob, exactly one image, reservation failure, write failure, unchanged complete native source and full saved SQLite proof, final runtime drift. Original dispatch acknowledgment survives later failure. |
| Boundary | Wrong document type, hidden/inactive tab, split-screen ambiguity, malformed caller keys, generic method path/code/callback rejection, unsupported renderer, no arbitrary restore. Existing capture behavior and no-extra-navigation assertions remain intact. |
| Disposable live | At least empty, frame-only, nonempty and selected-object cases; one fit per case, exact source/selection/saved-state invariance, before/after visual framing and measured completion stages. Interrupted interaction must refuse without changing the tool. |

Before enabling anything, finish the exact R-tree membership/freshness verifier,
the exhaustive ordinary-page interaction predicate, DOM/frame/root identity
proof and renderer-completion tests. Inspect every newly used getter for hidden
work. Run tests against producer-faithful fixtures and the pinned method bodies,
not synthetic objects that assume away deferred rendering or selection filters.
Then build, publish, install and independently admit a fresh runtime before
disposable live validation. This document contains no such execution evidence.

## Focused feasibility: complete membership and bounded fit math

This follow-up is source-only. It narrows the smallest testable geometry
profile, specifies an exhaustive index check for that profile and records a
private synthetic math experiment. It does not implement that index check or
establish live rendering, interaction, persistence or owner safety.

### Smallest independently calculable geometry profile

Use one ordinary, nonempty, flat page with 1–1024 root `Rect` models. Require
zero rotation and corner radii; explicit positive stroke width; no mask,
selection, highlight, overlay, frame, text, symbol, net, wire or child models.
Every rectangle must be visible and connected directly to the same retained
root. A source projection must account for the complete page, not merely find
these admitted objects among unexamined content.

The native root excludes itself from the R-tree (`sch.js@3921802`). The base
model's membership predicate at `1927473` depends on its visibility/connection
check at `1927164`. Rect geometry at `4292850`–`4292919` uses axis-aligned
endpoint min/max bounds expanded by half the displayed stroke width. Explicit
positive width avoids the theme/default fallback at `4288539`; ordinary root
ownership and no mask exclude the special component style at `4463357`.
The rectangle's stored-data mapping at `4286000` provides a concrete next
source-projection target, but this research has not validated that projection.

Do not broaden this to native standalone `Line` by analogy. The class at
`4257466` has empty upload, deletion and consistency-data methods. A rendered
line therefore does not establish one independent persisted page record.
Wire/group source correlation needs its own reviewed mapping.

### Exhaustive R-tree proof plan for that profile

The R-tree wrapper at `4166147` owns `_idBBoxMap`, `_oldIdBBoxMap` and `_rbush`.
Its `load`/`insert` methods construct one leaf with retained model identity,
min/max fields and a cached `bbox`. `getBBox` at `4167116` reads the aggregate;
it does not refresh it. The bundled RBush `toJSON` implementation at `350549`
returns its existing `data` object without a copy or refresh. A bounded,
read-only structural traversal can therefore inspect the actual retained tree.

The proposed acceptance check must complete every step:

1. Traverse the complete retained root/children graph with explicit node and
   depth limits, no cycles or repeated identities. Verify reciprocal parents,
   unique IDs, the exact ID registry and complete root-family model map. Refuse
   unknown, disconnected, temporary, inherited or unaccounted models. Do not
   call a traversal/getter that initializes documents or updates bounds.
2. Prove every nonroot model is precisely an admitted rectangle. Compute its
   independent bounds from the retained raw coordinates and explicit stroke;
   require exact agreement with the complete native-source projection. Treat
   visibility and connection as literal values, not a freshly executed getter
   whose implementation might depend on text, selection or theme state.
3. Require `_idBBoxMap` to contain exactly those IDs, each once, with identical
   model references and all cached min/max and `bbox` coordinates matching the
   independent calculation. No size-only or aggregate-only equivalence.
4. Traverse the retained RBush root recursively. Enforce finite bounds,
   consistent height/leaf structure, no cycles/shared nodes, exact leaf identity
   with the map entries, no duplicate/extra/missing leaves and every internal
   node's bounds equal to the union of all its children. The root must equal
   the independently calculated union of every admitted rectangle.
5. At bbox monitor `4147372`, require all three queued model/type maps or sets
   empty, `_nextTickPromise` absent, ordinary `_addCore` dispatch restored and
   `_oldIdBBoxMap` empty. Inspect the native absent-value representation rather
   than coercing unknown state to idle. Never flush, update or clear these
   structures to satisfy the check; the model `bbox` getter at `1927911` can
   perform deferred work and is unsuitable as a passive freshness witness.
6. Obtain two coherent observations before dispatch and repeat the complete
   proof after each awaited boundary. Retain/recheck every owner, map, tree,
   model and relevant function identity, raw geometry, source, selection and
   interaction state. Any change fails the operation. These samples detect
   drift; they do not prove continuous isolation or make asynchronous activity
   atomic. The separate idle and renderer gates above remain mandatory.

This is an implementable exhaustive algorithm for the stated subset, not an
implemented verifier or proof for arbitrary schematics. Text has font/cache and
visibility dependencies (`3863755`), annotations have display/selection rules
(`2073563`), and frames/components add nested geometry. Ignoring those models
would turn fit-all into fit-some and is not an acceptable shortcut.

### Numerical contract and isolated native-body checks

The private experiment limits each coordinate to absolute value at most
1,000,000 on a 1/1024-unit grid, explicit stroke to 1/1024–1024 on that grid,
and both nonzero rectangle spans. CSS viewport dimensions are integers
64–8192. Initial scale is 0.05–1000 and initial center is bounded to the same
coordinate range. These are proposed adapter limits, not SDK guarantees.

Expand each min/max rectangle bound by half its stroke, union all rectangles,
then add the native ordinary-page margin of two units on every side. For
resulting width `w`, height `h`, viewport `W,H` and center `cx,cy`:

```text
rawScale = min(W/w, H/h)
reject rawScale < 0.05       # native minimum zoom would clip the requested fit
scale = min(1000, rawScale)
view = { x: cx-W/(2*scale), y: cy-H/(2*scale),
         width: W/scale, height: H/scale }
SDK = { left: view.x, right: view.x+view.width,
        top: -view.y, bottom: -(view.y+view.height) }
```

Three bounded method bodies from the hashed schematic file were executed in
an isolated VM against synthetic scene objects: `set` at `2120182` (419 code
units), `scrollRectIntoViewCenter` at `2121229` (674) and `fitView` at `2122376`
(425). No application imports, app globals, projects, profiles, network,
timers or live APIs were used. This tests numerical parity only; synthetic
view-box setters cannot establish actual renderer or event behavior.

Two earlier checks failed and were retained, not overwritten. The first
underestimated cancellation from the old viewport origin; the second omitted
amplification by the old/new scale ratio. The native path forms a small
centering displacement by subtracting large coordinates, then multiplies by
that ratio. The final comparison uses
`64 * Number.EPSILON * M * max(1, oldScale/newScale)`, where `M` is the largest
absolute before/predicted view-box coordinate or dimension, at least one. It
also refuses any tolerance above 1/64 CSS pixel after multiplication by the
new scale. The factor is a conservative tested comparison budget, not a
formal all-input floating-point error theorem. Containment and scale are
checked separately; a deliberate 0.01-unit drift in the ordinary fixture fails.

The final run passed 10,052 accepted cases, including 25 equal-scale cases,
10,000 deterministically seeded two-rectangle cases, reversed endpoints,
large stroke/coordinate cases and both clamp edges. It also passed 44 refusal
checks for malformed/nonfinite/off-grid/out-of-range/degenerate input, minimum
zoom clipping and deliberate drift. The script SHA-256 is
`6ec3d8a5b9b10c256ae37462026c296fd181a96d3ce63631a2ee35e56e082d53`;
the retained result is
`a0d7b5440e032b9fe5c3816d37e6929397ff5550087838069272fb2d60cae906`.
These private artifacts are research evidence, not packaged tests or a coverage
promotion. No R-tree membership verifier was executed by this experiment.

### Release decision

Do not ship a rectangle-only endpoint merely to increase method coverage.
Its excluded frame/text/symbol/wire content is what makes real schematics
useful, and existing native viewport controls already handle trivial fixtures.
Retain the omission until an ordinary framed fixture has complete source-bound
geometry, interaction and renderer evidence. The bounded pure fit helper is
worth reusing then, after moving it into maintained tests with the actual
adapter contract. No package source, compatibility pin, build, cache or live
state was changed by this feasibility work.
