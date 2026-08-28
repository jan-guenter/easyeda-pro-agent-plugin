# Safety state machine

EasyEDA has several meanings of "success." A wrapper can accept a request, the editor can change its in-memory model, the serializer can write different data, and the next reopen can restore an older bound source. Track those stages separately.

This chapter specifies the experimental one-component writer. Production leaves that writer runtime-disabled until a connected sacrificial-board validation deliberately enables it; these transitions are review criteria, not an instruction to call the mutation tools now.

## States and transitions

| State | Entry evidence | Allowed next action |
|---|---|---|
| `connected` | Facade health, upstream health, bridge identity, version tuple | Read context |
| `context-proven` | Exact project and active document identity | Read baseline |
| `baseline-reopen-dispatching` | Verified pre-checkpoint and durable journal written before the authorized close/reopen-without-save | Wait; never retry an uncertain lifecycle call |
| `baseline-reopen-unknown` | The clean-baseline reopen had an ambiguous outcome | Verify the intact pre-checkpoint and invalidate the plan through recovery |
| `baseline-reopened` | The exact target was reopened from the checkpointed durable source and its new tab was rebound | Run target-bound preflight |
| `preflight-proven` | Target-bound baseline assertions and hash pass after reopen, and the source still equals the verified pre-checkpoint | Apply one unsaved operation |
| `plan-invalidated` | Pre-checkpoint or repeated preflight changed before apply | Stop; build a fresh plan. No mutation was dispatched. |
| `applying` | Durable journal written before dispatch | Wait for the call. Never retry it. |
| `applied-unsaved` | Apply response plus proof that the durable project still exactly matches the pre-checkpoint | Verify or roll back |
| `live-verified` | Every planned assertion passes, unrelated invariants match, and the durable project still exactly matches the pre-checkpoint | Save after fresh proof, or cancel through the exact inverse after fresh desired-state and durable-baseline proof |
| `saving` | The immediate pre-save verifier and a second pre-checkpoint check passed, and the journal was made durable before dispatch | Wait for the exact save/close/reopen call; never retry an uncertain result |
| `verification-failed` | A live assertion failed | Roll back only if a fresh exact read still proves the complete desired target and admitted consequences; otherwise stop |
| `rolled-back` | Exact baseline readback matches | Stop or prepare a new plan |
| `document-saved` | Exact document save and reopen call passed | Run reopened verification |
| `reopened-verified` | Exact saved document was reopened, all assertions pass, the pre-checkpoint remains intact, and the logical live database differs from it | Create a candidate final checkpoint, then bind it to another fresh reopened readback |
| `completed` | Fresh reopened assertions pass after candidate creation, persistence from the pre-checkpoint still holds, and verification of the candidate checkpoint against the live database is the final proof | Report completion |
| Hard-stop states | Timeout, disconnect, ambiguous result, failed inverse, or failed reopened proof | Recover and read only |

Never skip from `applied-unsaved` to `completed`. An in-memory verification is valuable because it permits rollback, but it is not persistence proof.

## Define one operation unit

The guarded operation unit is exactly one existing PCB component and one coherent change to its pose, Top/Bottom layer, or lock. Several components require several completed operations. This single-target limit prevents a failure on component N from leaving earlier components in a partial state that matches neither full baseline nor full result.

Before applying, record:

- exact project identifier and `.eprj2` path plus document identifier;
- document type, title, active tab, and version tuple;
- the one target primitive ID, reference, `UniqueId`, layer, lock, pose, and binding IDs;
- every intended top-level before/after field plus expected bound and transformed-pin consequences;
- global counts relevant to the operation;
- topology, pad-net, rule, route, pour, or geometry invariants relevant to the operation;
- preflight output and its hash;
- the planned apply, verification, inverse, reopened verification, and checkpoint paths.

Counts are guardrails, not a substitute for identity checks. A delete and an add can leave the same count.

## Apply and verify

`easyeda_control_plan` rejects unrestricted JavaScript in every slot, any document other than PCB type 3, more or fewer than one target component, unsupported target fields, missing exact phase readers, or a checkpoint not bound to the active `.eprj2`. Review the plan hash before apply.

