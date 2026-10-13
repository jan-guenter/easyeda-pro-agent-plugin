/** Synthetic-only regression: a caller-supplied verifier cannot authorize a plan. */
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { sha256Json } from "../src/core.ts";
import { installSyntheticNativeProfile } from "./helpers/install-synthetic-native-profile.ts";
// oxlint-disable-next-line node/no-top-level-await -- Install this exact worker-local prerequisite mock before loading the real stage graph.
const profile = await installSyntheticNativeProfile();
after(() => { profile.unregister(); });
// oxlint-disable-next-line node/no-top-level-await -- Consumer imports follow the synthetic prerequisite hook; issuer modules stay unchanged.
const { ClosedSymbolWriteStage } = await import("../src/closed-symbol-write.ts");
// oxlint-disable-next-line node/no-top-level-await -- Load the actual stage fixture after its worker-local prerequisite mock.
const { writeFixture } = await import("./helpers/closed-symbol-write-fixture.ts");

void test("substituted preparation verifier cannot admit an out-of-plan title", async (context) => {
  const fixture = await writeFixture(context);
  const metadataPlan = { ...fixture.preparation.metadataPlan, desiredTitle: "Synthetic title not in the sealed operation" };
  assert.notEqual(metadataPlan.desiredTitle, fixture.preparation.metadataPlan.desiredTitle);
  const { preparedSqlPlanSha256: oldHash, ...originalBody } = fixture.preparation;
  assert.equal(typeof oldHash, "string");
  const body = { ...originalBody, metadataPlan, metadataPlanSha256: sha256Json(metadataPlan) };
  const forged = { ...body, preparedSqlPlanSha256: sha256Json(body) };
  context.mock.method(fixture.sql, "assertOriginalPreparation", () => forged);
  const upstream = fixture.engine.upstream;
  const originalCall = upstream.callTool;
  let forbiddenCodeObserved = false;
  context.mock.method(upstream, "callTool", (...args: Parameters<typeof originalCall>): Promise<Awaited<ReturnType<typeof originalCall>>> => {
    const code = args[1]?.["code"];
    if (typeof code === "string" && code.includes("WORKER_TICKET_DRIFT")) {
      forbiddenCodeObserved = code.includes(JSON.stringify(metadataPlan.desiredTitle));
    }
    return originalCall.call(upstream, ...args);
  });
  const status = await fixture.engine.status();
  const writer = new ClosedSymbolWriteStage(fixture.engine, fixture.runtime, fixture.admission, fixture.relaunch, fixture.sql, status.stableFingerprint);
  try {
    await assert.rejects(writer.write({ ...fixture.writeInput, preparation: forged }), /original|preparation/u);
  } finally {
    // These assertions also expose dispatch if an implementation rejects only afterward.
    assert.equal(forbiddenCodeObserved, false);
    assert.equal(fixture.writeState.calls, 0);
  }
});
