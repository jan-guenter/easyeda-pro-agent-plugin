import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { controlDataDirectory, createOperation, operationPath } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, newOperationId } from "../src/core.ts";
import { scanQualifiedAdmissionOperations } from "../src/closed-symbol-terminal-admission.ts";
import { createSyntheticCompletedPeer, retireSyntheticJournal } from "./helpers/synthetic-journal-retirement.ts";

void test("retirement preserves invalid synthetic evidence bytes instead of claiming completion", async () => {
  const operationId = newOperationId(), plan = { profile: "easyeda-pro-control.project-symbol-closed-session.v1" };
  await createOperation({ schema: OPERATION_SCHEMA, operationId, plan, planHash: buildPlanHash(plan), state:"completed", artifacts:[], orphanedCallPossible:false });
  const before = await readFile(operationPath(operationId));
  const beforeScan = await scanQualifiedAdmissionOperations();
  assert.equal(beforeScan.some(value => value.summary.operationId === operationId && value.bridgeBlocking), true);
  await retireSyntheticJournal(operationId);
  assert.deepEqual(await scanQualifiedAdmissionOperations(), []);
  const retained = join(controlDataDirectory(), "retired-test-journals", `${operationId}.json`);
  assert.deepEqual(await readFile(retained), before);
  await retireSyntheticJournal(operationId);
  const retiredDirectory = join(controlDataDirectory(), "retired-test-journals");
  assert.deepEqual(await readdir(retiredDirectory), [`${operationId}.json`]);
});
void test("ordinary completed peer remains at its original identity for redirection invariance", async () => {
  const peer = await createSyntheticCompletedPeer();
  const before = await readFile(peer.journalPath);
  assert.deepEqual(await scanQualifiedAdmissionOperations(), []);
  assert.deepEqual(await readFile(peer.journalPath), before);
  await retireSyntheticJournal(peer.operationId);
});
void test("retirement rejects traversal and a changed ambient root before touching files", async () => {
  await assert.rejects(retireSyntheticJournal("../unrelated"));
  const before = process.env["EASYEDA_CONTROL_DATA_DIR"];
  process.env["EASYEDA_CONTROL_DATA_DIR"] = "/not-the-test-root";
  try { await assert.rejects(retireSyntheticJournal("synthetic-untouched")); }
  finally { process.env["EASYEDA_CONTROL_DATA_DIR"] = before; }
});
