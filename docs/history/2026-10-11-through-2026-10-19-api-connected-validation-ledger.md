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
[164600 release report](2026-10-11-api-coverage-164600-release.md).

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

## Generation G20261011-204104

These cases were recorded on 2026-10-11, Europe/Berlin, after a fresh host loaded
installed `0.3.0+codex.20261011204104`. They extend the historical
[204104 release record](2026-10-11-api-coverage-204104-release.md), whose pending
live-test statements describe the earlier release boundary and remain intact.
Only disposable data was used. Production designs and their records were not
accessed.

| Binding | Exact value |
| --- | --- |
| Tested payload commit | `10972c0d68b11f87fffa5570c74c2294e1068aba` |
| Plugin package Git tree | `fe9acf1d0da7caa942a6ac3599efc7b337995709` |
| Facade source fingerprint, 203 files | `234eb8aa7f8263649ac654ac513ff318b0ac68a23fb22bf52aa970593b512556` |
| Runtime fingerprint, three files | `c4d9b3243e4679c55914b340813193fcd34878cc4a92b05e47dded2015fc6802` |
| Reviewed compatibility manifest SHA-256 | `00e5fac66a3044ce7f057ecee1cad3d3414ae29c1ebbf74a6f2ec39ea3944f32` |
| Installed inventory, 628 files and 16,896,277 bytes | `4ede1a212136aa657eed6d171bcc7d6bcc0d1b708d7ea3dc0c7fa46383c1531a` |
| Authenticated status result SHA-256 | `e4487f128dd1aef9d16110bf0738319f986420c5624fd055caab14147e44c989` |

The external application/SDK/bridge tuple remains the one recorded for
G20261011-164600. This generation additionally binds schematic implementation
`3.2.149.35ae2987`, SHA-256
`3f50136fb4ba2d5593beac7ef3e20ebe5275177b56bbcfdd297e79f176a6618f`.
The [connected follow-up report](2026-10-11-api-coverage-204104-fixture-validation.md)
records the exact external identities and retained evidence. The frozen
[compatibility manifest](https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/10972c0d68b11f87fffa5570c74c2294e1068aba/plugins/easyeda-pro-control/reviewed-compatibility.json)
retains all other pins. These bindings do not transfer to later source changes.

### 2026-10-11: R03, public system-library identity

Case result: passed two matching observations and independent receipt review.
`easyeda_control_sdk_read` invoked the public
`eda.lib_LibrariesList.getSystemLibraryUuid` with empty arguments on the exact
active ordinary type-1 disposable schematic page. It returned the system-library
constant as 32 lowercase hexadecimal characters. Independent inspection of the
pinned public wrapper and native UI getter confirmed the returned value.

This case covers one public identity read, not account-library enumeration,
component availability, asset access or writes. No hardcoded fallback supplied
the result, and no Save or navigation was performed by the reader.

### 2026-10-11: R04 and R05, explicit-ID root Text reads

Case results: passed independent receipt, source and immutable-checkpoint
correlation. `eda.sch_Primitive.getPrimitiveByPrimitiveId` selected one existing
root Text. `eda.sch_Primitive.getPrimitivesByPrimitiveId` selected the same Text
with a one-element ID array and returned exactly the singular DTO in that array.
These are native task equivalents, not execution of public primitive getters
or production of SDK instances.

All 14 DTO fields matched complete source/native evidence and the immutable
stored TEXT body, including native coordinates, zero rotation and unresolved
null style/alignment fields. No theme-default normalization was admitted.
The maintained state validator accepted both exact selectors. The fixture's
complete native snapshots before and after all three reader cases were
canonically identical and correlated with all 61 source objects. The immutable
checkpoint contained 12 documents and 165 records.

| Retained result | SHA-256 |
| --- | --- |
| R03 result, 6,630 bytes | `14511deb68514a57677eed2c4483b386b09d40fb7e58b3d5b1ac6baeffb00c18` |
| R03 receipt self-hash | `96c834500a530dfcf7054ac671cce300d2d46d0233e9c5085b1a9f17e45a8ba6` |
| R04 result, 8,670 bytes | `adf6260bccb415162f5dd8944d5941896a153846dadeccf3e377515c1d966098` |
| R04 receipt self-hash | `629c7d4c13693eed755ee2797fb4e9459b38f2a9f6a63c67ef539cf4e8b86953` |
| R05 result, 8,673 bytes | `4e7a657c92aecf2eb1512242165646c9bd3c8f4bf03cd6fd74bb0b19275ef137` |
| R05 receipt self-hash | `4540ac573c8b066d79e3dedb67e4875b470456edff7013727c5e565cbec7f05b` |
| Common canonical native snapshot | `f4661e01f653d9790ce74d31e0138e41c878ab8cb145594e9278b5503c840364` |
| Complete semantic source | `af079df2027d80fe7f579b4d3fd21ebb3ea1191099926e50cdcdfbc4971be3e7` |
| Immutable checkpoint | `1d81af3757177e62983152bc7d7447be36fb076d89e320774ae0bd9f507505ee` |
| After-reader checkpoint verification | `13e59ec0f3ccc6066f6fc399590b36ded09e3ad9fbc664d06d006b4d2bb7b9af` |

All six source/native/reader result-receipt pairs passed the maintained verifier.
Their requests, exact context, runtime fingerprint, metadata and attachment
bindings agreed. The main agent's before/after checkpoint-verification reports
retain unchanged source-database and complete logical-dump hashes. Independent
review rehashed and decoded the immutable checkpoint, not the current database.
Matching native/source evidence is separate from each reader's DTO output and
does not establish atomic or continuing state isolation.

Limits: no populated Wire/Bus, multiple-ID caller-order, missing-ID or wrong-family
live case was tested. R04/R05 cover only the one root Text and its one-element
plural selection. No writer, Save lifecycle or rollback was exercised.

### 2026-10-11: H01, guarded hover and observed overflow menu

Case result: one owned, foreground-window pointer movement succeeded, and the
menu effect was independently observed in separate before/after captures.
`easyeda_control_native_ui` used confirmed `request.action:"hover"` against the
retained contained application/window. The acknowledgment reported the requested
pointer position, `buttonInputSent:false` and `hoverEffectProven:false`.

Both managed captures and their image bindings passed receipt verification.
The independent reviewer viewed both images: the earlier capture had no expanded
overflow bar; the later capture showed Tools, Export, Advanced, Settings and
Help. The captures retained the same exact process-start/window binding.

| Retained evidence | SHA-256 |
| --- | --- |
| Hover acknowledgment, 400 bytes | `67880402cf237b12a686ca0ab58a4673695feec47bd6729275223b7ba8635a7f` |
| Before image, 121,037 bytes | `009d5ef3184cdfa6388ac6f4fe61a39f6c2373d03eb331a153a61442246d0f30` |
| After image, 123,324 bytes | `91336a7a0b4efeb0d2685169d21974b3e073f892b6eded363407fd5455a26abc` |
| Independent reader/hover review | `38c43c8d2348e57e09efe19397d2dd7c0367b888c9f8f3276eafdd57c42d0073` |

The visual menu observation does not come from the pointer acknowledgment.
Neither proves canvas snapping, a CAD coordinate, wire seeding, sealed wire
rerouting or a completed writer lifecycle. No wire success is recorded here.
The separate wire lifecycle remains pending; later native activity requires its
own evidence. No whole-method validated count is derived from these cases.

### 2026-10-11: R06–R08, populated Wire and mixed caller-order reads

These later cases extend, without replacing, the earlier R04/R05 Text-only
observations. Generation G20261011-204104, its package tree, fingerprints and
external pins remain unchanged. Case results: passed independent exact-DTO,
receipt, complete-source/native and immutable-checkpoint correlation.

- R06 used singular `eda.sch_Primitive.getPrimitiveByPrimitiveId` on one
  existing root Wire with three orthogonal LINE children, one literal NET and
  one custom Relevance attribute.
