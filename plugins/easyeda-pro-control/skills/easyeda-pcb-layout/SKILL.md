---
name: easyeda-pcb-layout
description: Plan, route or improve EasyEDA Pro PCB layouts using the actual stackup, fabrication constraints, return paths and circuit requirements. Use for placement, routing, copper, signal integrity and thermal layout. Not for library creation or manufacturing submission.
---

# EasyEDA PCB layout

Treat placement, outgoing current and return current as one problem. Set rules from the chosen manufacturing process and electrical requirements before optimizing the drawing.

For live editing, read the sibling [control skill](../easyeda-pro-control/SKILL.md). For offline files or images, review what they can establish without launching or modifying EasyEDA. A screenshot does not expose the complete stack, rules, nets or filled copper.

## Read for the task

- For stackup, rules, floorplanning, placement or ordinary routing, read [stack, rules and placement](references/stack-rules-and-placement.md).
- For clocks, differential pairs, buses, RF or sensitive analog nets, read [return paths and critical signals](references/return-paths-and-critical-signals.md).
- For converters, high current, decoupling, heat removal or connector protection, read [power, thermal and protection](references/power-thermal-and-protection.md).

Do not load all references for a small edit. Follow the exact device's layout guidance and the selected fabricator's current process data. Minimum manufacturing geometry is not a preferred design target, a current rating or an insulation rating.

## Work from constraints

Establish board outline, holes, enclosure, connector positions, height limits, assembly sides, stackup and critical nets. Record unknowns. If the stack or protocol constraints are missing, provide a provisional layout plan and bounded checks; do not invent impedance dimensions or certify fabrication readiness.

For changes to an existing board, define the affected area, nets and expected connectivity delta. Preserve locks and unrelated layout. Shared rule, stack, footprint or copper-priority changes can affect the whole board; inspect that scope before applying them.

Plan mechanical and critical-circuit placement first, then routes. Check the reference plane under each critical route and at layer transitions. Keep power switching loops and quiet sensing paths explicit. Do not tune lengths until endpoints, topology and timing requirements are known.

Use current typed capabilities for live edits. Rebuild copper through a supported operation when needed and verify the resulting connected fill, not merely its boundary. Run itemized DRC under recorded rule settings, inspect unconnected nets and review physical/electrical behavior separately. Verify saved results through the control workflow before claiming completion.

## Report

Give the changed region and nets, applicable constraints, measured or calculated checks, and unresolved risks. Name missing stack or datasheet evidence. Route length, DRC, a 3D preview and a successful export each prove different things; none alone proves a working board or permits an order.
