# Producer scope for the current closed-symbol route

Research date: 2026-10-16. This source-only review follows the
[backend actor plan](current-backend-actor-adapter-plan-2026-10-16.md).
Installed source was read as text, never evaluated. No live tool, project,
user/license database, runtime setting, test or production record was accessed.

## Conclusion

The exact local ordinary-symbol metadata route is a feasible candidate for a
whole-closed-session contract. Its reviewed target-file producers are the
project Worker, Electron APP handler and APP's in-process SQLite work. No
outside-Job service or broker was found on this branch. Once the exact local
routing and dependency premises below are admitted, original root termination
plus the retained non-breakaway Job becoming empty can establish that those
producers cannot execute again. A separate generic idle detector or structure
timer drain is not required for that end-of-producers claim.

Termination does not establish that the intended writes happened. Require the
complete closed SQL/native intended-effect comparison after termination. A lost
timer, incomplete history write, unexpected retry or collateral change must
fail that comparison, not cause another mutation or Save. This is a proposed
route-specific postcondition, not current writer admission or a power-loss
durability guarantee.

There is one concrete dependency-admission gap: the current profiles pin APP
but omit its SQLite resolution chain and native addon. Bind those fixed files
before enabling the new writer. The installed bytes and source chain are
recorded below. The project-only preflight's no-editor-tab context, actor and
clock policy, startup attribution, inverse and recovery remain separate work.

## Primary sources

Installed paths below are relative to
`/mnt/c/Program Files/easyeda-pro/resources/app/`. Offsets in minified bundles
are zero-based UTF-16 string offsets, not byte offsets. These files were
rehashed during this review.

| Key / relative path | Bytes | SHA-256 |
| --- | ---: | --- |
| APP, `app.js` | 2657192 | `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c` |
| MGR, `assets/pro-mgr/3.2.184.355087e9/js/pro-mgr.js` | 2196400 | `005584e02cd9b2d49fdb387b2f997c1c8d3f88b0c48a7531c8097c483ed0bd2e` |
| WORKER, `assets/pro-mgr/3.2.184.355087e9/js/project-worker.js` | 2181284 | `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` |
| `node_modules/sqlite3/package.json` | 3619 | `a7d2279dfd425ee3f2f368e5160955491333967f7207ff3690a747a11f049985` |
| `node_modules/sqlite3/lib/sqlite3.js` | 6309 | `e453648b76b80be1334dc49bf3ba19672f7acbd11b5d8b1ebe0cab08e3c5edf3` |
| `node_modules/sqlite3/lib/sqlite3-binding.js` | 449 | `946769d049dacf8a564ab0f7076e1762ebae7ee7aba43d8ac5d72103089b6ccf` |
| `node_modules/sqlite3/lib/binding/napi-v3-win32-x64/node_sqlite3.node` | 2742272 | `a851d31983fd21ee3821b1a0ca148c013029f96c6e0d31afc400e6a62ea7b482` |
| `node_modules/sqlite3/src/macros.h` | 12006 | `02a296478537acf33980f44486c6da28f14f0566582b67e299881f27aa3c4983` |
| `node_modules/sqlite3/src/database.cc` | 21833 | `3778713244ecacaef7f6b75537d5c00e1cab28a79a7298d34729a9f5e115f979` |
| `node_modules/sqlite3/src/statement.cc` | 29337 | `7a12e9fd6efc9873025429cd9d86842ee01b4f0e730bda0402053900d30a94d0` |

The addon C++ files support the execution model described here. They are not a
reproducible-build attestation of the installed binary. Admit the exact vendor
binary as its own dependency; do not infer its identity from package version
`5.0.2` alone.

## Exact producer chain

1. MGR 688372 names `/PrjDB/symbol/updateData`. Its fixed registered callback
   at 2066641 calls `K(projectUuid).symbol.updateData(patch)`. MGR 1759617
   requires the existing project to be ready and forwards to that project's
   retained worker bus. The project constructors at 1782753 and 1785519 create
   a browser `Worker` and `WorkerMessageBridge`, not an external service.
   The future compiler must retain this exact project/branch/worker ownership
   and select only the intended ordinary closed symbol.
