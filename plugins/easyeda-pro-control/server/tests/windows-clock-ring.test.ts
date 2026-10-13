import assert from "node:assert/strict";
import { test } from "node:test";
import { INPUT } from "./helpers/windows-closed-session-fixture.ts";
import { qualifiedClockFixture } from "./helpers/windows-clock-fixture.ts";
import { assertIssuedWindowsClockObservation, windowsClockObservationForResult } from "../src/windows-authority.ts";

void test("more than 64 ordinary completed captures preserve legacy operation availability and original clock", async (context) => {
  const f = await qualifiedClockFixture(context), launch = await f.supervisor.launch({ confirmLaunch: true });
  const original = await windowsClockObservationForResult(launch, "launch");
  for (let index = 1; index <= 80; index += 1) {
    const capture = await f.supervisor.capture({ ...INPUT, bindingSha256: index.toString(16).padStart(64, "0"), challengeAttempt: index });
    const clock = await windowsClockObservationForResult(capture, "capture");
    assert.equal(clock.ownerBinding["challengeAttempt"], index);
    await f.supervisor.releaseCapture(capture);
  }
  assert.strictEqual(await windowsClockObservationForResult(launch, "launch"), original);
  assert.strictEqual(await assertIssuedWindowsClockObservation(original), original);
  assert.equal(f.requests.filter((r) => r["action"] === "clocked-capture").length, 80);
  assert.equal(f.requests.filter((r) => r["action"] === "release-capture").length, 80);
});
