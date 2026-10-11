# PCB text cached-reload and retained-Save proof

Research date: 2026-10-11. This is static review of pinned application source
and the narrow plugin implementation. No application bundle was executed, no
project data was inspected, and no editor, Save or recovery call was made for
this note. Source and offline tests do not establish connected validation.

The installed full-load decoder can export a new null-colored STRING as black
after it decodes a preceding black STRING. That does not make null and black
interchangeable durable values. The correction gives future creations an
explicit black value; the separate legacy recovery proves the original null
storage and the precise decoder consequence without rewriting either.

## Primary sources and public contract

Asset paths are relative to `resources/app/assets/`. Offsets below are zero-based
JavaScript string indices in UTF-16 code units, not byte offsets. Each offset
applies only to its complete file hash.

| Asset | SHA-256 |
| --- | --- |
| `pro-pcb/3.2.149.5378b690/js/pcb.js` | `65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54` |
| `pro-mgr/3.2.148.154949d9/js/project-worker.js` | `2792c6c87e3c60e09c43f03494a9cbb24e4ebe9c385372bbaf877ed75083a949` |

The official text-create API accepts layer, position, text, font, stroke and
display options and returns `Promise<IPCB_PrimitiveString | undefined>`. Its
signature does not expose the native `specialColor` field or promise a saved
round-trip. The page marks the API as beta. This plugin's native source adapter
and journal recovery are narrower contracts, not public-wrapper parity.
[Official create reference](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivestring.create.html),
checked 2026-10-11.

The official modify signature accepts a primitive ID or object and a property
patch, again returning a primitive or undefined. It does not specify the cached
decoder's native null-color behavior. That behavior is established by the
installed implementation below, not inferred from the API name.
[Official modify reference](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitivestring.modify.html),
checked 2026-10-11.

## Fresh full load differs from incremental decoding

In `pcb.js`, `S4` starts at 4002049. Its `feed` assigns `specialColor` only when
the incoming value is truthy. Its `clear` at 4003093 clears position, text and
other fields but leaves `specialColor` intact. `finish`, in the same class,
passes that retained color into the native text model.

Ordinary full open constructs `new N0(de)` at 10735821 and initializes it with
`new hie(Pe)`. `N0` at 5849274 constructs `new cb`; `cb` at 4781853 extends `og`.
The `og` constructor at 4211790 creates a fresh `lastDecodes` map at 4212861.
`hie.onString` in the class at 4237174 calls `parse2("STRING", ...)`.
`feed2` at 4214913 caches one decoder per record type, calls its `feed` and
`finish`, then calls `clear`. `getOldDecode` at 4215377 supplies one `S4` for the
STRING key. Thus the cache is fresh for this ordinary open but shared between
STRING records within that load.

The incremental `sg.onString` at 4232975 instead uses `parse("STRING", ...)`.
The ordinary `feed` at 4214772 obtains a decoder from `getDecode` at 4217971;
that switch constructs a new `S4` for each STRING. The differential source path
uses this noncached decoder route. A successful immediate effect therefore
does not prove a later full-load effect. See also the differential source trace
in [the layer-color investigation](pcb-text-fixture-color-findings-2026-10-11.md).

For the admitted two-STRING legacy case, full loading the original explicit
black STRING followed by the created null STRING leaves the cached color black
for the second record. The proof is about that specific field, order and build;
it is not permission to normalize arbitrary colors or accept other deltas.

## Worker ordering uses the earliest physical version

The PCB environment sets `needNum=true` at 2335399. `_T` at 4222685 passes it
through compiler initialization; `b5e` at 2302107 forwards it to `y5e`.
`initProject` at 2286907 requests the target document; its document-list code
at 2288253 also requests global `BLOB` and `FONT` when their load flags are
enabled. `_T` defaults both flags to true. The PCB `Tgt` mapping at 2277804
resolves `getProject` to the worker's PCB canvas route.

In `project-worker.js`, `getCanvasOnCompiler` at 1850174 waits for pending
project-cache promises and calls `flowWriteOnDoc` with the requested document
IDs, `needNum`, and `keepFirst=false`. `flowWriteOnDoc` at 2128976 passes these
to the streaming compressor. The compressor's selected-key ordering at
286335 calls `It.getHead` for each identity and sorts by
`head.firstTicket || head.ticket`, using the oldest header's client for ties.
`It.getHead` at 255086 returns `list[0]`, or `last` when no older list exists.
The loop near 287180 emits the selected `dt.last` record once per identity,
not every historical version.

