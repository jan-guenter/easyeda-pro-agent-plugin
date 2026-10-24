# Installed011500 selection, child-pad and historical queries

2026-10-24. One disposable PCB case completed the installed
`observe-selection-relations` stage, normal close, original root/Job termination
and helper release. Three later queries read that published snapshot after
release. Selection was empty; both requested Components had populated child-pad
lists. This is loaded-view association and historical query evidence, with no
complete-board, saved-state or editing authority.

This completes the first connected case pending in the
[011500 batch handoff](2026-10-24-011500-selection-query-batch.md).
The [000500 extended-reader case](2026-10-24-000500-connected-extended-pcb-readers.md)
remains separate and was not replayed. The coordinating agent performed no
production-design work. Independent review used retained records and read-only
file hashing; it invoked no live CAD tool.

## Actual payload and source

Actual host admission identifies `0.3.0+codex.20261024011500`, main
`a9f44a98b80cd257f0ecfdcccb1aae978421ef4d`, and plugin tree
`bf4ac540c1b0c4cab103eab66f5461ebce6c612c`. All 1819 packaged files and
42 directories matched committed bytes and modes, totaling 39160444 bytes.
The package inventory SHA-256 is
`ab44104c7ad1e2e2a1236510d1eb8a941092893df8e8c13eb153caa2f925c14c`.
The 638-source projection is
`a30c9cd0514f07f12b1b0d27e32baba5c9d0e4810239708f0e2ebfe91e8219cd`;
the three-bundle projection is
`19dcd70eebd0d15caea257f822c59f80bdeba71f340de2cf3a412a90c77da406`.
The host used Node 24.18.0 with soft core limit 0. Its admission receipt hash is
`679d0f4311ac1f60db2c40fc34c982ea05542782a7ecf94d61cb90f979a82d8a`.

The formerly pending [main CI40050687858](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/40050687858)
completed successfully at this commit. Build verification, all eight facade
shards and the aggregate passed. This updates only the prior pending CI claim;
CI remains distinct from connected evidence.

The retained browser reported EasyEDA 3.2.209.8a704eab. Independent review
rehashed the complete installed UI 3.2.198.2800f583, PCB 3.2.195.6b67774e and
API 0.3.59.1ca9efb5 assets and matched the original UI/PCB source records:

| Asset | Bytes | SHA-256 |
|---|---:|---|
| UI | 17468192 | `3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6` |
| PCB | 10991441 | `a84059304d32d4f0feb768d6c5baf00d72a954643ac62299f2c46c08fa68fd0b` |
| Public API | 1980754 | `e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1` |

Twelve installed reader, decoder, owner, protocol, lifecycle and helper sources
were compared directly with the committed payload. The 32719-byte selection
module hash is `8ada209d27d086ab800f6888be67ef417e589e0058b3a8406ed6c71c6c38ccb0`.
The 967711-byte native helper hash is
`7068a383a7d0ad5a0e3e930cfc134240dac322efb8739943e9c3096656950bed`.
The fixed reader and its limitations are detailed in the
[selection source research](2026-10-24-pcb209-selection-query-research.md).

## Observed domain

Launch, browser/frame inventory, UI source qualification, checkpoint-bound
project opening, PCB opening and separate PCB source/DOM qualification preceded
one selection/relations attempt. No retry or selection change occurred.

| Observation | Count and scope |
|---|---|
| Line | 1 loaded view |
| Via | 1 loaded view, ordinary top-to-bottom type |
| Component | 2, with all six selected metadata keys present |
| Pad | 4, null holes, RECT default shapes, mask mode 2 and null thermal settings |
| Attribute | 6, two ordered parent groups with three children each |
| Arc, String, Dimension, Image | Empty-only coverage |
| Selected IDs and selected DTOs | Empty-only coverage |
| Requested Component child-pad groups | 2 populated groups, two Pads in each |

Every ordered family ID list matches its DTO rows, with no duplicate global
IDs. Attribute parent order matches the observed Component roster. Each child
Pad's number, net, layer, lock, metallization and type agrees exactly with its
global Pad DTO. No child is assigned to two requested parents. Child-handler
geometry was not projected, and reciprocal ownership and symbol-pin mapping
remain unproved. Native net labels were not interpreted as resolved connectivity.

