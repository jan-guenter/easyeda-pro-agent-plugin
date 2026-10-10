# Capability matrix

Use supported typed APIs first. Native controls cover genuine API stubs and dialogs. This matrix describes the current source package; an older installed snapshot may not contain these tools. The reviewed tuple is connected-read-admitted, and exact reads and typed operations still require their pinned implementation identities.

Current safety restriction (October 10): schematic compiled topology is disabled.
The installed netlist File getter can annotate components and invoke Save All.
All schematic transactions or recovery paths needing that reader stop at the
missing proof; do not bypass it with UI export or a generic SDK call. Schematic
netlist/BOM/document and PCB netlist/BOM/PDF exports are also refused because of
hidden Save All. Simulation export requires an unsupported NGSPICE editor.
Historical observations below do not override these current restrictions.

| Capability | Controlled path | Current boundary |
|---|---|---|
| Offline SDK and exact operation reference | api sdk/operations/validate | 749 reviewed / 806 latest official declaration signatures; exact strict design/library schemas and offline custom-refinement validation; no SDK invocation or runtime admission |
| Connection and active context | status, context | Authenticated responsive session, exact project path/UUID and document/type/tab |
| Existing project/document open | runtime open-existing | Saved PCB or schematic page; exact registry/checkpoint membership, exclusive-tab guard and complete unchanged SQLite proof; no creation, save, discard or replacement |
| Exact schematic components | exact_read | Stable double samples with fixed public projections; schematic-topology disabled pending a verified non-mutating replacement |
| API coverage and fixed public reads | api coverage/sdk-reads/sdk-validate, sdk_read | Complete per-method inventory; fixed schemas and bounded public observations, not native or persistence proof; current-generation live validation pending |
| Presentation-only schematic batch | design sch.layout.batch | Typed translation, display, wire/label edits and checkpoint-bound flag cloning; selected private design batches passed save/reopen and all 850 durable documents with 604 parts / 2,042 pin assignments preserved; newly added baseline profiles still need fresh-runtime validation |
| Existing schematic wire geometry | design sch.wire.modify | Native adapter with explicit cardinal geometry/style, net omitted, exact graph-derived child indices and awaited history; identity-only unstored-attribute alignment on reopen; exact source/topology and complete durable proof; disposable 16-document lifecycle and retained-Save recovery completed Sept25; no general inverse or arbitrary WIRE shape support |
| Retained split-wire layout repair | design repair-layout-wire-groups | Exact original island/drop/flag identities only; S06 correction and retained Save reconciliation completed live with original topology restored; consumed repairs must never be replayed |
| Recovery schematic page loading | design load-layout-pages | Unfinished layout or restored standalone wire baseline; one-shot sibling navigation, no Save, original topology and unchanged active native state required; restored-wire recovery passed nine-page loading and 850-document reconciliation, not writer validation |
| Exact PCB components/inventory/rules | exact_read | Direct-pad authority and global pad-parent correlation; known adapter-normalized fields remain documented in compatibility.md |
| Native source and schematic state | exact_read source/native profiles | Lossless bounded document records; volatile export DOCHEAD fields excluded; native hidden component state retained where public mappers omit it |
| PCB component pose/layer/lock | design | Typed effect plus attached records and whole-source comparison |
| PCB component / footprint 3D transform | design, pcb.component.model-transform / footprint.model-transform | Exact existing `3D Model Transform` ATTR value only; typed legacy mil/degree fields or native v2 affine; lock ancestry and full source/durable invariants; connected validation pending |
| PCB line/arc/via/pad/polyline/region/pour/fill create/modify/delete | design | Only representable installed source profiles; unsupported shapes fail before dispatch; create IDs are journal-owned; exact inverse not universal |
| Multiple PCB operations | design, pcb.batch | 1–256 sequential typed effects; geometry-only source merge or ordered source-bound public steps when rules are included; prior create references; initially locked records and descendants protected; no stack/rebuild inside batch |
| Net classes, differential pairs, equal-length and numeric rule collections | design | Typed collection/source adapters; support depends on exact representable records, not arbitrary rule JSON invocation |
| Physical layer stack | design, pcb.stack.replace | Complete typed physical layer list and enabled copper IDs; preserves existing native IDs/unknown metadata; native thickness quantization is explicit |
| Derived copper | design, pcb.pour.clear-derived / pcb.pour.rebuild | Separate selected-parent clear and rebuild with scoped derived geometry proof; source merge cannot silently rewrite existing derived copper |
| Schematic component properties and supported geometry | design | Native hidden properties preserved; per-family source proof; declarations that are SDK stubs remain refused or use a specific maintained adapter |
| Schematic net labels and no-connect | design, supported electrical adapters | Typed native paths for genuine SDK gaps, exact record and topology consequences; no generic private invoke |
| Library metadata | library capabilities/execute | Double-sampled supported metadata operations |
| Project footprint library create/modify | library | Scoped current-project record proof; save and reopen facts reported separately |
| Project DEVICE creation | library, library.device.create | One device bound to existing project symbol/footprint; no asset import/copy; complete durable addition and unrelated-record proof; no editor reopen claim |
| Project DEVICE association editing | library, library.device.modify | Association-only patch; existing metadata preserved; inherited placed-instance binding changes refused; no PCB footprint rebuild or implicit ECO |
| Existing external 3D model binding | library, supported DEVICE create/modify | Exact 32-hex model and collection identities; double-sampled metadata and pre-write recheck; changes binding/title only, not model file or transform |
| Project DEVICE model transform | library, library.device.model-transform | One stored DEVICE META transform; exact acknowledged inheriting SCH/PCB instance list; preserves all stored placement records and model bindings; saved record proof is not reopened or mechanical proof |
| Library recovery | library inspect/recover-authority/open-target/rebind-runtime/reconcile | Immutable original plan and returned IDs; unchanged baseline or exact original durable mutation; never redispatch or infer reopened geometry |
| Project footprint geometry | design, footprint operations | Exact-owner native history handlers, no full-source decoder; actual created IDs; identity-preserving modifies and explicit shape delete/create; full source/save/reopen proof; PAD tool-default effects documented |
| Project symbol geometry | design, type-2 schematic graphics | Existing single-part circle/rectangle/text/pin/attribute edits; explicit compiler save and exact library reopen; unsupported pin rotations refused |
| Other library and project lifecycle operations | library capabilities | Asset import/copy/delete and metadata changes outside supported profiles remain refused; inspect the actual execution-enabled action |
| File exports | library, supported export entries | Bounded in-memory file transfer to exclusive managed artifacts; hidden-Save routes listed above refused; fabricationApproved is false; inspect actual capabilities |
| Draft PCB DSN route context | export | Active-context/best-effort descriptor-bound artifact; not route/fabrication approval |
| Native windows/dialogs | native_ui | Discover exact installed process, inspect current handles, confirmed focus/input/normal-close; guarded right-click is source-tested, not yet live-validated; no bridge needed for bootstrap; observed-unowned is not Job authority |
| Itemized native ERC/DRC | check run | Fixed reviewed calculation, complete live calculation-scope snapshot, full saved SQLite invariance, itemized managed report; both fixture paths passed, current enabled rules only |
| Route lengths, paths, skew and widths | check route-audit | Stable exact source/pad inventory; planar lengths and typed width contracts; ambiguous contacts and omitted barrel delay remain indeterminate |
| Schematic-to-PCB ECO | native dialog workflow | Inspect scope/rows/options; applying an ECO requires separate full identity/net audit |
| Canvas and desktop captures | capture / native_ui capture | Managed visual evidence; canvas path has full PNG validation; desktop capture is not geometric, connectivity or persistence proof |
| Design commit | design commit | Durable no-repeat Save intent, save/reopen, source readback and exact complete selected-branch durable delta; unrelated library/documents invariant; retained recovery is operation-specific |
| One-request design completion | design execute | Apply then commit only its verified non-orphan result; same proof gates and retained failure journal; no retry or automatic inverse |
| Design rollback | design rollback | Supported exact inverse, fresh desired-state proof, native queued-write completion and a fresh complete durable baseline proof before terminal; never automatically saves |
| Runtime and orphan recovery | runtime / typed recover-authority | Retained Windows Job, authenticated native process ownership, immutable dispatch capture, old termination and replacement-session proof |
| Checkpoints and evidence | checkpoint / evidence tools | Read-only SQLite online backup, quick_check, managed hashes and receipts; checkpoint creation is not database restore |
| Legacy writer endpoints | runtime-disabled | plan/apply/verify/rollback/save_reopen remain refusal endpoints; use design instead |
| Raw JavaScript, automatic database restore, fabrication submission | unsupported | No unrestricted-code switch or implicit purchasing/manufacturing authority |

