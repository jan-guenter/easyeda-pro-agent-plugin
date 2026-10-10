# Requirements and circuit review

Research checked: 2026-10-10. Start with operating requirements and concrete failure conditions, not a list of generic preferred parts.

## Establish the review scope

Identify the design revision, supplied artifacts and requested depth. Record what is actually available: screenshots, schematic source, netlist, BOM, PCB, stackup, library data, supplier constraints, simulations and test results. A picture can expose a wiring concern but usually cannot establish complete multi-sheet connectivity.

Ask or infer provisionally, without inventing certainty:

- Input supplies, polarity, range, transients and available fault energy.
- Continuous and peak loads, startup/inrush and operating modes.
- Interfaces, cable environment, logic levels and connection/disconnection cases.
- Analog accuracy, bandwidth, noise, timing and clock requirements.
- Temperature, cooling, enclosure, altitude, humidity and service conditions.
- Assembly variant, component substitutions and mechanical constraints.
- Safety, reliability, regulatory and production goals.

Missing information need not stop all review. Check known facts and label conclusions conditional on missing requirements. A board intended for indoor laboratory demonstration and one intended for unattended field use require different evidence.

Microchip's processor hardware guidance illustrates device-specific review of power, clocks, memory and configuration; its recommendations apply to those devices, not every MCU. Use the exact selected device's datasheet, errata and reference designs. [SAM9X75 hardware considerations](https://ww1.microchip.com/downloads/aemDocuments/documents/MPU32/ApplicationNotes/ApplicationNotes/SAM9X75-Hardware-Design-Considerations-DS00004962.pdf), [Microchip FPGA design guidelines](https://onlinedocs.microchip.com/oxy/GUID-2952C8AA-A592-489E-8058-3FD06065EDDB-en-US-7/GUID-4A97F84A-A997-452A-A09D-747C71C9E121.html).

## Trace power through every state

Follow each source through connector, protection, conversion, distribution and load. Include ground/return paths and chassis relationships. Identify reverse polarity, hot plug, brownout, power-off input drive, multiple supplies and externally powered interfaces.

Check regulator topology, input/output ranges, current limits, startup, enable thresholds, compensation, required capacitance/ESR and dissipation from the exact datasheet. Check dropout or duty-cycle limits at input extremes. A nominal output voltage alone does not establish usable rail margin.

Evaluate sequencing and power domains: can a signal drive an unpowered pin, back-power a rail, violate an absolute maximum or hold a subsystem in a partial state? Account for body diodes, protection structures, pull-ups, level shifters and reset circuitry. A connector may introduce power through an unexpected signal or shield route.

Separate normal operation from survival ratings. TI's discussion of recommended conditions, absolute maximum stress and electrical characteristics is a useful interpretation example, but the chosen part's specifications control. Typical values are not guaranteed limits. [TI understanding standard-logic specifications, SZZA036C](https://www.ti.com/lit/an/szza036c/szza036c.pdf).

## Check signals and control

For each interface, verify source/sink types, voltage compatibility, current/injection limits, pull directions and values, bus loading and inactive states. Consider open-drain versus push-pull outputs, powered-off behavior, strap sampling, default pin state and firmware-dependent configuration.

Check polarity and intended function of diodes, MOSFET terminals, transistors, isolators and level translators. A symbol's visual symmetry does not imply interchangeable terminals. Verify each actual package terminal and device pin mapping when the issue can cause an unbuildable or nonfunctional board.

For analog paths, evaluate source/load impedance, common-mode and output swing, bias current, input protection, reference loading, noise/bandwidth and component tolerances. Confirm that the amplifier or converter is specified in the chosen supply/configuration. A simulated ideal op-amp cannot establish behavior near a real device's rails.

For clocks and crystals, check the exact oscillator requirements, load capacitance, drive level, frequency tolerance, startup margin and placement/parasitics. Do not select capacitors from a generic formula without accounting for the device and board. [ST crystal oscillator guidance for ST25 devices, AN6134](https://www.st.com/resource/en/application_note/an6134-guidelines-for-crystal-oscillator-design-on-st25-nfc-readers-stmicroelectronics.pdf).

## Calculate at relevant corners

State the equation, input assumptions and units. Use specified limits when a guaranteed result is required. Propagate relevant resistor/capacitor tolerances, voltage and temperature dependence, supply range, bias and load variation. Consider part correlation where justified rather than summing unrelated typical values.

Useful checks depend on the circuit:

- Divider threshold over supply and component extremes.
- Pull-up high/low levels, rise time and sink current under actual bus load.
- Power dissipation and current margin at worst operating conditions.
- RC time constants and reset/enable timing with leakage and thresholds.
- LED/load current with voltage/headroom limits.
- Filter gain/bandwidth and analog offset/noise budget.
- Effective decoupling capacitance at bias and temperature.

Mark an estimate as an estimate. A hand calculation can identify a gross risk without replacing a required simulation, datasheet limit or measurement. Avoid false precision from nominal dimensions and typical curves.

## Circuit finding format

Use an exact location and failure condition:

```text
Location: component/pin/net/sheet or supplied artifact reference.
Condition: the specific supply, load, mode or connection state.
Finding: confirmed defect / supported risk / unresolved evidence.
Mechanism and consequence: why it fails and what happens.
Evidence: datasheet section, calculation or observed connectivity.
Resolution: smallest scoped change, missing document or test.
```

Do not list a preferred practice as a defect when the design meets its actual requirements by a different method. Conversely, a neat schematic or clean ERC report does not resolve an unsupported operating assumption.
