---
name: easyeda-manufacturing-release
description: Prepare and verify an EasyEDA Pro fabrication or assembly release, including Gerber/drill, BOM, placement and revision consistency. Use for export, DFM review and release packages. Does not authorize uploading private designs, ordering boards or purchasing parts.
---

# EasyEDA manufacturing release

Prepare a reproducible file set from one identified saved design revision. Prove that fabrication geometry and assembly data agree before calling it ready for review or manufacture.

For live exports or checks, read the sibling [control skill](../easyeda-pro-control/SKILL.md) and inspect actual export capabilities. Offline release files can be checked without an editor connection. Export format support and live validation vary by installed version.

Some installed File getters invoke Save All internally. The current facade
refuses schematic netlist/BOM/document and PCB netlist/BOM/PDF exports for this
reason. Do not retry them through raw SDK calls or UI as a refusal workaround;
report the missing controlled export path. Simulation export also requires an
NGSPICE editor outside the admitted document types.

## Task references

- For readiness, artifact scope and fabrication data, read [fabrication package](references/fabrication-package.md).
- For BOM, centroid coordinates, rotations, variants and assembly documents, read [assembly consistency](references/assembly-consistency.md).
- For final acceptance, evidence and controlled handoff, read [release and bring-up](references/release-and-bring-up.md).

## Release contract

Record the board/version, saved state, variant, fabricator/assembler and selected process. Collect their current format and capability requirements. When these are unknown, prepare a provisional package with explicit assumptions and unresolved checks, not an unconditional manufacturing approval.

Check schematic-to-PCB consistency and every required ERC/DRC policy. Review known waivers with their exact scope and rationale. Rebuild and inspect copper if required; a cleared error panel or stale check result is not a new passing calculation.

Export to a task-owned location without overwriting unrelated artifacts. Record settings, units, origin, side convention and hashes. Check the exported files independently: outline and drills, layer functions and polarity, copper connectivity where sufficient data exists, mask/paste, BOM identity/quantity, placement and polarity. A successful API call does not prove a complete release package.

Keep fabrication, assembly, design archive and review documentation separate. Reconcile component designators and variant exclusions across them. Retain the previous release when producing a new revision. If an export or check is ambiguous, inspect its recorded operation before trying again; a timeout does not prove that work stopped.

Preparing files does not authorize uploading them to a web viewer or manufacturer, submitting an order, accepting a component substitution, paying, publishing the design or contacting a supplier. Use local review tools unless that external action is in scope.

## Handoff

List delivered artifacts, exact revision, completed checks, known waivers and missing evidence. Use precise states such as "exported and inspected" or "ready for customer review". Claim manufacturing readiness only for the actual process and checks established; regulatory or safety certification requires its own evidence.
