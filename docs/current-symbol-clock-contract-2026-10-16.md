# Timestamp contract for the current closed-session symbol writer

Research date: 2026-10-16. Source-only recommendation for a new versioned
contract. No live call, application launch, project/user/license database read,
code change or test belongs to this task. The actor implementation is unchanged.

## Recommendation

Use precommitted, producer-specific timestamp windows and an exact closed-result
postcondition. A passive APP-clock endpoint is not required. Under the explicitly
accepted common-Windows-clock assumptions below, source-qualified APP and SQLite
timestamps can be checked against independently issued Windows observations.
The document clock remains separate because its value comes through notify RPC.

Keep both comparator windows at most 60,000 ms. Do not make the entire operation,
later evidence hashing or closed-file comparison fit in 60 seconds. That limit
belongs to generated timestamp values. A late closed observation can still test
values against the original windows. It cannot enlarge them or retrospectively
prove that termination occurred within them. This is a new contract, not a change
to the old `entireJobExitedWithinOriginalWindow` contract.

The useful next implementation is an original, one-shot clock plan owned by the
new writer coordinator, with fresh sampling at its final dispatch boundary.
It must derive success by running the maintained complete SQL comparison, not
by accepting a caller's timestamp-success flag. Keep direct-APP-attestation,
continuous-clock-stability and future-write-clock claims false.

## Sources and exact producers

Installed paths below are relative to
`/mnt/c/Program Files/easyeda-pro/resources/app/`. Hashes were rechecked here.
Offsets are zero-based UTF-16 string offsets into the minified file.

| Key / relative path | Bytes | SHA-256 |
| --- | ---: | --- |
| APP, `app.js` | 2657192 | `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c` |
| WORKER, `assets/pro-mgr/3.2.184.355087e9/js/project-worker.js` | 2181284 | `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` |
| WS, `assets/pro-mgr/3.2.184.355087e9/js/ws-service.js` | 855142 | `7a372d7271225999c3d16bcef1cd91c0fa2d3a1a402ebcf9761442ecf3187453` |
| SQLite source archive, `node_modules/sqlite3/deps/sqlite-autoconf-3340000.tar.gz` | 2930085 | `bf6db7fae37d51754737747aaaf413b4d6b3b5fbacd52bdb2d0d6e5b2edd9aee` |

The archive was streamed as text without extraction to disk. Its
`sqlite-autoconf-3340000/sqlite3.c` has SHA-256
`0f4a3ee8391f129d9f2829ecad1d3b29a4ae79029046436cc71efc636afdca72`.
This source supports the vendor-runtime assumption; it does not reproducibly
attest the installed addon. Exact runtime dependency admission remains the
separate work described in the [producer-scope note](current-symbol-producer-scope-2026-10-16.md).

| Stored value | Actual producer and consequence |
| --- | --- |
| SYMBOL `DOCHEAD.updateTime` and `version` | WORKER `updateData` at 1937926 awaits `qe`, sets `updateTime=h` and normally `version=String(h)`. `qe` at 1711153 calls the tab's notify bus `/pro-mgr/serverTime/now`. Require the ordinary no-keepVersion path. |
| Notify scalar | WS 851550 initializes `Jd=0`; service 851590 returns `Date.now()+Jd`. Only its pong handler at 853123 assigns a server offset. Mode initialization at 64892 and `Bd=CLIENT&&!ONLINE` at 851365 make the terminal `Bd||Kd()` skip websocket creation in the reviewed offline modes. Samples are still observations, not direct access to that closure. |
| `EDIT_HEAD.updateTime` | APP `L3` at 2602467 constructs this value with its own `Date.now()` at 2602792. It does not reuse the notify value. |
| `projects.updated_at` | APP `xB` at 2601108 passes `Date.now()` through `So` at 1284194. `So` uses local calendar getters and drops milliseconds. The history handler awaits this update after its history transaction. |
| New history/chunk `created_at` and `updated_at` | APP history-data schema at 1256645 and project-history schema `Or` at 2232389 use `datetime('now')`. `DB` at 2600813 and `bB` at 2599064 omit these columns on insertion, so SQLite supplies them. These are UTC whole seconds, not APP local calendar strings. |

