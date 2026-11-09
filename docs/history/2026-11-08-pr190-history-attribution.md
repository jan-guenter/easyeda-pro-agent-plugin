# PR190 history provenance and action naming

CodeRabbit review `5816970821` raised six comments. This correction covers all
named companions, the review's broader schematic status/writer/saved-reader
records and the adjacent inverse reference-worker records. The table below
lists 57 records. Nineteen already carry the PR185 attribution correction;
their introducing commit and tree were independently rechecked. Thirty-eight
now have the corresponding explicit source-provenance correction.

For each row, `git log --follow --diff-filter=A` identifies the introducing
commit. `git show` verifies its tree, author timestamp and changed source/test
files. These are verifiable Git provenance. They do not identify the complete
worktree used for the earlier checks. The test-time worktrees were not sealed
in the evidence retained for this correction and cannot be reconstructed from
it. The dates in the table are Git author timestamps, not recovered test-run
timestamps. Existing observation dates, counts, failures, compiler sizes,
hashes and connected/source-only limits remain intact. No result is attributed
to a later commit, and no historical test was rerun for this correction.

In particular, the earlier `3a08fa0f` Via freeze does not identify the source
used for the later Component/clock/raw-history checks. The fifteen-case run and
the thirteen owner/scheduler cases retain their reported observations without
a recoverable complete tested-payload identity. Likewise, source bases
`05055979` and `e90c3a5e` identify only their recorded starting points; they do
not seal private layout edits or inert fixtures added for the reported checks.

The Via schema accepts `observe-termination` and `release`. The coordinator
routes those actions to its private workflow's `settleCleanup()` method.
`settle-cleanup` is not a public Via action. This correction describes source
routing only and establishes no live cleanup admission or restored authority.

## Retained evidence and its limits

The saved-cache record's private `schematic-saved-birth-4pJxBA` metadata has
only generated helper/compiler sizes and hashes. The actual helper and compiler
prefix were rehash-checked and match that record. It contains no complete host
source/test worktree manifest.

The inverse worker-native record's retained `Native.cs` was rehash-checked at
2,088,939 bytes and SHA256
`0bf8f6dcad3b3d23ed5218e26199bdffec39c1dd4f9b5a5a078ae7a2cdb9cd1b`.
Its helper is 1,478,714 bytes and SHA256
`766b11c31756cc0db6d96184eb0a5214d8544ac98d33a75076769f39c0f48be9`.
This identifies the actual compiler input retained for the reported pure-codec
checks. A compiler input does not identify the complete TypeScript/test tree.

The private registrar `scope-proof.json` records Node 24.18.0, original source
locations and hP/aP/cP closure observations with handlers uninvoked. The separate
`reference-preparation-actual-probe-result-v7.json` records success, 130 normal
and 32 helper requests, graph size2 and three namespaces. Those observations
remain useful at that scope. Neither file contains a complete worktree manifest.
No private JSON, helper, journal or design file is committed by this correction.

## Review mapping

| Comment | Addressed records and correction |
| --- | --- |
| `4505355696` | Uploader status hold and all selected schematic status/writer records, with introducing Git identities and explicit test-worktree limits. Existing PR185 companion attribution was verified. |
| `4505355697` | Tail native-frame admission, saved-cache invalidation, saved cold owner, saved final acceptance, opening leaves, saved-reader workflow and original parent journal. |
| `4505355700` | Inverse reference worker runtime, query custody and native ledger, plus the codebook and ordering companions. Retained compiler/probe evidence is distinguished from the missing complete host worktree. |
| `4505355703` | PR182 source fixtures, adjacent registration, current native profiles, lease/construction fixes and reviewed-manifest seal. Each has a revision in the history index. |
| `4505355706` | Via/Component review fixes and original abort/exit settlement. Both explicitly preserve the unavailable complete tested payload and do not reuse the earlier freeze identity. |
| `4505355709` | Original Via abort/exit settlement now names the public actions separately from the internal method and disclaims live admission. |

