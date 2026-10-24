# PCB 209 selection, component-pad associations and retained queries

Date: 2026-10-24. Starting commit:
`3bae835424571051fa4aeeec8f6bcfc652f02c79`; installed plugin generation
`0.3.0+codex.20261024000500`. This is a source-research proposal, not an
implementation or connected-validation result. No live EasyEDA call, project
read, navigation, source modification or test was performed for this research.
The parent agent owns the separate live five-family validation.

## Recommendation

Add one fixed, one-shot original-owner observation that combines the nine
currently supported primitive families, ordered selected IDs and a bounded
requested set of component-to-pad child lists. Add a separate repeatable query
over its retained accepted result for exact IDs and scalar filters. This gives
useful selection, lookup and association support in one implementation batch.

The live operation should accept `componentIds`, defaulting to an empty list,
with at most 16 distinct bounded IDs. These are data arguments to a fixed
program; they cannot choose native topics or code. Reading all 256 possible
components' child lists would require hundreds of sequential native calls.
The proposed cap is an operational choice, not an EasyEDA API limit.

Do not put filters on the live observation initially. Complete family
projections are needed to correlate selected IDs and component child lists.
Filters therefore would not reduce its native work, and a repeatable retained
query provides the same inspection utility without suggesting fresh SDK `get`
execution. A later dedicated fresh lookup can use the same validated projection
and explicitly identify its different execution semantics.

## Source commitments

The application profile remains `3.2.209.8a704eab`. The installed assets and
serializers are the same ones reviewed in
[the five-family reader research](2026-10-24-pcb209-extended-reader-research.md).
Offsets below are zero-based JavaScript UTF-16 string offsets, not file byte
offsets. These commitments must remain separate from legacy 206 admission.

| Asset relative to `resources/app/assets/` | SHA-256 |
| --- | --- |
| `pro-pcb/3.2.195.6b67774e/js/pcb.js` | `a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b` |
| `pro-ui/3.2.198.2800f583/js/ui.js` | `3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6` |
| `pro-api/0.3.59.1ca9efb5/api.js` | `e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1` |
| `pro-api/0.3.59.1ca9efb5/api-types.d.ts` | `0a6910f4108f3d09733a9de9176b20c41ccd2a87fc4e335f8d6d656eb054ba72` |

The installed declarations expose scalar and array `get` overloads for Line,
Arc, Via, Component, Pad, String, Attribute, Dimension and Image. Collection
filters differ by family. The official pages describe the methods as beta;
their example creation, selection and deletion programs were not executed.

| Family | Declared collection filters |
| --- | --- |
| Line, Arc | net, layer, primitiveLock |
| Via | net, primitiveLock |
| Component | layer, primitiveLock |
| Pad | layer, net, primitiveLock, padType |
| String, Dimension, Image | layer, primitiveLock |
| Attribute | parentPrimitiveId, layer, primitiveLock |

Primary references: [Line.getAll](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitiveline.getall.html),
[Via.getAll](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivevia.getall.html),
[Component.getAll](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivecomponent.getall.html),
[Pad.getAll](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivepad.getall.html),
[Attribute.getAll](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitiveattribute.getall.html),
[Line.get](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitiveline.get.html)
and [Attribute.get](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitiveattribute.get.html).
The installed declarations provide the full overload inventory; a method page
may display the scalar signature while describing arrays in its parameters.

## Selected-object reads

The native selection handler at PCB10410445 calls the selection manager's
`getItems()` and maps each object's complete `globalIndex`, preserving order.
The fixed topic is
`pcb/extensionAPI/selectcontrol-getAllSelectedPrimitiveIds`. Its public wrapper
at API1516447 uses the corresponding extension topic. The official
[selected-ID method](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_selectcontrol.getallselectedprimitives_primitiveid.html)
returns an array of IDs.

Use that ID list with complete family projections. Do not use the public
object mapper as the evidence source. At API1516603, the modern
[getAllSelectedPrimitives](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_selectcontrol.getallselectedprimitives.html)
switch constructs public objects for some native types but silently skips its
`Text` and default cases. Its installed declaration also carries a private
remark that object construction is incomplete. The deprecated
[getSelectedPrimitives](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_selectcontrol.getselectedprimitives.html)
at API1519394 returns the raw native serialization. That raw handler filters
objects without `toJSON` and can replace a truthy serialized net with
`showNet`. Neither path establishes a complete supported selection by itself.

