# Closed free-PCB creation: implementation research

Status: narrow source adapter implemented; synthetic tests and independent
source review passed. No connected creation or rename validation is claimed. No project,
editor, installed plugin or retained journal was changed by this work.

## Conclusion

A narrow native-task-equivalent for the existing `document.pcb.create` operation
is implemented. It admits only an absent `boardName`, an ordinary local project and one
already-open clean PCB. Create one closed, META-only, unbound PCB through the
project-qualified worker. Do not create a board, initialize a canvas, open the
new document, Save, delete, or promise an automatic inverse.

The public contract accepts an optional board name; omitting it requests a free
PCB and returns its UUID or `undefined` on failure. This is a narrower execution
profile than all argument branches of that contract. [Official createPcb method](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_pcb.createpcb.html)

## Installed source trace

Offsets below are UTF-16 string indices in the exact installed files, not byte
offsets. Paths are relative to EasyEDA's `resources/app/assets` directory. These
are static source observations, not evidence of a successful connected call.

| Source | SHA-256 | Relevant anchors |
| --- | --- | --- |
| `pro-api/0.2.53.aee2f57a/api.js` | `5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc` | `createPcb` RPC wrapper at 476174 |
| `pro-ui/3.2.149.43637efe/js/ui.js` | `12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a` | `Xk.createPcb` at 17052002 |
| `pro-sch/3.2.149.35ae2987/js/sch-main.js` | `0ed765f9fbc6482a0d8c209a73316aee1e4605c3faa5dd6c434dbfe96019a88d` | `H_e` at 3644226; `G_e` at 3644750; `ah` at 3647811; PCB case at 3649857; DMT handler at 6175112 |
| `pro-mgr/3.2.148.154949d9/js/pro-mgr.js` | `23089ec50bf701191c52af4a214b0d19b14e3233ead1bb5ccd50cf443e9e8742` | `te.PCB.ADD` registration at 2053169 |
| `pro-mgr/3.2.148.154949d9/js/project-worker.js` | `2792c6c87e3c60e09c43f03494a9cbb24e4ebe9c385372bbaf877ed75083a949` | PCB serializer `QR` at 645686; PCB manager `pg` at 1891082; `addData` at 1895824; `uploadLocal` at 2020854; worker add registration at 2141359 |
| `pro-pcb/3.2.149.5378b690/js/pcb-main.js` | `392995aeffcd72311a96f918c1ff68f7e10a087511fd75c9b823008b0ffa3530` | empty PCB ON_ADD and ON_UPDATE handlers at 2214284/2214335 |

The UI wrapper checks the selected board, then calls `DMT_CreateNew` with
`cmd: "new_PCB"` and `opt: {unOpen: true}`. The schematic manager dispatches
the PCB-specific local creation route; its `createPCBEditor` branch is skipped
when `unOpen` is true. Unlike page creation, this branch has no drawing-frame
initialization. It does include batching, optional concurrent checkout and a
separate log call. A direct worker adapter must therefore be described as a
native-task-equivalent, not execution of the public method.

The manager registration unwraps `J(projectUuid).pcb.addData(input).result`.
Worker `pg.addData` builds one DOCHEAD and one META, awaits `uploadLocal`, and
returns its native record. The fixed serializer produces
`{title, parent, source, board, zIndex}`; explicit empty board and parent plus
the worker's defaults produce `parent: ""`, `source: ""`, `board: ""`, and
`zIndex: null`. No LAYER, CANVAS, preference, rule, primitive, or library record
is emitted by this path. `uploadLocal` parses the history and writes its local
upload cache, but queues subsequent upload processing: its return alone is not
proof that the `.eprj2` checkpoint contains the addition.

The missing `user` field is a pinned construction-order property, not a guess
about the logged-in account. Worker base `Md` (2002637) does not assign `user`.
`_g` synchronously constructs `pg` (2093505); `vi` (1847454) copies the then
undefined `projectManager.user` into its own field. Only later does `subscribe`
(2103526) populate the project manager's user. That does not update `pg.user`.
Serializer `xt` (241441) adds `user` only when truthy. The creation proof thus
requires no `user` field and rejects a changed serializer result.

The public name is derived by `G_e/H_e` from all nondeleted PCB display titles:
match `/^PCB[\s_]*(\d+)$/i`, choose the largest numeric suffix, add one, or use
`PCB1` when no title matches. The worker's omitted-title fallback instead uses
its PCB document-ID count. Supply the derived public-path name explicitly;
refuse unsafe integer suffixes and title collisions before dispatch.

## Implemented adapter contract

1. Keep the existing strict operation schema. The execution validator rejects
   any supplied `boardName`; board attachment is a separate unproved branch.
   Derive the title, never accept caller-supplied native IDs, source or metadata.
2. Bind the complete strict native history, project UUID, owner, branch, active
   ordinary PCB UUID/tab and editor version. Reuse the closed-container DOM
   guard and split-screen-tree checks; reject hidden, orphan, pooled, imported,
   non-PCB and foreign frames. Preserve the old guard rather than broadening it.
3. Initially retain the container-rename baseline exclusions: imported atom
   header histories, hierarchy/reuse-block variants, inherited PCB/schematic
   documents and unrecognized record envelopes. Validate every record clock,
   insertion provenance and retained schematic header, not only semantic hashes.
   Require the separate complete raw document-record commitment described below.