## Reported live coverage

The five original exact reader kinds passed on a small disposable fixture, including lossless rules and all four pad-parent/topology endpoints. Complete source and native schematic double reads also passed.

PCB component movement passed public and source-merge paths with save/reopen/inverse and all 12 documents compared. Schematic property restoration, a PCB batch and copper clear later passed save/reopen with all 13 fixture documents checked. Copper rebuild was recovered as completed from exact durable and reopened evidence without repeating Save; a separate four-ULP native arc reload difference was reported rather than treated as a general tolerance.

Native ERC reported one warning for floating fixture pins. Native PCB DRC reported zero violations under the current enabled rules. Both checks proved the complete saved database unchanged. Route audit reported the expected centerline length and width results; its documented ambiguity and omitted barrel-length limits remain.

Line creation and inverse had exact live checks without a saved lifecycle claim. Footprint-library creation had durable addition and all 13 document invariants, but no reopen claim. A managed schematic netlist export passed with hash-bound bytes.

The initial stack test exposed a real persistence failure: visible layer changes were not stored. The repaired stack and a net-class edit subsequently passed saved/reopened proof across all 14 fixture documents. DEVICE creation, reassignment and an inherited-model transform passed complete 14-document durable proofs.

Symbol geometry later passed save/reopen with all 14 documents checked. Its result separately composed the fully journaled prior LINE inverse that persisted late, explicitly reporting `isolatedTransaction:false` and both durable proofs rather than claiming unchanged collateral. A subsequent footprint LINE passed save/reopen and complete 14-document proof. After correcting a legacy PAD encoding mismatch, a footprint PAD land/mask edit passed exact live and complete 14-document saved proof. Its first reopen failed after the saved proof. Recovery then completed one observed close/reopen with exact source and all 14 durable documents verified, without repeating the edit or Save. These results do not establish every geometry path's live coverage.

These results do not cover every collection or export format, and no user design is fabrication-approved. Query the current catalog and report the verified phase.

The recorded ten-sheet schematic redraw completed Sept26 with saved/reopened
proof, complete 850-document comparison and 604 parts / 2,042 pin assignments
preserved. Its narrow historical corrections are completed, never replayable
recipes. The standalone native wire adapter separately passed a disposable
16-document lifecycle and retained recovery Sept25. Neither establishes every
possible source profile, general ERC closure or fabrication approval. This
revamp's new readiness/Save safeguards have offline regression coverage; no
new user-design edits or live lifecycle tests were performed for them.

## Adding support

Add a narrow schema, fixed API/adapter implementation, complete source effect and applicable topology proof, durable journal, created-ID/inverse model and recovery path. Validate newly admitted behavior on a disposable project before describing it as live-tested. Do not route a refusal through raw JavaScript or native UI to evade a failed invariant.
