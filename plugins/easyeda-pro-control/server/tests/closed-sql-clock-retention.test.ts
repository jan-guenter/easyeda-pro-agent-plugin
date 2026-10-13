import assert from "node:assert/strict";
import { after, test } from "node:test";
import { isRecord, sha256Json } from "../src/core.ts";
import { compareClosedSymbolClockData } from "../src/closed-sql-clock.ts";
import { readWitnessClockArtifact } from "../src/closed-sql-bindings.ts";
import { loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";
import { installSyntheticNativeProfile } from "./helpers/install-synthetic-native-profile.ts";

// oxlint-disable-next-line node/no-top-level-await -- Install the exact worker-local prerequisite before loading consumers.
const profile = await installSyntheticNativeProfile();
after(() => { profile.unregister(); });
// oxlint-disable-next-line node/no-top-level-await -- Load original issuers only after the worker-local synthetic profile hook.
const { reopenForSqlComparison, sqlStageFixture } = await import("./helpers/closed-symbol-sql-fixture.ts");

void test("closed SQL retains the original termination clock for data-only historical replay", async (context) => {
  const fixture = await sqlStageFixture(context);
  const reopened = await reopenForSqlComparison(fixture);
  await fixture.sql.compareVerification(reopened.input);
  const loaded = await loadClosedSymbolJournal(fixture.journal.operationId);
  const editRequest = loaded.events.find((event) => event.step === "edit-sql-compare" && event.kind === "intent");
  const verificationRequest = loaded.events.find((event) => event.step === "verify-sql-compare" && event.kind === "intent");
  assert.ok(isRecord(editRequest?.data)); assert.ok(isRecord(verificationRequest?.data));
  assert.equal(verificationRequest.data["terminationObservation"], null);
  assert.equal(verificationRequest.data["clockRelation"], null);
  const relation = editRequest.data["clockRelation"], termination = editRequest.data["terminationObservation"];
  assert.ok(isRecord(relation)); assert.ok(isRecord(termination));
  assert.equal(relation["terminationObservationSha256"], sha256Json(termination));
  const qualification = await readWitnessClockArtifact(fixture.journal.operationId, fixture.witness.clockArtifact, fixture.witness.clockArtifact.sha256);
  // Cloned data can reproduce the relation without acquiring an original token.
  const recorded = structuredClone({ operationId: fixture.journal.operationId, generation: fixture.witness.generation,
    witnessArtifactSha256: fixture.witness.artifactSha256, witness: fixture.witness.witness, qualification, proof: fixture.proof, termination });
  assert.deepEqual(compareClosedSymbolClockData(recorded), relation);
  assert.throws(() => compareClosedSymbolClockData({ ...recorded, termination: undefined }), /clock qualification refused/u);
  assert.equal(loaded.journal.saved, false); assert.equal(fixture.writeState.calls, 1);
});
