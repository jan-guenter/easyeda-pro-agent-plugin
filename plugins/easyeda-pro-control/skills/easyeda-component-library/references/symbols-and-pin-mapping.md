# Symbols and pin mapping

Research checked: 2026-10-10. Use current manufacturer documents for the exact orderable part. This is a verification workflow, not a replacement for a package drawing.

## Identify the part before drawing

Record the manufacturer, complete MPN including package and option suffixes, datasheet revision, package drawing number and errata. Establish whether the symbol describes a single fixed device, a configurable function or a family with different pinouts. Similar names, the same terminal count or a distributor photograph are not enough.

Check a datasheet's pin table against its package drawing. A table can list several packages. An exposed thermal pad can be electrically connected, recommended for connection, internally isolated or unused; the exact device specification decides. Do not infer that every exposed pad is ground. Include test/reserved pins, configuration straps, supply domains, duplicate supplies and deliberately unused terminals.

Use primary manufacturer data when available. Supplier library downloads are candidate definitions to inspect, not automatically trusted assets. If a datasheet does not establish numbering or view direction, stop that mapping decision and identify the missing drawing.

## Make the mapping explicit

Maintain one row per physical terminal, with any intentional shared mapping explained. A synthetic format example:

| Manufacturer terminal | Function | Symbol pin number | Footprint pad number | Ownership / evidence |
| --- | --- | --- | --- | --- |
| 1 | Supply input | 1 | 1 | Unit A; manufacturer pin table |
| 2 | Return | 2 | 2 | Unit A; manufacturer pin table |
| EP | Exposed pad | EP | EP | Connection and naming from package-specific data |

The example is not a real device pinout. Use the manufacturer's actual strings, including alphanumeric BGA or connector identifiers. Do not silently turn A1 into 1, rename EP as the next numeric pin, or compare only the set size. Check both directions: each required symbol pin has the intended physical pad, and each electrical pad has its intended symbol ownership.

EasyEDA Pro associates symbol pin numbers with footprint pad numbers. Its documentation permits a symbol to have fewer pins than the footprint has pads; that makes row-by-row review more important, not less. A multipart package can have several schematic units with one physical footprint. [Pro footprint manager](https://prodocs.easyeda.com/en/schematic/tools-footprint-manager/), [schematic FAQ](https://prodocs.easyeda.com/en/faq/schematic/).

Check these special cases explicitly:

- Several physical terminals with the same function: keep terminal identities unless the supported package definition intentionally groups them. Do not hide the need to connect every required supply pin.
- Multipart units: no required terminal may disappear or appear as two independently placeable physical pins. Power-unit ownership and unused gates must be explicit.
- Stacked pins: verify the CAD's actual numbering and connectivity, not just overlapping text.
- Mechanical or shield pads: establish whether they are electrical terminals, chassis connections or non-electrical features. Do not invent a schematic net for a mounting hole.
- Swappable gates/pins: permit swaps only when both the silicon and the implementation support them; many equal-looking functions are not interchangeable.

## Draw a functional symbol

Organize by function: supplies and returns, control, clocks, data groups and interfaces. Preserve names and active-low meaning while keeping the drawing readable. The symbol need not copy the physical arrangement. Do not rename a pin merely to simplify a net label; document any display alias.

Put the connection anchor on the electrical grid and outside the symbol body. Pin text, graphics and anchor are different objects. Pro's pin properties describe the circular endpoint as the connection end and allow electrical types and alphanumeric numbering. [Pro pin properties](https://prodocs.easyeda.com/en/symbol/side-panel-right-pin-property/).

Choose electrical types to express the actual behavior and the checker available in this version. Consider input, push-pull output, open-drain/open-collector, bidirectional, passive and power behavior. An ERC warning caused by a deliberate open-drain bus should be resolved by accurate types and pull-up review, not by assigning every pin passive. Conversely, a configurable GPIO's broad bidirectional type does not prove a particular board configuration is safe.

Use a distinct readable pin-1 or polarity indication when it helps schematic interpretation. Keep pin numbers visible wherever they support review. Large multipart devices may use functional groups, but provide a complete pin mapping outside the visual symbol as well.

## Connector perspective

For a connector, record the view specified by the drawing: mating face, PCB side, solder side or cable termination. Record whether the drawing describes the plug or receptacle. A top-view board footprint, bottom-view package drawing and mating-face connector sketch may require different transforms.

Check a keyed or asymmetric feature against numbered terminals. Follow at least one signal through the actual mating pair or cable assembly. For a reversible or dual-row connector, test both orientation assumptions against the manufacturer's numbering. A mirrored 3D model can look plausible while the net assignment is wrong.

Do not choose a perspective from habit. If only a photograph or an unlabeled 2D outline is available, treat pin numbering as unresolved. Public-source connector guidance cannot establish the view of an unspecified part; its exact product drawing is the authority.

## Acceptance evidence

Before approving a symbol:

1. Compare every terminal number and function to the exact pin table and package view.
2. Confirm unit ownership, deliberate no-connects, hidden pins and duplicated functions.
3. Check anchor grid, orientation, text readability and supported electrical types.
4. Confirm the intended footprint association and the complete pin-to-pad table.
5. If authorized live verification is needed, use a disposable placed instance and inspect actual nets at its anchors. Keep this separate from saving the library and verifying its saved/reopened records.

A symbol preview proves appearance only. A count comparison proves counts only. Neither proves the final board's pin-to-pad wiring.

## Primary sources

- [EasyEDA Pro symbol creation](https://prodocs.easyeda.com/en/symbol/file-new-symbol-component-symbol/): symbol and multipart workflow.
- [EasyEDA Pro pin properties](https://prodocs.easyeda.com/en/symbol/side-panel-right-pin-property/): anchors, numbering and electrical properties.
- [EasyEDA Pro footprint manager](https://prodocs.easyeda.com/en/schematic/tools-footprint-manager/): number-based association.
- [EasyEDA Pro schematic FAQ](https://prodocs.easyeda.com/en/faq/schematic/): multipart placement and package association.

The mapping and connector checks above are engineering synthesis. They require the actual part's datasheet to produce a verdict.
