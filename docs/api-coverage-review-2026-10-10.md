# Independent API coverage review — 2026-10-10

## Outcome and scope

Source review found a critical existing error: several methods returning a
`File` also save editor state. The schematic netlist path can additionally
annotate designators and Unique IDs. File transport checks and a comparison
after export do not authorize those writes or undo an implicit SaveAll.

The library executor now refuses six confirmed hidden-Save export routes
before generating dispatch code. It separately refuses the simulation export
because the installed handler requires an NGSPICE editor, outside the admitted
document types. The root integration removes live `schematic-topology`
execution, which used the same schematic netlist exporter. Schematic design
transactions that require that proof must stop before design dispatch; they
must not silently substitute a weaker component or native-page observation.

This review used installed program files, repository source and offline tests.
It made no live bridge/CAD call, opened no project, and inspected no user
design data. Historical successful topology/export tests did not separately
observe the internal SaveAll calls and cannot establish that those paths were
read-only. This finding does not authorize an undo, restore, Save or replay of
any historical user operation.

## Reproducible installed-source evidence

All paths below are relative to the installed EasyEDA `resources/app/assets`.
Offsets are zero-based JavaScript UTF-16 character indices; ranges are
half-open and cover the complete enclosing method/function, not a matching
symbol-name fragment. Acorn identified these boundaries in the installed
files. Hashes are SHA-256 of UTF-8 bytes.

| File | Bytes | Full-file SHA-256 |
| --- | ---: | --- |
| `pro-api/0.2.53.aee2f57a/api-types.js` | 1730198 | `4da5b5184a78e2d3aca843dad6b147d7feb7ec1368160d73f49c4acbcf97dfdb` |
| `pro-ui/3.2.149.43637efe/js/ui.js` | 17265809 | `12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a` |
| `pro-sch/3.2.149.35ae2987/js/sch.js` | 6431214 | `3f50136fb4ba2d5593beac7ef3e20ebe5275177b56bbcfdd297e79f176a6618f` |

