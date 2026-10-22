# Common graph enumeration and JSON lookup evidence

The raw common graph now records two additional facts needed by selected pure
JSON body encoders. They are optional in the decoder for older supplied graphs.
The new collector always emits them. Missing metadata means unknown, never an
inferred default.

Object nodes carry `enumerableKeys`, a duplicate-free subset of their captured
field names in the same order. Values of non-enumerable fields remain in
`fields`; the collector does not drop them. The descriptor used to capture each
value also supplies its enumerable flag, and final descriptor checks reprove
the value and flags together. Decoder checks reject unknown keys, duplicate
keys or a different relative order.

Object and array nodes also carry `jsonToJSONAbsent`. The collector walks own
and inherited descriptors to a null prototype without reading a `toJSON`
property or invoking it. A missing descriptor throughout the chain produces
true. Any present descriptor, including an accessor or a non-callable value,
produces false. The false case is deliberately conservative. It does not claim
that JSON would call a non-function. The decoder rejects a true absence marker
when the same node contains an own `toJSON` field.

Each walk is bounded to 16 objects. The complete program retains at most
32,768 lookup checks. Its final check repeats descriptor presence and each
absent link's prototype identity. A changing link, appearing descriptor or
disappearing observed descriptor refuses. Lookup evidence is sampled within
this fixed program; it does not establish an asynchronous stable interval.

The collector also requires `toJSON` absence through `Object.prototype` and
`Array.prototype` before it constructs its reply. This prevents the final
JSON.stringify of the generated plain reply from invoking an inherited
serializer. Source-class prototypes can still contain their own serializer;
their graph nodes report false without invoking it. Own accessors and function
values retain the existing graph refusal behavior.

## Consumer contract

A pure native JSON relation may admit a plain or null-prototype object only
when both metadata fields are present and `jsonToJSONAbsent` is true. It must
use only `enumerableKeys`, in their captured order, and preserve native
undefined-field omission. Arrays require explicit `jsonToJSONAbsent:true` and
retain dense indexed access regardless of each index's enumerability.
Custom classes, missing evidence and false absence markers require a separately
modeled branch or refusal. Merely having an enumerable-key list is insufficient.

This addition proves neither pristine intrinsics nor prototype-source identity.
Actual readers still require their original source/scope owner and
`throwOnSideEffect:true`; descriptor checks alone cannot reject Proxy traps.
Supplied graph data never becomes a runtime authority token. Complete baseline,
native no-mutation, Save and persistence gates are unchanged.

## Verification

Six new focused tests cover hidden values and enumeration order, dense arrays
with non-enumerable indexes, inherited serializer detection without getter
invocation, backward decoding without inferred metadata, contradictory and
malformed metadata, walk-depth refusal and actual local V8 side-effect checks.
Prototype serializer getters and a Proxy chain refuse without running their
getters or traps. All 17 combined metadata/common-state tests pass, including
the existing 270-layer payload bound and three fixed-reader V8 checks.

The existing limits remain 4,096 graph nodes, 4,096 entries per collection,
32,768 graph fields, depth 32, 4,096 characters per string, 131,072 captured
string units and 524,288 encoded UTF-8 bytes. Enumeration names repeat names
already charged as captured fields; the final encoded-byte bound includes all
new metadata. No live calls, vendor evaluation, native request budget changes,
bundle edits, compatibility-pin changes or installed-cache changes were made.
