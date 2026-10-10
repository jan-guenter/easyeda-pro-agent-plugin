# Electronics design research for EasyEDA Pro skills

Research checked: 2026-10-10. This document records primary-source research and the resulting task split. It does not assert that any real board was changed, tested or certified, or that a documented GUI function is available through the installed extension bridge.

## Result

Five task skills complement `easyeda-pro-control`:

| Skill | When to use | Supporting references |
| --- | --- | --- |
| `easyeda-schematic-design` | Capture, redraw, connectivity and schematic acceptance | Circuit requirements; Pro connectivity; readability and acceptance |
| `easyeda-pcb-layout` | Stack/rule selection, placement and routing | Stack/placement; return paths and critical signals; power/thermal/protection |
| `easyeda-component-library` | Symbols, footprints, device binding and revisions | Pin mapping; footprint/assembly geometry; shared-definition impact |
| `easyeda-manufacturing-release` | Fabrication/assembly export and release review | Fabrication data; BOM/placement consistency; controlled handoff and bring-up |
| `electronics-design-review` | Evidence-based design audits and proposed tests, including offline work | Requirements/circuit; physical/production; evidence/test planning |

The entrypoints select references by task so an agent need not load every topic. Each distinguishes design reasoning from supported live execution. Offline review does not require a running editor or MCP connection. Research, review and file preparation do not authorize external uploads, purchasing, manufacturing approval, shared-library publication or live design changes.

## Findings that changed the instructions

### Drawing, circuit and saved state are separate evidence

Visual clarity is necessary but cannot prove connectivity. Netlist/source inspection cannot prove that labels and symbols are understandable. Neither proves that the editor's intended changes survived save/reopen. Skills require evidence appropriate to the claim and preserve the control skill's exact mutation/recovery workflow.

EasyEDA Pro's wire labels are wire properties rather than the Standard edition's separate-label model. Wire/global/hierarchy naming and net-port names have distinct roles. A no-connect action changes a pin's property. Therefore, a visually attached label, port or marker must be checked through the actual underlying net/pin records. [Pro wires](https://prodocs.easyeda.com/en/schematic/place-wire/), [net ports](https://prodocs.easyeda.com/en/schematic/place-net-port/), [no-connect](https://prodocs.easyeda.com/en/schematic/place-no-connect/).

### Library corrections can have wider effects than one instance

