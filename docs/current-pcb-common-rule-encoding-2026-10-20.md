# PCB rule, filter and disabled-panel encoding

`current-pcb-common-rule-encoding.ts` predicts selected format2.0 rows from two
strict supplied graph replies. It models all fourteen rule families,
RULE_TEMPLATE, the fixed37 PRIMITIVE filters and a separately returned disabled
PANELIZE row. Separate panel output avoids inventing a complete export order.
Every ownership, atomicity, complete-baseline, native-no-mutation, stored-source,
queue, effect, Save and execution flag stays false. This is not a live writer.

The original decoded rules and presentation graph hashes bind unknown and
unencoded fields independently of body hashes. No model getter, toJSON method,
FileSource, native update, rule repair or Save is called. Nonempty NET, selector
and EQLEN branches remain excluded by the strict raw rules decoder.

## Source contracts

All offsets below refer to the inert PCB asset SHA-256
`217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33`,
10,976,299 bytes. Offsets are JavaScript string offsets. No vendor source was evaluated.

| Contract | Source offsets | Host relation |
| --- | --- | --- |
| Rule unit | mutable `_Fe`3443965, j1.unit3443991 | Raw fixed reader now captures `_Fe.UNIT_NAME` as a separate `ruleUnit` root in rules schema v2; no assumed `mm` default |
| Rule order | saveCommonData5840102, getAll3499595 | SAFE, OTHER, CREEPAGE, TRACK, NET_LENGTH, NET_LENGTH_TOLERANCE, DIFFER_ENTAIL, BLIND, RADIUS, PLANE, COPPER, PASTE, SOLDER, AUTO_ROUTER; Map values deduplicate by object identity in insertion order |
| Rule body | format4002783, pD4748084, QRe665570 | Native full object is type/name/state/context; durable body drops type/name into compound ID and retains state/context order |
| Rule scaling | Hs4743362, we3214815 | Multiply10 then round4 with native epsilon; does not convert values according to the unit label |
| Safe clearance | xI3467569/toJSON3469912, fj3466478, VF4743399 | Status0 emits only reference-layer table; other states emit tables in insertion order; raw stride12 storage becomes13 triangular rows, excluding row11 diagonal |
| Layered rules | OX4743697, W64743974, AX4744645, z64744985 | Preserve each width/pad/spacing context's distinct field order; connection-angle conversion retains divide-by-PI then multiply180 before round4 |
| Scalar/default rules | Ky3461412, nC3476630, GF4746129, w34746510, L34746904, dD4747404 | Source fallback for negative thru-to-SMD/hole/creepage values; exact radius, length and expansion fields, including negative expansion sentinels |
| Blind/autorouter | Jx3445712, hR3472776, xne4746302, pD4748084 | Preserve ordered blind descriptions; explicit router enums/defaults; raw layers/ignored-net arrays require serializer-absence evidence |
| Primitive filters | roster4770832, vF4410600, RH9104287/getVisible9107444 | Fixed37-name order, display/pick flags, false for absent filters, both copper names map to filter21 |
| Disabled panel | getDefaultPanelize4756956, feedPanelize4768233, DF4431106, une4430699, hne4430288 | Model initial JSON clone, then enumerable Object.assign clone with optional vertical override; exact nested order, scaling, scalar parseInt and create-hole/mark branches |

The rules v2 change intentionally refuses old v1 replies that lack the observed
module unit. The graph remains bounded own data and the new leaf still uses
throwOnSideEffect during actual scope reading. Source code and synthetic V8
checks do not establish that `_Fe` is reachable in a future connected scope.

## Supported boundaries

Rule objects must have their exact captured native classes, required own data
and finite numeric values. Tables are bounded to512 entries and RULE output to
512 rows. All body text, including PANELIZE, stays within524,288 UTF-8 bytes.
The cumulative body budget is charged before retaining each additional RULE,
so shared-table aliases cannot accumulate hundreds of individually large rows
before the final sequence check.
Duplicate native rule IDs from different objects refuse; aliased Map values
deduplicate as native Set iteration does. SAFE storage is the modeled156-cell
array; unrecognized lengths refuse. These constraints are explicit subset
boundaries, not claims that every native state has the same shape.

Relevant public property and method shadows refuse on complete native graph
instances: rule name/default/unit getters, each family/table getter or toJSON
call, manager family/selector/template methods, and filter lookup/visibility
methods. For example own `unit`, `isDefault`, `visible`, or non-callable `toJSON`
cannot silently be replaced by private backing values. No getter is invoked.
Unrelated own backing fields remain in the raw graph. Presentation/preference
schema v2 separately records `pickedOwnerPublicShadowsAbsent:true` after
descriptor-only checks on owners whose backing fields are copied into picks;
the common rules v2 reply includes the same fixed evidence field (no picked
owners are used there). Old schema or absent evidence is never inferred.

Raw module unit, rule-name and template strings remain unnormalized. Rule
status and other boolean inputs use a strict boolean subset. Numeric state
branches reproduce the pinned defaults rather than repairing them. Auto-router
layers are dense numeric arrays and ignored nets are dense string arrays; both
require `jsonToJSONAbsent:true` because the native body embeds those raw arrays.

PANELIZE requires original `on:false` and `success:false`, explicit enumerable
key evidence and serializer absence. Its complete enumerable input must contain
only scalar values. Undefined fields disappear in the modeled first JSON clone;
required missing fields then refuse. Unknown scalar fields stay in the raw graph
hash. Unknown nested objects, prototype-changing `__proto__` keys, serializer
hooks and absent descriptor evidence refuse before prediction. Non-enumerable
fields are excluded exactly. An enumerable own `vertical` boolean overrides
both horizontal and vertical Object.assign defaults, matching the pinned code.
Disabled panel prediction does not authorize panel activation or prove geometry.

The existing common PREFERENCE encoder now accepts plain/null object trees only
with enumerable-key and no-toJSON evidence. It preserves integer-key order,
omits undefined/non-enumerable object fields, and retains raw distinctions in
its graph hash. Old graph evidence cannot silently acquire these new facts.

## Verification and remaining work

Nine new synthetic tests cover all14 families, exact bytes/order, unit capture,
matrix shape/reference selection, fallback/sentinel values, aliases, collisions,
filter defaults, panel clone/override, public shadows and descriptor refusals.
Combined with common-state, common-body and graph descriptor tests,36 focused tests pass. Strict
type-aware lint and TypeScript checks pass. No connected execution was attempted.

The selected encoders do not prove complete native ownership, graph/read
atomicity, interval stability, queue completion, native serializer integrity,
headers/tickets or full stored/native equivalence. Whole-board raw-history/SQL
joins and original one-create/one-Save/fresh-reopen integration remain required.
This module changes no native budget or external compatibility pin. Build,
facade projections, publication and installation are tracked in the combined
[release record](current-pcb-common-effects-batch-2026-10-20.md).
