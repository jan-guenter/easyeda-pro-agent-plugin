# Power, thermal and protection

Research checked 2026-10-10. Use the exact regulator, driver, power device and connector documentation. The method below identifies what to verify; it does not supply one trace width or via count for every circuit.

## Converter and driver loops

Draw current paths for each switching state. Identify paths with large current change and nodes with large voltage change. The critical loop depends on topology. For a synchronous buck with integrated switches, the fast input loop includes the input capacitor and switching devices/return; do not automatically label the entire inductor/output loop as the same hot loop.

Keep the critical input path compact and place the relevant capacitor across the actual supply/return pins. Limit unnecessary switch-node area and coupling to feedback or other quiet nets while satisfying current and thermal requirements. TI SNVA886 shows these tradeoffs for automotive buck layouts; its filter/shield solutions are not universal replacements for layout analysis. [TI SNVA886, section 3.3](https://www.ti.com/lit/an/snva886/snva886.pdf)

For discrete switches and gate drivers, inspect gate-drive and return loops, switching-current return, dead-time behavior and sensitive sense pins. Follow Kelvin-source/current-sense requirements when applicable. A broad ground pour does not guarantee the intended sensing reference.

Keep feedback pickoff at the intended output node and preserve a quiet return to its reference pin. Review compensation and sense routing against device guidance. Do not route sense traces beside a high-dv/dt node just because DRC accepts the spacing.

## Decoupling and distribution

Check both sides of each capacitor's current path, including its ground connection. ADI MT-101 explains why connection inductance and capacitor ESR/ESL affect decoupling, and why LC/bead networks can resonate. Choose actual values and damping from the circuit, not a universal capacitor count. [ADI MT-101](https://www.analog.com/media/en/training-seminars/tutorials/MT-101.pdf)

Allocate bulk energy and local high-frequency paths according to device/load requirements. Consider rail IR drop, transient response, power sequencing and reverse/backfeed paths. Preserve reference decoupling separately when a datasheet distinguishes it from supply bypass.

For a current path, record current type, maximum duty/time, conductor length/width, copper thickness, layer, vias, connectors and allowable drop/temperature. Basic resistance and I²R estimates are useful screening, but they do not model all heat-spreading and cooling conditions. IPC identifies IPC-2152 as the current-carrying design standard; its public scope is not permission to invent a numerical compliance limit. [IPC design standards](https://www.electronics.org/ipc-design-standards)

Check the narrowest neck, thermal spokes, pad escape and via barrels, not only the widest part of a pour. Parallel paths may not share current equally. Review connector/contact, fuse and trace fault behavior together for high-energy supplies.

## Thermal layout

Estimate dissipation at relevant worst-case voltage, current, switching and ambient conditions. Identify heat routes through package pad, copper, vias, enclosure and airflow. Published junction-to-ambient values depend on the measurement board and conditions; they do not directly certify a different layout. [TI AN-1520 exposed-package thermal study](https://www.ti.com/lit/an/snva183b/snva183b.pdf)

Connect an exposed pad to the electrically required net, which is not always ground. Follow its actual land, via and soldering requirements. Coordinate via-in-pad, filling/tenting and stencil decisions with the fabricator/assembler rather than prescribing one treatment to all packages. The library reference covers land-pattern acceptance.

Evaluate whether copper, spokes, thermal vias and neighboring parts allow the required performance. A thermal relief may help soldering while increasing electrical/thermal impedance; choose its use per joint and process. Do not remove all reliefs globally without reviewing assembly consequences.

Keep heat-sensitive references, oscillators, sensors and capacitors away from predictable hot spots where the application needs accuracy or life. Plan measurement access for temperature and ripple on the first prototype.

## Connector protection

Follow the transient entry, protection device and its return path. Place TVS protection near the relevant entry when required, route through the protection connection without an avoidable stub, and keep the discharge path low-inductance. Separate unprotected strike paths from protected circuitry. TI SLVA680A explains these layout mechanisms and the grounding tradeoffs. [TI ESD layout guide](https://www.ti.com/lit/an/slva680a/slva680a.pdf)

Protection selection still needs working voltage, leakage, capacitance, clamp behavior at the specified current and protected-device limits. A component-level ESD rating does not establish complete system protection. Chassis/shield and signal-ground choices depend on the product; do not join them without identifying the intended current route and isolation requirements.

## Acceptance

Review actual copper after refill, relevant DRC settings, physical connections and saved records. Document calculation assumptions and required prototype measurements. Calling a path "power" or checking a fill boundary is not proof of current capacity, temperature, stability or EMC performance.
