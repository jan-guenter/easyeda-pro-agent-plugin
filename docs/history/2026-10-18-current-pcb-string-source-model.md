# Current PCB STRING source relation

The source parser and comparison are offline models, not a source transport or
writer. They do not access EasyEDA, projects, checkpoints or journals. Separately,
the existing loaded-String reader now projects the display/color fields described
below; that expansion does not establish complete source or model ownership.

`current-pcb-string-source.ts` retains the complete supplied source string,
record order, all headers, peer bodies and unknown fields. It requires exact
JSON.stringify encoding to reject duplicate keys and lossy number encodings.
Supplied JSON observations are byte-budgeted before whole-object serialization,
including escaped strings/keys, punctuation and each repeated reference expansion.
The bounded STRING subset requires all 19 current encoded fields, empty partition,
group zero and no competing parent/display representation. GROUP/PARTITION,
history chunks, deletes, duplicate IDs and incomplete bodies refuse.
Current `compressFull` joins records with `|\n` and no trailing separator.
The parser requires that framing; it does not silently trim or normalize input.
Additional FONT/BLOB document sections remain outside this single-PCB subset.

Correlation accepts the raw result payloads of the existing String identity,
getAll and optional explicit-ID get validators. The complete identity and getAll
families must agree, all source STRINGs must be accounted for, and selected rows
must agree with the complete family. Source order and reader order are retained
separately. The expanded reader DTO compares serialized silkColor exactly on
silkscreen layers, preserving null versus explicit black; other layers encode
null independently. Native `color.toString()||null` is lossy, so this does not
prove raw model color or decoder/reopen equivalence. Key/show flags and
positionIsNull are reader-only fields. zIndex, unknown fields and other
unprojected fields remain preserved but cannot be verified by those DTOs.

The model is based on installed PCB bundle SHA-256
`217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33`:

- `getSTRING` field table at 4001063 and `O3.getData` at 4418517 define fields.
- `we` at 3214815 encodes geometry with `Math.round(value*10000+1e-10)/10000`.
- `Pie` at 4007842 maps the nine alignments.
- Current reader DTOs multiply native distances by 10; the source encoder rounds
  those values to four decimals. Their angle arithmetic orders differ. Cases
  near a rounding tie refuse rather than claim an exact common result.

## Exact producer excerpts

`getSTRING` at 4000773 selects the following default field list for format2.0:

```js
["partitionId","groupId","layerId","x","y","text","fontFamily","fontSize","strokeWidth","bold","italic","origin","angle","reverse","expansion","mirror","locked","zIndex","specialColor"]
```

`Pie` at 4007842 maps the explicit integer alignments. Its fallback is not
admitted by the existing reader schema:

```js
function Pie(o){switch(o){case 3:return Cl.LEFT_BOTTOM;case 6:return Cl.CENTER_BOTTOM;case 9:return Cl.RIGHT_BOTTOM;case 2:return Cl.LEFT_MIDDLE;case 5:return Cl.CENTER_MIDDLE;case 8:return Cl.RIGHT_MIDDLE;case 1:return Cl.LEFT_TOP;case 4:return Cl.CENTER_TOP;case 7:return Cl.RIGHT_TOP;default:return Cl.LEFT_BOTTOM}}
```

The `Cl` enum at 2767705 maps each name to its identical string, for example
`o.LEFT_BOTTOM="LEFT_BOTTOM"` and `o.RIGHT_TOP="RIGHT_TOP"`.
The exact numeric helper at 3214815 is:

```js
function we(o,t=1){let e=Math.pow(10,t);return Math.round(o*e+1e-10)/e}
```

Within `O3.getData` at 4418517 the relevant producer expressions are
`we(e.position.x*10,4)`, `we(e.position.y*10,4)`,
`we(e.fontSize*10,4)`, `we(e.strokeWidth*10,4)`,
`we(e.rotation/Math.PI*180,4)` and `we(e.reverseExpansion*10,4)`.
Color is returned only for layer3/4; other layers encode null. The native
String reader returns parentless `yr.toJSON()` values in manager order.
Neither source record order nor reader order is replaced with a sorted list.

The complete `O3` producer is:

```js
var O3=class extends Y8{getData(t,e){var r;switch(this.id=e.globalIndex,t){case"partitionId":return e.partition;case"Index":return this.id;case"groupId":return Ya(e);case"layerId":return e.layerId;case"x":return we(e.position.x*10,4);case"y":return we(e.position.y*10,4);case"text":return e.value;case"fontFamily":return e.fontFamily;case"fontSize":return we(e.fontSize*10,4);case"strokeWidth":return we(e.strokeWidth*10,4);case"bold":return 0;case"italic":return 0;case"origin":return Pie(e.origin);case"angle":return we(e.rotation/Math.PI*180,4);case"reverse":return e.reverse;case"expansion":return we(e.reverseExpansion*10,4);case"mirror":return e.mirror;case"locked":return e.locked;case"zIndex":return e.zIndex;case"path":return uf(e.outline);case"width":return e.width*10;case"height":return e.height*10;case"specialColor":return(3==e.layerId||4==e.layerId)&&e.silkColor!=null&&(e.getParent()==null||e.getParent()!=null&&e.key!="")?(r=e.silkColor)==null?void 0:r.toString():null}}};
```

The current `string-getAll` handler at 10397039 constructs its unfiltered family
as `Jr.getAllItem().filter(a=>!a.getParent()).map(a=>a.toJSON())` before optional
layer/lock filters. Correlation requires the unfiltered request and keeps that
order. It does not infer source ownership from absence in this collection.