4. Read the exact project and complete nondeleted PCB metadata list through
   project-qualified routes. Bind names, identities, source, parent and board to
   the checkpoint. Require writable/nonconcurrent, nonhistory, local ordinary
   project state; request `ui/hasDocCreatePermission` with `showMsg: false`.
   Recheck context and baseline after every awaited read and permission check.
5. Dispatch once, after retaining intent, using fixed
   `/PrjDB/pcb/addData` with
   `[{title: PLAN.desiredTitle, board: "", parent_uuid: ""}, PLAN.projectUuid]`.
   Require an unobserved 16-hex UUID, exact project identity, docType 3, exact
   title, empty source/parent/board, and retain that acknowledgment immediately.
   Do not await context or readback before durable acknowledgment retention.
6. Read back the new metadata and prove it remains closed while the original
   active PCB, context, tabs and DOM remain unchanged. Obtain a fresh complete
   checkpoint. Admit exactly one new PCB containing exactly one META; check its
   strict DOCHEAD, version/time, editor version, generated client and advanced
   META clock. Require all original documents, records, clocks and retained
   headers to remain exact. Only the checkpoint receipt binding itself changes.
   The new document's raw history must be exactly the pinned DOCHEAD/META pair.
7. Recovery must reconstruct the original plan and distinguish complete
   unchanged history from the exact one-addition effect. Changed-result recovery
   requires the retained native UUID; unchanged-baseline recovery does not.
   A lost ACK cannot be inferred from a convenient new document.
   Ambiguous dispatch stays quarantined; no retry, Save, delete or auto-inverse.

The existing [page creator](../../plugins/easyeda-pro-control/server/src/document-page-create.ts)
supplies the one-addition/early-identity structure. The stricter peer projection
and editor exclusion model are in
[container rename](../../plugins/easyeda-pro-control/server/src/document-container-rename.ts),
its [runtime](../../plugins/easyeda-pro-control/server/src/document-container-rename-runtime.ts)
and [DOM guard](../../plugins/easyeda-pro-control/server/src/document-container-rename-dom.ts).
Do not copy the page creator's semantic-only peer projection for this new proof.

## Complete per-document history proof

Adversarial review demonstrated that materialized records alone could miss a
peer's extra non-schematic DOCHEAD with identical metadata, or an overwritten
or tombstoned intermediate record. The new internal
`documentRecordHistory: "preserve"` option in the strict checkpoint reader
commits each document's exact `header||body` record encoding, in occurrence
order, before materialization can discard anything. It includes repeated and
stale headers, every object update, empty-body tombstones and deletion markers.
The digest chain also retains record count and maximum ticket; its seal binds
the immutable checkpoint hash and document UUID. Missing, rebound or invalid
supplements refuse. Default readers and semantic hashes are unchanged.

Only closed PCB creation and closed PCB/schematic renaming request this option.
All old document chains must remain exact during creation; the new chain must
match two independently reconstructed worker records. Renaming now requires
every peer chain unchanged and the target chain extended by exactly its pinned
DOCHEAD/META pair. This fixes the same gap in the existing rename path. No
existing guard was relaxed. The proof is per-document record history, not raw
whole-project bytes: EDIT_HEAD, chunk boundaries, trailing separators and
cross-document interleaving remain separate project packaging.

Previously prepared container-rename plans without this commitment are not
silently migrated: reconstructing them now yields a different complete-project
hash, so execution/recovery refuses. No pre-change live rename is being replayed
or reclassified to pass the stronger proof.

## Integration and tests

The distinct `project-pcb-create` kind has leaf plan/runtime/proof modules.
Execution classification, immutable mutation receipt, early-return
retention, checkpoint plan preparation, pinned native admission, post-readback,
proof selection, unchanged/effect recovery and recovery-state validation are
integrated. Discovery capability/omission output, SDK coverage and release
packaging are coordinated separately. The adapter uses the container native
profile's UI/manager/worker/PCB-editor pins; the name
algorithm is fixed local code derived from the reviewed schematic source, not a
call into its potentially loaded manager. It reports `saveInvoked: false`,
`reopened: false`, `editorOpened: false`, `canvasInitialized: false`, and
`automaticInverseAvailable: false`; checkpoint persistence is separate from an
explicit Save. Connected validation remains false until separately demonstrated.

Synthetic tests cover suffix gaps/case/separators, deleted names and
unsafe counters; all baseline exclusions; dirty/foreign/hidden/orphan/pool
frames; context drift after every awaited boundary; denied create permission;
exact fixed worker arguments; duplicate or malformed ACK; ACK-before-readback
retention; one-addition proof; unknown header/metadata, extra geometry, wrong
board/parent/source and peer clock changes; checkpoint substitution and late
drift; missing/invalid acknowledgments, publication and settled-dispatch cleanup
failures; and recovery that never redispatches.
Raw-parser tests separately cover non-schematic header retickets, repeated
same-value records, stale clocks, transient/tombstoned objects, exact serializer
encoding and checkpoint binding. The immutable SQLite reader test proves the
opt-in from real authenticated synthetic history, not just service doubles.
Generic library execution must continue to refuse a PCB create without its
checkpoint-bound plan.

The raw-history gap found during review has been addressed and independently
accepted in source. Installation/admission and disposable live proof remain.
Board-associated creation, opening/initialization, copying, deletion,
imported/hierarchical projects and Save/reopen are deliberately outside this
profile; their effects are not established by the one-META creation proof.
