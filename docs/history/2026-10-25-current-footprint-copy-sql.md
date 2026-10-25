# Current footprint copy: exact getter, append and complete SQL preparation

Date: 2026-10-25. This continues
[the footprint preparation record](2026-10-25-current-footprint-copy-preparation.md).
It adds pure comparisons only. No runtime registration, native dispatch, project
access, Save, version change, publication or installation occurred in this work.
The excluded production project was not accessed.

## Implemented scope

`current-footprint-copy-append.ts` retains the original completed SQL reader and
the original footprint copy plan. It derives exact current `Tg.getStr` bytes and
the metadata/canvas portion of `Tg.create`'s append from complete selected-branch
history. `current-footprint-copy-sql.ts` compares every persisted SQL property,
schema entry, table descriptor, row identity and cell against the narrow native
append effect. Successful results remain bound to their original plans/readers
through private WeakMaps; JSON copies cannot be adopted.

The getter profile admits one historical target fragment, an explicit complete
header actor and unique nonnumeric CANVAS/PAD/LINE IDs. It preserves raw canvas
body bytes and insertion order. Source metadata still uses exactly title,
description, tags and source; it does not acquire a symbol `docType` field.

For pre-dispatch maximum ticket M:

- `Tg.buildString` creates the new destination header and metadata at M+1 and
  consumes that ticket.
- Source `GET_STR` emits a fresh outer header at the current maximum plus one:
  M+1 before creation, M+2 inside `Tg.create`. It emits source META at the greatest
  source **atom** ticket, which need not equal the source DOCHEAD ticket.
- Its inner compressed header retains the source header's ticket, time, version,
  actor and stored editVersion. The outer header stamps current editVersion
  `3.2.209`. Both use the supplied current worker client.
- `Ni(empty, source, ...)` drops source DOCHEAD rows but keeps its META. The
  destination append therefore contains new header/META at M+1, a second new
  header at M+2, then the old source META and all canvas rows. That lower-ticket
  source META must lose. It must not be silently omitted as in the symbol model.

The comparison uses the previously derived native-create argument pair from
`currentFootprintCopyNativeCreateArguments`: source uuid/path, `isProject:true`,
`docType:4`, collision-free destination title, preserved description/tags and
empty destination source/version, followed by the same project UUID. This is
data for a future fixed original-owner coordinator. It is not authorization to
call `Tg.create`, the public copy matcher or clone.

## Complete SQL relation

Current worker `uploadStructure` explicitly excludes FOOTPRINT. This branch
schedules **zero** structure requests. All `project_structures` rows, duplicate
rows, raw structure text, tickets and its `sqlite_sequence` row remain exact.
The symbol model's two requests, ticket updates and extra structure row do not
apply. An exhausted structure sequence therefore does not block this operation.

For one isolated upload and an existing locked or independently aged head:

1. Append one selected `project_history_<branch>` row at maximum positive ID + 1.
   The generated UUID must be unhyphenated UUIDv4; key is 16 hexadecimal bytes;
   parent is the old head; snapshot is NULL; lock/num/snapshot_num are zero;
   lock_time is `1970-01-01 08:00:00`; created/updated timestamps are equal native
   UTC defaults within the separately supplied backend clock window.
2. Append one `history_data` row at its retained AUTOINCREMENT sequence + 1.
   Both UUID columns identify the new head. Decode bounded base64 AES-128-GCM
   plus gzip and compare exact plaintext; retain existing ciphertext unchanged.
3. Replace only the selected branch's history_uuid. Its other columns remain
   exact. Advance only the history_data sequence.
4. Update projects.updated_at using the supplied native local calendar offset
   and projects.modifier_uuid using the supplied backend actor. Native `xB`
   updates every project row, so this profile requires exactly one project row.
5. Preserve every other schema/property/table/row/cell exactly, including peers,
   users, resource bytes, structures and sequence allocation gaps.

Backend EDIT_HEAD has exact ordered uuid/username/nickname/updateTime fields.
Names come from the retained project users row, with empty names only when no
matching row exists. Destination DOCHEADs have current editVersion `3.2.209` and
omit user. Current constructor order captures `Tg.user` before manager login
assigns its user; a future live collector must still qualify that original
receiver's own undefined property. This source inference is not a live check.

The clock windows are separate, bounded supplied inputs, not observations.
Recent unlocked heads are refused: their in-place append branch is not modeled.
The aged branch binds the exact created_at literal, native Date parse and native
timezone offset and requires at least 61 seconds throughout the backend window.
Preflight also reserves bounded raw, encrypted and complete-inventory capacity.

## Current source basis

Paths below are relative to the installed application root. All source reads were
read-only. Acorn parsed vendor JavaScript; no application source was executed.

