# SCH rename producer and actor scope

Research date: 2026-10-19. Installed vendor files were rehashed and read as
inert UTF-8 text. No vendor code was evaluated, no application was launched,
and no project, account database or cache was opened. Offsets below are
zero-based UTF-16 code units.

## Primary sources

Paths are relative to `/mnt/c/Program Files/easyeda-pro/resources/app/`.

| Source | Bytes | SHA-256 |
| --- | ---: | --- |
| [APP, app.js](</mnt/c/Program Files/easyeda-pro/resources/app/app.js>) | 2657192 | `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c` |
| [MGR, pro-mgr.js](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-mgr/3.2.184.355087e9/js/pro-mgr.js>) | 2196400 | `005584e02cd9b2d49fdb387b2f997c1c8d3f88b0c48a7531c8097c483ed0bd2e` |
| [WORKER, project-worker.js](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-mgr/3.2.184.355087e9/js/project-worker.js>) | 2181284 | `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` |
| [SCH, sch-main.js](</mnt/c/Program Files/easyeda-pro/resources/app/assets/pro-sch/3.2.192.b79ad524/js/sch-main.js>) | 6289422 | `d9d6a955bf40d57daf9f27f31e0fff3191715ff50582418ad0922beb71b424bd` |

## The SCH path uses the existing local producer boundary

MGR registers `SCHEMATIC.UPDATE` at 2058654 against the selected project's
`schematic.updateData`. Its ready-project proxy forwards through the retained
worker bus at 1746811. WORKER `Dg.updateData` at 1915783 samples the document
clock, updates the existing container and awaits `uploadLocal`. Its
`updateString` at 1915393 creates one SCH header and one META with the existing
client and newly allocated ticket. This is a container-title operation, not a
sheet rename or the public UI's reuse-block propagation workflow.

WORKER `uploadLocal` at 2031178 parses the native change and writes its upload
cache. On success it schedules `bufferedUploadCloud`, whose callback is defined
at 2029648. On cache failure it awaits `uploadCloud` directly. A successful
ordinary native return therefore need not imply that backend history or the
separate structure write has finished. The structure closure at 2104005 is
debounced by 300 ms and reads the schematic map alongside the other project
maps. It is shared with the already reviewed local history/structure path.

The [existing producer review](current-symbol-producer-scope-2026-10-16.md)
traces that common path through APP's local router, history/structure handlers
and in-process SQLite addon. The maintained
`verifyCurrentSymbolPersistenceImplementation` is a document-neutral dependency
check for that path despite its historical filename. Reusing that check does
not reuse a PCB or symbol owner token. SCH launch, capture, writer, snapshots
and verification generations retain separate issuers.

## Freeze an expected actor, then verify the actual transaction

WORKER `Pi` at 1856199 copies the consistency client and project manager's user
during construction. `Gd` at 2011459 initializes the consistency manager but
does not set a user. `Lg` at 2103244 constructs `Dg` and `Sg` before its later
`subscribe` assignment at 2115387. Consequently, a fresh ordinary manager has
the same constructor-time worker-user issue for SCH as for PCB. These source
facts do not expose or attest a live private worker field.

APP adds the transaction actor independently. `createProjectHistory` at
2604081 calls `L3` at 2602467, which selects `ctx.user.uuid`, reads that user's
names from the target project's users table and prepends `EDIT_HEAD`. APP
`xB` at 2601108 writes the same request UUID into the project modifier field.
The native SCH acknowledgment is not a backend actor receipt.

The [actor policy](current-backend-actor-adapter-plan-2026-10-16.md) therefore
applies without a new `/api/user` endpoint. Before dispatch, freeze the agreeing
UI actor and require exactly matching original project-user strings. After
the original root and Job have exited, compare the complete closed SQL effect
against that frozen actor, client, ticket, target, title and time window.
Do not select an actor from the changed database. A mismatch fails even when
the requested title persisted. It cannot authorize a retry.

The completed SCH clock comparison reports
`transactionActorMatchesExpected:true`, `backendActorPreverified:false` and
`futureRequestActorVerified:false`. This is an exact transaction postcondition,
not permission to act for that account in a later or cloud operation.

## Closure is not a timer-drain receipt

SCH `SCHEMATIC.ON_UPDATE` at 6204757 awaits `L0e` at 3795371 and then invokes
the unawaited `ZTe=Ta(w9,500)` at 5767624. `w9` at 5766787 can initialize missing
children, rebuild the temporary schematic map and pass content data. The
pre-dispatch full child-roster/AST guard excludes missing baseline holders;
it does not observe the private callback's completion or cancel it.

The lifecycle instead requires the retained normal-close receipt and original
root/non-breakaway-Job termination, then a complete closed SQL comparison.
That boundary prevents the admitted contained producers from running again.
It does not prove every scheduled write ran. A lost structure update, unexpected
child effect or native retry must fail the full comparison. No fixed wait,
extra Save, automatic inverse or replay makes it successful.

Before saved verification, a fresh SCH-owned generation must exclude persistent
upload replay and bind its source to the original closed result. The saved
metadata and child reads, second closure and final complete SQL comparison
remain necessary. `schematicSubscriberCompletionVerified` stays false.

## Clock and dispatch composition

The N0 collector and mutation share one retained dispatch mark. A fresh
Windows capture between them changes the supervisor lifecycle epoch and makes
the original clock observations stale. The writer clears the original mark
only after retaining the raw native reply and checking the post-write clock.
The clock relation also retains the exact authenticated dispatch scope and
passes it to every original SCH owner check across awaits. Neither lifecycle
guard was weakened to make the composition pass.

Backend persistence may occur after the native reply, as the buffered-upload
source shows. Its accepted time must be after the armed observation and no
later than the original termination probe's outer clock endpoint, within the
unchanged 60-second planned window. This is not a continuously observed clock,
queue-drain proof or power-loss durability guarantee. See the
[lifecycle implementation report](current-schematic-rename-lifecycle-2026-10-19.md)
for focused synthetic results and the remaining connected-validation limit.
