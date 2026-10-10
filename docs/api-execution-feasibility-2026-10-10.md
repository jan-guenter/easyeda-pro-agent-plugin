# API execution feasibility and remaining work

Research date: 2026-10-10. This investigation used official documentation and the
installed implementation files below. It did not open a project, call the bridge,
change a journal or execute a CAD writer. No user design was read or modified.

The useful boundary is method-specific. Some methods already have an executable
adapter. Some are empty in the installed build. Others need a stateful adapter
because they start dialogs, create additional assets or return before the full
workflow ends. The last group is engineering work, not an inherent API limit.

## Source identity

| Source | Bytes | SHA-256 |
|---|---:|---|
| Installed public adapter, `pro-api/0.2.53.aee2f57a/api-types.js` | 1,730,198 | `4da5b5184a78e2d3aca843dad6b147d7feb7ec1368160d73f49c4acbcf97dfdb` |
| Installed UI, `pro-ui/3.2.149.43637efe/js/ui.js` | 17,265,809 | `12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a` |
| Installed project worker, `pro-mgr/3.2.148.154949d9/js/project-worker.js` | 2,164,464 | `2792c6c87e3c60e09c43f03494a9cbb24e4ebe9c385372bbaf877ed75083a949` |

Paths are relative to the configured EasyEDA asset root. These hashes identify
the source examined; this report does not update runtime compatibility pins.
The [existing interface research](easyeda-extension-interface-research-2026-10-10.md)
records the separate declaration snapshots and full namespace counts. Official
documentation currently describes a newer API, so installed behavior below must
not be inferred from the latest method page alone. EasyEDA versions the API
separately from its editor. [Official version policy](https://prodocs.easyeda.com/en/api/guide/stability.html).

Local executor findings refer to
[library-runtime.ts](../plugins/easyeda-pro-control/server/src/library-runtime.ts),
[library-execution.ts](../plugins/easyeda-pro-control/server/src/library-execution.ts),
[library-operations.ts](../plugins/easyeda-pro-control/server/src/library-operations.ts)
and
[library-persistence-proof.ts](../plugins/easyeda-pro-control/server/src/library-persistence-proof.ts).

## Existing typed library and lifecycle actions

At the start of this work, 32 of the 68 strict library/lifecycle operation
schemas had no executor profile. Eight additional named gaps were outside
those schemas. The table accounts for all 40. It does not count the same SDK
method twice because of overloads, nor count a schema as live validation.

| Action or exact action group | Concrete reason it cannot use the existing executor unchanged | Implementation needed |
|---|---|---|
| `library.symbol.modify` | The installed UI destructures an omitted classification argument without a default. It also takes the existing title from a normalized search title, which can change mixed-case display names during description-only updates. | The disabled candidate below supplies a fixed empty classification object and the exact checkpoint display title. It still needs journal/recovery integration and a disposable saved/reopened test. |
| `library.symbol.create` | The public method calls the symbol service, which generates metadata and obtains initial canvas data. Ordinary symbols and sheet-symbol templates use different paths. The footprint verifier admits only FOOTPRINT records, so it cannot certify the generated symbol/part records. | Bind the requested ordinary type, exact generated template, returned UUID, native header and every new record. Add type-specific creation proofs before expanding to flags, ports or sheet symbols. |
| `library.symbol.delete`, `library.footprint.delete`, `library.device.delete` | UI deletion runs dependency-aware library deletion logic. A success Boolean does not identify every changed device, inherited instance or tombstone. The current footprint/device proofs admit additions or exact patches, not deletion closure. | Inventory every dependant before dispatch, refuse nonempty unapproved closure, retain deleted records and verify exact tombstones plus all peer documents. A restore procedure is separate from ordinary rollback. |
| `library.symbol.copy`, `library.footprint.copy`, `library.device.copy` | Copy can migrate canvas data and associated assets to another collection. The current journal retains only the existing create/association models and lacks a complete mapping of copied descendants. | Restrict initial support to explicit project-local targets, retain all returned and generated identities, compare copied geometry/associations, and prove no other assets changed. |
| `library.model3d.create` | The importer accepts file data and can return multiple UUIDs. Project-local model create is not implemented in the installed service dispatch. A single local project checkpoint does not back up an external model collection. | Add bounded managed-input transfer, explicit external collection authority, importer result inventory, units and geometry checks, external backup/recovery and per-model identity evidence. |
| `library.model3d.modify`, `library.model3d.delete`, `library.model3d.copy` | The installed service treats model storage separately from project DEVICE metadata. The local project checkpoint cannot prove or restore external model assets or references. | Add an external-library transaction store and exact model metadata/content/dependant proofs. Existing DEVICE model association actions do not edit the model asset. |
| `library.symbol.source.replace`, `library.footprint.source.replace` | Full source replacement invokes a document decoder. The footprint wrapper can create a preview iframe and invokes its compiler save. These are not metadata-only operations and can change unknown records or persist before a separate design commit. | Validate complete source grammar, owner and locks, enumerate accepted record changes, model decoder-generated IDs, preserve unknown records, and integrate the wrapper's actual save boundary with no-repeat recovery. Prefer existing typed geometry actions for ordinary edits. |
| `project.create` | The API takes team/folder identity and can create account/cloud state. The disposable-local-project request does not designate an external destination. The pinned public delete method is an empty refusal, so public create cannot promise an inverse. | Add explicit destination authority, account-scoped inventory and recovery, or a separately reviewed local-project creation adapter. Never test this against a personal/team workspace by default. |
| `project.open` | The installed open path can discard unsaved state. The generic descriptor has no proof that every open document is clean. | Use the existing retained-runtime `open-existing` route for its supported saved project case. A broader opener needs complete tab/dirty-state proof and one-shot navigation/recovery. |
| `document.activate` | Activation changes the exact context; an acknowledgment can be false even when the requested tab becomes active. The existing executor's preserve-context path is inappropriate. | Resolve the tab against a complete editor tree, perform one activation, observe bounded coherent target context and verify unchanged project records. This is feasible without a new design writer. |
| `document.close` | Close can open a Save/Discard prompt or trigger late persistence. A returned Boolean does not prove a clean close. | Prove the exact tab is clean, retain one close dispatch, observe its removal and native prompts without selecting Save/Discard, then verify unchanged durable records. |
| `document.pcb.create`, `document.schematic.create`, `document.page.create` | Creation assigns native identities and may change board/container records. The pinned create methods accept a board name or parent schematic, not a new document title. The existing strict schema correctly omits a document-name field. | Retain the complete creation inventory and exact native defaults. If a caller wants a chosen title, journal a subsequent returned-ID-bound rename, with exact inventory deltas for both steps. |
| `document.pcb.copy`, `document.schematic.copy`, `document.page.copy` | Copies clone source, pages, IDs and parent membership, beyond the current single-document patch proof. The strict copy schemas expose target/parent scope, not a new document title. | Retain the copied hierarchy and identity mapping, then separately rename if requested. Check every copied source and all untouched documents. |
| `document.pcb.rename`, `document.schematic.rename`, `document.page.rename` | Public methods exist, but the generic library executor has no lifecycle metadata-delta profile. Names appear in saved META records and editor/container state. | Add exact target/parent binding, duplicate-name checks, metadata-only history proof, bounded context observation and one-save recovery where required. This is feasible; no SDK absence justifies omitting it permanently. |
| `document.pcb.delete`, `document.schematic.delete`, `document.page.delete` | Deletion changes document hierarchy and can remove descendant pages or board associations. The current persistence comparison requires those peer documents to remain unchanged. | Authorize the exact deletion closure and prove only its tombstones and parent references changed. Retain a recoverable project backup; do not label a new empty document an inverse. |
| `document.pcb.save`, `document.schematic.save` | A standalone Save would bypass the design transaction's pre-dispatch intent and saved/reopened source proof. A second Save after an ambiguous first one is unsafe. | Route saving through the maintained design commit lifecycle. Supporting a general Save requires an original-journal-bound intent and exact pre-save source/durable expectations, not a new Boolean-return endpoint. |
| `project.rename`, `project.description.modify`, `project.copy`, `project.delete` | The corresponding pinned public implementations are empty or return false. | A dedicated native adapter or deliberate newer-runtime review is required. Merely exposing the method cannot make these pinned bodies work. |
| `library.device.source.replace`, `library.model3d.source.replace` | The reviewed mounted classes contain no `updateDocumentSource` method. DEVICE metadata and model file storage are different contracts. | Use dedicated DEVICE association/property operations; add a model import/replacement transaction for model files if needed. Do not fabricate a source-replacement API. |
| `eco.schematic-to-pcb` | Public `pcb_Document.importChanges` opens the ECO workflow. Applying the change set is not the same operation as opening the dialog. | Capture the exact comparison rows/options and UID/pin/pad/net consequences, then add a reviewed apply adapter or guarded native dialog sequence and complete saved/reopened proof. |
| `export.pcb.interactive-bom` | The installed UI creates a hidden welding-tools iframe, changes a global export flag and URL hash, then waits on an event subscription. That helper has no bounded cancellation or subscriber cleanup. | Own the iframe/subscription lifetime and timeout recovery. Verify generated HTML as inert managed bytes and unchanged design state. The ordinary `File` wrapper alone does not cover this workflow. |

These rows distinguish a genuine pinned implementation gap from an incomplete
plugin adapter. Most local metadata/lifecycle gaps are implementable. Cloud and
external model changes need a different authority and evidence model rather
than a weaker project-checkpoint comparison. Official method families are
documented under [editor control](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_editorcontrol.html),
[schematic documents](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_schematic.html),
[symbols](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_symbol.html)
and [manufacturing export](https://prodocs.easyeda.com/en/api/reference/pro-api.pcb_manufacturedata.html).

## Implemented symbol-metadata candidate

[project-symbol-metadata.ts](../plugins/easyeda-pro-control/server/src/project-symbol-metadata.ts)
adds a narrow ordinary-symbol metadata adapter. It accepts an existing
`library.symbol.modify` schema but remains absent from the public execution
switch. It supports an exact project-local name/description patch, not creation,
classification, source replacement or external library edits.

The installed UI class method `VL.modify` in the hash-pinned UI source
constructs metadata from the
existing symbol, takes the search title as its default and destructures
classification before its guarded update. The candidate supplies the checkpoint
display title even for a description-only patch and supplies an internal empty
classification object. It preserves the method receiver. The footprint method
already defaults classification to an empty object; it does not have this
particular omission defect. The newer official contract still makes
classification optional, which is why checking only its declaration would miss
the installed bug. [Official symbol modifier](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_symbol.modify.html).

The project worker's `gg` symbol manager maps native metadata into its stored
META record using `title`, numeric `docType`, `tags`, `description` and `source`.
Its getter separately derives normalized search and display titles. The
candidate therefore requires stored `META.docType === 2`, not an invented
`symbolType` field. It compares the supplied complete before/after histories,
allows only requested META title/description changes and the reviewed edit
header fields, and preserves every other record. This is a local comparison,
not a claim that the histories came from verified checkpoint receipts. Its
result reports `effectVerified` and `persistenceEvidence`, never `saved:true`.

The six focused regressions cover rejected families and raw fields, normalized
name collisions, geometry/binding/peer/header changes, the display-title and
classification fixes, owner/context drift across an awaited read, false
acknowledgment and a throwing writer. Failure after a writer invocation consumes
one invocation; the generated program never retries. Tests use synthetic
history and API doubles. They are not connected validation.

### Disposable acceptance still required

1. Use an admitted fresh facade with no incomplete journal and an explicitly
   disposable project. Capture complete baseline project history, exact source,
   symbol membership, owner and current runtime identity.
2. Choose an existing ordinary symbol with a mixed-case display title, stored
   description, at least one pin and a placed DEVICE dependant. Retain the exact
   geometry and all instance bindings. A fixture without those records cannot
   test their preservation.
3. Integrate candidate preparation, dispatch intent, returned receipt and
   reconciliation into the library journal. Enforce the existing compatibility,
   no-orphan and complete-durable-baseline gates. Do not call the candidate as an
   ad hoc script around those controls.
4. Patch the description only. Prove the mixed-case title and every pin/part/
   instance record unchanged, the one description changed and no peer document
   altered. Retain verified checkpoint receipts separately from the pure effect
   comparison.
5. Close/reopen the exact library asset once and inspect the retained source and
   saved project again. Apply the inverse metadata patch through a new verified
   transaction and repeat the saved/reopened checks. Never repeat an ambiguous
   call or bypass a failed comparison.
6. Repeat with a rename, duplicate-name rejection, false/late native result and
   interrupted transport. Recovery must retain the original identity and must
   not redispatch the original mutation.

Only after those phases pass should the executor switch and capability matrix
advertise connected symbol metadata support. The caller must not infer support
from the candidate file's presence.

## Other SDK groups

The method-level catalog is the appropriate place for the complete mounted
method inventory. The following requirements explain why the rest cannot all
be exposed as method names plus JSON arguments.

| Group | Required adapter boundary |
|---|---|
| Plain project/editor/layer/rule/library reads | Fixed method allowlist, exact argument parser, retained runtime/context checks, complete bounded serialization and unchanged saved design evidence. These are the best broad coverage increment. Public fields can remain lossy; preserve existing exact-native readers for authoritative geometry and connectivity. |
| Geometry classes and helpers returning class instances | Convert only explicitly defined fields or maintained source records. JSON serialization can erase methods, undefined values and prototype state. Do not claim returned JavaScript objects are an exact native record model. |
| Schematic/PCB interactive placement | Callback and canvas state persist beyond the initial invocation. A transaction needs cancellation, foreground/context ownership and complete terminal geometry, rather than passing a JavaScript callback from the agent. |
| Event, timer, menu and shortcut registration | Register only plugin-owned functions under owned IDs. Require bounded event queues, unsubscribe/remove on completion and recovery after interrupted ownership. These methods are extension plumbing, not ordinary one-shot CAD queries. |
| Generic message bus and external APIs | Arbitrary topics or extension-provided method names can invoke unreviewed code. Each useful operation needs its own fixed schema, implementation identity and resource scope. |
| Filesystem, network and storage | A getter can disclose private files or account data; a write can affect files outside the disposable design. Require managed paths/artifacts or separately authorized endpoints and payloads. Existing bridge networking is infrastructure, not authorization for an arbitrary network request tool. |
| User dialogs and windows | A Boolean or window ID does not prove which dialog remained visible or what a later user choice did. Use process-bound native observation or a tracked plugin-owned window with an explicit lifecycle. |
| Latest-only help, simulation-model library, autorouting and image tools | These mounts are absent from the reviewed 0.2.53 declaration/implementation tuple. New declarations cannot be used to bypass installed-runtime compatibility. Admit a newer tuple and test each operation before dispatching it. |

The ownership concern follows directly from the documented callback-bearing
[schematic event APIs](https://prodocs.easyeda.com/en/api/reference/pro-api.sch_event.html)
and topic-based [message bus APIs](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_messagebus.html).
The file APIs explicitly include arbitrary filesystem reading, writing and
deletion, not only export downloads.
[Official filesystem reference](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_filesystem.html).

## Exports and practical limits

The existing executor had admitted its typed export actions through a bounded
file-transfer path. Deeper delegated-source review found six hidden-Save paths:
schematic netlist, schematic BOM, schematic document, PCB BOM, PCB PDF and PCB
netlist. They now refuse before dispatch; the schematic netlist can also
annotate designators and Unique IDs. The simulation export separately refuses
because its installed handler requires an unsupported NGSPICE editor.
[The independent review](api-coverage-review-2026-10-10.md) records complete
call chains, hashes and function boundaries, including the impact on the former
schematic-topology reader. Returning a File is not evidence of a read-only
method.

For the remaining admitted formats, transfer requires a real nonempty File,
bounded filename/type, complete byte count,
canonical base64 chunks, a matching SHA-256 and an exclusive managed artifact.
The current single-dispatch cap is 2 MiB, although the descriptor schema can
describe larger requested files. Larger exports need a tracked chunk service
with a lifetime-bound file handle and hash, not a raised JSON transport limit.
The existing 3D export rejects automatic model generation because that option
can create library data outside a read-only export transaction. These are
explicit runtime constraints in `library-runtime.ts`, not unsupported SDK
methods.

Interactive BOM is separate for the concrete asynchronous UI behavior described
above. STEP/OBJ, IPC-2581, Gerber/drill and placement exports still
need content-format checks and operation-specific fixture runs before release
approval. A file hash proves byte identity, not manufacturing correctness.

## Evidence in this change

The candidate's six tests pass on Node 24.18.0. Targeted type-aware Oxlint reports
zero warnings/errors. This report and the candidate contain no connected test
claim. Publication, installed-package verification and live fixture results
belong in the release record after they actually complete.
