# Offline API and operation reference

Use `easyeda_control_api` before guessing a method, argument name, unit or nested
operation shape. It does not start the bridge, invoke EasyEDA or change journals.
Its three request actions separate documentation from execution:

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
