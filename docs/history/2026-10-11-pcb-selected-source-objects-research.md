# Selected PCB source-object reader

This reader implements a bounded native-task equivalent for
`eda.pcb_SelectControl.getAllSelectedPrimitives`. It returns source DTOs, not
instances of the public primitive classes. No live validation, CAD access,
production project access or mutation was performed for this implementation.

## Public contract and pinned behavior

The official [all-selected method page](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_selectcontrol.getallselectedprimitives.html),
checked 2026-10-11, declares no parameters and a promise containing primitive
objects. The separate [selected-ID method](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_selectcontrol.getallselectedprimitives_primitiveid.html)
declares no parameters and a promise containing string IDs. Both are beta APIs.
The installed `pro-api/0.2.53.aee2f57a/api-types.d.ts` agrees at lines 12157 and
12165; the deprecated raw-object declaration follows at line 12173. The facade
accepts empty arguments only and labels its different return contract explicitly.

The following installed files were inspected read-only. Anchors are UTF-16
string indices, not byte offsets.

| File under installation `assets` | SHA-256 |
| --- | --- |
| `pro-api/0.2.53.aee2f57a/api.js` | `5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc` |
| `pro-ui/3.2.149.43637efe/js/ui.js` | `12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a` |
| `pro-pcb/3.2.149.5378b690/js/pcb.js` | `65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54` |

API `O_.getAllSelectedPrimitives` near 1497200 maps selected DTOs into public
classes, but its `Text` case near 1502400 does nothing. Calling it can silently
omit selected text. The deprecated raw path also does not provide completeness:
PCB `AKe` near 10294059 filters selected models by whether they have `toJSON`
before applying serializer `my`. The UI path near 17145433 also enriches component
metadata through `qdt`; its output is not a source ownership proof.

The fixed ID path does not use those filters: API near 1497048 delegates to UI
`BF` near 17145317, then the PCB handler maps every selected item's `globalIndex`
in selection order. The maintained SDK-ID reader already checks duplicate IDs,
transport completeness and two matching samples. This new coordinator uses
only that ID method, existing exact source/inventory readers, and the maintained
optional inherited-line checkpoint proof.

STRING field table near 3969387 and `S4` near 4002049 distinguish standalone
text from component ATTR and footprint text. The decoder interprets native
source coordinates and angles; this reader never invokes it or reproduces its
defaults. Every returned body remains exact native-source data, not converted
SDK getter state. In particular, null colors and text contents are not changed.

## Supported DTO domain

Supported selected root source types are LINE, ARC, VIA, PAD, COMPONENT and
STRING, reported as Line, Arc, Via, Pad, Component and String. Each returned row
has `primitiveId`, `primitiveType`, the complete `sourceRecord`, and all direct
source-backed `sourceAttributes` in deterministic identity order. Row order is
the exact selected-ID order, not source or lexical order. A component source
record does not claim to contain inherited footprint geometry or generated
attributes. Source attribute values are not filtered to public property names.

For each selected owning family, complete source/inventory membership must agree.
Electrical families reuse the existing net-membership proof without changing
it; this includes complete physical-pad correlation when Pad is selected.
Component and String identity inventories must exactly match all corresponding
root source rows. Every inventory family is checked for duplicate or cross-family
identity collisions, even when unselected. Unknown inventory families refuse.

The separate `pouredCorrelation` collection is not an ordinary primitive family.
Its producer validates piece uniqueness but does not reject piece IDs colliding
with other families. This adapter therefore requires that correlation to be
exactly empty, with zero derived-piece count. A test executes the real inventory
producer and maintained validator with a pour-piece/STRING collision and proves
that this additional refusal is necessary.

Other generated identities are excluded by their reviewed namespaces: `yd`
near 4090324 generates polygon children by appending `l` or `a` plus a counter to
the source object's index; component descendants prefix the component identity
(the maintained inherited-line proof retains the exact source chain); ratline
construction near 4306002 and 8079739 uses `rat`. A selected source ID overlapping
any such namespace refuses, even if its source and ordinary family inventory
otherwise agree. This prevents an outline child or inherited child from being
mistaken for a same-spelled root object. Existing disabled-panel admission is
unchanged; enabled generated panel state already refuses.

Missing selected IDs, ComponentPad, inherited or generated line/text IDs,
component labels, outline children, unsupported families, grouped selected
objects and unresolved source attribute owners refuse the whole read. No partial
result or false absence is returned. Complete Line correspondence may require
the existing narrow checkpoint proof for *unselected* inherited lines; selecting
an inherited line still refuses. Other families can be present but are never
silently accepted as selected objects.

## Observation and authority boundary

Each cycle is source → selected IDs → complete inventory → selected IDs → source.
The entire cycle runs twice. Source commitments, exact ordered IDs, inventory
commitments and DTOs must match; every constituent reader independently takes
two samples. Runtime fingerprint and full active owned PCB context are checked
at entry, around every observation and at completion. Inherited-line proof, when
needed, begins with a fresh checkpoint; the earlier detection cycle is discarded.

The native window can change away and back between observations. These checks
are not atomic isolation, complete native model serialization, connectivity,
saved-file or persistence proof. Output retains `liveValidation:not-yet-validated`.
There is no Save, navigation, selection modification, public object mapper,
generic code, mutation or retry path. Any failed observation stops the call.

Bounds are 256 selected IDs, 20000 source rows/identities per family, 16 MiB source
evidence and 2 MiB result. Bounds refuse; they do not truncate. The only shared
proof edit exports its existing source validator unchanged. Source registration,
generic-fallthrough refusals, facade dispatch/evidence labels and offline
discovery are integrated; generated release catalogs and manifests remain for
the parent release workflow.

## Tests and remaining connected validation

Synthetic tests cover mixed selections including STRING, order, empty selection,
all six owning-family dropout/extra/count/duplicate cases, unknown and inherited
IDs, cross-family collisions, raw attributes, source identity/byte bounds, every
constituent read/hash failure, every context/quarantine boundary, source and
selection drift, runtime drift, enriched SDK-ID metadata and actual registration
handler routing/failure evidence. Generic public execution is explicitly refused.
An additional fixture executes the real complete inventory producer and its
maintained result validator before deriving mixed Component/STRING DTOs, so
the result is not supported solely by a hand-written inventory approximation.

A disposable connected fixture still needs empty and mixed selections, including
an ordinary footprint-bearing component and standalone STRING. Compare exact
selected IDs with the returned order; retain before/after source and checkpoint
invariance. Include unsupported selected attributes/outline children and verify
whole-call refusal without selection changes. Offline tests do not replace this
connected proof and do not authorize using a production design as a fixture.
