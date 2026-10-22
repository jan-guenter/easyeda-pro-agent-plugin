# Raw PCB String observation

## Implemented scope

The new `current-pcb-diagnostic-raw-strings.ts` leaf inspects the pinned renderer's
raw text manager. It includes models that have no view watcher, which the current
public String enumeration cannot represent. It returns raw identity, partition,
group, parent-absence, z-index, display/base state, position, color channels and
selected box corners. It does not call a model getter, serializer or vendor method.

The supported map contains at most 16 ordinary, parentless `rd` models with empty
keys. Attributes, child text, other prototypes, non-null parents and text longer
than 1,024 UTF-16 code units refuse the complete sample. Unknown or oversized
content is not filtered or truncated into a successful result. This narrow
subset is useful for the initial one-String fixture; it is not a general text
inventory or an empty-PCB check.

The leaf initially has no standalone MCP entry point or caller-selectable
execution facility. Integration uses the original diagnostic owner's retained
Save-handler scope and callback handle. This is one explicitly sampled,
non-atomic diagnostic, not a stable writer baseline. Target identity must
match the retained PCB document. A caller-supplied scope-shaped object or decoded
JSON does not establish original scope, receiver or source ownership.

The official `PCB_PrimitiveString.getAll()` contract returns the public String
list. It does not document raw compiler-model identity or the implementation's
view-watcher filtering. This adapter is a separate native observation, not an
extension of that public promise.
[EasyEDA String getAll reference](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivestring.getall.html)

## Source review

Only installed application code was read. No design or production record was
opened. The source was read as inert text, not imported or evaluated:

`C:\Program Files\easyeda-pro\resources\app\assets\pro-pcb\3.2.193.682ed44e\js\pcb.js`

- Complete bytes: `10,976,299`.
- Complete SHA-256:
  `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33`.
- Positions below are zero-based UTF-16 offsets in the decoded source.

| Source position | Observation |
| --- | --- |
| `3172844` | Base manager `Ni` stores its original models in a native `Map`. |
| `3423933` | `n3` owns `_dataState`. |
| `3424326` | `nP` reads `_globalIndex`, `_parent`, `_partition`, `_groupID`, `_number` and `_zIndex`. Its public getters normalize several of these fields. |
| `3959524` | Text base `ki` sets the separate string `modelType` to `Text`. |
| `3961360` | `rE`, aliased as `Ls`, stores raw layer, lock and four corner fields. Its geometry getters and box-update methods are not needed by this leaf. |
| `3967919` | `U8` owns numeric `type`, display flags, font, stroke, mirror, origin, reverse, expansion, position-null, color and reference-count fields. |
| `3968202` | `ib` adds `_layerId` and `_locked` for empty-space text state. |
| `3980353` | Ordinary `rd` owns `_globalIndex`, `_position`, `_rotation`, `_key`, `_value`, `base`, optional `_box` and `_matrixChange`. Several public getters delegate to the base or lazily update the box. |
| `3988808` | `U4`, aliased as `bo`, indexes both ordinary text and attribute subclasses by global index. |
| `7376318` | `yr` assigns its model, performs font work and installs itself as that model's state watcher. The observer never constructs a view. |
| `7946809` | View manager `iu.getAllItem()` skips raw models with no `stateWatcher`. Therefore an empty view list does not prove an empty raw map. |
| `7959342` | `t7` retains the original `bo` manager in `mgr`; the renderer's `Jr` is its existing instance. |
| `10792778` | Renderer initialization retains `Jr` alongside other managers in the outer closure. |

The source's `_zIndex || -1` getter maps raw zero to minus one. Its partition and
group getters similarly normalize empty or absent fields. The leaf does not use
those getters. A field is represented as `absent`, `undefined`, `null`, or
`value`, with the last form retaining its exact admitted scalar. Zero remains
zero. Negative zero, non-finite numbers and non-well-formed strings refuse rather
than being silently changed by JSON serialization.

Color is observed as raw `r/g/b/alpha` fields on the admitted original color
prototype. No `toString()` conversion or CSS validity claim is made. Null,
undefined and absent color remain distinct.

The original raw map and the view manager must refer to the same manager.
Every map key must equal that model's raw global index. Model identities must
be unique. A present view watcher must have the admitted `yr` prototype and
point back to the same model. Missing or null watchers remain visible in the
result. At the end, the leaf rechecks the manager/map/environment references,
map size, each original map entry, and retained base/position references.
These are bounded synchronous checks, not a continuous observation guarantee.

## Fixed call and bounds

The generated function is `CURRENT_PCB_DIAGNOSTIC_RAW_STRINGS_FUNCTION`.
Its sole argument is the original internally retained callback remote handle.
It reselects the current fixed `pcb/saveCompiler` subscription and requires
that callback to match before inspecting any raw String model.

The required `Runtime.callFunctionOn` options are:

- `returnByValue:true`, `throwOnSideEffect:true`, `silent:true`.
- `awaitPromise:false`, `generatePreview:false`, `userGesture:false`.
- The original handler-scope remote object, never a caller object selector.

`Runtime.callFunctionOn` does not define a timeout parameter. The existing
original transport deadline still applies. Its side-effect check is an added
execution restriction, not qualification of application intrinsics or arbitrary
proxy behavior.
[CDP Runtime protocol](https://chromedevtools.github.io/devtools-protocol/tot/Runtime/#method-callFunctionOn)

The existing non-pausing handler-scope discovery remains a separate prerequisite.
V8's function-scope test documents inspection of original function scopes without
needing a paused call frame. No part of this raw reader invokes the Save handler.
[V8 function-scope test](https://github.com/v8/v8/blob/14.6.172/test/inspector/runtime/function-scopes.js)

The generated function is 8,313 UTF-8 bytes, SHA-256
`bd31d235e95935bebeff4400cb08219cc2419b7bd25cead9ead2aa459299a8f4`.
Each serialized result is bounded to 65,536 UTF-8 bytes before return. The leaf
calculates the actual encoded length, so escaped controls or multi-byte text
cannot defeat the bound. The strict facade decoder applies the same bound,
duplicate-key rejection, exact field schemas, model-count agreement and
duplicate-ID checks. It rejects exception-bearing or remote-object replies.

## Evidence and remaining work

Focused tests use self-authored layouts, not executed vendor code. They cover
watcherless membership, raw zero/absent/null distinctions, reciprocal watcher
ownership, hidden-space base state, unsupported parents/prototypes, inherited
raw-field shadowing, accessor refusal, malformed replies and aggregate bounds.
A real in-process Node inspector test runs the fixed leaf with side-effect
checking enabled. A state-changing proxy trap refuses without incrementing its
counter. There is no debug TCP listener, native helper, live EasyEDA call,
navigation, edit or Save in these tests.

The leaf deliberately omits outline paths, full bounding-box state, source
records, component child membership, other model families, font caches, pending
producers and persistence. A String map can be complete within this admitted
subset while the PCB contains other objects. Source ownership, complete model
membership, complete geometry, empty-root PCB, queue completion, saved state
and writer authority therefore remain false in every decoded result.

Still needed are original live transport qualification, source-model membership
correlation, complete raw-family and pending-producer observations, and a
one-shot String writer with complete closed/reopened database and document
proof. This leaf grants none of those by itself.
