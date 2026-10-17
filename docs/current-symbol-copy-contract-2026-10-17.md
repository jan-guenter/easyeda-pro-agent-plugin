# Current closed-symbol copy contract

## Decision and scope

A narrow, closed project-local copy is the best next fixture-creation route.
It can copy an existing ordinary type-2 symbol into a new unused document,
including its existing PART and drawing, without opening a symbol editor.
The candidate implements this as a separate disposable-only lifecycle, not
ordinary copying or a live-validated operation. The public workflow is in
[disposable symbol copy](../plugins/easyeda-pro-control/skills/easyeda-pro-control/references/current-symbol-copy.md).
No application runtime, bridge, project file or database was accessed for this research.
Only installed application code, repository code and official documentation
were read.

The subsequent [compatibility correction](current-symbol-copy-compatibility-2026-10-17.md)
records retained disposable-fixture preflight findings for ASCII title folding
and native element counters. Those later reads and source changes do not claim
connected copy execution.

Prefer this route over initializing the existing META-only validation symbol.
It preserves that completed fixture and avoids inventing PART bodies or
combining editor initialization, drawing and Save into one new proof. A copy
still needs a new membership/effect model, its original returned UUID and a
complete retained-owner lifecycle. It is not permission to call a private RPC
from a temporary script.

The current legacy `library.symbol.create` adapter remains blocked by
`server/src/library-execution-lifecycle.ts`. It creates only a closed META-only
document; it does not initialize a PART or drawable canvas. Current symbol
geometry and native Save are also blocked. Using UI creation or drawing to
avoid those restrictions would bypass the same unimplemented completion
contract. See `server/src/project-symbol-create.ts` and the control skill's
`references/libraries-and-eco.md`, especially its structure-write restriction.

## Sources

The official beta [LIB_Symbol.copy method](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_symbol.copy.html)
accepts source symbol/library IDs, target library ID, optional classification
and an optional new name. It returns the new symbol UUID or undefined. The
official beta [LIB_Symbol.create method](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_symbol.create.html)
has a broader library, classification and symbol-type contract than the closed
project-local operation proposed here. Both pages were checked on 2026-10-17;
their current declarations do not establish installed behavior.

Installed source pins were independently rehashed. Paths below are relative
to the installed application's `assets` directory. Offsets are zero-based
JavaScript string offsets in the decoded UTF-8 source, not line numbers.

| Label | Relative path | SHA-256 |
| --- | --- | --- |
| WORKER | `pro-mgr/3.2.184.355087e9/js/project-worker.js` | `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` |
| MGR | `pro-mgr/3.2.184.355087e9/js/pro-mgr.js` | `005584e02cd9b2d49fdb387b2f997c1c8d3f88b0c48a7531c8097c483ed0bd2e` |
| UI | `pro-ui/3.2.196.26ed3d6c/js/ui.js` | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |
| API | `pro-api/0.3.50.ab46409c/api.js` | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| SCHMAIN | `pro-sch/3.2.192.b79ad524/js/sch-main.js` | `d9d6a955bf40d57daf9f27f31e0fff3191715ff50582418ad0922beb71b424bd` |

SCHMAIN's pin is the maintained current-project-only implementation pin in
`server/src/current-disposable-open-profile.ts`; the other four were freshly
hashed during this research. These pins do not grant dispatch authority.

## Public wrapper versus the smaller native operation

API `copy` at 1327835 forwards an extension-message-bus call. UI class `mv`
at 17364722 implements the receiver. Its copy branch fetches symbol information,
interprets source classification, optionally resolves target classification,
then calls `Ze.createSymbol`. It decides whether libraries are project-local
using mutable current-project state after awaited work. It catches failures
and can return undefined. That entire public contract is not admitted here.

Two narrower native paths exist:

- `/PrjDB/symbol/createData` takes exact project-qualified creation data.
  WORKER `create` at 1935107 builds new metadata, requests the original source
  through `getProLibSource`, generates a canvas delta, then uploads once.
  The source request returns through the UI notify bus. UI
  `getProjectLibByWorker` at 6339158 selects the explicit project and symbol
  and calls its `getStr`. No symbol-editor open appears in that path.
- `/PrjDB/symbol/cloneData` is smaller for an existing local symbol. MGR
  registration at 2066446 forwards the supplied project to `K(project).symbol`;
  the manager method at 1760404 forwards to the initialized project worker.
  WORKER `clone` at 1940076 calls its own `getCanvasByConsistency` directly.
  It avoids the UI source round trip and the public wrapper's classification
  and mutable-current-library routing.

