/** Real private managed publication and dispatch state. Original generated
 * plan issuance is an explicit test seam; no native owner or CAD call exists. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { assertOperationIdUnused, createOperation, createOperationScanner, ensureOperationStorage, loadOperation, operationPath,
  updateOperation, verifyExactManagedArtifact, writePhaseArtifact } from "../src/artifacts.ts";
import type { CurrentPcbViaWriteDispatch, CurrentPcbViaWriteJournal } from "../src/current-pcb-via-write-journal.ts";
import { CURRENT_PCB_VIA_WRITE_ABORT_ACKNOWLEDGEMENTS, CURRENT_PCB_VIA_WRITE_EXECUTE_ACKNOWLEDGEMENTS,
  currentPcbViaWriteActionSchema, currentPcbViaWriteResultSchema } from "../src/current-pcb-via-write-contract.ts";

async function fixture(loseCreateIntent = false): Promise<Readonly<{
  journal: CurrentPcbViaWriteJournal; owner: object; operationId: string; publications: () => number;
  consume: (token: CurrentPcbViaWriteDispatch, stage: "create" | "save", owner: object) => Readonly<{ assertPublished: () => Promise<void> }>;
}>> {
  const operationId = `pcb209-via-write-journal-${randomUUID()}`, owner = Object.freeze({});
  const plan = Object.freeze({ operationId, schema: "explicit-synthetic-plan-seam", inverseAvailable: false });
  const url = new URL("../src/current-pcb-via-write-journal.ts", import.meta.url);
  const sourceRequire = createRequire(url);
  const output = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  let lost = false, publications = 0;
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-pcb-via-write-plan.ts") { return { requireOriginalCurrentPcbViaWritePlan: (candidate: unknown): void => { assert.equal(candidate, plan); } }; }
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
  const Constructor = loaded.exports["CurrentPcbViaWriteJournal"], consume = loaded.exports["consumeCurrentPcbViaWriteDispatch"];
  assert.ok(typeof Constructor === "function" && typeof consume === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The real class is VM-loaded with the one explicit original-plan seam and actual private artifact publisher.
  const journal = Reflect.construct(Constructor, [plan]) as CurrentPcbViaWriteJournal;
  await journal.reserve(); journal.bindWriter(owner);
  for (const stage of ["baseline", "allocation", "launch", "main", "opening", "sdk", "preflight", "native-before", "scene-before"] as const) {
    await journal.append(`${stage}-intent`, {}); await journal.append(`${stage}-result`, {});
  }
  return { journal, owner, operationId, publications: (): number => publications,
    consume: (token, stage, actor): Readonly<{ assertPublished: () => Promise<void> }> => {
      const result: unknown = Reflect.apply(consume, undefined, [token, stage, actor, plan]);
      assert.ok(typeof result === "object" && result !== null && "assertPublished" in result && typeof result.assertPublished === "function");
      const assertPublished = result.assertPublished;
      return { assertPublished: async (): Promise<void> => { await Reflect.apply(assertPublished, result, []); } };
    } };
}

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
