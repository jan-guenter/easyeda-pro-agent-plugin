/** Fixed graph/counter and genuine factory refusals. No helper, Job, app or
 * original native owner is allocated by these source regressions. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentFootprintCopyForwardResourceLedger, CURRENT_FOOTPRINT_FORWARD_EXECUTION_CAPACITY as PREVIOUS } from "../src/current-footprint-copy-forward-capacity.ts";
import { currentFootprintForwardWriterProfile } from "../src/current-footprint-forward-writer-profile.ts";
import { currentFootprintForwardExecutionStartupWire, currentFootprintForwardWriterStartupWire } from "../src/current-pcb-worker-startup-wire.ts";
import { CurrentFootprintForwardWriterNativeOwner, assertOriginalCurrentFootprintForwardExecutionNativeOwner, assertOriginalCurrentFootprintForwardWriterNativeOwner } from "../src/current-pcb-diagnostic-owner.ts";

void test("separate writer derivation accounts fixed Main/head/age and producer stages without issuing continuation", () => {
  const profile = currentFootprintForwardWriterProfile();
  assert.equal(profile, currentFootprintForwardWriterProfile());
  assert.deepEqual(profile.main, { normalRequestLimit: 3078, cleanupRequestLimit: 57, ordinaryNormalRequestLimit: 1076, stockRequestLimit: 2002, requestLimit: 3135 });
  assert.equal(profile.renderer.normalClassLimit, 2479 + profile.stages.frontier.rendererCommands); assert.equal(profile.renderer.cleanupClassLimit, 70);
  assert.equal(profile.renderer.requestLimit, profile.renderer.normalClassLimit + profile.renderer.cleanupClassLimit);
  assert.equal(profile.stages.producer.normal + profile.stages.guards.normal, 950);
  assert.equal(profile.stages.clockPreparation.normal, 243); assert.equal(profile.saved.renderer.requestLimit, 363);
  assert.equal(profile.wholeWriterReserved, false); assert.equal(profile.executionAuthorized, false); assert.equal(profile.saveAuthorized, false);
  assert.equal(PREVIOUS.writer.main.requestLimit, 128); assert.equal(PREVIOUS.writer.renderer.requestLimit, 1175);
});
void test("new original ledger charges physical classes while old v2 remains bounded at128", () => {
  const owner = Object.freeze({}), profile = currentFootprintForwardWriterProfile();
  const ledger = new CurrentFootprintCopyForwardResourceLedger("forward-writer-v1"); ledger.bind("forward-writer", owner);
  assert.throws(() => { ledger.bind("forward-saved-readback", {}); }, /GENERATION/u);
  for (let id = 1; id <= profile.main.cleanupRequestLimit; id += 1) { ledger.consumeRequest("forward-writer", owner, "main", id, true); }
  for (let id = profile.main.cleanupRequestLimit + 1; id <= profile.main.requestLimit; id += 1) { ledger.consumeRequest("forward-writer", owner, "main", id, false); }
  assert.equal(ledger.generationStatus("forward-writer", owner).mainRequests, 3135);
  assert.throws(() => { ledger.consumeRequest("forward-writer", owner, "main", 3136, false); }, /MAIN_REQUEST/u);
  const old = new CurrentFootprintCopyForwardResourceLedger("forward-execution-v2"); old.bind("forward-writer", owner);
  for (let id = 1; id <= 41; id += 1) { old.consumeRequest("forward-writer", owner, "main", id, true); }
  for (let id = 42; id <= 128; id += 1) { old.consumeRequest("forward-writer", owner, "main", id, false); }
  assert.throws(() => { old.consumeRequest("forward-writer", owner, "main", 129, false); }, /MAIN_REQUEST/u);
});
void test("fixed preparation rebasing cannot widen the old wire or admit arbitrary caller programs", () => {
  const command = { method: "Runtime.enable", sessionId: "original-worker", params: {} };
  const ceiling = currentFootprintForwardWriterProfile().renderer.requestLimit;
  assert.equal(currentFootprintForwardWriterStartupWire(command, ceiling).request["requestId"], ceiling);
  assert.throws(() => currentFootprintForwardWriterStartupWire(command, ceiling + 1));
  assert.throws(() => currentFootprintForwardExecutionStartupWire(command, 1176));
  assert.throws(() => currentFootprintForwardWriterStartupWire({ method: "Runtime.evaluate", params: { expression: "caller-program" } }, 1));
});
void test("copied prototype and data labels cannot issue either original factory proof", () => {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Test double deliberately bypasses allocation to exercise the real factory/prototype refusals; no production proof is substituted.
  const copied = Object.create(CurrentFootprintForwardWriterNativeOwner.prototype) as CurrentFootprintForwardWriterNativeOwner;
  assert.throws(() => { assertOriginalCurrentFootprintForwardWriterNativeOwner(copied); }, /FORWARD_WRITER_ORIGINAL_BIRTH/u);
  assert.throws(() => { assertOriginalCurrentFootprintForwardExecutionNativeOwner(copied); }, /FORWARD_EXECUTION_ORIGINAL_BIRTH/u);
});