## Verified record introductions

| Record | Introducing commit | Committed tree | Git author timestamp |
| --- | --- | --- | --- |
| [2026-11-07-schematic-original-uploader-entry.md](2026-11-07-schematic-original-uploader-entry.md) | `0dd56a8030537cc34407fc718f025ee5dfaa35ee` | `ec8c1630961639348d136a9d3f9704f74c0124b4` | `2026-11-07T21:11:15+01:00` |
| [2026-11-07-schematic-original-uploader-status-hold.md](2026-11-07-schematic-original-uploader-status-hold.md) | `dd5db47b6d6c9805ccf374b3d45f43c08608a68c` | `3bf919e2547e2646fef5c49c94df43950ce71316` | `2026-11-07T23:51:07+01:00` |
| [2026-11-07-schematic-publisher-callee-metadata.md](2026-11-07-schematic-publisher-callee-metadata.md) | `307aac56c041410c494947a6a598c82e757410f4` | `9cd2ceede8a6f850e12e413e7ace7bf28280f3b7` | `2026-11-07T12:54:59+01:00` |
| [2026-11-07-schematic-publisher-pristine-custody.md](2026-11-07-schematic-publisher-pristine-custody.md) | `e8fe0757deae9d5aa6fd0c8c785da7b220e329ab` | `311a3e9ac0ae52f8f67ee39d3bf82f492c0b76f4` | `2026-11-07T14:51:49+01:00` |
| [2026-11-07-schematic-readonly-saved-scene-program.md](2026-11-07-schematic-readonly-saved-scene-program.md) | `84943a7a409b00a8fb02d43d9301a6ade6e58de9` | `edaa38d81a5d6451bdb62484a0cd9d5e854a1e5b` | `2026-11-07T14:34:40+01:00` |
| [2026-11-07-schematic-record-held-ast.md](2026-11-07-schematic-record-held-ast.md) | `d003eadf649048776fbbdac934aa653dbf713265` | `fbf99e9b7cb4e9ca2319c5786934959c00548f9c` | `2026-11-07T16:08:32+01:00` |
| [2026-11-07-schematic-relevance-accessor-receiver-boundary.md](2026-11-07-schematic-relevance-accessor-receiver-boundary.md) | `32c8bb1911164ec7c17a2bee87c82a107637b771` | `b3a8a8b6fae94a8e16cf2e878d68d5d30e0c6be8` | `2026-11-07T10:16:15+01:00` |
| [2026-11-07-schematic-relevance-display-original-journal.md](2026-11-07-schematic-relevance-display-original-journal.md) | `9fa0c877d12ac4e8bc6a9cd655f5c21c1aa6c366` | `55bd798561b1e7f452096c43e8a78f34e6c8ae11` | `2026-11-07T04:30:47+01:00` |
| [2026-11-07-schematic-save-module-initialization.md](2026-11-07-schematic-save-module-initialization.md) | `7e530f422f9bc47b53eb4789c377ba4e240a5999` | `689e217de4a8300402ccfdd03c88701f830adbb8` | `2026-11-07T16:24:37+01:00` |
| [2026-11-07-schematic-saved-cache-invalidation.md](2026-11-07-schematic-saved-cache-invalidation.md) | `201cea5b07e407eccf74d2247d14d4ac84c8bcbc` | `54c369a9b17b7b69b7b8a0d2a463585b1f4afab1` | `2026-11-07T22:21:10+01:00` |
| [2026-11-07-schematic-saved-cold-owner-route.md](2026-11-07-schematic-saved-cold-owner-route.md) | `671de0c93448ced8828e631b340a359496e78992` | `03f84a732540d181085e601900f276eb26873d3e` | `2026-11-07T23:23:12+01:00` |
| [2026-11-07-schematic-saved-final-acceptance.md](2026-11-07-schematic-saved-final-acceptance.md) | `6312146cd284c018cf047d47ed67407d07a077a7` | `34ddec8e7cab5f2624a7ac037075a7e48a2d04a6` | `2026-11-07T23:50:53+01:00` |
| [2026-11-07-schematic-saved-load-preparation.md](2026-11-07-schematic-saved-load-preparation.md) | `5200b7f7519f77b113bb47704a9d5eec732accaa` | `de5edfc86bb1fdf477837723eb85635f11ca9715` | `2026-11-07T08:40:34+01:00` |
| [2026-11-07-schematic-saved-opening-leaves.md](2026-11-07-schematic-saved-opening-leaves.md) | `90c8dd590e27659ebf270c6b5bebade02fb64a7b` | `e2d65d9aed263ea60195cee59fc225cff48adf13` | `2026-11-07T22:37:15+01:00` |
| [2026-11-07-schematic-saved-reader-birth.md](2026-11-07-schematic-saved-reader-birth.md) | `bb8b442edef17b0f04d00ef08c14113cb8630dcd` | `fcf20a8e7a0b985a088b51d5742736e48f650220` | `2026-11-07T21:00:13+01:00` |
| [2026-11-07-schematic-saved-reader-closed-data.md](2026-11-07-schematic-saved-reader-closed-data.md) | `38629acadeba5c81a0e04d512808423415a237b4` | `515edd6f7e06d8f0274a10a1ddaea08338d5e5d8` | `2026-11-07T22:16:41+01:00` |
| [2026-11-07-schematic-saved-reader-preparation.md](2026-11-07-schematic-saved-reader-preparation.md) | `bbf6d40195949d40337c4f253f746ef73b9599e4` | `ddf74b9db3fa2cf7623a9b134307af3a0ae012cb` | `2026-11-07T14:21:46+01:00` |
| [2026-11-07-schematic-saved-registration-policy.md](2026-11-07-schematic-saved-registration-policy.md) | `1ac3ff48ee660abd81a986aaa9401a94b2ae73bc` | `4db0cc3f1025b99f9e46f2d37a4aaa5b9a9bf884` | `2026-11-07T21:11:49+01:00` |
| [2026-11-07-schematic-saved-scene-codec.md](2026-11-07-schematic-saved-scene-codec.md) | `c4790fee73bd60bbe1182755ee7241f1b7aca5d2` | `1f6066c1b21aea3da27f1bc3b05bb949845d8519` | `2026-11-07T20:50:19+01:00` |
| [2026-11-07-schematic-saved-scene-native-replies.md](2026-11-07-schematic-saved-scene-native-replies.md) | `8515fcc67a3287a4f3592c8247ab2a5a194db78a` | `c41e826cfd03f660bf49f68056288cf9e899f6dd` | `2026-11-07T21:42:35+01:00` |
| [2026-11-07-schematic-saved-source-comparison.md](2026-11-07-schematic-saved-source-comparison.md) | `cce48748a637b671155dd847b020e8d79bc2fdf9` | `8a722a3101ebb2645a8e12af22e1fb08932a405f` | `2026-11-07T14:18:13+01:00` |
| [2026-11-07-schematic-tail-native-frame-admission.md](2026-11-07-schematic-tail-native-frame-admission.md) | `e9a268bdc9bcc548b081f94389cc5dca94f2fa34` | `d95f5e896d6a6c6a82fbb750330f9f6f8dcff4d9` | `2026-11-07T23:45:14+01:00` |
| [2026-11-07-schematic-uploader-extra-callees.md](2026-11-07-schematic-uploader-extra-callees.md) | `eb9e1768c00cf06aa0aef570ad14061cce648acc` | `12661900cdb0d14686c9aa1854480108daecd4b8` | `2026-11-07T20:20:19+01:00` |
| [2026-11-07-schematic-uploader-helper-callees.md](2026-11-07-schematic-uploader-helper-callees.md) | `a9b9e1122d35be58528e0cbc7e7f7a9e4ff5bf14` | `1b5c168fb34537489b9e4621b398130368cf4bf6` | `2026-11-07T20:37:14+01:00` |
| [2026-11-07-schematic-wire-native-stage.md](2026-11-07-schematic-wire-native-stage.md) | `cc170fca7e898c5e70796f789bf0729dbd24ab3c` | `eef41c5b3aa215c6dc71426b878f4960340e1e55` | `2026-11-07T04:27:44+01:00` |
| [2026-11-08-adjacent-registration-fixtures.md](2026-11-08-adjacent-registration-fixtures.md) | `1f80fe477988bf2b7dbbffcd7f0183a2f6be6bb8` | `9862ddb2bac08e001134c1aafb2a411ce8bf5039` | `2026-11-08T00:16:55+01:00` |
| [2026-11-08-current-native-profile-fixtures.md](2026-11-08-current-native-profile-fixtures.md) | `ad522f05917fd6819f61af28b01ec6a7a5bbea19` | `7f68ec1782e17ceeae048158db255155697238a1` | `2026-11-08T00:08:49+01:00` |
| [2026-11-08-inverse-reference-query-custody.md](2026-11-08-inverse-reference-query-custody.md) | `84168005ff7879d903ca9dbf09d4746d57684514` | `0cb263e562ea0bd7e8769cf450ec7f4b43114c59` | `2026-11-08T03:06:06+01:00` |
| [2026-11-08-inverse-reference-worker-codebook.md](2026-11-08-inverse-reference-worker-codebook.md) | `2c816d29c5c4c92aaa742db29fb5009953635020` | `e752d6841d54def5080e24ae202e9314df084e39` | `2026-11-08T03:55:11+01:00` |
| [2026-11-08-inverse-reference-worker-native.md](2026-11-08-inverse-reference-worker-native.md) | `fec425731a2ec2e38b20ac21f6b987065331e1fd` | `aa88b79c54fe8545df2a07b81efcb0199e92dcdf` | `2026-11-08T04:49:31+01:00` |
| [2026-11-08-inverse-reference-worker-order.md](2026-11-08-inverse-reference-worker-order.md) | `dce3e66eba853f745d7584e213a108cdb56be348` | `c39d2de7b4b75305992827927c0d32c78028375a` | `2026-11-08T03:15:51+01:00` |
| [2026-11-08-inverse-reference-worker-runtime.md](2026-11-08-inverse-reference-worker-runtime.md) | `961f3fa897dc354aa314c2dde1513129e14d7a8e` | `4811521173a24f45320ca47c9da5dd43a3b1779a` | `2026-11-08T05:17:35+01:00` |
| [2026-11-08-original-lease-and-construction-review-fixes.md](2026-11-08-original-lease-and-construction-review-fixes.md) | `3a08fa0f69f30086b68060d32c876dbbb52debd6` | `7cd5104ac374f88a2fad22fb1f9e5a07dc4ce6b4` | `2026-11-08T00:21:48+01:00` |
| [2026-11-08-pr182-source-fixtures.md](2026-11-08-pr182-source-fixtures.md) | `b6c5bbfc7d0ad7ff5be19129e5ce55d05958a781` | `52b2bb9b9626f37163f6444fac6debf252e42062` | `2026-11-08T03:44:51+01:00` |
| [2026-11-08-reviewed-manifest-seal.md](2026-11-08-reviewed-manifest-seal.md) | `256f415efa8f18c7d95026660f2ebfabb1df001d` | `ef00e9dc8a318b686a30bde7317d33e3d3ee67fc` | `2026-11-08T00:04:22+01:00` |
| [2026-11-08-schematic-clock-and-sql-review.md](2026-11-08-schematic-clock-and-sql-review.md) | `8e07f6d13be774c0f8c9f33d12773839d485820c` | `955f03e456756e8695960796b9cbecaa920bf823` | `2026-11-08T01:31:39+01:00` |
| [2026-11-08-schematic-codec-source-factory.md](2026-11-08-schematic-codec-source-factory.md) | `d624e9253225187f56157cb39abc0dcc39e2b2ea` | `406a8a68658b3558d2018cad04fd81e0153c8dec` | `2026-11-08T01:33:46+01:00` |
| [2026-11-08-schematic-failure-abandonment.md](2026-11-08-schematic-failure-abandonment.md) | `6bdb383831b13e3c3d5822e3bca24c9824f84f5b` | `cd2be37419d334f391f2fd219fc2ccdc26def824` | `2026-11-08T02:04:50+01:00` |
| [2026-11-08-schematic-native-codec-projection.md](2026-11-08-schematic-native-codec-projection.md) | `dc6833890db88ad20c8a72f05a97536774bf6320` | `f5b4aa0218e0452abb8d35098848a66069d09830` | `2026-11-08T00:26:39+01:00` |
| [2026-11-08-schematic-original-parent-journal.md](2026-11-08-schematic-original-parent-journal.md) | `2077a8792eed02e2b8705a5d809992b339ee47be` | `54e5b499120447a768920504ae658f827505f48e` | `2026-11-08T00:47:49+01:00` |
| [2026-11-08-schematic-original-render-delegate.md](2026-11-08-schematic-original-render-delegate.md) | `42a48d8bb1edfbb2f04cc42346dc0366d0366470` | `f1baeb10d4c1374b3008dcbbdfbb671a04edc043` | `2026-11-08T05:13:12+01:00` |
| [2026-11-08-schematic-original-status-callback-hold.md](2026-11-08-schematic-original-status-callback-hold.md) | `ea0a9750a18f2f2870235ea1e871d066f394465d` | `ecac40fe0cfff4888729fb3561db17d8750b48f0` | `2026-11-08T00:35:28+01:00` |
| [2026-11-08-schematic-original-status-clone-dependencies.md](2026-11-08-schematic-original-status-clone-dependencies.md) | `4ce8f9c81a2672af46214f56c1aae4ec9f4c2696` | `926e65cb0b792ed0fe7c25d94b0fa8ca151cc549` | `2026-11-08T02:02:56+01:00` |
| [2026-11-08-schematic-original-status-local-publish.md](2026-11-08-schematic-original-status-local-publish.md) | `3d47d487210b93f1a7b8e103e2af402de2fdb6a2` | `6b1a712176095f4ea6d46c7143413447d57a7438` | `2026-11-08T00:49:03+01:00` |
| [2026-11-08-schematic-original-status-subscriber.md](2026-11-08-schematic-original-status-subscriber.md) | `f44765e74ef3adb922d71493d35d6ea0749729e9` | `18230130af3a2729b398293e50107dec184b8a26` | `2026-11-08T02:26:16+01:00` |
| [2026-11-08-schematic-original-status-task-entry.md](2026-11-08-schematic-original-status-task-entry.md) | `b701fe4ad1b56938fe19703c63c0e8eaf7d0393a` | `b078b594c630dd22960c3b8520001b02a599ccd0` | `2026-11-08T01:08:03+01:00` |
| [2026-11-08-schematic-original-tab-lookup.md](2026-11-08-schematic-original-tab-lookup.md) | `5f3bd07049ff4f9471e11b9530e880bc0c326cb0` | `5bec6c1d6f0ecd8d501680669e3b7491fa5067bb` | `2026-11-08T03:25:19+01:00` |
| [2026-11-08-schematic-original-writer-lifecycle.md](2026-11-08-schematic-original-writer-lifecycle.md) | `887cca04d4fb987e19ef48b5c6c79ddff6cc84c1` | `c3b91828090e94a235b5adb4ef147cc123b7b234` | `2026-11-08T02:41:02+01:00` |
| [2026-11-08-schematic-original-writer-preparation.md](2026-11-08-schematic-original-writer-preparation.md) | `4e1fc94c01be110b644923e992c814347ae9a400` | `293f99d57995f86409b1876ac6c98a2cf0e56dda` | `2026-11-08T01:45:39+01:00` |
| [2026-11-08-schematic-original-writer-registration.md](2026-11-08-schematic-original-writer-registration.md) | `c8591333f4f08fae173d5f0115557b56cfb2c72b` | `b50549565146b080325886fb79e2677a1cc70711` | `2026-11-08T03:21:04+01:00` |
| [2026-11-08-schematic-retained-arm-review-fixes.md](2026-11-08-schematic-retained-arm-review-fixes.md) | `eac5b4629b77eff93585259154815eb7fcc808e6` | `bdcafcd4deae97debf316a6d7f00e505727af8e8` | `2026-11-08T01:32:51+01:00` |
| [2026-11-08-schematic-saved-native-layout.md](2026-11-08-schematic-saved-native-layout.md) | `0b2dd8e0270d1776f1edc8f64b1f20c32617e355` | `33f0b8b3800bd60a8622e48559201ede55890bf0` | `2026-11-08T01:17:56+01:00` |
| [2026-11-08-schematic-saved-reader-workflow.md](2026-11-08-schematic-saved-reader-workflow.md) | `969561fec95135a47035735b1a287513a567eb42` | `f0991aabf4cd3af3400932affb4d11a1cdf90139` | `2026-11-08T00:14:51+01:00` |
| [2026-11-08-schematic-selected-unsaved-assignment.md](2026-11-08-schematic-selected-unsaved-assignment.md) | `8b0442e6f739b4758951627325933ca50049abe2` | `c4b2c6cfa0669b0cbaf2a1084ac188081232519f` | `2026-11-08T03:45:32+01:00` |
| [2026-11-08-schematic-writer-registration-policy.md](2026-11-08-schematic-writer-registration-policy.md) | `ed89972290724e122bdd793df9b1aa49bf96bb3a` | `f9b014d677215f00b17b0f52656824790c360fda` | `2026-11-08T02:41:39+01:00` |
| [2026-11-08-via-and-component-review-fixes.md](2026-11-08-via-and-component-review-fixes.md) | `1a32686ebd7997300c7475788bc1616a75b47ed5` | `4a2997e00fff03bd4b283fcb7b5d1db7765a5ad1` | `2026-11-08T00:33:29+01:00` |
| [2026-11-08-via-original-abort-exit-settlement.md](2026-11-08-via-original-abort-exit-settlement.md) | `81cc1a818ca1fabe78654a59f141e89a191793dc` | `44e6a292f9847812f64218f2dd337f8a9fa5a476` | `2026-11-08T02:01:14+01:00` |

