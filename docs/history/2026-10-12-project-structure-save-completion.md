# Project structure completion after Save

## Current implementation status

October13 integration correction: read-only fixture inspection found native16-hex
document IDs and duplicate selected-branch structure rows. Candidate074635 admits
the native document-ID formats throughout the closed-symbol path and models the
exact branch-wide update for eligible duplicate rows. The public callback has
not yet run; ordinary editing restrictions remain. See the
[focused release](2026-10-13-api-coverage-074635-release.md) for current status and
the remaining implementation list.

October 13 delivery update: the complete native helper and v3 transport are now
implemented. Two independent public-toolchain builds produced the same 175,104-byte
DLL. Both TypeScript checks, strict lint and 153 existing integration tests pass.
The first standalone native smoke stopped at process creation with Windows
error 87, before a PID was acknowledged. It refused completion and retained the
affected dependencies. DOS launch names derived from the original rechecked
drive/GUID mapping corrected that compatibility issue without changing GUID
ownership or retrying the failed attempt. A fresh standalone run completed in
28.370 seconds with a zero exit, empty Job, complete cleanup and accepted native
clock/result evidence. Its request was synthetic. Successful public disposable
callback validation remains separate. Installed editing restrictions are unchanged.
Additional test expansion is deferred at the user's request; implementation,
focused disposable verification and release/install take priority.

The paragraphs below preserve earlier implementation and verification history.

The internal locked-head and aged-unlocked-head coordinators, saved-content
reader, terminal publication and historical verification are now implemented.
Historical admission selects the matching verifier. Its locked-head cache
rechecks the complete retained evidence on each use; aged-head verification
always performs a full scan. None of these historical results restores live
ownership or permits an operation to be replayed.

The preceding integration passed the full facade suite: 9,388 tests, one
platform skip and no failures, with all 1,002 inputs unchanged. The subsequent
automatic selector and paired FIFO-reader fixes are now maintained. They pass
strict types, zero-warning type-aware lint, 63 focused tests, 424 bridge tests
and package, coverage, repository and skill checks. Rebuild and compatibility
checks pass. The new full suite passes 9,460 tests with one platform skip and
zero failures; all 1,022 captured inputs remain unchanged.

Automatic selection uses the completed original baseline within the same
attempt; it neither retries the baseline nor falls back after refusal. Its
private actual-stage batch passed all 47 cases before mapping. These tests use
synthetic application effects and real local SQL readers, not native EasyEDA
execution. All affected execution routes remain blocked.

The disposable validation entrypoint was first maintained as an internal module
before public wiring. Correcting its fixture's construction-time
scope clears the three original prelaunch failures. Six of its eight cases then
pass; the other two expose a fixed-name cache fixture that cannot model the
entrypoint's generated namespace. That test-only correction is now maintained
after one genuine old-code failure and 504 private passes. All eight unchanged
handler cases now pass, including both history paths, with the complete 1,033-file
package snapshot unchanged. No production comparison or nonce is weakened.
Its seven-file portable mapping preserves all eight case bodies and passes
independent review, types, strict lint, build and compatibility checks. All eight
maintained cases pass in 131.608 seconds, with all 1,043 inputs unchanged. The
full suite passes 9,609 tests with one platform skip and zero failures; all 1,043
captured inputs remain exact. Bridge tests (424), types, strict lint, package,
repository, coverage, actionlint and all seven official skill checks also pass.
Dependency audits report zero vulnerabilities and verify 151 registry signatures
and 40 attestations. That full-suite snapshot predates public registration.

The private public-callback candidate now passes strict types, zero-warning
type-aware lint and all 67 tests. Those tests include strict input/output
handling and four actual SDK-client cases. A negative control reproduces a
64 KiB test-client overflow on the 224,137-byte catalog; the positive tests use
a bounded 1 MiB client. No production transport limit changed. These results
cover refusal and reservation behavior, not successful native execution.
The exact ten-file public integration is now maintained and independently
reviewed. All 70 callback/contract tests pass with all 1,048 package/workflow
inputs unchanged. Types, zero-warning strict lint, rebuild, compatibility,
coverage, package and repository/privacy checks pass. External compatibility
pins remain unchanged. The extension-development skill now includes the helper
ownership and public-callback testing lessons; all seven skill checks pass.
Five actual SDK setup/launch race cases now pass privately and from their
independently reviewed maintained mapping. They cover both ordinary-launch and
validation orderings, two concurrent validation calls, configuration drift and
shutdown. The maintained run retains all 1,051 inputs unchanged. Both facade
typechecks and full strict type-aware lint pass without warnings. These cases
refuse before native allocation; successful native execution remains pending.
The installed package is unchanged and still exposes the earlier 26-tool catalog.
The updated standalone bundle passes all three startup cases, including exact
27-tool discovery without source dependencies or live startup. A further 61
launcher, shutdown and offline-catalog regressions pass. Both runs retain all
1,048 package/workflow inputs unchanged. Final types and strict lint pass after
the bundled-startup catalog assertion update.

