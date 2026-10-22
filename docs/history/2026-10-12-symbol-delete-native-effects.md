# Native symbol deletion effects, 2026-10-12

## Status and scope

`eda.lib_Symbol.delete` remains unavailable through the typed executor. This
review identifies unfinished lifecycle engineering, not a permanent inability
to delete symbols. No executable planner, adapter, runtime change or live
validation is supplied by this document.

The candidate first scope is one closed, dependency-free, ordinary project
symbol in a disposable local project. Personal/cloud libraries, block symbols,
open symbol editors, dependent devices and placed instances need separate
contracts. A successful native delete acknowledgment would not establish that
its subscribers, preview request and delayed structure write have completed.

This is source-only research. It used installed application sources, not
project/profile database contents. No CAD action or Save was performed.

## Pinned primary sources

File names are relative to the installed EasyEDA Pro `resources/app/` directory.
Every source location below uses a key from this table and a zero-based UTF-16
JavaScript string offset. These are not byte offsets or line numbers. INI is
the corresponding installed editor-version manifest. Hashes identify the
reviewed bytes; a different installed build requires another review.

| Key | File | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| APP | `app.js` | 2655696 | `10a427460d498667f6d1df9cd8899a1740afd9644cbf83ecaf80365d590869bb` |
| UI | `assets/pro-ui/3.2.149.43637efe/js/ui.js` | 17265809 | `12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a` |
| MGR | `assets/pro-mgr/3.2.148.154949d9/js/pro-mgr.js` | 2184762 | `23089ec50bf701191c52af4a214b0d19b14e3233ead1bb5ccd50cf443e9e8742` |
| WORKER | `assets/pro-mgr/3.2.148.154949d9/js/project-worker.js` | 2164464 | `2792c6c87e3c60e09c43f03494a9cbb24e4ebe9c385372bbaf877ed75083a949` |
| SCHMAIN | `assets/pro-sch/3.2.149.35ae2987/js/sch-main.js` | 6248296 | `0ed765f9fbc6482a0d8c209a73316aee1e4605c3faa5dd6c434dbfe96019a88d` |
| SCH | `assets/pro-sch/3.2.149.35ae2987/js/sch.js` | 6431214 | `3f50136fb4ba2d5593beac7ef3e20ebe5275177b56bbcfdd297e79f176a6618f` |
| PCBMAIN | `assets/pro-pcb/3.2.149.5378b690/js/pcb-main.js` | 2219439 | `392995aeffcd72311a96f918c1ff68f7e10a087511fd75c9b823008b0ffa3530` |
| INI | `assets/pro-versions/3.2.149.88089769/editor.ini` | 8029 | `28efa4e608c932e359c49e96d297e160ccb102d6c91874383cddd03102eab319` |

## Delete acknowledgment and subscriber work

WORKER 1928158 `deleteData` verifies the target, creates its deletion string,
awaits `uploadLocal`, and returns success. `uploadLocal` at 2020854 parses the
records and schedules persistence. That return does not await every consequence
of the resulting native events.

The symbol-delete subscriber at SCHMAIN 6166532, also present at SCH 6160131,
clears a matching schematic block-symbol reference, starts the preview RPC
without awaiting it, publishes forced `closeTopTab`, and removes the target
component-cache entry. This work remains relevant for a closed symbol. A future
adapter must prove that dependency-related branches cannot run, and observe
the allowed subscriber effects without replacing or suppressing the callbacks.

Source searches found no corresponding `SYMBOL.ON_DELETE` callback in UI or
PCBMAIN. This is not runtime subscriber attestation. The operation must bind
the actual loaded scripts, native callback registry, frames and exact target;
an unknown listener or hidden target editor cannot be ignored.

## Thumbnail POST reaches the wrong local controller

The pinned local request chain is:

1. UI 11880377 `OHi` obtains the current version and awaits
   `/pro-mg/thumb/delete` for the target/project/branch. MGR 2179891 registers
   the service. Its `ur.delete` implementation at 1853310 reports per-item
   successes and failures inside an outer successful response.
