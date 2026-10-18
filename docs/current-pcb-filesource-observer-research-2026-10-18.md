# Current PCB FileSource observer research

## Decision

Keep `FileSource` execution disabled. `FileSource({})` is not generally read-only:
its preference getter can repair shared rules and call the live compiler to delete
an incomplete differential-pair selector. Skipping its explicit Save branch is
necessary but insufficient. This finding does not change the offline STRING model
or admit any writer.

This was a source-only investigation, including an independent background review
of common encoders and STRING getters. No vendor code was executed. No MCP call,
application launch, project/fixture/journal read, test or build was performed.
There is no connected validation or persistence result in this note.

## Exact primary sources

The following installed files were read as text and independently hashed. Offsets
throughout this note are zero-based JavaScript string positions, not byte offsets
or line numbers. `PCB`, `UI` and `API` refer to these exact files.

| Source | Bytes | SHA-256 |
| --- | ---: | --- |
| [PCB 3.2.193.682ed44e](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-pcb/3.2.193.682ed44e/js/pcb.js>) | 10,976,299 | `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33` |
| [UI 3.2.196.26ed3d6c](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-ui/3.2.196.26ed3d6c/js/ui.js>) | 17,456,671 | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |
| [API 0.3.50.ab46409c](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-api/0.3.50.ab46409c/api.js>) | 1,964,920 | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |

These hashes establish the inspected implementation, not the identity of a running
process or permission to use it. No old runtime profile is substituted.

## Entry point and the fresh encoder

PCB 10798462 registers this handler:

```js
"FileSource",async o=>{var r;o&&o.useCompilerSave&&(await((r=x.getInstance().compiler)==null?void 0:r.save()),await FP.getInstance().saveCopper());let t=x.getInstance();return new ld("2.0",t.doctype).save()}
```

A facade-owned empty plain object skips the two explicit save calls. Caller objects,
inherited `useCompilerSave`, nonempty arguments and any flush variant must remain
outside a future observer contract. On the empty branch, there is no `await` in
the selected handler before the synchronous serializer call. That does not remove
asynchronous dispatch or hidden getter effects.

`ld` at PCB 5838556 inherits `yD` at 4764017. No compiler argument is passed:

```js
this.compiler=r;
// Other constructor initialization omitted here.
this.compiler==null&&(this.encoder=new r8(x.getInstance().id))
```

`upload2Compiler` at 4773784 returns immediately when that serializer's compiler is
null. `uploadSource` at 4771276 instead fills its new encoder. `r8` at 3156047 uses
document type `PCB`; `X9t` at 3148433 creates a fresh `JCt`, and does not install a
flow writer or live compiler callback. `JCt` at 2780314 owns new maps/collections;
its inherited callback array is initially empty. Its own uploads are local
serialization, not live project uploads. This distinction does not cover callbacks
made by shared rule/model getters.

## The indirect live-write path

`ld.save` at PCB 5843210 calls `saveCommonData()` before
`this.feed("PREFERENCE",D5())`. `D5` at 5276590 starts with an unconditional call:

```js
let o=te.getInstance().getRadiusPhysicsByNet("")
```

The lookup follows `getRadiusPhysicsByNet` at 3504568, `getRadiusPhysics` at
3487474 and `getRule` at 3499937. The empty-map fallback is explicit:

```js
getRule(e,r){return!r||r=="default"?(e.size==0&&this.correctDefault(),this.getDefault(e)):e.get(r)}
```

`correctDefault` at 3478252 creates missing rule-family entries, changes
`isDefault` flags, creates a default autorouter, then removes differential pairs
whose positive or negative net cannot be resolved:

```js
let P=xo.getInstance().getAllNetDifferentials(),I=new Array;
for(let T of P)(T.negativeNet==null||T.positiveNet==null)&&I.push(T.name);
xo.getInstance().deleteNetDifferential(I)
```

`deleteNetDifferential` at 3496357 reaches the live compiler, independently of the
fresh serializer's null compiler:

```js
deleteNetDifferential(e){e.forEach(r=>{let i=this.netDifferentials.get(r);i!=null&&(i.getAllNets().forEach(s=>s.differentialPhysics="default"),i.remove(),this.netDifferentials.delete(r)),x.getInstance().compiler.deleteRuleSelector(["DIFF_PAIR",i.name])})}
```