Prefer the second path for the first implementation. Its fixed options should
be `keepSource:false` and `renameKey:true`, with an exact checkpoint-member
source symbol and project. The worker generates the new UUID regardless of
the incoming `uuid` field because it calls `buildString` with `keepUUID:false`.
The adapter must retain the original returned UUID; it must never discover a
successful result by its title alone. This would be a native task equivalent
for a limited local copy, not direct execution of `lib_Symbol.copy` or support
for its caller-selected new name/classification arguments.

Native rename derives an available name using `tryRename`, `ir` at 1372052
and suffix helper `l6` at 1371847. It checks up to its bounded loop limit.
The planner must reproduce that exact rule from complete project names and
reject exhausted or ambiguous outcomes. Do not assume the name is always the
source name plus `_1` or accept a duplicate because the native loop returned it.

## Exact copy effects to model

WORKER `_g` at 1928140 owns symbol metadata. Its `get` returns a new metadata
object; `clone` shallow-copies that result before assigning the new UUID,
source and version fields. With `keepSource:false`, the destination `source`
and input version are empty. Title, description, tags and docType come from
the source, except for the derived unique title. It does not update the source
symbol. Restrict the initial contract to ordinary type 2, bounded metadata,
nonempty supported drawing records, no external dependencies and no open
editor for either source or destination.

Let `M` be the exact pre-dispatch worker maximum ticket:

1. `buildString` at 1934138 generates a new 16-hex UUID, emits DOCHEAD at
   `M + 1`, then emits its META at `M + 1`. The base-class `newTicket` getter
   at 1856486 advances the worker maximum to `M + 1`.
2. `getCanvasByConsistency` at 2146197 serializes only the source document.
   It excludes META, META_PLACEHOLDER, DELETE_DOC, META_CREATE and META_MODIFY,
   preserves first-ticket information in that intermediate string, and does
   not request numbering, clearing deletes or changing pending records.
3. `canvasString` at 1938805 creates a second destination DOCHEAD at `M + 2`
   and its own fresh document-clock sample. The new destination has no stored
   canvas yet, so the comparison's old canvas is empty.
4. `oO` at 265925 and `Ni` at 266811 copy each source canvas atom's final
   type, ID, raw body and ticket. They regenerate atom headers through `$e`
   at 241789 without forwarding `firstTicket`, `pend` or `num`. Intermediate
   compression does not request `keepClient`, so emitted atom headers normally
   omit client and inherit the destination header's client. Do not describe
   this as preservation of the original source atom client or first ticket.
5. One `uploadLocal` at 2031178 parses the combined metadata/canvas strings,
   writes the upload cache or its fallback buffer, and schedules upload.
   `onDocHead` at 275156 advances the global maximum for the second DOCHEAD,
   including when its time does not replace the selected document header.
   The expected resulting maximum is `M + 2` under the no-concurrent-change
   precondition. Original source atom tickets must already be at most `M`.

The new document therefore gets fresh physical first occurrences at the copied
winning atom tickets. It does not inherit the source's complete history or its
old first-ticket lineage. Bodies and IDs stay unchanged within the new document;
no geometry or pin-map repair is implied. The model must preserve every raw
source/peer occurrence and prove exactly one new destination document.

The `createData` alternative is different: local `getStr` at 1939611 includes
the source META before its canvas. `oO` does not exclude source META by default.
That old META is copied too, but its ticket is at most `M`, so the destination's
new `M + 1` META wins. This adds an unnecessary historical record and proof
branch. The recommended `cloneData` path obtains canvas directly and excludes
that old META. Do not apply one expected-history string to both routes.

## Source and cache effects

Neither reviewed clone code nor its source serialization schedules a source
symbol update or an editor Save. The compressor at 284133 only performs its
pending-record rewrite branches when the corresponding options are selected;
`getCanvasByConsistency` selects none of them. Its data retrieval can still
read/populate native cache state. This research does not establish global cache
invariance or atomic source capture across awaits.

Destination creation also has subscribers. WORKER `onDataChange` at 1928230
publishes symbol-added and metadata-updated notifications. SCHMAIN handlers at
6206357 and 6206806 fetch the new symbol and update its component cache. The
update handler calls linked-sheet propagation only when `zTe` at 5744861 finds
a matching symbol reference; `Em` at 5762435 can otherwise reopen/rewrite
affected sheets. A fresh UUID absent from the complete baseline cannot already
be a valid referenced target, but the new adapter still must prove that absence
and reject concurrent insertion or a collision. Cache membership changes for
the destination are expected; source and peer design records must not change.

