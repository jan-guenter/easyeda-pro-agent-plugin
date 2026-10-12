# Project structure completion after Save

## Current implementation status

The affected execution routes remain blocked. Internal source now includes
retained whole-session captures, stable closed-file copies, a bounded complete
SQL reader, an ordinary-symbol SQL comparator, startup/worker observations,
an actor-bound symbol compiler, a cross-generation storage marker, a durable
phase recorder and same-journal navigation. Full local verification passes
5,840 facade tests with one platform skip and 424 bridge tests. Strict types,
type-aware lint and reproducible-build checks pass.
None of those modules alone grants execution or proves a completed transaction.

The marker passed an isolated two-process test in a copied custom Electron
runtime. That test used a synthetic app and dedicated storage, not the real
EasyEDA application or profile. It proves the tested marker behavior, not native
project persistence or an OS storage-path identity.

The complete coordinator, native clock qualification, durable phase integration
and disposable native transaction still need implementation or validation.
The source analysis and alternatives below explain the original containment
decision; references to proposed infrastructure describe that earlier stage.

## Finding and scope

The delayed `project_structures` write affects more than the eight reviewed
metadata operations. Saving pending PCB, schematic-page or project-symbol
geometry can schedule the same write, including for non-META records. The
existing upload wait does not prove that write has finished.

This is source-only research, not evidence of damage in an earlier project.
Historical saved/reopened and exact-case proofs retain their recorded scope.
No design, profile database, UI or connected runtime was accessed for this
review. The proposed observer below is not implemented or live-validated.

## Pinned primary sources

