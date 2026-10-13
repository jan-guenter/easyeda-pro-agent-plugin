# PCB fixture layer-color round-trip findings

Research date: 2026-10-11. This note records a read-only comparison of retained
disposable-fixture exports and a source review of the installed application.
No editor call, Save, fixture repair, current database access or installed-cache
change was performed for this investigation. Private identities, paths and
artifact commitments are intentionally excluded.

The two observed color changes have concrete native causes. They are not
permission to normalize source or relax the plugin's persistence checks.

## Pinned primary sources

Paths below are relative to the application's `resources/app/assets/` directory.
The complete file hashes were recomputed from the installed bytes. Every source
offset in this note is a zero-based JavaScript string position, measured in
UTF-16 code units rather than bytes. An offset is meaningful only with its
corresponding full bundle hash.

| Source | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-pcb/3.2.149.5378b690/js/pcb.js` | 10862879 | `65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54` |
| `pro-ui/3.2.149.43637efe/js/ui.js` | 17265809 | `12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a` |
| `pro-mgr/3.2.148.154949d9/js/project-worker.js` | 2164464 | `2792c6c87e3c60e09c43f03494a9cbb24e4ebe9c385372bbaf877ed75083a949` |

These are implementation findings for this exact build, not a claim about every
EasyEDA Pro release or the complete declared SDK contract. The investigation
read source text and independently evaluated the arithmetic below. It did not
execute the application bundles as scripts.

## Exact observed changes

The retained saved and reopened native exports differ in only two LAYER body
fields. All other parsed record headers and bodies are equal.

| Layer | Active color, unchanged | Saved inactive color | Reopened inactive color |
| --- | --- | --- | --- |
| 19, default Inner5 | `#70dbfa` | `#386d7d` | `#39503f` |
| 24, default Inner10 | `#15935f` | `#a.492f` | `#0a492f` |

Both layers remain unused, hidden and unlocked. Their names, types and
transparencies are unchanged. These layer numbers and colors come from native
defaults; they are not private design identifiers.

### Layer 19 has a color-cache collision

`pcb.js` defines color class `Qc` at 600109 and aliases it as `ee` at 603765.
Its `build` method returns an existing cache entry using only a numeric hash.
It does not compare the requested RGB channels with the cached object's channels.
`getHash` at 600249 computes the following expression for normalized channels:

```text
hash(r, g, b, a) = 31 * (31 * (31 * r + g) + b) + a
```

The RGB bytes for `#386d7d` are 56,109,125. Those for `#39503f` are 57,80,63.
Independent JavaScript arithmetic gives exactly equal floating-point results
for these two tuples at alpha 1:

```text
hash(56/255, 109/255, 125/255, 1) = 6969.313725490196
hash(57/255,  80/255,  63/255, 1) = 6969.313725490196
```

The channel differences cancel in the polynomial, since 961 minus 899 minus 62
is zero. Native default-layer initialization seeds the cache before document
decoding. Layer 37's active color at 3405273 is the integer 3756095, or `#39503f`.
The earlier custom-layer palette initialization also uses this palette.

The LAYER decoder at 4004361 parses inactiveColor with `ee.of3` before applying
the separate inactive transparency. Parsing therefore first requests alpha 1
and can return the already-cached `#39503f` object. Its later alpha adjustment
does not recover the original RGB tuple. The LAYER encoder at 4426378 writes
the resulting model color with `toString`. This explains the exact observed
`#386d7d` to `#39503f` change.

The default Inner5 inactive color itself comes from halving `#70dbfa` at 3402745.
The native formatter truncates the fractional green hexadecimal component,
producing `#386d7d`. It is the subsequent cache lookup, rather than random color
selection, that changes the reopened RGB value.

### Layer 24 contains a fractional hexadecimal component

At 3403439, the default Inner10 inactive color halves the RGB channels of
`#15935f`. The resulting channels are 10.5,73.5,47.5.
The color formatter at 602462 multiplies normalized channels by 255, calls
`toString(16)` and takes the first two characters without rounding the numbers.
For the red channel, 10.5 becomes `a.8`, so the first two characters are `a.`.
Together the three components produce the malformed string `#a.492f`.

The six-character parser in `Qc.of3`, within the class at 600109, uses `parseInt`
on each two-character component. JavaScript accepts `parseInt("a.", 16)` as 10.
Encoding that parsed integer yields `0a`, so the next exported string is `#0a492f`.
The original malformed string must remain visible in retained evidence. It is
not valid CSS and must not be silently repaired by an SDK reader.

## Native Save does not serialize the full editor model

The ordinary PCB Save path is separate from the native FileSource serializer:

1. `ui.js` at 15076763 delegates PCB Save to `ble`; its PCB handler at 15066136
   calls the target frame's `pcb/saveCompiler` service.
2. `pcb.js` at 10685299 registers that service. It saves relevant library
   compiler instances, the PCB compiler and copper data. This handler does not
   serialize every current editor model through FileSource.
3. The compiler's base Save method at 2292602 sends UUID, path, document IDs,
   unique edit token and client to `/mgr/projectWorker/setCanvas`. No editor
   source string is passed. Its normal document set includes the current
   document, BLOB and FONT records.
