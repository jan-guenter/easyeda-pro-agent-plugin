# Historical recovery continuation across plugin versions

The later full review and controller observations are retained in the
[conflict closure and review repairs](2026-11-04-conflict-closure-and-review-repairs.md).

This follows the [timeout and retirement batch](2026-11-04-controller-timeout-and-retirement.md).
CodeRabbit's exact-head review of `4e22859b6a10af70036c0b3a2293cc9d69a09480`
found that a partially published historical relinquishment intent could prevent
a newer plugin version from finishing recovery. Its recorded publisher digests
were being compared with the current collector's installation.

The coordinator now checks current publisher digests only when creating a new
intent. Reusing a managed intent preserves its original bytes, publisher and
complete original-history bindings. A new coordinator must still collect fresh
process-absence and file proof. The regression rejects mismatched original
digests and failed fresh file proof before permitting settlement; the old
intent and original history remain unchanged. The focused coordinator slice
passed three tests, with types and zero-warning targeted lint clean. Persisted
schemas and unknown capture/termination/helper outcomes are unchanged.

The same head's CI completed with nine required jobs successful. The remaining
facade shard failed because a manager test used an SDK schema rejection as if
it had admitted a non-reference callback. With private source-only retirement,
that distinction matters. The fixture now uses a valid release request that
semantically refuses because it has no retained owner. It allocates no native
resource. All 12 manager tests and targeted lint passed after this test-only
correction. The failed CI and its aggregator failure remain retained; no other
shard, native or build failure occurred. Final exact-head CI and review remain
required before merging the corrected batch. No new native case ran.
