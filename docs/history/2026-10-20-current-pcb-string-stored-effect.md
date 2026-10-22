# PCB String stored effect

The new `current-pcb-string-history.ts` and `current-pcb-string-sql.ts` implement
one conditional, supplied-data Save transcript. They are not a writer, native
observer, Save continuation or proof that a real operation produces one upload.

The supported branch starts with one pending, token-owned String and no other
pending document, asset or buffered backend upload. It compares one complete
backend history chunk, a new history head and the corresponding project,
branch, structure and sequence changes. Additional uploads refuse. The complete
original lifecycle still has to establish which branch actually occurred.

## Pinned source trace

The installed files were read as inert UTF-8, not executed or patched. Offsets
below are JavaScript string positions.

| Source | Bytes | SHA-256 |
| --- | ---: | --- |
| `pro-pcb/3.2.193.682ed44e/js/pcb.js` | 10,976,299 | `217199c8532c48aa50ed5fc254ddf2e6d09c886984c9498b5eea4d1cf0b7ef33` |
| `pro-mgr/3.2.184.355087e9/js/project-worker.js` | 2,181,284 | `b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928` |
| `app.js` | 2,657,192 | `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c` |

PCB `publishPendData` at3145812 publishes the pending STRING and clears its
renderer cache. The worker subscriber at2112925 calls `remoteChange` with
`pend:true` and the original compiler token. That subscriber does not call
`uploadLocal`. A publication is therefore not by itself a durable history upload.
Other producers remain a separate exclusion requirement.

PCB base `save` at3147112 awaits its pending-publication promise and sends
the main PCB, BLOB and FONT document IDs to the project worker.
Worker `saveCanvas` at2144972 has two distinct branches:

- A token with pending data advances the worker maximum ticket once, then calls
  `asyncCompressFull` with the token, document intersection, client, backend time,
  selected-document version, worker user and new head ticket.
- A token without pending data calls `uploadCloud` over the shared buffer.
  This implementation does not model that branch.

The compressor at284133 resolves document IDs through the token and the requested
document intersection, and resolves record IDs through that token's sets.
For the supported one-String branch, the serialized content has exactly one
DOCHEAD and one STRING. It contains no META, BLOB or FONT record. The STRING
retains its publication ticket; the DOCHEAD has the separately advanced Save
ticket. Those tickets must not be collapsed.

The header encoder `xt` at241441 receives `uniqueId` as its final `editVersion`
argument from the compressor. The serialized DOCHEAD therefore contains the
compiler token, not `"3.2.206"`. The compressor's separate internal `onDocHead`
call uses `PRO_EDITOR_VERSION`; copying that internal value into the stored
header would be wrong.

Save supplies `worker.user`, unlike the fresh metadata-container constructor's
captured user. The history model admits its four-string account subset and
preserves the supplied account property order. It does not infer account shape,
origin or completeness from login state.

Compression removes pending state and republishes the String as nonpending.
Worker `uploadStructure` at2104005 skips the pending non-META publication but
schedules the nonpending one. The structure callback reads the new PCB
`version/updateTime`, the current maximum ticket and the existing complete tree.
For this transcript, only the target PCB clock fields change. The title, META
and every peer field remain unchanged.

Worker `uploadLocal` at2031178 queues the compressed payload after a cache write,
or uses the direct upload path if that write fails. `uploadCloud` at2022843
can combine buffered payloads and retry requests. A caller must capture the
complete interval; this model cannot infer upload count from one create or
one Save acknowledgment.

APP `L3/PB` at2602357 adds EDIT_HEAD with its own clock and names from the
original project users row, falling back to empty names when that row is absent.
Those names can differ from the worker's UI account names. Only the UUID must
match in this initial subset.

APP `saveProjectHistory` at2594406 selects a new head for locked or independently
aged prior heads. `bB`, `x4`, `DB`, `D4` and `xB` then allocate the history/chunk,
encrypt the complete plaintext, update branch head and update the project's
modifier/time. Existing-head appends take a distinct `OB` branch.

## Exact supported SQL relation

Preparation requires the original completed full SQLite reader and document-neutral
complete raw-history decoder. It binds the original maximum ticket, all target
headers, absence of the generated ID in every original raw record, absence of
existing target String records, ordinary target META and matching structure
clock. This is not complete live empty-board proof.

Verification preserves the complete old ciphertext and every unrelated SQL
row/cell, including resource assets, peers, account rows and scalar storage
classes. It checks exactly:

- One new history head with its native defaults and original parent.
- One new authenticated history-data chunk containing the exact transcript.
- The selected branch's new history UUID.
- The project's bounded local timestamp and original-SQL backend actor.
- Every selected lower-ticket structure row, with identical clock-only tree
  updates and the Save head ticket.
- The exact `history_data` AUTOINCREMENT allocation.

Schema, table roster and persisted properties must remain exact. Old chunks
cannot be re-encrypted or normalized. Duplicate, additional, missing or reordered
records do not become equivalent merely because the final String matches.

## Concrete omissions

The following cases refuse because their SQL or producer relation is not modeled:

- Multiple backend uploads, retries with additional durable effects or creation
  already persisted before the selected Save.
- Appending to a young unlocked history head.
- Equal-ticket or missing-row structure insertion.
- BLOB/FONT, custom-footprint, dynamic-copper or other-document changes.
- Nonmatching full account shapes, reused IDs or an existing target String.

The original joined owner, interval capture, complete live baseline, post-create
queue model, one-shot Save consumption, retained process/Job termination,
replay-cache exclusion, fresh reopen and visual comparison remain separate work.
All corresponding runtime, persistence and execution-authority flags stay false.
