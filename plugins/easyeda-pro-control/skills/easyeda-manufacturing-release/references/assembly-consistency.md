# Assembly consistency

Research checked: 2026-10-10. BOM, placement, stencil data and assembly drawings must describe the same board revision and variant.

## Confirm the assembler's conventions

Obtain current required columns, units, side names, angle direction, coordinate origin and zero-angle definition. Establish whether bottom-side coordinates or angles should be mirrored, and who applies that transform. Avoid applying a mirror both in the CAD export and the assembler import.

EasyEDA Pro's placement export distinguishes Mid X/Y, Ref X/Y and Pad X/Y, offers mm/mil and bottom-side mirroring options, and exports from the PCB. Its documented Mid coordinate relates to pad geometry, while Ref refers to the footprint origin. Neither is automatically the assembler's physical pick point. [Pro placement export](https://prodocs.easyeda.com/en/pcb/export-pick-and-place-file/).

For JLCPCB's documented process, placement uses designator, Mid X/Y in millimeters, layer and rotation; its help describes positive angles counterclockwise. Their current BOM guidance requests designators and part information, and warns that designators are normalized to uppercase in production. These are supplier-specific conventions, not global CSV semantics. Both pages were updated September 9, 2026 when checked. [JLCPCB placement file](https://jlcpcb.com/help/article/pick-place-file-for-pcb-assembly), [JLCPCB BOM](https://jlcpcb.com/help/article/bill-of-materials-for-pcb-assembly).

Do not silently adapt an existing release to another assembler. Record the conversion and independently verify it.

## Build a purchasing-safe BOM

Include the required identity and qualification fields: exact MPN, manufacturer, value/function, package, quantity, designators, variant/DNP state and relevant ratings/tolerances. Supplier stock codes can help sourcing, but preserve manufacturer identity. A “10k” value alone does not establish package, power, voltage coefficient or tolerance.

Treat spreadsheets and CSVs as typed records. Preserve MPN leading zeros, punctuation and significant suffixes; check for auto-converted dates, scientific notation and formulas. Verify separator, quoting, encoding and units rather than eyeballing a spreadsheet screenshot.

Pro BOM export supports different scope and configurable fields. Establish whether it was generated from the schematic or PCB and whether variant filters, fields or saved preferences removed data. Do not assume a displayed quantity includes only populated parts. [Pro BOM export](https://prodocs.easyeda.com/en/schematic/export-bill-of-materials-bom/).

For each BOM row:

- Expand its designator list and compare quantity to unique intended populated instances.
- Detect duplicate designators across rows, including case-insensitive collisions if the supplier normalizes case.
- Check MPN/package correspondence to the actual approved device and footprint.
- Keep DNP entries separate or clearly tagged according to the assembler's accepted format.
- Distinguish alternates from the approved fitted part. A listed alternate is not an automatic substitution approval.

Group parts only when the actual purchasing/assembly specifications agree. Two resistors with the same value but different rating, tolerance or package are not necessarily one line item.

## Reconcile the file sets

Compare designator sets, not just totals:

| Set | Expected treatment |
| --- | --- |
| Populated automated-placement parts | BOM and placement, unless the agreed process says otherwise |
| DNP parts | Explicit variant exclusion; no accidental population |
| Hand-installed / through-hole parts | BOM and assembly instructions; placement handling agreed |
| Mechanical features / test pads | Explained if present in CAD but absent from purchasing/placement |
| Fiducials | Recognized as alignment features, not purchasable components |

Check quantity, exact board/variant revision and package names across BOM, placement and assembly drawing. Net labels and schematic units do not substitute for unique physical package designators.

## Verify position and rotation

Overlay or otherwise compare placement coordinates to the exported board geometry. Use at least one asymmetric polarized part and one bottom-side part when present. Establish angle interpretation with pin 1, cathode, key or a known package feature rather than relying on a rectangle.

Check locations are within plausible board bounds and use the correct origin. Review suspicious common offsets, factors of 25.4, swapped axes and side-dependent mirrors. Do not “correct” all rotations by a guessed constant; different library zero-angle conventions or packages may need different interpretation.

Validate the actual assembler preview when it is supplied or authorized to inspect, but do not use a preview to excuse an untraceable export transform. A supplier may rotate or replace CAD-derived package graphics; confirm the intended terminal orientation, not only a model's body.

For parts with off-center mass, odd pad arrangements or nozzle constraints, the geometric pad center may not be a valid pick location. Resolve this with the assembly process rather than changing the electrical footprint origin to make one preview look centered.

## Assembly drawings and process notes

Supply a readable per-side drawing with designators, pin-1/polarity markers and variant omissions. Include special insertion orientation, hardware, heatsinks, thermal-interface materials and manual operations when needed. Keep instructions consistent with the BOM and actual mechanical configuration.

Review stencil requirements, exposed-pad apertures and unusual soldering steps with the assembler. A footprint's paste layer is an input to stencil preparation, not proof that a stencil has been reviewed or manufactured.

Do not purchase parts, approve substitutions, upload files, submit an assembly order or accept supplier waivers unless explicitly authorized. Preparing and checking the package is a separate activity from committing it to production.