| Source | Complete path | SHA-256 |
| --- | --- | --- |
| Worker | `assets/pro-mgr/3.2.185.bf63a159/js/project-worker.js` | `0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046` |
| Backend | `app.js` | `52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c` |
| Package | `package.json`, version `3.2.209.8a704eab` | `c63c12edae82c39c1fb2c0f0dd0e27678b83526c89ea174b3b79655711da8e51` |
| Editor version | `version.txt`, `3.2.209.8a704eab.5a04a4, 10/21/2026` | `dcb366bd92736cca5736ab702fbe9381238a418e502e9c462a934a02e2e4090a` |
| Bootstrap selection | `editor.ini` | `ced74cf98aedf6b04d0f23871b945f4155978d7e35edbc1704b8cdaf566623f9` |

The worker is 2,181,308 bytes / 2,181,306 UTF-16 units; backend is 2,657,192 bytes.
Exact intervals below are zero-based UTF-16, end exclusive.

| Route | Interval |
| --- | --- |
| worker `Tg.buildString` | 1883915:1884565 |
| worker `Tg.create` | 1884898:1885523 |
| worker `Tg.canvasString` | 1889419:1889822 |
| worker `Tg.getStr` | 1890246:1890717 |
| worker `oO` / `Ni` | 265925:266811 / 266811:267362 |
| worker `getCanvasByConsistency` | 2146221:2146420 |
| worker consistency `compress` | 284133:290470 |
| worker `getCompressKeys` | 291095:291274 |
| worker `uploadLocal` / `uploadCloud` | 2031202:2031622 / 2022867:2024986 |
| worker structure gate | 2104024:2104242 |
| backend save history | 2594406:2595147 |
| backend history creation / actor header | 2604075:2604380 / 2602467:2602820 |
| backend project bookkeeping | 2601108:2601284 |
| backend encryption / UUID generation | 2583566:2583874 / 1322509:1322566 |
| backend version bootstrap | 2578439:2579576 |

Private source receipts retain full interval hashes and source text:

- Getter/append receipt SHA-256
  `9359d3762cd709f09de3ab3f87884313725d22cbd8e1c8ed223d208f45935df3`.
- Backend/worker/bootstrap receipt SHA-256
  `8e299e4c7d7b7d8e734e1e4017b799f30cb541096e105eac3d3dc065964055a8`.
- Backend review SHA-256
  `f3a70ed657130bef7f4a1ece5e0c8fbfcebfe93be883ccc79b5f7de7a2a868ee`.

Current backend base SQL, six migrations, native `runScripts` double-newline
splitting and dynamic branch CREATE formatting were independently rebuilt in a
new SQLite 3.54.0 memory database. All 35 tables / 84 schema entries equal the
existing fixed `nativeProjectSymbolSqlSchema` representation. Its name does not
imply symbol behavior: this current source derivation qualifies that exact
schema shape for the new comparator. No old worker/version/effect is inherited.
Schema source SHA-256 is
`6602a6b77a30f6dc0a1992a37e8241da93ec0cf261fe56304000d45ff783bf4a`;
parity result SHA-256 is
`083f60d11b945279fc119cc74c9ca6d67656f56da927a5da6574eafda38a9633`.

## Validation and remaining work

Seven focused synthetic groups cover exact getter phases/tickets/actors,
preservation of the losing source META, complete SQL with duplicate structures
and exhausted untouched structure sequence, unsupported source histories,
symbol-style structure effects, collateral/schema changes, wrong version,
client/actor/clock/canvas mutations, copied reader/plan/effect rejection,
accessor refusal, head aging and exhausted history allocation.

The first focused run exposed an extra identity field passed to the generic
history decoder. The call now supplies exactly projectUuid/branchUuid; the final
focused run passed all seven groups. Final selected type-aware lint passed with
zero warnings. An initial project type check passed; the final project check
reported only a concurrent change in `operation-artifact-queue.ts:27`
(`index` on `never`), outside this workstream. The enclosing batch must finish
that check. No full suite or build was run by this workstream.

Independent source review found no concrete defects in the final three code
files. Reviewed and tested SHA-256 values:

- Append/getter:
  `ab1de755c5d484154d8f5c5f0a22ee43556e8e53ca93865254898e49e35a7c1d`.
- Complete SQL:
  `898e5ba91aedc8dab07aaf3ce674b4db62e3bceebd4bd32c43a4b5e86b65c147`.
- Focused tests:
  `29db357216b44bfbc8f78df5cc5c29a2834d96ea0124605673b4202feabd7945`.

The following remain explicit barriers:

- Multiple source fragments, repeated/tombstoned IDs, NET normalization,
  numeric/prototype-like IDs, implicit header actors and other canvas/assets
  need separate exact getter/cache projections. Current refusal is intentional.
- The copied destination has two headers and duplicate META, so this source
  getter profile does not qualify saved destination GET_STR after reopening.
  A separate destination cache/getter model is still required.
- Actual original UI/worker/Tg ownership, undefined receiver user, backend actor,
  client and clocks, live source equivalence, no editor subscribers and isolated
  upload batches need a fixed purpose-specific collector/coordinator.
- `uploadLocal` parses first, awaits cache insertion and starts buffered upload;
  its acknowledgment is not persistence completion. `uploadCloud` retries,
  starts unawaited localSave/cache deletion and asynchronous syncCloud. Neither
  exact SQL nor stable counters proves producer completion or replay exclusion.
