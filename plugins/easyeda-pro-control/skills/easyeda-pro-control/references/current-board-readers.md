# Project-local board metadata

Use this reader to resolve board identifiers returned by project PCB or
schematic metadata. A document-tree board is a project grouping, not proof of
physical PCB contents or a manufacturing release.

Query `project-board` with `includeSchemas:true` through
`easyeda_control_api`, then validate the exact request with
`project-board-validate`. Call `easyeda_control_project_board` with that request
and the authenticated fingerprint. The project must already be loaded with no
editor tabs or hidden editor frames. This reader neither opens a project nor
closes existing editors.

- `eda.dmt_Board.getBoardInfo` requires exact `projectUuid`, `branchUuid` and
  `boardUuid` in `target`.
- `eda.dmt_Board.getAllBoardsInfo` requires only the project and branch in
  `target`. It rejects a selected board, name filter or extra arguments.

The [public `getBoardInfo` method](https://prodocs.easyeda.com/en/api/reference/pro-api.dmt_board.getboardinfo.html)
selects by `boardName`. This native task equivalent instead requires the exact
`boardUuid` and rejects `boardName`; its argument contract is intentionally
different from the public wrapper.

Both methods validate two complete matching native board maps, bracketed by
project-owner checks. Selected lookup also requires its direct native getter
to match the full map. Missing selected boards refuse; a genuinely empty full
inventory returns an empty array. Malformed or changing unselected peers also
refuse a selected read.

The native equivalents return UUID, raw title, `zIndex` and ticket. Preserve
the title exactly; do not treat it as a normalized name or select by it. UUID
sorting is comparison order, not visual order. The complete sample is bounded
to 128 boards and 65536 UTF-8 bytes before selected filtering, after native
enumeration. The deadline stops later reads but does not cancel an outstanding
native call.

The [documented public board item](https://prodocs.easyeda.com/en/api/reference/pro-api.idmt_boarditem.html)
contains additional fields. This route deliberately does not claim public
object parity or return schematic/PCB child relationships. Matching board IDs
from separate metadata reads are observations, not an atomic hierarchy snapshot.

No canvas/source loading, cloud lookup, name lookup, clock/client query,
navigation, mutation or Save is performed. Complete observed maps do not prove
saved membership, persistent state, worker ownership, startup completion or
permission to rename. These methods are source-reviewed and offline-tested;
installed `0.3.0+codex.20261019143713` also passed both routes on a disposable
project containing one board. The selected UUID matched the full inventory and
direct getter, with two matching samples and runtime admission before and after
each call. This validates a populated selected-board case, not an empty-map
case, public name selection, saved membership or a later generation. No editor,
mutation or explicit Save was involved. The general discovery `liveValidation`
flag remains conservative; the historical result is not execution authority.
