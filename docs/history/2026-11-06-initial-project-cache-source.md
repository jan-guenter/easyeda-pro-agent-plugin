# Initial project cache source projection

The exact installed current209 main and worker sources now have a22-span
initial-cache source catalogue. Its qualifier checks the complete pinned main
and worker before checking each literal function, size and hash. It includes
the original main histories query/mapper/branch traversal, worker SDK GET
wrappers, raw streaming parser, getFlowParse and openInCloud. This is inert
source data; it issues no native owner, request, continuation or writer grant.

The original main histories path is searchHistory → wB → yB → mB. For the
qualified initial selected branch, UB excludes the `start` branch and yB
returns the sole initial history row. Its exact projection order is:

1. id, uuid, parent, key, is_lock, num, snapshot_num, created_at, updated_at,
   lock_time.
2. iv, appended with the original history UUID.
3. dataStrUrl, appended with the selected project/history path.

The `snapshot` SQL column is omitted by yB. Therefore neither snapshot nor
snapshotUrl exists in this initial API row. Native integer/time text values
pass through the raw Z2 query path; the worker SDK GET/exec1/IA wrappers retain
the original result envelope and selected request fields. The encryption key
in the resulting index belongs only in the genuine private data plan and
original worker cache; public errors, results and logs must not reveal it.

The selected consistency manager inherits the first zy.flowParseFull, whose
cache callback emits untouched raw record strings. EDIT_HEAD is omitted from
per-document cache bodies. Each body contains the original DOCHEAD and its
following raw records joined with `|\n`, without a trailing delimiter. The
parser's temporary assignment to parsed P.ticket changes no emitted raw v.
PCB, SCH and SCH_PAGE are absent from Na's grouped library-type roster, so
the cache group IDs are their unchanged original document UUIDs. Initial
history num0 and per-document chunk0 omit both zero suffixes in Uo.

getFlowParse adds editHead first. Parsing the raw initial EDIT_HEAD stores its
original actor object at editHead[0]. At stream end it adds docs, then docIds:
docs[0] maps each document UUID to0 in original input order, and docIds[0]
contains those UUIDs in that order. The initial head index serializes the
ordered API row fields above, then editHead, docs and docIds.

The original cache puts are concurrent. Actual pinned openInCloud and parser
code on inert callbacks reaches its dropped head-index put while every
per-document put Promise remains pending. The head index is therefore not a
safe place to wait for earlier worker Promise fulfillment while holding that
worker. Original continuation needs separate bounded jobs and source-qualified
head-index admission, followed by success and actual same-Promise completion.
It cannot infer progress from a quiet task set or impose a one-active-job
ordering that the original source does not have.

Four focused regressions execute only the pinned API/parser method bodies on
inert rows and callbacks. They verify exact API projection/order, one-document
PCB and two-document SCH raw cache bodies/head index, pending-put ordering,
and unchanged SDK envelope/request fields. No original DB, network, native
Cache/Response or application process is used. Both TypeScript projects,
zero-warning targeted strict lint, repository/MCP/skill validation and the
complete installed-source qualifier pass. Native helper/pins/bundles are
unchanged. The next genuine initial-cache plan must retain its actual issued
checkpoint, completed inventory and decrypted raw history; this catalogue
cannot replace any of those inputs or grant a producer resume or Save.
