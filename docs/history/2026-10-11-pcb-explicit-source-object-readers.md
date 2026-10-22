# Explicit-ID PCB source object readers

This source review adds two bounded native task equivalents. It does not call
the installed public getters or claim public object-instance parity. No
connected validation was performed for these new routes.

## Contract and pinned implementation

The installed `pro-api/0.2.53.aee2f57a/api-types.d.ts` declares both methods alpha:

- `PCB_Primitive.getPrimitiveByPrimitiveId(id: string)` returns
  `Promise<IPCB_Primitive | undefined>` at line 4234.
- `PCB_Primitive.getPrimitivesByPrimitiveId(ids: Array<string>)` returns
  `Promise<Array<IPCB_Primitive>>` at line 4242.

Both declaration comments describe getting all properties of the specified IDs;
neither defines a complete serialized source-record contract. The corresponding
[official singular method page](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitive.getprimitivebyprimitiveid.html)
and [plural method page](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_primitive.getprimitivesbyprimitiveid.html)
were unavailable during this review. The singular URL returned HTTP 404, and the
web reader could not retrieve either page. These links are reference targets,
not evidence that page contents were reviewed.

The first-party installed implementation is
`assets/pro-api/0.2.53.aee2f57a/api.js`, independently rehashed as
`5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc`.
All offsets below are zero-based UTF-16 positions in that exact file. At
1342097 the singular method is empty. At 1342133 the plural wrapper awaits that
singular getter for each input and appends only truthy results. It therefore
returns an empty array on the reviewed installation, irrespective of actual
PCB membership. Repeated identical empty responses are not complete read proof.

## Admitted native DTO subset

`server/src/pcb-source-objects.ts` reuses the unchanged pure owning-family
projection in `pcb-selected-objects.ts`; it does not use a UI selection or call
the selected-ID getter. The two fixed request schemas accept one exact ID or
1–256 unique IDs in literal caller order. Empty plural input, duplicates,
malformed IDs and unknown argument fields refuse.

Only root Line, Arc, Via, standalone Pad, Component and STRING are admitted.
Every requested identity must occur in the complete native source and its exact
inventory family. Missing, grouped, inherited, generated, unsupported or
colliding identities refuse the whole request. The singular route never turns
a missing identity into successful `undefined`; the plural route never returns
a partial array. These are deliberate restrictions of the declared contracts.

DTOs retain the entire exported record and its direct source-backed ATTR rows.
Coordinates, nulls, custom fields and spelling remain native source data, not
SDK getter units or native instances. Components do not acquire their inherited
footprint geometry or generated attributes through this projection. Family-wide
membership, component-pad correlation, cross-family identity collision checks,
generated-identity exclusions and exactly empty poured correlation stay intact.

The coordinator in `pcb-source-objects-read.ts` performs two complete matching
source/inventory/source cycles. Each constituent exact reader still takes its
two samples and applies its inner context guards. Outer guards bind the exact
project-owned type-3 PCB and the complete private runtime fingerprint. Adjacent
post-read guards cover the next read only when no intervening asynchronous work
occurs. Final runtime and context checks remain mandatory.

Unselected inherited footprint Lines can require the existing fresh complete
checkpoint proof. Detection observations are discarded after that checkpoint;
two new cycles are required. Every subsequent asynchronous boundary rechecks
the unchanged checkpoint. Requested inherited Lines remain unsupported. This
path uses the unchanged `pcb-inherited-lines.ts` and `pcb-net-membership.ts`
profiles pinned to PCB implementation
`65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54`.

The result is bounded to 2 MiB, source evidence to 16 MiB, and source records and
each inventory family to 20000 identities. No truncation, selection change,
navigation, Save or mutation is allowed. This is observed native source, not
an atomic snapshot, electrical-connectivity proof or durable-state proof.
Switching away and back between observations remains undetectable.

## Five further concrete omissions

The same reviewed API bundle establishes these public stubs. No native
equivalent is implemented by this change.

| Mounted method | Exact implementation anchor | Reason it remains omitted |
| --- | --- | --- |
| `sch_Document.navigateToCoordinates` | 1503752, constant false | No navigation dispatch. A separate native route needs exact owner and viewport effects. |
| `sch_Document.navigateToRegion` | 1503788, constant false | No region dispatch. Completion, overlay cleanup and view effects remain unmodeled. |
| `pcb_PrimitiveAttribute.create` | `x_` class 1476692, mounted 1823286 | Empty creation body. Existing attribute modification does not prove new child ownership or persistence. |
| `pcb_PrimitivePoured.create` | `d_` class 1370627, mounted 1823607 | Empty body. Pour definitions and generated copper are different records and effects. |
| `pcb_PrimitivePoured.modify` | 1370931 within the same `d_` class | Empty body. Generated-piece ownership, calculation collateral and persistence require a dedicated proof. |

`public-sdk-reviewed-stubs.test.ts` evaluates the reviewed small method excerpts
offline and checks their omission classifications. It does not read or validate
the current installation. Other regressions exercise real maintained inventory
generation and checkpoint decoding with synthetic data, all supported DTO
families, strict request bounds, no partial results, every coordinator boundary,
runtime drift, inherited-proof failures and actual SDK-tool registration. These
tests establish source behavior only; each connected family still needs its own
disposable evidence.
