# Failure recovery

## First rule

After an ambiguous write, stop writing. Record the operation as `unknown` or `mutationMayHaveOccurred`, preserve every artifact, and do not read or retry through the same runtime while a dispatched call may still be running. A blind retry can apply the same change twice or destroy the only recoverable baseline.

The facade enforces a global bridge quarantine whenever any managed journal reports orphan risk. It also treats an unreadable journal as a blocker because the lost state may conceal the only orphan marker. Live status, context, exact/generic reads, captures, exports, checkpoints, raw calls, and mutation phases are refused. Local catalog discovery, managed artifact/evidence inspection, recovery listing, and the nonce-bound recovery resolver remain available. Quarantine discovery uses only the facade's static reviewed snapshot; it must not start the upstream or connect to EasyEDA. Do not delete or rewrite a journal merely to bypass this gate.

Call `easyeda_control_recover_incomplete` to list journals that did not reach a terminal state. Its summary includes the managed journal path, uncertain phase, bounded last error, recent artifacts, and checkpoint receipt pointers. Inspect the referenced phase results and checkpoints with `easyeda_control_artifact_read`.

A resolving recovery call is accepted only when its selected operation is isolated: every other journal must be terminal and free of orphan risk. Another incomplete, orphan-risk, or unreadable journal blocks resolution because the selected recovery may itself activate, read, or reopen the live editor while a foreign delayed call is still possible.

## Recovery sequence

1. Inspect the journal summary. If `orphanedCallPossible` is true, pause at a destructive human gate. Ask the user to terminate EasyEDA Pro, restart it, and reconnect the bridge. If EasyEDA asks about unsaved changes, never select Save because that can persist the unknown call. Selecting Don't Save or force-quitting is allowed only if the journaled clean baseline and no-concurrent-edit assumptions still hold and the user explicitly authorizes discarding every unsaved change. Otherwise cancel the close and preserve the session for manual review. A timeout, reconnect, status call, or MCP restart alone does not prove that the old EasyEDA call cannot complete.
2. Obtain a fresh user message after the authorized restart containing the current `runtimeRestartChallenge` shown by `easyeda_control_recover_incomplete`, and pass that exact value as `runtimeRestartConfirmation`. Its form is `EASYEDA_RESTARTED_AND_RECONNECTED:<operationId>:<phase>:<attempt>:<nonce>`. It is operation-, phase-, attempt-, and nonce-bound and is consumed durably before the orphan gate opens; an interrupted consumption causes a new nonce, and an old value cannot be replayed. Never synthesize it, copy it from an error, infer it from a reconnect, or reuse an earlier value. Before the original dispatch, the facade acquires an HMAC-authenticated lease for the exact fully proxying bridge session, uses that lease for its bound runtime probes and the mutation/lifecycle call, and journals the lease receipt, immutable renderer identity, and OS-level EasyEDA process-tree capture. A replacement session cannot carry that call. Recovery requires the leased session in the same gateway's closed history, a distinct fully proxying replacement session, a different renderer generation and `performance.timeOrigin`, and a hash-bound validator proving under the same capture policy that no process, worker, or main-process authority from the prior captured tree can still complete the call. A facade or gateway restart loses authoritative session history and therefore fails closed. The user attestation, a new JavaScript realm, or a renderer PID change alone cannot open the gate. Production installs no such process-tree validator until connected sacrificial-project validation, so the experimental writer remains disabled. The facade still cannot prove which choice was made in a native prompt.
3. Prove facade, upstream, and bridge health through the restarted application.
4. Reestablish the exact project and document context. Recovery activates an already-open target or opens it by UUID, verifies the resulting project/document/type, and durably rebinds the new tab before classification. An uncertain activation is itself journaled and nonce-gated; do not repeat it blindly.
5. Verify the pre-checkpoint receipt.
6. Read the target and global invariants without mutation.
7. Check whether the requested recovery resolution is legal from the journaled phase. A caller-selected label cannot override the phase.
8. If planning stopped in `baseline-reopen-dispatching`, `baseline-reopen-unknown`, or `baseline-reopened`, verify that the pre-checkpoint still matches the durable source and invalidate the plan. There is no accepted live baseline or design mutation to reconcile.
9. Classify the one target as the complete declared before-state, complete declared after-state, or other. The state machine deliberately forbids multi-component plans, so it never has to classify a legitimate partial target set.
10. If live and durable state both match the exact baseline, `reconciled-no-mutation` may end an ambiguous pre-apply/apply/rollback/save-dispatch state. Without a restart/discard boundary, an intact database plus exact live desired-state proof may allow `reconciled-applied-unsaved` to return to `live-verified`. After the required restart/discard boundary, unsaved state is permanently treated as discarded and that resolution is illegal; prove `reconciled-no-mutation` or stop for manual review. Any `other` target state or collateral invariant change is a hard stop; do not invoke the inverse blindly.
11. `reconciled-saved-reopened` is legal only after the journal reached the save/reopen phase, the pre-checkpoint artifact remains intact, the live project's logical SQLite dump differs from that pre-checkpoint, and typed reopened assertions pass. Recovery creates a candidate final checkpoint before those fresh reads and verifies that candidate against the live database last. A physical file rewrite with the same logical dump is not persistence proof. Saved-state recovery always closes and reopens without saving first; this discards any later unsaved state and therefore requires `confirmDiscardAnyUnsavedState: true` plus user authority.
12. If it is neither, stop for a reviewed rollback or explicit restore procedure.

