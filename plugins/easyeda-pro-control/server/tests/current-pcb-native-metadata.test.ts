/** No preparation, actor, client or future clock is supplied to this stage. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { assertOriginalCurrentPcbNativeMetadata, prepareCurrentPcbNativeMetadata } from "../src/current-pcb-native-metadata.ts";
import { PCB_PROGRAM_TARGET, pcbProgramBaseline } from "./helpers/current-pcb-rename-program-fixture.ts";
import { IDS, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

void test("PCB original SQL metadata needs no future preparation or actor/clock/client witness", async () => {
  const { before } = await pcbProgramBaseline(), projection = await prepareCurrentPcbNativeMetadata({ before, target: PCB_PROGRAM_TARGET, desiredTitle: "Renamed PCB" });
  assertOriginalCurrentPcbNativeMetadata(projection, before);
  assert.deepEqual(projection.request, { target: PCB_PROGRAM_TARGET, desiredTitle: "Renamed PCB", expectedBefore: { title: "source pcb", displayTitle: "Source PCB",
    parentUuid: "", source: "", version: "1", boardUuid: "", ticket: 100, updateTime: 1, docType: 3 } });
  assert.equal(projection.maximumTicket, 100); assert.equal(projection.peers.length, 2); assert.equal(projection.peers[1]?.ticket, 2);
  assert.equal(projection.baseline.maximumTargetHeaderTime, 1); assert.equal(projection.baseline.sqlSha256, before.logicalSha256);
  assert.equal(projection.sourcePeers.length, 2); assert.equal(projection.sourcePeers[0]?.uuid, IDS.target);
  assert.ok(Object.isFrozen(projection)); assert.ok(Object.isFrozen(projection.request.target)); assert.ok(Object.isFrozen(projection.sourcePeers[0]));
  for (const key of ["client", "actor", "witness", "documentClock", "backendClock"]) { assert.equal(Object.hasOwn(projection, key), false); }
  for (const key of ["executionAuthorized", "originalOwnerVerified", "producerBindingVerified", "actorProvenanceVerified", "clockProvenanceVerified",
    "nativeNamePolicyVerified", "queueCompletionVerified", "generationClosureVerified", "persistentUploadReplayExcluded", "reopened"] as const) {
    assert.equal(projection[key], false);
  }
});

void test("PCB metadata retains original reader identity and rejects copied readers/projections", async () => {
  const { before, path } = await pcbProgramBaseline(), projection = await prepareCurrentPcbNativeMetadata({ before, target: PCB_PROGRAM_TARGET, desiredTitle: "Renamed PCB" });
  const sameContent = await inventory(path); assert.equal(before.logicalSha256, sameContent.logicalSha256);
  assert.throws(() => { assertOriginalCurrentPcbNativeMetadata(projection, sameContent); }, /original SQL metadata/u);
  assert.throws(() => { assertOriginalCurrentPcbNativeMetadata(structuredClone(projection), before); }, /original SQL metadata/u);
  await assert.rejects(prepareCurrentPcbNativeMetadata({ before: structuredClone(before), target: PCB_PROGRAM_TARGET, desiredTitle: "Renamed PCB" }));
});

void test("PCB metadata rejects caller witness fields, target drift and accessors without evaluating them", async () => {
  const { before } = await pcbProgramBaseline(), input = { before, target: PCB_PROGRAM_TARGET, desiredTitle: "Renamed PCB" }; let accessed = false;
  const getter = (): never => { accessed = true; throw new Error("unexpected getter"); };
  for (const key of Object.keys(input)) {
    await assert.rejects(prepareCurrentPcbNativeMetadata(Object.defineProperty({ ...input }, key, { get: getter })), /accessors/u);
  }
  await assert.rejects(prepareCurrentPcbNativeMetadata({ ...input, target: Object.defineProperty({ ...PCB_PROGRAM_TARGET }, "pcbUuid", { get: getter }) }), /accessors/u);
  for (const key of ["client", "actor", "witness", "documentClock", "backendClock"]) {
    await assert.rejects(prepareCurrentPcbNativeMetadata({ ...input, [key]: {} }), /own-data/u);
  }
  await assert.rejects(prepareCurrentPcbNativeMetadata({ ...input, target: { ...PCB_PROGRAM_TARGET, ownerUuid: "f".repeat(32) } }), /owner/u);
  await assert.rejects(prepareCurrentPcbNativeMetadata({ ...input, target: { ...PCB_PROGRAM_TARGET, pcbUuid: "f".repeat(16) } }), /target PCB/u);
  await assert.rejects(prepareCurrentPcbNativeMetadata({ ...input, desiredTitle: "Source PCB" }));
  await assert.rejects(prepareCurrentPcbNativeMetadata({ ...input, desiredTitle: "Peer PCB" }), /collision/u);
  await assert.rejects(prepareCurrentPcbNativeMetadata({ ...input, desiredTitle: "Unqualified I" }), /locale-invariant/u);
  assert.equal(accessed, false);
});

void test("PCB metadata independently checks the complete stored tree without relying on a prepared witness", async () => {
  for (const sql of [`UPDATE project_structures SET structure=json_set(structure,'$.pcbs.${IDS.target}.title','Drifted')`,
    `UPDATE project_structures SET structure=json_remove(structure,'$.pcbs.${IDS.peer}')`]) {
    const { path } = await pcbProgramBaseline(); mutate(path, sql);
    await assert.rejects(prepareCurrentPcbNativeMetadata({ before: await inventory(path), target: PCB_PROGRAM_TARGET, desiredTitle: "Renamed PCB" }));
  }
});