The fixed program requires two identical complete ordered family projections,
selection brackets and requested child lists. For these two requested Components,
it performs 30 local RPCs inside one CDP request. The accepted result retains
one projection and reports matching samples; it does not export two separate
raw sample packets. Independent reconstruction matched the complete native
packet's projection commitment, including target, selection and child groups.

## Queries after original cleanup

Post-release inspection returned the published result-record digest and original
observation time. All three public query calls used that exact digest:

1. A Pad query requested all four IDs in reverse observed order and applied an
   exact net-string filter. It returned the two matching full DTOs in requested
   order, with source count 14, candidate count 4 and returned count 2.
2. A child-pad query returned one originally requested Component's two Pads in
   recorded child order, with its metadata-presence state and complete observed
   child group. It did not enumerate a new Component.
3. A selection query returned the recorded empty selection. It preserved the
   complete Attribute parent roster with the explicit observed-roster scope.

Independent comparison checked each query's exact rows, order, counts, groups,
provenance, projection digest and false freshness/authority flags against the
original result. These are historical disk projections. They made no new native
read, restarted no owner, and prove neither fresh public `get` execution nor a
currently empty selection. Other filters and populated selections remain untested
by this connected case.

## Evidence and closure

Independent verification passed all 21 journal files, 23 canonical digest links
and 16 MCP response receipts. It checked target/binding agreement, intent/result
links, wrapper commitments, DTO constraints, metadata states, associations,
queries and the retained closed-file evidence.

| Evidence | SHA-256 |
|---|---|
| Complete selection/relations projection | `9e6242931366cbe0d9dc09989aaefef4ee5fe0b1795e36702d2f038187203feb` |
| Published result record, canonical | `c1ab5b4031ca4db94ab8b7388a1f0b575ce32e2dff50103098605bce354623cc` |
| 11190-byte journal result, raw | `51bdaf9c3bcb6595edb2d8c6ee3b72a22016d3fee4fc41b97ba94a716ac641e0` |
| 12433-byte live MCP result, raw | `48481c3fab34183af0c80e741acf3de02a2b5b965985b41886e40d36e21611f2` |
| Journal inventory | `6a99e7dc81ed5a38345b4a409cac8ecfc7f08f3af7cf189701737174c906a231` |
| MCP response inventory | `0a90bf753187e901152167567b0c6cc643fe0729d6e8f8fda15865d3adc95308` |

Normal close acknowledgment preceded original-root-exited and original-Job-empty
proof, then helper release. The terminal record hashes are
`23688e355267eba1927768492036b62bdf8ea80ed973e4f4f55d265101afe687`
and `029cd8e3bcec8ccf033a7d239cdf227615838033453ac532bdf9fa994ec4fcb8`.
No agent edit, explicit Save, prompt choice or forced termination occurred.
Inspection after release found no observation failure or pending publication.
Its diagnostic pipe reports normal closed state, separately from retained
termination proof; that closed state is not a new failed observation.

A fresh independent hash of the closed disposable file matched the pre-open
source: 598016 bytes, SHA-256
`e620d21af8ca0378b7a3960a10acdaadf894f216e93a034f698fd7e4795fb741`.
No WAL, SHM or rollback-journal sidecars were present. The separate preparation
checkpoint remained 581632 bytes with SHA-256
`147c1aa16c320560a73eaba0f5721619db9e036650dbc91ed75eda727652d3b3`;
its receipt matched the original intent. The closed-file receipt hash is
`d63351667fa6df70791d023b5bd937c00a349ea6622009e5a4c9fc42df21d75e`.
These are point-in-time byte checks, not a logical SQL/peer audit or proof about
all profile, cache, network or automatic-persistence effects.

The independent verifier hash is
`2824b898787b508edb249cb7427f26135a21424c35e8261d91867b830a7fb7e9`;
its passing private receipt hash is
`3002da8c6167e20b33af4a654b632516df890844fad43ea054b25bb16ea089d8`.
Its first attempt incorrectly reused the extended reader's smaller digest
formula. The selection decoder commits the full native packet, including
`ok`, `kind` and `target`. Correcting that independent verifier formula produced
the exact original commitment. The failed verifier source and explanation were
retained; no runtime code, journal or live evidence was changed.

This completed case must not be replayed. Sequential samples are not atomic;
models without existing views and unprojected fields remain excluded. This
small fixture does not cover limits, failure/recovery, rendering or saved edits.
Private design data and raw evidence remain outside the repository. The case
grants no cross-version transfer, production writer admission or manufacturing
authority, and does not validate the later Pad/Image shape implementation.
