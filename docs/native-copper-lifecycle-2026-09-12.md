# Native copper reload and clear representation

The reviewed PCB bundle is `pro-pcb/3.2.149.5378b690/js/pcb.js`, SHA-256
`65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54`.
These are fixed adapter contracts, not permission to execute caller-supplied code.

## Arc reload

The native `JCe` loader reconstructs copper paths through `Ru`. Arc operands pass through `pointToAngle`, degrees/radians conversion and `q.build2`. The `gc.source` getter serializes those primitives through `rf`, recomputing arc starts, terminal arc ends and sweep angles. `OEt` receives the default multiplier of one; no unit conversion is involved. The corresponding bundle offsets are 4,114,961 (`JCe`), 3,851,981 (`Ru`), 3,848,455 (`pointToAngle`) and 3,850,201 (`rf`).

A disposable-fixture rebuild had exact worker-to-live-source proof. Save/reopen changed seven exported numeric leaves: six arc angles and one arc-start coordinate, by one to four binary64 representable steps. The closed-app checkpoint retained the original worker geometry exactly. Independent persistence comparison passed all 13 materialized documents against that original verified source. This explains a representation mismatch; it is not clearance, connectivity or fabrication approval.

`copper-lifecycle.ts` keeps every original source and hash. Its comparison permits at most four ULP only in the reviewed arc-derived operand positions of changed `POURED` paths. Commands, array structure/order, child IDs, widths, fills, parent POURs and every unrelated record remain exact. Straight-line endpoints and circle operands receive no tolerance. Changed paths with unsupported commands, arcs below six degrees or at least a full revolution, degenerate arcs, nonfinite values, sign/zero crossings, or coordinates beyond one million native units are refused. Four ULP is a narrow admission limit, not a universal error bound for the native geometry engine; it is not expanded automatically.

Commit still requires exact durable equality with the original verified worker source. Its separate reload report lists each changed operand, both values, ULP count, absolute difference and both raw source hashes. Recovery additionally requires the retained, hash-verified successful save/close/reopen acknowledgment bound to the exact after-phase read commitment. It then proves current source and the complete durable edit without another Save. The original after-source remains immutable; differences are not accumulated across successive observations. Design phase reads have a fixed private 16 MiB limit and retain managed-file, size and hash checks.

## Clearing derived copper

The pinned `pcb/extensionAPI/poured-delete` handler deletes children of the selected parent in one native history group. The parent POUR remains. Native `kT.upload` therefore calls `uploadPoured` with `TN.encode("POURED", [])`; the 2.0 field format is `pourFill`, and `g3` returns an empty array. Durable storage retains exactly `{pourFill:[]}` for that parent-derived record.

The public `SYS_FileManager.getDocumentSource` route instead calls PCB `FileSource`, which uses the live export builder. `feedCopper` groups existing child models only, so the empty derived record is absent from that export. Relevant offsets are 10,298,779 (delete handler), 4,684,600 (upload path), 4,714,835 (`g3`), 4,731,197 (`feedCopper`) and 10,685,115 (`FileSource`).

`copper-persistence.ts` recognizes only this explicit clear operation: a previously nonempty target, unchanged parent, exact authorized export deletion, and one exact empty durable record. It checks the pre-load derived record against its fixed durable reference with the arc contract above. All other records, fields and documents retain the ordinary strict persistence proof. Empty records are not globally ignored.

The focused regressions cover the observed arc drift, larger geometry edits, straight endpoints, command/identity/style changes, retained acknowledgment binding, and the single-target empty-record projection. Connected validation of the new recovery and clear integration remains separate from these offline tests.
