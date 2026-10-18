# Disposable project-local symbol copy

Use this route only to create a drawn-symbol fixture in an explicitly selected
disposable project. It is a narrow native equivalent of `lib_Symbol.copy`, not
the public wrapper or ordinary library copying. Installed094000 passed one
disposable supported drawn-symbol copy: complete closed SQL, exact saved reopening,
unchanged source/peers and final closure. This historical case does not validate
later generations or other source histories; fresh admission remains mandatory.

Discover `disposable-symbol-copy` with `includeSchemas:true` through
`easyeda_control_api`. Validate each assembled inner request with
`disposable-symbol-copy-validate` and `query:{request:...}`. The live tool is
`easyeda_control_disposable_symbol_copy`, with the strict outer object
`{request:...}`. It accepts no replacement fingerprint, caller code or paths.

## Supported source

The source is an existing ordinary project-local type-2 symbol in the exact
project and branch of the retained disposable opening. Its complete raw
history and source observation must agree. The source may be referenced;
copying does not modify it or propagate a metadata edit to linked sheets.

The initial subset requires one live PART and a nonempty self-contained drawing.
Supported records are PART, CANVAS, ATTR, ELLIPSE, PIN, RECT, ARC, CIRCLE, POLY,
TEXT and BEZIER, plus exact document-level ELE_PLACEHOLDER counters for supported
numbered families. Counters retain their raw bodies and IDs; they are not drawing
members and need no part ID. Malformed, deleted or unsafe counters refuse.
External assets, BLOB/FONT/OBJ, multipart symbols, unknown
records, unsafe native object-key IDs and unsupported history refuse. Do not
delete or rewrite source records to make a refused source eligible.

Native naming is reproduced for printable ASCII titles, including every active
peer symbol/block name. Uppercase `I` is supported only when default and
Turkish/Azeri folding both give unique inventories and the same collision
decision at every candidate. Do not assume the workstation locale. Non-ASCII,
locale-dependent collisions, ambiguous folded names, non-finite numeric suffixes
and exhausted collision loops refuse. The application chooses a fresh
16-hex UUID and collision-free title. The tool does not accept a destination
UUID, chosen name, classification, metadata patch or external library. It clears
template-source linkage while retaining supported drawing bodies and IDs.

Before dispatch, the original complete SQL inventory reserves the two creation
tickets, the next serialization ticket and the saved reader's content, envelope
and generated-program capacity. Other runtime limits remain possible. Source
and peer SQL must remain unchanged; the new UUID must be absent even from
retained deleted/overwritten source strings and keys.

## Start from the original disposable opening

Read [current project opening](current-project-opening.md) and complete its
ordinary-launch/disposable-opening workflow. Use the already registered
disposable file and checkpoint-member PCB. Do not open a production project,
create another runtime owner or restart the facade during this lifecycle.

On the copy tool, submit `baseline-begin` with a new `operationId`, the actual
`openingOperationId`, and `source:{projectUuid,branchUuid,symbolUuid}`. Supply
the schema's disposable-project, normal-close and unknown-file-effects
acknowledgements. This seals the source from the opening's managed checkpoint
and transfers its original ownership; it is not a metadata preparation request.

Then follow these copy-tool baseline actions in order:

1. `baseline-observe-termination`: await the original process and Job exit and
   complete the closed baseline capture. Repeat only a pending observation.
   Before relaunch, also call the ordinary launcher's `observe-termination`
   using the original launch ID. Require `terminated` and its matching launch
   digest while that Job is still selected. Do not request another close.
2. `baseline-prepare-clock`: qualify the original unlocked-history date using
   the fixed scratch helper, with its explicit effect acknowledgement.
3. `baseline-relaunch`, then `baseline-admit`: retain and authenticate the
   replacement process. Pending authentication may be observed again; launch
   may not be repeated.
4. `baseline-observe-caches`: exclude both inactive persistent upload queues.
5. `baseline-open-project`: open the exact project without editor tabs. The
   optional schematic-startup-effects acknowledgement permits observation only;
   it does not waive the copy writer's later startup qualification.
