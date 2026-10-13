# PCB active-layer reader: source review and offline contract evidence

This change adds `eda.pcb_Layer.getCurrentLayer` to
`easyeda_control_sdk_read` as a **native task equivalent**, not as execution or
return-parity of the public method. The installed public method is an empty
body. The adapter reads existing native document-source and public
`getAllLayers` observations; it never calls the empty method or a new private
API.

At the original source-review checkpoint the new coordinator had not been built, installed or
run against a connected editor. Passing source tests and an offline comparison
of captured disposable-project observations do not establish that lifecycle.
The user's production project was not inspected or changed for this work.
The later [combined release verification](api-coverage-source-candidate-2026-10-11.md#final-combined-verification-after-the-selection-correction)
records the completed build and full tests. The installed-generation evidence
below supersedes the pending status for its specific cases only.

## Installed071500 disposable validation

The installed `0.3.0+codex.20261011071500` reader returned active Top Layer 1
from two matching source/list/source cycles. The complete public enumeration
contained 262 rows, including the six unchanged malformed inactive-color
strings described below. Complete native source and inventory matched before
and after; all 18 saved documents, 383 materialized records and the full logical
SQLite dump were unchanged. Normal application close preserved the source-file
hash. No layer change or Save was performed.

The same batch validated filtered membership for two component pads and one
via on a populated net, case-insensitive component-pad matching, and an empty
standalone-Pad/Arc result. It did not validate nonempty standalone Pads/Arcs,
Line ownership, primitive-type lookup, electrical connectivity or a writer.
Two inherited silkscreen children remain outside the standalone LINE proof.

The retained, independently reviewed audit is SHA-256
`68bd56435a7c63d16d04bc9eeacffaad588dd73dc75f27b5d5da489605a97069`.
It binds the installed payload, source closure, managed receipts, complete
context and immutable backups. This does not admit a later facade build.

An initial caller supplied only project/document UUIDs and type; it refused
before any engine read. These native PCB readers also require the observed
`tabId` and `parentProjectUuid`. Copy the complete fresh document context;
do not fabricate owner fields or loosen the guard.

## Reviewed implementation

These are complete installed-file SHA-256 hashes, not declaration hashes.
Offsets below are JavaScript string/UTF-16 offsets.

| Bundle | SHA-256 |
| --- | --- |
| `pro-api/0.2.53.aee2f57a/api.js` | `5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc` |
| `pro-pcb/3.2.149.5378b690/js/pcb.js` | `65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54` |

The PCB layer manager's active-layer field and getter near 7861902/7864762 and
the native `ACTIVE_LAYER` source model at 4426612 identify the same active
layer. The source serializer includes that model at 10827552. Canonical source
record encoders are at 2243171 (`ACTIVE_LAYER`) and 2243361 (`LAYER`), using
`Gc` at 1910537 to encode `JSON.stringify(["LAYER", numericId])`. Native `Yv`
decodes array keys by their second element, so a canonical selected key plus a
noncanonical alias is ambiguous; the adapter rejects noncanonical `LAYER`
headers, including such mixed cases. A body's `layerId`, when present, must
also match the selected header identity.

The installed public method at 1366589 is `getCurrentLayer(){}`. The working
`getAllLayers` producer at 1369090 returns exactly nine fields: `id`, `name`,
`type`, `color`, `transparency`, `inactiveColor`, `inactiveTransparency`,
`layerStatus`, and `locked`. Its `Pie` mapper at 1370133 maps native types to
the existing public categories, including the `OTHER` fallback. `oM` at
1370536 rounds `(1 - alpha) * 100` to two decimal places. The native callback
near 10234500 produces the corresponding layer-manager data. The status getter
at 7858181 returns `config ? (visible ? 1 : 2) : 0`, matching native source
`use`/`show`. Colors remain public display projections; they are not asserted
equal to stored source colors.

### Raw color strings are not CSS validation

The installed `Qc.toString` at 602462 converts each floating channel times 255
to hexadecimal and slices its first two characters without rounding. `ee`
aliases `Qc` at 603765. The custom-layer palette at 3399250 contains decimal
1413983 (`#15935f`); its builder near 3399632 computes inactive colors using
`.mul(.5)`. The red channel becomes 10.5, whose hexadecimal string starts
`a.8`; slicing produces `a.`. The resulting public inactive color is
`#a.492f`, not valid six-digit CSS hex.

The result schema therefore retains nonempty raw strings bounded to 128
characters. It does not silently correct, evaluate, render or certify them as
CSS colors. Strict hex validation of every row would incorrectly reject an
ordinary active Top Layer when unrelated disabled custom layers contain this
native producer defect. The same raw-string rule applies to the selected
layer; this is a reported SDK field, not an inferred replacement color.

## Contract and refusal boundaries

Only empty method arguments and one exact active project-owned type-3 PCB are
accepted. The caller supplies the complete reviewed private fingerprint and
exact context. The source must have the expected PCB identity, edit version
`3.2.149.88089769`, valid full-snapshot commitment, at most 20,000 records and
one canonical `ACTIVE_LAYER` with one corresponding canonical `LAYER`.
Native IDs and public IDs are positive integers bounded to 65535; public
enumerations contain 1–512 unique, strict nine-field records.

The selected native and public records must agree on ID, name, mapped type,
locked state and `use`/`show`-derived status. Unknown unrelated source families
remain in the complete source hash and are not interpreted or discarded.
There is no claim that stored source layers enumerate the whole visible
manager: defaults may exist only in the public enumeration.

Two complete `source / layers / source` cycles must match. Each observation
uses the existing reader's two-sample commitment; the coordinator also checks
the complete context around each read and the full runtime fingerprint at
both ends. Source hashes bracket each public enumeration. The public SDK
commitment is checked using the actual producer formula: its sample is hashed
before the coordinator adds `authority` and `read_consistency`. Exact source
commitments retain their separate actual formula.

Missing or ambiguous active layers, unsupported source identities or versions,
malformed fields, oversized observations, context drift, runtime drift and
quarantine all refuse. No undefined/no-active-layer result, complete public
method contract, complete design state, connectivity, saved-file or persistence
proof is claimed. A switch away and back entirely between observations remains
undetectable. The adapter makes no selection, layer change, navigation,
settings write or Save.

## Verification at this checkpoint

- 354 focused tests pass across the new reader, SDK argument/catalog readers,
  registered-tool routing and API coverage. No skips or failures on this host.
- TypeScript checking and strict type-aware lint of all changed reader,
  integration and test files pass with no warnings.
- Regressions execute the exact reviewed public mapper and rounding bodies
  through the real SDK coordinator and result validator, then consume that
  actual envelope in the new coordinator. They are not hand-built DTO-only
  tests.
- Native encoder tests execute the reviewed `ACTIVE_LAYER`/`LAYER` key bodies
  and parse their emitted source text through the production
  `parseDocumentSource`. The reviewed native status getter covers all four
  `use`/`show` combinations. Exact native color conversion, multiplication and
  serialization methods reproduce `#a.492f`; the actual public producer and
  coordinator preserve it. Only object allocation/cache is a test harness.
- When the installed Windows application is mounted, tests verify complete
  bundle hashes and exact reviewed producer bodies. Those two presence checks
  skip on hosts without that installation; the producer regressions still run.
- Parent-collected immutable disposable captures were read offline:
  `pcb-source-before.json` parses to 157 records with source SHA-256
  `9ca1ea87e1cdb84faff7815b1cb02492bc014003fff9f0c3aba24c7ba73dd1c5`;
  `pcb-layers.json` contains 262 public rows. The derivation returns the exact
  Top Layer 1 DTO. Six disabled custom rows contain the malformed inactive
  color above. These separate captures test compatibility of the derivation,
  not the new coordinator's connected stability proof.

At that source-review checkpoint the generated 774-path inventory classified 193 public subsets, 88 native
task equivalents, two internal lifecycle methods, eight blocked methods and
483 omissions. The later selection correction changes the public/native counts
to192/89, as recorded in the combined release report. Coverage still grants no execution authority. Closed-document
rename remains omitted: its mutable UI row-index setter and project-qualified
database update path need separate worker/serializer, uniqueness, lifecycle
and recovery review; this read-only addition supplies none of that authority.
