/* oxlint-disable import/max-dependencies -- Exercise the real source, native, display, topology and Save generators together against one synthetic editor. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { sha256Json, sha256Text } from "../src/core.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import { buildExactReadExpression } from "../src/exact-readers.ts";
import { prepareFlatDisplayProfile } from "../src/flat-display-profile.ts";
import { buildFlatDisplayRuntimeGuard } from "../src/flat-display-runtime.ts";
import type { FlatDisplayRuntimeGuard } from "../src/flat-display-runtime.ts";
import { buildSchematicLayoutAdapter, buildSchematicLayoutAdapterCooperatively } from "../src/schematic-layout-batch.ts";
import { buildSaveReopenCode } from "../src/runtime-scripts.ts";
import { prepareDesignActionCooperatively } from "../src/design-action.ts";
import { materializeNativeHistory } from "../src/native-history.ts";
import { nativeLibraryHeaderEvidence } from "../src/native-library-header-evidence.ts";
import { FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE } from "../src/flat-display-library-peers.ts";
import { context, fixture, operation, rehash, replaceSource } from "./flat-display-fixture.ts";
import { runtimeFixture } from "./flat-display-runtime-fixture.ts";

function execute(code: string, runtime: object): Promise<unknown> {
  const result: unknown = runInNewContext(`(async()=>{${code}})()`, runtime);
  return Promise.resolve(result);
}
// oxlint-disable-next-line typescript/explicit-function-return-type -- Keep this local composite fixture's inferred exact adapter types instead of repeating the maintained production declarations.
async function preparedFixture() {
  const before = fixture(), prepared = await prepareFlatDisplayProfile({ ...before, context, operation });
  const guard: FlatDisplayRuntimeGuard = { binding: prepared.binding, operation, context, observation: before.evidence.observation, phase: "before" };
  const source = parseDocumentSource(before.native.source);
  const adapter = await buildSchematicLayoutAdapterCooperatively(operation, source, before.native, {}, undefined, guard);
  return { before, prepared, guard, source, adapter };
}

void test("flat generated display executes once inside its exact owned running action and preserves absent-option code", async () => {
  const { before, prepared, source, adapter } = await preparedFixture();
  const plain = buildSchematicLayoutAdapter(operation, source, before.native, {});
  // oxlint-disable-next-line unicorn/no-useless-undefined -- Explicit absent internal option is the backward-compatible generation case under test.
  const plainAsync = await buildSchematicLayoutAdapterCooperatively(operation, source, before.native, {}, undefined, undefined);
  assert.equal(plainAsync.code, plain.code); assert.ok(!plain.code.includes("flatDisplay"));
  /* Full old/current generation comparison proved the sole change from the
   * historical 17c5f7b7... program is the fixed SCH_NATIVE_PIN_NET_EXCEPTION
   * try/catch around getSchPinNet. Ownership, baseline and dispatch code is
   * byte-identical. Keep an independent pin for both current entrypoints. */
  assert.equal(sha256Text(plain.code), "0c4c20facc84713f729538f967da4f1bd5d96e87ba0b8db939d4173627097ca5");
  // Save now includes the passive PCB-peer preference guard, including before
  // Closing a schematic is included. Keep this fixed-program regression pin.
  const guardedSave = buildSaveReopenCode(context, [{ request: { kind: "schematic-source" }, expectedSnapshotSha256: "a".repeat(64) }]);
  assert.equal(sha256Text(guardedSave),
    "a7cbb29ba7b4cdec5c007fe232e3aa912e540daa1834cc56078f63b7dc1bd5c4");
  const scene = runtimeFixture(before);
  scene.hooks.start = (): void => { assert.equal(scene.runner.running, true); assert.equal(scene.runner.currentAction?.status, "running"); };
  assert.equal(await execute(adapter.code, scene.runtime), true);
  assert.deepEqual(scene.calls, ["action", "source"]);
  assert.deepEqual(parseDocumentSource(scene.source.written), prepared.expectedSource);
});

