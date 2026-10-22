# Schematic Text, Wire and Bus ID reader review

Reviewed on 2026-10-10. This is source and offline-regression evidence for three
narrow native equivalents, not connected acceptance. The continuation also
examined retained source/native exports from the authorized disposable fixture;
it made no live calls or CAD changes. No user production project was inspected.
No installed runtime pin was changed.

## Official contract and implementation gap

The official [Text ID method](https://prodocs.easyeda.com/en/api/reference/pro-api.sch_primitivetext.getallprimitiveid.html)
and [Bus ID method](https://prodocs.easyeda.com/en/api/reference/pro-api.sch_primitivebus.getallprimitiveid.html)
return promises of string arrays without parameters. The
[Wire ID method](https://prodocs.easyeda.com/en/api/reference/pro-api.sch_primitivewire.getallprimitiveid.html)
also declares an optional net-name string or string array. All three are marked
beta. Their declarations do not establish the installed implementation's
completion, ownership or side-effect behavior.

The installed Text wrapper publishes a callback and returns its initial array
without awaiting that callback. Wire and Bus await an RPC, but catch failures as
empty arrays. Their delegated UI implementation calls a schematic compiled-net
handler. Both filtered and unfiltered handlers await the project compiler. That
compiler updates AST/cache state and publishes `deviceStandardization` and
`ASTUpdate`. This review does not claim those exact handlers necessarily Save;
their compiler and notification effects alone make them unsuitable as the new
ID-only observational primitive.

## Implemented subset

`easyeda_control_sdk_read` accepts the three exact declared method names with
`arguments: {}`. Descriptors and coverage classify them as
`native-task-equivalent`; existing reader defaults remain `public-method`.
Only document type 1, the exact active ordinary schematic page and its expected
`pageUuid@projectUuid` tab are admitted. Symbol scenes and block-instance pages
are refused. Every Wire net filter, including an empty array, is refused: literal
native names are not proven equivalent to the compiler's project-level naming.

The fixed reader synchronously copies the native source-ID inventory and reads
the page's Text and NetGroup families. These inventories have different scopes:
the family Sets and `getModels` contain direct Root children, while the page ID
index also contains connected descendants. Drawing-frame text, component/pin
attributes and wire LINE children therefore need not be root-family members.

The reader first proves a complete reciprocal Root-tree/ID-index bijection:
every indexed model is reached exactly once, has the expected parent and shape
manager, is connected, and is the same object at its indexed ID. It then requires
exact agreement between each direct-root family Set, `getModels`, source-ID
membership and index identity. NetGroup type must be exactly `wire` or `bus`;
returned IDs identify groups, not LINE children. Stored and generated descendant
Text are excluded from the page Text family by their proven ownership, not by
an ID-name heuristic. Their ownership and index membership remain checked.
The final synchronous checks repeat source/family/tree membership, identities,
parent links, child positions and model types. IDs are sorted, bounded and
unique. A missing, duplicate, foreign, disconnected or unstable member refuses
the entire observation rather than returning a partial family.

This is a conservative reciprocal-tree subset, not a claim that every ordinary
schematic representation passes. In particular, source `GROUP` records belong
to `combinationManager`, not the primitive ID index. They currently fail the
strict source-to-model proof with `SOURCE_MODEL`; descriptors explicitly exclude
them. Supporting that representation needs an independently checked combination
inventory, not silently skipping unknown source IDs.

The source-ID map stores presence marker `1`, **not** TEXT/WIRE/BUS record types.
`DOCHEAD` and document/CANVAS metadata use separate dispatch paths, and the
source serializer injects CANVAS independently of this primitive inventory.
Exported CANVAS must not be inserted into a synthetic source-ID model map.
The reader does not confuse presence markers with a format discriminator. It does
not call source serialization or a model's `uploadTo`, primitive getters, a
compiler, settings APIs, a message bus, Save or navigation. This proves a bounded
live inventory observation, not serialized-source bytes, electrical connectivity,
native primitive contents or disk persistence.

The reader binds SCH/UI/tab-bar, active document manager and page, project,
shape/ID managers, source handler, family collection and action-runner identities.
It requires initialized consistency and no running native action, then rechecks
the inventories and receivers before returning. There is no callback or await
inside this native collection. The existing engine supplies fresh runtime-pin and
context admission, two separate matching observations, quarantine checks, and
context checks surrounding each dispatch. An error is never converted to `[]`.
The wrapper preserves only a fixed guard code in a facade-owned local variable.
Host diagnostics admit exact method/stage/code tuples; arbitrary caught native
exception messages and getters are not inspected or echoed. Unknown exceptions
produce the fixed `EXCEPTION` category, without private error text.
The response explicitly carries `implementationKind: native-task-equivalent`,
assurance `bounded-native-id-observation-not-complete-source-connectivity-or-persistence-proof`
and authority `native-id-observation-not-complete-source-connectivity-or-persistence-proof`.
Existing public readers retain their public-observation labels. Offline discovery
distinguishes native-only, public-only and mixed method queries without granting
execution authority.
The historical disposable SDK validation plan remains public-only and rejects
these native methods during plan parsing, before evidence callbacks or any
facade dispatch. Its strict public proof contract has not been widened.

## Reproducible primary-source anchors

Paths below are relative to the installed application's `resources/app/assets/`.
Offsets are zero-based UTF-16 string positions in the exact minified file, not
byte offsets. They identify review anchors, not separately trusted slices.

| File | SHA-256 |
| --- | --- |
| `pro-api/0.2.53.aee2f57a/api-types.d.ts` | `32a0d2f8b4bc3d7b2b93b33499d9d768b0c23c77f45843a65166cf4e8ad6dab1` |
| `pro-api/0.2.53.aee2f57a/api.js` | `5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc` |
| `pro-ui/3.2.149.43637efe/js/ui.js` | `12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a` |
| `pro-sch/3.2.149.35ae2987/js/sch.js` | `3f50136fb4ba2d5593beac7ef3e20ebe5275177b56bbcfdd297e79f176a6618f` |

- Declarations: Text `getAllPrimitiveId` line 13450, Bus line 14222, Wire line
  17799. The installed signatures agree with the official argument distinction.
- API: Text class `s0` at 1605944; Wire class `a0` at 1611010; Bus class `X_`
  at 1524231. Their `getAllPrimitiveId` methods begin at 1607442, 1612005 and
  1525255 respectively; review each method's completion and error handling.
- UI: `yI.getAllPrimitiveId` at 17222738 dispatches either
  `sch/getNetGroupInfoByNetName` or `sch/getAllNetGroupIds`.
- SCH: the two handlers at 6155132 and 6155301 await `$a`; compiler body at
  6362632 updates compiled state and reaches notification publication near
  6363719. It is not an isolated model-ID copy.
- SCH: NetGroup constructor at 3922090 sets `modelType="NetGroup"` and defaults
  `type` to `wire`; `uploadTo` near 3924408 distinguishes WIRE from BUS encoding.
  `bJe` at 3962648 independently partitions those same group IDs into the wire
  and bus native projections. None of these serializers is invoked by the new
  reader.
- SCH: base-model parent setter at 1922179 maintains reciprocal child links;
  `onConnectedChange` at 1924023 indexes each connected model. Node
  `handleInsertChild` at 1931095 propagates connection to descendants. Root
  `handleInsertChild` at 3920952 emits only its direct inserted child;
  shape-manager subscriptions near 4768111 store those root models in **Set**
  buckets by `modelType`. `getModels` at 4499193 copies that bucket. These are
  not interchangeable scopes or a map from primitive ID to model.
- SCH: frame `reSetBorderShape` at 6269426 creates Text children with
  `notAddHistory`, then appends them to the frame. The connected ID index can
  contain these generated Text models without independent page Text records.
- SCH: LINE class `modelType` at 2148537 returns `Wire` or `Bus` from its
  parent-derived type, despite its `NetGroupLine` creator/tag name. NetGroup
  child handling at 3927253 and `createLineBaseOn` at 3928657 establish LINE
  ownership beneath the group; the reader returns only `NetGroup` IDs.
- SCH: `setSourceCodeIdByType` near 4659680 stores marker `1` on add/update and
  deletes on removal; `getSourceCodeIdMap` at 4660232 returns a Map copy.
  `getSourceCode` at 4660290 first injects CANVAS, then resolves source keys
  through the page ID map and serializes models that exist. The reader uses
  the inventory, not that serializer, and does not copy its missing-model skip.
- SCH: `s7.onDocDetail/onCanvas` near 4618127 delegate separately from primitive
  add/update dispatch. The handler's `onCanvas` at 4661347 delegates to the
  origin-only update at 4636373. The native format parser handles DOCHEAD
  separately near 618191. Structural export records are not indexed primitives.
- SCH: `c7.handleGroup` at 4651819 updates `combinationManager`, not the model
  index. The source-ID presence map can nevertheless contain the GROUP ID.
  Its exclusion remains explicit and tested.
- SCH: `getActiveDoc` at 6418223 resolves the UI's current tab. The new reader
  independently requires the same expected tab and retains receiver identity.
- SCH: ID manager `t7` at 4600993 retains its owning `docManager`; consistency
  wrapper `g7` near 4663500 retains `docManager` and the active handler; handler
  base `UI` at 4656596 retains `consistencyImpl`, and its `docManager` getter
  resolves that wrapper's owner. The reader checks this complete owner chain.
  Page construction near 4665536 assigns `project_uuid` and `projectMgr`
  independently, so the reader also checks the project manager's own UUID.

## Verification and remaining work

The generated reader is exercised through the exact bounded SDK result codec and
the real SDK engine coordinator with synthetic owned models. Regressions cover
nonempty and empty families, LINE/group separation, strict argument/type refusal,
missing source models, invalid markers, source/model omissions, foreign owners,
duplicate IDs, same-ID different-object substitution, receiver changes, unknown
group types, bounds, context/profile/quarantine drift and differing observations.
No public family callback, compiler or source serializer is needed for success.

The first connected attempt on the preceding installed reader failed with only
`unclassified-upstream-failure`. Retained source/native exports show one frame,
29 frame attributes, one standalone Text, CANVAS and DOCHEAD. They do not capture
the live ID map, source-ID map or generated frame-child identities. The internal
guard that failed that attempt therefore remains unknown; source review must
not relabel it as an observed `INDEX_MEMBERSHIP` error.

The previous reader's universal same-family index check is independently wrong
for the pinned inherited/generated descendant hierarchy. An offline probe
derived all 31 primitive IDs and parent links from the actual retained export,
added four explicitly synthetic generated frame Text children, and reproduced
`INDEX_MEMBERSHIP` on the original reader. The corrected reader returned exactly
the retained page Text ID and empty Wire/Bus families. This demonstrates the
source-proven defect with a source-derived fixture, not live acceptance or the
actual generated-child count. The first ad-hoc probe had a TypeScript-stripping
syntax error; its corrected standard-stripping run passed. Repository regressions
likewise retain the captured 1/29/1 shape without publishing fixture identities,
and add nested attributes, generated/stored descendant text, deep reparenting,
replacement, cycle, missing-index and foreign-owner cases. Fixed diagnostic-code
tests reject spoofed messages, suffixes and exception accessors.

The final independent isolated Node 24 run passed all 284 tests across native
IDs, native diagnostics, SDK registration, public SDK reads/coordinator, polygon
split and API coverage. The regenerated inventory check passed for all 774
methods. These offline tests do not change the connected-evidence boundary.

Auxiliary electrical models were reviewed separately. At 4131362,
`refreshNetPoint` appends dangling dots beneath a NetGroup or prepends them
beneath a Pin; `updateJunctionByConnectionPointNode` at 4130259 appends a junction
to the selected Pin/NetGroup. However, that method also records a junction in
the group's `junctionModels` even when its parent is a Pin, while
`sortChildrenByCategory` at 3923364 copies the group junction collection into
`children`. A later sort may therefore produce an aliased or nonreciprocal
listing. This is a source-derived edge case, not an observed live failure. The
current full-tree proof refuses such a listing instead of discarding aliases;
nonempty electrical-page acceptance remains pending.

Connected execution remains unclaimed for this new generation. Before any live
claim, use a disposable ordinary page containing separately identifiable Text,
Wire and Bus models, verify each full returned family against independently
captured source, and confirm unchanged context/source/checkpoint evidence. Do not
relax the source-membership guards to make a fixture pass. Full primitive DTOs,
symbol-scene IDs, compiled net filters and PCB selected-object projection remain
separate contracts; this change does not admit them.
