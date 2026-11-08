# Separate saved schematic registration policy

The Main runner now has a third, distinct recent-path registration issuer for
the saved seven-record schematic reader. It accepts only that reader's genuine
private intent and exact original runner. The Via saved-reader and footprint
inverse entry points retain their own issuer checks.

Enrollment rechecks the selected closed path, actual page identity, separate
schematic identity and original binding object around every await. The actual
registration callback must still prove that the same original UI request is
pending. The existing fixed32-command registration codec and its source sites
are reused without granting any other SQL operation.

A genuine settled result that proves the exact path was already registered can
finish an entirely unused sequence. This requires the original Core's separate
no-dispatch proof. It refuses a tracker, opened pause, armed request or held SQL
pause and cannot fabricate a native run or callback acknowledgment. A normal
dispatched sequence still requires the existing original source-await proof.

Thirteen focused Main-runner checks passed, including copied-intent and
issuer/skip refusal with no downstream command. Strict type-aware lint and both
TypeScript projects passed.
Connected registration, fresh cache/loading custody and saved/reopened
acceptance remain separate. The original registry getter is implemented, while
its actual issuer remains unavailable until those runtime prerequisites exist.


## 2026-11-08 validation attribution

The implementation checkpoint introducing this record is `1ac3ff48ee660abd81a986aaa9401a94b2ae73bc`; its
committed tree is `4db0cc3f1025b99f9e46f2d37a4aaa5b9a9bf884`. These are verified Git provenance identifiers,
not a claim that the complete test-time worktree was sealed. The earlier
record did not retain that complete worktree manifest, so its reported local
results cannot establish validation of an exact complete release payload.
Predecessor references and individual helper/compiler hashes keep their
original narrower meanings. See the [PR185 attribution correction](2026-11-08-pr185-history-attribution.md)
for the evidence limits and the final-release verification requirement.
