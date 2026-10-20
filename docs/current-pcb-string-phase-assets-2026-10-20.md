# First default-font String asset phases

The new private `current-pcb-string-phase-assets.ts` observes the native text-base
manager separately from custom FONT caches. It remains unregistered. It cannot
create a String, Save, load an asset, call a vendor getter or certify persistence.

## Source boundary

The inspected installed PCB asset is `pro-pcb/3.2.193.682ed44e/js/pcb.js`,
10,976,299 bytes, SHA-256
`217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33`.
Research read its inert source bytes. The source was not evaluated.

`U8` at 3967919 holds the shared visible-text base. `F4`, aliased as `df`,
maintains a `map` of bases and a `uuidMap` of scalar-key hashes. The manager is
lazy. Its `get` creates a base only when the key is missing and increments
`num` for each acquisition. Unlike custom FONT-base setters, its ordinary
setters can leave zero-reference entries behind. Counting only current Strings
would miss those retained entries.

The key for the narrow first-String candidate is exactly:

```text
0/false/true/default/12/3/0.8/false/0/false/false/#000000/
```

The native `Wj` MD5 cache-key algorithm maps it to
`ecf7a782c8fad079e96715e80471d2d2`. This is a cache-key relation, not a
cryptographic trust assertion. The reader never calls `getId` or the native hash
function. It compares the fixed key and ID directly.

`i_` returns the default-font `Qd` result before it consults `nb` or `H8`.
`Am.queryFont` still assigns text type, outline and box. Default-font text thus
creates a `df` base even when custom FONT-template and FONT-base managers remain
empty. An empty `nb`/`H8` result alone never proved that the text base was empty.

## Fixed observation profiles

Three fixed programs use the original source-admitted Save-handler scope and
callback. Every call must use the existing original-owner protocol with
`throwOnSideEffect:true`. They preserve source-shaped own-data fields and
reference identity, never invoke lazy constructors, and retain final reference
and collection-size checks.

- `baseline` requires zero raw Strings and either a null `df.mgr` or an
  initialized manager with an empty `map`, empty `uuidMap` and undefined `_last`.
- `created` requires exactly one `df` map entry and one scalar-key association.
  The base is the exact `U8` fixed candidate, including `num:1` and explicit
  black color. The sole `bo` String must refer to that same base object.
- `saved` checks the same one-base relation under a distinct phase label. The
  label does not establish that Save ran or completed.

Each program also runs the existing empty-assets reader. It excludes current
custom FONT-template/base entries, unresolved font text, font-footprint
participants and BLOB-template entries. Null versus initialized custom holders
remain distinct. The composed supplied-data relation requires their full
decoded states to stay identical across all three phases.

The decoder rejects malformed, oversized, duplicate-key or extra-field replies.
The pure relation additionally decodes the independent raw String observations
at the created and saved phases. It requires matching document and primitive
identity, printable nonblank ASCII and the fixed default-base scalars. It
records both raw projection hashes. It does not equate those hashes or infer
unchanged geometry, text, data-state flags or complete model state from this
asset-only relation. Other effect models must check those fields.

## Evidence and remaining work

Six focused tests cover initialized/null baselines, extra or mismatched cache
entries, wrong reciprocal references and scalars, every custom-asset exclusion,
phase/document/raw-model mismatch, getter refusal and strict decoding. All three
readers also pass actual local Node V8 side-effect checks against synthetic
classes. A Proxy refuses without running its trap. No test executes vendor code
or observes a connected EasyEDA renderer.

This is a sampled heap relation. It does not establish original-owner authority,
whole-PCB emptiness, complete persistent FONT/BLOB history, pending asset-load
completion, glyph geometry, upload completion or saved/reopened equality.
Creation and Save must retain their own one-shot journals and effect proofs.
No runtime registration, native request budget, compatibility pin or installed
cache changed in this implementation.
