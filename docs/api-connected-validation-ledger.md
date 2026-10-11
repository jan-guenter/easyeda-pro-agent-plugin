# Connected API validation ledger

This append-only ledger records independently reviewed disposable test cases.
It is outside the plugin package and runtime fingerprint. It neither changes
the historical validation registry nor supplies execution authority. A passing
case does not validate every argument, object family or lifecycle of a method.
Current runtime, context, preference, checkpoint and journal gates still apply.

## Entry protocol

Append a dated entry for each new result or correction. Do not replace an earlier
pending, refused or failed observation with a later success. Link a correction to
the earlier ledger case and explain what changed. Never replay an operation to
make its record look successful.

Each entry must identify:

- The exact installed payload, package tree, source/runtime fingerprints and
  external implementation tuple. A later generation needs its own admission;
  these cases do not automatically transfer to changed source or bundles.
- The fixed route and tested argument domain, including object family, document
  type, requested membership and supported encoding. Distinguish native task
  equivalents from public SDK execution or public-instance parity.
- The actual phases completed. Reads require receipt/result consistency and
  source correlation. Writes additionally require original identity authority,
  exact immediate effect, consumed Save intent, acknowledgment, reopen, immutable
  checkpoint comparison and complete collateral proof appropriate to the route.
- Hash commitments for retained evidence and the independent verification used.
  Keep raw projects, native identifiers, paths, credentials and private reports
  outside this repository. Unkeyed hashes detect corruption; they do not
  authenticate evidence against a writer with access to its storage.
- Remaining limits: refused domains, untested recovery/inverse paths, visual or
  electrical checks, and the point in time proved. A stored checkpoint or a
  successful read does not establish continuing live-database invariance.

Record pending work as pending. Append its terminal review separately. A native
acknowledgment alone is not success, and a completed saved deletion is not an
unsaved rollback or byte-for-byte history restoration.

## Generation G20261011-164600

The following cases used installed `0.3.0+codex.20261011164600` on disposable
data only. Production designs were not accessed. These are historical generation
bindings, not a claim that any current host is admitted.

| Binding | Exact value |
| --- | --- |
| Tested payload commit | `b2f60013123fb94d1fee2f3d6ddf2dad1f97fffe` |
| Plugin package Git tree | `db98b5e1ef0bf5934e949e0904fbc9405c65deac` |
| Facade source fingerprint, 202 files | `6c7f57ee8c970d8c0e845ad0764d1d6a5babc6c8edb4e036a2a5841e03e88590` |
| Runtime fingerprint, three files | `8610ba8c5ae61406526379fe205003ce5b3418de288cdcabdd3c31c573086d77` |
| Reviewed compatibility manifest SHA-256 | `bda17ee5420c04ada6c3c9f5c176c5a493f85e592f99259d958a98ec4ff99224` |
| EasyEDA Pro | `3.2.149.88089769` |
| PCB implementation | `3.2.149.5378b690`, SHA-256 `65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54` |
| Public API implementation | `0.2.53.aee2f57a`, SHA-256 `5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc` |
| Public adapter SHA-256 | `4da5b5184a78e2d3aca843dad6b147d7feb7ec1368160d73f49c4acbcf97dfdb` |
| Installed declaration SHA-256 | `32a0d2f8b4bc3d7b2b93b33499d9d768b0c23c77f45843a65166cf4e8ad6dab1` |
| UI implementation | `3.2.149.43637efe`, SHA-256 `12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a` |
| Desktop implementation SHA-256 | `10a427460d498667f6d1df9cd8899a1740afd9644cbf83ecaf80365d590869bb` |
| Upstream and extension versions | `1.0.0-rc.1`; Node `24.18.0` |
| Bridge and dispatcher | Bridge `1.0.0`; dispatcher `ded07x99dcxb504`, 67 methods; registry `34f1dcf29ebdf3cf` |
| Upstream tool catalog | 116 tools, SHA-256 `25d2575d98934d0b975b84bd235b5c263ce7b61279ba106a0fe330de7d5a7c45` |
| Upstream implementation tree SHA-256 | `d8335ae0ce52bd3bb2b62d72261499587df598265076a797dbd6e9300bbaa9c0` |
| Upstream execution-closure SHA-256 | `c7d7bb429315d4c504158de2e0eac75505f7de1daf6defc11fccb59c01a7e029` |

