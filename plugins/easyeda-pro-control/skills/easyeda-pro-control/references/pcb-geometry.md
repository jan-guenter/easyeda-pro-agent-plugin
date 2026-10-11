# PCB geometry

## Calibrate units and axes

PCB and footprint public APIs commonly use mil. Prefer the installed unit conversion helper and keep the unit in every assertion. Before applying project coordinates, measure two known objects to determine the Y direction and rotation convention. Do not reuse another project's axis transform.

Normalize rotations modulo 360 before constructing evidence. The candidate component-writer assertions compare declared numeric values exactly and accept no caller-selected tolerance. Recompute transformed pad centers from live primitives instead of relying on an intuitive rotation sign.

## Pads, drills, and dimensions

Component pin wrappers are useful for transformed centers and nets, but one baseline wrapper returned a drill dimension scaled by 0.1. Read direct pad primitives or durable footprint source for hole and land dimensions.

The exact `pcb-inventory` reader records direct `pcb_PrimitivePad` state, including land/hole objects, offsets, rotation, metallization, numeric pad type, mask/paste expansion, thermal state, lock, layer, net, and source marker. That API enumerates component-owned and standalone pads together, so it is the single physical-pad authority. Native `getAllPinsByPrimitiveId` supplies global pad IDs, parent IDs, pad numbers and nets for exact correlation; those rows are never added as a second pad family. Component `getState_Pads` summaries are not used because the pinned mapper exposes footprint-local IDs and can include footprint vias. The exact component reader uses transformed pin centers, rotation and layer but intentionally omits wrapper drill and land geometry. Do not merge or double-count the sources, and do not apply the observed 0.1 correction globally.

The exact component reader can return live bounding boxes for selected components. The inventory reader returns every ID exposed by the pinned public family enumerators and supported geometry/state for pads, vias, lines, arcs, polylines, regions, pours, derived poured fill pieces, and fills. Native pin enumeration must return an array, including an empty array for zero physical pads. `pcb_PrimitivePoured` groups by the parent pour ID, so the reader correlates that state to `pcb_PrimitivePour` and identifies fill pieces from `getState_PourFills()[].id` without adding another parent primitive count. It deliberately omits region rule types and fill modes because the installed adapter drops `NO_VIAS` and hardcodes `fillMode`. Arc start/end coordinates and angles are rounded to one decimal adapter unit, and via radii are rounded to one decimal before diameter conversion; treat both as adapter-normalized public state, not raw persisted precision. Some remaining families are identity-counted only; consult the payload's limitations before making a geometry or rule claim.

Serializer grids and adapter scaling need a controlled test in the current editor. Do not apply a global correction from one observed footprint. Create a disposable test primitive, save and reopen it, measure the result, and document any version-specific compensation.

### Inherited footprint lines

A PCB Line enumerator can include footprint graphics that have no standalone
PCB `LINE` record. An ID prefix alone does not prove their owner. The candidate
net-membership and primitive-type readers resolve each explicit component
`Footprint` association against a fresh managed checkpoint, then match template
IDs and exact transformed geometry to the complete live inventory. Inherited
provenance is labelled `FOOTPRINT_LINE` with its footprint document UUID; it is
not mislabelled as a PCB record or included in a nonempty-net result.

This profile admits only unlocked top-side components at zero rotation, ordinary
zero-origin local footprints and empty-net top-silkscreen lines. Rotated/bottom
instances, custom chains, layer replacements, partitions, ambiguous owners and
incomplete inventories refuse. Explicit footprint associations require proof
even if the inventory reports no inherited lines. The initial detection sample
does not count toward the two accepted source/inventory/source cycles; complete
checkpoint invariance is rechecked around every accepted observation. Offline
tests and retained-fixture replay are not connected validation of this candidate.

## Live bounds and placement

Use live placed primitive bounding boxes for clearance decisions. Offline envelopes may omit graphics or body extents. For typed placement:

1. Journal the target's primitive ID, reference, `UniqueId`, coordinates, rotation, layer, and lock state.
2. Apply one facade-generated pose, layer, or lock patch without saving.
3. Read live bounding boxes and critical pad centers.
4. Check board edge, locked objects, keepouts, cable and mechanical envelopes, and local clearance.
5. Recompute relevant electrical path metrics.
6. Stop on any failed check. Use an available journal-verified inverse only when the exact current state and scope are proven; an ambiguous call, quarantine or unsupported inverse must be recovered without another mutation.

