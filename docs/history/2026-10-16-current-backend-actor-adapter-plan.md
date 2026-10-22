# Backend actor evidence for a closed-session writer

Research date: 2026-10-16. This is an implementation plan, not a new executable
route or writer admission. It uses installed sources as inert text. No live
tool, application launch, project, user/license database, runtime state or
compatibility pin was accessed or changed.

## Decision

Do not add a `/api/user` diagnostic merely to increase coverage. A fixed call
is technically possible without evaluating APP code or reading a private
database, but it adds a customer-code network request and shared bookkeeping
without proving the actor of the intended transaction. Its cost is a new
effectful lifecycle, not just three returned fields.

The useful next implementation is a separately versioned, whole-closed-session
symbol metadata contract. It can use normal close, original root/Job termination
and complete closed SQL/native comparison as its end-of-producers boundary.
It need not wait for an unavailable structure-timer drain before closing.
Missing intended persistence must fail after closure, never become success or
permission to retry. Before any reopening, a fresh admitted generation must
exclude the dead generation's persistent upload replay.

For actor attribution, retain one exact expected actor before dispatch and
check the backend-generated result against it. Do not learn an arbitrary actor
from the changed file. This supplies a transaction-specific postcondition, not
a prospective guarantee that the backend will select that actor. Keep those
contracts separate. Startup effects, clock qualification, complete inverse and
failure recovery remain independent requirements.

## Primary sources

Offsets below are zero-based UTF-16 string offsets, not byte offsets. The first
four installed files were rehashed during this investigation. The application
package is `3.2.206.715d940d`; its API and UI asset versions are separate.

| Key and installed source | Bytes | SHA-256 |
| --- | ---: | --- |
| [APP](</mnt/c/Program Files/easyeda-pro/resources/app/app.js>) | 2657192 | `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c` |
| [UI](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-ui/3.2.196.26ed3d6c/js/ui.js>) | 17456671 | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |
| [API](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-api/0.3.50.ab46409c/api.js>) | 1964920 | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` |
| [SW](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-sw/0.1.10.19da4d8e/sw.js>) | 87797 | `1871fa93a1c1b18aec1bf25a830fd96388c2ac40053e3d01f6b98209670e0f78` |

WORKER is
[`assets/pro-mgr/3.2.184.355087e9/js/project-worker.js`](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-mgr/3.2.184.355087e9/js/project-worker.js>),
2181284 bytes, rechecked pinned SHA-256
`b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928`.
Its relevant bodies were read here. The prior
[writer completion review](2026-10-15-current-writer-completion-research.md)
and [startup premises review](2026-10-16-current-startup-premises-research.md)
retain the broader source chain. This note does not repeat that review.

Repository sources were inspected at main
`63453740b02b46519fb0e7b3dea109a2c7b4ec1d`.
The unchanged [SQL comparator](../../plugins/easyeda-pro-control/server/src/symbol-sql-comparator.ts)
has SHA-256 `9f1901a9813a669e7ae7edc17bfaf0dd7e65b19722ed1d332c4fd7d4d7a5f33d`.
The [dual actor projection](../../plugins/easyeda-pro-control/server/src/symbol-dual-actor.ts)
has SHA-256 `9925698c9dacc0ede6b7cb41214ac9d66c5fb7df2576fdecdf6281b26cbad3e4`.
These identify source, not a live receipt.

## Why the actor endpoint does not finish the job

APP `protocol.handle` at 2629794 sends `https://client` requests to its local
router through `interceptHttpProtocol` at 2630484. The fixed `/api/user` route
is registered at 2621374. APP `xC` at 2630578 does not redirect that specific
host/path to an online host. Thus a fixed same-origin renderer request can reach
the endpoint without an APP evaluator. No caller URL, headers, path, code or
method should ever be accepted by such an adapter.

The native actor source is still effectful:

- `rC` at APP 2573782 retains the license result once for that middleware
  lifetime. `eC` at 2574653 selects its username from the shared user database
  on every request and may insert a missing row. Main-process continuity is
  not a lock on the shared user row.
- `T0.getByUuid` at 2220445 reads the full row and deletes only the password
  field from the projected object. The handler at 2478354 also parses stored
  preferences. The adapter must not expose that full response.
- `np` at 2477979 calls the configured online service's
  `/api/client/cascode?customerCode=...` on a cache miss. EasyEDA's default
  service assignment is at 1333182. The identifier comes from the license;
  the bridge must neither fetch it separately nor echo it. Configured service
  and proxy behavior remain native application effects.
