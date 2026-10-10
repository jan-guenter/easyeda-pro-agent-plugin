# Return paths and critical signals

Research checked 2026-10-10. Select the sections that match the actual circuit. A tutorial for one protocol or converter does not supply universal numerical rules for every board.

## Follow the full current path

Trace source, outgoing conductor, load and return. For fast signals, the adjacent reference plane provides a low-impedance return; slots and reference changes can enlarge the loop and disturb signal integrity. Prefer a continuous suitable reference under critical routing. At transitions between connected ground references, provide an appropriate nearby return connection and review the via geometry. [TI SLLA414A, sections 3.4–3.5, revised January 2026](https://www.ti.com/lit/an/slla414/slla414.pdf)

Make a route audit explicit:

- Actual endpoints and layer sequence.
- Reference plane under every segment and any gap, edge or antipad cluster.
- Signal and return transition at each via.
- Termination, connector, test pad, stub and package discontinuity.
- Relevant impedance and timing constraint, with its source.
- What the measurement includes, excludes or cannot resolve.

A wide copper shape elsewhere does not repair an interrupted reference directly under a fast route. A net label saying GND does not prove that its filled regions are connected at the relevant frequency.

Never bridge a deliberate galvanic-isolation barrier with a ground via or capacitor merely to "improve the return path". Such a connection changes the isolation design and needs the relevant functional, leakage and safety requirements. Rerouting within one side may be the correct remedy.

## Mixed-signal grounding

AGND/DGND labels describe device connections; they do not automatically prescribe two PCB planes. Read the specific device datasheet and reference-board rationale. Identify digital, analog, power and cable currents before choosing the join structure.

ADI's newer mixed-signal guidance favors one continuous plane for a single converter with low digital current and discusses different handling for more complex systems. MT-031 is an older tutorial that also discusses split/star configurations and their system-level limitations. Neither should be reduced to a universal "always split" rule. Use the actual device requirements, floorplan, routing and measured noise to decide. [ADI mixed-signal layout guidance](https://www.analog.com/en/resources/analog-dialogue/articles/what-are-the-basic-guidelines-for-layout-design-of-mixed-signal-pcbs.html), [ADI MT-031](https://www.analog.com/media/en/training-seminars/tutorials/MT-031.pdf)

State the intended noisy-current route and sensitive-reference route in the review. If a split is required, keep critical signals from inadvertently crossing it and identify the authorized coupling/join. If a continuous plane is used, still separate noisy switching paths from sensitive circuits. Copper connectivity alone is not a noise analysis.

## Differential pairs and controlled impedance

Use the specific interface's impedance, skew, channel loss and routing requirements. Derive width/gap from the actual layer construction and production tolerance, using a suitable solver or the fabricator's approved calculation. Do not copy 90 Ω or 100 Ω into every differential interface.

Inspect pair symmetry, polarity, fanout, spacing changes, neckdowns, coupling interruptions and vias. Review connector and package contributions, not just straight traces. Pair names alone do not prove correct membership. Use endpoint-aware measurements when branching or series components divide a net.

TI's protocol-oriented guide covers pair spacing, symmetry, stubs, vias and coupling-capacitor discontinuities. Its specific dimensions apply within that documented context. Preserve a consistent route geometry and investigate discontinuities rather than importing every example as a global rule. [TI SLLA414A, section 4](https://www.ti.com/lit/an/slla414/slla414.pdf)

## Length versus delay

Start with topology and a timing budget. Determine which endpoints, packages, vias, series components and layers the budget includes. Then set matching or absolute limits for the actual protocol. Equal planar lengths can have different delay on different layers; a measured polyline does not include unknown package or via delay.

Place tuning where it preserves clear reference and reasonable separation. Avoid adding unnecessary meanders to already acceptable routes. Check both intra-pair and group requirements, not only the displayed total. After tuning, recheck impedance discontinuities, neighbors and copper.

Current Pro documentation describes delay-mode constraints and pin-delay import using stack permittivity. These functions may postdate the installed editor or typed adapter. If unavailable, retain explicit external timing calculations and state the limitation rather than pretending a length-only result verifies delay. [Pro signal timing equal length](https://prodocs.easyeda.com/en/pcb/design-time-equal-length/)

## Clocks and sensitive analog routes

Use device-specific oscillator placement and loading. Keep crystal paths compact and separate from noisy routes; return paths and parasitic capacitance affect oscillator behavior. Microchip AVR186 provides a relevant example, not a mandatory ground-ring pattern for every oscillator. [Microchip AVR186](https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-8128-Best-Practices-for-the-PCB-Layout-of-Oscillators_ApplicationNote_AVR186.pdf)

For high-impedance or low-level analog nodes, assess leakage, contamination, coupling, bias paths and reference noise. Guarding, shielding and plane keepouts depend on the circuit; do not apply them without explaining the intended effect. A differential-looking analog connection may need a matched RC network or amplifier-specific layout that differs from a digital pair.

For RF, antenna or transmission-line work, use the exact stack, connector/antenna requirements and manufacturer reference. Preserve specified keepouts and feed geometry. Where EM/channel simulation or measurement is required, a CAD route audit is preliminary evidence only.

## What can be claimed

Report actual endpoint coverage, measured lengths, geometry/rule settings and reference-path observations. Mark ambiguous area/arc connectivity or unmodeled via/package length as indeterminate. Do not convert an unavailable calculation into a pass, or infer full signal-integrity validation from DRC and short traces.
