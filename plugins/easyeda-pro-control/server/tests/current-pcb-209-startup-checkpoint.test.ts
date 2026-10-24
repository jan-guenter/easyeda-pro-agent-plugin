import assert from "node:assert/strict";
import { test } from "node:test";
import { canonicalJson, sha256Json, sha256Text } from "../src/core.ts";
import { currentPcb209StartupCheckpointCallback } from "../src/current-pcb-209-startup-checkpoint.ts";
import type { CurrentPcb209StartupPreparation } from "../src/current-pcb-209-startup-checkpoint.ts";
import type { CurrentDisposableOpenCheckpoint } from "../src/current-disposable-open-checkpoint.ts";
import { fixture } from "./helpers/symbol-sql-fixture.ts";

async function setup(): Promise<{
  preparation: CurrentPcb209StartupPreparation;
  binding: Parameters<typeof currentPcb209StartupCheckpointCallback>[1];
}> {
  const { path, before } = await fixture();
  const rawWindowsPath = String.raw`Z:\Synthetic\checkpoint.eprj2`, sourceSha256 = "a".repeat(64);
  const originalTarget = { rawWindowsPath, projectUuid: sha256Text(rawWindowsPath), documentUuid: "b".repeat(16), expectedSourceSha256: sourceSha256 };
  const sealedTarget = { ...originalTarget, branchUuid: "c".repeat(32) };
  const fileIdentity = { birthtimeNs: "1", ctimeNs: "2", dev: "3", ino: "4" };
  // The completed SQL child is real. Receipt/history verification is a synthetic
  // Callback below; these values grant no managed backup or native admission.
  const prepared: CurrentDisposableOpenCheckpoint = {
    profile: "easyeda-pro-control.current-disposable-open-checkpoint.v1",
    checkpoint: { schema: "easyeda-pro-control.checkpoint.v2", createdAt: new Date(0).toISOString(), source: "/synthetic/source",
      checkpoint: path, sourceIdentity: fileIdentity, checkpointIdentity: fileIdentity, sourceSha256,
      checkpointSha256: before.checkpointSha256, sourceDumpSha256: "d".repeat(64), checkpointDumpSha256: "d".repeat(64),
      receiptSha256: "e".repeat(64), receiptPath: "/synthetic/receipt" },
    preparationCheckpoint: { path, bytes: 1, sha256: before.checkpointSha256 },
    targetEvidence: { ...sealedTarget, docType: "PCB", sourceSha256, checkpointSha256: before.checkpointSha256,
      documentSemanticSha256: "f".repeat(64), historySemanticSha256: "f".repeat(64), headHistoryUuid: "a".repeat(32) },
  };
  assert.notEqual(sourceSha256, before.checkpointSha256);
  const preparation = { sealedTarget, prepared, preparedText: canonicalJson(prepared), originalTarget, commonInventory: before };
  assert.ok(prepared.preparationCheckpoint !== undefined);
  return { preparation, binding: { target: sealedTarget, checkpointReceiptSha256: sha256Json(prepared.checkpoint),
    beforeSqlSha256: before.logicalSha256, preparationCheckpoint: prepared.preparationCheckpoint } };
}

void test("PCB callback verifies original historical preparation and returns its same completed reader once", async () => {
  const { preparation, binding } = await setup(), calls: string[] = [];
  const reverify = currentPcb209StartupCheckpointCallback(preparation, binding, {
    assertOriginal: (): Promise<void> => { calls.push("owner"); return Promise.resolve(); },
    verifyHistorical: (prepared, target): Promise<void> => {
      assert.equal(prepared, preparation.prepared); assert.equal(target, preparation.originalTarget);
      calls.push("historical"); return Promise.resolve();
    },
  });
  assert.equal(await reverify(), preparation.commonInventory);
  assert.deepEqual(calls, ["owner", "historical", "owner"]);
  await assert.rejects(reverify(), /CONSUMED/u); assert.equal(calls.length, 3);
});

void test("PCB callback refuses a new reader, changed managed descriptor or wrong original intent", async () => {
  const { preparation, binding } = await setup();
  const owner = { assertOriginal: unused, verifyHistorical: unused };
  assert.throws(() => currentPcb209StartupCheckpointCallback({ ...preparation, commonInventory: structuredClone(preparation.commonInventory) }, binding, owner));
  assert.throws(() => currentPcb209StartupCheckpointCallback(preparation, { ...binding, beforeSqlSha256: "0".repeat(64) }, owner), /ORIGINAL_SQL_BINDING/u);
  assert.throws(() => currentPcb209StartupCheckpointCallback(preparation,
    { ...binding, preparationCheckpoint: { ...binding.preparationCheckpoint, bytes: 2 } }, owner), /ORIGINAL_PREPARATION_CHANGED/u);
});

void test("loss during historical verification consumes callback and never returns a replacement baseline", async () => {
  const { preparation, binding } = await setup(); let checks = 0, verified = 0;
  const reverify = currentPcb209StartupCheckpointCallback(preparation, binding, {
    assertOriginal: (): Promise<void> => { checks += 1; return checks === 1 ? Promise.resolve() : Promise.reject(new Error("original owner lost")); },
    verifyHistorical: (): Promise<void> => { verified += 1; return Promise.resolve(); },
  });
  await assert.rejects(reverify(), /original owner lost/u); await assert.rejects(reverify(), /CONSUMED/u);
  assert.equal(checks, 2); assert.equal(verified, 1);
});
function unused(): never { throw new Error("unexpected owner or historical verifier invocation"); }
