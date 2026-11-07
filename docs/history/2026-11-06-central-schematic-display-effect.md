# Central schematic display effect provenance

The original native owner now privately issues and revalidates the SCH Text/peer
effect. The stable effect entry module reexports that issuer; the owner imports
only a pure comparison leaf. This avoids an owner→effect→owner runtime cycle
when the later clock/Save path requires the actual effect.

The pure leaf independently parses the full DOCHEAD, selected Text and five peer
rows from preflight, acknowledged modify and observe packets, retaining the same
window and exact intended body/peer roster. It returns native provenance false.
Only the central issuer, after its original factory/arguments and three exact
private native packet references pass, changes that marker to true and records
the immutable effect in its own WeakMap. Copied results, structural owners and a
second issue attempt refuse. Historical effect lookup rechecks the original
packet references and their complete immutable content; it grants no live owner,
clock, Save or SQL continuation.

Eleven focused checks passed using pinned Node 24.18.0, including the production
owner/registry with an explicit inert native-stage seam, copied packet/effect
refusal, exact source/peer comparison, and separate original root/Job cleanup.
Both TypeScript projects and zero-warning type-aware lint passed. No app, native
stage, modify, Save or persisted/reopened writer was exercised. Generated helper,
pins, bundles and coverage were unchanged.
