---
name: easyeda-component-library
description: Create, validate or repair EasyEDA Pro symbols, footprints, device bindings and 3D associations from exact manufacturer data. Use for pin-to-pad mapping, land patterns and reusable component definitions. Not for choosing a circuit architecture or ordinary PCB routing.
---

# EasyEDA component library

Build a traceable definition of the exact orderable part and package. A matching name, attractive 3D model or equal pin count does not prove the mapping is correct.

For live application actions, read the sibling [control skill](../easyeda-pro-control/SKILL.md) and inspect library execution capabilities. Supplied library files can be reviewed offline. Do not create or update a shared library merely to test a writer.

## Select the reference

- For symbols, pin naming, electrical types, multipart units or connector perspective, read [symbols and pin mapping](references/symbols-and-pin-mapping.md).
- For pads, package geometry, holes, mask, paste, courtyards or mechanical acceptance, read [footprints and assembly](references/footprints-and-assembly.md).
- For devices, project templates, library updates or model associations, read [device and revision control](references/device-and-revision-control.md).
- For public system candidates and names, read [catalog metadata](../easyeda-pro-control/references/current-system-library.md). Search results and device associations still need the manufacturer mapping checks below.

Use the manufacturer drawing for the exact package suffix and revision. Record datasheet URL, drawing view, units and the source of each nontrivial dimension. If a dimension or perspective is missing, mark it unresolved rather than guessing from a picture.

## Acceptance contract

Create a mapping table linking manufacturer terminal number, terminal function, symbol pin number and footprint pad number. Include exposed pads, duplicated terminals, mechanical pads, deliberate no-connects and multipart ownership. Validate every row rather than only total counts.

Keep the schematic symbol's functional layout independent of the footprint's physical layout. Use a consistent electrical anchor grid. Derive land geometry from the recommended PCB pattern and assembly process; do not confuse package outline dimensions with pad dimensions.

For an existing design, identify every instance sharing the target project template or library item. Prefer a scoped replacement or new revision when shared changes are outside authority. Preserve stable identities and bindings unless the requested change requires otherwise.

Check geometry numerically, inspect polarity and pin 1 from the documented view, run available symbol/footprint checks, and verify a placed disposable instance only when an authorized live test is needed. Verify saved/reopened records through the control workflow. A generated preview is useful visual evidence but cannot certify pad mapping or manufacture.

## Deliver

Provide the definition, mapping and dimensional evidence, revision/provenance, changed instance scope, and remaining limitations. State model correctness separately from electrical and land-pattern correctness. Creating a personal asset does not authorize publishing it to a team or public library.
