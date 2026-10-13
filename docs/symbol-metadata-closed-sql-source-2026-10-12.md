# Symbol metadata and complete closed-SQL effects

2026-10-12. This source review defines one narrow effect: changing the title or
description of a closed, ordinary project symbol through
`/PrjDB/symbol/updateData`, with exactly `uuid`, `title` and `description`.
It does not cover block symbols, creation, deletion, import, geometry or Save.

The internal [SQL comparator](../plugins/easyeda-pro-control/server/src/symbol-sql-comparator.ts)
implements the new-history-head case described below. It does not dispatch a
write or authorize execution. Existing writer restrictions remain in place.
The reviewed evidence consists of installed program source and isolated
synthetic databases, not a connected EasyEDA lifecycle.

Selected-history preparation indexes `history_data.uuid` once instead of
rescanning every row for each chunk. It keeps exact UTF-8 decoding, original row
references and duplicate/missing-key refusal. Index construction yields every
128 rows or 64 KiB of accumulated UUID bytes; an individual cell retains the
reader's 2 MiB limit. Complete SQL comparison still checks all unrelated rows.
The 91 original comparator cases and 24 index/integration cases pass. Counted
scaling tests verify one decode per row, without making timing an admission rule.

## Primary sources

Files are relative to the installed EasyEDA `resources/app` directory. Offsets
are zero-based UTF-16 code-unit positions in decoded JavaScript, not byte
offsets or line numbers. Every APP, WORKER and WS citation below refers to these
exact files and hashes.

| Label | File | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| APP | `app.js` | 2,655,696 | `10a427460d498667f6d1df9cd8899a1740afd9644cbf83ecaf80365d590869bb` |
| WORKER | `assets/pro-mgr/3.2.148.154949d9/js/project-worker.js` | 2,164,464 | `2792c6c87e3c60e09c43f03494a9cbb24e4ebe9c385372bbaf877ed75083a949` |
| WS | `assets/pro-mgr/3.2.148.154949d9/js/ws-service.js` | 851,749 | `dc6feee1873ddf4790187983df70b36dea95f1cb793f1cc05a274e65b37be0bd` |

The [fixed schema](../plugins/easyeda-pro-control/server/src/native-project-sql-schema.ts)
comes from APP's eprj2 base SQL and migrations, then its dynamic history-table
constructor. Base SQL starts at 1261794; migrations start at 1239214, 1242568,
1246474, 1248739, 1250251 and 1258923. The registry at 1261231 distinguishes eprj2
from library databases. `Or` at 2227595 and the CREATE/ensure paths at 1298621
and 1299136 define the dynamic table.

Executing only those captured SQL definitions in a synthetic database produces
34 static tables and 82 schema entries. Adding one selected-branch history table
and its autoindex gives 35 tables and 84 entries. The profile includes the native
`components_tmp` table. It admits no trigger, view, extra branch-history table
or migration during the operation. This is a supported source-derived shape,
not a claim that every existing native database has that shape.

## Bind the complete selected history

Project identity is not necessarily a 32-character UUID. APP `createProject`
at 2324455 derives the native local project ID from the project path using
`Ye` at 1280016, a SHA-256 hexadecimal digest. `G.create` at 2313780 inserts that
supplied value instead of generating a UUID. The project-only admission must
therefore cover exact 32- or 64-character lowercase hexadecimal identities,
while branch, actor and history UUID rules remain separate. The authorized
project path and baseline project row must bind the actual value; its grammar
alone is not a project-ownership proof.

The selected project row must name the selected branch. APP `saveProjectHistory`
at 2595133 first looks up the branch through `y4` at 2589491, which requires
`delete_status=0`. A deleted branch cannot be admitted merely because its UUID
exists in SQL.

The first profile requires an ordinary branch with `node=0`. It may be
parentless or have the exact empty terminal `start` parent created by the native
first-branch path: same project, active, `node=1`, no parent and no history head.
APP `createBranch` at 2585920 creates that start row in the zero-branch case;
`a3` at 2592230 inserts branch rows without creating a history table. Traversal
`fB` at 2602011 excludes that terminal start node from selected history.

Parent links alone are insufficient. APP `sB` at 2598585 selects every row with
an ID at or below the selected head, then orders selected history by ID. The
actual open path uses this service: WORKER `openInLocal` at 2114909 calls
`getHistories` at 2021200, through `SA` at 1701279 and `projectHistory.get`
at 1752826, to APP's project-history search.

The comparator therefore requires a snapshot-free, strictly ID-increasing
linear parent chain that equals the entire selected table. It refuses orphan
rows within the native ID range and future rows above the old head. A new
max-plus-one head would make those future rows visible on reopen even if their
stored bytes stayed unchanged. Other ancestry and snapshot cases need their
own complete materialization proof.

All chunks of every admitted head are authenticated and decoded. The maximum
ticket `M` comes from every raw header, including deleted and superseded
records, before materialization. It must agree with the independently bound
worker maximum. The maintained
[metadata planner](../plugins/easyeda-pro-control/server/src/project-symbol-metadata.ts)
then derives the requested title/description and exact unchanged target fields
from that complete baseline.

