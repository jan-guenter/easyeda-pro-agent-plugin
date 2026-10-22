# Next feasible API adapters

Research date: 2026-10-10. Starting repository commit: `2c775057`.
This note reviews source and official documentation only. It does not change
execution admission, inventory counts or compatibility pins. No live bridge,
project, journal, process or installed cache was changed or inspected for this
research.

## Recommendation

Implement the small `pcb_MathPolygon.splitPolygon` JSON adapter first, and correct
two misleading omission explanations in the same coverage review. The next
useful read adapters are complete symbol-pin enumeration and component-property
names. These need independent membership checks, not another generic class
serializer. A managed active-canvas image route would improve visual review but
needs its own asynchronous resource contract.

The larger functional priority remains nonempty flat schematic transaction
validation and eventual electrical transaction support. Adding easy method
counts does not resolve the blocked generic type-1 transaction workflow. Its
requirements remain in the
[feasibility record](2026-10-10-api-execution-feasibility.md) and
[flat topology review](2026-10-10-schematic-flat-topology-review.md).

## Pinned primary sources

The files below were read directly and their complete byte hashes recomputed.
Paths are relative to the configured application's `resources/app/assets/`.
All offsets in this note are zero-based UTF-16 string positions, not byte
offsets. They are review anchors within the complete hash-pinned files.

| Source | Bytes | SHA-256 |
|---|---:|---|
| `pro-api/0.2.53.aee2f57a/api.js` | 1881523 | `5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc` |
| `pro-api/0.2.53.aee2f57a/api-types.d.ts` | 678232 | `32a0d2f8b4bc3d7b2b93b33499d9d768b0c23c77f45843a65166cf4e8ad6dab1` |
| `pro-ui/3.2.149.43637efe/js/ui.js` | 17265809 | `12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a` |
| `pro-sch/3.2.149.35ae2987/js/sch.js` | 6431214 | `3f50136fb4ba2d5593beac7ef3e20ebe5275177b56bbcfdd297e79f176a6618f` |
| `pro-pcb/3.2.149.5378b690/js/pcb.js` | 10862879 | `65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54` |

The reviewed declaration and the current official method pages are different
versioned contracts. For example, the installed `discretize` signature is
synchronous while the latest page returns a promise. No newer-runtime behavior
is inferred from those pages.

## 1. Polygon splitting is a small implementable public subset

The official method accepts complex-polygon objects and returns polygon objects.
Its example constructs the inputs with `createComplexPolygon` and reads each
output through `getSource`.
[Official contract](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_mathpolygon.splitpolygon.html).

In the installed API, `splitPolygon` at 1339504 synchronously calls each input's
`toPolygon` and appends the resulting objects. `Ml.toPolygon`, in the complete
class following 1340700, constructs `Et` objects from the retained source arrays.
`Et.getSource` returns its own array. The `pC` validator at 1338518 uses bounded
array traversal and scalar checks. This exact constructor/split/source chain
does not dispatch RPC, compile a document, access a collection, save, or change
editor settings. Other methods on those classes do have different behavior;
the proposal does not call them.

A proposed fixed adapter would accept at most eight complex polygons, each
containing at most eight existing `polygonSourceSchema` arrays of at most 1024
tokens. It would construct only facade-owned temporary SDK objects, call the
fixed public split method, and return an array of bounded source arrays. Reject
constructor failure, missing methods, unexpected result count, reordering or
changed source data. Never accept a caller-supplied object, getter, method name,
native handle or callback. The existing `createComplexPolygon` route and polygon
output validation in
[public-sdk-read.ts](../../plugins/easyeda-pro-control/server/src/public-sdk-read.ts)
are the reusable pieces, but this needs an array-of-polygons result contract.

Required tests: multiple input groups, preservation of order and duplicate
polygons, circles/rectangles/line/arc/cubic token forms, empty/oversized/malformed
inputs, non-finite coordinates, constructor `undefined`, substituted output
objects, throwing `getSource`, and complete output parity. Run the real SDK
coordinator with context/runtime drift and differing observations. A disposable
connected calculation should also prove unchanged complete source/checkpoint
state. Label returned arrays as public geometry data, not a native design or
connectivity proof.

## 2. Pin enumeration needs a lossless task equivalent

