# Closed SQL and upload observations

These internal readers provide evidence for the
[closed-session completion workflow](closed-session-evidence-2026-10-12.md).
They do not enable a CAD writer, grant navigation authority, or expose an MCP
file reader. Existing execution refusals remain unchanged.

## Read a complete supported SQLite state

The SQL reader inventories schema definitions, ordinary table rows, multiplicity,
row IDs, column metadata and persisted database properties. Integers retain their
64-bit decimal representation. Finite real values retain IEEE-754 bytes. Text
and blobs retain their storage class and hexadecimal bytes, including invalid
UTF-8. Views and triggers are inventoried but never queried or fired.

Virtual tables, generated columns, nonfinite real values and tables that shadow
every row-ID alias refuse. This is a logical inventory for supported schemas,
not an index-integrity or physical-page proof. The original file hash remains
separate. A `VACUUM INTO` checkpoint can change the schema cookie and implicit
row IDs, so it cannot replace the byte-preserving copy.

`readClosedCopySqlInventory` requires the original issued copy receipt and
rechecks the artifact's complete identity before and after scanning. A clone,
same-byte replacement, metadata change or sidecar refuses. It reads only the
private artifact, never the source project. A later application launch does not
invalidate historical evidence, but the result does not authorize another copy
or prove current project state.

## Bound synchronous database work

