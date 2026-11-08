# Schematic active-document source and metadata

A new origin-free leaf pins the actual m1/bv isActive getter, base tabId getter,
pe singleton getter and active-document lookup chain in both schematic bundles.
It also pins the original UI tt.getActiveTab. The complete scripts and manager
class spans remain hash-qualified. Twenty-seven exact callable profiles record
source spans, descriptions, native Inspector locations and real function arity.
The defaulted Nt parameter correctly leaves its JavaScript length at1.

The reached source chain includes Nt, Hn, oi, splitDocId, the sheet-path test,
the project-delimiter arrow and Wr/Xr. These source facts do not establish the
original receiver, native intrinsics or selected result. In particular:

- pe.instance lazily assigns _instance and constructs a manager if none exists.
  Runtime must independently prove the original existing singleton before use.
- manager.get uses native docMap.get only for its string branch. Its nonstring
  path reads all values and maps them; no selected lookup proof comes from it.
- Hn has a branch that resets a global RegExp.lastIndex. Exact actual input
  custody must exclude or separately qualify that branch before execution.
- Native String/Array operations, Object.prototype.toString, Map.get, window.UI,
  tt.currentTabId, manager/docMap entries and the returned document need their
  own original realm and descriptor proofs.

The decoder rejects extra/duplicate callable fields, foreign locations and
wrong descriptions. Class methods/getters/arrows have their actual two own
fields; ordinary sloppy helpers retain all five own fields, including immutable
null caller/arguments and their original writable prototype. Every result keeps
singleton, active-document and continuation authority flags false.

Two focused tests passed with configured pinned source and zero skips. Actual
Node24 Inspector qualified all27 functions in source-preserving inert realms
without invoking a getter/method or constructing a document/singleton. Both
TypeScript configurations and strict changed-file lint passed. No Core, native
ledger, controller, helper, pin, bundle or live application was changed.
