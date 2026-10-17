# Current symbol validation and ordinary metadata editing

## Current 101500 result

The installed101500 disposable run completed both the forward edit and its
internally derived inverse. Each write passed a complete 35-table closed SQL
comparison, a fresh project-only reopening, exact 415-byte saved-content
verification and final closed SQL equality. Independent review checked all
18 documents, including 17 unchanged peers, plus clock, adoption and closure
receipt links. The original selected name and description were restored.
Historical database bytes, tickets and timestamps were not restored.

Both journals are terminal without a hard stop or orphan risk. The final
retained SQL digest is
`cdb9419607f5c43091d84f928aa427c60385a1c7616beee67550ae85a94282a5`.
EasyEDA closed through its original owner. No explicit Save, manual inverse or
replay was issued, and production projects were not accessed. This is acceptance
of the unused META-only disposable case, not unrestricted symbol modification.

## Ordinary route in 123000

The new `easyeda_control_project_symbol_metadata` route enables one forward-only
name and/or non-null description change under the same narrow writer checks.
Offline discovery and validation use `project-symbol-operation` and
`project-symbol-operation-validate`. It binds ordinary purpose before navigation,
derives a supported startup expectation, and retains the original opening,
baseline, writer and verifier owners. Its continuation accepts no new patch,
target, fingerprint or inverse phase. Completion verifies the requested metadata
and retires the verifier without retaining inverse ownership.

The shared writer has the connected disposable evidence above. The newly
registered ordinary entrypoint has source and actual-SDK contract tests, not a
separate connected run. Its malformed-request checks cover unknown outer and
nested keys, inverse phases and replacement fingerprints, followed by valid
historical inspection without journal changes or a runtime child. Generic
library modification and schematic/PCB writers remain blocked.