## Exact raw append

WORKER `gg.updateString` at 1928672 and the following `updateData` emit one
DOCHEAD and one META, separated by `|\n`. APP `LB` at 2603084 and `n3` at 2603194
prepend one EDIT_HEAD. The raw payload has exactly three records, in this order:

1. EDIT_HEAD body fields `uuid`, `username`, `nickname`, `updateTime`.
2. DOCHEAD with ticket `M+1`. Its body fields are `docType:"SYMBOL"`, `client`,
   `uuid`, `updateTime`, `version`, then the admitted truthy `editVersion` if
   present. Version is the string form of that document timestamp.
3. META with ticket `M+1` and ID `META`. Body fields are `title`, `description`,
   `tags`, `docType`, `source`. `docType` is 2. Only the requested title and
   description change; tags and source retain the exact baseline values.

There is no trailing separator or additional geometry, document, deletion or
metadata record. Exact JSON field order is part of this producer comparison.
The protocol constructors are WORKER `xt` at 241441, `Qe` at 241789, `tf.head` at 616131,
`Ju.meta` at 617030 and `cN.metaData` at 657451. `newTicket` at 1847741 supplies the common
increment. The tag conversion at 265498 is bound to baseline decoded values,
not a post-state normalization allowance.

The EDIT_HEAD actor is the native request user's UUID. APP 2603194 obtains its
display names from the matching `users` row, or uses empty strings when there
is no matching row. The comparator preserves all user rows exactly.

The DOCHEAD user is omitted in the reviewed fresh constructor path. WORKER
`vi` at 1847454 captures the user when the symbol manager is constructed at 2093579;
the project manager receives its user later during subscription at 2103526.
This does not make userless headers a universal rule. The future operation
owner must bind that constructor path, client and edit-version source.

## History selection and clocks

APP `eB` at 2597108 reuses an unlocked current head when
`floor((now - q2(created_at))/1000) <= 60`. It is not a simple 60,000 ms cutoff.
Future-dated heads also satisfy the reuse predicate.

APP `q2` at 1317965 uses native `new Date(text).getTime()` and subtracts the
current native timezone offset. The offset on the stored date may differ from
the current one. The aged-new-head case therefore binds the exact stored
literal, native parsed milliseconds and current offset. The earliest possible
selection time must be at least 61,000 ms after the adjusted timestamp. A locked
head is a separate reason to create a new head and consumes no age witness.

The comparator's locked-head tests do not establish that every native lock fits
the fixed schema. Version-node creation at APP 2587686 can also create another
dynamic history table. The aged ordinary initial branch is the practical first
disposable case. Do not create a version or alter SQL solely to fit a test.

DOCHEAD time comes from WORKER `qe` at 1703470, which calls
`/pro-mgr/serverTime/now`. WS 848173 returns `Date.now()+zd`; `zd` starts at zero
at 848157 and a WebSocket pong can change it at 849730. In the fresh CLIENT path
without ONLINE, the mode test at 847972 and startup guard at 849828 suppress that
updater. The future owner must establish this exact fresh OFFLINE or HALF_OFFLINE
path before using one local clock interval for APP, SQLite and DOCHEAD times.
ONLINE mode is not admitted by this first profile.

APP creates EDIT_HEAD time separately with `Date.now()`. SQLite history and
chunk defaults use UTC seconds; APP `Mo` at 1280108 formats project bookkeeping
with local calendar fields. The head and chunk inserts may cross a second.
Each generated value must fall within an independently captured native clock
interval under its own format. Equality between these timestamps, or wall-clock
monotonicity, is not required. Supplied witness fields are not runtime receipts.

## Complete new-head SQL effect

APP 2595133 performs history/branch changes in a transaction, then updates
project bookkeeping outside that transaction. An upload acknowledgment is not
proof that the entire effect is atomic or complete. APP `No.exec` at 1296700 and
the SQL compiler near 1292900 add no implicit timestamp fields to UPDATE.

| Relation | Exact admitted delta |
| --- | --- |
| `project_history_<branch>` | One new row. ID is the complete baseline maximum plus one. UUID is fresh; parent is the old head; snapshot is NULL; key is 16 bytes; is_lock, num and snapshot_num are zero. Created/updated defaults agree within this row. Lock time is `1970-01-01 08:00:00`. Every old row is exact. |
| `history_data` | One new row at the baseline-derived AUTOINCREMENT ID. UUID and history_uuid equal the new head UUID. Authenticated dataStr contains exactly the three intended records. This row's created/updated UTC defaults agree. All old ciphertext and fields are exact. |
| `branches` | Only the selected branch's history_uuid becomes the new head. Peer branches and all other fields are exact. |
| `projects` | Only updated_at and modifier_uuid change to the bounded local timestamp and bound actor. The profile requires exactly one project row because APP 2601835 updates `WHERE 1=1`. |
| `project_structures` | Only the unique selected row's ticket becomes `M+1`. Its identity and serialized structure bytes stay exact; every peer is exact. |
| `sqlite_sequence` | Only the existing history_data sequence advances to its baseline-derived new ID. That sequence row's own rowid/name and all other sequences are exact. |
| Everything else | All tables, rows, storage classes, values, multiplicity, rowids, schema and persisted SQLite properties are exact. No broad bookkeeping exception exists. |

