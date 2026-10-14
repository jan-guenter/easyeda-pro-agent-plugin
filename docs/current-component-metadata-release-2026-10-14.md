# Current PCB component metadata and admission parsing

Candidate: `0.3.0+codex.20261014213000`. Publication and installation pending.

## Scope

The existing Component `get` and `getAll` routes now include six optional raw
strings: `designator`, `name`, `manufacturer`, `manufacturerPart`, `supplier`
and `supplierPart`. Each is bounded to1024characters. Missing and own-undefined
values omit the field; empty strings remain present. Null, non-string, inherited
or accessor-backed selected values refuse without coercion or getter execution.
An unevaluated Name formula remains verbatim, not rendered text.

This extends the existing DTO; it adds no tool or SDK method count. Exact target,
retained receiver, complete-family bounds and two matching ordered samples stay
in place. Selected-ID reads compare all projected fields of every observed row
before returning requested IDs in caller order. Unrequested-row metadata drift
therefore still refuses the read. Other native attributes are neither enumerated
nor copied by the facade.

These are loaded-view observations, not verified manufacturer part identities,
schematic linkage, BOM export, saved records, parent ownership or edit authority.
The current type1/2/3 writer restrictions remain unchanged.

## Source basis

The reviewed PCB bundle `217199c8` registers Component enumeration at UTF-16
offset10336493. Its `Le.toJSON` at7397863 makes a shallow copy of `attrsMap`,
which preserves own-undefined fields. The public API bundle `021d155b` maps
the same six keys at1426362 to optional string getters at1431311 onward.
Native `getFormulaName` at4325200 evaluates Name separately, so this reader
must not claim rendered-label equivalence. The official
[Component getter contract](https://prodocs.easyeda.com/en/api/reference/pro-api.ipcb_primitivecomponent.getstate_designator.html)
also permits an unavailable value.

The native serializer still reads loaded footprint/device/font caches and
child arrays before projection. Output bounds do not cancel or bound that
vendor work; this change does not fetch library data.

## Verification and delivery

The same update removes repeated Acorn parsing of unchanged upstream execution
bytes. A bounded process-local cache retains only immutable dependency-specifier
lists, keyed by actual bytes, module format and parser policy. It stores no AST,
file content, path seal, resolved edge, graph or successful admission. Files are
still freshly read/hashed, dependencies resolved and graphs rebuilt on each
admission; parse failures are not cached.

Existing installed201000 timing observations show approximately1.35seconds in
the module-graph stage versus10.77seconds in execution-closure capture for the
same status sample. This is a modest reduction of redundant parsing, not a
measured end-to-end speedup or a fix for the dominant closure cost.

Nineteen existing focused and adjacent tests pass, including all six fields,
missing/own-undefined versus empty values, raw formulas, descriptor rejection,
metadata drift and caller-order selection. Both strict TypeScript configurations
and targeted type-aware lint pass with zero warnings. The implementation and
existing test changes are independently reviewed. The parse-cache's12existing
module-graph tests also pass, including immutable reuse, format/byte separation,
capacity limits and fresh file/package/permission checks after a cache hit.
Integrated strict types, full zero-warning lint, build, coverage, compatibility,
package/repository/privacy and all seven official skill validators pass.
Source340: `c0ecc836bb3e655a0eabd1f61c4bb0e7c111a30061970feeea78ab5d1ba20644`.
Runtime3: `f025ad0ec9a166466b8a2301ea6e9bd5fe6ad678b4ee9aa4552627dd35e461d6`.
External runtime/helper pins are unchanged. Required exact-payload CI and
installation results are recorded at delivery; neither is claimed here yet.

Installed201000 is being checked on the registered disposable PCB before the
successor is installed. Its reader/normal-close results will be recorded
separately; they cannot validate this new six-field projection. No production
design or its project record is in scope.

## Remaining work

- One installed nonempty check of this new metadata projection; source tests
  and older placement-only results do not provide that evidence.
- Reciprocal Component/Pad ownership and pin mapping. Native Component `pads`
  mixes pads and vias and strips parent text from IDs; the public pins mapper
  injects the requested parent rather than proving reciprocal ownership.
- Complete Pad shapes/holes/rules, other Component attributes, library/device/
  footprint/3D enrichment and BOM/export workflows need separate projections
  and contracts. Optional metadata strings cannot stand in for those bindings.
- Native structure-job completion and full SQL-effect proof still block
  current schematic/symbol/PCB writers and the eight affected metadata writers.
- Lost-handle supervision, quarantined-opening close, bridge Auto-Connect
  diagnostics and the broader library/3D/ECO/export backlog remain separate.

The control skill and its existing API/capability references explain the new
fields and their limits. No extra tutorial collection or test framework is added.
