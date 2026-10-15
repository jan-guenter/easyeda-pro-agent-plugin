# Current symbol writer clock and actor research

## Result

The fixed `/pro-mgr/serverTime/now` handler reads a wall clock and a private
offset. The current root renderer reaches it through `gVars.concurrentBus`,
not `gVars.messageBus`. The internal closed-target metadata collector now adds
four matching worker client/ticket pairs, four notify-clock samples bracketing
two metadata samples, and a dual UI actor observation. None of those scalar
values proves backend actor identity,
an operation-owned write baseline, or persistence completion.

A separate current pure SQL profile now models DOCHEAD time, backend EDIT_HEAD
time, SQLite history timestamps and the project's local timestamp explicitly.
It requires the current `3.2.206` DOCHEAD transition and keeps document-clock
bounds separate from backend-clock bounds. The legacy entry point retains its
previous contract. An internal owned-baseline stage now transfers the original
opening owner through one normal close into a fresh checkpoint, raw copy and
complete SQL inventory. That closed evidence is not yet a before-write baseline
for a later opening. None of these stages enables a public writer.

This research read installed application code as inert text and existing plugin
source. The only machine-profile field read was `easyeda.assetsRoot`. It did not
read a project, user database, license or production record, and made no live
EasyEDA call. The SQLite date contract below was checked in its official
documentation. The implementation statements below reflect review of the
concurrent plugin changes; this research subtask changed only this note. No
live execution, permission broadening or new writer validation is claimed.
The parent release record records automated test results separately.

## Source identities

Paths are relative to the selected installed `resources/app/` directory.
Offsets are zero-based UTF-16 JavaScript string offsets. The files were hashed
on 2026-10-15. The application package is `3.2.206.715d940d`, with editor
version `3.2.206`; the separately versioned UI and manager remain as listed.

| Key | Relative path | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| APP | `app.js` | 2657192 | `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c` |
| UI | `assets/pro-ui/3.2.196.26ed3d6c/js/ui.js` | 17456671 | `3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a` |
| MGR | `assets/pro-mgr/3.2.184.355087e9/js/pro-mgr.js` | 2196400 | `005584e02cd9b2d49fdb387b2f997c1c8d3f88b0c48a7531c8097c483ed0bd2e` |
| WORKER | `assets/pro-mgr/3.2.184.355087e9/js/project-worker.js` | 2181284 | `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` |
| WS | `assets/pro-mgr/3.2.184.355087e9/js/ws-service.js` | 855142 | `7a372d7271225999c3d16bcef1cd91c0fa2d3a1a402ebcf9761442ecf3187453` |
| PRELOAD | `assets/pro-mgr/3.2.184.355087e9/js/preload.js` | 875163 | `c09bc7ab6b88e8fa8fbbb3d72da3487785491171ec2a3863f8a5f7f45c0bd1d5` |

These are source-review identities, not a replacement compatibility manifest.
PRELOAD is included because it owns the root namespace's initial creation.

## Clock call and offset lifetime

| Source offsets | Producer or binding |
| --- | --- |
| PRELOAD 870223–870464 | `Sf` obtains eight random bytes and formats sixteen lowercase hexadecimal characters. The ordinary root page assigns `_TAB_ID_` when its search string has no `entry=`. |
| UI 15785038 | `GQ(name)` returns `self[name]`, creating a `BroadcastChannelMessageBus` only if absent. |
| UI 16957258 | `gVars.concurrentBus` receives `GQ('/' + window._TAB_ID_ + '/notify')`. |
| WS 851427–851621 | `Xd` uses the same named `self` cache. `Ji` selects that notify namespace, `Jd` starts at zero, and the fixed server-time handler returns `Date.now() + Jd`. |
| WORKER 1711153–1711260 | Symbol time helper `qe` calls the fixed topic through the project's `_TAB_ID_` notify namespace. |
| WS 64854–65600 | Mode flags come from the module's initial `PRO_EDITOR_MODE` string split on `-`. `IS_CLIENT` requires `CLIENT`; `IS_ONLINE` requires the exact `ONLINE` token. |
| WS 851251–851379; 853221 | `Bd` is `IS_CLIENT && !IS_ONLINE`. The module calls its websocket initializer only when `Bd` is false. |
| WS 851685–853237 | The initializer opens `/api/ws/notify`, pings after inactivity, reconnects after a close and receives pong messages. |
| WS 853123 | A truthy `serverUTCTime` in a pong replaces `Jd` with `serverUTCTime - Date.now()`. There is no round-trip correction or type/range check in that assignment. |
| APP 2578439–2579760 | `sC` injects the client mode and editor version into both page and worker entry responses. |