The earlier completed eight-shard run passes 9,681 tests with one platform
skip and zero failures. All 1,051 captured package/workflow inputs, the 431-file
test selection and runtime identities remain unchanged. All eight returned
children close successfully without containment; the run takes 1,054.924
seconds. This includes public registration, the five setup races and the
capture-description correction. It remains synthetic validation, not a
successful native callback or a completed EasyEDA transaction.

A subsequent two-function artifact-cleanup fix is now maintained. It preserves
opaque callback failures, including `undefined`, while attempting resource
cleanup before error formatting. Its separate private regression reproduced two
old failures and passed all 20 corrected cases. Both maintained facade typechecks
and full strict lint pass. The six-file maintained runtime run passes all 103
tests with no skips or failures; all 1,052 package/workflow inputs remain exact. The
9,681-pass full suite covers the preceding snapshot, not this new source delta.
Bundle regeneration, the facade-only compatibility refresh/check and package
validation pass. Only two bundles and the manifest changed; external runtime
pins and all 1,049 other captured inputs remain unchanged. No publication or
installation occurred.
All three rebuilt-bundle offline startup tests also pass, including 27-tool
discovery without an upstream process or bridge socket. The complete 1,052-input
snapshot remains unchanged afterward. This does not establish native execution.

The October13 full maintained facade run includes that artifact fix and passes
9,701 tests with one skip and zero failures, cancellations or todos. It finishes
in 496.601 seconds. All 1,052 package/CI inputs remain byte- and mode-identical
before and after. This supersedes the earlier full-suite count for that
snapshot. It predates the native-v2 mapping and does not establish native
execution or final GitHub CI.

Transport uncertainty and its v2 retained diagnostic record are now maintained.
Types, strict lint, rebuild and compatibility checks pass. A 305-case focused
run passes 304, including actual-stage opaque launch failure and historical
downgrade refusal. The sole failure is an obsolete comment delimiter in a source
parity test; checked boundaries correct it and all six parity cases then pass.
Two further actual-stage cases also pass for drain expiry and incomplete guards
despite observed close. They preserve diagnostics and permanent refusal after
late events. Their three-file portable mapping is maintained. The resulting
focused run passes all 811 tests, with all 1,036 inputs unchanged; both type
checks and full strict lint pass. The 9,609-pass full suite above includes this
integration and the maintained disposable entrypoint. Native
Job closure remains separate from child-process closure or a termination request.
The aged-head native transport still has an unconditional refusal.
Removing it requires a reviewed transport implementation and separate native
validation. A successful narrow ordinary-symbol metadata case would not
validate the other metadata operations or schematic/PCB geometry Save.

### Remaining work

The passing suite above covers the maintained internal implementation, not a
finished native lifecycle. The remaining work is:

1. Finish successful public disposable-validation callback testing. The maintained
   70-test integration and five actual SDK concurrency/configuration/shutdown cases
   pass. Complete the positive native callback path separately from the existing
   internal-entry tests; refusal-only race passes do not establish that path.