void test("generated display pin-cache failures stop before source dispatch outside and inside the owned action", async () => {
  const { before, source, adapter } = await preparedFixture();
  const plain = buildSchematicLayoutAdapter(operation, source, before.native, {});
  for (const code of [plain.code, adapter.code]) {
    for (const phase of ["before", "action"] as const) {
      const scene = runtimeFixture(before);
      let pinReads = 0;
      scene.shapes.modelHelpers.pin.getSchPinNet = (): string => {
        pinReads += 1;
        if (phase === "before" || scene.runner.running) { throw new Error("private-pin-cache-failure"); }
        return "SIGNAL";
      };
      await assert.rejects(execute(code, scene.runtime), { message: "SCH_NATIVE_PIN_NET_EXCEPTION" });
      assert.equal(pinReads, phase === "before" ? 1 : 2, "The failed getter is not retried.");
      assert.deepEqual(scene.calls, phase === "before" ? [] : ["action"]);
      assert.equal(scene.source.written, "", "No source dispatch or Save follows a failed native pin guard.");
      assert.equal(scene.runner.running, false);
    }
  }
});

void test("flat generated writer refuses receiver substitution across every payload digest before source dispatch", async () => {
  const { before, adapter } = await preparedFixture();
  for (const digest of [1, 2, 3, 4]) {
    for (const kind of ["namespace", "manager", "document", "shapes", "runner", "source-writer", "branch"] as const) {
      const scene = runtimeFixture(before);
      scene.hooks.digest = (count): void => {
        if (count !== digest) { return; }
        if (kind === "namespace") { scene.runtime.SCH = { ...scene.runtime.SCH }; }
        else if (kind === "manager") { scene.runtime.SCH.docMemoryManager = { ...scene.runtime.SCH.docMemoryManager }; }
        else if (kind === "document") { scene.runtime.SCH.docMemoryManager.getActiveDoc = (): typeof scene.document => ({ ...scene.document }); }
        else if (kind === "shapes") { scene.document.shapeManager = { ...scene.shapes }; }
        else if (kind === "runner") { scene.shapes.actionRunner = { ...scene.runner }; }
        else if (kind === "source-writer") { scene.document.consistencyImpl.setSourceCode = (): Promise<boolean> => { scene.calls.push("foreign"); return Promise.resolve(true); }; }
        else { scene.project.branchUuid = "f".repeat(32); }
      };
      await assert.rejects(execute(adapter.code, scene.runtime), /DRIFT|WRITER_RECEIVER/u, `${kind} at digest ${String(digest)}`);
      assert.deepEqual(scene.calls, []);
    }
  }
});

void test("flat generated writer refuses foreign, nested and repeated action callbacks without writing", async () => {
  const { before, adapter } = await preparedFixture();
  for (const kind of ["token", "status", "nested", "source", "endpoint", "settings", "receiver"] as const) {
    const scene = runtimeFixture(before);
    scene.hooks.start = (): void => {
      const action = scene.runner.currentAction; assert.ok(action);
      if (kind === "token") {
        // oxlint-disable-next-line no-underscore-dangle -- Replace the exact private native action marker being tested.
        action.__easyedaFlatDisplayToken = {};
      }
      else if (kind === "status") { action.status = "willDidRun"; }
      else if (kind === "nested") { scene.runner.currentAction = { status: "running" }; }
      else if (kind === "source") { scene.source.raw = scene.source.raw.replace("Heading", "Other"); }
      else if (kind === "endpoint") { scene.pin.origin.x = 1; }
      else if (kind === "settings") { scene.project.netLabelInterPageConnection = false; }
      else { scene.document.shapeManager = { ...scene.shapes }; }
    };
    await assert.rejects(execute(adapter.code, scene.runtime), /FLAT_|BASELINE_CHANGED/u);
    assert.deepEqual(scene.calls, ["action"]);
  }
  const scene = runtimeFixture(before);
  scene.runner.run = async (perform, options): Promise<boolean> => {
    scene.runner.currentAction = { ...options, status: "running" };
    await perform(); await perform(); return true;
  };
  await assert.rejects(execute(adapter.code, scene.runtime), /CALLBACK_REUSED/u);
  assert.deepEqual(scene.calls, ["source"]);
});

