# Component-property name reader review

Research date: 2026-10-10. This review covers source and offline tests only.
It adds a fixed native equivalent for
`eda.sch_PrimitiveComponent.getAllPropertyNames`. It does not validate the
installed public wrapper or establish connected, saved or reopened acceptance.

## Public contract and installed defect

The current official method page describes a set of all device property names,
returns `Promise<Array<string>>`, and marks the method beta. Its example creates
a component, reads the names and deletes that component. The example is not
permission to create, delete or search a library during a read.
[Official method](https://prodocs.easyeda.com/en/api/reference/pro-api.sch_primitivecomponent.getallpropertynames.html).

The installed 0.2.53 declaration marks the method alpha. Its private remark
mentions all schematic pages, but both installed implementations explicitly
request `allSchematicPages: false`. The fixed equivalent therefore advertises
only the exact active ordinary page. It does not claim a whole-project result.

Both installed branches intend to collect every component attribute key, not
just the public `OtherProperty` projection. The older branch reads `attrPara`
from RPC rows. The newer branch invokes `getAttr()` on raw RPC rows without
constructing a model instance. Those shapes do not establish a reliable public
execution route. No branch is called by the new reader.

## Pinned primary sources

Complete file bytes were read and SHA-256 values recomputed. Paths below are
relative to the installed application's `resources/app/assets/`. Anchors are
zero-based UTF-16 offsets into the exact source, not byte offsets.

| Source | Bytes | SHA-256 |
|---|---:|---|
| `pro-api/0.2.53.aee2f57a/api.js` | 1881523 | `5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc` |
| `pro-api/0.2.53.aee2f57a/api-types.d.ts` | 678232 | `32a0d2f8b4bc3d7b2b93b33499d9d768b0c23c77f45843a65166cf4e8ad6dab1` |
| `pro-sch/3.2.149.35ae2987/js/sch.js` | 6431214 | `3f50136fb4ba2d5593beac7ef3e20ebe5275177b56bbcfdd297e79f176a6618f` |

The reviewed call chain and membership facts are:

| Anchor | Source fact and consequence |
|---|---|
| API 1554146, 1572518 | Both property methods aggregate keys from current-page components; the newer method expects live `getAttr` methods on RPC results. |
| SCH 6064350 | `sch/component/getAll` uses the active document's `getModels("Symbol")` without a kind filter when no filter was supplied. Frames and flags must not silently disappear. |
| SCH 4499193 | `getModels` copies a requested family from `modelMap`; it does not compile, fetch or save. |
| SCH 3920952, 4768116 | Root insert/remove events maintain `modelMap` for direct root children. Descendants are not root family members. |
| SCH 1924023, 1931095 | Connection and insertion maintain the ID index for connected descendants, including generated children. |
| SCH 4660232 | `getSourceCodeIdMap` returns a fresh map of stored source identities. Values are presence marker `1`, not source record types. The reader does not call the adjacent `getSourceCode` serializer. |
| SCH 6253447 | `Symbol.getAttr` with no argument copies `_attrMap.values()`. It does not evaluate values, fetch missing templates or create attributes. |
| SCH 6257760 | `Symbol.onChildChange` updates `_attrMap` for direct Attr children; other child families live in `shapes`. A duplicate key replaces/removes the old attribute during native edits, so simultaneous duplicate members are invalid. |
| SCH 4452920 | Symbol cloning copies template children and assigns their parent to the new symbol. Inherited Attr children are real connected models even when they have no independent page-source row. |
| SCH 6278684 | The ordinary Attr class has model type `Attr` and initializes `key` as a string, including the empty key. Key collection need not call effective-value or instance-value getters. |
| SCH 4294959, 4295647, 4296218 | Net flags, net ports and off-page connectors can generate `Relevance` attributes; restricting the set to stored rows would omit such keys. |
| SCH 4296679, 3959120, 4369981, 6267567 | Ordinary parts, short symbols, differential-pair flags and drawing frames derive from the same base Symbol attribute model. |

No compiled netlist, attribute value, `multiPart`, `getOrCreateAttr`, source
serializer, upload, setting, callback registration or RPC belongs to the chosen
chain. `multiPart` is deliberately excluded because its native getter can create
an attribute. The complete Symbol implementation from 6243700 to 6265700 was
read to distinguish that side effect from the pure no-argument `getAttr` copy.

## Fixed native contract

The implementation is
[schematic-component-properties.ts](../plugins/easyeda-pro-control/server/src/schematic-component-properties.ts).
It accepts no caller data or method names. Its enclosing maintained SDK reader
must bind the authenticated runtime and exact project/document/tab context,
double-sample the result and retain its existing implementation checks.

Each synchronous observation proves:

1. The exact active ordinary `SCH_PAGE`, initialized consistency handler, idle
   action runner and unchanged manager/receiver ownership.
2. Complete reciprocal root-tree and connected-ID-index membership. Duplicate
   identities, disconnected models, cycles, stale entries and foreign owners
   refuse the read.
3. Every stored source identity resolves to its connected model. Root Symbol
   members agree across `getModels`, `modelMap`, the tree, the ID index and the
   source map. A missing family is accepted only when the independent tree
   proves that no root Symbol exists.
4. Each Symbol's direct Attr children agree exactly with `_attrMap` and the
   array from `getAttr`, by object, ID, key and owner. Stored and unstored
   inherited/generated children participate equally. Pin attributes and other
   descendants are not component attributes.
5. A second synchronous source/family/attribute/tree observation preserves
   identities, membership, keys, kinds and child order. Receiver ownership is
   checked again before return.

The result is the sorted, unique set of exact strings. It preserves case,
whitespace, empty keys, control characters and names such as `__proto__` as
array data. There is no object-key projection or coercion. Values, visibility,
locks and standard-versus-custom status do not affect inclusion. The host schema
independently checks sorted uniqueness and bounds.

Bounds are 100,000 connected/source models, 20,000 root Symbols, 4,096 direct
attributes per Symbol, 1,024 UTF-16 units per key, 20,000 distinct result keys
and 131,072 total key units. The shared envelope and placeholder guards remain
in force. Reserved transport marker strings therefore refuse rather than
becoming misleading result data.

## Explicit omissions and evidence limits

- Allowed Symbol kinds are `part`, `sheet`, `netflag`, `netport`,
  `offPageConnector`, `nonElectrical_symbol`, `short_symbol` and `diffPairsFlag`.
  Hierarchical/block-instance pages and unknown kinds refuse. No instance-path
  or all-pages contract has been proved.
- Structural GROUP source records use a separate combination manager and have
  no corresponding ID-index model. Their presence refuses the entire read;
  they are not skipped.
- Cross-linked model structures that do not satisfy reciprocal tree ownership
  remain unsupported. Junction aliases need a separate reviewed profile.
- The source map proves stored identity membership, not source-body equality.
  This result contains property names, not attribute values, raw source,
  connectivity, library-template provenance or persistence evidence. Stable
  name sets do not prove that all other design fields stayed unchanged between
  the two outer SDK observations.
- No connected read has been run. Before claiming live acceptance, use a
  disposable nonempty page containing a part, frame, flags, stored and inherited
  attributes. Independently compare exact captured keys and prove unchanged
  complete native source and full saved project checkpoint. A zero-component
  test alone is insufficient.

## Offline verification

[Focused tests](../plugins/easyeda-pro-control/server/tests/schematic-component-properties.test.ts)
exercise all admitted kinds, standard/custom/empty/case-distinct keys, generated
and inherited members, frame descendants, pin exclusion, source/model/tree/map
contradictions, bounded output and receiver or membership drift. Attribute-value,
serializer, compiler and public-wrapper traps must never run.

The initial module run passed 62 tests with zero failures or skips. Host
integration now registers the exact method, validates sorted/bounded unique
result strings and rejects every undefined path. The real SDK coordinator,
registration handler and catalog distinguish native property-name evidence
from native IDs and public SDK calls. Public-only disposable plans refuse all
native-equivalent descriptors before dispatch or recording.

Integration tests cover guarded dispatch without a public wrapper, host
result contradictions, private-error redaction, context/profile/quarantine
failure and disagreement between the two SDK observations. Tests use the
required isolation preload and synthetic in-memory models. They are not
connected execution or persistence validation. The integrated focused run
passes 359 tests with zero failures or skips. Targeted strict type-aware lint
passes. The final independent review also passed the full source typecheck after
the concurrent transaction changes settled. Bundle, publication and install
remain separate release checks.
