# PR185 history attribution and scope corrections

All sixteen review comments were checked against the current records. The
thirty-two implementation records in this review batch now identify their
actual introducing source commit and committed tree. The mapping below comes
from Git, rather than predecessor references or inferred test payloads.

The older test-time worktree manifests were not retained. A commit that later
records a test result does not prove that the entire test run used that commit's
complete tree. These records therefore now say so explicitly. Their local
results remain historical observations and cannot satisfy the exact-payload
release gate. They must not be relabeled as connected tests or used to replace
final frozen-source CI, reproducible artifacts and installation verification.
No historical success, failure, hash, count or pending statement was removed.

The held-AST Inspector tests depend on configured installed schematic source
and use synthetic receivers in an independent Node Inspector. They do not
control EasyEDA or use an installed Codex plugin. The original record did not
retain a per-variant run/skip manifest. The later configured source campaign
recorded in [PR182](2026-11-08-pr182-source-fixtures.md) explicitly reports
96 checks and zero source skips; it is separate evidence, not a replacement
claim about the old run.

The original Via live-history record now links to its later request-owned SQL
correction. Wire's historical stage list now distinguishes declared names from
executable stages. The schematic saved-reader index entries identify source and
offline evidence, leaving connected validation separate.

| Record | Introducing source commit | Committed tree |
| --- | --- | --- |
| [2026-11-07-schematic-original-primitive-record-bridge.md](2026-11-07-schematic-original-primitive-record-bridge.md) | `c3052f26bf8959896bea1050b460cdef4d182c83` | `6de98a710d4e32f14b180f9f27fa5277f9b0b5a7` |
| [2026-11-07-schematic-original-text-serialization.md](2026-11-07-schematic-original-text-serialization.md) | `3d3ba9a29821eb692773a2d2bb75a53521aaa617` | `4cc3a642178f8dcee0bcf8ceafba428217e9f627` |
| [2026-11-07-schematic-original-uploader-entry.md](2026-11-07-schematic-original-uploader-entry.md) | `0dd56a8030537cc34407fc718f025ee5dfaa35ee` | `ec8c1630961639348d136a9d3f9704f74c0124b4` |
| [2026-11-07-schematic-publisher-callee-metadata.md](2026-11-07-schematic-publisher-callee-metadata.md) | `307aac56c041410c494947a6a598c82e757410f4` | `9cd2ceede8a6f850e12e413e7ace7bf28280f3b7` |
| [2026-11-07-schematic-publisher-pristine-custody.md](2026-11-07-schematic-publisher-pristine-custody.md) | `e8fe0757deae9d5aa6fd0c8c785da7b220e329ab` | `311a3e9ac0ae52f8f67ee39d3bf82f492c0b76f4` |
| [2026-11-07-schematic-readonly-saved-scene-program.md](2026-11-07-schematic-readonly-saved-scene-program.md) | `84943a7a409b00a8fb02d43d9301a6ade6e58de9` | `edaa38d81a5d6451bdb62484a0cd9d5e854a1e5b` |
| [2026-11-07-schematic-record-held-ast.md](2026-11-07-schematic-record-held-ast.md) | `d003eadf649048776fbbdac934aa653dbf713265` | `fbf99e9b7cb4e9ca2319c5786934959c00548f9c` |
| [2026-11-07-schematic-relevance-accessor-receiver-boundary.md](2026-11-07-schematic-relevance-accessor-receiver-boundary.md) | `32c8bb1911164ec7c17a2bee87c82a107637b771` | `b3a8a8b6fae94a8e16cf2e878d68d5d30e0c6be8` |
| [2026-11-07-schematic-relevance-display-original-journal.md](2026-11-07-schematic-relevance-display-original-journal.md) | `9fa0c877d12ac4e8bc6a9cd655f5c21c1aa6c366` | `55bd798561b1e7f452096c43e8a78f34e6c8ae11` |
| [2026-11-07-schematic-save-module-initialization.md](2026-11-07-schematic-save-module-initialization.md) | `7e530f422f9bc47b53eb4789c377ba4e240a5999` | `689e217de4a8300402ccfdd03c88701f830adbb8` |
| [2026-11-07-schematic-saved-load-preparation.md](2026-11-07-schematic-saved-load-preparation.md) | `5200b7f7519f77b113bb47704a9d5eec732accaa` | `de5edfc86bb1fdf477837723eb85635f11ca9715` |
| [2026-11-07-schematic-saved-reader-birth.md](2026-11-07-schematic-saved-reader-birth.md) | `bb8b442edef17b0f04d00ef08c14113cb8630dcd` | `fcf20a8e7a0b985a088b51d5742736e48f650220` |
| [2026-11-07-schematic-saved-reader-closed-data.md](2026-11-07-schematic-saved-reader-closed-data.md) | `38629acadeba5c81a0e04d512808423415a237b4` | `515edd6f7e06d8f0274a10a1ddaea08338d5e5d8` |
| [2026-11-07-schematic-saved-reader-preparation.md](2026-11-07-schematic-saved-reader-preparation.md) | `bbf6d40195949d40337c4f253f746ef73b9599e4` | `ddf74b9db3fa2cf7623a9b134307af3a0ae012cb` |
| [2026-11-07-schematic-saved-registration-policy.md](2026-11-07-schematic-saved-registration-policy.md) | `1ac3ff48ee660abd81a986aaa9401a94b2ae73bc` | `4db0cc3f1025b99f9e46f2d37a4aaa5b9a9bf884` |
| [2026-11-07-schematic-saved-scene-codec.md](2026-11-07-schematic-saved-scene-codec.md) | `c4790fee73bd60bbe1182755ee7241f1b7aca5d2` | `1f6066c1b21aea3da27f1bc3b05bb949845d8519` |
| [2026-11-07-schematic-saved-scene-native-replies.md](2026-11-07-schematic-saved-scene-native-replies.md) | `8515fcc67a3287a4f3592c8247ab2a5a194db78a` | `c41e826cfd03f660bf49f68056288cf9e899f6dd` |
| [2026-11-07-schematic-saved-source-comparison.md](2026-11-07-schematic-saved-source-comparison.md) | `cce48748a637b671155dd847b020e8d79bc2fdf9` | `8a722a3101ebb2645a8e12af22e1fb08932a405f` |
| [2026-11-07-schematic-uploader-extra-callees.md](2026-11-07-schematic-uploader-extra-callees.md) | `eb9e1768c00cf06aa0aef570ad14061cce648acc` | `12661900cdb0d14686c9aa1854480108daecd4b8` |
| [2026-11-07-schematic-uploader-helper-callees.md](2026-11-07-schematic-uploader-helper-callees.md) | `a9b9e1122d35be58528e0cbc7e7f7a9e4ff5bf14` | `1b5c168fb34537489b9e4621b398130368cf4bf6` |
| [2026-11-07-schematic-wire-native-stage.md](2026-11-07-schematic-wire-native-stage.md) | `cc170fca7e898c5e70796f789bf0729dbd24ab3c` | `eef41c5b3aa215c6dc71426b878f4960340e1e55` |
| [2026-11-07-via-changed-head-sync-cursor.md](2026-11-07-via-changed-head-sync-cursor.md) | `68c5c68d5127cc5b6973f13cc00bf704cb236248` | `75962cafbe0581c4a60ccf3ae28bde1e01cb273f` |
| [2026-11-07-via-failed-disposable-abandonment.md](2026-11-07-via-failed-disposable-abandonment.md) | `ddd15a4367073294e68222f33570713d13937327` | `d4d4d6bcc7a91c91d049fc53e9ba0cac6e9763f0` |
| [2026-11-07-via-live-cache-plan.md](2026-11-07-via-live-cache-plan.md) | `86406c2af0bdf68e3dc8241f95128f40a65aed7c` | `c114daa0a61576dfa412a0a94b7112c80615f9c6` |
| [2026-11-07-via-live-history-release-order.md](2026-11-07-via-live-history-release-order.md) | `bf3428b26dfeaadb9268a9989349b34e3a776424` | `7d6c64b3edd5600e371146158923449e0103cfa2` |
| [2026-11-07-via-original-drain-owner-api.md](2026-11-07-via-original-drain-owner-api.md) | `97b1c6777f006d55977e96c5dba40d4460faa676` | `face77322187afcafa56b945be18b2a4e1fbd059` |
| [2026-11-07-via-original-live-history-read.md](2026-11-07-via-original-live-history-read.md) | `82eaeed7385342a421d9455e43c8bac5628bfebe` | `b3981b38928a6753feb19567a4a84eb682d26a16` |
| [2026-11-07-via-original-save-drain-dag.md](2026-11-07-via-original-save-drain-dag.md) | `1c3d76f8ae89d27bfbc516661ff14691e03b676f` | `56e2b90b56803e55cb581d91ee9d9b3734d0eb55` |
| [2026-11-07-via-replay-and-global-admission.md](2026-11-07-via-replay-and-global-admission.md) | `240754ba46a58a86c0482d8663e34c91cc874a3c` | `c5b7bac584c2d66cf00d6dde961c5fc7c3e55a1e` |
| [2026-11-07-via-save-drain-native-storage.md](2026-11-07-via-save-drain-native-storage.md) | `ecb590f7bdec47a13d03ee0b14d05ef5f4e53827` | `50071dea6482e3117b29866dc8d8dbb5f54aa0b3` |
| [2026-11-07-wire-edit-original-birth.md](2026-11-07-wire-edit-original-birth.md) | `475e48eecf35ae7808f3ccb82757d8c16480a829` | `0e57257e18216cade98154a7b51ea29e06fee210` |
| [2026-11-07-writer-startup-and-metadata-packing.md](2026-11-07-writer-startup-and-metadata-packing.md) | `418517e48f37720da759a62a311472138f80d4dc` | `1b13b98aca79600033b417165e7be8a3943f9f9c` |
