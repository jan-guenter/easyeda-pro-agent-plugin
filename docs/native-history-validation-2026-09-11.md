# Native history decoding and materialization

The read-only implementation is `plugins/easyeda-pro-control/server/src/native-history.ts`.
Its tests are `plugins/easyeda-pro-control/server/tests/native-history.test.ts`.
The typed design and library executors use these snapshots for their durable before/after proofs. The decoder itself is read-only and does not authorize writes.

## Supported storage profile

`easyeda.native-history.linear-gcm-gzip.v1` reads an immutable `.eprj2` checkpoint with a caller-supplied expected SHA-256 and project identity. It opens the artifact read-only through a retained file descriptor, refuses symlinks, multiple hard links and SQLite sidecars, verifies the hash, and rechecks file identity and modification state after reading. Database extensions and trusted schema execution are disabled.

The reader follows the selected project's `branch_uuid`, validates that the branch belongs to that project, and follows `history_uuid` through the branch-specific `project_history_<branch_uuid>` table. The supported chain must be acyclic and reach a root. Snapshots are rejected. Each history row requires exactly the addressed chunks numbered zero through `num`, inclusive, stored as the history UUID followed by an optional numeric suffix. This inclusive chunk convention was checked against the installed project worker's native loader, not inferred from row counts.

Installed EasyEDA Pro `3.2.149.88089769` uses the following storage encoding:

- Base64 ciphertext in `history_data.dataStr`.
- AES-128-GCM with the history row's hexadecimal key and the hexadecimal history UUID as the initialization vector.
- A 16-byte authentication tag at the end of the decoded ciphertext.
- Gzip-compressed UTF-8 plaintext inside the authenticated envelope.

The module neither prints nor returns encryption keys. Cryptographic validation establishes that the encoded payload is consistent with its stored key; it is not independent proof of design intent or provenance. The external checkpoint hash remains part of the input contract.

Native records use `|` plus a newline as their separator. Each record contains a JSON header, `||`, and an object-valued JSON body. An empty body is a tombstone. Every independent chunk must establish its document with `DOCHEAD` before containing object records.

Materialization retains whole object records by document and object ID, selecting the highest ticket and the pinned native lexicographic client tie-break. It does not merge omitted fields. Conflicting records with the same ticket and client, or an unresolvable client tie, are rejected. Newer records can replace an ID's type. Deleted objects remain tombstoned internally so an older record cannot resurrect them. Validated `DELETE_DOC` markers retain inactive documents in complete hashes while preventing their selection for editing or binding. Duplicate JSON keys, unsafe property names, non-finite numbers and excessive nesting are rejected.

The output contains per-document metadata, typed object records and SHA-256 values. The complete `DOCHEAD` metadata participates in each document hash. Record ticket numbers are omitted from that semantic hash; object IDs, types and complete bodies remain included. A downstream persistence policy must explicitly review any metadata fields it considers volatile.

Bounds are 256 MiB per checkpoint, 16 MiB per encoded chunk after Base64 decoding, 32 MiB per decompressed chunk, 256 MiB total plaintext, 250,000 records per chunk, 1,000,000 cumulative records, 4,096 history nodes and 1,025 numbered chunks per node. Bounds cause rejection, not truncation. The cumulative record capacity was raised from 250,000 on 2026-09-19; total plaintext capacity was raised from 128 MiB on 2026-09-20. All other bounds and complete-history parsing/authentication checks remain unchanged. Focused tests cover exact aggregate byte capacity and overflow, authenticated checkpoint histories above the former byte limit and above the new limit, plus the existing aggregate and per-chunk record boundaries and decompressed-chunk overflow.

## Observed disposable fixture

An authorized native-created fixture was saved and reopened, then copied using the existing SQLite online-checkpoint helper. Its materialization succeeded with five history nodes, eight chunks and twelve documents. The PCB contained 145 native records.

The decoded PCB matched the independently observed native fixture:

- Two resistor components, both on the top layer and unlocked.
- One named net connecting pin 2 of one resistor to pin 1 of the other, with the remaining pads unnetted.
- One rectangular board-outline record measuring 395 by 265 native mil units.

An additional native property-edit round trip was saved, closed and reopened in each direction. Comparing all twelve materialized documents found only the selected component X coordinate, its associated label X coordinate, and PCB document metadata changed after the forward move. The property editor applied a delta relative to its rounded displayed value, as confirmed in the installed `moveOneObject` implementation; typing an absolute full-precision value had therefore produced a slightly different delta. A calculated inverse through the same native editor restored every object record exactly. Only the PCB's client, updateTime and version metadata differed from the original checkpoint. The final checkpoint was created through the authenticated MCP checkpoint tool and passed SQLite quick_check.

This early fixture test verifies the storage profile and a manually controlled native edit/save/reopen/inverse workflow. Later guarded API and automatic save/reopen results are recorded separately in the capability matrix; they are not inferred from this decoder test.

## Explicit limitations

- Only the selected linear branch is materialized. Unselected branches and unrelated relational tables are not included in the returned document hashes.
- Snapshot-backed histories, branch merging and extended record headers such as pending-edit metadata are unsupported and fail closed.
- The decoder does not reinterpret native geometry units or substitute transformed public pin data for native pad dimensions.
- No live database is modified. No project restore, library edit, route, pour, save or synchronization is performed.
- Transaction persistence validators compare complete selected-branch document records and model the authorized target-child consequences. The decoded document hash alone is not a proof of invariance for unrelated relational tables or unselected branches.
- Typed writers separately enforce their runtime, source-effect, persistence and recovery contracts. This decoder supplies no writer-admission flags; only the legacy writer and unrestricted execution remain disabled.

## Initial milestone verification

Thirteen focused tests passed. They cover authenticated decoding, corrupted tags and keys, Base64 validation, UTF-8 and decompression bounds, replacement and tombstone ordering, metadata hashing, document separation, malformed and duplicate-key records, immutable checkpoint reading, source hash and identity rejection, unsupported histories, symlinks and sidecars. Root TypeScript checks and file-scoped type-aware lint also passed. Broader existing suites were not repeated for this isolated addition.