The proposed reader should retain the ordered selected IDs and all nine
complete supported family projections. Every selected ID must resolve to
exactly one projected row; unsupported or missing IDs refuse the whole
observation. It must not silently drop selected regions, copper, drawings or
uninstantiated objects. An empty selection is valid, while the family
projections still support retained queries and requested relationships.

Preserve current family limitations: parentless String only, instantiated view
membership, existing supported Pad shapes, and explicit omissions in Component,
Attribute, Dimension and Image DTOs. Selected-object support does not repair
those omissions or instantiate SDK objects.

## Component-to-Pad associations

The dedicated native topic is
`pcb/extensionAPI/component-getAllPinsByPrimitiveId`, at PCB10340883.
It looks up `gr.getItem(componentId)`. A missing component returns `null`; an
existing component with no pad views returns `[]`. `Le.getPads()` at7401690
returns the ordered backing pad array. The constructor at7397321 puts `Ne` pad
views in that array; vias go into `others`.

Use the complete returned `globalIndex` values. Component serialization at
7408336 modifies embedded `pads[].id` strings, so the retained Component DTO
cannot reconstruct those identities. The public wrapper at API1431168 also
collapses both native `null` and `[]` to `undefined`. The `Xh` constructor at
API1424737 assigns each public ComponentPad's parent from the caller's ID.
That getter is not independent evidence of reciprocal ownership. The official
[component pad lookup](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivecomponent.getallpinsbyprimitiveid.html),
[instance pad lookup](https://prodocs.easyeda.com/en/api/reference/pro-api.ipcb_primitivecomponent.getallpins.html)
and [parent getter](https://prodocs.easyeda.com/en/api/reference/pro-api.ipcb_primitivecomponentpad.getstate_parentcomponentprimitiveid.html)
describe the public association API, but do not establish the native source's
reverse ownership checks.

For each requested component, require membership in the freshly observed
complete Component roster. Retain its ordered child IDs, including an empty
list. Require unique IDs within each group, bounded aggregate child references,
membership in the complete global Pad projection, and agreement on number,
net, layer, lock, metallization and pad type. Reject a child assigned to two
requested parents. A null lookup refuses; it must not become an empty group.
These checks establish native child-list and global Pad membership agreement,
not reciprocal parent/model ownership or schematic pin mapping.

Use global Pad DTOs for geometry. The child handler differs from `pad-getAll`
at PCB10374759: child hole diameter/length and hole offset/rotation are left in
different units, while center and mask expansion use `qe(...,3,"mil")` rather
than the global handler's direct multiplication by10. Comparing those geometry
values directly would introduce false mismatches or incorrect scaling. Child
rows should supply association and the explicitly matched scalar evidence;
their unqualified geometry should not be exposed as a second Pad geometry DTO.

The current retained five-family result cannot answer Component-to-Pad
relationships offline. It omits the native child lists, and its Pad DTO does
not contain an independently observed parent. ID prefixes are not a substitute.

## Proposed fixed live contract

Suggested public action: `observe-selection-relations`. Suggested stage:
`selection-relations209`. The request adds only `componentIds` to the existing
operation/binding identity. Validate the distinct IDs and the cap before
consuming the stage, seal the array into its durable intent, then pass that
exact array as data to the fixed original-owner program.

Each of two samples performs:

1. Native tab/type identity and selected-ID reads.
2. All nine supported collection projections, preserving raw scalar values,
   Component metadata presence states and complete ordered Attribute groups.
3. One fixed native child-list call for each requested Component ID, in request
   order, with the association/scalar correlation above.
4. Selected-ID and native tab/type identity reads again.

Require selection order equality within each sample and complete projected
value/order equality between samples. Retain exact family order as a contract;
the existing legacy pure selection schema's nine-family ordering is a useful
reference, not an admission path. Complete Attribute parent order must still
match the Component roster as established by the installed shared serializer.

The packet should contain the sealed target, all nine geometry observations,
Component metadata states, ordered selected IDs, selected rows in that order,
the exact requested Component IDs and ordered `componentPadGroups`. It should
label its evidence as native selected IDs plus complete family projections and
native child-list/global-Pad membership, with reciprocal-parent,
symbol-pin-mapping, source-membership, persistence and CAD-authority claims
false. Pure decoding independently checks these cross-relations.

With K requested components, two samples require `26 + 2K` local RPCs, at most
58 for K=16, inside one CDP command. The current 256-row family limits,
256-selected-ID limit and 393216-byte aggregate result limit should remain.
Cap aggregate child references at256. Refuse all overflows without truncation.
The existing 10-second guard prevents later calls after timeout; it cannot
cancel a native callback already pending. Sequential matching samples do not
create an atomic editor lock or prove no transient change between checks.

The native getters do not issue edit, Save or selection-change commands. Full
collection serialization retains the known footprint/device/font/cache reads
and possible cache initialization documented in the previous research. The
native serializer executes before facade output bounds. Empty view collections
still do not prove an empty stored board.

## Proposed retained query contract

Suggested repeatable action: `query-observation`, with an exact operation ID,
stage and expected published record SHA-256. Read through the maintained
bounded, symlink-safe journal reader, parse the generation-specific strict
observation schema and verify its original target/intent linkage. Do not accept
caller-supplied JSON or paths as accepted observation provenance. This route
needs no live process, native owner or new CAD intent.

Support a family selector and either distinct exact IDs or family-specific
scalar filters, initially mutually exclusive. Exact lookup preserves request
order and refuses any missing ID. Filtering preserves the retained family
order, uses exact scalar equality and rejects unsupported fields. A nullable
net filter may distinguish null from an empty string as an explicit facade
snapshot feature; the SDK's declared net filter is a string. Do not trim,
case-fold, coerce, regex-match or substitute defaults. Keep the same identity
and result bounds as the source projection.

Return the record SHA-256, stage, recorded time, target, original observation
scope, `historicalSnapshot: true`, `freshNativeRead: false` and the requested
rows/IDs. Preserve relevant Attribute group and Component metadata-state
evidence without claiming a filtered group is complete. Component-pad queries
may return only groups actually observed by the new stage. Existing four-
and five-family stage records can support their own family queries, but must
remain separate observation times; do not combine them into one contemporaneous
nine-family snapshot.

This route is an offline projection facility. It does not implement fresh
public `get`, `getAll` or `getAllPrimitiveId` execution, grant live admission,
or authorize a writer. Coverage descriptions must make that distinction.
Fresh exact lookup remains feasible later using the same complete-family
projections. Direct native `getByIds` is less attractive: track lookup at
PCB10404535 skips absent IDs and does not show the `instanceof` filter present
in the following collection handler; Attribute lookup at10415172 flattens
groups and skips absent matches. Strict lookup over an accepted complete
projection makes those omissions explicit.

## Implementation split and omissions

The pure new module can own the fixed program, strict packet decoder and
bounded query helpers. Existing pure geometry/polygon validators can be reused;
the two established native programs should retain their published semantics.
If common projector fragments are extracted, verify their generated program
bytes remain unchanged rather than silently revising older stages.

Native integration must add the fixed method/parameter builder, original-owner
consumption flag, pipe whitelist and generated native program embedding, with
the corresponding helper identity. Lifecycle integration must add the separate
stage, durable input/result schemas, original method binding, source/target
requirements, byte limits and public inspection summary. The repeatable query
belongs alongside inspection, outside the one-shot native dispatch path. Root
owns integration, coverage, skills, index entry and release coordination.

Remaining deliberate omissions: fresh public SDK object-instance parity;
unbounded all-component child traversal; reverse parent/model ownership;
schematic pin mapping; stored-board completeness; unsupported selected families;
all existing geometry/template omissions; selection changes; and all writers.
These require separate source/effect contracts and are not supplied by querying
an accepted read snapshot. Focused regressions should cover changed selection,
unknown/duplicate selected IDs, null versus empty child lists, child membership
and scalar disagreement, limits, source/target drift and historical query
provenance. No tests were run as part of this proposal.

## 2026-10-24 approved pure implementation

After the proposal, the parent approved the combined live reader with at most
16 requested Component IDs and retained historical queries as a separate
integration task. New implementation files are
[`current-pcb-209-selection-relations.ts`](../../plugins/easyeda-pro-control/server/src/current-pcb-209-selection-relations.ts)
and its
[focused tests](../../plugins/easyeda-pro-control/server/tests/current-pcb-209-selection-relations.test.ts).
The existing four- and five-family sources were not changed. Their reviewed
guard and projector logic was copied into the new fixed program, retaining
source comments and all supported field/encoding restrictions.

The fixed function accepts `(sealed, phase, componentIds)`, with phase
`observe` and an explicit normalized array, including `[]`. The exported
`currentPcb209SelectionRelationsComponentIdsSchema` requires distinct nonempty
well-formed IDs of at most256 UTF-16 units. Quotes, backslashes and control
characters have no additional exclusion; they remain JSON string data, never
code or topic fragments. The source copies those strings before awaiting RPCs.

The strict native packet contains all nine observations, metadata presence
states, selected IDs, requested Component IDs and ordered child groups. Each
child group contains both complete `ids` and `scalarRows` with primitive ID,
number, net, layer, lock, metallization and pad type. The host decoder checks
this scalar evidence independently against the global Pad DTO. Child geometry
is not duplicated or rescaled. The native packet does not duplicate selected
geometry; the host derives selected rows from the complete validated
projection in selected-ID order and applies the final aggregate byte bound
after that expansion.

Frozen function: 23381 UTF-8 bytes, SHA-256
`6a0ab1809fb746a478be73cad8d5e1cd75f23e343ad760963ba609dcd50f6aa1`.
Native and final decoded limits are each393216 bytes. The final schema is
`easyeda-pro-control.pcb209-selection-relations-observation.v1` and the native
kind is `pcb209-original-selection-relations-observation`. Source membership,
reciprocal parent ownership, symbol mapping, connectivity, persistence,
execution authority and Save authority remain explicitly false.

Eight focused tests passed under Node24.18.0 with the required isolation
preload. They exercise selected and child ordering; empty versus null child
lists; missing/duplicate IDs; contradictory child scalars; sample drift;
frame/receiver/target checks at selection, collection and child-call boundaries;
malformed UTF-16 and argument limits; native and decoded byte bounds; and
independent packet forgery rejection. Synthetic callback counts are26 with no
requested parents,30 with two, and58 with16. Strict TypeScript and scoped
type-aware Oxlint passed with no warnings. These are offline synthetic results,
not connected selection or relationship validation. No full suite, build,
compatibility refresh, helper generation or live operation was performed by
this implementation subtask; the parent and native integration agent own those
steps and the retained-query action separately.

## 2026-10-24 pure retained-query implementation

The parent then approved a pure helper in
[`current-pcb-209-observation-query.ts`](../../plugins/easyeda-pro-control/server/src/current-pcb-209-observation-query.ts)
with [focused tests](../../plugins/easyeda-pro-control/server/tests/current-pcb-209-observation-query.test.ts).
It supports published `primitives209`, `extended-primitives209` and
`selection-relations209` results separately. The lifecycle supplies the sealed
target, operation/stage/record-digest/time provenance and, for the new stage,
the original intent's Component IDs independently of the retained result.
This pure helper has no filesystem, live receiver or clock access.

Before any query, the helper reconstructs the native packet and invokes that
stage's existing decoder. The complete canonical decoded result must equal the
stored result, including row order, family IDs/counts, selected rows, metadata
states, projection digest, limitations and authority flags. This consistency
check does not authenticate a file; the lifecycle owns published-record and
unchanged-journal verification. A failed or partially retained observation is
not converted into accepted evidence by this helper.

The final query contract deliberately permits exact IDs together with filters,
superseding the proposal's initial mutually exclusive choice. It resolves every
requested ID against the complete observed family before applying filters.
Missing and foreign-family IDs therefore refuse even if a filter would otherwise
hide them. Requested order is retained; without IDs, observed order is retained.
Filters use exact typed equality: lock for every family; layer except Via; net
for Line/Arc/Via/Pad; Component designator; Pad number/type; and Attribute parent
ID. Null and empty nets remain distinct and matching is case-sensitive. Absent
metadata does not equal a present empty string. Incompatible filter fields,
coercion, duplicate IDs and malformed UTF-16 refuse.

Selection and component-pad queries require the new stage. The latter returns
only a child group actually captured for the requested component, including
valid empty groups. It cannot infer an uncaptured group's contents. Selected
rows and child pads preserve their respective observed orders. Returned
Component metadata states remain attached to their observed identities.
Attribute queries retain the complete original parent roster and label it
separately from potentially filtered rows.

The frozen output is bounded to393216 bytes and identifies
`historical: true`, `freshObservation: false`, record provenance, source
projection digest, counts, rows and scoped group evidence. Execution, Save,
source-membership, reciprocal-parent, symbol-mapping, connectivity and
persistence authority remain false. Historical queries do not implement fresh
public `get` execution or adopt a native owner.

Six focused tests passed with the isolation preload. They cover reconstruction
of all three stages; exact-ID ordering and existence before filtering; nullable,
empty and case-sensitive filters; absent metadata; complete Attribute evidence;
observed selection and child groups; independently supplied original Component
IDs; forged flags/digests/family IDs/selected rows/metadata; target/provenance
drift; malformed UTF-16; and source byte limits. Strict TypeScript and scoped
type-aware Oxlint passed. No full suite, build, compatibility refresh or live
operation was run by this helper subtask. The fixed native selection/relations
function remains byte-identical to the frozen digest above.