Placed components can use the project template, and editing it can refresh multiple schematic pages and the PCB. Symbol pin numbering must map to the intended footprint pads; compatible counts alone are insufficient. Component-library instructions now require complete terminal mapping and explicit update scope. [Pro placed devices](https://prodocs.easyeda.com/en/schematic/place-device/), [footprint manager](https://prodocs.easyeda.com/en/schematic/tools-footprint-manager/).

### Generic geometry is not a process specification

Trace/clearance, holes, mask, paste, thermal vias, exposed pads and board-edge features depend on the actual stack, package and production process. The skills collect these inputs before choosing values. Manufacturer package dimensions do not substitute for a recommended land pattern. Public IPC summaries identify relevant standards but do not provide licensed numerical rules. [TI QFN/SON guidance](https://www.ti.com/lit/an/slua271c/slua271c.pdf), [fabricator capability tables](https://jlcpcb.com/capabilities/pcb-capabilities/), [IPC design standards](https://www.electronics.org/ipc-design-standards).

### Current paths and reference continuity matter more than net names

The PCB references trace actual signal, return and switching-current paths. They distinguish a trace's geometry from impedance and delay, and the converter topology from a generic power-layout checklist. Layer polarity and copper-manager scope require inspection before changing or rebuilding copper. [Pro layer manager](https://prodocs.easyeda.com/en/pcb/tools-layer-manager/), [copper manager](https://prodocs.easyeda.com/en/pcb/tools-copper-manager/), [TI SLLA414](https://www.ti.com/lit/an/slla414/slla414.pdf), [TI SNVA886](https://www.ti.com/lit/an/snva886/snva886.pdf).

Mixed-signal grounding is contextual. Older MT-031 and newer Analog Dialogue guidance discuss different arrangements and device/current conditions. The skills do not convert either into a universal split-plane or never-split rule. [ADI MT-031](https://www.analog.com/media/en/training-seminars/tutorials/MT-031.pdf), [ADI mixed-signal PCB guidelines](https://www.analog.com/en/resources/analog-dialogue/articles/what-are-the-basic-guidelines-for-layout-design-of-mixed-signal-pcbs.html).

### A passing checker is not a finished design review

ERC/DRC answer only the enabled checks with their supplied inputs. Electrical operating conditions, package mapping, SI/EMC, thermals, mechanical fit and regulatory requirements need separate evidence. Clearing a report is not recalculating it. The review skill prioritizes concrete failure mechanisms and distinguishes a defect, supported risk and missing information. [Pro schematic rules](https://prodocs.easyeda.com/en/schematic/design-design-rule/), [PCB rules](https://prodocs.easyeda.com/en/pcb/design-design-rule/), [DRC](https://prodocs.easyeda.com/en/pcb/design-check-drc/).

### Export success is not a consistent manufacturing release

Export settings, filters and saved preferences can alter artifact scope. Placement coordinates, reference origins and bottom mirroring are not interchangeable. Supplier conventions must be checked against the actual release. Files are independently inspected and reconciled by revision, variant and designator set, not just component counts. [Pro Gerber export](https://prodocs.easyeda.com/en/pcb/export-pcb-fabrication-file-gerber/), [placement export](https://prodocs.easyeda.com/en/pcb/export-pick-and-place-file/), [BOM export](https://prodocs.easyeda.com/en/schematic/export-bill-of-materials-bom/).

## Primary-source map

Sources were selected for the mechanism or workflow they support. Product-specific examples are not universal constraints. Obtain the actual design's datasheets, errata and supplier requirements before using these pointers to make a verdict.

### EasyEDA Pro

The official manual is a workflow source, not proof of the installed runtime's API or saved-result coverage. Documentation can describe a newer GUI than the tested extension version.

- [Quick start](https://prodocs.easyeda.com/en/quick-start.html): project/document workflow orientation.
- [Symbol creation](https://prodocs.easyeda.com/en/symbol/file-new-symbol-component-symbol/), [pin properties](https://prodocs.easyeda.com/en/symbol/side-panel-right-pin-property/): logical symbols, anchors and numbers.
- [Device creation](https://prodocs.easyeda.com/en/device/file-new-device/), [symbol placement](https://prodocs.easyeda.com/en/symbol/place-symbol/), [footprint properties](https://prodocs.easyeda.com/en/schematic/property-multi-footprint/): version-dependent association workflows.
- [Footprint creation](https://prodocs.easyeda.com/en/footprint/file-new-footprint/index.html), [footprint checks](https://prodocs.easyeda.com/en/footprint/tool-check-rule/), [bound devices](https://prodocs.easyeda.com/en/footprint/side-panel-left-device/): geometry and reuse scope.
- [Schematic-to-PCB update](https://prodocs.easyeda.com/en/schematic/design-update-convert-schematic-to-pcb/): change-list inspection before adoption.
- [Differential-pair manager](https://prodocs.easyeda.com/en/pcb/design-differential-pair-manager/), [length tuning](https://prodocs.easyeda.com/en/pcb/route-equal-length-tuning/), [time equalization](https://prodocs.easyeda.com/en/pcb/design-time-equal-length/): geometric and timing workflows. Availability and inputs must be checked per installed version.

### Semiconductor and passive-component manufacturers

- [TI high-speed interface layout, SLLA414](https://www.ti.com/lit/an/slla414/slla414.pdf): the fetched PDF was revision A, January 2026. Do not use an older search-result date as its revision.
- [TI switching-power layout, SNVA886](https://www.ti.com/lit/an/snva886/snva886.pdf): July 2019; topology-specific layout and coupling mechanisms.
- [ADI MT-031](https://www.analog.com/media/en/training-seminars/tutorials/MT-031.pdf): older mixed-signal grounding tutorial, revision A October 2008; reconcile its context with newer device guidance.
- [ADI mixed-signal PCB guidelines](https://www.analog.com/en/resources/analog-dialogue/articles/what-are-the-basic-guidelines-for-layout-design-of-mixed-signal-pcbs.html): grounding, functional partitioning and device/current-dependent choices.
- [ADI MT-101](https://www.analog.com/media/en/training-seminars/tutorials/MT-101.pdf): decoupling mechanisms; component and mounting parasitics require circuit-specific evaluation.
- [TI thermal guidance, SNVA183B](https://www.ti.com/lit/an/snva183b/snva183b.pdf): board-dependent thermal behavior; package thermal numbers are not a universal board model.
- [TI PowerPAD, SLOA120](https://www.ti.com/lit/an/sloa120/sloa120.pdf), [QFN/SON, SLUA271C](https://www.ti.com/lit/an/slua271c/slua271c.pdf): package/assembly context; older and newer process examples must not be combined blindly.
- [TI ESD layout, SLVA680A](https://www.ti.com/lit/an/slva680a/slva680a.pdf): revision A April 2022; board routing is part of protection performance.
- [TI specification interpretation, SZZA036C](https://www.ti.com/lit/an/szza036c/szza036c.pdf): distinguish operating specifications from stress ratings and typical data.
- [Murata voltage-dependent capacitance](https://article.murata.com/en-eu/article/voltage-characteristics-of-electrostatic-capacitance): verify effective capacitance for the selected component under its operating conditions.
- [Microchip SAM9X75 hardware considerations](https://ww1.microchip.com/downloads/aemDocuments/documents/MPU32/ApplicationNotes/ApplicationNotes/SAM9X75-Hardware-Design-Considerations-DS00004962.pdf), [FPGA design guidelines](https://onlinedocs.microchip.com/oxy/GUID-2952C8AA-A592-489E-8058-3FD06065EDDB-en-US-7/GUID-4A97F84A-A997-452A-A09D-747C71C9E121.html): examples of device-specific design inputs and checklists.
- [Microchip AVR186 oscillator layout](https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-8128-Best-Practices-for-the-PCB-Layout-of-Oscillators_ApplicationNote_AVR186.pdf), [ST AN6134](https://www.st.com/resource/en/application_note/an6134-guidelines-for-crystal-oscillator-design-on-st25-nfc-readers-stmicroelectronics.pdf): oscillator examples; use the chosen oscillator's own requirements.
- [TI creepage/clearance explanation](https://www.ti.com/video/6146024211001): environmental and equipment-standard context, not a universal safety-spacing value.

### Standards, fabrication and assembly

- [IPC design standards](https://www.electronics.org/ipc-design-standards): public scope pointers. No licensed dimensional/current tables or compliance assessment were inferred.
- [JLCPCB capabilities](https://jlcpcb.com/capabilities/pcb-capabilities/): current process-specific constraints; values vary with fabrication options.
- [JLCPCB BOM](https://jlcpcb.com/help/article/bill-of-materials-for-pcb-assembly), [placement file](https://jlcpcb.com/help/article/pick-place-file-for-pcb-assembly): supplier-specific conventions; both help pages showed September 9, 2026 updates.
- [Ucamco Gerber](https://www.ucamco.com/en/gerber), [official downloads](https://www.ucamco.com/en/gerber/downloads): primary format-owner documentation. The layer specification listing was revision 2026.05; this is not an exporter compatibility claim.

## Limits and follow-up

This research supplies reusable decision checks and primary-source routing. It cannot choose a safe trace width, creepage, resistor rating, oscillator capacitor, thermal-via pattern or impedance geometry without the actual circuit, package, environment and stack. It does not establish manufacturing or regulatory compliance.

The skills contain no private project inventory or live-operation scripts. Their engineering conclusions and workflows should be behavior-tested on representative prompts, including missing-input cases, presentation-only redraws, mirrored connectors, split-plane suggestions, incomplete export packages and review-only requests. Capability expansion and operation lifecycle testing belong to the control implementation, not these research references.
