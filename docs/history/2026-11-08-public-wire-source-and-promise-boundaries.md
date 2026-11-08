# Public Wire source and Promise boundaries

This source-only increment pins the actual `sch_PrimitiveWire` SDK, UI
adapter and both SCH renderer implementations. It enables no execution.
`current-schematic-wire-public-source.ts` checks complete file hashes and
half-open UTF16 spans for the original class, method, service, parser and
compiler roles. The literal SDK classes and UI delete namespace are retained
unchanged for independent inert Promise tests. These bytes establish no
application-owned receiver, namespace, callback, native job or source-held
continuation.

The pinned files are:

| Asset | Bytes | SHA256 |
| --- | ---: | --- |
| `pro-api/0.3.59.1ca9efb5/api.js` | 1,980,754 | `e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1` |
| `pro-ui/3.2.198.2800f583/js/ui.js` | 17,468,192 | `3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6` |
| `pro-sch/3.2.193.5dbe8bb3/js/sch-main.js` | 6,289,622 | `e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c` |
| `pro-sch/3.2.193.5dbe8bb3/js/sch.js` | 6,472,538 | `b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd` |

The actual SDK root assigns `this.sch_PrimitiveWire=new v0`; `v0` delegates
state to `Xa`. `create` waits for `Xa.create`, which awaits its original
manual getter Promise. `modify` calls `n.done()` and returns `n` without
awaiting that Promise. The native Promise test retains the real objects via
Node's `async_hooks` creation hook while unmodified classes run on inert
buses. The outer API Promise resolves while both the manual Promise and
`done` Promise remain pending. Only the original getter settles the manual
Promise and updates the same wrapper. A separate counterexample proves that
the outer ACK can precede a later `modify failed!` rejection. No Promise
constructor replacement, method wrapper, inserted await or remote-handle
copy supplies this evidence.

String-ID `modify` constructs a fresh `Xa`: omitted net defaults to the
empty string and omitted styles to null. They cannot be assumed to preserve
existing fields. Wrapper-instance modification has distinct setter behavior.
`delete` has another completion shape: its UI namespace passes the original
`VI.delete` Promise to the SDK getter, and the SDK's async return adopts that
Promise. The inert SDK/UI test proves it remains pending after the simulated
bus ACK until `deleteObjs` resolves. It does not prove real deletion or the
real delete service's collateral effects.

The UI's `VI` routes create and modify to the SCH
`extensionApi.SCH_PrimitiveWireBusUtil3` services. Both renderer copies run
`runCreateOrModifyAction` through the selected shape manager's action runner.
The parser normalizes the API line arrays and flips the Y coordinate. The
geometry branch passes points-only entries to `setLines`, applies style
attributes, traverses net names, then awaits the net compiler. It does not
supply the existing LINE ID.

The main compiler path is `xo` → `XD` → `q6.analyze/do` → `D0e`; the child
path is `Oo` → `SA` → `r5.analyze/do` → `Hpe`. The factory can await
`showNetMergeDialog` and publish an error toast. The 7,214-byte apply function
can create and remove zero-length wires/groups, split or merge groups,
replace LINE identities, clone/move/remove net-name or label attributes,
change name visibility, expand wires on pins, and remove bus entries. Those
are concrete source branches, not observed effects on the disposable fixture.
These pinned functions contain no direct SaveAll or general annotation API
call. Their complete transitive compiler/history/persistence effects have
not been qualified, so this audit establishes no absence of those effects.
Net-name and label collateral is already explicit.

The existing seven-record Wire fixture, identity-preserving geometry and
contact planners remain the basis for a native-equivalent writer. Its fixed
`setLines` replacement retains the existing LINE ID and avoids invoking the
public compiler path; that distinction must remain visible. The original
Wire capture purpose exists, but Core refuses Modify/Save before dispatch
without original source/worker/SQL proof. This increment preserves that gate.
The prior [native stage](2026-11-07-schematic-wire-native-stage.md) and
[original birth](2026-11-07-wire-edit-original-birth.md) keep their historical
limits.

The next coherent writer slice must bind original action/setter/worker
custody to that genuine Wire purpose, then port the maintained normal-history,
clock, Main transaction, Save and drain observations under separate original
Wire issuers. Closed full SQL/source comparison and a fresh saved reader must
follow normal close and helper release. Public SDK execution additionally
needs the actual `done`/getter and full compiler closure; its outer ACK is
insufficient. No duplicated geometry contract, alternate backend, caller
callback grant or schema-only execution route is added here.

Six focused tests pass with all four installed files configured, including
actual native Promise success/failure cases. Both TypeScript projects and
strict changed-file lint pass. These are source and inert-runtime checks;
there was no live application call, edit, Save, helper generation, pin change
or reopened validation.