2. Finish the native helper and its end-to-end qualification. The fixed Windows
   Console, memory-only security-descriptor, process/Job and three relative-create
   cases have passed. The private compiler/result integration also passes 52
   focused tests, strict types and lint. Earlier failures and exact test limits
   remain in the [native hardening record](2026-10-12-main-reference-native-hardening.md).
   The work still required is:

   - Keep the maintained stdin, process cleanup and native-result integration
     covered as the helper changes. Its 44-file regression group now passes
     600 tests, including the 52 new cases, with no failures or skips. The 1,055
     selected inputs remain exact against the during-test snapshot. Strict
     types/lint, rebuild, package checks and offline startup also pass.
   - Integrate retained ownership with the file/process session. The full
     eleven-directory adapter passes six source checks, 43 offline model cases,
     two clean builds and its fixed Windows test, with 22 frames and 23 successful
     handle closes. The separate retained-context model and cross-owner alias
     extension pass 62 cases with a clean build. Pending or uncertain calls
     must retain every parent and memory resource they might still use.
   - Implement the fixed file owner, retained write-to-read handoff and exact
     scratch ancestry. The private file-owner state machine now passes 346
     offline model cases and a zero-warning build, with all 42 inputs unchanged;
     the file-create frame passes 158 cases and the ancestry owner passes 81.
     The one-file backend/session composition also passes 45 model cases and a
     clean build, with all 64 inputs unchanged. Its separate fixed Windows case
     now passes exact write/readback/seal and all three file-handle closes,
     after 33 pure checks. The ancestry backend passes 78 model cases and seven
     source checks, then its separate Windows probe passes all 18 parent-role
     borrows, lease settlement and 11 handle closes after 53 pure checks.
     Neither probe copies runtime files or launches an application.
     Prove the final Electron pathname
     handoff while its parent
     directories and file locks remain held through process/Job settlement.
     The existing C:\Temp test premise does not qualify production scratch or
     installed-source ancestry.
     Finish the 18 existing runtime-file opens and bounded streaming copy/hash
     backend, the child-receipt inherited-permission check, and fixed readiness
     polling/final failure-file absence checks. The one-shot receipt reader is
     not a polling API. These pieces must share the original retained ancestry,
     layout, file and process owners through settlement. The source-open owner
     diagnostic-retention correction now passes 174 model cases plus two shared
     controls that fail with the old owner. Native source opening and the
     original ancestry-to-layout lease join still need native validation; the
     joined-owner model now passes173 cases after an exact test-bound correction.
     Child-file admission must validate the actual descriptor against the
     retained session identity. The diagnostic fixture observes TokenOwner
     separately to explain its default-owner result; production admission need
     not add a token-reopen API or claim that provenance.
     The observer now passes75 model cases and seven source checks, with a clean
     build and81 unchanged inputs. Its native Framework-reference compilation
     also passes without diagnostics and with62 unchanged inputs. After87 pure
     checks, the fixed Windows observation now passes with93 unchanged inputs,
     two child/token closes and23 layout closes. Its bounded descriptor remains
     observation-only; the child policy, receipt reader and actual Electron
     producer qualification remain unfinished. The joined-native probe's first
     model case exposed a null-versus-"none" entry contract bug. A separate
     correction now passes19 entry models and a clean native compilation,
     preserving the original failed result. The source-streaming backend passes
     108 models and a genuine old-failing/new-passing write-error control with
     three clean builds and100 unchanged inputs. Its successful real-source
     preparation and child-reader integration remain pending.
     The joined Windows parent's first pure run passes76 of77 checks; its
     source-key test incorrectly excludes digits in `win32Error` fields.
     A separate test-only successor preserves the failed result and all native
     bytes, then passes77 checks, exclusive staging and the sole joined Windows
     run. It reports22 frames,23 layout closes and11 ancestry closes with no
     errors or deferred cleanup. The original lease is counted in both ledgers.
     All133 selected inputs and both staged files remain unchanged; no runtime
     file is opened and no application is launched.
     The source-copy entry now passes17 offline cases and a clean Framework
     build; real runtime copying is still pending. The separate child reader
     passes seven source checks and139 offline models with96 unchanged inputs.
     Those modelled prepared states do not qualify an Electron producer or
     the still-refused complete-session Job/launch-clock join.
   - Package a fixed byte-loaded DLL with a pinned, reproducible build and test
     its bounded hash-checked loader. The
     [build research](2026-10-13-windows-native-helper-build-research.md) supports
     this direction. Public SDK checksum and reference-package signature/license
     verification now pass. Two private SDK deployments also pass complete
     archive/tree hash and mode checks, without running acquired code. The
     artifact, loader and CI recipe remain unfinished.
   - Qualify the composed helper, application clock and failure cleanup on the
     actual Windows runtime before removing the native refusal. Passing isolated
     native cases does not prove their composition or an EasyEDA lifecycle.
3. Run the complete closed-symbol metadata case on a disposable project,
   including original process termination, complete SQL/source comparisons,
   reopen and retained failure recovery. A successful first case covers only
   its exact operation and context.
