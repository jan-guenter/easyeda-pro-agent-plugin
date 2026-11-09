/** Complete SQL and provider cleanup regressions over an inert Linux helper.
 * Sealed source and closed checkpoint collection are explicit synthetic seams;
 * no connected writer, native source equivalence or saved copy is claimed. */
/* oxlint-disable import/max-dependencies -- Join the managed provider, real complete SQLite readers and separately versioned evidence without replacing their guards. */
import assert from "node:assert/strict";
import { copyFile, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { controlDataDirectory } from "../src/artifacts.ts";
import { sha256Json, sha256Text } from "../src/core.ts";
import { CurrentFootprintForwardExecutionBaselineJournal, currentFootprintForwardExecutionBaselineIntentSchema,
  currentFootprintForwardExecutionBaselineResultSchema } from "../src/current-footprint-forward-execution-baseline.ts";
import { currentFootprintForwardExecutionOpeningRequestSchema } from "../src/current-footprint-forward-execution-opening-contract.ts";
import { readCurrentFootprintForwardExecutionOpeningHistory } from "../src/current-footprint-forward-execution-opening-journal.ts";
import { forwardExecutionOpeningProviderFixture } from "./helpers/forward-execution-opening-provider-fixture.ts";
import { fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";
import type { Inventory } from "../src/closed-sql-equality.ts";

function request(suffix: string): ReturnType<typeof currentFootprintForwardExecutionOpeningRequestSchema.parse> {
  const path = String.raw`C:\Synthetic\validation.eprj2`;
  return currentFootprintForwardExecutionOpeningRequestSchema.parse({ operationId: `footprint-forward-execution-baseline-${suffix}`,
    target: { rawWindowsPath: path, projectUuid: sha256Text(path), documentUuid: "c".repeat(16), expectedSourceSha256: "d".repeat(64) },
    footprintUuid: "e".repeat(16), confirmDisposableProject: true, acceptExistingProfileEffects: true,
    acceptNormalOpenEffects: true, acceptDebuggerPauseEffects: true });
}
async function provider(context: TestContext, suffix: string, sql?: string, capture?: () => Promise<Inventory>): Promise<Readonly<{
  f: Awaited<ReturnType<typeof forwardExecutionOpeningProviderFixture>>; selected: ReturnType<typeof request>; before: Inventory;
}>> {
  const selected = request(suffix), value = await fixture();
  const reopened = join(value.path.slice(0, value.path.lastIndexOf("/")), "baseline-closed.eprj2");
  await copyFile(value.path, reopened); if (sql !== undefined) { mutate(reopened, sql); }
  const after = await inventory(reopened);
  const f = await forwardExecutionOpeningProviderFixture(selected, "launched", { baseline: { before: value.before, after, ...(capture === undefined ? {} : { capture }) },
    launchTarget: { windowsPath: "C:\\Synthetic\\easyeda-pro.exe", sha256: "e".repeat(64) },
    childProgram: `
      const readline=require('node:readline');const input=readline.createInterface({input:process.stdin});process.stdout.write(JSON.stringify(packet)+'\\n');
      input.on('line',line=>{const q=JSON.parse(line);let result;
        if(q.action==='launch')result={helperInstance:packet.helperInstance,jobId:packet.jobId,rootPid:123,rootCreated:'123456789012345'};
        else if(q.action==='normal-close')result={closeDispatched:true,saveOrDiscardSelected:false};
        else if(q.action==='combined-abort')result={terminationDispatched:true};
        else if(q.action==='termination')result={terminated:true,originalRootExited:true,originalJobEmpty:true};
        else if(q.action==='release')result={released:true};else throw Error('Unexpected inert baseline request');
        process.stdout.write(JSON.stringify({id:q.id,ok:true,result})+'\\n');});
    ` });
  context.after(async () => {
    try {
      if (f.provider.hasOwnedAllocation() && f.provider.inspection()["terminationObserved"] === true) { await f.provider.release(); }
    } finally { if (!f.factory.child().stdin.writableEnded) { f.factory.child().stdin.end(); } }
  });
  await f.provider.launch(selected);
  const seal: unknown = Reflect.get(f.provider, "syntheticSealBaselineForTest"); assert.ok(typeof seal === "function");
  await Reflect.apply(seal, f.provider, []);
  return Object.freeze({ f, selected, before: value.before });
}
async function normalClose(f: Awaited<ReturnType<typeof forwardExecutionOpeningProviderFixture>>): Promise<void> {
  await f.provider.close("123"); assert.equal(await f.provider.observeTermination(), true);
}
function sidecar(operationId: string, kind: string): string {
  return join(controlDataDirectory(), "footprint-forward-execution-baselines", operationId, `${kind}.json`);
}
void test("managed v2 baseline requires real close/exit, scans all SQL and leaves opening v2 history untouched", async context => {
  const { f, selected, before } = await provider(context, "complete");
  await assert.rejects(f.provider.proveClosedBaseline(), /CLOSED_BASELINE_UNAVAILABLE/u); assert.equal(f.state.baselineCaptures, 0);
  await f.provider.close("123"); await assert.rejects(f.provider.proveClosedBaseline(), /CLOSED_BASELINE_UNAVAILABLE/u);
  assert.equal(f.state.baselineCaptures, 0); assert.equal(await f.provider.observeTermination(), true);
  const original = await readCurrentFootprintForwardExecutionOpeningHistory(selected.operationId);
  const result = await f.provider.proveClosedBaseline(); assert.equal(f.state.baselineCaptures, 1);
  assert.equal(result.beforeSqlSha256, before.logicalSha256); assert.equal(result.closedSqlSha256, before.logicalSha256);
  assert.equal(result.exactLogicalSqlUnchanged, true); assert.equal(result.originalCompletedReadersRetained, true);
  assert.equal(result.currentHeadVerified, false); assert.equal(result.continuousProducerExclusionVerified, false);
  assert.equal(result.executionReady, false); assert.equal(result.executionAuthorized, false); assert.equal(result.saveAuthorized, false);
  assert.equal(result.savedCopyVerified, false); assert.equal(result.helperReleaseProved, false);
  const intentText = await readFile(sidecar(selected.operationId, "intent"), "utf8"), resultText = await readFile(sidecar(selected.operationId, "result"), "utf8");
  const intent = currentFootprintForwardExecutionBaselineIntentSchema.parse(JSON.parse(intentText));
  const published = currentFootprintForwardExecutionBaselineResultSchema.parse(JSON.parse(resultText));
  assert.deepEqual(published, result); assert.equal(result.baselineIntentSha256, sha256Json(intent));
  assert.deepEqual(await readCurrentFootprintForwardExecutionOpeningHistory(selected.operationId), original);
  await f.provider.requireClosedBaseline(result);
  await assert.rejects(f.provider.requireClosedBaseline(structuredClone(result)), /ORIGINAL_CLOSED_BASELINE_REQUIRED/u);
  await assert.rejects(f.provider.proveClosedBaseline(), /CLOSED_BASELINE_UNAVAILABLE/u); assert.equal(f.state.baselineCaptures, 1);
  await f.provider.release(); await f.provider.requireClosedBaseline(result); assert.equal(await f.provider.observeRelease(), "released");
  assert.equal(f.provider.hasOwnedAllocation(), false); assert.equal(f.provider.hasActiveReservation(), false);
});
for (const [suffix, sql] of [
  ["peer", "UPDATE resources SET dataStr='unexpected peer'"],
  ["head", "UPDATE branches SET history_uuid=NULL WHERE node=0"],
  ["schema", "CREATE TABLE unselected_peer(value TEXT)"],
] as const) {
  void test(`managed v2 baseline refuses complete-SQL ${suffix} drift once and preserves normal release`, async context => {
    const { f, selected } = await provider(context, suffix, sql); await normalClose(f);
    await assert.rejects(f.provider.proveClosedBaseline(), /SQL equality refused/u); assert.equal(f.state.baselineCaptures, 1);
    await assert.rejects(f.provider.proveClosedBaseline(), /CLOSED_BASELINE_UNAVAILABLE/u); assert.equal(f.state.baselineCaptures, 1);
    const failure: unknown = JSON.parse(await readFile(sidecar(selected.operationId, "failure"), "utf8"));
    assert.ok(failure !== null && typeof failure === "object" && "originalErrorRetained" in failure && failure.originalErrorRetained === true);
    await assert.rejects(readFile(sidecar(selected.operationId, "result")), { code: "ENOENT" });
    await f.provider.release(); assert.equal(await f.provider.observeRelease(), "released");
  });
}
void test("a lost original closed-capture result stays consumed and the exact failure is retained", async context => {
  const error = new Error("synthetic original checkpoint collection refused");
  const { f } = await provider(context, "capture-failure", undefined, (): never => { throw error; }); await normalClose(f);
  await assert.rejects(f.provider.proveClosedBaseline(), caught => caught === error); assert.equal(f.state.baselineCaptures, 1);
  await assert.rejects(f.provider.proveClosedBaseline(), /CLOSED_BASELINE_UNAVAILABLE/u);
  // The matching-data argument is irrelevant after this owner's original failure.
  const digest = "a".repeat(64);
  const copied = currentFootprintForwardExecutionBaselineResultSchema.parse({ schema: "easyeda-pro-control.footprint-forward-execution-closed-baseline.v1",
    operationId: request("capture-failure").operationId, sourceInputSha256: digest, openingRecordsSha256: digest, normalCloseResultSha256: digest,
    terminationResultSha256: digest, beforeCheckpointSha256: digest, beforeSqlSha256: digest, baselineIntentSha256: digest,
    closedCheckpointSha256: digest, closedSqlSha256: digest, exactLogicalSqlUnchanged: true, originalCompletedReadersRetained: true,
    originalNormalCloseAcknowledged: true, originalRootExited: true, originalJobEmpty: true, helperReleaseProved: false, savedCopyVerified: false,
    currentHeadVerified: false, continuousProducerExclusionVerified: false, executionReady: false, executionAuthorized: false, saveAuthorized: false });
  await assert.rejects(f.provider.requireClosedBaseline(copied), caught => caught === error);
  await f.provider.release(); assert.equal(await f.provider.observeRelease(), "released");
});
void test("pending baseline capture excludes release and cannot be issued again", async context => {
  const entered = Promise.withResolvers<null>(), held = Promise.withResolvers<Inventory>();
  const { f, before } = await provider(context, "pending", undefined, (): Promise<Inventory> => { entered.resolve(null); return held.promise; });
  await normalClose(f); const pending = f.provider.proveClosedBaseline(); await entered.promise;
  await assert.rejects(f.provider.proveClosedBaseline(), /CLOSED_BASELINE_UNAVAILABLE/u);
  await assert.rejects(f.provider.release(), /RELEASE_UNAVAILABLE/u); assert.equal(f.state.baselineCaptures, 1);
  // A foreign old reader cannot replace this capture's original returned snapshot.
  held.resolve(before); await assert.rejects(pending);
  await f.provider.release(); assert.equal(await f.provider.observeRelease(), "released");
});
void test("baseline publication reserves each record and detects result-file replacement without restoring custody", async () => {
  const digest = "a".repeat(64), selected = request("publisher");
  const intent = currentFootprintForwardExecutionBaselineIntentSchema.parse({ schema: "easyeda-pro-control.footprint-forward-execution-baseline-intent.v1",
    operationId: selected.operationId, sourceInputSha256: digest, openingRecordsSha256: digest, normalCloseResultSha256: digest,
    terminationResultSha256: digest, beforeCheckpointSha256: digest, beforeSqlSha256: digest,
    originalNormalCloseAcknowledged: true, originalRootExited: true, originalJobEmpty: true, executionAuthorized: false, saveAuthorized: false });
  const journal = new CurrentFootprintForwardExecutionBaselineJournal(intent);
  const result = currentFootprintForwardExecutionBaselineResultSchema.parse({ ...intent, schema: "easyeda-pro-control.footprint-forward-execution-closed-baseline.v1",
    baselineIntentSha256: sha256Json(intent), closedCheckpointSha256: digest, closedSqlSha256: digest,
    exactLogicalSqlUnchanged: true, originalCompletedReadersRetained: true, helperReleaseProved: false, savedCopyVerified: false,
    currentHeadVerified: false, continuousProducerExclusionVerified: false, executionReady: false });
  await assert.rejects(journal.publishResult(result), /PUBLICATION_ORDER/u);
  await journal.publishIntent(); await assert.rejects(journal.publishIntent(), /PUBLICATION_CONSUMED/u);
  await assert.rejects(journal.publishResult({ ...result, baselineIntentSha256: "b".repeat(64) }), /RESULT_BINDING/u);
  await journal.publishResult(result); await journal.assertCurrent();
  await writeFile(sidecar(selected.operationId, "result"), "{}\n"); await assert.rejects(journal.assertCurrent());
  await assert.rejects(journal.publishResult(result), /PUBLICATION_CONSUMED/u);
});

void test("baseline keeps the original capture error and a separate failure-publication refusal without retry", async context => {
  const error = new Error("synthetic original snapshot failure"), selected = request("failure-publication");
  const { f } = await provider(context, "failure-publication", undefined, async (): Promise<Inventory> => {
    await writeFile(sidecar(selected.operationId, "failure"), "unrelated existing evidence\n", { flag: "wx", mode: 0o600 });
    throw error;
  });
  await normalClose(f);
  await assert.rejects(f.provider.proveClosedBaseline(), caught => {
    assert.ok(caught instanceof AggregateError); assert.equal(caught.cause, error); assert.equal(caught.errors.length, 2);
    assert.equal(caught.errors[0], error); assert.ok(caught.errors[1] instanceof Error); return true;
  });
  assert.equal(f.state.baselineCaptures, 1);
  await assert.rejects(f.provider.proveClosedBaseline(), /CLOSED_BASELINE_UNAVAILABLE/u);
  assert.equal(await readFile(sidecar(selected.operationId, "failure"), "utf8"), "unrelated existing evidence\n");
  await f.provider.release(); assert.equal(await f.provider.observeRelease(), "released");
});

void test("original abort and actual root/Job exit cannot supply the normal-close baseline", async context => {
  const { f } = await provider(context, "abort");
  await f.provider.abort(true); assert.equal(await f.provider.observeTermination(), true);
  await assert.rejects(f.provider.proveClosedBaseline(), /CLOSED_BASELINE_UNAVAILABLE/u); assert.equal(f.state.baselineCaptures, 0);
  await f.provider.release(); assert.equal(await f.provider.observeRelease(), "released");
});