2. MGR 1844020 `deleteThumbs` sends POST to the project/branch/thumb URL with
   an undefined payload, `contentType:false`, and the exact project path header.
   The endpoint enum is at 749591. MGR 1782115, 2020343 and 738474 preserve the
   POST method through the request wrapper, URL substitution and XHR creation.
3. APP 2618498 `mB` registers GET for an image, GET for the list, POST with an
   empty pattern for update, and DELETE for `/:uuid`. The method matcher at
   APP 1370215 treats the empty pattern as no further path restriction.
   Therefore POST with the remaining thumb UUID matches update, not delete.
4. The update-controller body at APP 2612250 reads `requestParams.image`.
   The missing image causes an error before file reading or image-service
   mutation. The separate delete service at APP 2610767 is not reached.
5. APP 2581294 returns the controller error as a JSON failure at HTTP 200.
   The MGR batch records a failed item but keeps outer `success:true`.
   UI 11880377 checks only that outer flag.

Thus this installed local route does not successfully delete the thumbnail.
Its image-controller action is a failed no-op. A null preview is not required
to explain that result, and an outer successful response must not be reported
as successful preview deletion. A future operation still needs exact preview
inventory invariance and completion evidence for this child request.

This conclusion is restricted to the local `https://client` route. APP 2620752
installs the host-gated middleware chain; the protocol handler at 2629800
through 2631640 preserves method/body. APP 2568169 lists special remote-proxy
routes. An ordinary local project/branch/thumb path is not one of them. Cloud,
private-server and system-library requests are outside this conclusion.

The whole request is not universally side-effect-free. License middleware
at APP 2566574 and 2567445 can create a missing licensed user in the profile.
Database initialization at APP 1315142/1315392 can migrate a cold database and
change journal mode. A first supported contract must bind an already initialized
local profile and exact project-path resolution at APP 1325122, or separately
model these setup effects. The missing-image refusal does not prove their
absence.

## Deletion schedules a durable structure write

WORKER 2092275 defines `uploadStructure`. It admits ordinary SYMBOL changes
with either META or DELETE_DOC when the project is ready, writable and not
syncing. The consistency change callback calls it at 2095198 without awaiting
the returned promise.

The structure function at WORKER 2092494 uses the serializing `Id` wrapper
around a 300 ms `WA` debounce. The timer callback adds a promise to `task2` only
when it starts, at 2092598. It computes the complete board, schematic, sheet,
PCB, panel, block-symbol and owner structure, reads global maxTicket, then
awaits `project.setProfile`.

WORKER 1932208 `symbol.getStructure` includes only non-deleted block symbols.
Deleting an ordinary symbol therefore need not remove a structure item. It
still schedules the profile write and advances the stored structure ticket.
Unchanged tree bytes cannot be assumed; the exact native serialization must
be derived and checked against the pre-dispatch row.

WORKER 1762369 POSTs the ticket and serialized structure to the endpoint at
1437851. APP 2618434 routes that POST to the structure controller at 2609499.
The storage service at APP 2608636 reads an existing branch row, then chooses:

| Existing branch row | Native storage action |
| --- | --- |
| Present, with lower ticket | APP 2609198 updates ticket and structure for every row matching the branch. |
| Absent, or ticket not lower | APP 2608982 inserts another row. |

The lookup is APP 2608814; the `project_structures` model and schema are APP
2585798 and 1252027. Equal-ticket requests can therefore insert duplicate rows.
Repeating a structure call is not an idempotent way to wait for the first one.

The proposed initial effect contract must require one existing structure row
for the exact branch, with a ticket below the predicted new ticket. It must
derive the new ticket and full structure text, retain row/project/branch
identity, and preserve other rows. Native history changes require their own
complete proof. Missing or duplicate structure rows need a separate contract.

