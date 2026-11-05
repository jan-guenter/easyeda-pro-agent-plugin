import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash } from "node:crypto";
import { captureCurrentProjectStructureCompletionReply } from "../src/current-project-structure-completion-protocol.ts";
import { CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE } from "../src/current-pcb-worker-construction-contract.ts";
import { currentFootprintCopyForwardStartupWire, currentFootprintCopyPreparationWire, currentPcb209WorkerStartupWire } from "../src/current-pcb-worker-startup-wire.ts";
import { CURRENT_PROJECT_STRUCTURE_WORKER_CALLS } from "../src/current-project-structure-worker-programs.ts";
import { CURRENT_PROJECT_STRUCTURE_WORKER_SITES } from "../src/current-project-structure-worker-observer.ts";

void test("new structure sites and programs remain rejected by every existing worker native vocabulary", () => {
  const group = CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE.group;
  for (const wire of [currentPcb209WorkerStartupWire, currentFootprintCopyPreparationWire, currentFootprintCopyForwardStartupWire]) {
    for (const site of Object.values(CURRENT_PROJECT_STRUCTURE_WORKER_SITES)) {
      assert.throws(() => wire({ sessionId: "session", method: "Debugger.setBreakpoint", params: { location: { scriptId: "worker", lineNumber: site.lineNumber, columnNumber: site.columnNumber } } }, 1));
    }
    for (const program of [CURRENT_PROJECT_STRUCTURE_WORKER_CALLS.packetText, CURRENT_PROJECT_STRUCTURE_WORKER_CALLS.serial, CURRENT_PROJECT_STRUCTURE_WORKER_CALLS.debounce]) {
      assert.throws(() => wire({ sessionId: "session", method: "Runtime.callFunctionOn", params: { objectId: "scope", functionDeclaration: program,
        arguments: [], objectGroup: group, silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } }, 1));
    }
  }
});
void test("complete structure reply capture preserves its bound and invokes no foreign hooks", () => {
  const payload = { result: { type: "object", value: { structureText: "x".repeat(2_097_152) } } };
  const retained = captureCurrentProjectStructureCompletionReply(payload);
  assert.equal(retained.text, JSON.stringify(payload)); assert.equal(retained.sha256, createHash("sha256").update(retained.text).digest("hex"));
  assert.equal(Object.isFrozen(retained.value), true);
  assert.throws(() => captureCurrentProjectStructureCompletionReply({ ...payload, extra: "x".repeat(2_097_153) }));
  let hooks = 0;
  const getter = Object.defineProperty({}, "result", { enumerable: true, get: (): never => { hooks += 1; throw new Error("getter invoked"); } });
  assert.throws(() => captureCurrentProjectStructureCompletionReply(getter));
  assert.throws(() => captureCurrentProjectStructureCompletionReply(new Proxy({}, { ownKeys: (): never => { hooks += 1; throw new Error("proxy invoked"); } })));
  assert.throws(() => captureCurrentProjectStructureCompletionReply({ "\uD800": true })); assert.equal(hooks, 0);
});
