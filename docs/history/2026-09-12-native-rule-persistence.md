# PCB rule persistence

The typed rule executor uses the installed public `pcb_Drc` writers and one fixed per-document numeric-rule service, not `SYS_FileManager.setDocumentSource`. In the reviewed PCB engine, `xV.build` changes rule models but does not upload their compiler history. Its deletion loop also omits rule collections. An unchanged rule source setter is not a persistence fix.

## Reviewed implementation

The existing runtime tuple pins these installed files. No native installation is patched.

- PCB `3.2.149.5378b690/js/pcb.js`, SHA-256 `65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54`.
- Public API `0.2.53.aee2f57a/api.js` routes fixed positional `pcb_Drc` calls through the UI handlers.
- UI `3.2.149.43637efe/js/ui.js` implements the public differential-pair calls through its existing native pair-manager RPC.

Native PCB `iI`, offset 8382595, persists net classes and equal-length groups with `uploadNet`, `uploadRuleSelector` and `deleteRuleSelector`. Public numeric, net, between-net and region overwrite methods call `c1.setDesignRulers`, offset 8083879. Its family setters upload/delete actual rules, memberships and selectors. The numeric overwrite argument is the nested `Rule` definition object, not the complete getter result. The existing typed schema already requires this shape.

The native differential manager, offset 5281171, deletes/recreates every pair. It uploads only selectors whose identity or members changed. The adapter therefore completes a verified pair edit by invoking `overwriteNetRules` with the current unchanged `getNetRules` rows. This makes `c1` upload all reconstructed pair selectors. Source identity and all records must still equal the intended pair effect before and after this second call. It does not replay the pair edit.

Public `getCurrentRuleConfiguration` returns `{config,name}`, not the native complete collection. Its public overwrite wrapper can create a separate global custom preset when a system preset is selected. Numeric replacement therefore selects exactly one PCB frame by tab/type, verifies its complete `FileSource` against the captured baseline, and calls only `pcb/extensionAPI/drc-overwriteCurrentRuleConfiguration` with `{ruleConfiguration:typedValue}`. Omitting `configName` preserves the existing project template and avoids the UI's preset-store writer. The service calls `c1.setDesignRulers` with every other current collection unchanged. No general native RPC input is exposed.

The current spacing table has 13 rows and 12 column labels, with row lengths `1,2,3,4,5,6,7,8,9,10,11,11,12`. Pinned `GY.data` and `GY.modifyAllClearance`, offsets 3436276 and 3436649, omit the Board Outline self-cell. The Hole row retains all 12 preceding columns. The adapter preserves this exact shape and rejects both an added outline diagonal and a missing hole cell; it does not pad, reorder or infer clearances. A captured configuration passed offline replacement preflight with exactly one intended TRACK rule addition and no other changed or removed source records. That is preflight evidence, not a connected numeric-rule write.

## Preserved boundaries

The adapter compares complete source immediately before dispatch and after the public call, rechecks the exact PCB/tab at awaited boundaries, and retains the normal journal, retained process authority and whole-project saved/reopened proof. It does not weaken the source or database comparison. Generated code contains fixed methods and typed data only. No captured handler, event interception, new bridge or general native call is added.

Native group operations reset selected member rules. The adapter rejects affected nondefault overrides before dispatch. Configured group rename and referenced between-net rename are also rejected because the native rename recreates the selector. These are current adapter limits, not permission to erase those values. Explicit future migration support must retain complete rules and prove its intermediate effects.

The full native rule setter copies pair-level physics to members. Complete captured native selectors must prove those values already agree before calling it. Changes to blind-via definitions are rejected when vias exist, because that native setter can rewrite via geometry. The public net-rule method cannot set differential physics; such requested changes are rejected. Existing derived copper must be cleared through its own lifecycle before rules change.

Pure geometry batches still use one source-merge command group. A batch containing rules uses ordered source-bound steps so each rule reaches its real public persistence method. Every step is compiled and checked before the first dispatch, identities remain journaled, and the final complete source/database proof remains required. Mixed generated programs are bounded to 8 MiB; split an oversized mixed batch. A failure stops without retrying, saving or automatically applying an inverse.

Public writers can also materialize default net selectors already present in source but absent from the baseline database. The operation-specific durable proof admits only the exact empty default selector for a nonempty net already persisted with the same complete baseline body. Its source body must remain unchanged, and that operation must use a reviewed upload path for the selector. It does not accept custom source-only rules or groups, which could be unrelated unsaved work. It does not ignore changed fields, delete unexpected records or exempt another document. Original source hashes and every materialized ID remain in the proof. Existing durable rows remain strictly unchanged unless the typed operation changes them.

Focused rule cases cover public dispatch rather than source apply, stale-baseline refusal, override/rename refusal, pair persistence completion, mixed-batch ordering, full-setter collateral refusal and exact durable selector materialization. A numeric case proves unique-frame selection, exact positional service data and no global-preset call. Existing batch tests run alongside them. Connected saved/reopened rule coverage is still required; mock success is not durable proof.
