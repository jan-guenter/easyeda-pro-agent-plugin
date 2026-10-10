# PCB rules, stack, and routing

## Inventory first

Before changing rules or copper, record the current configuration name and complete inventories for:

- nets and net classes;
- numeric spacing, track, via, and pair profiles;
- differential pairs and member nets;
- equal-length groups;
- net-to-net and region rules;
- enabled copper layers and physical stack rows;
- tracks, vias, regions, pours, and fill objects.

After any schematic-to-PCB synchronization, repeat this inventory. Synchronization can reset rule assignments or stack-related state.

## Exact rule read and the writer boundary

Use `easyeda_control_exact_read` with `pcb-rules` for the current rule configuration, net rules, net-to-net rules, region rules, net classes, differential pairs, equal-length groups, pad-pair groups and minimum lengths, and net names. The reader validates collection shapes, unique group names, member-net existence, differential-pair structure, and pad-pair/length correspondence, then requires a second identical sample.

The exact-reader JSON envelope preserves nested configuration leaves through the
bridge's depth-limited normalizer. It is bounded to 4 MiB including JSON escaping.
Any normalization placeholder invalidates the result, even when two samples
match. Do not use earlier placeholder-bearing rules evidence as a complete baseline.

The public configuration getter can fall back to a global JLC default. A returned configuration name is not by itself proof that a project-specific configuration persisted; corroborate it with the actual rule collections and saved/reopened state.

Typed rule/group operations are available through `easyeda_control_design` for supported source records. They preserve unrelated rows and verify the intended source and durable delta. Keep total net coverage, uniqueness and pair physics as explicit engineering checks; a parsed rule collection is not a fabrication rule approval.

After apply, verify:

- every expected net appears exactly once where required;
- no unknown or duplicate net was introduced;
- each class and net has the intended numeric profiles;
- pair names and member nets are exact;
- unrelated rules match the baseline.

In the baseline API, public net-rule overwrite accepted spacing, track, and via profiles but ignored a differential-pair physics profile. Do not claim pair width, gap, or mismatch from the public assignment alone.

## Differential-pair physics

The baseline native pair-manager calls are historical implementation details, not a caller execution route. Use supported typed pair/rule operations when their schema and effect model represent the change; otherwise use the scoped process-bound native dialog workflow. New private-manager coverage requires a reviewed typed adapter and disposable lifecycle validation, not raw dispatch. In the reviewed build, the selected physics profile lived on the pair row while child-net rows stayed `default`. Independently compare every affected and unrelated row and verify the current storage model before interpreting that state.

Pair identity and pair physics are separate assertions. Routing proof also needs actual member widths, intrapair spacing, length mismatch, reference plane, layer transitions, and clearance to other copper.

## Physical stack

Use `pcb.stack.replace` for the maintained complete physical-stack source adapter: top-to-bottom layer IDs, material, thicknessMm, permittivity, lossTangent, island policy and enabled copper IDs. Existing IDs and unknown metadata are preserved; thickness is quantized to the documented native unit. Inspect the expected source before committing. The generic `easyeda_board_stackup` response remains advisory, and live stack validation is separate from implementation tests.

Validate row order, IDs, conductor or dielectric type, thickness, material, dielectric constant, mask properties, and total construction. User-editable row names are not electrical identity. Use the fabricator's current construction, not values copied from another board.

## Placement-to-routing gate

Do not route around unresolved placement. Before routing, freeze topology, mechanical isolation, local bypass and hot-loop placement, Kelvin origins, crystals, ESD devices, connector launches, and differential-pair corridors.

For a board expected to have blank copper, count signal-layer netted lines, vias, regions, pours, and fill objects and refuse the operation when the assumption is false.

Typed line/via and other geometry operations now retain created IDs and verify exact source effects. Route in bounded net or functional groups, using `pcb.batch` where its source profile applies. Independently check primitives, nets, layers, widths, clearances, via geometry and connectivity after each group. A verified primitive creation is not proof that the board is routed or passes DRC. Copper rebuild is a separate selected-parent operation.

The pinned editor fixes the decorative outline width of pours, fills and regions to 0.2 mil (`Ku`/`gFe`, internal 0.02 units). Supply `lineWidth:0.2` for those families. The legacy numeric input is retained for old journals, but `parameterEffects` reports its requested and effective values; it does not set copper clearance or grid width. Track `lineWidth` and pour `gridLineWidth` remain real electrical geometry and are verified exactly. Newly created vias serialize `unusedInnerLayers:[]` and no zIndex; existing unused-layer data is not globally reset.

Plan continuous reference layers and current return paths before routing. Finalize and rebuild copper only when its placement/routing inputs are stable. Add one power polygon at a time and verify its net/isolation; thermal and stitching vias need package/process and return-path justification. Do not use temporary pours to hide incomplete placement or routing.