The public entry bundle has SHA-256
`5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc`;
the actual delegated implementations above, not that entry hash alone, establish
the behavior. Public method signatures and return types remain useful for
discovery, but do not describe every internal side effect.
[Official schematic manufacturing API](https://prodocs.easyeda.com/en/api/reference/pro-api.sch_manufacturedata.html),
[official PCB manufacturing API](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_manufacturedata.html).

### Schematic netlist: annotation and SaveAll

1. The API constructor mounts `sch_ManufactureData = new pp`. Its
   `getNetlistFile(fileName, netlistType = "JLCEDA")` method at
   `[1415957,1416117)` forwards both arguments to
   `extensionApi.SCH_ManufactureData.getNetlistFile`.
2. The UI registration at offset `17235860` maps that operation to
   `KE.getNetlistFile`. Its complete method `[17176780,17177372)` first awaits
   `Rce.getNetlist(netlistType)`; filename construction happens afterward.
3. `Rce.getNetlist` at `[17041894,17042070)` obtains the active schematic ID
   and calls `sch/getSpecifiedTypeNetlistBySchematicId` with that ID and the
   unchanged netlist type. The same method is also registered as
   `SCH_Netlist.getNetlist` at UI offset `17235794`.
4. The schematic service registration at offset `6123118` calls
   `t2e(schematicId, netlistType)`. The complete `t2e` function is
   `[5995172,5995619)`.
5. `t2e` invokes `w3` with the schematic-prefix predicate and positional
   flags `true, false, 1, netlistType === "JLCEDA"`, followed by a formatter
   callback. It does not supply `w3`'s final optional flag, which defaults to
   `false`.
6. Complete `w3` is `[6393858,6394872)`. Its default path runs `ay` preflight;
   when that returns zero, it iterates matching schematics. Where document
   update permission is granted, it computes designator and Unique-ID changes
   with `pCe` and `n2e`, then awaits `Up` for both attribute groups. For each
   selected schematic entered, its `finally` awaits `saveAllFiles`, including
   when permission is absent or formatting later throws. If the initial
   preflight refuses, this selected-schematic body is not entered; SaveAll is
   therefore not claimed to occur on every possible invocation.

The complete `t2e` source slice hash is
`f7e1f3aaa5948eafe9c011abec6c86a610b00ab7fa17112114ad9becfb0909a1`;
the complete `w3` slice hash is
`5e56c0abde196a7e6ce5997c493856b02ca2d7ec5fcddcae4e119d8756007b02`.

Affected plugin paths are `export.schematic.netlist` and the former
`schematic-topology` exact reader, which called
`getNetlistFile("easyeda-control-topology", "JLCEDA")`. Choosing a fixed
filename or JLCEDA format does not bypass `w3`. The unexposed
`sch_Netlist.getNetlist` is also unsuitable for the new read-only SDK route.

### Other confirmed hidden-Save exports

| Action | Complete chain and relevant branch |
| --- | --- |
| `export.schematic.bom` | API `pp.getBomFile` `[1415659,1415957)` → UI `KE.getBomFile` `[17173550,17174083)` → `Cn("getExportBomFileHandler", ...)` → schematic registration at `6105873` → `new gl().exportBomHandler(e, true)` `[5715591,5717516)` → `TQ` if a template is selected, otherwise `IG`. Both helpers await `saveAllFiles` before selecting their PCB/schematic branch. |
| `export.pcb.bom` | UI `t0.getBomFile` `[13658041,13658683)` → `Cn("getExportBomFileData", ...)` → schematic registration at `6106019` → `gl.getExportFileData` `[5723400,5724392)` → `TQ` or `IG`, with the same unconditional initial SaveAll. Selecting a template can also alter the global preferred-template setting. |
| `export.schematic.document` | UI `KE.getExportDocumentFile` `[17174083,17174464)` immediately awaits `tl()` before obtaining the render configuration and publishing the export request. |
| `export.pcb.pdf` | Public `getPdfFile` `[1378671,1379185)` calls the fixed `getPDFFile` RPC. UI `t0.getPDFFile` `[13665901,13666072)` obtains the current PDF configuration; when configuration validation passes, it calls `T5e` `[10814292,10814641)`, which immediately awaits `tl()`. |
| `export.pcb.netlist` | UI `getNetlistFile` constructs its PCB selection and calls `u2e` `[13645627,13646885)`. If the global `sp().unsaveFileTabId` list is nonempty, `u2e` awaits `tl()` before decoding/exporting. Clean active-document source alone cannot establish that every other tab is clean. |

Complete schematic helper ranges: `IG` `[6394872,6395556)` and `TQ`
`[6395556,6396320)`. Their slice hashes are respectively
`ab252415b25d29b60eba84025423408057ccb7894b3dea665d48967621470c92`
and `fa2e97cbe550c87fdf5f303aa70d4d2739381e7f7364609cba1d8984b165d4bb`.

`tl` is not an inferred save helper: the complete UI function
`[15077850,15080249)` enumerates unsaved editor tabs, performs conflict and
permission checks, and saves them. It has duplicate-Save protection, but no
ownership relationship to a plugin export journal. Its full slice hash is
`1671ab34185996ae9d67207c03f8aa56b8a179c80794f41b9360aae46d6506fa`.

The library rejection applies before obtaining a generated expression. It is
not a late error after file creation. Restoring these exports requires either a
reviewed pure extraction route, or an explicitly authorized all-tab save and
annotation transaction with durable pre-dispatch intent, exact effects and
no-repeat recovery. A Boolean dirty-state probe followed by the same method
would still have a check/dispatch race unless the native dispatch enforces it.

### Simulation export is a separate capability gap

Public `getSimulationNetlistFile` calls `getNGspiceNetlist`. The schematic
handler at offset `6145624` only returns data when the active document type is
`NGSPICE`. It is not an ordinary type-1 schematic exporter. The executor admits
types 1–4, so this action cannot currently produce the promised File. It is
refused for that concrete reason, not classified as a proven hidden-Save path.

## New read-route review

The reviewed boundary is fixed-method dispatch, not arbitrary SDK execution.
Inputs cannot select properties, inject code, supply callbacks or transfer live
objects. Primitive snapshots call fixed documented getters and serialize only
the resulting bounded data. Undefined values are retained separately from
null. Failures, unknown object shapes, incomplete explicit-ID results and
transport truncation refuse rather than inventing defaults.

The facade serializes calls, validates the admitted runtime fingerprint and
uses an authenticated bridge dispatch lease. The engine checks quarantine and
exact context, performs two observations, checks context after each, and
accepts only matching hashes. There is no third attempt or automatic retry.
An upstream ambiguous return aborts the authenticated lease; the existing
gateway owns that quarantine, even though these read-only observations do not
create design journals. A matching public snapshot is explicitly not native
source, electrical connectivity or persistence proof.

Getter spellings and return representations checked against the installed
declarations/implementation include `HorizonMirror`, lowercase `pinType`,
component-pad inherited accessors, component-pin `NoConnected`, plain
component-pad summaries, nested pad-shape arrays, and polygon `getSource()`.
Fill/Region line-width getters and Pour priority/name/line-width getters can
throw for falsy stored values; the adapter must refuse those observations, not
substitute a guessed zero or default. Synthetic per-method test objects alone
cannot discover such native getter behavior.

The review found these additional feasible readers and sent them for
implementation:

- `dmt_Panel.getPanelInfo` filters the already admitted current-project
  `getAllPanelsInfo()` result. It does not require an active type-26 panel.
- Both PCB canvas/data origin conversions terminate in arithmetic with the
  current native origin; no setter is called. Their returned point is bounded
  data, distinct from selecting or moving the origin.

The installed schematic `getPrimitiveAtPoint` has an empty body and
`getPrimitivesInRegion` returns a constant empty array. Their omissions should
identify those stubs, not a generic inability to serialize primitives.

PCB selection's raw getter filters native objects without `toJSON`, while its
UI mapper adds asset metadata. A complete selection claim would therefore need
independent selected-ID parity and a fixed projection. The existing selected-ID
reader can remain useful without claiming those missing object fields.

## Safe topology replacement: feasible but not interchangeable

The maintained `schematic-native` reader observes each active-page pin through
`getSchPinNet`, retains complete native attributes and source, and does not use
the manufacturing netlist exporter. It remains useful as a scoped observation.
It is not the former hierarchy-wide compiled topology proof: it does not by
itself prove reused-block channels, multi-part aggregation, hierarchy-wide
identity, Convert-to-PCB filtering or compiled net naming across all pages.

The installed `F0` helper clones attributes while traversing compiled
`pureSchematics`; `gT` formats compiled pin nets and reads rule managers. Those
private functions are not a reviewed callable replacement: compiled-graph
freshness, full membership and all delegated side effects still require proof.
A dedicated adapter could expose the graph without annotation/export, but it
needs a separately pinned profile, independent complete source correlation,
stale-cache refusal, and disposable fixtures for hierarchy, repeated parts,
unnumbered/duplicate IDs, disconnected pins and no-connects. Removing the
electrical proof requirement to keep writers enabled is not an alternative.

## Offline verification and remaining limit

The transaction review also found that retained type-1 journals could reach
Save or an inverse before their next topology read. `DesignExecutor` now
refuses schematic apply, commit, rollback, all three layout repairs,
reconciliation and target/page navigation before runtime calls, upload
barriers, dispatch or journal writes. Its private dispatch boundary checks
both the original sealed context and the current rebound context as a second
defense. Existing evidence is not rewritten. Read-only journal inspection,
facade-only runtime rebinding and the existing nonce-bound execution-authority
recovery remain available; none grants permission to resume a schematic
transaction without a valid connectivity reader.

Four new `design-topology-refusal.test.ts` tests exercise every affected journal
entrypoint, including an incorrect rebound PCB context, private Save/inverse
dispatch and recovery's restricted boundary. They assert zero runtime calls
and byte-identical retained journal evidence on refusal. Together with Save
attempt and retained layout/wire authority regressions, 17 tests passed;
targeted strict type-aware Oxlint reported zero diagnostics.

Eight new `library-export-safety.test.ts` regressions check all seven refusals
at both execution classification and code generation, while retaining a
separately admitted DSN transfer and metadata read. Together with the existing
library execution and project-symbol candidate tests, 23 tests passed on
Node 24.18.0; targeted strict type-aware Oxlint reported zero diagnostics.
An initial test command incorrectly requested an unavailable `tsx` loader;
the recorded passing run used this repository's native Node TypeScript test
command instead.

Independent review of the disposable SDK validation runner found and corrected
a composed Zod string bound that unintentionally restricted complete source to
4096 characters. A fresh 3-MiB source schema and a realistic larger-source
regression now cover that case. Its enriched SDK response comparison was also
checked against the actual maintained validator output. Checkpoint physical
bytes are not confused with the source file's physical bytes: logical dump
equality and the maintained checkpoint receipt establish their relationship.
The injected facade remains a trusted boundary, not a caller-fabricated proof
authenticator. No further runner blocker was identified in this review.

These tests establish offline refusal and adapter behavior only. A fresh,
admitted facade and disposable projects are still required for connected
reader, exporter and mutation validation. No candidate symbol writer was
enabled, and no live validation is claimed by this review.