Planning is deliberately destructive to unsaved target-document state. After explicit discard authorization, it creates and verifies the pre-checkpoint, journals the lifecycle phase, closes and reopens the exact target without saving, binds the returned tab into the plan hash, runs target-bound preflight, and finally re-verifies that the source still equals the pre-checkpoint. This ordering prevents pre-existing unsaved edits from being swept into the planned save.

Apply and rollback must be the facade pseudo-call `easyeda_control_exact_component_mutation` with `state: "after"` and `state: "before"`, respectively. The pseudo-call is not forwarded. The facade builds `pcb_PrimitiveComponent.modify` from journaled target changes and submits only `x`, `y`, `rotation`, `layer`, or `primitiveLock`. It checks exact context, awaits a target read, rechecks context, compares synchronous fields with the journaled opposite state, then invokes modify before another yield and checks context after the result. This is an optimistic precondition, not an atomic EasyEDA compare-and-swap; switch-away-and-back is undetectable, so keep the editor quiescent. Raw code, convenience writers, captures, exporters, schematic writers, and every other PCB writer are rejected.

A plan contains the private capability label, exact expected context and active tab, the stable runtime fingerprint returned by status, explicit `targetChanges`, exact preflight calls, the one facade apply pseudo-call, exact live verification calls, the inverse pseudo-call, exact reopened verification calls, and checkpoint inputs.

Every preflight, live, and reopened phase must contain the facade-owned exact all-component summary, detailed target component, PCB primitive inventory, and PCB rules readers. The engine compares non-target component state and global inventory/rule hashes automatically, and permits only the declared target differences. Generic upstream reads, health, catalog, guidance, transaction, fallback-empty, and reduced-summary tools cannot satisfy a phase.

The engine automatically asserts all declared target fields and invariant hashes. Optional call and aggregate assertions can add project-specific checks. They use JSON Pointer paths; aggregate live and reopened paths begin with the call's array index. Except for `exists`, every assertion needs a value. A missing pointer never satisfies `equals` or `not-equals`.

`easyeda_control_apply` must rerun context and preflight checks. If their hash differs, discard the plan and investigate. Record the operation as applying before the upstream write starts so an interruption remains discoverable.

Pass the returned operation ID and plan hash unchanged to apply, rollback, and save-reopen. Their confirmation fields are dispatch gates. They do not replace the user's authorization.

After apply, obtain new double-sampled exact data. Do not reuse pre-change evidence. The detailed target must match the declared result, the non-target component summary must be unchanged, and PCB inventory and rules must match the baseline. Add project-specific clearance or mechanical checks when the requested placement depends on them.

After the apply response and again after live verification, re-verify the pre-checkpoint. If the project database changed before the controlled save, enter a durable-baseline hard stop. Do not describe the live result as unsaved or verified-unsaved.

Immediately before save, rerun the complete typed live verifier and its aggregate assertions, then re-verify the pre-checkpoint. Journal `saving` only after both pass, write the proof artifact, and verify the pre-checkpoint once more immediately before dispatch. A failure at either durable gate records `durable-baseline-drift` and does not call save; do not save from stale live evidence.

The candidate writer's plan and invariant assertions are exact. They accept no caller-selected numeric tolerance. Normalize a known representation before planning; do not weaken a failed comparison.

## Rollback

Rollback is the one facade-generated inverse, not a promise that Undo will work. Before dispatch, freshly prove the complete desired target and every admitted consequence, verify the durable pre-checkpoint, then verify that checkpoint again immediately before the inverse. If the desired state is not exact, refuse the inverse. Store the complete before-state, invoke the journal-bound `state: "before"` pseudo-call once, then rerun the exact baseline reads and compare their hashes.

Use native Undo only when all of these are true:

- the history entry is unambiguous;
- no other edit occurred after it;
- the exact pre-state is known;
- post-Undo readback can prove the baseline.

If rollback cannot prove the baseline, enter `unknown`. Do not save, begin another edit, or repeatedly invoke Undo.

## Authorization boundaries

A transport field such as `confirmWrite: true` acknowledges tool risk. It does not grant design authority. The user must have requested the design change or an in-scope workflow that requires it.

Checkpoints write evidence files, not design data. Restore is different. It can overwrite user work and requires explicit approval, exact source and destination validation, and a closed EasyEDA process.
