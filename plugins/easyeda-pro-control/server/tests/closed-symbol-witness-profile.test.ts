/** The prerequisite is synthetic; all witness/copy/clock issuers stay unchanged. */
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { installSyntheticNativeProfile } from "./helpers/install-synthetic-native-profile.ts";
// oxlint-disable-next-line node/no-top-level-await -- Exact fixture replacement must precede dynamic imports of its consumers.
const profile = await installSyntheticNativeProfile();
// oxlint-disable-next-line node/no-top-level-await -- Load the real stage graph once after the synthetic prerequisite hook.
const { witnessFixture } = await import("./helpers/closed-symbol-witness-fixture.ts");
after(() => { profile.unregister(); });

void test("portable collector checks synthetic prerequisite while preserving real pin metadata", async (context) => {
  const before = profile.fixture.syntheticProfileCalls().length;
  assert.strictEqual(profile.fixture.WITNESS_NATIVE_PINS, profile.original.WITNESS_NATIVE_PINS);
  assert.equal(profile.fixture.WITNESS_NATIVE_PINS_SHA256, profile.original.WITNESS_NATIVE_PINS_SHA256);
  const f = await witnessFixture(context), result = await f.stage.collect(f.input);
  assert.equal(result.executionAuthorized, false); assert.equal(f.state.witnessCalls, 1);
  const calls = profile.fixture.syntheticProfileCalls().slice(before); assert.equal(calls.length, 2);
  assert.deepEqual(calls, ["/synthetic/easyeda/resources/app/assets", "/synthetic/easyeda/resources/app/assets"]);
});
void test("portable collector cannot issue after synthetic native prerequisite refusal", async (context) => {
  const f = await witnessFixture(context); profile.fixture.refuseSyntheticProfile(true);
  try { await assert.rejects(f.stage.collect(f.input), /Synthetic native-profile prerequisite refused/u); assert.equal(f.state.witnessCalls, 0); }
  finally { profile.fixture.refuseSyntheticProfile(false); }
});
void test("synthetic profile refuses a real-machine root and does not replace the original verifier", async () => {
  await assert.rejects(profile.fixture.verifyWitnessNativeProfile("/mnt/c/Program Files/easyeda-pro/resources/app/assets"), /Synthetic native-profile/u);
  await assert.rejects(profile.original.verifyWitnessNativeProfile("/synthetic/easyeda/resources/app/assets"));
});
