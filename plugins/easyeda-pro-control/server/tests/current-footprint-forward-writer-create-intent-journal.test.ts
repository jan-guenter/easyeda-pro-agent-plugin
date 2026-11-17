/** The real isolated managed publisher; these data-only journals supply no
 * app, native owner, successful design effect or replay authority. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentFootprintForwardWriterCreateIntentJournal, assertCurrentFootprintForwardWriterCreateIntentChain, assertNoUnresolvedCurrentFootprintForwardWriterCreateIntents, currentFootprintForwardWriterCreateIntentRecordSchema } from "../src/current-footprint-forward-writer-create-intent-journal.ts";
import type { IntentPlan } from "../src/current-footprint-forward-writer-create-intent-journal.ts";
import { assertNoUnresolvedForwardComponentLaunches } from "../src/current-forward-component-launch-exclusion.ts";
import { loadOperation, updateOperation } from "../src/artifacts.ts";
import { sha256Json } from "../src/core.ts";

const PLAN: IntentPlan = Object.freeze({ operationId: "footprint-create-intent-unit-original", sourceOperationId: "footprint-forward-writer-unit-original", sourceInputSha256: "a".repeat(64), nativeBindingSha256: "b".repeat(64), beforeSqlSha256: "c".repeat(64), copyPlanSha256: "d".repeat(64), mainReservationSha256: "e".repeat(64), nativeAgeRequired: false, headObservationSha256: null, clockWindow: Object.freeze({ minimum: 1_700_000_000_000, maximum: 1_700_000_010_000 }), confirmDisposableCopy: true, acceptUnsupportedInverse: true, destinationAllocated: false });
void test("real intent publisher reserves once, blocks an unfinished operation and settles only the exact fixed chain", async () => {
 const journal = new CurrentFootprintForwardWriterCreateIntentJournal(PLAN); await journal.reserve(); await journal.assertCurrent();
 await assert.rejects(journal.reserve(), /RESERVATION_CONSUMED/u); await assert.rejects(assertNoUnresolvedCurrentFootprintForwardWriterCreateIntents(), /UNRESOLVED_INTENT/u);
 await assert.rejects(assertNoUnresolvedForwardComponentLaunches(), /FORWARD_WRITER_CREATE_INTENT_JOURNAL_UNRESOLVED_INTENT/u);
 await assertNoUnresolvedCurrentFootprintForwardWriterCreateIntents(PLAN.operationId);
 await journal.append("dispatch-intent", { dispatchReservedOnce: true, destinationAllocated: false }); await assert.rejects(journal.append("dispatch-intent", { dispatchReservedOnce: true, destinationAllocated: false }));
 await journal.append("original-exit", { originalGenerationExited: true, executionResultClaimed: false, persistenceVerified: false }); await journal.assertCurrent();
 await assertNoUnresolvedCurrentFootprintForwardWriterCreateIntents(); await assertNoUnresolvedForwardComponentLaunches(); const operation = await loadOperation(PLAN.operationId); assert.equal(operation["state"], "completed");
 assert.equal(journal.retained().records.length, 3); assert.equal(journal.retained().publicationPending, false); await assert.rejects(journal.append("original-exit", { originalGenerationExited: true, executionResultClaimed: false, persistenceVerified: false }));
});
void test("intent chain rejects changed plans, false exit, extra fields and skipped sequence", () => {
 const first = currentFootprintForwardWriterCreateIntentRecordSchema.parse({ schema: "easyeda-pro-control.footprint-forward-writer-create-intent-record.v1", operationId: PLAN.operationId, sequence: 0, previousSha256: null, kind: "create-intent", evidence: { plan: PLAN }, executionAuthorized: false, saveAuthorized: false });
 const last = currentFootprintForwardWriterCreateIntentRecordSchema.parse({ ...first, sequence: 1, previousSha256: sha256Json(first), kind: "original-exit", evidence: { originalGenerationExited: true, executionResultClaimed: false, persistenceVerified: false } });
 assertCurrentFootprintForwardWriterCreateIntentChain([first, last]);
 assert.throws(() => { assertCurrentFootprintForwardWriterCreateIntentChain([{ ...first, evidence: { plan: { ...PLAN, operationId: "footprint-create-intent-different" } } }]); });
 assert.throws(() => { assertCurrentFootprintForwardWriterCreateIntentChain([first, { ...last, evidence: { ...last.evidence, originalGenerationExited: false } }]); });
 assert.throws(() => { assertCurrentFootprintForwardWriterCreateIntentChain([first, { ...last, evidence: { ...last.evidence, saved: true } }]); });
 assert.throws(() => { assertCurrentFootprintForwardWriterCreateIntentChain([first, { ...last, sequence: 2 }]); });
});

void test("fresh journal assertion rejects a later externally changed manifest", async () => {
 const plan = { ...PLAN, operationId: "footprint-create-intent-unit-tamper" }; const journal = new CurrentFootprintForwardWriterCreateIntentJournal(plan); await journal.reserve();
 const original = await loadOperation(plan.operationId); await updateOperation({ ...original, unrelatedMetadata: "changed-after-original-intent" });
 await assert.rejects(journal.assertCurrent(), /ORIGINAL_CHANGED/u);
});