The clock handler itself has no project lookup, Save, storage write, clock
synchronization request or callback registration. Its RPC transport is still an
asynchronous boundary and must use the retained receiver and fixed topic.

The whole WS source has exactly three references to this `Jd`: initialization,
the handler read and the pong assignment. The reviewed offset has no storage or
restore path. A fresh WS module initialized in either accepted client offline
mode therefore keeps zero offset on this source path. This is a conditional
source conclusion, not proof supplied by a later clock response or by merely
observing the renderer's current mode. Do not label it a separately retained
Worker without proving that lifecycle. The source examined here establishes a
module closure and notify namespace, not an independent native handle.

The implemented observation-only collector retains `root._TAB_ID_`, requires
its named notify cache object to equal `gVars.concurrentBus`, and retains that
object and the resolved `rpcCall` method binding across every await. It also
rechecks the current project/branch, tab, active frame, sampled closed-target
DOM and authenticated opening generation. The internal collector pins WS before
and after collection; public metadata reads retain their existing pin set and
result shape. The fixed topic accepts no caller arguments. Each of the four
clock samples must contain safe nonnegative integer milliseconds, with server
time between its renderer-before/after values. Samples must be nondecreasing
and their entire observation span cannot exceed ten seconds. Renderer clock
samples remain distinct fields. These observations grant no lock and do not
prove the future APP clock or ownership of the clock-producing module.

## UI observations and backend actors

UI `zZt` at 16470169 fetches the user response. Its success branch calls
`setUserInfo` before awaiting preference initialization, then assigns the full
response to `gVars.loginedUserInfo` at 16471483. `setUserInfo` at 16478841
creates the separate cached `globalVariableCookieData.userInfo` object;
its nickname normalization is `nickname || ''`.

That is not a one-time-only producer. Initial document readiness invokes
`zZt` at UI 16958891, but login handling invokes it again at 16483005.
`qge` at 12810318 can independently replace cached `userInfo` through
`setUserInfo`. The fixed `/pro-ui/loginUser/get` service at 16957385 projects
`loginedUserInfo`, not the cached object. Observing matching values cannot prove
that no replacement or account transition happened before the observation.

The implemented collector retains both objects and copies only own data
properties `uuid`, `username` and `nickname`, with strict bounds. It accepts
only string nicknames in both source objects, including the empty string;
it deliberately rejects null or absent nicknames rather than broadening its
contract to every input accepted by the native `nickname || ''` normalization.
Object identities and exact fields are rechecked around every await.
The result is a dual UI actor observation issued during the retained opening
generation, not startup provenance. The current opener binds the
original engine, runtime, launch, session and journal, but did not capture these
actor objects before navigation. A JSON copy cannot recreate that original
generation. See the existing
[owned preparation](../plugins/easyeda-pro-control/server/src/current-symbol-owned-preparation.ts)
and [generation issuer](../plugins/easyeda-pro-control/server/src/current-disposable-open-runtime.ts).

