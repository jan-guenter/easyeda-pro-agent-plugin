# Installed000500 extended PCB observation

2026-10-24. One disposable PCB case completed `observe-extended-primitives`
through its original209 owner, followed by normal close, original process/Job
termination and helper release. The result contains Component 2, Pad 4 and
Attribute 6; Dimension and Image have empty-only coverage. This records loaded-view
DTO observations, not complete model membership, saved state or editing authority.

This completes the first connected five-family case pending in the
[000500 batch handoff](2026-10-24-000500-extended-pcb-readers-batch.md).
The [earlier four-family case](2026-10-24-213000-connected-pcb-primitives.md)
remains separate and was not replayed. No production design was opened or edited.

## Installed payload and source correlation

The actual facade admission identifies
`0.3.0+codex.20261024000500`, main
`3bae835424571051fa4aeeec8f6bcfc652f02c79`, and plugin tree
`d8a7c6222329702c596945a0dded30f1e6b80282`. All 1813 packaged files and
42 directories matched the committed bytes and modes, totaling 38913664 bytes.
Package inventory SHA-256:
`94c51704a6b9792ff1fe1151b591d43c187ccc8febd1e54fe4dcd79b3cd9cb2a`.
The 636-source projection is
`11f7913cb8fdc5b7c6d151411c9e84564075a2977fc36e01a3ad6e98be2af24a`;
the three-bundle projection is
`84f08b72f2788388e41f7dbad3f1a6d3a212ad0f9eef375188647d1b47ac2a82`.
The host used pinned Node 24.18.0 with soft core limit 0. Its private admission
receipt SHA-256 is
`6bc81fc42fdcf7e53c0b1dfc04250e84520eae126a44f059dfebcf2db1b70a3d`.

The runtime reported EasyEDA Pro 3.2.209.8a704eab. Independent review rehashed
the full installed assets and matched the retained UI/PCB source qualification:

| Implementation | Version | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| UI | 3.2.198.2800f583 | 17468192 | `3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6` |
| PCB | 3.2.195.6b67774e | 10991441 | `a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b` |
| Public API | 0.3.59.1ca9efb5 | 1980754 | `e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1` |

Ten installed reader/validator/owner/protocol/lifecycle/helper source files were
compared directly with that committed payload. The 24666-byte extended reader
SHA-256 is `c33ed1d36d75be9a5869863937abeee4caee22ff195e2ba736aab689be1e3676`;
the 936177-byte helper SHA-256 is
`45c5cb0e50383bc31de0ad5ce18653391791fa59a9ef798d43c0de10a103f8e6`.
Review correlated the fixed program and decoder with the installed native
callbacks and the [source research](2026-10-24-pcb209-extended-reader-research.md).
No vendor or live mutation code was executed by the independent verifier.

The main follow-up [CI40046123968](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/40046123968)
subsequently completed successfully at this exact commit: build verification,
all eight facade shards and the aggregate check passed. Its terminal update is
2026-10-24T00:54:05Z. This supersedes only the earlier pending CI observation;
CI remains separate from connected validation.

## Exact observed domain

The original owner completed launch, browser/frame inventory, UI source
qualification, checkpoint-bound project opening, PCB opening and separate
PCB source/DOM qualification before consuming one extended-reader attempt.

| Family | Rows | Covered domain |
| --- | ---: | --- |
| Component | 2 | Placement/lock and all six selected metadata keys present |
| Pad | 4 | Null holes, RECT default copper shapes, mask mode 2 and null thermal configuration |
| Attribute | 6 | Two ordered parent groups with three children each; null serialized colors and mixed visibility/position flags |
| Dimension | 0 | Empty loaded-view result only |
| Image | 0 | Empty loaded-view result only |

Every returned ordered ID list matches its DTO rows. Attribute parent order
matches the observed Component order, and each child row matches its group's
parent. This is native group association, not reciprocal ownership or complete
stored-child proof. Pad IDs were not used to infer component ownership or
symbol-pin mappings. Metadata absence/own-undefined, other Pad shapes/holes,
non-null thermal configurations and populated Dimension/Image are untested here.

