# Original Via live-history release ordering

The source review on canonical `8fee9361` traced the retained disposable Via workflow through startup/quiescence, prospective create and Save intent, the same producer's 32 upload/drain/post-sync events, original Main STRUCTURE/history and live history read, original writer closure/full SQL checkpoint, and the separate fresh saved reader. The review concerns that one selected local request and its original causal DAG. No app, native owner, Windows compiler or MCP call was made.

A concrete race existed at the worker's actual post-history `syncHistory` pause. The Main live-history custody resumes its original yB return at step 12, then performs the final object-group release at step 13. Its rows getter deliberately requires the complete step-13 ledger. The worker can receive the API response and reach `syncHistory` while Main is still performing that final release. Core's late cache-plan derivation called the getter immediately and could falsely refuse the valid original run.

Core now retains a private rows-completion Promise on the same original owner. Only the original Main live-history request wrapper, after the final release acknowledgement and original-owner reproof, resolves it successfully. Late cache derivation waits that Promise while the exact worker pause remains held, then rechecks the original plan/producer before accessing the completed rows. Main/worker failure, original Job-only abort and Via-only helper transport failure resolve pending waiters as refused. A later acknowledgement cannot revive a failed original Promise. No extra GET, poll, timeout, replacement collector, copied completion flag or resume grant is introduced.

Two focused production-Core regressions use an explicit inert allocation/row-getter seam. They prove that arm and resume alone never read rows, the final original release acknowledgement returns the same retained row object, and transport failure wakes the wait without a read or revival. Strict changed-file type-aware lint and TypeScript checks pass. Native phases, request counts, helper source and the six released native roles are unchanged.

No further concrete completion gap was identified in the inspected workflow/selected-request chain. After this fix, final helper freeze/static compilation, current source admission and the separately reviewed exact tool-mode/approval registration, the route is suitable to begin controlled disposable validation. That is not connected lifecycle acceptance: the actual original writer and fresh reader must still complete their existing source/SQL/closure/helper-release proofs. General ordinary-project writes remain disabled. No completed design edit or Save was replayed.


## 2026-11-08 validation attribution

The implementation checkpoint introducing this record is `bf3428b26dfeaadb9268a9989349b34e3a776424`; its
committed tree is `7d6c64b3edd5600e371146158923449e0103cfa2`. These are verified Git provenance identifiers,
not a claim that the complete test-time worktree was sealed. The earlier
record did not retain that complete worktree manifest, so its reported local
results cannot establish validation of an exact complete release payload.
Predecessor references and individual helper/compiler hashes keep their
original narrower meanings. See the [PR185 attribution correction](2026-11-08-pr185-history-attribution.md)
for the evidence limits and the final-release verification requirement.