The compiler's `deleteRuleSelector` at 3159603 calls `localChange` with an empty
`RULE_SELECTOR` body. This proves a reachable mutation entry point; it does not
prove that an actual deletion ran or persisted in any project. Even without an
incomplete pair, `correctDefault` changes shared rule state. Its safe-spacing
lookup can also populate `defaultRuleMap`, through `getDefault` at 3499722.

The ordering matters: common NET/RULE/RULE_SELECTOR records have already been
encoded before this repair. The returned export can therefore describe pre-repair
common state while the application has moved to post-repair state. A successful
return, or equality of a few STRING rows, cannot prove a nonmutating observation.

## Complete selected save traversal

The traversal below is taken from `ld.save` at PCB 5843210 and its overridden
`saveCommonData` at 5840102. All branches are inventoried; only the
ordinary common sections and standalone STRING field path received the bounded
getter audit described below. Other present geometry is not silently admitted.

| Order | Selected work | Consequence or boundary |
| --- | --- | --- |
| 1 | `yn("pcbDataStrEncode-time")` | Debug timing can change top-window properties. |
| 2 | CANVAS; LAYER; LAYER_PHYS; ACTIVE_LAYER | CUSTOM layers require `config`; others are emitted. |
| 3 | NET; RULE_TEMPLATE; every available rule family | Existing rule arrays/Sets are enumerated. |
| 4 | EQLEN_GRP; flattened EQLEN details; RULE_SELECTOR collections | Detailed EQLEN bodies are computed but not forwarded by `uploadSource`. |
| 5 | Fixed PRIMITIVE filter names; top/bottom SILK_OPTS | Reads presentation/filter settings, not only geometry. |
| 6 | `D5()` then PREFERENCE | Contains the live-write fallback above. |
| 7 | PANELIZE and `Mp` groups, unless document type is 4 | Ordinary PCB type 3 enters this branch, even when panelization is off. |
| 8 | `nb.getInstance().getAllItem()` then FONT feeds | Reads existing font templates; FONT bodies are not forwarded by `uploadSource`. |
| 9 | `Dn`, `Jn`, `vn` items | Additional geometry families, outside STRING-only admission. |
| 10 | `Xi`, `nn`, `Fi` items | Partitions are filtered; `nn` also filters Annotation. |
| 11 | `zo` inner fills | Grouped by layer and forwarded as layer-fill output. |
| 12 | `oa`, `c0`, `bo`, `Aa`, `ol`, `_a` items | Includes text models in `bo`, plus other present families. |
| 13 | `Ms` components via `feedComponent2` | COMPONENT, selected ATTR and PAD_NET records, not complete inherited drawings. |
| 14 | `Yo` poured copper grouped by parent | Further shape getters; not a request to rebuild copper. |
| 15 | Optional `_s.board.model` as BOARD | Polygon model can update its cached geometry. |
| 16 | `Wi` and `getFile()` | Timing writes, then new-encoder compression. |

The exact manager aliases appear at PCB 4165168, 4170309, 4078295, 3951528,
4097577, 4110934, 4131873, 4149466, 4237725, 3989296, 4204154, 4214633,
4210218, 4329186 and 4143334 respectively. `feedItems` at 5845706 unwraps `qs`
views to `.model` and requires `getParent()==null` before selecting a file type.
Neither an empty String `getAll` result nor a source record's ID proves that the
other managers, inherited descendants or shared assets are absent.

### Common and STRING getter audit

| Section | PCB anchors | Selected effects found |
| --- | --- | --- |
| CANVAS | AF 4408674; qT 3217532–3222703; grid/snap getters 3211481, 3211653, 3212185, 3212357 | Backing scalar/grid-parameter reads. |
| LAYER | YR 4409481; WA 3174691; color formatter 1453688 | Status/color reads and local string formatting. |
| LAYER_PHYS | JR 4427166; HA 3173255; `getLayerPhys` 3186173 | Sorts a new `Array.from` result, not the backing map. |
| ACTIVE_LAYER | jR 4409952 | Scalar read; writes encoder-local `id`. |
| NET | _F 4410066; Qu 3432021–3432792; lookup 3500036; special color 7966491 | Scalar/map reads. `getNet` itself does not repair rules. |
| RULE_TEMPLATE | fD 4750361; getter 3509204 | Direct field read. |
| RULE | pD 4748080; helpers 4743399–4748080 | Selected helpers build result objects/maps/arrays from existing models. The separate D5 fallback still applies. |
| RULE_SELECTOR | XSe 4422527; KR 4424938; selector models sP/Sm/lP/rC | Builds output from scalar fields and selector lookups. |
| EQLEN_GRP/EQLEN | nD 4434000; oD 4434308; iC 3474851; fg 3474011 | Reads details and allocates output arrays, without sorting backing details. |
| PRIMITIVE | vF 4410596; `getPick` 9106060; `getVisible` 9107444 | Reads existing filter fields/defaults. |
| SILK_OPTS | wF 4431790; Q2 3168606; color getters 10168636–10168980 | Direct color-string reads. |
| STRING | O3 4418517; field list 4000773; rd 3980353; base nP 3424326; Ya 4006194 | Selected model identity/scalars/parent/group and color formatter, not lazy view geometry. |

