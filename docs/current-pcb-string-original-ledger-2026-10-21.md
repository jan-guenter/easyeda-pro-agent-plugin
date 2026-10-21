# Original String ledger and global exclusion

This continuation puts the clock and actor composition into the existing String
ledger. It also makes unresolved String journals block actual shared launch,
bridge-dispatch and native-edit admission. It does not enable a writer.

## Durable exclusion

`current-pcb-string-ledger-exclusion.ts` reads the fixed ledger directory through
the retained control-root descriptor. It bounds the roster to 1,024 operation
directories and refuses unexpected files, names, links or changing directory
identity. The scanner does not trust journal content to decide completion.
An empty directory, partial reservation, malformed record and a record claiming
`completeLifecycleVerified:true` all remain blockers. Missing parent means no
reservations. A missing or changed control-root capability is not bypassed.

The existing `assertNoUnresolvedCurrentPcbDiagnosticLaunches` calls this guard.
Its ordinary-launch and engine bridge/native-edit callers therefore share the
new exclusion. Original-owner cleanup and local inspection do not use this
editing/launch gate. There is no caller-provided operation exclusion, alternate
control-root selector, terminal-JSON exception or journal deletion endpoint.

No current public route creates these dormant ledgers. Do not rehearse them in
the live control directory. Every existing ledger remains unresolved, including
the final comparison-only state, until native lifecycle completion is implemented
and separately admitted. All tests use the required isolated control-root preload.
The roster check is a fresh observation, not an OS-wide lock. Actual native
integration must retain the existing shared launch lease and sole-facade ownership.

## Direct phase integration

The existing comparison-only `prepare` factory remains available to synthetic
rehearsals. The new `prepareOriginalSources` factory accepts the original actor
runner, its original packet, original candidate/create plan and completed original
SQL inventory. It refuses another reservation before creation, serializes local
preparation, binds exact project/branch/document and writes an `original-sources`
record. It does not issue native ownership or execution permission.

The retained owner's path uses `prepareOriginalProvenance`: it consumes the exact
provenance token the owner already issued, rather than attempting to reissue one
from an already-consumed actor packet. Both paths share the same global exclusion
and record creation. A copied token is refused; one original token cannot reserve
another ledger. The actor/SQL ownership is checked again after durable publication.

Only this original instance may continue with its own reservation present. Every
awaited ledger stage checks that it is the sole String reservation, then rechecks
the original directory identity, record roster, bytes and digests. A different
operation ID cannot bypass an earlier attempt. Partial publication stays blocked.
Historical JSON cannot recreate this instance or its phase tokens.

The direct sequence is:

1. Reserve one create intent, record the outcome and compare native/postcreate
   and publication evidence using the existing ledger methods.
2. Call `armSaveClock` with the original native before/armed tokens, native issuer,
   server-clock runner and packet. The ledger creates and durably records its
   original clock plan. It does not itself invoke the effectful time RPC.
3. `reserveSave` requires that same original provenance and clock plan. The SQL
   witness must use the plan's exact backend bounds and timezone, and expected
   Save/backend times must fit their separate sealed windows. Original source
   ownership is rechecked before the sole Save intent is published.
4. After the sole Save acknowledgment, `recordSavePost` seals the original live
   post token and records it. No missing/error acknowledgment grants a retry.
5. `compareClosedSql` requires the original termination clock, the sealed history
   and complete SQL comparison. It records both the clock relation and SQL result.
   Pre-close actor/native owners are not revived after termination.
6. Existing fresh-reopen String and final complete SQL comparisons follow. Their
   supplied-data status is unchanged. Finishing them does not clear the global
   blocker or assert native lifecycle completion.

The journal limit grows from12 to16 records. The complete original-source
synthetic composition writes13. Existing comparison-only records retain their
meanings. Clock plans/attempts are never reconstructed from those records.

## Retained owner integration and remaining work

The String lifecycle now forwards its actual retained pre-open SQL inventory to
`observeStringPrecreate`. Installed owners require it; only synthetic owners
without an admitted installation can omit it for observation-only tests. A copied
inventory is refused before new renderer requests. Once the complete observation
succeeds, the owner privately retains its actor runner, original packet, completed
SQL inventory and original provenance. Its `originalStringSaveProvenance` method
revalidates those original objects and context, and refuses after normal close,
termination or release begins. This adds no public response claims or clock calls.

The owner does not yet allocate or dispatch through a ledger. Once the remaining
eligibility prerequisites are met, its internal coordinator should pass its own
original token to `prepareOriginalProvenance` and retain that ledger for the same
lifetime. Do not accept a tool argument or reconstructed journal token in place
of the owner method. This source attribution is not native ownership, proof of a
backend request actor, clock freshness or writer authorization.

The fixed server-time RPC is still absent from the native command route. Its
dispatch consumes a bus ticket and installs a reply subscription. That route
must be implemented under the retained worker/source owner and durable attempt
accounting, with no arbitrary RPC or evaluation fallback. Only then can the owner
obtain the original packet needed by `armSaveClock`.

Clock plumbing is not the remaining create/Save eligibility proof. The current
source still lacks complete startup and publisher/receiver/channel ownership,
write-destination containment, exclusion of foreign subscribers and persistent
upload/replay work. Create emits extension events; Save can include custom
footprints, dynamic copper and delayed uploads. Those exclusions must hold before
dispatch. A retained Job or matching empty counters does not establish them.

After those prerequisites, add fixed original-owner create and Save methods that
consume these durable tokens exactly once. Retain raw replies and acknowledged
IDs through failure, prove original root plus whole-Job exit, use an independently
qualified closed SQL reader, exclude both replay-cache namespaces, reopen under a
fresh owner, then close and compare final SQL and visual evidence. A separate
native completion issuer must define how the global blocker can be resolved.
Do not add a JSON `complete` switch or accept a supplied boolean verifier.

## Verification

Focused synthetic checks cover global rejection of partial/falsely completed
journals and symlink substitution, copied actor packets, concurrent preparation,
new-ID bypass, durable original clock plans, one Save, complete closed SQL and
comparison after the actor owner expires. Existing ambiguity/replay/tampering
ledger tests remain in place. These are not connected EasyEDA or saved/reopened
writer validation. No live application or production-design access occurred.

The separate raw-String regression now uses actual local inspector
`Runtime.callFunctionOn` on a synthetic function's V8 `[[Scopes]]` / scope-zero
handle with the original callback remote handle and `throwOnSideEffect:true`.
Both an empty manager map and one self-authored model pass. A mismatched manager
returns the fixed `view-manager` / `guard` failure, and no fixture vendor getter
or callback runs. The former test only used `Runtime.evaluate` on a supplied
scope-shaped object; it did not cover this remote internal-scope behavior.

Read-only source inspection matched PCB asset SHA256
`217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33`.
The empty-map guards agree with `x=qT` and own static `qT.env`, `bo=U4` and own
static `U4.manager`, and `Jr=new t7`. Two later `instanceof t7` references make
simple unused-binding elision an unsupported explanation. These source facts and
the synthetic V8 test do not identify the historical connected `leaf:null`
failure or prove the application's V8/runtime state. The new fixed stage/reason
labels are diagnostic; acceptance remains unchanged.
Malformed CDP envelopes and side-effect exceptions retain only the fixed
`decode` / `reply` label and the existing reply-error message. Exception text is
neither read nor retained, and a caller-created Error with that message cannot
manufacture the issuer's failure detail.
