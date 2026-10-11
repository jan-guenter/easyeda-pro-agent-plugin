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

## Generation G20261011-204104

These cases were recorded on 2026-10-11, Europe/Berlin, after a fresh host loaded
installed `0.3.0+codex.20261011204104`. They extend the historical
[204104 release record](api-coverage-204104-release-2026-10-11.md), whose pending
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
The [connected follow-up report](api-coverage-204104-fixture-validation-2026-10-11.md)
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
[220050 release record](api-coverage-220050-release-2026-10-12.md); its earlier
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
