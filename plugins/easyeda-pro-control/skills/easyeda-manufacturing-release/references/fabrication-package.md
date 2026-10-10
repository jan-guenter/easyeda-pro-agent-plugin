# Fabrication package

Research checked: 2026-10-10. Requirements belong to the chosen board process and supplier. An export format's capabilities do not prove an exported design is manufacturable.

## Establish one release baseline

Identify the saved board revision, schematic revision, library revisions and assembly variant. For live work, use supported saved-state verification and record the export operation's evidence. For offline work, identify supplied file hashes and their stated source; do not claim they match an unavailable CAD project.

Collect actual stackup and board specifications: layer order and function, dielectric/copper thickness, finished thickness, material, finish, solder-mask and legend requirements, impedance constraints and mechanical tolerances. Include plated/nonplated holes, blind/buried vias, controlled-depth features, edge plating or castellations only when the process supports and the design requires them.

Use the selected supplier's current capability table for the exact layer count, copper weight and process options. Capabilities differ between process classes; a displayed minimum trace value is not a recommendation for every net. Establish additional safety or product constraints independently. [JLCPCB capabilities](https://jlcpcb.com/capabilities/pcb-capabilities/).

## Pre-export checks

Check the actual board, not only its last log:

- Schematic-to-PCB association, intentional exclusions and current netlist alignment.
- Required rule sets, clearance exceptions and unresolved items, with rationale and owner.
- Unrouted connections and intended net-tie behavior.
- Copper pour rebuilt as required and inspected for connectivity, islands, thermal connections and changed clearances.
- Board outline closure, cutouts, slot definitions, mechanical features and edge clearance.
- Stack/layer assignment, mask/paste openings, exposed-pad treatment and polarity markings.
- Applicable electrical, thermal, signal-integrity and mechanical reviews beyond DRC.

A cleared result panel is not a recalculation. An unrouted warning that the export dialog lets the user bypass remains an unresolved design issue unless deliberately reviewed. Pro's Gerber export supports configurable layers, primitive filters, mirroring, units and saved settings; inspect them instead of assuming a prior preset fits this board. [Pro fabrication export](https://prodocs.easyeda.com/en/pcb/export-pcb-fabrication-file-gerber/), [Pro DRC](https://prodocs.easyeda.com/en/pcb/design-check-drc/).

## Export without losing provenance

Export to a task-owned, uniquely identified release directory. Do not overwrite the previous release or unrelated files. Record selected settings, software/version, source revision, time and artifact hashes. Separate fabrication files from assembly files and editable archives.

Build an artifact inventory with purpose, units and expected presence. Depending on the process, it may include:

- Copper image for every physical copper layer.
- Solder-mask and legend images for the intended sides.
- Clearly identified board profile and internal cutouts.
- Plated and nonplated drill data, slot/routing data and a readable drill summary.
- Fabrication drawing or notes identifying stackup, finish, thickness and special requirements.
- Impedance or other controlled-process requirements where applicable.
- A machine-readable layer/job manifest when the exporter and supplier support it.

Paste files ordinarily serve assembly stencil preparation; include them in the correct handoff rather than conflating paste with solder mask. A mechanical layer's existence alone does not establish that the supplier will interpret it as the profile or route layer.

Gerber describes layer images and supports attributes such as file function and polarity. The job format can carry board information that is not represented by a copper image alone. Determine what the exported files actually contain, and what the supplier accepts. Ucamco is the format owner; its downloads page listed Gerber layer specification revision 2026.05 when checked. This does not prove any EasyEDA version implements that revision. [Ucamco Gerber](https://www.ucamco.com/en/gerber), [official specifications](https://www.ucamco.com/en/gerber/downloads).

## Inspect the exported data independently

Use a local viewer or parser that supports the exported formats. A browser-hosted viewer uploads or discloses files unless proven otherwise; do not send private designs to it without authority.

Check at several scales:

1. Overall size, board orientation, outline closure, cutouts and layer alignment.
2. Drill counts/types, actual hole positions, slots and plausible plated/nonplated classification.
3. Positive/negative polarity and physical layer order, especially plane layers.
4. Pads, traces, pours, mask expansion, solder-mask bridges and paste apertures at representative fine-pitch and high-current areas.
5. Connector edges, mounting features, silkscreen polarity and copper-to-edge constraints.
6. Any special feature's representation and explicit supplier instructions.

Compare dimensions against a known feature and the specified board extent. Check for duplicate outlines, accidental mirrored layers, offset drills and missing internal layers. File names help organize the package but do not prove image function or units.

Rendered geometry cannot prove all electrical connectivity. If sufficient source/netlist and parser data are available, compare them; otherwise state the limit. A correct-looking Gerber view, a zero-error DRC report and a successful export each answer different questions.

## Verdict

Report “exported and independently inspected” when that is the evidence. Reserve “ready for fabrication review” or “ready for the specified fabrication process” for the checks actually completed. Do not claim generic IPC compliance, regulatory certification or safety approval from public standard summaries or visual inspection.
