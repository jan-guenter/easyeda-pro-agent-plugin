# Device and revision control

Research checked: 2026-10-10. Separate the reusable library definition, the project's instantiated template and the individual placed component.

## Build the device from proven bindings

Record the exact symbol, footprint and optional 3D-model identities and revisions, not just display names. A device definition binds these resources and properties; its purchasing MPN and package option must agree with the geometry. Pro's device workflow supports personal and team ownership contexts. Creating a local device does not authorize publishing or changing a team library. [Pro device creation](https://prodocs.easyeda.com/en/device/file-new-device/).

Keep these identities distinct:

- Manufacturer MPN: the orderable electrical/mechanical part.
- Device/library identity: the reusable CAD binding.
- Project template identity: the project's copied or instantiated definition.
- Component identity and designator: a placed instance in the circuit.
- Supplier stock code: sourcing metadata, not a replacement for MPN/package verification.

A text footprint name may be unresolved or ambiguous. A matching string or 3D model is not proof that the placed component refers to the reviewed pad geometry. Inspect the actual binding and version used by the project.

Documentation evolves: newer Pro documentation describes direct symbol placement and additional footprint association workflows. Do not assume a historical “device required for every placement” rule applies to every release, or that new GUI workflows are exposed through this plugin. Check the installed version and actual capability report. [Pro symbol placement](https://prodocs.easyeda.com/en/symbol/place-symbol/), [Pro footprint properties](https://prodocs.easyeda.com/en/schematic/property-multi-footprint/).

## Change-impact analysis

Before editing an existing asset, identify all affected references:

1. Other devices bound to the same symbol or footprint.
2. Every project instance sharing the affected project template, across all sheets.
3. The PCB footprints associated with those instances.
4. BOM, placement, assembly drawings and release packages depending on that revision.

Pro's component documentation says placed components prefer the project template, and editing that template can refresh other pages and the PCB. A global-library edit and a project-template edit therefore have different scopes. The footprint editor also exposes devices bound to a footprint. [Pro placed devices](https://prodocs.easyeda.com/en/schematic/place-device/), [footprint device associations](https://prodocs.easyeda.com/en/footprint/side-panel-left-device/).

Do not approve a shared change merely because the active sheet looks correct. If only one instance should change, use an available scoped replacement or a new definition/revision and verify the result. If the supported workflow cannot provide the required scope, report that limitation instead of mutating the shared asset.

## Classify the revision

| Change | Checks required before adoption |
| --- | --- |
| Text or graphics only | Anchor/pin identities unchanged; all affected instances readable |
| Pin number, anchor, electrical type or unit | Full terminal mapping; connectivity/ERC; instance impact |
| Pad, hole, mask, paste or origin | Package/process geometry; routing/DRC; assembly transforms |
| Device association or package/MPN | Pin-to-pad mapping, sourced-part identity, PCB/BOM consistency |
| 3D transform | Mechanical envelope; orientation; assembly coordinates if coupled |

This classification is review guidance, not permission to skip the control workflow's mutation guards. A visual-only intention must still be proven against actual records. A metadata change can affect purchasing or variant behavior even if copper is untouched.

Retain the previous definition when producing an incompatible revision. Record the reason, source revisions, mapping changes and migration scope. Do not silently substitute a pin-compatible-looking part if ratings, timing, thermal behavior, startup configuration or assembly package have not been checked.

## Validate adoption

Inspect the schematic-to-PCB change list before accepting changes. Pro's transfer workflow can fail on abnormal component/footprint associations and offers selected updates; selecting all changes by default is not an agent acceptance policy. Separate the library change, project adoption and PCB synchronization into explicit authorized steps. [Pro schematic-to-PCB update](https://prodocs.easyeda.com/en/schematic/design-update-convert-schematic-to-pcb/).

For each affected instance, verify actual terminal mapping and nets, orientation, package association, attributes and intended variant behavior. For footprint changes, check existing copper attachments and route endpoints rather than assuming they moved correctly. Preserve designators and stable identities unless the requested migration specifically changes them.

If an update is ambiguous or times out, inspect recorded lifecycle state. Never repeat the mutation, issue an extra Save, edit the journal or relax mapping/geometry checks to force completion. Use the sibling control skill's supported recovery workflow. Source-level support does not prove a new library operation has passed a live saved/reopened lifecycle.

## Provenance record

Keep a small record alongside the definition:

```text
Exact MPN and package:
Manufacturer datasheet / package drawing / revision:
Symbol / footprint / device identity and revision:
Pin-to-pad table location:
Derived dimensions and assembly assumptions:
Model source, units and transform:
Affected instances and adoption scope:
Checks performed, artifacts and remaining limitations:
```

Do not include credentials, private project paths, screenshots or component inventories in a public skill or package. A reusable verification method can be published without publishing the design it was used on.
