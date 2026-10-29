# Supplied PCB stack and rule records

This batch starts from merged PR151, `92abfed492f7e7da396ece224634eee3af4a3b47`.
It adds offline inspection of supplied materialized PCB source through the
managed document-source workflow. No EasyEDA process, getter, serializer,
compiler, project file or production history was inspected by this work.

## Source findings

The installed PCB source `pro-pcb/3.2.195.6b67774e/js/pcb.js`, SHA
`a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b`,
stores physical layers in `Ke.manager._layerPhys`. Each `HA` model owns layer ID,
material, thickness, permittivity, loss tangent, island retention and z-index.
`getLayerPhys` sorts a copied array by z-index. Its model properties include
getters resolving names and types through the separate layer manager. A future
live descriptor reader must bind both managers and their original constructors.
Matching stored records alone does not establish their current loaded state.

The rule manager owns fourteen maps, including autorouter definitions. Its
selector state includes net, class, differential, region, equal-length and
pad-pair maps, a between-net model and caches. Existing private common-state
collectors target a different PCB source and reject populated selectors. They
remain unchanged.

The current public rule-configuration RPC calls `Ipe.getDesignRulers`. That
method projects thirteen rule families, selector trees, between-net entries,
region data and options. Autorouter definitions and the complete raw selector
state are absent. Several rule-manager lookups can populate caches or repair
missing defaults. Forwarding the public projection does not provide the
requested complete passive report. The installed opening owner currently binds
UI/frame/RPC ownership; it does not expose the original lexical physical-layer
and rule-manager instances for descriptor inspection. A live raw reader remains
backlog until that separate custody and bounded double-sample path exists.

The pinned source's format configuration names `LAYER`, `LAYER_PHYS`,
`ACTIVE_LAYER`, `RULE_TEMPLATE`, `RULE`, `NET`, `RULE_SELECTOR`, `EQLEN_GRP` and
`EQLEN`. Native RULE identity tuples retain the spelling `DIFFER_ENTAIL`.
The old JSON-line parser can remap substrate layer IDs, merge repeated selectors
and migrate rules. The offline report performs none of those transformations.

## Implemented report

`managed-pcb-stack-rules.ts` inspects native DOCHEAD/PCB header-body records and
ordinary PCB1.0 through1.9 JSON-line source. It checks the entire selected source
and digest before returning a page, preserving unknown records in the managed
source. Mutable history, tombstones, duplicate native identities, duplicate JSON
keys and malformed later rows refuse before an earlier partial page can pass.

The `stack`, `rules`, `selectors` and `all` sections return complete raw record
text, original record indices and SHA256 values. Every report includes all
fourteen known family count slots, unknown-family counts and record-type counts.
Nonempty selectors remain intact. Raw text preserves unknown nested fields,
record order, negative zero, Unicode and numeric spellings. No length-unit,
layer-ID, selector-order or effective-rule conversion is applied.

Limits are8MiB source,32,768 records,16 requested page entries,32KiB selected-page
data and64KiB complete report. A record exceeding the page limit refuses with a
raw-source paging instruction. A smaller prefix can end a page at a complete
record boundary and returns an explicit continuation offset. No record is
truncated. Whole-source validation does not independently prove that the
supplied export contains all intended design data.

The report establishes no live membership, complete physical stack, evaluated
rule precedence, electrical connectivity, design correctness, SDK execution,
editing or Save authority. It does not reduce the current SDK omission count.

## Focused verification

Four isolated tests passed for native and ordinary encodings, all fourteen family
slots, populated selectors, exact row/hash preservation, Unicode/negative-zero
data, page boundaries and whole-source refusals. Targeted strict type-aware lint
passed with zero warnings. The whole TypeScript project typecheck also passed
at this intermediate shared checkout. Source and synthetic tests do not validate
a connected native reader.
