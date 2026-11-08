# Original Via drain owner API

The retained producer observer now exposes one `continueSaveDrainCall` pump for
three upload, 22 uploader/cache and seven changed-head sync events. It selects
the full sync from the original deferred-sync/cloud-finally cursor proof,
waits the original Main history-completion and live-row arm signals, and uses
actual Main rows/body/ciphertext for its private cache projection. Callers do
not supply a cache body, worker handle, completion flag or resume callback.

`saveDrainProgress` reports all calls resumed only after all 32 original
continuations. `settleSaveDrain` services remaining original bounded Promise
checks. `requireOriginalSaveDrained` requires the same completed cursors,
original native completion ACK, exact current owner/body/history/source refs,
and a drained original producer event lane before returning its opaque token.
Copied completion-shaped objects cannot qualify.

The original worker now registers each submitted fixed function or expression
before its pipe write. After bootstrap it reads and qualifies the corresponding
actual same-context script source. Fixed armed breakpoint conditions use a
separate persistent registry and can interleave without consuming submitted
helpers. Unsubmitted or foreign-context scripts refuse. Source-held helpers
retain their old catalogue and budget. The added source-reader reservation is
separate from all original finite lane ceilings.

Both TypeScript projects, changed strict lint, fixed wire tests, production
controller/source-event regressions and the pure cursor/source-return checks
pass. This interface batch deliberately precedes final combined native packing
and codec compilation. No helper/pin/bundle or application was changed, and no
live writer or saved/reopened result is claimed. Native completion remains
mandatory; an older helper cannot satisfy the new completion request.


## 2026-11-08 validation attribution

The implementation checkpoint introducing this record is `97b1c6777f006d55977e96c5dba40d4460faa676`; its
committed tree is `face77322187afcafa56b945be18b2a4e1fbd059`. These are verified Git provenance identifiers,
not a claim that the complete test-time worktree was sealed. The earlier
record did not retain that complete worktree manifest, so its reported local
results cannot establish validation of an exact complete release payload.
Predecessor references and individual helper/compiler hashes keep their
original narrower meanings. See the [PR185 attribution correction](2026-11-08-pr185-history-attribution.md)
for the evidence limits and the final-release verification requirement.