- `l0` at 1359741 does not abort its request when its timeout wins. Its later
  response-body parser is unbounded. A successful local response can follow
  the caught network timeout while that outbound request still exists.
- `lC` at 2580567 wraps the result and can log the complete native body at
  debug level. Keeping the bridge projection small does not suppress those
  native logs or remove the network disclosure.

The public [environment getter](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_environment.getuserinfo.html)
returns optional user fields. Installed API 1803246 implements it as an
extension cache read, not a new backend request. The public
[request method](https://prodocs.easyeda.com/en/api/reference/pro-api.sys_clienturl.request.html)
requires external-interaction permission and returns a Fetch response.
Installed API 1616346 defaults to following redirects and offers no total
backend-cancellation guarantee. Neither public contract claims transaction
actor attestation.

If a later task specifically needs this diagnostic, the minimum safe design
is a fixed `GET https://client/api/user`, a one-shot durable intent in the
original admitted session, explicit shared-bookkeeping/network effect
acceptance, and a bounded renderer projection of `uuid`, `username` and
`nickname` only. Use the existing 32-hex UUID and 1024-code-unit name limits.
Bound raw response consumption before JSON parsing, redact all native error
text, and keep response bytes out of bridge artifacts. A renderer abort or
deadline must leave backend lifetime uncertain; normal owned process closure
is the retirement path, never a retry. No cache warming or direct user DB read.

A fixed raw Fetch implementation would also have to retain its native
receivers and refuse a controlling service worker, as the maintained upload
cache reader already does. SW 85321 has an optional proxy branch before normal
request fallthrough, so same-origin URL syntax alone is insufficient producer
binding. Do not bypass extension external-interaction permissions to obtain
this route. These are requirements for an omitted adapter, not implemented
support or a reason to change the successful 24-phase baseline history.

## What the intended transaction actually returns

APP `createProjectHistory` at 2604081 calls `L3` before invoking
`saveProjectHistory`. `L3` at 2602467 uses `ctx.user.uuid`, reads the matching
username/nickname from the target project's users table, and prepends an
`EDIT_HEAD`. Missing target names become empty strings. It does not take the
system-user names from `/api/user`.

`saveProjectHistory` at APP 2594412 commits the history transaction, then awaits
`xB` at 2601108. The latter writes the same request actor into
`projects.modifier_uuid`, along with its local-calendar timestamp. It updates
all project rows; the existing comparator therefore requires exactly one.
The successful handler returns only the history UUID produced by `bB` at
2599064 or `OB` at 2599367. It does not return actor or timestamp attestation.

WORKER `uploadCloud` at 2022843 obtains that UUID at 2023544. It starts cache
cleanup and synchronization in detached continuations, then returns only
success to its caller. Failed native responses can trigger up to three
attempts. An agent's one-shot mutation request is not a promise of one backend
HTTP attempt. The `localSave` cache stores the pre-APP upload text, so it does
not supply the server-added actor header either.

There is consequently no existing public mutation reply to promote into an
actor receipt. Do not monkeypatch the native request function or install a
global interceptor solely to obtain one. The backend-added `EDIT_HEAD` in
the original closed history is the available transaction-specific evidence.

## An exact post-transaction actor policy

The current SQL comparator already separates caller-supplied comparison bounds
from issued authority. Its preparation at lines 235 onward accepts an expected
actor UUID; lines 319 onward resolve that UUID's project names from the before
inventory. Verification requires the complete plaintext and
`projects.modifier_uuid` to match those exact expected values. Every other SQL
cell, row, schema descriptor and selected native record remains accounted for.

A new wrapper can use that unchanged exact comparison without pretending the
expected UUID was already observed inside APP:

1. Before dispatch, retain the agreeing dual UI actor projections, original
   owned generation, exact operation and original before inventory. Select one
   expected UUID then. For the first profile, require exactly one matching
   project-users row rather than accepting the missing-row empty-name case.
   Treat UI names and project names as separate producers, not interchangeable
   strings. A current UI identity is a selection policy, not backend proof.
2. Freeze that expected UUID and the corresponding original project names in
   the original non-serializable preparation. Never take them from an after
   snapshot, user-supplied witness JSON or a set of possible actors.
3. After the one intended mutation, owned normal closure and complete closed
   comparison, require the sole added chunk's actor and project modifier to
   equal the frozen UUID. Require the existing exact names, header/body,
   document ticket, structure ticket, history linkage and collateral checks.
   An unexpected actor fails the whole operation even if geometry is correct.
4. Report `transactionActorMatchesExpected:true` only for that completed
   operation. Keep `backendActorPreverified:false` and
   `futureRequestActorVerified:false`. Do not mint reusable account authority.

This is stronger evidence about the actual transaction than an earlier
`/api/user` sample. It is weaker at prevention: an account switch between the
UI selection and backend dispatch could cause an already-persisted unexpected
attribution before refusal. It is suitable only for a deliberately reviewed
postcondition contract on the disposable local metadata operation. It cannot
replace a requirement that a particular account be authenticated before a
cloud action, purchase or account-sensitive write. The normal trust model
still excludes malicious replacement of the entire application/evidence tree;
unkeyed hashes are not signatures against such an attacker.

The next module can be `server/src/current-symbol-transaction-actor.ts`, an
internal original-plan wrapper around the existing SQL preparation and
verification. It should not be a public actor tool. Store the selected actor,
original inventories and lifecycle bindings in an internal WeakMap. Its result
must depend on its own successful full comparison, not a supplied
`exactLogicalSqlEffect:true` object. Keep the legacy comparator and existing
authority flags unchanged. This module alone cannot enable the writer.

## Whole-session completion is a feasible boundary

The absence of a structure-timer drain does not force an endless idle check.
If all relevant producers belong to the original retained root/Job, original
root exit plus an empty retained Job establishes that those producers can no
longer run. A complete closed-file intended-effect comparison can then prove
whether their final persisted output is exactly the intended one. It does not
need to observe every internal timer being serviced.

Use a new whole-closed-lifecycle profile with this precise scope:

1. Retain the initial closed SQL/native baseline and source continuity through
   the owned project-only startup. Exclude or explicitly model startup effects
   separately. The existing active-page observation exception is not a writer
   prerequisite. Do not silently count a startup repair as part of the edit.
2. Dispatch one exact closed ordinary-symbol name/description change. Keep
   tags, source, all other records and peer documents fixed. Consume the intent
   before dispatch. No explicit Save, forced exit or persistence suppression.
3. Request normal application close once. A prompt, timeout or missing effect
   leaves a failed/incomplete operation. Observe original termination through
   retained handles; never adopt a PID or reconstruct authority from JSON.
4. Read the closed result only after that proof. Require the complete existing
   SQL/native effect model, including all project rows and structure rows.
   A lost structure timer produces a missing ticket effect and fails. An extra
   native retry can produce another chunk or structure row and fails. Neither
   outcome is repaired by another Save or repeated mutation.
5. Before reuse, retain the final file hash and launch a fresh owned generation
   at Start Page. Use the fixed inactive-target cache absence check for both
   branch upload namespaces before opening the project. A leftover upload
   entry blocks reopening; do not drain, delete or replay it as verification.
   Only after this exclusion and fresh source continuity may the saved-result
   reopen and full comparison proceed.
6. Validate the requested-field inverse as its own one-shot transaction and
   complete closed lifecycle. New history bookkeeping is expected; inverse
   success means restored intended metadata, not original SQLite bytes.

The existing source confirms the two replay namespaces and the later upload
cleanup. The maintained cache reader checks both without creating a cache or
reading its bodies, under target absence and no controlling service worker.
It is sequential evidence, so the new coordinator must retain the exclusive
generation/target premises through the open. A sample taken before the write
cannot replace this post-termination replay check.

There is one real process-scope limit. The maintained Windows policy explicitly
excludes outside-Job brokers, services and unreviewed delegation. See
[`windows-authority.ts`](../../plugins/easyeda-pro-control/server/src/windows-authority.ts)
at lines 418 through 426 and
[`windows-runtime.ts`](../../plugins/easyeda-pro-control/server/src/windows-runtime.ts)
at line 413. Job termination alone cannot claim those are dead. The fixed
symbol/history/structure paths reviewed here use the local APP handler and
SQLite, but their full native execution-scope proof is not issued by this note.
Before enabling the new contract, qualify that specific route against the
existing execution-scope policy. If it delegates to an uncontained producer,
either bind that producer explicitly or refuse this profile. Do not demand an
unavailable generic queue barrier when the relevant route has already been
proved contained.

The implementation order is therefore the original-plan actor wrapper, a
versioned whole-closed-lifecycle coordinator with post-termination replay
exclusion, then one forward/inverse disposable validation. Keep the existing
24-phase baseline analyzer exact; a writer lifecycle needs its own event
profile and checker. This note does not authorize weakening the actor guard,
changing completion claims or enabling the dormant writer today.

The research and extension-development skills kept the recommendation tied to
the installed producers. No implementation, tests, live validation, publication
or installation was performed by this task.