The facade journals `recovery-reopen-dispatching` before a destructive reopen-only recovery. If that call becomes uncertain, it records `recovery-reopen-unknown`. Do not repeat it implicitly. After inspecting current state and the journal, a new attempt requires `confirmRepeatAfterUnknownRecovery: true` in addition to any discard authorization.

Do not infer current state from a timeout boundary. The extension may have completed the call after the facade stopped waiting.

## Common failure patterns

| Symptom | Likely explanation | Response |
|---|---|---|
| A call returns true but reopen shows no change | Request acceptance, view refresh, invalid binding, or serializer rollback | Inspect durable binding and source. Do not repeat blindly. |
| Import reports completion but a component is unchanged | Device or footprint binding is not a valid project record | Repair the project device, then select one reviewed Modify row. |
| One intended ECO becomes Add plus Remove | `UniqueId` mismatch | Cancel and repair identity. |
| A footprint view refreshes but child geometry stays old | Public refresh did not rebuild the instance | Consider version-pinned `recoverFootprint`, then audit every child. |
| Pin modify returns without a pin change | Wrong adapter argument form | Retry only as a new reviewed operation using the primitive ID form. |
| A keepout exists but raw paths differ | Polygon canonicalization changed winding or closure | Compare geometric equivalence. |
| A drill reads ten times too small | Transformed pin wrapper scaled the field | Read direct pad primitives or durable footprint source. |
| Offline placement passes but live bodies overlap | Offline envelopes omitted real extents | Roll back the whole placement unit and use live bounding boxes. |
| A 3D model looks offset | Transform normalization or perspective | Inspect source bounds and use a top orthographic check. |
| Whole-schematic compile times out | Compiler latency or stalled runtime | Treat pending ECO state as unknown and keep row scope exact. |

## Disconnects and stale bridges

A bridge disconnect during a read invalidates that read. A disconnect during a write makes the result unknown. The facade-supervised upstream exits when its parent or stdio authority disappears, and the process lease binds the supervisor PID plus Linux process-start identity. This prevents a hard-killed facade from silently abandoning its bridge owner, but it does not resolve a design call already dispatched inside EasyEDA. If the journal marks an orphan risk, use the destructive human restart gate above before reconnecting through the single facade-owned child; merely reconnecting can leave the delayed call alive. Do not start a competing server.

## Closing without save

Closing an unsaved document can discard unrelated user edits. Use the discard-capable recovery option only when fresh evidence proves the document was clean before the planned operation, no one added other work, and the user authorized discarding anything still unsaved. The recovery tool is destructive for this reason. Otherwise stop and preserve the live state for manual review.

## When to ask for the user

Pause at a `visible-ui-gate`, an unproven private-version mismatch, an ambiguous ECO, missing restore authority, or a document containing unrelated unsaved work. State the exact evidence and the smallest user action needed. Do not describe ordinary implementation difficulty as a blocker.