Consequently, current record tickets and current object membership are not
enough to establish decode order. A deleted older non-STRING record with the
same reserved ID can affect its earliest physical ordering. The legacy proof
retains every STRING occurrence and the IDs of all non-STRING occurrences
before materialization discards versions. It rejects prior use of either
STRING identity by another record type, any earlier occurrence of the created
ID, unseen/deleted STRINGs, duplicate STRING tickets, and ambiguous order.
Strict history rejects imported `firstTicket` metadata here; strict unequal
tickets avoid relying on the native client tie-break.

## Exact global FONT/BLOB families do not feed S4

The legacy target excludes COMPONENT and ATTR, preventing `parseFootAndDevice`
in `_T` from deriving Device/Footprint references from `decode.attr` and loading
templates. It also excludes target FONT/BLOB records. This is stricter than
the generic text profile, which can admit ordinary COMPONENT/ATTR records.

The requested global documents need not be absent, but each must have its exact
UUID/docType (`FONT` or `BLOB`) and only that record family. In `pcb.js`:

- The dispatcher at 2268366 sends BLOB to `onBlob` and FONT to `parseFont`.
  `parseFont` at 2273558 passes font data to `onFont`, not STRING parsing.
- `hie.onFont` at 4237195 calls `parse2("FONT", ...)`. The separately keyed
  cached decoder is `QE`, not `S4`. `QE` at 4188621 feeds font fields and updates
  the font/path cache. `addFontCache` at 3944059 and `updateFontCache` at 3946456
  update cached outlines and bounding boxes; they do not feed a STRING decoder.
- Inherited `sg.onBlob` at 4232717 calls `parse("BLOB", ...)`, which constructs
  `lie` through `getDecode` at 4217971. `lie` at 4211231 stores image metadata
  and invokes `Y8` at 4210959. `Y8` loads an Image and adds its result to an image
  template cache; it does not parse STRING source.

This is decoder-order isolation, **not side-effect-free loading**. Font caches
change, and the image loader assigns `Image.src` and waits for resource events.
No general image-resource safety or loading-success claim follows. Arbitrary
STRING records placed under a global FONT/BLOB document remain inadmissible.

## Narrow implementation and recovery contract

`server/src/pcb-text-lifecycle.ts` changes the creation profile to
`easyeda-pro-control.pcb-standalone-text-lifecycle.v2`. New STRINGs carry the
explicit native UI default `#000000` (`tW` at PCB 458219 and the `addText`
color-parameter default at 7891103), avoiding this truthy-assignment carryover.
Existing null/black values remain exact and
unchanged. Callers still cannot choose the native ID, color or unsupported style.

`server/src/pcb-text-retained-save.ts` and the executor require the original
six ordered, sealed phases: `before`, `prepared`, `apply`, `after`,
`design-save-intent`, and `save-reopen`. There must be exactly one consumed Save
intent, no cancellation and no inverse attempt. The original reservation,
context, raw source, immediate-effect proof, Save guard and successful
close/reopen acknowledgment remain authority. Recovery does not regenerate
the creation program, write CAD state, navigate or issue another Save.

The legacy v1 branch requires exactly one original explicit-black STRING and
one newly created null STRING. Baseline, immediate and reopened unsorted source
must establish their precise order. `server/src/pcb-text-reload-history.ts`
binds supplemental occurrence evidence to immutable complete checkpoints;
the created ID must be absent from every historical record type in the target,
as well as absent from the original materialized project inventory. The entire
original target occurrence chain must be an unchanged prefix followed by
exactly one DOCHEAD/STRING suffix, with the original null creation body and
strictly newer clocks. This per-document commitment excludes EDIT_HEAD,
chunk boundaries and cross-document ordering; it does not invent those proofs.

Complete durable comparison preserves all peers, their raw occurrence chains,
record clocks and existing target records. Stored creation must remain the
original null body; the reopened source may differ only at that created
STRING's null-to-black export. Both source hashes remain distinct evidence.
The v2 branch instead requires exact reopened source equality. Managed
checkpoint revalidation and final matching reads surround either result.

No generic source or persistence comparator is weakened. Unsaved historical
v1 programs are not regenerated by this recovery path. Consumed-Save modify
and delete remain unsupported by this creation-only proof. Malformed/missing
acknowledgments, unsupported histories, extra raw suffix records, mixed global
families, components/templates and any other source or durable delta refuse.
Offline regression acceptance is separate from actual disposable execution,
recovery completion, visual review and release installation.