APP `nB` at 2599791 creates the new head; `I4` at 2601031 changes the branch head.
The dynamic table at APP 2227595 uses INTEGER PRIMARY KEY without AUTOINCREMENT.
The history_data definition at 1252824 explicitly uses AUTOINCREMENT. The first
profile requires positive safe IDs, an existing unique history_data sequence at
least as high as every old ID, and room to increment it. Deleted-ID gaps are
valid; absent, low, malformed or unsafe sequences and extreme rowid allocation
are refused. IDs are never copied arbitrarily from the result.

APP `uB` at 2601540 is an UPSERT. Its conflict arm can overwrite old dataStr, so a
new chunk UUID must be absent from all baseline chunks and history identities.
APP structure update at 2608636 requires a lower prior ticket; equality takes an
insert path. The profile binds the existing row and admits neither a duplicate
structure row nor a project_structures sequence increment. Ordinary symbols
are excluded from the block-symbol structure list at WORKER 1932208, which is
why their metadata change does not alter the serialized structure tree.

## Admit native-generated fields without guessing them

Native UUID and key values cannot be known before dispatch. APP 1318213 uses
`crypto.randomUUID()` with hyphens removed; APP 2601262 generates 16 random bytes.
The comparator observes these fields only in the sole new rows, requires a
fresh canonical UUIDv4 and lowercase 16-byte hexadecimal key, and checks all
cross-row relationships. This checks their permitted shape and effects, not
the quality of the random source.

APP `m4` at 2584076 compresses the exact UTF-8 records with gzip level 1, encrypts
AES-128-GCM using the history UUID bytes as IV, appends the 16-byte tag and stores
canonical base64. The maintained
[bounded history decoder](../plugins/easyeda-pro-control/server/src/native-history.ts)
authenticates and decompresses that payload before exact plaintext comparison.
The new ciphertext may be observed after generation; intended plaintext may not.
Existing ciphertext remains byte-exact. This does not claim newly generated gzip
bytes match another zlib build.

Receipt fields `expectedPlaintextSha256` and `generatedCiphertextSha256` use
`sha256Json(string)`. They hash the canonical JSON string representation, not raw
plaintext bytes or decoded ciphertext. The SQL inventory's file digest and full
logical digest have separate meanings.

## Implementation, tests and remaining work

The comparator consumes original completed
[bounded SQL reader](../plugins/easyeda-pro-control/server/src/sqlite-inventory.ts)
results and an original in-memory prepared plan. Serialized copies do not
restore their identity. It compares unique rowids and exact typed cells, yielding
real event-loop turns after 128 rowid entries or cells and between tables. Reader
resource bounds remain in force. This is not a deadline guarantee for every
preparation, history lookup, decompression or native subsystem.

The maintained suites cover 91 synthetic cases, including random fields generated
after preparation, authentication failure, all-table collateral, rowid/sequence
gaps, native start ancestry, future-history refusal, raw deleted-ticket maxima,
aged/locked time decisions and a historical/current timezone difference. The
project-ID cases accept native 64-character project IDs without widening branch
or actor UUIDs, and reject malformed project identities. The
10,000-row comparison both services event-loop turns and rejects a changed final
row. Independent source review and synthetic tests do not establish live support.

The current implementation omits existing-head append. APP `oB` at 2600094 would
increment num and add `<headUuid>-<num+1>` while retaining head/key/defaults.
That is a distinct exact SQL projection and age decision, not permission to
relax this new-head profile. Other ancestry, snapshots, multiple project rows,
schema variants and ONLINE clock offsets likewise require explicit proofs.

Every successful comparator result still sets executionAuthorized,
producerBindingVerified, generationClosureVerified, persistentUploadReplayExcluded
and reopened to false. The missing coordinator must bind this proof to the
authorized file/branch, captured native actor/client/ticket/time witnesses and
one dispatch. It must then prove normal whole-session termination, consume an
issued byte-preserving closed-file copy, and compare the complete intended SQL.
See the [closed-session contract](closed-session-evidence-2026-10-12.md) and
[SQL/upload readers](closed-sql-and-upload-observers-2026-10-12.md).

Before reopening the target, a fresh owned generation must exclude persistent
upload replay under the correct profile and storage key. Reopened native state
and a second complete closed-SQL comparison must follow. Unrelated startup or
close bookkeeping is not silently admitted by this writer-specific projection.
A fixed sleep, upload task1 wait, point-in-time empty queue, successful SQL
comparison or empty Job alone cannot supply the missing lifecycle proof.