The frozen [compatibility manifest](https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/b2f60013123fb94d1fee2f3d6ddf2dad1f97fffe/plugins/easyeda-pro-control/reviewed-compatibility.json)
retains the remaining launcher, dependency-lock, module-graph and sandbox pins.
Publication and exact installed-file checks are recorded in the
[164600 release report](api-coverage-164600-release-2026-10-11.md).

### 2026-10-11: R01 and R02, explicit-ID standalone STRING reads

Case results: passed independent receipt and complete-source correlation.

- R01 used `easyeda_control_sdk_read` with
  `eda.pcb_Primitive.getPrimitiveByPrimitiveId`, one existing standalone STRING
  ID and the exact active project-owned type-3 PCB context.
- R02 used the plural `eda.pcb_Primitive.getPrimitivesByPrimitiveId` with a
  one-element ID array for the same original seed STRING. Its result was exactly
  the one-element array containing the R01 DTO, in requested order.
- Both are the maintained native-source DTO equivalent. The installed public
  singular method is a stub and the public plural wrapper delegates to it;
  neither public getter was executed. No public-instance parity is claimed.

The maintained evidence verifier accepted all three baseline/read receipt pairs,
including self-hashes, exact result bytes, request/path bindings, metadata and
attachments. `parseDocumentSource` parsed the complete 130-object PCB baseline.
Each result retained the exact full seed STRING record and an empty direct-ATTR
array. Contexts and private fingerprint commitments matched. Both independent
source/inventory/source cycles, their constituent double samples and result
consistency hashes matched the baseline.

| Retained evidence | SHA-256 |
| --- | --- |
| Complete baseline result, 38,743 bytes | `ac32d2fb46dea5f2a27b26d9314bd28d4509ec820e2738ba18af6a297268566d` |
| R01 singular result, 9,544 bytes | `c4384d6b3b14efff509aa0cb00a8e7f6010e2b0fb3555fbc016330cf3407d722` |
| R01 receipt self-hash | `f05974639f6bbfa7befac50eacec39dd8226d3a36678f184ace8c535636246fd` |
| R02 plural result, 9,547 bytes | `c8ca0f52fd4a76132cb3f0d502fb120622d0e4b850659ef919a58100cd888f86` |
| R02 receipt self-hash | `cb72e3bd39401d936976bdbe7a75ee8358d01773a6c3d13d218f2183530e6f10` |
| Parsed baseline source | `b4097f1492688b440b9cef327cd84df49921ffded0c3a7e632770aeef26fdad8` |
| Complete seed source record | `b8267797a299584b51172ddf7151feeb993c3fad90164405cfbdcc4cd9ab7b31` |

Separately, the maintained open-existing journal and all its phase hashes passed
independent verification. Its terminal result
`ccd52cff49864da07267598dd994b9d6eed807e747ac453aa5e6c3bf0c408340`
proved project/document open, no Save, unchanged complete logical SQLite state
and all 11 selected-branch documents. Its fresh pre-open receipt is distinct
from the original seed receipt; their source/checkpoint/logical hashes match.
The original immutable checkpoint rehash was
`5ff5b72842d12e9e6b05216526004b0152b723ed1c432aeb00fc34d06341ad2b`,
581,632 bytes, with exact retained file identity. The logical dump commitment was
`8c7ca53d648eac54ffe7359eeac50642d4a95415046bbac609da27f15a695da5`.

Limits: this tests one standalone STRING with no direct attributes. It does not
cover multiple-ID ordering, missing-ID refusal under a live connection, other
families, inherited/generated objects, selection changes or general persistence.
The independent review opened no current project database and makes no claim
that it stayed unchanged after these recorded observations.

### 2026-10-11: C01, explicit-black v2 text creation

Case result: completed with one acknowledged Save/close/reopen and independently
recomputed exact source and durable effects. No orphan or hard-stop remained.

The typed `pcb.text.create` operation used profile
`easyeda-pro-control.pcb-standalone-text-lifecycle.v2` on the same disposable
type-3 PCB. Tested properties were native-mil `x:195`, `y:900`, `fontSize:120`,
`strokeWidth:8`, with synthetic text `Agent v2`. The original journal-reserved
identity was used once; its raw identifier remains private. The created STRING
retained layer 3, default font, LEFT_BOTTOM, zero angle, unlocked state, zIndex
-1, no mirror/reverse/expansion and explicit `specialColor:"#000000"`.