- R07 used plural `eda.sch_Primitive.getPrimitivesByPrimitiveId` with that Wire
  followed by the existing root Text.
- R08 requested the same two identities in reverse order, Text then Wire,
  deliberately opposite lexical ID order. Output preserved that caller order.

These are bounded native DTO equivalents. No public primitive getter, SDK class
instance, compiler, serializer or resolved electrical-net getter was executed.
The Wire's six root fields, each LINE's five fields, literal NET pair and custom
attribute identity exactly matched complete source and independently decoded
stored records. Native endpoint direction and null color/width/style were
preserved. All 14 Text fields also matched; null font/style/alignment values were
not resolved to theme defaults. Internal LINE/name/custom-ID sorting remains
separate from caller-specified top-level order. Custom attributes are identity-only.

The maintained state validator accepted each original selector list. All six
source/native/reader result-receipt pairs passed verification, with matching
exact context and runtime fingerprint. Every reader reported two matching
observations. Complete native snapshots before/after were canonically identical
and correlated with all 67 source objects. Independent decoding covered all
12 documents and 171 records of the saved seed checkpoint. The retained main
checkpoint verifier proved the source database and full logical dump still
matched that receipt after the readers; independent review opened only the
immutable checkpoint, not the current database.

| Retained evidence | SHA-256 |
| --- | --- |
| R06 result, 8,964 bytes | `216af27971981e4b6ba0d2d9b0b804e99803cff99ed045ad3edf190c2b6dd873` |
| R06 receipt self-hash | `10ac76da6ee0a9683d1e73cd88570bdc2011b9d16de2c81d972e92d79482bc3d` |
| R07 result, 9,235 bytes | `f8d274fdefd8f1560de25f0e1c960910ddaec3c1c4fe071a1d59e1bfd5f1a1aa` |
| R07 receipt self-hash | `a4d4b3a476c6776ff8459b07b1cba101400954384787cd16a9661bce9098651d` |
| R08 result, 9,249 bytes | `5a0353f2134a186842d48b7e2ae8b125d52529ca909ffb628d837971f7d65b06` |
| R08 receipt self-hash | `4a69d1f2d354943b3ce8c384e56ddb4fe6c20d1e4789f3f619bcf381abbf0ba1` |
| Common canonical native snapshot | `e9a54c66aa977eb37cb0d3a59acae867aba0173c5135da3caa9c36d4dc2d8d83` |
| Complete semantic source | `c9e04b15352712d36cf6ba3a641622c58d81fcccd8fa86c670a6270305d6611c` |
| Saved immutable seed checkpoint | `9ccef95aa08d0e94c10ed77d39af875e6ebfbb00b173b444204daff15f1710aa` |
| After-reader checkpoint verification | `c74d276051d35630613d80f1bf6d80acaf3bca13e79f0e5c2284066d35fb8e69` |
| Independent private seed/reader review | `49c904e28cc9a16054ab0ed65a037702aef5871aad031a801d7dc32ae7026a59` |

Fixture preparation was separate from these read-only cases: native UI created
and named the disposable wire, then consumed one Save. Independent comparison
retained all 165 original decoded records, all 11 peer documents and 66 imported
atom-header occurrences. The sole new records were the six wire records. The
maintained materialization proof accepted the named seed and its explicit
stored/native attribute-encoding differences. This is not a sealed reroute or
completed writer Save/reopen case. Offline reroute preparation on this generation
refused the native-created WIRE's absent `locked` field; no value was fabricated
and no guard was relaxed for these reader results.

Limits: one populated Wire, one Text and the two orders of their two-element
selection only. No Bus, missing-ID, wrong-family/owner, descendant, duplicate-ID
or public-instance connected case is accepted. No inverse, rollback, reroute,
atomic isolation or continuing database invariance is implied. The runtime's
historical validation labels and whole-method counts are unchanged.

## Generation G20261011-220050

These cases were recorded on 2026-10-12, Europe/Berlin, after a fresh host loaded
installed `0.3.0+codex.20261011220050`. They extend the historical
[220050 release record](2026-10-12-api-coverage-220050-release.md); its earlier
pending-live statements remain intact. Only disposable data was used. Production
designs and their records were not accessed.

| Binding | Exact value |
| --- | --- |
| Tested payload commit | `e566f2ab8bc73c8748e86c5f2cecdf5f2a86114b` |
| Plugin package Git tree | `2cfe8e8e1054efd44eb4035bb4a569097b6ebdad` |
| Facade source fingerprint, 204 files | `bea391898a967dc51a49fee7d04b34372fdcd0758c267f914043713db6a0e083` |
| Runtime fingerprint, three files | `a350c6fe19e782d595a173d9208d7e4c394eb49d9b88dba88e8ef2719224acbc` |
| Reviewed compatibility manifest SHA-256 | `e1baee7c8aeb9eb30c673c2f27e0e2fde627096e20bb61c1caf69dc4eaef6144` |
| Installed inventory, 631 files and 16,950,087 bytes | `78fe67d2929cd0cd16dbea6425ac49782308dfc23951be6604c0c1f56ea6ecc7` |
| Independent fresh-host package audit | `434aadbb4aa06ee1905aad4ab72eb166df8ba6a29d5a2bc8b139bb607780b33d` |
| Authenticated status result SHA-256 | `9ed6ed9bc87822df23dccb8196c7ad474a006e91c3d3d8d585b2646febb5e465` |

The external application/SDK/bridge tuple remains the one recorded for
G20261011-164600, including EasyEDA Pro `3.2.149.88089769`, public API
`0.2.53.aee2f57a` and dispatcher `ded07x99dcxb504`. The schematic implementation
remains `3.2.149.35ae2987`, SHA-256
`3f50136fb4ba2d5593beac7ef3e20ebe5275177b56bbcfdd297e79f176a6618f`.
The [frozen compatibility manifest](https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/e566f2ab8bc73c8748e86c5f2cecdf5f2a86114b/plugins/easyeda-pro-control/reviewed-compatibility.json)
retains all remaining pins. The independent audit matched every installed file
and committed mode and bound the actual host entrypoint, executable and process
identity to those bytes. It is not a process-memory attestation. Authenticated
status separately reported the matching runtime tuple and no incomplete
operations at its recorded boundary. No later generation inherits this admission.

### 2026-10-12: R09, configured font-title observation

Case result: passed two matching observations and independent receipt,
native/source and immutable-checkpoint verification. `easyeda_control_sdk_read`
used `eda.sys_FontManager.getFontsList` with exactly empty arguments on the
owned ordinary type-1 disposable schematic page.

This is the bounded configured-title native equivalent, not public getter
execution or an operating-system font inventory. Its authority is
`configured-font-title-observation-not-whole-preferences-or-installed-font-proof`.
The result contained 10 ordered titles totaling 52 UTF-16 code units, within the
512-title, 1,024-code-unit-per-title and 131,072-combined-unit bounds. Titles
remain private. The maintained payload validator reconstructed the complete
enriched result from its six raw fields. Its value was present, with no undefined
paths, and the two-attempt sample commitment matched.

The maintained evidence verifier accepted every before/read/after result-receipt
pair, including explicit success, self-hash, result-byte, request, context and
complete fingerprint checks. Complete native snapshots before and after were
canonically identical and correlated with all 67 semantic source objects.
Comparison with the previous generation's reopened seed accepted only eight
unstored inherited attribute IDs regenerated at unchanged order. Stored IDs,
geometry, values, styles, visibility and pin nets remained exact.

Both immutable checkpoints matched the original saved seed. Independent decoding
reproduced 12 documents and 171 materialized current records, including all 11
unchanged peers and 66 imported atom-header occurrences. The current-record
count is not a raw history-occurrence count. Source/native materialization and
the complete logical dump matched at both boundaries. The reviewer opened only
immutable checkpoints, not the current project database or preferences.

