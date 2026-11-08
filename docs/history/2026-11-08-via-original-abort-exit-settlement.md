# Original Via abort and exit settlement

The Via owner now sends the fixed `confirmOriginalJob:true` field required by the original native abort dispatcher. Previously the TypeScript request omitted it, so the exact native roster could refuse before requesting original Job termination. The real synthetic-child regression now checks that full roster and confirmation before it accepts the abort. A consumed or unknown abort remains nonrepeatable.

The supported Via actions `observe-termination` and `release` call the internal
workflow method `settleCleanup()`. That method may start another bounded read-only
original root/Job observation round after the previous round actually exhausted its finite observations. Concurrent calls share the same pending round. Each round retains the same original owner and binding, verifies that binding around each observation, and clears exhaustion eligibility before any await. Protocol, journal, binding and helper-release failures cannot inherit an earlier exhaustion. Original Abort, Close, helper-release Promises and historical journal records remain unchanged and nonrepeatable.

The scheduling regression exercises two complete exhausted rounds followed by a successful original exit proof and one helper release, with one Abort/Save and one copy of each cleanup record. It also proves a protocol failure after prior exhaustion keeps its original error and does not authorize another round. All saved/reopened claims stay false.

Verification: 13 focused owner/scheduler tests pass, including the real synthetic child and both in-flight/exhausted settlement paths; both TypeScript projects and changed strict lint pass. The bounded independent review found no scheduling regression. No helper artifact, native owner, application, MCP connection, process control or installed byte was changed by this source correction. An already-consumed failed abort cannot be retried or repaired by this change.

## Later process-closure result

The [controller recovery record](2026-11-08-review-and-controller-recovery.md)
records the separately authorized original process exits and preserved missing
Job/release proof. The failed operation was not replayed or completed.

## 2026-11-08 source provenance correction

The Git checkpoint introducing this record and its source/test changes is
`81cc1a818ca1fabe78654a59f141e89a191793dc`; its committed tree is
`44e6a292f9847812f64218f2dd337f8a9fa5a476`. Its Git author timestamp is
`2026-11-08T02:01:14+01:00`. These identify the committed increment only.
The complete test-time worktree was not sealed in the retained evidence and
cannot be reconstructed from it. The reported checks above keep their original
scope and observations; they are not attributed to this commit or a later tree.
See the [PR190 attribution correction](2026-11-08-pr190-history-attribution.md) for the evidence limits.

The thirteen owner/scheduler cases have no retained complete tested-payload
identity in this record. Their synthetic success and failure observations do
not establish live admission of either supported cleanup action.
