# CI status and fixture repairs

Draft PR 171's first full CI run exposed several independent failures.
Its build and outgoing-history checks passed, while the facade shards and
Windows job failed. Those results remain failures, not release evidence.

The coordinator fixtures now model the exact reviewed bundled deployment
instead of growing the synthetic fingerprint with every development source
file. The shared fingerprint fixture keeps its source-tree default and offers
an explicit bundle selection for the bounded coordinator cases. The existing
256 KiB artifact and trailing-newline guards are unchanged. The native release
fixtures now inject the maintained cold graph module actually used by the
factory. Their previous injections targeted its superseded module and never
reached the intended failure callback. Eighteen focused coordinator, bounds
and release cases passed after these repairs.

Public status now accepts fresh managed `evidence` paths and `returnMode`
`summary` or `receipt-only`, using the existing complete evidence archive.
The full admission fingerprint and all status fields are archived unchanged.
The default inline result retains its existing shape and 512 KiB limit.
The source-mode capture fixture successfully archived a 604,449-byte status
containing 2,066 implementation files; the returned receipt remained bounded.
Its source-backed contract, capture and quarantine cases passed. A prior run
also found a stale offline SDK-reference expectation, which now includes the
separate packaged reference.

The packaged startup expectations include the added fixture and Via tools,
22 geometry descriptors and 56 legacy tools. Local packaged checks still
ran against the older committed bundle and refused three cases. They must be
rerun on the next fully generated, pinned payload; those refusals do not
validate the new bundle. Source and native generation work remains batched.

The schematic public PowerShell smoke wrapper correction and its exact
two-pass normalization are integrated. Its composed expression now uses named
intermediates to satisfy the existing nested-call lint rule. Two public smoke
checks and changed strict type-aware lint passed. The earlier combined lint
run encountered an in-progress merge; its log is retained and supplies no
final verification claim.

Other CI fixture repairs, final native artifact generation, exact-payload CI,
CodeRabbit review and release remain open. CodeRabbit refused the requested
full review because 1,850 files exceed this installation's 150-file limit.
A skipped review is not approval. No merge or installation occurred.
