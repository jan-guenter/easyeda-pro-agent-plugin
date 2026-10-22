# Current PCB Dimension and Image identities

The current pinned identity adapter now supports unfiltered
`eda.pcb_PrimitiveDimension.getAllPrimitiveId` and
`eda.pcb_PrimitiveImage.getAllPrimitiveId`. These are native task equivalents,
not public-wrapper execution. They return loaded-view IDs only. No geometry,
complete source membership, empty-board qualification, rendering or persistence
claim follows. Positive generic type lookup remains Line/Arc/Via only.

## Source basis

The official beta methods return arrays of IDs with optional layer/lock filters.
This adapter deliberately accepts empty arguments only. The current documentation
was checked on 2026-10-19; it does not establish the installed implementation's
effects. [Dimension reference](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivedimension.getallprimitiveid.html),
[Image reference](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitiveimage.getallprimitiveid.html).

Root and independent review used the inert installed
`pro-pcb/3.2.193.682ed44e/js/pcb.js`, 10,976,299 bytes, SHA-256
`217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33`.
All offsets below are zero-based JavaScript UTF-16 positions. No vendor code
was executed to perform the review. A later, limited connected check is recorded
below; it does not expand the source review into nonempty-family validation.

The existing current runtime gate continues to require the separately pinned
API/UI/PCB implementation and authenticated bridge fingerprint. No external
pin changes or relaxation of the legacy SDK profile are involved.

## Dimension

The fixed `pcb/extensionAPI/dimension-getAll` topic begins at10344976.
It concatenates length (`Do`), radius (`wo`) and angle (`Ho`) manager views,
then serializes them. Manager `iu.getAllItem` at7946904 includes only models
with an existing `stateWatcher`; it does not construct missing controllers.
Consequently even an empty result does not establish an empty stored canvas.

The serializers are `Zs.toJSON`4693729, `la.toJSON`4780847 and
`va.toJSON`4696346. Their fields read existing model/text scalars. Coordinate
builders `bge`10293681, `Pge`10293851 and `Ige`10294047 allocate new arrays.
The native handler also reads the current unit. No parent filter is applied.
The adapter projects only each DTO's own data property `globalIndex`, not
annotations, coordinates, measurement units or rendered values.

## Image and Picture

The fixed `pcb/extensionAPI/image-getAll` topic begins at10357328.
It concatenates vector Image (`Rn`) then Picture (`So`) views; it does not
filter parents. The separate native get-by-ID path is not equivalent because
it searches only the vector manager. This release does not expose it.

Vector `qn.toJSON`4835484 calls `uf`3881507 to encode existing template
primitives into fresh arrays. `qn.getRealPath`4834893 uses `viewMatrix`4834685,
matrix operations1068246/1068539 and transformed geometry1277118. These allocate
new geometry. The later `NP`6156530 path encoder can populate `q.svgEnd`1285686
on those new arcs, not on the original retained template. Picture
`Ns.toJSON`4845301 reads its existing hash/scalars and does not invoke the
asset-backed `Ns.source` getter4844831. No asset loading, library fetch,
network call or retained model mutation was traced in these getter paths.

Full native DTO/path creation precedes this adapter's bounds. Returning only
IDs does not avoid that work. Image content, asset availability and renderability
remain unverified.

## Why Fill, Polyline and Region were not added

These three unfiltered native getters all serialize polygon views:
`fill-getAll`10352400, `polylines-getAll`10375804 and `region-getAll`10391515.
Their family selectors are `Ege`10347713, `tve`10371699 and `Dge`10384344.
Polygon `lt.toJSON`4662106 calls `refreshChildrenByOutline` when `isSimplify`
is true. That method at4655833 can rebuild child models/controllers through
`nd.addByModel`/`ih.addArcByModel`, assign parent relationships and replace the
child array. This is a concrete effect, not merely a large return value.

The current exact-frame adapter cannot inspect that private polygon state
before serialization. It therefore does not admit these methods as read-only
identities. A reviewed direct identity-only native path or an explicit complete
rebuild-effect contract is required. The legacy separately pinned routes are
unchanged; their discovery must not be treated as current-runtime admission.

## Adapter and verification

The existing retained frame, project/branch/tab, native receiver and method
identity checks bracket each await. Two complete ordered ID samples must match;
native tab/type checks surround each sample. Missing, sparse, duplicate,
accessor-backed, drifting or oversized results refuse without truncation.
The adapter does not introduce selection, navigation, source export or Save.

Existing limits remain 20,000 IDs per family, 256 characters per ID and
393,216 UTF-8 evidence bytes. Output bounds and the ten-second deadline do not
cancel preceding native serialization. These sampled observations are not an
atomic lock or a complete successful-load proof.

Native-shaped VM tests cover both new families, ordering, empty and malformed
collections, duplicate/accessor IDs, drift, output bounds, ignored data getters,
filter refusal and exclusion from generic type lookup. Coverage tests exercise
the actual offline schemas and verify that geometry and the three effectful
polygon-family routes were not enabled. They are synthetic tests, not connected
or saved-result validation.

PCB text creation still needs complete baseline/queue observation and an
original-owner single-Save/full-SQL/reopen lifecycle. See the separate
[Save prerequisite findings](2026-10-19-current-pcb-string-save-prerequisites.md).

## Connected empty-family check, 2026-10-19

The installed `0.3.0+codex.20261019013000` snapshot was admitted against its
actual configured facade and authenticated pinned EasyEDA runtime. A fresh
ordinary retained launch opened only the registered disposable validation
project. Each new method returned two matching empty ID arrays on its exact
PCB/project/branch/tab target. Both observations preserved the admitted runtime
fingerprint before and after the call. Dimension observation `5c35f533` and
Image observation `ac3957c7` are historical evidence, not reusable authority.

One normal-close request was acknowledged; a separate observation proved the
original root/Job terminated. The closed disposable file remained exactly
598,016 bytes with SHA-256
`e4434cc5d6a5a2d19729093485406e486499790e5f32d994a1d35bb5709d5b4d`,
byte-identical to its pre-case closed copy, with no WAL/SHM/journal sidecars.
No explicit Save, design edit, restore, or production-design access occurred.
Ordinary startup/closure still permits shared profile/cache effects.

This verifies only connected empty-family reads. Nonempty Dimension/Image DTOs,
rendering, complete canvas membership and writing are not live-validated here.
The adapter's general `liveValidation: not-recorded` provenance remains
conservative; it must not imply that every family/input case was tested.
Private proof SHA-256:
`fcf0b49a75995afe2d4dd9d083dfa96e830f97303d97882978d03e29da9498cd`.
