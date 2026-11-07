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
