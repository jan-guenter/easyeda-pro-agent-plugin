# Current PCB Image geometry

Research date: 2026-10-19. The pinned native `image-getAll` callback can supply
bounded placement metadata without loading or returning image assets. The new
projection covers both vector Image and Picture views. It is a native task
equivalent, not the complete public image object contract or a writer baseline.
This report records source review and implementation work, not connected
validation. No vendor code, documentation example or CAD operation was executed
for this research.

## Public contract and pinned sources

The official beta [get method](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitiveimage.get.html)
documents a scalar ID and describes array input. The installed declaration
has both overloads and permits missing array IDs to be skipped. The beta
[getAll method](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitiveimage.getall.html)
accepts optional layer and lock filters and returns public image objects.
The [image object reference](https://prodocs.easyeda.com/en/api/reference/pro-api.ipcb_primitiveimage.html)
and installed declaration also include polygon data and mutating operations.
Those are outside this metadata-only adapter.

The initial typed subset accepts only empty `getAll` arguments or a distinct
nonempty bounded `primitiveIds` array for `get`. Every requested ID must exist
in the complete observed combined family. Scalar input, filter arguments,
SDK class instances and missing-ID skipping remain unsupported.

The following installed vendor files were read and independently rehashed.
Paths are relative to `resources/app/assets/`; positions below are zero-based
JavaScript UTF-16 offsets, not byte offsets. They match the maintained current
runtime profile. No compatibility pin was changed.

| Source | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-api/0.3.50.ab46409c/api.js` | 1,964,920 | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| `pro-api/0.3.50.ab46409c/api-types.d.ts` | 1,733,380 | `d5fe990034c55001302ea6c3f704c2d4b88cdf23253cc5293b3bad62a32b9def` |
| `pro-pcb/3.2.193.682ed44e/js/pcb.js` | 10,976,299 | `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33` |

The exact-frame wrapper retains the existing separately pinned UI owner,
`pro-ui/3.2.196.26ed3d6c/js/ui.js`, SHA-256
`3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a`.
That shared frame admission is unchanged. The application reports `3.2.206`;
its PCB and API bundle versions above are independent identities.

## Native scope and conversions

`pcb/extensionAPI/image-getAll` begins at PCB10357328. It enumerates vector
Image manager `Rn`, then Picture manager `So`. The shared `getAllItem` at
PCB7946904 returns only existing `stateWatcher` views, with no parent filter.
This establishes a loaded-view sequence, not complete saved source membership.

The callback serializes each view, then overwrites `start`, `width` and
`height` with values multiplied by ten. It converts the view rotation to
degrees and sets `imageType` to `Image` or `Picture`. The view base class
`p0` at PCB4676608 reads existing model scalars and returns rotation modulo
its full-turn constant. These are view observations, not unchanged raw stored
rotation or a computed world-space bounding box.

The new DTO returns:

- `primitiveType: Image`, `primitiveId`, `primitiveLock` and native `layer`.
- `imageType: Image | Picture`, preserving the two native kinds explicitly.
- `x`, `y`, `width` and `height` in mil, copied without another conversion.
- `rotation` in degrees and `horizonMirror` from the native boolean `mirror`.

The native start anchor is not an independently computed rotated or mirrored
bounding box. Nonnegative zero dimensions remain observations, not proof that
an object can render or be manufactured. The mirror value is the native model
flag, not effective rendered mirroring; Picture's `needMirror` also considers
its layer. The public constructor `rs` at API1444119 calculates dimensions
from polygon data when either supplied size
is falsy. The adapter does not construct that class, so it does not apply that
fallback or infer image content from an empty path.

The public mapper near API1443220 passes native start, size, rotation, mirror
and lock fields into `rs`, but does not preserve `imageType`. Its get-by-ID
route delegates to the native callback immediately before PCB10357328, which
searches only `Rn`. It cannot return Picture-only IDs. The metadata equivalent
therefore uses the complete combined `image-getAll` sequence for both methods,
and selects requested IDs in caller order only after both complete samples
agree. This Picture scope differs from the public get-by-ID behavior and is
not advertised as full public return parity.

## Asset exclusion and remaining native work

Vector serializer `qn.toJSON` at PCB4835484 reads existing scalars and calls
`uf` at PCB3881507 to build fresh template arrays. The native handler also
calls `getRealPath` at PCB4834893 and encodes the transformed path through
`NP` at PCB6156530. This work precedes facade bounds even though the new
projection omits its output. The prior
[identity review](current-pcb-dimension-image-identities-2026-10-19.md#image-and-picture)
traces the temporary geometry allocation and path encoder separately.

Picture serializer `Ns.toJSON` at PCB4845301 reads hash and scalar metadata.
It does not call `Ns.source` at PCB4844831, the separate asset-backed getter.
The metadata adapter neither reads nor emits `hashId`, `source`, binary data,
template arrays, transformed `pathString`, color, partition, group or parent
data. Its own copier requires data descriptors for projected fields and does
not invoke getters on unprojected DTO properties.

No asset fetch, file read, source export, new image decoding, library request,
selection change, navigation, Save or design mutation is introduced. Existing
RPC bookkeeping and native geometry allocation still occur. Bounds on the
returned projection and the observer deadline do not cancel preceding native
serialization. Output equality does not compare omitted geometry/content,
prove image availability or establish asset integrity.

## Implementation and focused checks

`current-pcb-image-geometry.ts` contains the strict family schema, fixed copy
fragment and explicit limitation. It reuses the existing parent observer's
finite-number, signed-zero, ID and layer bounds. The parent exact-frame
factory supplies complete target/receiver checks around every await, native
tab/type bracketing, two complete samples and caller-order selection.

The geometry limits remain 256 complete rows, 256 distinct requested IDs,
256 characters per ID, scalar magnitude `1e12` and 393,216 UTF-8 evidence
bytes. Negative dimensions, signed zero, nonfinite/coerced values, unknown
image kinds, accessors, missing properties, duplicate IDs, sparse collections,
oversized results and changed unrequested peers refuse. No result is truncated.

The new synthetic VM cases exercise both native kinds, exact mil/degree values,
zero dimensions, all required own fields, omitted asset getters, complete-family
drift, scalar and identity bounds, requested order, missing-ID refusal, changed
frame/receiver/target identity, and timeout refusal. They also test discovery
and independent result-schema rejection of invented binary/path fields.
These tests execute only the maintained generated program against synthetic
objects. They do not execute the installed vendor implementation.

The seven new Image cases and existing geometry/registered-callback cases
passed together: 42 tests, zero failures, cancellations or skips. The run used
Node `24.18.0`, the maintained isolation preload, core dumps disabled and a
new private disk-backed temporary directory. The new files passed strict
type-aware lint and the complete typecheck before shared integration. After
correcting one shared import-order lint finding, the integrated Image,
geometry, registration, index and coverage files passed strict type-aware
lint, and the complete typecheck passed again. Coverage generation/check and
the Image/registration/coverage set passed 52 tests, zero failures or skips.
That set overlaps the 42-test run; these counts must not be added as unique
tests. The bundle-startup expectation now requires 19 geometry methods but
must be checked after the batch's planned bundle rebuild. No bundle or
compatibility manifest changed during these focused checks.

The generated inventory adds two current-native geometry routes beside the
existing legacy public Image routes. Its 774 distinct-method status counts
are unchanged: 212 public subsets, 33 native equivalents, 79 implemented but
blocked, and 450 omitted. Image alone raises guarded routes from 347 to 349;
the combined reader batch has 352, with 94 blocked and two partially blocked
routes. These route totals span
different runtime tuples and are not a count of currently callable methods.
Final batch verification remains the release owner's responsibility.

Publication, installed admission and a populated disposable Image/Picture
case remain separate evidence stages. The previous empty-family identity
case is historical and does not validate this geometry route. Generic type
lookup remains unchanged; image creation/modification/deletion, asset export,
rendered outlines, reciprocal parent ownership and saved/reopened validation
remain outside this reader.