The fixed reader requires two identical complete ordered projections, including
metadata presence and Attribute groups. Fourteen local RPCs bracket each
five-family pass with identity reads; captured target/receiver checks surround
each await. The retained success reports matching samples but exports only the
accepted projection, not two separate raw samples. Independent reconstruction
of the native observation envelope and metadata states matches its commitment.

Distances preserve native precision in mil; raw net strings, metadata and mask
scalars are retained without interpreting them as resolved electrical or
manufacturing facts. Formula strings are not evaluated. Attribute flags and
positions are not glyph or rendering verification. The stage executes native
task equivalents of unfiltered collection/ID projections, not public SDK calls
or public class-instance parity.

## Evidence and cleanup

Independent verification passed all 21 journal files, 23 canonical digest links
and 12 MCP receipts. It checked original bindings, target agreement, result/receipt
consistency, DTO shapes, global ID uniqueness, metadata states, ordered groups
and aggregate bounds. Retained commitments are:

| Evidence | SHA-256 |
| --- | --- |
| Five-family projection and metadata states | `749045a4e0ad1a1f3294f2a52259905efca72232b68c0d4cfb6a6a529c6d4a0b` |
| 9698-byte journal result, raw | `d99e69185ae282e37777488c2f6b2548eb022c63dfcc05804cf776306026e02c` |
| 10941-byte MCP result, raw | `837981a2a49ad701b23629784f6422c41eceb7796447cb46075a140a7cae0b72` |
| Journal inventory | `b8235ad2bac7a104107f55342035a06de01b1fb350365e265512d49c44f2df62` |
| MCP receipt inventory | `6566895d2e5667552c9bfb573ab6462e1668a044d15d4ca19a4f5b7c27caac6c` |

Normal close acknowledgment did not itself prove termination. The subsequent
original-root-exited and original-Job-empty record precedes helper release.
Their raw SHA-256 values are
`cd2a58527587ed2364c359b055d5fa6994c5cedb955811d44d1172983aae744d`
and `5b858e52fa0c273db9fa2c4731db383a34a26b16d0e3cd4891ca5fc6a75acd1c`.
No agent edit, Save, prompt choice or forced termination occurred.

Fresh independent closed-file hashing matched the pre-open source: 598016 bytes,
SHA-256 `e620d21af8ca0378b7a3960a10acdaadf894f216e93a034f698fd7e4795fb741`,
with no WAL, SHM or rollback-journal sidecars. The separate 581632-byte
preparation checkpoint and its receipt matched their original commitments.
The retained closed-file receipt SHA-256 is
`6e1bb61428a7770c7be034712b1394407626d20d5056b57355ee3fdb95b01354`.
File equality is point-in-time evidence, not a full logical SQL/peer audit or
proof about all existing-profile, cache, network or automatic-persistence effects.

The independent verifier SHA-256 is
`9ec042d28bd8c64d28b8a9e27e7f8fc9e463d9dac7bafcdd35340042b817c686`;
its passing private review receipt SHA-256 is
`334449a4c2e0b5ef6c51f51cd5778e4620e8d2180ca26514538053e24f237dd9`.
The retained terminal CI snapshot SHA-256 is
`f9b857e4e939b64162157381b1742b37f65a2cd0c2625d095b99c3aa5f5336f6`.

## Pre-launch corrections and limits

The coordinating agent reported two offline request-wrapper schema errors
before launch: the first supplied `arguments` where `query` was required; the
second omitted the nested `query.request`. Both returned JSON-RPC -32602.
Source inspection established the correct nesting, and offline validation then
passed. These responses remain in the chat tool history, outside this independent
file inventory; no hashes are claimed for them. No CAD launch was dispatched
until the corrected request validated, so this was not a live-action retry.

Sequential matching samples are not an atomic or continuous snapshot. Models
without stateWatcher and other families remain excluded. Native enumeration,
cache reads, incidental initialization and serialization precede bounds; the
deadline does not cancel vendor work. The small fixture does not exercise
capacity limits, missing-cache failures, recovery/inverse paths or rendered
geometry. Filters, exact requested IDs, selection, child-pad association, complete
worker/source/SQL baselines and writer/Save/reopen lifecycles remain separate.

Private paths, native identities, design names and raw observations remain
outside the repository. Hashes detect evidence changes, not tampering by a party
able to rewrite the evidence store. This case grants no cross-version transfer,
production writer admission, persistence, connectivity or manufacturing authority.
