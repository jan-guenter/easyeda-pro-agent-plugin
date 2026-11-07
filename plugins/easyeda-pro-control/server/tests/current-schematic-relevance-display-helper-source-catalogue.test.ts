/** Inert catalogue checks only. No worker, native owner or application starts. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_PROJECT_LIBRARY_REFRESH_PROGRAMS } from "../src/current-project-library-refresh-programs.ts";
import { CURRENT_PCB_VIA_REPLAY_NO_PUBLICATION_PROGRAM } from "../src/current-pcb-via-replay-program.ts";
import { CURRENT_GENERATED_INITIAL_SYNC_CONDITION } from "../src/current-generated-initial-sync-condition.ts";
import { CURRENT_SCHEMATIC_DISPLAY_SAVE_CALLS } from "../src/current-schematic-display-save-programs.ts";
import { CURRENT_SCHEMATIC_DISPLAY_SAVE_SITES } from "../src/current-schematic-display-save-source.ts";
import { CURRENT_GENERATED_PERIODIC_SYNC_REQUESTS } from "../src/current-generated-periodic-sync-protocol.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_REQUESTS } from "../src/current-project-save-producer-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_OBSERVED_WORKER_SOURCE_REQUESTS, qualifyCurrentSchematicRelevanceDisplayObservedWorkerSource, requireCurrentSchematicRelevanceDisplayObservedWorkerCondition, requireCurrentSchematicRelevanceDisplayObservedWorkerProgram } from "../src/current-schematic-relevance-display-helper-source-catalogue.ts";

void test("only exact original generated programs and Inspector source wrappers qualify", () => {
  requireCurrentSchematicRelevanceDisplayObservedWorkerCondition(CURRENT_GENERATED_INITIAL_SYNC_CONDITION);
  qualifyCurrentSchematicRelevanceDisplayObservedWorkerSource({ scriptSource: CURRENT_GENERATED_INITIAL_SYNC_CONDITION }, "expression", CURRENT_GENERATED_INITIAL_SYNC_CONDITION);
  assert.throws(() => { requireCurrentSchematicRelevanceDisplayObservedWorkerCondition("1===1"); }, /OBSERVED_WORKER_CONDITION/u);
  const expression = CURRENT_SCHEMATIC_DISPLAY_SAVE_SITES.entry.expression, fn = CURRENT_SCHEMATIC_DISPLAY_SAVE_CALLS.entry;
  qualifyCurrentSchematicRelevanceDisplayObservedWorkerSource({ scriptSource: `(${fn})` }, "function", fn);
  qualifyCurrentSchematicRelevanceDisplayObservedWorkerSource({ scriptSource: expression }, "expression", expression);
  qualifyCurrentSchematicRelevanceDisplayObservedWorkerSource({ scriptSource: `(${CURRENT_PROJECT_LIBRARY_REFRESH_PROGRAMS.suspend})` }, "function", CURRENT_PROJECT_LIBRARY_REFRESH_PROGRAMS.suspend);
  assert.throws(() => { requireCurrentSchematicRelevanceDisplayObservedWorkerProgram("function", CURRENT_PCB_VIA_REPLAY_NO_PUBLICATION_PROGRAM); }, /OBSERVED_WORKER_PROGRAM/u);
  assert.throws(() => { requireCurrentSchematicRelevanceDisplayObservedWorkerProgram("function", "function(){return true;}"); }, /OBSERVED_WORKER_PROGRAM/u);
  assert.throws(() => { qualifyCurrentSchematicRelevanceDisplayObservedWorkerSource({ scriptSource: fn }, "function", fn); }, /OBSERVED_WORKER_SOURCE/u);
  assert.throws(() => { qualifyCurrentSchematicRelevanceDisplayObservedWorkerSource({ scriptSource: `${expression} ` }, "expression", expression); }, /OBSERVED_WORKER_SOURCE/u);
  assert.throws(() => { qualifyCurrentSchematicRelevanceDisplayObservedWorkerSource({ scriptSource: `(${fn})`, bytecode: "unexpected" }, "function", fn); });
  let called = false;
  assert.throws(() => { qualifyCurrentSchematicRelevanceDisplayObservedWorkerSource({ get scriptSource(): string { called = true; return `(${fn})`; } }, "function", fn); });
  assert.equal(called, false);
});
void test("source-read capacity retains complete repeated periodic and shared cache budgets", () => {
  assert.ok(Number.isSafeInteger(CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_OBSERVED_WORKER_SOURCE_REQUESTS));
  assert.ok(CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_OBSERVED_WORKER_SOURCE_REQUESTS > CURRENT_GENERATED_PERIODIC_SYNC_REQUESTS.cdpRequests + CURRENT_PROJECT_SAVE_PRODUCER_REQUESTS.cdpRequests);
});
