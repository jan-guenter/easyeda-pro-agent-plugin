/** Real complete coordinator admission and private result registry. These
 * refusal checks allocate no native owner and prove no connected execution. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentFootprintCopyMainBackendRunner } from "../src/current-footprint-copy-main-backend-runner.ts";
import { CurrentFootprintForwardWriterPairedScheduler, requireOriginalCurrentFootprintForwardWriterSavedContinuation } from "../src/current-footprint-forward-writer-paired-scheduler.ts";

void test("complete paired admission refuses substituted backends before supplied getters or requests", () => {
  let accesses = 0;
  const proxy = new Proxy({}, { get: (): never => { accesses += 1; throw new Error("foreign access"); } });
  assert.throws(() => Reflect.construct(CurrentFootprintForwardWriterPairedScheduler, [proxy, {}, {}, {}]), /ORIGINAL_BACKEND/u);
  const lookalike = {};
  Object.setPrototypeOf(lookalike, CurrentFootprintCopyMainBackendRunner.prototype);
  Object.defineProperty(lookalike, "requireForwardWriterRequestOrigin", { get: (): never => { accesses += 1; throw new Error("substituted method"); } });
  assert.throws(() => Reflect.construct(CurrentFootprintForwardWriterPairedScheduler, [lookalike, {}, {}, {}]), /ORIGINAL_BACKEND/u);
  assert.equal(accesses, 0);
});
void test("complete cold continuation rejects copied result claims before supplied native owner getters", () => {
  let accesses = 0;
  const owner = new Proxy({}, { get: (): never => { accesses += 1; throw new Error("foreign owner"); } });
  const packet = Object.freeze({ profile: "private.current-footprint-forward-writer-paired-observation.v1", originalTimerTailJoined: true,
    exactOriginalCreateReplyJoined: true, clocks: {}, main: {}, timer: {} });
  assert.throws(() => Reflect.apply(requireOriginalCurrentFootprintForwardWriterSavedContinuation, undefined, [packet, owner]), /ORIGINAL_CLOSED_SAVED_CONTINUATION/u);
  assert.equal(accesses, 0);
});
