import assert from "node:assert/strict";
import { link, lstat, mkdtemp, readFile, rename, rm, symlink, unlink, utimes, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { after, afterEach, before, mock, test } from "node:test";
import { OPERATION_SCHEMA, buildPlanHash, operationSummary } from "../src/core.ts";
import type { UnknownRecord } from "../src/core.ts";
import type { EasyedaControlEngine } from "../src/engine.ts";
import type { controlRootCapability, createOperation, loadOperation, operationPath, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import { runNativeUiWithOperationAdmission } from "../src/native-ui-admission.ts";

let previousRoot: string | undefined, root = "", sequence = 0;
let artifacts: { controlRootCapability: typeof controlRootCapability; createOperation: typeof createOperation;
  loadOperation: typeof loadOperation; operationPath: typeof operationPath; updateOperation: typeof updateOperation; writePhaseArtifact: typeof writePhaseArtifact };
let engines: { EasyedaControlEngine: typeof EasyedaControlEngine };

before(async () => {
  root = await mkdtemp("/tmp/easyeda-engine-journal-admission-");
  previousRoot = process.env["EASYEDA_CONTROL_DATA_DIR"];
  process.env["EASYEDA_CONTROL_DATA_DIR"] = root;
  [artifacts, engines] = await Promise.all([import("../src/artifacts.ts"), import("../src/engine.ts")]);
});
afterEach(async () => {
  mock.restoreAll();
  await rm(join(root, "operations"), { recursive: true, force: true });
});
after(async () => {
  const capability = await artifacts.controlRootCapability();
  await capability.close();
  if (previousRoot === undefined) { delete process.env["EASYEDA_CONTROL_DATA_DIR"]; }
  else { process.env["EASYEDA_CONTROL_DATA_DIR"] = previousRoot; }
  await rm(root, { recursive: true, force: true });
});

async function fixture(overrides: UnknownRecord = {}): Promise<{ engine: EasyedaControlEngine; id: string; journal: UnknownRecord }> {
  sequence += 1;
  const id = `easyeda-admission-${String(sequence)}`;
  const plan = { id, synthetic: "Not a live project or operation." };
  const journal = { schema: OPERATION_SCHEMA, operationId: id, plan, planHash: buildPlanHash(plan),
    state: "completed", artifacts: [], ...overrides };
  await artifacts.createOperation(journal);
  const engine = new engines.EasyedaControlEngine({ callTool: (): Promise<never> => Promise.reject(new Error("No live call is allowed.")) });
  await engine.controlFingerprintPromise;
  return { engine, id, journal };
}

void test("bridge, recovery and reporting share identical-byte projections without reparsing full journals", async () => {
  const { engine, id } = await fixture({ payload: "synthetic ".repeat(8192) });
  const parse = JSON.parse;
  let journalParses = 0;
  mock.method(JSON, "parse", (...args: Parameters<typeof JSON.parse>): unknown => {
    if (args[0].includes(`"operationId": "${id}"`)) { journalParses += 1; }
    const result: unknown = Reflect.apply(parse, JSON, args); return result;
  });
  assert.equal(await engine.assertBridgeDispatchAllowed(), true);
  assert.equal(journalParses, 1);
  assert.deepEqual(await engine.recover(), []);
  assert.equal(await engine.assertRecoveryOperationIsolated("other"), true);
  assert.equal(await engine.assertNativeUiEditingAllowed(), true);
  assert.equal(await engine.assertBridgeDispatchAllowed(), true);
  assert.equal(journalParses, 1);
});

void test("shared admission preserves terminal, explicit orphan and legacy orphan predicates", async () => {
  for (const state of ["completed", "rolled-back", "reconciled-no-mutation", "plan-invalidated", "library-needs-review", "unknown"]) {
    for (const orphanedCallPossible of [false, true, undefined]) {
      const terminal = ["completed", "rolled-back", "reconciled-no-mutation", "plan-invalidated"].includes(state);
      const orphan = orphanedCallPossible ?? state === "unknown";
      const { engine, id } = await fixture({ state, ...(orphanedCallPossible === undefined ? {} : { orphanedCallPossible }) });
      if (orphan) { await assert.rejects(engine.assertBridgeDispatchAllowed(), /dispatch is quarantined/u); }
      else { assert.equal(await engine.assertBridgeDispatchAllowed(), true); }
      const reports = await engine.recover();
      assert.equal(reports.length, terminal ? 0 : 1);
      if (!terminal) { assert.equal(reports[0]?.operationId, id); }
      if (orphan || !terminal) {
        await assert.rejects(engine.assertRecoveryOperationIsolated("other"), /not isolated/u);
        await assert.rejects(engine.assertNativeUiEditingAllowed(), /before native UI edits/u);
      } else {
        assert.equal(await engine.assertRecoveryOperationIsolated("other"), true);
        assert.equal(await engine.assertNativeUiEditingAllowed(), true);
      }
      assert.equal(await engine.assertRecoveryOperationIsolated(id), true);
      await rm(join(root, "operations"), { recursive: true, force: true });
    }
  }
});

void test("cross-guard cached summaries keep original output and independent returned clones", async () => {
  const { engine, id } = await fixture({ state: "library-needs-review", orphanedCallPossible: false,
    mutationState: "unknown", saved: false, reopened: false, hardStop: true, mutationMayHaveOccurred: true,
    nextSafeAction: "Inspect without replay.", journalPath: "/synthetic/journal.json", updatedAt: "2026-10-10T00:00:00Z",
    lastError: { name: "FixtureError", message: "retained failure" } });
  const expected = operationSummary(await artifacts.loadOperation(id));
  assert.equal(await engine.assertBridgeDispatchAllowed(), true);
  const first = await engine.recover();
  assert.deepEqual(first, [expected]);
  assert.ok(first[0] !== undefined); first[0].nextSafeAction = "caller alteration";
  await assert.rejects(engine.assertRecoveryOperationIsolated("other"), (error: unknown) => {
    assert.ok(error instanceof Error && "blockingOperations" in error);
    assert.deepEqual(error.blockingOperations, [expected]); return true;
  });
  assert.deepEqual(await engine.recover(), [expected]);
  await assert.rejects(engine.assertNativeUiEditingAllowed(), (error: unknown) => {
    assert.ok(error instanceof Error && "blockingOperations" in error);
    assert.deepEqual(error.blockingOperations, [expected]); return true;
  });
});

void test("terminal orphan journals stop confirmed native editing but preserve recovery-only controls", async () => {
  const { engine } = await fixture({ state: "completed", orphanedCallPossible: true });
  let dispatches = 0;
  const run = (): Promise<true> => { dispatches += 1; return Promise.resolve(true); };
  const admit = (): Promise<true> => engine.assertNativeUiEditingAllowed();
  await assert.rejects(runNativeUiWithOperationAdmission({ action: "click", windowHandle: "123", x: 1, y: 2, confirmUIWrite: true }, run, admit), /orphan-risk/u);
  assert.equal(dispatches, 0);
  for (const action of ["focus", "normal-close"] as const) {
    await runNativeUiWithOperationAdmission({ action, windowHandle: "123", confirmUIWrite: true }, run, admit);
  }
  await runNativeUiWithOperationAdmission({ action: "capture", windowHandle: "123" }, run, admit);
  assert.equal(dispatches, 3);
});

void test("a newly appended orphan is seen between different guards and blocks bridge dispatch", async () => {
  const { engine } = await fixture();
  assert.deepEqual(await engine.recover(), []);
  const { id } = await fixture({ state: "completed", orphanedCallPossible: true });
  await assert.rejects(engine.assertBridgeDispatchAllowed(), /dispatch is quarantined/u);
  await assert.rejects(engine.assertNativeUiEditingAllowed(), /before native UI edits/u);
  await assert.rejects(engine.assertRecoveryOperationIsolated("other"), /not isolated/u);
  assert.equal(await engine.assertRecoveryOperationIsolated(id), true);
  assert.deepEqual(await engine.recover(), []);
});

void test("same-size journal tampering with restored timestamps is detected across guards", async () => {
  const { engine, id } = await fixture();
  assert.equal(await engine.assertBridgeDispatchAllowed(), true);
  const path = artifacts.operationPath(id);
  const info = await lstat(path), original = await readFile(path, "utf8");
  const changed = original.replace('"completed"', '"savingxxx"');
  assert.notEqual(changed, original); assert.equal(Buffer.byteLength(changed), Buffer.byteLength(original));
  await writeFile(path, changed); await utimes(path, info.atime, info.mtime);
  const reports = await engine.recover();
  assert.equal(reports[0]?.state, "journal-unreadable");
  await assert.rejects(engine.assertRecoveryOperationIsolated("other"), /not isolated/u);
  await assert.rejects(engine.assertBridgeDispatchAllowed(), /dispatch is quarantined/u);
  await assert.rejects(engine.assertNativeUiEditingAllowed(), /before native UI edits/u);
});

void test("same-size phase-artifact tampering is rehashed between reporting and bridge guards", async () => {
  const { engine, id, journal } = await fixture();
  const descriptor = await artifacts.writePhaseArtifact(id, 1, "before", { state: "before" });
  await artifacts.updateOperation({ ...journal, artifacts: [descriptor] });
  assert.deepEqual(await engine.recover(), []);
  const info = await lstat(descriptor.path);
  await writeFile(descriptor.path, '{"state":"forged"}\n'); await utimes(descriptor.path, info.atime, info.mtime);
  await assert.rejects(engine.assertBridgeDispatchAllowed(), /dispatch is quarantined/u);
  await assert.rejects(engine.assertNativeUiEditingAllowed(), /before native UI edits/u);
  const reports = await engine.recover();
  assert.equal(reports[0]?.state, "journal-unreadable");
});

void test("journal and artifact path substitutions fail fresh cross-guard path checks", async () => {
  for (const target of ["journal", "artifact"] as const) {
    const { engine, id, journal } = await fixture();
    const descriptor = await artifacts.writePhaseArtifact(id, 1, "before", { state: "before" });
    await artifacts.updateOperation({ ...journal, artifacts: [descriptor] });
    assert.deepEqual(await engine.recover(), []);
    const path = target === "journal" ? artifacts.operationPath(id) : descriptor.path;
    const retained = `${path}.retained`;
    await rename(path, retained); await symlink(retained, path);
    await assert.rejects(engine.assertBridgeDispatchAllowed(), /dispatch is quarantined/u);
    await assert.rejects(engine.assertNativeUiEditingAllowed(), /before native UI edits/u);
    await unlink(path); await rename(retained, path);
    assert.equal(await engine.assertRecoveryOperationIsolated("other"), true);
    const alias = `${path}.alias`;
    await link(path, alias);
    const reports = await engine.recover();
    assert.equal(reports[0]?.state, "journal-unreadable");
    await assert.rejects(engine.assertNativeUiEditingAllowed(), /before native UI edits/u);
    await unlink(alias);
    assert.equal(await engine.assertBridgeDispatchAllowed(), true);
    await rm(join(root, "operations"), { recursive: true, force: true });
  }
});

void test("legitimately changed journal bytes invalidate an unchanged terminal projection", async () => {
  const { engine, journal } = await fixture();
  assert.equal(await engine.assertRecoveryOperationIsolated("other"), true);
  await artifacts.updateOperation({ ...journal, state: "library-needs-review", orphanedCallPossible: true });
  await assert.rejects(engine.assertBridgeDispatchAllowed(), /dispatch is quarantined/u);
  const reports = await engine.recover();
  assert.equal(reports[0]?.orphanedCallPossible, true);
});
