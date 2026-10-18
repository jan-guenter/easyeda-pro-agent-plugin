# Current PCB STRING source relation

This increment adds an offline parser and comparison, not a reader transport or
writer. Nothing is registered in MCP. It does not access EasyEDA, projects,
checkpoints or journals, and does not change compatibility pins.

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
separately. Color, zIndex, unknown fields and other unprojected fields remain
preserved but cannot be verified by those reader DTOs.

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

Next work is a current exact-frame FileSource observation and separate disposable
String-create lifecycle with full SQL effects. The old decoder writer stays
disabled. The current native String-modify handler assigns layer, reverse,
mirror and lock without undefined guards, so a later narrow patch adapter must
reconstruct complete arguments from its verified baseline, not send only x/y/text.
