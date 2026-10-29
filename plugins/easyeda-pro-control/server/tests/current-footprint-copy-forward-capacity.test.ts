/** Fixed source-derived ceilings and counters only. No native owner is born,
 * no eligibility proof is issued and no live two-generation copy is claimed. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY as CAPACITY,
  CurrentFootprintCopyForwardResourceLedger as Ledger } from "../src/current-footprint-copy-forward-capacity.ts";
import { CURRENT_FOOTPRINT_COPY_ALLOCATED_CREATE_CLOCK_BUDGET as ALLOCATION } from "../src/current-footprint-copy-allocated-create-clock-budget.ts";
import { CURRENT_FOOTPRINT_COPY_PREPARATION_REQUESTS as SOURCE_PREPARATION } from "../src/current-footprint-copy-preparation.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_REQUESTS as SOURCE } from "../src/current-footprint-copy-source-read-runner.ts";
import { CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE as EXISTING } from "../src/current-footprint-copy-execution-profile.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_KNOWN_CAPACITY as MAIN } from "../src/current-footprint-copy-main-capacity.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_TRANSPORT as MAIN_STREAM } from "../src/current-footprint-copy-main-transport-contract.ts";
import { CURRENT_PCB_WORKER_STARTUP_STREAM_LIMITS as STREAM } from "../src/current-pcb-worker-startup-stream-limits.ts";

void test("forward ceiling separates two generations, normal classes and global IDs", () => {
  assert.deepEqual(CAPACITY.generations, ["forward-writer", "forward-saved-readback"]);
  assert.equal(CAPACITY.writer.renderer.normalClassLimit, 926);
  assert.equal(CAPACITY.writer.renderer.cleanupClassLimit, 61);
  assert.equal(CAPACITY.writer.renderer.normalClassLimit, EXISTING.normalRequestLimit - EXISTING.requests.transactionClock +
    ALLOCATION.normal + SOURCE + SOURCE_PREPARATION);
  assert.equal(CAPACITY.writer.renderer.cleanupClassLimit, EXISTING.requests.cleanup - 5 + ALLOCATION.cleanup);
  assert.equal(CAPACITY.writer.renderer.requestLimit, 987);
  assert.equal(CAPACITY.writer.renderer.normalIdCeiling, 987);
  assert.equal(CAPACITY.writer.renderer.stages.allocatedCreateClockTotal, 78);
  assert.equal(CAPACITY.writer.main.requestLimit, MAIN.minimumTotal);
  assert.equal(CAPACITY.writer.main.requestLimit, 127);
  assert.equal(EXISTING.normalRequestLimit, 802); assert.equal(EXISTING.requestLimit, 847);
  assert.equal(CAPACITY.nativePurposeMounted, false); assert.equal(CAPACITY.inverseAvailable, false);
  assert.equal(CAPACITY.wholeFourGenerationBudgetReserved, false); assert.equal(CAPACITY.executionAuthorized, false);
  const writerMinimumStdout = 4 * Math.ceil((STREAM.receivedBytes + MAIN_STREAM.totalReceivedBytes) / 3) +
    4 * (CAPACITY.writer.renderer.polls + MAIN_STREAM.totalPolls) +
    (CAPACITY.writer.renderer.polls + MAIN_STREAM.totalPolls + 987 + 127 + CAPACITY.controls.perGeneration) * CAPACITY.controls.replyHeaderBytes;
  assert.ok(CAPACITY.writer.helperStdoutBytes >= writerMinimumStdout);
  assert.ok(CAPACITY.controls.perGeneration > CAPACITY.controls.terminationObservationsPerGeneration +
    CAPACITY.controls.releaseObservationsPerGeneration + CAPACITY.controls.normalCloseAttemptsPerGeneration + 1);
  assert.equal(CAPACITY.output.retainedBytes, CAPACITY.output.artifactBytes + CAPACITY.output.journalBytes);
});

void test("normal request IDs remain usable after reserved interleaved cleanup", () => {
  const ledger = new Ledger(), owner = Object.freeze({}), saved = Object.freeze({});
  ledger.bind("forward-writer", owner); ledger.bind("forward-saved-readback", saved);
  assert.throws(() =>{  ledger.bind("forward-writer", {}); }, /GENERATION/u);
  assert.throws(() =>{  ledger.consumeRequest("forward-writer", { ...owner }, "renderer", 1, false); }, /ORIGINAL_GENERATION/u);
  for (let id = 1; id <= CAPACITY.writer.renderer.cleanupClassLimit; id += 1) {
    ledger.consumeRequest("forward-writer", owner, "renderer", id, true);
  }
  for (let id = 62; id <= 987; id += 1) { ledger.consumeRequest("forward-writer", owner, "renderer", id, false); }
  assert.equal(ledger.status().rendererRequests, 987); assert.equal(ledger.status().failed, false);
  assert.throws(() =>{  ledger.consumeRequest("forward-writer", owner, "renderer", 988, false); }, /RENDERER_REQUEST/u);
  assert.equal(ledger.status().failed, true);
  assert.throws(() =>{  ledger.consumeRequest("forward-saved-readback", saved, "renderer", 1, false); }, /REQUEST_CLASS/u);
  ledger.consumeRequest("forward-saved-readback", saved, "renderer", 1, true);
  assert.throws(() =>{  ledger.consumeControl("forward-writer", owner); }, /CONTROL_CLASS/u);
  ledger.consumeControl("forward-writer", owner, true);
  assert.equal(ledger.status().failed, true); assert.equal(ledger.status().executionAuthorized, false);
});

void test("aggregate artifact limits cannot be spent once per generation", () => {
  const ledger = new Ledger(), saved = Object.freeze({}), writer = Object.freeze({});
  ledger.bind("forward-writer", writer); ledger.bind("forward-saved-readback", saved);
  ledger.consumeBytes("forward-writer", writer, "artifact", CAPACITY.output.artifactBytes - 1);
  ledger.consumeBytes("forward-saved-readback", saved, "artifact", 1);
  assert.throws(() =>{  ledger.consumeBytes("forward-saved-readback", saved, "artifact", 1); }, /BYTES/u);
  ledger.consumeBytes("forward-writer", writer, "journal", CAPACITY.output.journalBytes);
  assert.throws(() =>{  ledger.consumeBytes("forward-saved-readback", saved, "journal", 1); }, /BYTES/u);
  const main = new Ledger(); main.bind("forward-writer", writer);
  for (let id = 1; id <= CAPACITY.writer.main.cleanupClassLimit; id += 1) { main.consumeRequest("forward-writer", writer, "main", id, true); }
  for (let id = 42; id <= 127; id += 1) { main.consumeRequest("forward-writer", writer, "main", id, false); }
  assert.equal(main.status().mainRequests, 127); assert.equal(main.status().failed, false);
  assert.throws(() =>{  main.consumeRequest("forward-writer", writer, "main", 128, true); }, /MAIN_REQUEST/u);
});