Node's SQLite statements are synchronous. The facade therefore runs all database
construction, checks and scans in an owned child process, not its event loop.
[Node 24.18 SQLite documentation](https://nodejs.org/download/release/v24.18.0/docs/api/sqlite.html).

The child uses the installation's verified Node executable through a retained
descriptor. It receives one read-only database descriptor and bounded JSON data.
Its fixed, builtin-only program is a generated constant from three reviewed
source files. Builds and tests reproduce it; connecting the coordinator will
include it in the existing facade bundle. There is no caller code, alternate
worker path, ambient `NODE_OPTIONS`, dependency loader or inherited `execArgv`.

| Resource | Limit |
| --- | ---: |
| Source file | 256 MiB |
| Rows across all tables | 100,000 |
| Columns per table | 128 |
| Cells including row IDs | 250,000 |
| Individual raw value | 2 MiB |
| Cumulative raw values | 64 MiB |
| Encoded inventory | 16 MiB |
| Schema entries | 256 |
| Child input and stderr | 8 KiB and 16 KiB |
| Child lifetime | 10 seconds |

The reader also sets a 192 MiB V8 old-space limit and verifies a 64 MiB SQLite
heap limit. These are not whole-process RSS limits. SQLite's heap pragma can
lower the process limit, so this setting belongs in the separate reader process.
[SQLite heap limit documentation](https://www.sqlite.org/pragma.html#pragma_hard_heap_limit).

Timeout or pipe/output failure signals only the owned read-only child. The
promise settles after observed child closure, not when the signal is sent.
Success requires the exact two-line protocol, complete digests and descriptor
identity checks. No EasyEDA process is terminated by this reader.

## Observe the two target upload queues

The fixed upload observer checks only `project_<project>_v6` and
`localProject_<project>_v1`, matching `https://client/upload/<branch>`. It uses
captured `CacheStorage.prototype.match` with fixed options. The named-cache match
algorithm does not create a missing cache, unlike `open`.
[CacheStorage match algorithm](https://w3c.github.io/ServiceWorker/#cache-storage-match).

Three fixed project-membership RPCs bracket the two matches. Any cache response
refuses without reading its body. There is no cache enumeration, creation,
deletion, replay getter, network fallback, Save, navigation or retry. Browser
storage bookkeeping may still occur; this is not a claim of profile-byte
invariance.

The observer retains the main global, Document, location, UI host, tab controller,
message bus, cache receiver and methods across all awaits. It requires the native
12-field pristine project object, empty startup-tab Set, Start Page and exact
startup flags. Only the source-produced EasyEDA OFFLINE and HALF_OFFLINE mode
strings pass. The URL accepts the five native named log levels, with no project
fragment or extra query. The earlier numeric-log-level and empty-object fixtures
were corrected before integration.

The result says `point-in-time-inactive-target`. It is ordinary frozen data,
not a completion proof. Its ten-second deadline prevents later reads after a
timeout but cannot cancel a read already issued or drain a worker.

## Check service-worker registrations separately

The service-worker observer makes one native `getRegistrations()` read and
requires an empty array plus a null controller. Unlike a URL-scoped lookup,
the registration list covers the current renderer's storage key. A noncontrolling
registration at another scope therefore refuses too.
[Service Worker registration-list algorithm](https://w3c.github.io/ServiceWorker/#dom-serviceworkercontainer-getregistrations).

The observer retains the Navigator and ServiceWorkerContainer prototype
accessors and method, and rechecks them after the await. It does not read any
registration object or script, call `ready`, register, unregister or update.
Both frozen and mutable empty arrays pass; no particular browser's array
freezing behavior is assumed. Context drift, native rejection or timeout refuses
without retry. Its ordinary frozen result is point-in-time data, not ownership
of the runtime or permission to replay work.

## Observe pre-edit worker identity and clocks

The internal symbol witness collector uses eight fixed RPCs to read project
identity, worker client, raw maximum ticket and worker time twice. It requires
the exact clean companion PCB, with the target symbol closed in the enumerated
tabs. The writer must still prove full frame absence. Optional native Start
Page and hidden placeholder tabs do not count as design peers.

The collector captures the UI host, project, tab controller, message buses,
cached actor, permission receiver, Date functions and timeout functions. It
rechecks them after each await and stops before another RPC on timeout or drift.
The worker time getter returns a raw number; the other getters return a
`message` envelope. Synthetic tests preserve these distinct native contracts.

It also records the renderer's clock, timezone offset and parsing of the
baseline timestamp. None of these fields alone proves the APP request actor,
APP clock, fresh offline-worker clock provenance or exclusive producer. The
strict result parser requires all five authority flags to remain false. A
pre-edit clock interval cannot bound the time of a later edit; the coordinator
needs an independent post-dispatch upper bound as well.

## Remaining execution requirements

The internal symbol-metadata comparator now derives one exact new-history-head
effect from the baseline. It checks the source-derived 35-table schema, every
row and cell, raw authenticated history, branch/project bookkeeping, sequence
allocation and the structure ticket. It refuses inactive branches and history
rows that would become unexpectedly visible under the new head. Native random
UUIDs, keys and ciphertext are checked against their generation and plaintext
contracts; they need not be known before dispatch. See the
[source contract](symbol-metadata-closed-sql-source-2026-10-12.md).

All 91 synthetic comparator tests pass. The complete row comparison yields every
128 cells and between tables, without sorting or serializing whole relations.
This is an internal effect check. Its result explicitly leaves producer binding,
process closure, upload replay exclusion, execution authority and reopen proof
unproved. It does not clear any writer refusal.

The coordinator must bind the original operation and exact project to retained
whole-Job exit, a fresh owned main process, the same profile/default partition,
native source pins and a clean launch with no project-open attempt. Current
empty tabs do not prove that launch history. The two observers must be bound to
the same admitted generation and the next single project-open attempt.

The first isolated browser test now passes on this distribution's exact
Electron `41.2.1-jlc-sa-win-x64.2`, Chromium `146.0.7680.188` and Node `24.14.1`.
The maintained observer expressions ran against real browser prototypes,
CacheStorage and ServiceWorkerContainer. Both absence reads succeeded; cache
names remained empty before and after the named matches. The scratch process
exited normally, and its retained Windows Job was empty without forced cleanup.
This used synthetic UI/project state, no EasyEDA application code or user
profile. It does not validate native startup or producer ownership.

A second scratch suite passed all seven populated-storage cases on that same
custom runtime. A real dedicated worker populated the caches before main-frame
observation. Wrong-project, wrong-branch and local-save peers remained unchanged.
The observer rejected a target upload with a query string and `Vary` header,
then a local upload with a query string. Native matching controls independently
showed why both fixed options are needed. Removing only the synthetic target
entries restored a successful empty-target result with the four peers intact.

A noncontrolling service worker at a different scope caused a registration-list
refusal even with a null controller. A second worker claimed the main renderer;
both observers then refused the controlled host. Separate stage receipts and
the complete result were independently cross-checked. The application exited
normally with an empty retained Job and no forced cleanup. Its two registrations
and synthetic cache entries remain in its inactive scratch profile.

These results cover browser behavior and peer preservation, not persistence
across separate processes, native startup or producer ownership. A future
operation-owned, disjoint cache marker may witness storage continuity across
owned generations. Such a marker is an explicit bounded profile write and must
have journal-before-dispatch and no-recreation recovery. It is not implemented
or an alternative to complete SQL effects and whole-Job exit.

Empty caches can also follow eviction or lost writes, so they cannot prove that
the requested edit persisted. Complete expected SQL effects, saved design
verification and a second closed-state comparison remain necessary. The
structure-ticket-only test helper explicitly does not claim a complete
metadata-rename effect.

The observer's source review binds APP `10a42746`, UI `12414b9d`, API `59236967`
and project manager `23089ec5`, all SHA-256 prefixes for the installed reviewed
tuple. Relevant UTF-16 offsets include UI8067212 for the pristine project,
UI14959595 for startup tabs, MGR1779900 for worker membership, APP2579166 for
mode generation and APP2651103 for the URL. These are program-source facts,
not connected runtime observations.

The pinned service-worker loader `f8ad61fe` returns before registration for local
CLIENT modes without ONLINE at UTF-16 offset94598. That source path explains
why a clean offline launch does not register a worker, but says nothing about
older registrations. The isolated test above confirms the actual WebIDL
descriptors and initial empty-state behavior. Passing a script to the installed
EasyEDA executable is not an isolation mechanism: it can still load EasyEDA and
its configured profile. The scratch runtime instead contains only a fixed
synthetic application, uses separate storage paths and admits its identity
before constructing a renderer. Its evidence is not a native lifecycle receipt.
