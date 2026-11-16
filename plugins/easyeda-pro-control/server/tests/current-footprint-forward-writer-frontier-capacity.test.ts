/** The new finite component must fit its real managed publication reserve
 * and actual full renderer ledger without changing historical event limits. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_FRONTIER_BUDGET as JOURNAL } from "../src/current-footprint-forward-writer-startup-frontier-contract.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_FRONTIER_REQUESTS as FRONTIER } from "../src/current-footprint-forward-writer-frontier-budget.ts";
import { CurrentFootprintCopyForwardResourceLedger, CURRENT_FOOTPRINT_FORWARD_EXECUTION_CAPACITY as PREVIOUS } from "../src/current-footprint-copy-forward-capacity.ts";
import { currentFootprintForwardWriterProfile } from "../src/current-footprint-forward-writer-profile.ts";

void test("the complete frontier fits separate publication and renderer event reservations while old V2 remains exact", () => {
  const full = currentFootprintForwardWriterProfile();
  assert.equal(FRONTIER.rendererCommands, JOURNAL.rendererRequests); assert.equal(FRONTIER.artifactBytes, JOURNAL.normalBytes + JOURNAL.cleanupBytes); assert.equal(FRONTIER.journalBytes, JOURNAL.manifestBytes);
  assert.equal(full.output.artifactBytes, PREVIOUS.output.artifactBytes + FRONTIER.artifactBytes); assert.equal(full.output.journalBytes, PREVIOUS.output.journalBytes + FRONTIER.journalBytes);
  assert.equal(full.wholeWriterReserved, false); assert.equal(full.executionAuthorized, false); assert.equal(PREVIOUS.writer.renderer.eventCount, 4096);
  const ledger = new CurrentFootprintCopyForwardResourceLedger("forward-writer-v1"), original = Object.freeze({}); ledger.bind("forward-writer", original);
  for (let index = 0; index < full.renderer.eventCount; index += 1) { ledger.consumeRendererEvent("forward-writer", original, 1); }
  assert.throws(() => { ledger.consumeRendererEvent("forward-writer", original, 1); }, /RENDERER_EVENT/u);
  const old = new CurrentFootprintCopyForwardResourceLedger("forward-execution-v2"), oldOwner = Object.freeze({}); old.bind("forward-writer", oldOwner);
  for (let index = 0; index < 4096; index += 1) { old.consumeRendererEvent("forward-writer", oldOwner, 1); }
  assert.throws(() => { old.consumeRendererEvent("forward-writer", oldOwner, 1); }, /RENDERER_EVENT/u);
});
