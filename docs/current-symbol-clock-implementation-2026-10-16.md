# Current symbol clock implementation

2026-10-16. Internal implementation checkpoint, not new public API support or
writer enablement. This implements part of the
[timestamp contract](current-symbol-clock-contract-2026-10-16.md), alongside the
[actor plan](current-backend-actor-adapter-plan-2026-10-16.md) and
[producer-scope review](current-symbol-producer-scope-2026-10-16.md).

## Implemented

- The retained Windows supervisor can collect a fresh `owned-observation` from
  an original capture. The helper checks the original capture, helper instance,
  current Job, root and retained live process handles. It does not recapture,
  adopt a PID, launch another process or manufacture a capture receipt. Helper
  source revalidation finishes before sampling.
- `WindowsControlRuntime.observeCurrentClock` pins the supervisor methods at
  acquisition. `EasyedaControlEngine.freshClockObservationForTrackedDispatch`
  forwards the engine's original capture, not journal JSON. It checks the exact
  operation, phase, challenge, capture, recorded runtime, authenticated session,
  current dispatch lease and method identities before and after the await. No
  runtime probe, history scan, journal update or new capture follows sampling.
- A synchronous issuer check validates the original WeakMap token and current
  retained owner. It neither rehashes source nor refreshes time. Copied tokens,
  changed captures, close, release and generation changes refuse under the
  applicable observation contract. The forwarders also reject replacement
  methods. Existing asynchronous source
  checks remain available and retain their original meaning.
- `current-aged-sql-clock-controls.ts` supplies fixed renderer and scratch
  reference programs. They retain native Date and context identities, repeat the
  maintained control vectors and scan all 1,681 possible minute offsets twice.
  This first profile refuses folds, gaps and any timezone transition within that
  candidate range. `current-aged-sql-clock.ts` keeps historical and current
  offsets separate, models current APP `rl`, checks independent Windows brackets
  and requires at least 61,000 ms of head age at the selected backend window.
  These are conditional comparisons, not current-generation or scratch-owner
  issuers.
- `current-symbol-transaction-clock.ts` retains original Windows launch,
  capture, pre-dispatch, post-dispatch and termination observations. Its original
  plan freezes separate document and backend windows of 60,000 ms, with a
  10,000 ms pre-dispatch collection bound. Distinct pre/post observations,
  renderer/notify brackets, timezone rules, offsets and UTC/QPC ordering are
  checked. Reservations and post/verification attempts are consumed once.
  Success requires its own maintained complete actor/SQL comparison, not a
  caller's success flag. The final termination owner is rechecked after that
  awaited comparison.

The fresh helper action remains private. No MCP endpoint, generic clock request,
APP evaluator, metadata mutation, Save or writer coordinator was added.
`markOrphanedCallRisk` retains its existing await and journal ordering; only
additional original dispatch and method identities are retained for the new
lookup.

## What the result means

The new conditional result can report
`transactionTimestampsWithinPlannedWindows:true` after complete comparison.
It requires ordinary reviewed Date/VFS behavior, a common Windows clock with no
intervening clock/timezone change, and no other target-file writer. It does not
prove those assumptions continuously or directly observe the APP clock.

The opaque dispatch-owner object and renderer/notify samples still lack a
production dispatch issuer. Original Windows observations do not supply that
missing provenance. The result therefore retains false flags for dispatch and
document-sample provenance, current source ownership, startup qualification,
persistent upload replay exclusion, reopen, writer readiness and execution
authority. An original plan token does not change those limits.

The old `closed-sql-clock.ts` contract is unchanged. It requires the entire Job
to exit within its original window. The new persisted-value postcondition may
accept a later termination while testing stored timestamps against the original
frozen windows. It explicitly leaves
`entireJobExitedWithinOriginalWindow:false`. Neither the maintained SQL
comparator nor its timestamp precision or collateral-effect rules was relaxed.

## Focused verification

Local checks used pinned Node 24.18.0, npm 11.16.0, core dumps disabled and the
maintained test-isolation preload. Dedicated fresh-supervisor tests passed
24/24; runtime/engine forwarding tests passed 29/29. Current aged-clock checks
passed 27 existing cases and two added UI/TZ drift cases at native Date
boundaries. The transaction plan has 26 focused cases: a run passed 25, while
the remaining case refused correctly but failed an overly specific error-message
assertion. After correcting only that assertion, its focused rerun passed.
Facade/stub types and targeted strict type-aware lint passed with zero warnings.

These are synthetic tests. The clock tests use the actual source-qualified
supervisor/issuer path with synthetic native child streams. They do not execute
the new Windows action against EasyEDA. The transaction tests use the maintained
SQL reader/comparator with synthetic before/after inventories; they do not prove
a live write, startup effects, queued persistence or recovery. No duplicate full
local suite was required for this implementation checkpoint. Release CI,
installed-package and connected evidence must be recorded separately.

Candidate `0.3.0+codex.20261016120000` also passes whole-tree facade/stub
typechecks, strict type-aware lint with zero warnings, bundle generation,
compatibility and API-coverage checks, package/repository validation and all
seven official skill validators. GitHub CI and installation are pending.

The installed103000 disposable check is separate: normal launch and PCB opening
completed, the original closed-symbol metadata witness matched the checkpoint,
and normal closure was acknowledged without a Save/Discard choice. Its original
termination/baseline-copy observation is still running at this checkpoint. No
new project-only reader or candidate clock action has passed live validation yet.

## Preparation latency

Source review found six full historical admission scans, four status/source
qualification passes and checkpoint decoding before baseline journal creation.
Each history scan rehashes retained phase artifacts; the pure-projection cache
does not skip those bytes. The fixed native read has its own 70-second host
deadline, but the entire preparation has no aggregate deadline. No timing
measurement identifies the dominant stage yet.

The initial admission check remains: entering the authenticated scope can await
an upstream connection before the next generation check. Removing it could
connect under quarantine. Add bounded phase timing before selecting a narrower
consolidation; do not race a timeout against a still-running owned lifecycle.

## Remaining work

The [124500 compiler/clock update](current-symbol-writer-compiler-release-2026-10-16.md)
supersedes items 1 and the compiler portion of item 2 below. Their original
scratch/renderer issuers and fixed compiler are now implemented. Connected
validation, writer coordination and the other obligations remain open.

1. Bind the fixed current aged-head programs to an original, source-qualified
   scratch process and renderer generation. Collect the exact unlocked before
   literal before arming; do not reuse historical-source authority or infer age
   from an after-file result.
2. Implement the fixed metadata writer/compiler and original one-shot
   coordinator. They must issue dispatch and raw document-clock provenance,
   retain target/receiver identities, finish expensive admission before clock
   collection, persist the exact intent and refuse an expired immutable window
   immediately before the sole mutation. There is no permission to resample an
   already consumed attempt, retry a write or add Save.
3. Qualify startup effects and the complete current source/dependency scope for
   that route. Keep initial process ownership separate from assumptions about
   APP, worker, notify, SQLite and other target writers.
4. Complete normal-close and original root/Job termination ownership, full
   closed SQL/native comparison, and exclusion of both persistent upload caches
   in a fresh inactive generation before reopening.
5. Prove one disposable forward/inverse persistence lifecycle and its failure
   recovery. Preserve exact collateral effects and original evidence. Other API
   families and omissions remain in the existing coverage backlog.

Production designs and their records are outside this implementation scope.
This checkpoint does not supersede any retained operation's terminal evidence
or authorize replaying a completed launch, navigation, close, edit or Save.
