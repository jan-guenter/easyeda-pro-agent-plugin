# Current symbol validation: clock and actor follow-through

## Current result and correction

The 033309 disposable run passed the previous historical-clock failure point.
It then stopped before metadata dispatch because the selected account had no
matching row in the project's historical `users` table. The only row belonged
to the imported library, not the selected actor. This was an unsupported case,
not evidence of ambiguous account selection.

The pinned native history producer keeps the request's actor UUID and emits
empty display names when the project-user lookup finds no row. The maintained
full-SQL comparator already predicts this behavior. Candidate
`0.3.0+codex.20261017043703` adds that explicit branch to the actor wrapper:
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
Both kinds keep their existing checks. Actual permission, mutation, post-clock,
closed SQL and reopened-content verification remain live work after installation.
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

## Other changes in this update

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
results are recorded in AGENTS.md when completed. The correction is not yet a
connected successful writer lifecycle. No normal writer is enabled.

1. Publish and install the reviewed update, then use a fresh Codex session.
2. Run one new disposable forward/inverse symbol-metadata lifecycle through
   complete closed SQL comparison and reopened saved-content verification.
3. Only after reviewing that evidence, register the separate ordinary
   forward-only route. Keep the older generic writers blocked.
4. Continue the documented schematic/PCB native structure completion, geometry,
   component-library and manufacturing-export backlog. The API inventory still
   contains 774 distinct methods; this update adds no public execution route.

Production designs and their records remain untouched.
