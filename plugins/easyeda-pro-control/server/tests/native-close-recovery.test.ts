import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import { readFile } from "node:fs/promises";
import { discardCloseConfirmation, nativeCloseRecoveryRequestSchema } from "../src/native-close-recovery.ts";
import type { NativeCloseRecoveryDependencies } from "../src/native-close-recovery.ts";
import type { OperationJournal } from "../src/artifacts.ts";

const request = { action: "discard-close-confirmation", operationId: "easyeda-fixture-123", windowHandle: "65537", confirmUIWrite: true, discardOwnUnsavedChanges: true,
  appBinding: { authority: "observed-unowned", rootPid: 101, rootStartTicks: "639247676666923462", executable: String.raw`C:\Apps\easyeda-pro.exe`, executableSha256: "b".repeat(64) },
  target: { projectUuid: "project", documentUuid: "footprint", documentType: 4 },
  capture: { receiptPath: "/managed/capture.receipt.json", receiptSha256: "c".repeat(64), imageSha256: "d".repeat(64) },
  observedDialog: { title: "Confirm Close", targetName: "R0603", onlyUnsavedTarget: true, discardButton: { label: "Leave this page", x: 300, y: 300 } } };
function fixture(): { journal: OperationJournal; dependencies: NativeCloseRecoveryDependencies; events: string[]; controller: { runRecoveryCloseClick: (input: unknown) => Promise<Record<string, unknown>> } } {
  const context = { project: { uuid: "project", path: "/fixture.eprj2" }, document: { uuid: "footprint", documentType: 4 } };
  const journal: OperationJournal = { operationId: request.operationId, plan: { profile: "easyeda-pro-control.typed-design-transaction.v1", expectedContext: context }, planHash: "a".repeat(64),
    context, saved: false, state: "apply-needs-review", orphanedCallPossible: false, sequence: 2, artifacts: [],
    executionAuthorityBeforeOrphan: { processes: [{ role: "easyeda-main", pid: 101, startIdentity: `win32:${request.appBinding.rootStartTicks}:job:${"e".repeat(32)}` }] } };
  const events: string[] = [];
  const dependencies: NativeCloseRecoveryDependencies = {
    list: (): Promise<OperationJournal[]> => Promise.resolve([journal]), load: (): Promise<OperationJournal> => Promise.resolve(journal),
    update: (): Promise<string> => { events.push("journal"); return Promise.resolve("/managed/journal.json"); },
    write: (_id, _sequence, phase): Promise<{ path: string; bytes: number; sha256: string }> => { events.push(phase); return Promise.resolve({ path: `/managed/${phase}.json`, bytes: 1, sha256: "f".repeat(64) }); },
    capture: (input): Promise<{ bounds: [number, number, number, number]; imageSha256: string; receiptSha256: string; createdAt: string }> => Promise.resolve({ bounds: [0, 0, 800, 600], imageSha256: input.capture.imageSha256, receiptSha256: input.capture.receiptSha256, createdAt: new Date(Date.now() + 1).toISOString() }),
    checkpoint: (): Promise<{ beforeReceipt: unknown; currentCheckpoint: unknown; durableChanged: boolean }> => { events.push("preserve-checkpoint"); return Promise.resolve({ beforeReceipt: { original: true }, currentCheckpoint: { preserved: true }, durableChanged: true }); },
  };
  const controller = { runRecoveryCloseClick(input: unknown): Promise<Record<string, unknown>> {
    events.push("click"); assert.equal(events.at(-2), "journal");
    assert.ok(typeof input === "object" && input !== null && "expectedCaptureSha256" in input);
    assert.equal(input.expectedCaptureSha256, request.capture.imageSha256);
    return Promise.resolve({ clickReturned: true });
  } };
  return { journal, dependencies, events, controller };
}

void test("recovery discard preserves changed saved state, journals intent before one click, and never marks recovered", async () => {
  const f = fixture();
  await assert.rejects(discardCloseConfirmation(request, f.controller, f.dependencies), /durable-change acknowledgment/u);
  assert.equal(f.events.includes("click"), false);
  const result = await discardCloseConfirmation({ ...request, acknowledgeDurableChanges: true }, f.controller, f.dependencies);
  assert.equal(result["recovered"], false); assert.equal(result["savedStateVerified"], false); assert.equal(result["durableChanged"], true);
  assert.equal(f.journal["state"], "apply-needs-review"); assert.equal(f.journal["saved"], false); assert.equal(f.journal["orphanedCallPossible"], false);
  assert.equal(f.events.filter((event) => event === "click").length, 1);
  await assert.rejects(discardCloseConfirmation({ ...request, acknowledgeDurableChanges: true }, f.controller, f.dependencies), /unused/u);
  assert.equal(f.events.filter((event) => event === "click").length, 1);
  assert.doesNotThrow(() => z.toJSONSchema(nativeCloseRecoveryRequestSchema, { io: "input" }));
});

