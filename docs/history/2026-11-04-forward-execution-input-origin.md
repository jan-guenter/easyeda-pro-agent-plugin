# Original forward execution inputs

This source-only slice starts from the frozen `a41cd0de01d298fc9ad762cd42ad4c1c7db065e2`
candidate in a separate worktree. It enables no writer or new user capability.
The frozen source-sealing checkout and its packaged proof remain unchanged.

The existing native source seal previously retained the source/checkpoint binding
but discarded the actual opening, result, preparation and owned copy-plan
references needed by a later genuine execution factory. It now retains those
exact references, together with the same original main runner, native binding
and birth ledger. Main/method, binding, preparation-result and resource identities
are captured before the seal's awaits and rechecked before retention. Sealing
still uses its existing six renderer requests; this change adds no native send.

`issueFootprintForwardExecutionInputOrigin` can issue only from the genuine
original forward factory after successful native sealing and original main
construction. The opaque token resolves through a private registry with the
same actual owner, source binding, main runner and ledger methods. Equal JSON,
a constructor-only owner, copied token or foreign factory context cannot replace
those references. Normal access refuses close, abort, cleanup-only output,
failed accounting and incomplete, pending, already handed-off or releasing main
state. Retained access after cleanup returns only the same historical references.
It supplies no current eligibility or native send lease.

This closes an input-custody gap, not the complete execution contract. Native
sealing may succeed before lifecycle result publication fails, so a future
factory must independently require settled original private publication. It must
also implement a distinct execution birth, original forward main and clock
issuers, allocated-create invocation/channel custody, dispatch-time head and
atomic queue/upload eligibility, actual document/backend clocks, completion,
complete resource/output reservations and a fresh saved verification adapter.
The current forward observation owner cannot upgrade into that birth. Its native
create/clock/completion refusals and the legacy Combined origin guards remain
unchanged. No `CurrentFootprintCopyExecutionNative` binding is fabricated.

Focused tests use the actual original factory, private registries and seal method
with explicit synthetic main/opening/preparation/checkpoint collectors and inert
Node child pipes. They cover refusal and reference custody, not native EasyEDA
ownership, source equivalence or writer admission. No live MCP, Windows/native
activation, installation, GitHub action, version bump, bundle build or pin update
is part of this slice.


Verification passed under Node24.18.0, npm11.16.0 and soft core limit zero:
48 focused tests across the new origin, original forward factory/source seal,
legacy main-completion origin, paired scheduler and execution coordinator; both
typecheck projects; strict targeted type-aware lint and diff checks. There were
no failures, skips or cancellations in the final run. The initial new-only run
had two assertions expecting different fixed refusal labels; the maintained
guards refused as required, and the assertions were corrected. Independent
source review found no concrete blocker. The complete local suites were not run.
The source-sealing worktree remains clean at `a41cd0d`.

## Exact source provenance, 2026-11-05

The 48-test checkpoint above used starting candidate
`a41cd0de01d298fc9ad762cd42ad4c1c7db065e2` plus the retained six-file
source patch with SHA-256
`b1e7b8379e1d81a1d2c22cb6667933a58692407757f572a4bc453202dafbf45d`.
That patch identifies the changed source, tests, fixture and history snapshot;
it was not a standalone commit. Its retained verification proof has SHA-256
`585a90ec6e2316451678ce129d62f1c1519c3eea4f69e924da76674688f16f78`
and binds the six selected test files to 48 passes, with no failures, skips or
cancellations. The starting candidate and any later composed commit have
separate attribution; neither replaces this original tested patch identity.
