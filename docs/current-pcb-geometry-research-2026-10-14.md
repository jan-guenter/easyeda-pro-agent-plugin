# Current PCB Line, Arc and Via geometry observations

Research date: 2026-10-14. This is an inert source and official-documentation
review for three bounded current-version native task equivalents. It does not
establish connected admission, live validation or saved-design completeness.
No editor, process, profile or project was accessed for this review.

## Contract and implementation identities

The official `getAll` methods return arrays of SDK objects. Line and Arc accept
optional net, layer and lock filters; Via accepts net and lock filters. The
method pages label these APIs beta previews. The proposed adapter supports only
empty arguments, not filters or the objects' later mutation methods.
[Line](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitiveline.getall.html),
[Arc](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivearc.getall.html),
[Via](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivevia.getall.html).

The following installed sources were read as text and rehashed. Paths are
relative to `resources/app/assets/` in EasyEDA Pro 3.2.206.715d940d. Offsets in
this note are zero-based JavaScript UTF-16 string positions, not byte offsets.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-api/0.3.50.ab46409c/api.js` | 1964920 | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| `pro-api/0.3.50.ab46409c/api-types.d.ts` | 1733380 | `d5fe990034c55001302ea6c3f704c2d4b88cdf23253cc5293b3bad62a32b9def` |
| `pro-pcb/3.2.193.682ed44e/js/pcb.js` | 10976299 | `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33` |

Retain the separately pinned UI routing and captured-receiver admission from
[the identity-reader research](current-pcb-readers-research-2026-10-14.md).
Neither current documentation nor an equal method name admits another build.

## Existing getter effect closure

These are the same fixed native callbacks already reviewed for identity reads.
That route already executes their complete serialization, even when it discards
geometry afterward. Adding a bounded scalar projection does not require another
vendor getter, source export, cache initialization or SDK object constructor.

| Native topic | PCB offset | Enumeration and serialization |
| --- | ---: | --- |
| `pcb/extensionAPI/track-getAll` | 10400807 | `hr.getAllItem()`, `xr` filter, Track `toJSON` at 4783800 |
| `pcb/extensionAPI/arc-getAll` | 10330519 | Same manager, `Oi` filter, Arc `toJSON` at 4827571 and endpoint arithmetic |
| `pcb/extensionAPI/via-getAll` | 10405876 | `Vr.getAllItem()`, Via `toJSON` at 4402441 and coordinate/radius scaling |

All receive a literal empty object. `iu.getAllItem` near PCB 7946805 iterates
existing models and includes only those with a `stateWatcher`. The `e7` and
`Gde` managers at 7947274 and 7953970 respectively supply the existing Track/Arc
and Via collections. No missing native view is initialized by these getters.

The relevant getters were rechecked. `Ue` at 4365760 and `Oi` at 4826708 read
existing Track/Arc model fields. Track model properties at 3888893 read the
existing common/base objects. Arc properties at 4075813 onward delegate to `Q8`
at 4069861. Its angle calculation allocates a helper and points, then performs
trigonometric arithmetic through `yo.angleToPoint` at 3880267. Via view `Ve` at
4396601 reads base or inherited model fields at 4159100 and 4281500 onward.
Identity/partition getters at 3424496 and 3424578 read existing fields. These
getter paths do not invoke the neighboring setters, redraw methods, rule
updates, service requests, command execution, selection changes or Save.

This scope inherits the prior receiver/RPC closure review; it does not claim
all methods on those classes are read-only. In particular, `w0` near 3513622
updates rule-derived Via expansion during ordinary initialization. The reviewed
getter only observes the resulting model values, not a fresh rule resolution.

## Units, origins and public rounding

PCB API length units are mil, independent of the editor's displayed unit.
Coordinates use the data origin, which need not equal the displayed canvas
origin. No origin change is needed or authorized for a read.
[SYS_Unit](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_unit.html),
[PCB canvas origin](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_document.getcanvasorigin.html).

The native DTOs mix units. Do not recursively multiply every number by ten.

| Family | Native callback output | Proposed observation mapping |
| --- | --- | --- |
| Line | `startX/startY/endX/endY/width` already multiply model values by 10 | Copy coordinates and use `lineWidth = width`, all in mil |
| Arc | Endpoints and width multiply by 10; `arcAngle` converts radians to degrees; raw center/radius/angles remain present in other units | Copy endpoints, width and `arcAngle`; do not expose raw center/radius/angles under these names |
| Via | `center.x/y`, `holeRadius` and `radius` already multiply by 10; expansion values are not scaled | Copy center as `x/y`, derive diameters with `2 * radius`, and derive top/bottom mask expansion with `10 * expansion` |

Public API mappings at API 1358401, 1365426 and 1352253 do more than rename
fields. Line constructs `sn` with the callback coordinates/width unchanged.
Arc constructs `an` after rounding endpoints and `arcAngle`. Via constructs
`qi` after rounding each radius and then multiplying by two. The helper `tt`
at API 469417 implements the relevant nonzero finite-number rounding as
`Math.round(value * 10 + 1e-10) / 10`. Width and Via position do not receive that
rounding. For zero, the helper takes its separate `Math.round` branch.

The proposed adapter deliberately returns the non-rounded native projection.
It is not byte-for-byte SDK return parity. For example, a native Via radius of
10.04 mil yields a 20.08 mil observation; the SDK mapper yields 20.0 mil.
Do not silently round observation values to make them resemble the SDK result.

The public Via mapper returns a custom solder-mask object only when native
`expansion === 2`, otherwise null. A native observation may instead preserve
`maskExpansionMode`, `topMaskExpansion` and `bottomMaskExpansion`, including
rule-mode values. Those fields describe the loaded model, not proof of a stored
custom override or current rule authority. Native expansion storage is the
plain `x8` data record near PCB 3510806. The official getter's nullable
public result is a different contract.
[Via solder-mask getter](https://prodocs.easyeda.com/en/api/reference/pro-api.ipcb_primitivevia.getstate_soldermaskexpansion.html).

## Recommended bounded projection

All rows retain `primitiveId`, a literal `primitiveType`, `net`, and
`primitiveLock`. Copy the exact observed net text; do not uppercase it or merge
empty-string and null. A missing or undefined required field is a refusal, not
an empty/default value.

| Family | Additional fields |
| --- | --- |
| Line | `layer`, `startX`, `startY`, `endX`, `endY`, `lineWidth` |
| Arc | Line fields plus `arcAngle`, `interactiveMode` from native `arcType` |
| Via | `x`, `y`, `holeDiameter`, `diameter`, `viaType`, `designRuleBlindViaName`, `startLayer`, `endLayer`, `maskExpansionMode`, `topMaskExpansion`, `bottomMaskExpansion` |

The installed declaration classes are at lines 10310, 10992 and 11690. They
identify the public field names but do not define this native projection.
Installed enum declarations at lines 10266 and 10275 give Arc modes 1/2 and Via
types 0/1/2. Retain strict numeric values; unknown values must refuse instead of
being relabeled. Native-only expansion and layer observations should not acquire
stronger public enum or fabrication claims without their own proof.

Require bounded strings, arrays, finite numbers and exact booleans. Validate
input fields before multiplication and derived results afterward. Preserve
order and every returned member. Reject duplicate identities, malformed rows,
unsupported values and oversized output without truncation. Keep the shared
384 KiB response allowance and do not imply that it bounds vendor enumeration
time or cancels a running getter.

The Via callback's center is a native `S` instance, not a plain object. `S` is
the `lM` alias at PCB 1065367; its constructor near 1062281 assigns own `x` and
`y` data properties. Read those two own data descriptors only and copy their
numeric values into a new plain object. Do not reject a valid point merely
because its prototype is not `Object.prototype`, and do not invoke its methods
or traverse its prototype. Its `hashed` getter lazily writes `_hashed`.
The constructor's `Ys.normal` near 1045932 uses coercive global `isFinite`, so
the adapter still needs strict `typeof value === "number"` and finite checks.

Compare two ordered complete projected samples while retaining the exact
frame, receiver and target identity checks around each awaited boundary.
The implementation refuses signed-zero values before copying or comparison.
Within that narrower accepted profile, JSON comparison preserves each accepted
finite scalar. `JSON.stringify` alone would collapse negative and positive zero
without that explicit precondition. Supporting signed zero later requires an
encoding or in-memory comparison that retains the distinction.

## Explicit limitations

These results are loaded-view field observations. Models with no view are
absent; inherited or preview models can be present. The adapter must not claim
saved membership, parent ownership, complete native records, connectivity,
fabrication readiness or an edit/inverse baseline from these values.

Arc endpoint-plus-angle data is not a complete shape representation. Native
`yo.angleToPoint` computes a signed sweep modulo two pi. Equal start/end
angles can therefore yield zero even when center, radius and sweep describe
a full-circle case. This projection omits those additional native fields.
Do not reconstruct or validate a whole Arc from this observation alone.

The projection also omits partition, native Line point objects, Arc center/
radius/start-angle/end-angle/sweep, and Via unused-inner-layer/is-suture data.
Those omissions are intentional, not evidence that the source lacks them.
Same projected samples do not establish equality of omitted state.

Do not substitute the native `getByIds` callbacks to reduce enumeration.
Track's callback at PCB 10400543 reads from the shared Track/Arc manager without
the `xr` type check. Arc's callback at 10330076 uses the generic object lookup
without the `Oi` filter. Their missing-ID skipping also cannot establish a
complete requested collection. A later ID-query adapter would need a separate
family-membership and exact-request-result contract.

The fixed `getAll` handlers, retained receiver and explicitly narrower DTOs
are sufficient for this source implementation proposal. They do not enable
writers or replace focused disposable live validation after installation.