| Retained evidence | SHA-256 |
| --- | --- |
| R09 result, 7,963 bytes | `6d4628d0229ff3dec07190f32b12b034b8b47c5da1482ba171b9940d794b9493` |
| R09 receipt self-hash | `f361cb1bbff69d19b93ae778d60aba2d391c4969c03f49e5f32df0be14b39755` |
| Stable complete sample | `a3c485c24fa8840e70658c5f6b36ee09a67b924dc03126d2c4c1a93603770b11` |
| Common canonical native snapshot | `f2c026737cadcdf4e06bd9dc21f34eeae7233b6b67c49b54d1edae89204fb616` |
| Complete semantic source | `c9e04b15352712d36cf6ba3a641622c58d81fcccd8fa86c670a6270305d6611c` |
| Before and after immutable checkpoint | `9ccef95aa08d0e94c10ed77d39af875e6ebfbb00b173b444204daff15f1710aa` |
| Complete logical dump | `b538b6c7cf3504150bb576459d69c4bc6711693ad4e1392efaeef9cbc72f5cb2` |
| Independently reproduced font proof | `4eb5d0d84e8b32410ae18ff50b22108e33865634c6192077019129baacb363f2` |
| Independent private review | `a9d75f59d31fd1530bbae8804822be317b4eac1713692a76011efedd501e42d9` |

Limits: one successful configured-title observation in one ordinary schematic
context. It establishes neither installed fonts, rendering, current-account
identity, persisted preferences, whole-preference equality, other document types
nor atomic or continuing state isolation. No Save or design mutation was part
of R09. Runtime historical validation labels and whole-method counts remain
unchanged. The separate wire execute was pending when this entry was recorded;
no wire effect, saved/reopened result, inverse or rollback is accepted here.

### 2026-10-12: C04, sealed three-segment wire reroute

This terminal entry resolves the forward wire case pending at R09's recording
boundary. Generation G20261011-220050 is unchanged. The typed `sch.wire.modify`
operation used `easyeda-pro-control.flat-wire-reroute.v1` on one ordinary
single-page schematic. It moved two bends of one existing named, unlocked WIRE
by 20 native units in X, preserving all three LINE identities and directions,
styles, caption fields, free/pin endpoints and the complete one-component,
two-pin topology. The WIRE's stored `locked` field remained absent.

The executor derived the original binding from its own complete observation and
checkpoint. It reached completed with saved/reopened true and no hard stop or
orphan. Independent review checked all 13 phase hashes, the original proposal
and binding, immediate/reopened source and native effect, one consumed Save
intent, one successful Save/close/reopen acknowledgment and complete durable
project proofs. No compiler, annotation, Save All, repair or replay was used.

The exact semantic source effect changes only three LINE coordinate records.
Eight unstored inherited native attribute IDs regenerated at unchanged order;
the maintained lifecycle proof accepts only that identity difference. Before,
apply and pre-Save retained complete graph observations independently reproduce
the same contact-incidence commitment and pin nets. The final reopened raw flat
observation is not retained by the executor: its final topology check is
separate from the independently recomputed source/native/persistence evidence.
Do not represent that final raw observation as independently reconstructed.

All 12 saved documents, 171 current records, 11 peer documents and 66 imported
header occurrences were checked. The native wire action reuploaded its six
existing group records with new tickets/client. WIRE and NET bodies stayed
exact. Stored Relevance order changed from 0 to 4, matching the original and
final native order already observed as 4; every other Relevance field stayed
exact. All 62 other target records, including their clocks, remained exact.
DOCHEAD changed only its client/time/version bookkeeping.

An extra fixture-audit assertion initially rejected those non-LINE storage
updates. Its failure is retained. A separate exact-case verifier binds all six
clock pairs, original/final clients, unchanged first-ticket metadata, complete
bodies and the immutable after-checkpoint. The unchanged maintained wire
persistence verifier independently reproduces the executor's proof. No general
storage, source or transaction guard was changed to accept this case.

| Retained evidence | SHA-256 |
| --- | --- |
| Terminal reopened proof, 128,768 bytes | `8dc984cbf861ad8f233dbfb4011b7ef795cb8a498081cb0b217eea7c815733c3` |
| Before semantic source | `c9e04b15352712d36cf6ba3a641622c58d81fcccd8fa86c670a6270305d6611c` |
| Reopened semantic source | `4d778f7bcdb3978e495b315d61dd6589bc1bb76ef022a471636e317778cce148` |
| After immutable checkpoint | `b4810435f176dea7a8c4e18a6b4ed006074cc5dee1a365278893e657270b92f1` |
| Complete contact incidence | `6e5ca63ba49a2ef17334269fa6ab04a60170b5b1c37981e14f39a876f34e5af5` |
| Maintained durable proof | `ef58a2180b8a28927f2c6fc5fa7fd513814868bb6a26f8cd427270d4587ce16e` |
| Exact-case independent proof | `0a0882557c05d146a94aba502bb2c6270122bafdc379c588ec32fe7eebd415ce` |
| Independent private review | `9c30dd2d3e2e2ebec24a66bd4943bccdac9c8d18da16373bd327c99f49b7aad5` |
| Separate accepted close-up PNG | `4c6b20e73f76e1ebbf407004111d2da0fcaddf32f35bf358ed86cfa40025c5f5` |

The separate managed close-up visibly shows the intended reroute with its
original caption and endpoints. Pixels corroborate geometry, not connectivity
or persistence. The subsequent reverse transaction was pending when this entry
was written; it is not rollback or recovery. C04 does not cover wire creation,
deletion, net/style changes, Bus, shared or pin-bearing junctions, arbitrary
schematics, recovery, unsaved inverse, production work or later generations.

### 2026-10-12: C05, sealed reverse wire reroute

This terminal entry resolves the reverse transaction pending at C04's recording
boundary. It used the same admitted G20261011-220050 generation, typed
`sch.wire.modify` route and `easyeda-pro-control.flat-wire-reroute.v1` profile.
The executor created a new transaction from a fresh baseline. Independent review
proved that its complete before-source, before-native and checkpoint matched
C04's accepted final state exactly. This was not an inverse/recovery dispatch.

The reverse restored the original bend positions through exactly three LINE
coordinate changes, preserving all three identities, directions and styles,
caption fields, free/pin endpoints and the one-component, two-pin topology.
All 67 semantic source objects remain. WIRE, ATTR, component and pin source
fields stayed exact, including the WIRE's absent `locked` field. The native
lifecycle proof admits only eight unstored inherited attribute IDs regenerated
at unchanged order. The complete fresh native snapshot after reopen equals the
terminal native snapshot exactly, with matching result/receipt, context,
implementation fingerprint and two-read consistency proofs.

The unchanged independently reviewed verifier passed once against the completed
journal, all 13 phase hashes and immutable checkpoints. State is saved/reopened
true, with no hard stop or orphan. Exactly one Save intent and one successful
Save/close/reopen acknowledgment passed the retained authority checks. No extra
Save, replay, compiler, annotation, Save All or recovery phase was used.

All 12 saved documents and 171 materialized current records were checked. All
11 peers and 66 imported atom-header occurrences remain exact. Six existing
wire-group records received new ticket/client metadata; the independent verifier
requires six distinct newer tickets, clients matching the corresponding
DOCHEADs and unchanged remaining metadata. Each full record body must match its
before or intended-after source object. WIRE, NET and Relevance bodies remain
identical across the reverse. Relevance stays at stored/native order4; no stored
body correction is admitted. All 62 other target records, including their
clocks, remain exact. Target DOCHEAD changes only client/time/version.

The original semantic source is restored, but the original SQLite bytes and
history are not. In particular, C04's materialization of Relevance order4 remains
stored. The seed's stored order0 is not restored or claimed as restored. The
unchanged maintained persistence and materialization verifiers independently
reproduce the complete saved-project proofs.

