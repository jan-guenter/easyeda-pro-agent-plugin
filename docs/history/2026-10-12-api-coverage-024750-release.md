# Candidate 024750

`0.3.0+codex.20261012024750` corrects Unicode page reconstruction in three
retained-evidence readers. Payload `f1bf7e64726686e2eb6200ef24e2cd0de821a844`
passed [CI38197962968](https://github.com/jan-guenter/easyeda-pro-agent-plugin/actions/runs/38197962968),
but was not installed. A follow-up review found a separate completion gap in
eight existing metadata writers. Installation was held for the
[030626 correction](2026-10-12-api-coverage-030626-release.md), which includes
these reader fixes. No additional SDK method is enabled by this candidate.

## Evidence reader correction

The design phase reader, bounded library recovery readers and schematic
constructor-witness reader could reject valid evidence when a four-byte UTF-8
character crossed a page boundary after its third byte. Decoding those three
bytes produces U+FFFD, whose UTF-8 encoding also occupies three bytes. The old
byte-count check could accept that damaged page, then fail at a later boundary
or at the complete-file hash. These failures were closed refusals, not accepted
corrupt evidence or authorization to repeat a write.

All three readers now treat an initial trailing U+FFFD as ambiguous and shorten
that page. Later retries stop at the first exact byte-count boundary, even if it
ends in a genuine U+FFFD before the split. At most three bytes are removed.
Existing reader-specific bounds, identity/size checks, complete hashes and JSON
parsing remain unchanged. No Save, mutation, recovery or replay policy changed.

The new tests exercise the actual readers with two-, three- and four-byte
characters, genuine adjacent replacement characters, malformed raw UTF-8,
same-size tampering and size mismatches. The constructor resolver tests use
synthetic managed journals and inspect installed implementation files only;
they do not open EasyEDA or a design. That extra resolver matrix is skipped
when the pinned Windows sources are absent. Portable pure lineage tests remain.
Red runs reproduced the defects before the source changes.

## Completed live work on the preceding installation

Fresh installed013324 admission and two new disposable wire commits completed
before these source edits. [C06 and C07](2026-10-11-through-2026-10-19-api-connected-validation-ledger.md#2026-10-12-c06-final-wire-observation-retained-on-013324)
record exact source/native/contact and full selected-branch persistence proofs.
The original wire geometry is restored. The editor was closed normally, and
the final closed checkpoint and listing-only backup checks pass. No transaction,
Save or navigation remains pending or repeatable. Production was not accessed.

Those results validate013324, not this newer parser build. Commit-path retention
was tested; the four other newly retained lifecycle paths remain separate.

## Skill corrections

The evidence guide now explains the initial-only replacement-character check,
including why retries must not skip a genuine U+FFFD. The native-control guide
also records an observed capture mismatch: a region-capture PNG was a full-sheet
overview, while a subsequent owned native desktop capture showed the requested
close-up. `captured:true` does not prove correct framing. The native image, not
the overview, supplied that case's visual acceptance. The
[paint-completion source review](2026-10-12-canvas-capture-paint-completion.md)
traces the separate model-update and bitmap-render queues. The existing wait
does not prove target paint completion, but the exact cause of that one mismatch
was not observed. This release does not contain a paint synchronization fix.

## Local verification

The clean pinned Node24.18.0/npm11.16.0 run passes 3,900 facade tests with one
platform-specific skip and zero failures, plus all 424 bridge tests. The 172
focused reader tests pass. Strict TypeScript and type-aware Oxlint are clean.
Dependency checks report 151 verified signatures, 40 verified attestations and
zero audit findings. The sanitizer, coverage inventory, compatibility checks,
repository/privacy/license checks, seven official skill validators, offline
doctor and actionlint pass.

A second complete facade run with inherited descriptors142/145 passes the same
3,900 tests and one platform skip. Rebuilding both bundles reproduces their
bytes exactly; the sanitizer remains unchanged. Only facade projections and
the review timestamp changed in the compatibility manifest. All external
runtime pins remain exact.

| Frozen release input | SHA-256 |
| --- | --- |
| Facade source, 206 files | `35188e24ae677a63dfd1e9c6496bb797106a195cc4061583e3c5eac0795c27c0` |
| Runtime, three files | `f1fdd2bf4bbe7caa80a51f8f00d5e1e65287b0f6939601d7a5fa23c9000b680a` |
| Compatibility manifest | `b020340e5f78f14a11ca836b24b6ae51ded2e176c811af69312e8fa243463885` |

Independent review accepted all three reader changes and both guide corrections.
Its separate injected-reader stress test covered 248 valid boundary cases and
131,072 byte-pair cases against fatal UTF-8 decoding followed by JSON parsing.
That test exercised the two exported library readers, not connected CAD work.

## Remaining work

Symbol deletion is still unavailable. The
[native-effect investigation](2026-10-12-symbol-delete-native-effects.md) covers the exact
project-qualified worker route, tombstone history, native preview and close-tab
subscribers, and a delayed structure-table update outside the ordinary upload
barrier. A structural planner alone cannot establish completion of those effects.
No dormant candidate or private proposal is advertised as an executable method.

The published payload's CI passes 3,860 facade tests with five platform skips
and zero failures, plus 424 bridge tests. All build, audit, package and archive
steps succeeded. The PR merge tree matches package subtree
`ac3296e62e63222709760e3e15946f99081aaa85`. The additional local constructor
matrix and three older Windows-dependent cases account for the count difference.
No installed-package or connected admission is claimed for024750. PR9 remains
draft while broader API work is unfinished.
