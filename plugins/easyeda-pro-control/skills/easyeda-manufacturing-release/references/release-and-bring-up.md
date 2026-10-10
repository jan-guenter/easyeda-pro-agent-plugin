# Release and bring-up

Research checked: 2026-10-10. This reference is a release-control and proposed-test workflow. It does not authorize hardware energization or external submission.

## Release gate

Assemble the evidence for the actual process:

- Requirements and revision/variant identity.
- Schematic review, exact pin-to-pad mapping and approved component definitions.
- PCB association, routing, configured rule results and reviewed exceptions.
- Stack, fabrication capabilities, mechanical fit and relevant thermal/SI analyses.
- Independently inspected fabrication output and reconciled assembly data.
- A list of unresolved risks, manufacturing notes and any supplier-specific assumptions.

Distinguish pass, reviewed exception and not checked. A checkbox with no artifact or scope is weak evidence. An accepted waiver must identify the exact rule/object, reason, conditions, owner and impact; it is not a global permission to disable that rule.

Do not require irrelevant high-speed analyses for a simple low-frequency board, but do justify why a check is inapplicable. Apply design-specific risk: high-energy power, precision analog, fast interfaces and constrained mechanics require different evidence.

## Immutable handoff

Use one identified release directory containing fabrication, assembly and review subgroups or an equivalently clear layout. Include a manifest with file names, hashes, purposes and source revision. Keep the editable design archive clearly separate from files intended to manufacture.

Record export settings, unit/origin/angle conventions, software versions and conversion steps. Retain the previous release and issue a new revision when changing manufacturing inputs. Do not splice an updated BOM into an old placement/Gerber set without demonstrating consistency.

A suitable short release record:

```text
Board and release revision / assembly variant:
Saved source identity and export provenance:
Fabricator / assembler / selected process:
Stackup and special manufacturing requirements:
Delivered artifacts and manifest:
Completed checks and evidence:
Reviewed exceptions and approval scope:
Unresolved risks / required next actions:
```

Avoid private credentials or unrelated project data in release notes. Publishing this methodology does not authorize publishing a real design.

## Proposed bring-up plan

Define tests from failure mechanisms and requirements, not just “power it on.” Include expected result, instrument/fixture, conditions and stop criteria. Typical stages, selected for the design, are:

1. Visual and mechanical inspection: fitted part identities, solder defects, orientation, missing/DNP parts, debris and connector keying.
2. Unpowered electrical checks: expected supply/return relationships and obvious shorts, accounting for semiconductors and capacitive charging that can affect meter readings.
3. Controlled initial power: selected safe current/voltage limits, rail sequence, input/rail measurements and explicit stop conditions.
4. Reset/clock/boot configuration and programming access.
5. Interfaces and loads individually, then combined operation and peak demand.
6. Thermal, tolerance, transient and environmental tests at the required operating corners.

These are proposed stages, not proof that tests ran. Set current limits from the circuit and fixture; a generic low value may prevent normal startup and a generic high value may fail to protect the board. Establish whether current limiting changes regulator behavior or sequencing.

For mains, high voltage/current, energy storage, batteries or safety-critical equipment, define competent personnel, isolation, protective equipment, discharge procedure and applicable standards before testing. Do not infer safe operation from board spacing, a DRC pass or a current-limited supply. Avoid asking an unprepared user to perform hazardous measurements.

Review probing effects: long ground leads, input capacitance, bandwidth and reference connection can alter or misrepresent fast/analog behavior. A proposed oscilloscope connection must not short an isolated or elevated node through protective earth. Identify the measurement setup needed instead of assuming every instrument is floating.

## Result language

Use precise states:

- “Package prepared”: files were generated; independent acceptance may remain.
- “Exported and inspected”: stated artifact checks completed.
- “Ready for the specified fabrication/assembly review”: supplier requirements and known checks established, outstanding approvals disclosed.
- “Test plan prepared”: measurements have not been performed.
- “Validated under these conditions”: actual recorded results cover those conditions only.

Do not turn a successful prototype test into an unconditional production or certification claim. Record failures and changes, update the design/release revision, and rerun affected checks before a new manufacturing handoff.

## Scope boundary

Uploading a package to a web viewer, fabricator or assembler; ordering boards or parts; paying; accepting substitutes/waivers; publishing; and contacting suppliers are separate external actions. A request to prepare or review files alone authorizes none of them. Keep a safe next step available: supply the checked local package and ask for the missing process choice or authorization when necessary.