void test("flat internal guard refuses reuse, idle violation and an unrelated writer receiver", async () => {
  const { before, guard } = await preparedFixture();
  const scene = runtimeFixture(before);
  await assert.rejects(execute(`const guard=await ${buildFlatDisplayRuntimeGuard(guard, "source-action")};guard.assertWriter(SCH,SCH.docMemoryManager,{});`, scene.runtime), /WRITER_RECEIVER/u);
  await assert.rejects(execute(`const guard=await ${buildFlatDisplayRuntimeGuard(guard, "source-action")};await guard.run(async()=>{});await guard.run(async()=>{});`, scene.runtime), /ACTION_REUSED/u);
  const busy = runtimeFixture(before); busy.runner.currentAction = { status: "running" };
  await assert.rejects(execute(`return await ${buildFlatDisplayRuntimeGuard(guard)};`, busy.runtime), /ACTION_NOT_IDLE/u);
  assert.deepEqual(busy.calls, []);
});

void test("flat inverse guards bind exact after-state and the sealed inverse, not another display action", async () => {
  const { before, prepared, guard, source } = await preparedFixture();
  const after = replaceSource(before, prepared.expectedSource, prepared.expectedNative);
  const inverseGuard: FlatDisplayRuntimeGuard = { ...guard, phase: "after", observation: after.evidence.observation };
  const inverse = await buildSchematicLayoutAdapterCooperatively(prepared.inverse, prepared.expectedSource, prepared.expectedNative, {}, undefined, inverseGuard);
  const scene = runtimeFixture(after);
  assert.equal(await execute(inverse.code, scene.runtime), true);
  assert.deepEqual(parseDocumentSource(scene.source.written), source);
  await assert.rejects(buildSchematicLayoutAdapterCooperatively(operation, prepared.expectedSource, prepared.expectedNative, {}, undefined, inverseGuard), /inverse differs/u);
  await assert.rejects(prepareDesignActionCooperatively({ id: "other", action: "pcb.line.delete", target: { primitiveId: "text" } },
    { source, schematic: before.native }, {}, guard), /exact layout action/u);
});

void test("flat Save rechecks after final crypto and awaited context, and never saves a busy or drifting page", async () => {
  const { before, prepared, guard } = await preparedFixture();
  const after = replaceSource(before, prepared.expectedSource, prepared.expectedNative);
  const afterGuard: FlatDisplayRuntimeGuard = { ...guard, phase: "after", observation: after.evidence.observation };
  const reference = runtimeFixture(after), request = { kind: "schematic-source" };
  const payload = await execute(`return await ${buildExactReadExpression(request)};`, reference.runtime);
  const guards = [{ request, expectedSnapshotSha256: sha256Json(payload) }];
  const code = buildSaveReopenCode(context, guards, afterGuard);
  // oxlint-disable-next-line unicorn/no-useless-undefined -- Explicit absent internal option must generate byte-identical historical Save code.
  assert.equal(buildSaveReopenCode(context, guards), buildSaveReopenCode(context, guards, undefined));
  for (const timing of ["clean", "digest", "context", "busy", "pcb-peer"] as const) {
    const scene = runtimeFixture(after);
    if (timing === "digest") { scene.hooks.digest = (count): void => { if (count === 4) { scene.pin.origin.x = 1; } }; }
    if (timing === "context") { scene.hooks.context = (): void => { scene.project.branchUuid = "f".repeat(32); }; }
    if (timing === "busy") { scene.hooks.context = (): void => { scene.runner.currentAction = { status: "running" }; }; }
    if (timing === "pcb-peer") { const original = scene.runtime.UI.tabBar.getFilterTabs; scene.hooks.context = (): void => {
      scene.runtime.UI.tabBar.getFilterTabs = (): unknown[] => [...original(), { tabId: "pcb@project", data: { doctype: 3 } }];
    }; }
    let expectedError = /FLAT_|SHAPES/u;
    if (timing === "clean") { expectedError = /TEST_SAVE_BOUNDARY/u; }
    if (timing === "pcb-peer") { expectedError = /PCB_NAVIGATION_PREFERENCES_UNSAFE/u; }
    await assert.rejects(execute(code, scene.runtime), expectedError);
    assert.deepEqual(scene.calls, timing === "clean" ? ["save"] : []);
  }
  assert.throws(() => buildSaveReopenCode(context, guards, guard), /after-phase/u);
});

