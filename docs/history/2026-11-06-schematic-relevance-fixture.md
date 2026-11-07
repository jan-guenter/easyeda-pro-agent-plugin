# Schematic fixture with an explicit Relevance attribute

The original six-record schematic fixture remains unchanged. Its reported
Text/Wire/Bus child-source refusal exposed a real native construction rule.
`fh` creates a default unstored Relevance ATTR for Wire. Bus has `isWire:false`
and creates none. An incoming same-key source ATTR takes the custom-attribute
branch; an earlier different-ID default is detached before replacement. The
original six-record opening is never replayed by this increment.

The separate `schematic-text-wire-bus-relevance` kind generates fresh in-memory
SCH and SCH_PAGE data with the existing Text, Wire, Bus and two LINE records,
plus exactly one explicit ATTR. Its ID is a fresh leading-zero16-hex source ID,
its ticket is7, parentId is the actual Wire ID, key is `Relevance`, value is
`[]`, both visibility flags are false and zIndex is1. The complete21-field ATTR
body follows the pinned current manager `vF.onAttr`/`DF.encodeAttr` serializer.
The page has seven records including META. No caller source, user project or
existing SQLite is modified to create it.

The new template records both complete pinned SCH scripts and their constructor,
parent, child, removal, index and decoder spans, plus exact manager serialization.
`check-schematic-relevance-fixture-source.ts` verifies those bytes and executes
the actual extracted Wire/Bus construction and same-key replacement fragments on
an inert local graph. Both connected and unconnected default cases detach the
old child; the actual connected callback removes its index ID. Bus creates zero
defaults. Actual manager ATTR serialization matches the generated body. Monitor
and history callbacks in that checker are explicit no-ops. This source exercise
creates no original native owner and proves no connected replacement or import.

The data model has separate immutable brands:

- `sch209-relevance-fixture-template.v1` and
  `generated-schematic-relevance-fixture-archive.v1`;
- `qualified-generated-schematic-relevance-fixture-target.v1`;
- `generated-schematic-relevance-fixture-open-checkpoint.v1`;
- `private.generated-schematic-relevance-fixture-opening-source.v1`.

The distinct initial qualifier proves the complete35-table initial baseline,
all encrypted history/source bytes, both real document headers, every record and
ticket, exact ATTR body/parent, native file clocks and imported structure. The
old SCH qualifier rejects this source. The new checkpoint independently repeats
the entire qualification and the complete one-field VACUUM projection. Staging
retains the original importer runtime/launch identity, rejects it as the next
opening runtime, and consumes only its own actual token once on a different fresh
ordinary launch. It transfers immutable data, not PID/Job/HMAC or native ownership.

The maintained importer, destination and original closed-capture path accept the
new fixed basename `Codex_schematic_relevance_<16hex>.eprj2`. Its new Windows-clock
report is `managed-schematic-relevance-fixture-closed-snapshot.v1`, with
`issuedSchematicRelevanceDataTarget`. Old capture schemas remain unchanged. The
destination request cap and original8-of16 closed-capture derivation are unchanged.

An explicit read-only union mounts the new token/checkpoint into the existing
fresh ordinary `generated-schematic` coordinator. A separate fixed navigation
function permits the new basename, then keeps the same one-shot registration,
project and real page prefix and independent page/parent identity. The Text,
Wire and Bus batch returns the distinct
`generated-schematic-relevance-readers-result.v1` and checks each complete custom
attribute-ID roster against the original seven-record history. Extra or missing
ATTR IDs refuse. No generic source guard is relaxed.

The old display writer argument/checkpoint/effect brands and six-record/ five-peer
source program remain unchanged. They do not accept this new target. A future
display profile needs its own seven-record/six-peer arguments, original accessor,
worker/clock, SQL, structure and closed-persistence joins. Historical closed-data
reuse also needs a separate new-profile parser/qualifier branch. Neither is
claimed by this source increment.

Pinned Node24.18.0 verification passed33 focused cases, including a genuine
Engine/Upstream loopback HMAC composition and original tracked cleanup for the new
data brand, with synthetic UI and checkpoint preparation explicitly marked as
test seams. Both TypeScript projects and strict type-aware lint pass. The new
full-source/actual-construction/serialization checker passes. No Windows helper,
app, native import, reader or Save was run by this child. Native import/closure,
positive Text/Wire/Bus and complete saved effects remain separate root-owned cases.
