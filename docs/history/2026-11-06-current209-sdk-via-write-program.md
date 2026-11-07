# Current209 SDK Via write program

The new narrow PCB writer starts from an original generated-fixture closed SQL
qualification and managed checkpoint. `current-pcb-via-write-plan.ts` verifies
those original references and the complete first closed inventory before a
native writer birth. It admits one empty-net normal through Via. It offers no
inverse or production target and requires no footprint document allocation.

The installed current209 argument order is
`create(net,x,y,holeDiameter,diameter,viaType,designRuleBlindViaName,solderMaskExpansion,primitiveLock)`.
The eighth argument is an explicit `{topSolderMask:0,bottomSolderMask:0}` and the
ninth is `false`. The legacy bridge's eighth lock argument must not be reused.
Explicit zero mask values avoid an implicit default-rule branch when predicting
the complete new source record. Coordinates use SDK/source mil units. The
native model divides coordinates by ten and diameters by twenty.

The receiver is the installed pro-api root. Its pinned `_7()` assigns
`Qt()._EXTAPI_ROOT_=Pe`, where `Pe=new Iy("eda")` is the original SDK root.
The program constructs no new EDA object, extension identity or CLI script and
borrows no HMAC/Engine authority. The complete API asset is
`pro-api/0.3.59.1ca9efb5/api.js`, 1980754 bytes, SHA256
`e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1`.
The exact installed Via-create and PCB-document-save method bodies are also
checked before dispatch.

`current-pcb-via-write-program.ts` provides capture, preflight, create, observe
and save stages. Capture retains the actual SDK objects, prototype methods and
private attempt state in one original remote array. Subsequent stages require
that same array. The original create and Save attempts are consumed before any
await. Each actual SDK Promise is awaited. Receiver or target drift refuses
later work, and a rejected or ambiguous Save cannot be replayed. The maintained
PCB opening observer brackets the actual call. Acknowledgements continue to
report persistence unverified and inverse unavailable.

Source trace for a separate PCB path:

- API `LT.create` at UTF16 offset 1353906 awaits the actual `qi.create` Promise.
- UI `IK.create` at 17252705 awaits `Ot(Pt.Pcb.ViaCreate)`, which selects the
  original active PCB iframe.
- PCB `eJe` at 10405683 creates one Via and one command group, updates frame and
  unsaved state, then returns its original primitive ID.
- UI `Vg.save` at 17323031 calls the existing UI `save` service. The PCB compiler
  save at 710174 awaits its own pending Promise and then the project-save RPC.
- Worker `uploadStructure` at 2104024 suppresses non-META/non-DELETE_DOC changes
  only when its actual third argument is true. A Via operation cannot assume
  that suppression without original flag provenance.

Five inert V8 tests use the actual installed SDK method bodies and the real
fixed program, with the outer target observer explicitly substituted. They
cover argument order, delayed original Promises, once-only failed Save, receiver
drift and copied bindings/plans. They supply no native ownership or live writer
admission. Node 24.18.0/npm 11.16.0, core limit zero, full TypeScript, strict
type-aware lint and repository/skill/MCP-contract validators passed.

The original `pcb-via-write209` native birth, selected-file SQL fence, native
before/after effect token, original Save serializer/canvas clock join, complete
closed SQL and fresh reopened proof remain separate required work. A fixed SDK
program or source plan does not satisfy those gates. No EasyEDA process or live
CAD call was started, and generated helper/pins/bundles were not changed.
