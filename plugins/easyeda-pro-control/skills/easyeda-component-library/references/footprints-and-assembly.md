# Footprints and assembly

Research checked: 2026-10-10. A package drawing describes the component; a land pattern describes the board. They are related, not interchangeable.

## Collect the manufacturing inputs

Obtain the exact package suffix and manufacturer's recommended PCB land pattern. Record drawing revision, units, top/bottom view, nominal dimensions, tolerances and datum. Establish board finish, copper thickness, mask process, assembly method, stencil process and chosen fabrication capabilities when they affect the geometry.

If a manufacturer gives only package dimensions, derive a land pattern using a documented applicable method and assembly assumptions, then label it as derived rather than manufacturer-recommended. IPC's public design-standards page identifies land-pattern and board-design standards, but it does not provide their licensed dimensional rules. Do not claim IPC compliance from a public contents page. [IPC design standards](https://www.electronics.org/ipc-design-standards).

Separate each geometric layer's job:

| Feature | Purpose | Do not substitute |
| --- | --- | --- |
| Copper pad | Solder/electrical contact | Package-body outline |
| Solder-mask opening | Exposes or bounds solderable copper | Paste aperture |
| Paste aperture | Controls deposited solder | Full exposed-pad area by default |
| Silkscreen | Human identification | Mechanical clearance proof |
| Assembly outline | Body/polarity placement reference | Fabricated board outline |
| Courtyard / keepout | Assembly or mechanical constraint | A guarantee that all tooling fits |
| Drill / slot | Finished mechanical opening | Copper-pad diameter |

Verify which layers and object types the installed Pro version and export actually implement. A drawn circle on a documentation layer is not a drilled hole.

## Derive and check dimensions

Use an explicit coordinate origin and dimensional table. Check pitch, rows, pad center spacing, pad sizes, overall span and pin-1 location numerically. Preserve significant figures from the source without pretending its tolerances are zero. Convert units once and verify independently; 1 mil is 0.0254 mm.

For through-hole parts, distinguish lead maximum dimensions, insertion allowance, finished hole, drill-tool size and plating tolerance. For slotted terminals, verify slot width, length, direction, plating and the supplier's accepted drill/route representation. Select copper annular rings and hole-to-hole/copper clearances from the actual fabrication process, not a universal default. [JLCPCB capability tables](https://jlcpcb.com/capabilities/pcb-capabilities/).

For an SMD package, inspect toe, heel and side relationships with the terminal tolerance envelope. Do not enlarge every pad indiscriminately: solder bridges, tombstoning, RF parasitics, creepage and heat flow can all change. Confirm whether the recommendation uses solder-mask-defined or non-solder-mask-defined pads.

Check numbering after every copy, array, rotate or mirror. EasyEDA Pro's footprint guide discusses manual numbering and package-specific drawing inputs. Its footprint checks can help detect configured geometry or numbering problems, but they do not determine the correct manufacturer pinout. [Pro footprint creation](https://prodocs.easyeda.com/en/footprint/file-new-footprint/index.html), [Pro footprint rule check](https://prodocs.easyeda.com/en/footprint/tool-check-rule/).

## Exposed pads, paste and thermal vias

Use the exact package and assembler guidance for exposed-pad copper, stencil aperture segmentation and thermal vias. Paste volume, solder voiding, via wicking and joint standoff interact; a large solid paste aperture is not automatically appropriate. Decide tented, filled, plugged, capped or open vias with the chosen process. These terms are not interchangeable.

TI's QFN/SON guidance describes land-pattern, mask, paste and exposed-pad considerations. Its package/process examples are not universal settings for every leadless component. Earlier PowerPAD guidance uses different process assumptions, so do not carry one document's via or mask recommendation to another package without checking compatibility. [TI QFN/SON PCB attachment, SLUA271C, December 2023](https://www.ti.com/lit/an/slua271c/slua271c.pdf), [TI PowerPAD guidance, SLOA120](https://www.ti.com/lit/an/sloa120/sloa120.pdf).

If the exposed pad is an electrical terminal, include its required connection in the symbol/device mapping. If it is multiple copper islands or has multiple vias, make clear which features share that terminal. A drawing of thermal vias without the proper drill and connectivity attributes is not a thermal design.

## Polarity, mechanical fit and model transforms

Check pin 1, cathode/anode, positive terminal, connector key, mounting tabs and edge-launch reference surfaces. Mark polarity on assembly documentation even when silkscreen space is limited. Avoid ambiguous symbols that can be confused with a component body's own marking.

Establish the origin and zero-angle convention used by the library and assembler. Verify the placed model's translation, rotation, scale and board-side height against known dimensions. A centered model or attractive rendering does not certify a placement centroid or a pick point.

Review the complete mechanical envelope, not only the body at board level: mating cable, latch travel, screwdriver access, heatsink, standoff, enclosure, board edge and service clearance. A courtyard is only as complete as its declared assumptions. A bottom-side part can collide with a fixture despite passing electrical DRC.

## Acceptance checklist

- Exact package, source drawing, units and perspective established.
- All terminal numbers and exposed/mechanical pads accounted for.
- Numeric pitch/span/pad/drill checks agree with source and selected process.
- Mask and paste geometry reviewed separately; no accidental silkscreen over exposed pads.
- Polarity and pin-1 orientation checked against an asymmetric feature.
- Origin and model transforms documented; assembly-coordinate convention verified separately.
- Configured footprint checks run when available, with remaining mechanical and process checks stated.
- Saved library geometry verified through the supported workflow if live creation was requested.

Do not print a supposedly scale-accurate fit check unless the output path, printer scale and measured reference dimension are verified. A verified physical sample or controlled mechanical comparison supplies stronger evidence than a screenshot.