Retained complete before, post-apply and pre-Save raw flat observations
independently reproduce the original contact incidence and literal pin nets.
The final raw flat observation is not retained by the executor. Its separate
successful final topology check is not an independently reconstructed raw
observation. Final source/native/persistence are independently verified. Marker
projection and successful runtime guards preserve the sole free-end marker;
there is no separately retained complete marker-model snapshot.

| Retained evidence | SHA-256 |
| --- | --- |
| Terminal reopened proof, 128,370 bytes | `cd40ce350447b629161881a692c6dd08ad654f6186d62824a0208721baaee6f9` |
| Before semantic source, C04 final | `4d778f7bcdb3978e495b315d61dd6589bc1bb76ef022a471636e317778cce148` |
| Reopened semantic source, original geometry | `c9e04b15352712d36cf6ba3a641622c58d81fcccd8fa86c670a6270305d6611c` |
| After immutable checkpoint | `621cb2f6d3caea3a090302897b5660b174572039edfc908f61fb50c2afad6d83` |
| Complete logical dump | `ea3da0fa99b20b8e3bd269e97340ecee0cdbd3d50cb6d1acf1070ef10a28cd21` |
| Complete contact incidence | `6e5ca63ba49a2ef17334269fa6ab04a60170b5b1c37981e14f39a876f34e5af5` |
| Maintained durable proof | `63a238d478ff72b2a41a0c2c06550dc8ac307dec942352e3084e70aeab99606c` |
| Exact-case independent proof | `96b1b3881b98d1e25433ae351c1b668febb86cd21b1265171a6f40b5cd437ee2` |
| Independent private terminal review | `86b551ff19679ca6b0c55059f5ac14258c3f5edd1ca265066d5eeecf5d4e83fd` |
| Fresh native result | `893ef71e3e83b014b6fd76e03cb61bdfff028eb0014f96b56eb5a078f2b8d0f6` |
| Fresh native receipt self-hash | `a55a8ceb4cb2068319eda0af483ecf9896a3a9a645703d6d5a6940a3cc2c52fb` |
| Complete fresh and terminal native snapshot | `eeebbc2f8865ec3afd3cc63b1a22e7e89722ddaee72a4e012751080bb6bb8599` |
| Independent fresh-native correlation | `e9ac24c0d27f6b1990856c3db24c5ab130674c049972c642049d101d826e32a9` |
| Separate accepted reverse close-up PNG | `428a92b21c57157ef14b44bd7898cb8716b3013fd739a3264b5be90a9139b511` |

The main agent separately accepted the managed close-up showing the original
geometry, caption and endpoints. Pixels corroborate geometry, not connectivity
or persistence. Acceptance covers this ordinary named three-segment wire's
reverse saved/reopened reroute only. It does not validate rollback, failure
recovery, unsaved inverse, creation/deletion, arbitrary net/style changes, Bus,
shared or pin-bearing junctions, production designs, continuing state isolation
or later generations. Historical runtime validation labels and whole-method
counts remain unchanged. Subsequent editor closure and closed-file checks are
separate evidence, not part of this terminal transaction entry.

After this terminal review, the main agent requested normal closure of the
contained disposable editor. The native result reports requested true and no
prompt choice; subsequent discovery returned no editor observations, proving
exit at that boundary. No extra Save or Save/Discard prompt action was taken.
The maintained closed-file verifier returned explicit success, unchanged source,
both files matching their recorded hashes and equal complete logical dumps.
The closed source hash remains
`471d6b9e0aaad04d6efe55a5d2122bd468c0d4e5bff76534ce8e6dcf456edf89`;
checkpoint and logical hashes remain those recorded above. Their physical file
hashes differ, so logical equality is not byte equality. The independent
reviewer checked the retained closed-verifier result, not the current database.

| Subsequent closure evidence | SHA-256 |
| --- | --- |
| Maintained closed-file verification result | `66a958a015b1ddbb77d9061dbb179703787ab6a011e8828428067f8eb7356160` |
| Main-agent post-close retention-metadata comparison | `241b99472adc5ebfb0f02a6e637860f376779c630fd92b8d8ce8c58a79babfaa` |

The main agent's listing-only post-close comparison reports all nine retained
backup roots unchanged. It neither opened their designs nor deleted backups.
Metadata equality is not backup-content verification or deletion admission.
These are point-in-time closure checks, not continuing state-isolation claims.

### 2026-10-12: C06, final wire observation retained on 013324

Generation G20261012-013324 was admitted against the complete installed package,
its source/runtime fingerprints and unchanged external pins. The independent
process/disk audit checked all 636 files, 17,048,335 bytes and committed modes;
authenticated runtime admission followed separately. This does not attest
process memory. Production designs and their records were excluded.

A new disposable `sch.wire.modify` transaction used
`easyeda-pro-control.flat-wire-reroute.v1` to move the same ordinary named wire's
two bends by 20 native units in X. It completed saved/reopened with no hard stop
or orphan. This was a new operation with a fresh baseline, not replay of C04.
Root and independent review verified all 14 phase hashes, exactly three LINE
coordinate changes, eight permitted unstored same-order inherited identities,
one consumed Save intent and one successful Save/close/reopen acknowledgment.

The final raw flat observation is now retained independently of the terminal
durable proof. Its original plan/profile/context and source/native hashes pass;
independent reconstruction reproduces all five contact vertices and the
unchanged pin nets. Observer and terminal checkpoint receipts are distinct,
although their immutable database hashes match in this case. Before, apply and
pre-Save observations remain separately verified.

Complete saved-project proof checks all 12 documents, 171 materialized records,
11 unchanged peers and 66 imported header occurrences. Only the six existing
wire-family records receive permitted new clocks. WIRE, NET and Relevance bodies
remain exact, including stored Relevance order4. All 62 other target records
remain exact. DOCHEAD changes only the admitted client/time/version fields.
No historical order0-to4 exception is used for this new transaction.

Two managed artifact pages reconstruct the complete 56,467-byte final
observation with its original hash and JSON. A fresh two-read native result
equals the terminal native snapshot exactly; the main agent separately accepted
the close-up. Pixels corroborate geometry, not electrical or durable proof.

| Retained evidence | SHA-256 |
| --- | --- |
| Actual installed process/disk admission | `a97d9fdd7578aca237f80db108e5b36ea5f92be3b58b47788f1d98bb922b2001` |
| Final raw observation artifact | `39d09e1ae44afe1c1ac278c2757b7cd631da7ecbd32b45649b4382fdd5f475d2` |
| Terminal reopened artifact | `1a2b3d6f7fd32b239123dabc75a765993db94b71cb486ff6300bf3e1d9fcf646` |
| Observer and terminal immutable checkpoint | `78e2cf5a7d7a15f0707be543867e2475fb81c62cb419ee44f6c4d67fa4e73dc0` |
| Independent complete exact-case proof | `335d06740b79618b0ca6e6c95ce250d455a588111a77a36792b80304c9eac0d6` |
| Independent terminal and fresh-native review | `b0b93da7f313da3eeff83dd826923d6095d021d23ab2781b2ec9d5d54e4bf7d9` |
| Managed two-page transcript | `e8c291d7cf90aaa65e21f9bec7da04fadd671c3710d9bc91bd2dab66f2460256` |
| Fresh native snapshot | `85b201b4e151859d3876d2d38b57631d04946602b15ac3beee695cefc1adecff` |

Acceptance covers this new commit path only. It does not validate the four other
new final-observation retention paths, failure recovery, rollback, arbitrary
wire creation/deletion, other graph shapes or a later installed generation.
A separately journaled reverse operation was pending when this entry was written.

### 2026-10-12: C07, separately journaled reverse with retained final contacts

After C06 acceptance, a new `sch.wire.modify` transaction on the same installed
G20261012-013324 generation returned the three LINE coordinates to their prior
positions. This was a separately prepared forward operation in the opposite
direction, not rollback, recovery or replay of C05/C06. It completed
saved/reopened with no hard stop or orphan and exactly one consumed Save intent.

