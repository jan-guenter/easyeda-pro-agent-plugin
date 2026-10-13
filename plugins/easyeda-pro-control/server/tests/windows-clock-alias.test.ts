import assert from "node:assert/strict";
import { test } from "node:test";
import { INPUT } from "./helpers/windows-closed-session-fixture.ts";
import { qualifiedClockFixture } from "./helpers/windows-clock-fixture.ts";
import { windowsClockObservationForResult } from "../src/windows-authority.ts";

void test("termination proof alias is frozen scalar-only before clock lookup", async (context) => {
  const f = await qualifiedClockFixture(context), launch = await f.supervisor.launch({ confirmLaunch: true });
  const executionAuthority = await f.supervisor.capture(INPUT);
  const binding = { operationId: INPUT.operationId, phase: INPUT.orphanPhase, challengeAttempt: INPUT.challengeAttempt,
    bridgeSession: INPUT.bridgeSession, runtimeIdentity: INPUT.runtimeIdentity, launch, executionAuthority };
  const intent = await f.supervisor.prepareClosedSessionClose({ ...binding, windowHandle: "12345" });
  const closeReceipt = await f.supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true });
  const proof = await f.supervisor.proveClosedSession({ ...binding, intent, closeReceipt });
  const before = await windowsClockObservationForResult(proof, "termination");
  assert.equal(before.phase, "termination");
  assert.equal(Object.isFrozen(proof), true);
  assert.ok(Object.values(proof).every((value) => value === null || typeof value !== "object"));
  assert.throws(() => Object.assign(proof, { operationId: "other-operation" }), TypeError);
  assert.strictEqual(await windowsClockObservationForResult(proof, "termination"), before);
});