void test("wrong target/generation, missing loss authority and changed pixels cannot become a generic recovery click", async () => {
  for (const changed of [{ ...request, discardOwnUnsavedChanges: false }, { ...request, target: { ...request.target, documentUuid: "other" } },
    { ...request, appBinding: { ...request.appBinding, rootStartTicks: "639247676666923463" } }, { ...request, observedDialog: { ...request.observedDialog, discardButton: { ...request.observedDialog.discardButton, label: "Save" } } }]) {
    const f = fixture(); await assert.rejects(discardCloseConfirmation(changed, f.controller, f.dependencies)); assert.equal(f.events.includes("click"), false);
  }
  const f = fixture();
  await assert.rejects(discardCloseConfirmation({ ...request, acknowledgeDurableChanges: true }, { runRecoveryCloseClick: (): Promise<never> => Promise.reject(Object.assign(new Error("pixels changed"), { dispatched: false })) }, f.dependencies), /pixels changed/u);
  assert.equal(f.journal["state"], "apply-needs-review");
  await assert.rejects(discardCloseConfirmation({ ...request, acknowledgeDurableChanges: true }, f.controller, f.dependencies), /unused/u);
  const newCapture = { ...request.capture, receiptSha256: "e".repeat(64) };
  await discardCloseConfirmation({ ...request, acknowledgeDurableChanges: true, capture: newCapture }, f.controller, f.dependencies);
  assert.equal(f.events.filter((event) => event === "click").length, 1);
  assert.equal(f.events.filter((event) => event === "native-discard-close-intent").length, 2);
  const helper = await readFile(new URL("../../scripts/native-ui-controller.ps1", import.meta.url), "utf8");
  assert.ok(helper.indexOf("recovery-capture-pixels-changed") < helper.indexOf("$output = & $legacy"));
  assert.match(helper, /GetForegroundWindow\(\) -ne \$windowHandle/u);
});

const warningRequest = { ...request, action: "discard-save-warning", acknowledgeDurableChanges: true,
  capture: { ...request.capture, receiptSha256: "1".repeat(64), imageSha256: "2".repeat(64) },
  observedDialog: { title: "Warning", message: "Your file hasn't been saved. Would you like to save it now?", targetName: "R0603", onlyUnsavedTarget: true,
    discardButton: { label: "Don't Save", x: 350, y: 300 } } };

void test("save-warning discard follows one returned close discard and retains a separate one-shot slot", async () => {
  const f = fixture();
  await discardCloseConfirmation({ ...request, acknowledgeDurableChanges: true }, f.controller, f.dependencies);
  const original = structuredClone(f.journal["nativeCloseRecovery"]);
  let warningClicks = 0;
  const result = await discardCloseConfirmation(warningRequest, { runRecoveryCloseClick: (input): Promise<Record<string, unknown>> => {
    warningClicks += 1;
    assert.equal(f.events.at(-1), "journal");
    assert.ok(typeof input === "object" && input !== null && "expectedCaptureSha256" in input && "expectedBounds" in input && "x" in input);
    assert.equal(input.expectedCaptureSha256, warningRequest.capture.imageSha256);
    assert.deepEqual(input.expectedBounds, [0, 0, 800, 600]);
    assert.equal(input.x, 350);
    return Promise.resolve({ clickReturned: true });
  } }, f.dependencies);
  assert.equal(result["recovered"], false);
  assert.equal(result["savedStateVerified"], false);
  assert.equal(result["schema"], "easyeda-pro-control.native-discard-save-warning.v1");
  assert.deepEqual(f.journal["nativeCloseRecovery"], original);
  assert.equal(f.journal["state"], "apply-needs-review");
  assert.equal(warningClicks, 1);
  assert.equal(f.events.filter((event) => event === "preserve-checkpoint").length, 2);
  await assert.rejects(discardCloseConfirmation(warningRequest, f.controller, f.dependencies), /unused/u);
  assert.equal(warningClicks, 1);
});

void test("save warning refuses missing first result, stale capture, foreign target and Save or Cancel buttons", async () => {
  const absent = fixture();
  await assert.rejects(discardCloseConfirmation(warningRequest, absent.controller, absent.dependencies), /after its first discard click/u);
  assert.equal(absent.events.includes("click"), false);
  const f = fixture();
  await discardCloseConfirmation({ ...request, acknowledgeDurableChanges: true }, f.controller, f.dependencies);
  for (const changed of [
    { ...warningRequest, capture: request.capture },
    { ...warningRequest, target: { ...warningRequest.target, documentUuid: "other" } },
    { ...warningRequest, appBinding: { ...warningRequest.appBinding, rootPid: 102 } },
    { ...warningRequest, observedDialog: { ...warningRequest.observedDialog, discardButton: { ...warningRequest.observedDialog.discardButton, label: "Save" } } },
    { ...warningRequest, observedDialog: { ...warningRequest.observedDialog, discardButton: { ...warningRequest.observedDialog.discardButton, label: "Cancel" } } },
  ]) { await assert.rejects(discardCloseConfirmation(changed, f.controller, f.dependencies)); }
  await assert.rejects(discardCloseConfirmation(warningRequest, f.controller, { ...f.dependencies,
    capture: (): Promise<{ bounds: [number, number, number, number]; imageSha256: string; receiptSha256: string; createdAt: string }> => Promise.resolve({
      bounds: [0, 0, 800, 600], imageSha256: warningRequest.capture.imageSha256, receiptSha256: warningRequest.capture.receiptSha256, createdAt: "2000-01-01T00:00:00.000Z",
    }),
  }), /fresh capture after/u);
  assert.equal(f.events.filter((event) => event === "click").length, 1);
  assert.equal(f.journal["nativeSaveWarningRecovery"], undefined);
  assert.doesNotThrow(() => z.toJSONSchema(nativeCloseRecoveryRequestSchema, { io: "input" }));
});
