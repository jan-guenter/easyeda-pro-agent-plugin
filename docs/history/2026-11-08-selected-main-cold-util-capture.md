# Selected Main capture with cold CommonJS util

The retained gen4 Via attempt stopped at `sql-fence-capture` with
`SELECTED_SQL_CAPTURE_SIDE_EFFECT`, after its original four-import preflight
passed. It never opened the project or reached Create/Save. Its original
cleanup and abandonment are separate retained observations. No live operation
was replayed for this change.

A builtin-only Inspector probe reproduces the refusal at
`Object.getOwnPropertyDescriptor(util, "parseArgs")`. V8's trace identifies the
native lazy-property getter as potentially effectful. Skipping only that key
then refuses at `TextDecoder`. The Node source defines seven lazy export names:
`parseArgs`, `TextDecoder`, `TextEncoder`, `MIMEType`, `MIMEParams`, `diff` and
`setTraceSigInt`. The full installed app's only `F5` member expression is
`F5.promisify`; the fence additionally uses `F5.types.isProxy`. Both descriptors
remain fully checked.

This is not evidence of a V8-version regression. A clean CommonJS probe fails
on both pinned Node24.18/V8 13.6 and ambient Node26.12.1/V8 14.6. Importing the
ESM `node:util` facade first makes the historical capture pass. Node's
`BuiltinModule.getESMFacade` synchronizes every named export, materializing lazy
exports. Earlier passing probes imported repository modules with a named
`node:util` import and therefore did not establish a cold-module positive case.
Their observations remain retained; the cold control corrects their scope.
Node26 is a diagnostic analogue only, never a plugin build or validation runtime.

The new capture has the fixed source profile
`private.selected-file-main-sql-capture.v2`. Its outer Array11, fixed commands,
request counts, pause ordering and side-effect flags are unchanged. Slot5 now
holds the profile, safe descriptor rows, original `util`/`util.types` prototypes,
both complete ordered string/symbol key rosters and an explicit false assertion
for opaque-export descriptor invariance. Original module identities and every
safe descriptor remain checked. The complete `util.types` descriptor snapshot,
including `isProxy`, remains checked. Only the fixed seven names are omitted
from descriptor reflection. Their values, getters, descriptor flags and
descriptor invariance are unproved; the helper never accesses them. Unknown
native lazy properties are not skipped and still refuse. There is no automatic
accessor exclusion, ESM warm-up, getter call or relaxed side-effect flag.

Every common SQL-capture consumer and the request reader's copied SQL proof
uses the same v2 scope reproof. Historical v1 capture and JOIN bytes are retained
under explicit v1 exports and checked against pre-change SHA256 values. SQL
allow/deny predicates, database/statement checks, source locations, selected-file
identity, CAD guards and peer descriptors outside this fixed unused export set
are unchanged. No MainRunner, Core, pipe, native generator, helper, pin or bundle
was edited.

The fresh CJS child regression executes real Inspector requests with
`throwOnSideEffect:true`: v1 refuses before, v2 capture/reproof succeeds, and v1
refuses again afterward. That last refusal proves the omitted native lazy exports
were not materialized by v2. An actual native lazy property under an unknown key
refuses; a fixed-name ordinary getter remains uninvoked. Separate cases reject
safe-descriptor changes, module/type replacement, prototype changes, extra
string/symbol keys, reordered keys and a changed profile. The copied request
proof independently rejects module-scope drift.

The sealed private probe also runs the original hash-checked app class/import
fragments at the actual after-imports source point, using sqlite3@5.0.2's exact
bundled C++ and JS wrapper. It uses a locally built N-API3 addon and official
node-addon-api3.0.2 headers within the package's declared `^3.0.0` range. The
actual Windows build headers and ABI are unknown. No Database/Statement
constructor, SQL engine operation or application method runs. Both Node24 and
the explicitly diagnostic Node26 show v1 refusal, v2 capture/reproof success and
v1 refusal afterward; original Inspector worker exits are awaited. This does not
validate the Windows app or its next native metadata step. The previously found
Linux N-API constructor own-field mismatch with the three-field decoder remains
separate and unchanged; no Windows ABI shape is admitted from that analogue.

The exact runtime/test worktree is
`/root/work/easyeda-pro-agent-plugin-fixture-import`, based on `910d75f9`.
Its final payload is sealed before final checks in the private
`selected-main-util-v2-20261108` manifest with patch, new files and logs. The
private `main-sql-capture-real-napi-20261108` inputs retain the prior probes,
development failures, builtin sources and native-build provenance separately.
Focused source/Inspector checks, both TypeScript configurations and strict
changed-file lint are recorded for this sealed payload. Git identifies this
change's introducing commit; subsequent integration and any native regeneration
are distinct worktrees and observations.
