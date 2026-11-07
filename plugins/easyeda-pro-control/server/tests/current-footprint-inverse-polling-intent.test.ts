/** Exercise the actual private origin/factory refusal before untrusted data
 * can be touched. No native owner or app is allocated by these tests. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { consumeCurrentFootprintInversePollingIntent, enrollCurrentFootprintInversePollingIntent, requireOriginalCurrentFootprintInversePollingIntent } from "../src/current-footprint-inverse-polling-intent.ts";
import { CurrentFootprintInverseNativeOwner } from "../src/current-footprint-inverse-native-owner.ts";
import { CURRENT_FOOTPRINT_INVERSE_TIMER_REQUESTS } from "../src/current-footprint-inverse-timer-budget.ts";
import { currentProjectSyncQuiesceNativeCases } from "../src/current-project-sync-quiesce-protocol.ts";

void test("serialized inverse timer brands and copied native prototypes cannot issue or consume an intent", () => {
  let calls = 0; const trap = (): never => { calls += 1; throw new Error("caller getter"); };
  const token = Object.freeze({ profile: "private.current-footprint-inverse-polling-cancellation-intent.v1" });
  const fake = Object.defineProperty({}, "prepared", { get: trap });
  const proxy = new Proxy({}, { get: trap, getPrototypeOf: trap });
  for (const candidate of [fake, proxy, Object.create(CurrentFootprintInverseNativeOwner.prototype)]) {
    // oxlint-disable-next-line typescript/unbound-method -- Apply the actual method to deliberately invalid receivers to exercise its private factory gate.
    assert.throws(() => Reflect.apply(CurrentFootprintInverseNativeOwner.prototype.prepareFootprintInversePollingCancellationIntent, candidate, []));
    for (const consumer of [consumeCurrentFootprintInversePollingIntent, enrollCurrentFootprintInversePollingIntent, requireOriginalCurrentFootprintInversePollingIntent]) {
      assert.throws(() => Reflect.apply(consumer, undefined, [token, candidate, fake]));
    }
  }
  assert.equal(calls, 0);
});
void test("inverse timer reservation follows the exact immutable leaf without a timer selector", () => {
  const commands = currentProjectSyncQuiesceNativeCases(); assert.equal(commands.length, CURRENT_FOOTPRINT_INVERSE_TIMER_REQUESTS.normal);
  assert.equal(commands.filter(command => command.method === "Runtime.callFunctionOn" || command.method === "Debugger.evaluateOnCallFrame").length, CURRENT_FOOTPRINT_INVERSE_TIMER_REQUESTS.helperSources);
  assert.equal(commands.filter(command => command.phase === "sync-quiesce-arm" && command.params.condition.length > 0).length, CURRENT_FOOTPRINT_INVERSE_TIMER_REQUESTS.conditionSources);
  assert.equal(CURRENT_FOOTPRINT_INVERSE_TIMER_REQUESTS.total, 35); assert.equal(CURRENT_FOOTPRINT_INVERSE_TIMER_REQUESTS.controls, 39);
});