WORKER `uploadStructure` at 2104005 schedules the existing delayed structure
job, whose `task2` promise is created only when its body starts. Ordinary type-2
symbols are absent from `symbol.getStructure`, following the clone method in
WORKER. The expected structure tree bytes can therefore stay identical while
its ticket advances. That is a proposed effect to verify, not a completed-job
witness. Multiple same-ticket structure calls can change SQL row multiplicity,
so a stable read or upload acknowledgment is not enough.

## Compatibility with the 160000 saved-content model

Copied canvas headers have no imported `firstTicket`, `pend` or `num` fields.
They can fit the existing canvas-segments projector when all other limits hold.
The new document's complete raw history, not the source's materialized drawing
alone, must pass that projector. Restrict the first copy to no BLOB/FONT or
unknown dependency records; `Ni` has separate asset branches outside this plan.

The existing profile has one concrete mismatch. Both creation DOCHEADs can receive
the same millisecond timestamp. `onDocHead` keeps the first equal-time header,
whereas `observeSingleCanvasHeader` in `server/src/saved-symbol-projection.ts`
counts each equal latest timestamp and the current final check requires a
unique latest header. Its final ticket check also expects that winning header
to have the greatest target header ticket. Equal creation times can therefore
fail current admission despite deterministic order within their one chunk.

The new `prepareCurrentCreatedCopySavedSymbolProjection` now handles this
specific same-stream case separately. It admits exactly one new destination
chunk, canonical native EDIT_HEAD/DOCHEAD/META/DOCHEAD headers, ordered or equal
document times, and copied atom tickets at most `M`. Equal times retain the
first inner header at `M + 1`, while the global maximum stays `M + 2`; a later
second time selects the `M + 2` header. The later `getStr` outer header is
`M + 3`, and metadata remains at `M + 1`. Its raw/cache alternatives remain
distinct, with no cache provenance or execution authority claim. Existing
metadata and canvas profiles are unchanged.

Do not sleep, retry creation or append a gratuitous metadata write to force
eligibility. Cross-chunk equal-time headers remain refused. The new projection
is data-only; it is not an enabled copy writer or permission to broaden an
ordinary metadata edit.

## Ownership integration, 2026-10-17

The pure implementation slice now exists in
[`current-symbol-copy-plan.ts`](../plugins/easyeda-pro-control/server/src/current-symbol-copy-plan.ts),
[`current-symbol-copy-program.ts`](../plugins/easyeda-pro-control/server/src/current-symbol-copy-program.ts),
[`current-symbol-copy-sql.ts`](../plugins/easyeda-pro-control/server/src/current-symbol-copy-sql.ts),
and [`saved-symbol-projection.ts`](../plugins/easyeda-pro-control/server/src/saved-symbol-projection.ts).
These pure files provide a source/history plan, a fixed compiler, an exact SQL
relation and the new saved-content projection. They do not issue process
ownership. The separate copy writer, saved-source, saved-read, verification and
operation coordinators now consume the original copy baseline and native return.
The disposable public route composes those stages; ordinary metadata ownership
cannot substitute for them. Focused synthetic tests cover these handoffs and
failures, but connected execution remains unclaimed.

The implementation keeps the existing disposable navigation purpose and
adds a fixed copy baseline entrypoint. That entrypoint issues its own
original preparation and operation purpose, not manufacture a metadata patch
or cast a copy plan to a metadata owner. The shared baseline lifecycle uses a
closed, discriminated operation union so both operations retain the same
actual Windows runtime, launch, Job, authenticated session and closure logic.
Public metadata wrappers and their original-token assertions must continue to
reject copy tokens. No caller-selected verifier, issuer or cleanup callback
is needed.

