/** Fixed source-derived ceilings and counters only. No native owner is born,
 * no eligibility proof is issued and no live two-generation copy is claimed. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY as CAPACITY,
  CurrentFootprintCopyForwardResourceLedger as Ledger,
  requireOriginalForwardLedgerBinding } from "../src/current-footprint-copy-forward-capacity.ts";
import { CURRENT_FOOTPRINT_COPY_ALLOCATED_CREATE_CLOCK_BUDGET as ALLOCATION } from "../src/current-footprint-copy-allocated-create-clock-budget.ts";
import { CURRENT_FOOTPRINT_COPY_PREPARATION_REQUESTS as SOURCE_PREPARATION } from "../src/current-footprint-copy-preparation.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_REQUESTS as SOURCE } from "../src/current-footprint-copy-source-read-runner.ts";
import { CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE as EXISTING } from "../src/current-footprint-copy-execution-profile.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_KNOWN_CAPACITY as MAIN } from "../src/current-footprint-copy-main-capacity.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_TRANSPORT as MAIN_STREAM } from "../src/current-footprint-copy-main-transport-contract.ts";
import { CURRENT_PCB_WORKER_STARTUP_STREAM_LIMITS as STREAM } from "../src/current-pcb-worker-startup-stream-limits.ts";

void test("forward ceiling separates two generations, normal classes and global IDs", () => {
  assert.deepEqual(CAPACITY.generations, ["forward-writer", "forward-saved-readback"]);
  assert.equal(CAPACITY.writer.renderer.normalClassLimit, 935);
  assert.equal(CAPACITY.writer.renderer.cleanupClassLimit, 61);
  assert.equal(CAPACITY.writer.renderer.normalClassLimit, EXISTING.normalRequestLimit - EXISTING.requests.transactionClock +
    ALLOCATION.normal + SOURCE + SOURCE_PREPARATION);
  assert.equal(CAPACITY.writer.renderer.cleanupClassLimit, EXISTING.requests.cleanup - 5 + ALLOCATION.cleanup);
  assert.equal(CAPACITY.writer.renderer.requestLimit, 996);
  assert.equal(CAPACITY.writer.renderer.normalIdCeiling, 996);
  assert.equal(CAPACITY.writer.renderer.stages.allocatedCreateClockTotal, 78);
  assert.equal(CAPACITY.writer.main.requestLimit, MAIN.minimumTotal);
  assert.equal(CAPACITY.writer.main.requestLimit, 127);
  assert.equal(EXISTING.normalRequestLimit, 811); assert.equal(EXISTING.requestLimit, 856);
  assert.equal(CAPACITY.nativePurposeMounted, false); assert.equal(CAPACITY.inverseAvailable, false);
  assert.equal(CAPACITY.wholeFourGenerationBudgetReserved, false); assert.equal(CAPACITY.executionAuthorized, false);
  const writerMinimumStdout = 4 * Math.ceil((STREAM.receivedBytes + MAIN_STREAM.totalReceivedBytes) / 3) +
    4 * (CAPACITY.writer.renderer.polls + MAIN_STREAM.totalPolls) +
    (CAPACITY.writer.renderer.polls + MAIN_STREAM.totalPolls + 996 + 127 + CAPACITY.controls.perGeneration) * CAPACITY.controls.replyHeaderBytes;
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
  for (let id = 62; id <= 996; id += 1) { ledger.consumeRequest("forward-writer", owner, "renderer", id, false); }
  assert.equal(ledger.status().rendererRequests, 996); assert.equal(ledger.status().failed, false);
  assert.throws(() =>{  ledger.consumeRequest("forward-writer", owner, "renderer", 997, false); }, /RENDERER_REQUEST/u);
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


void test("renderer poll classes cannot renew or borrow another generation's allowance", () => {
  const ledger = new Ledger(), saved = Object.freeze({}), writer = Object.freeze({});
  ledger.bind("forward-writer", writer); ledger.bind("forward-saved-readback", saved);
  assert.throws(() => { ledger.consumeRendererPoll("forward-writer", {}, "data"); }, /ORIGINAL_GENERATION/u);
  for (const [kind, maximum] of [["data", STREAM.dataPolls], ["idle", STREAM.idlePolls], ["wait", STREAM.waitPolls]] as const) {
    for (let index = 0; index < maximum; index += 1) { ledger.consumeRendererPoll("forward-writer", writer, kind); }
  }
  assert.equal(ledger.status().rendererPolls, CAPACITY.writer.renderer.polls);
  assert.throws(() => { ledger.consumeRendererPoll("forward-writer", writer, "idle"); }, /RENDERER_POLL/u);
  assert.throws(() => { ledger.consumeRendererPoll("forward-saved-readback", saved, "idle"); }, /POLL_CLASS/u);
  ledger.consumeRendererPoll("forward-saved-readback", saved, "idle", true);
  assert.equal(ledger.status().rendererPolls, CAPACITY.writer.renderer.polls + 1);
  assert.throws(() => { ledger.consumeRendererPoll("forward-writer", writer, "wait", true); }, /RENDERER_POLL/u);
  assert.equal(ledger.status().failed, true); assert.equal(ledger.status().executionAuthorized, false);
});

void test("main polls retain their global normal ceiling and separate terminal reserve", () => {
  const ledger = new Ledger(), writer = Object.freeze({}); ledger.bind("forward-writer", writer);
  // Cleanup before normal work still occupies the one native poll cursor.
  ledger.consumeMainPoll("forward-writer", writer, true);
  for (let index = 1; index < MAIN_STREAM.normalPolls; index += 1) { ledger.consumeMainPoll("forward-writer", writer); }
  assert.equal(ledger.status().mainPolls, MAIN_STREAM.normalPolls);
  assert.throws(() => { ledger.consumeMainPoll("forward-writer", writer); }, /MAIN_POLL/u);
  for (let index = MAIN_STREAM.normalPolls; index < MAIN_STREAM.totalPolls; index += 1) { ledger.consumeMainPoll("forward-writer", writer, true); }
  assert.equal(ledger.status().mainPolls, MAIN_STREAM.totalPolls);
  assert.throws(() => { ledger.consumeMainPoll("forward-writer", writer, true); }, /MAIN_POLL/u);
  assert.equal(ledger.status().mainPolls, MAIN_STREAM.totalPolls);
  const owner = Object.freeze({}), saved = new Ledger(); saved.bind("forward-saved-readback", owner);
  assert.throws(() => { saved.consumeMainPoll("forward-saved-readback", owner); }, /MAIN_POLL/u);
  assert.equal(saved.status().mainPolls, 0);
});

void test("renderer event count, individual frame bytes and cumulative event bytes remain independent", () => {
  const count = new Ledger(), owner = Object.freeze({}); count.bind("forward-writer", owner);
  for (let index = 0; index < STREAM.eventCount; index += 1) { count.consumeRendererEvent("forward-writer", owner, 1); }
  assert.throws(() => { count.consumeRendererEvent("forward-writer", owner, 1); }, /RENDERER_EVENT/u);
  assert.equal(count.status().rendererEvents, STREAM.eventCount);
  const bytes = new Ledger(); bytes.bind("forward-writer", owner);
  for (let used = 0; used < STREAM.eventBytes; used += STREAM.frameBytes) { bytes.consumeRendererEvent("forward-writer", owner, STREAM.frameBytes); }
  assert.throws(() => { bytes.consumeRendererEvent("forward-writer", owner, 1); }, /RENDERER_EVENT/u);
  assert.equal(bytes.status().rendererEvents, STREAM.eventBytes / STREAM.frameBytes);
  for (const size of [0, STREAM.frameBytes + 1]) {
    const frame = new Ledger(); frame.bind("forward-writer", owner);
    assert.throws(() => { frame.consumeRendererEvent("forward-writer", owner, size); }, /RENDERER_EVENT/u);
    assert.equal(frame.status().rendererEvents, 0);
  }
});

void test("every main frame counts including empty control frames and saved generations cannot receive them", () => {
  const ledger = new Ledger(), writer = Object.freeze({}); ledger.bind("forward-writer", writer);
  for (let index = 0; index < MAIN_STREAM.frames; index += 1) { ledger.consumeMainFrame("forward-writer", writer, 0); }
  assert.throws(() => { ledger.consumeMainFrame("forward-writer", writer, 0); }, /MAIN_FRAME/u);
  assert.equal(ledger.status().mainFrames, MAIN_STREAM.frames);
  const oversized = new Ledger(); oversized.bind("forward-writer", writer);
  assert.throws(() => { oversized.consumeMainFrame("forward-writer", writer, MAIN_STREAM.messageBytes + 1); }, /MAIN_FRAME/u);
  assert.equal(oversized.status().mainFrames, 0);
  const saved = new Ledger(); saved.bind("forward-saved-readback", writer);
  assert.throws(() => { saved.consumeMainFrame("forward-saved-readback", writer, 0); }, /MAIN_FRAME/u);
  assert.equal(saved.status().mainFrames, 0);
});

void test("writer controls cannot reduce the saved owner's separate cleanup reserve", () => {
  const ledger = new Ledger(), saved = Object.freeze({}), writer = Object.freeze({});
  const binding = requireOriginalForwardLedgerBinding(ledger);
  binding.bind("forward-writer", writer); binding.bind("forward-saved-readback", saved);
  const reserve = CAPACITY.controls.terminationObservationsPerGeneration + CAPACITY.controls.releaseObservationsPerGeneration +
    CAPACITY.controls.normalCloseAttemptsPerGeneration + CAPACITY.controls.abortAttemptsPerGeneration;
  for (let index = 0; index < CAPACITY.controls.perGeneration; index += 1) { binding.consumeControl("forward-writer", writer); }
  assert.equal(binding.generationStatus("forward-writer", writer).controls, CAPACITY.controls.perGeneration);
  assert.equal(binding.generationStatus("forward-saved-readback", saved).controls, 0);
  for (let index = 0; index < CAPACITY.controls.perGeneration - reserve; index += 1) { binding.consumeControl("forward-saved-readback", saved); }
  assert.equal(binding.status().controls, CAPACITY.controls.perGeneration * 2 - reserve);
  assert.equal(CAPACITY.controls.perGeneration - binding.generationStatus("forward-saved-readback", saved).controls, reserve);
  for (let index = 0; index < reserve; index += 1) { binding.consumeControl("forward-saved-readback", saved, true); }
  assert.equal(binding.generationStatus("forward-saved-readback", saved).controls, CAPACITY.controls.perGeneration);
  assert.equal(binding.status().controls, CAPACITY.controls.perGeneration * 2);
  assert.throws(() => { binding.consumeControl("forward-saved-readback", saved, true); }, /CAPACITY_CONTROL/u);
  assert.equal(binding.generationStatus("forward-writer", writer).controls, CAPACITY.controls.perGeneration);
  assert.equal(binding.generationStatus("forward-saved-readback", saved).executionAuthorized, false);
});

void test("generation snapshots retain their own requests and received bytes", () => {
  const ledger = new Ledger(), saved = Object.freeze({}), writer = Object.freeze({});
  const binding = requireOriginalForwardLedgerBinding(ledger);
  binding.bind("forward-writer", writer); binding.bind("forward-saved-readback", saved);
  binding.consumeRequest("forward-writer", writer, "renderer", 1, false);
  binding.consumeRequest("forward-writer", writer, "main", 1, false);
  binding.consumeBytes("forward-writer", writer, "renderer", 11); binding.consumeBytes("forward-writer", writer, "main", 13);
  binding.consumeBytes("forward-writer", writer, "helper-stdout", 17);
  binding.consumeRendererPoll("forward-writer", writer, "data"); binding.consumeMainPoll("forward-writer", writer);
  binding.consumeRendererEvent("forward-writer", writer, 3); binding.consumeMainFrame("forward-writer", writer, 2);
  const before = binding.generationStatus("forward-saved-readback", saved);
  assert.ok(Object.isFrozen(before)); assert.equal(before.rendererRequests, 0); assert.equal(before.rendererBytes, 0);
  binding.consumeRequest("forward-saved-readback", saved, "renderer", 1, false);
  binding.consumeBytes("forward-saved-readback", saved, "renderer", 19); binding.consumeBytes("forward-saved-readback", saved, "helper-stdout", 23);
  binding.consumeRendererPoll("forward-saved-readback", saved, "idle"); binding.consumeRendererEvent("forward-saved-readback", saved, 5);
  assert.deepEqual(binding.generationStatus("forward-writer", writer), { failed: false, rendererRequests: 1, mainRequests: 1, controls: 0,
    rendererPolls: 1, mainPolls: 1, rendererEvents: 1, mainFrames: 1, rendererBytes: 11, rendererEventBytes: 3,
    mainBytes: 13, helperStdoutBytes: 17, executionAuthorized: false });
  assert.deepEqual(binding.generationStatus("forward-saved-readback", saved), { failed: false, rendererRequests: 1, mainRequests: 0, controls: 0,
    rendererPolls: 1, mainPolls: 0, rendererEvents: 1, mainFrames: 0, rendererBytes: 19, rendererEventBytes: 5,
    mainBytes: 0, helperStdoutBytes: 23, executionAuthorized: false });
  assert.equal(before.rendererRequests, 0); assert.equal(before.rendererBytes, 0);
});

void test("generation counters reject other owners, copied and proxied references before spending", () => {
  const ledger = new Ledger(), saved = Object.freeze({}), writer = Object.freeze({});
  const binding = requireOriginalForwardLedgerBinding(ledger);
  binding.bind("forward-writer", writer); binding.bind("forward-saved-readback", saved);
  for (const original of [writer, { ...saved }, new Proxy(saved, {})]) {
    assert.throws(() => { binding.generationStatus("forward-saved-readback", original); }, /ORIGINAL_GENERATION/u);
    assert.throws(() => { binding.consumeControl("forward-saved-readback", original, true); }, /ORIGINAL_GENERATION/u);
  }
  assert.throws(() => { binding.generationStatus("forward-writer", saved); }, /ORIGINAL_GENERATION/u);
  assert.throws(() => { binding.consumeControl("forward-writer", saved, true); }, /ORIGINAL_GENERATION/u);
  assert.equal(binding.status().controls, 0); assert.equal(binding.status().failed, false);
  assert.throws(() => { requireOriginalForwardLedgerBinding(new Proxy(ledger, {})); }, /ORIGINAL_LEDGER/u);
});

void test("captured generation status rejects prototype replacement without invoking it", () => {
  const ledger = new Ledger(), writer = Object.freeze({});
  const binding = requireOriginalForwardLedgerBinding(ledger); binding.bind("forward-writer", writer);
  const descriptor = Object.getOwnPropertyDescriptor(Ledger.prototype, "generationStatus"); assert.ok(descriptor);
  let replacements = 0;
  try {
    Object.defineProperty(Ledger.prototype, "generationStatus", { ...descriptor, value: (): unknown => { replacements += 1; return {}; } });
    assert.throws(() => { binding.generationStatus("forward-writer", writer); }, /ORIGINAL_LEDGER_METHODS/u);
    assert.throws(() => { requireOriginalForwardLedgerBinding(ledger); }, /ORIGINAL_LEDGER_METHODS/u);
  } finally { Object.defineProperty(Ledger.prototype, "generationStatus", descriptor); }
  assert.equal(replacements, 0); assert.equal(binding.generationStatus("forward-writer", writer).controls, 0);
});
