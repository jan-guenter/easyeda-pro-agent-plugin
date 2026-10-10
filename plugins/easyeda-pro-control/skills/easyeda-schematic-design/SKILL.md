---
name: easyeda-schematic-design
description: Design, redraw or verify EasyEDA Pro schematics with readable circuit structure and pin-level electrical checks. Use for schematic capture, hierarchy, wiring and presentation changes. Not for bridge setup, PCB routing or a general electronics audit.
---

# EasyEDA schematic design

Make the schematic explain the circuit and preserve the intended electrical graph. A clean drawing and a correct netlist are separate deliverables.

For a live EasyEDA task, read the sibling [control skill](../easyeda-pro-control/SKILL.md) before application actions. For supplied files, PDFs or screenshots, work offline; do not connect to the editor just to review them. Screenshots alone cannot prove connectivity.

The current compiled-topology reader is disabled because its installed netlist
exporter can annotate parts and invoke Save All. Schematic transactions needing
that proof are blocked pending a verified non-mutating replacement. Native
per-page pin observations are useful, but do not substitute for complete
hierarchical connectivity. Do not bypass the refusal or replay historical edits.

## Choose the work

- For new circuits or functional changes, read [capture and circuit checks](references/capture-and-circuit-checks.md). Identify exact devices, supply limits, interface requirements and unresolved choices before committing to connections.
- For wiring, hierarchy, ports or electrical verification, read [Pro connectivity](references/pro-connectivity.md). Distinguish local names, global nets, physical pin numbers and display attributes.
- For a redraw, label cleanup or page organization, read [readability and acceptance](references/readability-and-acceptance.md). Preserve the complete pin-to-net and no-connect baseline unless the user requested a circuit change.

Apply only the parts of these references relevant to the circuit. Tutorial defaults are not project requirements. Use the actual component datasheets and project conventions for electrical choices.

## Working contract

1. Establish the target pages and whether the request changes circuitry or presentation. Keep component designators, part identity, pin numbers, net intent and assembly choices separate from their drawn positions.
2. Define the expected delta and collateral invariants. For a presentation-only change, preserve every physical pin's net, active no-connect state, component value and library binding. Labels may be electrically meaningful even when their text is hidden.
3. Plan coupled component and wire changes together. Use exact connection anchors and current grid; do not infer a junction from a crossing or a shared pixel.
4. For live edits, use supported typed transactions with current context and capabilities. If an adapter refuses the source shape, retain the evidence and diagnose it; do not replace it with arbitrary JavaScript or silently broaden a verifier.
5. Check the electrical result independently and inspect a legible overview plus closeups. For live saved work, follow the control skill's durable-result verification. Report missing pages, stale compilation or incomplete persistence as limits, not success.

A request to improve a drawing does not authorize PCB synchronization, library-wide updates, renumbering, fabrication or a new circuit. After an ambiguous mutation, inspect the existing transaction; never replay a completed edit or issue an extra Save.

## Handoff

State which pages changed, whether the circuit changed, what electrical and visual evidence was checked, and what remains uncertain. Keep findings specific to the supplied design. Do not use an ERC pass as proof of datasheet compliance.
