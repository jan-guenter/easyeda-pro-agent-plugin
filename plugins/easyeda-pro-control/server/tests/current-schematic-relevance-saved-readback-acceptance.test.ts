/** Synthetic issuer joins, not connected saved/reopened validation. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { acceptanceFixture } from "./helpers/schematic-saved-acceptance-fixture.ts";

void test("final original receipt joins preserve earlier false flags and reject copied acceptance", async () => {
  const f = await acceptanceFixture(), value = f.accept(...f.inputs);
  assert.equal(value.persistenceVerified, true); assert.equal(value.reopenedVerified, true);
  assert.equal(value.executionAuthorized, false); assert.equal(value.writerAuthority, false);
  assert.equal(f.accept(...f.inputs), value); assert.equal(f.require(value, f.inputs[0]), value);
  assert.equal(f.earlier.persistenceVerified, false); assert.equal(f.earlier.reopenedVerified, false);
  assert.equal(Object.isFrozen(value), true); assert.throws(() => f.require({ ...value }, f.inputs[0]));
  const foreign = await acceptanceFixture(); assert.throws(() => foreign.require(value, foreign.inputs[0]));
});
void test("missing original close or helper release and foreign scene identities refuse final acceptance", async () => {
  for (const failure of ["normal-close", "helper-release", "scene"] as const) {
    const f = await acceptanceFixture();
    if (failure === "normal-close") { f.state.normalClose = false; }
    if (failure === "helper-release") { f.state.released = false; }
    if (failure === "scene") { f.state.sceneTextId = "foreign"; }
    assert.throws(() => f.accept(...f.inputs));
    assert.equal(f.earlier.persistenceVerified, false); assert.equal(f.earlier.reopenedVerified, false);
  }
});
void test("copies of each constituent original receipt cannot replace the five joined references", async () => {
  const f = await acceptanceFixture();
  const accepted = f.accept(...f.inputs);
  const [owner, cold, origin, scene, closed] = f.inputs;
  for (const run of [
    (): ReturnType<typeof f.accept> => f.accept(owner, { ...cold }, origin, scene, closed),
    (): ReturnType<typeof f.accept> => f.accept(owner, cold, { ...origin }, scene, closed),
    (): ReturnType<typeof f.accept> => f.accept(owner, cold, origin, { ...scene }, closed),
    (): ReturnType<typeof f.accept> => f.accept(owner, cold, origin, scene, { ...closed }),
  ]) { assert.throws(run); }
  assert.equal(f.require(accepted, f.inputs[0]), accepted);
});