The link check also found an existing history-index entry whose
[qualified private C# capacity measurement](2026-11-08-csharp-structural-trivia-measurement.md)
file had never been integrated. Its original text is restored from `9b8f272a`,
with first-introduction and restoration provenance appended. Its historical
observations and explicit private-experiment limits remain unchanged.

## This documentation correction

Only history Markdown and its index change, starting from source base
`522f1612`. Local links, Git identities, history preservation, repository/privacy
and all packaged-skill checks passed. All seven installed skill-creator checks
also passed. The official external plugin validator is unavailable.

The MCP-contract validator ran and refused the two missing packaged
`schematic-saved-readback-native.ps1` and `.cs` artifacts. Those canonical
artifacts await the separate final source-batch regeneration. This correction
does not generate them or claim that the package validator passed. The initial
missing-history-link failure and all actual validator outcomes are retained.

The private `pr190-history-correction-20261108` evidence directory retains the
exact correction-payload manifest, patch, provenance inventory and check logs.
The manifest records every Git-tracked and nonignored untracked payload file's
mode, size and SHA256; it excludes Git metadata and ignored dependency installs.
MCP-contract checks use an isolated offline validation child and do not contact
the closed host connection, EasyEDA or native owners. No runtime source,
regenerated helper/bundle, installed artifact, new review, broad suite or
connected validation is part of this correction.
