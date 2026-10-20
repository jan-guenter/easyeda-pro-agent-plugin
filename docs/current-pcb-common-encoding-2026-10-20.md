# Pure PCB common-body encoding

`current-pcb-common-encoding.ts` models selected format2.0 bodies from the fixed
raw common-state reader replies. It does not execute EasyEDA, call getters or
register a tool. Both entrypoints decode their supplied replies independently.
The preference entrypoint also requires a separately decoded empty-selector
rules reply with the same document UUID.

Each result contains the exact ordered body JSON, native compound record ID,
body SHA-256 and a separate hash of the complete decoded raw graph. The rules
graph hash is separate. Equal encoded bodies do not imply equal raw state.
All ownership, atomicity, complete-baseline, native-no-mutation, stored-source,
queue, effect, Save and execution flags remain false. Keep the original raw
reply artifacts; these hashes do not create observation provenance.

Presentation and preference readers now emit schema v2 with explicit
`pickedOwnerPublicShadowsAbsent:true`. Before copying backing values, the
descriptor-only reader rejects own shadows of the native public getters and
methods used on env, grid/attached-grid, silk/panel, config, routing and wiring
owners, then rechecks those absences before output. Old v1 or missing-evidence
replies refuse. Full graph layer, status, color, physical-layer and radius-rule
instances are checked directly for relevant own shadows by the host encoder.
Unknown unrelated backing fields remain captured and hashed. This proves only
the supplied absence facts, not original prototype or intrinsic integrity.

## Implemented relation

The pinned PCB asset is 10,976,299 bytes with SHA-256
`217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33`.
It was read as inert source, not evaluated. Offsets below are JavaScript string
offsets in `pro-pcb/3.2.193.682ed44e/js/pcb.js`.

| Body | Native source | Modeled behavior |
| --- | --- | --- |
| CANVAS | format3993664, AF4408674, At3211481, we3214815 | Exact 13-field order, origin rounding4, grid/snap rounding6 after scaling10, alternate grid raw numeric units, highlight rounding1, attached-grid `||` fallback and unknown grid enum fallback |
| LAYER | format3993851, YR4409481, WA3174691, Ff3174350, color1453688 | Map insertion order, status bits, actual active color rather than temporary color, native unrounded hexadecimal prefixes, manager inactive alpha |
| LAYER_PHYS | format3994003, JR4427166, HA3173255, getLayerPhys3186173 | Stable copied zIndex sort, exact six-field order, thickness scaling10/rounding3, null thickness becomes zero, layer identity stays in compound ID |
| ACTIVE_LAYER | jR4409952 | Exact manager layer identity |
| SILK_OPTS | format3993459, wF4431790, getters10168636 | Top3 then bottom4, raw stored color spelling, no uppercasing |
| PREFERENCE | format4005450, D55276590, qV7367334 | Exact 20-field order and omission, initialized previous width, selected radius defaults/overrides, enum conversions, raw boolean options and native scalar parseInt behavior |

`saveCommonData`5840102 emits every non-CUSTOM layer, even disabled ones. It
emits CUSTOM layers only when their config bit is set. Omitted layers and
temporary colors remain part of the raw graph hash. Both silk holders and the
active layer must exist. Layer-map keys must equal model IDs. Status values
outside integer0..15 refuse. Physical map keys must equal physical model IDs.

Native `ee.toString` can produce malformed CSS-looking strings. The model
preserves those results; it does not clamp, round or repair them. Each numeric
input must be finite. Arithmetic overflow refuses before JSON could turn it
into null. Undefined physical material/thickness/permittivity/loss fields are
outside this subset; the supported nullable fields remain distinct.

The returned presentation row sequence is a selected projection, not a whole
export. Native RULE/selector/PRIMITIVE rows occur before SILK_OPTS and are not
inserted or silently considered absent here. QRe667366 and native jN7370300
establish body serialization and fixed format order; headers and tickets are
not synthesized.

## Preference constraints

The initialized previous-width input is mandatory. Native getter10164716
changes null/undefined `_prevTrackWidth` to1; this model refuses that case.
Native D5 resolves radius rules before inspecting either via override. Therefore
an empty `radiusPhysics` map refuses even when both overrides are nonzero.
The first insertion-order rule with boolean `_isDefault:true` supplies zero/null
via fallbacks through `_defaultInner/_defaultRadius`. A nonempty map without a
default is allowed only when both supplied overrides are nonzero. A missing
fallback refuses. These are the empty-NET rules branch, not arbitrary selectors.
The radius Map must not alias the safe-spacing Map: native getDefault3499660
uses Map identity to select a separate safe-rule cache branch, which this
radius-only relation deliberately does not model.

`preferenceConfig` supports absent, undefined, null, finite scalar and bounded
plain/null-object and dense-array trees. Undefined object field omission and array null conversion
remain native JSON behavior; signed zero normalizes only in the encoded body.
The raw graph preserves the difference between absent and own undefined.

Object-valued preference configuration requires the graph's explicit
`enumerableKeys` descriptor evidence and `jsonToJSONAbsent:true`. Arrays also
require that serializer-absence evidence. The generic graph decoder still
accepts older graph nodes without these optional metadata fields; the common
presentation/preference envelope requires its new v2 absence marker regardless.
Those older nodes cannot enter this JSON encoding branch without the explicit
metadata. JSON.stringify omits
non-enumerable object fields, so the encoder uses the captured enumerable subset
in native key order. It reconstructs `__proto__` as inert data through
Object.fromEntries rather than invoking a host prototype setter. Map, Set,
custom classes, cycles, sparse arrays and arbitrary toString/toJSON execution
remain excluded. Expansion has a depth32 and32,768-value budget, so an
aliased graph cannot expand exponentially without refusal. The encoder charges
JSON byte expansion while visiting each value, before allocating the full
serialized body. Bodies together remain bounded to524,288 UTF-8 bytes.

`minimumTrackCorners` accepts a finite number or bounded string and reproduces
the native omitted-radix parseInt, including hexadecimal prefixes and scientific
notation. Results that would be NaN refuse. Unknown routing corner omits its
field; other unknown enums follow their source-defined NONE/null mapping.
The inline radix lint exception documents this exact native compatibility need.

## Verification and remaining work

Nine focused synthetic encoder tests pass. They exercise exact body bytes/order,
rounding ties, grid fallback/units, native color oddities, layer filtering and
stack ties, raw excluded-state hashes, preference fallback hazards, JSON
omission, aliases, document mismatch, public-shadow refusals and strict reply rejection. The synthetic
readers report zero getter/vendor calls. Strict type-aware targeted lint and
TypeScript checks pass. An initial test used a duplicate synthetic variable
name; its corrected rerun passed. The final common batch, including descriptor
metadata and raw reader tests, passes36 focused tests. No connected execution is claimed.

The follow-on [rule/filter/panel encoding](current-pcb-common-rule-encoding-2026-10-20.md)
now models fourteen rule families, primitive filters and disabled-panel bodies.
Still missing are full native/stored joins, headers/tickets, original owner admission, interval and
producer proofs, and one-create/one-Save/closed-SQL/fresh-reopen integration.
This module changes no native budget or external compatibility pin. Build,
facade projections, publication and installation are tracked in the combined
[release record](current-pcb-common-effects-batch-2026-10-20.md).
