# Physical and production review

Research checked: 2026-10-10. Review the physical implementation of the actual current paths, package terminals and manufacturing process.

## Library and package integrity

Correlate manufacturer terminal numbers to symbol pins, footprint pads and board nets. Check exact package suffix, pin 1, polarity, exposed pads, multipart ownership, connector perspective and plated/nonplated mechanical features. A correct schematic netlist does not prove that a wrong footprint connects the silicon correctly.

For detailed mapping and land-pattern work, use the sibling component-library skill. For review, retain findings and proposed corrections; do not edit the library unless requested. Look for shared-definition impact before recommending a change to one instance.

Review assembly geometry: pad/lead fit, drill tolerance, mask/paste, package keepouts, enclosure, connector mating, fasteners, servicing and fixture access. The fabricated board must use the agreed material, thickness, finish and tolerances. Inspect the chosen fabricator's actual process constraints. [JLCPCB capabilities](https://jlcpcb.com/capabilities/pcb-capabilities/).

## Follow signal and return paths

Evaluate actual reference planes beneath critical traces, including voids caused by pads, antipads, cutouts and pours. Check where a return path crosses a discontinuity or changes layers. A nearby ground label or large copper percentage does not establish a low-impedance return.

For fast interfaces, establish required impedance, skew, length/delay limits, topology, termination, stubs, via effects and layer transitions from the interface and device requirements. Edge rate matters even if repetition frequency is low. Do not apply one differential pair's geometry or spacing rule to all interfaces. [TI high-speed layout guidance, SLLA414 revision A](https://www.ti.com/lit/an/slla414/slla414.pdf).

Do not cut “analog” and “digital” ground planes solely because the schematic uses those names. Partition functions and noisy currents, inspect the actual return routes, and follow the device's grounding requirements. Newer ADI guidance discusses a continuous plane for common low-digital-current mixed-signal cases; older MT-031 discusses other grounding arrangements. Their contexts must be reconciled, not merged into a universal split-plane prescription. [ADI mixed-signal layout guidelines](https://www.analog.com/en/resources/analog-dialogue/articles/what-are-the-basic-guidelines-for-layout-design-of-mixed-signal-pcbs.html), [MT-031](https://www.analog.com/media/en/training-seminars/tutorials/MT-031.pdf).

## Power, heat and protection

Find the switching-current loops and sensitive sense/control paths. Check capacitor placement by connection path and loop area, not physical distance alone. Review switch-node coupling, high-current paths, current sharing and connector return structure. Follow the converter's exact topology and recommended layout rather than assuming every converter has the same hot loop.

Establish thermal evidence with board copper, vias, package attachment, ambient, airflow and enclosure. A package's quoted thermal resistance is not a universal value for every board. Distinguish electrical current capacity, acceptable voltage drop, transient heating and thermal spreading. IPC identifies current-carrying and board-design standards, but publicly available summaries cannot supply a complete numerical qualification. [IPC design standards](https://www.electronics.org/ipc-design-standards).

At external interfaces, review protection placement, protected/unprotected routing, clamp path and discharge return. Confirm voltage/clamping, capacitance, surge/ESD energy and normal-operation compatibility from the exact devices and environment. A TVS symbol on the schematic does not prove board-level protection. Safety creepage/clearance also depends on the applicable equipment requirements and environment, not ordinary signal DRC.

For more detail, route to the sibling PCB-layout references. Do not claim that a tutorial checklist establishes SI/EMC, thermal or safety compliance.

## DRC and production evidence

Inspect which rules ran, their inputs and when they were calculated. Rules may be default, per-net or additional constraints, with differing priorities. Confirm the installed version's actual policy instead of assuming the default settings express all requirements. [Pro design rules](https://prodocs.easyeda.com/en/pcb/design-design-rule/), [Pro DRC](https://prodocs.easyeda.com/en/pcb/design-check-drc/).

Separate these questions:

| Evidence | Answers | Does not alone answer |
| --- | --- | --- |
| ERC/netlist | Selected logical checks and connections | Package mapping, analog behavior, assembly |
| PCB DRC | Enabled geometric/net constraints | Correct ratings, return quality, safety certification |
| Gerber/drill inspection | Exported geometry and process representation | Full circuit correctness |
| BOM/placement reconciliation | Assembly identities and coordinate consistency | Silicon performance or approved substitutions |
| Prototype measurement | Behavior under tested conditions | Untested corners and production variability |

Check one revision across source, fabrication and assembly files. Identify DNP, hand-placement and mechanical exclusions explicitly. A correct count with different designator sets is not consistency. Review supplier transformations such as bottom-side mirroring and rotation conventions if assembly data is supplied.

## Scope-aware verdict

A schematic-only review can flag missing thermal or layout evidence, but cannot declare an unseen PCB defective. A screenshot-only layout review may identify a clear route across a plane gap, but cannot assert every net or copper island is connected. State these boundaries alongside actionable findings.

Use risk prioritization: safety/energy hazards first, then function and expensive rework, then margin/reliability, then clarity and maintainability. A cosmetic issue should not displace a confirmed pinout or supply defect.
