# Offline API and operation reference

Use `easyeda_control_api` before guessing a method, argument name, unit or nested
operation shape. It does not start the bridge, invoke EasyEDA or change journals.
Its request actions separate documentation from execution:

```json
{"request":{"action":"sdk","query":{"reference":"reviewed-installed","namespace":"sch_PrimitiveComponent","limit":25,"detail":true}}}
```

`sdk` searches the mounted `eda` namespaces and method/type declarations. The
reviewed snapshot has 93 namespaces and 749 signatures. `official-latest` has
99 namespaces and 806 signatures, from official declaration package 0.4.26.
Every response includes the exact package version, source digest and provenance.
Use `kind:"types"` to look up parameter interfaces/enums; type searches do not
take a namespace filter. Page with returned `nextOffset`, never infer that a
short first page is the complete catalog.

These are declaration snapshots, not runtime probing. Every SDK entry is marked
non-executable. Latest methods can be missing, stubbed or differently implemented
in the installed application. A method name that appears harmless can mutate
cache, UI, calculation or storage. Do not turn catalog entries into raw scripts,
private calls, compatibility changes or newly granted permission.

## Per-method coverage and omissions

```json
{"request":{"action":"coverage","query":{"namespace":"sch_PrimitiveWire","detail":true,"limit":25}}}
```

Coverage uses distinct mounted method paths, not overload counts. Every method
in either pinned snapshot has a row. A row can name a direct public call, a
narrower native task equivalent, an internal lifecycle dependency, or a concrete
omission with the evidence and work required to support it. A native equivalent
does not prove the public wrapper works. An internal Save call is not a new
standalone Save capability. Follow the returned route and its exact scope.

An omission marked as needing a scoped adapter is remaining implementation work,
not a claim that the method is impossible. Newer-only declarations require a
reviewed installed implementation. Known native stubs must not return fabricated
empty success. Current live validation is tracked separately from historical
proofs and offline contract tests.

The October source audit disabled `schematic-topology`: its netlist exporter
can annotate designators/Unique IDs and invoke Save All. Dependent schematic
transactions must stop at that proof requirement. Schematic netlist/BOM/document
and PCB netlist/BOM/PDF exports are also refused for hidden Save All. Simulation
export needs an unsupported NGSPICE editor. A File-returning method is not
necessarily read-only; never bypass these refusals with another dispatcher.

The separate exact-read kind `schematic-flat-topology` is a restricted diagnostic
replacement, not permission to resume those transactions. Its current profile
requires at most 16 already-loaded ordinary pages with single-part components,
literal named orthogonal wires, and both default net naming and inter-page name
connection enabled. It rejects hierarchy, ports/flags, buses, standalone net
labels, multipart parts, images, unknown serializers and unsplit contacts.
Page membership comes from a fresh verified complete-project checkpoint and
matching public declarations; native endpoint sets and serialized source must
agree in two observations. The escaped response remains bounded to 4 MiB.
It never opens pages, compiles a netlist or saves. The result explicitly reports
`transactionTopology:false` and does not claim connected validation. Use its
specific refusal to identify unsupported input; do not substitute cached nets.

## Fixed SDK reads and calculations

```json
{"request":{"action":"sdk-reads","query":{"method":"eda.pcb_PrimitivePad.get","includeSchemas":true}}}
```

```json
{"request":{"action":"sdk-validate","query":{"request":{"method":"eda.sys_Environment.getEditorCurrentVersion","arguments":{}}}}}
```

`sdk-reads` reports the exact fixed allowlist and per-method input schema used by
`easyeda_control_sdk_read`. `sdk-validate` checks those arguments offline. Neither
dispatches a method. Class-returning methods use maintained state projections;
callers cannot select arbitrary getters, callbacks or prototype members.

For live execution, pass the validated `request`, fresh `expectedContext` and
`expectedFingerprint` to `easyeda_control_sdk_read`. The facade serializes the
call within one authenticated session, enforces the editor family, proves context
before and after each observation, and requires two equal results. A failed call
stops without retry. Exact delegated UI, project-manager/worker and schematic
implementation hashes are checked before dispatch and before releasing results;
the public wrapper hash alone is not sufficient. Use managed evidence with
`summary` or `receipt-only` for large results. Undefined results remain distinct from an
empty collection.

Most routes are public SDK observations. Three ID-only routes are explicitly
classified as `native-task-equivalent`: schematic Text, Wire and Bus
`getAllPrimitiveId`. They accept only `arguments:{}` on the exact active ordinary
type-1 page. Wire net filters and symbol/block-instance scenes are refused.
The complete connected model tree must agree with the ID index; returned family
members must be source-backed direct root children. Generated drawing-frame Text
descendants are not standalone Text IDs. Structural GROUP source records remain
unsupported and refuse the observation rather than returning a partial list. Wire and Bus
IDs identify groups, not LINE children. These routes avoid the public callbacks
and compiler-backed wire/bus getters; they do not serialize source or invoke Save.
Their native-only authority labels distinguish them from public SDK projections.
Installed210100 returned one source-backed Text and empty Wire/Bus sets on the
disposable frame/text fixture. Installed214400 additionally returned all four
Wire group IDs on the populated disposable page with unchanged complete native
state and saved project. Nonempty Bus acceptance remains pending.
That evidence does not validate later facade generations. The older public-SDK validation runner
rejects these native routes before any dispatch; it is not their test runner.