| Existing module and seam | Minimum copy-specific change; machinery to retain |
| --- | --- |
| `current-disposable-open-runtime.ts`: `beginBaseline`, `transferBaseline`, `assertBaselinePurpose` | Add a fixed `beginCopyBaseline` entrypoint and separate original copy-baseline issuer. Consume the same runtime/Job reservation before the first await. Retain the existing disposable opener; do not broaden ordinary metadata navigation. |
| `current-symbol-owned-preparation.ts`: `prepareCurrentOwnedSymbolMetadata` | Add an original copy preparation using the fixed closed-target observation and source identity. The current preparation embeds a metadata patch and cannot honestly represent a copy. |
| `current-symbol-baseline-runtime.ts`: `capture`, `issueProjectOnlyGeneration`, `transferCurrentProjectOnlySymbolGeneration` | Add a copy-purpose discriminant and distinct copy-owner transfer. Share capture, close, termination, relaunch, admission and cache-excluded project opening. Existing metadata transfer must reject copy generations. Retain synchronous consumption and the failed owner's normal-close path. |
| `current-symbol-baseline-copy.ts`: `captureCurrentSymbolBaselineCopy`, private `captureSnapshot` | Separate neutral project/branch/source identity from metadata preparation. The current capture reruns `prepareCurrentSymbolMetadata` with the old patch. Add a fixed copy-plan preparation branch while retaining closed-byte capture, original SQL reader, inode/receipt checks and original termination proof. Share finish/verification snapshot collection, not metadata semantics. |
| `current-symbol-startup-runtime.ts`: `qualifyCurrentSymbolWriterStartup` | Add a distinct copy qualifier/token using the fixed startup observation. The existing qualifier asserts META-only/disposable metadata eligibility and excludes referenced source symbols. Copy must instead prove its new destination is absent; it must not claim source modification eligibility. |
| `current-aged-sql-reference.ts`: `CurrentAgedSqlReferenceStage`; `current-aged-sql-issuer.ts`: `collectCurrentAgedSqlClock` | Share the fixed date-reference collection and original generation proof. Obtain project/source and actor through the sealed operation binding, not a fabricated metadata preparation. Preserve historical versus live clock epochs and original-reader identity. |
| `current-symbol-transaction-actor.ts`: `prepareCurrentSymbolTransactionActor`; `current-symbol-transaction-clock.ts`: prepare/record/verify functions | Share fixed actor selection and Windows/renderer clock brackets. Add a distinct copy plan calling the copy SQL relation, with two document headers and an original returned UUID. Preserve one shared dispatch-owner reservation, one-shot stage transitions, original capture/launch checks and post-closure historical-token rules. Do not relax the metadata `M + 1` comparator. |
| `current-symbol-writer-runtime.ts`: `execute`, `run`, `issueContinuation`; `finishNormalClose`, `observeFinish` | Add fixed copy dispatch/acknowledgment/continuation semantics. Retain the original native UUID before post-read awaits and keep it through SQL verification. Share existing one-shot normal closure, original Job termination, complete snapshot and capture retirement. A lost reply cannot authorize another copy. |
| `current-symbol-saved-source.ts`: `prepareCurrentSavedSymbolSource` | Add a distinct source issued from the successful copy continuation and exact post-edit snapshot. Bind the destination from the retained native return and use the created-copy projection, not the existing source target or metadata projection. |
| `current-symbol-saved-read-program.ts`: request schema and compiler; `current-symbol-saved-read.ts`: `collectCurrentSavedSymbolContent` | Add a fixed copy-read variant. Existing requests require `expectedBefore.ticket === maximumTicket`; copy needs metadata `M + 1` with maximum `M + 2`. Preserve the old equality and fixed reader, actor, context, implementation and envelope guards. |
| `current-symbol-verification-runtime.ts`: `start`, `read`, `observeFinish`, `issueResult` | Reuse new-session cache-excluded reopen, original retained process capture, ordinary normal close and complete post-edit-to-final SQL equality. Add a copy continuation/generation and saved reader. Do not issue a metadata inverse or promise deletion of the new symbol. |
| `current-symbol-preopen-source.ts`: baseline and post-edit wrappers | Add copy-original wrappers around the same private exact raw-file/inode/sidecar verifier. A point-in-time rehash cannot revive the old process-closure authority. |

The table records the implemented integration boundaries. Baseline capture,
launch and closure machinery is shared; the copy writer and verifier remain
separate fixed coordinators because copy changes document membership and has
no metadata inverse. Actor/clock dispatch and saved reopen consume that original
binding. No generic mutation engine or caller-selected issuer is introduced.

Two existing assumptions need explicit protection during that refactor:

- `assertBaselinePurpose` currently accepts a disposable purpose when the
  retained purpose is merely not the ordinary metadata purpose. Introducing a
  third stored purpose without tightening this check could admit it through
  the old disposable continuation. Use exact purpose checks, retaining only
  any deliberately supported legacy absence case.
- The pre-copy startup guard checks exact cached symbol membership. Successful
  copy legitimately adds one cache entry, so the same guard cannot prove
  post-copy startup completion. The new compiler retains fixed project,
  no-editor, actor, RPC and Date checks after dispatch and explicitly returns
  `postCopyStartupQualified:false`. Completion still requires original-owner
  normal closure, exact closed SQL and the fresh saved reopen.

