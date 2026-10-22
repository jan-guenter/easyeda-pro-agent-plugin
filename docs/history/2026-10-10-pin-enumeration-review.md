# Symbol Pin enumeration review

Later installed214400 tests passed the ordinary two-Pin case with exact getter
parity, unchanged complete symbol source and unchanged 18-document saved history.
The pins had zero Y, length 10, shape None and type IN. See the
[generation-bound validation record](2026-10-10-api-coverage-disposable-validation.md).
The source review below remains separate from that connected evidence.

Reviewed on 2026-10-10. This is primary-source review and isolated test evidence.
No editor, project database, live bridge, installed cache, operation journal or
process was changed or queried. Runtime pins and builds are unchanged.

## Contract and installed defects

The official [`sch_PrimitivePin.getAll`](https://prodocs.easyeda.com/en/api/reference/pro-api.sch_primitivepin.getall.html)
returns Pin objects without arguments. Its current example uses a symbol editor,
and the method remains beta. The
[`get`](https://prodocs.easyeda.com/en/api/reference/pro-api.sch_primitivepin.get.html)
contract also permits ComponentPin or missing results. That wider contract is
not suitable for silently treating a schematic component pin as a symbol pin.

The installed API `J_.getAll` catches transport failures and required-attribute
projection failures as `[]`. Its explicit-ID `get` rethrows those failures, but
constructs each `us` object without the `otherProperty` constructor argument.
The delegated native getter emits only Pin Name, Pin Number and Pin Type.
Consequently an explicit-ID result can silently omit custom pin attributes.
The installed public ID inventory also defaults missing `shapes.pin` to an empty
object. Composing those public methods cannot independently prove completeness.

## Implemented source module

[symbol-pin-enumeration.ts](../../plugins/easyeda-pro-control/server/src/symbol-pin-enumeration.ts)
provides one fixed expression for the declared `getAll` task. It does not invoke
the broken public method or its ID inventory. It proves native membership, then
calls the public `get(id)` once for each sorted ID and compares every existing
fixed getter field to independently captured native state. It returns only the
original verified SDK objects for the maintained bounded serializer.

The scope is one active, ordinary type-2 symbol in the exact expected project.
Its native root must contain one PART, with matching `_parts`, `_partIdMap`,
ID index, source-ID membership and reciprocal tree ownership. `partId` equals
its model ID. The part must be active, have command `part`, refer to this symbol
UUID, and have no associated device or groups. Multipart symbols, drawing and
flag symbols, schematic component instances, source GROUP records and unknown
native shapes refuse. No external-library search or account mutation occurs.

Native symbol families differ from schematic-page families. Pins are direct
children of the symbol PART and members of its `shapes.get('Pin')` Set, not a
page-root Pin family. All indexed Pin models must match that Set and the source
inventory exactly. Missing membership, duplicate IDs, detached models, foreign
owners and extra index entries refuse the entire read. Source-ID values are
presence marker `1`, not record-type names.

The older public `get` and `getAllPrimitiveId` routes retain their narrower
observation labels. Their descriptors now disclose custom-attribute loss and
the getter/source rotation difference, or missing-inventory empty fallbacks
and the public ID path's in-memory parts sorting. The ID callback invokes
`doc.parts`, whose symbol getter delegates to `shapeManager.parts`; that sorts
`_parts` and clears `shouldSortParts`. It does not establish pure native-state
invariance or complete membership. No compiler or Save is in that reviewed
callback chain. The new native-equivalent route avoids this getter entirely.

The source proof permits only Symbol, Pin, Attr, Text, Rect, Circle, Polyline and
UnConnectDot model types. Non-pin drawing models must belong directly to the
PART and have source membership. PART attributes may include loader-generated
attributes absent from source, but their tree/index ownership remains exact.
Only the Pin family and its getter fields are returned. This is not a complete
source export, electrical topology or saved-state proof.

Each Pin needs exactly one source-backed attribute for each of Pin Name,
Pin Number and Pin Type. Both native attribute maps must match those owned
children. Custom attributes and no-connect/junction children refuse, so the
absent SDK OtherProperty field cannot conceal extra attributes within this
subset. An unstored generated UnConnectDot is allowed only beneath its exact
owning Pin, with the matching native pointer, no children and no source record.
It is never counted as a Pin or discarded from ownership proof.

The module avoids the native `parts` getter, which sorts `_parts` and changes
`shouldSortParts`. It calls no source serializer, `uploadTo`, `getOrCreate`,
compiler, Save, navigation, settings or native message bus. The one public
lookup delegates to the reviewed synchronous Pin-state callback, not a
calculation or writer. Every awaited lookup is followed by reproof of document,
manager, project, consistency handler, PART, source membership, complete
tree/index identities, child order, original locks, attribute-map identities
and all original Pin getter values. Both field reproof and getter parity use
`Object.is`, so even a signed-zero change refuses. An error never becomes an
empty result.

Bounds are 256 Pins, 20,000 connected/source models, 256 characters per ID and
4,096 per attribute/color string. Integration must also retain the shared
response-node/byte bounds and double-sampled engine observation. Native lock
values can be `undefined` on newly generated PART/dot models because the base
model does not initialize `_locked`. The comparison preserves that exact value;
it does not coerce it to `false`, and a later change refuses.

## Field mapping

The existing fixed Pin DTO has twelve fields, including identity. The table
records installed getter parity, not inferred semantics from a newer SDK.

| DTO field | Independently checked native state |
| --- | --- |
| PrimitiveType / PrimitiveId | Exact `Pin` family / indexed model ID |
| X / Y | `origin.x` / exactly `-origin.y` |
| PinNumber / PinName / pinType | Exact values of the three owned attributes |
| Rotation / PinLength | Native `rotation` / `length`, without scaling |
| PinColor / PinShape | Native `color` / `pinShape`, without fallback defaults |
| OtherProperty | Exactly undefined, only after excluding custom pin attributes |

The current [creation documentation](https://prodocs.easyeda.com/en/api/reference/pro-api.sch_primitivepin.create.html)
describes schematic coordinates in 10-mil units in its example, cardinal degree
rotation and nullable default color. The pinned getter performs no distance
conversion. It preserves zero lengths, zero coordinates, empty pin names and
null color. Finite rotation values are retained as reported by this installed
getter. Unknown PinShape/PinType enums and non-finite geometry refuse. The shared
JSON envelope normalizes signed zero to zero; native state reproof and getter
parity distinguish signed zero before serialization, but the transported DTO
does not preserve its sign. No full native numeric representation proof is claimed.

The source serializer and the separate native `getApiSchPinData` use
`regularD(native rotation + 180)` for their rotation field. The explicit public
Pin getter instead returns the native rotation unchanged. The new reader
preserves the existing public getter contract. Do not compare that DTO rotation
directly to the stored PIN rotation without the representation mapping, or
treat this route as a native geometry/source verifier. The
[public rotation page](https://prodocs.easyeda.com/en/api/reference/pro-api.isch_primitivepin.getstate_rotation.html)
alone does not establish the installed stored representation.

## Reproducible source anchors

Complete hashes were recomputed before review. Paths are relative to the
configured EasyEDA application's `resources/app/assets/`; offsets are zero-based
UTF-16 positions in the complete hash-pinned file.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-api/0.2.53.aee2f57a/api.js` | 1881523 | `5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc` |
| `pro-api/0.2.53.aee2f57a/api-types.d.ts` | 678232 | `32a0d2f8b4bc3d7b2b93b33499d9d768b0c23c77f45843a65166cf4e8ad6dab1` |
| `pro-ui/3.2.149.43637efe/js/ui.js` | 17265809 | `12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a` |
| `pro-sch/3.2.149.35ae2987/js/sch.js` | 6431214 | `3f50136fb4ba2d5593beac7ef3e20ebe5275177b56bbcfdd297e79f176a6618f` |

- API: `J_` near 1534300 contains the explicit getter, ID enumeration and
  swallowed-error getAll; `js` and the complete `us` class follow the latter
  near 1536700. Installed declarations at lines 14817 through 14942 enumerate
  the Pin constructor and fixed getter fields.
- UI: `uie` near 17219700 synchronously delegates `getPinJson` and the all-parts
  inventory to separate schematic callbacks. The new reader uses only the
  explicit getter, never the all-parts inventory.
- SCH: native explicit callback at 6063463 reads the indexed model's geometry
  and three attributes; all-parts callback at 6063839 reads `parts` and `pins`.
  Creation at 6062190 places with Y negation and rotates to the supplied native
  degree. None of these writer methods is called by enumeration.
- SCH: symbol shape manager `Ib` near 4386270 maintains `_parts` and
  `_partIdMap`; `parts` at 4386824 sorts in place. Symbol document methods near
  5887860 resolve PARTs, while `_createPart` near 5890420 uses equal model and
  PART IDs. `ETe` at 6381020 maps ordinary PART document type to `part`.
- SCH: native `Symbol` class near 6243769 owns `shapes`, its part identity and
  attributes. `getShapes` near 6253610 and `pins` at 6254107 copy the Pin Set.
  `symbolUuid` at 6244707 returns the symbol document UUID in a symbol editor;
  `deviceUuid` at 6245170 derives from the optional associated device.
- SCH: Pin `Kd` begins near 5649132. Its parent attachment creates a dot;
  `tryAppendUnConnectDot` near 5651790 appends an unpersisted child. Pin scalar
  getters follow; the two attribute maps and `getAttr` are near 5656416.
  Native `getApiSchPinData` at 4441481 projects custom attributes and uses the
  source rotation convention; the public explicit getter does not use it.
- SCH: `UnConnectDot` at 4315460 has empty upload/consistency methods. Its
  connection callback still delegates to the base ID-index registration.
  Base parent/connection handling is at 1922179/1924023 and node child
  propagation near 1931095. Base constructor near 1920490 leaves `_locked`
  absent; its getter at 1926911 returns that value unchanged.
- SCH: source-ID copy at 4660232, owner wrapper near 4663500, PART loader near
  4653442 and explicit PART handling at 4656093 establish the independent
  source/owner checks. Loader-generated PART Symbol attributes need not yet
  have a source record. The reader does not call the source encoder.

## Verification and integration boundary

The original214400 isolated Node 24 test file passed 58 tests, with zero failures
or skips. Candidate223200 adds thirteen ownership/device/dot regressions and
passes all71 isolated tests. Strict type checks and focused type-aware lint pass
without diagnostics.
It covers empty/nonempty symbols, all getter fields, generated dots, null/zero/
empty values, lock preservation, missing/foreign/custom attributes, unknown
shapes, oversized inventories, public failures and substitution during awaits.
The signed-zero regression checks both directions of drift for x, y, rotation
and length after an awaited getter.
The final integrated focused run passes 426 tests with zero failures or skips,
including SDK engine, catalog, registration, diagnostics, public-only plan,
method inventory and the neighboring native readers. Full typecheck, targeted
strict type-aware lint, inventory freshness and whitespace checks pass.
The first run's two successes failed only cross-realm array prototype equality;
the result helper now clones plain test DTOs before deep comparison. Failed
checks are not counted as passes.

An additional offline probe parsed the exact hash-pinned API and evaluated only
its `J_`, `us` and `js` definitions against a fixed synthetic RPC receiver. One
explicit getter preserved x0, y-25, rotation90, length0, null color and empty name,
while a supplied custom attribute disappeared from OtherProperty. No application,
bridge or real project was accessed. This confirms the installed mapper loss,
not a connected execution result.

Host integration registers strict empty arguments for document type 2, labels
the route native-task-equivalent with public-getter parity, and projects the
twelve existing Pin getter fields. The host requires at most 256 sorted unique
IDs, the exact bounded scalar/enum schema and one undefined OtherProperty
pointer per row, with no extra undefined paths. Fixed diagnostics preserve
reviewed literal failure categories without exposing native exception text.
Catalog, registration evidence and engine results use Pin-getter labels, not
ID-only or public-wrapper labels. The historical public-only disposable plan
rejects this native route before any dispatch or recording.

Tests execute the actual context-wrapped builder and SDK coordinator, exercise
schema contradictions, private-error redaction, all accepted enums and
context/profile/quarantine/two-sample state drift. The existing admission,
bounded result codec and context checks remain in force. Connected
acceptance requires disposable empty and nonempty ordinary symbols, independently
captured native/source membership and unchanged full-project persistence.

Supporting custom properties requires a native full-attribute DTO contract or a
new admitted public mapper. Multipart/inherited symbols, associated-device
overrides and broader symbol shapes need independent ownership and mapping
proofs. None is made callable by this source module.
