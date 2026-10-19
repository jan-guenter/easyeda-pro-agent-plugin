# Current project-only board metadata

## Scope and result

The new `easyeda_control_project_board` reader observes the loaded local
project's document-tree boards without opening an editor. Selected
`eda.dmt_Board.getBoardInfo` requires exact project, branch and board UUIDs.
`eda.dmt_Board.getAllBoardsInfo` requires only the project and branch. These are
native-task equivalents, not public wrapper calls or `IDMT_BoardItem` results.

Each result contains raw `uuid`, `title`, `zIndex` and `ticket` metadata. Titles
are not normalized and need not be unique. The inventory sorts by UUID for
comparison, not visual order. A selected missing board refuses; a genuinely
empty full map returns an empty inventory. Results include the observed project
owner, complete-map count and explicit false authority/persistence flags.

## Primary sources reviewed

The official [getAllBoardsInfo documentation](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_board.getallboardsinfo.html)
declares a parameterless promise returning board items. The official
[IDMT_BoardItem documentation](https://prodocs.easyeda.com/en/api/reference/pro-api.idmt_boarditem.html)
includes name, parent project and schematic/PCB children. Those are richer
public objects than this adapter returns. The selected method's official page
timed out during this review; its installed declarations and implementation
were inspected instead. No documentation example was executed.

The following installed sources were read as data and rehashed on 2026-10-19.
Paths are relative to `resources/app/assets`; offsets are zero-based JavaScript
string offsets, not byte offsets.

| Source | SHA-256 | Relevant location |
| --- | --- | --- |
| `pro-api/0.3.50.ab46409c/api.js` | `021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76` | Selected wrapper 423589; inventory wrapper 423669 |
| `pro-api/0.3.50.ab46409c/api-types.d.ts` | `d5fe990034c55001302ea6c3f704c2d4b88cdf23253cc5293b3bad62a32b9def` | `IDMT_BoardItem` 3368; `DMT_Board` 3686 |
| `pro-mgr/3.2.184.355087e9/js/pro-mgr.js` | `005584e02cd9b2d49fdb387b2f997c1c8d3f88b0c48a7531c8097c483ed0bd2e` | `BOARD.GET` handler 2057426; `GET_ALL_KV` 2057792; route constants near 683640 |
| `pro-mgr/3.2.184.355087e9/js/project-worker.js` | `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` | `Cg` board manager 1969834; `get` 1970856; `getAllKVData` 1974138 |

The installed public `getBoardInfo(boardName)` calls `getAllBoardsInfo()` and
selects the first exact name match. The adapter deliberately selects UUIDs
instead. Its inventory route is singular `/PrjDB/board/getAllKVData`, unlike the
PCB route spelling. The manager qualifies that call with the explicit project
UUID. Selected `/PrjDB/board/getData` takes board UUID followed by project UUID.
Both handlers return the worker result; neither adds an error-to-empty fallback.

Worker `Cg.get` returns only the four fields above and excludes missing or
deleted records. `getAllKVData` enumerates `getAll()` and copies every remaining
record through `get`. It does not load canvas data or resolve children. Board
mutation and child-binding methods are separate and are not called.

## Observation contract

Each sample reads project identity/owner, a complete board map, then project
identity/owner again. Selected mode also reads its exact board getter and
requires equality with the already copied map member. Two complete samples
must match, including unselected peers and owner. The first sample is serialized
before the second begins so later object reuse cannot rewrite the comparison.

Both modes limit the full map to 128 boards and 65,536 UTF-8 bytes before
selection. All keys must be 16- or 32-character lowercase hexadecimal UUIDs and
match their own record UUIDs. Records must contain exactly the four native
own-data fields. Titles are bounded to 512 characters, `zIndex` is a bounded
finite number, and tickets are nonnegative safe integers. Negative zero,
coercions, accessors, extra fields and malformed peers refuse. The result,
transport envelope and final runtime response have separate 65,536-byte bounds.

The reader uses the unchanged project-only guard and current implementation
profile. It retains the original UI/DOM/tab/project and RPC owners across
awaits, allows only Start Page and the optional hidden blank placeholder, and
refuses hidden editors, dirty/restoring/history/read-only/concurrent or
unsupported project states. The runtime retains the authenticated bridge lease,
checks quarantine and verifies source pins and runtime identity before and
after dispatch. The ten-second deadline prevents further reads after expiry;
it cannot cancel an outstanding native request. Map bounds apply after native
enumeration and cannot limit that native operation's own work.

## Concrete omissions and verification

No public name selection, display-name normalization, child relationships,
public object parity, canvas/source traversal or visual ordering is provided.
No clock/client call, cloud fetch, navigation, mutation or Save is dispatched.
Two matching maps do not prove continuous exclusion, native worker ownership,
startup completion, persisted membership or permission to write. Separate board
IDs observed through PCB or schematic readers do not create an atomic hierarchy
snapshot. These limits are explicit in schemas and offline discovery.

The 18 focused synthetic tests pass. They cover complete-map bounds before
selection, missing and changing peers, exact selected GET agreement, empty and
sorted inventories, no-editor restrictions, owner/RPC/DOM/lease drift,
source/fingerprint changes, quarantine, timeout without retry, strict DTOs and
authority rejection. Runtime tests register cleanup for each newly created
private fixture before setup continues. Both TypeScript projects and targeted
type-aware lint pass with zero warnings. No live application call or production
design access was performed during that source/offline checkpoint.

## Installed143713 connected observation

Installed `0.3.0+codex.20261019143713` subsequently passed
`eda.dmt_Board.getAllBoardsInfo` on a disposable project containing one board,
then `eda.dmt_Board.getBoardInfo` for that same observed UUID. The selected
result matched the complete map and exact native getter. Both calls retained
two matching complete samples, passed runtime admission before and after
dispatch, and ran with no editors, mutation or explicit Save.

This is positive evidence for a populated selected-board lookup and its full
inventory, not merely an empty-map result. Empty-board inventory behavior
remains covered by synthetic tests, not this connected case. Public name
selection, child relationships, saved membership, worker ownership and
later-generation admission remain unproved. The general `liveValidation`
fields stay `not-recorded`; the version-specific result and observation hashes
are in the [connected validation ledger](api-connected-validation-ledger.md#generation-g20261019-143713-page-and-board-metadata).