October13 correction: the symbol-metadata comparator now admits a nonempty
set of existing branch rows when every row has the intended project, a ticket
below the expected new ticket, and identical structure bytes. It models the
native branch-wide update while preserving row identities, multiplicity and
all non-ticket cells. Divergent trees, missing rows and partial updates refuse.
This is an exact effect-model extension, not live completion or writer enablement.

## The task1, task2 and timer gap

WORKER 2117630 `awaitUploadEnd` waits only for `task1`. The worker RPC at
2143848 simply awaits that method. The maintained project-upload barrier uses
this RPC; it is not a structure-timer or task2 drain.

There are two additional sources of pending work. `WA` at WORKER 2002413 keeps
the debounce timer in a closure. `Id` at 1839030 retains a running promise and
a queued invocation. Before the timer starts, task2 can be empty even though a
structure write is pending. After one write becomes visible, another queued
invocation can remain.

Other inspected native methods do not close this gap:

- `close` at WORKER 2106551 waits task1 and the task2 entries then present, not
  a timer that has not yet added its task2 promise.
- `getHistoricalNodes` at WORKER 2117722 also waits task2/task3 but changes
  history mode, save state and cached ticket. It is not a read-only wait and
  still snapshots current task membership.
- The fixed profile GET exists at MGR 671412, 2083351 and 1843468. Its result
  proves the returned persisted ticket/tree, not the absence of another job.
- Calling `structure()` again can queue another POST, including the duplicate
  equal-ticket insertion described above. It must not be used as a flush.

The inspected public worker RPC registrations at WORKER 2142778 through
2145550 expose no structure-timer/task2 ownership or drain getter. This review
did not identify an existing suitable completion primitive. A fixed delay,
stable counter, repeated stable profile reads or an empty current task2 set
cannot replace operation-owned completion evidence.

## Bounded UI and cache effects

Forced close at UI 16298882 emits CLOSE_TAB even for an absent target. The six
native UI listener sites are 12213188, 16079381, 16600535, 16829765, 16890104
and 16938978. Conditional footprint, assembly-variant, PCB-cache and 3D work can
be excluded by exact target absence in raw tab maps and frames. Public tab
enumeration alone is insufficient.

Cursor clearing at UI 16604288 publishes `updateSortByNetLength`. Its subscriber
at 16752458 sorts local React tree children through 16780059/16780562 and
rerenders. That path does not write PCB source or preferences. Layer-cache
clearing at 16883238 uses the plain in-memory setter at 16831485. Suspension
container removal and session tab-cache cleanup at 16245647 also need explicit
preconditions or modeled effects. None should be silently called a no-op.

SCHMAIN 5861680 onward deletes cached templates and symbol results. The
proposed subset must exclude a live target template and pending fetch, or model
their disposal separately. A resolved metadata cache entry may legitimately
exist because symbol-add/update subscribers at SCHMAIN 6165544/6165993 populate
it. Its exact removal is bounded collateral, not evidence of a design edit.

DOCHEAD processing at WORKER 2107137/1848417 can publish SYMBOL.ON_UPDATETIME
through 1848193. The project change callback at 2095226 also schedules a global
ticket event after 20 ms. Native callbacks at PCBMAIN 542461/2166316 and UI
5931767/9153794 set consistency maxTicket. These runtime counters must be
distinguished from peer document bodies and independently bound to the owner.

## Concrete completion work

The next implementation step is a disposable experiment with a fully saved,
already-native project and a newly constructed worker. It must establish all
of the following before enabling deletion:

1. Bind the exact worker, project, branch, source tuple, target and producer
   counters. Fixed client/maxTicket getters exist at WORKER 2128356/2115968,
   reached by project-bound MGR handlers at 2045917/2045385. Do not infer the
   producer from a mutable post-operation header.
2. Prove no prior structure invocation is pending and account for each invocation
   generated by the deletion. WORKER `open` at 2096720 starts `syncCloud`
   without awaiting it, so a fresh worker alone is not a quiescence proof.