4. `project-worker.js` at 2143026 registers the route through `Js.projectSave`
   and calls `saveCanvas`. At 2128430, `saveCanvas` checks whether the token has
   pending data. With data, it calls `asyncCompressFull` with `uniqueId` and
   `docIds`, then uploads the result. Without data, it delegates to uploadCloud.
5. The compressor at 283260 selects documents and record IDs from
   `uniqueIds[uniqueId]`, intersecting the requested document set. It selects
   history nodes belonging to that token. Despite the method name
   `asyncCompressFull`, this call does not serialize all current PCB objects.

Consequently, a second intentional STRING edit followed by a new Save would
not, by itself, upload the two unchanged-in-compiler LAYER records. A successful
Save acknowledgment would not prove their stored colors changed. Save may also
handle library or copper work, so this is not a claim that Save has only a
STRING effect.

## Rejected fixture remedies

### Repeating Save or changing another text

Neither action explicitly uploads the affected LAYER bodies. Repeating an
ambiguous or already-consumed Save is also prohibited independently of this
color issue. A fresh text operation would be new work, but would not repair
these records through the traced Save path.

### Reversible layer-panel padlock clicks

The individual padlock handler at `ui.js` 16863987 builds a one-layer payload
containing only the requested lock state. The UI dispatch at 16885577 forwards it
to `toggleLayerState`. The PCB subscriber at 4755764 assigns the requested state
and calls `_p` for that layer. `_p` at 4754315 uploads the whole encoded LAYER
body, which would include its current colors.

This is not an available narrow UI remedy for the observed baseline. The PCB
panel encoder `nC` at 4753812 emits status 0 when a layer is unused. The UI's
`handleLayerList` at 16868144 excludes status 0. Layers 19 and 24 therefore have no
individual padlock in the normal panel. Enabling them to expose a control would
be a separate stack/configuration change, not a two-color-only operation.

Even for a visible layer, the handler updates visibility/render state and
publishes updateFrame. The frame renderer at 3177563 publishes updateModify;
the subscriber at 10729671 calls `Do.modify`. A reusable adapter would still
need to account for deferred native work instead of assuming the one-layer
payload proves complete effects.

### Layer Manager Apply or palette changes

The Layer Manager is not a substitute for the missing two padlocks.
`pcb.js` 9156643, `applyLayerConfig`, iterates all layers and constructs both
active and inactive RGB channels from activeColor, using separate alphas.
It uploads layers, can change the active layer, calls the layer-repair helper,
and publishes plane-clear, plane-rebuild and autoFill events.

`applyLayerPhysConfig` at 9158670 processes physical-layer definitions.
`updateCanvas` at 9159121 calls `FC(true)`, unused-layer processing and
flushService. Preference handling at 9159923 can call `Hi`. The UI Apply and
Confirm handlers at 13302435 and 13303078 pass the exported layer and physical
stacking configuration, not just one selected color field.

Accepting this dialog without a visible palette change therefore cannot be
described as an exact two-LAYER repair. Global theme/palette controls are not
authorized by fixture setup, and no per-document-only palette remedy was proved
in this investigation.

## Differential source edits do not require color repair

The saved/exported color differences do not by themselves imply that a text
edit will rewrite LAYER records. The pinned `pcb/decode` handler at 6919471
uses `xV` at 5860558. Its build path constructs `vV` at 5852181, which serializes
the current live model with `pu.save`, decodes that export and compares it with
the requested source. `getDifferentDecode` and `pushItem` remove deep-equal
records before construction. Unchanged LAYER bodies are therefore excluded.
`OV.buildLayers` at 5838354 receives only the remaining layer models. The
physical-layer fix at 2313990 likewise iterates the supplied difference arrays,
not every existing layer.

The first private fixture preflight required every source body to equal durable
storage. That was stronger than the maintained transaction contract. The
maintained baseline checks the intended target fields; persistence compares
unchanged durable record types and bodies independently of their live export
representation. Both raw observations remain evidence. Do not normalize either
one or change a layer simply to satisfy the private helper's extra condition.

This trace does not prove a completely isolated native write. Source apply still
enters shared history, rule/layer repair, autoFill, panelization and queued
services. A narrower STRING-history alternative was also traced: it records
STRING upload/deletion, but its native history and flush services can process
previously queued BOARD, copper, plane and teardrop work. Creation additionally
allocates its own native ID and defaults. Neither route has a new read-only
queue witness from this investigation; no replacement is enabled here.
Complete live and durable effect checks and disposable execution remain needed.

## Required boundary for future work

Keep raw saved/exported evidence and the existing exact persistence refusal.
The color-cache winner depends on initialized cache contents, so the observed
mapping must not become a general color-normalization rule.

A separately requested fixture color correction would need an exact two-LAYER upload
operation, or a deliberately broader native setup with its complete effects
defined first. It must bind the exact document/frame, establish that unrelated
pending work cannot be flushed, preserve every peer and unrelated target record,
and prove the resulting durable colors through close/reopen. Neither correction
was implemented or executed by this investigation. Text testing should first
use the maintained target-scoped baseline contract without requiring an unrelated
color correction. This is an engineering gap,
not a claim that the SDK or native application can never support it.