Typed component modifications include `x`, `y`, `rotation`, `layer` and `primitiveLock`, with attached-record effects independently checked. `pcb.batch` simulates 1–256 steps before one source merge and protects initially locked records and descendants. Creation IDs are retained before dispatch. This replaces the legacy one-target limitation; exact inverse availability is still operation-dependent.

The upstream group planner is not a live placement authority: its board size, component rectangles, and keepouts are caller-supplied, it does not audit the live outline, obstacles, or locks, and its `fixed` flag is not honored by the current implementation. It is excluded from guarded typed writes. An exact version-pinned placement workflow must derive every target and clearance input from live evidence and use explicit inverse poses.

Do not unlock or move user-locked objects unless the user expressly asked for that mechanical change. Do not place bottom-side components when project requirements restrict placement to the top.

Use explicit line and arc segments for critical outlines. Verify closure, bounding box, pad-relative datums, and reopened geometry. A generic rectangle command can encode an unexpected origin or direction.

## Regions and copper keepouts

The installed public region API exposes polygon, layer, rule list, name, line width, and lock state. `pcb-inventory` reads the exposed geometry, layer, name, width, and lock, but not the rule list: the pinned mapper silently drops raw `NO_VIAS`. Typed region adapters use complete document-source records rather than the lossy public region-rule getter. Unsupported source geometry or rules are rejected; check the operation's exact inverse and live validation status. Do not copy a MULTI-layer number or rule number from another project without checking it through a separately proven native or UI path.

Region geometry verification must compare geometry, not serialized path text. The editor can reverse winding, rotate the starting vertex, remove a duplicated closing point, and canonicalize commands. Normalize polygons and compare equivalent vertices, edges, arcs, closure, and layer. Rule-set verification is unavailable from that public region reader; use the complete native source proof for typed changes.

A name has rule meaning only when the rule set says to follow a named region rule. A copper-only keepout should not also forbid component bodies unless the design requirement says so.

## 3D models

Typed `pcb.component.model-transform` and `footprint.model-transform` change only
one existing stored `3D Model Transform` attribute. Supply its exact `attributeId`
and, for PCB, the owning component's `target.primitiveId`. The legacy form uses
explicit `dimensionsMil`, `rotationDegrees` and `offsetMil` XYZ fields. Its native
serialization is dx,dy,dz,rz,rx,ry,x,y,z. Mixed zero/positive dimensions are valid.
For real models, native scaling uses the minimum positive finite requested-size
to bounding-box ratio and ignores zero axes; zero Z does not mean zero height.
Three zero dimensions use the native fallback scale. Preserve the stored zeros
unless resizing is intended. The v2 form
uses nine `linearColumnMajor` coefficients and `translationMil` XYZ fields.

The adapter preserves pose, pads, nets, model association/title and all unrelated
records. It cannot create a missing/inherited transform override, replace the
model or propagate a footprint edit to placed instances. Locked owners or
attributes require a separate authorized unlock. A previous noncanonical numeric
string may prevent an exact inverse. This adapter has focused offline tests;
its connected save/reopen and mechanical validation remain pending.

When the transform comes from DEVICE metadata, use the separate
`library.device.model-transform` operation and its exact inheriting-instance
authority list. See [libraries-and-eco.md](libraries-and-eco.md). Do not invent a
missing PCB attribute or clear the model to get around the stored-attribute path.

EasyEDA normalizes a STEP body's XY bounding-box center and minimum Z before it applies model transforms. Derive the transform from the STEP BREP or bounding box and pin axes. Do not tune it from an oblique preview.

Hash a local model file before binding it. Preserve the complete unrelated property map when changing model identity, title, or transform. A top orthographic view is useful for pad and pin registration. Use the supported process-bound native view controls; a private 3D command's version pin alone is not execution admission and does not authorize raw dispatch.

Mechanical proof should compare:

- pad and pin axes;
- seating plane and board penetration;
- outline and mounting datums;
- source model bounding box and applied transform;
- reopened model identity and transform.

A convincing preview does not prove a durable model binding.