Complete proof preserves all 12 documents, 171 materialized records, 11 peers
and 66 imported header occurrences. Only the intended three LINE geometries
change. The six existing wire-family records receive new clocks; WIRE, NET and
Relevance bodies remain exact, including Relevance order4. The other 62 target
records remain exact. Original source geometry is restored, not the earlier
SQLite file, record clocks or history.

This case also observed the exact intended durable effect before Save. Its
post-apply checkpoint still matched the baseline, while the separate pre-Save
checkpoint already contained the intended reverse effect. The maintained
complete-project proof admitted that exact effect; it did not infer it from a
timestamp or broaden the permitted delta. The executor then consumed its one
Save/close/reopen attempt and checked the final durable state again.

The retained final raw observation independently reproduces all five contact
vertices and unchanged pin nets. Its source/native/context and original
plan/profile bindings pass. Observer and terminal checkpoint receipt paths are
distinct, while their immutable database hashes match. A separate two-read
native result equals the terminal native snapshot exactly.

| Retained evidence | SHA-256 |
| --- | --- |
| Final raw observation artifact | `fe394fd1b0fa09586ebd018954b60830f6d86e43e78997a070949c1b9481f983` |
| Terminal reopened artifact | `219696e446525fa8f904e895c1f6dd18a0d81fb8e85ffa203953e657a2e655fb` |
| Observer and terminal immutable checkpoint | `eadbdb76f0b8ba685f30d1021e59e5771aac51edb9e14a3df747f72f09fa0c91` |
| Independent complete exact-case proof | `da5be4bb56463cad919fecea54c1034c9e7968efb16540c10a00950b135e0275` |
| Independent terminal and fresh-native review | `4a8d713290c77d0865bcde60d17d9f605aaa089450d42cd5ade4db8b70fcce30` |
| Fresh native snapshot | `60933b01d414449e323c12edc06b10f76ef967f9c76418d345fcfcf426b872ae` |

This validates another new commit path on the same narrow reroute profile.
It does not validate rollback, retained-Save recovery, baseline reconciliation,
arbitrary wire creation/deletion, other graph shapes or later generations.
Managed paging was tested separately in C06 and was not repeated for C07.
The API region-capture PNG was a full-sheet overview, so it was not accepted as
a close-up. A subsequent owned native desktop capture showed the requested
close-up with the restored geometry and legible caption; the main agent accepted
that image. Native PNG commitment is
`fcb235b3a29de13ed3e75bc476ec66f714d729f6fb4b88aa9715c77f0021687c`.
These pixels do not replace the electrical and durable proofs above.

Normal application close followed by empty native discovery proves the retained
disposable editor exited. No Save/Discard prompt choice or extra Save was made.
The maintained closed-file checkpoint verifier reports unchanged source,
matching recorded file hashes and equal complete logical dumps. Closed-source
SHA-256 is `e7106f2084f673160d9edc7bf2f0ac97d2c8c9a5d07b85ce7ea07cdb4a918413`;
logical dump is `4bc3a64f44464d614977d3a7058c2b6b12a69bd23d284509fda23759540b0fa5`.
Closed verifier result commitment is
`69e7578f51163e3f270aa8e0cd040b4c93c652f144ec1dedb5b6734457e91683`.
The listing-only backup metadata comparison reports all nine retained roots
unchanged, commitment
`678b58ee002e2afebf52da572b951c56c964d21175369e27591405caa8ba6744`.
It did not read their entry contents or grant deletion authority. These are
point-in-time observations, not continuing isolation guarantees.

### 2026-10-12: scope correction for metadata-writing lifecycle evidence

Source review identified a delayed `project_structures` write shared by symbol
create/metadata modify, schematic-page create/rename, and PCB/schematic-container
create/rename. Their existing document-history proofs do not model that table
or prove operation-owned completion of the debounce/task2 job. A final matching
checkpoint is a point-in-time comparison, not that completion witness.

