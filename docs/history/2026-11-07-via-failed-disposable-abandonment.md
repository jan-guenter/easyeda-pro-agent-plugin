# Failed disposable Via abandonment

The separate `easyeda-pro-control.pcb209-via-write-abandonment.v1` sidecar records an original failed disposable Via operation whose original execution, factory calls, helper, journal publication and file captures have settled. It never changes the v1/v2 journal or result schemas. Save, reopen, completion, replay, owner transfer and restored execution authority remain false.

`CurrentPcbViaWriteAbandonmentPublication` accepts only the original plan, journal and the outer workflow's private failure-closure token. Its literal lazy lookup retains the genuine workflow function and exact bindings, rechecking the original closure around publication awaits. Four outcomes remain distinct: allocation never entered, factory entered without resource allocation, an allocated helper with no root process, and an original root exit plus empty Job and helper release. Writer and optional reader generations are bound separately; every existing no-process release record must agree with its own generation.

Publication prepares one bounded sidecar at the fixed operation path and uses exclusive managed publication once. Repeated `publish()` calls join that exact Promise, including rejection. `settle()` waits the original write, then only reads and verifies its retained descriptor; a lost acknowledgment never permits another write. The file reader retains the managed parent capability, refuses symlinks, hard links, wrong ownership/modes, changed inode/size/timestamps, malformed UTF-8 and files over 4 MiB, and awaits all original handle closes.

Both global bridge/native admission and the direct Via startup scan qualify the sidecar against fresh full journal and plan hashes, the complete journal snapshot and every phase artifact. Changed artifacts or sidecar contents restore quarantine. Historically terminal no-allocation/refusal/completed journals already have their existing qualification and need no sidecar. Other operation families remain omitted explicitly.

The focused tests use real isolated managed publication and admission with an explicit inert original-authorizer seam. They cover all four distinctions, immutable original journals, one-write lost-acknowledgment settlement, changed phase bytes, false success claims, and copied/changed original tokens. No app, native owner, design file, process signal, cleanup command or live writer was used. Actual closure issuance and outer publication remain owned by the maintained original workflow; source tests do not establish a successful writer lifecycle.


## 2026-11-08 validation attribution

The implementation checkpoint introducing this record is `ddd15a4367073294e68222f33570713d13937327`; its
committed tree is `d4d4d6bcc7a91c91d049fc53e9ba0cac6e9763f0`. These are verified Git provenance identifiers,
not a claim that the complete test-time worktree was sealed. The earlier
record did not retain that complete worktree manifest, so its reported local
results cannot establish validation of an exact complete release payload.
Predecessor references and individual helper/compiler hashes keep their
original narrower meanings. See the [PR185 attribution correction](2026-11-08-pr185-history-attribution.md)
for the evidence limits and the final-release verification requirement.