`getInstance()` may initialize shared singletons if absent. Collection getters
allocate containers but retain shared model entries. The table is not a claim of
zero writes throughout an arbitrary document.

The STRING format selects its 19 encoded fields, excluding `path`, `width`,
`height` and `box`. Its ordinary model path therefore does not call the view's
`textWidth`/`textHeight` getters at 7378533/7378618, `updateCurrentBox` at 7380208,
or render/outline helpers at 7382556/7383642/7383851. Those view helpers can update
the model's text box and clear `textChange`. Preserve this distinction in future
adapters; substituting a convenient view getter would change the effect model.

PANELIZE uses `feedPanelize` at 4768233 to JSON-clone `_param` returned at 4756956.
DF/une/hne at 4431102/4430695/4430284 then read the clone and create output data.
This does not call panel geometry generation. The clone and native `parseInt`
can still lose unsupported values; an observer must not call that normalization
proof of valid panelization.

FONT enumeration is G4 at 3977392 through its existing-template
`getAllItem` at 3978064. `m_` at 4418117 reads template fields, including `outline`; `mie`
converts that through `uf` at 3881507. This is not a text/font rebuild request.
The helper serializes existing math paths, but arbitrary font-template/path
variants are not independently admitted by this note.

BOARD's XV at 5838463 calls `mf.getShapeInfo` at 4116789. For an `np` polygon,
`getMathGraphics` at 4107713 assigns `_pl` and `_needUpdateCache`. The effect is
on the existing model's geometry cache, even though no compiler upload appears
in that getter. Additional present geometry families require their own selected
getter review or an independent pre-dispatch proof that they are absent.

Debug timing is a separate shared effect: `yn`/`Wi` at 3915038/3915179 use `cP`,
the top window when accessible. When the captured debug/trace flag is enabled,
they set/delete the timing property, append to a timing-history array through
`Z3t` at 3914768 and log through `sf` at 3249836. A no-CAD-change contract must
not be described as zero application-state changes.

## Returned source is a canvas export, not stored history

The complete `uploadSource` switch at PCB 4771276–4773784 has no FONT or EQLEN
case. Their getter work above does not produce those records in this encoder.
No selected branch calls its `uploadBlob`; OBJ/IMAGE references do not supply
the associated binary assets. META, original edit history and unselected stored
records are not copied. CUSTOM-layer/partition/annotation filters and component
child handling create further omissions. Unknown native fields not selected by
the fixed format table cannot survive this export merely because our parser
retains unknown fields that are actually present.

The encoder registers PCB/FONT/BLOB document types, but registration alone adds
no data rows. `getForeachKeys` at 2785254 enumerates populated `wDocData` keys.
For the selected new-encoder path, FONT/BLOB registration is not evidence of
complete font/blob sections.

`sCe` at 2754327 creates a new random `unique` and `client`. `Wg` at 2753543 fills
a shared random-byte buffer. `localChange` at 2755522 assigns fresh
sequential tickets. `compress` at 2790465 derives updateTime/version from the
new header state or the current clock, then `xx` at 2753671 emits DOCHEAD. These
are export metadata, not retained stored actors, tickets or source provenance.

```js
getDataStr(o=!0){return this.encodeConsistency.compressFull({notDocHead:!o})}
```