The compiler uses the fixed project-qualified payload
`{source: sourceUuid, renameKey: true, keepSource: false}`. Its source observation
uses the registered `/PrjDB/symbol/getStr` route; the worker's internal
`getCanvasByConsistency` is not a registered external canvas-read RPC. It
captures the returned destination synchronously before awaited post-reads and
checks its absence throughout retained decoded strings. That compiler-local
data relation still does not prove which runtime produced the reply; the new
owner must retain the original dispatch and reply.

### Conservative structure effect

The current copy SQL plan expects two serialized structure requests from the
fresh destination's metadata/canvas callbacks under the idle-startup premise.
The first updates all selected-branch structure rows to `M + 2`; the second
adds one exact same-ticket duplicate. The complete comparator checks the
resulting row multiplicities, both AUTOINCREMENT effects, all raw history and
every source/peer row, not a stable sample or acknowledgment.

For this initial contract, structure bytes must equal the exact retained
baseline tree bytes. Ordinary type-2 symbols do not appear in that native
tree. The plan deliberately reports `nativeStructureProjectionVerified:false`:
it does not reconstruct a native tree from all underlying documents. If an
already stale baseline tree is regenerated differently during the operation,
the final comparator will refuse even when the native copy itself is
legitimate. That is a conservative supported-state limit, not a reason to
weaken equality or an additional requirement to implement a full graph model
before this route. Original closure and exact complete SQL verification remain
required. A refusal authorizes neither retry, Save nor an improvised inverse.

## Implementation sequence and remaining validation

1. Add a pure `current-symbol-copy-plan.ts` and its focused tests. Derive the
   source from the complete retained raw history and SQL inventory. Bind its
   exact metadata, supported canvas bytes/order alternatives, complete peer
   records, name derivation, `M + 1`/`M + 2` capacity and newly allocated UUID
   constraints. No caller source string, raw program or adjustable verifier.
2. Add a fixed `current-symbol-copy-program.ts`. Reuse the current project-only
   context, startup, actor, clock, implementation and receiver guards. Check
   permission, source metadata/canvas and worker maximum before the sole
   project-qualified clone dispatch. Seal its original returned ID before
   awaited post-write reads. Do not reuse metadata-write result schemas, which
   assume an existing target and one ticket increment.
3. Add a separate complete SQL effect comparator. Reuse the maintained exact
   inventory readers and raw decoder, not a new permissive comparison callback.
   Model generated history row/key, complete appended plaintext, the additional
   document, project/branch bookkeeping, AUTOINCREMENT and exact structure-row
   effects. Preserve all old rows and multiplicities. The existing
   `symbol-sql-comparator.ts` hardcodes an existing target, a three-record
   metadata append and `M + 1`; changing its flags is insufficient.
4. Add a distinct original-owner copy purpose and coordinator. Reuse the
   ownership pattern in `current-symbol-baseline-runtime.ts`, startup checks,
   immutable clock plans, original launch/Job retention and original-owner
   normal-close path in `current-symbol-writer-runtime.ts`. Reuse
   `current-symbol-baseline-copy.ts` for closed copy/checkpoint/inventory
   collection, with a copy-specific issuer rather than a fabricated metadata
   writer token. Snapshot only after retained process/Job termination. Do not
   declare live queue completion from a read-only wait.
5. Extend cache-excluded verification through the pattern in
   `current-symbol-verification-runtime.ts`: fresh project-only reopen, exact
   new-symbol saved content, original-source and peer invariance, then final
   normal closure and complete SQL equality. The destination's original return
   replaces the existing-target assumption. No deletion inverse is promised;
   successful fixture creation deliberately leaves the new unused symbol.
6. Add discovery, coverage and a disposable-only entrypoint only after the
   compiler, comparator, ownership and failure cleanup work together. Cover
   lost create replies, UUID collisions, copied owner tokens, source drift,
   equal-clock headers, dependency records and delayed structure effects with
   focused regressions. Publish/install, use a fresh facade, then validate once
   on the registered disposable project. A failed attempt never authorizes a
   second copy, Save, manual inverse or a replacement-owner continuation.

Steps 1–5 and the disposable route in step 6 are implemented in this candidate.
The separate initial-preparation cleanup retains the original opening journal
and consumed reservation. It publishes failure evidence and permits only
original-owner normal closure and terminal retirement, with capture-acquisition
uncertainty preserved. Before the copy write, `copy-cleanup` permanently cancels
the ready operation without dispatching creation. These paths have focused
offline regressions and independent review, not connected validation.
Publication, installation and the subsequent connected disposable validation
need their own recorded results. Current String reads and drawn-symbol metadata
validation also retain their separate connected-validation backlog. General
library copying, chosen names/classifications, assets, geometry writers and
schematic/PCB structure completion remain outside this copy subset.