SQLite documents that `now` comes from the active VFS clock, uses UTC, and is
stable within one `sqlite3_step`; it does not promise equality across distinct
statements. [SQLite date functions](https://www.sqlite.org/lang_datefunc.html).
The bundled Win32 VFS calls `GetSystemTimeAsFileTime` at `sqlite3.c:47813`.
The installed addon source `src/database.cc:166–171` passes a null VFS selector
to `sqlite3_open_v2`. Do not turn those source facts into an independent
attestation of the compiled vendor binary or require all four SQL fields equal.

ECMAScript defines `Date.now` as the UTC time of its call. It does not promise
an unchangeable clock or identical host implementations.
[Date.now specification](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date.now).
Windows QPC measures elapsed time independently of UTC and is unaffected by
system-time changes. UTC synchronization can still change wall-clock behavior.
[Microsoft timing guidance](https://learn.microsoft.com/en-us/windows/win32/sysinfo/acquiring-high-resolution-time-stamps).

## Assumptions and the postcondition they permit

For this disposable local metadata contract, accept the normal trusted-runtime
assumption: the admitted executable, APP, worker, notify and SQLite paths execute
their reviewed code with ordinary Date/VFS implementations. The retained original
Job owns their lifetime. No injected Date override, replacement notify responder,
custom VFS, process-specific timezone override or other target-file writer is
allowed by that profile. A Job proves containment, not those semantics by itself.

Require clocked owned launch with inherited `TZ` absent; unchanged original
helper/Job/session; consistent Windows timezone-rule hash, current UTC offset and
QPC frequency at the relevant observations; and ordered UTC/QPC endpoints.
Require renderer ISO/offset checks and bounded renderer/notify agreement around
dispatch. These checks can detect contradictions. They do not prove there was
no intervening clock jump, timezone change followed by restoration, native-code
hook or transient responder replacement. Explicitly retain the assumption of
stable OS wall-clock/timezone behavior over this operation. Do not change Windows
time synchronization, environment or timezone settings to manufacture it.

This is enough for a conditional, exact persisted-value claim. It is not enough
for `appClockDirectlyObserved:true` or `continuousClockStabilityProved:true`.
Observed UTC and QPC elapsed ranges may be reported separately. Do not invent a
calibrated agreement tolerance or label their endpoint ordering a clock lock.

## Collection order that avoids stale windows

1. Finish expensive source admission, startup qualification, full baseline/native
   checks, history-head selection, actor selection and fixed-program compilation.
   Keep the original generation and baseline identities. For an unlocked head,
   collect the current-source date-parsing evidence described below now.
2. Enter the final authenticated, journaled one-shot dispatch scope. Complete its
   expensive owner/source/journal checks before sampling the write window. Existing
   `markOrphanedCallRisk` samples a capture and then awaits another runtime-identity
   probe. Its earlier clock is unsuitable if that later work takes minutes.
3. Obtain a fresh original supervisor-issued Windows sample `W0`, bound to this
   exact operation, capture, Job and helper. Collect a fixed renderer/notify sample
   `N0` with its surrounding renderer Date values, retained tab/bus/method identities
   and offset, then another issued Windows sample `W0b`. Require the renderer and
   notify values inside this independent Windows bracket, with a bounded collection
   duration. `W0` alone does not bracket a later RPC. No APP evaluator or request
   is needed. Preserve the declared common-clock assumptions.
4. Freeze two separate windows before mutation and before any after-file data.
   A simple fixed policy is `backendMin=floor(W0.lowerUtcTicks/10000)-epochMs`,
   `backendMax=backendMin+60000`, and `documentMin=N0.serverTimeMs`,
   `documentMax=documentMin+60000`. Here `lowerUtcTicks` is the selected sample's
   `utcBeforeTicks` and `epochMs=62135596800000`. Never union these windows or
   subtract a discovered after-result skew. Record the exact selected sample.
5. Prepare the unchanged current SQL comparator with those bounds and the frozen
   actor selection, then persist the exact clock-plan/dispatch intent. Keep this
   bounded work inside the armed interval. Perform the final target/receiver and
   clock-deadline checks in the fixed compiler immediately before its sole native
   mutation. No full historical journal scan belongs between arming and dispatch.
   If required work exceeds the interval, refuse before mutation; do not widen or
   silently resample that armed attempt. Moving checks earlier must preserve their
   existing ownership and final reproof requirements, not remove them.
6. In the same fixed invocation, collect post-mutation notify/renderer sample `N1`.
   Require ordered samples, unchanged offsets/owners and the exact intended live
   result. Obtain an independently issued Windows sample `W1` after the invocation.
   `W0b` and `W1` bracket the document operation and its `N1` sample. The ordinary
   worker return precedes buffered APP upload, so this is not an APP/SQLite
   completion barrier.
7. Request normal close once and retain original root/Job termination. Collect its
   issued Windows clock `WT`; then obtain the complete owned closed SQL/native
   result. Recheck all sampled timezone/clock relations and run the unchanged full
   comparator against the original windows. Missing effects, late generated
   timestamps, extra retry chunks and collateral changes refuse. No Save or retry.

The windows remain fixed even when `WT`, file copying or comparison occurs later.
For example, a history transaction timestamped inside the original window can be
verified minutes later. A delayed APP transaction timestamped outside that window
fails. The stored values are evidence to test, not inputs for choosing the window.
This contract does not prove all untimestamped structure work ran before the
window ended; complete final effect and genuine producer termination handle that
separate requirement. Normal closure/replay exclusion and forward/inverse proof
remain mandatory, as described in the [actor plan](current-backend-actor-adapter-plan-2026-10-16.md).

## Aged heads and exact comparisons stay unchanged

APP `hB` at 2596387 reads the selected history's `created_at`, computes
`floor((new Date().getTime()-rl(created_at).getTime())/1000)<=60`, and chooses
append versus new head. Current `rl` at 1322261 parses the literal with native
Date and subtracts the CURRENT timezone offset. This is the older `q2` algorithm
under a new minified name, not an assumed UTC parse.

Keep the comparator's exact policy: a locked head consumes no age witness; an
unlocked head requires the exact before literal, independently observed native
local parse, current offset equal to the negative Windows offset, and
`backendMin-adjustedParsedTime>=61000`. Do not lock a head merely to simplify
validation, use the historical date's offset instead of the current one, or
learn eligibility from the resulting new head. If waiting for age is needed,
wait before arming and retain/recheck the original baseline.

`historical-sql-clock.ts` still pins old APP SHA `10a42746...` at offset1317965.
Do not repurpose its result as current-source authority. A current profile can
reuse the fixed Date-control vectors and independent same-runtime scratch
reference approach, while binding the current `rl` source and original current
generation. This is a finite implementation task, not a need for an APP evaluator.
Ambiguous/DST historical parses can remain refused by the first narrow profile.

The unchanged comparator uses independent document/backend windows and accounts
for SQL whole-second precision with `floor(min/1000)` and `floor(max/1000)`.
Preserve that rule without additional timestamp slack. Its complete plaintext
checks also bind document `version`, tickets, actor, names and metadata, while
the full SQL comparison accounts for every other cell and relation.

## Concrete implementation work

- Add an internal original `current-symbol-transaction-clock` plan that retains
  issued Windows observations, the original dispatch owner, fixed raw document
  samples, frozen windows and the maintained actor/SQL plan. Its success must
  follow its own full comparison. JSON, supplied callbacks and result flags
  cannot issue provenance. Report `transactionTimestampsWithinPlannedWindows`
  with explicit assumptions, not generic `backendClockVerified` authority.
- Add a narrow fresh-clock observation to the retained Windows supervisor path
  if the existing final capture cannot provide `W0` after expensive checks. It
  should validate the already-owned capture/Job and issue a distinct clock-only
  result, with original WeakMap binding. Do not forge a capture receipt, relaunch,
  recapture/adopt a PID, or expose a general native clock/APP-evaluation tool.
- Extend the one fixed metadata compiler with pre/post notify/renderer sampling,
  immutable deadline checks and retained producer identities. The current four
  runtime samples are observation-only and lack dispatch/transaction ownership.
- Compose the retained termination clock with the new postcondition profile.
  Keep `closed-sql-clock.ts` and the baseline's descriptive clock relation intact;
  the former intentionally requires termination within its old window. The new
  writer must not mislabel a later termination as satisfying that old profile.
- Qualify current aged-head parsing before using unlocked fixtures, then validate
  one owned disposable forward/inverse lifecycle. No broader clock diagnostic,
  settings change or backend actor endpoint is needed first.

Reviewed maintained sources include the SQL comparator SHA
`9f1901a9813a669e7ae7edc17bfaf0dd7e65b19722ed1d332c4fd7d4d7a5f33d`,
`windows-clock-transport.ts` SHA
`a1866c9b81485da8aca6f71a3f68c46ddf9a415bda2bafb3df592491a167fae6`,
and `scripts/windows-authority.ps1` SHA
`fa5cff83eea61dea9a58dad282c76a2016bc7cbcb6f54dea1ef51375d9a91161`.
The helper's clock collector is at lines197–333; original issuer/lookup lives in
`windows-authority.ts`; final tracked dispatch ordering is in `engine.ts`.
The research and extension-development skills kept this recommendation separate
from current execution support. No implementation or live validation is claimed.
