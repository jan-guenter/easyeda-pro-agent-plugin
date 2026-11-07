/** Inert catalogue checks only. No worker, native owner or application starts. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_PCB_VIA_REPLAY_NO_PUBLICATION_PROGRAM } from "../src/current-pcb-via-replay-program.ts";
import { CURRENT_PCB_VIA_SAVE_CALLS } from "../src/current-pcb-via-save-programs.ts";
import { CURRENT_PCB_VIA_SAVE_SITES } from "../src/current-pcb-via-save-source.ts";
import { CURRENT_GENERATED_PERIODIC_SYNC_REQUESTS } from "../src/current-generated-periodic-sync-protocol.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_REQUESTS } from "../src/current-project-save-producer-protocol.ts";
import { CURRENT_PCB_VIA_OBSERVED_WORKER_SOURCE_REQUESTS, qualifyCurrentPcbViaObservedWorkerSource, requireCurrentPcbViaObservedWorkerProgram } from "../src/current-pcb-via-observed-worker-programs.ts";

void test("only exact original generated programs and Inspector source wrappers qualify", () => {
  const expression = CURRENT_PCB_VIA_SAVE_SITES.entry.expression, fn = CURRENT_PCB_VIA_SAVE_CALLS.entry;
  qualifyCurrentPcbViaObservedWorkerSource({ scriptSource: `(${fn})` }, "function", fn);
  qualifyCurrentPcbViaObservedWorkerSource({ scriptSource: expression }, "expression", expression);
  qualifyCurrentPcbViaObservedWorkerSource({ scriptSource: `(${CURRENT_PCB_VIA_REPLAY_NO_PUBLICATION_PROGRAM})` }, "function", CURRENT_PCB_VIA_REPLAY_NO_PUBLICATION_PROGRAM);
  assert.throws(() => { requireCurrentPcbViaObservedWorkerProgram("function", "function(){return true;}"); }, /OBSERVED_WORKER_PROGRAM/u);
  assert.throws(() => { qualifyCurrentPcbViaObservedWorkerSource({ scriptSource: fn }, "function", fn); }, /OBSERVED_WORKER_SOURCE/u);
  assert.throws(() => { qualifyCurrentPcbViaObservedWorkerSource({ scriptSource: `${expression} ` }, "expression", expression); }, /OBSERVED_WORKER_SOURCE/u);
  assert.throws(() => { qualifyCurrentPcbViaObservedWorkerSource({ scriptSource: `(${fn})`, bytecode: "unexpected" }, "function", fn); });
  let called = false;
  assert.throws(() => { qualifyCurrentPcbViaObservedWorkerSource({ get scriptSource(): string { called = true; return `(${fn})`; } }, "function", fn); });
  assert.equal(called, false);
});
void test("source-read capacity retains complete repeated periodic and shared cache budgets", () => {
  assert.ok(Number.isSafeInteger(CURRENT_PCB_VIA_OBSERVED_WORKER_SOURCE_REQUESTS));
  assert.ok(CURRENT_PCB_VIA_OBSERVED_WORKER_SOURCE_REQUESTS > CURRENT_GENERATED_PERIODIC_SYNC_REQUESTS.cdpRequests + CURRENT_PROJECT_SAVE_PRODUCER_REQUESTS.cdpRequests);
});