`getDataStr` is at 3148920. `compressFull` at 2797996 collects records and returns
`t.join('|\n')`, with no terminal separator. With default options,
`getCompressKeys` at 2797443 preserves encoder map insertion order.
Raw double-sample source equality is therefore unsuitable: new headers vary
even when canvas state does not. A later comparison must retain both raw
observations and apply an explicit, separately reviewed export-header relation,
never strip their raw metadata or claim saved-source equivalence.

There is also an error/completeness caveat. `compressFull` invokes async
`compress` without awaiting its promise. The fresh in-memory path normally
uses synchronous callbacks through `getCacheData` at 2788975 and false yield
predicates, but an exception inside `compress` can reject that ignored promise
after a prefix has been collected. Framing alone cannot prove that every peer
record was exported. A timeout or return value cannot replace independent
complete-family/count and collateral checks.

## Receiver and active-frame hazards

API 1468432 implements `sys_FileManager.getDocumentSource` as an asynchronous
`extensionApi.SYS_FileManager.getDocumentSource` request with no explicit target.
UI 17336309 first reads the active tab's document type, then awaits
`$t()` and calls `FileSource` on the returned frame. `$t` at 15969604 captures
the then-active tab and awaits `getTabIFrame`; that method at 16437804 resolves
the DOM element. A previous caller-side active-tab check is not receiver ownership
across those hops, nor proof that the frame remains attached/unchanged.

The direct native service belongs to the selected PCB frame:
`MSG_BUS_PCB` is initialized at PCB 1016974; `A=ie` at 10792650 aliases it, and
the FileSource handler is registered on `A.messageBus`. The identity service at
10807394 returns that frame's `x.getInstance().tabId` and document type.
A future native-task-equivalent observer must capture the exact ordinary frame,
its contentWindow/document/messageBus/rpc receiver and prototype chain, and
reprove the project/branch/tab/frame/URL after every await. It must not use
active-frame redirection, `setTabActive`, public export dialogs or Save to make
the observation possible. Exact receiver binding alone does not cure the rule
repair path.

## Remaining prerequisites and next increment

1. Keep the method unavailable. Add no general FileSource or caller-selected
   private-topic route. Current source discovery and the offline STRING model
   confer no execution authority.
2. Design a fixed, descriptor-safe native preflight that proves already-loaded
   ordinary PCB ownership, initialized required managers and a nonempty valid
   radius-rule/default lookup without calling a repairing getter. Account for an
   empty-name net selecting a specific rule. The current String DTO cannot prove
   these facts. If the required state cannot be observed through a reviewed fixed
   path, that is a concrete blocker, not permission to skip the check. The proof
   must cover the interval through actual native dispatch; a stale preflight or
   an after-the-fact check cannot prevent a repairing getter from already running.
3. Inventory every populated manager before export. For an initial STRING-only
   disposable scope, refuse groups, inherited/attached text, unsupported fonts,
   geometry, board/cache states, partitions and assets unless their complete
   selected getter effects have been admitted. Absence from String `getAll` is
   not absence from the scene or proof of standalone ownership.
4. Define a current export model separate from durable source: preserve complete
   raw bytes, headers/order and unknown output fields; explicitly model omitted
   META/FONT/BLOB/EQLEN and filtered records. Bound record counts and expected
   output before dispatch where feasible, and enforce response/artifact byte
   limits. Do not hash normalized DTOs as if they were the original document.
5. If FileSource is still selected after that review, use a facade-owned empty
   argument object and the exact captured native receiver. Preserve both samples,
   compare a narrowly specified header relation, correlate complete supported
   families, and retain all no-authority flags. Do not invoke compiler Save,
   saveCopper, source merge or decoder functions.
6. Validate that bounded observer once on a disposable project, including full
   collateral and closed/reopened logical SQL invariance. This is future work,
   not authorization to start another live campaign in the frozen release.

The smallest useful implementation step is the fixed native state/effect
preflight and its explicit refusal contract, not the FileSource transport.
A narrower complete STRING observation could be considered only if it can reach
the reviewed model fields through an owned fixed native interface; the existing
lossy getters do not supply color, source provenance or parent ownership.
Do not invent closure access, evaluate vendor source or promote arbitrary native
objects into an agent API to obtain those fields.

Confidence is high for the concrete mutation chain, selected STRING field path,
framing, routing and dispatcher omissions. This audit does not certify every
conditional geometry/model variant, every dynamic prototype or actual queue/SQL
effects. Those remain named prerequisites, not presumed read-only behavior.