Run `easyeda_control_check` with `kind:"pcb-drc"` and inspect its itemized native report. This maintained path retains nested violation identities and explanations, compares calculation source and rule policy, and proves the complete saved SQLite database unchanged without saving. The generic upstream trigger and aggregate summary are not equivalent evidence.

The native checker honors its custom-check selections even with strict mode. The exported physical rule configuration omits those selection flags, so this is a current-enabled-rules report, not an all-rules scan or fabrication approval. Complete details and policy live in the returned managed artifact when inline items are omitted. Both ERC and DRC fixture paths passed connected checks with full saved-database invariance; that does not validate every rule or user board.

## Derived route audit

`easyeda_control_check` also accepts `request.action:"route-audit"`, with exact PCB context, private fingerprint and an `audit` object. Set `audit.kind:"pcb-route-audit"`; optionally select `nets`, `differentialPairs`, explicit `paths:[{net,fromPad,toPad}]`, and `widthContracts:[{net,layer,minMil,maxMil}]`. Omitted selections inspect all native nets and pairs within the 256-net request bound. Pair members are included automatically. One path is allowed per net. Pad IDs come from the exact physical-pad inventory, never a schematic pin number or footprint-local ID. Use fresh `evidence` paths and `returnMode:"summary"` for large reports.

This read-only calculation double-samples native PCB source, double-samples the complete pad/copper inventory, then double-samples source again. It rejects changed source, context, runtime or contradictory pad assignments and binds the report to both input hashes. It does not invoke native checking, save or certify durable state. The active editor must remain quiescent throughout; a switch away and back is not detectable.

The report measures raw line/arc centerline lengths, explicit endpoint paths, dangling endpoints, cycles, planar pair/equal-length spread, and per-layer widths against the native base profiles or requested contracts. Through/blind vias and plated pads connect known layers, but barrel lengths are not included. A path that cannot be established is not automatically an electrical open: pad-land contacts, interior junctions, footprint-owned copper and copper areas can require a fuller native connectivity model. Those conditions prevent a complete-path or pair-limit pass. Multi-segment arc intersections and target-relative equal-length profiles remain explicit unsupported comparisons.

Width checks do not resolve region-rule priority. Planar lengths do not establish impedance, propagation delay, reference-plane continuity or intrapair gap/coupling. Pair identity and rule/group editing already use maintained source-merge operations; pad-pair-group editing is not yet a typed operation. Retain the native itemized DRC and engineering review after a route audit.

## Exports and the release boundary

Use the dedicated `easyeda_control_export` for draft DSN route context, or execution-enabled file entries from `easyeda_control_library` capabilities. Its maintained positional compilers and bounded file decoder are separate from the unreliable generic upstream exporter wrappers. Do not infer support or live validation for every export format from a catalog descriptor.

Provide the exact expected type-3 PCB context and stable fingerprint. Type 15 is rejected. Put `arguments.filePath` in a new `controlDataDirectory/upstream/artifacts/facade-exports/export-<unique>/` directory; the facade creates that private directory exclusively. Provide fresh result and receipt paths below the control data directory. The facade rejects other exporters, existing targets, malformed bytes, symlinks, empty or stale files, and reused evidence paths. It creates the DSN exclusively, synchronizes the file and parent directory before validation, and hash-binds any valid artifact left by a later failure into the failure receipt.

The installed `pcb_ManufactureData.getDsnFile(fileName)` accepts no project, document, or tab argument. The facade checks the exact context before invocation and after generation, but it cannot detect a user switching away and back while the asynchronous operation is pending. Treat the result as active-context/best-effort unless its DSN content is independently cross-checked against a pre-export board signature. Do not call it exact-tab-bound.

The generic upstream `easyeda_bom_export` wrapper is not file proof. Use the typed library/export capability when execution-enabled, or target-bound BOM read evidence. Claim an artifact only after managed byte/hash verification.

For a fabrication candidate, generate manufacturing outputs through a separately verified current-version workflow only after saved and reopened verification, final checkpoint verification, itemized DRC review, stack and rule audit, and the project's release gates. Draft DSN output may happen earlier when the user requests it, but label it as draft evidence.

Verify that the reported output path exists and that its hash matches the receipt. For an archive or directory export, retain its manifest and per-file hashes when supplied. Check expected file families and nonzero sizes. A successful exporter return and matching hash prove output generation, not electrical correctness, manufacturability, or fabrication approval.

DSN export supplies route context to an external router. Reimporting routed data is a separate mutation and is not authorized by the export call. Manufacturing submission, ordering, and purchasing remain outside this skill unless the user separately requests them and a controlled capability exists.