3. Await a fixed native primitive or passively observe completion tied to that
   exact job/worker/request. Do not suppress callbacks, clear timers, replace
   native handlers or manufacture another structure write.
4. Verify the exact branch-row update, raw history effect, all peer documents,
   previews, subscriber effects and absence of delayed duplicate writes. Then
   verify complete persistence across project reopen. Do not add an unnecessary
   Save or grant another delete attempt through that lifecycle.
5. Test delayed timers, pre-existing queued jobs, duplicate structure rows,
   thumbnail failure, lost replies, owner drift and restart reconciliation.
   An ambiguous delete is not permission to retry it or apply an automatic
   inverse.

Current META-only state and a blank origin field do not prove that the target
was created by the agent or never had a tombstone. If creation provenance is
part of admission, verify the original creation journal and full raw chain.
Otherwise describe the narrower condition as metadata-only local membership.

Existing symbol create at WORKER 1926024 and metadata update at 1929097 use the
same upload path and can reach the META-triggered structure scheduler. Their
lifecycle proofs warrant a separate scoped review. This observation establishes
shared source behavior, not damage or failed validation in an earlier project.

The remaining omission is the unimplemented operation-owned subscriber and
structure lifecycle proof. The exact effects are substantially better defined;
the completion requirement remains open. This document neither enables a route
nor labels the method fundamentally infeasible.

## Existing metadata writers

Follow-up review found the same gap in eight already implemented routes, not
only prospective symbol deletion. The native scheduler at WORKER2092275 admits
BOARD, PCB, SCH, SCH_PAGE, SYMBOL and PANEL. Its consistency callback at2095198
passes META/DELETE_DOC changes, and can also pass an event whose third flag is
false. FOOTPRINT and DEVICE are outside that type gate.

| Typed operations | Native worker source in the pinned WORKER file |
| --- | --- |
| Symbol create / metadata modify | `create`1926024 and `updateData`1929097, through `uploadLocal` |
| Page create / rename | `buildString`1913065, `addData`1913953, `updateData`1915769 |
| PCB create / rename | `buildString`1895180, `addData`1895824, `updateData`1897324 |
| Schematic create / rename | `buildString`1904933, `addData`1905576, `updateData`1906965 |

These paths emit META for a type inside the scheduler gate. The maintained
[library executor](../../plugins/easyeda-pro-control/server/src/library-execution.ts)
waited task1, captured a new final checkpoint and called a document-history
effect verifier. It then checked that the current database still equaled that
new checkpoint. This catches writes during that final stability window. It does
not check the intended `project_structures` delta already inside the checkpoint
or prove that a later scheduled write cannot occur.

[NativeHistorySnapshot](../../plugins/easyeda-pro-control/server/src/native-history.ts)
contains decoded selected-branch documents and identity/history commitments,
not structure-table rows. The symbol, page and container effect verifiers
consume that snapshot. Their peer-record and raw-history checks remain useful,
but are not a complete SQL-effect or scheduler-completion contract.

Candidate030626 therefore adds a separate execution-lifecycle refusal for these
eight routes and protects nonterminal reconciliation from the same false
completion. Strict schemas, pure verifiers and historical terminal evidence
remain readable. The original observations are not rewritten or promoted into
stronger evidence, and no historical damage is inferred. Re-enablement requires
the exact SQL/job-completion proof described above, not merely removing the gate.

## Follow-up: ordinary geometry Save also reaches this scheduler

The eight metadata routes are not exhaustive. Further source tracing identifies
the scheduler's third argument as the record's pending flag. Save of pending
PCB, schematic-page or project-symbol geometry can clear that flag and schedule
the same structure write for non-META records. See
[project structure completion after Save](2026-10-12-project-structure-save-completion.md)
for exact source offsets, document-type boundaries, completion candidates and
the full SQL-effect plan. This extends the engineering scope; it does not infer
damage from earlier transactions or strengthen their historical evidence.