void test("imported v2 guards execute exact display and inverse and retain the same final synchronous Save checks", async () => {
  const before = fixture(), checkpointSha256 = before.evidence.history.checkpointSha256;
  const peers = materializeNativeHistory([
    '{"type":"DOCHEAD","ticket":0}||{"uuid":"library-peer","docType":"SYMBOL"}|\n{"type":"LINE","id":"library-line","ticket":2,"firstTicket":0}||{"x":0}|\n',
  ], checkpointSha256, { libraryAtomHeaders: "preserve" });
  const history = rehash({ ...before.evidence.history, documents: [...before.evidence.history.documents, ...peers] });
  before.evidence = { ...before.evidence, history, libraryHeaderEvidence: await nativeLibraryHeaderEvidence(history,
    { checkpointSha256, projectUuid: history.projectUuid }) };
  const prepared = await prepareFlatDisplayProfile({ ...before, context, operation });
  assert.equal(prepared.binding.profile, FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE);
  const guard: FlatDisplayRuntimeGuard = { binding: prepared.binding, operation, context, observation: before.evidence.observation, phase: "before" };
  const source = parseDocumentSource(before.native.source);
  const adapter = await buildSchematicLayoutAdapterCooperatively(operation, source, before.native, {}, undefined, guard);
  const scene = runtimeFixture(before);
  assert.equal(await execute(adapter.code, scene.runtime), true);
  assert.deepEqual(scene.calls, ["action", "source"]);
  assert.deepEqual(parseDocumentSource(scene.source.written), prepared.expectedSource);
  const after = replaceSource(before, prepared.expectedSource, prepared.expectedNative);
  const afterGuard: FlatDisplayRuntimeGuard = { ...guard, phase: "after", observation: after.evidence.observation };
  const inverse = await buildSchematicLayoutAdapterCooperatively(prepared.inverse, prepared.expectedSource, prepared.expectedNative, {}, undefined, afterGuard);
  const inverseScene = runtimeFixture(after);
  assert.equal(await execute(inverse.code, inverseScene.runtime), true);
  assert.deepEqual(parseDocumentSource(inverseScene.source.written), source);
  const reference = runtimeFixture(after), request = { kind: "schematic-source" };
  const payload = await execute(`return await ${buildExactReadExpression(request)};`, reference.runtime);
  const code = buildSaveReopenCode(context, [{ request, expectedSnapshotSha256: sha256Json(payload) }], afterGuard);
  assert.ok(code.includes(FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE));
  for (const drift of [false, true]) {
    const current = runtimeFixture(after);
    if (drift) { current.hooks.context = (): void => { current.project.branchUuid = "f".repeat(32); }; }
    await assert.rejects(execute(code, current.runtime), drift ? /FLAT_/u : /TEST_SAVE_BOUNDARY/u);
    assert.deepEqual(current.calls, drift ? [] : ["save"]);
  }
});
