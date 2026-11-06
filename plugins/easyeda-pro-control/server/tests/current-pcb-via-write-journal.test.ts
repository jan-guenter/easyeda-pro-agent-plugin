/** Real private managed publication and dispatch state. Original generated
 * plan issuance is an explicit test seam; no native owner or CAD call exists. */
/* oxlint-disable import/max-dependencies -- The original publisher, both journal versions, factory refusal token and shared public contract stay in one focused lifecycle test. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { sha256Json } from "../src/core.ts";
import { assertCurrentPcbViaWriteJournalChain } from "../src/current-pcb-via-write-journal.ts";
import type { CurrentPcbViaWriteNoResourceProof } from "../src/current-pcb-via-write-owner.ts";
import { assertOperationIdUnused, createOperation, createOperationScanner, ensureOperationStorage, loadOperation, operationPath,
  updateOperation, verifyExactManagedArtifact, writePhaseArtifact } from "../src/artifacts.ts";
import type { CurrentPcbViaCreateIntentEnrollment, CurrentPcbViaPollingCancellationEnrollment, CurrentPcbViaPollingCancellationIntent, CurrentPcbViaSaveIntentEnrollment, CurrentPcbViaWriteDispatch, CurrentPcbViaWriteJournal } from "../src/current-pcb-via-write-journal.ts";
import { CURRENT_PCB_VIA_WRITE_ABORT_ACKNOWLEDGEMENTS, CURRENT_PCB_VIA_WRITE_EXECUTE_ACKNOWLEDGEMENTS,
  currentPcbViaWriteActionSchema, currentPcbViaWriteResultSchema } from "../src/current-pcb-via-write-contract.ts";

async function fixture(loseCreateIntent = false, allocationRefusal = false, polling = false): Promise<Readonly<{
  noResource: CurrentPcbViaWriteNoResourceProof;
  enrollPolling: (token: CurrentPcbViaPollingCancellationIntent, owner: object) => CurrentPcbViaPollingCancellationEnrollment;
  consumePolling: (token: CurrentPcbViaPollingCancellationIntent, owner: object) => Readonly<{ assertPublished: () => Promise<void> }>;
  enrollSave: (token: CurrentPcbViaWriteDispatch, owner: object) => CurrentPcbViaSaveIntentEnrollment;
  enroll: (token: CurrentPcbViaWriteDispatch, owner: object) => CurrentPcbViaCreateIntentEnrollment; journal: CurrentPcbViaWriteJournal; owner: object; operationId: string; publications: () => number;
  consume: (token: CurrentPcbViaWriteDispatch, stage: "create" | "save", owner: object) => Readonly<{ assertPublished: () => Promise<void> }>;
}>> {
  const operationId = `pcb209-via-write-journal-${randomUUID()}`, owner = Object.freeze({});
  const plan = Object.freeze({ operationId, schema: "explicit-synthetic-plan-seam", inverseAvailable: false });
  const noResource: CurrentPcbViaWriteNoResourceProof = Object.freeze({ profile: "private.current-pcb-via-write-no-resource.v1" });
  const url = new URL("../src/current-pcb-via-write-journal.ts", import.meta.url);
  const sourceRequire = createRequire(url);
  const originalSource = await readFile(url, "utf8");
  // The literal lazy import resolves through this VM's explicit registry seam.
  // Production retains its real ESM module and original private allocation map.
  const source = originalSource.replace('await import("./current-pcb-via-write-owner.ts")', 'await Promise.resolve(require("./current-pcb-via-write-owner.ts"))');
  assert.notEqual(source, originalSource);
  const output = await transform(source, { loader: "ts", format: "cjs", target: "node24" });
  let lost = false, publications = 0;
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-pcb-via-write-plan.ts") { return { requireOriginalCurrentPcbViaWritePlan: (candidate: unknown): void => { assert.equal(candidate, plan); } }; }
    if (name === "./current-pcb-via-write-owner.ts") { return { requireOriginalCurrentPcbViaWriteNoResourceProof: (candidate: unknown, originalPlan: unknown): void => {
      assert.equal(allocationRefusal, true); assert.equal(candidate, noResource); assert.equal(originalPlan, plan);
    } }; }
    if (name === "./artifacts.ts") { return { assertOperationIdUnused, createOperation, createOperationScanner, ensureOperationStorage, loadOperation, operationPath,
      updateOperation: async (operation: Parameters<typeof updateOperation>[0]): Promise<void> => {
      const rows = operation["records"]; assert.ok(Array.isArray(rows)); const last: unknown = rows.at(-1);
      assert.ok(typeof last === "object" && last !== null && "kind" in last);
      if (last?.kind === "create-intent") { publications += 1; }
      await updateOperation(operation);
      if (loseCreateIntent && !lost && last?.kind === "create-intent") { lost = true; throw new Error("Synthetic publication acknowledgement lost"); }
    }, verifyExactManagedArtifact, writePhaseArtifact }; }
    return sourceRequire(name) as unknown;
  }, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentPcbViaWriteJournal"], consume = loaded.exports["consumeCurrentPcbViaWriteDispatch"]; const enroll = loaded.exports["enrollCurrentPcbViaWriteCreateIntent"], enrollSave = loaded.exports["enrollCurrentPcbViaWriteSaveIntent"];
  const consumePolling = loaded.exports["consumeCurrentPcbViaPollingCancellationIntent"], enrollPolling = loaded.exports["enrollCurrentPcbViaPollingCancellationIntent"];
  assert.ok(typeof Constructor === "function" && typeof consume === "function" && typeof enroll === "function" && typeof enrollSave === "function");
  assert.ok(typeof consumePolling === "function" && typeof enrollPolling === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The real class is VM-loaded with the one explicit original-plan seam and actual private artifact publisher.
  const journal = Reflect.construct(Constructor, [plan]) as CurrentPcbViaWriteJournal;
  await journal.reserve(); journal.bindWriter(owner);
  const stages = allocationRefusal ? ["baseline"] as const : ["baseline", "allocation", "launch", "main", "opening", "sdk", "preflight", "native-before", "scene-before"] as const;
  for (const stage of stages) {
    if (polling && stage === "opening") { break; }
    await journal.append(`${stage}-intent`, {}); await journal.append(`${stage}-result`, {});
  }
  if (allocationRefusal) { await journal.append("allocation-intent", {}); await journal.append("failure", { stage: "allocation" }); }
  return { journal, noResource, owner, operationId,
    enrollPolling: (token, actor): CurrentPcbViaPollingCancellationEnrollment => {
      const result: unknown = Reflect.apply(enrollPolling, undefined, [token, actor, plan]); assert.ok(result !== null && typeof result === "object");
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This is the VM's real private token registry with only the explicit original-plan seam.
      return result as CurrentPcbViaPollingCancellationEnrollment;
    }, consumePolling: (token, actor): Readonly<{ assertPublished: () => Promise<void> }> => {
      const result: unknown = Reflect.apply(consumePolling, undefined, [token, actor, plan]);
      assert.ok(result !== null && typeof result === "object" && "assertPublished" in result && typeof result.assertPublished === "function");
      const original = result.assertPublished; return { assertPublished: async (): Promise<void> => { await Reflect.apply(original, result, []); } };
    }, enrollSave: (token, actor): CurrentPcbViaSaveIntentEnrollment => {
      const result: unknown = Reflect.apply(enrollSave, undefined, [token, actor, plan]); assert.ok(result !== null && typeof result === "object");
      for (const key of ["assertCurrent", "assertBeforeAttempt", "assertOriginalAttempted", "assertPublished"]) { assert.equal(typeof Reflect.get(result,key), "function"); }
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The real private Save registry is loaded with only the explicit original-plan seam.
      return result as CurrentPcbViaSaveIntentEnrollment;
    }, enroll: (token, actor): CurrentPcbViaCreateIntentEnrollment => {
      const result: unknown = Reflect.apply(enroll, undefined, [token, actor, plan]); assert.ok(result !== null && typeof result === "object");
      for (const key of ["assertCurrent", "assertBeforeAttempt", "assertOriginalAttempted", "assertPublished"]) { assert.equal(typeof Reflect.get(result,key), "function"); }
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Only the actual checked VM export with private original dispatch registry returns this object.
      return result as CurrentPcbViaCreateIntentEnrollment;
    }, publications: (): number => publications,
    consume: (token, stage, actor): Readonly<{ assertPublished: () => Promise<void> }> => {
      const result: unknown = Reflect.apply(consume, undefined, [token, stage, actor, plan]);
      assert.ok(typeof result === "object" && result !== null && "assertPublished" in result && typeof result.assertPublished === "function");
      const assertPublished = result.assertPublished;
      return { assertPublished: async (): Promise<void> => { await Reflect.apply(assertPublished, result, []); } };
    } };
}

void test("the separate opening timer intent arms without spending and authorizes one original cancellation only", async () => {
  const f = await fixture(false, false, true); const token = await f.journal.appendPollingCancellationIntent(f.owner);
  assert.throws(() => f.consumePolling(token, f.owner), /ORIGINAL_POLLING_DISPATCH/u);
  assert.throws(() => f.enrollPolling({ ...token }, f.owner), /ORIGINAL_POLLING_ENROLLMENT/u);
  assert.throws(() => f.enrollPolling(token, {}), /ORIGINAL_POLLING_ENROLLMENT/u);
  const enrolled = f.enrollPolling(token, f.owner); enrolled.assertBeforeAttempt(); await enrolled.assertPublished();
  assert.throws(enrolled.assertOriginalAttempted, /POLLING_ORIGINAL_ATTEMPT_REQUIRED/u);
  assert.throws(() => f.enrollPolling(token, f.owner), /ORIGINAL_POLLING_ENROLLMENT/u);
  const intent = f.consumePolling(token, f.owner); await intent.assertPublished(); enrolled.assertOriginalAttempted();
  assert.throws(() => f.consumePolling(token, f.owner), /ORIGINAL_POLLING_DISPATCH/u); assert.throws(() => f.journal.retainedPollingCancellationIntent(), /ORIGINAL_POLLING_DISPATCH/u);
  await f.journal.append("opening-result", {}); enrolled.assertCurrent(); enrolled.assertOriginalAttempted();
  assert.throws(enrolled.assertBeforeAttempt, /POLLING_BEFORE_ATTEMPT/u);
  const opening = f.journal.retained().records.find(row => row.kind === "opening-intent"); assert.equal(opening?.evidence["arbitraryTimerSelection"], false);
});

void test("v2 closes an original never-allocated factory refusal without claiming process exit", async () => {
  const f = await fixture(false, true);
  await assert.rejects(f.journal.append("allocation-refused", {}), /ORIGINAL_NO_RESOURCE_PROOF_REQUIRED/u);
  await f.journal.recordAllocationRefusal(f.noResource); await f.journal.assertCurrent();
  const operation = await loadOperation(f.operationId); assert.equal(operation["state"], "completed");
  const terminal = f.journal.retained().records.at(-1); assert.ok(terminal !== undefined);
  assert.equal(terminal.schema, "easyeda-pro-control.pcb209-via-write-record.v2"); assert.equal(terminal.kind, "allocation-refused");
  assert.equal(terminal.evidence["nativeAllocationNeverEntered"], true); assert.equal(terminal.evidence["originalProcessExitClaimed"], false);
  await assert.rejects(f.journal.recordAllocationRefusal(f.noResource), /CONSUMED/u);
});
void test("copied never-allocated metadata cannot terminalize a journal or refund its original attempt", async () => {
  const f = await fixture(false, true); await assert.rejects(f.journal.recordAllocationRefusal({ ...f.noResource }));
  const operation = await loadOperation(f.operationId); assert.equal(operation["state"], "prepared"); assert.equal(f.journal.retained().records.at(-1)?.kind, "failure");
  await assert.rejects(f.journal.recordAllocationRefusal(f.noResource), /CONSUMED/u);
});
void test("immutable v1 refusal chains still parse and cannot acquire the v2 factory terminal", () => {
  const first = { schema: "easyeda-pro-control.pcb209-via-write-record.v1", operationId: "pcb209-via-write-legacy-chain", sequence: 0,
    previousSha256: null, kind: "operation-intent", evidence: {}, inverseAvailable: false } as const;
  const failure = { ...first, sequence: 1, previousSha256: sha256Json(first), kind: "failure" } as const;
  const terminal = { ...first, sequence: 2, previousSha256: sha256Json(failure), kind: "no-allocation", evidence: { allocationNeverEntered: true } } as const;
  assertCurrentPcbViaWriteJournalChain([first, failure, terminal]);
  assert.throws(() => { assertCurrentPcbViaWriteJournalChain([first, failure, { ...terminal, kind: "allocation-refused" }]); });
  assert.throws(() => { assertCurrentPcbViaWriteJournalChain([first, { ...failure, schema: "easyeda-pro-control.pcb209-via-write-record.v2" }]); });
});

void test("a lost intent publication keeps its original marker and settlement cannot repeat a native attempt", async () => {
  const f = await fixture(true);
  await assert.rejects(f.journal.appendIntent("create", {}, f.owner), /acknowledgement lost/u);
  assert.equal(f.journal.retained().publicationPending, true);
  assert.throws(() => f.journal.retainedDispatchIntent("create"), /PUBLICATION_PENDING/u);
  await f.journal.settlePublication(); const token = f.journal.retainedDispatchIntent("create");
  assert.throws(() => f.consume({ ...token }, "create", f.owner), /ORIGINAL_DISPATCH/u);
  assert.throws(() => f.consume(token, "create", {}), /ORIGINAL_DISPATCH/u);
  const intent = f.consume(token, "create", f.owner); await intent.assertPublished();
  assert.throws(() => f.consume(token, "create", f.owner), /ORIGINAL_DISPATCH/u);
  await f.journal.settlePublication(); assert.equal(f.publications(), 1);
  await assert.rejects(f.journal.appendIntent("create", {}, f.owner));
});
void test("artifact drift consumes no CAD call and cannot refund its original dispatch slot", async () => {
  const f = await fixture(); const token = await f.journal.appendIntent("create", {}, f.owner);
  const operation = await loadOperation(f.operationId); const descriptor = operation.artifacts?.at(-1); assert.ok(descriptor !== undefined);
  await writeFile(descriptor.path, "tampered original intent\n");
  const intent = f.consume(token, "create", f.owner); await assert.rejects(intent.assertPublished());
  assert.throws(() => f.consume(token, "create", f.owner), /ORIGINAL_DISPATCH/u);
  await assert.rejects(f.journal.assertCurrent()); assert.equal(f.publications(), 1);
});
void test("cleanup actions contain only the original operation identifier", () => {
  const operationId = "pcb209-via-write-synthetic";
  for (const action of ["inspect", "abort", "observe-termination", "release", "settle-publication"] as const) {
    const acknowledgement = action === "abort" ? CURRENT_PCB_VIA_WRITE_ABORT_ACKNOWLEDGEMENTS : {};
    assert.equal(currentPcbViaWriteActionSchema.safeParse({ action, operationId, ...acknowledgement }).success, true);
    assert.equal(currentPcbViaWriteActionSchema.safeParse({ action, operationId, code: "arbitrary" }).success, false);
    assert.equal(currentPcbViaWriteActionSchema.safeParse({ action, operationId, path: "C:\\Foreign.eprj2" }).success, false);
  }
  assert.equal(currentPcbViaWriteActionSchema.safeParse({ action: "abort", operationId }).success, false);
  assert.equal(currentPcbViaWriteActionSchema.safeParse({ action: "execute", operationId }).success, false);
  assert.equal(currentPcbViaWriteActionSchema.safeParse({ action: "execute", operationId, ...CURRENT_PCB_VIA_WRITE_EXECUTE_ACKNOWLEDGEMENTS }).success, true);
  assert.equal(currentPcbViaWriteActionSchema.safeParse({ action: "execute", operationId, ...CURRENT_PCB_VIA_WRITE_EXECUTE_ACKNOWLEDGEMENTS, confirmOneSave: false }).success, false);
});

void test("public cleanup retains unknown Save outcomes and cannot report completion from SDK acknowledgement alone", () => {
  const result = { schema: "easyeda-pro-control.pcb209-via-write-operation.v1", action: "inspect", operationId: "pcb209-via-write-status-test", state: "needs-cleanup",
    effects: { createAttempted: true, createAcknowledged: true, saveAttempted: true, saveOutcome: "unknown" },
    verification: { saved: false, reopened: false, completeSqlVerified: false, peerRosterPreserved: false },
    cleanup: { generation: "writer", allocation: "retained", nativeResourcesRetained: true, abortAttempted: false, originalTerminationVerified: false,
      helperReleaseVerified: false, publicationPending: false }, forwardOnly: true, inverseAvailable: false };
  assert.equal(currentPcbViaWriteResultSchema.safeParse(result).success, true);
  assert.equal(currentPcbViaWriteResultSchema.safeParse({ ...result, state: "completed", effects: { ...result.effects, saveOutcome: "acknowledged" } }).success, false);
  assert.equal(currentPcbViaWriteResultSchema.safeParse({ ...result, cleanup: { ...result.cleanup, helperReleaseVerified: true } }).success, false);
  assert.equal(currentPcbViaWriteResultSchema.safeParse({ ...result, effects: { ...result.effects, saveOutcome: "not-attempted" } }).success, false);
  assert.equal(currentPcbViaWriteResultSchema.safeParse({ ...result, verification: { ...result.verification, saved: true } }).success, false);
  const independentlyVerified = { ...result, state: "completed", verification: { saved: true, reopened: true, completeSqlVerified: true, peerRosterPreserved: true },
    cleanup: { ...result.cleanup, allocation: "released", nativeResourcesRetained: false, originalTerminationVerified: true, helperReleaseVerified: true } };
  const parsed = currentPcbViaWriteResultSchema.parse(independentlyVerified); assert.equal(parsed.effects.saveOutcome, "unknown");
  assert.equal(currentPcbViaWriteResultSchema.safeParse({ ...independentlyVerified, cleanup: { ...independentlyVerified.cleanup, originalTerminationVerified: false } }).success, false);
});

void test("prospective create enrollment retains the published original intent across one actual dispatch without spending it", async () => {
  const f = await fixture(); const token = await f.journal.appendIntent("create", {}, f.owner);
  assert.throws(() => f.enroll({...token},f.owner),/ORIGINAL_CREATE_ENROLLMENT/u); assert.throws(() => f.enroll(token,{}),/ORIGINAL_CREATE_ENROLLMENT/u);
  const enrollment = f.enroll(token,f.owner); enrollment.assertBeforeAttempt(); await enrollment.assertPublished();
  assert.throws(() => { enrollment.assertOriginalAttempted(); },/ATTEMPT_REQUIRED/u); assert.throws(() => f.enroll(token,f.owner),/ORIGINAL_CREATE_ENROLLMENT/u);
  assert.equal(f.journal.retainedDispatchIntent("create"),token); const dispatch=f.consume(token,"create",f.owner);await dispatch.assertPublished();
  enrollment.assertOriginalAttempted();assert.throws(() => { enrollment.assertBeforeAttempt(); },/BEFORE_ATTEMPT/u);assert.throws(() => f.consume(token,"create",f.owner),/ORIGINAL_DISPATCH/u);
  await f.journal.append("create-result",{schema:"easyeda-pro-control.pcb209-via-write-stage.v1",stage:"create",ok:true,dispatchAttempted:true,originalPromiseAcknowledged:true,primitiveId:"explicit-synthetic-id",createAttempted:true,createAcknowledged:true,saveAttempted:false,saveAcknowledged:false,inverseAvailable:false,persistenceVerified:false});enrollment.assertCurrent();await enrollment.assertPublished();assert.throws(() => f.journal.retainedDispatchIntent("create"),/ORIGINAL_DISPATCH/u);
});
void test("prospective enrollment cannot claim an unpublished or altered original intent", async () => {
  const f=await fixture(true);await assert.rejects(f.journal.appendIntent("create",{},f.owner));await f.journal.settlePublication();const token=f.journal.retainedDispatchIntent("create");
  const enrollment=f.enroll(token,f.owner);const op=await loadOperation(f.operationId);const artifact=op.artifacts?.at(-1);assert.ok(artifact!==undefined);await writeFile(artifact.path,"altered original intent\n");
  await assert.rejects(enrollment.assertPublished());assert.equal(f.journal.retainedDispatchIntent("create"),token);assert.throws(() => f.enroll(token,f.owner),/ORIGINAL_CREATE_ENROLLMENT/u);
});

void test("the separate Save enrollment retains only its own published original marker through one actual attempt", async () => {
  const f = await fixture(); const create = await f.journal.appendIntent("create", {}, f.owner);
  assert.throws(() => f.enrollSave(create, f.owner), /ORIGINAL_SAVE_ENROLLMENT/u); f.consume(create, "create", f.owner);
  await f.journal.append("create-result", {schema:"easyeda-pro-control.pcb209-via-write-stage.v1",stage:"create",ok:true,dispatchAttempted:true,originalPromiseAcknowledged:true,primitiveId:"explicit-synthetic-id",createAttempted:true,createAcknowledged:true,saveAttempted:false,saveAcknowledged:false,inverseAvailable:false,persistenceVerified:false});
  for (const stage of ["native-after", "scene-after", "effect"] as const) { await f.journal.append(`${stage}-intent`, {}); await f.journal.append(`${stage}-result`, {}); }
  const token = await f.journal.appendIntent("save", {}, f.owner);
  assert.throws(() => f.enrollSave({...token}, f.owner), /ORIGINAL_SAVE_ENROLLMENT/u); assert.throws(() => f.enrollSave(token, {}), /ORIGINAL_SAVE_ENROLLMENT/u);
  const enrollment = f.enrollSave(token, f.owner); enrollment.assertBeforeAttempt(); await enrollment.assertPublished();
  assert.equal(f.journal.retainedDispatchIntent("save"), token); assert.throws(() => { enrollment.assertOriginalAttempted(); }, /ATTEMPT_REQUIRED/u);
  assert.throws(() => f.enroll(token, f.owner), /ORIGINAL_CREATE_ENROLLMENT/u); assert.throws(() => f.enrollSave(token, f.owner), /ORIGINAL_SAVE_ENROLLMENT/u);
  const dispatch = f.consume(token, "save", f.owner); await dispatch.assertPublished(); enrollment.assertOriginalAttempted();
  assert.throws(() => { enrollment.assertBeforeAttempt(); }, /BEFORE_ATTEMPT/u); assert.throws(() => f.consume(token, "save", f.owner), /ORIGINAL_DISPATCH/u);
  await f.journal.append("failure", {originalSaveOutcome:"unknown"}); enrollment.assertCurrent(); await enrollment.assertPublished();
  assert.throws(() => f.journal.retainedDispatchIntent("save"), /ORIGINAL_DISPATCH/u); assert.throws(() => f.enrollSave(token, f.owner), /ORIGINAL_SAVE_ENROLLMENT/u);
});
