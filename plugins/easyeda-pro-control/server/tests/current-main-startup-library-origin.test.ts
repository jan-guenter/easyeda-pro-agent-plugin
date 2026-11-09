/** Real origin registry refusal. No bootstrap/native actor is allocated. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { enrollOriginalCurrentMainStartupLibrary, sendOriginalCurrentMainStartupLibrary } from "../src/current-pcb-diagnostic-owner.ts";

void test("copied bootstrap/origin packets cannot enroll or send stock commands, without inspecting a foreign runner", async () => {
  let hooks = 0; const trap = (): never => { hooks += 1; throw new Error("foreign object"); };
  const runner = new Proxy({}, { get: trap, ownKeys: trap, getOwnPropertyDescriptor: trap });
  const bootstrap = { profile: "private.selected-file-main-sql-fence-bootstrap.v1", executionAuthorized: false };
  const origin = { profile: "private.current-main-startup-library-origin.v1", executionAuthorized: false };
  assert.throws(() => { Reflect.apply(enrollOriginalCurrentMainStartupLibrary, undefined, [bootstrap, runner]); });
  await assert.rejects(async () => { await Reflect.apply(sendOriginalCurrentMainStartupLibrary, undefined, [bootstrap, runner, origin, {}, 1]); });
  assert.equal(hooks, 0);
});
