# Native PCB operation contracts

These adapters target EasyEDA Pro editor `3.2.149.88089769`, PCB engine
`3.2.149.5378b690`, and API `0.2.53.aee2f57a`. They are typed operations,
not a caller-supplied JavaScript or document-source endpoint. Source inspection
and unit tests do not establish live admission or fabrication readiness.

## Copper lifecycle

For manual copper calculation, use this explicit sequence:

1. Read and checkpoint the complete current source and durable project.
2. Call `pcb.pour.clear-derived` for each existing pour with generated copper.
   The target is the **POUR parent ID**, not a generated island ID. One native
   `pcb_PrimitivePoured.delete` history group removes its derived children;
   proof requires only that parent's `POURED` record to disappear. The boundary,
   net, layer, rules and every other record remain unchanged.
3. Edit placement, routing, boundaries, rules or stack on the derived-free board.
4. Call `pcb.pour.rebuild` for each required parent. The fixed native RPC awaits
   the worker plus thermal/island/history processing and captures its complete
   result. Proof binds each island to the correct parent, net and layer, accepts
   only the selected parent's derived record change, and checks all other source.
5. Save and reopen under the exact document/library lifecycle and compare the
   entire durable project. Run electrical/connectivity and DRC checks separately.

The adapters do not change the user's automatic-repour preference. Automatic
regeneration or any other derived collateral fails exact proof and requires
recovery; it is not a successful clear. Clearing/rebuilding cannot reproduce old
generated island identities, so rollback is checkpoint-based. Plain source merge
still refuses existing `POURED`, `LAYER_FILL`, `TEARDROP`, `PARTITION` and
`PANELIZE_STAMP` records. Clearing explicit pours does not claim to clear those
other families.

The public rebuild wrapper loses other parents and mislabels 45-degree grid
copper. The adapter uses its reviewed underlying RPC, not that lossy return as
evidence. Copper computation is not an electrical isolation or DRC approval.

## Supported native repairs and limits

The source-derived adapter implements representable primitive fields, net/equal-
length groups, differential pairs, net/region/between-net rule assignments, all
13 current physical rule families, and a separate physical-stack operation. It
checks a complete source precondition immediately before one native history
transaction. Unknown records and unrelated fields remain exact. Existing same-
name physical rules are merged without dropping unknown context fields.

Between-net lookup is symmetric: reversed duplicates are rejected, and spacing
and creepage entries for one pair must share an endpoint orientation. Distances
are converted before native rounding; via diameter-to-radius conversion happens
before that single rounding step.

Current engine limits are explicit:

| Requested feature | Native boundary / alternative |
| --- | --- |
| `REGION` rule `NO_VIAS=3` | Current region model has no persistent via prohibition field. No phantom flag is written. |
| Standalone grid `FILL` | Its encoder supports solid only. Use a grid **POUR** with explicit line width and spacing. |
| Plane-zone `FILL` | Requires the separate `LAYER_FILL` model, not a `fillMode` flag. |
| `PAD` marker type | Current pad encoder cannot preserve it independently; normal/test pads are distinct supported states. |
| `PAD` regular `NGON` | No reviewed current tuple decoder; explicit polygon pads are the alternative. |
| Noncircular `ELLIPSE` pad | Current native representation requires equal axes; use the supported oval/polygon shape. |
| Different top/bottom pad paste expansion | One native shared value cannot preserve different values. |
| Pad rectangle corner value | Native unit is percentage, bounded 0–100, not a physical radius. |
| Cubic polygon command `C` | Current SDK parser's branch does not advance reliably; rejected. Lines, arcs and circular arcs have reviewed mappings. |
| Component flip of same-layer text | Needs native text/font-width geometry beyond stored pose; refused when that transform is required. |
| Unknown component child transforms | Refused; stored attributes have explicit transform proof and pad-net records are preserved. |
| Public physical-stack setters | Stubs; the separate native stack adapter uses reviewed `LAYER` / `LAYER_PHYS` changes. |
| Public generated-copper create/modify | Stubs; the real rebuild and derived-delete routes are used instead. |
| Public special-pad fields | Unimplemented by this SDK. |

The current via enum is `0 NORMAL`, `1 BLIND`, `2 SUTURE`; historical importers
use other mappings and are not authoritative for this runtime. Library geometry
and project component placement have separate persistence scopes. Updating a
footprint must not silently update placed instances or external library assets.

## Validation boundary

The parent integration task records live results and admission separately. A
source-merge component translation and exact inverse have passed saved/reopened
full-database comparisons across the disposable project's twelve documents.
This proves that tested path did not rewrite omitted public-export metadata; it
does not grant every operation family live approval. The clear/rebuild and rule
changes have focused regression coverage; no production design was edited by
this adapter work.

## Footprint geometry and itemized checking

`footprint.*` operations cover pad, line, arc, polygon, solid fill and built-in-
font text geometry in document type 4. Their source retains the actual
`FOOTPRINT` header. Native source apply also repairs required attributes, so the
adapter checks the existing named Footprint attribute and unique attribute keys
before dispatch. Library owner, collection, footprint identity, save/reopen and
durable storage require their own verified lifecycle; a PCB save or update of
placed instances is not equivalent.

The itemized-report helper retains complete nested PCB violation objects,
including hidden rows, native object IDs, explanation templates and parameters.
The public PCB check currently applies the user's custom-check selections even
when `strict=true`; its physical rule configuration does not disclose those
selection flags. Do not label this particular route an all-rules check.

Schematic ERC's public wrapper discards rows. The fixed native observer captures
only a new `schDrcLog` group, requires exactly one successful native design-rule
action, reconciles every severity counter, and checks sheet source and rule
policy invariance. It cancels/disposes only its own listeners. It does not use
`MessageBus.pull` as unsubscribe. A cancelled native check cannot become a clean
report through its caught exception. Native compiled-hierarchy freshness and
whole-project invariance remain independent checks at the executor boundary.
These helpers have focused tests, not a claim of connected live admission.

The calculation-scope snapshot uses the same source/policy capture without
running a check. For ERC this includes every currently loaded schematic sheet,
so recovery can detect an unsaved edit outside the active sheet. It does not
claim coverage of unloaded hierarchy documents. The coordinator must retain
that snapshot before dispatch and compare it during reconciliation. Native
implementation checks hash the exact `sch.js` handler closure for ERC and the
`pcb.js`, `ui.js` and `api.js` closures for PCB DRC, before and after execution.