- One-shot dispatch/return provenance, complete generation closure, persistent
  cache exclusion, fresh saved/reopened comparison and safe inverse remain
  unimplemented. Footprint deletion is unchanged and remains separate.

Every execution, producer provenance, completion, generation closure, replay
exclusion and reopened claim stays false. These pure relations must not be
registered as a live writer or represented as connected validation.

## Same-batch continuation: saved destination getter candidates

The source-side work above is unchanged. The parent requested completion of the
separate destination projection before release. New
`current-footprint-copy-saved-source.ts` consumes only the original successful
complete-SQL effect, original SQL plan and exact completed after-reader. It
redecodes that reader's retained creation chunk, checks its original plaintext
hash and global maximum, and derives two exact fresh-replay getter candidates.
An equivalent new reader, JSON clone of a successful effect or copied descriptor
cannot supply this relationship.

This closes the earlier **pure destination getter/cache model** gap for the
already admitted narrow creation shape. It does not close live observation,
generation closure, producer completion or saved/reopened lifecycle gaps.

The source trace established these current native rules:

- Complete raw-history replay supplies the backend EDIT_HEAD actor, serialized
  as `{uuid, username, nickname}` in both GET_STR headers.
- Native per-type cache files retain raw DOCHEAD/atom lines but omit EDIT_HEAD.
  The footprint cache groups documents by FOOTPRINT type. This newly appended
  chunk contains only the new destination, so its first header synthesizes the
  actor once from that destination. With omitted header user, its exact
  serialized actor is `{uuid: destination}`; absent names are omitted.
- The two candidates remain separate complete strings. Matching a candidate
  does not prove which native cache path actually ran.
- Global maximum is M+2, GET_STR outer header ticket is M+3, and exported META
  ticket remains M+1. The copied lower-ticket META does not win and neither META
  occurrence is emitted by the inner canvas compressor.
- Both headers use the new supplied worker client and editVersion `3.2.209`.
  If the second creation timestamp is greater, header time/version and the inner
  ticket select that second header at M+2. Equal timestamps retain the first
  header and inner ticket M+1 because both native selection paths use strict
  less-than; the outer ticket still remains M+3.
- Both creation timestamps must be positive. Zero activates native edit-time
  fallback and replacement behavior, which is outside this projection.
- Canvas IDs, tickets, raw body bytes and ordering remain exact. There is no
  geometry, firstTicket or actor normalization.

Same-generation upload state is deliberately excluded. `buildString` preinstalls
a docType-only header before parsing; the undefined existing ticket and absent
EDIT_HEAD can produce an omitted inner ticket and `user:{}`. Neither encoding
matches either fresh-replay candidate. A real fresh manager must still be proved
by the future coordinator; this pure model does not assert one exists.

The independently traced current worker destination receipt has SHA-256
`29164e4b1cb9a3c11cbc13cbb8803a9c6349a24476228809fcc7bb82eec7c42b`.
It binds the same complete worker hash above and fourteen precise source spans,
including:

| Native method | UTF-16 interval | SHA-256 |
| --- | --- | --- |
| `flowParseFull` | 239200:241089 | `0a32d5d522f214faab4283c24bf666cbd67536c2087a47c989ff8763c4c61e34` |
| `onDocHead` | 275156:276360 | `0d8998d30474148fde6795b3fde0c6a57b8c57b1dbdf089aa9f24ac1f4b3452f` |
| `getFlowParse` | 2020325:2021153 | `73b0e0541118ecd7aac7e62fba245364f69d1c77c36cecb2b76dee1e1ad4db97` |
| `setEditData` | 1857186:1857789 | `0f0d25706407a59aa9e31b4c21723b7d66ab4e5aa605c6c13ff0c4754dd8f860` |
| `Tg.getStr` | 1890246:1890717 | `8f2466efb348dbaae6eee3631eec72f26a1547d9812a0c00126414e805fc6013` |
| `compress` | 284133:290470 | `a1484f1be967ce923222815bf39ebc6d62b62acaaf08c459eaf0450ff249e3ca` |

Four focused synthetic groups passed on the final unchanged source/test files.
They cover both exact actors and both clock orderings, same-generation/mixed
actor rejection, changed metadata/tickets/client/canvas/version, original SQL
relationship retention, strict supplied observation fields, accessor rejection
and zero-clock refusal. Final selected type-aware lint passed without warnings.
Final project-wide type checking also passed after the parent corrected the
concurrent artifact-queue error recorded above. No full suite, build, native
writer or live CAD operation was run by this workstream.

Final added code SHA-256 values:

- Saved destination model:
  `2c803ba797882b3acba239dbf60f86f77f69cc1fe17f9826d7b9233a4d31cf14`.
- Saved destination tests:
  `02367849b05c508eb02a1e9b5ee61ff8f50d02e8613af244beb494f89a9a2193`.

Execution, producer provenance, cache-branch observation, completion and reopened
claims remain false on both the descriptor and successful content comparison.
