# Saved-reader recent-project registration

This source increment follows the retained original saved-reader/cache work.
It does not publish, install, open a project or grant a design write. The
installed release remains PR170; connected saved/reopened proof is pending.

## Actual application behavior

The pinned current209 main application `app.js` is 2,657,192 bytes with SHA256
`52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c`.
Its `sd.openProject` calls `sd.save`, which awaits `vu.save`. That service
upserts one `db_paths` row in the shared profile's `database/web.db`, then
queries that row before the outer open returns. This is a profile mutation.

The actual vendor DSL was compiled in an inert separate realm. No SQLite,
application method or native owner ran in that observation. Its output has
five parameters: name, raw path, version, INSERT Date, UPDATE Date. The SQL
inlines `system=false` and `type=1`. The UPDATE Date is constructed first;
the two Date instances may have different values. An existing path conflict
updates only `last_open_time`; it does not overwrite the other stored fields.
The following query projects all six row fields. Exact SQL/ordering is retained
in `current-saved-project-registration-config-source.ts`.

The full original method declarations were separately compiled in an inert
Inspector context. Actual possible call locations qualify the pre-exec,
post-exec and outer post-save points. No application or SQL method was invoked
to obtain those locations. The original complete application hash, runtime
script identity and exact current pauses remain mandatory.

## Original continuation

The original saved-reader Core publishes and rereads a durable intent before
dispatch. Its private registry joins that intent, completed writer checkpoint,
selected raw path, consumed loading preparation and original main runner. A
copied intent and another native owner cannot enroll. Enrollment arms three
fixed source points before the single native dispatch; it does not run SQL.

The separate registration programs retain the actual metadata, context,
table/column identities, shared-profile connection and original prototypes.
They permit only the exact five-parameter upsert for the disposable target.
Both native Date identities and values remain distinct. A repeated run,
including the application's `SQLITE_BUSY` retry, refuses before another native
call. The post-exec and outer post-save source points prove their original
awaits settled in order. They do not establish the contents of a closed shared
database or any design Save.

The native Core separately checks its actual saved-reader purpose, intent and
runner before sending registration commands. Every continuation requires the
same attempted, unsettled native dispatch Promise. The private codebook accepts
only the fixed source expressions/programs and original handles; caller SQL,
scripts, conditions or session selectors have no representation. Its 32-request
allowance belongs only to this new saved-reader purpose. Existing startup
JB/DC progress, generic SQL conditions and released footprint roles are unchanged.

## Verification and remaining joins

Both TypeScript projects and strict changed-file type-aware lint pass.
The 41 focused registration, startup-config and selected-file fence checks pass.
These include actual fixed programs running against explicit inert SQLite
peers and the unchanged production main scheduler against synthetic transport.
They are not native SQLite or connected execution tests. The first local
program syntax and tuple-type errors and subsequent lint failures remain in
private logs; corrected source was verified separately.

Actual Core registration/open dispatch, startup-worker actor qualification,
original fetch/decrypt/parse source joins, reopened scene/content acceptance,
normal original termination and complete final closed SQL remain required.
No missing acknowledgment, data-only metadata comparison or awaited source
point replaces those obligations. No production project was opened or edited.

## Nested descriptor review

Before any native run, a follow-up review required explicit original Proxy
checks on nested table-example and prototype objects before descriptor
snapshots. The fixed programs now check those objects before enumerating them.
The focused regression includes an effectful nested Proxy `ownKeys` trap and
proves refusal without invoking it. The original failing and passing local
logs remain separate; no connected acceptance is inferred.

## Separate inverse enrollment

The original inverse owner now has a distinct durable intent and private
registry. The main runner reuses only the exact application-source/SQL
continuation through a separate inverse entry. Saved-reader and inverse
intents cannot cross their original registry, owner, main runner or selected
path. Each enrollment reproves its original accessor after every await; no
caller supplies a function table or target path.

The inverse has its own 32-request main allowance. A genuine prior-registration
result can finish an unused inverse sequence only through the original
written pipe request, retained settled Promise and exact registry result.
That branch records a skipped registration; it never invents a native SQL run
or source-await acknowledgment. A dispatched registration still requires the
same one-run and original awaited-source sequence. The original inverse native
registration dispatch and full four-generation lifecycle remain separate work.
