# Capture and circuit checks

Research checked 2026-10-10. This workflow is an engineering synthesis. The links support the product behavior and physical principles beside them; component-specific limits still come from the selected part's datasheet and errata.

## Before capture

Define the circuit's purpose, input range, load range, interfaces, power sources, operating states and failure states. A short table should expose choices that change the topology. For example, whether a connector supplies power or receives it matters more than where its symbol sits.

For an existing circuit, distinguish requested modifications from retained assumptions. Preserve an unmodified pin-to-net baseline and note intentional open pins. A redraw should not become an undocumented redesign.

Collect authoritative device information using exact manufacturer part numbers and package suffixes. Use a reference design as a starting point only after checking its input/output conditions, component options, firmware expectations and PCB stack. Manufacturer checklists illustrate this requirement-driven approach, including supply, current, sequencing, configuration and memory checks. Their numerical recommendations are device-specific. [Microchip SAM9X75 hardware considerations](https://ww1.microchip.com/downloads/aemDocuments/documents/MPU32/ApplicationNotes/ApplicationNotes/SAM9X75-Hardware-Design-Considerations-DS00004962.pdf), [Microchip PolarFire design checklist](https://onlinedocs.microchip.com/oxy/GUID-ABAC3251-8552-4A5C-A63D-D9BCAEA91FEF-en-US-2/GUID-3546A396-304D-4886-AA3C-78C0CD7D9F4F.html)

## Capture by functional block

Build connected blocks around power entry, conversion, protection, processing, sensing, output drivers and connectors as applicable. Place the components needed to understand one function together. Show relevant supply names and interface direction, but do not hide physical pin numbers merely to make a block look simpler.

For each selected part, check:

- All supply and ground pins, exposed-pad requirements and any unused supply domains.
- Enable, reset, boot and address-strapping states during startup and when another device is unpowered.
- Required local decoupling, reference bypass, compensation, feedback and frequency-setting components.
- Input thresholds, output drive type, pullups and voltage-domain compatibility.
- Package terminal function against the actual symbol definition, including alternate functions selected by firmware.
- Required termination, AC coupling, bias, protection and connectors.

Distinguish internal pull resistors from external requirements. Distinguish a pin labeled NC, a pin that must be left open, and an unused functional pin. Resolve each through the datasheet; an EDA no-connect marker is not an electrical justification.

## Power and passive choices

Use recommended operating conditions for normal operation and stress limits for fault/transient checks. Absolute maximum ratings do not imply functional operation there. Guaranteed electrical specifications have stated supply, load and temperature conditions; typical plots are not worst-case guarantees. [TI SZZA036C, sections on ratings and specifications](https://www.ti.com/lit/an/szza036c/szza036c.pdf)

Document enough calculation to reproduce the choice:

- Regulator input/output headroom, current requirement, startup/inrush, sequencing, reverse current, stability and fault behavior.
- Resistor value tolerance, power, pulse energy and working-voltage rating where relevant.
- Capacitor effective capacitance, tolerance, voltage, temperature, ripple and ESR requirements.
- Inductor saturation and RMS current, loss and transient behavior for the actual converter.
- Diode, MOSFET or driver voltage/current limits, switching loss, gate-drive conditions and applicable safe operating area.

High-permittivity MLCC capacitance can fall under DC bias. Use the exact capacitor's data rather than assuming its printed value remains available at the operating rail. [Murata DC-bias explanation](https://article.murata.com/en-eu/article/voltage-characteristics-of-electrostatic-capacitance)

Mark assembly-critical choices in properties, not only in drawn text. A readable value does not guarantee that the BOM carries the voltage rating or manufacturer part number.

## Timing, analog and interfaces

Check timing against the real operating state. Address straps sampled during reset, powered-off interface leakage and open-drain pullups can cause failures that ordinary net checking cannot detect.

For analog paths, identify signal range, source impedance, bias/common-mode range, bandwidth, gain, noise and ADC reference behavior. Include protection leakage, bias-current paths and capacitor settling where those affect the function. A grounded-looking symbol is not proof of a low-noise PCB return path.

For clocks, use the specific oscillator and crystal requirements. Load capacitance includes external and parasitic contributions; package, layout and IC loading matter. Do not copy a crystal capacitor pair from an unrelated board. [ST AN6134 oscillator requirements](https://www.st.com/resource/en/application_note/an6134-guidelines-for-crystal-oscillator-design-on-st25-nfc-readers-stmicroelectronics.pdf)

For external connectors, verify pin function, view, mating part, cable wiring, voltage and current. An attractive schematic connector orientation does not establish the physical contact order.

## Checks before PCB transfer

Run schematic checks with their actual enabled policy and scope. Classify each finding as a defect, an intentional condition or an unresolved question; retain justified waivers. Do not retype every pin as passive or lower error levels to conceal a library defect.

EasyEDA's schematic rule dialog configures check severity, and results can locate objects in the log. This is a CAD consistency check, not a substitute for circuit analysis. [Pro schematic rules](https://prodocs.easyeda.com/en/schematic/design-design-rule/)

Before transfer, reconcile component identity, footprint bindings and pin-to-pad mapping. Pro requires schematic and PCB under the same board and provides a change list to inspect before applying an update. Treat that list as an ECO with circuit and layout consequences, not a harmless view conversion. [Pro schematic-to-PCB workflow](https://prodocs.easyeda.com/en/schematic/design-update-convert-schematic-to-pcb/)

Leave a small design note stating supply assumptions, selected part revisions, non-obvious calculations and intended assembly variants. This makes a later review possible without reconstructing intent from positions and net names.
