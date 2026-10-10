# Stack, rules and placement

Research checked 2026-10-10. This is a constraint-driven workflow. Recheck manufacturer process data for the actual release; online documentation and defaults change.

## Build the constraint set

Record outline and cutouts, mounting holes, connector datum, enclosure interference, component height, mating direction, assembly sides, keepouts, service access and test access. Set mechanical anchors before optimizing ratline length. A board can pass electrical DRC and still not fit its enclosure.

For the chosen process, record layer count, total thickness, copper weights, dielectric construction, material and finish. Obtain permitted trace/space, drill, annular ring, edge/copper, slot and mask constraints for that exact option. JLCPCB's capability table varies by copper, layers and feature type. Its figures are manufacturing constraints, not universal layout defaults. [Official JLCPCB capabilities](https://jlcpcb.com/capabilities/pcb-capabilities/)

Keep three classes of rule separate:

| Rule source | Examples | Required evidence |
| --- | --- | --- |
| Manufacturing | Drill, ring, mask web, slot, copper-to-edge | Selected fab/process data |
| Electrical | Impedance, current, timing, noise, voltage separation | Datasheet, calculation or applicable standard |
| Mechanical/assembly | Connector, courtyard, tool and enclosure clearance | Drawing, assembler or physical tolerance stack |

Missing stackup makes exact impedance geometry unknown. Missing working voltage/environment makes safety spacing unknown. Provide a provisional plan if useful, but do not invent those constraints.

## Assign layers and rules

Choose reference layers for critical nets before routing. A layer color or name is not a physical stack. Verify actual copper layer order, dielectric thickness and material. EasyEDA's layer manager distinguishes positive signal layers from negative internal-plane layers; a line on a negative layer represents removed copper rather than a conductor. Inspect export polarity and actual plane behavior. [Pro layer manager](https://prodocs.easyeda.com/en/pcb/tools-layer-manager/)

Set fabrication defaults with suitable process margin, then net/class-specific electrical constraints. Confirm precedence and which nets actually receive each rule. Pro supports default and additional rules; a named custom rule is not proof it applies to the intended objects. [Pro design rules](https://prodocs.easyeda.com/en/pcb/design-design-rule/)

Define the differential pairs and their actual polarity members, length groups and endpoints. Inspect automatically generated memberships for mistaken name matches. Pro requires pair creation and rule setup before its differential routing workflow. [Pro pair manager](https://prodocs.easyeda.com/en/pcb/design-differential-pair-manager/)

Do not lower a global clearance rule to admit one difficult area. Resolve the specific requirement, propose a scoped exception only when justified, and retain its reason and validation. Electrical insulation may require constraints that ordinary copper-clearance checks do not model. [TI creepage/clearance tutorial](https://www.ti.com/video/6146024211001)

## Floorplan by interaction

Place fixed mechanics, connectors and mounting features first. Then place critical subcircuits by their actual current and signal paths. Keep converter hot loops, reference/sense paths, clocks, differential connections and analog front ends compact where their device guidance requires it. Leave routes and return paths feasible, not merely short in ratline distance.

Plan service, programming and manufacturing access early. A test pad hidden under a connector is not usable access. Check probe/nozzle/tool clearance, component height, soldering access and any required fiducials with the assembler.

Reserve room for routes and copper. Check IC escape feasibility at actual pad pitch, route/via rules and stack. If breakout requires unsupported HDI or via-in-pad construction, flag that before completing placement.

For analog/digital regions, separate noisy sources and sensitive victims by floorplan and return-current path. Do not cut a ground plane just because labels say AGND and DGND. See the return-path reference for device-specific grounding decisions.

## Existing-board changes

Retain locked geometry, nets, critical routes and known tuning unless the task authorizes changes. Build an affected-area list that includes displaced neighbor parts, mask/assembly effects and filled-copper changes. Moving one footprint can alter more than its center position.

Shared footprint edits, stack changes and global rule changes need board-wide review. Keep an existing layout's verified assumptions unless the requested change invalidates them; do not run autoroute or autoplacement simply because the API exposes it.

## Copper and finishing

Assign each region its intended net, layer, clearance, connection style and priority. Inspect narrow necks, disconnected islands, thermals, antipads and return-path obstructions after a supported rebuild. Boundaries alone do not prove electrical fill.

Pro's copper manager can reorder pours and manage their net/layer configuration. Priority changes can alter overlapping areas beyond the selected shape. Inspect the rebuilt result and saved evidence rather than treating a changed list row as acceptance. [Pro copper manager](https://prodocs.easyeda.com/en/pcb/tools-copper-manager/)

Run current itemized DRC with recorded enabled checks, inspect unconnected nets and do a mechanical/assembly view. DRC evaluates configured rules, and clearing its displayed errors does not calculate a new result. [Pro DRC manual](https://prodocs.easyeda.com/en/pcb/design-check-drc/)

## Working output

Leave a concise board-constraint table, annotated placement/routing decisions, unresolved constraints and check evidence. Keep measured route properties distinct from inferred current, temperature or compliance. For release packaging, use the manufacturing skill rather than turning an editing task into an order.