4. Extend completion and persistence proofs across all eight affected metadata
   actions: `library.symbol.create`, `library.symbol.modify`,
   `document.page.create`, `document.page.rename`, `document.pcb.create`,
   `document.pcb.rename`, `document.schematic.create` and
   `document.schematic.rename`. Then cover schematic-page, symbol and PCB design
   lifecycles. Add exact
   forward, inverse, ambiguous-return and recovery tests for each admitted
   subset before restoring its execution route. Broader schematic connectivity
   needs its own nonmutating proof; no compiled-netlist SaveAll fallback.
5. Complete the method-specific work in the
   [feasibility inventory](2026-10-10-api-execution-feasibility.md): asset
   deletion/copy, initialized library assets, document hierarchy creation/copy/
   deletion, source replacement, external model/library changes, ECO and
   operation-specific exports. Implement feasible bounded subsets and retain a
   concrete omission reason for the rest. Symbol deletion and capture/paint
   completion remain separate investigations.
6. Reconcile the exhaustive API inventory, capability claims, examples and all
   task skills against actual implementation and connected evidence. Historical
   successful cases must not be presented as current route availability.
7. Freeze the final source, regenerate bundles and compatibility projections,
   run full regression/lint/types/security/privacy/package/skill checks and
   obtain GitHub CI for that exact payload.
8. Publish and merge through the protected workflow, install from the GitHub
   marketplace, verify packaged bytes and modes plus offline discovery, and
   perform fresh-host connected admission where required. Do not patch a loaded
   cache or terminate a host-owned gateway to force pickup.

The production design and its project record remain outside this work. No
EasyEDA action, Save or recovery is pending. The native tests described above
use standalone synthetic helpers, not the application or a design.

### Earlier implementation milestones

The following milestones describe earlier snapshots, not the current list of
unfinished internal modules.

The affected execution routes remain blocked. Internal source now includes
retained whole-session captures, stable closed-file copies, a bounded complete
SQL reader, an ordinary-symbol SQL comparator, startup/worker observations,
actor/worker-bound symbol compilers, a cross-generation storage marker, a durable
phase recorder and same-journal navigation. The last completed full local run
passed 6,867 facade tests with one platform skip and 424 bridge tests. Strict types
and type-aware lint pass. This includes the reply-integrity and artifact-read
fixes described below. Rebuild bytes/modes, repository/privacy checks and all
seven official skill validations pass.
None of those modules alone grants execution or proves a completed transaction.

First-launch, authenticated-admission, normal-close and historical-copy stages
now have153 additional passing focused synthetic tests, also included in the
passing full suite. The historical reader checks retained
artifacts only and cannot reconstruct process authority after a restart.

A standalone Windows PowerShell5.1 check compiled the private clock collector
and exercised its wrapper with a fake dispatcher. It did not launch EasyEDA or
establish the application's clock behavior.

The source-owned clock issuer and its exact native helper are now integrated.
All216focused portable cases pass, including original-receipt ownership,
missing clocks, source drift and long sessions. The full helper also compiled
once on Windows and passed an empty-Job probe without launching an application.
These checks do not qualify a live APP clock or a completed metadata write.

The worker-bound compiler adds574passing cases and retains the prior actor and
legacy output contracts. The recorder now marks possible mutation durably with
write intent. The first complete verification of this integration passes.
Private witness/write/comparison stages remain separate, including an
independently reproduced and corrected supplied-verifier substitution. The
saved native content reader and final coordinator are still unfinished.

Additional regressions reproduced changes to a settled reply after its original
contents were published. The affected stages now retain and recheck the original
reply. A new whole-artifact reader also hashes raw bytes before lossless UTF-8
decoding, closing a demonstrated second-open substitution gap. All143focused
artifact/journal tests,66startup tests and59navigation tests pass. Navigation
also reloads its durable journal and rechecks session/lease state before return.
The private writer and SQL-stage suites pass20 and105cases respectively, without
performing a native edit. Those private stages are not yet packaged.

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
[native source table](2026-10-12-symbol-delete-native-effects.md#pinned-primary-sources).
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
[symbol Save adapter](../../plugins/easyeda-pro-control/server/src/symbol-lifecycle.ts)
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
[design coordinator](../../plugins/easyeda-pro-control/server/src/design-execution.ts)
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