2. WORKER 2168955 forwards the worker RPC to `symbol.updateData`.
   At 1937501 through 1938500, the update builds the symbol header/META and
   calls `uploadLocal`. WORKER 2031178 parses the change into the loaded
   project, writes an upload entry to its local cache and schedules the buffered
   upload. Its cache-failure branch directly awaits `uploadCloud` instead.
   Neither branch launches a native helper or writes SQLite itself.
3. WORKER 2012395 creates the buffered upload closure. `uploadCloud` at
   2022843 invokes `projectHistory.set`; its class at 1760235 selects the
   relative `/api/v4/projects/{project}/branches/{branch}/histories` route and
   supplies the exact project as the `path` header. The structure closure at
   2104005 through 2105060 separately selects `project.setProfile`, whose body
   at 1770335 posts to the corresponding relative `structures` route. The
   common `POST` at 1711979 reaches XHR at 1431583. `G6` at 1434109 constructs
   parameters without replacing these relative URLs with an online service.
4. Under the retained `https://client` origin, APP 2629794/2630484 receives the
   protocol request in its local router. `xC` at 2630578 does not redirect these
   history/structure paths. The router at 2620057 only selects the remote
   proxy for a non-`client` host. APP 2617250 through 2617830 registers the two
   local handlers. APP `$` at 1329828 resolves the project header through the
   already registered project map to its local file. A writer must retain the
   exact map identity/path correlation; a plausible UUID is insufficient.
5. APP `createProjectHistory` at 2604081 adds the request actor header and
   calls `saveProjectHistory` at 2594412. Its history transaction is awaited;
   project modifier/time update `xB` at 2601108 is awaited afterward. APP
   2607932 through 2608820 performs the structure SELECT and INSERT/UPDATE
   directly through the same SQLite wrapper. History encryption/compression
   uses in-process crypto and synchronous gzip in `O4` at 2583349. These exact
   handlers contain no broker, child-process, external URL or cloud write.
6. APP `require("sqlite3")` at 1318881 resolves the package's
   `main: ./lib/sqlite3`. That module's first four lines load
   `./sqlite3-binding.js`, whose fixed platform/architecture path loads the
   native addon above. APP `y`/`xt` at 1318983/1319235 creates `sc.Database`
   instances. `Z2.run` at 1299560 wraps their callbacks; `yo.commit` at
   1301009 awaits `commit transaction`. Addon `database.cc:151–180` schedules
   Node-API work and calls `sqlite3_open_v2`; `macros.h:137–151` queues statement
   work; `statement.cc:467–493` calls `sqlite3_step` against the in-process
   handle. This is native worker-thread work within APP, not a database server
   process that could survive independently.

The source has other routes that use external services, shell opening and
child processes. This conclusion excludes them by the fixed call path, not by
pretending the application has no such capabilities. Require the reviewed
local profile and no controlling service worker; a service-worker proxy or
remote project invalidates this routing argument. The one-shot agent request
also does not prevent native HTTP/upload retries. Their final output belongs
in the exact SQL comparison.

## What the retained Windows proof supplies

The reviewed
[native helper](../plugins/easyeda-pro-control/scripts/windows-authority.ps1)
has SHA-256 `fa5cff83eea61dea9a58dad282c76a2016bc7cbcb6f54dea1ef51375d9a91161`.
Lines 62–99 create an unnamed Job, require `LimitFlags == 0`, and assign the
application atomically with `PROC_THREAD_ATTRIBUTE_JOB_LIST`. Lines 110–123
reject incomplete Job PID enumeration. Lines 493–508 check the original
retained root exited and the original Job is empty twice. Lines 510–551 retain
the captured process handles and check all have exited between two empty-Job
observations. The Job includes normally created descendants born after capture.
The proof does not reconstruct authority from later PID lookups.