Independent review loaded the maintained journal and verified all eight phases:
before, prepared identity/program commitment, apply acknowledgment, immediate
effect, one Save intent, one successful Save/close/reopen acknowledgment, upload
barrier and reopened source/checkpoint. The maintained v2 source and retained
authority/persistence verifiers were recomputed from the immutable checkpoints.
The retained verifier was used as an offline proof function, not a live recovery
action. Original reservation and acknowledgment matched; no creation or Save
was regenerated.

The sole live/source change was the new STRING. The original seed remained exact.
Across all 11 documents, 10 peer raw histories and 131 existing target records,
including their clocks, were unchanged. Independent raw-chain reconstruction
proved the original target prefix followed by exactly DOCHEAD then STRING.
The DOCHEAD update was the allowed bookkeeping change. No additional target
record, tombstone or hidden replacement was admitted. Stored and reopened new
STRING bodies matched, including explicit black; no null/black normalization.

| Retained evidence | SHA-256 |
| --- | --- |
| Terminal reopened proof, 63,711 bytes | `182058042aa205b69cf3444114a6b533e952763e7340ccbc3697a14ee79ae229` |
| Before source | `b4097f1492688b440b9cef327cd84df49921ffded0c3a7e632770aeef26fdad8` |
| Reopened source | `8b9ac728c1b3078dbd8911dfc00891a6880abae1b690c2de37a44e2091ac40a5` |
| Before immutable checkpoint | `5ff5b72842d12e9e6b05216526004b0152b723ed1c432aeb00fc34d06341ad2b` |
| After immutable checkpoint | `104005c12bc70e0444c4de98b84ee0f000d439ebdebf3821a794d92f0055c8ef` |

Limits: this is one default-profile creation case, not public
`pcb_PrimitiveString.create` execution, whole-method coverage, an unsaved inverse
test, general color support, visual clearance approval or fabrication validation.
No current database was read during independent review. This record does not
authorize another write without fresh context/source/checkpoint admission.

### 2026-10-11: pending when the initial ledger entry was recorded

- The separately requested saved deletion of C01's exact created identity was
  in flight. No successful deletion, rollback or restored-state result is recorded
  here. Append its terminal review if completed; do not overwrite this entry.
- Sealed flat-wire rerouting still needs a connected disposable lifecycle case.
  Historical wire evidence does not validate the new sealed profile.
- Closed free-schematic-container creation still needs connected validation.
  It creates no page; a future container result must not imply page or template
  creation support.

No whole-method validated count is derived from these cases. Runtime catalogs
and historical source validation bindings remain unchanged by this ledger.

### 2026-10-11: C02, saved deletion of C01's created STRING

This terminal entry resolves only the deletion marked pending above. Generation
G20261011-164600 and its external pins are unchanged. Case result: completed with
one acknowledged Save/close/reopen, no orphan and no hard stop.

The separate typed `pcb.text.delete` operation targeted exactly C01's original
journal-reserved STRING identity under the v2 standalone-text profile. It was a
new saved transaction, not an unsaved inverse. Independent review verified the
maintained journal and all eight phase hashes, the exact deletion acknowledgment,
immediate and reopened source proofs, and immutable before/after checkpoint
receipt bindings. The maintained Save-attempt inspection found one consumed
intent and no non-dispatch cancellation; one successful Save/close/reopen
acknowledgment was retained. The original identity, creation and Save were not
replayed.

The deletion's before-source equals C01's after-source. Its reopened source
equals C01's complete pre-create baseline, with the original seed unchanged.
The maintained persistence proof was independently recomputed. All 10 peer raw
histories across 11 documents remain unchanged, as do all 131 remaining target
records and their clocks. Independent raw-chain reconstruction proves the prior
target prefix plus exactly DOCHEAD and a STRING tombstone for the deleted
identity. No other target record was removed or changed.

| Retained evidence | SHA-256 |
| --- | --- |
| Terminal reopened proof, 62,984 bytes | `e6c6be08c4ac625472e597539805d70f5f88bccce030fd5bdf81f6dca24774d0` |
| Before source, C01 after-source | `8b9ac728c1b3078dbd8911dfc00891a6880abae1b690c2de37a44e2091ac40a5` |
| Reopened source, original baseline | `b4097f1492688b440b9cef327cd84df49921ffded0c3a7e632770aeef26fdad8` |
| Before immutable checkpoint | `104005c12bc70e0444c4de98b84ee0f000d439ebdebf3821a794d92f0055c8ef` |
| After immutable checkpoint | `82a4c89c088db24203928323697c91eee2769d1d4a83be699a921b0d419e3047` |

