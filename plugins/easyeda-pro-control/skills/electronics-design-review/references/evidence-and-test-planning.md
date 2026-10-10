# Evidence and test planning

Research checked: 2026-10-10. A review explains why a design is likely to meet requirements, which evidence is missing and how to resolve uncertainty.

## Distinguish evidence classes

- Supplied fact: explicitly stated in a document or artifact, with its revision.
- Source-backed conclusion: follows from exact specification or verified artifact data.
- Engineering inference: plausible mechanism supported by reasoning, not directly measured.
- Unresolved question: evidence is missing or contradictory.
- Actual test result: recorded measurement and conditions, not a proposed test.

Do not hide uncertainty in phrases such as “looks fine” or “should pass.” State what was checked and what the conclusion covers. If only a rendered schematic is available, say connectivity was visually inspected rather than netlist-verified. If only exported geometry exists, do not claim it matches an unavailable saved project.

Use the exact part's datasheet revision, errata and guaranteed conditions. Browse official sources when the claim is uncertain or requirements may have changed. Application notes explain mechanisms and device examples; they cannot substitute for an unspecified device's limits. Paid standards' public abstracts do not establish the rules required for compliance.

## Prioritize findings

Separate severity from confidence. A plausible safety concern may deserve immediate attention despite missing information; a certain alignment issue can still be low priority.

| Finding class | Recommended report treatment |
| --- | --- |
| Confirmed defect | Exact contradictory facts and smallest correction |
| Supported risk | Trigger condition, mechanism, consequence and resolution evidence |
| Missing requirement/data | Why it matters and which decision it prevents |
| Improvement | Benefit and tradeoff without presenting preference as necessity |

Avoid redundant findings for one root cause. If a wrong package mapping causes multiple affected nets, describe the root cause and list its scope. Do not suppress secondary consequences that require different checks after correction.

Provide actionable locations: sheet/component/pin/net, package pad, physical layer/region or specific file row. For a screenshot, use a visible label and approximate region, not invented stable IDs. Quote source sections sparingly; explain the implication in original language.

## Build tests from requirements and mechanisms

Each proposed test needs:

```text
Requirement / suspected failure mechanism:
Revision, mode, supply, load and environment:
Stimulus and measurement points:
Instrument, fixture and probing constraints:
Expected result and acceptance limit:
Stop condition and safe handling:
Result record and remaining coverage:
```

Choose tests that discriminate competing explanations. For example, a drooping rail could arise from current limiting, input wiring, transient load, regulator instability or incorrect measurement. Establish input and output behavior under defined conditions rather than recommending an unexplained capacitor change.

Select relevant corners: startup and shutdown, brownout, combined loads, hot plug, external interfaces when the board is off, temperature extremes, supply extremes and component tolerances. A nominal bench measurement does not prove all required states.

Separate design verification from production test. Verification can use detailed probes and controlled corners; production test needs repeatable fixtures, coverage, fault discrimination and practical limits. A production continuity test does not replace validation of a precision analog transfer function.

## Measurement limits and safety

Account for instrument bandwidth, accuracy, reference, probe capacitance, ground lead inductance and fixture parasitics. A measurement path can change the circuit under test. Record whether simulation models represent the relevant nonlinear, thermal and parasitic behavior.

For powered tests, establish authorized personnel and equipment. Do not propose casually energizing an unknown high-energy, mains, battery or isolated circuit. Specify safe preparation and stop conditions, and request qualified review when the setup requires it. A scope's grounded probe clip can short an elevated or isolated node; never assume the instrument floats.

If the task is review-only, leave tests as recommendations. Do not control hardware, modify the CAD design, upload artifacts, contact suppliers or approve manufacturing. A finding that needs those actions should identify the next authorization or missing resource.

## Review output

Lead with the most consequential findings. Include:

1. Scope and available revision/artifacts.
2. Confirmed defects and supported risks, with locations/evidence.
3. Required decisions, missing data and proposed tests.
4. Completed coverage and unreviewed areas.
5. A conditional verdict appropriate to that evidence.

Use “no issues found in the checks performed” rather than “no issues.” If a corrected design is supplied later, review changed areas and affected assumptions while retaining the previous finding history. Do not declare an old risk resolved merely because a component value or screenshot changed.

## Primary-source routing

Use the sibling design skills' dated references for relevant EasyEDA workflows and semiconductor/fabricator source pointers. Then obtain exact product documents for the reviewed circuit. The generic references do not prove a specific board's compliance or fitness.
