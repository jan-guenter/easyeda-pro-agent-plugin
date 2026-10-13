/** Actual-stage data with self-resealed semantic substitutions. No native call. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { loadClosedSymbolJournal } from "../../src/closed-symbol-journal.ts";
import type { PhaseEvent } from "../../src/closed-symbol-journal.ts";
import { isRecord, sha256Json } from "../../src/core.ts";
import { reconstructClosedSymbolSqlEvidence } from "../../src/closed-symbol-recorded-sql.ts";
import { assertOriginalClosedSymbolFullEvidence } from "../../src/closed-symbol-coordinator.ts";
import { fixture } from "./closed-symbol-coordinator-fixture.ts";
import { reconstructRecordedSavedRead, reconstructRecordedWrite, recordedNavigationBinding } from "../../src/closed-symbol-terminal-content.ts";
import { artifactJson, phaseData, replayRecordedLifecycle } from "../../src/closed-symbol-terminal-lifecycle.ts";

type Bag = Record<string, unknown>;
function bag(value: unknown): Bag { assert.ok(isRecord(value)); return value; }
function reseal(events: readonly PhaseEvent[], sequence: number): void {
  const selected = events[sequence - 1]; const result = events[sequence]; assert.ok(selected !== undefined && result !== undefined);
  const digest = sha256Json(selected.data);
  Object.assign(selected, { dataSha256: digest, requestSha256: digest }); Object.assign(result, { requestSha256: digest });
}

void test("fixed historical consumers reject self-resealed request and capture substitutions", async (context) => {
  const f = await fixture(context), full = await f.stage.recordFullEvidence(f.plan);
  const original = assertOriginalClosedSymbolFullEvidence(full, f.engine, full.operationId);
  const { journal, events } = await loadClosedSymbolJournal(full.operationId);
  const qualification = bag(await artifactJson(original.edit.witness.clockArtifact));
  const input = { journal, events, inventories: [original.baseline.copy.inventory, original.edit.copy.inventory, original.verification.copy.inventory] as const,
    fingerprint: original.fingerprintArtifact, windows: original.windowArtifacts, runtime: f.machine, nativeClockSource: bag(qualification["launchClock"]) };
  const nativeCalls = [...f.events];
  const lifecycle = await replayRecordedLifecycle(input);
  const sql = await reconstructClosedSymbolSqlEvidence({ journal, events, baselineInventory: input.inventories[0], editInventory: input.inventories[1],
    verificationInventory: input.inventories[2], witness: original.edit.witness.witness, witnessClockArtifact: original.edit.witness.clockArtifact });
  assert.deepEqual(reconstructRecordedWrite({ journal, events, witness: original.edit.witness, preparation: sql.preparation }), original.edit.write);
  const saved = { journal, events, source: sql.savedSource, projection: sql.projection, rawArtifact: original.verification.savedRead.rawArtifact,
    nativeSource: lifecycle[2].nativeSource };
  assert.deepEqual(await reconstructRecordedSavedRead(saved), original.verification.savedRead);

  for (const sequence of [1, 11, 29, 3, 13, 31]) {
    await context.test(`phase${String(sequence)} cannot accept a self-hashed different plan`, async () => {
      const changed = structuredClone(events); bag(changed[sequence - 1]?.data)["closedPlanSha256"] = "0".repeat(64); reseal(changed, sequence);
      await assert.rejects(replayRecordedLifecycle({ ...input, events: changed }), /request/u);
    });
  }
  for (const sequence of [3, 13, 31]) {
    await context.test(`admission${String(sequence)} cannot bind a different bridge lease`, async () => {
      const changed = structuredClone(events); bag(bag(changed[sequence - 1]?.data)["bridgeDispatch"])["leaseId"] = "x".repeat(43); reseal(changed, sequence);
      await assert.rejects(replayRecordedLifecycle({ ...input, events: changed }), /Recorded native capture refused/u);
    });
  }
  for (const sequence of [4, 14, 32, 7, 23, 39]) {
    await context.test(`phase${String(sequence)} complete producer envelope rejects extra fields`, async () => {
      const changed = structuredClone(events); const selected = changed[sequence - 1]; assert.ok(selected !== undefined);
      bag(selected.data)["extra"] = true; Object.assign(selected, { dataSha256: sha256Json(selected.data) });
      await assert.rejects(replayRecordedLifecycle({ ...input, events: changed }), /complete admission result|complete close intent/u);
    });
  }
  for (const [sequence, container, field] of [[7, "intent", "preparedAt"], [9, "proof", "closedAt"], [41, "proof", "closedAt"]] as const) {
    await context.test(`phase${String(sequence)} checks the exact native calendar before later bindings`, async () => {
      const changed = structuredClone(events); const data = bag(changed[sequence - 1]?.data); const value = bag(data[container]);
      value[field] = "2026-02-30T12:00:00.000Z";
      const key = container === "intent" ? "closeIntentSha256" : "proofSha256";
      value[key] = sha256Json(Object.fromEntries(Object.entries(value).filter(([name]) => name !== key)));
      await assert.rejects(replayRecordedLifecycle({ ...input, events: changed }), /native timestamp calendar invalid/u);
    });
  }
  for (const selected of ["edit-open", "verify-open"] as const) {
    const sequence = selected === "edit-open" ? 17 : 35;
    const navigation = await recordedNavigationBinding(journal, events, selected); assert.equal(navigation["phase"], selected);
    for (const field of ["codeSha256", "libraryHeaderEvidence", "unexpected"]) {
      await context.test(`${selected} exact producer field ${field}`, async () => {
        const changed = structuredClone(events); bag(changed[sequence - 1]?.data)[field] = field === "codeSha256" ? "0".repeat(64) : {};
        reseal(changed, sequence);
        await assert.rejects(recordedNavigationBinding(journal, changed, selected), /full fixed navigation request/u);
      });
    }
  }
  for (const field of ["codeSha256", "sameOriginalClockWindow", "unexpected"]) {
    await context.test(`writer exact producer field ${field}`, () => {
      const changed = structuredClone(events); bag(changed[20]?.data)[field] = field === "codeSha256" ? "0".repeat(64) : false; reseal(changed, 21);
      assert.throws(() => reconstructRecordedWrite({ journal, events: changed, witness: original.edit.witness, preparation: sql.preparation }), /fixed write request/u);
    });
  }
  for (const field of ["runtimePid", "socketOwnerPid", "unexpected"]) {
    await context.test(`saved-read exact native clock base ${field}`, async () => {
      const changed = structuredClone(events); bag(bag(phaseData(changed, 37)["clock"])["base"])[field] = 999;
      reseal(changed, 37); await assert.rejects(reconstructRecordedSavedRead({ ...saved, events: changed }), /Recorded native capture refused/u);
    });
  }
  for (const field of ["codeSha256", "rawLimit", "unexpected"]) {
    await context.test(`saved-read fixed producer field ${field}`, async () => {
      const changed = structuredClone(events); bag(changed[36]?.data)[field] = field === "codeSha256" ? "0".repeat(64) : 1; reseal(changed, 37);
      await assert.rejects(reconstructRecordedSavedRead({ ...saved, events: changed }), /saved-read fixed request/u);
    });
  }
  assert.deepEqual(f.events, nativeCalls);
});
