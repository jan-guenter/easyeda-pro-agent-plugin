import assert from "node:assert/strict";
import { after, test } from "node:test";
import { loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";
import { installSyntheticNativeProfile } from "./helpers/install-synthetic-native-profile.ts";
// oxlint-disable-next-line node/no-top-level-await -- Install this exact worker-local prerequisite mock before loading the real stage graph.
const profile = await installSyntheticNativeProfile();
after(() => { profile.unregister(); });
// oxlint-disable-next-line node/no-top-level-await -- Load the actual stage fixture after its worker-local prerequisite mock.
const { witnessFixture } = await import("./helpers/closed-symbol-witness-fixture.ts");

void test("release-method drift cannot redirect cleanup to a replacement function", async (context) => {
  const f = await witnessFixture(context); let wrongCleanup = 0;
  f.state.afterWitness = (): void => {
    context.mock.method(f.engine, "releaseClosedSessionAuthority", (): Promise<void> => { wrongCleanup += 1; return Promise.resolve(); });
  };
  await assert.rejects(f.stage.collect(f.input), /retained authority or clock issuer changed/u);
  assert.equal(wrongCleanup, 0); assert.equal(f.state.witnessCalls, 1);
  assert.strictEqual(f.stage.originalReturn(f.journal.operationId), f.state.returned);
  const capture = f.stage.originalClockCapture(f.journal.operationId, "before"); assert.ok(capture !== undefined);
  assert.equal(f.owner.requests.filter((request) => request["action"] === "release-capture" && request["captureBindingSha256"] === capture.executionAuthority.bindingSha256).length, 1);
  const loaded = await loadClosedSymbolJournal(f.journal.operationId); assert.equal(loaded.events.at(-1)?.kind, "result");
});