Earlier exact document, peer, raw-history and native observations remain in this
ledger with their original generation and scope. They do not establish the newly
identified SQL/job-completion requirement. This correction is not evidence of
historical project damage. Candidate030626 blocks these eight execution routes
and potentially dispatched nonterminal reconciliation until the missing contract
is implemented. Subsequent source tracing shows native Save also clears pending
geometry flags and schedules that job for schematic-page, symbol and PCB
editors. Candidate030626 therefore also blocks their design transactions.
Historical Save/reopen cases retain their actual document and point-in-time
checkpoint observations, not a guarantee that no later structure job remained.
See the [source trace](2026-10-12-symbol-delete-native-effects.md#existing-metadata-writers).

## 2026-10-13: C08, closed-symbol validation stopped before navigation

Installed `0.3.0+codex.20261013074635`, payload
`940c32082ead2753ac5bb90bf2cd4097df37b7e8`, package tree
`97dc810eece6fbe0da7a7a3e3c228315b8e979af`, was independently admitted in the
restarted official host. Source projection was
`6241777a0c68d86207613360700f49c42766090c7e7fbfd3ade169b6fb0e6757`, runtime
projection `b0d5c05f09155d3453a3dc138b18d7b635e93279bdd055bf198291e5e1f4ee20`.
External EasyEDA/upstream/native-helper pins were unchanged from its release.

The public disposable callback ran once for an existing ordinary project-local
symbol and companion PCB. The intended change preserved the symbol name and
changed only its description. Baseline launch/admission, startup marker creation,
normal close, closed database copy and the aged-head native main-reference stage
completed. The second application launch and admission completed. Its marker
read was rejected by upstream with `ERR_CONFIRM_WRITE_REQUIRED` before execution:
the fixed adapter had supplied `confirmWrite:false` to `easyeda_execute`.

The retained16-phase journal has no navigation or writer intent, no orphan risk,
hard stop or possible-mutation flag. No symbol edit, explicit Save or target
editor opening occurred. Root observed Start Page, requested normal application
close once without a prompt choice, then observed empty native discovery. The
disposable database remained byte-identical; independent checkpoint verification
also found matching complete logical dumps. Those closure observations are not
the coordinator's retained Job termination proof. The startup marker and permanent
claim remain; this is not a claim that no application state changed.

Retained commitments:

- Original journal: `5bb7d12375dfa7bee6cf70b8729c9f8c937377821665400e0f49121da830d604`.
- Refused marker-read result: `7fdb23ab8b23623b6476b9c27314fa130179cb5b6a14601ca446e01ea982340b`.
- Native main-reference result: `f38eb993c7a0c38ceaa6fc3395c2f49b2fa8cfec128dd1acb7e7dff4ad2fb78b`.
- Unchanged disposable database: `970d21b3903e727cc3fb97b843c43e188f38254d85f361e5439fc1a5d382f199`.

Source corrections change only the three fixed probes' transport confirmation;
their programs, effect models and execution guards remain unchanged. Existing
fixtures now enforce the actual upstream requirement. The original request must
not be replayed. No successful public closed-symbol lifecycle or ordinary writer
support is established by this stopped case.

### C08 recovery on restarted084617

The public `abandoned-before-navigation` resolution completed once on the
independently admitted084617 host. Original journal, all16 phase artifacts,
permanent target claim and fixture remained unchanged. The exclusive sidecar
SHA-256 is `99210312fc39bcf31bcd7b2c85a0875c61bc3305ce9b22ef3feed8d6a06117fc`;
body seal is `1850d1b44a0d7891ba08b2d339bb77c96090742232f402dd8f0aeb9d196c2b8f`.
Public unfinished-operation listing then returned empty. This is historical
abandonment, not completion, replay permission or retained Job termination proof.

## 2026-10-13: C09, closed-symbol validation stopped after startup marker

Installed `0.3.0+codex.20261013084617`, tested payload
`c2412d6244a1727c226edaba74022ef555edf473`, tree
`091958adfbd841393c692e7161e779d5f0a186db`, was independently admitted with
source projection `264de3df415805d60666c4d986dd7525dba722d645dd5073b3e8b2ca5f508a7f`
and runtime projection `70725d78d67a28c70a27b6bc7e045b0c8009f69b9cc0dac0c3e0376c763cf4f6`.
All1,104 installed files and modes matched the tested payload. External pins
were unchanged.

Native UI created a new disposable project with one shortcut resistor, one
explicit schematic Save and an initialized blank companion PCB. Normal closure
preceded read-only complete SQL/schema/history inspection:12 documents, an
ordinary two-pin PART, three linear history rows, four chunks and no snapshots.
The public validation used its new project/symbol identities and ran once.

Baseline contained launch, admission and startup marker creation completed.
The six-event journal stops before baseline close or any project navigation.
The next native window observation showed an empty-title71x32 tooltip and the
titled1384x736 application window, both root-owned Chrome windows. Windows
reported the tooltip as MainWindowHandle. Source review confirms this pair
fails the coordinator's one-window/equal-main-handle assumption; no owned-window
artifact was published. The public result reports only the coordinator failure,
so the window diagnosis is correlated source/observation evidence, not a retained
exception report.

Root captured Start Page, requested normal closure once without choosing any
prompt response, and observed empty native discovery. The fixture remains
434,176 bytes and byte-identical to its pre-call baseline. The journal has no
hard stop, orphan or possible-mutation flag. No symbol edit, Save, project open,
closed SQL baseline, terminal completion or original Job termination proof is
claimed. Marker and permanent target claim remain; do not repeat the request.

Retained commitments:

- Original journal: `d49b2ffe4301086ace20e5bf0799903dd0b944d59cd23b8408ced508901d5e3a`.
- Marker result: `95e709d18f9b01287c99d2bb976dc2bf9bc7f8df7e170cd145a65560798cb5dd`.
- Permanent claim: `3ba91d08631343523d54e6b8bf54b10ad0e1a7c0b633f72f7fa6a572f3ca5774`.
- Unchanged fixture: `9bb7dbd71256f102942daa11908165fec4d8eca5bfd580c20ddf8ab3e71c1a1d`.
- Start Page capture: `4326df65cd3808cc9c1871e4d8835917f6ed5dfbded3d66bc5528ed62ddf41c8`.

The seq16 C08 abandonment route does not admit this seq6 case. Ordinary symbol
execution remains disabled. This failure is not successful lifecycle validation.

### C09 recovery on restarted101000

The public `abandoned-before-navigation` resolution completed once on the
independently admitted101000 host, using its separate six-event profile.
All1,112 installed files and modes matched tested payload306871c5. The original
journal, marker-result artifact and permanent claim retain the hashes above;
the recovery leaves every original phase intact and makes no application call.
The exclusive sidecar SHA256 is
`78ec1b3520746e8d8c682161d4d588b5da09a3e31736465d83ba5f96086b4a39`, with body
seal `e9b231450d220cb22cd9052b0edf0f6c436c8dc866f322a06f28b291c1b7b4f2`.
This profile proves neither current source invariance nor process closure. It
grants no completion, restored execution authority or permission to retry.

## 2026-10-13: C10, successful marker read followed by pre-navigation stop

The admitted101000 host ran one new disposable closed-symbol validation,
`easyeda-20261013t111537z-e7df16d2`. The fixture had one ordinary resistor symbol
and a META-only PCB companion. The request kept the name unchanged and proposed
only a new description. Read-only preparation had verified the complete saved
schema and native history before dispatch.

Baseline launch, startup marker creation, normal close, retained termination,
closed copying and aged-head native main-reference qualification passed. Edit
launch and admission passed. The fixed marker-read result is successful, with
all six observations. The journal stops at sequence16, without navigation intent,
hard stop, orphan flag or possible design mutation. No writer, Save or target
editor opening was dispatched.

Root observed Start Page with an update offer, requested normal application
close once without a prompt choice and then observed empty native discovery.
The disposable file remains434176bytes and byte-identical to its baseline. This
does not establish the coordinator's original edit-Job termination or completion.
Marker, permanent claim and original journal remain. Do not replay the request.

Maintained offline readers accept the startup result, generated-code hash,
all navigation checkpoint predicates and exact navigation preparation. A fresh
public status after application closure reports Node `v24.18.0`; the retained
expected fingerprint requires `24.18.0`. Every non-disconnection fingerprint
field otherwise matches. Upstream source returns `process.version`; core
manifest validation intentionally stores the unprefixed semantic version.
The expectation defect would reject navigation admission. The original exception
was swallowed, so this is not a claim to have observed its exact throw site.

Retained commitments:

- Original journal: `81a9dcd23780f74acccc9a4306ba0ed40b37cb500d64a2ec093226f7e7d969ad`.
- Marker result: `139cff12b35cf44fdb8c9bf64cade04fd0185d946c39bd1379dc08eff5e96bb1`.
- Permanent claim: `e7c9d34f97ab3b15e261ec5fae2c86f97b1415d7026ff2c1a0a75302433d3b4b`.
- Unchanged fixture: `4ad992b9fd1448e07aa3395053397e970e3eb8007c4f35bb0d3be21ca5d0e0f7`.
- Start Page capture: `9eb38c13f1cf70f411be546de3d17631b5f775832fc0e8d40a46eb180b052f46`.

The scoped113000 release corrects the expectation, adds bounded failure
diagnostics and supports historical abandonment of this successful-marker
pre-navigation boundary. That recovery has not run. Ordinary symbol execution
and the other affected writers stay disabled; no lifecycle success is claimed.

## 2026-10-13: M01, authenticated calculation admission refusal

Installed `0.3.0+codex.20261013135500` loaded its four calculation-only tools in
a fresh host. Payload `546a75cac7f5d8c92c0b421a0a630e0d01398069`, package tree
`365b5f57274f5840b47c14e64b09500e1a6a138a`, source projection
`a230862cb3e50933b95ec8813c3db51659b73047fb65895bc1f0b1ac1740b1aa`, runtime
projection `fe016e31deb774dde190cd6598b5c2e9aecf207543b9bd59c4f35989b07d3ffa`.
The [PR11 delivery receipt](https://github.com/jan-guenter/easyeda-pro-agent-plugin/pull/11)
records exact installation and profile migration. The new API/PCB tuple and
installed package hashes are in the
[capability-specific review](2026-10-13-easyeda-3.2.206-compatibility-review.md).

Initial status was disconnected. After the user opened EasyEDA, a new status
authenticated the existing bridge: one established session, `loader_status`,
dispatcher `ded07x99dcxb504`, unchanged upstream closure and the exact installed
API0.3.50/PCB3.2.193 hashes. Its structured-content transcript commitment is
`67cd6abf9692028958c3d5fc581cb647044ffab497fb4f313ad46ef785c8351b` (23,846 bytes).
This is status evidence, not a managed design result/receipt pair.

Offline schema lookup and exact validation accepted
`eda.sys_Math.calculateArea` for `[(0,0),(10,0),(0,10)]`. One actual calculate
call then refused at `/connectedRuntime/easyedaVersion`: expected
`3.2.206.715d940d`, observed `3.2.206`. Source review places that comparison
before the generated SDK execute. No area value was returned; no successful
calculation, clipping, CAD or persistence validation is claimed.

The next candidate corrects this package-version/editor-reported-version
confusion without changing bundle hashes or old design pins. The installed
owner is not patched and the known refusal is not retried. No project/context
reader, navigation, Save, settings change or C10 recovery was invoked.

## 2026-10-13: M02/M03, supplied-coordinate math on installed161000

Restarted161000 loaded from merged main `2b280b0bc177a44a03a63be749a78d9921eade17`,
package tree `480709208526d69a9d1c05e692875e6f25881128`. Independent verification
matched all 1,125 installed files, 21,895,703 bytes and file modes. Inventory
SHA-256 is `1ef1e96c8601e5085ad3ac45fc4bf4b0acb46ea9f3bc071b5f20e6f83c556415`.
Actual facade68498 reports runtime projection
`3654c59582f1653094773e316f4268558a850786c84aa223810f2471f1745641`; prior51072
is absent. Source projection is
`54a886272cff526166f57b5d824198710313705336a42a3db33ca90502b2fe32`.

The first status had no bridge. After the user started EasyEDA, authenticated
status reported editor3.2.206, API0.3.50, dispatcher ded07x99dcxb504 from
loader_status, one established session and no upstream drift. The status
structured-content transcript commitment is
`08a0f11ebc4a2773329b2ef3d7cd1ec9bfc6e84e16c898a28fb2f91108f988d9`, 23,854 bytes.
Both calls below used that actual fingerprint, queried their exact offline
schemas and passed exact argument validation before dispatch.

- M02: `calculateArea` of (0,0),(10,0),(0,10) returned exactly50. Result transcript
  commitment `8f1089ce6f512fe0144c8ae1ff8f0b9a1b5b19fc9c8b92f8dd0c7a2bba765816`,
  1,444 bytes.
- M03: `subtract` of inner square (2,2),(6,2),(6,6),(2,6) from outer square
  (0,0),(8,0),(8,8),(0,8) returned one complete group. Its outer and sole hole
  each repeat their first point as closure, preserving all five points in that
  order. Result transcript commitment
  `75da8af5788574c71169529762376399a43080248f60d21b4a61dea2f732a24c`, 2,182 bytes.

Each public call performed one fixed SDK execution containing two synchronous
samples and passed complete before/after runtime checks. Returned fingerprint
commitment is `0b52775dc3b92efdeeaa4827423acf51cd7fb36d401b36ed0347710326bc5d20`.
These are transcript commitments, not managed design artifacts or saved-state
proofs. The two cases establish only these supplied inputs on installed161000.
No other method, crossing geometry, boundary behavior, editor, persistence or
later generation is validated. No project/context read, navigation, Save,
shared-setting change, bridge import or C10 recovery occurred.

The user asks the agent to handle EasyEDA startup itself in future sessions.
Restore a supported new-version launcher as the next compatibility priority;
do not make repeated manual startup the normal workflow or expose old editing
routes merely to obtain a launch tool.

## P01: current disposable opening and Component/Pad reads, 2026-10-14

Installed `0.3.0+codex.20261014180500`, source340 `769107bb`, runtime3
`f41fcf9e`, passed one ordinary launch and authenticated opening of the selected
disposable PCB. Project and document dispatch were each consumed once; exact
native target identity passed and the opening is terminal completed, without
orphan risk or hard stop. Journal commitment `099e6fa7`; terminal artifact
`4933cddb`. This is navigation evidence, not full initialization or persistence.

The current API/UI/PCB tuple was0.3.50.ab46409c/3.2.196.26ed3d6c/
3.2.193.682ed44e, dispatcher ded07x99dcxb504. All four calls used the same
authenticated fingerprint commitment
`cbff6a2ab94321b8a52129da391ff3c1d8ff38ac6e7e69b6cfadb33ed3e21684`,
an explicit disposable project/branch/document/tab, two matching native
samples and before/after runtime checks.

| Method | Rows | Observation SHA-256 |
| --- | ---: | --- |
| Component.getAllPrimitiveId | 2 | `88e1b68446a6c334820a673003bad51224ab6986bc0c90b449eeac2a0c26d2d1` |
| Component.getAll | 2 | `a6572523139eac132c465ffb6574dd9710c850219b154f206f3a231909a7c502` |
| Pad.getAllPrimitiveId | 4 | `28a87df66f996e65176454414d5863a6ba5e3c67bda0bec786e8c0f345faa8ac` |
| Pad.getAll | 4 | `201af77fda83a41c9021ac0ac50e171da71509e695d6820c9d1d4415dae6de4a` |

Ordered identities match the geometry rows within each family. Component
placement and Pad numbers, raw net text, placement, metallization and pad type
are observations only. No parent mapping is inferred from ID prefixes. The
transcript file commitments are `27330ead`/`d87a3923`/`bcf671da`/`b99345bd`;
private paths, project identities and design payloads are not published.

The user closed EasyEDA normally without a prompt. Supported retained-owner
observation proved the original root and Job terminated; receipt commitment
`f0ac7c02e7777de085b25b52d745c4d37c6a2bfc6ed68f7e498c537bef247abb`.
No explicit Save, design edit, discard or forced close was requested. Opening
permits ordinary application effects; unchanged storage is not claimed.
Production designs and their records were not accessed.

This case does not validate complete source, saved membership, ownership,
connectivity, writers, selected-ID reads, other families or later generations.
The inventory's generation-neutral live-unclaimed labels remain conservative;
this version-specific ledger is the connected evidence, not global authority.

## Generation G20261016-090000: complete project-only baseline lifecycle

Installed `0.3.0+codex.20261016090000` was admitted against main
`63453740b02b46519fb0e7b3dea109a2c7b4ec1d`, package tree
`ea0f43840044ae5ea700a1805aa9535cda4bb819`, source363 SHA
`5f7a89b09a9e99827908d7734e1ba472f1bf7454ff327a62f107ae77975f9a59`
and runtime3 SHA
`788d810d5e6ba6761889010191a775c60e08ecd68ad71a22030e33887c77f831`.
The exact installed inventory matched1,222files/24,192,640bytes and modes.
Its [frozen current opening profile](https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/63453740b02b46519fb0e7b3dea109a2c7b4ec1d/plugins/easyeda-pro-control/server/src/current-disposable-open-profile.ts)
binds APP `52f51ce4`, UI `3823ed6e`, manager `005584e0`, worker `b849bd12`
and schematic `d9d6a955`. API0.3.50.ab46409c, UI3.2.196.26ed3d6c,
PCB3.2.193.682ed44e and dispatcher ded07x99dcxb504 retain their exact
capability-specific admission. These are not the older design-writer tuple.

One existing disposable fixture completed initial PCB opening, normal close,
original termination and a closed baseline copy. Its original ordinary launcher
recorded termination before the retained baseline relaunched EasyEDA. Replacement
admission, inactive-cache observation and project-only opening then succeeded.
The opening explicitly accepted unqualified schematic-startup effects because
two active schematic pages exclude the narrower no-active-page profile. No
document navigation followed project-only opening. One normal close and the
original root/Job termination produced the final closed snapshot and capture
release. The complete24phase lifecycle is retired, with no replay authorized.

The installed offline analyzer accepted that retained lifecycle. It compared
the raw copies, complete logical SQL and all selected-branch native records and
provenance without opening the original project. Both raw files are byte-identical
598,016bytes/SHA`970d21b3903e727cc3fb97b843c43e188f38254d85f361e5439fc1a5d382f199`;
both native checkpoints are561,152bytes/SHA
`4ed9ca7c9ec086d5c79d7f059ca906eb66d12e08457a7f495848809b135f993f`.
All35SQLtables and18native documents match. Complete logical SQL is
`4d01daaf05d97cda374ef7319f4567458c4c71c684b14c5291738688033c2b21`;
native history is
`20b0b0629d86cdfcd7601b8747ea5509ad5dcd719079ee1d49368dfb16083588`.

Independent read-only review checked all24artifact hashes and canonical journal
binding `b3bf3385`, final snapshot `43b10bb7`, retirement `ef37a034`, close/session/
original-launch links and the two retained raw files. Native checkpoint hashes
were checked through the snapshot/analyzer commitments; that independent pass
did not reopen those external checkpoint files or rerun SQL comparison. The main
installed analyzer performed the full comparison. Its retained report is26,733
bytes/SHA`e5c45abebfd9a12bd7ba59ed590760f68c9addf421b0d9f89df485fa55dcff9b`.

Five native clock attachments share the original owner/source/scope and ordered
endpoints. Independent recomputation matches the separate elapsed ranges:
UTC446,073..446,391ms and QPC446,068..446,386ms. These observations do not bind
the document/backend/SQLite timestamp producers, prove continuous clock stability
or establish a writer deadline.

This is a successful disposable lifecycle and historical unchanged-result check,
not startup qualification, current-state authority, metadata-writer validation or
live validation of the later103000 reader. No metadata edit, explicit Save,
Save/Discard choice, restoration, forced exit or production-design access ran.
The retired operation must not be replayed.

## Generation G20261018-195000: disposable PCB title-only lifecycle

Installed `0.3.0+codex.20261018195000`, merged main
`418a62a690e6341fac842ce861547da3bfebdf7a`, package tree
`3c04b499bc30e8124ddee764d2b792a4c482e483`, passed one complete disposable
PCB title-only rename. Exact installed admission covered1,434 files, committed
modes, source462 SHA
`99990f25f08a077f2dfcb87a6678f5245f38e554c550be84880b201442fbab0f`
and runtime3 SHA
`fef90a4732987791fc0e15800e118634d3b9c3ebaa07a26b5b5882257765d0a5`.
Compatibility manifest SHA was
`715be80424de5b095dc512c22f8cf86202187daac7a2a21fddf778882b970312`.
The [frozen profile](https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/418a62a690e6341fac842ce861547da3bfebdf7a/plugins/easyeda-pro-control/reviewed-compatibility.json)
and its source profiles retain exact EasyEDA3.2.206/API0.3.50/UI3.2.196/
PCB3.2.193, native manager/worker/schematic, bridge and dispatcher pins.

The original-owner disposable route used the fixed project-qualified PCB
`updateData` title-only equivalent, not the public linked-reuse wrapper.
Closed baseline, fresh startup, actor/dual-clock checks, one native write,
original process/Job termination and exact complete stored effect passed.
All20 documents' non-target saved content,54 old history rows and58 old chunks
were preserved. Fresh cache-excluded project-only reopening matched the target
and all PCB metadata peers. Final normal closure, retained termination and
complete SQL equality passed. The original final response returned completed,
renameVerified and fullReopenReadbackInvariant, with no failed phase.

| Retained evidence | SHA-256 |
| --- | --- |
| Initial complete SQL | `4a302f94cdea0322635eae225992a494304d81d62615c2fea1a247400389f322` |
| Post-edit and final complete SQL | `2d7a11f2f9d24b2a10735a808850748d99559778f8663ecc8e5168ace7607df3` |
| Post-edit and final raw file | `e4434cc5d6a5a2d19729093485406e486499790e5f32d994a1d35bb5709d5b4d` |
| Reopened metadata reply | `e2213bb40b89f7784ab2f75faef5bf4de7f8abdf86ac8aacf5d0387343a46ff8` |
| Terminal journal,18,669bytes | `82c5dbbd6f43341537e42291bd37f9abdd961be410f2c6c0d4c3635df43d7c8b` |
| Journal self-hash | `4cbd60f8e96bc057925bde6aa266fc2e7ef662532b42006ba29419d3903872b8` |
| Original final tool response retained by root | `39a9792e798efa781384ca980897865a1cd47c8922649fce7635155226a9978a` |

Independent read-only review verified all53 phase-artifact hashes,137,703bytes,
journal self/plan bindings and stable before/after journal identity. The installed
coordinator performed full SQL comparisons; the independent pass checked those
retained results and did not reread the raw database. Artifact53 records the
pre-retirement intent and original exit proof, not final completed flags. The
original final tool response supplies those flags. The terminal journal has no
hard stop or orphan risk.

No explicit Save, inverse, restoration, forced exit or production access ran.
The title remains in the disposable fixture. No complete reopened canvas read,
callback-completion-before-exit, ordinary-project support or later-generation
admission is claimed. The earlier184000 failed case remains failed/retired;
this later success does not revive it or authorize replay.

## Generation G20261019-143713: page and board metadata

Installed `0.3.0+codex.20261019143713`, merged main
`f1fc00d1047045a514da9f464049efa59639bcd1`, passed four project-only metadata
reads on the disposable schematic-lifecycle fixture. Actual installed
admission matched the delivered 1,531 files, 42 directories and 31,319,304
bytes, source504/runtime3 and manifest pins. The
[batch delivery record](2026-10-19-current-page-board-batch.md#historical143713-delivery)
retains the package and offline-startup evidence separately.

All four calls used the admitted143713 generation, exact disposable project
and branch, no editor tabs and two matching complete native samples. Runtime
admission passed before and after every call. Selected reads matched their
complete map and exact native getter; the selected page also matched its
explicit expected parent. No navigation, mutation or explicit Save was
requested by these readers.

| Method | Observed scope | Observation SHA-256 |
| --- | --- | --- |
| `eda.dmt_Schematic.getAllSchematicPagesInfo` | One schematic container, two pages | `66afe37f21c1e38a7810b97bdec9048c17c7987c85e3a824ffe1ae8e5ffe5c8c` |
| `eda.dmt_Schematic.getSchematicPageInfo` | One of those pages, expected parent matched | `834c738b76dceda92d955cc14fa8ec113a4f576766908d9fb788e99cbe22cb30` |
| `eda.dmt_Board.getAllBoardsInfo` | One board | `172856904279976368b1cb4e0f615e9cbcbc0a163e90bfbed6868ad3c56ef65d` |
| `eda.dmt_Board.getBoardInfo` | Same populated board selected by UUID | `0d61226e9be33364c16d80378c118d336dc7ad84af97007738088f67fa5dd569` |

The board case validates both a populated inventory and a selected lookup;
it was not an empty-map observation. Empty maps and the selected/all schematic
container routes were not exercised by these four calls. These are native
metadata equivalents, not public-wrapper or public-object parity. They do not
establish saved membership, worker ownership, complete source/canvas,
connectivity, schematic-rename completion or later-generation admission.
Generation-neutral inventory and discovery live-validation flags stay
conservative. Private fixture identities and design payloads are not published.

## Generation G20261019-143713: disposable schematic title lifecycle

The same admitted installed143713 facade completed one new original-owner
disposable schematic-container rename through single-phase calls. Its initial
closed baseline covered 20 documents, 55 history rows and 59 chunks. Native
acknowledgment, retained root/Job termination and complete SQL comparison
verified the intended title/history/structure effect, preserving every original
history row/chunk, child sheet, peer and unrelated SQL cell. No explicit Save
or production-project access occurred.

A separately launched and admitted generation excluded inactive upload caches,
reopened the project without editor tabs and matched the saved container,
all schematic peers, complete child roster and both AST memberships/order.
Final normal closure proved the original process/Job exit and unchanged complete
SQL against the post-edit snapshot. The coordinator returned
`nextPhase:"completed"`, `renameVerified:true`, `busy:false`, with no failed
phase and a retired verification owner. Never replay this completed case.

- Baseline logical SQL: `2d7a11f2f9d24b2a10735a808850748d99559778f8663ecc8e5168ace7607df3`.
- Post-edit and final logical SQL: `1d270e35fd464f5f99ed17160306475aaafe6303f97ea894de373c06209c2ad6`.
- Intended appended plaintext chunk: `5b64b073ff681c1764f90f508bdc8f8272b080b4bad26eb7b82eb7090b6f4f8d`.
- Reopened raw metadata/child observation: `919fb8c0100c5f87d2b8cc2f6cc4b49ca591023db6a98240b30037543f785be5`.

This is saved metadata/roster verification, not complete sheet-canvas or
electrical-connectivity readback. Delayed subscriber completion and prospective
backend actor attestation remain unproved; actual saved actors were checked.
The route remains disposable-only, forward-only, without inverse or generic
SDK writer enablement. New `advance-batch`, runtime-lease/hash changes and later
installed generations are not covered by this historical single-phase case.
Earlier failed cases remain retired failures; none is revived by this result.
