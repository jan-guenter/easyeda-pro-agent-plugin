# Disposable footprint copy preparation

Use this route to qualify the original project-worker footprint source, actor,
creation methods and UI routing before implementing a copy. It does not create
or delete a footprint, Save, or validate a saved copy.

Query `easyeda_control_api` with `action:"footprint-copy-preparation"` and
`query:{includeSchemas:true}`. Validate each assembled request with
`action:"footprint-copy-preparation-validate"` before using
`easyeda_control_pcb209_worker_startup` with the wrapper
`{action:"footprint-copy-preparation",request:{...}}`.

The operation ID starts with `footprint-preparation-`. Select this purpose when
launching. A default startup, empty-baseline or ratline owner cannot become a
footprint preparation owner. Existing-profile launch and opening can restore
tabs, use the network and automatically persist data. Use an explicitly
identified disposable project.

Follow the returned phase and retain the same Codex session:

1. Launch, inspect the browser and frames, and qualify the UI source as described
   in [worker startup](current-pcb209-worker-startup.md).
2. `capture-project` opens the exact checkpoint-bound project once. Do not
   repeat navigation after a missing or failed response.
3. Observe current assignments, then the actor-clock bracket and footprint
   manager state. `observe-footprint-source` selects one footprint UUID from
   the original completed SQL checkpoint.
4. `prepare-footprint-copy` binds the source, complete checkpoint and native
   argument model. `prepare-footprint-bindings` then retains the direct native
   creation methods, lexical producers and actor/SQL relationship.
5. `observe-footprint-ui` observes the original UI notification wrapper,
   responder, initialized registry and bus. It checks registry membership
   without invoking a lazy getter or creating a bus. A matching project ID and
   worker identity bracket do not prove that the UI bus targets that worker.
6. `prepare-footprint-dependencies` qualifies 53 helper, serializer, parser,
   cache, upload and notification functions. It retains the initialized bus
   without invoking those functions or initializing a lazy bus. This does not
   prove subscriber completion or that an upload queue has drained.
7. `observe-footprint-manager-route` follows the original UI subscription
   through the initialized manager registry to the project and worker bus.
   It fetches and qualifies the original callback's complete manager script
   before following its lexical scope. It reads the original browser-native
   BroadcastChannel name accessor under `throwOnSideEffect`, rejects instance
   overrides and rechecks the retained getter and expected channel name. This
   invokes no vendor getter or RPC. The reciprocal worker/channel peer and
   backend dynamic dispatch remain unproved.
8. Inspect retained evidence after any refusal. Close normally, observe both
   original root and Job termination, release the helper, then inspect the final state. Call `settle-records` only
   if that fresh inspection still reports `publicationSettlementAvailable:true`.
   A successfully released owner normally needs no further settlement.
   These are separate steps; a close acknowledgment is not termination.

Each observation is consumed once. The operation has a cumulative request,
byte, event and time budget. Consult the catalog for current counts; optional
observations consume the same allowance. Cleanup has a separate request and
time reserve. The public lifecycle closes the original process and proves root
and Job termination; this also ends the temporary UI/manager object groups.
Explicit remote group release is internal only and is not a public action.
No stage resets the counters or adopts a historical receipt as
an owner.

The source reader uses existing native consistency entries and cache chunks.
A missing cache entry refuses without fetching, replaying a parser or warming
the cache. Keep raw source ordering and the independent checkpoint comparison
separate. The manager's own undefined user is also distinct from the backend
actor selected from SQL.

The private clock collector captures the two results used by the actual native
`buildString` and `canvasString` continuations. Its synthetic tests do not
validate embedded-V8 breakpoint locations, server provenance or a writer.
Preliminary clock calls cannot replace those results. Native create allocates
state before its first clock continuation, so a later failure may already have
changed the design.

Copy execution still needs complete destination and backend actor/clock
bindings, a complete native transport and finite budget, durable one-shot dispatch,
and complete effect verification. The private execution coordinator follows
the symbol-copy pattern with zero explicit Save attempts: original-generation
closure, complete closed SQL comparison, upload-cache replay exclusion and a
distinct saved verification generation. Its complete native writer is not mounted.
Generation closure does not prove callback completion or undo external effects;
those effect branches must be qualified before dispatch. Neither preparation
nor a returned UUID supplies the missing proofs.

## Original Worker and callback route preparation

Use this separate purpose to validate the newer original-parent and callback
integration. Query `footprint-copy-route-preparation`, validate the exact request
with `footprint-copy-route-preparation-validate`, then send it through
`easyeda_control_pcb209_worker_startup` with the wrapper action
`footprint-copy-route-preparation`. Start a new `footprint-route-*` operation.
An existing startup or source-preparation owner cannot be converted.

Follow the discovered launch, browser, frame and pinned UI-source stages, then
capture the checkpoint-bound disposable project once. This purpose holds the
original parent around Worker creation and qualifies the child bootstrap before
installing a one-use diagnostic message observer. The child consumes that exact
message before business handlers receive it. Only the original matching proof
permits the parent to resume. The eleven constructor pauses retain parser and
upload callback relationships. These debugger pauses affect application timing.

After capture, current assignments and actor observation, `observe-footprint-route` runs the fixed
original-owner route observation and publishes its result or retained failure.
Use the offline schema for the exact stages and required acknowledgments. It
does not accept caller programs, budgets, clock samples or reconstructed owner
objects. Do not repeat a stage after an uncertain response.

The observation qualifies selected notification methods, original API objects,
relative history routes and empty queues at the observed point. Native HTTP
backend ownership, cache namespace provenance and callback completion remain
separate requirements. A Windows clock sample does not prove the backend actor
or replace the two clock results used by native document creation. This purpose
does not arm transaction-clock breakpoints or dispatch copy, delete or Save.

Retain the same owner through normal close, observed original root and Job
termination, helper release and any reported publication settlement. A failed
Worker identity challenge leaves uncertain children held until generation
closure; do not resume or adopt them to continue preparation. Launch/open still
uses the existing profile and can use the network or automatically persist.
