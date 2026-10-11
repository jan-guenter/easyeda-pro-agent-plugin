# 204104 connected fixture validation

Recorded 2026-10-11, Europe/Berlin. Installed
`0.3.0+codex.20261011204104` passed three narrow reader cases and one guarded
overflow-menu hover case on a disposable schematic. Production designs and
their records were not accessed. No new writer or Save lifecycle is accepted.

This is a follow-up to the historical
[204104 release record](api-coverage-204104-release-2026-10-11.md), not a rewrite
of its earlier pending-live-validation statements. The append-only
[connected ledger](api-connected-validation-ledger.md#generation-g20261011-204104)
assigns cases R03, R04, R05 and H01. Source changes made after this installed
generation require separate release and connected evidence.

## Admitted generation

The fresh host's installed package was independently compared against payload
`10972c0d68b11f87fffa5570c74c2294e1068aba`. All 628 files, 16,896,277 bytes and
committed modes matched, with no extras and stable file identities during the
audit. Payload and root-only follow-up commit share package tree
`fe9acf1d0da7caa942a6ac3599efc7b337995709`. The actual host entrypoint, working
directory, process-start/parent binding and pinned Node executable were checked
without starting a competing facade.

| Binding | Exact identity |
| --- | --- |
| Installed inventory SHA-256 | `4ede1a212136aa657eed6d171bcc7d6bcc0d1b708d7ea3dc0c7fa46383c1531a` |
| Source fingerprint, 203 files | `234eb8aa7f8263649ac654ac513ff318b0ac68a23fb22bf52aa970593b512556` |
| Runtime fingerprint, three files | `c4d9b3243e4679c55914b340813193fcd34878cc4a92b05e47dded2015fc6802` |
| Reviewed compatibility manifest SHA-256 | `00e5fac66a3044ce7f057ecee1cad3d3414ae29c1ebbf74a6f2ec39ea3944f32` |
| EasyEDA Pro | `3.2.149.88089769` |
| Public API | `0.2.53.aee2f57a`, SHA-256 `5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc` |
| Public adapter SHA-256 | `4da5b5184a78e2d3aca843dad6b147d7feb7ec1368160d73f49c4acbcf97dfdb` |
| Installed declarations SHA-256 | `32a0d2f8b4bc3d7b2b93b33499d9d768b0c23c77f45843a65166cf4e8ad6dab1` |
| UI | `3.2.149.43637efe`, SHA-256 `12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a` |
| Schematic | `3.2.149.35ae2987`, SHA-256 `3f50136fb4ba2d5593beac7ef3e20ebe5275177b56bbcfdd297e79f176a6618f` |
| PCB | `3.2.149.5378b690`, SHA-256 `65401cdc0a8f244db2ff2d8da88fd835b6e1fb3a3ecdbcfd975781502cb04b54` |
| Upstream/extension and Node | `1.0.0-rc.1`; `24.18.0` |
| Bridge/dispatcher | `1.0.0`; `ded07x99dcxb504`, 67 methods, registry `34f1dcf29ebdf3cf` |
| Upstream tool catalog | 116 tools, SHA-256 `25d2575d98934d0b975b84bd235b5c263ce7b61279ba106a0fe330de7d5a7c45` |

Authenticated status was responsive and reported no incomplete operations at its
recorded boundary. Its result SHA-256 is
`e4487f128dd1aef9d16110bf0738319f986420c5624fd055caab14147e44c989`.
Every retained reader request used the same complete fingerprint and exact
ordinary type-1 disposable page context. The
[frozen compatibility manifest](https://github.com/jan-guenter/easyeda-pro-agent-plugin/blob/10972c0d68b11f87fffa5570c74c2294e1068aba/plugins/easyeda-pro-control/reviewed-compatibility.json)
retains the remaining external pins. No pin was refreshed to obtain acceptance.

## Reader results and collateral evidence

R03 invoked public `eda.lib_LibrariesList.getSystemLibraryUuid` with `{}`.
Two matching observations returned the expected 32-character system identity;
independent static inspection confirmed the public RPC and native constant.
No account/library collection or asset was enumerated.

R04 and R05 used the singular and one-element plural
`eda.sch_Primitive` explicit-ID readers against the same existing root Text.
These are native DTO equivalents, not public SDK instances. All 14 fields
matched the complete source/native evidence and immutable stored TEXT body.
Coordinates and zero rotation were preserved. Null font, color, style and
alignment remained null, without resolving theme defaults. The plural result
was exactly the singular DTO in a one-element array. Requested identities
remain private.

The maintained evidence verifier accepted all six source/native/reader
result-receipt pairs. Before and after native snapshots were canonically equal
and both correlated with all 61 source objects. Source comparison found no
document, added, removed or changed records. Independent checkpoint decoding
covered 12 documents and 165 records and confirmed the exact stored TEXT body.

| Retained evidence | SHA-256 |
| --- | --- |
| Before source result, 29,502 bytes | `3a17cb5efa4a15d805b01c2412b51ea3557a6350a8faab40bbb8f01a837b094b` |
| Before native result, 58,713 bytes | `c28ab509745d68de1f3a6319ed17ec9aa89abc3de5474c23ec4ef3881b3f1bfe` |
| After native result, 58,727 bytes | `9707735660d5f6e0ba6a49b0ef922e75d35e53cdf1de6bf4a139ea0483ee6aec` |
| Common canonical native snapshot | `f4661e01f653d9790ce74d31e0138e41c878ab8cb145594e9278b5503c840364` |
| Complete semantic source | `af079df2027d80fe7f579b4d3fd21ebb3ea1191099926e50cdcdfbc4971be3e7` |
| Before closed-checkpoint verification | `71fac17365bef565ec9aab5ca42206945da6fba57d4e5f5831df786a40441dfa` |
| After-reader checkpoint verification | `13e59ec0f3ccc6066f6fc399590b36ded09e3ad9fbc664d06d006b4d2bb7b9af` |
| Immutable checkpoint | `1d81af3757177e62983152bc7d7447be36fb076d89e320774ae0bd9f507505ee` |
| Source database at both verification boundaries | `1a6862c9774d58260e6addeb383a59719077adfd0f82f39927f92f00e76857f0` |
| Complete logical dump at both boundaries | `4d6820b953d4a06951a25e3cf0eaaf9667e80b0e081158101a8236ed2eaf866b` |

The source-database and logical-dump equality above comes from the retained main
verifier results. Independent review rehashed the original checkpoint receipt
and immutable checkpoint, not the current database. The original open operation
also retained all 12 documents, the complete SQLite state and 66 imported
atom-header occurrences unchanged, with no Save. Its terminal proof commitment
is `9b87f09ebb608281b5293050c60b43ac59db290e3eb09394dc956c976b0c6d31`.
No navigation, reader, native input or Save was replayed for the audit.

## Hover result and separate visual acceptance

H01 performed one confirmed pointer-only hover over the observed overflow
control in the contained foreground window. The result acknowledged exact
pointer placement with `buttonInputSent:false` and `hoverEffectProven:false`.
It did not claim that the renderer processed a menu event.

Separate before/after managed captures retained the same process-start/window
binding and passed receipt/image verification. The independent reviewer viewed
both: the overflow bar was absent before and visibly expanded afterward with
Tools, Export, Advanced, Settings and Help. That visual comparison supplies the
menu-effect acceptance, not the hover acknowledgment alone.

| Retained evidence | SHA-256 |
| --- | --- |
| Hover acknowledgment, 400 bytes | `67880402cf237b12a686ca0ab58a4673695feec47bd6729275223b7ba8635a7f` |
| Before capture result, 1,189 bytes | `6398aca3dc09282525a21d57a1121db02350f0f9294e6f0b03b646ee630aeed4` |
| Before capture receipt self-hash | `8f5c10007f1132d9fa77708970979f162433540cc6c336b2a6434bffbf8da9e8` |
| Before image, 121,037 bytes | `009d5ef3184cdfa6388ac6f4fe61a39f6c2373d03eb331a153a61442246d0f30` |
| After capture result, 1,189 bytes | `913a03afd77e8efcbf31c2c32d6ae51b9e57e83c5ea9cf54d9866b50179615d0` |
| After capture receipt self-hash | `ab9ed2968606cf4c53fb90395263f51e58d5ea301f8c544d45c723032d12e8a7` |
| After image, 123,324 bytes | `91336a7a0b4efeb0d2685169d21974b3e073f892b6eded363407fd5455a26abc` |

## Independent review and limits

The private accepted review is committed by SHA-256
`38c43c8d2348e57e09efe19397d2dd7c0367b888c9f8f3276eafdd57c42d0073`.
Its initial 19-file, 19,820,939-byte inventory commitment is
`78ef2ca384ebe29da5737410223792363965d1568578dc99b5bf30a72f523b02`.
Eight later phase/hover/capture files added 255,112 bytes. The review therefore
rehashed 27 selected files totaling 20,076,051 bytes, but the 19-file commitment
does not include those later eight files. Their individual commitments remain
separate. Hashes detect corruption; they do not authenticate evidence against a
writer with access to its storage.

Acceptance is limited to one system UUID, one root Text through two selectors,
and one owned-window hover with an independently visible overflow-menu effect.
No populated Wire/Bus, multi-item caller-order, missing-ID or wrong-family live
case is accepted. Matching observations do not provide atomic isolation or
continuing database invariance. No canvas snapping, wire seed, sealed wire
reroute, writer Save/reopen, inverse, rollback or fabrication result is proved.
The separate wire lifecycle remains pending. Neither these cases nor native
input enables the blocked compiled-topology or unrestricted SDK paths.

## Later 2026-10-11 follow-up: R06–R08

This appended section extends the earlier Text-only boundary above; those
earlier case descriptions and limits remain historical. The same admitted
204104 generation subsequently passed three populated native-reader cases:
singular Wire, plural `[Wire, Text]`, and plural `[Text, Wire]`. The last request
deliberately reverses lexical ID order and returned the exact requested order.
Private fixture identities are not published.

The Wire DTO had six root fields, three internally ID-sorted LINEs with five
fields each, one literal-name pair and one custom Relevance identity. Every
returned field matched the complete source and independently decoded saved
checkpoint, including native endpoint direction and null color, width and line
style. All 14 Text fields matched the existing Text. Custom attributes remain
identity-only, and generated markers are not returned. The maintained mixed-state
validator accepted all original selectors. These are native task equivalents,
not public SDK getter execution, public-class instances or all-property parity.

Six source/native/reader result-receipt pairs passed the maintained verifier.
Their exact contexts and complete fingerprints agreed. The complete native
snapshots before and after the three reads were canonically identical and both
correlated with all 67 source objects. Independent immutable-checkpoint decoding
covered 12 documents and 171 records. A retained main-verifier result confirmed
unchanged source-database and complete logical-dump commitments after the reads;
independent review did not open the current database.

| Retained evidence | SHA-256 |
| --- | --- |
| R06 singular Wire result, 8,964 bytes | `216af27971981e4b6ba0d2d9b0b804e99803cff99ed045ad3edf190c2b6dd873` |
| R07 Wire/Text result, 9,235 bytes | `f8d274fdefd8f1560de25f0e1c960910ddaec3c1c4fe071a1d59e1bfd5f1a1aa` |
| R08 Text/Wire result, 9,249 bytes | `5a0353f2134a186842d48b7e2ae8b125d52529ca909ffb628d837971f7d65b06` |
| Complete source result, 31,131 bytes | `f0f12c5452e211619bb4f5a22362f3b218daaaffcb214d60d490579bdbffc000` |
| Before native result, 60,356 bytes | `06fddfb25be8afb1af36f24b4617c13b2683cf8bc0d6472d1888152c5b8faf4b` |
| After native result, 60,358 bytes | `d7b2f5f961e3cdb57a7c4eb1cf7e9c352e3fe5ac8bff1315ec5629f642726f10` |
| Common canonical native snapshot | `e9a54c66aa977eb37cb0d3a59acae867aba0173c5135da3caa9c36d4dc2d8d83` |
| Complete semantic source | `c9e04b15352712d36cf6ba3a641622c58d81fcccd8fa86c670a6270305d6611c` |
| Saved immutable seed checkpoint | `9ccef95aa08d0e94c10ed77d39af875e6ebfbb00b173b444204daff15f1710aa` |
| Source database at both reader boundaries | `93eb9a289edcf056c0893defb41dcf74ba43fcbf709e2f7f9fada6eae0bfeed2` |
| Complete logical dump at both boundaries | `b538b6c7cf3504150bb576459d69c4bc6711693ad4e1392efaeef9cbc72f5cb2` |
| After-reader checkpoint verification, 939 bytes | `c74d276051d35630613d80f1bf6d80acaf3bca13e79f0e5c2284066d35fb8e69` |
| Independent private seed/reader review | `49c904e28cc9a16054ab0ed65a037702aef5871aad031a801d7dc32ae7026a59` |

The [R06–R08 ledger entry](api-connected-validation-ledger.md#2026-10-11-r06r08-populated-wire-and-mixed-caller-order-reads)
retains the three receipt self-hashes. The immutable saved seed was separately
verified with the maintained materialization/storage proof, scope SHA
`edd0736caa6e1277a37d5008d203f8a69849b0632ab228e530bd79bc77d529ff`.
Native fixture preparation added only six wire records; all 165 original
decoded records, 11 peer documents and 66 imported atom-header occurrences
remained exact. One native Save persisted the name and its native caption
position change. These preparation facts do not turn the reader cases into a
validated writer lifecycle; no sealed reroute or close/reopen acceptance is
claimed here.

Offline preparation of the proposed reroute refused the ordinary native-created
WIRE because its source body omitted `locked`, while the installed adapter
required explicit false. The source/runtime representation was not normalized,
the fixture was not changed to manufacture false, and no guard was bypassed.
Any separately reviewed source fix needs its own release and connected evidence.

R06–R08 do not cover Bus, missing/wrong-owner/wrong-family or descendant
selectors, duplicates, other families, public-class parity, resolved electrical
nets, arbitrary styles, inverse, rollback or atomic read isolation. Matching
observations and checkpoint boundaries do not establish continuing invariance.
Runtime capability labels, historical validations and whole-method counts are
unchanged by this append-only evidence record.

## Saved seed reopen follow-up

The disposable seed was reopened at 2026-10-11T21:56Z; independent retained-only
review completed on 2026-10-12 Europe/Berlin. This extends the earlier seed's
pending-reopen boundary, not the sealed reroute writer's validation status.
No navigation or Save was replayed for the review.

The maintained operation loader verified all four open-existing phase artifacts.
Its terminal result reports the exact project/page opened, no Save, no hard stop
and no orphan. All 12 selected-branch documents and the complete logical SQLite
state remained unchanged. Independently rehashed open-before, open-after and
flat-membership checkpoints all equal the saved seed checkpoint above. Complete
decoding retains 171 records and all 66 imported atom-header occurrences.

Both new reader result-receipt pairs passed verification with the same exact
context/fingerprint. Reopened native source retained all 67 objects and the
semantic header exactly. The native snapshots themselves were **not** byte- or
canonically identical: the maintained lifecycle verifier accepted exactly eight
unstored inherited attribute ID regenerations, all at the same order. Every
stored ID/body, component/pin identity, geometry, value, visibility and net
remained exact. The unchanged maintained materialization proof passed against
all three immutable checkpoints, with the same scope hash recorded above.

The public flat-topology diagnostic reported one component and two pins, exactly
matching the reopened native pin-net values and source commitment. It used no
compiled cache and retained `transactionTopology:false`. Independent review
correlated that summary, its consistency hash and checkpoint/library bindings;
the public result does not contain the raw observation needed to independently
recompute the entire contact graph or create transaction evidence.

| Retained evidence | SHA-256 |
| --- | --- |
| Open-existing terminal proof, 5,749 bytes | `7134a018a3883250407ea89e5ec8687cb771914e89aedc9c988b606568248c3e` |
| Reopened native result, 60,362 bytes | `7da5f1dc90004242d2bfe14107f6340031713efc40dfdc400de6462517cc38b1` |
| Reopened native receipt self-hash | `6c8b8bcfab39f8203c882f98399fbb60dea13f0393a5d3fc3e62525a312f0856` |
| Reopened canonical native snapshot | `13c5b863a163671eda7bfaea13b379544965fe9f016f4435c9004a1d367495d3` |
| Flat diagnostic result, 7,819 bytes | `5ffa03fe0e0948e3691ae5dff8b037b83b9261409217e604496be8741f88904d` |
| Flat diagnostic receipt self-hash | `bbfa9e0ad228c638ce80b63c446f2a9d812fc69fa25f89dfc81424524de8ffef` |
| Closed-state retained verification, 939 bytes | `c74d276051d35630613d80f1bf6d80acaf3bca13e79f0e5c2284066d35fb8e69` |
| Retained backup-metadata result, 1,658 bytes | `390366aceda07c922bd1d2bf97d9fb16afb93e26a64a95c872ace48ef2041641` |
| Supplemental private reopen review | `e04097c0fb24ceabb0e53e14e261d158bc95e599176717b5aa3f6aef47725604` |

The live owner subsequently reported normal closure and empty native discovery.
Independent review rehashed the retained closed-state verification and proved it
byte-identical to the earlier post-reader verification: unchanged source raw
hash, checkpoint hash and matching complete logical dumps. It did not reread
the current database or replay the application-state check.

The separate retained backup-metadata result reports two equal listing-only
samples across nine roots, with whole metadata and all per-root counts unchanged
from its baseline. No entry contents or current preferences were read. This is
point-in-time metadata evidence, not an unopened-project attestation, backup-byte
verification, deletion authorization or continuing retention guarantee.

This accepts the saved fixture's reopen state. It does not validate a sealed
reroute, inverse, rollback, failure recovery, broad snapping reliability or any
later source generation. The separate writer remains pending. Independent
review opened immutable evidence only, never the current project database.
