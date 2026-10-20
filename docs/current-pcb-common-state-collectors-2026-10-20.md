# Current PCB common-state collectors

This batch adds four dormant fixed readers. They do not register a tool, expand
the diagnostic or precreate owner budgets, call EasyEDA, or authorize a writer.
Their output is raw model evidence. It is not serialized PCB source and has not
been compared with a live complete closed-SQL baseline.

## Inspected source

The installed PCB asset was read as inert text and hashed again on 2026-10-20.
No vendor code was evaluated for this inspection.

- Asset: `pro-pcb/3.2.193.682ed44e/js/pcb.js`.
- Bytes: 10,976,299.
- SHA-256: `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33`.

The offsets below are JavaScript string positions in those exact bytes, not
runtime-source admission or evidence about an already running application.

| Section | Source anchors | Captured backing state |
| --- | --- | --- |
| CANVAS | `AF` 4408674, `qT` 3215164 | Origin object, unit, alternate-grid parameters, grid/multiple types and ratio, highlight value |
| Grid inputs | `VY` 3207349, grid getters 3211481 and 3212185, `ogt` 1772021 | Four owner scalars and four attached-grid parameter scalars, separately |
| LAYER and stack | `r4` 3185532, `WA` 3174691, `HA` 3173255 | Complete layer-manager own-data graph, layer insertion order, physical-stack insertion order and raw zIndex, active layer, color/status objects, help layers |
| PRIMITIVE filters | `X6` 4804050, `Ll` 4803827, getter selection 4410800 | Complete initialized filter-manager graph, including filter slots not emitted by the old exporter |
| SILK_OPTS | `wF` 4431790, backing getters 10168636 | Four raw top/bottom board/silkscreen color strings |
| PANELIZE | `ai` 4755634, `_param` 4756101 | Entire own-data parameter graph, requiring both `on` and `success` false |
| RULE and selectors | `xo` 3477145, add families 3482569, `saveCommonData` 5840102 | Complete raw rule manager, including all fourteen family maps, nested tables, template, defaults and caches |
| PREFERENCE | `D5` 5276590, `vfe` 9172194, `Yme` 10162257, `pl` 7347556 | Every selected getter's raw backing inputs, including absent layer-stack preference and null previous track width |
| FONT holders | `G4` 3977392, `V4` 3974027, `yie` 3979349, `gie` 3979101 | Empty template/base maps, UUID cache, unresolved-text Set and footprint references |
| BLOB holders | `GSe` 4244022, `id` 4244135, `PF` 4244146 | Empty current image-template map and absent/null/undefined retained last reference |

The source-derived property aliases are fixed in the program. No caller chooses
classes, properties, roots, arbitrary code or remote handles. Class matching uses
the original lexical class reference and its prototype, not a spoofable name.
The existing original Save-handler scope and callback qualification remains a
separate required transport step. The handler is inspected, never invoked.

## What the graph retains

`current-pcb-common-graph.ts` encodes a graph of own data fields, dense arrays,
native Maps and native Sets. String and number tags preserve undefined, null,
signed zero, exact finite numbers and well-formed Unicode. Object references
preserve aliasing and cycles. Map/Set and object-field order remain observable.
Own accessors, functions, symbols, sparse arrays, unknown class prototypes,
non-finite numbers and oversized values refuse. Unknown inert fields on admitted
model classes remain in the result rather than being dropped.

The limits are 4,096 nodes, 4,096 entries in any collection, 32 levels while
walking a new object, 32,768 field/collection charges and 4,096 UTF-16 units per
string and 131,072 aggregate field/value string units. Programs and host decoders
both cap final UTF-8 at 524,288 bytes. The 270-layer synthetic roster produces
189,585 bytes and passes without dropping disabled custom layers. The decoder rejects duplicate JSON
keys, malformed Unicode, missing references, unreachable nodes, duplicate object
or collection keys, and impossible native Map/Set negative-zero keys.

The reader rechecks retained own values/descriptors, prototype/own-key rosters and
ordered Map/Set members before returning. This is one synchronous sample. It is
not continuous observation or a transaction across the four readers. Map/Set
access uses selected intrinsics, not model methods or overridden iterators.
Original native intrinsics and absence of Proxy traps still require the retained
effect-checked transport. Descriptor inspection alone does not prove them.

Exact pick-field rosters are shared by program generation and host checks. The
host requires all canvas, grid, color and preference fields, initialized filter
and layer maps, selected layer scalars, and the complete rule-family roster.
Those checks validate evidence shape. They do not decide that rule contents are
electrically suitable or that a supplied graph came from EasyEDA.

## Empty-only exclusions

The rule collector requires empty NET, NET_CLASS, differential selector, region
selector, equal-length group, pad-pair group and cached-net maps. It also requires
empty active and cached between-net selector arrays. This proves no supported
current EQLEN group/detail participant in the supplied sample; it does not erase
stored EQLEN rows or prove that native loading completed. Existing default-rule
maps are recorded even when empty. No default is created or repaired.

The assets collector permits a source-defined null template/base singleton and
distinguishes it from an initialized empty singleton. It never calls
`getInstance`, font lookup, glyph conversion, image loading, font serialization
or `toJSON`. It rejects a retained old template and all current nonempty caches.
The separate scene census must still prove no model or inherited reference to
unsupported fonts/images/components.

An empty image-template map does not prove that no image is loading. `PF` creates
`Image` objects and keeps completion promises in a local array; its handlers add
templates later. The existing raw holder checks do not cover those in-flight
requests. Stored FONT/BLOB histories and every peer SQL row also remain part of
the required complete durable baseline.

## Additional FileSource side effect

The prior source audit established the `D5` radius-rule fallback and differential
selector repair path. This inspection found another independent write in that
same preference traversal. At 10164716, `Yme.prevTrackWidth` assigns
`_prevTrackWidth = 1` whenever its backing field is null before returning it.
`D5` reads that getter at 5276590. Therefore even a document with already valid
rules can incur this state change when its previous-width field is uninitialized.

The new preference reader captures the raw null. It does not call the getter or
pretend that null was already one. The raw via zero values are likewise retained;
the `||` radius-rule fallback is not executed. Native `getTrackMinCorner` parses
the stored option, while the collector preserves the raw option. Host encoding
and the complete stored/native relation remain separate work.

## Verification and remaining integration

Fourteen focused tests pass under Node 24.18.0 with the isolated test preload
and core limit zero. They cover lossless raw values and aliases, all empty
selector refusals, malformed replies and missing fields, Unicode and collection
ambiguity, initialized versus null assets, getters and unknown prototypes.
All three common readers also pass actual Node/V8 `throwOnSideEffect:true` over
synthetic class/scope fixtures and refuse mutating Proxy traps without executing
them. That test caught an initially forbidden `Object.defineProperty` call in the
new-object projection builder; direct assignment into the new null-prototype
object fixed it. No EasyEDA connection was involved. Targeted pedantic type-aware
lint has zero warnings.

No SDK method coverage changes. The complete writer still needs original-owner
integration and live admission, complete closed-SQL/raw-history and asset joins,
the source-owned latent move and worker producer checks, publisher/subscriber
qualification, and the one-create/one-Save/close/reopen/visual lifecycle. The raw
graph is not an encoding model and must not be described as an already complete
live or stored baseline. Every decoder leaves Save and execution authority false.