`eda.sch_PrimitiveComponent.getAllPropertyNames` is a native equivalent on one
ordinary active schematic page, not the installed broken public wrapper or an
all-pages query. It reads exact keys from owned component attributes, including
inherited/generated frame and flag attributes, without reading values. Pin
attributes are excluded. Unknown Symbol kinds, structural GROUP records and
nonreciprocal ownership refuse the entire result. Empty and case-distinct keys
are preserved; shared transport-placeholder guards still apply.

`eda.sch_PrimitivePin.getAll` supports one ordinary active project-symbol PART
only. It proves native Pin membership and all twelve fixed getter fields around
each explicit `get(id)`, never invoking the broken public `getAll`. Custom pin
attributes, multipart/inherited shapes, associated devices and no-connect or
junction children refuse. Exact generated UnConnectDot ownership is admitted.
OtherProperty is explicitly undefined, not an inferred empty property map.
Rotation follows the installed getter, which differs from stored PIN rotation;
JSON transport normalizes signed zero. Installed214400 returned two expected
ordinary-symbol Pins with complete unchanged source and saved-project evidence.
Both had zero Y, length 10, shape None and type IN; wider geometry/enums and custom
attributes are not validated. Property-name enumeration passed a 29-key frame case and a
57-key case with two ordinary parts, three ground flags and a frame. The latter
included 19 inherited keys absent from page ATTR records, independently derived
from the referenced library and device records. Complete native and saved-project
state stayed unchanged. Neither native route is accepted
by the public-only fixture runner. Inspect their full limits and strict
empty-argument schemas offline.

`eda.sch_PrimitiveText.get/getAll` are native state observations for source-backed
root Text on one ordinary schematic page. `get` accepts `primitiveIds` as one
string or 1–256 distinct strings; both methods return arrays sorted by ID.
Missing, descendant or non-Text selectors refuse. The entire root Text family
must fit the 256-item bound even for a selected read, and complete reciprocal
tree/index/source ownership must fit 20,000 entries. Structural GROUP records,
symbol editors and block-instance pages are unsupported.

The fixed fields are `primitiveId`, `modelType`, `x`, `y`, `value`, `rotation`,
`color`, `fontFamily`, `fontSize`, `fontWeight`, `italic`, `underline`, `hAlign`
and `vAlign`. Coordinates retain native direction, including Y. Pose/style nulls
remain null; the native value getter maps an unset backing value to an empty
string. Horizontal alignment is null or 0/1/2 for left/center/right; vertical
alignment is null or 0/1/2 for top/middle/bottom. This is not public SDK getter
parity or resolved theme/default rendering. Two synchronous scalar captures and
two facade observations detect drift, with signed zero normalized only by JSON
transport. No public Text callback, compiler, serializer, RPC or Save is called.
Connected validation is pending. Use complete source and checkpoint evidence
separately when a task needs invariance or persistence proof.

`eda.pcb_MathPolygon.splitPolygon` accepts JSON `complexPolygons`: one to eight
groups, each a source array or one to eight source arrays, each at most 1024 tokens.
Shared aggregate bounds still apply. The facade constructs temporary SDK objects
and returns source arrays, preserving order and duplicates; no reusable handle
or CAD object is created. Installed210100 returned the exact rectangle/circle/
duplicate sequence on the disposable schematic; other polygon commands and
later generations still need separate connected evidence. The installed
`discretize` method throws `Not implemented`; a newer
declaration does not make it executable on this runtime.

Neither public results nor native ID observations replace complete native-source,
connectivity, lock, collateral or saved-project proof in a design transaction.
Stable public output can still reflect an SDK mapping limitation. The fixed
reader excludes writes, file/network transfers, navigation and resource creation.

## Typed design and library operations

```json
{"request":{"action":"operations","query":{"family":"design","prefix":"sch.","includeSchemas":true,"limit":10}}}
```

`operations` derives entries from the same strict design/library parsers used by
the executor. Request an exact `operationAction` for a complete individual
schema. `includeSchemas:true` includes input JSON Schema and its SHA-256. It
describes nested objects, defaults and bounds; JSON Schema does not capture all
custom refinements. Library status distinguishes unavailable operations. Design
actions still need their operation-specific context, source, authority and
durable proof. The [capability matrix](capability-matrix.md) records live coverage.

```json
{"request":{"action":"validate","query":{"family":"design","operation":{"action":"sch.wire.modify"}}}}
```

`validate` runs the exact offline parser, including custom refinements, and
returns normalized arguments or bounded field errors. The example is
intentionally incomplete: use its errors or the operation schema to assemble
the real request. A valid result means argument validity only. It performs no
native preflight, allocates no native IDs and authorizes no execution.

For callable upstream read schemas use `easyeda_control_discover` local mode;
its admitted route, not the upstream annotation, controls invocation. For typed
changes use the design/library executor after live status and exact context.
For genuine SDK gaps use the maintained native adapter or process-bound native
control, never bypass an incomplete transaction or orphan quarantine.
