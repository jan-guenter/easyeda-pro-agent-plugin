# Readability and acceptance

Research checked: 2026-10-10. This is a reusable editing method, not a mandated drawing style. Preserve the user's conventions when they communicate the circuit clearly. Read the connectivity reference when positions, wire geometry, labels or ports change.

## Choose a useful page structure

Group by function and signal/power relationship. Put page boundaries where the interface is understandable. Avoid moving unrelated circuits merely to make every sheet symmetric.

Show the context needed to use each block: input, output, supply, control, connector identity and relevant constraints. A converter should make feedback and switching components easy to follow; a sensing circuit should make the measured node, bias and reference explicit.

Use left-to-right signal flow and top-to-bottom supply flow where they help, not as universal constraints. For bidirectional interfaces, feedback or connector circuits, another arrangement may be clearer. Keep a multipart device understandable across units without suggesting multiple physical packages.

Give the reader a path through hierarchy. Use stable page titles and references, explain port direction and scope, and avoid naming two unrelated signals similarly. An active-low notation needs consistent interpretation in both drawing and compiled names.

## Components, captions and wires

- Keep designator, value and critical properties associated with their owner. After rotation or mirroring, check association rather than only text overlap.
- Use enough spacing for visible pin names, pin numbers, net labels and drawn lines at the delivery scale.
- Prefer short orthogonal routes where they reduce ambiguity. A longer clear wire can be better than a crossing through pin text.
- Avoid four-way junctions and visually ambiguous crossings when a T-junction or explicit label communicates the same circuit more clearly.
- Use local wires to show close functional relationships. Use labels for distant connections; do not replace every wire with a label if that forces readers to reconstruct the whole block.
- Distinguish wire connections from decorative borders and annotations. Never use a graphics polyline as an electrical replacement.
- Limit redundant captions when the underlying symbol or adjacent label already communicates the same net. Hide a display field only if the electrical value remains unchanged.
- Explain deliberate options, jumpers, default states and assembly variants where the reader needs them. Keep the authoritative part/variant data in properties too.

EasyEDA can align/distribute objects and place attributes, but moving an object can also move connected wires or regenerate caption placement. Inspect the actual effect of each supported operation. Do not assume a group alignment preserves connectivity.

## Plan a redraw with measurable invariants

Before editing, retain a baseline that can identify every component and physical pin. Define whether values, device/library bindings, visibility, text, sheet metadata or wire geometry may change. Treat pin-number, no-connect, net-name and footprint changes as electrical/assembly changes, not styling.

Break work into complete functional groups where practical. A transaction boundary should leave a coherent circuit; it should not strand a partial translated chip or a wire replacement awaiting later steps. Keep independent labels separate if that is genuinely lower-risk, but do not split a coupled topology simply to reduce operation count.

A proposed placement needs joint checks. Individually clear captions can collide when several are applied together. Include both fixed obstacles and other proposed text/lines, and review association with the owning component. A collision checker cannot fully judge readability.

## Visual acceptance

Inspect the saved view at the actual output scale, not only while zoomed far in:

- Full-page view for hierarchy, grouping, frame fit and empty/overdense regions.
- Functional-block views for pin/caption association and clear signal paths.
- Closeups for dense connectors, IC pins, junctions and important options.
- Exported PDF or image when that is the requested deliverable, checking text size, clipping and page order.

Do not accept a black or incomplete capture as proof. Record which page and revision the image represents. The live reader/context and capture should refer to the same state; stale screenshots can conceal a failed edit or an unsaved result.

## Electrical and durable acceptance

For presentation-only work, compare complete before/after pin-to-net and no-connect relationships. Verify retained component values, designators and library/footprint bindings. Investigate all non-presentation deltas. Preserve complete saved-project coverage through the control skill's supported proof.

When a native metadata operation such as renaming a page is required, verify its exact saved effect independently. Do not assume that an acknowledgment, text box value or disabled Save button proves persistence. Never repeat a completed Save to obtain a cleaner receipt.

## Suggested handoff evidence

Keep only evidence proportionate to the change: target page/revision, expected and actual deltas, connectivity comparison, itemized check disposition, usable visual captures and durable-result status. If a native/library limitation prevents complete verification, state the affected claim rather than declaring the whole task proved.
