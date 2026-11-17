/** The actual2002-call stock schedule must fit the real full resource ledger
 * without spending cleanup slots for its planned normal debugger resumes. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentMainStartupLibraryV2Schedule } from "../src/current-main-startup-library-v2-profile.ts";
import { CurrentFootprintCopyForwardResourceLedger } from "../src/current-footprint-copy-forward-capacity.ts";
import { currentFootprintForwardWriterPlannedMainCleanup } from "../src/current-footprint-forward-writer-main-class.ts";
import { currentFootprintForwardWriterProfile } from "../src/current-footprint-forward-writer-profile.ts";

void test("the complete original stock schedule preserves the full writer cleanup reservation", () => {
  const ledger = new CurrentFootprintCopyForwardResourceLedger("forward-writer-v1"), owner = Object.freeze({}); ledger.bind("forward-writer", owner);
  const schedule = new CurrentMainStartupLibraryV2Schedule(); let id = 0;
  const send = (suffix: string): void => {
    const phase = `sql-stock-v2-${suffix}`; schedule.consume(phase); id += 1;
    const cleanup = currentFootprintForwardWriterPlannedMainCleanup("main-send", phase); assert.equal(cleanup, false);
    ledger.consumeRequest("forward-writer", owner, "main", id, cleanup);
  };
  for (const suffix of ["raw", "captured", "caller", "frame", "bind", "points", "arm"]) { send(suffix); }
  for (let call = 0; call < 332; call += 1) {
    for (const suffix of ["select", "require", "resume"]) { send(suffix); }
    if (call < 331) { for (const suffix of ["raw", "captured", "caller"]) { send(suffix); } }
  }
  for (const suffix of ["return-frame", "return-properties", "return", "remove", "require", "resume"]) { send(suffix); }
  assert.equal(schedule.complete, true); assert.equal(id, 2002);
  for (let cleanup = 0; cleanup < currentFootprintForwardWriterProfile().main.cleanupRequestLimit; cleanup += 1) { id += 1; ledger.consumeRequest("forward-writer", owner, "main", id, true); }
  assert.throws(() => { ledger.consumeRequest("forward-writer", owner, "main", id + 1, true); }, /MAIN_REQUEST/u);
  assert.equal(currentFootprintForwardWriterPlannedMainCleanup("main-send", "sql-fence-startup-config-resume"), false);
  for (const phase of ["points", "arm", "frame", "proof", "remove-return", "remove-failure", "require", "resume", "disarm-normal"]) {
    assert.equal(currentFootprintForwardWriterPlannedMainCleanup("main-send", `sql-stock-readonly-${phase}`), false);
  }
  assert.equal(currentFootprintForwardWriterPlannedMainCleanup("main-send", "resume"), null);
  assert.equal(currentFootprintForwardWriterPlannedMainCleanup("footprint-forward-initial-history", "inverse-main-history-step"), false);
  assert.equal(currentFootprintForwardWriterPlannedMainCleanup("footprint-forward-initial-history", "inverse-main-history-release"), true);
});
