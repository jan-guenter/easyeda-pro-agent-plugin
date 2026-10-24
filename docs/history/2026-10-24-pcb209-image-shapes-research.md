# PCB209 serialized Image paths and Picture references

2026-10-24. Source implementation for the combined Pad/Image reader batch.
This is installed-source research and offline validation. It is not connected
validation of the new reader, a complete geometry baseline or a writer proof.
No project was accessed during this research.

## Public contract and installed implementation

The official [Image collection method](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitiveimage.getall.html)
returns Image instances with optional layer and lock filters. It is marked beta.
The [complex-polygon state getter](https://prodocs.easyeda.com/en/api/reference/pro-api.ipcb_primitiveimage.getstate_complexpolygon.html)
describes source polygon data. Those declarations do not prove that an installed
collection preserves original curves or returns a public instance unchanged.

The official [Object binary-data getter](https://prodocs.easyeda.com/en/api/reference/pro-api.ipcb_primitiveobject.getstate_binarydata.html)
explicitly says the returned value may be an object-storage index. Retrieving
the content can require additional requests. The adapter therefore names the
native Picture value `assetReference`; it does not treat it as a digest, URI,
filename or decoded image.

The reviewed installed tuple is application `3.2.209.8a704eab`, PCB
`3.2.195.6b67774e` and API `0.3.59.1ca9efb5`. Complete files were rehashed:

| File | Bytes | SHA-256 |
|---|---:|---|
| `pro-pcb/3.2.195.6b67774e/js/pcb.js` | 10991441 | `a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b` |
| `pro-api/0.3.59.1ca9efb5/api.js` | 1980754 | `e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1` |
| `pro-api/0.3.59.1ca9efb5/api-types.d.ts` | 1814791 | `0a6910f4108f3d09733a9de9176b20c41ccd2a87fc4e335f8d6d656eb054ba72` |

Offsets below are zero-based JavaScript UTF-16 offsets in those exact files.
The existing original-owner UI/PCB source qualification remains a prerequisite.
These hashes alone are not an active owner or a continuous file lease.

## Source findings

- PCB `image-getAll` at10361338 enumerates vector Image views followed by
  Picture views. It serializes both, scales placement and dimensions to mil,
  converts rotation to degrees and adds `imageType`. Vector `pathString` is
  `BP(getRealPath()).join(" ")`; Picture `pathString` is empty.
- Vector view `qn` at4837155 constructs a template translation and scale.
  Its `getRealPath` at4837915 applies the view matrix, including the model's
  placement, rotation and effective mirroring. The returned path already has
  those transforms. Applying placement or mirror again would be wrong.
- `BP` at6162291 creates a separate `wE` encoder per path. `wE` at6160126 emits
  absolute M/L/A commands and implicit repeated line/arc arguments. It negates
  board Y. Its Bezier branch samples curves at native tolerance0.1 and emits
  lines. It can join disconnected segments with L. It does not call its close
  method, so the result does not prove closure.
- `wd.fmtNumber` at3350265 rounds most serialized numbers to five decimals.
  The disconnected-arc branch also uses raw radius formatting. Native distance
  units are ten mil each, independently of the collection's mil placement
  fields. The adapter retains the path string exactly, including spacing,
  exponent notation and negative-zero text, with explicit coordinate units.
- Vector `toJSON` near4838530 emits `silkColor.toString() || null`. This reader
  retains its string/null result without interpreting it as valid CSS. Picture
  `toJSON` near4848323 reads its `hashId` without accessing asset-backed source.
- API Image `getAll` at1448209 constructs public objects from native path strings.
  Its constructor may derive dimensions when supplied dimensions are falsy.
  The new adapter keeps native zero dimensions and native type distinctions.
  It does not claim public constructor or instance-getter execution.

## New fixed reader

`observe-image-shapes` is a separate once-only original-owner stage. It uses
two `image-getAll` samples, each bracketed by native identity observations:
six local RPCs within one CDP call. The original frame, project, tab, receiver
and methods are checked around every awaited call. Full sampled projections
must match in order before any result is returned.

The packet contains the existing Image/Picture placement DTO and one matching
descriptor per ID. Vector descriptors retain `pathString` and `silkColor`.
Picture descriptors retain only `assetReference`, including an empty string
if emitted. Picture path strings must be empty. Vector rows must precede
Picture rows, matching the installed manager enumeration. Duplicate, missing,
extra, reordered or type-mismatched descriptors refuse the entire observation.

The path parser accepts only the pinned serializer's M/L/A grammar. It checks
numeric completeness and bounds, nonnegative arc radii, zero axis rotation and
binary arc flags. It accepts implicit repeated L/A parameters. Unsupported
commands, XML, accessors, malformed Unicode, incomplete coordinates and excess
output refuse. Empty paths remain empty observations. No path is evaluated,
rendered or used as a URL.

Bounds are256 rows,65536 path characters and8192 path tokens per vector, and
393216 UTF-8 bytes for the native packet and final result. Native serialization
precedes these bounds and can allocate temporary geometry. The ten-second
deadline cannot cancel an already dispatched vendor callback.

The stage and decoder are new. Existing v1 Image/selection readers and their
historical reconstruction remain unchanged. Historical Image queries retain
the new descriptors, explicit units and false rendering/content claims only
when reconstructing the new `image-shapes209` result.

## Concrete omissions and validation

Exact original curves, templates, fill rules, closed contours, rendered bounds,
font or image pixels, complete saved membership, asset ownership/availability,
binary retrieval and decompression remain unproved. These require their own
source and asset-lifecycle review; the native serialized path cannot recover
information its encoder discarded. No write, Save or manufacturing acceptance
is added.

The first focused run passed4 of9 tests and failed5. Its generated numeric
regular expression lost template-literal backslashes, so valid paths refused.
The independent typed parser exposed the difference. Escaping was corrected
without loosening the grammar or owner guards. The corrected run passed all9
tests, including native protocol parity, populated synthetic descriptors,
malformed paths, owner changes, ordering, bounds, decoder forgeries and timeout.
Focused strict type-aware lint then identified declaration/import ordering and
schema-call nesting; these were corrected and the final focused lint passed
with zero warnings. Independent review added explicit UTF-16 length checks to
the descriptor decoder, matching native limits even for supplementary Unicode
characters. Forged overlong color/reference cases and disconnected-arc radius
exponents passed the final9-test run. These results are offline evidence only. Final combined
payload verification and publication belong in the batch release record.
