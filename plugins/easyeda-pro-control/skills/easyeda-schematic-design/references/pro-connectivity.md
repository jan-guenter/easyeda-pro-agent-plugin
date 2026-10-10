# Pro connectivity

Research checked 2026-10-10. This reference addresses Pro semantics, not EasyEDA Standard. Current online tutorials may describe functions newer than the installed editor; use the actual version and supported typed capabilities for live work.

## Identities to keep separate

| Item | Meaning to verify |
| --- | --- |
| Component identity | The actual placed part or device instance |
| Designator | Human and assembly reference, which can be renumbered |
| Pin number | Package-terminal mapping, independent of drawn pin position |
| Pin name | Functional label, which can differ from the number |
| Wire group and segments | Native electrical objects, not merely lines touching visually |
| Local wire name | Name within its schematic/hierarchical context |
| Global net name | Compiled name used outside that local context, including PCB transfer |
| Display attribute | Drawn position, visibility and style; some displayed values also name nets |

Pro's net label is a wire naming attribute, unlike Standard's separate-label workflow. The manual distinguishes the wire name from the global name used by hierarchy/PCB transfer and notes naming decisions when groups split or merge. Preserve both electrical intent and relevant naming scope. [Pro wire/net manual](https://prodocs.easyeda.com/en/schematic/place-wire/)

## Wiring method

Use actual pin connection anchors and a compatible grid. The visible end of a symbol body is not necessarily a pin endpoint. When placing a new symbol or using an imported one, first inspect its electrical anchors.

Plan wire removal, replacement and movement against the existing group, net and endpoint graph. Preserve branches and intentional no-connects. Crossing wires and a dot-like graphic are not sufficient evidence of a native junction. For source-imported edits, require the maintained adapter's native effect and compiled pin-net checks; do not assume an independently created touching group merges electrically.

Keep one intended electrical name per connected network, with explicit components or the supported short/net-tie mechanism where distinct named nets deliberately meet. Do not rename a wire just to make a caption look shorter if the naming change is outside scope.

After a move, independently confirm each affected physical pin's compiled net and active no-connect state. Check pins that were retained as well as pins that were created or cloned. A branch contact that looks correct at overview scale may still leave an endpoint disconnected.

## Labels, flags and ports

Use a label for naming a wire and a port for a hierarchical interface when that matches the project convention. Pro ports can connect within a page or through reuse/hierarchy, and their port name may differ from the attached wire name. Renaming an unnamed attached wire through a port can also assign a name. Review hierarchy scope before treating two identical visible strings as the same global net. [Pro net ports](https://prodocs.easyeda.com/en/schematic/place-net-port/)

For repeated blocks, check the instance path and global names, not only the child page. Verify which signals are meant to be local per instance and which are shared. A rename can affect sibling circuits even if the visible edit occurs on one page.

No-connect in Pro sets a pin property at its endpoint; removing the marker resets that property. It is not just a cross-shaped drawing primitive. Do not borrow Standard's placement instructions. [Pro no-connect manual](https://prodocs.easyeda.com/en/schematic/place-no-connect/)

Hiding a net caption should change presentation only. Keep the value and connectivity intact and verify whether native refresh honors the requested visibility. If it does not, inspect the recorded transaction and supported recovery; do not hide the failure by changing intent after the fact.

## Verification depth

Use complementary evidence:

1. Native/source records establish actual object identities, properties and geometry within the reader's documented coverage.
2. Compiled topology establishes physical-pin-to-net relationships within its full reported project/page scope.
3. Electrical rule checks inspect the enabled policy and can identify mapping or connection inconsistencies.
4. A rendered view establishes whether people can follow the intended association without ambiguous labels or crossings.
5. Saved/reopened and complete-project persistence proof establish that the intended result is durable and collateral records did not change unexpectedly.

For an offline PDF/image, describe visible associations and uncertainty. For a supplied netlist, state its format, generation revision and scope. Do not infer missing pages or claim a complete board topology from a cropped view.

## Scope traps

A device placed in Pro enters a project template library. Editing a project template may refresh multiple schematic instances and PCB objects. Do not edit shared symbol pins to solve one placed instance's label position. A library-wide or ECO action requires its own scoped intent. [Pro placed-device and project-template behavior](https://prodocs.easyeda.com/en/schematic/place-device/)

A single-pin net is not automatically a defect. The Pro FAQ notes that it can be intentional; the reviewer must compare it to circuit intent. Never add a dummy connection simply to remove a warning. [Pro schematic FAQ](https://prodocs.easyeda.com/en/faq/schematic/)