The official [symbol modifier](https://prodocs.easyeda.com/en/api/reference/pro-api.lib_symbol.modify.html)
is still beta and exposes a broader library/classification/property contract.
The page was checked on2026-10-17. The plugin route is a version-pinned native
equivalent for the stated subset; its proof is not evidence that the public
wrapper or unsupported arguments work.

The update also fixes offline doctor selection: exact current PCB/API versions
use their current pinned hashes and restricted catalog; the exact legacy tuple
uses the legacy manifest and full catalog. Unknown or mixed tuples still refuse.
A second full-history scan used only to reject duplicate operation IDs is
replaced by a fresh, safe exact-namespace check. Full admission checks and
exclusive journal creation remain. No connected speedup is claimed.

## Earlier 090000 result

The 090000 disposable run completed the forward write, complete closed SQL
comparison and reopened saved-content verification. All 35 tables were checked.
The raw closed baseline's logical SQL digest changed from `3edebd2d` to
`de4e0f65` with exactly the modeled metadata/history/structure effect. The fresh
verification generation returned 415 bytes of saved symbol content, exactly
matching the current document-cache projection. Its final closed logical SQL
was unchanged from the verified post-write state. This establishes the forward
lifecycle for this unused, metadata-only disposable symbol, not the round trip.

Inverse preparation then stopped while adopting its neutral journal, at sequence
zero. `createOperation` seals that journal in place, but `adoptInverse` had cached
its canonical `journalText` before sealing. The immediate unchanged check compared
the sealed journal against the stale text and refused. No inverse mutation or
closure-ownership transfer occurred. The source correction binds the cached
text to the original sealed journal after successful creation, while preserving
the checks against changed journals and copied ownership.

The original owner completed normal closure and terminal retirement with
`fullReopenReadbackInvariant:true`. EasyEDA is closed. The disposable symbol
retains the 090000 name and description. Final status reported no incomplete
operations or bridge failure. No explicit Save, manual inverse,
restoration or replay was issued. The consumed attempt cannot be resumed after
the correction; a future run starts from the retained 090000 metadata. The
ordinary forward-only route remains internal and unregistered.

## Pre-dispatch scope and proof budgets

The new source gate checks every target record in complete decoded raw history,
not only the materialized live records. It rejects historical canvas records
and their tombstones, including a canvas record later replaced by metadata
bookkeeping. A presently empty canvas is not sufficient. Existing unreferenced-
symbol, original-owner, actor, clock and complete SQL requirements remain.

Admission also reserves the supported proof capacity before writer transfer.
Ordinary and inverse writes reserve one exact metadata stage; disposable forward
validation reserves both its forward stage and restoration of the original
metadata. The second patch comes from the original validation owner, not caller
flags or copied JSON. Each stage must fit the existing raw/cache projectors,
history rows/chunks/records/bytes, safe tickets, full saved-content serialization,
saved-read input and doubly encoded output envelope. SQL bounds include both
inserted rows, complete cells/encoded output, rowid/AUTOINCREMENT allocation and
the source-derived compressed upload bound. Intermediate effects count even when
the inverse produces shorter metadata. See the
[compression derivation](current-symbol-producer-scope-2026-10-16.md#2026-10-17-addendum-compressed-upload-size-bound).

These are logical capacity bounds, not a guarantee that the reader will finish.
Physical SQLite allocation, the 256 MiB file limit, available native heap and
deadlines remain runtime limits. A failure still requires original-owner cleanup
and terminal handling; passing the budget grants no execution authority.

The closed raw copy and its separate `VACUUM INTO` checkpoint need independent
bindings. In the reviewed baseline, raw bytes had hash prefix `1ae5d54b` and raw
logical SQL `3edebd2d`; checkpoint bytes had prefix `52b523cb` and checkpoint
logical SQL `b9663f2f`. All 35 table inventories and schemas matched. The sole
inventory difference was `schema_version`, 117 in the raw copy and 118 in the
checkpoint. Native history semantics matched, but file-bound lineage hashes
correctly differed. The gate binds each original descriptor separately and
compares complete history semantics. It must not require equal file hashes,
substitute one descriptor for the other, or globally ignore SQLite properties.

The gate and budget passed focused source tests, strict lint/typecheck and
independent review before publication in `0.3.0+codex.20261017101500`. They were
absent from090000, so that earlier run did not validate them. The later installed
101500 round trip passed the narrow case described above; other supported sizes
and resource limits are not thereby live-tested.

## Earlier 072500 result

The new unused-symbol run acknowledged the forward write and passed its complete
closed SQL comparison. All 35 tables were checked: 29 stayed identical and six
had exactly the modeled metadata/history/structure effects. All 17 peer documents
were unchanged. Fresh verification reopening succeeded, but the saved-content
check stopped on the exported `DOCHEAD.user`: the native result used the symbol
UUID with no display names; the raw-history projection used the persisted actor
UUID and empty names. Every other exported byte matched.

Original-owner cleanup closed EasyEDA normally, observed termination and checked
the complete final database against the verified post-write state. The operation
is terminal and failed, not a completed forward/inverse lifecycle. No inverse,
explicit Save, restoration or retry was issued. The disposable symbol retains
the requested name and description; any future attempt starts from that state.
Do not revive this operation or use a later diagnostic as its missing successful
saved-content read.

## Current cache-replay correction

Pinned `project-worker.js`, SHA-256
`b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928`,
has two history-loading paths. The raw path retains `EDIT_HEAD`. Its document
cache writer omits that record; cached replay synthesizes the first actor from
the document header instead. Explicit header users are still preserved. That
modifier reaches `symbol.getStr` through the same native serializer.

The observed result exactly matches the cache-derived form. The actual cache
branch was not observed, so its use is an inference from source and output, not
retained provenance. The correction models an additional exact complete-string
candidate only for the pinned current version and META-only symbols. It does not
ignore user fields, normalize native output, replace SQL actors, or change the
older raw-history projection. Nonempty symbol canvas cache replay remains
unsupported until its separate header/canvas behavior is modeled.

Both producer hashes and the complete original SQL/source proof remain required.
A matching candidate identifies a supported serialization, not which native
loading branch executed. The stopped 072500 attempt stays failed. New connected
validation is required before enabling the ordinary writer.

This update also bounds concurrent managed-artifact hashing to four streams
across callers. Warm journal checks can overlap; cold parsing, sorted selection,
fresh hashes and path/identity checks remain. A failed batch drains its already
started checks before returning. No connected latency improvement is claimed.

## Earlier 043703 result and scope correction

The 043703 disposable run passed the previous clock and missing-project-user
failure points and dispatched the metadata write once. It then returned
`CURRENT_SYMBOL_WRITE_REFUSED:MUTATION`. In that compiler, `MUTATION` covers both
the awaited native update RPC and the following `same()` guard check. The marker
does not identify which failed, and an RPC can fail after persisting an effect.

Original-owner normal closure, termination observation, complete closed snapshot
and retirement completed. The attempt is terminal and plan-invalidated. Its
recovery outcome remains `unresolved`, with basis
`original-post-dispatch-evidence-incomplete`. No explicit Save, inverse or replay
was issued. Do not resume the consumed operation or infer retry authority from
the diagnostic evidence.

A read-only comparison of all 35 SQL tables and all 18 native documents found
the intended target metadata change and expected native bookkeeping; all 17 peer
documents were exact. This is evidence of persistence, not acceptance of the
writer lifecycle. It cannot supply the missing acknowledged post-dispatch result
or authorize an inverse. The disposable project remains closed.

Source review found a separate scope problem for referenced symbols. In the
pinned `sch-main.js`, SHA-256 prefix `d9d6a955`, `SYMBOL.ON_UPDATE` checks the
complete sheet symbol references and calls `Em` for a used target. Its
`endBatch` path calls `Xl` and `getOrInitDoc`, which can load dependent sheet
models into `docMap`. The metadata-only writer requires that map to stay empty.
This native propagation is incompatible with that contract, but the old marker
does not prove it caused this particular refusal. Waiting longer or weakening
the empty-map guard is not a correction.

Update `0.3.0+codex.20261017072500` therefore excludes referenced targets.
Startup qualification rejects a target present in the complete hash-bound
startup template inventory before the native startup observation or writer transfer.
The writer compiler independently rejects the same case. Existing source,
ownership, actor, clock and complete SQL checks remain required. This is a
narrower metadata-only scope, not support for referenced-symbol propagation.

The update also separates `POST_MUTATION` from `MUTATION` and reports only
fixed phase/guard categories. `POST_MUTATION` means the native RPC returned and
the following guard check failed; it does not establish a correct effect or
durable success. Unknown or private error suffixes are not exposed. Timeout
remains unsettled, because a deadline does not cancel the native operation or
prove its outcome. New diagnostics cannot retroactively classify the 043703
failure or grant replay authority.

Publication and installation results are recorded in AGENTS.md. A complete new
disposable lifecycle remains pending. No ordinary writer is enabled.

## Earlier 033309 actor correction

The 033309 disposable run passed the previous historical-clock failure point.
It then stopped before metadata dispatch because the selected account had no
matching row in the project's historical `users` table. The only row belonged
to the imported library, not the selected actor. This was an unsupported case,
not evidence of ambiguous account selection.

The pinned native history producer keeps the request's actor UUID and emits
empty display names when the project-user lookup finds no row. The maintained
full-SQL comparator already predicts this behavior. Update
`0.3.0+codex.20261017043703` added that explicit branch to the actor wrapper:
agreeing UI identity remains mandatory, absence is bound to the complete original
users table, and persisted names must be empty. It never substitutes another
user, copies UI names into history, or accepts a new user row after the edit.
Duplicate matches and malformed evidence still refuse.

Original-owner normal closure and termination completed. Complete logical SQL
and the raw file hash match the initial disposable baseline. No metadata edit,
explicit Save or inverse was dispatched. The consumed operation is terminal;
its evidence cannot authorize another attempt.

The update also returns the exact managed preparation checkpoint descriptor
from new opening results, permits bounded historical inspection after owner
loss without continuation authority, and replaces per-file stream allocation
with bounded descriptor-read buffers. Every file is still freshly hashed.
No connected speedup or successful writer lifecycle is claimed.

Review of the subsequent clock checks found no additional epoch mismatch:
launch/capture observations retain their original generation identity, whereas
fresh owned observations retain their stricter lifecycle-epoch requirement.
Both kinds keep their existing checks. Permission and mutation were reached in
the later 043703 run described above; complete lifecycle verification is still
unfinished.
The maintained SQL/actor preparer also passed a read-only diagnostic using the
exact retained fixture and recorded inputs. That check issued no live clock
tokens or lifecycle authority and is not connected writer validation.

## Earlier 020000 connected result

The 020000 disposable run completed ordinary opening, closed-baseline capture,
scratch Date controls, project-only reopening and renderer Date controls.
Startup qualification and the symbol preflight succeeded. The writer then
collected its fresh before/armed Windows samples and backend clock reply, but
stopped before the metadata mutation with an original-clock ownership error.

The writer's summary requires every before/armed/after sample before reporting
`originalWindowsSamplesRetained:true`. Its false value does not mean no samples
were collected. The retained stopped artifact contains before/armed samples
and the backend reply, but no write reply or after sample. New summaries also
include `retainedEvidence` booleans for each individual sample and reply.

Original-owner normal closure, termination observation, complete closed snapshot
and retirement all completed. Complete logical SQL equals the initial baseline;
the closed disposable file also retains its original 598,016 bytes and raw hash.
There was no metadata dispatch, explicit Save, inverse or production-design
access. The consumed attempt is terminal and must not be replayed.

## Cause and correction

The aged-history issuer treated earlier Date-control samples as current live
Windows observation tokens. Those tokens correctly bind the native supervisor's
lifecycle epoch. Legitimate startup and writer preflight capture/release steps
advance that epoch, making the older tokens stale before age qualification.
The fresh writer samples succeeded; the historical-token recheck failed.

The correction is confined to the aged-history issuer. After successful
collection and final live checks, it seals historical endpoint values and their
provenance privately. Later qualification must still prove the original issuer,
engine, generation and reference, then compare those historical values with a
fresh, currently owned backend observation. Original capture/Job/owner binding,
timezone rules, UTC/QPC ordering and the 61-second minimum head age remain required.
The shared Windows epoch guard and transaction windows are not relaxed. Saved
JSON cannot construct this private issuer or grant execution authority.

## Earlier clock-update changes

- The dormant ordinary forward-only workflow gains the same retained-owner,
  one-shot failed-opener normal-close action as the disposable workflow. It
  preserves quarantine until separate original termination proof.
- Historical abandonment checks can reuse three deterministic SQL digests.
  Each use still freshly hashes both retained databases and checks identities,
  paths, sidecars and the pinned reader. Journal and claim checks remain outside
  the cache. No process ownership or admission result is cached. Connected
  latency improvement has not yet been measured.
- Extension-development guidance now distinguishes historical evidence reuse
  from current process authority.

## Verification and remaining work

Source review, focused regressions, final lint/types/build, CI and installation
results are recorded in AGENTS.md as they complete. The101500 disposable round
trip is accepted. The123000 ordinary public route still needs its own installed
connected admission before any use; no production validation is planned.

The inverse adoption correction passes 21 focused tests. Its real-storage
regression reproduced the original error before the fix; changed disk or memory
state still refuses before adoption intent or ownership transfer.

1. Finish123000 release checks, GitHub CI and marketplace installation. Verify
   the installed files and offline catalog; then load it in a fresh Codex session.
   Never hotpatch or terminate the loaded facade to update it.
2. Give the new ordinary public route a focused disposable connected check after
   installed-runtime admission. Do not repeat the completed101500 round trip or
   revive older terminal attempts. No broader live campaign is needed to ship
   this scoped update.
3. Model and validate nonempty or historically drawn symbol-cache replay before
   extending the META-only scope. Deleting geometry is not an admission workaround.
4. Implement referenced-symbol propagation separately, including dependent-page
   loading and its complete source and SQL effects. Unused-symbol evidence does
   not cover this capability.
5. Continue the documented schematic/PCB native structure completion, geometry,
   component-library and manufacturing-export backlog. The API inventory still
   contains774distinct methods; the new ordinary route covers one narrow native
   equivalent subset. Omission reasons and required work remain in its coverage
   inventory. Further pure parsing caches and timing instrumentation are optional
   performance work, not release blockers.

Production designs and their records remain untouched.