Backend EDIT_HEAD uses another chain. APP `rC` at 2573782 retains a license
result in its middleware closure. `eC` at 2574653 looks up the system user by
that username, inserts a missing row if necessary, then attaches the selected
user to the request. `T0.login` at 2220292 selects UUID, username and nickname.
APP `L3` at 2602467 looks up that request UUID in the target database's users
table. It emits the request UUID with that database row's username/nickname,
or empty names if the row is absent. UI display names need not equal those
target-database names. Keep target-database correlation separate from the UI
projection, and leave backend actor verification false until its actual
operation-owned proof exists.

Do not fetch `/api/user` to manufacture that proof. Its shared middleware can
perform the user insert just described, while APP 2478354 also parses stored
preferences and obtains a distinct ID. The route is not a passive actor probe.

Fresh symbol child DOCHEAD user has its own constructor behavior, documented
in [the prior preparation research](current-symbol-owned-preparation-research-2026-10-15.md).
Do not replace its source-derived omission with the UI UUID or backend actor.

## Current timestamp and history contracts

| Stored effect | Current producer | Required interpretation |
| --- | --- | --- |
| DOCHEAD `updateTime`, `version` | WORKER 1937501 metadata update obtains `qe()` time. | Document-clock milliseconds; version is that value as a string when `keepVersion` is false. |
| DOCHEAD `editVersion` | WORKER `xt` at 241441 uses current `PRO_EDITOR_VERSION` without an explicit override. | Current `3.2.206`, not necessarily the baseline header's version. |
| EDIT_HEAD `updateTime` | APP `L3`, 2602467. | A separate APP `Date.now()` value obtained while prepending the upload record. |
| New history head and `history_data` timestamps | APP `bB`, 2599070, and `DB`, 2600819, omit explicit timestamp fields. Their schema defaults are at 2232389 and 1256645. | SQLite `datetime('now')`, UTC text with whole-second precision. |
| `projects.updated_at` | APP `xB`, 2601114, calls `So(Date.now())`; `So` is at 1284194. | Local calendar text from APP year/month/day/hour/minute/second getters. |