`FileSource` at 10798462 constructs `new ld("2.0",t.doctype).save()` with no
compiler argument. `yD` at 4764017 then constructs `new r8(x.getInstance().id)`.
The `r8` constructor at 3156047 uses document type `PCB`.
`X9t.getDataStr` at 3148920 returns
`this.encodeConsistency.compressFull({notDocHead:!o})`, where default `o` is true.
`compressFull` at 2797996 collects emitted records and returns `t.join('|\n')`.
It emits no trailing empty record.

The header/atom formatting functions at 2753671 and2754019 return these templates:

```js
`${JSON.stringify({type:"DOCHEAD",ticket:s})}||${JSON.stringify(l)}`
`${JSON.stringify(l)}||${r}`
```

The document body starts as `{docType:o,client:t,uuid:e}` and retains available
updateTime/version/editVersion/user. The atom header starts as
`{type:o,ticket:t,id:e}` and can retain firstTicket/pend/num/client.
This parser preserves those fields, but does not interpret them as history or
owner provenance. It does not accept another DOCHEAD in its single-PCB subset.

Offsets are zero-based JavaScript string positions. Source review did not
execute application code. No connected or saved-result claim is made. Complete
source provenance, native parent ownership, rendering, receiver ownership and
persistence all remain explicitly unverified by this supplied-data relation.

Next work is a safe exact-frame source/model observation and separate disposable
String-create lifecycle with full SQL effects. FileSource remains disabled:
its preference getter can repair shared rules, and its output omits stored
metadata/assets and can be incomplete. The old decoder writer also stays
disabled. The current native String-modify handler assigns layer, reverse,
mirror and lock without undefined guards, so a later narrow patch adapter must
reconstruct those four mandatory arguments from its verified baseline, not send
only x/y/text. Unchanged optional geometry must remain absent: supplying rounded
source values would alter higher-precision native values.

## Supplied-data patch candidate

`current-pcb-string-patch.ts` now provides that pure argument/effect candidate.
It admits only unlocked parentless default-font text on silkscreen layers3/4,
with printable ASCII and complete selected native scalars matching all19 encoded
fields. It preserves raw peer records, headers, order and unknown fields in a
comparison projection. It does not claim those headers are future upload tickets
or that peer color/null values survive native decoder replay.

The native handler at10395251 compares coordinates at1e-10 internal units.
The view setter at7378095 then uses `S.equals1` at1064019 and `Dt.eq` at1024324
with `Dt.eps=1e-8` at1024699. The model setter at3982263 cannot suppress differences
above that threshold. The candidate models the effective1e-8 boundary, reports
ignored no-op fields, and refuses changes invisible in the encoded source or
lost through negative-zero serialization.

The static `Qy.fontPath` literal at3628338..3635614 contains every printable
ASCII glyph. `RGe` at4407316 can switch font/type for unsupported glyphs, so the
initial candidate excludes Unicode and controls. Optional font size, width,
rotation and expansion remain absent from native arguments, preserving their
unrounded values.

Seven focused synthetic tests, strict type-aware lint and typecheck pass. Root
and independent source review accepted the native setter/encoder relation.
This is source-only groundwork. It adds no MCP route, observer, token, writer,
queue completion or saved/reopened verification. A safe original-frame observer,
complete live/stored baselines and the full disposable lifecycle remain open.

## Worker-source fallback is not renderer authority

The existing frame project bus (`Dte` at PCB3131133) offers a possible route to
worker `getDataByType` at2144808. It is not a complete model observer. In pinned
worker `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928`,
`getCacheData` at2013292 can miss cache and invoke `getFlowParse` at2020301.
That path parses history into the existing consistency manager and updates cache
and history-index bookkeeping. Awaiting compression does not make those effects
disappear. A future worker reader needs its own explicit effect contract.

More importantly, renderer `cachePendData` at PCB3145459 can retain unpublished
changes. A worker snapshot therefore cannot establish the active renderer's
unsubmitted state, numeric model type, parent identity or missing model fields.
Repeated equal worker snapshots do not solve that provenance gap. No fallback
transport is enabled here. A narrow native String-create lifecycle, which can
establish a new object's origin, is a separate feasible direction; it still needs
full stored-effect checks, readback and saved/reopened validation.

### Next implementation: one native-created String

Start with a freshly opened, verified empty root PCB in the disposable project.
The native handler at PCB10393687 generates its own ID through `Jr.addText`
at7959947; do not reuse the decoder writer's caller-reserved-ID assumptions.
Fix layer3, default font, fontSize120mil, lineWidth8mil, alignment3, rotation0,
reverse=false, expansion0, mirror=false and unlocked state. Use simple exact
coordinates and printable ASCII with a non-space glyph. In particular, create
passes expansion unscaled, unlike modify; zero avoids that discrepancy.

Command execution at7922332 and the composite upload at7916642 can flush other
queued work. The returned ID precedes compiler pending publication, so it does
not prove an isolated stored STRING addition. Required modules are a fixed
request/projection, exact-frame one-shot create program, original-owner lifecycle
and full SQL addition verifier. Bind the native-generated ID, reject extra
objects or collateral changes, consume uncertainty without retry, and review a
separate single-Save path. Compiler save at3147110 waits for pending publication;
that alone proves neither complete persistence nor reopened equality. Finish
with closed SQL, same-ID reopened readback, final closure and a visual check.
This plan does not register a writer or qualify the Save path.
