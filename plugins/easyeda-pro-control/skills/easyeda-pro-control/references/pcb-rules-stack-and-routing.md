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

The public configuration getter can fall back to a global JLC default. A returned configuration name is not by itself proof that a project-specific configuration persisted; corroborate it with the actual rule collections and saved/reopened state.

The installed public DRC APIs can also create groups and overwrite rule collections, but the guarded facade exposes no rule writer. These calls cannot appear in a mutation plan. A future writer must clone the complete collection, patch only intended fields, validate total net coverage and uniqueness, submit once, and compare every unrelated row after reopen.

After apply, verify:

- every expected net appears exactly once where required;
- no unknown or duplicate net was introduced;
- each class and net has the intended numeric profiles;
- pair names and member nets are exact;
- unrelated rules match the baseline.

In the baseline API, public net-rule overwrite accepted spacing, track, and via profiles but ignored a differential-pair physics profile. Do not claim pair width, gap, or mismatch from the public assignment alone.

## Differential-pair physics

The baseline native pair-manager calls are `private-version-pinned`. Read all manager rows, build the complete desired rows, apply once, and read all rows again. In that build, the selected physics profile lived on the pair row while child-net rows stayed `default`. Verify the storage model for the current build before interpreting that state.

Pair identity and pair physics are separate assertions. Routing proof also needs actual member widths, intrapair spacing, length mismatch, reference plane, layer transitions, and clearance to other copper.

## Physical stack

No safe typed public setter or complete facade-owned stack reader was established in the baseline. Stack entry uses EasyEDA's visible Layer Manager and is a `visible-ui-gate`. A private readback through `PhysicalStackingConfig` may verify saved rows when the exact version matches, but it is outside the guarded plan. The generic `easyeda_board_stackup` result is a reduced advisory summary.

Validate row order, IDs, conductor or dielectric type, thickness, material, dielectric constant, mask properties, and total construction. User-editable row names are not electrical identity. Use the fabricator's current construction, not values copied from another board.

## Placement-to-routing gate

Do not route around unresolved placement. Before routing, freeze topology, mechanical isolation, local bypass and hot-loop placement, Kelvin origins, crystals, ESD devices, connector launches, and differential-pair corridors.

For a board expected to have blank copper, count signal-layer netted lines, vias, regions, pours, and fill objects and refuse the operation when the assumption is false.

The public guarded state machine currently rejects track and via creation. Their generated primitive IDs cannot be substituted into the frozen rollback/verifier specs, and the typed catalog lacks complete pad, unrouted-graph, connectivity, and callable itemized-DRC proof. Add those capabilities before guarded routing. In a separately reviewed workflow, apply routing only in bounded net or functional groups and verify actual primitives, nets, layers, widths, clearances, via geometry, and connectivity after each group. A route command's success value is not proof of connectivity or rule compliance.

Establish reference planes after critical routing is stable. Add one power polygon at a time, verify its net and isolation, then add thermal and stitching vias. Do not use temporary pours to hide incomplete placement or routing.

Run the relevant native DRC and inspect itemized results before fabrication release. This remains a visible/native gate in the current facade: the upstream DRC trigger is not a guarded read and the aggregate summary is not an itemized disposition. Aggregate counts alone cannot disposition rule violations.

## Exports and the release boundary

Use `easyeda_control_export` rather than a generic read, mutation plan, or raw script. The facade currently allows only `easyeda_pcb_export_route_context` for DSN. The upstream Gerber, netlist, PDF, and pick-and-place adapters pass option objects to installed positional APIs, so their requested formats/options are not proven and they are excluded.

Provide the exact expected type-3 PCB context and stable fingerprint. Type 15 is rejected. Put `arguments.filePath` in a new `controlDataDirectory/upstream/artifacts/facade-exports/export-<unique>/` directory; the facade creates that private directory exclusively. Provide fresh result and receipt paths below the control data directory. The facade rejects other exporters, existing targets, malformed bytes, symlinks, empty or stale files, and reused evidence paths. It creates the DSN exclusively, synchronizes the file and parent directory before validation, and hash-binds any valid artifact left by a later failure into the failure receipt.

The installed `pcb_ManufactureData.getDsnFile(fileName)` accepts no project, document, or tab argument. The facade checks the exact context before invocation and after generation, but it cannot detect a user switching away and back while the asynchronous operation is pending. Treat the result as active-context/best-effort unless its DSN content is independently cross-checked against a pre-export board signature. Do not call it exact-tab-bound.

`easyeda_bom_export` is not allowlisted because its current upstream wrapper does not write the requested file. Use target-bound `easyeda_bom_generate` as read evidence, or add and test deterministic serialization in the facade before claiming a BOM artifact export.

For a fabrication candidate, generate manufacturing outputs through a separately verified current-version workflow only after saved and reopened verification, final checkpoint verification, itemized DRC review, stack and rule audit, and the project's release gates. Draft DSN output may happen earlier when the user requests it, but label it as draft evidence.

Verify that the reported output path exists and that its hash matches the receipt. For an archive or directory export, retain its manifest and per-file hashes when supplied. Check expected file families and nonzero sizes. A successful exporter return and matching hash prove output generation, not electrical correctness, manufacturability, or fabrication approval.

DSN export supplies route context to an external router. Reimporting routed data is a separate mutation and is not authorized by the export call. Manufacturing submission, ordering, and purchasing remain outside this skill unless the user separately requests them and a controlled capability exists.