SQLite documents that `now` comes from the active VFS clock and uses UTC;
values are stable within one `sqlite3_step`, not across separate statements.
`datetime` returns whole-second text unless a subsecond modifier is requested.
These source defaults contain no such modifier.
[SQLite date functions](https://www.sqlite.org/lang_datefunc.html).

`saveProjectHistory` at APP 2594406 selects between a new head and another
chunk in the old head. `hB` at 2596387 reads the current head and computes
`floor((APPNow - parsedHeadTime) / 1000) <= 60`. Its `rl` helper at 1322261
parses the SQL literal using native `Date`, then subtracts the *current*
timezone offset. A new head requires an absent head, a locked head, or a false
age predicate. For an existing unlocked head, a bound of merely more than
60,000 milliseconds is insufficient because the native comparison floors to
whole seconds. The entire possible APP selection interval must be at least
61,000 milliseconds after the exact adjusted parse. Do not infer this from a
worker timestamp alone, or from a caller's parsed date.

For the new-head branch, `bB` creates a random head ID/key, stores the encrypted
chunk, inserts the head and updates the branch pointer through `D4`. `xB` then
updates project metadata with `WHERE 1=1`, not a UUID-filtered row. A bounded
single-project comparator must require exactly one project row beforehand and
reject unrelated table changes. The existing whole-inventory comparison is
needed even when source geometry is unchanged.

## Implemented baseline and remaining writer work

The internal collector's strict `runtimeObservation` schema carries the actor,
editor version and four clock samples. Its `backendActorVerified`,
`backendClockVerified` and `clockProducerOwnershipVerified` fields are literal
false. The separate client/ticket observation records four identical pairs;
neither observation is exposed by the public metadata result. There is no
arbitrary RPC entry point or write authority in this change.

The current pure SQL planner uses its own original-object plan registry. It
checks exact native header/META serialization, the fixed current editVersion,
separate document/backend intervals, and full peer/table equality. Its producer,
generation-closure and persistence provenance flags remain false. Pure comparison
proves a supplied input relation, not that the inputs came from an owned live
operation. No collector-to-writer integration has been implemented.

Three current-specific modules now implement the internal owned-baseline stage:

1. The [opening coordinator](../plugins/easyeda-pro-control/server/src/current-disposable-open-runtime.ts)
   reserves the original Job before the first await and refuses a reused retained
   baseline operation ID. It prepares fresh closed-target observations in the
   original authenticated session, then transfers the original generation into
   a privately issued baseline owner. The opening journal stays unchanged.
   Subsequent preparation or non-inspect opener actions cannot reuse that Job.
   Ordinary generation and dispatch rechecks also reject a reservation acquired
   after their entry checks; already-dispatched work is never replayed.
2. The [baseline coordinator](../plugins/easyeda-pro-control/server/src/current-symbol-baseline-runtime.ts)
   creates a separate journal and captures genuine
   `engine.captureClosedSessionAuthority` inside the same authenticated scope.
   It retains the actual capture before fallible checks or scope settlement,
   checks the exact root/Job and session, and publishes the capture result.
   After leaving the scope, it observes the exact HWND, records one normal-close
   intent and its consumed attempt, and requests close once. It retains the
   acknowledgment before later checks. It does not choose Save or Discard.
3. The same coordinator uses the runtime's genuine termination probe. Only
   source-qualified native liveness refusals yield pending observations and
   permit another probe. A terminated observation carries the original branded
   proof. Missing acknowledgment, generic errors or lost ownership do not permit
   close replay or turn into termination evidence. After close, owner validation
   checks the retained opening, runtime and journal without reconnecting or
   requiring the former session to remain active.
4. The [closed-copy stage](../plugins/easyeda-pro-control/server/src/current-symbol-baseline-copy.ts)
   checkpoints the original disposable path at its new closed hash, copies its
   raw bytes under the retained closure proof, and reads the complete SQL
   inventory. It binds checkpoint/copy file identity, checks the exact
   project/branch/owner and undeleted PCB, and repeats symbol metadata preparation
   against the fresh checkpoint and retained observation. Acquired evidence is
   retained before later checks. The separate VACUUM checkpoint supplies native
   history and metadata evidence; the raw copy supplies the full SQL baseline.

The baseline result keeps `beforeWriteBaselineVerified`, `openingEffectsVerified`,
`writerReady` and `executionAuthorized` false. Its journal completion means the
closed-baseline capture finished, not that a design mutation persisted. The
original handles and proof stay in memory; disk projections cannot recreate
them after restart. No public baseline or writer route, explicit Save, relaunch
or connected validation was added by this implementation.

A historical closed copy is not a before-write baseline after a future ordinary
opening. A writer needs a fresh retained launch/authentication/opening generation,
plus a model and check
of that opening's SQL effects before any old copy can anchor its write. Repeating
open/close cycles does not establish that relation. The original current opener
also retains only a launch projection; later writer work must retain the genuine
runtime launch object for launch-bound clock evidence.

Backend actor/clock evidence and actual APP timezone/history-age qualification
remain necessary before dispatch. Subsequent internal work adds one-shot owned
relaunch, old-capture release, new-session admission and one tracked inactive-cache
observation; see the
[reopening checkpoint](current-reopen-effects-research-2026-10-15.md#implementation-checkpoint).
Writer and inverse integration and recovery from stopped or lost-owner baseline
stages remain unfinished. Release or relaunch invalidates current copy authority;
neither action may happen before the closed evidence has been captured and
published. A later disposable forward/inverse case must prove owned close,
process/Job termination, whole-file SQL effects and fresh-generation readback.
Notify-clock qualification does not drain the separate structure timer or upload
cache described in the
[writer completion research](current-writer-completion-research-2026-10-15.md).

The remaining concrete unknowns are the operation-owned APP actor/clock proof,
subsequent opening effects, fresh closure ownership across a writer dispatch,
and the full persistence/inverse lifecycle. The implemented closed-baseline stage
still needs connected validation as part of one complete disposable lifecycle.
This note does not enable the writer or add live validation evidence.
