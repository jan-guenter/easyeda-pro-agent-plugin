# Generation209 empty raw-root and common/SQL composition

This source-only addition addresses the gap between empty geometry getter
results and empty raw model managers. The existing209 native geometry getters
enumerate instantiated `stateWatcher` views. They omit watcherless models and
some raw fields, so their DTOs cannot establish complete stored membership or
reconstruct exact native records. Populated geometry remains unsupported by
this baseline composition.

`current-pcb-209-empty-baseline-session.ts` owns one common-state/SQL session and
one original-scope root runner. The latter captures the source-qualified Save
callback and handler scope, reads empty roots, runs the common session, then
reads the roots again. Both root replies must match exactly. Neither callback
nor Save is invoked. Native ownership and complete source admission remain
requirements of the enclosing private transport. No public action, native
helper command or existing owner was changed.

## Raw membership and stored relation

All17 raw manager maps must exist and be empty: tracks, pads, vias, circles,
radius dimensions, rectangles, strings, protractor dimensions, length
dimensions, smart dimensions, components, polygons, vector images, pictures,
copper, inner regions and groups. A model without a view still makes its map
nonempty. The inner manager's separate `layerMapSet` is also read: every bounded
own layer entry must contain an empty Set, and the ordered layer IDs must match
across samples. Native inner serialization reads this collection independently
of the manager map, so an empty map alone was insufficient. Independent review
caught that omission before activation. Missing/null managers, retained `_last` models and accessor fields
refuse; the reader never calls a lazy singleton constructor or vendor getter.

The board owner must have no board reference or outline members and automatic
outline generation must be off. The panel model must be disabled and unsuccessful
with every modeled generated array empty. Typed, other and ratline spatial
indexes may retain bounded empty trees, but no members, pending changes, dead
members or root children. Map entries, collection sizes, own descriptors and
observed prototypes are checked again before each reply is serialized.

The unchanged common session retains its original completed SQLite reader and
joins exact common/META bodies, the winning DOCHEAD, history, structure and peer
commitments. Any additional surviving target row refuses. Thus empty raw roots
cannot hide saved geometry, and empty saved geometry cannot hide a nonempty raw
manager. The new session retains both actual issuers and refuses copied packets,
second attempts and owner revival after failure. It releases both original
object groups on failure where their retained transport permits cleanup.

This proves the stated empty-root/common-row relation at sequential samples.
It does not observe a fresh native FileSource serialization, atomically capture
all live state, prove pending compiler/worker effects, cover active tools,
establish closed-file ownership or prove Save/reopen. All those result fields
remain false. Historical SQL commitments do not prove that the live database
remained unchanged while these samples ran.

## Exact source audit

Application `3.2.209.8a704eab` uses PCB asset
`pro-pcb/3.2.195.6b67774e/js/pcb.js`,10991441bytes, SHA256
`a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b`.
The new profile records45 exact UTF16 spans covering25 class roles, their
lexical aliases and the spatial-owner initializer. All25 class bodies match
the retained206 source after lexical identifiers are normalized; property
names, literal values and syntax are preserved by that comparison. No vendor
code is copied into the repository or executed during this audit.

Changed root aliases are `Xi→qi`, `ol→nl`, `GR→UR`, `Ms→Ls`, `Fi→Vi`, `oa→sa`
and `_s→As`. Spatial roles are `tV→iV`, `Md→Nd`, `F0→V0`, `NI→BI`; `iy` remains
unchanged. The environment, other manager aliases and panel role remain unchanged.
The `Ht` initializer is fixed at UTF16 offsets10806803–10806827. The two reused
scope decoders retain the209 callback/handler locations, including the handler
at10812851, zero-based91968:19860. No206 location or budget was widened.

The pure audit requires the full asset hash before checking individual spans.
Its successful source result is not runtime compatibility admission or owner
issuance. The future native composition must enforce that exact source and the
original unique context throughout the actual reads.

## Command bounds and validation

The new root bracket adds9 CDP requests: six callback/scope hops, two passive
root observations and one object-group release. The common reader's maximum is
still3090, so the combined empty baseline has a fixed maximum of3099. Startup
capture, parent/PCB qualification, actor/native/server clock observations and
their cleanup are additional. This composition cannot enter the existing256
startup or103 diagnostic budget. A separate fixed purpose needs its complete
bound derived before native activation; no counter reset or caller override is
provided.

Seven focused synthetic tests passed under Node24.18.0/npm11.16.0 with core dumps
disabled. They execute the actual generated root function, retained common/root
runners and isolated completed SQL reader. The rule-rich fixture uses49 requests.
Cases cover watcherless members, missing roots, latent board/panel/spatial state,
accessors, saved geometry absent from live maps, root drift, original issuance,
single consumption and cleanup after owner loss. Exact source-span validation,
TypeScript and targeted strict type-aware lint also passed during implementation.
These checks are not connected EasyEDA validation. Release-wide verification is
part of the enclosing grouped batch.