The complete filenames, sizes and SHA-256 hashes are in the
[native source table](symbol-delete-native-effects-2026-10-12.md#pinned-primary-sources).
This review rechecked APP, UI, MGR, WORKER, SCHMAIN and PCBMAIN against those
pins. WORKER is `project-worker.js`, SHA-256
`2792c6c87e3c60e09c43f03494a9cbb24e4ebe9c385372bbaf877ed75083a949`;
SCHMAIN is `sch-main.js`, SHA-256
`0ed765f9fbc6482a0d8c209a73316aee1e4605c3faa5dd6c434dbfe96019a88d`.
All source offsets below are zero-based UTF-16 string offsets, not byte offsets.
A different installed source tuple needs a new review.

## Why ordinary geometry Save reaches the scheduler

WORKER2092275 admits BOARD, PCB, SCH, SCH_PAGE, SYMBOL and PANEL when ready,
writable and not syncing. Its final condition is
`!(i&&r!=we.META&&r!==we.DELETE_DOC)`. The consistency callback at2095198
passes its eighth argument as `i`. That argument is the record's pending flag.
Thus a pending non-META change is filtered, but a non-pending one can pass.

WORKER `Na.remoteChange` at292589 propagates pending status to the callback;
the last-node publication is at295028. `Na.compress` at283254 separately binds
`uniqueId` and `notChangePend`. Its unique-owner branch at287023 clears the
pending flag unless instructed otherwise, updates document-ticket bookkeeping
and publishes the last node with argument eight undefined. The `isPend` branch
at287416 does the same. Neither branch is restricted to META.

WORKER `saveCanvas` at2128430 passes uniqueId, document IDs, client, time,
version, user and head ticket to `asyncCompressFull`. It does not request
`notChangePend`. It then awaits `uploadLocal` with reparsing disabled. The fixed
project-save RPC at2143026 calls this method.

The compiler project-save topic is `/mgr/projectWorker/setCanvas`, defined at
MGR638060, PCBMAIN532332/2156180 and SCHMAIN765614. Compiler Save methods at
MGR652925, PCBMAIN547197/2171148 and SCHMAIN780911 send uniqueId and client to
that topic. Waiting an editor's pending-message promise first does not remove
the later structure job.

The project-symbol path is also explicit. The maintained
[symbol Save adapter](../plugins/easyeda-pro-control/server/src/symbol-lifecycle.ts)
calls its bound document's consistency-manager Save. SCHMAIN4521166 selects
`x9` for a symbol; its declaration at4483168 extends `Yne`, and its Save wrapper
at4483716 awaits the parent implementation. `Yne` at808744 supplies SYMBOL as
the document type. `jne` at803483 delegates Save at804252 to the base compiler
at780911, reaching the same worker.

| Route | Scope of this scheduler finding |
| --- | --- |
| Eight symbol/page/PCB/schematic metadata create or rename operations | Their META writes reach the scheduler directly. |
| Typed geometry lifecycle for document types1,2,3 | Save can publish non-pending SCH_PAGE, SYMBOL or PCB records and schedule structure persistence. |
| Type4 footprint geometry lifecycle | FOOTPRINT and its BLOB/FONT companions are outside this scheduler's type set. This finding alone does not justify disabling them. |
| Fixed DEVICE create/association/model-transform adapters | They call device create/update RPCs without Save; DEVICE itself is outside the type set. No inherited geometry-saving callback was established in this pass. |

The DEVICE row is a bounded finding, not a guarantee that every native device
subscriber is harmless. Separate component, subscriber and persistence guards
remain necessary.

## The public Save methods do not select an exact target uniformly

UI17235685 maps schematic SDK Save to `tl` at15077850. Its default call collects
`sp().unsaveFileTabId`, reorders those tabs and runs `Gm.todo()` for each. The
optional `onlySaveDocument` condition filters document families, not one UUID.
The public schematic Save call therefore does not itself prove target-only Save.

UI17247640 maps PCB SDK Save to `bb.save`. That method at17142689 ignores its
argument and sends the fixed `save` RPC an empty string. The handler at17022913
selects `fe.getActiveTab()` for that input and constructs `Gm` with that tab.
Passing a UUID to the SDK wrapper does not bind the eventual native Save target.

These are source-level scope findings, not evidence that an earlier operation
saved a peer. Existing guards can restrict the available and dirty tabs. A
future Save adapter must prove its exact receiver across awaits and test another
dirty tab explicitly, or prove an admission that excludes every other Save
target. The scheduler and complete SQL proof remain separate requirements.

## What the existing persistence proof misses

The maintained
[design coordinator](../plugins/easyeda-pro-control/server/src/design-execution.ts)
uses the project-upload wait after Save, captures a checkpoint and verifies
selected-branch document history. The symbol before-close path uses the same
wait and document comparison. Those snapshots do not inventory
`project_structures`.

A full checkpoint hash proves the captured database's identity. Comparing the
current database to that new checkpoint can detect an intervening write. It
does not establish that a structure change already inside the checkpoint was
the intended change, or that another delayed write cannot follow. Closing and
reopening one editor does not terminate the shared project worker.

Containment therefore needs to cover affected typed-design execution and
potentially dispatched recovery, not merely the eight metadata methods.
Existing terminal records and pure evidence helpers remain historical evidence;
they must not acquire new execution authority from this source review.

## No reviewed fixed RPC drains the two queues

WORKER1839030 `Id` holds a current promise, a queued invocation and the latest
arguments. Both `uploadStructure` and `structure` use it. The latter wraps
`WA` at2002413, whose300ms timer creates its task2 entry only after firing.
An empty task2 set can therefore coexist with a pending write, and a visible
first write can coexist with another queued invocation.

The public worker registrations at2142778-2145550 expose no ownership getter
or non-mutating drain for these promises. Inspected alternatives do not suffice:

- `awaitUploadEnd` at2117630 waits only task1.
- `close` at2106551 waits task1 and the task2 entries then present, not the
  unstarted timer; it also changes project lifecycle state.
- `getHistoricalNodes` at2117722 changes history/save state and waits current
  task2/task3 membership, not the timer.
- Client/max-ticket getters at2128356/2115968 and the profile GET atMGR1843468
  report producer or persisted state, not pending-job ownership.
- Batch-upload controls at2020084/2020125 change upload scheduling without
  draining the structure queue. Calling `structure()` schedules another write.

Passing an excluded document type to `uploadStructure` is not an empty queue
barrier: `Id` replaces its latest argument slot and can suppress a queued real
invocation. Do not use it. Sleeping or repeating stable reads is not a drain.

Fresh-worker admission also needs work. `open` at2096720 starts `syncCloud`
without awaiting it. `syncCloud` at2021494 owns a task3 entry, and
`checkProject` at2113820 can schedule subsequent syncs while not established.
Do not cancel these native callbacks to manufacture a quiet state.

## Concrete completion experiment

WORKER2160282 exposes the exact worker instance as `self.PROJECT`. Its two
serializer functions close over current and queued Promise objects. Capturing
and awaiting those existing promises could observe the timer and callback
without invoking another structure write. Ordinary JavaScript cannot read
these lexical bindings, and no reviewed fixed RPC returns them.

A possible next experiment is a narrowly constrained debugger observer. The
official protocol describes internal properties, closure scopes and awaiting a
Promise by object ID, but does not guarantee that this Electron/V8 build exposes
the required optimized bindings. This is a hypothesis, not an implemented
adapter. [CDP JavaScript protocol](https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/js_protocol.json)

Required work includes authenticated process/worker transport admission, exact
script/receiver binding, unavailable-scope refusal, atomic queue observation,
and accounting for every producer during the operation. Debugger pauses change
timing and need guaranteed resume ownership. A completed captured promise alone
does not exclude a newly queued job. No caller-supplied code, callback override,
timer cancellation or queue-argument substitution is part of this proposal.

If that experiment fails, a supported vendor hook exposing existing job
ownership is another route. The absence of a current fixed primitive is
unfinished engineering, not proof of permanent infeasibility.

## Alternative: a transaction that owns the whole app session

A dedicated contained session provides another possible completion boundary.
After one acknowledged disposable edit, request normal app close once, then
prove the retained Windows Job empty and every captured process handle exited.
The old worker cannot run another timer after that proof. Compare the complete
closed-file SQL state independently: termination does not prove that pending
writes succeeded. A second contained generation can verify the saved result,
close normally and provide another complete closed-file proof. This route does
not require a debugger or producer lock, and is not implemented yet.

The existing native helper's `prove-terminated` checks retained handles and the
whole Job. Its current TypeScript caller is deliberately bound to replacement
session recovery. A new closed-session receipt must reuse those native checks
without weakening recovery or inventing a replacement session. Normal-close
dispatch alone is insufficient. No force termination, repeated close, Save
replay or prompt response is part of this proposed mode.

Pinned UI12500438 checks dirty tabs and upload counters during beforeunload.
APP2623182 eventually calls app.exit after window closure; neither establishes
a structure drain. Shared-profile effects also need their own scope. In
particular, WORKER2015079 starts detached CacheStorage cleanup after upload,
and startup2012710 can reload residual upload entries. Same-profile reuse needs
proof that the bound project's durable upload queue is empty. Process exit or
one successful reopen alone cannot establish that. Do not delete cache entries
to manufacture completion.

The first proposed operation is closed ordinary-symbol metadata rename. Its
PART type2 is excluded by the block-symbol structure serializer atWORKER1932208,
so the exact native tree bytes should remain unchanged. `newTicket`1847741 and
symbol `updateString`1928672 supply an independently bound next ticket. This
narrow target avoids modeling changed PCB/page tree ordering before a complete
SQL reader, close proof and persistent-queue check exist.

## Complete SQL effect contract

Completion and SQL-effect proof are separate requirements. APP1252027 defines
`project_structures` with an AUTOINCREMENT ID. APP2608636 chooses UPDATE only
when the existing branch row's ticket is lower. Otherwise it inserts a row;
an equal-ticket duplicate can finish successfully.

A first narrow contract should require one existing bound-branch row and a
lower stored ticket. Derive the exact new ticket and native serialized tree,
preserve row/project/branch identity, and reject every extra row. Preserve peer
branches and the structure table's `sqlite_sequence` entry. The tree includes
boards, schematics, sheets, PCBs, panels, block symbols and owner.

Add a complete logical SQL inventory over immutable hash-bound checkpoints.
Preserve row multiplicity, column/storage types and BLOB bytes; validate schemas
and reject unknown tables or triggers. Independently model the raw history
append, selected branch/head and each permitted bookkeeping field. Preserve
all other rows, history prefixes and images. Document-body equality is useful
but cannot replace this table-level delta.

Finally, require both proofs. A task2 promise can resolve despite a reported
HTTP failure, while an unintended duplicate insert can succeed. Neither queue
settlement alone nor exact database state observed at one moment is sufficient.
