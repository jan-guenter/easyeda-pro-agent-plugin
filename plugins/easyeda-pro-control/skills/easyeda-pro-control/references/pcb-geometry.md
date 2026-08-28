# PCB geometry

## Calibrate units and axes

PCB and footprint public APIs commonly use mil. Prefer the installed unit conversion helper and keep the unit in every assertion. Before applying project coordinates, measure two known objects to determine the Y direction and rotation convention. Do not reuse another project's axis transform.

Normalize rotations modulo 360 before constructing evidence. The candidate component-writer assertions compare declared numeric values exactly and accept no caller-selected tolerance. Recompute transformed pad centers from live primitives instead of relying on an intuitive rotation sign.

## Pads, drills, and dimensions

Component pin wrappers are useful for transformed centers and nets, but one baseline wrapper returned a drill dimension scaled by 0.1. Read direct pad primitives or durable footprint source for hole and land dimensions.

The exact `pcb-inventory` reader records direct `pcb_PrimitivePad` state, including land/hole objects, offsets, rotation, metallization, numeric pad type, mask/paste expansion, thermal state, lock, layer, net, and source marker. That API enumerates component-owned and standalone pads together, so it is the single physical-pad authority. Component `getState_Pads` records are correlated as a parent-identity subset and never added as a second pad family. The exact component reader uses the transformed component-pin wrapper only for parent/pad identity, center, rotation, layer, and net; it intentionally omits wrapper drill and land geometry. Do not merge or double-count the sources, and do not apply the observed 0.1 correction globally.

The exact component reader can return live bounding boxes for selected components. The inventory reader returns every ID exposed by the pinned public family enumerators and supported geometry/state for pads, vias, lines, arcs, polylines, regions, pours, derived poured fill pieces, and fills. The pinned PCB component mapper returns `undefined` rather than an array for a legitimate zero-pad component; the reader canonicalizes only that case to an empty per-component pad list and still rejects other non-array state. `pcb_PrimitivePoured` groups by the parent pour ID, so the reader correlates that state to `pcb_PrimitivePour` and identifies fill pieces from `getState_PourFills()[].id` without adding another parent primitive count. It deliberately omits region rule types and fill modes because the installed adapter drops `NO_VIAS` and hardcodes `fillMode`. Arc start/end coordinates and angles are rounded to one decimal adapter unit, and via radii are rounded to one decimal before diameter conversion; treat both as adapter-normalized public state, not raw persisted precision. Some remaining families are identity-counted only; consult the payload's limitations before making a geometry or rule claim.

Serializer grids and adapter scaling need a controlled test in the current editor. Do not apply a global correction from one observed footprint. Create a disposable test primitive, save and reopen it, measure the result, and document any version-specific compensation.

## Live bounds and placement

Use live placed primitive bounding boxes for clearance decisions. Offline envelopes may omit graphics or body extents. If the experimental writer is later enabled after connected validation, its one-component workflow must:

1. Journal the target's primitive ID, reference, `UniqueId`, coordinates, rotation, layer, and lock state.
2. Apply one facade-generated pose, layer, or lock patch without saving.
3. Read live bounding boxes and critical pad centers.
4. Check board edge, locked objects, keepouts, cable and mechanical envelopes, and local clearance.
5. Recompute relevant electrical path metrics.
6. Roll back that component to the exact journaled baseline if any check fails.

The runtime-disabled candidate writer accepts only top-level `x`, `y`, `rotation`, `layer`, and `primitiveLock`. Bounds and transformed pin positions may be declared as consequences and are verified, but they are never submitted to EasyEDA. Multi-target plans are rejected because a sequential partial failure could not be reconciled safely.

The upstream group planner is not a live placement authority: its board size, component rectangles, and keepouts are caller-supplied, it does not audit the live outline, obstacles, or locks, and its `fixed` flag is not honored by the current implementation. It is excluded from guarded typed writes. An exact version-pinned placement workflow must derive every target and clearance input from live evidence and use explicit inverse poses.

Do not unlock or move user-locked objects unless the user expressly asked for that mechanical change. Do not place bottom-side components when project requirements restrict placement to the top.

Use explicit line and arc segments for critical outlines. Verify closure, bounding box, pad-relative datums, and reopened geometry. A generic rectangle command can encode an unexpected origin or direction.

## Regions and copper keepouts

The installed public region API exposes polygon, layer, rule list, name, line width, and lock state. `pcb-inventory` reads the exposed geometry, layer, name, width, and lock, but not the rule list: the pinned mapper silently drops raw `NO_VIAS`. The guarded facade also has no region writer or inverse model. Region and keepout mutation therefore remains outside the state machine. Do not copy a MULTI-layer number or rule number from another project without checking it through a separately proven native or UI path.

Region geometry verification must compare geometry, not serialized path text. The editor can reverse winding, rotate the starting vertex, remove a duplicated closing point, and canonicalize commands. Normalize polygons and compare equivalent vertices, edges, arcs, closure, and layer. Rule-set verification is unavailable from the current exact region reader.

A name has rule meaning only when the rule set says to follow a named region rule. A copper-only keepout should not also forbid component bodies unless the design requirement says so.

## 3D models

EasyEDA normalizes a STEP body's XY bounding-box center and minimum Z before it applies model transforms. Derive the transform from the STEP BREP or bounding box and pin axes. Do not tune it from an oblique preview.

Hash a local model file before binding it. Preserve the complete unrelated property map when changing model identity, title, or transform. A top orthographic view is useful for pad and pin registration but the private 3D view command remains version-pinned.

Mechanical proof should compare:

- pad and pin axes;
- seating plane and board penetration;
- outline and mounting datums;
- source model bounding box and applied transform;
- reopened model identity and transform.

A convincing preview does not prove a durable model binding.
