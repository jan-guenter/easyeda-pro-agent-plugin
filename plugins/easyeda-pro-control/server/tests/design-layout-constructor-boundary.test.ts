import { configureTestControlRoot } from "./test-control-root.ts";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { OPERATION_SCHEMA, buildPlanHash, newOperationId, sha256Json } from "../src/core.ts";
import type { EasyedaControlEngine } from "../src/engine.ts";

void test("topology refusal precedes even constructor-witness resolution and every commit Save or navigation", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "easyeda-constructor-boundary-"));
  const previous = process.env["EASYEDA_CONTROL_DATA_DIR"];
  configureTestControlRoot(directory);
  const artifacts = await import("../src/artifacts.ts");
  const { DesignExecutor } = await import("../src/design-execution.ts");
  t.after(async () => {
    const rootCapability = await artifacts.controlRootCapability();
    await rootCapability.close();
    if (previous === undefined) { configureTestControlRoot(); }
    else { configureTestControlRoot(previous); }
    await rm(directory, { recursive: true, force: true });
  });
  const context = { project: { uuid: "11".repeat(32), path: join(directory, "fixture.eprj2") },
    document: { uuid: "page", documentType: 1, tabId: "page@project" } };
  const plan = { profile: "easyeda-pro-control.typed-design-transaction.v1", expectedContext: context, expectedFingerprint: {},
    operation: { id: "layout", action: "sch.layout.batch", documentType: 1,
      operations: [{ id: "caption", action: "sch.attribute.display", target: { primitiveId: "caption" }, patch: { x: 10 } }] } };
  const source = { schema: "easyeda-pro-control.document-source.v1", document: { uuid: "page", docType: "SCH_PAGE" }, objects: [] };
  const snapshot = { ...source, sha256: sha256Json(source) };
  const operationId = newOperationId();
  await artifacts.createOperation({ schema: OPERATION_SCHEMA, operationId, journalPath: artifacts.operationPath(operationId),
    plan, planHash: buildPlanHash(plan), state: "applied-unsaved", mutationState: "after", saved: false, reopened: false,
    orphanedCallPossible: false, hardStop: false, mutationMayHaveOccurred: true, nextSafeAction: "Commit after proof.",
    context, before: snapshot, after: snapshot, preCheckpoint: {}, sequence: 0, artifacts: [] });
  const calls: string[] = [];
  // The current topology refusal takes priority even over constructor proof.
  // Dedicated resolver fixtures retain constructor validation coverage; no
  // Runtime, witness resolution, snapshot or Save may run through this entry.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Test-only inert engine; every reachable engine boundary below is mocked to refuse.
  const executor = new DesignExecutor({} as EasyedaControlEngine);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Test-only access to private coordinator seams, without exposing them in production.
  const instance = executor as unknown as { assertRuntime: () => Promise<void>; snapshot: () => Promise<never>; call: () => Promise<never> };
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Test-only access to the private resolver seam to prove dispatch ordering.
  const constructor = DesignExecutor as unknown as { layoutConstructorWitness: () => Promise<never> };
  t.mock.method(instance, "assertRuntime", (): Promise<void> => { calls.push("runtime"); return Promise.resolve(); });
  t.mock.method(constructor, "layoutConstructorWitness", (): Promise<never> => {
    calls.push("constructor-witness"); return Promise.reject(new Error("Missing verified constructor lineage."));
  });
  t.mock.method(instance, "snapshot", (): Promise<never> => { calls.push("commit-snapshot"); return Promise.reject(new Error("Unexpected commit snapshot.")); });
  t.mock.method(instance, "call", (): Promise<never> => { calls.push("save-or-navigation"); return Promise.reject(new Error("Unexpected dispatch.")); });
  await assert.rejects(executor.commit(operationId), /can annotate Designator\/Unique ID and invoke Save All/u);
  assert.deepEqual(calls, []);
  const retained = await artifacts.loadOperation(operationId);
  assert.equal(retained["state"], "applied-unsaved");
  assert.equal(retained["saved"], false);
  assert.equal(retained["reopened"], false);
  assert.deepEqual(retained.artifacts, []);
});
