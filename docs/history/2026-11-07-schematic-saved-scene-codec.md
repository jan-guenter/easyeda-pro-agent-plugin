# Schematic saved scene codec

The separate saved schematic reader now has a finite scene codec with exactly
three stages: capture, observe and object-group release. Capture uses the fresh
original context. Observe uses its original retained tuple. The codec has no
navigation, mutation, Save, arbitrary function or arbitrary CDP method branch.

The readonly renderer function moved into a build-only module. The existing
plan argument issuer and its original function export remain available at their
old module path. This lets a future distinct native reader embed the exact
scene bytes without importing the historical closed-lifecycle argument issuer.

The codec checks the exact source program, stage-specific selectors, fixed
flags, canonical target and operation JSON, six peers and three roots. Native
frames require the original session and exact compact UTF-8 bytes with one NUL.
It reuses an immutable bounded data copier for the fixed function string, which
exceeds the old clock packet's string limit. The clock limit remains unchanged.
That reuse supplies no inverse runtime or authority.

Four focused checks passed. They cover the fixed frames, rejected writer phases
and replacement programs, accessor refusal, original readonly seven-record
scene execution in an inert graph and the existing argument issuer's refusal
of copied plans. Strict type-aware lint and both TypeScript projects passed.
Native generation, cold-load custody and connected saved/reopened acceptance
remain separate from this source codec.


## 2026-11-08 validation attribution

The implementation checkpoint introducing this record is `c4790fee73bd60bbe1182755ee7241f1b7aca5d2`; its
committed tree is `1f6066c1b21aea3da27f1bc3b05bb949845d8519`. These are verified Git provenance identifiers,
not a claim that the complete test-time worktree was sealed. The earlier
record did not retain that complete worktree manifest, so its reported local
results cannot establish validation of an exact complete release payload.
Predecessor references and individual helper/compiler hashes keep their
original narrower meanings. See the [PR185 attribution correction](2026-11-08-pr185-history-attribution.md)
for the evidence limits and the final-release verification requirement.
