---
name: electronics-design-review
description: Review an electronic design against requirements, datasheets, pin mappings and physical constraints using supplied schematics, layout and manufacturing evidence. Use for design audits, risk analysis and test planning, including offline work. Not for routine drawing edits or bridge troubleshooting.
---

# Electronics design review

Review whether the design meets its requirements and what evidence supports that conclusion. Find concrete failure mechanisms, not a generic checklist score.

## Read by review stage

- For scope, assumptions, component ratings and schematic behavior, read [requirements and circuit review](references/requirements-and-circuit-review.md).
- For library, PCB and production risks, read [physical and production review](references/physical-and-production-review.md).
- For evidence quality, findings and test coverage, read [evidence and test planning](references/evidence-and-test-planning.md).

Use the exact manufacturer datasheets, errata and process requirements for the actual parts. References provide reasoning and source pointers, not universal electrical values. Browse primary sources when verifying uncertain or current device/process facts.

## Review contract

Establish intended operating conditions, worst-case inputs and loads, interfaces, environment, mechanical limits and assembly variant. Separate supplied facts from assumptions. A missing requirement limits the verdict; it does not prevent useful checks on known facts.

Work offline by default for supplied artifacts. Do not launch or modify EasyEDA, upload files, change parts or accept waivers under a review-only request. If the user requested live inspection, use the sibling [control skill](../easyeda-pro-control/SKILL.md) for application actions; never treat a review as editing authority.

Follow power, signal and return-current paths. Correlate schematic pins to exact package terminals and physical pads. For each concern, state the artifact/location, failure condition, consequence and evidence. Distinguish a confirmed defect from a plausible risk or an uncheckable point.

Check calculations at relevant tolerance, temperature, supply, timing and load extremes. Typical curves and absolute maximum ratings are not guaranteed operating design points. Do not claim compliance, safe mains isolation or battery charging safety from a schematic screenshot or generic spacing rule.

Record enabled ERC/DRC checks and their scope if provided. A clean report does not prove electrical correctness, signal integrity, thermal margin, assembly fit or regulatory compliance. Review images at a usable scale and use netlist/source data for connectivity claims.

## Deliver findings

Lead with defects that threaten safety, board function or expensive rework. For each, recommend the smallest scoped corrective action or the missing measurement/document that resolves uncertainty. Include coverage and remaining risks. A test plan is proposed evidence; only actual results support a validation claim.