[windows-authority.ts](../plugins/easyeda-pro-control/server/src/windows-authority.ts),
SHA-256 `045e6838a74c1627427b26a67855e2d9e17bf67763d1a5e76fa7fbbd92775657`,
lines 418–426 expressly excludes outside-Job brokers/services and unreviewed
delegation. It does not block arbitrary IPC or network requests. Lines 731–768
retain `queuedWritesPersisted: "not-proved"` and
`persistentWorkReplayExcluded: "not-proved"`. Preserve both distinctions.
For the local route above, terminated APP means its SQLite callbacks and
native threads cannot issue another target-file operation. It does not mean
every queued callback ran or every transaction committed before exit.

## Admission changes and verification boundary

The current
[opening profile](../plugins/easyeda-pro-control/server/src/current-disposable-open-profile.ts)
has SHA-256 `f59aa116ce9d76acfa72cb404eb4e20459ba4a85b20dc5062f0d46a343398b7a`.
It pins APP/UI/MGR/WORKER and separately SCH/WS, not SQLite. The
[ordinary launch profile](../plugins/easyeda-pro-control/server/src/ordinary-launch.ts),
SHA-256 `dd6fac2fb6bcc3ba11e67d55f22d1177b1a123232b1317308978223c4761b84a`,
pins the executable, APP, application package, editor configuration and helper.
Its `reviewedExecutionScopeSha256` at lines 403–407 is the facade hash, not a
separately verified closure of APP's native dependencies.

A versioned writer profile should therefore add the four fixed SQLite runtime
files above, bind their canonical resolution beneath the selected installed
APP, reject substituted links/ancestors or changed identities, and revalidate
the same dependency set at its existing authority boundaries. Guard Node's
higher-precedence candidates too: the bare package can select
`node_modules/sqlite3.js`, `.json` or `.node` before its directory, and package
main `./lib/sqlite3` can select an extensionless file before `lib/sqlite3.js`.
Hashing only the expected `.js` file does not prove which file resolves.

APP's only executable references to `sc` are its import and the three
`new sc.Database` sites at 1319120, 1319315 and 1319750. It has no `sc.verbose`
call. The installed JS wrapper loads `./trace` only inside `sqlite3.verbose`
at offset 5685. That branch is outside this fixed APP route; allowing verbose
initialization later would add its dependency and resolution requirements.
Do not add
caller-selected module paths or hashes, and do not enable old writers merely
because these files match. Source review plus fixed installed dependency
admission is the missing route-scope qualification, not another timer probe.

Use the maintained closed-copy machinery after genuine termination. The
[copy implementation](../plugins/easyeda-pro-control/server/src/closed-file-copy.ts),
SHA-256 `aaee268a944387cf60c720b8da88d5e653b2e1dea6fd1bfa82fb4dc4019c998f`,
lines 141–231 checks issued authority, absent SQLite sidecars, descriptor/path
identity and matching before/copy/after hashes. It takes no global exclusive
file lock. The
[SQL reader](../plugins/easyeda-pro-control/server/src/sqlite-inventory-core.ts),
SHA-256 `b2ad548c982789f34a2e91edbb6abc0eb8e8fdc90bf3e0cf044e3892c47929c7`,
lines 158–246 reads only the inherited read-only descriptor and rechecks its
complete result. These checks do not exclude an unrelated external writer or
promise future immutability. Keep the selected disposable file outside other
writers and refuse observed drift or sidecars; do not broaden the claim to
every file or application on the workstation.

Finally, after the closed intended-effect comparison and before reopening,
retain a fresh original generation and exclude both branch upload-cache
namespaces while the target is inactive. WORKER 2022078 can replay old entries;
the successful upload's cleanup at 2024488 is detached. Termination ends its
old producer but does not erase its persistent input. Keep this separate
replay exclusion in the new forward/inverse lifecycle.

The research and extension-development skills kept this decision tied to the
installed call path and separate from live validation. No execution route,
compatibility pin, writer-authority flag or existing baseline history changed.
