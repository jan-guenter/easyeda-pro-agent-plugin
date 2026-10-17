# Current symbol validation: metadata dispatch and referenced-symbol scope

## Current result and correction

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
results for 072500 are recorded in AGENTS.md as they complete. No connected
successful writer lifecycle or normal-writer enablement is claimed.

1. After publication and installation, use a fresh Codex session with independent
   installed-runtime admission before any live call.
2. Run one new disposable forward/inverse lifecycle on an unused symbol through
   complete closed SQL comparison and reopened saved-content verification.
   Do not replay or invert the stopped 043703 operation.
3. Implement and validate referenced-symbol propagation separately, including
   dependent-page loading and its complete source and SQL effects. The current
   update deliberately omits this capability.
4. Review successful connected evidence before registering the separate ordinary
   forward-only route, with its exact supported scope. Keep the older generic
   writers and generic library symbol modification blocked.
5. Continue the documented schematic/PCB native structure completion, geometry,
   component-library and manufacturing-export backlog. The API inventory still
   contains 774 distinct methods; this update adds no public execution route.

Production designs and their records remain untouched.