Source restoration does not restore whole history or database bytes: the creation
and deletion remain recorded. This case validates one saved deletion of the
newly created default-profile STRING, not automatic rollback, ID recreation,
public SDK execution or deletion of other object families. Independent review
used immutable checkpoints only and read no current project database. No later
live-state invariance is inferred. Wire rerouting and free-schematic creation
are not validated by this entry.

### 2026-10-11: C03, closed free-schematic-container creation

This terminal entry resolves the free-schematic case marked pending above.
Generation G20261011-164600 is unchanged. Case result: completed with the exact
durable effect, no orphan and no hard stop. The operation invoked no Save and
opened no editor, so saved/reopened flags correctly remain false.

The typed `document.schematic.create` operation omitted `boardName` and used
profile `easyeda-pro-control.closed-empty-free-schematic-create.v1`. Its active
editor was the sole clean project-owned type-3 PCB. One existing schematic
sibling supplied the default-name counter; the new free container used the next
default name. This is a native task equivalent, not execution of the public
create wrapper. It creates neither a schematic page nor a template or canvas.

Independent review verified the maintained journal and all seven phase hashes:
before, prepared plan, original native return, closed-target metadata readback,
upload barrier, final closed-target metadata readback and verified result.
Both readbacks bind the original returned identity. The barrier only awaited
already scheduled native writes; it did not save editor changes. Its retained
source hash commits the generated barrier program, not the document source.

The immutable checkpoint receipts and file identities passed independent
verification. Recomputed preparation and complete effect proofs exactly match
the retained plan and terminal result. The before-checkpoint equals C02's
after-checkpoint. Document count increased from 11 to 12. All 11 pre-existing
documents, their 331 current records and 368 raw record occurrences remain
exact, including metadata, headers and record clocks. The sole addition is the
original returned SCH identity with one current META record. Independent raw
encoding reconstruction proves exactly DOCHEAD followed by META, with an empty
source, empty board binding and null zIndex. No SCH_PAGE or other document was
added. There were no Save intents or Save acknowledgments.

In addition to the generation's UI/PCB pins, this route binds the native manager,
worker and document-event subscribers:

| Implementation | SHA-256 |
| --- | --- |
| Project manager `3.2.148.154949d9` | `23089ec50bf701191c52af4a214b0d19b14e3233ead1bb5ccd50cf443e9e8742` |
| Project worker `3.2.148.154949d9` | `2792c6c87e3c60e09c43f03494a9cbb24e4ebe9c385372bbaf877ed75083a949` |
| PCB main `3.2.149.5378b690` | `392995aeffcd72311a96f918c1ff68f7e10a087511fd75c9b823008b0ffa3530` |
| Schematic main `3.2.149.35ae2987` | `0ed765f9fbc6482a0d8c209a73316aee1e4605c3faa5dd6c434dbfe96019a88d` |

| Retained evidence | SHA-256 |
| --- | --- |
| Terminal complete proof, 846 bytes | `6f19784d75bb47b052946c3f48a18d03aa37d89da7d8b38c3a3d699585b0de3d` |
| Original native return, 97 bytes | `45d51202321d22c03b2c28a9c3f8a14028ac6a68f99fe994d360b70e0ab7c36a` |
| Before immutable checkpoint, 585,728 bytes | `82a4c89c088db24203928323697c91eee2769d1d4a83be699a921b0d419e3047` |
| After immutable checkpoint, 593,920 bytes | `78ecbf3439240b4904a8cc9cb6adeb2a760afa40ea975f12e0809c5bc5b2da24` |
| Before complete document-history projection | `a7e81611c82cbdc7d2989c52a79c990b1485d01f869b3bbf5e38dcc5093a4779` |
| After complete document-history projection | `060bfd7cd861425653880fe15cb1f4335a6c3a2f0afed8e0ce7de29a9e690e91` |

Limits: this proves one closed, unbound, default-named container under the
reviewed flat-project profile. Board attachment, page creation, template loading,
hierarchy, schematic editor opening, inverse deletion and recovery were not
tested. Complete selected-branch document-history equality is not an assertion
that unrelated SQLite tables or other branches are unchanged. Independent review
opened only immutable checkpoints, never the current database. The result is
point-in-time evidence, not an atomic lock against later user or native activity.
Sealed flat-wire rerouting remains a separate pending case.