The official `sch_PrimitivePin.getAll` returns an array of pin objects. The
current example specifically uses the symbol editor.
[Official contract](https://prodocs.easyeda.com/en/api/reference/pro-api.sch_primitivepin.getall.html).

The installed `J_.getAll` at approximately 1536675 calls the pin-inventory RPC,
projects each pin, and catches every error as `[]`. A missing required attribute
can throw through helper `js`, so the ambiguity includes projection failures,
not only transport failures. The current facade deliberately excludes this
method in `public-sdk-read.ts`, but the generated inventory describes only the
generic class-serialization problem. That omission reason should name the
actual lost-error behavior.

The same class's explicit-ID `get` and `getAllPrimitiveId` rethrow failures.
They are already fixed facade routes. A new equivalent could compose these
operations inside one observation, with a second inventory after retrieval and
exact requested/returned ID-set equality. However, the public inventory maps
missing `shapes.pin` to an empty object. Therefore public-to-public equality
alone cannot establish complete membership. Bind an independent native symbol
Pin family and source-ID index, reject malformed/missing family state, and
require exact agreement. Initially admit only an ordinary active project
symbol, not component pins on schematic pages or inherited/multipart cases.

The DTO should reuse the existing fixed Pin getter list while preserving the
distinction between standalone Pin and ComponentPin. Check units and Y-sign
against independent symbol source. Refuse missing required attributes, duplicate
IDs, foreign ownership, stale family/index entries, lock/context/runtime changes,
and any getter failure. Each awaited lookup needs receiver/context reproof.
Disposable acceptance needs an empty symbol and a nonempty symbol with distinct
pin types, coordinates and names, plus unchanged full-project persistence.
Do not claim invocation of the broken public `getAll` method.

## 3. Component-property names can use the existing native attribute model

`sch_PrimitiveComponent.getAllPropertyNames` is a documented string-array read.
[Official contract](https://prodocs.easyeda.com/en/api/reference/pro-api.sch_primitivecomponent.getallpropertynames.html).

The installed old branch at 1554146 projects `attrPara` from raw component RPC
rows. The newer branch at 1572518 calls `getAttr()` on raw RPC rows instead of
constructing the public component class. The existing inventory correctly
records the result-ABI mismatch. Neither branch should be exposed as reliable
just because the intended final result is strings.

A useful native equivalent would collect unique exact attribute keys from the
complete active-page component inventory already modeled by
[schematic-native-adapter.ts](../../plugins/easyeda-pro-control/server/src/schematic-native-adapter.ts).
Review the precise source family, native attribute owner and inherited-attribute
contract before choosing the subset. Do not silently return only `OtherProperty`:
the installed old branch includes keys of all component attributes. Preserve
case and empty-key semantics or explicitly refuse unsupported cases. Bind
complete component/attribute membership, recheck receiver identity, and double
sample. No project compiler, global library search or netlist export is needed
by the proposed projection itself.

Tests must include standard and custom keys, duplicate keys across components,
case-distinct keys, drawing frames and flags, missing/foreign/inherited
attributes, contradictory source membership and context drift. A nonempty
disposable page must prove the returned key set against independent captured
attributes and unchanged source/checkpoint state. This proposal is less fully
reviewed than polygon splitting; it is not ready for dispatch as written.

## 4. Managed active-canvas images are feasible, with separate scene profiles

`dmt_EditorControl.getCurrentRenderedAreaImage` returns a Blob. Its optional tab
defaults to the last input-focused canvas, so a fixed adapter must supply the
exact already-owned active tab, not use that default.
[Official contract](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_editorcontrol.getcurrentrenderedareaimage.html).

Installed UI `S2.getCurrentRenderedAreaImage` at 17094196 branches by scene.
For schematic/symbol it calls `getSCHCanvasImg`; the schematic handler at
6098454 looks up the document and calls its canvas root's PNG `toBlob` callback.
`getDocByTabId` at 6418183 is a document-map lookup. This observed chain does
not call schematic export, annotation or SaveAll. It still crosses asynchronous
boundaries and can return a null/missing Blob, time out, or outlive its context.

For PCB/footprint, UI `getPcbImageData` requests raw pixel data and constructs
another canvas/Blob. The native handler at 8452467 delegates to renderer
`getCaptureImageData1`; renderer implementations at 1060442 and 1791798 call
different capture paths. Those delegated render-state restoration paths have
not been completely reviewed here. Do not use the simpler schematic conclusion
to admit PCB, 3D, photo-view, panel or panel-library capture.

A first scene-specific route needs exact tab/document/canvas receiver binding,
dimensions and byte limits before transfer, bounded callback completion,
PNG signature/dimension verification, managed exclusive artifact publication,
and context/source reproof after the asynchronous conversion. Report blank or
black images as failed visual evidence rather than accepting a valid PNG header
as content proof. Test delayed/null callbacks, renderer replacement, oversized
dimensions, context drift, bridge interruption and publication failure. No
arbitrary file path or network destination belongs in this adapter.

## Concrete omissions to retain or sharpen

- `pcb_MathPolygon.discretize`: change the reason to the installed unimplemented
  method. `s_.discretize` at 1339582 delegates to `Et.discretize` at 1340550,
  which unconditionally throws `Not implemented`. It is not currently blocked
  merely by class serialization. Supporting it needs a separately reviewed
  native numerical adapter or a newer admitted runtime. The current official
  promise signature does not fix the installed implementation.
  [Official method](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_mathpolygon.discretize.html).
- `pcb_Layer.getCurrentLayer`: keep the stub omission. The installed API body at
  1366589 is empty. The current documentation marks the working API as added in
  EDA v4.2. Native PCB source has an active-layer field and `ACTIVE_LAYER`
  encoding, but this review has not proved a complete scoped layer-manager
  projection or its public field mapping. The already supported all-layer read
  is not evidence for which one is current.
  [Official method](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_layer.getcurrentlayer.html).
- Keep cloud/account, commercial, arbitrary message-bus, callback-registration
  and settings mutations separate from disposable-project authority. Their
  state is not covered by a project checkpoint. Existing omission rows should
  not be weakened just to reduce the count.
- Local asset deletion, copy, PCB/schematic creation and broader document
  lifecycle remain feasible engineering work with the exact inventory and
  completion requirements already recorded in the
  [feasibility table](2026-10-10-api-execution-feasibility.md). This review did
  not re-audit their worker call chains or prove a deletion inverse.

No implementation or connected acceptance is claimed by this note. New routes
still need strict schemas, exhaustive coverage rows, adversarial tests, reviewed
bundles, fresh installed-runtime admission and scoped disposable evidence.