6. `baseline-observe-clock`: collect the original replacement's clock evidence.
7. `copy-begin`: retain the ready copy generation, with `acceptSymbolCopy:true`
   and `confirmDisposableProject:true`. This does not yet create the symbol.

Unlike the metadata workflow's optional clock stage, this public copy route
requires both clock preparation and observation. Inspect `baseline-inspect`
after a lost reply. Before `copy-begin`, the retained baseline's
`baseline-finish-close` and `baseline-observe-finish` provide normal cleanup;
do not use an older launch receipt after ownership transfer.

If `baseline-begin` itself fails, inspect the same operation ID. Its
`copy-opening-stopped` result offers only `baseline-finish-close` and
`baseline-observe-finish` on the original owner. Close at most once, then observe
termination. These actions retire the attempt without proving file invariance
or granting another baseline attempt. Failed capture acquisition can remain
uncertain even after the process exits; do not describe it as a released capture.

Before the one-shot `copy-write`, allow the retained unlocked SQL head to be at
least 61 seconds old under the native clock relation. Clock preparation alone
does not satisfy this age check; the writer checks it against its actual backend
window. Waiting does not repair changed history, copied clocks or failed
attempts. An age refusal consumes that copy attempt; do not retry it.

## Advance exactly the returned phase

Call `copy-advance` with `step.expectedPhase` equal to the returned `nextPhase`,
and only that phase's required acknowledgements. The successful sequence is:

`copy-write` → `copy-close` → `copy-observe-termination` →
`verification-start` → `verification-admit` → `verification-caches` →
`verification-open` → `verification-read` → `verification-close` →
`verification-finish` → `completed`.

`copy-write` requires explicit write/copy/disposable acknowledgements. Close
phases require normal-close and unknown-file-effects acceptance; verification
start/open require normal-opening-effects acceptance. Discover the current
schemas rather than copying acknowledgement fields between phases.

The compiler dispatches one project-qualified native clone and retains its
returned UUID before post-read awaits. Never rediscover a result by title or
retry a copy after timeout. A matching immediate result is not persistence
proof. The writer closes the original process normally and verifies the exact
appended history, complete SQL rows and structure-row multiplicities. It then
reopens under a fresh original owner, excludes upload replay, verifies exact
destination content, closes again and proves complete SQL equality with the
post-copy snapshot.

Completion means `copyVerified:true` and `nextPhase:"completed"`. The new
unused symbol deliberately remains in the disposable project. There is no
delete/inverse, explicit Save, prompt answer or restoration in this route.
Raw and document-cache saved-header alternatives are checked separately;
matching one does not prove which cache branch ran.

## Failure and limits

To cancel after `copy-begin` but before `copy-write`, use `copy-cleanup` with
`confirmAbort:true`. This permanently selects `cleanup-close` without creating
a symbol. Continue with `copy-advance` using the returned cleanup phase.

Use `copy-inspect` after an error or lost response. Only repeat explicitly
pending termination/authentication observations. A repeated earlier phase
cannot advance into the next mutation. If offered, use `cleanup-close` followed
by `cleanup-observe-termination` on this same tool and original facade. Leave a
Save/Discard prompt unanswered. A stopped cleanup or missing original owner
requires review, not another ID, direct RPC or UI workaround.

After a facade restart, inspection can report historical journal evidence but
cannot restore process handles, create a continuation or claim a verified copy.
Do not use copied JSON as ownership.

The structure comparator conservatively preserves baseline tree bytes while
checking the exact two structure-post effects. It does not reconstruct the
entire native tree. A stale baseline tree regenerated by EasyEDA can therefore
cause a post-copy refusal even when the new drawing itself is correct. Retain
that evidence and close through the offered cleanup; do not weaken equality,
repeat creation or issue an improvised inverse. Ordinary symbol copying,
arbitrary naming, classifications, assets and geometry edits remain unsupported.
